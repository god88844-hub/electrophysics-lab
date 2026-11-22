// WP-2.5 — Direct 3D schematic editing + Manhattan routing on kernel netlists.
//
// These tests run the REAL pure modules (no mocks of the math):
//   - `apps/electrophysics-3d/src/bays/silicon/kernelNetlist.mjs` — the
//     ep-circuit-compatible compile layer (wire→pin translation, ρ(T)·L/(w·t)
//     copper parasitics, Pi-model C, netlist mirror, fail-closed admission).
//   - `packages/physics-engine/src/sandbox.mjs` + `mna.mjs` — the actual
//     compiler + DC solver the bench feeds (proving routed wires + parasitics
//     enter the solve).
//   - `apps/electrophysics-3d/src/state/history.ts` — the WP-1.4 command
//     stack (import-free, data-URL contract) with the enhanced ctx semantics
//     the WP-2.5 controller installs (real `setWires` on undo/redo).
// Constants are read from the SHA-256-sealed reference vault exactly like the
// app reads them.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url)); // repo root (this file lives in tests/)

const semiJson = JSON.parse(
  readFileSync(join(ROOT, 'data', 'reference-library', '02_semiconductor_pdk_silicon.json'), 'utf8'),
);
const constantsJson = JSON.parse(
  readFileSync(join(ROOT, 'data', 'reference-library', '01_fundamental_constants.json'), 'utf8'),
);

const CONSTS = {
  copper: semiJson.material_properties.copper,
  siliconDioxide: semiJson.material_properties.silicon_dioxide,
  metalStack: semiJson.parameters.sky130a.metal_stack,
  oxideThickness: semiJson.parameters.sky130a.oxide_thickness_nm,
  vacuumPermittivity: constantsJson.parameters.vacuum_permittivity.value,
};

const kn = await import('../apps/electrophysics-3d/src/bays/silicon/kernelNetlist.mjs');
const { compileSandbox, traceResistance } = await import('../packages/physics-engine/src/sandbox.mjs');
const { solveDC } = await import('../packages/physics-engine/src/mna.mjs');

// WP-1.4 history — import-free TS module loaded via the data-URL contract.
const HISTORY_TS = join(ROOT, 'apps', 'electrophysics-3d', 'src', 'state', 'history.ts');
const historySource = readFileSync(HISTORY_TS, 'utf8');
assert.ok(!/^\s*import\s/m.test(historySource), 'history.ts must remain import-free (WP-1.4 contract)');
const H = await import('data:text/javascript;base64,' + Buffer.from(historySource).toString('base64'));

test('WP-2.5: reference constants validate (fail-closed on missing fields)', () => {
  assert.equal(kn.validateReferenceConstants(CONSTS), true);
  for (const key of Object.keys(CONSTS)) {
    const broken = { ...CONSTS, [key]: undefined };
    assert.throws(() => kn.validateReferenceConstants(broken), /reference constants missing/, key);
  }
  // The sealed vault carries the exact values the parasitic math relies on.
  assert.equal(CONSTS.copper.resistivity_ohm_m_at_300K, 1.68e-8);
  assert.equal(CONSTS.copper.tcr_per_k, 0.0039);
  assert.equal(CONSTS.metalStack.met2.thickness_nm, 845);
  assert.equal(CONSTS.siliconDioxide.dielectric_constant, 3.9);
  assert.equal(CONSTS.oxideThickness.field_oxide, 420);
  assert.equal(CONSTS.vacuumPermittivity, 8.8541878128e-12);
});

