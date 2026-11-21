import { test, expect, type Page } from '@playwright/test';

/**
 * WP-2.5 — Direct 3D schematic editing + Manhattan routing on kernel netlists.
 *
 * Drives the REAL workbench: palette placement → 3D Manhattan Route Wire (W)
 * two-click flow → 3D Probe (P) → Ctrl+Z undo → Ctrl+Y redo, asserting that
 * every direct edit compiles into the ep-circuit-compatible netlist with the
 * ρ(T)·L/(w·t) copper parasitic R in the solve, that the ≤ 64 nodes /
 * ≤ 32 V-sources admission cap refuses honestly at the edit level, and that
 * probe pins read the solver-frame envelope per node. The grid-snapped ghost
 * preview and the WP-3.4 polygon viewer are preserved (asserted, not modified).
 */

interface LabState {
  sandboxComponents: Array<{ id: string; kind: string; nodes: string[]; position: [number, number] }>;
  wires: Array<{ from: string; to: string }> | undefined;
  probes: Array<{ id: number; targetId: string; color: string }>;
  activeTool: string;
  pendingWireFrom: string | null;
  workspace: string;
  vddSlider: number;
}

interface EditHooks {
  compileCount: number;
  refusalCount: number;
  lastSpec: { components: Array<{ id: string; kind: string }>; wires: Array<{ from: string; to: string }> } | null;
  lastMirror: {
    format: string;
    nodeNames: string[];
    elements: Array<{ kind: string; label: string | null; nodes: number[]; r?: number; v?: number; mosfet?: { type: string } }>;
  } | null;
  lastAdmission: { admitted: boolean; reason?: string } | null;
  parasitics: Array<{ wire: { from: string; to: string }; resistanceOhm: number; lengthUm: number; tempK: number }>;
  droppedWires: Array<{ wire: { from: string; to: string }; reason: string }>;
  probeFrames: Array<{ pid: number; node: string; value: number; frameId: number; badge: string; frameRead: boolean }>;
  pinCount: number;
}

interface LabHooks {
  store: { get: () => LabState; set: (p: Partial<LabState>) => void };
  worldRef: { current: { bay2: { group: { children: Array<{ name: string }>; getObjectByName(n: string): { name: string } | undefined } }; polyCellViewer: unknown } | null };
  physicsClient?: { latest: { nodes: Record<string, number>; t: number } | null };
  history?: { canUndo: (ws: string) => boolean; canRedo: (ws: string) => boolean; undoDepth: (ws: string) => number; redoDepth: (ws: string) => number };
  siliconEdit?: EditHooks;
  projectToScreen?: (obj: unknown) => { x: number; y: number };
}

async function lab(page: Page): Promise<{ state: LabState; siliconEdit?: EditHooks; history?: { canUndo: boolean; canRedo: boolean; undoDepth: number; redoDepth: number } }> {
  return page.evaluate(() => {
    const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
    const ws = lab.store.get().workspace;
    const h = lab.history;
    return {
      state: lab.store.get(),
      siliconEdit: lab.siliconEdit
        ? {
            compileCount: lab.siliconEdit.compileCount,
            refusalCount: lab.siliconEdit.refusalCount,
            lastSpec: lab.siliconEdit.lastSpec,
            lastMirror: lab.siliconEdit.lastMirror,
            lastAdmission: lab.siliconEdit.lastAdmission,
            parasitics: [...lab.siliconEdit.parasitics],
            droppedWires: [...lab.siliconEdit.droppedWires],
            probeFrames: [...lab.siliconEdit.probeFrames].map(([pid, v]) => ({ pid, ...v })),
            pinCount: lab.siliconEdit.pinCount,
          }
        : undefined,
      history: h
        ? { canUndo: h.canUndo(ws), canRedo: h.canRedo(ws), undoDepth: h.undoDepth(ws), redoDepth: h.redoDepth(ws) }
        : undefined,
    };
  });
}

/** Click the viewport position of a placed component's 3D mesh. */
async function clickComponent(page: Page, id: string): Promise<void> {
  const pt = await page.evaluate((compId) => {
    const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
    const mesh = lab.worldRef.current?.bay2.group.getObjectByName('sandbox-' + compId);
    if (!mesh) return null;
    return lab.projectToScreen!(mesh);
  }, id);
  expect(pt, `mesh sandbox-${id} must be on screen`).not.toBeNull();
  await page.mouse.click(pt!.x, pt!.y);
}

/** Latest physics snapshot node voltage (raw solver readout). */
async function nodeVoltage(page: Page, node: string): Promise<number | null> {
  return page.evaluate((n) => {
    const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
    return lab.physicsClient?.latest?.nodes?.[n] ?? null;
  }, node);
}

