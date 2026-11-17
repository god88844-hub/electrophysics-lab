# Phase 12 — Real Licensed Dataset, Frozen MLP, and Holdout Inference

## What changed

Invention Lab now evaluates a *complete small neural-network classification
model* against **real, independently labeled data**, rather than only
checking individual ONNX operator outputs.

This is a **small educational model-level correctness benchmark**. It is
NOT an MLPerf submission, not evidence of CPU/GPU/TPU hardware latency,
not process or chip manufacturing qualification, and not an estimated
real-world chip build-success probability. AeroForge remains a completely
separate aerospace project.

The AI Accelerator Lab includes a new **Run 30-sample Iris model benchmark**
action. The UI reports the 3-class confusion matrix, every holdout sample's
predicted class and confidence, and the observed holdout accuracy. The
browser runs only our JS float32 ONNX-subset evaluator; independent
scikit-learn/ONNX Runtime outputs are verified *separately* in CI.

## Dataset: real and redistributable with attribution

**Fisher, R. (1936). Iris [Dataset]. UCI Machine Learning Repository.**
DOI: https://doi.org/10.24432/C56C76

- Canonical dataset: https://archive.ics.uci.edu/dataset/53/iris
- Data license: **CC BY 4.0** (attribution preserved).
- Source: 150 biological observations, four measured flower dimensions in
  centimeters and one of three class labels (50 examples per class).
- In-repo actual CSV: `benchmarks/phase12/iris.csv`, copied from the
  bundled `sklearn/datasets/data/iris.csv` at the official scikit-learn
  tag `1.8.0` (original Git blob SHA
  `b7f746072794309a9a971949562a050e7366ceb1`). This repository
  snapshot preserves original label coding 0/1/2, a count header and all
  150 rows; the independent Python job compares every row to real
  scikit-learn `load_iris()`.
- Original machine-readable example and fixture:
  `benchmarks/phase12/iris-mlp.json`; includes attribution, all frozen
  training/test row IDs, true holdout labels, held-out raw inputs,
  train-only scaler parameters, the fitted model's numerical weights,
  and graph topology. Every source file is SHA-256 fingerprinted in CI.
- scikit-learn source code is separate, BSD-3-Clause:
  https://github.com/scikit-learn/scikit-learn
  The **dataset** license is CC BY 4.0, not automatically BSD solely
  because scikit-learn bundles a snapshot of it.

**The dataset was actually acquired and committed**, rather than merely
linked or declared "downloaded." No inaccessible proprietary model weights
were substituted.

## Real holdout protocol

A **stratified 80/20 split** is frozen with random seed `2026`:
**120 training samples and 30 distinct unseen holdout samples**,
with 40/10 training/test rows per class.

- `StandardScaler` is fit to the **120 training samples only**;
  it cannot see any held-out features or labels during fitting.
- A six-hidden-unit **MLPClassifier** uses ReLU, the Adam optimizer,
  frozen learning rate, seed, alpha, convergence controls, and max
  iterations. The coefficient arrays are text, not unsafe pickles or
  executable untrusted model code.
- The topological graph is
  `Gemm → Relu → Gemm → Softmax`, ONNX **opset 13**,
  2D fixed-shape float32, using the already tested JS operator engine.
- The first local frozen model run scored **29/30 (96.7%)**,
  with confusion matrix (rows=true class, columns=predicted class):

  | | setosa | versicolor | virginica |
  | --- | ---: | ---: | ---: |
  | setosa | 10 | 0 | 0 |
  | versicolor | 0 | 10 | 0 |
  | virginica | 0 | 1 | 9 |

This is a **30-example sample estimate**, not a promise of generalization
accuracy and not a representative production AI benchmark. For a wider
engineering assessment, more data, classes, datasets, cross-validation,
confidence intervals, distribution shift and model-task benchmarks will
be required.

## Actual independent model-level references

`.github/workflows/phase12-iris.yml` provisions a fresh Python 3.12
environment with real independently installed:

- scikit-learn `1.8.0`
- NumPy `2.3.5`
- SciPy `1.17.0`
- ONNX `1.23.2`
- ONNX Runtime CPU `1.32.0`

Actual engine versions are checked and recorded at runtime.

`scripts/phase12-iris-reference.py` validates every source CSV row,
the 120/30 split and 40/10 per-class balance, refits the scaler on
training rows only, and actually trains an independent sklearn MLP with
the pinned recipe. The frozen model is executed using genuine
**`MLPClassifier.predict_proba`** and also converted to an actual
ONNX `ModelProto` evaluated using **`CPUExecutionProvider`**.
The real `.onnx` binary is archived.

`scripts/phase12-iris-differential.mjs` independently evaluates all
30 holdout rows through our JS operator engine, and compares each
**3-class probability vector** with both actual external engines.
The allowed absolute error is **1e-4**, fixed in
`benchmarks/phase12/acceptance.json` before comparison.
Predictions, true labels, per-class confusion matrix, the exact
29/30 score, train/test independence and complete result row order
must also agree.

The final independent `scripts/phase12-strict.mjs` checks the CSV,
30 held-out features and original labels, training-only scaler
statistics, signed source commit, actual ONNX model binary SHA-256,
original dataset/license identity, model/source and oracle hashes,
actual tool versions, all 30 external probability reports, and the
unchanged threshold. Missing, skipped, reordered, duplicate,
falsified, stale or nonfinite data **FAILS**; no missing tool is
reported as PASS.

Evidence artifact:
`phase12-licensed-iris-sklearn-onnx-model-evidence`, including the
frozen complete licensed CSV, model fixture, actual generated ONNX
protobuf, per-sample numerical comparisons and strict summary.

## Scope, no-go conditions and future data procurement

No actual semiconductor manufacturing data, instrument observations,
device variability, transistor PDK qualification, GPU/TPU reference
hardware performance, inference latency/energy, production yield,
MLPerf reference model or full ONNX model zoo has been acquired.

A 96.7% *botanical classification* score cannot establish the
probability that any proposed integrated circuit works or can be
fabricated. **Physical validation = none; real-world hardware
build-success percentage = not estimated.**

Follow-up work should cover independently licensed representative
vision/audio/text workloads; real model weights and preprocessing
with documented task-level holdout evaluation and accuracy metrics;
larger independent test sets, repeated split protocols, calibrated
memory/performance models, and eventually physical process-specific
measurements as separate gates.

Phase 12 is a **draft stacked PR #12** on the unmerged PR #11 →
#10 → #9 → #8 → #7 → #6 → #5 → #4. PR #3 is separate.
No merges or changes to AeroForge are authorized.
