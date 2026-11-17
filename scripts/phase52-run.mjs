import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {assessReferenceSystem} from '../js/evidence/phase52-reference-qualification.js';
const p=['benchmarks/phase52/reference-system-qualification.json','benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase42/physical-capture-protocol.json','benchmarks/phase48/whole-system-readiness.json',
 'benchmarks/phase51/fault-model-scope.json'];
const buffers=await Promise.all(p.map(x=>readFile(x)));
const [policy,hardware,capture,whole,fault]=buffers.map(x=>JSON.parse(x));
const report={format:'invention-lab/phase52-source-locked-hardware-readiness/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 originalSHA256:Object.fromEntries(p.map((x,i)=>[x,createHash('sha256').update(buffers[i]).digest('hex')])),
 decision:assessReferenceSystem(policy,{hardware,capture,whole,fault}),physicalReviewAuthenticated:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase52',{recursive:true});
await writeFile('benchmarks/evidence/phase52/phase52.json',JSON.stringify(report,null,2)+'\n');
console.log('PH52 PASS: source-locked 12 hardware qualification gates missing, no physical build authorization');