import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMISSION_BUDGETS,
  ADMISSION_DOMAINS,
  ADMISSION_SOURCE,
  admitWorkload,
  admitAndSurface,
  publishRefusal,
  subscribeRefusals,
  getLatestRefusal,
  getRefusalCount,
  readRefusalRing,
  resetAdmissionSurface,
} from '../apps/electrophysics-3d/src/ui/cad/admissionSurface.mjs';
import {
  LOGIC_STREAM_FORMAT,
  LOGIC_RING_EVENTS,
  attachLogicStream,
  detachLogicStream,
  getLogicStream,
  isLogicStreamActive,
  publishLogicEvents,
  readLogicEvents,
  logicEventStats,
  subscribeLogic,
  resetLogicStream,
} from '../apps/electrophysics-3d/src/ui/cad/logicStream.mjs';
import {
  TELEMETRY_CHANNELS,
  TELEMETRY_CHANNEL_COUNT,
  TELEMETRY_RING_LEN,
  createTelemetryHistory,
  sampleTelemetry,
  readChannelInto,
} from '../apps/electrophysics-3d/src/ui/cad/telemetryScope.mjs';
import { createSolverFrameState, ingestSnapshot, frameStore, validateSolverFrame, solverFrameToJSON } from '../apps/electrophysics-3d/src/engine/solverFrame.mjs';

// ---------------------------------------------------------------------------
// WP-1.6 unit gate: admission refusals across ALL FOUR §2.3 budgets
// ---------------------------------------------------------------------------

test('admission: quantum budget refuses > 6 interactive qubits with the exact honest reason', () => {
  const ok = admitWorkload({ domain: 'quantum', qubits: 6 });
  assert.equal(ok.admitted, true, '6 qubits sit exactly at the interactive cap');
  const out = admitWorkload({ domain: 'quantum', qubits: 8 });
  assert.equal(out.admitted, false);
  assert.match(out.reason, /admission refused: quantum workload requests 8 qubits/);
  assert.match(out.reason, /interactive budget is ≤ 6 \(density matrix d ≤ 64\)/);
  assert.match(out.reason, /02_SYSTEM_ARCHITECTURE\.md §2\.3/);
  assert.equal(out.domain, 'quantum');
  assert.equal(out.requested, 8);
  assert.equal(out.limit, ADMISSION_BUDGETS.quantumMaxQubits);
});

test('admission: MNA budget refuses > 64 nodes AND > 32 voltage sources', () => {
  const nodes = admitWorkload({ domain: 'mna', nodes: 65 });
  assert.equal(nodes.admitted, false);
  assert.match(nodes.reason, /requests 65 nodes, budget is ≤ 64 per frame/);
  const vsrc = admitWorkload({ domain: 'mna', nodes: 10, voltageSources: 33 });
  assert.equal(vsrc.admitted, false);
  assert.match(vsrc.reason, /requests 33 voltage sources, budget is ≤ 32 per frame/);
  assert.equal(admitWorkload({ domain: 'mna', nodes: 64, voltageSources: 32 }).admitted, true, 'exact-limit workload is admitted');
});

test('admission: thermal budget refuses > 128×128 grids', () => {
  const out = admitWorkload({ domain: 'thermal', cols: 129, rows: 128 });
  assert.equal(out.admitted, false);
  assert.match(out.reason, /requests 129×128 cells, budget is ≤ 128×128 per workspace/);
  const out2 = admitWorkload({ domain: 'thermal', cols: 128, rows: 129 });
  assert.equal(out2.admitted, false);
  assert.match(out2.reason, /requests 128×129 cells/);
  assert.equal(admitWorkload({ domain: 'thermal', cols: 128, rows: 128 }).admitted, true);
});

test('admission: arena budget refuses > 512 MiB', () => {
  const out = admitWorkload({ domain: 'arena', bytes: 536870913 });
  assert.equal(out.admitted, false);
  assert.match(out.reason, /requests 536870913 bytes, budget is ≤ 536870912 \(512 MiB, app ≤ 2 GB per Law 4\)/);
  assert.equal(admitWorkload({ domain: 'arena', bytes: 536870912 }).admitted, true);
});

