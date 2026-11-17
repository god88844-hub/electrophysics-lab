// experiments.js — the three initial Phase 3 experiments (§10) with model
// adapters, SYNTHETIC fixtures (conspicuously labelled), and dataset templates.
//
// TRUST RULE: every fixture created here has origin 'synthetic-test-fixture'.
// They exercise the measurement/calibration/validation SOFTWARE only. They
// can never unlock the physical-validation stage — datasets.js enforces it
// and these fixtures exist to prove that gate works.

import { createDataset, parseSamplesCSV, sha256 } from './dataset.js';

const FIXTURE_ORIGIN = 'synthetic-test-fixture';

// ---- Experiment A: resistive voltage divider --------------------------------
// model: v_out(V_in, R1, R2) = V_in · R2 / (R1 + R2)
export const dividerModel = {
  id: 'divider-vout',
  version: 1,
  predict(params, point) {
    const vin = point.V_in;
    const r1 = params.R1, r2 = params.R2;
    return { V_out: (vin * r2) / (r1 + r2) };
  },
};

/** synthetic divider measurements (labelled synthetic-test-fixture) */
export function syntheticDividerDataset({ V_in = 10, R1 = 1000, R2 = 1000, n = 5, uncertaintyV = 0.01, seed = 3, R2True = null } = {}) {
  const r2 = R2True ?? R2;
  const mul = mulberry(seed);
  const samples = [];
  for (let i = 0; i < n; i++) {
    const trueV = (V_in * r2) / (R1 + r2);
    const noise = (mul() * 2 - 1) * uncertaintyV;
    samples.push({ t: i, V_in, V_out: Number((trueV + noise).toFixed(6)) });
  }
  const meta = {
    id: 'divider-synthetic',
    origin: FIXTURE_ORIGIN,
    experiment: { id: 'divider-synthetic-fixture', date: null, operator: 'software' },
    configuration: { circuit: 'resistive divider', topology: 'V_in—R1—A—R2—gnd' },
    components: { nominal: { R1, R2: r2, V_in }, independentlyMeasured: null },
    instruments: [{ manufacturer: 'synthetic', model: 'fixture-generator', serialNumber: null, resolution: uncertaintyV, uncertainty: uncertaintyV, calibration: { status: 'missing' } }],
    quantities: [{ name: 'V_in', unit: 'V' }, { name: 'V_out', unit: 'V' }],
    conditions: { operating: { V_in }, environmental: { temperature: null } },
    uncertainty: { V_out: uncertaintyV },
    acquisition: { procedure: 'software fixture (mulberry-seeded noise)', reference: 'js/measure/experiments.js' },
    license: 'MIT (same as repository)',
    source: { file: 'synthetic://divider' },
  };
  const raw = JSON.stringify({ meta, samples });
  return { dataset: createDataset(meta, samples, { rawSource: raw }), raw };
}

// ---- Experiment B: RC transient ---------------------------------------------
// model: v_c(t; V, tau) = V · (1 − e^(−t/tau)) for t in the high phase
export const rcModel = {
  id: 'rc-step',
  version: 1,
  predict(params, point) {
    const t = point.t;
    return { V_c: point.V_step * (1 - Math.exp(-t / params.tau)) };
  },
};

/** synthetic RC transient (calibration/validation variants) */
export function syntheticRCDataset({ V = 5, R = 1000, C = 100e-9, tau = R * C, times = null, n = 12, uncertaintyV = 0.005, seed = 11, group = 'session-1', tauScale = 1 } = {}) {
  const ts = times ?? Array.from({ length: n }, (_, i) => (i + 1) * (tau / 2.5));
  const mul = mulberry(seed);
  const samples = ts.map((t, i) => ({
    t: Number(t.toPrecision(8)),
    session: group,
    V_step: V,
    V_c: Number((V * (1 - Math.exp(-t / (tau * tauScale))) + (mul() * 2 - 1) * uncertaintyV).toFixed(6)),
  }));
  const meta = {
    id: `rc-${group}-synthetic`,
    origin: FIXTURE_ORIGIN,
    experiment: { id: 'rc-synthetic-fixture', date: null, operator: 'software' },
    configuration: { circuit: 'RC low-pass step', R, C: C * tauScale },
    components: { nominal: { R, C }, independentlyMeasured: null },
    instruments: [{ manufacturer: 'synthetic', model: 'fixture-generator', serialNumber: null, resolution: uncertaintyV, uncertainty: uncertaintyV, calibration: { status: 'missing' } }],
    quantities: [{ name: 't', unit: 's' }, { name: 'V_c', unit: 'V' }],
    conditions: { operating: { V_step: V }, environmental: { temperature: null } },
    uncertainty: { V_c: uncertaintyV },
    acquisition: { procedure: 'software fixture', reference: 'js/measure/experiments.js' },
    license: 'MIT (same as repository)',
    source: { file: `synthetic://rc-${group}` },
  };
  const raw = JSON.stringify({ meta, samples });
  return { dataset: createDataset(meta, samples, { rawSource: raw }), raw };
}

