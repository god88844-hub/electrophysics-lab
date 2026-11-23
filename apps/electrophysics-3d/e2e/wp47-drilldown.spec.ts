import { expect, test, type Page } from '@playwright/test';

import type { TileSelection } from '../src/bays/bay3Soc.js';
import type { CellOperatingPoint } from '../src/bays/soc/tileDrilldown.js';

async function bootSoc(page: Page) {
  await page.goto('/');
  await expect(page.getByText(/SHA-256 8\/8/)).toBeVisible();
  await page.evaluate(() => window.__lab!.store.set({ workspace: 'soc', inspectorOpen: true }));
  await page.waitForFunction(() => window.__lab!.worldRef.current?.bay3.tileScreenAnchor('cpu'));
}

async function pickTile(page: Page, id: string): Promise<TileSelection> {
  // Leave the whole viewport clickable, even for the GPU at the right edge.
  await page.getByTitle('Close (Esc)', { exact: true }).click();
  await expect.poll(async () => page.evaluate((tileId) => {
    const anchor = window.__lab!.worldRef.current!.bay3.tileScreenAnchor(tileId);
    return Boolean(anchor?.visible && document.elementFromPoint(anchor.x, anchor.y) instanceof HTMLCanvasElement);
  }, id)).toBe(true);
  const point = await page.evaluate((tileId) => window.__lab!.worldRef.current!.bay3.tileScreenAnchor(tileId)!, id);
  await page.mouse.click(point.x, point.y);
  await expect.poll(() => page.evaluate(() => window.__lab!.worldRef.current!.bay3.getSelection()?.tileId)).toBe(id);
  await page.evaluate(() => window.__lab!.store.set({ inspectorOpen: true }));
  return page.evaluate(() => window.__lab!.worldRef.current!.bay3.getSelection()!);
}

test('picks CPU, GPU and Unified Memory in 3D and reads solver-backed stress', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await bootSoc(page);
  for (const [id, cell] of [['cpu', 'q4_inv'], ['gpu', 'q4_mux4'], ['mem', 'q4_thresh_det']]) {
    await pickTile(page, id);
    const stress = page.getByTestId('wp47-stress-panel');
    await expect(page.getByTestId('wp47-selected-tile')).toContainText(`(${id})`);
    await expect(stress).toContainText('SIMULATED_PHYSICS_MODEL');
    await expect(stress).toContainText('1.95 V');
    await expect(stress).toContainText('125 °C');
    await expect(stress).toContainText('200 °C');
    await expect(stress).toContainText("Black's EM");
    await expect(page.getByTestId('wp47-representative-cell')).toContainText(cell);
    await expect(page.getByTestId('wp47-device-solve')).toContainText('VDS');
  }
  // Default powerScale is 0.5. A fresh acknowledgement from the real worker
  // changes the memory-zone power used for both stress and the bench load.
  await expect(page.getByTestId('wp47-stress-panel')).toContainText('Zone power 1.05 W');
  await page.evaluate(() => window.__lab!.physicsClient!.setParams({ tilePowerScale: 2 }));
  await expect(page.getByTestId('wp47-stress-panel')).toContainText('Zone power 4.20 W');
  expect(errors).toEqual([]);
});

test('picks a TPU MAC instance after a workload and labels the Fourier zone resolution', async ({ page }) => {
  await bootSoc(page);
  await page.getByRole('button', { name: 'Run quantized workload' }).click();
  const selected = await pickTile(page, 'tpu-tile-2-3');
  expect(selected).toMatchObject({ kind: 'tpu-tile', chipletId: 'tpu', instanceIndex: 19 });
  await expect(page.getByTestId('wp47-stress-panel')).toContainText('q4_half_adder');
  await expect(page.getByTestId('wp47-stress-panel')).toContainText('MAC workload magnitude');
  await expect(page.getByTestId('wp47-stress-panel')).toContainText('resolved for the TPU die zone');
});

test('hands the solved cell and load to Silicon CAD while the same runner retains its packets', async ({ page }) => {
  await bootSoc(page);
  await pickTile(page, 'cpu');
  await page.getByTestId('wp47-drilldown').click();
  await expect(page.getByTestId('wp47-drilled')).toContainText('dissipation');
  await page.getByTestId('soc-play').click();
  await expect.poll(() => page.evaluate(() => window.__lab!.worldRef.current!.bay3.livePacketStats().emitted)).toBeGreaterThan(0);
  const before = await page.evaluate(() => {
    const lab = window.__lab!;
    const bay = lab.worldRef.current!.bay3;
    Object.assign(window, { wp47Runner: bay.getLiveRunner() });
    return { vdd: lab.physicsClient!.latest!.vdd, emitted: bay.livePacketStats().emitted };
  });
  await page.getByTestId('wp47-open-cell').click();
  await expect.poll(() => page.evaluate(() => window.__lab!.store.get().workspace)).toBe('silicon');
  const after = await page.evaluate(() => {
    const world = window.__lab!.worldRef.current!;
    const inspection = world.bay2.group.getObjectByName('wp47-representative-cell');
    return {
      point: inspection?.userData.operatingPoint as CellOperatingPoint | undefined,
      geometry: Boolean(inspection?.children[0]?.children.length),
      sameRunner: world.bay3.getLiveRunner() === (window as unknown as { wp47Runner: unknown }).wp47Runner,
      emitted: world.bay3.livePacketStats().emitted,
      selected: world.bay3.getSelection()?.tileId,
    };
  });
  expect(after.point).toMatchObject({ tileId: 'cpu', cell: 'q4_inv', vddV: before.vdd });
  expect(after.point!.junctionTempC).toBeGreaterThan(0);
  expect(after.point!.zonePowerW).toBeGreaterThan(0);
  expect(after.point!.loadOhm).toBeGreaterThan(0);
  expect(after.geometry).toBe(true);
  expect(after.sameRunner).toBe(true);
  expect(after.emitted).toBeGreaterThanOrEqual(before.emitted);
  expect(after.selected).toBe('cpu');
});

test('records a thermal runaway from real Fourier steps in the forensic dock', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await bootSoc(page);
  await pickTile(page, 'gpu');
  await expect(page.getByTestId('wp47-stress-panel')).toBeVisible();
  // Step a controlled overload through the real Fourier worker. The
  // GPU center needs diffusion from the neighboring heated cells.
  await page.evaluate(() => {
    const client = window.__lab!.physicsClient!;
    client.pauseSimulation();
    client.setParams({ tilePowerScale: 1700 });
    for (let step = 0; step < 32; step++) client.stepOnce();
  });
  await expect(page.getByTestId('wp47-verdict')).toContainText('RUNAWAY');
  expect(errors).toEqual([]);
  await expect(page.getByRole('button', { name: /Forensic Autopsy.*si_thermal_runaway/ })).toBeVisible();
  const failure = await page.evaluate(() => window.__lab!.store.get().forensic!.report.failure);
  expect(failure).toMatchObject({ type: 'si_thermal_runaway', node: 'gpu', threshold: 200 });
  expect(failure.value).toBeGreaterThanOrEqual(200);
});
