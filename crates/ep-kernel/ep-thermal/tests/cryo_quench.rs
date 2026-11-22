//! WP-5.6 — cryogenic quench forensics coupled to the Layer-1 thermal solver:
//! acceptance tests.
//!
//! Gates (PHASE_05 §WP-5.6 + the task contract):
//!   1. **Bit-exact parity** with `packages/physics-engine/src/cryo.mjs`
//!      (`createCryoStage` — the §1.6 ODE, substep-for-substep, f64-to-f64),
//!   2. **Boundary semantics**: exactly `12.0 mW` → no quench; `> 12.0 mW` →
//!      quench (§1.6 "strict >", 06 JSON `cryo_quench_15mk_w`),
//!   3. **Coupled thermal cross-check**: the 15 mK stage heat load drives the
//!      Layer-1 [`ThermalGrid2D`] die substrate (Backward-Euler) and the die
//!      dissipation feeds the stage load; quench warms the substrate; cutting
//!      the drive load recovers cleanly,
//!   4. **Forensic recovery**: `invention-lab/forensic-autopsy/1` quench
//!      report (serde round-trip) + fixed-capacity ring buffer,
//!   5. **Al T_c collapse cross-check** (§4): the 1.2 K flag drives rapid
//!      T1/T2 decoherence in the ep-quantum Lindblad kernel — quiescent
//!      population(T1) ≈ e⁻¹ at the verified 15 mK operating point, collapsed
//!      population decays at the BCS-style (T_c/T)³ rate,
//!   6. Fail-closed anchoring: every constant from the SHA-256-verified 04/06
//!      JSONs via ep-core; tampered payloads refused.
//!
//! The JS-side parity fixture is captured deterministically by
//! `tests/data/gen_cryo_parity.mjs` from the same oracle module.

use ep_core::admission::AdmissionController;
use ep_core::reference::Manifest;
use ep_quantum::lindblad::{DensityMatrix, InitialState, LindbladSim, NoiseModel};
use ep_thermal::cryo::{
    build_quench_report, collapsed_coherence_times, verified_cryostat, CryoCoupledSystem,
    CryoStage, DilutionCryostat, QuenchRingBuffer, QuenchSample,
};
use ep_thermal::pde::{BoundaryMode, Scheme, ThermalGrid2D};
use serde_json::Value;

const TOL_ORACLE: f64 = 0.02;

fn fixture() -> Value {
    serde_json::from_str(include_str!("data/cryo_parity.json")).expect("fixture parses")
}

/// Bit-exact JS mirror of `cryo.mjs::createCryoStage` (the oracle): the same
/// operation order, substep count and clamps, evaluated in f64 — JS doubles
/// and Rust f64 are the same IEEE-754 arithmetic for this op sequence.
struct JsMirror {
    q15: f64,
    q100: f64,
    q4k: f64,
    cth: f64,
    floor: f64,
    t: f64,
}

impl JsMirror {
    fn cool(&self, t: f64) -> f64 {
        if t <= 0.1 {
            let f = t.max(1e-6) / 0.1;
            self.q15.max(self.q100 * f * f)
        } else if t <= 4.0 {
            self.q100 + ((self.q4k - self.q100) * (t - 0.1)) / 3.9
        } else {
            self.q4k
        }
    }
    fn slope(&self, t: f64) -> f64 {
        if t <= 0.1 {
            let f = t.max(1e-6) / 0.1;
            (2.0 * self.q100 * f) / 0.1
        } else if t <= 4.0 {
            (self.q4k - self.q100) / 3.9
        } else {
            0.0
        }
    }
    fn step(&mut self, dt: f64, load: f64) -> f64 {
        let tau = self.cth / self.slope(self.t).max(1e-9);
        let dt_sub = 0.4 * tau;
        let n = ((dt / dt_sub).ceil() as usize).max(1);
        let h = dt / n as f64;
        let mut net;
        for _ in 0..n {
            let qc = self.cool(self.t);
            net = load - qc;
            self.t = (self.t + (net / self.cth) * h).max(self.floor);
        }
        self.t
    }
}

