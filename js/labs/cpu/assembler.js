// assembler.js — two-pass assembler for the IL-8 ISA.
// Supports labels (code and data addresses), decimal/hex/char literals,
// `.byte n, n, ...` data directives, `;` comments.

import { OPS, SIZES } from './isa.js';

export function assemble(source) {
  const errors = [];
  const lines = String(source).split(/\r?\n/);

  const parseNum = (tok) => {
    tok = tok.trim();
    if (/^0x[0-9a-f]+$/i.test(tok)) return parseInt(tok, 16);
    if (/^0b[01]+$/i.test(tok)) return parseInt(tok.slice(2), 2);
    if (/^'.'$/.test(tok)) return tok.charCodeAt(1);
    if (/^-?\d+$/.test(tok)) return parseInt(tok, 10);
    return null;
  };

  // pass 1: collect labels and sizes
  const items = [];      // { line, label?, op?, args, addr }
  const labels = new Map();
  let addr = 0;
  lines.forEach((raw, i) => {
    const line = raw.replace(/;.*$/, '').trim();
    if (!line) return;
    let rest = line;
    let label = null;
    const lm = rest.match(/^([A-Za-z_][\w.]*):\s*/);
    if (lm) { label = lm[1]; rest = rest.slice(lm[0].length); }
    if (!rest) {
      if (label) labels.set(label, addr);
      return;
    }
    const parts = rest.match(/^(\.?[A-Za-z_][\w.]*)\s*(.*)$/);
    if (!parts) { errors.push(`line ${i + 1}: cannot parse "${line}"`); return; }
    const op = parts[1].toUpperCase();
    const args = parts[2] ? splitArgs(parts[2]) : [];
    if (label) labels.set(label, addr);
    if (op === '.BYTE' || op === '.DB') {
      items.push({ line: i + 1, label, directive: 'byte', args, addr });
      addr += args.length;
      return;
    }
    if (op === '.ORG') {
      const v = parseNum(args[0] ?? '');
      if (v === null || v < 0 || v > 0xffff) { errors.push(`line ${i + 1}: bad .org`); return; }
      addr = v;
      return;
    }
    if (!(op in OPS)) { errors.push(`line ${i + 1}: unknown instruction "${op}"`); return; }
    const size = SIZES[OPS[op]];
    items.push({ line: i + 1, label, op, args, addr });
    addr += size;
  });

  const resolve = (tok, okRange) => {
    tok = tok.trim();
    if (labels.has(tok)) return labels.get(tok);
    const v = parseNum(tok);
    if (v !== null && (!okRange || (v >= okRange[0] && v <= okRange[1]))) return v;
    return null;
  };
  const regTok = (tok) => {
    const m = tok.trim().match(/^[Rr]([0-7])$/);
    return m ? parseInt(m[1], 10) : null;
  };

  // pass 2: encode
  const bytes = new Uint8Array(0x10000);
  let maxAddr = 0;
  const emit = (a, ...vals) => { for (let i = 0; i < vals.length; i++) bytes[a + i] = vals[i] & 0xff; maxAddr = Math.max(maxAddr, a + vals.length); };

  for (const it of items) {
    try {
      if (it.directive === 'byte') {
        const vals = it.args.map((t) => {
          const v = resolve(t);
          if (v === null || v < 0 || v > 255) throw new Error(`bad byte value "${t}"`);
          return v;
        });
        emit(it.addr, ...vals);
        continue;
      }
      const op = OPS[it.op];
      const a = it.args;
      switch (it.op) {
        case 'NOP': emit(it.addr, op); break;
        case 'HLT': emit(it.addr, op); break;
        case 'LDI': {
          const rd = regTok(a[0] ?? ''), imm = resolve(a[1] ?? '', [0, 255]);
          if (rd === null || imm === null) throw new Error('LDI Rd, imm8');
          emit(it.addr, op, rd << 4, imm);
          break;
        }
        case 'LD': case 'ST': {
          if (it.op === 'LD') {
            const rd = regTok(a[0] ?? '');
            const addrV = resolve((a[1] ?? '').replace(/^\[|\]$/g, ''), [0, 0xffff]);
            if (rd === null || addrV === null) throw new Error('LD Rd, [addr]');
            emit(it.addr, op, rd, (addrV >> 8) & 0xff, addrV & 0xff);
          } else {
            const rs = regTok(a[1] ?? '');
            const addrV = resolve((a[0] ?? '').replace(/^\[|\]$/g, ''), [0, 0xffff]);
            if (rs === null || addrV === null) throw new Error('ST [addr], Rs');
            emit(it.addr, op, rs, (addrV >> 8) & 0xff, addrV & 0xff);
          }
          break;
        }
        case 'ADD': case 'SUB': case 'AND': case 'OR': case 'XOR': case 'CMP': {
          const rd = regTok(a[0] ?? ''), rs = regTok(a[1] ?? '');
          if (rd === null || rs === null) throw new Error(`${it.op} Rd, Rs`);
          emit(it.addr, op, (rd << 4) | rs);
          break;
        }
        case 'INC': case 'DEC': case 'SHL': case 'SHR': {
          const rd = regTok(a[0] ?? '');
          if (rd === null) throw new Error(`${it.op} Rd`);
          emit(it.addr, op, rd << 4);
          break;
        }
        case 'JMP': case 'JZ': case 'JNZ': case 'JN': case 'JC': {
          const t = resolve(a[0] ?? '', [0, 0xffff]);
          if (t === null) throw new Error(`${it.op} target`);
          emit(it.addr, op, (t >> 8) & 0xff, t & 0xff);
          break;
        }
        case 'OUT': {
          const port = resolve(a[0] ?? '', [0, 255]);
          const rs = regTok(a[1] ?? '');
          if (port === null || rs === null) throw new Error('OUT port, Rs');
          emit(it.addr, op, port, rs);
          break;
        }
        case 'IN': {
          const rd = regTok(a[0] ?? '');
          const port = resolve(a[1] ?? '', [0, 255]);
          if (rd === null || port === null) throw new Error('IN Rd, port');
          emit(it.addr, op, rd, port);
          break;
        }
        default: throw new Error(`unhandled ${it.op}`);
      }
    } catch (e) {
      errors.push(`line ${it.line}: ${e.message}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    bytes: bytes.slice(0, Math.max(maxAddr, 1)),
    labels: Object.fromEntries(labels),
    size: maxAddr,
  };
}

function splitArgs(s) {
  // split on commas not inside brackets/quotes
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Disassemble a byte range back to IL-8 text (for the UI). */
export function disassemble(bytes, startAddr = 0) {
  const lines = [];
  const NAMES = Object.fromEntries(Object.entries(OPS).map(([k, v]) => [v, k]));
  let a = 0;
  while (a < bytes.length) {
    const op = bytes[a];
    const name = NAMES[op];
    if (!name || SIZES[op] === 0) { lines.push(`0x${(startAddr + a).toString(16).padStart(4, '0')}  .byte 0x${op.toString(16).padStart(2, '0')}`); a += 1; continue; }
    const n = SIZES[op];
    let text = name;
    if (name === 'LDI') text = `LDI R${bytes[a + 1] >> 4}, 0x${bytes[a + 2].toString(16)}`;
    else if (name === 'LD') text = `LD R${bytes[a + 1]}, [0x${((bytes[a + 2] << 8) | bytes[a + 3]).toString(16)}]`;
    else if (name === 'ST') text = `ST [0x${((bytes[a + 2] << 8) | bytes[a + 3]).toString(16)}], R${bytes[a + 1]}`;
    else if (['ADD', 'SUB', 'AND', 'OR', 'XOR', 'CMP'].includes(name)) text = `${name} R${bytes[a + 1] >> 4}, R${bytes[a + 1] & 0xf}`;
    else if (['INC', 'DEC', 'SHL', 'SHR'].includes(name)) text = `${name} R${bytes[a + 1] >> 4}`;
    else if (['JMP', 'JZ', 'JNZ', 'JN', 'JC'].includes(name)) text = `${name} 0x${((bytes[a + 1] << 8) | bytes[a + 2]).toString(16)}`;
    else if (name === 'OUT') text = `OUT ${bytes[a + 1]}, R${bytes[a + 2]}`;
    else if (name === 'IN') text = `IN R${bytes[a + 1]}, ${bytes[a + 2]}`;
    lines.push(`0x${(startAddr + a).toString(16).padStart(4, '0')}  ${text}`);
    a += n;
  }
  return lines.join('\n');
}
