// quantum-cases.js — cross-solver benchmarks for the Quantum Lab (Phase 2 §5).
//
// Qubit cases compare full complex state vectors against REAL Qiskit
// (Statevector), handling:
//   * qubit-order conventions (Qiskit little-endian vs Invention Lab q0-MSB,
//     resolved by index bit-reversal in the adapter),
//   * global phase (compared up to e^{i phi}; the found phase is reported),
//   * exact probabilities and (where sampled) statistically justified
//     comparisons (never identical RNG sequences).
//
// Qutrit/ququart cases use an INDEPENDENTLY IMPLEMENTED NumPy tensor-product
// reference and are labelled "independent mathematical reference agreement",
// NOT Qiskit qudit validation (Qiskit was not used for them).
// One case deliberately runs the same qubit circuit through BOTH the NumPy
// reference and Qiskit to cross-validate the reference implementation itself.

import { defineCase } from '../harness.js';
import { compareUpToGlobalPhase, numCheck } from '../compare.js';
import { Diagram } from '../../core/diagram.js';
import '../../labs/quantum/components.js';
import '../../labs/quantum/lab.js';
import { getLab } from '../../core/registry.js';

const quantumLab = () => getLab('quantum');

/** build an Invention Lab quantum diagram from a portable gate list */
function quantumDiagram(n, gates, meta = {}) {
  const d = new Diagram({
    lab: 'quantum', name: 'bench',
    meta: { d: 2, shots: 1000, seed: 11, ...meta },
  });
  const wires = [];
  for (let q = 0; q < n; q++) {
    wires.push(d.addBlock('quantum.WIRE', { params: { name: `q${q}` }, x: 0, y: 40 + q * 90 }));
  }
  const outs = wires.map((w) => ({ block: w.id, port: 'out' }));
  let x = 150;
  for (const g of gates) {
    const typeId = {
      H: 'quantum.H', X: 'quantum.X', Y: 'quantum.Y', Z: 'quantum.Z',
      S: 'quantum.S', T: 'quantum.T', SWAP: 'quantum.SWAP', CNOT: 'quantum.CNOT',
      CZ: 'quantum.CZ', CP: 'quantum.CP',
      SHIFT: 'quantum.SHIFT', FOURIER: 'quantum.FOURIER', PHASEK: 'quantum.PHASEK', SUM: 'quantum.SUM',
      PHASE: 'quantum.PHASE', RX: 'quantum.RX', RY: 'quantum.RY', RZ: 'quantum.RZ',
    }[g.kind];
    if (!typeId) throw new Error(`quantumDiagram: no component for gate kind "${g.kind}"`);
    const params = {};
    if (g.params?.theta !== undefined) params.theta = g.params.theta;
    if (g.params?.k !== undefined) params.k = g.params.k;
    const blk = d.addBlock(typeId, { params, x, y: 40 + (g.qubits[0] ?? 0) * 90 });
    const inPorts = {
      H: ['qin'], X: ['qin'], Y: ['qin'], Z: ['qin'], S: ['qin'], T: ['qin'],
      PHASE: ['qin'], RX: ['qin'], RY: ['qin'], RZ: ['qin'],
      CNOT: ['cin', 'tin'], CZ: ['cin', 'tin'], CP: ['cin', 'tin'], SWAP: ['ain', 'bin'],
      SHIFT: ['qin'], FOURIER: ['qin'], PHASEK: ['qin'], SUM: ['ain', 'bin'],
    }[g.kind];
    const outPorts = {
      H: ['qout'], X: ['qout'], Y: ['qout'], Z: ['qout'], S: ['qout'], T: ['qout'],
      PHASE: ['qout'], RX: ['qout'], RY: ['qout'], RZ: ['qout'],
      CNOT: ['cout', 'tout'], CZ: ['cout', 'tout'], CP: ['cout', 'tout'], SWAP: ['aout', 'bout'],
      SHIFT: ['qout'], FOURIER: ['qout'], PHASEK: ['qout'], SUM: ['aout', 'bout'],
    }[g.kind];
    g.qubits.forEach((q, i) => {
      const head = outs[q];
      d.connect(head.block, head.port, blk.id, inPorts[i]);
      outs[q] = { block: blk.id, port: outPorts[i] };
    });
    x += 140;
  }
  for (let q = 0; q < n; q++) {
    const m = d.addBlock('quantum.MEASURE', { x, y: 40 + q * 90 });
    d.connect(outs[q].block, outs[q].port, m.id, 'in');
  }
  return d;
}

