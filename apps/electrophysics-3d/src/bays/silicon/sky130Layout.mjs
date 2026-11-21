/**
 * WP-3.4 — SKY130A per-cell polygon layout engine (pure, environment-free).
 *
 * Derives the true-to-scale polygon model for each verified Q4 primitive
 * directly from the normalized cad-spec (`sky130Spec.mjs`). 1 layout unit =
 * 1 µm horizontally; vertically the deposited film stack uses the spec's
 * DECLARED ×N exaggeration (scene_note) while the substrate is a declared
 * clip (see sky130Spec.substrateClipUm) — both surfaced in the viewer's
 * userData/status so the presentation scale is always explicit.
 *
 * Every emitted dimension is an exact JSON value or arithmetic OF JSON values:
 *   - finger x grid     : gate_pitch_um (0.48 µm), centered on the cell axis
 *   - finger width      : gate_length_um (0.15 µm)
 *   - finger depth      : full cell height (footprint_3d) — crosses both rows
 *   - well/psub rows    : footprint split into the 2-row CMOS structure the
 *                         spec itself describes (PMOS in nwell over the p
 *                         row, NMOS in psub over the n row — per
 *                         binary_comparison_cells.cmos_inv.structure)
 *   - li1 stubs         : 1:1 with poly fingers (spec counts are equal);
 *                         w = gate_length_um, d = gate_pitch_um − gate_length_um
 *   - met pads          : gate_pitch_um square (the declared pitch grid cell)
 *   - plug sizes (mcon/via/via2) : gate_length_um square, centered in the pad
 *   - rails (q4_thresh_det only, its footprint_3d declares "+ li1/met1 rails"):
 *     full-width straps over each diffusion row, depth = gate_pitch_um
 *   - via/via2/met2/met3 counts: 1:1 with the enumerated met1 pads (the spec
 *     enumerates only fingers/stubs/pads; the interconnect chain above met1
 *     is derived pad-for-pad, never invented)
 *
 * Fail-closed: if a derived finger span would not fit the declared footprint,
 * the derivation throws (bad spec) instead of silently clamping.
 *
 * This module must stay dependency-free and Node-importable (unit tests run
 * it directly under `node --test` on Node 20/22/24).
 */

/**
 * @typedef {{
 *   x: number, z: number, w: number, d: number,
 *   yBase: number, hScene: number,
 *   role: string,
 *   trace: string
 * }} LayoutPolygon Rect polygon in cell-local µm (x/z centered coords).
 *
 * @typedef {{
 *   key: string, thicknessUm: number, thicknessScene: number,
 *   yBase: number, yTop: number,
 *   colorHex: number, clearcoat: boolean,
 *   polygons: LayoutPolygon[]
 * }} LayoutLayer
 *
 * @typedef {{
 *   name: string, index: number, x: number, z: number, layer: string
 * }} LayoutPin
 *
 * @typedef {{
 *   cell: import('./sky130Spec.mjs').Sky130CellSpec,
 *   layers: LayoutLayer[],
 *   pins: LayoutPin[],
 *   counts: Record<string, number>,
 *   stackTopScene: number
 * }} CellLayout
 */

/**
 * Builds the polygon layout for one verified cell.
 * @param {import('./sky130Spec.mjs').Sky130Spec} spec
 * @param {string} cellName
 * @returns {CellLayout}
 */
