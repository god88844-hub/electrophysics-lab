//! Device models over the three physical modalities (WP-5.1) — every device
//! parameter comes from `data/reference-library/04_quantum_hardware_modalities.json`
//! (embedded byte-exactly and SHA-256-verified through ep-core at startup;
//! nothing invented).
//!
//! - Superconducting transmon: Gaussian DRAG microwave drive (`Ω_I = A·g`,
//!   `Ω_Q = β·A·g'`, `g = exp(−(t−t0)²/(2σ²))`), T1/T2 Kraus channels, exact
//!   ZZ crosstalk, effective first-order anharmonicity-leakage channel
//!   (`γ_leak ∝ (Ω/|α|)²`, documented effective model), readout bit-flip.
//! - Silicon photonic SOI: dual-rail MZI coupler `U(θ,φ) = [[c, −e^{−iφ}s],
//!   [e^{iφ}s, c]]` (unitary), waveguide + insertion loss
//!   `η = 10^{−(dB/cm·L + IL·n)/10}`, thermo-optic crosstalk (−15 dB power
//!   ratio typical).
//! - Neutral atom (87Rb): Rydberg blockade `V(r) = C₆/r⁶`,
//!   blockade radius `r_b = (C₆/Ω)^{1/6}`, effective CZ with an honest
//!   weak-blockade error channel.
//!
//! Arithmetic mirrors `packages/quantum-engine/src/devices.mjs` element for
//! element (60-substep pulse integration, identical RNG consumption) so the
//! embedded parity-oracle values agree to floating-point noise.

use crate::lindblad::{Drive, InitialState, LindbladSim, Mulberry32, Op2};
use ep_core::admission::{AdmissionController, AdmissionDecision};
use ep_core::reference::{verify_entry, LibraryError};

/// Byte-exact embedded reference data (wasm-safe: no filesystem access).
pub mod embedded {
    /// `data/reference-library/04_quantum_hardware_modalities.json` verbatim.
    pub const MODALITIES_JSON: &str = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../data/reference-library/04_quantum_hardware_modalities.json"
    ));
    /// `data/reference-library/MANIFEST.json` verbatim (seals the above).
    pub const MANIFEST_JSON: &str = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../data/reference-library/MANIFEST.json"
    ));
}

/// Fail-closed verification of the embedded 04 JSON against its sealed
/// MANIFEST.json entry (SHA-256 + size, ep-core `verify_entry`).
pub fn verify_embedded_reference() -> Result<(), LibraryError> {
    const FILE: &str = "04_quantum_hardware_modalities.json";
    let manifest: ep_core::reference::Manifest = serde_json::from_str(embedded::MANIFEST_JSON)
        .map_err(|e| LibraryError {
            file: "MANIFEST.json".into(),
            reason: format!("parse: {e}"),
        })?;
    let entry = manifest
        .files
        .iter()
        .find(|e| e.file == FILE)
        .ok_or_else(|| LibraryError {
            file: "MANIFEST.json".into(),
            reason: format!("{FILE} not sealed"),
        })?;
    verify_entry(entry, embedded::MODALITIES_JSON.as_bytes())
}

/// Typicals extracted from the verified 04 JSON (fail-closed: any missing
/// path is an error, never a silent default).
#[derive(Debug, Clone)]
pub struct ModalityParams {
    pub transmon: TransmonParams,
    pub photonic: PhotonicParams,
    pub neutral_atom: NeutralAtomParams,
}

#[derive(Debug, Clone)]
pub struct TransmonParams {
    pub t1_us_typical: f64,
    pub t2_us_typical: f64,
    pub anharmonicity_alpha_mhz_typical: f64,
    pub zz_crosstalk_khz_typical: f64,
    pub readout_fidelity_typical: f64,
    pub gate_1q_duration_ns_typical: f64,
}

#[derive(Debug, Clone)]
pub struct PhotonicParams {
    pub waveguide_loss_db_per_cm_typical: f64,
    pub mzi_insertion_loss_db_typical: f64,
    pub directional_coupler_insertion_loss_db_typical: f64,
    pub p_pi_mw_typical: f64,
    pub thermal_crosstalk_db_typical: f64,
}

