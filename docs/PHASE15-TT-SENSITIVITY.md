# Phase 15 — Real pre-layout TT Load/Slew Sensitivity

## Scope and evidence

This milestone is an **executed electrical-model sensitivity experiment**, not an
integrated-circuit fabrication or multi-process-corner validation. It uses the
Phase 13 8-bit synthesizable ALU and the Phase 14 20 ns educational virtual
clock, with **one real upstream-pinned SKY130HD TT, 25°C, 1.80 V Liberty**.

A **fresh external OpenSTA process per case** prevents parameters from leaking
between experiments. All nine cases use the *same* RTL and *same*
technology-mapped standard-cell netlist. The two controlled modeling inputs
are input transition (slew, ns) and output pin load (pF). Each experimental
case times ten unique ALU output paths.

| Test variable | Values |
|---|---|
| Input transition | 0.05, 0.10, 0.20 ns |
| Output load | 0.005, 0.010, 0.020 pF |
| Fixed timing budget | 20 ns virtual clock; 1 ns max input and output delay |
| Physical PVT library | Exactly **one**: SKY130HD TT/25°C/1.80 V |
| Results required | Nine complete transcripts; 90 distinct-per-case endpoint paths |
| Acceptance | For *every* case, every reported maximum path slack >= 0 ns |

## Execution and reproducibility

```bash
node --test tests/phase15-sensitivity.test.mjs
bash scripts/phase15-run.sh
node scripts/phase15-strict.mjs
```

The runner re-executes the actual Phase 14 verified Yosys mapping and TT timing
workflow. It then launches nine separate OpenSTA processes. An immutable
acceptance grid is checked against every original tool transcript. A second
verifier opens the original files, recomputes all 14 required
source/log SHA-256 hashes, reruns the path parser, checks exact
commit/provenance, and compares the independently reconstructed results with
the captured JSON. Both phases reject missing, reordered, fabricated or
numerically invalid evidence. All negative-test fixtures are **synthetic
software tests only**.

The original SKY130 TT Liberty is the Apache-2.0 source already pinned
in Phase 13 to upstream OpenROAD Flow Scripts commit
`7a57dddc8427845f75a14bd975328ee8717a1c8b` and Git blob
`5773657fe730d984ac06726d0addfdad80395b9b`.
OpenSTA loads timing arcs and capacitances from the pinned cell library.
No layout or extracted interconnect is present.

Reference: [OpenSTA command reference](https://opensta.readthedocs.io/en/latest/Commands/),
[OpenSTA timing model example](https://opensta.readthedocs.io/en/latest/Examples/),
[LibreLane corner documentation](https://librelane.readthedocs.io/en/latest/usage/timing_corners.html).

## What is **NOT** established

Even if all nine mathematical experiments meet their prescribed timing budget,
they test a 2D *assumed load/slew scenario grid at one semiconductor process
corner*, not nine physical chips and not nine PVT corners. They do NOT
establish FF/SS process variation, temperature/voltage envelope, setup/hold
signoff, physical routing, SPEF parasitic extraction, DRC, LVS, tapeout
readiness, genuine prototype measurements, or manufacturing yield.
The strict output preserves `physicalValidation: "none"`,
`physicalVerdict: "unknown"`, `realWorldBuildSuccessPercent: null`.
A scenario percentage must not be relabeled as fabrication success probability.

## Next work (not claimed complete)

Independent physically sourced FF/SS Liberty with strict immutable hashes;
multi-corner OpenSTA path checks (plus setup/hold on a sequential design);
OpenROAD floorplan, legalized placement, actual routing and parasitic extraction;
independent DRC/LVS; prototype measurement/calibration on holdout observations.
Separately reconcile unmerged Phase 3 measurement-provenance code before any
claim of physical-equivalence evidence. **AeroForge is a separate repository.**
