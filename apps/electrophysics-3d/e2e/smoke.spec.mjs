// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Automated headless smoke verification for the Electrophysics Lab 3D:
 *  1. boots with zero console errors
 *  2. Inspector Drawer starts CLOSED (zero-clutter HUD)
 *  3. navigates cleanly across all 5 bays
 *  4. triggers a real > 1.95 V oxide-breakdown forensic report
 *  5. runs a deterministic AI Co-Inventor experiment to completion
 */

function selectRange(page, match) {
  return page.evaluate((matcher) => {
    const sliders = [...document.querySelectorAll('input[type="range"]')];
    const el = sliders.find((s) => matcher(s));
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, el.getAttribute('data-target') ?? el.value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, match.toString());
}

test.describe('Electrophysics Lab 3D — smoke verification', () => {
  let consoleErrors;

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));
    await page.goto('/');
    await expect(page.getByText(/SHA-256 6\/6/)).toBeVisible({ timeout: 30_000 });
  });

  test('boots clean: 0 console errors, Inspector Drawer closed, integrity verified', async ({ page }) => {
    // Inspector Drawer starts CLOSED — its per-bay content must be absent and
    // the default hint shown instead.
    await expect(page.getByText('Select a bay (1–5) or click a glowing pedestal')).toBeVisible();
    await expect(page.getByText('LIVE ELECTRO-THERMAL BENCH')).toHaveCount(0);
    // SHA-256 integrity badge for all 6 reference datasets.
    await expect(page.getByText(/SHA-256 6\/6/)).toBeVisible();
    // HUD FPS counter is live.
    await expect(page.getByText(/FPS/)).toBeVisible();
    // Filter out benign browser-internal noise; assert zero app errors.
    const appErrors = consoleErrors.filter((e) => !/favicon|Autoplay|GPU stall/i.test(e));
    expect(appErrors).toEqual([]);
  });

  test('navigates cleanly across all 5 bays', async ({ page }) => {
    for (const id of [1, 2, 3, 4, 5]) {
      await page.evaluate((n) => window.dispatchEvent(new KeyboardEvent('keydown', { key: String(n) })), id);
      await page.waitForTimeout(250);
    }
    await expect(page.getByRole('heading', { name: 'Offline Physics Library' })).toBeVisible();
    // Bay-specific content renders per bay.
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' })));
    await expect(page.getByText('LIVE ELECTRO-THERMAL BENCH')).toBeVisible();
    await expect(page.getByText('q4_thresh_det')).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '4' })));
    await expect(page.getByText('SOA BREAKDOWN BENCH')).toBeVisible();
    const appErrors = consoleErrors.filter((e) => !/favicon|Autoplay|GPU stall/i.test(e));
    expect(appErrors).toEqual([]);
  });

  test('VDD > 1.95 V triggers the oxide-breakdown forensic autopsy', async ({ page }) => {
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' })));
    await expect(page.getByText('LIVE ELECTRO-THERMAL BENCH')).toBeVisible();
    // Drive VDD past the SKY130 SOA ceiling (1.95 V).
    await page.evaluate(() => {
      const sliders = [...document.querySelectorAll('input[type="range"]')];
      const vdd = sliders.find((s) => s.max === '3.3');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(vdd, '2.5');
      vdd.dispatchEvent(new Event('input', { bubbles: true }));
    });
    // The forensic autopsy drawer must open with the real physics.
    await expect(page.getByRole('heading', { name: /Forensic Autopsy — gate_oxide_breakdown/ })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/1\.95/).first()).toBeVisible();
    await expect(page.getByText(/TDDB/).first()).toBeVisible();
    await expect(page.getByText('Export JSON')).toBeVisible();
    await expect(page.getByText(/Apply fix & re-run clean/)).toBeVisible();
    // Apply the physics-valid fix: clamps VDD to 1.80 V and re-runs clean.
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Apply fix'));
      btn?.click();
    });
    await expect(page.getByText('VDD 1.80 V').first()).toBeVisible({ timeout: 15_000 });
    const appErrors = consoleErrors.filter((e) => !/favicon|Autoplay|GPU stall/i.test(e));
    expect(appErrors).toEqual([]);
  });

  test('deterministic AI Co-Inventor experiment completes with a bundle', async ({ page }) => {
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' })));
    await expect(page.getByText('AI CO-INVENTOR — DISCOVERY EXPERIMENT')).toBeVisible();
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Run AI Discovery Experiment'));
      btn?.click();
    });
    // Fixed seed ⇒ the optimized fidelity is reproducible run-to-run.
    await expect(page.getByText(/final error/)).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/Export Breakthrough Bundle/)).toBeVisible();
    // QEC sweep produces the logical-vs-physical table.
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Run QEC sweep'));
      btn?.click();
    });
    await expect(page.getByText(/p 5% → logical/)).toBeVisible({ timeout: 60_000 });
    const appErrors = consoleErrors.filter((e) => !/favicon|Autoplay|GPU stall/i.test(e));
    expect(appErrors).toEqual([]);
  });
});
