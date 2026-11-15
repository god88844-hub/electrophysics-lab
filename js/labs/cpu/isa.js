// isa.js — IL-8 instruction set architecture.
// 8-bit RISC: 8 registers (R0..R7), 16-bit address space (64 KiB),
// byte-addressed memory, flags Z (zero), N (negative, bit7), C (carry/borrow).
//
// Encoding (little-endian 16-bit operands):
//   0x00 NOP                          1B
//   0x01 LDI Rd, imm8                 3B  [op][Rd<<4][imm]
//   0x02 LD  Rd, [addr16]             4B  [op][Rd][hi][lo]
//   0x03 ST  [addr16], Rs             4B  [op][Rs][hi][lo]
//   0x04 ADD Rd, Rs                   2B  [op][Rd<<4|Rs]
//   0x05 SUB Rd, Rs                   2B
//   0x06 AND Rd, Rs                   2B
//   0x07 OR  Rd, Rs                   2B
//   0x08 XOR Rd, Rs                   2B
//   0x09 INC Rd                       2B  [op][Rd<<4]
//   0x0A DEC Rd                       2B
//   0x0B CMP Rd, Rs                   2B  (flags only)
//   0x0C SHL Rd                       2B
//   0x0D SHR Rd                       2B
//   0x0E JMP addr16                   3B  [op][hi][lo]
//   0x0F JZ  addr16                   3B
//   0x10 JNZ addr16                   3B
//   0x11 JN  addr16                   3B
//   0x12 JC  addr16                   3B
//   0x13 OUT port, Rs                 3B  [op][port][Rs]
//   0x14 IN  Rd, port                 3B  [op][Rd][port]
//   0x15 HLT                          1B
//
// Microarchitecture: classic 5-stage in-order pipeline (IF ID EX ME WB),
// full forwarding, 1-cycle load-use stall, branches resolved in EX with
// not-taken prediction (2-cycle flush penalty when taken).

export const OPS = {
  NOP: 0x00, LDI: 0x01, LD: 0x02, ST: 0x03,
  ADD: 0x04, SUB: 0x05, AND: 0x06, OR: 0x07, XOR: 0x08,
  INC: 0x09, DEC: 0x0A, CMP: 0x0B, SHL: 0x0C, SHR: 0x0D,
  JMP: 0x0E, JZ: 0x0F, JNZ: 0x10, JN: 0x11, JC: 0x12,
  OUT: 0x13, IN: 0x14, HLT: 0x15,
};

export const OP_NAMES = Object.fromEntries(Object.entries(OPS).map(([k, v]) => [v, k]));

/** Instruction sizes in bytes (0 = invalid opcode). */
export const SIZES = (() => {
  const s = new Array(256).fill(0);
  const set = (names, n) => { for (const nm of names) s[OPS[nm]] = n; };
  set(['NOP', 'HLT'], 1);
  set(['LDI'], 3);
  set(['ADD', 'SUB', 'AND', 'OR', 'XOR', 'INC', 'DEC', 'CMP', 'SHL', 'SHR'], 2);
  set(['LD', 'ST'], 4);
  set(['JMP', 'JZ', 'JNZ', 'JN', 'JC', 'OUT', 'IN'], 3);
  return s;
})();

export const ALU_OPS = new Set([OPS.ADD, OPS.SUB, OPS.AND, OPS.OR, OPS.XOR]);
export const UNARY_OPS = new Set([OPS.INC, OPS.DEC, OPS.SHL, OPS.SHR]);
export const BRANCH_OPS = new Set([OPS.JMP, OPS.JZ, OPS.JNZ, OPS.JN, OPS.JC]);
