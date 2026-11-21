// WP-1.5 — Kernel-frame-fed 60 FPS viewport: unit tests for the renderer-side
// solver-frame pipeline (apps/electrophysics-3d/src/engine/solverFrame.mjs)
// and the FPS trend recorder (engine/fpsTrend.mjs).
//
// These tests import the REAL modules shared with the browser bundle and
// enforce, against docs/master-plan/schemas/solver-frame.schema.json:
//   1. schema conformance of the serialized frame (required keys, format
//      const, provenance badge enum — read from the schema file itself),
//   2. zero per-frame allocation discipline: the envelope and every typed
//      view are allocated once; steady-state ingestion mutates them in place,
//   3. fail-closed admission: non-finite values refused, topology overflow
//      beyond the §2.3 MNA node budget refused, tampered frames fail
//      validation,
//   4. FPS trend recorder math (median/min/p10/max, ring wrap, target).
// The browser-side integration (real THREE scene, ViewCube, hover callout) is
// covered by apps/electrophysics-3d/e2e/wp15-solver-frame.spec.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import {
  SOLVER_FRAME_FORMAT,
  PROVENANCE_BADGES,
  FRAME_CAPACITY,
  createSolverFrameState,
  ingestSnapshot,
  ingestQuantum,
  setView,
  setQuality,
  resetTopology,
  readNode,
  readCurrent,
  readTileC,
  solverFrameToJSON,
  validateSolverFrame,
} from '../apps/electrophysics-3d/src/engine/solverFrame.mjs';
import { FpsTrendRecorder } from '../apps/electrophysics-3d/src/engine/fpsTrend.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url)); // repo root
const SCHEMA = JSON.parse(
  readFileSync(join(ROOT, 'docs/master-plan/schemas/solver-frame.schema.json'), 'utf8')
);

/** Synthetic physics-worker snapshot (same shape physics.worker.ts posts). */
function makeSnapshot(overrides = {}) {
  return {
    t: 0,
    vdd: 1.8,
    vgsMax: 1.8,
    vgsMaxNode: 'MP_Q4',
    iMax: 0.0004,
    tempMaxC: 31.2,
    nodes: { vout_q4: 1.75, vout_bin: 1.8, vdd_rail: 1.79 },
    currents: { VDD: -0.00042, RAIL: 0.0004 },
    temps: {
      traceC: 31.2,
      pcbC: 28.4,
      junctionC: 33.6,
      cryoK: 0.015,
      tiles: { cpu: 35.5, tpu: 42.0, gpu: 44.2, mem: 33.1 },
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Schema conformance (schema-file driven)
// ---------------------------------------------------------------------------

test('WP-1.5: schema requires exactly the frame fields the pipeline emits', () => {
  assert.equal(SCHEMA.properties.format.const, SOLVER_FRAME_FORMAT);
  const schemaRequired = SCHEMA.required;
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot());
  const json = solverFrameToJSON(state);
  for (const key of schemaRequired) {
    assert.ok(key in json, `serialized frame carries schema-required "${key}"`);
  }
  assert.deepEqual(Object.keys(SCHEMA.properties).sort(), Object.keys(json).sort(),
    'serialized frame emits exactly the schema property set');
});

test('WP-1.5: serialized frame validates against the schema (badge enum, circuit items)', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot());
  ingestQuantum(state, [{ x: 0.1, y: 0.2, z: 0.3, purity: 0.9 }], 0.987);
  const json = solverFrameToJSON(state);
  const v = validateSolverFrame(json);
  assert.deepEqual(v.errors, [], `validation errors: ${v.errors.join('; ')}`);
  assert.equal(v.ok, true);
  // Schema enum cross-check (not a copy of it).
  assert.deepEqual([...PROVENANCE_BADGES], SCHEMA.properties.provenance.properties.badge.enum);
  assert.ok(PROVENANCE_BADGES.includes(json.provenance.badge));
  // circuits[].required per the schema items.
  for (const key of SCHEMA.properties.circuits.items.required) {
    assert.ok(key in json.circuits[0], `circuit carries schema-required "${key}"`);
  }
  assert.ok(Array.isArray(json.circuits[0].nodeVoltages));
  assert.ok(json.circuits[0].nodeVoltages.every((x) => Number.isFinite(x)));
  assert.ok(Array.isArray(json.soc.tileActivity) && json.soc.tileActivity.length === 64);
  assert.ok(Array.isArray(json.soc.busLevels) && json.soc.busLevels.length === 64);
});

test('WP-1.5: runtime envelope serializes to a schema-valid frame; typed views stay finite', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot());
  // Schema conformance applies to the schema instance (serialization); the
  // runtime envelope itself is the typed-view form with tiles/bloch strided.
  const v = validateSolverFrame(solverFrameToJSON(state));
  assert.equal(v.ok, true, `serialized envelope errors: ${v.errors.join('; ')}`);
  // Runtime typed views stay finite + within capacity.
  for (const arr of [state.circuits[0].nodeVoltages, state.circuits[0].currents, state.thermal.tiles, state.quantum.bloch, state.soc.tileActivity, state.soc.busLevels]) {
    assert.ok(arr.every((x) => Number.isFinite(x)), 'typed view is finite');
  }
});

