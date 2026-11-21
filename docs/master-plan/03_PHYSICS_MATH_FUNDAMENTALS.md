# Physics & Math Fundamentals (v4 Lock — Complete Solver Specification)

Every equation, unit, numerical scheme, stability bound, and CI-oracle
tolerance needed to implement the kernel. **Builders never guess.** Constants
cite `data/reference-library/*.json` (SHA-256 verified) — this document adds
the math, not new constants.

Global SI units: V, A, Ω, F, H, s, K (temperature internally Kelvin, displayed
°C where noted), m (lengths in µm/mm/cm per workspace unit).

## 1. Electro-Thermal & Semiconductors

### 1.1 MNA (Modified Nodal Analysis)

- Unknowns `x = [v₁..v_{n−1}, i_V1..i_Vm]`; ground node fixed at 0.
- KCL residual at every non-ground node; branch equations `v_a − v_b − V·s = 0`
  for voltage sources (`s` = source-stepping scale).
- Linear stamps: resistor `i = (v_a−v_b)/R`; current source `i` leaves node a;
  voltage source branch current enters KCL at node a, exits at node b.
- Solve: Gaussian elimination with partial row pivoting (row swaps do not
  reorder unknowns). Tolerance ‖F‖∞ < 1e-9.

### 1.2 Nonlinear iteration

- **Newton–Raphson** with a numeric Jacobian (forward differences,
  h = max(1e-7, |x_j|·1e-7)) — immune to hand-derived stamp bugs; the gmin
  term is folded into the residual so Jacobian and residual stay consistent.
- **Damped steps**: t = min(1, maxStep/maxΔ), maxStep = 1.0 V default;
  abort a scale if t < 0.02 and maxΔ > 1e3.
- **Source stepping**: λ ∈ {0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0}; escalate
  gmin (1e-12 → 1e-9) as the final fallback. Stability: gmin diagonal added to
  J consistently with the residual (no /h mixing — see tests/physics-engine).
- **MOSFET model parity**: Shichman–Hodges square-law with symmetric
  drain/source role swap (current enters the higher-potential channel terminal
  for NMOS drain / PMOS source; reversed operation swaps roles — continuous,
  no Newton oscillation at the reverse boundary):
  - NMOS: drive = vgs − Vth; sat (vds ≥ drive): `Id = ½·KP·drive²·(1+λ·vds)`;
    linear: `Id = KP·(drive·vds − ½vds²)·(1+λ·vds)`.
  - PMOS: use vsg, vsd, |Vth| analogously.
  - BSIM-level upgrade path (Phase 2): calibrated `Id, gm, gds, Cgs, Cgd`
    tables from SKY130A `nfet_01v8`/`pfet_01v8` public models, FreePDK45, ASAP7
    (constants from `data/reference-library/02` + `08`); gate capacitances
    charge-conserving.
- **KCL/power conservation oracles**: KCL residual at every node < 1e-9;
  ΣP_devices = ΣP_sources < 1e-9 (physics-engine test suite is the reference).

### 1.3 RC parasitics

- Elmore delay for RC trees: `t_d = Σ_k C_k · R_(source→k)`.
- Pi-model per trace segment: `R = ρ(T)·L/(w·t)`, `C ≈ ε·w·L/d`
  (SKY130 sheet resistances from 02 JSON metal_stack).

### 1.4 Fourier heat PDE — implicit, unconditionally stable

```
ρ·c_p·∂T/∂t = ∇·(k∇T) + J²ρ_elec(T) − h·(T − T_amb)
```

- **Scheme: implicit Euler (backward Euler) or Crank–Nicolson** — replaces the
  M5-era FTCS (whose Δt ≤ dx²/(4α) bound caused explicit blowups at coarse
  timesteps). Backward Euler: solve `(I − Δt·A)·T_new = T_old + Δt·f` per step
  (A = discrete Laplacian + convection diagonal); CN for ≤ 64×64 grids where
  the tridiagonal solve is cheap. Both are unconditionally stable.
- Material constants from `data/reference-library/02` (Si k=148, ρ=2329,
  c_p=700; Cu k=401, ρ=8960, c_p=385; FR-4 k=0.3, ρ=1900, c_p=600; composite
  board k_eff 15 W/m·K with copper planes).
