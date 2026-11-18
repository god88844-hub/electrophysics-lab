# Stage M — calibrated ALU and actual PDK acceptance gates

The PDK manifest now pins **28 original upstream source files**, including 20 additional SKY130 TT/SS/FF and mismatch model cards for the standard, LVT, HVT and high-voltage MOS families. These file-level pins do **not** establish complete transitive model closure, characterized foundry statistical distributions or calibrated wafer populations. Phase 73 contains SKY130 1.8 V threshold-model identities; those nominal 1.8 V devices are not valid for a 0–3.3 V Q4 voltage sweep with ±10% ripple. External SPICE models must not be silently substituted, and nominal 3.3 V GF180 cells also require validated overvoltage/ripple stress envelopes.

`node scripts/stage-m-signoff-readiness.mjs` produces a 12-case deterministic binary/ternary/Q4 and 4/8-digit readiness matrix across SKY130 and GF180MCU. It records *missing* actual transistor-level netlists, foundry variation distributions, temperature validity, full pinned dependent library files, physical extraction and independent silicon holdout. The result remains `INSUFFICIENT_MODEL_DATA`, with build-success `UNKNOWN` and physical `UNQUALIFIED_NO_GO`. Running the script is a software validation of the no-fabrication boundary, **not** qualification.

## To reach accepted Level-1

1. Obtain valid, license-compliant, immutable complete PDK library trees including transitive model dependencies and manufacturer-verified device voltage/temperature ratings.
2. Construct genuinely transistor-level 4/8-digit binary/ternary/Q4 ALU netlists with reproducible reference vectors. Do not drive nominal 1.8 V transistors at 3.3 V.
3. Obtain independently characterized *statistical process distributions*, not arbitrary sigma values. Run all 1,000+ *real* ngspice trials against those exact decks and sources, across the specified temperature and supply corners, with per-trial replay, logs, and complete pass/fail accounting.
4. Route the actual custom cells; inspect source-bound OpenROAD/KLayout/Magic/OpenRCX DRC, LVS, extracted parasitics, and post-layout intermediate-state noise margins. Mathematical floorplan rectangles are insufficient.
5. Obtain independent calibration and holdout reviews with pinned trusted signoff roots. Only then may the existing `makeLevel1Passport` issue a genuinely calibrated Wilson-interval virtual yield. Level-2 physical signoff requires *different, authenticated physical silicon measurements*.

**Current status:** these inputs are absent; a requested `<60%` to `>92%` calibrated demonstration cannot be proven honestly. Do not merge or tag a full 96-phase qualified release based on synthetic tests.

## Implemented source-bound model and SOA preflight

The working Stage M branch now implements `phase73-soa.js` with four-terminal MOS node-bias checks, plus `phase74-noise-margins.js` gates so a foundry-model/ngspice deck cannot execute without a matching device-instance SOA inventory. The exact Q4 rail profiles are:

| Process/device family | Logic rails (V) | At +10% supply ripple |
| --- | --- | --- |
| SKY130 1.8 V core NMOS/PMOS, LVT/HVT | 0, 0.6, 1.2, 1.8 | **SOA_OXIDE_OVERSTRESS**: 1.98 V exceeds 1.95 V documented model limit |
| GF180MCU 3.3 V thin oxide | 0, 1.1, 2.2, 3.3 | 3.63 V reaches published 3.63 V gate-oxide operating ceiling; further full HCI, terminal and temperature checks remain required |
| SKY130 5 V gate / 10.5 V drain extended MOS | 0, 1.1, 2.2, 3.3 | 3.63 V is below published 5.5 V gate and 11 V drain model-range limits, but independent PDK/DRC admission is still missing |

These are **operating-model screens**, not proven semiconductor breakdown voltages or automatically valid 4/8-digit transistor ALUs. The script `stage-m-alu-harness.js` maps 4/8-digit binary, ternary, Q4 candidate workloads to exact PDK transistor model identities, and will assemble a *provided original* transistor-level digit-cell subcircuit into a SPICE batch testbench. It **does not invent** a correct Q4 adder, quantizer, multiplexer, or cell layout.

