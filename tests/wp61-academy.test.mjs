import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createNetlist, solveDC, evaluateThresholds, buildForensicReport, proposeFix } from '../packages/physics-engine/src/index.mjs';
import { systolicMatmul, compareArchitectures } from '../packages/chip-engine/src/accelerators.mjs';
import { TransmonDevice } from '../packages/quantum-engine/src/devices.mjs';
import { OPS } from '../packages/quantum-engine/src/lindblad.mjs';
import { surfaceCodeLogicalErrorRate, bitFlipLogicalErrorRate } from '../packages/quantum-engine/src/stabilizer.mjs';

const read = async (path) => readFile(new URL(path, import.meta.url));
const grader = await read('../apps/electrophysics-3d/src/academy/missionGrader.ts');
const { verifyCurriculum, gradeMission } = await import('data:text/javascript;base64,' + grader.toString('base64'));
const path = '../data/curriculum/';
const raw = await read(path + '01_academy_missions.json');
const manifest = await read(path + 'MANIFEST.json');
const approved = await verifyCurriculum(raw, manifest);
const PHYSICS = 'SIMULATED_PHYSICS_MODEL';
const ARCHITECTURE = 'SIMULATED_ARCHITECTURAL_MODEL';
const QUANTUM = 'SIMULATED_NOISY_QUANTUM';

test('WP-6.1 checks the trusted manifest and exact curriculum bytes before grading', async () => {
  assert.equal(approved.missions.length, 11);
  assert.equal(approved.seal, JSON.parse(manifest).files[0].sha256);
  assert.ok(Object.isFrozen(approved.missions[0].pass_criteria));
  const changed = Buffer.from(raw);
  changed[changed.indexOf('Transistor IV Curves')] ^= 1;
  await assert.rejects(verifyCurriculum(changed, manifest), /curriculum SHA-256/);
  const alteredManifest = Buffer.from(manifest);
  alteredManifest[alteredManifest.indexOf('c1c9d')] ^= 1;
  await assert.rejects(verifyCurriculum(raw, alteredManifest), /manifest SHA-256/);
  await assert.rejects(verifyCurriculum(Buffer.concat([raw, Buffer.from('\n')]), manifest), /byte length/);
  assert.throws(() => gradeMission(structuredClone(approved), approved.missions[0].id, {}), /not been SHA-256 verified/);
});

function bias(vgsV) {
  const n = createNetlist(['gnd', 'g', 'd']);
  n.addVSource({ a: 'g', b: 'gnd', V: vgsV, label: 'gate' });
  n.addVSource({ a: 'd', b: 'gnd', V: 1.8, label: 'drain' });
  n.addMosfet({ type: 'n', g: 'g', d: 'd', s: 'gnd', vth: 0.55, kp: 0.004, lambda: 0.06, label: 'M' });
  const result = solveDC(n);
  assert.equal(result.converged, true);
  return { idA: Math.abs(result.deviceCurrents.M), vgsV: result.nodeVoltages[1], vdsV: result.nodeVoltages[2] };
}

const thresholds = {
  vgsThresholdV: 1.95, gammaDecPerV: 300, hardBreakdownV: 3,
  cuMeltingC: 1085, siThermalRunawayC: 200, cryoQuench15mkW: 0.012,
};
function report(snapshot) {
  const [event] = evaluateThresholds(snapshot, thresholds);
  return event ? buildForensicReport({ event, samples: [], thresholds }).failure : null;
}

const oxide = { vgsMaxV: 2.5 };
const [trip] = evaluateThresholds(oxide, thresholds);
const maxVdd = proposeFix(trip, { vddNominalV: 1.8 }).patch.vddMaxV;
const a = Array.from({ length: 32 }, (_, i) => Array.from({ length: 32 }, (_, k) => (i + k) % 32 - 15));
const b = Array.from({ length: 32 }, (_, k) => Array.from({ length: 32 }, (_, j) => (k - j) % 32));
const gemm = systolicMatmul(a, b, { gridSize: 8 });
const mem = compareArchitectures({ M: 1, N: 4096, K: 4096 });
const longitudinal = new TransmonDevice({ nQubits: 1, t1Us: 100, t2Us: 150 });
const transverse = new TransmonDevice({ nQubits: 1, t1Us: 100, t2Us: 150 });
longitudinal.applyIdeal(OPS.X, 0).idle(100);
transverse.applyIdeal(OPS.H, 0).idle(150);
const seed = 20241120;
const sample = () => Array.from({ length: 8 }, (_, i) => {
  const p = (i + 1) / 100;
  return { p, logical: surfaceCodeLogicalErrorRate(600, p, seed + i),
    bitflip: bitFlipLogicalErrorRate(600, p, seed + 100 + i) };
});

