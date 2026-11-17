// Phase 11 real independent CPU reference, with actual ONNX protobuf graph
// construction. The JS model and ORT run exactly the same committed inputs;
// we do not call "oracle" for fixture strings that were never executed.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runPhase11Case} from '../js/labs/ai/onnx-per-axis-conv.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=x=>path.join(root,x);
const hash=v=>createHash('sha256').update(v).digest('hex');
const [bytes,expected,oracleSource]=await Promise.all([
  readFile(file('benchmarks/phase11/cases.json')),
  readFile(file('benchmarks/phase11/acceptance.json'),'utf8').then(JSON.parse),
  readFile(file('scripts/phase11-onnx-oracle.py')),
]);
const fixture=JSON.parse(bytes);
assert.equal(fixture.format,'invention-lab/phase11-fixtures/1');
assert.equal(expected.format,'invention-lab/phase11-acceptance/1');
assert.equal(fixture.cases.length,6);
assert.deepEqual(fixture.cases.map(c=>c.id),expected.required.map(c=>c.id));
const reference=JSON.parse(execFileSync('python3',[file('scripts/phase11-onnx-oracle.py')],{
  input:bytes,encoding:'utf8',cwd:root,timeout:120000,maxBuffer:2_000_000
}));
assert.equal(reference.format,'invention-lab/phase11-onnx-reference/1');
assert.equal(reference.referenceEngine,'ONNX Runtime CPUExecutionProvider');
assert.equal(reference.cases.length,6);
const cases=[];
for(let i=0;i<6;i++){
  const input=fixture.cases[i],frozen=expected.required[i],ref=reference.cases[i];
  assert.equal(ref.id,input.id);
  assert.equal(frozen.id,input.id);
  assert.match(ref.modelSha256,/^[a-f0-9]{64}$/);
  const js=runPhase11Case(input),o=ref.outputs.find(x=>x.name==='Y');
  assert.ok(o,'Missing real ONNX CPU output Y for '+input.id);
  assert.equal(o.dtype,frozen.dtype);
  assert.deepEqual(o.shape,frozen.shape,'ONNX output shape differs '+input.id);
  assert.deepEqual(js.output.shape,frozen.shape);
  const tol=frozen.dtype==='float32'?expected.tolerance.floatAbsolute:0;
  const maxErr=Math.max(...o.values.map((v,j)=>Math.abs(v-js.output.values[j])));
  const maxRef=Math.max(...o.values.map((v,j)=>Math.abs(v-frozen.values[j])));
  assert.ok(Number.isFinite(maxErr)&&maxErr<=tol,
    'Independent ORT and JS output mismatch '+input.id+' err='+maxErr);
  assert.ok(Number.isFinite(maxRef)&&maxRef<=tol,
    'Independent ORT differs from separate frozen acceptance '+input.id+' err='+maxRef);
  if(frozen.dtype!=='float32'){
    assert.deepEqual(js.output.values,frozen.values);
    assert.deepEqual(o.values,frozen.values,'Exact integer CPU output mismatch '+input.id);
  }
  const relative=Math.max(...o.values.map((v,j)=>
    Math.abs(v-js.output.values[j])/Math.max(1,Math.abs(v))));
  assert.ok(relative<=(frozen.dtype==='float32'?expected.tolerance.floatScaledRelative:0));
  let quantized=null;
  if(js.quantized){
    const q=ref.outputs.find(x=>x.name==='Q');
    assert.ok(q,'Per-axis Q intermediate missing from real ONNX Runtime');
    assert.equal(q.dtype,js.quantized.dtype);
    assert.deepEqual(q.values,js.quantized.values);
    assert.deepEqual(q.values,frozen.quantized);
    quantized={name:'Q',dtype:q.dtype,shape:q.shape,values:q.values,jsValues:js.quantized.values,
      sha256:q.sha256};
  }
  cases.push({
    id:input.id,op:input.op,verdict:'pass',modelSha256:ref.modelSha256,
    output:{name:'Y',dtype:o.dtype,shape:o.shape,values:o.values,
      jsValues:js.output.values,sha256:o.sha256},
    quantized,maxAbsoluteError:maxErr,maxRelativeError:relative
  });
}
const record={
  format:'invention-lab/phase11-evidence/1',verdict:'pass',
  commitSha:process.env.GITHUB_SHA||null,
  referenceEngine:reference.referenceEngine,opset:13,versions:reference.versions,
  fixtureSha256:hash(bytes),oracleSha256:hash(oracleSource),cases,
  physicalValidation:'none',realWorldBuildSuccessPercent:null,
  limitations:'Six fixed per-axis Q/DQ and NCHW QLinearConv graphs only; model outputs are not physical chip performance or yield',
};
await mkdir(file('benchmarks/evidence'),{recursive:true});
await writeFile(file('benchmarks/evidence/phase11-quantized.json'),JSON.stringify(record,null,2)+'\n');
process.stdout.write('PHASE11 INDEPENDENT ONNX CPU PASS: 6/6 per-axis/convolution graphs, saved ONNX binaries\n');
