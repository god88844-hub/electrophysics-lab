// quantum.test.mjs — qudit engine, gates, algorithms, lab integration.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { QuditCircuit, checkUnitary, binomialSE, c } from '../js/labs/quantum/qudit.js';
import { H, X, CNOT, SHIFT, FOURIER, SUM, SWAP, PHASEK } from '../js/labs/quantum/gates.js';
import { bell, ghz, deutschJozsa, qft } from '../js/labs/quantum/algorithms.js';
import '../js/labs/quantum/components.js';
import { Diagram } from '../js/core/diagram.js';
import { quantumLab } from '../js/labs/quantum/lab.js';
import { mulberry32 } from '../js/core/validation.js';

const approx = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≈ ${b}`);

test('quantum: H|0> = |+> exactly', () => {
  const qc = new QuditCircuit(1, 2);
  qc.apply1(0, H);
  approx(qc.re[0], Math.SQRT1_2);
  approx(qc.re[1], Math.SQRT1_2);
  approx(qc.im[0], 0);
});

test('quantum: X|0> = |1>', () => {
  const qc = new QuditCircuit(1, 2);
  qc.apply1(0, X);
  approx(qc.re[1], 1);
});

test('quantum: Bell state amplitudes and normalization', () => {
  const qc = new QuditCircuit(2, 2);
  qc.apply1(0, H).apply2(0, 1, CNOT());
  const p = qc.probs();
  approx(p[0], 0.5); // |00>
  approx(p[3], 0.5); // |11>
  approx(p[1], 0); approx(p[2], 0);
});

test('quantum: qubit ordering convention — q0 is most significant', () => {
  const qc = new QuditCircuit(2, 2);
  qc.apply1(1, X); // X on q1 -> |01> (index 1)
  approx(qc.probs()[1], 1);
  const qc2 = new QuditCircuit(2, 2);
  qc2.apply1(0, X); // X on q0 -> |10> (index 2)
  approx(qc2.probs()[2], 1);
});

test('quantum: non-unitary matrices are refused', () => {
  const qc = new QuditCircuit(1, 2);
  const bad = [[c(2), c(0)], [c(0), c(1)]];
  assert.throws(() => qc.apply1(0, bad), /not unitary/);
});

test('quantum: sampled Bell counts within 4σ and only 00/11 occur', () => {
  const res = bell({ shots: 4000, rng: mulberry32(123) });
  const total = Object.values(res.counts).reduce((a, b) => a + b, 0);
  assert.equal(total, 4000);
  assert.equal(res.counts['01'] || 0, 0);
  assert.equal(res.counts['10'] || 0, 0);
  for (const k of ['00', '11']) {
    const p = res.counts[k] / 4000;
    const se = binomialSE(0.5, 4000);
    assert.ok(Math.abs(p - 0.5) <= 4 * se, `${k}: ${p} vs 0.5 ± ${4 * se}`);
  }
});

test('quantum: GHZ-3 only all-0 / all-1', () => {
  const res = ghz(3, { shots: 2000, rng: mulberry32(7) });
  for (const k of Object.keys(res.counts)) {
    assert.ok(k === '000' || k === '111', `unexpected outcome ${k}`);
  }
  assert.equal(res.counts['000'] + res.counts['111'], 2000);
});

test('quantum: Deutsch-Jozsa distinguishes constant vs balanced in one query', () => {
  const c0 = deutschJozsa({ n: 2, type: 'constant', shots: 64, rng: mulberry32(1) });
  assert.equal(c0.verdict, 'constant');
  const b = deutschJozsa({ n: 2, type: 'balanced', shots: 64, rng: mulberry32(1) });
  assert.equal(b.verdict, 'balanced');
  const c1 = deutschJozsa({ n: 3, type: 'constant', shots: 64, rng: mulberry32(2) });
  assert.equal(c1.verdict, 'constant');
  const b3 = deutschJozsa({ n: 3, type: 'balanced', shots: 64, rng: mulberry32(2) });
  assert.equal(b3.verdict, 'balanced');
});

test('quantum: QFT|1> matches direct DFT of basis state', () => {
  const n = 3, x = 1, N = 1 << n;
  const qc = qft(n, { x });
  // direct DFT: F[x][k] = e^{2πi·x·k/N}/√N ; amplitudes ordered k = 0..N-1
  // our index convention: q0 most significant, i.e. amplitude index i
  // corresponds to k where i's bits are bit-reversed relative to k.
  // The circuit ends with SWAPs that undo bit reversal, so amplitude[i]
  // should equal e^{2πi x i/N}/√N.
  for (let i = 0; i < N; i++) {
    const theta = (2 * Math.PI * x * i) / N;
    approx(qc.re[i], Math.cos(theta) / Math.sqrt(N), 1e-9);
    approx(qc.im[i], Math.sin(theta) / Math.sqrt(N), 1e-9);
  }
});

test('quantum: qutrit SHIFT and FOURIER behave per definitions', () => {
  const qc = new QuditCircuit(1, 3);
  qc.apply1(0, SHIFT(3)); // |0> -> |1>
  approx(qc.probs()[1], 1);
  const qc2 = new QuditCircuit(1, 3);
  qc2.apply1(0, FOURIER(3)); // F|0> = uniform 1/√3
  for (let i = 0; i < 3; i++) approx(qc2.probs()[i], 1 / 3, 1e-12);
});

test('quantum: qutrit SUM gate adds mod 3', () => {
  // |a b> with a=2 (q0), b=1 (q1): SUM -> |2, 0> (2+1=3 mod 3=0)
  const qc = new QuditCircuit(2, 3);
  qc.apply1(0, SHIFT(3)); qc.apply1(0, SHIFT(3)); // q0 = 2 -> index 2*3=6
  qc.apply1(1, SHIFT(3)); // q1 = 1 -> index 6+1 = 7
  approx(qc.probs()[7], 1);
  qc.apply2(0, 1, SUM(3));
  // result |2,0> -> index 2*3+0 = 6
  approx(qc.probs()[6], 1);
  approx(qc.probs()[7], 0);
});

test('quantum: qutrit state dimension guard', () => {
  assert.throws(() => new QuditCircuit(20, 2), /State too large/);
  assert.throws(() => new QuditCircuit(11, 3), /State too large/); // 3^11 = 177147
  assert.doesNotThrow(() => new QuditCircuit(8, 3));  // 3^8 = 6561 ok
  assert.doesNotThrow(() => new QuditCircuit(10, 3)); // 3^10 = 59049 ok
});

test('quantum: phase-kickback sanity via qft on |0> gives uniform', () => {
  const qc = qft(2, { x: 0 });
  const p = qc.probs();
  for (let i = 0; i < 4; i++) approx(p[i], 0.25, 1e-12);
});

// ---- canvas-diagram integration -------------------------------------------
function bellDiagram() {
  const d = new Diagram({ lab: 'quantum', name: 'bell', meta: { d: 2, shots: 2000, seed: 42 } });
  const w0 = d.addBlock('quantum.WIRE', { params: { name: 'q0' }, x: 0, y: 40 });
  const w1 = d.addBlock('quantum.WIRE', { params: { name: 'q1' }, x: 0, y: 120 });
  const h = d.addBlock('quantum.H', { x: 120, y: 40 });
  const cn = d.addBlock('quantum.CNOT', { x: 240, y: 40 });
  const m0 = d.addBlock('quantum.MEASURE', { x: 380, y: 40 });
  const m1 = d.addBlock('quantum.MEASURE', { x: 380, y: 120 });
  d.connect(w0.id, 'out', h.id, 'qin');
  d.connect(h.id, 'qout', cn.id, 'cin');
  d.connect(w1.id, 'out', cn.id, 'tin');
  d.connect(cn.id, 'cout', m0.id, 'in');
  d.connect(cn.id, 'tout', m1.id, 'in');
  return d;
}

test('quantum: lab.run extracts Bell circuit from canvas diagram', () => {
  const d = bellDiagram();
  const res = quantumLab.run(d);
  assert.equal(res.ok, true, res.problems?.join('; '));
  assert.equal(res.gates, 2);
  assert.equal((res.counts['01'] || 0) + (res.counts['10'] || 0), 0);
  assert.ok(res.counts['00'] > 800 && res.counts['00'] < 1200, `counts00=${res.counts['00']}`);
});

test('quantum: lab.validate passes Bell circuit with entanglement witness', () => {
  const d = bellDiagram();
  const report = quantumLab.report(d);
  const witness = report.checks.find((c) => c.name.includes('Entanglement'));
  assert.ok(witness, 'witness check missing');
  assert.equal(witness.verdict, 'pass');
  assert.equal(report.verdict, 'warn'); // honesty warning always present
});

test('quantum: dangling gate input is an explicit failure', () => {
  const d = bellDiagram();
  // CNOT target input not connected to a wire
  d.wires = d.wires.filter((w) => !(w.to.block.includes('CNOT') && w.to.port === 'tin'));
  const res = quantumLab.run(d);
  assert.equal(res.ok, false);
  assert.ok(res.problems[0].includes('wire(s) attached'));
});

test('quantum: qubit gate on a qutrit diagram is refused with a clear message', () => {
  const d = new Diagram({ lab: 'quantum', meta: { d: 3, seed: 1, shots: 10 } });
  const w = d.addBlock('quantum.WIRE', { x: 0, y: 0 });
  const h = d.addBlock('quantum.H', { x: 100, y: 0 });
  d.connect(w.id, 'out', h.id, 'qin');
  const res = quantumLab.run(d);
  assert.equal(res.ok, false);
  assert.ok(res.problems[0].includes('d=2'), 'error should explain the dimension requirement');
});

// ---------------- review round 2: concurrence classification ---------------
test('quantum: partially entangled state (sqrt(0.9)|00> + sqrt(0.1)|11>) is NOT maximally entangled', () => {
  // Ry(2·acos(√0.9)) on q0 gives cos(θ/2)|0> + sin(θ/2)|1> = √0.9|0> + √0.1|1>;
  // CNOT then yields √0.9|00> + √0.1|11>: entangled, concurrence C = 2·√0.09 = 0.6.
  const theta = 2 * Math.acos(Math.sqrt(0.9));
  const d = new Diagram({ lab: 'quantum', name: 'partial', meta: { d: 2, shots: 10, seed: 3 } });
  const w0 = d.addBlock('quantum.WIRE', { x: 0, y: 40 });
  const w1 = d.addBlock('quantum.WIRE', { x: 0, y: 140 });
  const ry = d.addBlock('quantum.RY', { params: { theta }, x: 150, y: 40 });
  const cn = d.addBlock('quantum.CNOT', { x: 290, y: 40 });
  const m0 = d.addBlock('quantum.MEASURE', { x: 440, y: 40 });
  const m1 = d.addBlock('quantum.MEASURE', { x: 440, y: 140 });
  d.connect(w0.id, 'out', ry.id, 'qin');
  d.connect(ry.id, 'qout', cn.id, 'cin');
  d.connect(w1.id, 'out', cn.id, 'tin');
  d.connect(cn.id, 'cout', m0.id, 'in');
  d.connect(cn.id, 'tout', m1.id, 'in');
  const report = quantumLab.report(d);
  const cls = report.checks.find((c) => c.name.includes('Entanglement classification'));
  assert.ok(cls, 'partial-entanglement classification missing');
  assert.ok(/partially/i.test(cls.note) && /below 1/i.test(cls.note),
    `note must disclaim maximal entanglement: ${cls.note}`);
  assert.ok(Math.abs(cls.actual - 0.6) < 1e-9, `concurrence should be 0.6, got ${cls.actual}`);
  // false-positive scan: no maximally-entangled claim on a partial state
  const falseMax = report.checks.find((c) =>
    c.verdict === 'pass' && /maximally entangled/i.test(c.note || ''));
  assert.equal(falseMax, undefined, 'a partially entangled state must not be labelled maximally entangled');
});

test('quantum: Bell state reports concurrence ~1 (maximally entangled)', () => {
  const d = bellDiagram();
  const report = quantumLab.report(d);
  const witness = report.checks.find((c) => c.name.includes('maximally entangled'));
  assert.ok(witness, 'maximally-entangled witness missing for Bell state');
  assert.ok(Math.abs(witness.actual - 1) < 1e-9, `concurrence should be 1, got ${witness.actual}`);
});

test('quantum: separable |00> reports concurrence 0', () => {
  const d = new Diagram({ lab: 'quantum', name: 'separable', meta: { d: 2, shots: 10, seed: 1 } });
  d.addBlock('quantum.WIRE', { x: 0, y: 0 });
  d.addBlock('quantum.WIRE', { x: 0, y: 100 });
  const report = quantumLab.report(d);
  const cls = report.checks.find((c) => c.name.includes('Two-qubit state classification'));
  assert.ok(cls, 'product-state classification missing');
  assert.equal(cls.verdict, 'pass');
  assert.equal(cls.actual, 0);
});
