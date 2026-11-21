import { test, expect } from '@playwright/test';

/**
 * WP-1.6 — instrument dock + admission UI (isolated port 4178).
 *
 * Gates:
 *  1. The dock starts collapsed and never exceeds 32 % viewport height.
 *  2. Oscilloscope channels are driven strictly by WP-1.5's solver-frame
 *     typed arrays (`window.__lab.frame`): the dock legend value equals the
 *     frame's own reads — zero fabricated traces.
 *  3. Logic Analyzer: honest `SIMULATED_ARCHITECTURAL_MODEL` badge with no
 *     stream attached; typed events render when a real stream publishes;
 *     unknown-channel publishes are refused (never fabricated).
 *  4. Admission refusals surface in the dock AND the status bar, verbatim,
 *     fail-closed (never hidden or clamped).
 */

async function boot(page) {
  await page.goto('/');
  await expect(page.locator('div[title*="ViewCube"] canvas')).toBeVisible({ timeout: 60_000 });
}

test.describe('WP-1.6 instrument dock + admission UI', () => {
  test('dock starts collapsed and stays ≤ 32 % viewport height when open', async ({ page }) => {
    await boot(page);
    const dockOpen = await page.evaluate(() => window.__lab.store.get().dockOpen);
    expect(dockOpen).toBe(false);
    // Collapsed: the dock panel is not in the DOM at all (BottomDock → null).
    await expect(page.getByText('Forensic Autopsy')).toHaveCount(0);

    await page.evaluate(() => window.__lab.store.set({ dockOpen: true, dockTab: 'scope' }));
    const dock = page.locator('div').filter({ hasText: 'Oscilloscope' }).filter({ hasText: 'Logic Analyzer' }).last();
    await expect(dock).toBeVisible();
    const box = await dock.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeLessThanOrEqual(720 * 0.32 + 2); // ≤ 32 % + border tolerance
  });

  test('oscilloscope channels are driven by the solver-frame typed arrays (no fake traces)', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => window.__lab.store.set({ dockOpen: true, dockTab: 'scope' }));
    await expect(page.getByTestId('wp16-scope-canvas')).toBeVisible();
    // All declared channels render with the "· solver-frame" provenance tag.
    for (const id of ['vdd', 'i_rail', 'vout_q4', 'vout_bin', 't_trace', 't_junction', 'cryo']) {
      await expect(page.getByTestId(`wp16-channel-${id}`)).toContainText('· solver-frame');
    }
    // Wait for at least one frame-gated sample, then compare the dock legend
    // against the frame envelope's own values (same typed arrays — the
    // tolerance covers only the time between the two reads).
    await page.waitForFunction(() => window.__lab.telemetry.samples > 3, null, { timeout: 30_000 });
    const compare = await page.evaluate(() => {
      const t = window.__lab.telemetry;
      const frame = window.__lab.frame;
      return {
        samples: t.samples,
        lastFrameId: t.lastFrameId,
        frameId: frame.frameId,
        vdd: t.lastValues[0],
        frameVdd: frame.vdd,
        iRail: t.lastValues[1],
        frameRail: Math.abs(frame.readCurrent(frame, 'RAIL')) * 1000,
        tTrace: t.lastValues[4],
        frameTrace: frame.thermal.traceC,
      };
    });
    expect(compare.samples).toBeGreaterThan(3);
    expect(Math.abs(compare.lastFrameId - compare.frameId)).toBeLessThanOrEqual(3, 'sampler is frame-gated');
    expect(Math.abs(compare.vdd - compare.frameVdd)).toBeLessThan(0.05);
    expect(Math.abs(compare.iRail - compare.frameRail)).toBeLessThan(Math.max(1, Math.abs(compare.frameRail) * 0.1));
    expect(Math.abs(compare.tTrace - compare.frameTrace)).toBeLessThanOrEqual(Math.max(2, Math.abs(compare.frameTrace) * 0.15), 'two reads at different instants during a heating transient');
  });

  test('logic analyzer: honest badge with no stream; typed events render when a real stream publishes', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => window.__lab.store.set({ dockOpen: true }));
    await page.getByTestId('wp16-logic-tab').click();

    // Inactive: honest badge — no fabricated events.
    const inactive = page.getByTestId('wp16-logic-inactive');
    await expect(inactive).toContainText('SIMULATED_ARCHITECTURAL_MODEL');
    await expect(inactive).toContainText('No logic stream attached');
    await expect(inactive).toContainText('Phase 3');

    // Attach a real stream through the typed interface (Phase 3 attach point).
    await page.evaluate(() => window.__lab.logic.attach({ name: 'wp16-e2e-rig', channels: ['q0', 'q1'] }));
    await expect(inactive).toHaveCount(0);
    await expect(page.getByText(/stream: .*wp16-e2e-rig/)).toBeVisible();
    await expect(page.getByText(/event buffer empty/)).toBeVisible();

    // Publish typed events → they render exactly as published.
    await page.evaluate(() =>
      window.__lab.logic.publish([
        { t: 0.001, channel: 'q0', value: 1, edge: 'rising' },
        { t: 0.002, channel: 'q1', value: 0, edge: 'falling' },
      ])
    );
    const events = page.getByTestId('wp16-logic-events');
    await expect(events).toContainText('q0');
    await expect(events).toContainText('rising');
    await expect(events).toContainText('falling');
    await expect(page.getByText(/events 2 · buffered 2\/512 · refused 0/)).toBeVisible();

    // Unknown channel → refused at the stream boundary (fail-closed).
    const refused = await page.evaluate(() =>
      window.__lab.logic.publish([{ t: 0.003, channel: 'q99', value: 1 }])
    );
    expect(refused.accepted).toBe(0);
    expect(refused.refused).toBe(1);
    await expect(page.getByText(/events 2 · buffered 2\/512 · refused 1/)).toBeVisible();

    // Detach → back to the honest inactive badge (ring cleared).
    await page.evaluate(() => window.__lab.logic.detach());
    await expect(page.getByTestId('wp16-logic-inactive')).toBeVisible();
  });

  test('admission refusals surface verbatim in the dock and status bar (fail-closed)', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => window.__lab.store.set({ dockOpen: true, dockTab: 'scope' }));

    // Drive a REAL over-budget workload through the admission surface
    // (65-node MNA workload vs the 64-node §2.3 budget).
    const outcome = await page.evaluate(() => {
      const r = window.__lab.admission.admitAndSurface({ domain: 'mna', nodes: 65 });
      return { admitted: r.admitted, reason: r.reason ?? null };
    });
    expect(outcome.admitted).toBe(false);
    expect(outcome.reason).toContain('requests 65 nodes');
    expect(outcome.reason).toContain('budget is ≤ 64');

    // Status bar banner: compact, verbatim, persistent.
    const statusBar = page.getByTestId('admission-banner-status');
    await expect(statusBar).toContainText('⛔ ADM REFUSED [mna] ×1');
    await expect(statusBar).toContainText('requests 65 nodes, budget is ≤ 64 per frame');

    // Dock strip: full reason + budget citation.
    const dockBanner = page.getByTestId('admission-banner-dock');
    await expect(dockBanner).toContainText('⛔ ADMISSION REFUSED');
    await expect(dockBanner).toContainText('02_SYSTEM_ARCHITECTURE.md §2.3');
    await expect(dockBanner).toContainText('never clamped or hidden');

    // A second refusal bumps the persistent count (nothing is hidden).
    await page.evaluate(() => window.__lab.admission.admitAndSurface({ domain: 'quantum', qubits: 8 }));
    await expect(statusBar).toContainText('⛔ ADM REFUSED [quantum] ×2');
    await expect(statusBar).toContainText('requests 8 qubits, interactive budget is ≤ 6');

    // An ADMITTED workload never clears the banner (fail-closed persistence).
    await page.evaluate(() => window.__lab.admission.admitAndSurface({ domain: 'mna', nodes: 4 }));
    await expect(statusBar).toContainText('⛔ ADM REFUSED [quantum] ×2');
    await expect(dockBanner).toContainText('requests 8 qubits');
  });
});