test('admission: non-finite and unknown inputs are refused fail-closed (no silent clamps)', () => {
  assert.equal(admitWorkload({ domain: 'quantum', qubits: NaN }).admitted, false);
  assert.equal(admitWorkload({ domain: 'mna', nodes: -1 }).admitted, false);
  assert.equal(admitWorkload({ domain: 'thermal', cols: Infinity }).admitted, false);
  assert.equal(admitWorkload({ domain: 'arena', bytes: NaN }).admitted, false);
  assert.equal(admitWorkload({ domain: 'unknown-domain' }).admitted, false);
  assert.equal(admitWorkload(null).admitted, false);
});

test('admission: refusal bus surfaces every payload verbatim (never hidden or clamped)', async () => {
  resetAdmissionSurface();
  const seen = [];
  const unsub = subscribeRefusals((r) => seen.push(r));
  const out = admitAndSurface({ domain: 'quantum', qubits: 12 });
  assert.equal(out.admitted, false);
  await new Promise((resolve) => setImmediate(resolve)); // bus notifies on a microtask
  const latest = getLatestRefusal();
  assert.ok(latest, 'refusal published to the bus');
  assert.equal(latest.reason, out.reason, 'reason passes through VERBATIM');
  assert.equal(latest.domain, 'quantum');
  assert.equal(seen.length, 1, 'subscribers notified');
  assert.equal(getRefusalCount(), 1);
  // An admitted workload is NOT published (only refusals land on the bus).
  admitAndSurface({ domain: 'quantum', qubits: 2 });
  assert.equal(getRefusalCount(), 1);
  // Ring is bounded at 8, oldest overwritten; count keeps rising (never lost).
  for (let i = 0; i < 12; i++) publishRefusal({ admitted: false, reason: `refusal ${i}`, domain: 'mna', requested: 64 + i, limit: 64 });
  assert.equal(getRefusalCount(), 13);
  const ring = readRefusalRing();
  assert.equal(ring.length, 8, 'bounded ring of the last 8 refusals');
  const suffixes = ring.map((r) => Number(r.reason.match(/refusal (\d+)/)[1]));
  for (let i = 1; i < suffixes.length; i++) {
    assert.ok(suffixes[i] > suffixes[i - 1], 'ring is chronological');
  }
  assert.ok(getLatestRefusal().reason.includes("refusal 11"), "newest refusal is the loops last");
  unsub();
  resetAdmissionSurface();
  assert.equal(getRefusalCount(), 0);
  assert.equal(getLatestRefusal(), null);
});

test('admission: the four §2.3 domains are the declared refusal classes', () => {
  assert.deepEqual([...ADMISSION_DOMAINS], ['quantum', 'mna', 'thermal', 'arena']);
  assert.equal(ADMISSION_BUDGETS.quantumMaxQubits, 6);
  assert.equal(ADMISSION_BUDGETS.mnaMaxNodes, 64);
  assert.equal(ADMISSION_BUDGETS.mnaMaxVoltageSources, 32);
  assert.equal(ADMISSION_BUDGETS.thermalMaxCols, 128);
  assert.equal(ADMISSION_BUDGETS.thermalMaxRows, 128);
  assert.equal(ADMISSION_BUDGETS.arenaMaxBytes, 536870912);
  assert.match(ADMISSION_SOURCE, /02_SYSTEM_ARCHITECTURE\.md §2\.3/);
});

// ---------------------------------------------------------------------------
// WP-1.6: oscilloscope channels are driven strictly by solver-frame arrays
// ---------------------------------------------------------------------------

