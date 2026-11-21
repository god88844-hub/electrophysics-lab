/**
 * WP-1.5 — fixed-size 60 Hz solver-frame telemetry pipeline.
 *
 * The renderer-side contract of `docs/master-plan/schemas/solver-frame.schema.json`:
 * physics/quantum workers publish simulation state at 60 Hz and the 3D
 * renderer, ViewCube and hover telemetry all read ONE pre-allocated frame
 * envelope whose arrays are fixed-size typed views. Steady-state ingestion
 * performs **zero per-frame JS heap allocation** — the envelope and every
 * typed array are allocated exactly once, and per-frame work is only typed
 * -array writes plus monotonic counters.
 *
 * Node topology is learned once per netlist change (event-driven, never per
 * frame); non-finite values are refused (clamped to the last honest zero) per
 * the fail-closed discipline; overflow beyond the §2.3 admission budgets
 * (≤ 64 MNA nodes) is refused, never silently grown.
 *
 * Plain ESM (no imports) so the Node 20/22/24 unit tests (tests/wp15-solver
 * -frame.test.mjs) and the browser bundle share the exact same implementation
 * — same pattern as src/bays/silicon/sky130Spec.mjs.
 */

export const SOLVER_FRAME_FORMAT = 'invention-lab/solver-frame/1';

/** `provenance.badge` enum — exactly the solver-frame.schema.json enum. */
export const PROVENANCE_BADGES = Object.freeze([
  'SIMULATED_PHYSICS_MODEL',
  'SIMULATED_ARCHITECTURAL_MODEL',
  'SIMULATED_NOISY_QUANTUM',
  'ORACLE_VERIFIED_AGAINST_NGSPICE',
]);

/** Fixed frame capacities. 64 nodes/currents == the MNA admission budget (02_SYSTEM_ARCHITECTURE.md §2.3). */
export const FRAME_CAPACITY = Object.freeze({
  circuits: 8,
  nodesPerCircuit: 64,
  currentsPerCircuit: 64,
  tiles: 8,
  blochQubits: 8, // ≥ the 6-qubit interactive admission cap (headroom)
  tileActivity: 64, // schema: "64 normalized per-tile switching activities"
  busLevels: 64,
});

/** SoC block ids of the physics worker's PCB tile grid (physics.worker.ts TILES). */
export const FRAME_TILE_IDS = Object.freeze(['cpu', 'tpu', 'gpu', 'mem']);

const AMBIENT_C = 27; // 300 K bench ambient (heat grids' ambientK)

// Module-scope scratch for canonicalizing per-block tile temps (zero alloc).
const tileScratch = new Float64Array(FRAME_CAPACITY.tiles);

/**
 * Allocate the frame envelope + typed views exactly once. Every consumer
 * (renderer visuals, ViewCube, hover callout, Playwright probes) reads this
 * same object — "frames, not ad-hoc state".
 */
export function createSolverFrameState() {
  const circuits = new Array(FRAME_CAPACITY.circuits);
  for (let i = 0; i < FRAME_CAPACITY.circuits; i++) {
    circuits[i] = {
      id: '',
      nodeVoltages: new Float64Array(FRAME_CAPACITY.nodesPerCircuit),
      nodeCount: 0,
      currents: new Float64Array(FRAME_CAPACITY.currentsPerCircuit),
      currentCount: 0,
      vgsMax: 0,
      vgsMaxNode: null,
    };
  }
  return {
    format: SOLVER_FRAME_FORMAT,
    frameId: 0, // monotonic frame counter (schema: integer ≥ 0)
    tSimS: 0,
    live: true, // false while replaying the forensic ring buffer
    circuits,
    circuitCount: 0,
    // Ingest topology tables — rebuilt only on netlist changes.
    nodeKeys: [],
    nodeKeyIndex: new Map(),
    currentKeys: [],
    currentKeyIndex: new Map(),
    // Named scalars from the last snapshot (runtime-only; not schema fields).
    vdd: 0,
    thermal: {
      gridMaxC: AMBIENT_C,
      traceC: AMBIENT_C,
      junctionC: AMBIENT_C,
      pcbC: AMBIENT_C,
      cryoK: 0.015,
      tiles: new Float64Array(FRAME_CAPACITY.tiles),
      tileCount: 0,
    },
    quantum: {
      bloch: new Float64Array(FRAME_CAPACITY.blochQubits * 4), // x,y,z,purity per qubit
      blochCount: 0,
      gateFidelity: null,
    },
    soc: {
      tileActivity: new Float64Array(FRAME_CAPACITY.tileActivity),
      busLevels: new Float64Array(FRAME_CAPACITY.busLevels),
    },
    provenance: {
      badge: 'SIMULATED_PHYSICS_MODEL',
      solver: 'packages/physics-engine (MNA + FTCS heat + cryo ODE)',
    },
    // View telemetry published per render frame by CameraRig (pre-allocated).
    view: {
      q: new Float64Array(4), // camera orientation quaternion x,y,z,w (origin lookAt)
      azimuth: 0,
      elevation: 0,
      radius: 16,
      ortho: false,
      frameStamp: 0,
    },
    // iGPU quality governor state (published by engine/renderer.ts).
    quality: { level: 'high', pixelRatio: 1, changes: 0 },
    stats: { ingested: 0, quantumIngests: 0, lastIngestMs: 0 },
  };
}

