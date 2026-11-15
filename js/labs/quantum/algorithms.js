// algorithms.js — validated reference circuits for the Quantum Lab.
// Every algorithm returns exact probabilities AND sampled counts with
// standard errors — quantum outputs are probabilistic and we say so.

import { QuditCircuit, binomialSE, c } from './qudit.js';
import { H, X, CNOT, SWAP } from './gates.js';

function formatCounts(meas, n, d) {
  const out = {};
  meas.counts.forEach((v, i) => {
    if (v > 0) out[QuditCircuit.fmtIndex(i, n, d)] = v;
  });
  return out;
}

/** Bell state |Φ+> = (|00> + |11>)/√2. */
export function bell({ shots = 1000, rng = Math.random } = {}) {
  const qc = new QuditCircuit(2, 2);
  qc.apply1(0, H).apply2(0, 1, CNOT());
  const meas = qc.measureAll(shots, rng);
  return {
    n: 2, d: 2,
    counts: formatCounts(meas, 2, 2),
    exact: { '00': 0.5, '01': 0, '10': 0, '11': 0.5 },
    standardErrors: { '00': binomialSE(0.5, shots), '11': binomialSE(0.5, shots) },
    note: 'Entanglement witness: P(01)+P(10) must be 0 — only |00> and |11> occur.',
  };
}

/** GHZ state (|0...0> + |1...1>)/√2 on n qubits. */
export function ghz(n = 3, { shots = 1000, rng = Math.random } = {}) {
  const qc = new QuditCircuit(n, 2);
  qc.apply1(0, H);
  for (let q = 0; q < n - 1; q++) qc.apply2(q, q + 1, CNOT());
  const meas = qc.measureAll(shots, rng);
  const counts = formatCounts(meas, n, 2);
  const allZero = '0'.repeat(n), allOne = '1'.repeat(n);
  return {
    n, d: 2,
    counts,
    exact: { [allZero]: 0.5, [allOne]: 0.5 },
    standardErrors: { [allZero]: binomialSE(0.5, shots), [allOne]: binomialSE(0.5, shots) },
    note: 'GHZ: only all-0 and all-1 outcomes should occur.',
  };
}

/**
 * Deutsch-Jozsa: decides constant vs balanced with ONE oracle query.
 * Oracle: constant -> f(x)=0 (identity); balanced -> f(x) = x0 XOR x1 (n>=2)
 * or f(x) = x (n=1).
 */
export function deutschJozsa({ n = 2, type = 'balanced', shots = 100, rng = Math.random } = {}) {
  const qc = new QuditCircuit(n + 1, 2);
  qc.apply1(n, X);                 // ancilla -> |1>
  for (let q = 0; q <= n; q++) qc.apply1(q, H);

  // oracle Uf: |x,y> -> |x, y XOR f(x)>, applied as a basis permutation
  const dim = 1 << (n + 1);
  const perm = new Int32Array(dim);
  for (let x = 0; x < (1 << n); x++) {
    const f = type === 'constant' ? 0 : (n === 1 ? (x & 1) : ((x >> (n - 1)) & 1) ^ (x & 1));
    for (let y = 0; y < 2; y++) perm[(x << 1) | y] = (x << 1) | (y ^ f);
  }
  const { re, im } = qc;
  const nr = new Float64Array(dim), ni = new Float64Array(dim);
  for (let i = 0; i < dim; i++) {
    nr[i] = re[perm[i]];
    ni[i] = im[perm[i]];
  }
  qc.re = nr; qc.im = ni;

  for (let q = 0; q < n; q++) qc.apply1(q, H);
  const meas = qc.measureAll(shots, rng);
  const counts = formatCounts(meas, n + 1, 2);
  const inputCounts = {};
  const zeroStr = '0'.repeat(n);
  let allZero = 0;
  for (const [k, v] of Object.entries(counts)) {
    const inp = k.slice(0, n);
    inputCounts[inp] = (inputCounts[inp] || 0) + v;
    if (inp === zeroStr) allZero += v;
  }
  return {
    n, d: 2, type,
    counts: inputCounts,
    verdict: type === 'constant'
      ? (allZero === shots ? 'constant' : 'inconclusive')
      : (allZero === 0 ? 'balanced' : 'inconclusive'),
    expectedVerdict: type,
    note: 'Deutsch-Jozsa: constant oracle -> all-zero with certainty; balanced -> never all-zero. One oracle query.',
  };
}

/** apply a full-state diagonal unitary (used by QFT controlled phases) */
function applyDiagonal(qc, diag) {
  const { re, im } = qc;
  const nr = new Float64Array(qc.N), ni = new Float64Array(qc.N);
  for (let i = 0; i < qc.N; i++) {
    const u = diag[i];
    nr[i] = u.re * re[i] - u.im * im[i];
    ni[i] = u.re * im[i] + u.im * re[i];
  }
  qc.re = nr; qc.im = ni;
  qc.gateCount += 1;
}

/** QFT on n qubits applied to basis state |x> — testable vs direct DFT. */
export function qft(n = 3, { x = 1 } = {}) {
  const qc = new QuditCircuit(n, 2);
  qc.re[0] = 0;
  qc.re[x] = 1; // start from |x>
  for (let j = 0; j < n; j++) {
    qc.apply1(j, H);
    for (let k = j + 1; k < n; k++) {
      const theta = Math.PI / (1 << (k - j));
      const dim = qc.N;
      const diag = Array.from({ length: dim }, (_, i) => {
        const cBit = (i >> (n - 1 - j)) & 1;
        const tBit = (i >> (n - 1 - k)) & 1;
        return (cBit && tBit) ? c(Math.cos(theta), Math.sin(theta)) : c(1);
      });
      applyDiagonal(qc, diag);
    }
  }
  for (let i = 0; i < Math.floor(n / 2); i++) {
    qc.apply2(i, n - 1 - i, SWAP());
  }
  return qc;
}
