import {test} from 'node:test';
import assert from 'node:assert/strict';
import {optimizeCandidatePopulation,evaluateOptimizerConstraints,syntheticOptimizationFixture}
 from '../js/scene/stage-o-yield-optimizer.js';
import {generateTopologyCandidates} from '../js/scene/stage-o-topology-search.js';
test('seeded constrained optimizers replay identically without calibrated silicon yield',async()=>{
 const input={seed:88,generations:3,populationSize:12,radix:4,width:8,
  evaluateCandidate:async c=>syntheticOptimizationFixture(c),
  constraints:{minFrequencyHz:3e7,maxPowerW:.12,maxTemperatureC:140,
   maxAreaUm2:10000,minNoiseMarginV:.1,requireDrc:true}};
 const a=await optimizeCandidatePopulation(input);
 const b=await optimizeCandidatePopulation(input);
 assert.equal(JSON.stringify(a),JSON.stringify(b));
 assert.equal(a.evaluated,36);
 assert.equal(a.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(a.qualifiedYieldTargetReached,false);
 assert.equal(a.best?.metrics?.fixture,'SYNTHETIC_ONLY');
});
test('DRC, temperature and power hard constraints reject stress-unsafe designs',()=>{
 const c=generateTopologyCandidates({seed:1,count:1}).candidates[0];
 const r=evaluateOptimizerConstraints(c,{frequencyHz:1e9,powerW:5,temperatureC:200,
  areaUm2:100,noiseMarginV:.01,drcPassed:false},{maxPowerW:1,maxTemperatureC:100,
  minNoiseMarginV:.2});
 assert.equal(r.status,'MODEL_CONSTRAINT_FAIL');
 assert.ok(r.reasons.includes('drc-not-confirmed'));
 assert.ok(r.reasons.includes('thermal-exceeds-limit'));
 assert.equal(r.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
});
test('a self-declared >92% cannot become calibrated yield; missing physics stays unknown',()=>{
 const c=generateTopologyCandidates({seed:5,count:1}).candidates[0];
 const r=evaluateOptimizerConstraints(c,{frequencyHz:1e8,powerW:.01,temperatureC:40,
  areaUm2:100,noiseMarginV:.5,drcPassed:true,
  calibratedFoundryYieldVerified:true,simulatedBuildSuccessPercent:98},{
  maxPowerW:.1,maxTemperatureC:80,minNoiseMarginV:.3});
 assert.equal(r.status,'MODEL_FEASIBLE_CALIBRATION_REVIEW_REQUIRED');
 assert.equal(r.calibratedYieldAuthenticated,false);
 assert.equal(r.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 const missing=evaluateOptimizerConstraints(c,{frequencyHz:1e8});
 assert.equal(missing.status,'INSUFFICIENT_MODEL_DATA');
});
