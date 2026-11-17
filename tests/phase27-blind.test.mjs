import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RTL_GIT_BLOB,SUITE_SHA256} from '../js/measure/phase24-prototype.js';
import {SHA,POLICY,verifyPlan,slots,sessions,predictionBundle,blankCapture,
 auditCandidate,strictReplay} from '../js/measure/phase27-blind.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase27/acceptance.json',import.meta.url)));
const frozen=predictionBundle(),predictions=frozen.outputs;
function fabricatedFixture(){
 // Synthetically fake perfect "hardware": a test for REJECTION of silicon claims.
 const f=blankCapture();f.origin='claimed-real-measurement';f.modelFreezeCommit='a'.repeat(40);
 f.calibrationUsedSlotIds=slots().filter(s=>s.role==='calibration').map(s=>s.slotId);
 for(const d of f.devices){
  d.lotId=d.group+'-fiction-lot';d.waferId=d.waferGroup+'-fiction-wafer';
  d.dieId=d.slotId+'-fiction-die';d.packageId=d.slotId+'-fiction-package';
  d.maskSha256='b'.repeat(64);d.foundryRecordSha256='c'.repeat(64);
 }
 const files={};
 for(const s of f.sessions){
  const raw=Buffer.from('UNIT TEST -- NOT REAL PHYSICAL INSTRUMENT -- '+s.sessionId);
  files[s.sessionId]=raw;
  s.observations=predictions.map(p=>({index:p.index,a:p.a,b:p.b,op:p.op,
   measuredY:p.y,measuredCarry:p.carry,measuredZero:p.zero,measuredDelayS:3e-9}));
  s.measuredAtUtc='2026-11-17T01:00:00Z';s.laboratory='fictional-test-not-real';
  s.instrumentSerial='unit-test-only';s.originalRawSha256=SHA(raw);
  s.calibrationCertificateSha256='d'.repeat(64);
  s.calibrationValidUntilUtc='2027-11-17T01:00:00Z';
  s.expandedTimingUncertaintyS=1e-9;s.inputSlewS=1e-10;
  s.loadCapacitanceF=1e-14;s.independentReviewer='fake-reviewer';
  s.reviewRecordSha256='e'.repeat(64);
 }
 return {capture:f,files};
}
test('Immutable prospective plan: two lots, eight unbuilt die slots, 48 sessions',()=>{
 assert.equal(verifyPlan(manifest),true);assert.deepEqual(manifest,POLICY);
 assert.equal(manifest.dieCount,8);assert.equal(slots().length,8);
 assert.equal(sessions().length,48);
 assert.equal(sessions().filter(x=>x.role==='holdout').length,24);
 assert.equal(new Set(sessions().map(x=>x.sessionId)).size,48);
 assert.equal(manifest.plannedMeasurements,49152);
 assert.equal(manifest.physicalVerdict,'unknown');
 assert.equal(manifest.realWorldBuildSuccessPercent,null);
});
test('Locked predictions are only digital reference outputs, never measured silicon delays',()=>{
 assert.equal(frozen.rtlBlob,RTL_GIT_BLOB);assert.equal(frozen.vectorsSha256,SUITE_SHA256);
 assert.equal(predictions.length,1024);
 assert.ok(predictions.every(x=>Number.isInteger(x.y)&&
  Number.isInteger(x.carry)&&Number.isInteger(x.zero)&&!('measuredDelayS' in x)));
 assert.equal(frozen.perVectorTimingPredictionsAvailable,false);
});
test('Blank original measurement package: zero real readings, fail closed without hardware',()=>{
 const blank=blankCapture(),report=auditCandidate(blank);
 assert.equal(blank.sessions.length,48);
 assert.ok(blank.sessions.every(s=>s.observations===null));
 assert.equal(report.status,'awaiting-real-hardware');
 assert.equal(report.observedVectors,0);assert.equal(report.sourceFilesMatched,0);
 assert.equal(report.physicalValidation,'none');
 assert.equal(report.physicalVerdict,'unknown');
 assert.equal(report.realWorldBuildSuccessPercent,null);
 assert.equal(strictReplay(manifest,blank,frozen,report).ok,true);
});
test('PERFECT 49,152 fabricated observations and forged hashes never become physical validation',()=>{
 const f=fabricatedFixture(),r=auditCandidate(f.capture,{rawFiles:f.files});
 assert.equal(r.status,'claimed-complete-needs-independent-origin-audit',r.errors.join('; '));
 assert.equal(r.errors.length,0);
 assert.equal(r.completeSessions,48);assert.equal(r.sourceFilesMatched,48);
 assert.equal(r.observedVectors,49152);assert.equal(r.claimedDigitalDisagreements,0);
 assert.equal(r.exploratoryDelayOverLimit,0);
 assert.equal(r.perfectSelfReportedCaptureIsNotPhysicalProof,true);
 assert.equal(r.independentFabAndInstrumentAttestationEstablished,false);
 assert.equal(r.physicalValidation,'none');
 assert.equal(r.realWorldBuildSuccessPercent,null);
});
test('The independent HOLDOUT LOT cannot be used in calibration or duplicated',()=>{
 const f=fabricatedFixture(),g=f.capture;
 g.calibrationUsedSlotIds.push('H-W1-D1');
 let r=auditCandidate(g,{rawFiles:f.files});
 assert.equal(r.status,'incomplete-or-inconsistent-candidate');
 assert.ok(r.errors.some(x=>/calibrat|validation/i.test(x)));
 g.calibrationUsedSlotIds.pop();
 for(const d of g.devices.filter(d=>d.group==='H'))d.lotId='C-fiction-lot';
 r=auditCandidate(g,{rawFiles:f.files});
 assert.ok(r.errors.some(x=>x.includes('holdout leakage')));
});
test('Changed physical session schedule, missing vector and forged instrument source fail',()=>{
 const f=fabricatedFixture(),g=f.capture;
 g.sessions[0].tempC=-40;
 let r=auditCandidate(g,{rawFiles:f.files});
 assert.ok(r.errors.some(x=>x.includes('Session schedule')));
 g.sessions[0].tempC=25;
 g.sessions[0].observations[7].op=3-g.sessions[0].observations[7].op;
 r=auditCandidate(g,{rawFiles:f.files});
 assert.ok(r.errors.some(x=>x.includes('replaced')));
 g.sessions[0].observations[7].op=predictions[7].op;
 delete f.files[g.sessions[0].sessionId];
 r=auditCandidate(g,{rawFiles:f.files});
 assert.ok(r.errors.some(x=>x.includes('instrument export')));
 assert.equal(r.physicalVerdict,'unknown');
});
test('Observed digital mismatch and long modeled-unverified timing never hide failures',()=>{
 const f=fabricatedFixture(),g=f.capture;
 g.sessions[0].observations[0].measuredY^=1;
 g.sessions[1].observations[1].measuredDelayS=30e-9;
 const r=auditCandidate(g,{rawFiles:f.files});
 assert.equal(r.status,'claimed-hardware-disagreement-needs-audit');
 assert.equal(r.claimedDigitalDisagreements,1);
 assert.equal(r.exploratoryDelayOverLimit,1);
 assert.equal(r.modeledPerVectorDelayErrorS,null);
 assert.equal(r.verifiedUncertaintyCoverage,null);
 assert.equal(r.physicalVerdict,'unknown');
});
test('No self-asserted qualification, expired certificates or altered frozen files allowed',()=>{
 const f=fabricatedFixture(),g=f.capture;
 g.physicalValidation='proven';g.physicalVerdict='pass';
 g.realWorldBuildSuccessPercent=100;
 g.sessions[0].calibrationValidUntilUtc='2025-11-17T01:00:00Z';
 const r=auditCandidate(g,{rawFiles:f.files});
 assert.ok(r.errors.some(x=>x.includes('self-authorize')));
 assert.ok(r.errors.some(x=>x.includes('Instrument/certificate')));
 const blank=blankCapture(),audit=auditCandidate(blank),altered=structuredClone(blank);
 altered.sessions[0].observations=[{}];
 assert.equal(strictReplay(manifest,altered,frozen,audit).ok,false);
 const pp=structuredClone(frozen);pp.outputs[0].y^=1;
 assert.equal(strictReplay(manifest,blank,pp,audit).ok,false);
});
test('Policy weakening and forged captured origin are always rejected',()=>{
 for(const mutate of [
  x=>x.wholeLotHoldout=false,x=>x.plannedMeasurements=0,
  x=>x.realALUMeasurements=49152,x=>x.qualifiedFoundrySignoff=true,
  x=>x.maxDigitalErrors=1024,x=>x.maxObservedDelaySForExploratoryPass=1,
  x=>x.perVectorTimingPredictionsAvailable=true,
  x=>x.realWorldBuildSuccessPercent=100
 ]){
  const p=structuredClone(manifest);mutate(p);
  assert.throws(()=>verifyPlan(p),/changed/);
 }
 const b=blankCapture();b.origin='synthetic';
 assert.ok(auditCandidate(b).errors.some(x=>x.includes('Synthetic')));
});
