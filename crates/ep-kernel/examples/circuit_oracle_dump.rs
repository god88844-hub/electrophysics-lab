//! WP-2.4 — read-only oracle dump example: the `ep-circuit` DC solve of the
//! 10-case differential suite, emitted as JSON on stdout.
//!
//! The `scripts/v4-oracles/ngspice-differential.mjs` harness builds one
//! ngspice batch deck per case **from this dump's own netlist descriptions**
//! (never from a parallel hardcoded copy), runs live `ngspice -b`, parses the
//! operating-point output and asserts the
//! `03_PHYSICS_MATH_FUNDAMENTALS.md` §5 CI Oracle Calibration tolerances:
//! node voltages **±1e-6 V**, branch currents **±1e-9 A**, KCL residual and
//! device-power conservation **< 1e-9**.
//!
//! Device physics parity: the suite's MOSFETs are Shichman–Hodges square-law
//! (`03 §1.2` — the WP-2.1 parity model) which ngspice reproduces exactly
//! with `LEVEL=1` model cards at `KP = ep-circuit kp`, `VTO = vth`,
//! `LAMBDA = lambda`, `W = L = 1 µm` (β = KP·W/L folds into KP identically).
//! BSIM-characterized devices (WP-2.2 tables) are deliberately NOT part of
//! this suite — interpolated tables vs ngspice's analytic BSIM4 cannot meet
//! the ±1e-6 V calibration tolerance, and faking it would violate Law 5.
//!
//! The 10 cases (PHASE_02 WP-2.4: "divider, inverter, cascade, RC,
//! breakdown bias point…"):
//! 1. `divider` — 10 V / 1 k / 2 k voltage divider
//! 2. `divider-loaded` — loaded divider (12 V, three resistors)
//! 3. `ladder-4node` — 4-node resistive ladder with 2 k shunts
//! 4. `current-source` — 1 mA source into a 2 k ∥ 3 k parallel pair
//! 5. `dual-source` — two voltage sources, three resistors, one mid node
//! 6. `inverter` — CMOS inverter DC transfer bias at V_in = 0.9 V
//! 7. `inverter-cascade` — two CMOS inverter stages chained
//! 8. `rc-bleed-bias` — RC network DC bias point (capacitor is DC-open,
//!    present in the ngspice deck only, explicitly described as deck-only)
//! 9. `breakdown-bias` — NMOS with the permanent oxide-breakdown fault
//!    (`gate_shorted`, gate tied to source through 100 Ω) under a 10 k load
//! 10. `bridge` — unbalanced Wheatstone bridge with a 1 k bridge element (6 nodes)
//!
//! The example is strictly read-only: it writes nothing to disk, mutates no
//! state, touches no network. Provenance of every emitted number:
//! [`ep_core::ProvenanceBadge::SimulatedArchitecturalModel`].
//!
//! Usage: `cargo run --locked -p ep-kernel --example circuit_oracle_dump`

use ep_circuit::{
    kcl_max_residual, operating_point, solve_dc, ElementKind, MosfetParams, MosfetType, Netlist,
    SolveOptions,
};
use ep_core::admission::AdmissionController;
use ep_core::ProvenanceBadge;
use serde_json::{json, Value};

/// W/L folding — the square-law path folds geometry into `kp`, so the
/// ngspice `LEVEL=1` cards use W = L = 1 µm (β = KP·W/L = KP exactly).
const W_L_UM: f64 = 1.0;

/// Square-law N device (03 §1.2 shape).
fn nmos(vth: f64, kp: f64, lambda: f64) -> MosfetParams {
    MosfetParams::square_law(MosfetType::N, vth, kp, lambda)
}

/// Square-law P device (signed vth per the SKY130A reference convention).
fn pmos(vth: f64, kp: f64, lambda: f64) -> MosfetParams {
    MosfetParams::square_law(MosfetType::P, vth, kp, lambda)
}

