import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/logic/components.js';
import '../js/labs/chip/components.js';
import '../js/labs/quantum/components.js';
import {Diagram} from '../js/core/diagram.js';
import {sceneFromDiagram} from '../js/scene/layout.js';
import {AssemblyShelf} from '../js/ui/module-shelf.js';
import {App} from '../js/ui/app.js';
import {logicLab} from '../js/labs/logic/lab.js';
import {
  MODULE_FORMAT,LIBRARY_FORMAT,ASSEMBLY_FORMAT,
  captureModuleTemplate,instantiateModule,registerAssembly,ungroupAssembly,
  listAssemblies,assemblyIssues,validateModuleTemplate,
  serializeModuleLibrary,parseModuleLibrary,
} from '../js/assembly/modules.js';

function logicDesign() {
  const d=new Diagram({id:'design-logic',lab:'logic',name:'Reusability test'});
  const input=d.addBlock('logic.IN',{id:'input',x:0,y:0,params:{value:1}});
  const inv=d.addBlock('logic.NOT',{id:'invert',x:200,y:0});
  const probe=d.addBlock('logic.PROBE',{id:'probe',x:400,y:0,params:{name:'Output'}});
  d.connect(input.id,'out',inv.id,'a');
  d.connect(inv.id,'y',probe.id,'in');
  return d;
}
function selectTemplate(d,ids=['input','invert','probe']) {
  return captureModuleTemplate(d,{name:'Logic inversion unit',id:'template-not',blockIds:ids});
}
test('assemblies: flat module captures registered components, real ports and internal nets',()=>{
  const d=logicDesign(),before=JSON.stringify(d.toJSON());
  const template=selectTemplate(d);
  assert.equal(template.format,MODULE_FORMAT);
  assert.equal(template.blocks.length,3);
  assert.equal(template.wires.length,2);
  assert.deepEqual(template.wires.map(w=>[w.from.block,w.to.block]),
    [['input','invert'],['invert','probe']]);
  assert.equal(validateModuleTemplate(template).ok,true);
  assert.equal(JSON.stringify(d.toJSON()),before,'capture cannot modify original design');
});
test('assemblies: grouped metadata does not modify a single solver block or edge',()=>{
  const d=logicDesign();
  const beforeBlocks=JSON.stringify(d.blocks),beforeWires=JSON.stringify(d.wires);
  const g=registerAssembly(d,{id:'g-one',name:'Inverter',blockIds:['input','invert','probe'],templateId:'template-not'});
  assert.equal(g.format,ASSEMBLY_FORMAT);
  assert.equal(JSON.stringify(d.blocks),beforeBlocks);
  assert.equal(JSON.stringify(d.wires),beforeWires);
  const round=Diagram.fromJSON(d.toJSON());
  assert.equal(listAssemblies(round)[0].name,'Inverter');
  assert.deepEqual(assemblyIssues(round),[]);
  assert.equal(ungroupAssembly(round,'g-one'),true);
  assert.equal(ungroupAssembly(round,'g-one'),false);
  assert.equal(round.blocks.length,3,'ungroup must never erase actual circuitry');
  assert.equal(round.wires.length,2);
});
test('assemblies: repeated template instantiation expands real simulation blocks and wires with unique IDs',()=>{
  const d=logicDesign(),template=selectTemplate(d);
  const first=instantiateModule(d,template,{id:'instance-a',x:900,y:200,name:'Unit A'});
  const second=instantiateModule(d,template,{id:'instance-b',x:1250,y:200,name:'Unit B'});
  assert.equal(d.blocks.length,9);
  assert.equal(d.wires.length,6);
  assert.equal(new Set(d.blocks.map(b=>b.id)).size,9);
  assert.equal(new Set(d.wires.map(w=>w.id)).size,6);
  assert.equal(first.createdBlockIds.length,3);
  assert.equal(first.createdWireIds.length,2);
  assert.equal(second.createdBlockIds.length,3);
  assert.equal(second.createdWireIds.length,2);
  for(const edgeId of first.createdWireIds){
    const w=d.wires.find(w=>w.id===edgeId);
    assert.ok(first.createdBlockIds.includes(w.from.block));
    assert.ok(first.createdBlockIds.includes(w.to.block));
  }
  assert.deepEqual(assemblyIssues(d),[]);
  assert.equal(d.issues().length,0);
  assert.equal(listAssemblies(d).length,2);
});
test('assemblies: copied template does not alias mutable source or other instances',()=>{
  const d=logicDesign(),template=selectTemplate(d);
  const captured=template.blocks.find(b=>b.id==='input');
  const a=instantiateModule(d,template,{x:500,y:200}), b=instantiateModule(d,template,{x:850,y:250});
  const original=d.block('input');
  const copyA=d.block(a.createdBlockIds[0]);
  const copyB=d.block(b.createdBlockIds[0]);
  original.params.value=0;
  copyA.params.value=7;
  assert.equal(captured.params.value,1);
  assert.equal(copyB.params.value,1);
  assert.notEqual(copyA.params,copyB.params);
});
test('assemblies: exposed interfaces include real boundary and unconnected sockets only',()=>{
  const d=logicDesign();
  const template=selectTemplate(d,['invert','probe']);
  assert.equal(template.wires.length,1);
  assert.ok(template.interfaces.some(i=>i.name==='invert.a'&&i.dir==='in'));
  const instance=instantiateModule(d,template,{id:'isolated',x:700,y:0});
  assert.ok(instance.exposedPorts.some(p=>p.name==='invert.a'&&p.blockId!== 'invert'));
  assert.equal(instance.createdWireIds.length,1,'boundary to original input is not cloned');
  const originalInputs=d.wires.filter(w=>w.to.block==='invert'&&w.to.port==='a');
  assert.equal(originalInputs.length,1,'template cannot clone parent/external wires');
});
test('assemblies: captured Chip Lab analog netlist uses real bidirectional typed terminals',()=>{
  const d=new Diagram({lab:'chip'});
  d.addBlock('chip.RES',{id:'r1',params:{r:1000},x:0,y:0});
  d.addBlock('chip.RES',{id:'r2',params:{r:2000},x:120,y:0});
  d.connect('r1','n','r2','p');
  const t=captureModuleTemplate(d,{id:'res-pair',name:'Resistor pair',blockIds:['r1','r2']});
  assert.equal(t.wires.length,1);
  assert.ok(t.interfaces.some(p=>p.blockId==='r1'&&p.portId==='p'&&p.dir==='bidi'));
  const inst=instantiateModule(d,t,{x:400,y:0});
  assert.equal(inst.createdWireIds.length,1);
  assert.equal(d.issues().length,0);
});
test('assemblies: quantum modules preserve qudit wires and gate types with no invented model',()=>{
  const d=new Diagram({lab:'quantum'});
  d.addBlock('quantum.WIRE',{id:'q',x:0,y:0});
  d.addBlock('quantum.H',{id:'h',x:120,y:0});
  d.connect('q','out','h','qin');
  const t=captureModuleTemplate(d,{name:'Hadamard unit',blockIds:['q','h']});
  assert.equal(t.wires.length,1);
  const next=instantiateModule(d,t,{x:350,y:0});
  assert.equal(next.createdBlockIds.length,2);
  assert.equal(d.issues().length,0);
});
test('assemblies: cross-lab/unknown component import is rejected before design mutation',()=>{
  const d=logicDesign(),t=selectTemplate(d),before=JSON.stringify(d.toJSON());
  for(const changed of [
    {...t,lab:'chip'},
    {...t,blocks:[{...t.blocks[0],type:'chip.RES'},...t.blocks.slice(1)]},
    {...t,wires:[...t.wires,{id:'invalid',from:{block:'missing',port:'out'},to:{block:'invert',port:'a'}}]},
    {...t,wires:[t.wires[0],{...t.wires[0],id:'duplicate-edge'},...t.wires.slice(1)]},
    {...t,interfaces:[...t.interfaces,{name:'fake',blockId:'input',portId:'invalid',dir:'in',type:'logic'}]},
    {...t,blocks:[{...t.blocks[0],x:Infinity},...t.blocks.slice(1)]},
  ]){
    assert.throws(()=>instantiateModule(d,changed,{x:100,y:100}),/Invalid|cross|incompatible|invalid/i);
    assert.equal(JSON.stringify(d.toJSON()),before,'rejected import must leave canonical design unchanged');
  }
});
test('assemblies: require valid positions, names, membership and non-overlapping grouping',()=>{
  const d=logicDesign();
  assert.throws(()=>captureModuleTemplate(d,{name:'',blockIds:['input']}),/name/);
  assert.throws(()=>captureModuleTemplate(d,{name:'x',blockIds:['ghost']}),/missing/i);
  assert.throws(()=>registerAssembly(d,{name:'x',blockIds:['input','input']}),/Duplicate/);
  registerAssembly(d,{name:'Group one',blockIds:['input']});
  assert.throws(()=>registerAssembly(d,{name:'Group two',blockIds:['input']}),/multiple/);
  assert.throws(()=>instantiateModule(d,selectTemplate(d),{x:NaN,y:0}),/finite/);
});
test('assemblies: orphan group integrity issues are observable, never silently deleted',()=>{
  const d=logicDesign();registerAssembly(d,{id:'g',name:'Registered',blockIds:['invert']});
  d.removeBlock('invert');
  assert.ok(assemblyIssues(d).some(x=>x.includes('removed block')));
  assert.deepEqual(listAssemblies(d)[0].staleBlockIds,['invert']);
  assert.equal(ungroupAssembly(d,'g'),true);
  assert.equal(d.blocks.length,2);
});
test('assemblies: library JSON round-trip validates templates and rejects duplicates/malformed payloads',()=>{
  const template=selectTemplate(logicDesign());
  const json=serializeModuleLibrary([template]);
  assert.equal(JSON.parse(json).format,LIBRARY_FORMAT);
  assert.deepEqual(parseModuleLibrary(json),[template]);
  assert.throws(()=>serializeModuleLibrary([template,template]),/duplicate/i);
  assert.throws(()=>parseModuleLibrary(JSON.stringify({format:LIBRARY_FORMAT,templates:[{format:MODULE_FORMAT}]})),/Invalid/);
  assert.throws(()=>parseModuleLibrary('{}'),/format/);
  assert.throws(()=>parseModuleLibrary('{oops'),/JSON/);
  assert.throws(()=>parseModuleLibrary('A'.repeat(2_000_001)),/size/);
});
test('assemblies: 3D scene can focus module members while the canonical diagram remains complete',()=>{
  const d=logicDesign();
  registerAssembly(d,{id:'g',name:'Inversion unit',blockIds:['invert','probe']});
  const complete=sceneFromDiagram(d);
  assert.equal(complete.blocks.length,3);
  assert.equal(complete.wires.length,2);
  assert.equal(complete.assemblies.length,1);
  const subset=sceneFromDiagram(d,{visibleBlockIds:['invert','probe']});
  assert.equal(subset.blocks.length,2);
  assert.equal(subset.wires.length,1);
  assert.equal(subset.assemblies.length,1);
  assert.equal(d.blocks.length,3);
  assert.equal(d.wires.length,2);
});
test('assemblies: editor and module shelf remain importable in pure Node CI',()=>{
  assert.equal(typeof AssemblyShelf,'function');
  assert.equal(typeof App,'function');
});

test('assemblies: imported module parameters must match registered component parameter types',()=>{
  const diagram=logicDesign(),original=JSON.stringify(diagram.toJSON()),template=selectTemplate(diagram);
  const changed=structuredClone(template);
  changed.blocks.find(b=>b.id==='input').params.value='1';
  assert.equal(validateModuleTemplate(changed).ok,false);
  assert.throws(()=>instantiateModule(diagram,changed),/Invalid module template/);
  assert.equal(JSON.stringify(diagram.toJSON()),original);
  const changedName=structuredClone(template);
  changedName.blocks.find(b=>b.id==='probe').params.name=42;
  assert.equal(validateModuleTemplate(changedName).ok,false);
});

test('assemblies: grouping does not change actual binary or ternary simulation results',()=>{
  for(const radix of [2,3,4]){
    const d=logicDesign();
    d.meta.radix=radix;
    const before=logicLab.run(d);
    registerAssembly(d,{name:'Annotated logic',blockIds:['input','invert','probe']});
    const after=logicLab.run(d);
    assert.deepEqual(after,before,'assembly metadata must not change the existing radix '+radix+' solver result');
    ungroupAssembly(d,d.meta.assemblies[0].id);
    assert.deepEqual(logicLab.run(d),before);
  }
});
