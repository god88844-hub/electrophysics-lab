// @ts-nocheck
/**
 * WP-6.4 bundle wire format and replay recipes. This module is import-free
 * JavaScript so Node 20 and the browser execute the same code. Callers
 * inject the locked schema, verified reference files and existing engines.
 */
export const BUNDLE_MAX_BYTES = 512 * 1024;
export const BUNDLE_FORMAT = 'invention-lab/breakthrough-bundle/1';
// Git snapshot of the producing worker, benchmark and browser engine sources.
// Bump the recipe alongside this SHA when those producing inputs change.
export const PRODUCER_CODE_VERSION = 'e6d037c45a3aa45c0ec752a716973580c1c1096c';
const SHA256 = /^[a-f0-9]{64}$/;
const ENCODER = new TextEncoder();
const SOURCES = {
  quantum: {
    kind: 'x-gate-error-minimization-under-transmon-noise',
    badge: 'SIMULATED_NOISY_MODEL',
    recipe: 'transmon-spsa-nelder-mead/1',
    files: ['04_quantum_hardware_modalities.json'],
  },
  silicon: {
    kind: 'silicon-forensic-threshold-replay',
    badge: 'SIMULATED_PHYSICS_MODEL',
    recipe: 'silicon-captured-threshold-window/1',
    files: ['02_semiconductor_pdk_silicon.json', '06_failure_physics_thresholds.json'],
  },
  soc: {
    kind: 'soc-systolic-architecture-comparison',
    badge: 'SIMULATED_ARCHITECTURAL_MODEL',
    recipe: 'soc-fixed-int8-workload/1',
    files: ['05_chip_architecture_benchmarks.json', '07_soc_interposer_memory_baselines.json'],
  },
};

/** @typedef {'quantum'|'silicon'|'soc'} Domain */
/** @typedef {{domain: Domain, seed: number, inputs: object}} BundleRequest */
/** @typedef {{schema: object, references: Record<string,{sha256:string, document:object}>, engines: object, curriculum?: {sha256:string, document:object}}} Runtime */

class BundleError extends Error {
  constructor(path, reason) {
    super('Experiment bundle ' + path + ' — ' + reason);
    this.name = 'BundleError';
  }
}

function requireField(condition, path, reason) {
  if (!condition) throw new BundleError(path, reason);
}

function record(value) {
  return value !== null && typeof value === 'object'
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function finite(value, path) {
  requireField(typeof value === 'number' && Number.isFinite(value), path, 'expected a finite number');
  return value;
}

/** Canonical UTF-8 JSON with sorted keys, finite numbers and bounded nesting. */
export function canonicalBundleJson(value, depth = 0) {
  requireField(depth <= 24, '$', 'JSON nesting exceeds the bundle limit');
  if (value === null || typeof value === 'boolean' || typeof value === 'string'
      || (typeof value === 'number' && Number.isFinite(value))) return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + Array.from(value, item => canonicalBundleJson(item, depth + 1)).join(',') + ']';
  }
  requireField(record(value), '$', 'only JSON values are admitted');
  return '{' + Object.keys(value).sort().map(key => {
    requireField(!['__proto__', 'constructor', 'prototype'].includes(key), '$', 'reserved JSON key ' + key);
    return JSON.stringify(key) + ':' + canonicalBundleJson(value[key], depth + 1);
  }).join(',') + '}';
}

/** @param {string} text */
export async function sha256BundleText(text) {
  requireField(globalThis.crypto?.subtle, '$.sha256', 'Web Crypto SHA-256 requires a secure context');
  const hash = await globalThis.crypto.subtle.digest('SHA-256', ENCODER.encode(text));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function equal(left, right) {
  return canonicalBundleJson(left) === canonicalBundleJson(right);
}

function validDateTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [year, month, day, hour, minute, second, tzHour, tzMinute] = match.slice(1).map(Number);
  const february = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  const days = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && hour < 24 && minute < 60 && second < 60
    && (Number.isNaN(tzHour) || (tzHour < 24 && tzMinute < 60));
}