// ---- Experiment C: diode I-V -------------------------------------------------
// model: Shockley I(V) = Is·(exp(V/(n·Vt)) − 1), Vt = k·T/q at T = 300 K
import { CONST } from '../core/units.js';
const VT300 = (CONST.k_B * 300) / CONST.q_e;
export const diodeModel = {
  id: 'diode-iv',
  version: 1,
  predict(params, point) {
    const v = point.V_d;
    const i = params.Is * (Math.exp(v / (params.n * VT300)) - 1);
    return { I_d: Math.min(Math.max(i, -1e30), 1e30) };
  },
};

/** synthetic diode I-V sweeps (calibration/validation variants) */
export function syntheticDiodeDataset({ Is = 1e-12, n = 1, biases = [0.45, 0.5, 0.55, 0.6, 0.65], uncertaintyA = 2e-5, seed = 5, session = 'session-1', isScale = 1 } = {}) {
  const mul = mulberry(seed);
  const samples = biases.map((v, i) => {
    const trueI = Is * isScale * (Math.exp(v / (n * VT300)) - 1);
    const noise = (mul() * 2 - 1) * uncertaintyA;
    return { t: i, session, V_d: v, I_d: Number((trueI + noise).toExponential(8)) };
  });
  const meta = {
    id: `diode-${session}-synthetic`,
    origin: FIXTURE_ORIGIN,
    experiment: { id: 'diode-synthetic-fixture', date: null, operator: 'software' },
    configuration: { circuit: 'diode I-V sweep', temperature: 300 },
    components: { nominal: { Is, n }, independentlyMeasured: null },
    instruments: [{ manufacturer: 'synthetic', model: 'fixture-generator', serialNumber: null, resolution: uncertaintyA, uncertainty: uncertaintyA, calibration: { status: 'missing' } }],
    quantities: [{ name: 'V_d', unit: 'V' }, { name: 'I_d', unit: 'A' }],
    conditions: { operating: { temperature: 300 }, environmental: { temperature: 300 } },
    uncertainty: { I_d: uncertaintyA },
    acquisition: { procedure: 'software fixture', reference: 'js/measure/experiments.js' },
    license: 'MIT (same as repository)',
    source: { file: `synthetic://diode-${session}` },
  };
  const raw = JSON.stringify({ meta, samples });
  return { dataset: createDataset(meta, samples, { rawSource: raw }), raw };
}

function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** empty dataset template with metadata placeholders (no invented values) */
export function datasetTemplate(id, origin = 'unknown-origin') {
  return createDataset({
    id,
    origin,
    experiment: { id: null, date: null },
    components: { nominal: null, independentlyMeasured: null },
    instruments: [{ manufacturer: null, model: null, serialNumber: null, resolution: null, uncertainty: null, calibration: { status: 'missing' } }],
    quantities: [{ name: null, unit: null }],
    acquisition: { procedure: null, reference: null },
    license: null,
  }, []);
}

/** CSV export of samples (for protocol-compliant instrument exports) */
export function samplesToCSV(samples) {
  if (!samples.length) return '';
  const keys = Object.keys(samples[0]);
  const rows = [keys.join(',')];
  for (const s of samples) rows.push(keys.map((k) => (s[k] ?? '')).join(','));
  return rows.join('\n');
}

export { parseSamplesCSV, sha256 };
