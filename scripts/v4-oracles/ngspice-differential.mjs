/**
 * WP-2.4 — ngspice CI differential harness for the `ep-circuit` DC solver.
 *
 * Oracle contract (`03_PHYSICS_MATH_FUNDAMENTALS.md` §5 CI Oracle Calibration
 * Table, MNA DC row): node voltages within **±1e-6 V**, branch currents
 * within **±1e-9 A** — plus the §1.2 conservation oracles: KCL residual at
 * every node and total power conservation **< 1e-9**.
 *
 * Pipeline: netlist → deck → ngspice → parse → compare. The ngspice batch
 * decks are built **from the oracle dump's own netlist descriptions**
 * (emitted by `crates/ep-kernel/examples/circuit_oracle_dump.rs`) — never
 * from a parallel hardcoded copy, so the two engines provably solve the same
 * circuits. The harness also recomputes KCL and power conservation
 * independently from the dumped netlist + operating point (first-principles
 * oracles — it does not trust the solver's own residual helper, which does
 * not model the post-breakdown gate-short element).
 *
 * Device physics: the suite's MOSFETs are Shichman–Hodges square-law
 * (03 §1.2), which ngspice reproduces exactly with `LEVEL=1` model cards
 * (`KP = ep-circuit kp`, `VTO = vth`, `LAMBDA = lambda`, W = L = 1 µm).
 * Deck-only elements (the RC case's DC-open capacitor) are explicitly
 * described in the dump and emitted into the deck with a provenance comment.
 *
 * Skip discipline (PHASE_04 failure modes): a missing `ngspice` produces a
 * LOUD printed skip verdict — locally (`--require-live` omitted) it exits 0
 * with the skip on stdout AND stderr; under `--require-live` (the CI mode) a
 * missing tool is a hard failure. A skip never mutates evidence and never
 * reads as a pass. All artifacts live in `$RUNNER_TEMP` (or the OS temp dir
 * locally) so the tracked tree stays 100 % clean for Phase 30/39.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const DUMP_FORMAT = 'invention-lab/wp24-oracle-dump/1';
/** §5 CI Oracle Calibration Table — MNA DC (divider/inverter) row. */
export const NODE_VOLTAGE_TOLERANCE_V = 1e-6;
export const BRANCH_CURRENT_TOLERANCE_A = 1e-9;
/** §1.2 conservation oracles. */
export const KCL_TOLERANCE_A = 1e-9;
export const POWER_CONSERVATION_TOLERANCE_W = 1e-9;
/** ngspice batch convergence options — tightened far beyond the defaults so
 * the two solvers' converged solutions meet the §5 calibration tolerances. */
export const NGSPICE_OPTIONS =
  '.options reltol=1e-12 abstol=1e-15 vntol=1e-12 gmin=1e-12';

/** Resolve the artifact root: $RUNNER_TEMP in CI, OS temp dir locally. */
export function artifactRoot() {
  return process.env.RUNNER_TEMP ?? tmpdir();
}

