// WP-3.1 — golden-fixture generator for the ep-logic parity oracles.
//
// Runs the ACTUAL Phase 0 engine (`js/labs/logic/engine.js` + EventQueue)
// on the parity benches and records, per bench:
//   - the diagram (blocks/wires/options) the Rust side must rebuild,
//   - ok/problems/warnings (exact strings, order included),
//   - probe records {times, values, label},
//   - stats {events, maxTime, radix},
//   - the full event POP order (time, type, blockId, portId, value) — the
//     "identical event order" oracle required by 03_PHYSICS §5.
//
// The four verified SKY130A Q4 cells + the named ternary cells are not part
// of the Phase 0 component library, so this generator registers JS mirror
// components whose eval functions are the digital-domain semantics of the
// VERIFIED candidate designs (designs/stage-m/q4-candidates/*.spice, the
// 03/08 reference JSONs) — the queue, engine, and ordering stay the real
// Phase 0 code paths, so Q4-bench event order is still engine-authentic.
//
// Usage: node crates/ep-kernel/ep-logic/tests/generate_fixtures.mjs
// Fixtures are committed; cargo test never needs node.
import { runLogic, Z } from '../../../../js/labs/logic/engine.js';
import '../../../../js/labs/logic/components.js';
import { EventQueue } from '../../../../js/core/events.js';
import { registerComponent, getComponent } from '../../../../js/core/registry.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// ---- mirror components for the verified multi-radix cells -----------------
// Digital-domain semantics of the Phase 0 verified cells (designs/stage-m/
// q4-candidates/*.spice + data/reference-library/03 + 08). Kept in ONE place
// (here) so the Rust mirrors can be compared against them line by line.
const CELL_PROVENANCE = 'Digital-domain mirror of the verified Q4/ternary cell functions (designs/stage-m/q4-candidates + 03/08 reference JSONs). Registered ONLY by this fixture generator to drive the real Phase 0 engine over Q4 benches.';

function cellGate(typeId, ports, evalFn) {
  registerComponent({
    typeId, lab: 'logic', category: 'KernelCells', label: typeId, desc: CELL_PROVENANCE,
    params: [{ key: 'delay', label: 'Gate delay (ticks)', type: 'number', default: 10, noTolRequired: true }],
    ports: () => ports,
    logic: { eval: evalFn },
    validation: { provenance: CELL_PROVENANCE },
  });
}

const portsOfKind = (ins, outs) => [
  ...ins.map((id) => ({ id, name: id.toUpperCase(), dir: 'in', type: 'logic' })),
  ...outs.map((id) => ({ id, name: id.toUpperCase(), dir: 'out', type: 'logic' })),
];
const allDigits = (inputs, keys) => keys.every((k) => inputs[k] !== 'Z');

// q4_thresh_det: analogue→nearest-Q4-digit detector. At the logic level a
// valid Q4 level re-partitions to itself (the analogue bridge lives in
// ep-logic::radix, tested against 03 JSON nominal midpoints).
cellGate('kernel.q4_thresh_det', portsOfKind(['a'], ['y']), (ctx, inputs) => {
  if (inputs.a === 'Z') return { y: 'Z' };
  return { y: inputs.a };
});
// q4_inv: Q_out = 3 − Q_in (verified SPICE + 03 equations).
cellGate('kernel.q4_inv', portsOfKind(['a'], ['y']), (ctx, inputs) => {
  if (inputs.a === 'Z') return { y: 'Z' };
  return { y: 3 - inputs.a };
});
// q4_mux4: out = d[sel] — single quaternary selector digit (verified
// candidate netlist: .subckt q4_mux4 sel d0 d1 d2 d3 out — thermometer
// decode S0=!t1, S1=t1&&!t2, S2=t2&&!t3, S3=t3).
cellGate('kernel.q4_mux4', portsOfKind(['sel', 'd0', 'd1', 'd2', 'd3'], ['y']), (ctx, inputs) => {
  const { sel, d0, d1, d2, d3 } = inputs;
  if ([sel, d0, d1, d2, d3].some((v) => v === 'Z')) return { y: 'Z' };
  const data = [d0, d1, d2, d3];
  // Selector digit beyond the 4:1 contract → honest undefined selection.
  return { y: sel < 4 ? data[sel] : 'Z' };
});
// q4_half_adder: S = (A+B) mod 4, C = floor((A+B)/4) (carry digit 0/1).
cellGate('kernel.q4_half_adder', portsOfKind(['a', 'b'], ['sum', 'carry']), (ctx, inputs) => {
  const { a, b } = inputs;
  if (!allDigits(inputs, ['a', 'b'])) return { sum: 'Z', carry: 'Z' };
  const t = a + b;
  return { sum: t % 4, carry: Math.floor(t / 4) };
});
// ternary_inv: 2 − Q (08 JSON ternary_cells).
cellGate('kernel.ternary_inv', portsOfKind(['a'], ['y']), (ctx, inputs) => {
  if (inputs.a === 'Z') return { y: 'Z' };
  return { y: 2 - inputs.a };
});
// ternary_half_adder: S = (A+B) mod 3, C = floor((A+B)/3).
cellGate('kernel.ternary_half_adder', portsOfKind(['a', 'b'], ['sum', 'carry']), (ctx, inputs) => {
  const { a, b } = inputs;
  if (!allDigits(inputs, ['a', 'b'])) return { sum: 'Z', carry: 'Z' };
  const t = a + b;
  return { sum: t % 3, carry: Math.floor(t / 3) };
});

