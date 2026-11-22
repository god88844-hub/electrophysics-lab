// @ts-nocheck
/**
 * WP-2.6 — forensic event adapter.
 *
 * Pure, IMPORT-FREE JavaScript (JSDoc types — same data-URL unit-test
 * contract as project.ts/history.ts): normalizes the worker's threshold
 * events + `invention-lab/forensic-autopsy/1` reports into anchored visual
 * events, maps kernel-reported failing coordinates to bench space, drives
 * the 100 ms slow-motion replay state machine (schema-honest `live: false`
 * solver frames per solver-frame.schema.json), and builds the verified
 * provenance badges.
 *
 * Zero decorative VFX: every anchor/badge here is derived from a real
 * threshold event computed by the physics engine (ep-thermal/ep-circuit
 * mirrors) — no event, no effect.
 */

/** The forensic report contract (WP-2.3, ep-thermal `forensics.rs` mirror). */
export const AUTOPSY_FORMAT = 'invention-lab/forensic-autopsy/1';

/** Post-fix re-test length in physics ticks (240 Hz → 1 s clean window). */
export const POST_FIX_RETEST_TICKS = 240;

/** Slow-motion playback cadence in ms — one ring frame per tick of the replay clock. */
export const SLOW_MO_CADENCE_MS = 100;

/**
 * Kernel-reported failing coordinates per failure kind — the exact
 * heat-injection cells the worker heats for each failing structure
 * (physics.worker.ts `injectHeat`): device cells at (0.42/0.58, 0.32/0.52),
 * the met2 supply-rail row at y=0.18, the junction at (0.42, 0.42), PCB
 * tiles on the pcb grid, the cryo mixing chamber.
 * @param {string} kind threshold-event type
 * @param {string | null} node failing structure label from the event
 * @returns {{ grid: string, u: number, v: number, label: string }}
 */
export function anchorForFailure(kind, node) {
  switch (kind) {
    case 'gate_oxide_breakdown': {
      const isBin = typeof node === 'string' && node.includes('BIN');
      const isN = typeof node === 'string' && node.startsWith('MN');
      return {
        grid: 'die',
        u: isBin ? 0.58 : 0.42,
        v: isN ? 0.52 : 0.32,
        label: node ?? 'MP_Q4',
      };
    }
    case 'trace_fusing':
      // Center of the 5 rail injection cells (0.35 + i·0.075, 0.18).
      return { grid: 'die', u: 0.5, v: 0.18, label: node ?? 'RAIL_VDD' };
    case 'si_thermal_runaway':
      return { grid: 'die', u: 0.42, v: 0.42, label: node ?? 'junction' };
    case 'pcb_delamination':
      // The worker reports the hottest tile via the anchor hook; the default
      // is the GPU tile (largest idle power in the verified tile table).
      return { grid: 'pcb', u: 0.76, v: 0.36, label: node ?? 'gpu' };
    case 'cryo_quench':
      return { grid: 'cryo', u: 0.5, v: 0.5, label: node ?? 'mixing_chamber' };
    default:
      throw new Error(`forensicEvents: unknown failure kind "${kind}" — refusing to anchor a decorative effect`);
  }
}

/**
 * Kernel grid coordinate → bench-space position (cm). Calibrated to the
 * bench regions the forensic bay already visualizes: the die rail row sits
 * at bench z ≈ −1.15, the PCB bench at x ≈ 1.2/z ≈ 1.4, the cryo bay at the
 * origin. Failure effects land ON the failing structure, not on a kind-level
 * hardcode: two failing devices at different grid cells produce different
 * bench positions.
 * @param {{ grid: string, u: number, v: number, label: string }} anchor
 * @returns {{ x: number, y: number, z: number }}
 */
export function benchFromAnchor(anchor) {
  if (!anchor || typeof anchor.u !== 'number' || typeof anchor.v !== 'number') {
    throw new Error('forensicEvents: anchor missing kernel coordinates');
  }
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const u = clamp01(anchor.u);
  const v = clamp01(anchor.v);
  switch (anchor.grid) {
    case 'die':
      // Die bench: x across the die (≈ ±0.6 around the rail row center),
      // z along the bench row the oracle bay already smokes (z ≈ −1.15).
      return { x: 0.6 + (u - 0.5) * 1.2, y: 1.05, z: -1.15 + (v - 0.5) * 0.8 };
    case 'pcb':
      // PCB bench plane (oracle position x ≈ 1.2, z ≈ 1.4).
      return { x: 1.2 + (u - 0.5) * 1.6, y: 0.85, z: 1.4 + (v - 0.5) * 1.0 };
    case 'cryo':
      return { x: 0, y: 1.0, z: 0 };
    default:
      throw new Error(`forensicEvents: unknown anchor grid "${anchor.grid}"`);
  }
}

/**
 * Normalize a tripped threshold event (+ its autopsy report + fault-fx
 * payload) into the anchored visual event the VFX layer consumes.
 * FAIL-CLOSED: refuses to fabricate an event from anything but a real
 * `invention-lab/forensic-autopsy/1` report.
 *
 * @param {object} report autopsy report (worker `failure` message)
 * @param {{ kind?: string, node?: string, value?: number, anchor?: object }} [fx]
 * @returns {object} normalized forensic event with anchor + bench position
 */
