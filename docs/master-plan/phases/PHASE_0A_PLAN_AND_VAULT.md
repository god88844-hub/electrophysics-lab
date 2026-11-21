# PHASE 0A — Plan Lock & Offline Vault (CI Clean Foundation)

## Objective
Make `main` 100% green, lock this master plan as the sole planning source, and
seal the 100%-offline data vault (reference library 01–08, parametric CAD
specs, curriculum) with SHA-256 manifests and integrity tests.

## Non-Goals
No new application/frontend/engine code. No changes to Phase 0 gates. No
 weakening of Phase 30/39 provenance audits.

## Exact Files
- Created: `docs/master-plan/**` (this directory), `data/reference-library/07–08`,
  `data/cad-specs/01–04 + MANIFEST.json`, `data/curriculum/01 + MANIFEST.json`,
  `tests/master-plan-integrity.test.mjs`, `.gitattributes`/`.gitignore` updates.
- Modified: `docs/planning/*.md` (pointer headers only), `data/reference-library/MANIFEST.json`.
- Forbidden: anything under `apps/`, `packages/`, `js/`, `crates/` in this phase.

## Interface Contracts
- Manifest format: `invention-lab/reference-library-manifest/1` (see
  `data/reference-library/MANIFEST.json`) — file, sha256, size_bytes per JSON.
- Every data JSON: `provenance_status: verified_offline_standard`, top-level
  `units`, `source_citation`, zero NaN.
- `.gitattributes`: `data/**/*.json -text`, `*.html -text`.

## Checklist

### WP-0A.1 — Phase 30/39 CI regressions
- [x] Diagnose failing run logs (Phase 30 run 44769195243; Phase 39 run 44769197968): tracked working tree dirty
- [x] Identify ALL regenerated-tracked paths: `benchmarks/evidence/phase69-test|rogue-test`, `phase72/package`, `apps/electrophysics-3d/dist/`, `benchmarks/evidence/phase23(summary)/…phase29/`, `phase30/`, `phase39/`
- [x] `git rm -r --cached` + precise `.gitignore` entries; keep `phase23/raw/*.mdm` tracked (real captures)
- [x] Local full gate chain: npm test → phase26-29 scripts → Phase 30 capture+strict PASS → Phase 39 build/verify/strict PASS with `git diff HEAD` = 0
- [x] PR #98 CI: all checks green (no failing, no pending)

### WP-0A.2 — Master plan lock
- [x] `00_INDEX.md`, `01_BUILDER_RULES.md`, `02_SYSTEM_ARCHITECTURE.md`, `03_PHYSICS_MATH_FUNDAMENTALS.md`, `04_ROADMAP_MASTER.md`, `05_ACCEPTANCE_LEDGER.md`
- [x] 4 JSON Schemas in `schemas/` (draft 2020-12, object root, required keys)
- [x] 7 phase playbooks in `phases/` with WP-X.Y granular checklists
- [x] Legacy `docs/planning/*.md` pointer headers → `00_INDEX.md`

### WP-0A.3 — Offline vault seal
- [x] `data/reference-library/07_soc_interposer_memory_baselines.json` (JEDEC LPDDR5/HBM, Apple-M published figures, PCIe reference)
- [x] `data/reference-library/08_standard_and_multiradix_cells.json` (SKY130A hd footprints, ASAP7/FreePDK45, multi-radix macro-specs)
- [x] `data/cad-specs/01–04` parametric blueprints (SKY130 primitives, PCB/BGA/SoC, quantum rigs, instruments)
- [x] `data/curriculum/01_academy_missions.json` (11 missions, machine-checkable criteria)
- [x] Manifests ×3 regenerated; `tests/master-plan-integrity.test.mjs` green
- [x] `.gitattributes` `data/**/*.json -text` verified (Windows/Linux byte parity)

## Failure Modes & Edge Cases
- Autocrlf renormalization breaks SHA-256 → solved by `.gitattributes -text`
  (+ local `core.autocrlf=false` for byte-exact verification).
- Gate scripts regenerate tracked files → all generated outputs untracked +
  gitignored; scripts read summaries from the working tree in the same run.
- Data JSONs with NaN placeholders → integrity test fails closed.
- A builder edits `data/**` without regenerating manifests → SHA test fails.

## Acceptance Gate (machine-verifiable)
- `node --test tests/master-plan-integrity.test.mjs` → 12 pass / 0 fail.
- `npm test` → 1054+ pass / 0 fail / ≤1 skip.
- Full Phase 30/39 chain locally → PASS with `git diff --name-only HEAD` empty.
- CI: all 122 checks green on the carrying PRs.
