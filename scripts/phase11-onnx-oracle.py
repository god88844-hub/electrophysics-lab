#!/usr/bin/env python3
"""Independent REAL ONNX Runtime CPU oracle for bounded Phase 11 fixtures.

Builds real ONNX ModelProto for QLinearConv and per-axis QuantizeLinear
→ DequantizeLinear, checks the model, executes the CPU provider, saves
exact protobuf binaries and emits raw output bytes fingerprints.

This deliberately does NOT execute or import Invention Lab's JS evaluator.
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

TYPES={"int8":(np.int8,TensorProto.INT8),
       "uint8":(np.uint8,TensorProto.UINT8),
       "float32":(np.float32,TensorProto.FLOAT),
       "int32":(np.int32,TensorProto.INT32)}
MAX_ELEMENTS=4096

def tensor(raw,rank):
    dtype=raw["dtype"]
    if dtype not in TYPES:
        raise ValueError("unsupported tensor dtype")
    shape=raw["shape"]
    if (not isinstance(shape,list) or len(shape)!=rank or
        any(type(x) is not int or x<=0 for x in shape) or
        np.prod(shape)>MAX_ELEMENTS or len(raw["values"])!=int(np.prod(shape))):
        raise ValueError("invalid tensor shape or count")
    values=np.asarray(raw["values"])
    if values.dtype.kind not in "fi":
        raise ValueError("unsupported tensor values")
    if not np.isfinite(values).all():
        raise ValueError("nonfinite input values")
    if dtype!="float32":
        info=np.iinfo(TYPES[dtype][0])
        if not np.all(values==np.rint(values)) or np.any(values<info.min) or np.any(values>info.max):
            raise ValueError("out of range integer tensor")
    return values.astype(TYPES[dtype][0]).reshape(shape)

def initializer(name,value,type):
    return numpy_helper.from_array(np.asarray(value,dtype=TYPES[type][0]),name=name)

def make_case(c):
    if c["op"]=="QLinearConv":
        x=tensor(c["x"],4);w=tensor(c["w"],4)
        m=int(w.shape[0])
        if int(x.shape[1])!=int(w.shape[1]) or len(c["wScales"])!=m or len(c["wZeroPoints"])!=m:
            raise ValueError("unsupported output channels or weights")
        init=[
            initializer("x_scale",c["xScale"],"float32"),
            initializer("x_zp",c["xZeroPoint"],c["x"]["dtype"]),
            initializer("w_scale",c["wScales"],"float32"),
            initializer("w_zp",c["wZeroPoints"],c["w"]["dtype"]),
            initializer("y_scale",c["yScale"],"float32"),
            initializer("y_zp",c["yZeroPoint"],c["yType"]),
        ]
        names=["X","x_scale","x_zp","W","w_scale","w_zp","y_scale","y_zp"]
        if "bias" in c:
            init.append(initializer("bias",c["bias"],"int32"))
            names.append("bias")
        node=helper.make_node("QLinearConv",names,["Y"],name="real-qlinearconv",
                             strides=c["strides"],pads=c["pads"],group=1)
        input_info=[
            helper.make_tensor_value_info("X",TYPES[c["x"]["dtype"]][1],list(x.shape)),
            helper.make_tensor_value_info("W",TYPES[c["w"]["dtype"]][1],list(w.shape))]
        outputs=[helper.make_tensor_value_info("Y",TYPES[c["yType"]][1],[None,None,None,None])]
        feeds={"X":x,"W":w}
        nodes=[node]
        output_names=["Y"]
    elif c["op"]=="PerAxisQDQ":
        x=tensor(c["x"],2)
        axis=c["axis"]
        length=int(x.shape[(axis+2)%2])
        if len(c["scales"])!=length or len(c["zeroPoints"])!=length:
            raise ValueError("bad per-axis vector lengths")
        init=[
            initializer("scales",c["scales"],"float32"),
            initializer("zero_points",c["zeroPoints"],c["qType"]),
        ]
        nodes=[
            helper.make_node("QuantizeLinear",["X","scales","zero_points"],["Q"],
                             name="real-per-axis-quantize",axis=axis),
            helper.make_node("DequantizeLinear",["Q","scales","zero_points"],["Y"],
                             name="real-per-axis-dequantize",axis=axis),
        ]
        input_info=[helper.make_tensor_value_info("X",TensorProto.FLOAT,list(x.shape))]
        outputs=[
            helper.make_tensor_value_info("Q",TYPES[c["qType"]][1],list(x.shape)),
            helper.make_tensor_value_info("Y",TensorProto.FLOAT,list(x.shape)),
        ]
        feeds={"X":x}
        output_names=["Q","Y"]
    else:
        raise ValueError("unsupported operation")
    graph=helper.make_graph(nodes,"phase11-"+c["id"],input_info,outputs,initializer=init)
    model=helper.make_model(graph,producer_name="Invention Lab actual Phase 11 external ONNX CPU reference",
                            opset_imports=[helper.make_operatorsetid("",13)])
    model.ir_version=9
    onnx.checker.check_model(model)
    return model,feeds,output_names

def main():
    doc=json.load(sys.stdin)
    if (doc.get("format")!="invention-lab/phase11-fixtures/1" or
        doc.get("opset")!=13 or len(doc.get("cases",[]))!=6):
        raise ValueError("bad frozen Phase 11 fixture")
    models=Path(__file__).resolve().parent.parent/"benchmarks"/"evidence"/"phase11-models"
    models.mkdir(parents=True,exist_ok=True)
    entries=[]
    for c in doc["cases"]:
        ident=c["id"]
        if re.fullmatch(r"[a-z][a-z0-9-]{2,54}",ident) is None:
            raise ValueError("unsafe output model filename")
        model,feeds,output_names=make_case(c)
        data=model.SerializeToString()
        (models/(ident+".onnx")).write_bytes(data)
        opts=ort.SessionOptions()
        opts.intra_op_num_threads=1
        session=ort.InferenceSession(data,sess_options=opts,providers=["CPUExecutionProvider"])
        if session.get_providers()!=["CPUExecutionProvider"]:
            raise RuntimeError("not actual CPU reference")
        result=session.run(output_names,feeds)
        outputs=[]
        for name,value in zip(output_names,result):
            a=np.asarray(value)
            if a.dtype not in (np.dtype("int8"),np.dtype("uint8"),np.dtype("float32")):
                raise ValueError("unsupported actual runtime output dtype")
            if a.size>MAX_ELEMENTS or not np.isfinite(a).all():
                raise ValueError("reference output invalid or oversized")
            outputs.append({
                "name":name,"dtype":str(a.dtype),"shape":list(a.shape),
                "values":a.ravel().tolist(),
                "sha256":hashlib.sha256(a.tobytes()).hexdigest(),
            })
        entries.append({"id":ident,"modelSha256":hashlib.sha256(data).hexdigest(),
                        "outputs":outputs})
    json.dump({
        "format":"invention-lab/phase11-onnx-reference/1",
        "referenceEngine":"ONNX Runtime CPUExecutionProvider",
        "opset":13,
        "versions":{"onnx":onnx.__version__,"onnxruntime":ort.__version__,
                    "numpy":np.__version__},
        "cases":entries
    },sys.stdout,allow_nan=False,separators=(",",":"))
if __name__=="__main__":
    main()
