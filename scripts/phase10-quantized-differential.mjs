// Phase 10: real ONNX Runtime CPU graph references vs browser/Node JS model.
// A missing ONNX engine or mismatch is a hard error, not a skipped case.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runOnnxQuantizedCase} from '../js/labs/ai/onnx-quantized.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const fp=p=>path.join(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=await readFile(fp('benchmarks/phase10/quantized-cases.json'));
const frozen=JSON.parse(await readFile(fp('benchmarks/phase10/acceptance.json'),'utf8'));
const fixture=JSON.parse(bytes);
assert.equal(frozen.format,'invention-lab/phase10-acceptance/1');
assert.equal(fixture.format,'invention-lab/phase10-quantized-fixtures/1');
assert.equal(fixture.cases.length,6);
assert.deepEqual(fixture.cases.map(c=>c.id),frozen.required.map(c=>c.id));
const oracleBytes=await readFile(fp('scripts/phase10-onnx-oracle.py'));
const stdout=execFileSync('python3',[fp('scripts/phase10-onnx-oracle.py')],{
  cwd:root,input:bytes,encoding:'utf8',timeout:120000,maxBuffer:2_000_000,
});
const oracle=JSON.parse(stdout);
assert.equal(oracle.format,'invention-lab/phase10-reference/1');
assert.equal(oracle.referenceEngine,'ONNX Runtime CPUExecutionProvider');
assert.equal(oracle.cases.length,6);
const rows=[];
for(let i=0;i<fixture.cases.length;i++){
  const c=fixture.cases[i],ref=oracle.cases[i],expected=frozen.required[i];
  assert.equal(c.id,ref.id);
  assert.equal(c.id,expected.id);
  assert.match(ref.modelSha256,/^[a-f0-9]{64}$/);
  const simulated=runOnnxQuantizedCase(c);
  const refs=ref.outputs;
  const oracleOutput=refs.find(o=>o.name==='Y');
  assert.ok(oracleOutput,'ONNX Runtime must emit Y for '+c.id);
  assert.equal(oracleOutput.dtype,expected.dtype);
  assert.deepEqual(oracleOutput.shape,simulated.output.shape);
  assert.deepEqual(simulated.output.values,expected.values,
    'JS differs from frozen independent hand-reviewed vector '+c.id);
  const isInteger=expected.dtype!=='float32';
  const tolerance=isInteger?0:frozen.frozenNumericalPolicy.dequantizedAbsolute;
  const errors=simulated.output.values.map((v,j)=>Math.abs(v-oracleOutput.values[j]));
  const maxError=Math.max(...errors);
  const relative=Math.max(...errors.map((v,j)=>v/Math.max(1,Math.abs(oracleOutput.values[j]))));
  if(isInteger) {
    assert.deepEqual(oracleOutput.values,expected.values,
      'ORT quantized output differs from frozen vector '+c.id);
  }else {
    for(let j=0;j<expected.values.length;j++)
      assert.ok(Math.abs(oracleOutput.values[j]-expected.values[j])<=tolerance,
        'ORT dequantized output differs from frozen vector '+c.id);
  }
  assert.ok(Number.isFinite(maxError)&&maxError<=tolerance,'quantized differential output mismatch '+c.id+' err='+maxError);
  assert.ok(Number.isFinite(relative)&&relative<=(isInteger?0:frozen.frozenNumericalPolicy.dequantizedRelative),
    'quantized differential relative mismatch '+c.id+' err='+relative);
  const intermediates=[];
  if(simulated.quantized){
    const intermediate=refs.find(o=>o.name==='Q');
    assert.ok(intermediate,'Q/DQ oracle must return explicit quantized Q output');
    assert.equal(intermediate.dtype,simulated.quantized.dtype);
    assert.deepEqual(intermediate.shape,simulated.quantized.shape);
    assert.deepEqual(intermediate.values,simulated.quantized.values,'ONNX Q intermediate mismatch '+c.id);
    intermediates.push({name:'Q',dtype:intermediate.dtype,shape:intermediate.shape,
      jsValues:simulated.quantized.values,onnxValues:intermediate.values,
      onnxOutputSha256:intermediate.sha256});
  }
  rows.push({
    id:c.id,op:c.op,verdict:'pass',modelSha256:ref.modelSha256,
    maxAbsoluteError:maxError,maxRelativeError:relative,
    output:{name:'Y',dtype:oracleOutput.dtype,shape:oracleOutput.shape,
      jsValues:simulated.output.values,onnxValues:oracleOutput.values,
      onnxOutputSha256:oracleOutput.sha256},
    intermediates,
  });
}
const result={
  format:'invention-lab/phase10-quantized-evidence/1',
  commitSha:process.env.GITHUB_SHA||null,verdict:'pass',
  referenceEngine:oracle.referenceEngine,opset:13,
  versions:oracle.versions,fixtureSha256:sha(bytes),oracleSourceSha256:sha(oracleBytes),
  cases:rows,
  physicalValidation:'none',realWorldBuildSuccessPercent:null,
  limitations:'Six small 2D per-tensor int8/uint8 ONNX operations, not generalized ONNX, real CPU/GPU/TPU silicon timing, or manufacturing evidence.',
};
await mkdir(fp('benchmarks/evidence'),{recursive:true});
await writeFile(fp('benchmarks/evidence/phase10-quantized.json'),JSON.stringify(result,null,2)+'\n');
process.stdout.write('PHASE10 REAL ONNX QUANTIZED CPU DIFFERENTIAL PASS: '+rows.length+'/'+rows.length+' cases; ONNX Runtime '+oracle.versions.onnxruntime+'; raw model bytes archived\n');
