# PHASE 5 — Full Chips + Live Software Execution

## Sub-phase 5.1 — Hybrid Multi-Scale Engine: 60 FPS RTL/WASM + On-Demand SPICE Tile Drill-Down
- WASM-compiled RTL simulation at 60 FPS for the whole chip
- On-demand SPICE tile drill-down: zoom into a single transistor → real ngspice simulation
- Multi-scale coupling: RTL results feed SPICE boundary conditions

## Sub-phase 5.2 — 3D Custom ISA CPU + Live Forth/Assembly Execution
- IL-8 CPU with 5-stage pipeline visualised in 3D
- Live Forth/Assembly execution on the CPU
- Register/memory/port state shown in the Inspector Drawer

## Sub-phase 5.3 — 3D Systolic-Array TPU + Live INT8/QDQ ONNX Inference
- 8×8 systolic array with weight-stationary dataflow
- Live ONNX INT8/QDQ inference on the TPU array
- Activation/weight flow visualisation

## Sub-phase 5.4 — 3D SIMT GPU + Live Warp/Vector Execution
- 96-EU Intel-like SIMT GPU visualised
- Live warp/vector execution with shader debugging
- Occupancy and memory-bandwidth heatmaps

## Sub-phase 5.5 — Unified-Memory SoC & Chiplet Composer
Status: **in progress** (Bay 3 scene scaffold live as of v2 M4; physics wiring in v2 M5)

- **Architecture**: Apple-Silicon-class unified-memory SoC composer — CPU cluster
  (open RISC-V RV32IM baseline), systolic TPU array (INT8/QDQ weight-stationary),
  SIMT GPU cores, and a unified LPDDR memory fabric sharing one physical address
  space across all accelerators, with an optional multi-radix NPU swap-in
  (binary / ternary / quaternary datapaths).
- **Physical basis**: ASAP7/SKY130 public PDK physics only — no proprietary
  process data. Peak figures cited from `data/reference-library/05_chip_architecture_benchmarks.json`
  (TPU v1 92 TOPS INT8 @ 700 MHz reference point; educational 8×8 grid for the
  scene model; Intel Iris Xe 96 EU GPU parameters for the SIMT tile).
- **3D composer**: chiplet package on a translucent PCB + silicon interposer;
  per-tile functional grids; bus fabric routes with activity pulses whose speed
  follows computed interconnect traffic; per-tile thermal zones driven by the
  P = C·V²·f power model and the Phase 2 electro-thermal engine (v2 M5).
- **Optical interconnect option**: die-to-die links modelled analytically
  (bandwidth-density vs. energy-per-bit trade-off; cited public figures only) —
  visualised as a third bus class when enabled.
- **Evidence discipline**: all performance numbers carry their provenance
  (analytical model vs. published benchmark citation); nothing fabricated.
  Hardware execution claims remain Level-1 `INSUFFICIENT_MODEL_DATA` until a
  real device capture exists.
