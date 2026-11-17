import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyPolicy,blankCampaign,fitUntrustedCampaign,syntheticFixture} from '../js/evidence/phase60-calibration.js';
const p=JSON.parse(readFileSync(new URL('../benchmarks/phase60/accelerator-calibration-policy.json',import.meta.url)));
test('Original physical hardware campaign remains unmeasured',()=>{
 assert.ok(verifyPolicy(p).totalCycles>0);
 assert.equal(blankCampaign(p).originalPhysicalRows.length,0);
 assert.equal(fitUntrustedCampaign(p).conditionalModelFit,null);
});
test('Train-only regression and disjoint holdout metrics are computed conditionally',()=>{
 const r=fitUntrustedCampaign(p,syntheticFixture());
 assert.equal(r.conditionalModelFit.trainDeviceCount,2);
 assert.equal(r.conditionalHoldoutMetrics.holdoutDeviceCount,2);
 assert.equal(r.independentlyAuthenticatedRows,0);
 assert.equal(r.physicalVerdict,'unknown');
});
test('Changing held-out data cannot affect fitted calibration factor',()=>{
 const a=syntheticFixture(),b=structuredClone(a);
 b.rows.find(x=>x.split==='holdout').observedLatencyUs=10000;
 const x=fitUntrustedCampaign(p,a),y=fitUntrustedCampaign(p,b);
 assert.equal(x.conditionalModelFit.latencyMultiplier,y.conditionalModelFit.latencyMultiplier);
 assert.notEqual(x.conditionalHoldoutMetrics.maeUs,y.conditionalHoldoutMetrics.maeUs);
});
test('Sample leakage, impossible power and forged qualification fail closed',()=>{
 for(const change of [x=>x.rows[2].deviceId=x.rows[0].deviceId,
  x=>x.rows[0].observedPowerW=-1,
  x=>x.rows[0].observedLatencyUs=Infinity,
  x=>x.origin='independently-approved-physical',
  x=>x.modelDigestSHA256='0'.repeat(64),
  x=>x.rows.pop(),x=>x.realWorldBuildSuccessPercent=99]){
  const c=syntheticFixture();change(c);assert.throws(()=>fitUntrustedCampaign(p,c));
 }
});
test('Cannot fabricate original measurements by editing frozen policy',()=>{
 for(const change of [x=>x.originalExternallyAuthenticatedHardwareRows=4,
  x=>x.sourceMatchedPhysicalDevices=4,x=>x.physicalValidation='pass',
  x=>x.holdoutCannotBeUsedForFit=false]){
  const q=structuredClone(p);change(q);assert.throws(()=>verifyPolicy(q));
 }
});