# Phase 21 — real GDS-vs-CDL LVS and partial open SKY130HD DRC

Rebuild original small combinational ALU from source RTL with source-pinned
OpenROAD-flow-scripts Docker image and stream actual 130 nm placed/routed
cell layout into \`6_final.gds\`. Run actual KLayout GDS DRC and layout-
extracted-vs-CDL netlist LVS using the KLayout rule deck bundled in
ORFS commit 2272e787c, with exact Git blob SHA of rule files verified
before accepting the evidence archive.

**Coverage limitation**: The default upstream
\`sky130hd.lydrc\` explicitly sets \`FEOL = false\`,
\`BEOL = true\`, \`OFFGRID = true\`. A zero-marker result only indicates
these enabled, open-deck rules for this GDS. It is NOT a comprehensive
foundry-qualified DRC or signoff, and passing LVS is limited to the
experimental extraction and source-matched cell-CDL comparison.
Neither implies wafer fabrication, package testing, reproducible yield or
empirical simulation/physical equivalence.

Strict replay rejects altered GDS/CDL/DEF/Verilog, changed Docker digest,
mismatched decks, incomplete KLayout reports, nonzero checked rule
markers, LVS mismatches and fabricated physical success percentages.
