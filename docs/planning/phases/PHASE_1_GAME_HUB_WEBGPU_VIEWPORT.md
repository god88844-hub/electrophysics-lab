# PHASE 1 — Game Hub + WebGPU 3D Viewport

## Sub-phase 1.1 — WebGPU/Three.js Core & 60 FPS iGPU Pipeline
- Scaffold `apps/electrophysics-3d/` (React + TypeScript + Vite + Three.js WebGPURenderer with WebGL2 fallback)
- Implement the render loop with TSL PBR shaders
- Target: 60 FPS on Intel Core Ultra 7 155U integrated graphics
- Files: `apps/electrophysics-3d/src/renderer.ts`, `src/webgpu-device.ts`
- CI: headless browser smoke test (0 console errors, 60 FPS)

## Sub-phase 1.2 — Spacious 3D Lab Hub & Camera Fly-To Navigation
- Open dark-studio laboratory floor, subtle architectural grid, cinematic PBR lighting
- 3 interactive bays with smooth damped camera fly-to transitions
- 85%+ unobstructed viewport
- Files: `apps/electrophysics-3d/src/bays/`, `src/camera-controller.ts`
- CI: headless browser smoke test (drawer closed by default, bay navigation works)

## Sub-phase 1.3 — Progressive-Disclosure HUD & Hotkeys
- Top navigation pill (bay switcher + Run/Pause + time-scale + FPS)
- Collapsible right-hand Inspector Drawer (starts closed)
- Reference Library Drawer (opens from 📖 button or hotkey R)
- Hotkeys: 1–5 bays, Tab inspector, L layer peel, F forensics, R library, Esc zoom out
- Files: `apps/electrophysics-3d/src/hud/`, `src/hotkeys.ts`
- CI: keyboard interaction test

## Sub-phase 1.4 — 5-Level Microscope Zoom & 3D Metal Layer-Peel Slicer
- Zoom levels: Lab overview → Station → Die → Transistor → Atom
- 3D metal layer peel: li1 → met1 → met2 → met3 → met4 → met5 (SKY130 stack)
- Files: `apps/electrophysics-3d/src/zoom-levels.ts`, `src/layer-peel.ts`
- CI: zoom-level transition test
