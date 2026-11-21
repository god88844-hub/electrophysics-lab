import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDesktopBridge, desktopBridge, type SolverFrame } from '../src/desktop/bridge';

/**
 * WP-1.1 — Tauri v2 desktop shell + typed IPC skeleton.
 *
 * Web CI guard: the web flow (`npm run dev` / vite preview / Playwright) is
 * byte-identical to main — the desktop bridge is not imported by the app and
 * degrades cleanly wherever it IS used (browser mode = typed, honest,
 * non-throwing). The real shell boot + live-IPC smoke is
 * `npm run desktop:smoke` (runs the built .exe, see scripts/wp11-desktop-smoke.mjs).
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '..', '..');

// SwiftShader args are required for headless WebGL2 on GPU-less runners (the
// spec-level equivalent of the browser smoke flags; config stays untouched).
test.use({
  launchOptions: { args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] },
});

const IDLE_FRAME_REQUIRED = ['format', 'frameId', 'tSimS', 'circuits', 'thermal', 'provenance'] as const;

function expectSchemaValidIdleFrame(frame: SolverFrame): void {
  for (const key of IDLE_FRAME_REQUIRED) expect(frame).toHaveProperty(key);
  expect(frame.format).toBe('invention-lab/solver-frame/1');
  expect(frame.thermal).toHaveProperty('gridMaxC');
  expect(frame.provenance).toHaveProperty('badge');
  expect(frame.provenance.badge).toBe('SIMULATED_ARCHITECTURAL_MODEL');
  expect(Array.isArray(frame.circuits)).toBe(true);
  expect(frame.circuits).toHaveLength(0);
  expect(frame.note).toContain('no kernel attached');
}

// ---------------------------------------------------------------------------
// 1. Web CI stays 100% intact
// ---------------------------------------------------------------------------

test.describe('WP-1.1 web path untouched', () => {
  // Boot marker: the ViewCube canvas (stable, independent of the pre-existing
  // `SHA-256 6/8` banner regression that pristine main already fails — the v4
  // lock added reference-library 07/08 while src/data/reference.ts still
  // verifies 6; that frontend fix is outside WP-1.1's file isolation).
  test('app boots with zero console errors and no Tauri globals in a plain browser', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.goto('/');
    await expect(page.locator('div[title*="ViewCube"] canvas')).toBeVisible({ timeout: 60_000 });
    const globals = await page.evaluate(() => ({
      internals: typeof (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__,
      globalApi: typeof (window as unknown as Record<string, unknown>).__TAURI__,
    }));
    expect(globals.internals).toBe('undefined');
    expect(globals.globalApi).toBe('undefined');
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Browser-mode degradation (typed, honest, non-throwing)
// ---------------------------------------------------------------------------

test.describe('WP-1.1 browser-mode degradation', () => {
  test('every bridge call degrades cleanly without Tauri globals', async () => {
    const bridge = createDesktopBridge({}); // scope without Tauri globals
    expect(bridge.mode).toBe('browser');
    expect(bridge.isDesktop()).toBe(false);

    const ping = await bridge.ping('ci');
    expect(ping.pong).toBe(false);
    expect(ping.runtime).toBe('browser');
    expect(ping.echo).toBe('ci');

    const version = await bridge.version();
    expect(version.mode).toBe('browser');
    expect(version.appVersion).toBeNull();
    expect(version.kernelAttached).toBe(false);

    const adm = await bridge.admissionStatus();
    expect(adm.available).toBe(false);
    expect(adm.admitted).toBe(false);
    expect(adm.budgets).toBeNull();
    expect(adm.reason).toContain('browser mode');

    const outcome = await bridge.solve({ workload: { type: 'idle' } });
    expect(outcome.admitted).toBe(false);
    expect(outcome.frame).toBeNull();
    expect(outcome.reason).toContain('browser mode');

    const dialog = await bridge.openNativeFileDialog({ title: 'Open .eplab' });
    expect(dialog.available).toBe(false);
    expect(dialog.accepted).toBe(false);
    expect(dialog.cancelled).toBe(true);
    expect(dialog.reason).toContain('browser mode');
  });

  test('the singleton bridge detects plain Node/browser as non-desktop', () => {
    expect(desktopBridge.mode).toBe('browser');
  });
});

// ---------------------------------------------------------------------------
// 3. Typed Tauri invocation path (mocked __TAURI_INTERNALS__, wire-shape exact)
// ---------------------------------------------------------------------------

type MockHandler = (args?: Record<string, unknown>) => unknown;

function mockTauriScope(handlers: Record<string, MockHandler>) {
  const calls: Array<{ cmd: string; args?: Record<string, unknown> }> = [];
  const scope = {
    __TAURI_INTERNALS__: {
      invoke: (cmd: string, args?: Record<string, unknown>) => {
        calls.push({ cmd, args });
        const handler = handlers[cmd];
        if (!handler) throw new Error(`unhandled mock command: ${cmd}`);
        return Promise.resolve(handler(args));
      },
    },
  };
  return { scope, calls };
}

// Wire shapes below mirror src-tauri/src/ipc.rs serde output exactly (camelCase).
const MOCK_ADMISSION = {
  admitted: true,
  mode: 'tauri-shell-skeleton/1',
  reason: null,
  budgets: {
    quantumMaxQubits: 6,
    mnaMaxNodes: 64,
    mnaMaxVoltageSources: 32,
    thermalMaxCols: 128,
    thermalMaxRows: 128,
    arenaMaxBytes: 536870912,
  },
  budgetSource: 'docs/master-plan/02_SYSTEM_ARCHITECTURE.md §2.3 (interactive budgets)',
};

const MOCK_IDLE_FRAME = {
  format: 'invention-lab/solver-frame/1',
  frameId: 0,
  tSimS: 0,
  live: false,
  circuits: [],
  thermal: { gridMaxC: 0 },
  provenance: { badge: 'SIMULATED_ARCHITECTURAL_MODEL', solver: 'tauri-shell-skeleton/1 (idle)' },
  note: 'WP-1.1 shell skeleton idle frame — no kernel attached yet (ep-kernel lands in WP-1.2); circuits are empty and numeric fields carry no measured or derived physical value',
};

test.describe('WP-1.1 typed IPC invocation (desktop mode)', () => {
  test('ping/version/admission_status round-trip with typed payloads', async () => {
    const { scope, calls } = mockTauriScope({
      ping: (args) => ({ pong: true, echo: args?.echo ?? null, tsUnixMs: 1_700_000_000_000, runtime: 'tauri-desktop' }),
      version: () => ({
        appName: 'electrophysics-lab',
        appVersion: '3.0.0',
        tauriVersion: '2.9.6',
        os: 'windows',
        arch: 'x86_64',
        family: 'windows',
        webviewRuntime: 'WebView2 (Evergreen, Edge Chromium)',
        kernelAttached: false,
      }),
      admission_status: () => MOCK_ADMISSION,
    });
    const bridge = createDesktopBridge(scope);
    expect(bridge.mode).toBe('tauri-desktop');
    expect(bridge.isDesktop()).toBe(true);

    const ping = await bridge.ping('wp11');
    expect(ping).toEqual({ pong: true, echo: 'wp11', tsUnixMs: 1_700_000_000_000, runtime: 'tauri-desktop' });
    expect(calls[0]).toEqual({ cmd: 'ping', args: { echo: 'wp11' } });

    const version = await bridge.version();
    expect(version.mode).toBe('tauri-desktop');
    expect(version.appVersion).toBe('3.0.0');
    expect(version.webviewRuntime).toContain('WebView2');
    expect(version.kernelAttached).toBe(false);

    const adm = await bridge.admissionStatus();
    expect(adm.available).toBe(true);
    expect(adm.admitted).toBe(true);
    expect(adm.budgets?.quantumMaxQubits).toBe(6);
    expect(adm.budgets?.arenaMaxBytes).toBe(536870912);
    expect(calls.map((c) => c.cmd)).toEqual(['ping', 'version', 'admission_status']);
  });

  test('kernel_solve: idle returns a schema-valid solver frame; refusals stay honest payloads', async () => {
    const { scope } = mockTauriScope({
      kernel_solve: (args) => {
        const workload = (args?.request as { workload: { type: string } }).workload;
        if (workload.type === 'idle') {
          return { admitted: true, reason: null, frame: { ...MOCK_IDLE_FRAME, frameId: 7 } };
        }
        if (workload.type === 'quantum' && (workload as { qubits: number }).qubits > 6) {
          return {
            admitted: false,
            reason: 'admission refused: quantum workload requests 8 qubits, interactive budget is ≤ 6 (density matrix d ≤ 64)',
            frame: null,
          };
        }
        return { admitted: false, reason: 'admission deferred: no solver attached in WP-1.1', frame: null };
      },
    });
    const bridge = createDesktopBridge(scope);

    const idle = await bridge.solve({ workload: { type: 'idle' } });
    expect(idle.admitted).toBe(true);
    expect(idle.frame?.frameId).toBe(7);
    expectSchemaValidIdleFrame(idle.frame as SolverFrame);

    const overBudget = await bridge.solve({ workload: { type: 'quantum', qubits: 8 } });
    expect(overBudget.admitted).toBe(false);
    expect(overBudget.frame).toBeNull();
    expect(overBudget.reason).toContain('budget is ≤ 6');

    const deferred = await bridge.solve({ workload: { type: 'quantum', qubits: 2 } });
    expect(deferred.admitted).toBe(false);
    expect(deferred.reason).toContain('no solver attached');
  });

  test('native_file_dialog maps accepted/cancelled; IPC failures surface as typed ping errors', async () => {
    const { scope } = mockTauriScope({
      native_file_dialog: (args) =>
        args?.options && (args.options as { kind?: string }).kind === 'save-file'
          ? { accepted: true, path: 'C:\\tmp\\out.eplab', cancelled: false, reason: null }
          : { accepted: false, path: null, cancelled: true, reason: null },
      ping: () => Promise.reject(new Error('ipc closed')),
    });
    const bridge = createDesktopBridge(scope);

    const cancelled = await bridge.openNativeFileDialog();
    expect(cancelled).toEqual({ available: true, accepted: false, path: null, cancelled: true, reason: null });

    const saved = await bridge.openNativeFileDialog({ kind: 'save-file' });
    expect(saved.accepted).toBe(true);
    expect(saved.path).toBe('C:\\tmp\\out.eplab');

    const dead = await bridge.ping('x');
    expect(dead.pong).toBe(false);
    expect(dead.error).toContain('ipc closed');
  });
});

// ---------------------------------------------------------------------------
// 4. Shell configuration sanity (icons, gitignore, capabilities, commands)
// ---------------------------------------------------------------------------

test.describe('WP-1.1 shell configuration sanity', () => {
  test('tauri.conf.json: withGlobalTauri on, all declared icons exist on disk', () => {
    const conf = JSON.parse(readFileSync(path.join(appRoot, 'src-tauri', 'tauri.conf.json'), 'utf8'));
    expect(conf.build.frontendDist).toBe('../dist');
    expect(conf.build.beforeBuildCommand).toBe('npm run build');
    expect(conf.app.withGlobalTauri).toBe(true);
    for (const icon of conf.bundle.icon as string[]) {
      expect(existsSync(path.join(appRoot, 'src-tauri', icon))).toBe(true);
    }
  });

  test('capabilities grant core + dialog to the main window', () => {
    const caps = JSON.parse(readFileSync(path.join(appRoot, 'src-tauri', 'capabilities', 'default.json'), 'utf8'));
    expect(caps.windows).toContain('main');
    expect(caps.permissions).toContain('core:default');
    expect(caps.permissions).toContain('dialog:default');
  });

  test('root + app .gitignore never track src-tauri/target or dist (Builder Rule 3)', () => {
    const rootGit = readFileSync(path.join(repoRoot, '.gitignore'), 'utf8');
    expect(rootGit).toContain('apps/electrophysics-3d/src-tauri/target/');
    expect(rootGit).toContain('apps/electrophysics-3d/dist/');
    const appGit = readFileSync(path.join(appRoot, '.gitignore'), 'utf8');
    expect(appGit).toContain('src-tauri/target');
    expect(appGit).toContain('dist');
  });

  test('every command registered in main.rs is a #[tauri::command] in ipc.rs', () => {
    const main = readFileSync(path.join(appRoot, 'src-tauri', 'src', 'main.rs'), 'utf8');
    const ipc = readFileSync(path.join(appRoot, 'src-tauri', 'src', 'ipc.rs'), 'utf8');
    const handler = main.match(/generate_handler!\[([\s\S]*?)\]/)?.[1] ?? '';
    const commands = [...handler.matchAll(/ipc::(\w+)/g)].map((m) => m[1]);
    expect(commands).toEqual(
      expect.arrayContaining(['ping', 'version', 'admission_status', 'kernel_solve', 'native_file_dialog'])
    );
    const attributeCount = (ipc.match(/#\[tauri::command\]/g) ?? []).length;
    expect(attributeCount).toBeGreaterThanOrEqual(commands.length);
    for (const cmd of commands) {
      expect(ipc).toContain(`fn ${cmd}(`);
    }
  });
});
