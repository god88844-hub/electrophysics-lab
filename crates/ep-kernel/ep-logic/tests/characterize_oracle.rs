//! WP-3.2 acceptance tests — the Layer-1 → Layer-2 characterization feed.
//!
//! Oracles:
//! - the ±5 % ledger gate: arc timing fed into the event simulator vs direct
//!   Layer-1 transistor solves at held-out (load, slew) probes;
//! - the exact 1.95 V SKY130 SOA screen preserved across characterization;
//! - the SHA-256-verified 03/08 reference data behind the Q4 margins;
//! - the custom-ic.schema macro-model contract (±5 %/±10 % tolerances).

use ep_logic::characterize::{
    half_adder_binary_cell, inv1_cell, nand2_cell, noise_margins, q4_level_margins_v, run_arc,
    solve_dc_op, sweep_vtc, worst_leakage_w, CharError, CharacterizationConfig, ForcedNode,
    InputDir, OutDir, TimingLibrary, TransientConfig,
};
use ep_logic::components::{BlockParams, ComponentKind};
use ep_logic::engine::{Block, LogicDiagram, PortRef, Wire};
use ep_logic::radix::Radix;

fn fast_cfg() -> TransientConfig {
    TransientConfig {
        dt_s: 1e-12,
        ..TransientConfig::default()
    }
}

fn grid_cfg() -> CharacterizationConfig {
    CharacterizationConfig {
        loads_ff: vec![2.0, 12.0, 25.0],
        slews_ps: vec![40.0, 70.0, 100.0, 130.0, 160.0],
        cfg: fast_cfg(),
        ..CharacterizationConfig::default()
    }
}

// ---------------------------------------------------------------------------
// Layer-1 vehicle sanity: the half-adder netlist IS a half adder
// ---------------------------------------------------------------------------

#[test]
fn half_adder_transistor_netlist_matches_xor_and_truth_tables() {
    let cell = half_adder_binary_cell();
    let vdd = 1.8;
    for (a, b) in [(0.0, 0.0), (0.0, vdd), (vdd, 0.0), (vdd, vdd)] {
        let mut nl = cell.nl.clone();
        nl.forced = vec![
            ForcedNode::constant(1, vdd),
            ForcedNode::constant(2, a),
            ForcedNode::constant(3, b),
        ];
        let v = solve_dc_op(&nl, &fast_cfg()).expect("ha dc op");
        let sum = v[4];
        let carry = v[5];
        let bit = |x: f64| if x > 0.5 * vdd { 1u8 } else { 0u8 };
        let (ab, bb) = (bit(a), bit(b));
        assert_eq!(bit(sum), ab ^ bb, "sum at a={ab} b={bb}: {sum}");
        assert_eq!(bit(carry), ab & bb, "carry at a={ab} b={bb}: {carry}");
        // Rail-to-rail static outputs (no stuck-at-midpoint defects).
        let out_lo_hi = |x: f64| {
            assert!(
                x < 0.05 || x > vdd - 0.05,
                "static output stuck at midpoint: {x}"
            );
        };
        out_lo_hi(sum);
        out_lo_hi(carry);
    }
}

#[test]
fn nand2_transistor_netlist_matches_nand_truth_table() {
    let cell = nand2_cell();
    let vdd = 1.8;
    for (a, b) in [(0.0, 0.0), (0.0, vdd), (vdd, 0.0), (vdd, vdd)] {
        let mut nl = cell.nl.clone();
        nl.forced = vec![
            ForcedNode::constant(1, vdd),
            ForcedNode::constant(2, a),
            ForcedNode::constant(3, b),
        ];
        let v = solve_dc_op(&nl, &fast_cfg()).expect("nand2 dc op");
        let y = v[4];
        let expected = if a > 0.5 * vdd && b > 0.5 * vdd {
            0.0
        } else {
            vdd
        };
        if expected == 0.0 {
            assert!(y < 0.05, "nand2 y must be low: {y}");
        } else {
            assert!(y > vdd - 0.05, "nand2 y must be high: {y}");
        }
    }
}

