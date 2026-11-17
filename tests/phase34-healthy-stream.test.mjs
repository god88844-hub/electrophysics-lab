import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyHealthyPin,inspectHealthyPublishedRecording,comparePublishedHealthyWithFault,FORMAT}
 from '../js/measure/phase34-healthy-bldc.js';
const p=JSON.parse(readFileSync(new URL('../benchmarks/phase34/acceptance.json',import.meta.url),'utf8'));
const columns='t_us,ax,ay,az,ax1,ay1,az1,shunt_raw,bus_raw,curr_raw,pg_rpm,seq,dt';
function make(size=20,{pulseEvery=2}={}){
 const rows=[columns];
 for(let i=0;i<size;i++){
  const phase=pulseEvery===0?1:Math.floor(i/pulseEvery)%2;
  rows.push([i*1000,100,100,100,100,100,100,20,19860,80,phase,100+i,
   i===0?'':0.001].join(','));
 }
 return rows.join('\n')+'\n';
}
async function* lines(csv){
 for(const row of csv.trimEnd().split('\n'))yield row;
}
const inspect=csv=>inspectHealthyPublishedRecording(lines(csv),p);
test('Original healthy file pins 22MB 24V BLDC same publisher version with CC-BY attribution',()=>{
 assert.equal(verifyHealthyPin(p),true);
 assert.equal(p.expectedBytes,22712053);
 assert.equal(p.expectedGitBlobSHA1,'8dd094813462b489e3a24519d1b7a154bd12cf04');
 assert.equal(p.sourceCommit,'1ce35456f83be8f36aec183ab19d6e6e46603023');
 assert.equal(p.namedRpmSetpoint,500);
 assert.equal(p.sourceLicense,'CC BY 4.0');
 assert.equal(p.actualOurFanSiliconMeasurements,0);
});
test('Six original square-wave pulses/revolution reconstruct speed from transitions not filename',async()=>{
 const x=await inspect(make(30,{pulseEvery:2}));
 assert.equal(x.format,FORMAT);
 assert.equal(x.rawRecordedSamples,30);
 assert.equal(x.pgRisingEdges,7);
 assert.equal(x.originalPublisherPGSignalSpeedUsable,true);
 assert.ok(Math.abs(x.reconstructedPublisherPGSpeedRpm-(7/6/0.029*60))<1e-7);
 assert.equal(x.publisherSpeedSetpointRpm,500);
 assert.notEqual(x.reconstructedPublisherPGSpeedRpm,500);
 assert.equal(x.deviceMatchesPhase31Illustrative3VFan,undefined);
 assert.equal(x.current3VFanMeasuredPhysicalSamples,0);
 assert.equal(x.realWorldBuildSuccessPercent,null);
});
test('Constant high PG sensor is NOT a verified RPM regardless of 500RPM setpoint',async()=>{
 const x=await inspect(make(30,{pulseEvery:0}));
 assert.equal(x.pgRisingEdges,0);
 assert.equal(x.pgLowSamples,0);
 assert.equal(x.originalPublisherPGSignalSpeedUsable,false);
 assert.equal(x.reconstructedPublisherPGSpeedRpm,null);
});
test('INDEPENDENT source timing: t_us, sequence and recorded dt checked on every row',async()=>{
 const x=await inspect(make(20));
 assert.equal(x.sequenceGapEvents,0);
 assert.equal(x.reportedDtInconsistent,0);
 assert.equal(x.reportedDtMissing,0);
 assert.ok(x.maxAbsoluteSampleJitterFrom1msSeconds<=1e-12);
 assert.ok(Math.abs(x.upstreamBusVoltageMeanV-24.825)<1e-9);
 assert.ok(Math.abs(x.upstreamElectricalCurrentMeanA-0.0244144)<1e-9);
});
test('Inaccurate dt and sequence jump are explicitly flagged not hidden as perfect measurement',async()=>{
 const a=await inspect(make(24).replace(',102,0.001',',102,0.010'));
 assert.ok(a.reportedDtInconsistent>0);
 const b=await inspect(make(24).replace(',103,0.001',',123,0.001'));
 assert.ok(b.sequenceGapEvents>0);
 assert.equal(b.originalPublisherPGSignalSpeedUsable,true);
});
test('Disordered sample times and impossible input sensor values fail source audit',async()=>{
 for(const bad of [
  make().replace('2000,100','1000,100'),
  make().replace('1000,100','-1000,100'),
  make().replace('19860,80','-19860,80'),
  make().replace('19860,80','19860,-80'),
  make().replace('19860,80,0','19860,80,3'),
  make().replace('bus_raw','fake_voltage'),
  make().replace('100,100,100','not-numeric,100,100')
 ])await assert.rejects(()=>inspect(bad));
});
test('Publisher numbers do not become independent original fan population statistics',async()=>{
 const a=await inspect(make(40));
 assert.equal(a.sourceHardwareMeasurementsBelongToOther24VBLDC,true);
 assert.equal(a.sourcePublisherCalibrationIndependentlyReviewedByUs,false);
 assert.equal(a.separateMotorUnitHoldoutEstablishableFromThisRecording,false);
 assert.equal(a.current3VFanMeasuredRpm,null);
 assert.equal(a.modelErrorForOur3VFan,null);
 assert.equal(a.realWorldBuildSuccessPercent,null);
});
test('Even healthy-versus-fault original recordings cannot be marketed as 3V fan physical proof',async()=>{
 const healthy=await inspect(make(40));
 const other={
  format:'invention-lab/phase33-original-24v-bldc-measurement-audit/1',
  parsedOriginalPublishedRows:5073,inferredRpmFromPulseEdges:null
 };
 const pair=comparePublishedHealthyWithFault(healthy,other);
 assert.equal(pair.faultyPulseReconstructedRPM,null);
 assert.equal(pair.healthyOriginalRows,40);
 assert.equal(pair.validSameTargetSourceMotorIdentityConfirmed,true);
 assert.equal(pair.experimentalSameTrueMechanicalRpmEstablished,false);
 assert.equal(pair.externalControlPopulationStatisticsEstimated,false);
 assert.equal(pair.originalTargetFanPhysicalObservations,0);
 assert.equal(pair.deviceMatchesHypothetical3VBrushedFan,false);
 assert.equal(pair.realWorldBuildSuccessPercent,null);
});
test('Fake companion physical validation record is refused',async()=>{
 const healthy=await inspect(make(40));
 assert.throws(()=>comparePublishedHealthyWithFault(healthy,{format:'invented',inferredRpmFromPulseEdges:500}));
});
test('Original source pin revisions, counterfeit licenses and manufactured fan yield are rejected',()=>{
 for(const mutate of [
  x=>x.expectedGitBlobSHA1='f'.repeat(40),
  x=>x.expectedBytes=10,
  x=>x.sourceCommit='0'.repeat(40),
  x=>x.sourceLicense='UNKNOWN',
  x=>x.sourcePath='myfan.csv',
  x=>x.motorUnitAndExperimentId='another-lot',
  x=>x.realWorldBuildSuccessPercent=100,
  x=>x.modelErrorCertifiedForPhase31Fan=0.01,
  x=>x.deviceIndependenceFromFaultCase=true,
  x=>x.physicalVerdictForOurFan='pass'
 ]){
  const data=structuredClone(p);mutate(data);
  assert.throws(()=>verifyHealthyPin(data));
 }
});
