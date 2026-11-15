# Invention Lab — independent benchmarking report

Generated 2026-11-15T18:33:42.686Z · commit `308ba242671511f201aa9f15e9a6134f912e179d` · node v25.9.0

Engines: ngspice=unavailable · qiskit=2.6.2 · numpy=independent reference (see per-case engine strings)

# Benchmark report — ngspice (external circuit simulator)

Generated: 2026-11-15T18:33:25.148Z  ·  commit: `308ba242671511f201aa9f15e9a6134f912e179d`  ·  node: v25.9.0  ·  win32 x64

**Engines:** ngspice: unavailable · qiskit: 2.6.2 · numpy: independent reference (see per-case engine strings)

**Summary:** 10 cases — 0 pass · 0 fail · 10 skipped · 0 unsupported · 0 model-mismatch · 0 inconclusive

> A skipped case is missing evidence, not a pass — skipped cases are never counted as a pass. Agreement with an independent numerical solver is cross-solver evidence, not physical validation.

| Case | Status | Classification | Detail |
|---|---|---|---|
| ngspice-divider | **skipped** | reference-unavailable | Ngspice executable not found — benchmark NOT executed and NOT counted as a pass. See docs/ |
| ngspice-isource-polarity | **skipped** | reference-unavailable | Ngspice executable not found — benchmark NOT executed and NOT counted as a pass. See docs/ |
| ngspice-rc-transient | **skipped** | reference-unavailable | Ngspice executable not found — benchmark NOT executed and NOT counted as a pass. |
| ngspice-rc-ac | **skipped** | reference-unavailable | Ngspice executable not found — NOT executed, NOT counted as a pass. |
| ngspice-ac-phase | **skipped** | reference-unavailable | Ngspice not found — NOT executed. |
| ngspice-rl | **skipped** | reference-unavailable | Ngspice not found — NOT executed. |
| ngspice-diode | **skipped** | reference-unavailable | Ngspice not found — NOT executed. |
| ngspice-nmos | **skipped** | reference-unavailable | Ngspice not found — NOT executed. |
| ngspice-pmos | **skipped** | reference-unavailable | Ngspice not found — NOT executed. |
| ngspice-combined | **skipped** | reference-unavailable | Ngspice not found — NOT executed. |

## Case details

### ngspice-divider — Resistive voltage divider (DC)

10 V across two 1 kOhm resistors. All three evidence sources must agree at 5.000 V: Invention Lab DC solver, Ngspice .op on the EXPORTED deck, and the analytical result.

*Tolerance rationale:* abs 1e-6 V: the network is linear and both solvers are direct eliminations; remaining differences are double-precision roundoff only.
*Model note:* Ideal resistors and sources. Both engines include gmin = 1e-12 ground leakage (SPICE default); it loads the midpoint by ~2.5e-9 V, so the analytical comparison uses abs 1e-7 V to cover the documented model choice rather than pretending both solvers are ideal-free.
- note: Ngspice executable not found — benchmark NOT executed and NOT counted as a pass. See docs/BENCHMARKING.md for installation.

### ngspice-isource-polarity — Current source polarity and exported orientation

1 mA source delivering current out of terminal p into a 1 kOhm resistor must give +1 V in the internal solver, in the exported SPICE deck, and analytically. Verifies terminal convention end-to-end.

*Tolerance rationale:* abs 1e-6 V: linear network, direct elimination.
*Model note:* Internal convention: the source delivers i out of terminal p. SPICE draws current from n+ through the source; the exporter swaps node order to preserve the physical behavior. This benchmark proves the swap is correct.
- note: Ngspice executable not found — benchmark NOT executed and NOT counted as a pass. See docs/BENCHMARKING.md for installation.

### ngspice-rc-transient — RC step response (transient, backward Euler vs Ngspice vs analytical)

R=1 kOhm, C=100 nF, 0-to-5 V step (pulse train with first half-cycle high). Analytical tau = 100 microseconds. Compare the capacitor voltage at t = 0.5, 1, 2, 3 tau against Ngspice and the closed-form solution.

