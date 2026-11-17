# Phase 14 — Single-corner, pre-layout, constrained timing

This incremental stage expands the Phase 13 demonstrator, not the user-defined
Chip Lab's arbitrary design. The project remains strictly about electronics,
multi-valued computing, processors, accelerators and quantum systems; AeroForge
is separate.

**Purpose.** Build a real SKY130HD mapped 8-bit ALU from existing Phase 13
RTL and run a genuine OpenSTA max-path timing check against the same pinned
TT/25 C/1.80 V open standard-cell Liberty used by Phase 13.

## Fixed assumptions and acceptance gate

- Virtual clock **20 ns** models an input-to-output timing budget. The ALU
  has no internal physical clock pin. This is not flip-flop setup/hold closure.
- External maximum input/output delays each **1 ns**; minimum delays **0 ns**.
- Input slew **0.10 ns**, output load **0.01 pF** (subject to Liberty units).
- At least one real, complete constrained path and **worst slack >= 0 ns**
  is required. Negative slack FAILS this artificial design-budget gate.
- Tool errors, incomplete paths, unlinked cells, SHA changes or alternate
  constraints cannot become PASS by supplying a favorable JSON field.
- The timing report must be re-parsed by the strict verifier, and all source,
  netlist and tool-log bytes are hashed. Provenance includes exact
  pinned Liberty Git blob and commit.

**Evidence level: PRE-LAYOUT MODEL ONLY.** This does not include
routed parasitic extraction, process-corner variation, on-silicon measurements,
clock skew, DRC, LVS, yield statistics, or foundry fabrication qualification.
No success percentage is available; physical validation stays **none** and
`realWorldBuildSuccessPercent` stays `null`. Previous stages cannot
authorize a physical PASS.

## Execute

```sh
node --test tests/phase14-sta.test.mjs
bash scripts/phase14-run.sh
node scripts/phase14-strict.mjs
```

GitHub Actions installs external Yosys/OpenSTA (Ubuntu 22.04 package),
downloads the licensed, source-pinned SKY130 Liberty and uploads original
tool logs and outputs. The run is authoritative only if it actually finishes
successfully; source-code presence does not imply executed tool evidence.

Reference: [OpenSTA API](https://opensta.readthedocs.io/en/latest/StaApi/),
[OpenSTA commands](https://opensta.readthedocs.io/en/latest/Commands/).
Next gates: real multiple-corner STA and process variation, placed/routed
netlist with SPEF, independent DRC and LVS, fabrication and measured calibration.
