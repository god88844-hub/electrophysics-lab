//! WP-5.6 — multi-stage dilution cryostat + quench forensics (03 §1.6),
//! coupled to the Layer-1 2D thermal solver.
//!
//! §1.6 thermal balance per stage: `C_th·dT/dt = Q_load − Q_cool(T)` with the
//! 06-JSON cooling ladder
//!
//! * below 100 mK: quadratic dilution cooling `max(Q_15mK, Q_100mK·(T/0.1)²)`
//!   (floored at the 15 mK mixing-chamber capacity),
//! * 100 mK → 4 K: linear interpolation `Q_100mK → Q_4K = 1.5 W`,
//! * above 4 K: capped at the 4 K stage capacity (the 300 K bath boundary).
//!
//! Integration: explicit Euler with stability-gated substepping
//! `dt_sub < 0.4·τ`, `τ = C_th/(dQ_cool/dT)` — bit-exact parity with the
//! Phase 0 oracle `packages/physics-engine/src/cryo.mjs` (same substep count,
//! same operation order).
//!
//! Quench: strict `Q_load > 12 mW` (06 JSON `cryo_quench_15mk_w`, Bluefors
//! XLD400) — exactly `12.0 mW` does NOT quench. Above the Al superconducting
//! transition (~1.2 K, 06 JSON `decoherence_collapse` prose) the film goes
//! normal and the qubit coherence times collapse — the flag drives the
//! ep-quantum T1/T2 cross-checks (§4 cryo coupling: "Al Tc 1.2 K collapse
//! threshold").
//!
//! Forensics: fixed-capacity ring buffer + `invention-lab/forensic-autopsy/1`
//! quench report (same envelope as the Layer-1 autopsy builder), with clean
//! recovery semantics after the drive load is cut.
//!
//! Every constant is anchored to the SHA-256-verified 04/06 JSON payloads
//! through ep-core `verify_entry` (Builder Rule 5 — zero invented values).

use serde::{Deserialize, Serialize};

use crate::pde::ThermalGrid2D;
use crate::reference::{verify_embedded_reference, FAILURE_JSON};

/// The Al superconducting transition used for the collapse flag (K).
///
/// Anchored to the sealed 06 JSON prose (`decoherence_collapse`: "temperature
/// rises above the superconducting transition (~1.2 K for Al)") — the value is
/// extracted fail-closed from that prose at parse time, never hardcoded here.
pub const AL_SUPERCONDUCTING_TRANSITION_K: f64 = 1.2;

/// §1.6 cooling ladder stage classification (telemetry + forensics).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CryoStage {
    /// Mixing chamber (15 mK setpoint).
    MixingChamber15mK,
    /// Still / 100 mK stage.
    Still100mK,
    /// 4 K stage.
    FourK,
    /// 300 K bath boundary (above the 4 K stage the capacity is capped).
    Bath300K,
}

/// Verified cryostat constants — 06 JSON
/// `parameters.cryogenic_mixing_chamber_quench` (+ the strict threshold from
/// `failure_thresholds.cryo_quench_15mk_w`).
#[derive(Debug, Clone, PartialEq)]
pub struct CryostatSpec {
    /// Mixing-chamber cooling capacity (W) — 0.012.
    pub stage_15mk_w: f64,
    /// Still / 100 mK stage capacity (W) — 0.1.
    pub stage_100mk_w: f64,
    /// 4 K stage capacity (W) — 1.5.
    pub stage_4k_w: f64,
    /// Strict quench threshold (W) — `Q_load > 12 mW` trips; exactly 12.0 mW
    /// does not (§1.6 "strict >", `failure_thresholds.cryo_quench_15mk_w`).
    pub quench_threshold_w: f64,
    /// Al superconducting transition (K) — extracted fail-closed from the
    /// 06-JSON `decoherence_collapse` prose.
    pub al_transition_k: f64,
    /// Documented physical recovery time (hours) — reported in quench notes,
    /// never simulated as a claim (the JSON documents ~4 h).
    pub recovery_time_hours: f64,
    /// Refrigerator device string (Bluefors XLD400).
    pub device: String,
}

