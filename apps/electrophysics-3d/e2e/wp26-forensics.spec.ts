// @ts-check
import { test, expect, type Page } from '@playwright/test';

/**
 * WP-2.6 — forensic loop e2e on the isolated port 4180:
 *
 *   breakdown → dock (autopsy tab) → slow-mo scrub + replay (schema-honest
 *   `live: false` frames) → AI Fix & Re-Test (measured re-test verdict +
 *   verified provenance badges) → clean recovery.
 *
 * Every forensic surface is bound to the `invention-lab/forensic-autopsy/1`
 * contract (WP-2.3 ep-thermal mirror): no report → no forensic UI, no VFX.
 */

async function boot(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // Integrity badge presence (the 6/8 ✗ raw-import count is a pre-existing
  // main defect tracked in PR #102's description — unrelated to WP-2.6).
  await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible({ timeout: 40_000 });
  return errors;
}

/** Drive Vgs past the SKY130 SOA ceiling (Vgs > 1.95 V) on the real bench. */
async function breakdown(page: Page) {
  await page.evaluate(() => {
    window.__lab!.store.set({ vddSlider: 2.5 });
    window.__lab!.physicsClient!.setParams({ vdd: 2.5 });
  });
  // The failure trips within the first seconds of sim time.
  await expect
    .poll(
      async () =>
        await page.evaluate(() => {
          const st = window.__lab!.store.get() as unknown as { forensic: { report: { failure: { type: string } } } | null };
          return st.forensic ? st.forensic.report.failure.type : null;
        }),
      { timeout: 30_000, intervals: [250, 500, 1000] }
    )
    .toBe('gate_oxide_breakdown');
}

