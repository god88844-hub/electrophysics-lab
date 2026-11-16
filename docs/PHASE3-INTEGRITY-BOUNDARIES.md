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

Three separate digests are maintained:
- `source.rawFileSha256` identifies the original instrument-export bytes
  (supplied from the actual source artifact, never fabricated by the parser).
- `source.datasetSha256` is recomputed from the normalized dataset content,
  including observations and relevant metadata. `parseDataset()` rejects any
  imported JSON whose recorded digest does not match its contents.
- `textSha256` identifies the exact imported serialized JSON bytes.

`deriveDataset()` produces a new dataset digest for its transformed observations,
retains the unchanged original raw-file digest, and records
`source.parentDatasetSha256` together with transformation provenance.

**Important:** these checks detect mismatches and tampering without a recomputed
hash; because hashes are not digital signatures, a party able to rewrite both
content and checksums can fabricate a self-consistent artifact. Independent
acquisition attestation is still required for physical validity.

## Validation criteria and experimental holdout

`registerValidationPlan()` creates an immutable, scope-bound, in-process
acceptance plan. It must match the model, dataset, envelope, intended use and
thresholds. This detects common software mistakes, but does not independently
establish that a human approved the criteria before seeing measurements.

For calibrated parameters, a free-text `calibrationRef` is not a certificate.
A dataset-bound split manifest identifies its source dataset ID, version,
content digest, group field and sample indices. `verifySplit()` rejects
wrong-source datasets, modified groups, overlapping calibration/validation
sample indices, invalid indices and changed manifest partitions.

The calibration record stores the actual fitted numerical vector digest and
model ID. The validation gate checks that digest against the specified source
observations and quantity; it also checks the fitted parameter values, model
identity, convergence, identifiability and the manifest's creation sequence.
Only indices assigned to the *validation* partition are compared against the
held-out results. A dataset-level checksum match is not itself leakage when
the calibrated and held-out subsets of the same acquisition are disjoint.

The software cannot prove that the caller's numerical model function did not
consult the holdout data, or that separate acquisition sessions are truly
independent. Such scientific review remains an explicit external requirement.

Each envelope tested point must be mapped to a specific observation in the
same immutable dataset via `envelope.evidence` (dataset ID, version, digest,
tested sample indices). Missing, mismatched or invented point mappings block
eligibility. The validator checks every compared condition against that
envelope, including categorical conditions; empty domains, unsupported points,
unverified extrapolation and interpolation cannot inherit positive coverage.

Incomplete comparisons, missing/nonfinite/negative measurement uncertainty,
and unknown or invalid acceptance criteria all independently block positive
eligibility. Reports distinguish `model-disagreement` from
`invalid-or-incomplete-measurement-data` and `insufficient-comparisons`.
Results include the dataset/source fingerprints, registered validation-plan
digest, holdout partition reference and scoped envelope evidence.

## Physical evidence policy

The currently implemented programmatic gates can yield a
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
