import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * WP-2.6 — forensic-loop unit tests: the event adapter that binds every
 * visual failure effect to the `invention-lab/forensic-autopsy/1` contract.
 *
 * The adapter (`apps/electrophysics-3d/src/physics/forensicEvents.ts`) is
 * import-free pure JavaScript (JSDoc types) — imported here via the same
 * data-URL contract as project.ts/history.ts so the app and the tests can
 * never drift. Zero dependencies: the CI `npm test` job installs nothing.
 *
 * The core honesty property under test: WITHOUT a real threshold-event
 * autopsy report, nothing renders — decorative/untriggered VFX are
 * structurally impossible.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const ADAPTER_TS = path.join(root, 'apps', 'electrophysics-3d', 'src', 'physics', 'forensicEvents.ts');
const source = readFileSync(ADAPTER_TS, 'utf8');

assert.ok(!/^\s*import\s/m.test(source), 'forensicEvents.ts must remain import-free (pure JS + JSDoc) for the Node CI unit-test path');

const FE = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const {
  AUTOPSY_FORMAT,
  anchorForFailure,
  benchFromAnchor,
  normalizeForensicEvent,
  provenanceBadges,
  SlowMoController,
  describeAnchor,
  POST_FIX_RETEST_TICKS,
  SLOW_MO_CADENCE_MS,
} = FE;

// A real autopsy report as the physics worker builds it (the exact
// `invention-lab/forensic-autopsy/1` shape from ep-thermal forensics.rs /
// packages/physics-engine forensics.mjs).
function autopsy(overrides = {}) {
  return {
    format: AUTOPSY_FORMAT,
    generatedAt: '2026-11-21T12:00:00.000Z',
    failure: {
      type: 'gate_oxide_breakdown',
      severity: 'fault',
      value: 2.31,
      threshold: 1.95,
      node: 'MP_Q4',
      governingEquation: 'E-model TDDB: ln(TTF) = ln(A) − γ·Vgs (γ ≈ 300 dec/V)',
      note: 'Vgs 2.31 V exceeded the SKY130 core SOA ceiling 1.95 V — TDDB accelerated; oxide breakdown',
      ...overrides.failure,
    },
    peaks: { vddV: 2.5, vgsV: 2.31, currentA: 0.002, tempC: 41 },
    oscilloscope: [{ t: 0, vdd: 2.5, vout_q4: 1.8, vout_bin: 0, i_vdd: 0.002, trace_c: 30, pcb_c: 27 }],
    thresholdsUsed: { vgs_threshold_v: 1.95, cu_melting_c: 1085, fr4_delamination_c: 260, si_thermal_runaway_c: 200, cryo_quench_15mk_w: 0.012 },
    meta: { simTimeS: 1.2, datasetSha256: '06_failure_physics_thresholds', failingAnchor: { grid: 'die', u: 0.42, v: 0.32, label: 'MP_Q4' }, ...overrides.meta },
  };
}

test('WP-2.6: normalization binds VFX to the autopsy contract (format + anchor + bench position)', () => {
  const ev = normalizeForensicEvent(autopsy(), { kind: 'arc', node: 'MP_Q4', value: 2.31, anchor: { grid: 'die', u: 0.42, v: 0.32, label: 'MP_Q4' }, format: AUTOPSY_FORMAT });
  assert.equal(ev.format, 'invention-lab/forensic-autopsy/1');
  assert.equal(ev.kind, 'gate_oxide_breakdown');
  assert.equal(ev.severity, 'fault');
  assert.equal(ev.anchor.grid, 'die');
  assert.deepEqual(ev.bench, { x: 0.6 + (0.42 - 0.5) * 1.2, y: 1.05, z: -1.15 + (0.32 - 0.5) * 0.8 });
  // No fx payload → the autopsy meta anchor (kernel evidence) still binds.
  const ev2 = normalizeForensicEvent(autopsy());
  assert.equal(ev2.anchor.u, 0.42);
});

