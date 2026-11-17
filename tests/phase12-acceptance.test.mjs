// Fake records here exercise fail-closed gate unit behavior ONLY.
// No synthetic record is written or presented as an external result.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runIrisModelBenchmark} from '../js/labs/ai/iris-benchmark.js';
import {evaluatePhase12,REQUIRED_TEST_ROWS,EXPECTED_PREDS} from '../js/phase12/acceptance.js';
const fixture=JSON.parse(readFileSync(new URL('../benchmarks/phase12/iris-mlp.json',import.meta.url),'utf8'));
const acceptance=JSON.parse(readFileSync(new URL('../benchmarks/phase12/acceptance.json',import.meta.url),'utf8'));
const SHA='a'.repeat(64);
function fake(){
 const r=runIrisModelBenchmark(fixture);
 return {
   format:'invention-lab/phase12-iris-evidence/1',verdict:'pass',
   commitSha:'synthetic-unit-check',
   sourceCsvSha256:SHA,fixtureSha256:SHA,oracleSha256:SHA,modelSha256:SHA,
   referenceEngines:['scikit-learn MLPClassifier.predict_proba','ONNX Runtime CPUExecutionProvider'],
   versions:{sklearn:'1.8.0',numpy:'2.3.5',onnx:'1.23.2',onnxruntime:'1.32.0'},
   split:{trainCount:120,holdoutCount:30,trainOnlyScaler:true,holdoutNotTrained:true},
   trainingWeightsMaxAbsoluteDrift:0,
   correct:r.correct,total:r.samples,accuracy:r.accuracy,confusion:r.confusion,
   maxOnnxAbsoluteError:0,maxSklearnAbsoluteError:0,
   datasetLicense:'CC BY 4.0',datasetDOI:'10.24432/C56C76',
   cases:r.probabilities.map((p,i)=>({
     sourceRow:fixture.split.testIndices[i],label:r.trueLabels[i],prediction:r.predictions[i],
     jsProbabilities:[...p],onnxProbabilities:[...p],sklearnProbabilities:[...p],
     maxOnnxAbsoluteError:0,maxSklearnAbsoluteError:0
   })),
   physicalValidation:'none',realWorldBuildSuccessPercent:null
 };
}
const check=(r,m=acceptance,f=fixture)=>evaluatePhase12(m,f,r,{
 commitSha:'synthetic-unit-check',
 sourceCsvSha256:SHA,fixtureSha256:SHA,oracleSha256:SHA,modelSha256:SHA
});
test('Phase12: fixed 30 indexed holdout and 29/30 expected predictions are immovable',()=>{
 assert.deepEqual(acceptance.requiredTestIndices,REQUIRED_TEST_ROWS);
 assert.deepEqual(acceptance.expectedPredictions,EXPECTED_PREDS);
 const v=check(fake());
 assert.equal(v.ok,true,v.errors.join('; '));
 assert.equal(v.passed,30);
});
test('Phase12: absent, duplicate, skipped, reordered, mislabeled or missing real sample must fail',()=>{
 for(const mutate of [
  r=>r.cases.pop(),
  r=>r.cases.push({...r.cases[0]}),
  r=>[r.cases[0],r.cases[1]]=[r.cases[1],r.cases[0]],
  r=>r.cases[0].sourceRow=r.cases[1].sourceRow,
  r=>r.cases[0].label=1,
  r=>r.cases[0].prediction=2,
  r=>r.cases[12].onnxProbabilities=[],
  r=>r.cases[17].sklearnProbabilities[0]=NaN,
 ]){
  const r=fake();mutate(r);
  assert.equal(check(r).ok,false);
 }
});
test('Phase12: no stale hashes, substituted engines, unpinned reference versions or physical claims',()=>{
 for(const mutate of [
  r=>r.commitSha='other',
  r=>r.oracleSha256='not-valid',
  r=>r.modelSha256='b'.repeat(64),
  r=>r.sourceCsvSha256='b'.repeat(64),
  r=>r.versions.sklearn='untrusted',
  r=>r.referenceEngines[1]='mock',
  r=>r.split.holdoutNotTrained=false,
  r=>r.split.trainOnlyScaler=false,
  r=>r.realWorldBuildSuccessPercent=99,
  r=>r.physicalValidation='manufactured',
  r=>r.datasetLicense='unknown'
 ]){
  const r=fake();mutate(r);assert.equal(check(r).ok,false);
 }
});
test('Phase12: independent probabilities must match JS, rechecked errors and fixed tolerance',()=>{
 for(const mutate of [
  r=>r.cases[0].onnxProbabilities[1]+=0.01,
  r=>r.cases[2].sklearnProbabilities[2]=-0.01,
  r=>r.cases[3].maxOnnxAbsoluteError=0.01,
  r=>r.maxSklearnAbsoluteError=0.01,
  r=>r.correct=30,
  r=>r.accuracy=1,
  r=>r.confusion[0][0]=9,
  r=>r.trainingWeightsMaxAbsoluteDrift=0.5,
 ]){
  const r=fake();mutate(r);assert.equal(check(r).ok,false);
 }
});
test('Phase12: acceptance manifest cannot relax threshold, change labels or remove the holdout',()=>{
 for(const change of [
  m=>m.maxProbabilityAbsoluteError=1,
  m=>m.expectedCorrect=30,
  m=>m.expectedConfusion[1][1]=8,
  m=>m.requiredTestIndices.pop(),
  m=>m.datasetLicense='none',
  m=>m.minimumHoldoutAccuracy=0,
 ]){
  const m=structuredClone(acceptance);change(m);
  assert.equal(check(fake(),m).ok,false);
 }
 const f=structuredClone(fixture);
 f.split.testIndices[0]=f.split.trainIndices[0];
 assert.equal(check(fake(),acceptance,f).ok,false);
});
