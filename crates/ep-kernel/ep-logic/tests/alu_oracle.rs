//! Exhaustive independent truth and pin-event oracles for WP-3.5.
use ep_logic::alu::{AluComposer, AluFamily};
use ep_logic::characterize::{CharacterizationConfig, OperatingCorner, TimingLibrary};
use ep_logic::packager::{
    enumerate_circuit_states, run_circuit, validate_json, validate_sub_ic_dag, Circuit, Conditions,
    Connection, CustomIcInstance, CustomIcPackage, Direction, Endpoint, Footprint, Implementation,
    Instance, Packager, Pin, Registry, SolveMode, Status, Stimulus,
};
use std::sync::OnceLock;

const AT: &str = "2026-11-24T00:00:00Z";
const FAMILIES: [AluFamily; 4] = [
    AluFamily::Binary,
    AluFamily::TernaryBalanced,
    AluFamily::TernaryUnbalanced,
    AluFamily::Q4,
];

fn library() -> &'static TimingLibrary {
    static LIB: OnceLock<TimingLibrary> = OnceLock::new();
    LIB.get_or_init(|| TimingLibrary::characterize(&CharacterizationConfig::default()).unwrap())
}

fn conditions() -> Conditions {
    Conditions {
        load_ff: 15.0,
        slew_ps: 100.0,
        corner: OperatingCorner::sky130_nominal(),
    }
}

fn registry() -> &'static Registry {
    static REGISTRY: OnceLock<Registry> = OnceLock::new();
    REGISTRY.get_or_init(|| {
        let mut composer = AluComposer::new(
            library(),
            conditions(),
            Footprint::custom(20.0, 20.0, 2.0),
            AT,
        )
        .unwrap();
        for family in FAMILIES {
            let id = composer
                .compose(family)
                .unwrap_or_else(|e| panic!("{family:?}: {e}"));
            assert_eq!(composer.compose(family).unwrap(), id);
        }
        composer.into_registry()
    })
}

fn package(family: AluFamily) -> &'static CustomIcPackage {
    let id = match family {
        AluFamily::Binary => "alu_binary",
        AluFamily::TernaryBalanced => "alu_balanced_ternary",
        AluFamily::TernaryUnbalanced => "alu_unbalanced_ternary",
        AluFamily::Q4 => "alu_q4",
    };
    &registry()[id]
}

fn circuit(p: &CustomIcPackage) -> &Circuit {
    let Implementation::SubIcs { circuit, .. } = &p.implementation else {
        panic!("expected a hierarchical ALU");
    };
    circuit
}

fn signed_binary(value: u8) -> i8 {
    if value >= 2 {
        value as i8 - 4
    } else {
        value as i8
    }
}

fn binary_truth(v: &[u8]) -> Vec<u8> {
    let a = v[0] + 2 * v[1];
    let b = v[2] + 2 * v[3];
    let op = v[4] + 2 * v[5] + 4 * v[6];
    let lhs = signed_binary(a);
    let rhs = signed_binary(b);
    let (y, carry, overflow, less, equal) = match op {
        0 => (
            a + b,
            a + b >= 4,
            !(-2..=1).contains(&(lhs + rhs)),
            false,
            false,
        ),
        1 => (
            4 + a - b,
            a >= b,
            !(-2..=1).contains(&(lhs - rhs)),
            false,
            false,
        ),
        2 => (a & b, false, false, false, false),
        3 => (a | b, false, false, false, false),
        4 => (a ^ b, false, false, false, false),
        5 => (0, false, false, a < b, a == b),
        6 | 7 => (0, false, false, false, false),
        _ => unreachable!(),
    };
    vec![
        y & 1,
        (y >> 1) & 1,
        carry.into(),
        overflow.into(),
        less.into(),
        equal.into(),
    ]
}

fn comparison(a: i16, b: i16) -> u8 {
    u8::from(a >= b) + u8::from(a > b)
}

fn ternary_truth(v: &[u8], balanced: bool) -> Vec<u8> {
    let offset = i16::from(balanced);
    let a = i16::from(v[0]) + 3 * i16::from(v[1]) - 4 * offset;
    let b = i16::from(v[2]) + 3 * i16::from(v[3]) - 4 * offset;
    let op = v[4] + 3 * v[5];
    if op == 4 {
        return vec![comparison(a, b), offset as u8, offset as u8];
    }
    let value = match op {
        0 => a + b,
        1 => a.min(b),
        2 => a.max(b),
        3 => 8 * (1 - offset) - a,
        5..=8 => 0,
        _ => unreachable!(),
    };
    let encoded = value + 4 * offset;
    let carry = encoded.div_euclid(9) + offset;
    vec![
        encoded.rem_euclid(3) as u8,
        encoded.div_euclid(3).rem_euclid(3) as u8,
        carry as u8,
    ]
}

