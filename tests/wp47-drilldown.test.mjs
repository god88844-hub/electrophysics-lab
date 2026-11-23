import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createNetlist, solveDC, SANDBOX_COMPONENT_TYPES } from '../packages/physics-engine/src/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * WP-4.7 — tile drill-down unit tests: the Layer-1 electro-thermal stress
 * module (`apps/electrophysics-3d/src/bays/soc/tileDrilldown.ts`) is pure
 * (NO imports, constants INJECTED) and is exercised here against the SAME
 * sealed `data/reference-library/{01,02,05,06}` bytes the browser verifies
 * via SHA-256 — the exact constants `InspectorPanels` feeds it through
 * `REFERENCE` (Builder Rule 5: every profile number traces to a sealed
 * payload, a 03 §1.5/§3 equation, or a documented declared parameter).
 *
 * Physics gates enforced here (03 §1.5 / §3 + PHASE_04 WP-4.7):
 *  - SKY130 core SOA ceiling 1.95 V (`02 → core_soa_max_vgs_v`) with the
 *    E-model TDDB relative stress factor (γ = 300 dec/V, `06`).
 *  - DVFS throttle 125 °C (`05` envelope) / Si thermal runaway 200 °C (`06`).
 *  - Black's electromigration current-density ratio vs the tile's
 *    05-anchored idle operating point, MTTF ∝ J^(−2)·exp(Ea/kB·T).
 *  - Subthreshold leakage I ∝ exp(−Eg/(2kB·T)) — the "doubles every ≈10 °C"
 *    signature asserted numerically.
 *  - Fail-closed: non-finite telemetry refused (never a fabricated profile).
 *  - `SIMULATED_PHYSICS_MODEL` badge on every profile.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const DRILLDOWN_TS = path.join(root, 'apps', 'electrophysics-3d', 'src', 'bays', 'soc', 'tileDrilldown.ts');
const source = readFileSync(DRILLDOWN_TS, 'utf8');

