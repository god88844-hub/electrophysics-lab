import {test} from 'node:test';
import assert from 'node:assert/strict';
import {H,X} from '../js/labs/quantum/gates.js';
import {basis,applyGate,applyChannel,channel,probabilities,purity,bell,auditNoise} from '../js/evidence/phase61-density-noise.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);
test('Pure |+> density and coherence normalized',()=>{
 const s=applyGate(basis(1),H,[0]);near(s.rho[0][1].re,0.5);near(probabilities(s)[0],0.5);near(purity(s),1);
});
test('Amplitude damping maps excited population to ground with p=0.25',()=>{
 const s=applyChannel(basis(1,1),channel('amplitude-damping',0.25),[0]);
 near(probabilities(s)[0],0.25);near(probabilities(s)[1],0.75);near(purity(s),0.625);
});
test('Bell dephasing at p=0.5 removes coherence, keeps populations',()=>{
 const s=bell('dephasing',0.5);near(purity(s),0.5);near(s.rho[0][3].re,0);
 near(probabilities(s)[0],0.5);near(probabilities(s)[3],0.5);near(purity(bell()),1);
});
test('Depolarizing p=1 yields fully mixed single qubit',()=>{
 const s=applyChannel(basis(1),channel('depolarizing',1),[0]);
 near(probabilities(s)[0],0.5);near(probabilities(s)[1],0.5);near(purity(s),0.5);
});
test('Most significant qubit convention preserved',()=>{
 const x=applyGate(basis(3),X,[2]);near(probabilities(x)[1],1);
 const d=applyChannel(basis(2,2),channel('amplitude-damping',1),[0]);near(probabilities(d)[0],1);
});
test('Invalid probabilities and unphysical channels rejected',()=>{
 for(const p of [-1,2,NaN,Infinity,'0.1'])assert.throws(()=>channel('dephasing',p));
 assert.throws(()=>channel('fake',0.1));assert.throws(()=>basis(4));
 assert.throws(()=>applyGate(basis(1),X,[2]));
 assert.throws(()=>applyChannel(basis(1),[[[{re:2,im:0},{re:0,im:0}],[{re:0,im:0},{re:2,im:0}]]],[0]));
});
test('Audit does not invent hardware noise calibration or success percentages',()=>{
 const r=auditNoise();assert.deepEqual(r,auditNoise());
 assert.equal(r.independentHardwareExperiments,0);assert.equal(r.realWorldBuildSuccessPercent,null);
});