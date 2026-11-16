// Mandatory NumPy reference for deterministic, exactly representable
// integer-matrix accelerator workloads. The current JS accelerator is an
// arithmetic kernel, NOT a cycle-accurate GPU/TPU/silicon model.
import { execFileSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { matmul } from '../js/labs/ai/tensor.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const cases=[
 {id:'matmul-2x3x2-signed',a:[[1,-2,3],[0,4,-1]],b:[[2,0],[-1,5],[3,2]]},
 {id:'matmul-3x2x3-mixed',a:[[1,0],[-2,4],[3,5]],b:[[2,-1,3],[7,2,-2]]},
];
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
 assert.deepEqual(actual,ref.out,'JS accelerator matmul must match independently executed NumPy for '+item.id);
 evidence.push({id:item.id,verdict:'pass',shape:[item.a.length,item.a[0].length,item.b[0].length],
   maxAbsError:0,arithmetic:'float64 values restricted to exactly representable small integers'});
}
const record={
 format:'invention-lab/phase7-cross-engine/1',result:'pass',
 independentReference:'NumPy',version:reference.numpy,
 fixtureSha256:createHash('sha256').update(source).digest('hex'),
 cases:evidence,
 requiredCases:cases.map(x=>x.id),
 scope:'small deterministic tensor arithmetic; no MLPerf model accuracy, hardware timing, GPU/TPU or physical-validation claim',
 physicalValidation:'none',realWorldBuildSuccessPercent:null,
};
const dest=path.join(root,'benchmarks/evidence/phase7-numpy.json');
await mkdir(path.dirname(dest),{recursive:true});
await writeFile(dest,JSON.stringify(record,null,2)+'\n');
process.stdout.write('PHASE7 INDEPENDENT NUMPY ORACLE PASS: '+evidence.map(x=>x.id).join(', ')+'; numpy '+reference.numpy+'\n');
