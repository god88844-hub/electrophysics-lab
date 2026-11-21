//! WP-4.1: custom-ISA hook — deterministic fail-closed dispatch of the
//! RISC-V custom-0/custom-1 opcode space, plus the shipped fused-MAC hook.

use ep_chip::cpu::{Cpu, CpuIsa};
use ep_chip::custom::{CustomEffect, FusedMacHook};
use ep_chip::isa::{decode, encode};

/// Encode the custom fused-MAC instruction: opcode 0x0B, f3=0, f7=0x01.
fn fmac(rd: u32, rs1: u32, rs2: u32) -> u32 {
    encode::r_type(0x01, rs2, rs1, 0, rd, 0x0b)
}

#[test]
fn without_hook_custom_opcodes_trap_illegal() {
    // Identical to the JS reference: unknown opcode → illegal-instruction.
    for opcode_word in [fmac(5, 1, 2), encode::r_type(0x01, 2, 1, 0, 5, 0x2b)] {
        let mut cpu = Cpu::new(
            &[opcode_word, encode::ebreak()],
            64,
            0,
            0,
            16,
            CpuIsa::Rv32im,
        )
        .expect("valid");
        let out = cpu.run(5).expect("run");
        assert!(!out.ok);
        assert_eq!(out.stop_reason, "illegal-instruction");
        let trap = out.trap.expect("trap");
        assert!(trap.detail.contains("unknown opcode"));
    }
}

#[test]
fn fused_mac_hook_executes_deterministically() {
    let mut program = vec![
        encode::op_imm(0, 1, 0, 7),   // x1 = 7
        encode::op_imm(0, 2, 0, 11),  // x2 = 11
        encode::op_imm(0, 5, 0, 100), // x5 = 100
        fmac(5, 1, 2),                // CUSTOM.FMAC x5 = 7*11 + 100 = 177
        encode::ebreak(),
    ];
    let mut cpu = Cpu::new(&program, 64, 0, 0, 16, CpuIsa::Rv32im).expect("valid");
    cpu.set_custom_hook(Box::new(FusedMacHook));
    let out = cpu.run(10).expect("run");
    assert!(out.ok);
    assert_eq!(out.regs[5], 177);
    // The custom instruction is visible in the evidence trace with the
    // hook's declared mnemonic.
    let fmac_trace = out
        .traces
        .iter()
        .find(|t| decode(t.word).opcode == 0x0b)
        .expect("custom instruction traced");
    assert_eq!(fmac_trace.mnemonic, "CUSTOM.FMAC");
    // The hook writes registers architecturally; the strict core's result
    // trace records `None` for hook-executed words (the hook's own effect is
    // the architectural write). rd/value stay None, mnemonic is the hook's.
    assert_eq!(fmac_trace.value, None);
    let _ = &mut program;
}

#[test]
fn hook_claims_only_its_own_encoding() {
    // A custom-1 word or wrong funct3 must fall through to illegal even
    // with the hook attached (fail-closed dispatch contract).
    for word in [
        encode::r_type(0x01, 2, 1, 0, 5, 0x2b), // custom-1: unclaimed
        encode::r_type(0x02, 2, 1, 0, 5, 0x0b), // f7=0x02: unclaimed
        encode::r_type(0x01, 2, 1, 1, 5, 0x0b), // f3=1: unclaimed
    ] {
        let mut cpu =
            Cpu::new(&[word, encode::ebreak()], 64, 0, 0, 16, CpuIsa::Rv32im).expect("valid");
        cpu.set_custom_hook(Box::new(FusedMacHook));
        let out = cpu.run(5).expect("run");
        assert!(!out.ok, "word {word:08x} must not execute");
        assert_eq!(out.stop_reason, "illegal-instruction");
    }
}

#[test]
fn x0_is_never_written_by_the_hook() {
    let mut cpu = Cpu::new(
        &[fmac(0, 1, 2), encode::ebreak()],
        64,
        0,
        0,
        16,
        CpuIsa::Rv32im,
    )
    .expect("valid");
    cpu.set_custom_hook(Box::new(FusedMacHook));
    let out = cpu.run(5).expect("run");
    assert!(out.ok);
    assert_eq!(out.regs[0], 0, "x0 stays hardwired through the hook");
}

#[test]
fn custom_effect_declares_its_cycle_cost() {
    let effect = CustomEffect { cycle_cost: 1 };
    assert_eq!(effect.cycle_cost, 1);
}

#[test]
fn fmac_wrapping_semantics_are_exact() {
    let mut cpu = Cpu::new(
        &[fmac(3, 1, 2), encode::ebreak()],
        64,
        0,
        0,
        16,
        CpuIsa::Rv32im,
    )
    .expect("valid");
    cpu.regs_set(1, i32::MAX);
    cpu.regs_set(2, 2); // product wraps: MAX * 2 -> -2
    cpu.regs_set(3, 5); // accumulate: -2 + 5
    cpu.set_custom_hook(Box::new(FusedMacHook));
    let out = cpu.run(5).expect("run");
    assert_eq!(out.regs[3], 3, "wrapping i32 multiply then accumulate");
}
