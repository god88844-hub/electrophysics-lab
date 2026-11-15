// qudit.js — pure state-vector simulator for qudits (qubits d=2, qutrits d=3,
// ququarts d=4, ...). Pure states only, no density matrices (stated openly).
//
// Conventions (documented, tested):
//   * qudit q0 is the MOST significant digit of the basis index
//   * state |q0 q1 ... qn-1> has index Σ q_k · d^(n-1-k)
//   * all gates must be unitary; a non-unitary gate is refused
//
// State dimension guard: d^n <= 65536 (16 qubits / 8 qutrits / 8 ququarts).

export const MAX_DIM = 65536;

// --- complex helpers on {re, im} pairs --------------------------------------
export const c = (re, im = 0) => ({ re, im });
export const cAdd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
export const cMul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
export const cAbs2 = (a) => a.re * a.re + a.im * a.im;
export const cExpI = (theta) => ({ re: Math.cos(theta), im: Math.sin(theta) });

export class QuditCircuit {
  constructor(n, d = 2) {
    if (d < 2) throw new Error('qudit dimension d must be >= 2');
    if (Math.pow(d, n) > MAX_DIM) {
      throw new Error(`State too large: d^n = ${Math.pow(d, n)} > ${MAX_DIM} (n=${n}, d=${d})`);
    }
    this.n = n;
    this.d = d;
    const N = Math.pow(d, n);
    this.N = N;
    this.re = new Float64Array(N);
    this.im = new Float64Array(N);
    this.re[0] = 1; // |0...0>
    this.gateCount = 0;
  }

  digit(index, q) {
    return Math.floor(index / Math.pow(this.d, this.n - 1 - q)) % this.d;
  }

  /** Apply a d×d unitary U (array of d arrays of {re,im}) to qudit q. */
  apply1(q, U) {
    if (q < 0 || q >= this.n) throw new Error(`qudit index ${q} out of range`);
    checkUnitary(U, this.d);
    const d = this.d, stride = Math.pow(d, this.n - 1 - q);
    const { re, im } = this;
    const nr = new Float64Array(this.N), ni = new Float64Array(this.N);
    nr.set(re); ni.set(im);
    for (let base = 0; base < this.N; base += stride * d) {
      for (let off = 0; off < stride; off++) {
        // gather
        for (let j = 0; j < d; j++) {
          let sr = 0, si = 0;
          for (let k = 0; k < d; k++) {
            const idx = base + off + k * stride;
            const ur = U[j][k].re, ui = U[j][k].im;
            sr += ur * re[idx] - ui * im[idx];
            si += ur * im[idx] + ui * re[idx];
          }
          nr[base + off + j * stride] = sr;
          ni[base + off + j * stride] = si;
        }
      }
    }
    this.re = nr; this.im = ni;
    this.gateCount += 1;
    return this;
  }

  /** Apply a d²×d² unitary U to qudits (q1, q2), q1 is the more significant. */
  apply2(q1, q2, U) {
    if (q1 === q2) throw new Error('apply2 needs two distinct qudits');
    if (q1 > q2) [q1, q2] = [q2, q1]; // canonical: q1 more significant
    checkUnitary(U, this.d * this.d);
    const d = this.d;
    const s1 = Math.pow(d, this.n - 1 - q1), s2 = Math.pow(d, this.n - 1 - q2);
    const { re, im } = this;
    const nr = new Float64Array(this.N), ni = new Float64Array(this.N);
    nr.set(re); ni.set(im);
    for (let i = 0; i < this.N; i++) {
      const dg1 = this.digit(i, q1), dg2 = this.digit(i, q2);
      if (dg1 !== 0 || dg2 !== 0) continue; // process each group once
      const i0 = i;
      // gather the d² amplitudes of this group
      const amps = [];
      for (let a = 0; a < d; a++) {
        for (let b = 0; b < d; b++) {
          const idx = i0 + a * s1 + b * s2;
          amps.push({ re: re[idx], im: im[idx] });
        }
      }
      // scatter
      for (let a = 0; a < d; a++) {
        for (let b = 0; b < d; b++) {
          const row = U[a * d + b];
          let sr = 0, si = 0;
          for (let m = 0; m < d * d; m++) {
            const ur = row[m].re, ui = row[m].im;
            sr += ur * amps[m].re - ui * amps[m].im;
            si += ur * amps[m].im + ui * amps[m].re;
          }
          const idx = i0 + a * s1 + b * s2;
          nr[idx] = sr; ni[idx] = si;
        }
      }
    }
    this.re = nr; this.im = ni;
    this.gateCount += 1;
    return this;
  }

  /** Exact outcome probabilities over all basis states. */
  probs() {
    const p = new Float64Array(this.N);
    let total = 0;
    for (let i = 0; i < this.N; i++) {
      p[i] = cAbs2({ re: this.re[i], im: this.im[i] });
      total += p[i];
    }
    if (Math.abs(total - 1) > 1e-9) {
      throw new Error(`State normalization broken: Σp = ${total}`);
    }
    return p;
  }

  /** Sample `shots` full-state measurements with the provided RNG. */
  measureAll(shots, rng = Math.random) {
    const p = this.probs();
    const counts = new Array(this.N).fill(0);
    for (let s = 0; s < shots; s++) {
      let r = rng(), acc = 0, idx = this.N - 1;
      for (let i = 0; i < this.N; i++) {
        acc += p[i];
        if (r <= acc) { idx = i; break; }
      }
      counts[idx] += 1;
    }
    return { counts, shots, probs: [...p] };
  }

  /** Format index as qudit digit string |q0 q1 ...>. */
  static fmtIndex(idx, n, d) {
    let s = '';
    for (let k = 0; k < n; k++) {
      const dig = Math.floor(idx / Math.pow(d, n - 1 - k)) % d;
      s += dig;
    }
    return s;
  }
}

/** U†U == I check (tolerance 1e-9) — refuses non-unitary gates. */
export function checkUnitary(U, dim) {
  if (!Array.isArray(U) || U.length !== dim) throw new Error(`Gate matrix must be ${dim}×${dim}`);
  for (const row of U) {
    if (!Array.isArray(row) || row.length !== dim) throw new Error(`Gate matrix must be ${dim}×${dim}`);
  }
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let sr = 0, si = 0;
      for (let k = 0; k < dim; k++) {
        // (U†)ik Ukj = conj(U[k][i]) * U[k][j]
        const a = U[k][i], b = U[k][j];
        sr += a.re * b.re + a.im * b.im;
        si += a.re * b.im - a.im * b.re;
      }
      const expectedI = i === j ? 1 : 0;
      if (Math.abs(sr - expectedI) > 1e-9 || Math.abs(si) > 1e-9) {
        throw new Error(`Gate is not unitary (row ${i}, col ${j}: ${sr.toFixed(6)}+${si.toFixed(6)}i ≠ ${expectedI})`);
      }
    }
  }
}

/** Standard error of a binomial proportion — for finite-shot honesty. */
export function binomialSE(p, shots) {
  return Math.sqrt(Math.max(0, p * (1 - p)) / Math.max(1, shots));
}
