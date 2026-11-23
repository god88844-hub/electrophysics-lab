//! WP-5.5 acceptance tests: deterministic OpenQASM parse → noisy Lindblad
//! execution → seeded readout round-trips, fail-closed error handling, and
//! the hybrid classical-quantum control coupling (ep-chip RV32IM control
//! program ↔ ep-quantum Lindblad kernel).
//!
//! Every accepted path is badged `SIMULATED_NOISY_QUANTUM`; every rejected
//! path fails closed with a precise reason (line numbers for parse errors,
//! admission wording for `n > 6`, quench numbers for heat-budget trips).

use ep_core::admission::AdmissionController;
use ep_quantum::hybrid::{
    self, asm_addi, asm_li, asm_sw, bell_control_program, calibration, decode_entry, encode_entry,
    feedback_control_program, ghz_control_program, run_hybrid, HybridConfig, HybridError,
    HybridEvent, ScheduleEntry, MEAS_REG_BASE, OP_CX, OP_H, OP_MEASURE, SCHED_BASE, SUBMIT_REG,
};
use ep_quantum::qasm::{parse_qasm, run_qasm, QhalStatement};

const BADGE: &str = "SIMULATED_NOISY_QUANTUM";

fn controller() -> AdmissionController {
    AdmissionController::new()
}

// ---------------------------------------------------------------------------
// QASM → QHAL compilation
// ---------------------------------------------------------------------------

#[test]
fn bell_program_parses_to_expected_qhal() {
    let src = "OPENQASM 2.0;\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\n";
    let p = parse_qasm(src).expect("bell program must parse");
    assert_eq!(p.version, 2);
    assert_eq!(p.qreg_name, "q");
    assert_eq!(p.n_qubits, 2);
    assert_eq!(p.creg_name, "c");
    assert_eq!(p.n_classical, 2);
    assert_eq!(p.statements.len(), 4);
    match &p.statements[1] {
        QhalStatement::Gate2 {
            line,
            kind,
            control,
            target,
        } => {
            assert_eq!((*line, *control, *target), (5, 0, 1));
            assert_eq!(*kind, ep_quantum::qasm::Gate2Kind::Cx);
        }
        other => panic!("expected Gate2, got {other:?}"),
    }
    match &p.statements[2] {
        QhalStatement::Measure { line, q, c } => assert_eq!((*line, *q, *c), (6, 0, 0)),
        other => panic!("expected Measure, got {other:?}"),
    }
}

#[test]
fn openqasm3_declarations_and_measure_form_parse() {
    let src = "OPENQASM 3;\nqubit[2] q;\nbit[2] c;\nh q[0];\nc[0] = measure q[0];\nc[1] = measure q[1];\n";
    let p = parse_qasm(src).expect("3.0 program must parse");
    assert_eq!(p.version, 3);
    assert_eq!(p.n_qubits, 2);
    assert_eq!(p.n_classical, 2);
    assert_eq!(p.statements.len(), 3);

    // 3.0 single-register form `qubit q;` / `bit c;`.
    let src1 = "OPENQASM 3.0;\nqubit q;\nbit c;\nx q;\nc[0] = measure q;\n";
    let p1 = parse_qasm(src1).expect("single-register 3.0 form must parse");
    assert_eq!((p1.n_qubits, p1.n_classical), (1, 1));
}

#[test]
fn barrier_and_all_gate_kinds_parse() {
    let src = "OPENQASM 2.0;\nqreg q[3];\ncreg c[3];\n\
        x q[0];\ny q[0];\nz q[0];\ns q[0];\nt q[0];\n\
        rx(0.625) q[1];\nry(-0.5) q[1];\nrz(0.25) q[2];\n\
        cx q[0],q[2];\ncz q[1],q[2];\nbarrier q[0], q[1], q[2];\n";
    let p = parse_qasm(src).expect("gate zoo must parse");
    assert_eq!(p.statements.len(), 11);
    assert!(matches!(
        p.statements.last(),
        Some(QhalStatement::Barrier { qubits, .. }) if qubits == &vec![0, 1, 2]
    ));
    assert!(matches!(
        &p.statements[5],
        QhalStatement::Gate1 { gate: ep_quantum::qasm::Gate1Kind::Rx, theta, .. } if (*theta - 0.625).abs() < 1e-12
    ));
}

#[test]
fn drag_pulse_block_compiles_to_kernel_convention() {
    let src = "OPENQASM 2.0;\nqreg q[1];\ncreg c[1];\npulse { drag q[0], 100, 8.333, 0.5, 25; }\n";
    let p = parse_qasm(src).expect("pulse block must parse");
    match &p.statements[0] {
        QhalStatement::DragPulse {
            line,
            q,
            amplitude_mhz,
            sigma_ns,
            beta,
            duration_ns,
        } => {
            assert_eq!(*line, 4);
            assert_eq!(*q, 0);
            assert_eq!(*amplitude_mhz, 100.0);
            assert_eq!(*sigma_ns, 8.333);
            assert_eq!(*beta, 0.5);
            assert_eq!(*duration_ns, 25.0);
        }
        other => panic!("expected DragPulse, got {other:?}"),
    }
}

