// Minimal dependency-free external store (used with React useSyncExternalStore).
export type BayId = 0 | 1 | 2 | 3 | 4 | 5;
export type Bay1Mode = 'fridge' | 'mzi' | 'tweezer';

export interface LabState {
  activeBay: BayId;
  inspectorOpen: boolean;
  bay1Mode: Bay1Mode;
  peelMode: 'assembled' | 'exploded';
  peelDepth: number; // 0 = Metal 3 (top) … 10 = substrate
  npuAttached: boolean;
  libraryOpen: boolean;
  integrity: { verified: number; total: number; allVerified: boolean; done: boolean };
  fps: number;
  thermalView: boolean;
  replayOpen: boolean;
  toast: string | null;
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
