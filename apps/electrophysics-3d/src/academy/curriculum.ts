import { createHeatGrid, createNetlist, createCryoStage, solveDC, compileSandbox, evaluateThresholds,
  buildForensicReport, proposeFix, resistanceAtTemp, starterCircuit } from '@physics/index.mjs';
import { compareArchitectures, systolicMatmul } from '../../../../packages/chip-engine/src/accelerators.mjs';
import { TransmonDevice } from '@quantum/devices.mjs';
import { DensityMatrix, OPS } from '@quantum/lindblad.mjs';
import { bitFlipLogicalErrorRate, surfaceCodeLogicalErrorRate } from '@quantum/stabilizer.mjs';
import '../../../../js/labs/logic/components.js';
import { Diagram } from '../../../../js/core/diagram.js';
import { runLogic } from '../../../../js/labs/logic/engine.js';
import curriculumRaw from '../../../../data/curriculum/01_academy_missions.json?raw';
import manifestRaw from '../../../../data/curriculum/MANIFEST.json?raw';
import { COPPER, Q4_LEVELS_V, REFERENCE, SKY130, THRESHOLDS, TRANSMON, verifyReferenceIntegrity } from '../data/reference.js';
import { physicsClient } from '../physics/physicsClient.js';
import { quantumClient } from '../physics/quantumClient.js';
import { worldRef } from '../worldRef.js';
import { store, type SandboxComponent } from '../state/store.js';
import { verifyCurriculum } from './missionGrader.js';

export interface Mission {
  id: string;
  layer: number;
  title: string;
  workspace: 'silicon' | 'soc' | 'quantum';
  objective: string;
  setup: Record<string, string | string[]>;
  pass_criteria: Array<{ check: string; condition: string }>;
}
export interface Curriculum { missions: Mission[]; seal: string }

const PHYSICS = 'SIMULATED_PHYSICS_MODEL';
const ARCHITECTURE = 'SIMULATED_ARCHITECTURAL_MODEL';
const QUANTUM = 'SIMULATED_NOISY_QUANTUM';
const failureData = REFERENCE.failures;
const cryoCooling = failureData.parameters.cryogenic_mixing_chamber_quench.cooling_capacity;
const tddb = failureData.parameters.gate_oxide_tddb.hard_breakdown;
const thresholds = {
  vgsThresholdV: THRESHOLDS.VGS_TDDB_V,
  gammaDecPerV: THRESHOLDS.GAMMA_DEC_PER_V,
  hardBreakdownV: tddb.vgs_irreversible_v,
  cuMeltingC: THRESHOLDS.CU_MELTING_C,
  siThermalRunawayC: THRESHOLDS.SI_THERMAL_RUNAWAY_C,
  cryoQuench15mkW: THRESHOLDS.CRYO_QUENCH_15MK_W,
};
const SILICON = REFERENCE.semiconductor.material_properties.silicon;
const TPU = REFERENCE.architecture.parameters.systolic_array_tpu;
const THROTTLE_C = REFERENCE.architecture.valid_operating_envelope.riscv_rv32im.temp_range_c[1];
const AL_TC_K = Number(failureData.parameters.cryogenic_mixing_chamber_quench.thresholds.decoherence_collapse.match(/([\d.]+) K for Al/)?.[1]);

let loading: Promise<Curriculum> | undefined;
export function loadAcademy(): Promise<Curriculum> {
  loading ??= (async () => {
    const encoder = new TextEncoder();
    const [curriculum, reference] = await Promise.all([
      verifyCurriculum(encoder.encode(curriculumRaw), encoder.encode(manifestRaw)),
      verifyReferenceIntegrity(),
    ]);
    if (!reference.allVerified) throw Error('Academy reference library SHA-256 verification failed');
    return curriculum as Curriculum;
  })();
  return loading;
}

function part(id: string, kind: string, nodes: string[], position: [number, number], params?: Record<string, unknown>): SandboxComponent {
  return { id, kind, nodes, position, ...(params ? { params } : {}) };
}

