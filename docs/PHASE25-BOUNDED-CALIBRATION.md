# Phase 25 — measured device model discrepancy and honest uncertainty boundary

This phase **replays original measured silicon test-tile resistor data**, not
fictional samples. It source-locks the original 51-point SKY130HD test-tile
resistor sweeps for each of the two independently identified specimens from
Google/SkyWater's public raw-data repository, fixed Git commit
\`1f7214f2f81a0629303947a07e1ec00a28ae8a33\` and Git blob+SHA256.

The model is fitted **only** on specimen \`6208_1_2\`, one zero-intercept
Ohmic conductance. The second specimen \`6208_1_3\` is held out with no
refitting, model selection, or result-based tuning. The entire overlap is
[-0.25, +0.25] V, with all 51 holdout readings. The independent replay
reports current prediction bias, RMSE, maximum absolute error, and the
observed I1+I2 current-balance diagnostics in SI amperes. Those residual
statistics describe **this one measured specimen only**; even a perfect
zero balance is not a calibration certificate or traceable uncertainty budget.

**No statistical predictive interval is reported.** Treating the 51
correlated sweep points as 51 independent physical specimens would yield
false confidence. A single held-out specimen cannot support prediction
coverage on unseen wafers, manufacturing lots, or PVT corners; neither
can this resistor comparison calibrate a different ALU's delay.

Phase24 prospective ALU measurement intake remains **empty**. CI
independently reopens its original source-locked blank 1,024-vector
capture, verifies zero measured silicon observations, then recomputes
all Phase25 residuals directly from original provenance-checked MDM
bytes and frozen Phase25 acceptance rules. Altered original data,
measurements or fabricated physical-success flags fail closed.

Next required real-world experiment: build/source an actual ALU matching
the source/version-matched GDS, verify fabricated die provenance, collect
traceable raw instrument waveforms and temperatures/voltages/loads,
prespecify timing acceptance, acquire independent lot/wafer/temperature
holdouts, and ONLY THEN estimate uncertainty bounds with actual
independent observations. This cannot be obtained by software alone.

Physical verdict **UNKNOWN**; actual ALU hardware calibration **NOT
PERFORMED**; no manufacturing-success percentage is inferred.
