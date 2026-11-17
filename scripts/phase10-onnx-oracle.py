#!/usr/bin/env python3
"""Real ONNX Runtime CPU oracle for Phase 10 signed/unsigned quantization.

Compiles six fixed fixtures to actual ONNX opset 13 ModelProto bytes, runs
CPUExecutionProvider, and returns independent raw output arrays plus SHA-256.
QLinearMatMul, QuantizeLinear and DequantizeLinear are NOT mocked.
"""
import hashlib
import json
from pathlib import Path
import re
import sys

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper
import onnxruntime as ort

TYPES={"int8": (np.int8,TensorProto.INT8),
       "uint8":(np.uint8,TensorProto.UINT8),
       "float32":(np.float32,TensorProto.FLOAT)}

def tensor(name, data):
    dtype=data["dtype"]
    if dtype not in TYPES:
        raise ValueError("Unsupported tensor type")
    shape=data["shape"]
    if len(shape)!=2 or any(type(x) is not int or x<=0 for x in shape):
        raise ValueError("Only bounded two-dimensional tensors")
    if shape[0]*shape[1]>4096 or len(data["values"])!=shape[0]*shape[1]:
        raise ValueError("Oversized or malformed tensor")
    values=np.array(data["values"],dtype=TYPES[dtype][0]).reshape(shape)
    if dtype=="float32" and not np.isfinite(values).all():
        raise ValueError("Nonfinite float input")
    return values

def scalar(name, value, dtype):
    return numpy_helper.from_array(np.asarray(value,dtype=TYPES[dtype][0]),name=name)

def build(c):
    op=c["op"]
    nodes=[]
    initializers=[]
    feeds={}
    if op=="QLinearMatMul":
        a=tensor("A",c["a"])
        b=tensor("B",c["b"])
        if a.shape[1]!=b.shape[0] or a.dtype!=b.dtype:
            raise ValueError("Unsupported QLinearMatMul dimensions or types")
        feeds={"A":a,"B":b}
        initializers=[
            scalar("a_scale",c["aScale"],"float32"),
            scalar("a_zp",c["aZeroPoint"],c["a"]["dtype"]),
            scalar("b_scale",c["bScale"],"float32"),
            scalar("b_zp",c["bZeroPoint"],c["b"]["dtype"]),
            scalar("y_scale",c["yScale"],"float32"),
            scalar("y_zp",c["yZeroPoint"],c["yType"]),
        ]
        nodes=[helper.make_node("QLinearMatMul",
            ["A","a_scale","a_zp","B","b_scale","b_zp","y_scale","y_zp"],["Y"],name="quantized-matmul")]
        output_names=["Y"]
        output_infos=[helper.make_tensor_value_info("Y",TYPES[c["yType"]][1],
                    [a.shape[0],b.shape[1]])]
        input_infos=[
            helper.make_tensor_value_info("A",TYPES[c["a"]["dtype"]][1],list(a.shape)),
            helper.make_tensor_value_info("B",TYPES[c["b"]["dtype"]][1],list(b.shape)),
        ]
    elif op=="QuantizeDequantize":
        x=tensor("X",c["x"])
        feeds={"X":x}
        initializers=[
            scalar("scale",c["scale"],"float32"),
            scalar("zero_point",c["zeroPoint"],c["qType"]),
        ]
        nodes=[
            helper.make_node("QuantizeLinear",["X","scale","zero_point"],["Q"],name="quantize"),
            helper.make_node("DequantizeLinear",["Q","scale","zero_point"],["Y"],name="dequantize"),
        ]
        output_names=["Q","Y"]
        input_infos=[helper.make_tensor_value_info("X",TensorProto.FLOAT,list(x.shape))]
        output_infos=[
            helper.make_tensor_value_info("Q",TYPES[c["qType"]][1],list(x.shape)),
            helper.make_tensor_value_info("Y",TensorProto.FLOAT,list(x.shape)),
        ]
    else:
        raise ValueError("Unsupported operation")
    graph=helper.make_graph(nodes,"phase10-"+c["id"],input_infos,output_infos,initializer=initializers)
    model=helper.make_model(graph,producer_name="Invention Lab Phase10 actual ONNX Runtime oracle",
                            opset_imports=[helper.make_operatorsetid("",13)])
    model.ir_version=9
    onnx.checker.check_model(model)
    return model,feeds,output_names

def main():
    fixture=json.load(sys.stdin)
    if (fixture.get("format")!="invention-lab/phase10-quantized-fixtures/1"
        or fixture.get("opset")!=13 or len(fixture.get("cases",[]))!=6):
        raise ValueError("Invalid frozen Phase10 reference fixture")
    dest=Path(__file__).resolve().parent.parent/"benchmarks"/"evidence"/"phase10-models"
    dest.mkdir(parents=True,exist_ok=True)
    output_cases=[]
    for c in fixture["cases"]:
        case_id=c["id"]
        if re.fullmatch(r"[a-z][a-z0-9-]{1,39}",case_id) is None:
            raise ValueError("Unsafe model filename")
        model,feeds,names=build(c)
        binary=model.SerializeToString()
        (dest/(case_id+".onnx")).write_bytes(binary)
        session_options=ort.SessionOptions()
        session_options.intra_op_num_threads=1
        session=ort.InferenceSession(binary,sess_options=session_options,
                                     providers=["CPUExecutionProvider"])
        if session.get_providers()!=["CPUExecutionProvider"]:
            raise AssertionError("Unexpected execution provider")
        arrays=session.run(names,feeds)
        outputs=[]
        for name,actual in zip(names,arrays):
            a=np.asarray(actual)
            if a.ndim!=2 or a.size>4096:
                raise AssertionError("Unexpected reference output rank/size")
            if a.dtype not in (np.dtype("int8"),np.dtype("uint8"),np.dtype("float32")):
                raise AssertionError("Unexpected ONNX reference output type")
            if a.dtype==np.dtype("float32") and not np.isfinite(a).all():
                raise AssertionError("Nonfinite ONNX Runtime result")
            outputs.append({"name":name,"dtype":str(a.dtype),"shape":list(a.shape),
                "values":a.flatten().tolist(),
                "sha256":hashlib.sha256(a.tobytes()).hexdigest()})
        output_cases.append({"id":case_id,"modelSha256":hashlib.sha256(binary).hexdigest(),
                             "outputs":outputs})
    json.dump({
        "format":"invention-lab/phase10-reference/1",
        "referenceEngine":"ONNX Runtime CPUExecutionProvider",
        "opset":13,"versions":{"onnx":onnx.__version__,"onnxruntime":ort.__version__,
                              "numpy":np.__version__},
        "cases":output_cases
    },sys.stdout,allow_nan=False,separators=(",",":"))

if __name__=="__main__":
    main()
