//! WP-4.6 — read-only oracle dump example.
//!
//! Emits (as JSON on stdout) the two architectural surfaces that the
//! `scripts/v4-oracles/` differential harnesses compare against the external
//! oracles named in `03_PHYSICS_MATH_FUNDAMENTALS.md` §5:
//!
//! 1. **RV32IM strict core** (`ep-chip::cpu::Cpu`) executing the frozen
//!    Phase 8 RV32M program (from the WP-4.1 parity fixture — the same
//!    program `ep-chip/tests/qemu_differential.rs` differentiates against
//!    `qemu-riscv32`): the program words, the CPU's 12 result words read
//!    back from memory, the syscall registers, the full register file and
//!    the stop reason. The QEMU harness assembles these exact words with the
//!    GNU RISC-V toolchain (the phase8-identical pipeline), runs
//!    `qemu-riscv32` user-mode and asserts QEMU's real `write(1, …)` output
//!    bit-exact against this dump.
//! 2. **INT8/per-axis QDQ systolic TPU** (`ep-chip::tpu::SystolicTpu`, WP-4.3)
//!    on a deterministic workload: quantized operands, exact INT32
//!    accumulation and dequantized logits. The ONNX Runtime harness builds a
//!    QLinearMatMul-shaped graph (`MatMulInteger` + per-axis
//!    `DequantizeLinear`), runs it on `CPUExecutionProvider` and asserts the
//!    INT32 grid **bit-exact** plus the dequantized logits within the §5
//!    ±1e-5 relative tolerance.
//!
//! The example is strictly read-only: it writes nothing to disk, mutates no
//! state, and touches no network. Provenance of every emitted number:
//! [`ep_core::ProvenanceBadge::SimulatedArchitecturalModel`].
//!
//! Usage: `cargo run -p ep-kernel --example chip_oracle_dump > dump.json`

use ep_chip::cpu::{Cpu, CpuIsa};
use ep_chip::power::{Farad, Hertz};
use ep_chip::tpu::{OverflowPolicy, QdqScales, SystolicTpu, TpuConfig};
use ep_core::Volt;
use serde_json::{json, Value};

/// ELF image base (identical layout to the WP-4.1 differential protocol:
/// ELF header 52 B + one PT_LOAD program header 32 B; text at vaddr 0x10000).
const BASE: u32 = 0x1_0054;

// One PT_LOAD covering the whole file from p_offset 0 at vaddr 0x10000.
fn hex_encode(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        s.push_str(&format!("{b:02x}"));
    }
    s
}

/// Deterministic mulberry32 workload generator — identical stream semantics
/// as documented in the WP-4.3 parity fixture (`gen_tpu_parity.mjs`).
struct Mulberry32(u32);

impl Mulberry32 {
    fn next_f64(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x6d2b_79f5);
        let t = self.0;
        let mut r = (t ^ (t >> 15)).wrapping_mul(t | 1) as i32;
        r ^= r.wrapping_add((r ^ ((r as u32) >> 7) as i32).wrapping_mul(61 | r));
        let out = (r ^ ((r as u32) >> 14) as i32) as u32;
        f64::from(out) / 4294967296.0
    }
}

