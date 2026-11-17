# Phase 45 — Approximate brushed DC motor endpoints and coupled stopped-rotor sensitivity

This phase implements a narrow model from the manufacturer’s [Pololu #1592 product specifications](https://www.pololu.com/product/1592/specs). The source lists a **discontinued brushed-DC motor** intended for **1.5–3 V**, with approximate ratings at an ideal fixed **3 V at motor terminals**: 20,000 rpm no load, 350 mA no load, 4 A stall current, 55 gf-cm stall torque, and 2 mm shaft. The 20k rpm manufacturer correction is documented in [its original product description](https://www.pololu.com/product/1592).

No actual motor unit has been purchased, instrumented or measured; the manufacturer's approximate endpoint specifications do **not** characterize a real manufacturing population or a safe operating fan.

## Engine A — Constant 3 V manufacturer endpoint interpolation

At *assumed constant motor terminal voltage 3 V* and with an *assumed linear* speed fraction `f = rpm/20000`, this software constructs `I(f) = 4 − 3.65f` A and external shaft torque `T(f) = 55 × 9.80665×10⁻⁵ × (1−f)` Nm. Shaft mechanical power is `T×rpm×2π/60`. No-load current models internal losses, not a measured friction map. Extrapolation beyond 0–20,000 rpm, alternate motor supply voltage or invented fan torque curves are rejected. Endpoint interpolation **does not** imply calibrated real load torque at intermediate speeds.

## Engine B — Coupled stopped-rotor **counterfactual** DC circuit

A first algebraic connection of Phase43 **nominal** E91 pack (3 V source hypothesis; cell internal resistance total 0.30–0.60 Ω), Phase44 **hypothetical** 24-AWG two-wire loop with two assumed 0.01 Ω contacts, and motor **hypothetical** zero-speed effective resistance `Rmotor=3V/4A=0.75Ω` is:

`I_hypothetical_stopped = 3/(Rbattery + Rwire_contacts + 0.75)`.

It independently checks Kirchhoff's voltage law across all elements and reports theoretical motor terminal voltage/current and dissipations. These **do not** represent measured motor winding resistance, actual battery open-circuit voltage, physically achievable battery current, motor startup transient, fan load, shaft torque after battery sag, thermal limits or electromechanical operating speed. The nominal source voltage is *not* the physical pack's verified voltage. Motor brush/commutation contact drop is omitted, and the assumed 0.75Ω effective resistance is derived only from a published stall point.

**Do not use these assumptions to authorize connecting batteries or spinning any impeller.** Phase41's exact fan, shaft retention, speed limit, mechanical containment and battery protection are unqualified. No motor torque, winding resistance, thermal rise, current-limit or physical manufacturing yield estimate is certified.

## Tests and evidence

```bash
node --test tests/phase45-motor-characterization.test.mjs
node scripts/phase45-run.mjs
node scripts/phase45-strict.mjs
npm test
node scripts/browser-smoke.mjs
```

Source version `benchmarks/phase45/pololu1592-endpoint-model.json`; CI report `benchmarks/evidence/phase45/phase45.json`. Independant numeric replay checks the published endpoint line, the mechanical-power units and two KVL-balance cases. Forged hardware test claims and invented external calibration never become physical acceptance.

**Phase 45 code milestone can pass CI, but the physically calibrated motor-characterization objective is BLOCKED** until an actually obtained model-matched motor is independently safely measured at validated operating points with source-authenticated raw waveforms, measured torque, actual current and temperature, and uncertainty across independent units. A future replacement for discontinued #1592 needs a new source identity and calibration plan. Actual fan physical-validation and real-world build-success probability remain UNKNOWN.
