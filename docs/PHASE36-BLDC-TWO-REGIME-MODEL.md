# Phase 36 — Source-locked two-regime, independent-motor validation

## Scope
The objective is a narrowly testable empirical model for the publisher's **24 V STEPPEROLINE 57BYA54-24-01 BLDC** with a **BD10LR** controller, **UNIT-T UTP3305 laboratory supply**, and **96 mA hysteresis-brake control setting**. It does **not** represent a physical motor/impeller torque model. It is not a model of the illustrative 3 V brushed battery–wires–fan system.

Original physical publisher: Robertas Ūselis, *Open BLDC Motor Test-Bench Dataset for Vibration and Current Analysis* (2026), CC BY 4.0. Repository: https://github.com/Atikas/OpenBLDCData, immutable source commit `1ce35456f83be8f36aec183ab19d6e6e46603023`.

## Four genuinely original physical recordings
The first three are pinned by `benchmarks/phase35/acceptance.json`. Fourth is newly pinned by `benchmarks/phase36/acceptance.json`.

| Physical unit | Controller RPM setting | Model role | Original publisher file | Git blob SHA1 |
|---|---:|---|---|---|
| motor2 | 2000 | training | `analize_healthy11_2000rpm_96mA_mait.csv` | `7d02bca4073775be034ec00e906b4f7d28a49725` |
| motor2 | 2500 | training | `analize_healthy11_2500rpm_96mA_mait.csv` | `329d53ec77d708cca07f6b3a37f6a3346063eb66` |
| motor3 | 2000 | untouched held-out device | `analize_healthy20_2000rpm_96mA_mait.csv` | `195dea9f1b551e6ad209a511713895727af27c94` |
| motor3 | 2500 | untouched held-out device | `analize_healthy20_2500rpm_96mA_mait.csv` | `2de45c123e65711bb33f28609889581826f10cb2` |

The fourth recording is **23,964,792 original bytes** verified against the publisher's pinned Git object. It is not a simulation. It is not 23 million independent motors.

## Mathematical design and leakage prevention

The training-only mapping is a two-point affine descriptive calibration of controller setpoint `s` to real observed tachometer speed `r`:

`r_hat(s) = r_motor2_2000 + (s - 2000) * (r_motor2_2500 - r_motor2_2000) / 500`

A separate two-point affine fit maps controller setting to measured upstream driver-input current, *not* motor phase current. No motor3 measurement enters either fitted coefficient. The independent unit's two recordings are used **only to evaluate** signed and absolute errors. This is a held-out different-device comparison with two operating conditions, not a statistically independent two-motor population: **independent held-out hardware units = 1**. The fit has **zero training residual degrees of freedom**; evaluation at training setpoints is *between-device generalization*, not evidence of full motor physics.

The PG digital tach is converted using six rising pulses per actual mechanical revolution and measured microsecond timestamps. Independently sourced readings are accepted only with original publisher SHA1 checks and strict sample/time/counter health checks. The original controller setpoints are never substituted for observed measured speed. Comparison includes the uncalibrated setpoint baseline MAE so that the affine fit is not described as an improvement unless actual measured error supports it.

## Execute on original source
```bash
node --test tests/phase36-independent-model.test.mjs
bash scripts/phase36-download.sh
node scripts/phase36-run.mjs
node scripts/phase36-strict.mjs
npm test
```

CI `.github/workflows/phase36-two-regime-bldc-model-check.yml` downloads all four originals, runs these checks, and uploads the source-locked evidence and report.

## Scientific limits and remaining evidence
All numbers are **conditional on the specific publisher's test setup and data quality**, not independent accredited instrument calibration. Observed source-model discrepancy cannot establish an error distribution for an unseen manufacturing population with only one held-out motor unit; no defensible population confidence interval or manufacturing yield follows. Errors at 2000 and 2500 RPM do not validate intermediate conditions, different brake loads, different supplies, ambient thermal regimes, wiring, aging, or failure rates.

**The target 3 V battery–wires–fan has zero authenticated matching physical observations**. Its real-world success percentage and physically qualified predictive interval remain **null / unknown**. Project should next obtain explicitly identified exact target hardware and source-authenticated matching measurements, then use a pre-registered independent multiple-hardware validation plan. No source study may be silently transferred to the unrelated target.

All prior phase branches and PRs remain unmerged, and AeroForge is untouched.
