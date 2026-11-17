# Phase 7 — Computing Architecture Evidence, Data Inventory, and Validation Gate

## Scope and evidence policy

**Invention Lab** models electronics, circuits, binary/ternary/multivalued
logic, chips, CPUs, GPUs/TPU-like accelerators and quantum computing.
**AeroForge is a separate aerospace project.** No source, simulation model,
data requirement or development plan is shared between them.

Our long-term aspiration is to generate simulation evidence sufficiently
accurate, calibrated and uncertainty-qualified to inform the same **scoped
engineering decisions** as physical measurements. Mathematical equations
alone do not prove an untested fabrication process, material defect level,
measurement chain or manufactured processor will behave identically to a model.

**The current Phase 7 has no physical validation, fabrication success
percentage, timing fidelity, energy calibration or manufacturing yield
probability.** Both are intentionally `none` / `null` in evidence reports.

## Assessment of the supplied Deep Research report

The supplied CPU/accelerator/PDK inventory is a **useful research map**.
It correctly identifies RISC-V architecture references, independent
processor emulators, open semiconductor design kits, numerical workloads and
missing physical calibration data.

However, the minimum first computing-architecture vertical slice does **not**
require downloading a full PDK, claiming OpenLane DRC clearance or running
large MLPerf/ONNX datasets. Those resources will matter for later
layout/manufacturing and model-specific inference phases, with distinct
reference checks and licensing review.

Two critical source corrections:

1. The RISC-V Architectural Certification Test project now documents the
   **ACT4 framework** and says ACTs do **not** replace processor verification.
   RISC-V Sail is an adopted formal reference model; Spike and QEMU are
   different functional references, not physical verification.
2. The **SKY130** and **GF180MCU** open-source PDKs are still explicitly
   described by their own maintainers as *experimental preview* content.
   The existence of design rules does not mean our particular chip passed
   DRC/LVS, nor does DRC/LVS PASS demonstrate manufacturing yield.

The machine-readable source inventory is maintained at
`benchmarks/phase7/source-registry.json`. Its status fields explicitly
separate sources **executed in CI**, publicly available sources **not yet
executed**, and the **absent** real-silicon measurement class.

## Delivered vertical slice

### New RISC-V RV32I computing lab

`js/labs/rv32i/rv32i.js` implements a bounded, single-hart, unprivileged
**RV32I v2.1** functional interpreter. It is a separate architecture from
the existing IL-8 pipelined educational CPU; the original IL-8 engine and
its tests remain unchanged.

The RV32I model has thirty-two 32-bit registers with immutable x0,
a flat little-endian byte-addressed RAM, branches/jumps, signed and unsigned
arithmetic, loads/stores, a bounded retirement trace and explicit traps.
Misaligned access, unknown encoding, non-RV32I extension instructions and
step-limit exhaustion **cannot be classified as PASS**.

Supported base integer operations include LUI, AUIPC, JAL/JALR, the standard
comparisons/branches, LB/LH/LW/LBU/LHU, SB/SH/SW, integer register and
immediate ALU operations including arithmetic shifts, and RAM-only FENCE.
ECALL and EBREAK cause distinct architectural traps. The teaching UI can
accept a program that deliberately reaches EBREAK, but EBREAK is a
*breakpoint trap*, **not** a successful Linux exit or hardware confirmation.

`RISC-V RV32I` appears as a separate user interface lab. Its editable source
contains **one 8-hex-digit encoded 32-bit word per line**, e.g.:

```text
00500093
00700113
002081b3
00100073
```

This computes x1=5, x2=7, x3=12 and enters an EBREAK trap.
The user can set a register expectation and step budget. That
user-defined expectation is a **software functional check**, *not*
an independent reference or ISA certification.

**Excluded:** privileged ISA, CSRs, interrupts, RV32M atomics/mul/div,
floating point, compressed instructions, MMU, OS syscalls, cache hierarchy,
cycle-accurate pipeline, silicon timing/power and hardware manufacturing.

### Independent architecture executable

The version-controlled `benchmarks/phase7/rv32i-sum.S` program computes
1+2+...+10, converts the sum to ASCII character **g** and asks Linux to
write that character. In the strict external workflow:

- GNU RISC-V binutils assembles and links **actual RV32I machine code**
  into a 32-bit ELF.
- **QEMU user-mode RISC-V** executes the ELF independently and outputs `g`.
- The same GNU-produced program image is loaded into the independent JS
  RV32I model; the JS model executes until **ECALL**, without pretending
  to emulate Linux.
- We compare the intended syscall arguments, byte pointed to by the
  buffer register, integer sum, program termination point and the actual
  QEMU-emitted character.
- Source and compiled artifact SHA-256 fingerprints, versions and commit
  identity are recorded.

This is **one real independent execution comparison**. It does not establish
100% ISA conformance or comprehensive microarchitecture coverage.

### Independent accelerator arithmetic executable

`benchmarks/phase7/tensor-cases.json` is an immutable-in-review,
version-controlled fixture containing two small signed, exactly
representable integer matrix multiplication cases and expected results.

