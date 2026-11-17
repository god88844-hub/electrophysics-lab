# Phase 37 — Independent original-physical-source replay and source-freeze audit

This audit independently checks the Phase36 empirical 24 V BLDC test-bench motor-speed mapping. It uses Python standard library and does not import, execute, or trust the JavaScript analyzer as a numerical oracle.

## Frozen source and publisher attribution

Robertas Ūselis, *Open BLDC Motor Test-Bench Dataset for Vibration and Current Analysis* (2026), CC BY 4.0; original publisher repository https://github.com/Atikas/OpenBLDCData and immutable commit 1ce35456f83be8f36aec183ab19d6e6e46603023.

All four original Git SHA1 blob identities, byte lengths, experimental motor-unit identities and controller-setpoint conditions are independently frozen in scripts/phase37-independent-audit.py. The audit refuses to derive its expected hashes or file sizes solely from mutable source manifests. It independently constructs the Git SHA1 from each downloaded byte stream, computes SHA256 and checks the exact publisher original, not a synthesized physical dataset.

## Independent numerical replication and refusal tests

The audit separately parses the source's 13 sensor/time fields and checks monotone microsecond timestamps, report interval consistency, counter continuity, legitimate 16-bit counter rollover, sensor finite numbers, and digital tach pulse transitions. It reconstructs measured mechanical RPM from real rising pulse edges and six pulses per revolution, rather than the requested controller speed. It converts raw INA226 upstream bus current (not motor phase current), independently fits an affine calibration from motor unit 2 at 2000 and 2500 RPM, then evaluates both genuinely held-out recordings from motor unit 3.

It checks every speed/current prediction against Phase36's released original-data summary, the baseline uncalibrated controller setpoint, and the actual four independent-publisher Git blobs. Total **425,925 actual source sensor rows** represent only two physical motor units. A single held-out motor cannot establish future-motor manufacturing yield or a statistical population prediction interval.

Negative-control tests reject malformed schema, missing current cells, source timestamp and sample-counter corruption, invalid current and false motor-speed evidence. All Phase36 source files remain frozen at audited base commit a532dd1b0cee3fc558b2b509659ccedd2b8dbfcc.

## Reproduction

Run, in order:

1. python3 scripts/phase37-independent-audit.py --self-test
2. bash scripts/phase36-download.sh
3. node scripts/phase36-run.mjs
4. node scripts/phase36-strict.mjs
5. python3 scripts/phase37-independent-audit.py
6. npm test
7. node scripts/browser-smoke.mjs

Dedicated CI: .github/workflows/phase37-independent-physical-audit.yml. Machine-readable evidence: benchmarks/evidence/phase37/phase37-audit.json, which is generated only after audit acceptance.

## Boundaries

This is a 24 V BD10LR-driven STEPPEROLINE BLDC laboratory-supply / 96 mA brake-controller-setting experiment and a descriptive two-point speed model, **not** a battery/wiring/fan performance model. Publisher Git identity does not certify the publisher instrument's independent physical calibration. Only one held-out specimen is present. Unmeasured intermediate regimes, manufacturing lots, failure modes, temperature, and aging remain outside the validated comparison.

The unrelated illustrated 3 V brushed DC battery–wires–fan has zero authenticated matching physical observations: physicalValidation=none, physicalVerdict=unknown, realWorldBuildSuccessPercent=null. Do not report a physical fan success percentage.

Phase37 is an independent audit gate; historical PRs remain unmerged pending Phase38 review and integration. AeroForge is not edited.
