/**
 * WP-5.4 — parametric geometry derivation for the Quantum Lab rigs.
 *
 * PURE data layer: zero THREE.js, zero DOM, zero app state. Both the app
 * (vite) and the Node unit tests (`tests/quantum-rig-geometry.test.mjs`,
 * Node 20/22/24) import this exact module, so the rendered scene and the
 * tests cannot drift: every dimension the renderer uses is a return value
 * of this file, and every hardware dimension traces to
 * `data/cad-specs/03_quantum_hardware_rigs.json` (units: cm, Y-up scene).
 *
 * Where the JSON is silent about a *render* quantity (line tube radii,
 * viewport counts, segment counts) the value is derived from a spec number
 * by one of the named fractions below — there are no absolute invented
 * scene dimensions. Scene *placement* constants (what sits where on the
 * bench, camera framing) are declared once in SCENE and asserted by the
 * tests for app/test consistency.
 *
 * Generator contract (03 JSON §parametric_bindings): "Bay1Quantum renders
 * the cryostat/die/MZI/tweezer rig from these dimensions; stage temps drive
 * plate emissive via the cryo ODE; every dimension traces to 03/04/06 JSON
 * or this file."
 */

// ---------------------------------------------------------------------------
// Named render fractions — each render-only quantity is a fraction of a
// JSON-sourced dimension (never an absolute invented number).
// ---------------------------------------------------------------------------

export const RENDER = Object.freeze({
  /** Support-rod radius as a fraction of the 300 K plate thickness (0.1 cm → 0.045 cm). */
  ROD_RADIUS_OF_PLATE_THICKNESS: 0.45,
  /** G10 spacer disc radius as a fraction of the rod radius. */
  SPACER_RADIUS_OF_ROD: 1.6,
  /** G10 spacer disc thickness as a fraction of the plate thickness. */
  SPACER_THICKNESS_OF_PLATE: 0.3,
  /** Central cold-finger link radius as a fraction of the canister radius (0.52 → 0.052 cm). */
  LINK_RADIUS_OF_CANISTER: 0.1,
  /** Coax line tube radius as a fraction of the canister radius (0.52 → 0.0286 cm). */
  COAX_TUBE_RADIUS_OF_CANISTER: 0.055,
  /** Coax ring radius at each stage as a fraction of that stage's plate radius. */
  COAX_RING_OF_STAGE_RADIUS: 0.62,
  /** Coax radial start at the canister as a fraction of the canister radius. */
  COAX_START_OF_CANISTER: 0.8,
  /** Attenuator barrel radius as a fraction of the coax tube radius. */
  BARREL_RADIUS_OF_COAX: 2.2,
  /** Attenuator barrel length as a fraction of the coax tube radius. */
  BARREL_LENGTH_OF_COAX: 4,
  /** Thermal-strap tube radius as a fraction of the plate thickness (0.1 → 0.05 cm). */
  STRAP_RADIUS_OF_PLATE_THICKNESS: 0.5,
  /** Thermal strap edge radius as a fraction of its stage plate radius. */
  STRAP_EDGE_OF_STAGE_RADIUS: 0.75,
  /** Transmon die substrate thickness as a fraction of the die size (0.5 → 0.06 cm). */
  DIE_THICKNESS_OF_SIZE: 0.12,
  /** Qubit pad footprint as a fraction of the pad pitch (0.1 → 0.05 cm). */
  PAD_SIZE_OF_PITCH: 0.5,
  /** Qubit pad thickness as a fraction of the pad pitch. */
  PAD_THICKNESS_OF_PITCH: 0.06,
  /** Josephson-junction marker thickness as a fraction of its specified size (0.018 cm). */
  JJ_THICKNESS_OF_SIZE: 0.5,
  /** CPW serpentine lateral amplitude as a fraction of the conductor width (keeps the meander clear of the pad grid). */
  CPW_AMPLITUDE_OF_WIDTH: 0.6,
  /** MZI die thickness as a fraction of min(width, height) (1.2 → 0.09 cm). */
  MZI_DIE_THICKNESS_OF_MIN: 0.075,
  /** MZI arm lateral offset as a fraction of the die height (1.2 → 0.09 cm). */
  MZI_ARM_OFFSET_OF_HEIGHT: 0.075,
  /** MZI waveguide tube radius as a fraction of the arm offset (0.09 → 0.0162 cm). */
  MZI_TUBE_OF_ARM_OFFSET: 0.18,
  /** MZI edge margin (for grating couplers) as a fraction of the die width. */
  MZI_EDGE_MARGIN_OF_WIDTH: 0.05,
  /** MZI directional-coupler length as a fraction of the die width (1.7 → 0.17 cm). */
  MZI_COUPLER_LENGTH_OF_WIDTH: 0.1,
  /** MZI directional-coupler z-extent as a multiple of the arm offset (0.09 → 0.27 cm). */
  MZI_COUPLER_Z_OF_ARM: 3,
  /** MZI directional-coupler height as a fraction of the die thickness. */
  MZI_COUPLER_H_OF_DIE: 0.4,
  /** MZI heater pad length as a fraction of the die width (1.7 → 0.255 cm). */
  MZI_HEATER_LENGTH_OF_WIDTH: 0.15,
  /** MZI heater pad width as a fraction of the die width. */
  MZI_HEATER_WIDTH_OF_WIDTH: 0.04,
  /** MZI heater pad height as a fraction of the die thickness. */
  MZI_HEATER_H_OF_DIE: 0.3,
  /** MZI heater pad x position as a fraction of the die width. */
  MZI_HEATER_X_OF_WIDTH: 0.22,
  /** MZI grating fin count per coupler (presentation rib count). */
  MZI_GRATING_FINS: 6,
  /** MZI grating fin thickness as a fraction of the die width. */
  MZI_GRATING_FIN_T_OF_WIDTH: 0.008,
  /** MZI grating fin span across the waveguide as a fraction of the die width. */
  MZI_GRATING_FIN_W_OF_WIDTH: 0.03,
  /** MZI grating fin height as a fraction of the die thickness. */
  MZI_GRATING_FIN_H_OF_DIE: 0.5,
  /** Optical-table thickness as a fraction of min(width, height) (1.8 → 0.12 cm). */
  TABLE_THICKNESS_OF_MIN: 0.1,
  /** UHV chamber radius as a fraction of the optical-table width (2.4 → 1.08 cm). */
  CHAMBER_RADIUS_OF_TABLE_W: 0.45,
  /** UHV chamber height as a fraction of the optical-table height (1.8 → 1.08 cm). */
  CHAMBER_HEIGHT_OF_TABLE_H: 0.6,
  /** UHV chamber wall thickness as a fraction of the chamber radius. */
  CHAMBER_WALL_OF_RADIUS: 0.03,
  /** UHV viewport count (quadrant glass viewports; spec says "glass viewports"). */
  CHAMBER_VIEWPORTS: 4,
  /** UHV viewport disc radius as a fraction of the chamber radius (0.9 → 0.234 cm). */
  VIEWPORT_RADIUS_OF_CHAMBER: 0.26,
  /** Atom focal plane height inside the chamber as a fraction of the chamber height. */
  ATOM_PLANE_OF_CHAMBER_HEIGHT: 0.45,
  /** Rydberg beam radius as a fraction of the atom radius (0.035 → 0.049 cm). */
  RYDBERG_BEAM_OF_ATOM: 1.4,
  /** Rydberg focus-cone radius as a fraction of the beam radius. */
  RYDBERG_CONE_OF_BEAM: 2.2,
  /** Rydberg focus-cone length as a fraction of the beam radius. */
  RYDBERG_CONE_LEN_OF_BEAM: 6,
  /** Trap-beam radius as a fraction of the atom radius (0.035 → 0.021 cm). */
  TRAP_BEAM_OF_ATOM: 0.6,
  /** Blockade-halo inner ring radius as a fraction of the blockade radius (0.085 → 0.07 cm). */
  HALO_INNER_OF_RADIUS: 0.82,
  /** Bloch sphere shell tessellation (presentation segment counts). */
  BLOCH_SEGMENTS: Object.freeze({ width: 20, height: 14 }),
});