The original source-locked SKY130 `models/sky130.lib.spice` at commit `f62031a1be9aefe902d6d54cddd6f59b57627436` exposes named `.lib tt`, `.lib ss`, and `.lib ff` sections, **not** a named `.lib tt_mm` section. It references device-level `mismatch.corner.spice` files, but inclusion alone does not establish a statistically characterized wafer Monte Carlo distribution or justify renaming `tt` to `tt_mm`. `inspectDeclaredModelCorners` rejects absent requested corners. A compatible *separately pinned* open_pdks transformation and verified statistical switches would be required to claim `tt_mm`.

`stage-m-foundry-spice.js` inspects complete transitive model includes (and verifies all available pinned original Git blobs), rejects untrusted missing paths, then admits native ngspice only after a compatible source-bound SOA report. It does not issue model calibration by itself. The current pinned 28 files do not constitute a complete, independent foundry statistical calibration.

`phase77-magic-netgen.js` can execute original-MAG Magic DRC/extraction and Netgen LVS when a legitimate PDK tech, a real cell-specific `.mag`, transistor schematic SPICE and Netgen setup file have been supplied. No valid Q4 transistor-cell original `.mag` or GDS/ruledeck exists in this Stage M evidence set. **No physical DRC, LVS, extracted post-layout noise sweep, or 1000-trial calibrated ngspice manufacturing yield has been demonstrated.** Therefore the entire Stage M release gate remains NO-GO.

## Source-derived SOA and Monte Carlo deck preflight

The foundry SPICE and Phase 74 DC/transient runners now inspect **actual** top-level transistor instance terminals and voltage sources before they can invoke ngspice. Literal ground-referenced DC and bounded PWL sources yield conservative min/max voltage envelopes. Source-derived \`Vgs\`, \`Vds\`, \`Vgb\`, \`Vgd\`, and \`Vbs\` are compared with published **model operating limits**, not independently verified oxide breakdown ratings. Overstress emits \`SOA_OXIDE_OVERSTRESS\`. An internal node, nested unexpanded subcircuit, unknown source, non-ground reference, or uncontrolled voltage generator yields \`SOA_INSUFFICIENT_NODE_BOUNDS\` and prevents native simulation. Caller-provided favorable voltage samples cannot override a contradictory source in the deck.

The Phase 75 Monte Carlo driver performs that preflight on each transistor-containing trial deck, including synthetic regression runs, and refuses to launch ngspice when the SOA preconditions are absent. Passing this static screen **does not** certify dynamic MOS stress or long-term device reliability. A valid transistor-level run additionally needs full foundry model closure and independently validated corner statistics, custom-cell netlist equivalence, DRC/LVS, extraction and independent qualification.

Run \`node --test tests/phase73-deck-node-soa.test.mjs tests/phase74-soa-spice-guard.test.mjs tests/phase75-monte-carlo.test.mjs\` to exercise these fail-closed paths.

## Pinned model-tree and process corner binding

A complete original checkout may be admitted for model-source integrity when \`inspectPinnedPdkClosure\` verifies every transitively referenced model byte against the exact source commit \`SKY130 f62031a1...\` or \`GF180MCU 9f992d5a...\`. The native foundry runner also requires the submitted \`.lib\` path to resolve to that **same** PDK checkout's expected model library, with exactly one allowed corner selector and no caller-provided extra \`.include\` paths. A directory name, Git remote URL, matching \`HEAD\` alone, or a copied file with an unverified checksum is not enough.

SKY130 process sections use the exact \`tt\`, \`tt_mm\`, \`ss\`, \`ff\` names; GF180MCU uses \`typical\`, \`ss\`, \`ff\` here. The framework never substitutes \`tt\` for \`typical\` or silently replaces a missing mismatch model with nominal values. Full source integrity still does **not** supply a characterized wafer-level distribution, complete rated voltage envelopes, real Q4 transistor cells, or an independently verified Level-1 calibration passport.