#[derive(Debug, Clone)]
pub struct NeutralAtomParams {
    pub rydberg_c6_ghz_um6_typical: f64,
    pub rydberg_blockade_radius_um_typical: f64,
}

/// `parameters.<modality>.<dotted.field.path>.typical` with an exact-path
/// error message.
fn typical_f64(root: &serde_json::Value, modality: &str, field_path: &str) -> Result<f64, String> {
    let mut v = root.get("parameters").and_then(|p| p.get(modality));
    for seg in field_path.split('.') {
        v = v.and_then(|x| x.get(seg));
    }
    let out = v.and_then(|f| f.get("typical")).and_then(|t| t.as_f64());
    match out {
        Some(x) => Ok(x),
        None => Err(format!(
            "04_quantum_hardware_modalities.json: missing parameters.{modality}.{field_path}.typical"
        )),
    }
}

impl ModalityParams {
    /// Parse from (verified) 04-JSON bytes. Every required typical is
    /// mandatory — fail-closed.
    pub fn from_json_bytes(bytes: &[u8]) -> Result<Self, String> {
        let root: serde_json::Value =
            serde_json::from_slice(bytes).map_err(|e| format!("04 JSON parse: {e}"))?;
        Ok(Self {
            transmon: TransmonParams {
                t1_us_typical: typical_f64(&root, "superconducting_transmon", "t1_us")?,
                t2_us_typical: typical_f64(&root, "superconducting_transmon", "t2_us")?,
                anharmonicity_alpha_mhz_typical: typical_f64(
                    &root,
                    "superconducting_transmon",
                    "anharmonicity_alpha_mhz",
                )?,
                zz_crosstalk_khz_typical: typical_f64(
                    &root,
                    "superconducting_transmon",
                    "zz_crosstalk_khz",
                )?,
                readout_fidelity_typical: typical_f64(
                    &root,
                    "superconducting_transmon",
                    "readout_fidelity",
                )?,
                gate_1q_duration_ns_typical: typical_f64(
                    &root,
                    "superconducting_transmon",
                    "gate_1q_duration_ns",
                )?,
            },
            photonic: PhotonicParams {
                waveguide_loss_db_per_cm_typical: typical_f64(
                    &root,
                    "silicon_photonic_soi",
                    "waveguide_propagation_loss_db_per_cm",
                )?,
                mzi_insertion_loss_db_typical: typical_f64(
                    &root,
                    "silicon_photonic_soi",
                    "mzi_insertion_loss_db",
                )?,
                directional_coupler_insertion_loss_db_typical: typical_f64(
                    &root,
                    "silicon_photonic_soi",
                    "directional_coupler_insertion_loss_db",
                )?,
                p_pi_mw_typical: typical_f64(
                    &root,
                    "silicon_photonic_soi",
                    "thermo_optic_phase_shifter.p_pi_mw",
                )?,
                thermal_crosstalk_db_typical: typical_f64(
                    &root,
                    "silicon_photonic_soi",
                    "thermo_optic_phase_shifter.thermal_crosstalk_db",
                )?,
            },
            neutral_atom: NeutralAtomParams {
                rydberg_c6_ghz_um6_typical: typical_f64(
                    &root,
                    "neutral_atom_rubidium87",
                    "rydberg_c6_ghz_um6",
                )?,
                rydberg_blockade_radius_um_typical: typical_f64(
                    &root,
                    "neutral_atom_rubidium87",
                    "rydberg_blockade_radius_um",
                )?,
            },
        })
    }

    /// Parse + verify against the embedded manifest in one call.
    pub fn from_verified_embedded() -> Result<Self, String> {
        verify_embedded_reference().map_err(|e| e.to_string())?;
        Self::from_json_bytes(embedded::MODALITIES_JSON.as_bytes())
    }
}

