/**
 * WP-1.6 — multi-channel oscilloscope telemetry history.
 *
 * Channels are driven **strictly** by WP-1.5's pre-allocated solver-frame
 * envelope (`src/engine/solverFrame.mjs` `frameStore`): every sample reads
 * the frame's typed views through the frame's zero-allocation readers
 * (`readNode` / `readCurrent` / thermal scalars). There are no fabricated
 * traces, no hardcoded waveforms and no per-sample heap allocation — each
 * channel owns one pre-allocated `Float64Array` ring written through a
 * wrapping cursor, gated on the frame's monotonic `frameId` so a sample
 * happens at most once per solver frame.
 *
 * Plain ESM (imports only the same-package solver-frame module) so the Node
 * unit tests and the browser bundle share the exact implementation.
 */

import { frameStore, readNode, readCurrent } from '../../engine/solverFrame.mjs';

/** Sampler cadence (ms) — the hook samples at most once per solver frame. */
export const TELEMETRY_SAMPLE_MS = 16;

/** Ring length per channel: 600 samples ≈ 10 s of 60 Hz telemetry. */
export const TELEMETRY_RING_LEN = 600;

/**
 * Channel table — the oscilloscope's declared channels. `source` reads the
 * solver-frame envelope (never ad-hoc state); every channel is derived from
 * the physics solve or the frame scalars published by WP-1.5.
 */
export const TELEMETRY_CHANNELS = Object.freeze([
  { id: 'vdd', label: 'VDD', unit: 'V', color: '#62d0ff', source: (s) => s.vdd },
  { id: 'i_rail', label: 'I_RAIL', unit: 'mA', color: '#ffd98a', source: (s) => Math.abs(readCurrent(s, 'RAIL')) * 1000 },
  { id: 'vout_q4', label: 'VOUT_Q4', unit: 'V', color: '#7ee081', source: (s) => readNode(s, 'vout_q4') },
  { id: 'vout_bin', label: 'VOUT_BIN', unit: 'V', color: '#c9a2ff', source: (s) => readNode(s, 'vout_bin') },
  { id: 't_trace', label: 'T_TRACE', unit: '°C', color: '#e05a40', source: (s) => s.thermal.traceC },
  { id: 't_junction', label: 'T_JUNCTION', unit: '°C', color: '#f0a94f', source: (s) => s.thermal.junctionC },
  { id: 'cryo', label: 'CRYO', unit: 'K', color: '#8fd6ff', source: (s) => s.thermal.cryoK },
]);

export const TELEMETRY_CHANNEL_COUNT = TELEMETRY_CHANNELS.length;

/**
 * Allocate the multi-channel ring history exactly once. `lastValues` is the
 * honest last sample per channel (used by the dock legend and the e2e
 * assertions); `samples` counts frame-gated samples; channels with no
 * solver frames yet read 0 — an honest zero, not a fabricated waveform.
 */
export function createTelemetryHistory(ringLen = TELEMETRY_RING_LEN) {
  const rings = TELEMETRY_CHANNELS.map(() => new Float64Array(ringLen));
  return {
    ringLen,
    rings,
    cursors: TELEMETRY_CHANNELS.map(() => 0),
    filled: TELEMETRY_CHANNELS.map(() => 0),
    lastValues: TELEMETRY_CHANNELS.map(() => 0),
    lastFrameId: -1,
    samples: 0,
    frame: null, // the frame state the last sample came from (set below)
  };
}

/**
 * Sample all channels from `state` (normally the `frameStore` singleton).
 * Zero-allocation: one frame produces at most one ring write per channel
 * (gated on the frame's monotonic `frameId`). Returns whether a sample was
 * taken.
 */
export function sampleTelemetry(history, state) {
  if (!state || state.frameId === history.lastFrameId) return false;
  history.lastFrameId = state.frameId;
  for (let c = 0; c < TELEMETRY_CHANNEL_COUNT; c++) {
    const ch = TELEMETRY_CHANNELS[c];
    const v = Number.isFinite(ch.source(state)) ? ch.source(state) : 0;
    const ring = history.rings[c];
    ring[history.cursors[c]] = v;
    history.cursors[c] = (history.cursors[c] + 1) % history.ringLen;
    if (history.filled[c] < history.ringLen) history.filled[c] += 1;
    history.lastValues[c] = v;
  }
  history.samples += 1;
  history.frame = state;
  return true;
}

/** The default sampler bound to the `frameStore` singleton. */
export function sampleFrameStore(history) {
  return sampleTelemetry(history, frameStore);
}

/**
 * Read the last `n` samples of channel `c` in chronological order into an
 * existing target array (start index 0) — used by the canvas renderer, which
 * reuses one scratch array instead of allocating per draw. Returns the
 * number of samples written.
 */
export function readChannelInto(history, c, target, n = history.ringLen) {
  const ring = history.rings[c];
  const filled = history.filled[c];
  const count = Math.min(n, filled);
  const head = history.cursors[c];
  for (let i = 0; i < count; i++) {
    const idx = (head - count + i + history.ringLen * 2) % history.ringLen;
    target[i] = ring[idx];
  }
  return count;
}

/** Live value + meta of one channel (dock legend / e2e assertions). */
export function channelMeta(c) {
  return TELEMETRY_CHANNELS[c];
}
