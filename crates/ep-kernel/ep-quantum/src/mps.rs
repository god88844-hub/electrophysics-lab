//! Matrix Product State (MPS) engine — the offline low-entanglement path
//! (WP-5.3, 03 §4 / 02 §2.3).
//!
//! Exact representation of low-entanglement states up to
//! [`MPS_MAX_QUBITS`] = 500 qubits with a configurable bond-dimension cap
//! `chi_max`. Open-boundary MPS in the mixed canonical (Vidal) form with a
//! tracked orthogonality center; gates are applied by contracting the
//! supporting tensors and re-factorizing with an in-house complex
//! one-sided-Jacobi SVD ([`svd_complex`]).
//!
//! # Truncation
//!
//! Every factorization discards singular values below `s₀·1e-12` (lossless
//! numerical-zero compression) and enforces `chi_max`. Discarding NON-zero
//! weight is a truncation: its exact discarded weight `Σ s²` is accumulated
//! into [`TruncationTelemetry`] (reported as a 2-norm error) and flips the
//! provenance badge from [`MPS_PROVENANCE_EXACT`] (`SIMULATED_PHYSICS_MODEL`)
//! to [`MPS_PROVENANCE_TRUNCATED`] (`SIMULATED_NOISY_QUANTUM`, Builder Rule
//! 5) — the telemetry is never hidden.
//!
//! # Gates
//!
//! - 1-qubit gates at any site (exact tensor contraction).
//! - Nearest-neighbor 2-qubit gates via the two-site tensor + SVD.
//! - Long-range 2-qubit gates routed by explicit SWAP chains there and back
//!   (each SWAP itself an NN two-site gate; all truncations reported).
//!
//! # Observables
//!
//! Local expectation values `⟨ψ|O_k|ψ⟩` via full transfer-matrix
//! contraction, seeded sequential measurement sampling (exact conditional
//! projection per site), and full state-vector amplitudes for small `n`
//! (bounded: `2^n ≤ 2^16`) — the parity oracle against the exact
//! density-matrix solver ([`crate::lindblad::DensityMatrix`]) is asserted in
//! `tests/mps_oracle.rs` (≤ 1e-9 on 6-qubit seeded random circuits).
//!
//! # Admission (fail-closed, 02 §2.3)
//!
//! Construction is refused — with the honest `{ admitted, reason }` payload —
//! when `n > 500`, `chi_max = 0`, or the estimated working set
//! ([`mps_working_set_bytes`]: `n·(2·chi²)·16` bytes + header) exceeds the
//! ep-core arena budget (`AdmissionRequest::Arena`, ≤ 512 MB). Nothing is
//! allocated before admission.
//!
//! No unsafe; no I/O; wasm32-compatible.

use crate::lindblad::{Mulberry32, Op2};
use ep_core::admission::{AdmissionController, AdmissionDecision, AdmissionRequest};
use std::ops::{Add, Mul};

/// Structural ceiling of the MPS offline path (02 §2.3: up to 500 qubits).
pub const MPS_MAX_QUBITS: usize = 500;

/// Badge for an untruncated (exact) MPS representation.
pub const MPS_PROVENANCE_EXACT: &str = "SIMULATED_PHYSICS_MODEL";
/// Badge once any non-zero truncation weight has been discarded.
pub const MPS_PROVENANCE_TRUNCATED: &str = "SIMULATED_NOISY_QUANTUM";

/// Numerical-zero threshold relative to the largest singular value.
const S_REL_ZERO: f64 = 1e-12;

/// Estimated working-set bytes for an `n`-qubit MPS with cap `chi`:
/// `n·(2·chi²)·16` (complex f64 tensors, worst-case bonds) + header.
/// `None` on arithmetic overflow (refused upstream).
pub fn mps_working_set_bytes(n_qubits: usize, chi_max: usize) -> Option<u64> {
    let per_tensor = chi_max
        .checked_mul(2)?
        .checked_mul(chi_max)?
        .checked_mul(16)?;
    u64::try_from(n_qubits.checked_mul(per_tensor)?)
        .ok()?
        .checked_add(64)
}

/// Fail-closed ep-core admission for an MPS allocation (arena budget).
pub fn admit_mps(
    controller: &AdmissionController,
    n_qubits: usize,
    chi_max: usize,
) -> AdmissionDecision {
    if n_qubits == 0 {
        return AdmissionDecision {
            admitted: false,
            reason: "MPS: nQubits must be ≥ 1".into(),
        };
    }
    if n_qubits > MPS_MAX_QUBITS {
        return AdmissionDecision {
            admitted: false,
            reason: format!(
                "MPS cap: {n_qubits} qubits > {MPS_MAX_QUBITS} (the MPS offline path is bounded at 500; the interactive exact path covers ≤ 6)"
            ),
        };
    }
    if chi_max == 0 {
        return AdmissionDecision {
            admitted: false,
            reason: "MPS: chi_max must be ≥ 1".into(),
        };
    }
    let Some(bytes) = mps_working_set_bytes(n_qubits, chi_max) else {
        return AdmissionDecision {
            admitted: false,
            reason: format!(
                "MPS: working-set estimate overflows for {n_qubits} qubits × chi {chi_max} (refused, never clamped)"
            ),
        };
    };
    controller.admit(&AdmissionRequest::Arena { bytes })
}

