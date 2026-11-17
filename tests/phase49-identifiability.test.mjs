import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyIdentifiabilitySource,fitSyntheticTotalResistance,rejectUnqualifiedPhysicalCalibration} from '../js/evidence/phase49-identifiability.js';
const d=JSON.parse(readFileSync(new URL('../benchmarks/phase49/synthetic-identifiability.json',import.meta.url)));
test('Source has only algebra-generated training and holdout points',()=>{
 assert.equal(verifyIdentifiabilitySource(d),true);
 assert.equal(d.syntheticRecords.length,5);
 assert.equal(d.sourceMatchedPhysicalMeasurements,0);
});
test('Train-only total-resistance inference is exact under noiseless synthetic source',()=>{
 const r=fitSyntheticTotalResistance(d);
 assert.ok(Math.abs(r.identifiableTotalSeriesResistanceOhm-1.24)<1e-12);
 assert.equal(r.trainingSyntheticCases.length,3);
 assert.equal(r.withheldSyntheticCases.length,2);
 assert.equal(r.syntheticHoldoutMaximumAbsoluteCurrentErrorA<1e-12,true);
 assert.equal(r.realPhysicalHoldoutDevices,0);
 assert.equal(r.physicalValidation,'none');
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Jacobian rank one and null direction show individual resistances unidentifiable',()=>{
 const r=fitSyntheticTotalResistance(d);
 assert.equal(r.structuralJacobianRank,1);
 assert.ok(r.structuralJacobian.every(row=>Math.abs(row[0]-row[2])<1e-12));
 assert.deepEqual(r.unidentifiableNullDirection,[1,-1,0]);
 for(const key of ['batteryResistanceEstimateOhm','harnessResistanceEstimateOhm','motorResistanceEstimateOhm'])
  assert.equal(r[key],null);
 assert.ok(Object.isFrozen(r));
});
test('Different component-level decompositions produce identical synthetic observations',()=>{
 const original=[.45,.04,.75].reduce((x,y)=>x+y,0);
 const alternative=[.35,.14,.75].reduce((x,y)=>x+y,0);
 assert.ok(Math.abs(original-alternative)<1e-12);
 for(const v of [1.8,2.2,2.6,3])assert.ok(Math.abs(v/original-v/alternative)<1e-12);
});
test('Altered physical claims and source train/holdout leakage are refused',()=>{
 const edits=[
  x=>x.sourceMatchedPhysicalMeasurements=4,
  x=>x.physicalHardwareSamples=2,
  x=>x.measurementOrigin='ACTUAL_INSTRUMENT',
  x=>x.referenceHypotheticalResistancesOhm.battery=.25,
  x=>x.syntheticRecords[1].partition='synthetic-holdout',
  x=>x.syntheticRecords[2].currentA=1e9,
  x=>x.syntheticRecords.push(x.syntheticRecords[0]),
  x=>x.structuralJacobianExpectedRank=3,
  x=>x.individualBatteryResistancePhysicallyIdentifiable=true,
  x=>x.physicalPredictionInterval=[1,2],
  x=>x.physicalValidation='pass',
  x=>x.realWorldBuildSuccessPercent=99
 ];
 for(const change of edits){const copy=structuredClone(d);change(copy);
  assert.throws(()=>verifyIdentifiabilitySource(copy));}
});
test('Fake experimental calibration paperwork cannot identify absent individual hardware',()=>{
 const x=rejectUnqualifiedPhysicalCalibration(d,{label:'claim of perfect fan'});
 assert.equal(x.parametersAdmittedIntoPhysicalModel,0);
 assert.equal(x.calibrationAndHoldoutSeparatedByRealDevice,false);
 assert.equal(x.independentInstrumentReview,false);
 assert.equal(x.realWorldBuildSuccessPercent,null);
 assert.throws(()=>rejectUnqualifiedPhysicalCalibration(d,null));
});
