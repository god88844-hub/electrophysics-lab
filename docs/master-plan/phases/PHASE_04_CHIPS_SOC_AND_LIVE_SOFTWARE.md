# PHASE 04 — Chips/SoC & Live Software (Layers 3 & 4)

## Objective
Rust cycle-accurate execution engines (RV32IM/Custom-ISA CPU, SIMT GPU,
INT8/QDQ + Q4 systolic TPU), the Apple-M-class unified-memory SoC interposer
composer with live packet flow, DVFS thermal throttling, tile-drill-down into
Layer 1 stress analysis, and QEMU/ONNX CI oracles.

## Non-Goals
No quantum (Phase 5), no curriculum (Phase 6), no GPU rasterization claims.

## Exact Files
- Created: `crates/ep-chip/**` (cpu, gpu, tpu, noc, dvfs),
  `apps/electrophysics-3d/src/state/kernelExec.ts`,
  `src/ui/cad/TileDrillDown.tsx`.
- Modified: `packages/chip-engine` (oracle parity updates only),
  `src/bays/bay3Soc.ts` (kernel-frame tile activity), `src/workers/physics.worker.ts`
  (tile thermal feed from kernel frames).
- Contracts: `05_chip_architecture_benchmarks.json`, `07_soc_interposer_memory_baselines.json`,
  `solver-frame.schema.json`, `03_PHYSICS_MATH_FUNDAMENTALS.md` §3, §5.

## Interface Contracts
- CPU: register-file bit-exact against the harness and bounded QEMU
  user-mode runs (same ISA subset); cycle counter is a declared model (1 CPI
  ALU, 2 loads/stores, +1 taken branch) — never presented as silicon-measured.
- TPU: bit-exact INT8 accumulation; cycle model `tiles·(K+2P−2)`; Q4 packing
  2 digits/byte; accumulator saturation at INT32 bounds documented.
- Memory: LPDDR5/HBM/PCIe bandwidths and latencies strictly from
  `07_soc_interposer_memory_baselines.json`; every execution panel carries
  `SIMULATED_ARCHITECTURAL_MODEL`.

## Checklist

### WP-4.1 — Cycle-accurate RV32IM/Custom-ISA CPU in kernel
- [ ] Full v3 ISA subset + CSR/HALT semantics; deterministic memory image
- [ ] Parity: register file bit-exact vs `packages/chip-engine` harness
- [ ] QEMU user-mode differential on the bounded ISA subset (same programs)

### WP-4.2 — SIMT GPU warp kernel in kernel
- [ ] Warp lanes, divergence serialization (2× cost), occupancy accounting
- [ ] Parity vs ESM simulateWarpKernel (cycle counts identical)

### WP-4.3 — Systolic TPU (INT8/QDQ + Q4) in kernel
- [ ] Weight-stationary wave-front with exact INT32 accumulate; Q4 dequant pass
- [ ] Cycle model parity; utilization; accumulator saturation guard

### WP-4.4 — Unified-memory SoC interposer composer
- [ ] NoC route model (1 cycle/hop), memory stacks from 07 JSON
- [ ] Discrete-PCIE vs unified zero-copy comparison engine (kernel)
- [ ] DVFS throttle loop coupled to `ep-thermal` tile temps
- [ ] Tile→block floorplan from `data/cad-specs/02` (floorplan coordinates binding)

### WP-4.5 — Live software driving 3D
- [ ] Assembly/Forth/C-binary (RV32) programs run on kernel CPU
- [ ] Frame bus/tile telemetry → 3D packet flow + tile colors (solver-frame)
- [ ] Playwright: program run → packet-flow + tile assertions

### WP-4.6 — QEMU + ONNX Runtime oracles
- [ ] QEMU user-mode differential (bounded ISA) — register/memory bit-exact
- [ ] ONNX Runtime CPU differential for quantized GEMM (±1e-5 relative logits)
- [ ] Oracle table (03 §5) rows verified in CI

### WP-4.7 — Tile drill-down → Layer 1 stress
- [ ] Click a hot tile → per-tile power/thermal telemetry panel
- [ ] Drill-down spawns a Layer 1 stress solve on that tile's representative
      transistor (Vgs/Vdd from the tile DVFS state)
- [ ] Real failure events (200 °C runaway) flow to the forensic dock

## Failure Modes & Edge Cases
- QEMU/ONNX absent in an environment → oracle steps SKIP with explicit
  unavailability (never silently pass).
- INT32 accumulator overflow → saturation + documented overflow event.
- NoC deadlock in user routing → route validation refuses at compose time.
- DVFS oscillation → hysteresis band (±5 °C) on the throttle loop.
- Unified-memory claim without 07 JSON citation → Law 5 violation, reverted.

## Acceptance Gate
- `cargo test -p ep-chip` green (bit-exact CPU, exact GEMM, cycle models).
- QEMU/ONNX oracle suites green (or explicit skip when tools absent).
- Playwright: workload run → tile activity + drill-down → stress panel.
- `npm test` green; Phase 30/39 clean-tree PASS.