`scripts/phase7-numpy-oracle.py` computes each case using **real NumPy**
(v2.4.6 pinned in CI). Our existing JavaScript accelerator kernel
computes the same cases independently. Both results must match the exact
fixture outputs with **zero tolerance for this small-integer scope**.

These are **two arithmetic comparison cases**, *not* MLPerf Tiny,
not a neural-network inference benchmark and not TPU/GPU silicon.

### Honest acceptance

A **separate frozen manifest**,
`benchmarks/phase7/acceptance.json`, names exactly three mandatory
external cases:

- `rv32i-qemu-gnu`
- `matmul-2x3x2-signed`
- `matmul-3x2x3-mixed`

`scripts/phase7-strict.mjs` fails on missing, skipped, duplicate,
nonpassing, extra, stale-commit, false-physical-claim, bad-source-hash
or inconsistent test-vector evidence.

The [Phase 7 independent architecture references] GitHub Actions workflow
installs required engines on Ubuntu 24.04, runs all reference tests and
publishes `phase7-independent-evidence` artifacts.

The existing Node 20/22/24 matrix, real Chromium/WebGL workspace test and
**24 independent Phase 2 Ngspice/Qiskit/NumPy cases** remain mandatory,
unmodified CI gates.

## Public resource inventory and licensing considerations

| Source | Current status | Intended use |
|---|---|---|
| RISC-V RV32I 2.1 ratified specification, v20260120 | Authoritative published reference | Decode/execution semantics |
| GNU binutils + QEMU user-mode | Installed and run in external CI | Real independent RV32I code execution |
| NumPy 2.4.6 | Installed and run in external CI | Small tensor reference |
| RISC-V Architectural Certification Tests / ACT4 | Found; not yet run | Broader architectural coverage (requires ACT4 integration, licensing review) |
| RISC-V Sail, Spike | Found; not yet run | Additional independent ISA references |
| MLPerf Tiny / ONNX models and task datasets | Found; not yet installed or benchmarked | Full accelerator model and inference correctness |
| SkyWater SKY130 and GF180MCU PDK | Found; **not installed** | Future actual DRC/LVS/cell-layout/voltage/timing flow |
| OpenROAD/RTL-to-GDS | Found; **not run** | Future synthesis/layout, real rule-check evidence |
| Actual fabricated-device measurements, foundry yield statistics | **Absent** | Necessary for physical calibration or production-yield forecasts |

Do not copy arbitrary entire datasets into the repo: verify the applicable
license for each source file, test suite, pretrained model and dataset,
including third-party restrictions and required attribution. We do not
claim redistribution rights solely because a host repository is public.
No PDK code/model or MLPerf dataset was redistributed in this PR.

Public references:

- RV32I specification: https://docs.riscv.org/reference/isa/v20260120/unpriv/rv32.html
- ACT4: https://github.com/riscv/riscv-arch-test
- RISC-V Sail: https://github.com/riscv/sail-riscv
- Spike: https://github.com/riscv-software-src/riscv-isa-sim
- QEMU user-mode: https://www.qemu.org/docs/master/user/main.html
- NumPy matmul: https://numpy.org/doc/stable/reference/generated/numpy.matmul.html
- MLPerf Tiny: https://mlcommons.org/benchmarks/inference-tiny/
- SKY130: https://skywater-pdk.readthedocs.io/en/main/
- GF180MCU: https://github.com/google/gf180mcu-pdk
- OpenROAD: https://github.com/The-OpenROAD-Project/OpenROAD

## Missing external inputs before true physical-confidence percentages

For a specific proposed chip and process, the future evidence gate must
obtain **actual source measurements** (device IV/CV curves, parasitic
characterization, timing distributions, power/thermal behavior, measured
process/voltage/temperature variation), **traceable calibration records**,
independent specimens/holdouts, an operating-envelope definition, and
real **yield/defect-density** evidence for the relevant foundry and run.

No software-only artifact can prove such measurements were genuine.
A mathematical model cannot produce a defensible percentage for
"this new GPU will manufacture successfully" without a fully specified
success criterion, fabrication process, available model ranges and
distributional calibration.

## Follow-up stages (separate code and evidence gates)

1. Expand RV32I to independent **RISC-V ACT4/Sail/Spike** validation,
   with a pinned reference toolchain and a proper compliance matrix.
2. Extend CPU architecture models to instruction timing, caches,
   pipeline and memory hierarchy, with explicit external reference traces.
3. Add full, licensed ONNX/MLPerf Tiny model inputs and verify
   preprocessing, numerical outputs and quality targets using a separate
   independent runtime. The current two NumPy cases are not a substitute.
4. Add a **real installed open PDK** and OpenROAD/Magic/KLayout flow
   with actual DRC/LVS, Liberty, LEF/DEF and timing evidence.
5. Collect real physical reference measurements, calibration/holdout
   datasets, process variability and defined use envelopes.
6. Only for evidence-supported, calibrated, scoped designs consider
   estimating **real-world build success** with defensible intervals.

**PR policy:** This Phase 7 branch is stacked on PR #6, which is stacked on
PR #5 → PR #4. PR #3 is separate. Do not merge without review and explicit
authorization.
