// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseSky130Spec } from '../src/bays/silicon/sky130Spec.mjs';
import { buildAllCellLayouts } from '../src/bays/silicon/sky130Layout.mjs';

/**
 * WP-3.4 — Polygon-accurate SKY130A Q4-primitive 3D layer viewer.
 *
 * Asserts the real in-browser scene (vite build + WebGL) against the
 * SHA-sealed cad-spec JSON:
 *   1. the stage hosts all 4 verified primitives, generated from
 *      data/cad-specs/01_sky130_primitives_geometry.json,
 *   2. per-cell per-layer polygon instance counts == cad-specs instance_count
 *      (poly_fingers / li1_stubs / met1_pads and the derived chain),
 *   3. true-to-scale scene bands: declared ×3 film exaggeration + declared
 *      substrate clip, matching the pure layout engine used by the unit tests,
 *   4. KLayout-style layer visibility + opacity + Layer-Peel Slicer drive the
 *      polygon viewer through the EXISTING Bay 2 Layer panel (no UI changes),
 *   5. zero binary assets (every stage mesh is a parametric BoxGeometry
 *      InstancedMesh), zero permanent floating label sprites,
 *   6. page stays interactive (FPS counter live, no console errors).
 */

const ROOT = fileURLToPath(new URL('../../..', import.meta.url)); // repo root
const SPEC_BYTES = readFileSync(ROOT + '/data/cad-specs/01_sky130_primitives_geometry.json', 'utf8');
const SPEC_JSON = JSON.parse(SPEC_BYTES);
// Same bytes the browser bundles — verify the seal here too.
const MANIFEST = JSON.parse(readFileSync(ROOT + '/data/cad-specs/MANIFEST.json', 'utf8'));
const SEALED = MANIFEST.files.find((f) => f.file === '01_sky130_primitives_geometry.json');
if (createHash('sha256').update(SPEC_BYTES).digest('hex') !== SEALED.sha256) {
  throw new Error('cad-spec 01 failed its SHA-256 manifest seal');
}
// The pure layout engine (same modules the browser bundle imports).
const NODE_SPEC = parseSky130Spec(SPEC_JSON);
const NODE_LAYOUTS = buildAllCellLayouts(NODE_SPEC);
const Q4_CELL_NAMES = SPEC_JSON.verified_cells.cells.map((c) => c.name);

async function boot(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // NOTE: we boot on world readiness, not the integrity badge. Pre-existing on
  // main (outside WP-3.4 scope, flagged for the data-vault owner): PR #99
  // sealed 07/08 into reference-library MANIFEST.json while the app-side
  // RAW_FILES covers 01–06, so the badge honestly reads "SHA-256 6/8 ✗" and
  // the legacy v3-workbench boot wait (6/6) can never pass. Integrity of the
  // WP-3.4 geometry source (cad-specs 01) is asserted directly below.
  await expect(page.getByRole('button', { name: /Silicon CAD/ })).toBeVisible({ timeout: 40_000 });
  await page.evaluate(() => window.__lab.store.set({ workspace: 'silicon' }));
  await page.waitForFunction(() => {
    const viewer = window.__lab?.worldRef?.current?.bay2?.polyCellViewer;
    return Boolean(viewer && viewer.cells && viewer.cells.size === 4);
  }, undefined, { timeout: 40_000 });
  // The mount-time peel fold-in (crossDepth 12→0) must settle before any
  // layer-panel interaction: applyPeel re-writes material opacity each tick.
  await page.waitForFunction(
    () => window.__lab?.worldRef?.current?.bay2?.polyCellViewer?.isIdle === true,
    undefined,
    { timeout: 60_000 },
  );
  await page.waitForTimeout(200);
  return errors;
}

