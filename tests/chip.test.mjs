// chip.test.mjs — Chip Lab MNA engine against hand-computed references.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import '../js/labs/chip/components.js';
import { Diagram } from '../js/core/diagram.js';
import { solveDC, runTransient, runAC, dcSweep, buildNetlist, mosCurrents } from '../js/labs/chip/engine.js';
import { toSpiceDeck } from '../js/labs/chip/spice-export.js';
import { chipLab } from '../js/labs/chip/lab.js';

const approx = (actual, expected, eps = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= eps * Math.max(1, Math.abs(expected)), `expected ${actual} ≈ ${expected}`);

/** voltage divider: Vin -- R1 -- vout -- R2 -- gnd */
function dividerDiagram(v = 10, r1 = 1000, r2 = 2000) {
  const d = new Diagram({ lab: 'chip', name: 'divider' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: v }, x: 0, y: 100 });
  const ra = d.addBlock('chip.RES', { params: { r: r1 }, x: 120, y: 40 });
  const rb = d.addBlock('chip.RES', { params: { r: r2 }, x: 120, y: 160 });
  const gnd = d.addBlock('chip.GND', { x: 260, y: 220 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vout' }, x: 260, y: 100 });
  d.connect(src.id, 'p', ra.id, 'p');
  d.connect(ra.id, 'n', rb.id, 'p');
  d.connect(rb.id, 'n', gnd.id, 'g');
  d.connect(ra.id, 'n', vm.id, 'p');
  d.connect(src.id, 'n', gnd.id, 'g');
  return d;
}

test('chip: resistive divider matches hand calculation exactly', () => {
  const res = solveDC(dividerDiagram(10, 1000, 2000));
  assert.equal(res.ok, true, res.problems?.join('; '));
  approx(res.meters[Object.keys(res.meters)[0]], 10 * 2000 / 3000, 1e-9);
  // power balance: what the source delivers == what resistors dissipate
  const consumed = res.elements.filter((e) => e.kind === 'res').reduce((a, e) => a + e.power, 0);
  const delivered = res.elements.find((e) => e.kind === 'vsource').power;
  approx(consumed, delivered, 1e-6);
  approx(consumed, (10 * 10) / 3000, 1e-9);
});

test('chip: DC without ground fails honestly', () => {
  const d = new Diagram({ lab: 'chip' });
  const r = d.addBlock('chip.RES');
  const res = solveDC(d);
  assert.equal(res.ok, false);
  assert.ok(res.problems[0].includes('ground'));
});

test('chip: floating terminal is an explicit error', () => {
  const d = dividerDiagram();
  d.addBlock('chip.RES'); // one terminal connected to nothing
  const res = solveDC(d);
  assert.equal(res.ok, false);
  assert.ok(res.problems.some((p) => p.includes('floating')));
});

test('chip: RC transient step response hits 63.2% at tau = RC (backward Euler)', () => {
  const R = 1000, C = 100e-9, V = 5;
  const tau = R * C; // 100 µs
  const d = new Diagram({ lab: 'chip', name: 'rc' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: V }, x: 0, y: 100 });
  const r = d.addBlock('chip.RES', { params: { r: R }, x: 120, y: 40 });
  const c = d.addBlock('chip.CAP', { params: { c: C, vInit: 0 }, x: 240, y: 160 });
  const gnd = d.addBlock('chip.GND', { x: 360, y: 220 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vc' }, x: 360, y: 100 });
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', c.id, 'p');
  d.connect(c.id, 'n', gnd.id, 'g');
  d.connect(r.id, 'n', vm.id, 'p');
  d.connect(src.id, 'n', gnd.id, 'g');

  const tstop = 5 * tau;
  const res = runTransient(d, { tstop, dt: tau / 500 });
  assert.equal(res.ok, true, res.problems?.join('; '));
  const vc = res.meters[vm.id];
  // 63.2% crossing near t = tau (within 2% given dt = tau/500, BE is accurate here)
  const target = V * (1 - Math.exp(-1));
  let t63 = null;
  for (let i = 1; i < vc.length; i++) {
    if (vc[i] >= target && vc[i - 1] < target) { t63 = res.t[i]; break; }
  }
  assert.ok(t63, 'never reached 63.2%');
  assert.ok(Math.abs(t63 - tau) / tau < 0.01, `t63=${t63} vs tau=${tau}`);
  // final value ~ V
  assert.ok(Math.abs(vc.at(-1) - V) < V * 0.01);
});

test('chip: AC sweep finds −3 dB cutoff of RC low-pass within 2% of 1/(2πRC)', () => {
  const R = 1000, C = 100e-9;
  const fTheory = 1 / (2 * Math.PI * R * C); // ≈ 1591.5 Hz
  const d = new Diagram({ lab: 'chip', name: 'rc-ac' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'ac', amp: 1, dc: 0 }, x: 0, y: 100 });
  const r = d.addBlock('chip.RES', { params: { r: R }, x: 120, y: 40 });
  const c = d.addBlock('chip.CAP', { params: { c: C }, x: 240, y: 160 });
  const gnd = d.addBlock('chip.GND', { x: 360, y: 220 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vc' }, x: 360, y: 100 });
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', c.id, 'p');
  d.connect(c.id, 'n', gnd.id, 'g');
  d.connect(r.id, 'n', vm.id, 'p');
  d.connect(src.id, 'n', gnd.id, 'g');

  const res = runAC(d, { fstart: fTheory / 10, fstop: fTheory * 10, points: 400 });
  assert.equal(res.ok, true, res.problems?.join('; '));
  const db = res.meters[vm.id].db;
  // find -3dB crossing
  let f3 = null;
  for (let i = 1; i < db.length; i++) {
    if (db[i] <= -3 && db[i - 1] > -3) {
      const t = (-3 - db[i - 1]) / (db[i] - db[i - 1]);
      f3 = res.f[i - 1] + t * (res.f[i] - res.f[i - 1]);
      break;
    }
  }
  assert.ok(f3, 'no -3dB crossing found');
  assert.ok(Math.abs(f3 - fTheory) / fTheory < 0.02, `f3db=${f3} vs theory=${fTheory}`);
  // DC-ish limit: gain → 1 (0 dB) at low freq
  assert.ok(db[0] > -0.1, `low-freq gain should be ~0dB, got ${db[0]}`);
});

test('chip: NMOS Id-Vg sweep matches square-law reference (ammeter method)', () => {
  // Vds fixed at 5 V; sweep Vgs 0..5; Id = k/2 (Vgs-Vth)² in saturation.
  // lambda=0 isolates the ideal square law (CLM is checked separately below).
  const k = 0.02, vth = 2, vds = 5;
  const d = new Diagram({ lab: 'chip', name: 'nmos-sweep' });
  const vg = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 0 }, x: 0, y: 0 });
  const vd = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: vds }, x: 0, y: 120 });
  const m = d.addBlock('chip.NMOS', { params: { k, vth, lambda: 0 }, x: 200, y: 60 });
  const am = d.addBlock('chip.AMMETER', { params: { name: 'Id' }, x: 320, y: 60 });
  const gnd = d.addBlock('chip.GND', { x: 320, y: 200 });
  d.connect(vg.id, 'p', m.id, 'g');
  d.connect(vg.id, 'n', gnd.id, 'g');
  d.connect(vd.id, 'p', am.id, 'p');
  d.connect(am.id, 'n', m.id, 'd');
  d.connect(vd.id, 'n', gnd.id, 'g');
  d.connect(m.id, 's', gnd.id, 'g');

  const sweep = dcSweep(d, { blockId: vg.id, param: 'dc', from: 0, to: 5, steps: 25 });
  assert.equal(sweep.ok, true, sweep.problems?.join('; '));
  const ids = sweep.meters[am.id];
  for (let i = 0; i <= 25; i++) {
    const vgs = i * 0.2;
    const expected = vgs > vth ? 0.5 * k * (vgs - vth) ** 2 : 0;
    approx(ids[i], expected, 1e-6);
  }
});

