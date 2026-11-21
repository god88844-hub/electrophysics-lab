//! Pauli-frame Clifford / stabilizer QEC kernel (WP-5.2).
//!
//! High-speed **bit-packed** Pauli-frame simulator for 50–500+ qubit frames
//! (PHASE-05 WP-5.2 checklist: "Pauli-frame stabilizer frame for 50–500+
//! qubits (bitset tableau)"), plus repetition/bit-flip codes and the rotated
//! surface code (`d = 3, 5, 7`) with syndrome extraction and the decoder
//! classes named by the checklist (weight-1 **lookup**, exact **MWPM**,
//! **union-find**). Every output surface is badged
//! [`QEC_PROVENANCE`] = `SIMULATED_NOISY_QUANTUM` (Builder Rule 5).
//!
//! # Pauli frame
//!
//! The frame stores, per qubit, two error bits `x[q]` / `z[q]` packed into
//! `u64` words (64 qubits per word per axis). Circuit outcomes are
//! deterministic in the noiseless frame; injected Pauli errors propagate
//! through the Clifford circuit exactly as in the ESM oracle
//! `packages/quantum-engine/src/stabilizer.mjs`:
//!
//! ```text
//!   CNOT(c,t): X_c → X_cX_t, Z_t → Z_tZ_c, X_t → X_t, Z_c → Z_c
//!   H(q):  X ↔ Z
//!   S(q):  X → Y (= X·Z in frame), Z → Z
//!   CZ(c,t): X_c → X_cZ_t, X_t → Z_cX_t, Z_c/Z_t unchanged
//! ```
//!
//! (The kernel's CZ is the textbook diagonal-gate rule — bit-exact
//! equivalent to `H(t)·CNOT(c,t)·H(t)`. The ESM `cz` differs by a
//! sequential-order artifact that flips the target X bit; see the
//! [`PauliFrame::cz`] documented deviation. No ESM CI oracle path calls
//! `cz`, so parity is unaffected.)
//!
//! Per-qubit ops are O(1) bit operations; whole-frame layers run
//! word-parallel (SIMD-friendly), which is what makes 500+ qubit frames
//! fast (see [`PauliFrame::hadamard_all`], [`PauliFrame::cnot_chain`], …).
//!
//! # Determinism
//!
//! All noise is drawn from the crate's `Mulberry32` stream — the bit-exact
//! port of the ESM `mulberry32` (fixed-seed experiment reproducibility,
//! 02 §2.1 "Deterministic seeding via a single kernel-level PRNG stream").
//! Trial `i` of a sweep uses seed `seed + i` and a fixed, documented draw
//! order, so a given (trials, p, seed) triple reproduces bit-exactly.
//!
//! # Admission (Law 4)
//!
//! Frame construction is fail-closed gated through **ep-core**: the
//! bit-packed working set (2 × 8 bytes per 64-qubit word block + header)
//! is admitted against the 512 MB kernel arena budget
//! ([`qec_frame_working_set_bytes`] → `AdmissionRequest::Arena`); refusals
//! carry the honest `{ admitted, reason }` payload. Code geometry is
//! validated at construction time by the test suite (CSS commutation,
//! stabilizer independence, exact distance).
//!
//! # Noise model (declared scope)
//!
//! *Repetition / bit-flip codes*: iid **X** (bit-flip) noise on data
//! qubits, one syndrome round, weight-1 lookup decode — bit-exact replica
//! of the ESM oracle algorithms (`runBitFlipCodeTrial` for `d = 3`,
//! `runSurfaceCodeTrial` for the `d = 5` repetition segment).
//!
//! *Rotated surface code*: **code-capacity** noise — independent X and/or Z
//! errors on data qubits, one perfect-syndrome round extracted through the
//! real ancilla CNOT/H circuits (hook-error propagation included by the
//! frame), decoded per CSS sector. This is the standard Stim-class
//! code-capacity model; the logical-vs-physical sweep is deterministic
//! under fixed seeds and shows quadratic suppression at `p = 0.05` plus the
//! below/above-threshold behavior asserted in `tests/qec_oracle.rs`
//! (03 §5 oracle tolerance: logical rate ± 0.5 % absolute vs the
//! exhaustive-enumeration reference — strictly stronger than a Stim
//! sampling reference).
//!
//! No unsafe; no I/O; wasm32-compatible.

use std::collections::HashMap;

use crate::lindblad::Mulberry32;
use ep_core::admission::{AdmissionController, AdmissionDecision, AdmissionRequest};

/// Provenance badge carried by every WP-5.2 output surface (Law 5).
pub const QEC_PROVENANCE: &str = "SIMULATED_NOISY_QUANTUM";

const WORD_BITS: usize = 64;
/// Frame header bytes (length/word-count bookkeeping estimate).
const FRAME_HEADER_BYTES: u64 = 24;
/// Syndrome size above which the exact subset-DP MWPM hands off to the
/// union-find decoder (2^k·k DP; k ≤ 14 stays exact and fast).
const MWPM_MAX_SYNDROME: usize = 14;

// ---------------------------------------------------------------- -----
// Bit-packed Pauli frame
// ---------------------------------------------------------------------

#[inline]
fn word_of(q: usize) -> usize {
    q / WORD_BITS
}

#[inline]
fn bit_of(q: usize) -> u64 {
    1u64 << (q % WORD_BITS)
}

/// Bit-packed Pauli frame over `n` qubits — the Rust kernel analogue of the
/// ESM `PauliFrame` (`stabilizer.mjs`), packed to 64 qubits per word per
/// axis for 50–500+ qubit frames. Bits at positions ≥ n are kept zero as an
/// invariant (every operation preserves it).
///
/// Semantics are per-qubit bit-exact with the ESM engine: the conjugation
/// rules in the module docs apply one qubit at a time, so any ESM frame
/// state maps 1:1 onto this frame's `x`/`z` bits.
pub struct PauliFrame {
    n: usize,
    words: usize,
    x: Vec<u64>,
    z: Vec<u64>,
}

impl PauliFrame {
    /// Admission-gated constructor (ep-core arena budget, Law 4).
    pub fn new_admitted(
        n_qubits: usize,
        controller: &AdmissionController,
    ) -> Result<Self, AdmissionDecision> {
        let decision = admit_qec_frame(controller, n_qubits);
        if decision.admitted {
            Ok(Self::new_unchecked(n_qubits))
        } else {
            Err(decision)
        }
    }

    /// Unchecked constructor — only for internally admission-validated sizes.
    fn new_unchecked(n_qubits: usize) -> Self {
        let words = n_qubits.div_ceil(WORD_BITS);
        Self {
            n: n_qubits,
            words,
            x: vec![0u64; words],
            z: vec![0u64; words],
        }
    }

    pub fn n_qubits(&self) -> usize {
        self.n
    }

    /// Zero the whole frame (fresh-trial reuse; deterministic).
    pub fn reset(&mut self) {
        self.x.iter_mut().for_each(|w| *w = 0);
        self.z.iter_mut().for_each(|w| *w = 0);
    }

    /// Clear one qubit's error bits (fresh-ancilla reset per round).
    pub fn clear(&mut self, q: usize) {
        let (w, b) = (word_of(q), bit_of(q));
        self.x[w] &= !b;
        self.z[w] &= !b;
    }

    /// H(q): X ↔ Z swap (ESM `hadamard`).
    pub fn hadamard(&mut self, q: usize) {
        let (w, b) = (word_of(q), bit_of(q));
        let xq = self.x[w] & b;
        let zq = self.z[w] & b;
        self.x[w] = (self.x[w] & !b) | zq;
        self.z[w] = (self.z[w] & !b) | xq;
    }

    /// S(q): X → Y (= X·Z in frame), Z → Z (ESM `phaseGate`).
    pub fn phase_gate(&mut self, q: usize) {
        let (w, b) = (word_of(q), bit_of(q));
        if self.x[w] & b != 0 {
            self.z[w] ^= b;
        }
    }

    /// CNOT(c,t): X_c → X_cX_t, Z_t → Z_tZ_c (ESM `cnot`). Requires c ≠ t.
    pub fn cnot(&mut self, control: usize, target: usize) {
        debug_assert_ne!(control, target, "CNOT control and target must differ");
        let (wc, bc) = (word_of(control), bit_of(control));
        let (wt, bt) = (word_of(target), bit_of(target));
        if self.x[wc] & bc != 0 {
            self.x[wt] ^= bt;
        }
        if self.z[wt] & bt != 0 {
            self.z[wc] ^= bc;
        }
    }

    /// CZ(c,t): X_c → X_c Z_t, X_t → Z_c X_t, Z_c/Z_t unchanged (CZ is
    /// diagonal, so X bits never change under its conjugation). Requires
    /// c ≠ t.
    ///
    /// *Documented ESM deviation (WP-5.1 precedent)*: the ESM `cz`
    /// (`stabilizer.mjs`) additionally flips the target X bit from the
    /// (just-updated) control Z bit — a sequential-order artifact that
    /// contradicts both the diagonal-gate algebra and its own doc comment.
    /// The kernel implements the textbook rule, which is bit-exact
    /// equivalent to `hadamard(t); cnot(c, t); hadamard(t)` (asserted in
    /// tests). No ESM CI oracle path exercises `cz` (its bit-flip /
    /// repetition trials never call it), so parity is unaffected.
    pub fn cz(&mut self, control: usize, target: usize) {
        debug_assert_ne!(control, target, "CZ control and target must differ");
        let (wc, bc) = (word_of(control), bit_of(control));
        let (wt, bt) = (word_of(target), bit_of(target));
        if self.x[wt] & bt != 0 {
            self.z[wc] ^= bc;
        }
        if self.x[wc] & bc != 0 {
            self.z[wt] ^= bt;
        }
    }

