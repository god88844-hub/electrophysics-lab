// Phase 13 acceptance tests are SYNTHETIC NEGATIVE CONTROLS ONLY.
// They do not supply fabricated tool evidence, measurement, STA or DRC.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  PHYSICAL_STAGES,REQUIRED_STAGE_STATUS,evaluatePhase13Evidence,
  describePhysicalReadiness
} from '../js/evidence/physical-readiness.js';
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase13/acceptance.json',import.meta.url),'utf8'));
const SHA='a'.repeat(64);
function fixture(){
 const stage=[{
  id:'rtl-exhaustive',status:'pass',basis:'exhaustive-simulation',evidenceSha256:SHA,physicalEvidence:false
 },{
  id:'rtl-formal-equivalence',status:'pass',basis:'formal-rtl-equivalence',evidenceSha256:SHA,physicalEvidence:false
 },{
  id:'sky130-stdcell-mapping',status:'pass',basis:'open-standard-cell-liberty',evidenceSha256:SHA,physicalEvidence:false
 },...PHYSICAL_STAGES.slice(3).map(id=>({
  id,status:'unknown',basis:'not-run',evidenceSha256:null,physicalEvidence:false
 }))];
 return {
  format:'invention-lab/phase13-sky130-evidence/1',verdict:'pass',commitSha:'synthetic-unit-fixture',
  libertyGitBlobSha1:'5773657fe730d984ac06726d0addfdad80395b9b',
  libertySizeBytes:12800135,libertyCorner:'tt_025C_1v80',
  libertySha256:SHA,rtlSha256:SHA,specSha256:SHA,testbenchSha256:SHA,
  badSpecSha256:SHA,exhaustiveLogSha256:SHA,formalLogSha256:SHA,
  negativeControlLogSha256:SHA,mappingLogSha256:SHA,netlistSha256:SHA,
  versions:{yosys:'Yosys synthetic-gate-test-only',iverilog:'Icarus synthetic',os:'ubuntu-24.04'},
  exhaustive:{expectedVectors:262144,testedVectors:262144,failed:0},
  formal:{checked:true,assertion:'equiv_status -assert',negativeControlRejected:true},
  mapping:{technique:'Yosys ABC Liberty technology mapping',
     library:'sky130_fd_sc_hd__tt_025C_1v80.lib',corner:'tt_025C_1v80',
     mappedCells:19,cellTypes:['sky130_fd_sc_hd__and2_1','sky130_fd_sc_hd__xor2_1']},
  stages:stage,physicalValidation:'none',physicalVerdict:'unknown',
  physicalQualified:false,realWorldBuildSuccessPercent:null
 };
}
const gate=(v,m=manifest)=>evaluatePhase13Evidence(m,v,{commitSha:'synthetic-unit-fixture',libertySha256:SHA});
test('Phase 13 strict ladder accepts only 3 computational stages and 7 unknown physical stages',()=>{
 assert.deepEqual(manifest.requiredStatus,REQUIRED_STAGE_STATUS);
 assert.equal(PHYSICAL_STAGES.length,10);
 const outcome=gate(fixture());
 assert.equal(outcome.ok,true,outcome.errors.join('; '));
 assert.equal(outcome.computationalStagesPassed,3);
 assert.equal(outcome.physicalStagesPassed,0);
 assert.equal(outcome.physicalQualified,false);
 assert.equal(outcome.physicalVerdict,'unknown');
 assert.equal(outcome.realWorldBuildSuccessPercent,null);
});
test('Phase 13 empty evidence can never be PASS or prove physical safety',()=>{
 const gateValue=evaluatePhase13Evidence(manifest,null);
 assert.equal(gateValue.ok,false);
 const state=describePhysicalReadiness(null);
 assert.equal(state.physicalQualified,false);
 assert.equal(state.verdict,'unknown');
 assert.equal(state.realWorldBuildSuccessPercent,null);
});
test('Phase 13 strict manifest cannot change PDK corner/blob/source size/exhaustive scope',()=>{
 for(const mutate of [
   m=>m.library.corner='ss_100C_1v60',
   m=>m.library.gitBlobSha1='b'.repeat(40),
   m=>m.library.upstreamCommit='b'.repeat(40),
   m=>m.library.bytes=99,
   m=>m.library.license='unknown',
   m=>m.library.productionQualified=true,
   m=>m.example.fullyEnumeratedInputs=100,
   m=>m.maxMappedCells=1000000,
   m=>m.requiredStatus['drc']='pass',
   m=>m.physicalVerdict='pass',
   m=>m.realWorldBuildSuccessPercent=99
 ]){
   const copy=structuredClone(manifest);mutate(copy);
   assert.equal(gate(fixture(),copy).ok,false);
 }
});
test('Phase 13 no missing, stale, fake or zero-cell tool evidence may pass',()=>{
 for(const mutate of [
  r=>r.commitSha='old',r=>r.versions.os='windows',
  r=>r.versions.yosys='fake',
  r=>r.libertySha256='b'.repeat(64),
  r=>r.libertyGitBlobSha1='0'.repeat(40),
  r=>r.formal.checked=false,
  r=>r.formal.negativeControlRejected=false,
  r=>r.formal.assertion='none',
  r=>r.exhaustive.testedVectors=262143,
  r=>r.exhaustive.failed=1,
  r=>r.mapping.mappedCells=0,
  r=>r.mapping.cellTypes=['unverified_fake_cell'],
  r=>r.mapping.corner='ff_-40C_1v95',
  r=>r.formalLogSha256='missing',
  r=>r.netlistSha256='no-netlist'
 ]){
   const r=fixture();mutate(r);
   assert.equal(gate(r).ok,false);
 }
});
test('Phase 13 mapping success cannot become DRC/LVS/STA/PVT/prototype or silicon PASS',()=>{
 for(const mutate of [
  r=>r.stages[3].status='pass',
  r=>r.stages[6].status='pass',
  r=>r.stages[7].status='pass',
  r=>r.stages[8].physicalEvidence=true,
  r=>r.stages[9].basis='guessed',
  r=>r.stages[5].evidenceSha256=SHA,
  r=>r.physicalValidation='verified',
  r=>r.physicalVerdict='pass',
  r=>r.physicalQualified=true,
  r=>r.realWorldBuildSuccessPercent=100,
 ]){
  const r=fixture();mutate(r);
  assert.equal(gate(r).ok,false);
 }
});
test('Phase 13 reordered, extra or falsely passing hardware stage fails',()=>{
 for(const mutate of [
  r=>r.stages.pop(),
  r=>r.stages.push(r.stages[1]),
  r=>r.stages.reverse(),
  r=>r.stages[0].basis='manufactured',
  r=>r.stages[0].evidenceSha256=null,
 ]){
  const r=fixture();mutate(r);
  assert.equal(gate(r).ok,false);
 }
});
test('Phase 13 untrusted report cannot self-certify any independently verified hardware proof',()=>{
 const view=describePhysicalReadiness(fixture());
 assert.deepEqual(view.reportedComputationalStages,PHYSICAL_STAGES.slice(0,3));
 assert.deepEqual(view.verifiedComputationalStages,[]);
 assert.equal(view.missingPhysicalStages.length,7);
 assert.equal(view.physicalQualified,false);
 assert.equal(view.realWorldBuildSuccessPercent,null);
 const forged=fixture();
 forged.stages[8].status='pass';
 const displayed=describePhysicalReadiness(forged);
 assert.equal(displayed.physicalQualified,false);
 assert.deepEqual(displayed.verifiedComputationalStages,[]);
});
