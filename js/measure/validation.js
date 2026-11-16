// validation.js — experimental comparison engine (Phase 3 §8) and the
// strict calibration/validation separation (§6) + evidence integration (§12).
//
// CENTRALIZED ELIGIBILITY SYSTEM (review round 1 on PR #3):
// physical validation is allowed ONLY when EVERY mandatory gate passes.
// No single favorable condition (accurate predictions, real origin claim,
// etc.) can override a failed evidence requirement. The gates are:
//
//   G1  dataset origin is real-measurement
//   G2  dataset quality verdict is accepted (not conditionally-usable)
//   G3  raw-source provenance has been verified (checksum checked)
//   G4  prespecified criteria are met
//   G5  a validation envelope with tested points is provided
//   G6  every sample's operating point classifies as
//       within-demonstrated-envelope (not interpolation, outside, etc.)
//   G7  if calibration parameters are used, a verified split manifest
//       proves holdout independence (no sample overlap)
//
// A single failed gate produces physicalValidation.status = 'none' with the
// reason recorded. Favorable numerical residuals cannot override failed
// evidence requirements.

import { sha256, sourceReceiptMatches } from './dataset.js';
import { qualityReport } from './quality.js';
import { classifyRequest } from './envelope.js';
import { verifySplit } from './split.js';

const registeredPlans = new WeakSet();
/** A scope-bound in-process plan; independent evidence of advance approval still requires external review. */
export function registerValidationPlan({ modelId, datasetId, envelopeId, declaredUse, criteria, approvalRecord = null }) {
  if (!modelId || !datasetId || !envelopeId || !declaredUse || !criteria || typeof criteria !== 'object') throw new Error('validation plan requires model, dataset, envelope, use and criteria');
  const plan = Object.freeze({ format: 'invention-lab/validation-plan/1', modelId, datasetId, envelopeId, declaredUse, criteria: deepFreeze(structuredClone(criteria)), approvalRecord });
  registeredPlans.add(plan);
  return plan;
}


/**
 * Confirm tested operating points are linked to the exact observations in the
 * versioned validation dataset. This proves traceable sample association, not
 * that a claimed instrument reading is independently authentic.
 */
function envelopeEvidenceFailures(dataset, envelope) {
  const failures = [];
  const keys = [...Object.keys(envelope?.ranges ?? {}), ...Object.keys(envelope?.sets ?? {})];
  if (!keys.length) failures.push('envelope defines no operating quantities or categorical conditions');
  const evidence = envelope?.evidence;
  if (!evidence || evidence.datasetId !== dataset.id ||
      evidence.datasetVersion !== dataset.version ||
      evidence.datasetSha256 !== dataset.source?.datasetSha256) {
    failures.push('tested-point provenance binding missing or mismatched dataset ID/version/checksum');
    return failures;
  }
  const points = envelope.testedPoints ?? [];
  const indices = evidence.sampleIndices;
  if (!Array.isArray(indices) || indices.length !== points.length ||
      new Set(indices).size !== indices.length) {
    failures.push('tested-point provenance indices must be unique and map one-to-one to tested points');
    return failures;
  }
  for (let j = 0; j < points.length; j++) {
    const i = indices[j];
    if (!Number.isInteger(i) || i < 0 || i >= dataset.samples.length) {
      failures.push(`tested-point provenance index ${i} is outside the dataset`);
      continue;
    }
    const observed = { ...dataset.samples[i], ...(dataset.samples[i].values ?? {}) };
    for (const key of keys) {
      if (!Object.is(points[j]?.[key], observed[key])) {
        failures.push(`tested-point provenance mismatch at index ${i}: operating quantity "${key}" does not match the recorded observation`);
      }
    }
  }
  return failures;
}

/**
 * Centralized physical-validation eligibility assessment.
 * Returns { allowed, blockers, scope }.
 * A single blocker prevents the validated status.
 */
