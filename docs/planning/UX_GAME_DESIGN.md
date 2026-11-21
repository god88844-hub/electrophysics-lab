<!-- v4 POINTER: This legacy planning stub is superseded. The single source of truth for forward-looking planning is docs/master-plan/00_INDEX.md. Content below is preserved verbatim for history. -->

# UX / Game Design Spec — Anti-Clutter Lab Environment

## Core rule: 85%+ Open 3D Canvas

Never permanently occupy more than 15% of the viewport with UI chrome. The
default view is a clean, breathable 3D lab environment with cinematic lighting
and generous negative space. All panels are closed by default.

## Lab hub navigation

The user glides between 5 distinct 3D bays with smooth damped camera
transitions (WASD or click-to-glide). Each bay is a self-contained station.

### Bay 1 — Quantum Cryo & Optics Station
Golden dilution refrigerator (stylised PBR), optical bench with MZI preview,
neutral-atom vacuum chamber hologram. Ambient cold blue tone.

### Bay 2 — Silicon Foundry & Multi-Radix Station
Dark reflective silicon wafer microscope, SKY130A Q4 primitive 3D cells
(loaded from Phase 0 manifests), interactive transistor/gate sandbox.
Amber/gold tone.

### Bay 3 — Full-Chip Architecture Station
Dissectible 3D CPU (RV32IM 5-stage pipeline), systolic TPU array, SIMT GPU
die holographic pedestal. Cyan/teal tone.

### Bay 4 — Failure Forensics Vault
Slow-motion 100 ms breakdown replay, post-mortem autopsy report overlay.
Dark red/emergency tone. Only accessible after a failure event is triggered
in Bay 2 or 3.

### Bay 5 — Offline Physics Library
Searchable reference viewer backed by `data/reference-library/`. Clean white
paper aesthetic. Not a 3D bay — a fullscreen overlay.

## HUD design

Top navigation pill (fixed, always visible):
  [Bay switcher: 1 2 3 4 5] [▶/⏸] [Time-scale: 1× 10× 100×] [FPS: 60]

Right-hand Inspector Drawer:
  Starts CLOSED on load. Slides open smoothly when:
    - the user clicks a 3D machine/component
    - the user presses Tab
  Shows: component name, live parameter sliders, run controls, evidence badge.
  Closes with Esc or clicking outside.

Reference Library Drawer:
  Opens from the top pill (📖 button) or hotkey R. Slides from the left.
  Shows the offline reference library with search and category tree.

## Hotkeys

| Key | Action |
|---|---|
| 1–5 | Fly to Bay N |
| Tab | Toggle Inspector Drawer |
| L | Layer peel (3D metal stack slicer) |
| F | Failure forensics replay |
| R | Reference library drawer |
| Esc | Zoom out to Hub overview |
| Space | Run/Pause simulation |
| WASD | Manual camera movement (within a bay) |

## Anti-clutter rules

1. No permanent sidebars — the Inspector is the only side panel and it starts closed.
2. No grid of buttons — the Bay switcher is a single pill with 5 numbered dots.
3. No console/log panels in the default view — diagnostics are accessed from the Inspector.
4. Maximum 1 overlay panel at a time (Inspector OR Reference Library, never both).
5. All transitions use 300 ms ease-out cubic; no instant jumps.
6. FPS readout is a single number, not a chart.
7. The 3D scene IS the UI — 3D objects are clickable, hoverable, and show inline tooltips on hover (name + one-line description).
