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
