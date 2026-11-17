import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFanReference,evaluateFanAffinity,inspectFanCalibrationCandidate} from '../js/evidence/phase46-fan-affinity.js';
const a=JSON.parse(readFileSync(new URL('../benchmarks/phase46/fan-affinity-assumptions.json',import.meta.url)));
const c=JSON.parse(readFileSync(new URL('../benchmarks/phase41/reference-hardware-candidate.json',import.meta.url)));
const run=v=>evaluateFanAffinity(a,c,{hypotheticalRpm:v});
test('Unselected impeller and zero physical readings remain strictly frozen',()=>{
 assert.equal(verifyFanReference(a,c),true);
 assert.equal(a.physicalImpellerDiameterM,null);
 assert.equal(a.manufacturerImpellerMaxRatedRpm,null);
 assert.equal(a.actualMeasuredFanDataPoints,0);
});
test('Independent affinity oracle at half, reference and 1.5x hypothetical speeds',()=>{
 for(const [rpm,n] of [[500,.5],[1000,1],[1500,1.5]]){
  const p=run(rpm);
  assert.equal(p.normalizedAirflowRatio,n);
  assert.equal(p.normalizedPressureRatio,n*n);
  assert.equal(p.normalizedShaftPowerRatio,n**3);
  assert.equal(p.normalizedTorqueRatio,n*n);
  assert.equal(p.actualAirflowM3s,null);
  assert.equal(p.actualShaftPowerW,null);
  assert.equal(p.shaftSpeedSafetyLimitRpm,null);
  assert.equal(p.physicalValidation,'none');
 }
});
test('Zero-RPM mathematical scaling does not infer a physical fan installation',()=>{
 const r=run(0);
 assert.equal(r.normalizedPressureRatio,0);
 assert.equal(r.normalizedShaftPowerRatio,0);
 assert.equal(r.physicalFanSpecimensMeasured,0);
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('Dimensionless similarity is not a calibrated pressure-flow curve',()=>{
 const x=inspectFanCalibrationCandidate(a,c,{});
 assert.equal(x.sourceMatchToReferenceFan,false);
 assert.equal(x.physicalTestingAuthorized,false);
 assert.ok(x.missingIdentificationAndReviewFields.includes('manufacturerRatedMaxRpm'));
 const all=Object.fromEntries(x.missingIdentificationAndReviewFields.map(k=>[k,'self-declared']));
 const y=inspectFanCalibrationCandidate(a,c,all);
 assert.equal(y.paperworkPresent,true);
 assert.equal(y.actualPhysicalImpellerReviewed,false);
 assert.equal(y.acceptedIndependentPhysicalFlowMeasurements,0);
});
test('Reject unverified safe speeds, raw measurements and altered theory exponents',()=>{
 const changes=[
  x=>x.manufacturerImpellerPartNumber='made-up',
  x=>x.manufacturerImpellerMaxRatedRpm=20000,
  x=>x.physicalImpellerDiameterM=.1,
  x=>x.measuredReferenceAirflowM3s=.02,
  x=>x.measuredReferencePressurePa=25,
  x=>x.measuredReferenceInputShaftPowerW=2,
  x=>x.measuredShaftTorqueCoefficient=1e-9,
  x=>x.actualMeasuredFanDataPoints=50,
  x=>x.mechanicalContainmentReviewApproved=true,
  x=>x.physicalImpellerSpinningApproved=true,
  x=>x.pressureExponent=3,
  x=>x.airflowExponent=2,
  x=>x.declaredDemonstrationReferenceRpm=20000,
  x=>x.physicalValidation='pass',
  x=>x.realWorldBuildSuccessPercent=99
 ];
 for(const fn of changes){
  const copy=structuredClone(a);fn(copy);
  assert.throws(()=>verifyFanReference(copy,c));
 }
});
test('Nonfinite, negative, exaggerated or ungrounded RPM claims are refused',()=>{
 for(const rpm of [-1,2001,20000,Infinity,NaN,null,undefined,'1000'])
  assert.throws(()=>run(rpm));
});