export function normalizeForensicEvent(report, fx) {
  if (!report || report.format !== AUTOPSY_FORMAT) {
    throw new Error(`forensicEvents: refusal — no ${AUTOPSY_FORMAT} report (decorative VFX are not permitted without a real threshold event)`);
  }
  const f = report.failure;
  if (!f || typeof f.type !== 'string' || typeof f.value !== 'number') {
    throw new Error('forensicEvents: autopsy report missing the failure block');
  }
  // Anchor priority: worker-reported (real failing cell) → kernel table by
  // kind/node. Both are kernel coordinates; nothing is invented here.
  const anchor = (fx && fx.anchor) || report.meta?.failingAnchor || anchorForFailure(f.type, f.node);
  const bench = benchFromAnchor(anchor);
  return {
    format: AUTOPSY_FORMAT,
    kind: f.type,
    severity: f.severity,
    value: f.value,
    threshold: f.threshold,
    node: f.node,
    governingEquation: f.governingEquation,
    note: f.note,
    anchor,
    bench,
    meta: report.meta ?? {},
    fxKind: fx?.kind ?? null,
  };
}

/**
 * Verified provenance badges for the autopsy + fix (Law 5: every surface
 * carries its provenance).
 * @param {object} report autopsy report
 * @param {{ source?: string, title?: string } | null} [fix]
 * @returns {Array<{ label: string, why: string }>}
 */
export function provenanceBadges(report, fix) {
  if (!report || report.format !== AUTOPSY_FORMAT) {
    throw new Error('forensicEvents: badges require an autopsy report');
  }
  const badges = [
    { label: 'SIMULATED_PHYSICS_MODEL', why: 'thresholds + peaks computed by the physics engine (MNA + implicit heat + cryo ODE), no physical silicon validation' },
    { label: AUTOPSY_FORMAT, why: 'structured forensic contract (WP-2.3 ep-thermal mirror)' },
  ];
  const dataset = report.meta?.datasetSha256;
  if (dataset) {
    badges.push({ label: `thresholds: ${dataset}`, why: 'failure thresholds from the SHA-256-sealed 06_failure_physics_thresholds.json' });
  }
  if (fix && fix.source) {
    badges.push({ label: `fix: ${fix.source}`, why: 'physics-valid mitigation anchored to a verified reference value' });
  }
  return badges;
}

/**
 * Slow-motion replay state machine — replays the recorded 100 ms ring at the
 * slow cadence, emitting schema-honest `live: false` frame envelopes
 * (solver-frame.schema.json: "false while replaying the forensic ring
 * buffer"). Pure: the caller supplies the clock.
 */
export class SlowMoController {
  constructor() {
    this.playing = false;
    this.frames = [];
    this.index = 0;
    this.nextDueAt = 0;
  }

  /**
   * Start playback over the recorded window.
   * @param {Array<object>} frames recorded ring frames (kernel samples)
   * @param {number} nowMs clock now (ms)
   * @returns {object | null} the first frame envelope, or null when there is nothing to replay
   */
  start(frames, nowMs) {
    if (!Array.isArray(frames) || frames.length === 0) return null;
    this.playing = true;
    this.frames = frames;
    this.index = 0;
    // The first frame is delivered BY start(); subsequent frames fall due at
    // the slow cadence.
    const env = this.envelope();
    this.index = Math.min(1, this.frames.length - 1);
    this.nextDueAt = nowMs + SLOW_MO_CADENCE_MS;
    return env;
  }

  /**
   * Advance the clock; returns all frame envelopes due by `nowMs`
   * (0..n per call — the cadence is SLOW_MO_CADENCE_MS per frame).
   * @param {number} nowMs
   * @returns {Array<object>}
   */
  tick(nowMs) {
    const due = [];
    if (!this.playing) return due;
    while (this.nextDueAt <= nowMs && this.playing) {
      due.push(this.envelope());
      this.index += 1;
      this.nextDueAt += SLOW_MO_CADENCE_MS;
      if (this.index >= this.frames.length) {
        // Hold on the last frame (the failure instant) — playback complete.
        this.index = this.frames.length - 1;
        this.playing = false;
      }
    }
    return due;
  }

  /** Jump to a frame (scrubber). @param {number} index */
  scrub(index) {
    const i = Math.min(Math.max(0, index), this.frames.length - 1);
    this.index = i;
    this.playing = false;
    return this.envelope();
  }

  /** Stop playback (keeps the scrub position). */
  stop() {
    this.playing = false;
  }

  /** `true` while playing. */
  isPlaying() {
    return this.playing;
  }

  /** Current frame index. */
  currentIndex() {
    return this.index;
  }

  /** Schema-honest frame envelope for the current index. */
  envelope() {
    const snapshot = this.frames[this.index];
    if (!snapshot) return null;
    return {
      type: 'replayFrame',
      snapshot,
      live: false,
      replayIndex: this.index,
      replayTotal: this.frames.length,
      cadenceMs: SLOW_MO_CADENCE_MS,
    };
  }
}

/**
 * Human-readable failing-coordinate readout for the UI.
 * @param {{ anchor: { grid: string, u: number, v: number, label: string } }} event normalized forensic event
 * @returns {string}
 */
export function describeAnchor(event) {
  if (!event || !event.anchor) return '';
  const a = event.anchor;
  return `${a.grid} (${a.u.toFixed(2)}, ${a.v.toFixed(2)}) — ${a.label}`;
}
