# Phase 10 — Quantized ONNX: Signed/Unsigned 8-Bit Functional Evidence

This phase extends **Invention Lab** only. It does not touch
**AeroForge** (separate aerospace project).

## Scientific scope

A new, **opt-in 2-D inference subset** models:

- ONNX opset 13 `QLinearMatMul` with signed **int8** or unsigned
  **uint8**, per-tensor scalar quantization scales and zero points,
  integer accumulation, output quantization and saturation;
- `QuantizeLinear` → `DequantizeLinear` on 2-D float32 tensors using
  signed/unsigned 8-bit quantization, with the actual low-precision
  intermediate visible.

The authoritative public specifications are:

- https://onnx.ai/onnx/operators/onnx__QLinearMatMul.html
- https://onnx.ai/onnx/operators/onnx__QuantizeLinear.html
- https://onnx.ai/onnx/operators/onnx__DequantizeLinear.html

The ONNX specification mandates **round-to-nearest ties-to-even** and
saturation to the dtype's representable bounds. This implementation uses
the normal zero-point-adjusted integer dot product, scales the result,
rounds, adds output zero point and clips. Each invalid scale, zero point,
shape, dtype, tensor value or operation fails rather than being coerced
to PASS. In contrast to prior floating-point-only experiments, we
enforce signed `[-128,127]` and unsigned `[0,255]` ranges explicitly.

**Precision boundary:** this is a *small per-tensor 2-D slice*. It does
not support per-axis quantization, int4, int16, mixed signedness,
quantized convolutions/attention, arbitrary dynamic ONNX dimensions,
full ONNX protobuf import, GPU/TPU cores, calibrated throughput,
system memory bandwidth, power or thermal models.

**Upstream caveat:** a reported discrepancy between the wording of
`QLinearMatMul`'s rounding order and some reference implementations
appeared in ONNX issue #8672 (October 2026), subsequently closed with
references to #8700. This phase avoids exact halfway QLinearMatMul
cases in the external frozen corpus; explicit ties-even behavior is
tested on `QuantizeLinear` inputs separately. We do **not** claim
cross-implementation bitwise identity for every possible input.

## Frozen numerical data

`benchmarks/phase10/quantized-cases.json` contains six small original
fixture definitions (no third-party pretrained model weights):

| Case | Independent validation objective |
| --- | --- |
| `qlinear-int8-symmetric` | Signed zero-point-free 2×3×2 dot product |
| `qlinear-uint8-offset` | Unsigned asymmetric input/output zero points |
| `qlinear-int8-saturation` | Positive and negative output clamps |
| `qlinear-uint8-saturation` | Output clamps at 0/255 |
| `qdq-int8-ties-even` | Signed halfway rounding, dequantized float values |
| `qdq-uint8-offset-saturation` | Unsigned offset, clipping and inverse scaling |

`benchmarks/phase10/acceptance.json` contains **six frozen expected
output arrays**, dtype-specific exact integer acceptance and a separately
bounded float32 dequantization comparison (`abs ≤ 1e-6`, scaled relative
difference `≤ 1e-6`). No test case or threshold may be silently
altered to hide a mismatch.

## Independent runtime and reproducibility

`scripts/phase10-onnx-oracle.py` constructs **actual ONNX ModelProto**
files with ONNX 1.23.2 and executes all six on **ONNX Runtime 1.32.0
CPUExecutionProvider**, using NumPy 2.4.6. Installation of those real
packages is mandatory in the new CI workflow.

`scripts/phase10-quantized-differential.mjs` runs the same committed
input fixtures in the JavaScript model and compares every actual ONNX
Runtime quantized output. For the Q/DQ cases, the independent
**integer Q intermediate** and **float32 Y output** are both checked.

`scripts/phase10-strict.mjs` then independently verifies:

- source and Oracle Python SHA-256;
- six output IDs, dtype, order, expected values, error limits;
- actual model protobuf file SHA-256, output raw byte SHA-256;
- reference engine and pinned tool versions;
- an exact source-commit binding and complete output provenance;
- rejection of missing, skipped, duplicate, reordered, stale, malformed,
  nonfinite or falsely physical claims.

The CI artifact `phase10-quantized-onnx-independent-evidence` includes
the actual six generated `.onnx` model files, the numerical report and
the strict summary. A missing runtime/reference model is a **failure**,
not a declared or invented PASS.

The Node unit suite tests rounding boundaries, saturating arithmetic,
zero-point handling, malformed tensor/scale/dtype rejection and the
evidence-gate's mutation controls. The real Chromium UI smoke executes
both a signed `QLinearMatMul` and unsigned Q/DQ example.

All previous CI workflows remain mandatory: Node 20/22/24, 3D browser,
24/24 Ngspice/Qiskit/NumPy scientific benchmarks, Phase 7 real RISC-V
and NumPy, Phase 8 independent RISC-V M extension and Phase 9 real
float32 ONNX Runtime.

## Physical evidence remains absent

**Physical validation: NONE. Real-world hardware build-success:
NOT ESTIMATED.** Comparing JavaScript to ONNX Runtime is evidence
about bounded mathematical operations, not manufacturing, device
frequency, memory energy, quantized neural-network model accuracy or
chip yield.

Future engineering tasks require real model datasets with documented
license/provenance, ONNX official backend tests, additional precision
formats, accelerator memory/timing and post-layout silicon
measurements. Any claim of manufacturing success would require actual
foundry/process data, real device measurements and independent
calibration/holdout testing. Public PDK documentation alone cannot
substitute for that.

**PR dependency and review:** This work is draft PR #10, stacked on
Phase 9 (#9) → Phase 8 (#8) → Phase 7 (#7) → Phase 6 (#6) →
Phase 5 (#5) → Phase 4 (#4); PR #3 is separate. No auto-merge.
