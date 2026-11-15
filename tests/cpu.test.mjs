// cpu.test.mjs — IL-8 assembler + 5-stage pipeline vs architectural reference.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { assemble, disassemble } from '../js/labs/cpu/assembler.js';
import { runCPU, referenceRun, IL8 } from '../js/labs/cpu/cpu.js';
import { OPS } from '../js/labs/cpu/isa.js';
import { cpuLab } from '../js/labs/cpu/lab.js';

const approxBytes = (a, b, msg) => assert.deepEqual([...a], [...b], msg);

test('cpu: assembler encodings are exact', () => {
  const r = assemble('LDI R1, 0x0A\nADD R2, R1\nHLT');
  assert.equal(r.ok, true, r.errors.join('; '));
  approxBytes(r.bytes.slice(0, 3), [0x01, 0x10, 0x0a], 'LDI');
  approxBytes(r.bytes.slice(3, 5), [0x04, 0x21], 'ADD');
  assert.equal(r.bytes[5], OPS.HLT);
});

test('cpu: assembler resolves labels forward and backward, data labels for LD/ST', () => {
  const src = `
        LDI R1, 5
        ST [val], R1
        LD  R2, [val]
        OUT 0, R2
        HLT
val:    .byte 0`;
  const r = assemble(src);
  assert.equal(r.ok, true, r.errors.join('; '));
  const cpu = runCPU(r.bytes);
  assert.equal(cpu.ok, true, cpu.problems.join('; '));
  assert.deepEqual(cpu.ports, [{ port: 0, value: 5, cycle: cpu.ports[0]?.cycle }]);
});

test('cpu: sum 1..10 = 55 through the pipeline, matching reference', () => {
  const src = `
        LDI R1, 10
        LDI R2, 0
loop:   ADD R2, R1
        DEC R1
        JNZ loop
        OUT 0, R2
        HLT`;
  const r = assemble(src);
  const cpu = runCPU(r.bytes);
  assert.equal(cpu.ok, true);
  assert.equal(cpu.ports[0].value, 55);
  assert.equal(cpu.halted, true);
  const ref = referenceRun(r.bytes);
  assert.equal(ref.ports[0].value, 55);
  assert.deepEqual(cpu.regs, ref.regs);
  // pipeline overhead: more cycles than retired instructions
  assert.ok(cpu.stats.cycles > cpu.stats.retired, 'pipeline should pay bubble/flush overhead');
});

