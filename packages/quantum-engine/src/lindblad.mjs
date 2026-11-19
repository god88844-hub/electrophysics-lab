/**
 * Exact density-matrix + Lindblad master-equation solver for 1–6 qubits.
 *
 *   dρ/dt = −(i/ħ)[H(t), ρ] + Σ_k γ_k ( L_k ρ L_k† − ½{L_k†L_k, ρ} )
 *
 * Implementation: ρ stored as dense re/im Float64Arrays of size d×d (d = 2^n
 * ≤ 64). Single-qubit operators and channels are applied through the tensor
 * index trick — O(d²·4) per operator instead of O(d³) — which keeps 1–3
 * qubits comfortably real-time and 6 qubits viable in offline experiments.
 *
 * Noise channels and device parameters are supplied by callers from
 * data/reference-library/04_quantum_hardware_modalities.json (T1/T2, ZZ
 * crosstalk, readout fidelity).
 */

const SQRT1_2 = Math.SQRT1_2;

/** 2×2 complex op as {re:[..], im:[..]} row-major. */
export const OPS = {
  I: { re: [1, 0, 0, 1], im: [0, 0, 0, 0] },
  X: { re: [0, 1, 1, 0], im: [0, 0, 0, 0] },
  Y: { re: [0, 0, 0, 0], im: [0, -1, 1, 0] },
  Z: { re: [1, 0, 0, -1], im: [0, 0, 0, 0] },
  H: { re: [SQRT1_2, SQRT1_2, SQRT1_2, -SQRT1_2], im: [0, 0, 0, 0] },
  S: { re: [1, 0, 0, 0], im: [0, 0, 0, 1] },
  T: { re: [1, 0, 0, SQRT1_2], im: [0, 0, 0, SQRT1_2] },
  sx: { re: [0.5, 0.5, 0.5, 0.5], im: [0, 0, 0, 0] }, // σx/2
  sy: { re: [0, 0, 0, 0], im: [0, -0.5, 0.5, 0] }, // σy/2
  sz: { re: [0.5, 0, 0, -0.5], im: [0, 0, 0, 0] }, // σz/2
  sm: { re: [0, 1, 0, 0], im: [0, 0, 0, 0] }, // σ− (lowering): |0⟩⟨1|
};

/** 2×2 unitary built from an axis rotation: R_axis(θ) = exp(−i θ σ_axis /2). */
export function rotation(axis, theta) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  if (axis === 'x') return { re: [c, -s, -s, c], im: [0, 0, 0, 0] };
  if (axis === 'y') return { re: [c, 0, 0, c], im: [0, -s, s, 0] };
  return { re: [c, 0, 0, c], im: [0, -s, 0, s] };
}

export function conjOp(a) {
  return { re: a.re.slice(), im: a.im.map((v) => -v) };
}

export function dagOp(a) {
  // A† = transpose + conjugate (2×2)
  return {
    re: [a.re[0], a.re[2], a.re[1], a.re[3]],
    im: [-a.im[0], -a.im[2], -a.im[1], -a.im[3]],
  };
}

export class DensityMatrix {
  /**
   * @param {number} nQubits 1..6
   */
  constructor(nQubits, initial = 'zeros') {
    this.n = Math.max(1, Math.min(6, Math.round(nQubits)));
    this.d = 2 ** this.n;
    const N = this.d * this.d;
    this.re = new Float64Array(N);
    this.im = new Float64Array(N);
    if (initial === 'zeros') {
      this.re[0] = 1; // |00…0⟩⟨00…0|
    } else if (initial === 'maxmixed') {
      for (let i = 0; i < this.d; i++) this.re[i * this.d + i] = 1 / this.d;
    } else if (initial && initial.kind === 'computational') {
      const idx = Math.min(this.d - 1, Math.max(0, initial.index | 0));
      this.re[idx * this.d + idx] = 1;
    }
  }

  clone() {
    const c = new DensityMatrix(this.n);
    c.re.set(this.re);
    c.im.set(this.im);
    return c;
  }

