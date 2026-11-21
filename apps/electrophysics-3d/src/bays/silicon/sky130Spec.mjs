/**
 * WP-3.4 — SKY130A primitive CAD-spec loader (pure, environment-free).
 *
 * Parses and fail-closed-validates `data/cad-specs/01_sky130_primitives_geometry.json`
 * (SHA-256 sealed by `data/cad-specs/MANIFEST.json`) into the normalized spec
 * used by `sky130Layout.mjs` and the Bay 2 polygon-accurate 3D layer viewer.
 *
 * Zero-Prototype law: every dimension/color the viewer draws is read from this
 * JSON — nothing is hardcoded in the renderer. Missing or malformed fields
 * throw with an exact reason (fail-closed admission, Builder Rule 1 / Law 4).
 *
 * This module must stay dependency-free and Node-importable (the WP-3.4 unit
 * tests run it directly under `node --test` on Node 20/22/24).
 */

/**
 * @typedef {Object} Sky130LayerSpec
 * @property {string} key              Layer key from `order_bottom_to_top`.
 * @property {number} thicknessUm      True physical thickness in µm.
 * @property {number} colorHex         KLayout-style fill color as 0xRRGGBB.
 * @property {boolean} clearcoat       True for the clearcoat substrate presentation.
 */

/**
 * @typedef {Object} Sky130CellSpec
 * @property {string} name             e.g. "q4_inv".
 * @property {number} gates            Verified gate count (Phase 0).
 * @property {number} footprintWUm     Cell core width in µm (parsed from `footprint_3d`).
 * @property {number} footprintHUm     Cell core height in µm (parsed from `footprint_3d`).
 * @property {boolean} hasLi1Met1Rails True when `footprint_3d` declares li1/met1 rails.
 * @property {number} polyFingers      `instance_count.poly_fingers`.
 * @property {number} li1Stubs         `instance_count.li1_stubs`.
 * @property {number} met1Pads         `instance_count.met1_pads`.
 */

/**
 * @typedef {Object} Sky130Spec
 * @property {string} id
 * @property {string} provenanceStatus
 * @property {string} sourceUrl
 * @property {string} lengthUnit          Always "um" (fail-closed).
 * @property {number} verticalExaggeration Declared ×N film-stack exaggeration from `units.scene_note`.
 * @property {number} substrateThicknessUm True wafer/substrate thickness (525 µm, 02 JSON).
 * @property {number} substrateClipUm     Declared viewer clip depth = largest verified cell height.
 * @property {number} gatePitchUm         Transistor gate pitch (0.48 µm).
 * @property {number} gateLengthUm        Drawn gate length (0.15 µm).
 * @property {Sky130LayerSpec[]} layers   Bottom → top in the JSON's declared order.
 * @property {Sky130CellSpec[]} cells     The 4 verified Q4 primitives.
 */

/** Which `materials` entry backs each layer key (via plugs share `via_stack`). */
const LAYER_MATERIAL_KEY = {
  substrate: 'substrate',
  nwell: 'nwell',
  psub: 'psub',
  diffusion: 'diffusion',
  poly: 'poly',
  li1: 'li1',
  mcon: 'via_stack',
  met1: 'met1',
  via: 'via_stack',
  met2: 'met2',
  via2: 'via_stack',
  met3: 'met3',
};

/** Extracts the `#rrggbb` presentation color embedded in a material string. */
function hexToInt(materialString, layerKey) {
  const match = /#([0-9a-fA-F]{6})/.exec(String(materialString));
  if (!match) {
    throw new Error(`sky130 spec: layer "${layerKey}" material string carries no #rrggbb color: "${materialString}"`);
  }
  return Number.parseInt(match[1], 16);
}

/** Pulls an opaque number out of a JSON node, fail-closed. */
function requireNumber(node, path) {
  const v = typeof node === 'number' ? node : node?.[path];
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(`sky130 spec: missing finite number at ${path}`);
  }
  return v;
}

/**
 * Parses + validates the raw cad-spec JSON.
 * @param {unknown} raw Parsed JSON of 01_sky130_primitives_geometry.json.
 * @returns {Sky130Spec}
 */
