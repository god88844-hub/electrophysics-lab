// Main-thread client for the physics worker.
//
// WP-2.6: the client is also the forensic-event adapter boundary — worker
// threshold events + `invention-lab/forensic-autopsy/1` reports are
// normalized through `forensicEvents.ts` (anchors, bench coordinates,
// provenance badges) and the 100 ms slow-motion replay emits schema-honest
// `live: false` solver frames through the same snapshot channel the world
// already consumes (solver-frame.schema.json: "false while replaying the
// forensic ring buffer").

import * as THREE from 'three';
import { store } from '../state/store.js';
import {
  normalizeForensicEvent,
  provenanceBadges,
  benchFromAnchor,
  describeAnchor,
} from './forensicEvents.js';
import { SmokeSystem } from './smoke.js';
import { createForensicOverlay, type ForensicOverlay } from './thermalVisuals.js';

export interface PhysicsSnapshot {
  t: number;
  vdd: number;
  vgsMax: number;
  vgsMaxNode: string | null;
  iMax: number;
  tempMaxC: number;
  nodes: Record<string, number>;
  currents: Record<string, number>;
  temps: Record<string, number>;
}

export interface ForensicReport {
  format: string;
  generatedAt: string;
  failure: { type: string; severity: string; value: number; threshold: number; node: string | null; governingEquation: string; note: string };
  peaks: Record<string, number | null>;
  oscilloscope: Array<Record<string, number | undefined>>;
  thresholdsUsed: Record<string, unknown>;
  meta: Record<string, unknown>;
}

export interface FailingAnchor {
  grid: string;
  u: number;
  v: number;
  label: string;
}

export interface FaultFx {
  kind: 'arc' | 'melt' | 'smoke' | 'quench';
  node: string;
  value: number;
  /** WP-2.6 — kernel-reported failing coordinates (heat-grid cell). */
  anchor?: FailingAnchor;
  /** The forensic contract the effect is bound to. */
  format?: string;
}

export interface ProposedFix {
  title: string;
  description: string;
  patch: Record<string, number | null>;
  source: string;
}

export interface ForensicEvent {
  format: string;
  kind: string;
  severity: string;
  value: number;
  threshold: number;
  node: string | null;
  governingEquation: string;
  note: string;
  anchor: FailingAnchor;
  bench: { x: number; y: number; z: number };
  meta: Record<string, unknown>;
  fxKind: string | null;
}

export interface ReplayFrame {
  type: 'replayFrame';
  snapshot: PhysicsSnapshot;
  live: false;
  replayIndex: number;
  replayTotal: number;
  cadenceMs: number;
}

export interface FixRetest {
  ok: boolean;
  ticks: number;
  trips: number;
  peaks: { vgsMax: number; iMax: number; tempMaxC: number };
}

type SnapshotFn = (s: PhysicsSnapshot) => void;
type FailureFn = (report: ForensicReport, replay: PhysicsSnapshot[], fix: ProposedFix | null) => void;
type FxFn = (fx: FaultFx) => void;
type ForensicEventFn = (event: ForensicEvent, badges: Array<{ label: string; why: string }>, replay: PhysicsSnapshot[], fix: ProposedFix | null) => void;
type ReplayFrameFn = (frame: ReplayFrame) => void;
type FixAppliedFn = (applied: Record<string, number | null>, retest: FixRetest | null) => void;
type NetlistFn = (r: { warnings: string[]; nodeNames: string[] }) => void;

class PhysicsClient {
  private worker: Worker | null = null;
  private netlistFns = new Set<NetlistFn>();
  private snapshotFns = new Set<SnapshotFn>();
  private failureFns = new Set<FailureFn>();
  private fxFns = new Set<FxFn>();
  private forensicEventFns = new Set<ForensicEventFn>();
  private replayFrameFns = new Set<ReplayFrameFn>();
  private fixAppliedFns = new Set<FixAppliedFn>();
  latest: PhysicsSnapshot | null = null;
  live = true;
  /** Last normalized forensic event (anchored) — the VFX + drawer source. */
  lastForensicEvent: ForensicEvent | null = null;
  /** Last raw fault fx (anchored). */
  lastFx: FaultFx | null = null;
  /** Post-fix re-test verification result. */
  lastFixRetest: FixRetest | null = null;
  /** WP-2.6 kernel-anchored VFX layer (arc flash / char decal / anchored smoke). */
  private forensicOverlay: ForensicOverlay | null = null;
  private overlaySmoke: SmokeSystem | null = null;

