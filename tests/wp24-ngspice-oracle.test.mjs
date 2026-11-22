import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRANCH_CURRENT_TOLERANCE_A,
  DUMP_FORMAT,
  KCL_TOLERANCE_A,
  NGSPICE_OPTIONS,
  NODE_VOLTAGE_TOLERANCE_V,
  POWER_CONSERVATION_TOLERANCE_W,
  assertDumpProtocol,
  buildDeck,
  findNgspice,
  independentKclMaxResidualA,
  independentPowerSumW,
  parseNgspicePrint,
  runDifferential,
  sourceCurrentVector,
  withinBranchCurrentTolerance,
  withinNodeVoltageTolerance,
} from '../scripts/v4-oracles/ngspice-differential.mjs';

/**
 * WP-2.4 unit suite — the pure functions of the ngspice differential harness
 * (deck building from the dump's own netlist, output parsing, §5 tolerance
 * comparators, independent KCL/power conservation oracles, skip discipline).
 * No ngspice required: these run everywhere (CI + local + Phase 0 gate).
 */

const dividerCase = {
  id: 'divider',
  title: 'Voltage divider',
  description: 'V1 10 V; R1 1 kΩ src→mid; R2 2 kΩ mid→0.',
  netlist: {
    nodes: [
      { name: '0', ground: true, voltage: 0 },
      { name: 'src', ground: false, voltage: 10 },
      { name: 'mid', ground: false, voltage: 6.666666666666667 },
    ],
    elements: [
      { kind: 'V', label: 'V1', nodes: ['src', '0'], v: 10, branchCurrent: -0.0033333333333333335 },
      { kind: 'R', label: 'R1', nodes: ['src', 'mid'], r: 1000 },
      { kind: 'R', label: 'R2', nodes: ['mid', '0'], r: 2000 },
    ],
  },
  solver: { converged: true, iterations: 1, escalated: false, residualNorm: 1e-15 },
  nodeVoltages: { src: 10, mid: 6.666666666666667 },
  deviceCurrents: { V1: -0.0033333333333333335 },
  devicePower: { V1: 0.03333333333333333, R1: 0.011111111111111112, R2: 0.022222222222222223 },
  kclMaxResidualA: 1e-16,
  powerSumW: 1e-18,
};

const inverterCase = {
  id: 'inverter',
  title: 'CMOS inverter DC operating point',
  description: 'VDD 1.8 V; square-law PMOS + NMOS at V_in = 0.9 V.',
  netlist: {
    nodes: [
      { name: '0', ground: true, voltage: 0 },
      { name: 'vdd', ground: false, voltage: 1.8 },
      { name: 'vin', ground: false, voltage: 0.9 },
      { name: 'out', ground: false, voltage: 0.9000000000000001 },
    ],
    elements: [
      { kind: 'V', label: 'VDD', nodes: ['vdd', '0'], v: 1.8, branchCurrent: -0.00042687000045 },
      { kind: 'V', label: 'VIN', nodes: ['vin', '0'], v: 0.9, branchCurrent: 0 },
      {
        kind: 'M',
        label: 'Mp',
        nodes: ['vin', 'out', 'vdd'],
        type: 'P',
        vth: -0.45,
        kp: 0.004,
        lambda: 0.06,
        model: 'shichman-hodges',
        gateShorted: false,
        gateShortR: 0,
        deviceCurrentA: 0.00042687000045000037,
        inIsDrain: false,
      },
      {
        kind: 'M',
        label: 'Mn',
        nodes: ['vin', 'out', '0'],
        type: 'N',
        vth: 0.45,
        kp: 0.004,
        lambda: 0.06,
        model: 'shichman-hodges',
        gateShorted: false,
        gateShortR: 0,
        deviceCurrentA: 0.00042687000045000037,
        inIsDrain: true,
      },
    ],
  },
  solver: { converged: true, iterations: 9, escalated: false, residualNorm: 1e-13 },
  nodeVoltages: { vdd: 1.8, vin: 0.9, out: 0.9000000000000001 },
  deviceCurrents: { VDD: -0.00042687000045, VIN: 0 },
  devicePower: { VDD: 0.00076836600081, VIN: 0, Mp: 0.000384183000405, Mn: 0.000384183000405 },
  kclMaxResidualA: 1.8e-12,
  powerSumW: 0,
};

// ---------------------------------------------------------------------------
// Dump protocol (fail-closed)
// ---------------------------------------------------------------------------

