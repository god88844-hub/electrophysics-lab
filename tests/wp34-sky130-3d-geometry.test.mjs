// WP-3.4 — Polygon-accurate Q4 primitive viewer: geometry-from-JSON unit tests.
//
// These tests import the REAL renderer-side geometry modules (pure .mjs, shared
// with the browser bundle) and the SHA-256-sealed cad-spec JSON, and enforce:
//   1. fail-closed spec admission (missing/tampered fields are refused),
//   2. true-to-scale derivation: layer order/thicknesses, declared ×3 film
//      exaggeration, declared substrate clip — every dimension traces to JSON,
//   3. per-cell polygon instance counts == cad-specs instance_count,
//   4. finger grid self-consistency vs the declared footprints,
//   5. KLayout-style visibility/opacity/peel derivation inputs.
// The browser-side integration (real THREE scene, layer panel, peel) is covered
// by apps/electrophysics-3d/e2e/wp34-sky130-geometry.spec.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parseSky130Spec } from '../apps/electrophysics-3d/src/bays/silicon/sky130Spec.mjs';
import { buildCellLayout, buildAllCellLayouts } from '../apps/electrophysics-3d/src/bays/silicon/sky130Layout.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url)); // repo root (this file lives in tests/)
const SPEC_PATH = 'data/cad-specs/01_sky130_primitives_geometry.json';
const MANIFEST_PATH = 'data/cad-specs/MANIFEST.json';
const raw = readFileSync(join(ROOT, SPEC_PATH), 'utf8');
const json = JSON.parse(raw);
const spec = parseSky130Spec(json);

const Q4_CELL_NAMES = ['q4_thresh_det', 'q4_inv', 'q4_mux4', 'q4_half_adder'];

test('WP-3.4: cad-spec 01 is byte-verified against its SHA-256 manifest', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, MANIFEST_PATH), 'utf8'));
  const entry = manifest.files.find((f) => f.file === '01_sky130_primitives_geometry.json');
  assert.ok(entry, 'MANIFEST.json seals 01_sky130_primitives_geometry.json');
  const actual = createHash('sha256').update(raw).digest('hex');
  assert.equal(actual, entry.sha256, 'spec bytes match the sealed SHA-256');
});

test('WP-3.4: spec parsing is fail-closed (Law 1 / admission discipline)', () => {
  assert.throws(() => parseSky130Spec({ ...json, id: 'tampered' }), /unexpected id/);
  assert.throws(() => parseSky130Spec({ ...json, provenance_status: 'invented' }), /verified_offline_standard/);
  assert.throws(
    () => parseSky130Spec({ ...json, units: { ...json.units, scene_note: 'no factor here' } }),
    /vertically exaggerated/,
    'undeclared exaggeration is refused, never guessed',
  );
  const noThickness = JSON.parse(raw);
  delete noThickness.layer_stack_3d.thickness_um.met1;
  assert.throws(() => parseSky130Spec(noThickness), /thickness_um for layer "met1"/);
});

