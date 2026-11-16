# Invention Lab — 3D Computing Playground Foundation

## Product boundary

**Invention Lab is an electronics and computing invention environment**, initially
covering analog electronic circuits, binary/ternary/multivalued logic, processors,
AI computing accelerators and quantum circuits. AeroForge is an unrelated
aerospace simulation project and must remain separate.

The goal is an interactive design laboratory, not a game engine: create a
computing-related invention, experiment, simulate with documented models,
inspect independent evidence, and eventually plan real-world manufacture.

## First 3D milestone

This branch adds a dependency-free **WebGL 3D workspace** to the existing
Logic, Chip and Quantum labs. It is a *functional first foundation*, not a
completed semiconductor manufacturing CAD system or physically dimensioned
3D device simulation.

- Use the **3D View / 2D Wiring** toggle in the editor toolbar.
- Drag in 3D to orbit, scroll to zoom, click to select, Shift+drag to relocate
  a selected component; arrow keys nudge selected components on the 2D design
  grid.
- Use the existing palette to add an element at the 3D view focus or drop it
  at a 3D ground-plane position.
- Click a 3D output socket and then a compatible input socket to wire
  components through the same typed Diagram.connect() rules. Analog bidirectional
  terminals can be either source or destination. The 2D wiring editor remains
  available for precise topological inspection.
- Read the same canonical `Diagram` document in both views. Placement and
  selection are not duplicated; `Save`, `Load`, `Undo`, `Redo`, the current
  simulation engines and validation reports continue to use that diagram.
- A single WebGL 1.0 implementation draws 3D component packages, a spatial
  grid, connection traces, labels and selection markers. No runtime CDN,
  Three.js bundle, extra server or GPU compute dependency is introduced.
- This rendering is a schematic 3D representation in arbitrary view units.
  It does not imply accurate chip dimensions, physical semiconductor geometry,
  fabrication rules or measured thermal properties. Geometry does not change
  the underlying simulation's scientific validity.

The existing CPU and AI accelerator panels remain specialized editors.
Future project milestones can add hierarchical die, RTL, ISA, memory,
interconnect and quantum device layers, with distinct appropriate solvers.

## Evidence-first percentages

The new **Build Evidence** tab reports the current design's local checks and
shows **Real-world build success: Not estimated**. An interactive
**educational resistor-divider tolerance** experiment lets users choose
source voltage, resistors, Gaussian one-sigma uncertainties and an output
voltage range; the resulting percentage is clearly labelled MODEL-ONLY and
is not tied to the active diagram. The platform currently has no
per-design authenticated physical validation or manufacturing-yield data
from which a defensible real-world build probability could be inferred.

`js/evidence/feasibility.js` implements an independently tested Monte Carlo
scenario-rate prototype. It requires:

1. A particular design ID and intended use.
2. Explicitly identified model parameters and their statistical assumptions.
3. Nonnegative parameter standard deviations and a covariance matrix or an
   explicit assertion of independence.
4. Acceptance constraints on named predicted output quantities.
5. A deterministic random seed and a specified sample count.
6. A prediction function supplied by a domain model.

It computes the **conditional fraction of sampled input scenarios satisfying
the specified constraints**, plus a 95% *Monte Carlo sampling* interval.
Estimates use the versioned `invention-lab/scenario-evidence/1` schema and
preserve frozen parameter distributions, covariance, constraints, assumptions,
random seed, sample count and error count so an input-scenario result can be
reproduced. Caller-provided model functions are not themselves verified or
certified by this format. It
intentionally returns `realWorldBuildSuccessPercent: null` and
`physicalValidation: 'none'` regardless of the computed scenario rate.
Failed model evaluations produce **inconclusive**, not fake 0% success.

The statistical interval measures finite Monte Carlo sampling error; it
does **not** account for model-form discrepancy, calibration uncertainty not
represented in the sampled parameters, missing environmental effects, or
manufacturing yield. A 100% modeled pass rate is not a 100% chance of
successfully manufacturing a chip.

### Long-term success-percentage requirements

A future physical-build forecast must specify *what counts as successful*,
the fabrication process, the device architecture, input/environmental
conditions, reliability horizon, calibrated input distributions, dependencies,
manufacturing variation, measurement uncertainty, known model discrepancy,
data quality, and a tested validity envelope.

Compare predictions to independent, traceable physical measurements, test
out-of-envelope requests, and report uncertainty intervals and calibration
coverage. Only then may a specific build-success probability be considered;
the validation status must remain scoped to the actual design and use case.
Universal **simulation = physical validation** is not a claim the software
can establish.

## Reproducing the software tests

Run `npm test` for unit regressions, and `node scripts/browser-smoke.mjs`
on Linux with Chromium/Google Chrome installed to exercise the actual WebGL
viewer, component selection, typed 3D wiring, lab switching and evidence tab.
The dedicated `Browser 3D smoke` GitHub Actions workflow runs this browser
test automatically on pull requests.



```sh
npm test
```

GitHub Actions runs the Node 20/22/24 matrix. The strict Ngspice/Qiskit
external workflow continues independently and retains its 24-case acceptance
manifest.

The `tests/scene-evidence.test.mjs` suite covers canonical 3D layout,
netlist preservation, invalid graph references, scene model integration,
reproducible conditional percentages, covariance validation, no undocumented
independence assumptions and failure-to-inconclusive conversion.

## Follow-on stages (not implemented yet)

- Refined port visuals, snapping, routed wire paths and full design-rule checks.
- Hierarchical chip/CPU/GPU/TPU design assemblies, interconnect and modules.
- Device/standard-cell geometry with manufacturing technology libraries.
- Domain-specific uncertainty propagation and circuit/logic/quantum risk
  metrics bound to independent physical reference datasets.
- Physical validation, fabrication feasibility and calibrated yields for
  explicitly supported process nodes and operating envelopes.
- Reproducible design-to-prototype evidence packs.

**No external physical dataset is invented by this branch.**
