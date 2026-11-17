# Phase 59 — Bounded GPU SIMT / TPU systolic scheduling models

Models signed INT8 matrix multiplication, deterministic scratchpad byte footprints, tiled A/B reload traffic, 32-bit-output storage counts, memory bandwidth cycles and two alternative compute schedules: systolic PE wavefronts or SIMT lane work. Functional outputs are independently compared to the project's original F64 matrix implementation (which is exact for the supported small integers). Invalid matrices, resource budgets, incompatible PE-grid sizes and scratchpad overflow fail closed.

Schedule assumptions deliberately serialize DMA and arithmetic; real hardware may overlap them, cache operands, experience bank conflicts or differ in scheduling and power. Modeled latency is **not measured latency**, and these calculations cannot establish silicon area, GPU energy consumption or real-world yield.

Run `node --test tests/phase59-scheduler.test.mjs`, `node scripts/phase59-run.mjs`, `node scripts/phase59-strict.mjs`, `npm test`.
