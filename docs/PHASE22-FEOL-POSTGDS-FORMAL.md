# Phase22: genuine experimental FEOL enabled + independent final gate Boolean proof

The fixed SKY130HD KLayout DRC macro used in Phase21 explicitly disabled
front-end-of-line (FEOL) checks. We now RE-RUN those checks on the actual
GDS using an exact, auditable one-line FEOL=false -> FEOL=true patch to
the SAME Git-source-locked original deck. BEOL/OFFGRID remain enabled.
We archive the full original DRC XML with its actual marker count, including
violations if there are any. That is NOT a foundry-qualified signoff deck.

Additionally we independently prove (Yosys SAT + real SkyWater Liberty
cell *functional* models) the **actual final 6_final.v gate-level netlist
accompanying the GDS** against the separately authored alu8_spec, and
require a deliberate XOR-to-OR bad reference to FAIL. This bridges the
mapping difference between earlier Phase17 netlist and Phase21 physical
flow. Final GDS geometric extraction is separately compared to the
final cell schematic in Phase21. The two checks are not interchangeable.

All experiments carry real hashed inputs, original logs, output artifact
checksums, source-locked original and patched decks, independently
checked original GDS/verilog from Phase21, exact TT Liberty and pinned
tool image identity.

This does NOT prove actual wafer process behavior or real silicon:
open experimental PDK, no foundry signoff, post-route timing corners
are only models, no package/prototype testing, no real-world measurement
or statistical yield. Report any DRC violations; do not quietly label
a completed analysis as a passed DRC. Hardware success percentage
remains null until calibrated independently against measured data.
