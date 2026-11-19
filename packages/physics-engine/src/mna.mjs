/**
 * Modified Nodal Analysis (MNA) DC solver with nonlinear devices.
 *
 * Linear devices are stamped exactly; MOSFETs use the Shichman–Hodges
 * square-law model with channel-length modulation and a numeric Jacobian
 * (immune to hand-derived stamp bugs), damped Newton with an adaptive step
 * limiter, and source-stepping homotopy — the same proven convergence scheme
 * as the platform's chip lab engine (js/labs/chip/engine.mjs).
 *
 * Parameters (vth, KP, lambda, sheet resistances) are supplied by callers from
 * data/reference-library/02_semiconductor_pdk_silicon.json — the engine itself
 * is parameter-pure and dependency-free.
 */

const GMIN_DEFAULT = 1e-12;

/**
 * Create a netlist. `nodeNames[0]` is the ground reference (V = 0).
 * @param {string[]} nodeNames
 */
export function createNetlist(nodeNames) {
  const index = new Map(nodeNames.map((n, i) => [n, i]));
  return {
    nodeNames,
    nodeIndex: index,
    nNodes: nodeNames.length,
    elements: [],
    /** @param {{a: string, b: string, R: number}} p */
    addResistor(p) {
      this.elements.push({ kind: 'R', a: index.get(p.a), b: index.get(p.b), R: p.R, label: p.label ?? `R${this.elements.length}` });
    },
    /** Voltage source; branch current positive flowing a→source→b. */
    addVSource(p) {
      this.elements.push({ kind: 'V', a: index.get(p.a), b: index.get(p.b), V: p.V, label: p.label ?? `V${this.elements.length}` });
    },
    addISource(p) {
      this.elements.push({ kind: 'I', a: index.get(p.a), b: index.get(p.b), I: p.I, label: p.label ?? `I${this.elements.length}` });
    },
    /**
     * MOSFET (3-terminal, bulk tied to source).
     * type 'n' | 'p'; vth signed (n: +, p: −); KP = µ·Cox·W/L in A/V²; lambda 1/V.
     */
    addMosfet(p) {
      this.elements.push({
        kind: 'Q',
        type: p.type,
        g: index.get(p.g),
        d: index.get(p.d),
        s: index.get(p.s),
        vth: p.vth,
        kp: p.kp,
        lambda: p.lambda ?? 0,
        label: p.label ?? `M${this.elements.length}`,
        /** runtime fault state: gate-source short (oxide breakdown) */
        gateShorted: false,
        gateShortR: p.gateShortR ?? 1.0,
      });
    },
    mosfet(label) {
      return this.elements.find((e) => e.kind === 'Q' && e.label === label);
    },
    resistor(label) {
      return this.elements.find((e) => e.kind === 'R' && e.label === label);
    },
  };
}

/**
 * Square-law MOSFET with symmetric drain/source roles (SPICE-style): when the
 * assigned drain/source reverse, the terminals swap roles so the model is
 * continuous everywhere — no Newton oscillation across the reverse boundary.
 *
 * Returns the channel current i and which physical terminal it ENTERS at:
 *   i > 0 enters at the drain when inIsDrain, else at the source.
 * (NMOS conducts drain→source; PMOS conducts source→drain; reversed
 *  operation swaps the roles, keeping the model continuous.)
 */
export function mosfetOperatingPoint(q, vg, vd, vs) {
  const core = (vgE, vdE, vsE) => {
    const vthAbs = q.type === 'n' ? q.vth : -q.vth;
    const drive = q.type === 'n' ? vgE - vsE - vthAbs : vsE - vgE - vthAbs;
    const vds = q.type === 'n' ? vdE - vsE : vsE - vdE;
    if (drive <= 0) return 0;
    if (vds >= drive) return 0.5 * q.kp * drive * drive * (1 + q.lambda * vds);
    return q.kp * (drive * vds - 0.5 * vds * vds) * (1 + q.lambda * vds);
  };
  if (q.type === 'n') {
    if (vd >= vs) return { i: core(vg, vd, vs), inIsDrain: true };
    return { i: core(vg, vs, vd), inIsDrain: false };
  }
  if (vs >= vd) return { i: core(vg, vd, vs), inIsDrain: false };
  return { i: core(vg, vs, vd), inIsDrain: true };
}

