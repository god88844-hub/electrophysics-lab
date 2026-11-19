import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import {Diagram} from '../js/core/diagram.js';
import {COINVENTOR_TOOLS,inspectCanonicalScene,planGoal,proposeCoInventorEdits,
 commitApprovedCoInventorPlan,invokeCoInventorTool,generateIdealAdderReference} from '../js/scene/stage-o-agent-tools.js';
const fixture=()=>{
 const d=new Diagram({id:'stage-o-test',lab:'chip',name:'test'});
 d.addBlock('chip.RES',{id:'res1',params:{r:100},x:1,y:2});
 return d;
};
test('approved bounded structured tool inventory and scene inspection',()=>{
 const d=fixture(),before=JSON.stringify(d.toJSON());
 assert.ok(COINVENTOR_TOOLS.length>=8);
 const inspect=inspectCanonicalScene(d);
 assert.equal(inspect.blocks.length,1);assert.equal(inspect.physicalQualification,'UNKNOWN / NO-GO');
 assert.equal(JSON.stringify(d.toJSON()),before);
});
test('Q4 SKY130 goal is correctly blocked rather than generating invalid silicon',()=>{
 const p=planGoal('Design low-power quaternary half-adder with >300 mV noise margin on SKY130');
 assert.equal(p.target.radix,4);assert.equal(p.target.minimumNoiseMarginV,.3);
 assert.equal(p.target.pdk,'SKY130');assert.equal(p.generatedCircuit,false);
 assert.equal(p.status,'EVIDENCE_REQUIRED');assert.ok(p.blockers.some(x=>x.includes('1.8V')));
});
test('transactional edits are reproducible and require explicit human approval',()=>{
 const d=fixture(),old=JSON.stringify(d.toJSON());
 const actions=[{name:'design.set_parameter',args:{blockId:'res1',parameter:'r',value:250}},
  {name:'design.move_component',args:{blockId:'res1',x:20,y:30}}];
 const proposal=proposeCoInventorEdits(d,actions);
 assert.equal(proposal.status,'PROPOSED_NOT_COMMITTED');
 assert.equal(JSON.stringify(d.toJSON()),old);
 assert.equal(proposal.diagram.block('res1').params.r,250);
 assert.equal(JSON.stringify(proposeCoInventorEdits(d,actions).preview),
  JSON.stringify(proposal.preview));
 assert.throws(()=>commitApprovedCoInventorPlan({getDiagram:()=>d,setDiagram:()=>{},actions}),/approval/);
 let next=null;const done=commitApprovedCoInventorPlan({
  getDiagram:()=>d,setDiagram:v=>{next=v;},actions,approved:true});
 assert.equal(done.status,'COMMITTED_CANONICAL_EDIT');
 assert.equal(next.block('res1').params.r,250);
 assert.equal(d.block('res1').params.r,100);
});
test('unsafe edits fail without mutating the original',()=>{
 const d=fixture(),before=JSON.stringify(d.toJSON());
 assert.throws(()=>proposeCoInventorEdits(d,[{name:'design.set_parameter',
  args:{blockId:'res1',parameter:'not_declared',value:1}}]),/Undeclared/);
 assert.throws(()=>proposeCoInventorEdits(d,[{name:'design.add_component',
  args:{type:'chip.NONEXISTENT',id:'x'}}]),/Unregistered/);
 assert.throws(()=>proposeCoInventorEdits(d,[{name:'system.shell',args:{cmd:'rm -rf /'}}]),/approved/);
 assert.throws(()=>proposeCoInventorEdits(d,[{name:'design.move_component',
  args:{blockId:'res1',x:Infinity,y:0}}]),/outside/);
 assert.equal(JSON.stringify(d.toJSON()),before);
});
test('simulation requires caller-provided canonical solver, never claims physical signoff',async()=>{
 const d=fixture();
 const absent=await invokeCoInventorTool({diagram:d,name:'simulation.run'});
 assert.equal(absent.status,'SOLVER_UNAVAILABLE');
 const run=await invokeCoInventorTool({diagram:d,name:'simulation.run',
  simulate:async x=>({status:'reference',size:x.blocks.length})});
 assert.equal(run.status,'SOLVER_SNAPSHOT');
 assert.equal(run.result.size,1);assert.equal(run.physicalQualification,'UNKNOWN / NO-GO');
});

test('agent-proposed physical mm placement refuses intersecting component bounds',()=>{
 const d=fixture();
 d.addBlock('chip.RES',{id:'res2',params:{r:20}});
 const actions=[
  {name:'design.set_mm_envelope',args:{blockId:'res1',envelope:{
   xMm:0,yMm:0,zMm:0,widthMm:20,heightMm:5,depthMm:10}}},
  {name:'design.set_mm_envelope',args:{blockId:'res2',envelope:{
   xMm:0,yMm:0,zMm:0,widthMm:20,heightMm:5,depthMm:10}}}
 ];
 const unchanged=JSON.stringify(d.toJSON());
 assert.throws(()=>proposeCoInventorEdits(d,actions),/collision/i);
 assert.equal(JSON.stringify(d.toJSON()),unchanged);
});

test('goal-driven Q4 half-adder creates deterministic ideal canonical logic topology',()=>{
 const a=generateIdealAdderReference('Q4 half-adder with >300 mV noise margin on SKY130');
 const b=generateIdealAdderReference('Q4 half-adder with >300 mV noise margin on SKY130');
 assert.deepEqual(a,b);
 assert.equal(a.status,'IDEAL_LOGIC_REFERENCE_GENERATED');
 assert.equal(a.diagram.lab,'logic');
 assert.equal(a.diagram.meta.radix,4);
 assert.equal(a.diagram.blocks.length,6);
 assert.equal(a.diagram.wires.length,5);
 assert.equal(a.noiseMarginV,'UNKNOWN');
 assert.equal(a.spiceCalibrated,false);
 assert.equal(a.physicalQualification,'UNKNOWN / NO-GO');
});