// ---------------------------------------------------------------------------
// Scene placement constants — bench layout / camera framing (not hardware
// dimensions). Declared once here and asserted for app/test consistency.
// ---------------------------------------------------------------------------

export const SCENE = Object.freeze({
  /** MZI chip mount height above the floor (cm). */
  MZI_MOUNT_Y_CM: 1.35,
  /** Optical-table top surface height above the floor (cm). */
  TWEEZER_TABLE_TOP_Y_CM: 1.2,
  /** In-scene Bloch instrument positions (HUD overlay, default OFF). */
  BLOCH_POSITIONS: Object.freeze([
    Object.freeze([-2.35, 3.3, 0.4]),
    Object.freeze([0, 3.9, 0.4]),
    Object.freeze([2.35, 3.3, 0.4]),
  ]),
});

// ---------------------------------------------------------------------------
// Token parsers — the spec encodes some values inside human-readable
// strings; they are parsed, never re-hardcoded.
// ---------------------------------------------------------------------------

const HEX_RE = /#([0-9a-fA-F]{6})\b/;
const KEYVAL_RE = /(metalness|roughness|clearcoat)\s*[:=]?\s*([0-9]*\.?[0-9]+)/gi;
const TEMP_RE = /^([0-9]*\.?[0-9]+)\s*(mk|k)$/i;
const PAD_GRID_RE = /([0-9]+)\s*[×xX]\s*([0-9]+)[^0-9]*([0-9]*\.?[0-9]+)\s*cm\s*pitch/i;
const TC_RE = /([0-9]*\.?[0-9]+)\s*K\b/;

/**
 * Named-material fallbacks for spec strings that carry no hex token. Keys
 * are lowercase substrings of the JSON material strings.
 */
const NAMED_MATERIALS = {
  'soi dark silicon': { colorHex: 0x2a313c, metalness: 0.6, roughness: 0.14, clearcoat: 0.5 },
  'sapphire': { colorHex: 0x10141c, metalness: 0.4, roughness: 0.08, clearcoat: 0.8 },
  'brushed gold': { colorHex: 0xd4af37, metalness: 0.92, roughness: 0.24 },
  'gold marker': { colorHex: 0xd9a441, metalness: 0.92, roughness: 0.22 },
  'gold pads': { colorHex: 0xd4af37, metalness: 0.92, roughness: 0.24 },
  'metallic heater': { colorHex: 0x9aa2ad, metalness: 0.9, roughness: 0.35 },
  'stainless': { colorHex: 0x9aa2ad, metalness: 0.9, roughness: 0.3 },
  'niobium silver': { colorHex: 0xaab2bd, metalness: 0.9, roughness: 0.28 },
  'silicon ridge': { colorHex: 0xffc46b, metalness: 0.3, roughness: 0.3 },
  'matte black': { colorHex: 0x1c212b, metalness: 0.35, roughness: 0.6 },
  'braided ofhc copper': { colorHex: 0x8a6f4d, metalness: 0.8, roughness: 0.55 },
  'atoms': { colorHex: 0xff6d8a, metalness: 0.1, roughness: 0.4 },
  'g10': { colorHex: 0x2e4a35, metalness: 0.1, roughness: 0.7 },
};

