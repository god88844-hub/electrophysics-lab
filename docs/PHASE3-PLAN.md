# Phase 3 Implementation Plan — Experimental Validation, Calibration, and UQ

Baseline: `main @ 1a01718`. Branch: `feature/physical-validation-foundation`.
Verified before work: Node v25.9.0, 168/168 unit tests, 10/10 Ngspice benchmarks.

## Mission boundary

Build the *infrastructure* for measurement ingestion, provenance classification,
calibration, uncertainty quantification, experimental comparison, and validation
envelopes. No real physical measurements exist in this repository — therefore the
`physicalValidation` evidence stage remains `none` at the end of this phase, and
every synthetic fixture is conspicuously labelled `synthetic-test-fixture`.
Software acceptance and experimental acceptance are two different milestones
(`docs/PHASE3-ACCEPTANCE.json`).

## Modules (all in `js/measure/`, pure Node, DOM-free, unit-testable)

### 1. `dataset.js` — measurement data model
- Versioned format `invention-lab/measurement-dataset/1`.
- JSON ingestion (full dataset) and CSV ingestion (samples) with JSON metadata.
- Metadata schema per Phase 3 §2: id/version, origin, source file reference,
  experiment id/date, specimen, configuration, nominal + independently known
  component values, operating/environmental conditions, instrument records
  (manufacturer/model/serial/resolution/uncertainty/calibration certificate),
  quantities + units + conventions, sampling/timestamps/synchronization,
  replicates, uncertainty + covariance, systematic corrections, missing-data
  markers, acquisition procedure, license/provenance, SHA-256 checksums.
- Origin trust classification: `real-measurement`, `synthetic-test-fixture`,
  `analytical-reference`, `numerical-reference`, `unknown-origin`.
- Immutability: datasets are frozen; every transformation returns a new object
  with a recorded transformation entry (from → to, method, parameters).
- SHA-256 checksums of the raw source text (`node:crypto`).

### 2. `quality.js` — ingestion QC and quality report
- Checks per Phase 3 §4: schema/format, required metadata, SI units (unknown
  units rejected via `js/core/units.js`), timestamps/sampling intervals, finite
  values, physical plausibility ranges, duplicates, missing values, resolution,
  calibration metadata presence (missing certificate recorded as missing — never
  inferred), replicate structure, time alignment, outlier *identification* (never
  silent removal), correlated-measurement flagging, checksum verification,
  immutability verification.
- Quality verdict per dataset: `accepted` / `conditionally-usable` / `rejected`,
  always with detailed reasons. Distinguishes provenance (where data came from)
  from quality (whether it is usable for quantitative validation).

### 3. `calibration.js` — parameter estimation engine
- Weighted and unweighted nonlinear least squares via Levenberg–Marquardt with
  box bounds (projection), numeric Jacobians (central differences), multistart
  (seeded, deterministic), convergence diagnostics (iterations, final cost,
  step norms, termination reason).
- Identifiability diagnostics: symmetric eigen-decomposition of J^T J; condition
  number; near-zero eigenvalues → non-identifiable parameter combinations, no
  confidence intervals for them; collinearity detection (the voltage-divider
  ratio case: V_out = V_in·R2/(R1+R2) cannot identify R1 and R2 separately).
- Covariance estimate σ²(JᵀJ)⁻¹ over identifiable directions; parameter
  confidence intervals (normal approximation, documented; exact t-quantiles are
  future work — recorded as a limitation).
- Residual analysis: residuals, weighted residuals, RMS, bias.
- Calibration record: dataset reference + checksum, model id/version, parameter
  start/end values, optimizer configuration, residuals, covariance, CIs,
  convergence, provenance.

### 4. `split.js` — calibration/validation partitioning
- Split manifests created BEFORE fitting, immutable (frozen + checksummed).
- Group-based partitioning (by specimen / session / operating condition /
  replicate group) — never random-row splitting by default; leakage check
  verifies that no calibration group key appears in the validation group.

### 5. `uq.js` — uncertainty quantification (JCGM GUM-guided)
- First-order propagation: y = f(x), Cy = Jₓ·Cx·Jₓᵀ with numeric Jacobian.
- Monte Carlo propagation (JCGM 101 style): multivariate normal sampling via
  Cholesky (with explicit failure on non-positive-definite covariance),
  deterministic seeds, percentile/mean/std outputs.
- Bootstrap resampling (seeded) where justified.
- Explicit independence discipline: combined uncertainty requires either a
  documented correlation matrix or fully independent inputs — no blanket RSS.
- Prediction intervals from MC samples; expanded uncertainty U = k·uc with k
  stated. Parameter CIs vs prediction intervals vs measurement uncertainty are
  distinct outputs, never merged silently.

### 6. `envelope.js` — validation envelopes
- Machine-readable envelope: per-quantity ranges/sets, specimen/hardware/model
  assumptions, required accuracy, intended decision.
- Tested-point coverage recorded from the validation dataset.
- Classification of any requested prediction: `within-demonstrated-envelope`,
  `interpolation-with-limited-evidence`, `outside-demonstrated-envelope`,
  `unsupported`, `insufficient-evidence`. Multidimensional requests are NOT
  covered by separate min/max bounds: coverage requires nearby tested points.