/// Double-precision complex scalar.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct C64 {
    pub re: f64,
    pub im: f64,
}

impl std::ops::Mul for C64 {
    type Output = C64;
    fn mul(self, o: C64) -> C64 {
        C64 {
            re: self.re * o.re - self.im * o.im,
            im: self.re * o.im + self.im * o.re,
        }
    }
}

impl std::ops::Add for C64 {
    type Output = C64;
    fn add(self, o: C64) -> C64 {
        C64 {
            re: self.re + o.re,
            im: self.im + o.im,
        }
    }
}
impl C64 {
    pub const ZERO: C64 = C64 { re: 0.0, im: 0.0 };
    pub const ONE: C64 = C64 { re: 1.0, im: 0.0 };

    pub const fn new(re: f64, im: f64) -> Self {
        Self { re, im }
    }

    pub fn conj(self) -> C64 {
        C64 {
            re: self.re,
            im: -self.im,
        }
    }

    pub fn scale(self, s: f64) -> C64 {
        C64 {
            re: self.re * s,
            im: self.im * s,
        }
    }

    pub fn norm2(self) -> f64 {
        self.re * self.re + self.im * self.im
    }
}

/// One MPS site tensor: shape `(left_bond, 2, right_bond)`, row-major
/// complex storage.
#[derive(Debug, Clone)]
struct Tensor {
    dl: usize,
    dr: usize,
    data: Vec<C64>, // ((l·2 + phys)·dr + r)
}

impl Tensor {
    fn zeros(dl: usize, dr: usize) -> Self {
        Self {
            dl,
            dr,
            data: vec![C64::ZERO; dl * 2 * dr],
        }
    }

    #[inline]
    fn at(&self, l: usize, phys: usize, r: usize) -> C64 {
        self.data[(l * 2 + phys) * self.dr + r]
    }

    #[inline]
    fn set(&mut self, l: usize, phys: usize, r: usize, v: C64) {
        self.data[(l * 2 + phys) * self.dr + r] = v;
    }
}

/// Exact truncation telemetry (03 §4 "honest truncation-error reporting").
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct TruncationTelemetry {
    /// Number of factorizations that discarded non-zero weight.
    pub truncations: usize,
    /// Σ of every discarded singular-value weight (Σ s²). The accumulated
    /// 2-norm error bound is [`Self::error_norm`].
    pub discarded_weight: f64,
    /// Largest single-truncation discarded weight.
    pub max_discarded_weight: f64,
}

impl TruncationTelemetry {
    /// Accumulated truncation error as a 2-norm: `sqrt(Σ discarded weights)`.
    pub fn error_norm(&self) -> f64 {
        self.discarded_weight.sqrt()
    }
}

fn col_norm2(w: &[C64], rows: usize, cols: usize, col: usize) -> f64 {
    let mut s = 0.0;
    for i in 0..rows {
        s += w[i * cols + col].norm2();
    }
    s
}

/// ⟨w_p, w_q⟩ = Σ_i w_p[i]·conj(w_q[i]).
fn gram(w: &[C64], rows: usize, cols: usize, p: usize, q: usize) -> C64 {
    let mut s = C64::ZERO;
    for i in 0..rows {
        s = s.add(w[i * cols + p].mul(w[i * cols + q].conj()));
    }
    s
}

/// Complex SVD of a `rows×cols` row-major matrix via one-sided Jacobi.
/// Returns `(u, s, vt)` with `u` (rows×k), singular values `s` descending
/// (k = min(rows, cols)) and `vt` (k×cols): `g = u·diag(s)·vt`.
///
/// Wide matrices (`cols > rows`) are routed through the conjugate transpose
/// — one-sided Jacobi column orthogonalization is only reliable when the
/// column count does not exceed the ambient dimension (a wide matrix's
/// excess columns cannot be driven to zero by rotations alone).
pub fn svd_complex(g: &[C64], rows: usize, cols: usize) -> (Vec<C64>, Vec<f64>, Vec<C64>) {
    assert!(rows > 0 && cols > 0, "svd of empty matrix");
    let k = rows.min(cols);
    if cols > rows {
        // M = G† is tall: svd(M) = U_M·S·V_M† ⇒ G = V_M·S·U_M†.
        let m: Vec<C64> = (0..cols)
            .flat_map(|j| (0..rows).map(move |i| g[i * cols + j].conj()))
            .collect();
        let (u_m, s, vt_m) = svd_tall_core(&m, cols, rows);
        // u_G = V_M = conj-T(vt_m) — vt_m is (k × rows_G): conj-T → (rows_G × k).
        let u = conj_transpose(&vt_m, k, rows);
        // vt_G = U_M† = conj-T(u_m) — u_m is (cols_G × k): conj-T → (k × cols_G).
        let vt = conj_transpose(&u_m, cols, k);
        return (u, s, vt);
    }
    svd_tall_core(g, rows, cols)
}