test('dump protocol: valid dump passes; malformed dumps are refused', () => {
  const dump = {
    format: DUMP_FORMAT,
    provenance: 'SIMULATED_ARCHITECTURAL_MODEL',
    cases: Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, kclMaxResidualA: 1e-12 })),
  };
  assert.deepEqual(assertDumpProtocol(dump), []);
  const wrong = [
    { ...dump, format: 'wrong' },
    { ...dump, provenance: 'ORACLE_VERIFIED_AGAINST_NGSPICE' },
    { ...dump, cases: dump.cases.slice(0, 9) },
    { ...dump, cases: dump.cases.map((c, i) => (i === 3 ? { ...c, kclMaxResidualA: undefined } : c)) },
  ];
  for (const w of wrong) assert.ok(assertDumpProtocol(w).length > 0, 'malformed dump refused');
  assert.ok(assertDumpProtocol(null).length > 0);
});

// ---------------------------------------------------------------------------
// Deck building — from the dump's own netlist, never a parallel copy
// ---------------------------------------------------------------------------

test('deck: divider case builds a resistive divider deck with tightened options', () => {
  const { deck, nodes, vSources } = buildDeck(dividerCase);
  assert.ok(deck.includes(NGSPICE_OPTIONS), 'tightened ngspice convergence options');
  assert.ok(deck.includes('V1 src 0 DC 10'));
  assert.ok(deck.includes('R1 src mid 1000'));
  assert.ok(deck.includes('R2 mid 0 2000'));
  assert.ok(deck.includes('print v(mid)'));
  assert.ok(deck.includes(`print ${sourceCurrentVector('V1')}`));
  // `print` is a .control-mode command: it must sit after `op` inside the
  // .control/.endc block (a deck with prints outside .control errors out).
  const lines = deck.split('\n');
  const lineIndex = (text) => lines.findIndex((l) => l === text);
  const controlLine = lineIndex('.control');
  const opLine = lineIndex('op');
  const printLine = lineIndex('print v(mid)');
  assert.ok(controlLine >= 0 && opLine === controlLine + 2, '.control, set noaskquit, then op');
  assert.ok(printLine > opLine, 'prints AFTER op inside the control block');
  assert.ok(lineIndex('.endc') > lineIndex('print i(v1)'), '.endc closes after the prints');
  assert.ok(lines[lines.length - 2] === '.end' && lines[lines.length - 1] === '');
  assert.deepEqual(nodes, ['src', 'mid']);
  assert.deepEqual(vSources, ['V1']);
  assert.equal(sourceCurrentVector('V1'), 'i(v1)', 'ngspice vector name is lowercase');
});

test('deck: MOSFET cases emit LEVEL=1 parity cards (β = KP·W/L folded identically)', () => {
  const { deck } = buildDeck(inverterCase);
  assert.ok(deck.includes('Mp out vin vdd vdd mod_Mp W=1u L=1u'), 'PMOS d g s bulk order (bulk = source)');
  assert.ok(deck.includes('Mn out vin 0 0 mod_Mn W=1u L=1u'), 'NMOS d g s bulk order (bulk = source)');
  assert.ok(
    deck.includes('.MODEL mod_Mp PMOS (LEVEL=1 KP=0.004 VTO=-0.45 LAMBDA=0.06 W=1u L=1u)'),
    'PMOS LEVEL=1 card (signed VTO)',
  );
  assert.ok(
    deck.includes('.MODEL mod_Mn NMOS (LEVEL=1 KP=0.004 VTO=0.45 LAMBDA=0.06 W=1u L=1u)'),
    'NMOS LEVEL=1 card',
  );
});

test('deck: post-breakdown gate short becomes a gate-source resistor', () => {
  const vgate = 1.8 * (100 / 2100); // Rshort (100 Ω) vs Rbias (2 kΩ) divider
  const ibias = (1.8 - vgate) / 2000; // = the gate-short current
  const vout = 1.8; // Mn is off (Vgs ≈ 0 through the short) → no load current
  const breakdown = {
    id: 'breakdown-bias',
    title: 'Post-breakdown gate-short bias point',
    description: 'gate tied to source through 100 Ω',
    netlist: {
      nodes: [
        { name: '0', ground: true, voltage: 0 },
        { name: 'vdd', ground: false, voltage: 1.8 },
        { name: 'vgate', ground: false, voltage: vgate },
        { name: 'out', ground: false, voltage: 1.8 },
      ],
      elements: [
        { kind: 'V', label: 'VDD', nodes: ['vdd', '0'], v: 1.8, branchCurrent: -ibias },
        { kind: 'R', label: 'Rload', nodes: ['vdd', 'out'], r: 10000 },
        {
          kind: 'M',
          label: 'Mn',
          nodes: ['vgate', 'out', '0'],
          type: 'N',
          vth: 0.45,
          kp: 0.004,
          lambda: 0.06,
          model: 'shichman-hodges',
          gateShorted: true,
          gateShortR: 100,
          deviceCurrentA: 0,
          inIsDrain: true,
        },
        { kind: 'R', label: 'Rbias', nodes: ['vdd', 'vgate'], r: 2000 },
      ],
    },
    nodeVoltages: { vdd: 1.8, vgate, out: vout },
    deviceCurrents: { VDD: 0.000984 },
    devicePower: {},
    kclMaxResidualA: 1e-12,
    powerSumW: 0,
  };
  const { deck } = buildDeck(breakdown);
  assert.ok(deck.includes('Rshort_Mn vgate 0 100'), 'gate-short resistor stamp');
});

