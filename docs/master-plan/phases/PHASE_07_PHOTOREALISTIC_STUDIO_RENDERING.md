# PHASE 07 — Photorealistic Studio Rendering

Start after WP-6.5. WP-7.1 and WP-7.2 can land independently. WP-7.3,
WP-7.4 and WP-7.5 depend on both and can run in parallel. App paths are
relative to `apps/electrophysics-3d/`. Paths starting with `tests/` are
repository-relative. Each delivery also owns its ledger row.
Bay-specific edits in the shared inspector use distinct bay branches.
SoC and Silicon packages add their imports and control mounts in disjoint
regions.

Every WP needs the [Law 7](../01_BUILDER_RULES.md#law-7--end-to-end-desktop-visibility)
evidence: an interactive Playwright run with live screenshots and telemetry,
a native WebView2 smoke of the same user path, and error and resource checks.
Keep evidence outside Git. Use deterministic seeds and fixed cameras for
repeatable screenshot framing. Use geometry, input and telemetry assertions
to identify the rendered result.

## WP-7.1 — Studio renderer and viewport layout

**Objective**

Give every bay a lit studio enclosure, fix the clipped status bar, and
scope electron flow to the active scene.

**Exact files**

`src/engine/renderer.ts`, `src/engine/studioEnvironment.ts`,
`src/engine/electronFlow.ts`, `src/world.ts`, `src/App.tsx`,
`e2e/wp71-studio.spec.ts`.

**Interface contracts**

Keep the renderer factory and quality governor interface. The renderer owns
the PMREM environment, studio dome and cyclorama resources and disposes them
on teardown. Workspace transitions clear labels and effect state. Electron
particles receive only live, admitted current samples from their owning
workspace. Layout reserves the status row independently of canvas and dock.

- [ ] Generate a procedural studio light dome and PMREM reflections. Apply
  AgX filmic tone mapping, a seamless infinite cyclorama and soft contact
  shadows with governor-controlled cost.
- [ ] Fix the bottom status bar in dock-open and dock-closed layouts, at
  supported window sizes and Windows display scaling.
- [ ] Clear and gate `ElectronFlow` on workspace entry and exit. Exercise
  Silicon CAD and SoC activity before switching to Quantum Lab and Library.

**Failure modes**

Fail the gate on visible particle leakage, stale flow buffers, clipped controls,
reflection-target growth, shader errors or a bypassed quality governor.

**Hard acceptance gates**

Playwright captures the lit viewport and asserts an in-window status bar
with the dock open and closed at 1280×720 and 1920×1080. Seeded active
current produces observable particles in Silicon CAD and none after
switching to Quantum Lab or Reference Library. Capture both states and
record the live frame ID, active workspace and visible particle count.
Report ≥55 median FPS over a 60 s warmed trace on the Law 4 Intel Core Ultra 7
155U iGPU and peak app RAM ≤2 GB. Software-rendered CI checks the trend
and governor transitions separately.

## WP-7.2 — Procedural materials and beveled CAD library

**Objective**

Provide shared PBR textures and dimensioned geometry, visible on working
Silicon CAD probes and fixture parts.

**Exact files**

`src/bays/pbrTextures.ts`, `src/bays/cadGeometry.ts`,
`src/bays/silicon/fixtureMaterials.ts`, `src/bays/bay2Foundry.ts`
(probe fixture materials and geometry only),
`e2e/wp72-cad-materials.spec.ts`, `tests/wp72-cad-materials.test.mjs`.

**Interface contracts**

Texture factories accept a seed and bounded resolution. Return reusable maps
with designated color spaces, ownership and disposal. Geometry factories take
explicit source lengths and a world conversion and preserve the outer bounds.
Use the sealed cad-specs for dimensioned parts. Runtime-generated appearance
parameters carry no engineering measurement claims.

- [ ] Generate brushed aluminum, OFHC gold, electroplated copper, silicon
  wafer iridescence, and FR-4 weave with copper traces and crisp silkscreen.
  Produce Canvas/WebGL albedo, normal and roughness maps as applicable.
- [ ] Add chamfered boxes, beveled extruded profiles and machined fasteners.
  Integrate these factories into the real probe and fixture path. Expose the
  material samples through inspection of the selected part.
- [ ] Bound texture sizes, share identical assets and dispose resources.

**Failure modes**

Refuse invalid dimensions, unsupported texture sizes, non-finite material
parameters, and bevels that would exceed the part's envelope.

**Hard acceptance gates**

Unit oracles assert same-seed map hashes, correct texture channels, sealed
source dimensions and bounded geometry and cache occupancy. Playwright
selects a live fixture, inspects material and dimensions, orbits to expose
the bevel and captures the resulting rig. Verify the named material treatments and FR-4 traces and silkscreen,
zero external asset fetches and stable resource counts across repeated workspace switches.

## WP-7.3 — SoC cutaway and package geometry

**Objective**

Open SoC Architect with the die fully visible and distinguish each real
package structure without obscuring live workload and drill-down signals.

**Exact files**

`src/bays/bay3Soc.ts`, `src/bays/soc/packageGeometry.ts`,
`src/ui/soc/PackageViewControl.tsx`, `src/ui/InspectorPanels.tsx`
(SoC branch), `e2e/wp45-live-exec.spec.ts`,
`e2e/wp73-soc-cutaway.spec.ts`.

**Interface contracts**

Map current tile IDs, pick targets and power overlays to the remodeled die.
Use the sealed 02 CAD spec and 05/07 reference data for scale, population and
labels. Closed, cutaway and exploded are discrete states. At transition
completion the lid snaps to its configured endpoint within the declared
scene-unit tolerance. Readiness uses the explicit completed state.

- [ ] Default to a visibly lifted, cutaway brushed-aluminum IHS. Add closed,
  cutaway and exploded controls and explicit transition completion.
- [ ] Render the interposer, beveled CPU cluster, 96-EU GPU compute blocks,
  64-tile TPU array and HBM/LPDDR5 stacks per reference model. Give the ENIG
  FR-4 substrate BGA balls and SMD 0402 capacitors.
- [ ] Keep raycast tile selection, representative-cell handoff and packet
  and heat overlays aligned. Tie emissive activity to live solver inputs.
- [ ] Replace the asymptotic lid-lift assertion (observed 2.2997 versus
  `>2.3`) with mode, exact endpoint-with-tolerance and visible-die checks.

**Failure modes**

Reject a mode that occludes the expected die, stale pick targets, invalid
package dimensions and a transition that never completes.

**Hard acceptance gates**

Playwright captures all three view modes. Assert default die visibility,
lid endpoint after repeated switches, 96 GPU EUs, 64 pickable TPU tiles,
reference-scaled package structures, and a selected tile with matching
live power/packet telemetry. Rerun WP-4.5 and WP-4.7 flow and drill-down.

## WP-7.4 — Silicon CAD and Q4 inspection scale

**Objective**

Keep the wafer bench usable at its intended scale and move the polygon
stack into a selectable, scale-correct inspection mode.

**Exact files**

`src/bays/bay2Foundry.ts` (view mode and wafer/Q4/probe motion only),
`src/bays/silicon/sky130CellViewer.ts`, `src/bays/silicon/waferView.ts`,
`src/ui/silicon/WaferModeControl.tsx`, `src/ui/InspectorPanels.tsx`
(Silicon branch), `e2e/wp34-sky130-geometry.spec.mjs`,
`e2e/wp74-silicon-scale.spec.ts`.

**Interface contracts**

Wafer Bench is default. Q4 Cell Stack is a separate visible root with a
declared µm transform and camera framing. WP-7.2 owns fixture meshes and
materials. Preserve sealed polygons, layer IDs, edit state, pick identity
and original Q4 provenance in both modes.

- [ ] Add accessible Wafer Bench and Q4 Cell Stack mode controls.
- [ ] Render the 12 SKY130A layers from sealed layout data with beveled
  metal edges and glossy translucent dielectrics at the declared scale.
- [ ] Render and animate spring-loaded probes as a function of actual
  placement and contact. Restore camera, selection and wafer edit state
  when switching back.

**Failure modes**

Fail on stray Q4 towers in wafer mode, unresolved units, distorted
polygon footprints, a broken probe hit target or a lost CAD edit.

**Hard acceptance gates**

Playwright captures both modes, checks sealed layer count, per-layer ID and
bounds, excludes Q4 picks in the wafer view, and measures correct probe
selection and contact telemetry after switching twice. Re-run WP-3.4 polygon
oracles and Silicon CAD placement/undo and routing checks.

## WP-7.5 — Quantum optics and Reference Library

**Objective**

Give the cryostat and optical rigs specific materials and hardware details.
Make the Reference Library a working engineering specification browser.

**Exact files**

`src/bays/bay1Quantum.ts`, `src/bays/quantum/cryostatRig.ts`,
`src/bays/quantum/mziRig.ts`, `src/bays/quantum/tweezerRig.ts`,
`src/bays/quantum/quantumMaterials.ts`, `src/bays/bay5Library.ts`,
`src/ui/LibraryOverlay.tsx`, `src/App.tsx` (Reference Library mount only),
`e2e/wp75-quantum-reference.spec.ts`.

**Interface contracts**

Maintain rig attachment points and solver-driven signal paths from the
sealed 03 CAD specs. Read the offline references through existing
SHA-256 verification. Library selection preserves source ID, units and
citation. Optical materials are visual models and retain simulation labels.

- [ ] Add machined flanges, brass/gold thermal straps, braided coax collars
  and studio-reflective finishes to the cryostat.
- [ ] Add physical glass and optical shaders for the MZI and UHV neutral-atom
  chambers while keeping ports, beam geometry and atom readouts legible.
- [ ] Replace the bare library stand-in with a mounted browser for material,
  PDK and physics specifications. Support search, selection and source
  citation, with verified values and units.

**Failure modes**

Flag malformed or tampered vault data and withhold affected values. Fail
on stale rig telemetry, opaque glazing that hides interaction or lost
modal state on workspace change.

**Hard acceptance gates**

Playwright switches among the three quantum modalities, interacts with
each rig, verifies corresponding live readouts and captures all three.
It also opens the Reference Library, checks `SHA-256 8/8 ✓`, drills into
two citations with exact values and units, checks keyboard interaction
and captures the spec browser. Re-run WP-5.4 dimension oracles.