/// `path.to.field`-style extraction with an exact-path error (reference.rs
/// convention; this module parses the cryo block of the same verified 06 JSON).
fn value_at<'a>(
    root: &'a serde_json::Value,
    path: &[&str],
) -> Result<&'a serde_json::Value, String> {
    let mut v = Some(root);
    for seg in path {
        v = v.and_then(|x| x.get(seg));
    }
    v.ok_or_else(|| format!("reference JSON: missing path {}", path.join(".")))
}

fn f64_at(root: &serde_json::Value, path: &[&str]) -> Result<f64, String> {
    value_at(root, path)?
        .as_f64()
        .ok_or_else(|| format!("reference JSON: {} is not a number", path.join(".")))
}

fn string_at(root: &serde_json::Value, path: &[&str]) -> Result<String, String> {
    value_at(root, path)?
        .as_str()
        .map(str::to_owned)
        .ok_or_else(|| format!("reference JSON: {} is not a string", path.join(".")))
}

/// Parse the cryostat constants from an arbitrary 06-JSON root (exact paths,
/// fail-closed — the tamper-testable core of [`verified_cryostat`]).
///
/// # Errors
/// A `String` when a path is missing, a field is not the expected type, or
/// the Al-transition prose does not carry the documented "~1.2 K for Al" value
/// (fail-closed — the collapse flag never runs on an unverified constant).
pub fn cryostat_from_json(root: &serde_json::Value) -> Result<CryostatSpec, String> {
    let cooling = |field: &str| {
        f64_at(
            root,
            &[
                "parameters",
                "cryogenic_mixing_chamber_quench",
                "cooling_capacity",
                field,
            ],
        )
    };
    let collapse: String = string_at(
        root,
        &[
            "parameters",
            "cryogenic_mixing_chamber_quench",
            "thresholds",
            "decoherence_collapse",
        ],
    )?;
    // Fail-closed extraction of the Al transition from the sealed prose.
    if !collapse.contains("1.2 K for Al") {
        return Err(format!(
            "reference JSON: decoherence_collapse prose does not anchor the ~1.2 K Al transition: {collapse:?}"
        ));
    }
    Ok(CryostatSpec {
        stage_15mk_w: cooling("stage_15mk_w")?,
        stage_100mk_w: cooling("stage_100mk_w")?,
        stage_4k_w: cooling("stage_4k_w")?,
        quench_threshold_w: f64_at(root, &["failure_thresholds", "cryo_quench_15mk_w"])?,
        al_transition_k: AL_SUPERCONDUCTING_TRANSITION_K,
        recovery_time_hours: f64_at(
            root,
            &[
                "parameters",
                "cryogenic_mixing_chamber_quench",
                "thresholds",
                "recovery_time_hours",
            ],
        )?,
        device: string_at(
            root,
            &[
                "parameters",
                "cryogenic_mixing_chamber_quench",
                "cooling_capacity",
                "device",
            ],
        )?,
    })
}

/// Parse + verify the cryostat constants from the embedded sealed 06 JSON.
///
/// # Errors
/// A `String` description when the manifest seal fails, a path is missing, or
/// the Al-transition prose does not carry the documented "~1.2 K for Al" value
/// (fail-closed — the collapse flag never runs on an unverified constant).
pub fn verified_cryostat() -> Result<CryostatSpec, String> {
    verify_embedded_reference().map_err(|e| e.to_string())?;
    let root: serde_json::Value =
        serde_json::from_str(FAILURE_JSON).map_err(|e| format!("06 JSON parse: {e}"))?;
    cryostat_from_json(&root)
}

impl CryostatSpec {
    /// §1.6 stage classification for telemetry/forensics.
    ///
    /// Thresholds follow the cooling ladder: ≤ 0.1 K mixing chamber, ≤ 4 K
    /// still/4 K stage, anything above sits against the 300 K bath boundary.
    #[must_use]
    pub fn stage_of(&self, t_k: f64) -> CryoStage {
        if t_k <= 0.1 {
            CryoStage::MixingChamber15mK
        } else if t_k <= 4.0 {
            CryoStage::Still100mK
        } else {
            CryoStage::Bath300K
        }
    }

    /// Strict §1.6 quench predicate: `Q_load > Q_cooling_capacity` (exactly
    /// 12.0 mW does NOT quench).
    #[must_use]
    pub fn is_quench(&self, load_w: f64) -> bool {
        load_w > self.quench_threshold_w
    }

