# PHASE 06 — Academy, Co-Inventor & Release (Layer 6)

## Objective
Guided Interactive Engineering Academy (Transistor → Logic → Custom IC →
CPU/TPU/SoC → AI → Quantum) with automated physics grading; the fixed-seed AI
Co-Inventor multi-domain optimizer; a deterministic 30 s cinematic/forensic
video recorder; the reproducible experiment-bundle exporter; and a
reproducible Windows `.exe` installer verified against the Phase 39 source
baseline.

## Non-Goals
No graded claims beyond machine-checkable physics criteria; no marketing
metrics; no physical-hardware claims (Law 5).

## Exact Files
- Created: `apps/electrophysics-3d/src/academy/**` (mission runner, grader),
  `src/ui/cad/AcademyPanel.tsx`, `src/ai/coinventor/**` (multi-domain
  optimizer wrapper), `src/record/cinematic.ts`,
  `apps/electrophysics-3d/src-tauri/**` (release installer config),
  `scripts/release-verify.mjs`.
- Modified: `data/curriculum/01_academy_missions.json` (mission set expansion),
  `docs/master-plan/05_ACCEPTANCE_LEDGER.md`.
- Contracts: `data/curriculum/01_academy_missions.json` pass criteria;
  `experiment-bundle.schema.json`; Phase 39 source-baseline ZIP.

## Interface Contracts
- Grader: each mission's pass criteria are solver-output checks (from
  `data/curriculum`) executed against the live kernel — no visual/appearance
  grading, no LLM judgment, no subjective thresholds.
- Co-Inventor: identical seed + identical code version ⇒ bit-identical bundle
  (replay test). Bundles carry `SIMULATED_*` badges + noise citations.
- Recorder: deterministic frame capture (fixed timestep, recorded input
  events) — replay renders identical frames.
- Installer: built from the exact Phase 39 source ZIP; installer SHA-256
  recorded next to the ZIP SHA-256 in the release evidence.

## Checklist

### WP-6.1 — Academy mission runner + grader
- [ ] Mission runner executes `data/curriculum` setups into the correct workspace state
- [ ] Grader evaluates each `pass_criteria` entry against live solver outputs
- [ ] Mission progress persisted in `.eplab` (per-mission status)
- [ ] Unit tests: every mission's criteria evaluated against seeded sol outcomes

### WP-6.2 — AI Co-Inventor multi-domain optimizer
- [ ] Domains: DRAG pulse (quantum), trace width/rail (silicon), tile workload
      placement (SoC) — all fixed-seed (SPSA → Nelder–Mead parity retained)
- [ ] Kernel-side optimizer with ESM parity (identical seeds ⇒ identical traces)
- [ ] Bundle export per `experiment-bundle.schema.json` + SHA-256 seal

### WP-6.3 — Deterministic cinematic/forensic recorder
- [ ] Fixed-timestep capture (30 s default) of viewport + dock telemetry
- [ ] Recorded input events replay to identical frame hashes
- [ ] Export as WebM (recorded, not streamed-claim) with metadata sidecar JSON

### WP-6.4 — Experiment bundle exporter
- [ ] Schema-validated export from the AI Co-Inventor + Academy runs
- [ ] Seed-replay test: re-running the recorded seed reproduces the bundle

### WP-6.5 — Reproducible Windows installer
- [ ] `npx tauri build` from the exact Phase 39 source ZIP checkout
- [ ] Installer SHA-256 recorded alongside the Phase 39 ZIP SHA-256
- [ ] Rebuild twice → byte-identical installer (or documented delta)
- [ ] Smoke: installer boots the workbench, Playwright web suite still green

## Failure Modes & Edge Cases
- Mission criteria evaluation with paused solvers → grader waits for live
  frames (never grades stale/replay data without a badge).
- Optimizer seed divergence (platform float drift) → canonical replay uses
  the recorded trace, not a re-run claim; divergence is reported honestly.
- Recorder memory pressure → 30 s @ 30 fps cap, frame queue bounded (Law 4).
- Installer rebuild delta → every difference enumerated in the release
  evidence; unexplained deltas block the release.

## Acceptance Gate
- `node --test tests/academy-grader.test.mjs` green (all missions, seeded).
- Bundle replay test green; schema validation green.
- Installer builds twice reproducibly; smoke boots; Phase 39 baseline intact.
- `npm test` green; Playwright green; Phase 30/39 clean-tree PASS.
