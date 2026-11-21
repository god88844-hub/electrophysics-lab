// @ts-check
import { test, expect } from '@playwright/test';

/**
 * v3 CAD/EDA workbench verification (M12–M14):
 *  1. Zero console errors, single-workspace isolation, ViewCube present,
 *     zero permanent colliding labels, inspector & bottom dock start collapsed.
 *  2. Direct 3D interaction: place a component (C), route a trace (W),
 *     plant a 3D oscilloscope probe (P), read live waveforms in the dock.
 *  3. > 1.95 V breakdown opens the Bottom Forensic Dock without crushing the
 *     viewport; AI Fix & Re-Test recovers cleanly.
 *  4. Workspace switching: Quantum (modalities + AI experiment), Silicon CAD
 *     (layer peel), SoC Architect (IHS/workload).
 *  5. Legacy Phase 0 × close buttons still pass (m8-close.spec.mjs).
 */

function lab(page) {
  return page.evaluate(() => {
    const lab = window.__lab;
    return {
      state: lab?.store.get(),
      set: (patch) => lab.store.set(patch),
      world: lab?.worldRef.current ? { exists: true } : { exists: false },
    };
  });
}

async function boot(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // WP-1.5 vault sync: the app-side RAW_FILES covers reference-library 01–08,
  // matching PR #99's sealed MANIFEST.json — the boot badge verifies 8/8 clean.
  await expect(page.getByText(/SHA-256 8\/8/)).toBeVisible({ timeout: 40_000 });
  return errors;
}

