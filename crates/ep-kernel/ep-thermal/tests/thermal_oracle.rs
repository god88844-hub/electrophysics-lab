//! WP-2.3 oracle tests (03 §1.4/§1.5/§5 + PHASE_02 checklist):
//!   1. unconditional stability — no NaN after 200+ steps at Δt far beyond
//!      the FTCS explicit limit (both BE and CN, 2D and 3D),
//!   2. exact energy conservation — insulated edges, h = 0, no sources:
//!      |ΣT_end/ΣT_start − 1| < 1e-9,
//!   3. analytic steady-state convection oracle within ±2 % (§5 CI table),
//!   4. exact threshold tripping (1.95 V / 1085 °C / 260 °C / 200 °C / 12 mW),
//!   5. ep-core admission (≤ 128×128 cells, fail-closed before allocation),
//!   6. Joule R(T) TCR loop + forensic ring buffer / autopsy payload.

use ep_core::admission::AdmissionController;
use ep_thermal::forensics::{build_autopsy, ForensicMeta};
use ep_thermal::pde::{admit_grid_2d, Scheme, ThermalGrid2D, ThermalGrid3D};
use ep_thermal::reference::{verified_thresholds_and_ramp, CopperElectro};
use ep_thermal::{
    evaluate_thresholds, verified_materials, verified_thresholds, BoundaryMode, ForensicRingBuffer,
    SampleRecord, Snapshot, MAX_THERMAL_CELLS,
};

fn admission() -> AdmissionController {
    AdmissionController::new()
}

// ---------------------------------------------------------------------------
// 1. Unconditional stability (no NaN at any Δt — 200+ steps)
// ---------------------------------------------------------------------------

fn ftcs_limit_s(k: f64, rho_c: f64, dx: f64) -> f64 {
    dx * dx / (4.0 * (k / rho_c))
}

/// BE 2D (Dirichlet, Cu material at 1 mm cells): 250 steps at Δt = 1000× the
/// FTCS explicit limit — finite, bounded, monotone toward steady state.
#[test]
fn backward_euler_2d_stable_at_1000x_ftcs_limit() {
    let m = verified_materials().expect("verified 02");
    let dx = 1e-3;
    let limit = ftcs_limit_s(m.copper.k_w_mk, m.copper.rho_c(), dx);
    let dt = limit * 1000.0;
    let mut g = ThermalGrid2D::new(
        48,
        48,
        dx,
        3.5e-5, // 35 µm Cu trace thickness
        m.copper.rho_c(),
        m.copper.k_w_mk,
        300.0,
        0.0,
        BoundaryMode::DirichletAmbient,
        Scheme::BackwardEuler,
        &admission(),
    )
    .expect("48×48 admitted");
    let mut power = vec![0.0; 48 * 48];
    power[24 * 48 + 24] = 0.5; // 0.5 W hotspot
    g.power_w = Some(power);
    for i in 0..250 {
        g.step(dt);
        for t in &g.temp {
            assert!(t.is_finite(), "NaN/inf at step {i}");
            assert!(*t >= 299.0 && *t < 5000.0, "unphysical T {t} at step {i}");
        }
    }
    // Dirichlet edges stay pinned at ambient.
    assert_eq!(g.temp_at(0, 0), 300.0);
}

