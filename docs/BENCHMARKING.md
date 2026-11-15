# Independent Benchmarking & Cross-Solver Validation (Phase 2)

Phase 2 answers a harder question than "do our tests pass":
**does an independent, established simulation engine produce the same numbers within a scientifically justified tolerance?**

The headline result of this phase (all reproducible via the commands below):

| Benchmark | Invention Lab | Independent reference | Verdict |
|---|---|---|---|
| Resistive divider (DC) | 4.9999999975 V | 5 V (Ngspice 47) | PASS |
| Current-source polarity | +1 V | +1 V (Ngspice 47) | PASS |
| RC transient (t = 0.5/1/2/3 τ) | ≤ 0.005 V deviation | Ngspice 47 + analytical | PASS |
| RC AC gain/phase (12 freqs) | ≤ 0.05 dB / 0.5° | Ngspice 47 + analytical | PASS |
| AC source with 90° phase | 3.01 dB / +45° | Ngspice 47 + analytical | PASS |
| RL step (DC + t = 0.5/1/2/3 τ) | ≤ 5e-4 A | Ngspice 47 + analytical | PASS |
| Diode operating points (3 biases) | ≤ 1e-4 V | Ngspice 47 + bisection | PASS |
| NMOS transfer sweep (11 pts) | ≤ 5e-4 A | Ngspice 47 Level-1 | PASS |
| PMOS sweep + terminal mapping | ≤ 5e-4 A | Ngspice 47 Level-1 | PASS |
| Combined nonlinear transient | ≤ 0.02 V RMS 0.01 | Ngspice 47 | PASS |
| Qubit state vectors (9 circuits) | < 1e-9 amplitude error | Qiskit 2.6.2 Statevector | PASS |
| Bell sampling (4000 shots) | within 4σ | exact Qiskit distribution | PASS |
| QFT-3 state vector | < 1e-9 | Qiskit 2.6.2 + analytic DFT | PASS |
| Qutrit/ququart gate sequences | < 1e-9 | independent NumPy reference | PASS |

**Evidence classification:** all of the above is **cross-solver agreement** (and analytical
agreement). It is **NOT model calibration** and **NOT physical validation** — no parameter has
been estimated from measured data and no measurement exists. The reports say so explicitly.

## Running it

```bash
# Linux (Ubuntu/Debian)
sudo apt-get install ngspice
pip3 install qiskit numpy
node js/bench/run.mjs --suite all

# Windows
#  - install Ngspice (installer or portable zip from SourceForge; the console
#    binary ngspice_con.exe is what we execute) — or set NGSPICE_EXEC
#  - python -m pip install qiskit numpy
node js/bench/run.mjs --suite all --ngspice "C:\Program Files\ngspice\bin\ngspice_con.exe"

# single suites
node js/bench/run.mjs --suite ngspice
node js/bench/run.mjs --suite quantum
```

Artifacts land in `benchmarks/evidence/`: `latest-ngspice.json`, `latest-quantum.json`,
`evidence-summary.json`, `REPORT.md`, plus raw deck/wrdata files for inspection.

Exit status: non-zero if any benchmark FAILED. Skipped benchmarks (engine missing) are
reported as skipped and are never counted as passes; CI's external-validation job installs
the engines so a skip there means real breakage and fails the job.

## Architecture

```
js/bench/
  compare.js             quantitative comparisons: abs/rel error (documented floors),
                         max/RMS series error, phase wrapping, global-phase-invariant
                         complex-amplitude comparison, tolerance checking
  harness.js             case schema, execution, verdict assembly, JSON+Markdown reports
  ngspice-adapter.js     real Ngspice process execution (batch mode, temp dirs, no shell,
                         timeouts, missing-binary detection) + output parsers
                         (.op prints, wrdata series) with malformed-output rejection
  quantum/quantum-runner.py   independent reference execution:
                         mode "qiskit" = real Qiskit Statevector (qubits);
                         mode "numpy"   = independently implemented NumPy qudit
                         reference (fresh matrix definitions, tensordot application)
  quantum/quantum-adapter.js  JSON protocol, process management, index-convention mapping
  cases/ngspice-cases.js the ten circuit benchmarks
  cases/quantum-cases.js the quantum benchmarks
  run.mjs                CLI: engine resolution (versions recorded), execution, artifacts
```

Benchmark cases follow one protocol: build the Invention Lab design → run the Invention Lab
engine → run the external engine on the **exported** artifact (deck / circuit description —
validating solver *and* exporter) → compare against analytical references and the external
engine → quantify and classify any difference.