  ensure(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/physics.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === 'snapshot') {
          // Replay frames are schema-honest `live: false` deliveries — they
          // flow to the same snapshot consumers (world visuals scrub) but
          // never overwrite the live latest sample.
          const isReplay = msg.live === false;
          if (!isReplay) this.latest = msg.snapshot;
          this.live = msg.live;
          for (const fn of this.snapshotFns) fn(msg.snapshot);
          if (isReplay) {
            const frame: ReplayFrame = {
              type: 'replayFrame',
              snapshot: msg.snapshot,
              live: false,
              replayIndex: msg.replayIndex ?? 0,
              replayTotal: msg.replayTotal ?? 0,
              cadenceMs: 100,
            };
            for (const fn of this.replayFrameFns) fn(frame);
          }
        } else if (msg.type === 'failure') {
          this.replayWindow = msg.replay;
          // Normalize through the forensic adapter (fail-closed: decorative
          // effects without a real autopsy report are refused).
          try {
            const event = normalizeForensicEvent(msg.report, this.lastFx ?? undefined);
            this.lastForensicEvent = event;
            this.lastBadges = provenanceBadges(msg.report, msg.fix);
            for (const fn of this.forensicEventFns) fn(event, this.lastBadges, msg.replay, msg.fix);
          } catch {
            // No autopsy contract → no forensic surfaces (honest refusal).
          }
          for (const fn of this.failureFns) fn(msg.report, msg.replay, msg.fix);
        } else if (msg.type === 'faultFx') {
          this.lastFx = msg.fx;
          this.applyAnchoredVfx(msg.fx);
          for (const fn of this.fxFns) fn(msg.fx);
        } else if (msg.type === 'fixed-pending') {
          this.lastFixRetest = null;
        } else if (msg.type === 'fixed') {
          this.lastFixRetest = msg.retest ?? null;
          for (const fn of this.fixAppliedFns) fn(msg.applied ?? {}, this.lastFixRetest);
        } else if (msg.type === 'slowMoState') {
          store.set({ replayIndex: msg.index ?? (msg.playing ? 0 : null) });
        } else if (msg.type === 'netlistLoaded') {
          for (const fn of this.netlistFns) fn({ warnings: msg.warnings, nodeNames: msg.nodeNames });
        }
      };
    }
    return this.worker;
  }

  onSnapshot(fn: SnapshotFn): () => void {
    this.snapshotFns.add(fn);
    return () => this.snapshotFns.delete(fn);
  }

  onFailure(fn: FailureFn): () => void {
    this.failureFns.add(fn);
    return () => this.failureFns.delete(fn);
  }

  onFx(fn: FxFn): () => void {
    this.fxFns.add(fn);
    return () => this.fxFns.delete(fn);
  }

  /** Anchored forensic event (normalized from the autopsy contract). */
  onForensicEvent(fn: ForensicEventFn): () => void {
    this.forensicEventFns.add(fn);
    return () => this.forensicEventFns.delete(fn);
  }

  /** Schema-honest `live: false` replay frame channel. */
  onReplayFrame(fn: ReplayFrameFn): () => void {
    this.replayFrameFns.add(fn);
    return () => this.replayFrameFns.delete(fn);
  }

  /** Fix applied (+ post-fix re-test verification when the window completes). */
  onFixApplied(fn: FixAppliedFn): () => void {
    this.fixAppliedFns.add(fn);
    return () => this.fixAppliedFns.delete(fn);
  }

  onNetlist(fn: NetlistFn): () => void {
    this.netlistFns.add(fn);
    return () => this.netlistFns.delete(fn);
  }

  /**
   * WP-2.6 — anchored VFX: arc flash + char decal + smoke plume placed at
   * the KERNEL-REPORTED failing coordinates (bench mapping of the failing
   * heat-grid cell). Fail-closed: without an anchor nothing renders —
   * decorative, untriggered effects are structurally impossible.
   */
  private applyAnchoredVfx(fx: FaultFx): void {
    if (!fx.anchor) return;
    const scene = (globalThis as unknown as {
      __lab?: { worldRef?: { current?: { scene?: THREE.Scene } | null } | null };
    }).__lab?.worldRef?.current?.scene;
    if (!scene) return;
    if (!this.forensicOverlay || !this.overlaySmoke) {
      this.forensicOverlay = createForensicOverlay(scene);
      this.overlaySmoke = new SmokeSystem(scene, 120, 0x8a949f, 0.2);
    }
    const bench = benchFromAnchor(fx.anchor);
    if (fx.kind === 'arc') {
      this.forensicOverlay.arcFlash(bench);
      this.forensicOverlay.charDecal(bench);
    } else if (fx.kind === 'melt') {
      this.overlaySmoke.spawnAnchored(bench, 26, 0.25, 0.55);
    } else if (fx.kind === 'smoke') {
      this.overlaySmoke.spawnAnchored(bench, 30, 0.4, 0.7);
    } else if (fx.kind === 'quench') {
      this.overlaySmoke.spawnAnchored(bench, 40, 0.5, 0.9);
    }
  }

  /** Dispose the forensic VFX layer (forensic reset). */
  disposeForensicVfx(): void {
    this.forensicOverlay?.dispose();
    this.forensicOverlay = null;
    this.overlaySmoke?.dispose();
    this.overlaySmoke = null;
  }

  setNetlist(spec: Record<string, unknown>): void {
    this.ensure().postMessage({ type: 'setNetlist', spec });
  }

  clearNetlist(): void {
    this.ensure().postMessage({ type: 'clearNetlist' });
  }

  /** Live SoC power → thermal coupling (watts scale for the tile heat grid). */
  setTilePower(wattsPerTile: number): void {
    this.ensure().postMessage({ type: 'setTilePower', wattsPerTile });
  }

  setParams(patch: Record<string, unknown>): void {
    this.ensure().postMessage({ type: 'params', patch });
  }

  resume(): void {
    this.ensure().postMessage({ type: 'resume' });
  }

  pauseSimulation(): void {
    this.ensure().postMessage({ type: 'pause' });
  }

  stepOnce(): void {
    this.ensure().postMessage({ type: 'step' });
  }

  reset(): void {
    this.disposeForensicVfx();
    this.ensure().postMessage({ type: 'reset' });
  }

  applyFix(patch: Record<string, number | null>): void {
    this.ensure().postMessage({ type: 'applyFix', patch });
  }

  // ---- WP-2.6 slow-motion replay (100 ms cadence, worker-authoritative) ----

  /** Play the recorded 100 ms ring as schema-honest `live: false` frames. */
  startSlowMo(): void {
    this.ensure().postMessage({ type: 'startSlowMo' });
  }

  /** Scrub to a recorded frame (worker-authoritative `live: false` delivery). */
  scrubSlowMo(index: number): void {
    this.ensure().postMessage({ type: 'scrubSlowMo', index });
    store.set({ replayIndex: index });
  }

  /** Stop playback (frames hold on the failure instant). */
  stopSlowMo(): void {
    this.ensure().postMessage({ type: 'stopSlowMo' });
  }

  /** Recorded window (set on failure — the slow-motion replay source). */
  replayWindow: PhysicsSnapshot[] | null = null;

  /** Provenance badges of the last forensic event. */
  lastBadges: Array<{ label: string; why: string }> = [];

  /** Human-readable failing-coordinate readout of the last event. */
  lastAnchorDescription(): string {
    return this.lastForensicEvent ? describeAnchor(this.lastForensicEvent) : '';
  }

  /** Replay scrubbing: temporarily drive visuals from recorded samples. */
  replaySample: PhysicsSnapshot | null = null;
}

export const physicsClient = new PhysicsClient();
