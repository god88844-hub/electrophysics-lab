// Main-thread client for the physics worker.

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

export interface FaultFx {
  kind: 'arc' | 'melt' | 'smoke' | 'quench';
  node: string;
  value: number;
}

export interface ProposedFix {
  title: string;
  description: string;
  patch: Record<string, number | null>;
  source: string;
}

type SnapshotFn = (s: PhysicsSnapshot) => void;
type FailureFn = (report: ForensicReport, replay: PhysicsSnapshot[], fix: ProposedFix | null) => void;
type FxFn = (fx: FaultFx) => void;

class PhysicsClient {
  private worker: Worker | null = null;
  private snapshotFns = new Set<SnapshotFn>();
  private failureFns = new Set<FailureFn>();
  private fxFns = new Set<FxFn>();
  latest: PhysicsSnapshot | null = null;
  live = true;

  ensure(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/physics.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === 'snapshot') {
          this.latest = msg.snapshot;
          this.live = msg.live;
          for (const fn of this.snapshotFns) fn(msg.snapshot);
        } else if (msg.type === 'failure') {
          for (const fn of this.failureFns) fn(msg.report, msg.replay, msg.fix);
        } else if (msg.type === 'faultFx') {
          for (const fn of this.fxFns) fn(msg.fx);
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

  setParams(patch: Record<string, unknown>): void {
    this.ensure().postMessage({ type: 'params', patch });
  }

  resume(): void {
    this.ensure().postMessage({ type: 'resume' });
  }

  reset(): void {
    this.ensure().postMessage({ type: 'reset' });
  }

  applyFix(patch: Record<string, number | null>): void {
    this.ensure().postMessage({ type: 'applyFix', patch });
  }

  /** Replay scrubbing: temporarily drive visuals from recorded samples. */
  replaySample: PhysicsSnapshot | null = null;
}

export const physicsClient = new PhysicsClient();