    pub fn inject_x(&mut self, q: usize) {
        self.x[word_of(q)] ^= bit_of(q);
    }

    pub fn inject_z(&mut self, q: usize) {
        self.z[word_of(q)] ^= bit_of(q);
    }

    pub fn inject_y(&mut self, q: usize) {
        let (w, b) = (word_of(q), bit_of(q));
        self.x[w] ^= b;
        self.z[w] ^= b;
    }

    /// Z-basis readout of `q`: `base ^ x[q]` (ESM `readZ`).
    pub fn read_z(&self, q: usize, base: u8) -> u8 {
        base ^ u8::from(self.x[word_of(q)] & bit_of(q) != 0)
    }

    /// X-basis readout of `q`: `base ^ z[q]` (X observable flip).
    pub fn read_x(&self, q: usize, base: u8) -> u8 {
        base ^ u8::from(self.z[word_of(q)] & bit_of(q) != 0)
    }

    /// Raw frame bits (parity/oracle plumbing and tests).
    pub fn x_bit(&self, q: usize) -> u8 {
        u8::from(self.x[word_of(q)] & bit_of(q) != 0)
    }

    pub fn z_bit(&self, q: usize) -> u8 {
        u8::from(self.z[word_of(q)] & bit_of(q) != 0)
    }

    /// Parity of a set of Z readouts (ESM `parityZ`) — XOR of X-frame bits.
    pub fn parity_z(&self, qubits: &[usize]) -> u8 {
        qubits.iter().fold(0u8, |p, &q| p ^ self.read_z(q, 0))
    }

    /// Parity of a set of X readouts — XOR of Z-frame bits.
    pub fn parity_x(&self, qubits: &[usize]) -> u8 {
        qubits.iter().fold(0u8, |p, &q| p ^ self.read_x(q, 0))
    }

    // ---- word-parallel bulk layers (the 500+ qubit fast path) ----

    /// H on every qubit — whole-word swaps, tail bits stay zero.
    pub fn hadamard_all(&mut self) {
        for w in 0..self.words {
            std::mem::swap(&mut self.x[w], &mut self.z[w]);
        }
    }

    /// S on every qubit — `z ^= x` per word (tail x-bits are zero).
    pub fn phase_gate_all(&mut self) {
        for w in 0..self.words {
            self.z[w] ^= self.x[w];
        }
    }

    /// CNOT ladder `i → i+1` for all `i` (a stabilizer-round-like layer).
    pub fn cnot_chain(&mut self) {
        for q in 0..self.n - 1 {
            self.cnot(q, q + 1);
        }
    }

    /// CZ on adjacent pairs `(0,1), (2,3), …`.
    pub fn cz_adjacent_pairs(&mut self) {
        let mut q = 0;
        while q + 1 < self.n {
            self.cz(q, q + 1);
            q += 2;
        }
    }

    /// Seeded iid X/Z injection over the whole frame (2 PRNG draws per
    /// qubit, fixed ascending order — deterministic).
    pub fn inject_random_xz(&mut self, rng: &mut Mulberry32, p_x: f64, p_z: f64) {
        for q in 0..self.n {
            if rng.next_f64() < p_x {
                self.inject_x(q);
            }
            if rng.next_f64() < p_z {
                self.inject_z(q);
            }
        }
    }

    /// Parity of all Z readouts (popcount parity of the X words).
    pub fn parity_z_all(&self) -> u8 {
        let bits = self
            .x
            .iter()
            .map(|w| w.count_ones() as usize)
            .sum::<usize>();
        (bits & 1) as u8
    }

    pub fn x_popcount(&self) -> usize {
        self.x.iter().map(|w| w.count_ones() as usize).sum()
    }

    pub fn z_popcount(&self) -> usize {
        self.z.iter().map(|w| w.count_ones() as usize).sum()
    }
}

// ---------------------------------------------------------------- -----
// Admission (ep-core, Law 4)
// ---------------------------------------------------------------------

/// Bit-packed frame working set: 2 axes × 8 bytes per 64-qubit word block
/// + a fixed header estimate. `None` on arithmetic overflow (refused).
pub fn qec_frame_working_set_bytes(n_qubits: usize) -> Option<u64> {
    let words = n_qubits.checked_add(WORD_BITS - 1)? / WORD_BITS;
    let bytes = (u64::try_from(words).ok()?)
        .checked_mul(2 * 8)?
        .checked_add(FRAME_HEADER_BYTES)?;
    Some(bytes)
}

/// Fail-closed ep-core admission for a QEC frame allocation. The arena
/// budget (512 MB, Law 4) admits > 2·10⁹ bit-packed frame qubits and
/// refuses absurd requests with the honest reason payload.
pub fn admit_qec_frame(controller: &AdmissionController, n_qubits: usize) -> AdmissionDecision {
    if n_qubits == 0 {
        return AdmissionDecision {
            admitted: false,
            reason: "qec frame: nQubits must be ≥ 1".into(),
        };
    }
    let Some(bytes) = qec_frame_working_set_bytes(n_qubits) else {
        return AdmissionDecision {
            admitted: false,
            reason: format!(
                "qec frame: {n_qubits} qubits exceeds the frame size ceiling (bitset overflow)"
            ),
        };
    };
    controller.admit(&AdmissionRequest::Arena { bytes })
}

// ---------------------------------------------------------------- -----
// GF(2) bitset helpers (stabilizer linear algebra)
// ---------------------------------------------------------------------

/// Highest set bit position of a `words`-wide bitset (0 = empty).
fn gf2_lead(row: &[u64]) -> Option<usize> {
    row.iter()
        .enumerate()
        .rev()
        .find(|(_, w)| **w != 0)
        .map(|(i, w)| i * WORD_BITS + 63 - w.leading_zeros() as usize)
}

/// Row-reduce-insert `v` into an echelon basis (rows sorted by highest set
/// bit, descending). Bit q of a support lives in word q/64, bit q%64.
fn gf2_insert(basis: &mut Vec<Vec<u64>>, v: &[u64]) {
    let mut r = v.to_vec();
    for b in basis.iter() {
        if let Some(lead) = gf2_lead(b) {
            if r[lead / WORD_BITS] & bit_of(lead) != 0 {
                for w in 0..r.len() {
                    r[w] ^= b[w];
                }
            }
        }
    }
    if r.iter().any(|w| *w != 0) {
        basis.push(r);
        basis.sort_by_key(|row| std::cmp::Reverse(gf2_lead(row)));
    }
}

/// Membership test of `v` in the echelon basis (reduces to zero).
fn gf2_contains(basis: &[Vec<u64>], v: &[u64]) -> bool {
    let mut r = v.to_vec();
    for b in basis.iter() {
        if let Some(lead) = gf2_lead(b) {
            if r[lead / WORD_BITS] & bit_of(lead) != 0 {
                for w in 0..r.len() {
                    r[w] ^= b[w];
                }
            }
        }
    }
    r.iter().all(|w| *w == 0)
}

fn support_to_bitset(support: &[usize], words: usize) -> Vec<u64> {
    let mut v = vec![0u64; words];
    for &q in support {
        v[word_of(q)] |= bit_of(q);
    }
    v
}

fn bitset_to_support(v: &[u64]) -> Vec<usize> {
    let mut out = Vec::new();
    for (w, bits) in v.iter().enumerate() {
        let mut b = *bits;
        while b != 0 {
            out.push(w * WORD_BITS + b.trailing_zeros() as usize);
            b &= b - 1;
        }
    }
    out.sort_unstable();
    out
}

fn bitset_weight(v: &[u64]) -> usize {
    v.iter().map(|w| w.count_ones() as usize).sum()
}

// ---------------------------------------------------------------- -----
// Repetition / bit-flip code (ESM-oracle replica, generic distance d)
// ---------------------------------------------------------------------

/// One seeded repetition-code trial — field-for-field the ESM oracle output
/// (`runBitFlipCodeTrial` / `runSurfaceCodeTrial`).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RepetitionTrial {
    /// Logical readout: parity of the data Z values (X-frame parity after
    /// the optional correction) — 1 = logical failure.
    pub logical_bit: u8,
    /// Z-parity syndrome bits (one per ancilla).
    pub syndrome: Vec<u8>,
    /// Lookup correction (data qubit index, or −1 = no single-error match).
    pub correction: i64,
}

