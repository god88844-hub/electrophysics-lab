import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/chip/components.js';
import {Diagram} from '../js/core/diagram.js';
import {createInventionLedger,createInventionBranch,
 commitInventionRevision,compareInventionRevisions,verifyInventionLedger,
 stableSerialize} from '../js/scene/stage-o-invention-ledger.js';
const design=()=>{
 const d=new Diagram({id:'ledger-fixed',lab:'chip',name:'Lab'});
 d.addBlock('chip.RES',{id:'r1',params:{r:100}});
 return d;
};
test('branch and commit hashes replay deterministically on canonical snapshots',async()=>{
 const ledger=createInventionLedger({name:'Q4 exploration'}),d=design();
 const x=await commitInventionRevision(ledger,{diagram:d,message:'base'});
 createInventionBranch(ledger,'agent/idea-1');
 d.block('r1').params.r=220;
 const y=await commitInventionRevision(ledger,{branch:'agent/idea-1',
  diagram:d,actor:'agent',message:'improved resistance'});
 assert.notEqual(x.id,y.id);
 assert.equal((await verifyInventionLedger(ledger)).status,'VERIFIED_LOCAL_HASH_CHAIN');
 const diff=compareInventionRevisions(ledger,x.id,y.id);
 assert.deepEqual(diff.scene.changed,['r1']);
 assert.equal(diff.metrics.simulatedPhysicalBuildSuccessPercent.after,'UNKNOWN');
 const again=createInventionLedger({name:'Q4 exploration'});
 const d2=design();
 const a=await commitInventionRevision(again,{diagram:d2,message:'base'});
 createInventionBranch(again,'agent/idea-1');
 d2.block('r1').params.r=220;
 const b=await commitInventionRevision(again,{branch:'agent/idea-1',
  diagram:d2,actor:'agent',message:'improved resistance'});
 assert.equal(a.id,x.id);assert.equal(b.id,y.id);
});
test('tampered revision bytes and fake calibrated yield are not admitted',async()=>{
 const ledger=createInventionLedger(),d=design();
 await commitInventionRevision(ledger,{diagram:d,metrics:{
  simulatedPhysicalBuildSuccessPercent:99,calibratedModelEvidenceAuthenticated:true}});
 const id=ledger.branches.main;
 assert.equal(ledger.commits[id].metrics.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 ledger.commits[id].snapshot.blocks[0].params.r=17;
 assert.equal((await verifyInventionLedger(ledger)).status,'INVALID_LEDGER');
});
test('stable serialization rejects unsupported objects and order changes',()=>{
 assert.equal(stableSerialize({b:2,a:1}),stableSerialize({a:1,b:2}));
 assert.throws(()=>stableSerialize({v:NaN}),/Nonfinite/);
 assert.throws(()=>createInventionBranch(createInventionLedger(),'../../bad'));
});

test('explicit 3D mm envelopes are versioned and visibly diffed',async()=>{
 const ledger=createInventionLedger(),d=design();
 d.meta.dimensionedCAD={parts:{r1:{xMm:0,yMm:0,zMm:0,
  widthMm:10,heightMm:5,depthMm:10}}};
 const a=await commitInventionRevision(ledger,{diagram:d});
 d.meta.dimensionedCAD.parts.r1.xMm=20;
 const b=await commitInventionRevision(ledger,{diagram:d});
 const diff=compareInventionRevisions(ledger,a.id,b.id);
 assert.equal(diff.scene.mmLayoutChanged.length,1);
 assert.equal(diff.scene.mmLayoutChanged[0].before.xMm,0);
 assert.equal(diff.scene.mmLayoutChanged[0].after.xMm,20);
});
