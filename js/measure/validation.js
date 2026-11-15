// validation.js — experimental comparison engine (Phase 3 §8) and the
// strict calibration/validation separation (§6) + evidence integration (§12).
//
// TRUST GATES (all enforced, all tested):
//  1. Only `real-measurement` datasets can support a physical-validation claim.
//     A synthetic/analytical/numerical dataset produces a SOFTWARE
//     DEMONSTRATION result — never a physical-validation claim.
//  2. Calibration accuracy is never presented as independent validation
//     accuracy: the validation dataset must come from a split manifest whose
//     groups are disjoint from the calibration groups.
//  3. A validation result is scoped to the specific model, quantity,
//     experiment, and operating envelope — it never generalizes.
//  4. The prespecified acceptance criteria must be recorded BEFORE results
//     are seen (the criteria object is part of the immutable result).

import { sha256 } from './dataset.js';
import { envelopeGate } from './envelope.js';

/**
 * Run an experimental validation.
 *
 * required inputs:
 *   model        { id, version?, predict: (point) => ({ [quantity]: number }) }
 *                predict must be a PURE function of the fixed parameters;
 *                parameters are NOT fitted here (that is calibration's job).
 *   params       { name: value } — the frozen parameter set (with provenance:
 *                where they came from — nominal, calibrated-at-<ref>, etc.)
 *   declaredUse  string — the intended engineering decision
 *   dataset      a validated measurement dataset (see dataset.js)
 *   quality      the dataset's quality report (from quality.js)
 *   criteria     prespecified acceptance criteria, e.g.
 *                { maxAbsError: 0.05, maxRelativeError: 0.05, requireUncertaintyOverlap: true }
 *                (recorded verbatim in the result)
 *   envelope     the validation envelope (from envelope.js)
 *   quantities   [{ name }] — the quantities to compare (must exist in the
 *                dataset samples and in model.predict output)
 *   calibrationRef  reference to the calibration record (or null if params
 *                are nominal) — recorded so calibration accuracy can never be
 *                presented as independent validation accuracy.
 *
 * Returns an immutable validation result. If dataset.origin is not
 * 'real-measurement', the result's stage is 'softwareDemonstration' and
 * `physicalValidation` is explicitly 'none'.
 */
export function runExperimentalValidation({ model, params, declaredUse, dataset, quality, criteria, envelope, quantities, calibrationRef = null }) {
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
  if (quality.physicalValidationAllowed === false && isReal) {
    problems.push('dataset quality does not permit physical-validation evidence');
  }

  const comparisons = [];
  for (const sample of dataset.samples) {
    const point = {
      ...sample,
      ...(sample.values ?? {}),
    };
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

  // prespecified criteria evaluation (criteria verbatim in the result)
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

  const result = {
    format: 'invention-lab/validation-result/1',
    generatedAt: new Date().toISOString(),
    model: { id: model.id, version: model.version ?? null },
    params,
    paramProvenance: { source: calibrationRef ? `calibration record ${calibrationRef}` : 'nominal values', calibrationRef },
    declaredUse,
    dataset: {
      id: dataset.id, origin: dataset.origin,
      checksum: dataset.source?.sha256 ?? null,
      sampleCount: dataset.samples.length,
    },
    criteria, criteriaResults, criteriaMet,
    comparisons,
    statistics: { bias, rmse, maxAbsError, comparedCount: compared.length, missingCount: comparisons.length - compared.length },
    problems,
    stage: isReal ? 'physicalValidation' : 'softwareDemonstration',
    physicalValidation: {
      status: isReal && ['accepted', 'conditionally-usable'].includes(quality.verdict) && criteriaMet ? 'pending-envelope-gate' : 'none',
      note: isReal
        ? (['accepted', 'conditionally-usable'].includes(quality.verdict)
          ? 'real-measurement dataset: physical-validation claim REQUIRES the envelope gate to also pass (see envelopeGate)'
          : `dataset quality verdict is "${quality.verdict}" — not accepted for physical validation`)
        : `dataset origin is "${dataset.origin}": this is a software demonstration — physical validation is none by definition`,
    },
  };

  // envelope gate runs last: it can downgrade a pending claim
  // (freeze AFTER the gate, not before — the gate modifies the result)
  if (result.physicalValidation.status === 'pending-envelope-gate') {
    const gate = envelopeGate({ classification: 'within-demonstrated-envelope', datasetOrigin: dataset.origin, criteriaMet });
    result.physicalValidation = gate.allowed
      ? { status: 'validated', scope: { dataset: dataset.id, quantities: quantities.map((q) => q.name ?? q), envelope: envelope?.id ?? null }, note: gate.reason }
      : { status: 'none', note: gate.reason };
    result.stage = gate.allowed ? 'physicalValidation' : 'softwareDemonstration';
  }
  return Object.freeze(result);
}

/** provenance checksum over a validation result (for artifact integrity). */
export function resultChecksum(result) {
  return sha256(JSON.stringify({ ...result, _checksumField: null }));
}

export { sha256 };
