# PHASE 6 — Open Science + Hardware Bridge

## Sub-phase 6.1 — Built-In 30s Cinematic/Forensic Video Recorder
- 30-second cinematic camera fly-through recorder
- Forensic replay capture with slow-motion
- Output: WebM/MP4 with embedded metadata (simulation state, parameters, timestamp)

## Sub-phase 6.2 — Reproducible Open-Science Experiment Bundle Exporter
- Export a ZIP bundle containing: dataset JSON, calibration record, simulation results, envelope, report, all checksummed
- Reproducible: same seed → same bundle
- Import: re-run the experiment from the bundle

## Sub-phase 6.3 — Optional FPGA/SCPI/Cloud-QPU Lab Ingestion to Unlock Level-2 PHYSICALLY_QUALIFIED
- SCPI instrument control (Keysight/Rohde-Schwarz)
- FPGA bitstream upload for hardware-in-the-loop
- Cloud QPU ingestion (IBM Quantum, AWS Braket)
- This is the ONLY path to Level-2 PHYSICALLY_QUALIFIED — requires real hardware