// ---------------------------------------------------------------------------
// 2. Zero per-frame allocation discipline
// ---------------------------------------------------------------------------

test('WP-1.5: envelope + typed views are allocated once and mutated in place', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot()); // warm-up: learn topology once
  const startFrameId = state.frameId;
  const refs = {
    envelope: state,
    circuit0: state.circuits[0],
    nodeVoltages: state.circuits[0].nodeVoltages,
    currents: state.circuits[0].currents,
    tiles: state.thermal.tiles,
    bloch: state.quantum.bloch,
    tileActivity: state.soc.tileActivity,
    busLevels: state.soc.busLevels,
    viewQ: state.view.q,
  };
  for (let i = 0; i < 2000; i++) {
    ingestSnapshot(state, makeSnapshot({ t: i / 240 }));
    if (i % 50 === 0) ingestQuantum(state, [{ x: 1, y: 0, z: 0, purity: 1 }], null);
    setView(state, { x: 0, y: 0, z: 0, w: 1 }, { azimuth: i * 0.01 });
  }
  assert.equal(state, refs.envelope, 'envelope object identity is stable across frames');
  assert.equal(state.circuits[0], refs.circuit0, 'circuit envelope identity stable');
  assert.equal(state.circuits[0].nodeVoltages, refs.nodeVoltages, 'node typed view stable (no per-frame realloc)');
  assert.equal(state.circuits[0].currents, refs.currents, 'current typed view stable');
  assert.equal(state.thermal.tiles, refs.tiles, 'tile typed view stable');
  assert.equal(state.quantum.bloch, refs.bloch, 'bloch typed view stable');
  assert.equal(state.soc.tileActivity, refs.tileActivity, 'tileActivity typed view stable');
  assert.equal(state.soc.busLevels, refs.busLevels, 'busLevels typed view stable');
  assert.equal(state.view.q, refs.viewQ, 'view quaternion view stable');
  assert.equal(state.frameId, startFrameId + 2000, 'frameId is the monotonic frame counter');
  assert.ok(state.nodeKeys.length <= FRAME_CAPACITY.nodesPerCircuit);
});

test('WP-1.5: steady-state ingestion allocates no new topology entries', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot());
  const keyCount = state.nodeKeys.length + state.currentKeys.length;
  for (let i = 0; i < 1000; i++) ingestSnapshot(state, makeSnapshot());
  assert.equal(state.nodeKeys.length + state.currentKeys.length, keyCount,
    'no per-frame key registration after the warm-up frame');
});

test('WP-1.5: values land in the typed views (frame-fed reads)', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot());
  assert.ok(Math.abs(readNode(state, 'vout_q4') - 1.75) < 1e-12);
  assert.ok(Math.abs(readCurrent(state, 'RAIL') - 0.0004) < 1e-12);
  assert.equal(state.circuits[0].nodeCount, 3);
  assert.equal(state.circuits[0].currentCount, 2);
  assert.equal(state.thermal.tileCount, 4);
  assert.ok(Math.abs(readTileC(state, 'gpu') - 44.2) < 1e-12, 'canonical tile order (gpu = 44.2)');
  assert.ok(Math.abs(readTileC(state, 'cpu') - 35.5) < 1e-12);
  assert.equal(state.vdd, 1.8);
  // busLevels: vout_bin/1.8 == 1, vout_q4/1.8 == 1.75/1.8
  assert.ok(Math.abs(state.soc.busLevels[0] - 1) < 1e-9);
  assert.ok(Math.abs(state.soc.busLevels[1] - 1.75 / 1.8) < 1e-9);
  // tileActivity normalized: gpu is the ΔT max → 1.0
  assert.ok(Math.abs(state.soc.tileActivity[2] - 1) < 1e-9);
});

// ---------------------------------------------------------------------------
// 3. Fail-closed admission + validation rejections
// ---------------------------------------------------------------------------

test('WP-1.5: non-finite snapshot values are refused (clamped, never NaN)', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot({
    nodes: { vout_q4: NaN, vout_bin: Infinity, vdd_rail: 1.7 },
    temps: { traceC: NaN, pcbC: 28, junctionC: 33, cryoK: 0.015, tiles: { cpu: 30, tpu: 31, gpu: 32, mem: 33 } },
  }));
  assert.equal(readNode(state, 'vout_q4'), 0);
  assert.equal(readNode(state, 'vout_bin'), 0);
  assert.equal(state.thermal.traceC, 27, 'non-finite keeps the last honest ambient');
  const v = validateSolverFrame(solverFrameToJSON(state));
  assert.equal(v.ok, true, 'serialized frame stays schema-valid after clamping');
});