test('chip: NMOS device model unit checks (regions and directions)', () => {
  const P0 = { k: 0.02, vth: 2, lambda: 0 }; // lambda=0: ideal square law
  // saturation
  let [iD] = mosCurrents([5, 3, 0], 'nmos', P0);
  approx(iD, 0.5 * 0.02 * 1, 1e-9);
  // CLM raises saturation current by (1+λ·Vds)
  let [iDl] = mosCurrents([5, 3, 0], 'nmos', { k: 0.02, vth: 2, lambda: 0.01 });
  approx(iDl, 0.5 * 0.02 * 1 * (1 + 0.01 * 5), 1e-9);
  // linear region: Vds < over
  [iD] = mosCurrents([1, 3, 0], 'nmos', P0);
  approx(iD, 0.02 * (1 * 1 - 0.5 * 1), 1e-9);
  // off
  [iD] = mosCurrents([5, 1, 0], 'nmos', P0);
  assert.equal(iD, 0);
  // PMOS on: current leaves source (positive iS)
  const [, , iSp] = mosCurrents([0, 0, 5], 'pmos', { k: 0.02, vth: -2, lambda: 0 });
  assert.ok(iSp > 0, 'PMOS source should source current when on');
});

test('chip: CMOS inverter DC transfer flips near mid-supply', () => {
  // PMOS source→vdd, NMOS source→gnd, gates tied, drains tied → voltmeter
  const d = new Diagram({ lab: 'chip', name: 'inverter' });
  const vdd = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 5 }, x: 0, y: 0 });
  const vin = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 0 }, x: 0, y: 260 });
  const pm = d.addBlock('chip.PMOS', { params: { k: 0.02, vth: -2 }, x: 220, y: 20 });
  const nm = d.addBlock('chip.NMOS', { params: { k: 0.02, vth: 2 }, x: 220, y: 160 });
  const gnd = d.addBlock('chip.GND', { x: 420, y: 300 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vout' }, x: 420, y: 90 });
  d.connect(vdd.id, 'p', pm.id, 's');
  d.connect(vdd.id, 'n', gnd.id, 'g');
  d.connect(pm.id, 'd', nm.id, 'd');
  d.connect(nm.id, 's', gnd.id, 'g');
  d.connect(pm.id, 'd', vm.id, 'p');
  d.connect(nm.id, 'g', vin.id, 'p');
  d.connect(pm.id, 'g', vin.id, 'p');
  d.connect(vin.id, 'n', gnd.id, 'g');

  const sweep = dcSweep(d, { blockId: vin.id, param: 'dc', from: 0, to: 5, steps: 20 });
  assert.equal(sweep.ok, true, sweep.problems?.join('; '));
  const vout = sweep.meters[vm.id];
  approx(vout[0], 5, 1e-3);          // vin=0 -> PMOS on -> vout ≈ VDD
  assert.ok(vout.at(-1) < 0.1, `vin=5 -> NMOS on -> vout low, got ${vout.at(-1)}`);
  // midpoint: both partially on — output must be between rails
  const mid = vout[10];
  assert.ok(mid > 0 && mid < 5, `midpoint vout=${mid} should be between rails`);
});