  /** Tr(ρ) — must stay 1. */
  trace() {
    let s = 0;
    for (let i = 0; i < this.d; i++) s += this.re[i * this.d + i];
    return s;
  }

  /** Purity Tr(ρ²) ∈ [1/d, 1]. */
  purity() {
    let s = 0;
    const d = this.d;
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        const a = i * d + j;
        const b = j * d + i;
        s += this.re[a] * this.re[b] - this.im[a] * this.im[b];
      }
    }
    return s;
  }

  minEigenApprox() {
    // Gershgorin lower bound on the eigenvalues (positivity check, cheap and
    // conservative): min_i (ρ_ii − Σ_{j≠i} |ρ_ij|).
    let min = Infinity;
    const d = this.d;
    for (let i = 0; i < d; i++) {
      let off = 0;
      for (let j = 0; j < d; j++) {
        if (j === i) continue;
        const a = i * d + j;
        off += Math.hypot(this.re[a], this.im[a]);
      }
      min = Math.min(min, this.re[i * d + i] - off);
    }
    return min;
  }

  /** Bloch vector of qubit k (after tracing out the rest). */
  blochVector(k) {
    const d = this.d;
    const bit = 1 << k;
    // Reduced 2×2 density matrix of qubit k via partial trace: only pairs
    // with matching bits on ALL other qubits contribute.
    const redRe = [[0, 0], [0, 0]];
    const redIm = [[0, 0], [0, 0]];
    for (let i = 0; i < d; i++) {
      const ik = (i & bit) ? 1 : 0;
      for (let j = 0; j < d; j++) {
        if ((i & ~bit) !== (j & ~bit)) continue;
        const jk = (j & bit) ? 1 : 0;
        const a = i * d + j;
        redRe[ik][jk] += this.re[a];
        redIm[ik][jk] += this.im[a];
      }
    }
    return {
      x: redRe[0][1] + redRe[1][0],
      y: redIm[1][0] - redIm[0][1],
      z: redRe[0][0] - redRe[1][1],
    };
  }

  /**
   * Positivity check via Cholesky factorization: ρ ⪰ 0 ⟺ ρ = LL† succeeds.
   * Small negative pivots within `tol` are treated as numerical zero.
   */
  isPositivePSD(tol = 1e-9) {
    const d = this.d;
    const Lre = Array.from({ length: d }, () => new Float64Array(d));
    const Lim = Array.from({ length: d }, () => new Float64Array(d));
    const G = (i, j) => ({ re: this.re[i * d + j], im: this.im[i * d + j] });
    for (let j = 0; j < d; j++) {
      // diagonal pivot
      let s = G(j, j).re; // diagonal is real for Hermitian ρ
      for (let k = 0; k < j; k++) s -= Lre[j][k] ** 2 + Lim[j][k] ** 2;
      if (s < -tol) return false;
      const ljj = Math.sqrt(Math.max(0, s));
      Lre[j][j] = ljj;
      for (let i = j + 1; i < d; i++) {
        let sr = G(i, j).re, si = G(i, j).im;
        for (let k = 0; k < j; k++) {
          // sr -= L[i][k] · conj(L[j][k])
          sr -= Lre[i][k] * Lre[j][k] + Lim[i][k] * Lim[j][k];
          si -= Lim[i][k] * Lre[j][k] - Lre[i][k] * Lim[j][k];
        }
        Lre[i][j] = sr / ljj;
        Lim[i][j] = si / ljj;
      }
    }
    return true;
  }

  /** Population of the |1⟩ state of qubit k. */
  population(k) {
    const d = this.d;
    const bit = 1 << k;
    let p = 0;
    for (let i = 0; i < d; i++) {
      if (!(i & bit)) continue;
      p += this.re[i * d + i];
    }
    return p;
  }

  /** Coherence |ρ_{0,1}^{(k)}| of qubit k between its own |0⟩,|1⟩. */
  coherence(k) {
    const d = this.d;
    const bit = 1 << k;
    let re = 0, im = 0;
    for (let i = 0; i < d; i++) {
      if (i & bit) continue;
      const j = i | bit;
      const a = i * d + j;
      re += this.re[a];
      im += this.im[a];
    }
    return Math.hypot(re, im);
  }

  /** Apply a single-qubit operator A on qubit k (ρ → A ρ A†). */
  applyOp1(k, A) {
    const d = this.d;
    const bit = 1 << k;
    const nRe = new Float64Array(d * d);
    const nIm = new Float64Array(d * d);
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        // ρ'[i][j] = Σ_{a,b} A[i_k][a] ρ[i^ak][j^bk] A*[j_k][b]
        const ik = (i & bit) ? 1 : 0;
        const jk = (j & bit) ? 1 : 0;
        let sr = 0, si = 0;
        for (let a = 0; a < 2; a++) {
          const ii = a === ik ? i : i ^ bit;
          const Aar = A.re[ik * 2 + a];
          const Aai = A.im[ik * 2 + a];
          for (let b = 0; b < 2; b++) {
            const jj = b === jk ? j : j ^ bit;
            const src = ii * d + jj;
            const Acbr = A.re[jk * 2 + b];
            const Acbi = -A.im[jk * 2 + b]; // conjugate
            // complex mult (A[ik][a] · ρ · A*[jk][b])
            const pr = Aar * this.re[src] - Aai * this.im[src];
            const pi = Aar * this.im[src] + Aai * this.re[src];
            sr += pr * Acbr - pi * Acbi;
            si += pr * Acbi + pi * Acbr;
          }
        }
        const dst = i * d + j;
        nRe[dst] = sr;
        nIm[dst] = si;
      }
    }
    this.re = nRe;
    this.im = nIm;
  }

  /** Apply a Kraus channel {L_m} on qubit k: Σ_m L_m ρ L_m†. */
  applyChannel1(k, ops) {
    const accRe = new Float64Array(this.re.length);
    const accIm = new Float64Array(this.im.length);
    for (const L of ops) {
      const tmp = this.clone();
      tmp.applyOp1(k, L);
      for (let i = 0; i < accRe.length; i++) {
        accRe[i] += tmp.re[i];
        accIm[i] += tmp.im[i];
      }
    }
    this.re = accRe;
    this.im = accIm;
  }

  /** T1 amplitude-damping channel on qubit k with rate γ = 1/T1. */
  amplitudeDamping(k, gamma) {
    const p = Math.min(1, gamma);
    const L0 = { re: [1, 0, 0, Math.sqrt(1 - p)], im: [0, 0, 0, 0] };
    const L1 = { re: [0, Math.sqrt(p), 0, 0], im: [0, 0, 0, 0] };
    this.applyChannel1(k, [L0, L1]);
  }

  /** Pure-dephasing channel on qubit k: coherence × (1 − 2γ) form. */
  pureDephasing(k, gamma) {
    const p = Math.min(0.5, gamma);
    const L0 = { re: [Math.sqrt(1 - p), 0, 0, Math.sqrt(1 - p)], im: [0, 0, 0, 0] };
    const L1 = { re: [Math.sqrt(p), 0, 0, -Math.sqrt(p)], im: [0, 0, 0, 0] };
    this.applyChannel1(k, [L0, L1]);
  }

  /** Commutator of a single-qubit Hermitian op A with ρ on qubit k ([A, ρ]). */
  commutatorOp1Into(k, A, outRe, outIm) {
    const d = this.d;
    const bit = 1 << k;
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        const ik = (i & bit) ? 1 : 0;
        const jk = (j & bit) ? 1 : 0;
        // (Aρ)[i][j] = Σ_a A[i_k][a] ρ[i|a][j]
        let lre = 0, lim = 0;
        for (let a = 0; a < 2; a++) {
          const ii = a === ik ? i : i ^ bit;
          const src = ii * d + j;
          const Ar = A.re[ik * 2 + a], Ai = A.im[ik * 2 + a];
          lre += Ar * this.re[src] - Ai * this.im[src];
          lim += Ar * this.im[src] + Ai * this.re[src];
        }
        // (ρA)[i][j] = Σ_b ρ[i][j|b] A[b][j_k]
        let rre = 0, rim = 0;
        for (let b = 0; b < 2; b++) {
          const jj = b === jk ? j : j ^ bit;
          const src = i * d + jj;
          const Br = A.re[b * 2 + jk], Bi = A.im[b * 2 + jk];
          rre += this.re[src] * Br - this.im[src] * Bi;
          rim += this.re[src] * Bi + this.im[src] * Br;
        }
        const dst = i * d + j;
        outRe[dst] = lre - rre;
        outIm[dst] = lim - rim;
      }
    }
  }

  /** Diagonal-Hamiltonian commutator: −i[H_diag, ρ] elementwise phase. */
  diagonalCommutatorInto(diag, outRe, outIm) {
    const d = this.d;
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        const a = i * d + j;
        const dh = diag[i] - diag[j];
        // −i·dh·ρ: (re, im) → (dh·im, −dh·re)
        outRe[a] = dh * this.im[a];
        outIm[a] = -dh * this.re[a];
      }
    }
  }
}

