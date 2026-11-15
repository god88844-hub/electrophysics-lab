// core.test.mjs — core data model + logic engine smoke and acceptance tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import '../js/labs/logic/components.js';
import { getComponent } from '../js/core/registry.js';
import { Diagram } from '../js/core/diagram.js';
import { Quantity, convert, parseSI, fmtNum } from '../js/core/units.js';
import { EventQueue } from '../js/core/events.js';
import { stats, monteCarlo, mulberry32, withinTol, makeCheck, verdictFrom, assembleReport } from '../js/core/validation.js';
import { bitsToBytes, bytesToBits, quantize, threshold } from '../js/core/pipeline.js';
import { runLogic, truthTableTest, Z } from '../js/labs/logic/engine.js';
import { logicLab } from '../js/labs/logic/lab.js';

// ---------------- units -------------------------------------------------
const approx = (actual, expected, eps = 1e-12) =>
  assert.ok(Math.abs(actual - expected) <= eps * Math.max(1, Math.abs(expected)),
    `expected ${actual} ≈ ${expected}`);

test('units: Quantity conversions are exact across prefixes', () => {
  assert.equal(convert(1, 'kohm', 'ohm'), 1000);
  approx(convert(100, 'nF', 'uF'), 0.1);
  assert.equal(convert(1e-3, 'A', 'mA'), 1);
  assert.equal(new Quantity(1, 'kHz').to('Hz'), 1000);
  assert.throws(() => convert(1, 'V', 'A'), /Cannot convert/);
});

test('units: parseSI handles engineering shorthand', () => {
  assert.equal(parseSI('1k'), 1000);
  approx(parseSI('100n'), 1e-7);
  approx(parseSI('4.7u'), 4.7e-6);
  assert.equal(parseSI('3.3'), 3.3);
  assert.equal(parseSI('1e3'), 1000);
});

test('units: fmtNum gives stable significant digits', () => {
  assert.equal(fmtNum(1591.549, 4), '1592');
  assert.equal(fmtNum(0.0000159, 3), '1.59e-5');
  assert.equal(fmtNum(0, 4), '0');
});

// ---------------- event queue -------------------------------------------
test('events: EventQueue orders by (time, seq) deterministically', () => {
  const q = new EventQueue();
  q.push(10, 'a'); q.push(5, 'b'); q.push(10, 'c'); q.push(1, 'd');
  const out = [];
  while (q.size) out.push(q.pop());
  assert.deepEqual(out.map((e) => e.payload), ['d', 'b', 'a', 'c']);
});

// ---------------- diagram serialization ---------------------------------
test('core: diagram JSON round-trip preserves blocks and wires', () => {
  const d = new Diagram({ name: 'rt', lab: 'logic', meta: { radix: 4 } });
  const a = d.addBlock('logic.IN', { params: { value: 3 }, x: 10, y: 20 });
  const p = d.addBlock('logic.PROBE');
  d.connect(a.id, 'out', p.id, 'in');
  const j = JSON.parse(JSON.stringify(d.toJSON()));
  const d2 = Diagram.fromJSON(j);
  assert.equal(d2.meta.radix, 4);
  assert.equal(d2.blocks.length, 2);
  assert.equal(d2.wires.length, 1);
  assert.deepEqual(d2.blocks[0].params, { value: 3, name: 'IN' });
});

test('core: addBlock applies parameter defaults from the registry', () => {
  const d = new Diagram({ lab: 'logic' });
  const g = d.addBlock('logic.AND');
  assert.equal(g.params.delay, 10);
  assert.throws(() => d.addBlock('nope.NOTHING'), /Unknown component type/);
});

test('core: connect enforces direction and duplicate suppression', () => {
  const d = new Diagram({ lab: 'logic' });
  const a = d.addBlock('logic.IN');
  const p = d.addBlock('logic.PROBE');
  d.connect(a.id, 'out', p.id, 'in');
  assert.throws(() => d.connect(p.id, 'in', a.id, 'out'), /need out->in/);
  assert.equal(d.connect(a.id, 'out', p.id, 'in'), null); // duplicate -> null
});

