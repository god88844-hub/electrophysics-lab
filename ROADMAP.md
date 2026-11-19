# ROADMAP — all 96 phases, Stages A–Q

**Software milestone:** Phase 0 unifies the 96-phase research code and honest engineering evidence. This is NOT hardware qualification. Scope and acceptance remain in each phase's source/docs.

## Stage architecture

| Stage | Phases | Research scope |
| --- | --- | --- |
| A | 1–6 | Core labs, benchmarks, measurements, assembly |
| B | 7–12 | RISC-V and ONNX CPU references |
| C | 13–18 | SKY130 mapping, formal and OpenSTA analysis |
| D | 19–24 | Detailed routing, DRC/LVS, RC and source observations |
| E | 25–30 | Calibration, reliability and blind hardware holdouts |
| F | 31–36 | Physical modeling and original BLDC datasets |
| G | 37–42 | Independent provenance and hardware capture planning |
| H | 43–48 | Battery, wires, motor, fan and energy system models |
| I | 49–54 | Identifiability, uncertainty and physical ALU readiness |
| J | 55–60 | Admission, compiler co-simulation and accelerator calibration |
| K | 61–66 | Quantum noise, physical hardware sourcing and 3D systems |
| L | 67–72 | Security, reproducibility and source-bound releases |
| M | 73–77 | Native SKY130 Q4 and statistical fail-closed gate |
| N | 78–83 | 3D workbench and navigable learning |
| O | 84–88 | Human-approved AI Co-Inventor, synthetic optimization |
| P | 89–92 | Custom ISA, TPU, virtual computer, quantum reference |
| Q | 93–96 | Hardware bridge and physically unqualified evidence gates |

## Phase-by-phase index

