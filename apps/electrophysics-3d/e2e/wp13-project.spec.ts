// @ts-check
import { test, expect, type Page, type Download } from '@playwright/test';

/**
 * WP-1.3 — `.eplab` Save / Open / Auto-save Playwright round-trip.
 *
 * 1. Explicit save → download → reload → open (upload the same bytes) →
 *    identical persisted store state (PHASE_01 checklist item).
 * 2. Auto-save on window blur (30 s interval shares the same code path) →
 *    reload → fail-closed boot restore → identical state.
 * 3. Fail-closed Open: a tampered `.eplab` (payload byte flipped after
 *    sealing) is refused with the exact hash mismatch; the store is never
 *    partially loaded.
 *
 * Runs on the isolated port 4175 (playwright.wp13.config.ts) — the shared
 * 4173 suite is untouched. Browser mode: the desktop bridge degrades
 * honestly (WP-1.1), so Save/Open use the download/file-input transport.
 */

/** Install page-side helpers once — they survive reloads (addInitScript). */
async function installHelpers(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    // The committed-state slice WP-1.3 persists (mirrors state/project.ts).
    w.__persistedSlice = (state) => ({
      sandboxComponents: state.sandboxComponents,
      probes: (state.probes || []).map((p) => ({ targetId: p.targetId, color: p.color })),
      workspace: state.workspace,
      vddSlider: state.vddSlider,
      drivePowerMW: state.drivePowerMW,
      npuAttached: state.npuAttached,
      peelDepth: state.peelDepth,
      sandboxOpen: state.sandboxOpen,
      activeBay: state.activeBay,
      bay1Mode: state.bay1Mode,
      pulseParams: state.pulseParams,
    });
    w.__sliceNow = () => {
      const lab = w.__lab;
      return lab ? (w.__persistedSlice as (s: unknown) => unknown)(lab.store.get()) : null;
    };
    // A projected screen point of the n-th sandbox component mesh.
    w.__sandboxPoint = (index) => {
      const lab = w.__lab;
      if (!lab || !lab.worldRef.current) return null;
      const group = lab.worldRef.current.bay2.group.getObjectByName('sandbox-group');
      if (!group) return null;
      const meshes = group.children.filter((c) => c.name.startsWith('sandbox-'));
      const mesh = meshes[index] || meshes[0];
      return mesh && lab.projectToScreen ? lab.projectToScreen(mesh) : null;
    };
  });
}

async function boot(page: Page) {
  await installHelpers(page);
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // Integrity badge presence (the 6/8 ✗ raw-import count is a pre-existing
  // main defect tracked in PR #102's description — unrelated to WP-1.3).
  await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible({ timeout: 40_000 });
  return errors;
}

/** Place two components, route a wire, pin a probe — the real CAD UI path. */
async function buildProjectState(page: Page) {
  await page.evaluate(() => window.__lab!.store.set({ workspace: 'silicon' }));
  await page.waitForTimeout(600);
  const canvas = page.locator('[data-testid="cad-viewport"] canvas').first();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  // Place two components (C).
  await page.keyboard.press('c');
  await page.mouse.click(box!.x + box!.width * 0.4, box!.y + box!.height * 0.6);
  await page.waitForTimeout(400);
  await page.mouse.click(box!.x + box!.width * 0.6, box!.y + box!.height * 0.6);
  await page.waitForTimeout(600);
  // Route a wire between them (W): click component meshes (from → to).
  await page.keyboard.press('w');
  for (const idx of [0, 1]) {
    const pt = await page.evaluate((i) => {
      const w = window as unknown as { __sandboxPoint?: (i: number) => { x: number; y: number } | null };
      return w.__sandboxPoint ? w.__sandboxPoint(i) : null;
    }, idx);
    expect(pt).toBeTruthy();
    await page.mouse.click(pt!.x, pt!.y);
    await page.waitForTimeout(350);
  }
  await page.waitForTimeout(500);
  // Pin a probe on the first component (P).
  await page.keyboard.press('p');
  const probePt = await page.evaluate(() => {
    const w = window as unknown as { __sandboxPoint?: (i: number) => { x: number; y: number } | null };
    return w.__sandboxPoint ? w.__sandboxPoint(0) : null;
  });
  expect(probePt).toBeTruthy();
  await page.mouse.click(probePt!.x, probePt!.y);
  await page.waitForTimeout(400);
  // A committed session parameter on top of the CAD edits.
  await page.evaluate(() => window.__lab!.store.set({ vddSlider: 2.1 }));
  await page.waitForTimeout(200);
}

/**
 * Assert a toast pattern via the store (the DOM toast element auto-clears
 * after 2.6 s — polling the committed toast state is race-free).
 */
function expectToast(page: Page, pattern: RegExp) {
  return expect
    .poll(
      async () =>
        await page.evaluate(() => (window.__lab!.store.get() as unknown as { toast: string | null }).toast),
      { timeout: 20_000, intervals: [100, 250, 500, 1000] }
    )
    .toMatch(pattern);
}

