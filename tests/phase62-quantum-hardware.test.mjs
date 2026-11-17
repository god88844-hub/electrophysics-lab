import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {verifyPolicy,blankCampaign,screenCandidate,syntheticTestFixture} from '../js/evidence/phase62-quantum-hardware.js';
const policy=JSON.parse(readFileSync(new URL('../benchmarks/phase62/quantum-study-policy.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
test('Quantum experiment plan has 4 separate device slots, 16 unmeasured sessions',()=>{
 assert.equal(verifyPolicy(policy),true);
 const x=blankCampaign(policy);assert.equal(x.sessions.length,16);
 assert.equal(x.authenticatedPhysicalReadouts,0);
 assert.equal(screenCandidate(policy).conditionalTrainGamma,null);
 assert.equal(screenCandidate(policy).realWorldBuildSuccessPercent,null);
});
test('Synthetic laboratory return can be scored but not admitted',()=>{
 const {candidate,rawFiles}=syntheticTestFixture(),r=screenCandidate(policy,candidate,rawFiles);
 assert.equal(r.candidateRows,16);assert.equal(r.originalRawBytesMatched,16);
 assert.ok(r.conditionalTrainGamma>0&&r.conditionalTrainGamma<1);
 assert.ok(r.holdoutTotalVariationDistance>=0&&r.holdoutTotalVariationDistance<=1);
 assert.equal(r.originalHardwareReadoutsAdmitted,0);assert.equal(r.physicalVerdict,'unknown');
});
test('Holdout changes cannot contaminate train-only noise parameter',()=>{
 const a=syntheticTestFixture(),b=structuredClone(a);
 const target=b.candidate.sessions.find(s=>s.role==='holdout'&&s.circuitId==='plus');
 target.counts=[900,124];
 const raw=JSON.stringify({sessionId:target.sessionId,counts:target.counts});
 b.rawFiles[target.sessionId]=raw;target.rawMeasurementSha256=sha(raw);
 const x=screenCandidate(policy,a.candidate,a.rawFiles),y=screenCandidate(policy,b.candidate,b.rawFiles);
 assert.equal(x.conditionalTrainGamma,y.conditionalTrainGamma);
 assert.notEqual(x.holdoutTotalVariationDistance,y.holdoutTotalVariationDistance);
});
test('Tampered count, hashes, observation totals, identities, and claimed origins rejected',()=>{
 for(const change of [x=>x.candidate.sessions[0].counts[0]++,
  x=>x.candidate.sessions[0].rawMeasurementSha256='0'.repeat(64),
  x=>x.candidate.sessions[1].shots=2048,
  x=>x.candidate.sessions.reverse(),
  x=>x.candidate.origin='real-independent-hardware',
  x=>x.candidate.sessions[0].counts=[-1,1025]]){
  const x=syntheticTestFixture();change(x);assert.throws(()=>screenCandidate(policy,x.candidate,x.rawFiles));
 }
});
test('Frozen policy cannot accept unverifiable quantum measurements',()=>{
 for(const change of [x=>x.actualOriginalReadoutSessions=16,
  x=>x.independentReviewComplete=true,x=>x.trainAndHoldoutDeviceDisjoint=false,
  x=>x.physicalVerdict='pass']){
  const p=structuredClone(policy);change(p);assert.throws(()=>verifyPolicy(p));
 }
});