*Tolerance rationale:* abs 0.005 V IL-vs-Ngspice (both integrators converged well below signal scale); abs 0.01 V IL-vs-analytical covers the documented O(dt) error of backward Euler at dt = tau/500. Rise-time caveat: Ngspice uses a 1 ns PWL rise (analytical assumes an ideal step); both are settled long before the first sample at 50 microseconds.
*Model note:* No UIC on either side: both start from the operating point with the source at 0 V, so vC(0) = 0 matches the declared initial condition.
- note: Ngspice executable not found — benchmark NOT executed and NOT counted as a pass.

### ngspice-rc-ac — RC low-pass AC frequency response (gain and phase across the sweep)

R=1 kOhm, C=100 nF, 1 V AC drive. Compare gain (dB) and phase (degrees) at twelve explicit frequencies spanning 100 Hz to 1 MHz against Ngspice and the analytical H(f) = 1/(1 + jf/fc), fc = 1591.55 Hz.

*Tolerance rationale:* gain abs 0.05 dB and phase max 0.5 degrees: both AC solvers are linear complex eliminations; residual differences come from interpolation of the dense Ngspice sweep (200 pts/decade) and double-precision roundoff.
*Model note:* wrdata writes vp() in RADIANS (verified against ngspice-47) — the adapter converts to degrees. Internal AC phase uses atan2 in degrees.
- note: Ngspice executable not found — NOT executed, NOT counted as a pass.

### ngspice-ac-phase — AC source with 90-degree phase (magnitude and phase at the cutoff frequency)

2 V AC source at +90 degrees drives the RC network; the capacitor voltage at fc = 1591.55 Hz must be |Vc| = 1.4142 V at +45 degrees. Verifies that the internal phase convention, the exported "DC 0 AC 2 90" syntax, and both complex solvers agree after unit normalization.

*Tolerance rationale:* magnitude abs 0.01 dB, phase max 0.5 degrees: linear complex analysis in both engines.
*Model note:* SPICE AC phase is specified in DEGREES on the V line; the internal solver stores radians — the exporter converts. wrdata returns vp in radians; the adapter converts back.
- note: Ngspice not found — NOT executed.

### ngspice-rl — RL step response (DC and transient)

R=100 Ohm in series with L=1 mH driven by a 0-to-5 V step. tau = L/R = 10 microseconds. Compare the inductor current at DC and at t = 0.5, 1, 2, 3 tau against Ngspice and the analytical (V/R)(1 - e^(-t/tau)).

*Tolerance rationale:* abs 5e-4 A (1% of the 50 mA final value) covers backward-Euler O(dt) error at dt = tau/200 and the 1 ns source rise time in Ngspice; the DC comparison uses abs 1e-6 A.
*Model note:* Series ammeter is exported as a 0 V source; its branch current is read from wrdata as i(v<ammeter>).
- note: Ngspice not found — NOT executed.

### ngspice-diode — Diode operating points at three bias levels (temperature-matched)

Shockley diode (Is=1e-12, n=1) fed from 5 V through 1 kOhm, repeated at Vs = 3, 5, 10 V. Compare diode voltage against Ngspice and a bisection reference of the same equation. Temperature matched at T = 300.0 K via .options temp/tnom = 26.85 C so both engines use Vt = k*300/q exactly.

*Tolerance rationale:* abs 1e-4 V: Newton tolerance in both engines is far tighter (1e-9); gmin-style leakage conductance contributes < 1e-11 A here; the residual budget covers SPICE reltol=1e-3 propagating through the node voltage.
*Model note:* Both engines: Shockley equation I = Is*(exp(V/nVt) - 1), n=1, Is=1e-12, no series resistance, no breakdown. Temperature: 300.0 K on both sides (documented .options). The bisection reference is an independent numerical root-finder, not the same Newton implementation.
- note: Ngspice not found — NOT executed.

