import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHybridArchitecture,runHybridBellFeedback,
 runVariationalHybridReference} from '../js/scene/stage-p-hybrid-qpu.js';
test('hybrid Q4 classical controller corrects model parity syndrome with cycle timestamps',()=>{
 const a=createHybridArchitecture({readoutLatencyCycles:20,
  commandLatencyCycles:4,feedbackDeadlineCycles:70});
 for(const injectBitFlip of [false,true]){
  const x=runHybridBellFeedback(a,{seed:92,injectBitFlip});
  assert.equal(x.status,'IDEAL_REFERENCE_FEEDBACK_COMPLETE');
  assert.equal(x.syndrome,injectBitFlip?1:0);
  assert.equal(x.action,x.syndrome);
  assert.equal(x.corrected,true);
  assert.ok(x.timeline[3].cycle<=70);
  assert.equal(x.hardwareFidelityVerified,false);
  assert.equal(x.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
  assert.deepEqual(x,runHybridBellFeedback(a,{seed:92,injectBitFlip}));
 }
});
test('missed classical feedback deadline is reported, never counted as success',()=>{
 const a=createHybridArchitecture({readoutLatencyCycles:200,
  commandLatencyCycles:10,feedbackDeadlineCycles:70});
 const r=runHybridBellFeedback(a,{injectBitFlip:true});
 assert.equal(r.status,'FEEDBACK_DEADLINE_MISSED');
 assert.equal(r.physicalValidation,'none');
});
test('variational gate sweep executes ideal local quantum statevector',()=>{
 const a=createHybridArchitecture();
 const r=runVariationalHybridReference(a,{goal:'min-energy'});
 assert.equal(r.status,'IDEAL_VARIATIONAL_REFERENCE');
 assert.ok(r.best.zExpectation<-.999999);
 assert.equal(r.realHardwareEnergy,null);
 assert.throws(()=>runVariationalHybridReference(a,{angles:[Infinity,0]}));
});
