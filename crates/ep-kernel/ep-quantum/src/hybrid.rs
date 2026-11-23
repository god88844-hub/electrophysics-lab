//! Hybrid classical-quantum control coupling (WP-5.5).
//!
//! The strict ep-chip RV32IM controller writes schedules into its memory
//! image and submits them through x31. The scheduler accounts for retired
//! instructions using the Bay 3 architectural timing model, advances T1/T2
//! noise through that latency, then executes the schedule. A measurement
//! projects one qubit and writes the reported bit back to x10 + qubit.
//! Microwave drive power and Layer-1 die dissipation feed the WP-5.6
//! cryostat. The ordered event stream carries measurement feedback and
//! the terminal quench, with a seeded RNG for reproducible readout.

use crate::devices::DragParams;
use crate::lindblad::{LindbladSim, Mulberry32, NoiseModel};
use crate::qasm::{
    admit_interactive, apply_cx, drag_x_amplitude, idle, measure_qubit, run_drag, Gate1Kind,
};
use ep_chip::{Cpu, CpuIsa, StepOutcome, Trace};
use ep_core::{AdmissionController, AdmissionRequest};
use ep_thermal::cryo::{
    build_quench_report, verified_cryostat, CryoCoupledSystem, DilutionCryostat,
    QuenchForensicReport, QuenchRingBuffer, QuenchSample,
};
use ep_thermal::{verified_materials, BoundaryMode, Scheme, ThermalGrid2D};
use serde::Serialize;

/// Control-image layout: schedule words live at byte offset `SCHED_BASE`
/// (entry `i` at `SCHED_BASE + 4*i`, little-endian, word-aligned).
pub const SCHED_BASE: u32 = 1024;

/// Doorbell register: the control program writes the pending schedule
/// entry count here (`addi x31, x0, N`); the runner consumes it with
/// `regs_set(31, 0)` after executing the schedule.
pub const SUBMIT_REG: usize = 31;

/// Measured-bit register base: after a mid-circuit measurement of qubit
/// `q`, the classical readout bit is written to `x{MEAS_REG_BASE + q}` so
/// the control program can branch on it (`beq x10, x0, …`).
pub const MEAS_REG_BASE: usize = 10;

/// Schedule entry op-codes (byte 1 of the schedule word).
pub const OP_H: u32 = 1;
pub const OP_X: u32 = 2;
pub const OP_RX90: u32 = 3;
pub const OP_RZ90: u32 = 4;
pub const OP_CX: u32 = 5;
pub const OP_MEASURE: u32 = 6;
pub const OP_DRAG_X: u32 = 7;

/// Hard caps — fail-closed, never unbounded.
const MAX_SCHEDULE_ENTRIES: usize = 64;
const MAX_TOTAL_CONTROL_STEPS: u64 = 100_000;
const CONTROL_MEMORY_BYTES: usize = 4096;
const MAX_CONTROL_INTERVAL_S: f64 = 1.0;
const SCHEDULE_WORD_MASK: u32 = 0x000f_fff0;

/// One decoded schedule entry.
///
/// Encoding: `(operand << 16) | (op << 8) | (qubit << 4)`. For `OP_CX` the
/// `qubit` field is the **control** qubit and the `operand` field is the
/// **target**; for 1-qubit ops `operand` is unused.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ScheduleEntry {
    pub op: u32,
    pub qubit: usize,
    pub operand: usize,
}

/// Decode a raw schedule word into a [`ScheduleEntry`].
#[must_use]
pub fn decode_entry(word: u32) -> ScheduleEntry {
    ScheduleEntry {
        qubit: ((word >> 4) & 0xf) as usize,
        op: (word >> 8) & 0xff,
        operand: ((word >> 16) & 0xf) as usize,
    }
}

/// Encode an entry without truncating fields. The runner additionally checks
/// the qubit bounds of the specific experiment.
pub fn encode_entry(entry: &ScheduleEntry) -> Result<u32, HybridError> {
    if !(OP_H..=OP_DRAG_X).contains(&entry.op)
        || entry.qubit >= 16
        || entry.operand >= 16
        || (entry.op == OP_CX && entry.qubit == entry.operand)
        || (entry.op != OP_CX && entry.operand != 0)
    {
        return Err(HybridError::ScheduleFormat(
            "entry cannot be encoded".into(),
        ));
    }
    Ok(encode_fields(entry.op, entry.qubit, entry.operand))
}

const fn encode_fields(op: u32, qubit: usize, operand: usize) -> u32 {
    (operand as u32) << 16 | op << 8 | (qubit as u32) << 4
}

/// 04-JSON-anchored calibration, parsed live from the sealed reference
/// library (fail-closed on any missing path or manifest mismatch).
#[derive(Debug, Clone, Copy)]
pub struct Calibration {
    pub t1_s: f64,
    pub t2_s: f64,
    pub readout_fidelity: f64,
    pub gate_1q_duration_ns: f64,
    pub gate_2q_duration_ns: f64,
    /// `cryo_cooling_power.stage_15mk_w` — the 15 mK cooling budget (W).
    pub stage_15mk_cooling_w: f64,
    /// `mixing_chamber_temp_mk.typical` — the operating temperature (mK).
    pub mixing_chamber_temp_mk: f64,
}