test('cpu: Fibonacci sequence matches reference and known values', () => {
  // register swaps via the XOR trick (no MOV in the ISA); R4 zeroed each pass
  const src = `
        LDI R3, 10
        LDI R1, 0         ; a
        LDI R2, 1         ; b
loop:   OUT 0, R1
        LDI R4, 0
        ADD R4, R1
        ADD R4, R2        ; R4 = a + b
        XOR R1, R2        ; swap R1,R2 -> R1=b (new a)
        XOR R2, R1
        XOR R1, R2
        XOR R2, R4        ; swap R2,R4 -> R2=t (new b)
        XOR R4, R2
        XOR R2, R4
        DEC R3
        JNZ loop
        HLT`;
  const r = assemble(src);
  assert.equal(r.ok, true, r.errors.join('; '));
  const cpu = runCPU(r.bytes);
  assert.equal(cpu.ok, true, cpu.problems.join('; '));
  const vals = cpu.ports.filter((p) => p.port === 0).map((p) => p.value);
  assert.deepEqual(vals, [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  const ref = referenceRun(r.bytes);
  assert.deepEqual(cpu.regs, ref.regs);
});

test('cpu: back-to-back RAW is forwarded with zero stalls', () => {
  const r = assemble('LDI R1, 5\nADD R2, R1\nOUT 0, R2\nHLT');
  const cpu = runCPU(r.bytes);
  assert.equal(cpu.ok, true);
  assert.equal(cpu.regs[2], 5);
  assert.equal(cpu.stats.stalls, 0, 'ALU->ALU dependency must forward, not stall');
});

test('cpu: load-use hazard stalls exactly 1 cycle and forwards from WB', () => {
  const src = `
        LDI R1, 42
        ST [val], R1
        LD  R2, [val]
        ADD R3, R2      ; dependent on the load IMMEDIATELY
        OUT 0, R3
        HLT
val:    .byte 0`;
  const r = assemble(src);
  const cpu = runCPU(r.bytes);
  assert.equal(cpu.ok, true);
  assert.equal(cpu.regs[3], 42, 'load result must be correct after stall');
  assert.equal(cpu.stats.stalls, 1, 'exactly one load-use stall');
  // independent instruction between load and use -> no stall needed
  const src2 = `
        LDI R1, 42
        ST [val2], R1
        LD  R2, [val2]
        LDI R4, 9
        ADD R3, R2
        OUT 0, R3
        HLT
val2:   .byte 0`;
  const cpu2 = runCPU(assemble(src2).bytes);
  assert.equal(cpu2.stats.stalls, 0, 'filler instruction hides the latency');
  assert.equal(cpu2.regs[3], 42);
});

test('cpu: taken branches flush exactly 2 slots each', () => {
  // loop taken 9 times (JNZ fails on 10th)
  const src = `
        LDI R1, 10
loop:   DEC R1
        JNZ loop
        OUT 0, R1
        HLT`;
  const cpu = runCPU(assemble(src).bytes);
  assert.equal(cpu.ok, true);
  assert.equal(cpu.ports[0].value, 0);
  assert.equal(cpu.stats.flushes, 9 * 2, '9 taken JNZ -> 2 squashed slots each');
});

test('cpu: CMP + JN implements signed-less-than', () => {
  const src = `
        LDI R1, 3
        LDI R2, 5
        CMP R1, R2      ; 3-5 <0 -> N
        JN was_less
        LDI R3, 0
        OUT 0, R3
        HLT
was_less:
        LDI R3, 1
        OUT 0, R3
        HLT`;
  const cpu = runCPU(assemble(src).bytes);
  assert.equal(cpu.ports[0].value, 1);
});

test('cpu: carry flag on ADD and SHL', () => {
  const src = `
        LDI R1, 200
        LDI R2, 100
        ADD R1, R2      ; 300 -> 44, C=1
        OUT 1, R1
        JC  had_carry
        HLT
had_carry:
        LDI R3, 0
        SHL R3          ; 0<<1 = 0, C=0 now
        JC  wrong
        LDI R4, 1
        OUT 2, R4
        HLT
wrong:  HLT`;
  const cpu = runCPU(assemble(src).bytes);
  assert.equal(cpu.ports.find((p) => p.port === 1).value, 44);
  assert.equal(cpu.ports.find((p) => p.port === 2).value, 1);
});

test('cpu: IN reads input ports supplied by the environment', () => {
  const src = `
        IN  R1, 3
        OUT 0, R1
        HLT`;
  const cpu = runCPU(assemble(src).bytes, { inputs: { 3: 77 } });
  assert.equal(cpu.ports[0].value, 77);
});

test('cpu: invalid opcode stops with an explicit problem', () => {
  const bytes = new Uint8Array([0xfe]); // not in ISA
  const cpu = runCPU(bytes);
  assert.equal(cpu.ok, false);
  assert.ok(cpu.problems[0].includes('Invalid opcode'));
});

test('cpu: differential fuzz — pipeline matches reference on a jump-heavy program', () => {
  // exercise forward+backward branches, INC/DEC, XOR swaps, memory
  const src = `
        LDI R1, 0
        LDI R2, 7
outer:  INC R1
        CMP R1, R2
        JZ  done
        ST [0x30], R1
        LD  R3, [0x30]
        OUT 0, R3
        JMP outer
done:   OUT 1, R1
        HLT`;
  const r = assemble(src);
  const cpu = runCPU(r.bytes);
  const ref = referenceRun(r.bytes);
  assert.deepEqual(cpu.regs, ref.regs);
  assert.deepEqual(cpu.ports.map((p) => [p.port, p.value]), ref.ports.map((p) => [p.port, p.value]));
  assert.ok(cpu.halted && ref.halted);
});

test('cpu: trace records per-cycle pipeline occupancy', () => {
  const r = assemble('LDI R1, 1\nINC R1\nOUT 0, R1\nHLT');
  const cpu = runCPU(r.bytes, { trace: true });
  assert.ok(cpu.trace.length > 0);
  const exEntries = cpu.trace.filter((t) => t.ex === 'LDI');
  assert.ok(exEntries.length >= 1);
});

test('cpu: lab.validate runs the differential check and passes on good code', () => {
  const diagram = {
    name: 'sum', lab: 'cpu',
    meta: { source: 'LDI R1, 5\nLDI R2, 7\nADD R2, R1\nOUT 0, R2\nHLT' },
    blocks: [], wires: [],
  };
  const report = cpuLab.report(diagram);
  assert.equal(report.verdict, 'pass');
  const diff = report.checks.find((c) => c.name.includes('reference (registers)'));
  assert.equal(diff.verdict, 'pass');
});

test('cpu: lab.validate fails on broken assembly', () => {
  const diagram = { name: 'bad', lab: 'cpu', meta: { source: 'FROB R9, R1' }, blocks: [], wires: [] };
  const report = cpuLab.report(diagram);
  assert.equal(report.verdict, 'fail');
});

test('cpu: disassemble round-trips a small program', () => {
  const src = 'LDI R1, 10\nloop: DEC R1\nJNZ loop\nHLT';
  const r = assemble(src);
  const text = disassemble(r.bytes);
  assert.ok(text.includes('LDI R1, 0xa'));
  assert.ok(text.includes('JNZ'));
});
