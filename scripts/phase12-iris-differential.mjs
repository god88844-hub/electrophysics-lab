// Phase 12: mandatory independent model-level inference evidence.
// Real sk-learn training and real ONNX Runtime CPU are executed by Python.
// Invention Lab's JS engine is cross-checked against BOTH, with the frozen
// UCI-licensed 30-row unseen holdout and independent class labels.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {runIrisModelBenchmark} from '../js/labs/ai/iris-benchmark.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=x=>path.join(root,x),sha=data=>createHash('sha256').update(data).digest('hex');
const [fixtureBytes,datasetBytes,sourceBytes,manifestBytes]=await Promise.all([
  readFile(file('benchmarks/phase12/iris-mlp.json')),
  readFile(file('benchmarks/phase12/iris.csv')),
  readFile(file('scripts/phase12-iris-reference.py')),
  readFile(file('benchmarks/phase12/acceptance.json')),
]);
const fixture=JSON.parse(fixtureBytes),manifest=JSON.parse(manifestBytes);
assert.equal(manifest.format,'invention-lab/phase12-iris-acceptance/1');
assert.equal(manifest.datasetLicense,'CC BY 4.0');
const local=runIrisModelBenchmark(fixture);
const output=execFileSync('python3',[file('scripts/phase12-iris-reference.py')],{
  cwd:root,encoding:'utf8',timeout:120000,maxBuffer:4_000_000,
});
const independent=JSON.parse(output);
assert.equal(independent.format,'invention-lab/phase12-external-model-reference/1');
assert.deepEqual(independent.referenceEngines,
  ['scikit-learn MLPClassifier.predict_proba','ONNX Runtime CPUExecutionProvider']);
assert.equal(independent.holdoutNotTrained,true);
assert.equal(independent.trainOnlyScaler,true);
assert.equal(independent.trainSamples,120);
assert.equal(independent.holdoutSamples,30);
assert.equal(independent.sourceCsvSha256,sha(datasetBytes));
assert.equal(independent.fixtureSha256,sha(fixtureBytes));
assert.equal(independent.correct,29);
assert.deepEqual(independent.confusion,manifest.expectedConfusion);
assert.deepEqual(independent.onnxPredictions,local.predictions);
assert.deepEqual(independent.sklearnPredictions,local.predictions);
assert.deepEqual(independent.labels,local.trueLabels);
assert.equal(local.correct,manifest.expectedCorrect);
assert.ok(local.accuracy>=manifest.minimumHoldoutAccuracy);
assert.deepEqual(local.confusion,manifest.expectedConfusion);
assert.equal(local.physicalValidation,'none');
const perSample=[];
let maxOnnxError=0,maxSklearnError=0;
for(let i=0;i<30;i++){
 const actual=local.probabilities[i];
 const ort=independent.onnxProbabilities[i];
 const sklearn=independent.sklearnProbabilities[i];
 assert.equal(actual.length,3);assert.equal(ort.length,3);assert.equal(sklearn.length,3);
 const absoluteOnnx=Math.max(...actual.map((v,j)=>Math.abs(v-ort[j])));
 const absoluteSklearn=Math.max(...actual.map((v,j)=>Math.abs(v-sklearn[j])));
 if(!Number.isFinite(absoluteOnnx)||!Number.isFinite(absoluteSklearn)||
    absoluteOnnx>manifest.maxProbabilityAbsoluteError||
    absoluteSklearn>manifest.maxProbabilityAbsoluteError)
   throw Error('Unmatched real model-level probabilities at holdout index '+i);
 maxOnnxError=Math.max(maxOnnxError,absoluteOnnx);
 maxSklearnError=Math.max(maxSklearnError,absoluteSklearn);
 perSample.push({sourceRow:fixture.split.testIndices[i],label:local.trueLabels[i],
   prediction:local.predictions[i],jsProbabilities:actual,onnxProbabilities:ort,
   sklearnProbabilities:sklearn,maxOnnxAbsoluteError:absoluteOnnx,
   maxSklearnAbsoluteError:absoluteSklearn});
}
const result={
 format:'invention-lab/phase12-iris-evidence/1',verdict:'pass',
 commitSha:process.env.GITHUB_SHA||null,
 sourceCsvSha256:sha(datasetBytes),fixtureSha256:sha(fixtureBytes),oracleSha256:sha(sourceBytes),
 modelSha256:independent.modelSha256,
 referenceEngines:independent.referenceEngines,versions:independent.versions,
 split:{trainCount:120,holdoutCount:30,trainOnlyScaler:true,holdoutNotTrained:true},
 trainingWeightsMaxAbsoluteDrift:independent.trainingWeightsMaxAbsoluteDrift,
 correct:local.correct,total:local.samples,accuracy:local.accuracy,
 confusion:local.confusion,macroF1:local.macroF1,
 maxOnnxAbsoluteError:maxOnnxError,maxSklearnAbsoluteError:maxSklearnError,
 cases:perSample,
 datasetLicense:'CC BY 4.0',datasetDOI:'10.24432/C56C76',
 physicalValidation:'none',realWorldBuildSuccessPercent:null,
 limits:'Only the UCI Iris 30-row stratified holdout. No MLPerf, deployment guarantee, real chip power, timing or physical success percentage.',
};
await mkdir(file('benchmarks/evidence'),{recursive:true});
await writeFile(file('benchmarks/evidence/phase12-iris.json'),JSON.stringify(result,null,2)+'\n');
process.stdout.write('PHASE12 REAL UCI IRIS MLP + ONNX CPU: '+local.correct+'/'+local.samples+
 ' correct; 30/30 paired probabilities checked; max ORT error '+maxOnnxError+'\n');