/** run the Invention Lab engine on a gate list; returns ordered amplitudes */
function quantumLabRun(n, gates, d = 2) {
  const diag = quantumDiagram(n, gates, { d });
  const res = quantumLab().run(diag);
  if (!res.ok) throw new Error(`quantumLab.run failed: ${res.problems?.join('; ')}`);
  return {
    re: res.stateVector.map((s) => s.amp.re),
    im: res.stateVector.map((s) => s.amp.im),
    probs: res.stateVector.map((s) => s.prob),
  };
}

export function quantumCases() {
  const cases = [];

  /**
   * generic state-vector comparison case.
   * refModes: array of reference modes to compare against
   *   ('qiskit' = real Qiskit; 'numpy' = independent NumPy qudit reference)
   */
  const stateVectorCase = (id, title, n, gates, { purposeExtra = '', d = 2, refModes = null } = {}) => defineCase({
    id, suite: 'quantum', title,
    purpose: `Full complex state-vector comparison against ${refModes
      ? refModes.map((m) => (m === 'qiskit' ? 'Qiskit Statevector' : 'the independent NumPy qudit reference')).join(' AND ')
      : (d === 2 ? 'Qiskit Statevector' : 'the independent NumPy qudit reference')} (global phase normalized, index conventions mapped). ${purposeExtra}`,
    units: { amplitude: 'dimensionless complex' },
    toleranceRationale: 'max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.',
    modelNotes: [
      d === 2
        ? 'Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.'
        : 'Qudit reference: independent NumPy tensordot implementation (axis 0 = q0) with fresh matrix definitions; labelled "independent mathematical reference agreement", NOT Qiskit validation.',
      'Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.',
    ],
    async run(ctx) {
      const modes = refModes ?? (d === 2 ? ['qiskit'] : ['numpy']);
      if (modes.includes('qiskit') && !ctx.quantum?.qiskit) {
        return { status: 'skipped', classification: 'reference-unavailable', notes: ['Qiskit not installed — NOT executed, NOT counted as a pass.'] };
      }
      if (!ctx.quantum?.python) {
        return { status: 'skipped', classification: 'reference-unavailable', notes: ['Python not found — NOT executed.'] };
      }
      const il = quantumLabRun(n, gates, d);
      const ilVec = il.re.map((re, i) => ({ re, im: il.im[i] }));
      const checks = [];
      const notes = [];
      for (const mode of modes) {
        const ref = await ctx.quantum.run({ mode, n, d, gates });
        if (ref.status !== 'ok') {
          return {
            status: ref.status === 'reference-unavailable' ? 'skipped' : 'fail',
            classification: ref.status === 'reference-unavailable' ? 'reference-unavailable' : 'reference-failure',
            notes: [ref.error || 'reference failed'], il: { n, d },
          };
        }
        const ordered = mode === 'qiskit' ? ctx.quantum.toIlOrder(ref.amplitudes, n) : ref.amplitudes;
        const cmp = compareUpToGlobalPhase(ilVec, ordered);
        if (!Number.isFinite(cmp.maxErr)) throw new Error('non-finite amplitude comparison');
        checks.push(numCheck(`max |amplitude| error vs ${mode} (after global phase)`, cmp.maxErr, 0, { abs: 1e-9 }));
        const probsRef = ordered.map((a) => a.re * a.re + a.im * a.im);
        const probMaxErr = Math.max(...il.probs.map((p, i) => Math.abs(p - probsRef[i])));
        checks.push(numCheck(`max probability error vs ${mode}`, probMaxErr, 0, { abs: 2e-9 }));
        notes.push(`vs ${mode}: global phase ${cmp.globalPhaseDeg.toFixed(6)} deg`);
      }
      return {
        il: { n, d, gates: gates.length },
        ref: { engines: modes },
        checks, notes,
      };
    },
  });

  // ---- qubit cases (Qiskit) -------------------------------------------------
  cases.push(stateVectorCase('quantum-basis-identity', 'Basis state |000> (identity preparation)', 3, []));
  cases.push(stateVectorCase('quantum-hadamard-all', 'Hadamard on 3 qubits', 3, [
    { kind: 'H', qubits: [0] }, { kind: 'H', qubits: [1] }, { kind: 'H', qubits: [2] },
  ]));
  cases.push(stateVectorCase('quantum-pauli-sequence', 'Pauli X/Y/Z sequence', 2, [
    { kind: 'X', qubits: [0] }, { kind: 'Y', qubits: [1] }, { kind: 'Z', qubits: [0] },
  ]));
  cases.push(stateVectorCase('quantum-phase-gates', 'S, T and PHASE(pi/6) mixture', 2, [
    { kind: 'H', qubits: [0] }, { kind: 'S', qubits: [0] }, { kind: 'T', qubits: [1] },
    { kind: 'H', qubits: [1] }, { kind: 'PHASE', qubits: [0], params: { theta: Math.PI / 6 } },
  ]));
  cases.push(stateVectorCase('quantum-cnot-bell', 'Bell state (H + CNOT)', 2, [
    { kind: 'H', qubits: [0] }, { kind: 'CNOT', qubits: [0, 1] },
  ]));
  cases.push(stateVectorCase('quantum-swap-chain', 'SWAP chain across 3 qubits', 3, [
    { kind: 'X', qubits: [0] }, { kind: 'SWAP', qubits: [0, 1] }, { kind: 'SWAP', qubits: [1, 2] },
  ]));
  cases.push(stateVectorCase('quantum-rx-ry-rz', 'Rotation gates Rx/Ry/Rz with non-trivial angles', 2, [
    { kind: 'RY', qubits: [0], params: { theta: Math.PI / 3 } },
    { kind: 'RX', qubits: [1], params: { theta: Math.PI / 5 } },
    { kind: 'RZ', qubits: [0], params: { theta: Math.PI / 7 } },
    { kind: 'CNOT', qubits: [0, 1] },
  ]));
  cases.push(stateVectorCase('quantum-ghz-3', 'GHZ-3 (H + CNOT chain)', 3, [
    { kind: 'H', qubits: [0] }, { kind: 'CNOT', qubits: [0, 1] }, { kind: 'CNOT', qubits: [1, 2] },
  ]));
  cases.push(stateVectorCase('quantum-dj-balanced', 'Deutsch-Jozsa (balanced oracle as explicit CX gates; 2 inputs + ancilla)', 3, [
    { kind: 'X', qubits: [2] },
    { kind: 'H', qubits: [0] }, { kind: 'H', qubits: [1] }, { kind: 'H', qubits: [2] },
    { kind: 'CNOT', qubits: [0, 2] }, { kind: 'CNOT', qubits: [1, 2] },
    { kind: 'H', qubits: [0] }, { kind: 'H', qubits: [1] },
  ]));

  // ---- QFT (needs CP gates through the diagram) -------------------------------
  cases.push(defineCase({
    id: 'quantum-qft-3',
    suite: 'quantum',
    title: 'QFT on |1> — H + controlled phases + swaps vs Qiskit Statevector and direct DFT',
    purpose: 'Build the standard 3-qubit QFT circuit from its gate list (H, controlled phase rotations, SWAPs), run it on Invention Lab and Qiskit, and compare full state vectors. Additionally compare against the analytic DFT of |1>.',
    units: { amplitude: 'dimensionless complex' },
    toleranceRationale: 'max amplitude error < 1e-9 after global-phase normalization (double precision unitary products); controlled-phase construction must match between the engines exactly.',
    modelNotes: ['Controlled phases are expressed as CP gates in both engines; the index-order mapping is bit-reversal, identical to the other qubit cases.'],
    async run(ctx) {
      const n = 3;
      const gates = [
        { kind: 'X', qubits: [2] },
        { kind: 'H', qubits: [0] },
        { kind: 'CP', qubits: [0, 1], params: { theta: Math.PI / 2 } },
        { kind: 'CP', qubits: [0, 2], params: { theta: Math.PI / 4 } },
        { kind: 'H', qubits: [1] },
        { kind: 'CP', qubits: [1, 2], params: { theta: Math.PI / 2 } },
        { kind: 'H', qubits: [2] },
        { kind: 'SWAP', qubits: [0, 2] },
      ];
      if (!ctx.quantum?.qiskit) {
        return { status: 'skipped', classification: 'reference-unavailable', notes: ['Qiskit not installed — NOT executed, NOT counted as a pass.'] };
      }
      const il = quantumLabRun(n, gates, 2);
      const ref = await ctx.quantum.run({ mode: 'qiskit', n, d: 2, gates });
      if (ref.status !== 'ok') {
        return { status: ref.status === 'reference-unavailable' ? 'skipped' : 'fail', classification: ref.status, notes: [ref.error || 'ref failed'] };
      }
      const ordered = ctx.quantum.toIlOrder(ref.amplitudes, n);
      const cmp = compareUpToGlobalPhase(
        il.re.map((re, i) => ({ re, im: il.im[i] })), ordered);
      const N = 1 << n;
      let anMaxErr = 0;
      for (let k = 0; k < N; k++) {
        const ph = (2 * Math.PI * 1 * k) / N;
        anMaxErr = Math.max(anMaxErr, Math.hypot(il.re[k] - Math.cos(ph) / Math.sqrt(N), il.im[k] - Math.sin(ph) / Math.sqrt(N)));
      }
      const checks = [
        numCheck('max |amplitude| error vs Qiskit (global phase normalized)', cmp.maxErr, 0, { abs: 1e-9 }),
        numCheck('max |amplitude| error vs analytic DFT of |1>', anMaxErr, 0, { abs: 1e-9 }),
      ];
      return {
        il: { n }, ref: { engine: ref.engine },
        checks, notes: [`global phase: ${cmp.globalPhaseDeg.toFixed(6)} deg`],
      };
    },
  }));

  // ---- measurement statistics ------------------------------------------------
  cases.push(defineCase({
    id: 'quantum-bell-sampling',
    suite: 'quantum',
    title: 'Bell-state measurement statistics (seeded sampler vs exact Qiskit distribution)',
    purpose: 'Sample the Bell circuit 4000 times on Invention Lab (seeded mulberry32). The independent reference is the EXACT distribution from Qiskit Statevector — no RNG-vs-RNG sequence comparison is demanded; sampled counts must be consistent within 4 sigma of the binomial bound.',
    units: { probability: 'dimensionless' },
    toleranceRationale: 'exact probabilities: abs 1e-9 (same unitary). Sampled counts: |p_sampled - p_exact| <= 4*sqrt(p(1-p)/N) — a statistically justified two-sided bound.',
    modelNotes: ['Invention Lab samples with mulberry32(seed); the exact distribution comes from Qiskit. No shared RNG, no shared stream.'],
    async run(ctx) {
      if (!ctx.quantum?.qiskit) {
        return { status: 'skipped', classification: 'reference-unavailable', notes: ['Qiskit not installed — NOT executed, NOT counted as a pass.'] };
      }
      const gates = [{ kind: 'H', qubits: [0] }, { kind: 'CNOT', qubits: [0, 1] }];
      const shots = 4000;
      const diag = quantumDiagram(2, gates, { d: 2, shots, seed: 2024 });
      const res = quantumLab().run(diag);
      if (!res.ok) throw new Error(`quantumLab.run failed: ${res.problems?.join('; ')}`);
      const ref = await ctx.quantum.run({ mode: 'qiskit', n: 2, d: 2, gates });
      if (ref.status !== 'ok') {
        return { status: ref.status === 'reference-unavailable' ? 'skipped' : 'fail', classification: ref.status, notes: [ref.error] };
      }
      const ordered = ctx.quantum.toIlOrder(ref.amplitudes, 2);
      const cmp = compareUpToGlobalPhase(
        res.stateVector.map((s) => ({ re: s.amp.re, im: s.amp.im })), ordered);
      const checks = [
        numCheck('exact probabilities (via state vectors, global phase normalized)', cmp.maxErr, 0, { abs: 1e-9 }),
      ];
      for (const sName of ['00', '01', '10', '11']) {
        const idx = parseInt(sName, 2);
        const pExact = ordered[idx].re ** 2 + ordered[idx].im ** 2;
        const pSampled = res.counts[sName] ? res.counts[sName] / shots : 0;
        const sigma = Math.sqrt(Math.max(1e-12, pExact * (1 - pExact)) / shots);
        const z = Math.abs(pSampled - pExact) / sigma;
        checks.push({
          name: `sampled P(${sName}) consistent with exact distribution (4 sigma)`,
          verdict: z <= 4 ? 'pass' : 'fail', stage: 'crossSolver',
          actual: pSampled, expected: pExact, tolerance: 4 * sigma,
          metrics: { z }, note: `${res.counts[sName] || 0}/${shots} samples, z=${z.toFixed(2)}`,
        });
      }
      const detIl = Math.abs(
        (res.stateVector[0].amp.re * res.stateVector[3].amp.re) -
        (res.stateVector[1].amp.re * res.stateVector[2].amp.re),
      );
      checks.push(numCheck('concurrence agrees with Qiskit state (C=1 for Bell)', 2 * detIl, 1, { abs: 1e-9 }));
      return {
        il: { counts: res.counts, shots }, ref: { engine: ref.engine },
        checks, notes: [`global phase: ${cmp.globalPhaseDeg.toFixed(6)} deg`],
      };
    },
  }));

  // ---- qudit cases (independent NumPy reference) ------------------------------
  cases.push(stateVectorCase('qudit-qutrit-shift-fourier', 'Qutrit (d=3): SHIFT + Fourier + Phase_k + SUM on 2 qudits', 2, [
    { kind: 'SHIFT', qubits: [0] },
    { kind: 'FOURIER', qubits: [1] },
    { kind: 'PHASEK', qubits: [0], params: { k: 2 } },
    { kind: 'SUM', qubits: [0, 1] },
  ], { d: 3, purposeExtra: 'Verifies mod-d arithmetic and tensor conventions against the independent NumPy reference.' }));

  cases.push(stateVectorCase('qudit-ququart-sum', 'Ququart (d=4): |2>|1> through SUM -> |2>|3>', 2, [
    { kind: 'SHIFT', qubits: [0] }, { kind: 'SHIFT', qubits: [0] },
    { kind: 'SHIFT', qubits: [1] },
    { kind: 'SUM', qubits: [0, 1] },
  ], { d: 4, purposeExtra: 'Qudit adder arithmetic: (2+1) mod 4 = 3.' }));

  // cross-validation of the NumPy reference itself: same qubit circuit through
  // BOTH Qiskit and NumPy — all three engines must agree.
  cases.push(stateVectorCase('qudit-cross-check-qubits', 'Reference cross-validation: H+CNOT+T circuit through Qiskit AND the NumPy reference', 2, [
    { kind: 'H', qubits: [0] }, { kind: 'CNOT', qubits: [0, 1] }, { kind: 'T', qubits: [0] },
  ], { d: 2, refModes: ['qiskit', 'numpy'], purposeExtra: 'If NumPy and Qiskit agree on a circuit both can compute, the NumPy reference implementation is validated for the qudit cases that Qiskit cannot express.' }));

  return cases;
}