/** Apply the keywords used by the locked experiment-bundle JSON schema. */
export function validateBundleSchema(value, schema, path = '$') {
  const types = {
    object: record,
    string: item => typeof item === 'string',
    number: item => typeof item === 'number' && Number.isFinite(item),
    integer: Number.isInteger,
  };
  if (schema.type) requireField(types[schema.type]?.(value), path, 'schema expects ' + schema.type);
  if (Object.hasOwn(schema, 'const')) requireField(value === schema.const, path, 'schema expects ' + schema.const);
  if (schema.enum) requireField(schema.enum.includes(value), path, 'schema permits only ' + schema.enum.join(', '));
  if (schema.minimum !== undefined) requireField(value >= schema.minimum, path, 'schema minimum is ' + schema.minimum);
  if (schema.maximum !== undefined) requireField(value <= schema.maximum, path, 'schema maximum is ' + schema.maximum);
  if (schema.pattern) requireField(typeof value === 'string' && new RegExp(schema.pattern).test(value), path, 'schema pattern mismatch');
  if (schema.format === 'date-time') requireField(validDateTime(value), path, 'schema expects an RFC 3339 date-time');
  if (schema.type !== 'object') return;
  for (const key of schema.required ?? []) {
    requireField(Object.hasOwn(value, key), path + '.' + key, 'required by the schema');
  }
  const properties = schema.properties ?? {};
  for (const [key, child] of Object.entries(value)) {
    const childSchema = Object.hasOwn(properties, key) ? properties[key] : schema.additionalProperties;
    if (childSchema === false) throw new BundleError(path + '.' + key, 'not permitted by the schema');
    if (record(childSchema)) validateBundleSchema(child, childSchema, path + '.' + key);
  }
}

function checkSchema(document, schema) {
  requireField(schema?.$id === 'invention-lab/experiment-bundle.schema.json', '$', 'locked schema is unavailable');
  validateBundleSchema(document, schema);
}

function sourceFor(domain) {
  requireField(typeof domain === 'string' && Object.hasOwn(SOURCES, domain), '$.domain', 'no replay recipe for this workspace');
  return SOURCES[domain];
}

/** @param {Domain} domain @param {Runtime} runtime */
function provenanceFor(domain, runtime) {
  const source = sourceFor(domain);
  const references = source.files.map(file => {
    const reference = runtime.references[file];
    requireField(reference && SHA256.test(reference.sha256 ?? ''), '$.references', 'verified vault file unavailable: ' + file);
    const citation = reference.document?.source_citation;
    requireField(nonempty(citation), '$.citation', 'vault citation missing for ' + file);
    return { file, sha256: reference.sha256, citation };
  });
  const documents = source.files.map(file => runtime.references[file].document);
  let noise;
  if (domain === 'quantum') {
    const m = documents[0].parameters.superconducting_transmon;
    noise = {
      t1Us: m.t1_us.typical, t2Us: m.t2_us.typical, zzKhz: m.zz_crosstalk_khz.typical,
      durationNs: m.gate_1q_duration_ns.typical,
      anharmonicityMHz: m.anharmonicity_alpha_mhz.typical,
    };
  } else if (domain === 'silicon') {
    const [, failure] = documents;
    const th = failure.failure_thresholds;
    noise = {
      vgsThresholdV: th.gate_oxide_tddb.vgs_threshold_v,
      gammaDecPerV: th.gate_oxide_tddb.gamma_dec_per_v,
      hardBreakdownV: failure.parameters.gate_oxide_tddb.hard_breakdown.vgs_irreversible_v,
      cuMeltingC: th.cu_melting_c, fr4DelaminationC: th.fr4_delamination_c,
      siThermalRunawayC: th.si_thermal_runaway_c,
    };
  } else {
    const [, memory] = documents;
    const m = memory.parameters;
    noise = {
      pcieGBps: m.discrete_pcie_reference.bandwidth_gbps.pcie4_x16_directional,
      lpddrGBps: m.lpddr5_unified_memory.bandwidth_gbps.intel_iris_xe_155u_total,
      hbmGBps: m.hbm_reference.bandwidth_gbps.tpu_v1_total,
    };
  }
  for (const [key, value] of Object.entries(noise)) finite(value, '$.noise.' + key);
  return { references, noise, citation: references.map(ref => ref.file + ': ' + ref.citation).join('\n') };
}