fn q4_truth(v: &[u8]) -> Vec<u8> {
    let (a, b) = (v[0], v[1]);
    match v[2] {
        0 => vec![(a + b) % 4, (a + b) / 4],
        1 => vec![3 - a, 0],
        2 => vec![[a, b, 3 - a, 3 - b][usize::from(v[3])], 0],
        3 => vec![comparison(i16::from(a), i16::from(b)), 0],
        _ => unreachable!(),
    }
}

#[test]
fn every_opcode_and_operand_agrees_with_packaged_flattened_and_analytic_truth() {
    let mut count = 0;
    for (family, rows) in FAMILIES.into_iter().zip([128, 729, 729, 256]) {
        let p = package(family);
        let black_box = CustomIcInstance::new(registry(), &p.ic_id).unwrap();
        let flat = enumerate_circuit_states(registry(), circuit(p), SolveMode::Flattened).unwrap();
        assert_eq!(flat.len(), rows);
        assert_eq!(p.macro_model.states.len(), rows);
        for row in flat {
            let expected = match family {
                AluFamily::Binary => binary_truth(&row.inputs),
                AluFamily::TernaryBalanced => ternary_truth(&row.inputs, true),
                AluFamily::TernaryUnbalanced => ternary_truth(&row.inputs, false),
                AluFamily::Q4 => q4_truth(&row.inputs),
            };
            assert_eq!(row.outputs, expected, "{family:?} flat {:?}", row.inputs);
            assert_eq!(
                black_box.state(&row.inputs).unwrap().outputs,
                expected,
                "{family:?} macro {:?}",
                row.inputs,
            );
            count += 1;
        }
    }
    assert_eq!(count, 1_842);
}

#[test]
fn packages_are_sealed_schema_valid_and_qualify_only_available_physics() {
    for (family, transitions) in FAMILIES.into_iter().zip([896, 8748, 8748, 3072]) {
        let p = package(family);
        assert_eq!(p.verification.status, Status::Verified);
        assert_eq!(p.verification.compared_transitions, transitions);
        assert!(p.verification.timing_error_pct <= 5.0);
        assert!(p.verification.power_error_pct <= 10.0);
        assert!(p.verification.leakage_error_pct <= 10.0);
        let json = serde_json::to_value(p).unwrap();
        validate_json(&json).unwrap();
        let roundtrip = CustomIcPackage::from_json(json).unwrap();
        assert_eq!(roundtrip.content_seal, p.content_seal);
        validate_sub_ic_dag(registry(), &p.ic_id).unwrap();
        assert_eq!(p.footprint.dimensions_mm(), [0.02, 0.02, 0.002]);
        assert_eq!(
            family.radix_economy(),
            f64::from(family.radix()) / f64::from(family.radix()).ln()
        );
        assert_eq!(
            p.pins
                .iter()
                .filter(|pin| pin.name.starts_with('y'))
                .count(),
            family.width()
        );
    }
    let binary = package(AluFamily::Binary);
    assert!(binary.macro_model.leakage_power_w.unwrap() > 0.0);
    assert!(binary.macro_model.dynamic_power.watts_per_toggle > 0.0);
    for unqualified in [AluFamily::TernaryBalanced, AluFamily::TernaryUnbalanced] {
        let model = &package(unqualified).macro_model;
        assert!(model.timing_arcs.is_empty());
        assert!(model.power_w(1.0e6).is_err());
        assert!(model
            .dynamic_power
            .definition
            .contains("uncharacterized cells omitted"));
    }
    let q4 = &package(AluFamily::Q4).macro_model;
    assert!(q4.power_w(1.0e6).is_err());
    assert!(q4
        .provenance
        .iter()
        .any(|p| p.contains("SIMULATED_ARCHITECTURAL_MODEL")));
    assert!(q4.provenance.iter().any(|p| p.contains("unqualified")));
    assert!(!q4.timing_arcs.is_empty());
    assert!(q4.dynamic_power.watts_per_toggle > 0.0);

    let binary = circuit(binary);
    let ids: Vec<_> = binary.instances.iter().map(|i| i.ic_id.as_str()).collect();
    assert!(ids.contains(&"alu_bin_full") && ids.contains(&"alu_bin_mux"));
    assert!(circuit(&registry()["alu_bin_full"])
        .instances
        .iter()
        .any(|i| i.ic_id == "alu_bin_half"));
    let flat_q4 = ep_logic::packager::flatten(registry(), circuit(package(AluFamily::Q4))).unwrap();
    for id in [
        "alu_q4_threshold",
        "alu_q4_inv",
        "alu_q4_mux",
        "alu_q4_half",
    ] {
        assert!(flat_q4.instances.iter().any(|i| i.ic_id == id));
    }
}

