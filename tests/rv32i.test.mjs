import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRV32Words, rv32WordsToBytes, RV32I, runRV32I } from '../js/labs/rv32i/rv32i.js';
import { rv32iLab } from '../js/labs/rv32i/lab.js';
import { getLab } from '../js/core/registry.js';
import { App } from '../js/ui/app.js';

const halt = 0x00100073;
const run = (words, opts) => runRV32I(new Uint32Array([...words,halt]),opts);
test('RV32I: registered as a separate computing lab, IL-8 remains independent',()=>{
  assert.equal(getLab('rv32i'),rv32iLab);
  assert.equal(typeof App,'function');
  assert.equal(rv32iLab.id,'rv32i');
});
test('RV32I: strict source parsing and little-endian instruction encoding',()=>{
  const words=parseRV32Words('00500093  # addi x1, x0, 5\n0x00100073; ebreak');
  assert.deepEqual([...words],[0x00500093,0x00100073]);
  assert.deepEqual([...rv32WordsToBytes(words)],[0x93,0,0x50,0,0x73,0,0x10,0]);
  assert.throws(()=>parseRV32Words('ADD X1,X2,X3'),/line 1/);
  assert.throws(()=>parseRV32Words('0000013'),/line 1/);
  assert.throws(()=>parseRV32Words('0000000x'),/line 1/);
  assert.throws(()=>parseRV32Words(''),/empty/);
  assert.throws(()=>rv32WordsToBytes([0x1_0000_0000]),/Invalid 32-bit/);
  assert.throws(()=>rv32WordsToBytes([-1]),/Invalid 32-bit/);
});
test('RV32I: instruction-level ADD and immutable x0',()=>{
  const cpu=run([0x00500093,0x00700113,0x002081b3,0x00700013]);
  assert.equal(cpu.ok,true);
  assert.equal(cpu.stopReason,'ebreak');
  assert.equal(cpu.regs[1],5);
  assert.equal(cpu.regs[2],7);
  assert.equal(cpu.regs[3],12);
  assert.equal(cpu.regs[0],0);
  assert.equal(cpu.retired,4);
  assert.equal(cpu.physicalValidation,'none');
  assert.equal(cpu.realWorldBuildSuccessPercent,null);
});
test('RV32I: signed and unsigned loads, stores, memory, little-endian',()=>{
  const cpu=new RV32I({program:new Uint32Array([
    0x04000093,0x0ff00113,0x00208023,0x00008183,0x0000c203,
    0x00209123,0x00209283,0x0020d303,
    0x0020a223,0x0040a383,halt,
  ])});
  const r=cpu.run();
  assert.equal(r.ok,true);
  assert.deepEqual([r.regs[3],r.regs[4],r.regs[5],r.regs[6],r.regs[7]],
    [0xffffffff,255,255,255,255]);
  assert.deepEqual([...cpu.mem.slice(64,72)],[255,0,255,0,255,0,0,0]);
  assert.equal(r.writes.length,3);
});
test('RV32I: branch equal taken vs not taken and link jumps',()=>{
  const branch=run([
    0x00500093,0x00500113,0x00208463,0x06300193,0x02a00193,
  ]);
  assert.equal(branch.regs[3],42);
  const notTaken=run([0x00001163,0x02a00193]);
  assert.equal(notTaken.ok,true);
  assert.equal(notTaken.regs[3],42);
  const jumps=run([
    0x008002ef,0x06300193,0x02a00193,
  ]);
  assert.equal(jumps.regs[3],42);
  assert.equal(jumps.regs[5],4);
});
test('RV32I: upper immediates, signed wrap and unsigned comparisons',()=>{
  const cpu=run([
    0xfffff137,0x40115193,0xfff13213,0x00012293, // x2=-4096, x3=-2048, sltiu x4, x2, -1, slti x5,-?
  ]);
  assert.equal(cpu.regs[2],0xfffff000);
  assert.equal(cpu.regs[3],0xfffff800);
  assert.equal(cpu.regs[4],1);
});
test('RV32I: SRA arithmetic register shift must use RV32I funct7=0x20',()=>{
  const cpu=run([0xfff00113,0x00100093,0x401151b3]);
  assert.equal(cpu.ok,true,'SRA is a mandatory RV32I base instruction');
  assert.equal(cpu.regs[3],0xffffffff);
});
test('RV32I: illegal M extension, unsupported CSR and FENCE.I must not silently pass',()=>{
  for(const word of [0x02000033,0x0000100f,0x00001073,0x00000000]){
    const cpu=runRV32I(new Uint32Array([word]));
    assert.equal(cpu.ok,false);
    assert.equal(cpu.stopReason,'illegal-instruction');
  }
});
test('RV32I: taken branch misalignment traps, untaken branch does not trap',()=>{
  const bad=runRV32I(new Uint32Array([0x00000163]));
  assert.equal(bad.ok,false);
  assert.equal(bad.stopReason,'misaligned-access');
  const good=run([0x00001163,0x00700193]);
  assert.equal(good.ok,true);
  assert.equal(good.regs[3],7);
});
test('RV32I: misaligned load traps without partially changing registers',()=>{
  const cpu=run([0x00100093,0x0000a103]);
  assert.equal(cpu.ok,false);
  assert.equal(cpu.stopReason,'misaligned-access');
  assert.equal(cpu.regs[2],0);
});
test('RV32I: explicit ECALL trap is not a successful OS exit',()=>{
  const cpu=runRV32I(new Uint32Array([0x00000073]));
  assert.equal(cpu.ok,false);
  assert.equal(cpu.stopReason,'ecall');
  assert.match(cpu.trap.detail,/environment call/);
});
test('RV32I: bounded infinite loop produces a failing timeout, never a PASS',()=>{
  const cpu=runRV32I(new Uint32Array([0x0000006f]),{maxSteps:75,maxTrace:8});
  assert.equal(cpu.ok,false);
  assert.equal(cpu.stopReason,'step-limit');
  assert.equal(cpu.retired,75);
  assert.equal(cpu.traces.length,8);
});
test('RV32I: off-map jump fails when fetching, rather than reading zeros',()=>{
  const cpu=runRV32I(new Uint32Array([0x00008067]),{maxSteps:10});
  assert.equal(cpu.ok,false);
  assert.equal(cpu.stopReason,'step-limit'); // jalr x0,x1,0 loops until limit
  const invalid=runRV32I(new Uint32Array([0x4000006f]),{memoryBytes:256});
  assert.equal(invalid.ok,false);
  assert.equal(invalid.stopReason,'instruction-access-fault');
});
test('RV32I: bad source and unachieved expectation fail lab validation',()=>{
  const missing={id:'bad',name:'bad',lab:'rv32i',blocks:[],wires:[],meta:{source:'bad'}};
  assert.equal(rv32iLab.report(missing).verdict,'fail');
  const good={id:'good',name:'good',lab:'rv32i',blocks:[],wires:[],meta:{
    source:'00500093\n00700113\n002081b3\n00100073',expectedRegister:3,expectedValue:12,maxSteps:100,
  }};
  assert.equal(rv32iLab.report(good).verdict,'pass');
  good.meta.expectedValue=13;
  assert.equal(rv32iLab.report(good).verdict,'fail');
});
test('RV32I: address and execution input budget checks never pass invalid inputs',()=>{
  assert.throws(()=>new RV32I({program:new Uint32Array([halt]),base:1}),/aligned/);
  assert.throws(()=>new RV32I({program:new Uint32Array([halt]),memoryBytes:8}),/memory size/);
  assert.throws(()=>runRV32I(new Uint32Array([halt]),{maxSteps:0}),/budget/);
  assert.throws(()=>new RV32I({program:new Uint8Array(100),memoryBytes:64}),/exceeds RAM/);
});
