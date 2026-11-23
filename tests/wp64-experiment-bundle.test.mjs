import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { TransmonDevice, spsa, nelderMead } from '../packages/quantum-engine/src/index.mjs';
import { systolicMatmul, compareArchitectures } from '../packages/chip-engine/src/index.mjs';
import { evaluateThresholds } from '../packages/physics-engine/src/thresholds.mjs';
import { buildForensicReport } from '../packages/physics-engine/src/forensics.mjs';

globalThis.crypto ??= webcrypto;
const source = readFileSync(new URL('../apps/electrophysics-3d/src/state/experimentBundle.ts', import.meta.url), 'utf8');
assert.doesNotMatch(source, /^\s*import\s/m);
const core = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const {
  BUNDLE_MAX_BYTES, canonicalBundleJson, sha256BundleText, validateBundleSchema, buildExperimentBundle,
  importExperimentBundle, replayExperimentBundle, requestFromWorkbench, serializeExperimentBundle,
} = core;

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const schema = JSON.parse(read('docs/master-plan/schemas/experiment-bundle.schema.json'));
const manifest = JSON.parse(read('data/reference-library/MANIFEST.json'));
const references = Object.fromEntries(manifest.files.map(({ file, sha256, size_bytes }) => {
  const bytes = read('data/reference-library/' + file);
  assert.equal(bytes.byteLength, size_bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256);
  return [file, { sha256, document: JSON.parse(bytes) }];
}));
const curriculumBytes = read('data/curriculum/01_academy_missions.json');
const curriculumEntry = JSON.parse(read('data/curriculum/MANIFEST.json')).files[0];
assert.equal(createHash('sha256').update(curriculumBytes).digest('hex'), curriculumEntry.sha256);
const curriculum = { sha256: curriculumEntry.sha256, document: JSON.parse(curriculumBytes) };
const runtime = { schema, references, curriculum, engines: { TransmonDevice, spsa, nelderMead, systolicMatmul,
  compareArchitectures, evaluateThresholds, buildForensicReport } };
const pulse = { amplitude: 25, sigmaNs: 7.5, beta: 0,
  durationNs: references['04_quantum_hardware_modalities.json'].document.parameters.superconducting_transmon.gate_1q_duration_ns.typical };
const quantum = { domain: 'quantum', seed: 20241119, inputs: pulse };
const oxide = references['06_failure_physics_thresholds.json'].document.failure_thresholds.gate_oxide_tddb.vgs_threshold_v;
const snapshots = [oxide * 0.9, oxide * 1.1].map((v, i) => ({
  t: (i + 1) / 240, vdd: v, vgsMax: v, vgsMaxNode: 'MP_Q4', iMax: 0.000035 * (i + 1), tempMaxC: 42,
  temps: { traceC: 37, pcbC: 38, junctionC: 42 },
  nodes: { vout_q4: v * 0.8, vout_bin: v * 0.9, vdd_rail: v * 0.98 },
}));
const silicon = { domain: 'silicon', seed: 0, inputs: { failureType: 'gate_oxide_breakdown', trace: snapshots } };
const soc = { domain: 'soc', seed: 0, inputs: { arch: 'unified', radix: 'int8' } };

async function roundTrip(request) {
  const initial = await buildExperimentBundle(request, runtime);
  const text = serializeExperimentBundle(initial);
  const imported = await importExperimentBundle(Buffer.from(text), runtime);
  const replayed = await replayExperimentBundle(imported, runtime);
  assert.deepEqual(replayed.metrics, initial.metrics);
  assert.equal(replayed.sha256, initial.sha256);
  assert.equal(serializeExperimentBundle(replayed), text);
  const { sha256, ...fields } = initial;
  assert.equal(sha256, createHash('sha256').update(canonicalBundleJson(fields)).digest('hex'));
  return initial;
}