/// CN 2D (insulated, Si material): 220 steps at Δt = 500× the FTCS limit —
/// finite, exactly conservative (combines stability + conservation oracles).
#[test]
fn crank_nicolson_2d_stable_and_exactly_conservative() {
    let m = verified_materials().expect("verified 02");
    let dx = 2e-3;
    let limit = ftcs_limit_s(m.silicon.k_w_mk, m.silicon.rho_c(), dx);
    let dt = limit * 500.0;
    let mut g = ThermalGrid2D::new(
        16,
        16,
        dx,
        5e-4,
        m.silicon.rho_c(),
        m.silicon.k_w_mk,
        300.0,
        0.0,
        BoundaryMode::Insulated,
        Scheme::CrankNicolson,
        &admission(),
    )
    .expect("16×16 admitted");
    // Hot center cell (energy injected once, then conserved).
    g.temp[8 * 16 + 8] = 400.0;
    let e0 = g.total_energy_j();
    for i in 0..220 {
        g.step(dt);
        for t in &g.temp {
            assert!(t.is_finite(), "NaN/inf at step {i}");
        }
        let e = g.total_energy_j();
        assert!(
            (e / e0 - 1.0).abs() < 1e-9,
            "CN energy drift at step {i}: {}",
            e / e0 - 1.0
        );
    }
    // The initial hot spot diffuses outward: max temperature must decrease
    // monotonically toward the mean (uniform 300 + injected).
    let mean = e0 / (m.silicon.rho_c() * dx * dx * 5e-4 * 16.0 * 16.0);
    assert!(g.max_temp() < 400.0 && g.max_temp() > mean);
}

/// BE 2D insulated: 300 steps at Δt = 2000× limit — exact energy conservation
/// (< 1e-9, §1.4 acceptance) + no NaN.
#[test]
fn backward_euler_2d_energy_conservation_insulated() {
    let m = verified_materials().expect("verified 02");
    let dx = 1e-3;
    let dt = ftcs_limit_s(m.copper.k_w_mk, m.copper.rho_c(), dx) * 2000.0;
    let mut g = ThermalGrid2D::new(
        24,
        24,
        dx,
        3.5e-5,
        m.copper.rho_c(),
        m.copper.k_w_mk,
        300.0,
        0.0, // h = 0
        BoundaryMode::Insulated,
        Scheme::BackwardEuler,
        &admission(),
    )
    .expect("24×24 admitted");
    g.temp[12 * 24 + 12] = 800.0; // hot spot
    g.temp[3 * 24 + 20] = 350.0;
    let e0 = g.total_energy_j();
    for i in 0..300 {
        g.step(dt);
        assert!(g.temp.iter().all(|t| t.is_finite()), "NaN at step {i}");
        let e = g.total_energy_j();
        assert!(
            (e / e0 - 1.0).abs() < 1e-9,
            "BE energy drift at step {i}: {}",
            e / e0 - 1.0
        );
    }
}

/// BE 3D insulated (8×8×8 Si): 200 steps at Δt = 1000× limit — no NaN +
/// exact conservation in 3D.
#[test]
fn backward_euler_3d_stable_and_exactly_conservative() {
    let m = verified_materials().expect("verified 02");
    let dx = 2e-3;
    let dt = ftcs_limit_s(m.silicon.k_w_mk, m.silicon.rho_c(), dx) * 1000.0;
    let mut g = ThermalGrid3D::new(
        8,
        8,
        8,
        dx,
        m.silicon.rho_c(),
        m.silicon.k_w_mk,
        300.0,
        0.0,
        BoundaryMode::Insulated,
        Scheme::BackwardEuler,
        &admission(),
    )
    .expect("8×8×8 admitted");
    g.temp[(4 * 8 + 4) * 8 + 4] = 600.0;
    let e0 = g.total_energy_j();
    for i in 0..200 {
        g.step(dt);
        assert!(g.temp.iter().all(|t| t.is_finite()), "NaN at step {i}");
        let e = g.total_energy_j();
        assert!((e / e0 - 1.0).abs() < 1e-9, "3D drift at step {i}");
    }
}

// ---------------------------------------------------------------------------
// 2. Analytic steady-state convection oracle (±2 % — §5 CI table)
// ---------------------------------------------------------------------------

