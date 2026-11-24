// @ts-nocheck
/** WP-6.1. Exact-byte, import-free curriculum verification and telemetry grading. */
const MANIFEST_SEAL = '4bb701612b85988bf13d88cab3a580a3c1b0e0343aafa33163eaaf15555a9be9';
const FILE = '01_academy_missions.json';
const PHYSICS = 'SIMULATED_PHYSICS_MODEL';
const ARCHITECTURE = 'SIMULATED_ARCHITECTURAL_MODEL';
const QUANTUM = 'SIMULATED_NOISY_QUANTUM';
const APPROVED = new WeakSet();

/** @param {Uint8Array} bytes */
async function sha256(bytes) {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (n) => n.toString(16).padStart(2, '0')).join('');
}

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
}

/** @param {Uint8Array} missionBytes @param {Uint8Array} manifestBytes */
export async function verifyCurriculum(missionBytes, manifestBytes) {
  if (!(missionBytes instanceof Uint8Array) || !(manifestBytes instanceof Uint8Array)
    || missionBytes.length > 65536 || manifestBytes.length > 8192) {
    throw Error('Academy curriculum byte input exceeds the allowed format or size');
  }
  // Copy once so the checked bytes cannot change while WebCrypto is running.
  const bytes = Uint8Array.from(missionBytes);
  const manifest = Uint8Array.from(manifestBytes);
  if (await sha256(manifest) !== MANIFEST_SEAL) {
    throw Error('Academy manifest SHA-256 mismatch');
  }
  const read = (b) => JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(b));
  const layout = read(manifest);
  const entry = layout.files.find((f) => f.file === FILE);
  if (layout.format !== 'invention-lab/reference-library-manifest/1'
    || !entry || entry.size_bytes !== bytes.length || await sha256(bytes) !== entry.sha256) {
    throw Error('Academy curriculum SHA-256 or byte length mismatch');
  }
  const data = read(bytes);
  if (data.provenance_status !== 'verified_offline_standard'
    || data.missions.length !== Object.keys(RUBRIC).length) throw Error('Invalid Academy curriculum');
  for (const m of data.missions) {
    const rubric = RUBRIC[m.id];
    if (!rubric || m.pass_criteria.length !== rubric.tests.length
      || m.pass_criteria.some((rule, i) => rule.check !== rubric.tests[i][0])) {
      throw Error('Unsupported Academy rubric for ' + m.id);
    }
  }
  const verified = freeze({ ...data, seal: entry.sha256 });
  APPROVED.add(verified);
  return verified;
}

/** @param {unknown} n @param {string} field */
function finite(n, field) {
  if (typeof n !== 'number' || !Number.isFinite(n)) throw Error('Missing or non-finite ' + field);
  return n;
}

function label(n, field) {
  if (typeof n !== 'string' || !n.trim()) throw Error('Missing ' + field);
  return n;
}

function truth(n, field) {
  if (typeof n !== 'boolean') throw Error('Missing ' + field);
  return n;
}

function list(items, field, count) {
  if (!Array.isArray(items) || items.length > 10000 || (count !== undefined && items.length !== count)) {
    throw Error('Missing or incomplete ' + field);
  }
  for (let i = 0; i < items.length; i++) {
    if (!Object.hasOwn(items, i)) throw Error('Missing or incomplete ' + field);
  }
  return items;
}

function near(value, ref, eps) {
  return Math.abs(value - ref) <= eps;
}

function nonnegative(value, field) {
  const n = finite(value, field);
  if (n < 0) throw Error('Out-of-range ' + field);
  return n;
}

function event(observation, type, threshold, inclusive, severity) {
  if (observation === null) return false; // Solver ran and explicitly reported no event.
  const value = finite(observation?.value, 'event value');
  const reported = finite(observation.threshold, 'event threshold');
  const kind = label(observation.type, 'event type');
  const level = label(observation.severity, 'event severity');
  return kind === type && level === severity && reported === threshold
    && (inclusive ? value >= threshold : value > threshold);
}

function equation(t, expected) {
  if (t.failure === null) return false;
  return label(t.failure?.governingEquation, 'forensic equation').includes(expected);
}

function arraysAgree(actual, reference, mismatch) {
  const values = list(actual, 'macro measurements');
  const expected = list(reference, 'internal measurements', values.length);
  if (values.length === 0) throw Error('Missing sensitized measurements');
  return values.map((v, i) => {
    const a = nonnegative(v, 'macro measurement');
    const b = nonnegative(expected[i], 'internal measurement');
    return near(a, b, b * mismatch);
  }).every(Boolean);
}

const LEVELS = [0, 0.6, 1.2, 1.8];

function matrix(raw, rows, cols, name, signedByte = false) {
  return list(raw, name, rows).map((r) => list(r, name + ' row', cols).map((v) => {
    const n = finite(v, name + ' entry');
    if (!Number.isSafeInteger(n) || (signedByte && (n < -127 || n > 127))) throw Error('Invalid ' + name + ' entry');
    return n;
  }));
}