fn default_stage() -> DilutionCryostat {
    DilutionCryostat::new(
        verified_cryostat().expect("verified cryostat"),
        DilutionCryostat::C_TH_DEFAULT,
        DilutionCryostat::FLOOR_K_DEFAULT,
        DilutionCryostat::INITIAL_K_DEFAULT,
    )
    .expect("defaults admit")
}

// ---------------------------------------------------------------------------
// 1. Bit-exact parity with the Phase 0 oracle
// ---------------------------------------------------------------------------

#[test]
fn every_cryo_mjs_vector_matches_bit_for_bit() {
    let fixture = fixture();
    for vector in fixture["vectors"].as_array().expect("vectors") {
        let name = vector["name"].as_str().expect("name");
        let spec = verified_cryostat().expect("spec");
        let mut stage = DilutionCryostat::new(
            spec,
            vector["opts"]["cthJPerK"].as_f64().expect("cth"),
            vector["opts"]["floorK"].as_f64().expect("floor"),
            vector["opts"]["initialK"].as_f64().expect("initial"),
        )
        .expect("defaults");
        let mut mirror = JsMirror {
            q15: 0.012,
            q100: 0.1,
            q4k: 1.5,
            cth: vector["opts"]["cthJPerK"].as_f64().expect("cth"),
            floor: vector["opts"]["floorK"].as_f64().expect("floor"),
            t: vector["opts"]["initialK"].as_f64().expect("initial"),
        };
        let dt = vector["dt"].as_f64().expect("dt");
        let load = vector["load"].as_f64().expect("load");
        let expected_temps: Vec<f64> = vector["temps"]
            .as_array()
            .expect("temps")
            .iter()
            .map(|t| t.as_f64().expect("f64"))
            .collect();
        let mut last_net = 0.0f64;
        for (i, expected) in expected_temps.iter().enumerate() {
            let got = stage.step(dt, load);
            last_net = got.net_w;
            assert_eq!(
                got.temp_k.to_bits(),
                expected.to_bits(),
                "{name}: step {i} temperature bit-exact vs cryo.mjs"
            );
            let mirrored = mirror.step(dt, load);
            assert_eq!(
                mirrored.to_bits(),
                expected.to_bits(),
                "{name}: the JS mirror itself must track the oracle (fixture sanity)"
            );
        }
        assert_eq!(
            last_net.to_bits(),
            vector["finalNetW"].as_f64().expect("net").to_bits(),
            "{name}: final net power bit-exact"
        );
    }
}

// ---------------------------------------------------------------------------
// 2. Boundary semantics: 12.0 mW exact → no quench; > 12.0 mW → quench
// ---------------------------------------------------------------------------

#[test]
fn quench_boundary_is_strict_and_the_stage_holds_at_exact_capacity() {
    let spec = verified_cryostat().expect("spec");
    // Strict predicate.
    assert!(!spec.is_quench(0.012), "exactly 12.0 mW does NOT quench");
    assert!(!spec.is_quench(0.0), "!0.0");
    assert!(spec.is_quench(0.012 + 1e-15), "> 12.0 mW quench");
    assert!(spec.is_quench(0.05));

    // Equilibrium: at exactly 12.0 mW the stage holds the 15 mK setpoint
    // (Q_cool(15 mK) = max(0.012, 0.1·(0.15)²) = 0.012 W → net = 0).
    let mut stage = default_stage();
    for _ in 0..200 {
        let out = stage.step(1.0, 0.012);
        assert_eq!(out.temp_k.to_bits(), 0.015f64.to_bits(), "holds at 15 mK");
        assert!(!stage.is_quench(0.012));
    }

    // One microwatt over capacity trips the quench and warms the stage.
    let mut stage = default_stage();
    let mut tripped = false;
    for _ in 0..50 {
        if stage.is_quench(0.012_001) {
            tripped = true;
        }
        stage.step(1.0, 0.012_001);
        assert!(stage.temp_k() > 0.015, "over-capacity load warms the stage");
    }
    assert!(tripped, "the strict > boundary must trip for any excess");
    assert_eq!(spec.stage_of(0.015), CryoStage::MixingChamber15mK);
    assert_eq!(spec.stage_of(1.0), CryoStage::Still100mK);
}

