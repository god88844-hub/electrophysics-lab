//! WP-3.3: pinned-schema, hierarchy, Layer-1 and flattened-solve oracles.
use ep_logic::characterize::{
    self as ch, CharacterizationConfig, InputDir, OperatingCorner, TimingLibrary, TransientConfig,
};
use ep_logic::components::{BlockParams, ComponentKind};
use ep_logic::packager::*;
use ep_logic::{run_logic, Block, LogicDiagram, PortRef, Radix, RunOptions, Wire};
use serde_json::{json, Value};
use std::collections::BTreeMap;
use std::sync::OnceLock;
const AT: &str = "2026-11-23T12:00:00+05:30";
fn lib() -> &'static TimingLibrary {
    static LIB: OnceLock<TimingLibrary> = OnceLock::new();
    LIB.get_or_init(|| {
        TimingLibrary::characterize(&CharacterizationConfig::default())
            .expect("WP-3.2 characterization")
    })
}
fn conditions() -> Conditions {
    Conditions {
        load_ff: 15.0,
        slew_ps: 100.0,
        corner: OperatingCorner::sky130_nominal(),
    }
}
fn footprint() -> Footprint {
    hd_footprint("sky130_fd_sc_hd__inv_1", 1.0).unwrap()
}
fn inv(id: &str) -> CustomIcPackage {
    Packager::new(lib())
        .package_primitive(id, ComponentKind::Not, 2, conditions(), footprint(), AT)
        .unwrap()
}
fn pin(name: &str, d: Direction, r: u32) -> Pin {
    Pin::digital(name, d, r).unwrap()
}
fn connection(from: Endpoint, to: Endpoint) -> Connection {
    Connection { from, to }
}
fn chain(child: &str, n: usize, r: u32) -> Circuit {
    let mut instances = Vec::new();
    let mut wires = Vec::new();
    let mut from = Endpoint::boundary("a");
    for i in 0..n {
        let id = format!("u{i}");
        instances.push(Instance {
            id: id.clone(),
            ic_id: child.into(),
        });
        wires.push(connection(from, Endpoint::at(&id, "a")));
        from = Endpoint::at(&id, "y");
    }
    wires.push(connection(from, Endpoint::boundary("y")));
    Circuit {
        pins: vec![
            pin("a", Direction::Input, r),
            pin("y", Direction::Output, r),
        ],
        instances,
        wires,
    }
}
fn package_chain(id: &str, child: &str, n: usize, registry: &Registry) -> CustomIcPackage {
    Packager::new(lib())
        .package_circuit(
            id,
            chain(child, n, 2),
            registry,
            conditions(),
            Footprint::custom(n as f64 * 1.38, 2.72, 1.0),
            AT,
        )
        .unwrap()
}
fn single(id: &str, r: u32) -> Circuit {
    chain(id, 1, r)
}
fn relative(a: f64, b: f64) -> f64 {
    (a - b).abs() / b.abs().max(1e-30)
}

#[test]
fn emitted_json_uses_the_actual_schema_and_round_trips_its_ep_core_seal() {
    let p = inv("schema_inv");
    let value = serde_json::to_value(&p).unwrap();
    validate_json(&value).unwrap();
    assert!(value.pointer("/macroModel/timingArcs/0/delayNs").is_some());
    assert!(value
        .pointer("/macroModel/dynamicPower/wattsPerToggle")
        .is_some());
    assert!(value.pointer("/macroModel/timing_arcs").is_none());
    let loaded = CustomIcPackage::from_json(value).unwrap();
    verify_seal(&loaded).unwrap();
    assert_eq!(loaded.verification.status, Status::Verified);
    assert_eq!(loaded.content_seal.len(), 64);
    let mut raw = serde_json::to_value(&loaded).unwrap();
    raw.as_object_mut().unwrap().remove("contentSeal");
    assert_eq!(
        loaded.content_seal,
        ep_core::reference::sha256_hex(&serde_json::to_vec(&raw).unwrap())
    );
}

