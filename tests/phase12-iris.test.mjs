import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runIrisModelBenchmark,validateIrisFixture} from '../js/labs/ai/iris-benchmark.js';
const original=JSON.parse(readFileSync(new URL('../benchmarks/phase12/iris-mlp.json',import.meta.url),'utf8'));
const source=readFileSync(new URL('../benchmarks/phase12/iris.csv',import.meta.url),'utf8');
const copy=()=>structuredClone(original);
test('Phase 12: full licensed UCI Iris dataset is present with 150 source measurements',()=>{
  const lines=source.trim().split('\n');
  assert.equal(lines[0],'150,4,setosa,versicolor,virginica');
  assert.equal(lines.length,151);
  const classes=[0,0,0];
  for(const line of lines.slice(1)){
    const values=line.split(',').map(Number);
    assert.equal(values.length,5);
    assert.ok(values.every(Number.isFinite));
    classes[values[4]]++;
  }
  assert.deepEqual(classes,[50,50,50]);
  assert.equal(original.dataset.license,'CC BY 4.0');
  assert.equal(original.dataset.doi,'10.24432/C56C76');
});
test('Phase 12: reproducible stratified 120/30 holdout with no training leakage',()=>{
  const f=copy();
  const result=validateIrisFixture(f);
  assert.equal(result.trainIndices.length,120);
  assert.equal(result.testIndices.length,30);
  assert.equal(new Set([...result.trainIndices,...result.testIndices]).size,150);
  assert.deepEqual([0,1,2].map(c=>result.labels.filter(x=>x===c).length),[10,10,10]);
  for(let i=0;i<30;i++){
    const sourceRow=source.trim().split('\n')[f.split.testIndices[i]+1].split(',').map(Number);
    assert.deepEqual(f.split.holdoutRawFeatures[i],sourceRow.slice(0,4));
    assert.equal(f.split.holdoutLabels[i],sourceRow[4]);
  }
});
test('Phase 12: actual JS accelerator predicts 29 of 30 untouched botanical test rows',()=>{
  const out=runIrisModelBenchmark(copy());
  assert.equal(out.samples,30);
  assert.equal(out.trainSamples,120);
  assert.equal(out.correct,29);
  assert.equal(out.accuracy,29/30);
  assert.deepEqual(out.confusion,[[10,0,0],[0,10,0],[0,1,9]]);
  assert.deepEqual(out.predictions,original.reference.expectedPredictions);
  assert.ok(out.balancedAccuracy>0.96);
  assert.ok(out.macroF1>0.95);
  assert.equal(out.physicalValidation,'none');
  assert.equal(out.realWorldBuildSuccessPercent,null);
});
test('Phase 12: 30 complete finite class probability triples all sum to one',()=>{
  const out=runIrisModelBenchmark(copy());
  assert.equal(out.probabilities.length,30);
  for(const p of out.probabilities){
    assert.equal(p.length,3);
    assert.ok(p.every(x=>Number.isFinite(x)&&x>=0&&x<=1));
    assert.ok(Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-5);
  }
});
test('Phase 12: do not mutate model/holdout inputs when output arrays are edited',()=>{
  const fixture=copy(),before=JSON.stringify(fixture);
  const out=runIrisModelBenchmark(fixture);
  out.predictions[0]=99;
  out.probabilities[0][0]=99;
  assert.equal(JSON.stringify(fixture),before);
  assert.equal(runIrisModelBenchmark(fixture).predictions[0],0);
});
test('Phase 12: missing, duplicated or overlapping train/test indices must fail',()=>{
  for(const mutation of [
    f=>f.split.trainIndices[0]=f.split.testIndices[0],
    f=>f.split.testIndices.pop(),
    f=>f.split.trainIndices.push(2),
    f=>f.split.testIndices[0]=-1,
    f=>f.split.testIndices[0]=151,
    f=>f.split.trainCount=149,
  ]){
    const f=copy();mutation(f);
    assert.throws(()=>validateIrisFixture(f));
  }
});
test('Phase 12: unknown or changed dataset license, DOI, model architecture or training recipe fails',()=>{
  for(const mutation of [
    f=>f.dataset.license='proprietary',
    f=>f.dataset.doi='0.0',
    f=>f.dataset.totalSamples=149,
    f=>f.training.preprocessing='StandardScaler fit on all 150 rows',
    f=>f.training.hiddenUnits=100000,
    f=>f.training.scale[0]=0,
    f=>f.training.version='unknown',
    f=>f.graph.operatorSet=21,
    f=>f.graph.nodes[1].op='Sigmoid',
    f=>f.graph.outputs=['NotY'],
  ]){
    const f=copy();mutation(f);
    assert.throws(()=>runIrisModelBenchmark(f));
  }
});
test('Phase 12: raw test inputs and train-only standardized inputs cannot drift',()=>{
  for(const mutation of [
    f=>f.split.holdoutRawFeatures[0][0]=Infinity,
    f=>f.split.holdoutRawFeatures[0][0]=0,
    f=>f.graph.inputs[0].values[0]+=0.1,
    f=>f.graph.inputs[0].shape=[120,1],
    f=>f.split.holdoutLabels[0]=7,
    f=>f.split.holdoutLabels[0]=1,
  ]){
    const f=copy();mutation(f);
    assert.throws(()=>runIrisModelBenchmark(f));
  }
});
test('Phase 12: incorrect output model shape and malformed neural weights fail closed',()=>{
  for(const mutation of [
    f=>f.graph.initializers[0].shape=[6,4],
    f=>f.graph.initializers[2].values.pop(),
    f=>f.graph.initializers[1].values[0]=Infinity,
    f=>f.graph.nodes.push({id:'extra',op:'Relu',inputs:['H2'],output:'Y2'}),
    f=>f.graph.inputs[0].values.pop(),
  ]){
    const f=copy();mutation(f);
    assert.throws(()=>runIrisModelBenchmark(f));
  }
});
