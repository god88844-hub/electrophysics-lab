# Phase 23: real published SKY130 resistor measurements; no fabricated ALU evidence

## Actual external measured source, device scope and original license
The **public measurement data**, not a simulated current sweep, are fetched
from the Google/SkyWater raw-data repository at immutable commit
\`1f7214f2f81a0629303947a07e1ec00a28ae8a33\`. The upstream README
attributes the measurements to **CoolCAD Electronics LLC** under contract,
using a **SkyWater manufacturing test tile**. Original archive uses IC-CAP
MDM format and declares Apache-2.0 license.

Two *different physical test-structure identifiers*, \`6208_1_2\` and
\`6208_1_3\`, both nominally \`pplus_poly_res_w0p69_l0p345_sq0p5\`,
provide independently recorded bipolar V1 / I1 / I2 curves. Each raw
instrument-export MDM file is checked against its exact **Git blob SHA-1,
byte length and original pinned repository commit**. Original bytes,
metadata and derived evidence are archived. Identifiers alone do NOT
establish independently verified wafer/lot membership, uncertainty budgets,
measurement certification or instrument calibration traceability.

## Preliminary, explicitly bounded empirical comparison
Use the 51-point first specimen to fit a *single zero-intercept Ohmic
conductance parameter*, then predict the second **unseen** specimen's
I1 measurements only within the training sweep voltage envelope.
Report holdout points, absolute RMSE, full-scale normalized RMSE, and
parameter. There is **no fitted second-specimen data**, no model
selection based on validation errors, no prespecified engineering acceptance
threshold, and no statistical claim that two specimens characterize
process variation. Do not extrapolate beyond the voltage envelope. This
is a limited **device-level descriptive comparison**, not credible chip
yield, validated ALU timing, or universally reliable simulation.

## Integration of the previously unmerged Phase3 measurement modules
Phase23 reuses the tested measurement-provenance, calibration,
uncertainty propagation, heldout split and envelope infrastructure from
the independent open [Phase3 PR](https://github.com/god88844-hub/invention-lab/pull/3),
with its original tests preserved. Phase3's instrument receipt checks
verify file integrity but *do not prove instrument calibration, the
independence of an experiment, or wafer provenance*. The MDM sweep
parser has separate checks because its independent variable V1 is
a **voltage**, not a time-series timestamp.

## Critical physical limitations
Missing independent proof of a calibration chain, a complete
measurement uncertainty budget, operating temperatures, manufacturing
wafer/lot metadata, standardized sample protocol, predeclared
qualification threshold and sufficiently large held-out sample
population. These real resistor samples do **not** measure the ALU used
in Phases13–22. Therefore the ALU physicalValidation stage is
**none**; physicalVerdict remains **unknown**; chip build-success
percentage is **null**, regardless of source-blob and test success.

Next step: acquire measured ALU prototype outputs, voltage/current/timing
under known PVT and environmental conditions with traceable instruments;
independent batch/wafer holdouts, predeclared pass criteria, calibration
and uncertainty budget. No trustworthy software-only substitute exists.
