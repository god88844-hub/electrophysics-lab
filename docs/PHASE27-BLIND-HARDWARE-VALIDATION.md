# Phase 27 — prospective blind lot-level ALU validation design, NOT physical validation

The actual RTL of the 8-bit SKY130 ALU is frozen to Git blob
3a41d0163a473a00b17a7c4b1893169961519f54, and the Phase24
1,024-vector stimulus is frozen to SHA-256
c41a51ffcb1ffbbdc92e5668c98de176746b21ece709f9a235aee4484b23ab26.
A source-locked model output file is generated **before any silicon result
is available**, containing combinational bit patterns but NO per-vector
physical timing predictions and NO measured instrument readings.

## Planned future experiment
Eight **allocation slots, not existing physical chips** are arranged as
two future fabrication lots, each with two wafers and two dies per wafer.
The entire C-lot is for future training; the entire H-lot is a prospective
blind holdout. Each future die must be tested at 3 defined temperature/supply
conditions with 2 repeat runs and 1,024 digital inputs: **48 sessions and
49,152 readings planned, zero collected**. Repeat observations and
vectors within one chip or lot are NOT statistically independent wafers,
lot groups, or proof of general manufacturing yield.

Frozen exploratory criteria: zero digital bit/output disagreements and
20 ns maximum observed delay, which is **a study-defined check**, not
qualified foundry timing signoff. An independently measured timing error
relative to per-vector simulated delay cannot be computed because the
existing model supplies no such prediction. Timing measurement uncertainty,
load, slew, instrument certification and lab provenance must be independently
audited before results can be treated as physical evidence.

Future capture packets enforce the complete eight-die / 48-session / 49,152
reading topology, whole-lot holdout isolation, original raw instrument-byte
hash agreement, independent reviewer fields, valid calibration dates and
source design fingerprints. A hash copied from self-declared data is NOT
independent authentication; even deliberately perfect forged candidate
values retain physicalVerdict=unknown. No lab pre-registration review or
fabrication provenance has been independently established.

A future lab may run:
node scripts/phase27-assess.mjs capture.json /path/to/raw-instrument-files

## Current exact status
The only previous public physical readings are from two separate SKY130
resistors, not the ALU. The ALU has NO fabricated DUT records and ZERO
physical readings. This phase verifies a software acceptance and measurement
quality gate, **not simulation/physical equivalence**. It does not establish
real-world manufacturing success, statistical coverage or reliability.

Next is Phase28: physically grounded engineering go/no-go and calibrated
probability reporting, which must return BLOCKED/UNKNOWN until trustworthy
independent real ALU silicon data and predeclared acceptance thresholds exist.
