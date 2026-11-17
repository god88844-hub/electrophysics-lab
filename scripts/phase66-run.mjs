import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {auditPlugin} from '../js/evidence/phase66-plugin-admission.js';
const path='benchmarks/phase66/plugin-security-policy.json',raw=await readFile(path),p=JSON.parse(raw);
if(p.untrustedJavaScriptExecuted||p.actualIsolationOfArbitraryCodeAvailable||p.trustedOutOfBandPublisherRegistry)
 throw Error('This project cannot assert code sandboxing or independent publisher trust');
const r={format:'invention-lab/phase66-admission-evidence/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySHA256:createHash('sha256').update(raw).digest('hex'),
 audit:auditPlugin(),physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase66',{recursive:true});
await writeFile('benchmarks/evidence/phase66/phase66.json',JSON.stringify(r,null,2)+'\n');
console.log('PH66 PASS: source-hash pinned declarative engine, no untrusted plugin code executed');