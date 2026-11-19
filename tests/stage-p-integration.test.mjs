import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCustomISA,compileStructuredWorkload,runCustomCPU}
 from '../js/scene/stage-p-custom-isa.js';
import {createCustomAccelerator,executeOnnxAccelerator}
 from '../js/scene/stage-p-accelerator.js';
import {createVirtualComputer,bootVirtualComputer} from '../js/scene/stage-p-virtual-computer.js';
import {createHybridArchitecture,runHybridBellFeedback}
 from '../js/scene/stage-p-hybrid-qpu.js';
test('Stage P: Q4 16-quat CPU compiles sort, ONNX accelerated profile and hybrid feedback',()=>{
 const isa=createCustomISA();
 const sorted=runCustomCPU(isa,compileStructuredWorkload(isa,
  {kind:'sort',values:[4,1,7,3,6]}).bytecode);
 assert.deepEqual(sorted.outputs,['1','3','4','6','7']);
 const cases=JSON.parse(readFileSync(new URL('../benchmarks/phase9/graphs.json',import.meta.url),'utf8')).cases;
 const tpu=executeOnnxAccelerator(createCustomAccelerator({rows:2,cols:2,
  macEnergyPJ:.5,staticPowerW:.2,thermalResistanceKW:4}),cases[0]);
 assert.deepEqual(tpu.reference.outputs.Y.values,[13,0,0,18]);
 const board=bootVirtualComputer(createVirtualComputer({isa,
  romSource:'LDI Q0, 3\nOUT Q0\nHALT'}));
 assert.deepEqual(board.cpu.outputs,['3']);
 const feedback=runHybridBellFeedback(createHybridArchitecture({isa}),{injectBitFlip:true});
 assert.equal(feedback.corrected,true);
 assert.equal(feedback.physicalValidation,'none');
 assert.equal(sorted.simulatedPhysicalBuildSuccessPercent,'UNKNOWN');
 assert.equal(tpu.realWorldTOPS,null);
});
