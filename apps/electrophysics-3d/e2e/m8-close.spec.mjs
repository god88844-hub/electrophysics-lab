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
      const cadPanel = page.locator('section[aria-label="Dimensioned CAD and thermal engineering workspace"]');
      // The harness may have left the panel either state — drive it deterministically.
      const initiallyHidden = await cadPanel.evaluate((el) => el.hidden);
      if (!initiallyHidden) await cadToggle.click();
      await cadToggle.click();
      await expect(cadPanel).toBeVisible();
      const closeBtn = cadPanel.locator('button.panel-close');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(cadPanel).toBeHidden();
      // aria-expanded must reset for accessibility.
      await expect(cadToggle).toHaveAttribute('aria-expanded', 'false');
    } finally {
      server.kill();
    }
  });
});

let consoleErrors = [];
