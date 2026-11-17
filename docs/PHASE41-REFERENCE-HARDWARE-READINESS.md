# Phase 41 — Exact source-backed component candidates and reference-assembly readiness

**Phase41 engineering-specification code and evidence gate implemented, real hardware identity and safety NOT yet complete.** The Phase31 battery–two wires–fan illustration did not correspond to a frozen manufactured device. To define a testable candidate, this phase pins source references for identifiable manufacturer components while **prohibiting an undocumented fan/propeller or made-up physical measurements**.

## Research selection (NOT owned, assembled, or approved)

- Motor candidate: Pololu item **1592**, 130-size brushed DC, manufacturer's recommended 1.5–3 V supply, approximate **20,000 RPM no load at 3 V, 0.35 A no-load, 4 A stall, 55 gf-cm stall torque, 2 mm shaft**. [Manufacturer specs](https://www.pololu.com/product/1592/specs) state **discontinued**, so procurement and replacement selection are open.
- Battery candidate: **two Energizer E91 AA alkaline cells in series**, nominal 1.5 V/cell = 3 V nominal. [Manufacturer datasheet](https://energizer.com/apac/australia/wp-content/uploads/sites/3/2024/05/e91_max_na_AA.pdf) gives fresh cell nominal internal resistance 150–300 milliohms and temperature range -18 to 55 °C. These are typical values and not calibrated individual battery measurements or a 4 A discharge qualification.
- Conductors: **two proposed 24-AWG copper conductors** but original manufactured wire identity, lengths, exact contact resistances and temperature class are still unknown. This is not a physically frozen harness.
- Fan: **no source-authenticated impeller part, geometry, safe rated mechanical speed, shaft attachment, containment or measured pressure–flow/torque curves available**. No valid physical operating RPM or assembly build-success probability is reported.

The module `js/evidence/phase41-hardware-readiness.js` binds exact catalog information and explicitly assesses physical readiness. The 4 A motor stall figure combined with 2 x 0.15–0.30 ohm hypothetical fresh battery series IR yields an *illustrative* 1.2–2.4 V ohmic drop if 4 A were flowing. This does **not** predict that two AA cells can in fact produce a 4 A motor stall current or that the observed motor terminal voltage would match the simple calculation, because the electrical solution is coupled and actual batteries depend on time, load and temperature.

## Mechanical and electrical safety blockers

No experiment with a spinning impeller should proceed until a real component's manufacturer-specified safe rotational speed, shaft coupling and retention, balancing, enclosed test arrangement, electrical-current limit, fuse/thermal safeguards, independent responsible review and calibrated instruments are documented and approved. A 20,000 RPM no-load motor datasheet is **not** a proof that any arbitrary impeller is safe at that speed.

An existing source-locked 24 V BLDC brake-bench model from Phase36 cannot substitute for a 3 V brushed motor with impeller. The candidate uses different topology and has **zero real assembly-specific measurements**.

## Executable planning gates

```bash
node --test tests/phase41-hardware-readiness.test.mjs
npm test
node scripts/browser-smoke.mjs
```

- Source catalog: `benchmarks/phase41/reference-hardware-candidate.json`.
- Validation module: `js/evidence/phase41-hardware-readiness.js`.
- No missing field is silently filled with an assumed observation. A future alternative motor requires another source passport and updated manufacturer data. A completed information form is never itself approval to spin the assembly.

**Status:** reference candidate research documented, actual BOM **not frozen**, no physical experiments conducted, physicalValidation=none, physicalVerdict=unknown, realWorldBuildSuccessPercent=null. Phase42 provides instruments/procedure schemas and raw-capture gates; it cannot manufacture source-matched observations.
