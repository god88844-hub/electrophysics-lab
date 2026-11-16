// rv32i.js — bounded unprivileged RV32I 2.1 instruction-level interpreter.
//
// Reference: https://docs.riscv.org/reference/isa/v20260120/unpriv/rv32.html
// This models a single integer hart, little-endian flat RAM and explicit
// traps. It is NOT a cycle-accurate CPU, an OS, a privileged implementation,
// a certified ISA core, a transistor model or physical chip validation.
//
// The simulator deliberately does NOT turn unknown opcodes or timeouts into
// successes; ECALL/EBREAK are stop/trap events, not fabricated OS behavior.
export const ISA = 'RV32I 2.1';
export const DEFAULT_MEMORY_BYTES = 65536;
const MAX_MEMORY = 16 * 1024 * 1024;
const sign = (v, bits) => (v << (32 - bits)) >> (32 - bits);
const u32 = x => x >>> 0;
const validInteger = x => Number.isSafeInteger(x);
const hex = x => '0x' + u32(x).toString(16).padStart(8, '0');

export function parseRV32Words(source, { maxWords = 16384 } = {}) {
  if (typeof source !== 'string' || source.length > maxWords * 40) {
    throw Error('RV32I source must be a bounded text file of encoded 32-bit hexadecimal instructions');
  }
  const words = [];
  for (const [index, raw] of source.split(/\r?\n/).entries()) {
    const line = raw.replace(/(#|;|\/\/).*$/, '').trim();
    if (!line) continue;
    if (!/^(?:0x)?[0-9a-fA-F]{8}$/.test(line)) {
      throw Error('RV32I source line ' + (index + 1) + ' must contain exactly one 8-hex-digit machine word');
    }
    if (words.length >= maxWords) throw Error('RV32I source exceeds instruction limit');
    words.push(Number.parseInt(line.replace(/^0x/i, ''), 16) >>> 0);
  }
  if (!words.length) throw Error('RV32I program is empty');
  return new Uint32Array(words);
}

export function rv32WordsToBytes(words) {
  if (!(words instanceof Uint32Array) && !Array.isArray(words)) {
    throw Error('RV32I program requires Uint32Array words or plain integer array');
  }
  if (words.length > 1_000_000) throw Error('RV32I program exceeds size limit');
  const bytes = new Uint8Array(words.length * 4);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!validInteger(w) || w < 0 || w > 0xffffffff) throw Error('Invalid 32-bit machine word at index ' + i);
    const n = u32(w);
    for (let j = 0; j < 4; j++) bytes[i * 4 + j] = (n >>> (j * 8)) & 0xff;
  }
  return bytes;
}
function programBytes(source) {
  if (typeof source === 'string') return rv32WordsToBytes(parseRV32Words(source));
  if (source instanceof Uint8Array) return new Uint8Array(source);
  return rv32WordsToBytes(source);
}
export class RV32I {
  constructor({ program, memoryBytes = DEFAULT_MEMORY_BYTES, base = 0, startPc = base, maxTrace = 256 } = {}) {
    if (!validInteger(memoryBytes) || memoryBytes < 64 || memoryBytes > MAX_MEMORY) throw Error('Invalid RV32I memory size');
    if (!validInteger(base) || base < 0 || base > 0xffffffff ||
        !validInteger(startPc) || startPc < 0 || startPc > 0xffffffff) throw Error('Invalid RV32I address');
    if (!validInteger(maxTrace) || maxTrace < 0 || maxTrace > 10000) throw Error('Invalid trace cap');
    if ((base % 4) || (startPc % 4)) throw Error('RV32I instruction base and entry point must be 4-byte aligned');
    this.base = u32(base); this.pc = u32(startPc);
    this.mem = new Uint8Array(memoryBytes);
    this.regs = new Int32Array(32);
    this.traces = []; this.maxTrace = maxTrace;
    this.retired = 0; this.halted = false; this.stopReason = null; this.trap = null;
    this.writes = [];
    const src = programBytes(program);
    if (src.length > memoryBytes) throw Error('RV32I program exceeds RAM');
    this.mem.set(src);
    this.programLength = src.length;
  }
  _offset(addr, size, align = 1) {
    const at = u32(addr), start = (at - this.base) >>> 0;
    if (size > 1 && (at % align) !== 0) throw Error('misaligned ' + size + '-byte access at ' + hex(at));
    if (start > this.mem.length - size) throw Error('out-of-range memory access at ' + hex(at));
    return start;
  }
  _load(addr, size, signed = false) {
    const i = this._offset(addr, size, size);
    let value = 0;
    for (let j = 0; j < size; j++) value = (value | (this.mem[i + j] << (j * 8)));
    return signed && size < 4 ? sign(value, size * 8) : (value | 0);
  }
  _store(addr, size, value) {
    const i = this._offset(addr, size, size);
    for (let j = 0; j < size; j++) this.mem[i + j] = (value >>> (j * 8)) & 255;
    if (this.writes.length < 4096) this.writes.push({ address: u32(addr), size, value: u32(value) & (size === 4 ? 0xffffffff : (1 << (size * 8)) - 1) });
  }
  _stop(reason, detail, word = null) {
    this.halted = true; this.stopReason = reason;
    this.trap = { pc: u32(this.pc), instruction: word === null ? null : u32(word), cause: reason, detail };
    return this.trap;
  }
  step() {
    if (this.halted) throw Error('RV32I execution already stopped: ' + this.stopReason);
    const pc = this.pc;
    if (pc & 3) return this._stop('instruction-misaligned', 'PC not aligned to four bytes');
    let word;
    try { word = u32(this._load(pc, 4)); }
    catch (error) { return this._stop('instruction-access-fault', error.message); }
    if ((word & 3) !== 3) return this._stop('illegal-instruction', 'compressed instruction unsupported in RV32I', word);
    const opcode = word & 127, rd = (word >>> 7) & 31, f3 = (word >>> 12) & 7,
      rs1 = (word >>> 15) & 31, rs2 = (word >>> 20) & 31, f7 = word >>> 25;
    const a = this.regs[rs1] | 0, b = this.regs[rs2] | 0;
    const I = sign(word >>> 20, 12);
    const S = sign(((word >>> 25) << 5) | ((word >>> 7) & 31), 12);
    const B = sign(((word >>> 31) << 12) | (((word >>> 7) & 1) << 11) |
      (((word >>> 25) & 63) << 5) | (((word >>> 8) & 15) << 1), 13);
    const U = word & 0xfffff000;
    const J = sign(((word >>> 31) << 20) | (((word >>> 12) & 255) << 12) |
      (((word >>> 20) & 1) << 11) | (((word >>> 21) & 1023) << 1), 21);
    let next = u32(pc + 4), result = null, name = '', hasResult = false, store = null;
    const illegal = message => { throw Error('illegal instruction ' + hex(word) + ': ' + message); };
    try {
      switch (opcode) {
        case 0x37: name = 'LUI'; result = U; hasResult = true; break;
        case 0x17: name = 'AUIPC'; result = u32(pc + U); hasResult = true; break;
        case 0x6f:
          name = 'JAL'; result = u32(pc + 4); hasResult = true; next = u32(pc + J); break;
        case 0x67:
          if (f3 !== 0) illegal('JALR funct3');
          name = 'JALR'; result = u32(pc + 4); hasResult = true;
          next = u32(a + I) & ~1; break;
        case 0x63: {
          name = ['BEQ', 'BNE', null, null, 'BLT', 'BGE', 'BLTU', 'BGEU'][f3];
          if (!name) illegal('branch funct3');
          const taken = [a === b, a !== b, false, false,
            a < b, a >= b, u32(a) < u32(b), u32(a) >= u32(b)][f3];
          if (taken) next = u32(pc + B);
          break;
        }
        case 0x03: {
          const types = { 0: ['LB', 1, true], 1: ['LH', 2, true], 2: ['LW', 4, true],
            4: ['LBU', 1, false], 5: ['LHU', 2, false] };
          const type = types[f3];
          if (!type) illegal('load funct3');
          name = type[0];
          result = this._load(u32(a + I), type[1], type[2]);
          hasResult = true;
          break;
        }
        case 0x23: {
          const types = {0:['SB',1],1:['SH',2],2:['SW',4]};
          const type = types[f3];
          if (!type) illegal('store funct3');
          name = type[0]; store = { address:u32(a + S),size:type[1],value:b };
          this._offset(store.address,store.size,store.size);
          break;
        }
        case 0x13: {
          hasResult = true;
          switch (f3) {
            case 0: name = 'ADDI'; result = (a + I) | 0; break;
            case 2: name = 'SLTI'; result = a < I ? 1 : 0; break;
            case 3: name = 'SLTIU'; result = u32(a) < u32(I) ? 1 : 0; break;
            case 4: name = 'XORI'; result = a ^ I; break;
            case 6: name = 'ORI'; result = a | I; break;
            case 7: name = 'ANDI'; result = a & I; break;
            case 1:
              if (f7 !== 0) illegal('SLLI upper immediate bits');
              name = 'SLLI'; result = a << rs2; break;
            case 5:
              if (f7 === 0) { name = 'SRLI'; result = a >>> rs2; }
              else if (f7 === 0x20) { name = 'SRAI'; result = a >> rs2; }
              else illegal('shift immediate upper bits');
              break;
            default: illegal('OP-IMM funct3');
          }
          break;
        }
        case 0x33: {
          hasResult = true;
          if (f3 === 0 && f7 === 0x20) { name = 'SUB'; result = a - b; break; }
          if (f3 === 5 && f7 === 0x20) { name = 'SRA'; result = a >> (b & 31); break; }
          if (f7 !== 0) illegal('non-RV32I register arithmetic encoding');
          switch (f3) {
            case 0: name = 'ADD'; result = a + b; break;
            case 1: name = 'SLL'; result = a << (b & 31); break;
            case 2: name = 'SLT'; result = a < b ? 1 : 0; break;
            case 3: name = 'SLTU'; result = u32(a) < u32(b) ? 1 : 0; break;
            case 4: name = 'XOR'; result = a ^ b; break;
            case 5: name = 'SRL'; result = a >>> (b & 31); break;
            case 6: name = 'OR'; result = a | b; break;
            case 7: name = 'AND'; result = a & b; break;
            default: illegal('OP funct3');
          }
          break;
        }
        case 0x0f:
          if (f3 !== 0) illegal('FENCE.I is a separate ISA extension, not RV32I base');
          name = 'FENCE'; // single-hart RAM-only ordering; no external devices.
          break;
        case 0x73:
          if (word === 0x00100073) return this._stop('ebreak', 'architectural breakpoint trap', word);
          if (word === 0x00000073) return this._stop('ecall', 'environment call requires a separate operating environment', word);
          illegal('unsupported system/CSR encoding');
          break;
        default: illegal('unknown opcode');
      }
      if (next & 3) throw Error('instruction address misaligned: target ' + hex(next));
      // All operations are committed atomically after validation.
      if (store) this._store(store.address,store.size,store.value);
      if (hasResult && rd !== 0) this.regs[rd] = result | 0;
      this.regs[0] = 0; this.pc = u32(next); this.retired++;
      if (this.maxTrace) {
        this.traces.push({ pc, word, mnemonic:name, rd:hasResult?rd:null,
          value:hasResult?u32(result):null, nextPc:this.pc });
        if (this.traces.length > this.maxTrace) this.traces.shift();
      }
      return null;
    } catch (error) {
      return this._stop(/misaligned/i.test(error.message) ? 'misaligned-access' :
        /out-of-range/i.test(error.message) ? 'memory-access-fault' :
        'illegal-instruction',error.message,word);
    }
  }
  run({ maxSteps = 20000 } = {}) {
    if (!validInteger(maxSteps) || maxSteps < 1 || maxSteps > 1_000_000) throw Error('Invalid RV32I execution budget');
    let budget = maxSteps;
    while (!this.halted && budget-- > 0) this.step();
    if (!this.halted) this._stop('step-limit', 'Execution budget exhausted before an explicit stop');
    return {
      ok:this.stopReason==='ebreak', status:this.stopReason==='ebreak'?'breakpoint-reached':'stopped',
      stopReason:this.stopReason, pc:u32(this.pc), retired:this.retired,
      regs:Array.from(this.regs, u32), traces:this.traces.map(x=>({...x})),
      writes:this.writes.map(x=>({...x})), trap:{...this.trap},
      specification:'RV32I 2.1', model:'single-hart-functional',
      timing:'not-modelled', physicalValidation:'none', realWorldBuildSuccessPercent:null,
      note:'EBREAK reaching a trap is a test stopping convention, not an OS exit, manufacturing result, or ISA certification.',
    };
  }
}
export function runRV32I(program, opts = {}) {
  const { maxSteps=20000, ...options } = opts;
  return new RV32I({program,...options}).run({maxSteps});
}
