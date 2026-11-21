// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * WP-1.5 — Kernel-frame-fed 60 FPS viewport (Playwright acceptance):
 *   1. Frame pipeline: the app publishes a schema-valid solver-frame envelope
 *      (docs/master-plan/schemas/solver-frame.schema.json) whose typed views
 *      are pre-allocated once and mutated in place (zero per-frame heap
 *      allocation), with a monotonic frameId and honest provenance badge.
 *   2. ViewCube + hover telemetry read frames, not ad-hoc state.
 *   3. FPS trend: ≥55 FPS median over the 60 s CI reference clip on hardware
 *      GL; on GPU-less (SwiftShader) runners the Law-4 trend floor applies
 *      (no regression, governor stays automatic).
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..'); // e2e → app → apps → repo root
const SCHEMA = JSON.parse(
  readFileSync(path.join(repoRoot, 'docs', 'master-plan', 'schemas', 'solver-frame.schema.json'), 'utf8')
);

async function boot(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // WP-1.5 vault sync: RAW_FILES covers reference-library 01–08 (PR #99 manifest).
  await expect(page.getByText(/SHA-256 8\/8/)).toBeVisible({ timeout: 40_000 });
  return errors;
}

function cleanErrors(errors) {
  return errors.filter((e) => !/favicon/i.test(e));
}

// Prefer real GPU for the 55 FPS acceptance; --enable-unsafe-swiftshader keeps
// GPU-less CI runners honest (the renderer string detects the actual path).
test.use({
  launchOptions: { args: ['--enable-gpu', '--enable-unsafe-swiftshader'] },
});

