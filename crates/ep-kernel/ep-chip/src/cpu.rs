//! Strict bounded RV32I 2.1 + M 2.0 single-hart CPU — Rust mirror of the
//! Phase 0 IL-8/RV32IM bounded reference (`js/labs/rv32i/rv32i.js`), which is
//! the `03_PHYSICS_MATH_FUNDAMENTALS.md` §5 oracle for RV32IM execution
//! ("register file bit-exact") and is itself QEMU-differentiated on the
//! bounded ISA subset (Phase 8 protocol).
//!
//! Contract notes (all mirror the JS reference exactly):
//! - Deterministic memory image: little-endian flat RAM, program copied to
//!   `base`, execution starts at `start_pc`. Constructor validation is
//!   fail-closed (memory bounds, alignment, program-fit, ISA profile).
//! - EBREAK (`0x00100073`) is the HALT/stop convention (`ok: true`);
//!   ECALL traps (`ok: false`); every other SYSTEM/CSR encoding is an
//!   explicit illegal-instruction trap — CSRs are rejected, not fabricated.
//! - Stores commit atomically only after address validation, so a misaligned
//!   or out-of-range store never partially mutates memory or registers.
//! - M extension is opt-in via [`CpuIsa::Rv32im`]; the default `rv32i`
//!   profile rejects all eight M encodings.
//! - Branch/jump targets and load/store addresses are validated before any
//!   commit; misalignment traps with no register change.
//! - Timing is not modelled here (the declared cycle model lives in
//!   [`crate::twin`], the Bay-3 digital twin); `RunResult::timing` is the
//!   reference string `"not-modelled"`.
//! - Unknown opcodes never fabricate success: they trap.
//! - One extension over the JS reference: the custom-0/custom-1 opcode space
//!   (0x0B / 0x2B) dispatches to a registered [`crate::CustomIsaHook`] when
//!   one is attached; with no hook the behavior is identical to the JS
//!   reference (illegal-instruction).

use crate::custom::CustomIsaHook;
use crate::isa::decode;
use ep_core::ProvenanceBadge;
use serde::{Deserialize, Serialize};

/// ISA profile. The M extension is opt-in (`tests/rv32m.test.mjs`:
/// "plain RV32I still rejects all eight M encodings").
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CpuIsa {
    /// Strict RV32I 2.1 base profile.
    Rv32i,
    /// RV32I 2.1 + M 2.0 (opt-in multiply/divide).
    Rv32im,
}

impl CpuIsa {
    /// Reference specification string (`rv32i.js` exports).
    #[must_use]
    pub fn specification(self) -> &'static str {
        match self {
            Self::Rv32i => "RV32I 2.1",
            Self::Rv32im => "RV32IM (RV32I 2.1 + M 2.0)",
        }
    }

    /// Validate an ISA profile string exactly like the JS constructor
    /// (`isa !== 'rv32i' && isa !== 'rv32im'` -> refused).
    ///
    /// # Errors
    /// [`CpuError::Config`] for any profile other than `rv32i` / `rv32im`.
    pub fn from_profile(profile: &str) -> Result<Self, CpuError> {
        match profile {
            "rv32i" => Ok(Self::Rv32i),
            "rv32im" => Ok(Self::Rv32im),
            other => Err(CpuError::Config(format!(
                "Unsupported RV32 ISA profile: {other}"
            ))),
        }
    }
}

const MAX_MEMORY: usize = 16 * 1024 * 1024;
const MAX_WRITES: usize = 4096;

/// Configuration or execution error (fail-closed; messages mirror the JS
/// reference so harness assertions carry over verbatim).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CpuError {
    /// Constructor validation failure (`isa`/`memory size`/`aligned`/`RAM`).
    Config(String),
    /// `step()` after a terminal stop.
    AlreadyStopped(String),
}

impl std::fmt::Display for CpuError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Config(reason) => write!(f, "{reason}"),
            Self::AlreadyStopped(reason) => {
                write!(f, "RV32I execution already stopped: {reason}")
            }
        }
    }
}

impl std::error::Error for CpuError {}

/// One executed instruction (bounded ring buffer, `max_trace` capacity).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Trace {
    pub pc: u32,
    pub word: u32,
    pub mnemonic: String,
    pub rd: Option<usize>,
    pub value: Option<u32>,
    pub next_pc: u32,
}