### 7. `validation.js` — experimental comparison engine
- Inputs: model adapter (params fixed), declared intended use, independent
  validation dataset (origin must be `real-measurement` for a physical claim),
  matching operating conditions, measurement uncertainty, numerical uncertainty,
  prespecified criteria, envelope.
- Outputs: measured vs predicted values, residuals, abs/rel errors, bias, RMSE,
  uncertainty intervals, measurement coverage, statistical diagnostics,
  agree/disagree conditions, evidence limits.
- Trust gate: a validation against a synthetic/analytical/numerical dataset
  produces a **software demonstration** result, never a physical-validation
  claim. Physical validation evidence stays `none` unless a `real-measurement`
  dataset with adequate quality is used — and none exists in this phase.

### 8. `experiments/` — the three initial experiments
- `divider.js`, `rc.js`, `diode.js`: model adapters + synthetic fixtures
  (`synthetic-test-fixture`, seeded, used ONLY to exercise the software),
  dataset templates (empty, with metadata placeholders), and JSON experiment
  definitions (calibration/validation variables, envelope).
- Acquisition protocols: `docs/EXPERIMENT-A-DIVIDER.md`, `EXPERIMENT-B-RC.md`,
  `EXPERIMENT-C-DIODE.md` — low-voltage, current-limited setups; instruments
  vs calibration records distinguished; calibration/validation separation
  specified.

### 9. Evidence integration
- `validation.js` produces stage records consumable by
  `js/core/validation.js`: a `calibration` stage citing the calibration record;
  a `physicalValidation` stage that remains `none` for synthetic/analytical
  data and can only become positive with a real-measurement dataset + quality
  acceptance + prespecified criteria + envelope.
- No global physical-validity percentage; no inheritance from unrelated
  benchmarks.

### 10. UI
- New "Validation" workspace tab: dataset import (JSON/CSV), provenance and
  quality review, calibration/validation dataset selection, fitting
  configuration, parameter + uncertainty display, measured-vs-simulated curves
  and residuals, envelope coverage, evidence-stage panel. Numerical agreement
  and experimental validation remain visually distinct; unknown/absent evidence
  never renders as a green PASS.

### 11. CI
- Keep the Node 20/22/24 unit matrix and the strict external-validation job.
- New `phase3` job: dataset schema checks, calibration tests, UQ tests,
  synthetic-fixture regressions. Missing physical data can never turn a
  physical-validation result green; the summary records exactly which tests
  used synthetic fixtures (all of them, in this phase).

### 12. Acceptance specification
- `docs/PHASE3-ACCEPTANCE.json`: software acceptance (infra works, tests pass)
  vs experimental acceptance (requires genuine physical data — NOT met in this
  phase). Validation thresholds are prespecified before looking at results.

## Test map (Phase 3 §14 → tests/bench.test.mjs additions in `tests/measure.test.mjs` + `tests/phase3.test.mjs`)

| §14 requirement | Test |
|---|---|
| genuine vs synthetic classification | dataset origin gate: synthetic → physicalValidation blocked |
| missing experimental provenance | dataset without origin/instrument metadata → conditionally-usable/rejected |
| unit mismatches | unsupported unit → rejected |
| missing uncertainty | validation without measurement uncertainty → inconclusive, never PASS |
| malformed calibration metadata | missing certificate → recorded as missing |
| corrupted data / checksum mismatch | checksum verification fails |
| non-finite measurements | QC rejects |
| repeated/correlated observations | replicate structure + correlation flagging |
| valid uncertainty propagation | first-order + MC agree within MC error (seeded) |
| incorrect independence assumptions | correlated inputs without covariance → refused |
| Monte Carlo reproducibility | same seed → identical results |
| calibration convergence failure | unreachable target → explicit convergence failure |
| non-identifiable parameters | divider ratio case → detected, no per-param CIs |
| parameter bounds | bounded LM respects bounds |
| calibration/validation leakage | overlapping group keys → leakage error |
| fit vs held-out failure | overfit synthetic model fails held-out validation honestly |
| valid/invalid uncertainty intervals | interval ordering checks |
| envelope boundaries | classification matrix |
| unsupported extrapolation | outside-envelope never inherits PASS |
| missing physical measurements | physicalValidation stays none |
| fabricated evidence labels | synthetic dataset cannot unlock physical stage |
| report provenance / artifact integrity | checksums recorded + verified |
| Phase 1/2 acceptance preserved | existing suites untouched |

## Execution order

1. dataset.js + quality.js → tests
2. uq.js → tests
3. calibration.js + split.js → tests
4. envelope.js + validation.js → tests
5. experiments + fixtures + templates + protocols
6. evidence integration + UI
7. CI + docs + acceptance spec
8. Full verification (unit suite, Phase 2 benchmarks unchanged), PR (not merged)

## Explicit non-goals for this phase

- No fabricated measurements, certificates, or validation claims.
- No formal NASA-STD-7009 / JCGM certification claim — guidance only.
- No generalization of validated experiments to untested systems.
- No automatic merging.
