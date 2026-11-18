import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seededUniformGenerator,drawProcessTrial,runFoundryMonteCarlo,
 TEMPERATURE_CORNERS} from '../js/evidence/phase75-monte-carlo.js';
const variation={vthSigmaV:.03,oxideSigmaFraction:.02,lengthSigmaFraction:.02,
 widthSigmaFraction:.02,sourceRecord:'synthetic exercise values NOT from foundry characterization'};
const config={seed:4242,trials:1000,variation,concurrency:8,exe:null,
 makeDeck:p=>'* synthetic test-only trial deck '+p.index+'\nV1 a 0 1\nR1 a 0 1000\n.end',
 maximumDelayS:2e-9,maximumStaticPowerW:1e-3,maximumDynamicPowerW:1e-3,
 _syntheticTrialRunner:async({process})=>({status:'ok',code:0,
  fullText:'mvl_delay_s = '+(process.index%7===0?3e-9:1e-9)+
    '\nmvl_static_power_w = 0.0001\nmvl_dynamic_power_w = 0.0005\n'})};
test('reproducible seed and cross-platform fixed per-die variation',()=>{
 assert.equal(seededUniformGenerator(42)(),seededUniformGenerator(42)());
 assert.deepEqual(drawProcessTrial({seed:9,index:8,variation}),
  drawProcessTrial({seed:9,index:8,variation}));
 assert.notDeepEqual(drawProcessTrial({seed:9,index:8,variation}),
  drawProcessTrial({seed:10,index:8,variation}));
});
test('1000 trial deterministic scheduling, temperature coverage and trial outcomes',async()=>{
 const a=await runFoundryMonteCarlo(config);
 const b=await runFoundryMonteCarlo({...config,concurrency:2});
 assert.deepEqual(a,b);
 assert.equal(a.outcomes.length,1000);
 assert.deepEqual(a.temperaturesC,TEMPERATURE_CORNERS);
 for(const tempC of TEMPERATURE_CORNERS)assert.equal(a.outcomes.filter(r=>r.tempC===tempC).length,250);
 assert.equal(a.passed+a.failed+a.invalid,1000);
 assert.equal(a.status,'SYNTHETIC_TEST_ONLY');
 assert.equal(a.realWorldBuildSuccessPercent,null);
 assert.equal(a.variationIndependentlyCalibrated,false);
});
test('reject fabricated small-sample yield or missing device distributions',async()=>{
 await assert.rejects(runFoundryMonteCarlo({...config,trials:999}),/N>=1000/);
 const missing=await runFoundryMonteCarlo({...config,variation:null});
 assert.equal(missing.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(missing.trialCount,0);
});
test('missing SPICE metrics are not mistaken for passing die trials',async()=>{
 const r=await runFoundryMonteCarlo({...config,
  _syntheticTrialRunner:async()=>({status:'ok',code:0,fullText:'mvl_delay_s = 1e-9'})});
 assert.equal(r.invalid,1000);
 assert.equal(r.status,'INSUFFICIENT_MODEL_DATA');
});
