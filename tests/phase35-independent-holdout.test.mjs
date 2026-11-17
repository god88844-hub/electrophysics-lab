import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyStudy,analyzeBLDCHealthy,independentMotorHoldout,PH35_FORMAT}
 from '../js/measure/phase35-independent-holdout.js';
const p=JSON.parse(readFileSync(new URL('../benchmarks/phase35/acceptance.json',import.meta.url),'utf8'));
const header='t_us,ax,ay,az,ax1,ay1,az1,shunt_raw,bus_raw,curr_raw,pg_rpm,seq,dt';
function data(n=10000,{pgPeriod=4,currentRaw=100,voltageRaw=20000,constantPG=null}={}){
 const lines=[header];
 for(let i=0;i<n;i++){
  const pg=constantPG===null?(i%pgPeriod<pgPeriod/2?1:0):constantPG;
  lines.push([i*1000,2800,3200,127000,3000,3900,126900,19,voltageRaw,
   currentRaw,pg,100+i,i===0?'':.001].join(','));
 }
 return lines.join('\n')+'\n';
}
function analyzed(){
 // Synthetic test fixtures explicitly imitate completed Git blob validation;
 // the real workflow independently hashes original publisher bytes.
 return p.readings.map(x=>({...analyzeBLDCHealthy(data(10000),p,x.id),sourceGitBlobVerified:true}));
}
test('All three publisher file identities are exact, unchanged and split by original motor specimen',()=>{
 assert.equal(verifyStudy(p),true);
 assert.equal(p.readings.length,3);
 assert.deepEqual(p.readings.map(x=>x.unit),['motor2','motor3','motor2']);
 assert.deepEqual(p.readings.map(x=>x.speedSetpointRpm),[2500,2500,2000]);
 assert.equal(p.target3VBrushedFanMatchingMotorPart,false);
 assert.equal(p.realWorldBuildSuccessPercent,null);
});
test('Healthy oscillating PG yields independently measured RPM from rising edges, never speed setpoint',()=>{
 const x=analyzeBLDCHealthy(data(),p,'training-motor2-2500');
 assert.equal(x.tachAcquisitionUsable,true);
 assert.ok(Math.abs(x.measuredSpeedRpm-2500)<2);
 assert.equal(x.rawSampleCount,10000);
 assert.equal(x.declaredMotorUnit,'motor2');
 assert.equal(x.publisherSpeedSetpointRpm,2500);
 assert.equal(x.sourceGitBlobVerified,false);
 assert.equal(x.acquisitionQuality.timeNonmonotone,0);
 assert.equal(x.acquisitionQuality.sequenceGaps,0);
 assert.equal(x.acquisitionQuality.inconsistentReportedDt,0);
 assert.equal(x.completeOneSecondWindows.length,10);
 assert.ok(Math.abs(x.meanBusVoltageV-25)<1e-10);
 assert.ok(Math.abs(x.meanUpstreamCurrentA-.030518)<1e-10);
 assert.ok(Math.abs(x.meanUpstreamElectricalPowerW-.76295)<1e-8);
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Publisher healthy label without actual PG transitions refuses physical RPM inference',()=>{
 for(const flag of [0,1]){
  const x=analyzeBLDCHealthy(data(15000,{constantPG:flag}),p,'training-motor2-2500');
  assert.equal(x.measuredSpeedRpm,null);
  assert.equal(x.tachAcquisitionUsable,false);
  assert.equal(x.publisherSpeedSetpointRpm,2500);
 }
});
test('Strict original raw Git source flag rejects an invented smaller CSV',()=>{
 assert.throws(()=>analyzeBLDCHealthy(data(),p,'training-motor2-2500',
  {sourceGitBlobVerified:true}),/Original source/);
});
test('Independent manufacturer-motor-unit held-out comparison reports differences, not target fan yield',()=>{
 const x=independentMotorHoldout(p,analyzed());
 assert.equal(x.format,PH35_FORMAT);
 assert.equal(x.independentMotorUnitsRepresented,2);
 assert.equal(x.trainingMotorUnit,'motor2');
 assert.equal(x.independentHoldoutMotorUnit,'motor3');
 assert.equal(x.holdoutWasUsedToFitPrediction,false);
 assert.equal(x.independentDeviceHeldOutSourceValidated,true);
 assert.equal(x.fixedComparisonCondition.rpmSetpoint,2500);
 assert.equal(x.heldOutAbsoluteSpeedDifferenceRpm,0);
 assert.equal(x.heldOutUpstreamCurrentDifferenceA,0);
 assert.equal(x.actualMatchedFanPhysicalMeasurements,0);
 assert.equal(x.targetFanErrorBoundFromIndependentStudy,null);
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Real holdout actual speed differs from source setpoint in a measurable direction',()=>{
 const x=analyzed();
 x[1]={...x[1],measuredSpeedRpm:x[1].measuredSpeedRpm*0.94};
 const out=independentMotorHoldout(p,x);
 assert.ok(Math.abs(out.heldOutRelativeSpeedDifferencePercent-6)<1e-8);
 assert.equal(out.realWorldBuildSuccessPercent,null);
});
test('Missing independent motor unit, swapped split or same physical specimen cannot pass',()=>{
 const original=analyzed();
 const changes=[
  z=>z.splice(1,1),
  z=>z[1]={...z[1],declaredMotorUnit:'motor2'},
  z=>z[0]={...z[0],declaredRole:'holdout'},
  z=>z[1]={...z[1],originalPublisherGitBlob:'a'.repeat(40)},
  z=>z[1]={...z[1],sourceGitBlobVerified:false},
  z=>z[1]={...z[1],measuredSpeedRpm:null},
  z=>z[1]={...z[1],measuredSpeedRpm:NaN},
  z=>z[2]={...z[2],publisherSpeedSetpointRpm:2500}
 ];
 for(const change of changes){const arr=structuredClone(original);change(arr);
  assert.throws(()=>independentMotorHoldout(p,arr));}
});
test('Original source publisher path, version, exact sha, and physical labels cannot be tampered',()=>{
 const edits=[
  x=>x.sourceCommit='0'.repeat(40),
  x=>x.sourceRepository='somewhere-else',
  x=>x.author='not the author',
  x=>x.license='restricted',
  x=>x.driver='invented model',
  x=>x.sourcePublisherInstrumentCalibrationIndependentlyVerified=true,
  x=>x.sourceMeasurementsTransferToTarget3VFan=true,
  x=>x.readings[0].gitBlobSHA1='0'.repeat(40),
  x=>x.readings[1].bytes=100,
  x=>x.readings[1].unit='motor2',
  x=>x.readings[2].publisherHealth='SF',
  x=>x.readings[0].source='bat',
  x=>x.numberOfIndependentMotorUnitsForThisStudy=50000,
  x=>x.realWorldBuildSuccessPercent=99.99
 ];
 for(const change of edits){
  const candidate=structuredClone(p);change(candidate);
  assert.throws(()=>verifyStudy(candidate));
 }
});
test('Original sensor time, digital speed samples and source data schema must not be forged',()=>{
 const x=data(1000);
 for(const changed of [
  x.replace('pg_rpm','measured_perfection'),
  x.replace('0,2800','NaN,2800'),
  x.replace('1000,2800','-1000,2800'),
  x.replace(',100,1,',' ,100,9,'),
  x.replace('20000,100,','x,100,'),
  x.replace('20000,100,','-30000,100,'),
  x.replace(',101,0.001',',9999,0.001')
 ]){
  assert.notEqual(changed,x,'Every adversarial fixture must actually change source data');
  assert.throws(()=>analyzeBLDCHealthy(changed,p,'training-motor2-2500'));
 }
});
test('Repeated raw rows from one motor cannot create fake independent-device population size',()=>{
 const x=analyzeBLDCHealthy(data(25000),p,'training-motor2-2500');
 assert.equal(x.rawSampleCount,25000);
 assert.equal(x.individualRowsAreIndependentMotorUnits,false);
 assert.equal(x.physicalModelDiscrepancyBoundForPhase31Fan,null);
 assert.equal(x.originalPhysicalFanObservationCount,0);
});
test('Source study denominator must be a motor-unit holdout, not a repeated-row 95% accuracy',()=>{
 const x=independentMotorHoldout(p,analyzed());
 assert.equal(x.independentMotorUnitsRepresented,2);
 assert.equal(x.independentHoldoutMotorUnit,'motor3');
 assert.equal(x.manufacturingFailurePopulationRate,null);
 assert.equal(x.targetFanErrorBoundFromIndependentStudy,null);
 assert.equal(x.physicalQualificationOfActiveFan,false);
});