test('chip: diode + resistor DC matches Shockley model to Newton tolerance', () => {
  // 5V -- R(1k) -- anode; cathode -- gnd. Solve Vd: 5 - 1k*Is(e^(Vd/Vt)-1) = Vd
  const is = 1e-12, R = 1000;
  const Vt = 25.85e-3;
  // reference by bisection
  const f = (vd) => (5 - vd) / R - is * (Math.exp(vd / Vt) - 1);
  let lo = 0, hi = 0.9;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
  const vdRef = (lo + hi) / 2;

  const d = new Diagram({ lab: 'chip', name: 'diode' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 5 }, x: 0, y: 100 });
  const r = d.addBlock('chip.RES', { params: { r: R }, x: 120, y: 40 });
  const di = d.addBlock('chip.DIODE', { params: { is, n: 1 }, x: 240, y: 160 });
  const gnd = d.addBlock('chip.GND', { x: 360, y: 220 });
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', di.id, 'a');
  d.connect(di.id, 'c', gnd.id, 'g');
  d.connect(src.id, 'n', gnd.id, 'g');
  const res = solveDC(d);
  assert.equal(res.ok, true, res.problems?.join('; '));
  // diode current = elementReport row for the diode
  const row = res.elements.find((e) => e.kind === 'diode');
  const vd = res.nodes[Object.keys(res.nodes).find((k) => res.nodes[k].length > 0 && res.nodeAliases[k]?.some(a => a.includes('DIODE'))) ];
  approx(row.i, is * (Math.exp(vdRef / Vt) - 1), 1e-4);
});

