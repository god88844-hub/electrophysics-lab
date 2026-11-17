import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyUncertaintyInputs,calculateConditionalUncertainty,evaluatePhysicalHoldoutPlan} from '../js/evidence/phase50-uncertainty.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const a=read('../benchmarks/phase50/uncertainty-envelope.json');
const models={candidate:read('../benchmarks/phase41/reference-hardware-candidate.json'),
 battery:read('../benchmarks/phase43/e91-assumptions.json'),
 wire:read('../benchmarks/phase44/copper-harness-assumptions.json'),
 motor:read('../benchmarks/phase45/pololu1592-endpoint-model.json'),
 identifiability:read('../benchmarks/phase49/synthetic-identifiability.json')};
test('Source envelope has no meaningful statistical confidence or physical calibration',()=>{
 assert.equal(verifyUncertaintyInputs(a,models),true);
 assert.equal(a.confidenceLevel,null);
 assert.equal(a.sourceMatchedPhysicalHoldoutUnits,0);
 assert.equal(a.intervalRepresentsPhysicalProbability,false);
});
test('Independent mathematical extreme-resistance oracle bounds the assumed stopped rotor current',()=>{
 const s=calculateConditionalUncertainty(a,models);
 const diameterM=.127e-3*Math.pow(92,12/39);
 const area=Math.PI*diameterM**2/4;
 const copper=(1/58e6)*.5/area;
 const min=3/(.75+.6+copper+.1),max=3/(.75+.3+copper);
 assert.ok(Math.abs(s.assumedWireCopperResistanceOhm-copper)<1e-12);
 assert.ok(Math.abs(s.hypotheticalStoppedRotorCurrentRangeA.lower-min)<1e-12);
 assert.ok(Math.abs(s.hypotheticalStoppedRotorCurrentRangeA.upper-max)<1e-12);
 assert.equal(s.statisticallyCalibratedPredictionInterval,null);
 assert.equal(s.physicalIndependentHoldoutSpecimens,0);
 assert.equal(s.physicallyQualified,false);
 assert.equal(s.realWorldBuildSuccessPercent,null);
});
test('More uncertain contact and battery values widen but do not turn into confidence bounds',()=>{
 const r=calculateConditionalUncertainty(a,models);
 assert.ok(r.assumedTotalSeriesResistanceRangeOhm.upper>r.assumedTotalSeriesResistanceRangeOhm.lower);
 assert.ok(r.hypotheticalStoppedRotorCurrentRangeA.upper>r.hypotheticalStoppedRotorCurrentRangeA.lower);
 assert.equal(r.confidenceLevel,null);
 assert.equal(r.correlationEffectsUnmeasured,true);
});
test('Group-level leakage is detected without asserting the claimed IDs represent real hardware',()=>{
 const bad=evaluatePhysicalHoldoutPlan(a,models,{
  trainingSpecimenIDs:['a','b'],heldOutSpecimenIDs:['b','c'],reviews:['fake']});
 assert.deepEqual(bad.overlapSpecimenIDs,['b']);
 assert.equal(bad.groupSeparationClaimInternallyConsistent,false);
 assert.equal(bad.externallyVerifiedHardwareSpecimenIDs,0);
 const good=evaluatePhysicalHoldoutPlan(a,models,{
  trainingSpecimenIDs:['a','b'],heldOutSpecimenIDs:['c'],reviews:['unverified']});
 assert.equal(good.groupSeparationClaimInternallyConsistent,true);
 assert.equal(good.physicallyValidated,false);
 assert.equal(good.acceptedSourceMatchedPhysicalHoldoutSamples,0);
});
test('Reject fake source-calibrated interval, distribution, independent specimens and physical success',()=>{
 const changes=[
 x=>x.sourceMatchedPhysicalHoldoutUnits=4,
 x=>x.physicalCalibrationUnits=3,
 x=>x.sourceMatchedPredictionInterval=[0,2],
 x=>x.independentDeviceHeldoutAccuracy=.001,
 x=>x.confidenceLevel=.95,
 x=>x.assumedDistribution='normal',
 x=>x.intervalRepresentsPhysicalProbability=true,
 x=>x.correlationsAndModelDiscrepancyQualified=true,
 x=>x.batterySeriesResistanceOhm.upper=1,
 x=>x.twoContactResistanceEachOhm.upper=1,
 x=>x.nominalPackVoltageHypothesisV=24,
 x=>x.motorEffectiveStoppedResistanceHypothesisOhm=.1,
 x=>x.physicalValidation='complete',
 x=>x.realWorldBuildSuccessPercent=99
 ];
 for(const change of changes){
  const copy=structuredClone(a);change(copy);
  assert.throws(()=>verifyUncertaintyInputs(copy,models));
 }
});
test('Refuse corrupt/duplicate holdout specimen IDs',()=>{
 assert.throws(()=>evaluatePhysicalHoldoutPlan(a,models,{trainingSpecimenIDs:['a','a']}));
 assert.throws(()=>evaluatePhysicalHoldoutPlan(a,models,{heldOutSpecimenIDs:[0]}));
 assert.throws(()=>evaluatePhysicalHoldoutPlan(a,models,{reviews:null}));
});
