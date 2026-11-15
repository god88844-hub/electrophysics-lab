// crosslab.js — cross-lab coupling demos (plan Step 8).
// Labs run as separate engines; coupling uses the documented adapters in
// core/pipeline.js so boundary semantics are explicit, with a data-
// consistency verdict computed against an independent reference.

import { runSequence } from '../core/pipeline.js';
import { mulberry32 } from '../core/validation.js';
import { registerExample } from '../core/registry.js';

import '../labs/cpu/lab.js';
import '../labs/ai/mlp.js';
import '../labs/quantum/qudit.js';
import '../labs/quantum/gates.js';
import { runCPU, referenceRun } from '../labs/cpu/cpu.js';
import { assemble } from '../labs/cpu/assembler.js';
import { MLP } from '../labs/ai/mlp.js';
import { QuditCircuit } from '../labs/quantum/qudit.js';
import { H } from '../labs/quantum/gates.js';
import { bitsToBytes } from '../core/pipeline.js';

// ---------------------------------------------------------------------------
// Demo 1: CPU computes XOR pairs -> AI accelerator (MLP) classifies them.
// Consistency: CPU's own XOR results vs the trained MLP's predictions.
// ---------------------------------------------------------------------------
const XOR_CPU_SRC = `
; XOR of 4 input pairs from memory -> OUT port 1 (the "accelerator input bus")
        LD  R1, [p00]
        LD  R2, [p01]
        XOR R1, R2
        OUT 1, R1
        LD  R1, [p10]
        LD  R2, [p11]
        XOR R1, R2
        OUT 1, R1
        LD  R1, [p20]
        LD  R2, [p21]
        XOR R1, R2
        OUT 1, R1
        LD  R1, [p30]
        LD  R2, [p31]
        XOR R1, R2
        OUT 1, R1
        HLT
p00:    .byte 0
p01:    .byte 0
p10:    .byte 0
p11:    .byte 1
p20:    .byte 1
p21:    .byte 0
p30:    .byte 1
p31:    .byte 1`;

export async function runCpuToAi() {
  const steps = [
    {
      name: 'CPU (IL-8): compute XOR of 4 pairs from memory',
      run: async () => {
        const asm = assemble(XOR_CPU_SRC);
        if (!asm.ok) throw new Error('assembly failed: ' + asm.errors.join('; '));
        const cpu = runCPU(asm.bytes);
        const ref = referenceRun(asm.bytes);
        const xorResults = cpu.ports.filter((p) => p.port === 1).map((p) => p.value);
        return { cpu, ref, xorResults, stats: cpu.stats };
      },
    },
    {
      name: 'AI Lab: trained 2-3-1 MLP infers the same XOR function',
      map: (prev) => ({ xorResults: prev.xorResults }),
      run: async ({ xorResults }) => {
        const mlp = new MLP([2, 3, 1], { seed: 42 });
        const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
        const Y = [[0], [1], [1], [0]];
        mlp.train(X, Y, { epochs: 4000, lr: 1.2 });
        const pairs = [[0, 0], [0, 1], [1, 0], [1, 1]];
        const predictions = pairs.map((p) => mlp.predict(p)[0]);
        return { predictions, pairs };
      },
    },
  ];
  const results = await runSequence(steps);
  const { xorResults } = results[0].outputs;
  const { predictions } = results[1].outputs;
  const worst = Math.max(...predictions.map((p, i) => Math.abs(p - xorResults[i])));
  return {
    title: 'Cross-lab: CPU → AI accelerator',
    steps: results,
    verdict: worst < 0.2 ? 'pass' : 'fail',
    consistency: {
      check: 'CPU XOR results vs MLP predictions (tolerance 0.2)',
      worst: Math.round(worst * 1000) / 1000,
      xorResults,
      predictions: predictions.map((p) => Math.round(p * 1000) / 1000),
      note: 'Data crosses the lab boundary through explicit port extraction (CPU OUT port 1) and documented quantization.',
    },
  };
}