test('WP-2.6: ZERO decorative effects — no autopsy report, no VFX (fail-closed)', () => {
  assert.throws(() => normalizeForensicEvent(null), /refusing|no .*report/i);
  assert.throws(() => normalizeForensicEvent({ format: 'some-other-format' }), /refusal|autopsy/i);
  assert.throws(() => normalizeForensicEvent({ format: AUTOPSY_FORMAT, failure: undefined }), /failure block/);
  // A tampered failure block (no numeric value) is refused too.
  const stripped = autopsy();
  stripped.failure = { type: 'x' };
  assert.throws(() => normalizeForensicEvent(stripped), /failure block/);
});

test('WP-2.6: every threshold-event kind maps to a real kernel coordinate', () => {
  // gate_oxide: the failing device cell (Q4 vs BIN, P vs N).
  assert.deepEqual(anchorForFailure('gate_oxide_breakdown', 'MP_Q4'), { grid: 'die', u: 0.42, v: 0.32, label: 'MP_Q4' });
  assert.deepEqual(anchorForFailure('gate_oxide_breakdown', 'MP_BIN'), { grid: 'die', u: 0.58, v: 0.32, label: 'MP_BIN' });
  assert.deepEqual(anchorForFailure('gate_oxide_breakdown', 'MN_BIN'), { grid: 'die', u: 0.58, v: 0.52, label: 'MN_BIN' });
  // trace fusing: the met2 supply-rail row.
  assert.deepEqual(anchorForFailure('trace_fusing', 'RAIL_VDD'), { grid: 'die', u: 0.5, v: 0.18, label: 'RAIL_VDD' });
  // si thermal runaway: the junction cell.
  assert.deepEqual(anchorForFailure('si_thermal_runaway', null), { grid: 'die', u: 0.42, v: 0.42, label: 'junction' });
  // FR-4 delamination: the hottest tile (worker-measured; table default gpu).
  assert.deepEqual(anchorForFailure('pcb_delamination', null).grid, 'pcb');
  // cryo quench: the mixing chamber.
  assert.deepEqual(anchorForFailure('cryo_quench', 'mixing_chamber'), { grid: 'cryo', u: 0.5, v: 0.5, label: 'mixing_chamber' });
  // Unknown kind → refuse (no invented anchor).
  assert.throws(() => anchorForFailure('alien_invasion', null), /unknown failure kind/);
});

test('WP-2.6: bench mapping lands anchors inside the oracle bay regions', () => {
  // Die rail row (the region world visualizes for melt/fusing).
  const rail = benchFromAnchor(anchorForFailure('trace_fusing', 'RAIL_VDD'));
  assert.ok(Math.abs(rail.z - (-1.15)) < 0.5, 'die anchors near the z=-1.15 rail row');
  assert.ok(Math.abs(rail.x) < 0.8, 'die anchors near the bench x center');
  // PCB plane (x ≈ 1.2, z ≈ 1.4).
  const pcb = benchFromAnchor({ grid: 'pcb', u: 0.76, v: 0.36, label: 'gpu' });
  assert.ok(Math.abs(pcb.x - 1.2 - (0.76 - 0.5) * 1.6) < 1e-9);
  assert.ok(Math.abs(pcb.z - 1.4 - (0.36 - 0.5) * 1.0) < 1e-9);
  // Cryo bay at the origin.
  assert.deepEqual(benchFromAnchor({ grid: 'cryo', u: 0.5, v: 0.5, label: 'x' }), { x: 0, y: 1.0, z: 0 });
  // Out-of-range coordinates clamp (fail-safe, never NaN).
  const clamped = benchFromAnchor({ grid: 'die', u: 7, v: -3, label: 'x' });
  assert.ok(Number.isFinite(clamped.x) && Number.isFinite(clamped.z));
  assert.throws(() => benchFromAnchor({ grid: 'holodeck', u: 0, v: 0, label: 'x' }), /unknown anchor grid/);
  assert.throws(() => benchFromAnchor(null), /missing kernel coordinates/);
});

