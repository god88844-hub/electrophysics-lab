import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POLICY,REQUIREMENTS,verifyPolicy,assessDecisions,verifyDecision,
 REPORT_FORMAT} from '../js/measure/phase28-decisions.js';
const policy=JSON.parse(readFileSync(new URL('../benchmarks/phase28/acceptance.json',import.meta.url),'utf8'));
function sources(){
 return {
  p24:{actualPhysicalObservations:0,reportedStatus:'awaiting-real-hardware',
   physicalVerdict:'unknown',realWorldBuildSuccessPercent:null},
  p26:{accepted:true,originalResistorDevices:2,observedTotalResistorSweepReadings:102,
   actualALUHardwareSpecimens:0,actualALUHardwareMeasurements:0,
   targetFailureModesUnverified:12,physicalVerdict:'unknown',
   realWorldBuildSuccessPercent:null},
  p27:{originalHardwareReadings:0,actualFabricatedALUCount:0,
   futureDeviceSlots:8,futureSessions:48,futureMeasurements:49152,
   studyGroupHoldout:'whole-physical-lot',independentPreregistrationAttested:false,
   measurementOriginAudit:'not-performed',physicalVerdict:'unknown',
   realWorldBuildSuccessPercent:null}
 };
}
const evaluate=(s=sources(),candidate=null)=>assessDecisions(s.p24,s.p26,s.p27,candidate,policy);
const meta={currentCommit:'a'.repeat(40),recordCommit:'a'.repeat(40),
 policySha256:'b'.repeat(64),recordPolicySha256:'b'.repeat(64)};
