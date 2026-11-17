# Integration candidate — reconcile separate Phase 3 with Phases 4–72

**Review-only candidate. `main` is unchanged, and no PR was merged.**

## Git graph audit (17 November 2026)

- `main`: `1a0171801684868a16a2f88a817c4c1e2a014697`.
- Independent Phase 3 tip: `fee4cad85bdea46189c7008cb0dda30efd56bf01` (PR #3, based on main).
- Phase 72 tip: `a2b9b30d1aaa3f619b6983999482a1bb1497193b` (PR #72, originally descending from a different Phase 4 branch).
- Phase 72 was 563 commits ahead of main, while Phase 3 had diverged with 32 commits; a naive merge of Phase 72 into main would not preserve Phase 3 **commit ancestry**.
- Ten Phase 3 measurement/source-test files are byte-identical in Phase 72 already (nine measurement modules plus `tests/measure.test.mjs`).
- Four files existing only on Phase 3 are restored at their **original exact Git blob SHA**: the Phase 3 acceptance JSON, integrity boundaries, plan, and security/integrity regression test.

## Explicit benchmark conflict resolution

The Phase 3 branch had modified six generated, checked-in evidence reports under `benchmarks/evidence/`. The 72-phase branch retains the exact original main versions of those same files. This integration candidate **intentionally keeps main's source-benchmark baseline**, rather than silently copying Phase 3's generated output and replacing evidence from a different run. Both versions remain accessible through the preserved Git ancestry. A fresh post-integration benchmark run and independent review are required if a new evidence baseline is desired.

## Source audit policy

The Phase 30 source allowlist is extended **only to cover the four restored, pinned Phase 3 paths and the new integration audit assets**. The restored Phase 3 files' original Git blob IDs are checked independently; no broad historic-phase exemption is granted. The integration checks verify both parent branches are ancestors, source measurements match Phase 3, no original main or Phase 72 tracked paths are removed, and the baseline six reference reports are unchanged. Full inherited GitHub Actions CI is still required.

## Release scope

This is an **integration candidate**, not the project release. The earlier draft PRs, human code review and security review, usability/installer acceptance, real source-matched fan measurements and fabricated ALU qualification remain separate. Invention Lab must not invent physical success probabilities or claim universal simulation/experiment equivalence.
