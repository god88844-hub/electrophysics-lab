// Main-thread client for the quantum worker.

export interface BlochState {
  x: number;
  y: number;
  z: number;
  purity: number;
}

export interface BreakthroughBundle {
  format: string;
  kind: string;
  badge: string;
  seed: number;
  initialFidelity: number;
  optimizedFidelity: number;
  optimizedParams: Record<string, number>;
  iterations: number;
  noise: Record<string, number>;
  citation: string;
  generatedAt: string;
}

type StateFn = (s: { bloch: BlochState[]; gateFidelity: number | null }) => void;
type ProgressFn = (k: number, total: number, error: number) => void;
type DoneFn = (bundle: BreakthroughBundle) => void;
type QecFn = (curve: Array<{ p: number; logical: number }>, bitflip: Array<{ p: number; logical: number }>) => void;

class QuantumClient {
  private worker: Worker | null = null;
  private stateFns = new Set<StateFn>();
  private progressFns = new Set<ProgressFn>();
  private doneFns = new Set<DoneFn>();
  private qecFns = new Set<QecFn>();

  ensure(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/quantum.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === 'state') {
          for (const fn of this.stateFns) fn({ bloch: msg.bloch, gateFidelity: msg.gateFidelity });
        } else if (msg.type === 'experimentProgress') {
          for (const fn of this.progressFns) fn(msg.k, msg.total, msg.error);
        } else if (msg.type === 'experimentDone') {
          for (const fn of this.doneFns) fn(msg.bundle);
        } else if (msg.type === 'qecResult') {
          for (const fn of this.qecFns) fn(msg.curve, msg.bitflip);
        }
      };
    }
    return this.worker;
  }

  onState(fn: StateFn): () => void {
    this.stateFns.add(fn);
    return () => this.stateFns.delete(fn);
  }

  onProgress(fn: ProgressFn): () => void {
    this.progressFns.add(fn);
    return () => this.progressFns.delete(fn);
  }

  onDone(fn: DoneFn): () => void {
    this.doneFns.add(fn);
    return () => this.doneFns.delete(fn);
  }

  onQec(fn: QecFn): () => void {
    this.qecFns.add(fn);
    return () => this.qecFns.delete(fn);
  }

  setParams(patch: Record<string, unknown>): void {
    this.ensure().postMessage({ type: 'params', patch });
  }

  applyPulse(): void {
    this.ensure().postMessage({ type: 'applyPulse' });
  }

  reset(): void {
    this.ensure().postMessage({ type: 'reset' });
  }

  runExperiment(): void {
    this.ensure().postMessage({ type: 'experiment' });
  }

  runQecSweep(): void {
    this.ensure().postMessage({ type: 'qecSweep' });
  }

  runPhotonicCheck(): void {
    this.ensure().postMessage({ type: 'photonicCheck' });
  }
}

export const quantumClient = new QuantumClient();
