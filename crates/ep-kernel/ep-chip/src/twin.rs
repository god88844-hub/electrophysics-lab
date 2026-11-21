//! Bay-3 digital-twin CPU — bit-exact Rust port of
//! `packages/chip-engine/src/rv32.mjs` (`createRV32`).
//!
//! This is the "cycle-accurate enough for the Bay 3 digital twin" model: the
//! cycle counter is a **declared architectural model** (1 CPI ALU, 2
//! loads/stores, +1 taken branch — "documented model, not a claim about any
//! physical core", per the reference docstring). The parity fixture in
//! `tests/data/parity_vectors.json` was captured from the JS engine and the
//! `tests/parity_chip_engine.rs` suite asserts bit-exact register file,
//! memory, cycle count, retire count, halted flag and PC for every vector.
//!
//! Ported reference behaviors (kept deliberately identical, including quirks
//! that the JS harness exhibits; the strict [`crate::cpu::Cpu`] core is the
//! spec-correct engine and does not share them):
//! - HALT sentinels: `0xffffffff` **or** `addi x0, x0, 1` — checked before
//!   dispatch; they still retire once and advance PC (JS falls through to the
//!   tail), after which every `step` is a no-op returning `None`.
//! - OP-IMM `funct3 = 3` performs a **signed** compare (the JS harness's
//!   behavior; the unsigned SLTIU of the spec lives in the strict core).
//! - OP `funct3 = 0` dispatches ADD or MUL before the `funct7 = 0x20` SUB
//!   branch can ever match — i.e. the twin executes SUB encodings as ADD.
//! - Unknown/undecoded encodings execute silently: no cycle increment, no
//!   register write, PC advances, instruction retires.
//! - Loads/stores are word-class only (`lw`/`sw`, `funct3 = 2`) with
//!   down-aligned addressing (`addr & ~3`).
//! - Branches implement BEQ/BNE/BLT only; taken branches cost the +1 flush.
//! - JAL/JALR write the link value (`pc + 4`) with no bit-0 clear.
//! - `x0` is hardwired: reset to 0 at the tail of every step.
//!
//! Address bounds: the JS typed-array harness silently coerces out-of-range
//! accesses (reads → 0, writes dropped). This port refuses them
//! (`TwinError::MemoryAccess`) — fail-closed instead of silently fabricating
//! state; the parity vectors stay inside the bounded image by construction.

use crate::isa::decode;

/// Twin execution error (fail-closed bounds; the JS harness's silent
/// out-of-range coercion is deliberately not fabricated here).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TwinError {
    /// Load/store outside the bounded deterministic memory image.
    MemoryAccess { addr: u32, store: bool },
}

impl std::fmt::Display for TwinError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::MemoryAccess { addr, store } => {
                write!(
                    f,
                    "twin memory access out of range: 0x{addr:08x} ({})",
                    if *store { "store" } else { "load" }
                )
            }
        }
    }
}

impl std::error::Error for TwinError {}

/// One executed twin instruction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TwinStep {
    /// Reference `note` string (`"op-imm"`, `"lw"`, `"branch-taken"`, `""`…).
    pub note: &'static str,
    pub pc: u32,
    pub inst: u32,
}

/// Twin `run()` summary (`{ cycles, retired, halted }`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TwinRunResult {
    pub cycles: u64,
    pub retired: u64,
    pub halted: bool,
}

/// Bay-3 digital-twin CPU over a deterministic bounded memory image.
#[derive(Debug)]
pub struct TwinCpu {
    mem: Vec<u8>,
    regs: [i32; 32],
    pc: u32,
    cycles: u64,
    retired: u64,
    halted: bool,
}

impl TwinCpu {
    /// Construct with the reference defaults (`memoryBytes`, `pcStart`).
    #[must_use]
    pub fn new(memory_bytes: usize, pc_start: u32) -> Self {
        Self {
            mem: vec![0; memory_bytes],
            regs: [0; 32],
            pc: pc_start,
            cycles: 0,
            retired: 0,
            halted: false,
        }
    }

    /// Load a program (32-bit words) at `base` — JS `load(programWords, base)`.
    pub fn load(&mut self, program_words: &[u32], base: u32) {
        for (i, word) in program_words.iter().enumerate() {
            let addr = base + (i as u32) * 4;
            self.write32(addr, *word as i32);
        }
    }

    fn write32(&mut self, addr: u32, value: i32) {
        let a = addr & !3;
        let bytes = value.to_le_bytes();
        self.mem[a as usize..a as usize + 4].copy_from_slice(&bytes);
    }

    fn read32(&self, addr: u32) -> i32 {
        let a = (addr & !3) as usize;
        i32::from_le_bytes(self.mem[a..a + 4].try_into().expect("bounded read"))
    }