/// Load the hybrid calibration from the sealed 04 JSON.
///
/// # Errors
/// Fails closed when the manifest seal, any transmon typical, or the
/// 15 mK cooling power cannot be resolved.
pub fn calibration() -> Result<Calibration, HybridError> {
    let m = crate::devices::ModalityParams::from_verified_embedded()
        .map_err(HybridError::Calibration)?;
    let root: serde_json::Value =
        serde_json::from_str(crate::devices::embedded::MODALITIES_JSON)
            .map_err(|e| HybridError::Calibration(format!("04 JSON parse: {e}")))?;
    let read_f64 = |path: &str| -> Result<f64, HybridError> {
        root.pointer(path)
            .and_then(serde_json::Value::as_f64)
            .ok_or_else(|| HybridError::Calibration(format!("04 JSON missing numeric path {path}")))
    };
    Ok(Calibration {
        t1_s: m.transmon.t1_us_typical * 1e-6,
        t2_s: m.transmon.t2_us_typical * 1e-6,
        readout_fidelity: m.transmon.readout_fidelity_typical,
        gate_1q_duration_ns: m.transmon.gate_1q_duration_ns_typical,
        gate_2q_duration_ns: read_f64(
            "/parameters/superconducting_transmon/gate_2q_duration_ns/typical",
        )?,
        stage_15mk_cooling_w: read_f64(
            "/parameters/superconducting_transmon/cryo_cooling_power/stage_15mk_w",
        )?,
        mixing_chamber_temp_mk: read_f64(
            "/parameters/superconducting_transmon/mixing_chamber_temp_mk/typical",
        )?,
    })
}

/// Hybrid run configuration. The caller supplies the RV32IM control
/// program and the classical-machine numbers; quantum calibration is
/// always loaded from the sealed 04 JSON.
#[derive(Debug, Clone)]
pub struct HybridConfig {
    /// Classical control program (RV32IM machine words, loaded at 0).
    pub control_program: Vec<u32>,
    /// Control-chip clock (MHz) for the declared SoC cycle model.
    pub clock_mhz: f64,
    /// Seed for the kernel measurement RNG (deterministic replay).
    pub seed: u32,
    /// Mid-circuit readout fidelity override (e.g. 1.0 for algebra
    /// round-trips). `None` uses the 04-JSON typical (0.98).
    pub readout_fidelity: Option<f64>,
    /// Declared microwave drive power per active pulse line (W) — the
    /// caller's calibration; the kernel refuses to guess it.
    pub drive_power_w: f64,
    /// Qubit count (must match the control program's expectations).
    pub n_qubits: usize,
}

/// Ordered hybrid event (control → quantum → feedback, strictly interleaved).
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(tag = "type")]
pub enum HybridEvent {
    /// A control segment retired; its latency is tracked against T1/T2.
    Control {
        #[serde(rename = "latencyCycles")]
        latency_cycles: u64,
        #[serde(rename = "retiredInstructions")]
        retired_instructions: u64,
        #[serde(rename = "latencyS")]
        latency_s: f64,
    },
    /// Idle decoherence step covering the controller latency.
    Idle {
        #[serde(rename = "durationS")]
        duration_s: f64,
    },
    /// One applied schedule entry.
    Quantum {
        op: String,
        qubit: usize,
        operand: usize,
    },
    /// Mid-circuit measurement (kernel seeded readout + projection).
    Measure {
        qubit: usize,
        #[serde(rename = "sampledBit")]
        sampled_bit: u8,
        #[serde(rename = "measuredBit")]
        measured_bit: u8,
        #[serde(rename = "readoutFidelity")]
        readout_fidelity: f64,
    },
    /// Classical feedback write-back (measured bit → control register).
    Feedback {
        register: usize,
        #[serde(rename = "measuredBit")]
        measured_bit: u8,
    },
    /// Microwave duty-average and measured peak stage load at a checkpoint.
    Heat {
        #[serde(rename = "heatLoadW")]
        heat_load_w: f64,
        #[serde(rename = "budgetW")]
        budget_w: f64,
        #[serde(rename = "peakStageLoadW")]
        peak_stage_load_w: f64,
        #[serde(rename = "stageTempK")]
        stage_temp_k: f64,
        #[serde(rename = "diePeakK")]
        die_peak_k: f64,
    },
    /// Quench trip recorded immediately before the run fails (never a
    /// silent continue — the error carries the same numbers).
    Quench {
        #[serde(rename = "heatLoadW")]
        heat_load_w: f64,
        #[serde(rename = "budgetW")]
        budget_w: f64,
        #[serde(rename = "stageTempK")]
        stage_temp_k: f64,
        /// Zero coherence after the terminal dephasing channel.
        coherence: f64,
    },
}

