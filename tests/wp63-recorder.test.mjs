import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../apps/electrophysics-3d/src/engine/videoRecorder.ts', import.meta.url), 'utf8');
// The core uses only contextual binding annotations. Erase those aliases
// and import the same executable bytes on every CI Node version, including 20.
const core = source.match(/\/\/ BEGIN RECORDER CORE\r?\n([\s\S]+?)\/\/ END RECORDER CORE/)?.[1];
assert.ok(core, 'videoRecorder.ts must contain a data-URL core');
const javascript = core.replace(/^(\s*(?:export )?(?:const|let) \w+): \w+(?= = )/gm, '$1');
const recording = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
const { CAPTURE_FPS, MAX_FRAMES, MAX_DURATION_MS, MAX_VIDEO_BYTES, RASTER_SIZE, admitsVideoChunk,
  cameraAt, createCapturePlan, makeCaptureManifest, nextCaptureFrame, replayFrameHashes } = recording;
const camera = { position: [1, 5, 16], target: [0, 1, 0], up: [0, 1, 0] };
const fallback = { kind: 'frame-sequence', reason: 'Headless fixture' };
const defaultInput = { playing: true, thermalView: false, dockTab: null, replayIndex: null, peelMode: 'assembled' };

function plan(overrides = {}) {
  return createCapturePlan({ workspace: 'silicon', mode: 'cinematic', camera, seed: 63, ...overrides });
}

function sample(plan, index, input = defaultInput) {
  return {
    index,
    input,
    camera: cameraAt(plan, index),
    telemetry: {
      frameId: index * 2 + 20,
      tSimS: index / 30 + 0.5,
      live: true,
      solverBadge: 'SIMULATED_PHYSICS_MODEL',
      channels: [{ id: 'vdd', label: 'VDD', unit: 'V', value: 1.8 }],
      failure: null,
    },
  };
}

function fixtureRasters(seed, count) {
  let state = seed;
  return Array.from({ length: count }, () => {
    const bytes = new Uint8Array(RASTER_SIZE.width * RASTER_SIZE.height * 4);
    for (let i = 0; i < bytes.length; i++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      bytes[i] = state >>> 24;
    }
    return bytes;
  });
}

async function seededCapture(seed) {
  const capture = plan({ seed, durationMs: 1000 });
  const frames = Array.from({ length: capture.frameBudget }, (_, index) =>
    sample(capture, index, { ...defaultInput, thermalView: index >= 10, dockTab: index >= 20 ? 'scope' : null }));
  const rasters = fixtureRasters(seed, frames.length);
  return { rasters, manifest: await makeCaptureManifest(capture, frames, fallback, 'duration', index => rasters[index]) };
}

test('WP-6.3 30-second admission and fixed logical ticks never exceed 900 samples', () => {
  const capture = plan();
  assert.equal(capture.durationMs, 30_000);
  assert.equal(capture.fps, 30);
  assert.equal(capture.frameBudget, MAX_FRAMES);
  assert.equal(nextCaptureFrame(capture, 0, -1), 0);
  assert.equal(nextCaptureFrame(capture, 20, 0), null);
  assert.equal(nextCaptureFrame(capture, 100, 0), 3);
  assert.equal(nextCaptureFrame(capture, 29_999.99, 898), 899);
  assert.equal(nextCaptureFrame(capture, 30_000, 899), null);
  assert.equal(nextCaptureFrame(capture, 30_005, 891), null);
  assert.equal(nextCaptureFrame(capture, -1, -1), null);
  for (const durationMs of [0, 1000 / CAPTURE_FPS - 1, Infinity, NaN, MAX_DURATION_MS + 0.1]) {
    assert.throws(() => plan({ durationMs }), RangeError);
  }
  assert.throws(() => plan({ seed: -1 }), RangeError);
});