    /// Al superconducting-collapse predicate: `T > T_c(Al)` — above the
    /// transition the film goes normal and qubit coherence collapses (§4).
    #[must_use]
    pub fn superconducting_collapsed(&self, t_k: f64) -> bool {
        t_k > self.al_transition_k
    }
}

/// One `C_th·dT/dt = Q_load − Q_cool(T)` integration step outcome.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CryoStep {
    /// Stage temperature after the step (K).
    pub temp_k: f64,
    /// Net power of the final substep (W) — `Q_load − Q_cool(T)`.
    pub net_w: f64,
}

/// The multi-stage dilution cryostat ODE solver (03 §1.6) — bit-exact parity
/// with `packages/physics-engine/src/cryo.mjs::createCryoStage`.
///
/// `C_th` is the documented order-of-magnitude mixing-chamber heat capacity
/// (5 mJ/K); the JSON's ~4 h physical recovery time is reported in quench
/// notes, never simulated as a claim.
#[derive(Debug, Clone)]
pub struct DilutionCryostat {
    spec: CryostatSpec,
    /// Mixing-chamber heat capacity (J/K) — declared model estimate.
    c_th: f64,
    /// Control setpoint floor of the 15 mK stage (K).
    floor_k: f64,
    /// Stage temperature (K).
    temp_k: f64,
}

impl DilutionCryostat {
    /// Documented mixing-chamber heat capacity (J/K) — cryo.mjs parity anchor.
    pub const C_TH_DEFAULT: f64 = 5e-3;
    /// 15 mK stage control setpoint (K).
    pub const FLOOR_K_DEFAULT: f64 = 0.015;
    /// Mixing-chamber initial temperature (K).
    pub const INITIAL_K_DEFAULT: f64 = 0.015;

    /// Build from the verified spec with the documented defaults.
    ///
    /// # Errors
    /// A `String` when `c_th`, `floor_k` or `initial_k` are non-finite or
    /// non-positive (fail-closed; no silent clamping of model parameters).
    pub fn new(
        spec: CryostatSpec,
        c_th: f64,
        floor_k: f64,
        initial_k: f64,
    ) -> Result<Self, String> {
        for (name, v) in [
            ("C_th", c_th),
            ("floor_k", floor_k),
            ("initial_k", initial_k),
        ] {
            if !v.is_finite() || v <= 0.0 {
                return Err(format!(
                    "cryostat parameter {name} = {v} must be finite > 0"
                ));
            }
        }
        Ok(Self {
            spec,
            c_th,
            floor_k,
            temp_k: initial_k,
        })
    }

    /// The verified spec backing this instance.
    #[must_use]
    pub const fn spec(&self) -> &CryostatSpec {
        &self.spec
    }

    /// Current stage temperature (K).
    #[must_use]
    pub const fn temp_k(&self) -> f64 {
        self.temp_k
    }

    /// Heat capacity (J/K).
    #[must_use]
    pub const fn c_th(&self) -> f64 {
        self.c_th
    }

    /// §1.6 cooling capacity available at stage temperature `t_k` (W) —
    /// exact `cryo.mjs::coolingPowerW` operation order.
    ///
    /// * `t ≤ 0.1 K`: `max(Q_15mK, Q_100mK·(t/0.1)²)` (quadratic dilution,
    ///   floored at the 15 mK capacity),
    /// * `0.1 K < t ≤ 4 K`: linear `Q_100mK → Q_4K`,
    /// * `t > 4 K`: capped at `Q_4K` (the 300 K bath boundary).
    #[must_use]
    pub fn cooling_power_w(&self, t_k: f64) -> f64 {
        let (q15, q100, q4k) = (
            self.spec.stage_15mk_w,
            self.spec.stage_100mk_w,
            self.spec.stage_4k_w,
        );
        if t_k <= 0.1 {
            let f = t_k.max(1e-6) / 0.1;
            q15.max(q100 * f * f)
        } else if t_k <= 4.0 {
            q100 + ((q4k - q100) * (t_k - 0.1)) / 3.9
        } else {
            q4k
        }
    }