/// Whole-hybrid-run report. Badged `SIMULATED_NOISY_QUANTUM`.
#[derive(Debug, Clone, Serialize)]
pub struct HybridReport {
    pub events: Vec<HybridEvent>,
    /// Last classical readout bit per qubit (`None` = never measured).
    #[serde(rename = "classicalBits")]
    pub classical_bits: Vec<Option<u8>>,
    #[serde(rename = "totalMeasurements")]
    pub total_measurements: usize,
    #[serde(rename = "schedulesExecuted")]
    pub schedules_executed: usize,
    #[serde(rename = "controlLatencyCycles")]
    pub control_latency_cycles: u64,
    #[serde(rename = "retiredInstructions")]
    pub retired_instructions: u64,
    #[serde(rename = "controlLatencyS")]
    pub control_latency_s: f64,
    /// Duty-averaged microwave power over the whole run window (W).
    #[serde(rename = "heatLoadW")]
    pub heat_load_w: f64,
    /// The 15 mK cooling budget the load was checked against (W).
    #[serde(rename = "heatBudgetW")]
    pub heat_budget_w: f64,
    #[serde(rename = "stageTempK")]
    pub stage_temp_k: f64,
    #[serde(rename = "peakStageLoadW")]
    pub peak_stage_load_w: f64,
    /// Final per-qubit Bloch vectors `⟨σx⟩,⟨σy⟩,⟨σz⟩` (Lindblad state).
    #[serde(rename = "blochVectors")]
    pub bloch_vectors: Vec<[f64; 3]>,
    /// Final density-matrix purity (noisy runs decay below 1).
    pub purity: f64,
    /// Honesty badge: `SIMULATED_NOISY_QUANTUM`.
    pub badge: &'static str,
}

/// Hybrid-loop failure — fail-closed, no partial runs.
#[derive(Debug, Clone, PartialEq)]
pub enum HybridError {
    /// Calibration could not be loaded from the sealed 04 JSON.
    Calibration(String),
    /// Control program failed to load or trapped unexpectedly.
    ControlProgram(String),
    /// The control program halted without ever ringing the doorbell.
    NoSchedule,
    /// The control program exceeded the step budget without finishing.
    ControlExhausted { max_steps: u64 },
    /// A schedule entry addressed a qubit outside the admitted register.
    ScheduleQubit {
        index: usize,
        qubit: usize,
        n_qubits: usize,
    },
    /// Unknown schedule op-code (byte 1 of the schedule word).
    ScheduleOp { index: usize, op: u32 },
    /// The mailbox submission violates its word or freshness contract.
    ScheduleFormat(String),
    /// Layer-1 solver configuration or integration failed.
    Thermal(String),
    /// A quench stops execution and retains the ordered event stream.
    Quench {
        heat_load_w: f64,
        budget_w: f64,
        events: Vec<HybridEvent>,
        forensic: Box<QuenchForensicReport>,
    },
    /// ep-core interactive admission refused (`n > 6`).
    Admission(String),
}

impl std::fmt::Display for HybridError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Calibration(e) => write!(f, "hybrid: calibration — {e}"),
            Self::ControlProgram(e) => write!(f, "hybrid: control program — {e}"),
            Self::NoSchedule => write!(
                f,
                "hybrid: control program halted without submitting a pulse schedule"
            ),
            Self::ControlExhausted { max_steps } => {
                write!(f, "hybrid: control program exceeded the {max_steps}-step budget")
            }
            Self::ScheduleQubit { index, qubit, n_qubits } => write!(
                f,
                "hybrid: schedule entry {index} addresses qubit {qubit} outside the {n_qubits}-qubit register"
            ),
            Self::ScheduleOp { index, op } => {
                write!(f, "hybrid: schedule entry {index} has unknown op code {op}")
            }
            Self::ScheduleFormat(message) => write!(f, "hybrid: invalid schedule: {message}"),
            Self::Thermal(message) => write!(f, "hybrid: thermal model: {message}"),
            Self::Quench { heat_load_w, budget_w, .. } => write!(
                f,
                "hybrid: quench — stage heat load {heat_load_w:.6} W exceeded the 15 mK cooling budget {budget_w:.6} W"
            ),
            Self::Admission(r) => write!(f, "hybrid: {r}"),
        }
    }
}

impl std::error::Error for HybridError {}

/// Run the hybrid loop with the WP-5.6 representative silicon die geometry.
/// For a Layer-1 simulation supplying its own power map, use
/// [`run_hybrid_with_grid`].
pub fn run_hybrid(
    config: &HybridConfig,
    controller: &AdmissionController,
) -> Result<HybridReport, HybridError> {
    run(config, controller, None)
}

/// Run with an admitted Layer-1 die and its existing dissipated power map.
/// The thermal solver feeds this power into the stage on each time step.
pub fn run_hybrid_with_grid(
    config: &HybridConfig,
    controller: &AdmissionController,
    grid: ThermalGrid2D,
) -> Result<HybridReport, HybridError> {
    run(config, controller, Some(grid))
}

