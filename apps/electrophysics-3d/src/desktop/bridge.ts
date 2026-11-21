/**
 * WP-1.1 — typed desktop bridge for the Tauri v2 shell IPC surface.
 *
 * - Desktop mode (Tauri runtime detected): invokes the typed Rust commands
 *   `ping` / `version` / `admission_status` / `kernel_solve` /
 *   `native_file_dialog` via the injected global Tauri API.
 * - Browser mode (`npm run dev`, `vite preview`, Playwright web CI): every
 *   call degrades cleanly — typed, honest, non-throwing responses that state
 *   the native surface is unavailable. The web physics path (Web Worker
 *   engines) is untouched.
 *
 * Runtime detection: Tauri v2 injects `window.__TAURI_INTERNALS__` (always)
 * and, with `app.withGlobalTauri`, `window.__TAURI__.core.invoke`. Neither
 * exists in a plain browser. A scope is injectable for deterministic tests.
 */

import type {
  AdmissionStatus,
  DesktopRuntime,
  FileDialogOptions,
  FileDialogResult,
  PingResponse,
  SolveOutcome,
  SolveRequest,
  SolveWorkload,
  VersionInfo,
} from './contracts.js';

export * from './contracts.js';

/** Minimal structural view of the injected Tauri v2 global API. */
interface TauriGlobalApi {
  core?: { invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown> };
}

interface ScopeWithTauri {
  __TAURI_INTERNALS__?: { invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown> };
  __TAURI__?: TauriGlobalApi;
}

function invokeFn(scope: unknown): ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null {
  if (!scope || typeof scope !== 'object') return null;
  const s = scope as ScopeWithTauri;
  if (s.__TAURI_INTERNALS__ && typeof s.__TAURI_INTERNALS__.invoke === 'function') {
    return (cmd, args) => s.__TAURI_INTERNALS__!.invoke!(cmd, args);
  }
  if (s.__TAURI__?.core && typeof s.__TAURI__!.core!.invoke === 'function') {
    return (cmd, args) => s.__TAURI__!.core!.invoke!(cmd, args);
  }
  return null;
}

export interface DesktopBridge {
  /** `'tauri-desktop'` when the native shell is detected, else `'browser'`. */
  readonly mode: DesktopRuntime;
  /** Convenience for `mode === 'tauri-desktop'`. */
  isDesktop(): boolean;
  /** Shell liveness round-trip. Browser mode: honest `{ pong: false }`. */
  ping(echo?: string): Promise<PingResponse>;
  /** Shell + runtime identity. Browser mode: typed degradation payload. */
  version(): Promise<VersionInfo>;
  /** Admission surface state + documented budgets. Browser mode: unavailable. */
  admissionStatus(): Promise<AdmissionStatus>;
  /**
   * Solve-channel contract probe. Browser mode: refused with a pointer to the
   * Web Worker engines (`physicsClient`) — the kernel channel is desktop-only.
   */
  solve(request: SolveRequest): Promise<SolveOutcome>;
  /** Native file dialog hook. Browser mode: unavailable. */
  openNativeFileDialog(options?: FileDialogOptions): Promise<FileDialogResult>;
}

const BROWSER_DEGRADATION_REASON =
  'browser mode: native desktop shell not detected — IPC surface unavailable (web path uses the Web Worker engines unchanged)';

/** Factory so tests can inject a deterministic scope. */
export function createDesktopBridge(scope: unknown = globalThis): DesktopBridge {
  const invoke = invokeFn(scope);
  const mode: DesktopRuntime = invoke ? 'tauri-desktop' : 'browser';

  const call = <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => {
    if (!invoke) return Promise.reject(new Error(BROWSER_DEGRADATION_REASON));
    return invoke(cmd, args) as Promise<T>;
  };

  return {
    mode,
    isDesktop: () => mode === 'tauri-desktop',

    async ping(echo?: string): Promise<PingResponse> {
      if (!invoke) {
        return { pong: false, echo: echo ?? null, tsUnixMs: Date.now(), runtime: 'browser' };
      }
      try {
        const res = await call<PingResponse>('ping', { echo: echo ?? null });
        return { ...res, runtime: 'tauri-desktop' };
      } catch (err) {
        return {
          pong: false,
          echo: echo ?? null,
          tsUnixMs: Date.now(),
          runtime: 'tauri-desktop',
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },

    async version(): Promise<VersionInfo> {
      if (!invoke) {
        return {
          appName: null,
          appVersion: null,
          tauriVersion: null,
          os: null,
          arch: null,
          family: null,
          webviewRuntime: null,
          kernelAttached: false,
          mode: 'browser',
        };
      }
      const res = await call<Omit<VersionInfo, 'mode'>>('version');
      return { ...res, mode: 'tauri-desktop' };
    },

    async admissionStatus(): Promise<AdmissionStatus> {
      if (!invoke) {
        return {
          admitted: false,
          mode: 'browser',
          reason: BROWSER_DEGRADATION_REASON,
          budgets: null,
          budgetSource: null,
          available: false,
        };
      }
      const res = await call<Omit<AdmissionStatus, 'available'>>('admission_status');
      return { ...res, available: true };
    },

    async solve(request: SolveRequest): Promise<SolveOutcome> {
      if (!invoke) {
        return {
          admitted: false,
          reason:
            'browser mode: kernel IPC unavailable — use the Web Worker engines (physicsClient); the kernel solve channel exists only in the desktop shell',
          frame: null,
        };
      }
      return call<SolveOutcome>('kernel_solve', { request });
    },

    async openNativeFileDialog(options?: FileDialogOptions): Promise<FileDialogResult> {
      if (!invoke) {
        return {
          available: false,
          accepted: false,
          path: null,
          cancelled: true,
          reason: BROWSER_DEGRADATION_REASON,
        };
      }
      const res = await call<Omit<FileDialogResult, 'available'>>('native_file_dialog', {
        options: options ?? {},
      });
      return { ...res, available: true };
    },
  };
}

/** Singleton bridge used by the app; safe to import in any runtime. */
export const desktopBridge: DesktopBridge = createDesktopBridge();