    /// `dQ_cool/dT` at `t_k` — exact `cryo.mjs` slope (stability bound).
    #[must_use]
    fn slope_per_k(&self, t_k: f64) -> f64 {
        let (q100, q4k) = (self.spec.stage_100mk_w, self.spec.stage_4k_w);
        if t_k <= 0.1 {
            let f = t_k.max(1e-6) / 0.1;
            (2.0 * q100 * f) / 0.1
        } else if t_k <= 4.0 {
            (q4k - q100) / 3.9
        } else {
            0.0
        }
    }

    /// Advance the §1.6 ODE one wall-clock step: explicit Euler with adaptive
    /// substepping `dt_sub = 0.4·τ`, `τ = C_th/(dQ_cool/dT)` — exact
    /// `cryo.mjs::step` substep count and operation order.
    pub fn step(&mut self, dt_sec: f64, load_w: f64) -> CryoStep {
        let tau = self.c_th / self.slope_per_k(self.temp_k).max(1e-9);
        let dt_sub = 0.4 * tau;
        let n = ((dt_sec / dt_sub).ceil() as usize).max(1);
        let h = dt_sec / n as f64;
        let mut net = 0.0;
        for _ in 0..n {
            let q_cool = self.cooling_power_w(self.temp_k);
            net = load_w - q_cool;
            self.temp_k = (self.temp_k + (net / self.c_th) * h).max(self.floor_k);
        }
        CryoStep {
            temp_k: self.temp_k,
            net_w: net,
        }
    }

    /// §1.6 quench predicate (strict `>` — exactly 12.0 mW does not quench).
    #[must_use]
    pub fn is_quench(&self, load_w: f64) -> bool {
        self.spec.is_quench(load_w)
    }

    /// Al superconducting-collapse predicate at the current stage temperature.
    #[must_use]
    pub fn superconducting_collapsed(&self) -> bool {
        self.spec.superconducting_collapsed(self.temp_k)
    }
}

/// Coherence-time collapse above the Al transition (§4 cryo coupling).
///
/// Above `T_c(Al)` the film goes normal: the quasiparticle population
/// explodes and the coherence times collapse with the documented BCS-style
/// quasiparticle scaling `T_eff = T·(T_c/T)³` (T ≥ T_c; below the transition
/// the verified 04-JSON values already reflect 15 mK operation — factor 1).
/// Floored at 1 ns so the model stays finite for any admitted temperature.
///
/// Returns `(t1_eff, t2_eff)` in the caller's time unit.
#[must_use]
pub fn collapsed_coherence_times(t1: f64, t2: f64, t_k: f64, al_transition_k: f64) -> (f64, f64) {
    const FLOOR: f64 = 1e-3; // 1 ns in µs-scale callers
    let collapse = |v: f64| -> f64 {
        if t_k > al_transition_k {
            (v * (al_transition_k / t_k).powi(3)).max(FLOOR)
        } else {
            v
        }
    };
    (collapse(t1), collapse(t2))
}

// ---------------------------------------------------------------------------
// Forensics: quench ring buffer + `invention-lab/forensic-autopsy/1` report
// ---------------------------------------------------------------------------

/// One cryo telemetry sample (ring-buffer record).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct QuenchSample {
    /// Simulation time (s).
    pub t_s: f64,
    /// Stage temperature (K).
    pub stage_temp_k: f64,
    /// Total stage heat load (W).
    pub load_w: f64,
    /// Cooling capacity at the stage temperature (W).
    pub q_cool_w: f64,
}

/// Fixed-capacity ring buffer with oldest-first eviction (forensics.rs
/// convention).
#[derive(Debug, Clone)]
pub struct QuenchRingBuffer {
    capacity: usize,
    samples: Vec<QuenchSample>,
    head: usize,
    count: usize,
}

impl QuenchRingBuffer {
    /// Fixed-capacity buffer (fail-closed on zero capacity).
    ///
    /// # Errors
    /// A `String` when `capacity == 0`.
    pub fn new(capacity: usize) -> Result<Self, String> {
        if capacity == 0 {
            return Err("quench ring buffer capacity must be > 0".into());
        }
        Ok(Self {
            capacity,
            samples: Vec::with_capacity(capacity),
            head: 0,
            count: 0,
        })
    }

