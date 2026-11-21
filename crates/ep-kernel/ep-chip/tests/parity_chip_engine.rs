//! WP-4.1 parity gate 1: register-file **bit-exact** against the Phase 0
//! `packages/chip-engine` harness (`rv32.mjs`).
//!
//! Golden vectors live in `tests/data/parity_vectors.json` and were captured
//! deterministically from the JS `createRV32` engine (see the fixture's
//! `_provenance` block). Every assertion here compares the full 32-register
//! file, the declared cycle count, the retire count, the halted flag, the PC
//! and 512 bytes of the memory image — bit-for-bit.

use ep_chip::twin::TwinCpu;
use serde_json::Value;

fn fixture() -> Value {
    let raw = include_str!("data/parity_vectors.json");
    serde_json::from_str(raw).expect("parity fixture parses")
}

fn run_twin_on(program: &[u32]) -> (Vec<u32>, Vec<u8>, u64, u64, bool, u32) {
    let mut cpu = TwinCpu::new(4096, 0);
    cpu.load(program, 0);
    let res = cpu.run(10_000);
    (
        cpu.regs_u32(),
        cpu.mem().to_vec(),
        res.cycles,
        res.retired,
        res.halted,
        cpu.pc(),
    )
}

#[test]
fn every_twin_vector_matches_bit_for_bit() {
    let fixture = fixture();
    for vector in fixture["twin"].as_array().expect("twin array") {
        let name = vector["name"].as_str().expect("name");
        let program: Vec<u32> = vector["program"]
            .as_array()
            .expect("program")
            .iter()
            .map(|v| v.as_u64().expect("u32 word") as u32)
            .collect();
        let expected_regs: Vec<u32> = vector["regs"]
            .as_array()
            .expect("regs")
            .iter()
            .map(|v| v.as_u64().expect("u32 reg") as u32)
            .collect();
        let expected_mem = vector["memHex"].as_str().expect("memHex");
        let expected_cycles = vector["cycles"].as_u64().expect("cycles");
        let expected_retired = vector["retired"].as_u64().expect("retired");
        let expected_halted = vector["halted"].as_bool().expect("halted");
        let expected_pc = vector["pc"].as_u64().expect("pc") as u32;

        let (regs, mem, cycles, retired, halted, pc) = run_twin_on(&program);

        // Full 32-register file, bit-exact (u32 view — the JS Int32Array dump
        // was captured with the same unsigned projection).
        assert_eq!(regs.len(), 32, "{name}: register file width");
        for i in 0..32 {
            assert_eq!(regs[i], expected_regs[i], "{name}: x{i} bit-exact");
        }
        // Declared cycle model parity (1 CPI ALU, 2 loads/stores, +1 taken branch).
        assert_eq!(cycles, expected_cycles, "{name}: cycle count");
        assert_eq!(retired, expected_retired, "{name}: retired count");
        assert_eq!(halted, expected_halted, "{name}: halted flag");
        assert_eq!(pc, expected_pc, "{name}: final PC");
        // Memory image: first 512 bytes bit-exact (little-endian byte order).
        let expected_bytes: Vec<u8> = (0..expected_mem.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&expected_mem[i..i + 2], 16).expect("hex byte"))
            .collect();
        assert_eq!(
            &mem[..expected_bytes.len()],
            &expected_bytes[..],
            "{name}: memory image bit-exact"
        );
    }
}

#[test]
fn twin_documented_reference_behaviors_hold() {
    // (1) HALT sentinel addi x0,x0,1 retires once and advances PC (JS quirk).
    let fixture = fixture();
    let p6 = &fixture["twin"]
        .as_array()
        .unwrap()
        .iter()
        .find(|v| v["name"] == "p6_halt_word")
        .expect("p6 vector");
    assert_eq!(p6["retired"].as_u64(), Some(1));
    assert_eq!(p6["pc"].as_u64(), Some(4));
    assert_eq!(p6["cycles"].as_u64(), Some(0));

    // (2) The SUB encoding executes as ADD in the twin (f3=0 branch ordering).
    let p2 = &fixture["twin"]
        .as_array()
        .unwrap()
        .iter()
        .find(|v| v["name"] == "p2_op_quirks")
        .expect("p2 vector");
    // x1=-6, x2=3 → "sub" x3 = -6 + 3 = -3 = 0xFFFFFFFD
    assert_eq!(
        p2["regs"].as_array().unwrap()[3].as_u64(),
        Some(0xffff_fffd)
    );

    // (3) Unknown encodings retire with zero cycles (p5 illegal word).
    let p5 = &fixture["twin"]
        .as_array()
        .unwrap()
        .iter()
        .find(|v| v["name"] == "p5_illegal")
        .expect("p5 vector");
    assert_eq!(p5["retired"].as_u64(), Some(4));
    assert_eq!(
        p5["cycles"].as_u64(),
        Some(2),
        "illegal word adds no cycles"
    );

    // (4) x0 is hardwired after every step.
    let p1 = &fixture["twin"]
        .as_array()
        .unwrap()
        .iter()
        .find(|v| v["name"] == "p1_addi_add")
        .expect("p1 vector");
    assert_eq!(p1["regs"].as_array().unwrap()[0].as_u64(), Some(0));
}

#[test]
fn declared_cycle_model_matches_instruction_mix() {
    // p1: 6 retired ALU-class instructions → 6 cycles (HALT adds none).
    let fixture = fixture();
    let p1 = &fixture["twin"]
        .as_array()
        .unwrap()
        .iter()
        .find(|v| v["name"] == "p1_addi_add")
        .expect("p1 vector");
    assert_eq!(p1["cycles"].as_u64(), Some(6));
    assert_eq!(p1["retired"].as_u64(), Some(7));

    // p3: 3 loads + 3 stores (2 cycles each) + 5 addi (1) = 18 cycles, 12 retired.
    let p3 = &fixture["twin"]
        .as_array()
        .unwrap()
        .iter()
        .find(|v| v["name"] == "p3_mem")
        .expect("p3 vector");
    assert_eq!(p3["cycles"].as_u64(), Some(18));
    assert_eq!(p3["retired"].as_u64(), Some(12));
}