test('WP-6.4 fixed-seed quantum export reruns the existing noisy optimizer and seals embedded QASM', async () => {
  const bundle = await roundTrip(quantum);
  assert.equal(bundle.seed, 20241119);
  assert.equal(bundle.badge, 'SIMULATED_NOISY_MODEL');
  assert.equal(bundle.iterations, 110);
  assert.ok(bundle.optimizedFidelity > bundle.initialFidelity);
  assert.match(bundle.artifacts[0].text, /^OPENQASM 3\.0;[\s\S]+x q\[0\];/);
  assert.match(bundle.citation, /04_quantum_hardware_modalities\.json/);
  const changedSeed = await buildExperimentBundle({ ...quantum, seed: quantum.seed + 1 }, runtime);
  assert.notEqual(changedSeed.sha256, bundle.sha256);
  assert.notDeepEqual(changedSeed.optimizedParams, bundle.optimizedParams);
});

test('WP-6.4 silicon forensic evidence reruns the sealed threshold model over actual snapshot fields', async () => {
  const bundle = await roundTrip(silicon);
  assert.equal(bundle.badge, 'SIMULATED_PHYSICS_MODEL');
  assert.equal(bundle.metrics.failure.threshold, oxide);
  assert.equal(bundle.academyEvidence.missionId, 'M2-OXIDE-SOA');
  assert.equal(bundle.metrics.failure.value, snapshots[1].vgsMax);
  assert.equal(bundle.metrics.peaks.vddV, snapshots[1].vdd);
  assert.equal(bundle.initialFidelity, 1);
  assert.ok(bundle.optimizedFidelity < 1);
  assert.match(bundle.artifacts[0].text, /V_vdd vdd 0 PWL\(0 [\d.]+ [\d.]+ [\d.]+\)\n/);
  assert.match(bundle.artifacts[0].text, /\.tran [^\n]+\n\.end\n$/);
  const live = requestFromWorkbench({ workspace: 'silicon', forensic: {
    replay: snapshots, report: { failure: bundle.metrics.failure, peaks: bundle.metrics.peaks, generatedAt: 'excluded' },
  } }, runtime);
  assert.equal((await buildExperimentBundle(live.request, runtime, live.observed)).sha256, bundle.sha256);
  await assert.rejects(buildExperimentBundle({ ...silicon, inputs: { ...silicon.inputs, trace: snapshots.slice(0, 1) } }, runtime), /does not reproduce/);
});

test('WP-6.4 SoC export recomputes actual matmul and both memory paths with sealed references', async () => {
  const bundle = await roundTrip(soc);
  assert.equal(bundle.badge, 'SIMULATED_ARCHITECTURAL_MODEL');
  assert.equal(bundle.metrics.observed.macOps, 32 ** 3);
  assert.equal(bundle.metrics.observed.cycles, 16 * (32 + 2 * 8 - 2));
  assert.ok(bundle.metrics.comparison.unifiedInt8.totalCycles < bundle.metrics.comparison.discreteInt8.totalCycles);
  assert.match(bundle.metrics.outputSha256, /^[0-9a-f]{64}$/);
  assert.equal(bundle.references.length, 2);
  assert.deepEqual(bundle.academyEvidence.evidenceFor, ['exact_output', 'cycle_model']);
  assert.equal(bundle.academyEvidence.reference.sha256, curriculumEntry.sha256);
  const live = requestFromWorkbench({ workspace: 'soc', soc: { result: bundle.metrics.observed } }, runtime);
  await assert.rejects(buildExperimentBundle(live.request, runtime, { ...live.observed, archCycles: 1 }), /recorded SoC benchmark mismatch/);
  assert.equal((await buildExperimentBundle(live.request, runtime, live.observed)).sha256, bundle.sha256);
});