/// Distance-`d` (odd) repetition / bit-flip code: `d` data qubits in a chain
/// plus `d − 1` Z-parity ancillas (CNOT ladder measuring `Z_a Z_{a+1}`),
/// weight-1 lookup decode, logical readout = parity of the data Z values.
///
/// For `d = 3` this is the ESM 3-qubit bit-flip code; for `d = 5` it is the
/// ESM "distance-3 repetition surface-code segment". The per-trial PRNG
/// consumption (exactly `d` draws, one per data qubit, seed `seed`) and the
/// lookup-decoder signatures are **bit-exact replicas** of
/// `packages/quantum-engine/src/stabilizer.mjs` — asserted against captured
/// ESM outputs in `tests/qec_oracle.rs`.
pub struct RepetitionCode {
    d: usize,
    data: Vec<usize>,
    n_frame: usize,
}

impl RepetitionCode {
    /// Fail-closed constructor: geometry validation + ep-core arena
    /// admission for the per-trial frame.
    pub fn new(d: usize) -> Result<Self, AdmissionDecision> {
        if d < 3 || d.is_multiple_of(2) {
            return Err(AdmissionDecision {
                admitted: false,
                reason: format!("repetition code: distance must be odd and ≥ 3 (got {d})"),
            });
        }
        let n_frame = 2 * d - 1;
        let controller = AdmissionController::new();
        let decision = admit_qec_frame(&controller, n_frame);
        if !decision.admitted {
            return Err(decision);
        }
        Ok(Self {
            d,
            data: (0..d).collect(),
            n_frame,
        })
    }

    pub fn d(&self) -> usize {
        self.d
    }

    pub fn n_frame_qubits(&self) -> usize {
        self.n_frame
    }

    /// One seeded trial — bit-exact replica of the ESM algorithm: fresh
    /// `mulberry32(seed)` stream, exactly `d` draws (one per data qubit, in
    /// ascending order), CNOT-ladder syndrome extraction, weight-1 lookup
    /// decode, parity readout. Sweep trial `i` uses seed `seed + i`
    /// (ESM `seed + i`).
    pub fn trial(&self, p: f64, seed: u32) -> RepetitionTrial {
        let d = self.d;
        let mut frame = PauliFrame::new_unchecked(self.n_frame);
        let mut rng = Mulberry32::new(seed);
        // Independent bit-flip channel on data (ESM draw order: q = 0..d).
        for q in 0..d {
            if rng.next_f64() < p {
                frame.inject_x(q);
            }
        }
        // Syndrome extraction: ancilla a measures Z_a_data · Z_{a+1}_data.
        let mut syndrome = vec![0u8; d - 1];
        for (a, slot) in syndrome.iter_mut().enumerate() {
            let anc = d + a;
            frame.cnot(a, anc);
            frame.cnot(a + 1, anc);
            *slot = frame.read_z(anc, 0);
        }
        // Weight-1 lookup decoder: an X error on q flips ancillas q and
        // q−1 (in range). The ESM d=3 table (1,0)→0, (0,1)→2, (1,1)→1
        // falls out exactly; unmatched (multi-error) syndromes get no
        // correction.
        let mut correction: i64 = -1;
        for q in 0..d {
            let mut sig = vec![0u8; d - 1];
            if q < d - 1 {
                sig[q] = 1;
            }
            if q > 0 {
                sig[q - 1] = 1;
            }
            if sig == syndrome {
                correction = q as i64;
            }
        }
        if correction >= 0 {
            frame.inject_x(correction as usize);
        }
        let logical_bit = frame.parity_z(&self.data);
        RepetitionTrial {
            logical_bit,
            syndrome,
            correction,
        }
    }

    /// Seeded logical error rate over `trials` trials (trial i: seed+i).
    pub fn logical_error_rate(&self, trials: usize, p: f64, seed: u32) -> f64 {
        let errors = (0..trials as u32)
            .filter(|i| self.trial(p, seed.wrapping_add(*i)).logical_bit == 1)
            .count();
        errors as f64 / trials as f64
    }
}

/// ESM oracle replica: `runBitFlipCodeTrial(p, seed)` (3-qubit bit-flip code).
pub fn esm_run_bit_flip_trial(p: f64, seed: u32) -> RepetitionTrial {
    RepetitionCode::new(3).expect("d=3 admitted").trial(p, seed)
}

/// ESM oracle replica: `bitFlipLogicalErrorRate(trials, p, seed)`.
pub fn esm_bit_flip_logical_error_rate(trials: usize, p: f64, seed: u32) -> f64 {
    RepetitionCode::new(3)
        .expect("d=3 admitted")
        .logical_error_rate(trials, p, seed)
}

/// ESM oracle replica: `runSurfaceCodeTrial(p, seed)` (the d=5 repetition
/// segment the ESM engine ships before this WP's full rotated code).
pub fn esm_run_surface_trial(p: f64, seed: u32) -> RepetitionTrial {
    RepetitionCode::new(5).expect("d=5 admitted").trial(p, seed)
}

/// ESM oracle replica: `surfaceCodeLogicalErrorRate(trials, p, seed)`.
pub fn esm_surface_logical_error_rate(trials: usize, p: f64, seed: u32) -> f64 {
    RepetitionCode::new(5)
        .expect("d=5 admitted")
        .logical_error_rate(trials, p, seed)
}

// ---------------------------------------------------------------- -----
// Decoding graphs + decoder classes
// ---------------------------------------------------------------------

/// Which decoder class resolves a syndrome into a correction.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DecoderKind {
    /// Weight-1 lookup: exact single-error syndrome→qubit table; unmatched
    /// (multi-error) syndromes get no correction (honest limitation).
    Lookup,
    /// Exact minimum-weight perfect matching: min-weight T-join via the
    /// shortest-path metric closure + subset-DP pairing (syndromes up to
    /// `MWPM_MAX_SYNDROME` defects; larger ones hand off to union-find).
    Mwpm,
    /// Union-find cluster-merging decoder (Delfosse–Nickerson style:
    /// syndrome-driven growth to neutrality + spanning-forest peeling).
    UnionFind,
}

/// CSS sector: which Pauli type the correction acts on. The X sector (X
/// corrections) is decoded from the Z-check syndrome over the Z-check graph
/// and vice versa.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PauliSector {
    X,
    Z,
}

/// X-error (or Z-error) decoding graph: vertices = stabilizer checks of one
/// type + boundary vertices; one edge per data qubit joining the (one or
/// two) checks it touches. Boundary vertices are free parity endpoints.
pub(crate) struct DecodingGraph {
    pub n_stabs: usize,
    /// Per vertex: (neighbor vertex, data qubit forming the edge).
    pub adj: Vec<Vec<(usize, usize)>>,
}

impl DecodingGraph {
    fn new(n_stabs: usize, supports: &[Vec<usize>], n_data: usize) -> Self {
        let mut boundary_of: HashMap<usize, usize> = HashMap::new();
        for q in 0..n_data {
            let count = supports.iter().filter(|s| s.contains(&q)).count();
            debug_assert!(count <= 2, "a qubit touches at most 2 checks of one type");
            if count == 0 {
                panic!("decoding graph: data qubit {q} touches no check of this type");
            }
            if count == 1 {
                boundary_of.insert(q, boundary_of.len());
            }
        }
        let n_boundary = boundary_of.len();
        let mut adj = vec![Vec::new(); n_stabs + n_boundary];
        for q in 0..n_data {
            let cs: Vec<usize> = supports
                .iter()
                .enumerate()
                .filter(|(_, s)| s.contains(&q))
                .map(|(i, _)| i)
                .collect();
            match cs.len() {
                2 => {
                    adj[cs[0]].push((cs[1], q));
                    adj[cs[1]].push((cs[0], q));
                }
                1 => {
                    let b = n_stabs + boundary_of[&q];
                    adj[cs[0]].push((b, q));
                    adj[b].push((cs[0], q));
                }
                _ => unreachable!("zero-check qubits rejected above"),
            }
        }
        Self { n_stabs, adj }
    }

    fn is_boundary(&self, v: usize) -> bool {
        v >= self.n_stabs
    }
}

/// BFS from `src` over a decoding graph: distance, vertex parent and
/// entering-edge (data qubit) per reachable vertex. Deterministic
/// (adjacency order is fixed).
fn graph_bfs(graph: &DecodingGraph, src: usize) -> (Vec<u32>, Vec<usize>, Vec<usize>) {
    let n = graph.adj.len();
    let mut dist = vec![u32::MAX; n];
    let mut parent_vertex = vec![usize::MAX; n];
    let mut parent_edge = vec![usize::MAX; n];
    dist[src] = 0;
    let mut queue = std::collections::VecDeque::new();
    queue.push_back(src);
    while let Some(v) = queue.pop_front() {
        for &(u, q) in &graph.adj[v] {
            if dist[u] == u32::MAX {
                dist[u] = dist[v] + 1;
                parent_vertex[u] = v;
                parent_edge[u] = q;
                queue.push_back(u);
            }
        }
    }
    (dist, parent_vertex, parent_edge)
}

/// Walk the BFS parent chain from `dst` back to `src`, collecting the data
/// qubits (edges) along the unique shortest path.
fn bfs_path(parent_vertex: &[usize], parent_edge: &[usize], src: usize, dst: usize) -> Vec<usize> {
    let mut path = Vec::new();
    let mut v = dst;
    while v != src {
        path.push(parent_edge[v]);
        v = parent_vertex[v];
        if v == usize::MAX {
            panic!("bfs_path: disconnected graph");
        }
    }
    path.reverse();
    path
}