// ---------------------------------------------------------------------------
// QASM → noisy Lindblad → seeded readout round-trips
// ---------------------------------------------------------------------------

fn bell_src() -> &'static str {
    "OPENQASM 2.0;\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\n"
}

#[test]
fn bell_state_round_trip_is_deterministic_and_correlated() {
    let c = controller();
    let r1 = run_qasm(&parse_qasm(bell_src()).expect("parse"), &c, 7, 1.0).expect("run");
    let r2 = run_qasm(&parse_qasm(bell_src()).expect("parse"), &c, 7, 1.0).expect("run");
    // Byte-identical structural determinism (same seed ⇒ same bits/state).
    assert_eq!(
        serde_json::to_string(&r1).expect("serialize"),
        serde_json::to_string(&r2).expect("serialize")
    );
    assert_eq!(r1.badge, BADGE);
    assert_eq!(r1.measurements, 2);
    // Perfect correlation after collapse: c[0] == c[1], never mixed.
    assert_eq!(r1.classical_bits[0], r1.classical_bits[1]);
    // Exact gates keep the state pure; unitary path purity is 1 to f64.
    assert!((r1.purity - 1.0).abs() < 1e-9, "purity {}", r1.purity);
    assert_eq!(r1.bloch_vectors.len(), 2);
}

#[test]
fn bell_state_seed_sweep_hits_both_outcomes_and_stays_correlated() {
    let c = controller();
    let program = parse_qasm(bell_src()).expect("parse");
    let (mut saw00, mut saw11) = (false, false);
    for seed in 0..64u32 {
        let r = run_qasm(&program, &c, seed, 1.0).expect("run");
        assert_eq!(
            r.classical_bits[0], r.classical_bits[1],
            "seed {seed} must stay correlated"
        );
        match (r.classical_bits[0], r.classical_bits[1]) {
            (0, 0) => saw00 = true,
            (1, 1) => saw11 = true,
            _ => unreachable!("collapse keeps readouts correlated"),
        }
    }
    assert!(saw00 && saw11, "seed sweep must sample both Bell outcomes");
}

#[test]
fn ghz3_round_trip_is_deterministic_and_fully_correlated() {
    let src = "OPENQASM 2.0;\nqreg q[3];\ncreg c[3];\nh q[0];\ncx q[0],q[1];\ncx q[1],q[2];\n\
        measure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\n";
    let c = controller();
    let program = parse_qasm(src).expect("parse");
    let (mut all0, mut all1) = (false, false);
    for seed in 0..64u32 {
        let r = run_qasm(&program, &c, seed, 1.0).expect("run");
        let b = &r.classical_bits;
        assert!(
            (b[0], b[1], b[2]) == (0, 0, 0) || (b[0], b[1], b[2]) == (1, 1, 1),
            "GHZ readout must be fully correlated, got {b:?} (seed {seed})"
        );
        match (b[0], b[2]) {
            (0, 0) => all0 = true,
            (1, 1) => all1 = true,
            _ => {}
        }
        // Determinism: same seed replays identically.
        let again = run_qasm(&program, &c, seed, 1.0).expect("run");
        assert_eq!(
            serde_json::to_string(&r).expect("ser"),
            serde_json::to_string(&again).expect("ser")
        );
    }
    assert!(all0 && all1, "seed sweep must sample both GHZ outcomes");
}

