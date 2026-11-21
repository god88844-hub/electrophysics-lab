# PHASE 05 — Quantum & Hybrid Studio (Layer 5)

## Objective
Rust Lindblad/Kraus kernel, Pauli-frame QEC at scale (50–500+ qubits), MPS
low-entanglement engine, parametric 3D rigs for all three modalities,
OpenQASM/Pulse IDE, and classical↔quantum hybrid control coupling with cryo
quench forensics shared with Layer 1's thermal solver.

## Non-Goals
No claim of physical qubit validation; no beyond-Clifford statevector
simulation beyond the MPS low-entanglement path; no invented quantum constants.

## Exact Files
- Created: `crates/ep-quantum/**` (lindblad, kraus, stabilizer, mps, optimizer),
  `apps/electrophysics-3d/src/state/qasmIde.ts`,
  `src/ui/cad/QasmIde.tsx`, `src/ui/cad/HybridControlPanel.tsx`.
- Modified: `packages/quantum-engine` (oracle parity only),
  `src/bays/bay1Quantum.ts` (rig dimensions from cad-specs 03),
  `src/workers/quantum.worker.ts` (kernel delegate).
- Contracts: `04_quantum_hardware_modalities.json`, `03_PHYSICS_MATH_FUNDAMENTALS.md` §4,
  `data/cad-specs/03_quantum_hardware_rigs.json`, `solver-frame.schema.json`.

## Interface Contracts
- Density matrices: n ≤ 6 interactive (admission), frames carry
  bloch/purity/fidelity per `solver-frame.schema.json`.
- QEC: Pauli-frame Clifford circuits, syndrome extraction, lookup/decoder
  classes; logical-vs-physical sweeps deterministic under fixed seeds.
- OpenQASM 2.0 subset import → QHAL program; pulse-level DRAG parameters
  exported/importable (JSON, schema-validated).
- Hybrid: classical control chips (Layer 3–4) issue pulse schedules; quantum
  readout returns to classical registers — event order deterministic.

## Checklist

### WP-5.1 — `ep-quantum` Lindblad/Kraus kernel (parity)
- [ ] Operator-splitting integrator parity with ESM engine (trace/positivity/T1/T2 oracles ±0.02)
- [ ] ZZ crosstalk, DRAG pulses, leakage channel parity
- [ ] Admission: n > 6 refused interactively with reason (offline path allowed)

### WP-5.2 — QEC at scale
- [ ] Pauli-frame stabilizer frame for 50–500+ qubits (bitset tableau)
- [ ] Surface-code syndrome extraction + weight-1/union-find decoder classes
- [ ] Logical-vs-physical sweep determinism + threshold behavior tests

### WP-5.3 — MPS low-entanglement engine
- [ ] MPS representation with bond-dimension admission control
- [ ] Parity vs exact 6-qubit density matrix on random low-entanglement states (±0.02 observable parity)
- [ ] Entanglement growth monitor → honest truncation-error reporting

### WP-5.4 — Parametric 3D rigs from cad-specs 03
- [ ] Cryostat/die/MZI/tweezer dimensions bound to the JSON (no hardcoded scene dims)
- [ ] CPW/JJ/halo/packet details from the spec
- [ ] Playwright: geometry-from-JSON assertions

### WP-5.5 — OpenQASM/Pulse IDE + hybrid coupling
- [ ] OpenQASM 2.0 subset parser → QHAL program; errors reported line-precise
- [ ] Pulse IDE: DRAG parameter editing → kernel runs → fidelity readout
- [ ] Hybrid: Layer 3–4 control chip writes pulse schedules; quantum readout
      returns classical bits — deterministic event order tests
- [ ] Cryo quench forensics: Layer 1 thermal solver drives stage temps; quench
      collapses coherence (shared event bus)

## Failure Modes & Edge Cases
- MPS truncation on high-entanglement states → honest truncation-error badge
  + admission suggestion to use the exact path.
- QASM unsupported constructs → precise parse error, never a partial run.
- Quench during an experiment → experiment marked failed (physics event),
  rig enters recovery visualization; no silent continue.
- Scale claim honesty: 500+ qubit frames are Pauli-frame only — the UI states
  this explicitly.

## Acceptance Gate
- `cargo test -p ep-quantum` green (parity oracles, QEC sweep, MPS parity).
- Playwright: rigs-from-JSON assertions, QASM round-trip, hybrid control test.
- `npm test` green; Phase 30/39 clean-tree PASS.