export function parseSky130Spec(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('sky130 spec: cad-spec JSON is not an object');
  }
  const spec = /** @type {Record<string, any>} */ (raw);
  if (spec.id !== '01_sky130_primitives_geometry') {
    throw new Error(`sky130 spec: unexpected id "${spec.id}"`);
  }
  if (spec.provenance_status !== 'verified_offline_standard') {
    throw new Error(`sky130 spec: provenance_status is "${spec.provenance_status}", must be verified_offline_standard`);
  }
  const units = spec.units ?? {};
  if (units.length !== 'um') {
    throw new Error(`sky130 spec: length unit is "${units.length}", expected "um"`);
  }

  // Declared vertical exaggeration of the film stack, parsed from the spec's
  // own scene_note — a declared presentation factor, never a hidden scale lie.
  const exaggerationMatch = /vertically exaggerated ×(\d+(?:\.\d+)?)/.exec(String(units.scene_note ?? ''));
  if (!exaggerationMatch) {
    throw new Error('sky130 spec: units.scene_note does not declare a "vertically exaggerated ×N" factor');
  }
  const verticalExaggeration = Number.parseFloat(exaggerationMatch[1]);
  if (!(verticalExaggeration > 0)) {
    throw new Error(`sky130 spec: parsed exaggeration "${exaggerationMatch[1]}" is not positive`);
  }

  const stack = spec.layer_stack_3d ?? {};
  const order = stack.order_bottom_to_top;
  if (!Array.isArray(order) || order.length === 0) {
    throw new Error('sky130 spec: layer_stack_3d.order_bottom_to_top missing');
  }
  const thicknessUm = stack.thickness_um ?? {};
  const materials = stack.materials ?? {};
  const layers = /** @type {Sky130LayerSpec[]} */ ([]);
  for (const key of order) {
    // Vias are declared as `<key>_height`; everything else as `<key>`.
    const t = typeof thicknessUm[key] === 'number' ? thicknessUm[key] : thicknessUm[`${key}_height`];
    if (typeof t !== 'number' || !(t > 0)) {
      throw new Error(`sky130 spec: no thickness_um for layer "${key}"`);
    }
    const materialKey = LAYER_MATERIAL_KEY[key];
    if (!materialKey || typeof materials[materialKey] !== 'string') {
      throw new Error(`sky130 spec: no material string for layer "${key}" (material key "${materialKey}")`);
    }
    layers.push({
      key,
      thicknessUm: t,
      colorHex: hexToInt(materials[materialKey], key),
      clearcoat: key === 'substrate',
    });
  }

  const mosfet = spec.transistor_structure?.mosfet ?? {};
  const gatePitchUm = requireNumber(mosfet, 'gate_pitch_um');
  const gateLengthRecord = mosfet.gate_length_um ?? {};
  const gateLengthUm = typeof gateLengthRecord.sky130_min === 'number' ? gateLengthRecord.sky130_min : gateLengthRecord.hd_library_drawn;
  if (typeof gateLengthUm !== 'number' || !(gateLengthUm > 0)) {
    throw new Error('sky130 spec: transistor gate_length_um missing sky130_min/drawn value');
  }

  const cells = /** @type {Sky130CellSpec[]} */ ([]);
  const verified = spec.verified_cells?.cells ?? [];
  if (!Array.isArray(verified) || verified.length === 0) {
    throw new Error('sky130 spec: verified_cells.cells missing');
  }
  let substrateClipUm = 0;
  for (const cell of verified) {
    const footprintMatch = /([\d.]+)\s*×\s*([\d.]+)/.exec(String(cell.footprint_3d ?? ''));
    if (!footprintMatch) {
      throw new Error(`sky130 spec: cell "${cell.name}" footprint_3d has no "W × H µm" pair: "${cell.footprint_3d}"`);
    }
    const footprintWUm = Number.parseFloat(footprintMatch[1]);
    const footprintHUm = Number.parseFloat(footprintMatch[2]);
    const counts = cell.instance_count ?? {};
    const polyFingers = requireNumber(counts, 'poly_fingers');
    const li1Stubs = requireNumber(counts, 'li1_stubs');
    const met1Pads = requireNumber(counts, 'met1_pads');
    if (!Number.isInteger(polyFingers) || !Number.isInteger(li1Stubs) || !Number.isInteger(met1Pads)) {
      throw new Error(`sky130 spec: cell "${cell.name}" instance_count values must be integers`);
    }
    if (polyFingers !== li1Stubs || li1Stubs !== met1Pads) {
      throw new Error(`sky130 spec: cell "${cell.name}" instance_count ${polyFingers}/${li1Stubs}/${met1Pads} is not 1:1 (layout derivation requires finger==stub==pad)`);
    }
    substrateClipUm = Math.max(substrateClipUm, footprintHUm);
    cells.push({
      name: String(cell.name),
      gates: requireNumber(cell, 'gates'),
      footprintWUm,
      footprintHUm,
      hasLi1Met1Rails: /li1\/met1 rails/.test(String(cell.footprint_3d)),
      polyFingers,
      li1Stubs,
      met1Pads,
    });
  }

  const substrateThicknessUm = requireNumber(thicknessUm, 'substrate');
  return {
    id: spec.id,
    provenanceStatus: spec.provenance_status,
    sourceUrl: String(spec.source_url ?? ''),
    lengthUnit: 'um',
    verticalExaggeration,
    substrateThicknessUm,
    // Wafer-scale 525 µm cannot appear at cell scale; the viewer declares a
    // clip at the largest verified cell height (a JSON-derived presentation
    // depth, surfaced in stage userData and status — not a hidden scale lie).
    substrateClipUm,
    gatePitchUm,
    gateLengthUm,
    layers,
    cells,
  };
}