/** Legacy single-number API: current entering the drain terminal (NMOS) / source terminal (PMOS). */
export function mosfetCurrent(q, vg, vd, vs) {
  return mosfetOperatingPoint(q, vg, vd, vs).i;
}

function buildResidual(netlist, srcScale) {
  const { nNodes, elements } = netlist;
  const vSources = elements.filter((e) => e.kind === 'V');
  const m = vSources.length;
  /**
   * x = [v1..v_{n-1}, i_V1..i_Vm]; ground v0 = 0 fixed.
   * Residual: KCL at each non-ground node + branch equations.
   * @param {Float64Array} x
   * @param {Float64Array} out
   */
  return function residual(x, out) {
    out.fill(0);
    const v = (idx) => (idx === 0 ? 0 : x[idx - 1]);
    const branchI = new Map();
    {
      let k = 0;
      for (const e of elements) {
        if (e.kind === 'V') branchI.set(e.label, x[nNodes - 1 + k++]);
      }
    }
    for (const e of elements) {
      if (e.kind === 'R') {
        const i = (v(e.a) - v(e.b)) / e.R;
        if (e.a !== 0) out[e.a - 1] += i;
        if (e.b !== 0) out[e.b - 1] -= i;
      } else if (e.kind === 'V') {
        const i = branchI.get(e.label);
        if (e.a !== 0) out[e.a - 1] += i;
        if (e.b !== 0) out[e.b - 1] -= i;
        const k = vSources.indexOf(e);
        out[nNodes - 1 + k] = v(e.a) - v(e.b) - e.V * srcScale;
      } else if (e.kind === 'I') {
        const i = e.I * srcScale;
        // Current source pushes i from a to b through the element.
        if (e.a !== 0) out[e.a - 1] -= i;
        if (e.b !== 0) out[e.b - 1] += i;
      } else if (e.kind === 'Q') {
        const vg = v(e.g);
        const vd = v(e.d);
        const vs = v(e.s);
        if (e.gateShorted) {
          // Permanent oxide-breakdown fault: gate tied to source through R.
          const i = (vg - vs) / e.gateShortR;
          if (e.g !== 0) out[e.g - 1] += i;
          if (e.s !== 0) out[e.s - 1] -= i;
        }
        const op = mosfetOperatingPoint(e, vg, vd, vs);
        // Current enters the device at the in-terminal, exits at the other.
        const inIdx = op.inIsDrain ? e.d : e.s;
        const outIdx = op.inIsDrain ? e.s : e.d;
        if (inIdx !== 0) out[inIdx - 1] += op.i;
        if (outIdx !== 0) out[outIdx - 1] -= op.i;
      }
    }
    return m;
  };
}

function solveLinearSystem(A, b, n) {
  // Gaussian elimination with partial row pivoting. Row swaps do not reorder
  // unknowns, so back-substitution addresses them directly.
  const U = A.map((row) => Float64Array.from(row));
  const y = Float64Array.from(b);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(U[r][col]) > Math.abs(U[piv][col])) piv = r;
    }
    if (Math.abs(U[piv][col]) < 1e-300) continue; // singular row — leave (gmin prevents this)
    if (piv !== col) {
      const t = U[piv];
      U[piv] = U[col];
      U[col] = t;
      const tb = y[piv];
      y[piv] = y[col];
      y[col] = tb;
    }
    const d = U[col][col];
    for (let r = col + 1; r < n; r++) {
      const f = U[r][col] / d;
      if (f === 0) continue;
      for (let c = col; c < n; c++) U[r][c] -= f * U[col][c];
      y[r] -= f * y[col];
    }
  }
  const sol = new Float64Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = y[r];
    for (let c = r + 1; c < n; c++) s -= U[r][c] * sol[c];
    const d = U[r][r];
    sol[r] = Math.abs(d) < 1e-300 ? 0 : s / d;
  }
  return sol;
}

/**
 * Solve the DC operating point.
 * @returns {{converged: boolean, iterations: number, x: Float64Array,
 *            nodeVoltages: number[], branchCurrents: number[], devicePower: Record<string, number>}}
 */
