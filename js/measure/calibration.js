// calibration.js — parameter estimation engine (Phase 3 §5).
//
// Weighted/unweighted nonlinear least squares via Levenberg–Marquardt with
// box bounds, numeric Jacobians, multistart, identifiability diagnostics
// (eigen-decomposition of JᵀJ), covariance estimation over identifiable
// directions, and a complete provenance record.
//
// Honesty rules:
//  - a successful optimization does NOT certify that the parameters are
//    physically meaningful — identifiability is checked and reported;
//  - a single voltage-divider ratio cannot identify two unknown resistors:
//    the engine must detect the deficiency instead of inventing both values;
//  - convergence failure is an explicit result, never a silently returned
//    best-guess;
//  - everything is deterministic under recorded seeds.

import { mulberry32 } from './uq.js';
import { sha256 } from './dataset.js';

/** symmetric eigen-decomposition (Jacobi rotations) of a real symmetric matrix */
export function symmetricEigen(A, { maxSweeps = 100, tol = 1e-12 } = {}) {
  const n = A.length;
  const M = A.map((r) => [...r]);
  let V = identityM(n);
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += M[i][j] * M[i][j];
    if (off < tol) break;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(M[p][q]) < 1e-18) continue;
        const theta = (M[q][q] - M[p][p]) / (2 * M[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const mkp = M[k][p], mkq = M[k][q];
          M[k][p] = c * mkp - s * mkq;
          M[k][q] = s * mkp + c * mkq;
        }
        for (let k = 0; k < n; k++) {
          const mpk = M[p][k], mqk = M[q][k];
          M[p][k] = c * mpk - s * mqk;
          M[q][k] = s * mpk + c * mqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p], vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq;
          V[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const eigenvalues = M.map((row, i) => row[i]);
  return { eigenvalues, eigenvectors: V };
}

function identityM(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}
export function transposeM(A) { return A[0].map((_, j) => A.map((r) => r[j])); }
export function matMulM(A, B) {
  const n = A.length, m = B[0].length, k = B.length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++) for (let p = 0; p < k; p++) {
    const a = A[i][p];
    if (a === 0) continue;
    for (let j = 0; j < m; j++) C[i][j] += a * B[p][j];
  }
  return C;
}

/**
 * Levenberg–Marquardt least squares with box bounds.
 *
 * modelFn(params) -> number[]        predicted outputs at the fixed operating points
 * measurements -> number[]           observed outputs (same order/length)
 * weights -> number[] | null         1/σ each (null = unweighted)
 * lower/upper -> number[]            box bounds (lower[i] <= params[i] <= upper[i])
 *
 * Returns a calibration record (see runCalibration).
 */
