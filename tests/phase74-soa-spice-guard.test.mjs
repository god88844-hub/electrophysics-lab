import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runMvlNgspiceMeasurements}
 from '../js/evidence/phase74-noise-margins.js';
import {makeFoundryRailProfile}
 from '../js/evidence/phase73-soa.js';
const deck='* native simulator must not run\n.lib "/missing/sky130.lib.spice" tt\n'+
 'Xn d g s b sky130_fd_pr__nfet_01v8 w=1 l=0.15\n.end';
test('pre-SPICE gate rejects foundry netlist without four-terminal MOS voltage samples',async()=>{
 const x=await runMvlNgspiceMeasurements({
  exe:'/does/not/exist/ngspice',dcDeck:deck,transientDeck:deck});
 assert.equal(x.status,'SOA_INSUFFICIENT_NODE_BOUNDS');
 assert.equal(x.verifiedPdk,false);
});
test('overvoltage foundry MOS cannot reach native ngspice regardless of executable',async()=>{
 const profile=makeFoundryRailProfile({id:'sky130-core-1v8'});
 const x=await runMvlNgspiceMeasurements({
  exe:'/does/not/exist/ngspice',dcDeck:deck,transientDeck:deck,
  soaNetlist:{profile,devices:[{instance:'Xn',model:'sky130_fd_pr__nfet_01v8',
   samples:[{gateV:3.3,drainV:3.3,sourceV:0,bodyV:0}]}]}});
 assert.equal(x.status,'SOA_OXIDE_OVERSTRESS');
 assert.equal(x.reason,'native-ngspice-blocked-by-soa');
 assert.equal(x.physicalQualification,false);
});
test('incorrect transistor-instance mapping cannot attest another circuit',async()=>{
 const profile=makeFoundryRailProfile({id:'sky130-core-1v8'});
 const x=await runMvlNgspiceMeasurements({
  exe:'/does/not/exist/ngspice',dcDeck:deck,transientDeck:deck,
  soaNetlist:{profile,devices:[{instance:'Xbad',model:'sky130_fd_pr__nfet_01v8',
   samples:[{gateV:1.8,drainV:1.8,sourceV:0,bodyV:0}]}]}});
 assert.equal(x.status,'SOA_INSUFFICIENT_NODE_BOUNDS');
});
