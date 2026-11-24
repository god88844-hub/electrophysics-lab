import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const ids = [
  'M1-MOSFET-IV', 'M2-OXIDE-SOA', 'M3-CU-FUSING', 'M4-Q4-INVERTER', 'M5-CUSTOM-IC',
  'M6-TPU-GEMM', 'M7-UNIFIED-MEMORY', 'M8-DVFS-THERMAL', 'M9-LINDBLAD-DECAY',
  'M10-CRYO-QUENCH', 'M11-SURFACE-CODE',
];
const drawer = (page: Page) => page.getByRole('region', { name: 'Guided Academy' });
const academy = (page: Page) => page.getByRole('button', { name: 'Academy', exact: true });

async function boot(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(academy(page)).toBeVisible();
  await expect(drawer(page)).toHaveCount(0);
  await academy(page).click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page).getByTestId(/^academy-mission-/)).toHaveCount(11);
  return errors;
}

async function grade(page: Page, id: string, change?: { name: string; value: string }) {
  await drawer(page).getByTestId('academy-mission-' + id).click();
  if (change) await drawer(page).getByRole('spinbutton', { name: change.name }).fill(change.value);
  await drawer(page).getByRole('button', { name: 'Grade current workspace' }).click();
  const verdict = drawer(page).getByTestId('academy-verdict');
  await expect(verdict).toBeVisible();
  return verdict;
}

test('collapsed drawer verifies all missions and dismisses with both controls', async ({ page }) => {
  const errors = await boot(page);
  for (const id of ids) await expect(drawer(page).getByTestId('academy-mission-' + id)).toHaveCount(1);
  const bounds = await drawer(page).boundingBox();
  expect(bounds!.width * bounds!.height).toBeLessThan(1280 * 720 * 0.20);
  await drawer(page).getByRole('button', { name: 'Close Academy' }).click();
  await expect(drawer(page)).toHaveCount(0);
  await expect(academy(page)).toBeFocused();
  await academy(page).click();
  await page.keyboard.press('Escape');
  await expect(drawer(page)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('live M2 fails at nominal bias, passes SOA and clean fix, and persists in a sealed project', async ({ page }) => {
  const errors = await boot(page);
  const failed = await grade(page, ids[1], { name: 'Rail voltage (V)', value: '1.8' });
  await expect(failed.getByText('Criteria not met')).toBeVisible();
  await expect(failed.getByText('SIMULATED_PHYSICS_MODEL')).toBeVisible();
  await expect(drawer(page).getByText('0/11 complete')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__lab?.store.get().workspace)).toBe('silicon');
  await drawer(page).getByRole('spinbutton', { name: 'Rail voltage (V)' }).fill('2.5');
  await drawer(page).getByRole('button', { name: 'Grade current workspace' }).click();
  await expect(drawer(page).getByTestId('academy-verdict').getByText('Passed', { exact: true })).toBeVisible();
  await expect(drawer(page).getByText('1/11 complete')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    page.getByRole('button', { name: 'Save', exact: true }).click(),
  ]);
  const path = await download.path();
  const fileBytes = await readFile(path!);
  const payload = JSON.parse(fileBytes.toString('utf8'));
  expect(payload.experiments).toEqual([{
    format: 'invention-lab/academy-progress/1',
    curriculumSeal: expect.stringMatching(/^[a-f0-9]{64}$/),
    missions: { [ids[1]]: 'pass' },
  }]);
  expect(payload.integrity.payloadSHA256).toMatch(/^[a-f0-9]{64}$/);

  // A new browser context has no autosave from the first grading session.
  const browser = page.context().browser()!;
  await page.close();
  const clean = await browser.newContext();
  try {
    const restored = await clean.newPage();
    const restoreErrors = await boot(restored);
    await expect(drawer(restored).getByText('0/11 complete')).toBeVisible();
    const [picker] = await Promise.all([
      restored.waitForEvent('filechooser', { timeout: 20_000 }),
      restored.getByRole('button', { name: 'Open', exact: true }).click(),
    ]);
    await picker.setFiles({ name: 'academy.eplab', mimeType: 'application/json', buffer: fileBytes });
    await expect(drawer(restored).getByText('1/11 complete')).toBeVisible();
    await expect(drawer(restored).getByTestId('academy-mission-' + ids[1]).getByText('Passed')).toBeVisible();
    expect(restoreErrors).toEqual([]);
  } finally {
    await clean.close();
  }
  expect(errors).toEqual([]);
});

test('every mission reaches the grader through its real workspace engine', async ({ page }) => {
  test.setTimeout(420_000);
  const errors = await boot(page);
  const panel = drawer(page);
  for (const id of ids) {
    await test.step(id, async () => {
      await panel.getByTestId('academy-mission-' + id).press('Enter');
      if (id === 'M10-CRYO-QUENCH') await panel.getByRole('spinbutton', { name: 'Mixing-stage load (mW)' }).fill('600');
      await panel.getByRole('button', { name: 'Grade current workspace' }).press('Enter');
      const verdict = panel.getByTestId('academy-verdict');
      await expect(verdict).toBeVisible();
      await expect(verdict.getByText('Passed', { exact: true }), id + ' evidence: ' + await verdict.innerText()).toBeVisible();
      if (id === 'M5-CUSTOM-IC') await expect(panel.getByRole('button', { name: 'Download custom IC' })).toBeVisible();
    });
  }
  await expect(drawer(page).getByText('11/11 complete')).toBeVisible();
  expect(errors).toEqual([]);
});
