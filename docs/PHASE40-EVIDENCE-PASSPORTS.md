# Phase 40 — Scientific evidence passports and model applicability

The pilot registry `benchmarks/phase40/model-registry.json` identifies the **actual modeling domain, device topology, part identity, original publisher commit, operating conditions, independent physical units and scientific limits** for three existing computing/electromechanical reference models.

`js/evidence/phase40-model-applicability.js` audits a structured proposed design against exact source identity and each dimensioned condition. A matching publisher test condition is **not** a qualification for a new manufacturing population. Missing conditions yield insufficient evidence; different motor/voltage/load returns incompatible; original illustrative DC fan results always remain illustrative. All outputs retain `physicalValidation=none`, `physicalVerdict=unknown`, `realWorldBuildSuccessPercent=null`.

This pilot contract is meant to be extended to all future domain models after their exact source and physical qualification are measured. It does not magically convert the catalog's older Phase 35/36 24 V motor with a hysteresis brake into a physically calibrated 3 V brushed fan. It does not attest laboratory calibration. Published PG tach data were independently analyzed in Phase 37, but only two physical motors were represented. Corresponding source plots and training split are preserved; fake evidence-count, instrument-certification and population-yield changes are blocked in regression tests.

Methods and rationale: [NASA-STD-7009B Standard for Models and Simulations](https://standards.nasa.gov/standard/NASA/NASA-STD-7009) (intended use and credibility) and [NIST's measurement uncertainty guide](https://www.nist.gov/publications/simple-guide-evaluating-and-expressing-uncertainty-nist-measurement-results). This implementation adopts useful principles, **not** a claim of formal standards compliance.

## Verification

```bash
node --test tests/phase40-model-applicability.test.mjs
npm test
node scripts/browser-smoke.mjs
```

New registry entries must be source-locked, unit-consistent and automatically rejected when metadata imply real hardware validation not established by matching real specimens and independently audited experiments. Legacy Phase30 historical pull-request policy is unchanged, so Phase40 is a draft, unmerged stacked PR. Next: choose identifiable physical reference hardware and design traceable acquisition.