const fixtures = [
  [{ badge: PHYSICS, high: bias(1.8), low: bias(0.6), lambda: 0.06 },
    [(t) => { t.high.idA *= 0.8; }, (t) => { t.low.idA = t.high.idA * 0.01; }], 'lambda'],
  [{ badge: PHYSICS, failure: report(oxide), retest: { maxVdd, vdd: maxVdd, ticks: 1, trips: 0 } },
    [(t) => { t.failure.value = 1.95; }, (t) => { t.failure.governingEquation = 'Wrong equation'; },
      (t) => { t.retest.trips = 1; }], 'retest'],
  [{ badge: PHYSICS, failure: report({ traceTempC: 1085 }) },
    [(t) => { t.failure.value = 1084.99; }, (t) => { t.failure.governingEquation = 'P = I²·R(T)'; }], 'failure'],
  [{ badge: PHYSICS, levels: [0, 0.6, 1.2, 1.8].map((inputV, i) =>
    ({ inputV, outputV: 0.6 * (3 - i), marginV: 0.3 })) },
    [(t) => { t.levels[1].outputV -= 0.31; }, (t) => { t.levels[2].marginV = 0.29; }], 'levels'],
  [{ badge: PHYSICS, arcDelayNs: [0.050, 0.055], internalDelayNs: [0.050, 0.056],
    cycleEnergyJ: [30e-15], internalEnergyJ: [31e-15], sealVerified: true, replayedLogic: [1, 0], internalLogic: [1, 0] },
    [(t) => { t.arcDelayNs[0] = 0.053; }, (t) => { t.replayedLogic[1] = 1; }], 'internalEnergyJ'],
  [{ badge: ARCHITECTURE, a, b, c: gemm.C, grid: 8, cycles: gemm.cycles,
    activity: new Array(64).fill(0.5), colors: new Array(64).fill(0.25), idleColors: new Array(64).fill(0) },
    [(t) => { t.c[23][7]++; }, (t) => { t.cycles++; }, (t) => { t.colors = t.idleColors; }], 'activity'],
  [{ badge: ARCHITECTURE, resultBadge: mem.badge, unifiedCycles: mem.unifiedInt8.totalCycles,
    discreteCycles: mem.discreteInt8.totalCycles, q4Bytes: mem.unifiedQ4.bytesOnBus, int8Bytes: mem.unifiedInt8.bytesOnBus },
    [(t) => { t.unifiedCycles = t.discreteCycles; }, (t) => { t.q4Bytes = t.int8Bytes; },
      (t) => { t.resultBadge = PHYSICS; }], 'unifiedCycles'],
  [{ badge: ARCHITECTURE, failure: report({ traceTempC: 0, junctionTempC: 200 }),
    controller: [{ tempC: 126, beforeMHz: 700, afterMHz: 630 }] },
    [(t) => { t.failure.value = 199.99; }, (t) => { t.controller[0].tempC = 125; }], 'controller'],
  [{ badge: QUANTUM, populationAtUs: 100, coherenceAtUs: 150, population: longitudinal.sim.rho.re[3],
    coherence: Math.hypot(transverse.sim.rho.re[1], transverse.sim.rho.im[1]) },
    [(t) => { t.population += 0.03; }, (t) => { t.coherence += 0.03; }], 'population'],
  [{ badge: QUANTUM, failure: report({ driveLoadW: 0.6 }), initialK: 0.015, peakK: 1.4,
    blochBefore: [1,1,1], blochAfter: [0,0,0] },
    [(t) => { t.failure.value = 0.012; }, (t) => { t.peakK = 1.2; }], 'peakK'],
  [{ badge: QUANTUM, seed, repeatSeed: seed, sweep: sample(), replay: sample() },
    [(t) => { t.sweep[4].logical = t.replay[4].logical = 0.05; },
      (t) => { t.replay[6].logical = (t.replay[6].logical + 0.01) % 1; }], 'seed'],
];

for (const [i, mission] of approved.missions.entries()) {
  const [evidence, failures, key] = fixtures[i];
  test(mission.id + ' checks the exact sealed rubric against passing, failing and incomplete physics', () => {
    const verdict = gradeMission(approved, mission.id, evidence);
    assert.equal(verdict.status, 'pass', JSON.stringify(verdict));
    assert.match(verdict.badge, /^SIMULATED_/);
    assert.deepEqual(verdict.results.map((r) => r.condition), mission.pass_criteria.map((r) => r.condition));
    assert.equal(failures.length, mission.pass_criteria.length);
    for (const [j, mutate] of failures.entries()) {
      const changed = structuredClone(evidence);
      mutate(changed);
      const failed = gradeMission(approved, mission.id, changed);
      assert.equal(failed.status, 'fail', JSON.stringify(failed));
      assert.equal(failed.results[j].status, 'fail', JSON.stringify(failed));
    }
    for (const invalid of [undefined, NaN]) {
      const refused = gradeMission(approved, mission.id, { ...evidence, [key]: invalid });
      assert.equal(refused.status, 'refused');
      assert.match(refused.badge, /^SIMULATED_/);
      assert.match(refused.results.find((r) => r.status === 'refused').reason, /Missing|non-finite/);
    }
  });
}

test('WP-6.1 refuses a mismatched badge and separately checks custom IC dynamic power', () => {
  const mission = approved.missions[4];
  const [evidence] = fixtures[4];
  assert.equal(gradeMission(approved, mission.id, { ...evidence, badge: ARCHITECTURE }).status, 'refused');
  const badPower = gradeMission(approved, mission.id, { ...evidence, cycleEnergyJ: [60e-15] });
  assert.equal(badPower.status, 'fail');
  assert.equal(badPower.results[0].status, 'fail');
  assert.equal(badPower.results[1].status, 'pass');
});


test('WP-6.1 refuses sparse evidence instead of grading empty slots', () => {
  assert.equal(gradeMission(approved, approved.missions[3].id,
    { ...fixtures[3][0], levels: new Array(4) }).status, 'refused');
  assert.equal(gradeMission(approved, approved.missions[5].id,
    { ...fixtures[5][0], c: new Array(32) }).status, 'refused');
});
