// Strict Phase 10 CI gate: no absent, skipped, spoofed, reordered or stale
// ONNX Runtime evidence may be counted as success. All six actual .onnx
// protobuf binaries are checked against the archived source-run hashes.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {evaluatePhase10Evidence} from '../js/phase10/acceptance.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=x=>path.join(root,x);
const hash=v=>createHash('sha256').update(v).digest('hex');
try{
 const [m,fixtureBytes,oracleBytes,r]=await Promise.all([
   readFile(file('benchmarks/phase10/acceptance.json'),'utf8').then(JSON.parse),
   readFile(file('benchmarks/phase10/quantized-cases.json')),
   readFile(file('scripts/phase10-onnx-oracle.py')),
   readFile(file('benchmarks/evidence/phase10-quantized.json'),'utf8').then(JSON.parse),
 ]);
 const state=evaluatePhase10Evidence(m,r,JSON.parse(fixtureBytes),{
   commitSha:process.env.GITHUB_SHA||null,
   fixtureSha256:hash(fixtureBytes),
   oracleSourceSha256:hash(oracleBytes),
 });
 const dir=file('benchmarks/evidence/phase10-models');
 const names=(await readdir(dir)).sort();
 const expected=m.required.map(x=>x.id+'.onnx').sort();
 if(JSON.stringify(names)!==JSON.stringify(expected))
   state.errors.push('Actual ONNX reference model file collection is incomplete or unexpected');
 for(const row of m.required){
   if(!/^[a-z][a-z0-9-]{1,39}$/.test(row.id)){state.errors.push('Unsafe model ID');continue;}
   const data=await readFile(path.join(dir,row.id+'.onnx'));
   const match=r.cases?.find(x=>x.id===row.id);
   if(hash(data)!==match?.modelSha256)
      state.errors.push('Actual ONNX ModelProto digest disagreement '+row.id);
 }
 state.ok=state.ok&&state.errors.length===0;
 const summary={
   format:'invention-lab/phase10-summary/1',commitSha:process.env.GITHUB_SHA||null,
   outcome:state.ok?'pass':'fail',passed:state.passed,required:state.required,
   errors:state.errors,physicalValidation:'none',realWorldBuildSuccessPercent:null,
   scope:'Six small 2D per-tensor int8/uint8 ONNX operations, not full ONNX or real hardware.',
 };
 await mkdir(file('benchmarks/evidence'),{recursive:true});
 await writeFile(file('benchmarks/evidence/phase10-summary.json'),JSON.stringify(summary,null,2)+'\n');
 process.stdout.write('Phase 10 strict ONNX quantized reference: '+summary.outcome+' ('+summary.passed+'/'+summary.required+')\n');
 if(!state.ok){for(const error of state.errors)process.stderr.write('FAIL '+error+'\n');process.exitCode=1;}
}catch(error){process.stderr.write('Phase 10 strict references missing/malformed: '+error.message+'\n');process.exitCode=1;}
