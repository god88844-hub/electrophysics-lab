import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {sourceSecurityScreen,normalizeRequestPath} from '../js/release/phase70-security.js';
const raw=await readFile('benchmarks/phase70/security-policy.json'),policy=JSON.parse(raw);
if(policy.independentPentestPerformed!==false||policy.physicalValidation!=='none')throw Error('Unverified security/physical qualification');
const source=await readFile('serve.mjs','utf8'),check=sourceSecurityScreen(source);
if(!check.sourceOnlyPolicyComplete)throw Error('Research server security checks incomplete');
const denied=['/.git/config','/scripts/phase69-run.mjs','/package.json','/serve.mjs'];
const screened=denied.map(s=>{try{normalizeRequestPath(s);return {path:s,denied:false}}catch{return {path:s,denied:true}}});
if(screened.some(v=>!v.denied))throw Error('Sensitive source route accessible');
const report={format:'invention-lab/phase70-security-audit/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySHA256:createHash('sha256').update(raw).digest('hex'),
 serverSHA256:createHash('sha256').update(source).digest('hex'),
 serverSourceScreen:check,screened,realPenetrationTesting:'NOT_PERFORMED',
 independentScientificReview:'NOT_PERFORMED',
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase70',{recursive:true});
await writeFile('benchmarks/evidence/phase70/phase70.json',JSON.stringify(report,null,2)+'\n');
console.log('PH70 PASS: limited static server security checks; independent penetration/scientific audit NOT PERFORMED');