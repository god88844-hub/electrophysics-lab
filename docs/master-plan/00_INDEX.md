# Electrophysics Lab — Master Plan Index (v4 Lock)

**This directory is the single source of truth for all forward-looking planning.**
Legacy planning stubs in `docs/planning/` contain pointer headers to this file only.

## 60-Second Onboarding (for any builder agent)

1. Read `01_BUILDER_RULES.md` — the hard, enforceable laws. Violations get reverted.
2. Read `02_SYSTEM_ARCHITECTURE.md` — what exists (Frozen Foundation + v4 target) and the dual-target Rust kernel layout.
3. Read `03_PHYSICS_MATH_FUNDAMENTALS.md` before touching any solver — every equation, unit, stability bound, and CI-oracle tolerance is written there. **Never guess an equation.**
4. Open `04_ROADMAP_MASTER.md`, pick exactly ONE unclaimed `WP-X.Y`, then read its phase playbook (`phases/PHASE_*.md`).
5. Execute the work package, run its exact acceptance command + `npm test` + Phase 30/39 clean-tree checks, update `05_ACCEPTANCE_LEDGER.md` in the same PR.

## Repo Map

### Frozen Phase 0 Foundation (do not modify; protected by CI)

| Path | Contents |
| --- | --- |
| `index.html`, `serve.mjs` | Phase 0 web entry + loopback-only research server |
| `js/` | Phase 0 engines: logic/chip/cpu/quantum labs, measure/, bench/, release/, scene/ (1 054-test suite covers these) |
| `benchmarks/` | Phase 0 benchmark harnesses; `benchmarks/evidence/phase23/raw/` holds real captured instrument data (tracked) |
| `.github/workflows/` | 120+ verification workflows incl. Phase 30/39 provenance gates |
| `data/reference-library/01–06` | Verified offline physics/PDK/failure JSONs (SHA-256 manifest) |

### v4 Desktop Software (active development)

| Path | Contents |
| --- | --- |
| `apps/electrophysics-3d/` | CAD/EDA workbench frontend (React + TypeScript + Three.js; Tauri v2 shell prep in `src-tauri/`) |
| `packages/physics-engine/` | MNA + Fourier heat + failure thresholds + sandbox compiler (ESM) |
| `packages/quantum-engine/` | Lindblad/Kraus density matrix, QHAL modalities, Pauli-frame QEC, fixed-seed optimizers (ESM) |
| `packages/chip-engine/` | RV32IM interpreter, Forth core, systolic TPU, SIMT kernel, SoC comparison (ESM) |
| `services/physics-kernel/` | Optional local ngspice WebSocket bridge daemon |
| `data/` | Offline reference library (01–08), parametric CAD specs, curriculum vault |
| `docs/master-plan/` | This directory — the only planning source of truth |

### Planned (v4, not yet created — see 04_ROADMAP_MASTER.md)

| Path | Contents |
| --- | --- |
| `crates/ep-kernel/` | Dual-target Rust simulation kernel workspace (native via Tauri IPC + `wasm32` for browser/CI) |

## Document Map

| File | Purpose |
| --- | --- |
| `01_BUILDER_RULES.md` | Hard enforceable laws (zero-prototype, one-WP-per-PR, clean-tree, admission, honesty) |
| `02_SYSTEM_ARCHITECTURE.md` | Desktop shell, Rust kernel crates, IPC/file schemas |
| `schemas/eplab-project.schema.json` | `.eplab` Save/Open/Auto-save project format |
| `schemas/custom-ic.schema.json` | Hierarchical custom-IC package (pins, radix, macro-model, footprint) |
| `schemas/solver-frame.schema.json` | Fixed-size 60 Hz telemetry frame (zero-GC renderer contract) |
| `schemas/experiment-bundle.schema.json` | Reproducible research/breakthrough export |
| `03_PHYSICS_MATH_FUNDAMENTALS.md` | Complete math spec: MNA, thermal PDE, multi-radix, SoC, quantum + CI oracle table |
| `04_ROADMAP_MASTER.md` | Phase 0A → 6 dependency DAG |
| `05_ACCEPTANCE_LEDGER.md` | Live WP ledger: status, dependencies, verification command, evidence |
| `phases/PHASE_0A..06.md` | 7 granular phase playbooks with WP-X.Y work packages |

## Data Vault (100% offline)

| Tree | Contents | Manifest |
| --- | --- | --- |
| `data/reference-library/` | 01 CODATA 2022 constants · 02 SKY130A/FreePDK45/ASAP7 PDK · 03 multi-radix baselines · 04 quantum modalities · 05 chip benchmarks · 06 failure physics · 07 SoC interposer/memory · 08 standard/multi-radix cells | `MANIFEST.json` |
| `data/cad-specs/` | 01 SKY130 primitive geometry · 02 PCB/BGA/SoC packages · 03 quantum hardware rigs · 04 lab instruments & probes | `MANIFEST.json` |
| `data/curriculum/` | 01 Academy missions (Layers 1–5, machine-checkable pass criteria) | `MANIFEST.json` |

Every JSON carries `provenance_status: verified_offline_standard`, an exact `source_citation`, and is SHA-256 sealed by its manifest. `.gitattributes` pins `data/**/*.json -text` so Windows/Linux hashes are byte-identical. `tests/master-plan-integrity.test.mjs` enforces all of it in CI.
