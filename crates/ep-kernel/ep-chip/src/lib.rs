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
//! - [`tpu`]: WP-4.3 weight-stationary systolic TPU — INT8/per-axis-QDQ
//!   quantized GEMM with exact INT32 accumulation (saturating + documented
//!   overflow events, fail-closed `K_max = 2³¹/(255·255)` admission), the
//!   exact §3 wave-front cycle/utilization equations
//!   `cycles = ceil(M/P)·ceil(N/P)·(K + 2P − 2)`, an EXPERIMENTAL Q4
//!   multi-radix mode (2 digits/byte packing + nearest-partition dequant pass
//!   onto the verified Q4 LDO levels), and per-tile MAC activity & switching
//!   power telemetry for the 64-tile 3D SoC heatmap. Bit-exact against the
//!   `packages/chip-engine/src/accelerators.mjs` oracle (§5: TPU GEMM oracle
//!   = exact INT8 reference math, tolerance bit-exact).
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
pub mod tpu;
pub mod twin;

pub use cpu::{Cpu, CpuError, CpuIsa, RunResult, StepOutcome, Trace, Trap};
pub use custom::{CustomEffect, CustomIsaHook};
pub use power::{DynamicPowerModel, Farad, Hertz, InstructionMix, PowerError};
pub use tpu::{
    pack_q4, unpack_q4, OverflowEvent, OverflowPolicy, Q4DequantTable, Q4Packed, Q4Result,
    QdqScales, SystolicResult, SystolicTpu, TileTelemetry, TpuConfig, TpuError,
};
pub use twin::TwinCpu;