// ---------------- logic gates: exhaustive truth tables -------------------
const REF = {
  'logic.AND': (i, r) => Math.min(i.a, i.b),
  'logic.OR': (i, r) => Math.max(i.a, i.b),
  'logic.NAND': (i, r) => r - 1 - Math.min(i.a, i.b),
  'logic.NOR': (i, r) => r - 1 - Math.max(i.a, i.b),
  'logic.XOR': (i, r) => (i.a + i.b) % r,
  'logic.XNOR': (i, r) => r - 1 - ((i.a + i.b) % r),
  'logic.NOT': (i, r) => r - 1 - i.a,
  'logic.BUF': (i, r) => i.a,
};

for (const [typeId, ref] of Object.entries(REF)) {
  for (const radix of [2, 3, 4]) {
    test(`logic: ${typeId} exhaustive truth table @ radix ${radix}`, () => {
      const def = getComponent(typeId);
      const ports = typeId === 'logic.NOT' || typeId === 'logic.BUF' ? ['a'] : ['a', 'b'];
      const t = truthTableTest(def, radix, (i, r) => ({ y: ref(i, r) }), ports);
      assert.equal(t.mismatches.length, 0, JSON.stringify(t.mismatches.slice(0, 3)));
    });
  }
}

test('logic: ADDN (radix full adder) matches reference arithmetic for radix 2/3/4', () => {
  const def = getComponent('logic.ADDN');
  for (const r of [2, 3, 4]) {
    const t = truthTableTest(def, r, (i, rad) => {
      const s = i.a + i.b + i.cin;
      return { sum: s % rad, cout: Math.floor(s / rad) };
    }, ['a', 'b', 'cin']);
    assert.equal(t.mismatches.length, 0);
    assert.equal(t.rows.length, r ** 3);
  }
});

// ---------------- engine behavior ----------------------------------------
function makeAdderDiagram(radix, aVal, bVal) {
  const d = new Diagram({ name: 'adder', lab: 'logic', meta: { radix } });
  const a = d.addBlock('logic.IN', { params: { value: aVal, name: 'A' }, x: 0, y: 0 });
  const b = d.addBlock('logic.IN', { params: { value: bVal, name: 'B' }, x: 0, y: 60 });
  const ci = d.addBlock('logic.IN', { params: { value: 0, name: 'Cin' }, x: 0, y: 120 });
  const add = d.addBlock('logic.ADDN', { x: 120, y: 40 });
  const ps = d.addBlock('logic.PROBE', { params: { name: 'SUM' }, x: 240, y: 20 });
  const pc = d.addBlock('logic.PROBE', { params: { name: 'COUT' }, x: 240, y: 80 });
  d.connect(a.id, 'out', add.id, 'a');
  d.connect(b.id, 'out', add.id, 'b');
  d.connect(ci.id, 'out', add.id, 'cin');
  d.connect(add.id, 'sum', ps.id, 'in');
  d.connect(add.id, 'cout', pc.id, 'in');
  return d;
}

test('logic: quaternary adder computes 3 + 2 = 11(base-4) through the event engine', () => {
  const d = makeAdderDiagram(4, 3, 2);
  const res = runLogic(d);
  assert.equal(res.ok, true, res.problems.join('; '));
  const sumProbe = Object.values(res.probes).find((p) => p.label === 'SUM');
  const coutProbe = Object.values(res.probes).find((p) => p.label === 'COUT');
  assert.equal(sumProbe.values.at(-1), 1);   // 11 base-4 -> digits (1,1)
  assert.equal(coutProbe.values.at(-1), 1);  // carry out
});

