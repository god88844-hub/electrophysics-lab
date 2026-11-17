# ⚗ Invention Lab

An interactive computing invention laboratory: design, assemble, simulate, experiment with,
and evaluate **electronics, binary/ternary/multivalued logic, analog and digital chips,
CPUs, GPUs/TPUs and other computing architectures, and quantum circuits**.

**AeroForge is a separate flight-simulation project** and is not part of this
repository or its development roadmap.

## The mission

Simulation outcomes must **predict real hardware behavior within stated tolerances** — and the
platform never claims more than it can prove:

- Every component carries **model provenance** (what model is used, what it ignores).
- Every physical parameter carries a **tolerance** (e.g. resistors ±5%).
- Every design run produces a **validation report**: checks with pass/warn/fail/unknown verdicts,
  statistical confidence, and an explicit list of *assumptions & unknowns*.
- **Verdict discipline (post-audit):** the requested analysis must actually execute (a failed or
  unsupported run can never contribute to a PASS); an electrically incomplete design (undriven
  inputs, bus contention) can never PASS; **any uncalibrated assumption caps the verdict at WARN**
  ("mathematically correct, physically unverified"); and reports separate four evidence stages —
  **execution**, **mathematical correctness**, **cross-solver agreement**, and **independent
  physical validation**, the last of which is always `none` until real measurements are supplied.
- Monte Carlo support: sample parameters within their tolerances and observe output spread.
- Nothing is ever marked "safe to build" without documented evidence. If a component has no
  validated model, the report says **unknown** — it does not quietly pass.

This follows George Box's maxim: *"all models are wrong; the practical question is how wrong do
they have to be to not be useful."*

## Quick start

