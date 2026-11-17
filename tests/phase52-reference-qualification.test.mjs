import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyReferencePlan,assessReferenceSystem} from '../js/evidence/phase52-reference-qualification.js';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const plan=load('../benchmarks/phase52/reference-system-qualification.json');
const source={hardware:load('../benchmarks/phase41/reference-hardware-candidate.json'),
 capture:load('../benchmarks/phase42/physical-capture-protocol.json'),
 whole:load('../benchmarks/phase48/whole-system-readiness.json'),
 fault:load('../benchmarks/phase51/fault-model-scope.json')};
test('Reference-system plan matches missing physical device, capture and fault state',()=>{
 assert.equal(verifyReferencePlan(plan,source),true);
 assert.equal(plan.requiredPhysicalGates.length,12);
 assert.ok(plan.requiredPhysicalGates.every(x=>!x.verified&&x.evidence===null));
});
test('Twelve physically missing gates always yield explicit NO-GO and not failure probability',()=>{
 const r=assessReferenceSystem(plan,source);
 assert.equal(r.softwareSourceComparisonComplete,true);
 assert.equal(r.missingPhysicalGates.length,12);
 assert.equal(r.qualifiedActualSpecimens,0);
 assert.equal(r.authorizationToSpinOrEnergizeImpeller,false);
 assert.equal(r.physicalPredictionInterval,null);
 assert.equal(r.realWorldBuildSuccessPercent,null);
 assert.ok(Object.isFrozen(r.missingPhysicalGates));
});
test('Fake 99 percent physical success and self-signed approval never authenticate',()=>{
 const x=assessReferenceSystem(plan,source,{fabricatedApproval:true,successRate:99,validCalibration:'claimed'});
 assert.equal(x.candidateMetadataIndependentlyAuthenticated,false);
 assert.equal(x.releaseDecision,'NO_GO_MISSING_REAL_ASSEMBLY_AND_SAFETY_EVIDENCE');
 assert.equal(x.predictedPhysicalSuccessRatePercent,null);
});
test('Every source and proposed physical-gate mutation is rejected',()=>{
 const edits=[
 p=>p.pendingApprovedComponentBOM=true,p=>p.actualInstrumentSessions=50,
 p=>p.requiredPhysicalGates[0].verified=true,p=>p.requiredPhysicalGates[0].evidence='self-attested',
 p=>p.requiredPhysicalGates.pop(),p=>p.requiredPhysicalGates[0].id='approved',
 p=>p.actualSourceMatchedPhysicalSpecimens=3,p=>p.independentlyCalibratedOperatingEnvelope=[0,1],
 p=>p.manufacturerSuccessPercent=99,p=>p.physicalBuildPermitted=true,
 p=>p.impellerOperationPermitted=true,p=>p.realWorldBuildSuccessPercent=100,
 p=>p.physicalValidation='complete'
 ];
 for(const edit of edits){const x=structuredClone(plan);edit(x);assert.throws(()=>verifyReferencePlan(x,source));}
 for(const [key,fn] of [
 ['hardware',x=>x.actualPhysicalFanMeasurements=50],
 ['capture',x=>x.independentInstrumentCalibrationAccepted=true],
 ['whole',x=>x.actualPhysicalWholeSystemValidationComplete=true],
 ['fault',x=>x.physicalAssemblyFaultTestApproved=true]
 ]){const x=structuredClone(source);fn(x[key]);assert.throws(()=>verifyReferencePlan(plan,x));}
});