/**
 * Lindblad stepper. Accumulates −(i/ħ)[H,ρ] + dissipators into drho, then
 * advances ρ by an explicit (sub-stepped) Euler — stable at the small
 * timesteps used by the interactive loop.
 */
export class LindbladSim {
  constructor(nQubits, noise = {}) {
    this.n = nQubits;
    this.d = 2 ** nQubits;
    this.rho = new DensityMatrix(nQubits);
    this.drRe = new Float64Array(this.d * this.d);
    this.drIm = new Float64Array(this.d * this.d);
    // noise: {t1: [µs per qubit], t2: [...], tphi: computed}
    this.t1 = noise.t1 ?? Array.from({ length: nQubits }, () => noise.t1All ?? 100);
    this.t2 = noise.t2 ?? Array.from({ length: nQubits }, () => noise.t2All ?? 150);
    this.zzHz = noise.zzHz ?? 0; // ZZ crosstalk between qubit 0 and 1 (Hz)
    this.detuneHz = noise.detuneHz ?? Array.from({ length: nQubits }, () => 0);
  }

  reset(initial = 'zeros') {
    this.rho = new DensityMatrix(this.n, initial);
  }

  /**
   * One step of dt seconds with optional per-qubit drive Hamiltonians.
   *
   * Operator-splitting integrator (exact per part — unconditionally stable):
   *   1. drives: exact single-qubit rotations U = exp(−i·H_drive·dt)
   *   2. diagonal H (ZZ crosstalk + detuning): exact phase factors e^{−i·Δ·dt}
   *   3. dissipators: Kraus maps with p = γ·dt (T1 amplitude damping,
   *      pure dephasing with 1/Tφ = 1/T2 − 1/(2·T1))
   */
  step(dt, drives = []) {
    const { rho, d } = this;
    // 1. Drives → exact rotations. Extract (σx, σy) components per qubit.
    const bx = new Float64Array(this.n);
    const by = new Float64Array(this.n);
    for (const drive of drives) {
      const op = drive.op;
      // H = bx·σx + by·σy: bx = (h01 + h10)/2, by = (h10 − h01)*/2i conventions
      bx[drive.qubit] += (op.re[1] + op.re[2]) / 2;
      by[drive.qubit] += (op.im[2] - op.im[1]) / 2;
    }
    for (let q = 0; q < this.n; q++) {
      const w = Math.hypot(bx[q], by[q]);
      if (w === 0) continue;
      const theta = w * dt; // rotation angle (H = b·σ ⇒ exp(−i b·σ dt) rotates by 2|b|dt… |b|=w)
      void theta;
      const ang = 2 * w * dt;
      const c = Math.cos(ang / 2);
      const s = Math.sin(ang / 2);
      const nx = bx[q] / w;
      const ny = by[q] / w;
      // U = exp(−i·ang/2·(nx σx + ny σy))
      const U = { re: [c, -s * ny, s * ny, c], im: [0, -s * nx, -s * nx, 0] };
      rho.applyOp1(q, U);
    }
    // 2. Diagonal Hamiltonian (ZZ + detuning) → exact phase factors.
    const diag = new Float64Array(d);
    if (this.n >= 2 && this.zzHz !== 0) {
      // H_ZZ = 2π·ζ·|11⟩⟨11| (ζ in Hz) on qubits 0,1
      const w = 2 * Math.PI * this.zzHz;
      diag[3] += w;
    }
    for (let q = 0; q < this.n; q++) {
      const w = 2 * Math.PI * (this.detuneHz[q] ?? 0);
      if (w !== 0) {
        const bit = 1 << q;
        for (let i = 0; i < d; i++) if (i & bit) diag[i] += w;
      }
    }
    let hasDiag = false;
    for (let i = 0; i < d; i++) if (diag[i] !== 0) hasDiag = true;
    if (hasDiag) {
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          const a = i * d + j;
          const ph = (diag[i] - diag[j]) * dt;
          if (ph === 0) continue;
          const c = Math.cos(ph);
          const s = Math.sin(ph);
          const re = rho.re[a], im = rho.im[a];
          rho.re[a] = re * c - im * s;
          rho.im[a] = re * s + im * c;
        }
      }
    }
    // 3. Dissipators via Kraus maps: ρ ← K(ρ) (trace-preserving exactly).
    for (let q = 0; q < this.n; q++) {
      const g1 = 1 / this.t1[q];
      const gphi = Math.max(0, 1 / this.t2[q] - g1 / 2) / 2;
      rho.amplitudeDamping(q, g1 * dt);
      rho.pureDephasing(q, gphi * dt);
    }
    return dt;
  }

  /** Run for a duration with fixed drives. */
  evolve(durationS, dt, drives = []) {
    let t = 0;
    while (t < durationS) {
      const h = Math.min(dt, durationS - t);
      this.step(h, drives);
      t += h;
    }
    return t;
  }

  /** Projective-ish readout with readout error (sampling with the given RNG). */
  measure(rng, readoutFidelity = 1) {
    const d = this.d;
    const probs = new Float64Array(d);
    for (let i = 0; i < d; i++) probs[i] = Math.max(0, this.rho.re[i * d + i]);
    const total = probs.reduce((s, v) => s + v, 0) || 1;
    let r = rng();
    let outcome = 0;
    for (let i = 0; i < d; i++) {
      r -= probs[i] / total;
      if (r <= 0) {
        outcome = i;
        break;
      }
    }
    // readout bit-flip error per qubit
    let measured = outcome;
    for (let q = 0; q < this.n; q++) {
      if (rng() > readoutFidelity) measured ^= 1 << q;
    }
    return { outcome, measured };
  }
}

/**
 * Average gate fidelity of the realized unitary vs the ideal (standard form).
 * @param {number} n matrix size (n×n row-major; Hilbert dimension d = n)
 */
export function averageGateFidelity(realized, ideal, n) {
  let trRe = 0, trIm = 0;
  // Tr(U_ideal† · U_realized) = Σ_ij conj(ideal_ij) · realized_ij
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ir = ideal.re[i * n + j];
      const ii = -ideal.im[i * n + j];
      const ur = realized.re[i * n + j];
      const ui = realized.im[i * n + j];
      trRe += ir * ur - ii * ui;
      trIm += ir * ui + ii * ur;
    }
  }
  const absTr2 = trRe * trRe + trIm * trIm;
  const d = n;
  // F_avg = (|Tr|² + d) / (d(d+1)) — the 04-JSON formula has a denominator
  // typo (d+1); this is the standard correct normalization: F(ideal)=1.
  return (absTr2 + d) / (d * (d + 1));
}

/** Deterministic PRNG (fixed-seed experiments). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