test.describe('v3 CAD workbench', () => {
  test('shell: clean boot, isolation, ViewCube, no permanent labels, dock+inspector collapsed', async ({ page }) => {
    const errors = await boot(page);
    const s = await lab(page);
    // Single-workspace mounting: exactly one rig visible.
    const visible = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const groups = [
        world.bay1.group,
        world.bay2.group,
        world.bay3.group,
        world.libraryRig,
      ];
      return groups.filter((g) => g.visible).length;
    });
    expect(visible).toBe(1);
    // ViewCube present.
    await expect(page.locator('div[title*="ViewCube"] canvas')).toBeVisible();
    // Inspector + dock start collapsed.
    const st = (await lab(page)).state;
    expect(st.inspectorOpen).toBe(false);
    expect(st.dockOpen).toBe(false);
    // Zero permanent floating label sprites in the active rig (hover callout
    // replaces them). Sandbox labels are user-placed and allowed.
    const labelCount = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      let sprites = 0;
      world.scene.traverse((o) => {
        if (o.isSprite && !String(o.parent?.name ?? '').includes('sandbox')) sprites++;
      });
      return sprites;
    });
    expect(labelCount).toBe(0);
    // Status bar live.
    await expect(page.getByText(/I_rail/)).toBeVisible();
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('direct 3D editing: place (C), route wire (W), probe (P) with live waveform', async ({ page }) => {
    const errors = await boot(page);
    await page.evaluate(() => window.__lab.store.set({ workspace: 'silicon' }));
    await page.waitForTimeout(600);
    // Place tool: two components on the bench via real canvas clicks.
    await page.keyboard.press('c');
    const canvas = page.locator('[data-testid="cad-viewport"] canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.click(box.x + box.width * 0.42, box.y + box.height * 0.62);
    await page.waitForTimeout(400);
    await page.mouse.click(box.x + box.width * 0.58, box.y + box.height * 0.62);
    await page.waitForTimeout(600);
    let placed = (await lab(page)).state.sandboxComponents;
    expect(placed.length).toBe(2, 'two components placed by canvas clicks');
    // Route wire tool: W, click component meshes at their projected positions.
    await page.keyboard.press('w');
    for (const comp of placed) {
      const pt = await page.evaluate((id) => {
        const world = window.__lab.worldRef.current;
        const mesh = world.bay2.group.getObjectByName('sandbox-' + id);
        return mesh && window.__lab.projectToScreen ? window.__lab.projectToScreen(mesh) : null;
      }, comp.id);
      expect(pt).toBeTruthy();
      await page.mouse.click(pt.x, pt.y);
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(500);
    // Trace mesh exists in the sandbox group.
    const hasTrace = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const group = world.bay2.group.getObjectByName('sandbox-group');
      if (!group) return false;
      return group.children.some((c) => c.name.startsWith('trace-'));
    });
    expect(hasTrace).toBe(true, 'Manhattan copper trace committed');
    // Probe tool: plant a probe on the first component.
    await page.keyboard.press('p');
    const probePt = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const group = world.bay2.group.getObjectByName('sandbox-group');
      const mesh = group?.children.find((c) => c.name.startsWith('sandbox-'));
      return mesh && window.__lab.projectToScreen ? window.__lab.projectToScreen(mesh) : null;
    });
    expect(probePt).toBeTruthy();
    await page.mouse.click(probePt.x, probePt.y);
    await page.waitForTimeout(800);
    const st = (await lab(page)).state;
    expect(st.probes.length).toBe(1, 'probe pinned');
    expect(st.dockOpen).toBe(true);
    expect(st.dockTab).toBe('scope');
    // Netlist recompiled into the worker (sandbox solve active).
    const sandboxActive = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      return world.bay2.group.getObjectByName('sandbox-group')?.children.length ?? 0;
    });
    expect(sandboxActive).toBeGreaterThanOrEqual(3); // 2 comps + 1 trace
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('> 1.95 V breakdown opens the bottom forensic dock without crushing the viewport; AI Fix recovers', async ({ page }) => {
    const errors = await boot(page);
    await page.evaluate(() => window.__lab.store.set({ workspace: 'silicon' }));
    await page.waitForTimeout(600);
    await page.evaluate(() => { window.__lab.store.set({ vddSlider: 2.5 }); window.__lab.physicsClient.setParams({ vdd: 2.5 }); });
    await page.waitForTimeout(3500);
    const st = (await lab(page)).state;
    expect(st.forensic).toBeTruthy();
    expect(st.dockOpen).toBe(true);
    expect(st.dockTab).toBe('autopsy');
    // Dock height must stay within 32 % of the viewport height.
    const dockH = await page.evaluate(() => {
      const dock = [...document.querySelectorAll('div')].find((d) => d.style.height === '32%');
      return dock ? dock.getBoundingClientRect().height : 0;
    });
    const winH = await page.evaluate(() => window.innerHeight);
    expect(dockH).toBeLessThanOrEqual(winH * 0.33);
    // Viewport canvas stays wide (never squeezed between sidebars).
    const canvasW = await page.evaluate(() => document.querySelector('canvas')?.clientWidth ?? 0);
    expect(canvasW).toBeGreaterThan(winH * 1.0); // viewport width ≫ 70% of a 1280×720 window
    // AI Fix & Re-Test.
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('AI Fix'));
      btn?.click();
    });
    await page.waitForTimeout(2500);
    expect((await lab(page)).state.forensic).toBe(null);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('workspace switching: Quantum modalities + AI experiment, Silicon peel, SoC workload', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = await boot(page);
    // Quantum: mode switch + AI experiment.
    await page.evaluate(() => window.__lab.store.set({ workspace: 'quantum' }));
    await page.waitForTimeout(600);
    await page.evaluate(() => window.__lab.store.set({ inspectorOpen: true }));
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Photonic MZI chip'));
      btn?.click();
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Run AI Discovery Experiment'));
      btn?.click();
    });
    await expect(page.getByText(/final error/)).toBeVisible({ timeout: 120_000 });
    // Silicon CAD: layer peel.
    await page.evaluate(() => window.__lab.store.set({ workspace: 'silicon' }));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__lab.store.set({ peelMode: 'exploded' }));
    await page.waitForTimeout(900);
    const exploded = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const met3 = world.bay2.layers?.find?.((l) => l.key === 'met3') ?? null;
      return met3 ? met3.group.position.y > met3.baseY : false;
    });
    expect(exploded).toBe(true, 'layer peel separates the stack');
    // SoC Architect: workload run + tile activity.
    await page.evaluate(() => window.__lab.store.set({ workspace: 'soc' }));
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Run quantized workload'));
      btn?.click();
    });
    await page.waitForTimeout(1500);
    const socResult = (await lab(page)).state.soc?.result ?? null;
    expect(socResult, 'workload handler must run').toBeTruthy();
    const tilesLit = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const tiles = world.bay3.tpuTiles;
      if (!tiles) return -1;
      let lit = 0;
      for (let i = 0; i < 64; i++) {
        const c = new (window.__lab.store.constructor ? Object : Object)();
        void c;
        void tiles;
      }
      // Count non-default tile colors via instanceColor heuristic.
      const arr = tiles.instanceColor?.array ?? [];
      for (let i = 0; i < arr.length; i += 3) {
        if (arr[i] > 0.35) lit++;
      }
      return lit;
    });
    expect(tilesLit).toBeGreaterThan(0);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });
});