/// Exact min-weight T-join pairing on a decoding graph with **free boundary
/// vertices**: every syndrome vertex is paired either with another syndrome
/// vertex (shortest interior path) or with the boundary (shortest path to
/// the nearest boundary vertex); boundary-parity paths may be used in any
/// number with parity `|S| ≡ k (mod 2)`. Minimality follows from the
/// Edmonds–Johnson T-join/matching reduction extended over the boundary
/// endpoint choice: the minimum over all such pairings of Σ shortest-path
/// costs equals the minimum correction weight (each pairing's path-XOR is a
/// valid correction and the optimum decomposes into exactly such paths).
///
/// Returns `partner[i]`: `Some(j)` = interior pair, `None` = boundary path.
/// Deterministic tie-breaks (fixed iteration order, strict `<`).
fn min_matching_free_boundary(dist: &[Vec<u32>], nbd: &[u32]) -> Vec<Option<usize>> {
    let k = dist.len();
    let full = 1usize << k;
    let mut dp = vec![u32::MAX; full];
    let mut pick = vec![usize::MAX; full];
    dp[0] = 0;
    for mask in 1..full {
        if mask.count_ones() % 2 != 0 {
            continue;
        }
        let i = mask.trailing_zeros() as usize;
        let rest = mask ^ (1 << i);
        let mut m = rest;
        while m != 0 {
            let j = m.trailing_zeros() as usize;
            m &= m - 1;
            let sub = rest ^ (1 << j);
            if dp[sub] == u32::MAX {
                continue;
            }
            let cand = dp[sub].saturating_add(dist[i][j]);
            if cand < dp[mask] {
                dp[mask] = cand;
                pick[mask] = j;
            }
        }
    }
    // Choose the boundary-paired subset S (|S| ≡ k mod 2 keeps the rest
    // even) minimizing Σ boundary costs + interior matching cost.
    let mut best = u32::MAX;
    let mut best_s = 0usize;
    for s in 0..full {
        let comp = (full - 1) ^ s;
        if dp[comp] == u32::MAX {
            continue; // odd-size interior set — no valid matching
        }
        let mut cost = dp[comp];
        let mut m = s;
        while m != 0 {
            let i = m.trailing_zeros() as usize;
            m &= m - 1;
            cost = cost.saturating_add(nbd[i]);
        }
        if cost < best {
            best = cost;
            best_s = s;
        }
    }
    debug_assert_ne!(best, u32::MAX, "no feasible T-join pairing");
    // Reconstruct: interior pairs from dp over the complement, boundary
    // paths for the S vertices.
    let mut partner = vec![None; k];
    let mut mask = (full - 1) ^ best_s;
    while mask != 0 {
        let i = mask.trailing_zeros() as usize;
        let j = pick[mask];
        debug_assert_ne!(j, usize::MAX, "unreconstructable matching");
        partner[i] = Some(j);
        partner[j] = Some(i);
        mask ^= (1 << i) ^ (1 << j);
    }
    partner
}

// ---------------------------------------------------------------- -----
// Rotated surface code (d = 3, 5, 7)
// ---------------------------------------------------------------------

/// One seeded surface-code trial.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SurfaceTrial {
    /// Logical Z observable flipped (residual X error class) — memory-Z
    /// failure of the Z readout.
    pub z_logical_flip: bool,
    /// Logical X observable flipped (residual Z error class).
    pub x_logical_flip: bool,
    /// Either observable flipped (shot failure).
    pub failed: bool,
    /// Z-check syndrome (X errors), extracted through the ancilla circuits.
    pub z_syndrome: Vec<u8>,
    /// X-check syndrome (Z errors).
    pub x_syndrome: Vec<u8>,
    /// Correction weights per CSS sector.
    pub x_correction_weight: usize,
    pub z_correction_weight: usize,
}

/// Rotated planar surface code, distance `d` (odd, 3 ≤ d ≤ 11): `d²` data
/// qubits on a `d×d` grid, `(d² − 1)/2` Z-checks and `(d² − 1)/2` X-checks.
///
/// Geometry (standard checkerboard; commutation, independence and exact
/// distance are asserted for d = 3, 5, 7 in `tests/qec_oracle.rs`):
/// * Z-checks: internal plaquette at gap `(r, c)` (both in `0..d−1`) when
///   `r + c` is even (weight 4); top-edge weight-2 `Z(0,c)Z(0,c+1)` for odd
///   `c`; bottom-edge weight-2 for even `c`.
/// * X-checks: internal plaquette when `r + c` is odd; left-edge weight-2
///   `X(r,0)X(r+1,0)` for even `r`; right-edge weight-2 for odd `r`.
///
/// Syndrome extraction runs the **real ancilla circuits** in the frame
/// (Z-checks: `CNOT(data → anc)` ladder; X-checks: `H(anc)`,
/// `CNOT(anc → data)`, `H(anc)`) so hook-error propagation is exact; a
/// Z-check ancilla readout equals the parity of the data X-frame over its
/// support and an X-check readout the parity of the Z-frame (asserted
/// against direct support parity in the tests).
///
/// Total frame size `d² + d² − 1` qubits: 17 for d=3, 49 for d=5, **97 for
/// d=7** — inside the WP-5.2 50–500+ qubit frame range.
pub struct RotatedSurfaceCode {
    d: usize,
    n_data: usize,
    z_stabs: Vec<Vec<usize>>,
    x_stabs: Vec<Vec<usize>>,
    z_graph: DecodingGraph,
    x_graph: DecodingGraph,
    lookup_z: HashMap<Vec<u8>, usize>,
    lookup_x: HashMap<Vec<u8>, usize>,
    logical_z_col: Vec<usize>,
    logical_x_row: Vec<usize>,
    x_rowspace: Vec<Vec<u64>>,
    z_rowspace: Vec<Vec<u64>>,
    words: usize,
    n_frame: usize,
}

impl RotatedSurfaceCode {
    /// Fail-closed constructor: geometry validation + ep-core arena
    /// admission for the per-trial frame.
    pub fn new(d: usize) -> Result<Self, AdmissionDecision> {
        if d < 3 || d.is_multiple_of(2) || d > 11 {
            return Err(AdmissionDecision {
                admitted: false,
                reason: format!("rotated surface code: distance must be odd, 3 ≤ d ≤ 11 (got {d})"),
            });
        }
        let n_data = d * d;
        let words = n_data.div_ceil(WORD_BITS);

        // ---- geometry ----
        let idx = |r: usize, c: usize| r * d + c;
        let mut z_stabs: Vec<Vec<usize>> = Vec::new();
        let mut x_stabs: Vec<Vec<usize>> = Vec::new();
        for r in 0..d - 1 {
            for c in 0..d - 1 {
                let plaq = vec![idx(r, c), idx(r, c + 1), idx(r + 1, c), idx(r + 1, c + 1)];
                if (r + c) % 2 == 0 {
                    z_stabs.push(plaq);
                } else {
                    x_stabs.push(plaq);
                }
            }
        }
        for c in 0..d - 1 {
            if c % 2 == 1 {
                z_stabs.push(vec![idx(0, c), idx(0, c + 1)]);
            } else {
                z_stabs.push(vec![idx(d - 1, c), idx(d - 1, c + 1)]);
            }
        }
        for r in 0..d - 1 {
            if r % 2 == 0 {
                x_stabs.push(vec![idx(r, 0), idx(r + 1, 0)]);
            } else {
                x_stabs.push(vec![idx(r, d - 1), idx(r + 1, d - 1)]);
            }
        }
        let n_z = (d * d - 1) / 2;
        debug_assert_eq!(z_stabs.len(), n_z);
        debug_assert_eq!(x_stabs.len(), n_z);

        let z_graph = DecodingGraph::new(n_z, &z_stabs, n_data);
        let x_graph = DecodingGraph::new(n_z, &x_stabs, n_data);

        // ---- weight-1 lookup tables: syndrome signature → data qubit ----
        let mut lookup_z: HashMap<Vec<u8>, usize> = HashMap::new();
        let mut lookup_x: HashMap<Vec<u8>, usize> = HashMap::new();
        for q in 0..n_data {
            let mut sig = vec![0u8; n_z];
            for (i, supp) in z_stabs.iter().enumerate() {
                if supp.contains(&q) {
                    sig[i] = 1;
                }
            }
            lookup_z.entry(sig).or_insert(q);
            let mut sig = vec![0u8; n_z];
            for (i, supp) in x_stabs.iter().enumerate() {
                if supp.contains(&q) {
                    sig[i] = 1;
                }
            }
            lookup_x.entry(sig).or_insert(q);
        }

        // ---- logical observables: middle column / row ----
        let mid = d / 2;
        let logical_z_col: Vec<usize> = (0..d).map(|r| idx(r, mid)).collect();
        let logical_x_row: Vec<usize> = (0..d).map(|c| idx(mid, c)).collect();

        // ---- stabilizer rowspace bases (logical-class membership) ----
        let mut x_rowspace: Vec<Vec<u64>> = Vec::new();
        for supp in &x_stabs {
            gf2_insert(&mut x_rowspace, &support_to_bitset(supp, words));
        }
        let mut z_rowspace: Vec<Vec<u64>> = Vec::new();
        for supp in &z_stabs {
            gf2_insert(&mut z_rowspace, &support_to_bitset(supp, words));
        }

        let n_frame = n_data + 2 * n_z;
        let controller = AdmissionController::new();
        let decision = admit_qec_frame(&controller, n_frame);
        if !decision.admitted {
            return Err(decision);
        }

        Ok(Self {
            d,
            n_data,
            z_stabs,
            x_stabs,
            z_graph,
            x_graph,
            lookup_z,
            lookup_x,
            logical_z_col,
            logical_x_row,
            x_rowspace,
            z_rowspace,
            words,
            n_frame,
        })
    }

