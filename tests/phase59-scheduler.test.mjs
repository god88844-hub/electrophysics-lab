import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scheduleMatrix,validateJob,SAMPLE} from '../js/evidence/phase59-scheduler.js';
test('Systolic tiles produce exact INT8 outputs against independent tensor arithmetic',()=>{
 const r=scheduleMatrix(SAMPLE);
 assert.equal(r.functionalMatchesReference,true);
 assert.deepEqual(r.computedInt8Matrix,[[11,-4],[-13,33],[-1,18]]);
 assert.equal(r.tileCount,2);assert.equal(r.total.validMacs,18);
 assert.ok(r.macUtilization>0&&r.macUtilization<=1);
});
test('SIMT and systolic models share arithmetic but differ in deterministic cycles',()=>{
 const s=scheduleMatrix(SAMPLE);
 const gpu=scheduleMatrix({...SAMPLE,architecture:'simt',lanes:8});
 assert.deepEqual(s.computedInt8Matrix,gpu.computedInt8Matrix);
 assert.notEqual(s.totalCycles,gpu.totalCycles);
 assert.equal(gpu.physicalPowerW,null);
});
test('Conservation of MACs, tile memory bytes, and cycle components',()=>{
 const s=scheduleMatrix(SAMPLE);
 assert.equal(s.totalCycles,s.total.loadCycles+s.total.computeCycles+s.total.storeCycles);
 assert.equal(s.total.validMacs,3*3*2);
 assert.equal(s.total.inputBytes,s.tiles.reduce((a,t)=>a+t.aBytes+t.bBytes,0));
 assert.equal(s.total.outputBytes,s.tiles.reduce((a,t)=>a+t.cBytes,0));
});
test('Scratchpad undercapacity and invalid matrices fail closed',()=>{
 const edits=[x=>x.scratchpadBytes=1,x=>x.A[0][0]=128,x=>x.B[0].pop(),
  x=>x.bytesPerCycle=0,x=>x.architecture='magic',x=>x.lanes=5,
  x=>x.A=[[]],x=>x.clockMHz=Infinity];
 for(const e of edits){const x=structuredClone(SAMPLE);e(x);
  assert.throws(()=>scheduleMatrix(x));}
 // validateJob accepts an under-capacity tile, scheduleMatrix must reject.
 assert.throws(()=>scheduleMatrix({...SAMPLE,scratchpadBytes:1}));
});
test('Only conditional model latency, never measured performance or empirical yield',()=>{
 const a=scheduleMatrix(SAMPLE);
 assert.equal(a.measuredLatencyUs,null);
 assert.equal(a.sourceMatchedHardwareBenchmarks,0);
 assert.equal(a.physicalValidation,'none');
 assert.equal(a.realWorldBuildSuccessPercent,null);
 assert.deepEqual(scheduleMatrix(SAMPLE),a);
});