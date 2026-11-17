# Phase 30 — Full Invention Lab integration and honest research release

**Development integration target:** \`god88844-hub/invention-lab\`, source
branch \`feature/phase30-research-release-audit\`, stacked on Phase 29.
This is the final integration milestone of the current 30-phase **computing**
research programme, not certification of a universal physically accurate
simulator. AeroForge is a completely separate flight-simulation project,
outside this repository, workflow and scope.

## Delivered and testable

- Actual 2D/3D WebGL circuit workspace for logic/chip/quantum, reusable
  nested designs, and shared canonical netlists.
- Bounded digital/circuit and CPU/RV32IM simulation; ONNX model inference,
  quantized CPU reference comparisons, real Iris ML holdout, and quantum
  numerical-model benchmarks. These fixed software tests validate only the
  documented cases and units, not whole technologies or physical devices.
- Fixed reference 8-bit SKY130 ALU synthesis, separate Boolean specification
  and mapped/post-GDS SAT comparison, placement, detail routing, extracted
  RC/PVT timing and open experimental design-rule/LVS checks.
  **Not** foundry-qualified signoff or silicon timing.
- Actual published **two poly-resistor test tile** I–V datasets with 51 real
  readings each, source-locked and tested on a separate specimen. These are
  not the ALU, not an estimate of an entire fabrication process or any
  physical compute-design reliability.
- Phase24 prospective ALU sample template, Phase27 blinded study design,
  Phase28 evidence-based release **NO-GO** and Phase29 source-scoped evidence
  atlas. The real ALU hardware and its original instrument traces are absent.

## What the final Phase30 workflow performs

1. Executes all original Node tests and real headless Chromium/WebGL smoke.
2. Replays genuine external raw physical-device reference data and strictly
   re-computes Phase26–29 reports and the **unmeasured** hardware capture.
3. Audits the original live GitHub PR graph from actual server data:
   PR4–29 form an ordered 26-step dependency chain; all 26 must remain open,
   unmerged; PR7–29 must remain draft. PR3 is a **separate**, open, unmerged
   foundation, deliberately **not** silently added to the same branch stack.
   Merged PR1–2 precede this development chain.
4. Verifies all historical Git head commits in current ancestry; detects
   accidental modifications to Phase1–29 existing code and forbids new
   AeroForge scope. Rechecks **every Git-tracked file's original SHA256**,
   not just a selected fixture.
5. Builds a complete deterministic ZIP of the entire Git-tracked source,
   including tests, GitHub workflows, original benchmarks, research docs,
   browser app and license, with a byte-for-byte source manifest inside.
   Generates and verifies the ZIP twice using the same bytes, then independently
   reopens the source archive and re-queries live PR states.
6. Produces strict accepted and rejected release decisions, with exact
   available hardware evidence and source hashes in the CI artifact.

Run on a Linux environment with Python 3, Node 24, Git, Chromium,
available external published measurement sources and a GitHub token with
read permission to original pull requests:

\`\`\`bash
npm test
node scripts/browser-smoke.mjs
bash scripts/phase26-run.sh
node scripts/phase27-run.mjs && node scripts/phase27-strict.mjs
node scripts/phase28-run.mjs && node scripts/phase28-strict.mjs
node scripts/phase29-capture.mjs && node scripts/phase29-strict.mjs
GITHUB_TOKEN=... node scripts/phase30-capture.mjs
python3 scripts/phase30-package.py
python3 scripts/phase30-package.py --verify
GITHUB_TOKEN=... node scripts/phase30-strict.mjs
\`\`\`

## Release verdict and unresolved physical proof

**Software scope:** an independently regression-tested research candidate
once GitHub CI passes. Complete integration does not assert coverage of
every design, material, semiconductor technology or physical operating
envelope. Source-manifest checksums attest to consistent *bytes*, not to
trustworthy fabrication, safety or calibrated experiments.

**Physical scope:** \`physicalValidation=none\`, \`physicalVerdict=unknown\`,
\`realWorldBuildSuccessPercent=null\`. There are **zero** authentic ALU
physical observations. Proposed 49,152 ALU stimulus readings are **not**
collected. Six independent physical-qualification obligations remain
unverified; production/manufacturing release is **NO-GO for missing
evidence**, not "chip tested and failed". There is no scientifically
justified numeric real-world success percentage or confidence interval.

To qualify the actual hardware, the owner must obtain authentic fabricated
ALUs matching the final RTL/mask, original calibrated independent instrument
files, a reviewed uncertainty budget, independently selected unseen die/
wafer/lot/PVT groups, and qualified signoff coverage. Production-release
approval also requires human engineering reviews.

**GitHub branches:** preserve all existing PRs, open/draft statuses and
unmerged status as found. Phase30 is a new stacked DRAFT PR on Phase29.
No silent merge to main, no fabricated measured validation, no AeroForge
edits. The project can be considered **software milestone complete** if
and only if the final original CI suite passes. It is **not physically
complete** and should not be described as simulation evidence universally
equivalent to physical evidence.


## Post-integration source provenance (17 November 2026)

After merge PR #73 (`e1c14e52b02c336bb05ac756de9091e069f30fc1`) the original requirement that PRs #3–29 remain **open and unmerged** is historically obsolete. The frozen original stack policy and old scripts remain unchanged for archive/replay. On a descendant of the actual merge, the CI workflow switches to `scripts/integration-postmerge-phase30.mjs --capture` and `--strict`, verifying the merged ancestry, identical Phase 3 scientific sources, original archived evidence digests, every current Git-tracked source byte, and no manufactured real-world success percentage. Source ZIP packaging retains the same exact manifest format. The new mode never claims independent hardware qualification or a public product signoff.