```bash
npm start          # zero dependencies — starts http://127.0.0.1:8080
npm test           # complete versioned test suite (node --test)
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080), pick a lab, load an example from the menu,
press **▶ Run**. Every design gets a verdict badge (✔ PASS / ⚠ WARN / ✘ FAIL / ? UNKNOWN) and a
full report in the **Report** tab. Press **?** for the beginner tutorial.


## 3D computing playground foundation (new)

The Logic, Chip and Quantum labs now include a **3D View** toggle that renders the
**same design and connections** in a dependency-free WebGL workspace. Orbit, zoom,
select, add components, Shift-drag to move, and click 3D output/input sockets to
connect existing typed ports. Toggle **2D Wiring** to use the precise diagram editor.
Existing simulation solvers, project files and scientific validation remain shared.

The **Build Evidence** tab does not fabricate a physical build-success percentage.
It reports current design checks, states when real-world probability is **not
estimated**, and offers a separately labelled educational resistor-divider
Monte Carlo experiment. The latter calculates a *conditional model-only*
scenario pass percentage under explicit Gaussian and independence assumptions,
not physical manufacturing yield.

See [docs/3D-PLAYGROUND-FOUNDATION.md](docs/3D-PLAYGROUND-FOUNDATION.md)
for implemented capabilities, limitations, and the roadmap to multi-scale
semiconductor / processor / quantum invention workflows.

Our long-term goal is that simulation evidence becomes sufficiently validated
to support **the same specific engineering decisions** as physical evidence
inside demonstrated operating envelopes, with traceable uncertainty and
justified probabilities. Physics and mathematics make modeling possible, but
unmeasured model discrepancy and fabrication variation prevent universal
simulation-to-physical equivalence claims.

## Hierarchical computing assemblies (Phase 5 foundation)

In the Logic, Chip and Quantum labs, use **Assemblies** to capture a set of
components as a reusable module, place independent copies, and explore one
subsystem in the 3D view. The template stores its registered parts, parameters,
internal wires, and exposed input/output sockets. Placed copies expand into
**real flat-netlist components and typed wires** so existing simulators keep
their authority. The design's group metadata round-trips with project JSON;
the browser module library can be imported/exported separately.

This is one-level modular design and 3D visual drill-in, **not** yet a
transistor-accurate multi-level CAD/fabrication system. Copying a working logic
or chip module never implies a real-world physical validation PASS or a
manufacturing success percentage.

See [docs/ASSEMBLIES.md](docs/ASSEMBLIES.md) for interface contracts, the
module-library format, risks, tests and roadmap.

## Parametric Nested Computing Modules (Phase 6)

The reusable module shelf can now **compose modules inside other modules**.
Choose two or more existing assembly groups, capture their actual typed
cross-connections, expose numeric parameters, and place a nested copy with
edited component values. Hierarchies are compiled into the **same real
blocks and wires** used by the Logic, Chip and Quantum solvers; 3D child
drill-in is an inspection view, not a substitute simulation.

Import/export uses versioned module-library JSON and remains compatible with
Phase 5's original one-level module library files. Cycles, incompatible
interfaces, duplicate connections, invalid numeric values and invalid child
references are rejected before altering the project.

[Phase 6 implementation and limitations](docs/NESTED-MODULES.md)

## RISC-V architecture lab and independent numerical references (Phase 7)

A new **RISC-V RV32I** lab accepts bounded, real 32-bit machine-code words.
It models a single unprivileged RV32I 2.1 integer hart with registers,
byte-addressed memory, branch/jump execution and explicit traps. An example
computes x3 = 12 and stops at EBREAK. It remains separate from the original
IL-8 pipeline CPU Lab and does **not** claim cycle-accurate processor timing
or real silicon behavior.

The separate [Phase 7 independent architecture references](.github/workflows/phase7-oracles.yml)
CI workflow uses **GNU RISC-V binutils and QEMU user-mode** to execute a
real RV32I program independently, then compares its output with the
JavaScript interpreter. It also cross-checks two fixed arithmetic workloads
in the AI accelerator model against **real NumPy 2.4.6**. The
[Phase 7 acceptance manifest](benchmarks/phase7/acceptance.json) fails on
missing/duplicate/nonpassing reference evidence. All reports retain
source/fixture fingerprints and a clearly absent physical-validation stage.

The research findings and their limits are summarized in
[Phase 7 Data and Validation](docs/PHASE7-DATA-AND-VALIDATION.md).
A public PDK link does **not** prove our circuit passed actual DRC/LVS, and
numerical agreement does **not** establish a physically validated build
probability.

## RV32M processor extension and independent architectural evidence (Phase 8)

The **RISC-V RV32I / RV32IM** lab now offers an explicit opt-in RV32IM
profile. It implements all eight ratified RISC-V M-extension multiply,
divide and remainder operations, including signed/unsigned high-half
multiplication, divisor-zero behavior and overflow edge cases. Plain
RV32I still rejects M instructions.

A separate [Phase 8 QEMU differential workflow](.github/workflows/phase8-rv32m.yml)
assembles the [fixed RV32M program](benchmarks/phase8/rv32m-operations.S)
with GNU tools, executes the actual binary in QEMU and compares **all 48
output bytes / 12 frozen reference words** against Invention Lab's
functional emulator. Strict source, commit, case-count and tool-provenance
gates reject missing or fabricated evidence. Earlier Phase 7 QEMU/NumPy
and all Ngspice/Qiskit benchmarks continue independently.

This establishes scoped *software execution agreement*, **not** ISA
certification, cycle-accurate chip timing, physically validated silicon
or a manufacturing-success probability. See
[Phase 8 validation and data dependencies](docs/PHASE8-RV32M-VALIDATION.md).

## ONNX functional inference and independent CPU oracle (Phase 9)

The **AI Accelerator Lab** now includes five interactive, bounded
**ONNX opset-13 float32 inference graph examples**. They cover MatMul,
Gemm, Add, ReLU, Sigmoid and Softmax as 2D fixed-shape tensors,
including two-layer dense-network inference. Unknown ops, unsupported
shapes, unexpected data types and invalid graph references are rejected.

The separate [Phase 9 ONNX Runtime CPU workflow](.github/workflows/phase9-onnx.yml)
creates actual ONNX protobuf graphs and uses a pinned
**ONNX Runtime CPUExecutionProvider** to independently compute all five
outputs. Invention Lab's existing accelerator kernels are then
compared with the real ONNX outputs under a fixed numerical error
budget. [The frozen graph suite](benchmarks/phase9/graphs.json) and
[the acceptance manifest](benchmarks/phase9/acceptance.json) prevent
silently skipping or renaming cases; source/tool versions, file
fingerprints and output checksums are recorded as CI artifacts.

This subset is **not a general ONNX parser or runtime**. It does not
implement full MLPerf, ONNX model zoo, transformer inference, GPU/TPU
microarchitecture, real hardware timing, fabrication verification or
a measured manufacturing-success probability. See
[Phase 9 data, limitations and evidence policy](docs/PHASE9-ONNX-INFERENCE.md).

## Quantized ONNX int8 / uint8 execution with independent references (Phase 10)

In the **AI Accelerator Lab**, a new quantized-ONNX example selector
offers six small 2D **opset-13** examples using `QLinearMatMul`,
`QuantizeLinear` and `DequantizeLinear`. The numerical model
explicitly handles signed/unsigned 8-bit storage, zero-point offsets,
rounding-to-nearest-even, per-tensor float32 scale and output saturation.
It is opt-in and does not replace or loosen the earlier float32 ONNX
inference and 24-case scientific benchmarks.

The independent [Phase 10 ONNX Runtime CPU workflow](.github/workflows/phase10-quantized.yml)
builds and archives **six real ONNX protobuf models**, executes them using
the pinned ONNX Runtime CPU provider, and checks the exact integer
intermediates and final numerical outputs against committed
[inputs](benchmarks/phase10/quantized-cases.json) and
[separate frozen expected values](benchmarks/phase10/acceptance.json).
The acceptance gate rejects missing, duplicate, stale, reordered or
spoofed results and verifies all reference model and output checksums.

This small slice **does not implement the complete ONNX standard,
mixed-precision GPU/TPU hardware, real model accuracy, or a measured
manufacturing-success probability**. See the
[Phase 10 scope and evidence policy](docs/PHASE10-QUANTIZED-ONNX.md).

## Per-axis ONNX and quantized convolution (Phase 11)

The **AI Accelerator Lab** now runs six new examples for **2D
per-axis QuantizeLinear/DequantizeLinear** and **4D NCHW QLinearConv**
with int8/uint8 inputs, per-output-channel weight scales and offsets,
padding, strides and integer bias. Users can inspect quantized
intermediates and convolution output feature maps. The browser uses
a **MODEL-ONLY** arithmetic interpreter.

The independent [Phase 11 ONNX CPU reference workflow](.github/workflows/phase11-onnx-conv.yml)
constructs and executes six actual ONNX opset-13 models in
**ONNX Runtime CPUExecutionProvider**, compares every output against
separate [frozen expectations](benchmarks/phase11/acceptance.json),
verifies source/commit/output hashes and archives the six real model
binaries. All earlier physical honesty checks and scientific CI suites
remain mandatory. Read the
[Phase 11 validation and data limits](docs/PHASE11-CONV-AND-PER-AXIS.md).

Successful external software comparison does **not** imply complete
ONNX compatibility, calibrated GPU/TPU timing or a physically
validated chip manufacturing-success probability.

## Real UCI Iris model-level inference accuracy (Phase 12)

The **AI Accelerator Lab** can now run a small six-hidden-unit neural
network on **30 unseen labeled Iris observations** from a real
[UCI CC BY 4.0](https://archive.ics.uci.edu/dataset/53/iris)
dataset (DOI: `10.24432/C56C76`). The 150 original rows are included
with attribution, and a frozen stratified 120-training/30-holdout
split prevents accidental label/data leakage. Browser output gives the
observed **29/30 holdout accuracy**, actual class confusion and every
sample's predicted class, rather than a simulated device-performance
percentage.

The separate [Phase 12 independent CI workflow](.github/workflows/phase12-iris.yml)
runs a real train-only **scikit-learn MLP** and **actual ONNX Runtime CPU**
model using the same frozen parameters and compares **every three-class
probability vector** with the existing JS accelerator engine. Missing
or altered test rows, source/license attribution, wrong predictions,
stale source hashes, mismatched ONNX binary and fabricated physical
claims fail closed. See [Phase 12 data and validation](docs/PHASE12-IRIS-MODEL-VALIDATION.md).

This is a very small educational model-level correctness benchmark,
**not MLPerf, real GPU/TPU speed/energy, a qualified chip process, or
a measured real-world build-success probability**.

## Real hardware technology-mapping evidence and physical-validation ladder (Phase 13)

**Primary project goal: evidence credible enough to make engineering build/no-build
decisions.** Invention Lab is a computing-hardware and digital-twin
invention platform spanning logic, circuits, novel architectures,
CPU/RTL, GPU/TPU, semiconductor design and quantum systems. The
earlier independent Ngspice/Qiskit/NumPy, RISC-V and ONNX tests are
valuable *software-scope checks*; they do not equal physical-silicon
validation.

A new [real SKY130 mapping workflow](.github/workflows/phase13-sky130.yml)
now tests an actual synthesizable **8-bit ALU** against an independently
formulated reference using **all 262,144 input vectors**, requires real
**Yosys RTL equivalence** and proves that a deliberately incorrect XOR
implementation **fails**. It downloads a pinned **Apache-2.0 SKY130HD
standard-cell Liberty file** (Git blob and fixed original size checked)
and runs genuine **Yosys ABC technology mapping** to produce a
standard-cell gate-level Verilog netlist. Full logs, tool versions,
actual cell counts, exact source/netlist hashes and an evidence artifact
are required; no missing part is treated as PASS.

The [physical-validation readiness ladder](docs/PHASE13-PHYSICAL-VALIDATION-LADDER.md)
separates proven **functional HDL and standard-cell mapping** from
the still **UNKNOWN** engineering stages: real constrained STA, PVT,
place/route/parasitics, DRC, LVS, actual silicon measurements and
calibration on independent physical evidence.

**No physical chip build-success percentage is estimated**, and
technology mapping alone is never called successful fabrication.
Phase 3's measurement/calibration PR remains separately unmerged.

## Independent benchmarking (Phase 2)

Invention Lab's numbers are validated against **real external solvers** — not against its own
tests. `npm run bench` executes 24 cross-solver benchmarks:

- **Ngspice 47** (independent circuit solver, separate process, batch mode): ten circuit
  benchmarks — divider, current-source polarity, RC transient, RC AC sweep, AC phase, RL,
  diode operating points, NMOS and PMOS transfer curves (documented Level-1 parameter
  mapping), and a combined nonlinear transient. All agree within documented tolerances
  (≤ 5e-4 A / 0.005 V / 0.05 dB as appropriate — every tolerance is justified in the case
  definition, never a global magic percentage).
- **Qiskit 2.6.2** (independent quantum reference): eleven qubit state-vector benchmarks
  (gates, Bell, GHZ, Deutsch-Jozsa, QFT, seeded sampling within 4 sigma) — all agree after
  index-convention mapping and global-phase normalization.
- **Independent NumPy qudit reference**: qutrit/ququart gate sequences, labelled honestly as
  "independent mathematical reference agreement" (Qiskit itself was not executed for qudits).

The benchmarks have already paid for themselves: their first run exposed and pinned down
**five real defects** the original test suite missed (inductor-transient NaN, a non-unitary T
gate, a Qiskit index-mapping error, a `runAC` single-point NaN, and invalid SPICE inline
comments). See [docs/BENCHMARKING.md](docs/BENCHMARKING.md) for the full protocol, evidence
taxonomy, tolerance rationale, and the explicit boundary: **cross-solver agreement is not
physical validation** — the reports keep those stages separate.

## The labs

| Lab | Engine | Highlights |
|---|---|---|
| **Logic** | discrete-event digital simulator | arbitrary radix (binary/ternary/quaternary), min/max/mod algebra, clocks, D flip-flops, full adders, waveform scope, honest `'Z'` propagation, oscillation detection |
| **Chip** | SPICE-style MNA (DC / transient / AC) | R, C, L, diode (Shockley), NMOS/PMOS (square-law + CLM), op-amp with rails, Newton with source-stepping homotopy, power/thermal/Johnson-noise estimates, SPICE deck export |
| **CPU** | IL-8 8-bit RISC, cycle-level 5-stage pipeline | full assembler, forwarding, load-use stalls, branch flushes, I/O ports; **differential validation**: pipeline result must equal an unpipelined architectural reference |
| **AI** | tensor kernels + analytical accelerator model | f64/f32/int8 precision modes with documented error bounds, conv2d, systolic-array cycles/utilization/energy, trainable XOR MLP (deterministic seed) |
| **Quantum** | pure state-vector qudit simulator | qubits, qutrits, ququarts; H/X/Y/Z/S/T/rotations/CNOT/CZ/SWAP + qudit SHIFT/FOURIER/PHASE/SUM; Bell, GHZ, Deutsch-Jozsa, QFT; exact probabilities + sampled counts with binomial standard errors |
| **Optics** *(plugin)* | paraxial thin-lens ray trace | demonstrates the third-party plugin API end-to-end |
| **Cross-Lab** | pipeline orchestration | CPU → AI accelerator and Quantum RNG → CPU demos with data-consistency verification |

## Design principles

1. **Honesty over flattery.** Unconnected inputs read `'Z'`; AC analysis *refuses* nonlinear
   devices rather than silently linearizing; non-convergent Newton iterations raise an error
   instead of returning a wrong number; the AI performance model calls itself analytical (±30%).
2. **Determinism.** Seeded RNGs everywhere (Monte Carlo, quantum sampling, MLP init) — the same
   design always produces the same result, so validation claims are reproducible.
3. **Differential testing.** The CPU pipeline is checked against a reference interpreter; matrix
   kernels against f64; the RC filter against 1/(2πRC); QFT against the direct DFT.
4. **Everything is a plugin.** Labs, components, examples register into one registry; the UI
   discovers them automatically. See [docs/PLUGIN_API.md](docs/PLUGIN_API.md).

## Project layout

```
index.html            app shell
serve.mjs             zero-dependency static server
js/core/              universal data model (Block, Port, Diagram, units, events, validation, pipeline)
js/labs/logic/        Logic Lab: components.js, engine.js, lab.js
js/labs/chip/         Chip Lab: MNA engine (mna.js, engine.js), SPICE export
js/labs/cpu/          IL-8: isa.js, assembler.js, cpu.js (pipeline + reference)
js/labs/ai/           tensor.js, systolic.js, mlp.js
js/labs/quantum/      qudit.js (state vector), gates.js, algorithms.js
js/plugins/           third-party labs (optics demo) — one import line registers a lab
js/examples/          16 built-in examples + 2 cross-lab pipelines
js/ui/                canvas editor, palette, inspector, scopes, app shell
tests/                Node regression and evidence-integrity suites
docs/                 PLUGIN_API.md, TUTORIALS.md
```

## Data format

Projects are JSON documents (`"format": "invention-lab/1"`) holding blocks, wires and per-lab
metadata. Save/Load round-trips exactly; autosave goes to localStorage. Chip Lab designs export
SPICE decks; reports export as standalone HTML.

## Testing

`npm test` runs the full suite in Node (no browser required):

- core: units, event queue, diagram serialization, Monte Carlo, adapters
- logic: exhaustive truth tables for every gate at radix 2/3/4, quaternary ripple adder,
  `'Z'` propagation, contention warnings, oscillation abort, DFF edge behavior
- chip: divider exactness, RC τ within 1%, −3 dB cutoff within 2%, NMOS Id-Vg vs square law,
  CMOS inverter transfer curve, diode vs bisection reference, op-amp gain, power balance
- cpu: assembler encodings, Fibonacci/XOR-swap programs, forwarding (0 stalls), load-use
  (exactly 1 stall), branch flush accounting, flags, differential pipeline-vs-reference fuzz
- ai: f64 vs naive reference, f32/int8 error bounds, conv2d identities, systolic
  self-consistency, deterministic XOR training
- quantum: Bell/GHZ outcomes within 4σ, Deutsch-Jozsa verdicts, QFT vs direct DFT at 1e-9,
  qutrit SUM/SHIFT/FOURIER, unitarity refusal, state-size guard
- plugin: optics registration + thin-lens physics

## Known limitations (stated, not hidden)

- Analog: level-1 MOSFET (no subthreshold/body/capacitances), ideal op-amp (no GBW/slew),
  no temperature-dependent device models, AC analysis is linear-only.
- Quantum: pure states only — no density matrices, no decoherence channels.
- CPU: multi-byte fetch modeled as one IF cycle; no caches/interrupts.
- AI performance model is analytical (±30% vs typical silicon).
- The platform does not integrate external engines (Ngspice/Verilator/Qiskit) yet — the
  adapter points are the lab `run()` interface and the SPICE/QASM-style exporters.

## License

MIT. Physics constants from NIST/CODATA (2019 SI).


## Phase 30 — research software integration and release limits

The current 30-phase computing research programme includes a reproducible
[Phase 30 full-stack release audit](docs/PHASE30-RESEARCH-SOFTWARE-RELEASE.md)
and source-scoped 2D/3D Evidence Atlas. The release workflow independently
replays the original reference datasets, multi-domain tests, full WebGL
browser smoke, live unmerged PR dependency stack, and SHA256 for **every
original Git-tracked source**. A deterministic complete-source ZIP is
built and verified twice.

**Status must be read accurately:** the software milestone is a RESEARCH
CANDIDATE only after CI passes; it is *not* a foundry-qualified chip, a
universal digital twin, a physical flight simulator or a manufacturing
release. Authentic physical ALU observations = 0, real-world build success
= not estimable. Hardware physical qualification, reliability tests,
independent foundry signoff and final human PR merging remain unresolved.
AeroForge is not in this repository or this release.


## Phase 31 — First principles and conditional physical-model percentages

The **Chip Lab → Build Evidence** panel includes a new interactive battery,
two wires and DC fan example that solves motor/fan torque balance, separates
model-only success percentages from observed hardware success, and allows a
hypothetical speed-model discrepancy range. This generic probability engine
supports controlled model-uncertainty experiments without claiming physical
or manufacturing validation. See [Phase 31](docs/PHASE31-FIRST-PRINCIPLES-DECISIONS.md).


## Phase 32 — researched public physical data and missing-parameter audit

The [public physical-data research and validation report](docs/PHASE32-RESEARCH-PHYSICAL-DATA.md)
and [23-field source-requirements inventory](benchmarks/phase32/public-source-catalog.json)
cover actual physical sources needed to make the conditional battery–two-wire–
motor–fan simulations decision-grade: battery SOC/impedance and aging,
wire/contact/thermal variation, motor control and torque constants,
actual fan pressure/flow, correlated manufacturing populations, source
authenticity, uncertainty and independent holdouts.

Twelve exact research-source URLs include original public motor data
repositories, NASA battery evidence, original manufacturer 3 V motor
ratings and ASME/NASA/NIST validation methods. A different motor's
manufacturer figures may inform a bounded hypothesis, but they **do
not** validate the current fan design. The Chip Lab evidence panel
shows this distinction explicitly, including **0/23 physically
validated target-system requirements**. Original public raw motor
files have not been ingested; a CSV shape check alone is not proof
of source identity or physical model accuracy.


## Phase 33 — real original published BLDC measurements, including sensor failure

The [Phase33 data provenance and measured-source audit](docs/PHASE33-ORIGINAL-BLDC-RAW-ANALYSIS.md)
downloads and pins an **original 421,672-byte, 5,073-row 2026 real
BLDC motor test-bench recording** (Robertas Ūselis, CC BY 4.0), verifies
its original Git object ID and measures bus voltage/current and acquisition
timing. Crucially, the publisher marks the sensor as failed and the
tachometer PG signal is stuck HIGH throughout the file, so **the
500 RPM setpoint is not an observed RPM**. The software reports
speed unknown rather than guessing. This is another 24 V motor, **not**
the current hypothetical 3 V fan or any physically measured ALU.


## Phase 35 — independent physical motor-unit holdout, same operating point

[Phase35 original healthy BLDC dataset cross-device holdout](docs/PHASE35-HEALTHY-BLDC-DEVICES.md)
builds **on top of the completed Phase34 healthy speed validation**.
Three source-locked original healthy 24 V BLDC recordings are checked:
training specimens from motor unit 2 (2,000 and 2,500 RPM settings)
and a **physically separate motor unit 3** held out at the same
2,500 RPM setting. This yields actual measured-tach cross-motor
difference, **not** a calibrated real-world success rate for the
unmeasured 3 V brushed battery–wires–fan invention.

## Phase 36 — Two-regime independently held-out BLDC motor model

[Phase36 original-source independent-device evaluation](docs/PHASE36-BLDC-TWO-REGIME-MODEL.md)
trains a **two-point descriptive** speed and upstream-current model on
motor unit 2's original 2,000/2,500 RPM recordings and evaluates it on
motor unit 3's separately recorded matching operating regimes. The new
2,000 RPM held-out motor3 publisher file is Git-blob-pinned to the
original 23,964,792-byte source. Original PG tachometer data are analyzed
instead of assuming controller speed setpoints equal measured speeds.
Strict replay and adverse-provenance tests preserve independent test-unit
separation and record both empirical model error and the naive setpoint
baseline. This is **not** a physical qualification or success-rate
measurement for the unrelated 3 V brushed motor and fan.

## Phase 37 — Independent original physical-source replay and frozen model audit

[Phase37 independent Python physical-source audit](docs/PHASE37-INDEPENDENT-PHYSICAL-AUDIT.md)
recomputes Phase36's original **425,925 real source sensor readings** entirely
outside the JavaScript analyzer. It checks all four original publisher Git blob
SHA1s and original byte lengths, shaft tach pulse timing, raw upstream current,
two-point **motor2-only training**, **motor3-only holdout** at two matched
controller settings, model prediction errors and uncalibrated setpoint baseline.
A frozen Phase36 source head prevents changing previous implementation under
the guise of revalidation. GitHub CI runs adversarial Python tests, the full
original-source replay, Node regressions and browser/WebGL smoke.

Even an independently reproduced source-device error remains an empirical
check of another manufacturer's **24 V BLDC test bench**, not a calibrated
physical prediction interval, defect probability or real 3 V battery/fan
success percentage. No matched target fan observations exist.

## Phase 38 — live dependency-stack integration preflight (NO merges)

[Phase38 non-destructive merge-readiness report](docs/PHASE38-INTEGRATION-PREFLIGHT.md)
audits the *live* unmerged Phase3–37 GitHub PR dependency graph and attempts
all 35 corresponding merges sequentially into a temporary local worktree
based on main. It records the first actual conflict and its exact filenames,
or runs the Node regression suite on the fully integrated temporary worktree
if the entire graph merges cleanly. This workflow does **not** merge any
GitHub PR or alter main; those actions still require explicit conflict
reconciliation and reviewed integration.

## Phase 39 — reproducible, independently Git-object-verified source research baseline

[Phase39 complete-source research packaging and scientific scope](docs/PHASE39-REPRODUCIBLE-SOURCE-BASELINE.md)
builds an exact deterministic ZIP of every tracked file and records the
current commit, Git tree, original Git blob identity and SHA256 per source file.
An independent verifier opens the ZIP and reconstructs source bytes directly
from original Git object data, refusing missing, changed or invented files.
GitHub CI repeats the archive build and verifies full Node and browser tests.
The baseline is **research software only**, not a fabricated silicon release,
not a physical success probability for an unmeasured motor/fan assembly, and
**not merged to main**. The historical Phase30 PR status policy must be safely
migrated before integration of original open development PRs.

## Phase 40 — Unified scientific evidence and model applicability passports

[Phase40 scientific model passports](docs/PHASE40-EVIDENCE-PASSPORTS.md) define unit-aware source scope, exact motor/device identity, original publisher provenance and physical inference limits. Requests for a 3 V brushed fan are explicitly incompatible with the measured 24 V BLDC brake-bench model. Missing parameters, out-of-range settings and false claims of independent laboratory certification cannot become physical validation; all unmatched physical success estimates remain UNKNOWN.

## Phase 41 — Source-matched hardware candidate and blocking safety gates

[Research hardware candidate and physical-readiness audit](docs/PHASE41-REFERENCE-HARDWARE-READINESS.md) identifies published **Energizer E91 AA alkaline x2** and **Pololu #1592 brushed DC 3 V motor** ratings, including the manufacturer's discontinuation notice and a potential stall-versus-battery voltage-sag incompatibility. Fan/impeller safety rating, exact wire/connector parts, purchased device specimens and original laboratory measurements **do not exist** in this candidate. It is explicitly NOT a frozen, assembled or physically qualified design; no unverified high-speed impeller experiment is authorized.

## Phase 42 — Traceable physical capture planning without invented measurements

[Phase42 original instrument data capture and strict source/approval gate](docs/PHASE42-INSTRUMENT-CAPTURE-PROTOCOL.md) provides the seven-channel raw CSV schema, source-file SHA256 and instrumentation/serial/provenance requirements, mechanical and electrical safety prerequisites, calibration and holdout design, and a quarantine importer. User-supplied or synthetic CSV can be internally checked but **cannot itself be independently authenticated as physical experiment evidence**. The report explicitly records zero real matched fan sensor measurements, no physical qualification, and no claim of a real-world build-success percentage.

## Phase 43 — Source-backed two-cell E91 conditional battery model

[Phase43 published-manufacturer conditional battery calculations](docs/PHASE43-E91-BATTERY-CONDITIONAL-MODEL.md) implement and independently check hypothetical two-series-cell voltage drop, electrical terminal power and internal dissipation across a fixed current sweep. Manufacturer fresh-cell ratings are not measured pack OCV, load feasibility, runtime, aging or calibration; Phase42 submitted files remain quarantined. Actual physically qualified battery specimens and matching fan readings = **zero**.

## Phase 44 — Conditional copper wire loop and connector loss model

[Phase44 two-wire source geometry and resistance calculations](docs/PHASE44-COPPER-WIRE-CONTACT-LOSSES.md) bound illustrative copper temperature-dependent resistance, AWG24 area, round-trip harness voltage drop, Joule heating and assumed contacts, with independent arithmetic tests. Actual conductor length/part, terminal contact resistance, insulation temperature rating, safe ampacity and real hardware measurements are **unknown** and cannot be inferred from formulas alone.

## Phase 45 — Published brushed motor endpoints and coupled stopped-rotor load hypothesis

[Phase45 Pololu 1592 conditional motor and source circuit](docs/PHASE45-MOTOR-SOURCE-CHARACTERIZATION.md) interpolates two approximate manufacturer motor speed/torque/current endpoints at fixed 3 V, then computes a strictly hypothetical stopped-rotor current through an E91 battery-pair, AWG24 wire loop and assumed contacts. Independent Kirchhoff checks verify voltage balance. **No real motor, wiring harness, battery, fan torque curve, startup behavior or physical safety has been measured or approved.** Neither manufacturer data nor the modeled current is a physical build success rate.

## Phase 46 — dimensionless fan-load similarity, no fabricated impeller

[Source-bound ideal fan affinity ratios](docs/PHASE46-DIMENSIONLESS-FAN-AFFINITY.md) compute *normalized* flow, pressure, power and torque ratios for assumed dynamically similar operating conditions. No selected impeller, pressure-flow curve, measured torque coefficient, safe shaft speed, containment, or actual airflow is known. Fan hardware physical qualification remains UNKNOWN.

## Phase 47 — Conditional coupled electrical, rotational and thermal energy

[Phase47 source-locked implicit midpoint reference](docs/PHASE47-COUPLED-ENERGY-CONSERVATION.md) combines an assumed battery, copper wire/contact loss, a manufacturer endpoint-derived ideal brushed DC motor and **hypothetical** quadratic fan load. Strict numerical tests require energy conservation and expose disagreement among approximate manufacturer motor points. Actual rotor inertia, fan torque coefficient, thermal constants, safety/containment and physical whole-system qualification remain UNKNOWN.

## Phase 48 — Independent whole-system numerical comparison and real-validation gating

[Phase48 Python RK4 vs JavaScript midpoint whole-system audit](docs/PHASE48-WHOLE-SYSTEM-INDEPENDENT-MODEL-AUDIT.md) evaluates five source-scoped hypothetical fan and battery load conditions using separate numerical implementations, energy conservation, frozen Git source manifests and ten explicit outstanding *real* physical validation gates. Numerical agreement is not hardware qualification: no independently verified whole-system fan recordings, actual impeller safe speed or build-success percentage exists.
