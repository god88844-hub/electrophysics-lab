import { chromium, expect, test as base, type Page, type TestInfo } from '@playwright/test';

const test = base.extend<{ workbench: Page; errors: string[] }>({
  workbench: async ({ page }, use) => {
    const endpoint = process.env.EP_WP71_DESKTOP_CDP;
    if (!endpoint) return use(page);
    const browser = await chromium.connectOverCDP(endpoint);
    try {
      const nativePage = browser.contexts().flatMap((context) => context.pages())
        .find((candidate) => new URL(candidate.url()).hostname === 'tauri.localhost');
      if (!nativePage) throw Error('No running Tauri workbench in WebView2');
      await use(nativePage);
    } finally {
      await browser.close();
    }
  },
  errors: async ({ workbench }, use) => {
    const errors: string[] = [];
    const onError = (err: Error) => errors.push(err.message);
    const onMessage = (msg: { type(): string; text(): string }) => {
      if (msg.type() === 'error') errors.push(msg.text());
    };
    workbench.on('pageerror', onError);
    workbench.on('console', onMessage);
    await use(errors);
    workbench.off('pageerror', onError);
    workbench.off('console', onMessage);
    expect(errors).toEqual([]);
  },
});

async function boot(page: Page) {
  if (process.env.EP_WP71_DESKTOP_CDP) await page.reload();
  else await page.goto('/');
  await expect(page.getByText('SHA-256 8/8 ✓', { exact: true })).toBeVisible();
  await expect(page.getByTestId('cad-status-bar').getByText(/^VDD .* V$/)).toBeVisible();
}

async function sceneState(page: Page) {
  return page.evaluate(() => {
    const lab = (window as any).__lab;
    const world = lab.worldRef.current;
    const scene = world.scene;
    let visibleFlow = 0;
    let totalFlow = 0;
    let siliconOwned = 0;
    scene.traverse((object: any) => {
      if (object.isInstancedMesh && object.name.startsWith('electron-flow:')) {
        totalFlow += object.count;
        if (object.parent === world.bay2.group) siliconOwned += object.count;
      }
    });
    scene.traverseVisible((object: any) => {
      if (object.isInstancedMesh && object.name.startsWith('electron-flow:')) visibleFlow += object.count;
    });
    return {
      workspace: world.currentWorkspace,
      pmrem: scene.environment?.name,
      mapping: scene.environment?.mapping,
      toneMapping: scene.userData.toneMapping,
      studioVisible: scene.getObjectByName('studio-cyclorama')?.visible,
      frameId: lab.frame.frameId,
      badge: lab.frame.provenance.badge,
      current: lab.frame.readCurrent('RAIL'),
      live: lab.frame.live,
      playing: lab.store.get().playing,
      visibleFlow, totalFlow, siliconOwned,
      soc: world.bay3.livePacketStats(),
    };
  });
}

async function capture(page: Page, info: TestInfo, name: string) {
  await page.evaluate(async () => {
    const transitions = document.getAnimations().filter((animation) => animation instanceof CSSTransition);
    await Promise.allSettled(transitions.map((transition) => transition.finished));
  });
  const path = info.outputPath(name + '.png');
  const png = await page.screenshot({ path });
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  await info.attach(name, { path, contentType: 'image/png' });
  return png;
}