### ngspice-nmos — NMOS transfer curve (saturation sweep) and linear-region point

Sweep Vgs 0..5 V at Vds=5 V (all points saturated): drain current via a series ammeter, Invention Lab dcSweep vs Ngspice .dc on the exported deck. Plus a linear-region point (Vgs=3, Vds=1, LAMBDA=0).

*Tolerance rationale:* series maxAbs 5e-4 A (0.5% of the 95 mA full-scale current): both engines implement the same Level-1 square law with W/L=1; the residual covers Newton/reltol differences. The linear-region point uses abs 1e-6 A because with LAMBDA=0 the two models reduce to identical equations.
*Model note:* Model equivalence (documented): KP*(W/L) with W=L=1u equals the internal k; VTO maps to vth; LAMBDA maps to lambda. W and L are declared as 1u/1u on the M line.
*Model note:* The internal engine applies (1+lambda*Vds) in saturation only; Ngspice Level-1 applies it in the linear region too. Benchmarks touching the linear region therefore use LAMBDA=0, where both reduce to the same law — a documented model nuance, not a hidden tolerance change.
*Model note:* Both sides: no body effect (bulk tied to source), no capacitances (DC analysis).
- note: Ngspice not found — NOT executed.

### ngspice-pmos — PMOS conducting point and gate sweep (terminal mapping + model equivalence)

PMOS (k=0.02, Vth=-2, lambda=0.01) with source at 5 V, drain via 1 kOhm to ground, gate swept 0..5 V. Verifies exported drain/gate/source/bulk mapping, the negative threshold sign, current direction, and dissipation agreement.

*Tolerance rationale:* series maxAbs 5e-4 A (0.5% of full scale): same Level-1 law with mapped parameters; dissipation abs 2e-5 W on ~4e-4 W (5%) reflects the drain-voltage difference between the engines at the swept gate bias.
*Model note:* Exported M line: drain gate source bulk = internal d g s s. SPICE PMOS with VTO=-2 conducts when Vgs < VTO — the same sign convention as the internal square-law model.
*Model note:* Current direction: we compare |Id| (direction is separately verified by the polarity benchmark and the internal out-of-node convention tests).
- note: Ngspice not found — NOT executed.

### ngspice-combined — Combined nonlinear circuit: sine source, R-C divider, diode clamp

Sine 2 V amplitude + 3 V offset at 1 kHz drives R1=1 kOhm into a node carrying C=100 nF to ground, R2=500 Ohm to ground, and a diode (Is=1e-12, n=1) clamping to ground. The diode conducts near the sine peaks, exercising nonlinear interaction. Compare the node voltage at 20 sample points over two periods.

*Tolerance rationale:* maxAbs 0.02 V and RMS 0.01 V (1-2% of signal): backward Euler (internal, dt=20us) vs Ngspice trapezoidal integration differ at O(dt) on a smooth waveform; temperature matched at 300 K for the diode; residual differences are documented discretization effects, not model mismatches.
*Model note:* All elements supported on both sides. The diode enters forward conduction near waveform peaks (both engines must show the same clamped shape).
- note: Ngspice not found — NOT executed.
# Benchmark report — quantum (Qiskit + independent NumPy qudit reference)

Generated: 2026-11-15T18:33:42.679Z  ·  commit: `308ba242671511f201aa9f15e9a6134f912e179d`  ·  node: v25.9.0  ·  win32 x64

**Engines:** ngspice: unavailable · qiskit: 2.6.2 · numpy: independent reference (see per-case engine strings)

**Summary:** 14 cases — 14 pass · 0 fail · 0 skipped · 0 unsupported · 0 model-mismatch · 0 inconclusive

> A skipped case is missing evidence, not a pass — skipped cases are never counted as a pass. Agreement with an independent numerical solver is cross-solver evidence, not physical validation.

