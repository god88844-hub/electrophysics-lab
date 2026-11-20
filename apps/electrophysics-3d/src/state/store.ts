// Minimal dependency-free external store (used with React useSyncExternalStore).
export type BayId = 0 | 1 | 2 | 3 | 4 | 5;
export type Bay1Mode = 'fridge' | 'mzi' | 'tweezer';

export interface PhysicsHud {
  vdd: number;
  voutQ4: number;
  voutBin: number;
  iRail: number;
  traceC: number;
  pcbC: number;
  junctionC: number;
  cryoK: number;
  driveW: number;
  melted: boolean;
  shorted: boolean;
  paused: boolean;
}

export interface ForensicState {
  report: Record<string, unknown> & {
    failure: { type: string; severity: string; value: number; threshold: number; node: string | null; governingEquation: string; note: string };
    peaks: Record<string, number | null>;
    oscilloscope: Array<Record<string, number | undefined>>;
    meta: Record<string, unknown>;
  };
  replay: Array<{ t: number; vdd: number; vgsMax: number; iMax: number; tempMaxC: number; nodes: Record<string, number>; temps: Record<string, number> }>;
  fix: { title: string; description: string; patch: Record<string, number | null>; source: string } | null;
}

export interface QuantumHud {
  bloch: Array<{ x: number; y: number; z: number; purity: number }>;
  gateFidelity: number | null;
}

export interface QuantumExperiment {
  running: boolean;
  k: number;
  total: number;
  history: Array<{ k: number; error: number }>;
  bundle: Record<string, unknown> | null;
  finalError: number | null;
}

export interface SandboxComponent {
  id: string;
  kind: string;
  params?: Record<string, unknown>;
  nodes: string[];
  position: [number, number];
  label?: string;
}

export interface LabState {
  sandboxOpen: boolean;
  sandboxComponents: SandboxComponent[];
  sandboxLoaded: boolean;
  activeBay: BayId;
  inspectorOpen: boolean;
  bay1Mode: Bay1Mode;
  peelMode: 'assembled' | 'exploded';
  peelDepth: number; // 0 = Metal 3 (top) … 11 = substrate
  npuAttached: boolean;
  libraryOpen: boolean;
  integrity: { verified: number; total: number; allVerified: boolean; done: boolean };
  fps: number;
  thermalView: boolean;
  replayOpen: boolean;
  toast: string | null;
  physics: PhysicsHud | null;
  forensic: ForensicState | null;
  autopsyOpen: boolean;
  replayIndex: number | null; // null = live, else scrub position in forensic.replay
  vddSlider: number;
  drivePowerMW: number;
  quantum: QuantumHud | null;
  quantumExp: QuantumExperiment;
  qecCurve: Array<{ p: number; logical: number; bitflip: number }> | null;
  pulseParams: { amplitude: number; sigmaNs: number; beta: number };
}

const initial: LabState = {
  activeBay: 0,
  inspectorOpen: false, // Inspector Drawer starts CLOSED (zero-clutter HUD)
  bay1Mode: 'fridge',
  peelMode: 'assembled',
  peelDepth: 0,
  npuAttached: false,
  libraryOpen: false,
  integrity: { verified: 0, total: 6, allVerified: false, done: false },
  fps: 60,
  thermalView: false,
  replayOpen: false,
  toast: null,
  physics: null,
  forensic: null,
  autopsyOpen: false,
  replayIndex: null,
  vddSlider: 1.8,
  drivePowerMW: 5,
  quantum: null,
  quantumExp: { running: false, k: 0, total: 110, history: [], bundle: null, finalError: null },
  qecCurve: null,
  pulseParams: { amplitude: 25, sigmaNs: 7.5, beta: 0 },
};

type Listener = () => void;

class Store {
  private state: LabState = initial;
  private listeners = new Set<Listener>();

  get(): LabState {
    return this.state;
  }

  set(patch: Partial<LabState>): void {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const store = new Store();

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function flashToast(msg: string): void {
  store.set({ toast: msg });
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => store.set({ toast: null }), 2600);
}