/// Single-cell lumped solution: `ρc·dT/dt = P − h·(T − T_amb)` →
/// `T_ss = T_amb + P/h` exactly (§5 "analytic single-cell convection").
#[test]
fn analytic_single_cell_convection_steady_state_be() {
    let m = verified_materials().expect("verified 02");
    // 1×1 insulated grid (no conduction neighbors) with convection + source.
    let dx = 1e-3;
    let t_thick = 3.5e-5;
    let h = 500.0; // W/(m²·K)
    let power = 0.2; // W
    let mut g = ThermalGrid2D::new(
        1,
        1,
        dx,
        t_thick,
        m.fr4.rho_c(),
        m.fr4.k_w_mk,
        300.0,
        h,
        BoundaryMode::Insulated,
        Scheme::BackwardEuler,
        &admission(),
    )
    .expect("1×1 admitted");
    g.power_w = Some(vec![power]);
    let exact = 300.0 + power / (h * dx * dx);
    let mut last_err = f64::INFINITY;
    for _ in 0..4000 {
        g.step(0.01); // far beyond any explicit bound — implicit stability
        last_err = (g.temp_at(0, 0) / exact - 1.0).abs();
    }
    assert!(
        last_err < 0.02,
        "steady state {} vs analytic {} (err {:.4} %)",
        g.temp_at(0, 0),
        exact,
        last_err * 100.0
    );
}

/// Same oracle through Crank–Nicolson (steady state is scheme-independent).
#[test]
fn analytic_single_cell_convection_steady_state_cn() {
    let m = verified_materials().expect("verified 02");
    let dx = 1e-3;
    let h = 250.0;
    let power = 0.05;
    let mut g = ThermalGrid2D::new(
        1,
        1,
        dx,
        1.6e-3, // FR-4 board slab
        m.fr4.rho_c(),
        m.fr4.k_w_mk,
        300.0,
        h,
        BoundaryMode::Insulated,
        Scheme::CrankNicolson,
        &admission(),
    )
    .expect("1×1 admitted");
    g.power_w = Some(vec![power]);
    let exact = 300.0 + power / (h * dx * dx);
    for _ in 0..3000 {
        g.step(0.02);
    }
    let err = (g.temp_at(0, 0) / exact - 1.0).abs();
    assert!(
        err < 0.02,
        "CN steady state {} vs {} (err {:.4} %)",
        g.temp_at(0, 0),
        exact,
        err * 100.0
    );
}

/// 2D Dirichlet slab steady state: with a uniform source row the interior
/// converges to the conduction solution — sanity vs the lumped cell: the
/// hotspot cell sits above ambient and the edges stay pinned.
#[test]
fn dirichlet_2d_reaches_bounded_steady_state() {
    let m = verified_materials().expect("verified 02");
    let mut g = ThermalGrid2D::new(
        16,
        16,
        1e-3,
        3.5e-5,
        m.copper.rho_c(),
        m.copper.k_w_mk,
        300.0,
        0.0,
        BoundaryMode::DirichletAmbient,
        Scheme::BackwardEuler,
        &admission(),
    )
    .expect("16×16 admitted");
    let mut power = vec![0.0; 16 * 16];
    power[8 * 16 + 8] = 0.05;
    g.power_w = Some(power);
    for _ in 0..4000 {
        g.step(0.005);
    }
    // Edges pinned, interior elevated, steady (no drift over 100 more steps).
    assert_eq!(g.temp_at(0, 8), 300.0);
    let t_mid = g.temp_at(8, 8);
    assert!(t_mid > 300.5, "hotspot must rise above ambient: {t_mid}");
    let before = g.temp_at(8, 8);
    for _ in 0..100 {
        g.step(0.005);
    }
    assert!((g.temp_at(8, 8) - before).abs() < 1e-6, "not converged");
}

// ---------------------------------------------------------------------------
// 3. Exact threshold tripping (§1.5, 06 JSON)
// ---------------------------------------------------------------------------

