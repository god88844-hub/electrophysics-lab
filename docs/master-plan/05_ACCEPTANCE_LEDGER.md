# Acceptance Ledger (live)

Status values: `VERIFIED` · `IN_PROGRESS` · `NOT_STARTED`. Every row must keep
its `verification` command passing on the current branch. One WP per PR
(Builder Rule 2); update the row + evidence link in the same PR.

| WP | Work Package | Status | Depends on | Verification command | Evidence |
| --- | --- | --- | --- | --- | --- |
| WP-0A.1 | Phase 30/39 CI regressions fixed (generated outputs untracked) | VERIFIED | — | `npm test` + Phase 30/39 scripts clean; CI 122-check green on PR #98 | PR #98 commit ba77f05/b85de15; local CAPTURE+STRICT & BUILD/VERIFY/STRICT PASS logs |
| WP-0A.2 | Master plan lock (this directory + schemas + ledger) | VERIFIED | WP-0A.1 | `node --test tests/master-plan-integrity.test.mjs` | this PR (docs/master-plan/**) |
| WP-0A.3 | Offline vault sealed (reference-library 01–08, cad-specs 01–04, curriculum, manifests) | VERIFIED | WP-0A.2 | `node --test tests/master-plan-integrity.test.mjs` | data/** MANIFEST.json ×3 |
| WP-1.1 | Tauri v2 desktop shell + typed IPC skeleton | NOT_STARTED | WP-0A.3 | Playwright desktop smoke (`npx tauri build` artifact boots) | — |
| WP-1.2 | `crates/ep-kernel` workspace: ep-core (units, materials, admission) native + wasm32 | NOT_STARTED | WP-0A.3 | `cargo test -p ep-core` + wasm bindgen smoke | — |
| WP-1.3 | `.eplab` Save/Open/Auto-save with SHA-256 integrity | NOT_STARTED | WP-1.1, WP-1.2 | schema-validation unit test + round-trip Playwright | — |
| WP-1.4 | Command-Pattern Undo/Redo across CAD edits | NOT_STARTED | WP-1.3 | unit test (edit stack parity) + Playwright | — |
| WP-1.5 | 60 FPS CAD viewport + ViewCube + hover telemetry (kernel-frame fed) | NOT_STARTED | WP-1.2 | Playwright FPS trend + frame-schema validation | — |
| WP-1.6 | Multi-channel oscilloscope & logic analyzer dock + admission controller UI | NOT_STARTED | WP-1.5 | unit tests (admission refusals) + Playwright dock test | — |
| WP-2.1 | `ep-circuit`: Rust MNA + numeric-Jacobian Newton (parity with ESM) | NOT_STARTED | WP-1.2 | `cargo test -p ep-circuit` (divider/inverter oracles) | — |
| WP-2.2 | BSIM-calibrated SKY130A MOSFET levels (tables from public models) | NOT_STARTED | WP-2.1 | ngspice differential ±5 % | — |
| WP-2.3 | Implicit-stable 2D/3D Fourier thermal PDE (BE/CN) in `ep-thermal` | NOT_STARTED | WP-2.1 | analytic steady-state ±2 % + unconditional-stability test | — |
| WP-2.4 | ngspice CI differential verification harness (kernel vs oracle) | NOT_STARTED | WP-2.1 | `node scripts/phase2x-diff.mjs` ngspice suite | — |
| WP-2.5 | Direct 3D schematic editing + Manhattan routing on kernel netlists | NOT_STARTED | WP-1.4, WP-2.1 | Playwright place/route/probe flow (v3 spec, kernel-backed) | — |
| WP-2.6 | Forensics: threshold VFX + 100 ms slow-mo + AI Fix on kernel events | NOT_STARTED | WP-2.3 | Playwright breakdown→dock→AI Fix (kernel events) | — |
| WP-3.1 | `ep-logic`: event-driven Binary/Ternary/Q4/Custom-Radix simulator | NOT_STARTED | WP-2.1 | truth-table parity vs Phase 0 logic engine | — |
| WP-3.2 | Transistor-level characterization feed (Layer 1 → cell arcs) | NOT_STARTED | WP-2.2, WP-3.1 | arc timing ±5 % vs characterized solve | — |
| WP-3.3 | Custom 3D IC Packager (macro-model extraction per custom-ic.schema) | NOT_STARTED | WP-3.2 | extraction ±5 %/±10 % unit tests + schema validation | — |
| WP-3.4 | Polygon-accurate 3D layer viewer for the 4 verified Q4 primitives | NOT_STARTED | WP-0A.3 | Playwright geometry assertions from cad-specs 01 | — |
| WP-3.5 | Hierarchical Binary/Ternary/Q4 ALU composer | NOT_STARTED | WP-3.3 | composed-ALU truth-table parity tests | — |
| WP-3.6 | Optional native CI DRC/LVS/PEX + statistical PDK admission gate | NOT_STARTED | WP-3.1 | Level-1 INSUFFICIENT_MODEL_DATA admission evidence | — |
| WP-4.1 | `ep-chip`: cycle-accurate RV32IM/Custom-ISA CPU | NOT_STARTED | WP-1.2 | register-file bit-exact vs harness + QEMU bounded | — |
| WP-4.2 | SIMT GPU warp kernel (divergence + occupancy) in kernel | NOT_STARTED | WP-4.1 | divergence 2× cycle test parity | — |
| WP-4.3 | INT8/QDQ + Q4 systolic TPU in kernel (cycle model + exact math) | NOT_STARTED | WP-4.1 | bit-exact GEMM + cycle-model tests | — |
| WP-4.4 | Unified-memory SoC interposer composer (NoC, DVFS throttle loop) | NOT_STARTED | WP-4.3 | unified-vs-discrete delta tests + throttle event test | — |
| WP-4.5 | Live Assembly/Forth/C-binary execution driving 3D packet flow | NOT_STARTED | WP-4.1 | Playwright program-run → packet-flow assertions | — |
| WP-4.6 | QEMU + ONNX Runtime CI oracles | NOT_STARTED | WP-4.1, WP-4.3 | oracle table tolerances (03 §5) green | — |
| WP-4.7 | Click-to-drill-down tile → Layer 1 transistor stress analysis | NOT_STARTED | WP-4.4, WP-2.1 | Playwright drill-down → stress panel assertion | — |
| WP-5.1 | `ep-quantum`: Lindblad/Kraus kernel (parity with ESM engine) | NOT_STARTED | WP-1.2 | trace/positivity/T1/T2 oracle parity tests | — |
| WP-5.2 | Pauli-frame QEC 50–500+ qubit frames (surface code + decoder) | NOT_STARTED | WP-5.1 | logical-vs-physical sweep + determinism tests | — |
| WP-5.3 | MPS low-entanglement engine (offline path, admission-gated) | NOT_STARTED | WP-5.1 | MPS-vs-exact parity on 6-qubit random states | — |
| WP-5.4 | Parametric 3D rigs (transmon/MZI/neutral atom) from cad-specs 03 | VERIFIED | WP-0A.3 | geometry-from-JSON assertions | `tests/quantum-rig-geometry.test.mjs` (12 tests: every dimension equals its cad-specs 03 JSON value, parametric mutation-binding proof, fail-closed validation, PBR parsed from JSON material strings, physical-sanity/no-interpenetration) + `apps/electrophysics-3d/e2e/quantum-rigs-geometry.spec.mjs` (5 Playwright tests: live-scene mesh bbox/instance counts/lattice pitches == `deriveAll(cad-specs 03)` shared module, app ships the sealed JSON verbatim, docked Bloch preserved, quench via JSON-parsed Al Tc ≈ 1.2 K); `npm test` 1075 pass / 0 fail; Phase 39 self-test + clean-tree BUILD/VERIFY/STRICT PASS; PR #100 |
| WP-5.5 | OpenQASM/Pulse IDE + hybrid control coupling to Layer 3–4 chips | NOT_STARTED | WP-4.4, WP-5.1 | QASM parse→run→readout round-trip test | — |
| WP-5.6 | Cryogenic quench forensics coupled to Layer 1 thermal solver | NOT_STARTED | WP-5.1, WP-2.3 | quench event + thermal cross-check test | — |
| WP-6.1 | Guided Academy missions M1–M11 with automated physics grading | NOT_STARTED | WP-2..5 | data/curriculum pass-criteria unit tests | — |
| WP-6.2 | Fixed-seed AI Co-Inventor multi-domain optimizer (kernel) | NOT_STARTED | WP-5.1 | reproducibility (identical seed ⇒ identical bundle) | — |
| WP-6.3 | 30 s cinematic/forensic video recorder (deterministic capture) | NOT_STARTED | WP-1.5 | recorded-frame hash determinism test | — |
| WP-6.4 | Reproducible experiment bundle exporter (schema-validated) | NOT_STARTED | WP-6.2 | experiment-bundle.schema validation + seed-replay test | — |
| WP-6.5 | Reproducible Windows `.exe` installer build & verification | NOT_STARTED | WP-6.1..6.4 | installer SHA-256 vs Phase 39 source baseline | — |

Counts: 39 work packages (WP-0A.1–3, WP-1.x, WP-2.x, WP-3.x, WP-4.x, WP-5.x, WP-6.x).
Only `VERIFIED` rows carry evidence links; `NOT_STARTED` rows must reference
the phase playbook section that defines their `[ ]` checklist.
