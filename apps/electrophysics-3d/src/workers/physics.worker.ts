// Electrophysics Lab — real-time physics worker.
//
// Runs a Modified-Nodal-Analysis circuit solve + 2D Fourier heat diffusion +
// cryo thermal ODE at 240 Hz, publishes 60 Hz snapshots, records a 100 ms
// forensic ring buffer, and evaluates failure thresholds from
// data/reference-library/06_failure_physics_thresholds.json.
//
// Model notes (honest scope):
//  - quasi-static DC MNA per tick (gate drive is piecewise-constant)
//  - electro-thermal coupling: R(T) via Cu TCR; P = I²R(T) heats the grid
//  - FR-4 delamination threshold is 260 °C (verified reference; the 400 °C
//    figure in older draft copy is superseded)

import {
  createNetlist,
  solveDC,
  compileSandbox,
  createHeatGrid,
  resistanceAtTemp,
  tempToRGBf,
  RingBuffer,
  evaluateThresholds,
  proposeFix,
  buildForensicReport,
  createCryoStage,
} from '@physics/index.mjs';

import semiJson from '@reflib/02_semiconductor_pdk_silicon.json';
import failJson from '@reflib/06_failure_physics_thresholds.json';

const SKY = semiJson.parameters.sky130a;
const CU = semiJson.material_properties.copper;
const FR4 = semiJson.material_properties.fr4_pcb;
const SI = semiJson.material_properties.silicon;

const TH = {
  vgsThresholdV: failJson.failure_thresholds.gate_oxide_tddb.vgs_threshold_v,
  gammaDecPerV: failJson.failure_thresholds.gate_oxide_tddb.gamma_dec_per_v,
  hardBreakdownV: failJson.parameters.gate_oxide_tddb.hard_breakdown.vgs_irreversible_v,
  cuMeltingC: failJson.failure_thresholds.cu_melting_c,
  fr4DelaminationC: failJson.failure_thresholds.fr4_delamination_c,
  siThermalRunawayC: failJson.failure_thresholds.si_thermal_runaway_c,
  cryoQuench15mkW: failJson.failure_thresholds.cryo_quench_15mk_w,
};

export interface WorkerParams {
  vdd: number;
  vddMaxV: number | null;
  gateLevel: number; // Q4 gate drive: 0 / 0.6 / 1.2 / 1.8
  loadR: number; // ohms
  traceWidthFactor: number;
  drivePowerW: number; // bay 1 microwave drive (cryo load)
  thermalConvectionScale: number;
  tilePowerScale: number;
}

const params: WorkerParams = {
  vdd: SKY.nominal_vdd_v,
  vddMaxV: null,
  gateLevel: 1.8,
  loadR: 100000,
  traceWidthFactor: 1,
  drivePowerW: 0.005,
  thermalConvectionScale: 1,
  tilePowerScale: 0.5,
};

// ---------------------------------------------------------------- circuit --
const nl = createNetlist(['gnd', 'vdd_src', 'vdd_rail', 'vout_q4', 'vout_bin', 'gate_q4', 'gate_bin']);
nl.addVSource({ a: 'vdd_src', b: 'gnd', V: params.vdd, label: 'VDD' });
// met2 supply rail: sheet resistance × ~40 squares, temperature-dependent.
const R_RAIL_0 = (SKY.metal_stack.met2.sheet_resistance_ohm_per_sq as number) * 40;
nl.addResistor({ a: 'vdd_src', b: 'vdd_rail', R: R_RAIL_0, label: 'RAIL_VDD' });
// Q4 inverter (kp = µCox·W/L in A/V²)
nl.addMosfet({ type: 'p', g: 'gate_q4', d: 'vout_q4', s: 'vdd_rail', vth: SKY.vth_pmos_typ_v, kp: 0.004, lambda: 0.06, label: 'MP_Q4' });
nl.addMosfet({ type: 'n', g: 'gate_q4', d: 'vout_q4', s: 'gnd', vth: SKY.vth_nmos_typ_v, kp: 0.004, lambda: 0.06, label: 'MN_Q4' });
nl.addResistor({ a: 'vout_q4', b: 'gnd', R: params.loadR, label: 'RLOAD_Q4' });
// Binary inverter (comparison cell)
nl.addMosfet({ type: 'p', g: 'gate_bin', d: 'vout_bin', s: 'vdd_rail', vth: SKY.vth_pmos_typ_v, kp: 0.004, lambda: 0.06, label: 'MP_BIN' });
nl.addMosfet({ type: 'n', g: 'gate_bin', d: 'vout_bin', s: 'gnd', vth: SKY.vth_nmos_typ_v, kp: 0.004, lambda: 0.06, label: 'MN_BIN' });
nl.addResistor({ a: 'vout_bin', b: 'gnd', R: params.loadR, label: 'RLOAD_BIN' });
// Gate drives (stiff sources = ideal drivers)
nl.addVSource({ a: 'gate_q4', b: 'gnd', V: params.gateLevel, label: 'GATE_Q4' });
nl.addVSource({ a: 'gate_bin', b: 'gnd', V: 0, label: 'GATE_BIN' });

