# Phase 58 — Bounded compiler and architectural co-validation

A frozen structured register-operation IR is compiled into actual IL-8 assembly using the existing assembler. The resultant machine program is executed by the existing five-stage IL-8 pipeline and a separate unpipelined architectural interpreter. A third arithmetic oracle independently computes expected 8-bit wraparound results. Outputs, registers, and compiler constraints are checked; adversarial programs are rejected.

**Scope:** IL-8 ISA software execution only. Existing RV32I/M and QEMU test chains remain in earlier phases. No standalone RTL simulator, RTL waveform equivalence, LLVM/C compiler, physical CPU timing, calibrated power, or manufactured hardware is claimed. Accurate production CPU simulation and true RTL co-simulation remain development gaps.

Run `node --test tests/phase58-compiler-cosim.test.mjs`, `node scripts/phase58-run.mjs`, `node scripts/phase58-strict.mjs`, `npm test`.
