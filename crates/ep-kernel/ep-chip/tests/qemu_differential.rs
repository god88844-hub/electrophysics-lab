//! WP-4.1 parity gate 4: QEMU user-mode differential on the bounded ISA
//! subset — the same program and protocol as the Phase 8 reference
//! (`scripts/phase8-qemu-rv32m.mjs`):
//!
//! 1. The bounded RV32IM program (hand-assembled from the committed
//!    `benchmarks/phase8/rv32m-operations.S` source; cross-validated against
//!    the frozen `acceptance.json` expectations and the strict JS engine) is
//!    executed by the Rust strict core to the ECALL boundary.
//! 2. The 12 architectural result words in the Rust CPU's memory must equal
//!    the frozen manifest values — asserted **unconditionally**.
//! 3. When `qemu-riscv32` is available, the same program is packed into a
//!    minimal RV32 ELF, executed under QEMU user-mode (which performs the
//!    real Linux `write(1, ptr, 48)` at the ECALL) and the 48 emitted bytes
//!    must equal the Rust CPU's memory bytes bit-for-bit.
//! 4. When QEMU is absent the step is SKIPped with an explicit
//!    unavailability note (PHASE_04 failure-modes contract: oracle steps
//!    SKIP loudly, never silently pass). CI integration of the QEMU oracle
//!    is WP-4.6's surface; this gate ships the differential itself.

use ep_chip::cpu::{Cpu, CpuIsa};
use serde_json::Value;

const BASE: u32 = 0x1_0054; // strict-core flat mapping: program at 0x10054 (fixture `base`)

fn fixture() -> Value {
    serde_json::from_str(include_str!("data/parity_vectors.json")).expect("fixture parses")
}

/// Assemble + link the committed phase8 source with the EXACT pipeline the
/// phase8 workflow runs on these runners (the artifact it proves daily), then
/// execute it under qemu-riscv32. The frozen fixture words are the machine
/// code of the same program; the strict-core differential compares the 12
/// result WORDS (values), which are layout-independent.
fn build_elf_via_gnu_pipeline(
    repo_root: &std::path::Path,
    temp: &std::path::Path,
) -> std::path::PathBuf {
    let source = repo_root.join("benchmarks/phase8/rv32m-operations.S");
    let obj = temp.join("wp46.o");
    let elf = temp.join("wp46.elf");
    let as_run = std::process::Command::new("riscv64-unknown-elf-as")
        .args(["-march=rv32im", "-mabi=ilp32"])
        .arg(&source)
        .arg("-o")
        .arg(&obj)
        .output()
        .expect("riscv64-unknown-elf-as executes");
    assert!(
        as_run.status.success(),
        "as failed: {}",
        String::from_utf8_lossy(&as_run.stderr)
    );
    let ld_run = std::process::Command::new("riscv64-unknown-elf-ld")
        .args([
            "-m",
            "elf32lriscv",
            "-Ttext=0x10000",
            "-e",
            "_start",
            "--no-relax",
        ])
        .arg(&obj)
        .arg("-o")
        .arg(&elf)
        .output()
        .expect("riscv64-unknown-elf-ld executes");
    assert!(
        ld_run.status.success(),
        "ld failed: {}",
        String::from_utf8_lossy(&ld_run.stderr)
    );
    elf
}

/// Run the bounded program on the Rust strict core and return
/// (stop_reason, [a0, a1, a2, a7], result words read from the CPU memory).
fn run_on_rust_cpu(words: &[u32], data_words: usize) -> (String, [u32; 4], Vec<u32>) {
    let mut program = words.to_vec();
    program.extend(std::iter::repeat_n(0_u32, data_words));
    let mut cpu =
        Cpu::new(&program, 65_536, BASE, BASE, 128, CpuIsa::Rv32im).expect("valid config");
    let out = cpu.run(300).expect("bounded run");
    let ptr = out.regs[11] as usize;
    let off = ptr - BASE as usize;
    let result_words: Vec<u32> = (0..12).map(|i| cpu.mem_word(off + i * 4)).collect();
    (
        out.stop_reason,
        [out.regs[10], out.regs[11], out.regs[12], out.regs[17]],
        result_words,
    )
}