/// `conj-transpose` of an R×C row-major matrix → C×R.
fn conj_transpose(m: &[C64], r: usize, c: usize) -> Vec<C64> {
    let mut out = vec![C64::ZERO; c * r];
    for i in 0..r {
        for j in 0..c {
            out[j * r + i] = m[i * c + j].conj();
        }
    }
    out
}

/// One-sided Jacobi core (requires `cols ≤ rows` — see [`svd_complex`]).
fn svd_tall_core(g: &[C64], rows: usize, cols: usize) -> (Vec<C64>, Vec<f64>, Vec<C64>) {
    let k = rows.min(cols);
    let mut w = g.to_vec();
    let mut v = vec![C64::ZERO; cols * cols];
    for j in 0..cols {
        v[j * cols + j] = C64::ONE;
    }
    for _sweep in 0..100 {
        let mut diag2 = 0.0f64;
        let mut off2 = 0.0f64;
        for p in 0..cols {
            diag2 += col_norm2(&w, rows, cols, p);
            for q in (p + 1)..cols {
                off2 += gram(&w, rows, cols, p, q).norm2();
            }
        }
        if off2 <= 1e-15 * diag2.max(1e-300) {
            break;
        }
        for p in 0..cols {
            for q in (p + 1)..cols {
                let a = col_norm2(&w, rows, cols, p);
                let b = col_norm2(&w, rows, cols, q);
                let gamma = gram(&w, rows, cols, p, q); // ⟨w_p, w_q⟩
                if gamma.norm2() <= 1e-30 * a.max(1e-300) * b.max(1e-300) {
                    continue; // already orthogonal
                }
                // 2×2 Hermitian [[a, γ],[conj γ, b]] — rotate to diagonal.
                let m = (a + b) / 2.0;
                let r = (((a - b) / 2.0).powi(2) + gamma.norm2()).sqrt();
                let l1 = m + r;
                let diff = l1 - a;
                let n1 = (gamma.norm2() + diff * diff).sqrt();
                if n1 == 0.0 {
                    continue;
                }
                // The Hermitian matrix in the J†·H·J sense carries the
                // conjugation on the FIRST factor: H01 = conj(⟨w_p, w_q⟩).
                // Eigenvectors: v1 = (H01, λ1−a), v2 = (λ1−a, −H01̄).
                let j11 = gamma.conj().scale(1.0 / n1);
                let j21 = C64::new(diff / n1, 0.0);
                let j12 = C64::new(diff / n1, 0.0);
                let j22 = gamma.scale(-1.0 / n1);
                for i in 0..rows {
                    let wp = w[i * cols + p];
                    let wq = w[i * cols + q];
                    w[i * cols + p] = wp.mul(j11).add(wq.mul(j21));
                    w[i * cols + q] = wp.mul(j12).add(wq.mul(j22));
                }
                for i in 0..cols {
                    let vp = v[i * cols + p];
                    let vq = v[i * cols + q];
                    v[i * cols + p] = vp.mul(j11).add(vq.mul(j21));
                    v[i * cols + q] = vp.mul(j12).add(vq.mul(j22));
                }
            }
        }
    }
    // Singular values = column norms; sort descending.
    let mut order: Vec<usize> = (0..cols).collect();
    let s_all: Vec<f64> = (0..cols)
        .map(|c| col_norm2(&w, rows, cols, c).sqrt())
        .collect();
    order.sort_by(|&x, &y| s_all[y].partial_cmp(&s_all[x]).expect("finite norms"));
    let s: Vec<f64> = order.iter().map(|&c| s_all[c]).collect();
    let mut u = vec![C64::ZERO; rows * k];
    for t in 0..k {
        let col = order[t];
        let st = s[t];
        if st <= 0.0 {
            continue;
        }
        for i in 0..rows {
            u[i * k + t] = w[i * cols + col].scale(1.0 / st);
        }
    }
    let mut vt = vec![C64::ZERO; k * cols];
    for t in 0..k {
        let col = order[t];
        for j in 0..cols {
            vt[t * cols + j] = v[j * cols + col].conj();
        }
    }
    (u, s, vt)
}