/// Serialize one solved case: the machine-readable netlist description the
/// harness turns into an ngspice deck, the ep-circuit operating point, and
/// the fail-closed conservation oracles (03 §1.2).
fn dump_case(id: &str, title: &str, description: &str, netlist: &Netlist) -> Value {
    // The §5 calibration tolerance is ±1e-6 V — cascaded stages amplify the
    // converged-point difference by the stage gain. Two system-level choices
    // make ep-circuit and ngspice solve the EXACT same system (the parity is
    // then limited only by solver arithmetic, ~1e-11 V):
    //  - `gmin = 0`: ep-circuit's default folds a 1e-12 S node-to-ground
    //    leakage into its residual; ngspice's LEVEL=1 cards have no junction
    //    diodes, so ngspice has no such shunt (its gmin is inapplicable).
    //  - `tolerance = 1e-14`: an order tighter than the 1e-9 default, so the
    //    converged point is exact to ~1e-12 V.
    let opts = SolveOptions {
        max_newton_steps: 100,
        tolerance: 1e-14,
        gmin: 0.0,
        ..SolveOptions::default()
    };
    let result =
        solve_dc(netlist, &opts, &AdmissionController::new()).unwrap_or_else(|e| panic!("case {id} must solve: {e:?}"));
    assert!(
        result.converged,
        "case {id} must converge (Newton ‖F‖∞ < 1e-9)"
    );
    let kcl = kcl_max_residual(netlist, &result);
    let power_sum: f64 = result.device_power.values().sum();

    let nodes: Vec<Value> = netlist
        .node_names
        .iter()
        .enumerate()
        .map(|(i, name)| {
            json!({
                "name": name,
                "ground": i == 0,
                "voltage": result.node_voltages[i],
            })
        })
        .collect();
    let node_voltages: Value = netlist
        .node_names
        .iter()
        .enumerate()
        .filter(|(i, _)| *i != 0)
        .map(|(i, name)| (name.clone(), json!(result.node_voltages[i])))
        .collect::<serde_json::Map<String, Value>>()
        .into();

    let mut elements = Vec::new();
    for e in &netlist.elements {
        let node_names: Vec<String> = e
            .nodes
            .iter()
            .map(|&idx| netlist.node_names[idx].clone())
            .collect();
        let element = match e.kind {
            ElementKind::Resistor => json!({
                "kind": "R",
                "label": e.label,
                "nodes": [node_names[0], node_names[1]],
                "r": e.r,
            }),
            ElementKind::VSource => json!({
                "kind": "V",
                "label": e.label,
                "nodes": [node_names[0], node_names[1]],
                "v": e.v,
                "branchCurrent": result.device_currents.get(&e.label).copied(),
            }),
            ElementKind::ISource => json!({
                "kind": "I",
                "label": e.label,
                "nodes": [node_names[0], node_names[1]],
                "i": e.i,
            }),
            ElementKind::Mosfet => {
                let q = e.mosfet.as_ref().expect("mosfet params");
                let op = operating_point(
                    q,
                    result.node_voltages[e.nodes[0]],
                    result.node_voltages[e.nodes[1]],
                    result.node_voltages[e.nodes[2]],
                );
                json!({
                    "kind": "M",
                    "label": e.label,
                    "nodes": [node_names[0], node_names[1], node_names[2]],
                    "type": if q.mosfet_type == MosfetType::N { "N" } else { "P" },
                    "vth": q.vth,
                    "kp": q.kp,
                    "lambda": q.lambda,
                    "model": "shichman-hodges",
                    "gateShorted": e.gate_shorted,
                    "gateShortR": if e.gate_shorted { e.gate_short_r } else { 0.0 },
                    "deviceCurrentA": op.i,
                    "inIsDrain": op.in_is_drain,
                })
            }
        };
        elements.push(element);
    }

    let device_currents: Value = result
        .device_currents
        .iter()
        .map(|(k, v)| (k.clone(), json!(v)))
        .collect::<serde_json::Map<String, Value>>()
        .into();
    let _ = &result; // per-element currents/voltages above feed the harness's independent conservation oracles
    let device_power: Value = result
        .device_power
        .iter()
        .map(|(k, v)| (k.clone(), json!(v)))
        .collect::<serde_json::Map<String, Value>>()
        .into();

    json!({
        "id": id,
        "title": title,
        "description": description,
        "netlist": {
            "nodes": nodes,
            "elements": elements,
        },
        "solver": {
            "converged": result.converged,
            "iterations": result.iterations,
            "escalated": result.escalated,
            "residualNorm": result.residual_norm,
        },
        "nodeVoltages": node_voltages,
        "deviceCurrents": device_currents,
        "devicePower": device_power,
        "kclMaxResidualA": kcl,
        "powerSumW": power_sum,
    })
}

/// Deck-only elements (present in the ngspice deck, DC-inert in ep-circuit —
/// explicitly described, never silently mixed into the solve).
fn deck_only_rc() -> Value {
    json!([{
        "kind": "C",
        "label": "C1",
        "nodes": ["n1", "0"],
        "c": 1e-9,
        "note": "capacitor is DC-open: identical DC operating point with or without it",
    }])
}

