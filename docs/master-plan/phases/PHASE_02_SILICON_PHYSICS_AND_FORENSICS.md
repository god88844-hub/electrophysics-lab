# PHASE 02 — Silicon Physics & Forensics (Layer 1)

## Objective
Port the silicon solver to the Rust kernel with ngspice differential
verification, implicit-stable thermal PDE, and complete the direct-3D editing
→ forensics loop (kernel-backed).

## Non-Goals
No multi-radix logic (Phase 3), no SoC (Phase 4), no UI redesign.

## Exact Files
- Created: `crates/ep-circuit/**` (mna, mosfet, parasitics), `crates/ep-thermal/**`,
  `scripts/phase2x-diff.mjs` (ngspice differential harness),
  `apps/electrophysics-3d/src/state/kernelNetlist.ts`.
- Modified: `apps/electrophysics-3d/src/workers/physics.worker.ts` (kernel
  delegate when wasm/native available), `src/ui/cad/BottomDock.tsx` (kernel
  provenance badge).
- Contracts: `03_PHYSICS_MATH_FUNDAMENTALS.md` §1; `solver-frame.schema.json`.

## Interface Contracts
- Netlist in: `eplab-project` workspace components/wires → sandbox compiler →
  kernel netlist (node IDs stable across frames).
- Frames out: `solver-frame.schema.json` typed arrays at 60 Hz.
- ngspice oracle: same netlist exported as SPICE deck; node-voltage compare
  ±1e-6 V, currents ±1e-9 A; SKY130A public models for MOSFET differential.

## Checklist

### WP-2.1 — `ep-circuit` MNA + Newton (parity)
- [ ] Stamps: R, V, I sources; numeric-Jacobian Newton; damped steps; source stepping; gmin escalation
- [ ] Parity tests vs `packages/physics-engine` divider/inverter/shorted-gate oracles (±1e-9)
- [ ] KCL + power conservation tests (< 1e-9)
- [ ] Admission: refuse > 64 nodes / > 32 V-sources with reason

### WP-2.2 — BSIM-calibrated MOSFET levels
- [ ] Extract Id/gm/gds tables from SKY130A public models (`nfet_01v8`, `pfet_01v8`) into `data/reference-library/02` extension (cited)
- [ ] Kernel interpolates tables; fallback square-law below table bounds
- [ ] ngspice differential: Id ± 5 % across the sweep
- [ ] Charge-conserving Cgs/Cgd for transient (Phase 4 DVFS uses them)

### WP-2.3 — Implicit thermal PDE in `ep-thermal`
- [ ] Backward-Euler solve (sparse triangular factorization) + CN for ≤64² grids
- [ ] Analytic convection steady-state ±2 %; unconditional-stability test (any Δt)
- [ ] Joule source coupling from WP-2.1 branch currents (R(T) TCR loop)

### WP-2.4 — ngspice CI differential harness
- [ ] `phase2x-diff.mjs`: netlist → deck → ngspice → parse → compare
- [ ] 10-case suite (divider, inverter, cascade, RC, breakdown bias point…)
- [ ] CI workflow step green; tolerance table updated in 03 §5

### WP-2.5 — Direct 3D editing on kernel netlists
- [ ] Place/Wire tools compile through the kernel (not the ESM fallback) when native/wasm is present
- [ ] Manhattan traces carry parasitic R/C into the solve (Elmore/Pi)
- [ ] Probe pins read kernel frames per node

### WP-2.6 — Forensics loop (kernel events)
- [ ] Threshold events (1.95 V / 1085 °C / 260 °C / 200 °C) computed in `ep-thermal`/`ep-circuit`
- [ ] 100 ms ring buffer + slow-mo replay from kernel frames
- [ ] VFX (arc/char/smoke) anchored at kernel-reported failing coordinates
- [ ] AI Fix: physics-valid patches (clamp/widen/cool) + clean re-run

## Failure Modes & Edge Cases
- Newton divergence → source stepping → gmin escalation → honest non-convergence report (never fake values).
- ngspice missing locally → differential harness SKIPS with explicit
  `ngspice not available` (never silently passes).
- Thermal Δt too large for CN accuracy → error estimator flags, substep.
- Breakdown event during replay → replay is read-only; live mode required to trip.
- Kernel/wasm absent → ESM fallback with provenance badge switch (honest).

## Acceptance Gate
- `cargo test -p ep-circuit -p ep-thermal` green (parity + analytic + conservation).
- ngspice differential suite green (or explicit skip when ngspice absent).
- `npm test` green; Playwright: editing + breakdown→dock→AI Fix on kernel frames.
- Phase 30/39 clean-tree PASS.