test('logic: quaternary ripple adder 2-digit: 23(base4)=11 + 32(base4)=14 -> 121(base4)=25', () => {
  const d = new Diagram({ lab: 'logic', meta: { radix: 4 } });
  const digits = [[2, 3], [3, 2]]; // [a0,b0], [a1,b1]
  const adders = [];
  for (let i = 0; i < 2; i++) adders.push(d.addBlock('logic.ADDN', { x: 120, y: 40 + i * 80 }));
  const probes = [];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const inp = d.addBlock('logic.IN', { params: { value: digits[i][j], name: `d${i}${j}` }, x: 0, y: 20 + (i * 2 + j) * 40 });
      d.connect(inp.id, 'out', adders[i].id, j === 0 ? 'a' : 'b');
    }
    probes.push(d.addBlock('logic.PROBE', { params: { name: `S${i}` }, x: 240, y: 40 + i * 80 }));
    d.connect(adders[i].id, 'sum', probes[i].id, 'in');
  }
  const carryProbe = d.addBlock('logic.PROBE', { params: { name: 'Cout' }, x: 240, y: 220 });
  d.connect(adders[1].id, 'cout', carryProbe.id, 'in');
  d.connect(adders[0].id, 'cout', adders[1].id, 'cin');
  // LSB carry-in must be driven — the engine treats floating inputs as 'Z'
  const cin0 = d.addBlock('logic.CONST', { params: { value: 0 }, x: 0, y: 200 });
  d.connect(cin0.id, 'out', adders[0].id, 'cin');
  const res = runLogic(d);
  assert.equal(res.ok, true);
  const last = (label) => Object.values(res.probes).find((p) => p.label === label).values.at(-1);
  // 23(base4) = 11, 32(base4) = 14, sum = 25 = 1*16 + 2*4 + 1 = 121(base4)
  assert.equal(last('S0'), 1);
  assert.equal(last('S1'), 2);
  assert.equal(last('Cout'), 1);
});

test('logic: Z propagates and unconnected inputs produce a warning', () => {
  const d = new Diagram({ lab: 'logic' });
  const g = d.addBlock('logic.AND', { x: 0, y: 0 });
  const p = d.addBlock('logic.PROBE', { params: { name: 'Y' } });
  d.connect(g.id, 'y', p.id, 'in');
  const res = runLogic(d);
  const v = Object.values(res.probes)[0].values.at(-1);
  assert.equal(v, Z);
  assert.ok(res.warnings.some((w) => w.includes('unconnected')));
});

test('logic: oscillating feedback (NOT feeding itself from an input) aborts with event storm', () => {
  const d = new Diagram({ lab: 'logic' });
  const inp = d.addBlock('logic.IN', { params: { value: 0 } });
  const inv = d.addBlock('logic.NOT');
  const p = d.addBlock('logic.PROBE');
  d.connect(inp.id, 'out', inv.id, 'a');
  d.connect(inv.id, 'y', inv.id, 'a'); // self-loop on top of the driver
  d.connect(inv.id, 'y', p.id, 'in');
  assert.throws(() => runLogic(d, { maxEvents: 2000 }), /oscillation/i);
});

test('logic: DFF samples D on rising clock edge; ignore levels otherwise', () => {
  const d = new Diagram({ lab: 'logic', meta: { radix: 2 } });
  const din = d.addBlock('logic.IN', { params: { value: 1, name: 'D' }, x: 0, y: 0 });
  const clk = d.addBlock('logic.CLOCK', { params: { period: 100, duty: 0.5 }, x: 0, y: 80 });
  const f = d.addBlock('logic.DFF', { params: { tco: 5, init: 0 }, x: 120, y: 30 });
  const q = d.addBlock('logic.PROBE', { params: { name: 'Q' }, x: 260, y: 30 });
  d.connect(din.id, 'out', f.id, 'd');
  d.connect(clk.id, 'out', f.id, 'clk');
  d.connect(f.id, 'q', q.id, 'in');
  const res = runLogic(d, { maxTicks: 400 });
  const rec = Object.values(res.probes).find((p) => p.label === 'Q');
  // first rising edge at t=50 -> Q=1 (tco 5); period 100 -> stays 1 (D constant)
  const idx50 = rec.times.findIndex((t, i) => t >= 55 && rec.values[i] === 1);
  assert.ok(idx50 >= 0, `Q should go to 1 at ~t=55, got times=${rec.times} values=${rec.values}`);
});

