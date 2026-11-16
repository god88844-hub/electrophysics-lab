# Phase 6 — Nested Parameterized Computing Modules

Invention Lab covers **electronics, chips, binary/ternary/multivalued
logic, CPUs/GPUs/TPUs and other computing systems, and quantum computing**.
It does not contain AeroForge or aerospace flight simulation.

## What this phase delivers

Phase 5 introduced one-level reusable groups whose real components and
typed wires are copied into the same flat `Diagram`. Phase 6 adds a
**nested, numeric-parameterized module compiler** and interactive shelf.

In the Logic, Chip or Quantum lab:

1. Capture at least two reusable assemblies with the **Assemblies** shelf.
2. Check the two or more assembly boxes in **Compose modules inside a module**.
   Enter a name, then select **Compose selected assemblies**.
3. The compiler captures the selected groups as child-module references,
   records the actual wires crossing their boundaries, and identifies their
   typed external sockets.
4. It exposes numeric component controls as parameters. Nested modules can
   bind a public numeric parameter into a child module's public parameter.
5. Use **Configure numeric parameters** under the composite template, enter
   new values and choose **Place copy**. All changes resolve to actual leaf
   component parameters, never fake metadata.
6. The placed nested module is flattened into ordinary, registered
   components and ordinary typed wires, which the existing logic, circuit
   or quantum simulator already executes.
7. Choose **Explore in 3D** on an instance and expand **Explore nested
   children** to drill into a specific child/grandchild. This filters the
   visual scene only; the physical/numerical solver still sees the complete
   original netlist.

An existing v1 `invention-lab/module-library/1` JSON file remains importable;
new libraries use `invention-lab/module-library/2`. Leaf templates
`invention-lab/computing-module/1` are supported without conversion.
Composite templates use `invention-lab/computing-composite/1`.

The user's canonical project format remains `invention-lab/1`; placed
composites record named interface bindings, parametric overrides and
actual real-block child memberships under `diagram.meta.assemblies`.

## Scientific and integrity guarantees

- No new physics solver, guessed behavioral primitive or duplicate simulation
  graph is introduced. Reuse compiles to the engines already benchmarked
  with Ngspice/Qiskit/NumPy.
- Internal and cross-module wires are validated against registered
  direction/type signatures. An invalid or duplicate connection cannot be
  silently accepted.
- Exposed module sockets refer to actual registered component ports.
  Persisted mappings are independently checked against their real signatures
  before composition.
- Numeric parameters are finite and obey the registered component/schema
  bounds and declared public bounds. Invalid or ambiguous bindings are
  rejected, and original templates/instances are not mutated.
- Duplicate module IDs, missing references, cycles, cross-lab dependencies,
  path-separator collisions, duplicate endpoints and alias conflicts fail
  closed.
- The module compiler limits nesting depth, template counts, expansion size
  and the number of exposed ports/parameters.
- Placement validates and builds in a scratch `Diagram`; the original design
  changes **only after successful full expansion and connection checks**.
- Grouping or visual focus does not modify the solver or pass/fail criteria.
  Module library persistence is versioned and backwards compatible.

## Explicit limitations

- This is a *hierarchical schematic/logic assembly compiler*, not physical
  semiconductor die layout, HDL synthesis, timing closure, DRC/LVS,
  photolithography simulation or full processor microarchitecture synthesis.
- Nested module **source references are library dependencies**, not cryptographic
  signed production IP. The library is validated on import and placement,
  and deleting a still-referenced child is refused.
- Numeric parameters propagate through declared bindings only. No arbitrary
  expression evaluator, scripting execution, unit conversion, symbolic
  parameter constraints or optimizer is present.
- **The system does not estimate a physically validated fabrication-success
  percentage.** A model-only pass rate is not a build-success probability.
  Manufacturing forecasts require process-specific measurement distributions,
  physical evidence, uncertainty and calibrated validation envelopes.
- The 3D appearance is schematic and is **not** physically dimensioned silicon.
- A composite's child-group drill-in is a visualization filter; any external
  wires remain part of the full simulation even when not shown in the focus.

## Verification

`tests/composites.test.mjs` covers nested references, numeric propagation,
type-safe interfaces, unique named wires, unknown dependencies, cycle
detection, schema versioning, legacy migration, atomic rollback and real
flat-netlist expansion.

The headless Chromium workflow executes the UI flow: create two reusable
assemblies, compose a nested module, set numeric parameters, place the
composite, inspect child memberships and explore a child in the real
WebGL 3D canvas.

GitHub Actions also runs the existing Node 20/22/24 test matrix and the
strict **24-case Ngspice/Qiskit/NumPy external benchmark manifest**. These
are software and cross-solver evidence, **not physical validation**.

## Later development

More sophisticated nested-interface editing, module revision/version pins,
signed reusable IP records, architecture-level CPU/GPU/TPU modeling, hardware
description languages, schematic-to-layout extraction, manufacturing PDK
integration, and physically grounded success estimates all require separate
implementation and validation.