/// A terminal stop/trap event.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Trap {
    pub pc: u32,
    pub instruction: Option<u32>,
    pub cause: String,
    pub detail: String,
}

/// Outcome of one [`Cpu::step`] call.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StepOutcome {
    /// Instruction retired (may have been a store-only or NOP-class op).
    Retired(Trace),
    /// Terminal stop/trap reached (state is frozen afterwards).
    Stopped(Trap),
}

/// Whole-run summary. Field names and semantics mirror the JS `run()` output.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunResult {
    pub ok: bool,
    pub status: String,
    pub stop_reason: String,
    pub pc: u32,
    pub retired: u64,
    pub regs: Vec<u32>,
    pub traces: Vec<Trace>,
    pub writes: Vec<MemoryWrite>,
    pub trap: Option<Trap>,
    pub specification: String,
    pub isa: String,
    pub model: String,
    pub timing: String,
    pub physical_validation: String,
    pub real_world_build_success_percent: Option<f64>,
    /// Declared provenance: architectural model, never silicon evidence.
    pub provenance: ProvenanceBadge,
    pub note: String,
}

/// One architectural memory write (evidence trace, little-endian).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MemoryWrite {
    pub address: u32,
    pub size: u32,
    pub value: u32,
}

/// Strict single-hart RV32IM CPU over a deterministic bounded memory image.
#[derive(Debug)]
pub struct Cpu {
    isa: CpuIsa,
    base: u32,
    pc: u32,
    mem: Vec<u8>,
    regs: [i32; 32],
    traces: Vec<Trace>,
    max_trace: usize,
    retired: u64,
    halted: bool,
    stop_reason: Option<String>,
    trap: Option<Trap>,
    writes: Vec<MemoryWrite>,
    custom_hook: Option<Box<dyn CustomIsaHook>>,
}

impl Cpu {
    /// Construct a CPU with a deterministic memory image.
    ///
    /// # Errors
    /// Fail-closed (mirroring the JS reference): unsupported ISA profile,
    /// invalid memory size, invalid/unaligned base or entry point, invalid
    /// trace cap, or a program larger than the RAM image.
    pub fn new(
        program: &[u32],
        memory_bytes: usize,
        base: u32,
        start_pc: u32,
        max_trace: usize,
        isa: CpuIsa,
    ) -> Result<Self, CpuError> {
        if !(64..=MAX_MEMORY).contains(&memory_bytes) {
            return Err(CpuError::Config("Invalid RV32I memory size".to_string()));
        }
        if !base.is_multiple_of(4) || !start_pc.is_multiple_of(4) {
            return Err(CpuError::Config(
                "RV32I instruction base and entry point must be 4-byte aligned".to_string(),
            ));
        }
        if max_trace > 10_000 {
            return Err(CpuError::Config("Invalid trace cap".to_string()));
        }
        if program.len() * 4 > memory_bytes {
            return Err(CpuError::Config("RV32I program exceeds RAM".to_string()));
        }
        let mut mem = vec![0_u8; memory_bytes];
        for (i, word) in program.iter().enumerate() {
            mem[i * 4..i * 4 + 4].copy_from_slice(&word.to_le_bytes());
        }
        Ok(Self {
            isa,
            base,
            pc: start_pc,
            mem,
            regs: [0; 32],
            traces: Vec::new(),
            max_trace,
            retired: 0,
            halted: false,
            stop_reason: None,
            trap: None,
            writes: Vec::new(),
            custom_hook: None,
        })
    }

    /// Attach the custom-ISA hook (custom-0/custom-1 opcode dispatch).
    pub fn set_custom_hook(&mut self, hook: Box<dyn CustomIsaHook>) {
        self.custom_hook = Some(hook);
    }

    /// Address validation mirroring `rv32i.js _offset` (errors carry the same
    /// wording; the caller routes them to the matching trap cause).
    fn offset(&self, addr: u32, size: u32) -> Result<usize, String> {
        let start = addr.wrapping_sub(self.base);
        if size > 1 && !addr.is_multiple_of(size) {
            return Err(format!("misaligned {size}-byte access at 0x{addr:08x}"));
        }
        if u64::from(start) > u64::from(self.mem.len() as u32 - size) {
            return Err(format!("out-of-range memory access at 0x{addr:08x}"));
        }
        Ok(start as usize)
    }