// ---------------------------------------------------------------------------
// Arc extraction sanity + SOA preservation
// ---------------------------------------------------------------------------

#[test]
fn inverter_arc_extraction_is_physical() {
    let cell = inv1_cell();
    let cfg = grid_cfg();
    let arc = run_arc(
        &cell,
        2,
        3,
        &[],
        InputDir::Rise,
        10.0,
        80e-12,
        &cfg.corner,
        &fast_cfg(),
    )
    .expect("inv arc");
    // Physical bounds: sub-ns delay, positive slew, positive energy.
    assert!(arc.tpd_s > 0.0 && arc.tpd_s < 500e-12, "tpd {}", arc.tpd_s);
    assert!(
        arc.slew_out_s > 0.0 && arc.slew_out_s < 500e-12,
        "slew {}",
        arc.slew_out_s
    );
    // Single-run delivered energy can be slightly negative on the discharge
    // toggle (Miller charge returns to the rail); the CYCLE energy
    // (charge-up + discharge) is the physical per-toggle switching energy
    // and must land in the C·VDD² band for the 10 fF load.
    let discharge = arc.e_dyn_j;
    let charge = run_arc(
        &cell,
        2,
        3,
        &[],
        InputDir::Fall,
        10.0,
        80e-12,
        &cfg.corner,
        &fast_cfg(),
    )
    .expect("inv arc charge run")
    .e_dyn_j;
    let cycle = discharge + charge;
    let c_v2 = 10e-15 * 1.8 * 1.8;
    assert!(
        cycle > 0.5 * c_v2 && cycle < 2.0 * c_v2,
        "cycle energy {cycle} outside the C·VDD² band [{:.2e}, {:.2e}]",
        0.5 * c_v2,
        2.0 * c_v2
    );
    // Transient SOA telemetry: the peak |Vgs| is recorded and referenced.
    assert!(
        arc.max_vgs_v >= 1.8 && arc.max_vgs_v <= 2.0 * 1.95,
        "peak |Vgs| {}",
        arc.max_vgs_v
    );
    // Load sensitivity (the RC/Elmore dimension): heavier load ⇒ slower.
    let heavy = run_arc(
        &cell,
        2,
        3,
        &[],
        InputDir::Rise,
        25.0,
        80e-12,
        &cfg.corner,
        &fast_cfg(),
    )
    .expect("inv arc heavy");
    assert!(
        heavy.tpd_s > arc.tpd_s * 1.3,
        "delay must grow with load: {} vs {}",
        heavy.tpd_s,
        arc.tpd_s
    );
}

#[test]
fn soa_195v_ceiling_is_screened_on_every_characterization_run() {
    let cell = inv1_cell();
    let cfg = grid_cfg();
    // Nominal VDD = 1.8 V must pass the screen.
    let ok = run_arc(
        &cell,
        2,
        3,
        &[],
        InputDir::Rise,
        10.0,
        80e-12,
        &cfg.corner,
        &fast_cfg(),
    );
    assert!(
        ok.is_ok(),
        "1.8 V arc must pass the 1.95 V SOA screen: {ok:?}"
    );
    // Over-voltage (2.0 V > 1.95 V ceiling) must fail closed with the exact
    // SOA error — the WP-2.2 telemetry preserved end-to-end.
    let over = CharacterizationConfig {
        corner: ep_logic::characterize::OperatingCorner {
            vdd_v: 2.0,
            temp_c: 30.0,
        },
        ..grid_cfg()
    };
    let err = run_arc(
        &cell,
        2,
        3,
        &[],
        InputDir::Rise,
        10.0,
        80e-12,
        &over.corner,
        &fast_cfg(),
    )
    .unwrap_err();
    assert!(
        matches!(err, CharError::SoaViolated { ceiling_v, .. } if ceiling_v == 1.95),
        "{err}"
    );
}

// ---------------------------------------------------------------------------
// Noise margins + leakage
// ---------------------------------------------------------------------------

