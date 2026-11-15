# Tutorials

Each tutorial is ≤ 1 minute from a cold start. Press **?** in the app for the in-app version
(which also lists keyboard shortcuts). All tutorials use the Examples menu — no manual wiring
required to succeed.

## 1. Logic Lab — build and validate a half adder

1. Examples → **Logic: half adder (binary)** → press **▶ Run**.
   The scope shows SUM = 0, CARRY = 1 for A=1, B=1 (1+1 in binary).
2. Click an **IN** block, set its value in the inspector, re-run.
3. Switch **Signal radix** to 4 in Design settings and run: the same XOR/AND gates now compute
   quaternary algebra (XOR = mod-4 digit sum, AND = min). The Report tab re-verifies every used
   gate against the reference algebra exhaustively (all 4² combinations per gate).
4. Try **Logic: 2-digit quaternary adder**: 23₄ + 32₄ = 121₄ (S1=1, S0=2, Cout=1).
5. Build your own: click a palette block to add it, click an output port then an input port to
   wire. Leave an input unconnected and watch it honestly report `'Z'` and a warning.

**What validates what:** every gate's truth table (exhaustive), the adder against integer
arithmetic, oscillation detection on feedback loops.

## 2. Chip Lab — RC low-pass filter

1. Examples → **Chip: RC low-pass filter (AC + transient)** → **▶ Run**.
   The Bode plot appears; the Report tab shows the −3 dB cutoff found by the sweep
   (≈1588 Hz) checked against theory 1/(2πRC) ≈ 1591.5 Hz with 5% tolerance.
2. Switch the analysis (Design settings) to **dc**: node voltages, element powers, junction
   temperature estimates (Rth model) and Johnson-noise figures (4kTR, stated as estimates).
3. Switch to **tran** for the step response (backward Euler).
4. Export → **SPICE deck** and cross-check the netlist in Ngspice. We export; we do not pretend
   to *be* SPICE.
5. Monte Carlo: the resistor has ±5% and the capacitor ±10% tolerance — the validation layer can
   sample them (see `monteCarlo` in `js/core/validation.js` and the tests) to bound cutoff spread.

**What validates what:** divider voltages (exact), RC τ, −3 dB point, NMOS Id-Vg vs square law,
CMOS inverter transfer curve, op-amp gain, power balance (delivered = dissipated).

## 3. CPU Lab — run and verify a program

1. Press **▶ Assemble & Run** on the default program: sum of 1..10 → OUT port 0 = **55**.
2. The scope shows registers, pipeline stats (cycles, retired, stalls, flushed slots) and the
   I/O log. The **Report** tab differentially verifies the 5-stage pipeline against an
   unpipelined reference interpreter — the architectural result must match exactly.
3. Examples → **CPU: load-use hazard demo**: the stats show *exactly one* stall (LD followed
   immediately by its consumer) and the value still arrives correctly via WB forwarding.
4. Examples → **CPU: Fibonacci**: ten terms via XOR-swaps (no MOV in the ISA).
5. Write your own program: `LDI/LD/ST/ADD/SUB/AND/OR/XOR/INC/DEC/CMP/SHL/SHR/JMP/JZ/JNZ/JN/JC/OUT/IN/HLT`,
   labels, `.byte` data. Invalid opcodes stop the machine with an explicit error.

## 4. AI Lab — precision vs accuracy

1. Press **▶ Run workload** (default f32, 8×8×8): matmul runs and is compared with the f64
   reference; the max error (~1e-7) must sit under the documented f32 bound.
2. Switch precision to **int8** and re-run: error grows to ~1% — the int8 bound (3%) still
   passes, and the report states the quantization model (per-tensor symmetric, int32 accumulate).
3. Read the systolic table: cycles, utilization, GMAC/s, energy. The report flags it
   **WARN — analytical model, ±30% vs silicon** because that's what it is.
4. The XOR MLP trains in-run with a fixed seed — predictions land within 0.2 of the targets
   every time (deterministic ⇒ reproducible claims).

## 5. Quantum Lab — Bell state and friends

1. Examples → **Quantum: Bell state (entanglement)** → **▶ Run**:
   only |00⟩ and |11⟩ occur (~50/50 ± binomial SE); the report includes an **entanglement
   witness** (P(01)+P(10) = 0) and a 4σ consistency check between exact probabilities and the
   finite-shot sample.
2. Examples → **Quantum: qutrit Fourier (d=3)**: SHIFT|0⟩ = |1⟩; F₃|1⟩ is uniform — three
   outcomes near 1/3 each. Qudit gates work in any dimension (2/3/4).
3. Build circuits on the canvas: WIRE blocks declare qubit lines (top-to-bottom = index),
   gates chain left-to-right, MEASURE terminates a wire. A qubit gate on a d=3 diagram is
   refused with a clear message — not silently misapplied.
4. Deutsch-Jozsa and GHZ ship in `js/labs/quantum/algorithms.js` with test coverage.

**What validates what:** unitarity is enforced at every gate application (non-unitary matrices
throw), normalization is checked (Σp = 1), sampling is checked against exact probabilities.

## 6. Optics Lab — the plugin demo

1. Examples → **Optics: converging lens (plugin demo)** → **▶ Run**:
   u = 60 mm, f = 40 mm → v = 120 mm, m = −2; the screen sits exactly at the image plane so the
   geometric spot is ~0. The report verifies 1/u + 1/v = 1/f and warns about the paraxial
   assumption.
2. Change the screen distance d: spot diameter = aperture·|d − v|/v.
3. This lab is a third-party plugin — read `docs/PLUGIN_API.md` and write your own in an
   afternoon.

## 7. Cross-Lab — coupling with data-consistency proof

1. **Cross-lab: CPU → AI accelerator**: an IL-8 program computes XOR of four pairs from memory
   (its result is differential-validated), then a trained MLP must independently reproduce the
   same function. Consistency verdict: CPU results vs MLP predictions within 0.2.
2. **Cross-lab: Quantum RNG → CPU**: eight qubits in |+⟩ measured once give 8 random bits; the
   adapter packs them MSB-first into a byte; the CPU computes popcount and parity via IN port;
   a JS reference must agree.

Boundary adapters (`js/core/pipeline.js`) are explicit and documented: `threshold`,
`quantize`, `bitsToBytes`. No implicit cross-lab magic.

## Keyboard shortcuts

| Keys | Action |
|---|---|
| `Ctrl+Enter` | Run |
| `Ctrl+S` | Save project JSON |
| `Ctrl+Z` / `Ctrl+Y` | Undo / redo |
| `Ctrl+D` | Duplicate selected block |
| `Del` / `Backspace` | Delete selection |
| `F` | Fit view |
| `?` | Beginner mode & help |
| mouse wheel | zoom · drag empty space to pan |
