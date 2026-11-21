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
use ep_chip::isa::encode;
use serde_json::Value;

const BASE: u32 = 0x1_0054; // ELF header (52) + one program header (32); vaddr 0x10000 + 84

fn fixture() -> Value {
    serde_json::from_str(include_str!("data/parity_vectors.json")).expect("fixture parses")
}

/// Pack the hand-assembled program into the minimal RV32 ELF image:
/// ELF header (52 bytes) + one PT_LOAD program header (32) + text + data.
fn build_elf(words: &[u32], data_bytes: usize) -> Vec<u8> {
    let mut image: Vec<u8> = Vec::new();
    let mut elf = Vec::with_capacity(84);
    // e_ident
    elf.extend_from_slice(&[0x7f, b'E', b'L', b'F', 1, 1, 1, 0]);
    elf.extend_from_slice(&[0_u8; 8]);
    // e_type=ET_EXEC(2), e_machine=EM_RISCV(243) — both HALFWORD in ELF32.
    elf.extend_from_slice(&2_u16.to_le_bytes());
    elf.extend_from_slice(&243_u16.to_le_bytes());
    elf.extend_from_slice(&1_u32.to_le_bytes()); // e_version
                                                 // e_entry = 0x10000 + 84 (first instruction, header covered by PT_LOAD)
    elf.extend_from_slice(&(0x1_0000_u32 + 84).to_le_bytes());
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
                                                 // WP-4.6 (live QEMU oracle) caught the missing PHDR bytes here: p_filesz
                                                 // must include the EHDR (52) and this PT_LOAD header (32) — otherwise the
                                                 // result_words tail falls outside the mapped segment and the stores
                                                 // SIGSEGV under qemu-riscv32.
    const PHDR_SIZE: usize = 32;
    let file_len = (elf.len() + PHDR_SIZE + words.len() * 4 + data_bytes) as u32;
    let mut ph = Vec::with_capacity(32);
    ph.extend_from_slice(&1_u32.to_le_bytes()); // PT_LOAD
    ph.extend_from_slice(&0_u32.to_le_bytes()); // p_offset
    ph.extend_from_slice(&0x1_0000_u32.to_le_bytes()); // p_vaddr
    ph.extend_from_slice(&0x1_0000_u32.to_le_bytes()); // p_paddr
    ph.extend_from_slice(&file_len.to_le_bytes()); // p_filesz
    ph.extend_from_slice(&file_len.to_le_bytes()); // p_memsz
    ph.extend_from_slice(&7_u32.to_le_bytes()); // PF_X | PF_W | PF_R
    ph.extend_from_slice(&0x1000_u32.to_le_bytes()); // p_align
    image.extend_from_slice(&elf);
    image.extend_from_slice(&ph);
    for w in words {
        image.extend_from_slice(&w.to_le_bytes());
    }
    image.extend(std::iter::repeat_n(0_u8, data_bytes));
    image
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

    // Oracle availability is explicit: absent QEMU → loud SKIP, not a pass.
    let probe = std::process::Command::new(if cfg!(windows) { "where" } else { "which" })
        .arg("qemu-riscv32")
        .output();
    let qemu_present = probe
        .as_ref()
        .map(|o| o.status.success() && !o.stdout.is_empty())
        .unwrap_or(false);
    if !qemu_present {
        eprintln!(
            "QEMU-ORACLE-SKIP: qemu-riscv32 is not available on PATH — the user-mode \
             differential executes only where QEMU exists (WP-4.6 owns CI integration). \
             The Rust-side 12-word frozen-manifest differential was still asserted bit-exact."
        );
        return;
    }

    // Same program under real QEMU user-mode: pack into a minimal ELF and
    // compare QEMU's actual write() output with the Rust CPU's memory bytes.
    let elf = build_elf(&words, 48);
    let temp = std::env::temp_dir().join(format!("ep-chip-qemu-{}", std::process::id()));
    std::fs::create_dir_all(&temp).expect("temp dir");
    let elf_path = temp.join("wp41-rv32im.elf");
    std::fs::write(&elf_path, &elf).expect("write ELF");

    let output = std::process::Command::new("qemu-riscv32")
        .arg(&elf_path)
        .output()
        .expect("qemu-riscv32 executed");
    let _ = std::fs::remove_file(&elf_path);
    let _ = std::fs::remove_dir(&temp);
    assert!(
        output.status.success(),
        "QEMU must exit cleanly (status {:?})",
        output.status
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

/// The ELF image must carry the program at the documented offsets (guard
/// against silent layout drift between `build_elf` and `BASE`).
#[test]
fn elf_layout_matches_documented_base() {
    let elf = build_elf(&[encode::ebreak()], 0);
    assert_eq!(elf.len(), 52 + 32 + 4);
    // First instruction sits at file offset 84 = BASE - 0x10000.
    let entry = u32::from_le_bytes(elf[24..28].try_into().expect("e_entry"));
    assert_eq!(entry, BASE, "e_entry must equal the documented base");
    assert_eq!(&elf[84..88], &encode::ebreak().to_le_bytes());
}
