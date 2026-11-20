# Verification status — Phase 0 audit ledger

## Phase 0 merged-stage ledger (software only)

All **96 research-software phase source trees (Stages A–Q)** are integrated on `main`. This is a source/software milestone, **not** complete physical validation, a production authorization or proof that every aspirational feature is implemented.

| Stage | Phases | Merged PR | Exact merge commit on `main` |
| --- | --- | --- | --- |
| M | 73–77 | [#94](https://github.com/god88844-hub/invention-lab/pull/94) | [`5c7215b2372b5647f094f9e822dcf5409b091411`](https://github.com/god88844-hub/invention-lab/commit/5c7215b2372b5647f094f9e822dcf5409b091411) |
| N | 78–83 | [#90](https://github.com/god88844-hub/invention-lab/pull/90) | [`e5d258318063e14e0995c93451dfaaa93fbf45b5`](https://github.com/god88844-hub/invention-lab/commit/e5d258318063e14e0995c93451dfaaa93fbf45b5) |
| O | 84–88 | [#91](https://github.com/god88844-hub/invention-lab/pull/91) | [`6cf6167d6c5be86e96dfd97f77921cf8243558b9`](https://github.com/god88844-hub/invention-lab/commit/6cf6167d6c5be86e96dfd97f77921cf8243558b9) |
| P | 89–92 | [#92](https://github.com/god88844-hub/invention-lab/pull/92) | [`1979781e29073a6e6c6c762e859eede03db56fe5`](https://github.com/god88844-hub/invention-lab/commit/1979781e29073a6e6c6c762e859eede03db56fe5) |
| Q | 93–96 | [#93](https://github.com/god88844-hub/invention-lab/pull/93) | [`adcb4299eeb184940b286dadb1b3bc351e82b092`](https://github.com/god88844-hub/invention-lab/commit/adcb4299eeb184940b286dadb1b3bc351e82b092) |

| Verified in scoped research software / authentic primitive-cell flow | Still open or explicitly NO-GO |
| --- | --- |
| Stage M's four Q4 primitive cells have native Magic **DRC=0**, unique root-level Netgen terminal LVS with exact pins and RC PEX evidence. | **0/6 complete physical ALUs** independently pass top-level DRC/LVS/PEX; a passed primitive is not a passed ALU. |
| Source-pinned SKY130/open_pdks provenance and SHA-256 auditing; strict **1.95 V** SKY130 core four-terminal SOA guard. | No active authenticated process/mismatch statistical expressions in the audited model; the genuine **4,000 primitive + 2,400 ALU** trial campaign has **not** been performed. Level-1 `INSUFFICIENT_MODEL_DATA`, yield `UNKNOWN`. |
| Stages N–Q provide bounded 3D, AI Co-Inventor, invented ISA/TPU/QPU references, and optional FPGA/instrument/GDS intake, with fail-closed software tests. | Stage O yield is **synthetic**, not silicon yield. No independently calibrated physical holdout, authenticated full ALU silicon, trusted reviewer authorization, or fabrication signoff. Level-2 `UNQUALIFIED_NO_GO`. |

Review exact-commit [GitHub Actions](https://github.com/god88844-hub/invention-lab/actions), [verification](https://github.com/god88844-hub/invention-lab/blob/main/docs/VERIFICATION_STATUS.md) and [roadmap](https://github.com/god88844-hub/invention-lab/blob/main/ROADMAP.md) before drawing any conclusion from a green software check.


A green **software** check never establishes measured silicon performance. Examine the exact commit and artifact, not the headline verdict.

## Authentic native evidence

| Run | Verified finding | Source |
| --- | --- | --- |
| [44533413910](https://github.com/god88844-hub/invention-lab/actions/runs/44533413910) | Q4 primitive Magic DRC 0, Netgen terminal LVS unique, RC PEX | Native job artifact |
| [44536314808](https://github.com/god88844-hub/invention-lab/actions/runs/44536314808) | Processed PDK file hash validated; missing combined MC model | Real processed library |
| [44548482333](https://github.com/god88844-hub/invention-lab/actions/runs/44548482333) | 783 installed SPICE files, 150 reachable includes; zero active statistical expressions | Source-bounded transitive audit |

| Primitive | Exact top-level pins | Native DRC / LVS / PEX |
| --- | ---: | --- |
| q4_thresh_det | 6/6 | PASS native physical-cell rules |
| q4_inv | 6/6 | PASS native physical-cell rules |
| q4_mux4 | 8/8 | PASS native physical-cell rules |
| q4_half_adder | 8/8 | PASS native physical-cell rules |

**Scope:** These are four primitive cell native geometries; **0/6 hierarchical ALUs** have independent top-level physical DRC/LVS/PEX verification. No genuine 6,400-trial statistical campaign has completed on the pinned model.

## Exact pinned SHA-256 / source provenance

| Evidence | Source identity |
| --- | --- |
| Original SkyWater sky130_fd_pr source | `f62031a1be9aefe902d6d54cddd6f59b57627436` |
| open_pdks source | `0c1f82326278a0871f0a1fc4bdacf94c88e78e4d` |
| Processed sky130.lib.spice | `4fcb2a538312de6f71c718c6be325fe865d5c4248a76dd5f7d2e8512df0d54ef` |
| Transitive audit JSON, run 44548482333 | `89014e4f6936a1e340eebc5059019fc956e95d78f9f34a9a323972b4fd850123` |
| ZIP artifact run 44548482333 | `4895669cee21f56bdbcb5ad1d88569344c223594c8673e936e095e3b0ddf84bb` |
| Source manifest run 44548482333 | `025ec0441a055d39f7191e6d2218b6f23a81012456e5d71e9127eed0c1f38f41` |

Per-cell PEX digest evidence: [Stage M forensic source JSON](../benchmarks/evidence/stage-m-44548482333-fail-closed-forensics.json). The [Phase 0 software acceptance script](../scripts/stage-m-phase0-acceptance.py) compares each actual file and refuses fabricated yield or altered model bytes.

## Never bypass

- SKY130 1.8 V core four-terminal **pairwise SOA <= 1.95 V**, validated from genuine waveforms before claiming it passes.
- Original PDK source commit and every source/model file SHA-256; selected statistical corner must contain authentic active process+mismatch switches and real seeded variation.
- Magic zero-error physical DRC, Netgen top-level unique terminal LVS with exact complete external pin set and order, SHA-bound PEX. Never accept a matching nested subcell as top-level LVS.
- **Absent statistical input = Level-1 INSUFFICIENT_MODEL_DATA**, yield UNKNOWN, Wilson interval UNKNOWN. Phase 0 expected-fail-closed can PASS as a software *gate test*; it cannot be VIRTUALLY_QUALIFIED.
- **Level-2 UNQUALIFIED_NO_GO** until independently authenticated physical measurement and reviewer trust. No CI/self-signed bypass.

## Honest capabilities

| Workstream | Software/research state | Physical boundary |
| --- | --- | --- |
| N Workbench | 3D scene/interaction and bounded automated checks | No full physical CAD signoff |
| O Co-Inventor | Approval-gated and synthetic/model-based optimization | Not wafer-calibrated yield |
| P virtual ISA / TPU / quantum | Source-bounded interpreter, ONNX and idealized feedback | No full Linux boot, measured TPU or live quantum |
| Q hardware bridge | Candidate FPGA/SCPI/trace/GDS workflows | No physical signoff or wafer authorization |

See [ROADMAP](../ROADMAP.md) and [continuation guide](CONTINUATION_GUIDE.md). Verify current main GitHub CI for any later merge or release.
---

## v2 Electrophysics Lab — verification frontier (M4–M7)

**Test totals (exact, verified 2026-11-20 on `feature/v2-electrophysics-lab`)**

| Suite | Result |
| --- | --- |
| `npm test` (Phase 0 + reference library + physics-engine + quantum-engine) | **1036 pass / 0 fail / 1 skip** |
| — of which Phase 0 legacy stages | 1007 pass / 0 fail / 1 skip (baseline preserved) |
| — `tests/physics-engine.test.mjs` (M5) | 15 pass |
| — `tests/quantum-engine.test.mjs` (M6) | 14 pass |
| `npm run test:e2e` (headless Chromium smoke, apps/electrophysics-3d) | **4 pass / 0 fail** |
| `vite build` (3D app incl. physics + quantum workers) | clean |

**Verified deliverables**

- 5 bays live (quantum cryo + photonic + tweezer modes; SKY130A stack with layer-peel
  microscope and 4 verified Q4 primitives; unified-memory SoC composer; forensics vault;
  offline library with in-browser SHA-256 verification, 6/6 ✓).
- Real-time physics: MNA (Shichman–Hodges + CLM, numeric Jacobian, source stepping),
  2D FTCS heat PDE, cryo ODE — 240 Hz in a Web Worker; electro-thermal R(T) coupling.
- Failure physics at exact verified thresholds: gate-oxide TDDB trip at Vgs > 1.95 V
  (E-model, γ ≈ 300 dec/V), Cu fusing 1085 °C, FR-4 delamination 260 °C, cryo quench
  > 12 mW — each with arc/char/smoke/quench FX and a 100 ms forensic autopsy
  (oscilloscope, slow-motion scrubber, JSON/Markdown export, physics-valid AI fix).
- Noisy quantum simulation: Lindblad density-matrix solver (trace-preserving,
  Cholesky-positivity-checked, analytic T1/T2 agreement), three modalities on one QHAL,
  Pauli-frame QEC with quadratic logical-error suppression, fixed-seed reproducible
  AI Co-Inventor optimizer with SHA-256-sealed bundle export.

**Boundary (unchanged)**: everything above is simulation evidence. No physical
validation claims are made or unlocked; the Phase 3 measurement gates (G1–G7) remain
the only path to `physicalValidation`, and no real-measurement dataset exists in this
repository. Level-1 `INSUFFICIENT_MODEL_DATA` / Level-2 `UNQUALIFIED_NO_GO` discipline
applies to all hardware claims.

## v2.1 (M8–M10) verification update

| Suite | Result |
| --- | --- |
| `npm test` (incl. panel-close 4, sandbox-netlist 7, chip-engine 7) | **1054 pass / 0 fail / 1 skip** |
| Playwright: v2 smoke (M7) + close-UX (M8, incl. Phase 0 legacy panels via serve.mjs harness) | 7 pass / 0 fail |

New engines are simulation models and carry their badges: the SoC
architecture comparison is `SIMULATED_ARCHITECTURAL_MODEL`; failure physics
still cite 06_failure_physics_thresholds.json exactly (1.95 V / 1085 °C /
260 °C / 12 mW); no physical-validation claims anywhere.
