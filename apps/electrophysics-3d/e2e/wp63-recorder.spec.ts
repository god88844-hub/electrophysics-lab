import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { replayFrameHashes, type CaptureManifest } from '../src/engine/videoRecorder';

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('cad-viewport').locator('canvas')).toBeVisible();
  await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible();
  await page.getByRole('button', { name: 'Record', exact: true }).click();
  return page.getByRole('region', { name: 'Viewport recorder' });
}

async function viewportFps(page: Page) {
  return page.evaluate(async () => {
    const start = performance.now();
    let frames = 0;
    return new Promise<number>(resolve => {
      const tick = () => {
        frames++;
        const seconds = (performance.now() - start) / 1000;
        if (seconds < 0.8) requestAnimationFrame(tick);
        else resolve(Math.round(frames / seconds));
      };
      requestAnimationFrame(tick);
    });
  });
}

async function downloadFrom(page: Page, name: string) {
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name }).click();
  const file = await download;
  return { name: file.suggestedFilename(), bytes: await readFile(await file.path()) };
}

async function manifestOf(page: Page) {
  const file = await downloadFrom(page, 'Download manifest');
  expect(file.name).toMatch(/^eplab-.+-recording\.json$/);
  const manifest = JSON.parse(file.bytes.toString()) as CaptureManifest;
  expect(manifest.provenance.badge).toBe('SIMULATED_PHYSICS_MODEL');
  expect(manifest.plan.fps).toBe(30);
  expect(manifest.plan.durationMs).toBe(30_000);
  expect(manifest.frames.length).toBeGreaterThan(0);
  expect(manifest.frames.length).toBeLessThanOrEqual(900);
  expect(manifest.provenance.frameRange).toEqual([manifest.frames[0].index, manifest.frames.at(-1)?.index]);
  expect(manifest.raster).toEqual({ width: 96, height: 54, encoding: 'RGBA8' });
  expect(manifest.frames.every(frame => /^[a-f0-9]{64}$/.test(frame.rasterSha256 ?? ''))).toBe(true);
  expect(await replayFrameHashes(manifest)).toEqual(manifest.provenance.frameSha256);
  return manifest;
}

test('cinematic capture exports genuine viewport WebM with a sealed dock sidecar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const controls = await ready(page);
  await page.waitForFunction(() => window.__lab?.store.get().physics !== null && !!window.__lab?.store.get().physics);
  const beforeFps = await viewportFps(page);
  await controls.getByRole('button', { name: 'Start cinematic recording' }).click();
  await expect(controls.getByRole('status')).toContainText('Recording viewport and dock telemetry');
  await expect(page.getByRole('button', { name: /Recording/ }).first()).toBeVisible();
  await page.waitForTimeout(2100);
  await controls.getByRole('button', { name: 'Stop recording' }).click();

  const manifest = await manifestOf(page);
  const afterFps = await viewportFps(page);
  test.info().annotations.push({ type: 'viewport FPS trend', description: beforeFps + ' before / ' + afterFps + ' after' });
  expect(manifest.plan.mode).toBe('cinematic');
  expect(manifest.provenance.workspace).toBe('quantum');
  expect(manifest.stopReason).toBe('user');
  expect(manifest.frames.length).toBeGreaterThan(2);
  expect(manifest.frames[0].camera.position).not.toEqual(manifest.frames.at(-1)?.camera.position);
  expect(manifest.frames.some(frame => frame.telemetry?.channels.some(channel => channel.id === 'vdd'
    && channel.value !== null))).toBe(true);
  expect(manifest.media.kind).toBe('webm');

  const file = await downloadFrom(page, 'Download WebM');
  expect(file.name).toBe('eplab-quantum-recording.webm');
  expect(file.bytes.subarray(0, 4).toString('hex')).toBe('1a45dfa3');
  if (manifest.media.kind === 'webm') expect(file.bytes.byteLength).toBe(manifest.media.bytes);

  const decoded = await page.evaluate(async data => {
    const bytes = Uint8Array.from(atob(data), char => char.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
    const clip = document.createElement('video');
    clip.muted = true;
    clip.playsInline = true;
    clip.style.cssText = 'position:fixed;left:-1000px;top:0;width:320px';
    document.body.append(clip);
    try {
      clip.src = url;
      await clip.play();
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('The exported WebM produced no playable frame')), 6000);
        clip.requestVideoFrameCallback(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
      clip.pause();
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(clip, 0, 0, clip.videoWidth, 472, 0, 0, 64, 32);
      const { data: raster } = ctx.getImageData(0, 0, 64, 32);
      const colors = new Set<number>();
      for (let i = 0; i < raster.length; i += 4) colors.add((raster[i] << 16) | (raster[i + 1] << 8) | raster[i + 2]);
      return { width: clip.videoWidth, height: clip.videoHeight, colors: colors.size };
    } finally {
      clip.remove();
      URL.revokeObjectURL(url);
    }
  }, file.bytes.toString('base64'));
  expect(decoded).toMatchObject({ width: 960, height: 540 });
  expect(decoded.colors).toBeGreaterThan(15);
  expect(errors).toEqual([]);
});

test('codec-free forensic capture records input changes and offers only a frame manifest', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'MediaRecorder', { value: undefined }));
  const controls = await ready(page);
  await controls.getByRole('button', { name: 'Start forensic recording' }).click();
  await expect(controls.getByRole('status')).toContainText('Recording viewport');
  await page.waitForTimeout(550);
  await page.getByRole('button', { name: 'Thermal T' }).click();
  await page.waitForTimeout(900);
  await controls.getByRole('button', { name: 'Stop recording' }).click();
  await expect(controls.getByText(/WebM encoding is unavailable/)).toBeVisible();
  await expect(controls.getByRole('link', { name: 'Download WebM' })).toHaveCount(0);
  const manifest = await manifestOf(page);
  expect(manifest.plan.mode).toBe('forensic');
  expect(manifest.media.kind).toBe('frame-sequence');
  expect(manifest.inputEvents[0].state.thermalView).toBe(false);
  expect(manifest.inputEvents.some(event => event.state.thermalView)).toBe(true);
});

test('switching workspace closes the recording at the workspace boundary', async ({ page }) => {
  const controls = await ready(page);
  await controls.getByRole('button', { name: 'Start forensic recording' }).click();
  await page.waitForTimeout(750);
  await page.getByTitle('Workspace: Silicon CAD').click();
  await expect(controls.getByRole('status')).toContainText('workspace changed');
  const manifest = await manifestOf(page);
  expect(manifest.stopReason).toBe('workspace-change');
  expect(manifest.provenance.workspace).toBe('quantum');
});


test('the 30-second deadline closes a live capture without a stop click', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'MediaRecorder', { value: undefined }));
  const controls = await ready(page);
  await controls.getByRole('button', { name: 'Start forensic recording' }).click();
  await expect(controls.getByRole('status')).toContainText('30 s max');
  await expect(controls.getByRole('link', { name: 'Download manifest' })).toBeVisible({ timeout: 40_000 });
  const manifest = await manifestOf(page);
  expect(manifest.stopReason).toBe('duration');
  expect(manifest.frames.every(frame => frame.timeUs < 30_000_000)).toBe(true);
  expect(manifest.frames.length + manifest.skippedTicks).toBe(900);
});