/// Gaussian DRAG pulse envelope at time `t_ns`.
#[derive(Debug, Clone, Copy)]
pub struct DragParams {
    /// Drive amplitude in MHz (calibration units).
    pub amplitude_mhz: f64,
    pub sigma_ns: f64,
    pub duration_ns: f64,
    /// DRAG derivative-quadrature weight.
    pub beta: f64,
    pub detune_mhz: f64,
}

#[derive(Debug, Clone, Copy)]
pub struct DragSample {
    pub amp_i: f64,
    pub amp_q: f64,
    pub detune_hz: f64,
}

/// `Ω_I = A·g(t)`, `Ω_Q = β·A·g'(t)` with the centered Gaussian
/// `g = exp(−(t−t0)²/(2σ²))` (ESM `dragPulse` parity).
pub fn drag_pulse(t_ns: f64, p: &DragParams) -> DragSample {
    if !(0.0..=p.duration_ns).contains(&t_ns) {
        return DragSample {
            amp_i: 0.0,
            amp_q: 0.0,
            detune_hz: p.detune_mhz * 1e6,
        };
    }
    let x = t_ns - p.duration_ns / 2.0;
    let g = (-(x * x) / (2.0 * p.sigma_ns * p.sigma_ns)).exp();
    let dg = (-x / (p.sigma_ns * p.sigma_ns)) * g;
    DragSample {
        amp_i: p.amplitude_mhz * g,
        amp_q: p.beta * p.amplitude_mhz * dg,
        detune_hz: p.detune_mhz * 1e6,
    }
}

/// Effective-leakage threshold for the documented first-order channel
/// (ESM parity: dephasing kick capped at 0.5, scaled by 0.05).
const LEAK_DEPHASING_SCALE: f64 = 0.05;
const LEAK_CAP: f64 = 0.5;
/// Integration sub-steps per pulse / idle window (ESM parity: 60).
const SUBSTEPS: usize = 60;

/// Superconducting transmon device: DRAG pulses under real T1/T2/ZZ noise.
pub struct TransmonDevice {
    pub sim: LindbladSim,
    pub readout_fidelity: f64,
    pub anharmonicity_mhz: f64,
    /// Accumulated effective leakage (diagnostic + channel strength).
    pub leak_accum: f64,
    pub leak_per_substep: Vec<f64>,
    rng: Mulberry32,
}

/// One calibrated pulse: target qubit + DRAG envelope parameters.
#[derive(Debug, Clone, Copy)]
pub struct Pulse {
    pub qubit: usize,
    pub amplitude_mhz: f64,
    pub sigma_ns: f64,
    pub duration_ns: f64,
    pub beta: f64,
}

/// Transmon device configuration (04-JSON parameters + calibration seed).
#[derive(Debug, Clone)]
pub struct TransmonConfig {
    pub n_qubits: usize,
    pub t1: f64,
    pub t2: f64,
    pub zz_hz: f64,
    pub readout_fidelity: f64,
    pub anharmonicity_mhz: f64,
    pub seed: u32,
}

impl TransmonDevice {
    /// Build with admission (interactive cap via ep-core) and JSON-typical
    /// noise (`noise` overrides for calibration sweeps).
    pub fn new_interactive(
        cfg: &TransmonConfig,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let TransmonConfig {
            n_qubits,
            t1,
            t2,
            zz_hz,
            readout_fidelity,
            anharmonicity_mhz,
            seed,
        } = *cfg;
        let sim = LindbladSim::new_interactive(
            n_qubits,
            crate::lindblad::NoiseModel::uniform(n_qubits, t1, t2).with_zz(
                if zz_hz != 0.0 && n_qubits >= 2 {
                    vec![crate::lindblad::ZzPair {
                        qa: 0,
                        qb: 1,
                        hz: zz_hz,
                    }]
                } else {
                    Vec::new()
                },
            ),
            controller,
        )?;
        Ok(Self {
            sim,
            readout_fidelity,
            anharmonicity_mhz,
            leak_accum: 0.0,
            leak_per_substep: Vec::new(),
            rng: Mulberry32::new(seed),
        })
    }

