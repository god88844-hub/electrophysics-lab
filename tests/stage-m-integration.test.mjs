import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeVoltageRails,evaluateRadixAlu,PDK_SOURCES} from '../js/evidence/phase73-mvl-devices.js';
import {analyzeMvlNoiseMargins} from '../js/evidence/phase74-noise-margins.js';
import {runFoundryMonteCarlo} from '../js/evidence/phase75-monte-carlo.js';
import {makeLevel1Passport} from '../js/evidence/phase76-virtual-passport.js';
import {generateMvlStandardCellCandidates,inspectPostLayoutMvlCandidate}
 from '../js/evidence/phase77-mvl-layout.js';
test('Stage M: 4/8 digit binary, ternary, Q4 ALUs across 5 SKY130 corners stay only mathematical references',()=>{
 for(const corner of PDK_SOURCES.SKY130.supportedCorners)
  for(const width of [4,8])for(const base of [2,3,4]){
   const alu=evaluateRadixAlu({base,width,
    a:Array(width).fill(base-1),b:[...Array(width-1).fill(0),1],operation:'add'});
   assert.equal(alu.overflow,true,corner+'/'+base+'/'+width);
   assert.deepEqual(alu.digits,Array(width).fill(0));
   assert.equal(alu.physicalValidation,'none');
   const candidate=generateMvlStandardCellCandidates({base,width,corner});
   assert.equal(candidate.instances.length,width);
   assert.equal(candidate.extractedSPEF,null);
  }
});
test('Stage M: Q4 margins, 1000 synthetic die trials, and UNKNOWN passport cannot fabricate physical probability',async()=>{
 const rails=makeVoltageRails({base:4,maximumV:3.3});
 const states=[-.1,0,.1].flatMap(rippleFraction=>rails.rails.map((v,state)=>({
  rippleFraction,state,dcOutputV:[v-.01,v+.01],
  transientOutputV:[v-.02,v+.02],eyeOpeningV:.5
 })));
 const noise=analyzeMvlNoiseMargins({rails,states,minimumSafeMarginV:.1});
 assert.equal(noise.status,'MODEL_WINDOW_PASS');
 const variation={vthSigmaV:.015,oxideSigmaFraction:.02,lengthSigmaFraction:.02,
  widthSigmaFraction:.02,sourceRecord:'SYNTHETIC TEST ONLY'};
 const mc=await runFoundryMonteCarlo({seed:73,trials:1000,variation,
  exe:null,concurrency:8,maximumDelayS:1e-8,maximumStaticPowerW:1e-2,
  maximumDynamicPowerW:1e-2,
  makeDeck:()=>'* unit test only\nV1 a 0 1.1\nR1 a 0 1000\n.end',
  _syntheticTrialRunner:async()=>({status:'ok',code:0,
    fullText:'mvl_delay_s=3e-9\nmvl_static_power_w=0.0001\nmvl_dynamic_power_w=0.0002'})});
 assert.equal(mc.trials,1000);assert.equal(mc.status,'SYNTHETIC_TEST_ONLY');
 const layout=generateMvlStandardCellCandidates({base:4,width:8});
 const post=inspectPostLayoutMvlCandidate({candidate:layout,noise});
 assert.equal(post.status,'INSUFFICIENT_MODEL_DATA');
 const passport=makeLevel1Passport({designId:'stage-m-q4-alu8',
  modelIdentifiers:['sky130_nfet_lvt'],monteCarlo:mc,noiseMargin:noise,layout:post});
 assert.equal(passport.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(passport.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(passport.confidence95Percent,null);
 assert.equal(passport.productionReleaseAuthorized,false);
 assert.equal(passport.physicallyQualified,false);
});
