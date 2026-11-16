# Phase 5 — Reusable Computing Assemblies and Hierarchical Exploration

**Invention Lab only:** electronic circuits, chips, binary/ternary/multivalued
logic, processor/accelerator architectures, and quantum computing.
AeroForge remains an independent aerospace project.

## What is implemented

This phase introduces a **single-level hierarchical design workspace** above
the existing flat simulator graph. It is usable in the Logic, Chip and Quantum
labs on the 2D and WebGL 3D canvases.

The new **Assemblies** button opens a module shelf:

1. Select the components that form a subsystem; provide a name and choose
   **Create module**. Any existing wires internal to the selection are captured.
2. The original design gains a named assembly annotation. **Its blocks and
   wires do not change merely because you grouped them.**
3. Choose **Place copy** in the library. The module expands into real registered
   component blocks and fully typed internal connections at a new position.
   No composite black-box solver or duplicate netlist is introduced.
4. Choose **Explore in 3D** to isolate the assembly's components and internal
   wires in a 3D work view. **Exit assembly focus** restores the whole design.
   This is visual drill-in, not a different physical model.
5. **Ungroup** removes only the grouping annotation. Its real components and
   connections remain untouched.
6. **Export library** downloads JSON. **Import library** accepts validated JSON
   with versioned schema `invention-lab/module-library/1`. The browser also
   keeps the module shelf in localStorage under
   `ilab.moduleLibrary.v1` when storage is available.

Actual project files keep assembly metadata in
`diagram.meta.assemblies` and use the existing
`invention-lab/1` diagram format. Historical projects without assemblies
remain compatible.

## Interfaces and electrical meaning

Each module captures its constituent component types, parameters, relative
placement, internal wires, and real exposed ports. Ports that were unconnected
or touched wires crossing the selected group boundary become **interfaces** in
the module template.

Existing wires crossing into a selection are **not** duplicated when a module
is placed. Only the selected internal graph is copied. Connect exposed ports
to the surrounding design using the ordinary 2D or 3D port editor; their
compatibility is checked by the same `Diagram.connect()` rules.

For analog nets, bidirectional pins retain their original definitions. Quantum
wires/gates and ternary logic gates also keep their registered semantics,
rather than being translated into generic geometry.

## Important limitations

- **Only single-level groups and flat-netlist instantiation** are supported.
  Assemblies are not yet nested schematic subcircuits with encapsulated
  editable pin symbols, parameter overrides, recursive references, or an
  independent behavioral model.
- A saved module's existing components are a **snapshot**, not a linked
  parametric master. Changing the original does not mutate placed copies.
- A new placed instance can introduce unconnected inputs or other circuit
  defects. The existing engines must correctly report such problems; module
  creation does not confer a PASS or improve evidence status.
- Imported modules are checked for registered component types, lab identity,
  finite geometry and parameters, valid typed internal connections, duplicate
  endpoints, and interface signatures. Rejected templates do not partially
  change the live design.
- Assembly drill-in is a rendering filter, **not** an electrical isolation
  feature. Simulations continue to operate on the full canonical design.
- Visual layouts are schematic. They are not dimensioned IC layout, HDL
  synthesis, transistor extraction, fabrication DRC or process-qualified CAD.

## Evidence and real-world manufacturing

A module is a convenient reuse and inspection unit, not automatically a
physically validated chip component. Neither copying a module nor seeing a
green schematic check produces a real-world build-success percentage.

Probabilities require design-specific models and appropriately calibrated
fabrication/environmental distributions, with independent physical data and
uncertainty. The **Build Evidence** panel continues to distinguish a modeled
conditional scenario rate from a physically demonstrated build probability.

## Quality gates

Run `npm test` for the full Node matrix. Phase 5 adds
`tests/assemblies.test.mjs`: template validation, atomic cloning, cross-lab
isolation, real netlist wiring, interface mapping, original-design
immutability, malformed import rejection, and assembly metadata round trips.

The existing `tests/browser-3d.html` smoke test now exercises real browser
module capture, instantiation, 3D drill-in, undo/redo, assembly shelf controls
and absence of fabricated physical-validation percentages.

The strict external-validation suite remains responsible for the existing
24 Ngspice / Qiskit / NumPy benchmark cases.

## Next engineering milestones

- Nested parameterized modules and explicit hierarchical input/output symbols.
- Composable logic/circuit subsystem checks with hierarchical diagnostics.
- Standard-cell, device geometry, layout constraints and process libraries.
- Versioned computing architecture assemblies (CPU/GPU/TPU and memory).
- Scientific model calibration, provenance and manufacturability evidence
  without overstating physical equivalence.
