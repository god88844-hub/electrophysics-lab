# Phase 39 — Reproducible, independently audited source-only research baseline

## Why Phase 39 precedes production integration

The Phase38 preflight [verified in CI](https://github.com/god88844-hub/invention-lab/actions/runs/44065896887) successfully merged PRs #3–37 in a **temporary local worktree** without conflicts, and passed the combined Node regression suite. However, the historical Phase30 policy (immutable `benchmarks/phase30/acceptance.json` and `js/release/phase30-audit.js`) still requires all original PRs #3–29 to be OPEN/UNMERGED. Directly merging them to main would violate Phase30's acceptance policy and fail future checks, even if the software functions are correct.

**Until a separately reviewed integration-state policy upgrade is verified, this phase does not merge any PR.** It provides an independent reproducible source baseline that does not depend on treating a current PR's open status as laboratory physics evidence.

## Delivered

1. `scripts/phase39-source-baseline.py` independently reads every regular Git-tracked file in the current exact commit; detects git-worktree modifications, symlinks, unsafe paths and missing or duplicate entries; independently records Git blob identity, original byte counts and SHA256 for every file.
2. A complete deterministic ZIP includes every verified original Git-tracked file, a versioned complete `SOURCE-MANIFEST.json`, and `PHYSICAL-SCOPE.json`. ZIP dates, entry order, permissions and compression are normalized. Regeneration must be **byte-for-byte identical**.
3. `scripts/phase39-strict-audit.py` separately opens the archived ZIP and compares *every* original file with its immutable Git-index blob using `git cat-file blob`. It validates the embedded manifest, SHA256/size counts, reserved metadata and the target-physical-qualification blockers. It does **not** trust the builder's in-memory data model.
4. A dedicated [Phase39 GitHub Actions workflow](../.github/workflows/phase39-reproducible-source-baseline.yml) tests tampering, runs `npm test`, real browser/WebGL smoke, deterministic second build and strict byte-level original-source audit, then publishes the archive and structured evidence artifact.
5. Research-only status remains explicit: 0 source-matched authenticated ALU dies, 0 real physical measurements of the illustrated 3 V brushed battery–motor–fan, no independent motor-population prediction interval, no manufacturing release, no real-world build-success percentage.

## Repeatable commands

```bash
python3 scripts/phase39-source-baseline.py --self-test
npm test
node scripts/browser-smoke.mjs
python3 scripts/phase39-source-baseline.py --build
python3 scripts/phase39-source-baseline.py --verify
python3 scripts/phase39-strict-audit.py
```

The output is `benchmarks/evidence/phase39/invention-lab-phase39-source.zip`, a metadata sidecar `phase39-release.json` and independent `phase39-strict-summary.json`.

Do not confuse archived repository code with physically validated models. ZIP hashes establish reproducibility of source, not measurement validity. All scientific and hardware limitations from previous phases remain in force.

## Before merging to main

The required next integration gate is to version the historical live-PR gate as **historical snapshot audit** versus **live post-integration policy**, with explicit, independently verifiable provenance for each PR head and merge commit. Make that policy change and its adverse-case tests pass in CI before moving any legacy PR from OPEN to MERGED. After policy migration, use the Phase38 worktree-tested dependency order, re-run every test, and verify current main/branch status after each merge; do not force push or bypass review. This work belongs to the subsequent integration milestone.

Phase39 is a staged, source-only research release baseline and not the final production or physical-qualification release. AeroForge remains outside this repository.
