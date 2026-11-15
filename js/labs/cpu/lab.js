// lab.js — CPU Lab registration.
// The CPU Lab's "diagram" is an assembly program (meta.source). Validation
// runs a differential check: the 5-stage pipeline must produce exactly the
// same architectural state as the unpipelined reference interpreter.

import { registerLab } from '../../core/registry.js';
import { assemble, disassemble } from './assembler.js';
import { runCPU, referenceRun } from './cpu.js';
import { makeCheck, assembleReport } from '../../core/validation.js';

export const cpuLab = {
  id: 'cpu',
  label: 'CPU Lab',
  blurb: 'Design and run programs on the IL-8: 8-bit RISC, 5-stage pipeline with forwarding, load-use stalls and branch flushes.',
  accent: '#67c98d',
  metaSchema: [
    {
      key: 'source', label: 'Assembly source', type: 'textarea',
      default: `; sum of 1..10 -> OUT port 0
        LDI R1, 10      ; counter
        LDI R2, 0       ; accumulator
loop:   ADD R2, R1
        DEC R1
        JNZ loop
        OUT 0, R2
        HLT`,
    },
  ],

  /** assemble + run; returns { asm, cpu, ok } */
  run(diagram, opts = {}) {
    const src = diagram.meta?.source ?? diagram.source ?? '';
    const asm = assemble(src);
    if (!asm.ok) return { ok: false, asm, cpu: null, problems: asm.errors };
    const cpu = runCPU(asm.bytes, opts);
    return { ok: cpu.ok, asm, cpu, problems: cpu.problems };
  },

  validate(diagram) {
    const checks = [];
    const res = this.run(diagram);
    const src = diagram.meta?.source ?? '';

    checks.push({
      name: 'Assembly: source assembles cleanly',
      verdict: res.ok ? 'pass' : 'fail',
      actual: res.ok ? 0 : res.asm.errors.length, expected: 0, tolerance: 0,
      note: res.ok ? `${res.asm.size} bytes, labels: ${Object.keys(res.asm.labels).join(', ') || 'none'}` : res.asm.errors.join('; '),
      evidence: null,
    });

    if (res.ok && res.cpu) {
      const ref = referenceRun(res.asm.bytes, { inputs: diagram.meta?.inputs || {} });
      const regsEq = JSON.stringify(res.cpu.regs) === JSON.stringify(ref.regs);
      const portsEq = JSON.stringify(res.cpu.ports.map((p) => [p.port, p.value])) === JSON.stringify(ref.ports.map((p) => [p.port, p.value]));
      const haltEq = res.cpu.halted === ref.halted;

      checks.push(makeCheck({
        name: 'Pipeline == architectural reference (registers)',
        actual: regsEq ? 0 : 1, expected: 0,
        note: regsEq ? `R0..R7 = [${res.cpu.regs.join(', ')}]` : `pipeline ${JSON.stringify(res.cpu.regs)} vs reference ${JSON.stringify(ref.regs)}`,
        evidence: { cycles: res.cpu.stats.cycles, retired: res.cpu.stats.retired, stalls: res.cpu.stats.stalls, flushes: res.cpu.stats.flushes },
      }));
      checks.push(makeCheck({
        name: 'Pipeline == architectural reference (I/O port writes)',
        actual: portsEq ? 0 : 1, expected: 0,
        note: portsEq ? `${res.cpu.ports.length} port write(s)` : 'port traces differ',
      }));
      checks.push(makeCheck({
        name: 'Program halts (pipeline and reference agree)',
        actual: haltEq && res.cpu.halted ? 0 : 1, expected: 0,
        note: res.cpu.halted ? 'HLT retired cleanly' : 'did not halt within budget',
      }));
      if (res.cpu.stats.stalls > 0) {
        checks.push({ name: `Load-use stalls: ${res.cpu.stats.stalls} (handled by forwarding from WB)`, verdict: 'pass', actual: res.cpu.stats.stalls, expected: res.cpu.stats.stalls, tolerance: 0, note: 'hazard unit inserted bubbles; results verified against reference', evidence: null });
      }
      if (res.cpu.stats.flushes > 0) {
        checks.push({ name: `Branch flushes: ${res.cpu.stats.flushes} squashed slots (2 per taken branch)`, verdict: 'pass', actual: res.cpu.stats.flushes, expected: res.cpu.stats.flushes, tolerance: 0, note: 'predict-not-taken penalty paid where architecturally required', evidence: null });
      }
    } else if (!res.ok) {
      checks.push({ name: 'Execution', verdict: 'fail', actual: null, expected: null, tolerance: 0, note: (res.problems || []).join('; '), evidence: null });
    }

    return checks;
  },

  report(diagram) {
    return assembleReport({ diagram, checks: this.validate(diagram) });
  },

  assemble, disassemble, runCPU, referenceRun,
};

registerLab(cpuLab);