test('WP-2.6: slow-motion replay emits schema-honest live:false frames at the 100 ms cadence', () => {
  const frames = Array.from({ length: 32 }, (_, i) => ({ t: i / 240, vdd: 2.5, vgsMax: 1 + i * 0.04, iMax: 0.002, tempMaxC: 30 + i }));
  const sm = new SlowMoController();
  const first = sm.start(frames, 1000);
  assert.equal(first.live, false, 'replay frames are live:false (solver-frame schema)');
  assert.equal(first.replayIndex, 0);
  assert.equal(first.replayTotal, 32);
  assert.equal(first.cadenceMs, SLOW_MO_CADENCE_MS);
  // At t=1000+100 exactly one more frame is due; nothing before the cadence.
  assert.deepEqual(sm.tick(1099), []);
  const due = sm.tick(1100);
  assert.equal(due.length, 1);
  assert.equal(due[0].replayIndex, 1);
  assert.equal(due[0].live, false);
  // A long jump emits every due frame in order (cadence spacing preserved;
  // frames due AT the query time are delivered — inclusive boundary).
  const batch = sm.tick(1500);
  assert.deepEqual(batch.map((f) => f.replayIndex), [2, 3, 4, 5]);
  // Scrub jumps and pauses playback.
  const scrubbed = sm.scrub(30);
  assert.equal(scrubbed.replayIndex, 30);
  assert.equal(sm.isPlaying(), false);
  // Playback ends by holding the failure instant (last frame).
  sm.start(frames, 0);
  sm.tick(100_000);
  assert.equal(sm.isPlaying(), false);
  assert.equal(sm.currentIndex(), 31);
});

test('WP-2.6: empty replay window refuses to play (no fabricated frames)', () => {
  const sm = new SlowMoController();
  assert.equal(sm.start([], 0), null);
  assert.deepEqual(sm.tick(1000), []);
});

test('WP-2.6: provenance badges carry contract + dataset + honesty + fix source', () => {
  const badges = provenanceBadges(autopsy(), { source: '02_semiconductor_pdk_silicon.json → parameters.sky130a.nominal_vdd_v', title: 'Clamp VDD' });
  const labels = badges.map((b) => b.label);
  assert.ok(labels.includes('SIMULATED_PHYSICS_MODEL'), 'Law-5 honesty badge');
  assert.ok(labels.includes('invention-lab/forensic-autopsy/1'), 'contract badge');
  assert.ok(labels.some((l) => l.includes('06_failure_physics_thresholds')), 'dataset badge');
  assert.ok(labels.some((l) => l.includes('02_semiconductor_pdk_silicon.json')), 'fix-source badge');
  for (const b of badges) assert.ok(b.why.length > 10, 'each badge carries its why');
  assert.throws(() => provenanceBadges(null), /badges require an autopsy/);
});

test('WP-2.6: failing-coordinate readout is human-readable', () => {
  const ev = normalizeForensicEvent(autopsy());
  assert.equal(describeAnchor(ev), 'die (0.42, 0.32) — MP_Q4');
  assert.equal(describeAnchor(null), '');
});

test('WP-2.6: post-fix re-test window is one clean second of engine ticks', () => {
  assert.equal(POST_FIX_RETEST_TICKS, 240, '240 ticks @ 240 Hz = 1 s re-test window');
});

test('WP-2.6: all four threshold families normalize (arc / melt / smoke / quench bindings)', () => {
  const cases = [
    ['gate_oxide_breakdown', 'arc', 2.31, 1.95],
    ['trace_fusing', 'melt', 1085, 1085],
    ['pcb_delamination', 'smoke', 260, 260],
    ['si_thermal_runaway', 'melt', 200, 200],
    ['cryo_quench', 'quench', 0.0125, 0.012],
  ];
  for (const [type, fxKind, value, threshold] of cases) {
    const report = autopsy({ failure: { type, value, threshold } });
    report.meta.failingAnchor = anchorForFailure(type, null);
    const ev = normalizeForensicEvent(report, { kind: fxKind, value, anchor: report.meta.failingAnchor, format: AUTOPSY_FORMAT });
    assert.equal(ev.fxKind, fxKind, `${type} → ${fxKind} VFX binding`);
    assert.ok(Number.isFinite(ev.bench.x) && Number.isFinite(ev.bench.y) && Number.isFinite(ev.bench.z));
  }
});
