#!/usr/bin/env python3
"""Phase 12 independent *model-level* benchmark, not a device benchmark.

UCI Iris data (Fisher, 1936), DOI 10.24432/C56C76, CC BY 4.0.
Snapshot: scikit-learn 1.8.0 bundled sklearn/datasets/data/iris.csv.
Training split is frozen; StandardScaler is FIT ONLY to training samples.
The frozen six-hidden-neuron MLP is verified against a freshly retrained
sklearn MLP, then executed with BOTH scikit-learn and actual ONNX Runtime
CPUExecutionProvider on all 30 unseen holdout samples.
No pickle/untrusted model import and no fabricated physical measurements.
"""
import hashlib
import json
from pathlib import Path
import sys
import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper
import onnxruntime as ort
import sklearn
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import confusion_matrix

ROOT=Path(__file__).resolve().parent.parent
MODEL_DIR=ROOT / "benchmarks" / "evidence" / "phase12-models"
MODEL_DIR.mkdir(parents=True,exist_ok=True)
DATA=ROOT / "benchmarks" / "phase12" / "iris.csv"
FIXTURE=ROOT / "benchmarks" / "phase12" / "iris-mlp.json"

def sha(data):
    return hashlib.sha256(data).hexdigest()

def load_dataset(csv_bytes):
    lines=csv_bytes.decode('utf-8').strip().splitlines()
    if lines[0]!="150,4,setosa,versicolor,virginica" or len(lines)!=151:
        raise ValueError('frozen Iris row header or count invalid')
    data=np.asarray([list(map(float,s.split(','))) for s in lines[1:]],dtype=np.float64)
    if data.shape!=(150,5) or not np.isfinite(data).all():
        raise ValueError('invalid frozen Iris data')
    y=data[:,4].astype(np.int64)
    if not np.array_equal(y,data[:,4]) or not np.array_equal(np.bincount(y),[50,50,50]):
        raise ValueError('invalid Iris class distribution')
    X=data[:,:4]
    source=load_iris()
    np.testing.assert_array_equal(X,source.data,err_msg='CSV does not match pinned scikit Iris')
    np.testing.assert_array_equal(y,source.target)
    return X,y

def build_onnx(graph):
    if graph['operatorSet']!=13 or graph['dtype']!='float32':
        raise ValueError('only fixed ONNX opset-13 float32')
    nodes=[]
    expected=['Gemm','Relu','Gemm','Softmax']
    if [n['op'] for n in graph['nodes']]!=expected:
        raise ValueError('frozen MLP graph operations changed')
    for node in graph['nodes']:
        attrs=node.get('attrs',{})
        if node['op']=='Softmax':
            if attrs!={'axis':1}: raise ValueError('Softmax must be row-normalized')
        elif attrs:
            raise ValueError('unsupported attributes')
        nodes.append(helper.make_node(node['op'],node['inputs'],[node['output']],
                                      name=node['id'],**attrs))
    in_tensor=graph['inputs'][0]
    initializers=[
        numpy_helper.from_array(np.asarray(t['values'],dtype=np.float32).reshape(t['shape']),name=t['name'])
        for t in graph['initializers']
    ]
    outputs=[helper.make_tensor_value_info('Y',TensorProto.FLOAT,[30,3])]
    g=helper.make_graph(nodes,'iris-mlp-uci-cc-by-4',[
        helper.make_tensor_value_info('X',TensorProto.FLOAT,[30,4])
    ],outputs,initializer=initializers)
    model=helper.make_model(g,producer_name='Invention Lab Phase 12, educational model evidence',
                            opset_imports=[helper.make_operatorsetid('',13)])
    model.ir_version=9
    onnx.checker.check_model(model)
    return model

