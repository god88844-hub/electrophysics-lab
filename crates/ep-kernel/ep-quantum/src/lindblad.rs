//! Lindblad/Kraus density-matrix core (WP-5.1).
//!
//! `dρ/dt = −(i/ħ)[H(t), ρ] + Σ_k γ_k (L_k ρ L_k† − ½{L_k†L_k, ρ})` per
//! `docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md` §4, integrated with the
//! same operator-splitting scheme as the ESM oracle
//! `packages/quantum-engine/src/lindblad.mjs`:
//!
//! 1. drive Hamiltonians → exact single-qubit rotations `exp(−i·H_drive·dt)`,
//! 2. diagonal Hamiltonian (ZZ crosstalk `H_ZZ = 2π·ζ·|11⟩⟨11|` + detunings)
//!    → exact phase factors,
//! 3. dissipators → Kraus channels with `p = γ·dt` (T1 amplitude damping,
//!    pure dephasing, depolarizing) — CP maps, so trace is preserved by
//!    construction (no ODE drift).
//!
//! State layout and arithmetic mirror the ESM engine element-for-element
//! (dense re/im `f64` vectors, bit `1 << k` qubit indexing, tensor-index
//! application) so the CI oracle observables agree to floating-point noise.
//!
//! Units: the solver is unit-agnostic — `T1`/`T2`/`dt`/ZZ/detuning share one
//! time unit chosen by the caller (devices below use SI seconds; the ESM
//! oracle tests use µs against µs). Deviation note: the diagonal phase uses
//! the physical `UρU†` convention `e^{−i(E_i−E_j)dt}`; the ESM engine applies
//! the conjugate factor `e^{+i(E_i−E_j)dt}` — a phase conjugation that leaves
//! every oracle observable (trace, positivity, populations, |coherence|,
//! purity) invariant, including the ESM suite's half-period ZZ test.

use ep_core::admission::{AdmissionController, AdmissionDecision, AdmissionRequest};
use ep_core::schema_types::BlochState;

/// 2×2 complex operator, row-major (`re`/`im` quadruples) — mirrors the ESM
/// `OPS` op shape.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Op2 {
    pub re: [f64; 4],
    pub im: [f64; 4],
}

impl Op2 {
    pub const fn new(re: [f64; 4], im: [f64; 4]) -> Self {
        Self { re, im }
    }

    /// `A†` = transpose + conjugate.
    pub fn dag(&self) -> Self {
        Self {
            re: [self.re[0], self.re[2], self.re[1], self.re[3]],
            im: [-self.im[0], -self.im[2], -self.im[1], -self.im[3]],
        }
    }
}

/// Pauli/library operators (identical entries to the ESM `OPS` table).
pub mod ops {
    use super::Op2;
    use std::f64::consts::FRAC_1_SQRT_2;

    pub const I: Op2 = Op2::new([1.0, 0.0, 0.0, 1.0], [0.0; 4]);
    pub const X: Op2 = Op2::new([0.0, 1.0, 1.0, 0.0], [0.0; 4]);
    pub const Y: Op2 = Op2::new([0.0, 0.0, 0.0, 0.0], [0.0, -1.0, 1.0, 0.0]);
    pub const Z: Op2 = Op2::new([1.0, 0.0, 0.0, -1.0], [0.0; 4]);
    pub const H: Op2 = Op2::new([FRAC_1_SQRT_2; 4], [0.0; 4]);
    pub const S: Op2 = Op2::new([1.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 1.0]);
    pub const T: Op2 = Op2::new(
        [1.0, 0.0, 0.0, FRAC_1_SQRT_2],
        [0.0, 0.0, 0.0, FRAC_1_SQRT_2],
    );
    /// σx/2
    pub const SX: Op2 = Op2::new([0.5, 0.5, 0.5, 0.5], [0.0; 4]);
    /// σy/2
    pub const SY: Op2 = Op2::new([0.0, 0.0, 0.0, 0.0], [0.0, -0.5, 0.5, 0.0]);
    /// σz/2
    pub const SZ: Op2 = Op2::new([0.5, 0.0, 0.0, -0.5], [0.0; 4]);
    /// σ− = |0⟩⟨1| (lowering).
    pub const SM: Op2 = Op2::new([0.0, 1.0, 0.0, 0.0], [0.0; 4]);
}

