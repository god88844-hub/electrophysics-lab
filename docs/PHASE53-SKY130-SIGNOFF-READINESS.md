# Phase 53 — Open SKY130 EDA evidence versus qualified foundry signoff

The existing Invention Lab eight-bit SKY130 ALU has experimentally exercised actual open-source synthesis, technology mapping, placement, routing, KLayout geometric extraction/DRC/LVS and Yosys formal Boolean verification over original artifacts under the pinned OpenROAD flow. Phase21 initially used an experimental KLayout DRC deck with FEOL disabled; Phase22 reenabled FEOL and archived actual results including violations. These are meaningful **software/EDA experiments**, not independent silicon or comprehensive foundry-approved chip signoff.

## Source limitations

[SkyWater's open SKY130 PDK status page](https://skywater-pdk.readthedocs.io/en/main/status.html) explicitly classifies the public PDK as an **experimental preview not intended for production settings**. An open DRC check, LVS match and source-referenced formal Boolean equivalence cannot independently establish every foundry rule, extraction corner, power integrity, antenna/ESD/package protection, wafer manufacturability, real process variation, silicon function or yield. Previous Phase24/27/28 physical ALU capture paths remain uncollected/blocked.

## Executable signoff gap report

`benchmarks/phase53/signoff-boundary.json` freezes the original ALU RTL Git blob identity, source stimulus SHA256, pinned OpenROAD Docker image digest, source-backed DRC/LVS deck blobs, open-flow files and ten explicit missing **independent foundry-acceptance** classes. Phase53 verifies original source script content and hashes, and leaves all foundry-qualified signoff attestations null/false. It does not rerun the expensive Phase21–22 GDS job inside Phase53's fast workflow; **the inherited Phase21/22 GitHub workflows still independently run those EDA checks in the full CI stack**.

Run `node --test tests/phase53-signoff.test.mjs`, `node scripts/phase53-run.mjs`, `node scripts/phase53-strict.mjs`, `npm test` and `node scripts/browser-smoke.mjs`.

The production/manufacturing decision is **NO-GO until independently qualified foundry, mask/RTL identity and real die/lab evidence are obtained**. No actual ALU silicon or physical success probability is available. This audit does not itself authorize tapeout or certify SKY130 signoff.
