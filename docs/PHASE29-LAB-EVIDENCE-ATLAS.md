# Phase29 — domain-separated references and the 3D invention evidence workspace

The Evidence Atlas connects the existing logic, chip, CPU, RV32IM, AI,
quantum, optics and cross-lab adapters into a common **inspectable UI**.
It shows documented, source-anchored historical benchmark cases for the
selected domain, the active diagram's actual simulation report and the
provenance of a selected 2D/3D component. The atlas is available alongside
the editable WebGL view, with a dedicated toolbar shortcut.

Every referenced proof is **a separate, fixed benchmark**. It is never
automatically attached to a user-created circuit, chip, accelerator or
quantum model; zero reference cases count as evidence for the active
design. Each reference is labeled `historical-repository-reference` with
a pinned pre-Phase29 source SHA and a link to the precise archived source.
Optics deliberately shows **no independent reference** rather than
fabricating an optics validation result.

The Evidence Passport export embeds an exact snapshot of the current
canonical 2D/3D netlist (a single Diagram), any current lab-generated
software report, selected model component provenance and historically
relevant *non-applicable* source references. Cross-lab mode has no
single diagram and cannot fabricate a composite current-design proof.
JSON source snapshots are user-editable and **not cryptographically
signed**, so exports are inspection/audit starting points, never foundry
certificates or authenticated physical evidence.

Original real-world hardware evidence remains explicitly absent for
the active diagram: `physicalValidation=none`,
`physicalVerdict=unknown` and `realWorldBuildSuccessPercent=null`.
The separate Phase28 ALU evidence gate stays BLOCKED/NO-GO until
independently measured fabricated hardware is provided. Historical CI
pass does not turn any newly made 3D design into an accredited,
manufacturable or physically proven digital twin.

The Phase29 browser smoke verifies navigation, component selection in the
3D scene, atlas contents, text-only DOM rendering (no untrusted HTML
interpolation), per-lab isolation, export and persistence of the
nonphysical status through simulation and 3D model edits.