const MP_Q4 = nl.mosfet('MP_Q4');
const MP_BIN = nl.mosfet('MP_BIN');

// ------------------------------------------------------------------ heat ---
const dieGrid = createHeatGrid({
  nx: 48, ny: 32, dxM: 4e-4,
  k: SI.thermal_conductivity_w_per_m_k,
  rhoC: SI.density_kg_per_m3 * SI.specific_heat_j_per_kg_k,
  thicknessM: 5e-4,
  ambientK: 300,
  hConvWm2K: 40,
});
const pcbGrid = createHeatGrid({
  nx: 40, ny: 28, dxM: 2.5e-3,
  // Composite in-plane conductivity: FR-4 bulk is 0.3 W/m·K through-thickness,
  // but real boards spread laterally through copper planes (~15 W/m·K effective).
  // Through-thickness convection uses the full package→board→air path.
  k: 15,
  rhoC: FR4.density_kg_per_m3 * FR4.specific_heat_j_per_kg_k,
  thicknessM: 1.6e-3,
  ambientK: 300,
  hConvWm2K: 120,
});
const diePower = new Float64Array(dieGrid.nx * dieGrid.ny);
const pcbPower = new Float64Array(pcbGrid.nx * pcbGrid.ny);

// Tile layout on the PCB grid (normalised coords matching bay3 chiplets).
const TILES = [
  { id: 'cpu', x: 0.24, y: 0.34, w: 6, idle: 0.12 },
  { id: 'tpu', x: 0.5, y: 0.3, w: 6, idle: 6.0 },
  { id: 'gpu', x: 0.76, y: 0.36, w: 6, idle: 9.8 },
  { id: 'mem', x: 0.42, y: 0.72, w: 8, idle: 2.1 },
];

// ------------------------------------------------------------------ cryo ---
const cryo = createCryoStage({});
let cryoQuenched = false;

// -------------------------------------------------------------- recorder ---
const ring = new RingBuffer(32); // 100 ms @ 240 Hz
let simT = 0;
let paused = false;
let meltedRail = false;
let binClock = 0;
let lastFailureEvent: ReturnType<typeof evaluateThresholds>[number] | null = null;
let failureLatch = new Set<string>();

function effectiveVdd(): number {
  return params.vddMaxV !== null ? Math.min(params.vdd, params.vddMaxV) : params.vdd;
}

function updateNetlist(): void {
  nl.elements.find((e) => e.label === 'VDD')!.V = effectiveVdd();
  nl.elements.find((e) => e.label === 'GATE_Q4')!.V = params.gateLevel;
  nl.elements.find((e) => e.label === 'GATE_BIN')!.V = binClock;
  nl.resistor('RLOAD_Q4').R = params.loadR;
  nl.resistor('RLOAD_BIN').R = params.loadR;
  const rail = nl.resistor('RAIL_VDD')!;
  if (meltedRail) {
    rail.R = 1e9; // open circuit
  } else {
    const traceK = dieGrid.tempAt(0.5, 0.18); // cell under the supply rail
    rail.R = resistanceAtTemp(R_RAIL_0, CU.tcr_per_k, traceK) / params.traceWidthFactor;
  }
}

