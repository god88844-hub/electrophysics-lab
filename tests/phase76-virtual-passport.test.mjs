import {test} from 'node:test';
import assert from 'node:assert/strict';
import {wilson95,makeLevel1Passport,PHASE76_FORMAT}
 from '../js/evidence/phase76-virtual-passport.js';
import {PHASE75_FORMAT} from '../js/evidence/phase75-monte-carlo.js';
import {PHASE74_FORMAT} from '../js/evidence/phase74-noise-margins.js';
const monteCarlo={format:PHASE75_FORMAT,status:'UNVERIFIED_STATISTICS',
 trials:1000,trialCount:1000,passed:980,failed:20,invalid:0};
const noiseMargin={format:PHASE74_FORMAT,status:'MODEL_WINDOW_PASS',
 foundryCalibrated:false,marginByState:[
  {state:0,marginV:.2},{state:1,marginV:.2},{state:2,marginV:.2},{state:3,marginV:.2}]};
test('Wilson 95% interval uses actual survival counts, including extreme bounds',()=>{
 const all=wilson95(1000,1000),none=wilson95(0,1000);
 assert.ok(all.lower>.996&&all.upper===1);
 assert.ok(none.lower===0&&none.upper<.004);
 const x=wilson95(980,1000);assert.ok(x.lower<.98&&x.upper>.98);
 assert.throws(()=>wilson95(101,100));
});
test('Q4 1000-run unverified data NEVER becomes a manufactured success percent',()=>{
 const p=makeLevel1Passport({designId:'q4-alu8',modelIdentifiers:['sky130_nfet_lvt'],
  monteCarlo,noiseMargin,layout:{drcClean:false,lvsMatched:null}});
 assert.equal(p.format,PHASE76_FORMAT);
 assert.equal(p.status,'VIRTUAL_FAIL');
 assert.equal(p.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(p.confidence95Percent,null);
 assert.equal(p.level2PhysicalSignoff,'NO_GO_MISSING_REAL_SILICON_EVIDENCE');
 assert.equal(p.physicallyQualified,false);
});
test('even asserted review, calibrated flag and matching hashes cannot self-certify',()=>{
 const p=makeLevel1Passport({designId:'q4-alu4',
  modelIdentifiers:['sky130_nfet_lvt'],monteCarlo,
  noiseMargin:{...noiseMargin,foundryCalibrated:true},
  layout:{drcClean:true,lvsMatched:true,postLayoutNoiseVerified:true,sourceAuthenticated:true},
  statisticalCalibration:{independentlyVerified:true,modelSha256s:['a'.repeat(64)],
   approvalId:'self-declared'},
  independentReview:{authenticated:true,siliconHoldoutAuthenticated:true}});
 assert.equal(p.status,'INSUFFICIENT_MODEL_DATA');
 assert.ok(p.reasons.includes('no-trusted-statistical-calibration-approval'));
 assert.equal(p.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.ok(p.unqualifiedTrialSurvivalDiagnostic.interval.lower<.98);
 assert.ok(p.unqualifiedTrialSurvivalDiagnostic.interval.upper>.98);
});
test('passport deterministic JSON, no synthetic survival percentage',()=>{
 const args={designId:'binary-alu4',modelIdentifiers:['deviceB','deviceA'],
  monteCarlo:{...monteCarlo,status:'SYNTHETIC_TEST_ONLY'},noiseMargin,
  layout:{drcClean:null,lvsMatched:null}};
 const x=makeLevel1Passport(args);
 assert.equal(JSON.stringify(x),JSON.stringify(makeLevel1Passport(args)));
 assert.equal(x.status,'INSUFFICIENT_MODEL_DATA');
 assert.ok(x.reasons.includes('synthetic-trials-are-not-physical-yield-data'));
 assert.equal(x.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
});
