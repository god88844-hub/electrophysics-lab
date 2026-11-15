// spice-export.js — convert a Chip Lab diagram into a SPICE deck.
// Useful for cross-checking against Ngspice/Xyce/LTspice. We export the
// netlist; we do NOT claim our v1 solver reproduces every SPICE model.

import { getComponent } from '../../core/registry.js';

export function toSpiceDeck(diagram, { analysis = 'tran', tstop = '1m', dt = '1u', fstart = 10, fstop = '10meg' } = {}) {
  const lines = [`* Invention Lab export: ${diagram.name}`, '* Generated deck — verify against Ngspice before relying on it.', ''];
  const nodeNames = new Map(); // "block/port" -> spice node name
  // union-find nets (same algorithm as engine.buildNetlist, kept independent
  // so the exporter cannot inherit engine bugs)
  const parent = new Map();
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  for (const b of diagram.blocks) {
    const def = getComponent(b.type);
    if (!def?.chip) continue;
    for (const port of def.ports(b.params)) parent.set(`${b.id}/${port.id}`, `${b.id}/${port.id}`);
  }
  for (const w of diagram.wires) {
    if (parent.has(`${w.from.block}/${w.from.port}`) && parent.has(`${w.to.block}/${w.to.port}`)) {
      union(`${w.from.block}/${w.from.port}`, `${w.to.block}/${w.to.port}`);
    }
  }
  let n = 0;
  const netName = (key) => {
    const r = find(key);
    if (!nodeNames.has(r)) {
      // ground check
      n += 1;
      nodeNames.set(r, `n${n}`);
    }
    return nodeNames.get(r);
  };
  // ground nets first
  for (const b of diagram.blocks) {
    const def = getComponent(b.type);
    if (def?.chip?.kind === 'gnd') nodeNames.set(find(`${b.id}/g`), '0');
  }
  for (const b of diagram.blocks) {
    const def = getComponent(b.type);
    if (!def?.chip) continue;
    const P = b.params;
    const nd = (port) => netName(`${b.id}/${port}`);
    switch (def.chip.kind) {
      case 'res': lines.push(`R${b.id} ${nd('p')} ${nd('n')} ${P.r}`); break;
      case 'cap': lines.push(`C${b.id} ${nd('p')} ${nd('n')} ${P.c} IC=${P.vInit ?? 0}`); break;
      case 'ind': lines.push(`L${b.id} ${nd('p')} ${nd('n')} ${P.l} IC=${P.iInit ?? 0}`); break;
      case 'diode': lines.push(`D${b.id} ${nd('a')} ${nd('c')} DMOD`); break;
      case 'vsource': {
        if (P.mode === 'sine') lines.push(`V${b.id} ${nd('p')} ${nd('n')} SIN(${P.offset} ${P.amp} ${P.freq})`);
        else if (P.mode === 'pulse') lines.push(`V${b.id} ${nd('p')} ${nd('n')} PULSE(0 ${P.amp} 0 1n 1n ${P.duty / P.freq} ${1 / P.freq})`);
        else lines.push(`V${b.id} ${nd('p')} ${nd('n')} DC ${P.dc}`);
        break;
      }
      case 'isource': lines.push(`I${b.id} ${nd('p')} ${nd('n')} DC ${P.i}`); break;
      case 'nmos': lines.push(`M${b.id} ${nd('d')} ${nd('g')} ${nd('s')} ${nd('s')} NMOD W=1u L=1u`); break;
      case 'pmos': lines.push(`M${b.id} ${nd('s')} ${nd('g')} ${nd('d')} ${nd('d')} PMOD W=1u L=1u`); break;
      case 'opamp': lines.push(`E${b.id} ${nd('vout')} 0 ${nd('vp')} ${nd('vn')} ${P.gain}`); break;
      case 'voltmeter': lines.push(`* voltmeter ${b.id} probes node ${nd('p')}`); break;
      case 'ammeter': lines.push(`V${b.id} ${nd('p')} ${nd('n')} DC 0 * ammeter (0V source trick)`); break;
      default: break;
    }
  }
  lines.push('', '.model DMOD D(Is=1e-12 N=1)');
  lines.push('.model NMOD NMOS(Level=1 Vto=2 Kp=0.02)');
  lines.push('.model PMOD PMOS(Level=1 Vto=-2 Kp=0.02)');
  const sim = getComponent(diagram.blocks[0]?.type) ? '' : '';
  if (analysis === 'tran') lines.push(`.tran ${dt} ${tstop}`);
  else if (analysis === 'ac') lines.push(`.ac dec 10 ${fstart} ${fstop}`);
  else if (analysis === 'dc') lines.push('*.dc <sweep source> <from> <to> <step>');
  lines.push('.end');
  return lines.join('\n');
}