test('deck: deck-only DC-open capacitor is emitted with its provenance note', () => {
  const rc = {
    ...dividerCase,
    id: 'rc-bleed-bias',
    deckOnly: [
      { kind: 'C', label: 'C1', nodes: ['mid', '0'], c: 1e-9, note: 'capacitor is DC-open' },
    ],
  };
  const { deck } = buildDeck(rc);
  assert.ok(deck.includes('C1 mid 0 1e-9'));
  assert.ok(deck.includes('deck-only (DC-open, from the oracle dump)'));
  assert.ok(deck.includes('capacitor is DC-open'));
});

test('deck: unsupported element kinds are refused fail-closed', () => {
  const bad = {
    ...dividerCase,
    netlist: {
      ...dividerCase.netlist,
      elements: [{ kind: 'X', label: 'X1', nodes: ['src', 'mid'] }],
    },
  };
  assert.throws(() => buildDeck(bad), /unsupported dump element kind/);
  const badOnly = { ...dividerCase, deckOnly: [{ kind: 'L', label: 'L1', nodes: ['src', 'mid'] }] };
  assert.throws(() => buildDeck(badOnly), /unsupported deck-only element kind/);
});

// ---------------------------------------------------------------------------
// ngspice output parsing
// ---------------------------------------------------------------------------

test('parse: scientific-notation print lines parse for every expected vector', () => {
  const stdout = [
    'ngspice-44 compiled from master',
    'v(src) = 1.000000000000000e+01',
    'v(mid) = 6.666666666666666e+00',
    'i(v1) = 3.333333333333333e-03',
  ].join('\n');
  const values = parseNgspicePrint(stdout, ['v(src)', 'v(mid)', 'i(v1)']);
  assert.equal(values.get('v(src)'), 10);
  assert.equal(values.get('v(mid)'), 6.666666666666666);
  assert.equal(values.get('i(v1)'), 0.003333333333333333);
});

test('parse: missing expected vectors throw with the stdout tail (fail-closed)', () => {
  const stdout = 'v(src) = 1.000000000000000e+01';
  assert.throws(
    () => parseNgspicePrint(stdout, ['v(src)', 'v(mid)', 'i(v1)']),
    /missing 2 expected vector.*v\(mid\).*i\(v1\)/,
  );
});

test('parse: exponent forms with capital E and plus signs parse', () => {
  const values = parseNgspicePrint('v(x) = -1.23E+05', ['v(x)']);
  assert.equal(values.get('v(x)'), -123000);
});

// ---------------------------------------------------------------------------
// §5 tolerance comparators (absolute, per the CI Oracle Calibration Table)
// ---------------------------------------------------------------------------

test('tolerances: node V ±1e-6 V and branch currents ±1e-9 A (absolute)', () => {
  assert.equal(NODE_VOLTAGE_TOLERANCE_V, 1e-6);
  assert.equal(BRANCH_CURRENT_TOLERANCE_A, 1e-9);
  assert.equal(KCL_TOLERANCE_A, 1e-9);
  assert.equal(POWER_CONSERVATION_TOLERANCE_W, 1e-9);
  assert.ok(withinNodeVoltageTolerance(6.666667, 6.6666667), '1e-9 apart passes');
  assert.ok(!withinNodeVoltageTolerance(6.666670, 6.6666667), '3e-6 apart fails');
  assert.ok(withinBranchCurrentTolerance(3.333333333e-3, 3.333333335e-3), '2e-12 apart passes');
  assert.ok(!withinBranchCurrentTolerance(3.34e-3, 3.33e-3), '1e-5 apart fails');
  // Non-finite actuals never pass (fail-closed).
  assert.ok(!withinNodeVoltageTolerance(Number.NaN, 1.0));
  assert.ok(!withinBranchCurrentTolerance(Number.POSITIVE_INFINITY, 0.0));
});