| Phase | Stage | Source-scoped intent |
| ---: | :---: | --- |
| 1 | A | Core computing lab architecture |
| 2 | A | Independent ngspice/quantum benchmarks |
| 3 | A | [Measurement provenance and calibration foundations](docs/PHASE3-INTEGRITY-BOUNDARIES.md) |
| 4 | A | Canonical 3D workbench |
| 5 | A | Reusable module assemblies |
| 6 | A | Parametric nested modules |
| 7 | B | [DATA AND VALIDATION](docs/PHASE7-DATA-AND-VALIDATION.md) |
| 8 | B | [RV32M VALIDATION](docs/PHASE8-RV32M-VALIDATION.md) |
| 9 | B | [ONNX INFERENCE](docs/PHASE9-ONNX-INFERENCE.md) |
| 10 | B | [QUANTIZED ONNX](docs/PHASE10-QUANTIZED-ONNX.md) |
| 11 | B | [CONV AND PER AXIS](docs/PHASE11-CONV-AND-PER-AXIS.md) |
| 12 | B | [IRIS MODEL VALIDATION](docs/PHASE12-IRIS-MODEL-VALIDATION.md) |
| 13 | C | [PHYSICAL VALIDATION LADDER](docs/PHASE13-PHYSICAL-VALIDATION-LADDER.md) |
| 14 | C | [CONSTRAINED TIMING](docs/PHASE14-CONSTRAINED-TIMING.md) |
| 15 | C | [TT SENSITIVITY](docs/PHASE15-TT-SENSITIVITY.md) |
| 16 | C | [REAL PVT CORNERS](docs/PHASE16-REAL-PVT-CORNERS.md) |
| 17 | C | [MAPPED GATE VERIFICATION](docs/PHASE17-MAPPED-GATE-VERIFICATION.md) |
| 18 | C | [OPENROAD GEOMETRY](docs/PHASE18-OPENROAD-GEOMETRY.md) |
| 19 | D | [REAL DETAIL ROUTE RCX](docs/PHASE19-REAL-DETAIL-ROUTE-RCX.md) |
| 20 | D | [POSTROUTE PVT](docs/PHASE20-POSTROUTE-PVT.md) |
| 21 | D | [OPEN LAYOUT AUDIT](docs/PHASE21-OPEN-LAYOUT-AUDIT.md) |
| 22 | D | [FEOL POSTGDS FORMAL](docs/PHASE22-FEOL-POSTGDS-FORMAL.md) |
| 23 | D | [SKY130 PUBLISHED MEASUREMENTS](docs/PHASE23-SKY130-PUBLISHED-MEASUREMENTS.md) |
| 24 | D | [PROTOTYPE MEASUREMENT GATE](docs/PHASE24-PROTOTYPE-MEASUREMENT-GATE.md) |
| 25 | E | [BOUNDED CALIBRATION](docs/PHASE25-BOUNDED-CALIBRATION.md) |
| 26 | E | [MANUFACTURING VARIATION RELIABILITY](docs/PHASE26-MANUFACTURING-VARIATION-RELIABILITY.md) |
| 27 | E | [BLIND HARDWARE VALIDATION](docs/PHASE27-BLIND-HARDWARE-VALIDATION.md) |
| 28 | E | [ENGINEERING GO NOGO](docs/PHASE28-ENGINEERING-GO-NOGO.md) |
| 29 | E | [LAB EVIDENCE ATLAS](docs/PHASE29-LAB-EVIDENCE-ATLAS.md) |
| 30 | E | [RESEARCH SOFTWARE RELEASE](docs/PHASE30-RESEARCH-SOFTWARE-RELEASE.md) |
| 31 | F | [FIRST PRINCIPLES DECISIONS](docs/PHASE31-FIRST-PRINCIPLES-DECISIONS.md) |
| 32 | F | [RESEARCH PHYSICAL DATA](docs/PHASE32-RESEARCH-PHYSICAL-DATA.md) |
| 33 | F | [ORIGINAL BLDC RAW ANALYSIS](docs/PHASE33-ORIGINAL-BLDC-RAW-ANALYSIS.md) |
| 34 | F | [HEALTHY BLDC SPEED](docs/PHASE34-HEALTHY-BLDC-SPEED.md) |
| 35 | F | [HEALTHY BLDC DEVICES](docs/PHASE35-HEALTHY-BLDC-DEVICES.md) |
| 36 | F | [BLDC TWO REGIME MODEL](docs/PHASE36-BLDC-TWO-REGIME-MODEL.md) |
| 37 | G | [INDEPENDENT PHYSICAL AUDIT](docs/PHASE37-INDEPENDENT-PHYSICAL-AUDIT.md) |
| 38 | G | [INTEGRATION PREFLIGHT](docs/PHASE38-INTEGRATION-PREFLIGHT.md) |
| 39 | G | [REPRODUCIBLE SOURCE BASELINE](docs/PHASE39-REPRODUCIBLE-SOURCE-BASELINE.md) |
| 40 | G | [EVIDENCE PASSPORTS](docs/PHASE40-EVIDENCE-PASSPORTS.md) |
| 41 | G | [REFERENCE HARDWARE READINESS](docs/PHASE41-REFERENCE-HARDWARE-READINESS.md) |
| 42 | G | [INSTRUMENT CAPTURE PROTOCOL](docs/PHASE42-INSTRUMENT-CAPTURE-PROTOCOL.md) |
| 43 | H | [E91 BATTERY CONDITIONAL MODEL](docs/PHASE43-E91-BATTERY-CONDITIONAL-MODEL.md) |
| 44 | H | [COPPER WIRE CONTACT LOSSES](docs/PHASE44-COPPER-WIRE-CONTACT-LOSSES.md) |
| 45 | H | [MOTOR SOURCE CHARACTERIZATION](docs/PHASE45-MOTOR-SOURCE-CHARACTERIZATION.md) |
| 46 | H | [DIMENSIONLESS FAN AFFINITY](docs/PHASE46-DIMENSIONLESS-FAN-AFFINITY.md) |
| 47 | H | [COUPLED ENERGY CONSERVATION](docs/PHASE47-COUPLED-ENERGY-CONSERVATION.md) |
| 48 | H | [WHOLE SYSTEM INDEPENDENT MODEL AUDIT](docs/PHASE48-WHOLE-SYSTEM-INDEPENDENT-MODEL-AUDIT.md) |
| 49 | I | [IDENTIFIABILITY AND CALIBRATION](docs/PHASE49-IDENTIFIABILITY-AND-CALIBRATION.md) |
| 50 | I | [UNCERTAINTY AND HOLDOUT](docs/PHASE50-UNCERTAINTY-AND-HOLDOUT.md) |
| 51 | I | [RELIABILITY FAULT ANALYSIS](docs/PHASE51-RELIABILITY-FAULT-ANALYSIS.md) |
| 52 | I | [REFERENCE QUALIFICATION](docs/PHASE52-REFERENCE-QUALIFICATION.md) |
| 53 | I | [SKY130 SIGNOFF READINESS](docs/PHASE53-SKY130-SIGNOFF-READINESS.md) |
| 54 | I | [PHYSICAL ALU PROTOTYPE ACQUISITION](docs/PHASE54-PHYSICAL-ALU-PROTOTYPE-ACQUISITION.md) |
| 55 | J | [INDEPENDENT PROVENANCE](docs/PHASE55-INDEPENDENT-PROVENANCE.md) |
| 56 | J | [PHYSICAL ADMISSION](docs/PHASE56-PHYSICAL-ADMISSION.md) |
| 57 | J | [UNIFIED RELEASE READINESS](docs/PHASE57-UNIFIED-RELEASE-READINESS.md) |
| 58 | J | [COMPILER COSIMULATION](docs/PHASE58-COMPILER-COSIMULATION.md) |
| 59 | J | [ACCELERATOR SCHEDULER](docs/PHASE59-ACCELERATOR-SCHEDULER.md) |
| 60 | J | [ACCELERATOR PHYSICAL CALIBRATION](docs/PHASE60-ACCELERATOR-PHYSICAL-CALIBRATION.md) |
| 61 | K | [DENSITY MATRIX NOISE](docs/PHASE61-DENSITY-MATRIX-NOISE.md) |
| 62 | K | [QUANTUM HARDWARE ACQUISITION](docs/PHASE62-QUANTUM-HARDWARE-ACQUISITION.md) |
| 63 | K | [HIERARCHICAL 3D](docs/PHASE63-HIERARCHICAL-3D.md) |
| 64 | K | [CROSS DOMAIN](docs/PHASE64-CROSS-DOMAIN.md) |
| 65 | K | [PROJECT VERSIONING](docs/PHASE65-PROJECT-VERSIONING.md) |
| 66 | K | [DATA ONLY PLUGINS](docs/PHASE66-DATA-ONLY-PLUGINS.md) |
| 67 | L | [GUIDED WORKSPACES](docs/PHASE67-GUIDED-WORKSPACES.md) |
| 68 | L | [SCENE SCALABILITY](docs/PHASE68-SCENE-SCALABILITY.md) |
| 69 | L | [REPRODUCIBLE WEB PACKAGE](docs/PHASE69-REPRODUCIBLE-WEB-PACKAGE.md) |
| 70 | L | [SECURITY AUDIT](docs/PHASE70-SECURITY-AUDIT.md) |
| 71 | L | [UAT API FREEZE](docs/PHASE71-UAT-API-FREEZE.md) |
| 72 | L | [CROSS RUNNER](docs/PHASE72-CROSS-RUNNER.md) |
| 73 | M | SKY130 1.95 V device SOA |
| 74 | M | PDK provenance and model binding |
| 75 | M | Source-bound statistical trial contracts |
| 76 | M | Four-terminal device stress and ALU modeling |
| 77 | M | Four-cell native DRC/LVS/PEX |
| 78 | N | 3D snap and route |
| 79 | N | Multiscale semantic zoom |
| 80 | N | Instrumented logic and quantum overlays |
| 81 | N | Guided Academy missions |
| 82 | N | Scene scalability and rendering |
| 83 | N | Cross-runner 3D acceptance |
| 84 | O | Approval-gated AI Co-Inventor |
| 85 | O | Seeded topology search |
| 86 | O | Modeled engineering stress diagnosis |
| 87 | O | Synthetic yield optimization |
| 88 | O | Content-addressed invention ledger |
| 89 | P | Custom radix ISA and assembler |
| 90 | P | Modeled TPU/ONNX accelerator |
| 91 | P | Invented CPU with Forth monitor |
| 92 | P | Idealized quantum/classical feedback |
| 93 | Q | FPGA RTL and WebSerial |
| 94 | Q | SCPI/sigrok/oscilloscope acquisition |
| 95 | Q | Candidate GDSII export intake |
| 96 | Q | Physical qualification fail-closed trust |

