import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeFoundryRailProfile} from '../js/evidence/phase73-soa.js';
import {verifyDeckTerminalSOA} from '../js/evidence/phase73-deck-node-soa.js';
import {runSOAGuardedFoundryDeck} from '../js/evidence/stage-m-foundry-spice.js';
const sky=makeFoundryRailProfile({id:'sky130-core-1v8'});
const model=sky.polarityModels.n;
const d={model,instance:'Xn',
 samples:[{gateV:1.8,drainV:1.8,sourceV:0,bodyV:0}]};
const deck=(voltage,g='1.8')=>
 '* Real source-derived SOA preflight\nVDD d 0 '+voltage+'\nVG g 0 '+g+
 '\nXn d g 0 0 '+model+' w=1 l=0.15\n.end\n';
test('a favorable caller-provided terminal sample cannot hide actual 3.3V transistor drain supply',async()=>{
 const input=deck('3.3');
 const source=verifyDeckTerminalSOA({deck:input,profile:sky,devices:[d]});
 assert.equal(source.status,'SOA_OXIDE_OVERSTRESS');
 assert.equal(source.transistorsChecked,1);
 assert.ok(source.issues[0].violations.some(x=>x.terminal==='Vds'));
 const result=await runSOAGuardedFoundryDeck({profile:sky,
  devices:[d],corner:'tt',temperatureC:25,deck:input,
  exe:'/missing/ngspice',pdkRoot:'/missing/pdk'});
 assert.equal(result.status,'SOA_OXIDE_OVERSTRESS');
 assert.equal(result.ngspiceExecuted,false);
 assert.equal(result.level1Status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(result.physicalQualification,'UNQUALIFIED_NO_GO');
});
test('safe literal source envelopes pass *model-range screen only*, never silicon qualification',()=>{
 const r=verifyDeckTerminalSOA({deck:deck('1.8'),profile:sky,devices:[d]});
 assert.equal(r.status,'SOA_MODEL_RANGE_SCREEN_PASS');
 assert.equal(r.dynamicTransistorWaveformsVerified,false);
 assert.equal(r.physicallyQualified,false);
});
test('unknown internal output nodes fail closed before ngspice instead of guessing a safe potential',()=>{
 const unknown='VDD vdd 0 1.8\nVG g 0 1.8\n'+
  'Xn internal g 0 0 '+model+' w=1 l=0.15\n.end\n';
 const r=verifyDeckTerminalSOA({deck:unknown,profile:sky,devices:[d]});
 assert.equal(r.status,'SOA_INSUFFICIENT_NODE_BOUNDS');
 assert.ok(r.missing.some(x=>x.nodes.includes('internal')));
});
test('PWL supply worst-case excursion is analyzed even when the nominal value is safe',()=>{
 const r=verifyDeckTerminalSOA({deck:deck('PWL(0 1.8 1e-9 3.3)'),
  profile:sky,devices:[d]});
 assert.equal(r.status,'SOA_OXIDE_OVERSTRESS');
});
test('a 3.3V GF180 model is only screened at its exact declared 3.63V limit',()=>{
 const gf=makeFoundryRailProfile({id:'gf180-core-3v3'});
 const device={model:gf.polarityModels.n,instance:'Xn'};
 const d0='VDD d 0 3.63\nVG g 0 3.63\n'+
  'Xn d g 0 0 '+device.model+' w=1 l=0.28\n.end\n';
 assert.equal(verifyDeckTerminalSOA({deck:d0,profile:gf,
  devices:[device]}).status,'SOA_MODEL_RANGE_SCREEN_PASS');
 const overload=d0.replaceAll('3.63','3.7');
 assert.equal(verifyDeckTerminalSOA({deck:overload,profile:gf,
  devices:[device]}).status,'SOA_OXIDE_OVERSTRESS');
});
