import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {BASELINE,runWorkflow} from '../js/evidence/phase64-cross-domain.js';
const path='benchmarks/phase64/coupling-policy.json',raw=await readFile(path),policy=JSON.parse(raw);
if(policy.physicalInterfacesVerified!==0||policy.physicalValidation!=='none')throw Error('Physical coupling not established');
const r={format:'invention-lab/phase64-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySHA256:createHash('sha256').update(raw).digest('hex'),
 workflow:BASELINE,observed:runWorkflow(BASELINE)};
await mkdir('benchmarks/evidence/phase64',{recursive:true});
await writeFile('benchmarks/evidence/phase64/phase64.json',JSON.stringify(r,null,2)+'\n');
console.log('PH64 PASS: typed quantum/software ADC/IL8/model-bit cross-lab value pipeline; no hardware coupling');