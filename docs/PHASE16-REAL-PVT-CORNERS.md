# Phase 16 — Genuine three-corner SKY130HD pre-layout timing

## Goal and verified data provenance

This experiment goes beyond Phase 15's **one TT model with nine load/slew
settings** and deliberately uses **three real, independently stored standard-cell
timing models** for the same technology-mapped 8-bit ALU.

Source library: [FOSSi Foundation's SkyWater standard-cell library](https://github.com/fossi-foundation/skywater-pdk-libs-sky130_fd_sc_hd),
Apache-2.0, frozen exact Git commit
`9cb2d7cb8ed4619094263614039a61b6b2d22a88`.

The upstream full-library byte sizes, SHA-256 and Git blob SHA-1 are
prespecified in `benchmarks/phase16/acceptance.json`, corroborated against
[the source-pinned RustEDA PDK manifest](https://github.com/lab-emi/RustSTA/blob/main/verification/pdks.toml).

| Real Liberty corner | Nominal temperature | Supply | SHA-256 | Size (bytes) |
| --- | ---: | ---: | --- | ---: |
| TT/25 °C | 25 °C | 1.80 V | `8e78e14442062dba34d414fca6490b2f6b96038d4510d1438ca44fee31487135` | 12,841,637 |
| SS/100 °C | 100 °C | 1.60 V | `9b24f0db3967ac67b4cae1f74bb480fd47922d18d0ed577e3c121739b412c361` | 12,845,260 |
| FF/−40 °C | −40 °C | 1.95 V | `fb61d91c55a7f85b1989e8149d040b13ba5e7f5478f5bf0c3c16c5da30720139` | 12,918,504 |

This experiment downloads those exact files, verifies full contents *before*
using them, and saves each real source Liberty + original external OpenSTA
stdout/stderr.

**Known source-quality diagnostic, preserved rather than silently ignored:** the
upstream merged FOSSi Liberty files emit exactly one OpenSTA 2.0.17 warning
per source: `default_operating_condition <corner> not found` (TT and FF
header line 31, SS line 32). This warns that a header default operating
condition is not resolvable by the installed parser. The numeric timing
tables still execute, but the warning means the results **must not be
mistaken for corner-qualified foundry signoff**. The strict validator records
and requires the exact original warning for each pinned source; *any other*
warning or error causes immediate rejection. These OpenSTA model results are
reported separately from physical validation. It uses one mapped netlist built by Yosys in Phase 14 from
the same 8-bit ALU and the original **20 ns virtual-clock combinational
timing budget**; the assumed input/output delays, slew and output load
remain as in the Phase 14 frozen SDC. Each library is loaded into a fresh
OpenSTA process, so no corner state is reused. All **10 ALU output endpoints**
must have a complete constrained maximum path and nonnegative slack in
each corner. Missing or changed bytes, warnings, unlinked cells, paths,
source commit, or output claims **FAIL**.

To execute:

```bash
node --test tests/phase16-multicorner.test.mjs
bash scripts/phase16-run.sh
node scripts/phase16-strict.mjs
```

## Scientific interpretation

The computed results are evidence for **different actual Liberty
cell-characterization process, voltage and temperature conditions**, not
merely retagged copies of a TT simulation. They represent a *bounded*
three-point PVT **model** screen.

These results **do not** cover arbitrary chip designs from the Chip Lab.
A combinational ALU with an invented 20 ns virtual-clock budget is
**not** a clocked sequential design with setup/hold closure, full
PVT/OCV/aging or mismatch, true wire RC extraction, placed/routed GDS,
manufacturing defects, DRC/LVS, independent silicon measurement or
experimental model calibration. The PDK is documented as an experimental
preview, not an approved production signoff kit. No claimed physical
success probability is supportable. The report remains explicitly:

```json
{
  "physicalValidation": "none",
  "physicalVerdict": "unknown",
  "realWorldBuildSuccessPercent": null
}
```

The real [OpenROAD sky130hd platform](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts/blob/master/flow/platforms/sky130hd/config.mk)
uses a typical-corner Liberty by default; this experiment additionally
evaluates independent slow/fast Liberty views. See
[SkyWater's explicit alpha-status warning](https://github.com/google/skywater-pdk).

### Next independent evidence gates

A registered/synchronous test design with setup/hold and explicit
multi-mode constraints; full OpenROAD placement and routing with
post-route SPEF parasitic extraction; independent DRC and LVS on actual
layout/GDS; eventual calibrated prototype measurements and holdout
comparison. The separate unmerged Phase 3 measurement work must be
reviewed/reconciled before claiming physical success. AeroForge is
separate and remains untouched. No PRs are merged automatically.
