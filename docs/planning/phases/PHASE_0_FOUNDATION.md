# PHASE 0 — Foundation (Verified v1.0.0 Baseline & Invariants)

## Status: ✅ MERGED (96 stages A–Q, 1000 tests, 57 CI workflows)

## Verified invariants
- 4/4 verified SKY130A Q4 primitives (DRC=0, LVS ✓, PEX ✓)
- Pinned SkyWater `f62031a1be9aefe902d6d54cddd6f59b57627436` and `open_pdks` `0c1f82326278a0871f0a1fc4bdacf94c88e78e4d`
- Strict 1.95 V SKY130 core SOA limit
- Level-1 `INSUFFICIENT_MODEL_DATA`; Level-2 `UNQUALIFIED_NO_GO`
- 783 SHA-inventoried PDK files

## Acceptance
- All 1000 unit tests pass (999 pass, 1 skip on CI without ngspice)
- All Phase 2 external benchmarks pass (24/24)
- No evidence fabrication; Simulation Evidence ≠ Physical Validation

## Sub-phases
Phase 0 is a merged baseline — no further sub-phases. The legacy source tree (js/) is preserved as-is and serves as the engine layer for Phases 1–5.
