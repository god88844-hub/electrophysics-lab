# Phase 24 — physical ALU experiment acquisition, zero fabricated measurements

The **actual** Phase13 RTL, which was experimentally mapped, physically
routed, formally compared with the final GDS netlist and run through open
SKY130 layout-rule checks in Phases13–22, is the design target for Phase24.
The software emits **1,024 source-locked digital stimulus vectors** (784
directed edge pairs across all 4 operations plus 240 deterministic
unique pseudorandom vectors) with frozen SHA256. For each, a future
measured DUT should provide y[7:0], carry, zero and observed propagation
delay in seconds. The template leaves ALL measurement values explicitly
null; no artificial silicon readings are generated.

Reproducing the reference Boolean output is **not a hardware
measurement**. The preflight function may calculate a *candidate
comparison* when a user supplies records, but will never label a capture
physically validated, no matter how well it matches simulation. To
support a genuine experiment, independent laboratory provenance must
establish the **fabricated ALU identity**, mask record, wafer, lot,
die/package, original instrument acquisition bytes, calibration
certificates, uncertainty, timing methodology, load, supply, operating
conditions, operator and an independently authenticated review record.

Production/probability claims additionally need multiple independent
dies, lots, wafers and environmental corners with predeclared accuracy
and statistical criteria. A proposed intake policy specifies at least
6 independent specimens, 2 manufacturing lots, 2 wafers per lot,
2 repeat sessions per specimen and 3 distinct tested PVT corners.
This is a **candidate study design** and not a statistical guarantee
that such a small sample supports yield qualification. Blind holdout
groups must be isolated from any calibration data.

Run \`node scripts/phase24-run.mjs\` for the original capture template
and explicit missing-evidence summary; \`node scripts/phase24-strict.mjs\`
recomputes the original source and evidence from scratch.
A future independently acquired data file can be examined with
\`node scripts/phase24-assess.mjs /path/to/lab-capture.json\`, but the
result remains *unverified candidate data*, not authenticated silicon.

**Current exact status:** no actual ALU hardware, raw instrument files,
fabrication trace, or independent reviewed ALU silicon measurement is
present. Physical validation none, physical verdict unknown,
manufacturing success percentage null. There is no scientific
justification for substituting simulation or source-file checks
for genuine physical testing.
