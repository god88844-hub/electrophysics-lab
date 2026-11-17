// Mandatory NumPy reference for deterministic, exactly representable
// integer-matrix accelerator workloads. The current JS accelerator is an
// arithmetic kernel, NOT a cycle-accurate GPU/TPU/silicon model.
import { execFileSync } from 'node:child_process';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { matmul } from '../js/labs/ai/tensor.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const fixtureBytes=await readFile(path.join(root,'benchmarks/phase7/tensor-cases.json'));
const fixtures=JSON.parse(fixtureBytes);
assert.equal(fixtures.format,'invention-lab/phase7-tensor-cases/1');
assert.ok(Array.isArray(fixtures.cases)&&fixtures.cases.length===2,'frozen accelerator case count');
const cases=fixtures.cases.map(({id,a,b})=>({id,a,b}));
const request={format:'invention-lab/phase7-tensor-request/1',cases};
const source=JSON.stringify(request);
const result=execFileSync('python3',[path.join(root,'scripts/phase7-numpy-oracle.py')],{
 input:source,encoding:'utf8',timeout:20000,maxBuffer:1000000,
});
const reference=JSON.parse(result);
assert.equal(reference.format,'invention-lab/phase7-tensor-numpy/1');
assert.equal(reference.results.length,cases.length);
const evidence=[];
for(const item of cases){
 const ref=reference.results.find(x=>x.id===item.id);
 assert.ok(ref,'NumPy omitted the required case '+item.id);
 const actual=matmul(item.a,item.b,{precision:'f64'});
 const expected=fixtures.cases.find(x=>x.id===item.id)?.expected;
 assert.deepEqual(ref.out,expected,'NumPy output differs from the frozen expected test vector for '+item.id);
 assert.deepEqual(actual,ref.out,'JS accelerator matmul must match independently executed NumPy for '+item.id);
 evidence.push({id:item.id,verdict:'pass',shape:[item.a.length,item.a[0].length,item.b[0].length],
   maxAbsError:0,arithmetic:'float64 values restricted to exactly representable small integers'});
}
const record={
 format:'invention-lab/phase7-cross-engine/1',result:'pass',
 commitSha:process.env.GITHUB_SHA||null,
 independentReference:'NumPy',version:reference.numpy,
 fixtureSha256:createHash('sha256').update(fixtureBytes).digest('hex'),
 requestSha256:createHash('sha256').update(source).digest('hex'),
 cases:evidence,
 requiredCases:cases.map(x=>x.id),
 scope:'small deterministic tensor arithmetic; no MLPerf model accuracy, hardware timing, GPU/TPU or physical-validation claim',
 physicalValidation:'none',realWorldBuildSuccessPercent:null,
};
const dest=path.join(root,'benchmarks/evidence/phase7-numpy.json');
await mkdir(path.dirname(dest),{recursive:true});
await writeFile(dest,JSON.stringify(record,null,2)+'\n');
process.stdout.write('PHASE7 INDEPENDENT NUMPY ORACLE PASS: '+evidence.map(x=>x.id).join(', ')+'; numpy '+reference.numpy+'\n');