function sweep(raw) {
  const items = list(raw, 'QEC sweep', 8);
  return items.map((row, i) => {
    const p = finite(row?.p, 'physical error rate');
    const logical = finite(row?.logical, 'logical error rate');
    const bitflip = finite(row?.bitflip, 'bit-flip logical rate');
    if (p !== (i + 1) / 100 || logical < 0 || logical > 1 || bitflip < 0 || bitflip > 1) throw Error('Invalid QEC rates');
    return [p, logical, bitflip];
  });
}

const RUBRIC = {
  'M1-MOSFET-IV': { badge: PHYSICS, tests: [
    ['solver_output', (t) => {
      const id = nonnegative(t.high?.idA, 'Id at 1.8 V');
      const vd = nonnegative(t.high?.vdsV, 'Vds');
      const lambda = nonnegative(t.lambda, 'channel-length modulation');
      const vgs = finite(t.high?.vgsV, 'Vgs at 1.8 V');
      const ref = 0.5 * 0.004 * (1.8 - 0.55) ** 2 * (1 + lambda * vd);
      return near(vgs, 1.8, 1e-9) && near(id, ref, ref * 0.05);
    }],
    ['solver_output', (t) => {
      const low = nonnegative(t.low?.idA, 'Id at 0.6 V');
      const high = nonnegative(t.high?.idA, 'Id at 1.8 V');
      const vgs = finite(t.low?.vgsV, 'Vgs at 0.6 V');
      return near(vgs, 0.6, 1e-9) && low < 0.01 * high;
    }],
  ] },
  'M2-OXIDE-SOA': { badge: PHYSICS, tests: [
    ['failure_event', (t) => event(t.failure, 'gate_oxide_breakdown', 1.95, false, 'fault')],
    ['forensic_report', (t) => equation(t, 'ln(TTF) = ln(A) − γ·Vgs (γ ≈ 300 dec/V)')],
    ['ai_fix', (t) => {
      if (t.retest === null) return false;
      const { maxVdd, vdd, ticks, trips } = t.retest ?? {};
      return [nonnegative(maxVdd, 'AI Fix clamp') <= 1.8, nonnegative(vdd, 're-test rail') <= 1.8,
        finite(ticks, 're-test ticks') > 0, nonnegative(trips, 're-test trips') === 0].every(Boolean);
    }],
  ] },
  'M3-CU-FUSING': { badge: PHYSICS, tests: [
    ['failure_event', (t) => event(t.failure, 'trace_fusing', 1085, true, 'fault')],
    ['forensic_report', (t) => [equation(t, 'P = I²·R(T)'), equation(t, 'Onderdonk:')].every(Boolean)],
  ] },
  'M4-Q4-INVERTER': { badge: PHYSICS, tests: [
    ['solver_output', (t) => list(t.levels, 'Q4 sweep', 4).map((x, i) => {
      const input = finite(x?.inputV, 'Q4 input level');
      const output = finite(x?.outputV, 'Q4 output level');
      return near(input, LEVELS[i], 1e-12) && near(output, LEVELS[3 - i], 0.3 + 1e-12);
    }).every(Boolean)],
    ['solver_output', (t) => list(t.levels, 'Q4 sweep', 4).map((x) =>
      finite(x?.marginV, 'Q4 noise margin') >= 0.3 - 1e-12).every(Boolean)],
  ] },
  'M5-CUSTOM-IC': { badge: PHYSICS, tests: [
    ['macro_model', (t) => [
      arraysAgree(t.arcDelayNs, t.internalDelayNs, 0.05),
      arraysAgree(t.cycleEnergyJ, t.internalEnergyJ, 0.10),
    ].every(Boolean)],
    ['reusability', (t) => {
      const verified = truth(t.sealVerified, 'package seal verification');
      const replay = list(t.replayedLogic, 'fresh schematic output', 2).map((x) => finite(x, 'macro digit'));
      const expected = list(t.internalLogic, 'internal logic output', 2).map((x) => finite(x, 'internal digit'));
      return verified && replay.every((x, i) => (x === 0 || x === 1) && x === expected[i]);
    }],
  ] },
  'M6-TPU-GEMM': { badge: ARCHITECTURE, tests: [
    ['exact_output', (t) => {
      const a = matrix(t.a, 32, 32, 'INT8 A', true);
      const b = matrix(t.b, 32, 32, 'INT8 B', true);
      const c = matrix(t.c, 32, 32, 'INT32 C');
      return c.every((row, i) => row.every((value, j) =>
        value === a[i].reduce((sum, v, k) => sum + v * b[k][j], 0)));
    }],
    ['cycle_model', (t) => {
      const grid = finite(t.grid, 'array width');
      const cycles = finite(t.cycles, 'systolic cycles');
      return grid === 8 && cycles === Math.ceil(32 / grid) ** 2 * (32 + 2 * grid - 2);
    }],
    ['thermal', (t) => {
      const activity = list(t.activity, 'per-tile activity', 64).map((v) => finite(v, 'tile activity'));
      const colors = list(t.colors, 'Fourier tile colors', 64).map((v) => finite(v, 'tile color'));
      const baseline = list(t.idleColors, 'idle color control', 64).map((v) => finite(v, 'tile idle color'));
      return [...activity, ...colors, ...baseline].every((v) => v >= 0 && v <= 1)
        && activity.some((v) => v > 0) && activity.every((v, i) => v === 0 || colors[i] > baseline[i]);
    }],
  ] },
  'M7-UNIFIED-MEMORY': { badge: ARCHITECTURE, tests: [
    ['comparison', (t) => nonnegative(t.unifiedCycles, 'unified cycles') < nonnegative(t.discreteCycles, 'discrete cycles')],
    ['comparison', (t) => nonnegative(t.q4Bytes, 'Q4 bus bytes') < nonnegative(t.int8Bytes, 'INT8 bus bytes')],
    ['badge', (t) => label(t.resultBadge, 'architecture result badge') === ARCHITECTURE],
  ] },
  'M8-DVFS-THERMAL': { badge: ARCHITECTURE, tests: [
    ['failure_event', (t) => event(t.failure, 'si_thermal_runaway', 200, true, 'warn')],
    ['controller', (t) => {
      const history = list(t.controller, 'DVFS control samples');
      if (history.length === 0) throw Error('Missing DVFS control samples');
      return history.map((s) => {
        const temp = finite(s?.tempC, 'DVFS junction temperature');
        const before = nonnegative(s?.beforeMHz, 'commanded clock');
        const after = nonnegative(s?.afterMHz, 'applied clock');
        return temp > 125 && after < before;
      }).some(Boolean);
    }],
  ] },
  'M9-LINDBLAD-DECAY': { badge: QUANTUM, tests: [
    ['solver_output', (t) => {
      const p = finite(t.population, 'population at T1');
      const elapsed = finite(t.populationAtUs, 'population observation time');
      return elapsed === 100 && near(p, Math.exp(-1), 0.02);
    }],
    ['solver_output', (t) => {
      const c = finite(t.coherence, 'coherence at T2');
      const elapsed = finite(t.coherenceAtUs, 'coherence observation time');
      return elapsed === 150 && near(c, 0.5 * Math.exp(-1), 0.02);
    }],
  ] },
  'M10-CRYO-QUENCH': { badge: QUANTUM, tests: [
    ['failure_event', (t) => event(t.failure, 'cryo_quench', 0.012, false, 'fault')],
    ['solver_output', (t) => {
      const before = nonnegative(t.initialK, 'initial stage temperature');
      const after = nonnegative(t.peakK, 'peak stage temperature');
      const prepared = list(t.blochBefore, 'prepared Bloch vectors', 3).map((v) => finite(v, 'prepared Bloch length'));
      const quenched = list(t.blochAfter, 'quenched Bloch vectors', prepared.length).map((v) => finite(v, 'quenched Bloch length'));
      return before < 1.2 && after > 1.2 && prepared.every((v) => v > 0) && quenched.every((v) => v === 0);
    }],
  ] },
  'M11-SURFACE-CODE': { badge: QUANTUM, tests: [
    ['sweep', (t) => {
      const row = sweep(t.sweep).find(([p]) => p === 0.05);
      return row[1] < row[0];
    }],
    ['determinism', (t) => {
      const seed = finite(t.seed, 'fixed seed');
      const repeatSeed = finite(t.repeatSeed, 'replay seed');
      const first = sweep(t.sweep);
      const second = sweep(t.replay);
      return Number.isSafeInteger(seed) && seed === repeatSeed && JSON.stringify(first) === JSON.stringify(second);
    }],
  ] },
};

/**
 * Grade one approved mission. Missing or non-finite evidence is a refusal,
 * distinct from a valid solve that misses the selected criterion.
 * @param {object} curriculum @param {string} id @param {object} telemetry
 */
export function gradeMission(curriculum, id, telemetry) {
  if (!APPROVED.has(curriculum)) throw Error('Academy curriculum has not been SHA-256 verified');
  const mission = curriculum.missions.find((m) => m.id === id);
  if (!mission) throw Error('Unknown Academy mission ' + id);
  const { badge, tests } = RUBRIC[id];
  const results = tests.map(([, check], i) => {
    const condition = mission.pass_criteria[i].condition;
    try {
      if (telemetry?.badge !== badge) throw Error('Missing or incompatible solver provenance');
      return { condition, status: check(telemetry) ? 'pass' : 'fail' };
    } catch (err) {
      return { condition, status: 'refused', reason: err instanceof Error ? err.message : String(err) };
    }
  });
  const statuses = results.map((r) => r.status);
  const status = statuses.includes('refused') ? 'refused' : statuses.includes('fail') ? 'fail' : 'pass';
  return { id, badge, status, results };
}
