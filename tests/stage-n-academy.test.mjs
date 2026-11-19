import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ACADEMY_MISSIONS,missionStatus,academyProgress}
 from '../js/scene/stage-n-academy.js';
test('All five missions stay ordered with checkable solver requirements',()=>{
 assert.deepEqual(ACADEMY_MISSIONS.map(x=>x.id),[
  'cmos-inverter','multi-radix-adder','riscv-alu','systolic-tpu','quantum-bell']);
 assert.ok(ACADEMY_MISSIONS.every(x=>x.requiredChecks.length>=3));
});
test('Missing or forged physics results cannot unlock later missions',()=>{
 const diagram={lab:'chip',blocks:[{id:'p'}],wires:[],issues:()=>[]};
 assert.equal(missionStatus('cmos-inverter',{diagram}).status,'AWAITING_REPLAYABLE_SOLVER_CHECKS');
 assert.equal(missionStatus('cmos-inverter',{diagram,solverResult:{ok:true}}).nextUnlocked,false);
 const mission=ACADEMY_MISSIONS[0];
 const checks=Object.fromEntries(mission.requiredChecks.map(k=>[k,{verdict:'PASS',replayVerified:true}]));
 const answer=academyProgress(mission.id,{diagram,solverResult:{ok:true,solverId:mission.solver,checks},
  hardwareEvidence:{independentlyAuthenticated:true}});
 assert.equal(answer.nextUnlocked,false);
 assert.equal(answer.status,'AWAITING_INDEPENDENT_EVIDENCE_REVIEW');
});
test('Invalid canonical diagram, missing parts, wrong lab and unknown mission fail',()=>{
 assert.equal(missionStatus('quantum-bell',{diagram:{lab:'chip',blocks:[],wires:[]}}).nextUnlocked,false);
 assert.equal(missionStatus('cmos-inverter',{diagram:{lab:'chip',blocks:[{}],wires:[],issues:()=>['bad']}}).status,
  'INVALID_CANONICAL_DESIGN');
 assert.throws(()=>missionStatus('fake'));
});
