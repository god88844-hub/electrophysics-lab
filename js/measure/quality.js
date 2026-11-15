// quality.js — dataset ingestion quality control (Phase 3 §4).
// Produces a quality report with explicit reasons for
// accepted / conditionally-usable / rejected — and distinguishes data
// PROVENANCE (where the data came from) from data QUALITY (whether it is
// usable for quantitative validation).

import { sha256 } from './dataset.js';

const REQUIRED_META = ['id', 'origin', 'experiment'];
const KNOWN_ORIGINS = ['real-measurement', 'synthetic-test-fixture', 'analytical-reference', 'numerical-reference', 'unknown-origin'];

/**
 * Run all QC checks. Returns
 *   { verdict: 'accepted'|'conditionally-usable'|'rejected',
 *     checks: [{check, status: 'pass'|'warn'|'fail', detail}],
 *     reasons: [...], stats: {...} }
 * `quantityChecks` lets the caller supply physical plausibility ranges:
 *   { voltage: { min: -1, max: 30 }, ... } (SI units)
 */
export function qualityReport(dataset, { quantityChecks = {}, requireCalibration = false } = {}) {
  const checks = [];
  const record = (check, status, detail = '') => checks.push({ check, status, detail });

  // ---- schema & metadata --------------------------------------------------
  record('format', dataset.format?.startsWith('invention-lab/measurement-dataset/') ? 'pass' : 'fail', dataset.format ?? 'missing');
  for (const key of REQUIRED_META) {
    const present = dataset[key] !== undefined && dataset[key] !== null &&
      !(typeof dataset[key] === 'object' && Object.values(dataset[key]).every((v) => v === null || v === undefined));
    record(`metadata.${key}`, present ? 'pass' : 'fail', present ? '' : 'required metadata missing — must be recorded, never inferred');
  }

  // ---- provenance ----------------------------------------------------------
  if (!KNOWN_ORIGINS.includes(dataset.origin)) {
    record('origin', 'fail', `unknown origin "${dataset.origin}" — must be one of: ${KNOWN_ORIGINS.join(', ')}`);
  } else {
    record('origin', dataset.origin === 'unknown-origin' ? 'warn' : 'pass', dataset.origin);
  }
  const instruments = dataset.instruments ?? [];
  if (instruments.length === 0) {
    record('instruments', 'warn', 'no instrument records — measurement uncertainty cannot be assessed');
  } else {
    for (const [i, ins] of instruments.entries()) {
      const cal = ins.calibration ?? {};
      const complete = ins.manufacturer && ins.model && ins.resolution !== null && ins.uncertainty !== null;
      record(`instrument[${i}].specification`, complete ? 'pass' : 'warn',
        complete ? `${ins.manufacturer} ${ins.model}` : 'instrument specification incomplete — record what is known; do not invent');
      if (requireCalibration) {
        record(`instrument[${i}].calibration`, cal.status === 'valid' && cal.certificateRef ? 'pass' : 'warn',
          cal.status === 'missing' ? 'no calibration certificate recorded — recorded as MISSING evidence, not inferred' : `status: ${cal.status}${cal.certificateRef ? ' (' + cal.certificateRef + ')' : ''}`);
      }
    }
  }

  // ---- checksum ------------------------------------------------------------
  if (dataset.source?.sha256) {
    record('checksum.present', 'pass', dataset.source.sha256.slice(0, 16) + '…');
  } else {
    record('checksum.present', 'fail', 'no SHA-256 of the raw source text — provenance not verifiable');
  }

  // ---- samples -------------------------------------------------------------
  const samples = dataset.samples ?? [];
  record('samples.present', samples.length > 0 ? 'pass' : 'fail', `${samples.length} sample(s)`);
  if (samples.length === 0) {
    return finalize(dataset, checks, 'rejected');
  }

  // finite values + missing markers
  let nonFinite = 0, missing = 0, total = 0;
  for (const s of samples) {
    for (const [k, v] of Object.entries(s)) {
      if (v === null || v === undefined) { missing += 1; continue; }
      total += 1;
      if (typeof v === 'number' && !Number.isFinite(v)) nonFinite += 1;
    }
  }
  record('values.finite', nonFinite === 0 ? 'pass' : 'fail',
    nonFinite === 0 ? `${total} values all finite` : `${nonFinite} non-finite value(s) (NaN/Infinity) — must not enter analysis`);
  record('values.missing', missing > 0 ? 'warn' : 'pass',
    `${missing} missing value(s) recorded with markers — preserved, never silently dropped`);

  // physical plausibility (caller-supplied ranges, SI units)
  for (const [qty, range] of Object.entries(quantityChecks)) {
    const vals = samples.map((s) => s[qty]).filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (vals.length === 0) continue;
    const bad = vals.filter((v) => v < range.min || v > range.max);
    record(`plausibility.${qty}`, bad.length === 0 ? 'pass' : 'fail',
      bad.length === 0 ? `all ${vals.length} within [${range.min}, ${range.max}]` : `${bad.length} value(s) outside [${range.min}, ${range.max}]`);
  }

  // timestamps / sampling interval
  const times = samples.map((s) => s.t).filter((t) => typeof t === 'number' && Number.isFinite(t));
  if (times.length !== samples.length) {
    record('timestamps', 'fail', 'missing or non-numeric timestamps');
  } else {
    const sorted = times.every((t, i) => i === 0 || t >= times[i - 1]);
    const dupTimes = times.some((t, i) => i > 0 && t === times[i - 1]);
    record('timestamps.monotonic', sorted ? 'pass' : 'fail', sorted ? 'non-decreasing' : 'timestamps decrease somewhere');
    if (dupTimes) record('timestamps.duplicates', 'warn', 'duplicate timestamps present (repeated readings?) — retained, flagged');
  }

  // duplicate observations (identical full rows)
  const seen = new Set();
  let dupRows = 0;
  for (const s of samples) {
    const key = JSON.stringify(s);
    if (seen.has(key)) dupRows += 1;
    seen.add(key);
  }
  record('duplicates.rows', dupRows === 0 ? 'pass' : 'warn',
    dupRows === 0 ? 'no identical sample rows' : `${dupRows} identical row(s) — retained and flagged (may be legitimate repeats)`);

  // outlier identification (never removal): median/MAD modified z-scores
  // (Iglewicz–Hoaglin) — robust to the outliers themselves, unlike a mean/σ
  // z-score which a single extreme value can mask.
  for (const key of numericKeys(samples)) {
    const vals = samples.map((s) => s[key]).filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (vals.length < 5) continue;
    const sortedVals = [...vals].sort((a, b) => a - b);
    const median = sortedVals[Math.floor(sortedVals.length / 2)];
    const deviations = vals.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
    const mad = deviations[Math.floor(deviations.length / 2)];
    if (mad === 0) continue;
    // modified z-score: 0.6745·(x − median)/MAD; |Mi| > 3.5 → outlier
    const outliers = vals.filter((v) => Math.abs(0.6745 * (v - median) / mad) > 3.5).length;
    if (outliers > 0) record(`outliers.${key}`, 'warn',
      `${outliers} value(s) beyond the median/MAD threshold (modified z > 3.5) — IDENTIFIED ONLY, retained in the raw data; any filtering must be a recorded, reversible transformation`);
  }

  // calibration metadata presence
  const hasCal = instruments.some((i) => i.calibration?.certificateRef);
  record('calibration.metadata', hasCal ? 'pass' : 'warn',
    hasCal ? 'calibration certificate referenced' : 'no calibration certificate — recorded as missing evidence, not inferred');

  // replicates
  if (dataset.replicates) record('replicates', 'pass', `${dataset.replicates.length ?? 0} replicate group(s) declared`);
  else record('replicates', 'warn', 'no replicate structure declared — repeatability cannot be assessed');

  // checksum verification of the raw source
  if (dataset.rawSourceText) {
    const ok = sha256(dataset.rawSourceText) === dataset.source?.sha256;
    record('checksum.verified', ok ? 'pass' : 'fail', ok ? 'raw source matches recorded SHA-256' : 'RAW SOURCE DOES NOT MATCH the recorded checksum — data may have been altered');
  }

  return finalize(dataset, checks, verdictOf(checks));
}

