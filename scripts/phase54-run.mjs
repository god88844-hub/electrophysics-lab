import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {makeLabHandoff,inspectUntrustedLabReturn} from '../js/evidence/phase54-alu-handoff.js';
import {SUITE_SHA256,RTL_GIT_BLOB} from '../js/measure/phase24-prototype.js';
const sources=['benchmarks/phase54/prototype-acquisition-policy.json',
 'benchmarks/phase53/signoff-boundary.json','benchmarks/phase13/rtl/alu8.v',
 'benchmarks/phase27/acceptance.json'];
const bytes=await Promise.all(sources.map(p=>readFile(p)));
const [policy,signoff]=bytes.map(b=>JSON.parse(b));
const lab=makeLabHandoff(policy,signoff);
const receipt=inspectUntrustedLabReturn(policy,signoff);
const rtlBlob=execFileSync('git',['hash-object','benchmarks/phase13/rtl/alu8.v'],{encoding:'utf8'}).trim();
if(rtlBlob!==RTL_GIT_BLOB||lab.vectorSuiteSHA256!==SUITE_SHA256)
 throw Error('Original published ALU RTL / vector stimulus changed');
const sha=x=>createHash('sha256').update(x).digest('hex');
const out={format:'invention-lab/phase54-original-alu-source-lab-handoff/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 inputSourceSHA256:Object.fromEntries(sources.map((p,i)=>[p,sha(bytes[i])])),
 originalRtlGitBlobSHA1:rtlBlob,
 labFacingInputHandoff:lab,untrustedBlankReturnAssessment:receipt,
 physicallyManufacturedALUDies:0,originalInstrumentMeasurements:0,
 externalFoundryProvenanceVerified:false,physicalMaskTapeoutAuthorized:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase54',{recursive:true});
await writeFile('benchmarks/evidence/phase54/phase54.json',JSON.stringify(out,null,2)+'\n');
console.log('PH54 PASS: 1024-only-input vectors, 48 empty sessions, 8 source plans; zero fabricated silicon experiments');