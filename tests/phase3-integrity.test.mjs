// phase3-integrity.test.mjs — review round 1 on PR #3: evidence-integrity regressions.
// Written FIRST, demonstrated failing against the pre-fix code, then fixed.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import '../js/labs/chip/components.js';
import {
  createDataset, parseDataset, sha256, verifyChecksum, physicalValidationAllowed,
} from '../js/measure/dataset.js';
import { qualityReport } from '../js/measure/quality.js';
import { runCalibration } from '../js/measure/calibration.js';
import { defineEnvelope } from '../js/measure/envelope.js';
import { runExperimentalValidation } from '../js/measure/validation.js';
import { partitionByField } from '../js/measure/split.js';
import { syntheticRCDataset, syntheticDividerDataset } from '../js/measure/experiments.js';

// ---- helpers ----------------------------------------------------------

function acceptedRealDataset() {
  const d = createDataset({
    id: 'real-accepted', origin: 'real-measurement',
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

const CRITERIA = { maxAbsError: 0.05 };
const ENVELOPE_OK = defineEnvelope({
  id: 'env-ok', ranges: { V_in: [0, 12] },
  testedPoints: [{ V_in: 5 }, { V_in: 10 }],
});

function runVal(overrides = {}) {
  const { dataset, quality } = acceptedRealDataset();
  return runExperimentalValidation({
    model: { id: 'divider-vout', predict: (p) => ({ V_out: (p.V_in * p.R2) / (p.R1 + p.R2) }) },
    params: { R1: 1000, R2: 1000 },
    declaredUse: 'verify divider ratio',
    dataset, quality,
    criteria: CRITERIA,
    envelope: ENVELOPE_OK,
    quantities: [{ name: 'V_out', measurementUncertainty: 0.005 }],
    provenanceVerified: true,
    ...overrides,
  });
}

// ---- F1: envelope bypass -----------------------------------------------

test('F1: no envelope → physicalValidation none', () => {
  const result = runVal({ envelope: undefined });
  assert.equal(result.stage, 'softwareDemonstration');
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('envelope'));
});

test('F1: envelope with zero tested points → none', () => {
  const result = runVal({ envelope: defineEnvelope({ id: 'empty', ranges: { V_in: [0, 12] } }) });
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('tested point') || result.physicalValidation.note.includes('insufficient'));
});

test('F1: envelope tested points far from measurement conditions → none', () => {
  const result = runVal({
    envelope: defineEnvelope({ id: 'far', ranges: { V_in: [0, 12] }, testedPoints: [{ V_in: 1 }, { V_in: 2 }] }),
  });
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('envelope') || result.physicalValidation.note.includes('interpolation') || result.physicalValidation.note.includes('demonstrated'));
});

test('F1: correct envelope with matching tested points → validated', () => {
  const result = runVal({});
  assert.equal(result.stage, 'physicalValidation');
  assert.equal(result.physicalValidation.status, 'validated');
  assert.ok(result.physicalValidation.scope, 'scope must record dataset + quantities + envelope');
});

// ---- F2: quality gate is binding ----------------------------------------

test('F2: conditionally-usable quality → physicalValidation none', () => {
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
  assert.equal(q.physicalValidationAllowed, false);
  const result = runVal({ dataset: d, quality: q });
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

// ---- F3: holdout independence --------------------------------------------

test('F3: calibration on group A + validation on group A → leakage detected', () => {
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
  // a split manifest that includes session-1 on BOTH sides throws
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
    model: { id: 'rc', predict: () => ({ V_out: 2.5 }) },
    calibrationRef: calRecord.id,
    calibrationRecord: calRecord,
    dataset: valDataset, quality: q,
    quantities: [{ name: 'V_c', measurementUncertainty: 0.005 }],
  });
  assert.equal(result.physicalValidation.status, 'none',
    'using the same dataset for calibration and validation must block physical validation');
});

test('F3: nominal parameters work without a split manifest', () => {
  const result = runVal({});
  assert.equal(result.stage, 'physicalValidation');
  assert.equal(result.paramProvenance.source, 'nominal values');
});

// ---- F4: provenance -------------------------------------------------------

test('F4: synthetic relabelled to real-measurement is blocked without verified provenance', () => {
  const { dataset: fake } = syntheticDividerDataset();
  const relabelled = createDataset({
    ...JSON.parse(JSON.stringify({ ...fake, samples: [...fake.samples] })),
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

test('F4: verified provenance + real origin + accepted quality → validated', () => {
  const result = runVal({ provenanceVerified: true });
  assert.equal(result.physicalValidation.status, 'validated');
});

test('F4: provenance NOT verified → physicalValidation none', () => {
  const result = runVal({ provenanceVerified: false });
  assert.equal(result.physicalValidation.status, 'none');
  assert.ok(result.physicalValidation.note.includes('provenance') || result.physicalValidation.note.includes('verified'));
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
