// @ts-nocheck
// Runtime syntax stays JavaScript-compatible for the Node 20 unit suite.
/* types:begin */
export interface TileTelemetry {
  /** `'cpu' | 'tpu' | 'gpu' | 'mem' | 'npu' | 'tpu-tile-<row>-<col>'`. */
  tileId: string;
  /** Human label (tile name / MAC-tile coordinates). */
  tileName: string;
  /** Live tile power draw (W) — `SocTile.powerW`. */
  powerW: number;
  /** Local Fourier-solver tile-zone temperature (°C) — `SocTile.tempC`. */
  junctionTempC: number;
  /** Live supply voltage (V) — the physics state `vdd`. */
  vddV: number;
  /** Live switching activity 0..1 (TPU MAC tiles: executed-workload share). */
  activity: number | null;
  /** The tile's 05-JSON-derived idle power model (W) — the EM ratio's
   * sealed reference operating point (`SocTile.idlePowerW`). */
  idlePowerW: number;
}

export interface CellOperatingPoint {
  tileId: string;
  cell: string;
  vddV: number;
  junctionTempC: number;
  zonePowerW: number;
  loadOhm: number | null;
  drainV: number;
  drainCurrentA: number;
  devicePowerW: number;
}
/* types:end */

/**
 * WP-4.7 — Tile drill-down → Layer-1 transistor electro-thermal stress.
 *
 * PURE module: NO imports, every constant INJECTED — Node-testable via the
 * data-URL contract (`tests/wp47-drilldown.test.mjs` reads the sealed
 * `data/reference-library/{01,02,05,06}` payloads byte-exactly from disk and
 * feeds the same constants the browser derives from `REFERENCE`). No three.js,
 * no DOM, no solver state: `computeTileStress(tile, constants)` is a pure
 * function of live solver telemetry × sealed reference constants.
 *
 * What a drill-down computes (Builder Rule 5 — every number traces to a
 * sealed payload, a master-plan equation, or a DECLARED model parameter,
 * never invented):
 *  - `V_gs` = the tile's live supply `V_dd` (static CMOS swings gates
 *    rail-to-rail), checked against the SKY130 core SOA ceiling
 *    `1.95 V` (`02 → core_soa_max_vgs_v`).
 *  - **E-model TDDB relative stress** (`03 §1.5`: `ln(TTF) = ln A − γ·Vgs`,
 *    γ = 300 dec/V from `06 → gate_oxide_tddb.gamma_dec_per_v`): the
 *    acceleration in decades vs the SOA ceiling (`γ·max(0, Vgs − 1.95)`) and
 *    vs the nominal supply (`γ·(Vgs − 1.8)`), plus the relative TTF ratio
 *    `10^(−γ·(Vgs − Vnom))`.
 *  - **Thermal envelope** (`05 → riscv_rv32im.temp_range_c` max 125 °C DVFS
 *    throttle threshold; `06 → si_thermal_runaway_c` 200 °C): margins + the
 *    DVFS recommendation (stepwise throttle / halt).
 *  - **Black's electromigration**: J/J_idle uses the same tile delivery
 *    geometry for both operating points, so only P/V is needed. The
 *    relative lifetime includes the Arrhenius term at the local temperature.
 *  - **Subthreshold leakage** (`03 §1.5`: `I_leak = I₀·exp(−Eg/(2kB·T))`,
 *    Si Eg = 1.12 eV): the ratio vs the 300 K reference — the model's
 *    "doubles every ≈10 °C" signature is asserted in the unit test.
 *
 * Badged `SIMULATED_PHYSICS_MODEL` — this is Layer-1 device physics, NOT an
 * architectural model, and NOT a silicon measurement.
 */
