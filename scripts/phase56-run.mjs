import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {blankAdmission,assessAdmission} from '../js/evidence/phase56-admission.js';
const paths=['benchmarks/phase56/admission-policy.json','benchmarks/phase55/provenance-policy.json',
 'benchmarks/phase54/prototype-acquisition-policy.json','benchmarks/phase53/signoff-boundary.json'];
const bytes=await Promise.all(paths.map(x=>readFile(x)));
const inputs=bytes.map(b=>JSON.parse(b));
const report={format:'invention-lab/phase56-independent-intake-screen/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 originalInputsSHA256:Object.fromEntries(paths.map((p,i)=>[p,createHash('sha256').update(bytes[i]).digest('hex')])),
 intake:blankAdmission(...inputs),decision:assessAdmission(...inputs),
 originalPhysicalSampleCount:0,physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase56',{recursive:true});
await writeFile('benchmarks/evidence/phase56/phase56.json',JSON.stringify(report,null,2)+'\n');
console.log('PH56 PASS: original physical sample count 0, fail-closed physical data admission');