# Physical-wire parameter layer: real units, explicit assumptions

This feature is the first **dimensional engineering-parameter** tool for the 3D workbench, not a CAD coordinate system or a physically validated digital twin.

## Use
Open Logic or Chip Lab, connect components, enable 3D View, and click **Wire physics** above the 3D bench. Select an actual wire in the current design, enter its **real-world conductor length in millimeters**, **metal diameter in millimeters**, **material** (nominal copper or aluminum), **temperature in Celsius** and **explicit assumed current in amperes**, then save. The design JSON stores a versioned per-wire record under `meta.physicalLayout.wires[wireId]`. Save/load, undo/redo and source-bound experiment snapshots inherit this metadata.

## Formula and provenance
A basic uniform round conductor model computes `R = rho20 * (1 + alpha*(T - 20°C)) * L / (pi*d²/4)` in SI units. Inputs are measured or entered by the user; the default input values displayed in the editor are **examples, never automatically inferred dimensions**. Nominal reference constants in code (copper `rho20=1.68e-8 Ω·m, alpha=0.00393/K`; aluminum `rho20=2.82e-8 Ω·m, alpha=0.00403/K`) are approximate engineering assumptions, **not manufacturer measurements or calibrated quantities**. `Vdrop = I*R` and `P = I²*R` only use explicitly entered assumed current. All calculations are bounded, finite and rejected when geometric or material inputs are invalid.

## Limits
The original schematic remains the authoritative electrical solver and **does not** automatically account for the new estimated physical wire resistance. The user-entered wire length is **not** the visual 3D harness length. Wire insulation, stranding, contacts, frequency-dependent skin effect, joint tolerances, Joule-heat-to-temperature feedback, return paths and physical laboratory validation are not modeled. A computed resistance is not an independently measured resistance. Real-world build success remains UNKNOWN.

## Next step
Add a source-linked bill of materials and actual dimensional CAD assembly frame, plus a solver coupling gate that can admit these estimated resistances **only** after documented connectivity mapping, numerical consistency tests, and checked assumptions. Then add calibration from authentic measurements and independent held-out validation under specific operating conditions.
