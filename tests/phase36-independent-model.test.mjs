import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyPhase36,analyzeNewHoldoutOriginal,evaluateTwoRegimeHoldout} from '../js/measure/phase36-source-calibration.js';
const p35=JSON.parse(readFileSync(new URL('../benchmarks/phase35/acceptance.json',import.meta.url),'utf8'));
const p36=JSON.parse(readFileSync(new URL('../benchmarks/phase36/acceptance.json',import.meta.url),'utf8'));
const HEADER='t_us,ax,ay,az,ax1,ay1,az1,shunt_raw,bus_raw,curr_raw,pg_rpm,seq,dt';
function csv(n=12000,{period=4,badPG=false}={}){
 const rows=[HEADER];
 for(let i=0;i<n;i++)rows.push([i*1000,2800,3200,127000,3000,3900,126900,19,20000,100,
  badPG?1:Number(i%period<period/2),i%65536,i===0?'':0.001].join(','));
 return rows.join('\n')+'\n';
}
function example({tamper=false}={}){
 const specs=[['training-motor2-2000',2000,'motor2','operating-point-contrast',0.32],
 ['training-motor2-2500',2500,'motor2','training',0.35],
 ['holdout-motor3-2000',2000,'motor3','holdout',0.36],
 ['holdout-motor3-2500',2500,'motor3','holdout',0.38]];
 return specs.map(([id,setpoint,unit,role,current])=>{
  const pin=[...p35.readings,p36.additionalHeldOutPublisherRecording].find(x=>x.id===id);
  return {originalSourceId:id,declaredRole:role,declaredMotorUnit:unit,
    originalPublisherGitBlob:pin.gitBlobSHA1,sourceGitBlobVerified:true,
    publisherSpeedSetpointRpm:setpoint,publisherLoadSettingMilliamp:96,
    measuredSpeedRpm:setpoint+(unit==='motor2'?1:2),tachAcquisitionUsable:true,
    meanUpstreamCurrentA:current,meanBusVoltageV:24.8,rawSampleCount:5000,
    physicalValidationForTarget:'none',realWorldBuildSuccessPercent:null};
 });
}
test('Exact source identity is pinned, and physical fan success remains unknown',()=>{
 assert.equal(verifyPhase36(p35,p36),true);
 assert.equal(p36.additionalHeldOutPublisherRecording.bytes,23964792);
 assert.equal(p36.sourceOperatingSetpointsRpm.length,2);
 assert.equal(p36.realWorldBuildSuccessPercent,null);
});
test('New motor3 original tach RPM is computed from pulses and source time, not filename',()=>{
 const rec=analyzeNewHoldoutOriginal(csv(),p35,p36);
 assert.equal(rec.sourceGitBlobVerified,false);
 assert.equal(rec.rawSampleCount,12000);
 assert.equal(rec.declaredMotorUnit,'motor3');
 assert.equal(rec.publisherSpeedSetpointRpm,2000);
 assert.ok(Math.abs(rec.measuredSpeedRpm-2500)<2);
 assert.equal(rec.realWorldBuildSuccessPercent,null);
});
test('Sensor stuck HIGH cannot become observed speed',()=>{
 assert.throws(()=>analyzeNewHoldoutOriginal(csv(12000,{badPG:true}),p35,p36),/acquisition unusable/);
});
test('Raw source label without original Git blob cannot be promoted to verified physical source',()=>{
 assert.throws(()=>analyzeNewHoldoutOriginal(csv(),p35,p36,{sourceGitBlobVerified:true}),/byte length/);
});
test('Two-point model uses motor2 only, has two independent device test conditions and no predictive population interval',()=>{
 const result=evaluateTwoRegimeHoldout(p35,p36,example());
 assert.equal(result.trainingMotorUnit,'motor2');
 assert.equal(result.strictlyIndependentHeldOutMotorUnit,'motor3');
 assert.equal(result.measuredIndependentDeviceTests.length,2);
 assert.equal(result.heldOutMeanAbsoluteErrorRpm,1);
 assert.equal(result.heldOutMaximumAbsoluteErrorRpm,1);
 assert.equal(result.evaluationUsedHoldoutToFit,false);
 assert.equal(result.fit.trainingResidualDegreesOfFreedom,0);
 assert.equal(result.credibleNewDevicePredictionIntervalRpm,null);
 assert.equal(result.realWorldBuildSuccessPercent,null);
});
test('Cross-device errors must not be described as a successful physical fan estimate',()=>{
 const x=evaluateTwoRegimeHoldout(p35,p36,example());
 assert.equal(x.matchedPhysical3VFanMeasurements,0);
 assert.equal(x.calibratedPhysicalSpeedErrorFor3VFan,null);
 assert.equal(x.independentSampleUnit,'physical-motor-unit');
 assert.equal(x.actualDistinctMotorUnits,2);
});
test('Reject leaking holdout device into training and reject falsified provenance or results',()=>{
 const changes=[
  a=>a[0].declaredMotorUnit='motor3',
  a=>a[2].declaredMotorUnit='motor2',
  a=>a[1].declaredRole='holdout',
  a=>a[3].originalPublisherGitBlob='0'.repeat(40),
  a=>a[2].sourceGitBlobVerified=false,
  a=>a[3].tachAcquisitionUsable=false,
  a=>a[0].measuredSpeedRpm=null,
  a=>a[1].measuredSpeedRpm=NaN,
  a=>a[2].realWorldBuildSuccessPercent=99,
  a=>a[0].meanBusVoltageV=-5,
  a=>a[3].originalSourceId='holdout-motor3-2000',
  a=>a.pop()
 ];
 for(const modify of changes){
  const r=example();modify(r);
  assert.throws(()=>evaluateTwoRegimeHoldout(p35,p36,r));
 }
});
test('Reject source substitutions, inflated experiment counts and fake calibration assertions',()=>{
 const changes=[
  x=>x.sourceCommit='0'.repeat(40),
  x=>x.additionalHeldOutPublisherRecording.gitBlobSHA1='0'.repeat(40),
  x=>x.additionalHeldOutPublisherRecording.bytes=100,
  x=>x.trainingMotorUnit='motor3',
  x=>x.additionalHeldOutPublisherRecording.unit='motor2',
  x=>x.sourcePGPulsesPerMechanicalRevolution=5,
  x=>x.sourceOperatingSetpointsRpm=[1000,2500],
  x=>x.publisherSensorCalibrationsIndependentlyCertified=true,
  x=>x.matchedPhysical3VBrushedBatteryFanMeasurements=1000,
  x=>x.physicalValidationForTarget3VFan='validated',
  x=>x.realWorldBuildSuccessPercent=100
 ];
 for(const change of changes){const x=structuredClone(p36);change(x);assert.throws(()=>verifyPhase36(p35,x));}
});
test('Corrupt publisher sample time, PG and raw voltage/current rejected',()=>{
 const s=csv();
 const mutations=[
  s.replace('pg_rpm','motor_perfection'),
  s.replace('1000,2800','-1000,2800'),
  s.replace('20000,100,','-20000,100,'),
  s.replace('20000,100,','x,100,'),
  s.replace(',100,1,',',100,9,'),
  s.replace(',2,0.001',',9999,0.001')
 ];
 for(const item of mutations){assert.notEqual(item,s);assert.throws(()=>analyzeNewHoldoutOriginal(item,p35,p36));}
});
