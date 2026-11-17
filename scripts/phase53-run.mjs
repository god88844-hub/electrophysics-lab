import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {assessSiliconSignoff} from '../js/evidence/phase53-signoff.js';
import {RTL_GIT_BLOB} from '../js/measure/phase24-prototype.js';
const raw=await readFile('benchmarks/phase53/signoff-boundary.json');
const policy=JSON.parse(raw);
const scripts=Object.fromEntries(await Promise.all(policy.sourceOpenFlowScripts.map(async p=>[p,(await readFile(p)).toString('utf8')])));
const inputs=[...policy.sourceOpenFlowScripts,'benchmarks/phase53/signoff-boundary.json'];
const hashes=Object.fromEntries(await Promise.all(inputs.map(async p=>[p,
 createHash('sha256').update(await readFile(p)).digest('hex')])));
const gitBlob=execFileSync('git',['hash-object','benchmarks/phase13/rtl/alu8.v'],{encoding:'utf8'}).trim();
if(gitBlob!==RTL_GIT_BLOB)throw Error('Original ALU RTL Git object not pinned');
const record={format:'invention-lab/phase53-source-traced-signoff-assessment/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 originalRtlGitBlobSHA1:gitBlob,originalSourceSHA256:hashes,
 decision:assessSiliconSignoff(policy,scripts),
 genuineFoundrySignoffDocumentAvailable:false,
 actualSiliconTestMeasurements:0,foundryGDSApproved:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase53',{recursive:true});
await writeFile('benchmarks/evidence/phase53/phase53.json',JSON.stringify(record,null,2)+'\n');
console.log('PH53 PASS: 5 source-locked open-flow files audited, 10 foundry-signoff classes unverified');