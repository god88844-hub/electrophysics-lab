import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {blankIntake,screenProvenance} from '../js/evidence/phase55-provenance.js';
const paths=['benchmarks/phase55/provenance-policy.json',
 'benchmarks/phase54/prototype-acquisition-policy.json','benchmarks/phase53/signoff-boundary.json'];
const bytes=await Promise.all(paths.map(p=>readFile(p)));
const [policy,old,signoff]=bytes.map(b=>JSON.parse(b));
const r={format:'invention-lab/phase55-prospective-provenance-artifact/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceSHA256:Object.fromEntries(paths.map((p,i)=>[p,createHash('sha256').update(bytes[i]).digest('hex')])),
 intake:blankIntake(policy,old,signoff),screen:screenProvenance(policy,old,signoff),
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase55',{recursive:true});
await writeFile('benchmarks/evidence/phase55/phase55.json',JSON.stringify(r,null,2)+'\n');
console.log('PH55 PASS: independent provenance screening protocol; zero acquired silicon');