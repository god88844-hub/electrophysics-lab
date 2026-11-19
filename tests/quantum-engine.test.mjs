import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  DensityMatrix,
  LindbladSim,
  OPS,
  averageGateFidelity,
  TransmonDevice,
  PhotonicDevice,
  NeutralAtomDevice,
  dragPulse,
  runBitFlipCodeTrial,
  bitFlipLogicalErrorRate,
  surfaceCodeLogicalErrorRate,
  spsa,
  nelderMead,
} from '../packages/quantum-engine/src/index.mjs';
import * as stabilizerImport from '../packages/quantum-engine/src/stabilizer.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const quantumJson = JSON.parse(
  readFileSync(path.join(here, '..', 'data', 'reference-library', '04_quantum_hardware_modalities.json'), 'utf8')
);
const TRANSMON = quantumJson.parameters.superconducting_transmon;
const PHOTONIC = quantumJson.parameters.silicon_photonic_soi;
const ATOM = quantumJson.parameters.neutral_atom_rubidium87;

test('Lindblad: trace preservation Tr(ρ)=1 under drives + decoherence', () => {
  const sim = new LindbladSim(2, { t1All: TRANSMON.t1_us.typical, t2All: TRANSMON.t2_us.typical, zzHz: 50e3 });
  sim.rho.applyOp1(0, OPS.H);
  for (let i = 0; i < 200; i++) {
    sim.step(1e-3, [{ qubit: 1, op: OPS.sx }]);
    assert.ok(Math.abs(sim.rho.trace() - 1) < 1e-9, `trace drift at step ${i}: ${sim.rho.trace()}`);
  }
});

test('Lindblad: positivity via Cholesky (ρ = LL†) under drives + decoherence', () => {
  const sim = new LindbladSim(3, { t1All: 50, t2All: 60, zzHz: 100e3 });
  sim.rho.applyOp1(0, OPS.H);
  sim.rho.applyOp1(1, OPS.T);
  for (let i = 0; i < 400; i++) {
    sim.step(2e-3);
    assert.ok(sim.rho.isPositivePSD(1e-9), `positivity violated at step ${i}`);
    assert.ok(Math.abs(sim.rho.trace() - 1) < 1e-9, `trace drift at step ${i}`);
  }
});

test('T1 decay matches the analytic exponential exp(−t/T1)', () => {
  const t1 = TRANSMON.t1_us.typical; // 100 µs
  const sim = new LindbladSim(1, { t1All: t1, t2All: 2 * t1 });
  sim.rho = new DensityMatrix(1, { kind: 'computational', index: 1 }); // |1⟩
  sim.evolve(t1, t1 / 200);
  const pop = sim.rho.population(0);
  const expected = Math.exp(-1); // e^−1
  assert.ok(Math.abs(pop - expected) < 0.02, `p1(t=T1)=${pop.toFixed(4)} vs e^−1=${expected.toFixed(4)}`);
});

test('T2 decay matches the analytic coherence exponential exp(−t/T2)', () => {
  const t2 = TRANSMON.t2_us.typical; // 150 µs
  const sim = new LindbladSim(1, { t1All: 200, t2All: t2 });
  sim.rho.applyOp1(0, OPS.H); // superposition, coherence 0.5
  sim.evolve(t2, t2 / 200);
  const coh = sim.rho.coherence(0);
  const expected = 0.5 * Math.exp(-1);
  assert.ok(Math.abs(coh - expected) < 0.02, `coh(t=T2)=${coh.toFixed(4)} vs 0.5·e^−1=${expected.toFixed(4)}`);
});

test('ZZ crosstalk: coherence between |01⟩ and |11⟩ rotates at the ZZ rate', () => {
  const zzHz = 50e3; // 04 JSON typical
  const sim = new LindbladSim(2, { t1All: 1e6, t2All: 1e6, zzHz });
  // ρ = ½(|01⟩ + |11⟩)(⟨01| + ⟨11|) — indices 1 & 3 (differ in qubit 1's bit)
  const d = 4;
  for (const i of [1, 3]) {
    for (const j of [1, 3]) {
      sim.rho.re[i * d + j] = 0.5;
    }
  }
  sim.evolve(1 / (2 * zzHz), 1e-7); // half period → phase π → sign flip
  const bloch1 = sim.rho.blochVector(1);
  assert.ok(bloch1.x < -0.9, `qubit-1 ⟨σx⟩ after half ZZ period = ${bloch1.x.toFixed(3)} (expect ≈ −1)`);
});

