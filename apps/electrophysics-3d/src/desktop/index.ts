/**
 * WP-1.1 desktop shell bridge — public surface.
 *
 * Usage:
 *   import { desktopBridge } from './desktop/index.js';
 *   if (desktopBridge.isDesktop()) { ... } // native shell only
 *
 * Every method degrades cleanly (typed, honest, non-throwing) when the app
 * runs in a plain browser (`npm run dev`, `vite preview`, Playwright web CI).
 */
export { createDesktopBridge, desktopBridge, type DesktopBridge } from './bridge.js';
export type {
  AdmissionBudgets,
  AdmissionStatus,
  DesktopRuntime,
  FileDialogOptions,
  FileDialogResult,
  PingResponse,
  SolveOutcome,
  SolveRequest,
  SolverFrame,
  SolverFrameCircuit,
  SolveWorkload,
  VersionInfo,
} from './contracts.js';
