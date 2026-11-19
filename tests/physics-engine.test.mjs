import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  createNetlist,
  solveDC,
  evaluateThresholds,
  proposeFix,
  buildForensicReport,
  reportToMarkdown,
  tempToRGB,
  RingBuffer,
  createHeatGrid,
  resistanceAtTemp,
  createCryoStage,
} from '../packages/physics-engine/src/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const failuresJson = JSON.parse(
  readFileSync(path.join(here, '..', 'data', 'reference-library', '06_failure_physics_thresholds.json'), 'utf8')
);
const semiJson = JSON.parse(
  readFileSync(path.join(here, '..', 'data', 'reference-library', '02_semiconductor_pdk_silicon.json'), 'utf8')
);

const TH = {
  vgsThresholdV: failuresJson.failure_thresholds.gate_oxide_tddb.vgs_threshold_v,
  gammaDecPerV: failuresJson.failure_thresholds.gate_oxide_tddb.gamma_dec_per_v,
  hardBreakdownV: failuresJson.parameters.gate_oxide_tddb.hard_breakdown.vgs_irreversible_v,
  cuMeltingC: failuresJson.failure_thresholds.cu_melting_c,
  fr4DelaminationC: failuresJson.failure_thresholds.fr4_delamination_c,
  siThermalRunawayC: failuresJson.failure_thresholds.si_thermal_runaway_c,
  cryoQuench15mkW: failuresJson.failure_thresholds.cryo_quench_15mk_w,
};

test('MNA: resistive divider solves exactly and conserves KCL at every node', () => {
  const nl = createNetlist(['gnd', 'vout', 'vdd']);
  nl.addVSource({ a: 'vdd', b: 'gnd', V: 1.8, label: 'VDD' });
  nl.addResistor({ a: 'vdd', b: 'vout', R: 1000, label: 'R1' });
  nl.addResistor({ a: 'vout', b: 'gnd', R: 2000, label: 'R2' });
  const s = solveDC(nl);
  assert.equal(s.converged, true);
  // Exact: vout = 1.8 · R2/(R1+R2) = 1.2 V
  assert.ok(Math.abs(s.nodeVoltages[1] - 1.2) < 1e-9, `vout=${s.nodeVoltages[1]}`);
  // KCL at vout: (vdd−vout)/R1 = vout/R2
  // (tolerance: first-order numeric Jacobian → residual ~1e-12)
  const iIn = (1.8 - s.nodeVoltages[1]) / 1000;
  const iOut = s.nodeVoltages[1] / 2000;
  assert.ok(Math.abs(iIn - iOut) < 1e-9, `KCL residual ${iIn - iOut}`);
  // Source current equals load current
  assert.ok(Math.abs(Math.abs(s.deviceCurrents.VDD) - iIn) < 1e-9);
  // Power conservation: source delivers = resistors dissipate
  const pR = s.devicePower.R1 + s.devicePower.R2;
  const pS = s.devicePower.VDD;
  assert.ok(Math.abs(pR - pS) < 1e-9, `power balance ${pR - pS}`);
});

test('MNA: CMOS inverter converges across full input sweep (square-law + CLM)', () => {
  const inv = createNetlist(['gnd', 'vdd', 'vin', 'vout']);
  inv.addVSource({ a: 'vdd', b: 'gnd', V: 1.8, label: 'VDD' });
  inv.addVSource({ a: 'vin', b: 'gnd', V: 0, label: 'VIN' });
  inv.addResistor({ a: 'vout', b: 'gnd', R: 100000, label: 'RLOAD' });
  inv.addMosfet({ type: 'p', g: 'vin', d: 'vout', s: 'vdd', vth: -0.55, kp: 0.004, lambda: 0.06, label: 'MP' });
  inv.addMosfet({ type: 'n', g: 'vin', d: 'vout', s: 'gnd', vth: 0.55, kp: 0.004, lambda: 0.06, label: 'MN' });
  for (const vin of [0, 0.6, 0.9, 1.2, 1.8]) {
    inv.elements.find((e) => e.label === 'VIN').V = vin;
    const s = solveDC(inv);
    assert.equal(s.converged, true, `vin=${vin} must converge`);
    const vout = s.nodeVoltages[3];
    if (vin < 0.9) assert.ok(vout > 1.5, `vin=${vin} → vout high, got ${vout}`);
    if (vin > 1.2) assert.ok(vout < 0.1, `vin=${vin} → vout low, got ${vout}`);
  }
});

