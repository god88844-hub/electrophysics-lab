import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stressScenario,makeStressSuite,diagnoseStressSample,
 runAdversarialStressSuite} from '../js/scene/stage-o-stress-diagnosis.js';
test('five adversarial conditions are reproducible and model-only',()=>{
 const a=makeStressSuite({seed:84});
 assert.equal(a.scenarios.length,5);
 assert.deepEqual(a,makeStressSuite({seed:84}));
 assert.deepEqual(a.scenarios.map(x=>x.kind),[
  'supply-droop','thermal-hotspot','clock-skew','crosstalk-burst','quantum-gate-noise']);
 assert.ok(a.scenarios.every(x=>x.physicalValidation==='none'));
});
test('diagnosis pins explicit Q4 midpoint voltage failure to a 3D node',()=>{
 const scenario=stressScenario({kind:'supply-droop',amplitude:.42,
  corner:'ss',temperatureC:95,targetNode:'q4_carry_mid'});
 const diagnostic=diagnoseStressSample({
  scenario,sample:{node:'q4_carry_mid',expected:2.20,observed:1.78,unit:'V',status:'ready'},
  nodeLimits:{q4_carry_mid:{minimum:1.842,maximum:2.52,unit:'V'}},
  sceneLocations:{q4_carry_mid:{xMm:12,yMm:2,zMm:5}}});
 assert.equal(diagnostic.status,'MODELED_LIMIT_VIOLATION');
 assert.ok(Math.abs(diagnostic.magnitude-.062)<1e-12);
 assert.deepEqual(diagnostic.coordinates,{xMm:12,yMm:2,zMm:5});
 assert.match(diagnostic.diagnostic,/95 °C/);
 assert.match(diagnostic.diagnostic,/0.0620 V/);
 assert.equal(diagnostic.observedPhysicalFailure,false);
});
test('missing solver and claimed quantum noise cannot fabricate diagnoses',async()=>{
 const scenario=stressScenario({kind:'quantum-gate-noise',amplitude:.03});
 assert.equal(diagnoseStressSample({scenario,sample:null}).status,'INSUFFICIENT_SOLVER_DATA');
 assert.equal((await runAdversarialStressSuite({scenarios:[scenario]})).status,'INSUFFICIENT_SOLVER_DATA');
 assert.throws(()=>stressScenario({kind:'quantum-gate-noise',amplitude:1.2}));
});
