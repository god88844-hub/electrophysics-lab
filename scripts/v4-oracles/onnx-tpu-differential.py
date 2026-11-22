"""WP-4.6 oracle harness 2 — ep-chip INT8/per-axis-QDQ systolic TPU vs ONNX
Runtime CPU (03_PHYSICS_MATH_FUNDAMENTALS.md §5: logits ±1e-5 relative).

Reads the dump emitted by
``cargo run -p ep-kernel --example chip_oracle_dump``
(format ``invention-lab/wp46-oracle-dump/1``), builds the equivalent
QLinearMatMul-shaped ONNX graph with onnx.helper::

    qA int8[M,K] ─┐
                  ├─ MatMulInteger ── acc int32[M,N] ─┬─ (graph output: bit-exact grid)
    qB int8[K,N] ─┘                                   │
                      acc ─ DequantizeLinear(sA, axis=0)
                          ─ DequantizeLinear(sB, axis=1) ── y fp32[M,N]  (±1e-5)

and asserts on the ONNX Runtime CPUExecutionProvider:
  1. the INT32 accumulation grid is **bit-exact** against the kernel's
     ``cI32`` (the §5 TPU-GEMM row: exact INT8 reference math),
  2. the dequantized logits are within **±1e-5 relative** of the kernel's
     ``cDequant`` (the §5 ONNX row), reporting the max relative error.

Usage::

    python3 scripts/v4-oracles/onnx-tpu-differential.py <dump.json> [--require-live]

Skip discipline: missing onnx/onnxruntime prints a loud
``WP46-ONNX-ORACLE-SKIP`` verdict on both channels; ``--require-live`` (CI)
turns that into a hard failure — never a silent pass (PHASE_04 failure modes).
"""

from __future__ import annotations

import json
import struct
import sys

DUMP_FORMAT = "invention-lab/wp46-oracle-dump/1"
RELATIVE_TOLERANCE = 1e-5


def fail(msg: str) -> None:
    print(f"WP46-ONNX-ORACLE-FAIL: {msg}", file=sys.stderr)
    print(json.dumps({"oracle": "onnx", "skipped": False, "pass": False, "reason": msg}))
    sys.exit(1)


def loud_skip(reason: str, require_live: bool) -> None:
    verdict = {
        "oracle": "onnx",
        "skipped": True,
        "pass": False,
        "reason": reason,
        "discipline": "loud skip — a skip is never a silent pass (PHASE_04 failure modes)",
    }
    print(f"WP46-ONNX-ORACLE-SKIP: {reason}", file=sys.stderr)
    print(json.dumps(verdict))
    sys.exit(1 if require_live else 0)


def max_relative_error(actual, expected) -> float:
    if len(actual) != len(expected):
        return float("inf")
    worst = 0.0
    for a, e in zip(actual, expected):
        scale = max(abs(e), 1e-30)
        worst = max(worst, abs(a - e) / scale)
    return worst


