# Phase 42 — Source-preserving instrument data capture and independent verification protocol

## Outcome

The **software acquisition protocol and strict integrity gate are implemented**. This phase provides a raw instrument CSV schema, required specimen/lot provenance, calibration/uncertainty requirements, separate independent-review decisions, a quarantine importer, a blank physical-capture report and CI regression tests that reject fabricated experimental success.

**No real fan hardware has been assembled, tested or calibrated in this phase.** Phase41's research motor listing is discontinued, its exact impeller and containment are unknown, and the two-AA-cell supply has no demonstrated adequate fault/startup current capacity. These unresolved safety issues block running a real spinning motor–fan experiment.

## Real source schema

Original raw source text CSV header:

```csv
t_s,pack_v,motor_v,motor_current_a,shaft_rpm,motor_temp_c,ambient_temp_c
```

Time in seconds; pack/motor terminal voltages in V; upstream motor current A; actual sensor shaft speed rpm (not controller setpoint); case temperature and ambient temperature in Celsius. The exact sampling rate and sensor bandwidth cannot be pre-asserted without choosing real equipment. Temperature sensor placement, shaft tach pulses per revolution and calibration references must be identified during approved procedure design.

Instrument provenance requires original raw-file SHA256, actual purchased battery-cell, motor, wire harness and impeller specimen identities, test date/operator ID, instrument serial/calibration records, electrical and mechanical safety review refs, and a preregistered group-based holdout plan.

The CSV importer (`js/measure/phase42-capture-gate.js`) checks exact seven-column schema, numerical finiteness, physical plausibility, monotonically increasing timestamps, time-ordered sample count, claimed original raw-source SHA256, and presence of metadata. It can summarize imported measurements but **never authenticates that a submitted file is physical data**. Even a file with self-consistent SHA256 and fake calibration strings returns **QUARANTINED_AWAITING_EXTERNAL_INSTRUMENT_AND_HARDWARE_REVIEW**. A hash proves submitted bytes match an asserted digest, not that those bytes came from an instrument.

## Experimental prerequisites

The physical program needs: (1) exact manufactured/traceable full BOM and lot IDs, (2) battery/current and fault protection review, (3) independently approved high-speed impeller design and protective enclosure, (4) suitable calibrated instruments and acquisition timebase, (5) preregistered no-leakage validation criteria and hardware-group holdout, and (6) responsible and approved safety procedure. Never spin an unverified blade.

Published NASA-STD-7009B and NIST measurement guidance informed these requirements, but this implementation is **not certified standards compliance**. The historical 24V BLDC brake-bench records are not source-matched target fan measurements.

## Run

```bash
node --test tests/phase42-capture-gate.test.mjs
node scripts/phase42-run.mjs
node scripts/phase42-strict.mjs
npm test
node scripts/browser-smoke.mjs
```

Published output: `benchmarks/evidence/phase42/phase42.json`, containing zero original matched device readings and fail-closed physical-release status.

Next phase after selected hardware and external review: battery measurements/calibration at independent conditions with a reference design actually built and independently instrumented. Until then, `physicalValidation=none`, `physicalVerdict=unknown`, `realWorldBuildSuccessPercent=null`, `physicalHardwareValidationAuthorized=false`. This work is isolated to Invention Lab, not AeroForge.
