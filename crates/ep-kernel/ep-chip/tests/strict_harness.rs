//! WP-4.1 parity gate 3: strict-core behavior mirror of the Phase 0
//! IL-8/RV32IM harness scenarios (`tests/rv32i.test.mjs`) — traps, atomic
//! commit, CSR/ECALL/EBREAK semantics, memory ordering, byte/halfword loads
//! and stores, evidence traces and fail-closed budgets.

use ep_chip::cpu::{Cpu, CpuError, CpuIsa, StepOutcome};
use ep_chip::isa::encode;

const HALT: u32 = encode::ebreak(); // 0x00100073

fn run_words(words: &[u32]) -> ep_chip::cpu::RunResult {
    let mut program = words.to_vec();
    program.push(HALT);
    let mut cpu = Cpu::new(&program, 65_536, 0, 0, 256, CpuIsa::Rv32i).expect("valid config");
    cpu.run(20_000).expect("run")
}

#[test]
fn instruction_level_add_and_immutable_x0() {
    // 00500093 00700113 002081b3 00700013 → x3 = 12, x0 immutable.
    let out = run_words(&[0x0050_0093, 0x0070_0113, 0x0020_81b3, 0x0070_0013]);
    assert!(out.ok);
    assert_eq!(out.stop_reason, "ebreak");
    assert_eq!(out.regs[1], 5);
    assert_eq!(out.regs[2], 7);
    assert_eq!(out.regs[3], 12);
    assert_eq!(out.regs[0], 0);
    assert_eq!(out.retired, 4);
    assert_eq!(out.physical_validation, "none");
    assert_eq!(out.real_world_build_success_percent, None);
    assert_eq!(out.model, "single-hart-functional");
    assert_eq!(out.timing, "not-modelled");
    assert_eq!(
        out.provenance,
        ep_core::ProvenanceBadge::SimulatedArchitecturalModel
    );
}

#[test]
fn signed_and_unsigned_loads_stores_little_endian() {
    // Verbatim words of the rv32i.test.mjs load/store scenario (mixed
    // byte/half/word stores and signed/unsigned loads).
    let mut cpu = Cpu::new(
        &[
            0x0400_0093,
            0x0ff0_0113,
            0x0020_8023,
            0x0000_8183,
            0x0000_c203,
            0x0020_9123,
            0x0020_9283,
            0x0020_d303,
            0x0020_a223,
            0x0040_a383,
            HALT,
        ],
        65_536,
        0,
        0,
        64,
        CpuIsa::Rv32i,
    )
    .expect("valid");
    let r = cpu.run(20_000).expect("run");
    assert!(r.ok);
    assert_eq!(r.regs[3], (-1_i32) as u32);
    assert_eq!(
        [r.regs[4], r.regs[5], r.regs[6], r.regs[7]],
        [255, 255, 255, 255]
    );
    // Memory bytes 64..72 (little-endian store of 255 then adjacent zero).
    let mem = cpu.mem();
    assert_eq!(&mem[64..72], &[255, 0, 255, 0, 255, 0, 0, 0]);
    // writes evidence trace: sw, sh, sw → 3 entries.
    assert_eq!(r.writes.len(), 3);
}

#[test]
fn branch_link_and_jump_scenarios() {
    // Verbatim scenarios from tests/rv32i.test.mjs (expected values too).
    let branch = run_words(&[
        0x0050_0093, // addi x1,x0,5
        0x0050_0113, // addi x2,x0,5
        0x0020_8463, // beq x1,x2, (taken — x1 == x2)
        0x0630_0193, // addi x3,x0,99 (skipped by the taken branch)
        0x02a0_0193, // addi x3,x0,42
    ]);
    assert_eq!(branch.regs[3], 42);
    let not_taken = run_words(&[
        0x0000_1163, // bne x0,x1, — not taken (x0 == x1 == 0)
        0x02a0_0193, // addi x3,x0,42
    ]);
    assert!(not_taken.ok);
    assert_eq!(not_taken.regs[3], 42);
    let jumps = run_words(&[
        0x0080_02ef, // jal x5,+8
        0x0630_0193, // addi x3,x0,99 (skipped)
        0x02a0_0193, // addi x3,x0,42
    ]);
    assert_eq!(jumps.regs[3], 42);
    assert_eq!(jumps.regs[5], 4, "jal link = pc + 4");
}

#[test]
fn auipc_reference_semantics() {
    // auipc x1,0x10 → x1 = pc + (0x10 << 12) = 0x10000 (RV32I 2.1 spec).
    let out = run_words(&[0x0001_0097]);
    assert_eq!(out.regs[1], 0x1_0000);
}