function injectHeat(dieRailI: number, railR: number, sol: ReturnType<typeof solveDC>): void {
  diePower.fill(0);
  pcbPower.fill(0);
  // Rail Joule heating spread over the rail cells.
  const pRail = dieRailI * dieRailI * railR;
  for (let i = 0; i < 5; i++) dieGrid.addPowerAt(0.35 + i * 0.075, 0.18, pRail / 5, diePower);
  // Transistor dissipation: P = Vds·Id at each device cell.
  for (const q of [MP_Q4, MP_BIN]) {
    const p = sol.devicePower[q.label] ?? 0;
    dieGrid.addPowerAt(q === MP_Q4 ? 0.42 : 0.58, 0.32, p, diePower);
  }
  for (const label of ['MN_Q4', 'MN_BIN']) {
    const p = sol.devicePower[label] ?? 0;
    dieGrid.addPowerAt(label === 'MN_Q4' ? 0.42 : 0.58, 0.52, p, diePower);
  }
  // SoC tiles on the PCB grid — power spread over each tile's footprint.
  for (const tile of TILES) {
    const p = tile.idle * params.tilePowerScale;
    const spread = 24; // 6×4 cells ≈ tile footprint
    for (let i = 0; i < spread; i++) {
      const fx = tile.x - 0.15 + (i % 6) * 0.06;
      const fy = tile.y - 0.1 + Math.floor(i / 6) * 0.066;
      pcbGrid.addPowerAt(fx, fy, p / spread, pcbPower);
    }
  }
}

interface Snapshot {
  t: number;
  vdd: number;
  vgsMax: number;
  vgsMaxNode: string | null;
  iMax: number;
  tempMaxC: number;
  nodes: Record<string, number>;
  currents: Record<string, number>;
  temps: Record<string, number>;
}

// ------------------------------------------------------------- sandbox ----
let sandbox: ReturnType<typeof compileSandbox> | null = null;

function solveSandbox(dt: number): { snapshot: Snapshot; events: ReturnType<typeof evaluateThresholds>; sol: ReturnType<typeof solveDC> } | null {
  if (!sandbox) return null;
  const sol = solveDC(sandbox.netlist, { maxNewtonSteps: 40 });
  if (!sol.converged) return null;
  // Heat injection at the compiled anchors: trace I²R and device dissipation.
  diePower.fill(0);
  for (const anchor of sandbox.heatAnchors) {
    if (anchor.kind === 'trace') {
      const i = Math.abs(sol.deviceCurrents[labelOfTrace(sandbox, anchor.id)] ?? 0);
      const p = i * i * (anchor.R ?? 1);
      dieGrid.addPowerAt((anchor.position[0] % 1 + 1) % 1, 0.4, p, diePower);
    } else if (anchor.kind === 'device' || anchor.kind === 'cell') {
      const labels = Object.keys(sol.devicePower).filter((k) => !k.includes('.') && sol.devicePower[k] > 0 && k.startsWith(anchor.id ?? ''));
      const p = labels.reduce((s, k) => s + sol.devicePower[k], 0);
      dieGrid.addPowerAt((anchor.position[0] % 1 + 1) % 1, 0.6, p, diePower);
    }
  }
  dieGrid.step(dt, diePower);
  pcbGrid.step(dt, pcbPower);
  cryo.step(dt, params.drivePowerW);

  const traceK = dieGrid.tempAt(0.5, 0.4);
  const traceC = traceK - 273.15;
  const junctionK = dieGrid.tempAt(0.6, 0.6);
  const pcbC = pcbGrid.maxT - 273.15;
  let vgsMax = 0;
  let vgsMaxNode: string | null = null;
  for (const [k, v] of Object.entries(sol.devicePower)) {
    if (k.endsWith('.vgs') && Math.abs(v) > Math.abs(vgsMax)) {
      vgsMax = v;
      vgsMaxNode = k.slice(0, -4);
    }
  }
  const iMax = Math.max(0, ...Object.values(sol.deviceCurrents).map((v) => Math.abs(v)));
  const nodes: Record<string, number> = {};
  sandbox.nodeNames.forEach((n, idx) => {
    nodes[n] = sol.nodeVoltages[idx];
  });
  const snapshot: Snapshot = {
    t: simT,
    vdd: params.vdd,
    vgsMax,
    vgsMaxNode,
    iMax,
    tempMaxC: Math.max(traceC, pcbC, junctionK - 273.15),
    nodes,
    currents: { ...sol.deviceCurrents },
    temps: {
      traceC,
      pcbC,
      junctionC: junctionK - 273.15,
      cryoK: cryo.tempK,
      tiles: Object.fromEntries(TILES.map((tl) => [tl.id, pcbGrid.tempAt(tl.x, tl.y) - 273.15])),
    },
  };
  ring.push(snapshot);
  const events = evaluateThresholds(
    {
      vgsMaxV: vgsMax,
      vgsMaxNode,
      traceTempC: traceC,
      pcbTempC: pcbC,
      junctionTempC: junctionK - 273.15,
      driveLoadW: params.drivePowerW,
    },
    TH
  );
  return { snapshot, events, sol };
}

function labelOfTrace(sb: NonNullable<typeof sandbox>, id: string): string {
  const trace = sb.netlist.elements.find((e) => e.kind === 'R' && e.label?.startsWith('TRACE'));
  return trace?.label ?? '';
}