export function levenbergMarquardt(modelFn, measurements, p0, {
  lower = null, upper = null, weights = null,
  maxIterations = 200, tolerance = 1e-12, lambda0 = 1e-3,
  jacobianEps = 1e-7, logger = null,
} = {}) {
  const n = p0.length;
  const lo = lower ?? new Array(n).fill(-Infinity);
  const hi = upper ?? new Array(n).fill(Infinity);
  const w = weights ?? new Array(measurements.length).fill(1);
  const w2 = w.map((x) => x * x);

  const residuals = (p) => modelFn(p).map((v, i) => (v - measurements[i]) * w[i]);
  const cost = (p) => residuals(p).reduce((a, r) => a + r * r, 0);
  const clamp = (p) => p.map((v, i) => Math.min(hi[i], Math.max(lo[i], v)));

  let p = clamp([...p0]);
  let r = residuals(p);
  let c = cost(p);
  let lambda = lambda0;
  const trace = [];
  let iterations = 0, converged = false, reason = 'maxIterations reached';

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    // numeric Jacobian of the WEIGHTED residuals (central differences)
    const m = r.length;
    const J = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let j = 0; j < n; j++) {
      const h = jacobianEps * Math.max(1, Math.abs(p[j]));
      const pp = clamp([...p]), pm = clamp([...p]);
      pp[j] = Math.min(hi[j], Math.max(lo[j], p[j] + h));
      pm[j] = Math.min(hi[j], Math.max(lo[j], p[j] - h));
      const rp = residuals(pp), rm = residuals(pm);
      const dh = pp[j] - pm[j] || h;
      for (let i = 0; i < m; i++) J[i][j] = (rp[i] - rm[i]) / dh;
    }
    // LM step: (JᵀJ + λ·diag(JᵀJ)) δ = −Jᵀr
    const Jt = transposeM(J);
    const JtJ = matMulM(Jt, J);
    const Jtr = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let k = 0; k < m; k++) Jtr[i] += Jt[i][k] * r[k];
    const D = JtJ.map((row, i) => row.map((v, j) => (i === j ? v * (1 + lambda) : v)));
    let delta;
    try {
      delta = solveLinear(D, Jtr.map((v) => -v));
    } catch (e) {
      reason = `singular step matrix at iteration ${iter}: ${e.message}`;
      break;
    }
    // relative step limiter: cap each |delta_i| at 50% of |p_i| (or a fraction
    // of the bound span for near-zero params). Prevents the exponential-
    // underflow singularity where an overshooting step drives a parameter to
    // a bound where the Jacobian becomes exactly zero.
    for (let i = 0; i < n; i++) {
      const ref = Math.abs(p[i]) > 0 ? Math.abs(p[i]) : (hi[i] - lo[i]) / 100;
      const maxStep = Math.max(ref * 0.5, 1e-15);
      if (Math.abs(delta[i]) > maxStep) delta[i] = Math.sign(delta[i]) * maxStep;
    }
    const pNew = clamp(p.map((v, i) => v + delta[i]));
    const cNew = cost(pNew);
    trace.push({ iteration: iter, cost: cNew, lambda, maxAbsDelta: Math.max(...delta.map(Math.abs)) });
    if (logger) logger(iter, { c, cNew, delta });
    if (cNew < c) {
      const improvement = c - cNew;
      p = pNew; r = residuals(p); c = cNew;
      lambda = Math.max(lambda / 3, 1e-12);
      if (improvement < tolerance && Math.max(...delta.map(Math.abs)) < tolerance) {
        converged = true;
        reason = `cost improvement ${improvement.toExponential(3)} < tolerance after ${iterations} iterations`;
        break;
      }
    } else {
      lambda *= 5;
      if (lambda > 1e12) { reason = `lambda diverged (> 1e12) at iteration ${iter}`; break; }
    }
  }

  return {
    params: p, residuals: r, cost: c,
    converged, reason, iterations, trace,
    finalLambda: lambda,
  };
}

/** dense linear solve with partial pivoting (throws on singular) */
export function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-14) throw new Error(`singular matrix at column ${col}`);
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col];
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / d;
      if (f === 0) continue;
      for (let c2 = col; c2 <= n; c2++) M[r][c2] -= f * M[col][c2];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let c2 = r + 1; c2 < n; c2++) s -= M[r][c2] * x[c2];
    x[r] = s / M[r][r];
  }
  return x;
}

/**
 * Full calibration run: LM (with optional multistart) + identifiability
 * diagnostics + covariance + confidence intervals + a complete record.
 *
 * options:
 *   multistart: number of additional starts (seeded, sampled within bounds)
 *   confidenceLevel: 0.95 (normal-approximation intervals — documented)
 */