/// Truncated SVD of the two-site matrix: returns `(u, sv_carrier, kept,
/// discarded_weight)` with `u` (rows×kept) and the carrier `S·V†`
/// (kept×cols). Non-zero weight beyond `chi_max` is discarded and reported.
pub fn svd_truncate(
    m: &[C64],
    rows: usize,
    cols: usize,
    chi_max: usize,
) -> (Vec<C64>, Vec<C64>, usize, f64) {
    let k = rows.min(cols);
    let (u, s, vt) = svd_complex(m, rows, cols);
    let s_max = s[0];
    let significant = s.iter().filter(|&&v| v > s_max * S_REL_ZERO).count();
    let kept = significant.min(chi_max);
    let discarded: f64 = s[kept..significant].iter().map(|v| v * v).sum();
    // Remap the kept columns of the (rows × k) u into a (rows × kept) block —
    // a row-major prefix cut would keep the wrong entries whenever kept < k.
    let mut uc = vec![C64::ZERO; rows * kept];
    for i in 0..rows {
        for t in 0..kept {
            uc[i * kept + t] = u[i * k + t];
        }
    }
    let mut carrier = vec![C64::ZERO; kept * cols];
    for t in 0..kept {
        for j in 0..cols {
            carrier[t * cols + j] = vt[t * cols + j].scale(s[t]);
        }
    }
    (uc, carrier, kept, discarded)
}

/// 4×4 two-qubit gate, row-major: `m[(out·4 + in)]` with
/// `out = 2·out_a + out_b`, `in = 2·in_a + in_b` (|a b⟩ ordering).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Gate2 {
    pub m: [C64; 16],
}

impl Gate2 {
    /// SWAP: |a b⟩ → |b a⟩.
    pub const SWAP: Gate2 = Gate2 {
        m: [
            C64::ONE,
            C64::ZERO,
            C64::ZERO,
            C64::ZERO, //
            C64::ZERO,
            C64::ZERO,
            C64::ONE,
            C64::ZERO, //
            C64::ZERO,
            C64::ONE,
            C64::ZERO,
            C64::ZERO, //
            C64::ZERO,
            C64::ZERO,
            C64::ZERO,
            C64::ONE,
        ],
    };

    /// Identity.
    pub fn identity() -> Gate2 {
        let mut g = Gate2 { m: [C64::ZERO; 16] };
        for d in 0..4 {
            g.m[d * 4 + d] = C64::ONE;
        }
        g
    }

    /// CNOT with `a` control, `b` target: |10⟩→|11⟩, |11⟩→|10⟩.
    pub fn cnot() -> Gate2 {
        let mut g = Gate2 { m: [C64::ZERO; 16] };
        g.m[0] = C64::ONE; // out |00⟩ ← in |00⟩
        g.m[5] = C64::ONE; // out |01⟩ ← in |01⟩
        g.m[3 * 4 + 2] = C64::ONE; // out |11⟩ ← in |10⟩
        g.m[2 * 4 + 3] = C64::ONE; // out |10⟩ ← in |11⟩
        g
    }

    /// Controlled-Z: diag(1, 1, 1, −1).
    pub fn cz() -> Gate2 {
        let mut g = Gate2 { m: [C64::ZERO; 16] };
        for d in 0..3 {
            g.m[d * 4 + d] = C64::ONE;
        }
        g.m[3 * 4 + 3] = C64::new(-1.0, 0.0);
        g
    }

    /// Controlled `R_axis(θ)`: the target rotates iff the control is |1⟩
    /// (block-diagonal: identity on control-0, R(θ) on control-1).
    pub fn controlled_rotation(axis: crate::lindblad::Axis, theta: f64) -> Gate2 {
        let r = crate::lindblad::rotation(axis, theta);
        let mut g = Gate2 { m: [C64::ZERO; 16] };
        g.m[0] = C64::ONE; // control-0 block: identity
        g.m[5] = C64::ONE;
        for u in 0..2 {
            for v in 0..2 {
                g.m[(2 + u) * 4 + (2 + v)] = C64::new(r.re[u * 2 + v], r.im[u * 2 + v]);
            }
        }
        g
    }
}

/// Convert a 2×2 [`Op2`] into a 1-qubit gate matrix (4 C64 entries).
pub fn op2_to_mat(op: &Op2) -> [C64; 4] {
    let mut out = [C64::ZERO; 4];
    for (o, (re, im)) in out.iter_mut().zip(op.re.iter().zip(op.im.iter())) {
        *o = C64::new(*re, *im);
    }
    out
}

/// Transpose a 2-qubit gate's qubit order (qubit 0 ↔ 1).
fn transposed_gate(g: &Gate2) -> Gate2 {
    let mut out = Gate2 { m: [C64::ZERO; 16] };
    for row in 0..4 {
        for col in 0..4 {
            let r_t = (row % 2) * 2 + row / 2;
            let c_t = (col % 2) * 2 + col / 2;
            out.m[r_t * 4 + c_t] = g.m[row * 4 + col];
        }
    }
    out
}