test('WP-2.5: copper trace parasitics follow R = ρ(T)·L/(w·t) with the 02-JSON TCR', () => {
  const L = 1.4; // scene units (µm) — e.g. one bench grid diagonal
  const par300 = kn.traceParasitics({ lengthUm: L, tempK: 300 }, CONSTS);
  // Independent recomputation of the ρ(T)·L/(w·t) contract (met2 copper):
  const w = kn.TRACE_ROUTE_WIDTH_UM;
  const t = CONSTS.metalStack.met2.thickness_nm / 1000;
  const expectedR300 = (1.68e-8 * (L * 1e-6)) / (w * 1e-6 * t * 1e-6);
  assert.ok(Math.abs(par300.resistanceOhm - expectedR300) < 1e-12, `R(300K) ${par300.resistanceOhm} vs ${expectedR300}`);
  assert.equal(par300.widthUm, w);
  assert.equal(par300.thicknessUm, t);
  assert.equal(par300.rhoT, 1.68e-8, 'ρ(300 K) = ρ₀ (sealed reference temperature)');

  // TCR law: ρ(T) = ρ₀·(1 + α·(T − 300 K)) — same law as the solver's rail.
  const par350 = kn.traceParasitics({ lengthUm: L, tempK: 350 }, CONSTS);
  assert.ok(
    Math.abs(par350.resistanceOhm / par300.resistanceOhm - 1.195) < 1e-12,
    'R(350 K)/R(300 K) = 1 + 0.0039·50 = 1.195',
  );
  assert.ok(par350.rhoT > par300.rhoT, 'copper ρ rises with temperature (PTC)');

  // Pi-model shunt capacitance: C = ε₀·ε_r·w·L/d over the field oxide.
  const expectedC = 8.8541878128e-12 * 3.9 * ((w * L * 1e-12) / (0.42 * 1e-6));
  assert.ok(
    Math.abs(par300.capacitanceFarads - expectedC) < 1e-21,
    `C ${par300.capacitanceFarads} vs ${expectedC}`,
  );
  assert.equal(par300.halfCapacitanceFarads, par300.capacitanceFarads / 2, 'Pi split: C/2 per end');

  // Zero/negative/NaN length refused (fail-closed).
  for (const bad of [0, -1, NaN]) {
    assert.throws(() => kn.traceParasitics({ lengthUm: bad, tempK: 300 }, CONSTS), /length/);
  }
});

test('WP-2.5: wire pin resolution is kind-aware (junction terminals)', () => {
  const comp = (kind, nodes) => ({ id: kind + '_x', kind, nodes, position: [0, 0] });
  assert.equal(kn.wirePinNode(comp('rail', ['vdd'])), 'vdd');
  assert.equal(kn.wirePinNode(comp('gnd', ['gnd'])), 'gnd');
  assert.equal(kn.wirePinNode(comp('resistor', ['drain', 'gnd'])), 'drain', 'resistor lands on its driven terminal');
  assert.equal(kn.wirePinNode(comp('nmos', ['gate', 'drain', 'gnd'])), 'drain');
  assert.equal(kn.wirePinNode(comp('pmos', ['gate', 'drain', 'vdd'])), 'drain');
  assert.equal(kn.wirePinNode(comp('q4_inv', ['in', 'out', 'vdd'])), 'out');
  assert.equal(kn.wirePinNode(comp('trace', ['vdd', 'mid'])), 'mid');
  assert.equal(kn.wirePinNode({ id: 'x', kind: 'mystery', nodes: ['a'] }), 'a', 'single-pin fallback');
  assert.equal(kn.wirePinNode({ id: 'x', kind: 'mystery', nodes: [] }), null);
  assert.equal(kn.wirePinNode(null), null);
});