// ---- event-order capture ---------------------------------------------------
let capturedEvents = null;
const origPop = EventQueue.prototype.pop;
EventQueue.prototype.pop = function () {
  const ev = origPop.call(this);
  if (ev && capturedEvents) {
    const p = ev.payload;
    capturedEvents.push(
      p.type === 'callback'
        ? { time: ev.time, type: 'callback' }
        : { time: ev.time, type: 'input', blockId: p.blockId, portId: p.portId, value: p.value }
    );
  }
  return ev;
};

// ---- diagram builder (explicit ids for determinism) ------------------------
class Diagram {
  constructor(radix, opts = {}) {
    this.meta = { radix };
    this.blocks = [];
    this.wires = [];
    this.maxEvents = opts.maxEvents ?? 250000;
    this.maxTicks = opts.maxTicks ?? 4000;
  }
  add(type, id, params = {}) {
    const def = getComponent(type);
    const full = {};
    for (const p of def.params || []) full[p.key] = p.default;
    Object.assign(full, params);
    this.blocks.push({ id, type, params: full });
    return id;
  }
  connect(fromBlock, fromPort, toBlock, toPort) {
    this.wires.push({ from: { block: fromBlock, port: fromPort }, to: { block: toBlock, port: toPort } });
  }
  driversOf(blockId, portId) {
    return this.wires
      .filter((w) => w.to.block === blockId && w.to.port === portId)
      .filter((w) => this.blocks.some((b) => b.id === w.from.block));
  }
  toPlain() {
    return {
      radix: this.meta.radix,
      blocks: this.blocks.map((b) => ({ id: b.id, type: b.type, params: b.params })),
      wires: this.wires.map((w) => ({ from: w.from, to: w.to })),
    };
  }
}

function runBench(name, diagram) {
  capturedEvents = [];
  const res = runLogic(diagram, { maxEvents: diagram.maxEvents, maxTicks: diagram.maxTicks });
  const events = capturedEvents;
  capturedEvents = null;
  return {
    bench: name,
    diagram: diagram.toPlain(),
    options: { maxEvents: diagram.maxEvents, maxTicks: diagram.maxTicks },
    expected: {
      ok: res.ok,
      problems: res.problems,
      warnings: res.warnings,
      probes: res.probes,
      stats: res.stats,
      eventOrder: events,
    },
  };
}

// ---- benches (mirror tests/core.test.mjs + Q4/ternary kernel benches) -----
const benches = [];

// 1. Q4 full adder 3 + 2 = 11(base-4) (core.test.mjs scenario).
{
  const d = new Diagram(4);
  d.add('logic.IN', 'A', { value: 3, name: 'A' });
  d.add('logic.IN', 'B', { value: 2, name: 'B' });
  d.add('logic.CONST', 'CIN', { value: 0 });
  d.add('logic.ADDN', 'ADD');
  d.add('logic.PROBE', 'PSUM', { name: 'SUM' });
  d.add('logic.PROBE', 'PCOUT', { name: 'COUT' });
  d.connect('A', 'out', 'ADD', 'a');
  d.connect('B', 'out', 'ADD', 'b');
  d.connect('CIN', 'out', 'ADD', 'cin');
  d.connect('ADD', 'sum', 'PSUM', 'in');
  d.connect('ADD', 'cout', 'PCOUT', 'in');
  benches.push(runBench('q4_full_adder', d));
}