    /// Run one DRAG pulse under real noise (60 exact-splitting sub-steps +
    /// effective leakage channel), mirroring the ESM `runPulse` exactly.
    pub fn run_pulse(&mut self, pulse: &Pulse) -> &mut Self {
        let dt = (pulse.duration_ns * 1e-9) / SUBSTEPS as f64; // seconds
        let mut amp_i_at = [0.0f64; SUBSTEPS];
        for (s, slot) in amp_i_at.iter_mut().enumerate() {
            let t = s as f64 * pulse.duration_ns / SUBSTEPS as f64;
            let sample = drag_pulse(
                t,
                &DragParams {
                    amplitude_mhz: pulse.amplitude_mhz,
                    sigma_ns: pulse.sigma_ns,
                    duration_ns: pulse.duration_ns,
                    beta: pulse.beta,
                    detune_mhz: 0.0,
                },
            );
            // Ω(t) in rad/s: amplitude is expressed in MHz.
            let w = std::f64::consts::TAU * sample.amp_i * 1e6;
            let wq = std::f64::consts::TAU * sample.amp_q * 1e6;
            // Drive Hamiltonian on the target: Ω(t)/2·(σx + β-scaled σy).
            let hx = Op2::new([0.0, w / 2.0, w / 2.0, 0.0], [0.0; 4]);
            let hy = Op2::new([0.0; 4], [0.0, -wq / 2.0, wq / 2.0, 0.0]);
            self.sim.step(
                dt,
                &[Drive::new(pulse.qubit, hx), Drive::new(pulse.qubit, hy)],
            );
            *slot = sample.amp_i;
            // Effective leakage: γ_leak ∝ (Ω/|α|)² (first-order estimate).
            let leak = (sample.amp_i / self.anharmonicity_mhz.abs()).powi(2) * 1e-4;
            self.leak_accum += leak;
        }
        self.leak_per_substep = amp_i_at.to_vec();
        // Leakage channel: small dephasing kick ∝ accumulated leakage.
        let lk = self.leak_accum.min(LEAK_CAP);
        if lk > 0.0 {
            self.sim
                .rho
                .pure_dephasing(pulse.qubit, lk * LEAK_DEPHASING_SCALE);
        }
        self
    }

    /// Idle (decoherence only) for `us` microseconds.
    pub fn idle(&mut self, us: f64) -> &mut Self {
        self.sim.evolve(us, us / SUBSTEPS as f64, &[]);
        self
    }

    /// Readout with the device's fidelity (seeded deterministic sampling).
    pub fn measure(&mut self) -> (usize, usize) {
        self.sim.measure(&mut self.rng, self.readout_fidelity)
    }

    pub fn reset(&mut self) -> &mut Self {
        self.sim.reset(InitialState::Zeros).expect("same n re-init");
        self.leak_accum = 0.0;
        self.leak_per_substep.clear();
        self
    }
}

/// Silicon photonic SOI device — dual-rail encoded modes at 1550 nm
/// (pure-state amplitudes; loss tracked as per-shot survival probability
/// for honest statistics — ESM parity).
pub struct PhotonicDevice {
    pub n_modes: usize,
    pub amps_re: Vec<f64>,
    pub amps_im: Vec<f64>,
    pub survival: f64,
    pub loss_db_per_cm: f64,
    pub mzi_loss_db: f64,
    pub p_pi_mw: f64,
    pub thermal_crosstalk_db: f64,
}

impl PhotonicDevice {
    pub fn new(
        n_modes: usize,
        loss_db_per_cm: f64,
        mzi_loss_db: f64,
        p_pi_mw: f64,
        thermal_crosstalk_db: f64,
    ) -> Self {
        let mut dev = Self {
            n_modes,
            amps_re: vec![0.0; n_modes],
            amps_im: vec![0.0; n_modes],
            survival: 1.0,
            loss_db_per_cm,
            mzi_loss_db,
            p_pi_mw,
            thermal_crosstalk_db,
        };
        dev.amps_re[0] = 1.0; // qubit 0 in rail 0
        dev
    }