// Discover every required field from the real JSON schema, then remove it at
// every realized object/array position. This catches schema/serde drift.
fn required_field_mutations(
    schema: &Value,
    value: &Value,
    path: &str,
    root: &Value,
    count: &mut usize,
) {
    if let Some(required) = schema.get("required").and_then(Value::as_array) {
        for key in required {
            let key = key.as_str().unwrap();
            let mut bad = root.clone();
            let target = if path.is_empty() {
                &mut bad
            } else {
                bad.pointer_mut(path).unwrap()
            };
            target.as_object_mut().unwrap().remove(key);
            assert!(
                validate_json(&bad).is_err(),
                "accepted missing {path}/{key}"
            );
            *count += 1;
        }
    }
    if let Some(props) = schema.get("properties").and_then(Value::as_object) {
        for (key, s) in props {
            if let Some(v) = value.get(key) {
                required_field_mutations(s, v, &format!("{path}/{key}"), root, count);
            }
        }
    }
    if let Some(items) = schema.get("items") {
        if let Some(a) = value.as_array() {
            for (i, v) in a.iter().enumerate() {
                required_field_mutations(items, v, &format!("{path}/{i}"), root, count);
            }
        }
    }
    if let Some(branches) = schema.get("oneOf").and_then(Value::as_array) {
        for branch in branches {
            if branch.pointer("/properties/kind/const") == value.get("kind") {
                required_field_mutations(branch, value, path, root, count);
            }
        }
    }
}
#[test]
fn every_required_schema_field_and_declared_constraint_is_enforced() {
    let p = inv("validation");
    let good = serde_json::to_value(&p).unwrap();
    let schema: Value = serde_json::from_str(SCHEMA).unwrap();
    let mut count = 0;
    required_field_mutations(&schema, &good, "", &good, &mut count);
    assert!(count >= 27, "{count}");
    for (path, bad) in [
        ("/format", json!("wrong")),
        ("/icId", json!("Upper Case")),
        ("/icId", json!("")),
        ("/label", json!("x".repeat(121))),
        ("/pins", json!([])),
        ("/pins/0/name", json!(1)),
        ("/pins/0/direction", json!("sideways")),
        ("/pins/0/radix", json!("quinary")),
        ("/pins/0/voltageLevelsV", json!([0, "x"])),
        ("/radixDomain", json!("custom")),
        ("/implementation/kind", json!("unknown")),
        ("/implementation/components", json!({})),
        ("/implementation/wires", json!({})),
        ("/macroModel/timingArcs", json!({})),
        ("/macroModel/timingArcs/0/from", json!(2)),
        ("/macroModel/timingArcs/0/to", json!(2)),
        ("/macroModel/timingArcs/0/delayNs", json!(-1)),
        ("/macroModel/timingArcs/0/tolerancePct", json!(6)),
        ("/macroModel/dynamicPower/wattsPerToggle", json!(-1)),
        ("/macroModel/dynamicPower/tolerancePct", json!(11)),
        ("/footprint/kind", json!("mesh")),
        ("/footprint/dimensionsUm/w", json!(0.09)),
        ("/footprint/dimensionsUm/h", json!(0)),
        ("/footprint/parametricSpecRef", json!(12)),
        ("/verification/status", json!("VERIFIED")),
        ("/verification/checkedAt", json!("2026-02-29T00:00:00Z")),
        ("/verification/checkedAt", json!("2026-11-23T25:00:00Z")),
        (
            "/verification/checkedAt",
            json!("2026-11-23T00:00:00+99:00"),
        ),
    ] {
        let mut v = good.clone();
        if let Some(target) = v.pointer_mut(path) {
            *target = bad;
        } else {
            let (parent, key) = path.rsplit_once('/').unwrap();
            v.pointer_mut(parent)
                .unwrap()
                .as_object_mut()
                .unwrap()
                .insert(key.into(), bad);
        }
        assert!(validate_json(&v).is_err(), "accepted invalid {path}");
    }
    let mut v = good.clone();
    v["verification"]["solver"] = json!("ep-logic");
    assert!(validate_json(&v).is_err());
    v["verification"]["solver"] = json!("packages/physics-engine MNA");
    validate_json(&v).unwrap();
    let mut v = good;
    v["label"] = json!("🧪".repeat(120));
    validate_json(&v).unwrap();
}
#[test]
fn sub_ic_schema_required_fields_and_reference_types_are_checked() {
    let mut registry = Registry::from([("leaf".into(), inv("leaf"))]);
    let p = package_chain("outer", "leaf", 2, &registry);
    let good = serde_json::to_value(&p).unwrap();
    let schema: Value = serde_json::from_str(SCHEMA).unwrap();
    let mut count = 0;
    required_field_mutations(&schema, &good, "", &good, &mut count);
    assert!(count >= 27);
    let mut bad = good;
    bad["implementation"]["subICs"] = json!([42]);
    assert!(validate_json(&bad).is_err());
    registry.insert(p.ic_id.clone(), p);
    validate_sub_ic_dag(&registry, "outer").unwrap();
}
#[test]
fn raw_transistor_package_matches_independent_layer1_timing_energy_and_leakage() {
    // User-edited geometry ensures this is not a lookup by the inv1 name.
    let mut cell = ch::inv1_cell();
    for d in &mut cell.nl.devices {
        d.w_um *= 1.4;
    }
    let netlist = TransistorNetlist::from_cell(&cell, 2).unwrap();
    let p = Packager::new(lib())
        .package_transistors("user_inv", netlist, conditions(), footprint(), AT)
        .unwrap();
    assert_eq!(p.verification.status, Status::Verified);
    assert!(p.verification.timing_error_pct <= 5.0);
    assert!(p.verification.power_error_pct <= 10.0);
    let mut direct_cycle = 0.0;
    let mut worst_delay = 0.0_f64;
    for dir in [InputDir::Rise, InputDir::Fall] {
        let run = ch::run_arc(
            &cell,
            2,
            3,
            &[],
            dir,
            15.0,
            100e-12,
            &OperatingCorner::sky130_nominal(),
            &TransientConfig {
                dt_s: 0.25e-12,
                ..Default::default()
            },
        )
        .unwrap();
        direct_cycle += run.e_dyn_j;
        worst_delay = worst_delay.max(run.tpd_s * 1e9);
    }
    let timing_error = relative(p.macro_model.timing_arcs[0].delay_ns, worst_delay);
    let power_error = relative(p.macro_model.dynamic_power.watts_per_toggle, direct_cycle);
    assert!(timing_error <= 0.05, "{timing_error}");
    assert!(power_error <= 0.10, "{power_error}");
    let direct_leakage = ch::worst_leakage_w(
        &cell,
        &OperatingCorner::sky130_nominal(),
        &TransientConfig::default(),
    )
    .unwrap();
    assert!(relative(p.macro_model.leakage_power_w.unwrap(), direct_leakage) <= 0.10);
    eprintln!("WP-3.3 user Layer-1 oracle: timing {:.6}%, cycle energy {:.6}%, refined gate {:.6}% / {:.6}%",timing_error*100.0,power_error*100.0,p.verification.timing_error_pct,p.verification.power_error_pct);
    let power = p.macro_model.power_w(1e9).unwrap();
    assert_eq!(
        power,
        p.macro_model.leakage_power_w.unwrap() + p.macro_model.dynamic_power.watts_per_toggle * 1e9
    );
    let mut registry = Registry::new();
    registry.insert(p.ic_id.clone(), p.clone());
    let black = CustomIcInstance::new(&registry, "user_inv").unwrap();
    assert_eq!(black.state(&[0]).unwrap().outputs, vec![1]);
    assert_eq!(black.transition(&[0], &[1]).unwrap().events[0].value, 0);
    let round_trip = CustomIcPackage::from_json(serde_json::to_value(p).unwrap()).unwrap();
    assert!(matches!(
        round_trip.implementation,
        Implementation::Netlist {
            source: LeafSource::Transistors { .. },
            ..
        }
    ));
}
#[test]
fn binary_library_macro_matches_held_out_direct_layer1_solves_at_declared_load_and_slew() {
    let p = inv("binary_feed");
    let cell = ch::inv1_cell();
    let mut worst = 0.0_f64;
    let mut cycle = 0.0;
    for dir in [InputDir::Rise, InputDir::Fall] {
        let run = ch::run_arc(
            &cell,
            2,
            3,
            &[],
            dir,
            15.0,
            100e-12,
            &OperatingCorner::sky130_nominal(),
            &TransientConfig {
                dt_s: 0.5e-12,
                ..Default::default()
            },
        )
        .unwrap();
        worst = worst.max(run.tpd_s * 1e9);
        cycle += run.e_dyn_j;
    }
    let timing = relative(p.macro_model.timing_arcs[0].delay_ns, worst);
    let power = relative(p.macro_model.dynamic_power.watts_per_toggle, cycle);
    assert!(timing <= 0.05, "{timing}");
    assert!(power <= 0.10, "{power}");
    eprintln!(
        "WP-3.3 WP-3.2 held-out oracle: timing {:.6}%, energy {:.6}%",
        timing * 100.0,
        power * 100.0
    );
}
#[test]
fn raw_half_adder_preserves_all_inputs_outputs_and_internal_graph() {
    let cell = ch::half_adder_binary_cell();
    let p = Packager::new(lib())
        .package_transistors(
            "user_ha",
            TransistorNetlist::from_cell(&cell, 2).unwrap(),
            conditions(),
            Footprint::custom(8.0, 2.72, 1.0),
            AT,
        )
        .unwrap();
    assert_eq!(p.verification.status, Status::Verified);
    assert_eq!(p.macro_model.states.len(), 4);
    assert_eq!(p.macro_model.transitions.len(), 8);
    for state in &p.macro_model.states {
        let a = state.inputs[0];
        let b = state.inputs[1];
        assert_eq!(state.outputs, vec![a ^ b, a & b]);
    }
    let json = serde_json::to_value(&p).unwrap();
    validate_json(&json).unwrap();
    assert_eq!(
        json["implementation"]["components"]
            .as_array()
            .unwrap()
            .len(),
        cell.nl.devices.len()
    );
    assert_eq!(p.macro_model.timing_arcs.len(), 4);
}
#[test]
fn three_level_hierarchy_and_repeated_instances_match_flattened_events_and_power() {
    let mut registry = Registry::from([("leaf".into(), inv("leaf"))]);
    let pair = package_chain("pair", "leaf", 2, &registry);
    registry.insert("pair".into(), pair);
    let quad = package_chain("quad", "pair", 2, &registry);
    registry.insert("quad".into(), quad);
    let octet = package_chain("octet", "quad", 2, &registry);
    assert_eq!(octet.verification.status, Status::Verified);
    assert!(octet.verification.timing_error_pct < 1e-9);
    assert!(octet.verification.power_error_pct < 1e-9);
    registry.insert("octet".into(), octet);
    let circuit = single("octet", 2);
    let flat = flatten(&registry, &circuit).unwrap();
    assert_eq!(flat.instances.len(), 8);
    let stimuli = vec![
        Stimulus {
            time_ns: 1.0,
            pin: "a".into(),
            value: 1,
        },
        Stimulus {
            time_ns: 10.0,
            pin: "a".into(),
            value: 0,
        },
    ];
    let black = run_circuit(&registry, &circuit, &[0], &stimuli, SolveMode::BlackBox).unwrap();
    let full = run_circuit(&registry, &circuit, &[0], &stimuli, SolveMode::Flattened).unwrap();
    assert_eq!(black.events, full.events);
    assert_eq!(black.outputs, full.outputs);
    assert_eq!(black.outputs, vec![0]);
    assert!(relative(black.dynamic_energy_j, full.dynamic_energy_j) < 1e-12);
    assert!(relative(black.leakage_w.unwrap(), full.leakage_w.unwrap()) < 1e-12);
    assert!(
        relative(
            black.dynamic_energy_j,
            registry["leaf"].macro_model.dynamic_power.watts_per_toggle * 8.0
        ) < 1e-12
    );
    let round_trip =
        CustomIcPackage::from_json(serde_json::to_value(&registry["octet"]).unwrap()).unwrap();
    assert_eq!(round_trip.content_seal, registry["octet"].content_seal);
}
#[test]
fn multi_radix_mixed_domains_and_custom_radix_pins_round_trip() {
    for radix in 2..=8 {
        let circuit = Circuit {
            pins: vec![
                pin("a", Direction::Input, radix),
                pin("y", Direction::Output, radix),
            ],
            instances: vec![],
            wires: vec![connection(Endpoint::boundary("a"), Endpoint::boundary("y"))],
        };
        let p = Packager::new(lib())
            .package_circuit(
                &format!("wire_{radix}"),
                circuit,
                &Registry::new(),
                conditions(),
                Footprint::custom(1.0, 1.0, 0.5),
                AT,
            )
            .unwrap();
        let value = serde_json::to_value(&p).unwrap();
        validate_json(&value).unwrap();
        assert_eq!(p.pins[0].digit_count(), radix as usize);
        if radix > 4 {
            assert_eq!(p.pins[0].radix, PinRadix::Analog);
            assert_eq!(p.radix_domain, "mixed");
        }
        let registry = Registry::from([(p.ic_id.clone(), p)]);
        let black = CustomIcInstance::new(&registry, &format!("wire_{radix}")).unwrap();
        for digit in 0..radix as u8 {
            assert_eq!(black.state(&[digit]).unwrap().outputs, vec![digit]);
        }
    }
    let q4 = Packager::new(lib())
        .package_primitive(
            "q4",
            ComponentKind::Q4Inv,
            4,
            conditions(),
            Footprint::custom(5.0, 5.0, 1.0),
            AT,
        )
        .unwrap();
    assert!(q4
        .macro_model
        .provenance
        .iter()
        .any(|p| p.contains("INSUFFICIENT_MODEL_DATA")));
    assert!(q4.macro_model.leakage_power_w.is_none());
    assert!(q4.macro_model.power_w(1.0).is_err());
    let registry = Registry::from([("bin".into(), inv("bin")), ("q4".into(), q4)]);
    let circuit = Circuit {
        pins: vec![
            pin("b", Direction::Input, 2),
            pin("q", Direction::Input, 4),
            pin("c", Direction::Input, 5),
            pin("by", Direction::Output, 2),
            pin("qy", Direction::Output, 4),
            pin("cy", Direction::Output, 5),
        ],
        instances: vec![
            Instance {
                id: "b".into(),
                ic_id: "bin".into(),
            },
            Instance {
                id: "q".into(),
                ic_id: "q4".into(),
            },
        ],
        wires: vec![
            connection(Endpoint::boundary("b"), Endpoint::at("b", "a")),
            connection(Endpoint::at("b", "y"), Endpoint::boundary("by")),
            connection(Endpoint::boundary("q"), Endpoint::at("q", "a")),
            connection(Endpoint::at("q", "y"), Endpoint::boundary("qy")),
            connection(Endpoint::boundary("c"), Endpoint::boundary("cy")),
        ],
    };
    let p = Packager::new(lib())
        .package_circuit(
            "mixed",
            circuit,
            &registry,
            conditions(),
            Footprint::custom(8.0, 5.0, 1.0),
            AT,
        )
        .unwrap();
    assert_eq!(p.verification.status, Status::Verified);
    assert_eq!(p.radix_domain, "mixed");
    let state = p
        .macro_model
        .states
        .iter()
        .find(|s| s.inputs == [1, 2, 4])
        .unwrap();
    assert_eq!(state.outputs, vec![0, 1, 4]);
}
#[test]
fn transistor_ports_can_expose_custom_partitions_without_invented_characterization() {
    let mut nl = TransistorNetlist::from_cell(&ch::inv1_cell(), 2).unwrap();
    nl.ports
        .iter_mut()
        .find(|p| p.pin.direction == Direction::Output)
        .unwrap()
        .pin = pin("y", Direction::Output, 5);
    let p = Packager::new(lib())
        .package_transistors("mixed_transistors", nl, conditions(), footprint(), AT)
        .unwrap();
    assert_eq!(p.radix_domain, "mixed");
    assert_eq!(p.verification.status, Status::Verified);
    assert_eq!(p.macro_model.states[0].outputs, vec![4]);
    assert_eq!(p.macro_model.states[1].outputs, vec![0]);
}
#[test]
fn radix_mismatches_unknown_ports_contention_and_feedback_fail_closed() {
    let registry = Registry::from([("leaf".into(), inv("leaf"))]);
    for radix in [3, 4, 5, 8] {
        let err = run_circuit(
            &registry,
            &single("leaf", radix),
            &[0],
            &[],
            SolveMode::BlackBox,
        )
        .unwrap_err();
        assert!(err.0.contains("radix mismatch"), "{err}");
    }
    let mut bad = single("leaf", 2);
    bad.wires[0].to.pin = "missing".into();
    assert!(flatten(&registry, &bad).is_err());
    let mut bad = single("leaf", 2);
    bad.wires.push(bad.wires[0].clone());
    assert!(flatten(&registry, &bad)
        .unwrap_err()
        .0
        .contains("contention"));
    let mut bad = single("leaf", 2);
    bad.wires[0].from = Endpoint::at("u0", "y");
    assert!(flatten(&registry, &bad).unwrap_err().0.contains("cyclic"));
    let mut bad = single("leaf", 2);
    bad.instances.push(bad.instances[0].clone());
    assert!(flatten(&registry, &bad).is_err());
    let mut bad = single("leaf", 2);
    bad.wires.clear();
    assert!(flatten(&registry, &bad).is_err());
}
#[test]
fn self_and_indirect_ic_inclusion_fail_before_extraction() {
    let mut registry = Registry::from([("leaf".into(), inv("leaf"))]);
    let parent = package_chain("parent", "leaf", 1, &registry);
    registry.insert("parent".into(), parent);
    let err = Packager::new(lib())
        .package_circuit(
            "leaf",
            single("parent", 2),
            &registry,
            conditions(),
            footprint(),
            AT,
        )
        .unwrap_err();
    assert!(err.0.contains("self-inclusion"), "{err}");
    let err = Packager::new(lib())
        .package_circuit(
            "leaf",
            single("leaf", 2),
            &registry,
            conditions(),
            footprint(),
            AT,
        )
        .unwrap_err();
    assert!(err.0.contains("self-inclusion"), "{err}");
    assert!(validate_sub_ic_dag(&registry, "missing").is_err());
    registry.get_mut("leaf").unwrap().mark_stale();
    assert!(CustomIcInstance::new(&registry, "parent").is_err());
}
#[test]
fn tampering_stale_status_and_out_of_tolerance_models_cannot_instantiate() {
    let mut registry = Registry::from([("leaf".into(), inv("leaf"))]);
    let mut parent = package_chain("parent", "leaf", 2, &registry);
    let mut tampered = parent.clone();
    tampered.footprint.dimensions_um.w += 1.0;
    assert!(verify_seal(&tampered).is_err());
    let mut value = serde_json::to_value(&tampered).unwrap();
    assert!(CustomIcPackage::from_json(value.clone()).is_err());
    value["contentSeal"] = json!("0".repeat(64));
    assert!(CustomIcPackage::from_json(value).is_err());
    for t in &mut parent.macro_model.transitions {
        for e in &mut t.events {
            e.delay_ns *= 1.2;
        }
        t.energy_j *= 1.2;
    }
    for a in &mut parent.macro_model.timing_arcs {
        a.delay_ns *= 1.2;
    }
    parent.macro_model.dynamic_power.watts_per_toggle *= 1.2;
    let report = reverify(&mut parent, &registry, AT).unwrap();
    assert_eq!(report.status, Status::Stale);
    assert!(report.timing_error_pct > 5.0);
    assert!(report.power_error_pct > 10.0);
    registry.insert("parent".into(), parent);
    assert!(CustomIcInstance::new(&registry, "parent").is_err());
}
#[test]
fn unsupported_functions_corners_envelopes_and_resource_budgets_fail_closed() {
    for (kind, r) in [
        (ComponentKind::Buf, 2),
        (ComponentKind::AddN, 2),
        (ComponentKind::Not, 3),
        (ComponentKind::TernaryInv, 3),
        (ComponentKind::Not, 5),
        (ComponentKind::Dff, 2),
    ] {
        assert!(Packager::new(lib())
            .package_primitive("unsupported", kind, r, conditions(), footprint(), AT)
            .is_err());
    }
    let mut c = conditions();
    c.load_ff = 1e9;
    assert!(Packager::new(lib())
        .package_primitive("outside", ComponentKind::Not, 2, c, footprint(), AT)
        .is_err());
    let mut c = conditions();
    c.corner.temp_c = 70.0;
    assert!(Packager::new(lib())
        .package_primitive("corner", ComponentKind::Not, 2, c, footprint(), AT)
        .is_err());
    let mut circuit = Circuit {
        pins: vec![],
        instances: vec![],
        wires: vec![],
    };
    for i in 0..11 {
        circuit
            .pins
            .push(pin(&format!("i{i}"), Direction::Input, 2));
    }
    circuit.pins.push(pin("y", Direction::Output, 2));
    circuit.wires.push(connection(
        Endpoint::boundary("i0"),
        Endpoint::boundary("y"),
    ));
    assert!(Packager::new(lib())
        .package_circuit(
            "too_big",
            circuit,
            &Registry::new(),
            conditions(),
            footprint(),
            AT
        )
        .unwrap_err()
        .0
        .contains("budget"));
    let mut nl = TransistorNetlist::from_cell(&ch::inv1_cell(), 2).unwrap();
    nl.devices[0].g = 999;
    assert!(Packager::new(lib())
        .package_transistors("bad_node", nl, conditions(), footprint(), AT)
        .is_err());
    let mut nl = TransistorNetlist::from_cell(&ch::inv1_cell(), 2).unwrap();
    nl.devices[0].w_um = f64::NAN;
    assert!(Packager::new(lib())
        .package_transistors("bad_w", nl, conditions(), footprint(), AT)
        .is_err());
    assert!(Pin::digital("p", Direction::Input, 9).is_err());
}
fn diagram() -> LogicDiagram {
    let mut d = LogicDiagram {
        radix: Radix::BINARY,
        ..Default::default()
    };
    for (id, kind) in [
        ("in", ComponentKind::In),
        ("x", ComponentKind::Not),
        ("z", ComponentKind::Not),
        ("out", ComponentKind::Probe),
    ] {
        d.blocks.push(Block {
            id: id.into(),
            kind,
            params: BlockParams::defaults_for(kind),
        });
    }
    for (from, fp, to, tp) in [
        ("in", "out", "x", "a"),
        ("x", "y", "z", "a"),
        ("z", "y", "out", "in"),
    ] {
        d.wires.push(Wire {
            from: PortRef {
                block: from.into(),
                port: fp.into(),
            },
            to: PortRef {
                block: to.into(),
                port: tp.into(),
            },
        });
    }
    d
}
#[test]
fn selected_region_auto_extracts_characterization_and_matches_native_ep_logic() {
    let d = diagram();
    let footprints = BTreeMap::from([("logic.NOT".into(), footprint())]);
    let mut progress = Vec::new();
    let region = {
        let mut p = Packager::new(lib()).with_progress(|p| progress.push(p));
        p.package_region(
            "region",
            &d,
            &["in", "x", "z", "out"],
            conditions(),
            Footprint::custom(2.76, 2.72, 1.0),
            &footprints,
            AT,
        )
        .unwrap()
    };
    assert_eq!(region.package.verification.status, Status::Verified);
    let mut registry = Registry::new();
    region.install(&mut registry).unwrap();
    let package = &registry["region"];
    let trace = CustomIcInstance::new(&registry, "region")
        .unwrap()
        .transition(&[0], &[1])
        .unwrap();
    let mut native = d;
    native.blocks[0].kind = ComponentKind::Clock;
    native.blocks[0].params.period = 10_000;
    // A single isolated edge; per-direction library arcs, rounded to the
    // existing engine's 1 ps ticks. Package simulation retains fs precision.
    let first = registry["region-leaf-0"]
        .macro_model
        .transitions
        .iter()
        .find(|t| t.before == [0] && t.after == [1])
        .unwrap()
        .events[0]
        .delay_ns
        * 1000.0;
    let second = registry["region-leaf-1"]
        .macro_model
        .transitions
        .iter()
        .find(|t| t.before == [1] && t.after == [0])
        .unwrap()
        .events[0]
        .delay_ns
        * 1000.0;
    native.blocks[1].params.delay = first.round() as u64;
    native.blocks[2].params.delay = second.round() as u64;
    let result = run_logic(
        &native,
        RunOptions {
            max_ticks: 5000,
            ..Default::default()
        },
    )
    .unwrap();
    let probe = &result.probes.iter().find(|(id, _)| id == "out").unwrap().1;
    let observed = probe.times.iter().copied().find(|&t| t > 5000).unwrap() - 5000;
    assert!(
        relative(
            trace.events.last().unwrap().delay_ns,
            observed as f64 / 1000.0
        ) <= 0.05
    );
    assert_eq!(package.pins.len(), 2);
    for stage in [
        "states",
        "transitions",
        "validate",
        "extraction",
        "verification",
    ] {
        assert!(progress
            .iter()
            .any(|p| p.stage == stage && p.completed == p.total));
    }
    let cut = Packager::new(lib())
        .package_region(
            "cut",
            &diagram(),
            &["x", "z"],
            conditions(),
            Footprint::custom(2.76, 2.72, 1.0),
            &footprints,
            AT,
        )
        .unwrap();
    assert_eq!(cut.package.pins.len(), 2);
    assert!(cut.package.pins[0].name.starts_with("cut_"));
}
#[test]
fn footprint_units_and_malformed_models_are_checked_before_instantiation() {
    let mut p = inv("footprint");
    assert_eq!(p.footprint.dimensions_um.w, 1.38);
    assert_eq!(p.footprint.dimensions_um.h, 2.72);
    assert_eq!(p.footprint.dimensions_mm(), [0.00138, 0.00272, 0.001]);
    p.footprint.dimensions_um.w = f64::NAN;
    assert!(p.validate().is_err());
    let mut p = inv("model");
    p.macro_model.states[0].outputs = vec![2];
    assert!(p.validate().is_err());
    let mut p = inv("model");
    p.macro_model.transitions.pop();
    assert!(p.validate().is_err());
    let mut p = inv("model");
    p.macro_model.states.push(p.macro_model.states[0].clone());
    assert!(p.validate().is_err());
    let mut p = inv("model");
    p.macro_model.transitions[0].events[0].delay_ns = f64::INFINITY;
    assert!(p.validate().is_err());
    let mut p = inv("model");
    p.pins[0].voltage_levels_v[1] = 2.0;
    assert!(p.validate().is_err());
    let mut p = inv("model");
    p.pins[0].voltage_levels_v.push(3.6);
    assert!(p.validate().is_err());
    let p = inv("model");
    assert!(p.macro_model.power_w(-1.0).is_err());
}

