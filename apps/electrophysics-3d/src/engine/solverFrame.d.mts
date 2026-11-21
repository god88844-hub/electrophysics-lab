/**
 * Type declarations for solverFrame.mjs (WP-1.5).
 * The implementation is plain JS so the Node 20/22/24 unit tests can import it
 * directly; these declarations give the TypeScript builders full types.
 */

export const SOLVER_FRAME_FORMAT: 'invention-lab/solver-frame/1';
export const PROVENANCE_BADGES: readonly string[];
export const FRAME_CAPACITY: Readonly<{
  circuits: number;
  nodesPerCircuit: number;
  currentsPerCircuit: number;
  tiles: number;
  blochQubits: number;
  tileActivity: number;
  busLevels: number;
}>;
export const FRAME_TILE_IDS: readonly string[];

export interface SolverFrameCircuit {
  id: string;
  nodeVoltages: Float64Array;
  nodeCount: number;
  currents: Float64Array;
  currentCount: number;
  vgsMax: number;
  vgsMaxNode: string | null;
}

/** Raw frame envelope shape (no bound methods — see SolverFrameStore). */
export interface SolverFrameState {
  format: typeof SOLVER_FRAME_FORMAT;
  frameId: number;
  tSimS: number;
  live: boolean;
  circuits: SolverFrameCircuit[];
  circuitCount: number;
  nodeKeys: string[];
  nodeKeyIndex: Map<string, number>;
  currentKeys: string[];
  currentKeyIndex: Map<string, number>;
  vdd: number;
  thermal: {
    gridMaxC: number;
    traceC: number;
    junctionC: number;
    pcbC: number;
    cryoK: number;
    tiles: Float64Array;
    tileCount: number;
  };
  quantum: { bloch: Float64Array; blochCount: number; gateFidelity: number | null };
  soc: { tileActivity: Float64Array; busLevels: Float64Array };
  provenance: { badge: string; solver: string };
  view: { q: Float64Array; azimuth: number; elevation: number; radius: number; ortho: boolean; frameStamp: number };
  quality: { level: 'high' | 'medium' | 'low'; pixelRatio: number; changes: number };
  stats: { ingested: number; quantumIngests: number; lastIngestMs: number };
}

export interface FrameViewOpts {
  azimuth?: number;
  elevation?: number;
  radius?: number;
  ortho?: boolean;
}

export interface FrameValidation {
  ok: boolean;
  errors: string[];
  checked: number;
}

/** The app-wide singleton: envelope shape + bound zero-alloc helpers. */
export interface SolverFrameStore extends SolverFrameState {
  ingestSnapshot(snapshot: SolverFrameSnapshot, opts?: { live?: boolean }): SolverFrameState;
  ingestQuantum(bloch: Array<{ x: number; y: number; z: number; purity: number }>, gateFidelity: number | null): SolverFrameState;
  setView(quat: { x: number; y: number; z: number; w: number }, view?: FrameViewOpts): SolverFrameState;
  setQuality(level: 'high' | 'medium' | 'low', pixelRatio: number): SolverFrameState;
  resetTopology(): SolverFrameState;
  readNode(key: string): number;
  readCurrent(key: string): number;
  readTileC(id: string): number | null;
  tileIdAt(i: number): string | null;
  toJSON(opts?: { trim?: boolean }): Record<string, unknown>;
  validate(): FrameValidation;
}

export interface SolverFrameSnapshot {
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

export function createSolverFrameState(): SolverFrameState;
export function ingestSnapshot(state: SolverFrameState, snapshot: SolverFrameSnapshot, opts?: { live?: boolean }): SolverFrameState;
export function ingestQuantum(state: SolverFrameState, bloch: Array<{ x: number; y: number; z: number; purity: number }>, gateFidelity: number | null): SolverFrameState;
export function setView(state: SolverFrameState, quat: { x: number; y: number; z: number; w: number }, view?: FrameViewOpts): SolverFrameState;
export function setQuality(state: SolverFrameState, level: 'high' | 'medium' | 'low', pixelRatio: number): SolverFrameState;
export function resetTopology(state: SolverFrameState): SolverFrameState;
export function readNode(state: SolverFrameState, key: string): number;
export function readCurrent(state: SolverFrameState, key: string): number;
export function readTileC(state: SolverFrameState, id: string): number | null;
export function tileIdAt(state: SolverFrameState, i: number): string | null;
export function solverFrameToJSON(state: SolverFrameState, opts?: { trim?: boolean }): Record<string, unknown>;
export function validateSolverFrame(frame: unknown): FrameValidation;
export declare const frameStore: SolverFrameStore;
