# Phase 8 — RV32M Architecture: Explicit Semantics, Independent QEMU Evidence

## Why this phase

The completed Deep Research gap report correctly highlights that Invention Lab's
Phase 7 RISC-V core handles only a bounded unprivileged RV32I subset and had
not implemented the **M** integer multiplication/division extension. The
highest-value immediately testable next slice is to implement the ratified
**RISC-V M extension Version 2.0**, compare independently assembled and
executed binaries against QEMU, and retain all prior validation.

The report is a useful roadmap, **not an acquired bundle of foundry physical
measurements**. Some details in it are preliminary or overbroad. For example,
the Phase 7 repository source inventory explicitly marks SKY130/GF180 PDKs
*not installed and not run*; the report should not be interpreted to mean
Invention Lab has already run these PDKs. ACT4's current official README
describes certification-test infrastructure which requires a target-specific
runner/configuration and **does not replace verification**.

Official specification:
https://docs.riscv.org/reference/isa/v20240411/unpriv/m-st-ext.html

Official architectural test framework:
https://github.com/riscv/riscv-arch-test

## Executable capabilities

The `RISC-V RV32I / RV32IM` learning lab now has a deliberate ISA profile
selector. **RV32I** remains the default and rejects all M operation encodings.
Selecting **RV32IM** enables the complete eight instruction variants:

| Operation | Semantic behavior |
| --- | --- |
| `MUL` | Low 32 bits of 32×32 multiplication |
| `MULH` | High 32 bits of signed × signed |
| `MULHSU` | High 32 bits of signed × unsigned |
| `MULHU` | High 32 bits of unsigned × unsigned |
| `DIV` | Signed division rounded toward zero |
| `DIVU` | Unsigned division |
| `REM` | Signed remainder, sign follows dividend |
| `REMU` | Unsigned remainder |

High-half multiply uses BigInt integer arithmetic to avoid JavaScript
floating-point precision loss. Ordinary 32-bit multiplication uses
`Math.imul` so the low product wraps exactly.

Per the M specification, **division by zero does not trap**: quotient is
all one bits; remainder equals the dividend. Signed overflow
`INT32_MIN / -1` returns `INT32_MIN`, remainder zero. Neither
a timeout nor a malformed instruction can ever be treated as success.

This is a **functional architecture emulator**, not a physical CPU.
No instruction latency, cache, power, thermal, pipeline, memory hierarchy,
silicon process or real hardware yield is modeled.

## Data inventory and independent reference

All data for this narrow phase is checked into the repo or acquired as
CI-provided tools:

| Asset | Location | Status |
| --- | --- | --- |
| Ratified M v2.0 official specification | RISC-V Ratified Specifications (above) | External official source |
| 12-case frozen reference manifest | `benchmarks/phase8/acceptance.json` | Checked-in, fail-closed |
| GNU RISC-V assembly source | `benchmarks/phase8/rv32m-operations.S` | Checked-in, auditable |
| RISC-V GNU assembler, linker, objcopy | Ubuntu 24.04 package `binutils-riscv64-unknown-elf` | Installed inside external CI, version captured |
| Independent QEMU execution | Ubuntu 24.04 `qemu-user` / `qemu-riscv32` | Actually executed in CI, version captured |
| JavaScript RV32IM interpreter | `js/labs/rv32i/rv32i.js` | Existing Phase 7 engine extended |
| Compiled RV32IM program | Generated per CI invocation | SHA-256 recorded in evidence |
| QEMU raw reference output | Generated per CI invocation | 48 bytes compared exactly with JS |
| Measured physical CPU/silicon data | **Not available** | Not part of this phase |

The assembly computes **12 result words** spanning each M opcode plus
signed overflow and divisor-zero cases. GNU produces an actual `rv32im`
binary. QEMU executes the binary's Linux `write` syscall and emits exactly
**48 raw bytes**. The same compiled machine-code bytes are loaded by
Invention Lab's RV32IM emulator, which deliberately stops at the first
**ECALL** rather than fabricating operating-system behavior. Every emitted
QEMU byte is compared to the corresponding emulator memory byte, then each
word is checked against the frozen manifest. This checks real emitted
machine-code execution across independent implementations, but not all ISA
instructions or control paths.

Evidence records include the source SHA-256, binary SHA-256, output
SHA-256, actual GNU/QEMU versions, source commit, test IDs, numeric
results, error handling, and `physicalValidation: "none"` with
`realWorldBuildSuccessPercent: null`.

## Automated acceptance and negative controls

- `tests/rv32m.test.mjs`: all eight instructions, signed/unsigned
  multiply high, wraparound, zero division, signed overflow, signed
  remainder, 12×12 operand cross-product with an independent mathematical
  BigInt test oracle, immutable x0, invalid profile, and RV32I default.
- `tests/phase8-acceptance.test.mjs`: reject missing, renamed, duplicate,
  extra, skipped, altered expected outputs, stale commit, falsified physical
  claim, malformed source or tool provenance.
- `tests/browser-3d.html`: real browser selects RV32I, demonstrates
  M-operation rejection, selects RV32IM, executes a real `MUL` instruction,
  and confirms the evidence UI remains uncalibrated.
- `.github/workflows/phase8-rv32m.yml`: installs the real independent
  GNU/QEMU engines, executes unit tests, compares the compiled binary,
  runs a strict source-fingerprint and frozen-case gate and uploads
  `phase8-rv32m-independent-evidence`.
- All prior unit, browser, Ngspice, Qiskit, NumPy, and Phase 7 external
  checks continue running without changing their reference tolerances.

No case may be reported as passed if the external engine is missing or a
required result is absent. A green external pipeline proves only the
**specified tested instruction scenarios**.

## Remaining work and next data dependencies

1. **Broader RV32I/M certification:** ACT4 tests, target-specific UDB,
   linker, macros, and an emulator-compatible console/test runner;
   official generated signatures/ELFs and exactly pinned versions.
2. **RISC-V wider coverage:** RV32 privileged environment and exception
   handling, Zicsr, Zifencei, compressed instructions, atomic/float,
   RV64, vector, multicore and bounded memory hierarchy, each with new
   independent oracles and acceptance manifests.
3. **Accelerator:** ONNX operator fixtures, licensed model/dataset pairs,
   full inference reference and explicit precision/quantization checks,
   distinct from the current small NumPy matrix calculations.
4. **Analog/layout:** actually install and pin a suitable open PDK, run
   real DRC/LVS/STA and compare post-layout simulation; current PDK source
   URLs alone are not evidence of passing fabrication constraints.
5. **Physical validation:** qualified silicon, raw actual measurements,
   instrument records, environment/process metadata, and independent
   calibration-versus-holdout tests before *any* real-world build-success
   percentage may be considered.

This PR is stacked on unmerged Phase 7 (PR #7). PRs #3–#6 remain open,
and **AeroForge is separate**. No auto-merge or production release is
authorized.