function transistorSetup(withPmos: boolean) {
  const parts = [
    part('rail1', 'rail', ['vdd'], [0.2, 0.2], { V: 1.8 }),
    part('academy_input', 'rail', ['gate'], [0.6, 0.7], { V: 0 }),
    part('mn', 'nmos', ['gate', 'drain', 'gnd'], [1.0, 0.9]),
    part('rload', 'resistor', ['drain', 'gnd'], [1.8, 0.5], { R: 100000 }),
    part('probe1', 'probe', ['drain'], [2.3, 0.7]),
  ];
  if (withPmos) parts.push(part('mp', 'pmos', ['gate', 'drain', 'vdd'], [1.0, 0.3]));
  else {
    // Stiff drain bias is the sweep instrument. The 100 kΩ load is a
    // parallel bench load, and the NMOS branch current excludes it.
    parts.push(part('drain_bias', 'rail', ['drain'], [1.1, 0.2], { V: 1.8 }));
  }
  return parts;
}

export const CONTROLS: Record<string, { label: string; value: number; min: number; max: number; step: number }> = {
  'M1-MOSFET-IV': { label: 'High gate bias (V)', value: 1.8, min: 0, max: 1.8, step: 0.05 },
  'M2-OXIDE-SOA': { label: 'Rail voltage (V)', value: 2.5, min: 0.1, max: 3, step: 0.01 },
  'M3-CU-FUSING': { label: 'Rail voltage (V)', value: 3, min: 0.1, max: 3, step: 0.01 },
  'M4-Q4-INVERTER': { label: 'Logic rail voltage (V)', value: 1.8, min: 1.65, max: 1.8, step: 0.01 },
  'M5-CUSTOM-IC': { label: 'Rail voltage (V)', value: 1.8, min: 0.5, max: 1.8, step: 0.01 },
  'M8-DVFS-THERMAL': { label: 'Tile power scale', value: 16, min: 0.1, max: 20, step: 0.1 },
  'M10-CRYO-QUENCH': { label: 'Mixing-stage load (mW)', value: 5, min: 0, max: 800, step: 1 },
};

function setupFor(mission: Mission): SandboxComponent[] {
  switch (mission.id) {
    case 'M1-MOSFET-IV': return transistorSetup(false);
    case 'M2-OXIDE-SOA': return starterCircuit('oxide-breakdown').components as SandboxComponent[];
    case 'M3-CU-FUSING': return starterCircuit('trace-fusing').components as SandboxComponent[];
    case 'M4-Q4-INVERTER': {
      const spec = starterCircuit('noise-margin-shootout').components as SandboxComponent[];
      return [...spec.filter((p) => ['rail1', 'q4inv', 'rq4', 'p1'].includes(p.id)),
        part('academy_input', 'rail', ['in'], [0.6, 0.8], { V: 0 })];
    }
    case 'M5-CUSTOM-IC': return transistorSetup(true);
    default: return [];
  }
}

export function setMissionControl(mission: Mission, value: number) {
  if (!Number.isFinite(value)) return;
  if (mission.id === 'M10-CRYO-QUENCH') {
    store.set({ drivePowerMW: value });
  } else if (mission.id === 'M8-DVFS-THERMAL') {
    physicsClient.setParams({ tilePowerScale: value });
  } else if (mission.workspace === 'silicon' && mission.id !== 'M1-MOSFET-IV') {
    store.set({ vddSlider: value });
    physicsClient.setParams({ vdd: value });
  }
}

export function launchMission(mission: Mission) {
  const current = store.get();
  if (mission.workspace === 'silicon') {
    const components = setupFor(mission);
    if (components.length === 0) throw Error('The sealed Silicon mission has no starter circuit');
    // M5 consumes the current instructional design when it already has a
    // named boundary input and output probe. Otherwise it opens an inverter.
    const hasReusableDesign = current.sandboxComponents.some((c) => c.id === 'academy_input')
      && current.sandboxComponents.some((c) => c.kind === 'probe')
      && current.sandboxComponents.some((c) => c.kind === 'pmos');
    const initial = mission.id === 'M5-CUSTOM-IC' && hasReusableDesign ? current.sandboxComponents : components;
    store.set({ workspace: mission.workspace, activeBay: 2, sandboxComponents: initial, sandboxLoaded: true,
      sandboxOpen: true, inspectorOpen: false, libraryOpen: false });
    physicsClient.reset();
    // M4 is an ideal multi-valued logic sweep. The bench's analogue resistor
    // surrogate is a different model, so the Academy reads the logic solver.
    if (mission.id !== 'M4-Q4-INVERTER') {
      physicsClient.setNetlist({ rails: { vdd: CONTROLS[mission.id]?.value ?? 1.8 }, components: initial, wires: [] });
    } else physicsClient.clearNetlist();
  } else {
    store.set({ workspace: mission.workspace, activeBay: mission.workspace === 'soc' ? 3 : 1, inspectorOpen: false,
      libraryOpen: false, ...(mission.workspace === 'quantum' ? { bay1Mode: 'fridge' as const } : {}) });
    if (mission.workspace === 'quantum') {
      quantumClient.setParams({ t1Us: TRANSMON.t1_us.typical, t2Us: TRANSMON.t2_us.typical });
      quantumClient.reset();
    }
  }
  if (CONTROLS[mission.id]) setMissionControl(mission, CONTROLS[mission.id].value);
}