const fin = (v, fallback) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/**
 * Copy `record` (key → number) into the pre-allocated typed view. New keys are
 * registered once (netlist event); beyond-capacity keys are refused honestly.
 * Returns the populated count. Steady-state calls allocate nothing.
 */
function fillRecord(keys, index, target, record) {
  let n = 0;
  if (!record) return 0;
  for (const k in record) {
    let idx = index.get(k);
    if (idx === undefined) {
      idx = keys.length;
      if (idx >= target.length) continue; // admission-bounded refusal (§2.3)
      keys.push(k);
      index.set(k, idx);
    }
    const v = record[k];
    target[idx] = typeof v === 'number' && Number.isFinite(v) ? v : 0;
    if (idx >= n) n = idx + 1;
  }
  return n;
}

/**
 * Ingest one physics worker snapshot into the frame envelope (allocation-free
 * in steady state). `opts.live = false` marks forensic-replay frames.
 */
export function ingestSnapshot(state, snapshot, opts = {}) {
  if (!snapshot) return state;
  const t0 = performance.now();
  state.frameId += 1;
  state.tSimS = Math.max(0, fin(snapshot.t, 0));
  state.live = opts.live !== undefined ? Boolean(opts.live) : true;
  state.vdd = fin(snapshot.vdd, 0);

  // circuits[0]: the active single-workspace bench solve.
  const c = state.circuits[0];
  c.id = 'bench';
  c.nodeCount = fillRecord(state.nodeKeys, state.nodeKeyIndex, c.nodeVoltages, snapshot.nodes);
  c.currentCount = fillRecord(state.currentKeys, state.currentKeyIndex, c.currents, snapshot.currents);
  c.vgsMax = fin(snapshot.vgsMax, 0);
  c.vgsMaxNode = snapshot.vgsMaxNode ?? null;
  state.circuitCount = 1;

  const th = state.thermal;
  const temps = snapshot.temps ?? {};
  th.traceC = fin(temps.traceC, th.traceC);
  th.junctionC = fin(temps.junctionC, th.junctionC);
  th.pcbC = fin(temps.pcbC, th.pcbC);
  th.cryoK = fin(temps.cryoK, th.cryoK);
  th.gridMaxC = fin(snapshot.tempMaxC, Math.max(th.traceC, th.junctionC, th.pcbC));
  let tileCount = 0;
  if (temps.tiles && typeof temps.tiles === 'object') {
    const ids = Object.keys(temps.tiles);
    for (let i = 0; i < ids.length && tileCount < FRAME_CAPACITY.tiles; i++) {
      th.tiles[tileCount] = fin(temps.tiles[ids[i]], AMBIENT_C);
      tileCount++;
    }
    // Canonicalize into FRAME_TILE_IDS order (cpu/tpu/gpu/mem) so id-indexed
    // reads are stable regardless of the worker's key iteration order.
    if (tileCount > 0) {
      for (let i = 0; i < tileCount; i++) {
        const src = indexIn(ids, FRAME_TILE_IDS[i]);
        tileScratch[i] = src >= 0 && src < tileCount ? th.tiles[src] : AMBIENT_C;
      }
      for (let i = 0; i < tileCount; i++) th.tiles[i] = tileScratch[i];
    }
  }
  th.tileCount = tileCount;

  // SoC switching activity: normalized per-block steady-state ΔT over ambient
  // (solver-derived — temperature ∝ dissipated energy ∝ switching activity).
  const soc = state.soc;
  let maxDt = 0;
  for (let i = 0; i < tileCount; i++) {
    const dt = th.tiles[i] - AMBIENT_C;
    if (dt > maxDt) maxDt = dt;
  }
  for (let i = 0; i < FRAME_CAPACITY.tileActivity; i++) {
    soc.tileActivity[i] = i < tileCount && maxDt > 1e-6 ? (th.tiles[i] - AMBIENT_C) / maxDt : 0;
  }
  // Bus levels: solver node voltages normalized to their full-scale rails.
  const voutBin = readNode(state, 'vout_bin');
  const voutQ4 = readNode(state, 'vout_q4');
  const vdd = state.vdd > 1e-9 ? state.vdd : 1;
  soc.busLevels[0] = clamp01(voutBin / vdd);
  soc.busLevels[1] = clamp01(voutQ4 / 1.8); // Q4 LDO full scale (03_multiradix baselines)
  for (let i = 2; i < FRAME_CAPACITY.busLevels; i++) soc.busLevels[i] = 0;

  state.stats.ingested += 1;
  state.stats.lastIngestMs = performance.now() - t0;
  return state;
}

