/**
 * QEC simulation via Pauli-frame Clifford propagation — the industry-standard
 * method (as used by Stim). Circuit outcomes are deterministic in the noiseless
 * frame; injected Pauli errors propagate through the Clifford circuit (CNOT /
 * H / S) and flip readout bits. This is exact for stabilizer circuits with
 * Pauli noise channels and perfect (or binary-noise) measurements.
 *
 * Conjugation rules used for the frame E → C·E·C†:
 *   CNOT(c,t): X_c → X_cX_t, Z_t → Z_tZ_c, X_t → X_t, Z_c → Z_c
 *   H(q):  X ↔ Z
 *   S(q):  X → Y (= X·Z in frame), Z → Z
 */

export class PauliFrame {
  constructor(nQubits) {
    this.n = nQubits;
    this.x = new Uint8Array(nQubits);
    this.z = new Uint8Array(nQubits);
  }

  hadamard(q) {
    const x = this.x[q];
    this.x[q] = this.z[q];
    this.z[q] = x;
  }

  phaseGate(q) {
    // S·X·S† = Y = X·Z (frame form); S·Z·S† = Z.
    if (this.x[q]) this.z[q] ^= 1;
  }

  cnot(control, target) {
    if (this.x[control]) this.x[target] ^= 1;
    if (this.z[target]) this.z[control] ^= 1;
  }

  cz(control, target) {
    // CZ: X_t → X_tZ_c, Z_c → Z_cX_t
    if (this.x[target]) this.z[control] ^= 1;
    if (this.z[control]) this.x[target] ^= 1;
  }

  injectX(q) {
    this.x[q] ^= 1;
  }

  injectZ(q) {
    this.z[q] ^= 1;
  }

  injectY(q) {
    this.x[q] ^= 1;
    this.z[q] ^= 1;
  }

  /** Z-basis readout of qubit q: base (noiseless) XOR X-error frame. */
  readZ(q, base = 0) {
    return base ^ this.x[q];
  }

  /** Parity of a set of Z readouts. */
  parityZ(qubits, bases = []) {
    let p = 0;
    qubits.forEach((q, i) => {
      p ^= this.readZ(q, bases[i] ?? 0);
    });
    return p;
  }
}

// ------------------------------------------------ 3-qubit bit-flip code -----
// Data qubits 0,1,2; syndrome ancillas 3,4. Circuit: CNOT ladder measuring
// Z0Z1 (ancilla 3) and Z1Z2 (ancilla 4). Noiseless readouts are all 0, so the
// observed syndrome = propagated X-error frame.
export function runBitFlipCodeTrial(p, seed) {
  const frame = new PauliFrame(5);
  const rng = mulberry32Local(seed);
  // Independent bit-flip channel on data.
  for (let q = 0; q < 3; q++) if (rng() < p) frame.injectX(q);
  // Syndrome extraction circuit.
  frame.cnot(0, 3);
  frame.cnot(1, 3);
  const s1 = frame.readZ(3);
  frame.cnot(1, 4);
  frame.cnot(2, 4);
  const s2 = frame.readZ(4);
  // Lookup decoder.
  let correction = -1;
  if (s1 === 1 && s2 === 0) correction = 0;
  else if (s1 === 0 && s2 === 1) correction = 2;
  else if (s1 === 1 && s2 === 1) correction = 1;
  if (correction >= 0) frame.injectX(correction);
  // Logical readout: parity of the three data Z values.
  const logicalBit = frame.parityZ([0, 1, 2]);
  return { logicalBit, syndrome: [s1, s2], correction };
}

export function bitFlipLogicalErrorRate(trials, p, seed) {
  let errors = 0;
  for (let i = 0; i < trials; i++) {
    const r = runBitFlipCodeTrial(p, seed + i);
    if (r.logicalBit === 1) errors++;
  }
  return errors / trials;
}

// --------------------- distance-3 repetition surface-code segment (1D) ------
// 5 data qubits in a chain + 4 Z-type syndrome ancillas (Z_iZ_{i+1}); corrects
// any single X error. (Full 2D rotated d3 plaquette geometry: Phase 3 backlog.)
const REP_DATA = 5;

export function runSurfaceCodeTrial(p, seed) {
  const frame = new PauliFrame(9);
  const rng = mulberry32Local(seed);
  for (let q = 0; q < REP_DATA; q++) if (rng() < p) frame.injectX(q);
  const synd = [];
  for (let a = 0; a < 4; a++) {
    frame.cnot(a, 5 + a);
    frame.cnot(a + 1, 5 + a);
    synd.push(frame.readZ(5 + a));
  }
  // Weight-1 lookup decoder: bulk qubits → adjacent pair, boundary → single.
  const sig = synd.join('');
  let correction = -1;
  const signatures = repSingleErrorSignatures();
  for (const [q, s] of signatures) {
    if (s === sig) correction = q;
  }
  if (correction >= 0) frame.injectX(correction);
  const logicalBit = frame.parityZ([0, 1, 2, 3, 4]);
  return { logicalBit, failed: logicalBit === 1, syndrome: synd, correction };
}

function repSingleErrorSignatures() {
  const out = [];
  for (let q = 0; q < REP_DATA; q++) {
    const s = [];
    for (let a = 0; a < 4; a++) s.push(a === q || a === q - 1 ? 1 : 0);
    out.push([q, s.join('')]);
  }
  return out;
}

export function surfaceCodeLogicalErrorRate(trials, p, seed) {
  let failed = 0;
  for (let i = 0; i < trials; i++) {
    const r = runSurfaceCodeTrial(p, seed + i);
    if (r.failed) failed++;
  }
  return failed / trials;
}

function mulberry32Local(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
