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
 * Centralized physical-validation eligibility assessment.
 * Returns { allowed, blockers, scope }.
 * A single blocker prevents the validated status.
 */
function assessPhysicalValidationEligibility({
  dataset, quality, criteriaMet, criteriaResults,
  envelope, quantities, samples,
  calibrationRef, calibrationRecord, splitManifest,
  provenanceVerified, provenanceReceipt, validationPlan, model, declaredUse,
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
    // classify each sample's operating conditions
    const sampleEnvelopes = [];
    for (const sample of samples) {
      const request = {};
      for (const qty of Object.keys(envelope.ranges)) {
        request[qty] = sample[qty];
      }
      const cls = classifyRequest(envelope, request);
      sampleEnvelopes.push(cls);
    }
    const outside = sampleEnvelopes.filter((c) => c.classification === 'outside-demonstrated-envelope');
    const insufficient = sampleEnvelopes.filter((c) => c.classification === 'insufficient-evidence');
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

  // G7: if calibration parameters are used, a split manifest must verify
  // holdout independence (no calibration/validation overlap). Also detect
  // dataset checksum overlap (same data used for fitting and validation).
  if (calibrationRef || calibrationRecord) {
    if (calibrationRecord?.dataset?.checksum && dataset.source?.datasetSha256) {
      if (calibrationRecord.dataset.checksum === dataset.source.datasetSha256) {
        blockers.push('G7: DATA LEAKAGE — calibration and validation use the SAME dataset (matching checksums). Holdout independence violated.');
      }
    }
    if (!calibrationRecord || !calibrationRecord.dataset?.checksum || !calibrationRecord.dataset?.id || (calibrationRef && calibrationRecord.id !== calibrationRef)) blockers.push('G7: calibration record missing or not bound to its source dataset');
    if (!splitManifest) {
      blockers.push('G7: calibration parameters used but no split manifest — holdout independence cannot be verified');
    } else {
      const v = verifySplit(splitManifest, dataset);
      if (!v.ok) blockers.push(`G7: split manifest verification failed: ${v.errors.join('; ')}`);
      // A positional split alone is not a cross-dataset independence certificate.
      if (!splitManifest.sourceDatasetId || !splitManifest.sourceDatasetSha256 ||
          splitManifest.sourceDatasetId !== dataset.id || splitManifest.sourceDatasetSha256 !== dataset.source?.datasetSha256) {
        blockers.push('G7: split manifest not bound to the validation dataset and source checksum');
      }
      const used = calibrationRecord?.dataset?.sampleIndices;
      const expected = splitManifest.partition?.calibration?.sampleIndices ?? [];
      if (!Array.isArray(used) || used.length !== expected.length || used.some(i => !expected.includes(i))) blockers.push('G7: calibration record does not establish which fitting samples were used');
    }
  }

  const scope = {
    dataset: dataset.id,
    quantities: quantities.map((q) => q.name ?? q),
    envelope: envelope?.id ?? null,
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

  // ---- comparisons (unchanged) --------------------------------------------
  const comparisons = [];
  for (const sample of dataset.samples) {
    const point = { ...sample, ...(sample.values ?? {}) };
    const predicted = model.predict({ ...params, ...point });
    for (const q of quantities) {
      const name = q.name ?? q;
      const measured = point[name];
      const pred = predicted[name];
      const measUnc = q.measurementUncertainty ?? dataset.uncertainty?.[name] ?? null;
      if (measured == null || pred == null || !Number.isFinite(Number(measured)) || !Number.isFinite(Number(pred))) {
        comparisons.push({ sampleIndex: dataset.samples.indexOf(sample), quantity: name, status: 'missing-data', measured, predicted });
        continue;
      }
      const m = Number(measured), p = Number(pred);
      comparisons.push({
        sampleIndex: dataset.samples.indexOf(sample),
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
    const allOverlap = withUnc.length > 0 && withUnc.every((c) => c.withinMeasurementUncertainty);
    criteriaResults.push({ criterion: 'predictions within measurement uncertainty', met: withUnc.length > 0 && allOverlap, actual: withUnc.length > 0 ? 'verified' : 'NO measurement uncertainty declared — overlap cannot be verified' });
  }
  if (criteria.maxBias !== undefined) {
    criteriaResults.push({ criterion: `|bias| <= ${criteria.maxBias}`, met: bias !== null && Math.abs(bias) <= criteria.maxBias, actual: bias });
  }
  const criteriaMet = criteriaResults.length > 0 && criteriaResults.every((c) => c.met);

  // ---- centralized physical-validation eligibility (review round 1) --------
  const eligibility = assessPhysicalValidationEligibility({
    dataset, quality, criteriaMet, criteriaResults,
    envelope, quantities, samples: dataset.samples,
    calibrationRef, calibrationRecord, splitManifest,
    provenanceVerified, provenanceReceipt, validationPlan, model, declaredUse,
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
    params,
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
    criteria, criteriaResults, criteriaMet,
    comparisons,
    statistics: { bias, rmse, maxAbsError, comparedCount: compared.length, missingCount: comparisons.length - compared.length },
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
