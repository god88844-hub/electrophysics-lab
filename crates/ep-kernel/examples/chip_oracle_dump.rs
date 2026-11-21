//! WP-4.6 — read-only oracle dump example.
//!
//! Emits (as JSON on stdout) the two architectural surfaces that the
//! `scripts/v4-oracles/` differential harnesses compare against the external
//! oracles named in `03_PHYSICS_MATH_FUNDAMENTALS.md` §5:
//!
//! 1. **RV32IM strict core** (`ep-chip::cpu::Cpu`) executing the frozen
//!    Phase 8 RV32M program (from the WP-4.1 parity fixture — the same
//!    program `ep-chip/tests/qemu_differential.rs` differentiates against
//!    `qemu-riscv32`): the minimal RV32 ELF image, the CPU's 12 result words
//!    read back from memory, the syscall registers, the full register file
//!    and the stop reason. The QEMU harness packs the ELF, runs
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

/// Pack the frozen program into the minimal RV32 ELF (same builder as
/// `ep-chip/tests/qemu_differential.rs::build_elf` — kept bit-identical here;
/// the ELF layout is pinned by that test's layout guard).
fn build_elf(words: &[u32], data_bytes: usize) -> Vec<u8> {
    let mut elf = Vec::with_capacity(84);
    // e_ident
    elf.extend_from_slice(&[0x7f, b'E', b'L', b'F', 1, 1, 1, 0]);
    elf.extend_from_slice(&[0_u8; 8]);
    // e_type=ET_EXEC(2), e_machine=EM_RISCV(243) — both HALFWORD in ELF32.
    elf.extend_from_slice(&2_u16.to_le_bytes());
    elf.extend_from_slice(&243_u16.to_le_bytes());
    elf.extend_from_slice(&1_u32.to_le_bytes()); // e_version
    elf.extend_from_slice(&(0x1_0000_u32 + 84).to_le_bytes()); // e_entry
    elf.extend_from_slice(&52_u32.to_le_bytes()); // e_phoff
    elf.extend_from_slice(&0_u32.to_le_bytes()); // e_shoff
    elf.extend_from_slice(&0_u32.to_le_bytes()); // e_flags (int ABI)
    elf.extend_from_slice(&52_u16.to_le_bytes()); // e_ehsize
    elf.extend_from_slice(&32_u16.to_le_bytes()); // e_phentsize
    elf.extend_from_slice(&1_u16.to_le_bytes()); // e_phnum
    elf.extend_from_slice(&40_u16.to_le_bytes()); // e_shentsize
    elf.extend_from_slice(&0_u16.to_le_bytes()); // e_shnum
    elf.extend_from_slice(&0_u16.to_le_bytes()); // e_shstrndx
                                                 // One PT_LOAD covering the whole file from p_offset 0 at vaddr 0x10000.
    let file_len = (elf.len() + words.len() * 4 + data_bytes) as u32;
    let mut ph = Vec::with_capacity(32);
    ph.extend_from_slice(&1_u32.to_le_bytes()); // PT_LOAD
    ph.extend_from_slice(&0_u32.to_le_bytes()); // p_offset
    ph.extend_from_slice(&0x1_0000_u32.to_le_bytes()); // p_vaddr
    ph.extend_from_slice(&0x1_0000_u32.to_le_bytes()); // p_paddr
    ph.extend_from_slice(&file_len.to_le_bytes()); // p_filesz
    ph.extend_from_slice(&file_len.to_le_bytes()); // p_memsz
    ph.extend_from_slice(&7_u32.to_le_bytes()); // PF_X | PF_W | PF_R
    ph.extend_from_slice(&0x1000_u32.to_le_bytes()); // p_align
    let mut image = elf;
    image.extend_from_slice(&ph);
    for w in words {
        image.extend_from_slice(&w.to_le_bytes());
    }
    image.extend(std::iter::repeat_n(0_u8, data_bytes));
    image
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

    // The ELF the QEMU oracle executes (48 data bytes for the write dump).
    let elf = build_elf(&words, 48);
    let elf_b64: String = base64_encode(&elf);

    json!({
        "badge": "SIMULATED_ARCHITECTURAL_MODEL",
        "program": {
            "words": words,
            "base": BASE,
            "fixture": "crates/ep-kernel/ep-chip/tests/data/parity_vectors.json :: qemuProgram (frozen Phase 8 RV32M program)",
        },
        "elfBase64": elf_b64,
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

fn hex_encode(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        s.push_str(&format!("{b:02x}"));
    }
    s
}

/// Minimal base64 (standard alphabet, padded) — avoids adding a dependency.
fn base64_encode(data: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(data.len().div_ceil(3) * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = *chunk.get(1).unwrap_or(&0) as u32;
        let b2 = *chunk.get(2).unwrap_or(&0) as u32;
        let n = (b0 << 16) | (b1 << 8) | b2;
        out.push(TABLE[(n >> 18) as usize & 63] as char);
        out.push(TABLE[(n >> 12) as usize & 63] as char);
        out.push(if chunk.len() > 1 {
            TABLE[(n >> 6) as usize & 63] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            TABLE[n as usize & 63] as char
        } else {
            '='
        });
    }
    out
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
