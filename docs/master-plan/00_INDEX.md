# Electrophysics Lab — Master Plan Index (v5 Lock)

This directory is the single source of truth for forward-looking planning.
The v4 baseline has 39 verified work packages. The v5 lock adds the Phase 07
and Phase 08 plans for rendered desktop studios and live kernel integration.

## 60-Second Onboarding

1. Read the [Builder Rules](01_BUILDER_RULES.md), including Law 7 for Phase 07 and 08.
2. Read the [System Architecture](02_SYSTEM_ARCHITECTURE.md) for the v4 baseline, v5 workspace order and native/WASM contracts.
3. Read the [Physics and Math Fundamentals](03_PHYSICS_MATH_FUNDAMENTALS.md) before changing a solver.
4. Check the [Roadmap](04_ROADMAP_MASTER.md) and [Acceptance Ledger](05_ACCEPTANCE_LEDGER.md). Claim one eligible WP and follow its phase playbook.
5. Run its acceptance checks, `npm test` and the Phase 30/39 clean-tree audits. Attach the required desktop evidence before updating its ledger row.

## Repo Map

| Path | Contents |
| --- | --- |
| `index.html`, `serve.mjs`, `js/` | Frozen Phase 0 web entry, server and engines |
| `benchmarks/` | Phase 0 benchmark harnesses and original measured evidence |
| `.github/workflows/` | Verification workflows including Phase 30/39 provenance gates |
| `apps/electrophysics-3d/` | React, TypeScript and Three.js workbench with Tauri v2 Windows shell |
| `crates/ep-kernel/`, `crates/ep-kernel-wasm/` | Shared Rust workspace and WASM bindings |
| `packages/{physics,quantum,chip}-engine/` | ESM engines and parity surfaces |
| `services/physics-kernel/` | Optional local ngspice WebSocket bridge |
| `data/` | Offline reference, CAD and curriculum vaults |
| `docs/master-plan/` | Master plan, phase playbooks, schemas and ledger |

## Phase Playbooks

| Phase | Playbook |
| --- | --- |
| 0A–06 | [Verified v4 baseline and phase playbooks](phases/) |
| 07 | [Photorealistic Studio Rendering](phases/PHASE_07_PHOTOREALISTIC_STUDIO_RENDERING.md) |
| 08 | [Native Rust Kernel and Live Studios](phases/PHASE_08_NATIVE_RUST_KERNEL_AND_LIVE_STUDIOS.md) |

## Schemas

- [Sealed project](schemas/eplab-project.schema.json)
- [Hierarchical custom IC](schemas/custom-ic.schema.json)
- [Fixed-size solver frame](schemas/solver-frame.schema.json)
- [Reproducible experiment bundle](schemas/experiment-bundle.schema.json)

## Offline Data Vault

| Tree | Contents | Manifest |
| --- | --- | --- |
| `data/reference-library/` | 01 CODATA 2022 · 02 PDKs · 03 multi-radix · 04 quantum · 05 chips · 06 failure physics · 07 SoC interposer and memory · 08 standard and multi-radix cells | [Reference manifest](../../data/reference-library/MANIFEST.json) |
| `data/cad-specs/` | 01 SKY130 geometry · 02 PCB/BGA/SoC packages · 03 quantum rigs · 04 instruments and probes | [CAD manifest](../../data/cad-specs/MANIFEST.json) |
| `data/curriculum/` | 01 Academy missions for Layers 1–5 | [Curriculum manifest](../../data/curriculum/MANIFEST.json) |

Each data JSON includes `provenance_status: verified_offline_standard` and
an exact `source_citation`. The manifests seal the source bytes with SHA-256.
The repository pins these bytes across Windows and Linux in `.gitattributes`.
The [master-plan integrity test](../../tests/master-plan-integrity.test.mjs)
checks the vaults, schemas, package definitions and local links.