### Status taxonomy

| Status | Meaning |
|---|---|
| `pass` | Invention Lab and the reference agree within the documented tolerance |
| `fail` | comparison exceeded tolerance, or an engine produced invalid data |
| `skipped` | benchmark did not run (engine missing) — **never counted as a pass** |
| `unsupported` | the benchmark targets explicitly unsupported behavior |
| `model-mismatch` | the engines implement genuinely different models; documented, not a bug |
| `inconclusive` | ran, but the comparison cannot decide (e.g. missing tolerance) |

## Model-equivalence notes (Ngspice Level-1 MOSFETs)

Ngspice's Level-1 model and Invention Lab's square-law model agree **only under documented
parameter mapping**, established in the benchmark cases:

- `KP·(W/L)` with `W = L = 1u` equals the internal `k` (transconductance scale);
- `VTO` ↔ `vth`, `LAMBDA` ↔ `lambda`;
- the internal engine applies `(1 + λ·Vds)` in saturation only, Ngspice Level-1 also applies
  it in the linear region — benchmarks touching the linear region use `LAMBDA = 0`, where both
  reduce to the same law;
- temperature: the diode benchmark pins both engines to T = 300.0 K via
  `.options temp=26.85 tnom=26.85` (SPICE options are Celsius; the internal model uses
  300 K exactly) so `Vt = k·T/q` and `Is` match with no temperature scaling.

Where the models genuinely differ, the comparison is classified as **model mismatch** —
tolerances are never quietly widened to make mismatches disappear.

## Ngspice output conventions (verified against ngspice-47)

- batch mode: `ngspice_con.exe -b -o run.log deck.cir`; command output (`.op` `print`) goes to
  the **log file**, not stdout — the adapter exposes both;
- `print v(n)` lines: `v(n_mid) = 2.500000e+00`;
- `wrdata file v(a) v(b)` writes interleaved (x, y) **column pairs**, one row per point;
- **`vp()` inside `wrdata` is in RADIANS** (while `print vp()` is degrees) — handled and
  documented in the adapter;
- inline `*` after an element line is NOT a comment in SPICE (the exporter now emits element
  comments on their own lines — a benchmark-caught exporter defect).

## Evidence stages (integration with reports)

Benchmark evidence feeds the existing validation-stage system (`js/core/validation.js`):

- **execution** — the requested analysis ran;
- **mathematical** — analytical identities and closed-form references;
- **crossSolver** — the benchmarks in this document (suite-level evidence);
- **model calibration** — `none`: no parameter estimated from measured data;
- **physical validation** — `none`: no independent experimental measurements exist.

Two honesty rules enforced everywhere:

1. **Suite-level ≠ design-level.** Agreement on the ten reference circuits does not transfer to
   an arbitrary user's circuit. Cross-solver evidence for a *user's own design* requires
   actually running that comparison (future work; the harness is designed to support it).
2. **Numerical agreement ≠ physical validation.** Ngspice and Qiskit are independent
   *numerical* references; no measurement data exists in this repository. The reports, the
   evidence summary, and the README all state this explicitly.

## Defects this phase has already found and fixed

Cross-solver benchmarking is not ceremony — during its first run it exposed and pinned down:

1. **Inductor transient NaN** (`runTransient` state update read the component *definition's*
   parameter-spec array instead of the block's actual parameters — NaN poisoned every RL
   solve). Found by Benchmark 6; regression: RL benchmark + unit suite.
2. **Non-unitary T gate** (`T = [[1,0],[0.707i, 0.707i]]` — wrong matrix, never covered by
   tests). Found by the quantum cross-check; regression: unit test + benchmark.
3. **Qiskit amplitude index mapping** double-counted the endianness convention and misaligned
   every non-symmetric state. Found by the swap-chain and QFT benchmarks.
4. **`runAC` with `points: 1`** produced NaN frequencies. Found by Benchmark 5.
5. **SPICE exporter inline comments** (`V ... DC 0 * comment`) are invalid SPICE syntax.
   Found by Benchmarks 8/9.

## Limitations

- Ngspice comparison covers DC, transient, AC (linear), and Level-1 MOSFET behavior at the
  documented operating points — not every possible circuit.
- Qiskit comparison covers pure-state qubit circuits; qudit cases use the NumPy reference
  (labelled as such, because Qiskit itself was not executed for them).
- Ngspice and Qiskite are not shipped with the repository; the harness detects, versions, and
  honestly reports their absence. CI installs them.
