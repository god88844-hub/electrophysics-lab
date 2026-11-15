// examples/index.js — built-in example projects, built programmatically with
// the Diagram API (so they are always schema-valid) and registered into the
// global example registry for the Examples menu.

import { registerExample } from '../core/registry.js';
import { Diagram } from '../core/diagram.js';

// ensure all component libraries are registered
import '../labs/logic/components.js';
import '../labs/chip/components.js';
import '../labs/ai/lab.js';
import '../labs/quantum/components.js';

const ex = (id, label, lab, build, blurb = '') => registerExample({
  id, label, lab, blurb,
  getJSON: () => build().toJSON(),
});

// ---------------------------------------------------------------- logic ----
ex('logic-half-adder', 'Logic: half adder (binary)', 'logic', () => {
  const d = new Diagram({ name: 'Half adder', lab: 'logic', meta: { radix: 2 } });
  const a = d.addBlock('logic.IN', { params: { value: 1, name: 'A' }, x: 40, y: 40 });
  const b = d.addBlock('logic.IN', { params: { value: 1, name: 'B' }, x: 40, y: 140 });
  const xor = d.addBlock('logic.XOR', { x: 220, y: 40 });
  const and = d.addBlock('logic.AND', { x: 220, y: 150 });
  const ps = d.addBlock('logic.PROBE', { params: { name: 'SUM' }, x: 400, y: 40 });
  const pc = d.addBlock('logic.PROBE', { params: { name: 'CARRY' }, x: 400, y: 150 });
  d.connect(a.id, 'out', xor.id, 'a');
  d.connect(a.id, 'out', and.id, 'a');
  d.connect(b.id, 'out', xor.id, 'b');
  d.connect(b.id, 'out', and.id, 'b');
  d.connect(xor.id, 'y', ps.id, 'in');
  d.connect(and.id, 'y', pc.id, 'in');
  return d;
}, '1+1 = SUM 0, CARRY 1. Toggle the IN blocks and re-run.');

ex('logic-quaternary-adder', 'Logic: 2-digit quaternary adder', 'logic', () => {
  const d = new Diagram({ name: 'Quaternary ripple adder', lab: 'logic', meta: { radix: 4 } });
  const mk = (type, params, x, y) => d.addBlock(type, { params, x, y });
  const a0 = mk('logic.IN', { value: 2, name: 'A0' }, 20, 20);
  const b0 = mk('logic.IN', { value: 3, name: 'B0' }, 20, 80);
  const a1 = mk('logic.IN', { value: 3, name: 'A1' }, 20, 200);
  const b1 = mk('logic.IN', { value: 2, name: 'B1' }, 20, 260);
  const cin = mk('logic.CONST', { value: 0 }, 20, 340);
  const ad0 = mk('logic.ADDN', {}, 220, 40);
  const ad1 = mk('logic.ADDN', {}, 220, 220);
  const s0 = mk('logic.PROBE', { name: 'S0' }, 420, 20);
  const s1 = mk('logic.PROBE', { name: 'S1' }, 420, 200);
  const co = mk('logic.PROBE', { name: 'Cout' }, 420, 300);
  d.connect(a0.id, 'out', ad0.id, 'a');
  d.connect(b0.id, 'out', ad0.id, 'b');
  d.connect(cin.id, 'out', ad0.id, 'cin');
  d.connect(a1.id, 'out', ad1.id, 'a');
  d.connect(b1.id, 'out', ad1.id, 'b');
  d.connect(ad0.id, 'cout', ad1.id, 'cin');
  d.connect(ad0.id, 'sum', s0.id, 'in');
  d.connect(ad1.id, 'sum', s1.id, 'in');
  d.connect(ad1.id, 'cout', co.id, 'in');
  return d;
}, '23(base-4) + 32(base-4) = 121(base-4): S1=1, S0=2, Cout=1. Try other digits (0..3).');

// ----------------------------------------------------------------- chip ----
ex('chip-divider', 'Chip: resistive divider (DC)', 'chip', () => {
  const d = new Diagram({ name: 'Resistive divider', lab: 'chip', meta: { analysis: 'dc' } });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 10 }, x: 40, y: 120 });
  const r1 = d.addBlock('chip.RES', { params: { r: 1000 }, x: 200, y: 40 });
  const r2 = d.addBlock('chip.RES', { params: { r: 2000 }, x: 200, y: 200 });
  const gnd = d.addBlock('chip.GND', { x: 360, y: 280 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vout' }, x: 360, y: 120 });
  d.connect(src.id, 'p', r1.id, 'p');
  d.connect(r1.id, 'n', r2.id, 'p');
  d.connect(r2.id, 'n', gnd.id, 'g');
  d.connect(r1.id, 'n', vm.id, 'p');
  d.connect(src.id, 'n', gnd.id, 'g');
  return d;
}, '10 V across 1k+2k -> vout = 6.667 V. MC validation: R tolerances ±5%.');