test('studio renders with PMREM and AgX while live flow stays with its workspace', async ({ workbench: page, errors }, info) => {
  await boot(page);
  const original = await sceneState(page);
  expect(original).toMatchObject({
    workspace: 'quantum', pmrem: 'studio-softbox-pmrem', mapping: 306, toneMapping: 6,
    studioVisible: true, visibleFlow: 0, totalFlow: 28, siliconOwned: 28,
  });
  const png = await capture(page, info, '01-quantum-studio');
  const [sky, floor] = await page.evaluate(async (bytes) => {
    const image = new Image();
    image.src = 'data:image/png;base64,' + bytes;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    return [0.25, 0.78].map((y) => {
      const pixel = ctx.getImageData(Math.round(image.width * 0.04), Math.round(image.height * y), 1, 1).data;
      return (pixel[0] + pixel[1] + pixel[2]) / 3;
    });
  }, png.toString('base64'));
  expect(Math.min(sky, floor)).toBeGreaterThan(25);
  expect(Math.abs(sky - floor)).toBeGreaterThan(4);

  await page.getByRole('button', { name: 'Silicon CAD', exact: true }).click();
  await expect.poll(() => sceneState(page)).toMatchObject({ workspace: 'silicon', live: true, visibleFlow: 28 });
  const rail = await sceneState(page);
  expect(Math.abs(rail.current)).toBeGreaterThan(0);
  expect(rail.frameId).toBeGreaterThan(original.frameId);
  expect(rail.badge).toBe('SIMULATED_PHYSICS_MODEL');
  await capture(page, info, '02-silicon-live');

  await page.keyboard.press('Space');
  await expect.poll(() => sceneState(page)).toMatchObject({ playing: false, visibleFlow: 0 });
  await page.keyboard.press('.');
  await expect.poll(() => sceneState(page)).toMatchObject({ playing: false, visibleFlow: 0 });
  await page.keyboard.press('Space');
  await expect.poll(() => sceneState(page)).toMatchObject({ playing: true, visibleFlow: 28 });

  // The real voltage control exercises a zero-current solve in the running bay.
  await page.keyboard.press('Tab');
  const vdd = page.locator('input[type=range][min="0"][max="3.3"]');
  await vdd.press('Home');
  await expect(page.getByTestId('cad-status-bar').getByText('VDD 0.00 V')).toBeVisible();
  await expect.poll(() => sceneState(page)).toMatchObject({ current: 0, visibleFlow: 0 });
  const slider = await vdd.boundingBox();
  if (!slider) throw Error('Missing supply slider');
  await vdd.click({ position: { x: slider.width * 0.54, y: slider.height / 2 } });
  await expect(vdd).not.toHaveValue('0');
  await expect.poll(() => sceneState(page)).toMatchObject({ live: true, visibleFlow: 28 });

  await page.getByRole('button', { name: 'Quantum Lab', exact: true }).click();
  await expect.poll(() => sceneState(page)).toMatchObject({ workspace: 'quantum', visibleFlow: 0 });
  await page.getByRole('button', { name: 'SoC Architect', exact: true }).click();
  await expect.poll(() => sceneState(page)).toMatchObject({ workspace: 'soc', visibleFlow: 0 });
  await page.keyboard.press('Tab');
  await page.getByTestId('soc-play').click();
  await expect.poll(async () => (await sceneState(page)).soc.emitted).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await capture(page, info, '03-soc-execution');
  await page.getByRole('button', { name: 'Reference Library', exact: true }).click();
  await expect.poll(() => sceneState(page)).toMatchObject({ workspace: 'library', visibleFlow: 0, studioVisible: true });
  await capture(page, info, '04-library-studio');
  expect(await page.getByTestId('cad-status-bar').evaluate((bar) => {
    const box = bar.getBoundingClientRect();
    return Math.abs(box.left) <= 1 && Math.abs(box.right - innerWidth) <= 1 && Math.abs(box.bottom - innerHeight) <= 1;
  })).toBe(true);

  const final = await sceneState(page);
  expect(final.frameId).toBeGreaterThan(rail.frameId);
  await info.attach('workspace-telemetry', {
    body: JSON.stringify({ original, rail, final }, null, 2), contentType: 'application/json',
  });
  expect(errors).toEqual([]);
});

test('CAD status and bundle trigger stay fully visible with the dock open and closed', async ({ workbench: page, errors }, info) => {
  await boot(page);
  await page.getByRole('button', { name: 'Silicon CAD', exact: true }).click();
  const bundle = page.getByRole('button', { name: 'Experiment bundles', exact: true });

  for (const [width, height] of [[1280, 720], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    for (const dockOpen of [false, true]) {
      // The workbench opens the scope when a probe is pinned.
      await page.evaluate((open) => (window as any).__lab.store.set({ dockOpen: open, dockTab: 'scope' }), dockOpen);
      await expect.poll(() => page.evaluate(() => {
        const status = document.querySelector('[data-testid=cad-status-bar]')!;
        const rect = status.getBoundingClientRect();
        const canvas = document.querySelector('[data-testid=cad-viewport] canvas')!.getBoundingClientRect();
        const fields = [...status.querySelectorAll('span')];
        const buttons = [...document.querySelectorAll('button')];
        const trigger = buttons.find((button) => button.textContent === 'Experiment bundles');
        const dockOpen = buttons.some((button) => button.textContent === 'Oscilloscope' && button.getBoundingClientRect().width > 0);
        const telemetry = [/^X .*Y .*Z .*µm$/, /^VDD /, /^I_rail /, /^T_trace /]
          .map((pattern) => fields.find((field) => pattern.test(field.textContent?.trim() ?? '')));
        const inViewport = [status, ...telemetry, trigger].every((element) => {
          if (!element) return false;
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && box.left >= 0 && box.top >= 0 &&
            box.right <= innerWidth + 0.25 && box.bottom <= innerHeight + 0.25;
        });
        const box = trigger?.getBoundingClientRect();
        const hit = box && document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return {
          width: innerWidth, height: innerHeight, dockOpen, inViewport,
          reservedRow: Math.abs(rect.bottom - innerHeight) <= 1 && Math.abs(canvas.bottom - rect.top) <= 1,
          actionableTrigger: Boolean(box && trigger?.contains(hit || null) && box.bottom <= rect.top),
        };
      })).toEqual({ width, height, dockOpen, inViewport: true, reservedRow: true, actionableTrigger: true });

      if (width === 1280) {
        await bundle.click();
        const dialog = page.getByRole('dialog', { name: 'Experiment bundles', exact: true });
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Close experiment bundles' }).click();
        await expect(dialog).toBeHidden();
      }
    }
    if (width !== 1440) await capture(page, info, `status-dock-${width}x${height}`);
  }
  expect(errors).toEqual([]);
});