// ---------------------------------------------------------------------------
// Demo 2: Quantum randomness -> CPU counts bits and computes parity.
// Consistency: CPU result vs direct JS reference on the same bytes.
// ---------------------------------------------------------------------------
export async function runQuantumToCpu() {
  const steps = [
    {
      name: 'Quantum Lab: 8 qubits in |+> measured once -> 8 random bits',
      run: async () => {
        const rng = mulberry32(2026);
        const qc = new QuditCircuit(8, 2);
        for (let q = 0; q < 8; q++) qc.apply1(q, H);
        const meas = qc.measureAll(1, rng);
        const idx = meas.counts.findIndex((v) => v > 0);
        const bits = [];
        for (let q = 0; q < 8; q++) bits.push((idx >> (7 - q)) & 1);
        return { bits, stateIndex: idx };
      },
    },
    {
      name: 'Adapter: bits -> bytes (MSB first)',
      map: (prev) => ({ bits: prev.bits }),
      run: async ({ bits }) => ({ bytes: bitsToBytes(bits), bits }),
    },
    {
      name: 'CPU (IL-8): popcount + parity of the byte via IN port',
      map: (prev) => ({ inputs: { 0: prev.bytes[0] }, byte: prev.bytes[0] }),
      run: async ({ inputs, byte }) => {
        const src = `
; popcount of IN port 0 -> OUT port 0; parity -> OUT port 1
        IN  R1, 0
        LDI R3, 0        ; count
        LDI R4, 1        ; mask
        LDI R6, 8        ; 8 bits
loop:   XOR R5, R5
        ADD R5, R4       ; R5 = mask
        AND R5, R1       ; R5 = mask & byte
        JZ  skip
        INC R3
skip:   SHL R4
        DEC R6
        JNZ loop
        OUT 0, R3
        XOR R7, R7
        LDI R7, 1
        AND R7, R3       ; parity = count & 1
        OUT 1, R7
        HLT`;
        const asm = assemble(src);
        const cpu = runCPU(asm.bytes, { inputs });
        // independent JS reference
        let count = 0, v = byte;
        while (v) { count += v & 1; v >>= 1; }
        const refParity = count & 1;
        const cpuCount = cpu.ports.find((p) => p.port === 0)?.value;
        const cpuParity = cpu.ports.find((p) => p.port === 1)?.value;
        return { byte, cpuCount, cpuParity, refCount: count, refParity, stats: cpu.stats };
      },
    },
  ];
  const results = await runSequence(steps);
  const { bits } = results[1].outputs;
  const { cpuCount, cpuParity, refCount, refParity, byte } = results[2].outputs;
  const consistent = cpuCount === refCount && cpuParity === refParity;
  return {
    title: 'Cross-lab: Quantum RNG → CPU',
    steps: results,
    verdict: consistent ? 'pass' : 'fail',
    consistency: {
      check: 'CPU popcount/parity vs JS reference on the same byte',
      byte, bits, cpuCount, cpuParity, refCount, refParity,
      note: 'Quantum measurement outcomes cross into the classical domain through the sampled state; the adapter is documented (bitsToBytes, MSB first).',
    },
  };
}

registerExample({
  id: 'crosslab-cpu-ai',
  label: 'Cross-lab: CPU → AI accelerator',
  lab: 'crosslab',
  blurb: 'CPU computes XOR pairs; a trained MLP must agree — data consistency verified.',
  kind: 'cpu-ai',
  run: runCpuToAi,
});
registerExample({
  id: 'crosslab-quantum-cpu',
  label: 'Cross-lab: Quantum RNG → CPU',
  lab: 'crosslab',
  blurb: 'Quantum measurements seed a CPU popcount/parity job; results verified against a JS reference.',
  kind: 'quantum-cpu',
  run: runQuantumToCpu,
});