test.describe('WP-3.4 polygon-accurate Q4 primitive viewer', () => {
  test('stage hosts all 4 verified primitives generated from cad-specs 01', async ({ page }) => {
    const errors = await boot(page);
    const stage = await page.evaluate((names) => {
      const world = window.__lab.worldRef.current;
      const viewer = world.bay2.polyCellViewer;
      if (!viewer) return { present: false };
      return {
        present: true,
        cells: [...viewer.cells.keys()],
        mounted: viewer.group.parent === world.bay2.group && world.bay2.group.visible,
        presentation: viewer.presentation,
        rigNames: names.map((n) => Boolean(world.bay2.group.getObjectByName('poly-cell-' + n))),
      };
    }, Q4_CELL_NAMES);
    expect(stage.present, 'bay2 exposes the WP-3.4 polyCellViewer').toBe(true);
    expect(stage.cells.sort()).toEqual([...Q4_CELL_NAMES].sort());
    expect(stage.mounted, 'stage is mounted inside the visible silicon rig').toBe(true);
    expect(stage.rigNames.every(Boolean)).toBe(true);
    expect(stage.presentation.units).toBe('um');
    expect(stage.presentation.source).toBe('data/cad-specs/01_sky130_primitives_geometry.json');
    expect(stage.presentation.verticalExaggeration).toBe(NODE_SPEC.verticalExaggeration);
    expect(stage.presentation.substrateClipUm).toBe(NODE_SPEC.substrateClipUm);
    expect(stage.presentation.substrateTrueThicknessUm).toBe(525.0);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('geometry-from-JSON: per-layer instance counts == cad-specs instance_count', async ({ page }) => {
    await boot(page);
    const expected = Object.fromEntries(
      SPEC_JSON.verified_cells.cells.map((c) => [
        c.name,
        {
          fingers: c.instance_count.poly_fingers,
          stubs: c.instance_count.li1_stubs,
          pads: c.instance_count.met1_pads,
        },
      ]),
    );
    const counts = await page.evaluate((cellNames) => {
      const viewer = window.__lab.worldRef.current.bay2.polyCellViewer;
      const out = {};
      for (const name of cellNames) {
        out[name] = {
          fingers: viewer.countPolygons(name, 'poly', 'gate-finger'),
          stubs: viewer.countPolygons(name, 'li1', 'li1-stub'),
          pads: viewer.countPolygons(name, 'met1', 'met1-pad'),
          mcon: viewer.countPolygons(name, 'mcon', 'mcon-plug'),
          via: viewer.countPolygons(name, 'via', 'via-plug'),
          met2: viewer.countPolygons(name, 'met2', 'met2-pad'),
          via2: viewer.countPolygons(name, 'via2', 'via2-plug'),
          pins: viewer.countPolygons(name, 'met3', 'met3-pin'),
          total: viewer.totalPolygons(),
        };
      }
      return out;
    }, Q4_CELL_NAMES);
    for (const name of Q4_CELL_NAMES) {
      expect(counts[name].fingers, `${name} poly_fingers`).toBe(expected[name].fingers);
      expect(counts[name].stubs, `${name} li1_stubs`).toBe(expected[name].stubs);
      expect(counts[name].pads, `${name} met1_pads`).toBe(expected[name].pads);
      expect(counts[name].mcon).toBe(expected[name].pads);
      expect(counts[name].via).toBe(expected[name].pads);
      expect(counts[name].met2).toBe(expected[name].pads);
      expect(counts[name].via2).toBe(expected[name].pads);
      expect(counts[name].pins).toBe(expected[name].pads);
    }
    // Rails exist exactly where the spec footprint declares them.
    const rails = await page.evaluate((cellNames) => {
      const viewer = window.__lab.worldRef.current.bay2.polyCellViewer;
      const out = {};
      for (const name of cellNames) {
        out[name] =
          viewer.countPolygons(name, 'li1', 'li1-rail-vdd') +
          viewer.countPolygons(name, 'li1', 'li1-rail-gnd') +
          viewer.countPolygons(name, 'met1', 'met1-rail-vdd') +
          viewer.countPolygons(name, 'met1', 'met1-rail-gnd');
      }
      return out;
    }, Q4_CELL_NAMES);
    for (const cellJson of SPEC_JSON.verified_cells.cells) {
      const declaresRails = /li1\/met1 rails/.test(cellJson.footprint_3d);
      expect(rails[cellJson.name], `${cellJson.name} rails ↔ footprint_3d`).toBe(declaresRails ? 4 : 0);
    }
    // Cross-check against the pure layout engine used by the unit tests.
    expect(counts['q4_mux4'].fingers).toBe(NODE_LAYOUTS.get('q4_mux4').counts['gate-finger']);
  });

  test('true-to-scale scene bands: declared ×3 films + declared substrate clip', async ({ page }) => {
    await boot(page);
    const bands = await page.evaluate((cellNames) => {
      const world = window.__lab.worldRef.current;
      const rig = world.bay2.group.getObjectByName('poly-cell-' + cellNames[1]); // q4_inv
      return rig.userData.layerSceneBands;
    }, Q4_CELL_NAMES);
    const nodeBands = NODE_LAYOUTS.get('q4_inv').layers;
    expect(bands.map((b) => b.key)).toEqual(nodeBands.map((b) => b.key));
    for (let i = 0; i < bands.length; i++) {
      expect(bands[i].thicknessUm).toBe(nodeBands[i].thicknessUm);
      expect(bands[i].thicknessScene).toBeCloseTo(nodeBands[i].thicknessScene, 9);
      expect(bands[i].yBase).toBeCloseTo(nodeBands[i].yBase, 9);
      expect(bands[i].yTop).toBeCloseTo(nodeBands[i].yTop, 9);
    }
    // Spot-check the declared presentation against the raw JSON numbers.
    const t = Object.fromEntries(
      SPEC_JSON.layer_stack_3d.order_bottom_to_top.map((k) => [
        k,
        SPEC_JSON.layer_stack_3d.thickness_um[k] ?? SPEC_JSON.layer_stack_3d.thickness_um[`${k}_height`],
      ]),
    );
    const met3 = bands.find((b) => b.key === 'met3');
    expect(met3.thicknessScene).toBe(t.met3 * 3); // declared ×3 exaggeration
    const substrate = bands[0];
    expect(substrate.key).toBe('substrate');
    expect(substrate.thicknessScene).toBe(2.72); // declared clip (largest cell height)
    expect(substrate.thicknessUm).toBe(525.0); // true depth stays in the data
  });

  test('KLayout layer panel drives the polygon viewer: visibility, opacity, peel', async ({ page }) => {
    await boot(page);
    await page.keyboard.press('Tab'); // open inspector → Bay 2 Layer panel
    await expect(page.getByText('LAYER VISIBILITY (KLAYOUT-STYLE)')).toBeVisible();
    // Visibility: toggle met3 off through the panel button.
    const met3Button = page.locator('div:has-text("LAYER VISIBILITY") button', { hasText: /^met3$/ }).first();
    await met3Button.click();
    await page.waitForTimeout(250);
    let vis = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const rig = world.bay2.group.getObjectByName('poly-cell-q4_inv');
      return {
        met3: rig.getObjectByName('poly-cell-q4_inv-layer-met3').visible,
        met2: rig.getObjectByName('poly-cell-q4_inv-layer-met2').visible,
      };
    });
    expect(vis.met3, 'panel toggle hides the viewer met3 layer').toBe(false);
    expect(vis.met2).toBe(true);
    // Opacity: set poly slider to 50 → viewer poly material opacity 0.5.
    // React's controlled-input tracker dedupes plain value writes, so route
    // through the native value setter before dispatching the input event.
    const polySlider = page.getByRole('button', { name: 'poly', exact: true }).locator('xpath=following-sibling::input[@type="range"]');
    await polySlider.evaluate((el) => {
      const input = /** @type {HTMLInputElement} */ (el);
      const nativeSetter = /** @type {(v: string) => void} */ (
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      );
      nativeSetter.call(input, '50');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(150);
    const opacity = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const rig = world.bay2.group.getObjectByName('poly-cell-q4_inv');
      const mesh = rig.getObjectByName('poly-cell-q4_inv-layer-poly').children[0];
      return mesh.material.opacity;
    });
    expect(opacity).toBeCloseTo(0.5, 5);
    // Peel: L hotkey explodes the stack — viewer layers lift with the die rig.
    await page.keyboard.press('l');
    await page.waitForFunction(
      () => window.__lab?.worldRef?.current?.bay2?.polyCellViewer?.isIdle === true,
      undefined,
      { timeout: 60_000 },
    );
    const peel = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const rig = world.bay2.group.getObjectByName('poly-cell-q4_inv');
      const met3Y = rig.getObjectByName('poly-cell-q4_inv-layer-met3').position.y;
      const substrateY = rig.getObjectByName('poly-cell-q4_inv-layer-substrate').position.y;
      const met3Opacity = rig.getObjectByName('poly-cell-q4_inv-layer-met3').children[0].material.opacity;
      return { met3Y, substrateY, met3Opacity };
    });
    expect(peel.met3Y, 'met3 (top layer, index 11) lifts highest when exploded').toBeGreaterThan(4);
    expect(peel.substrateY, 'substrate (bottom, index 0) stays put when exploded').toBeCloseTo(0, 5);
    // Restore assembled + reset panel state for other runs.
    await page.keyboard.press('l');
    await page.waitForFunction(
      () => window.__lab?.worldRef?.current?.bay2?.polyCellViewer?.isIdle === true,
      undefined,
      { timeout: 60_000 },
    );
  });

  test('zero binary assets, zero permanent floating labels on the polygon stage', async ({ page }) => {
    const errors = await boot(page);
    const audit = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const stage = world.bay2.polyCellViewer.group;
      let meshes = 0;
      let instanced = 0;
      let nonBox = 0;
      let sprites = 0;
      stage.traverse((o) => {
        const m = /** @type {any} */ (o);
        if (m.isSprite) sprites++;
        if (m.isMesh) {
          meshes++;
          if (m.isInstancedMesh) instanced++;
          if (m.geometry?.type !== 'BoxGeometry') nonBox++;
        }
      });
      return { meshes, instanced, nonBox, sprites };
    });
    expect(audit.meshes).toBeGreaterThan(40); // 4 cells × 12 layers of polygons
    expect(audit.instanced).toBe(audit.meshes);
    expect(audit.nonBox, 'every polygon is parametric BoxGeometry — no binary .glb imports').toBe(0);
    expect(audit.sprites, 'zero permanent floating label sprites (hover callout only)').toBe(0);
    // Law 4 budget sanity for the iGPU 60 FPS contract: the whole stage is a
    // handful of instanced draws (tens of meshes), not thousands of objects.
    // (Headless SwiftShader FPS is meaningless here — the Law 4 gate is the
    // measured trend on the Intel Core Ultra 7 155U iGPU, unchanged by this
    // addition: ~52 InstancedMeshes over one shared BoxGeometry.)
    const total = await page.evaluate(() => window.__lab.worldRef.current.bay2.polyCellViewer.totalPolygons());
    expect(total).toBeGreaterThan(0);
    expect(total, 'polygon budget stays tiny (one instanced draw per role)').toBeLessThan(600);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });
});