function assertLive(mission: Mission) {
  const state = store.get();
  if (state.workspace !== mission.workspace) throw Error('Launch this mission in its workspace before grading');
  return state;
}

function solveSpec(components: SandboxComponent[], drive: (c: SandboxComponent) => number | undefined) {
  if (!components.length || components.length > 24) throw Error('Academy DC fixture admits 1–24 components');
  const active = components.map((c) => {
    const V = c.kind === 'rail' ? drive(c) : undefined;
    return V === undefined ? c : { ...c, params: { ...c.params, V } };
  });
  const distinct = new Set(active.flatMap((c) => c.nodes));
  if (distinct.size > 64 || active.filter((c) => c.kind === 'rail').length > 32) throw Error('Academy MNA admission limit exceeded');
  const compiled = compileSandbox({ components: active, wires: [], rails: { vdd: 1.8 } });
  const solution = solveDC(compiled.netlist, { maxNewtonSteps: 40 });
  if (!solution.converged) throw Error('MNA failed to converge for the current circuit');
  return { compiled, solution };
}

function m1(components: SandboxComponent[], highV: number) {
  const transistor = components.find((c) => c.kind === 'nmos');
  if (!transistor) throw Error('Add the mission NMOS and bias rails');
  const measure = (driveV: number) => {
    const { solution, compiled } = solveSpec(components, (c) => c.id === 'academy_input' ? driveV : undefined);
    const voltage = (name: string) => solution.nodeVoltages[compiled.nodeNames.indexOf(name === 'gnd' ? 'gnd_sb' : name)];
    const [g, d, s] = transistor.nodes;
    return { idA: Math.abs(solution.deviceCurrents[transistor.id]), vgsV: voltage(g) - voltage(s), vdsV: voltage(d) - voltage(s) };
  };
  return { badge: PHYSICS, high: measure(highV), low: measure(0.6), lambda: Number(transistor.params?.lambda ?? 0.06) };
}

type ThresholdEvent = ReturnType<typeof evaluateThresholds>[number];
function decorate(event: ThresholdEvent | undefined, data: Record<string, unknown>) {
  if (!event) return null;
  const report = buildForensicReport({ event, samples: [], thresholds, meta: { source: failureData.id, ...data } });
  return report.failure;
}

function m2(components: SandboxComponent[], vdd: number) {
  function observe(railV: number) {
    const { solution } = solveSpec(components, (c) => c.id === 'rail1' ? railV : undefined);
    const stresses = Object.entries(solution.devicePower as Record<string, number>)
      .filter(([name]) => name.endsWith('.vgs'));
    if (!stresses.length) throw Error('Add a transistor to measure gate stress');
    const vgs = Math.max(...stresses.map(([, v]) => Math.abs(v)));
    if (!Number.isFinite(vgs)) throw Error('Non-finite gate stress');
    return evaluateThresholds({ vgsMaxV: vgs }, thresholds);
  }
  const trip = observe(vdd).find((e: ThresholdEvent) => e.type === 'gate_oxide_breakdown');
  const fix = trip ? proposeFix(trip, { vddNominalV: SKY130.VDD_NOMINAL_V }) : null;
  const maxVdd = fix?.patch?.vddMaxV;
  const fixedVdd = maxVdd === undefined ? null : Math.min(vdd, maxVdd);
  const retest = fixedVdd === null ? null : { maxVdd, vdd: fixedVdd, ticks: 1, trips: observe(fixedVdd).length };
  return { badge: PHYSICS, failure: decorate(trip, { vdd }), retest };
}