    pub fn d(&self) -> usize {
        self.d
    }

    pub fn n_data(&self) -> usize {
        self.n_data
    }

    pub fn n_frame_qubits(&self) -> usize {
        self.n_frame
    }

    pub fn z_stab_supports(&self) -> &[Vec<usize>] {
        &self.z_stabs
    }

    pub fn x_stab_supports(&self) -> &[Vec<usize>] {
        &self.x_stabs
    }

    pub fn logical_z_column(&self) -> &[usize] {
        &self.logical_z_col
    }

    pub fn logical_x_row(&self) -> &[usize] {
        &self.logical_x_row
    }

    // ---- geometry oracles (cheap; used by the test suite) ----

    /// CSS commutation: every Z-check ∩ X-check overlap is even.
    pub fn css_commutes(&self) -> bool {
        self.z_stabs.iter().all(|zs| {
            self.x_stabs
                .iter()
                .all(|xs| zs.iter().filter(|q| xs.contains(q)).count() % 2 == 0)
        })
    }

    /// (rank Z, rank X, rank stacked) over GF(2). For a valid rotated
    /// surface code: `(d²−1)/2, (d²−1)/2, d²−1` (independent generators,
    /// exactly one logical qubit).
    pub fn stabilizer_ranks(&self) -> (usize, usize, usize) {
        let mut zb: Vec<Vec<u64>> = Vec::new();
        for s in &self.z_stabs {
            gf2_insert(&mut zb, &support_to_bitset(s, self.words));
        }
        let mut xb: Vec<Vec<u64>> = Vec::new();
        for s in &self.x_stabs {
            gf2_insert(&mut xb, &support_to_bitset(s, self.words));
        }
        let mut both = zb.clone();
        for s in &self.x_stabs {
            gf2_insert(&mut both, &support_to_bitset(s, self.words));
        }
        (zb.len(), xb.len(), both.len())
    }

    /// `v` (X-error pattern over data qubits) is in the X-stabilizer
    /// rowspace (stabilizer-equivalent residual).
    pub fn in_x_stabilizer_rowspace(&self, v: &[u64]) -> bool {
        gf2_contains(&self.x_rowspace, v)
    }

    /// `v` (Z-error pattern) is in the Z-stabilizer rowspace.
    pub fn in_z_stabilizer_rowspace(&self, v: &[u64]) -> bool {
        gf2_contains(&self.z_rowspace, v)
    }

    /// Exact X-distance: minimum weight of an X-normalizer element outside
    /// the X-stabilizer rowspace, computed by enumerating all simple
    /// boundary-to-boundary paths and all simple cycles up to length `d`
    /// in the X-error decoding graph (any normalizer element decomposes
    /// into such components, and a minimum-weight non-rowspace element
    /// must have a non-rowspace component of no larger weight).
    pub fn distance_x(&self) -> usize {
        self.distance(&self.z_graph, &self.x_rowspace)
    }

    /// Exact Z-distance (symmetric, in the Z-error decoding graph).
    pub fn distance_z(&self) -> usize {
        self.distance(&self.x_graph, &self.z_rowspace)
    }

    fn distance(&self, graph: &DecodingGraph, rowspace: &[Vec<u64>]) -> usize {
        let n_v = graph.adj.len();
        let cap = self.d; // a weight-d logical exists, so the min is ≤ d
        let mut best = usize::MAX;
        // Simple paths from each boundary vertex, ending at any other
        // boundary vertex (recorded at every boundary hit), length ≤ cap.
        for b in graph.n_stabs..n_v {
            let mut visited = vec![false; n_v];
            let mut edge_set = vec![0u64; self.words];
            visited[b] = true;
            self.dfs_paths(
                graph,
                b,
                b,
                cap,
                &mut visited,
                &mut edge_set,
                rowspace,
                &mut best,
            );
        }
        // Simple cycles of length ≤ cap through each check vertex.
        for v in 0..graph.n_stabs {
            let mut visited = vec![false; n_v];
            let mut edge_set = vec![0u64; self.words];
            visited[v] = true;
            self.dfs_cycles(
                graph,
                v,
                v,
                cap,
                &mut visited,
                &mut edge_set,
                rowspace,
                &mut best,
            );
        }
        best
    }

    /// Simple-path enumeration between boundary vertices (prunes once the
    /// edge-set weight reaches the current best — unit weights only grow).
    #[allow(clippy::too_many_arguments)]
    fn dfs_paths(
        &self,
        graph: &DecodingGraph,
        start: usize,
        cur: usize,
        remaining: usize,
        visited: &mut [bool],
        edge_set: &mut [u64],
        rowspace: &[Vec<u64>],
        best: &mut usize,
    ) {
        if remaining == 0 || bitset_weight(edge_set) >= *best {
            return;
        }
        for &(u, q) in &graph.adj[cur] {
            if visited[u] {
                continue;
            }
            let (w, bit) = (word_of(q), bit_of(q));
            let was = edge_set[w] & bit;
            edge_set[w] ^= bit;
            visited[u] = true;
            if bitset_weight(edge_set) < *best {
                if graph.is_boundary(u) && u != start && !gf2_contains(rowspace, edge_set) {
                    *best = bitset_weight(edge_set);
                }
                self.dfs_paths(
                    graph,
                    start,
                    u,
                    remaining - 1,
                    visited,
                    edge_set,
                    rowspace,
                    best,
                );
            }
            visited[u] = false;
            edge_set[w] = (edge_set[w] & !bit) | was;
        }
    }

    /// Simple-cycle enumeration through check vertices (same pruning).
    /// `origin` is the cycle start (closing target), `cur` the head.
    #[allow(clippy::too_many_arguments)]
    fn dfs_cycles(
        &self,
        graph: &DecodingGraph,
        origin: usize,
        cur: usize,
        remaining: usize,
        visited: &mut [bool],
        edge_set: &mut [u64],
        rowspace: &[Vec<u64>],
        best: &mut usize,
    ) {
        if remaining == 0 || bitset_weight(edge_set) >= *best {
            return;
        }
        for &(u, q) in &graph.adj[cur] {
            let (w, bit) = (word_of(q), bit_of(q));
            if u == origin {
                // Closing the cycle: every check vertex has even degree,
                // no boundary involved → normalizer element. Re-walking the
                // arrival edge XORs it away (empty set), excluded below.
                let was = edge_set[w] & bit;
                edge_set[w] ^= bit;
                let weight = bitset_weight(edge_set);
                if weight < *best && weight >= 2 && !gf2_contains(rowspace, edge_set) {
                    *best = weight;
                }
                edge_set[w] = (edge_set[w] & !bit) | was;
                continue;
            }
            if visited[u] {
                continue;
            }
            let was = edge_set[w] & bit;
            edge_set[w] ^= bit;
            visited[u] = true;
            if bitset_weight(edge_set) < *best {
                self.dfs_cycles(
                    graph,
                    origin,
                    u,
                    remaining - 1,
                    visited,
                    edge_set,
                    rowspace,
                    best,
                );
            }
            visited[u] = false;
            edge_set[w] = (edge_set[w] & !bit) | was;
        }
    }

    // ---- syndrome extraction ----

    /// Syndrome extraction through the real ancilla circuits (fresh-ancilla
    /// reset per round). Returns (Z-check syndrome, X-check syndrome).
    pub fn extract_syndrome(&self, frame: &mut PauliFrame) -> (Vec<u8>, Vec<u8>) {
        debug_assert_eq!(frame.n_qubits(), self.n_frame);
        for q in self.n_data..self.n_frame {
            frame.clear(q);
        }
        let mut z_syn = vec![0u8; self.z_stabs.len()];
        for (i, supp) in self.z_stabs.iter().enumerate() {
            let anc = self.n_data + i;
            for &q in supp {
                frame.cnot(q, anc);
            }
            z_syn[i] = frame.read_z(anc, 0);
        }
        let x_base = self.n_data + self.z_stabs.len();
        let mut x_syn = vec![0u8; self.x_stabs.len()];
        for (i, supp) in self.x_stabs.iter().enumerate() {
            let anc = x_base + i;
            frame.hadamard(anc);
            for &q in supp {
                frame.cnot(anc, q);
            }
            frame.hadamard(anc);
            x_syn[i] = frame.read_z(anc, 0);
        }
        (z_syn, x_syn)
    }