/// The deterministic INT8/QDQ TPU workload for the ONNX Runtime differential.
///
/// Scales are powers of two (0.5 / 0.25) and operand values are integers, so
/// `v / s` is always an exact integer — the quantization rounding is
/// unambiguous (no half-way cases), which keeps the ONNX
/// `QuantizeLinear`-equivalent grid free of round-to-nearest-even ambiguity.
/// Values beyond ±127 exercise the QDQ clamp.
fn tpu_workload() -> Value {
    let (m, k, n) = (8usize, 16usize, 6usize);
    let mut rng = Mulberry32(0x4_600D << 3); // fixed seed
    let mut a = Vec::with_capacity(m * k);
    let mut b = Vec::with_capacity(k * n);
    for i in 0..m * k {
        let v = (rng.next_f64() * 161.0).floor() - 80.0; // [-80, 80] integers
                                                         // Every 7th activation is clamped beyond the ±127 grid.
        a.push(if i % 7 == 3 { 100.0 } else { v });
    }
    for i in 0..k * n {
        let v = (rng.next_f64() * 161.0).floor() - 80.0;
        b.push(if i % 11 == 5 { -100.0 } else { v });
    }
    let scales = QdqScales {
        a_per_row: vec![0.5; m],  // per-M-row (power of two)
        b_per_col: vec![0.25; n], // per-N-col (power of two)
    };
    let config = TpuConfig {
        grid_p: 4,
        clock: Hertz::from_megahertz(100.0),
        vdd: Volt::new(0.8),
        activity: 0.35,
        cap_per_mac: Farad::new(1.2e-13),
        overflow_policy: OverflowPolicy::Refuse,
    };
    let tpu = SystolicTpu::new(config).expect("educational-range config admits");
    let result = tpu
        .matmul_int8(&a, m, k, &b, n, &scales)
        .expect("K=16 is far inside the INT32 accumulator bound");

    json!({
        "badge": "SIMULATED_ARCHITECTURAL_MODEL",
        "workload": {
            "m": m, "k": k, "n": n, "gridP": 4,
            "scales": {
                "aPerRow": scales.a_per_row,
                "bPerCol": scales.b_per_col,
            },
            "note": "power-of-two scales with integer operands — quantization rounding is unambiguous (no half-way cases)",
        },
        "a": a,
        "b": b,
        "qA": result.q_a,
        "qB": result.q_b,
        "cI32": result.c_i32,
        "cDequant": result.c_dequant,
        "cycles": result.cycles,
        "tiles": result.tiles,
        "macOps": result.mac_ops,
    })
}

/// The frozen Phase 8 RV32IM program executed by the strict core.
fn rv32_section() -> Value {
    let fixture: Value =
        serde_json::from_str(include_str!("../ep-chip/tests/data/parity_vectors.json"))
            .expect("WP-4.1 parity fixture parses");
    let words: Vec<u32> = fixture["qemuProgram"]["words"]
        .as_array()
        .expect("qemuProgram.words")
        .iter()
        .map(|v| v.as_u64().expect("u32 word") as u32)
        .collect();
    let expected: Vec<u32> = fixture["qemuProgram"]["expected"]
        .as_array()
        .expect("qemuProgram.expected")
        .iter()
        .map(|v| v.as_u64().expect("u32 word") as u32)
        .collect();

    // Same run protocol as `ep-chip/tests/qemu_differential.rs::run_on_rust_cpu`.
    let mut program = words.clone();
    program.extend(std::iter::repeat_n(0_u32, 12usize));
    let mut cpu = Cpu::new(&program, 65_536, BASE, BASE, 128, CpuIsa::Rv32im)
        .expect("valid strict-core config");
    let out = cpu.run(300).expect("bounded run");
    let ptr = out.regs[11] as usize;
    let off = ptr - BASE as usize;
    let result_words: Vec<u32> = (0..12).map(|i| cpu.mem_word(off + i * 4)).collect();

    json!({
        "badge": "SIMULATED_ARCHITECTURAL_MODEL",
        "program": {
            "words": words,
            "base": BASE,
            "fixture": "crates/ep-kernel/ep-chip/tests/data/parity_vectors.json :: qemuProgram (frozen Phase 8 RV32M program)",
        },
        "frozenExpectedWords": expected,
        "rustResultWords": result_words,
        "registers": {
            "a0": out.regs[10],
            "a1": out.regs[11],
            "a2": out.regs[12],
            "a7": out.regs[17],
        },
        "registerFile": cpu.regs_u32(),
        "stopReason": out.stop_reason,
        "retired": out.retired,
        "memoryWindowHex": hex_encode(&cpu.mem()[off..off + 48]),
        "protocol": "write(1, a1, 48) at the ECALL — QEMU's stdout must equal the 48 memory bytes bit-exactly",
    })
}

fn main() {
    let dump = json!({
        "format": "invention-lab/wp46-oracle-dump/1",
        "generatedBy": "cargo run -p ep-kernel --example chip_oracle_dump",
        "provenance": "SIMULATED_ARCHITECTURAL_MODEL",
        "rv32": rv32_section(),
        "tpu": tpu_workload(),
    });
    println!(
        "{}",
        serde_json::to_string_pretty(&dump).expect("dump serializes")
    );
}
