/**
 * 2D Fourier heat-diffusion PDE solver (explicit FTCS with adaptive
 * sub-stepping for stability):
 *
 *   ρ·c_p · ∂T/∂t = k·∇²T + q·(x,y,t) − h·(T − T_amb)
 *
 * Material constants (k, ρ, c_p) are supplied by callers from
 * data/reference-library/02_semiconductor_pdk_silicon.json.
 */

/**
 * @param {object} spec
 * @param {number} spec.nx grid columns
 * @param {number} spec.ny grid rows
 * @param {number} spec.dxM cell size in metres (square cells)
 * @param {number} spec.k thermal conductivity W/(m·K)
 * @param {number} spec.rhoC volumetric heat capacity J/(m³·K) (ρ·c_p)
 * @param {number} spec.thicknessM plate thickness in metres (for source/convection scaling)
 * @param {number} spec.ambientK
 * @param {number} spec.hConvWm2K convection coefficient W/(m²·K) (0 = none)
 */
export function createHeatGrid(spec) {
  const { nx, ny, dxM, k, rhoC, thicknessM, ambientK, hConvWm2K } = spec;
  const N = nx * ny;
  const T = new Float64Array(N).fill(ambientK);
  const Tn = new Float64Array(N);
  const alpha = k / rhoC; // m²/s thermal diffusivity (thickness cancels in-plane)
  // FTCS 2D stability: Δt ≤ dx²/(4α)
  const dtStable = (dxM * dxM) / (4 * alpha);
  const cellArea = dxM * dxM;
  const cellVolume = cellArea * thicknessM;
  const heatCapacityPerCell = rhoC * cellVolume; // J/K

  /**
   * Advance one wall-clock step, sub-stepping for stability.
   * @param {number} dt wall-clock seconds
   * @param {Float64Array|null} powerW per-cell dissipated power in W (or null)
   * @returns {{substeps: number, maxT: number}}
   */
  function step(dt, powerW) {
    const substeps = Math.max(1, Math.ceil(dt / dtStable));
    const h = dt / substeps;
    for (let s = 0; s < substeps; s++) {
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const i = y * nx + x;
          // Dirichlet edges pinned at ambient (heat spreads into the bulk).
          if (x === 0 || y === 0 || x === nx - 1 || y === ny - 1) {
            Tn[i] = ambientK;
            continue;
          }
          const lap =
            (T[i - 1] - 2 * T[i] + T[i + 1]) / (dxM * dxM) +
            (T[i - nx] - 2 * T[i] + T[i + nx]) / (dxM * dxM);
          const source = powerW ? powerW[i] : 0;
          const conv = hConvWm2K * cellArea * (ambientK - T[i]); // W
          const dT = (h / heatCapacityPerCell) * (k * thicknessM * cellArea * lap + source + conv);
          Tn[i] = T[i] + dT;
        }
      }
      T.set(Tn);
    }
    let maxT = -Infinity;
    for (let i = 0; i < N; i++) if (T[i] > maxT) maxT = T[i];
    return { substeps, maxT };
  }

  /** Inject power at a grid position (bilinear-ish: nearest cell). */
  function addPowerAt(xNorm, yNorm, watts, powerW) {
    const cx = Math.min(nx - 2, Math.max(1, Math.round(xNorm * (nx - 1))));
    const cy = Math.min(ny - 2, Math.max(1, Math.round(yNorm * (ny - 1))));
    powerW[cy * nx + cx] += watts;
  }

  function tempAt(xNorm, yNorm) {
    const cx = Math.min(nx - 1, Math.max(0, Math.round(xNorm * (nx - 1))));
    const cy = Math.min(ny - 1, Math.max(0, Math.round(yNorm * (ny - 1))));
    return T[cy * nx + cx];
  }

  return { T, step, addPowerAt, tempAt, dtStable, nx, ny, ambientK, get maxT() { let m = -Infinity; for (let i = 0; i < N; i++) if (T[i] > m) m = T[i]; return m; } };
}

/**
 * Temperature-dependent resistance (PTCR from 02 JSON):
 * R(T) = R0 · (1 + α·(T − T0)), T in K.
 */
export function resistanceAtTemp(R0, alphaPerK, tempK, refK = 300) {
  return R0 * (1 + alphaPerK * (tempK - refK));
}
