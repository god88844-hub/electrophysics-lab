// components.js — Logic Lab component library (arbitrary radix: 2/3/4+).
//
// Multi-valued logic algebra (documented, exhaustive truth-table tested):
//   AND  = min(a, b)                 OR   = max(a, b)
//   NOT  = (r-1) - v                 NAND = (r-1) - min(a, b)
//   NOR  = (r-1) - max(a, b)         XOR  = (a + b) mod r   (modulo-sum XOR;
//   XNOR = (r-1) - ((a+b) mod r)            for r=2 this is the classic XOR)
// Unknown / high-impedance state 'Z' propagates through every gate: any 'Z'
// input makes every output 'Z'. This is intentional honesty, not laziness —
// an unconnected input is a real design defect and the engine reports it.

import { registerComponent } from '../../core/registry.js';

const GATE_PROVENANCE = 'Ideal multi-valued logic algebra (min/max/mod definitions above); nominal gate delay only, no transistor-level timing. Exhaustively truth-table tested per radix.';

function numParam(key, label, def, extra = {}) {
  return { key, label, type: 'number', default: def, noTolRequired: true, ...extra };
}

/** Standard 2-input gate def factory. fn(a, b, r) -> value. */
function gate2(typeId, label, sym, fn, desc) {
  return {
    typeId, lab: 'logic', category: 'Gates', label, desc,
    params: [numParam('delay', 'Gate delay (ticks)', 10, { min: 0, max: 10000 })],
    ports: () => [
      { id: 'a', name: 'A', dir: 'in', type: 'logic' },
      { id: 'b', name: 'B', dir: 'in', type: 'logic' },
      { id: 'y', name: 'Y', dir: 'out', type: 'logic' },
    ],
    logic: {
      eval(ctx, inputs) {
        const { a, b } = inputs;
        if (a === 'Z' || b === 'Z') return { y: 'Z' };
        return { y: fn(a, b, ctx.radix) };
      },
    },
    draw: sym,
    validation: { provenance: GATE_PROVENANCE },
  };
}

function gate1(typeId, label, sym, fn, desc) {
  return {
    typeId, lab: 'logic', category: 'Gates', label, desc,
    params: [numParam('delay', 'Gate delay (ticks)', 10, { min: 0, max: 10000 })],
    ports: () => [
      { id: 'a', name: 'A', dir: 'in', type: 'logic' },
      { id: 'y', name: 'Y', dir: 'out', type: 'logic' },
    ],
    logic: {
      eval(ctx, inputs) {
        const { a } = inputs;
        if (a === 'Z') return { y: 'Z' };
        return { y: fn(a, ctx.radix) };
      },
    },
    draw: sym,
    validation: { provenance: GATE_PROVENANCE },
  };
}

