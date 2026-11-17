import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessCrossRunnerResult} from '../js/evidence/phase72-cross-runner.js';
const VALID={archiveSHA256:'a'.repeat(64),verifiedFiles:150,
 appEntrypointsPresent:true,extractedNodeESMImportVerified:true,
 isolatedLoopbackHttpSmoke:true,httpCasesVerified:10,
 productionQualified:false,physicalValidation:'none'};
test('Accepts source-only package verification without physical or product claims',()=>{
 const r=assessCrossRunnerResult(VALID);
 assert.equal(r.extractedSourceSmokePassed,true);
 assert.equal(r.independentCleanMachineAcceptance,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Rejects missing integrity, runtime, HTTP and evidence boundaries',()=>{
 for(const [key,value] of [['archiveSHA256','bad'],['verifiedFiles',0],
  ['appEntrypointsPresent',false],['extractedNodeESMImportVerified',false],
  ['isolatedLoopbackHttpSmoke',false],['httpCasesVerified',9],
  ['productionQualified',true],['physicalValidation','approved']])
  assert.throws(()=>assessCrossRunnerResult({...VALID,[key]:value}),key);
});
