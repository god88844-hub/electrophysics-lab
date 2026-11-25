import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { chromium, expect, test, type Page, type TestInfo } from '@playwright/test';

const root = new URL('../../../', import.meta.url);
const cadSpec = (name: string) => readFileSync(new URL('data/cad-specs/' + name, root), 'utf8');

async function loadGeometry() {
  const source = readFileSync(new URL('../src/bays/cadGeometry.ts', import.meta.url), 'utf8')
    .replace("import * as THREE from 'three';", `import * as THREE from "${new URL('../node_modules/three/build/three.module.js', import.meta.url).href}";`)
    .replace(/^import instruments .*;$/m, 'const instruments = ' + cadSpec('04_lab_instruments_and_probes.json') + ';')
    .replace(/^import packages .*;$/m, 'const packages = ' + cadSpec('02_pcb_bga_soc_packages.json') + ';');
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}

function checkGeometry(geometry: THREE.BufferGeometry) {
  const vertices = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv');
  expect(vertices.count).toBeGreaterThan(0);
  expect(vertices.count).toBeLessThan(1200);
  expect(normals.count).toBe(vertices.count);
  expect(uv.count).toBe(vertices.count);
  for (const attribute of [vertices, normals, uv]) {
    expect(Array.from(attribute.array).every(Number.isFinite)).toBe(true);
  }
  let worstNormal = 0;
  for (let i = 0; i < normals.count; i++) {
    worstNormal = Math.max(worstNormal, Math.abs(Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i)) - 1));
  }
  expect(worstNormal).toBeLessThan(0.00001);
}

test('all CAD builders emit bounded Three.js buffers with correct envelopes and disposal', async () => {
  const cad = await loadGeometry();
  const devices = JSON.parse(cadSpec('02_pcb_bga_soc_packages.json'));
  const slab = cad.createBeveledSlab(4, 0.8, 3, 0.15);
  checkGeometry(slab);
  const slabSize = slab.boundingBox.getSize(new THREE.Vector3());
  expect(slabSize.x).toBeCloseTo(4);
  expect(slabSize.y).toBeCloseTo(0.8);
  expect(slabSize.z).toBeCloseTo(3);
  slab.dispose();

  const spec = devices.bga_array;
  const flange = cad.createMachinedFlange(2, 1, 0.3, 8);
  const capacitor = cad.createSmdCapacitor0402();
  const bga = cad.createBgaBallArray(spec.array.cols, spec.array.rows, spec.ball_pitch_mm, spec.ball_diameter_mm / 2);
  const probe = cad.createSpringProbeNeedle(0.9);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(1, 0.7, 0.4),
  ]);
  const coax = cad.createCoaxBundle(curve, 0.03, 3);
  expect(flange.getObjectByName('socket-head fasteners').count).toBe(8);
  expect(bga.getObjectByName('solder balls').count).toBe(spec.array.cols * spec.array.rows);
  expect(bga.getObjectByName('solder balls').boundingBox.getSize(new THREE.Vector3()).x)
    .toBeCloseTo((spec.array.cols - 1) * spec.ball_pitch_mm + spec.ball_diameter_mm);
  expect(coax.getObjectByName('gold SMA collars').count).toBe(3);
  const cap = devices.smd_passives['0402_decoupling_cap'];
  const capSize = new THREE.Box3().setFromObject(capacitor).getSize(new THREE.Vector3());
  expect(capSize.x).toBeCloseTo(cap.body_l_mm);
  expect(capSize.z).toBeCloseTo(cap.body_w_mm);
  expect(new THREE.Box3().setFromObject(probe).max.y).toBeCloseTo(0.9 * 1.14);
  for (const group of [flange, capacitor, bga, probe, coax]) {
    let disposed = 0;
    const count = group.children.length;
    for (const child of group.children) {
      checkGeometry(child.geometry);
      child.geometry.addEventListener('dispose', () => disposed++);
    }
    group.dispose();
    group.dispose();
    expect(disposed).toBe(count);
    expect(group.children).toHaveLength(0);
  }
});

async function reviewWorkspace(page: Page, workspace: string) {
  const buttons: Record<string, string> = {
    silicon: 'Silicon CAD', quantum: 'Quantum Lab', soc: 'SoC Architect', library: 'Reference Library',
  };
  await page.getByRole('button', { name: buttons[workspace], exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__lab.worldRef.current.currentWorkspace)).toBe(workspace);
  return page.evaluate(() => {
    const lab = (window as any).__lab;
    const world = lab.worldRef.current;
    const materials: Array<{ surface: string; dataMaps: boolean; colorSpaces: string[]; uuids: string[] }> = [];
    world.scene.traverseVisible((node: any) => {
      if (!node.isMesh || !node.material.userData?.pbrSurface) return;
      const material = node.material;
      const maps = [material.map, material.normalMap, material.roughnessMap];
      materials.push({
        surface: material.userData.pbrSurface,
        dataMaps: maps.every((map) => map?.isDataTexture && map.name.startsWith('wp72:')),
        colorSpaces: maps.map((map) => map.colorSpace),
        uuids: maps.map((map) => map.uuid),
      });
    });
    return { materials, frameId: lab.frame.frameId, badge: lab.frame.provenance.badge };
  });
}

async function capture(page: Page, info: TestInfo, label: string) {
  const target = info.outputPath(label + '.png');
  const png = await page.screenshot({ path: target });
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  await info.attach(label, { path: target, contentType: 'image/png' });
}

