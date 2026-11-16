# Phase 13 — Return to Hardware Physics: Real SKY130 Synthesis and the Evidence Ladder

## Original Invention Lab objective — unchanged

**Invention Lab** is a 3D-capable engineering and computing-hardware
invention environment for arbitrary digital logic, electronic circuits,
CPU/RTL, GPU/TPU and accelerator systems, transistor/chip designs and
quantum models. It must support making and testing *new* hardware
architectures, not merely executing AI neural networks or copying common
binary designs. **AeroForge is separate** and is not affected by this work.

The **primary requirement** remains evidence that supports **real-world
physical validation**: each simulation claim must be accompanied by its
meaning, environment, model assumptions, calibrated uncertainty, and
appropriate independent evidence. A component or necessary evidence stage
that fails must fail the relevant claim or project gate. Unknown,
unsupported, absent, or uncalibrated physical evidence stays **UNKNOWN**,
never automatically PASS. Physical equivalence cannot legitimately be
inferred from numerical agreement alone.

Secondary priorities—beginner-friendly but engineer-grade 3D visual
creation, polylogic and computing design, modular/cross-lab workflows,
testability and provenance—remain part of the platform roadmap.

**The previous phases did not manufacture any hardware.** Phases 2,
7–12 improved software and independent mathematical/ISA/ONNX references.
Their green CI workflows are meaningful for their individual
test scopes, **not for semiconductor yield or physical equivalence**.
The original Phase 3 experiment/measurement/calibration PR #3 exists
separately, remains unmerged, and is not falsely described as integrated.

## Actual technical work in Phase 13

This bounded, executable first hardware proof uses a synthesizable
**8-bit ALU**, with operations ADD, XOR, AND and SHIFT_LEFT_INSERT,
a separately written reference and **262,144** exhaustive 8-bit
input/operation vectors (`256×256×4`).

- `benchmarks/phase13/rtl/alu8.v`: actual synthesizable Verilog;
  this is not a complete CPU, processor tapeout or GPU chip.
- `benchmarks/phase13/rtl/alu8_spec.v`: independently formulated
  logical reference used by Icarus simulation and Yosys formal
  combinational equivalence.
- `benchmarks/phase13/rtl/alu8_bad_spec.v`: intentionally changes
  XOR into OR; the formal gate **must reject** this mutation, proving
  that a failed design does not receive an equivalence PASS.
- `scripts/phase13-run.sh`: execute genuine Icarus HDL simulation,
  actual Yosys `equiv_make / equiv_simple / equiv_status -assert`
  and **actual Yosys ABC standard-cell technology mapping**.

A SkyWater **SKY130 high-density standard-cell Liberty** file is
fetched into the CI workspace from the permissively available
OpenROAD Flow Scripts source:

- Real 130 nm standard-cell family `sky130_fd_sc_hd`.
- Frozen **typical** cell-corner library
  `sky130_fd_sc_hd__tt_025C_1v80.lib`
  (25 °C, 1.80 V, **TT** process corner only).
- Upstream OpenROAD-flow-scripts repository commit
  `7a57dddc8427845f75a14bd975328ee8717a1c8b`.
- Upstream **Git blob** `5773657fe730d984ac06726d0addfdad80395b9b`;
  the exact expected file size is **12,800,135 bytes**.
- License: **Apache-2.0**; obtained publicly, not via proprietary
  foundry NDA.
- Source: https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts
- Originating open PDK: https://github.com/google/skywater-pdk
- Yosys technology mapping:
  https://yosyshq.readthedocs.io/projects/yosys/en/latest/using_yosys/synthesis/techmap_synth.html
- Reference layout/PDK flow:
  https://openroad-flow-scripts.readthedocs.io/en/latest/

The original SkyWater repository explicitly describes the open PDK as
an **experimental preview** and not intended for production signoff in
its stated status. A commercially manufactured node does not make this
small open-source demonstration an independently qualified production
process. Technology-mapping a netlist against a real Liberty library
is **not** a successful place-and-route or DRC/LVS result.