    /// Route a memory-access error string to its trap cause exactly as the
    /// JS catch block does (`/misaligned/`, `/out-of-range/`, else illegal).
    fn route_memory_error(&mut self, message: String, word: u32) -> Trap {
        if message.contains("misaligned") {
            self.stop("misaligned-access", message, Some(word))
        } else if message.contains("out-of-range") {
            self.stop("memory-access-fault", message, Some(word))
        } else {
            self.stop("illegal-instruction", message, Some(word))
        }
    }

    fn load(&self, addr: u32, size: u32, signed: bool) -> Result<i32, String> {
        let i = self.offset(addr, size)?;
        let mut value: u32 = 0;
        for j in 0..size {
            value |= u32::from(self.mem[i + j as usize]) << (j * 8);
        }
        if signed && size < 4 {
            let bits = size * 8;
            Ok(((value << (32 - bits)) as i32) >> (32 - bits))
        } else {
            Ok(value as i32)
        }
    }

    /// Store (offset already validated — atomic-commit contract).
    fn store(&mut self, addr: u32, size: u32, value: i32) {
        let i = self
            .offset(addr, size)
            .expect("store offset validated before commit");
        self.mem[i..i + size as usize].copy_from_slice(&value.to_le_bytes()[..size as usize]);
        if self.writes.len() < MAX_WRITES {
            let mask = if size == 4 {
                u32::MAX
            } else {
                (1_u32 << (size * 8)) - 1
            };
            self.writes.push(MemoryWrite {
                address: addr,
                size,
                value: (value as u32) & mask,
            });
        }
    }

    fn stop(&mut self, reason: &str, detail: String, word: Option<u32>) -> Trap {
        self.halted = true;
        self.stop_reason = Some(reason.to_string());
        let trap = Trap {
            pc: self.pc,
            instruction: word,
            cause: reason.to_string(),
            detail,
        };
        self.trap = Some(trap.clone());
        trap
    }

