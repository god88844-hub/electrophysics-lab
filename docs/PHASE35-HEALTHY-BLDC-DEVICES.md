# Phase 34 — healthy original BLDC measurements, held-out motor unit

This phase extends the original public 24 V BLDC sensor acquisition from
Phase33 (one explicitly damaged tachometer) with three publisher-labeled
**healthy** recordings from two separate physical motor units. It is an
evaluation of *real source-motor data*, not any measurement of the
illustrative battery → two wires → brushed 3 V fan in Phase31.

## Publisher and strict original identities

Robertas Ūselis, *Open BLDC Motor Test-Bench Dataset for Vibration and
Current Analysis* (2026), CC BY 4.0; original upstream repository:
https://github.com/Atikas/OpenBLDCData .
Original publisher source commit
\`1ce35456f83be8f36aec183ab19d6e6e46603023\`.

| Role | Original publisher filename | Real physical unit | Requested speed/load | Original Git blob |
|---|---|---|---|---|
| Training baseline | \`analize_healthy11_2500rpm_96mA_mait.csv\` | motor unit 2 | 2,500 RPM, 96 mA brake controller, lab supply | \`329d53ec77d708cca07f6b3a37f6a3346063eb66\` |
| Independent device holdout | \`analize_healthy20_2500rpm_96mA_mait.csv\` | motor unit 3 | 2,500 RPM, 96 mA brake controller, lab supply | \`2de45c123e65711bb33f28609889581826f10cb2\` |
| Training operating-point contrast | \`analize_healthy11_2000rpm_96mA_mait.csv\` | motor unit 2 | 2,000 RPM, 96 mA brake controller, lab supply | \`7d02bca4073775be034ec00e906b4f7d28a49725\` |

The upstream documentation defines filenames' first numbered digits as
the motor unit index and the last digit as the repeat number:
\`10\` is motor unit 2 and \`20\` is motor unit 3; thus this is
a **different-device holdout** instead of the easier but invalid
random split of highly correlated samples from the same motor.
The full pinned dataset manifest is
\`benchmarks/phase35/acceptance.json\`.

All three original files are downloaded from the **exact immutable
historical publisher source commit**, checked for original byte lengths,
original Git blob SHA-1, and then separately hashed with SHA-256.
Neither arbitrary user-supplied CSVs nor the video/browser demo are
accepted as authenticated publisher original source data.

## Measured signals and independence

The source files include 13 actual sensor/time fields. We independently
parse and validate microsecond time stamps, acquisition sequence numbers,
source-reported \`dt\`, raw INA226 bus voltage and current, and the
digital PG tachometer. The manufacturer's controller produces six
pulses per mechanical revolution.

\`\`\`text
upstream bus voltage V = bus_raw * 0.00125 [V/LSB]
upstream driver input current I = curr_raw * 0.00030518 [A/LSB]
tachometer RPM = 60 * (N_rising - 1) * 10^6
                    / (6 * (t_last_rising_us - t_first_rising_us))
\`\`\`

This speed estimate requires a **non-stuck** pulse channel, at least
12 rising transitions, monotone timing, sample sequence continuity, and
a well-formed source-reported timebase. It is computed from the physical
tach channel **and never from the filename's 2,500 RPM setting**.
Nominal source speed, actual tach speed, bus voltage, upstream current
and per-second time windows are reported separately.

For matched 2,500 RPM brake-controller settings, the simple
source-motor-unit-2 reference speed is fixed **before** looking at
different-source-motor-unit-3 holdout readings. The measured unit-3
speed minus unit-2 speed is a *source-specific cross-device residual*.
Nothing is fit to the motor-unit-3 result, which is withheld from the
training calculation. The additional 2,000 RPM motor-unit-2 run tests
whether the parser and model follow a second operating condition and
must not be mistaken for a third independent hardware specimen.

This is a useful *minimum* independent physical evidence example.
It is **not** a performance prediction of this project's 3 V fan, nor
a calibration of the Phase31 Monte Carlo input distributions or
model discrepancy. A single held-out motor unit and a few recordings
cannot establish a 95% predictive population tolerance, motor lifetime,
defect rate or a real hardware manufacturing success percentage.

The physical motor in the upstream source is a
**STEPPEROLINE 57BYA54-24-01 rated 24 V, 3-phase BLDC** driven by a
BD10LR controller, loaded by a hysteresis brake and supplied by a
UNIT-T UTP3305 laboratory supply. Its voltage, feedback/control
topology, load and structure differ from the Phase31 example brushed
DC fan. \`96mA\` refers to the original brake **load controller setting**,
not necessarily the actual motor current, which is measured from
\`curr_raw\`.

The upstream paper's calibration claims are limited to the published
instrument setup; Git blob verification proves original publisher byte
identity, **not an independently accredited physical measurement
laboratory**. The review cannot certify independent sensor traceability,
manufacturer process distribution, manufacturing yield, or any
end-user application safety approval.

## Live exact original evidence run

\`\`\`bash
bash scripts/phase35-download.sh
node --test tests/phase35-independent-holdout.test.mjs
node scripts/phase35-run.mjs
node scripts/phase35-strict.mjs
node scripts/browser-smoke.mjs
\`\`\`

The GitHub workflow regenerates the entire record from **actual original
source files**, runs every test from Phases1–33 and checks exact
source/model result equality. Generated evidence, including original
licensed downloaded CSV data, is published in GitHub Actions artifacts
with source attribution; it is **not hardcoded into code as fake sample
measurements**.

Other users may calibrate a physics model for this *particular*
24 V motor, with its exact driver and test rig, only after verifying
source instrument quality and the intended operating range. A high
confidence about the 3 V fan requires measured matching battery,
wiring, fan blade, driver and motor, independent unseen specimens and
appropriate manufacturing/defect distributions. Otherwise continue to
report two separate quantities: conditional *modeled* success and
**unknown** real-world success.

The evidence chain remains draft/open/unmerged; AeroForge is a
separate flight project and is not edited here.