#[test]
fn thresholds_trip_exactly_at_sealed_values() {
    let t = verified_thresholds().expect("verified 06");
    assert_eq!(t.vgs_threshold_v, 1.95);
    assert_eq!(t.cu_melting_c, 1085.0);
    assert_eq!(t.fr4_delamination_c, 260.0);
    assert_eq!(t.si_thermal_runaway_c, 200.0);
    assert_eq!(t.cryo_quench_15mk_w, 0.012);

    // Vgs: STRICT > 1.95 V (exactly at the ceiling → no event).
    let snap = Snapshot {
        vgs_max_v: Some(1.95),
        ..Default::default()
    };
    assert!(
        evaluate_thresholds(&snap, &t).is_empty(),
        "1.95 exactly must NOT trip"
    );
    let events = evaluate_thresholds(
        &Snapshot {
            vgs_max_v: Some(1.950001),
            ..Default::default()
        },
        &t,
    );
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].kind, "gate_oxide_breakdown");
    assert_eq!(events[0].severity, ep_thermal::Severity::Fault);
    assert!(events[0].equation.contains("γ ≈ 300 dec/V"));

    // Trace fusing: ≥ 1085 °C trips; below does not.
    let snap = Snapshot {
        trace_temp_c: Some(1084.999),
        ..Default::default()
    };
    assert!(evaluate_thresholds(&snap, &t).is_empty());
    let events = evaluate_thresholds(
        &Snapshot {
            trace_temp_c: Some(1085.0),
            ..Default::default()
        },
        &t,
    );
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].kind, "trace_fusing");

    // FR-4 delamination: ≥ 260 °C (the verified value, not the 400 °C draft).
    let events = evaluate_thresholds(
        &Snapshot {
            trace_temp_c: Some(100.0),
            pcb_temp_c: Some(260.0),
            ..Default::default()
        },
        &t,
    );
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].kind, "pcb_delamination");

    // Si runaway: ≥ 200 °C, severity warn.
    let events = evaluate_thresholds(
        &Snapshot {
            trace_temp_c: Some(100.0),
            pcb_temp_c: Some(150.0),
            junction_temp_c: Some(200.0),
            ..Default::default()
        },
        &t,
    );
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].kind, "si_thermal_runaway");
    assert_eq!(events[0].severity, ep_thermal::Severity::Warn);

    // Cryo quench: STRICT > 12 mW.
    let snap = Snapshot {
        drive_load_w: Some(0.012),
        ..Default::default()
    };
    assert!(
        evaluate_thresholds(&snap, &t).is_empty(),
        "12 mW exactly must NOT trip"
    );
    let events = evaluate_thresholds(
        &Snapshot {
            drive_load_w: Some(0.0120001),
            ..Default::default()
        },
        &t,
    );
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].kind, "cryo_quench");

    // else-if chain: trace ≥ 1085 masks the FR-4/Si events.
    let events = evaluate_thresholds(
        &Snapshot {
            trace_temp_c: Some(1100.0),
            pcb_temp_c: Some(300.0),
            junction_temp_c: Some(250.0),
            ..Default::default()
        },
        &t,
    );
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].kind, "trace_fusing");
}

// ---------------------------------------------------------------------------
// 4. ep-core admission (≤ 128×128 cells, fail-closed before allocation)
// ---------------------------------------------------------------------------

#[test]
fn thermal_grid_admission_is_fail_closed() {
    let c = admission();
    // 128×128 admitted (the exact budget edge).
    assert!(admit_grid_2d(&c, 128, 128).admitted);
    // 129×129 refused with the ep-core-authored reason.
    let d = admit_grid_2d(&c, 129, 129);
    assert!(!d.admitted);
    assert!(d.reason.contains("129×129 > 128×128"), "{}", d.reason);
    // The grid constructor refuses BEFORE allocating (Err, no state).
    let refused = ThermalGrid2D::new(
        200,
        200,
        1e-3,
        1e-3,
        1.0,
        1.0,
        300.0,
        0.0,
        BoundaryMode::Insulated,
        Scheme::BackwardEuler,
        &c,
    );
    assert!(refused.is_err());
    // 3D budget: total cells vs 128×128 = 16384.
    assert!(ep_thermal::admit_grid_3d(&c, 16, 16, 16).admitted); // 4096 cells
    let d = ep_thermal::admit_grid_3d(&c, 40, 40, 40);
    assert!(!d.admitted, "64000 cells must exceed the 16384-cell budget");
    assert!(d.reason.contains("64000 cells > 16384"), "{}", d.reason);
    assert_eq!(MAX_THERMAL_CELLS, 16384);
    // Zero extents refused.
    assert!(!admit_grid_2d(&c, 0, 10).admitted);
    assert!(!ep_thermal::admit_grid_3d(&c, 0, 4, 4).admitted);
}