test.describe('WP-1.3 .eplab project persistence', () => {
  test('save → download → reload → open → identical store state', async ({ page }) => {
    const errors = await boot(page);
    // Browser-mode honesty: the WP-1.1 bridge degrades, persistence uses the
    // download/file-input transport.
    expect(await page.evaluate(() => (window.__lab as unknown as Record<string, { mode: string }>).project?.mode)).toBe('browser');

    await buildProjectState(page);
    const before = await page.evaluate(() => (window as unknown as { __sliceNow: () => unknown }).__sliceNow());
    expect((before as { sandboxComponents: unknown[] }).sandboxComponents.length).toBe(2);

    // Explicit save → real download.
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const download: Download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^experiment-\d{8}-\d{6}\.eplab$/);
    const filePath = await download.path();
    const savedBytes = (await import('node:fs')).readFileSync(filePath!, 'utf8');
    const saved = JSON.parse(savedBytes) as Record<string, unknown>;
    // Sealed container sanity: format + 64-hex seal + library snapshot.
    expect(saved.format).toBe('invention-lab/eplab-project/1');
    expect((saved.integrity as Record<string, string>).payloadSHA256).toMatch(/^[a-f0-9]{64}$/);
    expect((saved.integrity as Record<string, string>).referenceLibraryLockedAt).toBeTruthy();
    // Save status visible with the seal prefix.
    await expectToast(page, /Saved .*\.eplab — seal [0-9a-f]{8}…/);

    // Reload with a clean auto-save slot → open must come from the FILE only.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible({ timeout: 40_000 });
    expect(await page.evaluate(() => (window as unknown as { __sliceNow: () => { sandboxComponents: unknown[] } }).__sliceNow().sandboxComponents.length)).toBe(0);

    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles(filePath!);
    await expectToast(page, /Opened .* — SHA-256 seal verified \([0-9a-f]{8}…\), 1 traces restored/);
    const after = await page.evaluate(() => (window as unknown as { __sliceNow: () => unknown }).__sliceNow());
    expect(after).toEqual(before); // identical persisted store state
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('auto-save on window blur → reload → fail-closed boot restore → identical state', async ({ page }) => {
    const errors = await boot(page);
    await buildProjectState(page);
    const before = await page.evaluate(() => (window as unknown as { __sliceNow: () => unknown }).__sliceNow());
    expect((before as { sandboxComponents: unknown[] }).sandboxComponents.length).toBe(2);

    // Window blur auto-save — the same handler the 30 s interval calls.
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.waitForTimeout(500);
    const autosaveAt = await page.evaluate(() => (window.__lab as unknown as Record<string, unknown> | undefined)?.projectAutosaveAt);
    expect(autosaveAt).toBeTruthy();
    const slot = await page.evaluate(() => localStorage.getItem('eplab.autosave.v1'));
    expect(slot).toBeTruthy();
    const slotJson = JSON.parse(slot!) as Record<string, unknown>;
    expect(slotJson.format).toBe('invention-lab/eplab-project/1');
    expect(slotJson.name).toBe('autosave'); // auto-save batch is sealed like a save
    expect((slotJson.integrity as Record<string, string>).payloadSHA256).toMatch(/^[a-f0-9]{64}$/);

    await page.reload();
    await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible({ timeout: 40_000 });
    // Boot restore is fail-closed: poll the durable open marker + the state
    // (the "Opened autosave …" toast is transient — 2.6 s lifetime).
    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const lab = (window as unknown as { __lab?: Record<string, unknown> }).__lab;
            return lab ? (lab.projectLastOpen as { name: string } | undefined)?.name ?? null : null;
          }),
        { timeout: 20_000 }
      )
      .toBe('autosave');
    const after = await page.evaluate(() => (window as unknown as { __sliceNow: () => unknown }).__sliceNow());
    expect(after).toEqual(before);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('tampered .eplab is refused with the exact hash mismatch — store never partially loaded', async ({ page }) => {
    const errors = await boot(page);
    await buildProjectState(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const download = await downloadPromise;
    const filePath = await download.path();

    // Clean slate, then try to open the FORGED bytes.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible({ timeout: 40_000 });
    expect(await page.evaluate(() => (window as unknown as { __sliceNow: () => { sandboxComponents: unknown[] } }).__sliceNow().sandboxComponents.length)).toBe(0);

    const fs = await import('node:fs');
    const forged = JSON.parse(fs.readFileSync(filePath!, 'utf8')) as {
      workspaces: Array<{ id: string; components: Array<Record<string, unknown>> }>;
      integrity: Record<string, string>;
    };
    // Flip one committed payload byte AFTER sealing (position tamper).
    forged.workspaces.find((w) => w.id === 'silicon')!.components[0].position[0] = 9.9;
    // Artifact paths have no '.eplab' suffix — APPEND the tamper suffixes so
    // each variant is a distinct file (a replace() would no-op and clobber).
    const forgedPath = filePath! + '.forged.eplab';
    fs.writeFileSync(forgedPath, JSON.stringify(forged));

    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles(forgedPath);
    await expectToast(page, /Open refused: SHA-256 seal mismatch.*nothing was loaded/);
    // Fail-closed: zero partial state — components stay empty.
    expect(await page.evaluate(() => (window as unknown as { __sliceNow: () => { sandboxComponents: unknown[]; probes: unknown[] } }).__sliceNow().sandboxComponents.length)).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __sliceNow: () => { probes: unknown[] } }).__sliceNow().probes.length)).toBe(0);
    // Reference-library snapshot tamper is also refused.
    const drifted = JSON.parse(fs.readFileSync(filePath!, 'utf8')) as Record<string, unknown> & { integrity: Record<string, unknown> };
    drifted.integrity.referenceLibraryLockedAt = '2099-01-01T00:00:00.000Z';
    const driftedPath = filePath! + '.drifted.eplab';
    fs.writeFileSync(driftedPath, JSON.stringify(drifted));
    const chooser2Promise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    const chooser2 = await chooser2Promise;
    await chooser2.setFiles(driftedPath);
    await expectToast(page, /Open refused: reference library snapshot mismatch/);
    expect(await page.evaluate(() => (window as unknown as { __sliceNow: () => { sandboxComponents: unknown[] } }).__sliceNow().sandboxComponents.length)).toBe(0);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });
});
