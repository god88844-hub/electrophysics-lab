# PHASE 03 — Multi-Radix Logic & Custom ICs (Layer 2)

## Objective
Event-driven Binary/Ternary/Q4/Custom-Radix simulation in `ep-logic`, coupled
to Layer 1 transistor characterization; the Custom 3D IC Packager converting
any working circuit into a reusable hierarchical IC with a verified
macro-model; polygon-accurate 3D layer viewer for the 4 verified Q4 primitives.

## Non-Goals
No SoC execution (Phase 4), no quantum (Phase 5), no Magic/Netgen fabrication claims (optional native CI admission is explicitly Level-1-gated).

## Exact Files
- Created: `crates/ep-logic/**`, `apps/electrophysics-3d/src/state/customIc.ts`,
  `src/ui/cad/CustomIcComposer.tsx`, `src/ui/cad/LayerPolygonViewer.tsx`.
- Modified: `src/bays/bay2Foundry.ts` (polygon-accurate cell bodies from
  `data/cad-specs/01`), `src/ui/InspectorPanels.tsx` (IC composer panel).
- Contracts: `custom-ic.schema.json`; `03_PHYSICS_MATH_FUNDAMENTALS.md` §2;
  `data/cad-specs/01_sky130_primitives_geometry.json`.

## Interface Contracts
- Cell characterization: Layer 1 solve produces per-cell arcs (input slew →
  output delay) and switching energy; macro-model tolerance ±5 % timing /
  ±10 % energy vs internal solve (verified, not assumed).
- IC compose: `custom-ic.schema.json` validation MUST pass before an IC is
  instantiable; sub-IC DAG must be acyclic.
- Radix map: `L_k = k·VDD/(R−1)`; custom R ∈ {2..8} with declared
  voltage partitions from `03_multiradix_logic_baselines.json` + `08`.

## Checklist

### WP-3.1 — Event-driven multi-radix simulator
- [ ] Event queue with (time, seq) ordering; radix-parameterized gates (min/max/mod sum, threshold detectors)
- [ ] Contention + oscillation detection; unknown/X propagation per radix
- [ ] Parity: identical truth tables + event order vs Phase 0 `js/labs/logic` engine

### WP-3.2 — Layer 1 → cell characterization feed
- [ ] For each cell: sweep input slews, extract arc delays (input→output) from kernel MNA
- [ ] Switching energy per toggle from kernel current integration
- [ ] Characterization table stored in the IC macro-model (schema field), ±5 %/±10 % verified

### WP-3.3 — Custom IC Packager (composer)
- [ ] Select region → validate acyclic sub-IC DAG → auto-extract macro-model
- [ ] Schema validation (custom-ic.schema.json) + VERIFIED/STALE status
- [ ] Instantiation: IC as a black-box block with pin-level radix domains
- [ ] UI: composer panel with extraction progress + verification badge

### WP-3.4 — Polygon-accurate Q4 primitive viewer
- [ ] Generate per-cell polygons from `data/cad-specs/01` (pin coordinates, layer polygons)
- [ ] Layer visibility/opacity + peel on the polygon viewer (reuses Layer panel)
- [ ] Playwright: geometry assertions (instance counts = cad-specs instance_count)

### WP-3.5 — Hierarchical ALU composer
- [ ] Binary/Ternary/Q4 ALU templates built from IC instances (XOR/adder hierarchy)
- [ ] Composed ALU truth-table parity vs direct netlist solve
- [ ] Radix-economy readout `E(R) = R/ln(R)` per composed ALU (03 JSON)

### WP-3.6 — Optional native CI DRC/LVS/PEX admission (Level-1 honest)
- [ ] Magic/Netgen/PEX adapters behind an explicit availability check
- [ ] Without tools: Level-1 `INSUFFICIENT_MODEL_DATA` admission (honest, displayed)
- [ ] With tools + statistical PDK: evidence flows through the Phase 0 gates only

## Failure Modes & Edge Cases
- Oscillation in user circuits → event-loop detection (phase-count limit) →
  honest oscillation warning, simulation stops (never "passes").
- Macro-model out of tolerance → IC marked STALE, not instantiable.
- Mixed-radix connections → radix domain mismatch refused at pin connect.
- Sub-IC cycles → compose refused at schema validation.
- Statistical PDK absent → admission Level-1 (never invents σ).

## Acceptance Gate
- `cargo test -p ep-logic` green (parity + radix map + characterization).
- Composer: extraction tolerance tests green; schema validation green.
- Playwright: polygon viewer geometry + IC compose/instantiate flow green.
- `npm test` green; Phase 30/39 clean-tree PASS.