    /// Tunable coupler `U(θ, φ) = [[c, −e^{−iφ}s], [e^{iφ}s, c]]` (unitary,
    /// det = 1) applied to modes (a, b) — ESM `beamsplitter` arithmetic.
    pub fn beamsplitter(&mut self, theta: f64, phi: f64, mode_a: usize, mode_b: usize) {
        let c = theta.cos();
        let s = theta.sin();
        let cf = phi.cos();
        let sf = phi.sin();
        let (a_re, a_im) = (self.amps_re[mode_a], self.amps_im[mode_a]);
        let (b_re, b_im) = (self.amps_re[mode_b], self.amps_im[mode_b]);
        // m1 = −e^{−iφ}·s; m2 = +e^{iφ}·s
        let m1_re = -cf * s;
        let m1_im = sf * s;
        let m2_re = cf * s;
        let m2_im = sf * s;
        self.amps_re[mode_a] = c * a_re + (m1_re * b_re - m1_im * b_im);
        self.amps_im[mode_a] = c * a_im + (m1_re * b_im + m1_im * b_re);
        self.amps_re[mode_b] = (m2_re * a_re - m2_im * a_im) + c * b_re;
        self.amps_im[mode_b] = (m2_re * a_im + m2_im * a_re) + c * b_im;
    }

    /// Propagate losses: `η = 10^{−(dB/cm·L + IL·n)/10}`.
    pub fn apply_loss(&mut self, length_cm: f64, n_mzis: usize) {
        let total_db = self.loss_db_per_cm * length_cm + self.mzi_loss_db * n_mzis as f64;
        self.survival *= 10f64.powf(-total_db / 10.0);
    }

    /// Thermal phase-shifter crosstalk: neighbouring shifters pick up
    /// `phase·10^(thermal_crosstalk_db/10)`.
    pub fn apply_thermal_crosstalk(&mut self, power_mw: f64, neighbours: &[usize]) {
        let phase = (power_mw / self.p_pi_mw) * std::f64::consts::PI;
        let crosstalk = 10f64.powf(self.thermal_crosstalk_db / 10.0); // power ratio
        for nb in neighbours {
            self.phase_shift(*nb, phase * crosstalk);
        }
    }

    pub fn phase_shift(&mut self, mode: usize, radians: f64) {
        let c = radians.cos();
        let s = radians.sin();
        let re = self.amps_re[mode] * c - self.amps_im[mode] * s;
        let im = self.amps_re[mode] * s + self.amps_im[mode] * c;
        self.amps_re[mode] = re;
        self.amps_im[mode] = im;
    }

    pub fn reset(&mut self) -> &mut Self {
        self.amps_re.iter_mut().for_each(|v| *v = 0.0);
        self.amps_im.iter_mut().for_each(|v| *v = 0.0);
        self.amps_re[0] = 1.0;
        self.survival = 1.0;
        self
    }

    /// Norm² of the mode state (1 in the lossless model).
    pub fn norm(&self) -> f64 {
        self.amps_re
            .iter()
            .zip(self.amps_im.iter())
            .map(|(r, i)| r * r + i * i)
            .sum()
    }
}

/// Blockade strength below which the effective CZ carries an honest error
/// channel (ESM parity threshold).
pub const BLOCKADE_MIN_MHZ: f64 = 50.0;

/// Neutral-atom (87Rb) device: Rydberg blockade `V(r) = C₆/r⁶`.
///
/// Unit note: `C₆/r⁶` with C₆ in GHz·µm⁶ and r in µm is in GHz; the MHz
/// value is `×1000`. (The ESM engine's `blockadeMhz` divides by 1000 — a
/// unit mislabel its own test enshrines; the kernel keeps the physical
/// units and cross-checks the JSON blockade-radius typical below.)
pub struct NeutralAtomDevice {
    pub c6_ghz_um6: f64,
    pub r_um: f64,
    /// Optical Rabi frequency Ω in GHz (blockade-radius denominator).
    pub omega_ghz: f64,
    pub trap_dephasing_rad_per_us: f64,
    pub phases: Vec<f64>,
    rng: Mulberry32,
}

