# Phase 3 evidence-integrity boundaries

**Project:** Invention Lab — electronic circuits, chips, computer architecture,
binary and ternary logic, and quantum computing. AeroForge is a separate project
and has no dependency on this work.

## Status

The Phase 3 measurement engine can ingest labelled datasets, compute residuals,
fit parameters and quantify numerical uncertainty. **There are no authenticated
physical measurements in this repository, and physical validation is NONE.**

No generated fixture (including a fixture labelled `real-measurement` for a
unit test) is independent evidence that a physical experiment occurred.

## Raw-file integrity versus experimental authenticity

`verifySourceReceipt(dataset, originalRawText, { acquisitionRecordId })`
verifies the checksum of the original instrument-export text and returns an
in-process, dataset-bound receipt. The receipt binds the dataset ID, the
dataset-source checksum, the raw-file checksum and the sample-content hash.

A receipt means **the bytes match a recorded hash**. It does not prove that
those bytes came from a real instrument, that the instrument was in calibration,
or that the acquisition record is independently authentic.

`provenanceVerified: true`, an unregistered object shaped like a receipt,
or a caller-authored `quality: { verdict: "accepted" }` cannot bypass the
gates. Quality is recomputed from the actual dataset.

Original raw-file, dataset-source, and serialized-JSON hashes are stored
separately; parsing must not overwrite the original instrument-export hash.
Derived records retain the parent dataset-source checksum.

## Validation criteria and experimental holdout

`registerValidationPlan()` creates an immutable, scope-bound, in-process
acceptance plan. It must match the model, dataset, envelope, intended use and
thresholds. This detects common software mistakes, but does not independently
establish that a human approved the criteria before seeing measurements.

For calibrated parameters, a free-text `calibrationRef` is not an adequate
independent-holdout certificate. The engine refuses to promote a claim without
bound records of the fitting observations and validated split metadata.
Positional split arrays alone cannot verify independence across separate
acquisitions or measurement sessions.

All measurement conditions must be compared with the declared tested envelope;
hard-coded `within-demonstrated-envelope` classifications are forbidden.

## Physical evidence policy

The currently implemented programmatic gates can yield an
`candidate-for-independent-review` eligibility indication; they **cannot**
yield an independently substantiated experimental validation certificate.

The `physicalValidation` stage remains `none`. A later, separately audited
physical-evidence workflow must verify acquisition provenance, calibration
documents, independent holdout, prespecified criteria and applicability before
the application can support any scoped physical-validation conclusion.

This is a deliberate fail-closed policy, not a claim that calibration,
verification and validation have been completed.

## How to verify

- `npm test`: repository regression tests, including evidence-integrity cases.
- GitHub Actions unit CI: Node 20/22/24 (may report a declared external-tool skip).
- GitHub Actions external validation: real Ngspice/Qiskit/NumPy reference
  engines, including the strict 24-case Phase 2 acceptance manifest.

Passing any of these tests demonstrates software behavior and numerical
cross-solver agreement within the benchmark suite; it is not a substitute for
physical measurement and experimental validation.
