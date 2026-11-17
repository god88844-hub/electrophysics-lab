# Phase 48 — Independent whole-system mathematical audit and physical validation readiness

The **software validation milestone** is an independently reproducible five-case cross-language model comparison, not a source-matched actual system experiment. The requested **physical whole-system validation** remains **BLOCKED** because no specific impeller has been approved or measured, no assembled battery/wiring/motor/fan has been instrumented, and none of the real hardware sample, safety, calibration or holdout requirements can be marked complete.

## Independent numerical method

`scripts/phase47-run.mjs` replays the original manufacturer/source-scoped 3V hypothetical electromechanical–thermal midpoint model and verifies internal energy accounting. Phase48 `scripts/phase48-run.mjs` produces an additional five-case *mathematical* comparison:

- Fan torque C=0, 5×10⁻¹⁰, 10⁻⁹ Nm/(rad/s)² at hypothetical battery resistance 0.45Ω
- Fan torque C=10⁻⁹ at hypothetical battery resistance 0.30Ω and 0.60Ω

The **entirely separate Python standard-library implementation** `scripts/phase48-independent-rk4.py` integrates the same declared ordinary differential equations using RK4 at 0.5ms, compared with JavaScript's midpoint integration at 5ms. It independently recomputes original copper AWG24 geometry and Kirchhoff resistance, verifies all manifest source SHA256s, checks energy conservation directly from source/sink terms, compares speed (strict <1rpm) and lumped motor temperature (<0.02°C), verifies required reference fields, and refuses any claim of real physical qualification.

Agreement of two implementations of **the same assumed equations** tests numerical correctness, but does not prove that the equations accurately predict a real target motor/fan. Manufacturer approximate stall and no-load motor points do not supply real windings, inertia, friction, fan load coefficient, thermal capacity, battery pack discharge physics, or validated safe speed. The model cannot infer actual fan airflow/pressure or a physical success probability.

## Ten separate missing real-world evidence gates

The machine-readable policy `benchmarks/phase48/whole-system-readiness.json` lists ten missing physical prerequisites: actually purchased and uniquely identified parts, source instrument calibration, protective impeller containment, source current/thermal protection, matching battery/motor maps, actual fan pressure-flow and torque data, matched thermal traces, independent hardware holdouts, uncertainty budget, and preregistered acceptance protocol.

Until these are obtained through approved experiments, **physicalValidation=none**, **physicalVerdict=unknown**, and **realWorldBuildSuccessPercent=null**. The list is enforced by fail-closed adversarial tests: a researcher cannot mark a fake safety permit or fabricated measured samples as complete by changing a JSON status. Numerical validation is distinct from physical validation.

## Reproduction

```bash
node --test tests/phase48-whole-system-gate.test.mjs
python3 scripts/phase48-independent-rk4.py --self-test
node scripts/phase47-run.mjs
node scripts/phase47-strict.mjs
node scripts/phase48-run.mjs
python3 scripts/phase48-independent-rk4.py
npm test
node scripts/browser-smoke.mjs
```

Full CI runs this sequence and uploads the original source SHA and independent numerical audit. This is an internal research-source software release gate, not approval to spin an unverified high-speed impeller or manufacture hardware.

## Next after this work

Phases49–51: parameter identifiability, uncertainty propagation, leak-free real specimen holdout and fault/reliability qualification protocols. Real calibration and actual device probabilities remain contingent on safe tested hardware and authenticated source-matched measurements. Prior stacked draft PRs remain unmerged and AeroForge is not modified.
