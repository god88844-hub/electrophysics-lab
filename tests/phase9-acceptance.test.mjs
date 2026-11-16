import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runOnnxSubset} from '../js/labs/ai/onnx-subset.js';
import {REQUIRED_ONNX_CASES,evaluatePhase9Evidence} from '../js/phase9/acceptance.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase9/acceptance.json',import.meta.url),'utf8'));
const fixtures=JSON.parse(readFileSync(new URL('../benchmarks/phase9/graphs.json',import.meta.url),'utf8'));
const hash='a'.repeat(64);
function record(){
  return {
    format:'invention-lab/phase9-onnx-independent/1',
    commitSha:'fixture-commit',verdict:'pass',
    referenceEngine:'ONNX Runtime CPUExecutionProvider',operatorSet:13,dtype:'float32',
    fixtureSha256:hash,oracleSourceSha256:hash,
    versions:{onnx:'synthetic-acceptance-test-only',onnxruntime:'synthetic',numpy:'synthetic'},
    cases:fixtures.cases.map(graph=>{
      // Pure unit records verify the gate's rejection behavior only.
      // Never write these records as real external CI evidence.
      const result=runOnnxSubset(graph),out=result.outputs.Y;
      const buffer=Buffer.alloc(out.values.length*4);
      out.values.forEach((x,i)=>buffer.writeFloatLE(x,i*4));
      return {id:graph.id,operatorSequence:graph.nodes.map(n=>n.op),
        modelSha256:hash,verdict:'pass',outputs:[{
          name:'Y',shape:out.shape,jsValues:[...out.values],onnxValues:[...out.values],
          maxAbsoluteError:0,maxRelativeError:0,
          onnxOutputSha256:createHash('sha256').update(buffer).digest('hex'),
        }]};
    }),
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
  };
}
const evaluate=(r,m=manifest,f=fixtures)=>evaluatePhase9Evidence(m,r,f,{
  commitSha:'fixture-commit',fixtureSha256:hash,oracleSourceSha256:hash,
});
test('Phase 9 gate: exactly five frozen ONNX reference cases with strict f32 error bounds',()=>{
  assert.deepEqual(manifest.requiredCases.map(c=>[c.id,c.ops]),REQUIRED_ONNX_CASES);
  const verdict=evaluate(record());
  assert.equal(verdict.ok,true,verdict.errors.join('; '));
  assert.equal(verdict.passed,5);
});
test('Phase 9 gate: missing, duplicate, skipped or swapped output cases fail',()=>{
  for(const [label,mutate] of [
    ['missing',r=>r.cases.pop()],
    ['duplicate',r=>r.cases.push(structuredClone(r.cases[0]))],
    ['skipped',r=>r.cases[1].verdict='skip'],
    ['reorder',r=>[r.cases[0],r.cases[1]]=[r.cases[1],r.cases[0]]],
    ['rename',r=>r.cases[3].id='unknown'],
    ['missing-output',r=>r.cases[3].outputs=[]],
  ]){
    const r=record();mutate(r);
    assert.equal(evaluate(r).ok,false,label);
  }
});
test('Phase 9 gate: no false physical proof, stale SHA, or unsupported dtype/opset',()=>{
  for(const [label,mutate] of [
    ['physical',r=>r.physicalValidation='measured'],
    ['yield',r=>r.realWorldBuildSuccessPercent=99],
    ['stale',r=>r.commitSha='other'],
    ['fixture-sha',r=>r.fixtureSha256='b'.repeat(64)],
    ['source-sha',r=>r.oracleSourceSha256='b'.repeat(64)],
    ['wrong-opset',r=>r.operatorSet=21],
    ['fake-ref',r=>r.referenceEngine='mock'],
    ['missing-version',r=>delete r.versions.onnxruntime],
  ]){
    const r=record();mutate(r);assert.equal(evaluate(r).ok,false,label);
  }
});
test('Phase 9 gate: silently relaxing tolerances or altering graph inventory fails',()=>{
  const changed=structuredClone(manifest);changed.tolerance.maxAbsoluteError=0.1;
  assert.equal(evaluate(record(),changed).ok,false);
  const missing=structuredClone(fixtures);missing.cases.pop();
  assert.equal(evaluate(record(),manifest,missing).ok,false);
  const wrong=structuredClone(fixtures);wrong.cases[0].nodes[0].op='Conv';
  assert.equal(evaluate(record(),manifest,wrong).ok,false);
});
test('Phase 9 gate: numerical error and spoofed error summary never pass',()=>{
  const mutated=record();
  mutated.cases[0].outputs[0].onnxValues[0]+=0.01;
  assert.equal(evaluate(mutated).ok,false);
  const lie=record();
  lie.cases[0].outputs[0].maxAbsoluteError=0.0001;
  assert.equal(evaluate(lie).ok,false);
  const fakeHash=record();
  fakeHash.cases[0].outputs[0].onnxOutputSha256='c'.repeat(64);
  assert.equal(evaluate(fakeHash).ok,false);
});
test('Phase 9 gate: mismatched output data shape and nonfinite numbers must fail',()=>{
  for(const mutate of [
    o=>o.shape=[3,3],o=>o.jsValues[0]=NaN,o=>o.onnxValues[0]=Infinity,
    o=>o.jsValues.pop(),o=>o.maxRelativeError=1e-3,
  ]){
    const r=record();mutate(r.cases[2].outputs[0]);assert.equal(evaluate(r).ok,false);
  }
});
