#!/usr/bin/env python3
"""Independent NumPy matrix-multiply reference for small accelerator kernels.

This script is independent from Invention Lab's JS tensor implementations.
Its execution is required in the Phase 7 external CI workflow.
It does NOT report silicon performance, TPU/GPU functionality or power.
"""
import json
import sys
import numpy as np

def main():
    request = json.load(sys.stdin)
    if request.get("format") != "invention-lab/phase7-tensor-request/1":
        raise ValueError("unsupported benchmark format")
    results = []
    for case in request["cases"]:
        a = np.asarray(case["a"], dtype=np.float64)
        b = np.asarray(case["b"], dtype=np.float64)
        if a.ndim != 2 or b.ndim != 2 or a.shape[1] != b.shape[0]:
            raise ValueError("invalid input tensor shapes")
        if not np.isfinite(a).all() or not np.isfinite(b).all():
            raise ValueError("non-finite test inputs")
        results.append({"id": case["id"], "out": (a @ b).tolist()})
    json.dump({"format": "invention-lab/phase7-tensor-numpy/1", "numpy": np.__version__,
               "results": results}, sys.stdout)

if __name__ == "__main__":
    main()