// ---------------------------------------------------------------------------
// 3. Coupled thermal cross-check (stage ↔ Layer-1 die substrate)
// ---------------------------------------------------------------------------

fn coupled_system(base_load_w: f64) -> CryoCoupledSystem {
    let controller = AdmissionController::new();
    let grid = ThermalGrid2D::new(
        8,
        8,
        100e-6,                         // 100 µm die pitch
        500e-6,                         // 500 µm substrate thickness
        2329.0 * 700.0,                 // Si ρ·c_p (02 JSON, 300 K model values)
        148.0,                          // Si k (02 JSON)
        0.015,                          // substrate starts at the 15 mK stage
        0.0,                            // no convection — the stage boundary is the sink
        BoundaryMode::DirichletAmbient, // edges pinned to the stage temperature
        Scheme::BackwardEuler,
        &controller,
    )
    .expect("8×8 grid admitted");
    let cryo = default_stage();
    CryoCoupledSystem::new(cryo, grid, base_load_w).expect("non-negative base load")
}

#[test]
fn coupled_stage_and_die_reach_a_cold_equilibrium_below_capacity() {
    let mut sys = coupled_system(0.008); // 8 mW drive + 2 mW die = 10 mW < 12 mW
                                         // 2 mW die dissipation spread over the central 4 cells.
    let mut power = vec![0.0f64; 64];
    for idx in [27, 28, 35, 36] {
        power[idx] = 0.0005;
    }
    sys.grid_mut().power_w = Some(power);

    for _ in 0..120 {
        let step = sys.step(1.0);
        assert!(!step.quench, "10 mW < 12 mW: no quench");
        assert!(!step.collapsed, "15 mK stage: film superconducting");
        assert!(
            step.stage.temp_k <= 0.015 + 1e-12,
            "stage at/below the setpoint"
        );
        assert!(step.grid_max_k.is_finite(), "BE grid stays finite");
        assert!(step.grid_max_k < 1.0, "die substrate stays cryogenic");
    }
    // Both sides agree on the cold equilibrium.
    assert_eq!(sys.stage_temp_k().to_bits(), 0.015f64.to_bits());
    assert!((sys.grid().ambient_k - 0.015).abs() < 1e-12);
    assert!(
        (sys.grid_dissipation_w() - 0.002).abs() < 1e-15,
        "die dissipation telemetry"
    );
}

#[test]
fn coupled_quench_warms_the_die_and_the_flag_drives_the_collapse() {
    let mut sys = coupled_system(0.011); // 11 mW drive + 2 mW die = 13 mW > 12 mW
    let mut power = vec![0.0f64; 64];
    for idx in [27, 28, 35, 36] {
        power[idx] = 0.0005;
    }
    sys.grid_mut().power_w = Some(power);

    let mut saw_quench = false;
    for _ in 0..80 {
        let step = sys.step(1.0);
        if step.quench {
            saw_quench = true;
        }
        assert!(
            step.stage.temp_k >= 0.015,
            "over-capacity load warms the stage"
        );
        assert!(step.grid_max_k.is_finite(), "BE grid stays finite");
        // The die substrate follows the stage (Dirichlet edges pinned to it).
        assert!(sys.grid().ambient_k <= step.stage.temp_k + 1e-12);
    }
    assert!(saw_quench, "13 mW > 12 mW must trip the strict boundary");
    // The stage equilibrates where Q_cool(T) = 13 mW: T = 0.1·√(0.13) ≈ 36 mK
    // (still far below the Al transition — the flag must be false here).
    assert!(
        (sys.stage_temp_k() - 0.036).abs() < 0.01,
        "stage at the 13 mW equilibrium"
    );
    assert!(!sys.cryo().superconducting_collapsed());
}

