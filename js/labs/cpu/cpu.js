// cpu.js — IL-8 pipelined core: classic 5-stage in-order pipeline.
//
//   IF -> ID -> EX -> ME -> WB   (one instruction per stage per cycle)
//
// Hazard handling (all modeled explicitly, all testable):
//   * RAW hazards   -> operand forwarding from EX/ME latch (newest first),
//                      then from WB stage
//   * load-use      -> 1-cycle stall detected in ID (bubble into EX);
//                      after the stall the load data forwards from WB
//   * branches      -> resolved in EX, predict-not-taken: a taken branch
//                      flushes IF and ID (2-cycle penalty) and redirects PC
//   * flags         -> committed at EX (in-order: a branch in EX only ever
//                      reads flags from architecturally older instructions)
//
// An unpipelined reference interpreter is included (referenceRun) so tests
// can assert pipeline == architecture, cycle by cycle.

import { OPS, OP_NAMES, SIZES, ALU_OPS, UNARY_OPS, BRANCH_OPS } from './isa.js';

const BUBBLE = { valid: false };

export class IL8 {
  constructor({ program, inputs = {} } = {}) {
    this.mem = new Uint8Array(0x10000);
    if (program) this.mem.set(program, 0);
    this.inputs = inputs;
    this.regs = new Uint8Array(8);
    this.pc = 0;
    this.flags = { z: false, n: false, c: false };
    this.ifId = { ...BUBBLE };
    this.idEx = { ...BUBBLE };
    this.exMe = { ...BUBBLE };
    this.meWb = { ...BUBBLE };
    this.fetchHalt = false;
    this.stats = { cycles: 0, retired: 0, stalls: 0, flushes: 0 };
    this.ports = [];       // [{port, value, cycle}]
    this.problems = [];
    this.halted = false;
    this.trace = [];       // last N pipeline snapshots
  }

  reset(program) {
    this.mem = new Uint8Array(0x10000);
    if (program) this.mem.set(program, 0);
    this.regs = new Uint8Array(8);
    this.pc = 0;
    this.flags = { z: false, n: false, c: false };
    this.ifId = { ...BUBBLE }; this.idEx = { ...BUBBLE };
    this.exMe = { ...BUBBLE }; this.meWb = { ...BUBBLE };
    this.fetchHalt = false;
    this.stats = { cycles: 0, retired: 0, stalls: 0, flushes: 0 };
    this.ports = [];
    this.problems = [];
    this.halted = false;
    this.trace = [];
  }

  /** fetch + pre-decode one instruction (multi-byte fetch in one IF cycle) */
  fetch(addr) {
    const op = this.mem[addr];
    if (SIZES[op] === 0) return { valid: true, addr, opcode: 0xff, bad: true, size: 1 };
    const size = SIZES[op];
    const ins = { valid: true, addr, opcode: op, size };
    switch (op) {
      case OPS.LDI: ins.rd = this.mem[addr + 1] >> 4; ins.imm = this.mem[addr + 2]; ins.wr = true; ins.reads = []; break;
      case OPS.LD: ins.rd = this.mem[addr + 1]; ins.target = (this.mem[addr + 2] << 8) | this.mem[addr + 3]; ins.wr = true; ins.isLoad = true; ins.reads = []; break;
      case OPS.ST: ins.rs = this.mem[addr + 1]; ins.target = (this.mem[addr + 2] << 8) | this.mem[addr + 3]; ins.wr = false; ins.reads = [ins.rs]; break;
      case OPS.IN: ins.rd = this.mem[addr + 1]; ins.port = this.mem[addr + 2]; ins.wr = true; ins.isLoad = true; ins.reads = []; break;
      case OPS.OUT: ins.port = this.mem[addr + 1]; ins.rs = this.mem[addr + 2]; ins.wr = false; ins.reads = [ins.rs]; break;
      case OPS.ADD: case OPS.SUB: case OPS.AND: case OPS.OR: case OPS.XOR: case OPS.CMP:
        ins.rd = this.mem[addr + 1] >> 4; ins.rs = this.mem[addr + 1] & 0xf;
        ins.wr = op !== OPS.CMP; ins.alu = op; ins.reads = op === OPS.CMP ? [ins.rd, ins.rs] : [ins.rd, ins.rs];
        break;
      case OPS.INC: case OPS.DEC: case OPS.SHL: case OPS.SHR:
        ins.rd = this.mem[addr + 1] >> 4; ins.wr = true; ins.alu = op; ins.reads = [ins.rd];
        break;
      case OPS.JMP: case OPS.JZ: case OPS.JNZ: case OPS.JN: case OPS.JC:
        ins.target = (this.mem[addr + 1] << 8) | this.mem[addr + 2]; ins.wr = false; ins.branch = op; ins.reads = [];
        break;
      case OPS.HLT: ins.wr = false; ins.reads = []; break;
      case OPS.NOP: default: ins.wr = false; ins.reads = []; break;
    }
    return ins;
  }