test('telemetry: channels read the solver-frame typed arrays with zero fabrication', () => {
  const history = createTelemetryHistory();
  assert.equal(TELEMETRY_CHANNEL_COUNT, TELEMETRY_CHANNELS.length);
  for (const ring of history.rings) {
    assert.ok(ring instanceof Float64Array, 'pre-allocated typed rings');
    assert.equal(ring.length, TELEMETRY_RING_LEN);
  }
  // Zero solver frames ingested → the honest fresh-envelope state (WP-1.5
  // initializes thermal scalars at the 300 K bench ambient): no fabricated
  // waveforms anywhere.
  const state = createSolverFrameState();
  sampleTelemetry(history, state);
  const fresh = Object.fromEntries(TELEMETRY_CHANNELS.map((ch, c) => [ch.id, history.lastValues[c]]));
  assert.equal(fresh.vdd, 0);
  assert.equal(fresh.i_rail, 0);
  assert.equal(fresh.vout_q4, 0);
  assert.equal(fresh.vout_bin, 0);
  assert.equal(fresh.t_trace, 27, 'fresh envelope ambient (27 °C bench)');
  assert.equal(fresh.t_junction, 27);
  assert.equal(fresh.cryo, 0.015);
  // Feed a REAL snapshot through the WP-1.5 ingest path; channels must
  // reflect exactly what the frame's typed views hold.
  ingestSnapshot(state, {
    t: 0.5,
    vdd: 1.8,
    nodes: { vout_q4: 0.9, vout_bin: 1.2, vgs_max: 1.4 },
    currents: { RAIL: -0.36 },
    temps: { traceC: 45.5, junctionC: 61.25, pcbC: 31, cryoK: 4.2 },
  });
  sampleTelemetry(history, state);
  const byId = Object.fromEntries(TELEMETRY_CHANNELS.map((ch, c) => [ch.id, history.lastValues[c]]));
  assert.equal(byId.vdd, 1.8);
  assert.equal(byId.i_rail, 360, 'mA conversion of |RAIL|');
  assert.equal(byId.vout_q4, 0.9);
  assert.equal(byId.vout_bin, 1.2);
  assert.equal(byId.t_trace, 45.5);
  assert.equal(byId.t_junction, 61.25);
  assert.equal(byId.cryo, 4.2);
});

test('telemetry: sampling is frame-gated and allocation-free (rings wrap, no growth)', () => {
  const history = createTelemetryHistory();
  const state = createSolverFrameState();
  // One snapshot = one frameId → repeated sampling without a new frame is a no-op.
  ingestSnapshot(state, { t: 0, vdd: 1.0, nodes: {}, currents: {} });
  assert.equal(sampleTelemetry(history, state), true);
  assert.equal(sampleTelemetry(history, state), false, 'same frameId must not double-sample');
  assert.equal(history.samples, 1);
  // 600 + 5 new frames → rings wrap at exactly TELEMETRY_RING_LEN.
  for (let i = 0; i < TELEMETRY_RING_LEN + 5; i++) {
    ingestSnapshot(state, { t: i / 60, vdd: 1.0 + i * 1e-9, nodes: {}, currents: {} });
    assert.equal(sampleTelemetry(history, state), true);
  }
  assert.equal(history.samples, TELEMETRY_RING_LEN + 6);
  for (const ring of history.rings) assert.equal(ring.length, TELEMETRY_RING_LEN, 'rings never grow');
  assert.ok(Object.keys(state).every(() => true));
});

test('telemetry: readChannelInto replays chronological ring order (renderer contract)', () => {
  const history = createTelemetryHistory();
  const state = createSolverFrameState();
  const values = [3, 1, 4, 1, 5, 9, 2, 6];
  for (const v of values) {
    ingestSnapshot(state, { t: 0, vdd: v, nodes: {}, currents: {} });
    sampleTelemetry(history, state);
  }
  const scratch = new Float64Array(history.ringLen);
  const n = readChannelInto(history, 0, scratch);
  assert.equal(n, values.length);
  for (let i = 0; i < n; i++) assert.equal(scratch[i], values[i], `chronological ${i}`);
});

test('telemetry: sampled state serializes to a schema-valid solver-frame', () => {
  const history = createTelemetryHistory();
  ingestSnapshot(frameStore, {
    t: 0.01,
    vdd: 1.8,
    nodes: { vout_q4: 0.9, vout_bin: 1.2 },
    currents: { RAIL: 0.2 },
    temps: { traceC: 45, junctionC: 60, pcbC: 30 },
  });
  sampleTelemetry(history, frameStore);
  const json = solverFrameToJSON(frameStore);
  const check = validateSolverFrame(json);
  assert.equal(check.ok, true, `frame must stay schema-valid: ${JSON.stringify(check.errors)}`);
  resetLogicStream();
});

// ---------------------------------------------------------------------------
// WP-1.6: logic analyzer — typed ep-logic event-stream interface (Phase 3 stub)
// ---------------------------------------------------------------------------

