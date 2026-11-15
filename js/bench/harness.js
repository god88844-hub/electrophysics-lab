// harness.js — benchmark case schema, execution, verdict assembly, reports.
//
// Verdict philosophy (Phase 2 spec, §1 and §12):
//   * a SKIPPED benchmark (missing external engine) is never counted as a
//     pass — it is reported as its own status;
//   * an external-solver agreement is a distinct evidence stage
//     ('crossSolver') from mathematical checks and from physical validation;
//   * disagreements are classified: implementation failure vs reference
//     failure vs model mismatch vs numerical discrepancy vs inconclusive;
//   * every artifact and version needed to reproduce a result is recorded.

const RANK = { pass: 0, inconclusive: 1, 'model-mismatch': 2, skipped: 3, unsupported: 4, fail: 5 };
export const STATUS_DOC = {
  pass: 'Invention Lab and the independent reference agree within the documented tolerance.',
  fail: 'A comparison exceeded its tolerance or an engine produced invalid data.',
  skipped: 'The benchmark did not run (e.g. external engine unavailable). NEVER counted as a pass.',
  unsupported: 'The benchmark targets behavior the platform explicitly does not support.',
  'model-mismatch': 'The two engines implement genuinely different mathematical models; documented, not a bug.',
  inconclusive: 'The benchmark ran but the comparison cannot decide (e.g. missing tolerance).',
};

export function defineCase({ id, suite, title, purpose, units = {}, modelNotes = [], toleranceRationale = '', run }) {
  if (!id || !suite || !title || typeof run !== 'function') {
    throw new Error(`defineCase: id, suite, title and run() are required (case "${id || '?'}")`);
  }
  return { id, suite, title, purpose, units, modelNotes, toleranceRationale, run };
}

function worst(checks) {
  let verdict = 'pass';
  for (const c of checks) {
    const v = c.verdict;
    if (v === 'fail') return 'fail';
    if (v === 'inconclusive') verdict = 'inconclusive';
  }
  return verdict;
}

/**
 * Run one benchmark case. ctx provides resolved engines:
 *   ctx.ngspice = { exe, version } | null
 *   ctx.quantum = { python, qiskit: version|null, numpy: version|null } | null
 */
export async function runCase(caseDef, ctx) {
  const record = {
    id: caseDef.id,
    suite: caseDef.suite,
    title: caseDef.title,
    purpose: caseDef.purpose,
    units: caseDef.units,
    modelNotes: caseDef.modelNotes,
    toleranceRationale: caseDef.toleranceRationale,
    status: null,
    classification: null,
    startedAt: new Date().toISOString(),
    checks: [],
    il: null, ref: null, analytical: null,
    notes: [], artifacts: null, error: null,
  };
  try {
    const result = await caseDef.run(ctx, record);
    // review round 3: a case with NO checks has produced no evidence — an
    // explicit 'pass' (or a worst-of over an empty checks array, which also
    // yields 'pass') must never be accepted as validation evidence.
    if (result.status === 'pass' && (result.checks ?? []).length === 0) {
      result.status = 'inconclusive';
      (result.notes ??= []).push('Explicit "pass" rejected: the case produced no checks — unsubstantiated passes are not evidence.');
    }
    if (result.status) {
      // explicit early status (skipped / unsupported / model-mismatch / inconclusive)
      record.status = result.status;
      record.classification = result.classification ?? result.status;
      record.notes.push(...(result.notes || []));
      record.il = result.il ?? null;
      record.ref = result.ref ?? null;
      record.analytical = result.analytical ?? null;
      record.checks = result.checks ?? [];
      record.artifacts = result.artifacts ?? null;
    } else {
      record.il = result.il ?? null;
      record.ref = result.ref ?? null;
      record.analytical = result.analytical ?? null;
      record.checks = result.checks ?? [];
      record.notes.push(...(result.notes || []));
      record.artifacts = result.artifacts ?? null;
      if (record.checks.length === 0) {
        record.status = 'inconclusive';
        record.notes.push('No checks produced — a benchmark without checks is not evidence of agreement.');
      } else {
        const w = worst(record.checks);
        record.status = w;
        record.classification = w === 'fail' ? (result.classification ?? 'numerical-discrepancy') : w;
      }
    }
  } catch (e) {
    record.status = 'fail';
    record.classification = 'implementation-failure';
    record.error = String(e.stack || e.message || e);
    record.notes.push('Invention Lab side threw — this is an implementation failure of the code under test, not a missing reference.');
  }
  record.finishedAt = new Date().toISOString();
  if (RANK[record.status] === undefined) {
    throw new Error(`case ${caseDef.id}: unknown status "${record.status}"`);
  }
  return record;
}

export async function runSuite(cases, ctx, { engineVersions = {}, commitSHA = 'unknown', nodeVersion = process.version, suiteLabel = '' } = {}) {
  const caseRecords = [];
  for (const c of cases) {
    caseRecords.push(await runCase(c, ctx));
  }
  const summary = { total: caseRecords.length };
  for (const key of Object.keys(RANK)) summary[key] = 0;
  for (const r of caseRecords) summary[r.status] = (summary[r.status] || 0) + 1;
  // never let skipped/unsupported counts bleed into a "passed" narrative
  summary.passed = summary.pass || 0;
  return {
    generatedAt: new Date().toISOString(),
    suite: suiteLabel,
    environment: {
      commitSHA,
      nodeVersion,
      platform: `${process.platform} ${process.arch}`,
    },
    engines: engineVersions,
    cases: caseRecords,
    summary,
    verdictDoc: STATUS_DOC,
  };
}