  /** one full pipeline cycle */
  step() {
    const sIfId = this.ifId, sIdEx = this.idEx, sExMe = this.exMe, sMeWb = this.meWb;
    const stats = this.stats;
    stats.cycles += 1;

    let flushFetch = false, redirectPc = null;

    // ---------------- WB ----------------
    if (sMeWb.valid) {
      if (sMeWb.wr) this.regs[sMeWb.rd] = sMeWb.value & 0xff;
      stats.retired += 1;
      if (sMeWb.opcode === OPS.HLT) this.halted = true;
    }

    // ---------------- ME ----------------
    let newMeWb = { ...BUBBLE };
    if (sExMe.valid) {
      const e = sExMe;
      if (e.opcode === OPS.LD) {
        newMeWb = { valid: true, wr: true, rd: e.rd, value: this.mem[e.target], opcode: e.opcode, addr: e.addr };
      } else if (e.opcode === OPS.ST) {
        this.mem[e.target] = e.storeVal & 0xff;
        newMeWb = { valid: true, wr: false, opcode: e.opcode, addr: e.addr };
      } else if (e.opcode === OPS.OUT) {
        this.ports.push({ port: e.port, value: e.storeVal & 0xff, cycle: stats.cycles });
        newMeWb = { valid: true, wr: false, opcode: e.opcode, addr: e.addr };
      } else if (e.opcode === OPS.IN) {
        newMeWb = { valid: true, wr: true, rd: e.rd, value: this.inputs[e.port] ?? 0, opcode: e.opcode, addr: e.addr };
      } else {
        newMeWb = { valid: true, wr: !!e.wr, rd: e.rd, value: e.aluOut, opcode: e.opcode, addr: e.addr };
      }
    }

    // ---------------- EX ----------------
    let newExMe = { ...BUBBLE };
    if (sIdEx.valid && !sIdEx.bad) {
      const e = sIdEx;
      const fwd = (reg) => {
        // newest-first: EX/ME latch (instr now entering ME), then WB stage
        if (sExMe.valid && sExMe.wr && sExMe.rd === reg && !sExMe.isLoad) return sExMe.aluOut;
        if (sMeWb.valid && sMeWb.wr && sMeWb.rd === reg) return sMeWb.value;
        return this.regs[reg];
      };
      if (ALU_OPS.has(e.opcode) || UNARY_OPS.has(e.opcode) || e.opcode === OPS.CMP) {
        const a = fwd(e.rd);
        const b = e.rs !== undefined && !UNARY_OPS.has(e.opcode) ? fwd(e.rs) : 0;
        const r = this.alu(e.opcode, a, b);
        newExMe = { ...e, aluOut: r.value, storeVal: r.value, valid: true };
        // flags commit at EX (in-order guarantee: see file header)
        if (r.flags) this.flags = r.flags;
      } else if (e.opcode === OPS.LDI) {
        newExMe = { ...e, aluOut: e.imm & 0xff, valid: true };
      } else if (e.opcode === OPS.ST || e.opcode === OPS.OUT) {
        newExMe = { ...e, storeVal: fwd(e.rs), valid: true };
      } else if (BRANCH_OPS.has(e.opcode)) {
        const f = this.flags;
        let taken = false;
        switch (e.opcode) {
          case OPS.JMP: taken = true; break;
          case OPS.JZ: taken = f.z; break;
          case OPS.JNZ: taken = !f.z; break;
          case OPS.JN: taken = f.n; break;
          case OPS.JC: taken = f.c; break;
        }
        if (taken) {
          flushFetch = true;
          redirectPc = e.target;
          stats.flushes += 2; // IF and ID stages squashed
        }
        newExMe = { ...e, valid: true };
      } else {
        newExMe = { ...e, valid: true }; // LD/IN/ST/OUT/NOP/HLT pass through
      }
    }

    // ---------------- ID (decode done in IF; ID = hazard control) ---------
    let newIdEx = { ...BUBBLE };
    let stall = false;
    // a taken branch (resolved above in EX) squashes the ID stage too
    if (!flushFetch && sIfId.valid && !sIfId.bad) {
      const e = sIfId;
      // load-use hazard: producer (currently entering EX) is a load/IN
      // whose destination matches this instruction's source register
      if (sIdEx.valid && sIdEx.isLoad && sIdEx.wr &&
          (e.reads || []).includes(sIdEx.rd)) {
        stall = true;
        stats.stalls += 1;
      } else {
        newIdEx = { ...e };
        if (e.opcode === OPS.HLT) this.fetchHalt = true;
      }
    }

    // ---------------- IF ----------------
    let newIfId = { ...BUBBLE };
    if (!stall && !this.fetchHalt) {
      if (flushFetch) {
        this.pc = redirectPc; // squashed fetch; target fetched next cycle
      } else {
        const ins = this.fetch(this.pc);
        newIfId = ins;
        if (ins.bad) {
          this.problems.push(`Invalid opcode 0x${this.mem[this.pc].toString(16)} at 0x${this.pc.toString(16).padStart(4, '0')} — execution stopped.`);
          this.fetchHalt = true;
          newIfId = { ...BUBBLE };
        } else {
          this.pc = (this.pc + (ins.size || 1)) & 0xffff;
        }
      }
    }

    // ---------------- latch write-back ----------------
    this.meWb = newMeWb;
    this.exMe = newExMe;
    this.idEx = newIdEx;
    if (!stall) this.ifId = newIfId; // hold instruction during a stall

    if (this.opts?.trace) {
      this.trace.push({
        cycle: stats.cycles,
        pc: this.pc,
        if: sIfId.valid ? OP_NAMES[sIfId.opcode] || '?' : '·',
        id: sIfId.valid ? OP_NAMES[sIfId.opcode] || '?' : '·',
        ex: sIdEx.valid ? OP_NAMES[sIdEx.opcode] || '?' : '·',
        me: sExMe.valid ? OP_NAMES[sExMe.opcode] || '?' : '·',
        wb: sMeWb.valid ? OP_NAMES[sMeWb.opcode] || '?' : '·',
        stall, flush: flushFetch,
      });
      if (this.trace.length > 200) this.trace.shift();
    }
    return !this.halted;
  }