function numericKeys(samples) {
  const keys = new Set();
  for (const s of samples.slice(0, 5)) {
    for (const [k, v] of Object.entries(s)) {
      if (typeof v === 'number' && Number.isFinite(v) && k !== 't') keys.add(k);
    }
  }
  return [...keys];
}

function verdictOf(checks) {
  if (checks.some((c) => c.status === 'fail')) return 'rejected';
  if (checks.some((c) => c.status === 'warn')) return 'conditionally-usable';
  return 'accepted';
}

function finalize(dataset, checks, verdict) {
  const reasons = checks.filter((c) => c.status !== 'pass').map((c) => `${c.check}: ${c.status}${c.detail ? ' — ' + c.detail : ''}`);
  // provenance ≠ quality: even accepted quality cannot upgrade a non-real origin
  const trustGate = dataset.origin === 'real-measurement'
    ? 'origin is real-measurement — this dataset MAY support physical-validation evidence if quality and criteria allow'
    : `origin is ${dataset.origin} — this dataset can NEVER support a physical-validation claim, regardless of quality`;
  return {
    verdict,
    checks,
    reasons,
    trustGate,
    physicalValidationAllowed: dataset.origin === 'real-measurement' && verdict === 'accepted',
    stats: {
      samples: (dataset.samples ?? []).length,
      checksTotal: checks.length,
      checksPassed: checks.filter((c) => c.status === 'pass').length,
      checksWarned: checks.filter((c) => c.status === 'warn').length,
      checksFailed: checks.filter((c) => c.status === 'fail').length,
    },
  };
}
