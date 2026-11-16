// Phase 9 genuine ONNX Runtime reference comparison (no fake reference).
// Python must execute actual ONNX protobuf model with CPUExecutionProvider.
// The output artifact is published ONLY if all five independent cases pass.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import path from 'node:path';
import {runOnnxSubset} from '../js/labs/ai/onnx-subset.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const full=p=>path.join(root,p);
const hash=v=>createHash('sha256').update(v).digest('hex');
const bytes=await readFile(full('benchmarks/phase9/graphs.json'));
const fixture=JSON.parse(bytes);
const manifest=JSON.parse(await readFile(full('benchmarks/phase9/acceptance.json'),'utf8'));
assert.equal(fixture.format,'invention-lab/onnx-subset-fixtures/1');
assert.equal(manifest.format,'invention-lab/phase9-onnx-acceptance/1');
assert.equal(fixture.cases.length,5);
assert.deepEqual(fixture.cases.map(c=>c.id),manifest.requiredCases.map(c=>c.id));
const oracleBytes=await readFile(full('scripts/phase9-onnxruntime-oracle.py'));
const output=execFileSync('python3',[full('scripts/phase9-onnxruntime-oracle.py')],{
 cwd:root, input:bytes,encoding:'utf8',timeout:90000,maxBuffer:3_000_000,
});
const ref=JSON.parse(output);
assert.equal(ref.format,'invention-lab/phase9-onnx-runtime-reference/1');
assert.equal(ref.referenceEngine,'ONNX Runtime CPUExecutionProvider');
assert.equal(ref.operatorSet,13);
assert.equal(ref.dtype,'float32');
assert.equal(ref.cases.length,manifest.requiredCases.length);
const rows=[];
for(let k=0;k<fixture.cases.length;k++){
 const graph=fixture.cases[k],expected=manifest.requiredCases[k],reference=ref.cases[k];
 assert.equal(reference.id,graph.id,'external oracle case ordering or identity mismatch');
 assert.deepEqual(graph.nodes.map(n=>n.op),expected.ops);
 assert.deepEqual(graph.outputs,expected.outputs);
 assert.match(reference.modelSha256,/^[0-9a-f]{64}$/);
 const result=runOnnxSubset(graph);
 assert.equal(result.ok,true);
 assert.equal(result.physicalValidation,'none');
 const outputs=[];
 for(const outputName of graph.outputs){
   const a=result.outputs[outputName];
   const b=reference.outputs.find(x=>x.name===outputName);
   assert.ok(b,'missing actual ONNX Runtime graph output '+outputName);
   assert.deepEqual(a.shape,b.shape,'ONNX Runtime output shape mismatch');
   assert.equal(a.values.length,b.values.length);
   const differences=a.values.map((v,i)=>Math.abs(v-b.values[i]));
   const absolute=Math.max(...differences);
   const relative=Math.max(...differences.map((d,i)=>d/Math.max(1,Math.abs(b.values[i]))));
   assert.ok(Number.isFinite(absolute)&&Number.isFinite(relative),'nonfinite reference error');
   assert.ok(absolute<=manifest.tolerance.maxAbsoluteError,'ONNX f32 absolute error exceeded '+graph.id+': '+absolute);
   assert.ok(relative<=manifest.tolerance.maxRelativeError,'ONNX f32 relative error exceeded '+graph.id+': '+relative);
   outputs.push({name:outputName,shape:a.shape,maxAbsoluteError:absolute,
     maxRelativeError:relative,jsValues:a.values,onnxValues:b.values,
     onnxOutputSha256:b.sha256});
 }
 rows.push({id:graph.id,operatorSequence:graph.nodes.map(n=>n.op),
   modelSha256:reference.modelSha256,outputs,verdict:'pass'});
}
const evidence={
 format:'invention-lab/phase9-onnx-independent/1',
 commitSha:process.env.GITHUB_SHA||null,
 verdict:'pass',referenceEngine:ref.referenceEngine,
 operatorSet:13,dtype:'float32',
 fixtureSha256:hash(bytes),oracleSourceSha256:hash(oracleBytes),
 versions:ref.versions,cases:rows,
 physicalValidation:'none',realWorldBuildSuccessPercent:null,
 limitations:'Five fixed 2D float32 opset-13 inference graphs only; not full ONNX, MLPerf, GPU/TPU timing, silicon validation or fabrication yield.',
};
await mkdir(full('benchmarks/evidence'),{recursive:true});
await writeFile(full('benchmarks/evidence/phase9-onnx.json'),JSON.stringify(evidence,null,2)+'\n');
process.stdout.write('PHASE9 REAL ONNX RUNTIME DIFFERENTIAL PASS: '+rows.length+'/'+rows.length+
 ' graphs; opset=13 dtype=float32 ONNX Runtime='+ref.versions.onnxruntime+'\n');
