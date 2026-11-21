//! Custom-ISA hook — the deterministic extension point of the WP-4.1 CPU.
//!
//! The Phase 0 custom-ISA work (Phase 89 radix-register bytecode machine)
//! shows the platform's pattern: a declared ISA profile is an explicit,
//! validated envelope — never silent behavior. Here the RV32 custom-0 and
//! custom-1 opcode spaces (0x0B / 0x2B, the encodings the RISC-V spec
//! reserves for custom extensions) dispatch to a registered
//! [`CustomIsaHook`]. With no hook attached the strict core traps
//! `illegal-instruction` exactly like the JS reference — fail-closed, no
//! fabricated execution.

/// Effect of one custom instruction execution.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CustomEffect {
    /// Declared cycle cost of the custom operation (architectural model;
    /// the strict core itself reports `timing: "not-modelled"`).
    pub cycle_cost: u64,
}

/// A deterministic custom-ISA extension attached to the CPU core.
pub trait CustomIsaHook: std::fmt::Debug {
    /// Mnemonic for the evidence trace (only called when [`execute`]
    /// returned an effect for this word).
    ///
    /// [`execute`]: Self::execute
    fn mnemonic(&self, word: u32) -> &'static str;

    /// Attempt to execute `word`. Reads source registers from `regs`,
    /// writes the destination register (remembering `regs[0]` is re-pinned
    /// to zero by the core after the hook returns).
    /// Returns `None` when the hook does not claim this encoding — the core
    /// then traps `illegal-instruction`.
    fn execute(&mut self, word: u32, regs: &mut [i32; 32]) -> Option<CustomEffect>;
}

/// Reference custom-ISA hook shipped for WP-4.1: a fused multiply-accumulate
/// in the custom-0 space.
///
/// Encoding (R-type): `opcode = 0x0B`, `funct3 = 0`, `funct7 = 0x01`;
/// semantics `x[rd] = x[rs1] * x[rs2] + x[rd]` (wrapping i32). Declared
/// cycle cost 1 — a deterministic architectural model.
#[derive(Debug, Clone, Copy, Default)]
pub struct FusedMacHook;

impl CustomIsaHook for FusedMacHook {
    fn mnemonic(&self, _word: u32) -> &'static str {
        "CUSTOM.FMAC"
    }

    fn execute(&mut self, word: u32, regs: &mut [i32; 32]) -> Option<CustomEffect> {
        let f = crate::isa::decode(word);
        if f.opcode != 0x0b || f.f3 != 0 || f.f7 != 0x01 {
            return None;
        }
        let product = regs[f.rs1].wrapping_mul(regs[f.rs2]);
        regs[f.rd] = product.wrapping_add(regs[f.rd]);
        Some(CustomEffect { cycle_cost: 1 })
    }
}