// ---------------------------------------------------------------------------
// 5. Joule R(T) TCR loop (WP-2.1 branch-current coupling)
// ---------------------------------------------------------------------------

/// A constant current through a Cu trace heats it to the Joule steady state;
/// the TCR loop raises ρ(T) (and thus P) with temperature — the final steady
/// state must sit ABOVE the cold-resistance estimate (proving the loop).
#[test]
fn joule_tcr_loop_reaches_self_consistent_steady_state() {
    let m = verified_materials().expect("verified 02");
    let copper: CopperElectro = m.copper_electro;
    // Trace segment per cell: 1 mm long, 1e-10 m² cross-section.
    let (area, length) = (1e-10, 1e-3);
    let dx = 1e-3;
    let h = 5000.0;
    let mut g = ThermalGrid2D::new(
        1,
        1,
        dx,
        3.5e-5,
        m.copper.rho_c(),
        m.copper.k_w_mk,
        300.0,
        h,
        BoundaryMode::Insulated,
        Scheme::BackwardEuler,
        &admission(),
    )
    .expect("1×1 admitted");
    let current = 0.5; // A
    g.set_joule_currents(vec![current], area, length, &copper);
    for _ in 0..6000 {
        g.step(0.005);
    }
    let t_ss = g.temp_at(0, 0);
    // Cold-resistance power: P_cold = I²·ρ₀·L/A.
    let p_cold = current * current * copper.resistivity_at(300.0) * length / area;
    let t_cold_estimate = 300.0 + p_cold / (h * dx * dx);
    // With the TCR loop the real steady EXCESS is hotter than the cold
    // estimate (the absolute-temperature ratio barely moves).
    assert!(
        (t_ss - 300.0) > 1.02 * (t_cold_estimate - 300.0),
        "TCR loop must raise the steady excess: {} vs cold {}",
        t_ss - 300.0,
        t_cold_estimate - 300.0
    );
    // And the analytic self-consistent point: T = 300 + I²ρ₀(1+α(T−T₀))L/(A·h·dx²).
    let cap = h * dx * dx;
    let t_analytic = (300.0
        + (current
            * current
            * copper.resistivity_ohm_m_300k
            * (1.0 - copper.tcr_per_k * copper.ref_k)
            * length
            / area)
            / cap)
        / (1.0
            - current * current * copper.resistivity_ohm_m_300k * copper.tcr_per_k * length
                / (area * cap));
    assert!(
        (t_ss / t_analytic - 1.0).abs() < 0.02,
        "steady {t_ss} vs self-consistent analytic {t_analytic}"
    );
    assert!(t_ss < 1085.0, "below Cu melting for this drive");
}

// ---------------------------------------------------------------------------
// 6. Forensic ring buffer + autopsy payload (invention-lab/forensic-autopsy/1)
// ---------------------------------------------------------------------------

