// Phase 12 strict evidence policy: an unmodified 150-row licensed dataset,
// frozen 120/30 train/test isolation, real independent scikit-learn AND ORT
// model inference, 30 checked probabilities and truthful physical boundaries.
// No fabricated fallback for missing or unsupported reference execution.
import {runIrisModelBenchmark} from '../labs/ai/iris-benchmark.js';
export const REQUIRED_TEST_ROWS=Object.freeze([
  1,26,72,74,28,119,13,131,93,46,12,62,87,135,114,79,108,95,121,133,61,29,5,104,6,82,149,147,65,43
]);
export const EXPECTED_PREDS=Object.freeze([
  0,0,1,1,0,2,0,2,1,0,0,1,1,2,2,1,2,1,2,1,1,0,0,2,0,1,2,2,1,0
]);
const EXPECTED_CONFUSION=[[10,0,0],[0,10,0],[0,1,9]];
const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const EXPECTED_VERSIONS={sklearn:'1.8.0',numpy:'2.3.5',onnx:'1.23.2',onnxruntime:'1.32.0'};
export function evaluatePhase12(manifest,fixture,record,opts={}){
  const errors=[];
  const problem=x=>errors.push(x);
  if(manifest?.format!=='invention-lab/phase12-iris-acceptance/1'||
     manifest?.dataset!=='benchmarks/phase12/iris.csv'||
     manifest?.modelFixture!=='benchmarks/phase12/iris-mlp.json'||
     manifest?.oracle!=='scripts/phase12-iris-reference.py'||
     manifest?.opset!==13||manifest?.datasetDOI!=='10.24432/C56C76'||
     manifest?.datasetLicense!=='CC BY 4.0'||
     manifest?.upstreamGitBlob!=='b7f746072794309a9a971949562a050e7366ceb1'||
     manifest?.totalRows!==150||manifest?.trainRows!==120||manifest?.holdoutRows!==30||
     !eq(manifest?.modelNodes,['Gemm','Relu','Gemm','Softmax'])||
     !eq(manifest?.requiredTestIndices,REQUIRED_TEST_ROWS)||
     !eq(manifest?.expectedPredictions,EXPECTED_PREDS)||
     !eq(manifest?.expectedConfusion,EXPECTED_CONFUSION)||
     manifest?.expectedCorrect!==29||manifest?.minimumHoldoutAccuracy!==0.9||
     manifest?.maxProbabilityAbsoluteError!==0.0001||
     manifest?.maxTrainingWeightDrift!==0.02||
     manifest?.physicalValidation!=='none'||manifest?.realWorldBuildSuccessPercent!==null)
     problem('Frozen Iris model-data acceptance manifest modified or missing');
  if(!eq(fixture?.split?.testIndices,REQUIRED_TEST_ROWS)||
     !eq(fixture?.reference?.expectedPredictions,EXPECTED_PREDS)||
     !eq(fixture?.reference?.expectedConfusion,EXPECTED_CONFUSION)||
     fixture?.reference?.correctCount!==29)
     problem('Frozen holdout labels, sample indices or expected predictions altered');
  let local=null;
  try{
    local=runIrisModelBenchmark(fixture);
    if(local.correct!==29||!eq(local.confusion,EXPECTED_CONFUSION)||
       !eq(local.predictions,EXPECTED_PREDS))
      problem('Current JS model does not reproduce frozen 29/30 holdout predictions');
  }catch(error){problem('Current JS model failed: '+error.message);}
  if(record?.format!=='invention-lab/phase12-iris-evidence/1'||record?.verdict!=='pass'||
     !eq(record?.referenceEngines,
       ['scikit-learn MLPClassifier.predict_proba','ONNX Runtime CPUExecutionProvider'])||
     !Array.isArray(record?.cases)||record.cases.length!==30)
     problem('Missing, fabricated or incomplete real model-level reference report');
  if(opts.commitSha && record?.commitSha!==opts.commitSha)problem('Stale source commit');
  for(const [field,expected] of [
    ['sourceCsvSha256',opts.sourceCsvSha256],
    ['fixtureSha256',opts.fixtureSha256],
    ['oracleSha256',opts.oracleSha256],
    ['modelSha256',opts.modelSha256],
  ]){
    if(!hash(record?.[field])||(expected&&record[field]!==expected))
      problem('Missing or mismatched data/model/source fingerprint '+field);
  }
  for(const [name,version] of Object.entries(EXPECTED_VERSIONS))
    if(record?.versions?.[name]!==version)
      problem('Missing/wrong independent reference version '+name);
  if(record?.datasetLicense!=='CC BY 4.0'||record?.datasetDOI!=='10.24432/C56C76')
    problem('Missing proper original Iris dataset attribution');
  if(record?.physicalValidation!=='none'||record?.realWorldBuildSuccessPercent!==null)
    problem('Unmeasured hardware validation or invented build-success claim');
  if(record?.split?.trainCount!==120||record?.split?.holdoutCount!==30||
     record?.split?.trainOnlyScaler!==true||record?.split?.holdoutNotTrained!==true)
    problem('No verified training-only scaler or untouched holdout');
  if(typeof record?.trainingWeightsMaxAbsoluteDrift!=='number'||
     !Number.isFinite(record.trainingWeightsMaxAbsoluteDrift)||
     record.trainingWeightsMaxAbsoluteDrift<0||record.trainingWeightsMaxAbsoluteDrift>0.02)
     problem('Pinned train-only MLP was not reproduced within fixed drift envelope');
  if(record?.correct!==29||record?.total!==30||record?.accuracy!==29/30||
     !eq(record?.confusion,EXPECTED_CONFUSION))
     problem('Missing or altered benchmark accuracy/confusion');
  let maxO=0,maxS=0,passing=0;
  const seen=new Set();
  for(let i=0;i<30;i++){
    const row=record?.cases?.[i];
    if(!row){problem('Missing holdout reference case at position '+i);continue;}
    if(!local){problem('No independently recomputed local benchmark');continue;}
    const start=errors.length,expectedId=REQUIRED_TEST_ROWS[i];
    if(row.sourceRow!==expectedId||seen.has(row.sourceRow)||
       row.label!==local.trueLabels[i]||row.prediction!==local.predictions[i])
      problem('Duplicate, omitted, relabeled or reordered actual holdout prediction '+i);
    seen.add(row.sourceRow);
    const actual=local.probabilities[i];
    if(!Array.isArray(row.jsProbabilities)||!Array.isArray(row.onnxProbabilities)||
       !Array.isArray(row.sklearnProbabilities)||!eq(row.jsProbabilities,actual)||
       row.onnxProbabilities.length!==3||row.sklearnProbabilities.length!==3||
       row.onnxProbabilities.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<0||x>1)||
       row.sklearnProbabilities.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<0||x>1)){
      problem('Missing or invalid per-sample three-class probabilities '+i);
      continue;
    }
    const diffO=Math.max(...actual.map((v,j)=>Math.abs(v-row.onnxProbabilities[j])));
    const diffS=Math.max(...actual.map((v,j)=>Math.abs(v-row.sklearnProbabilities[j])));
    if(!Number.isFinite(diffO)||!Number.isFinite(diffS)||
       diffO>0.0001||diffS>0.0001||
       Math.abs(diffO-row.maxOnnxAbsoluteError)>1e-12||
       Math.abs(diffS-row.maxSklearnAbsoluteError)>1e-12)
      problem('Incorrect independent probability or error report '+i);
    maxO=Math.max(maxO,diffO);maxS=Math.max(maxS,diffS);
    if(errors.length===start)passing++;
  }
  if(!Number.isFinite(maxO)||!Number.isFinite(maxS)||
     Math.abs(maxO-record?.maxOnnxAbsoluteError)>1e-12||
     Math.abs(maxS-record?.maxSklearnAbsoluteError)>1e-12)
    problem('Wrong global independent probability errors');
  return {ok:errors.length===0,errors,passed:passing,required:30,
    physicalValidation:'none',realWorldBuildSuccessPercent:null};
}