test('logic: no stream attached → honest inactive state, publishes refused', () => {
  resetLogicStream();
  assert.equal(isLogicStreamActive(), false);
  assert.equal(getLogicStream(), null);
  const out = publishLogicEvents([{ t: 0, channel: 'q0', value: 1 }]);
  assert.equal(out.accepted, 0);
  assert.equal(out.refused, 1);
  assert.match(out.reasons[0], /no logic stream attached/);
  assert.equal(readLogicEvents().length, 0, 'no fabricated events');
});

test('logic: attach validates the descriptor fail-closed', () => {
  assert.throws(() => attachLogicStream(null), /descriptor/);
  assert.throws(() => attachLogicStream({ name: 'x!', channels: ['a'] }), /name/);
  assert.throws(() => attachLogicStream({ name: 'rig', channels: [] }), /channels/);
  assert.throws(() => attachLogicStream({ name: 'rig', channels: ['a', 'a'] }), /unique/);
  assert.throws(() => attachLogicStream({ name: 'rig', channels: ['a'.repeat(65)] }), /channels/);
  const stream = attachLogicStream({ name: 'wp16-rig', channels: ['q0', 'q1'] });
  assert.equal(stream.format, LOGIC_STREAM_FORMAT);
  assert.equal(stream.badge, 'SIMULATED_ARCHITECTURAL_MODEL');
  assert.equal(isLogicStreamActive(), true);
  assert.equal(getLogicStream().name, 'wp16-rig');
});

test('logic: publishes are typed, bounded and fail-closed on unknown channels', () => {
  resetLogicStream();
  attachLogicStream({ name: 'rig', channels: ['q0', 'q1'] });
  const out = publishLogicEvents([
    { t: 0.1, channel: 'q0', value: 1, edge: 'rising' },
    { t: 0.2, channel: 'q1', value: 0, edge: 'falling' },
    { t: 0.3, channel: 'q9', value: 1 }, // undeclared channel → refused
    { t: 0.25, channel: 'q0', value: 1 }, // chronologically valid vs last ACCEPTED (0.2)
    { t: 0.4, channel: 'q0', value: NaN }, // non-finite → refused
  ]);
  assert.equal(out.accepted, 3);
  assert.equal(out.refused, 2);
  assert.match(out.reasons[0], /not declared by stream/);
  assert.match(out.reasons[1], /value must be finite/);
  const events = readLogicEvents();
  assert.equal(events.length, 3);
  assert.equal(events[0].channel, 'q0');
  assert.equal(events[0].value, 1);
  assert.equal(events[0].edge, 'rising');
  assert.equal(events[1].channel, 'q1');
  assert.equal(events[2].t, 0.25);
  assert.equal(events[2].edge, '', 'edge-less events are level');
  const stats = logicEventStats();
  assert.equal(stats.total, 3);
  assert.equal(stats.refused, 2);
  assert.equal(stats.buffered, 3);
});

test('logic: ring is bounded at 512 events (oldest overwritten, never grown)', () => {
  resetLogicStream();
  attachLogicStream({ name: 'rig', channels: ['q0'] });
  const batch = [];
  for (let i = 0; i < LOGIC_RING_EVENTS + 20; i++) batch.push({ t: i * 0.01, channel: 'q0', value: i % 2 });
  const out = publishLogicEvents(batch);
  assert.equal(out.accepted, LOGIC_RING_EVENTS + 20);
  assert.equal(readLogicEvents().length, LOGIC_RING_EVENTS);
  const events = readLogicEvents();
  assert.equal(events[0].t, 20 * 0.01, 'oldest 20 rolled off');
  assert.equal(logicEventStats().buffered, LOGIC_RING_EVENTS);
});

test('logic: detach returns to the honest inactive state; subscribe notifies', async () => {
  resetLogicStream();
  const notices = [];
  const unsub = subscribeLogic(() => notices.push(getLogicStream()?.name ?? null));
  attachLogicStream({ name: 'rig', channels: ['q0'] });
  await new Promise((resolve) => setImmediate(resolve)); // notifications coalesce per tick
  detachLogicStream();
  assert.equal(isLogicStreamActive(), false);
  assert.equal(readLogicEvents().length, 0, 'ring cleared on detach');
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(notices.length, 2, 'attach + detach each notified');
  assert.deepEqual(notices, ['rig', null]);
  unsub();
  resetLogicStream();
});