export function solveDC(netlist, options = {}) {
  const gmin = options.gmin ?? GMIN_DEFAULT;
  const { nNodes, elements } = netlist;
  const vSources = elements.filter((e) => e.kind === 'V');
  const m = vSources.length;
  const n = nNodes - 1 + m;

  const maxSteps = options.maxNewtonSteps ?? 60;
  const maxStep = options.maxStep ?? 1.0;
  const tol = options.tolerance ?? 1e-9;
  const srcSteps = options.sourceStepping ?? true;

  // Initial guess: all node voltages at the first source value (helps MOSFET start).
  let x = new Float64Array(n);
  if (vSources.length > 0) {
    const v0 = vSources[0].V;
    for (let i = 0; i < nNodes - 1; i++) x[i] = v0;
  }

  let converged = false;
  let iterations = 0;
  const F = new Float64Array(n);
  const F2 = new Float64Array(n);
  const J = Array.from({ length: n }, () => new Float64Array(n));

  const scales = srcSteps ? [0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0] : [1.0];

  /** One Newton loop at a given source scale and gmin (gmin baked into residual). */
  function newtonLoop(resRaw, gminNow) {
    const res = (xx, out) => {
      resRaw(xx, out);
      for (let i = 0; i < nNodes - 1; i++) out[i] += gminNow * xx[i];
    };
    for (let it = 0; it < maxSteps; it++) {
      iterations++;
      res(x, F);
      let norm = 0;
      for (let i = 0; i < n; i++) norm = Math.max(norm, Math.abs(F[i]));
      if (norm < tol) return true;
      // Numeric Jacobian (forward differences), consistent with the residual.
      for (let j = 0; j < n; j++) {
        const h = Math.max(1e-7, Math.abs(x[j]) * 1e-7);
        const orig = x[j];
        x[j] = orig + h;
        res(x, F2);
        x[j] = orig;
        for (let i = 0; i < n; i++) J[i][j] = (F2[i] - F[i]) / h;
      }
      // Damped Newton step with adaptive limiter.
      const dx = solveLinearSystem(J, F, n);
      let worst = 0;
      for (let i = 0; i < nNodes - 1; i++) worst = Math.max(worst, Math.abs(dx[i]));
      const t = worst > maxStep ? maxStep / worst : 1;
      for (let i = 0; i < n; i++) x[i] -= t * dx[i];
      if (t < 0.02 && worst > 1e3) return false;
    }
    res(x, F);
    let norm = 0;
    for (let i = 0; i < n; i++) norm = Math.max(norm, Math.abs(F[i]));
    return norm < tol;
  }

  for (const scale of scales) {
    const res = buildResidual(netlist, scale);
    converged = newtonLoop(res, gmin);
    if (!converged && scale === scales[scales.length - 1]) {
      converged = newtonLoop(res, gmin * 1e3); // gmin escalation fallback
    }
  }

  // Extract solution + device operating point.
  const nodeVoltages = [0];
  for (let i = 0; i < nNodes - 1; i++) nodeVoltages.push(x[i]);
  const branchCurrents = [];
  for (let k = 0; k < m; k++) branchCurrents.push(x[nNodes - 1 + k]);

  const devicePower = {};
  const deviceCurrents = {};
  const v = (idx) => nodeVoltages[idx];
  for (const e of elements) {
    if (e.kind === 'R') {
      const i = (v(e.a) - v(e.b)) / e.R;
      deviceCurrents[e.label] = i;
      devicePower[e.label] = i * (v(e.a) - v(e.b));
    } else if (e.kind === 'Q') {
      const op = mosfetOperatingPoint(e, v(e.g), v(e.d), v(e.s));
      const vIn = op.inIsDrain ? v(e.d) : v(e.s);
      const vOut = op.inIsDrain ? v(e.s) : v(e.d);
      deviceCurrents[e.label] = op.i;
      devicePower[e.label] = op.i * (vIn - vOut);
      devicePower[`${e.label}.vgs`] = e.type === 'n' ? v(e.g) - vOut : vIn - v(e.g);
      devicePower[`${e.label}.vds`] = vIn - vOut;
    } else if (e.kind === 'V') {
      const k = vSources.indexOf(e);
      deviceCurrents[e.label] = branchCurrents[k];
      devicePower[e.label] = -branchCurrents[k] * (v(e.a) - v(e.b)); // negative = delivering
    }
  }

  return { converged, iterations, x, nodeVoltages, branchCurrents, devicePower, deviceCurrents };
}