ex('chip-rc-lowpass', 'Chip: RC low-pass filter (AC + transient)', 'chip', () => {
  const d = new Diagram({ name: 'RC low-pass', lab: 'chip', meta: { analysis: 'ac', fstart: 50, fstop: 50000 } });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'ac', amp: 1, dc: 0 }, x: 40, y: 120 });
  const r = d.addBlock('chip.RES', { params: { r: 1000 }, x: 200, y: 40 });
  const c = d.addBlock('chip.CAP', { params: { c: 100e-9 }, x: 320, y: 200 });
  const gnd = d.addBlock('chip.GND', { x: 480, y: 280 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vc' }, x: 480, y: 120 });
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', c.id, 'p');
  d.connect(c.id, 'n', gnd.id, 'g');
  d.connect(r.id, 'n', vm.id, 'p');
  d.connect(src.id, 'n', gnd.id, 'g');
  return d;
}, 'Cutoff 1/(2πRC) ≈ 1.59 kHz — the validation check finds the −3 dB point and compares.');

ex('chip-cmos-inverter', 'Chip: CMOS inverter (VTC sweep)', 'chip', () => {
  const d = new Diagram({ name: 'CMOS inverter', lab: 'chip', meta: { analysis: 'dc' } });
  const vdd = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 5 }, x: 20, y: 20 });
  const vin = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 0 }, x: 20, y: 280 });
  const pm = d.addBlock('chip.PMOS', { params: { k: 0.02, vth: -2 }, x: 240, y: 40 });
  const nm = d.addBlock('chip.NMOS', { params: { k: 0.02, vth: 2 }, x: 240, y: 180 });
  const gnd = d.addBlock('chip.GND', { x: 460, y: 320 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vout' }, x: 460, y: 110 });
  d.connect(vdd.id, 'p', pm.id, 's');
  d.connect(vdd.id, 'n', gnd.id, 'g');
  d.connect(pm.id, 'd', nm.id, 'd');
  d.connect(nm.id, 's', gnd.id, 'g');
  d.connect(pm.id, 'd', vm.id, 'p');
  d.connect(nm.id, 'g', vin.id, 'p');
  d.connect(pm.id, 'g', vin.id, 'p');
  d.connect(vin.id, 'n', gnd.id, 'g');
  return d;
}, 'Square-law level-1 MOSFETs. Sweep vin 0→5 V with a DC sweep to see the transfer curve.');

// ------------------------------------------------------------------ cpu ----
const FIB_SRC = `; Fibonacci: first 10 terms to OUT port 0
        LDI R3, 10
        LDI R1, 0         ; a
        LDI R2, 1         ; b
loop:   OUT 0, R1
        LDI R4, 0
        ADD R4, R1
        ADD R4, R2        ; R4 = a+b
        XOR R1, R2        ; swap R1,R2
        XOR R2, R1
        XOR R1, R2
        XOR R2, R4        ; swap R2,R4
        XOR R4, R2
        XOR R2, R4
        DEC R3
        JNZ loop
        HLT`;

ex('cpu-fibonacci', 'CPU: Fibonacci (pipeline demo)', 'cpu', () => {
  const d = new Diagram({ name: 'Fibonacci', lab: 'cpu', meta: { source: FIB_SRC } });
  return d;
}, '10 Fibonacci terms via OUT port 0; watch stalls/flushes in the pipeline stats.');

ex('cpu-hazard-demo', 'CPU: load-use hazard demo', 'cpu', () => {
  const d = new Diagram({
    name: 'Load-use hazard', lab: 'cpu',
    meta: { source: `; load-use hazard: ADD depends on LD immediately
        LDI R1, 42
        ST  [val], R1
        LD  R2, [val]
        ADD R3, R2      ; dependent on the load -> 1 stall
        OUT 0, R3
        HLT
val:    .byte 0` },
  });
  return d;
}, 'The hazard unit inserts exactly one bubble; forwarding from WB fixes the value.');