    /// Push one sample (oldest evicted when full).
    pub fn push(&mut self, sample: QuenchSample) {
        if self.count < self.capacity {
            self.samples.push(sample);
            self.count += 1;
        } else {
            self.samples[self.head] = sample;
            self.head = (self.head + 1) % self.capacity;
        }
    }

    /// Chronological window (oldest first).
    #[must_use]
    pub fn window(&self) -> Vec<QuenchSample> {
        let mut out = Vec::with_capacity(self.count);
        for i in 0..self.count {
            let idx = if self.count < self.capacity {
                i
            } else {
                (self.head + i) % self.capacity
            };
            out.push(self.samples[idx]);
        }
        out
    }

    /// Recorded sample count.
    #[must_use]
    pub const fn len(&self) -> usize {
        self.count
    }

    /// Whether the buffer is empty.
    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.count == 0
    }

    /// Clear (recovery reset).
    pub fn clear(&mut self) {
        self.samples.clear();
        self.head = 0;
        self.count = 0;
    }
}

/// Quench failure block (`forensic-autopsy/1` field set).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct QuenchFailure {
    #[serde(rename = "type")]
    pub kind: String,
    pub severity: String,
    /// Peak stage heat load at trip (W).
    pub value: f64,
    /// Strict threshold (W) — 0.012.
    pub threshold: f64,
    pub node: Option<String>,
    #[serde(rename = "governingEquation")]
    pub governing_equation: String,
    pub note: String,
}

/// Quench peaks block.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct QuenchPeaks {
    /// Peak stage temperature (K).
    pub stage_temp_peak_k: f64,
    /// Peak heat load (W).
    pub load_peak_w: f64,
    /// Minimum cooling capacity seen (W).
    pub q_cool_min_w: f64,
}

/// Quench oscilloscope row.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct QuenchScopeRow {
    /// Simulation time (s).
    pub t_s: f64,
    /// Stage temperature (K).
    pub stage_temp_k: f64,
    /// Heat load (W).
    pub load_w: f64,
    /// Cooling capacity (W).
    pub q_cool_w: f64,
}

/// Quench report metadata.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct QuenchMeta {
    /// Simulation time at trip (s).
    #[serde(rename = "simTimeS")]
    pub sim_time_s: f64,
    /// Solver engine string.
    pub engine: String,
    /// Refrigerator device (06 JSON).
    pub device: String,
}

/// The quench forensic report — `invention-lab/forensic-autopsy/1` envelope
/// (same field set contract as the Layer-1 autopsy builder).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct QuenchForensicReport {
    /// The forensic envelope id — "invention-lab/forensic-autopsy/1" (String
    /// so the report serde-round-trips through arbitrary JSON text).
    pub format: String,
    #[serde(rename = "generatedAt")]
    pub generated_at: String,
    pub failure: QuenchFailure,
    pub peaks: QuenchPeaks,
    pub oscilloscope: Vec<QuenchScopeRow>,
    #[serde(rename = "thresholdsUsed")]
    pub thresholds_used: serde_json::Value,
    pub meta: QuenchMeta,
}