/// Truncation telemetry + provenance badge carrier (WP-5.3).
#[derive(Debug, Clone)]
pub struct MpsSim {
    n: usize,
    chi_max: usize,
    tensors: Vec<Tensor>,
    center: usize,
    telemetry: TruncationTelemetry,
    truncated: bool,
}

impl MpsSim {
    /// Admission-gated constructor: all-zero product state |00…0⟩. Refuses
    /// (honest `{ admitted, reason }`) before any allocation when the ep-core
    /// arena budget cannot hold `n·(2·chi²)·16` bytes, when `n > 500`, or
    /// when `chi_max = 0`.
    pub fn new_admitted(
        n_qubits: usize,
        chi_max: usize,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let decision = admit_mps(controller, n_qubits, chi_max);
        if !decision.admitted {
            return Err(decision);
        }
        Ok(Self::build(n_qubits, chi_max, &[]))
    }

    /// Admission-gated product state: `bits[i] == true` puts qubit `i` in |1⟩.
    pub fn from_product_admitted(
        n_qubits: usize,
        bits: &[bool],
        chi_max: usize,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let decision = admit_mps(controller, n_qubits, chi_max);
        if !decision.admitted {
            return Err(decision);
        }
        assert_eq!(bits.len(), n_qubits, "one bit per qubit");
        Ok(Self::build(n_qubits, chi_max, bits))
    }

    fn build(n: usize, chi_max: usize, bits: &[bool]) -> Self {
        let mut tensors = Vec::with_capacity(n);
        for i in 0..n {
            let mut t = Tensor::zeros(1, 1);
            let phys = if i < bits.len() && bits[i] { 1 } else { 0 };
            t.set(0, phys, 0, C64::ONE);
            tensors.push(t);
        }
        Self {
            n,
            chi_max,
            tensors,
            center: 0,
            telemetry: TruncationTelemetry::default(),
            truncated: false,
        }
    }

    pub fn n_qubits(&self) -> usize {
        self.n
    }

    pub fn chi_max(&self) -> usize {
        self.chi_max
    }

    pub fn telemetry(&self) -> &TruncationTelemetry {
        &self.telemetry
    }

    /// Accumulated truncation error (2-norm over discarded weights).
    pub fn truncation_error_norm(&self) -> f64 {
        self.telemetry.error_norm()
    }

