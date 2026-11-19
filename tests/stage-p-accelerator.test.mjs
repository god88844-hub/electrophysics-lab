import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCustomAccelerator,executeSystolicMatMul,executeOnnxAccelerator}
 from '../js/scene/stage-p-accelerator.js';
import {matmul} from '../js/labs/ai/tensor.js';
const cases=JSON.parse(readFileSync(new URL('../benchmarks/phase9/graphs.json',import.meta.url),'utf8')).cases;
test('custom systolic PE grid, SRAM, HBM and tensor control have 3D proxies',()=>{
 const x=createCustomAccelerator({rows:4,cols:3});
 assert.equal(x.blocks.filter(b=>b.kind==='mac-pe').length,12);
 assert.ok(x.blocks.some(b=>b.kind==='scratchpad-sram'));
 assert.ok(x.blocks.some(b=>b.kind==='dram-hbm-interface'));
 assert.equal(x.physicalValidation,'none');
});
test('real systolic f32 MAC kernel matches independent existing tensor arithmetic',()=>{
 const x=createCustomAccelerator({rows:2,cols:2,
  macEnergyPJ:2,staticPowerW:1,thermalResistanceKW:8});
 const A=[[1,2,3],[-1,3,2]],B=[[2,-1],[0,5],[4,2]];
 const got=executeSystolicMatMul(x,A,B);
 assert.deepEqual(got.output,matmul(A,B,{precision:'f32'}));
 assert.ok(got.clockCycles>0);assert.ok(got.modeledTOPS>0);
 assert.ok(got.assumedTemperatureC>x.ambientC);
 assert.equal(got.measuredTemperatureC,null);
 assert.equal(got.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.ok(got.thermalMap.every(b=>b.source==='uniform-assumed-thermal-resistance'));
});
test('real Phase9 ONNX subset inference is replayed with independently modeled accelerator profile',()=>{
 const x=createCustomAccelerator({rows:2,cols:2,
  macEnergyPJ:1,staticPowerW:.1,thermalResistanceKW:3});
 const graph=structuredClone(cases.find(x=>x.id==='matmul-relu'));
 const result=executeOnnxAccelerator(x,graph);
 assert.deepEqual(result.reference.outputs.Y.values,[13,0,0,18]);
 assert.equal(result.acceleratorNodeProfiles.length,1);
 assert.equal(result.acceleratorNodeProfiles[0].acceleratorKernelExecution,'executed');
 assert.deepEqual(result.acceleratorNodeProfiles[0].kernelOutput,[[13,-4],[-7,18]]);
 assert.equal(result.acceleratorKernelExecutionVerified,true);
 assert.equal(result.acceleratorExecutionVerified,false);
 assert.ok(result.totalCycles>0);
 assert.equal(result.realWorldTOPS,null);
});
test('missing calibrated energy and thermal values remain UNKNOWN',()=>{
 const x=createCustomAccelerator();
 const r=executeSystolicMatMul(x,[[2]],[[3]]);
 assert.deepEqual(r.output,[[6]]);
 assert.equal(r.assumedTemperatureC,null);
 assert.equal(r.assumedEnergyJ,null);
 assert.throws(()=>executeSystolicMatMul(x,[[1,2]],[[1,2]]),/mismatch/);
});