    /// Direct support-parity syndrome (no ancillas) — the cross-check the
    /// ancilla-circuit extraction must reproduce exactly.
    pub fn syndrome_direct(&self, frame: &PauliFrame) -> (Vec<u8>, Vec<u8>) {
        let z_syn = self.z_stabs.iter().map(|s| frame.parity_z(s)).collect();
        let x_syn = self.x_stabs.iter().map(|s| frame.parity_x(s)).collect();
        (z_syn, x_syn)
    }

    /// Z-check syndrome of an X-error pattern given as a data-qubit bitset.
    pub fn z_syndrome_of_x_bits(&self, x_bits: &[u64]) -> Vec<u8> {
        self.z_stabs
            .iter()
            .map(|supp| {
                supp.iter().fold(0u8, |p, &q| {
                    p ^ u8::from(x_bits[word_of(q)] & bit_of(q) != 0)
                })
            })
            .collect()
    }

    /// X-check syndrome of a Z-error pattern given as a data-qubit bitset.
    pub fn x_syndrome_of_z_bits(&self, z_bits: &[u64]) -> Vec<u8> {
        self.x_stabs
            .iter()
            .map(|supp| {
                supp.iter().fold(0u8, |p, &q| {
                    p ^ u8::from(z_bits[word_of(q)] & bit_of(q) != 0)
                })
            })
            .collect()
    }

    // ---- decoders ----

    /// Decode one CSS sector: syndrome (of the measured check type) →
    /// correction as a list of data qubits to inject.
    pub fn decode_sector(
        &self,
        sector: PauliSector,
        syndrome: &[u8],
        kind: DecoderKind,
    ) -> Vec<usize> {
        match kind {
            DecoderKind::Lookup => self.decode_lookup(sector, syndrome),
            DecoderKind::Mwpm => self.decode_mwpm(sector, syndrome),
            DecoderKind::UnionFind => self.decode_union_find(sector, syndrome),
        }
    }

    fn graph_for(&self, sector: PauliSector) -> &DecodingGraph {
        match sector {
            PauliSector::X => &self.z_graph,
            PauliSector::Z => &self.x_graph,
        }
    }

    /// Weight-1 lookup decoder: exact table match, else no correction.
    fn decode_lookup(&self, sector: PauliSector, syndrome: &[u8]) -> Vec<usize> {
        let table = match sector {
            PauliSector::X => &self.lookup_z,
            PauliSector::Z => &self.lookup_x,
        };
        match table.get(syndrome) {
            Some(&q) => vec![q],
            None => Vec::new(),
        }
    }

    /// Exact MWPM: min-weight T-join on the decoding graph via the
    /// shortest-path metric closure with free boundary endpoints
    /// ([`min_matching_free_boundary`]). Syndromes above
    /// `MWPM_MAX_SYNDROME` defects hand off to the union-find decoder
    /// (documented policy).
    fn decode_mwpm(&self, sector: PauliSector, syndrome: &[u8]) -> Vec<usize> {
        let graph = self.graph_for(sector);
        let flipped: Vec<usize> = (0..graph.n_stabs)
            .filter(|&s| syndrome[s] & 1 == 1)
            .collect();
        if flipped.is_empty() {
            return Vec::new();
        }
        if flipped.len() > MWPM_MAX_SYNDROME {
            return self.decode_union_find(sector, syndrome);
        }
        let k = flipped.len();
        let mut dist = vec![vec![u32::MAX; k]; k];
        let mut nbd = vec![u32::MAX; k];
        let mut nb_target = vec![usize::MAX; k];
        let mut bfs = Vec::with_capacity(k);
        for (i, &s) in flipped.iter().enumerate() {
            let (d, pv, pe) = graph_bfs(graph, s);
            for (j, &t) in flipped.iter().enumerate() {
                dist[i][j] = d[t];
            }
            let nearest = (graph.n_stabs..graph.adj.len())
                .filter(|&b| d[b] != u32::MAX)
                .min_by_key(|&b| d[b])
                .expect("decoding graph is connected to the boundary");
            nbd[i] = d[nearest];
            nb_target[i] = nearest;
            bfs.push((d, pv, pe));
        }
        let partner = min_matching_free_boundary(&dist, &nbd);
        // Reconstruct the correction as the XOR of the matched paths.
        // Interior pairs are stored symmetrically — process each exactly
        // once (from its lower index); boundary paths once each.
        let mut corr = vec![0u64; self.words];
        for (i, p) in partner.iter().enumerate() {
            let target = match p {
                Some(j) => {
                    if i > *j {
                        continue; // handled from the pair's lower index
                    }
                    flipped[*j]
                }
                None => nb_target[i],
            };
            let (_, pv, pe) = &bfs[i];
            for q in bfs_path(pv, pe, flipped[i], target) {
                corr[word_of(q)] ^= bit_of(q);
            }
        }
        bitset_to_support(&corr)
    }

    /// Union-find decoder (Delfosse–Nickerson style, unit weights): grow
    /// each non-neutral cluster (odd syndrome parity, no boundary) along
    /// all frontier edges until every cluster is neutral (even syndrome or
    /// boundary-anchored), then extract the correction by spanning-forest
    /// peeling. Deterministic (fixed vertex order throughout).
    fn decode_union_find(&self, sector: PauliSector, syndrome: &[u8]) -> Vec<usize> {
        let graph = self.graph_for(sector);
        let n_v = graph.adj.len();

        struct Uf {
            parent: Vec<usize>,
        }
        impl Uf {
            fn find(&mut self, v: usize) -> usize {
                let mut root = v;
                while self.parent[root] != root {
                    root = self.parent[root];
                }
                let mut v = v;
                while self.parent[v] != root {
                    let next = self.parent[v];
                    self.parent[v] = root;
                    v = next;
                }
                root
            }
            fn union(&mut self, a: usize, b: usize) -> usize {
                let (ra, rb) = (self.find(a), self.find(b));
                if ra == rb {
                    return ra;
                }
                // Deterministic: the smaller root always wins.
                let (lo, hi) = if ra < rb { (ra, rb) } else { (rb, ra) };
                self.parent[hi] = lo;
                lo
            }
        }
        let mut uf = Uf {
            parent: (0..n_v).collect(),
        };
        // Syndrome halves per vertex: check vertices carry their syndrome
        // bit, boundary vertices are free (half 0).
        let half: Vec<u8> = (0..n_v)
            .map(|v| {
                if v < graph.n_stabs {
                    syndrome[v] & 1
                } else {
                    0
                }
            })
            .collect();
        let mut touches_boundary: Vec<bool> = (0..n_v).map(|v| v >= graph.n_stabs).collect();

        // --- growth to neutrality ---
        loop {
            let mut parity = vec![0u8; n_v];
            for s in 0..graph.n_stabs {
                parity[uf.find(s)] ^= half[s];
            }
            let root = (0..n_v)
                .filter(|&v| uf.find(v) == v && parity[v] == 1 && !touches_boundary[v])
                .min();
            let Some(root) = root else { break };
            // Collect the frontier (edges with exactly one endpoint in the
            // cluster) before mutating, then absorb it entirely.
            let members: Vec<usize> = (0..n_v).filter(|&v| uf.find(v) == root).collect();
            let mut frontier: Vec<usize> = Vec::new();
            for &v in &members {
                for &(u, _) in &graph.adj[v] {
                    if uf.find(u) != root {
                        frontier.push(u);
                    }
                }
            }
            for u in frontier {
                let r_root = uf.find(root);
                let r_u = uf.find(u);
                if r_root != r_u {
                    let merged = uf.union(r_root, r_u);
                    touches_boundary[merged] = touches_boundary[r_root] || touches_boundary[r_u];
                }
            }
        }

        // --- spanning-forest peeling per cluster ---
        let mut visited = vec![false; n_v];
        let mut tree_parent_edge: Vec<Option<(usize, usize)>> = vec![None; n_v];
        let mut order: Vec<usize> = Vec::with_capacity(n_v);
        for root_vertex in 0..n_v {
            if visited[root_vertex] || uf.find(root_vertex) != root_vertex {
                continue;
            }
            // Tree root: a boundary member when present (its residual
            // parity is free), else the cluster root itself.
            let members: Vec<usize> = (0..n_v).filter(|&v| uf.find(v) == root_vertex).collect();
            let tree_root = members
                .iter()
                .copied()
                .find(|&v| graph.is_boundary(v))
                .unwrap_or(root_vertex);
            visited[tree_root] = true;
            let mut bfs_order = vec![tree_root];
            let mut qi = 0;
            while qi < bfs_order.len() {
                let v = bfs_order[qi];
                qi += 1;
                for &(u, q) in &graph.adj[v] {
                    if !visited[u] && uf.find(u) == root_vertex {
                        visited[u] = true;
                        tree_parent_edge[u] = Some((v, q));
                        bfs_order.push(u);
                    }
                }
            }
            order.extend(bfs_order);
        }
        let mut acc = vec![0u8; n_v];
        let mut corr = vec![0u64; self.words];
        for &v in order.iter().rev() {
            if let Some((p, q)) = tree_parent_edge[v] {
                let payload = half[v] ^ acc[v];
                if payload == 1 {
                    corr[word_of(q)] ^= bit_of(q);
                    acc[p] ^= 1;
                }
            }
        }
        bitset_to_support(&corr)
    }

    // ---- trials & sweeps ----