function assessPhysicalValidationEligibility({
  dataset, quality, criteria, criteriaMet, criteriaResults, comparisons,
  envelope, quantities, samples,
  calibrationRef, calibrationRecord, splitManifest,
  provenanceVerified, provenanceReceipt, validationPlan, model, params, declaredUse,
}) {
  const blockers = [];

  // G1: origin must be real-measurement
  if (dataset.origin !== 'real-measurement') {
    blockers.push(`G1: dataset origin is "${dataset.origin}" — only real-measurement can support physical validation`);
  }

  // Recompute quality; the caller cannot grant eligibility by forging a QC result.
  const independentlyCheckedQuality = qualityReport(dataset, { requireCalibration: true });
  if (independentlyCheckedQuality.verdict !== 'accepted') blockers.push(`G2: independent QC is ${independentlyCheckedQuality.verdict}`);
  if (quality.verdict !== 'accepted') {
    blockers.push(`G2: dataset quality is "${quality.verdict}" — only accepted quality can support physical validation`);
  }
  if (quality.physicalValidationAllowed === false) {
    blockers.push('G2: quality.physicalValidationAllowed is false — the quality system has blocked physical validation');
  }

  // A caller-provided boolean cannot certify raw-source integrity.
  if (!sourceReceiptMatches(dataset, provenanceReceipt)) blockers.push('G3: dataset-bound raw-source verification receipt absent or invalid; provenanceVerified boolean is insufficient');
  // An in-process registered plan is a necessary guard, but not proof of
  // approval before looking at results; external prespecification review remains required.
  if (!validationPlan || !registeredPlans.has(validationPlan) || validationPlan.modelId !== model?.id ||
      validationPlan.datasetId !== dataset.id || validationPlan.envelopeId !== envelope?.id ||
      validationPlan.declaredUse !== declaredUse || JSON.stringify(validationPlan.criteria) !== JSON.stringify(criteria)) {
    blockers.push('G4: registered scope-matching validation plan is absent or mismatched');
  }

  const supportedCriteria = new Set(['maxAbsError', 'maxRelativeError', 'maxBias', 'requireUncertaintyOverlap']);
  for (const [key, value] of Object.entries(criteria)) {
    if (!supportedCriteria.has(key)) blockers.push(`G4: unsupported acceptance criterion "${key}"`);
    else if (key === 'requireUncertaintyOverlap' ? typeof value !== 'boolean' :
      typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      blockers.push(`G4: invalid acceptance criterion "${key}" (must be finite, nonnegative numeric limit or boolean)`);
    }
  }

  // G8: every requested measurement/quantity must have a valid comparison and
  // usable uncertainty metadata. A correct-looking subset cannot qualify.
  const expectedCount = samples.length * quantities.length;
  if (!samples.length || !quantities.length || comparisons.length !== expectedCount ||
      comparisons.some(c => c.status !== 'compared')) {
    blockers.push(`G8: incomplete measurement comparisons; expected ${expectedCount}, available ${comparisons.filter(c => c.status === 'compared').length}, missing-data ${comparisons.filter(c => c.status !== 'compared').length}`);
  }
  for (const c of comparisons) {
    if (c.status === 'compared' &&
        (typeof c.measurementUncertainty !== 'number' ||
         !Number.isFinite(c.measurementUncertainty) || c.measurementUncertainty < 0)) {
      blockers.push(`G8: invalid or missing measurement uncertainty for sample ${c.sampleIndex} quantity "${c.quantity}"`);
    }
  }

  // G4: prespecified criteria must be met
  if (!criteriaMet) {
    const unmet = (criteriaResults || []).filter((c) => !c.met).map((c) => c.criterion);
    blockers.push(`G4: prespecified acceptance criteria not met${unmet.length ? ' (' + unmet.join('; ') + ')' : ''}`);
  }

  // G5+G6: envelope must exist, have tested points, and actually cover the
  // measurement conditions. We classify EACH sample's operating point.
  if (!envelope) {
    blockers.push('G5: no validation envelope provided — operating-envelope coverage cannot be verified');
  } else if (!envelope.testedPoints || envelope.testedPoints.length === 0) {
    blockers.push('G5: envelope has no tested points — insufficient evidence for any validation claim');
  } else {
    for (const failure of envelopeEvidenceFailures(dataset, envelope)) {
      blockers.push(`G5: ${failure}`);
    }
    // classify each sample's operating conditions
    const sampleEnvelopes = [];
    for (const sample of samples) {
      const request = { ...sample, ...(sample.values ?? {}) };
      const cls = classifyRequest(envelope, request);
      sampleEnvelopes.push(cls);
    }
    const outside = sampleEnvelopes.filter((c) => c.classification === 'outside-demonstrated-envelope');
    const insufficient = sampleEnvelopes.filter((c) => c.classification === 'insufficient-evidence' || c.classification === 'unsupported');
    const interpolating = sampleEnvelopes.filter((c) => c.classification === 'interpolation-with-limited-evidence');

    if (outside.length > 0) {
      blockers.push(`G6: ${outside.length}/${samples.length} measurement condition(s) outside the demonstrated envelope`);
    }
    if (insufficient.length > 0) {
      blockers.push(`G6: ${insufficient.length} measurement condition(s) have insufficient envelope evidence`);
    }
    if (interpolating.length > 0 && outside.length === 0 && insufficient.length === 0) {
      // interpolation is allowed only if explicitly declared; default is to block
      blockers.push(`G6: ${interpolating.length}/${samples.length} measurement condition(s) require interpolation (limited evidence) — not within the demonstrated envelope`);
    }
  }

  // G7: fit and holdout MUST be disjoint subsets of ONE bound source dataset.
  // A matching dataset digest is correct for a group-based split; it does not
  // imply leakage by itself. What matters is which observations were fitted.
  if (calibrationRef || calibrationRecord) {
    const fitting = calibrationRecord?.dataset;
    if (!calibrationRecord || !fitting?.id || !fitting?.checksum ||
        (calibrationRef && calibrationRecord.id !== calibrationRef)) {
      blockers.push('G7: calibration record is missing, unbound, or does not match calibrationRef');
    }
    if (!splitManifest) {
      blockers.push('G7: calibration parameters used but no split manifest — holdout independence cannot be verified');
    } else {
      const verified = verifySplit(splitManifest, dataset);
      if (!verified.ok) blockers.push(`G7: split manifest verification failed: ${verified.errors.join('; ')}`);
      if (!splitManifest.sourceDatasetId || !splitManifest.sourceDatasetSha256 ||
          splitManifest.sourceDatasetId !== dataset.id ||
          splitManifest.sourceDatasetVersion !== dataset.version ||
          splitManifest.sourceDatasetSha256 !== dataset.source?.datasetSha256) {
        blockers.push('G7: split manifest not bound to the validated dataset ID/version/checksum');
      }
      if (!splitManifest.groupField) blockers.push('G7: group-based split evidence is missing');
      const expectedCal = splitManifest.partition?.calibration?.sampleIndices ?? [];
      const expectedVal = splitManifest.partition?.validation?.sampleIndices ?? [];
      if (!expectedCal.length || !expectedVal.length) blockers.push('G7: calibration and validation partitions both require observations');
      const used = fitting?.sampleIndices;
      if (!Array.isArray(used) || used.length !== expectedCal.length ||
          new Set(used).size !== used.length || used.some(i => !expectedCal.includes(i))) {
        blockers.push('G7: calibration record does not identify the exact fitting observations in the calibration partition');
      }
      if (expectedVal.some(i => expectedCal.includes(i))) blockers.push('G7: DATA LEAKAGE — fitted sample also appears in validation partition');
      if (Array.isArray(used) && expectedVal.some(i => used.includes(i))) blockers.push('G7: DATA LEAKAGE — validation observation was used for fitting');
      // An optimizer can only attest to the vector supplied to it. Verify its
      // digest against the independent source observation IDs and quantity.
      const quantity = fitting?.quantity;
      if (!quantity || !Array.isArray(used) || !used.every(i =>
          Number.isInteger(i) && i >= 0 && i < dataset.samples.length &&
          typeof dataset.samples[i]?.[quantity] === 'number' && Number.isFinite(dataset.samples[i][quantity]))) {
        blockers.push('G7: fitted measurement quantity/observations cannot be reconciled to the source dataset');
      } else {
        const expectedDigest = sha256(JSON.stringify(used.map(i => dataset.samples[i][quantity])));
        if (!calibrationRecord?.measurementSha256 || expectedDigest !== calibrationRecord.measurementSha256) {
          blockers.push('G7: actual fitted measurement vector does not match calibration observations');
        }
      }
    }
    if (fitting?.id !== dataset.id || fitting?.checksum !== dataset.source?.datasetSha256 ||
        fitting?.version !== dataset.version) {
      blockers.push('G7: calibration input provenance differs from the holdout source dataset');
    }
    if (!calibrationRecord?.converged || calibrationRecord?.identifiability?.identifiable !== true) {
      blockers.push('G7: calibration did not demonstrate convergence and identifiable parameters');
    }
    if (!calibrationRecord?.modelId || calibrationRecord.modelId !== model?.id) {
      blockers.push('G7: calibrated model identity does not match the validated model');
    }
    const names = calibrationRecord?.params?.names;
    const values = calibrationRecord?.params?.values;
    if (!Array.isArray(names) || !Array.isArray(values) || names.length !== values.length ||
        names.some((name, i) => typeof params?.[name] !== 'number' || !Object.is(params[name], values[i]))) {
      blockers.push('G7: validated parameter values differ from frozen fitted parameter estimates');
    }
    const splitAt = Date.parse(splitManifest?.createdAt);
    const fittedAt = Date.parse(calibrationRecord?.generatedAt);
    if (!Number.isFinite(splitAt) || !Number.isFinite(fittedAt) || splitAt > fittedAt) {
      blockers.push('G7: split manifest was not recorded before the calibration run');
    }
  }

  const scope = {
    dataset: dataset.id,
    quantities: quantities.map((q) => q.name ?? q),
    envelope: envelope?.id ?? null,
    testedPointProvenance: envelope?.evidence ?? null,
  };
  return { allowed: blockers.length === 0, blockers, scope };
}