function indexIn(arr, want) {
  for (let i = 0; i < arr.length; i++) if (arr[i] === want) return i;
  return -1;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Ingest quantum Bloch-vector telemetry (quantumClient.onState payload). */
export function ingestQuantum(state, bloch, gateFidelity) {
  const q = state.quantum;
  const n = Array.isArray(bloch) ? Math.min(bloch.length, FRAME_CAPACITY.blochQubits) : 0;
  for (let i = 0; i < n; i++) {
    const b = bloch[i] ?? {};
    const o = i * 4;
    q.bloch[o] = fin(b.x, 0);
    q.bloch[o + 1] = fin(b.y, 0);
    q.bloch[o + 2] = fin(b.z, 0);
    q.bloch[o + 3] = fin(b.purity, 0);
  }
  q.blochCount = n;
  q.gateFidelity = gateFidelity === null || gateFidelity === undefined ? null : fin(gateFidelity, null);
  state.stats.quantumIngests += 1;
  return state;
}

/**
 * Publish the render-frame camera orientation (CameraRig calls this once per
 * rendered frame; ViewCube reads it instead of ad-hoc closures).
 */
export function setView(state, quat, view = {}) {
  const v = state.view;
  v.q[0] = quat.x;
  v.q[1] = quat.y;
  v.q[2] = quat.z;
  v.q[3] = quat.w;
  v.azimuth = fin(view.azimuth, v.azimuth);
  v.elevation = fin(view.elevation, v.elevation);
  v.radius = fin(view.radius, v.radius);
  v.ortho = Boolean(view.ortho);
  v.frameStamp += 1;
  return state;
}

/** Publish iGPU quality-governor state (engine/renderer.ts applyQuality). */
export function setQuality(state, level, pixelRatio) {
  const q = state.quality;
  if (q.level !== level) q.changes += 1;
  q.level = level;
  q.pixelRatio = fin(pixelRatio, q.pixelRatio);
  return state;
}

/** Drop learned topology so a recompiled netlist re-registers keys once. */
export function resetTopology(state) {
  state.nodeKeys.length = 0;
  state.currentKeys.length = 0;
  state.nodeKeyIndex.clear();
  state.currentKeyIndex.clear();
  return state;
}

/** Typed-view readers (index lookup only — zero allocation). */
export function readNode(state, key) {
  const idx = state.nodeKeyIndex.get(key);
  return idx === undefined ? 0 : state.circuits[0].nodeVoltages[idx];
}
export function readCurrent(state, key) {
  const idx = state.currentKeyIndex.get(key);
  return idx === undefined ? 0 : state.circuits[0].currents[idx];
}
export function readTileC(state, id) {
  for (let i = 0; i < state.thermal.tileCount; i++) {
    if (FRAME_TILE_IDS[i] === id) return state.thermal.tiles[i];
  }
  return null;
}

/** Canonical block id for tile slot `i` (or null beyond the populated count). */
export function tileIdAt(state, i) {
  return i >= 0 && i < state.thermal.tileCount && i < FRAME_TILE_IDS.length ? FRAME_TILE_IDS[i] : null;
}

/**
 * Serialize the runtime frame to the exact solver-frame.schema.json shape
 * (typed arrays → plain arrays). Used by validators/tests, never per frame.
 */
export function solverFrameToJSON(state, opts = {}) {
  const trim = opts.trim !== false;
  const circuits = [];
  const nCircuits = trim ? state.circuitCount : FRAME_CAPACITY.circuits;
  for (let i = 0; i < nCircuits; i++) {
    const c = state.circuits[i];
    const nn = trim ? c.nodeCount : FRAME_CAPACITY.nodesPerCircuit;
    const cn = trim ? c.currentCount : FRAME_CAPACITY.currentsPerCircuit;
    circuits.push({
      id: c.id,
      nodeVoltages: Array.from(c.nodeVoltages.subarray(0, nn)),
      currents: Array.from(c.currents.subarray(0, cn)),
      vgsMax: c.vgsMax,
      vgsMaxNode: c.vgsMaxNode,
    });
  }
  const tiles = {};
  for (let i = 0; i < state.thermal.tileCount; i++) tiles[FRAME_TILE_IDS[i]] = state.thermal.tiles[i];
  const bloch = [];
  for (let i = 0; i < state.quantum.blochCount; i++) {
    const o = i * 4;
    bloch.push({ x: state.quantum.bloch[o], y: state.quantum.bloch[o + 1], z: state.quantum.bloch[o + 2], purity: state.quantum.bloch[o + 3] });
  }
  return {
    format: state.format,
    frameId: state.frameId,
    tSimS: state.tSimS,
    live: state.live,
    circuits,
    thermal: {
      gridMaxC: state.thermal.gridMaxC,
      tiles,
      traceC: state.thermal.traceC,
      junctionC: state.thermal.junctionC,
      cryoK: state.thermal.cryoK,
    },
    quantum: { bloch, gateFidelity: state.quantum.gateFidelity },
    soc: {
      tileActivity: Array.from(state.soc.tileActivity),
      busLevels: Array.from(state.soc.busLevels),
    },
    provenance: { badge: state.provenance.badge, solver: state.provenance.solver },
  };
}

const isNumArray = (v) => Array.isArray(v) || v instanceof Float64Array || v instanceof Float32Array;
function allFinite(v) {
  const n = v.length;
  for (let i = 0; i < n; i++) {
    const x = v[i];
    if (typeof x !== 'number' || !Number.isFinite(x)) return false;
  }
  return true;
}

/**
 * Validate a solver-frame schema instance against
 * docs/master-plan/schemas/solver-frame.schema.json. Returns `{ ok, errors }`.
 * Accepts plain arrays as well as the schema-blessed Float64Array typed views
 * for the numeric-array fields whose schema descriptions name them
 * ("nodeVoltages: Float64Array over serialized node indices"). The runtime
 * envelope (tiles/bloch held as strided typed views) is validated through its
 * serialization — `frameStore.validate()` does exactly that.
 */
export function validateSolverFrame(frame) {
  const errors = [];
  const bad = (msg) => errors.push(msg);
  if (!frame || typeof frame !== 'object') {
    return { ok: false, errors: ['frame is not an object'], checked: 1 };
  }
  for (const key of ['format', 'frameId', 'tSimS', 'circuits', 'thermal', 'provenance']) {
    if (frame[key] === undefined) bad(`missing required "${key}"`);
  }
  if (errors.length > 0) return { ok: false, errors, checked: 7 };

  if (frame.format !== SOLVER_FRAME_FORMAT) bad(`format must be "${SOLVER_FRAME_FORMAT}"`);
  if (!Number.isInteger(frame.frameId) || frame.frameId < 0) bad('frameId must be an integer ≥ 0');
  if (typeof frame.tSimS !== 'number' || !Number.isFinite(frame.tSimS) || frame.tSimS < 0) {
    bad('tSimS must be a finite number ≥ 0');
  }
  if (frame.live !== undefined && typeof frame.live !== 'boolean') bad('live must be boolean');
  if (!Array.isArray(frame.circuits)) bad('circuits must be an array');
  else {
    frame.circuits.forEach((c, i) => {
      if (!c || typeof c !== 'object') return bad(`circuits[${i}] is not an object`);
      if (typeof c.id !== 'string') bad(`circuits[${i}].id must be a string`);
      for (const arr of ['nodeVoltages', 'currents']) {
        if (!isNumArray(c[arr])) bad(`circuits[${i}].${arr} must be an array or Float64Array`);
        else if (!allFinite(c[arr])) bad(`circuits[${i}].${arr} contains a non-finite value`);
      }
      if (c.vgsMax !== undefined && typeof c.vgsMax !== 'number') bad(`circuits[${i}].vgsMax must be a number`);
      if (c.vgsMaxNode !== undefined && c.vgsMaxNode !== null && typeof c.vgsMaxNode !== 'string') {
        bad(`circuits[${i}].vgsMaxNode must be a string or null`);
      }
    });
  }
  const th = frame.thermal;
  if (!th || typeof th !== 'object') bad('thermal must be an object');
  else {
    if (typeof th.gridMaxC !== 'number' || !Number.isFinite(th.gridMaxC)) bad('thermal.gridMaxC must be a finite number');
    if (th.tiles !== undefined && (typeof th.tiles !== 'object' || Array.isArray(th.tiles) || th.tiles instanceof Float64Array)) {
      bad('thermal.tiles must be an object (block id → °C)');
    }
    for (const k of ['traceC', 'junctionC', 'cryoK']) {
      if (th[k] !== undefined && (typeof th[k] !== 'number' || !Number.isFinite(th[k]))) bad(`thermal.${k} must be a finite number`);
    }
  }
  const q = frame.quantum;
  if (q !== undefined) {
    if (!q || typeof q !== 'object') bad('quantum must be an object');
    else {
      if (q.bloch !== undefined) {
        if (!Array.isArray(q.bloch)) bad('quantum.bloch must be an array');
        else {
          q.bloch.forEach((b, i) => {
            for (const k of ['x', 'y', 'z', 'purity']) {
              if (typeof b?.[k] !== 'number' || !Number.isFinite(b[k])) bad(`quantum.bloch[${i}].${k} must be a finite number`);
            }
          });
        }
      }
      if (q.gateFidelity !== undefined && q.gateFidelity !== null && typeof q.gateFidelity !== 'number') {
        bad('quantum.gateFidelity must be a number or null');
      }
    }
  }
  const soc = frame.soc;
  if (soc !== undefined) {
    if (!soc || typeof soc !== 'object') bad('soc must be an object');
    else {
      for (const k of ['tileActivity', 'busLevels']) {
        if (soc[k] !== undefined) {
          if (!isNumArray(soc[k])) bad(`soc.${k} must be an array or Float64Array`);
          else if (!allFinite(soc[k])) bad(`soc.${k} contains a non-finite value`);
        }
      }
    }
  }
  const pv = frame.provenance;
  if (!pv || typeof pv !== 'object') bad('provenance must be an object');
  else {
    if (!PROVENANCE_BADGES.includes(pv.badge)) bad(`provenance.badge must be one of ${PROVENANCE_BADGES.join(' | ')}`);
    if (pv.solver !== undefined && typeof pv.solver !== 'string') bad('provenance.solver must be a string');
  }
  return { ok: errors.length === 0, errors, checked: 30 };
}

// ---------------------------------------------------------------------------
// Singleton — the app-wide frame surface (renderer, ViewCube, hover, tests).
// ---------------------------------------------------------------------------
export const frameStore = createSolverFrameState();

frameStore.ingestSnapshot = (snapshot, opts) => ingestSnapshot(frameStore, snapshot, opts);
frameStore.ingestQuantum = (bloch, gateFidelity) => ingestQuantum(frameStore, bloch, gateFidelity);
frameStore.setView = (quat, view) => setView(frameStore, quat, view);
frameStore.setQuality = (level, pixelRatio) => setQuality(frameStore, level, pixelRatio);
frameStore.resetTopology = () => resetTopology(frameStore);
frameStore.readNode = (key) => readNode(frameStore, key);
frameStore.readCurrent = (key) => readCurrent(frameStore, key);
frameStore.readTileC = (id) => readTileC(frameStore, id);
frameStore.tileIdAt = (i) => tileIdAt(frameStore, i);
frameStore.toJSON = (opts) => solverFrameToJSON(frameStore, opts);
frameStore.validate = () => validateSolverFrame(solverFrameToJSON(frameStore));
