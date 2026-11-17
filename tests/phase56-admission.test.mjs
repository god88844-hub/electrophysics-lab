import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyPolicy,blankAdmission,assessAdmission} from '../js/evidence/phase56-admission.js';
import {blankCapture} from '../js/measure/phase27-blind.js';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const policy=load('../benchmarks/phase56/admission-policy.json');
const phase55=load('../benchmarks/phase55/provenance-policy.json');
const phase54=load('../benchmarks/phase54/prototype-acquisition-policy.json');
const signoff=load('../benchmarks/phase53/signoff-boundary.json');
const args=[policy,phase55,phase54,signoff];
test('Blank request stays quarantined without any physical rows or dies',()=>{
 assert.equal(verifyPolicy(...args).dies.length,8);
 const x=blankAdmission(...args);assert.equal(x.phase27Capture,null);
 const a=assessAdmission(...args);
 assert.equal(a.missingIndependentReviewGates.length,8);
 assert.equal(a.verifiedPhysicalMeasurementsAdmitted,0);
 assert.equal(a.physicalVerdict,'unknown');
});
test('Untrusted external review cannot authorize physical results',()=>{
 const a=assessAdmission(...args,{review:{approved:true,realWorldBuildSuccessPercent:99,
   signature:'self-signed'}});assert.equal(a.qualifiedDieCount,0);
 assert.equal(a.empiricalYield,null);assert.equal(a.untrustedReviewerFields.length,3);
});
test('Cross-package identity and original export disagreement blocks admission',()=>{
 const c=blankCapture();
 c.devices[0].dieId='spoofed-die';
 const a=assessAdmission(...args,{provenance:structuredClone(verifyPolicy(...args)),
   capture:c});
 assert.ok(a.crossArtifactInconsistencies.length>0);
 assert.equal(a.evidenceStatus,'QUARANTINED_NOT_ADMITTED');
});
test('Candidate with invented observations never becomes qualified silicon',()=>{
 const c=blankCapture();c.sessions[0].observations=[{index:0,measuredY:1}];
 const a=assessAdmission(...args,{capture:c});
 assert.equal(a.verifiedPhysicalMeasurementsAdmitted,0);
 assert.ok(a.crossArtifactInconsistencies.length>0);
});
test('Policy cannot be weakened by fabricated sample counters or acceptance',()=>{
 for(const e of [x=>x.originalPhysicalMeasurementsReceived=49152,
 x=>x.requiredIndependentReviewGates=[],
 x=>x.realWorldBuildSuccessPercent=99]){
  const p=structuredClone(policy);e(p);assert.throws(()=>verifyPolicy(p,phase55,phase54,signoff));
 }
});