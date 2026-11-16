#!/usr/bin/env python3
"""Phase 9 independent reference: actual ONNX protobuf + ONNX Runtime CPU.

Reads a bounded list of frozen graph definitions via stdin and constructs
REAL ONNX opset-13 ModelProto objects; executes with CPUExecutionProvider.
No mock, canned output, external pretrained weights, shell, or hardware claim.
Only a small fixed-shape float32 2D subset is permitted in this benchmark.
"""
import hashlib
import json
import sys
import re
from pathlib import Path

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper
import onnxruntime as ort

OPS = {"MatMul", "Gemm", "Add", "Relu", "Sigmoid", "Softmax"}
ATTRS = {
    "MatMul": set(),
    "Gemm": {"alpha", "beta", "transA", "transB"},
    "Add": set(),
    "Relu": set(),
    "Sigmoid": set(),
    "Softmax": {"axis"},
}
MAX_CELLS = 4096


def _arr(t):
    shape = t["shape"]
    if (len(shape) != 2 or any(not isinstance(x, int) or
        isinstance(x, bool) or x <= 0 for x in shape) or
        shape[0] * shape[1] > MAX_CELLS):
        raise ValueError("unexpected tensor shape")
    a = np.asarray(t["values"], dtype=np.float32)
    if a.size != shape[0] * shape[1] or not np.isfinite(a).all():
        raise ValueError("nonfinite or wrong-size tensor")
    return a.reshape(shape)


def _model(case):
    if len(case["nodes"]) > 32:
        raise ValueError("unbounded graph")
    inputs = [
        helper.make_tensor_value_info(t["name"], TensorProto.FLOAT, t["shape"])
        for t in case["inputs"]
    ]
    init = [
        numpy_helper.from_array(_arr(t), name=t["name"])
        for t in case["initializers"]
    ]
    nodes = []
    for node in case["nodes"]:
        op = node["op"]
        if op not in OPS:
            raise ValueError("unsupported op " + str(op))
        attrs = node.get("attrs") or {}
        if set(attrs) - ATTRS[op]:
            raise ValueError("unsupported op attributes")
        # ONNX attribute protobuf types are strict: Gemm alpha/beta are
        # FLOAT even when the version-controlled JSON value is integer 1.
        # Never silently reinterpret transA/transB as floating point.
        attrs = {k: (float(v) if op == "Gemm" and k in ("alpha", "beta") else v)
                 for k, v in attrs.items()}
        nodes.append(helper.make_node(op, node["inputs"], [node["output"]],
                                      name=node["id"], **attrs))
    outputs = [
        helper.make_tensor_value_info(name, TensorProto.FLOAT, [None, None])
        for name in case["outputs"]
    ]
    graph = helper.make_graph(nodes, "invention-lab-" + case["id"], inputs,
                              outputs, initializer=init)
    model = helper.make_model(graph, producer_name="Invention Lab Phase 9 real ORT oracle",
                              opset_imports=[helper.make_operatorsetid("", 13)])
    # Use a broadly supported ONNX IR revision for the pinned ORT version.
    model.ir_version = 9
    onnx.checker.check_model(model)
    return model


def main():
    doc = json.load(sys.stdin)
    if (doc.get("format") != "invention-lab/onnx-subset-fixtures/1" or
        doc.get("operatorSet") != 13 or doc.get("dtype") != "float32"):
        raise ValueError("unsupported fixture format/opset/dtype")
    if not isinstance(doc.get("cases"), list) or len(doc["cases"]) != 5:
        raise ValueError("expected exactly five frozen graph cases")
    cases = []
    model_dir = Path(__file__).resolve().parent.parent / "benchmarks" / "evidence" / "phase9-models"
    model_dir.mkdir(parents=True, exist_ok=True)
    for case in doc["cases"]:
        if not re.fullmatch(r"[a-z][a-z0-9-]{0,39}", case["id"]):
            raise ValueError("unsafe model output ID")
        model = _model(case)
        buf = model.SerializeToString()
        # Real, inspectable ONNX protobuf bytes become a CI artifact.
        # A later strict step verifies these files against the output record.
        (model_dir / (case["id"] + ".onnx")).write_bytes(buf)
        session = ort.InferenceSession(buf, providers=["CPUExecutionProvider"])
        if session.get_providers() != ["CPUExecutionProvider"]:
            raise AssertionError("independent reference was not CPUExecutionProvider")
        feeds = {t["name"]: _arr(t) for t in case["inputs"]}
        outputs = session.run(case["outputs"], feeds)
        o = []
        for name, arr in zip(case["outputs"], outputs):
            a = np.asarray(arr, dtype=np.float32)
            if a.ndim != 2 or not np.isfinite(a).all():
                raise AssertionError("nonfinite or non-2D ONNX output")
            o.append({
                "name": name, "shape": list(a.shape),
                "values": a.ravel().astype(np.float64).tolist(),
                "sha256": hashlib.sha256(a.tobytes()).hexdigest(),
            })
        cases.append({
            "id": case["id"],
            "modelSha256": hashlib.sha256(buf).hexdigest(),
            "outputs": o,
        })
    record = {
        "format": "invention-lab/phase9-onnx-runtime-reference/1",
        "operatorSet": 13, "dtype": "float32",
        "referenceEngine": "ONNX Runtime CPUExecutionProvider",
        "versions": {
            "onnx": onnx.__version__,
            "onnxruntime": ort.__version__,
            "numpy": np.__version__,
        },
        "cases": cases,
    }
    json.dump(record, sys.stdout, allow_nan=False, separators=(",", ":"))


if __name__ == "__main__":
    main()
