import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blochFromDensity,quditVisual,coherenceDecay,
 hardwareQuantumLayout} from '../js/scene/stage-n-quantum-view.js';
const z=(re,im=0)=>({re,im});
test('Pure zero and maximally mixed density matrices give correct Bloch geometry',()=>{
 const zero=blochFromDensity([[z(1),z(0)],[z(0),z(0)]]);
 assert.deepEqual([zero.x,zero.y,zero.z,zero.radius],[0,0,1,1]);
 const mixed=blochFromDensity([[z(.5),z(0)],[z(0),z(.5)]]);
 assert.equal(mixed.radius,0);assert.equal(mixed.purity,.5);
 assert.equal(mixed.physicalValidation,'none');
});
test('Qutrit/ququart distributions validated and hardware proxies non-qualified',()=>{
 assert.equal(quditVisual([.2,.3,.5],{dimension:3}).bars.length,3);
 assert.equal(quditVisual([.1,.2,.3,.4],{dimension:4}).bars.length,4);
 assert.throws(()=>quditVisual([.9,.9],{dimension:2}));
 assert.equal(hardwareQuantumLayout({technology:'transmon',qubits:4}).couplers.length,3);
 assert.equal(hardwareQuantumLayout({technology:'trapped-ion'}).actualDeviceLayout,false);
});
test('Decoherence cannot be treated as a measured T1 or T2',()=>{
 assert.equal(coherenceDecay({}).status,'UNKNOWN');
 const r=coherenceDecay({timeUs:10,T1Us:20,T2Us:15});
 assert.equal(r.status,'IDEALIZED_EXPONENTIAL_MODEL');
 assert.ok(r.coherenceRetention<1);
 assert.throws(()=>coherenceDecay({timeUs:10,T1Us:20,T2Us:50}),/Unphysical/);
 assert.throws(()=>blochFromDensity([[z(1),z(2)],[z(0),z(0)]]));
});
