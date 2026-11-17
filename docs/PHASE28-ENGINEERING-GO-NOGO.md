# Phase28 engineering evidence-based go/no-go — blocked until actual silicon

This gate distinguishes three independent results:
**(a) computation/EDA readiness**, **(b) real prototype qualification**, and
**(c) release/manufacturing success probability**. They are not equivalent.

The original source-locked SKY130 alu8 combinational logic, postroute
timing, GDS DRC subset / FEOL-expanded open deck and logical equivalence
have undergone independently replayed tool tests (prior development phases).
These are important **model-only results**, not proof of fabrication,
robust physical implementation, wafer yield or physical equivalence.

Phase23–26's public original measured data belong to **two separate resistor
test-tile devices** (102 total I–V readings), not the ALU. Phase24 produced a
frozen **unmeasured** ALU physical-capture template. Phase27 produced a
prospective study with eight future die slots, 48 sessions and 49,152
future vectors; **zero actual hardware readings** exist in this project.
Phase28 replays and source-links that evidence and blocks false extrapolation.

The strict six-gate release policy requires: a manufactured ALU with
independently verified mask/source and die identity; original traceable raw
instrument acquisitions; reviewed uncertainty calibration budget; acceptance
declared before interpreting samples; independent wafer/lot/die/PVT holdout
evidence; and a qualified foundry signoff or independently accepted
coverage review. None are established by a hash string, a self-declared
certificate, CI pass, a simulation prediction, a SKY130 timing model or
perfectly fake measurements.

**Current decisions:**
- computational status: *MODEL_EVIDENCE_ONLY*
- prototype hardware qualification: *BLOCKED_NEEDS_REAL_HARDWARE*
- production/manufacturing release: *NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE*
- true manufacturing success probability: **not estimable / null**
- confidence interval, chip physical accuracy, reliability FIT: **not estimable / null**
- fabricated verified ALUs: **zero**

Do not interpret a release NO-GO as a measured chip failing electrically.
It means engineering proof is **missing**. This phase doesn't forbid
separately reviewed research fabrication experiments, only unsupported
product-release and statistically ungrounded success claims.

Run \`node scripts/phase28-run.mjs\` and \`node scripts/phase28-strict.mjs\`
after running the original Phase26 and Phase27 source replays. For future
untrusted candidate records, \`node scripts/phase28-assess.mjs candidate.json\`
provides a non-approving review. Independent authenticity verification
must be added by a qualified laboratory/instrument/foundry evidence path
before a numerical manufacturing probability is scientifically justified.

Next: Phase29 integration of validated model-only workflows and research
domain support, while keeping unmeasured physical claims blocked.
