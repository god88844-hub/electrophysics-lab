import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import assert from 'node:assert/strict';

async function freePort() {
  const server = createServer();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((err) => err ? reject(err) : resolve(port));
    });
  });
}

async function smoke(app, exe) {
  assert.equal(process.platform, 'win32', 'WebView2 release smoke requires Windows');
  const require = createRequire(join(app, 'package.json'));
  const { chromium } = require('@playwright/test');
  const port = await freePort();
  const profile = mkdtempSync(join(tmpdir(), 'ep-release-webview2-'));
  const endpoint = 'http://127.0.0.1:' + port;
  let exited;
  const child = spawn(exe, [], {
    cwd: dirname(exe), windowsHide: true, stdio: 'ignore',
    env: {
      ...process.env,
      WEBVIEW2_USER_DATA_FOLDER: profile,
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-address=127.0.0.1 --remote-debugging-port=' + port,
    },
  });
  child.once('error', (error) => { exited = error.message; });
  child.once('exit', (code) => { exited = 'desktop process exited with ' + code; });
  let browser;
  try {
    const end = Date.now() + 60_000;
    while (!browser && Date.now() < end) {
      assert.ok(!exited, exited);
      try {
        const r = await fetch(endpoint + '/json/version', { signal: AbortSignal.timeout(1000) });
        if (r.ok) browser = await chromium.connectOverCDP(endpoint, { timeout: 5000 });
      } catch {
        await sleep(300);
      }
    }
    assert.ok(browser, 'Desktop WebView2 CDP endpoint timed out');
    let page;
    while (!page && Date.now() < end) {
      assert.ok(!exited, exited);
      page = browser.contexts().flatMap((c) => c.pages()).find((p) => new URL(p.url()).hostname === 'tauri.localhost');
      if (!page) await sleep(300);
    }
    assert.ok(page, 'Packaged workbench page did not load');
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    // Attach before a fresh document so boot-time errors are also observed.
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator('div[title*="ViewCube"] canvas').waitFor({ state: 'visible', timeout: 60_000 });
    const integrity = page.getByText('SHA-256 8/8 ✓', { exact: true });
    await integrity.waitFor({ state: 'visible', timeout: 60_000 });
    await page.getByRole('button', { name: 'Academy', exact: true }).click({ timeout: 30_000 });
    const academy = page.getByRole('region', { name: 'Guided Academy' });
    await academy.getByTestId('academy-mission-M11-SURFACE-CODE').waitFor({ state: 'visible', timeout: 30_000 });
    assert.equal(await academy.getByTestId(/^academy-mission-/).count(), 11);
    const invoke = (command, args) => page.evaluate(
      ([cmd, payload]) => window.__TAURI__.core.invoke(cmd, payload), [command, args],
    );
    const ping = await invoke('ping', { echo: 'wp65-release' });
    assert.equal(ping.pong, true);
    assert.equal(ping.runtime, 'tauri-desktop');
    assert.equal(ping.echo, 'wp65-release');
    const version = await invoke('version');
    assert.equal(version.os, 'windows');
    assert.equal(version.kernelAttached, false);
    const admission = await invoke('admission_status');
    assert.equal(admission.admitted, true);
    assert.equal(admission.budgets.quantumMaxQubits, 6);
    const idle = await invoke('kernel_solve', { request: { workload: { type: 'idle' } } });
    assert.equal(idle.admitted, true);
    assert.equal(idle.frame.format, 'invention-lab/solver-frame/1');
    const refused = await invoke('kernel_solve', { request: { workload: { type: 'quantum', qubits: 8 } } });
    assert.equal(refused.admitted, false);
    assert.match(refused.reason, /budget/);
    assert.deepEqual(errors, [], 'WebView2 console errors');
    console.log(JSON.stringify({ webview2: true, sha256: '8/8', academyMissions: 11,
      ipc: ['ping', 'version', 'admission_status', 'kernel_solve'],
      version: version.appVersion, kernelAttached: version.kernelAttached, consoleErrors: errors.length }));
  } finally {
    if (child.pid && !exited) {
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); }
      catch { child.kill(); }
    }
    await browser?.close().catch(() => {});
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
}
const [app, exe] = process.argv.slice(2);
if (!app || !exe) throw Error('usage: smoke-desktop-release.mjs APP_DIR RELEASE_EXE');
await smoke(resolve(app), resolve(exe));