    /// Provenance badge: exact until any non-zero weight is discarded.
    pub fn provenance_badge(&self) -> &'static str {
        if self.truncated {
            MPS_PROVENANCE_TRUNCATED
        } else {
            MPS_PROVENANCE_EXACT
        }
    }

    /// Current bond dimensions (bond between site i and i+1 at index i).
    pub fn bond_dims(&self) -> Vec<usize> {
        (0..self.n.saturating_sub(1))
            .map(|i| self.tensors[i].dr)
            .collect()
    }

    fn record_truncation(&mut self, discarded: f64) {
        if discarded > 0.0 {
            self.truncated = true;
            self.telemetry.truncations += 1;
            self.telemetry.discarded_weight += discarded;
            self.telemetry.max_discarded_weight =
                self.telemetry.max_discarded_weight.max(discarded);
        }
    }

    /// Move the orthogonality center to `target` (exact: only numerical-zero
    /// singular values are dropped — zero discarded weight).
    /// Move the orthogonality center to `target` (exact: only numerical-zero
    /// singular values are dropped — zero discarded weight).
    fn move_center_to(&mut self, target: usize) {
        while self.center < target {
            let c = self.center;
            let dl = self.tensors[c].dl;
            let dr = self.tensors[c].dr;
            let mut m = vec![C64::ZERO; dl * 2 * dr];
            m.copy_from_slice(&self.tensors[c].data);
            let (u, s, vt) = svd_complex(&m, dl * 2, dr);
            let k = (dl * 2).min(dr);
            let s_max = s[0];
            let kept = s.iter().filter(|&&v| v > s_max * S_REL_ZERO).count().max(1);
            let mut a_c = Tensor::zeros(dl, kept);
            for l in 0..dl {
                for ph in 0..2 {
                    for kk in 0..kept {
                        // u is (dl·2 × k) row-major — stride k, never kept.
                        a_c.set(l, ph, kk, u[(l * 2 + ph) * k + kk]);
                    }
                }
            }
            // carrier = S·V† (kept × dr) multiplied into site c+1's left index.
            let mut updated = Tensor::zeros(kept, self.tensors[c + 1].dr);
            for kk in 0..kept {
                for r in 0..dr {
                    let cv = vt[kk * dr + r].scale(s[kk]);
                    for ph in 0..2 {
                        for r_n in 0..self.tensors[c + 1].dr {
                            let v = self.tensors[c + 1].at(r, ph, r_n);
                            *updated
                                .data
                                .get_mut((kk * 2 + ph) * updated.dr + r_n)
                                .expect("in range") = updated.at(kk, ph, r_n).add(cv.mul(v));
                        }
                    }
                }
            }
            self.tensors[c] = a_c;
            self.tensors[c + 1] = updated;
            self.center = c + 1;
        }
        while self.center > target {
            let c = self.center;
            let dl = self.tensors[c].dl;
            let dr = self.tensors[c].dr;
            let mut m = vec![C64::ZERO; dl * 2 * dr];
            m.copy_from_slice(&self.tensors[c].data);
            // Reshape (dl, 2·dr) — the same row-major data.
            let (u, s, vt) = svd_complex(&m, dl, 2 * dr);
            let k = dl.min(2 * dr);
            let s_max = s[0];
            let kept = s.iter().filter(|&&v| v > s_max * S_REL_ZERO).count().max(1);
            // A_c ← S·V† reshaped (kept, 2, dr) — right-canonical.
            let mut a_c = Tensor::zeros(kept, dr);
            for kk in 0..kept {
                for ph in 0..2 {
                    for r in 0..dr {
                        a_c.set(kk, ph, r, vt[kk * 2 * dr + ph * dr + r].scale(s[kk]));
                    }
                }
            }
            // carrier = U (dl × k) multiplied into site c−1's right index.
            let dl_p = self.tensors[c - 1].dl;
            debug_assert_eq!(self.tensors[c - 1].dr, dl);
            let mut updated = Tensor::zeros(dl_p, kept);
            for l_p in 0..dl_p {
                for ph in 0..2 {
                    for kk in 0..kept {
                        let mut acc = C64::ZERO;
                        for m_i in 0..dl {
                            // u is (dl × k) row-major — stride k, never kept.
                            acc =
                                acc.add(self.tensors[c - 1].at(l_p, ph, m_i).mul(u[m_i * k + kk]));
                        }
                        updated.set(l_p, ph, kk, acc);
                    }
                }
            }
            self.tensors[c] = a_c;
            self.tensors[c - 1] = updated;
            self.center = c - 1;
        }
    }

    /// Apply a 1-qubit gate at `site` (exact; moves the center there).
    pub fn apply_one_qubit(&mut self, site: usize, op: &Op2) {
        assert!(site < self.n, "site out of range");
        self.move_center_to(site);
        let mat = op2_to_mat(op);
        let (dl, dr) = (self.tensors[site].dl, self.tensors[site].dr);
        let mut updated = Tensor::zeros(dl, dr);
        for l in 0..dl {
            for a_out in 0..2 {
                for a_in in 0..2 {
                    let g = mat[a_out * 2 + a_in];
                    if g.norm2() == 0.0 {
                        continue;
                    }
                    for r in 0..dr {
                        let v = self.tensors[site].at(l, a_in, r);
                        updated.set(l, a_out, r, updated.at(l, a_out, r).add(g.mul(v)));
                    }
                }
            }
        }
        self.tensors[site] = updated;
    }

    /// Contract the two-site tensors at (a, a+1) into a (dl·2, 2·dr) matrix.
    fn contract_two_site(&self, a: usize) -> Vec<C64> {
        let (dl, dmid, dr) = (
            self.tensors[a].dl,
            self.tensors[a].dr,
            self.tensors[a + 1].dr,
        );
        let mut theta = vec![C64::ZERO; dl * 4 * dr];
        for l in 0..dl {
            for a_in in 0..2 {
                for b_in in 0..2 {
                    for r2 in 0..dr {
                        let mut acc = C64::ZERO;
                        for r in 0..dmid {
                            acc = acc.add(
                                self.tensors[a]
                                    .at(l, a_in, r)
                                    .mul(self.tensors[a + 1].at(r, b_in, r2)),
                            );
                        }
                        theta[((l * 2 + a_in) * 2 + b_in) * dr + r2] = acc;
                    }
                }
            }
        }
        theta
    }

    /// Apply a nearest-neighbor 2-qubit gate on sites `(a, a+1)`: gate
    /// qubit 0 → site `a`, gate qubit 1 → site `a+1`. Truncation to
    /// `chi_max` is reported in the telemetry.
    /// Apply a nearest-neighbor 2-qubit gate on sites `(a, a+1)`: gate
    /// qubit 0 → site `a`, gate qubit 1 → site `a+1`. Truncation to
    /// `chi_max` is reported in the telemetry.
    pub fn apply_two_qubit_nn(&mut self, a: usize, gate: &Gate2) {
        assert!(a + 1 < self.n, "NN gate needs a right neighbor");
        self.move_center_to(a);
        let dl = self.tensors[a].dl;
        let dr = self.tensors[a + 1].dr;
        let theta = self.contract_two_site(a);
        // Apply the gate on the physical pair: Θ'[(l α') (β' r)] =
        // Σ G[(α'β')(αβ)]·Θ[(l α)(β r)].
        let mut gated = vec![C64::ZERO; dl * 4 * dr];
        for l in 0..dl {
            for a_out in 0..2 {
                for b_out in 0..2 {
                    for r in 0..dr {
                        let mut acc = C64::ZERO;
                        for a_in in 0..2 {
                            for b_in in 0..2 {
                                acc = acc.add(
                                    gate.m[(a_out * 2 + b_out) * 4 + (a_in * 2 + b_in)]
                                        .mul(theta[((l * 2 + a_in) * 2 + b_in) * dr + r]),
                                );
                            }
                        }
                        gated[((l * 2 + a_out) * 2 + b_out) * dr + r] = acc;
                    }
                }
            }
        }
        // SVD-truncate: rows = dl·2, cols = 2·dr.
        let (u, carrier, kept, discarded) = svd_truncate(&gated, dl * 2, 2 * dr, self.chi_max);
        self.record_truncation(discarded);
        // Rebuild: A_a = U reshaped (dl, 2, kept); A_b = S·V† reshaped (kept, 2, dr).
        let mut a_new = Tensor::zeros(dl, kept);
        for l in 0..dl {
            for ph in 0..2 {
                for kk in 0..kept {
                    a_new.set(l, ph, kk, u[(l * 2 + ph) * kept + kk]);
                }
            }
        }
        let mut b_new = Tensor::zeros(kept, dr);
        for kk in 0..kept {
            for ph in 0..2 {
                for r in 0..dr {
                    b_new.set(kk, ph, r, carrier[(kk * 2 + ph) * dr + r]);
                }
            }
        }
        self.tensors[a] = a_new;
        self.tensors[a + 1] = b_new;
        self.center = a + 1;
    }

    /// Apply a SWAP between sites `(a, a+1)`.
    pub fn swap(&mut self, a: usize) {
        self.apply_two_qubit_nn(a, &Gate2::SWAP);
    }

    /// Apply a 2-qubit gate on arbitrary sites `(qa, qb)` — routes by explicit
    /// SWAP chains there and back (all truncations reported). Gate qubit 0
    /// always acts on `qa`, qubit 1 on `qb`.
    pub fn apply_two_qubit(&mut self, qa: usize, qb: usize, gate: &Gate2) {
        assert!(qa != qb, "distinct qubits required");
        let (lo, hi) = if qa < qb { (qa, qb) } else { (qb, qa) };
        // Route the low qubit up to hi−1.
        let mut pos = lo;
        while pos + 1 < hi {
            self.swap(pos);
            pos += 1;
        }
        // The routed (originally-lo) qubit now sits at site hi−1. The gate's
        // qubit 0 must act on it — transpose when the routed qubit was qb.
        let gate_here = if qa == lo {
            *gate
        } else {
            transposed_gate(gate)
        };
        self.apply_two_qubit_nn(hi - 1, &gate_here);
        // Route back down, restoring the original site ordering.
        for s in (lo..hi - 1).rev() {
            self.swap(s);
        }
    }

    /// Local expectation `⟨ψ|O_site|ψ⟩` via full transfer-matrix contraction
    /// (no canonical-form assumptions — exact for any MPS state).
    pub fn expectation_local(&self, site: usize, op: &Op2) -> C64 {
        assert!(site < self.n, "site out of range");
        let mat = op2_to_mat(op);
        let mut env = vec![C64::ONE];
        let mut dl_pair = 1usize;
        for j in 0..self.n {
            let t = &self.tensors[j];
            let dr = t.dr;
            let mut next = vec![C64::ZERO; dr * dr];
            for l in 0..t.dl {
                for l2 in 0..t.dl {
                    let e = env[l * dl_pair + l2];
                    if e.norm2() == 0.0 {
                        continue;
                    }
                    for a_out in 0..2 {
                        for a_in in 0..2 {
                            let o = if j == site {
                                mat[a_out * 2 + a_in]
                            } else if a_out == a_in {
                                C64::ONE
                            } else {
                                C64::ZERO
                            };
                            if o.norm2() == 0.0 {
                                continue;
                            }
                            for r in 0..dr {
                                for r2 in 0..dr {
                                    let ket = t.at(l, a_in, r);
                                    let bra = t.at(l2, a_out, r2).conj();
                                    next[r * dr + r2] =
                                        next[r * dr + r2].add(e.mul(ket).mul(o).mul(bra));
                                }
                            }
                        }
                    }
                }
            }
            env = next;
            dl_pair = dr;
        }
        env[0]
    }

    /// `⟨ψ|ψ⟩`.
    pub fn norm_squared(&self) -> f64 {
        self.expectation_local(0, &crate::lindblad::ops::I).re
    }

    /// Full state-vector amplitudes (2^n, computational basis). Bounded:
    /// refuses `n > 16` — the offline path's observables do not need dense
    /// amplitudes; this exists for the exact-parity oracle.
    pub fn amplitudes(&self) -> Result<Vec<C64>, String> {
        if self.n > 16 {
            return Err(format!(
                "amplitudes: 2^{} exceeds the dense vector cap 2^16 (use observables/sampling for large n)",
                self.n
            ));
        }
        let mut v: Vec<C64> = vec![C64::ONE]; // (2^j states) × (left bond)
        let mut dl = 1usize;
        for t in &self.tensors {
            let states = v.len() / dl.max(1);
            let mut next = vec![C64::ZERO; states * 2 * t.dr];
            for b in 0..states {
                for l in 0..t.dl {
                    let amp = v[b * dl + l];
                    if amp.norm2() == 0.0 {
                        continue;
                    }
                    for a in 0..2 {
                        for r in 0..t.dr {
                            let out = b * 2 + a;
                            next[out * t.dr + r] = next[out * t.dr + r].add(amp.mul(t.at(l, a, r)));
                        }
                    }
                }
            }
            v = next;
            dl = t.dr;
        }
        debug_assert_eq!(dl, 1);
        Ok(v)
    }

    /// Seeded sequential measurement sampling: exact conditional projection
    /// per site (`p₀ = ⟨Π₀⟩/⟨I⟩`), one bit per qubit (true = |1⟩).
    /// Non-destructive — the projection runs on an internal clone (ESM
    /// `measure` parity: repeated shots sample the same state).
    pub fn sample_bits(&self, rng: &mut Mulberry32) -> Vec<bool> {
        let mut work = self.clone();
        let p0_op = Op2::new([1.0, 0.0, 0.0, 0.0], [0.0; 4]); // |0⟩⟨0|
        let p1_op = Op2::new([0.0, 0.0, 0.0, 1.0], [0.0; 4]); // |1⟩⟨1|
        let mut bits = Vec::with_capacity(work.n);
        for i in 0..work.n {
            let norm = work.norm_squared().max(1e-300);
            let p0 = (work.expectation_local(i, &p0_op).re / norm).clamp(0.0, 1.0);
            let bit = if rng.next_f64() < p0 { 0usize } else { 1usize };
            work.apply_one_qubit(i, if bit == 0 { &p0_op } else { &p1_op });
            bits.push(bit == 1);
        }
        bits
    }

    /// `sample_bits` packed into a u64 (n ≤ 64; bit i = qubit i).
    pub fn sample_u64(&self, rng: &mut Mulberry32) -> Result<u64, String> {
        if self.n > 64 {
            return Err(format!(
                "sample_u64: {} qubits > 64 — use sample_bits",
                self.n
            ));
        }
        let bits = self.sample_bits(rng);
        let mut out = 0u64;
        for (i, b) in bits.iter().enumerate() {
            if *b {
                out |= 1u64 << i;
            }
        }
        Ok(out)
    }
}

