import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeFoundryRailProfile,verifyMosTerminalSOA,
 verifyProfileSOA,verifyRailRippleCorners,requireSafeNetlistSOA,MOS_SOA_LIMITS}
 from '../js/evidence/phase73-soa.js';

test('Q4 SKY130 core uses exact physically sized 600mV logic rails',()=>{
 const p=makeFoundryRailProfile({id:'sky130-core-1v8',radix:4});
 assert.deepEqual(p.nominalRailsV,[0,.6,1.2,1.8]);
 assert.deepEqual(p.deviceModels,[
  'sky130_fd_pr__nfet_01v8','sky130_fd_pr__pfet_01v8',
  'sky130_fd_pr__nfet_01v8_lvt','sky130_fd_pr__pfet_01v8_hvt']);
 assert.equal(verifyProfileSOA(p).status,'SOA_PROFILE_SCREEN_PASS');
 assert.equal(p.calibratedDeviceVariationAvailable,false);
 assert.equal(p.physicalQualification,'UNQUALIFIED_NO_GO');
});
test('SKY130 core +10% ripple exceeds 1.95V declared device model limit',()=>{
 const p=makeFoundryRailProfile({id:'sky130-core-1v8',radix:4,
  rippleFraction:.1,temperatureC:125});
 assert.ok(Math.abs(p.railsV.at(-1)-1.98)<1e-12);
 const result=verifyProfileSOA(p);
 assert.equal(result.status,'SOA_OXIDE_OVERSTRESS');
 assert.ok(result.findings.some(x=>x.violations.some(v=>v.terminal==='Vgs')));
});
test('GF180 3.3V and SKY130 thick-oxide Q4 have separate 1.1V rails',()=>{
 for(const id of ['gf180-core-3v3','sky130-thick-3v3']){
  const p=makeFoundryRailProfile({id,radix:4,rippleFraction:.1});
  assert.deepEqual(p.nominalRailsV,[0,1.1,2.2,3.3]);
  assert.equal(verifyProfileSOA(p).status,'SOA_PROFILE_SCREEN_PASS',id);
  assert.equal(p.completePinnedPdkDependenciesAvailable,false,id);
 }
 assert.equal(MOS_SOA_LIMITS['sky130_fd_pr__nfet_g5v0d10v5'].maxDrainV,11);
 assert.equal(MOS_SOA_LIMITS['gf180mcu_fd_pr__nfet_03v3'].maxGateV,3.63);
});
test('terminal checker rejects oxide and body overstress with no simulator fallback',()=>{
 const model='sky130_fd_pr__nfet_01v8';
 const good=verifyMosTerminalSOA({model,samples:[
  {gateV:1.8,drainV:1.8,sourceV:0,bodyV:0}]});
 assert.equal(good.status,'SOA_MODEL_RANGE_SCREEN_PASS');
 const bad=verifyMosTerminalSOA({model,samples:[
  {gateV:3.3,drainV:3.3,sourceV:0,bodyV:0},
  {gateV:3.3,drainV:0,sourceV:0,bodyV:0}]});
 assert.equal(bad.status,'SOA_OXIDE_OVERSTRESS');
 for(const term of ['Vgs','Vds','Vgb','Vgd'])
  assert.ok(bad.violations.some(x=>x.terminal===term),term);
 const missing=verifyMosTerminalSOA({model,samples:[{gateV:1}]});
 assert.equal(missing.status,'SOA_INSUFFICIENT_NODE_BOUNDS');
 const invalid=verifyMosTerminalSOA({model:'user-defined-model',samples:[]});
 assert.equal(invalid.status,'SOA_INSUFFICIENT_NODE_BOUNDS');
});
test('preflight blocks an overstressed transistor from reaching SPICE and rejects unknowns',()=>{
 const p=makeFoundryRailProfile({id:'sky130-core-1v8'});
 const devices=[
  {model:p.polarityModels.n,samples:[{gateV:3.3,drainV:3.3,sourceV:0,bodyV:0}]},
  {model:p.polarityModels.p,samples:[{gateV:0,drainV:0,sourceV:1.8,bodyV:1.8}]}
 ];
 const x=requireSafeNetlistSOA({profile:p,devices});
 assert.equal(x.status,'SOA_OXIDE_OVERSTRESS');
 assert.equal(x.physicalQualification,'UNQUALIFIED_NO_GO');
 assert.equal(requireSafeNetlistSOA({profile:p,devices:[]}).status,
  'SOA_INSUFFICIENT_NODE_BOUNDS');
 assert.equal(requireSafeNetlistSOA({profile:p,
  devices:[{model:'sky130_fd_pr__nfet_g5v0d10v5',samples:devices[0].samples}]
 }).status,'SOA_INSUFFICIENT_NODE_BOUNDS');
});
test('binary and ternary rail assignment changes with the device voltage profile',()=>{
 const x=makeFoundryRailProfile({id:'sky130-core-1v8',radix:2});
 const y=makeFoundryRailProfile({id:'sky130-core-1v8',radix:3});
 assert.deepEqual(x.nominalRailsV,[0,1.8]);
 assert.deepEqual(y.nominalRailsV,[0,.9,1.8]);
 assert.throws(()=>makeFoundryRailProfile({id:'unsafe-sky130-3v3'}));
 assert.throws(()=>makeFoundryRailProfile({rippleFraction:.15}));
});

test('all 12 regulator ripple x temperature corners are inside published device operating model screens',()=>{
 const cases=[
  {id:'sky130-core-1v8',rails:[0,.6,1.2,1.8],maximum:1.89,ripple:.05},
  {id:'sky130-core-1v65-unregulated',rails:[0,.55,1.1,1.65],maximum:1.815,ripple:.1},
  {id:'gf180-core-3v3',rails:[0,1.1,2.2,3.3],maximum:3.63,ripple:.1},
  {id:'sky130-thick-3v3',rails:[0,1.1,2.2,3.3],maximum:3.63,ripple:.1}
 ];
 for(const {id,rails,maximum,ripple} of cases){
  const p=makeFoundryRailProfile({id,radix:4});
  assert.deepEqual(p.nominalRailsV,rails,id);
  assert.ok(Math.abs(p.railsV.at(-1)-maximum)<1e-10,id);
  assert.equal(p.maximumSpecifiedRippleFraction,ripple,id);
  const result=verifyRailRippleCorners({id,radix:4});
  assert.equal(result.caseCount,12,id);
  assert.equal(result.status,'SOA_ALL_DECLARED_RIPPLE_CORNERS_PASS',id);
  assert.ok(result.cases.every(x=>x.modelSOA==='SOA_PROFILE_SCREEN_PASS'
   &&x.terminalViolations===0),id);
  assert.equal(result.physicalQualification,'UNQUALIFIED_NO_GO');
 }
 assert.equal(MOS_SOA_LIMITS.sky130_fd_pr__nfet_01v8.maxGateV,1.95);
});
test('LDO contractual ripple above five percent fails closed even if voltage remains below oxide screen',()=>{
 const profile=makeFoundryRailProfile({id:'sky130-core-1v8',radix:4,
  rippleFraction:.06});
 assert.ok(profile.railsV.at(-1)<1.95);
 assert.equal(verifyProfileSOA(profile).status,'SOA_REGULATOR_RIPPLE_SPEC_EXCEEDED');
 assert.equal(profile.rippleSpecificationMet,false);
 const actual=makeFoundryRailProfile({id:'sky130-core-1v8',
  rippleFraction:.1});
 assert.equal(verifyProfileSOA(actual).status,'SOA_OXIDE_OVERSTRESS');
});
