# Phase 47 — Conditional electromechanical–thermal solver

This phase implements a **testable mathematical reference**, not a physical digital twin of an acquired system. Battery, motor, wires and fan are not physically source-matched assembled or calibrated. It is illegal to promote a computed success rate or predicted safe impeller RPM from these assumptions.

## Physics and explicit assumptions

From the previous E91/Pololu/AWG24 manifests: idealized 3 V nominal source, hypothetical 0.3–0.6 Ω battery internal resistance, 0.75 Ω motor stopped-resistance inferred from a published 3V/4A stall point, plus calculated illustrative wire/contacts resistance. Armature inductance, brush drop, transient battery electrochemistry, real motor dynamic friction and true thermal state are **not measured**.

An *illustrative* ideal SI conversion assumes `k_t=k_e`, estimating `k_e=(3−0.75×0.35)/(20000×2π/60)` V·s/rad from the approximate motor free speed/current. The model uses constant running friction torque `k_t×0.35` Nm, an invented inertia `2×10⁻⁶ kg·m²`, a hypothetical fan torque coefficient `C_fan ∈ [0,10⁻⁹] Nm/(rad/s)²`, and motor thermal `Cth=10 J/K`, `Rth=20 K/W`. **None is measured for the actual motor or fan.** The derived net stall torque differs materially from the manufacturer's *approximate* 55 gf-cm stall figure: the code reports this discrepancy rather than claiming the source points jointly calibrate one motor model.

For rotor angle velocity `ω`, source current `I=max(0,(3−k_e ω)/(R_battery+R_wire+R_motor))`, resisting `Tfan=C_fan ω²`, and assumed running friction `Tf`, the ideal equation is `J dω/dt=k_t I − Tf−Tfan`, with no current regeneration. Heat in motor `Pm=I² Rmotor+Tf ω`; lumped motor temperature obeys `Cth dT/dt=Pm−(T−Tamb)/Rth`. This is a deliberately small *motor-temperature-only* thermal network: it neither computes true battery heating/transient temperature nor valid wire insulation rise. Battery and wire Ohmic losses are tracked as electrical dissipation.

The solver uses **implicit midpoint** timestepping (400×5ms over 2 s) to enforce and independently audit electrical input energy equals battery losses + wire losses + motor thermal/ambient transfer + fan aerodynamic work + rotational kinetic-energy change. Original manufacturer approximate data and assumed fan coefficients are frozen. Peak current, model speed and temperature are all **scenario outputs, not measured hardware predictions**. No airflow or pressure may be inferred from fan speed without a real fan and system curve.

## Scientific completion limits

- CI accepts only an energy-consistent mathematical model with precise assumptions and deterministic outputs.
- The numerical result is not validated against measured fan thermal or aerodynamic response.
- Mechanical containment, fasteners, exact impeller geometry, shaft rated maximum, current protection and instrument calibration remain **unknown**.
- Physical fan specimens: zero. Physical validation: none. Real-world success probability: unknown.

## Run

```bash
node --test tests/phase47-coupled-solver.test.mjs
node scripts/phase47-run.mjs
node scripts/phase47-strict.mjs
npm test
node scripts/browser-smoke.mjs
```

The next phase builds an independent-model replay and whole-system qualification readiness audit. It will not call simulated data physical evidence.