export function buildCellLayout(spec, cellName) {
  const cell = spec.cells.find((c) => c.name === cellName);
  if (!cell) {
    throw new Error(`sky130 layout: unknown cell "${cellName}" (verified: ${spec.cells.map((c) => c.name).join(', ')})`);
  }
  const n = cell.polyFingers;
  const { gatePitchUm: pitch, gateLengthUm: gate } = spec;
  const W = cell.footprintWUm;
  const H = cell.footprintHUm;

  // Fail-closed geometric admission: the pitch-grid finger span must fit the
  // declared footprint — otherwise the spec numbers are contradictory.
  const fingerSpan = (n - 1) * pitch + gate;
  if (fingerSpan > W + 1e-9) {
    throw new Error(`sky130 layout: ${cellName} finger span ${fingerSpan} µm exceeds footprint width ${W} µm`);
  }
  if (2 * pitch > H + 1e-9) {
    throw new Error(`sky130 layout: ${cellName} diffusion rows (2 × ${pitch} µm) exceed footprint height ${H} µm`);
  }

  /** Finger centers on the JSON gate-pitch grid. @type {number[]} */
  const fingerX = [];
  for (let i = 0; i < n; i++) fingerX.push((i - (n - 1) / 2) * pitch);

  // Vertical stack — bottom to top in the JSON's declared order.
  // Substrate: declared clip (1:1 µm). Films: declared ×N exaggeration.
  let y = 0;
  const traceOf = (expr) => `01_sky130_primitives_geometry.json → ${expr}`;

  /** @type {LayoutLayer[]} */
  const layers = [];
  for (const layerSpec of spec.layers) {
    const thicknessScene =
      layerSpec.key === 'substrate' ? spec.substrateClipUm : layerSpec.thicknessUm * spec.verticalExaggeration;
    const yBase = y;
    const yTop = y + thicknessScene;
    /** @type {LayoutPolygon[]} */
    const polygons = [];

    const addRect = (x, z, w, d, hScene, role, trace) => {
      polygons.push({ x, z, w, d, yBase, hScene, role, trace });
    };

    switch (layerSpec.key) {
      case 'substrate':
        addRect(0, 0, W, H, thicknessScene, 'substrate-clip', traceOf('footprint_3d cell core (declared clip of 525 µm substrate)'));
        break;
      case 'nwell':
        // PMOS well: encloses the p diffusion row (top half of the footprint).
        addRect(0, H / 4, W, H / 2, thicknessScene, 'nwell-pmos', traceOf('cmos_inv.structure PMOS row + footprint_3d'));
        break;
      case 'psub':
        // p-substrate surface under the whole cell core.
        addRect(0, 0, W, H, thicknessScene, 'psub-surface', traceOf('verified_cells footprint_3d'));
        break;
      case 'diffusion':
        // Two active rows (NMOS over psub at z<0, PMOS in nwell at z>0),
        // each one gate-pitch deep (the declared row grid).
        addRect(0, -H / 4, W, pitch, thicknessScene, 'nmos-active', traceOf('cmos_inv.structure NMOS row + gate_pitch_um'));
        addRect(0, H / 4, W, pitch, thicknessScene, 'pmos-active', traceOf('cmos_inv.structure PMOS row + gate_pitch_um'));
        break;
      case 'poly':
        for (let i = 0; i < n; i++) {
          addRect(fingerX[i], 0, gate, H, thicknessScene, 'gate-finger', traceOf(`gate_length_um finger ${i + 1}/${n} on gate_pitch_um grid`));
        }
        break;
      case 'li1':
        for (let i = 0; i < cell.li1Stubs; i++) {
          // Gate-strap landing aligned 1:1 with its poly finger.
          addRect(fingerX[i], 0, gate, pitch - gate, thicknessScene, 'li1-stub', traceOf(`instance_count.li1_stubs ${i + 1}/${cell.li1Stubs} (pitch − gate_length gap grid)`));
        }
        if (cell.hasLi1Met1Rails) {
          addRect(0, H / 4, W, pitch, thicknessScene, 'li1-rail-vdd', traceOf('footprint_3d "+ li1/met1 rails" PMOS rail'));
          addRect(0, -H / 4, W, pitch, thicknessScene, 'li1-rail-gnd', traceOf('footprint_3d "+ li1/met1 rails" NMOS rail'));
        }
        break;
      case 'mcon':
        for (let i = 0; i < cell.met1Pads; i++) {
          addRect(fingerX[i], 0, gate, gate, thicknessScene, 'mcon-plug', traceOf(`li1→met1 plug ${i + 1}/${cell.met1Pads} (gate_length_um square)`));
        }
        break;
      case 'met1':
        for (let i = 0; i < cell.met1Pads; i++) {
          addRect(fingerX[i], 0, pitch, pitch, thicknessScene, 'met1-pad', traceOf(`instance_count.met1_pads ${i + 1}/${cell.met1Pads} (gate_pitch_um landing cell)`));
        }
        if (cell.hasLi1Met1Rails) {
          addRect(0, H / 4, W, pitch, thicknessScene, 'met1-rail-vdd', traceOf('footprint_3d "+ li1/met1 rails" PMOS rail'));
          addRect(0, -H / 4, W, pitch, thicknessScene, 'met1-rail-gnd', traceOf('footprint_3d "+ li1/met1 rails" NMOS rail'));
        }
        break;
      case 'via':
        for (let i = 0; i < cell.met1Pads; i++) {
          addRect(fingerX[i], 0, gate, gate, thicknessScene, 'via-plug', traceOf(`met1→met2 plug ${i + 1}/${cell.met1Pads} (derived pad-for-pad)`));
        }
        break;
      case 'met2':
        for (let i = 0; i < cell.met1Pads; i++) {
          addRect(fingerX[i], 0, pitch, pitch, thicknessScene, 'met2-pad', traceOf(`met2 landing ${i + 1}/${cell.met1Pads} (derived pad-for-pad)`));
        }
        break;
      case 'via2':
        for (let i = 0; i < cell.met1Pads; i++) {
          addRect(fingerX[i], 0, gate, gate, thicknessScene, 'via2-plug', traceOf(`met2→met3 plug ${i + 1}/${cell.met1Pads} (derived pad-for-pad)`));
        }
        break;
      case 'met3':
        for (let i = 0; i < cell.met1Pads; i++) {
          addRect(fingerX[i], 0, pitch, pitch, thicknessScene, 'met3-pin', traceOf(`cell pin ${i + 1}/${cell.met1Pads} on met3 (derived pad-for-pad)`));
        }
        break;
      default:
        throw new Error(`sky130 layout: no polygon derivation for layer "${layerSpec.key}"`);
    }
    layers.push({
      key: layerSpec.key,
      thicknessUm: layerSpec.thicknessUm,
      thicknessScene,
      yBase,
      yTop,
      colorHex: layerSpec.colorHex,
      clearcoat: layerSpec.clearcoat,
      polygons,
    });
    y = yTop;
  }

  /** @type {LayoutPin[]} */
  const pins = [];
  for (let i = 0; i < cell.met1Pads; i++) {
    pins.push({ name: `P${i + 1}`, index: i, x: fingerX[i], z: 0, layer: 'met3' });
  }

  /** @type {Record<string, number>} */
  const counts = {};
  for (const layer of layers) {
    for (const poly of layer.polygons) {
      counts[poly.role] = (counts[poly.role] ?? 0) + 1;
    }
  }

  return { cell, layers, pins, counts, stackTopScene: y };
}

/**
 * Builds layouts for all verified cells.
 * @param {import('./sky130Spec.mjs').Sky130Spec} spec
 * @returns {Map<string, CellLayout>}
 */
export function buildAllCellLayouts(spec) {
  const map = new Map();
  for (const cell of spec.cells) map.set(cell.name, buildCellLayout(spec, cell.name));
  return map;
}
