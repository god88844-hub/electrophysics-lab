import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BASELINE,verifyWorkflow,runWorkflow} from '../js/evidence/phase64-cross-domain.js';
test('Pinned four-stage quantum-to-CPU model has exact typed transfer',()=>{
 const r=runWorkflow(BASELINE);assert.ok(Math.abs(r.canonicalResult.p00-0.5)<1e-12);
 assert.equal(r.canonicalResult.adcByte,128);
 assert.equal(r.canonicalResult.cpuByte,128);
 assert.equal(r.canonicalResult.outputBit,1);
 assert.deepEqual(r,runWorkflow(BASELINE));
});
test('Classical dephasing preserves Bell populations, not invented source photons',()=>{
 const x=structuredClone(BASELINE);x.stages[0].config.dephasingProbability=.5;
 const a=runWorkflow(x);assert.equal(a.canonicalResult.adcByte,128);
 assert.equal(a.hardwareCalibrationSamples,0);
});
test('Wrong order, type, CPU code, ids, or invalid noise fails before execution',()=>{
 const edits=[
  x=>x.stages[1].source='unrelated',
  x=>x.stages[1].config.levels=1024,
  x=>x.stages[2].config.assembly='NOP\nHLT',
  x=>x.stages[2].config.inputPort=2,
  x=>x.stages[1].id=x.stages[0].id,
  x=>x.stages[0].config.dephasingProbability=NaN,
  x=>x.stages.push(structuredClone(x.stages[3])),
  x=>x.stages[3].config.threshold=127
 ];
 for(const change of edits){const x=structuredClone(BASELINE);change(x);
  assert.throws(()=>verifyWorkflow(x));}
});
test('Result only validates connected software values, not an experimental lab',()=>{
 const r=runWorkflow(BASELINE);assert.equal(r.coupledPhysicalModels,false);
 assert.equal(r.physicalVerdict,'unknown');assert.equal(r.realWorldBuildSuccessPercent,null);
});