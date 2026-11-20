import test from 'node:test';
import assert from 'node:assert/strict';

import { createRV32, asm, createForth, systolicMatmul, simulateWarpKernel, compareArchitectures } from '../packages/chip-engine/src/index.mjs';

test('RV32IM: exact program output — sum 1..10 with a loop', () => {
  const cpu = createRV32({ pcStart: 0 });
  // x5 = 0; x6 = 10; loop: add x5, x5, x6; addi x6, x6, -1; bne x6, x0, loop
  const t5 = 5, t6 = 6, x0 = 0;
  const loop = 8; // byte offset of the loop body
  const program = [
    asm.opImm(0, t5, x0, 0),      // addi x5, x0, 0
    asm.opImm(0, t6, x0, 10),     // addi x6, x0, 10
    asm.R(0, t6, t5, 0, t5, 0x33),// add  x5, x5, x6   (at +8)
    asm.opImm(0, t6, t6, -1),     // addi x6, x6, -1
    asm.B(-8, x0, t6, 1, 0x63),   // bne  x6, x0, -8 (back to +8)
    asm.halt(),
  ];
  cpu.load(program);
  const r = cpu.run(500);
  assert.equal(cpu.regs[t5], 55, `sum=${cpu.regs[t5]} (expect 55)`);
  assert.equal(cpu.regs[t6], 0);
  assert.ok(r.cycles > 0 && cpu.retired >= 30, `cycles=${r.cycles} retired=${cpu.retired}`);
  assert.equal(cpu.halted, true);
});

test('RV32IM: M extension (mul) and memory (sw/lw) round-trip exactly', () => {
  const cpu = createRV32();
  const t0 = 5, t1 = 6, t2 = 7;
  const program = [
    asm.opImm(0, t0, 0, 100),
    asm.opImm(0, t1, 0, 21),
    asm.R(1, t1, t0, 0, t2, 0x33), // mul x7, x5, x6 = 2100
    asm.S(256, t2, 0, 2, 0x23),    // sw x7, 256(x0)
    asm.I(256, 0, 2, t0, 0x03),    // lw x5, 256(x0)
    asm.halt(),
  ];
  cpu.load(program);
  cpu.run(100);
  assert.equal(cpu.regs[t2], 2100);
  assert.equal(cpu.regs[t0], 2100, 'lw restores the stored product');
  assert.equal(cpu.mem[256], 2100 & 0xff);
});

test('Forth core: exact stack output and cycles for a real token program', () => {
  const f = createForth({});
  const r = f.run(['3', '4', '+', '5', '*', '.', '7', '2', '-', '.']);
  assert.deepEqual(r.output, [35, 5], `output=${JSON.stringify(r.output)}`);
  assert.deepEqual(r.data, []);
  assert.ok(r.cycles >= 10);
  // @/! round trip
  const f2 = createForth({});
  f2.run(['42', '8', '!', '8', '@', '.']);
  assert.deepEqual(f2.output, [42]);
});

test('Systolic TPU: INT8 matmul matches exact reference math + cycle model', () => {
  const A = [[30, -40, 120], [-127, 90, 5], [64, 64, 64], [1, 2, 3]];
  const B = [[100, 2], [-3, 45], [7, -1]];
  const { C, cycles, utilization, tiles } = systolicMatmul(A, B, { gridSize: 2, clockMHz: 100 });
  // Reference INT8 math.
  const ref = A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
  assert.deepEqual(C.flat(), ref.flat(), 'INT8 accumulate must be exact');
  // 05-JSON cycle model: tiles·(K + 2P − 2) = ceil(4/2)·ceil(2/2)·(3+4−2)= 2·1·5
  assert.equal(cycles, 2 * (3 + 2 * 2 - 2), `cycles=${cycles}`);
  assert.ok(utilization > 0 && utilization <= 1);
  assert.equal(tiles, 2);
});

test('Systolic TPU: dynamic power follows P = α·C·V²·f', () => {
  const A = [[1]], B = [[1]];
  const base = systolicMatmul(A, B, { gridSize: 8, clockMHz: 100, vdd: 0.8, activityFactor: 0.35, capPerMacFf: 1.2e-13 });
  const doubledF = systolicMatmul(A, B, { gridSize: 8, clockMHz: 200, vdd: 0.8, activityFactor: 0.35, capPerMacFf: 1.2e-13 });
  assert.ok(Math.abs(doubledF.dynamicPowerW / base.dynamicPowerW - 2) < 1e-9, 'P ∝ f');
  const higherV = systolicMatmul(A, B, { gridSize: 8, clockMHz: 100, vdd: 1.0, activityFactor: 0.35, capPerMacFf: 1.2e-13 });
  assert.ok(Math.abs(higherV.dynamicPowerW / base.dynamicPowerW - (1.0 / 0.8) ** 2) < 1e-9, 'P ∝ V²');
});

test('SIMT GPU: warp divergence doubles cycles and is reported', () => {
  const uniform = simulateWarpKernel(32, (lane) => ({ value: lane, tookBranch: false }));
  const divergent = simulateWarpKernel(32, (lane) => ({ value: lane, tookBranch: lane % 2 === 0 }));
  assert.equal(uniform.cycles, 1);
  assert.equal(divergent.cycles, 2, 'divergent warp serializes both paths');
  assert.equal(divergent.divergenceEvents, 1);
  assert.deepEqual(uniform.results.map((r) => r.value), Array.from({ length: 32 }, (_, i) => i));
});

test('Unified memory vs discrete PCIe: zero-copy cuts cycles and energy', () => {
  const r = compareArchitectures({ M: 1, N: 4096, K: 4096 }); // memory-bound LLM-decode shape
  assert.ok(r.delta.cycleReductionPct > 5, `cycle reduction ${r.delta.cycleReductionPct.toFixed(1)}%`);
  assert.ok(r.unifiedInt8.totalCycles < r.discreteInt8.totalCycles);
  assert.equal(r.unifiedInt8.bytesOnBus < r.discreteInt8.bytesOnBus, true, 'weights stay resident (zero-copy)');
  // Q4 radix halves weight bytes → higher effective bandwidth utilization.
  assert.ok(r.discreteQ4.bytesOnBus < r.discreteInt8.bytesOnBus, 'Q4 packs 2 digits/byte');
  assert.equal(r.badge, 'SIMULATED_ARCHITECTURAL_MODEL');
  // Hotspot tracks power monotonically.
  assert.ok(r.unifiedInt8.hotspotC > 45);
});
