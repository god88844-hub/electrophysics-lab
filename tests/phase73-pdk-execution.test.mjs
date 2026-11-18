import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {inspectPinnedPdkClosure,runSOAGuardedFoundryDeck,planRealMultiCornerSPICE,
 inspectDeclaredModelCorners,bindSPICEDeviceInstances}
 from '../js/evidence/stage-m-foundry-spice.js';
import {makeFoundryRailProfile} from '../js/evidence/phase73-soa.js';

test('missing full PDK closure cannot be mistaken for a calibrated ngspice model tree',async()=>{
 const root=await mkdtemp(join(tmpdir(),'stage-m-pdk-missing-'));
 try{
  const result=await inspectPinnedPdkClosure({pdkRoot:root,pdk:'SKY130'});
  assert.equal(result.status,'INSUFFICIENT_MODEL_DATA');
  assert.ok(result.missing.includes('models/sky130.lib.spice'));
  assert.equal(result.calibrationVerified,false);
  const gf=await inspectPinnedPdkClosure({pdkRoot:root,pdk:'GF180MCU'});
  assert.equal(gf.status,'INSUFFICIENT_MODEL_DATA');
  assert.ok(gf.missing.includes('models/ngspice/design.ngspice'));
 }finally{await rm(root,{recursive:true,force:true});}
});
test('fake model file at pinned location is rejected by original Git blob identity',async()=>{
 const root=await mkdtemp(join(tmpdir(),'stage-m-pdk-fake-'));
 try{
  await mkdir(join(root,'models'));
  await writeFile(join(root,'models','sky130.lib.spice'),
   '.lib tt\n* a fabricated model file\n.endl\n');
  await assert.rejects(inspectPinnedPdkClosure({pdkRoot:root,pdk:'SKY130'}),
   /byte count|hash/i);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('MOS terminal overstress blocks native ngspice BEFORE any executable is invoked',async()=>{
 const profile=makeFoundryRailProfile({id:'sky130-core-1v8'});
 const result=await runSOAGuardedFoundryDeck({profile,
  devices:[{model:profile.polarityModels.n,samples:[
   {gateV:3.3,drainV:3.3,sourceV:0,bodyV:0}]}],
  exe:'/missing/ngspice',deck:'* never execute\nR1 a 0 1k\n.end',
  pdkRoot:'/missing/pdk'});
 assert.equal(result.status,'SOA_OXIDE_OVERSTRESS');
 assert.equal(result.ngspiceExecuted,false);
 assert.equal(result.physicalQualification,'UNQUALIFIED_NO_GO');
});
test('corner matrix enumerates every radix and 4/8 digit at three process and four temperatures',()=>{
 for(const foundry of ['SKY130','GF180MCU']){
  const p=planRealMultiCornerSPICE({foundry});
  assert.equal(p.cornerCases,72);
  assert.equal(p.cornerMatrix.length,72);
  assert.deepEqual([...new Set(p.cornerMatrix.map(x=>x.tempC))],[-40,25,85,125]);
  assert.equal(p.fullAluMonteCarloPerConfiguration,100);
  assert.equal(p.requiredPrimitiveMonteCarloTrials,1000);
  assert.equal(p.realNgspiceRunsCompleted,0);
  assert.equal(p.level1Yield,'UNKNOWN');
 }
});

test('an unpinned tt_mm library corner cannot be substituted with tt silently',()=>{
 const originalStyle='.lib tt\n.include "../cells/example__mismatch.corner.spice"\n.endl\n'+
  '.lib ss\n.endl\n.lib ff\n.endl\n';
 const r=inspectDeclaredModelCorners({sourceText:originalStyle,
  foundry:'SKY130',required:['tt','tt_mm','ss','ff']});
 assert.deepEqual(r.corners,['ff','ss','tt']);
 assert.deepEqual(r.missing,['tt_mm']);
 assert.equal(r.status,'INSUFFICIENT_MODEL_DATA');
 assert.equal(r.mismatchDistributionIndependentlyCalibrated,false);
});

test('claims must bind to exact transistor instance IDs in the SPICE deck',()=>{
 const deck='* foundry model bindings\n'+
  'Xn d g 0 0 sky130_fd_pr__nfet_01v8 w=1 l=0.15\n'+
  'Xp d g vdd vdd sky130_fd_pr__pfet_01v8 w=2 l=0.15\n.end';
 const models=[
  {instance:'Xn',model:'sky130_fd_pr__nfet_01v8'},
  {instance:'Xp',model:'sky130_fd_pr__pfet_01v8'}
 ];
 const r=bindSPICEDeviceInstances({deck,devices:models});
 assert.equal(r.status,'SOA_DECK_INSTANCE_INVENTORY_MATCHED');
 assert.equal(r.dynamicWaveformSOAVerified,false);
 assert.equal(bindSPICEDeviceInstances({deck,devices:[models[0]]}).status,
  'SOA_INSUFFICIENT_NODE_BOUNDS');
 assert.equal(bindSPICEDeviceInstances({deck,devices:[
  {...models[0],instance:'Xfake'},models[1]]}).status,
  'SOA_INSUFFICIENT_NODE_BOUNDS');
});