test('WP-2.5: routed wires derive copper trace elements; degenerate routes degrade honestly', () => {
  const comps = [
    { id: 'rail1', kind: 'rail', params: { V: 1.8 }, nodes: ['vdd'], position: [0.2, 0.2] },
    { id: 'rload1', kind: 'resistor', params: { R: 100000 }, nodes: ['drain', 'gnd'], position: [1.2, 0.6] },
    { id: 'nmos1', kind: 'nmos', nodes: ['gate', 'drain', 'gnd'], position: [2.2, 0.6] },
  ];
  const tempK = 300;

  // Distinct pins → real copper trace with exact ρ(T) parasitics.
  const derived = kn.deriveTraceComponents([{ from: 'rail1', to: 'rload1' }], comps, CONSTS, tempK);
  assert.equal(derived.traceComponents.length, 1, 'one copper trace element');
  const tc = derived.traceComponents[0];
  assert.equal(tc.kind, 'trace');
  assert.deepEqual(tc.nodes, ['vdd', 'drain'], 'trace spans the two pin nodes');
  assert.equal(tc.params.tempK, tempK);
  const par = derived.parasitics[0];
  assert.equal(par.traceId, tc.id);
  // sheetR reproduces R(T) exactly through the compiler's R = sheetR·L/W.
  assert.ok(
    Math.abs(traceResistance(tc.params) - par.resistanceOhm) < 1e-12,
    `sheetR·L/W ${traceResistance(tc.params)} must equal ρ(T)·L/(w·t) ${par.resistanceOhm}`,
  );
  // Length is the Manhattan route length in scene units (µm).
  const expectedLen =
    Math.abs(1.2 - 0.2) * kn.BENCH_TO_WORLD_X + Math.abs(0.6 - 0.2) * kn.BENCH_TO_WORLD_Z;
  assert.ok(Math.abs(par.lengthUm - expectedLen) < 1e-12);

  // Same-name pins are already ideally merged by the name-based netlist —
  // reported as ideal wires, no resistive element between identical nodes.
  const same = kn.deriveTraceComponents([{ from: 'rload1', to: 'nmos1' }], comps, CONSTS, tempK);
  assert.equal(same.traceComponents.length, 0, 'no trace between identical node names');
  assert.equal(same.idealWires.length, 1);
  assert.deepEqual(same.idealWires[0].pinA, 'drain');
  assert.deepEqual(same.idealWires[0].pinB, 'drain');

  // Dangling / malformed wires are dropped with reasons (never silently).
  const bad = kn.deriveTraceComponents(
    [
      { from: 'ghost', to: 'rload1' },
      { from: 'rload1', to: 'ghost' },
      null,
      { from: 'rail1', to: 'rload1' },
      { from: 'rail1', to: 'rload1' }, // duplicate — deduped
    ],
    comps,
    CONSTS,
    tempK,
  );
  assert.equal(bad.droppedWires.length, 3, 'two dangling + one malformed dropped');
  assert.match(bad.droppedWires[0].reason, /endpoint missing/);
  assert.match(bad.droppedWires[1].reason, /endpoint missing/);
  assert.match(bad.droppedWires[2].reason, /malformed/);
  assert.equal(bad.traceComponents.length, 1, 'dedup keeps one valid trace');
});

test('WP-2.5: ep-circuit-compatible netlist mirror matches the kernel element model', () => {
  const spec = {
    components: [
      { id: 'rail1', kind: 'rail', params: { V: 1.8 }, nodes: ['vdd'], position: [0.2, 0.2] },
      { id: 'mn1', kind: 'nmos', nodes: ['gate', 'drain', 'gnd'], position: [1, 0.5] },
      { id: 'rload1', kind: 'resistor', params: { R: 100000 }, nodes: ['drain', 'gnd'], position: [2, 0.5] },
    ],
    wires: [],
    rails: { vdd: 1.8 },
  };
  const compiled = compileSandbox(spec);
  const mirror = kn.buildKernelNetlistMirror(compiled);
  assert.equal(mirror.format, 'ep-circuit/netlist@1');
  assert.deepEqual(mirror.nodeNames, compiled.netlist.nodeNames);
  assert.equal(mirror.nodeNames[0], 'gnd_sb', 'node index 0 is the ground reference (kernel contract)');
  const kinds = new Set(mirror.elements.map((e) => e.kind));
  for (const k of kinds) assert.ok(['R', 'V', 'I', 'Q'].includes(k), `element kind ${k} is in the kernel R|V|I|Q set`);
  const v = mirror.elements.find((e) => e.kind === 'V');
  assert.equal(v.nodes.length, 3, 'kernel Element.nodes is [usize;3]');
  assert.equal(typeof v.v, 'number');
  const q = mirror.elements.find((e) => e.kind === 'Q');
  assert.ok(q, 'nmos compiled to a Q element');
  assert.equal(q.nodes.length, 3, 'Q nodes = [g, d, s] indices');
  assert.deepEqual(Object.keys(q.mosfet).sort(), ['kp', 'lambda', 'type', 'vth'], 'MosfetParams mirror');
  for (const r of mirror.elements.filter((e) => e.kind === 'R')) {
    assert.equal(typeof r.r, 'number');
    assert.ok(r.nodes[0] >= 0 && r.nodes[1] >= 0 && r.nodes[0] < mirror.nodeNames.length);
  }
  // V-source index and node counts feed the exact ep-core admission request.
  const request = kn.admissionRequestFor(mirror);
  assert.deepEqual(request, {
    domain: 'mna',
    nodes: mirror.nodeNames.length,
    voltageSources: mirror.elements.filter((e) => e.kind === 'V').length,
  });
});