// ------------------------------------------------------------------- ai ----
ex('ai-matmul', 'AI: matmul precision comparison', 'ai', () => {
  const d = new Diagram({ name: 'Matmul precision', lab: 'ai', meta: { precision: 'int8', dims: '16x16x16', grid: 8, seed: 7 } });
  return d;
}, 'Same matmul in f64/f32/int8; validation checks each mode against its documented error bound.');

ex('ai-xor-mlp', 'AI: XOR MLP training', 'ai', () => {
  const d = new Diagram({ name: 'XOR MLP', lab: 'ai', meta: { precision: 'f64', seed: 42 } });
  return d;
}, 'Tiny 2-3-1 MLP trained on XOR with a deterministic seed; check the predictions table.');

// -------------------------------------------------------------- quantum ----
ex('quantum-bell', 'Quantum: Bell state (entanglement)', 'quantum', () => {
  const d = new Diagram({ name: 'Bell state', lab: 'quantum', meta: { d: 2, shots: 2000, seed: 42 } });
  const w0 = d.addBlock('quantum.WIRE', { params: { name: 'q0' }, x: 20, y: 40 });
  const w1 = d.addBlock('quantum.WIRE', { params: { name: 'q1' }, x: 20, y: 140 });
  const h = d.addBlock('quantum.H', { x: 160, y: 40 });
  const cn = d.addBlock('quantum.CNOT', { x: 300, y: 40 });
  const m0 = d.addBlock('quantum.MEASURE', { x: 460, y: 40 });
  const m1 = d.addBlock('quantum.MEASURE', { x: 460, y: 140 });
  d.connect(w0.id, 'out', h.id, 'qin');
  d.connect(h.id, 'qout', cn.id, 'cin');
  d.connect(w1.id, 'out', cn.id, 'tin');
  d.connect(cn.id, 'cout', m0.id, 'in');
  d.connect(cn.id, 'tout', m1.id, 'in');
  return d;
}, 'H + CNOT: only |00> and |11> occur (~50/50). Entanglement witness in the report.');

ex('quantum-ghz', 'Quantum: GHZ-3', 'quantum', () => {
  const d = new Diagram({ name: 'GHZ-3', lab: 'quantum', meta: { d: 2, shots: 2000, seed: 11 } });
  const wires = [0, 1, 2].map((q) => d.addBlock('quantum.WIRE', { params: { name: 'q' + q }, x: 20, y: 40 + q * 90 }));
  const h = d.addBlock('quantum.H', { x: 160, y: 40 });
  const c1 = d.addBlock('quantum.CNOT', { x: 300, y: 40 });
  const c2 = d.addBlock('quantum.CNOT', { x: 440, y: 40 });
  d.connect(wires[0].id, 'out', h.id, 'qin');
  d.connect(h.id, 'qout', c1.id, 'cin');
  d.connect(wires[1].id, 'out', c1.id, 'tin');
  d.connect(c1.id, 'cout', c2.id, 'cin');
  d.connect(wires[2].id, 'out', c2.id, 'tin');
  [0, 1, 2].forEach((q) => {
    const m = d.addBlock('quantum.MEASURE', { x: 580, y: 40 + q * 90 });
    d.connect([h, c1, c2][q].id, ['qout', 'cout', 'cout'][q], m.id, 'in');
  });
  return d;
}, '(|000> + |111>)/√2 — three-way entanglement.');

ex('quantum-qutrit-fourier', 'Quantum: qutrit Fourier (d=3)', 'quantum', () => {
  const d = new Diagram({ name: 'Qutrit Fourier', lab: 'quantum', meta: { d: 3, shots: 3000, seed: 5 } });
  const w = d.addBlock('quantum.WIRE', { params: { name: 'q0' }, x: 20, y: 60 });
  const sh = d.addBlock('quantum.SHIFT', { x: 160, y: 60 });
  const f = d.addBlock('quantum.FOURIER', { x: 320, y: 60 });
  const m = d.addBlock('quantum.MEASURE', { x: 480, y: 60 });
  d.connect(w.id, 'out', sh.id, 'qin');
  d.connect(sh.id, 'qout', f.id, 'qin');
  d.connect(f.id, 'qout', m.id, 'in');
  return d;
}, 'SHIFT|0> = |1>; F3|1> is uniform over {0,1,2} — three outcomes near 1/3 each.');