fn run(
    config: &HybridConfig,
    controller: &AdmissionController,
    grid: Option<ThermalGrid2D>,
) -> Result<HybridReport, HybridError> {
    admit_interactive(config.n_qubits, controller).map_err(HybridError::Admission)?;
    let cal = calibration()?;
    let clock_hz = config.clock_mhz * 1e6;
    if !clock_hz.is_finite() || clock_hz <= 0.0 {
        return Err(HybridError::ControlProgram(
            "clock_mhz must convert to a finite positive clock rate".into(),
        ));
    }
    if !config.drive_power_w.is_finite() || config.drive_power_w < 0.0 {
        return Err(HybridError::ControlProgram(
            "drive_power_w must be finite and nonnegative".into(),
        ));
    }
    let fidelity = config.readout_fidelity.unwrap_or(cal.readout_fidelity);
    if !(0.0..=1.0).contains(&fidelity) {
        return Err(HybridError::ControlProgram(format!(
            "readout_fidelity {fidelity} outside [0, 1]"
        )));
    }
    if config.control_program.len() > SCHED_BASE as usize / 4 {
        return Err(HybridError::ControlProgram(
            "control image overlaps schedule memory".into(),
        ));
    }

    let mut cpu = Cpu::new(
        &config.control_program,
        CONTROL_MEMORY_BYTES,
        0,
        0,
        0,
        CpuIsa::Rv32im,
    )
    .map_err(|e| HybridError::ControlProgram(e.to_string()))?;
    let n = config.n_qubits;
    let noise = NoiseModel::uniform(n, cal.t1_s, cal.t2_s);
    let mut sim = LindbladSim::new_interactive(n, noise, controller)
        .map_err(|d| HybridError::Admission(d.reason))?;
    let mut rng = Mulberry32::new(config.seed);
    let mut thermal = ThermalRun::new(&cal, controller, grid)?;
    let mut events = Vec::new();
    let mut classical_bits = vec![None; n];
    let mut total_measurements = 0usize;
    let mut schedules_executed = 0usize;
    let mut total_latency_cycles = 0u64;
    let mut control_steps = 0u64;
    let mut written = [false; MAX_SCHEDULE_ENTRIES];

    loop {
        let retired_before = cpu.retired();
        let mut latency_cycles = 0;
        let pending = loop {
            if control_steps >= MAX_TOTAL_CONTROL_STEPS {
                return Err(HybridError::ControlExhausted {
                    max_steps: MAX_TOTAL_CONTROL_STEPS,
                });
            }
            if cpu.pc() as usize / 4 >= config.control_program.len() {
                return Err(HybridError::ControlProgram(format!(
                    "PC {:#x} left the program image",
                    cpu.pc()
                )));
            }
            let outcome = cpu
                .step()
                .map_err(|e| HybridError::ControlProgram(e.to_string()))?;
            control_steps += 1;
            match outcome {
                StepOutcome::Stopped(trap) if trap.cause == "ebreak" => break 0,
                StepOutcome::Stopped(trap) => {
                    return Err(HybridError::ControlProgram(format!(
                        "unexpected trap at pc {:#x}: {} ({})",
                        trap.pc, trap.cause, trap.detail
                    )))
                }
                StepOutcome::Retired(trace) => {
                    let regs = cpu.regs_u32();
                    latency_cycles += soc_cycles(&trace, &regs);
                    track_schedule_store(trace.word, &regs, &mut written)?;
                    if regs[SUBMIT_REG] != 0 {
                        break regs[SUBMIT_REG] as usize;
                    }
                }
            }
        };

        if latency_cycles > 0 {
            let latency_s = latency_cycles as f64 / clock_hz;
            if !(0.0..=MAX_CONTROL_INTERVAL_S).contains(&latency_s) {
                return Err(HybridError::ControlProgram(
                    "a control segment exceeds one simulated second".into(),
                ));
            }
            total_latency_cycles += latency_cycles;
            events.push(HybridEvent::Control {
                latency_cycles,
                latency_s,
                retired_instructions: cpu.retired() - retired_before,
            });
            thermal.advance(latency_s, 0.0, &mut sim, n, &mut events)?;
            idle(&mut sim.rho, n, latency_s, cal.t1_s, cal.t2_s);
            events.push(HybridEvent::Idle {
                duration_s: latency_s,
            });
        }

        if pending == 0 {
            if schedules_executed == 0 {
                return Err(HybridError::NoSchedule);
            }
            break;
        }

        let schedule = submitted_schedule(&cpu, pending, &written, n)?;
        for entry in schedule {
            if entry.op == OP_MEASURE {
                let (sampled_bit, bit) =
                    measure_qubit(&mut sim.rho, entry.qubit, &mut rng, fidelity);
                total_measurements += 1;
                classical_bits[entry.qubit] = Some(bit);
                events.push(HybridEvent::Measure {
                    qubit: entry.qubit,
                    sampled_bit,
                    measured_bit: bit,
                    readout_fidelity: fidelity,
                });
                let register = MEAS_REG_BASE + entry.qubit;
                cpu.regs_set(register, i32::from(bit));
                events.push(HybridEvent::Feedback {
                    register,
                    measured_bit: bit,
                });
                continue;
            }
            let duration_s = match entry.op {
                OP_CX => cal.gate_2q_duration_ns * 1e-9,
                OP_RZ90 => 0.0, // virtual frame rotation
                _ => cal.gate_1q_duration_ns * 1e-9,
            };
            if duration_s > 0.0 {
                thermal.advance(duration_s, config.drive_power_w, &mut sim, n, &mut events)?;
            }
            apply_entry(&mut sim, &entry, &cal);
            if duration_s > 0.0 && entry.op != OP_DRAG_X {
                idle(&mut sim.rho, n, duration_s, cal.t1_s, cal.t2_s);
            }
            events.push(HybridEvent::Quantum {
                op: op_name(entry.op).into(),
                qubit: entry.qubit,
                operand: entry.operand,
            });
        }
        schedules_executed += 1;
        cpu.regs_set(SUBMIT_REG, 0);
        written.fill(false);
        events.push(thermal.checkpoint());
    }

    let bloch_vectors = (0..n)
        .map(|q| {
            let (x, y, z) = sim.rho.bloch_vector(q);
            [x, y, z]
        })
        .collect();
    Ok(HybridReport {
        purity: sim.rho.purity(),
        bloch_vectors,
        events,
        classical_bits,
        total_measurements,
        schedules_executed,
        control_latency_cycles: total_latency_cycles,
        retired_instructions: cpu.retired(),
        control_latency_s: total_latency_cycles as f64 / clock_hz,
        heat_load_w: thermal.duty_average(),
        heat_budget_w: thermal.budget_w,
        peak_stage_load_w: thermal.peak_load_w,
        stage_temp_k: thermal.system.stage_temp_k(),
        badge: "SIMULATED_NOISY_QUANTUM",
    })
}

