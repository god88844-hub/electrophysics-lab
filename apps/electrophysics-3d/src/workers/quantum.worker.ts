// Electrophysics Lab — quantum worker: interactive noisy Lindblad simulation
// (1–2 qubits real-time), AI Co-Inventor pulse optimizer (fixed-seed SPSA +
// Nelder–Mead), QEC sweep, and reproducible breakthrough bundle payloads.
// All device parameters come from 04_quantum_hardware_modalities.json.

import { TransmonDevice, PhotonicDevice, spsa, nelderMead } from '@quantum/index.mjs';
import quantumJson from '@reflib/04_quantum_hardware_modalities.json';

const TRANSMON = quantumJson.parameters.superconducting_transmon;
const PHOTONIC = quantumJson.parameters.silicon_photonic_soi;
const ATOM = quantumJson.parameters.neutral_atom_rubidium87;

export interface QuantumParams {
  t1Us: number;
  t2Us: number;
  zzKhz: number;
  pulse: { amplitude: number; sigmaNs: number; beta: number; durationNs: number };
}

const params: QuantumParams = {
  t1Us: TRANSMON.t1_us.typical as number,
  t2Us: TRANSMON.t2_us.typical as number,
  zzKhz: TRANSMON.zz_crosstalk_khz.typical as number,
  pulse: { amplitude: 25, sigmaNs: 7.5, beta: 0, durationNs: TRANSMON.gate_1q_duration_ns.typical as number },
};

const N = 2; // interactive qubits (q0 target, q1 crosstalk partner)
let device = new TransmonDevice({
  nQubits: N,
  t1Us: params.t1Us,
  t2Us: params.t2Us,
  zzKhz: params.zzKhz,
  readoutFidelity: 1,
  seed: 77,
});

let pulseActive = false;
let pulseElapsedNs = 0;
let lastGateFidelity: number | null = null;

function postState(): void {
  const bloch = [];
  for (let q = 0; q < N; q++) {
    const v = device.sim.rho.blochVector(q);
    bloch.push({ x: v.x, y: v.y, z: v.z, purity: device.sim.rho.purity() });
  }
  (self as unknown as Worker).postMessage({
    type: 'state',
    bloch,
    gateFidelity: lastGateFidelity,
    leak: device.leakAccum,
  });
}

function runPulseOnce(): void {
  device.runPulse({ qubit: 0, ...params.pulse });
  // State fidelity vs ideal X|0⟩ = |1⟩ (only meaningful from |0⟩).
  const pop = device.sim.rho.population(0);
  lastGateFidelity = Math.max(0, Math.min(1, pop));
}

// ------------------------------------------------------------- AI experiment --
interface Bundle {
  format: string;
  kind: string;
  badge: 'SIMULATED_NOISY_MODEL';
  seed: number;
  initialFidelity: number;
  optimizedFidelity: number;
  optimizedParams: Record<string, number>;
  iterations: number;
  noise: Record<string, number>;
  citation: string;
  generatedAt: string;
}

function runExperiment(): void {
  const seed = 20241119;
  const evalPulse = (p: number[]): number => {
    const [amplitude, sigmaNs, beta] = p;
    const dev = new TransmonDevice({
      nQubits: 2,
      t1Us: params.t1Us,
      t2Us: params.t2Us,
      zzKhz: params.zzKhz,
      seed: 99,
    });
    dev.runPulse({ qubit: 0, amplitude, sigmaNs, beta, durationNs: params.pulse.durationNs });
    // Target: X gate on q0 → |1⟩; crosstalk partner must stay |0⟩.
    const pop0 = dev.sim.rho.population(0);
    const leak01 = dev.sim.rho.population(1);
    return (1 - pop0) + 0.5 * leak01;
  };
  const x0 = [params.pulse.amplitude, params.pulse.sigmaNs, params.pulse.beta];
  const initialError = evalPulse(x0);
  const bounds: Array<[number, number]> = [[5, 40], [3, 12], [0, 1.5]];
  const r1 = spsa(evalPulse, x0, { iterations: 30, seed, bounds });
  for (const h of r1.history) {
    (self as unknown as Worker).postMessage({ type: 'experimentProgress', k: h.k, total: 30, error: h.best });
  }
  const r2 = nelderMead(evalPulse, r1.x, { iterations: 80, bounds });
  const finalError = evalPulse(r2.x);
  // Optimized fidelity against a fresh device (fixed seed → reproducible).
  const devFinal = new TransmonDevice({ nQubits: 2, t1Us: params.t1Us, t2Us: params.t2Us, zzKhz: params.zzKhz, seed: 99 });
  devFinal.runPulse({ qubit: 0, amplitude: r2.x[0], sigmaNs: r2.x[1], beta: r2.x[2], durationNs: params.pulse.durationNs });
  const optimizedFidelity = devFinal.sim.rho.population(0);
  const initialDev = new TransmonDevice({ nQubits: 2, t1Us: params.t1Us, t2Us: params.t2Us, zzKhz: params.zzKhz, seed: 99 });
  initialDev.runPulse({ qubit: 0, ...params.pulse });
  const initialFidelity = initialDev.sim.rho.population(0);

  const bundle: Bundle = {
    format: 'invention-lab/breakthrough-bundle/1',
    kind: 'x-gate-error-minimization-under-transmon-noise',
    badge: 'SIMULATED_NOISY_MODEL',
    seed,
    initialFidelity,
    optimizedFidelity,
    optimizedParams: { amplitudeMHz: r2.x[0], sigmaNs: r2.x[1], dragBeta: r2.x[2] },
    iterations: 30 + 80,
    noise: { t1Us: params.t1Us, t2Us: params.t2Us, zzKhz: params.zzKhz },
    citation: String(quantumJson.parameters.superconducting_transmon.citations?.[0] ?? '04_quantum_hardware_modalities.json'),
    generatedAt: new Date().toISOString(),
  };
  (self as unknown as Worker).postMessage({ type: 'experimentDone', bundle, finalError });
}

