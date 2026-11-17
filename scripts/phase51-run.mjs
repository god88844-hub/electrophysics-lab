import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyFaultModel,injectHypotheticalFault,buildConditionalFaultTree}
 from '../js/evidence/phase51-fault-analysis.js';
const paths={fault:'benchmarks/phase51/fault-model-scope.json',
 candidate:'benchmarks/phase41/reference-hardware-candidate.json',
 battery:'benchmarks/phase43/e91-assumptions.json',
 wire:'benchmarks/phase44/copper-harness-assumptions.json',
 motor:'benchmarks/phase45/pololu1592-endpoint-model.json',
 uncertainty:'benchmarks/phase50/uncertainty-envelope.json',
 identifiability:'benchmarks/phase49/synthetic-identifiability.json'};
const blobs=Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([k,p])=>[k,await readFile(p)])));
const input=Object.fromEntries(Object.entries(blobs).map(([k,v])=>[k,JSON.parse(v)]));
verifyFaultModel(input.fault,input);
const cases=input.fault.modeledFaultCases.map(item=>injectHypotheticalFault(input.fault,input,item.case));
const report={format:'invention-lab/phase51-symbolic-fault-mode-source-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceSHA256:Object.fromEntries(Object.entries(paths).map(([k,p])=>[p,createHash('sha256').update(blobs[k]).digest('hex')])),
 cases,faultTree:buildConditionalFaultTree(input.fault,input),
 physicalFaultExperiments:0,
 independentRealFailureRates:null,
 calibratedDetectionCoverage:null,
 correlatedManufacturingProbability:null,
 physicalTestingAuthorized:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
await mkdir('benchmarks/evidence/phase51',{recursive:true});
await writeFile('benchmarks/evidence/phase51/phase51.json',JSON.stringify(report,null,2)+'\n');
console.log('PH51 PASS: eight mathematical/logic fault cases, correlated conditions identified, no real source-matched reliability claimed');