def main() -> None:
    args = sys.argv[1:]
    require_live = "--require-live" in args
    paths = [a for a in args if not a.startswith("--")]
    if len(paths) != 1:
        print(
            "usage: python3 scripts/v4-oracles/onnx-tpu-differential.py <dump.json> [--require-live]",
            file=sys.stderr,
        )
        sys.exit(2)

    with open(paths[0], "r", encoding="utf-8") as handle:
        dump = json.load(handle)

    if dump.get("format") != DUMP_FORMAT:
        fail(f"dump format must be {DUMP_FORMAT}, got {dump.get('format')!r}")
    if dump.get("provenance") != "SIMULATED_ARCHITECTURAL_MODEL":
        fail("dump must carry the SIMULATED_ARCHITECTURAL_MODEL provenance")
    tpu = dump.get("tpu") or {}
    workload = tpu.get("workload") or {}
    m, k, n = workload.get("m"), workload.get("k"), workload.get("n")
    if not (m and k and n):
        fail("tpu.workload m/k/n missing")
    q_a, q_b = tpu.get("qA"), tpu.get("qB")
    c_i32, c_dequant = tpu.get("cI32"), tpu.get("cDequant")
    scales = workload.get("scales") or {}
    s_a, s_b = scales.get("aPerRow"), scales.get("bPerCol")
    if None in (q_a, q_b, c_i32, c_dequant, s_a, s_b):
        fail("dump is missing qA/qB/cI32/cDequant/scales")
    if len(q_a) != m * k or len(q_b) != k * n or len(c_i32) != m * n or len(c_dequant) != m * n:
        fail("dump operand/output lengths do not match the declared M/K/N workload")
    if len(s_a) != m or len(s_b) != n:
        fail("per-axis scale lengths must be M rows / N columns (QLinearMatMul layout)")

    # Oracle availability is explicit — absent ONNX Runtime is a LOUD skip.
    try:
        import numpy as np  # noqa: F401  (onnxruntime dependency)
        import onnx
        from onnx import TensorProto, helper, numpy_helper
        import onnxruntime as ort
    except Exception as exc:  # ImportError and friends
        loud_skip(
            f"onnx/onnxruntime are not importable ({exc}) — the ONNX Runtime CPU "
            "differential executes only where the runtime exists"
            + (" (--require-live: CI requires the live oracle)" if require_live else ""),
            require_live,
        )
        return

    q_a_np = np.array(q_a, dtype=np.int8).reshape(m, k)
    q_b_np = np.array(q_b, dtype=np.int8).reshape(k, n)
    s_a_np = np.array(s_a, dtype=np.float32)
    s_b_np = np.array(s_b, dtype=np.float32)
    if "CPUExecutionProvider" not in ort.get_available_providers():
        fail("CPUExecutionProvider is unavailable in this onnxruntime build")

    # Build the canonical QDQ graph (opset 13): the quantized operands are
    # dequantized per-axis (DequantizeLinear supports per-axis on int8), the
    # fp32 MatMul is the exact QDQ equivalent of the kernel's
    # dequantize(acc · sA[i] · sB[j]) because every product/sum here is an
    # exact fp32 value (integer operands, power-of-two scales, partial sums
    # ≤ 2^24), and MatMulInteger re-derives the INT32 grid for the bit-exact
    # check demanded by the §5 TPU-GEMM row.
    acc = helper.make_tensor_value_info("acc", TensorProto.INT32, [m, n])
    y = helper.make_tensor_value_info("y", TensorProto.FLOAT, [m, n])
    graph = helper.make_graph(
        [
            helper.make_node("MatMulInteger", ["qA", "qB"], ["acc"], name="systolic_gemm_int32"),
            helper.make_node("DequantizeLinear", ["qA", "sA"], ["dq_a"], axis=0, name="dequant_per_row"),
            helper.make_node("DequantizeLinear", ["qB", "sB"], ["dq_b"], axis=1, name="dequant_per_col"),
            helper.make_node("MatMul", ["dq_a", "dq_b"], ["y"], name="qdq_gemm_fp32"),
        ],
        "wp46-tpu-qdq-gemm",
        [],  # no runtime inputs — the operands are graph initializers
        [acc, y],
        initializer=[
            numpy_helper.from_array(q_a_np, "qA"),
            numpy_helper.from_array(q_b_np, "qB"),
            numpy_helper.from_array(s_a_np, "sA"),
            numpy_helper.from_array(s_b_np, "sB"),
        ],
    )
    model = helper.make_model(
        graph, opset_imports=[helper.make_opsetid("", 13)], producer_name="wp46-chip-oracles"
    )
    # opset 13 needs nothing newer than IR 8 — pin it so the harness loads on
    # any onnxruntime build (older local runtimes and the pinned CI runtime).
    model.ir_version = 8
    try:
        onnx.checker.check_model(model)
    except Exception as exc:
        fail(f"oracle model failed the ONNX checker: {exc}")

    session = ort.InferenceSession(model.SerializeToString(), providers=["CPUExecutionProvider"])
    ort_acc, ort_y = session.run(None, {})  # [int32 grid, dequantized logits]

    # (1) INT32 accumulation grid — bit-exact (§5 TPU GEMM row).
    ort_acc_flat = ort_acc.reshape(-1).astype(np.int64).tolist()
    mismatches = [
        {"index": i, "onnx": int(a), "kernel": int(b)}
        for i, (a, b) in enumerate(zip(ort_acc_flat, c_i32))
        if int(a) != int(b)
    ]
    if mismatches:
        fail(
            f"ONNX Runtime MatMulInteger grid is not bit-exact with the kernel "
            f"({len(mismatches)} mismatches; first: {mismatches[0]})"
        )

    # (2) Dequantized logits — ±1e-5 relative (§5 ONNX row).
    ort_y_flat = ort_y.reshape(-1).astype(float).tolist()
    worst = max_relative_error(ort_y_flat, c_dequant)
    if not worst <= RELATIVE_TOLERANCE:
        fail(f"dequantized logits exceed the ±{RELATIVE_TOLERANCE} relative tolerance (max {worst:.3e})")

    # Informational: whether the f32-rounded logits also match bit-for-bit
    # (the ±1e-5 relative tolerance above is the §5 contract, not this flag).
    def f32_bits(value: float) -> bytes:
        return struct.pack("<f", float(value))

    bit_exact_logits = all(
        f32_bits(a) == f32_bits(b) for a, b in zip(ort_y_flat, c_dequant)
    )

    verdict = {
        "oracle": "onnx",
        "skipped": False,
        "pass": True,
        "runtime": ort.__version__,
        "providers": list(ort.get_available_providers()),
        "workload": {"m": m, "k": k, "n": n, "gridP": workload.get("gridP")},
        "int32Grid": "bit-exact",
        "logits": {
            "tolerance": f"±{RELATIVE_TOLERANCE} relative",
            "maxRelativeError": worst,
            "bitExactF32": bool(bit_exact_logits),
        },
        "differential": "ONNX Runtime CPUExecutionProvider vs ep-chip systolic TPU (WP-4.3)",
    }
    print(json.dumps(verdict))
    print(
        f"WP46-ONNX-ORACLE-PASS: ONNX Runtime {ort.__version__} CPU — INT32 grid bit-exact, "
        f"logits max relative error {worst:.3e} (±{RELATIVE_TOLERANCE} tolerance)",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