    /// Execute one instruction. Terminal stops are recorded on the CPU and
    /// returned; calling again after any stop is an error.
    ///
    /// # Errors
    /// [`CpuError::AlreadyStopped`] once a terminal stop was reached.
    pub fn step(&mut self) -> Result<StepOutcome, CpuError> {
        if self.halted {
            return Err(CpuError::AlreadyStopped(
                self.stop_reason.clone().unwrap_or_default(),
            ));
        }
        let pc = self.pc;
        if !pc.is_multiple_of(4) {
            let t = self.stop(
                "instruction-misaligned",
                "PC not aligned to four bytes".into(),
                None,
            );
            return Ok(StepOutcome::Stopped(t));
        }
        let word = match self.load(pc, 4, false) {
            Ok(w) => w as u32,
            Err(message) => {
                let t = self.stop("instruction-access-fault", message, None);
                return Ok(StepOutcome::Stopped(t));
            }
        };
        if word.is_multiple_of(4) {
            let t = self.stop(
                "illegal-instruction",
                "compressed instruction unsupported in RV32I".into(),
                Some(word),
            );
            return Ok(StepOutcome::Stopped(t));
        }
        let f = decode(word);
        let a = self.regs[f.rs1];
        let b = self.regs[f.rs2];
        let mut next = pc.wrapping_add(4);
        let mut result: Option<i32> = None;
        #[allow(unused_assignments)]
        let mut name = "";
        let mut store: Option<(u32, u32, i32)> = None;

        // Fail-closed illegal exit (mirror of the JS `illegal` closure).
        macro_rules! illegal {
            ($msg:expr) => {{
                let t = self.stop(
                    "illegal-instruction",
                    format!("illegal instruction 0x{:08x}: {}", word, $msg),
                    Some(word),
                );
                return Ok(StepOutcome::Stopped(t));
            }};
        }

        match f.opcode {
            0x37 => {
                name = "LUI";
                result = Some(f.imm_u as i32);
            }
            0x17 => {
                name = "AUIPC";
                result = Some(pc.wrapping_add(f.imm_u) as i32);
            }
            0x6f => {
                name = "JAL";
                result = Some(pc.wrapping_add(4) as i32);
                next = pc.wrapping_add(f.imm_j as u32);
            }
            0x67 => {
                if f.f3 != 0 {
                    illegal!("JALR funct3");
                }
                name = "JALR";
                result = Some(pc.wrapping_add(4) as i32);
                next = a.wrapping_add(f.imm_i) as u32 & !1;
            }
            0x63 => {
                name = match f.f3 {
                    0 => "BEQ",
                    1 => "BNE",
                    4 => "BLT",
                    5 => "BGE",
                    6 => "BLTU",
                    7 => "BGEU",
                    _ => illegal!("branch funct3"),
                };
                let taken = match f.f3 {
                    0 => a == b,
                    1 => a != b,
                    4 => a < b,
                    5 => a >= b,
                    6 => (a as u32) < (b as u32),
                    7 => (a as u32) >= (b as u32),
                    _ => false,
                };
                if taken {
                    next = pc.wrapping_add(f.imm_b as u32);
                }
            }
            0x03 => {
                let (mnem, size, signed) = match f.f3 {
                    0 => ("LB", 1, true),
                    1 => ("LH", 2, true),
                    2 => ("LW", 4, true),
                    4 => ("LBU", 1, false),
                    5 => ("LHU", 2, false),
                    _ => illegal!("load funct3"),
                };
                name = mnem;
                match self.load(a.wrapping_add(f.imm_i) as u32, size, signed) {
                    Ok(value) => result = Some(value),
                    Err(message) => {
                        let t = self.route_memory_error(message, word);
                        return Ok(StepOutcome::Stopped(t));
                    }
                }
            }
            0x23 => {
                let (mnem, size) = match f.f3 {
                    0 => ("SB", 1),
                    1 => ("SH", 2),
                    2 => ("SW", 4),
                    _ => illegal!("store funct3"),
                };
                name = mnem;
                let addr = a.wrapping_add(f.imm_s) as u32;
                // Validate before commit (atomic-commit contract).
                if let Err(message) = self.offset(addr, size) {
                    let t = self.route_memory_error(message, word);
                    return Ok(StepOutcome::Stopped(t));
                }
                store = Some((addr, size, b));
            }
            0x13 => {
                let value = match f.f3 {
                    0 => {
                        name = "ADDI";
                        a.wrapping_add(f.imm_i)
                    }
                    2 => {
                        name = "SLTI";
                        if a < f.imm_i {
                            1
                        } else {
                            0
                        }
                    }
                    3 => {
                        name = "SLTIU";
                        if (a as u32) < f.imm_i as u32 {
                            1
                        } else {
                            0
                        }
                    }
                    4 => {
                        name = "XORI";
                        a ^ f.imm_i
                    }
                    6 => {
                        name = "ORI";
                        a | f.imm_i
                    }
                    7 => {
                        name = "ANDI";
                        a & f.imm_i
                    }
                    1 => {
                        if f.f7 != 0 {
                            illegal!("SLLI upper immediate bits");
                        }
                        name = "SLLI";
                        a.wrapping_shl(f.rs2 as u32)
                    }
                    5 if f.f7 == 0 => {
                        name = "SRLI";
                        ((a as u32) >> (f.rs2 as u32 & 31)) as i32
                    }
                    5 if f.f7 == 0x20 => {
                        name = "SRAI";
                        a >> (f.rs2 as u32 & 31)
                    }
                    5 => illegal!("shift immediate upper bits"),
                    _ => illegal!("OP-IMM funct3"),
                };
                result = Some(value);
            }
            0x33 => {
                let value = if f.f3 == 0 && f.f7 == 0x20 {
                    name = "SUB";
                    a.wrapping_sub(b)
                } else if f.f3 == 5 && f.f7 == 0x20 {
                    name = "SRA";
                    a >> (b as u32 & 31)
                } else if f.f7 == 0x01 {
                    if self.isa != CpuIsa::Rv32im {
                        illegal!("RV32M extension is not enabled");
                    }
                    match f.f3 {
                        0 => {
                            name = "MUL";
                            a.wrapping_mul(b)
                        }
                        1 => {
                            name = "MULH";
                            mul_high_signed(a, b)
                        }
                        2 => {
                            name = "MULHSU";
                            mul_high_signed_unsigned(a, b)
                        }
                        3 => {
                            name = "MULHU";
                            mul_high_unsigned(a, b)
                        }
                        4 => {
                            name = "DIV";
                            if b == 0 {
                                -1 // architectural: all one bits
                            } else {
                                a.wrapping_div(b) // MIN / -1 wraps to MIN (spec)
                            }
                        }
                        5 => {
                            name = "DIVU";
                            if b == 0 {
                                -1 // 0xffffffff
                            } else {
                                ((a as u32) / (b as u32)) as i32
                            }
                        }
                        6 => {
                            name = "REM";
                            if b == 0 {
                                a // architectural: remainder is the dividend
                            } else {
                                a.wrapping_rem(b) // MIN % -1 = 0 (spec)
                            }
                        }
                        7 => {
                            name = "REMU";
                            if b == 0 {
                                a // u32(a)
                            } else {
                                ((a as u32) % (b as u32)) as i32
                            }
                        }
                        _ => illegal!("unrecognized RV32M operation"),
                    }
                } else if f.f7 == 0 {
                    match f.f3 {
                        0 => {
                            name = "ADD";
                            a.wrapping_add(b)
                        }
                        1 => {
                            name = "SLL";
                            a.wrapping_shl(b as u32 & 31)
                        }
                        2 => {
                            name = "SLT";
                            if a < b {
                                1
                            } else {
                                0
                            }
                        }
                        3 => {
                            name = "SLTU";
                            if (a as u32) < (b as u32) {
                                1
                            } else {
                                0
                            }
                        }
                        4 => {
                            name = "XOR";
                            a ^ b
                        }
                        5 => {
                            name = "SRL";
                            ((a as u32) >> (b as u32 & 31)) as i32
                        }
                        6 => {
                            name = "OR";
                            a | b
                        }
                        7 => {
                            name = "AND";
                            a & b
                        }
                        _ => illegal!("OP funct3"),
                    }
                } else {
                    illegal!("invalid register arithmetic funct7");
                };
                result = Some(value);
            }
            0x0f => {
                if f.f3 != 0 {
                    illegal!("FENCE.I is a separate ISA extension, not RV32I base");
                }
                name = "FENCE"; // single-hart RAM-only ordering; no external devices
            }
            0x73 => {
                if word == 0x0010_0073 {
                    let t = self.stop("ebreak", "architectural breakpoint trap".into(), Some(word));
                    return Ok(StepOutcome::Stopped(t));
                }
                if word == 0x0000_0073 {
                    let t = self.stop(
                        "ecall",
                        "environment call requires a separate operating environment".into(),
                        Some(word),
                    );
                    return Ok(StepOutcome::Stopped(t));
                }
                illegal!("unsupported system/CSR encoding");
            }
            0x0b | 0x2b => {
                // Custom-0 / custom-1 opcode space: fail-closed dispatch to the
                // registered hook; identical to the JS reference (illegal) when
                // no hook is attached.
                match self.custom_hook.as_mut() {
                    Some(hook) => match hook.execute(word, &mut self.regs) {
                        Some(effect) => {
                            name = hook.mnemonic(word);
                            let _ = effect.cycle_cost; // declared cost; strict core does not model timing
                        }
                        None => illegal!("custom-ISA hook did not claim this encoding"),
                    },
                    None => illegal!("unknown opcode"),
                }
            }
            _ => illegal!("unknown opcode"),
        }

        if !next.is_multiple_of(4) {
            let t = self.stop(
                "misaligned-access",
                format!("instruction address misaligned: target 0x{next:08x}"),
                Some(word),
            );
            return Ok(StepOutcome::Stopped(t));
        }
        // All operations are committed atomically after validation.
        if let Some((addr, size, value)) = store {
            self.store(addr, size, value);
        }
        if let Some(value) = result {
            if f.rd != 0 {
                self.regs[f.rd] = value;
            }
        }
        self.regs[0] = 0;
        self.pc = next;
        self.retired += 1;
        let trace = Trace {
            pc,
            word,
            mnemonic: name.to_string(),
            rd: result.is_some().then_some(f.rd),
            value: result.map(|v| v as u32),
            next_pc: self.pc,
        };
        if self.max_trace > 0 {
            self.traces.push(trace.clone());
            if self.traces.len() > self.max_trace {
                self.traces.remove(0);
            }
        }
        Ok(StepOutcome::Retired(trace))
    }