test('live workbench probes, beveled fixture and shared PBR maps survive workspace switches', async ({ page }, info) => {
  const endpoint = process.env.EP_WP72_DESKTOP_CDP;
  const desktop = endpoint ? await chromium.connectOverCDP(endpoint) : null;
  if (desktop) {
    const nativePage = desktop.contexts().flatMap((c) => c.pages())
      .find((candidate) => new URL(candidate.url()).hostname === 'tauri.localhost');
    if (!nativePage) throw new Error('Native WebView2 workbench missing');
    page = nativePage;
  }
  const errors: string[] = [];
  const readbackDiagnostics: string[] = [];
  const assets: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'warning' && /GL Driver Message \(OpenGL, Performance, [^)]+\): GPU stall due to ReadPixels/.test(text)) {
      // Keep the driver's capture/readback performance diagnostics in the evidence.
      readbackDiagnostics.push(text);
    } else if (message.type() === 'error' ||
        (message.type() === 'warning' && /\b(webgl|shader)\b|GL_INVALID_|GL_OUT_OF_MEMORY|context lost/i.test(text))) {
      errors.push(text);
    }
  });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['localhost', '127.0.0.1', 'tauri.localhost'].includes(url.hostname) &&
        !['data:', 'blob:'].includes(url.protocol)) assets.push(url.href);
    if (/\.(?:hdr|png|glb|gltf|jpe?g|webp)$/i.test(url.pathname)) assets.push(url.href);
  });

  try {
    if (desktop) await page.reload();
    else await page.goto('/');
    await expect(page.getByText('SHA-256 8/8 ✓', { exact: true })).toBeVisible();
    await page.waitForFunction(() => (window as any).__lab?.frame?.frameId > 2);
    const silicon = await reviewWorkspace(page, 'silicon');
    expect(silicon.badge).toBe('SIMULATED_PHYSICS_MODEL');
    expect(silicon.materials.map((m) => m.surface)).toEqual(expect.arrayContaining(['silicon', 'aluminum', 'gold', 'copper', 'glass']));
    const fixture = await page.evaluate(() => {
      const lab = (window as any).__lab;
      const bay = lab.worldRef.current.bay2.group;
      const probe = bay.getObjectByName('spring probe');
      const block = bay.getObjectByName('beveled substrate');
      const tip = probe.getObjectByName('gold pogo tip');
      const projected = lab.projectToScreen(tip);
      return {
        projected,
        probe: probe.userData.probeSpec,
        blockType: block.geometry.type,
        width: block.geometry.boundingBox.max.x - block.geometry.boundingBox.min.x,
        tipSurface: tip.material.userData.pbrSurface,
        azimuth: lab.frame.view.azimuth,
      };
    });
    expect(fixture.probe).toEqual({ source: '04_lab_instruments_and_probes', lengthCm: 1, tipCm: 0.14, scale: 1 });
    expect(fixture.blockType).toBe('ExtrudeGeometry');
    expect(fixture.width).toBeCloseTo(4.2);
    expect(fixture.tipSurface).toBe('gold');

    const viewport = (await page.getByTestId('cad-viewport').boundingBox())!;
    await page.mouse.move(viewport.x + 140, viewport.y + 140);
    await page.mouse.down();
    await page.mouse.move(viewport.x + 210, viewport.y + 150, { steps: 4 });
    await page.mouse.up();
    await expect.poll(async () => {
      const current = await page.evaluate(() => (window as any).__lab.frame.view.azimuth);
      return Math.abs(current - fixture.azimuth);
    }).toBeGreaterThan(0.31);
    // Aim at a solid fixture component. A torus center passes through its aperture.
    const target = await page.evaluate(() => {
      const lab = (window as any).__lab;
      return lab.projectToScreen(lab.worldRef.current.bay2.group.getObjectByName('machined barrel'));
    });
    await page.mouse.move(target.x, target.y);
    await expect(page.getByText(/^(machined barrel|spring plunger|knurled channel collar|gold pogo tip)$/, { exact: true })).toBeVisible();
    await capture(page, info, 'silicon-probe-fixture');

    const quantum = await reviewWorkspace(page, 'quantum');
    const soc = await reviewWorkspace(page, 'soc');
    await capture(page, info, 'soc-pcb-routing');
    const library = await reviewWorkspace(page, 'library');
    expect(quantum.materials.map((m) => m.surface)).toEqual(expect.arrayContaining(['gold', 'aluminum', 'copper', 'sapphire']));
    expect(soc.materials.map((m) => m.surface)).toEqual(expect.arrayContaining(['fr4-green', 'aluminum']));
    expect(library.materials.map((m) => m.surface)).toContain('aluminum');
    for (const state of [silicon, quantum, soc, library]) {
      for (const material of state.materials) {
        expect(material.dataMaps).toBe(true);
        expect(material.colorSpaces).toEqual(['srgb', '', '']);
      }
    }
    const restored = await reviewWorkspace(page, 'silicon');
    expect(restored.materials).toEqual(silicon.materials);
    expect(restored.frameId).toBeGreaterThan(silicon.frameId);
    await info.attach('procedural-material-telemetry', {
      body: JSON.stringify({ silicon, quantum, soc, library, fixture, readbackDiagnostics }), contentType: 'application/json',
    });
    if (readbackDiagnostics.length) console.log(JSON.stringify({ readbackDiagnostics }));
    expect(assets).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await desktop?.close();
  }
});