function m3(components: SandboxComponent[], vdd: number) {
  const trace = components.find((c) => c.kind === 'trace');
  const load = components.find((c) => c.kind === 'resistor');
  if (!trace || !load || trace.nodes[0] !== 'vdd' || trace.nodes[1] !== load.nodes[0] || load.nodes[1] !== 'gnd') {
    throw Error('Use a rail, copper trace and series load for this pulse test');
  }
  const length = Number(trace.params?.lengthUm) * 1e-6;
  const width = Number(trace.params?.widthUm) * 1e-6;
  const rLoad = Number(load.params?.R);
  if (!(length > 0 && width > 0 && rLoad > 0)) throw Error('Missing trace geometry or resistor value');
  // Declared met2 thickness, with copper properties for the curriculum trace.
  // Short-pulse adiabatic Fourier cell, with lateral heat flow neglected.
  const thickness = SKY130.METAL_STACK.met2.thickness_nm * 1e-9;
  const r0 = COPPER.RESISTIVITY * length / (width * thickness);
  const grid = createHeatGrid({ nx: 3, ny: 3, dxM: Math.sqrt(length * width), k: 0, hConvWm2K: 0,
    rhoC: COPPER.DENSITY * COPPER.SPECIFIC_HEAT, thicknessM: thickness, ambientK: 300 });
  const net = createNetlist(['gnd', 'vdd', 'mid']);
  net.addVSource({ a: 'vdd', b: 'gnd', V: vdd, label: 'rail' });
  net.addResistor({ a: 'vdd', b: 'mid', R: r0, label: 'trace' });
  net.addResistor({ a: 'mid', b: 'gnd', R: rLoad, label: 'load' });
  const power = new Float64Array(9);
  let last = 0;
  let trip: ThresholdEvent | undefined;
  for (let i = 0; i < 320 && !trip; i++) {
    const r = resistanceAtTemp(r0, COPPER.TCR, grid.T[4]);
    net.resistor('trace').R = r;
    const sol = solveDC(net);
    if (!sol.converged || !Number.isFinite(sol.deviceCurrents.trace)) throw Error('Copper pulse MNA solve refused');
    power[4] = sol.deviceCurrents.trace ** 2 * r;
    grid.step(1e-6, power);
    last = grid.T[4] - 273.15;
    if (!Number.isFinite(last)) throw Error('Copper pulse exceeded thermal admission');
    trip = evaluateThresholds({ traceTempC: last, traceNode: trace.id }, thresholds)[0];
  }
  return { badge: PHYSICS, failure: decorate(trip, { traceTempC: last }), traceTempC: last };
}

function m4(components: SandboxComponent[], railV: number) {
  if (!components.some((c) => c.kind === 'q4_inv')) throw Error('Place a Q4 inverter in the workspace');
  const levels = Q4_LEVELS_V.map((v) => v * railV / SKY130.VDD_NOMINAL_V);
  const family = REFERENCE.multiradix.parameters.quaternary_q4_1p8v_ldo;
  const midpoints = (family.nominal_midpoints_v as number[]).map((v) => v * railV / SKY130.VDD_NOMINAL_V);
  const levelsObserved = levels.map((inputV, value) => {
    const options = { id: 'academy-q4', lab: 'logic', meta: { radix: levels.length } };
    const diagram = new Diagram(options);
    const input = diagram.addBlock('logic.IN', { params: { value } });
    const inverter = diagram.addBlock('logic.NOT', { params: { delay: 0 } });
    const probe = diagram.addBlock('logic.PROBE');
    diagram.connect(input.id, 'out', inverter.id, 'a');
    diagram.connect(inverter.id, 'y', probe.id, 'in');
    const run = runLogic(diagram);
    const digit = (run.probes as Record<string, { values: (number | string)[] }>)[probe.id]?.values.at(-1);
    if (!run.ok || typeof digit !== 'number') throw Error('Q4 logic output is unresolved');
    const outputV = levels[digit];
    return { inputV, outputV, marginV: Math.min(...midpoints.map((m) => Math.abs(outputV - m))) };
  });
  return { badge: PHYSICS, levels: levelsObserved };
}