fn wrap(package: &CustomIcPackage) -> Circuit {
    let wires = package
        .pins
        .iter()
        .map(|pin| {
            let boundary = Endpoint::boundary(&pin.name);
            let inner = Endpoint::at("dut", &pin.name);
            match pin.direction {
                Direction::Input => Connection {
                    from: boundary,
                    to: inner,
                },
                Direction::Output => Connection {
                    from: inner,
                    to: boundary,
                },
                _ => panic!("ALU template must have digital input/output pins"),
            }
        })
        .collect();
    Circuit {
        pins: package.pins.clone(),
        instances: vec![Instance {
            id: "dut".into(),
            ic_id: package.ic_id.clone(),
        }],
        wires,
    }
}

#[test]
fn sensitized_black_box_waveforms_match_fresh_flattened_pin_event_simulation() {
    for family in FAMILIES {
        let p = package(family);
        let external = wrap(p);
        // Include an exercised data transition and an opcode transition.
        for changed in ["a0", "op0"] {
            let ix = p.pins.iter().position(|pin| pin.name == changed).unwrap();
            let edge = p
                .macro_model
                .transitions
                .iter()
                .find(|edge| edge.before[ix] != edge.after[ix] && !edge.events.is_empty())
                .unwrap();
            let stimulus = [Stimulus {
                time_ns: 0.0,
                pin: changed.into(),
                value: edge.after[ix],
            }];
            let black = run_circuit(
                registry(),
                &external,
                &edge.before,
                &stimulus,
                SolveMode::BlackBox,
            )
            .unwrap();
            let flat = run_circuit(
                registry(),
                circuit(p),
                &edge.before,
                &stimulus,
                SolveMode::Flattened,
            )
            .unwrap();
            assert_eq!(black.outputs, flat.outputs);
            assert_eq!(black.events.len(), flat.events.len());
            for (a, b) in black.events.iter().zip(&flat.events) {
                assert_eq!((&a.pin, a.value, a.delay_ns), (&b.pin, b.value, b.delay_ns));
            }
            assert_eq!(black.dynamic_energy_j, flat.dynamic_energy_j);
            match (black.leakage_w, flat.leakage_w) {
                (Some(a), Some(b)) => {
                    // The nested and flat sums have different grouping.
                    assert!((a - b).abs() <= 1e-12 * b.abs());
                }
                (None, None) => {}
                other => panic!("leakage availability differs: {other:?}"),
            }
        }
    }
}

#[test]
fn an_alu_does_not_accept_out_of_domain_digits_or_cross_radix_wiring() {
    let p = package(AluFamily::Q4);
    let instance = CustomIcInstance::new(registry(), &p.ic_id).unwrap();
    assert!(instance.state(&[4, 0, 0, 0]).is_err());
    assert!(instance.transition(&[4, 0, 0, 0], &[4, 0, 0, 0]).is_err());
    assert!(instance.transition(&[0, 0, 0, 0], &[0, 2, 1, 0]).is_err());
    let mut invalid = wrap(p);
    invalid.pins[0] = Pin::digital("a0", Direction::Input, 3).unwrap();
    assert!(
        run_circuit(registry(), &invalid, &[0; 4], &[], SolveMode::BlackBox)
            .unwrap_err()
            .to_string()
            .contains("pin radix mismatch")
    );
    assert!(Packager::new(library())
        .package_circuit(
            "bad_alu_wiring",
            invalid,
            registry(),
            conditions(),
            p.footprint.clone(),
            AT,
        )
        .unwrap_err()
        .to_string()
        .contains("pin radix mismatch"));
}