/**
 * @typedef {Object} MaterialParams
 * @property {number} colorHex 0xRRGGBB parsed from the spec string.
 * @property {number} metalness
 * @property {number} roughness
 * @property {number} clearcoat
 * @property {string} label
 */

/**
 * Parse `#rrggbb` + `metalness/roughness/clearcoat` tokens out of a spec
 * material string (e.g. "24k brushed gold #d4af37, metalness 0.92,
 * roughness 0.24"). Named fallbacks complete strings that omit tokens.
 * @param {string} str
 * @param {string} [fallbackLabel]
 * @returns {MaterialParams}
 */
export function parseMaterialSpec(str, fallbackLabel = '') {
  if (typeof str !== 'string' || str.length === 0) {
    throw new TypeError(`rigSpec: material string expected, got ${JSON.stringify(str)}`);
  }
  const hexMatch = HEX_RE.exec(str);
  let colorHex = hexMatch ? parseInt(hexMatch[1], 16) : null;
  const params = { metalness: null, roughness: null, clearcoat: null };
  for (const m of str.matchAll(KEYVAL_RE)) {
    params[m[1].toLowerCase()] = Number(m[2]);
  }
  if (colorHex === null || params.metalness === null || params.roughness === null) {
    let named = null;
    for (const [needle, mat] of Object.entries(NAMED_MATERIALS)) {
      if (str.toLowerCase().includes(needle)) { named = mat; break; }
    }
    if (named) {
      if (colorHex === null) colorHex = named.colorHex;
      if (params.metalness === null) params.metalness = named.metalness;
      if (params.roughness === null) params.roughness = named.roughness;
      if (params.clearcoat === null && named.clearcoat) params.clearcoat = named.clearcoat;
    }
  }
  if (colorHex === null || params.metalness === null || params.roughness === null) {
    throw new TypeError(`rigSpec: cannot resolve PBR params from material string "${str}"`);
  }
  return { colorHex, metalness: params.metalness, roughness: params.roughness, clearcoat: params.clearcoat ?? 0, label: fallbackLabel || str };
}

/**
 * `"300 K"` → 300, `"15 mK"` → 0.015 (throws on unparseable labels — fail closed).
 * @param {string} label
 * @returns {number}
 */
export function parseTemperatureK(label) {
  const m = TEMP_RE.exec(String(label).trim());
  if (!m) throw new TypeError(`rigSpec: cannot parse stage temperature from label "${label}"`);
  const value = Number(m[1]);
  return m[2].toLowerCase() === 'mk' ? value / 1000 : value;
}

/**
 * `"4×4 gold pads, 0.1 cm pitch"` → `{ rows: 4, cols: 4, pitchCm: 0.1 }`.
 * @param {string} str
 */
export function parsePadGrid(str) {
  const m = PAD_GRID_RE.exec(String(str));
  if (!m) throw new TypeError(`rigSpec: cannot parse pad grid from "${str}"`);
  return { rows: Number(m[1]), cols: Number(m[2]), pitchCm: Number(m[3]) };
}

/**
 * Parse `"Al Tc ≈ 1.2 K — …"` → 1.2 (the Al superconducting transition).
 * @param {string} note
 * @returns {number|null}
 */
export function parseTransitionTempK(note) {
  const m = TC_RE.exec(String(note));
  return m ? Number(m[1]) : null;
}

/**
 * Parse stage routing into consecutive stage pairs. Handles both chain
 * form (`"canister → 4 K → 100 mK → 15 mK"`) and comma-separated pairs
 * (`"4 K→100 mK, 100 mK→15 mK"`): tokens are chained *within* each
 * comma-separated segment, never across segments.
 * @param {string} routing
 * @returns {Array<[string, string]>}
 */
export function parseRoutePairs(routing) {
  const TOKEN_RE = /([0-9]*\.?[0-9]+\s*m?K)/gi;
  const pairs = [];
  for (const segment of String(routing).split(/[,;]|\band\b/i)) {
    const tokens = [...segment.matchAll(TOKEN_RE)].map((m) => m[1].replace(/\s+/g, ' ').trim());
    for (let i = 0; i + 1 < tokens.length; i++) {
      pairs.push([tokens[i], tokens[i + 1]]);
    }
  }
  return pairs;
}

/**
 * Wavelength (nm) → CSS hex, using the standard CIE-approximation ramp
 * (Bruton's public-domain algorithm, intensity-falloff softened toward the
 * IR ends for presentation). Drives the laser-beam hues from the JSON
 * `rydberg_nm` / `trap_nm` values.
 * @param {number} nm
 * @returns {number} 0xRRGGBB
 */
export function wavelengthToHex(nm) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; g = 0; b = 1; }
  else if (nm < 490) { r = 0; g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { r = 0; g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; b = 0; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; b = 0; }
  else { r = 1; g = 0; b = 0; }
  let factor = 1;
  if (nm >= 380 && nm < 420) factor = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700) factor = Math.max(0.3, 0.3 + (0.7 * (780 - nm)) / 80);
  const channel = (v) => {
    const base = Math.max(0, Math.min(1, v)) ** 0.8;
    return Math.round(255 * (base * factor + (1 - factor) * 0.25));
  };
  return (channel(r) << 16) | (channel(g) << 8) | channel(b);
}