function heatGrid(size: number) {
  // Same silicon material model and die thickness as the live worker. The
  // Academy fixture uses 1 mm cells to match the educational tile grid.
  return createHeatGrid({ nx: size, ny: size, dxM: 0.001, k: SILICON.thermal_conductivity_w_per_m_k,
    rhoC: SILICON.density_kg_per_m3 * SILICON.specific_heat_j_per_kg_k, thicknessM: 0.0005, ambientK: 300, hConvWm2K: 40 });
}

function m6() {
  const size = 32;
  const grid = TPU.grid_size.educational;
  const a = Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, k) => ((i * 7 + k * 13) % 120) - 60));
  const b = Array.from({ length: size }, (_, k) => Array.from({ length: size }, (_, j) => ((k * 5 + j * 3) % 120) - 60));
  const result = systolicMatmul(a, b, { gridSize: grid, clockMHz: TPU.clock_mhz.tpu_v1, vdd: 0.8 });
  const weights = Array.from({ length: grid ** 2 }, (_, t) => {
    const r = Math.floor(t / grid) * 4, c = t % grid * 4;
    return result.C.slice(r, r + 4).reduce((s: number, row: number[]) => s + row.slice(c, c + 4).reduce((n, v) => n + Math.abs(v), 0), 0);
  });
  const activity = weights.map((w) => w / Math.max(...weights));
  const thermal = heatGrid(grid + 2);
  const power = new Float64Array((grid + 2) ** 2);
  const index = (i: number) => (Math.floor(i / grid) + 1) * (grid + 2) + (i % grid) + 1;
  const total = activity.reduce((sum, v) => sum + v, 0);
  activity.forEach((v, i) => { power[index(i)] = result.dynamicPowerW * v / total; });
  thermal.step(0.1, power);
  const peakRise = thermal.maxT - thermal.ambientK;
  if (!(peakRise > 0) || result.tileOverflow.length > 0) throw Error('TPU thermal or accumulator result not admitted');
  const colors = activity.map((_, i) => (thermal.T[index(i)] - thermal.ambientK) / peakRise);
  const idle = heatGrid(grid + 2);
  idle.step(0.1, new Float64Array(power.length));
  const idleColors = activity.map((_, i) => (idle.T[index(i)] - idle.ambientK) / peakRise);
  worldRef.current?.bay3.setTpuTileActivity(colors);
  physicsClient.setTilePower(result.dynamicPowerW);
  return { badge: ARCHITECTURE, a, b, c: result.C, grid, cycles: result.cycles, activity, colors, idleColors };
}

function m7() {
  const r = compareArchitectures({ M: 1, N: 4096, K: 4096 });
  return { badge: ARCHITECTURE, resultBadge: r.badge,
    unifiedCycles: r.unifiedInt8.totalCycles, discreteCycles: r.discreteInt8.totalCycles,
    q4Bytes: r.unifiedQ4.bytesOnBus, int8Bytes: r.unifiedInt8.bytesOnBus };
}

function m8(scale: number) {
  const thermal = heatGrid(5);
  const power = new Float64Array(25);
  const nominalMHz = TPU.clock_mhz.tpu_v1;
  const minMHz = TPU.clock_mhz.educational;
  let clock = nominalMHz;
  const controller = [];
  let trip: ThresholdEvent | undefined;
  // Same 10% clock step and 5 °C hysteresis as ep-chip's DVFS controller.
  const nominalPower = REFERENCE.architecture.valid_operating_envelope.simt_gpu.power_tdp_w;
  for (let tick = 1; tick <= 160 && !trip; tick++) {
    power[12] = scale * (tick / 160) * nominalPower * (clock / nominalMHz);
    thermal.step(0.002, power);
    const tempC = thermal.T[12] - 273.15;
    const beforeMHz = clock;
    trip = evaluateThresholds({ traceTempC: 0, junctionTempC: tempC }, thresholds)[0];
    if (!trip && tempC > THROTTLE_C) clock = Math.max(minMHz, clock * 0.9);
    else if (!trip && tempC < THROTTLE_C - 5) clock = Math.min(nominalMHz, clock * 1.1);
    controller.push({ tempC, beforeMHz, afterMHz: clock });
  }
  return { badge: ARCHITECTURE, failure: decorate(trip, { clockMHz: clock }), controller };
}