  alu(op, a, b) {
    const z = (v) => ({ z: (v & 0xff) === 0, n: (v & 0x80) !== 0 });
    switch (op) {
      case OPS.ADD: {
        const v = (a + b) & 0xff;
        return { value: v, flags: { ...z(v), c: a + b > 0xff } };
      }
      case OPS.SUB: case OPS.CMP: {
        const v = (a - b) & 0xff;
        return { value: v, flags: { ...z(v), c: a < b } };
      }
      case OPS.AND: { const v = (a & b) & 0xff; return { value: v, flags: z(v) }; }
      case OPS.OR: { const v = (a | b) & 0xff; return { value: v, flags: z(v) }; }
      case OPS.XOR: { const v = (a ^ b) & 0xff; return { value: v, flags: z(v) }; }
      case OPS.INC: { const v = (a + 1) & 0xff; return { value: v, flags: z(v) }; }
      case OPS.DEC: { const v = (a - 1) & 0xff; return { value: v, flags: z(v) }; }
      case OPS.SHL: {
        const v = (a << 1) & 0xff;
        return { value: v, flags: { ...z(v), c: (a & 0x80) !== 0 } };
      }
      case OPS.SHR: {
        const v = (a >>> 1) & 0xff;
        return { value: v, flags: { ...z(v), c: (a & 1) !== 0 } };
      }
      default: return { value: a, flags: null };
    }
  }

  /** run until HLT retires or cycle budget is spent */
  run({ maxCycles = 200_000 } = {}) {
    this.opts = this.opts || {};
    while (!this.halted && this.stats.cycles < maxCycles) {
      this.step();
    }
    if (!this.halted && this.stats.cycles >= maxCycles) {
      return { ok: false, problems: [`Run aborted: ${maxCycles}-cycle budget exhausted (infinite loop?).`] };
    }
    return { ok: true };
  }
}