const SILICON_STRESS = {
  gate_oxide_breakdown: ['vgsMax', 'V'],
  trace_fusing: ['traceC', '°C'],
  pcb_delamination: ['pcbC', '°C'],
  si_thermal_runaway: ['junctionC', '°C'],
};

function academyEvidence(domain, inputs, runtime) {
  // The dock has no mission-progress state. These links associate actual
  // solver evidence with declared curriculum checks without assigning grades.
  let missionId;
  let checks;
  if (domain === 'soc') {
    missionId = 'M6-TPU-GEMM';
    checks = ['exact_output', 'cycle_model'];
  } else if (domain === 'silicon') {
    const mission = {
      gate_oxide_breakdown: 'M2-OXIDE-SOA',
      trace_fusing: 'M3-CU-FUSING',
    }[inputs.failureType];
    if (mission) {
      missionId = mission;
      checks = ['failure_event', 'forensic_report'];
    }
  }
  if (!missionId) return null;
  const reference = runtime.curriculum;
  const mission = reference?.document?.missions?.find(item => item.id === missionId && item.workspace === domain);
  requireField(SHA256.test(reference?.sha256 ?? '') && nonempty(reference?.document?.source_citation)
    && mission && checks.every(check => mission.pass_criteria.some(item => item.check === check)),
  '$.academyEvidence', 'verified curriculum criteria unavailable');
  return {
    missionId,
    title: mission.title,
    evidenceFor: checks,
    reference: {
      file: '01_academy_missions.json', sha256: reference.sha256, citation: reference.document.source_citation,
    },
  };
}

function traceFromSnapshots(snapshots) {
  requireField(Array.isArray(snapshots) && snapshots.length >= 1 && snapshots.length <= 240,
    '$.replay.inputs.trace', 'expected 1–240 captured solver samples');
  return snapshots.map((s, i) => {
    const p = '$.replay.inputs.trace[' + i + ']';
    requireField(record(s) && record(s.temps) && record(s.nodes), p, 'expected a solver snapshot');
    const t = finite(s.t, p + '.t');
    requireField(t >= 0 && (!i || t > snapshots[i - 1].t), p + '.t', 'solver times must increase');
    requireField(s.vgsMaxNode === null || (nonempty(s.vgsMaxNode) && s.vgsMaxNode.length <= 96),
      p + '.vgsMaxNode', 'expected a bounded solver node name or null');
    const nodes = {};
    for (const name of ['vout_q4', 'vout_bin', 'vdd_rail']) {
      if (Object.hasOwn(s.nodes, name)) nodes[name] = finite(s.nodes[name], p + '.nodes.' + name);
    }
    return {
      t, vdd: finite(s.vdd, p + '.vdd'), vgsMax: finite(s.vgsMax, p + '.vgsMax'),
      vgsMaxNode: s.vgsMaxNode, iMax: finite(s.iMax, p + '.iMax'), tempMaxC: finite(s.tempMaxC, p + '.tempMaxC'),
      temps: {
        traceC: finite(s.temps.traceC, p + '.temps.traceC'),
        pcbC: finite(s.temps.pcbC, p + '.temps.pcbC'),
        junctionC: finite(s.temps.junctionC, p + '.temps.junctionC'),
      },
      nodes,
    };
  });
}

