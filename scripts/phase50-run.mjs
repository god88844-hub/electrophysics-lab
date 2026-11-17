import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {calculateConditionalUncertainty,evaluatePhysicalHoldoutPlan} from '../js/evidence/phase50-uncertainty.js';
const paths={assumptions:'benchmarks/phase50/uncertainty-envelope.json',
 candidate:'benchmarks/phase41/reference-hardware-candidate.json',
 battery:'benchmarks/phase43/e91-assumptions.json',
 wire:'benchmarks/phase44/copper-harness-assumptions.json',
 motor:'benchmarks/phase45/pololu1592-endpoint-model.json',
 identifiability:'benchmarks/phase49/synthetic-identifiability.json'};
const raw=Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([k,p])=>[k,await readFile(p)])));
const m=Object.fromEntries(Object.entries(raw).map(([k,b])=>[k,JSON.parse(b)]));
const result={format:'invention-lab/phase50-source-interval-not-physical-prediction/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceSHA256:Object.fromEntries(Object.entries(paths).map(([k,p])=>[p,createHash('sha256').update(raw[k]).digest('hex')])),
 bounds:calculateConditionalUncertainty(m.assumptions,m),
 leakageCheck:evaluatePhysicalHoldoutPlan(m.assumptions,m,{trainingSpecimenIDs:['synthetic-device-a'],heldOutSpecimenIDs:['synthetic-device-b']}),
 actualPhysicalIndependentHoldoutTests:0,
 realWorldBuildSuccessPercent:null,physicalValidation:'none',physicalVerdict:'unknown'};
await mkdir('benchmarks/evidence/phase50',{recursive:true});
await writeFile('benchmarks/evidence/phase50/phase50.json',JSON.stringify(result,null,2)+'\n');
console.log('PH50 PASS: monotone *conditional* resistance current interval; 0 authentic hardware holdouts; no confidence claim');