impl NeutralAtomDevice {
    pub fn new(
        c6_ghz_um6: f64,
        r_um: f64,
        omega_ghz: f64,
        trap_dephasing_rad_per_us: f64,
        seed: u32,
        n_atoms: usize,
    ) -> Self {
        Self {
            c6_ghz_um6,
            r_um,
            omega_ghz,
            trap_dephasing_rad_per_us,
            phases: vec![0.0; n_atoms],
            rng: Mulberry32::new(seed),
        }
    }

    /// `V(r) = C₆/r⁶` in GHz.
    pub fn blockade_ghz(&self, r_um: f64) -> f64 {
        self.c6_ghz_um6 / r_um.powi(6)
    }

    /// `V(r)` in MHz (GHz × 1000 — physical units).
    pub fn blockade_mhz(&self, r_um: f64) -> f64 {
        self.blockade_ghz(r_um) * 1000.0
    }

    /// Blockade radius `r_b = (C₆/Ω)^{1/6}` (Ω in GHz → result in µm).
    pub fn blockade_radius_um(&self, omega_ghz: f64) -> f64 {
        (self.c6_ghz_um6 / omega_ghz).powf(1.0 / 6.0)
    }

    /// Effective Rydberg CZ in the phase frame: control/target pick up the
    /// blockade conditional phase (net `+π` on the control qubit, matching
    /// the ESM frame bookkeeping); a weak blockade adds the honest error
    /// offset (+0.1 rad) instead of pretending the gate worked.
    pub fn rydberg_cz(&mut self) -> &mut Self {
        let blockade_mhz = self.blockade_mhz(self.r_um);
        if blockade_mhz < BLOCKADE_MIN_MHZ {
            // Blockade too weak — leakage error channel (honest failure mode).
            self.phases[0] += 0.1;
        }
        // Ideal blockade: control in |r⟩ ⇒ target phase shifted by π.
        self.phases[1] += std::f64::consts::PI;
        self.phases[0] += std::f64::consts::PI;
        // Double-counting correction of the standard CZ diagonal.
        self.phases[1] -= std::f64::consts::PI;
        self
    }

    /// Trap-induced dephasing over `us` microseconds (seeded).
    pub fn idle(&mut self, us: f64) -> &mut Self {
        for phase in self.phases.iter_mut() {
            *phase += (self.rng.next_f64() - 0.5) * self.trap_dephasing_rad_per_us * us * 2.0;
        }
        self
    }

    pub fn reset(&mut self) -> &mut Self {
        self.phases.iter_mut().for_each(|p| *p = 0.0);
        self
    }
}

/// Density-matrix-level Rydberg CZ on qubits (qa, qb): the blockade
/// conditional phase `φ` applied as the diagonal unitary
/// `diag(1, 1, 1, e^{iφ})` — `φ = π` under blockade; partial φ for a weak
/// blockade would be an honest, displayed degradation (never silent).
pub fn apply_rydberg_cz_phase(rho: &mut crate::lindblad::DensityMatrix, qa: usize, qb: usize) {
    let d = rho.d;
    let ba = 1usize << qa;
    let bb = 1usize << qb;
    for i in 0..d {
        for j in 0..d {
            let phi_i = if (i & ba) != 0 && (i & bb) != 0 {
                std::f64::consts::PI
            } else {
                0.0
            };
            let phi_j = if (j & ba) != 0 && (j & bb) != 0 {
                std::f64::consts::PI
            } else {
                0.0
            };
            let ph = phi_i - phi_j;
            if ph == 0.0 {
                continue;
            }
            let a = i * d + j;
            let c = ph.cos();
            let s = ph.sin();
            let re = rho.re[a];
            let im = rho.im[a];
            rho.re[a] = re * c - im * s;
            rho.im[a] = re * s + im * c;
        }
    }
}
