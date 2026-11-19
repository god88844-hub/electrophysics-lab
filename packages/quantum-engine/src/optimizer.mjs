/**
 * Fixed-seed numerical optimizers for the AI Co-Inventor: SPSA (Spall-style
 * simultaneous perturbation) and Nelder–Mead. Deterministic via mulberry32 —
 * identical seeds reproduce identical optimization traces.
 */

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

/**
 * SPSA minimize.
 * @param {function(number[]): number} f objective (× to minimize)
 * @param {number[]} x0 initial parameters
 * @param {object} opts {iterations, a, c, seed, bounds: [[lo,hi],...]}
 * @returns {{x: number[], history: Array<{k: number, best: number}>, calls: number}}
 */
export function spsa(f, x0, opts = {}) {
  const { iterations = 40, a = 0.12, c = 0.06, seed = 42, bounds = null } = opts;
  const rng = mulberry32(seed);
  const n = x0.length;
  let x = x0.slice();
  const clamp = (v, i) => {
    if (!bounds) return v;
    const [lo, hi] = bounds[i];
    return Math.max(lo, Math.min(hi, v));
  };
  for (let i = 0; i < n; i++) x[i] = clamp(x[i], i);
  const history = [{ k: 0, best: f(x) }];
  let calls = 1;
  for (let k = 1; k <= iterations; k++) {
    const ak = a / Math.pow(k + 8, 0.602);
    const ck = c / Math.pow(k, 0.101);
    const delta = Array.from({ length: n }, () => (rng() < 0.5 ? -1 : 1));
    const xPlus = x.map((v, i) => clamp(v + ck * delta[i], i));
    const xMinus = x.map((v, i) => clamp(v - ck * delta[i], i));
    const fP = f(xPlus);
    const fM = f(xMinus);
    calls += 2;
    for (let i = 0; i < n; i++) {
      const gh = (fP - fM) / (2 * ck * delta[i]);
      x[i] = clamp(x[i] - ak * gh, i);
    }
    history.push({ k, best: Math.min(fP, fM) });
  }
  return { x, history, calls };
}

/** Nelder–Mead minimize (bounded). */
export function nelderMead(f, x0, opts = {}) {
  const { iterations = 120, bounds = null } = opts;
  const n = x0.length;
  const clamp = (v, i) => {
    if (!bounds) return v;
    const [lo, hi] = bounds[i];
    return Math.max(lo, Math.min(hi, v));
  };
  // Simplex with n+1 vertices
  const simplex = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const v = x0.slice();
    v[i] = clamp(v[i] + 0.12 * (Math.abs(x0[i]) + 0.12), i);
    simplex.push(v);
  }
  let values = simplex.map((v) => f(v));
  let calls = simplex.length;
  for (let it = 0; it < iterations; it++) {
    const order = simplex.map((_, i) => i).sort((i, j) => values[i] - values[j]);
    const best = order[0];
    const worst = order[n];
    const secondWorst = order[n - 1];
    const centroid = Array.from({ length: n }, (_, i) => {
      let s = 0;
      for (const idx of order.slice(0, n)) s += simplex[idx][i];
      return s / n;
    });
    // Reflection
    const reflected = centroid.map((c, i) => clamp(c + (c - simplex[worst][i]), i));
    const fR = f(reflected);
    calls++;
    if (fR < values[best]) {
      // Expansion
      const expanded = centroid.map((c, i) => clamp(c + 2 * (c - simplex[worst][i]), i));
      const fE = f(expanded);
      calls++;
      const pick = fE < fR ? expanded : reflected;
      const fPick = Math.min(fE, fR);
      simplex[worst] = pick;
      values[worst] = fPick;
    } else if (fR < values[secondWorst]) {
      simplex[worst] = reflected;
      values[worst] = fR;
    } else {
      // Contraction
      const contracted = centroid.map((c, i) => clamp(c + 0.5 * (simplex[worst][i] - c), i));
      const fC = f(contracted);
      calls++;
      if (fC < values[worst]) {
        simplex[worst] = contracted;
        values[worst] = fC;
      } else {
        // Shrink toward best
        for (let i = 0; i <= n; i++) {
          if (i === best) continue;
          simplex[i] = simplex[i].map((v, j) => clamp((v + simplex[best][j]) / 2, j));
          values[i] = f(simplex[i]);
          calls++;
        }
      }
    }
  }
  let bestIdx = 0;
  for (let i = 1; i <= n; i++) if (values[i] < values[bestIdx]) bestIdx = i;
  return { x: simplex[bestIdx], value: values[bestIdx], calls };
}