test('Calibrated DRAG π-pulse reaches |1⟩ under real transmon noise (04 JSON params)', () => {
  const dev = new TransmonDevice({
    nQubits: 1,
    t1Us: TRANSMON.t1_us.typical,
    t2Us: TRANSMON.t2_us.typical,
    zzKhz: 0,
    readoutFidelity: TRANSMON.readout_fidelity.typical,
    seed: 7,
  });
  // Ω ≈ 25 MHz for 25 ns → θ = 2π·25e6·25e-9 ≈ π
  const pulse = { qubit: 0, amplitude: 25, sigmaNs: 7.5, durationNs: TRANSMON.gate_1q_duration_ns.typical, beta: 0.4 };
  dev.reset().runPulse(pulse);
  const pop = dev.sim.rho.population(0);
  assert.ok(pop > 0.9, `π-pulse |1⟩ population = ${pop.toFixed(3)}`);
});

test('AI Co-Inventor: fixed-seed SPSA improves pulse fidelity reproducibly', () => {
  const T1 = TRANSMON.t1_us.typical;
  const T2 = TRANSMON.t2_us.typical;
  const runOnce = () => {
    const evalPulse = (params) => {
      const [amplitude, sigmaNs, beta] = params;
      const dev = new TransmonDevice({ nQubits: 1, t1Us: T1, t2Us: T2, seed: 99 });
      dev.reset();
      dev.runPulse({ qubit: 0, amplitude, sigmaNs, durationNs: TRANSMON.gate_1q_duration_ns.typical, beta });
      // Target: X|0⟩ = |1⟩ — state fidelity ⟨1|ρ|1⟩
      const pop = dev.sim.rho.population(0);
      return 1 - pop; // minimize error
    };
    const x0 = [18, 7.5, 0.0];
    const initialError = evalPulse(x0);
    // Two-stage: SPSA global exploration → Nelder–Mead polish (both seeded).
    const r1 = spsa(evalPulse, x0, {
      iterations: 30,
      seed: 2024,
      bounds: [[5, 40], [3, 12], [0, 1.5]],
    });
    const r2 = nelderMead(evalPulse, r1.x, {
      iterations: 80,
      bounds: [[5, 40], [3, 12], [0, 1.5]],
    });
    const finalError = evalPulse(r2.x);
    return { initialError, finalError, params: r2.x };
  };
  const a = runOnce();
  const b = runOnce();
  assert.deepEqual(a.params, b.params, 'fixed seed must reproduce the exact optimization trace');
  assert.ok(a.finalError < a.initialError, `optimizer must improve: ${a.finalError.toFixed(4)} vs ${a.initialError.toFixed(4)}`);
  assert.ok(a.finalError < 0.05, `optimized error below 5%: ${a.finalError.toFixed(4)}`);
});

test('QEC: 3-qubit bit-flip code beats the physical error rate (CHP tableau)', () => {
  const p = 0.05;
  const logical = bitFlipLogicalErrorRate(3000, p, 20241119);
  assert.ok(logical < p, `logical ${logical.toFixed(4)} must beat physical ${p}`);
  // Roughly quadratic suppression: C(3,2)p² + …
  assert.ok(logical < 0.03, `logical ${logical.toFixed(4)} should be well below the physical rate`);
});

test('QEC: distance-3 repetition surface segment beats physical rate', () => {
  const p = 0.05;
  const logical = surfaceCodeLogicalErrorRate(3000, p, 20241120);
  assert.ok(logical < p, `logical ${logical.toFixed(4)} must beat physical ${p}`);
});

test('QEC: Pauli-frame propagation rules (CNOT/H/S conjugation)', () => {
  const { PauliFrame } = stabilizerImport;
  // X on control propagates through CNOT to control⊗target.
  const f = new PauliFrame(2);
  f.injectX(0);
  f.cnot(0, 1);
  assert.equal(f.readZ(0), 1, 'X control keeps flipping its own Z');
  assert.equal(f.readZ(1), 1, 'X control propagates to target Z readout');
  // H swaps X ↔ Z.
  const g = new PauliFrame(1);
  g.injectZ(0);
  g.hadamard(0);
  assert.equal(g.readZ(0), 1, 'Z error becomes X under H → flips Z readout');
  // Z on target propagates backward to control's Z-frame through CNOT
  // (Z_t → Z_tZ_c); it does not flip the immediate Z readout (commutes).
  const h = new PauliFrame(2);
  h.injectZ(1);
  h.cnot(0, 1);
  assert.equal(h.readZ(1), 0, 'Z error commutes with the Z readout — no flip');
  assert.equal(h.z[0], 1, 'Z target propagates onto control Z-frame');
  h.hadamard(0); // H turns the propagated Z on control into X → now observable
  assert.equal(h.readZ(0), 1, 'propagated Z becomes X under H → flips Z readout');
});

