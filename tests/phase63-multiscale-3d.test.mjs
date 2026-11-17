import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/logic/components.js';
import '../js/labs/chip/components.js';
import '../js/labs/quantum/components.js';
import {Diagram} from '../js/core/diagram.js';
import {registerAssembly} from '../js/assembly/modules.js';
import {makeHierarchy,connectivityDigest,proposeMove} from '../js/evidence/phase63-multiscale-3d.js';
function design(){
 const d=new Diagram({id:'phase63-test',name:'Hierarchical circuit',lab:'logic'});
 d.addBlock('logic.IN',{id:'input',x:0,y:0,params:{value:1}});
 d.addBlock('logic.NOT',{id:'invert',x:200,y:0});
 d.addBlock('logic.PROBE',{id:'probe',x:400,y:0,params:{name:'Output'}});
 d.connect('input','out','invert','a');d.connect('invert','y','probe','in');
 registerAssembly(d,{id:'group',name:'Output group',blockIds:['invert','probe']});
 return d;
}
test('Scene is derived from full canonical 2D circuit with stable wire count',()=>{
 const d=design(),before=JSON.stringify(d.toJSON());
 const a=makeHierarchy(d,{detail:'port'});
 assert.equal(a.canonicalComponentCount,3);assert.equal(a.canonicalWireCount,2);
 assert.equal(a.visibleWireCount,2);assert.equal(a.connectivitySHA256,connectivityDigest(d));
 assert.ok(a.nodes.some(n=>n.id==='port:invert:a'));
 assert.ok(a.nodes.some(n=>n.id==='assembly:group'));
 assert.equal(a.edges.length,2);assert.equal(JSON.stringify(d.toJSON()),before);
 assert.equal(a.physicalDimensionsEstablished,false);
});
test('LOD assembly, component and port views map to one canonical connectivity',()=>{
 const d=design(),a=makeHierarchy(d,{detail:'assembly'}),b=makeHierarchy(d,{detail:'component'}),c=makeHierarchy(d,{detail:'port'});
 assert.equal(a.connectivitySHA256,b.connectivitySHA256);
 assert.equal(b.connectivitySHA256,c.connectivitySHA256);
 assert.ok(a.nodes.length<b.nodes.length);
 assert.ok(b.nodes.length<c.nodes.length);
});
test('Focused assembly shows one internal wire while preserving original graph and boundary',()=>{
 const d=design(),a=makeHierarchy(d,{focusAssemblyId:'group',detail:'port'});
 assert.equal(a.visibleComponentCount,2);assert.equal(a.visibleWireCount,1);
 assert.equal(a.canonicalWireCount,2);
 assert.ok(a.edges.some(x=>!x.visible&&x.crossAssembly));
 assert.throws(()=>makeHierarchy(d,{focusAssemblyId:'ghost'}));
});
test('Transactional 3D assembly move changes placements but not source topology',()=>{
 const d=design(),before=JSON.stringify(d.toJSON()),digest=connectivityDigest(d);
 const edit=proposeMove(d,{assemblyId:'group',deltaWorldX:1,deltaWorldZ:0});
 const changed=Diagram.fromJSON(edit.proposedDiagram);
 assert.equal(JSON.stringify(d.toJSON()),before);
 assert.equal(edit.snappedDesignDelta.x,60);
 assert.equal(changed.block('input').x,0);
 assert.equal(changed.block('invert').x,260);
 assert.equal(changed.block('probe').x,460);
 assert.equal(connectivityDigest(changed),digest);
 assert.equal(edit.beforeConnectivitySHA256,edit.afterConnectivitySHA256);
});
test('Malformed move, stale grouping, nonfinite placements and duplicate ids rejected',()=>{
 const d=design();
 for(const opts of [{assemblyId:'ghost',deltaWorldX:1},
 {blockIds:['input','input'],deltaWorldX:1},
 {blockIds:['missing'],deltaWorldX:1},
 {assemblyId:'group',deltaWorldX:Infinity},
 {assemblyId:'group',blockIds:['probe']},{}])
  assert.throws(()=>proposeMove(d,opts));
 const bad=design();bad.block('input').x=NaN;assert.throws(()=>makeHierarchy(bad));
 const stale=design();stale.removeBlock('invert');assert.throws(()=>makeHierarchy(stale));
});
test('Scene reports no physical geometry or real-world success confidence',()=>{
 const x=makeHierarchy(design());
 assert.equal(x.presentation3DCoordinatesOnly,true);
 assert.equal(x.physicalValidation,'none');
 assert.equal(x.realWorldBuildSuccessPercent,null);
});