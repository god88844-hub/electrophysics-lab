# Phase 43 — Energizer E91 battery characterization: bounded software model

**Software phase implemented, matching physical measurements not collected.** This phase takes the specific candidate from Phase 41: **two nominal 1.5 V Energizer E91 AA alkaline cells**, each with typical *fresh-cell* nominal internal resistance of **0.15–0.30 Ω**, as published in [Energizer E91's own datasheet](https://energizer.com/apac/australia/wp-content/uploads/sites/3/2024/05/e91_max_na_AA.pdf). The source explicitly characterizes its values as typical reference information, not a warranty. We have **no authenticated actual battery specimens, SOC calibration, capacity, impedance surfaces, temperature dependence, time series, or pack aging study**.

## Mathematical scope

For a *hypothetical fixed commanded current* `I`, a fixed nominal pack voltage hypothesis `Vnom = 2 × 1.5 = 3.0 V`, and a constant hypothetical two-cell fresh-resistance range `R = [0.30,0.60] Ω`, the model reports:

- Hypothetical terminal voltage: `[3 - 0.60 I, 3 - 0.30 I]` V.
- Hypothetical internal heat generation: `[I² × 0.30, I² × 0.60]` W.
- Hypothetical electrical terminal power: `I × [Vmin,Vmax]` W.

At `I = 0.5 A`, the theoretical terminal voltage is **2.70–2.85 V**. At `I = 4 A`, the algebra gives **0.60–1.80 V**; it **does not mean** the real cells can supply 4 A, a motor will actually draw 4 A, that the battery is at 3 V OCV, or that the calculated internal losses are thermally safe. The current input is an externally declared *counterfactual load*, not solved from a coupled electromechanical system.

The published -18 to 55 °C operating range constrains scenario input, but **the same resistance is used at every temperature** because no source-matched `R(SOC,T,current,age)` measurements exist. The model cannot calculate remaining charge, capacity versus load, runtime, reliability, measured thermal heating or a physical safety decision. A proposed battery voltage/current CSV must pass Phase 42's source file checks and remains **quarantined** pending independent instrumentation and device provenance.

## Executable evidence gates

```bash
node --test tests/phase43-battery-model.test.mjs
node scripts/phase43-run.mjs
node scripts/phase43-strict.mjs
npm test
node scripts/browser-smoke.mjs
```

The source parameter manifest is `benchmarks/phase43/e91-assumptions.json`; published numerical reports are `benchmarks/evidence/phase43/phase43.json` in CI. Provenance-locked manufacturer typical data is not laboratory verification of the target physical pack.

**The physical Phase 43 completion gate is still BLOCKED**, pending two source-matched purchased and calibrated cells, measured pack OCV, impedance/transient response at suitable independent loads and temperature/SOC, uncertainty budget and calibrated independent holdouts. This separate engineering requirement cannot be fulfilled through software tests alone. No fan hardware physical validity or success probability is claimed.