// ---------------------------------------------------------------------------
// Independent conservation oracles (first-principles, not the solver's helper)
// ---------------------------------------------------------------------------

test('conservation: independent KCL recomputation from the dumped netlist', () => {
  // Divider: KCL at mid — R1 in = R2 out (the solver residual ≈ 1e-16).
  const kcl = independentKclMaxResidualA(dividerCase);
  assert.ok(kcl < 1e-15, `divider KCL residual ${kcl}`);
  // Inverter: out node — Mp sources what Mn sinks (role-swapped currents).
  const kclInv = independentKclMaxResidualA(inverterCase);
  assert.ok(kclInv < 1e-12, `inverter KCL residual ${kclInv}`);
});

test('conservation: the breakdown gate-short current is counted (unlike the solver helper)', () => {
  // The converged operating point, computed exactly (a rounded hand fixture
  // would fail the 1e-9 conservation oracle by construction).
  const vgate = 1.8 * (100 / 2100); // Rshort (100 Ω) vs Rbias (2 kΩ) divider
  const ibias = (1.8 - vgate) / 2000; // = the gate-short current
  const vout = 1.8; // Mn is off (Vgs ≈ 0 through the short) → no load current
  // The breakdown case's gate node: pull-up in = short out; the ep-circuit
  // `kcl_max_residual` helper misses the short (8.57e-4) — the independent
  // oracle counts it and the TRUE residual is < 1e-9.
  const breakdown = {
    id: 'breakdown-bias',
    netlist: {
      nodes: [
        { name: '0', ground: true },
        { name: 'vdd', ground: false },
        { name: 'vgate', ground: false },
        { name: 'out', ground: false },
      ],
      elements: [
        { kind: 'V', label: 'VDD', nodes: ['vdd', '0'], v: 1.8, branchCurrent: -ibias },
        { kind: 'R', label: 'Rload', nodes: ['vdd', 'out'], r: 10000 },
        {
          kind: 'M',
          label: 'Mn',
          nodes: ['vgate', 'out', '0'],
          type: 'N',
          vth: 0.45,
          kp: 0.004,
          lambda: 0.06,
          gateShorted: true,
          gateShortR: 100,
          deviceCurrentA: 0,
          inIsDrain: true,
        },
        { kind: 'R', label: 'Rbias', nodes: ['vdd', 'vgate'], r: 2000 },
      ],
    },
    nodeVoltages: { vdd: 1.8, vgate, out: vout },
  };
  const kcl = independentKclMaxResidualA(breakdown);
  assert.ok(kcl < 1e-9, `independent KCL counts the gate short: ${kcl}`);
  const power = independentPowerSumW(breakdown);
  assert.ok(Math.abs(power) < 1e-9, `independent power conservation: ${power}`);
});

test('conservation: independent power sum vanishes for the divider and inverter', () => {
  const divider = independentPowerSumW(dividerCase);
  assert.ok(Math.abs(divider) < 1e-12, `divider power conservation ${divider}`);
  const inv = independentPowerSumW(inverterCase);
  assert.ok(Math.abs(inv) < 1e-12, `inverter power conservation ${inv}`);
});

// ---------------------------------------------------------------------------
// Skip discipline + verdict plumbing
// ---------------------------------------------------------------------------

test('skip discipline: missing ngspice yields a loud SKIP (exit-0 verdict locally)', () => {
  const probe = findNgspice();
  if (probe) {
    // ngspice IS available in this environment: the differential is live.
    assert.equal(runDifferential(dividerCase, { requireLive: true }).verdict, undefined === undefined ? 'FAIL' : 'FAIL', 'single-case dump without the protocol is refused');
    return;
  }
  const verdict = runDifferential(
    {
      format: DUMP_FORMAT,
      provenance: 'SIMULATED_ARCHITECTURAL_MODEL',
      cases: Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, kclMaxResidualA: 1e-12 })),
    },
    { requireLive: false },
  );
  assert.equal(verdict.verdict, 'SKIP', 'loud skip verdict');
  assert.match(verdict.message, /WP24-NGSPICE-ORACLE-SKIP/);
  // requireLive turns the same skip into a hard failure.
  const fail = runDifferential(
    {
      format: DUMP_FORMAT,
      provenance: 'SIMULATED_ARCHITECTURAL_MODEL',
      cases: Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, kclMaxResidualA: 1e-12 })),
    },
    { requireLive: true },
  );
  assert.equal(fail.verdict, 'FAIL');
});

test('verdict plumbing: a protocol-invalid dump fails regardless of ngspice', () => {
  const verdict = runDifferential({ format: 'nope' }, { requireLive: false });
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.errors.length > 0);
});