#[test]
fn forensic_ring_buffer_evicts_oldest_and_autopsy_carries_provenance() {
    let t = verified_thresholds().expect("verified 06");
    let mut ring = ForensicRingBuffer::new(32);
    for i in 0..100u32 {
        let mut temps = std::collections::BTreeMap::new();
        temps.insert("traceC".to_string(), 25.0 + f64::from(i));
        let mut currents = std::collections::BTreeMap::new();
        currents.insert("VDD".to_string(), 0.5);
        ring.push(SampleRecord {
            t: f64::from(i) * 0.001,
            vdd: 1.8,
            vgs_max: 1.2,
            i_max: 0.5,
            temp_max_c: 25.0 + f64::from(i),
            nodes: std::collections::BTreeMap::new(),
            currents,
            temps,
        });
    }
    assert_eq!(ring.len(), 32, "ring capacity enforced");
    let window = ring.window();
    assert!(
        (window[0].t - 0.068).abs() < 1e-12,
        "oldest evicted: {}",
        window[0].t
    );
    assert!((window[31].t - 0.099).abs() < 1e-12);
    // Trip the trace-fusing threshold and build the autopsy.
    let events = evaluate_thresholds(
        &Snapshot {
            trace_temp_c: Some(1085.0),
            trace_node: Some("VDD"),
            ..Default::default()
        },
        &t,
    );
    assert_eq!(events.len(), 1);
    let table_json = serde_json::json!({
        "vgs_threshold_v": t.vgs_threshold_v,
        "cu_melting_c": t.cu_melting_c,
        "fr4_delamination_c": t.fr4_delamination_c,
        "si_thermal_runaway_c": t.si_thermal_runaway_c,
        "cryo_quench_15mk_w": t.cryo_quench_15mk_w,
    });
    let report = build_autopsy(
        &events[0],
        &window,
        &table_json,
        ForensicMeta {
            sim_time_s: 0.099,
            playback_scale: Some(0.1),
            git_sha: None,
            dataset_sha256: Some("sealed".into()),
            generated_at: Some("kernel-deterministic".into()),
        },
    );
    assert_eq!(report.format, "invention-lab/forensic-autopsy/1");
    assert_eq!(report.failure.kind, "trace_fusing");
    assert_eq!(report.failure.node.as_deref(), Some("VDD"));
    assert_eq!(report.peaks.temp_c, Some(124.0)); // 25 + 99 (last 32 samples: i = 68..99)
    assert_eq!(report.oscilloscope.len(), 32);
    assert_eq!(report.oscilloscope[0].trace_c, Some(93.0)); // 25 + 68
    assert_eq!(report.meta.dataset_sha256.as_deref(), Some("sealed"));
    // Payload round-trips through JSON (serde contract).
    let json = serde_json::to_string(&report).expect("serialize");
    let v: serde_json::Value = serde_json::from_str(&json).expect("valid JSON");
    assert_eq!(v["format"], "invention-lab/forensic-autopsy/1");
    assert!(v["failure"]["governingEquation"]
        .as_str()
        .unwrap()
        .contains("Onderdonk"));
    assert!(v["thresholdsUsed"]["cu_melting_c"].as_f64().unwrap() == 1085.0);
}

// ---------------------------------------------------------------------------
// 7. Blackbody RGB ramp (06 JSON stops, piecewise-linear)
// ---------------------------------------------------------------------------

#[test]
fn blackbody_ramp_matches_verified_stops() {
    let (t, ramp) = verified_thresholds_and_ramp().expect("verified 06");
    assert_eq!(t.cu_melting_c, 1085.0);
    let stops = ramp.stops();
    assert_eq!(stops.len(), 7, "300..2500 K stops from the 06 JSON");
    assert_eq!(stops[0].t_k, 300.0);
    assert_eq!(stops[0].rgb, [0, 0, 0]);
    assert_eq!(stops[3].t_k, 1000.0);
    assert_eq!(stops[3].rgb, [255, 40, 0]);
    assert_eq!(stops[6].t_k, 2500.0);
    assert_eq!(stops[6].rgb, [255, 225, 155]);
    // Piecewise-linear interpolation: 875 K = midpoint of (750, 1000).
    let mid = ramp.rgb_at(875.0);
    assert_eq!(mid, [204, 20, 0]); // (153+255)/2, (0+40)/2, 0
                                   // Clamp below/above the verified range.
    assert_eq!(ramp.rgb_at(1.0), [0, 0, 0]);
    assert_eq!(ramp.rgb_at(5000.0), [255, 225, 155]);
    // Normalized shader uniform path.
    let n = ramp.rgb_normalized(1000.0);
    assert!((n[0] - 1.0).abs() < 1e-9 && (n[1] - 40.0 / 255.0).abs() < 1e-9);
    // The free-function path reads the embedded verified JSON.
    assert_eq!(
        ep_thermal::blackbody_rgb(1000.0).expect("embedded ramp"),
        [255, 40, 0]
    );
}