/// Apply a 4×4 two-qubit gate to the exact density matrix (bit `qa` = gate
/// qubit 0, bit `qb` = gate qubit 1) — the MPS↔exact cross-check helper.
pub fn apply_two_qubit_to_density(
    rho: &mut crate::lindblad::DensityMatrix,
    qa: usize,
    qb: usize,
    gate: &Gate2,
) {
    let d = rho.d;
    let ba = 1usize << qa;
    let bb = 1usize << qb;
    let mut n_re = vec![0.0; d * d];
    let mut n_im = vec![0.0; d * d];
    for i in 0..d {
        for j in 0..d {
            let ai = ((i & ba) != 0) as usize;
            let bi = ((i & bb) != 0) as usize;
            let aj = ((j & ba) != 0) as usize;
            let bj = ((j & bb) != 0) as usize;
            let v = C64::new(rho.re[i * d + j], rho.im[i * d + j]);
            for a_out in 0..2usize {
                for b_out in 0..2usize {
                    let i2 = (i & !(ba | bb)) | ((a_out << qa) & ba) | ((b_out << qb) & bb);
                    for a_out_j in 0..2usize {
                        for b_out_j in 0..2usize {
                            let j2 =
                                (j & !(ba | bb)) | ((a_out_j << qa) & ba) | ((b_out_j << qb) & bb);
                            let k_out = gate.m[(a_out * 2 + b_out) * 4 + (ai * 2 + bi)];
                            let k_out_j = gate.m[(a_out_j * 2 + b_out_j) * 4 + (aj * 2 + bj)];
                            let prod = v.mul(k_out).mul(k_out_j.conj());
                            n_re[i2 * d + j2] += prod.re;
                            n_im[i2 * d + j2] += prod.im;
                        }
                    }
                }
            }
        }
    }
    rho.re = n_re;
    rho.im = n_im;
}