test.describe('WP-1.5 solver-frame pipeline', () => {
  test('frame envelope is schema-valid, pre-allocated once, and frame-id monotonic', async ({ page }) => {
    const errors = await boot(page);
    // Wait until the pipeline is live (several frames ingested at 60 Hz).
    await page.waitForFunction(() => (window.__lab?.frame?.stats?.ingested ?? 0) > 10, undefined, { timeout: 30_000 });

    const result = await page.evaluate(async (schemaMeta) => {
      const f = window.__lab.frame;
      // Identity stability: capture typed-view references, let ~60 frames pass,
      // verify the exact same objects are still in use (zero per-frame realloc).
      const ref0 = {
        env: f,
        circuit0: f.circuits[0],
        nodeVoltages: f.circuits[0].nodeVoltages,
        currents: f.circuits[0].currents,
        tiles: f.thermal.tiles,
        bloch: f.quantum.bloch,
        tileActivity: f.soc.tileActivity,
        busLevels: f.soc.busLevels,
        viewQ: f.view.q,
      };
      const id0 = f.frameId;
      await new Promise((r) => setTimeout(r, 1000));
      const json = f.toJSON();
      const jsonKeys = Object.keys(json);
      return {
        sameEnv: f === ref0.env,
        sameCircuit0: f.circuits[0] === ref0.circuit0,
        sameNv: f.circuits[0].nodeVoltages === ref0.nodeVoltages,
        sameCur: f.circuits[0].currents === ref0.currents,
        sameTiles: f.thermal.tiles === ref0.tiles,
        sameBloch: f.quantum.bloch === ref0.bloch,
        sameActivity: f.soc.tileActivity === ref0.tileActivity,
        sameBus: f.soc.busLevels === ref0.busLevels,
        sameView: f.view.q === ref0.viewQ,
        monotonic: f.frameId > id0,
        frameIdDelta: f.frameId - id0,
        ingested: f.stats.ingested,
        tSimS: f.tSimS,
        traceC: f.thermal.traceC,
        gridMaxC: f.thermal.gridMaxC,
        nodeCount: f.circuits[0].nodeCount,
        badge: f.provenance.badge,
        solver: f.provenance.solver,
        live: f.live,
        validation: f.validate(),
        json,
        jsonKeys,
        schemaMeta,
      };
    }, {
      properties: Object.keys(SCHEMA.properties),
      formatConst: SCHEMA.properties.format.const,
      badgeEnum: SCHEMA.properties.provenance.properties.badge.enum,
      circuitRequired: SCHEMA.properties.circuits.items.required,
    });

    // Zero per-frame allocation: every typed view survives by identity.
    expect(result.sameEnv, 'frame envelope identity stable across ~60 frames').toBe(true);
    expect(result.sameCircuit0).toBe(true);
    expect(result.sameNv, 'nodeVoltages typed view stable').toBe(true);
    expect(result.sameCur, 'currents typed view stable').toBe(true);
    expect(result.sameTiles).toBe(true);
    expect(result.sameBloch).toBe(true);
    expect(result.sameActivity).toBe(true);
    expect(result.sameBus).toBe(true);
    expect(result.sameView, 'view quaternion view stable').toBe(true);
    expect(result.monotonic, 'frameId advances monotonically').toBe(true);
    expect(result.frameIdDelta).toBeGreaterThan(30); // ≥30 frames in 1 s
    expect(result.nodeCount).toBeGreaterThan(0);
    expect(Number.isFinite(result.traceC)).toBe(true);
    expect(Number.isFinite(result.gridMaxC)).toBe(true);
    expect(result.live).toBe(true);

    // Schema conformance (schema-file driven, not a copy): the serialized
    // frame emits exactly the schema property set.
    expect(result.validation.ok, `frame validation errors: ${result.validation.errors.join('; ')}`).toBe(true);
    expect(result.jsonKeys.sort()).toEqual([...result.schemaMeta.properties].sort());
    expect(result.json.format).toBe(result.schemaMeta.formatConst);
    expect(result.schemaMeta.badgeEnum).toContain(result.json.provenance.badge);
    expect(result.badge).toBe('SIMULATED_PHYSICS_MODEL');
    for (const key of result.schemaMeta.circuitRequired) {
      expect(result.json.circuits[0]).toHaveProperty(key);
    }
    expect(cleanErrors(errors)).toEqual([]);
  });

  test('mandatory per-frame provenance badge is on screen and frame-fed', async ({ page }) => {
    await boot(page);
    const badge = page.getByTestId('frame-provenance-badge');
    await expect(badge).toBeVisible({ timeout: 30_000 });
    await expect(badge).toContainText(/SIMULATED_PHYSICS_MODEL/);
    const first = await badge.textContent();
    // Badge text advances with the frame counter (poll — render rate varies
    // between hardware GL and SwiftShader runners).
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('[data-testid="frame-provenance-badge"]');
        return Boolean(el && el.textContent && el.textContent !== prev && /SIMULATED_PHYSICS_MODEL · frame \d+ · \d+\.?\d* s/.test(el.textContent));
      },
      first,
      { timeout: 20_000 }
    );
    const second = await badge.textContent();
    expect(first).toMatch(/frame \d+/);
    expect(second).toMatch(/SIMULATED_PHYSICS_MODEL · frame \d+ · \d+\.?\d* s/);
  });

  test('ViewCube + hover telemetry read frames, not ad-hoc state', async ({ page }) => {
    const errors = await boot(page);
    await page.evaluate(() => window.__lab.store.set({ workspace: 'silicon' }));
    await page.waitForTimeout(600);

    // ViewCube orientation is frame-fed: drag the viewport → frame view record
    // updates (azimuth), and the gizmo keeps mirroring it.
    const before = await page.evaluate(() => ({
      azimuth: window.__lab.frame.view.azimuth,
      stamp: window.__lab.frame.view.frameStamp,
    }));
    expect(before.stamp).toBeGreaterThan(0);
    const canvas = page.locator('[data-testid="cad-viewport"] canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 180, box.y + box.height / 2, { steps: 12 });
    await page.mouse.up();
    // Orbit drag must show up in the frame view record (poll — damping takes
    // a few rendered frames).
    await page.waitForFunction(
      (before) => Math.abs(window.__lab.frame.view.azimuth - before.azimuth) > 0.1,
      before,
      { timeout: 20_000 }
    );
    const after = await page.evaluate(() => ({
      azimuth: window.__lab.frame.view.azimuth,
      stamp: window.__lab.frame.view.frameStamp,
    }));
    expect(Math.abs(after.azimuth - before.azimuth)).toBeGreaterThan(0.1, 'orbit drag updates the frame view record');
    expect(after.stamp).toBeGreaterThan(before.stamp);
    // ViewCube canvas still live (mirroring the fed orientation).
    await expect(page.locator('div[title*="ViewCube"] canvas')).toBeVisible();

    // Hover telemetry: frame-derived values in the callout meta (read in one
    // evaluate — the meta is rebuilt every rendered frame from the frame
    // buffers, so its frame id tracks the live counter within a few frames).
    let hover = null;
    for (const [fx, fy] of [[0.5, 0.5], [0.42, 0.55], [0.58, 0.45], [0.5, 0.62], [0.38, 0.48]]) {
      await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy);
      try {
        await page.waitForFunction(() => window.__lab.store.get().hover !== null, undefined, { timeout: 6_000 });
      } catch {
        continue; // try the next probe point
      }
      hover = await page.evaluate(() => {
        const s = window.__lab.store.get();
        return {
          meta: s.hover?.meta ?? null,
          traceC: Math.round(window.__lab.frame.thermal.traceC),
          frameId: window.__lab.frame.frameId,
        };
      });
      if (hover.meta) break;
    }
    expect(hover.meta, 'hover callout fires over the rig').toBeTruthy();
    expect(hover.meta).toContain('SIMULATED_PHYSICS_MODEL');
    const traceMatch = hover.meta.match(/T_trace (-?\d+)/);
    expect(traceMatch, `hover meta carries frame T_trace: ${hover.meta}`).toBeTruthy();
    expect(Math.abs(Number(traceMatch[1]) - hover.traceC)).toBeLessThanOrEqual(1, 'hover T_trace is the frame value');
    const metaFrame = Number(hover.meta.match(/frame (\d+)/)?.[1] ?? -1);
    expect(Math.abs(metaFrame - hover.frameId), 'hover meta frame id tracks the live counter').toBeLessThanOrEqual(5);
    expect(cleanErrors(errors)).toEqual([]);
  });
});

