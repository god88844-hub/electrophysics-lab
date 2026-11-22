/**
 * WP-2.4 — `node scripts/phase2x-diff.mjs` — the ledger verification command.
 *
 * Self-contained ngspice differential pipeline:
 *   1. `cargo run -p ep-kernel --example circuit_oracle_dump` emits the
 *      read-only 10-case ep-circuit DC oracle dump (divider, inverter,
 *      cascade, RC bias point, breakdown bias point, bridge, …).
 *   2. `scripts/v4-oracles/ngspice-differential.mjs` builds one ngspice batch
 *      deck per case from the dump's own netlist descriptions, runs live
 *      `ngspice -b`, parses the operating point and asserts the
 *      03 §5 CI Oracle Calibration tolerances (node voltages ±1e-6 V,
 *      branch currents ±1e-9 A) plus the §1.2 conservation oracles
 *      (KCL + power < 1e-9) recomputed independently from the dump.
 *
 * Flags: `--require-live` (CI mode — a missing ngspice is a hard failure;
 * locally the harness prints a loud skip verdict and exits 0) and
 * `--suite ngspice` (accepted for ledger-command symmetry, informational).
 * Artifacts live under `$RUNNER_TEMP` (or the OS temp dir) — the tracked
 * tree stays 100 % clean for Phase 30/39.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const { join } = path;
import { fileURLToPath } from 'node:url';
import { artifactRoot, runDifferential } from './v4-oracles/ngspice-differential.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

function argValue(flag, argv) {
  const index = argv.indexOf(flag);
  return index >= 0 && index + 1 < argv.length ? argv[index + 1] : null;
}

const argv = process.argv.slice(2);
const requireLive = argv.includes('--require-live');
const dumpPath = argValue('--dump', argv);

const workRoot = join(artifactRoot(), 'wp24-oracles');
const target = dumpPath ?? join(workRoot, 'circuit_oracle_dump.json');
mkdirSync(path.dirname(target), { recursive: true });

if (!dumpPath) {
  console.log('WP24: emitting the read-only ep-circuit oracle dump (cargo run --locked -p ep-kernel --example circuit_oracle_dump)');
  const stdout = execFileSync(
    'cargo',
    ['run', '--locked', '-q', '-p', 'ep-kernel', '--example', 'circuit_oracle_dump'],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 16_000_000 },
  );
  rmSync(target, { force: true });
  writeFileSync(target, stdout, 'utf8');
}

const dump = JSON.parse(readFileSync(target, 'utf8'));
const verdict = runDifferential(dump, { requireLive });

console.log(JSON.stringify(verdict, null, 2));
if (verdict.verdict === 'FAIL') {
  console.error(`WP24-NGSPICE-ORACLE-FAIL: ${verdict.errors.join(' | ')}`);
  process.exit(1);
}
if (verdict.verdict === 'SKIP') {
  // Loud skip, exit 0 locally (the CI workflow always passes --require-live).
  process.exit(0);
}
console.log(
  `WP24-NGSPICE-ORACLE-PASS: ${verdict.cases.length} cases × ngspice vs ep-circuit within 03 §5 tolerances (node V ±1e-6 V, branch currents ±1e-9 A, KCL + power < 1e-9)`,
);
process.exit(0);
