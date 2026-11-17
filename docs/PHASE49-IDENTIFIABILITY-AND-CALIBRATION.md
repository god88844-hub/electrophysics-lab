# Phase 49 — Structural identifiability and synthetic-only calibration boundary

The physical fan does not exist in verified data. This implementation uses only a versioned, deterministic synthetic **stopped-rotor** series circuit, not motor/fan measurements. The assumed source is V with three separately unknown series resistances (battery Rb, wire/harness Rh and stopped motor Rm), yielding **I=V/(Rb+Rh+Rm)**. The source-locked synthetic reference decomposition is 0.45+0.04+0.75=1.24 Ω; original values are illustrative.

## Structural rank and holdout discipline

Sensitivity to each element is the same: **∂I/∂Rb = ∂I/∂Rh = ∂I/∂Rm = −V/(Rb+Rh+Rm)²**. The resulting Jacobian has rank **1**, with a nonzero null direction [1,−1,0]. Even ideal noiseless observations across multiple voltages cannot identify all three separate component resistances. The model fits the *single* identifiable total R from three frozen deterministic synthetic training points, and checks two distinct synthetic holdout voltages **without using them to fit**.

The exact algebraic zero-error holdout is **not evidence** about a real fan, real battery, physically separate hardware specimens, sensor bias, motor variability or manufacturing success. No prediction interval or validated individual component resistance is inferred. Future hardware characterization must measure component drops/currents under controlled conditions, identify real specimen/lot and instrument provenance, and reserve entire hardware units and operating conditions for blind validation.

Models that claim independently identified battery/motor/harness resistances from total current alone or promote hypothetical data to real measurements fail CI. Research principles are consistent with <https://standards.nasa.gov/node/263> and <https://www.nist.gov/itl/sed/topic-areas/measurement-uncertainty>, but there is no formal standards certification.

Run: `node --test tests/phase49-identifiability.test.mjs`, `node scripts/phase49-run.mjs`, `node scripts/phase49-strict.mjs`, `npm test`, `node scripts/browser-smoke.mjs`.

**Status:** software identifiability gate implemented, synthetic regression verified through CI; *real physical parameter calibration not done*, physicalValidation=none, physicalVerdict=unknown, realWorldBuildSuccessPercent=null.
