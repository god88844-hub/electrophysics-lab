import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeRequiredNativeStageMCampaign,inspectDeclaredMismatchTrialDeck}
 from '../js/evidence/stage-m-native-monte-carlo.js';
test('4000 Q4 PEX and 2400 multi-radix ALU native trials planned but NOT run',()=>{
 const c=makeRequiredNativeStageMCampaign();
 assert.equal(c.primitiveTrialCount,4000);
 assert.equal(c.aluTrialCount,2400);
 assert.equal(c.totalRequiredNgspiceTrials,6400);
 assert.equal(c.level1Yield,'UNKNOWN');
 assert.equal(c.physicalQualification,'UNQUALIFIED_NO_GO');
 for(const name of ['q4_thresh_det','q4_inv','q4_mux4','q4_half_adder']){
  const rows=c.q4PrimitiveTrials.filter(x=>x.cell===name);
  assert.equal(rows.length,1000);
  for(const temp of [-40,25,85,125])
   assert.equal(rows.filter(x=>x.temperatureC===temp).length,250);
  assert.equal(new Set(rows.map(x=>x.seed)).size,1000);
 }
 assert.equal(new Set([...c.q4PrimitiveTrials,...c.aluTrials].map(x=>x.seed)).size,6400);
 assert.ok(c.aluTrials.every(x=>x.status==='NOT_RUN'));
});
test('tt_mm alone cannot silently enable Monte Carlo',()=>{
 const l='/opt/pdk/sky130A/libs.tech/ngspice/sky130.lib.spice';
 const p='/opt/evidence/q4_inv-pex.spice';
 const mk=(extra='')=>[
  '.lib "'+l+'" tt','.include "'+p+'"',
  '.option seed=12001','.temp 25',extra,'.tran 1n 1u','.end'
 ].join('\n');
 const args={expectedLibraryPath:l,expectedPexPath:p,seed:12001,temperatureC:25};
 assert.equal(inspectDeclaredMismatchTrialDeck({deck:mk(),...args}).status,'INSUFFICIENT_MODEL_DATA');
 const okay=inspectDeclaredMismatchTrialDeck({deck:mk('.param mc_mm_switch=1'),...args});
 assert.equal(okay.explicitMismatchEnabled,true);
 assert.equal(okay.actualModelCorner,'tt');
 assert.equal(inspectDeclaredMismatchTrialDeck({
   deck:mk('.param mc_mm_switch=1').replace('" tt','" tt_mm'),...args
 }).status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(okay.nativeSpiceAuthorized,false);
 assert.equal(okay.level1Yield,'UNKNOWN');
 for(const injection of ['.param mc_mm_switch=0',
  '.param mc_mm_switch=1\n.param mc_mm_switch=0',
  '.param mc_mm_switch=2']){
  assert.equal(inspectDeclaredMismatchTrialDeck({deck:mk(injection),...args}).status,'INSUFFICIENT_MODEL_DATA');
 }
 assert.equal(inspectDeclaredMismatchTrialDeck({
  deck:mk('.param mc_mm_switch=1').replace('.option seed=12001','.option seed=0'),
  ...args}).status,'INSUFFICIENT_MODEL_DATA');
});