- Dirichlet edges at T_amb (bulk spreading BC), bulk convection −h(T−T_amb).
- Stability acceptance: no NaN after 200 steps at any Δt; energy balance
  residual < 1e-9 with h=0 and insulated edges.

### 1.5 Temperature-dependent resistivity & failure physics

- `ρ(T) = ρ₀·[1 + α·(T − T₀)]`; Cu α = 0.0039 /K, T₀ = 300 K (02 JSON).
- **E-model TDDB**: `ln(TTF) = ln(A) − γ·Vgs`, γ ≈ 300 dec/V; hard breakdown
  Vgs ≥ 3 V → permanent shorted-gate fault. SKY130 core SOA ceiling
  **Vgs > 1.95 V** trips the oxide-arc event (06 JSON).
- **Black's electromigration**: `MTTF = A·J^(−n)·exp(E_a/(k_B·T))`, n ≈ 2,
  E_a ≈ 0.7 eV (Al).
- **Cu fusing**: trace melt at **1085 °C**; Onderdonk
  `I_f = S·√((T_melt − T_amb)/(t·ρ₀·α))`. **FR-4 delamination 260 °C**
  (verified reference; the 400 °C draft figure is superseded). Si
  thermal-runaway alarm **200 °C**; leakage doubles every ≈10 °C above onset:
  `I_leak = I₀·exp(−E_g/(2·k_B·T))`.
- **Blackbody RGB**: verified stops 300→2500 K (06 JSON) interpolated
  piecewise-linear; GLSL uniform array.

### 1.6 Cryogenic balance

`C_th·dT/dt = Q_load − Q_cool(T)`; Q_cool: quadratic dilution
`max(Q_15mK, Q_100mK·(T/0.1)²)` below 100 mK, linear 0.1→1.5 W up to 4 K,
capped above. Quench when Q_load > 12 mW (strict >). Explicit-Euler
substepping with dt < 0.4·τ, τ = C_th/(dQ_cool/dT) (engine implements this).

## 2. Multi-Radix Logic

- Level map: `L_k = k·VDD/(R−1)`, k = 0..R−1 (03 JSON: binary {0,1.8},
  ternary {0,0.9,1.8}, quaternary {0,0.6,1.2,1.8}).
- Noise margins: `NM ≥ VDD/(2·(R−1))`; Phase 0 verified: binary NM 0.6 V,
  Q4 per-level 0.3 V; intermediate margins for R=3,4 measured from cell
  transfer via the threshold detector (q4_thresh_det transfer: nearest
  partition digit).
- Q4 inversion `Q_out = 3 − Q_in`; Q4 half adder `S = (A+B) mod 4`,
  `C = ⌊(A+B)/4⌋`; ternary analogues mod 3.
- Radix economy `E(R) = R/ln(R)`; minimum at R = e ≈ 2.718.
- Timing/fanout propagation: Elmore delay per interconnect + cell arc delay
  from the custom-IC macro-model (±5 % tolerance contract).

## 3. Chips, Accelerators & Unified-Memory SoCs

- Dynamic power `P_dyn = α·C·V²·f` (verified ∝f and ∝V² by chip-engine
  tests); leakage `P_leak = V·I_sub` (BSIM tables, Phase 2).
- **Roofline**: `achievable_FLOPs = min(PeakFLOPs, AI·PeakBW)`; AI = ops/byte.
- **Little's Law** for concurrency limits: `L = λ·W` (in-flight memory ops =
  bandwidth × latency); DRAM latency 200 cycles, L2 12, L1 3 (07 JSON
  cache_hierarchy_reference).
- Discrete PCIe copy penalty: `copy_cycles = bytes/(BW_GBps·1e9/(f_Hz))`
  per transfer; zero-copy unified memory pays bandwidth once per touch
  (07 JSON zero_copy_note).
- Systolic wave-front: `cycles = ceil(M/P)·ceil(N/P)·(K + 2P − 2)`;
  utilization `(M·N·K)/(tiles·(K+2P−2)·P²)` (05 JSON).
