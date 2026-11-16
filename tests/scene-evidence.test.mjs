import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/logic/components.js';
import '../js/labs/chip/components.js';
import '../js/labs/quantum/components.js';
import { Diagram } from '../js/core/diagram.js';
import { sceneFromDiagram, designToWorld, worldToDesign } from '../js/scene/layout.js';
import { Scene3DView } from '../js/scene/viewer.js';
import { App } from '../js/ui/app.js';
import { estimateScenarioPassRate, summarizeDesignEvidence } from '../js/evidence/feasibility.js';

test('scene: 3D coordinates round-trip through snapped canonical design coordinates', () => {
  for (const [x,y] of [[0,0],[20,80],[-60,120],[500,-20]]) {
    const w=designToWorld(x,y);
    assert.deepEqual(worldToDesign(w.x,w.z),{x,y});
  }
  assert.throws(()=>worldToDesign(NaN,0),/finite/);
});

test('scene: block geometry is derived from the original diagram without mutation', () => {
  const d=new Diagram({id:'logic-3d',lab:'logic'});
  const a=d.addBlock('logic.IN',{x:0,y:0,id:'a'});
  const b=d.addBlock('logic.NOT',{x:160,y:0,id:'b'});
  const wire=d.connect(a.id,'out',b.id,'a');
  const before=JSON.stringify(d.toJSON());
  const scene=sceneFromDiagram(d);
  assert.equal(scene.blocks.length,2);
  assert.equal(scene.wires.length,1);
  assert.equal(scene.wires[0].id,wire.id);
  assert.equal(scene.wires[0].points.length,4);
  assert.equal(JSON.stringify(d.toJSON()),before);
  assert.deepEqual(scene.source,{id:'logic-3d',lab:'logic',blockCount:2,wireCount:1});
  assert.ok(scene.blocks[0].height>0);
});

test('scene: broken netlist references cannot create phantom wires or crash the view', () => {
  const d=new Diagram({id:'broken',lab:'chip'});
  d.addBlock('chip.RES',{x:0,y:0,id:'r'});
  d.wires.push({id:'orphan',from:{block:'r',port:'p'},to:{block:'not-there',port:'in'}});
  const scene=sceneFromDiagram(d);
  assert.equal(scene.wires.length,0);
  assert.equal(scene.blocks.length,1);
});

test('scene: independent logical and quantum labs share geometry without changing their physics', () => {
  for(const [lab,type] of [['logic','logic.IN'],['chip','chip.RES'],['quantum','quantum.H']]){
    const d=new Diagram({lab});
    d.addBlock(type,{x:12,y:23});
    const scene=sceneFromDiagram(d);
    assert.equal(scene.source.lab,lab);
    assert.equal(scene.blocks[0].type,type);
    assert.ok(Number.isFinite(scene.center.x));
  }
});

test('evidence: no design-specific physical evidence means no build probability',()=>{
  const d=new Diagram({lab:'logic',id:'no-measurement'});
  d.addBlock('logic.IN',{x:0,y:0});
  const report={verdict:'pass',checks:[{verdict:'pass'},{verdict:'pass'}]};
  const s=summarizeDesignEvidence({diagram:d,report});
  assert.equal(s.simulationChecksPassed,2);
  assert.equal(s.realWorldBuildSuccessPercent,null);
  assert.equal(s.physicalValidation,'none');
  assert.match(s.rationale,/do not establish/);
});

const scenario={
  designId:'test-resistor',intendedUse:'operates at specified supply voltage',
  parameters:[{name:'V',mean:5,sd:0}],model:p=>({V:p.V}),
  constraints:[{metric:'V',min:4.8,max:5.2}],
  assumptions:['Ideal source with a deterministic nominal voltage'],
  seed:7,samples:200,
};
test('evidence: conditional scenario rate is reproducible and never labelled physical success',()=>{
  const a=estimateScenarioPassRate(scenario);
  const b=estimateScenarioPassRate(scenario);
  assert.deepEqual(a,b);
  assert.equal(a.status,'model-only');
  assert.equal(a.modeledPassRatePercent,100);
  assert.equal(a.realWorldBuildSuccessPercent,null);
  assert.ok(a.samplingInterval95Percent[0]<100);
  assert.match(a.note,/NOT equivalent to physical validation/);
});

test('evidence: model-only 0% is not evidence of manufacturing failure',()=>{
  const r=estimateScenarioPassRate({...scenario,constraints:[{metric:'V',min:8,max:9}]});
  assert.equal(r.modeledPassRatePercent,0);
  assert.equal(r.realWorldBuildSuccessPercent,null);
});

test('evidence: missing independence assertion cannot create correlation-free probabilities',()=>{
  const params=[{name:'a',mean:1,sd:0.2},{name:'b',mean:2,sd:0.3}];
  const options={...scenario,parameters:params,model:p=>({V:p.a+p.b})};
  assert.throws(()=>estimateScenarioPassRate(options),/independence assertion/);
  const a=estimateScenarioPassRate({...options,independenceAsserted:true});
  assert.equal(a.status,'model-only');
  assert.ok(a.modeledPassRatePercent>=0&&a.modeledPassRatePercent<=100);
});

test('evidence: quantified correlation uses explicit covariance and rejects bad matrices',()=>{
  const parameters=[{name:'a',mean:1,sd:0.2},{name:'b',mean:2,sd:0.3}];
  const args={...scenario,parameters,model:p=>({V:p.a+p.b}),
    covariance:[[0.04,0.03],[0.03,0.09]]};
  assert.equal(estimateScenarioPassRate(args).status,'model-only');
  assert.throws(()=>estimateScenarioPassRate({...args,covariance:[[0.04,0.2],[0.2,0.09]]}),/positive-definite/);
  assert.throws(()=>estimateScenarioPassRate({...args,covariance:[[0.04,0],[0.3,0.09]]}),/symmetric/);
});

test('evidence: invalid physics samples do not silently become zero-probability builds',()=>{
  const a=estimateScenarioPassRate({...scenario,model:()=>{throw Error('solver divergence');}});
  assert.equal(a.status,'inconclusive');
  assert.equal(a.modeledPassRatePercent,null);
  assert.equal(a.modelErrors,200);
  assert.equal(a.realWorldBuildSuccessPercent,null);
});

test('evidence: no undocumented assumptions, invalid tolerances or fake sample counts',()=>{
  assert.throws(()=>estimateScenarioPassRate({...scenario,assumptions:[]}),/assumptions/);
  assert.throws(()=>estimateScenarioPassRate({...scenario,samples:20}),/samples/);
  assert.throws(()=>estimateScenarioPassRate({...scenario,constraints:[{metric:'V',min:5,max:4}]}),/constraints/);
  assert.throws(()=>estimateScenarioPassRate({...scenario,parameters:[{name:'V',mean:5,sd:-1}]}),/parameters/);
});

test('scene: browser viewer and app shell modules load without WebGL in Node tests', () => {
  assert.equal(typeof Scene3DView, 'function');
  assert.equal(typeof App, 'function');
});
