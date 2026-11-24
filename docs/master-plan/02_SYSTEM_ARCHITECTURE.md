# System Architecture (v5 Lock)

## 1. Desktop Shell

- **v4 baseline.** Tauri v2 wraps the React, TypeScript and Three.js workbench on Windows. The current WebGL renderer uses a procedural PMREM environment, ACES tone mapping and an automatic quality governor. The typed `ping`, `version`, `admission_status`, `kernel_solve` and `native_file_dialog` commands exist. The current `kernel_solve` stub reports idle frames and `kernelAttached: false`. Browser workers run the existing ESM engines. The WASM adapter exposes admission and reference verification.
- **Phase 07.** The existing renderer and one-rig mount gain a procedural studio environment, AgX tone mapping and a consistent viewport and status layout. Each bay owns its geometry, controls and render-state hooks. Switching workspaces hides the previous rig and its effects.
- **Phase 08.** Tauri's typed `kernel_solve` dispatches admitted requests into the six Rust crates through the shared `ep-kernel` facade. Browser dev and Playwright use `ep-kernel-wasm` with the same request semantics and fixtures. The status bar shows `KERNEL: NATIVE RUST` or `KERNEL: WASM` once that backend has accepted a real request and returned verified telemetry. Initialization and refusal have explicit statuses. Legacy ESM engines serve as parity oracles and retain their existing compatibility paths.
- **Release.** WP-6.5 documents the reproducible Windows build and Phase 39 receipt. WP-8.5 reuses that pipeline for the v5 plan's desktop installer, version `4.0.0`. [Desktop build and verification](../planning/DESKTOP_BUILD.md).

### 1.1 Workspace contract

| Top-toolbar order | Workspace | Stable ID | Phase 08 surface |
| --- | --- | --- | --- |
| 1 | Quantum Lab | `quantum` | OpenQASM/DRAG, hybrid RV32IM feedback, QEC, offline MPS |
| 2 | Silicon CAD | `silicon` | Circuit and thermal telemetry, Wafer Bench and Q4 Cell Stack, integrated forensics |
| 3 | Logic & Custom ICs | `logic` | Multi-radix circuit builder, truth tables and noise margins, custom IC and ALU packaging |
| 4 | SoC Architect | `soc` | RV32IM, SIMT, systolic INT8/QDQ and Q4, and unified-memory DVFS |
| 5 | Reference Library | `library` | Sealed specification and constants browser |

WP-8.2 adds `logic` to workspace selection, persistence and keyboard navigation. Existing four-workspace `.eplab` files verify against their original seal before migration. The new workspace starts empty on import. The schema and runtime reader/writer change together under WP-8.2. Forensics stays in Silicon CAD and the instrument dock.

## 2. Dual-Target Rust Simulation Kernel

### 2.1 Compilation targets

| Target | Entry | Used by |
| --- | --- | --- |
| Windows native | `apps/electrophysics-3d/src-tauri/src/ipc.rs` → `crates/ep-kernel/` facade | Production Tauri WebView2 workbench |
| `wasm32-unknown-unknown` | `crates/ep-kernel-wasm/` bindings → same facade | Browser dev preview and Playwright solver path |

Use the existing deterministic PRNG and preserve solver ordering and oracle bounds across the two targets. Coalesce or reject work beyond the bounded request queue. The UI frame loop and input remain responsive while admitted kernels execute.

### 2.2 Crate workspace layout

| Crate | Contents | Existing ESM oracle or parity surface |
| --- | --- | --- |
| `ep-core` | SI units, sealed reference materials, schemas and admission | Shared `data/` |
| `ep-circuit` | MNA, calibrated BSIM-level MOSFETs, RC parasitics | `packages/physics-engine/src/mna.mjs` |
| `ep-thermal` | Fourier PDE, blackbody colors, failure forensics | `packages/physics-engine/src/heat.mjs`, `thresholds.mjs`, `forensics.mjs` |
| `ep-logic` | Binary, Ternary, Q4 and custom-radix events, IC packages, hierarchical ALUs | `js/labs/logic/`, `packages/physics-engine/src/sandbox.mjs` |
| `ep-chip` | RV32IM, SIMT, INT8/QDQ and Q4 TPU, unified-memory SoC | `packages/chip-engine/` |
| `ep-quantum` | Lindblad/Kraus, QASM/DRAG, hybrid control, Pauli-frame QEC, MPS and optimizer | `packages/quantum-engine/` |

### 2.3 Admission controller (`ep-core`)

| Domain | Interactive budget | Offline path |
| --- | --- | --- |
| Quantum density matrix | n ≤ 6 qubits (d ≤ 64), 60 Hz frame target | MPS for low-entanglement states up to 500 qubits, subject to admission |
| MNA netlist | ≤ 64 nodes and ≤ 32 voltage sources per frame | Batch solve with explicit memory admission |
| Thermal grid | ≤ 128×128 cells per workspace | Offline batch |
| Memory | Kernel arena ≤ 512 MB, app ≤ 2 GB per Law 4 | Same memory limits |

The kernel returns `{ "admitted": false, "reason": "..." }` on refusal. The status bar and dock display the reason. QEC up to 500 qubits uses bounded Pauli frames and keeps its stabilizer provenance. QEC and MPS requests never enter the dense interactive path.

## 3. Exact File & IPC Schemas

| Schema | Purpose |
| --- | --- |
| [eplab-project.schema.json](schemas/eplab-project.schema.json) | Sealed Save/Open/Export/Auto-save project |
| [custom-ic.schema.json](schemas/custom-ic.schema.json) | Pins, radix domains, hierarchical netlist, timing/power macros (±5%/±10%) and parametric footprint |
| [solver-frame.schema.json](schemas/solver-frame.schema.json) | Fixed-size frame with provenance and no per-frame buffer churn |
| [experiment-bundle.schema.json](schemas/experiment-bundle.schema.json) | Seed, initial and optimized metrics, citations and SHA-256 replay seal |

WP-8.1 defines the versioned request and response types in the shared kernel and mirrors them in `src/desktop/contracts.ts`. A request carries a kind, request ID, workspace ID, bounded typed input and seed where relevant. A response echoes the request and workspace IDs and carries an admitted domain result with provenance or a refusal with a reason. Clients admit before allocation, validate replies, and discard stale or out-of-workspace frames. Native and WASM adapters map the same solver results to fixed frame buffers and domain-specific dock and inspector telemetry.

## 4. Data Flow

```text
User action → typed request → Tauri IPC or WASM worker → ep-core admission
                                                        → Rust solver
Sealed data vaults → SHA-256 verification ────────────────┘
Admitted result → frame buffers and provenance → active 3D rig, dock and inspector
Refusal → status and admission banner
Save/Open → .eplab schema and SHA-256 seal → project storage
```

## 5. Frontend Contract

- Single-workspace mounting and cached rigs. Workloads, highlights and flow effects belong to the active workspace and request.
- Keep hover callouts, status, ViewCube, ortho/perspective, layer visibility and ghost placement. The bottom dock stays within 32% of viewport height and the right inspector starts collapsed.
- The Law 4 quality governor stays automatic. Dispose renderer targets, geometries and procedural textures when their owning rig or renderer is retired.
- Laws 3, 5 and 7 govern procedural assets, provenance and live desktop evidence. The v5 plan's [rendering](phases/PHASE_07_PHOTOREALISTIC_STUDIO_RENDERING.md) and [live studios](phases/PHASE_08_NATIVE_RUST_KERNEL_AND_LIVE_STUDIOS.md) playbooks define each WP's observable gates.
