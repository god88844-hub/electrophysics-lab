// compare.js — quantitative comparison utilities for the benchmark harness.
// Every function returns explicit metrics; tolerances are always supplied by
// the benchmark case and must be justified there (no global magic percentage).
// NaN/Infinity in any operand is treated as invalid data, never as a pass.

const NEAR_ZERO_FLOOR = 1e-12; // relative-error floor for reference values near 0

export function finite(...vals) {
  return vals.every((v) => typeof v === 'number' && Number.isFinite(v));
}

/** absolute error |actual - reference| */
export function absErr(actual, reference) {
  return Math.abs(actual - reference);
}

/**
 * Relative error with safe near-zero handling:
 *   |a - r| / max(|r|, floor)
 * The floor prevents blow-up when the reference is ~0; it is documented
 * per benchmark via the `floor` argument (default 1e-12).
 */
export function relErr(actual, reference, floor = NEAR_ZERO_FLOOR) {
  return Math.abs(actual - reference) / Math.max(Math.abs(reference), floor);
}

/** max |a - r| over paired series (throws on length mismatch) */
export function maxAbsErr(actualSeries, referenceSeries) {
  if (actualSeries.length !== referenceSeries.length) {
    throw new Error(`series length mismatch: ${actualSeries.length} vs ${referenceSeries.length}`);
  }
  let m = 0;
  for (let i = 0; i < actualSeries.length; i++) {
    if (!finite(actualSeries[i], referenceSeries[i])) return NaN;
    m = Math.max(m, Math.abs(actualSeries[i] - referenceSeries[i]));
  }
  return m;
}

/** RMS error over paired series */
export function rmsErr(actualSeries, referenceSeries) {
  if (actualSeries.length !== referenceSeries.length) {
    throw new Error(`series length mismatch: ${actualSeries.length} vs ${referenceSeries.length}`);
  }
  let s = 0;
  for (let i = 0; i < actualSeries.length; i++) {
    if (!finite(actualSeries[i], referenceSeries[i])) return NaN;
    s += (actualSeries[i] - referenceSeries[i]) ** 2;
  }
  return Math.sqrt(s / actualSeries.length);
}

/** wrap an angle in degrees into (-180, 180] */
export function wrapDeg(deg) {
  let d = deg % 360;
  if (d <= -180) d += 360;
  if (d > 180) d -= 360;
  return d;
}

/** phase error in degrees, wrapped to (-180, 180] */
export function phaseErrDeg(p1, p2) {
  return Math.abs(wrapDeg(p1 - p2));
}

/** linear interpolation of y(x) on a sorted (x, y) series */
export function interpolate(series, x) {
  // series: [{x, y}] sorted by x
  if (series.length === 0) return NaN;
  if (x <= series[0].x) return series[0].y;
  if (x >= series[series.length - 1].x) return series[series.length - 1].y;
  let lo = 0, hi = series.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (series[mid].x <= x) lo = mid; else hi = mid;
  }
  const a = series[lo], b = series[hi];
  const t = (x - a.x) / (b.x - a.x || 1);
  return a.y + t * (b.y - a.y);
}

/**
 * Compare two complex amplitude vectors up to GLOBAL PHASE — a physically
 * irrelevant degree of freedom. Returns the global phase found (degrees) and
 * the max |amplitude| error after normalization, so callers can report both.
 * Vectors: [{re, im}] of equal length.
 */
export function compareUpToGlobalPhase(a, b, eps = 1e-9) {
  if (a.length !== b.length) throw new Error(`amplitude vector length mismatch: ${a.length} vs ${b.length}`);
  // choose reference index = largest |b| amplitude
  let idx = 0, best = -1;
  for (let i = 0; i < b.length; i++) {
    const m = b[i].re * b[i].re + b[i].im * b[i].im;
    if (m > best) { best = m; idx = i; }
  }
  if (best < eps * eps) return { globalPhaseDeg: 0, maxErr: NaN, note: 'reference vector is ~zero' };
  // phi = arg(a[idx]) - arg(b[idx]); multiply b by e^{i phi}
  const phi = Math.atan2(a[idx].im, a[idx].re) - Math.atan2(b[idx].im, b[idx].re);
  const c = Math.cos(phi), s = Math.sin(phi);
  let maxErr = 0;
  for (let i = 0; i < a.length; i++) {
    if (!finite(a[i].re, a[i].im, b[i].re, b[i].im)) return { globalPhaseDeg: phi * 180 / Math.PI, maxErr: NaN };
    const br = b[i].re * c - b[i].im * s;
    const bi = b[i].re * s + b[i].im * c;
    maxErr = Math.max(maxErr, Math.hypot(a[i].re - br, a[i].im - bi));
  }
  return {
    globalPhaseDeg: wrapDeg(phi * 180 / Math.PI),
    maxErr,
    normalizedVector: a.map((x, i) => ({
      re: x.re,
      im: x.im,
      refRe: b[i].re * c - b[i].im * s,
      refIm: b[i].re * s + b[i].im * c,
    })),
  };
}

/**
 * A single numeric comparison against a tolerance.
 * tol: { abs?, rel?, floor? } — at least one limit required; the verdict is
 * pass iff EVERY provided limit is satisfied. Metrics are recorded so the
 * report shows the actual numbers, not just pass/fail.
 */
export function numCheck(name, actual, reference, tol) {
  if (!finite(actual, reference)) {
    return { name, verdict: 'fail', actual, reference, tol, note: 'non-finite value (NaN/Infinity) in comparison' };
  }
  if (!tol || (tol.abs === undefined && tol.rel === undefined)) {
    return { name, verdict: 'inconclusive', actual, reference, tol, note: 'no tolerance supplied — comparison is not evidence' };
  }
  const a = absErr(actual, reference);
  const r = relErr(actual, reference, tol.floor);
  const okA = tol.abs === undefined ? true : a <= tol.abs;
  const okR = tol.rel === undefined ? true : r <= tol.rel;
  return {
    name, verdict: okA && okR ? 'pass' : 'fail',
    actual, reference, tol,
    metrics: { absErr: a, relErr: r },
  };
}

/** series-level check: {maxAbs?, rms?} limits over paired series */
export function seriesCheck(name, actualSeries, referenceSeries, tol) {
  if (!tol || (tol.maxAbs === undefined && tol.rms === undefined)) {
    return { name, verdict: 'inconclusive', tol, note: 'no series tolerance supplied' };
  }
  const max = maxAbsErr(actualSeries, referenceSeries);
  const rms = rmsErr(actualSeries, referenceSeries);
  if (!finite(max, rms)) {
    return { name, verdict: 'fail', tol, metrics: { maxAbsErr: max, rmsErr: rms }, note: 'non-finite value in series' };
  }
  const okMax = tol.maxAbs === undefined ? true : max <= tol.maxAbs;
  const okRms = tol.rms === undefined ? true : rms <= tol.rms;
  return {
    name, verdict: okMax && okRms ? 'pass' : 'fail',
    tol, metrics: { maxAbsErr: max, rmsErr: rms },
  };
}

/** phase check with wrapping */
export function phaseCheck(name, actualDeg, referenceDeg, maxDeg) {
  if (!finite(actualDeg, referenceDeg)) {
    return { name, verdict: 'fail', actual: actualDeg, reference: referenceDeg, note: 'non-finite phase' };
  }
  const err = phaseErrDeg(actualDeg, referenceDeg);
  return { name, verdict: err <= maxDeg ? 'pass' : 'fail', actual: actualDeg, reference: referenceDeg, metrics: { phaseErrDeg: err }, tol: { maxDeg } };
}