- SIMT divergence: divergent warp costs 2× the uniform warp (both paths
  serialized); occupancy = active lanes / warp width.
- INT32 accumulator safety: `K_max = 2³¹/(255·255) ≈ 33038` (05 JSON).
- DVFS throttling loop: if T_junction > 125 °C (05 envelope), reduce f
  stepwise; if T ≥ 200 °C → si_thermal_runaway event (06 JSON).

## 4. Quantum Physics

- Hamiltonian + DRAG pulses: `H(t) = Ω_I(t)/2·σx + Ω_Q(t)/2·σy`,
  `Ω_I = A·g(t)`, `Ω_Q = β·A·g'(t)`, `g = exp(−(t−t0)²/(2σ²))`.
- **Lindblad master equation**:
  `dρ/dt = −(i/ħ)[H, ρ] + Σ_k γ_k(L_k ρ L_k† − ½{L_k†L_k, ρ})`.
  Integrator: operator splitting — exact per-part unitaries (drive rotations,
  ZZ/detuning phase factors) + Kraus channels with p = γ·dt. Unconditionally
  stable; trace preserved exactly (Kraus CP maps); verified: Tr(ρ)=1,
  Cholesky positivity, population(T1)=e⁻¹±0.02, coherence(T2)=0.5e⁻¹±0.02
  (quantum-engine test suite is the oracle).
- Kraus channels: T1 amplitude damping (`p = γ₁dt`), pure dephasing
  (`γ_φ = (1/T2 − 1/(2T1))/2`), depolarizing, readout bit-flip
  (fidelity 0.98 typical, 04 JSON), ZZ crosstalk `H_ZZ = 2π·ζ·|11⟩⟨11|`.
- SOI MZI: coupler `U(θ,φ) = [[c, −e^(−iφ)s],[e^(iφ)s, c]]` (unitary);
  loss `η = 10^(−(dB/cm·L + IL·n)/10)`; thermo-optic crosstalk
  `−15 dB` power ratio (04 JSON).
- Rydberg blockade: `V(r) = C₆/r⁶`, C₆ = 500 GHz·µm⁶; blockade radius
  `r_b = (C₆/Ω)^(1/6)`.
- QEC: Pauli-frame Clifford propagation (CNOT/H/S conjugation rules as
  implemented in `packages/quantum-engine/src/stabilizer.mjs`); logical-vs-
  physical sweep with quadratic suppression at p = 0.05; MPS frame for
  low-entanglement states up to 500 qubits (Phase 5).
- Cryo coupling: §1.6 ODE drives stage temps; Al Tc 1.2 K collapse threshold.

## 5. CI Oracle Calibration Table

| Kernel domain | Oracle | Tolerance | Test location |
| --- | --- | --- | --- |
| MNA DC (divider/inverter) | ngspice batch (`scripts/`, Phase 0 harness) | node V ± 1e-6 V; currents ± 1e-9 A | Phase 2 differential suite (WP-2.4) |
| MOSFET IV family | ngspice SKY130A public models | Id ± 5 % (calibrated tables) | WP-2.5 |
| Thermal steady state | analytic single-cell convection solution | ± 2 % | tests/physics-engine (existing) |
| Logic simulation | Phase 0 `js/labs/logic` engine | identical truth tables, identical event order | WP-3.4 |
| TPU GEMM | exact INT8 reference math | bit-exact | tests/chip-engine (existing) |
| RV32IM execution | Phase 0 IL-8/RV32 harness + QEMU user-mode (bounded) | register file bit-exact | WP-4.5 |
| ONNX INT8/QDQ inference | ONNX Runtime CPU (Phase 10 suite) | logits ± 1e-5 relative | WP-4.6 |
| QEC sweep | Stim-class reference (published rates) | logical rate ± 0.5 % absolute | WP-5.4 |
| Netlist JSON → solve | `tests/sandbox-netlist.test.mjs` | exact divider math | existing |

All tolerances are hard CI assertions; a kernel change that moves an oracle
beyond tolerance must update the ORACLE TABLE row in this file **with
justification in the PR** — silent tolerance relaxation is a Law 1 violation.