test('WP-2.5: admission mirror matches the ep-core budgets (≤ 64 nodes / ≤ 32 V-sources)', async () => {
  const budgets = { mnaMaxNodes: 64, mnaMaxVoltageSources: 32 };
  assert.equal(kn.checkAdmission({ domain: 'mna', nodes: 64, voltageSources: 32 }, budgets).admitted, true);
  const d65 = kn.checkAdmission({ domain: 'mna', nodes: 65, voltageSources: 0 }, budgets);
  assert.equal(d65.admitted, false);
  assert.match(d65.reason, /65 nodes, budget is ≤ 64/);
  assert.match(d65.reason, /02_SYSTEM_ARCHITECTURE.md §2.3/);
  const d33 = kn.checkAdmission({ domain: 'mna', nodes: 10, voltageSources: 33 }, budgets);
  assert.equal(d33.admitted, false);
  assert.match(d33.reason, /33 voltage sources, budget is ≤ 32/);
  assert.equal(kn.checkAdmission({ domain: 'mna', nodes: NaN }, budgets).admitted, false, 'fail-closed on non-finite');

  // Cross-check against the runtime admission surface (same budgets + verdicts).
  const surface = await import('../apps/electrophysics-3d/src/ui/cad/admissionSurface.mjs');
  for (const req of [
    { domain: 'mna', nodes: 64, voltageSources: 32 },
    { domain: 'mna', nodes: 65, voltageSources: 0 },
    { domain: 'mna', nodes: 5, voltageSources: 33 },
    { domain: 'mna', nodes: 10, voltageSources: 2 },
  ]) {
    assert.equal(
      kn.checkAdmission(req, budgets).admitted,
      surface.admitWorkload(req).admitted,
      `verdict parity for ${JSON.stringify(req)}`,
    );
  }
});

test('WP-2.5: a routed wire carries its ρ(T) parasitic R into the DC solve', () => {
  const comps = [
    { id: 'rail1', kind: 'rail', params: { V: 1.8 }, nodes: ['vdd'], position: [0.2, 0.2] },
    { id: 'rload1', kind: 'resistor', params: { R: 100000 }, nodes: ['drain', 'gnd'], position: [1.4, 0.6] },
  ];
  const derived = kn.deriveTraceComponents([{ from: 'rail1', to: 'rload1' }], comps, CONSTS, 300);
  const spec = {
    components: [...comps, ...derived.traceComponents],
    wires: derived.idealWires.map((w) => ({ from: w.pinA, to: w.pinB })),
    rails: { vdd: 1.8 },
  };
  const compiled = compileSandbox(spec);
  const traceEls = compiled.netlist.elements.filter((e) => e.kind === 'R' && String(e.label ?? '').startsWith('TRACE'));
  assert.equal(traceEls.length, 1, 'exactly one TRACE resistor in the compiled netlist');
  const par = derived.parasitics[0];
  assert.ok(Math.abs(traceEls[0].R - par.resistanceOhm) < 1e-12, 'compiled R equals ρ(T)·L/(w·t)');

  // Node structure: 'vdd' and 'drain' stay SEPARATE nodes joined by the trace.
  assert.ok(compiled.nodeNames.includes('vdd'));
  assert.ok(compiled.nodeNames.includes('drain'));
  assert.notEqual(compiled.nodeNames.indexOf('vdd'), compiled.nodeNames.indexOf('drain'));

  const sol = solveDC(compiled.netlist, { maxNewtonSteps: 40 });
  assert.equal(sol.converged, true);
  const iLoad = 1.8 / (100000 + par.resistanceOhm);
  const expectedDrain = iLoad * 100000;
  const drainIdx = compiled.nodeNames.indexOf('drain');
  const got = sol.nodeVoltages[drainIdx];
  assert.ok(
    Math.abs(got - expectedDrain) < 1e-9,
    `drain ${got} must equal V·RL/(RL+R_trace) = ${expectedDrain}`,
  );
  assert.ok(got < 1.8, 'the copper drop is real (drain strictly below the rail)');
});

