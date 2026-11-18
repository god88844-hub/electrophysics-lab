# Explicit physical terminals, 3D conductor paths, and scaled part proxies

This increment builds on merged PRs #82–#83. It brings the existing interactive 3D lab closer to a recognisable electronics bench while preserving engineering evidence boundaries. **No static circuit pixels, schematic port locations, or guessed conductor lengths are converted into real dimensions.**

## Interactive workflow

1. In **Logic** or **Chip Lab**, create or open a canonical schematic, connect its ports, then enable **3D View**.
2. In **Engineering CAD**, save actual component bounding-envelope positions and dimensions in millimetres (the previous CAD schema remains intact). Select **Show true-scale mm envelopes** to render component-specific generic hardware proxies instead of identical block boxes.
3. In **Wire physics**, save the conductor material, metal diameter and real material length for the relevant canonical wire IDs.
4. Open **Terminals & 3D harnesses**. Select a component and one of its **actual canonical typed port IDs**. Enter the physical pin's **local X/Y/Z in mm**, constrained to a surface of that component's bounding box. X/Z are relative to the center; Y is relative to its bottom. The editor's example numbers are unsaved and are **not measured**.
5. Select the canonical wire. Enter intermediate GLOBAL millimetre coordinates as a JSON array, for example `[{"xMm":40,"yMm":15,"zMm":30}]`, or `[]` for a direct straight segment between its explicitly saved terminals. Save the harness. The geometry layer independently calculates the 3D polyline length, checks that the entered conductor length is not shorter than the depicted path, and identifies routes crossing unrelated component bounding boxes.
6. Re-enable the true-scale 3D view. It renders body-specific models for sources, axial resistors and diodes, cylindrical capacitors, transistor packages, instruments, screw terminals, fans and circuit-board modules. The conductor geometry is rendered using its entered copper or aluminium material and metal diameter. The world conversion is exactly **20 mm per world unit** in all three axes.

All dimensional metadata is attached to the original diagram JSON and participates in the existing save/load mechanism. The canonical 2D circuit remains the authoritative editable source and the 3D hardware proxy is a non-authoritative physical visualization.

## Geometry and solver boundary

`meta.physicalRouting` has format `invention-lab/physical-terminal-harness/1` and stores:
- `terminals[JSON.stringify([blockId,portId])]` as **local** millimetre coordinates; only valid typed ports on the current canonical component are accepted.
- `routes[wireId].waypointsMm` as user-entered, GLOBAL mm intermediate points, with canonical source/target terminals resolved during inspection.

The validator checks finite bounds, physical envelope surfaces, stale terminal IDs, stale wire IDs, malformed stored state, polyline length, route/metal-length contradictions, and intersections with unrelated component bodies. It also gives a distinct geometric **partial/complete/violations** result, and retains the counts of unmapped wires. Values from schematic pixels are not admitted. If a previously saved terminal is later moved inside a part or its route becomes impossible, the geometric report refuses the invalid representation.

The existing **opt-in coupled DC electrical–thermal solver** uses this stronger route-length check where explicit pins and routes exist. Where they do not exist, it retains the old conservative component-body-gap lower bound; it never claims an unentered route was validated. The solver still uses **entered conductor length** to calculate nominal resistance and Joule heating, not the rendered polyline length (which may exclude slack). The actual emitted conductor tube thickness is the entered **metal diameter**; user-entered insulation thickness is not available.

## What is realistic and what is not

- Component-specific shaded 3D bodies, pins, and physically scaled metal wires are **procedural proxies** inside the entered component envelopes. They are not vendor CAD/STEP, verified footprint dimensions, actual connector/package photos, body-to-body electrical isolation tests, thermal FEM, or manufacturing-ready assemblies.
- The pad markers are generic visualization glyphs and are **not measured pad geometry**. No automated real route placement, bend radius, insulation, wire strain relief, twisted strands, minimum spacing, voltage clearance, high-frequency effects, or connector terminal ratings are established.
- `routeLengthFromPolyline` identifies geometric path length between entered terminals, not measured manufactured cable length. A nonnegative amount of **unplaced slack** may remain when entered metal length exceeds the route length.
- Browser CI and independent Ngspice comparisons are software tests. **Independent physical validation, calibrated tolerances, build-success probability and manufacturing readiness remain unknown.**

## Tests and next gates

The `physical-harness-3d` Linux/Windows workflow checks real-port terminal validation, malformed/stale IDs, strict geometric bounds, route collision and shorter-than-length rejection, JSON preservation, current solver nonmutation, 3D proxy vertex finiteness, and metal diameter visibility. The existing browser smoke verifies that a real user interaction enters a 40 mm copper path and draws it using WebGL.

Next: source-pinned manufacturer physical footprints and certified material profiles, segmented wires with multi-node temperature and contact heating, insulation/clearance and bend-radius constraints, and measured hardware validation with independent holdouts. These require genuine verified reference data to claim physical accuracy.