#[test]
fn child_content_changes_invalidate_parents_and_overlapping_macro_edges_fail_closed() {
    let mut registry = Registry::from([("leaf".into(), inv("leaf"))]);
    let parent = package_chain("parent", "leaf", 2, &registry);
    registry.insert("parent".into(), parent);
    let circuit = single("parent", 2);
    let stimuli = [
        Stimulus {
            time_ns: 0.0,
            pin: "a".into(),
            value: 1,
        },
        Stimulus {
            time_ns: 0.001,
            pin: "a".into(),
            value: 0,
        },
    ];
    assert!(
        run_circuit(&registry, &circuit, &[0], &stimuli, SolveMode::BlackBox)
            .unwrap_err()
            .0
            .contains("overlapping")
    );
    run_circuit(&registry, &circuit, &[0], &stimuli, SolveMode::Flattened).unwrap();
    let mut netlist = TransistorNetlist::from_cell(&ch::inv1_cell(), 2).unwrap();
    netlist.devices[0].w_um *= 1.5;
    let replacement = Packager::new(lib())
        .package_transistors("leaf", netlist, conditions(), footprint(), AT)
        .unwrap();
    registry.insert("leaf".into(), replacement);
    let err = CustomIcInstance::new(&registry, "parent").err().unwrap();
    assert!(err.0.contains("dependency leaf changed"), "{err}");
}
#[test]
fn non_sensitized_layer1_input_activity_is_measured_instead_of_assumed_zero() {
    let package = Packager::new(lib())
        .package_primitive(
            "nand",
            ComponentKind::Nand,
            2,
            conditions(),
            Footprint::custom(2.3, 2.72, 1.0),
            AT,
        )
        .unwrap();
    assert_eq!(package.verification.status, Status::Verified);
    let transition = package
        .macro_model
        .transitions
        .iter()
        .find(|t| t.before == [0, 0] && t.after == [1, 0])
        .unwrap();
    assert!(transition.events.is_empty());
    assert_ne!(transition.energy_j, 0.0);
    assert!(package.macro_model.leakage_power_w.unwrap() > 0.0);
}