    /// Run to a terminal stop or until `max_steps` is exhausted.
    ///
    /// # Errors
    /// [`CpuError::Config`] when the budget is outside 1..=1_000_000.
    pub fn run(&mut self, max_steps: u64) -> Result<RunResult, CpuError> {
        if max_steps == 0 || max_steps > 1_000_000 {
            return Err(CpuError::Config(
                "Invalid RV32I execution budget".to_string(),
            ));
        }
        let mut budget = max_steps;
        while !self.halted && budget > 0 {
            self.step()?;
            budget -= 1;
        }
        if !self.halted {
            self.stop(
                "step-limit",
                "Execution budget exhausted before an explicit stop".into(),
                None,
            );
        }
        let stop_reason = self.stop_reason.clone().expect("stopped above");
        let ok = stop_reason == "ebreak";
        Ok(RunResult {
            ok,
            status: if ok { "breakpoint-reached" } else { "stopped" }.to_string(),
            stop_reason,
            pc: self.pc,
            retired: self.retired,
            regs: self.regs.iter().map(|r| *r as u32).collect(),
            traces: self.traces.clone(),
            writes: self.writes.clone(),
            trap: self.trap.clone(),
            specification: self.isa.specification().to_string(),
            isa: match self.isa {
                CpuIsa::Rv32i => "rv32i",
                CpuIsa::Rv32im => "rv32im",
            }
            .to_string(),
            model: "single-hart-functional".to_string(),
            timing: "not-modelled".to_string(),
            physical_validation: "none".to_string(),
            real_world_build_success_percent: None,
            provenance: ProvenanceBadge::SimulatedArchitecturalModel,
            note: "EBREAK reaching a trap is a test stopping convention, not an OS exit, manufacturing result, or ISA certification.".to_string(),
        })
    }

