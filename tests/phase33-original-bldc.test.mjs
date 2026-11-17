import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyPublicPin,inspectPublishedBLDC,FORMAT}
 from '../js/measure/phase33-original-bldc.js';
const p=JSON.parse(readFileSync(new URL('../benchmarks/phase33/acceptance.json',import.meta.url),'utf8'));
const cols='t_us,ax,ay,az,ax1,ay1,az1,shunt_raw,bus_raw,curr_raw,pg_rpm,seq,dt';
const sample=(bits=[1,1,1,1,1])=>cols+'\n'+bits.map((bit,i)=>
 [i*1000,2800,3200,127000,3000,3900,126900,19,19860,75,bit,100+i,i===0?'':0.001].join(',')
).join('\n')+'\n';
test('Source-locked original published 24V BLDC motor, not hypothetical 3V fan',()=>{
 assert.equal(verifyPublicPin(p),true);
 assert.equal(p.sourceMotorPart,'STEPPEROLINE BLDC 57BYA54-24-01');
 assert.equal(p.sourceRatedVoltageV,24);
 assert.equal(p.licensedAs,'CC BY 4.0');
 assert.equal(p.expectedRawBytes,421672);
 assert.equal(p.expectedRows,5073);
 assert.equal(p.expectedGitBlobSHA1,'7249edf7f21a337bec52fa11fa3c6e555d3e4627');
 assert.equal(p.target3VBatteryFanHardwareMeasurements,0);
 assert.equal(p.realWorldBuildSuccessPercent,null);
});
test('Published raw bus and current sensor scales preserve units and prevent fabricated 3V confidence',()=>{
 const x=inspectPublishedBLDC(sample(),p);
 assert.equal(x.format,FORMAT);
 assert.equal(x.parsedOriginalPublishedRows,5);
 assert.equal(x.tachHighSamples,5);
 assert.equal(x.tachLowSamples,0);
 assert.equal(x.tachPulseRisingEdges,0);
 assert.equal(x.physicallyUsableTachometerEstimate,false);
 assert.equal(x.inferredRpmFromPulseEdges,null);
 assert.ok(Math.abs(x.measuredBusVoltageMeanV-24.825)<0.001);
 assert.ok(Math.abs(x.measuredElectricalCurrentMeanA-.0228885)<1e-7);
 assert.equal(x.realWorldBuildSuccessPercent,null);
 assert.equal(x.physicalVerdictForTarget,'unknown');
});
test('A stalled/high PG signal cannot supply a 500 RPM measurement from a filename',()=>{
 const x=inspectPublishedBLDC(sample(Array(20).fill(1)),p);
 assert.equal(x.sourceConditionSetpointRpm,500);
 assert.equal(x.tachPulseRisingEdges,0);
 assert.equal(x.inferredRpmFromPulseEdges,null);
});
test('Sensor failure annotation blocks physical tachometer claims even if fake pulses appear',()=>{
 const x=inspectPublishedBLDC(sample([0,1,0,1,0,1]),p);
 assert.ok(x.tachPulseRisingEdges>=2);
 assert.equal(x.sourcePublisherSensorFaultDeclared,true);
 assert.equal(x.physicallyUsableTachometerEstimate,false);
 assert.equal(x.inferredRpmFromPulseEdges,null);
});
test('Timebase and sequence must be original monotone and intervals consistent',()=>{
 for(const bad of [
  sample().replace('2000,2800','1000,2800'),
  sample().replace('3000,2800','-1,2800'),
  sample().replace(',101,0.001',',108,0.001'),
  sample().replace(',102,0.001',',102,0.005'),
  sample().replace('0,2800','NaN,2800')
 ])assert.throws(()=>inspectPublishedBLDC(bad,p));
});
test('Nonphysical current, bus, tach values and overwritten original sensor columns fail closed',()=>{
 for(const bad of [
  sample().replace('19860','-1'),
  sample().replace('75,1','-75,1'),
  sample().replace('75,1','75,9'),
  sample().replace('pg_rpm','invented_rpm'),
  sample().replace('dt','fake_calibration'),
  sample().replace('3200,127000','x,127000')
 ])assert.throws(()=>inspectPublishedBLDC(bad,p));
});
test('Strict original-file mode refuses short synthetic datasets as real Git-provenanced bytes',()=>{
 assert.throws(()=>inspectPublishedBLDC(sample(),p,{strictPinnedFile:true}),/Pinned original/);
});
test('Tampering original source SHA, motor identity, license, expected raw length and physical flags fails',()=>{
 const edits=[
  x=>x.sourceRepository='wrong/repo',
  x=>x.sourceCommit='f'.repeat(40),
  x=>x.expectedGitBlobSHA1='0'.repeat(40),
  x=>x.expectedRawBytes=10,
  x=>x.expectedRows=1,
  x=>x.sourceMotorPart='our fan',
  x=>x.licensedAs='unknown',
  x=>x.sourceFaultCategory='healthy',
  x=>x.sourcePublisherIndependentlyAudited=true,
  x=>x.target3VBatteryFanHardwareMeasurements=5073,
  x=>x.target3VFanSuccessPercent=100,
  x=>x.physicalVerdictForTarget='pass'
 ];
 for(const edit of edits){
  const data=structuredClone(p);edit(data);
  assert.throws(()=>verifyPublicPin(data));
 }
});
test('Original source trace and failed tach prohibit claiming validation or manufacturing success',()=>{
 const x=inspectPublishedBLDC(sample(),p);
 assert.equal(x.rawSourceGitObjectBoundToPublisherBytes,false);
 assert.equal(x.independentlyQualifiedCurrentOrVoltageCalibration,false);
 assert.equal(x.deviceMatchesPhase31Illustrative3VFan,false);
 assert.equal(x.individualSamplesAreIndependentHardwareUnits,false);
 assert.equal(x.physicalFanModelErrorBound,null);
 assert.equal(x.trueManufacturingSuccessPercent,null);
 assert.equal(x.originalMatching3VFanHardwareObservations,0);
});
test('Zero measured speed is explicitly null rather than inferred from 500RPM setpoint',()=>{
 const x=inspectPublishedBLDC(sample([1,1,1,1]),p);
 assert.equal(x.sourceConditionSetpointRpm,500);
 assert.equal(x.inferredRpmFromPulseEdges,null);
 assert.notEqual(x.inferredRpmFromPulseEdges,500);
});
