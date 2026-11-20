/**
 * Compact RV32IM interpreter — cycle-accurate enough for the Bay 3 digital
 * twin: a deterministic subset (addi/add/sub/mul/and/or/slt/slti/slli/lw/sw/
 * beq/bne/jal/jalr/lui) with a real cycle counter (1 CPI for ALU, 2 for loads
 * and stores — documented model, not a claim about any physical core).
 */

export function createRV32(options = {}) {
  const mem = new Uint8Array(options.memoryBytes ?? 4096);
  const regs = new Int32Array(32);
  let pc = options.pcStart ?? 0;
  let cycles = 0;
  let retired = 0;
  let halted = false;

  const write32 = (addr, value) => {
    const a = addr & ~3;
    mem[a] = value & 0xff;
    mem[a + 1] = (value >>> 8) & 0xff;
    mem[a + 2] = (value >>> 16) & 0xff;
    mem[a + 3] = (value >>> 24) & 0xff;
  };
  const read32 = (addr) => {
    const a = addr & ~3;
    return (mem[a] | (mem[a + 1] << 8) | (mem[a + 2] << 16) | (mem[a + 3] << 24)) | 0;
  };

  /** Assemble a tiny program into memory at `base`. */
  function load(programWords, base = 0) {
    programWords.forEach((word, i) => write32(base + i * 4, word));
  }

  function step() {
    if (halted) return null;
    const inst = read32(pc) >>> 0;
    const opcode = inst & 0x7f;
    const rd = (inst >>> 7) & 0x1f;
    const f3 = (inst >>> 12) & 0x7;
    const rs1 = (inst >>> 15) & 0x1f;
    const rs2 = (inst >>> 20) & 0x1f;
    const f7 = (inst >>> 25) & 0x7f;
    const immI = ((inst >>> 20) << 20) >> 20;
    const immS = ((((inst >>> 25) & 0x7f) << 5 | ((inst >>> 7) & 0x1f)) << 20) >> 20;
    const immB = ((((inst >>> 31) & 1) << 12) | (((inst >>> 7) & 1) << 11) | (((inst >>> 25) & 0x3f) << 5) | (((inst >>> 8) & 0xf) << 1)) << 19 >> 19;
    const immJ = ((((inst >>> 31) & 1) << 20) | (((inst >>> 12) & 0xff) << 12) | (((inst >>> 20) & 1) << 11) | (((inst >>> 21) & 0x3ff) << 1)) << 11 >> 11;
    let nextPc = pc + 4;
    let note = '';
    if (inst === 0xffffffff || (opcode === 0x13 && rd === 0 && rs1 === 0 && immI === 1)) {
      // HALT sentinel (addi x0, x0, 1) — checked before any dispatch.
      halted = true;
      note = 'halt';
    } else if (opcode === 0x13) {
      // ADDI / SLTI / SLTIU / XORI / ORI / ANDI / SLLI / SRLI / SRAI
      if (f3 === 0) regs[rd] = (regs[rs1] + immI) | 0;
      else if (f3 === 3) regs[rd] = (regs[rs1] < immI ? 1 : 0);
      else if (f3 === 6) regs[rd] = regs[rs1] | immI;
      else if (f3 === 7) regs[rd] = regs[rs1] & immI;
      else if (f3 === 1) regs[rd] = regs[rs1] << (immI & 31);
      else if (f3 === 5) regs[rd] = f7 === 0x20 ? regs[rs1] >> (immI & 31) : (regs[rs1] >>> (immI & 31)) | 0;
      else if (f3 === 4) regs[rd] = regs[rs1] ^ immI;
      note = 'op-imm';
      cycles += 1;
    } else if (opcode === 0x33) {
      if (f3 === 0) regs[rd] = f7 === 1 ? Math.imul(regs[rs1], regs[rs2]) : (regs[rs1] + regs[rs2]) | 0;
      else if (f3 === 0 && f7 === 0x20) regs[rd] = (regs[rs1] - regs[rs2]) | 0;
      else if (f3 === 7) regs[rd] = regs[rs1] & regs[rs2];
      else if (f3 === 6) regs[rd] = regs[rs1] | regs[rs2];
      else if (f3 === 2) regs[rd] = regs[rs1] < regs[rs2] ? 1 : 0;
      note = 'op';
      cycles += 1;
    } else if (opcode === 0x03 && f3 === 2) {
      regs[rd] = read32((regs[rs1] + immI) | 0);
      cycles += 2;
      note = 'lw';
    } else if (opcode === 0x23 && f3 === 2) {
      write32((regs[rs1] + immS) | 0, regs[rs2]);
      cycles += 2;
      note = 'sw';
    } else if (opcode === 0x63) {
      const take = f3 === 0 ? regs[rs1] === regs[rs2] : f3 === 1 ? regs[rs1] !== regs[rs2] : f3 === 4 ? regs[rs1] < regs[rs2] : false;
      if (take) {
        nextPc = (pc + immB) | 0;
        note = 'branch-taken';
        cycles += 2; // branch flush penalty model
      } else {
        cycles += 1;
        note = 'branch-not-taken';
      }
    } else if (opcode === 0x6f) {
      regs[rd] = pc + 4;
      nextPc = (pc + immJ) | 0;
      cycles += 2;
      note = 'jal';
    } else if (opcode === 0x67) {
      regs[rd] = pc + 4;
      nextPc = (regs[rs1] + immI) | 0;
      cycles += 2;
      note = 'jalr';
    } else if (opcode === 0x37) {
      regs[rd] = inst & 0xfffff000;
      cycles += 1;
      note = 'lui';
    }
    regs[0] = 0; // x0 hardwired
    pc = nextPc;
    retired++;
    return { note, pc, inst };
  }

  return {
    regs,
    mem,
    get pc() { return pc; },
    get cycles() { return cycles; },
    get retired() { return retired; },
    get halted() { return halted; },
    load,
    step,
    run(maxSteps = 10000) {
      for (let i = 0; i < maxSteps; i++) {
        if (this.halted) break;
        step();
      }
      return { cycles, retired, halted };
    },
  };
}

