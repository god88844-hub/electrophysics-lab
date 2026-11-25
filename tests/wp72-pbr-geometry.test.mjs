import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const load = (source) => import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const bays = 'apps/electrophysics-3d/src/bays/';
const textureSource = read(bays + 'pbrTextures.ts').toString();
const { PBR_SURFACES, generatePbrMaps, createPbrTextureCache } = await load(textureSource);
const instrumentsFile = '04_lab_instruments_and_probes.json';
const packagesFile = '02_pcb_bga_soc_packages.json';
const instruments = JSON.parse(read('data/cad-specs/' + instrumentsFile));
const packages = JSON.parse(read('data/cad-specs/' + packagesFile));
const manifest = JSON.parse(read('data/cad-specs/MANIFEST.json'));

const cadSource = read(bays + 'cadGeometry.ts').toString()
  .replace("import * as THREE from 'three';", 'const THREE = { Vector3: class {} };')
  .replace(/^import instruments .*;$/m, 'const instruments = ' + JSON.stringify(instruments) + ';')
  .replace(/^import packages .*;$/m, 'const packages = ' + JSON.stringify(packages) + ';');
const cad = await load(cadSource);
const digest = (data) => createHash('sha256').update(data).digest('hex');

test('WP-7.2 seeds reproduce every procedural map without a URL or DOM dependency', () => {
  assert.doesNotMatch(textureSource, /fetch\s*\(|XMLHttpRequest|Math\.random|https?:|document\./);
  for (const surface of PBR_SURFACES) {
    const first = generatePbrMaps(surface, 72, 64);
    const again = generatePbrMaps(surface, 72, 64);
    const different = generatePbrMaps(surface, 73, 64);
    for (const name of Object.keys(first)) {
      const map = first[name];
      assert.equal(map.data.length, 64 * 64 * 4);
      assert.equal(map.colorSpace, name === 'albedo' ? 'srgb' : 'linear');
      assert.equal(digest(map.data), digest(again[name].data), surface + ':' + name);
    }
    assert.notEqual(digest(first.normal.data), digest(different.normal.data), surface);
    for (let x = 0; x < first.normal.data.length; x += 4) {
      const color = first.normal.data.subarray(x, x + 3);
      const [nx, ny, nz] = [...color].map((channel) => channel / 127.5 - 1);
      assert.ok(Math.abs(Math.hypot(nx, ny, nz) - 1) < 0.009, surface);
    }
  }
});

test('WP-7.2 distinguishes directional aluminum, concentric machining and PCB metal and ink', () => {
  const metal = generatePbrMaps('aluminum', 72, 128).normal.data;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < metal.length; i += 4) {
    dx += Math.abs(metal[i] - 127.5);
    dy += Math.abs(metal[i + 1] - 127.5);
  }
  assert.ok(dy > 3 * dx);
  const gold = generatePbrMaps('gold', 72, 128).albedo.data;
  const at = (u, v) => gold[(v * 128 + u) * 4];
  assert.ok(Math.abs(at(64, 92) - at(92, 64)) <= 4);
  for (const surface of ['fr4-green', 'fr4-black']) {
    const { albedo, metalness } = generatePbrMaps(surface, 72, 128);
    let copper = 0, ink = 0, dielectric = 0;
    for (let i = 0; i < albedo.data.length; i += 4) {
      if (albedo.data[i] === 184 && albedo.data[i + 1] === 113) {
        assert.equal(metalness.data[i], 255);
        copper++;
      } else {
        assert.equal(metalness.data[i], 0);
        if (albedo.data[i] === 220 && albedo.data[i + 1] === 232) ink++;
        else dielectric++;
      }
    }
    assert.ok(copper > 200 && ink > 20 && dielectric > 5000, surface);
  }
});

test('WP-7.2 cache shares active maps, bounds capacity and disposes released resources once', () => {
  const made = [];
  const cache = createPbrTextureCache((spec, name) => {
    const map = { spec, name, disposed: 0, dispose() { this.disposed++; } };
    made.push(map);
    return map;
  }, 2);
  const first = cache.acquire('copper', 4, 64);
  const same = cache.acquire('copper', 4, 64);
  assert.equal(first.maps, same.maps);
  const gold = cache.acquire('gold');
  assert.throws(() => cache.acquire('aluminum'), /are in use/);
  first.release();
  first.release();
  cache.disposeUnused();
  assert.equal(cache.size, 2);
  assert.ok(made.every((map) => map.disposed === 0));
  same.release();
  const newEntry = cache.acquire('aluminum');
  assert.equal(cache.size, 2);
  assert.ok(Object.values(same.maps).every((map) => map.disposed === 1));
  gold.release();
  newEntry.release();
  cache.disposeUnused();
  cache.disposeUnused();
  assert.equal(cache.size, 0);
  assert.ok(made.every((map) => map.disposed === 1));
});

test('WP-7.2 cache rolls back partial GPU uploads and refuses invalid requests', () => {
  let disposed = 0;
  const cache = createPbrTextureCache((_data, name) => {
    if (name.endsWith(':normal')) throw new Error('allocation failed');
    return { dispose() { disposed++; } };
  });
  assert.throws(() => cache.acquire('glass'), /allocation failed/);
  assert.equal(cache.size, 0);
  assert.equal(disposed, 1);
  for (const args of [['unknown', 72, 128], ['silicon', NaN, 128], ['brass', -1, 128], ['glass', 72, 512]]) {
    assert.throws(() => generatePbrMaps(...args), RangeError);
  }
});

test('WP-7.2 binds probe and capacitor source bytes to the sealed CAD manifest', () => {
  for (const name of [instrumentsFile, packagesFile]) {
    const bytes = read('data/cad-specs/' + name);
    const entry = manifest.files.find((item) => item.file === name);
    assert.equal(bytes.length, entry.size_bytes);
    assert.equal(digest(bytes), entry.sha256);
  }
  const probe = instruments.oscilloscope_probe;
  const scaled = cad.describeSpringProbe(1.5);
  assert.equal(scaled.tip / scaled.scale, probe.tip_cone_height_cm);
  assert.equal(scaled.collarRadius / scaled.scale, probe.collar_ring_radius_cm);
  assert.equal(scaled.shankTop * 2 / scaled.scale, probe.needle_diameter_cm.top);
  assert.equal(scaled.shankBottom * 2 / scaled.scale, probe.needle_diameter_cm.bottom);
  assert.equal(scaled.barrelBottom * 2 / scaled.scale, probe.base_diameter_cm.bottom);
  assert.throws(() => cad.describeSpringProbe(0), RangeError);
  assert.throws(() => cad.createBeveledSlab(1, 0.2, 1, 0.15), RangeError);
  assert.throws(() => cad.createMachinedFlange(1, 1, 0.4, 10), RangeError);
  assert.throws(() => cad.createBgaBallArray(32, 32, 0.8, 0.225), RangeError);
  assert.throws(() => cad.createBgaBallArray(8, 5, 0.41, 0.225), RangeError);
  assert.throws(() => cad.createCoaxBundle(null, NaN, 5), RangeError);
});