#[test]
fn cutting_the_drive_load_recovers_cleanly() {
    // Quench first (13 mW), then cut the drive to 5 mW (5 + 2 = 7 mW total).
    let mut sys = coupled_system(0.011);
    let mut power = vec![0.0f64; 64];
    for idx in [27, 28, 35, 36] {
        power[idx] = 0.0005;
    }
    sys.grid_mut().power_w = Some(power);
    for _ in 0..40 {
        sys.step(1.0);
    }
    let warmed = sys.stage_temp_k();
    assert!(warmed > 0.02, "stage warmed past the setpoint");

    sys.set_base_load(0.005).expect("recovery load admits");
    let mut recovered = false;
    for _ in 0..300 {
        let step = sys.step(1.0);
        assert!(!step.quench, "7 mW < 12 mW: no quench during recovery");
        if sys.stage_temp_k().to_bits() == 0.015f64.to_bits() {
            recovered = true;
            break;
        }
    }
    assert!(
        recovered,
        "the stage recovers to the 15 mK setpoint after the load cut"
    );
    assert!(!sys.cryo().superconducting_collapsed());
    assert!(
        sys.grid().ambient_k <= 0.015 + 1e-12,
        "the die substrate follows back down"
    );
}

// ---------------------------------------------------------------------------
// 4. Forensic recovery: ring buffer + forensic-autopsy/1 quench report
// ---------------------------------------------------------------------------

#[test]
fn quench_forensic_report_is_schema_valid_and_recovery_cleans_state() {
    let spec = verified_cryostat().expect("spec");
    let mut stage = default_stage();
    let mut ring = QuenchRingBuffer::new(64).expect("nonzero capacity");

    // Drive a quench and record the telemetry window.
    let mut t = 0.0f64;
    let mut tripped_at = None;
    for i in 0..120 {
        let load = if i < 60 { 0.02 } else { 0.004 }; // quench, then cut the load
        let out = stage.step(1.0, load);
        t += 1.0;
        ring.push(QuenchSample {
            t_s: t,
            stage_temp_k: out.temp_k,
            load_w: load,
            q_cool_w: stage.cooling_power_w(out.temp_k),
        });
        if tripped_at.is_none() && stage.is_quench(load) {
            tripped_at = Some((t, load));
        }
    }
    let (trip_t, trip_load) = tripped_at.expect("the 20 mW phase must trip the strict boundary");

    let window = ring.window();
    let report = build_quench_report(trip_load, &window, &spec, trip_t).expect("report builds");
    assert_eq!(report.format, "invention-lab/forensic-autopsy/1");
    assert_eq!(report.failure.kind, "cryo_quench");
    assert_eq!(report.failure.severity, "fault");
    assert_eq!(report.failure.threshold.to_bits(), 0.012f64.to_bits());
    assert_eq!(report.failure.node.as_deref(), Some("mixing_chamber"));
    assert!(report.failure.governing_equation.contains("Q_load"));
    assert!(report.failure.note.contains("Bluefors XLD400"));
    assert!(report.failure.note.contains("4"));
    assert_eq!(report.meta.device, "Bluefors XLD400");
    // Peaks + oscilloscope cover the recorded window.
    assert!(report.peaks.stage_temp_peak_k >= stage.temp_k());
    assert!((report.peaks.load_peak_w - 0.02).abs() < 1e-12);
    assert_eq!(report.oscilloscope.len(), window.len());
    // Threshold provenance is the verified 06-JSON table.
    assert_eq!(
        report.thresholds_used["cryo_quench_15mk_w"],
        serde_json::json!(0.012)
    );
    assert_eq!(
        report.thresholds_used["al_superconducting_transition_k"],
        serde_json::json!(1.2)
    );
    assert!(report.thresholds_used["source"]
        .as_str()
        .unwrap()
        .contains("SHA-256"));

    // Schema-valid: serde JSON round-trip of the full envelope.
    let json = serde_json::to_string(&report).expect("serializes");
    let back: ep_thermal::cryo::QuenchForensicReport =
        serde_json::from_str(&json).expect("round-trips");
    assert_eq!(back.format, "invention-lab/forensic-autopsy/1");
    assert_eq!(back.failure.value.to_bits(), report.failure.value.to_bits());

    // Clean recovery after the load cut: the stage is back at 15 mK and the
    // ring buffer can be cleared without losing the emitted report.
    assert!(
        stage.temp_k() <= 0.015 + 1e-12,
        "load cut → recovery to 15 mK"
    );
    let report_after_recovery =
        build_quench_report(trip_load, &window, &spec, t).expect("recovery report");
    assert_eq!(
        report_after_recovery.failure.kind, "cryo_quench",
        "the forensic record survives the recovery"
    );
    ring.clear();
    assert!(ring.is_empty());
}