    /// One seeded code-capacity trial: independent X (`p_x`) and Z (`p_z`)
    /// errors on data qubits (PRNG draw order: all X draws, then all Z
    /// draws, per qubit ascending), ancilla-circuit syndrome extraction,
    /// per-sector decode + correction, logical observable readout.
    /// Sweep trial `i` uses seed `seed + i`.
    pub fn trial(&self, p_x: f64, p_z: f64, seed: u32, kind: DecoderKind) -> SurfaceTrial {
        let mut frame = PauliFrame::new_unchecked(self.n_frame);
        let mut rng = Mulberry32::new(seed);
        for q in 0..self.n_data {
            if rng.next_f64() < p_x {
                frame.inject_x(q);
            }
        }
        for q in 0..self.n_data {
            if rng.next_f64() < p_z {
                frame.inject_z(q);
            }
        }
        let (z_syn, x_syn) = self.extract_syndrome(&mut frame);
        let corr_x = self.decode_sector(PauliSector::X, &z_syn, kind);
        let corr_z = self.decode_sector(PauliSector::Z, &x_syn, kind);
        for &q in &corr_x {
            frame.inject_x(q);
        }
        for &q in &corr_z {
            frame.inject_z(q);
        }
        let z_flip = frame.parity_z(&self.logical_z_col) == 1;
        let x_flip = frame.parity_x(&self.logical_x_row) == 1;
        SurfaceTrial {
            z_logical_flip: z_flip,
            x_logical_flip: x_flip,
            failed: z_flip || x_flip,
            z_syndrome: z_syn,
            x_syndrome: x_syn,
            x_correction_weight: corr_x.len(),
            z_correction_weight: corr_z.len(),
        }
    }

    /// Seeded logical error rate over `trials` trials (trial i: seed+i).
    pub fn logical_error_rate(
        &self,
        trials: usize,
        p_x: f64,
        p_z: f64,
        seed: u32,
        kind: DecoderKind,
    ) -> f64 {
        let failures = (0..trials as u32)
            .filter(|i| self.trial(p_x, p_z, seed.wrapping_add(*i), kind).failed)
            .count();
        failures as f64 / trials as f64
    }

    /// Logical-vs-physical sweep helper: pure bit-flip channel (`p_x = p`,
    /// `p_z = 0`).
    pub fn logical_error_rate_x_only(
        &self,
        trials: usize,
        p: f64,
        seed: u32,
        kind: DecoderKind,
    ) -> f64 {
        self.logical_error_rate(trials, p, 0.0, seed, kind)
    }

    /// Failing-pattern counts by weight under the exact enumerator: the
    /// decoder outcome of **all** `2^n_data` error patterns of one Pauli
    /// type is classified by stabilizer equivalence, giving the exact
    /// logical failure polynomial `p_L(p) = Σ_w F_w · p^w (1−p)^(n−w)`.
    /// Used to assert `F₁ = 0` (single-error correction), the quadratic
    /// coefficient `F₂` and the ± 0.5 % MC-vs-exact oracle tolerance
    /// (03 §5). Requires `n_data ≤ 20`.
    fn exact_failure_weight_enumerator(&self, sector: PauliSector, kind: DecoderKind) -> Vec<u64> {
        assert!(self.n_data <= 20, "enumeration is for small codes only");
        let is_x = sector == PauliSector::X;
        let mut failures_weight = vec![0u64; self.n_data + 1];
        for pattern in 0u64..(1u64 << self.n_data) {
            let mut bits = vec![0u64; self.words];
            bits[0] = pattern;
            let weight = pattern.count_ones() as usize;
            let syndrome = if is_x {
                self.z_syndrome_of_x_bits(&bits)
            } else {
                self.x_syndrome_of_z_bits(&bits)
            };
            let corr = self.decode_sector(sector, &syndrome, kind);
            let mut residual = bits;
            for q in corr {
                residual[word_of(q)] ^= bit_of(q);
            }
            let stabilizer_equivalent = if is_x {
                self.in_x_stabilizer_rowspace(&residual)
            } else {
                self.in_z_stabilizer_rowspace(&residual)
            };
            if !stabilizer_equivalent {
                failures_weight[weight] += 1;
            }
        }
        failures_weight
    }

    /// X-sector failing-pattern counts by weight (exact enumeration).
    pub fn exact_failure_weight_enumerator_x(&self, kind: DecoderKind) -> Vec<u64> {
        self.exact_failure_weight_enumerator(PauliSector::X, kind)
    }

    /// Z-sector failing-pattern counts by weight (exact enumeration).
    pub fn exact_failure_weight_enumerator_z(&self, kind: DecoderKind) -> Vec<u64> {
        self.exact_failure_weight_enumerator(PauliSector::Z, kind)
    }

    /// Exhaustive-enumeration reference logical error rate under iid X
    /// noise `p` (Stim-class oracle, strictly stronger than sampling).
    /// Requires `n_data ≤ 20`.
    pub fn exact_logical_rate_x_only(&self, p: f64, kind: DecoderKind) -> f64 {
        let f = self.exact_failure_weight_enumerator_x(kind);
        (0..=self.n_data)
            .map(|w| f[w] as f64 * p.powi(w as i32) * (1.0 - p).powi((self.n_data - w) as i32))
            .sum()
    }

    /// Exhaustive-enumeration reference logical error rate under iid Z
    /// noise `p`. Requires `n_data ≤ 20`.
    pub fn exact_logical_rate_z_only(&self, p: f64, kind: DecoderKind) -> f64 {
        let f = self.exact_failure_weight_enumerator_z(kind);
        (0..=self.n_data)
            .map(|w| f[w] as f64 * p.powi(w as i32) * (1.0 - p).powi((self.n_data - w) as i32))
            .sum()
    }
}

// ---------------------------------------------------------------- -----
// 500-qubit frame benchmark layer
// ---------------------------------------------------------------------