function admittedInputs(domain, seed, inputs, noise) {
  requireField(Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffff_ffff, '$.seed', 'expected an unsigned 32-bit seed');
  requireField(record(inputs), '$.replay.inputs', 'expected a replay input record');
  let normalized;
  if (domain === 'quantum') {
    const { amplitude, sigmaNs, beta, durationNs } = inputs;
    requireField(Number.isFinite(amplitude) && amplitude >= 5 && amplitude <= 40
      && Number.isFinite(sigmaNs) && sigmaNs >= 3 && sigmaNs <= 12
      && Number.isFinite(beta) && beta >= 0 && beta <= 1.5 && durationNs === noise.durationNs,
    '$.replay.inputs', 'pulse is outside the verified two-qubit optimizer recipe');
    normalized = { amplitude, sigmaNs, beta, durationNs };
  } else {
    requireField(seed === 0, '$.seed', 'this deterministic recipe has no random generator and uses seed 0');
    if (domain === 'silicon') {
      requireField(typeof inputs.failureType === 'string' && Object.hasOwn(SILICON_STRESS, inputs.failureType), '$.replay.inputs.failureType', 'expected a silicon oxide or thermal failure');
      normalized = { failureType: inputs.failureType, trace: traceFromSnapshots(inputs.trace) };
    } else {
      requireField(['discrete', 'unified'].includes(inputs.arch) && inputs.radix === 'int8',
        '$.replay.inputs', 'the current live workload exports its recorded INT8 architecture result');
      normalized = { arch: inputs.arch, radix: 'int8' };
    }
  }
  requireField(equal(normalized, inputs), '$.replay.inputs', 'unexpected or altered recipe input fields');
  return normalized;
}

function runQuantum(inputs, noise, seed, { TransmonDevice, spsa, nelderMead }) {
  const device = ([amplitude, sigmaNs, beta]) => {
    const dev = new TransmonDevice({ nQubits: 2, t1Us: noise.t1Us, t2Us: noise.t2Us, zzKhz: noise.zzKhz,
      anharmonicityMHz: noise.anharmonicityMHz, seed: 99 });
    dev.runPulse({ qubit: 0, amplitude, sigmaNs, beta, durationNs: inputs.durationNs });
    return dev.sim.rho;
  };
  const loss = pulse => {
    const rho = device(pulse);
    return (1 - rho.population(0)) + 0.5 * rho.population(1);
  };
  const start = [inputs.amplitude, inputs.sigmaNs, inputs.beta];
  const bounds = [[5, 40], [3, 12], [0, 1.5]];
  const r1 = spsa(loss, start, { iterations: 30, seed, bounds });
  const r2 = nelderMead(loss, r1.x, { iterations: 80, bounds });
  const initialFidelity = device(start).population(0);
  const optimizedFidelity = device(r2.x).population(0);
  const [amplitudeMHz, sigmaNs, dragBeta] = r2.x;
  return {
    initialFidelity, optimizedFidelity, optimizedParams: { amplitudeMHz, sigmaNs, dragBeta }, iterations: 110,
    metrics: { score: 'X target-state probability', initialLoss: loss(start), optimizedLoss: loss(r2.x) },
    artifacts: [{
      filename: 'transmon-target.qasm', role: 'ideal gate target',
      text: [
        'OPENQASM 3.0;', 'include "stdgates.inc";',
        '// Ideal target. The calibrated DRAG solve uses the sealed pulse and noise metadata.',
        '// Optimizer seed ' + seed, 'qubit[2] q;', 'bit result;', 'x q[0];', 'result = measure q[0];', '',
      ].join('\n'),
    }],
  };
}