#[test]
fn noise_margins_and_leakage_are_extracted_from_the_vtc() {
    let cell = inv1_cell();
    let cfg = grid_cfg();
    let curve = sweep_vtc(&cell, 2, 3, &[], &cfg.corner, &fast_cfg(), 180).expect("vtc");
    let (nm_l, nm_h) = noise_margins(&curve).expect("inverter noise margins");
    // Physical bounds: both margins inside the rail, comfortably positive.
    assert!(nm_l > 0.1 && nm_l < 1.8, "NM_L {nm_l}");
    assert!(nm_h > 0.1 && nm_h < 1.8, "NM_H {nm_h}");
    // Static leakage at the worst input state: sub-µW for these devices.
    let leak = worst_leakage_w(&cell, &cfg.corner, &fast_cfg()).expect("leakage");
    assert!((0.0..1e-3).contains(&leak), "leakage {leak} W");
}

// ---------------------------------------------------------------------------
// Q4 margins: verified reference data, not a transistor solve
// ---------------------------------------------------------------------------

#[test]
fn q4_intermediate_margins_come_from_the_verified_reference_data() {
    let margins = q4_level_margins_v();
    assert_eq!(margins.len(), 4, "Q4 levels");
    let bound = Radix::Q4.noise_margin_bound();
    for (k, m) in margins.iter().enumerate() {
        assert!(
            (*m - 0.3).abs() < 1e-9,
            "level {k} margin {m} must equal VDD/(2·(R−1)) = 0.3 V (03/08 verified)"
        );
        assert!(*m >= bound - 1e-9, "level {k} margin below the bound");
    }
}

// ---------------------------------------------------------------------------
// THE ±5 % LEDGER GATE: fed arc timing vs direct Layer-1 solves
// ---------------------------------------------------------------------------

#[test]
fn fed_arc_timing_matches_direct_layer1_solves_within_5pct() {
    let cfg = grid_cfg();
    let lib = TimingLibrary::characterize(&cfg).expect("characterization");

    let check = |cell: &ep_logic::characterize::TransCell,
                 in_node: usize,
                 out_node: usize,
                 static_state: &[(usize, f64)],
                 cell_name: &str,
                 from: &str,
                 to: &str,
                 probes: &[(f64, f64)],
                 dir: InputDir| {
        let arc = lib
            .cells
            .get(cell_name)
            .expect("cell")
            .arcs
            .iter()
            .find(|a| a.from == from && a.to == to)
            .expect("arc");
        for &(pl, ps) in probes {
            let direct = run_arc(
                cell,
                in_node,
                out_node,
                static_state,
                dir,
                pl,
                ps * 1e-12,
                &cfg.corner,
                &fast_cfg(),
            )
            .expect("direct probe solve");
            let fed_dir = direct.dir_out;
            let fed = arc
                .tpd_ps(pl, ps, fed_dir)
                .expect("probe inside the characterized envelope");
            let direct_ps = direct.tpd_s * 1e12;
            let rel = (fed - direct_ps).abs() / direct_ps;
            eprintln!(
                "probe {} {}->{} load={pl}fF slew={ps}ps dir={fed_dir:?}: fed {fed:.2} ps direct {direct_ps:.2} ps rel {rel:.2}%",
                cell_name, from, to
            );
            assert!(
                rel <= 0.05,
                "{cell_name} arc {from}->{to} at load={pl}fF slew={ps}ps: fed {fed:.2} ps vs direct {direct_ps:.2} ps (rel {rel:.3} > 5%)"
            );
        }
    };

    let inv1 = inv1_cell();
    check(
        &inv1,
        2,
        3,
        &[],
        "inv1",
        "a",
        "y",
        &[(7.0, 55.0), (18.0, 145.0), (8.0, 115.0), (18.0, 55.0)],
        InputDir::Rise,
    );
    check(
        &inv1,
        2,
        3,
        &[],
        "inv1",
        "a",
        "y",
        &[(7.0, 55.0), (18.0, 145.0)],
        InputDir::Fall,
    );

    let nand2 = nand2_cell();
    check(
        &nand2,
        2,
        4,
        &[(3, 1.8)],
        "nand2",
        "a",
        "y",
        &[(7.0, 55.0), (18.0, 145.0)],
        InputDir::Rise,
    );
    check(
        &nand2,
        3,
        4,
        &[(2, 1.8)],
        "nand2",
        "b",
        "y",
        &[(7.0, 115.0)],
        InputDir::Rise,
    );

    let ha = half_adder_binary_cell();
    check(
        &ha,
        2,
        4,
        &[(3, 0.0)],
        "half_adder_binary",
        "a",
        "sum",
        &[(7.0, 55.0)],
        InputDir::Rise,
    );
    check(
        &ha,
        2,
        5,
        &[(3, 1.8)],
        "half_adder_binary",
        "a",
        "carry",
        &[(18.0, 145.0)],
        InputDir::Rise,
    );
}