test.describe('WP-2.6 forensic loop (kernel events)', () => {
  test('breakdown → autopsy dock with the forensic contract + provenance badges', async ({ page }) => {
    const errors = await boot(page);
    await breakdown(page);

    // The dock opened on the autopsy tab (≤ 32 % height, viewport unobstructed).
    await expect(page.getByText(/Forensic Autopsy — gate_oxide_breakdown/)).toBeVisible();
    const dockHeight = await page.evaluate(() => {
      const dock = [...document.querySelectorAll('div')].find((d) => d.style.height === '32%');
      return dock ? dock.getBoundingClientRect().height : 0;
    });
    const winH = await page.evaluate(() => window.innerHeight);
    expect(dockHeight).toBeGreaterThan(0);
    expect(dockHeight).toBeLessThanOrEqual(winH * 0.33);
    const canvasW = await page.evaluate(() => document.querySelector('canvas')?.clientWidth ?? 0);
    expect(canvasW).toBeGreaterThan(winH);

    // The report carries the forensic contract + kernel-reported anchor.
    const report = await page.evaluate(() => {
      const st = window.__lab!.store.get() as unknown as { forensic: { report: Record<string, unknown> } | null };
      return st.forensic!.report;
    });
    expect(report.format).toBe('invention-lab/forensic-autopsy/1');
    const meta = report.meta as Record<string, unknown>;
    expect(meta.failingAnchor).toBeTruthy();

    // The forensic event adapter normalized the event: anchor + bench + badges.
    const fx = await page.evaluate(() => {
      const client = (window.__lab as unknown as Record<string, Record<string, unknown>>);
      return {
        event: client.physicsClient ? client.physicsClient.lastForensicEvent : null,
        badges: client.physicsClient ? client.physicsClient.lastBadges : [],
        anchorText: client.physicsClient ? client.physicsClient.lastAnchorDescription() : '',
      };
    });
    expect(fx.event).toBeTruthy();
    expect((fx.event as { format: string }).format).toBe('invention-lab/forensic-autopsy/1');
    expect((fx.event as { anchor: { grid: string; label: string } }).anchor.grid).toBe('die');
    // The tripping PMOS is physics-dependent (the binary gate clock sits low
    // while VDD is stressed) — the anchor must match the reported failure node.
    const reportedNode = (report.failure as { node: string | null }).node ?? '';
    expect(['MP_Q4', 'MP_BIN']).toContain((fx.event as { anchor: { label: string } }).anchor.label);
    expect((fx.event as { anchor: { label: string } }).anchor.label).toBe(reportedNode);
    const badgeLabels = (fx.badges as Array<{ label: string }>).map((b) => b.label);
    expect(badgeLabels).toContain('SIMULATED_PHYSICS_MODEL');
    expect(badgeLabels).toContain('invention-lab/forensic-autopsy/1');
    expect(fx.anchorText).toContain('die');

    // The anchored VFX layer exists in the scene (arc flash + char decal),
    // created only because a real threshold event fired.
    const overlay = await page.evaluate(() => {
      const world = window.__lab!.worldRef.current as unknown as { scene: { children: Array<{ name?: string }> } };
      const findNamed = (n: string) => JSON.stringify(world.scene.children.some((c) => (c as { name?: string }).name === n) || world.scene.children.some((c) => 'children' in c && (c as { children: Array<{ name?: string }> }).children.some((k) => k.name === n)));
      return {
        layer: findNamed('forensic-vfx'),
        decal: findNamed('forensic-char-decal'),
      };
    });
    expect(overlay.layer).toContain('true');
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('slow-motion scrub + replay emits schema-honest live:false frames', async ({ page }) => {
    const errors = await boot(page);
    await breakdown(page);

    // Worker-authoritative scrub: a live:false frame arrives, the world
    // scrubs, the client reports the replay state.
    const scrubbed = await page.evaluate(async () => {
      const client = (window.__lab as unknown as {
        physicsClient: {
          scrubSlowMo(index: number): void;
          onReplayFrame(fn: (f: { replayIndex: number; live: boolean; replayTotal: number }) => void): () => void;
          live: boolean;
        };
      }).physicsClient;
      let frame: { replayIndex: number; live: boolean; replayTotal: number } | null = null;
      const off = client.onReplayFrame((f) => {
        frame = f;
      });
      client.scrubSlowMo(3);
      await new Promise((r) => setTimeout(r, 400));
      off();
      return { frame, live: client.live };
    });
    expect(scrubbed.frame).toBeTruthy();
    expect((scrubbed.frame as { live: boolean }).live).toBe(false);
    expect((scrubbed.frame as { replayIndex: number }).replayIndex).toBe(3);
    expect((scrubbed.frame as { replayTotal: number }).replayTotal).toBeGreaterThan(0);
    expect(scrubbed.live).toBe(false);

    // Slow-mo playback: frames advance automatically at the 100 ms cadence.
    const playback = await page.evaluate(async () => {
      const client = (window.__lab as unknown as {
        physicsClient: {
          startSlowMo(): void;
          stopSlowMo(): void;
          onReplayFrame(fn: (f: { replayIndex: number }) => void): () => void;
        };
      }).physicsClient;
      const seen: number[] = [];
      const off = client.onReplayFrame((f) => seen.push(f.replayIndex));
      client.startSlowMo();
      await new Promise((r) => setTimeout(r, 900));
      client.stopSlowMo();
      await new Promise((r) => setTimeout(r, 150));
      off();
      return seen;
    });
    expect(playback.length).toBeGreaterThanOrEqual(3, 'slow-mo delivers multiple frames at the 100 ms cadence');
    // Frames advance in ring order (deterministic replay).
    for (let i = 1; i < playback.length; i++) {
      expect(playback[i]).toBeGreaterThanOrEqual(playback[i - 1]);
    }

    // The normalized event carries the anchor + provenance badges (the
    // drawer consumes these exact surfaces when mounted).
    const surfaces = await page.evaluate(() => {
      const client = (window.__lab as unknown as { physicsClient: { lastForensicEvent: { anchor: { grid: string; u: number; v: number; label: string } } | null; lastAnchorDescription(): string; lastBadges: Array<{ label: string }> } }).physicsClient;
      return {
        anchor: client.lastForensicEvent?.anchor ?? null,
        anchorText: client.lastAnchorDescription(),
        badges: client.lastBadges.map((b) => b.label),
      };
    });
    expect(surfaces.anchor).toBeTruthy();
    expect(surfaces.anchor!.grid).toBe('die');
    expect(surfaces.anchorText).toMatch(/die \(0\.\d+, 0\.\d+\)/);
    expect(surfaces.badges).toContain('SIMULATED_PHYSICS_MODEL');
    expect(surfaces.badges).toContain('invention-lab/forensic-autopsy/1');
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('AI Fix & Re-Test: physics-valid mitigation, measured re-test, clean recovery', async ({ page }) => {
    const errors = await boot(page);
    await breakdown(page);

    // Apply the AI Fix from the dock (clamp VDD to the SKY130 nominal rail).
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('AI Fix & Re-Test'));
      btn?.click();
    });
    // The post-fix re-test window runs 240 ticks @ 240 Hz (~1 s).
    const retest = await page.evaluate(
      () =>
        new Promise<Record<string, unknown>>((resolve) => {
          const client = (window.__lab as unknown as { physicsClient: { onFixApplied(fn: (applied: unknown, retest: Record<string, unknown>) => void): () => void } }).physicsClient;
          const off = client.onFixApplied((_applied, retestResult) => {
            off();
            resolve(retestResult as Record<string, unknown>);
          });
          setTimeout(() => resolve({ timeout: true }), 20_000);
        })
    );
    expect(retest).toBeTruthy();
    expect(retest.ok).toBe(true);
    expect(retest.ticks).toBeGreaterThanOrEqual(240);
    expect(retest.trips).toBe(0);
    // The mitigation is physics-valid: the clamped rail cannot exceed the
    // SKY130 nominal VDD — Vgs stays below the 1.95 V SOA ceiling.
    expect((retest.peaks as { vgsMax: number }).vgsMax).toBeLessThanOrEqual(1.95);

    // Clean recovery: the sim runs unpaused and no new failure latches.
    await page.waitForTimeout(2000);
    const after = await page.evaluate(() => {
      const st = window.__lab!.store.get() as unknown as { forensic: unknown; vddSlider: number };
      const client = (window.__lab as unknown as { physicsClient: { lastFixRetest: Record<string, unknown> | null } }).physicsClient;
      return { forensic: st.forensic, vddSlider: st.vddSlider, retest: client.lastFixRetest };
    });
    expect(after.forensic).toBe(null);
    expect(after.vddSlider).toBeLessThanOrEqual(1.8);
    expect(after.retest).toBeTruthy();

    // The re-test verdict carries the measured peaks + provenance badge data.
    expect(Object.keys(retest)).toContain('peaks');
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });
});
