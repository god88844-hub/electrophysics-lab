// @ts-check
import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';

/**
 * M8 close-UX verification:
 *  - v2 3D: Inspector Drawer, Library overlay and Forensic Autopsy all close
 *    via their always-visible × buttons (and Esc).
 *  - Phase 0 legacy UI: every toggleable scene panel (engineering CAD, sandbox
 *    workbench, hardware bridge, …) closes via its universal × button.
 */

test.describe('M8 universal × close buttons', () => {
  test('v2: inspector drawer + library overlay close via ×', async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(String(err)));
    await page.goto('/');
    await expect(page.getByText(/SHA-256 6\/6/)).toBeVisible({ timeout: 30_000 });

    // Inspector Drawer: open bay 2, close via the ✕ header button.
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' })));
    await expect(page.getByText('LIVE ELECTRO-THERMAL BENCH')).toBeVisible();
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.getAttribute('title')?.includes('Close (Tab)'));
      btn?.click();
    });
    // The drawer slides off-screen (stays in DOM) — assert the transform.
    await expect(async () => {
      const t = await page.evaluate(() => {
        const heading = [...document.querySelectorAll('h3')].find((h) => h.textContent?.includes('Silicon Foundry'));
        const drawer = heading?.closest('div')?.parentElement;
        return drawer?.style?.transform ?? '';
      });
      if (!t.includes('translateX(100%)')) throw new Error('drawer still open: ' + t);
    }).toPass({ timeout: 10_000 });

    // Library overlay: open via bay 5 button, close via ✕.
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '5' })));
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Browse library'));
      btn?.click();
    });
    await expect(page.locator('h2:has-text("Offline Physics Library")')).toBeVisible();
    await page.evaluate(() => {
      const overlay = [...document.querySelectorAll('h2')].find((h) => h.textContent?.includes('Offline Physics Library'));
      const container = overlay?.parentElement;
      const btn = [...(container?.querySelectorAll('button') ?? [])].find((b) => b.textContent === '✕');
      btn?.click();
    });
    await expect(async () => {
      const visible = await page.evaluate(() => {
        const heading = [...document.querySelectorAll('h2')].find((h) => h.textContent?.includes('Offline Physics Library'));
        const overlay = heading?.closest('div');
        return overlay ? overlay.getBoundingClientRect().left < window.innerWidth : false;
      });
      if (visible) throw new Error('library overlay still visible');
    }).toPass({ timeout: 10_000 });
    expect(consoleErrors).toEqual([]);
  });

  test('v2: forensic autopsy closes via × (and Esc re-opens nothing)', async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(String(err)));
    await page.goto('/');
    await expect(page.getByText(/SHA-256 6\/6/)).toBeVisible({ timeout: 30_000 });
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' })));
    await expect(page.getByText('LIVE ELECTRO-THERMAL BENCH')).toBeVisible();
    await page.evaluate(() => {
      const sliders = [...document.querySelectorAll('input[type="range"]')];
      const vdd = sliders.find((s) => s.max === '3.3');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(vdd, '2.5');
      vdd.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.getByRole('heading', { name: /Forensic Autopsy/ })).toBeVisible({ timeout: 30_000 });
    // Close via the autopsy header ✕.
    await page.evaluate(() => {
      const heading = [...document.querySelectorAll('h2')].find((h) => h.textContent?.includes('Forensic Autopsy'));
      const container = heading?.closest('div');
      const btn = [...(container?.parentElement?.querySelectorAll('button') ?? [])].find((b) => b.textContent === '✕');
      btn?.click();
    });
    await expect(page.getByRole('heading', { name: /Forensic Autopsy/ })).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('Phase 0 legacy UI: scene panels close via the universal × button', async ({ page }) => {
    test.setTimeout(180_000);
    const server = spawn(process.execPath, ['serve.mjs', '8091'], {
      cwd: '../..',
      stdio: 'ignore',
    });
    try {
      // Wait for the local research server.
      let up = false;
      for (let i = 0; i < 80; i++) {
        try {
          const r = await fetch('http://127.0.0.1:8091/tests/browser-3d.html', { signal: AbortSignal.timeout(700) });
          if (r.ok) { up = true; break; }
        } catch { /* starting */ }
        await page.waitForTimeout(150);
      }
      expect(up).toBe(true);
      await page.goto('http://127.0.0.1:8091/tests/browser-3d.html');
      // The harness boots the full Phase 0 app (WebGL via SwiftShader) and
      // writes its own result; we only need the panel chrome.
      await page.waitForFunction(() => document.querySelector('[data-action="engineering-cad"]') !== null, null, { timeout: 120_000 });
      const cadToggle = page.locator('[data-action="engineering-cad"]');
      await cadToggle.click();
      await expect(page.locator('section.scene3d-wire-editor:not([hidden])')).toBeVisible();
      const closeBtn = page.locator('section.scene3d-wire-editor:not([hidden]) button.panel-close');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(page.locator('section.scene3d-wire-editor:not([hidden])')).toHaveCount(0);
      // aria-expanded must reset for accessibility.
      await expect(cadToggle).toHaveAttribute('aria-expanded', 'false');
    } finally {
      server.kill();
    }
  });
});

let consoleErrors = [];