// ---------------------------------------------------------------------------
// TODO 2: the characterized feed drives the event-driven simulator
// ---------------------------------------------------------------------------

#[test]
fn characterized_timing_feeds_the_event_simulator() {
    let cfg = grid_cfg();
    let lib = TimingLibrary::characterize(&cfg).expect("characterization");

    // Characterized params exist for the mapped kinds and carry the
    // characterized delay (1 tick = 1 ps) — never the oracle default.
    let not_params = lib
        .params_for(ComponentKind::Not, 15.0, 100.0)
        .expect("inv1 maps to Not");
    let worst = lib.worst_delay_ps("inv1", 15.0, 100.0).expect("worst arc");
    assert_eq!(
        not_params.delay,
        worst.max(1.0) as u64,
        "fed delay must be the characterized worst-arc ps value"
    );
    assert!(not_params.delay > 0 && not_params.delay < 500, "sane ticks");
    // Uncharacterized kinds keep the oracle default (opt-in feed).
    assert!(lib.params_for(ComponentKind::And, 15.0, 100.0).is_none());
    assert_eq!(
        BlockParams::defaults_for(ComponentKind::And).delay,
        10,
        "oracle default untouched"
    );

    // Diagram: CLOCK → NOT → PROBE with the characterized delay applied.
    let mut d = LogicDiagram {
        radix: Radix::BINARY,
        ..LogicDiagram::default()
    };
    d.blocks.push(Block {
        id: "clk".into(),
        kind: ComponentKind::Clock,
        params: BlockParams::defaults_for(ComponentKind::Clock),
    });
    d.blocks.push(Block {
        id: "inv".into(),
        kind: ComponentKind::Not,
        params: BlockParams::defaults_for(ComponentKind::Not),
    });
    d.blocks.push(Block {
        id: "p".into(),
        kind: ComponentKind::Probe,
        params: BlockParams::defaults_for(ComponentKind::Probe),
    });
    d.wires.push(Wire {
        from: PortRef {
            block: "clk".into(),
            port: "out".into(),
        },
        to: PortRef {
            block: "inv".into(),
            port: "a".into(),
        },
    });
    d.wires.push(Wire {
        from: PortRef {
            block: "inv".into(),
            port: "y".into(),
        },
        to: PortRef {
            block: "p".into(),
            port: "in".into(),
        },
    });
    lib.apply_to_diagram(&mut d, 15.0, 100.0);
    let expected_delay = d.blocks[1].params.delay;

    let opts = ep_logic::engine::RunOptions::default();
    let result = ep_logic::engine::run_logic(&d, opts).expect("run");
    let (_, probe) = result
        .probes
        .iter()
        .find(|(id, _)| id == "p")
        .expect("probe record");
    // The CLOCK toggles at t = 50 (duty·period, 0-delay callbacks); the
    // inverter's characterized-delay output lands at 50 + delay; every
    // half-period transition carries it.
    assert!(
        probe.times.len() >= 3,
        "probe must record the clocked transitions: {:?}",
        probe.times
    );
    assert_eq!(
        probe.times[0],
        50 + expected_delay,
        "first probe transition = clock toggle + characterized arc delay"
    );
    assert_eq!(probe.times[1] - probe.times[0], 50, "half-period spacing");
    // The event stream carries the same schedule into the probe.
    let first_out = result
        .events
        .iter()
        .find_map(|e| match e {
            ep_logic::engine::EventRecord::Input {
                time,
                block_id,
                port_id,
                ..
            } if block_id == "p" && port_id == "in" => Some(*time),
            _ => None,
        })
        .expect("output event into the probe");
    assert_eq!(first_out, 50 + expected_delay);
}