function runQecSweep(): void {
  // Lazy import to keep the interactive path light.
  import('@quantum/stabilizer.mjs').then(({ surfaceCodeLogicalErrorRate, bitFlipLogicalErrorRate }) => {
    const curve: Array<{ p: number; logical: number }> = [];
    for (let ppm = 10; ppm <= 80; ppm += 10) {
      const p = ppm / 1000;
      curve.push({ p, logical: surfaceCodeLogicalErrorRate(800, p, 20241120 + ppm) });
    }
    const bf: Array<{ p: number; logical: number }> = [];
    for (let ppm = 10; ppm <= 80; ppm += 10) {
      const p = ppm / 1000;
      bf.push({ p, logical: bitFlipLogicalErrorRate(800, p, 314159 + ppm) });
    }
    (self as unknown as Worker).postMessage({ type: 'qecResult', curve, bitflip: bf });
  });
}

function runPhotonicCheck(): void {
  const dev = new PhotonicDevice({
    nQubits: 1,
    lossDbPerCm: PHOTONIC.waveguide_propagation_loss_db_per_cm.typical as number,
    mziLossDb: PHOTONIC.mzi_insertion_loss_db.typical as number,
    pPiMW: PHOTONIC.thermo_optic_phase_shifter.p_pi_mw.typical as number,
    thermalCrosstalkDb: PHOTONIC.thermo_optic_phase_shifter.thermal_crosstalk_db.typical as number,
  });
  dev.beamsplitter(Math.PI / 4, 0, 0, 1);
  dev.applyLoss(1, 1);
  dev.applyThermalCrosstalk(0, 5, [{ mode: 1 }]);
  (self as unknown as Worker).postMessage({
    type: 'photonicResult',
    survival: dev.survival,
    norm: dev.norm(),
    pPiMW: PHOTONIC.thermo_optic_phase_shifter.p_pi_mw.typical,
    crosstalkDb: PHOTONIC.thermo_optic_phase_shifter.thermal_crosstalk_db.typical,
  });
}

// ------------------------------------------------------------- main loop ----
let lastFrame = 0;
function loop(): void {
  const now = performance.now();
  const dtMs = Math.min(50, now - lastFrame);
  lastFrame = now;
  if (pulseActive) {
    pulseElapsedNs += dtMs * 1e6; // wall-clock scaled: 1 frame ≈ full pulse
    runPulseOnce();
    pulseActive = false;
    postState();
  }
  // Decoherence continues in playback time (×3.3: T1 = 100 µs decays visibly
  // over ~30 s of wall clock — labelled as playback speed in the UI).
  device.idle((dtMs / 1000) * 3.3);
  postState();
  setTimeout(loop, 33); // ~30 Hz
}
lastFrame = performance.now();
loop();

// ------------------------------------------------------------- messaging ----
self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === 'params') {
    Object.assign(params, msg.patch);
    if (msg.patch.pulse) params.pulse = { ...params.pulse, ...msg.patch.pulse };
    device = new TransmonDevice({
      nQubits: N,
      t1Us: params.t1Us,
      t2Us: params.t2Us,
      zzKhz: params.zzKhz,
      readoutFidelity: 1,
      seed: 77,
    });
    lastGateFidelity = null;
  } else if (msg.type === 'applyPulse') {
    pulseActive = true;
    pulseElapsedNs = 0;
  } else if (msg.type === 'reset') {
    device.reset();
    lastGateFidelity = null;
    postState();
  } else if (msg.type === 'experiment') {
    runExperiment();
  } else if (msg.type === 'qecSweep') {
    runQecSweep();
  } else if (msg.type === 'photonicCheck') {
    runPhotonicCheck();
  } else if (msg.type === 'atomCheck') {
    // Rydberg blockade demo numbers straight from the 04 JSON parameters.
    const c6 = ATOM.rydberg_c6_ghz_um6.typical as number;
    const r = 4;
    (self as unknown as Worker).postMessage({
      type: 'atomResult',
      blockadeMhz: (c6 / r ** 6),
      radiusUm: ATOM.rydberg_blockade_radius_um.typical,
      atoms: 64,
    });
  }
};