test('WP-6.3 seeded camera keyframes interpolate a real path and preserve the first pose', () => {
  const capture = plan();
  assert.deepEqual(capture, plan());
  assert.deepEqual(cameraAt(capture, 0), camera);
  assert.deepEqual(capture.keyframes.map(k => k.frame), [0, 450, 899]);
  assert.notDeepEqual(cameraAt(capture, 120), cameraAt(capture, 121));
  assert.notDeepEqual(cameraAt(capture, 899), cameraAt(plan({ seed: 64 }), 899));
  assert.deepEqual(cameraAt(plan({ mode: 'forensic' }), 899), camera);
  assert.throws(() => plan({ camera: { ...camera, position: [0, NaN, 0] } }), RangeError);
});

test('WP-6.3 identical seeded frame sequences and input replay yield the same SHA-256 evidence', async () => {
  const first = await seededCapture(63);
  const second = await seededCapture(63);
  const different = await seededCapture(64);
  assert.deepEqual(first.manifest, second.manifest);
  assert.notEqual(first.manifest.provenance.captureSha256, different.manifest.provenance.captureSha256);
  const { frames, inputEvents, provenance } = first.manifest;
  assert.equal(provenance.badge, 'SIMULATED_PHYSICS_MODEL');
  assert.equal(provenance.workspace, 'silicon');
  assert.deepEqual(provenance.frameRange, [0, 29]);
  assert.deepEqual(inputEvents.map(event => event.frame), [0, 10, 20]);
  assert.equal(frames[1].timeUs, 33_333);
  assert.equal(frames[3].timeUs, 100_000);
  assert.equal(first.manifest.skippedTicks, 0);
  assert.equal(new Set(provenance.frameSha256).size, 30);
  for (const [index, frame] of frames.entries()) {
    assert.equal(frame.rasterSha256, createHash('sha256').update(first.rasters[index]).digest('hex'));
    assert.match(frame.sha256, /^[0-9a-f]{64}$/);
  }
  const replay = JSON.parse(JSON.stringify(first.manifest));
  assert.deepEqual(await replayFrameHashes(replay), provenance.frameSha256);
  replay.inputEvents[1].state.thermalView = false;
  const tampered = await replayFrameHashes(replay);
  assert.equal(tampered[9], provenance.frameSha256[9]);
  assert.notEqual(tampered[10], provenance.frameSha256[10]);
});

test('WP-6.3 headless fallback preserves missed ticks and refuses invalid sequences', async () => {
  const capture = plan({ durationMs: 100 });
  const manifest = await makeCaptureManifest(capture, [sample(capture, 0), sample(capture, 2)], fallback, 'duration');
  assert.equal(manifest.raster, null);
  assert.equal(manifest.skippedTicks, 1);
  assert.equal(manifest.frames[0].rasterSha256, null);
  assert.deepEqual(manifest.frames.map(frame => frame.index), [0, 2]);
  assert.deepEqual(await replayFrameHashes(manifest), manifest.provenance.frameSha256);
  await assert.rejects(makeCaptureManifest(capture, [], fallback, 'user'), RangeError);
  await assert.rejects(makeCaptureManifest(capture, [sample(capture, 0), sample(capture, 0)], fallback, 'user'), RangeError);
  await assert.rejects(makeCaptureManifest(capture, [sample(capture, 3)], fallback, 'user'), RangeError);
  await assert.rejects(makeCaptureManifest(capture, [sample(capture, 0)], fallback, 'user', () => new Uint8Array(1)), RangeError);
});

test('WP-6.3 encoded chunks are admitted only inside the hard retained-byte budget', () => {
  assert.equal(admitsVideoChunk(0, MAX_VIDEO_BYTES), true);
  assert.equal(admitsVideoChunk(MAX_VIDEO_BYTES - 1, 1), true);
  assert.equal(admitsVideoChunk(MAX_VIDEO_BYTES, 1), false);
  assert.equal(admitsVideoChunk(2, MAX_VIDEO_BYTES), false);
  assert.equal(admitsVideoChunk(0, Number.POSITIVE_INFINITY), false);
  assert.equal(admitsVideoChunk(0, -1), false);
});
