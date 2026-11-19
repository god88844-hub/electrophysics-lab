# PHASE 2 — Electrothermal Failure Forensics

## Sub-phase 2.1 — Local WebSocket Physics Daemon
- Python/Rust WebSocket server that accepts circuit state and returns simulation results
- ngspice batch execution, QuTiP 5.3 Lindblad solver, Stim QEC backend
- Files: `daemon/physics_server.py`, `daemon/quantum_backend.py`

## Sub-phase 2.2 — Real MNA/ngspice & 2D/3D Fourier Heat PDE
- Real circuit simulation using the daemon's ngspice binary
- 2D/3D heat equation solver on the wire/component geometry
- Files: `daemon/thermal_pde.py`

## Sub-phase 2.3 — Blackbody Heat, Oxide-Arc, Trace-Fusing/Smoke & Cryo-Quench Shaders
- GPU shaders driven by physics results (not fake numbers)
- Blackbody colour from `data/reference-library/06_failure_physics_thresholds.json`
- TDDB glow when Vgs > 1.95 V, trace fusing when T > 1085 °C (Cu)
- Files: `apps/electrophysics-3d/src/shaders/thermal.ts`

## Sub-phase 2.4 — 100 ms Slow-Mo Replay Scrubber & Automated Forensic Autopsy Report
- Ring-buffered simulation state snapshots (100 ms window, 10 ms steps)
- Scrub through the failure timeline
- Automated report: root cause, component, threshold exceeded, evidence
- Files: `apps/electrophysics-3d/src/forensics/`