// 2. Q4 ripple adder, 2 digits: 23 + 32 = 121 (base 4).
{
  const d = new Diagram(4);
  d.add('logic.ADDN', 'ADD0');
  d.add('logic.ADDN', 'ADD1');
  d.add('logic.IN', 'A0', { value: 2, name: 'd00' });
  d.add('logic.IN', 'B0', { value: 3, name: 'd01' });
  d.add('logic.IN', 'A1', { value: 3, name: 'd10' });
  d.add('logic.IN', 'B1', { value: 2, name: 'd11' });
  d.add('logic.CONST', 'CIN0', { value: 0 });
  d.add('logic.PROBE', 'S0', { name: 'S0' });
  d.add('logic.PROBE', 'S1', { name: 'S1' });
  d.add('logic.PROBE', 'COUT', { name: 'Cout' });
  d.connect('A0', 'out', 'ADD0', 'a');
  d.connect('B0', 'out', 'ADD0', 'b');
  d.connect('CIN0', 'out', 'ADD0', 'cin');
  d.connect('A1', 'out', 'ADD1', 'a');
  d.connect('B1', 'out', 'ADD1', 'b');
  d.connect('ADD0', 'cout', 'ADD1', 'cin');
  d.connect('ADD0', 'sum', 'S0', 'in');
  d.connect('ADD1', 'sum', 'S1', 'in');
  d.connect('ADD1', 'cout', 'COUT', 'in');
  benches.push(runBench('q4_ripple_2digit', d));
}

// 3. Ternary gate bench: AND/OR/XOR/NOT chains + ternary half adder.
{
  const d = new Diagram(3);
  d.add('logic.IN', 'A', { value: 2, name: 'A' });
  d.add('logic.IN', 'B', { value: 1, name: 'B' });
  d.add('logic.AND', 'AND');
  d.add('logic.OR', 'OR');
  d.add('logic.XOR', 'XOR');
  d.add('logic.NOT', 'NOTA');
  d.add('kernel.ternary_half_adder', 'THA');
  d.add('kernel.ternary_inv', 'TINV');
  d.add('logic.PROBE', 'PAND', { name: 'AND' });
  d.add('logic.PROBE', 'POR', { name: 'OR' });
  d.add('logic.PROBE', 'PXOR', { name: 'XOR' });
  d.add('logic.PROBE', 'PNOTA', { name: 'NOTA' });
  d.add('logic.PROBE', 'PTHA_S', { name: 'THA_SUM' });
  d.add('logic.PROBE', 'PTHA_C', { name: 'THA_CARRY' });
  d.add('logic.PROBE', 'PTINV', { name: 'TINV' });
  d.connect('A', 'out', 'AND', 'a');
  d.connect('B', 'out', 'AND', 'b');
  d.connect('A', 'out', 'OR', 'a');
  d.connect('B', 'out', 'OR', 'b');
  d.connect('A', 'out', 'XOR', 'a');
  d.connect('B', 'out', 'XOR', 'b');
  d.connect('A', 'out', 'NOTA', 'a');
  d.connect('A', 'out', 'THA', 'a');
  d.connect('B', 'out', 'THA', 'b');
  d.connect('B', 'out', 'TINV', 'a');
  d.connect('AND', 'y', 'PAND', 'in');
  d.connect('OR', 'y', 'POR', 'in');
  d.connect('XOR', 'y', 'PXOR', 'in');
  d.connect('NOTA', 'y', 'PNOTA', 'in');
  d.connect('THA', 'sum', 'PTHA_S', 'in');
  d.connect('THA', 'carry', 'PTHA_C', 'in');
  d.connect('TINV', 'y', 'PTINV', 'in');
  benches.push(runBench('ternary_gates_bench', d));
}

// 4. Binary DFF + CLOCK (core.test.mjs scenario: first rising edge t=50).
{
  const d = new Diagram(2, { maxTicks: 400 });
  d.add('logic.IN', 'D', { value: 1, name: 'D' });
  d.add('logic.CLOCK', 'CLK', { period: 100, duty: 0.5 });
  d.add('logic.DFF', 'F', { tco: 5, init: 0 });
  d.add('logic.PROBE', 'Q', { name: 'Q' });
  d.connect('D', 'out', 'F', 'd');
  d.connect('CLK', 'out', 'F', 'clk');
  d.connect('F', 'q', 'Q', 'in');
  benches.push(runBench('binary_dff_clock', d));
}

// 5. Binary MUX2 + CMPN bench.
{
  const d = new Diagram(2);
  d.add('logic.IN', 'SEL', { value: 0, name: 'SEL' });
  d.add('logic.IN', 'DA', { value: 0, name: 'A' });
  d.add('logic.IN', 'DB', { value: 1, name: 'B' });
  d.add('logic.IN', 'CA', { value: 1, name: 'CA' });
  d.add('logic.IN', 'CB', { value: 1, name: 'CB' });
  d.add('logic.MUX2', 'MUX');
  d.add('logic.CMPN', 'CMP');
  d.add('logic.PROBE', 'PMUX', { name: 'MUX' });
  d.add('logic.PROBE', 'PGT', { name: 'GT' });
  d.add('logic.PROBE', 'PEQ', { name: 'EQ' });
  d.connect('SEL', 'out', 'MUX', 'sel');
  d.connect('DA', 'out', 'MUX', 'a');
  d.connect('DB', 'out', 'MUX', 'b');
  d.connect('CA', 'out', 'CMP', 'a');
  d.connect('CB', 'out', 'CMP', 'b');
  d.connect('MUX', 'y', 'PMUX', 'in');
  d.connect('CMP', 'gt', 'PGT', 'in');
  d.connect('CMP', 'eq', 'PEQ', 'in');
  benches.push(runBench('binary_mux_cmp', d));
}