function spiceTrace(trace) {
  const columns = [['vdd', s => s.vdd], ...['vout_q4', 'vout_bin', 'vdd_rail'].map(name => [name, s => s.nodes[name]])]
    .filter(([, read]) => trace.every(sample => Number.isFinite(read(sample))));
  const origin = trace[0].t;
  const stop = trace[trace.length - 1].t - origin;
  const lines = ['* Silicon forensic capture: recorded voltages as independent sources'];
  for (const [name, read] of columns) {
    const voltage = stop === 0 ? String(read(trace[0]))
      : 'PWL(' + trace.map(sample => (sample.t - origin) + ' ' + read(sample)).join(' ') + ')';
    lines.push('V_' + name + ' ' + name + ' 0 ' + voltage);
  }
  const analysis = stop === 0 ? '.op' : '.tran ' + (stop / (trace.length - 1)) + ' ' + stop;
  return [...lines, analysis, '.end', ''].join('\n');
}

function runSilicon(inputs, noise, { evaluateThresholds, buildForensicReport }) {
  const { trace, failureType } = inputs;
  const terminal = trace[trace.length - 1];
  const event = evaluateThresholds({
    vgsMaxV: terminal.vgsMax, vgsMaxNode: terminal.vgsMaxNode,
    traceTempC: terminal.temps.traceC, pcbTempC: terminal.temps.pcbC, junctionTempC: terminal.temps.junctionC,
  }, noise).find(item => item.type === failureType);
  requireField(event, '$.replay.inputs.trace', 'terminal solver sample does not reproduce the cited failure');
  const report = buildForensicReport({ event, samples: trace, thresholds: noise });
  const [channel, unit] = SILICON_STRESS[failureType];
  const read = sample => channel === 'vgsMax' ? sample.vgsMax : sample.temps[channel];
  // Normalize temperatures to Kelvin before taking ratios of absolute stress.
  const scale = unit === '°C' ? 273.15 : 0;
  const compliance = stress => Math.min(1, (event.threshold + scale) / Math.max(event.threshold + scale, stress + scale));
  return {
    initialFidelity: compliance(read(trace[0])), optimizedFidelity: compliance(read(terminal)),
    metrics: {
      score: 'Threshold compliance (start and end of recorded window)',
      stressUnit: unit, initialStress: read(trace[0]), terminalStress: read(terminal), samples: trace.length,
      failure: report.failure, peaks: report.peaks,
    },
    artifacts: [{ filename: 'silicon-captured-voltages.cir', role: 'recorded voltage waveform', text: spiceTrace(trace) }],
  };
}

async function runSoc(inputs, noise, { systolicMatmul, compareArchitectures }) {
  // Input generator and hardware settings used by the live inspector workload.
  const matrix = sample => Array.from({ length: 32 }, (_, i) => Array.from({ length: 32 }, (_, j) => sample(i, j)));
  const A = matrix((i, k) => ((i * 7 + k * 13) % 120) - 60);
  const B = matrix((k, j) => ((k * 5 + j * 3) % 120) - 60);
  const options = { gridSize: 8, clockMHz: 700, vdd: 0.8 };
  const run = systolicMatmul(A, B, options);
  const comparison = compareArchitectures({ M: 32, N: 32, K: 32 }, { ...options, ...noise });
  const selected = inputs.arch === 'unified' ? comparison.unifiedInt8 : comparison.discreteInt8;
  const observed = {
    cycles: run.cycles, utilization: run.utilization, macOps: run.macOps, dynamicPowerW: run.dynamicPowerW,
    archCycles: selected.totalCycles, bandwidthGBps: selected.bandwidthGBps, energyPerOpPJ: selected.energyPerOpPJ,
    hotspotC: selected.hotspotC, badge: comparison.badge, radix: inputs.radix, arch: inputs.arch,
  };
  return {
    initialFidelity: run.cycles / comparison.discreteInt8.totalCycles,
    optimizedFidelity: run.cycles / comparison.unifiedInt8.totalCycles,
    metrics: {
      score: 'Compute share of INT8 cycles (discrete and unified)',
      observed, comparison, outputSha256: await sha256BundleText(canonicalBundleJson(run.C)),
    },
    artifacts: [],
  };
}