/** Locate the ngspice binary; null when absent (skip discipline). */
export function findNgspice() {
  try {
    const probe = execFileSync(
      process.platform === 'win32' ? 'where' : 'which',
      ['ngspice'],
      { encoding: 'utf8', timeout: 10_000, stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return probe.length > 0 ? 'ngspice' : null;
  } catch {
    return null; // probe fails ⇒ the tool is absent — a loud skip, never a throw
  }
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);

/**
 * Build one ngspice batch deck from the dump's own case description.
 * Returns `{ deck, nodes, vSources }` — `nodes`/`vSources` are the parsed
 * quantity list the output parser must recover.
 *
 * @param {object} caseDump one `cases[]` entry of the WP-2.4 oracle dump
 */
export function buildDeck(caseDump) {
  const errors = [];
  const netlist = caseDump?.netlist;
  if (!netlist || !Array.isArray(netlist.nodes) || !Array.isArray(netlist.elements)) {
    throw new Error('case dump is missing the netlist description');
  }
  const ground = netlist.nodes.find((n) => n.ground);
  if (!ground || ground.name !== '0') {
    throw new Error('ground node must be named "0" (SPICE reference)');
  }
  const lines = [];
  lines.push(`* ${caseDump.title} — WP-2.4 ngspice differential vs ep-circuit (SIMULATED_ARCHITECTURAL_MODEL)`);
  lines.push(`* case: ${caseDump.id}`);
  lines.push(NGSPICE_OPTIONS);
  const nodes = [];
  const vSources = [];
  const models = new Map();
  for (const el of netlist.elements) {
    const [a, b, c] = el.nodes;
    switch (el.kind) {
      case 'R':
        lines.push(`${el.label} ${a} ${b} ${num(el.r)}`);
        break;
      case 'V':
        lines.push(`${el.label} ${a} ${b} DC ${num(el.v)}`);
        vSources.push(el.label);
        break;
      case 'I':
        lines.push(`${el.label} ${a} ${b} DC ${num(el.i)}`);
        break;
      case 'M': {
        // Shichman–Hodges parity card: LEVEL=1, β = KP·W/L with W = L = 1 µm.
        const model = `mod_${el.label}`;
        lines.push(`${el.label} ${b} ${a} ${c} ${model} W=1u L=1u`);
        lines.push(
          `.MODEL ${model} ${el.type === 'P' ? 'PMOS' : 'NMOS'} (LEVEL=1 KP=${num(el.kp)} VTO=${num(el.vth)} LAMBDA=${num(el.lambda)} W=1u L=1u)`,
        );
        models.set(model, el);
        break;
      }
      default:
        errors.push(`unsupported dump element kind '${el.kind}' (${el.label})`);
    }
  }
  // Deck-only elements: DC-inert by construction, explicitly described.
  for (const el of caseDump.deckOnly ?? []) {
    if (el.kind !== 'C') {
      errors.push(`unsupported deck-only element kind '${el.kind}' (${el.label})`);
      continue;
    }
    lines.push(`* deck-only (DC-open, from the oracle dump): ${el.note}`);
    lines.push(`${el.label} ${el.nodes[0]} ${el.nodes[1]} ${num(el.c)}`);
  }
  if (errors.length > 0) throw new Error(errors.join('; '));
  // Gate-short faults: a resistor between the MOSFET's gate and source
  // (exactly the ep-circuit post-breakdown stamp: i = (vg − vs)/gateShortR).
  for (const el of netlist.elements) {
    if (el.kind === 'M' && el.gateShorted) {
      const [g, , s] = el.nodes;
      lines.push(`Rshort_${el.label} ${g} ${s} ${num(el.gateShortR)}`);
    }
  }
  // Operating-point measurement block: one print per quantity (stable parse).
  for (const n of netlist.nodes) {
    if (!n.ground) {
      lines.push(`print v(${n.name})`);
      nodes.push(n.name);
    }
  }
  for (const label of vSources) {
    lines.push(`print i(${label.toLowerCase()})`);
  }
  lines.push('.control', 'set noaskquit', 'op', 'quit', '.endc', '.end');
  return { deck: lines.join('\n') + '\n', nodes, vSources };
}

/**
 * Parse ngspice batch stdout: one `print` per quantity yields one
 * `<vector> = <value>` line each. Returns a map `vector → number`.
 * Throws (with a stdout tail) when an expected vector is missing.
 */
export function parseNgspicePrint(stdout, expectedVectors) {
  const values = new Map();
  const re = /([A-Za-z_][\w().#]*)\s*=\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)/g;
  for (const m of stdout.matchAll(re)) {
    values.set(m[1], Number(m[2]));
  }
  const missing = expectedVectors.filter((v) => !values.has(v.toLowerCase()));
  if (missing.length > 0) {
    throw new Error(
      `ngspice output is missing ${missing.length} expected vector(s): ${missing.join(', ')} — tail: ${stdout.slice(-800)}`,
    );
  }
  return values;
}

/**
 * Independent KCL recomputation from the dumped netlist + operating point
 * (first-principles conservation oracle — mirrors the ep-circuit stamps:
 * resistor (v_a−v_b)/R; voltage-source branch current; ideal current source;
 * square-law device current into the role-swapped "in" terminal; the
 * post-breakdown gate-short resistor).
 *
 * Returns the max |KCL residual| over all non-ground nodes (A).
 */
export function independentKclMaxResidualA(caseDump) {
  const netlist = caseDump.netlist;
  const v = (name) => caseDump.nodeVoltages[name] ?? 0;
  const residuals = new Map();
  for (const n of netlist.nodes) {
    if (!n.ground) residuals.set(n.name, 0);
  }
  const stamp = (node, current) => {
    if (residuals.has(node)) residuals.set(node, residuals.get(node) + current);
  };
  for (const el of netlist.elements) {
    const [a, b, c] = el.nodes;
    if (el.kind === 'R') {
      const i = (v(a) - v(b)) / num(el.r);
      stamp(a, i);
      stamp(b, -i);
    } else if (el.kind === 'V') {
      const i = num(el.branchCurrent);
      stamp(a, i);
      stamp(b, -i);
    } else if (el.kind === 'I') {
      // The solver's stamp: the ideal source pushes i INTO node a
      // (residual[a] -= i, residual[b] += i — mirrors kcl_max_residual).
      stamp(a, -num(el.i));
      stamp(b, num(el.i));
    } else if (el.kind === 'M') {
      const inNode = el.inIsDrain ? b : c;
      const outNode = el.inIsDrain ? c : b;
      const i = num(el.deviceCurrentA);
      stamp(inNode, i);
      stamp(outNode, -i);
      if (el.gateShorted) {
        const ig = (v(a) - v(c)) / num(el.gateShortR);
        stamp(a, ig);
        stamp(c, -ig);
      }
    }
  }
  let max = 0;
  for (const value of residuals.values()) max = Math.max(max, Math.abs(value));
  return max;
}

/**
 * Independent power-conservation oracle: Σ i·v over every element (dissipated
 * positive, delivered negative) must vanish to < 1e-9 W (03 §1.2:
 * "ΣP_devices = ΣP_sources < 1e-9").
 */
export function independentPowerSumW(caseDump) {
  const netlist = caseDump.netlist;
  const v = (name) => caseDump.nodeVoltages[name] ?? 0;
  let sum = 0;
  for (const el of netlist.elements) {
    const [a, b, c] = el.nodes;
    if (el.kind === 'R') {
      sum += ((v(a) - v(b)) ** 2) / num(el.r);
    } else if (el.kind === 'V') {
      sum += num(el.branchCurrent) * (v(a) - v(b));
    } else if (el.kind === 'I') {
      sum += num(el.i) * (v(a) - v(b));
    } else if (el.kind === 'M') {
      const inNode = el.inIsDrain ? b : c;
      const outNode = el.inIsDrain ? c : b;
      const vIn = inNode === '0' ? 0 : v(inNode);
      const vOut = outNode === '0' ? 0 : v(outNode);
      sum += num(el.deviceCurrentA) * (vIn - vOut);
      if (el.gateShorted) {
        const ig = (v(a) - v(c)) / num(el.gateShortR);
        sum += ig * (v(a) - v(c));
      }
    }
  }
  // Deck-only capacitors are DC-open (zero current ⇒ zero power).
  return sum;
}

/** §5 absolute node-voltage tolerance: |actual − expected| ≤ 1e-6 V. */
export function withinNodeVoltageTolerance(actual, expected) {
  return Math.abs(actual - expected) <= NODE_VOLTAGE_TOLERANCE_V;
}

/** §5 absolute branch-current tolerance: |actual − expected| ≤ 1e-9 A. */
export function withinBranchCurrentTolerance(actual, expected) {
  return Math.abs(actual - expected) <= BRANCH_CURRENT_TOLERANCE_A;
}

/** Structural validation of the dump protocol (fail-closed). */
export function assertDumpProtocol(dump) {
  const errors = [];
  if (!dump || typeof dump !== 'object') return ['dump is not an object'];
  if (dump.format !== DUMP_FORMAT) errors.push(`format must be ${DUMP_FORMAT}`);
  if (dump.provenance !== 'SIMULATED_ARCHITECTURAL_MODEL') {
    errors.push('dump must carry the SIMULATED_ARCHITECTURAL_MODEL provenance');
  }
  if (!Array.isArray(dump.cases) || dump.cases.length < 10) {
    errors.push(`expected the 10-case suite, got ${dump.cases?.length ?? 0} cases`);
  }
  for (const c of dump.cases ?? []) {
    if (typeof c.kclMaxResidualA !== 'number' || !Number.isFinite(c.kclMaxResidualA)) {
      errors.push(`case ${c.id}: missing finite kclMaxResidualA`);
    }
  }
  return errors;
}

/** ngspice branch-current vector name for a voltage-source label. */
export function sourceCurrentVector(label) {
  return `i(${label.toLowerCase()})`;
}

/**
 * Run the full differential for one dump. Returns the verdict object.
 * `requireLive` mirrors the CI mode: a missing ngspice is a hard failure.
 */
export function runDifferential(dump, { requireLive = false, workDir } = {}) {
  const protocolErrors = assertDumpProtocol(dump);
  if (protocolErrors.length > 0) {
    return { verdict: 'FAIL', errors: protocolErrors, cases: [] };
  }
  const ngspice = findNgspice();
  if (!ngspice) {
    const verdict = requireLive ? 'FAIL' : 'SKIP';
    const message =
      'WP24-NGSPICE-ORACLE-SKIP: ngspice is not available on PATH — the live ' +
      'differential executes only where ngspice exists (CI installs it; ' +
      '`--require-live` makes the skip a hard failure). The pure-function ' +
      'unit suite (tests/wp24-ngspice-oracle.test.mjs) still runs everywhere.';
    console.error(message);
    console.log(message);
    return { verdict, message, cases: [] };
  }
  const dir = workDir ?? mkdtempSync(join(artifactRoot(), 'wp24-ngspice-'));
  const caseVerdicts = [];
  try {
    for (const caseDump of dump.cases) {
      const { deck, nodes, vSources } = buildDeck(caseDump);
      const deckPath = join(dir, `wp24-${caseDump.id}.cir`);
      writeFileSync(deckPath, deck, 'utf8');
      const stdout = execFileSync(ngspice, ['-b', deckPath], {
        encoding: 'utf8',
        timeout: 45_000,
        maxBuffer: 4_000_000,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const expected = [
        ...nodes.map((n) => `v(${n})`),
        ...vSources.map((label) => sourceCurrentVector(label)),
      ];
      const measured = parseNgspicePrint(stdout, expected);
      const checks = [];
      for (const n of nodes) {
        const actual = measured.get(`v(${n})`);
        const expectedV = caseDump.nodeVoltages[n];
        const ok = withinNodeVoltageTolerance(actual, expectedV);
        checks.push({
          quantity: `v(${n})`,
          epCircuit: expectedV,
          ngspice: actual,
          delta: Math.abs(actual - expectedV),
          ok,
        });
      }
      for (const label of vSources) {
        const actual = measured.get(sourceCurrentVector(label));
        const expectedI = caseDump.deviceCurrents[label];
        const ok = withinBranchCurrentTolerance(actual, expectedI);
        checks.push({
          quantity: sourceCurrentVector(label),
          epCircuit: expectedI,
          ngspice: actual,
          delta: Math.abs(actual - expectedI),
          ok,
        });
      }
      const kcl = independentKclMaxResidualA(caseDump);
      const powerSum = independentPowerSumW(caseDump);
      const kclOk = kcl < KCL_TOLERANCE_A;
      const powerOk = Math.abs(powerSum) < POWER_CONSERVATION_TOLERANCE_W;
      const failed = checks.filter((c) => !c.ok);
      caseVerdicts.push({
        id: caseDump.id,
        ok: failed.length === 0 && kclOk && powerOk,
        checks,
        maxNodeVoltageDeltaV: Math.max(...checks.filter((c) => c.quantity.startsWith('v(')).map((c) => c.delta)),
        maxBranchCurrentDeltaA: Math.max(
          ...checks.filter((c) => c.quantity.startsWith('i(')).map((c) => c.delta),
          0,
        ),
        independentKclMaxResidualA: kcl,
        kclOk,
        independentPowerSumW: powerSum,
        powerOk,
        failures: failed,
      });
    }
    const failedCases = caseVerdicts.filter((c) => !c.ok);
    return {
      verdict: failedCases.length === 0 ? 'PASS' : 'FAIL',
      cases: caseVerdicts,
      errors: failedCases.map(
        (c) =>
          `${c.id}: ${c.failures.map((f) => `${f.quantity} Δ=${f.delta}`).join('; ')}` +
          (c.kclOk ? '' : `; KCL ${c.independentKclMaxResidualA.toExponential(3)} A`) +
          (c.powerOk ? '' : `; power Σ ${c.independentPowerSumW.toExponential(3)} W`),
      ),
    };
  } finally {
    if (!workDir) rmSync(dir, { recursive: true, force: true });
  }
}