/// Apply the declared ep-chip TwinCpu timing to strict RV32IM retirement
/// telemetry: ALU 1, memory and jumps 2, conditional branch 1 + taken penalty.
fn soc_cycles(trace: &Trace, regs: &[u32]) -> u64 {
    let fields = ep_chip::isa::decode(trace.word);
    match fields.opcode {
        0x03 | 0x23 | 0x67 | 0x6f => 2,
        0x63 => {
            let a = regs[fields.rs1];
            let b = regs[fields.rs2];
            let taken = match fields.f3 {
                0 => a == b,
                1 => a != b,
                4 => (a as i32) < (b as i32),
                5 => (a as i32) >= (b as i32),
                6 => a < b,
                7 => a >= b,
                _ => unreachable!("strict CPU validated the branch"),
            };
            1 + u64::from(taken)
        }
        _ => 1,
    }
}

fn track_schedule_store(
    word: u32,
    regs: &[u32],
    written: &mut [bool; MAX_SCHEDULE_ENTRIES],
) -> Result<(), HybridError> {
    let fields = ep_chip::isa::decode(word);
    if fields.opcode == 0x23 {
        let address = regs[fields.rs1].wrapping_add(fields.imm_s as u32);
        if let Some(offset) = address.checked_sub(SCHED_BASE) {
            if let Some(slot) = written.get_mut(offset as usize / 4) {
                if fields.f3 != 2 {
                    return Err(HybridError::ScheduleFormat(
                        "mailbox entries must be stored as whole words".into(),
                    ));
                }
                *slot = true;
            }
        }
    }
    Ok(())
}

fn submitted_schedule(
    cpu: &Cpu,
    count: usize,
    written: &[bool],
    n: usize,
) -> Result<Vec<ScheduleEntry>, HybridError> {
    if count > MAX_SCHEDULE_ENTRIES {
        return Err(HybridError::ScheduleFormat(format!(
            "doorbell requests {count} entries, limit {MAX_SCHEDULE_ENTRIES}"
        )));
    }
    written
        .iter()
        .take(count)
        .enumerate()
        .map(|(index, fresh)| {
            let word = cpu.mem_word(SCHED_BASE as usize + index * 4);
            let entry = decode_entry(word);
            if !fresh || word & !SCHEDULE_WORD_MASK != 0 {
                return Err(HybridError::ScheduleFormat(format!(
                    "entry {index} was unwritten or has nonzero reserved bits"
                )));
            }
            if !(OP_H..=OP_DRAG_X).contains(&entry.op) {
                return Err(HybridError::ScheduleOp {
                    index,
                    op: entry.op,
                });
            }
            for qubit in [entry.qubit, entry.operand] {
                if qubit >= n {
                    return Err(HybridError::ScheduleQubit {
                        index,
                        qubit,
                        n_qubits: n,
                    });
                }
            }
            if (entry.op == OP_CX && entry.qubit == entry.operand)
                || (entry.op != OP_CX && entry.operand != 0)
            {
                return Err(HybridError::ScheduleFormat(format!(
                    "invalid operand in entry {index}"
                )));
            }
            Ok(entry)
        })
        .collect()
}

struct ThermalRun {
    system: CryoCoupledSystem,
    ring: QuenchRingBuffer,
    budget_w: f64,
    elapsed_s: f64,
    microwave_j: f64,
    peak_load_w: f64,
    die_peak_k: f64,
}