fn hostile_seal(p: &mut CustomIcPackage) {
    let mut value = serde_json::to_value(&*p).unwrap();
    value.as_object_mut().unwrap().remove("contentSeal");
    p.content_seal = ep_core::reference::sha256_hex(&serde_json::to_vec(&value).unwrap());
}
#[test]
fn cyclic_untrusted_imports_are_rejected_even_with_correct_content_hashes() {
    let registry = Registry::from([("leaf".into(), inv("leaf"))]);
    let mut a = package_chain("a", "leaf", 1, &registry);
    let mut b = package_chain("b", "leaf", 1, &registry);
    for (p, child) in [(&mut a, "b"), (&mut b, "a")] {
        if let Implementation::SubIcs {
            sub_ics,
            circuit,
            dependency_seals,
        } = &mut p.implementation
        {
            *sub_ics = vec![child.into()];
            circuit.instances[0].ic_id = child.into();
            *dependency_seals = BTreeMap::from([(child.into(), "0".repeat(64))]);
        }
        hostile_seal(p);
        p.validate().unwrap();
        verify_seal(p).unwrap();
    }
    let registry = Registry::from([("a".into(), a), ("b".into(), b)]);
    assert!(validate_sub_ic_dag(&registry, "a")
        .unwrap_err()
        .0
        .contains("a -> b -> a"));
}
#[test]
fn all_four_q4_feed_primitives_keep_schema_valid_executable_pin_models() {
    for kind in [
        ComponentKind::Q4ThreshDet,
        ComponentKind::Q4Inv,
        ComponentKind::Q4Mux4,
        ComponentKind::Q4HalfAdder,
    ] {
        let p = Packager::new(lib())
            .package_primitive(
                "q4_primitive",
                kind,
                4,
                conditions(),
                Footprint::custom(10.0, 10.0, 1.0),
                AT,
            )
            .unwrap();
        assert_eq!(p.verification.status, Status::Verified);
        validate_json(&serde_json::to_value(&p).unwrap()).unwrap();
        assert!(p.macro_model.provenance[0].contains("UNQUALIFIED_NO_GO"));
        if kind == ComponentKind::Q4Mux4 {
            assert_eq!(p.macro_model.states.len(), 1024);
            assert_eq!(p.macro_model.transitions.len(), 15360);
            let state = p
                .macro_model
                .states
                .iter()
                .find(|s| s.inputs == [2, 0, 1, 3, 2])
                .unwrap();
            assert_eq!(state.outputs, vec![3]);
        }
    }
}
