// Phase 12 — independently auditable model-level Iris holdout inference.
// Input source: UCI Iris (CC BY 4.0); explicit train/test split and frozen
// small MLP. Browser JS runs the model; CI separately executes real ONNX
// Runtime CPU and a pinned scikit-learn MLP predictor (NO physical claim).
import {runOnnxSubset} from './onnx-subset.js';

export const IRIS_MODEL_FORMAT='invention-lab/phase12-iris-mlp/1';
export const IRIS_RESULT_FORMAT='invention-lab/phase12-model-result/1';
const EXPECTED_CLASSES=['setosa','versicolor','virginica'];
const MODEL_NODES=['Gemm','Relu','Gemm','Softmax'];
function fail(reason){throw Error('Iris model benchmark: '+reason);}
function boundedArray(xs,length,description){
  if(!Array.isArray(xs)||xs.length!==length)fail(description+' must have exactly '+length+' elements');
  return xs;
}
export function validateIrisFixture(fixture){
  if(!fixture||typeof fixture!=='object'||fixture.format!==IRIS_MODEL_FORMAT)
    fail('unsupported or missing frozen model fixture');
  const dataset=fixture.dataset,split=fixture.split,graph=fixture.graph,train=fixture.training;
  if(dataset?.id!=='uci-iris-53'||dataset?.license!=='CC BY 4.0'||
     dataset?.doi!=='10.24432/C56C76'||dataset?.totalSamples!==150||
     dataset?.features!==4||JSON.stringify(dataset?.classes)!==JSON.stringify(EXPECTED_CLASSES))
    fail('dataset attribution, license, classes or sample count invalid');
  if(split?.method!=='stratified fixed train/test holdout'||split?.seed!==2026||
     split?.trainCount!==120||split?.holdoutCount!==30)
    fail('frozen split protocol changed');
  const trainIndices=boundedArray(split.trainIndices,120,'training indices');
  const testIndices=boundedArray(split.testIndices,30,'holdout indices');
  const all=[...trainIndices,...testIndices];
  if(all.some(x=>!Number.isInteger(x)||x<0||x>=150)||new Set(all).size!==150)
    fail('train/test leakage, duplication, or missing source row');
  const labels=boundedArray(split.holdoutLabels,30,'holdout labels');
  if(labels.some(x=>!Number.isInteger(x)||x<0||x>2))
    fail('holdout class label must be 0, 1 or 2');
  if([0,1,2].some(c=>labels.filter(x=>x===c).length!==10))
    fail('holdout is not balanced with 10 samples per class');
  const raw=boundedArray(split.holdoutRawFeatures,30,'raw holdout features');
  if(raw.some(row=>!Array.isArray(row)||row.length!==4||
    row.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<=0)))
    fail('raw holdout measurements must contain four finite positive features');
  if(train?.implementation!=='scikit-learn'||train?.version!=='1.8.0'||
     train?.algorithm!=='MLPClassifier'||train?.hiddenUnits!==6||
     train?.activation!=='relu'||train?.solver!=='lbfgs'||train?.alpha!==0.03||
     train?.maxIter!==500||train?.randomState!==2026||
     train?.preprocessing!=='StandardScaler fit exclusively on train indices')
    fail('training recipe version/parameters changed');
  const mean=boundedArray(train.mean,4,'train-only normalization mean');
  const scale=boundedArray(train.scale,4,'train-only normalization scale');
  if(mean.some(x=>typeof x!=='number'||!Number.isFinite(x))||
     scale.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<=0))
    fail('invalid training normalization parameters');
  if(graph?.format!=='invention-lab/onnx-subset-graph/1'||graph?.operatorSet!==13||
     graph?.dtype!=='float32'||JSON.stringify(graph.nodes?.map(n=>n.op))!==JSON.stringify(MODEL_NODES)||
     JSON.stringify(graph.outputs)!==JSON.stringify(['Y'])||
     graph.inputs?.length!==1||graph.inputs[0]?.name!=='X'||
     JSON.stringify(graph.inputs[0]?.shape)!==JSON.stringify([30,4]))
    fail('unsupported model architecture, rank, or data type');
  const X=graph.inputs[0].values;
  if(!Array.isArray(X)||X.length!==120)fail('missing 30×4 normalized feature array');
  for(let i=0;i<30;i++)for(let j=0;j<4;j++){
    const x=Math.fround((raw[i][j]-mean[j])/scale[j]);
    if(!Number.isFinite(X[i*4+j])||Math.abs(X[i*4+j]-x)>1e-6)
      fail('normalized holdout features do not match training-only scaler');
  }
  return {classes:EXPECTED_CLASSES,labels,trainIndices,testIndices};
}
export function runIrisModelBenchmark(fixture){
  const input=validateIrisFixture(fixture);
  const result=runOnnxSubset(fixture.graph);
  const output=result.outputs.Y;
  if(!output||JSON.stringify(output.shape)!==JSON.stringify([30,3])||output.values.length!==90)
    fail('MLP output must contain 30×3 class probabilities');
  const predictions=[];
  const confusion=Array.from({length:3},()=>[0,0,0]);
  const probabilities=[];
  for(let i=0;i<30;i++){
    const row=output.values.slice(i*3,i*3+3);
    const sum=row.reduce((a,b)=>a+b,0);
    if(row.some(x=>!Number.isFinite(x)||x<0||x>1)||!Number.isFinite(sum)||Math.abs(sum-1)>1e-5)
      fail('invalid per-sample softmax probability vector');
    const predicted=row.indexOf(Math.max(...row));
    predictions.push(predicted);probabilities.push(row);
    confusion[input.labels[i]][predicted]++;
  }
  const correct=predictions.filter((p,i)=>p===input.labels[i]).length;
  const recalls=confusion.map((r,i)=>r[i]/10);
  const f1=confusion.map((r,c)=>{
    const tp=r[c],predicted=confusion.reduce((acc,row)=>acc+row[c],0);
    return 2*tp/(10+predicted);
  });
  return {
    format:IRIS_RESULT_FORMAT,kind:'iris-model-benchmark',
    dataset:'UCI Iris (CC BY 4.0)',samples:30,trainSamples:120,
    classes:[...input.classes],trueLabels:[...input.labels],
    predictions,probabilities,confusion,
    correct,accuracy:correct/30,
    balancedAccuracy:recalls.reduce((a,b)=>a+b,0)/3,
    macroF1:f1.reduce((a,b)=>a+b,0)/3,
    independentlyValidated:'NOT IN BROWSER — real scikit-learn + ONNX Runtime CPU in CI only',
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
    limitations:'A 30-sample real-world botanical classification holdout is not a GPU/TPU performance, deployment, MLPerf, or physical silicon validation',
  };
}