/// Throughput benchmark for a large admitted frame: `rounds` full-frame
/// layers (H layer, CNOT ladder, S layer, CZ pairs, seeded random X/Z
/// injections, full parity readout) over an admission-gated frame.
/// Returns (total wall time, per-layer gate count) — the CI test asserts
/// the wall time bound and exact frame invariants around the run.
pub fn bench_frame_layers(
    n_qubits: usize,
    rounds: usize,
    seed: u32,
) -> Result<(std::time::Duration, usize), AdmissionDecision> {
    let controller = AdmissionController::new();
    let mut frame = PauliFrame::new_admitted(n_qubits, &controller)?;
    let mut rng = Mulberry32::new(seed);
    let ops_per_round = n_qubits // H layer
        + n_qubits.saturating_sub(1) // CNOT ladder
        + n_qubits // S layer
        + n_qubits / 2 // CZ pairs
        + 2 * n_qubits // random injections (2 draws per qubit)
        + n_qubits; // parity readout
    let t0 = std::time::Instant::now();
    for _ in 0..rounds {
        frame.hadamard_all();
        frame.cnot_chain();
        frame.phase_gate_all();
        frame.cz_adjacent_pairs();
        frame.inject_random_xz(&mut rng, 0.02, 0.02);
        let _ = frame.parity_z_all();
    }
    Ok((t0.elapsed(), ops_per_round * rounds))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Conjugation-rule parity with the ESM propagation test (CNOT/H/S) —
    /// bit-packed words must behave exactly like the ESM byte frame.
    #[test]
    fn frame_conjugation_rules_match_esm() {
        // X on control propagates through CNOT to control⊗target.
        let mut f = PauliFrame::new_unchecked(2);
        f.inject_x(0);
        f.cnot(0, 1);
        assert_eq!(f.read_z(0, 0), 1, "X control keeps flipping its own Z");
        assert_eq!(
            f.read_z(1, 0),
            1,
            "X control propagates to target Z readout"
        );
        // H swaps X ↔ Z.
        let mut g = PauliFrame::new_unchecked(1);
        g.inject_z(0);
        g.hadamard(0);
        assert_eq!(g.read_z(0, 0), 1, "Z error becomes X under H");
        assert_eq!(g.x_bit(0), 1);
        // Z on target propagates backward onto the control's Z-frame.
        let mut h = PauliFrame::new_unchecked(2);
        h.inject_z(1);
        h.cnot(0, 1);
        assert_eq!(h.read_z(1, 0), 0, "Z commutes with the Z readout");
        assert_eq!(h.z_bit(0), 1, "Z target propagates onto control Z-frame");
        h.hadamard(0);
        assert_eq!(h.read_z(0, 0), 1, "propagated Z becomes X under H");
        // S: X → Y (X·Z in frame), Z unchanged.
        let mut s = PauliFrame::new_unchecked(1);
        s.inject_x(0);
        s.phase_gate(0);
        assert_eq!((s.x_bit(0), s.z_bit(0)), (1, 1));
        let mut s2 = PauliFrame::new_unchecked(1);
        s2.inject_z(0);
        s2.phase_gate(0);
        assert_eq!((s2.x_bit(0), s2.z_bit(0)), (0, 1), "S leaves Z unchanged");
        // CZ (textbook diagonal rule — see the documented ESM deviation):
        // X_t → X_t Z_c, X_c → X_c Z_t, Z's unchanged.
        let mut c = PauliFrame::new_unchecked(2);
        c.inject_x(1);
        c.cz(0, 1);
        assert_eq!((c.x_bit(1), c.z_bit(0)), (1, 1), "X target gains Z control");
        assert_eq!(c.x_bit(0), 0, "CZ never flips X bits");
        let mut c2 = PauliFrame::new_unchecked(2);
        c2.inject_x(0);
        c2.cz(0, 1);
        assert_eq!(
            (c2.x_bit(0), c2.z_bit(1)),
            (1, 1),
            "X control gains Z target"
        );
        let mut c3 = PauliFrame::new_unchecked(2);
        c3.inject_z(0);
        c3.cz(0, 1);
        assert_eq!(
            (c3.x_bit(1), c3.z_bit(0), c3.z_bit(1)),
            (0, 1, 0),
            "Z control unchanged under CZ"
        );
        // Composition identity: CZ ≡ H(t)·CNOT(c,t)·H(t) bit-exactly.
        let mut a = PauliFrame::new_unchecked(4);
        let mut b = PauliFrame::new_unchecked(4);
        let mut rng = Mulberry32::new(20261121);
        for _ in 0..64 {
            let q = (rng.next_f64() * 4.0) as usize;
            match (rng.next_f64() * 3.0) as usize {
                0 => {
                    a.inject_x(q);
                    b.inject_x(q);
                }
                1 => {
                    a.inject_z(q);
                    b.inject_z(q);
                }
                _ => {
                    a.inject_y(q);
                    b.inject_y(q);
                }
            }
        }
        a.cz(1, 2);
        b.hadamard(2);
        b.cnot(1, 2);
        b.hadamard(2);
        for q in 0..4 {
            assert_eq!(
                (a.x_bit(q), a.z_bit(q)),
                (b.x_bit(q), b.z_bit(q)),
                "CZ ≡ H·CNOT·H on qubit {q}"
            );
        }
    }

    /// Word-packing invariant: ops preserve the zero tail beyond bit n and
    /// per-qubit semantics match a straddling word boundary (63 ↔ 64).
    #[test]
    fn frame_word_boundary_semantics() {
        let mut f = PauliFrame::new_unchecked(70);
        f.inject_x(63);
        assert_eq!(f.x_popcount(), 1);
        f.cnot(63, 64); // crosses the word boundary
        assert_eq!(f.x_bit(64), 1, "X propagates across the word boundary");
        assert_eq!(f.x_popcount(), 2);
        f.hadamard(63);
        assert_eq!(f.z_bit(63), 1);
        assert_eq!(f.x_bit(63), 0);
        assert_eq!(f.parity_z_all(), 1, "only remaining X bit is q64");
        assert_eq!(f.parity_z(&[64]), 1);
        assert_eq!(f.parity_z(&[63]), 0);
        // CZ across the boundary: Z bits are unchanged by CZ (diagonal
        // gate); the Z error on qubit 64 stays put, no X appears.
        let mut c = PauliFrame::new_unchecked(70);
        c.inject_z(64);
        c.cz(63, 64);
        assert_eq!(
            (c.x_bit(63), c.x_bit(64), c.z_bit(64)),
            (0, 0, 1),
            "Z target unchanged under CZ"
        );
        let mut c4 = PauliFrame::new_unchecked(70);
        c4.inject_x(63);
        c4.cz(63, 64);
        assert_eq!(
            (c4.x_bit(63), c4.z_bit(64)),
            (1, 1),
            "X control across the boundary gains Z target"
        );
        // Y injection and parity.
        let mut y = PauliFrame::new_unchecked(70);
        y.inject_y(65);
        assert_eq!((y.x_bit(65), y.z_bit(65)), (1, 1));
        assert_eq!(y.parity_z(&[65]), 1);
        assert_eq!(y.parity_x(&[65]), 1);
        y.reset();
        assert_eq!((y.x_popcount(), y.z_popcount()), (0, 0));
    }

    /// Repetition-code geometry + admission refusals.
    #[test]
    fn repetition_code_construction_gates() {
        assert!(RepetitionCode::new(3).is_ok());
        assert!(RepetitionCode::new(5).is_ok());
        assert!(RepetitionCode::new(2).is_err(), "even distance refused");
        assert!(RepetitionCode::new(1).is_err(), "d < 3 refused");
        let c = RepetitionCode::new(7).expect("d=7 admitted");
        assert_eq!(c.n_frame_qubits(), 13);
        let t = RepetitionCode::new(3).expect("ok").trial(0.0, 1);
        assert_eq!(
            (t.logical_bit, t.syndrome.as_slice(), t.correction),
            (0u8, &[0u8, 0][..], -1i64),
            "noiseless trial: clean syndrome, no correction"
        );
    }

    /// d=3 repetition exact failure enumerator vs the closed form
    /// `3p² − 2p³` (majority-vote failure: any ≥ 2 data flips).
    #[test]
    fn repetition_d3_exact_enumerator_matches_closed_form() {
        let code = RepetitionCode::new(3).expect("ok");
        // Enumerate all 8 patterns by hand-checking the decoder outcomes.
        let mut failing = 0usize;
        let mut failing_weight2 = 0usize;
        for pattern in 0u64..8 {
            let mut frame = PauliFrame::new_unchecked(5);
            for q in 0..3 {
                if pattern >> q & 1 == 1 {
                    frame.inject_x(q);
                }
            }
            let mut syndrome = [0u8; 2];
            for (a, slot) in syndrome.iter_mut().enumerate() {
                frame.cnot(a, 3 + a);
                frame.cnot(a + 1, 3 + a);
                *slot = frame.read_z(3 + a, 0);
            }
            let lookup: [(u8, u8, i64); 3] = [(1, 0, 0), (0, 1, 2), (1, 1, 1)];
            let correction = lookup
                .iter()
                .find(|&&(s1, s2, _)| s1 == syndrome[0] && s2 == syndrome[1])
                .map_or(-1, |&(_, _, c)| c);
            if correction >= 0 {
                frame.inject_x(correction as usize);
            }
            if frame.parity_z(&[0, 1, 2]) == 1 {
                failing += 1;
                if pattern.count_ones() == 2 {
                    failing_weight2 += 1;
                }
            }
        }
        assert_eq!(failing_weight2, 3, "exactly the three 2-flip patterns fail");
        assert_eq!(failing, 4, "3 two-flip + the three-flip pattern fail");
        let p = 0.05;
        // Closed form for the analytic reference: 3p²(1−p) + p³ = 3p² − 2p³.
        let closed = 3.0 * p * p * (1.0 - p) + p * p * p;
        // The MC rate must sit within the 03 §5 ± 0.5 % absolute tolerance
        // of the closed form 3p² − 2p³.
        let mc = code.logical_error_rate(30_000, p, 20241119);
        assert!(
            (mc - closed).abs() <= 0.005,
            "MC {mc} vs closed form {closed} beyond ±0.5 % absolute"
        );
    }

    /// Rotated surface code construction gates.
    #[test]
    fn surface_code_construction_gates() {
        assert!(RotatedSurfaceCode::new(3).is_ok());
        assert!(RotatedSurfaceCode::new(5).is_ok());
        assert!(RotatedSurfaceCode::new(7).is_ok());
        assert!(RotatedSurfaceCode::new(2).is_err());
        assert!(RotatedSurfaceCode::new(4).is_err());
        let c = RotatedSurfaceCode::new(7).expect("d=7 admitted");
        assert_eq!(c.n_data(), 49);
        assert_eq!(c.n_frame_qubits(), 97, "49 data + 48 ancilla qubits");
        assert_eq!(c.z_stab_supports().len(), 24);
        assert_eq!(c.x_stab_supports().len(), 24);
    }

    /// Frame admission through ep-core: sizes admitted/refused honestly.
    #[test]
    fn frame_admission_gates_through_ep_core() {
        let c = AdmissionController::new();
        assert!(admit_qec_frame(&c, 500).admitted);
        assert!(admit_qec_frame(&c, 5_000).admitted);
        let d = admit_qec_frame(&c, 0);
        assert!(!d.admitted && d.reason.contains("must be ≥ 1"));
        // 3·10⁹ qubits ≈ 750 MB > 512 MB arena → honest refusal.
        let big = admit_qec_frame(&c, 3_000_000_000);
        assert!(
            !big.admitted && big.reason.contains("arena cap"),
            "{}",
            big.reason
        );
        let f = PauliFrame::new_admitted(500, &c).expect("500 admitted");
        assert_eq!(f.n_qubits(), 500);
        assert!(PauliFrame::new_admitted(0, &c).is_err());
        assert!(PauliFrame::new_admitted(3_000_000_000, &c).is_err());
    }

    /// Benchmark-layer smoke run (small; the timed 500-qubit run lives in
    /// tests/qec_oracle.rs).
    #[test]
    fn bench_frame_layers_smoke() {
        let (elapsed, ops) = bench_frame_layers(64, 10, 7).expect("admitted");
        // Per round: H(n) + ladder(n−1) + S(n) + CZ(n/2) + injections(2n)
        //            + parity readout(n) = 6n + n/2 − 1.
        assert_eq!(ops, (6 * 64 + 32 - 1) * 10);
        assert!(elapsed.as_nanos() > 0);
    }
}
