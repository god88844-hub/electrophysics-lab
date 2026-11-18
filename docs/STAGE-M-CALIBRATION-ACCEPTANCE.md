# Stage M — calibrated ALU and actual PDK acceptance gates

The PDK manifest now pins **28 original upstream source files**, including 20 additional SKY130 TT/SS/FF and mismatch model cards for the standard, LVT, HVT and high-voltage MOS families. These file-level pins do **not** establish complete transitive model closure, characterized foundry statistical distributions or calibrated wafer populations. Phase 73 contains SKY130 1.8 V threshold-model identities; those nominal 1.8 V devices are not valid for a 0–3.3 V Q4 voltage sweep with ±10% ripple. External SPICE models must not be silently substituted, and nominal 3.3 V GF180 cells also require validated overvoltage/ripple stress envelopes.

`node scripts/stage-m-signoff-readiness.mjs` produces a 12-case deterministic binary/ternary/Q4 and 4/8-digit readiness matrix across SKY130 and GF180MCU. It records *missing* actual transistor-level netlists, foundry variation distributions, temperature validity, full pinned dependent library files, physical extraction and independent silicon holdout. The result remains `INSUFFICIENT_MODEL_DATA`, with build-success `UNKNOWN` and physical `UNQUALIFIED_NO_GO`. Running the script is a software validation of the no-fabrication boundary, **not** qualification.

## To reach accepted Level-1

1. Obtain valid, license-compliant, immutable complete PDK library trees including transitive model dependencies and manufacturer-verified device voltage/temperature ratings.
2. Construct genuinely transistor-level 4/8-digit binary/ternary/Q4 ALU netlists with reproducible reference vectors. Do not drive nominal 1.8 V transistors at 3.3 V.
3. Obtain independently characterized *statistical process distributions*, not arbitrary sigma values. Run all 1,000+ *real* ngspice trials against those exact decks and sources, across the specified temperature and supply corners, with per-trial replay, logs, and complete pass/fail accounting.
4. Route the actual custom cells; inspect source-bound OpenROAD/KLayout/Magic/OpenRCX DRC, LVS, extracted parasitics, and post-layout intermediate-state noise margins. Mathematical floorplan rectangles are insufficient.
5. Obtain independent calibration and holdout reviews with pinned trusted signoff roots. Only then may the existing `makeLevel1Passport` issue a genuinely calibrated Wilson-interval virtual yield. Level-2 physical signoff requires *different, authenticated physical silicon measurements*.

**Current status:** these inputs are absent; a requested `<60%` to `>92%` calibrated demonstration cannot be proven honestly. Do not merge or tag a full 96-phase qualified release based on synthetic tests.