/** Provenance badge of every stress profile this module emits. */
export const DRILLDOWN_BADGE = 'SIMULATED_PHYSICS_MODEL';
/**
 * Declared model parameters (NOT sealed-payload values — documented here and
 * asserted in the unit test to keep them visible; Law 5 forbids invented
 * PRECISION, not declared modelling choices):
 *  - EM_EA_EV = 0.7, EM_N = 2 — Black's activation energy and exponent as
 *    cited by `03_PHYSICS_MATH_FUNDAMENTALS.md` §1.5.
 *  - EM_STRESS_MTTF_RATIO = 0.5 — the relative-MTTF threshold below which the
 *    tile reports `em-stressed` (electromigration lifetime halved vs its own
 *    05-anchored idle operating point).
 *
 * The electromigration current-density RATIO is geometry-free by design:
 * the tile's operating current density relative to ITS OWN 05-JSON-derived
 * idle density, `J/J_idle = (P/V_dd)/(P_idle/V_nominal)` — the unknown rail
 * geometry cancels, so no rail width is invented.
 */
export const EM_EA_EV = 0.7;
export const EM_N = 2;
export const EM_STRESS_MTTF_RATIO = 0.5;
/**
 * Build the drill-down constants from the raw reference payloads. Browser
 * callers pass `REFERENCE.{semiconductor, architecture, failures, constants}`;
 * the Node test passes the SAME JSON parsed from disk bytes.
 */
export function constantsFromReference(ref) {
    const sky = ref.semiconductor.parameters.sky130a;
    const oxide = sky.oxide_thickness_nm;
    const tddb = ref.failures.failure_thresholds.gate_oxide_tddb;
    return {
        nominalVddV: sky.nominal_vdd_v,
        soaMaxVgsV: sky.core_soa_max_vgs_v,
        gateOxideNm: oxide.gate_oxide,
        tddbGammaDecPerV: tddb.gamma_dec_per_v,
        throttleThresholdC: ref.architecture.valid_operating_envelope.riscv_rv32im.temp_range_c[1],
        runawayThresholdC: ref.failures.failure_thresholds.si_thermal_runaway_c,
        vthNmosV: sky.vth_nmos_typ_v,
        siliconBandgapEv: ref.semiconductor.material_properties.silicon.bandgap_ev_at_300K,
        copperTcr: ref.semiconductor.material_properties.copper.tcr_per_k,
        kBjPerK: ref.constants.parameters.boltzmann_constant.value,
        elementaryChargeC: ref.constants.parameters.elementary_charge.value,
    };
}
/**
 * The tile → representative verified cell mapping (all four cad-spec-01
 * verified Q4 primitives — the same cells Bay 2's Silicon CAD renders).
 * The 64 TPU MAC tiles map to their die kind (`tpu`).
 */
export function representativeCellFor(tileId) {
    const kind = tileId.startsWith('tpu-tile-') ? 'tpu' : tileId;
    switch (kind) {
        case 'cpu':
            return {
                cell: 'q4_inv',
                device: 'NMOS pull-down (gate swung to V_dd)',
                role: 'representative RV32IM core logic cell',
            };
        case 'tpu':
            return {
                cell: 'q4_half_adder',
                device: 'sum-path NMOS of the MAC carry-save adder',
                role: 'representative systolic MAC cell',
            };
        case 'gpu':
            return {
                cell: 'q4_mux4',
                device: 'lane-select NMOS tree of the SIMD mux',
                role: 'representative SIMT datapath cell',
            };
        case 'mem':
            return {
                cell: 'q4_thresh_det',
                device: 'sense-path NMOS of the LPDDR5 I/O threshold detector',
                role: 'representative memory-fabric I/O cell',
            };
        case 'npu':
            return {
                cell: 'q4_thresh_det',
                device: 'radix-threshold NMOS of the Q4 digit slicer',
                role: 'representative multi-radix NPU cell',
            };
        default:
            throw new Error(`tileDrilldown: unknown tile id "${tileId}" (known: cpu, tpu, gpu, mem, npu, tpu-tile-<r>-<c>)`);
    }
}
/** Fail-closed telemetry check — a NaN profile is a Lie (Builder Rule 1). */
function requireFinite(tile, field, value) {
    if (!Number.isFinite(value)) {
        throw new Error(`tileDrilldown: ${field} of "${tile.tileId}" is not finite — refusing to fabricate a stress profile`);
    }
    if (field === 'powerW' || field === 'activity') {
        if (value < 0) {
            throw new Error(`tileDrilldown: ${field} of "${tile.tileId}" is negative (${value}) — refusing`);
        }
    }
    return value;
}
/**
 * Compute the Layer-1 electro-thermal stress profile of one tile from live
 * telemetry × sealed constants. Pure — same inputs, same profile, always.
 */
