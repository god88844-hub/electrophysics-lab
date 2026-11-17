import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyPolicy,blankCampaign,screenCandidate} from '../js/evidence/phase62-quantum-hardware.js';
const path='benchmarks/phase62/quantum-study-policy.json',raw=await readFile(path),p=JSON.parse(raw);
verifyPolicy(p);
const r={format:'invention-lab/phase62-quantum-unmeasured-intake/1',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySha256:createHash('sha256').update(raw).digest('hex'),campaign:blankCampaign(p),screen:screenCandidate(p),
 externallyAuthenticatedQuantumReadouts:0,physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase62',{recursive:true});
await writeFile('benchmarks/evidence/phase62/phase62.json',JSON.stringify(r,null,2)+'\n');
console.log('PH62 PASS: 16 planned quantum sessions, no authenticated physical readouts');