impl ThermalRun {
    fn new(
        cal: &Calibration,
        controller: &AdmissionController,
        grid: Option<ThermalGrid2D>,
    ) -> Result<Self, HybridError> {
        let spec = verified_cryostat().map_err(HybridError::Thermal)?;
        if spec.quench_threshold_w != cal.stage_15mk_cooling_w
            || spec.stage_15mk_w != cal.stage_15mk_cooling_w
        {
            return Err(HybridError::Calibration(
                "sealed 04 and 06 cooling budgets differ".into(),
            ));
        }
        let temperature = cal.mixing_chamber_temp_mk * 1e-3;
        let cryo = DilutionCryostat::new(
            spec,
            DilutionCryostat::C_TH_DEFAULT,
            temperature,
            temperature,
        )
        .map_err(HybridError::Thermal)?;
        let grid = match grid {
            Some(grid) => grid,
            None => {
                let silicon = verified_materials().map_err(HybridError::Thermal)?.silicon;
                // Representative die geometry from the WP-5.6 layer-coupling oracle.
                ThermalGrid2D::new(
                    8,
                    8,
                    100e-6,
                    500e-6,
                    silicon.rho_c(),
                    silicon.k_w_mk,
                    temperature,
                    0.0,
                    BoundaryMode::DirichletAmbient,
                    Scheme::BackwardEuler,
                    controller,
                )
                .map_err(|error| HybridError::Admission(error.reason))?
            }
        };
        let decision = controller.admit(&AdmissionRequest::ThermalGrid {
            rows: grid.ny,
            cols: grid.nx,
        });
        if !decision.admitted {
            return Err(HybridError::Admission(decision.reason));
        }
        if grid.temp.len() != grid.nx * grid.ny
            || grid.temp.iter().any(|t| !t.is_finite() || *t <= 0.0)
            || [grid.dx_m, grid.thickness_m, grid.rho_c, grid.k]
                .iter()
                .any(|v| !v.is_finite() || *v <= 0.0)
            || grid.boundary != BoundaryMode::DirichletAmbient
            || grid.joule.is_some()
        {
            return Err(HybridError::Thermal("Layer-1 grid needs a Dirichlet stage boundary, finite positive geometry/materials/temperatures, and direct per-cell power".into()));
        }
        if let Some(power) = &grid.power_w {
            if power.len() != grid.temp.len()
                || power.iter().any(|w| !w.is_finite() || *w < 0.0)
                || !power.iter().sum::<f64>().is_finite()
            {
                return Err(HybridError::Thermal(
                    "invalid Layer-1 die dissipation map".into(),
                ));
            }
        }
        Ok(Self {
            system: CryoCoupledSystem::new(cryo, grid, 0.0).map_err(HybridError::Thermal)?,
            ring: QuenchRingBuffer::new(64).map_err(HybridError::Thermal)?,
            budget_w: cal.stage_15mk_cooling_w,
            elapsed_s: 0.0,
            microwave_j: 0.0,
            peak_load_w: 0.0,
            die_peak_k: temperature,
        })
    }

    fn advance(
        &mut self,
        duration: f64,
        power_w: f64,
        sim: &mut LindbladSim,
        n: usize,
        events: &mut Vec<HybridEvent>,
    ) -> Result<(), HybridError> {
        self.system
            .set_base_load(power_w)
            .map_err(HybridError::Thermal)?;
        if !(power_w + self.system.grid_dissipation_w()).is_finite() {
            return Err(HybridError::Thermal("total stage load overflow".into()));
        }
        let step = self.system.step(duration);
        self.elapsed_s += duration;
        self.microwave_j += power_w * duration;
        self.peak_load_w = self.peak_load_w.max(step.load_w);
        self.die_peak_k = self.die_peak_k.max(step.grid_max_k);
        if !step.stage.temp_k.is_finite() || !step.grid_max_k.is_finite() {
            return Err(HybridError::Thermal(
                "nonfinite stage or die temperature".into(),
            ));
        }
        self.ring.push(QuenchSample {
            t_s: self.elapsed_s,
            stage_temp_k: step.stage.temp_k,
            load_w: step.load_w,
            q_cool_w: self.system.cryo().cooling_power_w(step.stage.temp_k),
        });
        if step.quench || step.collapsed {
            for q in 0..n {
                sim.rho.pure_dephasing(q, 0.5);
            }
            events.push(HybridEvent::Quench {
                heat_load_w: step.load_w,
                budget_w: self.budget_w,
                stage_temp_k: step.stage.temp_k,
                coherence: 0.0,
            });
            let forensic = build_quench_report(
                step.load_w,
                &self.ring.window(),
                self.system.cryo().spec(),
                self.elapsed_s,
            )
            .map_err(HybridError::Thermal)?;
            return Err(HybridError::Quench {
                heat_load_w: step.load_w,
                budget_w: self.budget_w,
                events: std::mem::take(events),
                forensic: Box::new(forensic),
            });
        }
        Ok(())
    }

    fn duty_average(&self) -> f64 {
        if self.elapsed_s > 0.0 {
            self.microwave_j / self.elapsed_s
        } else {
            0.0
        }
    }

    fn checkpoint(&self) -> HybridEvent {
        HybridEvent::Heat {
            heat_load_w: self.duty_average(),
            budget_w: self.budget_w,
            peak_stage_load_w: self.peak_load_w,
            stage_temp_k: self.system.stage_temp_k(),
            die_peak_k: self.die_peak_k,
        }
    }
}