// ---------------------------------------------------------------------------
// Validation — fail closed on malformed specs (never render a guess).
// ---------------------------------------------------------------------------

function requireObject(json, key, parent = 'root') {
  const value = json?.[key];
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`rigSpec: ${parent}.${key} must be an object`);
  }
  return value;
}

function requireNumber(obj, key, parent = 'root') {
  const value = obj?.[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`rigSpec: ${parent}.${key} must be a finite number, got ${JSON.stringify(value)}`);
  }
  return value;
}

function requireString(obj, key, parent = 'root') {
  const value = obj?.[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`rigSpec: ${parent}.${key} must be a non-empty string`);
  }
  return value;
}

/**
 * Validate the raw cad-specs 03 JSON and return a frozen copy. Throws a
 * precise TypeError on any missing/malformed section — fail closed.
 * @param {object} json
 */
export function loadQuantumRigSpec(json) {
  if (json === null || typeof json !== 'object') throw new TypeError('rigSpec: spec JSON must be an object');
  requireObject(json, 'dilution_cryostat');
  const stages = json.dilution_cryostat.stages;
  if (!Array.isArray(stages) || stages.length < 2) {
    throw new TypeError('rigSpec: dilution_cryostat.stages must list >= 2 stages');
  }
  stages.forEach((s, i) => {
    if (!s || typeof s.label !== 'string') throw new TypeError(`rigSpec: stages[${i}].label missing`);
    parseTemperatureK(s.label);
    requireNumber(s, 'y_cm', `stages[${i}]`);
    requireNumber(s, 'plate_radius_cm', `stages[${i}]`);
  });
  for (let i = 1; i < stages.length; i++) {
    if (stages[i].y_cm >= stages[i - 1].y_cm) {
      throw new TypeError(`rigSpec: stages must descend in y (warm → cold); stages[${i}] violates this`);
    }
  }
  requireObject(json, 'transmon_die');
  parsePadGrid(requireString(json.transmon_die, 'pad_grid', 'transmon_die'));
  requireObject(json.transmon_die, 'coplanar_waveguides');
  requireObject(json.transmon_die, 'josephson_junctions');
  requireObject(json, 'photonic_mzi_chip');
  requireObject(json.photonic_mzi_chip, 'size_cm');
  requireObject(json, 'neutral_atom_uhv_chamber');
  requireObject(json.neutral_atom_uhv_chamber, 'optical_table');
  requireObject(json.neutral_atom_uhv_chamber, 'tweezer_grid');
  requireObject(json, 'bloch_instrumentation');
  requireNumber(json.bloch_instrumentation, 'sphere_radius_cm', 'bloch_instrumentation');
  return Object.freeze({ ...json });
}

// ---------------------------------------------------------------------------
// Derived geometry — dilution cryostat
// ---------------------------------------------------------------------------

/**
 * Dilution cryostat: gold-plated OFHC stages, canister, support rods with
 * G10 spacers, coaxial microwave lines with attenuator barrels, braided
 * thermal straps, cold-finger links. All dimensions from the JSON.
 * @param {object} json
 */