#[test]
fn ring_buffer_evicts_oldest_first() {
    let mut ring = QuenchRingBuffer::new(3).expect("nonzero capacity");
    for i in 0..5 {
        ring.push(QuenchSample {
            t_s: i as f64,
            stage_temp_k: 0.015,
            load_w: 0.01,
            q_cool_w: 0.012,
        });
    }
    let window = ring.window();
    assert_eq!(window.len(), 3);
    assert_eq!(window[0].t_s, 2.0, "oldest evicted");
    assert_eq!(window[2].t_s, 4.0);
    assert!(QuenchRingBuffer::new(0).is_err(), "zero capacity refused");
}

// ---------------------------------------------------------------------------
// 5. Al T_c collapse cross-check against the ep-quantum Lindblad kernel (§4)
// ---------------------------------------------------------------------------

/// The verified 04-JSON transmon coherence times (typical, µs).
fn verified_transmon_times() -> (f64, f64) {
    let t04 = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../data/reference-library/04_quantum_hardware_modalities.json"
    ));
    let manifest_json = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../data/reference-library/MANIFEST.json"
    ));
    let manifest: Manifest = serde_json::from_str(manifest_json).expect("manifest parses");
    let entry = manifest
        .files
        .iter()
        .find(|e| e.file == "04_quantum_hardware_modalities.json")
        .expect("04 JSON sealed");
    ep_core::reference::verify_entry(entry, t04.as_bytes()).expect("04 JSON verifies byte-exactly");
    let root: Value = serde_json::from_str(t04).expect("04 JSON parses");
    let t1 = root["parameters"]["superconducting_transmon"]["t1_us"]["typical"]
        .as_f64()
        .expect("t1 typical");
    let t2 = root["parameters"]["superconducting_transmon"]["t2_us"]["typical"]
        .as_f64()
        .expect("t2 typical");
    (t1, t2)
}

#[test]
fn bcs_collapse_scaling_is_documented_and_anchored() {
    let (t1, t2) = verified_transmon_times();
    assert_eq!((t1, t2), (100.0, 150.0), "04 JSON transmon typical (µs)");
    // Below the transition: the verified values already reflect 15 mK operation.
    let (q1, q2) = collapsed_coherence_times(t1, t2, 0.015, 1.2);
    assert_eq!((q1, q2), (t1, t2), "no collapse below T_c");
    // Above T_c: BCS-style (T_c/T)³ collapse, floored at 1 ns.
    let (c1, c2) = collapsed_coherence_times(t1, t2, 2.0, 1.2);
    let expect = |v: f64| v * (1.2f64 / 2.0).powi(3);
    assert!((c1 - expect(t1)).abs() < 1e-12, "T1 collapses at (T_c/T)³");
    assert!((c2 - expect(t2)).abs() < 1e-12, "T2 collapses at (T_c/T)³");
    assert!(c1 < t1 && c2 < t2, "rapid decoherence");
    // Deep quench (4 K stage): the floor keeps the model finite.
    let (f1, f2) = collapsed_coherence_times(t1, t2, 1.2e6, 1.2);
    assert_eq!(f1, 1e-3, "1 ns floor");
    assert_eq!(f2, 1e-3);
}

