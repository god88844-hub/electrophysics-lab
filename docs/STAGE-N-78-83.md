# Stage N — interactive 3D engineering workspace (Phases 78–83)

This branch builds on **unmerged Stage M** rather than current green main. Do not merge directly into main without reconciling Stage M and rerunning the full existing CI matrix.

## Phase 78
The 3D sandbox adds explicit millimetre grid snapping, 90° component quarter-turns, collision checks, and an automatic Manhattan routing proposal/commit through the **existing canonical terminal and conductor gate**. Components must already exist as canonical diagram blocks with explicit mm envelopes. Terminals must be saved, and wire metal type and available conductor length must be entered. Invalid collisions and intersections are rejected, and the previous CAD metadata is restored on failure. The viewport's existing pointer orbit, schematic click-to-wire, and mm 3D editor remain supported. There is no invented pin mapping, vendor-specific CAD, or automatic arbitrary component placement.

## Phase 79
Five semantic camera distances map to system/rack, board/PCB, chip/floorplan, cell/gate, and device/semiconductor levels. Existing solver output is shown only when a current canonical trace is available. High-fidelity semiconductor and quantum device simulation are **not** automatically invoked by camera zoom; an unavailable solver stays explicit. Zoom remains a visualization, never a netlist rewrite.

## Phase 80
Colors distinguish binary, ternary and Q4 state levels. Current and temperature visualization functions reject missing measured/solver data and label their origins. The 3D wire overlay uses current experiment-trace samples, not a second solver. The colors are illustrative and do not establish a physically measured voltage state from arbitrary units.

## Phase 81
Validated density-matrix Bloch vectors, qutrit/ququart probability bars, idealized exponential T1/T2 decays, and superconducting transmon or trapped-ion **proxy** layouts are available. The panel currently shows a clearly labeled reference |0> example, not a live Qiskit stream. Authentic hardware coherence, quantum couplings, and fabrication are unverified.

## Phase 82
Five guided missions are available in order: CMOS inverter, multi-radix adder, RISC-V CPU, TPU, and Bell-state quantum circuit. Until the matching canonical design has replayable solver checks and independently verified evidence, the next mission remains **LOCKED**. No client-supplied success Boolean can unlock a physically unvalidated mission.

## Phase 83
WebGL2 or ANGLE instancing capability is detected. A bounded module WebWorker can compute off-thread LOD visibility for 100,000+ input instances, falling back if unavailable. The existing 3D viewer now switches to actual WebGL2 or ANGLE GPU-instanced proxy cubes for more than 300 canonical blocks, preserving the old WebGL renderer as fallback. This is **not** a 100,000-connected-gate benchmark or WebGPU rendering implementation; Stage N does not claim sustained 60 FPS. `scripts/stage-n-benchmark.mjs` records CPU LOD times and memory but **does not prove 60 FPS GPU interaction**. No requirement is waived by CI.

## Safety and acceptance
The canonical electrical topology and physical release gates are unmodified. Unavailable physical models remain UNKNOWN / NO-GO. Stage N's new tests exercise mathematical zoom round trips, snapping and collision failures, visual semantics, quantum reference calculations, academy locks, a 100K-instance LOD workload, and browser WebGL checks.

Still required for the original full objective: built-in domain component palettes across all requested fields, real GPU instanced draw batches or WebGPU, full scale-specific solver co-simulation and streaming, 100K physical connected gates, measured 60 FPS graphics benchmarks, real-time Qiskit state feeds, and physically replayable mission proofs.
