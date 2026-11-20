import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  compileSandbox,
  starterCircuit,
  traceResistance,
  solveDC,
  evaluateThresholds,
} from '../packages/physics-engine/src/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const failJson = JSON.parse(
  readFileSync(path.join(here, '..', 'data', 'reference-library', '06_failure_physics_thresholds.json'), 'utf8')
);
const TH = {
  vgsThresholdV: failJson.failure_thresholds.gate_oxide_tddb.vgs_threshold_v,
  gammaDecPerV: failJson.failure_thresholds.gate_oxide_tddb.gamma_dec_per_v,
  hardBreakdownV: failJson.parameters.gate_oxide_tddb.hard_breakdown.vgs_irreversible_v,
  cuMeltingC: failJson.failure_thresholds.cu_melting_c,
  fr4DelaminationC: failJson.failure_thresholds.fr4_delamination_c,
  siThermalRunawayC: failJson.failure_thresholds.si_thermal_runaway_c,
  cryoQuench15mkW: failJson.failure_thresholds.cryo_quench_15mk_w,
};

test('sandbox: user-placed divider compiles and MNA solves exactly', () => {
  const spec = {
    rails: { vdd: 1.8 },
    components: [
      { id: 'r1', kind: 'rail', params: { V: 1.8 }, nodes: ['vdd'], position: [0, 0] },
      { id: 't1', kind: 'trace', params: { widthUm: 20, lengthUm: 500 }, nodes: ['vdd', 'mid'], position: [1, 0] },
      { id: 'r2', kind: 'resistor', params: { R: 2000 }, nodes: ['mid', 'gnd'], position: [2, 0] },
    ],
    wires: [{ from: 'vdd', to: 'vdd' }],
  };
  const { netlist, nodeNames, heatAnchors, warnings } = compileSandbox(spec);
  assert.ok(netlist.nNodes >= 3, 'vdd, mid, gnd_sb interned');
  assert.ok(heatAnchors.some((a) => a.kind === 'trace' && a.id === 't1'));
  assert.equal(warnings.some((w) => w.includes('No voltage rail')), false, 'rail present');
  const s = solveDC(netlist);
  assert.equal(s.converged, true);
  // Trace R = 0.125·500/20 = 3.125 Ω → divider: 2000/(3.125+2000)·1.8
  const rTrace = traceResistance({ widthUm: 20, lengthUm: 500 });
  const vMidIdx = nodeNames.indexOf('mid');
  const expected = (2000 / (rTrace + 2000)) * 1.8;
  assert.ok(Math.abs(s.nodeVoltages[vMidIdx] - expected) < 1e-9, `vMid=${s.nodeVoltages[vMidIdx]} vs ${expected}`);
});

test('sandbox: user-built CMOS inverter converges and reports Vgs stress', () => {
  const spec = {
    rails: { vdd: 2.5 },
    components: [
      { id: 'rail1', kind: 'rail', params: { V: 2.5 }, nodes: ['vdd'], position: [0, 0] },
      { id: 'mp', kind: 'pmos', nodes: ['gate', 'drain', 'vdd'], position: [1, 0] },
      { id: 'mn', kind: 'nmos', nodes: ['gate', 'drain', 'gnd'], position: [1, 1] },
      { id: 'rload', kind: 'resistor', params: { R: 100000 }, nodes: ['drain', 'gnd'], position: [2, 0] },
    ],
    wires: [{ from: 'gate', to: 'gate' }],
  };
  const { netlist, nodeNames } = compileSandbox(spec);
  const s = solveDC(netlist);
  assert.equal(s.converged, true);
  // NMOS gate at 0 V (floating→gmin), so vout pulled high by PMOS: Vsg = 2.5 V.
  const voutIdx = nodeNames.indexOf('drain');
  assert.ok(s.nodeVoltages[voutIdx] > 1.5, `vout=${s.nodeVoltages[voutIdx]}`);
  const vgs = s.devicePower['mp.vgs'];
  assert.ok(vgs > TH.vgsThresholdV, `overdrive stress visible: Vgs=${vgs}`);
  const events = evaluateThresholds({ vgsMaxV: vgs, vgsMaxNode: 'mp' }, TH);
  assert.equal(events[0]?.type, 'gate_oxide_breakdown', 'user-built circuit trips the real SOA threshold');
});

test('sandbox: starter circuits compile and solve', () => {
  for (const name of ['q4-half-adder', 'noise-margin-shootout', 'oxide-breakdown', 'trace-fusing']) {
    const spec = starterCircuit(name);
    const { netlist } = compileSandbox(spec);
    const s = solveDC(netlist);
    assert.equal(s.converged, true, `${name} must converge`);
  }
});

test('sandbox: thin trace resistance scales with geometry (fusing demo math)', () => {
  const thin = traceResistance({ widthUm: 3, lengthUm: 800 });
  const wide = traceResistance({ widthUm: 20, lengthUm: 800 });
  assert.ok(Math.abs(thin - (0.125 * 800) / 3) < 1e-9, `thin R=${thin}`);
  assert.ok(thin > wide * 5, `thin trace must be >5× the wide trace resistance (${thin} vs ${wide})`);
  // Fusing demo current: 3 V into thin R (33.3 Ω) + 20 Ω load.
  const i = 3.0 / (thin + 20);
  const p = i * i * thin;
  // One heat cell: ΔT = P/(h·A) with h=40, A=1.6e-7 m² — far past 1085 °C.
  const dT = p / (40 * 1.6e-7);
  assert.ok(dT > 1100, `fusing demo reaches melt: ΔT≈${dT.toFixed(0)} K`);
});

test('sandbox: compiler is pure and deterministic', () => {
  const spec = starterCircuit('noise-margin-shootout');
  const a = compileSandbox(spec);
  const b = compileSandbox(spec);
  assert.deepEqual(a.nodeNames, b.nodeNames);
  assert.deepEqual(
    a.netlist.elements.map((e) => [e.kind, e.label]),
    b.netlist.elements.map((e) => [e.kind, e.label])
  );
});

test('sandbox: unknown component kinds warn, never silently pass', () => {
  const { warnings } = compileSandbox({
    rails: { vdd: 1.8 },
    components: [{ id: 'bad', kind: 'warp_drive', nodes: [], position: [0, 0] }],
    wires: [],
  });
  assert.ok(warnings.some((w) => w.includes('unknown kind')), JSON.stringify(warnings));
});

test('sandbox: no rail → explicit warning (no silent zero-volt pass)', () => {
  const { warnings } = compileSandbox({
    rails: { vdd: 1.8 },
    components: [{ id: 'r1', kind: 'resistor', params: { R: 1000 }, nodes: ['a', 'gnd'], position: [0, 0] }],
    wires: [],
  });
  assert.ok(warnings.some((w) => w.includes('No voltage rail')));
});