| Case | Status | Classification | Detail |
|---|---|---|---|
| quantum-basis-identity | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-hadamard-all | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-pauli-sequence | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-phase-gates | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-cnot-bell | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-swap-chain | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-rx-ry-rz | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-ghz-3 | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-dj-balanced | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass |
| quantum-qft-3 | **pass** | pass | max |amplitude| error vs Qiskit (global phase normalized): pass; max |amplitude| error vs analytic DFT of |1>: pass |
| quantum-bell-sampling | **pass** | pass | exact probabilities (via state vectors, global phase normalized): pass; sampled P(00) consistent with exact distribution |
| qudit-qutrit-shift-fourier | **pass** | pass | max |amplitude| error vs numpy (after global phase): pass; max probability error vs numpy: pass |
| qudit-ququart-sum | **pass** | pass | max |amplitude| error vs numpy (after global phase): pass; max probability error vs numpy: pass |
| qudit-cross-check-qubits | **pass** | pass | max |amplitude| error vs qiskit (after global phase): pass; max probability error vs qiskit: pass; max |amplitude| error |

## Case details

### quantum-basis-identity — Basis state |000> (identity preparation)

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-hadamard-all — Hadamard on 3 qubits

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-pauli-sequence — Pauli X/Y/Z sequence

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-phase-gates — S, T and PHASE(pi/6) mixture

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-cnot-bell — Bell state (H + CNOT)

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-swap-chain — SWAP chain across 3 qubits

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-rx-ry-rz — Rotation gates Rx/Ry/Rz with non-trivial angles

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-ghz-3 — GHZ-3 (H + CNOT chain)

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs qiskit — {"absErr":0,"relErr":0}
- note: vs qiskit: global phase 0.000000 deg

### quantum-dj-balanced — Deutsch-Jozsa (balanced oracle as explicit CX gates; 2 inputs + ancilla)

Full complex state-vector comparison against Qiskit Statevector (global phase normalized, index conventions mapped). 

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":6.734631938767465e-18,"relErr":0.0000067346319387674655}
- **PASS** max probability error vs qiskit — {"absErr":4.5355267350666824e-35,"relErr":4.535526735066682e-23}
- note: vs qiskit: global phase 0.000000 deg

### quantum-qft-3 — QFT on |1> — H + controlled phases + swaps vs Qiskit Statevector and direct DFT

Build the standard 3-qubit QFT circuit from its gate list (H, controlled phase rotations, SWAPs), run it on Invention Lab and Qiskit, and compare full state vectors. Additionally compare against the analytic DFT of |1>.

*Tolerance rationale:* max amplitude error < 1e-9 after global-phase normalization (double precision unitary products); controlled-phase construction must match between the engines exactly.
*Model note:* Controlled phases are expressed as CP gates in both engines; the index-order mapping is bit-reversal, identical to the other qubit cases.
- **PASS** max |amplitude| error vs Qiskit (global phase normalized) — {"absErr":2.7755575615628914e-17,"relErr":0.000027755575615628914}
- **PASS** max |amplitude| error vs analytic DFT of |1> — {"absErr":1.2412670766236366e-16,"relErr":0.00012412670766236367}
- note: global phase: 0.000000 deg

### quantum-bell-sampling — Bell-state measurement statistics (seeded sampler vs exact Qiskit distribution)

Sample the Bell circuit 4000 times on Invention Lab (seeded mulberry32). The independent reference is the EXACT distribution from Qiskit Statevector — no RNG-vs-RNG sequence comparison is demanded; sampled counts must be consistent within 4 sigma of the binomial bound.

