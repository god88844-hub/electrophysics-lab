# Benchmark report — quantum (Qiskit + independent NumPy qudit reference)

Generated: 2026-11-15T17:29:17.090Z  ·  commit: `7dcfc1548caeb586a7202968a5514152c9ce6a87`  ·  node: v25.9.0  ·  win32 x64

**Engines:** ngspice: 47 · qiskit: 2.6.2 · numpy: independent reference (see per-case engine strings)

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