/** markdown rendering of a suite report */
export function renderMarkdown(report) {
  const L = [];
  L.push(`# Benchmark report — ${report.suite}`);
  L.push('');
  L.push(`Generated: ${report.generatedAt}  ·  commit: \`${report.environment.commitSHA}\`  ·  node: ${report.environment.nodeVersion}  ·  ${report.environment.platform}`);
  L.push('');
  L.push('**Engines:** ' + (Object.keys(report.engines).length
    ? Object.entries(report.engines).map(([k, v]) => `${k}: ${v?.version ?? 'unavailable'}`).join(' · ')
    : 'none resolved'));
  L.push('');
  const s = report.summary;
  L.push(`**Summary:** ${s.total} cases — ${s.pass} pass · ${s.fail} fail · ${s.skipped} skipped · ${s.unsupported} unsupported · ${s['model-mismatch'] || 0} model-mismatch · ${s.inconclusive} inconclusive`);
  L.push('');
  L.push('> A skipped case is missing evidence, not a pass — skipped cases are never counted as a pass. Agreement with an independent numerical solver is cross-solver evidence, not physical validation.');
  L.push('');
  L.push('| Case | Status | Classification | Detail |');
  L.push('|---|---|---|---|');
  for (const c of report.cases) {
    const detail = c.error
      ? (c.error.split('\n')[0] || 'error').slice(0, 90)
      : (c.checks?.length
        ? c.checks.map((k) => `${k.name}: ${k.verdict}`).join('; ').slice(0, 120)
        : (c.notes?.[0] || '').slice(0, 90));
    L.push(`| ${c.id} | **${c.status}** | ${c.classification ?? ''} | ${detail} |`);
  }
  L.push('');
  L.push('## Case details');
  for (const c of report.cases) {
    L.push('');
    L.push(`### ${c.id} — ${c.title}`);
    L.push('');
    L.push(c.purpose);
    if (c.toleranceRationale) { L.push(''); L.push(`*Tolerance rationale:* ${c.toleranceRationale}`); }
    for (const n of c.modelNotes || []) L.push(`*Model note:* ${n}`);
    if (c.error) { L.push(''); L.push('```\n' + c.error + '\n```'); }
    for (const k of c.checks || []) {
      L.push(`- **${k.verdict.toUpperCase()}** ${k.name}` +
        (k.metrics ? ` — ${JSON.stringify(k.metrics)}` : '') +
        (k.note ? ` — ${k.note}` : ''));
    }
    for (const n of c.notes || []) L.push(`- note: ${n}`);
  }
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// acceptance policy (review round 3): explicit, testable exit/evidence rules
// ---------------------------------------------------------------------------

/**
 * CI exit-code policy.
 *   non-strict: exit 1 only when a benchmark FAILED (informational runs).
 *   strict:     exit 1 unless EVERY case in EVERY suite is 'pass' and there
 *               is at least one case — skipped, unsupported, inconclusive,
 *               model-mismatch, or missing suites all fail strict CI.
 */
export function exitCodeFor(reports, { strict = false } = {}) {
  const fail = reports.reduce((a, r) => a + (r.summary.fail || 0), 0);
  const total = reports.reduce((a, r) => a + (r.summary.total || 0), 0);
  const pass = reports.reduce((a, r) => a + (r.summary.pass || 0), 0);
  if (!strict) return fail > 0 ? 1 : 0;
  if (total === 0 || pass !== total) return 1;
  return 0;
}

/**
 * Cross-solver evidence status (review round 3): a single passing case must
 * never imply complete coverage.
 *   missing  — no executed cases at all
 *   failed   — cases ran but none passed
 *   partial  — some passed; failures/skips/model mismatches remain
 *   complete — every executed case passed AND nothing was skipped/failed
 */
export function crossSolverEvidenceStatus(reports) {
  let total = 0, passed = 0, failed = 0, skipped = 0, unsupported = 0, inconclusive = 0, modelMismatch = 0;
  for (const r of reports) {
    const s = r.summary || {};
    total += s.total || 0;
    passed += s.pass || 0;
    failed += s.fail || 0;
    skipped += s.skipped || 0;
    unsupported += s.unsupported || 0;
    inconclusive += s.inconclusive || 0;
    modelMismatch += s['model-mismatch'] || 0;
  }
  let status;
  const executed = total - skipped - unsupported; // cases that actually ran
  if (total === 0) status = 'missing';
  else if (executed === 0 && failed === 0 && inconclusive === 0 && modelMismatch === 0) status = 'missing'; // nothing actually executed
  else if (passed === total) status = 'complete';
  else if (passed > 0) status = 'partial';
  else status = 'failed';
  return {
    status,
    total, passed, failed, skipped, unsupported, inconclusive, modelMismatch,
    note: status === 'complete'
      ? 'Every executed benchmark case passed. This is cross-solver agreement for the SUITE cases only — not physical validation, and not coverage of arbitrary user designs.'
      : status === 'partial'
        ? `Incomplete coverage: ${passed}/${total} passed; ${failed} failed, ${skipped} skipped, ${unsupported} unsupported, ${inconclusive} inconclusive, ${modelMismatch} model-mismatch. Skipped cases are missing evidence, not passes.`
        : status === 'failed'
          ? `No benchmark case passed (${failed} failed). No cross-solver evidence is available.`
          : 'No benchmark cases were executed.',
  };
}