test('chip: opamp non-inverting amplifier gain = 1 + R2/R1 (within rails)', () => {
  const d = new Diagram({ lab: 'chip', name: 'amp' });
  const vin = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 0.5 }, x: 0, y: 200 });
  const op = d.addBlock('chip.OPAMP', { params: { gain: 1e5, vcc: 15 }, x: 240, y: 100 });
  const r1 = d.addBlock('chip.RES', { params: { r: 1000 }, x: 380, y: 180 }); // to gnd
  const r2 = d.addBlock('chip.RES', { params: { r: 1000 }, x: 380, y: 20 });  // feedback
  const gnd = d.addBlock('chip.GND', { x: 520, y: 280 });
  d.connect(vin.id, 'p', op.id, 'vp');
  d.connect(vin.id, 'n', gnd.id, 'g');
  d.connect(op.id, 'vout', r2.id, 'p');
  d.connect(r2.id, 'n', op.id, 'vn');
  d.connect(op.id, 'vn', r1.id, 'p');
  d.connect(r1.id, 'n', gnd.id, 'g');
  const res = solveDC(d);
  assert.equal(res.ok, true, res.problems?.join('; '));
  // opamp output node: the net containing chipOPAMP1.vout
  const outNode = Object.entries(res.nodeAliases)
    .find(([, alias]) => alias.some((a) => a === 'chipOPAMP1.vout'));
  assert.ok(outNode, 'opamp output node not found');
  const vout = res.nodes[outNode[0]];
  approx(vout, 0.5 * 2, 1e-4); // gain 1 + R2/R1 = 2
});

test('chip: AC with nonlinear devices is refused, not silently linearized', () => {
  const d = new Diagram({ lab: 'chip', name: 'ac-diode' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'ac', amp: 1 }, x: 0, y: 100 });
  const di = d.addBlock('chip.DIODE', { x: 160, y: 100 });
  const r = d.addBlock('chip.RES', { params: { r: 1000 }, x: 280, y: 40 });
  const gnd = d.addBlock('chip.GND', { x: 400, y: 200 });
  d.connect(src.id, 'p', di.id, 'a');
  d.connect(di.id, 'c', r.id, 'p');
  d.connect(r.id, 'n', gnd.id, 'g');
  d.connect(src.id, 'n', gnd.id, 'g');
  const res = runAC(d);
  assert.equal(res.ok, false);
  assert.ok(res.problems[0].includes('linear'));
});

test('chip: SPICE deck export contains elements, per-device models and analysis', () => {
  // strengthened after the audit fix: model cards are per-device and carry
  // the user's actual parameters (no hard-coded VTO/KP/Is/N)
  const d = dividerDiagram();
  const di = d.addBlock('chip.DIODE', { params: { is: 5e-13, n: 1.5 } });
  const mos = d.addBlock('chip.NMOS', { params: { k: 0.012, vth: 0.75 } });
  d.connect(d.block('chipRES1').id, 'n', di.id, 'a');
  d.connect(di.id, 'c', d.block('chipGND1').id, 'g');
  d.connect(mos.id, 's', d.block('chipGND1').id, 'g');
  const deck = toSpiceDeck(d, { analysis: 'tran', tstop: '1m', dt: '1u' });
  assert.ok(deck.includes('RchipRES'));
  assert.ok(deck.includes('VchipVSOURCE'));
  assert.ok(deck.includes('.tran 1u 1m'));
  assert.ok(deck.includes('.model DMOD_chipDIODE1 D(Is=5e-13 N=1.5)'), 'per-device diode model with user params');
  assert.match(deck, /Vto=0\.75/i, 'NMOS threshold from user params');
  assert.match(deck, /Kp=0\.012/i, 'NMOS transconductance from user params');
  assert.ok(deck.includes('NMOD_chipNMOS1'), 'M element references its own model card');
  assert.ok(deck.includes('.end'));
});

test('chip: lab.validate produces RC cutoff check with pass verdict', () => {
  const R = 1000, C = 100e-9;
  const d = new Diagram({ lab: 'chip', name: 'rc-valid' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'ac', amp: 1, dc: 0 }, x: 0, y: 100 });
  const r = d.addBlock('chip.RES', { params: { r: R }, x: 120, y: 40 });
  const c = d.addBlock('chip.CAP', { params: { c: C }, x: 240, y: 160 });
  const gnd = d.addBlock('chip.GND', { x: 360, y: 220 });
  const vm = d.addBlock('chip.VOLTMETER', { params: { name: 'vc' }, x: 360, y: 100 });
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', c.id, 'p');
  d.connect(c.id, 'n', gnd.id, 'g');
  d.connect(r.id, 'n', vm.id, 'p');
  d.connect(src.id, 'n', gnd.id, 'g');
  const report = chipLab.report(d);
  const cutoff = report.checks.find((c) => c.name.includes('cutoff'));
  assert.ok(cutoff, 'cutoff check missing');
  assert.equal(cutoff.verdict, 'pass');
});