export function deriveCryostat(json) {
  const cryo = json.dilution_cryostat;
  const stages = cryo.stages.map((s) => ({
    label: s.label,
    tempK: parseTemperatureK(s.label),
    yCm: s.y_cm,
    radiusCm: s.plate_radius_cm,
    // The spec dimensions one plate (300 K, plate_thickness_cm); the plates
    // are a matched set, so the same thickness applies to all stages.
    thicknessCm: cryo.stages[0].plate_thickness_cm,
    coolingPowerW: s.cooling_power_w ?? null,
    material: parseMaterialSpec(s.color ?? cryo.stages[0].color, `stage-${s.label}`),
    name: `stage-${String(s.label).replace(/\s+/g, '')}`,
  }));

  const canisterSpec = cryo.components.find((c) => c.name === 'canister');
  if (!canisterSpec) throw new TypeError('rigSpec: cryostat components must include the canister');
  const canister = {
    radiusCm: requireNumber(canisterSpec, 'radius_cm', 'canister'),
    heightCm: requireNumber(canisterSpec, 'height_cm', 'canister'),
    // Sits on top of the 300 K plate.
    centerYCm: stages[0].yCm + stages[0].thicknessCm / 2 + canisterSpec.height_cm / 2,
    material: parseMaterialSpec(canisterSpec.material, 'canister'),
  };

  const rodSpec = cryo.components.find((c) => c.name === 'support rods');
  if (!rodSpec) throw new TypeError('rigSpec: cryostat components must include support rods');
  const rodRadiusCm = stages[0].thicknessCm * RENDER.ROD_RADIUS_OF_PLATE_THICKNESS;
  const supportRods = {
    count: rodSpec.count,
    ringRadiusCm: (stages[0].radiusCm + stages[stages.length - 1].radiusCm) / 2,
    radiusCm: rodRadiusCm,
    lengthCm: stages[0].yCm - stages[stages.length - 1].yCm,
    centerYCm: (stages[0].yCm + stages[stages.length - 1].yCm) / 2,
    material: parseMaterialSpec('stainless', 'support-rods'),
    // G10 spacers at stage boundaries (spec: "G10 spacers implied at stage boundaries").
    spacers: stages.slice(1, -1).map((s) => ({
      yCm: s.yCm,
      radiusCm: rodRadiusCm * RENDER.SPACER_RADIUS_OF_ROD,
      thicknessCm: stages[0].thicknessCm * RENDER.SPACER_THICKNESS_OF_PLATE,
    })),
  };

  const coaxSpec = cryo.components.find((c) => c.name === 'coaxial microwave lines');
  if (!coaxSpec) throw new TypeError('rigSpec: cryostat components must include coaxial microwave lines');
  const tubeRadiusCm = canister.radiusCm * RENDER.COAX_TUBE_RADIUS_OF_CANISTER;
  const coaxLines = {
    count: coaxSpec.count,
    tubeRadiusCm,
    material: parseMaterialSpec(coaxSpec.material, 'coax-lines'),
    // Routing: canister → 4 K → 100 mK → 15 mK (waypoints at each stage ring).
    waypoints: (angle) => [
      {
        x: Math.cos(angle) * canister.radiusCm * RENDER.COAX_START_OF_CANISTER,
        y: canister.centerYCm - canister.heightCm / 2,
        z: Math.sin(angle) * canister.radiusCm * RENDER.COAX_START_OF_CANISTER,
      },
      ...stages.slice(1).map((s) => ({
        x: Math.cos(angle) * s.radiusCm * RENDER.COAX_RING_OF_STAGE_RADIUS,
        y: s.yCm,
        z: Math.sin(angle) * s.radiusCm * RENDER.COAX_RING_OF_STAGE_RADIUS,
      })),
    ],
    // Attenuator barrels at each stage below 300 K (spec routing note).
    barrels: stages.slice(1).map((s) => ({
      yCm: s.yCm,
      ringRadiusCm: s.radiusCm * RENDER.COAX_RING_OF_STAGE_RADIUS,
      radiusCm: tubeRadiusCm * RENDER.BARREL_RADIUS_OF_COAX,
      lengthCm: tubeRadiusCm * RENDER.BARREL_LENGTH_OF_COAX,
    })),
  };

  const strapSpec = cryo.components.find((c) => c.name === 'thermal straps');
  if (!strapSpec) throw new TypeError('rigSpec: cryostat components must include thermal straps');
  const pairs = parseRoutePairs(strapSpec.routing);
  if (pairs.length !== strapSpec.count) {
    throw new TypeError(`rigSpec: strap routing yields ${pairs.length} routes but count specifies ${strapSpec.count}`);
  }
  const stageByLabel = (label) => {
    const found = stages.find((s) => s.label === label);
    if (!found) throw new TypeError(`rigSpec: strap routing references unknown stage "${label}"`);
    return found;
  };
  const thermalStraps = {
    count: strapSpec.count,
    material: parseMaterialSpec(strapSpec.material, 'thermal-straps'),
    radiusCm: stages[0].thicknessCm * RENDER.STRAP_RADIUS_OF_PLATE_THICKNESS,
    routes: pairs.map(([fromLabel, toLabel], i) => {
      const from = stageByLabel(fromLabel);
      const to = stageByLabel(toLabel);
      const angle = (i / Math.max(1, pairs.length)) * Math.PI * 2 + 0.9;
      return {
        from: fromLabel,
        to: toLabel,
        points: [
          {
            x: Math.cos(angle) * from.radiusCm * RENDER.STRAP_EDGE_OF_STAGE_RADIUS,
            y: from.yCm,
            z: Math.sin(angle) * from.radiusCm * RENDER.STRAP_EDGE_OF_STAGE_RADIUS,
          },
          {
            x: Math.cos(angle + 0.3) * to.radiusCm * RENDER.STRAP_EDGE_OF_STAGE_RADIUS,
            y: (from.yCm + to.yCm) / 2,
            z: Math.sin(angle + 0.3) * to.radiusCm * RENDER.STRAP_EDGE_OF_STAGE_RADIUS,
          },
          {
            x: Math.cos(angle + 0.15) * to.radiusCm * RENDER.STRAP_EDGE_OF_STAGE_RADIUS,
            y: to.yCm,
            z: Math.sin(angle + 0.15) * to.radiusCm * RENDER.STRAP_EDGE_OF_STAGE_RADIUS,
          },
        ],
      };
    }),
  };

  // Central cold-finger links between consecutive plates (gold-plated OFHC).
  const coldLinks = stages.slice(1).map((s, i) => ({
    fromLabel: stages[i].label,
    toLabel: s.label,
    yFromCm: stages[i].yCm,
    yToCm: s.yCm,
    radiusCm: canister.radiusCm * RENDER.LINK_RADIUS_OF_CANISTER,
    material: stages[i].material,
  }));

  return Object.freeze({ stages: Object.freeze(stages), canister, supportRods, coaxLines, thermalStraps, coldLinks });
}

// ---------------------------------------------------------------------------
// Derived geometry — transmon die (mounted on the 15 mK mixing chamber)
// ---------------------------------------------------------------------------

/**
 * 16-qubit sapphire transmon die: substrate, 4×4 gold pad grid, 3 meandering
 * niobium λ/4 CPW resonators threading the corridors between pad columns,
 * 16 Al/AlOx/Al junction markers. All dims from the JSON.
 * @param {object} json
 * @param {object} cryostat derived cryostat (for the 15 mK stage mount point)
 */