*Tolerance rationale:* exact probabilities: abs 1e-9 (same unitary). Sampled counts: |p_sampled - p_exact| <= 4*sqrt(p(1-p)/N) — a statistically justified two-sided bound.
*Model note:* Invention Lab samples with mulberry32(seed); the exact distribution comes from Qiskit. No shared RNG, no shared stream.
- **PASS** exact probabilities (via state vectors, global phase normalized) — {"absErr":0,"relErr":0}
- **PASS** sampled P(00) consistent with exact distribution (4 sigma) — {"z":1.3914021704740742} — 1956/4000 samples, z=1.39
- **PASS** sampled P(01) consistent with exact distribution (4 sigma) — {"z":0} — 0/4000 samples, z=0.00
- **PASS** sampled P(10) consistent with exact distribution (4 sigma) — {"z":0} — 0/4000 samples, z=0.00
- **PASS** sampled P(11) consistent with exact distribution (4 sigma) — {"z":1.3914021704741022} — 2044/4000 samples, z=1.39
- **PASS** concurrence agrees with Qiskit state (C=1 for Bell) — {"absErr":2.220446049250313e-16,"relErr":2.220446049250313e-16}
- note: global phase: 0.000000 deg

### qudit-qutrit-shift-fourier — Qutrit (d=3): SHIFT + Fourier + Phase_k + SUM on 2 qudits

Full complex state-vector comparison against the independent NumPy qudit reference (global phase normalized, index conventions mapped). Verifies mod-d arithmetic and tensor conventions against the independent NumPy reference.

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qudit reference: independent NumPy tensordot implementation (axis 0 = q0) with fresh matrix definitions; labelled "independent mathematical reference agreement", NOT Qiskit validation.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs numpy (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs numpy — {"absErr":0,"relErr":0}
- note: vs numpy: global phase 0.000000 deg

### qudit-ququart-sum — Ququart (d=4): |2>|1> through SUM -> |2>|3>

Full complex state-vector comparison against the independent NumPy qudit reference (global phase normalized, index conventions mapped). Qudit adder arithmetic: (2+1) mod 4 = 3.

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qudit reference: independent NumPy tensordot implementation (axis 0 = q0) with fresh matrix definitions; labelled "independent mathematical reference agreement", NOT Qiskit validation.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs numpy (after global phase) — {"absErr":0,"relErr":0}
- **PASS** max probability error vs numpy — {"absErr":0,"relErr":0}
- note: vs numpy: global phase 0.000000 deg

### qudit-cross-check-qubits — Reference cross-validation: H+CNOT+T circuit through Qiskit AND the NumPy reference

Full complex state-vector comparison against Qiskit Statevector AND the independent NumPy qudit reference (global phase normalized, index conventions mapped). If NumPy and Qiskit agree on a circuit both can compute, the NumPy reference implementation is validated for the qudit cases that Qiskit cannot express.

*Tolerance rationale:* max |amplitude| error after global-phase normalization < 1e-9: all engines compute the same unitary product in double precision; anything larger indicates a convention or implementation defect.
*Model note:* Qubit ordering: Qiskit little-endian (qubit 0 = LSB) vs Invention Lab q0-most-significant — resolved by index bit-reversal, then amplitudes compared element-wise.
*Model note:* Global phase is physically irrelevant: the comparison reports the phase it removed instead of reporting a false disagreement.
- **PASS** max |amplitude| error vs qiskit (after global phase) — {"absErr":1.1102230246251565e-16,"relErr":0.00011102230246251565}
- **PASS** max probability error vs qiskit — {"absErr":1.1102230246251565e-16,"relErr":0.00011102230246251565}
- **PASS** max |amplitude| error vs numpy (after global phase) — {"absErr":7.850462293418875e-17,"relErr":0.00007850462293418875}
- **PASS** max probability error vs numpy — {"absErr":1.1102230246251565e-16,"relErr":0.00011102230246251565}
- note: vs qiskit: global phase 0.000000 deg
- note: vs numpy: global phase -0.000000 deg

## Evidence-stage summary

- **Cross-solver agreement**: partial (14/24 cases passed) — Cross-solver agreement applies to the BENCHMARK SUITE cases only — it does not transfer to arbitrary user designs (see docs/BENCHMARKING.md §evidence).
- **Model calibration**: none — no parameter has been estimated from measured data.
- **Physical validation**: none — agreement with an independent numerical solver is not physical validation.