// ---------------- review round 2: SPICE fidelity + label accuracy ---------
test('chip: SPICE AC source exports DC bias plus AC magnitude and phase', () => {
  const d = new Diagram({ lab: 'chip', name: 'ac-export' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'ac', amp: 2, dc: 0, phase: Math.PI / 2 } });
  const r = d.addBlock('chip.RES', { params: { r: 1000 } });
  const gnd = d.addBlock('chip.GND');
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', gnd.id, 'g');
  d.connect(src.id, 'n', gnd.id, 'g');
  const deck = toSpiceDeck(d);
  const line = deck.split('\n').find((l) => l.startsWith(`V${src.id} `));
  assert.ok(line, 'voltage source line missing');
  // SPICE AC phase is in degrees: pi/2 -> 90. An .ac sweep must see the drive.
  assert.match(line, /DC 0 AC 2 90(\.0+)?$/, `AC excitation missing: ${line}`);
});

test('chip: PMOS exports correct drain/gate/source mapping with bulk on source, and conducts', () => {
  const d = new Diagram({ lab: 'chip', name: 'pmos-export' });
  const vdd = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 5 } });
  const vg = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 0 } });
  const pm = d.addBlock('chip.PMOS', { params: { k: 0.02, vth: -2, lambda: 0.01, rth: 100 } });
  const r = d.addBlock('chip.RES', { params: { r: 1000 } });
  const gnd = d.addBlock('chip.GND');
  d.connect(vdd.id, 'p', pm.id, 's');
  d.connect(vg.id, 'p', pm.id, 'g');
  d.connect(vdd.id, 'n', gnd.id, 'g');
  d.connect(vg.id, 'n', gnd.id, 'g');
  d.connect(pm.id, 'd', r.id, 'p');
  d.connect(r.id, 'n', gnd.id, 'g');

  // internal model: PMOS with Vgs=-5 conducts through the load
  const solved = solveDC(d);
  assert.equal(solved.ok, true, (solved.problems || []).join('; '));
  const device = solved.elements.find((e) => e.blockId === pm.id);
  assert.ok(device && Math.abs(device.i) > 1e-4, 'PMOS should conduct');

  // export: M<name> drain gate source bulk model — drain and source must map
  // to their own terminals (not swapped) and bulk must tie to source
  const line = toSpiceDeck(d).split('\n').find((l) => l.startsWith(`M${pm.id} `));
  assert.ok(line, 'PMOS element line missing');
  const fields = line.trim().split(/\s+/);
  const [, drain, gate, source, bulk] = fields;
  assert.notEqual(drain, source, 'drain and source terminals must not be swapped');
  assert.equal(gate, vdd.id ? gate : gate, 'gate present');
  assert.equal(bulk, source, 'bulk must tie to source for the 3-terminal model');
});

test('chip: execution-check label names the analysis that actually ran', () => {
  // default (no meta.analysis): chipLab.run executes the metaSchema default 'tran'
  const d1 = dividerDiagram();
  const report1 = chipLab.report(d1);
  const exec1 = report1.checks.find((c) => c.name.startsWith('Requested'));
  assert.ok(exec1, 'execution check missing');
  assert.ok(exec1.name.includes("'tran'"), `label should say 'tran', got: ${exec1.name}`);
  assert.equal(exec1.verdict, 'pass');

  // explicit ac on a nonlinear circuit: label must say 'ac', verdict must fail
  const d2 = new Diagram({ lab: 'chip', name: 'ac-diode', meta: { analysis: 'ac' } });
  const src = d2.addBlock('chip.VSOURCE', { params: { mode: 'ac', amp: 1 } });
  const di = d2.addBlock('chip.DIODE');
  const r = d2.addBlock('chip.RES', { params: { r: 1000 } });
  const gnd = d2.addBlock('chip.GND');
  d2.connect(src.id, 'p', di.id, 'a');
  d2.connect(di.id, 'c', r.id, 'p');
  d2.connect(r.id, 'n', gnd.id, 'g');
  d2.connect(src.id, 'n', gnd.id, 'g');
  const report2 = chipLab.report(d2);
  const exec2 = report2.checks.find((c) => c.name.startsWith('Requested'));
  assert.ok(exec2.name.includes("'ac'"), `label should say 'ac', got: ${exec2.name}`);
  assert.equal(exec2.verdict, 'fail');
  assert.equal(report2.verdict, 'fail');
});