export function deriveTransmonDie(json, cryostat) {
  const die = json.transmon_die;
  const sizeCm = requireNumber(die, 'size_cm', 'transmon_die');
  const substrate = parseMaterialSpec(die.substrate, 'transmon-substrate');
  const thicknessCm = sizeCm * RENDER.DIE_THICKNESS_OF_SIZE;

  const grid = parsePadGrid(die.pad_grid);
  const pitchCm = grid.pitchCm;
  const padSizeCm = pitchCm * RENDER.PAD_SIZE_OF_PITCH;
  const padThicknessCm = pitchCm * RENDER.PAD_THICKNESS_OF_PITCH;
  const halfSpan = { x: ((grid.cols - 1) / 2) * pitchCm, z: ((grid.rows - 1) / 2) * pitchCm };
  const pads = {
    rows: grid.rows,
    cols: grid.cols,
    pitchCm,
    sizeCm: padSizeCm,
    thicknessCm: padThicknessCm,
    material: parseMaterialSpec('gold pads', 'qubit-pads'),
    positions: [],
  };
  for (let ix = 0; ix < grid.cols; ix++) {
    for (let iz = 0; iz < grid.rows; iz++) {
      pads.positions.push({ x: -halfSpan.x + ix * pitchCm, z: -halfSpan.z + iz * pitchCm });
    }
  }

  const cpwSpec = die.coplanar_waveguides;
  const cpwWidthCm = requireNumber(cpwSpec, 'conductor_width_cm', 'coplanar_waveguides');
  const cpwSpanCm = requireNumber(cpwSpec, 'meander_span_cm', 'coplanar_waveguides');
  const cpwRows = requireNumber(cpwSpec, 'rows', 'coplanar_waveguides');
  // Rows thread the corridors between pad columns: z = 0 and ±(padHalf + pitch/2).
  const rowPitchCm = halfSpan.z + pitchCm / 2;
  const amplitudeCm = cpwWidthCm * RENDER.CPW_AMPLITUDE_OF_WIDTH;
  const cpw = {
    rows: cpwRows,
    spanCm: cpwSpanCm,
    widthCm: cpwWidthCm,
    tubeRadiusCm: cpwWidthCm / 2,
    amplitudeCm,
    material: parseMaterialSpec(cpwSpec.material, 'cpw-resonators'),
    rowZs: [],
    paths: [],
  };
  for (let r = 0; r < cpwRows; r++) {
    cpw.rowZs.push((r - (cpwRows - 1) / 2) * rowPitchCm);
  }
  const CPW_SEGMENTS = 8;
  for (const rowZ of cpw.rowZs) {
    const path = [];
    for (let i = 0; i <= CPW_SEGMENTS; i++) {
      const interior = i > 0 && i < CPW_SEGMENTS;
      path.push({
        x: -cpwSpanCm / 2 + (i / CPW_SEGMENTS) * cpwSpanCm,
        z: rowZ + (interior && i % 2 === 0 ? -amplitudeCm : amplitudeCm * (interior ? 1 : 0)),
      });
    }
    cpw.paths.push(path);
  }

  const jjSpec = die.josephson_junctions;
  const jjCount = requireNumber(jjSpec, 'count', 'josephson_junctions');
  const jjSizeCm = requireNumber(jjSpec, 'marker_size_cm', 'josephson_junctions');
  if (jjCount !== pads.positions.length) {
    throw new TypeError(`rigSpec: ${jjCount} junction markers vs ${pads.positions.length} pads — spec inconsistent`);
  }
  const junctions = {
    count: jjCount,
    sizeCm: jjSizeCm,
    thicknessCm: jjSizeCm * RENDER.JJ_THICKNESS_OF_SIZE,
    material: parseMaterialSpec(jjSpec.material, 'jj-markers'),
    positions: pads.positions,
  };

  // Mount on the 15 mK mixing-chamber stage (the coldest stage).
  const baseStage = cryostat.stages[cryostat.stages.length - 1];
  const dieCenterYCm = baseStage.yCm + baseStage.thicknessCm / 2 + thicknessCm / 2;
  const topYCm = dieCenterYCm + thicknessCm / 2;

  return Object.freeze({
    sizeCm,
    thicknessCm,
    substrate,
    dieCenterYCm,
    topYCm,
    padsYCm: topYCm + padThicknessCm / 2,
    junctionYCm: topYCm + padThicknessCm + (jjSizeCm * RENDER.JJ_THICKNESS_OF_SIZE) / 2,
    pads,
    cpw,
    junctions,
    superconductingTransitionK: parseTransitionTempK(die.superconducting_transition_note),
  });
}

// ---------------------------------------------------------------------------
// Derived geometry — silicon photonic MZI chip
// ---------------------------------------------------------------------------

/**
 * SOI Mach–Zehnder interferometer: die, 2 × 1550 nm waveguide arms,
 * 1 directional coupler, thermo-optic heater pads (Pπ from the spec), 2 edge
 * grating couplers. All dims from the JSON.
 * @param {object} json
 */