// 6. Q4 kernel-cell bench: mux4 + inv + thresh_det (verified cell mirrors).
{
  const d = new Diagram(4);
  d.add('logic.IN', 'SEL', { value: 1, name: 'SEL' });
  d.add('logic.CONST', 'D0', { value: 0 });
  d.add('logic.IN', 'D1', { value: 2, name: 'D1' });
  d.add('logic.CONST', 'D2', { value: 0 });
  d.add('logic.CONST', 'D3', { value: 0 });
  d.add('logic.IN', 'X', { value: 1, name: 'X' });
  d.add('logic.IN', 'TD', { value: 2, name: 'TD' });
  d.add('kernel.q4_mux4', 'MUX4');
  d.add('kernel.q4_inv', 'INV');
  d.add('kernel.q4_thresh_det', 'DET');
  d.add('logic.PROBE', 'PMUX4', { name: 'MUX4' });
  d.add('logic.PROBE', 'PINV', { name: 'INV' });
  d.add('logic.PROBE', 'PDET', { name: 'DET' });
  d.connect('SEL', 'out', 'MUX4', 'sel');
  d.connect('D0', 'out', 'MUX4', 'd0');
  d.connect('D1', 'out', 'MUX4', 'd1');
  d.connect('D2', 'out', 'MUX4', 'd2');
  d.connect('D3', 'out', 'MUX4', 'd3');
  d.connect('X', 'out', 'INV', 'a');
  d.connect('TD', 'out', 'DET', 'a');
  d.connect('MUX4', 'y', 'PMUX4', 'in');
  d.connect('INV', 'y', 'PINV', 'in');
  d.connect('DET', 'y', 'PDET', 'in');
  benches.push(runBench('q4_cells_bench', d));
}

// 7. Z propagation + unconnected-input warning (core.test.mjs scenario).
{
  const d = new Diagram(2);
  d.add('logic.AND', 'ANDG');
  d.add('logic.PROBE', 'PY', { name: 'Y' });
  d.connect('ANDG', 'y', 'PY', 'in');
  benches.push(runBench('z_unconnected', d));
}

// 8. Contention: two drivers on one input (core.test.mjs scenario).
{
  const d = new Diagram(2);
  d.add('logic.IN', 'I1', { value: 0 });
  d.add('logic.IN', 'I2', { value: 1 });
  d.add('logic.PROBE', 'P', { name: 'P' });
  d.connect('I1', 'out', 'P', 'in');
  d.connect('I2', 'out', 'P', 'in');
  benches.push(runBench('contention', d));
}

// 9. Q4 half adder bench (verified cell): 3 + 2 → S=1, C=1.
{
  const d = new Diagram(4);
  d.add('logic.IN', 'A', { value: 3, name: 'A' });
  d.add('logic.IN', 'B', { value: 2, name: 'B' });
  d.add('kernel.q4_half_adder', 'HA');
  d.add('logic.PROBE', 'PS', { name: 'SUM' });
  d.add('logic.PROBE', 'PC', { name: 'CARRY' });
  d.connect('A', 'out', 'HA', 'a');
  d.connect('B', 'out', 'HA', 'b');
  d.connect('HA', 'sum', 'PS', 'in');
  d.connect('HA', 'carry', 'PC', 'in');
  benches.push(runBench('q4_half_adder_bench', d));
}

// ---- write -----------------------------------------------------------------
let commit = 'unknown';
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* offline */ }

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
mkdirSync(outDir, { recursive: true });
for (const b of benches) {
  const payload = {
    generatedBy: 'crates/ep-kernel/ep-logic/tests/generate_fixtures.mjs — Phase 0 js/labs/logic engine (oracle, 03_PHYSICS §5)',
    engineSourceCommit: commit,
    oracle: 'js/labs/logic/engine.js + js/core/events.js (EventQueue (time, seq) order)',
    ...b,
  };
  const file = path.join(outDir, `${b.bench}.json`);
  writeFileSync(file, JSON.stringify(payload, null, 1) + '\n');
  console.log(`wrote ${file}: events=${b.expected.stats.events} maxTime=${b.expected.stats.maxTime} warnings=${b.expected.warnings.length}`);
}
console.log('restored EventQueue.pop:', EventQueue.prototype.pop !== origPop);
