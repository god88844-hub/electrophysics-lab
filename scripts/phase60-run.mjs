import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyPolicy,blankCampaign,fitUntrustedCampaign} from '../js/evidence/phase60-calibration.js';
const path='benchmarks/phase60/accelerator-calibration-policy.json',raw=await readFile(path),p=JSON.parse(raw);
verifyPolicy(p);
const r={format:'invention-lab/phase60-prospective-physical-accelerator-validation/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourcePolicySha256:createHash('sha256').update(raw).digest('hex'),
 prospectiveBench:blankCampaign(p),unmeasuredVerdict:fitUntrustedCampaign(p),
 actualAuthenticatedHardwareMeasurements:0,physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase60',{recursive:true});
await writeFile('benchmarks/evidence/phase60/phase60.json',JSON.stringify(r,null,2)+'\n');
console.log('PH60 PASS: prospectively planned independent accelerator holdout; no measured physical hardware');