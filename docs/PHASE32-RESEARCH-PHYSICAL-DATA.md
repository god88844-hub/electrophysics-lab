# Phase 32 — Source-researched physical data inventory and evidence-gap audit

Research date: **17 November 2026**. The full exact source and evidence
inventory is machine-readable at
`benchmarks/phase32/public-source-catalog.json` and can be inspected
in **Chip Lab → Build Evidence → Source research**.

## Objective and actual completion boundary

The long-term target is to make a *specified simulation-based engineering
decision* as credible as an applicable physical test. Software can solve
conservation laws and calculate **conditional simulated success probability**
without building a prototype. There are two non-interchangeable uncertainties:

1. **Input and sampling uncertainty** — e.g. distribution of battery voltage,
   wire resistance, motor resistance and drag, propagated by the verified
   nonlinear solver. The Phase31 example uses *hypothetical independent
   Gaussian distributions*; its 63.84% success estimate at the 1,150 RPM
   target is a conditional model result, NOT empirical hardware yield.
2. **Model form and source-to-target applicability error** — e.g. actual
   impeller torque, BLDC controller, contact faults, temperature, aging,
   thermal mass and assembly defects. Published data from a DIFFERENT
   motor do not automatically bound this error for the new fan.

A formula being known does not make its *parameter values, correlations or
application boundary* known. A result becomes decision-grade when the
error/uncertainty and intended-use envelope are credibly constrained.

## Original public research sources: 12, all pinned by exact URL

