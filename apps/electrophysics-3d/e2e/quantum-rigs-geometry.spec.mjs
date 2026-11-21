// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { deriveAll } from '../src/bays/quantum/rigSpec.mjs';

/**
 * WP-5.4 — geometry-from-JSON Playwright assertions (live scene).
 *
 * The rendered Quantum Lab rigs must match the sealed
 * `data/cad-specs/03_quantum_hardware_rigs.json` EXACTLY:
 *   1. the app ships the JSON object graph verbatim (`bay1.specSource`),
 *   2. the in-app derivation (`bay1.geometry`) equals the same `deriveAll`
 *      the Node unit tests pin (imported here — one shared module),
 *   3. the live scene meshes measure exactly the derived dimensions
 *      (bounding boxes, instance counts, lattice pitches),
 *   4. docked Bloch instrumentation preserved, zero permanent labels,
 *      quench behavior driven by the JSON-parsed Al Tc.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const SPEC_JSON = JSON.parse(
  readFileSync(path.join(here, '..', '..', '..', 'data', 'cad-specs', '03_quantum_hardware_rigs.json'), 'utf8')
);
const G = deriveAll(SPEC_JSON);

/** Install the dim helper in the page (evaluate callbacks don't capture node closures). */
async function installHelpers(page) {
  await page.evaluate(() => {
    window.__dims = (mesh) => {
      mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox;
      return { x: bb.max.x - bb.min.x, y: bb.max.y - bb.min.y, z: bb.max.z - bb.min.z };
    };
  });
}