test('logic: contention warning when an input has two drivers', () => {
  const d = new Diagram({ lab: 'logic' });
  const i1 = d.addBlock('logic.IN', { params: { value: 0 } });
  const i2 = d.addBlock('logic.IN', { params: { value: 1 } });
  const p = d.addBlock('logic.PROBE');
  d.connect(i1.id, 'out', p.id, 'in');
  d.connect(i2.id, 'out', p.id, 'in');
  const res = runLogic(d);
  assert.ok(res.warnings.some((w) => w.includes('contention')));
});

// ---------------- lab validation ------------------------------------------
test('logic: lab.validate reports exhaustive truth-table passes for used gates', () => {
  const d = makeAdderDiagram(4, 0, 0);
  const checks = logicLab.validate(d);
  const tt = checks.filter((c) => c.name.startsWith('Truth table'));
  assert.ok(tt.length >= 1);
  assert.ok(tt.every((c) => c.verdict === 'pass'));
  assert.equal(logicLab.report(d).verdict, 'pass');
});

test('logic: broken diagram (dangling wire) fails validation', () => {
  const d = new Diagram({ lab: 'logic' });
  d.addBlock('logic.IN');
  d.wires.push({ id: 'w-bad', from: { block: 'logic.IN1', port: 'out' }, to: { block: 'ghost', port: 'in' } });
  const report = logicLab.report(d);
  assert.equal(report.verdict, 'fail');
});

// ---------------- validation core ------------------------------------------
test('validation: monteCarlo spread honors ±tol uniform sampling', () => {
  const rng = mulberry32(42);
  const mc = monteCarlo({
    n: 500, rng,
    draw: () => ({ r: 1000 * (1 + (rng() * 2 - 1) * 0.05) }),
    run: (p) => p.r,
    metric: (x) => x,
  });
  const s = mc.summary.value;
  assert.equal(s.n, 500);
  assert.ok(s.min >= 950 && s.max <= 1050);
  assert.ok(s.mean > 990 && s.mean < 1010);
});

test('validation: verdictFrom picks the worst; makeCheck computes pass/fail', () => {
  assert.equal(verdictFrom([makeCheck({ name: 'a', actual: 1, expected: 1, abs: 0.1 })].concat(
    [makeCheck({ name: 'b', actual: 2, expected: 1, abs: 0.1 })])), 'fail');
  assert.equal(verdictFrom([makeCheck({ name: 'a', actual: 1, expected: 1, abs: 0.1 })]), 'pass');
  assert.equal(verdictFrom([{ verdict: 'unknown', name: 'u' }]), 'unknown');
  assert.equal(withinTol(1.59e3, 1591.5, { rel: 0.01 }), true);
});

test('validation: assumptions list flags params without tolerance data', () => {
  const d = new Diagram({ lab: 'logic' });
  d.addBlock('logic.IN'); // 'value' param has noTolRequired -> not flagged
  d.addBlock('logic.AND'); // 'delay' has noTolRequired -> not flagged
  const report = assembleReport({ diagram: d, checks: [] });
  assert.deepEqual(report.assumptions, []);
});

// ---------------- pipeline adapters ----------------------------------------
test('pipeline: adapters quantize/threshold/bits<->bytes round-trip', () => {
  assert.equal(threshold(0.3), 0);
  assert.equal(threshold(0.7), 1);
  assert.equal(quantize(0.51, { min: 0, max: 1, levels: 256 }), 130);
  assert.deepEqual(bitsToBytes([1, 0, 0, 0, 0, 0, 0, 1]), [0x81]);
  assert.deepEqual(bytesToBits([0x81]), [1, 0, 0, 0, 0, 0, 0, 1]);
});
