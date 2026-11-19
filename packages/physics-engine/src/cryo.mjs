/**
 * Cryogenic mixing-chamber thermal model (dilution refrigerator 15 mK stage).
 *
 *   dT/dt = (Q_load − Q_cool(T)) / C_th
 *
 * Q_cool(T) follows the reference-library equation shape:
 *   below 100 mK: Q_cool ∝ (T/T_c)²  (quadratic dilution cooling, JSON-documented)
 *   100 mK → 4 K: interpolated between the documented stage capacities
 *   above 4 K:    4 K stage capacity
 *
 * Constants from 04_quantum_hardware_modalities.json / 06_failure_physics_thresholds.json:
 *   stage_15mk_w = 0.012, stage_100mk_w = 0.1, stage_4k_w = 1.5
 *
 * C_th is an order-of-magnitude mixing-chamber heat-capacity estimate (5 mJ/K);
 * the JSON documents the ~4 h physical recovery time, which is reported in
 * quench notes rather than simulated as a claim.
 */
export function createCryoStage(opts = {}) {
  const q15 = opts.q15mkW ?? 0.012;
  const q100 = opts.q100mkW ?? 0.1;
  const q4k = opts.q4kW ?? 1.5;
  const cth = opts.cthJPerK ?? 5e-3; // J/K — documented order-of-magnitude estimate
  let tK = opts.initialK ?? 0.015;

  /** Cooling capacity available at stage temperature T (W). */
  function coolingPowerW(T) {
    if (T <= 0.1) {
      // Dilution cooling ∝ (T/100 mK)² (JSON-documented quadratic shape),
      // floored at the 15 mK stage capacity.
      const f = Math.max(T, 1e-6) / 0.1;
      return Math.max(q15, q100 * f * f);
    }
    if (T <= 4) return q100 + ((q4k - q100) * (T - 0.1)) / 3.9;
    return q4k;
  }

  return {
    get tempK() {
      return tK;
    },
    set tempK(v) {
      tK = Math.max(0.005, v);
    },
    coolingPowerW() {
      return coolingPowerW(tK);
    },
  /** Advance the ODE one wall-clock step (adaptive substepping for stability). */
  step(dtSec, loadW) {
    // Explicit Euler is stable when dt < τ = C_th / (dQ_cool/dT).
    const slope = (T) => {
      if (T <= 0.1) {
        const f = Math.max(T, 1e-6) / 0.1;
        return (2 * q100 * f) / 0.1;
      }
      if (T <= 4) return (q4k - q100) / 3.9;
      return 0;
    };
    const tau = cth / Math.max(slope(tK), 1e-9);
    const dtSub = 0.4 * tau;
    const n = Math.max(1, Math.ceil(dtSec / dtSub));
    const h = dtSec / n;
    let net = 0;
    for (let i = 0; i < n; i++) {
      const qc = coolingPowerW(tK);
      net = loadW - qc;
      tK = Math.max(0.005, tK + (net / cth) * h);
    }
    return { tempK: tK, netW: net };
  },
  };
}