fn op_name(op: u32) -> &'static str {
    match op {
        OP_H => "h",
        OP_X => "x",
        OP_RX90 => "rx90",
        OP_RZ90 => "rz90",
        OP_CX => "cx",
        OP_DRAG_X => "drag_x",
        _ => "?",
    }
}

fn apply_entry(sim: &mut LindbladSim, entry: &ScheduleEntry, cal: &Calibration) {
    let quarter_turn = std::f64::consts::FRAC_PI_2;
    let q = entry.qubit;
    let gate = match entry.op {
        OP_H => Gate1Kind::H,
        OP_X => Gate1Kind::X,
        OP_RX90 => Gate1Kind::Rx,
        OP_RZ90 => Gate1Kind::Rz,
        OP_CX => {
            apply_cx(&mut sim.rho, q, entry.operand);
            return;
        }
        OP_DRAG_X => {
            let mut params = DragParams {
                amplitude_mhz: 0.0,
                sigma_ns: cal.gate_1q_duration_ns / 3.0,
                duration_ns: cal.gate_1q_duration_ns,
                beta: 0.0,
                detune_mhz: 0.0,
            };
            params.amplitude_mhz = drag_x_amplitude(&params);
            run_drag(sim, q, &params);
            return;
        }
        _ => unreachable!("schedule was validated before execution"),
    };
    sim.rho.apply_op1(q, gate.op2(quarter_turn));
}

// ---------------------------------------------------------------------------
// RV32IM hand-assembler for the Layer 3–4 control programs.
// ---------------------------------------------------------------------------

/// `addi rd, rs1, imm` (I-type).
#[must_use]
pub fn asm_addi(rd: usize, rs1: usize, imm: i32) -> u32 {
    let imm = (imm & 0xfff) as u32;
    (imm << 20) | ((rs1 as u32) << 15) | ((rd as u32) << 7) | 0x13
}

/// `lui rd, imm20` (U-type).
#[must_use]
pub fn asm_lui(rd: usize, imm20: u32) -> u32 {
    ((imm20 & 0xfffff) << 12) | ((rd as u32) << 7) | 0x37
}

/// `sw rs2, offset(rs1)` (S-type, funct3=010).
#[must_use]
pub fn asm_sw(rs2: usize, offset: i32, rs1: usize) -> u32 {
    let off = (offset & 0xfff) as u32;
    ((off >> 5) << 25)
        | ((rs2 as u32) << 20)
        | ((rs1 as u32) << 15)
        | (2 << 12)
        | ((off & 0x1f) << 7)
        | 0x23
}

/// `beq rs1, rs2, byte_offset` (B-type) — `byte_offset` relative to the
/// branch instruction's own address.
#[must_use]
pub fn asm_beq(rs1: usize, rs2: usize, byte_offset: i32) -> u32 {
    let imm = (byte_offset & 0x1fff) as u32;
    let b12 = (imm >> 12) & 1;
    let b11 = (imm >> 11) & 1;
    let b10_5 = (imm >> 5) & 0x3f;
    let b4_1 = (imm >> 1) & 0xf;
    (b12 << 31)
        | (b10_5 << 25)
        | ((rs2 as u32) << 20)
        | ((rs1 as u32) << 15)
        | (b4_1 << 8)
        | (b11 << 7)
        | 0x63
}

/// `jal rd, byte_offset` (J-type).
#[must_use]
pub fn asm_jal(rd: usize, byte_offset: i32) -> u32 {
    let imm = (byte_offset & 0x1f_ffff) as u32;
    let b20 = (imm >> 20) & 1;
    let b10_1 = (imm >> 1) & 0x3ff;
    let b11 = (imm >> 11) & 1;
    let b19_12 = (imm >> 12) & 0xff;
    (b20 << 31) | (b10_1 << 21) | (b11 << 20) | (b19_12 << 12) | ((rd as u32) << 7) | 0x6f
}

/// EBREAK — the ep-chip HALT/stop convention (`ok: true`).
pub const ASM_EBREAK: u32 = 0x0010_0073;

/// `li rd, value` — `addi` when the constant fits the 12-bit signed
/// immediate, otherwise the canonical `lui`+`addi` expansion.
#[must_use]
pub fn asm_li(rd: usize, value: u32) -> Vec<u32> {
    let v = value as i32;
    if (-2048..=2047).contains(&v) {
        vec![asm_addi(rd, 0, v)]
    } else {
        let hi = ((i64::from(v) + 0x800) >> 12) as i32;
        let low = v - (hi << 12);
        vec![asm_lui(rd, (hi as u32) & 0xfffff), asm_addi(rd, rd, low)]
    }
}

// ---------------------------------------------------------------------------
// Canned Layer 3–4 control programs (used by the tests and the IDE).
// ---------------------------------------------------------------------------

