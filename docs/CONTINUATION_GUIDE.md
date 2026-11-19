# Continuation guide — safely resume any phase

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


**Simulation Evidence != Physical Validation.** Every new claim must be reproducible from source, parameters, known units, model limitations, original measurements and immutable hashes.

## Setup and first checks

```bash
git clone https://github.com/god88844-hub/invention-lab.git
cd invention-lab
npm test
npm start
python3 -m unittest discover -s tests -p 'stage_m_*test.py'
node --test tests/stage-m-q4-sources.test.mjs tests/stage-m-native-monte-carlo.test.mjs
git diff --check
```

Node tests and Python/Tcl/SPICE static inspections run locally. Magic, Netgen and ngspice are provisioned on the GitHub Actions native EDA runner: do not relax real physical gates simply because native binaries are absent locally.

## Entry points

| Area | Files / contracts |
| --- | --- |
| Browser and canonical scene | `serve.mjs`, `js/core/`, `js/scene/viewer.js` |
| 3D Workbench | `js/scene/stage-n-*.js`, `docs/STAGE-N-78-83.md` |
| Human-approved Co-Inventor | `js/scene/stage-o-*.js`, `scripts/stage-o-synthetic-benchmark.mjs` |
| Custom ISA / TPU / QPU | `js/scene/stage-p-*.js` |
| FPGA, SCPI and GDS candidates | `js/hardware/phase9*.js`, `scripts/phase93-local-fpga.mjs`, `scripts/phase94-visa-capture.py` |
| SKY130 routing and extraction | `scripts/stage-m-native-eda.sh`, `scripts/stage-m-magic-layout.tcl`, `scripts/stage-m-routing-plan.py` |
| Native LVS | `scripts/stage-m-validate-lvs.py`, `scripts/stage-m-phase0-acceptance.py` |
| Statistical PDK | `scripts/stage-m-pdk-transitive-audit.py`, `scripts/stage-m-mm-corner-audit.mjs` |
| Transient SOA and ngspice | `scripts/stage-m-soa-waveform-capture.py`, `scripts/stage-m-four-terminal-soa.py`, `scripts/stage-m-trial-decks.py`, `scripts/stage-m-parallel-ngspice.py` |

## Invariants (no exception)

1. SKY130 core gate/terminal limit **1.95 V** for max absolute voltage differences, plus original LDO/ripple/temperature constraints. Use real four-terminal transient waveforms before claiming SOA success.
2. Model source commits `f62031a1be9aefe902d6d54cddd6f59b57627436` and `0c1f82326278a0871f0a1fc4bdacf94c88e78e4d` require exact verified SHA-256 provenance. Do not invent model sections, mismatch statistics or fabricate source files.
3. Magic DRC=0, terminal Netgen unique root LVS and exact unique pin set, and complete RC extraction must be independently verified for EACH physical cell. A schematic ALU candidate is not a routed ALU.
4. No active stochastic model => Level-1 `INSUFFICIENT_MODEL_DATA`, numeric yield unknown; passing the Phase 0 fail-closed software test is **not** device qualification.
5. Level-2 `UNQUALIFIED_NO_GO` remains until independently sourced, calibrated and reviewer-accepted physical hardware measurements; never forge signatures or grant CI itself physical reviewer status.

## Frontier 1: statistical PDK intake

Obtain source-licensed official process+mismatch models, pin exact commits, validate full transitive hashes and selected sections, confirm BOTH active switches and working gauss/agauss with reproducible variability on ngspice. Keep nominal tt and educational randomness separate from authenticated foundry distributions. Only with six physical ALUs and four-terminal SOA evidence: run 4,000 primitive + 2,400 ALU PEX trials, threshold-check noise/timing/power, derive actual survival and Wilson 95%. Treat Stage O's current optimizer as synthetic until then.

## Frontier 2: six post-layout ALUs

Start from four real Q4 native primitive results. For Binary/Ternary/Q4 × 4/8 digits create actual physical top-level instances and interconnects, extend postroute bounding box + 2um halo routing with negative-origin handling, and independently run Magic DRC, Netgen exact terminal LVS and PEX. Hash each .gds, .mag, extraction and detailed report. Set nativeLvsMatch true only from that exact verified top-level evidence.

## Frontier 3: real virtual-OS, quantum and silicon measurement

Upgrade bounded Forth monitor to a full independently verified RISC-V Linux boot with required privilege/MMU/device support; acquire live attributable Qiskit hardware streams; capture authorized FPGA/SCPI/sigrok/wafer records with calibration, uncertainty, held-out devices and trusted independent reviewers. No generic simulation output or instrument CSV alone authorizes fabrication.

## PR and release discipline

```bash
git switch -c frontier/<topic>
npm test
python3 -m unittest discover -s tests -p 'stage_m_*test.py'
git diff --check
# push the branch, inspect GitHub Actions using the exact head commit
```

Check every required workflow, inspect real artifacts and list unresolved evidence. Maintain draft status while blocked. Merge only after source-level CI is 100% green for exact commits and with documented scope. Mark release as software-only after final main CI passes. Do not use a green Phase 0 fail-closed test as Level-1 or Level-2 physical authorization.

See [ROADMAP](../ROADMAP.md) and [verification status](VERIFICATION_STATUS.md).