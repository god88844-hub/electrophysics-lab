import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyAcquisitionPolicy,makeLabHandoff,inspectUntrustedLabReturn} from '../js/evidence/phase54-alu-handoff.js';
import {blankCapture} from '../js/measure/phase27-blind.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const policy=read('../benchmarks/phase54/prototype-acquisition-policy.json');
const signoff=read('../benchmarks/phase53/signoff-boundary.json');
test('Original 1024 source stimuli and 48 sessions form a lab plan with no observations',()=>{
 assert.equal(verifyAcquisitionPolicy(policy,signoff),true);
 const p=makeLabHandoff(policy,signoff);
 assert.equal(p.vectorInputs.length,1024);
 assert.equal(p.plannedSessions.length,48);
 assert.equal(p.plannedDies.length,8);
 assert.equal(p.actualOriginalInstrumentReadings,0);
 assert.equal(p.predictedDigitalOutputsIncluded,false);
 assert.ok(p.vectorInputs.every(v=>Object.keys(v).sort().join(',')==='a,b,index,op'));
 assert.ok(p.plannedSessions.every(s=>s.rawInstrumentExportSHA256===null));
 assert.ok(Object.isFrozen(p.vectorInputs));
});
test('Unmeasured blank capture stays unqualified even with a correct source digest',()=>{
 const r=inspectUntrustedLabReturn(policy,signoff,blankCapture());
 assert.equal(r.proposedSessions,48);
 assert.equal(r.selfReportedVectorRows,0);
 assert.equal(r.authenticatedHardwareSamplesAdmitted,0);
 assert.equal(r.physicalProofReady,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Fabricated foundry metadata and fake success field cannot become physical proof',()=>{
 const fake=blankCapture();
 fake.origin='claimed-real-measurement';
 fake.modelFreezeCommit='a'.repeat(40);
 fake.realWorldBuildSuccessPercent=99;
 const x=inspectUntrustedLabReturn(policy,signoff,fake);
 assert.equal(x.physicalProofReady,false);
 assert.equal(x.physicalMeasurementValuesAdmitted,0);
 assert.equal(x.originalDieAndMaskSourceIndependentlyAuthenticated,false);
});
test('Lab plan must not leak expected outputs or falsely authorize fabricated dies',()=>{
 const edits=[
  x=>x.labHandoffMustExcludeExpectedDigitalOutputs=false,
  x=>x.modelFreezeCommitBeforeAcquisition='0'.repeat(40),
  x=>x.foundryMaskRevisionVerification='forged',
  x=>x.independentFabricationRecord='forged',
  x=>x.originalRawInstrumentExports=48,
  x=>x.originalInstrumentSHA256=['f'.repeat(64)],
  x=>x.authenticatedDieSpecimens=8,
  x=>x.acceptedPhysicalTimingReadings=49152,
  x=>x.physicalAccreditedLabMeasurementReview=true,
  x=>x.productionTapeoutAuthorized=true,
  x=>x.physicalValidation='pass',
  x=>x.realWorldBuildSuccessPercent=99,
  x=>x.plannedStudySessions=1
 ];
 for(const edit of edits){const copy=structuredClone(policy);edit(copy);
  assert.throws(()=>verifyAcquisitionPolicy(copy,signoff));}
 const s=structuredClone(signoff);s.originalSignedGDSArtifact={fake:true};
 assert.throws(()=>verifyAcquisitionPolicy(policy,s));
});
test('Untrusted input cannot change immutable planned sample count or acceptance state',()=>{
 const candidate=blankCapture();
 candidate.sessions[0].observations=[{index:0}];
 const r=inspectUntrustedLabReturn(policy,signoff,candidate);
 assert.equal(r.physicalProofReady,false);
 assert.equal(r.physicalValidation,'none');
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