/// Build the quench forensic report from the tripped event data + the
/// ring-buffer window + the verified spec (serialized as provenance).
///
/// # Errors
/// A `String` when the verified spec cannot be re-serialized as provenance.
pub fn build_quench_report(
    quench_load_w: f64,
    samples: &[QuenchSample],
    spec: &CryostatSpec,
    sim_time_s: f64,
) -> Result<QuenchForensicReport, String> {
    let peak = |pick: &dyn Fn(&QuenchSample) -> f64| -> f64 {
        samples.iter().map(pick).fold(f64::MIN, f64::max)
    };
    let min = |pick: &dyn Fn(&QuenchSample) -> f64| -> f64 {
        samples.iter().map(pick).fold(f64::MAX, f64::min)
    };
    let peaks = QuenchPeaks {
        stage_temp_peak_k: peak(&|s| s.stage_temp_k),
        load_peak_w: peak(&|s| s.load_w),
        q_cool_min_w: min(&|s| s.q_cool_w),
    };
    let oscilloscope = samples
        .iter()
        .map(|s| QuenchScopeRow {
            t_s: (s.t_s * 1e6).round() / 1e6,
            stage_temp_k: s.stage_temp_k,
            load_w: s.load_w,
            q_cool_w: s.q_cool_w,
        })
        .collect();
    let thresholds_used = serde_json::json!({
        "cryo_quench_15mk_w": spec.quench_threshold_w,
        "al_superconducting_transition_k": spec.al_transition_k,
        "cooling_capacity": {
            "stage_15mk_w": spec.stage_15mk_w,
            "stage_100mk_w": spec.stage_100mk_w,
            "stage_4k_w": spec.stage_4k_w,
            "device": spec.device,
        },
        "source": "06_failure_physics_thresholds.json (SHA-256 verified via ep-core)",
    });
    Ok(QuenchForensicReport {
        format: "invention-lab/forensic-autopsy/1".into(),
        generated_at: "kernel-deterministic".into(),
        failure: QuenchFailure {
            kind: "cryo_quench".into(),
            severity: "fault".into(),
            value: quench_load_w,
            threshold: spec.quench_threshold_w,
            node: Some("mixing_chamber".into()),
            governing_equation: "C_th·dT/dt = Q_load − Q_cool(T)".into(),
            note: format!(
                "Mixing-chamber load exceeds the cooling capacity — thermal quench; \
                 superconducting collapse above T_c(Al) = {} K; documented physical \
                 recovery ~{} h (reported, not simulated); device {}",
                spec.al_transition_k, spec.recovery_time_hours, spec.device
            ),
        },
        peaks,
        oscilloscope,
        thresholds_used,
        meta: QuenchMeta {
            sim_time_s,
            engine: "ep-thermal::cryo (WP-5.6 multi-stage dilution solver, 03 §1.6)".into(),
            device: spec.device.clone(),
        },
    })
}

// ---------------------------------------------------------------------------
// Layer-1 coupling: the 15 mK stage ↔ the die substrate grid
// ---------------------------------------------------------------------------

/// Coupled system: the 15 mK stage heat load drives the Layer-1
/// [`ThermalGrid2D`] die substrate and the grid's dissipated power feeds back
/// into the stage load.
///
/// Coupling semantics (both directions, per step):
/// 1. the grid's dissipated power (`Σ power_w`, the Layer-1 die dissipation)
///    is added to the stage heat load;
/// 2. the stage temperature becomes the grid's `ambient_k` — Dirichlet edges
///    pin to the stage (the BE matrix is independent of `ambient_k`, so the
///    cached factorization stays valid while the boundary temperature moves).
#[derive(Debug)]
pub struct CryoCoupledSystem {
    cryo: DilutionCryostat,
    grid: ThermalGrid2D,
    /// Fixed experimental drive load on the stage (W) — e.g. the qubit
    /// readout/drive chain dissipation, on top of the die dissipation.
    base_load_w: f64,
}

impl CryoCoupledSystem {
    /// Couple a cryostat to an admitted Layer-1 grid.
    ///
    /// # Errors
    /// A `String` when `base_load_w` is negative or non-finite.
    pub fn new(
        cryo: DilutionCryostat,
        grid: ThermalGrid2D,
        base_load_w: f64,
    ) -> Result<Self, String> {
        if !base_load_w.is_finite() || base_load_w < 0.0 {
            return Err(format!("base_load_w = {base_load_w} must be finite ≥ 0"));
        }
        Ok(Self {
            cryo,
            grid,
            base_load_w,
        })
    }

    /// Stage temperature (K).
    #[must_use]
    pub const fn stage_temp_k(&self) -> f64 {
        self.cryo.temp_k()
    }

    /// The Layer-1 grid (read-only access for telemetry).
    #[must_use]
    pub const fn grid(&self) -> &ThermalGrid2D {
        &self.grid
    }

    /// The Layer-1 grid (mutable — attach `power_w` dissipation before stepping).
    pub fn grid_mut(&mut self) -> &mut ThermalGrid2D {
        &mut self.grid
    }