test('MNA: overdrive stress reported — Vsg reaches VDD when input is low', () => {
  const inv = createNetlist(['gnd', 'vdd', 'vin', 'vout']);
  inv.addVSource({ a: 'vdd', b: 'gnd', V: 2.5, label: 'VDD' });
  inv.addVSource({ a: 'vin', b: 'gnd', V: 0, label: 'VIN' });
  inv.addResistor({ a: 'vout', b: 'gnd', R: 100000, label: 'RLOAD' });
  inv.addMosfet({ type: 'p', g: 'vin', d: 'vout', s: 'vdd', vth: -0.55, kp: 0.004, lambda: 0.06, label: 'MP' });
  inv.addMosfet({ type: 'n', g: 'vin', d: 'vout', s: 'gnd', vth: 0.55, kp: 0.004, lambda: 0.06, label: 'MN' });
  const s = solveDC(inv);
  assert.equal(s.converged, true);
  assert.ok(Math.abs(s.devicePower['MP.vgs'] - 2.5) < 1e-6, `MP.vgs=${s.devicePower['MP.vgs']}`);
  assert.ok(s.devicePower['MP.vgs'] > TH.vgsThresholdV);
});

test('MNA: shorted-gate breakdown fault makes the inverter output stuck', () => {
  const inv = createNetlist(['gnd', 'vdd', 'vin', 'vout']);
  inv.addVSource({ a: 'vdd', b: 'gnd', V: 1.8, label: 'VDD' });
  inv.addVSource({ a: 'vin', b: 'gnd', V: 0, label: 'VIN' });
  // Non-ideal gate driver (Thevenin): a shorted gate drags the input node high.
  inv.addResistor({ a: 'vin', b: 'gnd', R: 10000, label: 'RDRIVE' });
  inv.addResistor({ a: 'vout', b: 'gnd', R: 100000, label: 'RLOAD' });
  inv.addMosfet({ type: 'p', g: 'vin', d: 'vout', s: 'vdd', vth: -0.55, kp: 0.004, lambda: 0.06, label: 'MP' });
  inv.addMosfet({ type: 'n', g: 'vin', d: 'vout', s: 'gnd', vth: 0.55, kp: 0.004, lambda: 0.06, label: 'MN' });
  const healthy = solveDC(inv);
  assert.ok(healthy.nodeVoltages[3] > 1.5, `healthy vin=0 → vout high: ${healthy.nodeVoltages[3]}`);
  assert.ok(healthy.nodeVoltages[2] < 0.01, `healthy vin ≈ 0: ${healthy.nodeVoltages[2]}`);
  // Trip the permanent fault: gate oxide shorted (post-breakdown, 1 Ω short).
  // The gate bias is a resistive pulldown (no stiff source): the short then
  // drags the gate node toward VDD through the pulldown divider.
  inv.elements = inv.elements.filter((e) => e.kind !== 'V' || e.label !== 'VIN');
  inv.mosfet('MP').gateShorted = true;
  const faulted = solveDC(inv);
  assert.equal(faulted.converged, true);
  // The short pulls the gate node to VDD → PMOS off → NMOS on → output stuck low.
  assert.ok(faulted.nodeVoltages[2] > 1.7, `shorted gate drags vin high: ${faulted.nodeVoltages[2]}`);
  assert.ok(faulted.nodeVoltages[3] < 0.5, `output stuck low: ${faulted.nodeVoltages[3]}`);
});

test('Heat PDE: pure-convection steady state matches the analytic solution', () => {
  // dT/dt = (P − h·A·(T−Tamb)) / (ρ·c·V) → T∞ = Tamb + P/(h·A)
  const grid = createHeatGrid({
    nx: 8,
    ny: 8,
    dxM: 1e-3,
    k: 1e-9, // conduction disabled for the analytic check
    rhoC: semiJson.material_properties.fr4_pcb.density_kg_per_m3 * semiJson.material_properties.fr4_pcb.specific_heat_j_per_kg_k,
    thicknessM: 1.6e-3,
    ambientK: 300,
    hConvWm2K: 100,
  });
  const power = new Float64Array(grid.nx * grid.ny);
  const center = 4 * grid.nx + 4;
  power[center] = 1.0; // 1 W into one 1 mm² cell
  let maxT = 0;
  for (let i = 0; i < 20000; i++) {
    const r = grid.step(0.01, power);
    maxT = r.maxT;
  }
  const cellArea = 1e-3 * 1e-3;
  const expected = 300 + 1.0 / (100 * cellArea);
  assert.ok(Math.abs(maxT - expected) / expected < 0.02, `steady T=${maxT.toFixed(1)} vs analytic ${expected.toFixed(1)}`);
});