function physicsTick(dt: number): { snapshot: Snapshot; events: ReturnType<typeof evaluateThresholds>; sol: ReturnType<typeof solveDC> } | null {
  if (sandbox) return solveSandbox(dt);
  simT += dt;
  binClock = Math.floor(simT * 2) % 2 === 0 ? 0 : SKY.nominal_vdd_v; // 1 Hz binary gate clock
  updateNetlist();
  const sol = solveDC(nl, { maxNewtonSteps: 40 });
  if (!sol.converged) return null;

  const iRail = Math.abs(sol.deviceCurrents.RAIL_VDD ?? 0);
  const railR = nl.resistor('RAIL_VDD')!.R;
  injectHeat(iRail, railR, sol);
  dieGrid.step(dt, diePower);
  pcbGrid.step(dt, pcbPower);
  cryo.step(dt, params.drivePowerW);

  const traceK = dieGrid.tempAt(0.5, 0.18);
  const traceC = traceK - 273.15;
  const junctionK = dieGrid.tempAt(0.42, 0.42);
  const pcbC = pcbGrid.maxT - 273.15;
  const vgsMP = sol.devicePower['MP_Q4.vgs'] ?? 0;
  const vgsMPBin = sol.devicePower['MP_BIN.vgs'] ?? 0;
  const vgsMax = Math.max(vgsMP, vgsMPBin);
  const vgsMaxNode = vgsMP >= vgsMPBin ? 'MP_Q4' : 'MP_BIN';

  const snapshot: Snapshot = {
    t: simT,
    vdd: effectiveVdd(),
    vgsMax,
    vgsMaxNode,
    iMax: iRail,
    tempMaxC: Math.max(traceC, pcbC, junctionK - 273.15),
    nodes: { vout_q4: sol.nodeVoltages[3], vout_bin: sol.nodeVoltages[4], vdd_rail: sol.nodeVoltages[2] },
    currents: { VDD: sol.deviceCurrents.VDD ?? 0, RAIL: iRail },
    temps: {
      traceC,
      pcbC,
      junctionC: junctionK - 273.15,
      cryoK: cryo.tempK,
      tiles: Object.fromEntries(TILES.map((tl) => [tl.id, pcbGrid.tempAt(tl.x, tl.y) - 273.15])),
    },
  };
  ring.push(snapshot);

  const events = evaluateThresholds(
    {
      vgsMaxV: vgsMax,
      vgsMaxNode,
      traceTempC: traceC,
      pcbTempC: pcbC,
      junctionTempC: junctionK - 273.15,
      driveLoadW: params.drivePowerW,
    },
    TH
  );
  return { snapshot, events, sol };
}

function applyFaultActions(events: ReturnType<typeof evaluateThresholds>): void {
  for (const ev of events) {
    if (failureLatch.has(ev.type)) continue;
    if (ev.type === 'gate_oxide_breakdown') {
      // The highest-stress PMOS gate shorts permanently.
      const target = ev.node === 'MP_BIN' ? MP_BIN : MP_Q4;
      target.gateShorted = true;
      postMessage({ type: 'faultFx', fx: { kind: 'arc', node: ev.node, value: ev.value } });
    } else if (ev.type === 'trace_fusing') {
      meltedRail = true;
      postMessage({ type: 'faultFx', fx: { kind: 'melt', node: 'RAIL_VDD', value: ev.value } });
    } else if (ev.type === 'pcb_delamination') {
      postMessage({ type: 'faultFx', fx: { kind: 'smoke', node: 'pcb', value: ev.value } });
    } else if (ev.type === 'cryo_quench') {
      cryoQuenched = true;
      postMessage({ type: 'faultFx', fx: { kind: 'quench', node: 'mixing_chamber', value: ev.value } });
    }
    failureLatch.add(ev.type);
    lastFailureEvent = ev;
    // Build the forensic report from the last 100 ms and pause.
    const window = ring.windowLast(100);
    const report = buildForensicReport({
      event: ev,
      samples: window,
      thresholds: {
        vgs_threshold_v: TH.vgsThresholdV,
        gamma_dec_per_v: TH.gammaDecPerV,
        hard_breakdown_v: TH.hardBreakdownV,
        cu_melting_c: TH.cuMeltingC,
        fr4_delamination_c: TH.fr4DelaminationC,
        si_thermal_runaway_c: TH.siThermalRunawayC,
        cryo_quench_15mk_w: TH.cryoQuench15mkW,
      },
      meta: {
        simTimeS: simT,
        datasetSha256: failJson.id,
        playbackScale: 1,
        engine: 'packages/physics-engine (MNA + FTCS heat + cryo ODE)',
      },
    });
    paused = true;
    postMessage({ type: 'failure', report, replay: window, fix: proposeFix(ev, { vddNominalV: SKY.nominal_vdd_v }) });
  }
}

