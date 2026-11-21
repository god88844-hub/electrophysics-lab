<!-- v4 POINTER: This legacy planning stub is superseded. The single source of truth for forward-looking planning is docs/master-plan/00_INDEX.md. Content below is preserved verbatim for history. -->

# MASTER PLAN — Electrophysics Lab v2

> **Project**: `god88844-hub/invention-lab` (brand: **Electrophysics Lab**)
> **Baseline**: main @ `af6bff9` (Phase 0/Stage Q merged; 96 stages A–Q; 1000 tests)
> **Hardware target**: Intel Core Ultra 7 155U (16 GB LPDDR5x-7467, Intel Graphics, Windows 11 25H2) — 60 FPS
> **Stack**: React + TypeScript + Three.js `WebGPURenderer` (WebGL2 fallback) + TSL PBR + Python/Rust + ngspice/QuTiP 5.3/Stim physics daemon
> **Scope**: Chips, electronic circuits, computing systems, binary/ternary/quaternary logic, computer architecture, quantum computing
> **Explicit out of scope**: aerodynamics, propulsion, aircraft simulation (AeroForge is a separate project)

---

## Status tracker

| Phase | Name | Status | Sub-phases |
|---|---|---|---|
| 0 | Foundation (legacy software) | ✅ merged | 96 stages A–Q |
| 1 | Game Hub + WebGPU 3D Viewport | 🔲 planned | 1.1→1.2→1.3→1.4 |
| 2 | Electrothermal Failure Forensics | 🔲 planned | 2.1→2.2→2.3→2.4 |
| 3 | Quantum Breakthrough Lab | 🔲 planned (P1) | 3.1→3.2→3.3→3.4→3.5 |
| 4 | Silicon Multi-Radix Sandbox | 🔲 planned | 4.1→4.2→4.3→4.4 |
| 5 | Full Chips + Live Software | 🔲 planned | 5.1→5.2→5.3→5.4 |
| 6 | Open Science + Hardware Bridge | 🔲 planned | 6.1→6.2→6.3 |

## Dependency DAG

```
Phase 0 (foundation)
  └─→ Phase 1 (3D viewport + game hub)  ←── M1 reference library, M2 planning docs
        └─→ Phase 2 (failure forensics) ←── physics daemon
              └─→ Phase 3 (quantum lab, P1 priority)
                    └─→ Phase 4 (multi-radix sandbox)
                          └─→ Phase 5 (full chips + live software)
                                └─→ Phase 6 (open science + hardware bridge)
```

## Directory layout (v2 additions)

```
data/reference-library/       ← M1: verified offline physics data (JSON + SHA-256 MANIFEST)
docs/planning/                ← M2: unified master plan + per-phase blueprints
  MASTER_PLAN.md              ← this file
  UX_GAME_DESIGN.md           ← anti-clutter game UX spec
  AGENT_HANDOFF_PROTOCOL.md   ← agent handoff playbook
  phases/                     ← 7 per-phase playbooks
apps/electrophysics-3d/       ← M3: React + Three.js WebGPU 3D lab (Phase 1 execution)
```

## Data flow

```
data/reference-library/*.json ←── read at build time ──→ apps/electrophysics-3d/ (TSL uniform bindings)
Phase 0 legacy js/ engines    ←── WebSocket JSON ──→ physics daemon (Python/Rust: ngspice, QuTiP, Stim)
3D scene state                ←── TSL uniforms ──→ GPU (WebGPURenderer / WebGL2 fallback)
User interactions             ←── keyboard + pointer ──→ camera fly-to, inspector drawer, layer peel
```

## Non-negotiable invariants

1. Preserve all 96 Phase 0 stage source trees and their 1000-test CI suite.
2. Preserve the 4/4 verified SKY130A Q4 primitives with pinned provenance.
3. Preserve the strict 1.95 V SKY130 core SOA limit and Level-1/Level-2 qualification gates.
4. Target 60 FPS on the specified hardware; WebGPU primary, WebGL2 fallback.
5. No hallucinated numbers — every datum cites its source.
6. Invention Lab ≠ AeroForge — separate projects, separate scope.

---

## v2 milestone status (updated after M4–M7)

| Milestone | Deliverable | State | Evidence |
| --- | --- | --- | --- |
| M0 | Baseline verified (1007 pass / 0 fail / 1 skip, 805 files) | ✅ complete | commit af6bff9 |
| M1 | Offline reference library (6 verified JSON + MANIFEST, SHA-256) | ✅ complete | commit dfc28a2 |
| M2 | Planning docs (master plan, UX spec, 7 phase playbooks) | ✅ complete | commit 70beb48 |
| M3 | 3D lab hub scaffold (React + Three.js, 3 bays, HUD) | ✅ complete | commit 359d672 |
| M4 | Five-bay PBR lab + SKY130 layer-peel microscope + SoC composer | ✅ complete | commit 279612c |
| M5 | Real electro-thermal engine (MNA + heat PDE + failure FX + forensic autopsy) | ✅ complete | commit 8ba1ec2 |
| M6 | Noisy quantum simulator (3 modalities + QEC + AI Co-Inventor) | ✅ complete | commit 8403070 |
| M7 | Headless smoke verification + status sync + PR | ✅ complete | this commit |

