# Phase 44 — Copper wire and connector/contact resistance modeling

The source-backed **proposed** Phase41 harness has two 24-AWG copper leads. It does **not** have measured lengths, manufactured conductor identities, exact copper grade, connector ratings, temperature class, measured contact resistance or assembly reliability. No real wire experiment is available.

## Scientific reference and exact scope

The mathematical reference is ideal standard annealed copper at 20°C, conductivity 58 meter/(Ω·mm²) and 20°C temperature coefficient of resistance 0.00393/°C as documented by the [U.S. Bureau of Standards copper wire tables](https://nvlpubs.nist.gov/nistpubs/Legacy/circ/nbscircular31e4.pdf). This implies ideal resistivity **1/(58×10⁶) Ω·m** at 20°C. Gauge geometry uses the standard AWG geometric relation `d_mm = 0.127 × 92^((36-AWG)/39)`, `A = πd²/4`.

Two hypothetical equal-length wires form a **series round-trip loop**. The report uses:

- `R_copper = rho(T) × 2L/A`, `rho(T)=rho20×[1+0.00393(T-20)]`;
- `R_contacts = 2×R_contact_per_contact` (the assumed count of two has not been established for a real system);
- `V_drop=I(R_copper+R_contacts)`, `P_loss=I²(R_copper+R_contacts)`.

A demonstration deliberately assumes **two 0.25 m AWG24 conductors and 0.01 Ω per contact at 20°C and 1 A**. That length and contact resistance are **illustrative**, not sourced from a purchased wire or test. Algebraic uncertainty and broad hypothetical temperature/current ranges cannot establish insulation safety, motor current, safe current-carrying capacity, actual connector voltage loss, a thermal transient or physical temperature rise.

Material and geometry formulas are independently checked against a second implementation. Bad temperatures, nonfinite current, out-of-range contact values, invented manufacturer part numbers, fabricated measurements and real-world build success rates are rejected.

## Run

```bash
node --test tests/phase44-wire-loop.test.mjs
node scripts/phase44-run.mjs
node scripts/phase44-strict.mjs
npm test
node scripts/browser-smoke.mjs
```

Manifest: `benchmarks/phase44/copper-harness-assumptions.json`; CI evidence: `benchmarks/evidence/phase44/phase44.json`.

**Physical characterization remains unfulfilled** until the actual source-matched copper harness/connector specimens and current/temperature class are identified, measured resistance-vs-temperature tests are authenticated, and calibrated uncertainty and holdout comparisons are independently reviewed. This phase does not assert any actual fan system success rate. The model is not a protection-device, enclosure or electrical compliance check.
