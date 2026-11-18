import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateMvlStandardCellCandidates,inspectPostLayoutMvlCandidate}
 from '../js/evidence/phase77-mvl-layout.js';
test('4/8-digit Q4 and ternary functional cell candidates are deterministic',()=>{
 for(const base of [2,3,4])for(const width of [4,8]){
  const x=generateMvlStandardCellCandidates({base,width});
  assert.deepEqual(x,generateMvlStandardCellCandidates({base,width}));
  assert.equal(x.instances.length,width);
  assert.equal(x.cells.length,4);
  assert.equal(x.technologyStage,'abstract-logical-cell-floorplan-not-a-foundry-layout');
  assert.equal(x.cells[0].spiceNetlist,null);
  assert.equal(x.drcReport,null);assert.equal(x.lvsReport,null);
 }
});
test('missing extracted parasitics, rule deck and LVS refuse qualification',()=>{
 const candidate=generateMvlStandardCellCandidates();
 const noise={marginByState:[{state:0,marginV:.52},{state:1,marginV:.51},
  {state:2,marginV:.5},{state:3,marginV:.52}]};
 const r=inspectPostLayoutMvlCandidate({candidate,noise});
 assert.equal(r.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(r.drcClean,null);assert.equal(r.lvsMatched,null);
 const forged=inspectPostLayoutMvlCandidate({candidate,noise,
  extraction:{drcClean:true,lvsMatched:true,sourceAuthenticated:false}});
 assert.equal(forged.status,'INSUFFICIENT_MODEL_DATA');
});
test('capacitive crosstalk and supply droop can collapse intermediate Q4 margin',()=>{
 const candidate=generateMvlStandardCellCandidates();
 const noise={marginByState:[{state:0,marginV:.4},{state:1,marginV:.1},
  {state:2,marginV:.2},{state:3,marginV:.3}]};
 const extraction={sourceAuthenticated:true,openrcxPerformed:true,
  parasiticUnits:'SI',drcClean:true,lvsMatched:true,
  couplingCapacitanceF:2e-15,loadCapacitanceF:4e-15,
  aggressorSwingV:.3,supplyCurrentA:.1,railResistanceOhm:.5};
 const r=inspectPostLayoutMvlCandidate({candidate,noise,extraction,
  minimumMarginV:.05});
 assert.equal(r.status,'VIRTUAL_FAIL');
 assert.ok(r.collapsed.includes(1));
 assert.equal(r.foundrySignoff,false);
 assert.equal(r.physicalValidation,'none');
});
test('reject nonphysical extraction and invalid candidate',()=>{
 const candidate=generateMvlStandardCellCandidates();
 assert.throws(()=>generateMvlStandardCellCandidates({base:1}));
 assert.throws(()=>generateMvlStandardCellCandidates({width:3}));
 assert.throws(()=>inspectPostLayoutMvlCandidate({candidate:null}),/candidate/);
 const noise={marginByState:[{state:0,marginV:.4}]};
 assert.throws(()=>inspectPostLayoutMvlCandidate({candidate,noise,
  extraction:{sourceAuthenticated:true,openrcxPerformed:true,parasiticUnits:'SI',
  drcClean:true,lvsMatched:true,couplingCapacitanceF:-1,
  loadCapacitanceF:1,aggressorSwingV:.1,supplyCurrentA:0,railResistanceOhm:0}}));
});
