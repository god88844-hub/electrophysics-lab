# PHASE 08 — Native Rust Kernel and Live Studios

Start after all Phase 07 gates. WP-8.1 defines and exercises the shared
native/WASM request seam. WP-8.2 and WP-8.4 can follow it in parallel.
WP-8.3 follows WP-8.2 for shared Save/Open and shell state. WP-8.5 integrates
the accepted studios. Each WP owns its ledger row.

App paths below are relative to `apps/electrophysics-3d/`. Paths starting
with `crates/`, `docs/`, `scripts/` or `tests/` are repository-relative.
Every WP needs mounted controls, Playwright live screenshot and telemetry
assertions, and a native WebView2 smoke per
[Law 7](../01_BUILDER_RULES.md#law-7--end-to-end-desktop-visibility).
Run the existing Rust and ESM oracles where behavior crosses the kernel
seam. Keep generated evidence and Windows artifacts outside Git.

## WP-8.1 — Native Tauri IPC and WASM parity

**Objective**

Drive visible, admitted desktop workbench telemetry through the existing
Rust engines. Exercise the same solver request and response types from a
browser worker.

**Exact files**

`src-tauri/src/ipc.rs`, `src-tauri/src/main.rs`, `src-tauri/Cargo.toml`,
`src-tauri/Cargo.lock`, `crates/ep-kernel/Cargo.toml`,
`crates/ep-kernel/src/lib.rs`, `crates/ep-kernel/src/live.rs`,
`crates/ep-kernel/tests/live_contract.rs`,
`crates/ep-kernel-wasm/Cargo.toml`, `crates/ep-kernel-wasm/src/lib.rs`,
root `Cargo.lock`, `src/desktop/{index,contracts,bridge,kernelClient}.ts`,
`src/workers/{kernel,physics,quantum}.worker.ts`,
`src/physics/{physicsClient,quantumClient}.ts`, `src/App.tsx`
(kernel status mount), `e2e/wp11-desktop-shell.spec.ts`,
`scripts/wp11-desktop-smoke.mjs` (inside the app),
repository `scripts/v4-release/smoke-desktop-release.mjs`,
`e2e/wp81-kernel.spec.ts`, `tests/wp81-kernel-parity.test.mjs`,
`package.json` (WASM build commands), `vite.config.ts` (WASM dev/build path),
`scripts/build-kernel-wasm.mjs` (repository-relative).

**Interface contracts**

Reuse the typed commands and the existing solver-frame contract. Both
adapters call one Rust dispatcher over `ep-core`, `ep-circuit`,
`ep-thermal`, `ep-logic`, `ep-chip` and `ep-quantum`. The dispatcher
validates versioned request kinds, uses the sealed vault, admits before
allocation and returns domain outputs and provenance. Provide the
logic analysis, packager and ALU requests, chip run/step and DVFS requests,
and QASM, hybrid, QEC and MPS requests consumed by the studio WPs.
A request ID and workspace ID bind each response to its live consumer.
Batch frame transfer and bound its size. Keep admission reporting, file
dialogs and legacy project IO intact.

- [ ] Replace the native idle solve path with admitted circuit, thermal,
  logic, chip and quantum requests and live frame ingestion. Prove
  `ep-core` admission and reference verification on the same route.
- [ ] Export the same dispatcher through `ep-kernel-wasm` and select it
  in browser dev and Playwright. Preserve ESM oracle tolerances.
- [ ] Mount the honest `KERNEL: NATIVE RUST` and `KERNEL: WASM` states.
  Show startup and refusal status and preserve status-to-frame consistency.
- [ ] Retain a traceable path from each command to a typed response.
  Drop stale results and keep solver work off the UI hot path.

**Failure modes**

Fail closed on missing bindings, stale frames, schema drift, corrupt
references and over-budget work. Show why the request was refused.
Backend transport or solver errors must never produce successful telemetry.

**Hard acceptance gates**

Use matched admitted and refused fixtures across native IPC and WASM.
Assert real circuit, thermal, logic, chip and quantum outputs plus ep-core
admission against the Rust and ESM oracles. Playwright and native CDP each
change a live input, assert matching typed telemetry, the correct backend
badge and an over-budget reason, and capture the workspace. Run the
desktop smoke with real `kernelAttached: true` and zero console errors.

## WP-8.2 — Logic & Custom ICs workspace

**Objective**

Add the visible Logic & Custom ICs toolbar workspace between Silicon CAD
and SoC Architect. Build, analyze, package and instantiate logic without
leaving the workbench.

**Exact files**

`src/App.tsx` (workspace toolbar, hotkeys and panel mount),
`src/world.ts` (workspace registry), `src/state/store.ts`,
`src/state/project.ts`, `src/bays/bayLogic.ts`,
`src/ui/logic/LogicStudio.tsx`,
`docs/master-plan/schemas/eplab-project.schema.json`,
`tests/wp13-eplab-project.test.mjs`, `tests/wp82-logic.test.mjs`,
`e2e/wp82-logic.spec.ts`.

**Interface contracts**

Use `logic` as the stable workspace ID. Route circuit operations through
the WP-8.1 kernel contract and `ep-logic` radix/value checks. Put edits on
the existing command history. Verify a v4 project under its original seal
before adding the empty logic workspace. Keep timing and power provenance
from `packager.rs` and the sealed truth-table and characterization data.

- [ ] Mount the Binary, Ternary, Q4 and Custom-Radix circuit builder and
  live truth table and radix noise-margin readout.
- [ ] Add Package as Custom 3D IC backed by `packager.rs`, live pin/radix
  preview in 3D, schema-validated export, import and re-instantiation.
- [ ] Expose the Binary, Ternary and Q4 hierarchical ALU composer via
  `alu.rs`, with operands, opcodes and solver outputs.
- [ ] Persist logic data, restore it on reopen and retain existing
  workspace tabs, shortcuts and per-workspace state.

**Failure modes**

Refuse mixed radix connections, invalid topology, out-of-budget circuits,
unsupported characterization and tampered packages before applying edits.
Surface rejection and preserve the last valid circuit.

**Hard acceptance gates**

Playwright builds and stimulates a circuit in each radix family, compares
truth tables and margins with the kernel fixture, then packages and
re-instantiates a custom IC visible in the viewport. Verify native/WASM
results for Binary, Ternary and Q4 ALU fixtures, the radix mismatch
refusal, legacy project import, save/reopen and recorded screenshots.

## WP-8.3 — SoC Architect live chip studio

**Objective**

Drive live CPU, GPU, TPU and memory control from SoC Architect and make
project reopen reliable under asynchronous restore and rendering.

**Exact files**

`src/bays/bay3Soc.ts`, `src/bays/soc/liveExec.ts`,
`src/ui/InspectorPanels.tsx` (SoC branch), `src/ui/soc/ChipStudio.tsx`,
`src/App.tsx` and `src/state/project.ts` (Save/Open path only),
`e2e/wp13-project.spec.ts`, `e2e/wp45-live-exec.spec.ts`,
`e2e/wp83-chip-studio.spec.ts`, `tests/wp83-chip-studio.test.mjs`.

**Interface contracts**

Use `ep-chip` run IDs and deterministic clock/counter semantics. Stable
tile IDs bind execution telemetry to the WP-7.3 geometry. Project reopen
verifies the seal, commits restored state once, then exposes completion to
the user with the restored project identity.

- [ ] Mount RV32IM load/run/step controls and registers, retaining the
  Assembly, Forth and C-binary flow.
- [ ] Mount SIMT divergence and occupancy controls and counters via
  `ep-chip::gpu`, and INT8/QDQ and Q4 systolic workload and readout
  via `ep-chip::tpu`.
- [ ] Mount unified-memory NoC and closed-loop DVFS via `ep-chip::soc`.
  Show activity, utilization, transfers, temperature and throttle reasons
  from admitted frames. Preserve tile drill-down.
- [ ] Diagnose the WP-1.3 reopen-toast failure and verify the actual
  restore completion and state with deterministic Playwright coverage.

**Failure modes**

Refuse unsupported programs, invalid extents and unsafe requests with the
kernel reason. Never retain heat, packets or success state from another run.
A failed project restore leaves the previous state intact.

**Hard acceptance gates**

Playwright exercises live RV32IM registers, seeded divergent SIMT warps, exact INT8
and Q4 TPU outputs, and NoC contention and DVFS feedback. Assert counters
and selected tile IDs match the current run, and capture each mode.
Retain WP-4.6 QEMU and ONNX oracles, WP-4.5 and WP-4.7 interactive tests,
and pass repeated WP-1.3 save → reload → reopen trials without retries.

## WP-8.4 — Quantum Lab live breakthrough studio

**Objective**

Operate OpenQASM and DRAG, hybrid control, 500-qubit surface-code QEC and
offline MPS from mounted Quantum Lab panels.

**Exact files**

`src/ui/InspectorPanels.tsx` (Quantum branch),
`src/ui/quantum/QuantumStudio.tsx`, `src/bays/bay1Quantum.ts`
(live result bindings), `src/physics/quantumClient.ts` (studio requests),
`e2e/wp84-quantum-studio.spec.ts`, `tests/wp84-quantum-studio.test.mjs`.

**Interface contracts**

Route `ep-quantum::{qasm,hybrid,qec,mps}` through WP-8.1 with fixed
seeds and explicit modality and request IDs. Interactive density matrix,
bounded Pauli-frame QEC and offline MPS are distinct workload kinds.
The offline runner exposes progress, cancellation, memory and truncation.

- [ ] Mount an OpenQASM 2/3 and DRAG pulse IDE with compilation diagnostics,
  seeded execution, measurements and live trace or state readouts.
- [ ] Mount hybrid RV32IM measurement feedback with controller timing,
  T1/T2 idle decoherence and mixing-chamber heat telemetry.
- [ ] Mount an interactive surface-code QEC visualizer through 500 qubits
  with syndrome and decoder results.
- [ ] Mount offline MPS with explicit admission, cancellation, bond and
  truncation telemetry. Keep the solver badge and refusal reason live.

**Failure modes**

Refuse malformed programs, unsupported pulse requests and memory overflow.
Cancel obsolete jobs. A truncated MPS run retains its approximation
provenance. A 500-qubit request never allocates a dense state.

**Hard acceptance gates**

Playwright runs seeded Bell/GHZ and DRAG cases, shows both hybrid feedback
outcomes and thermal telemetry, renders and inspects a 500-qubit QEC result,
and runs and cancels MPS. Assert the dense 7-qubit refusal and an over-budget
MPS refusal. Compare seeded outputs with Rust parity fixtures and capture
each of the four modes with the live result and admission badges.

## WP-8.5 — Co-Inventor, full visual sweep and v4.0.0 installer

**Objective**

Run and replay admitted Co-Inventor optimizations inside the desktop
studios, then ship a reproducible Windows installer with the final evidence.

**Exact files**

`crates/ep-kernel/src/live.rs` (optimizer requests),
`src/desktop/contracts.ts` (optimizer variants), `src/ui/cad/BottomDock.tsx`,
`src/ui/cad/BundleExporter.tsx`, `src/ui/cad/CoInventorStudio.tsx`,
`src/state/experimentBundle.ts`, app `package.json` and `package-lock.json`,
`src-tauri/{Cargo.toml,Cargo.lock,tauri.conf.json}`,
`scripts/v4-release/{build-desktop-release.ps1,smoke-desktop-release.mjs,verify-desktop-release.mjs}`,
`scripts/wp11-desktop-smoke.mjs` (inside the app),
`docs/planning/DESKTOP_BUILD.md`, `e2e/wp85-live-release.spec.ts`,
`tests/wp85-live-release.test.mjs`.

**Interface contracts**

Reuse the fixed-seed kernel optimizer and the sealed experiment bundle
format. Show the objective, units, baseline, trace, result and provenance
for quantum DRAG, silicon trace width and SoC placement in their live
workspace contexts. Keep the existing WP-6.5 Phase 39 receipt format,
artifact comparison and provenance floors.

- [ ] Mount Co-Inventor with seed, bounded inputs, progress, cancellation,
  and apply or replay. Bind output to the current workspace and validated
  request. Export and verify deterministic experiment bundles.
- [ ] Sweep all five workspaces with Playwright screenshots, visible
  interactions, live telemetry, zero console and page errors, and admission
  refusals. Repeat native smoke through WebView2.
- [ ] Build Windows version `4.0.0` twice from the exact Phase 39 source ZIP,
  verify receipt and build comparisons, install and launch the packaged
  payload and stage the executable, installers and receipt to `C:/ep-release/`.
- [ ] Run Rust, browser, Phase 30 and Phase 39 gates and complete the ledger
  only after all evidence is available.

**Failure modes**

Block on a replay or seal mismatch, unbounded optimizer work, inactive
backend, missing workspace evidence, an unexplained rebuild difference
or a broken packaged launch.

**Hard acceptance gates**

Every domain exposes a real trace and deterministic replay from fixed input
and seed. Every workspace has a Playwright screenshot paired with
live telemetry assertions and zero errors, plus native WebView2 smoke.
Retain ≥55 median FPS on the reference iGPU and ≤2 GB app RAM. Verify
the complete release artifact SHA-256 receipt, Phase 39 binding and
Phase 30/39 clean-tree audits. Retain Level-1 `INSUFFICIENT_MODEL_DATA`,
Level-2 `UNQUALIFIED_NO_GO`, 1.95 V SKY130 SOA and the 4/4 Q4 evidence.