#[test]
fn drag_pulse_exercises_the_noisy_lindblad_path() {
    // No trailing measure: a measurement collapses onto a pure basis state,
    // which would hide the dissipative signature we are proving here.
    let src = "OPENQASM 2.0;\nqreg q[1];\ncreg c[1];\npulse { drag q[0], 100, 8.333, 0.0, 25; }\n";
    let c = controller();
    let program = parse_qasm(src).expect("parse");
    let r = run_qasm(&program, &c, 11, 1.0).expect("run");
    assert_eq!(r.badge, BADGE);
    // The DRAG schedule integrates 60 kernel substeps (devices.rs convention).
    assert_eq!(r.cycles, 60);
    // Dissipation is real: purity strictly below 1 and the state has left |0⟩.
    assert!(
        r.purity < 1.0,
        "DRAG substeps must dissipate, purity {}",
        r.purity
    );
    let v = r.bloch_vectors[0];
    let mag = (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt();
    assert!(
        mag > 0.9,
        "pulse must rotate the state far from |0⟩, bloch {v:?}"
    );
    assert!(
        (v[2] - 1.0).abs() > 1e-6,
        "state must leave |0⟩, bloch {v:?}"
    );
    // Deterministic replay.
    let again = run_qasm(&program, &c, 11, 1.0).expect("run");
    assert_eq!(
        serde_json::to_string(&r).expect("ser"),
        serde_json::to_string(&again).expect("ser")
    );
}

// ---------------------------------------------------------------------------
// Fail-closed parse errors (precise lines) + admission
// ---------------------------------------------------------------------------

#[test]
fn unknown_gate_fails_closed_with_line() {
    let err = parse_qasm("OPENQASM 2.0;\nqreg q[1];\ncreg c[1];\nfoo q[0];\n")
        .expect_err("unknown gate must fail");
    assert_eq!(err.line, 4);
    assert!(err.message.contains("foo"), "{}", err.message);
    assert_eq!(
        err.to_string(),
        "QASM parse error at line 4: ".to_owned() + &err.message
    );
}

#[test]
fn out_of_range_qubit_fails_closed_with_line() {
    let err = parse_qasm("OPENQASM 2.0;\nqreg q[2];\ncreg c[2];\nh q[5];\n")
        .expect_err("q[5] of q[2] must fail");
    assert_eq!(err.line, 4);
    assert!(err.message.contains("5"), "{}", err.message);
}

#[test]
fn out_of_range_bit_fails_closed_with_line() {
    let err = parse_qasm("OPENQASM 2.0;\nqreg q[2];\ncreg c[2];\nmeasure q[0] -> c[5];\n")
        .expect_err("c[5] of c[2] must fail");
    assert_eq!(err.line, 4);
}

#[test]
fn missing_header_and_empty_program_fail_closed() {
    let e1 = parse_qasm("qreg q[1];\n").expect_err("missing header must fail");
    assert_eq!(e1.line, 1);
    assert!(e1.message.contains("OPENQASM"), "{}", e1.message);
    let e2 = parse_qasm("").expect_err("empty program must fail");
    assert_eq!(e2.line, 1);
}

#[test]
fn unsupported_version_and_duplicate_decls_fail_closed() {
    let e1 = parse_qasm("OPENQASM 4;\nqreg q[1];\n").expect_err("version 4 must fail");
    assert_eq!(e1.line, 1);
    let e2 = parse_qasm("OPENQASM 2.0;\nqreg q[1];\nqreg q[1];\n")
        .expect_err("duplicate qreg must fail");
    assert_eq!(e2.line, 3);
    let e3 = parse_qasm("OPENQASM 2.0;\nqreg q[1];\ncreg c[1];\ncreg c[1];\n")
        .expect_err("duplicate creg must fail");
    assert_eq!(e3.line, 4);
}

#[test]
fn malformed_pulse_block_fails_closed() {
    let e1 = parse_qasm("OPENQASM 2.0;\nqreg q[1];\npulse { sq q[0], 1, 2, 3, 4; }\n")
        .expect_err("non-drag pulse must fail");
    assert_eq!(e1.line, 3);
    let e2 = parse_qasm("OPENQASM 2.0;\nqreg q[1];\npulse { drag q[0], abc, 8, 0, 25; }\n")
        .expect_err("non-numeric pulse param must fail");
    assert_eq!(e2.line, 3);
    let e3 = parse_qasm("OPENQASM 2.0;\nqreg q[1];\npulse drag q[0], 1, 2, 3, 4; }\n")
        .expect_err("missing brace must fail");
    assert_eq!(e3.line, 3);
}

#[test]
fn seven_qubit_program_is_refused_by_ep_core_admission() {
    let src = "OPENQASM 2.0;\nqreg q[7];\ncreg c[7];\nh q[0];\nmeasure q[0] -> c[0];\n";
    let err = parse_qasm(src).expect_err("n=7 compilation must be refused");
    assert_eq!(err.line, 2);
    assert!(err.message.contains("7 qubits > 6"), "{err}");
    let mut forged = parse_qasm("OPENQASM 3; qubit q;").unwrap();
    forged.n_qubits = 7;
    assert!(run_qasm(&forged, &controller(), 1, 1.0)
        .unwrap_err()
        .contains("7 qubits > 6"));
}

// ---------------------------------------------------------------------------
// Hybrid: RV32IM control program ↔ Lindblad kernel
// ---------------------------------------------------------------------------

fn hybrid_cfg(program: Vec<u32>, n: usize) -> HybridConfig {
    HybridConfig {
        control_program: program,
        clock_mhz: 100.0,
        seed: 42,
        readout_fidelity: Some(1.0),
        drive_power_w: 1.0e-3,
        n_qubits: n,
    }
}

#[test]
fn hybrid_calibration_is_anchored_to_sealed_04_json() {
    let cal = calibration().expect("calibration must load from the verified 04 JSON");
    assert!((cal.t1_s - 100.0e-6).abs() < 1e-15);
    assert!((cal.t2_s - 150.0e-6).abs() < 1e-15);
    assert!((cal.readout_fidelity - 0.98).abs() < 1e-12);
    assert!((cal.gate_1q_duration_ns - 25.0).abs() < 1e-12);
    assert!((cal.stage_15mk_cooling_w - 0.012).abs() < 1e-15);
    assert!((cal.mixing_chamber_temp_mk - 15.0).abs() < 1e-12);
}

#[test]
fn hybrid_bell_round_trip_deterministic_with_event_ordering() {
    let c = controller();
    let cfg = hybrid_cfg(bell_control_program(), 2);
    let r1 = run_hybrid(&cfg, &c).expect("bell hybrid run");
    let r2 = run_hybrid(&cfg, &c).expect("bell hybrid run replay");
    assert_eq!(
        serde_json::to_string(&r1).expect("ser"),
        serde_json::to_string(&r2).expect("ser"),
        "same seed must replay identically"
    );
    assert_eq!(r1.badge, BADGE);
    assert_eq!(r1.schedules_executed, 1);
    assert_eq!(r1.total_measurements, 0);
    // Strict event order: control → idle → [h, cx] → heat checkpoint.
    assert_eq!(r1.events.len(), 5);
    assert!(matches!(
        &r1.events[0],
        HybridEvent::Control {
            latency_cycles: 9,
            retired_instructions: 7,
            ..
        }
    ));
    assert!(matches!(&r1.events[1], HybridEvent::Idle { .. }));
    assert!(matches!(
        &r1.events[2],
        HybridEvent::Quantum { op, qubit: 0, operand: 0 } if op == "h"
    ));
    assert!(matches!(
        &r1.events[3],
        HybridEvent::Quantum { op, qubit: 0, operand: 1 } if op == "cx"
    ));
    assert!(matches!(&r1.events[4], HybridEvent::Heat { .. }));
    // The 25 ns H and 300 ns CX both dissipate microwave power.
    let expected = cfg.drive_power_w * 325.0 / (325.0 + 90.0);
    assert!((r1.heat_load_w - expected).abs() < 1e-12);
    assert_eq!(r1.peak_stage_load_w, cfg.drive_power_w);
    assert!(r1.heat_load_w > 0.0 && r1.heat_load_w < r1.heat_budget_w);
    assert!((r1.heat_budget_w - 0.012).abs() < 1e-15);
    // Entanglement: q0 Bloch ≈ origin, q1 ≈ origin (Bell has reduced I/2).
    for (k, v) in r1.bloch_vectors.iter().enumerate() {
        let m = (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt();
        assert!(
            m < 0.05,
            "qubit {k} must be maximally mixed in Bell, |b| = {m}"
        );
    }
}

#[test]
fn hybrid_ghz_program_runs_three_entries() {
    let c = controller();
    let cfg = hybrid_cfg(ghz_control_program(3).expect("program"), 3);
    let r = run_hybrid(&cfg, &c).expect("ghz hybrid run");
    assert_eq!(r.badge, BADGE);
    assert_eq!(r.schedules_executed, 1);
    let quantum: Vec<&HybridEvent> = r
        .events
        .iter()
        .filter(|e| matches!(e, HybridEvent::Quantum { .. }))
        .collect();
    assert_eq!(quantum.len(), 3, "h + 2×cx");
    // Triple correlation |000⟩+|111⟩: every reduced Bloch vector ≈ origin.
    for (k, v) in r.bloch_vectors.iter().enumerate() {
        let m = (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt();
        assert!(m < 0.05, "GHZ qubit {k} must be maximally mixed, |b| = {m}");
    }
    assert!(r.classical_bits.iter().all(|b| b.is_none()));
}

#[test]
fn hybrid_conditional_bit_flip_feedback_hits_both_branches() {
    let c = controller();
    let program = feedback_control_program();
    let (mut saw_flip, mut saw_h) = (false, false);
    for seed in 0..32u32 {
        let cfg = HybridConfig {
            control_program: program.clone(),
            seed,
            ..hybrid_cfg(Vec::new(), 2)
        };
        let r = run_hybrid(&cfg, &c).expect("feedback run");
        assert_eq!(r.badge, BADGE);
        assert_eq!(r.schedules_executed, 3, "Bell prep + measure + conditional");
        assert_eq!(r.total_measurements, 1);
        // Locate the mid-circuit measurement + its register write-back.
        let meas = r.events.iter().find_map(|e| match e {
            HybridEvent::Measure {
                measured_bit,
                readout_fidelity,
                ..
            } => Some((*measured_bit, *readout_fidelity)),
            _ => None,
        });
        let (bit, fidelity) = meas.expect("one Measure event");
        assert!((fidelity - 1.0).abs() < 1e-12);
        assert!(matches!(
            r.events.iter().find(|e| matches!(e, HybridEvent::Feedback { .. })),
            Some(HybridEvent::Feedback { register, measured_bit: b })
                if *register == MEAS_REG_BASE && *b == bit
        ));
        // The conditional action must match the measured bit...
        let last_q = r
            .events
            .iter()
            .rev()
            .find_map(|e| match e {
                HybridEvent::Quantum { op, qubit, .. } => Some((op.as_str(), *qubit)),
                _ => None,
            })
            .expect("one conditional quantum action");
        // ...and the final state must match the physics of that action:
        // bit 1 ⇒ X q1 (conditional bit flip): |11⟩→|10⟩ ⇒ q1 = |0⟩ ⇒ ⟨Z⟩ ≈ 1;
        // bit 0 ⇒ H q1: |00⟩→ q1 = |+⟩ ⇒ ⟨X⟩ ≈ 1.
        match bit {
            1 => {
                assert_eq!(last_q, ("x", 1), "bit 1 must trigger the X feedback");
                assert!(
                    r.bloch_vectors[1][2] > 0.99,
                    "q1 must be |0⟩, bloch {:?}",
                    r.bloch_vectors[1]
                );
                saw_flip = true;
            }
            0 => {
                assert_eq!(last_q, ("h", 1), "bit 0 must trigger the H feedback");
                assert!(
                    r.bloch_vectors[1][0] > 0.99,
                    "q1 must be |+⟩, bloch {:?}",
                    r.bloch_vectors[1]
                );
                saw_h = true;
            }
            _ => unreachable!(),
        }
    }
    assert!(
        saw_flip && saw_h,
        "seed sweep must exercise both feedback branches (flip={saw_flip}, h={saw_h})"
    );
}

#[test]
fn hybrid_controller_latency_decays_into_t1_t2_idle_decoherence() {
    let c = controller();
    // Two-segment program: seg1 = [H q0] (q0 → |+⟩, Bloch x = 1), seg2 =
    // [RX90 q0] (rotation about x — preserves ⟨X⟩). The seg2 controller
    // latency idles the COHERENT |+⟩ state before RX90 lands, so the final
    // Bloch x is exactly the post-latency coherence: slow clock ⇒ visible
    // T1/T2 decay, fast clock ⇒ near-perfect (04-JSON T1 = 100 µs, T2 = 150 µs).
    let build = || {
        let mut p = Vec::new();
        p.extend(asm_li(4, SCHED_BASE));
        p.extend(asm_li(5, OP_H << 8)); // H q0 = 0x100
        p.push(asm_sw(5, 0, 4));
        p.push(asm_addi(SUBMIT_REG, 0, 1));
        p.extend(asm_li(5, hybrid::OP_RX90 << 8)); // RX90 q0 = 0x300
        p.push(asm_sw(5, 0, 4));
        p.push(asm_addi(SUBMIT_REG, 0, 1));
        p.push(hybrid::ASM_EBREAK);
        p
    };
    let fast = HybridConfig {
        clock_mhz: 1.0e6,
        ..hybrid_cfg(build(), 1)
    };
    let slow = HybridConfig {
        clock_mhz: 10.0,
        ..hybrid_cfg(build(), 1)
    };
    let rf = run_hybrid(&fast, &c).expect("fast run");
    let rs = run_hybrid(&slow, &c).expect("slow run");
    assert!(rs.control_latency_s > rf.control_latency_s);
    // ~300 ns of controller latency on the slow clock vs ~ps on the fast one.
    assert!(
        rs.control_latency_s > 100.0e-9,
        "slow-clock latency {} s",
        rs.control_latency_s
    );
    assert!(
        rf.control_latency_s < 1.0e-9,
        "fast-clock latency {} s",
        rf.control_latency_s
    );
    // Coherence decay: H q0 → |+⟩ with ⟨X⟩ ≈ e^(−t/T2) before RX90 preserves
    // it (purity is unusable here — its integrator drift ~1e-14 would swamp
    // the ordering).
    let fx = rf.bloch_vectors[0][0];
    let sx = rs.bloch_vectors[0][0];
    let post_h_idle = |report: &hybrid::HybridReport| {
        let second_idle = report
            .events
            .iter()
            .filter_map(|event| {
                if let HybridEvent::Idle { duration_s } = event {
                    Some(*duration_s)
                } else {
                    None
                }
            })
            .nth(1)
            .unwrap();
        (-(50e-9 + second_idle) / calibration().unwrap().t2_s).exp()
    };
    assert!(
        (fx - post_h_idle(&rf)).abs() < 1e-10,
        "fast X expectation {fx}"
    );
    assert!(
        (sx - post_h_idle(&rs)).abs() < 1e-10,
        "slow X expectation {sx}"
    );
    assert!(
        sx < fx,
        "longer controller latency must decay more (slow {sx} < fast {fx})"
    );
    assert!(
        sx > 0.99,
        "decay must stay in the physically expected band, x = {sx}"
    );
}

#[test]
fn hybrid_heat_quench_fails_closed_at_the_15mk_budget() {
    let c = controller();
    // Even a single pulse over the sealed stage limit is terminal.
    let hot = HybridConfig {
        drive_power_w: 1.0,
        ..hybrid_cfg(bell_control_program(), 2)
    };
    let err = run_hybrid(&hot, &c).expect_err("1 W drive must quench");
    assert!(err.to_string().contains("quench"));
    match err {
        HybridError::Quench {
            heat_load_w,
            budget_w,
            events,
            forensic,
        } => {
            assert_eq!(heat_load_w, 1.0);
            assert_eq!(budget_w, 0.012);
            assert!(matches!(
                events.last(),
                Some(HybridEvent::Quench { coherence: 0.0, .. })
            ));
            assert!(events
                .iter()
                .all(|event| !matches!(event, HybridEvent::Quantum { .. })));
            assert_eq!(forensic.failure.kind, "cryo_quench");
            assert!(forensic.peaks.stage_temp_peak_k > 0.015);
        }
        other => panic!("expected Quench, got {other:?}"),
    }
    // Same program at a realistic 1 mW stays inside the budget.
    let cool = hybrid_cfg(bell_control_program(), 2);
    let r = run_hybrid(&cool, &c).expect("1 mW drive must survive");
    assert!(r.heat_load_w < r.heat_budget_w);
    let edge = HybridConfig {
        drive_power_w: 0.012,
        ..cool
    };
    let r = run_hybrid(&edge, &c).expect("exactly 12 mW is admitted");
    assert_eq!(r.peak_stage_load_w, r.heat_budget_w);
}

#[test]
fn hybrid_fail_closed_on_no_schedule_unknown_op_and_bad_qubit() {
    let c = controller();
    // Control program that halts without ever ringing the doorbell.
    let err = run_hybrid(&hybrid_cfg(vec![hybrid::ASM_EBREAK], 2), &c)
        .expect_err("halt-without-schedule must fail");
    assert!(matches!(err, HybridError::NoSchedule));
    assert!(err.to_string().contains("without submitting"));

    // Unknown schedule op code (99).
    let mut p = Vec::new();
    p.extend(asm_li(4, SCHED_BASE));
    p.extend(asm_li(5, 99 << 8));
    p.push(asm_sw(5, 0, 4));
    p.push(asm_addi(SUBMIT_REG, 0, 1));
    p.push(hybrid::ASM_EBREAK);
    let err = run_hybrid(&hybrid_cfg(p, 2), &c).expect_err("op 99 must fail");
    assert!(matches!(err, HybridError::ScheduleOp { index: 0, op: 99 }));

    // Out-of-range qubit: H on q5 of a 2-qubit register.
    let mut p = Vec::new();
    p.extend(asm_li(4, SCHED_BASE));
    p.extend(asm_li(5, (OP_H << 8) | (5 << 4)));
    p.push(asm_sw(5, 0, 4));
    p.push(asm_addi(SUBMIT_REG, 0, 1));
    p.push(hybrid::ASM_EBREAK);
    let err = run_hybrid(&hybrid_cfg(p, 2), &c).expect_err("q5 of 2 must fail");
    assert!(matches!(
        err,
        HybridError::ScheduleQubit {
            index: 0,
            qubit: 5,
            n_qubits: 2
        }
    ));
    assert!(err.to_string().contains("outside the 2-qubit register"));
}

#[test]
fn hybrid_refuses_seven_qubits_through_admission() {
    let c = controller();
    let err = run_hybrid(&hybrid_cfg(bell_control_program(), 7), &c)
        .expect_err("n=7 interactive must be refused");
    assert!(matches!(err, HybridError::Admission(_)));
    assert!(err.to_string().contains("cap"));
}

#[test]
fn hybrid_readout_fidelity_typical_is_anchored_noise() {
    // With the 04-JSON typical fidelity (0.98) the classical bit can flip
    // against the sampled quantum outcome — deterministic per seed, but
    // over a seed sweep the flip must occur (real readout noise, no fake
    // perfection).
    let c = controller();
    let program = feedback_control_program();
    let (mut flips, mut runs) = (0usize, 0usize);
    for seed in 0..200u32 {
        let cfg = HybridConfig {
            control_program: program.clone(),
            readout_fidelity: None, // 04-JSON typical 0.98
            seed,
            ..hybrid_cfg(Vec::new(), 2)
        };
        let r = run_hybrid(&cfg, &c).expect("run");
        runs += 1;
        if let Some(HybridEvent::Measure {
            sampled_bit,
            measured_bit,
            ..
        }) = r
            .events
            .iter()
            .find(|e| matches!(e, HybridEvent::Measure { .. }))
        {
            if sampled_bit != measured_bit {
                flips += 1;
            }
        }
    }
    assert_eq!(runs, 200);
    assert!(
        flips > 0,
        "0.98 readout fidelity must flip some readouts over {runs} runs"
    );
    assert!(
        flips < runs / 2,
        "readout noise must stay rare-ish ({flips}/{runs})"
    );
}

#[test]
fn hybrid_schedule_codec_round_trips() {
    let e = ScheduleEntry {
        op: OP_CX,
        qubit: 3,
        operand: 5,
    };
    assert_eq!(decode_entry(encode_entry(&e).unwrap()), e);
    let m = ScheduleEntry {
        op: OP_MEASURE,
        qubit: 0,
        operand: 0,
    };
    assert_eq!(decode_entry(encode_entry(&m).unwrap()).op, OP_MEASURE);
}

#[test]
fn qasm_supports_standard_includes_register_measurement_and_pi_rotations() {
    let program = parse_qasm(
        "OPENQASM 3.0; include \"stdgates.inc\"; qubit[2] q; bit[2] c;\n\
         rx( pi / 2 ) q[0]; rx(2 * pi / 4) q[0]; barrier q;\n\
         cx q[0], q[1]; c = measure q;",
    )
    .unwrap();
    let result = run_qasm(&program, &controller(), 9, 1.0).unwrap();
    assert_eq!(result.classical_bits, [1, 1]);
    assert_eq!(result.measurements, 2);
}

#[test]
fn malformed_qasm_cannot_be_reinterpreted_as_a_valid_prefix() {
    for statement in [
        "h wrong[0];",
        "h q[0;",
        "h q[0]];",
        "h q[0]",
        "h q[0]; /* unclosed",
        "cx q[0],q[1] extra;",
        "rx(0)ignored q[0];",
        "rx(pi / inf) q[0];",
        "pulse { drag q[0], 100, 0, 0, 25; }",
        "measure q -> c[0];",
    ] {
        let src = format!("OPENQASM 2.0;\nqreg q[2];\ncreg c[2];\n{statement}");
        assert_eq!(parse_qasm(&src).unwrap_err().line, 4, "{statement}");
    }
    for input in [
        "OPENQASM 2.9; qreg q[1];",
        "OPENQASM2.0; qreg q[1];",
        "OPENQASM 3.0; include \"custom.inc\"; qubit q;",
        "OPENQASM 3.0; qubit extra[1] q;",
        "OPENQASM 2.0; qreg q[1] trailing;",
        "OPENQASM 3.0; bit[1000000] c; qubit q;",
    ] {
        assert!(parse_qasm(input).is_err(), "{input}");
    }
    let mut forged = parse_qasm("OPENQASM 3.0; qubit q; h q;").unwrap();
    assert!(run_qasm(&forged, &controller(), 1, f64::NAN).is_err());
    forged.statements[0] = QhalStatement::Measure {
        line: 1,
        q: 8,
        c: 0,
    };
    assert!(run_qasm(&forged, &controller(), 1, 1.0).is_err());
}

#[test]
fn qasm_controlled_z_changes_relative_phase_without_negating_populations() {
    let src = "OPENQASM 3.0; qubit[2] q; x q[0]; h q[1]; cz q[0], q[1]; h q[1];";
    let result = run_qasm(&parse_qasm(src).unwrap(), &controller(), 9, 1.0).unwrap();
    assert!(result.bloch_vectors.iter().all(|v| v[2] < -0.97));
    assert!((0.97..1.0).contains(&result.purity));
}

#[test]
fn mid_circuit_measurement_preserves_the_other_qubit_and_separates_readout_error() {
    let program = parse_qasm("OPENQASM 3.0; qubit[2] q; bit c; h q[1]; c = measure q[0];").unwrap();
    let result = run_qasm(&program, &controller(), 4, 0.0).unwrap();
    assert_eq!(result.classical_bits, [1]);
    assert!((result.bloch_vectors[0][2] - 1.0).abs() < 1e-12);
    assert!(result.bloch_vectors[1][0] > 0.999);
}

#[test]
fn pulse_fidelity_responds_to_parameter_edits() {
    let run = |amplitude| {
        let src = format!("OPENQASM 3.0; qubit q; pulse {{ drag q, {amplitude}, 8.333, 0, 25; }}");
        run_qasm(&parse_qasm(&src).unwrap(), &controller(), 9, 1.0).unwrap()
    };
    let undriven = run(0.0);
    let calibrated = run(27.63);
    assert!((undriven.pulse_fidelities[0].average_fidelity_vs_x - 1.0 / 3.0).abs() < 1e-4);
    let fidelity = calibrated.pulse_fidelities[0].average_fidelity_vs_x;
    assert!(
        (0.999..1.0).contains(&fidelity),
        "noisy X fidelity {fidelity}"
    );
    assert!(calibrated.bloch_vectors[0][2] < -0.999);
}

#[test]
fn hybrid_classical_cycles_match_the_ep_chip_twin_model() {
    let program = bell_control_program();
    let mut twin = ep_chip::TwinCpu::new(4096, 0);
    twin.load(&program[..program.len() - 1], 0);
    let retired = (program.len() - 1) as u64;
    let timing = twin.run(retired);
    let executed = run_hybrid(&hybrid_cfg(program, 2), &controller()).unwrap();
    assert_eq!(executed.retired_instructions, timing.retired);
    assert_eq!(executed.control_latency_cycles, timing.cycles);
    assert!(timing.cycles > timing.retired);
}

#[test]
fn hybrid_mailbox_rejects_malformed_counts_words_and_stale_schedules() {
    let controller = controller();
    for (word, count) in [
        (OP_H << 8, 65),
        (OP_H << 8, 2),
        ((OP_H << 8) | 1, 1),
        (OP_CX << 8, 1),
    ] {
        let mut program = asm_li(4, SCHED_BASE);
        program.extend(asm_li(5, word));
        program.extend([
            asm_sw(5, 0, 4),
            asm_addi(SUBMIT_REG, 0, count),
            hybrid::ASM_EBREAK,
        ]);
        let error = run_hybrid(&hybrid_cfg(program, 2), &controller).unwrap_err();
        assert!(matches!(error, HybridError::ScheduleFormat(_)), "{error}");
    }

    let mut program = bell_control_program();
    program.insert(program.len() - 1, asm_addi(SUBMIT_REG, 0, 1));
    let error = run_hybrid(&hybrid_cfg(program, 2), &controller).unwrap_err();
    assert!(matches!(error, HybridError::ScheduleFormat(_)));
    assert!(encode_entry(&ScheduleEntry {
        op: OP_H,
        qubit: 16,
        operand: 0
    })
    .is_err());
}

#[test]
fn hybrid_executes_a_calibrated_drag_x_schedule() {
    let word = encode_entry(&ScheduleEntry {
        op: hybrid::OP_DRAG_X,
        qubit: 0,
        operand: 0,
    })
    .unwrap();
    let mut program = asm_li(4, SCHED_BASE);
    program.extend(asm_li(5, word));
    program.extend([
        asm_sw(5, 0, 4),
        asm_addi(SUBMIT_REG, 0, 1),
        hybrid::ASM_EBREAK,
    ]);
    let result = run_hybrid(&hybrid_cfg(program, 1), &controller()).unwrap();
    assert!(matches!(&result.events[2], HybridEvent::Quantum { op, .. } if op == "drag_x"));
    assert!(result.bloch_vectors[0][2] < -0.999);
    assert!((0.999..1.0).contains(&result.purity));
}

#[test]
fn layer_one_die_dissipation_trips_the_shared_cryo_forensics() {
    use ep_thermal::{verified_materials, BoundaryMode, Scheme, ThermalGrid2D};

    let controller = controller();
    let silicon = verified_materials().unwrap().silicon;
    let mut grid = ThermalGrid2D::new(
        3,
        3,
        100e-6,
        500e-6,
        silicon.rho_c(),
        silicon.k_w_mk,
        0.015,
        0.0,
        BoundaryMode::DirichletAmbient,
        Scheme::BackwardEuler,
        &controller,
    )
    .unwrap();
    let mut die_power = vec![0.0; 9];
    die_power[4] = 0.013;
    grid.power_w = Some(die_power);
    let config = HybridConfig {
        drive_power_w: 0.0,
        ..hybrid_cfg(bell_control_program(), 2)
    };
    let error = hybrid::run_hybrid_with_grid(&config, &controller, grid).unwrap_err();
    let HybridError::Quench {
        events, forensic, ..
    } = error
    else {
        panic!("expected a quench from the die source, got {error}");
    };
    assert!(matches!(
        events.as_slice(),
        [
            HybridEvent::Control { .. },
            HybridEvent::Quench { coherence: 0.0, .. }
        ]
    ));
    assert_eq!(forensic.failure.value, 0.013);
    assert_eq!(forensic.failure.threshold, 0.012);
}