/// Bell-state control program: schedule `[H q0, CX q0→q1]`, doorbell = 2,
/// EBREAK. Real RV32IM machine code — builds the schedule with `li`/`sw`.
#[must_use]
pub fn bell_control_program() -> Vec<u32> {
    let mut p = Vec::new();
    p.extend(asm_li(4, SCHED_BASE)); // x4 = schedule pointer
    p.extend(asm_li(5, encode_fields(OP_H, 0, 0)));
    p.push(asm_sw(5, 0, 4));
    p.extend(asm_li(6, encode_fields(OP_CX, 0, 1)));
    p.push(asm_sw(6, 4, 4));
    p.push(asm_addi(SUBMIT_REG, 0, 2)); // doorbell: 2 entries
    p.push(ASM_EBREAK);
    p
}

/// GHZ control program for `n` qubits (1..=6): schedule
/// `[H q0, CX q0→q1, CX q1→q2, …, CX q(n-2)→q(n-1)]`, doorbell = n, EBREAK.
///
/// # Errors
/// `n` outside 1..=6 is rejected (admission contract).
pub fn ghz_control_program(n: usize) -> Result<Vec<u32>, HybridError> {
    admit_interactive(n, &AdmissionController::new()).map_err(HybridError::Admission)?;
    let mut p = Vec::new();
    p.extend(asm_li(4, SCHED_BASE));
    p.extend(asm_li(5, encode_fields(OP_H, 0, 0)));
    p.push(asm_sw(5, 0, 4));
    let mut slot = 1usize;
    for c in 0..n.saturating_sub(1) {
        p.extend(asm_li(6, encode_fields(OP_CX, c, c + 1)));
        p.push(asm_sw(6, (slot * 4) as i32, 4));
        slot += 1;
    }
    p.push(asm_addi(
        SUBMIT_REG,
        0,
        i32::try_from(slot).unwrap_or(i32::MAX),
    ));
    p.push(ASM_EBREAK);
    Ok(p)
}

/// Conditional bit-flip feedback program (3 segments):
/// 1. schedule `[H q0, CX q0→q1]` — Bell-pair preparation,
/// 2. schedule `[MEASURE q0]` — mid-circuit readout, bit written to `x10`,
/// 3. branch on `x10` — bit 1 ⇒ schedule `[X q1]` (conditional bit flip),
///    bit 0 ⇒ schedule `[H q1]` — then EBREAK.
#[must_use]
pub fn feedback_control_program() -> Vec<u32> {
    // Layout (word index → pc):
    //    0     li   x4, SCHED_BASE
    //    1..5  build [H q0, CX q0→q1]
    //    6     addi x31, x0, 2           (submit segment 1)
    //    7..8  build [MEASURE q0]
    //    9     addi x31, x0, 1           (submit segment 2 → x10 = readout bit)
    //   10     beq  x10, x0, +20         → word 15 (else path)
    //   11..13 build [X q1], doorbell=1  (then path: conditional bit flip)
    //   14     jal  x0, +20              → word 19 (halt)
    //   15..17 build [H q1], doorbell=1  (else path)
    //   18     ebreak (else-path halt)
    //   19     ebreak (then-path halt)
    let h_q0 = encode_fields(OP_H, 0, 0);
    let cx_01 = encode_fields(OP_CX, 0, 1);
    let meas = encode_fields(OP_MEASURE, 0, 0);
    let x_q1 = encode_fields(OP_X, 1, 0);
    let h_q1 = encode_fields(OP_H, 1, 0);
    let mut p = Vec::new();
    p.extend(asm_li(4, SCHED_BASE)); // 0
    p.extend(asm_li(5, h_q0)); // 1
    p.push(asm_sw(5, 0, 4)); // 2
    p.extend(asm_li(6, cx_01)); // 3 (2 words: lui+addi)
    p.push(asm_sw(6, 4, 4)); // 5
    p.push(asm_addi(SUBMIT_REG, 0, 2)); // 6
    p.extend(asm_li(5, meas)); // 7
    p.push(asm_sw(5, 0, 4)); // 8
    p.push(asm_addi(SUBMIT_REG, 0, 1)); // 9
    p.push(asm_beq(MEAS_REG_BASE, 0, 20)); // 10 → word 15
    p.extend(asm_li(5, x_q1)); // 11
    p.push(asm_sw(5, 0, 4)); // 12
    p.push(asm_addi(SUBMIT_REG, 0, 1)); // 13
    p.push(asm_jal(0, 20)); // 14 → word 19
    p.extend(asm_li(5, h_q1)); // 15
    p.push(asm_sw(5, 0, 4)); // 16
    p.push(asm_addi(SUBMIT_REG, 0, 1)); // 17
    p.push(ASM_EBREAK); // 18
    p.push(ASM_EBREAK); // 19
    p
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn asm_li_fits_addi_for_small_values() {
        assert_eq!(asm_li(5, 256), vec![asm_addi(5, 0, 256)]);
    }

    #[test]
    fn asm_li_expands_large_values_via_lui() {
        // 0x10500 → lui x6, 16; addi x6, x6, 1280
        assert_eq!(
            asm_li(6, 0x1_0500),
            vec![asm_lui(6, 0x10), asm_addi(6, 6, 0x500)]
        );
    }

    #[test]
    fn encode_decode_round_trip() {
        let e = ScheduleEntry {
            op: OP_CX,
            qubit: 2,
            operand: 5,
        };
        assert_eq!(decode_entry(encode_entry(&e).expect("encodable entry")), e);
    }
}
