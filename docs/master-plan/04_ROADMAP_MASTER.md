# Roadmap Master — Phase 0A → 08 Dependency DAG

Arrows mean the downstream phase consumes the accepted upstream outputs.
The [Acceptance Ledger](05_ACCEPTANCE_LEDGER.md) records WP-level dependencies.

```text
Phase 0A (CI + Plan + Vault lock)
   → Phase 01 (Desktop CAD shell + Rust kernel core)
   → Phase 02 (Silicon physics and forensics)
   → Phase 03 (Multi-radix logic and custom ICs)
   → Phase 04 (Chips, SoC and live software)
   → Phase 05 (Quantum and hybrid studio)
   → Phase 06 (Academy, Co-Inventor and Windows release)
   → Phase 07 (Photorealistic studio rendering)
   → Phase 08 (Native Rust kernel and live studios)
```

Phase 30/39 source provenance, the Phase 0 regression suite and Law 5
simulation provenance apply to every phase. Law 7 desktop evidence applies
to every Phase 07 and 08 package.

## Phase dependencies

- **0A** supplies the sealed reference vaults, schemas and verification.
- **01** establishes admission, project I/O, command history and the desktop shell.
- **02** supplies MNA and thermal solvers for cell characterization and tile power.
- **03** supplies hierarchical ICs and ALUs for multi-radix and chip workflows.
- **04** supplies the SoC digital twin for hybrid control and Academy grading.
- **05** supplies quantum results, cryo forensics and solver evidence for the Academy.
- **06** provides the verified v4 Windows release and Phase 39 receipt pipeline.
- **07** fixes shared render and viewport behavior and defines bay-level geometry and presentation contracts. WP-7.1 and WP-7.2 can proceed in parallel. The SoC, Silicon and Quantum/Library work packages can proceed in parallel once both shared packages pass. [Phase 07 playbook](phases/PHASE_07_PHOTOREALISTIC_STUDIO_RENDERING.md).
- **08** uses the accepted Phase 07 surfaces. The native/WASM bridge precedes the Logic, SoC and Quantum studio work. Logic and Quantum can proceed in parallel. SoC follows Logic for the shared Save/Open path. The final Co-Inventor and installer sweep follows all three studios. [Phase 08 playbook](phases/PHASE_08_NATIVE_RUST_KERNEL_AND_LIVE_STUDIOS.md).
