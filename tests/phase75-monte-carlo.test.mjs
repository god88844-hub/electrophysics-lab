import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seededUniformGenerator,drawProcessTrial,runFoundryMonteCarlo,
 TEMPERATURE_CORNERS} from '../js/evidence/phase75-monte-carlo.js';
import {makeFoundryRailProfile} from '../js/evidence/phase73-soa.js';
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

test('1000 genuine-runner-bound PDK trials are rejected pre-SPICE if their transistor rails violate SOA',async()=>{
 const profile=makeFoundryRailProfile({id:'sky130-core-1v8'});
 const model='sky130_fd_pr__nfet_01v8';
 let mockedRuns=0;
 const unsafe='* 3.3V foundry rail must never be simulated\n'+
  '.lib "/pinned/sky130.lib.spice" tt\n'+
  'VDD d 0 3.3\nVG g 0 1.8\n'+
  'Xn d g 0 0 '+model+' w=1 l=0.15\n.end\n';
 const outcome=await runFoundryMonteCarlo({...config,
  makeDeck:()=>unsafe,soaNetlist:{profile,devices:[{instance:'Xn',model,
   samples:[{gateV:1.8,drainV:1.8,sourceV:0,bodyV:0}]}]},
  _syntheticTrialRunner:async()=>{mockedRuns++;throw Error('must not run');}});
 assert.equal(outcome.invalid,1000);
 assert.equal(outcome.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(mockedRuns,0);
 assert.ok(outcome.outcomes.every(x=>x.reason==='SOA_OXIDE_OVERSTRESS'));
 assert.equal(outcome.realWorldBuildSuccessPercent,null);
});
test('any PDK deck without four-terminal node inventory is invalid before mocked runner',async()=>{
 let spawned=0;
 const result=await runFoundryMonteCarlo({...config,
  makeDeck:()=>'.lib "/pinned/sky130.lib.spice" tt\n'+
   'Xn d g 0 0 sky130_fd_pr__nfet_01v8 w=1 l=0.15\n.end',
  soaNetlist:null,
  _syntheticTrialRunner:async()=>{spawned++;return {status:'ok',code:0};}});
 assert.equal(spawned,0);
 assert.equal(result.invalid,1000);
 assert.ok(result.outcomes.every(x=>x.reason==='SOA_INSUFFICIENT_NODE_BOUNDS'));
});
