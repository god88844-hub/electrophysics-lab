// validation.js — the mission layer.
// "All models are wrong; the practical question is how wrong do they have to
// be to not be useful." Every simulated result is published with an explicit
// verdict (pass / warn / fail / unknown), a tolerance, and a list of what is
// NOT covered by validation. Nothing in this platform claims "safe to build"
// without documented evidence.

import { portsOf } from './block.js';
import { getComponent } from './registry.js';

/** Deterministic RNG (mulberry32) so Monte Carlo runs are reproducible. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample a parameter value honoring its declared tolerance (±tol relative). */
function sampleValue(v, tol, rng) {
  if (typeof v !== 'number' || !tol || !isFinite(tol)) return v;
  const spread = Math.abs(v) * tol;
  return v + (rng() * 2 - 1) * spread; // uniform in [v(1-tol), v(1+tol)]
}

export function stats(nums) {
  const n = nums.length;
  if (n === 0) return { n: 0, mean: NaN, std: NaN, min: NaN, max: NaN, p05: NaN, p95: NaN };
  const s = [...nums].sort((a, b) => a - b);
  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1));
  return {
    n,
    mean, std, min: s[0], max: s[n - 1],
    p05: s[Math.floor(0.05 * (n - 1))],
    p95: s[Math.floor(0.95 * (n - 1))],
  };
}

/**
 * Generic Monte Carlo runner.
 *   draw()  -> params object (implementations use sampleParam for tol'd params)
 *   run(p)  -> simulation result
 *   metric(res) -> number | { name: number, ... }
 * Returns { runs, summary: { metricName: stats } }.
 */
export function monteCarlo({ n = 50, rng = Math.random, draw, run, metric }) {
  const runs = [];
  for (let i = 0; i < n; i++) {
    const res = run(draw());
    let m = metric ? metric(res) : res;
    if (typeof m === 'number') m = { value: m };
    runs.push(m);
  }
  const names = Object.keys(runs[0] || { value: 0 });
  const summary = {};
  for (const name of names) summary[name] = stats(runs.map((r) => r[name]));
  return { n, runs, summary };
}

/** Sample one param spec ({value, tol}) — exported for lab-specific MC. */
export function sampleParam(spec, rng = Math.random) {
  if (typeof spec === 'number') return spec;
  return sampleValue(spec.value, spec.tol, rng);
}

export function withinTol(actual, expected, { abs = 0, rel = 0 } = {}) {
  const lim = Math.max(abs, Math.abs(expected) * rel);
  return Math.abs(actual - expected) <= lim;
}

/**
 * A validation check. verdict one of:
 *   'pass'    — meets requirement with stated tolerance
 *   'warn'    — marginal; within tolerance but thin margin or qualifier
 *   'fail'    — outside tolerance
 *   'unknown' — no data / not covered by any validated model
 */
export function makeCheck({ name, actual, expected, abs = 0, rel = 0, verdict = null, note = '', evidence = null, stage = 'mathematical' }) {
  if (!verdict) verdict = withinTol(actual, expected, { abs, rel }) ? 'pass' : 'fail';
  const lim = Math.max(abs, Math.abs(expected) * rel);
  return {
    name, verdict,
    actual, expected,
    tolerance: lim,
    note, evidence,
    stage, // 'execution' | 'mathematical' | 'crossSolver' | 'physical'
  };
}

export const unknownCheck = (name, note = '') => ({ name, verdict: 'unknown', note, actual: null, expected: null, tolerance: null });

const VERDICT_RANK = { pass: 0, unknown: 1, warn: 2, fail: 3 };
export function verdictFrom(checks) {
  let worst = 'pass';
  for (const c of checks) if (VERDICT_RANK[c.verdict] > VERDICT_RANK[worst]) worst = c.verdict;
  return worst;
}

/**
 * Audit a diagram for validation coverage. Returns the list of "unknown"
 * assumptions that must appear in every report:
 *  - blocks whose definition has no validation.provenance
 *  - numeric parameters with no declared tolerance
 */
export function collectAssumptions(diagram) {
  const out = [];
  for (const b of diagram.blocks) {
    const def = getComponent(b.type);
    if (!def) { out.push(`Block ${b.id}: unregistered type "${b.type}" — cannot validate.`); continue; }
    const prov = def.validation?.provenance;
    if (!prov) out.push(`Block ${b.id} (${def.label}): no model provenance — result not traceable to a validated source.`);
    const portIds = new Set(portsOf(b).map((p) => p.id));
    if (portIds.size === 0 && !(def.params || []).length) continue;
    for (const p of def.params || []) {
      if (p.type === 'number' && p.tol === undefined && p.noTolRequired !== true) {
        out.push(`Block ${b.id}: parameter "${p.key}" has no tolerance data — treated as exact, which is unphysical.`);
      }
    }
  }
  return out;
}

/**
 * Full design report: lab checks + coverage assumptions + provenance.
 *
 * Verdict rule (audit fix): the worst verdict of the checks, BUT an
 * uncalibrated design can never receive an unconditional PASS — any
 * documented assumption (missing provenance / tolerance evidence) caps the
 * verdict at 'warn', which reads as "mathematically correct, physically
 * unverified". A true physical-validation PASS requires independent
 * experimental evidence, which the platform tracks separately (see stages).
 */
export function assembleReport({ diagram, checks, title }) {
  const assumptions = collectAssumptions(diagram);
  // review fix: a report with ZERO checks has validated nothing — it must
  // not claim success. verdictFrom([]) would return 'pass'.
  let verdict = checks.length ? verdictFrom(checks) : 'unknown';
  if (assumptions.length > 0 && verdict === 'pass') verdict = 'warn';

  // Evidence stages (audit + review fix): reports must distinguish what kind
  // of evidence each verdict rests on. A stage with no checks reports
  // 'none' (not tested) — an empty stage must never display as PASS.
  // 'physical' stays 'none' until independent experimental measurements are
  // supplied and compared within tolerance.
  const byStage = { execution: [], mathematical: [], crossSolver: [] };
  for (const c of checks) {
    const stage = c.stage ?? 'mathematical';
    if (byStage[stage]) byStage[stage].push(c);
  }
  const stages = {
    execution: byStage.execution.length ? verdictFrom(byStage.execution) : 'none',
    mathematical: byStage.mathematical.length ? verdictFrom(byStage.mathematical) : 'none',
    crossSolver: byStage.crossSolver.length ? verdictFrom(byStage.crossSolver) : 'none',
    physical: 'none',
  };

  const provenance = [];
  for (const b of diagram.blocks) {
    const def = getComponent(b.type);
    if (def?.validation?.provenance) provenance.push(`${b.id} (${def.label}): ${def.validation.provenance}`);
  }
  return {
    title: title || diagram.name,
    diagramName: diagram.name,
    verdict,
    stages,
    checks,
    assumptions,
    provenance,
    physicalValidation: {
      status: 'none',
      note: 'No independent experimental measurements have been supplied or compared within tolerance. Mathematical correctness and cross-solver agreement are NOT physical validation.',
    },
    generatedAt: new Date().toISOString(),
  };
}
