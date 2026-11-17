import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FORMAT,RTL_GIT_BLOB,SUITE_SHA256,SHA256,predictedAlu,stimulus,
 template,preflight,replayTemplate} from '../js/measure/phase24-prototype.js';
import {readFileSync} from 'node:fs';
const policy=JSON.parse(readFileSync(new URL('../benchmarks/phase24/acceptance.json',import.meta.url),'utf8'));
function completeFakeCapture(){
 const d=template();
 d.origin='claimed-real-measurement';
 d.device={specimenId:'unit-test-fictional-die',lotId:'fiction-lot-1',
  waferId:'fiction-wafer-1',dieId:'fiction-die-01',packageId:'fiction-package',
  maskDesignRecordSha256:'a'.repeat(64),independentFoundryReference:'fiction-only-record'};
 d.acquisition={
  sourceInstrumentFileSha256:'b'.repeat(64),originalFilePath:'fictional-do-not-use.csv',
  measurementDateUtc:'2026-11-17T03:00:00Z',operator:'not-a-real-operator',
  laboratory:'mock lab, never qualified',
  instrument:{manufacturer:'synthetic',model:'fake',serialNumber:'fake-1',
   logicThresholdV:0.9,timebaseResolutionS:1e-10,expandedTimingUncertaintyS:1e-9,
   calibrationCertificateSha256:'c'.repeat(64),calibrationValidUntil:'2026-12-17T00:00:00Z'},
  independentReviewer:'fictional-reviewer',
  independentReviewRecordSha256:'d'.repeat(64)
 };
 d.conditions={supplyV:1.8,temperatureC:25,loadCapacitanceF:1e-14,
  inputSlewS:1e-10,ambientHumidityPct:40,settlingTimeS:2e-8};
 for(const r of d.observations){
  const x=predictedAlu(r.a,r.b,r.op);
  r.measuredY=x.y;r.measuredCarry=x.carry;r.measuredZero=x.zero;
  r.measuredDelayS=4e-9;
 }
 return d;
}
test('Frozen target is exact existing ALU with deterministic 1024 distinct vectors',()=>{
 const p=stimulus();
 assert.equal(p.length,1024);
 assert.equal(new Set(p.map(x=>((x.op<<16)|(x.b<<8)|x.a))).size,1024);
 assert.equal(SHA256(JSON.stringify(p)),SUITE_SHA256);
 assert.deepEqual(p[0],{index:0,a:0,b:0,op:0});
 assert.equal(p.filter(x=>x.index<784).length,784);
 assert.deepEqual([...new Set(p.map(x=>x.op))].sort(),[0,1,2,3]);
 assert.equal(policy.design.rtlGitBlob,RTL_GIT_BLOB);
 assert.equal(policy.stimulus.sha256,SUITE_SHA256);
});
test('Hardware target truth table covers carry, XOR, AND, shift and zero',()=>{
 assert.deepEqual(predictedAlu(255,1,0),{y:0,carry:1,zero:1});
 assert.deepEqual(predictedAlu(0,0,0),{y:0,carry:0,zero:1});
 assert.deepEqual(predictedAlu(0xAA,0xFF,1),{y:0x55,carry:0,zero:0});
 assert.deepEqual(predictedAlu(0xF0,0x0F,2),{y:0,carry:0,zero:1});
 assert.deepEqual(predictedAlu(0x80,0x01,3),{y:1,carry:1,zero:0});
 for(const x of [-1,256,1.5,NaN,Infinity])
  assert.throws(()=>predictedAlu(x,0,0),/ALU input/);
 assert.throws(()=>predictedAlu(0,0,4),/ALU input/);
});
test('Actual planned capture is entirely blank -- zero synthetic physical samples',()=>{
 const d=template();
 assert.equal(d.format,FORMAT);
 assert.equal(d.origin,'uncollected');
 assert.equal(d.observations.length,1024);
 assert.ok(d.observations.every(r=>r.measuredY===null&&
  r.measuredCarry===null&&r.measuredZero===null&&r.measuredDelayS===null));
 const check=preflight(d);
 assert.equal(check.status,'awaiting-real-hardware');
 assert.equal(check.observationsComplete,0);
 assert.equal(check.candidateAgreementFraction,null);
 assert.equal(check.physicalValidation,'none');
 assert.equal(check.realWorldBuildSuccessPercent,null);
 assert.equal(check.readyForIndependentReview,false);
 assert.equal(replayTemplate(d,template()).ok,true);
});
test('Altered capture file, fake measurements or unknown physical yield fail strict replay',()=>{
 const good=template();
 for(const change of [
  c=>c.observations[0].measuredY=0,
  c=>c.observations[11].a=99,
  c=>c.realWorldBuildSuccessPercent=100,
  c=>c.origin='claimed-real-measurement',
  c=>c.rtlGitBlob='0'.repeat(40),
  c=>c.observations.push(c.observations[0])
 ]){
  const altered=structuredClone(good);
  change(altered);
  assert.equal(replayTemplate(altered,good).ok,false);
 }
});
test('Out-of-order, duplicates, substitution and source/version mismatches rejected',()=>{
 for(const change of [
  d=>[d.observations[0],d.observations[1]]=[d.observations[1],d.observations[0]],
  d=>d.observations[3]=d.observations[2],
  d=>d.observations[4].op=3-d.observations[4].op,
  d=>d.observations.pop(),
  d=>d.vectorSuiteSha256='f'.repeat(64),
  d=>d.protocolId='some-other-design',
  d=>d.physicalValidation='validated',
  d=>d.physicalVerdict='pass',
  d=>d.realWorldBuildSuccessPercent=99
 ]){
  const d=template();change(d);
  assert.ok(preflight(d).blockers.length>0,'No silent eligibility for a forged packet');
 }
});
test('A wholly forged PERFECT 1024-vector capture still cannot validate silicon',()=>{
 const fictional=completeFakeCapture(),report=preflight(fictional);
 assert.equal(report.modelsAgreed,1024);
 assert.equal(report.modelsDisagreed,0);
 assert.equal(report.candidateAgreementFraction,1);
 assert.equal(report.status,'candidate-awaiting-external-review');
 assert.equal(report.readyForIndependentReview,true);
 assert.equal(report.requiresIndependentOriginAudit,true);
 assert.equal(report.needsSeparateLotWaferHoldouts,true);
 assert.equal(report.physicalValidation,'none');
 assert.equal(report.physicalVerdict,'unknown');
 assert.equal(report.realWorldBuildSuccessPercent,null);
});
test('Any deliberately wrong digital observation must be retained and flagged',()=>{
 const f=completeFakeCapture();
 f.observations[42].measuredY^=1;
 const r=preflight(f);
 assert.equal(r.modelsAgreed,1023);
 assert.equal(r.modelsDisagreed,1);
 assert.equal(r.status,'observed-functional-mismatch-unverified');
 assert.ok(r.blockers.some(x=>x.includes('functional mismatch')));
 assert.equal(r.physicalValidation,'none');
});
test('Missing/partial output and nonphysical delay are not compared as genuine readings',()=>{
 for(const change of [
  d=>d.observations[0].measuredCarry=null,
  d=>d.observations[0].measuredY=256,
  d=>d.observations[0].measuredDelayS=-1,
  d=>d.observations[0].measuredDelayS=NaN,
  d=>d.observations[0].measuredZero='1'
 ]){
  const f=completeFakeCapture();change(f);
  const r=preflight(f);
  assert.ok(r.blockers.length>0);
  assert.equal(r.physicalValidation,'none');
 }
});
test('Expiring certificates and absent traceability block preflight despite perfect results',()=>{
 for(const change of [
  d=>d.acquisition.instrument.calibrationValidUntil='2026-01-01T00:00:00Z',
  d=>d.acquisition.instrument.calibrationCertificateSha256=null,
  d=>d.acquisition.sourceInstrumentFileSha256=null,
  d=>d.device.lotId=null,
  d=>d.device.maskDesignRecordSha256=null,
  d=>d.acquisition.independentReviewRecordSha256=null,
  d=>d.conditions.supplyV=-1
 ]){
  const f=completeFakeCapture();change(f);
  const r=preflight(f);
  assert.equal(r.readyForIndependentReview,false);
  assert.ok(r.blockers.length>0);
 }
});
test('Unsupported claims and self-declared provenance never change physical status',()=>{
 const f=completeFakeCapture();
 f.origin='synthetic-test-fixture';
 f.physicalValidation='full';
 f.physicalVerdict='pass';
 f.realWorldBuildSuccessPercent=100;
 const r=preflight(f);
 assert.equal(r.readyForIndependentReview,false);
 assert.ok(r.blockers.some(x=>x.includes('Computational fixture')));
 assert.equal(r.physicalValidation,'none');
 assert.equal(r.physicalVerdict,'unknown');
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