function approx(a, b, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

async function boot(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // Integrity badge presence (the 6/8 ✗ vs 6/6 count is a PRE-EXISTING main
  // defect: the vault was extended to 01–08 but src/data/reference.ts still
  // imports 6 raw files — outside this WP's strict file isolation; flagged
  // in the PR). WP-5.4 gates the geometry-from-JSON assertions below.
  await expect(page.getByText(/SHA-256 \d+\/\d+/)).toBeVisible({ timeout: 40_000 });
  return errors;
}

test.describe('WP-5.4 quantum rigs geometry-from-JSON', () => {
  test('app ships the sealed cad-specs 03 JSON and the shared derivation', async ({ page }) => {
    const errors = await boot(page);
    const result = await page.evaluate(() => {
      const bay1 = window.__lab.worldRef.current.bay1;
      return { specSource: bay1.specSource, geometry: bay1.geometry };
    });
    expect(result.specSource).toEqual(SPEC_JSON);
    // Stage temps parsed from the JSON labels in-app (not hardcoded arrays).
    expect(result.geometry.stageTempsK).toEqual([300, 4, 0.1, 0.015]);
    expect(result.geometry.sourceId).toBe('03_quantum_hardware_rigs');
    // The in-app derivation matches the shared module result object-for-object.
    expect(result.geometry.cryostat.stages.map((s) => [s.yCm, s.radiusCm, s.tempK])).toEqual(
      G.cryostat.stages.map((s) => [s.yCm, s.radiusCm, s.tempK])
    );
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('fridge mode: cryostat + transmon die meshes measure the JSON dimensions', async ({ page }) => {
    const errors = await boot(page);
    await installHelpers(page);
    const data = await page.evaluate(() => {
      const world = window.__lab.worldRef.current;
      const root = world.bay1.group;
      const out = { stages: [], coax: 0, straps: 0, links: 0, barrels: 0, die: null, pads: null, jj: null, cpw: [], sprites: 0 };
      root.traverse((o) => {
        if (o.isSprite) out.sprites++;
      });
      for (const s of ['stage-300K', 'stage-4K', 'stage-100mK', 'stage-15mK']) {
        const mesh = root.getObjectByName(s);
        if (!mesh) { out.stages.push(null); continue; }
        const d = window.__dims(mesh);
        out.stages.push({ x: d.x, y: d.y, posY: mesh.position.y });
      }
      const canister = root.getObjectByName('cryo-canister');
      out.canister = canister ? window.__dims(canister).x : null;
      root.traverse((o) => {
        if (String(o.name).startsWith('cryo-coax-')) out.coax++;
        if (String(o.name).startsWith('cryo-thermal-strap-')) out.straps++;
        if (String(o.name).startsWith('cryo-cold-link-')) out.links++;
        if (o.name === 'cryo-attenuator-barrels') out.barrels = o.count;
        if (o.name === 'transmon-pads') out.pads = o.count;
        if (o.name === 'transmon-junctions') out.jj = o.count;
        if (String(o.name).startsWith('transmon-cpw-')) out.cpw.push(window.__dims(o).x);
      });
      const die = root.getObjectByName('transmon-die');
      if (die) {
        const d = window.__dims(die);
        out.die = { x: d.x, z: d.z, posY: die.position.y };
      }
      // Pad lattice pitch from the live instance matrices.
      const padsMesh = root.getObjectByName('transmon-pads');
      if (padsMesh) {
        const arr = padsMesh.instanceMatrix.array;
        const xs = [];
        for (let i = 0; i < padsMesh.count; i++) xs.push(arr[i * 16 + 12]);
        const uniq = [...new Set(xs)].sort((a, b) => a - b);
        out.padPitch = uniq[1] - uniq[0];
        out.padMinX = uniq[0];
        out.padMaxX = uniq[uniq.length - 1];
      }
      return out;
    });

    // Stage plates: diameter = 2×plate_radius_cm, thickness = plate_thickness_cm, y = y_cm.
    expect(data.stages).toHaveLength(4);
    data.stages.forEach((s, i) => {
      const json = SPEC_JSON.dilution_cryostat.stages[i];
      expect(s).not.toBeNull();
      expect(approx(s.x, 2 * json.plate_radius_cm)).toBe(true);
      // Matched plate set: the spec dimensions the 300 K plate; the same
      // thickness applies to all stages (mirrors deriveCryostat).
      expect(approx(s.y, json.plate_thickness_cm ?? SPEC_JSON.dilution_cryostat.stages[0].plate_thickness_cm)).toBe(true);
      expect(approx(s.posY, json.y_cm)).toBe(true);
    });
    expect(approx(data.canister, 2 * 0.52)).toBe(true);
    expect(data.coax).toBe(7);
    expect(data.straps).toBe(2);
    expect(data.links).toBe(3);
    expect(data.barrels).toBe(21);
    // Transmon die: 0.5 cm square on the 15 mK stage (y = 0.72 + 0.05 + 0.03).
    expect(approx(data.die.x, SPEC_JSON.transmon_die.size_cm)).toBe(true);
    expect(approx(data.die.z, SPEC_JSON.transmon_die.size_cm)).toBe(true);
    expect(approx(data.die.posY, G.transmon.dieCenterYCm)).toBe(true);
    expect(data.pads).toBe(16);
    expect(data.jj).toBe(16);
    expect(approx(data.padPitch, 0.1, 1e-4)).toBe(true);
    expect(approx(data.padMinX, -0.15, 1e-4)).toBe(true);
    expect(approx(data.padMaxX, 0.15, 1e-4)).toBe(true);
    // CPW tubes: x-extent = spec meander span (0.34) + the tube's tilted end
    // rings (≤ 2 × tube radius); bound within 0.36 ± 0.02.
    expect(data.cpw).toHaveLength(3);
    data.cpw.forEach((ext) => expect(approx(ext, SPEC_JSON.transmon_die.coplanar_waveguides.meander_span_cm + 0.02, 2e-2)).toBe(true));
    // Zero permanent floating labels (hover callout replaces them).
    expect(data.sprites).toBe(0);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('MZI mode: chip meshes measure the JSON dimensions', async ({ page }) => {
    const errors = await boot(page);
    await installHelpers(page);
    await page.evaluate(() => window.__lab.store.set({ bay1Mode: 'mzi' }));
    await page.waitForTimeout(600);
    const data = await page.evaluate(() => {
      const root = window.__lab.worldRef.current.bay1.group;
      const out = { die: null, waveguides: 0, coupler: 0, heaters: 0, gratings: 0, wgTube: null };
      const die = root.getObjectByName('mzi-die');
      if (die) {
        const d = window.__dims(die);
        out.die = { x: d.x, z: d.z, posY: die.position.y };
      }
      root.traverse((o) => {
        if (String(o.name).startsWith('mzi-waveguide-')) { out.waveguides++; out.wgTube = window.__dims(o).y; }
        if (o.name === 'mzi-coupler') out.coupler++;
        if (String(o.name).startsWith('mzi-heater-')) out.heaters++;
        if (String(o.name).startsWith('mzi-grating-')) out.gratings++;
      });
      return out;
    });
    const chip = SPEC_JSON.photonic_mzi_chip;
    expect(approx(data.die.x, chip.size_cm.w)).toBe(true);
    expect(approx(data.die.z, chip.size_cm.h)).toBe(true);
    expect(approx(data.die.posY, G.mzi.die.mountYCm)).toBe(true);
    expect(data.waveguides).toBe(chip.waveguides.count);
    expect(data.coupler).toBe(chip.directional_couplers.count);
    expect(data.heaters).toBe(2);
    expect(data.gratings).toBe(12); // 6 fins × 2 edge gratings
    // Waveguide tube diameter = conductor thickness from the derivation (2 × tube radius).
    expect(approx(data.wgTube, 2 * G.mzi.waveguides.tubeRadiusCm, 1e-3)).toBe(true);
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('tweezer mode: chamber, lattice, halos and wavelength-derived laser hues', async ({ page }) => {
    const errors = await boot(page);
    await installHelpers(page);
    await page.evaluate(() => window.__lab.store.set({ bay1Mode: 'tweezer' }));
    await page.waitForTimeout(600);
    const data = await page.evaluate(() => {
      const root = window.__lab.worldRef.current.bay1.group;
      const out = { table: null, atoms: 0, atomPitch: null, halos: 0, haloDiameter: null, chamber: null, beams: [] };
      const table = root.getObjectByName('tweezer-table');
      if (table) {
        const d = window.__dims(table);
        out.table = { x: d.x, z: d.z };
      }
      const shell = root.getObjectByName('uhv-chamber-shell');
      if (shell) out.chamber = window.__dims(shell).x;
      const grid = root.getObjectByName('atomGrid');
      if (grid) {
        out.atoms = grid.count;
        const arr = grid.instanceMatrix.array;
        const xs = [];
        for (let i = 0; i < grid.count; i++) xs.push(arr[i * 16 + 12]);
        const uniq = [...new Set(xs)].sort((a, b) => a - b);
        out.atomPitch = uniq[1] - uniq[0];
      }
      const halos = root.getObjectByName('blockade-halos');
      if (halos) {
        out.halos = halos.count;
        out.haloDiameter = window.__dims(halos).x; // instanced ring geometry extent
      }
      const ryd = root.getObjectByName('laser-rydberg-beam');
      const trap = root.getObjectByName('laser-trap-beam');
      if (ryd) out.beams.push({ name: 'rydberg', color: ryd.material.color.getHex() });
      if (trap) out.beams.push({ name: 'trap', color: trap.material.color.getHex() });
      return out;
    });
    const rigJson = SPEC_JSON.neutral_atom_uhv_chamber;
    expect(approx(data.table.x, rigJson.optical_table.size_cm.w)).toBe(true);
    expect(approx(data.table.z, rigJson.optical_table.size_cm.h)).toBe(true);
    expect(data.atoms).toBe(rigJson.tweezer_grid.rows * rigJson.tweezer_grid.cols);
    expect(data.atoms).toBe(64);
    expect(approx(data.atomPitch, rigJson.tweezer_grid.lattice_pitch_cm, 1e-4)).toBe(true);
    expect(data.halos).toBe(rigJson.rydberg_blockade_halos.count);
    expect(data.halos).toBe(12);
    // Ring outer radius 0.085 → instanced ring x-extent = 2 × 0.085.
    expect(approx(data.haloDiameter, 2 * rigJson.rydberg_blockade_halos.radius_cm, 1e-3)).toBe(true);
    expect(approx(data.chamber, 2 * G.tweezer.chamber.radiusCm, 1e-3)).toBe(true);
    // Laser hues derived from the spec wavelengths (480 nm blue, 780 nm red).
    const ryd = data.beams.find((b) => b.name === 'rydberg');
    const trap = data.beams.find((b) => b.name === 'trap');
    expect(ryd).toBeTruthy();
    expect(trap).toBeTruthy();
    expect(ryd.color).toBe(G.tweezer.lasers.rydberg.colorHex);
    expect(trap.color).toBe(G.tweezer.lasers.trap.colorHex);
    expect((ryd.color & 0xff)).toBe(0xff); // blue channel max at 480 nm
    expect((trap.color >> 16)).toBeGreaterThan((trap.color & 0xff)); // red dominates at 780 nm
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });

  test('docked Bloch instrumentation preserved + quench driven by JSON-parsed Al Tc', async ({ page }) => {
    const errors = await boot(page);
    const data = await page.evaluate(() => {
      const bay1 = window.__lab.worldRef.current.bay1;
      // Drive a Bloch state exactly as the docked Lindblad readouts do.
      bay1.setBlochState(0, 1, 0, 0, 0.9);
      // Quench: push the base stage above the Al Tc parsed from the JSON note.
      bay1.setStageTemps([300, 4, 0.1, 2.0]);
      const holo = bay1.group.getObjectByName('qubitHolo');
      const quenchedOpacity = holo.material.opacity;
      bay1.setStageTemps([300, 4, 0.1, 0.015]);
      const recoveredOpacity = holo.material.opacity;
      return { quenchedOpacity, recoveredOpacity, tc: bay1.geometry.superconductingTransitionK };
    });
    expect(data.tc).toBe(1.2); // parsed from the JSON transmon note, not hardcoded
    expect(data.quenchedOpacity).toBeLessThan(0.1);
    expect(data.recoveredOpacity).toBeGreaterThan(0.5);
    // Docked Bloch tab still ships in the instrument dock (BlochPanel mount):
    // open the dock, switch to the Bloch tab, three live canvases render.
    await page.evaluate(() => window.__lab.store.set({ dockOpen: true, dockTab: 'bloch' }));
    await page.waitForTimeout(400);
    await expect(page.getByText('Bloch Instruments')).toBeVisible();
    const blochCanvases = await page.evaluate(() => {
      const canvases = [...document.querySelectorAll('canvas')].filter(
        (c) => c.width === 150 && c.height === 150
      );
      return canvases.length;
    });
    expect(blochCanvases).toBe(3); // q0..q2 docked spheres preserved
    expect(errors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  });
});
