// Synthetic reports below exist ONLY to exercise the evidence gate's
// ability to reject corrupt/stale rows. They never become CI evidence files.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runPhase11Case} from '../js/labs/ai/onnx-per-axis-conv.js';
import {evaluatePhase11,outputDigest,PHASE11_REQUIRED} from '../js/phase11/acceptance.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase11/acceptance.json',import.meta.url),'utf8'));
const fixture=JSON.parse(readFileSync(new URL('../benchmarks/phase11/cases.json',import.meta.url),'utf8'));
const hash='a'.repeat(64);
function fake(){
 return {
   format:'invention-lab/phase11-evidence/1',verdict:'pass',
   commitSha:'unit-test-only',referenceEngine:'ONNX Runtime CPUExecutionProvider',
   opset:13,versions:{onnx:'1.23.2',onnxruntime:'1.32.0',numpy:'2.4.6'},
   fixtureSha256:hash,oracleSha256:hash,
   cases:fixture.cases.map(input=>{
     const r=runPhase11Case(input),o=r.output,q=r.quantized;
     return {
       id:input.id,op:input.op,verdict:'pass',modelSha256:hash,
       output:{name:'Y',dtype:o.dtype,shape:o.shape,values:[...o.values],
         jsValues:[...o.values],sha256:outputDigest(o.dtype,o.values)},
       quantized:q?{name:'Q',dtype:q.dtype,shape:q.shape,values:[...q.values],
         jsValues:[...q.values],sha256:outputDigest(q.dtype,q.values)}:null,
       maxAbsoluteError:0,maxRelativeError:0,
     };
   }),
   physicalValidation:'none',realWorldBuildSuccessPercent:null,
 };
}
const check=(r,m=manifest,f=fixture)=>evaluatePhase11(m,f,r,{
 commitSha:'unit-test-only',fixtureSha256:hash,oracleSha256:hash,
});
test('Phase11 acceptance: explicit six-case frozen reference and correct synthetic structural gate',()=>{
 assert.deepEqual(manifest.required.map(x=>[x.id,x.op,x.dtype,x.shape,x.values]),
   PHASE11_REQUIRED);
 const state=check(fake());
 assert.equal(state.ok,true,state.errors.join('; '));
 assert.equal(state.passed,6);
});
test('Phase11 acceptance: missing, duplicate, skipped, reordered, unrelated case fail',()=>{
 for(const mutate of [
  r=>r.cases.pop(),
  r=>r.cases.push(structuredClone(r.cases[0])),
  r=>r.cases[1].verdict='skip',
  r=>[r.cases[0],r.cases[1]]=[r.cases[1],r.cases[0]],
  r=>r.cases[2].id='not-a-reference',
 ]){
  const r=fake();mutate(r);
  assert.equal(check(r).ok,false);
 }
});
test('Phase11 acceptance: source, tool and actual output hash are mandatory',()=>{
 for(const mutate of [
   r=>r.commitSha='outdated',
   r=>r.fixtureSha256='b'.repeat(64),
   r=>r.oracleSha256='b'.repeat(64),
   r=>r.cases[0].modelSha256='short',
   r=>r.cases[1].output.sha256='b'.repeat(64),
   r=>r.cases[4].quantized.sha256='b'.repeat(64),
   r=>r.versions.onnxruntime='old',
   r=>r.referenceEngine='synthetic',
 ]){
  const r=fake();mutate(r);assert.equal(check(r).ok,false);
 }
});
test('Phase11 acceptance: unsupported fabrication percentage and physical stage rejected',()=>{
 const a=fake();a.realWorldBuildSuccessPercent=100;
 assert.equal(check(a).ok,false);
 const b=fake();b.physicalValidation='real hardware';
 assert.equal(check(b).ok,false);
});
test('Phase11 acceptance: wrong frozen output, quantum/conv input mutation and tolerance manipulation rejected',()=>{
 const a=fake();a.cases[0].output.values[0]+=1;
 assert.equal(check(a).ok,false);
 const b=fake();b.cases[4].quantized.values[0]+=1;
 assert.equal(check(b).ok,false);
 const c=structuredClone(manifest);c.required[1].values[0]=99;
 assert.equal(check(fake(),c).ok,false);
 const d=structuredClone(manifest);d.tolerance.floatAbsolute=1;
 assert.equal(check(fake(),d).ok,false);
 const e=structuredClone(fixture);e.cases[2].wScales[0]=0.5;
 assert.equal(check(fake(),manifest,e).ok,false);
});
test('Phase11 acceptance: identical int8/uint8 bytes need explicit dtype metadata, with bounded hashing',()=>{
 // -1 in int8 and 255 in uint8 share a byte encoding. The evidence gate
 // MUST check dtype as well as the content hash; a digest alone is not typed.
 assert.equal(outputDigest('int8',[-1,0,127]),outputDigest('uint8',[255,0,127]));
 assert.throws(()=>outputDigest('float32',[NaN]));
 assert.throws(()=>outputDigest('other',[1]));
});