test('WP-6.4 refuses a single-byte change, canonical encoding changes and oversized input', async () => {
  const bundle = await buildExperimentBundle(soc, runtime);
  const text = serializeExperimentBundle(bundle);
  const changed = text.replace('"seed":0', '"seed":1');
  const original = Buffer.from(text);
  assert.equal(Buffer.from(changed).filter((byte, i) => byte !== original[i]).length, 1);
  await assert.rejects(importExperimentBundle(changed, runtime), /SHA-256 seal mismatch/);
  await assert.rejects(importExperimentBundle(text + '\n', runtime), /canonical file bytes mismatch/);
  await assert.rejects(importExperimentBundle('\ufeff' + text, runtime), /valid UTF-8 JSON/);
  await assert.rejects(importExperimentBundle(Buffer.from([0xff]), runtime), /valid UTF-8 JSON/);
  await assert.rejects(importExperimentBundle(new Uint8Array(BUNDLE_MAX_BYTES + 1), runtime), /512 KiB/);
  assert.throws(() => canonicalBundleJson({ bad: Infinity }), /only JSON values/);
  assert.throws(() => canonicalBundleJson(JSON.parse('{"__proto__":{}}')), /reserved JSON key/);
});

test('WP-6.4 locked schema rejects missing provenance and out-of-range or mistyped fields', async () => {
  const bundle = await buildExperimentBundle(soc, runtime);
  for (const key of schema.required) {
    const edited = { ...bundle };
    delete edited[key];
    assert.throws(() => validateBundleSchema(edited, schema), new RegExp('\\.' + key + ' '));
  }
  for (const [patch, diagnostic] of [
    [{ badge: 'HARDWARE_VERIFIED' }, /badge/],
    [{ initialFidelity: -0.01 }, /minimum/],
    [{ optimizedFidelity: 1.01 }, /maximum/],
    [{ optimizedParams: { amplitude: '1' } }, /optimizedParams.amplitude/],
    [{ iterations: 0 }, /iterations/],
    [{ seed: 0.25 }, /seed/],
    [{ reproducibility: { codeVersion: bundle.reproducibility.codeVersion, checkedAt: '2025-02-29T09:00:00Z' } }, /date-time/],
    [{ citation: '' }, /citation/],
    [{ noise: {} }, /noise/],
    [{ sha256: 'ABC' }, /schema pattern/],
  ]) {
    await assert.rejects(importExperimentBundle(serializeExperimentBundle({ ...bundle, ...patch }), runtime), diagnostic);
  }
});

test('WP-6.4 even a resealed record cannot replace vault provenance or replayed results', async () => {
  const bundle = await buildExperimentBundle(soc, runtime);
  const reseal = async changes => {
    const { sha256: _previous, ...fields } = { ...bundle, ...changes };
    return { ...fields, sha256: await sha256BundleText(canonicalBundleJson(fields)) };
  };
  const forgedReferences = await reseal({ references: [{ ...bundle.references[0], citation: 'invented' }] });
  await assert.rejects(importExperimentBundle(serializeExperimentBundle(forgedReferences), runtime), /vault hashes mismatch/);
  const forgedMission = await reseal({ academyEvidence: { ...bundle.academyEvidence, missionId: 'M7-UNIFIED-MEMORY' } });
  await assert.rejects(importExperimentBundle(serializeExperimentBundle(forgedMission), runtime), /sealed curriculum citation/);
  const wrongVersion = await reseal({ reproducibility: { codeVersion: '0'.repeat(40) } });
  await assert.rejects(importExperimentBundle(serializeExperimentBundle(wrongVersion), runtime), /unsupported producing code version/);
  const forgedMetrics = await reseal({ metrics: { ...bundle.metrics, score: 'invented' } });
  const imported = await importExperimentBundle(serializeExperimentBundle(forgedMetrics), runtime);
  await assert.rejects(replayExperimentBundle(imported, runtime), /replayed metrics mismatch/);
  const wrongArtifact = await reseal({ artifacts: [{ filename: 'forged.qasm', role: 'ideal gate target', text: 'OPENQASM 3.0;' }] });
  await assert.rejects(replayExperimentBundle(wrongArtifact, runtime), /replayed bundle seal mismatch/);
});
