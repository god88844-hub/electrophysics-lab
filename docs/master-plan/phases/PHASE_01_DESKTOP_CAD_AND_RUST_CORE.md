# PHASE 01 — Desktop CAD Shell & Rust Kernel Core

## Objective
Ship the Tauri v2 desktop app shell with the dual-target Rust kernel skeleton
(`ep-core` + kernel IPC), `.eplab` project persistence, command-pattern
undo/redo, and the admission controller — the foundation all later phases
commit through.

## Non-Goals
No new solver physics (Phase 2+), no quantum/SoC kernel work, no curriculum.

## Exact Files
- Created: `crates/ep-kernel/Cargo.toml` (workspace), `crates/ep-core/**`,
  `crates/ep-kernel-wasm/**`, `crates/ep-kernel/src/ipc/**`,
  `apps/electrophysics-3d/src-tauri/src/**` (real IPC commands),
  `apps/electrophysics-3d/src/state/project.ts`, `src/state/history.ts`,
  `src/ui/cad/AdmissionBanner.tsx`, updated `tauri.conf.json`.
- Modified: `apps/electrophysics-3d/src/App.tsx` (project menu, undo/redo
  binding), `vite.config.ts` (wasm target dev hook).
- Contract files: `docs/master-plan/schemas/eplab-project.schema.json`.

## Interface Contracts
- IPC: `kernel.solve(frame: solver-frame)` → `solver-frame` typed arrays;
  `kernel.admit(workload)` → `{ admitted, reason? }` — schemas are binding.
- `.eplab`: `eplab-project.schema.json` — auto-save every 30 s + on blur;
  SHA-256 seal recomputed on every mutation batch.
- Undo/redo: Command pattern, every edit = a Command object with
  `apply(ctx)`/`revert(ctx)`; stack depth 200; memory-bounded (LRU eviction).

## Checklist

### WP-1.1 — Tauri v2 desktop shell + IPC skeleton
- [ ] Promote `src-tauri` from template to a real buildable shell (invoke `npm run build` output)
- [ ] Implement `kernel.solve` IPC command stub returning a valid solver-frame
- [ ] CI: desktop build job optional/manual (web CI untouched)
- [ ] Playwright web suite unchanged and green

### WP-1.2 — `ep-core` admission controller (native + wasm)
- [ ] `ep-core`: units module (SI), material table loader from data JSONs, budget structs
- [ ] `kernel.admit` for quantum n≤6 / MNA ≤64 nodes / thermal ≤128×128 / arena ≤512 MB
- [ ] wasm32 bindgen: `ep-kernel-wasm` exposes admit + a no-op solve
- [ ] `cargo test -p ep-core` admission refusal tests (each budget, fail-closed)
- [ ] `AdmissionBanner.tsx` renders refusal reasons honestly

### WP-1.3 — `.eplab` Save/Open/Auto-save
- [ ] `project.ts`: serialize workspaces to `eplab-project.schema.json`
- [ ] SHA-256 seal: payload hash + referenceLibraryLockedAt snapshot
- [ ] Auto-save 30 s + on window blur; Open validates schema + seal (fail-closed on mismatch)
- [ ] Playwright: save → reload → open → identical store state

### WP-1.4 — Command-Pattern Undo/Redo
- [ ] `history.ts`: Command stack, apply/revert, depth 200, LRU memory bound
- [ ] Commands: PlaceComponent, DeleteComponent, RouteWire, MoveComponent, SetParam
- [ ] Undo/Redo wired to Ctrl+Z / Ctrl+Y across all CAD tools
- [ ] Unit test: apply/revert parity for every command type (state hash equality)

### WP-1.5 — Kernel-frame-fed 60 FPS viewport
- [ ] Renderer consumes solver-frame typed arrays (zero per-frame allocation)
- [ ] ViewCube + hover telemetry read frames, not ad-hoc state
- [ ] FPS trend: ≥55 FPS median over 60 s on the CI reference clip

### WP-1.6 — Instrument dock + admission UI
- [ ] Multi-channel oscilloscope dock channels driven by solver-frame arrays
- [ ] Logic analyzer tab (event streams from ep-logic, Phase 3 stub interface)
- [ ] Admission refusals surface in the dock + status bar (fail-closed honesty)

## Failure Modes & Edge Cases
- Tauri IPC buffer size limits → chunk frames ≤ 1 MiB, reassemble client-side.
- Auto-save races with undo/redo → auto-save serializes the current committed
  history head only.
- Corrupt `.eplab` (bad seal) → refuse to open, show the hash mismatch, never
  partially load.
- wasm memory limits → admission check before allocation; refuse politely.
- Undo across workspace switches → command stack is per-workspace.

## Acceptance Gate
- `cargo test --workspace` green; `node --test tests/master-plan-integrity.test.mjs` green;
  `npm test` green; Playwright: project save/open round-trip, undo parity,
  admission banner, FPS trend ≥55 median. Phase 30/39 clean-tree PASS.
