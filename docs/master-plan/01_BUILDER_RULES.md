# Builder Rules — Hard Enforceable Laws (v5 Lock)

These laws bind every agent and engineer working on this repository. They are
enforced by CI (workflows + `tests/master-plan-integrity.test.mjs` + the
Phase 30/39 provenance gates) and by PR review. Violations are reverted.

## Law 1 — Zero-Prototype / Zero-Stub

- Never ship fake or hardcoded UI numbers. Every displayed value must come
  from a solver output or a `data/**` reference file.
- Never ship decorative animations disconnected from solver outputs. Visual
  effects (current flow, heat glow, arcs, smoke, quench, decoherence) are
  driven strictly by computed physics (currents, temperatures, events).
- Never mark a placeholder/stub as done. If a work package is incomplete, its
  ledger row stays `NOT_STARTED` — there is no "mostly done" state.
- Enforcement: `tests/master-plan-integrity.test.mjs` data checks, PR review,
  and the honesty-badges audit in the phase playbooks.

## Law 2 — One Work Package Per PR

- Claim exactly ONE `WP-X.Y` at a time (edit `05_ACCEPTANCE_LEDGER.md` in the
  same PR to mark it `IN_PROGRESS` → `VERIFIED` with evidence).
- Complete every `[ ]` checklist item in the phase playbook for that WP.
- Run the WP's exact automated verification command + `npm test` (1054+ pass,
  0 fail) + the Phase 30/39 clean-tree checks before opening the PR.
- A PR touching two phases' code requires two ledger rows and explicit
  reviewer sign-off; the default is reject.

## Law 3 — Clean Tree & Zero Binary Bloat

- Never commit: `dist/`, `target/`, generated tarballs, test outputs, or
  binary `.glb/.gltf` meshes. All 3D models are generated **parametrically**
  at runtime from `data/cad-specs/*.json` (see `data/cad-specs/01` —
  "zero binary assets" contract).
- Generated evidence outputs (`benchmarks/evidence/phase23..30/phase39`
  summaries, archives) are gitignored — the gate scripts regenerate them per
  run. Only genuine captured instrument data
  (`benchmarks/evidence/phase23/raw/`) is tracked.
- Enforcement: Phase 30/39 clean-tracked-tree audits fail the PR otherwise.
- `.gitattributes` pins `data/**/*.json -text` and `*.html -text` so
  SHA-256 verification is byte-exact on Windows and Linux.

## Law 4 — Hardware & Memory Admission

- Target platform: **60 FPS locked on Intel Core Ultra 7 155U (integrated
  Intel Graphics, 16 GB LPDDR5x-7467, Windows 11)**.
- Peak application RAM budget: **≤ 2 GB**.
- Fail-closed solver admission: the kernel explicitly refuses (returns an
  admission error, never crashes) workloads outside budget — e.g., density
  matrices above the 6-qubit interactive cap outside the offline path, MNA
  netlists beyond the node budget, thermal grids beyond cell budget. Refusal
  is an honest, displayed result with the reason; not a silent clamp.
- The iGPU quality governor (pixelRatio → bloom → shadows) must remain
  automatic; disabling the governor to hit FPS is a Law 1 violation.
- Every PR with runtime code changes runs the Playwright suite and must not
  regress the measured FPS counters on the CI runner (trend check, not a
  gate absolute).

## Law 5 — Scientific Honesty

- Every simulation output carries an explicit provenance badge:
  `SIMULATED_PHYSICS_MODEL`, `SIMULATED_ARCHITECTURAL_MODEL`,
  `SIMULATED_NOISY_QUANTUM`, `SIMULATED_NOISY_MODEL`, or
  `ORACLE_VERIFIED_AGAINST_NGSPICE/QEMU/ONNX/MAGIC/NETGEN`.
- Never claim physical silicon validation. The evidence ladder stays:
  Level-1 `INSUFFICIENT_MODEL_DATA` → Level-2 `UNQUALIFIED_NO_GO` until real
  lab measurements exist (Phase 0 gates unchanged).
- Every numeric constant in `data/**` cites its exact authoritative source
  (CODATA 2022, SKY130A/FreePDK45/ASAP7 public docs, IEEE/NIST/textbook, or
  verified Phase 0 repo artifacts) and is SHA-256 sealed.
- Zero invented constants, fake citations, or unverified specifications.

## Law 6 — Engine Parity (added for v4)

- New solver work lands in the **Rust kernel (`crates/ep-kernel/`)** first;
  the existing ESM packages (`packages/physics-engine`, `packages/quantum-engine`,
  `packages/chip-engine`) are the browser fallback path and must stay
  behavior-identical within the CI oracle tolerances of
  `03_PHYSICS_MATH_FUNDAMENTALS.md` (§ CI Oracle Calibration Table).
- A kernel change without a matching oracle test is rejected; a frontend
  change that bypasses the admission controller is rejected.

## Law 7 — End-to-End Desktop Visibility

- Every Phase 07 and 08 work package must mount its feature in the desktop
  workbench and exercise the user path from a visible control to its live
  result. Headless-only libraries, optional UI omissions, and unmounted
  React components fail acceptance.
- Record Playwright UI assertions, live screenshots, and telemetry assertions
  for every new path. Run the same user path in native Tauri WebView2 smoke.
  Capture the workspace, action, resulting frame or request ID and
  simulation badge where applicable. Verify disabled, unavailable and
  refused states visibly. CI and review require the evidence before a
  ledger row can become VERIFIED.
- All new visual realism assets are generated procedurally. Use PMREM studio
  lighting generated at runtime, Canvas/WebGL normal, roughness and
  silkscreen maps, and beveled Three.js geometry driven by the sealed
  `data/cad-specs/*.json` sources. Commit no `.glb`, `.gltf`, `.hdr`, `.png` or other
  baked visual realism assets. Keep generated screenshots, telemetry and
  captures outside tracked paths to preserve Law 3 and Phase 30/39 gates.
- Measure FPS and memory under the Law 4 governor. Distinguish the reference
  iGPU run from software-rendered CI, and treat missing hardware evidence
  as an open gate. Follow Law 5 for every visible simulation claim.

## Enforcement Summary

| Law | Automated check |
| --- | --- |
| 1 Zero-Prototype | data integrity tests + honesty-badge audit + review |
| 2 One WP per PR | ledger diff inspection + review |
| 3 Clean tree / no binaries | Phase 30/39 gates + `.gitignore` + integrity tests |
| 4 Admission | admission-controller unit tests + Playwright FPS trend |
| 5 Honesty | provenance-badge grep audit + review |
| 6 Parity | kernel oracle tests vs ESM packages |
| 7 Desktop visibility | Playwright interaction, live screenshots and telemetry, native WebView2 smoke, asset audit |
