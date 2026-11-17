import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyReferenceCandidate,assessReferenceCandidate,inspectFutureAssemblyMetadata} from '../js/evidence/phase41-hardware-readiness.js';
const original=JSON.parse(readFileSync(new URL('../benchmarks/phase41/reference-hardware-candidate.json',import.meta.url)));
const snap=()=>structuredClone(original);
test('Source parts and unbuilt hardware identify actual published 3V motor and E91 cells',()=>{
 assert.equal(verifyReferenceCandidate(original),true);
 assert.equal(original.motor.partNumber,'1592');
 assert.equal(original.motor.listingStatus,'discontinued');
 assert.equal(original.battery.nominalPackVoltageV,3);
 assert.equal(original.fan.partNumber,null);
});
test('Conservative source ohmic model shows potential huge pack sag but cannot predict actual stall current',()=>{
 const x=assessReferenceCandidate(original);
 assert.deepEqual(x.assumedFreshCellsConstantInternalResistanceOhm,{min:0.3,max:0.6});
 assert.deepEqual(x.mathematicalSensitivityOnly.uncorrectedOhmicVoltageDropV,{lowV:1.2,highV:2.4});
 assert.ok(Math.abs(x.mathematicalSensitivityOnly.naivePackTerminalVoltageV.lowerV-0.6)<1e-12);
 assert.ok(Math.abs(x.mathematicalSensitivityOnly.naivePackTerminalVoltageV.upperV-1.8)<1e-12);
 assert.equal(x.mathematicalSensitivityOnly.actualAtStallPredictionPermitted,false);
 assert.equal(x.originalHardwareBOMFrozen,false);
 assert.equal(x.safeToBuildOrSpin,false);
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Discontinued high speed motor and unspecified impeller are explicit blockers',()=>{
 const x=assessReferenceCandidate(original);
 assert.equal(x.readiness,'BLOCKED_HARDWARE_AND_MEASUREMENT_EVIDENCE');
 assert.ok(x.blockers.some(t=>t.includes('discontinued')));
 assert.ok(x.blockers.some(t=>t.includes('Fan manufacturer')));
 assert.equal(x.physicallyMeasuredFanAssemblySampleCount,0);
 assert.equal(x.physicalVerdict,'unknown');
});
test('Reject upgrades from plan to fictitious physical hardware without observations',()=>{
 const edits=[
  x=>x.status='QUALIFIED_REAL_ASSEMBLY',
  x=>x.referencePartSelectionNotConfirmed=false,
  x=>x.motor.listingStatus='in-stock',
  x=>x.motor.publishedApproximateAt3V.stallCurrentA=0.2,
  x=>x.motor.actualSpecimenId='fake1',
  x=>x.motor.originalIndependentlyMeasuredDataCount=2,
  x=>x.battery.seriesCount=3,
  x=>x.battery.freshCellInternalResistanceOhm.min=0.001,
  x=>x.battery.measuredPackDynamicImpedanceOhm=0.3,
  x=>x.conductors.conductorLengthM=0.4,
  x=>x.fan.partNumber='safe-impeller',
  x=>x.fan.bladeRetentionVerified=true,
  x=>x.fan.guardOrEnclosureQualified=true,
  x=>x.supplyAndProtection.faultCurrentLimitingQualified=true,
  x=>x.operatingEnvelope.qualifiedPhysicalEnvelope={min:0,max:1},
  x=>x.actualPhysicalFanMeasurements=100,
  x=>x.modelTransferredFrom24VBLDC=true,
  x=>x.realWorldBuildSuccessPercent=99,
  x=>x.physicalVerdict='pass'
 ];
 for(const modify of edits){const x=snap();modify(x);assert.throws(()=>verifyReferenceCandidate(x));}
});
test('New physical assembly documentation must contain real specimen identities and safety evidence',()=>{
 const r=inspectFutureAssemblyMetadata({});
 assert.ok(r.missingFields.includes('impellerPartNumber'));
 assert.ok(r.missingFields.includes('enclosureReviewRecord'));
 assert.equal(r.readyForIndependentSafetyReview,false);
 assert.equal(r.physicalTestingAuthorized,false);
});
test('Full metadata is not itself physical test authorization or physical PASS',()=>{
 const keys=['batteryCell1SpecimenId','batteryCell2SpecimenId','batteryLot',
 'motorActualPartNumber','motorSpecimenId','motorLot','wirePartNumber','wireLengthM',
 'connectorPartNumber','impellerPartNumber','impellerSpecimenId','manufacturerRatedMaxRpm',
 'shaftFitReviewRecord','enclosureReviewRecord','currentProtectionReviewRecord',
 'instrumentCalibrationReviewRecord'];
 const full=Object.fromEntries(keys.map(k=>[k,k==='wireLengthM'?0.2:k==='manufacturerRatedMaxRpm'?1500:k+'_sample']));
 const r=inspectFutureAssemblyMetadata(full);
 assert.equal(r.missingFields.length,0);
 assert.equal(r.readyForIndependentSafetyReview,false); // different motor requires new model
 assert.ok(r.issues.some(x=>x.includes('Different motor')));
 assert.equal(r.physicalTestingAuthorized,false);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Source-matched discontinued motor still needs procurement confirmation and physical checks',()=>{
 const full=Object.fromEntries(inspectFutureAssemblyMetadata({}).missingFields.map(k=>[k,k==='wireLengthM'?0.2:k==='manufacturerRatedMaxRpm'?1500:'provenance-record']));
 full.motorActualPartNumber='1592';
 const r=inspectFutureAssemblyMetadata(full);
 assert.equal(r.missingFields.length,0);
 assert.ok(r.issues.some(x=>x.includes('Discontinued')));
 assert.equal(r.physicalTestingAuthorized,false);
});