// ---- Assembler helpers (word-level, deterministic) ----
export const asm = {
  R: (f7, rs2, rs1, f3, rd, op) => ((f7 << 25) | (rs2 << 20) | (rs1 << 15) | (f3 << 12) | (rd << 7) | op) >>> 0,
  I: (imm, rs1, f3, rd, op) => (((imm & 0xfff) << 20) | (rs1 << 15) | (f3 << 12) | (rd << 7) | op) >>> 0,
  S: (imm, rs2, rs1, f3, op) => {
    const imm12 = imm & 0xfff;
    return ((((imm12 >>> 5) & 0x7f) << 25) | (rs2 << 20) | (rs1 << 15) | (f3 << 12) | ((imm12 & 0x1f) << 7) | op) >>> 0;
  },
  B: (imm, rs2, rs1, f3, op) => {
    const imm13 = imm & 0x1fff;
    return ((((imm13 >>> 12) & 1) << 31) | (((imm13 >>> 5) & 0x3f) << 25) | (rs2 << 20) | (rs1 << 15) | (f3 << 12) | (((imm13 >>> 1) & 0xf) << 8) | (((imm13 >>> 11) & 1) << 7) | op) >>> 0;
  },
  J: (imm, rd, op) => {
    const imm21 = imm & 0x1fffff;
    return ((((imm21 >>> 20) & 1) << 31) | (((imm21 >>> 1) & 0x3ff) << 21) | (((imm21 >>> 11) & 1) << 20) | (((imm21 >>> 12) & 0xff) << 12) | (rd << 7) | op) >>> 0;
  },
  opImm: (f3, rd, rs1, imm) => asm.I(imm, rs1, f3, rd, 0x13),
  halt: () => asm.I(1, 0, 0, 0, 0x13), // addi x0, x0, 1 = HALT sentinel
};