// ---------------------------------------------------------------------------
// Macro-model contract (custom-ic.schema.json: ±5 %/±10 %)
// ---------------------------------------------------------------------------

#[test]
fn macro_model_summary_matches_the_schema_contract() {
    let cfg = grid_cfg();
    let lib = TimingLibrary::characterize(&cfg).expect("characterization");
    let mm = lib.macro_model_summary(15.0, 100.0);
    assert!(!mm.timing_arcs.is_empty());
    for arc in &mm.timing_arcs {
        assert_eq!(arc.tolerance_pct, 5, "schema timing tolerance");
        assert!(
            arc.delay_ns > 0.0 && arc.delay_ns < 1e-6,
            "delay_ns {}",
            arc.delay_ns
        );
    }
    for p in &mm.dynamic_power {
        assert_eq!(p.tolerance_pct, 10, "schema power tolerance");
        assert!(p.watts_per_toggle > 0.0);
    }
    // Every characterized cell appears with its corner provenance.
    assert_eq!(mm.corner, cfg.corner);
    assert!(mm.corner.temp_c == 30.0 && mm.corner.vdd_v == 1.8);
    let cells: Vec<&str> = mm.timing_arcs.iter().map(|a| a.cell.as_str()).collect();
    for expected in [
        "inv1",
        "nand2",
        "half_adder_binary",
        "q4_thresh_det",
        "q4_inv",
        "q4_mux4",
        "q4_half_adder",
    ] {
        assert!(cells.contains(&expected), "missing cell {expected}");
    }
    // Serializes (WP-3.3 packager consumes this payload).
    let json = serde_json::to_string(&mm).expect("serialize macro model");
    assert!(json.contains("\"tolerance_pct\":5"));
}

// ---------------------------------------------------------------------------
// Provenance honesty
// ---------------------------------------------------------------------------

#[test]
fn every_arc_carries_provenance_and_operating_corner() {
    let cfg = grid_cfg();
    let lib = TimingLibrary::characterize(&cfg).expect("characterization");
    for (name, cell) in &lib.cells {
        assert_eq!(cell.provenance.corner, cfg.corner, "{name} corner");
        assert!(!cell.provenance.source.is_empty(), "{name} source");
        for arc in &cell.arcs {
            assert_eq!(arc.provenance.corner, cfg.corner);
            assert!(!arc.provenance.level.is_empty());
        }
        if cell.level == ep_logic::characterize::CharLevel::StageChain {
            // Q4 primitives: the unqualified-candidate caveat must be stated.
            assert!(
                cell.provenance.notes.contains("INSUFFICIENT_MODEL_DATA"),
                "{name} provenance must carry the honesty caveat"
            );
            assert!(cell.q4_level_margins_v.is_some(), "{name} margins");
        } else {
            assert!(cell.nm_v.is_some(), "{name} transistor-level NM");
            assert!(cell.leakage_w.is_some(), "{name} leakage");
        }
    }
    // Q4 arc delays derive from the characterized inverter library (nonzero).
    let q4inv = &lib.cells["q4_inv"];
    let t = q4inv.arcs[0]
        .tpd_ps(15.0, 100.0, OutDir::Hl)
        .expect("q4 inv arc delay");
    assert!(t > 0.0, "stage-chain delay must be positive");
    assert!(
        t > lib.worst_delay_ps("inv1", 15.0, 100.0).unwrap(),
        "6-stage chain is slower than one inverter"
    );
}