test('Heat PDE: symmetric source produces a symmetric field (no numerical bias)', () => {
  const grid = createHeatGrid({
    nx: 21,
    ny: 21,
    dxM: 5e-4,
    k: semiJson.material_properties.copper.thermal_conductivity_w_per_m_k,
    rhoC: semiJson.material_properties.copper.density_kg_per_m3 * semiJson.material_properties.copper.specific_heat_j_per_kg_k,
    thicknessM: 5.7e-4,
    ambientK: 300,
    hConvWm2K: 5,
  });
  const power = new Float64Array(grid.nx * grid.ny);
  const c = 10 * grid.nx + 10;
  power[c] = 0.5;
  grid.step(0.01, power);
  grid.step(0.01, power);
  const t = grid.T;
  const center = t[c];
  const left = t[10 * grid.nx + 8];
  const right = t[10 * grid.nx + 12];
  assert.ok(Math.abs(left - right) < 1e-9, `symmetry ${left} vs ${right}`);
  assert.ok(center > left, 'center must be hottest');
  assert.ok(grid.maxT < 5000, 'no thermal blowup');
});

test('Resistance temperature coefficient (Cu TCR from 02 JSON)', () => {
  const R0 = 0.125; // met1 sheet path Ω
  const alpha = semiJson.material_properties.copper.tcr_per_k;
  const rHot = resistanceAtTemp(R0, alpha, 1358, 300); // ~1085 °C
  assert.ok(rHot > R0 * 4 && rHot < R0 * 6, `R(1085 °C) = ${rHot.toFixed(2)} Ω`);
});

test('Failure thresholds: exact 1.95 V SOA trip from the verified JSON', () => {
  const below = evaluateThresholds({ vgsMaxV: TH.vgsThresholdV - 0.01, vgsMaxNode: 'mp.gate' }, TH);
  assert.equal(below.length, 0);
  const above = evaluateThresholds({ vgsMaxV: TH.vgsThresholdV + 0.05, vgsMaxNode: 'mp.gate' }, TH);
  assert.equal(above.length, 1);
  assert.equal(above[0].type, 'gate_oxide_breakdown');
  assert.ok(above[0].equation.includes('TDDB'));
  // Hard breakdown at 3 V
  const hard = evaluateThresholds({ vgsMaxV: 3.2, vgsMaxNode: 'mp.gate' }, TH);
  assert.ok(hard[0].note.includes('shorted gate'));
});

test('Failure thresholds: thermal faults trip at verified values (260 °C FR-4, 1085 °C Cu)', () => {
  const delam = evaluateThresholds({ traceTempC: 250, pcbTempC: TH.fr4DelaminationC + 5 }, TH);
  assert.equal(delam[0].type, 'pcb_delamination');
  const fuse = evaluateThresholds({ traceTempC: TH.cuMeltingC + 2, pcbTempC: 30 }, TH);
  assert.equal(fuse[0].type, 'trace_fusing');
  const runaway = evaluateThresholds({ traceTempC: 250, pcbTempC: 200, junctionTempC: TH.siThermalRunawayC + 10 }, TH);
  assert.equal(runaway[0].type, 'si_thermal_runaway');
});

test('Failure thresholds: cryo quench trips above exactly 12 mW (06 JSON)', () => {
  const atLimit = evaluateThresholds({ driveLoadW: TH.cryoQuench15mkW }, TH);
  assert.equal(atLimit.length, 0, 'exactly at capacity must not trip (condition is strict >)');
  const over = evaluateThresholds({ driveLoadW: TH.cryoQuench15mkW + 1e-6 }, TH);
  assert.equal(over.length, 1);
  assert.equal(over[0].type, 'cryo_quench');
});

test('Blackbody ramp matches the verified Planck/CIE stops', () => {
  assert.deepEqual(tempToRGB(300), [0, 0, 0]);
  assert.deepEqual(tempToRGB(750), [153, 0, 0]);
  assert.deepEqual(tempToRGB(1000), [255, 40, 0]);
  assert.deepEqual(tempToRGB(2500), [255, 225, 155]);
  const mid = tempToRGB(875); // halfway 750 → 1000
  assert.ok(Math.abs(mid[0] - 204) <= 1, `875 K red ≈ 204, got ${mid[0]}`);
});

