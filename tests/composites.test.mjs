import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/logic/components.js';
import '../js/labs/chip/components.js';
import '../js/labs/quantum/components.js';
import {Diagram} from '../js/core/diagram.js';
import {logicLab} from '../js/labs/logic/lab.js';
import {captureModuleTemplate,registerAssembly,validateModuleTemplate} from '../js/assembly/modules.js';
import {
  COMPOSITE_FORMAT,HIERARCHICAL_LIBRARY_FORMAT,
  captureCompositeFromAssemblies,validateCompositeTemplate,flattenComposite,
  instantiateComposite,serializeHierarchicalLibrary,parseHierarchicalLibrary,
} from '../js/assembly/composites.js';
import {sceneFromDiagram} from '../js/scene/layout.js';

function buildCircuit(){
  const d=new Diagram({id:'logic-composite-test',lab:'logic',meta:{radix:3}});
  d.addBlock('logic.IN',{id:'src',params:{value:1,name:'Signal'},x:0,y:0});
  d.addBlock('logic.NOT',{id:'inv',params:{delay:10},x:160,y:0});
  d.addBlock('logic.PROBE',{id:'sink',params:{name:'Output'},x:320,y:0});
  d.connect('src','out','inv','a');
  d.connect('inv','y','sink','in');
  return d;
}
function makeComposite(){
  const d=buildCircuit();
  const input=captureModuleTemplate(d,{id:'leaf-source',name:'Input block',blockIds:['src']});
  const gate=captureModuleTemplate(d,{id:'leaf-invert',name:'Inverter + Probe',blockIds:['inv','sink']});
  registerAssembly(d,{id:'group-source',name:'Source',blockIds:['src'],templateId:input.id});
  registerAssembly(d,{id:'group-gate',name:'Inverter',blockIds:['inv','sink'],templateId:gate.id});
  const composite=captureCompositeFromAssemblies(d,['group-source','group-gate'],[input,gate],{id:'composite-invert',name:'Connected ternary inverter'});
  return {d,input,gate,composite,library:[input,gate,composite]};
}
test('composites: capture uses real boundary sockets, wires and relative positions',()=>{
  const {d,composite,library}=makeComposite();
  assert.equal(composite.format,COMPOSITE_FORMAT);
  assert.equal(composite.children.length,2);
  assert.equal(composite.wires.length,1,'cross-group source→gate wire is captured');
  assert.equal(composite.wires[0].from.childId,'child1');
  assert.equal(composite.wires[0].to.childId,'child2');
  assert.equal(validateCompositeTemplate(composite,library).ok,true);
  const blueprint=flattenComposite(composite,library);
  assert.equal(blueprint.blocks.length,3);
  assert.equal(blueprint.wires.length,2);
  assert.deepEqual(blueprint.wires.map(w=>[w.from.block,w.to.block]),[
    ['child2/inv','child2/sink'],['child1/src','child2/inv'],
  ]);
  assert.equal(d.wires.length,2,'capturing must not mutate original graph');
});
test('composites: parameter overrides bind to numeric actual component parameters, not metadata',()=>{
  const {d,composite,library}=makeComposite();
  const p=composite.parameters.find(p=>p.target.blockId==='src'&&p.target.paramKey==='value');
  assert.ok(p); assert.equal(p.default,1);
  const flattened=flattenComposite(composite,library,{overrides:{[p.name]:2}});
  assert.equal(flattened.blocks.find(b=>b.id==='child1/src').params.value,2);
  assert.equal(composite.children[0].templateId,'leaf-source');
  assert.equal(d.block('src').params.value,1);
  assert.throws(()=>flattenComposite(composite,library,{overrides:{fake:1}}),/unknown parameter/);
  assert.throws(()=>flattenComposite(composite,library,{overrides:{[p.name]:NaN}}),/finite/);
  assert.throws(()=>flattenComposite(composite,library,{overrides:{[p.name]:16}}),/maximum/);
});
test('composites: expanded instance has unique real block and wire IDs with valid flat simulation graph',()=>{
  const {composite,library}=makeComposite();
  const dest=new Diagram({lab:'logic',meta:{radix:3}});
  const first=instantiateComposite(dest,composite,library,{id:'unit-1',x:120,y:40});
  const second=instantiateComposite(dest,composite,library,{id:'unit-2',x:500,y:40});
  assert.equal(dest.blocks.length,6);
  assert.equal(dest.wires.length,4);
  assert.equal(new Set(dest.blocks.map(b=>b.id)).size,6);
  assert.equal(new Set(dest.wires.map(w=>w.id)).size,4);
  assert.equal(first.assembly.blockIds.length,3);
  assert.equal(Object.keys(first.assembly.interfaceBindings).length,composite.interfaces.length);
  assert.equal(second.createdWireIds.length,2);
  assert.deepEqual(dest.issues(),[]);
  assert.equal(logicLab.run(dest).ok,true);
});
test('composites: three-level nested module compiles recursively through public numeric parameters',()=>{
  const {composite,library}=makeComposite();
  const nested={
    format:COMPOSITE_FORMAT,id:'outer-nest',name:'Two nested inverters',lab:'logic',
    children:[
      {id:'left',templateId:composite.id,x:0,y:0},
      {id:'right',templateId:composite.id,x:380,y:0},
    ],wires:[],interfaces:[],
    parameters:[{
      name:'driveRight',default:2,min:0,max:15,
      target:{childId:'right',parameter:composite.parameters.find(p=>p.target.blockId==='src'&&p.target.paramKey==='value').name},
    }],
  };
  const all=[...library,nested];
  const valid=validateCompositeTemplate(nested,all);
  assert.equal(valid.ok,true,valid.errors.join('; '));
  const blueprint=flattenComposite(nested,all,{overrides:{driveRight:1}});
  assert.equal(blueprint.blocks.length,6);
  assert.equal(blueprint.wires.length,4);
  assert.equal(blueprint.blocks.find(b=>b.id==='right/child1/src').params.value,1);
  const dest=new Diagram({lab:'logic',meta:{radix:3}});
  instantiateComposite(dest,nested,all);
  assert.equal(dest.blocks.length,6);
  assert.deepEqual(dest.issues(),[]);
});
test('composites: cycles, unresolved dependencies and cross-lab references fail closed',()=>{
  const {composite,library}=makeComposite();
  const self={...structuredClone(composite),id:'self',children:composite.children.map((c,i)=>i?c:{...c,templateId:'self'})};
  assert.equal(validateCompositeTemplate(self,[...library,self]).ok,false);
  assert.match(validateCompositeTemplate(self,[...library,self]).errors[0],/cycle/);
  const missing={...structuredClone(composite),id:'missing',children:composite.children.map((c,i)=>i?c:{...c,templateId:'ghost'})};
  assert.equal(validateCompositeTemplate(missing,[...library,missing]).ok,false);
  const mismatch={...structuredClone(composite),id:'wrong-lab',lab:'chip'};
  assert.equal(validateCompositeTemplate(mismatch,[...library,mismatch]).ok,false);
});
test('composites: a corrupted port or wire type cannot be flattened into a valid result',()=>{
  const {composite,library}=makeComposite();
  const wrong=structuredClone(composite);
  wrong.wires[0].from.port='not-a-port';
  assert.equal(validateCompositeTemplate(wrong,library.filter(t=>t.id!==composite.id)).ok,false);
  assert.throws(()=>flattenComposite(wrong,library),/unknown|incompatible/);
  const duplicate=structuredClone(composite);
  duplicate.children[1].id=duplicate.children[0].id;
  assert.equal(validateCompositeTemplate(duplicate,library.filter(t=>t.id!==composite.id)).ok,false);
});
test('composites: rejected placement is atomic, including malformed overrides',()=>{
  const {composite,library}=makeComposite(),d=buildCircuit();
  const original=JSON.stringify(d.toJSON());
  for(const opts of [{x:Infinity},{x:1e8},{overrides:{oops:123}},{id:'bad-name',overrides:{[composite.parameters[0].name]:null}}]){
    assert.throws(()=>instantiateComposite(d,composite,library,opts));
    assert.equal(JSON.stringify(d.toJSON()),original);
  }
});
test('composites: library import supports legacy v1 and detects tampered dependency graph',()=>{
  const {library,composite,input}=makeComposite();
  const source=serializeHierarchicalLibrary(library);
  assert.equal(JSON.parse(source).format,HIERARCHICAL_LIBRARY_FORMAT);
  assert.deepEqual(parseHierarchicalLibrary(source),library);
  const old=JSON.stringify({format:'invention-lab/module-library/1',templates:[input]});
  assert.deepEqual(parseHierarchicalLibrary(old),[input]);
  assert.throws(()=>parseHierarchicalLibrary('abc'),/JSON/);
  assert.throws(()=>parseHierarchicalLibrary(JSON.stringify({format:HIERARCHICAL_LIBRARY_FORMAT,templates:[composite]})),/missing dependency/);
  assert.throws(()=>serializeHierarchicalLibrary([input,input]),/duplicate template/);
});
test('composites: copied hierarchies preserve 3D group labels without altering underlying model',()=>{
  const {composite,library}=makeComposite();
  const d=new Diagram({lab:'logic',meta:{radix:3}});
  const r=instantiateComposite(d,composite,library,{name:'Hierarchy unit'});
  const scene=sceneFromDiagram(d);
  assert.equal(scene.assemblies.length,1);
  assert.equal(scene.assemblies[0].name,'Hierarchy unit');
  assert.equal(scene.blocks.length,3);
  assert.ok(r.exposedPorts.every(p=>r.createdBlockIds.includes(p.blockId)));
});