/**
 * Run an experimental validation.
 *
 * required inputs:
 *   model        { id, version?, predict: (mergedPoint) => ({ [quantity]: number }) }
 *                predict must be a PURE function of the fixed parameters;
 *                parameters are NOT fitted here (that is calibration's job).
 *   params       { name: value } — the frozen parameter set
 *   declaredUse  string — the intended engineering decision
 *   dataset      a validated measurement dataset (see dataset.js)
 *   quality      the dataset's quality report (from quality.js)
 *   criteria     prespecified acceptance criteria (recorded verbatim)
 *   envelope     the validation envelope (REQUIRED for physical validation)
 *   quantities   [{ name, measurementUncertainty? }] — quantities to compare
 *   provenanceVerified  boolean — has the raw-source checksum been verified?
 *   calibrationRef      reference to the calibration record (or null)
 *   calibrationRecord   the calibration record object (optional, for holdout check)
 *   splitManifest       the split manifest proving holdout independence
 *                       (REQUIRED when calibration parameters are used)
 *
 * Returns an immutable validation result.
 */
export function runExperimentalValidation({
  model, params, declaredUse, dataset, quality, criteria, envelope, quantities,
  calibrationRef = null, calibrationRecord = null, splitManifest = null,
  provenanceVerified = false, provenanceReceipt = null, validationPlan = null,
}) {
  const problems = [];
  if (!dataset || dataset.format !== 'invention-lab/measurement-dataset/1') {
    throw new Error('runExperimentalValidation: a valid measurement dataset is required');
  }
  if (!quality || typeof quality.verdict !== 'string') {
    throw new Error('runExperimentalValidation: the dataset quality report is required (run quality.js first)');
  }
  if (!criteria || Object.keys(criteria).length === 0) {
    throw new Error('runExperimentalValidation: prespecified acceptance criteria are required — validation thresholds must exist before results are seen');
  }
  if (quality.verdict === 'rejected') {
    problems.push('dataset quality verdict is REJECTED — the dataset cannot be used for validation');
  }
  const isReal = dataset.origin === 'real-measurement';
  if (!isReal) {
    problems.push(`dataset origin is "${dataset.origin}" — this comparison is a SOFTWARE DEMONSTRATION and cannot produce physical-validation evidence`);
  }

  // Validation of fitted parameters uses ONLY the held-out indices, never
  // the calibration subset. An invalid split remains blocked by G7.
  const usingCalibration = Boolean(calibrationRef || calibrationRecord);
  const declaredHoldout = usingCalibration && Array.isArray(splitManifest?.partition?.validation?.sampleIndices)
    ? splitManifest.partition.validation.sampleIndices : null;
  const indices = declaredHoldout
    ? declaredHoldout.filter(i => Number.isInteger(i) && i >= 0 && i < dataset.samples.length)
    : dataset.samples.map((_, i) => i);
  const selectedSamples = indices.map(i => dataset.samples[i]);

  // ---- comparisons -------------------------------------------------------
  const comparisons = [];
  for (const i of indices) {
    const sample = dataset.samples[i];
    const point = { ...sample, ...(sample.values ?? {}) };
    const predicted = model.predict({ ...params, ...point });
    for (const q of quantities) {
      const name = q.name ?? q;
      const measured = point[name];
      const pred = predicted[name];
      const measUnc = q.measurementUncertainty ?? dataset.uncertainty?.[name] ?? null;
      if (typeof measured !== 'number' || typeof pred !== 'number' || !Number.isFinite(measured) || !Number.isFinite(pred)) {
        comparisons.push({ sampleIndex: i, quantity: name, status: 'missing-data', measured, predicted });
        continue;
      }
      const m = Number(measured), p = Number(pred);
      comparisons.push({
        sampleIndex: i,
        quantity: name,
        status: 'compared',
        measured: m, predicted: p,
        residual: p - m,
        absError: Math.abs(p - m),
        relError: Math.abs(p - m) / Math.max(Math.abs(m), 1e-30),
        measurementUncertainty: measUnc,
        withinMeasurementUncertainty: measUnc != null ? Math.abs(p - m) <= Math.abs(measUnc) : null,
      });
    }
  }

  const compared = comparisons.filter((c) => c.status === 'compared');
  const residuals = compared.map((c) => c.residual);
  const bias = residuals.length ? residuals.reduce((a, b) => a + b, 0) / residuals.length : null;
  const rmse = residuals.length ? Math.sqrt(residuals.reduce((a, r) => a + r * r, 0) / residuals.length) : null;
  const maxAbsError = compared.length ? Math.max(...compared.map((c) => c.absError)) : null;

  // ---- prespecified criteria evaluation ------------------------------------
  const criteriaResults = [];
  if (criteria.maxAbsError !== undefined) {
    criteriaResults.push({ criterion: `maxAbsError <= ${criteria.maxAbsError}`, met: maxAbsError !== null && maxAbsError <= criteria.maxAbsError, actual: maxAbsError });
  }
  if (criteria.maxRelativeError !== undefined) {
    const maxRel = compared.length ? Math.max(...compared.map((c) => c.relError)) : null;
    criteriaResults.push({ criterion: `maxRelativeError <= ${criteria.maxRelativeError}`, met: maxRel !== null && maxRel <= criteria.maxRelativeError, actual: maxRel });
  }
  if (criteria.requireUncertaintyOverlap) {
    const withUnc = compared.filter((c) => c.measurementUncertainty != null);
    const allOverlap = compared.length > 0 && withUnc.length === compared.length && withUnc.every((c) =>
      typeof c.measurementUncertainty === 'number' && Number.isFinite(c.measurementUncertainty) && c.measurementUncertainty >= 0 && c.withinMeasurementUncertainty);
    criteriaResults.push({ criterion: 'predictions within measurement uncertainty', met: allOverlap, actual: allOverlap ? 'verified' : 'measurement uncertainty unavailable, invalid, or insufficient for at least one comparison' });
  }
  if (criteria.maxBias !== undefined) {
    criteriaResults.push({ criterion: `|bias| <= ${criteria.maxBias}`, met: bias !== null && Math.abs(bias) <= criteria.maxBias, actual: bias });
  }
  const criteriaMet = criteriaResults.length > 0 && criteriaResults.every((c) => c.met);

  // ---- centralized physical-validation eligibility (review round 1) --------
  const eligibility = assessPhysicalValidationEligibility({
    dataset, quality, criteria, criteriaMet, criteriaResults, comparisons,
    envelope, quantities, samples: selectedSamples,
    calibrationRef, calibrationRecord, splitManifest,
    provenanceVerified, provenanceReceipt, validationPlan, model, params, declaredUse,
  });

  // Software cannot independently authenticate an experimental acquisition or
  // certify the holdout review. Leave physical validation NONE until those
  // external trust requirements are established.
  const stage = 'softwareDemonstration';
  const pvStatus = 'none';
  const pvNote = eligibility.allowed
    ? 'Programmatic eligibility satisfied, but independent acquisition and holdout review remain unverified: NOT physical validation.'
    : eligibility.blockers.join(' | ');

  const result = {
    format: 'invention-lab/validation-result/1',
    generatedAt: new Date().toISOString(),
    model: { id: model.id, version: model.version ?? null },
    params: structuredClone(params),
    paramProvenance: { source: calibrationRef ? `calibration record ${calibrationRef}` : 'nominal values', calibrationRef },
    declaredUse,
    dataset: {
      id: dataset.id,
      origin: dataset.origin,
      claimedOrigin: dataset.origin,
      checksum: dataset.source?.datasetSha256 ?? dataset.source?.sha256 ?? null,
      rawFileChecksum: dataset.source?.rawFileSha256 ?? null,
      sampleCount: dataset.samples.length,
    },
    criteria: structuredClone(criteria), criteriaResults, criteriaMet,
    comparisons,
    statistics: { bias, rmse, maxAbsError, comparedCount: compared.length, missingCount: comparisons.length - compared.length, sampleIndices: indices },
    problems,
    stage,
    physicalValidation: {
      status: pvStatus,
      note: pvNote,
      scope: eligibility.scope,
      blockers: eligibility.blockers,
      programmaticEligibility: eligibility.allowed ? 'candidate-for-independent-review' : 'blocked',
    },
  };
  return deepFreeze(result);
}

/** deep-freeze including nested objects and arrays (result immutability) */
function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val && typeof val === 'object') deepFreeze(val);
      if (Array.isArray(val)) val.forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); });
    }
  }
  return obj;
}

/** provenance checksum over a validation result (for artifact integrity). */
export function resultChecksum(result) {
  return sha256(JSON.stringify({ ...result, _checksumField: null }));
}

export { sha256 };
