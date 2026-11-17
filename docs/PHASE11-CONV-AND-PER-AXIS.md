# Phase 11 — Per-Axis Quantization and Quantized Convolution

## Scientific scope

Phase 11 adds a deliberately small, new **ONNX opset 13** numerical
subset to Invention Lab's **AI Accelerator Lab**. It extends, but does
not replace, Phases 9–10. Invention Lab covers computing, circuits,
semiconductors, quantum systems and engineering evidence. **AeroForge
is a different project and is not involved.**

The implemented, individually bounded operations are:

- **4D NCHW `QLinearConv`** with quantized int8/uint8 X and int8/uint8 W,
  per-tensor input/output scales and zero-points, per-output-channel
  weight scales and weight zero-points, optional int32 bias, group=1,
  explicit nonnegative padding, positive integer strides, and
  saturating signed/unsigned output. Padding uses the **input zero
  point**, so padding contributes zero to the real-valued convolution.
- **2D `QuantizeLinear → DequantizeLinear` with per-axis 1D scales and
  zero-points**, including negative indexing of the axis. The quantized
  intermediate Q and float32 output Y are visible separately.

These are **software functional arithmetic operations only**. There is
no actual silicon timing, performance/energy calibration, foundry PDK
rule check, manufacturing yield or validated hardware build success.

Official operator definitions:

- https://onnx.ai/onnx/operators/onnx__QLinearConv.html
- https://onnx.ai/onnx/operators/onnx__QuantizeLinear.html
- https://onnx.ai/onnx/operators/onnx__DequantizeLinear.html
- https://github.com/onnx/onnx
- https://github.com/microsoft/onnxruntime

The source version is intentionally **opset 13** rather than silently
using the newest operator revisions. The ONNX quantization and
dequantization operators allow 1D scales/zero-points along the axis;
the `QLinearConv` weight scales may be scalar or per output channel.
This phase intentionally uses a per-output-channel weight vector even
for one-channel convolution so the input contract is deterministic.

## Six frozen acceptance cases

The original, reproducible input fixture is
`benchmarks/phase11/cases.json`. Its output acceptance is separately
frozen at `benchmarks/phase11/acceptance.json`.

| Case | Model | Purpose |
| --- | --- | --- |
| `qconv-uint8-valid` | QLinearConv | Valid 2×2 kernel, uint8 offsets and full 2×2 output |
| `qconv-int8-pad-stride` | QLinearConv | Padding with input zero-point, strided spatial output and int32 bias |
| `qconv-mixed-per-channel` | QLinearConv | uint8 activations × int8 weights, two output channels, distinct per-channel weight scales, zero-points and biases |
| `qconv-int8-saturation` | QLinearConv | Signed 8-bit saturating positive and negative responses |
| `per-axis-int8-axis1` | Q/DQ | Signed per-column quantization, ties-to-even and dequantization |
| `per-axis-uint8-negative-axis` | Q/DQ | Negative axis, unsigned zero-points and clipping |

**Acceptance:** integer outputs and Q intermediates must agree
**exactly**; dequantized float32 outputs must meet fixed
`absolute error ≤ 1e-6` and scaled relative error
`abs(diff)/max(1,abs(reference)) ≤ 1e-6`. Numerical results
are compared against both the independent external runtime and
the separately committed expected arrays.

If the real runtime and the JavaScript reference disagree, this
phase reports a **FAIL**. No operator is marked unsupported/skipped
and counted as passing.

## Independent reference and provenance

In GitHub Actions, the mandatory
`.github/workflows/phase11-onnx-conv.yml` job installs **ONNX 1.23.2**,
**ONNX Runtime CPU 1.32.0** and **NumPy 2.4.6**. It builds each real
`ModelProto` at opset 13 using ONNX's official protobuf helper,
runs `onnx.checker.check_model` and executes the model with the
actual `CPUExecutionProvider`. No precalculated "reference" arrays
are substituted for execution.

The Python oracle is `scripts/phase11-onnx-oracle.py`; the JS
differential runner is `scripts/phase11-differential.mjs`. The
resulting evidence contains actual tool versions, model protobuf SHA-256,
actual output byte SHA-256, source and oracle SHA-256, exact commit,
case IDs, values, dtype and numerical error metrics.

The strict gate `scripts/phase11-strict.mjs` loads the actual
`.onnx` bytes and checks every model SHA against its evidence,
independently recalculates all six reference checks, and refuses
missing, extra, skipped, duplicate, reordered, stale, unknown,
nonfinite or corrupt cases. The GitHub artifact includes:

- six real `benchmarks/evidence/phase11-models/*.onnx` binaries;
- `benchmarks/evidence/phase11-quantized.json`;
- `benchmarks/evidence/phase11-summary.json`.

Unit tests cover independently frozen outputs and intentionally invalid
tensor dimensions, vector lengths, scale values, zero-points, padding,
stride, bias, signedness, source fingerprints and unsupported operations.
Headless Chromium tests the real browser output of
`qconv-mixed-per-channel` and negative-axis QDQ, while displaying the
explicit **MODEL-ONLY** warning.

All earlier workflows remain mandatory and untouched: Node
20/22/24, Chromium/WebGL/3D, 24 real Ngspice/Qiskit/NumPy
scientific cases, Phase 7 RV32I QEMU+NumPy, Phase 8 RV32IM QEMU,
Phase 9 float32 ONNX CPU and Phase 10 int8/uint8 quantized ONNX CPU.

## Limitations, physical-data blockers, and future roadmap

**Not supported:** general N-D ONNX import, arbitrary group/depthwise
convolution, dilations, auto-padding, dynamic shapes, strided per-axis
quantization with blocked granularity, mixed-precision int4/bf16/f16,
quantized attention, real pretrained models, MLPerf quality tests,
GPU memory hierarchy, cycle/power accuracy, RTL-to-GDS, or
silicon fabrication.

**Physical validation: NONE. Build-success probability: NOT
ESTIMATED.** Software agreement with an independent runtime validates
only these six bounded operator executions. The next milestones need
licensed model/dataset inputs, wider operator shape coverage,
independent model-level accuracy checks, actual chip architectural
timing, a pinned legally usable PDK, real post-layout DRC/LVS/STA,
device measurements, variability distributions and independent
calibration/holdout samples before scoped physical-equivalence
claims can be considered.

**Review policy:** Draft Phase 11 PR #11 is stacked on the still-unmerged
Phase 10 PR #10 → Phase 9 #9 → Phase 8 #8 → Phase 7 #7 → Phase 6 #6
→ Phase 5 #5 → Phase 4 #4. Phase 3 (#3) is separate. No auto-merge.