const defs = [
  // ---- I/O ---------------------------------------------------------------
  {
    typeId: 'logic.IN', lab: 'logic', category: 'I/O', label: 'Input',
    desc: 'Manual input. Drives a constant digit value (0 .. radix-1).',
    params: [
      numParam('value', 'Value', 0, { min: 0, max: 15 }),
      { key: 'name', label: 'Label', type: 'text', default: 'IN' },
    ],
    ports: () => [{ id: 'out', name: 'out', dir: 'out', type: 'logic' }],
    logic: { init(ctx) { return { out: ctx.params.value }; }, eval() { return {}; } },
    draw: 'IN',
    validation: { provenance: 'User-supplied stimulus; models a perfect driver with zero source impedance.' },
  },
  {
    typeId: 'logic.CONST', lab: 'logic', category: 'I/O', label: 'Constant',
    desc: 'Constant digit value (0 .. radix-1).',
    params: [numParam('value', 'Value', 0, { min: 0, max: 15 })],
    ports: () => [{ id: 'out', name: 'out', dir: 'out', type: 'logic' }],
    logic: { init(ctx) { return { out: ctx.params.value }; }, eval() { return {}; } },
    draw: 'C',
    validation: { provenance: 'Ideal constant source.' },
  },
  {
    typeId: 'logic.PROBE', lab: 'logic', category: 'I/O', label: 'Probe',
    desc: 'Waveform probe. Records every value change over simulated time.',
    params: [{ key: 'name', label: 'Label', type: 'text', default: 'P' }],
    ports: () => [{ id: 'in', name: 'in', dir: 'in', type: 'logic' }],
    logic: { eval() { return {}; } },
    draw: 'P',
    validation: { provenance: 'Observation only; does not load the circuit (ideal infinite impedance).' },
  },
  {
    typeId: 'logic.CLOCK', lab: 'logic', category: 'Sequential', label: 'Clock',
    desc: 'Square-wave clock: 0 to (radix-1), configurable period and duty cycle.',
    params: [
      numParam('period', 'Period (ticks)', 100, { min: 2, max: 1e6 }),
      numParam('duty', 'Duty cycle', 0.5, { min: 0.05, max: 0.95 }),
    ],
    ports: () => [{ id: 'out', name: 'clk', dir: 'out', type: 'logic' }],
    logic: {
      eval() { return {}; },
      init(ctx) {
        const period = Math.max(2, Math.round(ctx.params.period));
        const high = ctx.radix - 1;
        const half = Math.max(1, Math.round(period * ctx.params.duty));
        let t = half;
        while (t <= ctx.api.maxTicks + period) {
          const tt = t;
          ctx.api.at(tt, () => ctx.api.emit('out', high));
          ctx.api.at(tt + (period - half), () => ctx.api.emit('out', 0));
          t += period;
        }
        return {};
      },
    },
    draw: 'CLK',
    validation: { provenance: 'Ideal clock source: zero jitter, zero skew. Real clocks jitter; timing-closure conclusions need a jitter budget added externally.' },
  },
  // ---- Gates --------------------------------------------------------------
  gate2('logic.AND', 'AND', '&', (a, b, r) => Math.min(a, b), 'Multi-valued minimum.'),
  gate2('logic.OR', 'OR', '≥1', (a, b, r) => Math.max(a, b), 'Multi-valued maximum.'),
  gate2('logic.NAND', 'NAND', '&̄', (a, b, r) => r - 1 - Math.min(a, b), 'NOT(AND).'),
  gate2('logic.NOR', 'NOR', '≥1̄', (a, b, r) => r - 1 - Math.max(a, b), 'NOT(OR).'),
  gate2('logic.XOR', 'XOR', '=1', (a, b, r) => (a + b) % r, 'Modulo-sum XOR: for r=2 the classic XOR; generalizes as digit-wise addition without carry.'),
  gate2('logic.XNOR', 'XNOR', '=1̄', (a, b, r) => r - 1 - ((a + b) % r), 'NOT(XOR).'),
  gate1('logic.NOT', 'NOT', '1', (a, r) => r - 1 - a, 'Inverter: (radix-1) - v.'),
  gate1('logic.BUF', 'BUF', '▷', (a) => a, 'Buffer (delay + isolation).'),

  // ---- Arithmetic ----------------------------------------------------------
  {
    typeId: 'logic.ADDN', lab: 'logic', category: 'Arithmetic', label: 'Full Adder (radix)',
    desc: 'Radix-r full adder: sum = (a+b+cin) mod r, carry = floor((a+b+cin)/r).',
    params: [numParam('delay', 'Gate delay (ticks)', 10, { min: 0, max: 10000 })],
    ports: () => [
      { id: 'a', name: 'A', dir: 'in', type: 'logic' },
      { id: 'b', name: 'B', dir: 'in', type: 'logic' },
      { id: 'cin', name: 'Cin', dir: 'in', type: 'logic' },
      { id: 'sum', name: 'Sum', dir: 'out', type: 'logic' },
      { id: 'cout', name: 'Cout', dir: 'out', type: 'logic' },
    ],
    logic: {
      eval(ctx, inputs) {
        const { a, b, cin } = inputs;
        if (a === 'Z' || b === 'Z' || cin === 'Z') return { sum: 'Z', cout: 'Z' };
        const t = a + b + cin;
        return { sum: t % ctx.radix, cout: Math.floor(t / ctx.radix) };
      },
    },
    draw: 'Σ',
    validation: { provenance: 'Exact integer arithmetic (a+b+cin decomposition in base r). Verified against reference JS arithmetic for every input combination.' },
  },
  {
    typeId: 'logic.CMPN', lab: 'logic', category: 'Arithmetic', label: 'Compare (radix)',
    desc: 'Digit comparator: gt = a>b, eq = a==b.',
    params: [numParam('delay', 'Gate delay (ticks)', 10, { min: 0, max: 10000 })],
    ports: () => [
      { id: 'a', name: 'A', dir: 'in', type: 'logic' },
      { id: 'b', name: 'B', dir: 'in', type: 'logic' },
      { id: 'gt', name: 'A>B', dir: 'out', type: 'logic' },
      { id: 'eq', name: 'A=B', dir: 'out', type: 'logic' },
    ],
    logic: {
      eval(ctx, inputs) {
        const { a, b } = inputs;
        if (a === 'Z' || b === 'Z') return { gt: 'Z', eq: 'Z' };
        return { gt: a > b ? ctx.radix - 1 : 0, eq: a === b ? ctx.radix - 1 : 0 };
      },
    },
    draw: '><',
    validation: { provenance: 'Exact integer comparison.' },
  },
  {
    typeId: 'logic.MUX2', lab: 'logic', category: 'Arithmetic', label: 'MUX 2:1',
    desc: 'Two-way multiplexer: sel=0 → a, else b.',
    params: [numParam('delay', 'Gate delay (ticks)', 10, { min: 0, max: 10000 })],
    ports: () => [
      { id: 'sel', name: 'Sel', dir: 'in', type: 'logic' },
      { id: 'a', name: 'A (sel=0)', dir: 'in', type: 'logic' },
      { id: 'b', name: 'B (sel≠0)', dir: 'in', type: 'logic' },
      { id: 'y', name: 'Y', dir: 'out', type: 'logic' },
    ],
    logic: {
      eval(ctx, inputs) {
        const { sel, a, b } = inputs;
        if (sel === 'Z' || a === 'Z' || b === 'Z') return { y: 'Z' };
        return { y: sel === 0 ? a : b };
      },
    },
    draw: 'MUX',
    validation: { provenance: 'Ideal multiplexer algebra.' },
  },

  // ---- Sequential ----------------------------------------------------------
  {
    typeId: 'logic.DFF', lab: 'logic', category: 'Sequential', label: 'D Flip-Flop',
    desc: 'Edge-triggered D flip-flop: samples D on rising clock edge (0 → radix-1).',
    params: [
      numParam('tco', 'Clock-to-Q delay (ticks)', 10, { min: 0, max: 10000 }),
      numParam('init', 'Initial Q', 0, { min: 0, max: 15 }),
    ],
    ports: () => [
      { id: 'd', name: 'D', dir: 'in', type: 'logic' },
      { id: 'clk', name: 'CLK', dir: 'in', type: 'logic' },
      { id: 'q', name: 'Q', dir: 'out', type: 'logic' },
    ],
    logic: {
      init(ctx) { ctx.state.lastClk = 0; return { q: ctx.params.init }; },
      eval(ctx, inputs, changed) {
        if (changed.includes('clk')) {
          const rising = ctx.state.lastClk === 0 && inputs.clk === ctx.radix - 1;
          ctx.state.lastClk = inputs.clk;
          if (rising) return { q: inputs.d };
        }
        return {};
      },
    },
    draw: 'DFF',
    validation: { provenance: 'Ideal edge-triggered storage: no setup/hold window modeled. A real flop requires setup/hold margins — flagged as an assumption in reports.' },
  },
];

for (const d of defs) registerComponent(d);