    /// Write a register directly (parity seam for the reference harness,
    /// which seeds `cpu.regs[n]` before `run`; `x0` is re-pinned to zero by
    /// the next committed instruction exactly as in the JS engine).
    pub fn regs_set(&mut self, index: usize, value: i32) {
        self.regs[index] = value;
    }

    /// Current architectural register file as unsigned words.
    #[must_use]
    pub fn regs_u32(&self) -> Vec<u32> {
        self.regs.iter().map(|r| *r as u32).collect()
    }

    /// Deterministic memory image slice.
    #[must_use]
    pub fn mem(&self) -> &[u8] {
        &self.mem
    }

    /// Read one little-endian 32-bit word from the memory image.
    #[must_use]
    pub fn mem_word(&self, byte_offset: usize) -> u32 {
        u32::from_le_bytes(
            self.mem[byte_offset..byte_offset + 4]
                .try_into()
                .expect("bounded 4-byte read"),
        )
    }

    /// Current program counter.
    #[must_use]
    pub const fn pc(&self) -> u32 {
        self.pc
    }

    /// Retired instruction count.
    #[must_use]
    pub const fn retired(&self) -> u64 {
        self.retired
    }

    /// Terminal stop reason, if stopped.
    #[must_use]
    pub fn stop_reason(&self) -> Option<&str> {
        self.stop_reason.as_deref()
    }
}

/// `MULH`: high word of the signed 64-bit product.
#[must_use]
pub fn mul_high_signed(a: i32, b: i32) -> i32 {
    (((i64::from(a) * i64::from(b)) >> 32) & 0xffff_ffff) as u32 as i32
}

/// `MULHSU`: high word of the signed×unsigned 64-bit product.
#[must_use]
pub fn mul_high_signed_unsigned(a: i32, b: i32) -> i32 {
    (((i64::from(a) * i64::from(b as u32)) >> 32) & 0xffff_ffff) as u32 as i32
}

/// `MULHU`: high word of the unsigned 64-bit product.
#[must_use]
pub fn mul_high_unsigned(a: i32, b: i32) -> i32 {
    (((u64::from(a as u32) * u64::from(b as u32)) >> 32) & 0xffff_ffff) as u32 as i32
}
