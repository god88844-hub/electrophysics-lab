//! `ep-chip` — WP-4.1 cycle-accurate RV32IM/Custom-ISA CPU kernel.
//!
//! Provenance: every execution surface in this crate is a
//! [`ep_core::ProvenanceBadge::SimulatedArchitecturalModel`] architectural
//! model — a deterministic, bounded, functional execution engine. It is NOT a
//! timing-closed RTL model, a cycle/power silicon measurement, or an ISA
//! certification (Builder Rule 5).
//!
//! Modules:
//! - [`isa`]: RV32IM field extraction + the exact encoders used by the
//!   reference harnesses (`packages/chip-engine/src/rv32.mjs` `asm` helpers).
//! - [`cpu`]: strict bounded RV32I 2.1 + M 2.0 single-hart core — register
//!   semantics, traps (misaligned/illegal/access-fault/ecall/ebreak), atomic
//!   commit, opt-in M extension, explicit CSR rejection (ECALL/EBREAK stop
//!   semantics), deterministic little-endian flat-RAM memory image. This is
//!   the Rust mirror of the Phase 0 IL-8/RV32IM bounded reference
//!   (`js/labs/rv32i/rv32i.js`), which CI differentiates against real
//!   QEMU user-mode on the bounded ISA subset (Phase 8 protocol).
//! - [`twin`]: the Bay-3 digital-twin CPU — a bit-exact port of
//!   `packages/chip-engine/src/rv32.mjs` including its declared cycle model
//!   (1 CPI ALU, 2 loads/stores, +1 taken branch) and its documented
//!   reference-harness behaviors (see the module docs for the exact list).
//! - [`power`]: dynamic power accounting `P_dyn = α·C·V²·f`
//!   (`03_PHYSICS_MATH_FUNDAMENTALS.md` §3) over instruction-class switching
//!   activity, using `ep-core` SI units.
//! - [`custom`]: the custom-ISA hook — deterministic, fail-closed dispatch of
//!   the RISC-V custom-0/custom-1 opcode space to a registered handler.
//!
//! Oracle calibration (`03_PHYSICS_MATH_FUNDAMENTALS.md` §5): RV32IM
//! execution is bit-exact against the Phase 0 harness. The QEMU user-mode
//! differential reuses the Phase 8 protocol on the same bounded program and
//! SKIPs with an explicit unavailability note when `qemu-riscv32` is absent
//! (never silently passes).

pub mod cpu;
pub mod custom;
pub mod isa;
pub mod power;
pub mod twin;

pub use cpu::{Cpu, CpuError, CpuIsa, RunResult, StepOutcome, Trace, Trap};
pub use custom::{CustomEffect, CustomIsaHook};
pub use power::{DynamicPowerModel, Farad, Hertz, InstructionMix, PowerError};
pub use twin::TwinCpu;