    /// Execute one instruction — exact port of the JS `step()`.
    ///
    /// # Errors
    /// [`TwinError::MemoryAccess`] when a load/store leaves the bounded image
    /// (the JS harness would silently coerce; this port refuses).
    pub fn step(&mut self) -> Result<Option<TwinStep>, TwinError> {
        if self.halted {
            return Ok(None);
        }
        let inst = self.read32(self.pc) as u32;
        let f = decode(inst);
        let imm_i = f.imm_i;
        let imm_s = f.imm_s;
        let imm_b = f.imm_b;
        let imm_j = f.imm_j;
        let mut next_pc = self.pc.wrapping_add(4);
        let mut note = "";

        if inst == 0xffff_ffff || (f.opcode == 0x13 && f.rd == 0 && f.rs1 == 0 && imm_i == 1) {
            // HALT sentinel — checked before any dispatch. The JS harness
            // falls through to the tail: it retires once and advances PC.
            self.halted = true;
            note = "halt";
        } else if f.opcode == 0x13 {
            // ADDI / SLTI (f3=3: signed in this harness) / ORI / ANDI / SLLI /
            // SRLI / SRAI / XORI
            if f.f3 == 0 {
                self.regs[f.rd] = self.regs[f.rs1].wrapping_add(imm_i);
            } else if f.f3 == 3 {
                self.regs[f.rd] = if self.regs[f.rs1] < imm_i { 1 } else { 0 };
            } else if f.f3 == 6 {
                self.regs[f.rd] = self.regs[f.rs1] | imm_i;
            } else if f.f3 == 7 {
                self.regs[f.rd] = self.regs[f.rs1] & imm_i;
            } else if f.f3 == 1 {
                self.regs[f.rd] = self.regs[f.rs1].wrapping_shl(imm_i as u32);
            } else if f.f3 == 5 {
                self.regs[f.rd] = if f.f7 == 0x20 {
                    self.regs[f.rs1] >> (imm_i as u32 & 31)
                } else {
                    ((self.regs[f.rs1] as u32) >> (imm_i as u32 & 31)) as i32
                };
            } else if f.f3 == 4 {
                self.regs[f.rd] = self.regs[f.rs1] ^ imm_i;
            }
            note = "op-imm";
            self.cycles += 1;
        } else if f.opcode == 0x33 {
            // f3=0 catches ADD (and the SUB encoding — the JS branch ordering
            // makes SUB unreachable) plus MUL via f7=1.
            if f.f3 == 0 {
                self.regs[f.rd] = if f.f7 == 1 {
                    self.regs[f.rs1].wrapping_mul(self.regs[f.rs2])
                } else {
                    self.regs[f.rs1].wrapping_add(self.regs[f.rs2])
                };
            } else if f.f3 == 7 {
                self.regs[f.rd] = self.regs[f.rs1] & self.regs[f.rs2];
            } else if f.f3 == 6 {
                self.regs[f.rd] = self.regs[f.rs1] | self.regs[f.rs2];
            } else if f.f3 == 2 {
                self.regs[f.rd] = if self.regs[f.rs1] < self.regs[f.rs2] {
                    1
                } else {
                    0
                };
            }
            note = "op";
            self.cycles += 1;
        } else if f.opcode == 0x03 && f.f3 == 2 {
            let addr = self.regs[f.rs1].wrapping_add(imm_i) as u32;
            if (addr & !3) as usize > self.mem.len() - 4 {
                return Err(TwinError::MemoryAccess { addr, store: false });
            }
            self.regs[f.rd] = self.read32(addr);
            self.cycles += 2;
            note = "lw";
        } else if f.opcode == 0x23 && f.f3 == 2 {
            let addr = self.regs[f.rs1].wrapping_add(imm_s) as u32;
            if (addr & !3) as usize > self.mem.len() - 4 {
                return Err(TwinError::MemoryAccess { addr, store: true });
            }
            self.write32(addr, self.regs[f.rs2]);
            self.cycles += 2;
            note = "sw";
        } else if f.opcode == 0x63 {
            let take = if f.f3 == 0 {
                self.regs[f.rs1] == self.regs[f.rs2]
            } else if f.f3 == 1 {
                self.regs[f.rs1] != self.regs[f.rs2]
            } else if f.f3 == 4 {
                self.regs[f.rs1] < self.regs[f.rs2]
            } else {
                false
            };
            if take {
                next_pc = self.pc.wrapping_add(imm_b as u32);
                note = "branch-taken";
                self.cycles += 2; // branch flush penalty model
            } else {
                self.cycles += 1;
                note = "branch-not-taken";
            }
        } else if f.opcode == 0x6f {
            self.regs[f.rd] = self.pc.wrapping_add(4) as i32;
            next_pc = self.pc.wrapping_add(imm_j as u32);
            self.cycles += 2;
            note = "jal";
        } else if f.opcode == 0x67 {
            self.regs[f.rd] = self.pc.wrapping_add(4) as i32;
            next_pc = self.regs[f.rs1].wrapping_add(imm_i) as u32;
            self.cycles += 2;
            note = "jalr";
        } else if f.opcode == 0x37 {
            self.regs[f.rd] = (inst & 0xffff_f000) as i32;
            self.cycles += 1;
            note = "lui";
        }
        self.regs[0] = 0; // x0 hardwired
        self.pc = next_pc;
        self.retired += 1;
        Ok(Some(TwinStep {
            note,
            pc: self.pc,
            inst,
        }))
    }

    /// Run up to `max_steps` steps (JS default 10000) — exact port of `run`.
    pub fn run(&mut self, max_steps: u64) -> TwinRunResult {
        for _ in 0..max_steps {
            if self.halted {
                break;
            }
            let _ = self.step();
        }
        TwinRunResult {
            cycles: self.cycles,
            retired: self.retired,
            halted: self.halted,
        }
    }

    /// Architectural register file as unsigned words (bit-exact view).
    #[must_use]
    pub fn regs_u32(&self) -> Vec<u32> {
        self.regs.iter().map(|r| *r as u32).collect()
    }

    /// Deterministic memory image slice.
    #[must_use]
    pub fn mem(&self) -> &[u8] {
        &self.mem
    }

    /// Current program counter.
    #[must_use]
    pub const fn pc(&self) -> u32 {
        self.pc
    }

    /// Declared-model cycle count (1 CPI ALU, 2 loads/stores, +1 taken branch).
    #[must_use]
    pub const fn cycles(&self) -> u64 {
        self.cycles
    }

    /// Retired instruction count.
    #[must_use]
    pub const fn retired(&self) -> u64 {
        self.retired
    }

    /// Halted flag (sentinel reached).
    #[must_use]
    pub const fn halted(&self) -> bool {
        self.halted
    }
}
