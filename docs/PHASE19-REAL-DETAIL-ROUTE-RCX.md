# Phase 19 — actual SKY130HD detail routing and extracted-RC timing

Phase 18 proved a placed OpenDB with global-route guides only. Phase 19
re-executes the public OpenROAD-flow-scripts stack on the same `alu8`
RTL at TT (25°C, 1.8V) under an illustrative 20ns I/O timing budget,
with a source-digest-pinned container and native SKY130HD PDK.

The real `route` target produces OpenDB before/after detailed wire routing
and a router-internal design-is-routed completion gate. The tool may omit\na local DRC marker file for no detected markers, so the signed evidence\nrequires the original detailed-router log, not a fabricated DRC report. The separate `openroad` process
loads the native detailed-route OpenDB, runs **OpenRCX extraction** with
the original SKY130HD resistance/capacitance rules, writes and then
reloads a genuine SPEF (the authentic OpenRCX writer uses a lowercase\n\`ieee 1481-1999\` header). Each of the ten ALU outputs is checked with an
individually constrained post-route maximum timing path. The independent
Node gate reopens original design inputs, databases, SPEF, logs, report,
container digest and all ten parsed output paths and hashes them.
Failures or missing evidence fail the model gate closed.

Scope: single combinational 8-bit ALU, one TT library/model and
illustrative timing constraints. It is NOT a setup/hold sequential
signoff, multi-corner routed timing signoff, independent full deck DRC,
LVS, antenna/manufacturability validation, power integrity signoff,
calibrated physical silicon, or manufacturing success percentage. SKY130
open PDK is experimental preview, with limited source quality assurance.
The router's local DRC checks must NOT be re-labeled as foundry
qualified signoff. Physical validation remains **none/unknown**.

CI: `bash scripts/phase19-run.sh`. Phase 18 and earlier evidence is
kept intact and required to pass on the same commit.
