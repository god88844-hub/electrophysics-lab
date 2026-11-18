import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadSourceManifest} from '../js/evidence/phase73-pdk-provenance.js';
import {inspectStageMReadiness,assessStageMMatrix}
 from '../js/evidence/stage-m-signoff-readiness.js';
test('all original PDK/width/radix cases require independently calibrated process statistics',async()=>{
 const m=await loadSourceManifest();
 const report=assessStageMMatrix(m);
 assert.equal(report.cases.length,12);
 assert.equal(report.qualified,0);
 assert.equal(report.allLevel1Calibrated,false);
 assert.equal(report.physicalReleaseAllowed,false);
 assert.ok(report.cases.every(x=>x.status==='INSUFFICIENT_MODEL_DATA'));
 assert.ok(report.cases.every(x=>x.simulatedPhysicalBuildSuccessPercent==='UNKNOWN'));
 assert.ok(report.cases.every(x=>x.passport.level2PhysicalSignoff.startsWith('NO_GO')));
 assert.deepEqual(report,assessStageMMatrix(m));
});
test('SKY130 core Q4 is remapped to 0/.6/1.2/1.8V; +10% ripple still exceeds 1.95V SOA',async()=>{
 const m=await loadSourceManifest();
 const x=inspectStageMReadiness({manifest:m,foundry:'SKY130',radix:4,width:8});
 assert.deepEqual(x.railsV,[0,.6,1.2,1.8]);
 assert.ok(Math.abs(x.soAMaximumRippleRailsV.at(-1)-1.98)<1e-12);
 assert.equal(x.soa.status,'SOA_OXIDE_OVERSTRESS');
 assert.ok(x.blockers.includes('SOA_OXIDE_OVERSTRESS'));
 assert.deepEqual(x.rippleFractions,[-.1,0,.1]);
 assert.deepEqual(x.temperatureCornersC,[-40,25,85,125]);
 assert.ok(x.deviceEnvelopes.every(d=>d.nominalExceeded));
 assert.ok(x.blockers.includes('10-percent-supply-ripple-exceeds-declared-nominal-device-voltage'));
 assert.equal(x.passport.status,'INSUFFICIENT_MODEL_DATA');
});
test('forged or synthetic 1000-trial evidence cannot self-certify virtual or physical passport',async()=>{
 const m=await loadSourceManifest();
 const fake={format:'invention-lab/phase75-parallel-monte-carlo-spice/1',
  status:'SYNTHETIC_TEST_ONLY',trials:1000,trialCount:1000,
  passed:940,failed:60,invalid:0};
 const x=inspectStageMReadiness({manifest:m,radix:4,monteCarlo:fake,
  noiseMargin:{foundryCalibrated:true,
   format:'invention-lab/phase74-mvl-noise-crosstalk/1',
   marginByState:[0,1,2,3].map(state=>({state,marginV:.5}))},
  layout:{drcClean:true,lvsMatched:true,
   postLayoutNoiseVerified:true,sourceAuthenticated:true},
  statisticalCalibration:{independentlyVerified:true,
   modelSha256s:['a'.repeat(64),'b'.repeat(64)],approvalId:'self-declared'},
  independentReview:{authenticated:true,siliconHoldoutAuthenticated:true}});
 assert.equal(x.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(x.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(x.passport.physicallyQualified,false);
 assert.equal(x.releaseAuthorized,false);
});

test('SKY130 thick-gate + GF180 Q4 map to genuine 3.3V MOS families without double ripple',async()=>{
 const manifest=await loadSourceManifest();
 const thick=inspectStageMReadiness({manifest,foundry:'SKY130',
  railProfileId:'sky130-thick-3v3',radix:4,width:4});
 assert.equal(thick.profileId,'sky130-thick-3v3');
 assert.deepEqual(thick.railsV,[0,1.1,2.2,3.3]);
 assert.deepEqual(thick.modelIdentifiers,[
  'sky130_nfet_g5v0d10v5','sky130_pfet_g5v0d10v5']);
 assert.equal(thick.soa.status,'SOA_PROFILE_SCREEN_PASS');
 assert.equal(thick.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 const gf=inspectStageMReadiness({manifest,foundry:'GF180MCU',
  railProfileId:'gf180-core-3v3',radix:4,width:8});
 assert.deepEqual(gf.railsV,[0,1.1,2.2,3.3]);
 assert.ok(Math.abs(gf.soAMaximumRippleRailsV.at(-1)-3.63)<1e-12);
 assert.equal(gf.soa.status,'SOA_PROFILE_SCREEN_PASS');
 assert.equal(gf.modelIdentifiers.length,2);
 assert.throws(()=>inspectStageMReadiness({manifest,
  foundry:'GF180MCU',railProfileId:'sky130-core-1v8'}));
});
