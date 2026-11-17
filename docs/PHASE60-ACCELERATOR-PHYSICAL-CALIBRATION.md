# Phase 60 — Device-separated prospective accelerator calibration

The Phase59 analytical systolic workload becomes a frozen test configuration. Phase60 adds candidate latency and power intake, reproducible model hashes, **train-only** zero-intercept latency calibration and whole-device-separated holdout comparison. It reports candidate MAE and mean absolute relative error and explicitly rejects cross-split device leakage, malformed power, changed model identities and self-asserted physical approval.

The bundled data remain **unmeasured**. Synthetic fixtures in tests are never admitted as physical evidence. Candidate metrics are conditional calculations; they do not authenticate instruments or source-matched silicon. No physical energy prediction model has been qualified, so observed power is descriptive only and no power/energy predictive accuracy is claimed. Independent actual hardware acquisition, calibration records, raw instrument bytes, provenance verification and external reviewer approval are still required.

Run `node --test tests/phase60-calibration.test.mjs`, `node scripts/phase60-run.mjs`, `node scripts/phase60-strict.mjs` and `npm test`.
