import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function boot(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('cad-viewport').locator('canvas')).toBeVisible();
  await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible();
}

async function chooseWorkspace(page: Page, name: string) {
  await page.getByTitle('Workspace: ' + name).click();
}

async function openInspector(page: Page) {
  // The workbench test seam opens the inspector. The real producer button
  // still runs the worker or architectural benchmark.
  await page.evaluate(() => window.__lab!.store.set({ inspectorOpen: true }));
}

async function exportFrom(page: Page, source: string) {
  await page.getByRole('button', { name: 'Experiment bundles', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Experiment bundles' });
  const downloadEvent = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Export ' + source }).click();
  await expect(dialog.getByRole('status', { name: 'Bundle status' })).toHaveText('Experiment bundle exported.');
  const download = await downloadEvent;
  const bytes = await readFile(await download.path());
  const original = JSON.parse(bytes.toString('utf8'));
  await expect(dialog.getByLabel('Bundle SHA-256')).toHaveText(original.sha256);

  await dialog.getByLabel('Bundle JSON file').setInputFiles({
    name: download.suggestedFilename(), mimeType: 'application/json', buffer: bytes,
  });
  await expect(dialog.getByRole('status', { name: 'Bundle status' })).toHaveText('SHA-256 seal verified. Ready to replay.');
  await dialog.getByRole('button', { name: 'Replay bundle' }).click();
  await expect(dialog.getByRole('status', { name: 'Bundle status' })).toHaveText('Replay matched the original metrics and SHA-256 seal.');
  await expect(dialog.getByLabel('Bundle SHA-256')).toHaveText(original.sha256);
  await expect(dialog.getByLabel('Experiment scores')).toHaveText(original.initialFidelity + ' → ' + original.optimizedFidelity);
  const replayDownload = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download bundle JSON' }).click();
  const output = await readFile(await (await replayDownload).path());
  expect(output.equals(bytes)).toBe(true);
  expect(JSON.parse(output.toString()).metrics).toEqual(original.metrics);
  return { dialog, original, bytes };
}

test('live fixed-seed Co-Inventor round trip reproduces bytes and refuses a single-byte tamper', async ({ page }) => {
  await boot(page);
  await openInspector(page);
  await page.getByRole('button', { name: 'Run AI Discovery Experiment' }).click();
  await expect(page.getByText(/final error/)).toBeVisible();
  const { dialog, original, bytes } = await exportFrom(page, 'Quantum Co-Inventor');
  expect(original.badge).toBe('SIMULATED_NOISY_MODEL');
  expect(original.reproducibility.codeVersion).toMatch(/^[a-f0-9]{40}$/);
  expect(original.seed).toBe(20241119);
  expect(original.artifacts[0].filename).toBe('transmon-target.qasm');
  expect(original.artifacts[0].text).toMatch(/^OPENQASM 3\.0;/);

  const edited = Buffer.from(bytes);
  const seed = Buffer.from('"seed":20241119');
  const index = edited.indexOf(seed);
  expect(index).toBeGreaterThan(-1);
  edited[index + seed.length - 1] = '8'.charCodeAt(0);
  expect(edited.filter((byte, position) => byte !== bytes[position])).toHaveLength(1);
  await dialog.getByLabel('Bundle JSON file').setInputFiles({
    name: 'tampered.json', mimeType: 'application/json', buffer: edited,
  });
  await expect(dialog.getByRole('alert')).toContainText('SHA-256 seal mismatch');
  await expect(dialog.getByRole('button', { name: 'Replay bundle' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Download bundle JSON' })).toHaveCount(0);
  expect(await page.evaluate(() => window.__lab!.store.get().quantumExp.bundle?.seed)).toBe(20241119);
});

test('live Silicon autopsy exports a sealed SPICE waveform and re-evaluates the original failure', async ({ page }) => {
  await boot(page);
  await chooseWorkspace(page, 'Silicon CAD');
  await page.evaluate(() => {
    window.__lab!.store.set({ vddSlider: 2.5 });
    window.__lab!.physicsClient!.setParams({ vdd: 2.5 });
  });
  await expect(page.getByRole('button', { name: /Forensic Autopsy — gate_oxide_breakdown/ })).toBeVisible();
  const { original } = await exportFrom(page, 'Silicon Forensics');
  expect(original.badge).toBe('SIMULATED_PHYSICS_MODEL');
  expect(original.metrics.failure.type).toBe('gate_oxide_breakdown');
  expect(original.academyEvidence.missionId).toBe('M2-OXIDE-SOA');
  expect(original.metrics.failure.value).toBeGreaterThan(original.metrics.failure.threshold);
  expect(original.artifacts[0].filename).toBe('silicon-captured-voltages.cir');
  expect(original.artifacts[0].text).toContain('V_vdd vdd 0 ');
});

test('live SoC workload round trip recomputes the matrix result and architectural metrics', async ({ page }) => {
  await boot(page);
  await chooseWorkspace(page, 'SoC Architect');
  await openInspector(page);
  await page.getByRole('button', { name: 'Run quantized workload' }).click();
  await expect(page.getByText(/TPU cycles/)).toBeVisible();
  const { original } = await exportFrom(page, 'SoC Architecture');
  expect(original.badge).toBe('SIMULATED_ARCHITECTURAL_MODEL');
  expect(original.metrics.observed.macOps).toBe(32 ** 3);
  expect(original.academyEvidence.missionId).toBe('M6-TPU-GEMM');
  expect(original.metrics.outputSha256).toMatch(/^[a-f0-9]{64}$/);
  expect(original.metrics.comparison.discreteInt8.totalCycles).toBeGreaterThan(original.metrics.comparison.unifiedInt8.totalCycles);
});