export function deriveMzi(json) {
  const chip = json.photonic_mzi_chip;
  const w = requireNumber(chip.size_cm, 'w', 'photonic_mzi_chip.size_cm');
  const h = requireNumber(chip.size_cm, 'h', 'photonic_mzi_chip.size_cm');
  const thicknessCm = Math.min(w, h) * RENDER.MZI_DIE_THICKNESS_OF_MIN;
  const substrate = parseMaterialSpec(chip.substrate, 'mzi-substrate');
  const marginCm = w * RENDER.MZI_EDGE_MARGIN_OF_WIDTH;

  const wgSpec = chip.waveguides;
  const wgCount = requireNumber(wgSpec, 'count', 'waveguides');
  const armOffsetCm = h * RENDER.MZI_ARM_OFFSET_OF_HEIGHT;
  const waveguides = {
    count: wgCount,
    armOffsetCm,
    tubeRadiusCm: armOffsetCm * RENDER.MZI_TUBE_OF_ARM_OFFSET,
    material: parseMaterialSpec(wgSpec.material, 'mzi-waveguides'),
    // 1550 nm C-band presentation glow (from the spec material string).
    presentationNm: 1550,
    paths: [],
  };
  for (let i = 0; i < wgCount; i++) {
    const armZ = wgCount === 1 ? 0 : (i - (wgCount - 1) / 2) * 2 * armOffsetCm;
    waveguides.paths.push([
      { x: -w / 2 + marginCm, y: 0, z: 0 },
      { x: -w / 4, y: 0, z: armZ },
      { x: w / 4, y: 0, z: armZ },
      { x: w / 2 - marginCm, y: 0, z: 0 },
    ]);
  }

  const couplerSpec = chip.directional_couplers;
  const coupler = {
    count: couplerSpec.count,
    lengthCm: w * RENDER.MZI_COUPLER_LENGTH_OF_WIDTH,
    zSizeCm: armOffsetCm * RENDER.MZI_COUPLER_Z_OF_ARM,
    heightCm: thicknessCm * RENDER.MZI_COUPLER_H_OF_DIE,
    material: parseMaterialSpec(couplerSpec.material, 'mzi-coupler'),
    position: { x: 0, z: 0 },
  };

  const heaterSpec = chip.thermo_optic_heaters;
  const heaters = {
    pPiMw: requireNumber(heaterSpec, 'p_pi_mw', 'thermo_optic_heaters'),
    count: wgCount,
    material: parseMaterialSpec(heaterSpec.material, 'mzi-heaters'),
    pads: waveguides.paths.map((p) => ({
      xCm: w * RENDER.MZI_HEATER_X_OF_WIDTH,
      zCm: p[1].z,
      lengthCm: w * RENDER.MZI_HEATER_LENGTH_OF_WIDTH,
      widthCm: w * RENDER.MZI_HEATER_WIDTH_OF_WIDTH,
      heightCm: thicknessCm * RENDER.MZI_HEATER_H_OF_DIE,
    })),
  };

  const gratingSpec = chip.edge_grating_couplers;
  const gratings = {
    count: gratingSpec.count,
    finCount: RENDER.MZI_GRATING_FINS,
    finThicknessCm: w * RENDER.MZI_GRATING_FIN_T_OF_WIDTH,
    finWidthCm: w * RENDER.MZI_GRATING_FIN_W_OF_WIDTH,
    finHeightCm: thicknessCm * RENDER.MZI_GRATING_FIN_H_OF_DIE,
    positions: [],
  };
  for (let i = 0; i < gratingSpec.count; i++) {
    const x = gratingSpec.count === 1 ? 0 : (i - (gratingSpec.count - 1) / 2) * (w - 2 * marginCm);
    gratings.positions.push({ x, z: 0 });
  }

  return Object.freeze({
    die: { widthCm: w, heightCm: h, thicknessCm, mountYCm: SCENE.MZI_MOUNT_Y_CM, substrate },
    waveguides,
    coupler,
    heaters,
    gratings,
    edgeMarginCm: marginCm,
  });
}

// ---------------------------------------------------------------------------
// Derived geometry — neutral-atom UHV chamber + optical tweezer grid
// ---------------------------------------------------------------------------

/**
 * 87Rb neutral-atom rig: matte-black optical table, stainless UHV chamber
 * with glass viewports, tweezer array, Rydberg blockade halos, Rydberg +
 * trap laser beams. All dims from the JSON; beam hues derived from the nm
 * wavelengths. @param {object} json
 */
