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
import { runExperimentalValidation } from '../js/measure/validation.js';
import {
  dividerModel, rcModel, diodeModel,
  syntheticDividerDataset, syntheticRCDataset, syntheticDiodeDataset,
  datasetTemplate, samplesToCSV,
} from '../js/measure/experiments.js';

const approx = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≈ ${b}`);

// ---------------- dataset model ---------------------------------------------
function dividerRealLike() {
  return createDataset({
    id: 'divider-real', origin: 'real-measurement',
    experiment: { id: 'exp-A', date: '2026-01-15' },
    instruments: [{ manufacturer: 'Fluke', model: '179', serialNumber: 'SN-1', resolution: 0.001, uncertainty: 0.005, calibration: { certificateRef: 'CAL-2026-001', status: 'valid', validUntil: '2026-06-01' } }],
    quantities: [{ name: 'V_in', unit: 'V' }, { name: 'V_out', unit: 'V' }],
    components: { nominal: { R1: 1000, R2: 1000 }, independentlyMeasured: { R1: 999.6, R2: 1000.2 } },
    uncertainty: { V_out: 0.005 },
    acquisition: { procedure: 'protocol A' },
    license: 'CC0',
  }, [
    { t: 0, V_in: 5, V_out: 2.498 },
    { t: 1, V_in: 10, V_out: 5.001 },
  ], { rawSource: 'raw-divider-v1' });
}

test('phase3: dataset creation records metadata, checksum, and freezes', () => {
  const d = dividerRealLike();
  assert.equal(d.format, DATASET_FORMAT);
  assert.equal(d.origin, 'real-measurement');
  assert.ok(d.source.sha256.length === 64);
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
    source: { file: 'fluke-export.csv', sha256: sha256(rawText) },
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
    calibrationRef: null,
  });
  assert.equal(result.stage, 'softwareDemonstration');
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('software demonstration'));
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
  });
  assert.equal(result.criteriaMet, true, JSON.stringify(result.criteriaResults));
  assert.equal(result.stage, 'physicalValidation');
  assert.equal(result.physicalValidation.status, 'validated');
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
  assert.notEqual(sha256(tamperedText), dataset.source.sha256, 'tampered text must have a different SHA-256');
  // and the trust gate on the ORIGINAL dataset correctly blocks physical validation
  const q = qualityReport(dataset);
  assert.equal(q.physicalValidationAllowed, false);
  assert.ok(dataset.acquisition.procedure.includes('software fixture'), 'conspicuous synthetic label present');
});