## Phase 1+ frontier 1: real statistical PDK

Acquire licensed and independently authentic original process+mismatch models with active mc_mm_switch, mc_pr_switch and gauss/agauss expressions. Pin source commits, hash the full transitive include closure, reject nominal TT substitution and demonstrate seeded nonzero ngspice variability before any statistical qualification. Complete 4,000 primitive and 2,400 ALU source-authenticated PEX trials, threshold testing and Wilson 95% bounds. Stage O's seeded toy optimizer remains explicitly **synthetic/model-only** until calibration.

## Phase 1+ frontier 2: physically verified ALU integration

Create and route complete binary, ternary and Q4 ALUs at both four- and eight-digit widths. Place each child using its measured post-route bounding box and clearance halo, complete hierarchical metals and taps, then independently require **Magic DRC=0**, exact top-level **Netgen LVS unique** and full RC PEX for each of six ALUs. Hash each geometry/PEX/LVS artifact. Never set nativeLvsMatch=true just because the four primitive layouts passed.

## Phase 1+ frontier 3: experimental computing hardware

Extend from the bounded virtual Forth monitor to an independently verified full RISC-V Linux boot; from idealized Bloch/qudit state to live attributed Qiskit hardware streams; and from mock/read-only instrument parsers to real FPGA, SCPI/oscilloscope, sigrok and wafer-lot datasets. Require instrument calibration, independent holdout measurements, original provenance and trusted physical reviewers before any future PHYSICALLY_QUALIFIED decision. Keep Level-2 UNQUALIFIED_NO_GO until those gates pass.

Every frontier uses source-bounded design reviews, exact GitHub head-SHA CI and negative fail-closed tests. See [verification](docs/VERIFICATION_STATUS.md) and [continuation](docs/CONTINUATION_GUIDE.md).