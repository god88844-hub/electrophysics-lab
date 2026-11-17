import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {runAcceptance} from '../js/evidence/phase71-acceptance.js';
const path='benchmarks/phase71/acceptance-policy.json',raw=await readFile(path),policy=JSON.parse(raw);
const acceptance=runAcceptance(policy);
if(acceptance.examplesPassing!==6||acceptance.representativeHumanUserAcceptance!=='NOT_CONDUCTED')throw Error('Acceptance report unsupported');
const result={format:'invention-lab/phase71-acceptance-evidence/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySHA256:createHash('sha256').update(raw).digest('hex'),acceptance,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase71',{recursive:true});
await writeFile('benchmarks/evidence/phase71/phase71.json',JSON.stringify(result,null,2)+'\n');
console.log('PH71 PASS: six actual end-to-end source simulations and fixed API identifiers; human UAT pending');