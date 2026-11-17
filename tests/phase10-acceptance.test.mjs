// Synthetic records in this file test only evidence-gate rejection logic.
// They are NEVER published as actual independent ONNX Runtime measurements.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runOnnxQuantizedCase} from '../js/labs/ai/onnx-quantized.js';
import {evaluatePhase10Evidence,PHASE10_REQUIRED} from '../js/phase10/acceptance.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase10/acceptance.json',import.meta.url),'utf8'));
const fixture=JSON.parse(readFileSync(new URL('../benchmarks/phase10/quantized-cases.json',import.meta.url),'utf8'));
const sha='a'.repeat(64);
const bytesOf=(dtype,values)=>{
 const b=Buffer.alloc(values.length*(dtype==='float32'?4:1));
 for(let i=0;i<values.length;i++){
   if(dtype==='int8')b.writeInt8(values[i],i);
   else if(dtype==='uint8')b.writeUInt8(values[i],i);
   else b.writeFloatLE(values[i],4*i);
 }
 return createHash('sha256').update(b).digest('hex');
};
function synthetic(){
 return {
   format:'invention-lab/phase10-quantized-evidence/1',
   commitSha:'synthetic-test-only',verdict:'pass',referenceEngine:'ONNX Runtime CPUExecutionProvider',
   opset:13,versions:{onnx:'1.23.2',onnxruntime:'1.32.0',numpy:'2.4.6'},
   fixtureSha256:sha,oracleSourceSha256:sha,
   cases:fixture.cases.map(input=>{
     const outcome=runOnnxQuantizedCase(input),t=outcome.output,qt=outcome.quantized;
     return {
       id:input.id,op:input.op,verdict:'pass',modelSha256:sha,
       maxAbsoluteError:0,maxRelativeError:0,
       output:{name:'Y',dtype:t.dtype,shape:t.shape,
         jsValues:[...t.values],onnxValues:[...t.values],
         onnxOutputSha256:bytesOf(t.dtype,t.values)},
       intermediates:qt?[{name:'Q',dtype:qt.dtype,shape:qt.shape,
         jsValues:[...qt.values],onnxValues:[...qt.values],
         onnxOutputSha256:bytesOf(qt.dtype,qt.values)}]:[],
     };
   }),
   physicalValidation:'none',realWorldBuildSuccessPercent:null,
 };
}
const check=(report,man=manifest,fx=fixture)=>evaluatePhase10Evidence(man,report,fx,{
 commitSha:'synthetic-test-only',fixtureSha256:sha,oracleSourceSha256:sha,
});
test('Phase10 frozen gate requires precisely six independently compared outputs',()=>{
 assert.deepEqual(manifest.required.map(x=>[x.id,x.dtype,x.values]),PHASE10_REQUIRED);
 const r=check(synthetic());
 assert.equal(r.ok,true,r.errors.join('; '));
 assert.equal(r.passed,6);
});
test('Phase10 missing, duplicate, skipped, extra or reorder cases FAIL',()=>{
 for(const [kind,mutate] of [
  ['missing',r=>r.cases.pop()],
  ['duplicate',r=>r.cases.push({...r.cases[0]})],
  ['skipped',r=>r.cases[0].verdict='skip'],
  ['reordered',r=>[r.cases[0],r.cases[1]]=[r.cases[1],r.cases[0]]],
  ['extra',r=>r.cases.push({...r.cases[0],id:'not-allowed'})],
 ]){
  const r=synthetic();mutate(r);assert.equal(check(r).ok,false,kind);
 }
});
test('Phase10 all hashes, source provenance and reference versions are mandatory',()=>{
 for(const mutate of [
  r=>r.commitSha='stale',r=>r.fixtureSha256='c'.repeat(64),
  r=>r.oracleSourceSha256='wrong',
  r=>r.cases[1].modelSha256='x',
  r=>r.cases[0].output.onnxOutputSha256='b'.repeat(64),
  r=>r.versions.onnx='0',r=>r.referenceEngine='mock',
  r=>r.cases[4].intermediates[0].onnxOutputSha256='b'.repeat(64)
 ]){
  const r=synthetic();mutate(r);assert.equal(check(r).ok,false);
 }
});
test('Phase10 physical claim, wrong output byte and altered expected manifest FAIL',()=>{
 for(const mutate of [
  r=>r.realWorldBuildSuccessPercent=97,r=>r.physicalValidation='verified',
  r=>r.cases[0].output.onnxValues[0]=99,
  r=>r.cases[4].output.onnxValues[0]=100,
  r=>r.cases[4].intermediates[0].onnxValues[0]=0,
  r=>r.cases[5].output.dtype='uint8',
  r=>r.cases[2].maxAbsoluteError=1,
 ]){
  const r=synthetic();mutate(r);assert.equal(check(r).ok,false);
 }
 const altered=structuredClone(manifest);altered.required[1].values[0]++;
 assert.equal(check(synthetic(),altered).ok,false);
 const smaller=structuredClone(manifest);smaller.required.pop();
 assert.equal(check(synthetic(),smaller).ok,false);
});
test('Phase10 altered fixture and loose numerical tolerance must not pass',()=>{
 const changed=structuredClone(fixture);changed.cases[0].a.values[0]=5;
 assert.equal(check(synthetic(),manifest,changed).ok,false);
 const enlarged=structuredClone(manifest);enlarged.frozenNumericalPolicy.dequantizedAbsolute=0.1;
 assert.equal(check(synthetic(),enlarged).ok,false);
});