test('WP-2.5: undo/redo of a routed wire (WP-1.4 history hookup) removes it from the solve', () => {
  // In-memory ctx mirroring the controller's ENHANCED historyCtx (real setWires)
  // plus the mesh registry — exactly the surface RouteWire commands use.
  const wires = [];
  const meshes = [];
  const ctx = {
    getWires: () => wires,
    setWires: (next) => {
      wires.length = 0;
      wires.push(...next);
    },
    addTraceMesh: (from, to) => meshes.push('trace-' + from + '-' + to),
    removeTraceMesh: (from, to) => {
      const i = meshes.indexOf('trace-' + from + '-' + to);
      if (i >= 0) meshes.splice(i, 1);
    },
    getComponents: () => comps,
    setComponents: (next) => {
      comps.length = 0;
      comps.push(...next);
    },
    setParam: () => {},
    snapshot: () => H.stateHash({ sandboxComponents: comps, wires, vddSlider: 1.8 }),
  };
  const comps = [
    { id: 'rail1', kind: 'rail', params: { V: 1.8 }, nodes: ['vdd'], position: [0.2, 0.2] },
    { id: 'rload1', kind: 'resistor', params: { R: 100000 }, nodes: ['drain', 'gnd'], position: [1.4, 0.6] },
  ];
  const stack = new H.HistoryStack();
  const wire = { from: 'rail1', to: 'rload1' };

  const hashBefore = ctx.snapshot();
  stack.push(H.makeRouteWire('silicon', wire), ctx);
  assert.deepEqual(wires, [wire], 'RouteWire apply commits the wire');
  assert.deepEqual(meshes, ['trace-rail1-rload1'], 'trace mesh added on commit');
  assert.notEqual(ctx.snapshot(), hashBefore);

  stack.undo(ctx);
  assert.deepEqual(wires, [], 'undo reverts the wire (enhanced ctx — real store state)');
  assert.deepEqual(meshes, [], 'undo removes the trace mesh');
  assert.equal(ctx.snapshot(), hashBefore, 'apply → revert state-hash parity (WP-1.4 contract)');

  stack.redo(ctx);
  assert.deepEqual(wires, [wire], 'redo re-applies the wire');
  assert.deepEqual(meshes, ['trace-rail1-rload1']);

  // Dedupe: pushing the same route twice is a no-op.
  stack.push(H.makeRouteWire('silicon', wire), ctx);
  assert.deepEqual(wires, [wire], 'duplicate route not appended');

  // Place/Delete round-trip through the same stack (component commands).
  const extra = { id: 'nmos1', kind: 'nmos', nodes: ['gate', 'drain', 'gnd'], position: [2, 0.6] };
  stack.push(H.makePlaceComponent('silicon', extra), ctx);
  assert.equal(comps.some((c) => c.id === 'nmos1'), true);
  stack.push(H.makeDeleteComponent('silicon', extra), ctx);
  assert.equal(comps.some((c) => c.id === 'nmos1'), false);
  stack.undo(ctx);
  assert.equal(comps.some((c) => c.id === 'nmos1'), true, 'undo restores the deleted component');
  stack.undo(ctx);
  assert.equal(comps.some((c) => c.id === 'nmos1'), false, 'undo removes the placed component');
});

test('WP-2.5: the compile pipeline drops wires and parasitics after undo', () => {
  const comps = [
    { id: 'rail1', kind: 'rail', params: { V: 1.8 }, nodes: ['vdd'], position: [0.2, 0.2] },
    { id: 'rload1', kind: 'resistor', params: { R: 100000 }, nodes: ['drain', 'gnd'], position: [1.4, 0.6] },
  ];
  const tempK = 300;
  const compile = (wires) => {
    const derived = kn.deriveTraceComponents(wires, comps, CONSTS, tempK);
    return compileSandbox({
      components: [...comps, ...derived.traceComponents],
      wires: derived.idealWires.map((w) => ({ from: w.pinA, to: w.pinB })),
      rails: { vdd: 1.8 },
    });
  };
  const wired = compile([{ from: 'rail1', to: 'rload1' }]);
  assert.equal(wired.netlist.elements.filter((e) => e.kind === 'R' && String(e.label).startsWith('TRACE')).length, 1);
  const unwired = compile([]); // after Ctrl+Z the store wire list is empty
  assert.equal(
    unwired.netlist.elements.filter((e) => e.kind === 'R' && String(e.label).startsWith('TRACE')).length,
    0,
    'no TRACE element survives undo',
  );
  const drainIdx = unwired.netlist.nodeNames.indexOf('drain');
  const sol = solveDC(unwired.netlist, { maxNewtonSteps: 40 });
  assert.equal(sol.converged, true);
  assert.equal(sol.nodeVoltages[drainIdx], 0, 'unwired drain node has no source → 0 V');
});
