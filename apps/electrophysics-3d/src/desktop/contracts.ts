/**
 * WP-1.1 — typed contracts for the desktop shell IPC surface.
 *
 * These types mirror `apps/electrophysics-3d/src-tauri/src/ipc.rs` (serde
 * camelCase on the wire) and the schemas in `docs/master-plan/`:
 *  - `solver-frame.schema.json`  → `SolverFrame`
 *  - `02_SYSTEM_ARCHITECTURE.md` §2.3 → budgets + refusal contract
 *
 * The shell's Rust commands: ping / version / admission_status / kernel_solve
 * / native_file_dialog. Keep both sides in sync when extending.
 */

export type DesktopRuntime = 'tauri-desktop' | 'browser';

/** Response of the `ping` IPC command (shell liveness round-trip). */
export interface PingResponse {
  /** `true` only when the native shell answered; `false` in browser mode. */
  pong: boolean;
  echo: string | null;
  tsUnixMs: number;
  runtime: DesktopRuntime;
  /** Present when the shell answered with an IPC-level failure. */
  error?: string;
}

/** Response of the `version` IPC command. */
export interface VersionInfo {
  appName: string | null;
  appVersion: string | null;
  tauriVersion: string | null;
  os: string | null;
  arch: string | null;
  family: string | null;
  webviewRuntime: string | null;
  /** `false` until `crates/ep-kernel` is linked into the shell (WP-1.2). */
  kernelAttached: boolean;
  mode: DesktopRuntime;
}

/** Documented interactive budgets (`02_SYSTEM_ARCHITECTURE.md` §2.3). */
export interface AdmissionBudgets {
  quantumMaxQubits: number;
  mnaMaxNodes: number;
  mnaMaxVoltageSources: number;
  thermalMaxCols: number;
  thermalMaxRows: number;
  arenaMaxBytes: number;
}

/** Response of the `admission_status` IPC command. */
export interface AdmissionStatus {
  admitted: boolean;
  mode: string | null;
  reason: string | null;
  budgets: AdmissionBudgets | null;
  budgetSource: string | null;
  /** `false` in browser mode (no native admission surface). */
  available: boolean;
}

/** Workload descriptor for `kernel_solve` (tagged by `type`). */
export type SolveWorkload =
  | { type: 'idle' }
  | { type: 'quantum'; qubits: number }
  | { type: 'mna'; nodes: number; voltageSources: number }
  | { type: 'thermal'; cols: number; rows: number };

export interface SolveRequest {
  workload: SolveWorkload;
}

/** Per-circuit telemetry arrays of a solver frame. */
export interface SolverFrameCircuit {
  id: string;
  nodeVoltages: number[];
  currents: number[];
}

/** Subset of `docs/master-plan/schemas/solver-frame.schema.json` on the wire. */
export interface SolverFrame {
  format: 'invention-lab/solver-frame/1';
  frameId: number;
  tSimS: number;
  live?: boolean;
  circuits: SolverFrameCircuit[];
  thermal: { gridMaxC: number };
  provenance: { badge: string; solver?: string };
  /** Schema-permitted honesty note (WP-1.1 idle frame). */
  note?: string;
}

/**
 * `kernel_solve` outcome — admission refusals are honest payloads
 * (`{ admitted: false, reason }`), never throws for budget/refusal cases.
 */
export interface SolveOutcome {
  admitted: boolean;
  reason: string | null;
  frame: SolverFrame | null;
}

/** Options for the native file dialog hook. */
export interface FileDialogOptions {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  /** Defaults to `open-file`; `save-file` opens a native save dialog. */
  kind?: 'open-file' | 'save-file';
}

/** Result of the native file dialog hook. */
export interface FileDialogResult {
  /** `false` in browser mode (no native dialog surface). */
  available: boolean;
  accepted: boolean;
  path: string | null;
  cancelled: boolean;
  reason: string | null;
}
