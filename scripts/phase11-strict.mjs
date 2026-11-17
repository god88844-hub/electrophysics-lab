// Phase 11 CI: verify all six actual .onnx model files and exact byte hash
// evidence before allowing a success verdict. No skipped references.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluatePhase11} from '../js/phase11/acceptance.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const p=x=>path.join(root,x),sha=x=>createHash('sha256').update(x).digest('hex');
try{
 const [manifest,fixtureBytes,oracleBytes,evidence]=await Promise.all([
   readFile(p('benchmarks/phase11/acceptance.json'),'utf8').then(JSON.parse),
   readFile(p('benchmarks/phase11/cases.json')),
   readFile(p('scripts/phase11-onnx-oracle.py')),
   readFile(p('benchmarks/evidence/phase11-quantized.json'),'utf8').then(JSON.parse),
 ]);
 const verdict=evaluatePhase11(manifest,JSON.parse(fixtureBytes),evidence,{
   commitSha:process.env.GITHUB_SHA||null,
   fixtureSha256:sha(fixtureBytes),
   oracleSha256:sha(oracleBytes),
 });
 const modelDir=p('benchmarks/evidence/phase11-models');
 const names=(await readdir(modelDir)).sort();
 const required=manifest.required.map(c=>c.id+'.onnx').sort();
 if(JSON.stringify(names)!==JSON.stringify(required))
   verdict.errors.push('Generated actual ONNX models are missing/extra');
 for(const c of manifest.required){
   if(!/^[a-z][a-z0-9-]{2,54}$/.test(c.id)){
     verdict.errors.push('Unsafe model file ID');continue;
   }
   const binary=await readFile(path.join(modelDir,c.id+'.onnx'));
   const record=evidence.cases?.find(row=>row.id===c.id);
   if(sha(binary)!==record?.modelSha256)
     verdict.errors.push('Actual ONNX ModelProto SHA mismatch '+c.id);
 }
 verdict.ok=verdict.ok&&verdict.errors.length===0;
 const summary={
   format:'invention-lab/phase11-summary/1',commitSha:process.env.GITHUB_SHA||null,
   verdict:verdict.ok?'pass':'fail',passed:verdict.passed,required:verdict.required,
   errors:verdict.errors,physicalValidation:'none',realWorldBuildSuccessPercent:null,
   scope:'Small per-axis QDQ and 4D QLinearConv; no full ONNX or hardware validation.',
 };
 await mkdir(p('benchmarks/evidence'),{recursive:true});
 await writeFile(p('benchmarks/evidence/phase11-summary.json'),JSON.stringify(summary,null,2)+'\n');
 process.stdout.write('Phase 11 strict independent ONNX CPU: '+summary.verdict+
   ' ('+summary.passed+'/'+summary.required+')\n');
 for(const error of verdict.errors)process.stderr.write('FAIL '+error+'\n');
 if(!verdict.ok)process.exitCode=1;
}catch(error){
 process.stderr.write('Phase 11 missing or broken required actual reference: '+error.message+'\n');
 process.exitCode=1;
}