function checkObserved(domain, calculated, observed) {
  if (!observed) return;
  if (domain === 'quantum') {
    for (const key of ['initialFidelity', 'optimizedFidelity', 'optimizedParams', 'iterations']) {
      requireField(Object.hasOwn(observed, key) && equal(observed[key], calculated[key]),
        '$.metrics.' + key, 'live Co-Inventor result mismatch; run again with the current pulse settings');
    }
  } else if (domain === 'silicon') {
    requireField(equal(observed.failure, calculated.metrics.failure), '$.metrics.failure', 'captured failure mismatch');
    requireField(equal(observed.peaks, calculated.metrics.peaks), '$.metrics.peaks', 'captured forensic peaks mismatch');
  } else {
    requireField(equal(observed, calculated.metrics.observed), '$.metrics.observed', 'recorded SoC benchmark mismatch');
  }
}

/** Select only reproducible inputs from a completed workbench experiment. */
export function requestFromWorkbench(state, runtime) {
  const domain = state.workspace;
  const { noise } = provenanceFor(domain, runtime);
  if (domain === 'quantum') {
    const observed = state.quantumExp?.bundle;
    requireField(observed && !state.quantumExp.running, '$.metrics', 'run the AI Discovery Experiment in Quantum Lab first');
    const { amplitude, sigmaNs, beta } = state.pulseParams;
    requireField(observed.badge === SOURCES.quantum.badge && observed.kind === SOURCES.quantum.kind,
      '$.badge', 'unexpected Co-Inventor provenance');
    const { t1Us, t2Us, zzKhz } = noise;
    const workerCitation = runtime.references[SOURCES.quantum.files[0]].document.parameters.superconducting_transmon.citations[0];
    requireField(observed.citation === workerCitation, '$.citation', 'live Co-Inventor reference citation mismatch');
    requireField(record(observed.noise) && equal(observed.noise, { t1Us, t2Us, zzKhz }),
      '$.noise', 'live Co-Inventor noise parameters mismatch');
    return { request: { domain, seed: observed.seed, inputs: { amplitude, sigmaNs, beta, durationNs: noise.durationNs } }, observed };
  }
  if (domain === 'silicon') {
    const observed = state.forensic?.report;
    requireField(observed, '$.metrics', 'capture a Silicon Forensic Autopsy first');
    return { request: { domain, seed: 0, inputs: {
      failureType: observed.failure.type, trace: traceFromSnapshots(state.forensic.replay),
    } }, observed };
  }
  const observed = state.soc?.result;
  requireField(observed, '$.metrics', 'run the INT8 quantized workload in SoC Architect first');
  return { request: { domain, seed: 0, inputs: { arch: observed.arch, radix: observed.radix } }, observed };
}

/** @param {BundleRequest} request @param {Runtime} runtime */
export async function buildExperimentBundle(request, runtime, observed) {
  const { domain, seed, inputs } = request;
  const source = sourceFor(domain);
  const provenance = provenanceFor(domain, runtime);
  const admitted = admittedInputs(domain, seed, inputs, provenance.noise);
  const academy = academyEvidence(domain, admitted, runtime);
  let calculated;
  if (domain === 'quantum') calculated = runQuantum(admitted, provenance.noise, seed, runtime.engines);
  else if (domain === 'silicon') calculated = runSilicon(admitted, provenance.noise, runtime.engines);
  else calculated = await runSoc(admitted, provenance.noise, runtime.engines);
  checkObserved(domain, calculated, observed);
  const document = {
    format: BUNDLE_FORMAT, domain, kind: source.kind, badge: source.badge, seed,
    ...provenance,
    reproducibility: { codeVersion: PRODUCER_CODE_VERSION },
    replay: { recipe: source.recipe, inputs: admitted },
    ...(academy ? { academyEvidence: academy } : {}),
    ...calculated,
  };
  checkSchema(document, runtime.schema);
  const sha256 = await sha256BundleText(canonicalBundleJson(document));
  const versioned = { ...document, sha256 };
  checkSchema(versioned, runtime.schema);
  serializeExperimentBundle(versioned);
  return versioned;
}

