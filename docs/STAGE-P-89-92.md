# Stage P — Phases 89–92: custom virtual computing systems

**Development state:** Stage P is stacked on unmerged Stage O, which depends on unmerged Stage N and M. Do not merge to `main` before the prerequisite stages are accepted, the complete existing 82+ CI suite is green, and Stage P acceptance criteria are genuinely satisfied. All physical-qualification and release gates remain unmodified.

## Phase 89 — Declarative radix ISA
`js/scene/stage-p-custom-isa.js` defines register banks in binary, ternary, quaternary or radix 2–16. Example: 16 Q4 digits = 32 bits, together with 32-bit binary registers. Stable instruction bytecode, two-pass label assembler, disassembler, configurable modulo arithmetic, bounded virtual RAM and per-op deterministic architectural cycle costs are implemented. The structured workload compiler runs a genuine bubble-sort program and arithmetic on the invented ISA, and a restricted C-like register-expression frontend runs arithmetic. **Not** a general-purpose C compiler, LLVM backend, verified RTL, or a physically cycle-accurate transistor design.

## Phase 90 — Modeled TPU accelerator
The programmatic accelerator builds 3D PE grid, scratchpad SRAM, HBM interconnect and tensor controller proxies. It performs actual f32 multiply-accumulate operations in a tiled output-stationary array, with bounded scheduling, nominal clock cycles and bandwidth-limited roofline timing. The Phase 9 existing ONNX opset-13 2D JSON subset runs real inference on the established JS reference engine. ONNX node profiling is a **shape-only accelerator model**, not execution on an actual simulated TPU device. Input energy/mac, static power and thermal resistance are *user assumptions* (or null). TOPS and temperature values are estimated, not hardware validated; no real TOPS/W or calibrated heatmap is produced. A generic ONNX protobuf file is not supported.

## Phase 91 — Bounded virtual computer
A 3D board includes custom CPU, RAM, ROM, IRQ controller, UART and display, validated by explicit logical buses. Booting loads a custom ISA assembly ROM and runs it in a virtual CPU; UART output appears in a virtual display. A restricted interactive Forth interpreter provides stack, arithmetic, RAM, and character/number output, bounded in memory/time. **No RISC-V Linux, MMU, privilege modes, interrupts, filesystem, native hardware display nor operating-system kernel boot** is claimed. An explicit `bootLinuxImage` returns unsupported.

## Phase 92 — Hybrid CPU/QPU feedback
Uses the existing ideal QuditCircuit statevector and genuine unitary H/CNOT/X/RY operators. A sampled Bell parity syndrome is passed through the invented binary/Q4 CPU; the CPU's output controls a conditional X correction, and cycle-budgeted readout, CPU and command latencies are logged. A bounded grid-search variational RY sweep runs the local reference QPU. **Parity sampling is idealized, not a real stabilizer readout circuit; physical decoherence, QPU readout fidelity and T1/T2 are not simulated or measured.** No hardware signoff.

## Verification and limits
Run `node --test tests/stage-p-*.test.mjs` and `npm test`. The browser smoke exercises the Stage P in-app panel (build, sort, boot, hybrid feedback), with software CI across Linux, Windows and macOS. The stage tests retain explicit `simulatedPhysicalBuildSuccessPercent: 'UNKNOWN'` and `physicalValidation: 'none'`. Current PDK/physical qualification gates cannot be bypassed.

**Acceptance not yet fully met:** genuine general-purpose C compilation, execution of complete arbitrary ONNX workloads on a connected custom hardware design, fully simulated operating-system kernel boot, non-ideal quantum feedback, full cross-stage hardware integration, and independent calibrated throughput, energy and thermal evidence. These require substantial additional work.
