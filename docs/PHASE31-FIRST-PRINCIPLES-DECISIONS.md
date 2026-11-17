# Phase 31 — first-principles near-physical predictive evidence

The primary research goal is to make simulation evidence useful for
the same clearly specified engineering decisions as physical validation
where calibrated predictive error, the actual uncertainty and intended
operating envelope support that decision.

**Computed virtual evidence IS evidence about the modeled physical system.**
It cannot be re-labelled an observation of the actual built system,
especially when input data, manufacturing defects or model discrepancy
are unknown. Conditional percentages under stated assumptions are
legitimate *modeled* probabilities, not empirically calibrated build yield.

## Decompose the battery + two wires + fan into laws

1. Battery: open-circuit voltage V and battery/source resistance Rs.
2. Wires: total two-wire resistance Rw, copper loss I²Rw and contact limits.
3. Brushed DC motor: ideal SI motor constant Kt=Ke=K; current
   I=(V-K*ω)/(Rs+Rw+Rm), torque K*I, counter EMF K*ω.
4. Fan: static startup torque and modeled running load
   Tload=Tf + kfan*ω².
5. Integrated equilibrium: motor torque = running load torque; current,
   RPM, copper loss and initial stall torque are computed. Numerically
   verify power balance: V*I = I²*(Rs+Rw+Rm) + K*I*ω.
6. Acceptance: min RPM, max motor current and successful startup.
   Variation in each assumed parameter is explicitly declared, using a
   seeded independent Gaussian *hypothesis*, NOT actual factory statistics.
7. Model discrepancy: optional user-assumed bound on RPM changes the
   pessimistic/optimistic conditional success percentages. Missing a
   calibrated bound cannot silently imply model accuracy.
8. Evidence: bounded formula correctness, input distribution assumptions,
   source hashes, operating envelope, measured model discrepancy if available,
   independent hardware validation, and actual defects kept separately.

## Reported numeric outputs and their limitations

- Nominal electrical/torque model outputs and a **conditional modeled
  success percentage** for 5,000 numerical samples.
- A 95% interval on the *Monte Carlo estimate* only, NOT a physical
  prediction interval, calibrated model uncertainty or foundry yield.
- If a hypothetical speed model-error allowance is provided, an
  adverse-direction robust-pass fraction and a favorable possible-pass
  fraction. They apply only under the user's stated hypothetical bound.
- Actual target-specific physical measurements: 0. Estimated
  real-world build-success percent: null; physical verdict: unknown.

This uses a constant-resistance battery, wires and ideal brushed DC
motor with steady-state quadratic fan drag. It does NOT model BLDC
controllers, transient acceleration/inertia, thermal equilibrium,
battery depletion/chemistry, fan blade flow maps, contact faults,
electromagnetic interference, assembly defects, reliability or aging.
Those missing physical mechanisms remain separate risks.

In the **Chip Lab → Build Evidence** panel, use the new illustrative
fan model to adjust voltage, input variation, minimum RPM, current limit
and optional assumed RPM error. The UI always identifies the scenario
as *not the active circuit diagram* and never presents the result as
measured product manufacturing success.

The computational model and its tests are consistent with the importance
of verification, validation and uncertainty quantification described by
ASME VVUQ (https://www.asme.org/codes-standards/publications-information/verification-validation-uncertainty)
and model-credibility guidance NASA-STD-7009
(https://standards.nasa.gov/node/263). Neither source certifies our
implementation or implies universal simulation/hardware equivalence.

## How to advance toward decision-equivalent simulation

Authenticate component specifications and independently measured
test-bench datasets, fit *only* training specimens, preserve blind
holdout prototypes, quantify residuals and validation uncertainty,
model correlations and failures, test source-specific applicability
across load, temperature and time, and only then qualify *specific*
engineering decisions. Internal R&D can use modeled conditional success
now; physical manufacturing release needs additional proof.

No new fabricated fan or ALU measurements have been made by this
software phase. The project's genuine silicon validation blocker remains.

Run: node --test tests/phase31-first-principles.test.mjs
Run: node scripts/phase31-run.mjs
Run: node scripts/phase31-strict.mjs
Run: node scripts/browser-smoke.mjs