/// `R_axis(θ) = exp(−i θ σ_axis / 2)` — identical entries to the ESM
/// `rotation(axis, theta)`.
pub fn rotation(axis: Axis, theta: f64) -> Op2 {
    let c = (theta / 2.0).cos();
    let s = (theta / 2.0).sin();
    match axis {
        Axis::X => Op2::new([c, -s, -s, c], [0.0; 4]),
        Axis::Y => Op2::new([c, 0.0, 0.0, c], [0.0, -s, s, 0.0]),
        Axis::Z => Op2::new([c, 0.0, 0.0, c], [0.0, -s, 0.0, s]),
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Axis {
    X,
    Y,
    Z,
}

/// Hard structural ceiling for the exact dense solver: the offline path is
/// memory-admitted through the ep-core arena budget (`admission::offline_*`),
/// which refuses 12 qubits (`805 MB > 512 MB`) and admits 11 (`201 MB`).
pub const DENSITY_MATRIX_MAX_QUBITS: usize = 11;

/// Per-step drive term: a single-qubit Hamiltonian op applied for one step
/// (the stepper extracts the (σx, σy) components and rotates exactly).
#[derive(Debug, Clone, Copy)]
pub struct Drive {
    pub qubit: usize,
    pub op: Op2,
}

impl Drive {
    pub fn new(qubit: usize, op: Op2) -> Self {
        Self { qubit, op }
    }
}

/// ZZ crosstalk pair: `H_ZZ = 2π·ζ·|11⟩⟨11|` (ζ in Hz, time unit seconds) on
/// qubits `qa`, `qb`. The ESM engine models exactly one pair (0, 1); the
/// kernel generalizes to any pair list (parity holds for the (0, 1) config).
#[derive(Debug, Clone, Copy)]
pub struct ZzPair {
    pub qa: usize,
    pub qb: usize,
    pub hz: f64,
}

/// Noise model: per-qubit T1/T2 (in the caller's time unit), ZZ pairs and
/// static detunings. Defaults mirror the ESM engine's (`T1 = 100`, `T2 = 150`
/// — the 04-JSON transmon typicals; `zzHz = 0`, no detuning).
#[derive(Debug, Clone)]
pub struct NoiseModel {
    pub t1: Vec<f64>,
    pub t2: Vec<f64>,
    pub zz: Vec<ZzPair>,
    pub detune_hz: Vec<f64>,
}

impl NoiseModel {
    /// Uniform per-qubit T1/T2.
    pub fn uniform(n_qubits: usize, t1: f64, t2: f64) -> Self {
        Self {
            t1: vec![t1; n_qubits],
            t2: vec![t2; n_qubits],
            zz: Vec::new(),
            detune_hz: vec![0.0; n_qubits],
        }
    }

    pub fn with_zz(mut self, pairs: Vec<ZzPair>) -> Self {
        self.zz = pairs;
        self
    }

    pub fn with_detune_hz(mut self, detune_hz: Vec<f64>) -> Self {
        self.detune_hz = detune_hz;
        self
    }
}

/// Exact-solver density matrix: dense re/im storage, bit `1 << k` qubit
/// indexing (identical layout to the ESM `DensityMatrix`).
#[derive(Debug, Clone)]
pub struct DensityMatrix {
    pub n: usize,
    pub d: usize,
    pub re: Vec<f64>,
    pub im: Vec<f64>,
}

/// Initial-state selector (ESM parity).
#[derive(Debug, Clone, Copy)]
pub enum InitialState {
    /// |00…0⟩⟨00…0|
    Zeros,
    /// Maximally mixed.
    MaxMixed,
    /// |index⟩⟨index| on the computational basis (clamped to `0..d`).
    Computational(usize),
}

impl DensityMatrix {
    /// Structural constructor: refuses 0 qubits and anything above the
    /// dense-solver ceiling (`DENSITY_MATRIX_MAX_QUBITS`). Interactive
    /// admission (n ≤ 6 via ep-core) is enforced at [`LindbladSim::new_interactive`].
    pub fn new(n_qubits: usize, initial: InitialState) -> Result<Self, AdmissionDecision> {
        if n_qubits == 0 {
            return Err(refused("quantum: nQubits must be ≥ 1"));
        }
        if n_qubits > DENSITY_MATRIX_MAX_QUBITS {
            return Err(refused(format!(
                "quantum exact solver: {} qubits exceeds the dense ceiling {} (arena-budgeted); use the MPS offline path",
                n_qubits, DENSITY_MATRIX_MAX_QUBITS
            )));
        }
        let d = 1usize << n_qubits;
        let n = d * d;
        let mut re = vec![0.0; n];
        let im = vec![0.0; n];
        match initial {
            InitialState::Zeros => re[0] = 1.0,
            InitialState::MaxMixed => {
                for i in 0..d {
                    re[i * d + i] = 1.0 / d as f64;
                }
            }
            InitialState::Computational(index) => {
                let idx = index.min(d - 1);
                re[idx * d + idx] = 1.0;
            }
        }
        Ok(Self {
            n: n_qubits,
            d,
            re,
            im,
        })
    }

    /// Tr(ρ).
    pub fn trace(&self) -> f64 {
        (0..self.d).map(|i| self.re[i * self.d + i]).sum()
    }

    /// Purity Tr(ρ²) ∈ [1/d, 1].
    pub fn purity(&self) -> f64 {
        let d = self.d;
        let mut s = 0.0;
        for i in 0..d {
            for j in 0..d {
                let a = i * d + j;
                let b = j * d + i;
                s += self.re[a] * self.re[b] - self.im[a] * self.im[b];
            }
        }
        s
    }

    /// Gershgorin lower bound on the eigenvalues (cheap conservative
    /// positivity check, ESM parity).
    pub fn min_eigen_approx(&self) -> f64 {
        let d = self.d;
        let mut min = f64::INFINITY;
        for i in 0..d {
            let mut off = 0.0;
            for j in 0..d {
                if j == i {
                    continue;
                }
                let a = i * d + j;
                off += self.re[a].hypot(self.im[a]);
            }
            min = min.min(self.re[i * d + i] - off);
        }
        min
    }

    /// Bloch vector ⟨σ⟩ of qubit `k` via partial trace (ESM parity).
    pub fn bloch_vector(&self, k: usize) -> (f64, f64, f64) {
        let d = self.d;
        let bit = 1usize << k;
        let mut red = [[0.0f64; 2]; 2];
        let mut red_im = [[0.0f64; 2]; 2];
        for i in 0..d {
            let ik = ((i & bit) != 0) as usize;
            for j in 0..d {
                if (i & !bit) != (j & !bit) {
                    continue;
                }
                let jk = ((j & bit) != 0) as usize;
                let a = i * d + j;
                red[ik][jk] += self.re[a];
                red_im[ik][jk] += self.im[a];
            }
        }
        (
            red[0][1] + red[1][0],
            red_im[1][0] - red_im[0][1],
            red[0][0] - red[1][1],
        )
    }

    /// [`BlochState`] (ep-core solver-frame type) of qubit `k`: ⟨σ⟩ plus the
    /// reduced-state purity.
    pub fn bloch_state(&self, k: usize) -> BlochState {
        let (x, y, z) = self.bloch_vector(k);
        let px = x / 2.0;
        let py = y / 2.0;
        let pz = z / 2.0;
        let purity = 2.0 * (px * px + py * py + pz * pz) + 0.5;
        BlochState { x, y, z, purity }
    }

    /// Population of qubit `k`'s |1⟩ state.
    pub fn population(&self, k: usize) -> f64 {
        let d = self.d;
        let bit = 1usize << k;
        (0..d)
            .filter(|i| (i & bit) != 0)
            .map(|i| self.re[i * d + i])
            .sum()
    }

    /// Coherence |ρ_{0,1}^{(k)}| between qubit `k`'s own |0⟩ and |1⟩.
    pub fn coherence(&self, k: usize) -> f64 {
        let d = self.d;
        let bit = 1usize << k;
        let mut re = 0.0;
        let mut im = 0.0;
        for i in 0..d {
            if (i & bit) != 0 {
                continue;
            }
            let j = i | bit;
            let a = i * d + j;
            re += self.re[a];
            im += self.im[a];
        }
        re.hypot(im)
    }

    /// Positivity via Cholesky factorization: ρ ⪰ 0 ⟺ ρ = LL† succeeds.
    /// Negative pivots beyond `tol` are violations (ESM parity).
    pub fn is_positive_psd(&self, tol: f64) -> bool {
        let d = self.d;
        let mut l_re = vec![vec![0.0; d]; d];
        let mut l_im = vec![vec![0.0; d]; d];
        for j in 0..d {
            let mut s = self.re[j * d + j];
            for k in 0..j {
                s -= l_re[j][k] * l_re[j][k] + l_im[j][k] * l_im[j][k];
            }
            if s < -tol {
                return false;
            }
            let ljj = s.max(0.0).sqrt();
            l_re[j][j] = ljj;
            for i in (j + 1)..d {
                let mut sr = self.re[i * d + j];
                let mut si = self.im[i * d + j];
                for k in 0..j {
                    // sr -= L[i][k] · conj(L[j][k])
                    sr -= l_re[i][k] * l_re[j][k] + l_im[i][k] * l_im[j][k];
                    si -= l_im[i][k] * l_re[j][k] - l_re[i][k] * l_im[j][k];
                }
                l_re[i][j] = sr / ljj;
                l_im[i][j] = si / ljj;
            }
        }
        true
    }

    /// Apply a single-qubit operator A on qubit k (ρ → A ρ A†) — the ESM
    /// tensor-index trick, O(d²·4).
    pub fn apply_op1(&mut self, k: usize, a: Op2) {
        let d = self.d;
        let bit = 1usize << k;
        let mut n_re = vec![0.0; d * d];
        let mut n_im = vec![0.0; d * d];
        for i in 0..d {
            for j in 0..d {
                let ik = ((i & bit) != 0) as usize;
                let jk = ((j & bit) != 0) as usize;
                let mut sr = 0.0;
                let mut si = 0.0;
                for a_i in 0..2usize {
                    let ii = if a_i == ik { i } else { i ^ bit };
                    let aar = a.re[ik * 2 + a_i];
                    let aai = a.im[ik * 2 + a_i];
                    for b_i in 0..2usize {
                        let jj = if b_i == jk { j } else { j ^ bit };
                        let src = ii * d + jj;
                        let acbr = a.re[jk * 2 + b_i];
                        let acbi = -a.im[jk * 2 + b_i]; // conjugate
                        let pr = aar * self.re[src] - aai * self.im[src];
                        let pi = aar * self.im[src] + aai * self.re[src];
                        sr += pr * acbr - pi * acbi;
                        si += pr * acbi + pi * acbr;
                    }
                }
                let dst = i * d + j;
                n_re[dst] = sr;
                n_im[dst] = si;
            }
        }
        self.re = n_re;
        self.im = n_im;
    }

    /// Apply a Kraus channel `{L_m}` on qubit k: Σ_m L_m ρ L_m†.
    pub fn apply_channel1(&mut self, k: usize, ops: &[Op2]) {
        let mut acc_re = vec![0.0; self.re.len()];
        let mut acc_im = vec![0.0; self.im.len()];
        for l in ops {
            let mut tmp = self.clone();
            tmp.apply_op1(k, *l);
            for i in 0..acc_re.len() {
                acc_re[i] += tmp.re[i];
                acc_im[i] += tmp.im[i];
            }
        }
        self.re = acc_re;
        self.im = acc_im;
    }

    /// T1 amplitude-damping channel on qubit k with step probability
    /// `p = γ₁·dt` (Kraus: √(1−p)·I, √p·σ−).
    pub fn amplitude_damping(&mut self, k: usize, gamma: f64) {
        let p = gamma.min(1.0);
        let sq = p.sqrt();
        let l0 = Op2::new([1.0, 0.0, 0.0, (1.0 - p).sqrt()], [0.0; 4]);
        let l1 = Op2::new([0.0, sq, 0.0, 0.0], [0.0; 4]);
        self.apply_channel1(k, &[l0, l1]);
    }

    /// Pure-dephasing channel on qubit k: coherence × (1 − 2γ)
    /// (Kraus: √(1−p)·I, √p·Z).
    pub fn pure_dephasing(&mut self, k: usize, gamma: f64) {
        let p = gamma.min(0.5);
        let sq = p.sqrt();
        let l0 = Op2::new([(1.0 - p).sqrt(), 0.0, 0.0, (1.0 - p).sqrt()], [0.0; 4]);
        let l1 = Op2::new([sq, 0.0, 0.0, -sq], [0.0; 4]);
        self.apply_channel1(k, &[l0, l1]);
    }

    /// Depolarizing channel on qubit k (replacement form):
    /// ρ → (1−p)·ρ + p·(I₂/2) ⊗ Tr_k(ρ) — the k marginal decays toward the
    /// maximally mixed state while the rest of the register is untouched.
    /// Trace preserving for any p; p = 1 fully mixes qubit k.
    pub fn depolarizing(&mut self, k: usize, p: f64) {
        let p = p.clamp(0.0, 1.0);
        if p == 0.0 {
            return;
        }
        let d = self.d;
        let bit = 1usize << k;
        let mut n_re = vec![0.0; d * d];
        let mut n_im = vec![0.0; d * d];
        for i in 0..d {
            for j in 0..d {
                let a = i * d + j;
                n_re[a] = (1.0 - p) * self.re[a];
                n_im[a] = (1.0 - p) * self.im[a];
                // Replacement term (p/2)·δ_{t,s}·Tr_k(ρ)_{ab}, nonzero only
                // when the outer bits match (a == b) and the k bits match
                // (t == s); Tr_k(ρ)_{a,a} = ρ_{a,a} + ρ_{a|bit, a|bit}.
                if (i & !bit) == (j & !bit) && (i & bit) == (j & bit) {
                    let base = i & !bit;
                    let s_re = self.re[base * d + base] + self.re[(base | bit) * d + (base | bit)];
                    let s_im = self.im[base * d + base] + self.im[(base | bit) * d + (base | bit)];
                    n_re[a] += p / 2.0 * s_re;
                    n_im[a] += p / 2.0 * s_im;
                }
            }
        }
        self.re = n_re;
        self.im = n_im;
    }
}

fn refused(reason: impl Into<String>) -> AdmissionDecision {
    AdmissionDecision {
        admitted: false,
        reason: reason.into(),
    }
}

/// Deterministic PRNG — bit-exact port of the ESM `mulberry32` (fixed-seed
/// experiment reproducibility).
pub struct Mulberry32 {
    state: u32,
}

impl Mulberry32 {
    pub fn new(seed: u32) -> Self {
        Self { state: seed }
    }

    pub fn next_f64(&mut self) -> f64 {
        // Bit-exact port of the ESM mulberry32:
        //   a = (a + 0x6d2b79f5) | 0;
        //   t = Math.imul(t ^ (t >>> 15), 1 | t);
        //   t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        //   return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        self.state = self.state.wrapping_add(0x6D2B_79F5);
        let mut t = self.state;
        t = (t ^ (t >> 15)).wrapping_mul(1 | t);
        t = t.wrapping_add((t ^ (t >> 7)).wrapping_mul(61 | t)) ^ t;
        f64::from(t ^ (t >> 14)) / 4294967296.0
    }
}

/// Lindblad stepper — operator splitting with exact per-part evolutions
/// (ESM `LindbladSim` parity).
pub struct LindbladSim {
    pub n: usize,
    pub d: usize,
    pub rho: DensityMatrix,
    pub noise: NoiseModel,
}

impl LindbladSim {
    /// Interactive constructor: strict ep-core admission (n ≤ 6, honest
    /// refusal reason otherwise).
    pub fn new_interactive(
        n_qubits: usize,
        noise: NoiseModel,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let decision = controller.admit(&AdmissionRequest::QuantumInteractive { n_qubits });
        if !decision.admitted {
            return Err(decision);
        }
        Self::unchecked(n_qubits, noise)
    }

    /// Offline constructor: same exact solver, memory-admitted through the
    /// ep-core arena budget (refuses workloads that would blow the 512 MB
    /// kernel arena — currently 12+ qubits).
    pub fn new_offline(
        n_qubits: usize,
        noise: NoiseModel,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let decision = crate::admission::admit_offline(controller, n_qubits);
        if !decision.admitted {
            return Err(decision);
        }
        Self::unchecked(n_qubits, noise)
    }

    fn unchecked(n_qubits: usize, noise: NoiseModel) -> Result<Self, AdmissionDecision> {
        let rho = DensityMatrix::new(n_qubits, InitialState::Zeros)?;
        let d = rho.d;
        Ok(Self {
            n: n_qubits,
            d,
            rho,
            noise,
        })
    }

    pub fn reset(&mut self, initial: InitialState) -> Result<(), AdmissionDecision> {
        self.rho = DensityMatrix::new(self.n, initial)?;
        Ok(())
    }

    /// One operator-splitting step of `dt` (same time unit as the noise
    /// rates): exact drive rotations → exact diagonal phases → Kraus
    /// dissipators (`p = γ·dt`). Unconditionally stable; trace preserved by
    /// the CP maps.
    pub fn step(&mut self, dt: f64, drives: &[Drive]) {
        // 1. Drives → exact rotations. Extract (σx, σy) components per qubit.
        let mut bx = vec![0.0; self.n];
        let mut by = vec![0.0; self.n];
        for drive in drives {
            let op = drive.op;
            bx[drive.qubit] += (op.re[1] + op.re[2]) / 2.0;
            by[drive.qubit] += (op.im[2] - op.im[1]) / 2.0;
        }
        for q in 0..self.n {
            let w = bx[q].hypot(by[q]);
            if w == 0.0 {
                continue;
            }
            // H = b·σ ⇒ exp(−i·H·dt) rotates by angle 2|b|·dt.
            let ang = 2.0 * w * dt;
            let c = (ang / 2.0).cos();
            let s = (ang / 2.0).sin();
            let nx = bx[q] / w;
            let ny = by[q] / w;
            // U = exp(−i·ang/2·(nx σx + ny σy))
            let u = Op2::new([c, -s * ny, s * ny, c], [0.0, -s * nx, -s * nx, 0.0]);
            self.rho.apply_op1(q, u);
        }

        // 2. Diagonal Hamiltonian (ZZ + detuning) → exact phase factors
        //    ρ_ij ← e^{−i(E_i−E_j)dt}·ρ_ij (see module doc: physical UρU†
        //    convention; the ESM engine applies the conjugate — every oracle
        //    observable is invariant under the phase conjugation).
        let mut diag = vec![0.0f64; self.d];
        for zz in &self.noise.zz {
            let idx = (1usize << zz.qa) | (1usize << zz.qb);
            diag[idx] += std::f64::consts::TAU * zz.hz;
        }
        for (q, detune) in self.noise.detune_hz.iter().enumerate() {
            let w = std::f64::consts::TAU * detune;
            if w != 0.0 {
                let bit = 1usize << q;
                for (i, v) in diag.iter_mut().enumerate() {
                    if (i & bit) != 0 {
                        *v += w;
                    }
                }
            }
        }
        let has_diag = diag.iter().any(|v| *v != 0.0);
        if has_diag {
            for i in 0..self.d {
                for j in 0..self.d {
                    let a = i * self.d + j;
                    let ph = (diag[i] - diag[j]) * dt;
                    if ph == 0.0 {
                        continue;
                    }
                    let c = ph.cos();
                    let s = ph.sin();
                    let re = self.rho.re[a];
                    let im = self.rho.im[a];
                    // e^{−i·ph}·(re + i·im)
                    self.rho.re[a] = re * c + im * s;
                    self.rho.im[a] = im * c - re * s;
                }
            }
        }

        // 3. Dissipators via Kraus maps (trace-preserving exactly).
        for q in 0..self.n {
            let g1 = 1.0 / self.noise.t1[q];
            let gphi = (1.0 / self.noise.t2[q] - g1 / 2.0).max(0.0) / 2.0;
            self.rho.amplitude_damping(q, g1 * dt);
            self.rho.pure_dephasing(q, gphi * dt);
        }
    }

    /// Evolve for `duration` in fixed `dt` sub-steps (ESM `evolve` parity).
    pub fn evolve(&mut self, duration: f64, dt: f64, drives: &[Drive]) -> f64 {
        let mut t = 0.0;
        while t < duration {
            let h = (dt.min(duration - t)).max(0.0);
            self.step(h, drives);
            t += h;
        }
        t
    }

    /// Projective-ish readout: sample a computational outcome from the
    /// populations, then flip each qubit bit with probability
    /// `1 − readout_fidelity` (readout bit-flip channel; identical RNG
    /// consumption order to the ESM `measure`).
    pub fn measure(&mut self, rng: &mut Mulberry32, readout_fidelity: f64) -> (usize, usize) {
        let d = self.d;
        let probs: Vec<f64> = (0..d).map(|i| self.rho.re[i * d + i].max(0.0)).collect();
        let total: f64 = probs.iter().sum();
        let total = if total == 0.0 { 1.0 } else { total };
        let mut r = rng.next_f64();
        let mut outcome = 0usize;
        for (i, p) in probs.iter().enumerate() {
            r -= p / total;
            if r <= 0.0 {
                outcome = i;
                break;
            }
        }
        let mut measured = outcome;
        for q in 0..self.n {
            if rng.next_f64() > readout_fidelity {
                measured ^= 1 << q;
            }
        }
        (outcome, measured)
    }
}

/// Average gate fidelity of a realized 2×2 unitary vs the ideal:
/// `F = (|Tr(U_ideal†·U_realized)|² + d) / (d(d+1))`.
///
/// Note: the 04-JSON fidelity formula carries a `(d+1)` denominator typo;
/// this is the standard correct normalization (same correction as the ESM
/// engine), so `F(ideal, ideal) = 1`.
pub fn average_gate_fidelity(realized: &Op2, ideal: &Op2) -> f64 {
    let mut tr_re = 0.0;
    let mut tr_im = 0.0;
    for i in 0..2 {
        for j in 0..2 {
            let ir = ideal.re[i * 2 + j];
            let ii = -ideal.im[i * 2 + j];
            let ur = realized.re[i * 2 + j];
            let ui = realized.im[i * 2 + j];
            tr_re += ir * ur - ii * ui;
            tr_im += ir * ui + ii * ur;
        }
    }
    let abs_tr2 = tr_re * tr_re + tr_im * tr_im;
    let d = 2.0;
    (abs_tr2 + d) / (d * (d + 1.0))
}
