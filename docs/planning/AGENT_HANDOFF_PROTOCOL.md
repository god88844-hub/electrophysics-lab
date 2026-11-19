# AGENT_HANDOFF_PROTOCOL.md — strict playbook for switching builder agents

## Pre-flight checklist (new agent MUST verify before writing any code)

1. `git fetch origin && git checkout main && git pull` — confirm the exact HEAD SHA
2. `npm test` — confirm all existing tests pass (1000+ tests, 0 failures)
3. Read `docs/planning/MASTER_PLAN.md` — understand the dependency DAG and current status
4. Read the SPECIFIC phase playbook for the assigned sub-phase
5. Read `docs/planning/UX_GAME_DESIGN.md` — understand the anti-clutter rules
6. Create a branch named `feature/<phase><subphase>-<description>` (e.g., `feature/phase1.1-webgpu-core`)

## Claiming one sub-phase

1. Read the phase playbook for your assigned sub-phase (e.g., `1.1`)
2. Implement ONLY that sub-phase — do not touch other sub-phases
3. Add unit tests for your changes
4. Run `npm test` — 0 failures required
5. If the sub-phase affects the 3D app, run the headless browser smoke test
6. Commit with a message that references the sub-phase number
7. Push and open a PR against `main`

## Mandatory regression & 60 FPS checks

1. All Phase 0 tests must pass (1000+ tests)
2. All reference-library tests must pass (8 tests)
3. All Phase 3 measurement tests must pass (32 tests)
4. If touching the 3D app: headless browser must show 0 console errors
5. FPS must not regress below 55 FPS on the target hardware
6. Do not change any tolerance, threshold, or scientific constant without a source citation

## Updating status matrices

1. Update the phase status in `docs/planning/MASTER_PLAN.md` (only your own row)
2. Mark completed sub-phases in the phase playbook
3. NEVER mark something as done that is not actually done
4. NEVER invent evidence, test results, or performance numbers
5. If a test fails, report the failure honestly — do not hide it

## Prohibited actions

1. Do not merge your own PR
2. Do not force-push
3. Do not delete other agents' work
4. Do not expand scope beyond the assigned sub-phase
5. Do not change numerical tolerances to conceal failures
6. Do not claim physical validation without real measurements
7. Do not bring AeroForge requirements into this repository