## v2 verification totals (exact)

- **Node unit suite (`npm test`)**: 1036 pass / 0 fail / 1 skip
  - Phase 0 legacy: 1007 pass / 0 fail / 1 skip (unchanged from baseline)
  - `tests/physics-engine.test.mjs`: 15 pass (MNA KCL + power conservation, inverter sweep,
    Vgs stress, shorted-gate fault, heat PDE analytic steady state + symmetry, Cu TCR,
    exact threshold trips 1.95 V / 260 °C / 1085 °C / 12 mW, blackbody stops,
    ring-buffer window, forensic report structure, AI-fix provenance, cryo equilibrium)
  - `tests/quantum-engine.test.mjs`: 14 pass (trace preservation, Cholesky positivity,
    analytic T1/T2, ZZ rotation, DRAG π-pulse, reproducible SPSA improvement, QEC
    suppression (d3 + bit-flip), frame propagation rules, photonic unitarity/loss,
    Rydberg blockade, gate-fidelity normalization, DRAG envelope)
- **3D app build**: `vite build` clean; both physics + quantum workers bundle
- **Headless browser smoke (`npm run test:e2e`)**: 4 pass / 0 fail
  1. boots with 0 console errors, Inspector Drawer closed, SHA-256 6/6 ✓
  2. navigates all 5 bays cleanly
  3. VDD 2.5 V → `gate_oxide_breakdown` forensic autopsy (E-model TDDB, 1.95 V ceiling) → AI fix re-runs clean at 1.80 V
  4. AI Co-Inventor experiment completes → reproducible bundle; QEC sweep table live

## Honest evidence boundaries (unchanged)

- All quantum/circuit results are **simulation evidence** (SIMULATED_NOISY_MODEL badge),
  never physical validation.
- physicalValidation stage remains unlocked only by real-measurement datasets
  (Phase 3 gate G1–G7); none exist in this repo.
- Every displayed number cites `data/reference-library/*.json` (SHA-256 verified in-browser).

## v2.1 milestone status (M8–M10, branch `feature/v2-digital-twin-and-chips`)

| Milestone | Deliverable | State |
| --- | --- | --- |
| M8 | Photorealistic digital-twin materials + universal × close UX (v2 3D AND all 7 Phase 0 scene panels) + instrument palette + bay-switcher contrast fix | ✅ |
| M9 | Bay 2 interactive multi-radix sandbox: user-placed components → live MNA + thermal compile, 4 starter circuits, real failure thresholds preserved | ✅ |
| M10 | `packages/chip-engine`: RV32IM interpreter, Forth core, INT8/QDQ systolic TPU (05-JSON cycle model), SIMT warp kernel with divergence, unified-memory vs discrete PCIe + Q4-NPU comparison (`SIMULATED_ARCHITECTURAL_MODEL`); Bay 3 live-execution panel with real Fourier thermal coupling | ✅ |

Verification totals after M10: **1054 pass / 0 fail / 1 skip** (`npm test`),
3D build clean, Playwright smoke suite green (M7 4/4 + M8 close-UX 3/3).

## v3 milestone status (M11–M14, branch `feature/v3-cad-workbench`)

| Milestone | Deliverable | State |
| --- | --- | --- |
| M11 | Main CI regressions fixed (Phase 30/39): generated build outputs + test tarballs untracked (dist/, evidence/phase69-test|rogue-test, phase72/package, phase39/phase30 summaries) — gates unchanged, Phase 30 CAPTURE+STRICT PASS and Phase 39 BUILD/VERIFY/STRICT PASS verified locally (also required `core.autocrlf=false` for byte-exact Windows verification) | ✅ |
| M12 | Industrial CAD/EDA shell: single-workspace mounting (rig caching, one rig rendered), 40 px toolbar (tabs, V/C/W/P/L/T/O, transport), 3D ViewCube + ortho/persp, zero permanent floating labels (hover callout + 24 px status bar), collapsible bottom instrument dock, collapsible right inspector | ✅ |
| M13 | Data-driven geometry: SKY130 per-cell poly/li1/met1 detail, KLayout-style layer visibility + opacity panel, 64-tile individually addressable systolic MAC matrix driven by chip-engine matmul, CPW resonators + Josephson junctions on the transmon die, Rydberg blockade halos, Bloch spheres docked (HUD overlay optional) | ✅ |
| M14 | Direct 3D CAD interaction: ghost-preview Place (C), Manhattan Wire Routing (W) with netlist recompile, 3D Probe pins (P) with multi-channel live waveforms in the dock; Tauri v2 desktop packaging prep (inert, documented); e2e rewritten for the v3 shell | ✅ |

Verification totals after M14: **1054 pass / 0 fail / 1 skip** (`npm test`),
**5 pass / 0 fail** (Playwright: 4 v3-shell tests + 1 legacy close-UX test,
serial workers + 1 retry for SwiftShader load sensitivity), Phase 30/39 gates
re-verified locally on the fixed tree.
