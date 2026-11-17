import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {INPUTS,prepareExternalQualificationPacket,verifyExternalQualificationPacket} from '../js/release/external-qualification-kit.js';
const gitSha='a'.repeat(40);
const inputs=Object.fromEntries(INPUTS.map(p=>[p,readFileSync(new URL('../'+p,import.meta.url))]));
test('Prepare source-matched review and lab request with twelve fan gates and prospective 48-session ALU plan',()=>{
 const p=prepareExternalQualificationPacket(gitSha,inputs);
 assert.equal(verifyExternalQualificationPacket(p),true);
 assert.equal(p.targetFan.mandatoryPhysicalGates.length,12);
 assert.equal(p.targetALU.plannedInstrumentReads,49152);
 assert.deepEqual(p.targetALU.independentAttestorRoles,['fabrication','metrology']);
 assert.equal(p.originalEvidenceIntake.receivedExternalEvidenceFiles,0);
 assert.equal(p.realWorldBuildSuccessPercent,null);
});
test('Tampered provenance, fake external review and self-attested physical success must fail closed',()=>{
 for(const [file,change] of [
 ['benchmarks/phase42/physical-capture-protocol.json',x=>{x.actualSourceMatchedFanMeasurements=1}],
 ['benchmarks/phase52/reference-system-qualification.json',x=>{x.requiredPhysicalGates[0].verified=true}],
 ['benchmarks/phase54/prototype-acquisition-policy.json',x=>{x.authenticatedDieSpecimens=1}],
 ['benchmarks/phase55/provenance-policy.json',x=>{x.externallyAuthenticatedDies=1}],
 ['benchmarks/phase57/release-policy.json',x=>{x.actualFanMeasurementCount=1}]
 ]){
  const copy={...inputs};
  const x=JSON.parse(copy[file].toString('utf8'));change(x);
  copy[file]=Buffer.from(JSON.stringify(x));
  assert.throws(()=>prepareExternalQualificationPacket(gitSha,copy),file);
 }
 const report=prepareExternalQualificationPacket(gitSha,inputs);
 for(const mutate of [
  x=>{x.externalReviewRequests[0].status='APPROVED'},
  x=>{x.realWorldBuildSuccessPercent=99.9},
  x=>{x.targetFan.safeToBuild=true},
  x=>{x.targetALU.physicalTapeoutAuthorized=true}
 ]){
  const fake=structuredClone(report);mutate(fake);
  assert.throws(()=>verifyExternalQualificationPacket(fake));
 }
});
test('Missing, extra and nonbyte source inputs are rejected',()=>{
 assert.throws(()=>prepareExternalQualificationPacket('bad',inputs));
 assert.throws(()=>prepareExternalQualificationPacket(gitSha,{...inputs,unexpected:Buffer.from('oops')}));
 const missing={...inputs};delete missing[INPUTS[0]];
 assert.throws(()=>prepareExternalQualificationPacket(gitSha,missing));
});
