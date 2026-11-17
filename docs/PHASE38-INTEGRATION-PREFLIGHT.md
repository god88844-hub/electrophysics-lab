# Phase 38 — Safe preflight before merging 35 stacked pull requests

**This phase does not merge any GitHub PR or alter main.** It performs the necessary independent dependency-graph validation and throwaway integration test to learn exactly what would break, as a prerequisite for the later reviewed integration.

The current development history contains two separate early branches: PR #3 (physical-calibration foundation) and PR #4 (3D workspace) both target main. PRs #5–37 form the subsequent stacked feature chain. Merging the newest branch straight to main without understanding these relationships could omit or overwrite Phase3 or create hard-to-review changes.

The preflight reads the actual GitHub API live PR metadata for #3–37 and fails if a PR is missing, merged, imported from a different repository, or based on an unexpected earlier branch. It pins each original head SHA, retrieves all GitHub PR refs into a local CI checkout, and attempts merges sequentially into a **temporary detached worktree** based on the real origin/main.

If there is a conflict, it stops at the first blocking PR and publishes the exact conflicted file paths, without altering main or any PR. If every merge succeeds, it runs the original npm test suite on the temporary combined tree and records whether integration tests pass. The machine-readable report states that Phase38 integration is still **NOT COMPLETE**; preflight success is only a readiness check.

## Execute

- Python-only graph self test: python3 scripts/phase38-integration-preflight.py --self-test
- Authenticated live PR preflight: GH_TOKEN=<valid read-only token> python3 scripts/phase38-integration-preflight.py
- Dedicated GitHub CI: .github/workflows/phase38-readonly-merge-preflight.yml
- Evidence: benchmarks/evidence/phase38/phase38-preflight.json and phase38-summary.json

**Safety:** No `git push`, remote merge or branch update is executed. Use explicit human-reviewed conflict resolution and verified tests before any subsequent GitHub merging. Physical fan success remains unknown; this is a software-integration graph assessment, not a physical experiment.

**Next required work:** inspect any named conflicts, prepare a source-preserving reconciled staging branch, rerun the integrated test suite, review existing draft PRs, then merge in a controlled dependency order. AeroForge remains untouched.