export function deriveTweezer(json) {
  const rig = json.neutral_atom_uhv_chamber;

  const tableSpec = rig.optical_table;
  const tableW = requireNumber(tableSpec.size_cm, 'w', 'optical_table.size_cm');
  const tableH = requireNumber(tableSpec.size_cm, 'h', 'optical_table.size_cm');
  const table = {
    widthCm: tableW,
    depthCm: tableH,
    thicknessCm: Math.min(tableW, tableH) * RENDER.TABLE_THICKNESS_OF_MIN,
    topYCm: SCENE.TWEEZER_TABLE_TOP_Y_CM,
    material: parseMaterialSpec(tableSpec.material, 'optical-table'),
  };

  // Atom focal plane: the chamber mid-height working distance (the tweezer
  // array is focused through the viewports onto this plane). Viewports and
  // laser beams all align to it.
  const gridSpec = rig.tweezer_grid;
  const pitchCm = requireNumber(gridSpec, 'lattice_pitch_cm', 'tweezer_grid');
  const chamberRadiusCm = tableW * RENDER.CHAMBER_RADIUS_OF_TABLE_W;
  const chamberHeightCm = tableH * RENDER.CHAMBER_HEIGHT_OF_TABLE_H;
  const chamberBaseYCm = table.topYCm + table.thicknessCm / 2;
  const atomPlaneYCm = chamberBaseYCm + chamberHeightCm * RENDER.ATOM_PLANE_OF_CHAMBER_HEIGHT;

  const chamber = {
    radiusCm: chamberRadiusCm,
    heightCm: chamberHeightCm,
    wallThicknessCm: chamberRadiusCm * RENDER.CHAMBER_WALL_OF_RADIUS,
    baseYCm: chamberBaseYCm,
    centerYCm: chamberBaseYCm + chamberHeightCm / 2,
    material: parseMaterialSpec('stainless', 'uhv-chamber'),
    viewportCount: RENDER.CHAMBER_VIEWPORTS,
    viewportRadiusCm: chamberRadiusCm * RENDER.VIEWPORT_RADIUS_OF_CHAMBER,
    viewportYCm: atomPlaneYCm,
    vacuumTorr: rig.chamber.vacuum_torr,
  };

  const rows = requireNumber(gridSpec, 'rows', 'tweezer_grid');
  const cols = requireNumber(gridSpec, 'cols', 'tweezer_grid');
  const atomRadiusCm = requireNumber(gridSpec, 'atom_radius_cm', 'tweezer_grid');
  const gridHalfSpanCm = { x: ((cols - 1) / 2) * pitchCm, z: ((rows - 1) / 2) * pitchCm };
  const atoms = {
    rows,
    cols,
    pitchCm,
    radiusCm: atomRadiusCm,
    material: parseMaterialSpec(`atoms ${gridSpec.atom_color}`, 'tweezer-atoms'),
    planeYCm: atomPlaneYCm,
    trapDepthMhz: requireNumber(gridSpec, 'trap_depth_mhz', 'tweezer_grid'),
    positions: [],
  };
  for (let ix = 0; ix < cols; ix++) {
    for (let iz = 0; iz < rows; iz++) {
      atoms.positions.push({ x: -gridHalfSpanCm.x + ix * pitchCm, z: -gridHalfSpanCm.z + iz * pitchCm });
    }
  }

  const haloSpec = rig.rydberg_blockade_halos;
  const haloRadiusCm = requireNumber(haloSpec, 'radius_cm', 'rydberg_blockade_halos');
  const haloCount = requireNumber(haloSpec, 'count', 'rydberg_blockade_halos');
  // Deterministic sparse subset of the lattice (every 2nd column × every 3rd
  // row) until the specified count is reached — atoms inside each other's
  // blockade radius (V = C6/r⁶ > Ω, C6 = 500 GHz·µm⁶ per 04 JSON).
  const halos = {
    radiusCm: haloRadiusCm,
    innerRadiusCm: haloRadiusCm * RENDER.HALO_INNER_OF_RADIUS,
    count: haloCount,
    planeYCm: atomPlaneYCm,
    positions: [],
  };
  outer: for (let ix = 0; ix < cols; ix += 2) {
    for (let iz = 0; iz < rows; iz += 3) {
      if (halos.positions.length >= haloCount) break outer;
      halos.positions.push({ x: -gridHalfSpanCm.x + ix * pitchCm, z: -gridHalfSpanCm.z + iz * pitchCm });
    }
  }
  if (halos.positions.length !== haloCount) {
    throw new TypeError(`rigSpec: cannot place ${haloCount} blockade halos on a ${cols}×${rows} lattice`);
  }

  const laserSpec = rig.lasers;
  const rydbergNm = requireNumber(laserSpec, 'rydberg_nm', 'lasers');
  const trapNm = requireNumber(laserSpec, 'trap_nm', 'lasers');
  const lasers = {
    rydberg: {
      nm: rydbergNm,
      colorHex: wavelengthToHex(rydbergNm),
      beamRadiusCm: atomRadiusCm * RENDER.RYDBERG_BEAM_OF_ATOM,
      lengthCm: chamberRadiusCm * 2,
      coneRadiusCm: atomRadiusCm * RENDER.RYDBERG_BEAM_OF_ATOM * RENDER.RYDBERG_CONE_OF_BEAM,
      coneLengthCm: atomRadiusCm * RENDER.RYDBERG_BEAM_OF_ATOM * RENDER.RYDBERG_CONE_LEN_OF_BEAM,
      planeYCm: atomPlaneYCm,
    },
    trap: {
      nm: trapNm,
      colorHex: wavelengthToHex(trapNm),
      beamRadiusCm: atomRadiusCm * RENDER.TRAP_BEAM_OF_ATOM,
      lengthCm: chamberRadiusCm * 2,
      planeYCm: atomPlaneYCm,
      // Enters through a viewport tilted off the atom plane (presentation).
      angleRad: Math.PI / 9,
    },
  };

  return Object.freeze({ table, chamber, atoms, halos, lasers });
}

// ---------------------------------------------------------------------------
// Derived geometry — Bloch instrumentation
// ---------------------------------------------------------------------------

/**
 * Docked Bloch instrumentation (bottom-dock Bloch tab, q0..q2, fed by
 * Lindblad readouts; in-scene HUD overlay default OFF). @param {object} json
 */
export function deriveBloch(json) {
  const bloch = json.bloch_instrumentation;
  return Object.freeze({
    sphereRadiusCm: requireNumber(bloch, 'sphere_radius_cm', 'bloch_instrumentation'),
    dockedPanel: bloch.docked_panel,
    hudDefaultOn: false,
    positions: SCENE.BLOCH_POSITIONS,
  });
}

// ---------------------------------------------------------------------------
// One-shot derivation for the whole bay
// ---------------------------------------------------------------------------

/**
 * Derive every Quantum Lab rig from the raw cad-specs 03 JSON. This is the
 * single entry point used by `bay1Quantum.ts`; the returned object is frozen
 * and carries `sourceId` for provenance badges.
 * @param {object} json raw `data/cad-specs/03_quantum_hardware_rigs.json`
 */
export function deriveAll(json) {
  const spec = loadQuantumRigSpec(json);
  const cryostat = deriveCryostat(spec);
  const transmon = deriveTransmonDie(spec, cryostat);
  const mzi = deriveMzi(spec);
  const tweezer = deriveTweezer(spec);
  const bloch = deriveBloch(spec);
  return Object.freeze({
    sourceId: spec.id,
    units: spec.units,
    cryostat,
    transmon,
    mzi,
    tweezer,
    bloch,
    stageTempsK: cryostat.stages.map((s) => s.tempK),
    superconductingTransitionK: transmon.superconductingTransitionK ?? 1.2,
  });
}
