# Phase33 — first authentic publisher-byte-level outside-hardware sensor ingestion

Original public data: **Robertas Ūselis, Open BLDC Motor Test-Bench Dataset for
Vibration and Current Analysis (2026)**,
https://github.com/Atikas/OpenBLDCData , **CC BY 4.0**.
This analysis is our own adaptation; source author and licence must be
retained. The original dataset includes measurements of different BLDC motors,
electrical signals, two accelerometers and speed-pulse channels. This
phase downloads one **real published original raw file** by its
historical repository commit and verifies that the exact bytes match
the original Git blob identity; it DOES NOT produce new lab measurements.

## Pinned original file and actual investigated hardware

- Publisher Git commit:
  1ce35456f83be8f36aec183ab19d6e6e46603023 (8 October 2026).
- File: data/analize_misalignment10_SF_500rpm_19mA_bat.csv
- Publisher Git blob SHA-1:
  7249edf7f21a337bec52fa11fa3c6e555d3e4627
- Original file size: **421,672 bytes**; **5,073** recorded sensor rows.
- Physical test subject: STEPPEROLINE **57BYA54-24-01 24 V BLDC motor**,
  driven by a **BD10LR BLDC controller**, under hysteresis-brake load.
  Supply: two 12 V lead-acid battery packs in series.
- File's **500 RPM is a speed setpoint**, not a free-standing sensor
  validation, and **19 mA is the load controller's setting**, not
  necessarily the actual BLDC motor current.
- Filename flags **SF = original sensor failure/drift**. It also
  includes shaft misalignment. Do not silently label it clean data.

## Independently inspected raw sensor results

The full 13-column original CSV has 5,073 consecutive sample sequence
numbers, monotonic microsecond timestamps, one omitted first-sample
time interval, consistent following measured time intervals and
a total observed **5.071999 seconds**.

Under the publisher's sensor scaling (INA226 1.25 mV per bus-voltage
LSB; 305.18 µA per current LSB), the source records have approximately:

- Mean bus voltage: **24.82515 V**
- Mean upstream electrical current: **0.02317 A**
- Every **5,073 of 5,073 tachometer PG values equals 1**.
- PG rising edges observed: **zero**. Thus the reported 500 RPM setting
  CANNOT be converted to verified observed shaft speed. The actual
  motor speed is **null** for this recording.

These source values are sensor readouts, subject to hardware
calibration, timing, driver behavior and original publisher provenance.
They are not calibrated physical accuracy bounds for the exact
battery + two wires + brushed DC fan of Phase31. The BLDC drive has
different electronics, nominal operating voltage, load and motor
physics. The 5,073 observations are repeated readings of one physical
recording, **NOT 5,073 independent motors or successful built fans**.

The source is publisher-recorded physical data with *byte-level version
authentication*. Git blob matching does not independently certify
the source publisher's laboratory calibration, safety review,
instrument chain or actual experiment provenance. These limits are
explicitly returned by the evidence API and strict tests.

## Why this improves near-physical validation

This is a real-world example of the difference between models and
measurements: a virtual 500 RPM instruction does not guarantee the
physical tachometer has valid rotational-speed data. The system
analyzes the original source and fails closed on the constant speed
pulse: no invented speed, no physical success rating. This evidence
can support a restricted diagnostic decision about the original
sensor recording, not a battery-fan manufacturing prediction.

The next required physically grounded steps are to ingest multiple
**healthy** recordings with comparable operating conditions and
different actual motors, select separate hardware units as
calibration/holdout, obtain original measured sensor uncertainties
and driver-specific physics, and validate model discrepancy only
within the measured motor/temperature/load envelope. Comparable
reference measurements still cannot prove the hypothetical Phase31
3 V fan works without an actual matching-component transfer model.

## Reproduction

Run the source-verified GitHub Actions workflow or:

    bash scripts/phase33-download.sh
    node --test tests/phase33-original-bldc.test.mjs
    node scripts/phase33-run.mjs
    node scripts/phase33-strict.mjs
    node scripts/browser-smoke.mjs

The source file is downloaded **only during CI / explicit run** and
uploaded to the CI evidence artifact with source attribution. It is
not vendor-produced fan measurements invented by this system.

**Actual measured 3 V fan samples: 0. Original authenticated ALU
silicon samples: 0. Model-to-fan physical accuracy: UNKNOWN. True
manufacturing success percentage: null.** Prior PRs stay draft and
unmerged; AeroForge remains untouched.