export function computeTileStress(tile, c) {
    const powerW = requireFinite(tile, 'powerW', tile.powerW);
    const junctionTempC = requireFinite(tile, 'junctionTempC', tile.junctionTempC);
    const activity = tile.activity === null ? null : requireFinite(tile, 'activity', tile.activity);
    const vddV = requireFinite(tile, 'vddV', tile.vddV);
    if (vddV <= 0 || junctionTempC <= -273.15 || (activity !== null && activity > 1)) {
        throw new Error('tileDrilldown: supply, temperature or activity outside model domain');
    }
    if (!Number.isFinite(c.nominalVddV) || !Number.isFinite(c.soaMaxVgsV) || !Number.isFinite(c.tddbGammaDecPerV)) {
        throw new Error('tileDrilldown: stress constants are not finite');
    }
    const representative = representativeCellFor(tile.tileId);
    // ---- Gate stress (02 SOA + 06 E-model TDDB) ----------------------------
    // Static CMOS: the representative NMOS gate swings rail-to-rail → the
    // worst-case V_gs is the full supply.
    const vgsV = vddV;
    const soaMarginV = c.soaMaxVgsV - vgsV;
    const overdriveV = Math.max(0, vgsV - c.soaMaxVgsV);
    // E-model: TTF drops by γ decades per volt — the relative stress factor
    // vs the SOA baseline (1 within the ceiling) and the lifetime ratio vs
    // the nominal supply.
    const tddbDecadesPastSoa = c.tddbGammaDecPerV * overdriveV;
    const tddbDecadesVsNominal = c.tddbGammaDecPerV * (vgsV - c.nominalVddV);
    const tddbRelativeStress = Math.pow(10, tddbDecadesPastSoa);
    const ttfRatioVsNominal = Math.pow(10, -tddbDecadesVsNominal);
    const tddbBreach = overdriveV > 0;
    // ---- Thermal envelope (05 DVFS throttle + 06 runaway) ------------------
    const tK = junctionTempC + 273.15;
    const tRefK = 300; // 02 JSON resistivity reference temperature T₀ = 300 K
    const throttleMarginC = c.throttleThresholdC - junctionTempC;
    const runawayMarginC = c.runawayThresholdC - junctionTempC;
    // Subthreshold leakage vs the 300 K reference: I ∝ exp(−Eg/(2kB·T)).
    const kB = c.kBjPerK / c.elementaryChargeC; // eV/K — sealed constants only
    const leakageRatioVs300K = Math.exp((-c.siliconBandgapEv / (2 * kB)) * (1 / tK - 1 / tRefK));
    const dvfsAction = junctionTempC >= c.runawayThresholdC ? 'halt' : junctionTempC > c.throttleThresholdC ? 'throttle' : 'none';
    // ---- Black's electromigration (03 §1.5) --------------------------------
    // Geometry-free current-density RATIO: the tile's operating delivery
    // current density relative to its own 05-JSON-derived idle density —
    // J/J_idle = (P/V_dd)/(P_idle/V_nominal); the unknown rail geometry
    // cancels. Black's MTTF: MTTF ∝ J^(−n)·exp(Ea/(kB·T)). The relative
    // factor vs the tile's IDLE operating point carries the J term only —
    // the Arrhenius factor is IDENTICAL for operating and idle at the same
    // die-zone temperature, so it cancels; the absolute thermal acceleration
    // vs the 300 K reference is reported separately in the notes.
    const railCurrentA = vddV > 0 ? powerW / vddV : 0;
    const idleCurrentA = c.nominalVddV > 0 && tile.idlePowerW > 0
        ? tile.idlePowerW / c.nominalVddV
        : NaN;
    if (!Number.isFinite(idleCurrentA)) {
        throw new Error('tileDrilldown: idlePowerW of "' + tile.tileId + '" is not a positive finite number — the EM ratio has no sealed reference point');
    }
    const emJRatio = idleCurrentA > 0 ? railCurrentA / idleCurrentA : 1;
    const emMttfRatioVsReference = Math.pow(emJRatio, -EM_N);
    // Absolute Arrhenius EM acceleration vs the 300 K reference temperature
    // (informational — the verdict threshold compares equal temperatures).
    const emArrheniusVs300K = Math.exp((EM_EA_EV / kB) * (1 / tK - 1 / tRefK));
    // ---- Verdict (worst mechanism wins) ------------------------------------
    let verdict = 'nominal';
    if (emMttfRatioVsReference < EM_STRESS_MTTF_RATIO && verdictRank(verdict) < verdictRank('em-stressed'))
        verdict = 'em-stressed';
    if (junctionTempC > c.throttleThresholdC && verdictRank(verdict) < verdictRank('throttle'))
        verdict = 'throttle';
    if (tddbBreach && verdictRank(verdict) < verdictRank('soa-breach'))
        verdict = 'soa-breach';
    if (junctionTempC >= c.runawayThresholdC)
        verdict = 'runaway';
    const notes = [
        `V_gs = ${vgsV.toFixed(3)} V (rail-to-rail gate swing on the ${representative.device}) · SOA margin ${soaMarginV >= 0 ? '+' : ''}${soaMarginV.toFixed(3)} V vs ${c.soaMaxVgsV.toFixed(2)} V`,
        tddbBreach
            ? `E-model TDDB: +${tddbDecadesPastSoa.toExponential(2)} decades of stress relative to the SOA ceiling (γ = ${c.tddbGammaDecPerV} dec/V)`
            : `E-model TDDB within SOA: lifetime ×${ttfRatioVsNominal < 1 ? ttfRatioVsNominal.toExponential(2) : ttfRatioVsNominal.toFixed(3)} vs nominal ${c.nominalVddV.toFixed(2)} V (${tddbDecadesVsNominal >= 0 ? '+' : ''}${tddbDecadesVsNominal.toFixed(1)} decades)`,
        `T_j = ${junctionTempC.toFixed(1)} °C · DVFS throttle margin ${throttleMarginC.toFixed(1)} °C (${c.throttleThresholdC} °C) · runaway margin ${runawayMarginC.toFixed(1)} °C (${c.runawayThresholdC} °C)`,
        `Black's EM: tile delivery current I = ${railCurrentA.toExponential(3)} A (${emJRatio.toFixed(2)}× its 05-anchored idle density) · relative MTTF ×${emMttfRatioVsReference.toFixed(3)} (J^(-${EM_N}), Ea = ${EM_EA_EV} eV) · Arrhenius ×${emArrheniusVs300K.toFixed(3)} vs 300 K`,
        `Subthreshold leakage ×${leakageRatioVs300K.toFixed(3)} vs 300 K (Si Eg = ${c.siliconBandgapEv} eV)`,
    ];
    if (tile.tileId.startsWith('tpu-tile-')) {
        notes.push('Power and temperature are resolved for the TPU die zone. MAC activity is the normalized workload output magnitude.');
    }
    return {
        tileId: tile.tileId,
        tileName: tile.tileName,
        badge: DRILLDOWN_BADGE,
        representative,
        vgsV,
        vthNmosV: c.vthNmosV,
        soaMarginV,
        tddbDecadesPastSoa,
        tddbDecadesVsNominal,
        tddbRelativeStress,
        ttfRatioVsNominal,
        tddbBreach,
        throttleMarginC,
        runawayMarginC,
        leakageRatioVs300K,
        dvfsAction,
        railCurrentA,
        emJRatio,
        emMttfRatioVsReference,
        verdict,
        notes,
        sources: {
            nominalVddV: 'data/reference-library/02_semiconductor_pdk_silicon.json → parameters.sky130a.nominal_vdd_v',
            soaMaxVgsV: 'data/reference-library/02_semiconductor_pdk_silicon.json → parameters.sky130a.core_soa_max_vgs_v',
            gateOxideNm: 'data/reference-library/02_semiconductor_pdk_silicon.json → parameters.sky130a.oxide_thickness_nm.gate_oxide',
            vthNmosV: 'data/reference-library/02_semiconductor_pdk_silicon.json → parameters.sky130a.vth_nmos_typ_v',
            tddbGammaDecPerV: 'data/reference-library/06_failure_physics_thresholds.json → failure_thresholds.gate_oxide_tddb.gamma_dec_per_v',
            throttleThresholdC: 'data/reference-library/05_chip_architecture_benchmarks.json → valid_operating_envelope.riscv_rv32im.temp_range_c[1]',
            runawayThresholdC: 'data/reference-library/06_failure_physics_thresholds.json → failure_thresholds.si_thermal_runaway_c',
            kBjPerK: 'data/reference-library/01_fundamental_constants.json → parameters.boltzmann_constant.value',
            elementaryChargeC: 'data/reference-library/01_fundamental_constants.json → parameters.elementary_charge.value',
            emEaEv: 'docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md §1.5 (Black\'s Ea ≈ 0.7 eV)',
            emN: 'docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md §1.5 (Black\'s n ≈ 2)',
            siBandgapEv: 'data/reference-library/02_semiconductor_pdk_silicon.json → material_properties.silicon.bandgap_ev_at_300K',
            emStressMttfRatio: 'DECLARED model parameter (em-stressed verdict threshold) — EM_STRESS_MTTF_RATIO',
            idlePowerW: 'the tile 05-JSON-derived idle power model (bay3Soc SocTile.idlePowerW) — the EM ratio reference point',
        },
    };
}
const VERDICT_RANK = {
    nominal: 0,
    'em-stressed': 1,
    throttle: 2,
    'soa-breach': 3,
    runaway: 4,
};
function verdictRank(v) {
    return VERDICT_RANK[v];
}
/** A representative rail-driven pull-down uses the existing Layer-1 MNA
 * device model. The normalized tile conductance scales the default bench
 * load, with its copper TCR evaluated at the Fourier zone temperature.
 */
