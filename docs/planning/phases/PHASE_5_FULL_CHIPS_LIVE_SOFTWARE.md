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