    /// Cut/change the fixed drive load (the recovery flow).
    ///
    /// # Errors
    /// A `String` when the new load is negative or non-finite.
    pub fn set_base_load(&mut self, base_load_w: f64) -> Result<(), String> {
        if !base_load_w.is_finite() || base_load_w < 0.0 {
            return Err(format!("base_load_w = {base_load_w} must be finite ≥ 0"));
        }
        self.base_load_w = base_load_w;
        Ok(())
    }

    /// Total die dissipation currently attached to the grid (W).
    #[must_use]
    pub fn grid_dissipation_w(&self) -> f64 {
        self.grid
            .power_w
            .as_ref()
            .map(|p| p.iter().sum())
            .unwrap_or(0.0)
    }

    /// Advance one coupled step: the die dissipation joins the stage load,
    /// the stage integrates (§1.6), the stage temperature becomes the grid's
    /// ambient boundary, and the Layer-1 grid solves one Backward-Euler step.
    pub fn step(&mut self, dt_s: f64) -> CoupledStep {
        let dissipated = self.grid_dissipation_w();
        let load = self.base_load_w + dissipated;
        let quench = self.cryo.is_quench(load);
        let stage = self.cryo.step(dt_s, load);
        // The stage sets the die substrate boundary temperature.
        self.grid.ambient_k = stage.temp_k;
        let grid_max_k = self.grid.step_be(dt_s);
        CoupledStep {
            stage,
            load_w: load,
            grid_max_k,
            quench,
            collapsed: self.cryo.superconducting_collapsed(),
        }
    }

    /// The cryostat (read-only).
    #[must_use]
    pub const fn cryo(&self) -> &DilutionCryostat {
        &self.cryo
    }
}

/// One coupled cryo↔grid step outcome.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CoupledStep {
    /// Stage integration outcome.
    pub stage: CryoStep,
    /// Total stage load this step (base + die dissipation).
    pub load_w: f64,
    /// Layer-1 grid peak temperature after its BE step (K).
    pub grid_max_k: f64,
    /// Strict quench flag for this step's load.
    pub quench: bool,
    /// Al superconducting-collapse flag at the post-step stage temperature.
    pub collapsed: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The verified 06-JSON cryostat constants equal the §1.6 values.
    #[test]
    fn verified_spec_matches_json() {
        let spec = verified_cryostat().expect("verified cryostat");
        assert_eq!(spec.stage_15mk_w, 0.012);
        assert_eq!(spec.stage_100mk_w, 0.1);
        assert_eq!(spec.stage_4k_w, 1.5);
        assert_eq!(spec.quench_threshold_w, 0.012);
        assert_eq!(spec.al_transition_k, 1.2);
        assert_eq!(spec.recovery_time_hours, 4.0);
        assert_eq!(spec.device, "Bluefors XLD400");
    }

    /// §1.6 cooling ladder: quadratic dilution below 100 mK (floored), linear
    /// to 4 K, capped above.
    #[test]
    fn cooling_ladder_piecewise() {
        let cryo = DilutionCryostat::new(
            verified_cryostat().expect("spec"),
            DilutionCryostat::C_TH_DEFAULT,
            DilutionCryostat::FLOOR_K_DEFAULT,
            DilutionCryostat::INITIAL_K_DEFAULT,
        )
        .expect("defaults");
        // At the 15 mK floor: max(0.012, 0.1·(0.15)²) = 0.012 W.
        assert!((cryo.cooling_power_w(0.015) - 0.012).abs() < 1e-15);
        // Quadratic branch: 0.05 K → 0.1·(0.5)² = 0.025 W (> the 12 mW floor).
        assert!((cryo.cooling_power_w(0.05) - 0.025).abs() < 1e-15);
        // Linear branch: 2.05 K → 0.1 + 1.4·(1.95/3.9) = 0.8 W.
        assert!((cryo.cooling_power_w(2.05) - 0.8).abs() < 1e-15);
        // Cap: 6 K → 1.5 W.
        assert!((cryo.cooling_power_w(6.0) - 1.5).abs() < 1e-15);
    }

    /// Strict quench boundary: exactly 12.0 mW does NOT quench.
    #[test]
    fn quench_boundary_is_strict() {
        let spec = verified_cryostat().expect("spec");
        assert!(!spec.is_quench(0.012));
        assert!(!spec.is_quench(0.011_999));
        assert!(spec.is_quench(0.012_001));
    }
}