export function runCalibration({ id, modelFn, measurements, p0, lower, upper, weights = null, parameterNames, multistart = 0, seed = 7, confidenceLevel = 0.95, dataset = null, modelId = null, convergenceTolerance = 1e-12, maxIterations = 200 }) {
  if (!Array.isArray(measurements) || measurements.length === 0 || measurements.some(v => typeof v !== 'number' || !Number.isFinite(v))) throw new Error('runCalibration: measurements must be a nonempty array of finite numbers');
  if (!parameterNames || parameterNames.length !== p0.length) {
    throw new Error('runCalibration: parameterNames must match the parameter vector length');
  }
  const n = p0.length;
  const lo = lower ?? new Array(n).fill(-Infinity);
  const hi = upper ?? new Array(n).fill(Infinity);
  const rng = mulberry32(seed);

  // multistart: seeded starts within the bounds
  const starts = [[...p0]];
  for (let s = 0; s < multistart; s++) {
    starts.push(lo.map((loV, i) => loV + rng() * (hi[i] - loV)));
  }

  const runs = starts.map((start, i) => ({
    start,
    ...levenbergMarquardt(modelFn, measurements, start, { lower, upper, weights, tolerance: convergenceTolerance, maxIterations, logger: null }),
    startIndex: i,
  }));
  const best = runs.reduce((bestRun, r) => (r.cost < bestRun.cost ? r : bestRun), runs[0]);

  // identifiability: eigen-decomposition of JᵀJ at the solution
  const measLen = measurements.length;
  const wr = best.residuals;
  const J = (() => {
    const m = wr.length;
    const Jm = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let j = 0; j < n; j++) {
      const h = 1e-7 * Math.max(1, Math.abs(best.params[j]));
      const pp = [...best.params], pm = [...best.params];
      pp[j] += h; pm[j] -= h;
      const rp = modelFn(pp).map((v, i) => (v - measurements[i]) * (weights?.[i] ?? 1));
      const rm = modelFn(pm).map((v, i) => (v - measurements[i]) * (weights?.[i] ?? 1));
      for (let i = 0; i < m; i++) Jm[i][j] = (rp[i] - rm[i]) / (2 * h);
    }
    return Jm;
  })();
  const Jt = transposeM(J);
  const JtJ = matMulM(Jt, J);
  const eig = symmetricEigen(JtJ);
  const lambdaMax = Math.max(...eig.eigenvalues.map((v) => Math.abs(v)));
  const condNumber = lambdaMax / Math.max(1e-300, Math.min(...eig.eigenvalues.map((v) => Math.abs(v))));
  // directions with negligible curvature are non-identifiable from this data
  const identThreshold = lambdaMax * 1e-6; // generous: cond > 1e6 → non-identifiable
  const nonIdentifiable = eig.eigenvalues.map((v, i) => ({ v, i })).filter((e) => Math.abs(e.v) < identThreshold);

  // covariance over identifiable directions: σ² (JᵀJ)⁻¹, σ² = SSR/(m−n)
  const dof = Math.max(1, measLen - n);
  const s2 = best.cost / dof;
  const eigInv = eig.eigenvalues.map((v) => (Math.abs(v) > identThreshold ? 1 / v : 0));
  const cov = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        if (eigInv[k] === 0) continue;
        sum += eig.eigenvectors[i][k] * eig.eigenvectors[j][k] * eigInv[k];
      }
      cov[i][j] = s2 * sum;
    }
  }
  const paramCov = cov.map((row, i) => row.map((v, j) => v));
  const identifiable = nonIdentifiable.length === 0;
  const z = 1.959963984540054; // normal approximation for 95% (documented)
  const confidenceIntervals = parameterNames.map((name, i) => {
    const sd = Math.sqrt(Math.max(0, cov[i][i]));
    const nonId = !identifiable || sd === 0 || !Number.isFinite(sd);
    return {
      parameter: name,
      estimate: best.params[i],
      stdError: nonId ? null : sd,
      interval: nonId ? null : { lo: best.params[i] - z * sd, hi: best.params[i] + z * sd },
      identifiable: !nonId,
      note: nonId ? 'not identifiable from this dataset (near-zero curvature in some direction) — no confidence interval is reported rather than an invented one' : null,
    };
  });

  // residual analysis
  const residualAnalysis = {
    count: wr.length,
    rms: Math.sqrt(wr.reduce((a, r) => a + r * r, 0) / wr.length),
    bias: wr.reduce((a, r) => a + r, 0) / wr.length,
    maxAbs: Math.max(...wr.map(Math.abs)),
  };

  return {
    id,
    converged: best.converged,
    convergence: { reason: best.reason, iterations: best.iterations, finalCost: best.cost, finalLambda: best.finalLambda, multistartRuns: runs.map((r) => ({ startIndex: r.startIndex, cost: r.cost, converged: r.converged })) },
    params: { names: parameterNames, values: best.params, units: null },
    start: p0,
    bounds: { lower: lo, upper: hi },
    weightsUsed: weights !== null,
    identifiability: {
      conditionNumber: condNumber,
      identifiable,
      nonIdentifiableDirections: nonIdentifiable.length,
      eigenvalues: eig.eigenvalues,
      note: identifiable
        ? 'all parameter directions have non-negligible curvature'
        : 'near-zero curvature in some direction(s): these parameter combinations cannot be determined from this dataset — no confidence intervals are reported for them',
    },
    covariance: paramCov,
    confidenceIntervals,
    confidenceLevel,
    intervalMethod: 'normal approximation (z = 1.96); exact Student-t quantiles are future work — recorded as a limitation',
    residualAnalysis,
    measurementSha256: sha256(JSON.stringify(measurements)),
    dataset: dataset ? structuredClone(dataset) : null,
    modelId,
    modelVersion: null, // caller fills if applicable
    generatedAt: new Date().toISOString(),
  };
}