def main():
    csv_bytes=DATA.read_bytes()
    fixture_bytes=FIXTURE.read_bytes()
    f=json.loads(fixture_bytes)
    if f.get('format')!='invention-lab/phase12-iris-mlp/1' or f['dataset']['license']!='CC BY 4.0':
        raise ValueError('license metadata or model format missing')
    X,y=load_dataset(csv_bytes)
    train=np.asarray(f['split']['trainIndices'],dtype=np.int64)
    test=np.asarray(f['split']['testIndices'],dtype=np.int64)
    if len(train)!=120 or len(test)!=30 or sorted(list(train)+list(test))!=list(range(150)):
        raise ValueError('non-exhaustive holdout split or training leakage')
    t,v=train_test_split(np.arange(150),test_size=.2,random_state=2026,stratify=y)
    np.testing.assert_array_equal(train,t,err_msg='frozen training indices mutated')
    np.testing.assert_array_equal(test,v,err_msg='frozen holdout indices mutated')
    np.testing.assert_array_equal(y[test],f['split']['holdoutLabels'])
    np.testing.assert_array_equal(X[test],f['split']['holdoutRawFeatures'])
    if not np.array_equal(np.bincount(y[train]),[40,40,40]) or not np.array_equal(np.bincount(y[test]),[10,10,10]):
        raise ValueError('stratified split unbalanced')
    # Actual train-only normalization, with independent recheck against
    # shipped frozen MLP example. No held-out features or labels are fit.
    scaler=StandardScaler().fit(X[train])
    np.testing.assert_allclose(scaler.mean_,f['training']['mean'],rtol=0,atol=5e-9)
    np.testing.assert_allclose(scaler.scale_,f['training']['scale'],rtol=0,atol=5e-9)
    X_train=scaler.transform(X[train])
    X_test=np.asarray(scaler.transform(X[test]),dtype=np.float32)
    graph=f['graph']
    np.testing.assert_allclose(X_test,
        np.asarray(graph['inputs'][0]['values'],dtype=np.float32).reshape(30,4),
        rtol=0,atol=1e-6)
    trained=MLPClassifier(hidden_layer_sizes=(6,),solver='adam',activation='relu',
                          alpha=0.03,max_iter=1000,learning_rate_init=0.01,
                          tol=1e-5,n_iter_no_change=200,random_state=2026)
    trained.fit(X_train,y[train])
    if not np.array_equal(trained.classes_,[0,1,2]):
        raise ValueError('unexpected sklearn class label mapping')
    frozen_coefs=[
        np.asarray(graph['initializers'][k]['values'],dtype=np.float64).reshape(graph['initializers'][k]['shape'])
        for k in (0,2)
    ]
    frozen_bias=[
        np.asarray(graph['initializers'][k]['values'],dtype=np.float64)
        for k in (1,3)
    ]
    drift=max(float(np.max(np.abs(trained.coefs_[k]-frozen_coefs[k]))) for k in (0,1))
    drift=max(drift,max(float(np.max(np.abs(trained.intercepts_[k]-frozen_bias[k]))) for k in (0,1)))
    if drift>0.02:
        raise AssertionError('frozen network weights not reproduced by pinned train-only recipe: '+str(drift))
    retrained_predictions=trained.predict(X_test).tolist()
    if retrained_predictions!=f['reference']['expectedPredictions']:
        raise AssertionError('independent retraining changed holdout predictions')
    # Actual sklearn MLP inference on the frozen, plain-text weights;
    # no pickle/untrusted code load. The math runs inside sklearn.
    trained.coefs_=[np.array(w,copy=True) for w in frozen_coefs]
    trained.intercepts_=[np.array(b,copy=True) for b in frozen_bias]
    sklearn_probs=np.asarray(trained.predict_proba(X_test),dtype=np.float64)
    sklearn_preds=sklearn_probs.argmax(axis=1).tolist()
    if sklearn_preds!=f['reference']['expectedPredictions']:
        raise AssertionError('sklearn reference predictions disagree with frozen acceptance')
    model=build_onnx(graph)
    model_bytes=model.SerializeToString()
    (MODEL_DIR/'iris-mlp.onnx').write_bytes(model_bytes)
    opts=ort.SessionOptions()
    opts.intra_op_num_threads=1
    session=ort.InferenceSession(model_bytes,sess_options=opts,providers=['CPUExecutionProvider'])
    if session.get_providers()!=['CPUExecutionProvider']:
        raise AssertionError('did not execute actual ONNX Runtime CPU')
    onnx_probs=np.asarray(session.run(['Y'],{'X':X_test})[0],dtype=np.float32)
    if onnx_probs.shape!=(30,3) or not np.isfinite(onnx_probs).all():
        raise AssertionError('invalid ONNX MLP probability output')
    onnx_preds=onnx_probs.argmax(axis=1).tolist()
    if onnx_preds!=sklearn_preds:
        raise AssertionError('real ORT predictions disagree with independent sklearn')
    numerical_max=float(np.max(np.abs(onnx_probs-sklearn_probs)))
    if numerical_max>1e-4:
        raise AssertionError('ONNX Runtime and sklearn probability mismatch '+str(numerical_max))
    confusion=confusion_matrix(y[test],onnx_preds,labels=[0,1,2]).tolist()
    correct=sum(int(a==b) for a,b in zip(onnx_preds,y[test]))
    if correct!=29 or confusion!=[[10,0,0],[0,10,0],[0,1,9]]:
        raise AssertionError('frozen holdout label accuracy or confusion matrix changed')
    record={
        'format':'invention-lab/phase12-external-model-reference/1',
        'referenceEngines':['scikit-learn MLPClassifier.predict_proba','ONNX Runtime CPUExecutionProvider'],
        'versions':{'sklearn':sklearn.__version__,'numpy':np.__version__,
                    'onnx':onnx.__version__,'onnxruntime':ort.__version__},
        'sourceCsvSha256':sha(csv_bytes),
        'fixtureSha256':sha(fixture_bytes),
        'modelSha256':sha(model_bytes),
        'trainingWeightsMaxAbsoluteDrift':drift,
        'trainSamples':len(train),'holdoutSamples':len(test),
        'trainOnlyScaler':True,'holdoutNotTrained':True,
        'labels':y[test].tolist(),'retrainedPredictions':retrained_predictions,
        'sklearnPredictions':sklearn_preds,'onnxPredictions':onnx_preds,
        'sklearnProbabilities':sklearn_probs.tolist(),
        'onnxProbabilities':onnx_probs.astype(np.float64).tolist(),
        'maxOnnxVsSklearnAbsoluteError':numerical_max,
        'correct':correct,'accuracy':correct/30,'confusion':confusion,
        'physicalValidation':'none','realWorldBuildSuccessPercent':None,
        'limits':'UCI Iris 30-sample holdout; no MLPerf certification, physical GPU/TPU or manufacturing yield.'
    }
    json.dump(record,sys.stdout,allow_nan=False,separators=(',',':'))

if __name__=='__main__':
    main()
