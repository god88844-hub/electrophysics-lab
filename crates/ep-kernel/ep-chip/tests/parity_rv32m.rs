//! WP-4.1 parity gate 2: RV32IM M-extension semantics — bit-exact against
//! the Phase 0 RV32M vectors (`tests/rv32m.test.mjs`) and the frozen Phase 8
//! acceptance manifest (`benchmarks/phase8/acceptance.json`), with the full
//! 12×12 operand edge matrix cross-checked against exact BigInt arithmetic.

use ep_chip::cpu::{Cpu, CpuIsa};
use ep_chip::isa::encode;

/// `opM(funct3, rd=3, rs1=1, rs2=2)` of tests/rv32m.test.mjs.
fn op_m(funct3: u32, rd: u32, rs1: u32, rs2: u32) -> u32 {
    encode::m_ext(funct3, rd, rs1, rs2)
}

fn execute_m(funct3: u32, a: i32, b: i32) -> (u32, String) {
    let mut cpu = Cpu::new(
        &[op_m(funct3, 3, 1, 2), encode::ebreak()],
        64,
        0,
        0,
        16,
        CpuIsa::Rv32im,
    )
    .expect("valid config");
    cpu.regs_set(1, a);
    cpu.regs_set(2, b);
    let out = cpu.run(5).expect("run");
    (out.regs[3], out.traces[0].mnemonic.clone())
}

#[test]
fn rv32m_is_opt_in_and_plain_rv32i_rejects_all_eight_encodings() {
    for funct3 in 0..8_u32 {
        let mut cpu = Cpu::new(
            &[op_m(funct3, 3, 1, 2), encode::ebreak()],
            64,
            0,
            0,
            16,
            CpuIsa::Rv32i,
        )
        .expect("valid config");
        let out = cpu.run(5).expect("run");
        assert!(!out.ok, "funct3 {funct3}: RV32I default must not succeed");
        assert_eq!(out.stop_reason, "illegal-instruction");
        assert_eq!(out.retired, 0, "trap happens before retirement");
        assert_eq!(out.regs[3], 0);
    }
}

#[test]
fn mul_family_exact_lower_and_high_words() {
    // Vectors straight from tests/rv32m.test.mjs.
    let vectors: [(u32, i32, i32, u32, &str); 7] = [
        (0, -1, i32::MAX, 0x8000_0001, "MUL"),
        (1, -1, i32::MAX, 0xffff_ffff, "MULH"),
        (2, -2_147_483_648, -1, 0x8000_0000, "MULHSU"),
        (3, -1, -1, 0xffff_fffe, "MULHU"),
        (1, -2_147_483_648, -1, 0x0000_0000, "MULH"),
        (2, -1, -1, 0xffff_ffff, "MULHSU"),
        (3, -2_147_483_648, 2, 1, "MULHU"),
    ];
    for (fn3, a, b, expected, mnemonic) in vectors {
        let (value, trace) = execute_m(fn3, a, b);
        assert_eq!(value, expected, "funct3 {fn3} value mismatch");
        assert_eq!(trace, mnemonic);
    }
}

#[test]
fn div_rem_sign_and_rounding_rules() {
    let vectors: [(u32, i32, i32, u32, &str); 8] = [
        (4, -7, 3, 0xffff_fffe, "DIV"), // -7 / 3 = -2 (trunc)
        (4, 7, -3, 0xffff_fffe, "DIV"), // 7 / -3 = -2
        (4, -7, -3, 2, "DIV"),
        (5, -1, 2, 0x7fff_ffff, "DIVU"), // 0xffffffff / 2
        (6, -7, 3, 0xffff_ffff, "REM"),  // -7 % 3 = -1
        (6, 7, -3, 1, "REM"),
        (6, -7, -3, 0xffff_ffff, "REM"),
        (7, -1, 2, 1, "REMU"),
    ];
    for (fn3, a, b, expected, mnemonic) in vectors {
        let (value, trace) = execute_m(fn3, a, b);
        assert_eq!(value, expected, "funct3 {fn3} a={a} b={b}");
        assert_eq!(trace, mnemonic);
    }
}

#[test]
fn division_by_zero_is_architecturally_defined() {
    // DIV/DIVU by zero → -1 (all one bits); REM/REMU by zero → dividend.
    for (fn3, a, expected) in [
        (4_u32, -123_i32, 0xffff_ffff_u32),
        (5, -123, 0xffff_ffff),
        (6, -123, (-123_i32) as u32),
        (7, -123, (-123_i32) as u32),
        (4, 0, 0xffff_ffff),
        (5, 0, 0xffff_ffff),
        (6, 0, 0),
        (7, 0, 0),
    ] {
        let (value, _) = execute_m(fn3, a, 0);
        assert_eq!(
            value, expected,
            "funct3 {fn3} a={a}: no exceptions or guesses"
        );
    }
}

#[test]
fn signed_overflow_min_minus_one() {
    let (div, _) = execute_m(4, i32::MIN, -1);
    assert_eq!(div, i32::MIN as u32, "DIV overflow preserves wrap result");
    let (rem, _) = execute_m(6, i32::MIN, -1);
    assert_eq!(rem, 0, "REM overflow is zero");
}