export function solveRepresentativeCell(tile, constants, bench, createNetlist, solveDC) {
    const profile = computeTileStress(tile, constants);
    const loadScale = (tile.powerW / tile.idlePowerW) * (constants.nominalVddV / tile.vddV) ** 2;
    const loadOhm = loadScale === 0 ? null
        : bench.resistanceOhm * (1 + constants.copperTcr * (tile.junctionTempC + 273.15 - 300)) / loadScale;
    if (loadOhm !== null && (!Number.isFinite(loadOhm) || loadOhm <= 0)) {
        throw new Error('Representative load is outside the bench model');
    }
    const circuit = createNetlist(['gnd', 'drain', 'gate', 'vdd']);
    circuit.addVSource({ a: 'vdd', b: 'gnd', V: tile.vddV, label: 'VDD' });
    circuit.addVSource({ a: 'gate', b: 'gnd', V: profile.vgsV, label: 'GATE' });
    if (loadOhm !== null)
        circuit.addResistor({ a: 'vdd', b: 'drain', R: loadOhm, label: 'LOAD' });
    circuit.addMosfet({ type: 'n', g: 'gate', d: 'drain', s: 'gnd', vth: constants.vthNmosV, kp: bench.kp, lambda: bench.lambda, label: 'DUT' });
    const solved = solveDC(circuit);
    const drainV = solved.nodeVoltages[1];
    const drainCurrentA = solved.deviceCurrents.DUT;
    const devicePowerW = solved.devicePower.DUT;
    if (!solved.converged || ![drainV, drainCurrentA, devicePowerW].every(Number.isFinite)) {
        throw new Error('Representative transistor solve did not converge');
    }
    return { tileId: tile.tileId, cell: profile.representative.cell, vddV: tile.vddV,
        junctionTempC: tile.junctionTempC, zonePowerW: tile.powerW, loadOhm, drainV, drainCurrentA, devicePowerW };
}