test('WP-1.5: topology overflow beyond the 64-node MNA admission budget is refused', () => {
  const state = createSolverFrameState();
  const nodes = {};
  for (let i = 0; i < 128; i++) nodes['n' + i] = i;
  ingestSnapshot(state, makeSnapshot({ nodes }));
  assert.equal(state.nodeKeys.length, FRAME_CAPACITY.nodesPerCircuit,
    'refuses to grow beyond the §2.3 budget (fail-closed, no silent clamp of the frame)');
  assert.equal(state.circuits[0].nodeCount, FRAME_CAPACITY.nodesPerCircuit);
});

test('WP-1.5: validator rejects tampered frames (format, badge, frameId, thermal)', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot());
  const base = () => solverFrameToJSON(state);

  const badFormat = base(); badFormat.format = 'invention-lab/solver-frame/2';
  assert.equal(validateSolverFrame(badFormat).ok, false);

  const badBadge = base(); badBadge.provenance.badge = 'TOTALLY_VERIFIED_PHYSICS';
  assert.equal(validateSolverFrame(badBadge).ok, false, 'invented badges fail (Law 5)');

  const badFrameId = base(); badFrameId.frameId = -3;
  assert.equal(validateSolverFrame(badFrameId).ok, false);

  const noThermal = base(); delete noThermal.thermal;
  assert.equal(validateSolverFrame(noThermal).ok, false);

  const nanNode = base(); nanNode.circuits[0].nodeVoltages[0] = NaN;
  assert.equal(validateSolverFrame(nanNode).ok, false);

  const replayFlag = base(); replayFlag.live = false;
  assert.equal(validateSolverFrame(replayFlag).ok, true, 'replay frames stay schema-valid');
});

test('WP-1.5: netlist recompile resets learned topology exactly once per event', () => {
  const state = createSolverFrameState();
  ingestSnapshot(state, makeSnapshot());
  resetTopology(state);
  assert.equal(state.nodeKeys.length, 0);
  assert.equal(state.nodeKeyIndex.size, 0);
  ingestSnapshot(state, makeSnapshot({ nodes: { a: 1, b: 2, c: 3 } }));
  assert.equal(state.nodeKeys.length, 3);
  assert.equal(readNode(state, 'b'), 2);
});

// ---------------------------------------------------------------------------
// 4. FPS trend recorder
// ---------------------------------------------------------------------------

test('WP-1.5: FPS trend recorder computes the 60 s median trend (≥55 target check)', () => {
  const rec = new FpsTrendRecorder({ windowS: 60, sampleIntervalMs: 500, targetFps: 55 });
  let t = 0; // ms
  for (let s = 0; s < 60; s++) {
    for (let f = 0; f < 60; f++) {
      rec.frame(t);
      t += 1000 / 60; // deterministic 60 FPS feed
    }
  }
  t = 60_000; // land exactly on the window boundary (accumulated float stops short)
  rec.frame(t);
  const summary = rec.summary(t);
  assert.equal(summary.complete, true, '60 s window elapsed with ≥90 % ring fill');
  assert.ok(summary.samples >= 110 && summary.samples <= 120,
    `500 ms sampling over 60 s (got ${summary.samples}; float-accumulated frame times jitter the interval count)`);
  assert.equal(summary.medianFps, 60, 'median of a perfect 60 FPS feed');
  assert.equal(summary.targetMet, true, '≥55 FPS median target met');
  assert.equal(summary.framesTotal, 3601);
});

test('WP-1.5: FPS trend ring wraps and honestly reports sub-target trends', () => {
  const rec = new FpsTrendRecorder({ windowS: 60, sampleIntervalMs: 500, targetFps: 55 });
  let t = 0;
  for (let s = 0; s < 240; s++) {
    const fps = s < 120 ? 58 : 30; // healthy first half, degraded second half
    for (let f = 0; f < fps; f++) {
      rec.frame(t);
      t += 1000 / fps;
    }
  }
  const summary = rec.summary(t);
  assert.equal(summary.complete, true);
  assert.equal(summary.samples, rec.capacity, 'ring holds exactly one window');
  assert.equal(summary.medianFps, 30, 'newest window (degraded) governs the trend');
  assert.equal(summary.targetMet, false, 'sub-55 trend reported honestly, never hidden');
  assert.equal(summary.minFps, 30, 'degraded-window min tracks the deterministic feed');
  assert.equal(summary.maxFps, 30, 'degraded-window max tracks the deterministic feed');
});

test('WP-1.5: quality-governor transitions are counted on the frame surface', () => {
  const state = createSolverFrameState();
  setQuality(state, 'high', 1.75);
  assert.equal(state.quality.changes, 0);
  setQuality(state, 'medium', 1);
  setQuality(state, 'low', 1);
  assert.equal(state.quality.level, 'low');
  assert.equal(state.quality.changes, 2, 'automatic degradations are visible, never hidden');
});