/** Unpipelined architectural reference — the "truth" for tests. */
export function referenceRun(bytes, { inputs = {}, maxSteps = 100_000 } = {}) {
  const mem = new Uint8Array(0x10000);
  mem.set(bytes, 0);
  const regs = new Uint8Array(8);
  const flags = { z: false, n: false, c: false };
  const ports = [];
  let pc = 0, steps = 0, halted = false;
  const setFlags = (v, c = null) => { flags.z = (v & 0xff) === 0; flags.n = (v & 0x80) !== 0; if (c !== null) flags.c = c; };
  while (!halted && steps < maxSteps) {
    steps += 1;
    const op = mem[pc];
    if (SIZES[op] === 0) { halted = true; break; } // treat invalid as stop
    switch (op) {
      case OPS.NOP: pc += 1; break;
      case OPS.LDI: regs[mem[pc + 1] >> 4] = mem[pc + 2]; pc += 3; break;
      case OPS.LD: regs[mem[pc + 1]] = mem[(mem[pc + 2] << 8) | mem[pc + 3]]; pc += 4; break;
      case OPS.ST: mem[(mem[pc + 2] << 8) | mem[pc + 3]] = regs[mem[pc + 1]]; pc += 4; break;
      case OPS.ADD: { const rd = mem[pc + 1] >> 4, rs = mem[pc + 1] & 0xf, s = regs[rd] + regs[rs]; regs[rd] = s & 0xff; setFlags(regs[rd], s > 0xff); pc += 2; break; }
      case OPS.SUB: case OPS.CMP: { const rd = mem[pc + 1] >> 4, rs = mem[pc + 1] & 0xf, d = regs[rd] - regs[rs]; const v = d & 0xff; if (op === OPS.SUB) regs[rd] = v; setFlags(v, d < 0); pc += 2; break; }
      case OPS.AND: { const rd = mem[pc + 1] >> 4, rs = mem[pc + 1] & 0xf; regs[rd] &= regs[rs]; setFlags(regs[rd]); pc += 2; break; }
      case OPS.OR: { const rd = mem[pc + 1] >> 4, rs = mem[pc + 1] & 0xf; regs[rd] |= regs[rs]; setFlags(regs[rd]); pc += 2; break; }
      case OPS.XOR: { const rd = mem[pc + 1] >> 4, rs = mem[pc + 1] & 0xf; regs[rd] ^= regs[rs]; setFlags(regs[rd]); pc += 2; break; }
      case OPS.INC: { const rd = mem[pc + 1] >> 4; regs[rd] = (regs[rd] + 1) & 0xff; setFlags(regs[rd]); pc += 2; break; }
      case OPS.DEC: { const rd = mem[pc + 1] >> 4; regs[rd] = (regs[rd] - 1) & 0xff; setFlags(regs[rd]); pc += 2; break; }
      case OPS.SHL: { const rd = mem[pc + 1] >> 4; const c = (regs[rd] & 0x80) !== 0; regs[rd] = (regs[rd] << 1) & 0xff; setFlags(regs[rd], c); pc += 2; break; }
      case OPS.SHR: { const rd = mem[pc + 1] >> 4; const c = (regs[rd] & 1) !== 0; regs[rd] = (regs[rd] >>> 1) & 0xff; setFlags(regs[rd], c); pc += 2; break; }
      case OPS.JMP: pc = (mem[pc + 1] << 8) | mem[pc + 2]; break;
      case OPS.JZ: pc = flags.z ? (mem[pc + 1] << 8) | mem[pc + 2] : pc + 3; break;
      case OPS.JNZ: pc = !flags.z ? (mem[pc + 1] << 8) | mem[pc + 2] : pc + 3; break;
      case OPS.JN: pc = flags.n ? (mem[pc + 1] << 8) | mem[pc + 2] : pc + 3; break;
      case OPS.JC: pc = flags.c ? (mem[pc + 1] << 8) | mem[pc + 2] : pc + 3; break;
      case OPS.OUT: ports.push({ port: mem[pc + 1], value: regs[mem[pc + 2]] }); pc += 3; break;
      case OPS.IN: regs[mem[pc + 1]] = inputs[mem[pc + 2]] ?? 0; pc += 3; break;
      case OPS.HLT: halted = true; break;
      default: halted = true; break;
    }
  }
  return { regs: [...regs], flags: { ...flags }, ports, mem, halted, steps };
}

export function runCPU(bytes, opts = {}) {
  const cpu = new IL8({ program: bytes, inputs: opts.inputs || {} });
  cpu.opts = { trace: opts.trace ?? false };
  const run = cpu.run({ maxCycles: opts.maxCycles ?? 200_000 });
  const problems = [...cpu.problems, ...(run.problems || [])];
  return {
    ok: run.ok && problems.length === 0,
    problems,
    regs: [...cpu.regs],
    flags: { ...cpu.flags },
    mem: cpu.mem,
    ports: cpu.ports,
    halted: cpu.halted,
    stats: { ...cpu.stats },
    trace: cpu.trace,
    pc: cpu.pc,
  };
}
