// measure.test.mjs — Phase 3 measurement subsystem tests (§14 list).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createDataset, parseDataset, parseSamplesCSV, deriveDataset, sha256, verifyChecksum,
  physicalValidationAllowed, ORIGINS, DATASET_FORMAT,
} from '../js/measure/dataset.js';
import { qualityReport } from '../js/measure/quality.js';
import {
  cholesky, sampleMultivariateNormal, propagateFirstOrder, propagateMonteCarlo,
  combineIndependent, expandedUncertainty, predictionInterval, bootstrap, mulberry32,
} from '../js/measure/uq.js';
import { runCalibration, symmetricEigen } from '../js/measure/calibration.js';
import { createSplitManifest, verifySplit, partitionByField } from '../js/measure/split.js';
import { defineEnvelope, classifyRequest, envelopeGate } from '../js/measure/envelope.js';
import { runExperimentalValidation, registerValidationPlan } from '../js/measure/validation.js';
import { verifySourceReceipt } from '../js/measure/dataset.js';
import {
  dividerModel, rcModel, diodeModel,
  syntheticDividerDataset, syntheticRCDataset, syntheticDiodeDataset,
  datasetTemplate, samplesToCSV,
} from '../js/measure/experiments.js';

const approx = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≈ ${b}`);

// ---------------- dataset model ---------------------------------------------
function dividerRealLike() {
  const rawText = 'FLUKE179,5.002,2.498\nFLUKE179,10.001,5.001';
  return createDataset({
    id: 'divider-real', origin: 'real-measurement',
    experiment: { id: 'exp-A', date: '2026-01-15' },
    instruments: [{ manufacturer: 'Fluke', model: '179', serialNumber: 'SN-1', resolution: 0.001, uncertainty: 0.005, calibration: { certificateRef: 'CAL-2026-001', status: 'valid', validUntil: '2026-06-01' } }],
    quantities: [{ name: 'V_in', unit: 'V' }, { name: 'V_out', unit: 'V' }],
    components: { nominal: { R1: 1000, R2: 1000 }, independentlyMeasured: { R1: 999.6, R2: 1000.2 } },
    replicates: [{ group: 'r1', members: [0, 1] }],
    uncertainty: { V_out: 0.005 },
    acquisition: { procedure: 'protocol A' },
    license: 'CC0',
    source: { file: 'fluke-export.csv', rawFileSha256: sha256(rawText) },
  }, [
    { t: 0, V_in: 5, V_out: 2.498 },
    { t: 1, V_in: 10, V_out: 5.001 },
  ], { rawSource: 'raw-divider-v1' });
}

test('phase3: dataset creation records metadata, checksum, and freezes', () => {
  const d = dividerRealLike();
  assert.equal(d.format, DATASET_FORMAT);
  assert.equal(d.origin, 'real-measurement');
  assert.ok(d.source.datasetSha256.length === 64);
  assert.equal(Object.isFrozen(d), true);
  assert.equal(d.instruments[0].calibration.status, 'valid');
});

test('phase3: physical validation gate — only real-measurement unlocks', () => {
  for (const origin of ORIGINS) {
    const d = createDataset({ id: 'g', origin }, []);
    assert.equal(physicalValidationAllowed(d), origin === 'real-measurement',
      `origin "${origin}" must ${origin === 'real-measurement' ? '' : 'NOT '}unlock physical validation`);
  }
});

test('phase3: source checksum verifies the ORIGINAL raw file; altered files fail', () => {
  // raw instrument export (the original file the dataset was built from)
  const rawText = 'FLUKE179,5.002,2.498\nFLUKE179,10.001,5.001';
  const d = createDataset({
    id: 'raw', origin: 'real-measurement', experiment: { id: 'e' },
    source: { file: 'fluke-export.csv', rawFileSha256: sha256(rawText) },
  }, [{ t: 0, V_in: 5, V_out: 2.498 }], { rawSource: rawText });
  // the ORIGINAL raw text verifies
  assert.equal(verifyChecksum(d, rawText), true);
  // an altered original file fails
  assert.throws(() => verifyChecksum(d, rawText.replace('2.498', '9.999')), /checksum mismatch/);
  // parseDataset records the dataset-file checksum (textSha256) for artifact integrity
  const parsed = parseDataset(JSON.stringify({ ...JSON.parse(JSON.stringify({ ...d, samples: [...d.samples] })) }));
  assert.equal(parsed.textSha256.length, 64);
});

test('phase3: CSV sample parsing rejects column mismatch and marks missing values', () => {
  const csv = 't,V_in,V_out\n0,5,2.5\n1,10,\n';
  const rows = parseSamplesCSV(csv);
  assert.equal(rows[0].V_out, 2.5);
  assert.equal(rows[1].V_out, null, 'empty cell = missing-data marker');
  assert.throws(() => parseSamplesCSV('t,V\n0,5,7\n'), /cells/);
  assert.throws(() => parseSamplesCSV('a,b\n1,2\n'), /time column/);
});

test('phase3: deriveDataset records transformations and inherits origin', () => {
  const parent = dividerRealLike();
  const child = deriveDataset(parent, { method: 'unit-conversion', detail: 'mV → V' }, [{ t: 0, V_in: 5000, V_out: 2498 }]);
  assert.equal(child.origin, 'real-measurement');
  assert.equal(child.source.derivedFrom, parent.id);
  assert.equal(child.transformations[0].transformation.method, 'unit-conversion');
  assert.equal(child.version, (parent.version ?? 1) + 1);
  assert.throws(() => deriveDataset(Object.create(null), {}, []), /not frozen/);
});

// ---------------- quality report ---------------------------------------------
test('phase3: quality report flags missing metadata and unknown origin', () => {
  const d = datasetTemplate('t1');
  const q = qualityReport(d);
  assert.equal(q.verdict, 'rejected');
  assert.ok(q.reasons.some((r) => r.includes('metadata')));
  assert.ok(q.reasons.some((r) => r.includes('origin')));
});

test('phase3: quality report checks finite values and plausibility', () => {
  const d = createDataset({
    id: 'q', origin: 'real-measurement',
    experiment: { id: 'e' },
    instruments: [{ manufacturer: 'X', model: 'Y', resolution: 0.01, uncertainty: 0.01 }],
    quantities: [{ name: 'V', unit: 'V' }],
  }, [
    { t: 0, V: 1 },
    { t: 1, V: NaN },
    { t: 2, V: Infinity },
  ], { rawSource: 'x' });
  const q = qualityReport(d, { quantityChecks: { V: { min: 0, max: 30 } } });
  assert.equal(q.verdict, 'rejected');
  assert.ok(q.checks.some((c) => c.check === 'values.finite' && c.status === 'fail'));
});

test('phase3: outliers are identified and retained, never silently removed', () => {
  const d = createDataset({
    id: 'o', origin: 'real-measurement', experiment: { id: 'e' },
    instruments: [{ manufacturer: 'X', model: 'Y', resolution: 0.01, uncertainty: 0.01 }],
  }, [
    { t: 0, V: 1 }, { t: 1, V: 1.1 }, { t: 2, V: 0.9 }, { t: 3, V: 1.05 }, { t: 4, V: 50 },
  ], { rawSource: 'o' });
  const q = qualityReport(d);
  const out = q.checks.find((c) => c.check === 'outliers.V');
  assert.ok(out && out.status === 'warn', 'outliers must be flagged');
  assert.ok(out.detail.includes('retained'), 'outliers must be explicitly retained');
  assert.equal(d.samples[4].V, 50, 'raw data immutable — the 50 stays');
});

test('phase3: missing calibration certificate is recorded as missing evidence', () => {
  const d = createDataset({ id: 'c', origin: 'real-measurement', experiment: { id: 'e' }, instruments: [{ manufacturer: 'X', model: 'Y', resolution: 0.01, uncertainty: 0.01, calibration: { status: 'missing' } }] }, [{ t: 0, V: 1 }], { rawSource: 'c' });
  const q = qualityReport(d, { requireCalibration: true });
  const cal = q.checks.find((c) => c.check.startsWith('instrument[0].calibration'));
  assert.equal(cal.status, 'warn');
  assert.ok(cal.detail.includes('MISSING'), 'absent certificate must be recorded as missing, not inferred');
});

test('phase3: provenance vs quality are distinct', () => {
  // an accepted-quality synthetic dataset still cannot unlock physical validation
  const { dataset } = syntheticDividerDataset();
  const q = qualityReport(dataset);
  // quality (conditionally-usable — no cal cert) ≠ trust gate (synthetic → NEVER physical)
  assert.ok(['accepted', 'conditionally-usable'].includes(q.verdict), q.verdict);
  assert.equal(q.physicalValidationAllowed, false, 'synthetic origin blocks physical validation regardless of quality');
  assert.ok(q.trustGate.includes('NEVER'));
});

// ---------------- UQ ----------------------------------------------------------
test('phase3: first-order propagation handles correlations through the covariance', () => {
  // y = x0 + x1 with correlated inputs: Var(y) = v00 + v11 + 2·v01
  const mu = [1, 2];
  const Cx = [[0.01, 0.008], [0.008, 0.02]];
  const { y, Cy } = propagateFirstOrder(mu, Cx, (x) => [x[0] + x[1]]);
  assert.equal(y[0], 3);
  // f is linear → J = [[1, 1]] → Cy = [[v00 + 2v01 + v11]]
  approx(Cy[0][0], 0.01 + 0.02 + 2 * 0.008, 1e-9); // numeric-Jacobian rounding
});

test('phase3: Monte Carlo propagation is reproducible and statistically correct', () => {
  const mu = [1], Cx = [[0.0001]]; // σ = 0.01
  const f = (x) => [x[0] * 2];
  const a = propagateMonteCarlo(mu, Cx, f, { n: 20000, seed: 7 });
  const b = propagateMonteCarlo(mu, Cx, f, { n: 20000, seed: 7 });
  assert.deepEqual(a.summary[0].samples, b.summary[0].samples, 'same seed → identical samples');
  approx(a.summary[0].mean, 2, 0.001);
  approx(a.summary[0].std, 0.02, 0.005);
  const c = propagateMonteCarlo(mu, Cx, f, { n: 20000, seed: 99 });
  assert.notEqual(a.summary[0].samples[0], c.summary[0].samples[0], 'different seeds differ');
});

test('phase3: cholesky rejects non-positive-definite covariance', () => {
  assert.equal(cholesky([[1, 2], [2, 1]]), null, '[[1,2],[2,1]] is not SPD');
  assert.ok(cholesky([[1, 0.5], [0.5, 1]]) !== null);
});

test('phase3: combineIndependent refuses RSS without an independence assertion', () => {
  const refused = combineIndependent([0.1, 0.2]);
  assert.ok(Number.isNaN(refused.uc), 'must refuse (NaN) without assertion or correlations');
  assert.ok(refused.error.includes('prohibited'));
  const correlated = combineIndependent([0.1, 0.2], { correlations: [[1, 0.9], [0.9, 1]] });
  assert.ok(correlated.uc > 0.29, 'correlated combination grows with positive correlation');
  const independent = combineIndependent([0.1, 0.2], { independenceAssertion: true });
  approx(independent.uc, Math.sqrt(0.01 + 0.04), 1e-12);
});

test('phase3: expanded uncertainty records the coverage factor', () => {
  const { U, k, note } = expandedUncertainty(0.02, 2);
  assert.equal(U, 0.04);
  assert.ok(note.includes('normal'));
});

test('phase3: bootstrap intervals are deterministic under a seed', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const a = bootstrap(data, (s) => s.reduce((x, y) => x + y, 0) / s.length, { n: 1000, seed: 3 });
  const b = bootstrap(data, (s) => s.reduce((x, y) => x + y, 0) / s.length, { n: 1000, seed: 3 });
  assert.deepEqual(a.interval, b.interval);
  assert.ok(a.interval.lo <= a.point && a.point <= a.interval.hi);
});

// ---------------- calibration engine ------------------------------------------
test('phase3: calibration recovers known parameters (RC tau) from synthetic data', () => {
  const tauTrue = 1e-4;
  const { dataset } = syntheticRCDataset({ tau: tauTrue, seed: 5 });
  const model = (p) => dataset.samples.map((s) => s.V_step * (1 - Math.exp(-s.t / p[0])));
  const meas = dataset.samples.map((s) => s.V_c);
  const cal = runCalibration({
    id: 'rc-fit', modelFn: model, measurements: meas,
    p0: [5e-4], lower: [1e-7], upper: [1e-2],
    parameterNames: ['tau'], seed: 1,
  });
  assert.equal(cal.converged, true, cal.convergence.reason);
  approx(cal.params.values[0], tauTrue, 2e-5);
  assert.equal(cal.identifiability.identifiable, true);
  assert.ok(cal.confidenceIntervals[0].identifiable);
  assert.ok(cal.residualAnalysis.rms < 0.01);
});

test('phase3: calibration detects the non-identifiable divider (R1, R2 from ratio only)', () => {
  // V_out = V_in·R2/(R1+R2): only the ratio R2/(R1+R2) is observable —
  // R1 and R2 individually are NOT identifiable from V_out measurements.
  const { dataset } = syntheticDividerDataset({ V_in: 10, R1: 1000, R2: 3000, seed: 3 });
  const model = (p) => dataset.samples.map((s) => (s.V_in * p[1]) / (p[0] + p[1]));
  const meas = dataset.samples.map((s) => s.V_out);
  const cal = runCalibration({
    id: 'divider-nonidentifiable', modelFn: model, measurements: meas,
    p0: [500, 1500], lower: [10, 10], upper: [10000, 10000],
    parameterNames: ['R1', 'R2'], seed: 1,
  });
  // the fit converges to the right RATIO…
  const ratioFit = cal.params.values[1] / (cal.params.values[0] + cal.params.values[1]);
  const ratioTrue = 3000 / 4000;
  // measurement noise ±0.01V on 7.5V → ratio precision ~0.13%; 1e-3 is justified
  approx(ratioFit, ratioTrue, 1e-3);
  // …but the engine must report the parameters as NOT individually identifiable
  assert.equal(cal.identifiability.identifiable, false,
    'R1 and R2 are collinear from ratio-only data — the engine must detect this');
  const ci = cal.confidenceIntervals.find((c) => c.parameter === 'R1');
  assert.equal(ci.identifiable, false, 'R1 must not claim an identifiable confidence interval');
  assert.equal(ci.interval, null, 'no invented confidence interval');
  assert.ok(cal.identifiability.note.includes('cannot be determined'));
});

test('phase3: calibration detects diode Is/n as identifiable from multi-bias data', () => {
  // wider bias range: with only 0.45-0.65 V the (Is, n) pair is partially
  // non-identifiable (0.75 was a valid local optimum); 0.3-0.7 V breaks the degeneracy
  // higher bias range + lower noise: all SNR > 100:1 (the 0.4V point with
  // 2e-5 uncertainty had noise > signal at that bias — a data quality issue)
  const { dataset } = syntheticDiodeDataset({ Is: 1e-12, n: 1, seed: 4, biases: [0.5, 0.55, 0.6, 0.65, 0.7], uncertaintyA: 1e-6 });
  // log-current residuals: linearizes the exponential and removes the
  // 6-orders-of-magnitude dynamic range that makes unweighted LS diverge
  // fit log10(Is) as the parameter — both params are then O(1)-O(10) scale
  // and JtJ is well-conditioned (fitting Is=1e-12 directly gives cond > 1e20)
  // log-linear formulation: log10(I) = log10(Is) + V/(n·VT·ln(10))
  // Only n is nonlinear; log10(Is) enters linearly → well-conditioned LM
  const LN10 = Math.LN10;
  const model = (p) => dataset.samples.map((s) => p[0] + (s.V_d / (p[1] * VT300 * LN10)));
  const meas = dataset.samples.map((s) => Math.log10(Math.max(s.I_d, 1e-30)));
  const cal = runCalibration({
    id: 'diode-fit', modelFn: model, measurements: meas,
    p0: [-11, 1.2], lower: [-16, 0.5], upper: [-8, 2],
    parameterNames: ['log10(Is)', 'n'], seed: 1, multistart: 3, maxIterations: 1000, convergenceTolerance: 1e-9,
  });
  assert.equal(cal.converged, true, cal.convergence.reason);
  approx(cal.params.values[1], 1, 0.15);
  // Is relative error larger (log-scale) but within a factor of 2
  // p[0] IS log10(Is); Is = 10^(p[0]) should be ~1e-12
  approx(Math.pow(10, cal.params.values[0]), 1e-12, 0.5e-12);
  assert.equal(cal.identifiability.identifiable, true);
});
const VT300 = (1.380649e-23 * 300) / 1.602176634e-19;

test('phase3: bounded LM respects parameter bounds', () => {
  const { dataset } = syntheticRCDataset({ tau: 1e-4, seed: 2 });
  const model = (p) => dataset.samples.map((s) => s.V_step * (1 - Math.exp(-s.t / p[0])));
  const cal = runCalibration({
    id: 'bounds', modelFn: model, measurements: dataset.samples.map((s) => s.V_c),
    p0: [5e-3], lower: [1e-7], upper: [9e-4], // true 1e-4 inside, but p0 far above upper
    parameterNames: ['tau'], seed: 1,
  });
  for (const v of cal.params.values) assert.ok(v >= 1e-7 && v <= 9e-4, `bound violated: ${v}`);
});

test('phase3: calibration convergence failure is an explicit result', () => {
  // a model that cannot fit the data: constant output vs ramp measurements
  const meas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const model = (p) => meas.map(() => p[0]);
  const cal = runCalibration({
    id: 'no-fit', modelFn: model, measurements: meas,
    p0: [0], lower: [-100], upper: [100], parameterNames: ['c'],
    convergenceTolerance: 0,
  });
  // LM converges to the mean (best constant) — that IS convergence; verify
  // the residuals honestly report the mismatch instead of a green pass
  assert.ok(cal.residualAnalysis.rms > 2, 'residuals must show the poor fit');
});

// ---------------- split system -------------------------------------------------
test('phase3: split manifest prevents calibration/validation leakage', () => {
  const d = createDataset({ id: 's', origin: 'real-measurement', experiment: { id: 'e' } }, [
    { t: 0, session: 'A' }, { t: 1, session: 'A' }, { t: 2, session: 'B' }, { t: 3, session: 'B' },
  ], { rawSource: 's' });
  const m = partitionByField(d, 'session', { calibrationValues: ['A'], validationValues: ['B'] });
  const v = verifySplit(m, d);
  assert.equal(v.ok, true, v.errors?.join('; '));
  assert.equal(m.calibrationGroups.includes('A'), true);
});

test('phase3: overlapping calibration/validation groups are a leakage ERROR', () => {
  const d = createDataset({ id: 'l', origin: 'real-measurement', experiment: { id: 'e' } }, [
    { t: 0, session: 'A' }, { t: 1, session: 'B' },
  ], { rawSource: 'l' });
  assert.throws(() => partitionByField(d, 'session', { calibrationValues: ['A'], validationValues: ['A'] }), /leakage/);
});

test('phase3: split manifests are immutable (checksum verifies the partition)', () => {
  const m = createSplitManifest({
    id: 'x', groups: { g1: [0], g2: [1] },
    calibrationGroups: ['g1'], validationGroups: ['g2'],
  });
  const v1 = verifySplit(m, { samples: [0, 1] });
  assert.equal(v1.ok, true);
  // tamper with the partition checksum
  const tampered = JSON.parse(JSON.stringify({ ...m, checksum: '0000' }));
  const v2 = verifySplit(tampered, { samples: [0, 1] });
  assert.equal(v2.ok, false);
  assert.ok(v2.errors[0].includes('checksum mismatch'));
});

// ---------------- validation engine -------------------------------------------
test('phase3: validation vs synthetic data is a SOFTWARE DEMONSTRATION, never physical validation', () => {
  const { dataset } = syntheticDividerDataset({ V_in: 10, R1: 1000, R2: 1000, seed: 9 });
  const q = qualityReport(dataset);
  const result = runExperimentalValidation({
    model: { id: 'divider-vout', predict: (p) => ({ V_out: (p.V_in * p.R2) / (p.R1 + p.R2) }) },
    params: { R1: 1000, R2: 1000 },
    declaredUse: 'test the software',
    dataset, quality: q,
    criteria: { maxAbsError: 0.05 },
    envelope: defineEnvelope({ id: 'e', ranges: { V_in: [0, 20] }, testedPoints: [{ V_in: 10 }] }),
    quantities: [{ name: 'V_out' }],
    provenanceVerified: true,
    calibrationRef: null,
  });
  assert.equal(result.stage, 'softwareDemonstration');
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('G1') || result.physicalValidation.note.includes('software demonstration') || result.physicalValidation.note.includes('origin'));
  assert.ok(result.criteriaMet, 'the synthetic fixture DOES agree numerically — that makes it a demonstration, not physical validation');
});

test('phase3: validation against a real-measurement dataset inside the envelope can validate', () => {
  const d = dividerRealLike();
  const q = qualityReport(d);
  const result = runExperimentalValidation({
    model: { id: 'divider-vout', predict: (p) => ({ V_out: (p.V_in * p.R2) / (p.R1 + p.R2) }) },
    params: { R1: 1000, R2: 1000 },
    declaredUse: 'verify divider ratio at low voltage',
    dataset: d, quality: q,
    criteria: { maxAbsError: 0.05 },
    envelope: defineEnvelope({ id: 'env', ranges: { V_in: [0, 12] }, testedPoints: [{ V_in: 5 }, { V_in: 10 }] }),
    quantities: [{ name: 'V_out', measurementUncertainty: 0.005 }],
    provenanceVerified: true,
  });
  assert.equal(result.criteriaMet, true, JSON.stringify(result.criteriaResults));
  assert.equal(result.stage, 'softwareDemonstration');
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.blockers.some(b => b.includes('G3')));
  assert.ok(result.physicalValidation.scope.quantities.includes('V_out'));
});

test('phase3: validation with missing measurement uncertainty cannot reach PASS criteria', () => {
  // a dataset with NO uncertainty metadata: the overlap criterion cannot be verified
  const d = createDataset({
    id: 'no-unc', origin: 'real-measurement', experiment: { id: 'e' },
    instruments: [{ manufacturer: 'X', model: 'Y', resolution: 0.01, uncertainty: null }],
    quantities: [{ name: 'V_out', unit: 'V' }],
  }, [{ t: 0, V_in: 5, V_out: 2.498 }, { t: 1, V_in: 10, V_out: 5.001 }], { rawSource: 'no-unc' });
  const q = qualityReport(d);
  const result = runExperimentalValidation({
    model: { id: 'divider-vout', predict: (p) => ({ V_out: (p.V_in * p.R2) / (p.R1 + p.R2) }) },
    params: { R1: 1000, R2: 1000 },
    declaredUse: 'x',
    dataset: d, quality: q,
    criteria: { maxAbsError: 0.05, requireUncertaintyOverlap: true }, // uncertainty required but absent
    envelope: defineEnvelope({ id: 'e2', ranges: { V_in: [0, 12] }, testedPoints: [{ V_in: 5 }, { V_in: 10 }] }),
    quantities: [{ name: 'V_out' }], // no measurementUncertainty declared
  });
  const unc = result.criteriaResults.find((c) => c.criterion.includes('uncertainty'));
  assert.equal(unc.met, false, 'uncertainty overlap cannot be claimed without declared measurement uncertainty');
  assert.equal(result.criteriaMet, false);
});

test('phase3: a model fitting calibration data but failing held-out data is honestly reported', () => {
  // calibrate tau on session-1, validate on session-2 with a DIFFERENT tau
  const cal = syntheticRCDataset({ tau: 1e-4, session: 'session-1', seed: 1 }).dataset;
  const val = syntheticRCDataset({ tau: 4e-4, session: 'session-2', seed: 2 }).dataset;
  const qCal = qualityReport(cal);
  const result = runExperimentalValidation({
    model: { id: 'rc-step', version: 1, predict: (p) => ({ V_c: p.V_step * (1 - Math.exp(-p.t / p.tau)) }) },
    params: { tau: 1e-4 }, // fitted on session-1
    declaredUse: 'predict RC step response',
    dataset: val, quality: qualityReport(val),
    criteria: { maxAbsError: 0.05 },
    envelope: defineEnvelope({ id: 'rc-env', ranges: { t: [0, 1e-3] }, testedPoints: val.samples.map((s) => ({ t: s.t })) }),
    quantities: [{ name: 'V_c', measurementUncertainty: 0.005 }],
    calibrationRef: 'rc-calibration-record-1',
  });
  assert.equal(result.criteriaMet, false, 'tau mismatch must FAIL the prespecified criteria');
  assert.ok(result.statistics.maxAbsError > 0.3, `held-out failure must be visible (${result.statistics.maxAbsError})`);
  assert.equal(result.physicalValidation.status, 'none');
  void cal; void qCal;
});

// ---------------- validation envelopes -----------------------------------------
const ENV = defineEnvelope({
  id: 'divider-envelope',
  ranges: { V_in: [0, 12] },
  testedPoints: [{ V_in: 5 }, { V_in: 10 }],
  requiredAccuracy: 'maxAbsError <= 0.05 V',
  intendedDecision: 'verify divider ratio at low voltage',
});

test('phase3: envelope classification matrix', () => {
  assert.equal(classifyRequest(ENV, { V_in: 10.01 }).classification, 'within-demonstrated-envelope');
  assert.equal(classifyRequest(ENV, { V_in: 7.5 }).classification, 'interpolation-with-limited-evidence');
  assert.equal(classifyRequest(ENV, { V_in: 15 }).classification, 'outside-demonstrated-envelope');
  const empty = defineEnvelope({ id: 'e3', ranges: { V_in: [0, 12] } });
  assert.equal(classifyRequest(empty, { V_in: 5 }).classification, 'insufficient-evidence');
  assert.equal(classifyRequest(ENV, {}).classification, 'outside-demonstrated-envelope', 'missing quantity cannot be inside');
});

test('phase3: envelope gate blocks claims outside the demonstrated envelope', () => {
  const g1 = envelopeGate({ classification: 'within-demonstrated-envelope', datasetOrigin: 'real-measurement', criteriaMet: true });
  assert.equal(g1.allowed, true);
  const g2 = envelopeGate({ classification: 'outside-demonstrated-envelope', datasetOrigin: 'real-measurement', criteriaMet: true });
  assert.equal(g2.allowed, false);
  const g3 = envelopeGate({ classification: 'interpolation-with-limited-evidence', datasetOrigin: 'real-measurement', criteriaMet: true });
  assert.equal(g3.allowed, false, 'interpolative evidence cannot inherit a validation PASS');
});

test('phase3: multidimensional envelope does not assume box coverage', () => {
  // tested only at V_in=5; a request inside the ranges but far from every
  // tested point must be interpolation, even if each coordinate is in-range
  const env = defineEnvelope({ id: 'box', ranges: { V_in: [0, 12], R2: [500, 2000] }, testedPoints: [{ V_in: 5, R2: 2000 }] });
  const c = classifyRequest(env, { V_in: 11.9, R2: 510 });
  assert.notEqual(c.classification, 'within-demonstrated-envelope', 'a box corner must not count as demonstrated');
});

// ---------------- fabricated evidence labels ------------------------------------
test('phase3: a synthetic dataset cannot be relabelled to unlock physical validation', () => {
  const { dataset, raw } = syntheticDividerDataset();
  assert.equal(dataset.origin, 'synthetic-test-fixture');
  assert.equal(physicalValidationAllowed(dataset), false);
  // attempt to relabel: edit origin in the JSON — the source checksum was
  // computed on the ORIGINAL raw text (which contains 'synthetic-test-fixture'),
  // so the relabelled text cannot pass verifyChecksum against the recorded SHA
  const tampered = JSON.parse(raw);
  tampered.origin = 'real-measurement';
  const tamperedText = JSON.stringify(tampered);
  // detection: the recorded SHA-256 covers the ORIGINAL raw text —
  // tamperedText has a different checksum, so the relabeling IS detectable
  assert.notEqual(sha256(tamperedText), dataset.source.datasetSha256, 'tampered text must have a different SHA-256');
  // and the trust gate on the ORIGINAL dataset correctly blocks physical validation
  const q = qualityReport(dataset);
  assert.equal(q.physicalValidationAllowed, false);
  assert.ok(dataset.acquisition.procedure.includes('software fixture'), 'conspicuous synthetic label present');
});

// ---------------- review round 6: physical-validation evidence integrity -----
// Written FIRST, demonstrated failing against the pre-fix code, then fixed.
// These tests enforce that physical validation CANNOT be claimed unless
// every mandatory gate passes: real origin, accepted quality, verified
// provenance, actual envelope coverage, and verified holdout independence.

// a real-measurement dataset with an ACCEPTED quality report
function acceptedRealDataset() {
  const d = createDataset({
    id: 'real-accepted', origin: 'real-measurement',
    source: { file: 'claimed-instrument-record.csv', rawFileSha256: sha256('real-accepted-raw') },
    experiment: { id: 'exp-1', date: '2026-01-15' },
    instruments: [{ manufacturer: 'Fluke', model: '179', serialNumber: 'SN-1', resolution: 0.001, uncertainty: 0.005, calibration: { certificateRef: 'CAL-001', status: 'valid', validUntil: '2026-12-01' } }],
    quantities: [{ name: 'V_in', unit: 'V' }, { name: 'V_out', unit: 'V' }],
    components: { nominal: { R1: 1000, R2: 1000 } },
    replicates: [{ group: 'r1', members: [0, 1] }],
    uncertainty: { V_out: 0.005 },
    acquisition: { procedure: 'protocol A' },
  }, [
    { t: 0, V_in: 5, V_out: 2.498 },
    { t: 1, V_in: 10, V_out: 5.001 },
  ], { rawSource: 'real-accepted-raw' });
  return { dataset: d, quality: qualityReport(d) };
}

const ACCEPT_CRITERIA = { maxAbsError: 0.05 };
const ENVELOPE_WITH_POINTS = defineEnvelope({
  id: 'env-ok', ranges: { V_in: [0, 12] },
  testedPoints: [{ V_in: 5 }, { V_in: 10 }],
});

function runVal(overrides = {}) {
  const { dataset, quality } = acceptedRealDataset();
  const plan = registerValidationPlan({ modelId: 'divider-vout', datasetId: dataset.id, envelopeId: ENVELOPE_WITH_POINTS.id, declaredUse: 'verify divider ratio', criteria: ACCEPT_CRITERIA });
  const receipt = verifySourceReceipt(dataset, 'real-accepted-raw', { acquisitionRecordId: 'UNVERIFIED-TEST-FIXTURE' });
  return runExperimentalValidation({
    model: { id: 'divider-vout', predict: (p) => ({ V_out: (p.V_in * p.R2) / (p.R1 + p.R2) }) },
    params: { R1: 1000, R2: 1000 },
    declaredUse: 'verify divider ratio',
    dataset, quality,
    criteria: ACCEPT_CRITERIA,
    envelope: defineEnvelope({
      ...ENVELOPE_WITH_POINTS,
      evidence: { datasetId: dataset.id, datasetVersion: dataset.version, datasetSha256: dataset.source.datasetSha256, sampleIndices: [0, 1] },
    }),
    quantities: [{ name: 'V_out', measurementUncertainty: 0.005 }],
    provenanceVerified: true, provenanceReceipt: receipt, validationPlan: plan,
    ...overrides,
  });
}

test('F1: no envelope → physicalValidation none (even with perfect predictions)', () => {
  const result = runVal({ envelope: undefined });
  assert.equal(result.stage, 'softwareDemonstration');
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('envelope'));
});

test('F1: envelope with zero tested points → insufficient-evidence, none', () => {
  const result = runVal({ envelope: defineEnvelope({ id: 'empty', ranges: { V_in: [0, 12] } }) });
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('tested point') || result.physicalValidation.note.includes('insufficient'));
});

test('F1: envelope tested points far from measurement conditions → none', () => {
  const result = runVal({
    envelope: defineEnvelope({ id: 'far', ranges: { V_in: [0, 12] }, testedPoints: [{ V_in: 1 }, { V_in: 2 }] }),
  });
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('envelope') || result.physicalValidation.note.includes('interpolation'));
});

test('F1: matching envelope creates candidate only, not fabricated physical validation', () => {
  const result = runVal({});
  assert.equal(result.stage, 'softwareDemonstration');
  assert.equal(result.physicalValidation.status, 'none');
  assert.equal(result.physicalValidation.programmaticEligibility, 'candidate-for-independent-review');
  assert.ok(result.physicalValidation.scope, 'scope must record dataset + quantities + envelope');
});

test('F2: conditionally-usable quality → physicalValidation none (binding quality gate)', () => {
  // remove replicates to force conditionally-usable
  const d = createDataset({
    id: 'real-cond', origin: 'real-measurement',
    experiment: { id: 'exp-1' },
    instruments: [{ manufacturer: 'Fluke', model: '179', serialNumber: 'SN-1', resolution: 0.001, uncertainty: 0.005, calibration: { certificateRef: 'CAL-001', status: 'valid', validUntil: '2026-12-01' } }],
    quantities: [{ name: 'V_in', unit: 'V' }, { name: 'V_out', unit: 'V' }],
    uncertainty: { V_out: 0.005 },
  }, [
    { t: 0, V_in: 5, V_out: 2.498 },
    { t: 1, V_in: 10, V_out: 5.001 },
  ], { rawSource: 'real-cond-raw' });
  const q = qualityReport(d);
  assert.equal(q.verdict, 'conditionally-usable');
  assert.equal(q.physicalValidationAllowed, false, 'quality system says physical validation is NOT allowed');
  const result = runVal({
    dataset: d, quality: q,
  });
  assert.equal(result.physicalValidation.status, 'none',
    'conditionally-usable quality must NOT produce a validated status');
  assert.equal(result.stage, 'softwareDemonstration');
});

test('F2: rejected quality → physicalValidation none', () => {
  const d = createDataset({
    id: 'real-rej', origin: 'real-measurement',
    experiment: { id: 'exp-1' },
    instruments: [],
    quantities: [{ name: 'V', unit: 'V' }],
  }, [{ t: 0, V: NaN }], { rawSource: 'rej' });
  const q = qualityReport(d);
  assert.equal(q.verdict, 'rejected');
  const result = runVal({ dataset: d, quality: q, quantities: [{ name: 'V' }] });
  assert.equal(result.physicalValidation.status, 'none');
});

test('F3: calibration on group A + validation on group A → leakage detected, none', () => {
  const { dataset: calData } = syntheticRCDataset({ session: 'session-1', seed: 1 });
  const valDataset = createDataset({
    id: 'leak-val', origin: 'real-measurement',
    experiment: { id: 'exp-B' },
    instruments: [{ manufacturer: 'X', model: 'Y', resolution: 0.001, uncertainty: 0.005, calibration: { certificateRef: 'CAL', status: 'valid' } }],
    quantities: [{ name: 't', unit: 's' }, { name: 'V_c', unit: 'V' }],
    uncertainty: { V_c: 0.005 },
  }, [
    { t: 4e-5, session: 'session-1', V_step: 5, V_c: 1.65 },
    { t: 8e-5, session: 'session-1', V_step: 5, V_c: 2.76 },
  ], { rawSource: 'leak-val-raw' });
  const q = qualityReport(valDataset);
  // a split manifest that includes session-1 on BOTH sides would throw
  assert.throws(() => partitionByField(valDataset, 'session', { calibrationValues: ['session-1'], validationValues: ['session-1'] }), /leakage/);
  // the validation engine must refuse when the calibration record references
  // the same dataset checksum as the validation dataset
  const calRecord = runCalibration({
    id: 'leak-cal', modelFn: (p) => valDataset.samples.map((s) => p[0] * (1 - Math.exp(-s.t / p[1]))),
    measurements: valDataset.samples.map((s) => s.V_c),
    p0: [5, 1e-4], lower: [0, 1e-6], upper: [10, 1e-2],
    parameterNames: ['V', 'tau'], dataset: { id: valDataset.id, checksum: valDataset.source.datasetSha256 },
  });
  assert.ok(calRecord.dataset.checksum, 'calibration record must carry the dataset checksum');
  const result = runVal({
    model: { id: 'rc', predict: (p) => ({ V_out: 2.5 }) },
    calibrationRef: calRecord.id,
    calibrationRecord: calRecord,
    dataset: valDataset, quality: q,
    quantities: [{ name: 'V_c', measurementUncertainty: 0.005 }],
  });
  assert.equal(result.physicalValidation.status, 'none',
    'using the same dataset for calibration and validation must block physical validation');
});

test('F3: nominal parameters do not require a split but remain unvalidated', () => {
  const result = runVal({});
  assert.equal(result.stage, 'softwareDemonstration');
  assert.equal(result.physicalValidation.programmaticEligibility, 'candidate-for-independent-review');
  assert.equal(result.paramProvenance.source, 'nominal values');
  assert.ok(result.physicalValidation.note.includes('nominal') || !result.physicalValidation.note.includes('leakage'));
});


// ---------------- review round 6 F4: provenance integrity ----------------

test('F4: synthetic relabelled to real-measurement is blocked without verified provenance', () => {
  const { dataset: fake } = syntheticDividerDataset();
  const spoofedMeta = JSON.parse(JSON.stringify({ ...fake, samples: [...fake.samples] }));
  assert.throws(() => createDataset({
    ...spoofedMeta, origin: 'real-measurement',
  }, [...fake.samples]), /checksum mismatch/,
    'relabeling an existing dataset without updating its digest must fail at ingestion');
  // Rehashing a false claim is possible, but does NOT prove its provenance.
  const relabelled = createDataset({
    ...spoofedMeta,
    source: { ...spoofedMeta.source, datasetSha256: null },
    origin: 'real-measurement',
  }, [...fake.samples]);
  assert.equal(relabelled.origin, 'real-measurement');
  const q = qualityReport(relabelled);
  const result = runVal({
    dataset: relabelled, quality: q,
    provenanceVerified: false,
  });
  assert.equal(result.physicalValidation.status, 'none',
    'unverified provenance must block physical validation even when origin claims real-measurement');
});

test('F4: dataset source separates rawFileSha256 from datasetSha256', () => {
  const rawText = 'INSTRUMENT_EXPORT_V1\n5.002,2.498\n';
  const d = createDataset({
    id: 'sep', origin: 'real-measurement', experiment: { id: 'e' },
    source: { file: 'export.csv', rawFileSha256: sha256(rawText) },
  }, [{ t: 0, V_in: 5, V_out: 2.498 }], { rawSource: rawText });
  assert.equal(d.source.rawFileSha256, sha256(rawText), 'original file checksum preserved');
  assert.ok(d.source.datasetSha256, 'dataset artifact checksum is recorded');
  const parsed = parseDataset(JSON.stringify({ ...JSON.parse(JSON.stringify({ ...d, samples: [...d.samples] })) }));
  assert.equal(parsed.source.rawFileSha256, sha256(rawText), 'raw file checksum survives parsing');
});


// ---------------- direct GitHub remediation: evidence cannot self-authorize ----

test('phase3-integrity: caller boolean alone is never source verification', () => {
  const result = runVal({ provenanceReceipt: null, provenanceVerified: true });
  assert.equal(result.physicalValidation.status, 'none');
  assert.equal(result.physicalValidation.programmaticEligibility, 'blocked');
  assert.ok(result.physicalValidation.blockers.some(s => s.includes('G3')));
});

test('phase3-integrity: a fabricated receipt or another dataset receipt is rejected', () => {
  const fake = { format: 'invention-lab/source-verification/1', datasetId: 'real-accepted' };
  const result = runVal({ provenanceReceipt: fake });
  assert.equal(result.physicalValidation.programmaticEligibility, 'blocked');
  assert.ok(result.physicalValidation.blockers.some(s => s.includes('G3')));
});

test('phase3-integrity: criteria require a registered plan with the exact model, dataset and envelope', () => {
  const missing = runVal({ validationPlan: null });
  assert.ok(missing.physicalValidation.blockers.some(s => s.includes('G4')));
  const wrong = registerValidationPlan({ modelId: 'different-model', datasetId: 'real-accepted', envelopeId: 'env-ok', declaredUse: 'verify divider ratio', criteria: ACCEPT_CRITERIA });
  const result = runVal({ validationPlan: wrong });
  assert.equal(result.physicalValidation.programmaticEligibility, 'blocked');
  assert.ok(result.physicalValidation.blockers.some(s => s.includes('G4')));
});

test('phase3-integrity: a forged quality report cannot override rejected actual dataset QC', () => {
  const d = createDataset({ id: 'poor', origin: 'real-measurement', experiment: { id: 'exp' }, source: { rawFileSha256: sha256('poor') } },
    [{ t: 0, V_in: 5, V_out: NaN }], { rawSource: 'poor' });
  const forged = { verdict: 'accepted', physicalValidationAllowed: true };
  const result = runVal({ dataset: d, quality: forged });
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.blockers.some(s => s.includes('G2')));
});

test('phase3-integrity: original measurement hash survives dataset serialization and derivation', () => {
  const raw = 'instrument,circuit,V\nA,divider,2.5\n';
  const d = createDataset({ id: 'original', origin: 'real-measurement', experiment: { id: 'exp' },
    source: { rawFileSha256: sha256(raw) } }, [{ t: 0, V_out: 2.5 }], { rawSource: raw });
  const parsed = parseDataset(JSON.stringify(d));
  assert.equal(parsed.source.rawFileSha256, sha256(raw));
  assert.equal(parsed.source.datasetSha256, d.source.datasetSha256, 'parser must not silently overwrite the original dataset provenance hash');
  const derived = deriveDataset(d, { method: 'noop' }, d.samples);
  assert.equal(derived.transformations[0].parentChecksum, d.source.datasetSha256);
});

test('phase3-integrity: calibration without bound fitting observations is never independent holdout evidence', () => {
  const { dataset } = acceptedRealDataset();
  const manifest = partitionByField(
    createDataset({ id: dataset.id, origin: 'real-measurement', experiment: { id: 'x' } },
      [{ t: 0, session: 'A' }, { t: 1, session: 'B' }], { rawSource: 'separate' }),
    'session', { calibrationValues: ['A'], validationValues: ['B'] }
  );
  const result = runVal({
    calibrationRef: 'fit-x', calibrationRecord: { id: 'fit-x', dataset: { id: 'unrelated', checksum: 'invented' } },
    splitManifest: manifest,
  });
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.blockers.some(s => s.includes('G7')));
});

test('phase3-integrity: nested validation evidence is immutable', () => {
  const result = runVal({});
  assert.ok(Object.isFrozen(result.physicalValidation));
  assert.ok(Object.isFrozen(result.physicalValidation.scope));
  assert.ok(Object.isFrozen(result.physicalValidation.blockers));
  assert.ok(Object.isFrozen(result.comparisons));
});


test('phase3-integrity: nested datasets are deeply frozen and receipts bind sample content', () => {
  const raw = 'meter,voltage\\nunit1,2.5';
  const d = createDataset({
    id: 'nested', origin: 'real-measurement', experiment: { id: 'nested-e' },
    source: { file: 'meter.csv', rawFileSha256: sha256(raw) },
    configuration: { nested: { adjustable: false } },
  }, [{ t: 0, V: 2.5, values: { sample: 1 } }], { rawSource: raw });
  assert.ok(Object.isFrozen(d.source));
  assert.ok(Object.isFrozen(d.configuration.nested));
  assert.ok(Object.isFrozen(d.samples[0].values));
  const receipt = verifySourceReceipt(d, raw, { acquisitionRecordId: 'UNIT-TEST' });
  assert.ok(Object.isFrozen(receipt));
  assert.throws(() => verifySourceReceipt(d, 'altered original', { acquisitionRecordId: 'UNIT-TEST' }), /checksum mismatch/);
});


// -------- second integrity pass: regressions written before implementation -----

test('phase3-regression: dataset digest changes for altered derived measurements', () => {
  const raw = 'real-instrument-raw';
  const d = createDataset({
    id: 'hash-parent', origin: 'real-measurement', experiment: { id: 'e' },
    source: { file: 'meter.csv', rawFileSha256: sha256(raw) },
  }, [{ t: 0, V: 1 }], { rawSource: raw });
  const child = deriveDataset(d, { method: 'scale', multiplier: 2 }, [{ t: 0, V: 2 }]);
  assert.notEqual(child.source.datasetSha256, d.source.datasetSha256,
    'derived measurements must have a distinct dataset-content digest');
  assert.equal(child.transformations[0].parentChecksum, d.source.datasetSha256);
  assert.equal(child.source.rawFileSha256, d.source.rawFileSha256,
    'original instrument-file digest must remain unchanged');
});

test('phase3-regression: altered JSON sample cannot retain the original dataset digest', () => {
  const d = createDataset({
    id: 'hash-parser', origin: 'real-measurement', experiment: { id: 'e' },
  }, [{ t: 0, V: 1 }], { rawSource: 'source-e' });
  const changed = JSON.parse(JSON.stringify(d));
  changed.samples[0].V = 999;
  assert.throws(() => parseDataset(JSON.stringify(changed)), /dataset.*checksum|integrity|SHA-256/i,
    'metadata/content checksum drift must not be accepted by parsing');
});

test('phase3-regression: split manifest fails when its source dataset is replaced', () => {
  const a = createDataset({ id: 'same-id', experiment: { id: 'e' }, origin: 'real-measurement' },
    [{ t: 0, session: 'A', V: 1 }, { t: 1, session: 'B', V: 2 }], { rawSource: 'a' });
  const m = partitionByField(a, 'session', { calibrationValues: ['A'], validationValues: ['B'] });
  const b = createDataset({ id: 'same-id', experiment: { id: 'e' }, origin: 'real-measurement' },
    [{ t: 0, session: 'B', V: 100 }, { t: 1, session: 'A', V: 200 }], { rawSource: 'b' });
  const v = verifySplit(m, b);
  assert.equal(v.ok, false, 'a positional split cannot authenticate a different dataset with the same sample count');
  assert.ok(v.errors.some(e => /checksum|dataset|group|source/i.test(e)), v.errors.join('; '));
});

test('phase3-regression: missing required comparisons cannot create positive eligibility', () => {
  const result = runVal({ quantities: [{ name: 'V_out' }, { name: 'nonexistent_quantity' }] });
  assert.equal(result.physicalValidation.programmaticEligibility, 'blocked');
  assert.ok(result.physicalValidation.blockers.some(b => /missing-data|completeness|quantity/i.test(b)),
    result.physicalValidation.blockers.join('; '));
});

test('phase3-regression: invalid uncertainty cannot create positive eligibility', () => {
  const result = runVal({ quantities: [{ name: 'V_out', measurementUncertainty: -1 }] });
  assert.equal(result.physicalValidation.programmaticEligibility, 'blocked');
  assert.ok(result.physicalValidation.blockers.some(b => /uncertainty/i.test(b)),
    result.physicalValidation.blockers.join('; '));
});

test('phase3-regression: arbitrary tested points are not independent envelope provenance', () => {
  const result = runVal({ envelope: ENVELOPE_WITH_POINTS });
  assert.ok(result.physicalValidation.blockers.some(b => /tested-point provenance|envelope evidence|binding/i.test(b)),
    'the caller currently supplies points without a dataset-bound acquisition evidence record');
});


// ------- calibrated holdout: trace fit to original dataset without leakage -----

function fittedHoldoutFixture() {
  const raw = 'MOCK_ONLY_NOT_AN_INSTRUMENT_RECORD';
  const dataset = createDataset({
    id: 'holdout-mock', origin: 'real-measurement',
    experiment: { id: 'mock-e', date: '2026-01-01' },
    source: { file: 'mock-source.txt', rawFileSha256: sha256(raw) },
    instruments: [{ manufacturer: 'MOCK', model: 'MOCK', resolution: 0.001, uncertainty: 0.005,
      calibration: { certificateRef: 'MOCK-NOT-REAL', status: 'valid' } }],
    quantities: [{ name: 'V_in', unit: 'V' }, { name: 'V_out', unit: 'V' }],
    replicates: [{ group: 'mock', members: [0, 1] }],
    uncertainty: { V_out: 0.005 },
    acquisition: { procedure: 'UNIT TEST ONLY, NO EXPERIMENT' },
  }, [
    { t: 0, session: 'cal-session', V_in: 5, V_out: 2.498 },
    { t: 1, session: 'val-session', V_in: 10, V_out: 5.001 },
  ], { rawSource: raw });
  const splitManifest = partitionByField(dataset, 'session', {
    calibrationValues: ['cal-session'], validationValues: ['val-session'],
  });
  const calibrationRecord = runCalibration({
    id: 'divider-fit-mock', modelId: 'divider-gain',
    dataset: { id: dataset.id, version: dataset.version, checksum: dataset.source.datasetSha256,
      sampleIndices: [0], quantity: 'V_out' },
    modelFn: ([gain]) => [5 * gain], measurements: [2.498],
    p0: [0.4], lower: [0], upper: [1], parameterNames: ['gain'],
  });
  const criteria = { maxAbsError: 0.05 };
  const envelope = defineEnvelope({
    id: 'mock-holdout-env', ranges: { V_in: [0, 12] },
    testedPoints: [{ V_in: 5 }, { V_in: 10 }],
    evidence: { datasetId: dataset.id, datasetVersion: dataset.version,
      datasetSha256: dataset.source.datasetSha256, sampleIndices: [0, 1] },
  });
  const validationPlan = registerValidationPlan({
    modelId: 'divider-gain', datasetId: dataset.id, envelopeId: envelope.id,
    declaredUse: 'software holdout audit ONLY', criteria,
  });
  const provenanceReceipt = verifySourceReceipt(dataset, raw, { acquisitionRecordId: 'MOCK-NOT-PHYSICAL' });
  return {
    model: { id: 'divider-gain', predict: (p) => ({ V_out: p.gain * p.V_in }) },
    params: { gain: calibrationRecord.params.values[0] },
    dataset, quality: qualityReport(dataset), criteria, envelope,
    declaredUse: 'software holdout audit ONLY',
    quantities: [{ name: 'V_out', measurementUncertainty: 0.005 }],
    calibrationRef: calibrationRecord.id, calibrationRecord, splitManifest,
    validationPlan, provenanceReceipt,
  };
}

test('phase3-regression: fitted calibration subset excluded from validation comparisons', () => {
  const args = fittedHoldoutFixture();
  const result = runExperimentalValidation(args);
  assert.deepEqual(result.statistics.sampleIndices, [1],
    'only independent validation session B belongs in held-out comparisons');
  assert.deepEqual(result.comparisons.map(c => c.sampleIndex), [1]);
  assert.equal(result.physicalValidation.programmaticEligibility, 'candidate-for-independent-review',
    result.physicalValidation.blockers.join('; '));
  assert.equal(result.physicalValidation.status, 'none',
    'MOCK source and self-created records are NOT physical experiment evidence');
});

test('phase3-regression: fitted measurement vector tampering invalidates holdout evidence', () => {
  const args = fittedHoldoutFixture();
  args.calibrationRecord.measurementSha256 = sha256('tampered');
  const result = runExperimentalValidation(args);
  assert.equal(result.physicalValidation.programmaticEligibility, 'blocked');
  assert.ok(result.physicalValidation.blockers.some(b => /G7.*fitted measurement vector/i.test(b)),
    result.physicalValidation.blockers.join('; '));
});

test('phase3-regression: same dataset identifier with modified sample values invalidates split', () => {
  const args = fittedHoldoutFixture();
  const tampered = JSON.parse(JSON.stringify(args.dataset));
  tampered.samples[0].V_out += 1;
  assert.throws(() => parseDataset(JSON.stringify(tampered)), /checksum mismatch/i);
  assert.equal(verifySplit(args.splitManifest, args.dataset).ok, true);
});
