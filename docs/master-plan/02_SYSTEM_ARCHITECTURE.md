# System Architecture (v4 Lock)

## 1. Desktop Shell

- **Tauri v2** native Windows `.exe` wrapping the CAD frontend.
- Frontend: React 18 + TypeScript + Three.js. Renderer: `WebGPURenderer`
  primary with WebGL2 fallback (the existing renderer factory pattern in
  `apps/electrophysics-3d/src/engine/renderer.ts` is retained and extended).
- Shell prep already lives in `apps/electrophysics-3d/src-tauri/`
  (`tauri.conf.json`, inert `main.rs`, Cargo template) — see
  `docs/planning/DESKTOP_BUILD.md` for the (optional) build path. The web
  flow (`npm run dev`, `vite preview`, Playwright CI) stays byte-identical.
- No custom IPC surface exists today; the workbench is fully client-side.
  Future native services go through typed IPC contracts added incrementally.

## 2. Dual-Target Unified Rust Simulation Kernel (`crates/ep-kernel/`)

### 2.1 Compilation targets

| Target | Entry | Used by |
| --- | --- | --- |
| native (`x86_64-pc-windows-msvc`) | Tauri IPC → typed-array buffers into the WebView | Windows `.exe` (production path) |
| `wasm32-unknown-unknown` | `crates/ep-kernel-wasm/` JS bindings (`wasm-bindgen`) | browser dev preview + Playwright CI (exercises the same kernel code) |

Parallelism: Rayon multi-core for per-tile/per-channel work; explicit SIMD
auto-vectorization on hot loops (MNA LU, thermal stencil, Lindblad Kruskal
products). Deterministic seeding via a single kernel-level PRNG stream.

### 2.2 Crate workspace layout

| Crate | Contents | Mirrors (browser fallback) |
| --- | --- | --- |
| `ep-core` | SI units, material property tables (loaded from `data/reference-library/*.json` at build/run), JSON schema types, admission controller (fail-closed budget checks) | `data/` shared |
| `ep-circuit` | MNA stamping + LU solve, Shichman–Hodges → calibrated BSIM-level MOSFET levels, RC parasitics (Elmore/Pi), source/Gmin stepping, numeric-Jacobian path parity | `packages/physics-engine/src/mna.mjs` |
| `ep-thermal` | 2D/3D Fourier heat PDE (implicit Euler / Crank–Nicolson — unconditional stability), blackbody color curve, failure forensics (threshold events, ring buffer, autopsy payloads) | `packages/physics-engine/src/heat.mjs`, `thresholds.mjs`, `forensics.mjs` |
| `ep-logic` | Event-driven Binary/Ternary/Q4/Custom-Radix simulator, hierarchical custom-IC compiler (macro-model extraction per `custom-ic.schema.json`) | `js/labs/logic`, `packages/physics-engine/src/sandbox.mjs` |
| `ep-chip` | Cycle-accurate RV32IM/Custom-ISA CPU, SIMT warp kernel, weight-stationary systolic TPU (INT8/QDQ + Q4), unified-memory SoC NoC model | `packages/chip-engine/` |
| `ep-quantum` | Lindblad/Kraus density-matrix solver, Pauli-frame stabilizer QEC (50–500+ qubit frames), MPS low-entanglement engine, fixed-seed AI optimizer | `packages/quantum-engine/` |

### 2.3 Admission controller (`ep-core`)

Fail-closed budgets (refuse, never crash):

| Domain | Interactive budget | Offline path |
| --- | --- | --- |
| Quantum density matrix | n ≤ 6 qubits (d ≤ 64), 60 Hz | MPS frame for low-entanglement states up to 500 qubits |
| MNA netlist | ≤ 64 nodes + ≤ 32 voltage sources per frame | batch solve, no per-frame cap |
| Thermal grid | ≤ 128×128 cells per workspace | offline batch |
| Memory | total kernel arena ≤ 512 MB (app ≤ 2 GB per Law 4) | — |

Refusal response: `{ "admitted": false, "reason": "..." }` on the IPC/worker
channel — rendered honestly in the UI (status bar + dock), never hidden.

## 3. Exact File & IPC Schemas

Concrete JSON Schema definitions in `docs/master-plan/schemas/`:

| Schema | Purpose |
| --- | --- |
| `eplab-project.schema.json` | `.eplab` Save/Open/Export/Auto-save container; SHA-256 integrity seal; workspaces hold components/wires/probes/quantum programs |
| `custom-ic.schema.json` | Hierarchical custom-IC package: pins + radix domains + netlist/sub-ICs + auto-extracted timing/power macro-model (±5 %/±10 % verified vs internal solve) + parametric 3D footprint |
| `solver-frame.schema.json` | Fixed-size 60 Hz telemetry frame: typed arrays, no GC churn, provenance badge required per frame |
| `experiment-bundle.schema.json` | Deterministic reproducible research export: fixed seed, initial/optimized metrics, noise citation, SHA-256 seal |

## 4. Data Flow (v4)

```
data/reference-library/*.json  ──load (ep-core, SHA-256 verified)──▶  kernel solvers
kernel 60 Hz frames            ──typed arrays (solver-frame.schema)──▶  3D renderer + oscilloscope dock
user edits (Place/W/Probe)     ──compile (sandbox compiler)──────────▶  kernel solve
.eplab Save/Open               ──eplab-project.schema────────────────▶  disk (SHA-256 sealed)
```

## 5. Frontend Contract (unchanged invariants)

- Single-workspace mounting (one rig rendered; rigs cached) — M12 architecture retained.
- Zero permanent floating labels; hover callout + status bar.
- Bottom instrument dock ≤ 32 % height; right inspector collapsed by default.
- ViewCube, ortho/persp, layer visibility panel, ghost placement — all
  retained and extended, never removed.
- iGPU quality governor automatic (Law 4).
