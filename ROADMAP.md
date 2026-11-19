# Roadmap — Invention Lab phases 1–96 and post-release frontiers

**Release philosophy:** Phase 0 integrates source code, software tests and honest research records. `Simulation Evidence != Physical Validation`. The engineering frontier begins where evidence is genuinely absent.

The A–L stage labels below are **navigation groupings** for already-numbered Phases 1–72, not a claim that every historical PR used those stage names. M–Q reflect the numbered stage PRs: [M #94](https://github.com/god88844-hub/invention-lab/pull/94), [N #90](https://github.com/god88844-hub/invention-lab/pull/90), [O #91](https://github.com/god88844-hub/invention-lab/pull/91), [P #92](https://github.com/god88844-hub/invention-lab/pull/92), [Q #93](https://github.com/god88844-hub/invention-lab/pull/93).

## Architecture stages A–Q

| Group | Phases | Primary design workstream |
| --- | --- | --- |
| **A** | 1–6 | Foundations: editors, typed ports, measurement integrity, source tests, reusable assemblies |
| **B** | 7–12 | RV32I/RV32M architectural references; ONNX float, quantized and Conv; reference-model checks |
| **C** | 13–18 | Physical validation ladder; constrained timing, TT/PVT analysis, mapping and OpenROAD geometry |
| **D** | 19–24 | Detail routing, RC extraction, postroute PVT, layout, signoff readiness and independent measurement gates |
| **E** | 25–30 | Bounded calibration, manufacturing variation, blind holdout and science-first evidence release |
| **F** | 31–36 | First-principles models, source physical data, BLDC source audits and regime analysis |
| **G** | 37–42 | Independent auditing, reproducible source baseline, evidence passports and instrument capture |
| **H** | 43–48 | Battery, copper, motor, fan and coupled-energy models; whole-system audit |
| **I** | 49–54 | Identifiability, uncertainty, reliability and silicon/reference-prototype readiness |
| **J** | 55–60 | Independent provenance, admission gates, compiler co-simulation and accelerator scheduling |
| **K** | 61–66 | Density-matrix noise, QPU acquisition, hierarchical 3D, cross-domain projects, versioning and plugins |
| **L** | 67–72 | Guided workspaces, scalable scenes, packaging, security, UAT and multi-runner software readiness |
| **M** | 73–77 | Q4 device/LDO sources, noise margins, Monte Carlo planning, virtual passport and Magic/Netgen physical cells |
| **N** | 78–83 | 3D snap-build, scene/semantic zoom, quantum/academy views and LOD research |
| **O** | 84–88 | Approval-gated AI Co-Inventor, stress diagnosis, versioned model optimization |
| **P** | 89–92 | Custom radix ISA/CPUs, TPU/ONNX modeling, Forth virtual computer, noisy QPU feedback |
| **Q** | 93–96 | Opt-in FPGA HIL, SCPI/sigrok capture, GDSII packaging, fail-closed physical qualification |

## Individual phase index (1–96)

These are **workstream identifiers and design intentions**, not proof that a particular stage passed every physical or hardware gate.

- **01** — Foundations: introductory editor and simulation contracts
- **02** — Laboratory model basics
- **03** — Integrity boundaries ([source](docs/PHASE3-INTEGRITY-BOUNDARIES.md))
- **04** — Early module and wiring evolution
- **05** — Reusable one-level assemblies
- **06** — Parametric nested modules
- **07** — Data and validation ([source](docs/PHASE7-DATA-AND-VALIDATION.md))
- **08** — Rv32m validation ([source](docs/PHASE8-RV32M-VALIDATION.md))
- **09** — Onnx inference ([source](docs/PHASE9-ONNX-INFERENCE.md))
- **10** — Quantized onnx ([source](docs/PHASE10-QUANTIZED-ONNX.md))
- **11** — Conv and per axis ([source](docs/PHASE11-CONV-AND-PER-AXIS.md))
- **12** — Iris model validation ([source](docs/PHASE12-IRIS-MODEL-VALIDATION.md))
- **13** — Physical validation ladder ([source](docs/PHASE13-PHYSICAL-VALIDATION-LADDER.md))
- **14** — Constrained timing ([source](docs/PHASE14-CONSTRAINED-TIMING.md))
- **15** — Tt sensitivity ([source](docs/PHASE15-TT-SENSITIVITY.md))
- **16** — Real pvt corners ([source](docs/PHASE16-REAL-PVT-CORNERS.md))
- **17** — Mapped gate verification ([source](docs/PHASE17-MAPPED-GATE-VERIFICATION.md))
- **18** — Openroad geometry ([source](docs/PHASE18-OPENROAD-GEOMETRY.md))
- **19** — Real detail route rcx ([source](docs/PHASE19-REAL-DETAIL-ROUTE-RCX.md))
- **20** — Postroute pvt ([source](docs/PHASE20-POSTROUTE-PVT.md))
- **21** — Open layout audit ([source](docs/PHASE21-OPEN-LAYOUT-AUDIT.md))
- **22** — Feol postgds formal ([source](docs/PHASE22-FEOL-POSTGDS-FORMAL.md))
- **23** — Sky130 published measurements ([source](docs/PHASE23-SKY130-PUBLISHED-MEASUREMENTS.md))
- **24** — Prototype measurement gate ([source](docs/PHASE24-PROTOTYPE-MEASUREMENT-GATE.md))
- **25** — Bounded calibration ([source](docs/PHASE25-BOUNDED-CALIBRATION.md))
- **26** — Manufacturing variation reliability ([source](docs/PHASE26-MANUFACTURING-VARIATION-RELIABILITY.md))
- **27** — Blind hardware validation ([source](docs/PHASE27-BLIND-HARDWARE-VALIDATION.md))
- **28** — Engineering go nogo ([source](docs/PHASE28-ENGINEERING-GO-NOGO.md))
- **29** — Lab evidence atlas ([source](docs/PHASE29-LAB-EVIDENCE-ATLAS.md))
- **30** — Research software release ([source](docs/PHASE30-RESEARCH-SOFTWARE-RELEASE.md))
- **31** — First principles decisions ([source](docs/PHASE31-FIRST-PRINCIPLES-DECISIONS.md))
- **32** — Research physical data ([source](docs/PHASE32-RESEARCH-PHYSICAL-DATA.md))
- **33** — Original bldc raw analysis ([source](docs/PHASE33-ORIGINAL-BLDC-RAW-ANALYSIS.md))
- **34** — Healthy bldc speed ([source](docs/PHASE34-HEALTHY-BLDC-SPEED.md))
- **35** — Healthy bldc devices ([source](docs/PHASE35-HEALTHY-BLDC-DEVICES.md))
- **36** — Bldc two regime model ([source](docs/PHASE36-BLDC-TWO-REGIME-MODEL.md))
- **37** — Independent physical audit ([source](docs/PHASE37-INDEPENDENT-PHYSICAL-AUDIT.md))
- **38** — Integration preflight ([source](docs/PHASE38-INTEGRATION-PREFLIGHT.md))
- **39** — Reproducible source baseline ([source](docs/PHASE39-REPRODUCIBLE-SOURCE-BASELINE.md))
- **40** — Evidence passports ([source](docs/PHASE40-EVIDENCE-PASSPORTS.md))
- **41** — Reference hardware readiness ([source](docs/PHASE41-REFERENCE-HARDWARE-READINESS.md))
- **42** — Instrument capture protocol ([source](docs/PHASE42-INSTRUMENT-CAPTURE-PROTOCOL.md))
- **43** — E91 battery conditional model ([source](docs/PHASE43-E91-BATTERY-CONDITIONAL-MODEL.md))
- **44** — Copper wire contact losses ([source](docs/PHASE44-COPPER-WIRE-CONTACT-LOSSES.md))
- **45** — Motor source characterization ([source](docs/PHASE45-MOTOR-SOURCE-CHARACTERIZATION.md))
- **46** — Dimensionless fan affinity ([source](docs/PHASE46-DIMENSIONLESS-FAN-AFFINITY.md))
- **47** — Coupled energy conservation ([source](docs/PHASE47-COUPLED-ENERGY-CONSERVATION.md))
- **48** — Whole system independent model audit ([source](docs/PHASE48-WHOLE-SYSTEM-INDEPENDENT-MODEL-AUDIT.md))
- **49** — Identifiability and calibration ([source](docs/PHASE49-IDENTIFIABILITY-AND-CALIBRATION.md))
- **50** — Uncertainty and holdout ([source](docs/PHASE50-UNCERTAINTY-AND-HOLDOUT.md))
- **51** — Reliability fault analysis ([source](docs/PHASE51-RELIABILITY-FAULT-ANALYSIS.md))
- **52** — Reference qualification ([source](docs/PHASE52-REFERENCE-QUALIFICATION.md))
- **53** — Sky130 signoff readiness ([source](docs/PHASE53-SKY130-SIGNOFF-READINESS.md))
- **54** — Physical alu prototype acquisition ([source](docs/PHASE54-PHYSICAL-ALU-PROTOTYPE-ACQUISITION.md))
- **55** — Independent provenance ([source](docs/PHASE55-INDEPENDENT-PROVENANCE.md))
- **56** — Physical admission ([source](docs/PHASE56-PHYSICAL-ADMISSION.md))
- **57** — Unified release readiness ([source](docs/PHASE57-UNIFIED-RELEASE-READINESS.md))
- **58** — Compiler cosimulation ([source](docs/PHASE58-COMPILER-COSIMULATION.md))
- **59** — Accelerator scheduler ([source](docs/PHASE59-ACCELERATOR-SCHEDULER.md))
- **60** — Accelerator physical calibration ([source](docs/PHASE60-ACCELERATOR-PHYSICAL-CALIBRATION.md))
- **61** — Density matrix noise ([source](docs/PHASE61-DENSITY-MATRIX-NOISE.md))
- **62** — Quantum hardware acquisition ([source](docs/PHASE62-QUANTUM-HARDWARE-ACQUISITION.md))
- **63** — Hierarchical 3d ([source](docs/PHASE63-HIERARCHICAL-3D.md))
- **64** — Cross domain ([source](docs/PHASE64-CROSS-DOMAIN.md))
- **65** — Project versioning ([source](docs/PHASE65-PROJECT-VERSIONING.md))
- **66** — Data only plugins ([source](docs/PHASE66-DATA-ONLY-PLUGINS.md))
- **67** — Guided workspaces ([source](docs/PHASE67-GUIDED-WORKSPACES.md))
- **68** — Scene scalability ([source](docs/PHASE68-SCENE-SCALABILITY.md))
- **69** — Reproducible web package ([source](docs/PHASE69-REPRODUCIBLE-WEB-PACKAGE.md))
- **70** — Security audit ([source](docs/PHASE70-SECURITY-AUDIT.md))
- **71** — Uat api freeze ([source](docs/PHASE71-UAT-API-FREEZE.md))
- **72** — Cross runner ([source](docs/PHASE72-CROSS-RUNNER.md))
- **73** — Authenticated Q4 PDK and SOA source
- **74** — Q4 state noise margins
- **75** — Mismatch and seeded campaign planning
- **76** — Level-1 passport policy
- **77** — Physical Magic/Netgen Q4 cells
- **78** — 3D snap-build
- **79** — Semantic zoom
- **80** — 3D inspection
- **81** — Quantum/academy workspaces
- **82** — Module navigation
- **83** — Scene LOD
- **84** — Co-Inventor approval gate
- **85** — Stress/model diagnosis
- **86** — Versioned optimization
- **87** — Q4 model-based yield optimization
- **88** — Research provenance
- **89** — Custom ISA CPU
- **90** — TPU/ONNX functional model
- **91** — Forth virtual boot
- **92** — Hybrid noisy QPU
- **93** — FPGA/Yosys hardware bridge
- **94** — SCPI/sigrok capture
- **95** — GDSII packaged artifact
- **96** — Physical qualification fail-closed

## Phase 1+ — three explicitly OPEN frontiers

### Frontier 1 — Authentic SKY130 statistical PDK and foundry data

1. Obtain a legal, authentic, reproducible SKY130 processed source containing **active** mismatch/process random expressions, and trace every `.include` / `.lib` dependency through real SHA-256 manifests.
2. Verify both required statistical switches are enabled, ensure independent nonzero per-device variation under seeded ngspice execution and prove proper corner identity; *never reclassify nominal `tt` as Monte Carlo*.
3. Retain PDK SHA and primitive DRC/LVS/PEX evidence. Execute actual 4,000 Q4 primitive + 2,400 ALU multi-corner trials, then independently compute noise margins, timing, power, survival and Wilson 95% bounds.
4. Bind Stage O Phase 87 optimization to authenticated actual SPICE trials. Until then every optimizer benchmark is transparently **synthetic/model-based**, not calibrated yield.
5. Level-1 can change only with all acceptance thresholds satisfied. Level-2 stays `UNQUALIFIED_NO_GO` without physical signoff.

### Frontier 2 — Six physically verified hierarchical ALUs

1. Build **Binary / Ternary / Q4** each at 4 and 8 digits from source-bound primitive, routed cell and exact pin contracts.
2. Perform bottom-up Magic layout, metal escape routing and collision/2 µm halo checks **for six independent ALU top cells**.
3. Require **zero DRC**, terminal Netgen LVS **Circuits match uniquely**, unique top ports, genuine PEX RC netlists and hashes for each cell; model-built schematic candidates are not physical ALU evidence.
4. Only then update `nativeLvsMatch` with a verified result; never flip a source flag to fabricate passing silicon evidence.

### Frontier 3 — Hardware and system validation

1. Add opt-in live Qiskit hardware calibration streams and noisy-QPU measurement replay with provenance.
2. Extend virtual RISC-V machine beyond monitor/Forth proof-of-concept toward a **full Linux boot**, with independent QEMU/electrical references.
3. Collect raw FPGA/Yosys, SCPI oscilloscope, logic analyzer/sigrok and eventually silicon-wafer/physical-die evidence; verify device provenance, uncertainty and holdout measurements.
4. Upgrade each **specific design** to `PHYSICALLY_QUALIFIED` only after independent measurements and explicit human engineering authorization. No globally inherited pass.

## Release criteria and blocked claims

Software CI green means source tests passed, **not** foundry qualification. The pinned SKY130A model currently has no active statistical mismatch/functions in its audited selected closure; Level-1 must report `INSUFFICIENT_MODEL_DATA`, physical Level-2 `UNQUALIFIED_NO_GO`. See [verification ledger](docs/VERIFICATION_STATUS.md) and [continuation guide](docs/CONTINUATION_GUIDE.md).