test('Ring buffer keeps the 100 ms forensic window', () => {
  const rb = new RingBuffer(32);
  for (let i = 0; i < 100; i++) rb.push({ t: i * 1 / 240, vdd: i });
  assert.equal(rb.length, 32);
  const win = rb.windowLast(100);
  assert.ok(win.length <= 25, `100 ms @ 240 Hz = 24 samples + tolerance, got ${win.length}`);
  const newest = win[win.length - 1];
  assert.equal(newest.vdd, 99);
});

test('Forensic report: JSON structure + Markdown export carry the physics', () => {
  const event = evaluateThresholds({ vgsMaxV: 2.1, vgsMaxNode: 'mp.gate' }, TH)[0];
  const samples = [];
  for (let i = 0; i < 24; i++) {
    samples.push({
      t: i / 240,
      vdd: 1.8 + i * 0.02,
      vgsMax: 1.8 + i * 0.02,
      iMax: 0.001 * i,
      tempMaxC: 27 + i * 0.5,
      nodes: { vout_q4: 1.8, vout_bin: 1.8 },
      currents: { VDD: 0.001 * i },
      temps: { traceC: 27 + i * 0.5, pcbC: 25 },
    });
  }
  const report = buildForensicReport({
    event,
    samples,
    thresholds: { vgs_threshold_v: TH.vgsThresholdV, gamma_dec_per_v: TH.gammaDecPerV },
    meta: { datasetSha256: 'abc123', simTimeS: 0.1, playbackScale: 1 },
  });
  assert.equal(report.format, 'invention-lab/forensic-autopsy/1');
  assert.equal(report.failure.type, 'gate_oxide_breakdown');
  assert.ok(report.peaks.vgsV >= 2.1);
  assert.equal(report.oscilloscope.length, 24);
  const md = reportToMarkdown(report);
  assert.ok(md.includes('# Forensic Autopsy Report'));
  assert.ok(md.includes('TDDB'));
  assert.ok(md.includes('simulation evidence only, not physical validation'));
  assert.ok(md.includes('abc123'));
});

test('AI Fix & Re-Test proposals are physics-valid and cite their source', () => {
  const oxide = proposeFix({ type: 'gate_oxide_breakdown', value: 2.4, threshold: 1.95 }, { vddNominalV: 1.8 });
  assert.equal(oxide.patch.vddMaxV, 1.8);
  assert.ok(oxide.source.includes('nominal_vdd_v'));
  const fuse = proposeFix({ type: 'trace_fusing', value: 1100, threshold: 1085 }, {});
  assert.equal(fuse.patch.traceWidthFactor, 2);
  const quench = proposeFix({ type: 'cryo_quench', value: 0.02, threshold: 0.012 }, {});
  assert.equal(quench.patch.drivePowerMaxW, 0.012);
  const delam = proposeFix({ type: 'pcb_delamination', value: 265, threshold: 260 }, {});
  assert.ok(delam.patch.convectionScale >= 2);
});

test('Cryo stage: exact 12 mW equilibrium and quench ramp under overload', () => {
  const stage = createCryoStage({});
  // At exactly the rated load the stage holds 15 mK (dT/dt = 0).
  for (let i = 0; i < 100; i++) stage.step(0.01, 0.012);
  assert.ok(stage.tempK < 0.0162, `T=${stage.tempK}`);
  // 24 mW (2× capacity) → new equilibrium ≈ 49 mK (quadratic dilution curve).
  const stage24 = createCryoStage({});
  for (let i = 0; i < 4000; i++) stage24.step(0.01, 0.024);
  assert.ok(Math.abs(stage24.tempK - 0.049) < 0.006, `24 mW equilibrium ≈ 49 mK, got ${stage24.tempK}`);
  // Gross overload (1 W ≫ 12 mW budget) → monotonic warm-up past Al Tc (1.2 K).
  const stage2 = createCryoStage({});
  let prev = stage2.tempK;
  let crossedTc = false;
  for (let i = 0; i < 2000; i++) {
    stage2.step(0.01, 1.0);
    assert.ok(stage2.tempK >= prev, `quench must warm monotonically under overload (i=${i}: ${prev} → ${stage2.tempK})`);
    prev = stage2.tempK;
    if (stage2.tempK > 1.2) crossedTc = true;
  }
  assert.ok(crossedTc, 'overload must push past the 1.2 K superconducting transition');
  // With load removed the 4 K stage recovers the chamber.
  const stage3 = createCryoStage({ initialK: 1.5 });
  for (let i = 0; i < 100; i++) stage3.step(0.01, 0);
  assert.ok(stage3.tempK < 1.5, 'cooling must recover once load is removed');
});
