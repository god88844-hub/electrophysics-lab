import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {planGoal} from '../js/scene/stage-o-agent-tools.js';
import {generateTopologyCandidates,exploreTopologies}
 from '../js/scene/stage-o-topology-search.js';
import {stressScenario,diagnoseStressSample} from '../js/scene/stage-o-stress-diagnosis.js';
import {optimizeCandidatePopulation,syntheticOptimizationFixture}
 from '../js/scene/stage-o-yield-optimizer.js';
import {makeLevel1Passport} from '../js/evidence/phase76-virtual-passport.js';
test('cross-phase deterministic Q4 invention pipeline never self-certifies wafer yield',async()=>{
 const plan=planGoal('low-power Q4 half-adder with >300 mV noise margin on SKY130');
 assert.equal(plan.status,'EVIDENCE_REQUIRED');
 const candidates=generateTopologyCandidates({seed:84,count:10,radix:4,width:4});
 const searched=await exploreTopologies({candidates:candidates.candidates});
 assert.equal(searched.spiceEvaluated,0);
 const worst=diagnoseStressSample({scenario:stressScenario({kind:'supply-droop',
  amplitude:.42,temperatureC:95,corner:'ss'}),
  sample:{node:'q4_carry_mid',expected:2.2,observed:1.78,status:'ready',unit:'V'},
  nodeLimits:{q4_carry_mid:{minimum:1.842,maximum:2.52,unit:'V'}}});
 assert.equal(worst.status,'MODELED_LIMIT_VIOLATION');
 const options={seed:84,generations:2,populationSize:8,
  evaluateCandidate:async c=>syntheticOptimizationFixture(c),
  constraints:{maxPowerW:.2,maxTemperatureC:130,maxAreaUm2:100000}};
 const optimized=await optimizeCandidatePopulation(options);
 assert.equal(JSON.stringify(optimized),JSON.stringify(await optimizeCandidatePopulation(options)));
 assert.equal(optimized.physicalValidation,'none');
 const passport=makeLevel1Passport({designId:'q4-gate-4bit',
  modelIdentifiers:['sky130_nfet_lvt'],
  monteCarlo:null,noiseMargin:null,layout:null});
 assert.equal(passport.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(passport.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(optimized.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
});
test('1000-die synthetic benchmark can improve toy survival but cannot claim calibrated hardware',()=>{
 const script=fileURLToPath(new URL('../scripts/stage-o-synthetic-benchmark.mjs',import.meta.url));
 const a=spawnSync(process.execPath,[script],{encoding:'utf8',timeout:45000});
 assert.equal(a.status,0,a.stderr);
 const b=spawnSync(process.execPath,[script],{encoding:'utf8',timeout:45000});
 assert.equal(b.status,0,b.stderr);
 assert.equal(a.stdout,b.stdout);
 const data=JSON.parse(a.stdout);
 assert.ok(data.initialSyntheticSurvivalPercent<60);
 assert.ok(data.optimizedSyntheticSurvivalPercent>92);
 assert.equal(data.fixture,'SYNTHETIC_ONLY');
 assert.equal(data.calibratedFoundryYieldVerified,false);
 assert.equal(data.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(data.productionReleaseAuthorized,false);
});