assert.ok(!/^\s*import\s/m.test(source), 'tileDrilldown.ts must remain import-free (pure constants-injected module) for the Node CI unit-test path');
assert.ok(!/\bdocument\.|\bwindow\.|from 'three'|require\(/.test(source), 'tileDrilldown.ts must stay DOM/three-free (pure Node-testable stress physics)');

// The implementation runs unchanged on the Node 20/22/24 CI matrix.
const js = source.replace(/\/\* types:begin \*\/[\s\S]*?\/\* types:end \*\//, '');
const dd = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const {
  computeTileStress,
  constantsFromReference,
  representativeCellFor,
  DRILLDOWN_BADGE,
  EM_EA_EV,
  EM_N,
  solveRepresentativeCell,
  EM_STRESS_MTTF_RATIO,
} = dd;

// ---- The sealed payloads, byte-exact from disk (same files the browser
// SHA-256-verifies against MANIFEST.json) ----
function sealed(name) {
  const directory = path.join(root, 'data', 'reference-library');
  const bytes = readFileSync(path.join(directory, name));
  const record = JSON.parse(readFileSync(path.join(directory, 'MANIFEST.json'))).files.find((entry) => entry.file === name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, name);
  return JSON.parse(bytes);
}
const semiconductor = sealed('02_semiconductor_pdk_silicon.json');
const architecture = sealed('05_chip_architecture_benchmarks.json');
const failures = sealed('06_failure_physics_thresholds.json');
const constants = sealed('01_fundamental_constants.json');

const C = constantsFromReference({ semiconductor, architecture, failures, constants });

test('WP-4.7: constants derive exactly from the sealed 01/02/05/06 payloads', () => {
  const sky = semiconductor.parameters.sky130a;
  assert.equal(C.nominalVddV, sky.nominal_vdd_v, '02 nominal Vdd = 1.8 V');
  assert.equal(C.nominalVddV, 1.8);
  assert.equal(C.soaMaxVgsV, sky.core_soa_max_vgs_v, '02 core SOA ceiling');
  assert.equal(C.soaMaxVgsV, 1.95);
  assert.equal(C.gateOxideNm, sky.oxide_thickness_nm.gate_oxide, '02 gate oxide 4.1 nm');
  assert.equal(C.gateOxideNm, 4.1);
  assert.equal(C.tddbGammaDecPerV, failures.failure_thresholds.gate_oxide_tddb.gamma_dec_per_v, '06 E-model γ');
  assert.equal(C.tddbGammaDecPerV, 300);
  assert.equal(C.throttleThresholdC, architecture.valid_operating_envelope.riscv_rv32im.temp_range_c[1], '05 DVFS envelope max');
  assert.equal(C.throttleThresholdC, 125);
  assert.equal(C.runawayThresholdC, failures.failure_thresholds.si_thermal_runaway_c, '06 Si runaway');
  assert.equal(C.runawayThresholdC, 200);
  assert.equal(C.vthNmosV, sky.vth_nmos_typ_v, '02 NMOS Vth 0.55 V');
  assert.equal(C.vthNmosV, 0.55);
  // kB in eV/K — derived ONLY from the sealed 01 constants.
  const kbEv = C.kBjPerK / C.elementaryChargeC;
  assert.equal(C.kBjPerK, constants.parameters.boltzmann_constant.value, '01 k_B J/K');
  assert.equal(C.elementaryChargeC, constants.parameters.elementary_charge.value, '01 elementary charge C');
  assert.ok(Math.abs(kbEv - 8.617333262e-5) < 1e-12, `kB/e = ${kbEv} eV/K (CODATA exact)`);
});

test('WP-4.7: declared model parameters stay at their documented values', () => {
  assert.equal(EM_EA_EV, 0.7, "03 §1.5 Black's Ea ≈ 0.7 eV");
  assert.equal(EM_N, 2, "03 §1.5 Black's n ≈ 2");
  assert.equal(C.siliconBandgapEv, semiconductor.material_properties.silicon.bandgap_ev_at_300K);
  assert.equal(EM_STRESS_MTTF_RATIO, 0.5, 'em-stressed verdict threshold');
});

test('WP-4.7: representative cell mapping covers all tile kinds with verified cad-spec-01 cells', () => {
  const spec = JSON.parse(readFileSync(path.join(root, 'data', 'cad-specs', '01_sky130_primitives_geometry.json'), 'utf8'));
  const verified = new Set(spec.verified_cells.cells.map((c) => c.name));
  assert.deepEqual([...verified].sort(), ['q4_half_adder', 'q4_inv', 'q4_mux4', 'q4_thresh_det']);
  const mapping = [
    ['cpu', representativeCellFor('cpu')],
    ['tpu', representativeCellFor('tpu')],
    ['gpu', representativeCellFor('gpu')],
    ['mem', representativeCellFor('mem')],
    ['npu', representativeCellFor('npu')],
  ];
  for (const [kind, cell] of mapping) {
    assert.ok(verified.has(cell.cell), `${kind} maps to VERIFIED cell ${cell.cell}`);
    assert.ok(cell.device.length > 0 && cell.role.length > 0);
  }
  // 64 TPU MAC tiles resolve to their die kind.
  assert.equal(representativeCellFor('tpu-tile-2-3').cell, representativeCellFor('tpu').cell);
  // Unknown tiles refused fail-closed.
  assert.throws(() => representativeCellFor('dsp'), /unknown tile id/);
});

const NOMINAL = {
  tileId: 'cpu',
  tileName: 'CPU Cluster (RV32IM ×8)',
  powerW: 0.12,
  junctionTempC: 45,
  vddV: 1.8,
  activity: 1,
  idlePowerW: 0.12,
};

test('WP-4.7: nominal operating point — inside SOA, no TDDB acceleration, no throttle', () => {
  const p = computeTileStress(NOMINAL, C);
  assert.equal(p.badge, 'SIMULATED_PHYSICS_MODEL');
  assert.equal(p.verdict, 'nominal');
  assert.equal(p.vgsV, 1.8, 'V_gs = full supply (rail-to-rail gate swing)');
  assert.ok(Math.abs(p.soaMarginV - 0.15) < 1e-12, `SOA margin = ${p.soaMarginV} V`);
  assert.equal(p.tddbDecadesPastSoa, 0, 'no decades past the SOA ceiling');
  assert.equal(p.tddbRelativeStress, 1, 'relative TDDB stress = 1 within SOA');
  assert.equal(p.ttfRatioVsNominal, 1, 'nominal supply → unit lifetime');
  assert.equal(p.tddbBreach, false);
  assert.ok(Math.abs(p.throttleMarginC - 80) < 1e-12, '125 − 45 = 80 °C throttle margin');
  assert.ok(Math.abs(p.runawayMarginC - 155) < 1e-12, '200 − 45 = 155 °C runaway margin');
  assert.equal(p.dvfsAction, 'none');
  // EM: at the idle operating point the ratio is exactly 1 (geometry-free).
  assert.ok(Math.abs(p.emJRatio - 1) < 1e-12, `em J ratio = ${p.emJRatio} at idle`);
  assert.ok(Math.abs(p.railCurrentA - 0.12 / 1.8) < 1e-15, 'I = P/V');
  // MTTF = J^−2 exactly (the Arrhenius factor cancels — the idle operating
  // point runs at the SAME die-zone temperature); the absolute thermal
  // acceleration vs 300 K is reported separately.
  assert.ok(Math.abs(p.emMttfRatioVsReference - 1) < 1e-12, 'MTTF = 1 at the idle operating point');
  const kbEv = C.kBjPerK / C.elementaryChargeC;
  const leak = Math.exp((-1.12 / (2 * kbEv)) * (1 / 318.15 - 1 / 300));
  assert.ok(Math.abs(p.leakageRatioVs300K - leak) < 1e-12, 'leakage = exp(−Eg/2kB·(1/T − 1/300K))');
  // 318 K is HOTTER than 300 K → leakage ratio > 1.
  assert.ok(p.leakageRatioVs300K > 1, '318 K hotter than 300 K → more leakage');
  assert.ok(p.notes.length >= 5, 'every mechanism explained');
  assert.ok(Object.keys(p.sources).length >= 13, 'every constant traced (Law 5)');
});

test('WP-4.7: SOA breach at V_gs > 1.95 V — E-model relative stress factor in exact decades', () => {
  const p = computeTileStress({ ...NOMINAL, vddV: 2.0 }, C);
  assert.ok(Math.abs(p.soaMarginV - (-0.05)) < 1e-12, 'SOA margin −0.05 V');
  assert.ok(Math.abs(p.tddbDecadesPastSoa - 300 * 0.05) < 1e-9, 'γ·ΔV = 15 decades past SOA');
  assert.equal(p.tddbBreach, true);
  assert.equal(p.verdict, 'soa-breach', 'SOA breach outranks thermal throttle');
  assert.equal(p.dvfsAction, 'none', '45 °C → no thermal action');
  // Relative TTF vs nominal: 10^(−γ·(2.0 − 1.8)) = 10^−60 decades.
  assert.ok(
    Math.abs(Math.log10(p.ttfRatioVsNominal) + 60) < 1e-9,
    'lifetime ratio 10^−60 decades (E-model, f64-exact in the exponent)'
  );
  assert.ok(p.tddbRelativeStress > 1e14, 'relative stress factor > 10^15-ish past the ceiling');
});

test('WP-4.7: DVFS throttle at T_j > 125 °C, Si thermal runaway at ≥ 200 °C', () => {
  assert.equal(computeTileStress({ ...NOMINAL, junctionTempC: 125 }, C).dvfsAction, 'none');
  assert.equal(computeTileStress({ ...NOMINAL, junctionTempC: 200 }, C).verdict, 'runaway');
  const hot = computeTileStress({ ...NOMINAL, junctionTempC: 130 }, C);
  assert.equal(hot.verdict, 'throttle');
  assert.equal(hot.dvfsAction, 'throttle');
  assert.ok(Math.abs(hot.throttleMarginC - (-5)) < 1e-12, '5 °C PAST the throttle threshold');
  assert.ok(hot.runawayMarginC === 70, '200 − 130 = 70 °C to runaway');

  const runaway = computeTileStress({ ...NOMINAL, junctionTempC: 205 }, C);
  assert.equal(runaway.verdict, 'runaway', 'runaway outranks everything');
  assert.equal(runaway.dvfsAction, 'halt');
  assert.ok(runaway.runawayMarginC === -5, '5 °C past the 200 °C alarm');
  // Leakage roughly doubles per +10 °C near 300 K — the 03 §1.5 signature.
  const r300 = computeTileStress({ ...NOMINAL, junctionTempC: 26.85 }, C).leakageRatioVs300K; // ≈ 300 K
  const r310 = computeTileStress({ ...NOMINAL, junctionTempC: 36.85 }, C).leakageRatioVs300K;
  const per10 = r310 / r300;
  assert.ok(per10 > 1.8 && per10 < 2.4, `leakage ×${per10.toFixed(2)} per +10 °C (≈2 — 03 §1.5)`);
});

test("WP-4.7: Black's EM — the current-density ratio is geometry-free vs the 05-anchored idle", () => {
  // 6× the idle power at the nominal supply → J ratio exactly 6.
  const loaded = computeTileStress({ ...NOMINAL, powerW: 0.72, junctionTempC: 45 }, C);
  assert.ok(Math.abs(loaded.emJRatio - 6) < 1e-12, `J ratio = ${loaded.emJRatio}`);
  // MTTF ∝ J^(−2) → exactly 1/36 (same-temperature Arrhenius cancels).
  assert.ok(Math.abs(loaded.emMttfRatioVsReference - 1 / 36) < 1e-12, 'MTTF = J^−2 = 1/36');
  assert.equal(loaded.verdict, 'em-stressed', 'EM lifetime 36× worse than idle → em-stressed');

  // Voltage also feeds the ratio: same power at a higher Vdd draws less
  // current → the EM ratio scales as V_nominal/V_dd.
  const highV = computeTileStress({ ...NOMINAL, powerW: 0.72, vddV: 1.8 * 2 }, C);
  assert.ok(Math.abs(highV.emJRatio - 3) < 1e-12, 'P constant, V doubled → J ratio halves');

  // Over-VDD SOA breach still outranks EM in the verdict ladder.
  const breach = computeTileStress({ ...NOMINAL, powerW: 0.72, vddV: 2.0 }, C);
  assert.equal(breach.verdict, 'soa-breach');
});

test('WP-4.7: TPU MAC tiles drill into the TPU die zone with their own activity share', () => {
  const p = computeTileStress(
    {
      tileId: 'tpu-tile-2-3',
      tileName: 'TPU MAC tile (r2, c3)',
      powerW: 4.2,
      junctionTempC: 61.5,
      vddV: 1.8,
      activity: 0.75,
      idlePowerW: 6,
    },
    C
  );
  assert.equal(p.badge, 'SIMULATED_PHYSICS_MODEL');
  assert.equal(p.representative.cell, 'q4_half_adder', 'MAC tile → the verified half-adder cell');
  assert.ok(Math.abs(p.emJRatio - (4.2 / 6)) < 1e-12, 'J ratio = (P/V)/(P_idle/V_nom) = P/P_idle at equal V');
  assert.ok(p.emMttfRatioVsReference > 1, 'under-idle current → EM life longer than idle reference');
  assert.equal(p.verdict, 'nominal', '61.5 °C, in-SOA V_gs, under-idle current → nominal');
  assert.ok(p.notes.some((note) => note.includes('resolved for the TPU die zone')));
});

test('WP-4.7: fail-closed — non-finite or negative telemetry refused, never fabricated', () => {
  for (const bad of [
    { ...NOMINAL, powerW: NaN },
    { ...NOMINAL, junctionTempC: Infinity },
    { ...NOMINAL, vddV: NaN },
    { ...NOMINAL, activity: -1 },
    { ...NOMINAL, powerW: -5 },
    { ...NOMINAL, idlePowerW: 0 }, // EM ratio needs a sealed reference point
    { ...NOMINAL, idlePowerW: NaN },
  ]) {
    assert.throws(() => computeTileStress(bad, C), /refus|not finite|positive finite/, `${JSON.stringify(bad)} refused`);
  }
  // Non-finite constants refused too.
  assert.throws(
    () => computeTileStress(NOMINAL, { ...C, tddbGammaDecPerV: NaN }),
    /constants are not finite/
  );
  assert.throws(() => computeTileStress({ ...NOMINAL, vddV: 0 }, C), /outside model domain/);
});

test('WP-4.7: every profile number traces to its sealed source (Law 5 audit trail)', () => {
  const p = computeTileStress(NOMINAL, C);
  for (const [key, note] of Object.entries(p.sources)) {
    assert.match(note, /(data\/reference-library\/|03_PHYSICS_MATH_FUNDAMENTALS|DECLARED|idle power model)/, `${key} traces to a sealed payload, the master-plan equation, or a declared parameter`);
  }
  assert.equal(p.sources.soaMaxVgsV.includes('02_semiconductor_pdk_silicon.json'), true);
  assert.equal(p.sources.tddbGammaDecPerV.includes('06_failure_physics_thresholds.json'), true);
  assert.equal(p.sources.throttleThresholdC.includes('05_chip_architecture_benchmarks.json'), true);
  assert.equal(p.sources.kBjPerK.includes('01_fundamental_constants.json'), true);
});


test('WP-4.7: representative MNA load preserves the live operating point and obeys KCL', () => {
  const { kp, lambda } = SANDBOX_COMPONENT_TYPES.find((type) => type.kind === 'nmos').defaults;
  const resistanceOhm = SANDBOX_COMPONENT_TYPES.find((type) => type.kind === 'resistor').defaults.R;
  const bench = { kp, lambda, resistanceOhm };
  const sample = { ...NOMINAL, junctionTempC: 125, powerW: 0.36 };
  const point = solveRepresentativeCell(sample, C, bench, createNetlist, solveDC);
  assert.equal(point.cell, 'q4_inv');
  assert.equal(point.vddV, sample.vddV);
  assert.equal(point.junctionTempC, sample.junctionTempC);
  assert.equal(point.zonePowerW, sample.powerW);
  assert.ok(Math.abs(point.loadOhm - resistanceOhm * (1 + C.copperTcr * 98.15) / 3) < 1e-8);
  assert.ok(point.drainV > 0 && point.drainV < point.vddV);
  assert.ok(point.drainCurrentA > 0);
  assert.ok(Math.abs((point.vddV - point.drainV) / point.loadOhm - point.drainCurrentA) < 1e-9);
  assert.ok(Math.abs(point.devicePowerW - point.drainV * point.drainCurrentA) < 1e-12);
  const idle = solveRepresentativeCell(NOMINAL, C, bench, createNetlist, solveDC);
  assert.ok(point.drainCurrentA > idle.drainCurrentA);
  const unloaded = solveRepresentativeCell({ ...NOMINAL, powerW: 0 }, C, bench, createNetlist, solveDC);
  assert.equal(unloaded.loadOhm, null);
  assert.ok(Math.abs(unloaded.drainCurrentA) < 1e-9, "open load current remains within the MNA residual tolerance");
});