test('Photonic MZI: beamsplitter is unitary and loss follows the dB/cm model', () => {
  const dev = new PhotonicDevice({
    nQubits: 1,
    lossDbPerCm: PHOTONIC.waveguide_propagation_loss_db_per_cm.typical,
    mziLossDb: PHOTONIC.mzi_insertion_loss_db.typical,
  });
  // 50:50 then inverse → identity norm preserved (lossless model).
  dev.beamsplitter(Math.PI / 4, 0, 0, 1);
  dev.beamsplitter(-Math.PI / 4, 0, 0, 1);
  assert.ok(Math.abs(dev.norm() - 1) < 1e-9, `norm after BS+inverse = ${dev.norm()}`);
  // 50:50 splits the input equally.
  dev.reset();
  dev.beamsplitter(Math.PI / 4, 0, 0, 1);
  const a0 = dev.amps[0].re ** 2 + dev.amps[0].im ** 2;
  const a1 = dev.amps[1].re ** 2 + dev.amps[1].im ** 2;
  assert.ok(Math.abs(a0 - 0.5) < 1e-9 && Math.abs(a1 - 0.5) < 1e-9, `split ${a0}/${a1}`);
  // Loss: 1 cm at 0.5 dB/cm + 1 MZI at 1 dB → survival 10^(−1.5/10)
  dev.reset();
  dev.applyLoss(1, 1);
  const expected = 10 ** (-1.5 / 10);
  assert.ok(Math.abs(dev.survival - expected) < 1e-12, `survival ${dev.survival} vs ${expected}`);
});

test('Neutral atom: Rydberg blockade strength from V = C6/r⁶ and CZ phase', () => {
  const dev = new NeutralAtomDevice({
    nQubits: 2,
    c6GHzUm6: ATOM.rydberg_c6_ghz_um6.typical,
    separationUm: 4.0,
  });
  const expected = ATOM.rydberg_c6_ghz_um6.typical / 4 ** 6 / 1000; // GHz→MHz
  assert.ok(Math.abs(dev.blockadeMhz - expected) < 1e-9, `blockade ${dev.blockadeMhz} MHz`);
  dev.rydbergCZ();
  const phaseDiff = Math.abs(((dev.phase[1] % (2 * Math.PI)) + 2 * Math.PI) % Math.PI);
  assert.ok(phaseDiff < 1e-6 || Math.abs(phaseDiff - Math.PI) < 1e-6, `CZ phase ${dev.phase[1]}`);
});

test('averageGateFidelity: identity → 1, and the 04-JSON denominator typo is corrected', () => {
  const I = { re: [1, 0, 0, 1], im: [0, 0, 0, 0] };
  assert.ok(Math.abs(averageGateFidelity(I, I, 2) - 1) < 1e-12, 'F(I, I) = 1');
  const X = { re: [0, 1, 1, 0], im: [0, 0, 0, 0] };
  const f = averageGateFidelity(X, I, 2); // |Tr(I†X)|² = 0 → F = 2/(2·3) = 1/3
  assert.ok(Math.abs(f - 1 / 3) < 1e-12, `F(X vs I) = ${f} (expect 1/3)`);
});

test('DRAG pulse envelope: Q quadrature is the derivative of I (dragPulse)', () => {
  const p = { amplitude: 1, sigmaNs: 10, durationNs: 40, beta: 0.5 };
  const c1 = dragPulse(20, p); // centre → I max, Q ≈ 0
  assert.ok(Math.abs(c1.ampI - 1) < 1e-9, `I(centre)=${c1.ampI}`);
  assert.ok(Math.abs(c1.ampQ) < 1e-9, `Q(centre)=${c1.ampQ} (derivative vanishes)`);
  const c2 = dragPulse(2, p); // rising edge → dI/dt > 0 → Q = β·dI/dt > 0
  assert.ok(c2.ampQ > 0, `Q(early)=${c2.ampQ} should be positive on the rising edge`);
  const c3 = dragPulse(38, p); // falling edge → dI/dt < 0 → Q < 0
  assert.ok(c3.ampQ < 0, `Q(late)=${c3.ampQ} should be negative on the falling edge`);
});
