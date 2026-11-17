// uq.js — uncertainty quantification (Phase 3 §7), guided by the JCGM GUM
// framework and JCGM 101 Monte Carlo propagation. Engineering guidance only —
// no formal standards-compliance claim is made.
//
// Distinct uncertainty kinds (never merged silently):
//   measurement / input-parameter / calibration-parameter / numerical-solver /
//   model-form / environmental / random-repeatability / extrapolation.
//
// Independence discipline: first-order combination multiplies covariances
// through Jacobians (correlations handled properly). A blanket RSS across
// sources is only provided when the caller explicitly asserts independence,
// and the assertion is recorded in the result.

/** Cholesky factorization (lower-triangular L with A = L·Lᵀ). null if not SPD. */
export function cholesky(A) {
  const n = A.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = A[i][j];
      for (let k = 0; k < j; k++) sum -= L[i][k] * L[j][k];
      if (i === j) {
        if (sum <= 0) return null; // not positive-definite
        L[i][j] = Math.sqrt(sum);
      } else {
        if (L[j][j] === 0) return null;
        L[i][j] = sum / L[j][j];
      }
    }
  }
  return L;
}

/** Sample one point from N(mu, Sigma) using the Cholesky factor and a seeded RNG. */
export function sampleMultivariateNormal(mu, Sigma, rng) {
  const L = cholesky(Sigma);
  if (!L) throw new Error('covariance matrix is not positive-definite (check correlations and variances)');
  const n = mu.length;
  const z = new Array(n).fill(0).map(() => {
    // Box–Muller with the provided deterministic RNG
    let u1 = rng(), u2 = rng();
    if (u1 < 1e-15) u1 = 1e-15;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  });
  const x = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j <= i; j++) s += L[i][j] * z[j];
    x[i] = mu[i] + s;
  }
  return x;
}

/** numeric Jacobian of f at x (central differences, documented step rule). */
export function jacobian(f, x) {
  const m = f(x).length;
  const n = x.length;
  const J = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const h = 1e-6 * Math.max(1, Math.abs(x[j]));
    const xp = [...x], xm = [...x];
    xp[j] += h; xm[j] -= h;
    const fp = f(xp), fm = f(xm);
    for (let k = 0; k < m; k++) J[k][j] = (fp[k] - fm[k]) / (2 * h);
  }
  return J;
}

/** matrix multiply */
export function matMul(A, B) {
  const n = A.length, m = B[0].length, k = B.length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++) for (let p = 0; p < k; p++) {
    const a = A[i][p];
    if (a === 0) continue;
    for (let j = 0; j < m; j++) C[i][j] += a * B[p][j];
  }
  return C;
}
export function transpose(A) { return A[0].map((_, j) => A.map((r) => r[j])); }
export function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

/**
 * First-order (GUM) uncertainty propagation:
 *   y = f(x),  Cy ≈ Jx · Cx · Jxᵀ   (J = ∂f/∂x at x, numeric)
 * Correlations between the x_i are handled through Cx — never assumed away.
 * Returns { y, Cy, J, note }.
 */
export function propagateFirstOrder(mu, Cx, f) {
  const J = jacobian(f, mu);
  const y = f(mu);
  const Jt = transpose(J);
  const Cy = matMul(matMul(J, Cx), Jt);
  return { y, Cy, J, note: 'first-order (GUM) propagation; valid to the extent f is approximately linear over the combined uncertainty' };
}

/**
 * Monte Carlo propagation (JCGM 101): draw N points from N(mu, Cx) with a
 * seeded RNG, evaluate f at each, and summarize each output component.
 * Returns per-output { mean, std, p025, p975, samples } — reproducible.
 */
export function propagateMonteCarlo(mu, Cx, f, { n = 10000, seed = 42 } = {}) {
  const rng = mulberry32(seed);
  const outs = [];
  for (let i = 0; i < n; i++) {
    const x = sampleMultivariateNormal(mu, Cx, rng);
    outs.push(f(x));
  }
  const m = mu.length ? f(mu).length : 0;
  const summary = [];
  for (let k = 0; k < m; k++) {
    const col = outs.map((o) => o[k]).sort((a, b) => a - b);
    const mean = col.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(col.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
    summary.push({
      mean, std,
      p025: col[Math.floor(0.025 * (n - 1))],
      p975: col[Math.floor(0.975 * (n - 1))],
      samples: col,
    });
  }
  return { n, seed, summary, note: 'Monte Carlo propagation (JCGM 101 style); deterministic under the recorded seed' };
}

/** percentile of a sorted numeric array */
export function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

/** seedable RNG (same family as the rest of the platform) */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Explicit-independence RSS: combine uncertainty contributions ONLY when the
 * caller asserts they are independent (correlation coefficients = 0). The
 * assertion is recorded in the result — silently assuming independence is
 * prohibited by Phase 3 §7.
 */
export function combineIndependent(ucComponents, { independenceAssertion = false, correlations = null } = {}) {
  if (correlations) {
    // full correlated combination: uc = sqrt(ΣΣ ri_ij ui uj)
    const n = ucComponents.length;
    let s = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const r = i === j ? 1 : (correlations[i]?.[j] ?? 0);
        s += r * ucComponents[i] * ucComponents[j];
      }
    }
    return { uc: Math.sqrt(Math.max(0, s)), independenceAssumed: false, correlated: true };
  }
  if (!independenceAssertion) {
    return { uc: NaN, independenceAssumed: false, error: 'refused: no correlation data and no explicit independence assertion — combining uncertainties by RSS without checking assumptions is prohibited' };
  }
  const uc = Math.sqrt(ucComponents.reduce((a, b) => a + b * b, 0));
  return { uc, independenceAssumed: true, note: 'combined by RSS under the caller-recorded assertion that contributions are independent' };
}

/** expanded uncertainty U = k · uc (k stated, default 2 ≈ 95% for normal) */
export function expandedUncertainty(uc, k = 2) {
  return { U: k * uc, k, note: `U = k·uc with k = ${k}; assumes an approximately normal distribution — verify before quoting a coverage probability` };
}

/** nonparametric prediction interval from MC samples at a given level */
export function predictionInterval(sortedSamples, level = 0.95) {
  const lo = percentile(sortedSamples, (1 - level) / 2);
  const hi = percentile(sortedSamples, 1 - (1 - level) / 2);
  return { lo, hi, level };
}

/** bootstrap resampling of a statistic (seeded, with replacement) */
export function bootstrap(data, statistic, { n = 2000, seed = 7, level = 0.95 } = {}) {
  const rng = mulberry32(seed);
  const stats = [];
  for (let b = 0; b < n; b++) {
    const sample = Array.from({ length: data.length }, () => data[Math.floor(rng() * data.length)]);
    stats.push(statistic(sample));
  }
  stats.sort((a, b) => a - b);
  return {
    point: statistic(data),
    interval: { lo: percentile(stats, (1 - level) / 2), hi: percentile(stats, 1 - (1 - level) / 2), level },
    n,
    seed,
  };
}