#[test]
fn m_results_cannot_modify_x0() {
    for funct3 in 0..8_u32 {
        let mut cpu = Cpu::new(
            &[op_m(funct3, 0, 1, 2), encode::ebreak()],
            64,
            0,
            0,
            16,
            CpuIsa::Rv32im,
        )
        .expect("valid config");
        cpu.regs_set(1, 3);
        cpu.regs_set(2, 0);
        let out = cpu.run(5).expect("run");
        assert!(out.ok);
        assert_eq!(out.regs[0], 0);
    }
}

#[test]
fn full_edge_operand_matrix_matches_exact_bigint_arithmetic() {
    // Mirror of tests/rv32m.test.mjs "arbitrary edge operand combinations":
    // the same 12-value list crossed with itself over all eight M functions,
    // expected values computed with exact 64-bit integer arithmetic (the
    // Rust analog of the JS BigInt reference).
    let values: [i32; 12] = [
        0,
        1,
        -1,
        2,
        -2,
        7,
        -7,
        1_234_567,
        -1_234_567,
        i32::MAX,
        i32::MIN,
        0x8000_0001_u32 as i32,
    ];
    let mask = 0xffff_ffff_u64;
    let mut cases = 0_u64;
    for a in values {
        for b in values {
            let av = i64::from(a);
            let bv = i64::from(b);
            let au = u64::from(a as u32);
            let bu = u64::from(b as u32);
            let expected = [
                ((av * bv) as u64 & mask) as u32,                // MUL
                (((av * bv) >> 32) as u64 & mask) as u32,        // MULH
                (((av * bu as i64) >> 32) as u64 & mask) as u32, // MULHSU
                ((au * bu) >> 32) as u32,                        // MULHU
                if b == 0 {
                    u32::MAX
                } else {
                    ((av / bv) as u64 & mask) as u32
                }, // DIV
                if b == 0 { u32::MAX } else { (au / bu) as u32 }, // DIVU
                if b == 0 {
                    a as u32
                } else {
                    ((av % bv) as u64 & mask) as u32
                }, // REM
                if b == 0 { a as u32 } else { (au % bu) as u32 }, // REMU
            ];
            for (fn3, &exp) in expected.iter().enumerate() {
                let (value, _) = execute_m(fn3 as u32, a, b);
                assert_eq!(value, exp, "funct3 {fn3} a={a} b={b}");
                cases += 1;
            }
        }
    }
    assert_eq!(cases, 12 * 12 * 8);
}

#[test]
fn frozen_phase8_manifest_values_reproduce() {
    // benchmarks/phase8/acceptance.json requiredCases (frozen expected values).
    let cases: [(&str, u32, i32, i32, u32); 12] = [
        ("mul-low", 0, 7, 11, 77),
        ("mulh-signed", 1, i32::MIN, -1, 0),
        ("mulhsu-mixed", 2, i32::MIN, -1, 0x8000_0000),
        ("mulhu-unsigned", 3, i32::MIN, -1, 0x7fff_ffff),
        ("div-signed-overflow", 4, i32::MIN, -1, 0x8000_0000),
        ("divu-unsigned", 5, i32::MIN, -1, 0),
        ("rem-signed-overflow", 6, i32::MIN, -1, 0),
        ("remu-unsigned", 7, i32::MIN, -1, 0x8000_0000),
        ("div-zero", 4, 7, 0, 4294967295),
        ("divu-zero", 5, 7, 0, 4294967295),
        ("rem-zero", 6, i32::MIN, 0, 0x8000_0000),
        ("remu-zero", 7, i32::MIN, 0, 0x8000_0000),
    ];
    for (id, fn3, a, b, expected) in cases {
        let (value, _) = execute_m(fn3, a, b);
        assert_eq!(
            value, expected,
            "frozen manifest case '{id}' must reproduce bit-exact"
        );
    }
}

#[test]
fn config_errors_are_fail_closed() {
    // ISA profile is explicit and validated (JS: `isa:'rv32g'` throws).
    let err = CpuIsa::from_profile("rv32g").expect_err("unknown ISA profile must be refused");
    let msg = err.to_string();
    assert!(
        msg.contains("isa") || msg.contains("ISA"),
        "profile error: {msg}"
    );
    // Memory size floor.
    let err =
        Cpu::new(&[encode::ebreak()], 8, 0, 0, 16, CpuIsa::Rv32i).expect_err("tiny RAM refused");
    assert!(err.to_string().contains("memory size"));
    // Program must fit.
    let err = Cpu::new(&[encode::ebreak(); 32], 64, 0, 0, 16, CpuIsa::Rv32i)
        .expect_err("oversize program refused");
    assert!(err.to_string().contains("exceeds RAM"));
    // Budget validation.
    let mut cpu = Cpu::new(&[encode::ebreak()], 64, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
    let err = cpu.run(0).expect_err("zero budget refused");
    assert!(err.to_string().contains("budget"));
}
