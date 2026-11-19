import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCustomISA,assembleCustom,decodeCustom,disassembleCustom,runCustomCPU,
 compileStructuredWorkload,compileTinyCLike,INSTRUCTION_BYTES}
 from '../js/scene/stage-p-custom-isa.js';
const isa=createCustomISA();
test('custom 16-quat and 32-bit binary register banks have exact BigInt moduli',()=>{
 assert.equal(isa.registers.find(r=>r.id==='Q0').modulus,'4294967296');
 assert.equal(isa.registers.find(r=>r.id==='B0').radix,2);
 const ternary=createCustomISA({banks:[{name:'T',radix:3,digits:12,count:4}]});
 assert.equal(ternary.registers[0].modulus,String(3n**12n));
 assert.throws(()=>createCustomISA({banks:[{name:'Q',radix:4,digits:40,count:2}]}));
});
test('fixed-size assembler, disassembler and cycle-cost accounting execute math',()=>{
 const compiled=assembleCustom(isa,'LDI Q0, 12\nLDI Q1, 3\nADD Q0, Q1\nMUL Q0, Q1\nOUT Q0\nHALT');
 assert.equal(compiled.bytes.length,6*INSTRUCTION_BYTES);
 const decoded=decodeCustom(isa,compiled.bytes);
 assert.deepEqual(decoded.map(x=>x.op),['LDI','LDI','ADD','MUL','OUT','HALT']);
 assert.equal(disassembleCustom(isa,compiled.bytes)[4].text,'OUT Q0');
 const result=runCustomCPU(isa,compiled);
 assert.equal(result.ok,true);assert.deepEqual(result.outputs,['45']);
 assert.equal(result.cycles,1+1+1+4+2+1);
 assert.equal(result.physicalValidation,'none');
});
test('compiled non-binary bubble sorting programs reorder RAM and output data',()=>{
 for(const values of [[9,3,5,1],[1,6,4,8,0,2],[8,1,1,5,9,7]]){
  const compiled=compileStructuredWorkload(isa,{kind:'sort',values});
  const cpu=runCustomCPU(isa,compiled.bytecode,{maxCycles:100000});
  assert.equal(cpu.halted,true);
  assert.deepEqual(cpu.outputs,values.slice().sort((a,b)=>a-b).map(String));
 }
});
test('ternary 12-trit arithmetic and supported C-like frontend execute',()=>{
 const t=createCustomISA({banks:[{name:'T',radix:3,digits:12,count:4}]});
 const compiled=compileTinyCLike(t,'let T0 = 13; let T1 = 3; T0 = T0 * T1; print(T0);');
 assert.deepEqual(runCustomCPU(t,compiled.bytecode).outputs,['39']);
 const math=compileStructuredWorkload(t,{kind:'math',a:5,b:8});
 assert.deepEqual(runCustomCPU(t,math.bytecode).outputs,['104']);
});
test('hostile inputs and malformed ISA bytecode fail closed',()=>{
 assert.throws(()=>compileTinyCLike(isa,'eval(process.exit());'),/Unsupported/);
 assert.throws(()=>assembleCustom(isa,'LDI Q0, 1\nJMP missing\nHALT'),/missing branch label/);
 assert.throws(()=>assembleCustom(isa,'OUTM 5000\nHALT'),/outside RAM/);
 const malformed=assembleCustom(isa,'HALT').bytes;
 malformed[0]=255;
 assert.throws(()=>runCustomCPU(isa,malformed),/opcode/);
 assert.equal(runCustomCPU(isa,assembleCustom(isa,'JMP loop\nloop: JMP loop'),
   {maxCycles:9}).halted,false);
});