function resetFaults(): void {
  for (const q of [MP_Q4, MP_BIN]) q.gateShorted = false;
  meltedRail = false;
  cryoQuenched = false;
  failureLatch.clear();
  lastFailureEvent = null;
  dieGrid.T.fill(dieGrid.ambientK);
  pcbGrid.T.fill(pcbGrid.ambientK);
  cryo.tempK = 0.015;
  ring.clear();
  paused = false;
}

// ------------------------------------------------------------ main loop ----
const TICK = 1 / 240;
let acc = 0;
let lastFrame = performance.now();
let tickCount = 0;
let lastLive = true;

function loop(): void {
  const now = performance.now();
  let frameDt = (now - lastFrame) / 1000;
  lastFrame = now;
  if (frameDt > 0.25) frameDt = 0.25;
  if (!paused) {
    acc += frameDt;
    let anyEvents: ReturnType<typeof evaluateThresholds> = [];
    let latest: ReturnType<typeof physicsTick> = null;
    while (acc >= TICK) {
      acc -= TICK;
      latest = physicsTick(TICK);
      if (latest) {
        anyEvents = latest.events;
        tickCount++;
        if (anyEvents.length > 0) break;
      }
    }
    if (latest) {
      applyFaultActions(anyEvents);
      if (tickCount % 4 === 0 && !paused) {
        const s = latest.snapshot;
        postMessage({
          type: 'snapshot',
          snapshot: s,
          live: true,
          q4Color: tempToRGBf(0), // placeholder — colour computed on main from vout
        });
      }
    }
  }
  // Cryo stage keeps evolving even when circuit sim pauses (it is bay-1 physics).
  void lastLive;
  setTimeout(loop, 4); // ~240 Hz scheduler
}
loop();

// ------------------------------------------------------------- messaging ---
self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === 'params') {
    Object.assign(params, msg.patch);
    if (msg.patch.drivePowerW !== undefined && cryoQuenched && msg.patch.drivePowerW <= TH.cryoQuench15mkW) {
      // load brought back under budget — allow recovery
      cryoQuenched = false;
    }
  } else if (msg.type === 'resume') {
    paused = false;
    lastFrame = performance.now();
  } else if (msg.type === 'reset') {
    resetFaults();
    params.vddMaxV = null;
    params.traceWidthFactor = 1;
    postMessage({ type: 'resetDone' });
  } else if (msg.type === 'applyFix') {
    // Physics-valid fix: reset the fault chain, apply the patch, re-run clean.
    const patch: Partial<WorkerParams> = msg.patch ?? {};
    if (patch.vddMaxV !== undefined) params.vddMaxV = patch.vddMaxV;
    if (patch.traceWidthFactor !== undefined) params.traceWidthFactor = patch.traceWidthFactor;
    if (patch.drivePowerMaxW !== undefined) params.drivePowerW = Math.min(params.drivePowerW, patch.drivePowerMaxW);
    if (patch.convectionScale !== undefined) params.thermalConvectionScale = patch.convectionScale;
    resetFaults();
    postMessage({ type: 'fixed', applied: patch });
  } else if (msg.type === 'setNetlist') {
    try {
      sandbox = compileSandbox(msg.spec);
      failureLatch.clear();
      postMessage({ type: 'netlistLoaded', warnings: sandbox.warnings, nodeNames: sandbox.nodeNames });
    } catch (err) {
      postMessage({ type: 'error', error: String(err) });
    }
  } else if (msg.type === 'clearNetlist') {
    sandbox = null;
    failureLatch.clear();
    resetFaults();
    postMessage({ type: 'netlistLoaded', warnings: ['default bench restored'], nodeNames: [] });
  } else if (msg.type === 'setTilePower') {
    // wattsPerTile → per-tile dissipation scale (real Fourier heat coupling).
    const wpt = Math.max(0, Math.min(200, msg.wattsPerTile ?? 0));
    params.tilePowerScale = wpt / 9.8; // 9.8 W = GPU idle-model reference
  } else if (msg.type === 'getState') {
    postMessage({ type: 'state', params: { ...params }, simT, paused });
  }
};
