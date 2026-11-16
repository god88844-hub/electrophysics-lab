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