async function boot(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // WP-1.3/WP-1.5 boot contract: SHA-256 8/8 badge (merged reference vault).
  await expect(page.getByText(/SHA-256 8\/8/)).toBeVisible({ timeout: 40_000 });
  return errors;
}

test.describe('WP-2.5 — direct 3D editing on kernel netlists', () => {
  test('place → Manhattan route → probe → Ctrl+Z → Ctrl+Y with live ρ(T) parasitics', async ({ page }) => {
    test.setTimeout(300_000); // boot + full place/route/probe/undo/redo chain
    const errors = await boot(page);
    await page.evaluate(() => window.__lab!.store.set({ workspace: 'silicon', inspectorOpen: true, sandboxOpen: true }));
    await expect(page.getByText('SANDBOX WORKBENCH')).toBeVisible();

    // --- Place: supply rail (palette) + load resistor through the REAL 3D
    // Place (C) tool — the 3D place path stamps the resistor with its
    // drain/gnd pins, forming a real divider once routed to the rail. ---
    await page.evaluate(() => {
      const rail = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('+ rail'));
      rail?.click();
    });
    await expect.poll(async () => (await lab(page)).state.sandboxComponents.length).toBe(1);
    await page.evaluate(() => window.__lab!.store.set({ placingKind: 'resistor' }));
    await page.keyboard.press('c');
    expect((await lab(page)).state.activeTool).toBe('place');
    const canvasBox = await page.locator('canvas').first().boundingBox();
    await page.mouse.click(canvasBox!.x + canvasBox!.width * 0.62, canvasBox!.y + canvasBox!.height * 0.55);
    await expect.poll(async () => (await lab(page)).state.sandboxComponents.length).toBe(2);
    const afterPlace = await lab(page);
    expect(afterPlace.history!.canUndo).toBe(true, 'PlaceComponent recorded on the WP-1.4 stack');
    expect(afterPlace.state.sandboxComponents.map((c) => c.id).sort()).toEqual(['rail_0', 'resistor_1']);
    const placedResistor = afterPlace.state.sandboxComponents.find((c) => c.id === 'resistor_1')!;
    expect(placedResistor.nodes).toEqual(['drain', 'gnd'], '3D-placed resistor pins');
    expect(placedResistor.position).not.toEqual([0, 0], 'placed away from the rail');

    // The WP-2.5 compile pipeline has run for the placed bench (admitted).
    await expect
      .poll(async () => (await lab(page)).siliconEdit?.compileCount ?? 0)
      .toBeGreaterThan(0);
    const placed = await lab(page);
    expect(placed.siliconEdit!.lastAdmission!.admitted).toBe(true);
    expect(placed.siliconEdit!.lastMirror!.format).toBe('ep-circuit/netlist@1');
    expect(placed.siliconEdit!.lastMirror!.nodeNames[0]).toBe('gnd_sb', 'kernel ground-reference contract');

    // --- Manhattan Route Wire (W): two 3D clicks rail → resistor. ---
    await page.keyboard.press('w');
    expect((await lab(page)).state.activeTool).toBe('wire');
    await clickComponent(page, 'rail_0');
    await expect.poll(async () => (await lab(page)).state.pendingWireFrom).toBe('rail_0');
    await clickComponent(page, 'resistor_1');
    await expect.poll(async () => (await lab(page)).state.wires?.length ?? 0).toBe(1);
    const routed = await lab(page);
    expect(routed.state.wires![0]).toEqual({ from: 'rail_0', to: 'resistor_1' });
    expect(routed.history!.undoDepth).toBeGreaterThanOrEqual(1, 'RouteWire pushed onto the WP-1.4 stack');
    expect(routed.siliconEdit!.droppedWires).toEqual([]);

    // The trace mesh exists (inside the sandbox-group) and the compile
    // carries the copper parasitic.
    const meshNames = await page.evaluate(() => {
      const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
      const group = lab.worldRef.current!.bay2.group.getObjectByName('sandbox-group');
      return group ? group.children.map((c) => c.name) : [];
    });
    expect(meshNames).toContain('trace-rail_0-resistor_1');
    await expect
      .poll(async () => (await lab(page)).siliconEdit!.parasitics.length)
      .toBe(1);
    const paras = (await lab(page)).siliconEdit!.parasitics[0];
    expect(paras.resistanceOhm).toBeGreaterThan(0);
    expect(paras.lengthUm).toBeGreaterThan(0);
    expect(paras.tempK).toBeGreaterThan(0);
    const traceEls = (await lab(page)).siliconEdit!.lastMirror!.elements.filter((e) => e.kind === 'R' && (e.label ?? '').startsWith('TRACE'));
    expect(traceEls.length).toBe(1, 'the routed wire compiles as a copper TRACE resistor');
    expect(traceEls[0].r).toBeCloseTo(paras.resistanceOhm, 9);
    // The pins stay separate nodes (resistive connection, not a union).
    expect((await lab(page)).siliconEdit!.lastMirror!.nodeNames).toContain('vdd');
    expect((await lab(page)).siliconEdit!.lastMirror!.nodeNames).toContain('drain');

    // The parasitic R is IN the solve: drain = V·RL/(RL+R_trace) < V exactly.
    const railV = (await lab(page)).state.vddSlider;
    const expectedDrain = (railV * 100000) / (100000 + paras.resistanceOhm);
    await expect
      .poll(async () => nodeVoltage(page, 'drain'), { timeout: 20_000 })
      .toBeLessThan(railV);
    const drain = await nodeVoltage(page, 'drain');
    expect(drain!).toBeGreaterThan(expectedDrain - 1e-6);
    expect(drain!).toBeLessThan(expectedDrain + 1e-6);

    // --- Probe (P): 3D pin on the resistor + kernel-frame read per node. ---
    await page.keyboard.press('p');
    expect((await lab(page)).state.activeTool).toBe('probe');
    await clickComponent(page, 'resistor_1');
    await expect.poll(async () => (await lab(page)).state.probes.length).toBe(1);
    await expect.poll(async () => (await lab(page)).siliconEdit!.pinCount).toBe(1);
    const probeId = (await lab(page)).state.probes[0].id;
    const pinMeshes = await page.evaluate(() => {
      const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
      return lab.worldRef.current!.bay2.group.children
        .filter((c) => c.name.startsWith('probe-pin-'))
        .map((c) => c.name);
    });
    expect(pinMeshes).toContain(`probe-pin-${probeId}`);
    // The probe reads the junction pin through the solver-frame envelope.
    await expect
      .poll(async () => (await lab(page)).siliconEdit!.probeFrames.find((f) => f.pid === probeId)?.frameRead ?? false)
      .toBe(true);
    const frame = (await lab(page)).siliconEdit!.probeFrames.find((f) => f.pid === probeId)!;
    expect(frame.node).toBe('drain', 'probe resolves the component junction pin');
    expect(frame.frameId).toBeGreaterThan(0);
    expect(frame.badge).toBe('SIMULATED_PHYSICS_MODEL');
    expect(frame.value).toBeGreaterThan(expectedDrain - 1e-6);
    expect(frame.value).toBeLessThan(expectedDrain + 1e-6);

    // --- Ctrl+Z: undo the route — wire, mesh, compile and solve all revert. ---
    const compilesBeforeUndo = (await lab(page)).siliconEdit!.compileCount;
    await page.keyboard.press('Control+z');
    await expect.poll(async () => (await lab(page)).state.wires?.length ?? 0).toBe(0);
    await expect.poll(async () => (await lab(page)).siliconEdit!.compileCount).toBeGreaterThan(compilesBeforeUndo);
    const undone = await lab(page);
    expect(undone.siliconEdit!.parasitics.length).toBe(0, 'parasitic gone after undo');
    expect(undone.siliconEdit!.lastMirror!.elements.filter((e) => (e.label ?? '').startsWith('TRACE')).length).toBe(0);
    expect(undone.history!.canRedo).toBe(true);
    await expect.poll(async () => nodeVoltage(page, 'drain')).toBeLessThan(1e-6, 'unwired drain has no source');

    // --- Ctrl+Y: redo restores route, parasitic and solve exactly. ---
    await page.keyboard.press('Control+y');
    await expect.poll(async () => (await lab(page)).state.wires?.length ?? 0).toBe(1);
    await expect.poll(async () => (await lab(page)).siliconEdit!.parasitics.length).toBe(1);
    const redone = (await lab(page)).siliconEdit!.parasitics[0];
    expect(redone.resistanceOhm).toBeCloseTo(paras.resistanceOhm, 12, 'redo reproduces the same ρ(T) parasitic');
    await expect.poll(async () => nodeVoltage(page, 'drain')).toBeGreaterThan(expectedDrain - 1e-6);

    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('admission cap: > 64 nodes refuses honestly at the edit level, last admitted netlist stays live', async ({ page }) => {
    test.setTimeout(300_000); // boot + bulk edit + 22-undo loop
    const errors = await boot(page);
    await page.evaluate(() => window.__lab!.store.set({ workspace: 'silicon', inspectorOpen: true, sandboxOpen: true }));
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('+ rail'));
      btn?.click();
    });
    await expect.poll(async () => (await lab(page)).state.sandboxComponents.length).toBe(1);
    await expect.poll(async () => (await lab(page)).siliconEdit!.compileCount).toBeGreaterThan(0);
    const before = await lab(page);
    const compilesBefore = before.siliconEdit!.compileCount;
    const refusalsBefore = before.siliconEdit!.refusalCount;

    // Bulk-edit past the ep-core MNA node budget: 22 three-pin cells with
    // unique node names = 66 merged nodes + ground = 67 > 64.
    await page.evaluate(() => {
      const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
      const bulk = Array.from({ length: 22 }, (_, i) => ({
        id: `cell_bulk_${i}`,
        kind: 'cmos_inv',
        nodes: [`in_bulk_${i}`, `out_bulk_${i}`, `vdd_bulk_${i}`],
        position: [(i % 5) * 0.5, Math.floor(i / 5) * 0.4] as [number, number],
      }));
      lab.store.set({ sandboxComponents: bulk });
    });
    await expect
      .poll(async () => (await lab(page)).siliconEdit!.refusalCount)
      .toBeGreaterThan(refusalsBefore);
    const refused = await lab(page);
    expect(refused.siliconEdit!.lastAdmission!.admitted).toBe(false);
    expect(refused.siliconEdit!.lastAdmission!.reason).toContain('budget is ≤ 64');
    expect(refused.siliconEdit!.compileCount).toBe(compilesBefore, 'refused edit never pushes a netlist');
    // Honest refusal surface (WP-1.6 banner, untouched file).
    await expect(page.getByTestId('admission-banner-status')).toContainText('ADM REFUSED');
    // The last ADMITTED netlist keeps solving (never a clamp, never a crash).
    await expect
      .poll(async () => nodeVoltage(page, 'vdd'))
      .toBeCloseTo((await lab(page)).state.vddSlider, 6);

    // Undo the bulk edit (22 recorded PlaceComponent commands) — the bench
    // returns to an admitted state and compiles again.
    for (let i = 0; i < 22; i++) await page.keyboard.press('Control+z');
    await expect.poll(async () => (await lab(page)).state.sandboxComponents.length).toBeLessThanOrEqual(2);
    await expect
      .poll(async () => (await lab(page)).siliconEdit!.compileCount)
      .toBeGreaterThan(compilesBefore);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('preserved surfaces: grid-snapped ghost preview + WP-3.4 polygon viewer', async ({ page }) => {
    const errors = await boot(page);
    await page.evaluate(() => window.__lab!.store.set({ workspace: 'silicon', inspectorOpen: true, sandboxOpen: true }));
    // Place tool with the pointer over the bench → grid-snapped ghost preview.
    await page.keyboard.press('c');
    const canvasBox = await page.locator('canvas').first().boundingBox();
    await page.mouse.move(canvasBox!.x + canvasBox!.width / 2, canvasBox!.y + canvasBox!.height / 2);
    const ghost = await page.evaluate(() => {
      const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
      const group = lab.worldRef.current!.bay2.group;
      for (const child of group.children) {
        const anyChild = child as unknown as {
          visible?: boolean;
          position?: { x: number; z: number };
          material?: { transparent?: boolean; opacity?: number };
          geometry?: { parameters?: { width?: number; height?: number; depth?: number } };
        };
        if (
          anyChild.visible &&
          anyChild.geometry?.parameters?.width === 0.5 &&
          anyChild.geometry?.parameters?.height === 0.16 &&
          anyChild.geometry?.parameters?.depth === 0.34 &&
          anyChild.material?.transparent
        ) {
          return { x: anyChild.position!.x, z: anyChild.position!.z, visible: true };
        }
      }
      return null;
    });
    expect(ghost, 'ghost preview mesh visible on the bench').not.toBeNull();
    // Grid-snapped: the ghost world offsets sit on the 0.35 bench grid.
    expect((ghost!.x + 2) / 0.35).toBeCloseTo(Math.round((ghost!.x + 2) / 0.35), 6);
    expect((ghost!.z + 1.4) / 0.35).toBeCloseTo(Math.round((ghost!.z + 1.4) / 0.35), 6);

    // WP-3.4 polygon viewer intact (rides the same bay, untouched).
    const viewer = await page.evaluate(() => {
      const lab = (window as unknown as { __lab?: LabHooks }).__lab!;
      const b = lab.worldRef.current?.bay2;
      return { hasViewer: Boolean(b?.polyCellViewer), hasMet3: Boolean(b?.group.getObjectByName('layer-met3')) };
    });
    expect(viewer.hasViewer).toBe(true);
    expect(viewer.hasMet3).toBe(true);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });
});