/** The exact wire form. Rejecting other encodings also detects whitespace, duplicates and BOM changes. */
export function serializeExperimentBundle(bundle) {
  const text = canonicalBundleJson(bundle);
  requireField(ENCODER.encode(text).byteLength <= BUNDLE_MAX_BYTES, '$', 'bundle exceeds the 512 KiB limit');
  return text;
}

async function verifyDocument(bundle, runtime) {
  checkSchema(bundle, runtime.schema);
  requireField(nonempty(bundle.citation), '$.citation', 'reference citation is missing');
  requireField(record(bundle.noise) && Object.keys(bundle.noise).length, '$.noise', 'noise or model parameters are missing');
  requireField(typeof bundle.sha256 === 'string' && SHA256.test(bundle.sha256), '$.sha256', 'integrity seal is missing or invalid');
  const { sha256, ...payload } = bundle;
  requireField(await sha256BundleText(canonicalBundleJson(payload)) === sha256, '$.sha256', 'SHA-256 seal mismatch');
  const source = sourceFor(bundle.domain);
  requireField(bundle.kind === source.kind && bundle.badge === source.badge, '$.badge', 'experiment family or provenance badge mismatch');
  requireField(bundle.reproducibility.codeVersion === PRODUCER_CODE_VERSION, '$.reproducibility.codeVersion', 'unsupported producing code version');
  requireField(bundle.replay?.recipe === source.recipe, '$.replay.recipe', 'missing or unsupported replay recipe');
  const expected = provenanceFor(bundle.domain, runtime);
  requireField(Array.isArray(bundle.references) && equal(bundle.references, expected.references) && bundle.citation === expected.citation,
    '$.references', 'reference citations or sealed vault hashes mismatch');
  requireField(equal(bundle.noise, expected.noise), '$.noise', 'sealed noise/model parameters mismatch');
  const inputs = admittedInputs(bundle.domain, bundle.seed, bundle.replay.inputs, expected.noise);
  requireField(equal(bundle.academyEvidence ?? null, academyEvidence(bundle.domain, inputs, runtime)),
    '$.academyEvidence', 'sealed curriculum citation or evidence fields mismatch');
  requireField(record(bundle.metrics) && Array.isArray(bundle.artifacts), '$.metrics', 'metrics or embedded artifacts are missing');
  return bundle;
}

/** @param {string|Uint8Array} bytes @param {Runtime} runtime */
export async function importExperimentBundle(bytes, runtime) {
  const raw = typeof bytes === 'string' ? ENCODER.encode(bytes) : bytes;
  requireField(raw instanceof Uint8Array && raw.byteLength <= BUNDLE_MAX_BYTES, '$', 'bundle exceeds the 512 KiB limit or is unreadable');
  let text;
  let bundle;
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(raw);
    bundle = JSON.parse(text);
  } catch {
    throw new BundleError('$', 'expected valid UTF-8 JSON');
  }
  await verifyDocument(bundle, runtime);
  requireField(serializeExperimentBundle(bundle) === text, '$', 'canonical file bytes mismatch');
  return bundle;
}

/** Recompute the eligible solver/trace recipe and require exact metrics and seal parity. */
export async function replayExperimentBundle(bundle, runtime) {
  // Snapshot before awaiting verification so a caller cannot mutate an admitted record mid-replay.
  const verified = await importExperimentBundle(serializeExperimentBundle(bundle), runtime);
  const reproduced = await buildExperimentBundle({
    domain: verified.domain, seed: verified.seed, inputs: verified.replay.inputs,
  }, runtime);
  requireField(equal(verified.metrics, reproduced.metrics)
    && verified.initialFidelity === reproduced.initialFidelity && verified.optimizedFidelity === reproduced.optimizedFidelity,
    '$.metrics', 'replayed metrics mismatch');
  requireField(verified.sha256 === reproduced.sha256, '$.sha256', 'replayed bundle seal mismatch');
  return reproduced;
}