test('WP-3.4: layer stack order + true thicknesses come from the JSON, ×3 declared', () => {
  const order = json.layer_stack_3d.order_bottom_to_top;
  assert.deepEqual(
    spec.layers.map((l) => l.key),
    order,
    'bottom→top order is the JSON-declared stack',
  );
  assert.deepEqual(
    order,
    ['substrate', 'nwell', 'psub', 'diffusion', 'poly', 'li1', 'mcon', 'met1', 'via', 'met2', 'via2', 'met3'],
    'the 12-layer SKY130A stack the viewer must render',
  );
  for (const l of spec.layers) {
    const declared = json.layer_stack_3d.thickness_um[l.key] ?? json.layer_stack_3d.thickness_um[`${l.key}_height`];
    assert.equal(l.thicknessUm, declared, `layer ${l.key} thickness µm is the JSON value`);
    assert.equal(l.colorHex, Number.parseInt(/#([0-9a-fA-F]{6})/.exec(json.layer_stack_3d.materials[l.key === 'mcon' || l.key === 'via' || l.key === 'via2' ? 'via_stack' : l.key])[1], 16), `layer ${l.key} color is the JSON material color`);
  }
  assert.equal(spec.verticalExaggeration, 3, 'declared ×3 film exaggeration (scene_note)');
  assert.equal(spec.substrateThicknessUm, 525.0, 'true substrate thickness (µm, 02 JSON)');
  assert.equal(spec.substrateClipUm, 2.72, 'declared clip = largest verified cell height');
  assert.equal(spec.gatePitchUm, 0.48);
  assert.equal(spec.gateLengthUm, 0.15);
});

test('WP-3.4: all 4 verified Phase 0 Q4 primitives are admitted', () => {
  assert.deepEqual(
    spec.cells.map((c) => c.name),
    Q4_CELL_NAMES,
  );
  const declared = Object.fromEntries(json.verified_cells.cells.map((c) => [c.name, c]));
  for (const c of spec.cells) {
    assert.equal(c.gates, declared[c.name].gates);
    assert.equal(c.polyFingers, declared[c.name].instance_count.poly_fingers);
    assert.equal(c.li1Stubs, declared[c.name].instance_count.li1_stubs);
    assert.equal(c.met1Pads, declared[c.name].instance_count.met1_pads);
  }
});

test('WP-3.4: per-cell polygon instance counts equal cad-specs instance_count', () => {
  const layouts = buildAllCellLayouts(spec);
  for (const cellJson of json.verified_cells.cells) {
    const layout = layouts.get(cellJson.name);
    assert.ok(layout, `${cellJson.name} layout generated`);
    assert.equal(layout.counts['gate-finger'], cellJson.instance_count.poly_fingers, `${cellJson.name} poly_fingers`);
    assert.equal(layout.counts['li1-stub'], cellJson.instance_count.li1_stubs, `${cellJson.name} li1_stubs`);
    assert.equal(layout.counts['met1-pad'], cellJson.instance_count.met1_pads, `${cellJson.name} met1_pads`);
    // Derived interconnect chain stays 1:1 with the enumerated pads.
    assert.equal(layout.counts['mcon-plug'], cellJson.instance_count.met1_pads);
    assert.equal(layout.counts['via-plug'], cellJson.instance_count.met1_pads);
    assert.equal(layout.counts['met2-pad'], cellJson.instance_count.met1_pads);
    assert.equal(layout.counts['via2-plug'], cellJson.instance_count.met1_pads);
    assert.equal(layout.counts['met3-pin'], cellJson.instance_count.met1_pads);
  }
});

test('WP-3.4: rails generated only where footprint_3d declares "+ li1/met1 rails"', () => {
  const layouts = buildAllCellLayouts(spec);
  for (const cellJson of json.verified_cells.cells) {
    const layout = layouts.get(cellJson.name);
    const declaresRails = /li1\/met1 rails/.test(cellJson.footprint_3d);
    const railCount = (layout.counts['li1-rail-vdd'] ?? 0) + (layout.counts['li1-rail-gnd'] ?? 0) + (layout.counts['met1-rail-vdd'] ?? 0) + (layout.counts['met1-rail-gnd'] ?? 0);
    assert.equal(railCount, declaresRails ? 4 : 0, `${cellJson.name} rails ↔ footprint_3d declaration`);
  }
});

test('WP-3.4: finger grid is the JSON pitch grid and fits the declared footprint', () => {
  for (const cell of spec.cells) {
    const layout = buildCellLayout(spec, cell.name);
    const fingers = layout.layers.find((l) => l.key === 'poly').polygons;
    assert.equal(fingers.length, cell.polyFingers);
    const { gatePitchUm: pitch, gateLengthUm: gate } = spec;
    for (let i = 0; i < fingers.length; i++) {
      const expectedX = (i - (cell.polyFingers - 1) / 2) * pitch;
      assert.ok(Math.abs(fingers[i].x - expectedX) < 1e-9, `finger ${i} sits on the ${pitch} µm pitch grid`);
      assert.equal(fingers[i].w, gate, 'finger width = drawn gate length 0.15 µm');
      assert.equal(fingers[i].d, cell.footprintHUm, 'finger crosses the full cell height');
    }
    const span = (cell.polyFingers - 1) * pitch + gate;
    assert.ok(span <= cell.footprintWUm + 1e-9, `${cell.name}: finger span ${span} µm fits footprint ${cell.footprintWUm} µm`);
  }
});

test('WP-3.4: scene stack heights are exact JSON derivations (declared scale only)', () => {
  const layout = buildCellLayout(spec, 'q4_inv');
  let y = 0;
  for (const layer of layout.layers) {
    assert.equal(layer.yBase, y, `layer ${layer.key} starts where the previous ends`);
    const expected = layer.key === 'substrate' ? spec.substrateClipUm : layer.thicknessUm * spec.verticalExaggeration;
    assert.ok(Math.abs(layer.thicknessScene - expected) < 1e-9, `layer ${layer.key} scene thickness = JSON derivation`);
    y = layer.yTop;
  }
  // 525 µm substrate is declared-clipped, never silently shrunk.
  const substrateLayer = layout.layers[0];
  assert.equal(substrateLayer.key, 'substrate');
  assert.ok(substrateLayer.thicknessScene < spec.substrateThicknessUm, 'clip is declared, true depth shown by wafer rig');
  // Every polygon carries a traceability string into the JSON.
  for (const layer of layout.layers) {
    for (const poly of layer.polygons) {
      assert.match(poly.trace, /^01_sky130_primitives_geometry\.json → /);
    }
  }
});

test('WP-3.4: met3 pin coordinates derive from the pitch grid (per-cell pins)', () => {
  const layout = buildCellLayout(spec, 'q4_mux4');
  assert.equal(layout.pins.length, json.verified_cells.cells.find((c) => c.name === 'q4_mux4').instance_count.met1_pads);
  const met3 = layout.layers.find((l) => l.key === 'met3');
  for (let i = 0; i < layout.pins.length; i++) {
    assert.equal(layout.pins[i].layer, 'met3');
    assert.equal(layout.pins[i].x, met3.polygons[i].x, 'pin x = met3 pad center');
    assert.equal(layout.pins[i].z, met3.polygons[i].z);
  }
});

test('WP-3.4: diffusion/well structure matches the spec CMOS structure (2 rows)', () => {
  for (const cell of spec.cells) {
    const layout = buildCellLayout(spec, cell.name);
    assert.equal(layout.counts['nmos-active'], 1);
    assert.equal(layout.counts['pmos-active'], 1);
    assert.equal(layout.counts['nwell-pmos'], 1);
    assert.equal(layout.counts['psub-surface'], 1);
    const nRow = layout.layers.find((l) => l.key === 'diffusion').polygons.find((p) => p.role === 'nmos-active');
    const pRow = layout.layers.find((l) => l.key === 'diffusion').polygons.find((p) => p.role === 'pmos-active');
    assert.ok(nRow.z < 0 && pRow.z > 0, 'NMOS row over psub, PMOS row in nwell');
  }
});

test('WP-3.4: unknown cells and contradictory geometry are refused (fail-closed)', () => {
  assert.throws(() => buildCellLayout(spec, 'q4_nonexistent'), /unknown cell/);
  const bad = JSON.parse(raw);
  bad.verified_cells.cells = bad.verified_cells.cells.map((c) =>
    c.name === 'q4_inv' ? { ...c, footprint_3d: '1.0 × 2.72 µm core' } : c,
  );
  assert.throws(() => buildCellLayout(parseSky130Spec(bad), 'q4_inv'), /exceeds footprint width/, 'pitch grid that cannot fit the footprint is rejected, not clamped');
});
