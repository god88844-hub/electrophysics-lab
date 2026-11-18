# Simulation-linked 3D experiment instruments — next engineering layer

## Why this exists

The first 3D workbench upgrade created visual representations of electronic modules. This iteration connects its **existing** simulation engines to live-on-screen instrument readings and replay, with no separately invented physics or electrical results.

## Workflow

1. Open Logic, Chip or Quantum Lab; build or load a real component design and wire its ports.
2. Select 3D View. Press the normal **Run** button. The application runs the canonical lab solver, not a second graphics-only engine.
3. The 3D instrument panel shows the result scope: model/analysis, source sample count, the simulated timeline position and readings from probes/instruments. A matching block can display its numeric result above the model.
4. Drag the sample scrubber or press Play for a **visual time-lapse** across recorded solver samples. This is not physical real-time hardware playback.
5. Save experiment JSON. The exported record contains the exact design JSON, bounded simulated signals and explicit uncertainty/validation limitations. Editing a design or changing its parameters invalidates the previous trace; run again to obtain current evidence.

## Supported signal mappings

- **Logic:** recorded probe event values (radix digits or Z), with event ticks from the logic engine.
- **Chip DC:** voltmeter/ammeter readings (V/A), and computed element power (W) from the Chip engine.
- **Chip transient:** computed meter and power time series against simulated seconds.
- **Chip AC:** calculated meter magnitudes across the solved frequency sweep (Hz), not instantaneous voltage or waveform phase reconstruction.
- **Quantum:** exact **theoretical** probabilities of the simulator's ideal state displayed as percentages, plus the run's declared shot count. The results are not observed physical qubit fidelities.

No new equation, calibration source, hardware data, device certification, or manufacturing yield has been introduced by this visualization feature.

## Safety and provenance boundaries

The trace is bound to a serialized snapshot of the canonical design and cleared after edits. At most 512 time samples and 80 tracks are included. Invalid numeric values or incomplete series fail rather than being displayed as credible measurements. A source edit prohibits exporting stale results. Output explicitly states `physicalValidation: none` and `realWorldBuildSuccessPercent: null`. No independently qualified physical-operating envelope is asserted. The exported source snapshot is sufficient to reconstruct the design, but the archive is not an independently source-version-pinned solver executable or a physical measurement certificate.

## Next major work to reach the user's long-term project objective

Add manufacturable component dimensions, materials and datasheets, calibrated coupled-electrical/thermal/mechanical models, external solver integrations, reference experiments and independent discrepancy testing. Then connect validated design envelopes and uncertainty estimates to an engineering confidence passport. More realistic rendering alone cannot create physical evidence.

## Local verification

On Windows in the repo folder: `git pull origin main`, `npm test`, `npm start`. Open `http://127.0.0.1:8080`; select an example, switch to 3D View, press Run, inspect playback and export. The tests include a dedicated Windows case and browser WebGL smoke.