fn main() {
    let mut cases = Vec::new();

    // 1. divider — 10 V / 1 k / 2 k.
    let mut nl = Netlist::new(&["0", "src", "mid"]);
    nl.add_v_source("src", "0", 10.0, "V1");
    nl.add_resistor("src", "mid", 1000.0, "R1");
    nl.add_resistor("mid", "0", 2000.0, "R2");
    cases.push(dump_case(
        "divider",
        "Voltage divider",
        "V1 10 V; R1 1 kΩ src→mid; R2 2 kΩ mid→0. V(mid) = 10·2/3.",
        &nl,
    ));

    // 2. divider-loaded — 12 V with a 3 k load on a 1 k / 3 k divider.
    let mut nl = Netlist::new(&["0", "src", "mid"]);
    nl.add_v_source("src", "0", 12.0, "V1");
    nl.add_resistor("src", "mid", 1000.0, "R1");
    nl.add_resistor("mid", "0", 3000.0, "R2");
    nl.add_resistor("mid", "0", 3000.0, "Rload");
    cases.push(dump_case(
        "divider-loaded",
        "Loaded voltage divider",
        "V1 12 V; R1 1 kΩ; R2 3 kΩ ∥ Rload 3 kΩ. V(mid) = 12·1.5/2.5 = 7.2 V.",
        &nl,
    ));

    // 3. ladder-4node — 4-node resistive ladder with 2 k shunts.
    let mut nl = Netlist::new(&["0", "src", "n1", "n2", "n3", "n4"]);
    nl.add_v_source("src", "0", 10.0, "V1");
    nl.add_resistor("src", "n1", 1000.0, "Rs");
    for (i, (a, b)) in [("n1", "n2"), ("n2", "n3"), ("n3", "n4")]
        .iter()
        .enumerate()
    {
        nl.add_resistor(a, b, 1000.0, &format!("R{i}"));
    }
    nl.add_resistor("n4", "0", 2000.0, "Rterm");
    for (i, node) in ["n1", "n2", "n3", "n4"].iter().enumerate() {
        nl.add_resistor(node, "0", 2000.0, &format!("Rshunt{i}"));
    }
    cases.push(dump_case(
        "ladder-4node",
        "4-node resistive ladder",
        "V1 10 V; series 1 kΩ chain src→n1→n2→n3→n4→(2 kΩ term); 2 kΩ shunt at every node.",
        &nl,
    ));

    // 4. current-source — 1 mA into 2 k ∥ 3 k.
    let mut nl = Netlist::new(&["0", "n1"]);
    nl.add_i_source("n1", "0", 1e-3, "I1");
    nl.add_resistor("n1", "0", 2000.0, "R1");
    nl.add_resistor("n1", "0", 3000.0, "R2");
    cases.push(dump_case(
        "current-source",
        "Current source into parallel resistors",
        "I1 1 mA (leaves n1); R1 2 kΩ ∥ R2 3 kΩ. V(n1) = 1 mA × 1.2 kΩ = 1.2 V.",
        &nl,
    ));

    // 5. dual-source — two voltage sources, three resistors.
    let mut nl = Netlist::new(&["0", "srcA", "srcB", "mid"]);
    nl.add_v_source("srcA", "0", 10.0, "V1");
    nl.add_v_source("0", "srcB", 5.0, "V2");
    nl.add_resistor("srcA", "mid", 1000.0, "R1");
    nl.add_resistor("mid", "srcB", 2000.0, "R2");
    nl.add_resistor("mid", "0", 500.0, "R3");
    cases.push(dump_case(
        "dual-source",
        "Dual-source resistor network",
        "V1 10 V (srcA), V2 5 V (srcB, reversed polarity), 1 k / 2 k / 500 Ω network on mid.",
        &nl,
    ));

    // 6. inverter — CMOS inverter DC bias at V_in = 0.9 V.
    let mut nl = Netlist::new(&["0", "vdd", "vin", "out"]);
    nl.add_v_source("vdd", "0", 1.8, "VDD");
    nl.add_v_source("vin", "0", 0.9, "VIN");
    nl.add_mosfet("Mp", "vin", "out", "vdd", pmos(-0.45, 0.004, 0.06));
    nl.add_mosfet("Mn", "vin", "out", "0", nmos(0.45, 0.004, 0.06));
    cases.push(dump_case(
        "inverter",
        "CMOS inverter DC operating point",
        "VDD 1.8 V; V_in 0.9 V; square-law PMOS (vth −0.45, kp 4 mA/V², λ 0.06) + NMOS (vth 0.45, kp 4 mA/V², λ 0.06).",
        &nl,
    ));

    // 7. inverter-cascade — two chained stages.
    let mut nl = Netlist::new(&["0", "vdd", "vin", "out1", "out2"]);
    nl.add_v_source("vdd", "0", 1.8, "VDD");
    nl.add_v_source("vin", "0", 0.9, "VIN");
    nl.add_mosfet("Mp1", "vin", "out1", "vdd", pmos(-0.45, 0.004, 0.06));
    nl.add_mosfet("Mn1", "vin", "out1", "0", nmos(0.45, 0.004, 0.06));
    nl.add_mosfet("Mp2", "out1", "out2", "vdd", pmos(-0.45, 0.004, 0.06));
    nl.add_mosfet("Mn2", "out1", "out2", "0", nmos(0.45, 0.004, 0.06));
    cases.push(dump_case(
        "inverter-cascade",
        "Two-stage CMOS inverter cascade",
        "Stage 1 (V_in 0.9 V) drives stage 2's gates; 4 square-law devices on one VDD rail.",
        &nl,
    ));

    // 8. rc-bleed-bias — RC network DC bias point (cap is DC-open).
    let mut nl = Netlist::new(&["0", "src", "n1"]);
    nl.add_v_source("src", "0", 5.0, "V1");
    nl.add_resistor("src", "n1", 1000.0, "R1");
    nl.add_resistor("n1", "0", 4000.0, "R2");
    let mut rc = dump_case(
        "rc-bleed-bias",
        "RC network DC bias point",
        "V1 5 V; R1 1 kΩ series; R2 4 kΩ bleed. V(n1) = 4 V; C1 1 nF is DC-open (deck-only element, 0 DC current).",
        &nl,
    );
    rc["deckOnly"] = deck_only_rc();
    cases.push(rc);

    // 9. breakdown-bias — permanent oxide-breakdown fault (gate shorted).
    let mut nl = Netlist::new(&["0", "vdd", "vgate", "out"]);
    nl.add_v_source("vdd", "0", 1.8, "VDD");
    nl.add_resistor("vdd", "out", 10_000.0, "Rload");
    nl.add_mosfet("Mn", "vgate", "out", "0", nmos(0.45, 0.004, 0.06));
    {
        let m = nl.mosfet_mut("Mn").expect("Mn present");
        m.gate_shorted = true;
        m.gate_short_r = 100.0;
    }
    nl.add_resistor("vdd", "vgate", 2000.0, "Rbias");
    cases.push(dump_case(
        "breakdown-bias",
        "Post-breakdown gate-short bias point",
        "Permanent oxide-breakdown fault: Mn's gate tied to its source through 100 Ω (gate_shorted), a 2 kΩ pull-up on the gate rail and a 10 kΩ load — the damaged device conducts through its short while V_gs ≈ 0.",
        &nl,
    ));

    // 10. bridge — unbalanced Wheatstone bridge with a 1 k bridge element.
    let mut nl = Netlist::new(&["0", "top", "va", "vb"]);
    nl.add_v_source("top", "0", 10.0, "V1");
    nl.add_resistor("top", "va", 350.0, "R1");
    nl.add_resistor("va", "0", 350.0, "R3");
    nl.add_resistor("top", "vb", 350.0, "R2");
    nl.add_resistor("vb", "0", 355.0, "R4");
    nl.add_resistor("va", "vb", 1000.0, "Rbridge");
    cases.push(dump_case(
        "bridge",
        "Unbalanced Wheatstone bridge",
        "V1 10 V; R1 = R2 = R3 = 350 Ω, R4 = 355 Ω, 1 kΩ bridge element va→vb (six nodes, six branches).",
        &nl,
    ));

    let dump = json!({
        "format": "invention-lab/wp24-oracle-dump/1",
        "provenance": ProvenanceBadge::SimulatedArchitecturalModel,
        "suite": "PHASE_02 WP-2.4 ngspice differential (10 cases)",
        "tolerances": {
            "nodeVoltageV": 1e-6,
            "branchCurrentA": 1e-9,
            "kclResidualA": 1e-9,
            "powerConservationW": 1e-9,
            "source": "03_PHYSICS_MATH_FUNDAMENTALS.md §5 CI Oracle Calibration Table",
        },
        "deviceModelContract": {
            "engine": "Shichman-Hodges square-law (03 §1.2, WP-2.1 parity model)",
            "ngspiceMapping": "LEVEL=1, KP = ep-circuit kp, VTO = vth, LAMBDA = lambda, W = L = 1 µm (β = KP·W/L folds identically)",
            "wL.um": W_L_UM,
            "bsimNote": "WP-2.2 BSIM-characterized devices are excluded: interpolated tables vs ngspice analytic BSIM4 cannot meet the ±1e-6 V calibration tolerance — faking it would violate Law 5",
        },
        "cases": cases,
    });
    println!(
        "{}",
        serde_json::to_string_pretty(&dump).expect("dump serializes")
    );
}
