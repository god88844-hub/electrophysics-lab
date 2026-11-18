import {test} from 'node:test';
import assert from 'node:assert/strict';
import {componentAppearance,experimentBenchMesh} from '../js/scene/experiment-bench.js';
const ports={incoming:[{id:'a'},{id:'b'}],outgoing:[{id:'out'}]};
const make=(type,id,x,z)=>({id,type,label:type,x,z,width:1.85,depth:1.1,height:.42,
 color:[.28,.72,.95],ports});
const a=make('chip.RES','r1',-2,0),b=make('chip.VSOURCE','battery',2,0);
const scene={blocks:[a,b],wires:[{id:'w1',points:[
 {x:-1.075,y:.294,z:0},{x:0,y:.08,z:0},{x:1.075,y:.294,z:0}
]}],assemblies:[],center:{x:0,z:0},span:9};
test('3D visual archetypes are component-specific, not measured CAD',()=>{
 assert.equal(componentAppearance('chip.RES','chip'),'resistor');
 assert.equal(componentAppearance('chip.VSOURCE','chip'),'battery');
 assert.equal(componentAppearance('chip.CAP','chip'),'capacitor');
 assert.equal(componentAppearance('chip.DIODE','chip'),'diode');
 assert.equal(componentAppearance('quantum.H','quantum'),'quantum');
 assert.equal(componentAppearance('chip.MOTOR','chip'),'fan');
 assert.equal(componentAppearance('logic.PROBE','logic'),'instrument');
 assert.equal(componentAppearance('logic.IN','logic'),'switch');
 assert.equal(componentAppearance('cpu.ALU','cpu'),'processor');
});
test('3D bench includes table, distinctive parts, ports, and thick wire harness',()=>{
 const before=JSON.stringify(scene),render=experimentBenchMesh(scene,{selectedId:'r1'});
 assert.ok(render.triangles.length>700);
 assert.equal(render.triangles.length%6,0);
 assert.equal(render.lines.length%6,0);
 assert.ok(render.kinds.resistor===1&&render.kinds.battery===1);
 assert.equal(render.displayGeometryOnly,true);
 assert.equal(render.physicalDimensionsEstablished,false);
 assert.equal(render.physicalValidation,'none');
 assert.equal(JSON.stringify(scene),before,'3D display must not mutate simulation netlist');
 assert.ok(render.triangles.every(Number.isFinite));
});
test('Selected component highlight does not change geometry or evidence',()=>{
 const x=experimentBenchMesh(scene,{selectedId:'r1'});
 const y=experimentBenchMesh(scene,{selectedId:'battery'});
 assert.equal(x.triangles.length,y.triangles.length);
 assert.notDeepEqual(x.triangles,y.triangles);
 assert.equal(x.physicalValidation,'none');
});
test('Large scenes simplify components; invalid geometry fails',()=>{
 const big={...scene,blocks:Array.from({length:181},(_,i)=>make('logic.ADDN','b'+i,i%19,Math.floor(i/19))),wires:[]};
 const m=experimentBenchMesh(big);
 assert.equal(m.detail,false);
 assert.equal(m.physicalValidation,'none');
 assert.ok(m.triangles.length<900000);
 const invalid={...scene,blocks:[{...a,width:-1}],wires:[]};
 assert.throws(()=>experimentBenchMesh(invalid),/Invalid illustrative 3D geometry/);
});