#[test]
fn upper_immediates_signed_wrap_and_sltiu() {
    // JS scenario: lui x2,0xfffff000...; sltiu x4,x2,-1 → 1 (unsigned compare).
    let out = run_words(&[
        0xffff_f137, // verbatim JS scenario words (LUI / ADDI / SLTIU)
        0x4011_5193,
        0xfff1_3213,
        0x0001_2293,
    ]);
    assert_eq!(out.regs[2], 0xffff_f000);
    assert_eq!(out.regs[3], 0xffff_f800);
    assert_eq!(out.regs[4], 1);
}

#[test]
fn sra_uses_funct7_0x20() {
    let out = run_words(&[
        0xfff0_0113, // verbatim JS words
        0x0010_0093,
        0x4011_51b3, // SRA (funct7=0x20)
    ]);
    assert!(out.ok, "SRA is a mandatory RV32I base instruction");
    assert_eq!(out.regs[3], 0xffff_ffff);
}

#[test]
fn illegal_m_csr_fence_i_nop_trap() {
    for word in [0x0200_0033, 0x0000_100f, 0x0000_1073, 0x0000_0000] {
        let mut cpu = Cpu::new(&[word], 65_536, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
        let out = cpu.run(20_000).expect("run");
        assert!(!out.ok);
        assert_eq!(out.stop_reason, "illegal-instruction", "word {word:08x}");
    }
}

#[test]
fn taken_branch_misalignment_traps_and_untaken_does_not() {
    // Verbatim JS scenario: 0x00000163 (beq x0,x0,+2) targets pc=2 → trap.
    let mut cpu = Cpu::new(&[0x0000_0163], 65_536, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
    let out = cpu.run(20_000).expect("run");
    assert!(!out.ok);
    assert_eq!(out.stop_reason, "misaligned-access");
    // Verbatim JS scenario: 0x00001163 (bne x0,x1) not taken → addi runs.
    let mut cpu = Cpu::new(
        &[0x0000_1163, 0x0070_0193, HALT],
        65_536,
        0,
        0,
        16,
        CpuIsa::Rv32i,
    )
    .expect("valid");
    let out = cpu.run(20_000).expect("run");
    assert!(out.ok);
    assert_eq!(out.regs[3], 7);
}

#[test]
fn misaligned_load_traps_without_partial_register_change() {
    let mut cpu = Cpu::new(
        &[0x0010_0093, 0x0000_a103, HALT], // verbatim JS scenario: lw at a misaligned address
        65_536,
        0,
        0,
        16,
        CpuIsa::Rv32i,
    )
    .expect("valid");
    let out = cpu.run(20_000).expect("run");
    assert!(!out.ok);
    assert_eq!(out.stop_reason, "misaligned-access");
    assert_eq!(out.regs[2], 0, "no partially committed result");
}

#[test]
fn explicit_ecall_trap_is_not_a_successful_exit() {
    let mut cpu = Cpu::new(&[encode::ecall()], 65_536, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
    let out = cpu.run(20_000).expect("run");
    assert!(!out.ok);
    assert_eq!(out.stop_reason, "ecall");
    let trap = out.trap.expect("trap recorded");
    assert!(trap.detail.contains("environment call"));
}

#[test]
fn csr_encodings_are_rejected_not_implemented() {
    // csrrw x0, 0, x0 / csrrs / csrrc / csrrwi — every non-ecall/ebreak
    // SYSTEM word must trap as illegal-instruction ("unsupported
    // system/CSR encoding"), mirroring rv32i.js.
    for word in [
        0x0000_1073,
        0x0000_2073,
        0x0000_3073,
        0x3000_2573,
        0x0000_100f,
    ] {
        let mut cpu = Cpu::new(&[word], 65_536, 0, 0, 16, CpuIsa::Rv32im).expect("valid");
        let out = cpu.run(20_000).expect("run");
        assert!(!out.ok, "word {word:08x}");
        assert_eq!(out.stop_reason, "illegal-instruction");
        let trap = out.trap.expect("trap");
        assert!(
            trap.detail.contains("system/CSR")
                || trap.detail.contains("FENCE")
                || trap.detail.contains("compressed")
        );
    }
}

#[test]
fn ebreak_halt_is_the_ok_stop_convention() {
    let out = run_words(&[]);
    assert!(out.ok);
    assert_eq!(out.status, "breakpoint-reached");
    assert_eq!(out.stop_reason, "ebreak");
    assert!(out.note.contains("test stopping convention"));
    assert_eq!(
        out.provenance,
        ep_core::ProvenanceBadge::SimulatedArchitecturalModel
    );
}

#[test]
fn bounded_infinite_loop_times_out_as_failure() {
    // jal x0,0 — infinite self-loop; budget 75, trace 8.
    let mut cpu = Cpu::new(&[0x0000_006f], 65_536, 0, 0, 8, CpuIsa::Rv32i).expect("valid");
    let out = cpu.run(75).expect("run");
    assert!(!out.ok);
    assert_eq!(out.stop_reason, "step-limit");
    assert_eq!(out.retired, 75);
    assert_eq!(out.traces.len(), 8, "trace ring keeps the last 8");
}

#[test]
fn off_map_jump_fails_on_fetch_not_zero_read() {
    // Verbatim JS scenario: 0x00008067 (jalr x0,x1,0) — x1=0 loops on itself.
    let mut cpu = Cpu::new(&[0x0000_8067], 65_536, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
    let out = cpu.run(10).expect("run");
    assert!(!out.ok);
    assert_eq!(out.stop_reason, "step-limit");
    // Jump far past the image → instruction-access-fault.
    let mut cpu = Cpu::new(&[0x4000_006f], 256, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
    let out = cpu.run(10).expect("run");
    assert!(!out.ok);
    assert_eq!(out.stop_reason, "instruction-access-fault");
}

#[test]
fn budget_and_input_validation_never_pass_invalid_inputs() {
    // Unaligned base.
    let err = Cpu::new(&[HALT], 65_536, 1, 0, 16, CpuIsa::Rv32i).expect_err("unaligned base");
    assert!(err.to_string().contains("aligned"), "{err}");
    // Memory size floor.
    let err = Cpu::new(&[HALT], 8, 0, 0, 16, CpuIsa::Rv32i).expect_err("tiny RAM");
    assert!(err.to_string().contains("memory size"));
    // Zero budget.
    let mut cpu = Cpu::new(&[HALT], 65_536, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
    let err = cpu.run(0).expect_err("zero budget");
    assert!(err.to_string().contains("budget"));
    // Program exceeding RAM.
    let err = Cpu::new(&[HALT; 33], 64, 0, 0, 16, CpuIsa::Rv32i).expect_err("program > RAM");
    assert!(err.to_string().contains("exceeds RAM"));
}

#[test]
fn stored_words_preserve_unsigned_values_in_evidence_trace() {
    // JS scenario: store 0xfffff000 then load; write evidence keeps the
    // unsigned value (never reinterpreted as negative).
    let mut cpu = Cpu::new(
        &[0x0400_0093, 0xffff_f137, 0x0020_a223, 0x0040_a183, HALT],
        65_536,
        0,
        0,
        64,
        CpuIsa::Rv32i,
    )
    .expect("valid");
    let out = cpu.run(20_000).expect("run");
    assert!(out.ok);
    assert_eq!(out.regs[3], 0xffff_f000);
    assert_eq!(out.writes.len(), 1);
    assert_eq!(out.writes[0].value, 0xffff_f000);
}

#[test]
fn misaligned_store_does_not_partially_mutate_memory() {
    let mut cpu = Cpu::new(
        &[0x0410_0093, 0x0ff0_0113, 0x0020_9123, HALT], // …sh x2,2(x1) with x1=65 → addr 67 (odd)
        65_536,
        0,
        0,
        64,
        CpuIsa::Rv32i,
    )
    .expect("valid");
    let before: Vec<u8> = cpu.mem()[64..72].to_vec();
    let out = cpu.run(20_000).expect("run");
    assert!(!out.ok);
    assert_eq!(out.stop_reason, "misaligned-access");
    assert_eq!(
        &cpu.mem()[64..72],
        &before[..],
        "memory untouched by the failed store"
    );
    assert!(
        out.writes.is_empty(),
        "no evidence write recorded for the failed store"
    );
}

#[test]
fn step_after_terminal_stop_is_an_error() {
    let mut cpu = Cpu::new(&[HALT], 65_536, 0, 0, 16, CpuIsa::Rv32i).expect("valid");
    match cpu.step().expect("first step reaches EBREAK stop") {
        StepOutcome::Stopped(trap) => assert_eq!(trap.cause, "ebreak"),
        StepOutcome::Retired(_) => panic!("ebreak must stop"),
    }
    let err = cpu.step().expect_err("second step must be an error");
    assert!(matches!(err, CpuError::AlreadyStopped(_)));
    assert!(err.to_string().contains("already stopped"));
}

#[test]
fn auipc_and_jalr_reference_scenarios() {
    // jal x5, +8 → link = 4; then jalr through a computed register target.
    let out = run_words(&[
        0x0080_02ef, // jal x5,+8 (skip one)
        0x0630_0193, // addi x3,x0,99 (skipped)
        0x02a0_0193, // addi x3,x0,42
    ]);
    assert_eq!(out.regs[3], 42);
    assert_eq!(out.regs[5], 4, "jal link = pc + 4");
    // AUIPC: x1 = pc + (imm20 << 12).
    let out = run_words(&[0x0001_0097]); // auipc x1,0x10
    assert_eq!(out.regs[1], 0x1_0000, "auipc result = pc + (imm20 << 12)");
}