The CI run records actual tool versions, each input/source and log
SHA-256, library source Git blob + SHA-256, and the mapped cell
instance names/count + actual mapped-netlist SHA-256. The
`phase13-real-sky130-hdl-and-stdcell-mapping-evidence` artifact
contains logs, actual mapped Verilog, the true downloaded Liberty
file and the strict evidence summary. If the Liberty source, tool,
reference, proof or standard-cell netlist is missing, CI **fails**.
This is one small actual externally executed hardware workflow rather
than a proposed future workflow advertised as already passing.

## Required evidence ladder — no stage skipping

| Stage | This phase | Meaning |
| --- | --- | --- |
| Fully enumerated RTL logic | Tested by CI | Output equivalence for 8-bit/example inputs |
| Yosys independently written equivalence proof | Tested by CI | Boolean functional equivalence to the reference |
| Real SKY130 Liberty/ABC technology mapping | Tested by CI | Actual standard-cell netlist **at one TT corner** |
| Actual constrained STA/setup/hold analysis | **UNKNOWN / not run** | Requires clocks, paths, timing constraints, additional corners |
| PVT/process-corner analysis | **UNKNOWN / not run** | Requires multiple appropriate corner libraries/models |
| Placement, routing and parasitic extraction | **UNKNOWN / not run** | Requires LEF, placement, routing, and RC extraction |
| Design-rule check (DRC) | **UNKNOWN / not run** | Requires real layout/GDS and qualified foundry rules |
| Layout-versus-schematic (LVS) | **UNKNOWN / not run** | Requires independent layout and schematic/netlist comparison |
| Packaged test chip/device measurements | **UNKNOWN / not run** | Requires actual silicon and instrument/calibration records |
| Empirical calibration/independent holdout | **UNKNOWN / not run** | Requires real measured data with known provenance, uncertainty, and holdout |

**No physically validated build-success percentage is available.**
`realWorldBuildSuccessPercent: null` and
`physicalVerdict: unknown` are mandatory. Completion of the first
three computational stages does not advance or bypass any later
physical stage. The fail-closed evidence evaluator
`js/evidence/physical-readiness.js` rejects a false physical
PASS, altered source identity, a skipped test or removed stage.
Negative unit tests intentionally falsify these fields to
confirm rejection.

## Next concrete gates toward simulation/physical equivalence

1. **Constrained timing:** independently run true OpenSTA/OpenROAD
   timing checks with pins/clocks/setup/hold budgets, explicitly
   distinguish real Liberty timing versus extracted post-layout timing.
2. **Process-corner and variability evidence:** pin at least
   appropriate FF/SS/TT corners, temperature and voltage conditions,
   perform independent timing/PVT sweeps and document assumptions.
3. **Complete open-PDK physical design:** legal tech LEF, standard-cell
   LEF/GDS, floorplanning, routing, extraction, actual Magic/KLayout
   DRC, netlist/layout LVS and a reproducible OpenROAD/OpenLane design.
4. **Real prototype data:** acquire legally usable test-chip
   silicon/device records or undertake fabrication and calibrated
   testing. With provenance, environmental conditions, instrument
   uncertainty, measurement replicates and independent split.
5. **Measured model calibration and uncertainty:** only *after* actual
   measurements compare predictions to independently withheld physical
   observations. Integrate carefully with still-unmerged Phase 3
   measurement/calibration PR rather than inventing measurements.
6. **Engineering go/no-go:** a failed required part or evidence
   gate blocks manufacturing-readiness. Probabilistic build-success
   estimates may only be produced under explicit validated,
   project-specific physical models with uncertainty; otherwise
   return UNKNOWN.

The existing 3D workspace, nested assembly model, numerical,
architecture, Qiskit/Ngspice and ONNX reference work remain useful
parts of the full product, but not substitutes for any of these
physical stages.

**PR policy:** Phase 13 is a draft stacked on unmerged PR #12;
PR #3 is separate; no auto-merge.