function transmon(nQubits: number) {
  return new TransmonDevice({ nQubits, t1Us: TRANSMON.t1_us.typical, t2Us: TRANSMON.t2_us.typical, seed: 20241120 });
}

function m9() {
  const populationAtUs = TRANSMON.t1_us.typical;
  const coherenceAtUs = TRANSMON.t2_us.typical;
  const longitudinal = transmon(1);
  longitudinal.applyIdeal(OPS.X, 0).idle(populationAtUs);
  const transverse = transmon(1);
  transverse.applyIdeal(OPS.H, 0).idle(coherenceAtUs);
  return { badge: QUANTUM, populationAtUs, coherenceAtUs, population: longitudinal.sim.rho.re[3],
    coherence: Math.hypot(transverse.sim.rho.re[1], transverse.sim.rho.im[1]) };
}

function m10(loadW: number) {
  const stage = createCryoStage({ q15mkW: cryoCooling.stage_15mk_w, q100mkW: cryoCooling.stage_100mk_w, q4kW: cryoCooling.stage_4k_w });
  const initialK = stage.tempK;
  const trip = evaluateThresholds({ driveLoadW: loadW }, thresholds)[0];
  const cold = transmon(3);
  for (let i = 0; i < 3; i++) cold.applyIdeal(OPS.H, i);
  const length = (rho: typeof cold.sim.rho) => Array.from({ length: 3 }, (_, i) => {
    const { x, y, z } = rho.blochVector(i);
    return Math.hypot(x, y, z);
  });
  for (let i = 0; i < 480; i++) stage.step(1 / 240, loadW);
  const peakK = stage.tempK;
  // Above the sealed Al transition the model loses its superconducting
  // qubit state. The maximally mixed representation carries zero Bloch
  // polarization, without inventing temperature-dependent T1/T2 values.
  const after = peakK > AL_TC_K ? new DensityMatrix(3, 'maxmixed') : cold.sim.rho;
  if (peakK > AL_TC_K) {
    worldRef.current?.bay1.setBlochOverlay(false);
    store.set({ blochOverlay: false });
  }
  return { badge: QUANTUM, failure: decorate(trip, { loadW }), initialK, peakK,
    blochBefore: length(cold.sim.rho), blochAfter: length(after) };
}

function m11() {
  const seed = 20241120;
  const sample = (base: number) => Array.from({ length: 8 }, (_, i) => {
    const p = (i + 1) / 100;
    return { p, logical: surfaceCodeLogicalErrorRate(600, p, base + i),
      bitflip: bitFlipLogicalErrorRate(600, p, base + 100 + i) };
  });
  const sweep = sample(seed);
  store.set({ qecCurve: sweep });
  return { badge: QUANTUM, seed, repeatSeed: seed, sweep, replay: sample(seed) };
}

export async function runMission(mission: Mission, value?: number) {
  const state = assertLive(mission);
  const control = CONTROLS[mission.id];
  const setting = mission.id === 'M10-CRYO-QUENCH' ? state.drivePowerMW
    : mission.workspace === 'silicon' && mission.id !== 'M1-MOSFET-IV' ? state.vddSlider
      : value ?? control?.value ?? 0;
  if (control && (!Number.isFinite(setting) || setting < control.min || setting > control.max)) {
    throw Error('Mission input is outside the admitted bench range');
  }
  const components = state.sandboxComponents;
  switch (mission.id) {
    case 'M1-MOSFET-IV': return m1(components, setting);
    case 'M2-OXIDE-SOA': return m2(components, setting);
    case 'M3-CU-FUSING': return m3(components, setting);
    case 'M4-Q4-INVERTER': return m4(components, setting);
    case 'M5-CUSTOM-IC': {
      const { characterizeAcademyIc } = await import('./customIcTrial.js');
      return { badge: PHYSICS, ...await characterizeAcademyIc(components, setting) };
    }
    case 'M6-TPU-GEMM': return m6();
    case 'M7-UNIFIED-MEMORY': return m7();
    case 'M8-DVFS-THERMAL': return m8(setting);
    case 'M9-LINDBLAD-DECAY': return m9();
    case 'M10-CRYO-QUENCH': return m10(setting / 1000);
    case 'M11-SURFACE-CODE': return m11();
    default: throw Error('No solver is registered for this mission');
  }
}
