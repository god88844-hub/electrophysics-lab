# Phase 46 — Dimensionless fan affinity without an invented fan

**Implemented software only.** An actual fan/impeller has not been selected, its manufacturer rated speed and safe shaft retention are unknown, and it has no authenticated flow, pressure, power, torque or system-resistance curve.

## Established physics

The [ASHRAE Handbook, Chapter 21 Fans](https://handbook.ashrae.org/Handbooks/S24/SI/s24_ch21/S24_Ch21_si.aspx) describes fan laws for given conditions and similarity assumptions. [AMCA's fan curve explanation](https://www.amca.org/educate/articles-and-technical-papers/amca-inmotion-articles/straightening-out-fan-curves.html) explains why an actual pressure-flow characteristic matters.

For the *same* impeller with the *same* aerodynamic regime and fluid density, ideal speed ratio `r = N/Nref` yields airflow scaling `r`, fan pressure `r²`, shaft power `r³`, and torque `r²`. The illustrative `Nref=1000 rpm` is **only a coordinate of a dimensionless mathematical example**, not a validated operating speed or safe rating. At 500/1000/1500 rpm the normalized power is 0.125/1/3.375. The software deliberately outputs null for **absolute** airflow (m³/s), pressure (Pa), shaft power (W), torque (Nm) and safe impeller speed.

These ideal affinity relationships **do not** establish airflow from RPM alone, identify the fan's geometry/coefficients, certify mechanical containment, or provide an electric motor coupling load constant. Phase47's illustrative torque coefficient is a separate hypothetical value, not obtained from this source or certified as fan data.

## Scope checks

`benchmarks/phase46/fan-affinity-assumptions.json` freezes physical unknowns. `js/evidence/phase46-fan-affinity.js` computes only dimensionless ratios and refuses fabricated fan part IDs, rated maximum speeds and experimental curves. Independent strict arithmetic is used in CI. The actual physical experiment and whole-system validation remain blocked until the fan part, shaft design, protection and real measurements exist.

```bash
node --test tests/phase46-fan-affinity.test.mjs
node scripts/phase46-run.mjs
node scripts/phase46-strict.mjs
npm test
node scripts/browser-smoke.mjs
```

**Physical validation: none. Real-world build success probability: unknown.** No high-speed impeller experiment is authorized by these software results.