test.describe('WP-1.5 FPS trend (60 s CI reference clip)', () => {
  test('FPS trend: ≥55 FPS median over 60 s on hardware GL; Law-4 trend floor + automatic governor on SwiftShader', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = await boot(page);
    // The CI reference clip: Silicon CAD workbench, sim running, default orbit.
    await page.evaluate(() => window.__lab.store.set({ workspace: 'silicon' }));
    await page.waitForFunction(() => (window.__lab?.fpsTrend?.framesTotal ?? 0) > 10, undefined, { timeout: 30_000 });

    const gl = await page.evaluate(() => {
      const c = document.createElement('canvas');
      const g = c.getContext('webgl2') || c.getContext('webgl');
      const ext = g && g.getExtension('WEBGL_debug_renderer_info');
      const renderer = ext && g ? String(g.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'unknown';
      return { renderer, hardware: !/swiftshader|software|llvmpipe|basic render/i.test(renderer) };
    });

    await page.waitForTimeout(61_000); // the 60 s clip + boundary frame
    const summary = await page.evaluate(() => window.__lab.fpsTrend.summary());
    const quality = await page.evaluate(() => window.__lab.frame.quality);

    // Instrumentation ran cleanly over the full window.
    expect(summary.complete, `trend window complete (${summary.samples} samples, ${summary.elapsedS.toFixed(1)} s)`).toBe(true);
    expect(summary.samples).toBeGreaterThanOrEqual(100);
    expect(summary.medianFps).toBeGreaterThan(0);
    expect(summary.minFps).toBeLessThanOrEqual(summary.medianFps);
    expect(summary.medianFps).toBeLessThanOrEqual(summary.maxFps);
    expect(summary.targetFps).toBe(55);

    // Acceptance (honest, runner-aware — Law 4: trend check, not a gate
    // absolute): ≥55 median on hardware GL (measured 60 median on the Intel
    // Core Ultra 7 155U iGPU reference); on SwiftShader software rendering
    // the scene measures ~1–3 FPS, so the floor asserts the pipeline stays
    // alive and the automatic governor provably reacted instead.
    if (gl.hardware) {
      expect(summary.medianFps, `hardware GL (${gl.renderer}) median over 60 s`).toBeGreaterThanOrEqual(55);
    } else {
      expect(summary.medianFps, `SwiftShader alive floor (${gl.renderer})`).toBeGreaterThanOrEqual(1);
      expect(quality.changes, 'governor reacted to SwiftShader render cost').toBeGreaterThanOrEqual(1);
    }

    // iGPU quality governor stays live and automatic (never disabled):
    // sustained <42 FPS must have stepped quality down at least once.
    if (summary.medianFps < 42) {
      expect(quality.changes, 'governor reacted to sustained sub-42 FPS').toBeGreaterThanOrEqual(1);
    }
    expect(['high', 'medium', 'low']).toContain(quality.level);
    expect(cleanErrors(errors)).toEqual([]);
  });
});