test('composites: duplicated cross-module edges must fail before instantiation',()=>{
  const {composite,library}=makeComposite(),modified=structuredClone(composite);
  modified.wires.push({...structuredClone(modified.wires[0]),id:'duplicate-wire'});
  const verdict=validateCompositeTemplate(modified,library.filter(t=>t.id!==composite.id));
  assert.equal(verdict.ok,false,'duplicate connections cannot be accepted as a valid reusable hierarchy');
  assert.match(verdict.errors.join(' '),/duplicate/i);
});
test('composites: duplicate bindings to the same child parameter are rejected',()=>{
  const {composite,library}=makeComposite(),modified=structuredClone(composite);
  const p=modified.parameters.find(p=>p.target.blockId==='src'&&p.target.paramKey==='value');
  modified.parameters.push({...structuredClone(p),name:'second-alias'});
  const verdict=validateCompositeTemplate(modified,library.filter(t=>t.id!==composite.id));
  assert.equal(verdict.ok,false);
  assert.match(verdict.errors.join(' '),/duplicate|binding/i);
});
test('composites: duplicate outer interface aliases cannot secretly reference one physical pin',()=>{
  const {composite,library}=makeComposite(),modified=structuredClone(composite);
  modified.interfaces.push({...structuredClone(modified.interfaces[0]),name:'second-alias'});
  const verdict=validateCompositeTemplate(modified,library.filter(t=>t.id!==composite.id));
  assert.equal(verdict.ok,false);
  assert.match(verdict.errors.join(' '),/duplicate|interface/i);
});
test('composites: hierarchy paths must not collide with user-authored separators',()=>{
  const {composite,library}=makeComposite(),modified=structuredClone(composite);
  const old=modified.children[0].id,newId='path/other-child';
  modified.children[0].id=newId;
  for(const edge of modified.wires){
    if(edge.from.childId===old)edge.from.childId=newId;
    if(edge.to.childId===old)edge.to.childId=newId;
  }
  for(const port of modified.interfaces)if(port.childId===old)port.childId=newId;
  for(const parameter of modified.parameters)if(parameter.target.childId===old)parameter.target.childId=newId;
  const verdict=validateCompositeTemplate(modified,library.filter(t=>t.id!==composite.id));
  assert.equal(verdict.ok,false);
  assert.match(verdict.errors.join(' '),/path|ID|separator|child/i);
});
test('composites: spoofed persisted interface mapping cannot bypass real port types',()=>{
  const {d,input,gate}=makeComposite();
  const first=d.meta.assemblies.find(a=>a.id==='group-source');
  first.interfaceBindings={
    'src.out': {blockId:'src',portId:'missing-port',dir:'out',type:'logic'},
  };
  assert.throws(
    ()=>captureCompositeFromAssemblies(d,['group-source','group-gate'],[input,gate],{name:'Spoofed mapping'}),
    /interface|port|signature/i,
  );
});

test('composites: numeric overrides change the computed binary and ternary probe value',()=>{
  const {composite,library}=makeComposite();
  const knob=composite.parameters.find(p=>p.target.blockId==='src'&&p.target.paramKey==='value');
  for(const radix of [2,3]){
    const d=new Diagram({lab:'logic',meta:{radix}});
    const normal=instantiateComposite(d,composite,library,{name:'Unchanged'});
    const changed=instantiateComposite(d,composite,library,{
      name:'Forced zero',x:600,y:0,overrides:{[knob.name]:0},
    });
    const result=logicLab.run(d);
    const first=result.probes[normal.createdBlockIds[2]]?.values.at(-1);
    const second=result.probes[changed.createdBlockIds[2]]?.values.at(-1);
    assert.equal(first,radix-2);
    assert.equal(second,radix-1,'overrides must affect actual simulated quantum/logic component parameters');
    assert.equal(result.warnings.length,0);
  }
});