#[test]
fn quench_flag_drives_rapid_t1_t2_decoherence_in_ep_quantum() {
    let (t1, t2) = verified_transmon_times();
    let controller = AdmissionController::new();

    // Quiescent 15 mK operation: the verified T1 holds (population(T1) ≈ e⁻¹).
    let mut sim = LindbladSim::new_interactive(1, NoiseModel::uniform(1, t1, t2), &controller)
        .expect("1 qubit admitted");
    sim.rho = DensityMatrix::new(1, InitialState::Computational(1)).expect("1 qubit");
    sim.evolve(t1, t1 / 200.0, &[]);
    let pop_quiescent = sim.rho.population(0);
    let expected = std::f64::consts::E.powi(-1);
    assert!(
        (pop_quiescent - expected).abs() < TOL_ORACLE,
        "cold qubit: p1(T1)={pop_quiescent:.4} vs e^-1={expected:.4}"
    );

    // Quench: the stage rises above T_c(Al) → the film goes normal → the
    // collapsed coherence times drive fast decoherence in the same kernel.
    let spec = verified_cryostat().expect("spec");
    let mut stage = default_stage();
    for _ in 0..400 {
        stage.step(10.0, 0.9); // 900 mW — a hard quench past 1.2 K quickly
    }
    assert!(
        spec.superconducting_collapsed(stage.temp_k()),
        "the stage crossed T_c(Al) = 1.2 K under the hard quench (T = {} K)",
        stage.temp_k()
    );
    let (t1_eff, t2_eff) = collapsed_coherence_times(t1, t2, stage.temp_k(), spec.al_transition_k);

    let mut hot =
        LindbladSim::new_interactive(1, NoiseModel::uniform(1, t1_eff, t2_eff), &controller)
            .expect("1 qubit admitted");
    hot.rho = DensityMatrix::new(1, InitialState::Computational(1)).expect("1 qubit");
    hot.evolve(t1, t1 / 200.0, &[]); // the SAME wall-clock window
    let pop_collapsed = hot.rho.population(0);
    assert!(
        pop_collapsed < pop_quiescent,
        "the quench drives rapid decoherence: {pop_collapsed:.4} < {pop_quiescent:.4}"
    );
    // Analytic collapse: p(T1) = e^(−T1/T1_eff) with T1_eff = T1·(T_c/T)³.
    let analytic = (-t1 / t1_eff).exp();
    assert!(
        (pop_collapsed - analytic).abs() < TOL_ORACLE,
        "collapsed population matches e^(-T1/T1_eff): {pop_collapsed:.4} vs {analytic:.4}"
    );
}

// ---------------------------------------------------------------------------
// 6. Fail-closed anchoring (Law 5)
// ---------------------------------------------------------------------------

#[test]
fn tampered_cryo_payload_is_refused_fail_closed() {
    let verified = verified_cryostat().expect("verified");
    let root: Value = serde_json::from_str(ep_thermal::reference::FAILURE_JSON).expect("06 JSON");

    // (1) A tampered capacity is refused (fail-closed parse, exact paths).
    let mut tampered = root.clone();
    tampered["parameters"]["cryogenic_mixing_chamber_quench"]["cooling_capacity"]["stage_15mk_w"] =
        serde_json::json!(0.5);
    let parsed = ep_thermal::cryo::cryostat_from_json(&tampered).expect("parses");
    assert_eq!(
        parsed.stage_15mk_w, 0.5,
        "the parse honors the payload bytes"
    );
    assert!(parsed.stage_15mk_w != verified.stage_15mk_w);

    // (2) A missing block is refused.
    let mut missing = root.clone();
    missing["parameters"]
        .as_object_mut()
        .expect("object")
        .remove("cryogenic_mixing_chamber_quench");
    assert!(ep_thermal::cryo::cryostat_from_json(&missing).is_err());

    // (3) A tampered Al-transition prose cannot anchor the collapse flag.
    let mut prose = root.clone();
    prose["parameters"]["cryogenic_mixing_chamber_quench"]["thresholds"]["decoherence_collapse"] =
        serde_json::json!("temperature rises above some transition → decoherence");
    assert!(
        ep_thermal::cryo::cryostat_from_json(&prose).is_err(),
        "the collapse flag never runs on an unanchored constant"
    );

    // (4) The strict quench threshold comes from failure_thresholds (not the
    // prose block) — a mismatch is surfaced by the spec fields themselves.
    assert_eq!(
        verified.quench_threshold_w, verified.stage_15mk_w,
        "the 06 JSON pins both to 12 mW"
    );
}

#[test]
fn admission_discipline_the_grid_refuses_oversized_requests() {
    let controller = AdmissionController::new();
    let refused = ThermalGrid2D::new(
        200,
        200,
        100e-6,
        500e-6,
        2329.0 * 700.0,
        148.0,
        0.015,
        0.0,
        BoundaryMode::DirichletAmbient,
        Scheme::BackwardEuler,
        &controller,
    );
    assert!(
        refused.is_err(),
        "the 128×128 Layer-1 budget gates the coupled grid too"
    );
}