test('Source-locked release policy retains all six physical qualification gates',()=>{
 assert.equal(verifyPolicy(policy),true);
 assert.deepEqual(policy,POLICY);
 assert.equal(REQUIREMENTS.length,6);
 assert.equal(new Set(REQUIREMENTS).size,6);
 assert.equal(policy.allowableSelfAttestedLabPass,false);
 assert.equal(policy.allowableNumericalSuccessFromComputerOnly,false);
 assert.equal(policy.nextAction,'BLOCKED_PENDING_PHYSICAL_EVIDENCE');
});
test('Current actual ALU is unbuilt: unqualified source-data graph blocks release',()=>{
 const x=evaluate();
 assert.equal(x.format,REPORT_FORMAT);
 assert.equal(x.provenanceAndCrossPhaseIssues.length,0);
 assert.equal(x.criteriaGates.length,6);
 assert.ok(x.criteriaGates.every(g=>g.verified===false));
 assert.equal(x.realPrototypeQualificationDecision,'BLOCKED_NEEDS_REAL_HARDWARE');
 assert.equal(x.productionReleaseDecision,'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE');
 assert.equal(x.plannedBlindStudy.actualSiliconReadings,0);
 assert.equal(x.plannedBlindStudy.actualSiliconDieCount,0);
 assert.equal(x.realWorldBuildSuccessPercent,null);
 assert.equal(x.fabricationSuccessProbability,null);
 assert.equal(x.manufacturingSuccessConfidenceInterval,null);
 assert.equal(x.reliabilityFIT,null);
 assert.equal(x.physicalVerdict,'unknown');
 assert.equal(x.externalOriginVerified,false);
});
test('Real public resistor data do not magically become ALU timing or manufacturing success',()=>{
 const x=evaluate();
 assert.equal(x.realPublicPhysicalEvidence,'two-other-resistor-specimens-only');
 assert.equal(x.independentPhysicalHoldoutAccuracy,null);
 assert.equal(x.realSiliconUncertaintyInterval,null);
 assert.equal(x.manufacturingYieldEstimate,null);
 assert.equal(x.previousComputationalEvidence,'modeled-and-regressed-not-silicon-qualified');
});
test('Even a PERFECT fake 100-percent success and many apparent dies cannot unlock signoff',()=>{
 const candidate={
  claimedPhysicalValidation:'fully-verified',
  realWorldBuildSuccessPercent:100,
  reportedPassRate:1,
  reportedConfidenceInterval:[0.999,1],
  apparentDieCount:100000,apparentPassed:100000,
  claimedSourceRtlBlob:policy.rtlGitBlob,
  instrumentFilesSha256:['c'.repeat(64)],
  externalFoundryRecordSha:'f'.repeat(64),
  modelTunedOnBlindHoldout:false,
  electronicCertificate:'self-signed-perfect-proof'
 };
 const x=evaluate(sources(),candidate);
 assert.equal(x.provenanceAndCrossPhaseIssues.length,0);
 assert.ok(x.additionalCandidateWarnings.some(z=>z.includes('ignored')));
 assert.equal(x.fabricationSuccessProbability,null);
 assert.equal(x.manufacturingYieldEstimate,null);
 assert.equal(x.physicalValidation,'none');
 assert.equal(x.externalOriginVerified,false);
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Late tuning to blind lot is a blocker, regardless of apparent perfect outputs',()=>{
 const x=evaluate(sources(),{modelTunedOnBlindHoldout:true,reportedPassRate:1});
 assert.ok(x.provenanceAndCrossPhaseIssues.some(z=>z.includes('Blind holdout')));
 assert.equal(x.productionReleaseDecision,'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE');
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Wrong alleged die design or altered raw-source fingerprint cannot bypass decision',()=>{
 const x=evaluate(sources(),{
  claimedSourceRtlBlob:'f'.repeat(40),
  instrumentFilesSha256:['injected-invalid-hash'],
  externalFoundryRecordSha:'broken'
 });
 assert.ok(x.provenanceAndCrossPhaseIssues.some(z=>z.includes('design')));
 assert.ok(x.provenanceAndCrossPhaseIssues.some(z=>z.includes('instrument')));
 assert.ok(x.provenanceAndCrossPhaseIssues.some(z=>z.includes('mask')));
 assert.equal(x.externalOriginVerified,false);
});
test('Forged previous phase hardware counts are caught, not promoted to physical validity',()=>{
 const mutations=[
  x=>x.p24.actualPhysicalObservations=1024,
  x=>x.p24.reportedStatus='fully-qualified',
  x=>x.p26.originalResistorDevices=0,
  x=>x.p26.actualALUHardwareSpecimens=8,
  x=>x.p26.targetFailureModesUnverified=0,
  x=>x.p27.originalHardwareReadings=49152,
  x=>x.p27.actualFabricatedALUCount=8,
  x=>x.p27.independentPreregistrationAttested=true,
  x=>x.p27.measurementOriginAudit='verified',
  x=>x.p27.futureMeasurements=0
 ];
 for(const mutate of mutations){
  const s=sources();mutate(s);
  const x=evaluate(s);
  assert.ok(x.provenanceAndCrossPhaseIssues.length>0,'altered original physical evidence must be flagged');
  assert.equal(x.realWorldBuildSuccessPercent,null);
  assert.ok(x.criteriaGates.every(g=>g.verified===false));
 }
});
test('Policy relaxation or renamed evidence requirements are rejected',()=>{
 const mutations=[
  x=>x.nextAction='PRODUCTION_READY',
  x=>x.allowableSelfAttestedLabPass=true,
  x=>x.allowableNumericalSuccessFromComputerOnly=true,
  x=>x.independentlyVerifiedALUDies=100,
  x=>x.qualifiedFoundrySignoffAvailable=true,
  x=>x.requiredArtifactClasses.pop(),
  x=>x.requiredArtifactClasses[0]='simulation-only',
  x=>x.realWorldBuildSuccessPercent=100,
  x=>x.vectorSha256='0'.repeat(64)
 ];
 for(const change of mutations){
  const p=structuredClone(policy);change(p);
  assert.throws(()=>verifyPolicy(p),/modified or weakened/);
 }
});
test('Independent replay disallows a fabricated success percentage, CI and approval',()=>{
 const original=evaluate();
 assert.equal(verifyDecision(original,structuredClone(original),meta).ok,true);
 const mutations=[
  x=>x.realWorldBuildSuccessPercent=100,
  x=>x.fabricationSuccessProbability=1,
  x=>x.manufacturingYieldEstimate=0.99,
  x=>x.manufacturingSuccessConfidenceInterval=[0.98,1],
  x=>x.independentPhysicalHoldoutAccuracy=100,
  x=>x.realSiliconUncertaintyInterval=[0,0],
  x=>x.reliabilityFIT=0,
  x=>x.productionReleaseDecision='GO',
  x=>x.realPrototypeQualificationDecision='PASS',
  x=>x.externalOriginVerified=true,
  x=>x.criteriaGates[0].verified=true,
  x=>x.physicalVerdict='pass',
  x=>x.physicalValidation='silicon-validated',
  x=>x.cannotDetermineManufacturingSuccess=false
 ];
 for(const mutate of mutations){
  const x=structuredClone(original);mutate(x);
  assert.equal(verifyDecision(x,original,meta).ok,false);
 }
});
test('Independent replay rejects mismatched evidence commits and changed policy digest',()=>{
 const x=evaluate();
 for(const edit of [
  m=>m.currentCommit='old',
  m=>m.recordCommit='0'.repeat(40),
  m=>m.policySha256='z'.repeat(64),
  m=>m.recordPolicySha256='c'.repeat(64)
 ]){
  const m={...meta};edit(m);
  assert.equal(verifyDecision(x,x,m).ok,false);
 }
});
test('Missing previous-source artifact is a clearly blocked release, not a measured failure',()=>{
 const s=sources();s.p26=undefined;
 const x=evaluate(s);
 assert.ok(x.provenanceAndCrossPhaseIssues.length>0);
 assert.equal(x.readiness,'blocked');
 assert.equal(x.decision,'BLOCKED_PENDING_PHYSICAL_EVIDENCE');
 assert.equal(x.physicalVerdict,'unknown');
});