#[test]
fn qemu_differential_rust_side_matches_frozen_manifest() {
    let fixture = fixture();
    let words: Vec<u32> = fixture["qemuProgram"]["words"]
        .as_array()
        .expect("words")
        .iter()
        .map(|v| v.as_u64().expect("u32") as u32)
        .collect();
    let expected: Vec<u32> = fixture["qemuProgram"]["expected"]
        .as_array()
        .expect("expected")
        .iter()
        .map(|v| v.as_u64().expect("u32") as u32)
        .collect();

    let (stop_reason, regs, result_words) = run_on_rust_cpu(&words, 12);
    // Phase 8 protocol: the CPU stops at the real ECALL with write(1, ptr, 48).
    assert_eq!(stop_reason, "ecall", "must stop at the ECALL boundary");
    assert_eq!(regs[3], 64, "a7 = Linux write syscall");
    assert_eq!(regs[0], 1, "a0 = stdout descriptor");
    assert_eq!(regs[2], 48, "a2 = 12 * 4 bytes");
    // The 12 architectural result words match the frozen acceptance manifest.
    assert_eq!(
        result_words, expected,
        "12 result words bit-exact vs manifest"
    );
}

#[test]
fn qemu_user_mode_differential_when_available() {
    let fixture = fixture();
    let words: Vec<u32> = fixture["qemuProgram"]["words"]
        .as_array()
        .expect("words")
        .iter()
        .map(|v| v.as_u64().expect("u32") as u32)
        .collect();
    let expected: Vec<u32> = fixture["qemuProgram"]["expected"]
        .as_array()
        .expect("expected")
        .iter()
        .map(|v| v.as_u64().expect("u32") as u32)
        .collect();

    let (_, _, rust_words) = run_on_rust_cpu(&words, 12);

    // Oracle availability is explicit: absent toolchain -> loud SKIP, not a pass.
    let tools = [
        "qemu-riscv32",
        "riscv64-unknown-elf-as",
        "riscv64-unknown-elf-ld",
    ];
    let missing: Vec<&str> = tools
        .iter()
        .filter(|t| {
            let probe = std::process::Command::new(if cfg!(windows) { "where" } else { "which" })
                .arg(t)
                .output();
            !probe
                .as_ref()
                .map(|o| o.status.success() && !o.stdout.is_empty())
                .unwrap_or(false)
        })
        .copied()
        .collect();
    if !missing.is_empty() {
        eprintln!(
            "QEMU-ORACLE-SKIP: {} not available on PATH - the user-mode differential              executes only where the phase8 oracle toolchain exists (live CI coverage              owned by the WP-4.6 v4-chip-oracles workflow). The Rust-side 12-word              frozen-manifest differential was still asserted bit-exact.",
            missing.join(", ")
        );
        return;
    }

    // Live differential: the committed phase8 source through the EXACT GNU
    // pipeline the phase8 workflow proves on these runners, executed under
    // real qemu-riscv32 user-mode; the write(1, ptr, 48) output must equal
    // the Rust strict core's result words and the frozen manifest bit-exactly.
    let repo_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(3)
        .expect("repo root")
        .to_path_buf();
    let temp = std::env::temp_dir().join(format!("ep-chip-qemu-{}", std::process::id()));
    std::fs::create_dir_all(&temp).expect("temp dir");
    let elf_path = build_elf_via_gnu_pipeline(&repo_root, &temp);

    let output = std::process::Command::new("qemu-riscv32")
        .arg(&elf_path)
        .output()
        .expect("qemu-riscv32 executed");
    let _ = std::fs::remove_dir_all(&temp);
    assert!(
        output.status.success(),
        "QEMU must exit cleanly (status {:?}) stderr: {}",
        output.status,
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(
        output.stdout.len(),
        48,
        "QEMU must emit exactly 12 result words"
    );
    const WORD_BYTES: usize = 4;
    let bytes = &output.stdout;
    let mut qemu_words = Vec::with_capacity(bytes.len() / WORD_BYTES);
    let mut offset = 0;
    while offset + WORD_BYTES <= bytes.len() {
        qemu_words.push(u32::from_le_bytes(
            bytes[offset..offset + WORD_BYTES]
                .try_into()
                .expect("4-byte chunk"),
        ));
        offset += WORD_BYTES;
    }
    assert_eq!(qemu_words, expected, "QEMU output vs frozen manifest");
    assert_eq!(
        qemu_words, rust_words,
        "QEMU vs Rust register/memory differential bit-exact"
    );
}
