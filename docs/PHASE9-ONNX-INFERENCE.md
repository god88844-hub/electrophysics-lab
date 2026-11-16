# Phase 9 — Small ONNX Graphs, Independent ONNX Runtime CPU Validation

**Status:** a tightly bounded accelerator numerical-correctness extension.
This work does not implement a real GPU or TPU, an entire ONNX inference
runtime, a production accelerator, MLPerf, physical validation or physical
manufacturing-yield prediction.

## Data and primary sources

The core source of meaning is the published **ONNX operator specification**:

- [ONNX MatMul](https://onnx.ai/onnx/operators/onnx__MatMul.html)
- [ONNX Gemm](https://onnx.ai/onnx/operators/onnx__Gemm.html)
- [ONNX Add](https://onnx.ai/onnx/operators/onnx__Add.html)
- [ONNX Relu](https://onnx.ai/onnx/operators/onnx__Relu.html)
- [ONNX Sigmoid](https://onnx.ai/onnx/operators/onnx__Sigmoid.html)
- [ONNX Softmax](https://onnx.ai/onnx/operators/onnx__Softmax.html)
- [ONNX repository](https://github.com/onnx/onnx)
- [ONNX Runtime repository](https://github.com/microsoft/onnxruntime)

As verified on 2026-11-17, official PyPI distributions exist for
**onnx==1.23.2** and **onnxruntime==1.32.0**; NumPy is pinned to **2.4.6**
as in our Phase 7 reference. These packages are installed in a fresh
Python 3.12 environment inside Phase 9 GitHub Actions. The CI step records
their actual versions; an installation error or different versions fails.
The Python reference builds *actual ModelProto objects* with opset import
**13** and executes them using **CPUExecutionProvider**.

No off-site pretrained weights or restricted test datasets are required
for this small numerical slice. All five example graphs and input weights
are *original, checked into our repository*, legally reproducible without
downloading a third-party model.

## Delivered user interface

In **AI Accelerator Lab**, choose from the ONNX operator-graph examples
and select **Run ONNX subset graph**. This invokes the same JavaScript
numeric kernel used in our accelerator models and displays a clear
model-only execution trace and tensor values.

The five examples are checked in at `benchmarks/phase9/graphs.json`:

| Case ID | Operators | Scientific purpose |
| --- | --- | --- |
| `matmul-relu` | MatMul → Relu | Matrix multiplication and negative-value clipping |
| `gemm-sigmoid` | Gemm → Sigmoid | Dense layer, alpha/beta, broadcast row bias and nonlinear activation |
| `add-softmax` | Add → Softmax | Row broadcasting and normalized probabilities |
| `gemm-transpose` | Gemm | transA/transB, alpha and beta |
| `two-layer-mlp` | Gemm → Relu → Gemm → Softmax | Four-stage 2-D feed-forward graph |

The browser does **not** embed ONNX Runtime or claim an independent
reference PASS. It executes a separate bounded JSON representation of
the same operator graph.

The subset is **fixed-shape 2-D float32 only**. In particular, it does
not support arbitrary N-D ONNX MatMul broadcasting, convolution, attention,
transformers, f16/bf16/int8 quantization, full graph import from
untrusted protobuf, dynamic shapes, multiple batches beyond the fixed
fixture, arbitrary custom operators, or ONNX's full operator set.
Unsupported operators, attributes, shapes and graph references fail closed.

## Evidence and CI execution

1. The Python reference `scripts/phase9-onnxruntime-oracle.py`
   constructs/checks a real ONNX model from each fixture and evaluates
   it on the CPU using ONNX Runtime.
2. The JS driver `scripts/phase9-onnx-differential.mjs` runs the same
   frozen graphs through the Invention Lab subset evaluator, checks
   shapes and numerical outputs against real ORT outputs, and writes
   an evidence report **only if every case passes**.
3. Numerical comparisons require **maxAbsoluteError ≤ 1e-5 and
   maxRelativeError ≤ 1e-5**, with relative error defined here as
   `abs(a-b)/max(1,abs(reference))`. These tolerances are fixed in a
   separate `benchmarks/phase9/acceptance.json` manifest and hard-coded
   in the gate, rather than being estimated after results are seen.
4. Evidence includes actual ONNX protobuf binary digests, output-byte
   digests, input fixture SHA-256, Python oracle source SHA-256, real
   library versions, each output vector, commit ID and the definition
   of physical evidence as `none`.
5. `scripts/phase9-strict.mjs` independently recomputes error figures
   and output checksums. Missing, skipped, reordered, duplicate or
   unsupported cases, missing files, hash drift, source SHA mismatch
   and fabricated physical-success claims cause failure.
6. Unit tests deliberately corrupt the accepted evidence and graph
   definitions to confirm that false PASS is impossible. A real
   headless Chromium test exercises the UI with the graph fixture.
7. All existing Node 20/22/24, browser 3D, Ngspice/Qiskit/NumPy
   (24 cases), Phase 7 GNU/QEMU and Phase 8 RV32M QEMU jobs must
   remain green and unchanged.

The strict independent workflow is
`.github/workflows/phase9-onnx.yml` and uploads a
`phase9-onnxruntime-independent-evidence` GitHub Actions artifact.

## Research gaps and next phases

- **Full ONNX compatibility:** broader operator coverage, ONNX official
  backend operator tests, dynamic tensor dimensions, import of real
  ModelProto binaries, secure tensor resource limits, opset versioning,
  and comprehensive differential checking.
- **Accelerator model precision:** int8/int4 quantization, saturation,
  bf16/f16, floating accumulations and numerical uncertainty with
  independently defined reference acceptance criteria.
- **Representative inference:** license-reviewed model weights and input
  datasets, preprocessing/postprocessing, accuracy metrics, task-level
  fixtures, ONNX Runtime and MLPerf-style benchmark environments.
- **Architecture timing:** measurable SRAM/memory bandwidth, caches,
  on-chip routing, systolic MAC timing, energy/power/thermal and
  physical silicon characterization.
- **Fabrication:** pinned process-specific PDK, real DRC/LVS/STA,
  parasitic extraction, process corners, calibrated device statistics
  and physical measurements. Only after independent calibration and
  validation could a project-specific build-success probability be
  considered.

No model-only PASS, ONNX Runtime output agreement, or simulation
agreement can be relabelled as demonstrated physical validity. The
repository's physical build-success percentage remains **not estimated**.

**PR policy:** Phase 9 is stacked on unmerged PR #8 (which is stacked on
PR #7 → #6 → #5 → #4). PR #3 is separate. No auto-merge. AeroForge
remains a separate aerospace project.
