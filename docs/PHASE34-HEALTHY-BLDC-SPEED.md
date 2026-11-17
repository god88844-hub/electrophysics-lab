# Phase 34 — original healthy BLDC speed measurements versus faulty tachometer

This research phase downloads an ADDITIONAL physical recording from
Robertas Ūselis, Open BLDC Motor Test-Bench Dataset for Vibration and
Current Analysis (2026). Original public source:
https://github.com/Atikas/OpenBLDCData. Publisher license CC BY 4.0.
This is independent *from our simulation*, but it was not collected
by our project, and its lab instrument calibration has not been
independently attested by us.

Pinned historical source commit:
1ce35456f83be8f36aec183ab19d6e6e46603023
Original file: data/analize_healthy10_500rpm_19mA_bat.csv
Original Git blob: 8dd094813462b489e3a24519d1b7a154bd12cf04
Raw size: 22,712,053 bytes, downloaded at CI run time.

The publisher's naming convention gives healthy10 = motor unit 2,
experiment 1. Phase33's misalignment10_SF is a different physical
fault condition and marked sensor failure/drift. Both recordings
share the approximate 500 RPM speed setpoint, a 19 mA *load
controller* setting and two 12V lead-acid batteries. They do NOT
represent independent held-out physical motor units. The motor is a
three-phase 24 V STEPPEROLINE BLDC 57BYA54-24-01 using BD10LR drive,
not the unbuilt hypothetical 3 V brushed DC fan used in Phase31.

The actual 13-column sensor records contain microsecond timestamps,
two accelerometers, INA226 upstream driver bus voltage and current
and PG tachometer pulses. Six PG pulses represent one mechanical
revolution per the publisher's documentation.

Healthy PG pulse-speed calculation:

  estimated original motor RPM = N_rising_edges * 60 / (6 * duration_s)

This count-based average needs valid 0/1 transitions, measured
duration, monotone sample times and reasonable sequence integrity.
It is not automatically an instrument-calibrated continuous speed
or proof of exactly 500 RPM. Source errors, quantization, dropped
edges, sample aliasing and mechanical load must be considered.
The full file is streamed twice by independent report creation and
replay; original bytes must match the historical Git object SHA.

The faulty Phase33 reference had 5,073 of 5,073 PG samples stuck
HIGH, so its measured shaft speed is UNKNOWN rather than the
controller's 500 RPM target. Both recordings are measured physical
source records of a separate other motor; comparing two different
fault conditions does not by itself estimate defect incidence.

This phase provides documented physical evidence for a narrow
question: whether the original published 24V motor signal has enough
PG transitions to reconstruct speed and how its sensor quality
compares to the publisher's faulty signal recording.

Scientific limits:
- Original target 3 V fan measurements: ZERO.
- Source physically different from hypothetical 3V fan.
- Original 8-bit ALU silicon: not independently tested.
- No qualified independent factory sample or holdout here.
- Source-to-target model discrepancy calibration: UNKNOWN.
- Real physical manufacturing success probability: NULL.

The scientific target remains decision-grade near-physical
simulation under explicit input variation and measured applicability
bounds. The published data support condition monitoring of the
publisher's BLDC setup, NOT universal equivalence or a fabricated
current-design build-success percentage.

Reproduction:
  bash scripts/phase33-download.sh
  node scripts/phase33-run.mjs
  bash scripts/phase34-download.sh
  node --test tests/phase34-healthy-stream.test.mjs
  node scripts/phase34-run.mjs
  node scripts/phase34-strict.mjs

AeroForge untouched; all prior PRs stay open/unmerged and draft where
applicable. No silent merge or foundry qualification.
