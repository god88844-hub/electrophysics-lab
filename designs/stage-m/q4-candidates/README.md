# Stage M — experimental Q4 transistor schematics

These four files are **original, unqualified candidate designs**. Their SPICE subcircuits are self-contained; do not concatenate them because names such as `q4_thresh_det` and `q4_mux4` repeat.

| Cell | Candidate topology | Requested function |
|---|---|---|
| `q4_thresh_det.spice` | 3 skewed CMOS comparators with CMOS buffer stages | Nominal trip-point targets 0.30, 0.90, 1.50 V |
| `q4_inv.spice` | 1-of-4 thermometer decoder plus four complementary LVT transmission gates | 0↔3; 1↔2 |
| `q4_mux4.spice` | 1-of-4 thermometer decoder plus four complementary LVT transmission gates | Analog quaternary 4:1 selection |
| `q4_half_adder.spice` | 10 hierarchical quaternary muxes | Sum=(A+B)%4, Carry=floor((A+B)/4) |

## Technical limitations and mandatory gates

1. Dimensions of the skewed transistor comparators are **uncharacterized**. None of the three requested thresholds, hysteresis, four noise margins, power, propagation delay, or temperature/mismatch survival have been measured. Transistor models, floating controls, leakage, rail overlap, junction/body effects, and operating-point convergence still need real ngspice analysis.
2. A transmission gate **passes** a selected supply voltage; without external validation this architecture must **not** be described as a proven rail-restoring cell. It does not establish full CMOS gain or independent noise recovery. Low-Vt PMOS `sky130_fd_pr__pfet_01v8_lvt` is presently **not admitted** by the pinned Phase 73 model whitelist; authenticate and register its original model files and SOA before any native run. Do not bypass the whitelist.
3. The 1.8 V LDO rail profile remains **0 / 0.6 / 1.2 / 1.8 V nominal, ±5%**, maximum 1.89 V. The existing **1.95 V** original model-range SOA screen and all deck-derived four-terminal checks must remain in force. Static profile envelopes do not prove transient voltage safety.
4. The pinned SKY130 model repo commit `f62031a1be9aefe902d6d54cddd6f59b57627436` does **not** by itself contain the independently verified open_pdks transformed `tt_mm` statistical library. Any processed mismatch library requires independently pinned source and generated model-byte provenance, verified switches, seed replay and statistical calibration; no fabricated corner labels or invented statistical variation.
5. A source-commit-pinned native Magic/Netgen CI build and device-placement Tcl generator have now been added. These do not supply **finished routed geometry**. No independently DRC-clean `.mag`, LVS-matched `.gds`, verified extracted RC netlist, or 1,000 native postlayout Monte Carlo trials has been demonstrated. Do not manufacture placeholder artifacts or assert DRC/LVS clean.
6. No simulated-build-success probability or Wilson interval is emitted from these candidates. Level-1 is **INSUFFICIENT_MODEL_DATA / UNKNOWN**, Level-2 physical authorization **UNQUALIFIED_NO_GO**. PR #94 and dependent stacked drafts must not merge until the required tests and independent acceptance criteria pass.

## How to inspect

Review each candidate as a separate text SPICE library; use only the original PDK-verified models, native EDA executables, approved toolchain configuration and the fail-closed Stage M runners. These source files alone are not valid native PDK verification evidence.

## Native CI physical verification

The `stage-m-native-eda.yml` workflow compiles pinned Magic, Netgen, and open_pdks tool sources in GitHub Actions and attempts real Magic device geometry generation followed by DRC and Netgen LVS. Its generated layout is only a **device-placement candidate**: Magic’s `netlist_to_layout` is not an automatic router. Native success is rejected unless there are 0 measured Magic DRC errors and all required four-cell Netgen LVS reports actually match. The workflow also requires the processed `tt_mm` section to explicitly set `mc_mm_switch=1`, but this alone is not validated manufacturing statistics. The workflow has an explicit fail-closed final step until the full calibrated post-layout 1,000-trial primitive and 100-trial ALU evidence genuinely exists. Its red status must not be waived for merging.

## 2026-11-19 native CI queue and toolchain evidence

The user-requested prebuilt Volare tag matching original processed open_pdks commit `0c1f82326278a0871f0a1fc4bdacf94c88e78e4d` was not found in the checked public Volare/Ciel release endpoints. Do **not** quietly activate a different PDK version: this would break exact-model provenance. The workflow now installs Ubuntu 24.04's actual `magic`, `netgen-lvs`, and `ngspice` packages; it retains a source-commit-locked `open_pdks` build, cached by source IDs, and records binary SHA-256 hashes/package versions. The cache has **not** been confirmed populated on a runner.

The native Stage M workflow has branch-aware GitHub Actions concurrency with `cancel-in-progress: true`. A new **push** run requests cancellation of superseded runs `44373173980` and `44375448415`, but that request cannot execute while the cancellation step remains queued. Concurrency applies to new matching runs, not retroactively to all old jobs. Do not claim those runs are cancelled until GitHub reports `cancelled`.

The pinned `open_pdks` `runtime/netlist_to_layout.py` is now the entry point for real Magic transistor placement. It **does not route electrical nets**. The Magic script checks actual cell existence, DRC, extracted netlists and GDS; Netgen must show real LVS matches, and missing reports fail. None of this establishes completed routing, post-layout corners, or Level-1 qualification until CI delivers independently verifiable results.

No real `ngspice` Monte Carlo trial logs, noise-margin measurement, 4/8-digit radix ALU circuits, Wilson interval or DRC/LVS-clean four-cell geometry have been demonstrated. Do not report a numerical yield or merge M through Q. Level-1 remains `INSUFFICIENT_MODEL_DATA`, physical fabrication authorization remains `UNQUALIFIED_NO_GO`.
