# Stage M — Phases 73–77: current engineering scope

**Status: executable software foundations, NOT completed transistor-level multi-valued foundry qualification.**

## Phase 73 — Upstream provenance and multi-radix functional references
The source manifest is benchmarks/phase73/pdk-sources.json. It pins original model file bytes (Git object SHA-1 and byte length) from SkyWater SKY130 (commit f62031a1be9aefe902d6d54cddd6f59b57627436) and GF180MCU (commit 9f992d5a9186d1f7820c58f039c484ad35b2edea). The source-check script downloads from immutable commit-specific upstream URLs and verifies original bytes, recomputing SHA-256. Models retain Apache-2.0 source notices.

Only original source identity is checked; complete nested model includes, temperature/voltage ratings, wafer/mismatch distributions, manufacturer macro libraries, device circuit mapping, actual LVT/HVT selection, and transistor calibration are not established. Q4 rails [0,1.1,2.2,3.3] and balanced ternary [-1.1,0,1.1] are functional reference abstractions. SKY130 1.8 V nominal devices are NOT appropriate for a 3.3 V Q4 implementation. GF180MCU 3.3 V nominal also requires actual voltage/temperature limits and +10% supply ripple signoff. No manufacturer model is claimed verified merely because source bytes exist.

## Phase 74 — DC / transient and noise margins
The ngspice adapter consumes real ngspice DC and transient wrdata traces when the caller supplies completed, trusted model decks. Missing executable, deck, vector, or convergence => INSUFFICIENT_MODEL_DATA. The analytical detector checks all state levels at -10%, nominal, and +10% supply scenarios; Q4 state margins are NM_L, NM_1, NM_2 and NM_H. Eye opening, rail droop and capacitive coupling are included in pessimistic voltage windows. Generic functional traces do not establish foundry-valid model margins.

## Phase 75 — Deterministic 1000+ die-trial engine
The bounded parallel Monte Carlo runner produces stable per-trial uint32-seeded process samples and rotates temperatures -40, 25, 85, 125 C. It requires caller-specified Vth, oxide, channel-length and width distributions, real ngspice model decks, and explicitly measured delay/static-power/dynamic-power outputs. Missing SPICE data or statistics => unknown; supplied (unverified) sigmas => UNVERIFIED_STATISTICS. Mock runners are SYNTHETIC_TEST_ONLY, never a wafer-yield claim. Synthetic 1000-trial CI tests check scheduling and reproducibility alone.

## Phase 76 — Level-1 virtual passport and immutability of physical NO-GO
The Level-1 calculator uses a Wilson 95% interval from valid integer trial outcomes. It produces literal UNKNOWN physical-build percentage unless device model, layout extraction, foundry calibration and independent review evidence are authenticated. Its authenticated statistical approval trust-anchor set is deliberately empty: callers cannot self-certify with Boolean flags. A failed noise or layout check produces VIRTUAL_FAIL; otherwise evidence gaps produce INSUFFICIENT_MODEL_DATA. Level-2 PHYSICALLY_QUALIFIED, release and manufacturing stay strictly blocked. Nothing modifies Phase 30, 52, 54 or 72 physical release gate logic.

## Phase 77 — Candidate cells, unverified physical implementation
A deterministic 4/8-digit base-N standard-cell floorplan/pin candidate generator is available. Layout geometry is abstract, **not** routed foundry GDS/DEF. Post-layout review computes conservative capacitive coupling and IR droop, but refuses to certify DRC/LVS/RC source identity from self-asserted flags. Earlier Phase 18–22 *binary* cell results cannot substitute for custom Q4 layout.

## Required to satisfy original Stage M acceptance
Obtain a full executable PDK dependency closure and manufacturer SPICE macro provenance; calibrate actual multi-threshold transistor-level Q4, ternary, binary and arbitrary base-N detectors and cells; characterize realistic wafer mismatch statistics and correlation; run 1000 real ngspice semiconductor trials per evaluated ALU and corner; generate genuine cell netlists and layout, then complete independent DRC/LVS/postlayout RC. Include independent blind silicon holdout measurements before claiming near-physical simulation accuracy. Until those tasks are complete, never report a numeric *Simulated Physical Build Success %* or VIRTUALLY_QUALIFIED.

## Tests
Run node --test tests/phase73-mvl-devices.test.mjs tests/phase73-pdk-provenance.test.mjs tests/phase74-noise-margins.test.mjs tests/phase75-monte-carlo.test.mjs tests/phase76-virtual-passport.test.mjs tests/phase77-mvl-layout.test.mjs tests/stage-m-integration.test.mjs

Run node scripts/phase73-source-check.mjs to authenticate the pinned original source bytes from upstream (network required). This does not constitute foundry qualification.