| ID | Original authority / record | What this contributes | Precise limitation |
|---|---|---|---|
| asme-vvuq | [ASME VVUQ](https://www.asme.org/codes-standards/publications-information/verification-validation-uncertainty) | Verification, validation, uncertainty concepts and standards | Methods, not motor measurements; full standards may need access |
| nasa-7009b | [NASA-STD-7009B](https://standards.nasa.gov/standard/nasa/nasa-std-7009) | Intended-use model credibility and acceptance | No certificate was issued to Invention Lab |
| nist-tn1900 | [NIST TN 1900](https://www.nist.gov/publications/simple-guide-evaluating-and-expressing-uncertainty-nist-measurement-results) | Experimental and propagated uncertainty | Not calibration of our fan |
| nist-uncertainty-machine | [NIST Uncertainty Machine](https://uncertainty.nist.gov/) | Propagating correlated input uncertainties | Distribution choices need real evidence |
| pololu-1592 | [Pololu motor 1592 specifications](https://www.pololu.com/product/1592/specs) | Published typical 3 V motor speed/current/torque | **Different brushed DC motor**, no original per-unit measurements or batch distribution |
| mendeley-openmct-2026-v2 | [OpenMCT dataset v2 DOI:10.17632/5xvg43r9r8.2](https://data.mendeley.com/datasets/5xvg43r9r8/2) | 14 raw logs and more than 60,000 published motor-control sample rows, 10 columns; 2026 version | 12 V motor + PWM H-bridge/encoder system, **not 3 V fan**; raw data NOT downloaded in this implementation |
| mendeley-pmdc-2021-v2 | [Two DC motors DOI:10.17632/2rkpsss6fd.2](https://data.mendeley.com/datasets/2rkpsss6fd/2) | Eleven experimental datasets, voltage/current/speed with two tested geared motors and loads | Not our 3 V motor or impeller; raw not downloaded into repo |
| nasa-battery-aging | [NASA Li-ion battery aging](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) | Charge/discharge and impedance at temperatures, cycles and state-of-health | Other Li-ion 18650 cells; no stated match to unspecified battery |
| nasa-battery-randomwalk-2 | [NASA randomized battery usage](https://data.nasa.gov/dataset/randomized-battery-usage-2-room-temperature-random-walk) | Four other 18650 cells with randomized load-cycle data | Not actual battery, no 3 V-assembled-system validation |
| nmb-fan-pressure-curve | [NMB fan performance guidance](https://nmbtc.com/white-papers/dc-brushless-cooling-fan-behavior/) | Pressure/flow and speed/current change with restrictions | BLDC characteristic guidance, not identified impeller test curve |
| nist-copper-resistivity | [NIST copper resistivity](https://www.nist.gov/publications/improved-estimation-resistivity-pure-copper-electrical-determination-thin-copper-film) | Copper property and temperature dependence | Material reference not actual wire length/contact/assembly test |
| nist-cfd-vvuq | [NISTIR 8298](https://www.nist.gov/publications/summary-industrial-verification-validation-and-uncertainty-quantification-procedures) | CFD error/uncertainty/validation approaches | Methods, not actual fan fluid/torque validation |

Both Mendeley dataset sources advertise **CC BY 4.0**. Reuse of
individual source files and other sites still requires checking the
applicable licence and original attribution. This PR did NOT download
the Mendeley CSV bundles, fabricate raw instrumentation, claim dataset
rows were ingested, or silently transfer those results onto an unknown fan.

## Actual numerical manufacturer-motor consistency check

For **Pololu part 1592 ONLY**, the published approximate 3 V reference
values are: no-load speed **20,000 RPM**, no-load current **0.350 A**,
stall current **4.000 A**, stall torque **55 gf·cm**.

These yield:

```text
Rstall ≈ V / Istall = 3 V / 4 A = 0.750 Ω
τstall = 55 × 9.80665e-5 N·m = 0.0053936575 N·m
Kt_from_stall = τstall / Istall = 0.001348414375 N·m/A
Ke_from_no_load = (V − I0 * Rstall) / ω0
                = (3 − 0.350 * 0.750) / (20000 * 2π/60)
                ≈ 0.00130705997014 V·s/rad
Kt/Ke approximate internal inconsistency ≈ 3.11465%
```

The units of Kt and Ke are numerically equivalent in coherent SI for an
ideal energy-conserving motor. However these derived values use
**different approximate manufacturer operating-point figures** and
assumptions. Their ≈3.11% difference is **NOT** a statistically
established model prediction error, is NOT a guarantee that a particular
motor is within that tolerance, and is NOT an independent measured fan
performance validation. Different motor, fan blade, wiring or 12 V BLDC
driver must not inherit these constants. Pololu also states that stall
operation or high voltage can shorten motor lifetime; do not extrapolate
stall current into a safe continuous operation rating.

## All 23 original evidence requirements (decomposed)

The machine-readable manifest enumerates 23 detailed fields in categories:

- **Source identity (1):** exact battery, wires, motor, impeller,
  controller versions, manufacturing batches.
- **Electrical and thermal (8):** battery OCV/SOC and impedance/capacity,
  harness/contact resistance, temperature coefficient and motor winding
  resistance, control topology and motor thermal response.
- **Motor/fan dynamics (4):** torque/back-EMF, startup/inrush, impeller
  geometry and torque/pressure/flow curves.
- **Environment/coupled physics (2):** temperature/altitude/air density
  and thermal time response.
- **Manufacturing and distributions (2):** actual assembly defects,
  correlated population statistics by part/lot.
- **Metrology, numerics, error and validation (5):** calibrated sensors,
  independent equation/solver tests, model discrepancy, independent
  operating envelope, reliability/safety.
- **Chain of custody (1):** licences, original raw source acquisition,
  calibration certificates, holdout provenance and approvals.

The exact per-field list, units, external candidate sources, applicability
and missing target-specific measurements are the versioned JSON catalog.
**1/23 is numerically verified as model mathematics; 0/23 is physically
qualified for the actual fan. This is a count of requirements, NOT a
percentage of model truth or manufacturing success.**

## Executable source audit and dataset import

```bash
node --test tests/phase32-source-evidence.test.mjs
node scripts/phase32-run.mjs
node scripts/phase32-strict.mjs
node scripts/browser-smoke.mjs
```

Future users who legally acquire *original OpenMCT 2026 v2 CSV logs* may
inspect their **structure**, not their origin, with:

```bash
node scripts/phase32-inspect-motor-csv.mjs /path/to/original-record.csv
```

The parser recognizes the published two metadata lines and 10-column
raw-log schema: REF, MEAS, DT_ms, CURRENT_RAW, CURRENT_AVG, PWM,
DMM_CURRENT_A, DMM_TIME_s, DMM_AGE_ms, DMM_SAMPLE_ID. It rejects
malformed/implausible records and emits a SHA256 of the bytes. **A
source hash is not independent proof of the data origin**, and a clean
CSV is not a physical validation of the selected fan. The raw stream
would still require authenticated publisher hash, known device
identity, acquisition details, uncertainty and independent holdout
validation before any model physical accuracy claim.

## Completion, physical gaps and generalization to other labs

**Completed in software in Phase32:** research sources documented and
pinned; numerical manufacturer-spec extraction and independent
unit conversion tested; 23 operational gaps enumerated; rigorous
source-to-target blocking; untrusted external CSV read/shape checker;
live Chip Lab source/measurement gap UI; source-locked CI evidence.

**Still missing to finish real fan prediction validation:**
actual specified battery/impeller/motor/controller records, original
matching-device measured loads and temperature transients, verified
joint distributions, BLDC or brushed topology confirmation, model error
residuals and independent blind devices from actual manufactured batches.

For **other Invention Lab domains** the same evidence topology applies
but requires different specialized data:
- **Analog semiconductor**: PDK/version, device curve/sweep from actual
  process, calibrated model cards, routing extraction and PVT, physical
  layout DRC/LVS, foundry-qualified coverage, post-silicon tests.
- **Digital/CPU**: formal specification, RTL/netlist equivalence,
  functional test coverage, architecture reference differential testing,
  real timing/energy per operating condition, fault and device variation.
- **AI accelerator**: ONNX/op reference correctness, quantization
  tolerances, workload/dataset holdouts and statistical inference errors,
  physical chip latency, thermal/power and fault characteristics.
- **Quantum circuit**: calibrated gate noise, coherence/decoherence,
  readout bias, crosstalk, topology, device-specific drift and
  experimentally tested outcomes; ideal numerical state vectors alone
  do not calibrate a qubit.
- **Any new invention**: exact component identifiers, source licences,
  versioned physics, coupled boundary/initial conditions, units, material
  data, manufacturing distributions, numerical convergence, declared
  acceptance, risk and target-specific validation-envelope uncertainty.

An unlimited catalogue of every possible invention is impossible to
complete in advance; a **source-locked requirement and provenance
gate that detects missing information** is the extensible engineering
solution. New project domains must add their own data and tests rather
than silently using a physically unrelated archive.

**Physical verdict:** UNKNOWN; actual authenticated battery–fan
experimental readings 0; original 8-bit ALU silicon readings 0.
Model success can be reported conditionally, but
`realWorldBuildSuccessPercent` remains `null` for these actual
unmeasured hardware targets. This is a fundamental provenance
boundary, not a ban on virtual experimentation.

All development PRs remain draft/open/unmerged as previously agreed;
the separate AeroForge project is untouched.
