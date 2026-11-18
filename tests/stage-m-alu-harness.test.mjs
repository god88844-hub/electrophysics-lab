import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildFoundryALUInputVectors,assembleFoundryALUCandidate,
 inspectExternalALUDigitCell} from '../js/evidence/stage-m-alu-harness.js';

test('identical mathematical workloads are reproducible for 4/8-bit/trit/quat ALU comparisons',()=>{
 for(const radix of [2,3,4])for(const width of [4,8]){
  const a=buildFoundryALUInputVectors({radix,width});
  const b=buildFoundryALUInputVectors({radix,width});
  assert.deepEqual(a,b);
  assert.equal(a.vectors.length,16);
  assert.ok(a.vectors.every(v=>v.a.length===width&&v.b.length===width));
  assert.equal(a.physicallyQualified,false);
 }
});
test('no invented Q4 transistor digit cell ever produces a qualified ALU netlist',()=>{
 const x=assembleFoundryALUCandidate({foundry:'SKY130',radix:4,width:8});
 assert.equal(x.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(x.deck,null);
 assert.equal(x.level1Status,'INSUFFICIENT_MODEL_DATA');
 const overstress=assembleFoundryALUCandidate({foundry:'SKY130',radix:4,
  width:4,rippleFraction:.1});
 assert.equal(overstress.status,'SOA_OXIDE_OVERSTRESS');
 assert.equal(overstress.deck,null);
});
test('supplied transistor cell is only a SOURCE-BOUND, unverified prototype, not foundry signoff',()=>{
 const source=[
  '.subckt alu_digit a b cin s cout vdd vss',
  '* UNVERIFIED fixture cell: transistor references do NOT implement a real Q4 ALU',
  'Xn s a 0 0 sky130_fd_pr__nfet_01v8 w=1 l=0.15',
  'Xp s a vdd vdd sky130_fd_pr__pfet_01v8 w=2 l=0.15',
  '.ends alu_digit'
 ].join('\n');
 const foundry=assembleFoundryALUCandidate({foundry:'SKY130',
  radix:4,width:4,cellSource:source,
  modelLibraryPath:'/test/pdk/sky130.lib.spice'});
 assert.equal(foundry.status,'TRANSISTOR_NETLIST_ASSEMBLED_NOT_PHYSICALLY_VALIDATED');
 assert.equal(foundry.ngspiceExecuted,false);
 assert.equal(foundry.soAUnderDynamicWaveformsVerified,false);
 assert.equal(foundry.level1Status,'INSUFFICIENT_MODEL_DATA');
 assert.match(foundry.deck,/\.lib "\/test\/pdk\/sky130.lib.spice" tt/);
 assert.match(foundry.deck,/\.print tran/);
 assert.doesNotMatch(foundry.deck,/\.control/i);
 assert.equal(foundry.expected.length,16);
 const cell=inspectExternalALUDigitCell({source,
  allowedModels:foundry.profile.deviceModels});
 assert.equal(cell.inputOutputFunctionVerified,false);
});
test('unsafe arbitrary behavioral sources and shell directives are not admitted',()=>{
 const source=['.subckt alu_digit a b cin s cout vdd vss',
  'Xn s a 0 0 sky130_fd_pr__nfet_01v8 w=1 l=.15',
  '.control','shell rm something','.endc',
  '.ends alu_digit'].join('\n');
 const result=inspectExternalALUDigitCell({source,
  allowedModels:['sky130_fd_pr__nfet_01v8','sky130_fd_pr__pfet_01v8']});
 assert.equal(result.status,'INSUFFICIENT_MODEL_DATA');
});

test('ALU source harness requires exact foundry process corners and preserves unqualified GF180 status',()=>{
 const gf=assembleFoundryALUCandidate({foundry:'GF180MCU',
  corner:'typical',radix:4,width:8});
 assert.equal(gf.status,'INSUFFICIENT_MODEL_DATA');
 assert.deepEqual(gf.profile.nominalRailsV,[0,1.1,2.2,3.3]);
 assert.equal(gf.level1Status,'INSUFFICIENT_MODEL_DATA');
 assert.throws(()=>assembleFoundryALUCandidate({foundry:'GF180MCU',
  corner:'tt',radix:4,width:8}),/foundry\/corner/);
 const sky=assembleFoundryALUCandidate({foundry:'SKY130',
  corner:'tt_mm',radix:4,width:8});
 assert.equal(sky.level1Status,'INSUFFICIENT_MODEL_DATA');
});

test('ALU generated PDK stimulus uses nominal regulated Q4 codes, not the +5% LDO peak',()=>{
 const c=assembleFoundryALUCandidate({foundry:'SKY130',radix:4,width:4});
 assert.deepEqual(c.profile.nominalRailsV,[0,.6,1.2,1.8]);
 assert.ok(Math.abs(c.profile.worstCaseSupplyEnvelopeV.maximum-1.89)<1e-12);
 assert.equal(c.profile.regulationMode,'LDO_REGULATED');
 assert.equal(c.soa.status,'SOA_PROFILE_SCREEN_PASS');
 const unregulated=assembleFoundryALUCandidate({foundry:'SKY130',radix:4,width:4,
  railProfileId:'sky130-core-1v65-unregulated'});
 assert.deepEqual(unregulated.profile.nominalRailsV,[0,.55,1.1,1.65]);
 assert.ok(Math.abs(unregulated.profile.worstCaseSupplyEnvelopeV.maximum-1.815)<1e-12);
 assert.equal(unregulated.soa.status,'SOA_PROFILE_SCREEN_PASS');
 const thick=assembleFoundryALUCandidate({foundry:'SKY130',radix:4,width:4,
  railProfileId:'sky130-thick-3v3'});
 assert.equal(thick.profile.nominalRailsV.at(-1),3.3);
 assert.equal(thick.soa.status,'SOA_PROFILE_SCREEN_PASS');
 assert.throws(()=>assembleFoundryALUCandidate({foundry:'GF180MCU',
  railProfileId:'sky130-core-1v8',corner:'typical'}),/Invalid foundry/);
});
