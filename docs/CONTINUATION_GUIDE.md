# Continuation guide — safely resume any phase

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