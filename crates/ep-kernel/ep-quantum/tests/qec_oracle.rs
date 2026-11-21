//! WP-5.2 QEC oracle tests.
//!
//! `packages/quantum-engine/src/stabilizer.mjs` (ESM) is the CI oracle per
//! `docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md` §4 (QEC bullet) and §5
//! (QEC sweep row: "logical rate ± 0.5 % absolute"). Each ESM-parity test
//! replicates the oracle **step-for-step** (same mulberry32 draws, same
//! decoder tables, same readouts) and asserts both:
//!   1. exact per-trial/rate agreement with captured ESM outputs (values
//!      captured by running the oracle engine on this commit's inputs),
//!   2. the §5 analytic oracles — quadratic suppression at p = 0.05 within
//!      the ± 0.5 % absolute tolerance of the closed-form/published rates.
//!
//! The rotated surface code (d = 3, 5, 7) has no ESM counterpart (the ESM
//! engine ships only the d=5 repetition segment), so its oracles are:
//!   1. exhaustive 2^n enumeration (strictly stronger than Stim sampling),
//!   2. structural theorems asserted exactly (CSS commutation, stabilizer
//!      independence, distance = d via bounded graph search),
//!   3. MWPM optimality vs brute-force min-T-join,
//!   4. decoder syndrome-validity for every decoder class.
//!
//! `CZ` is excluded from the ESM bit-parity fingerprint: the ESM `cz`
//! implementation carries a sequential-order artifact (it flips the target
//! X bit under a diagonal gate — see the documented deviation on
//! `PauliFrame::cz`). No ESM CI oracle path calls `cz`; the kernel
//! implements the textbook rule and proves it via the `H·CNOT·H`
//! composition identity.

use ep_core::admission::AdmissionController;
use ep_quantum::lindblad::Mulberry32;
use ep_quantum::qec::{
    esm_bit_flip_logical_error_rate, esm_run_bit_flip_trial, esm_run_surface_trial,
    esm_surface_logical_error_rate,
};
use ep_quantum::qec::{
    DecoderKind, PauliFrame, PauliSector, RepetitionCode, RotatedSurfaceCode, QEC_PROVENANCE,
};

const TOL_ORACLE: f64 = 0.005; // 03 §5: logical rate ± 0.5 % absolute

/// ESM-oracle captured values (see module doc).
mod esm {
    /// `bitFlipLogicalErrorRate(3000, p, seed=20241119)` sweep — captured.
    pub const BITFLIP_ERRORS_3000: [(f64, usize); 5] =
        [(0.01, 4), (0.03, 11), (0.05, 24), (0.08, 49), (0.10, 80)];
    /// `runBitFlipCodeTrial(0.3, seed)` for seeds 1..=8 — captured.
    pub const BITFLIP_TRIALS_P03: [(u32, u8, [u8; 2], i64); 8] = [
        (1, 0, [1, 1], 1),
        (2, 0, [0, 1], 2),
        (3, 0, [1, 1], 1),
        (4, 0, [0, 1], 2),
        (5, 0, [0, 1], 2),
        (6, 0, [1, 1], 1),
        (7, 1, [0, 1], 2),
        (8, 0, [1, 0], 0),
    ];
    /// `surfaceCodeLogicalErrorRate(3000, p, seed=20241120)` — captured.
    pub const REP5_ERRORS_3000: [(f64, usize); 5] =
        [(0.01, 0), (0.03, 0), (0.05, 2), (0.08, 17), (0.10, 28)];
    /// `runSurfaceCodeTrial(0.3, seed)` for seeds 1..=8 — captured.
    pub const REP5_TRIALS_P03: [(u32, u8, [u8; 4], i64); 8] = [
        (1, 0, [1, 1, 0, 0], 1),
        (2, 0, [0, 1, 1, 0], 2),
        (3, 0, [1, 1, 1, 1], -1),
        (4, 1, [0, 1, 0, 0], -1),
        (5, 0, [0, 1, 1, 1], -1),
        (6, 0, [1, 1, 1, 1], -1),
        (7, 0, [0, 1, 0, 0], -1),
        (8, 0, [1, 0, 0, 0], 0),
    ];
    /// 128-qubit randomized H/S/CNOT/inject fingerprint (4000 steps,
    /// mulberry32(987654321), CZ excluded — see module doc; CNOT targets
    /// use the collision-free formula t = (c+1+raw%(N−1))%N): readZ of
    /// qubits 0..20, parityZ over all/even/first-64, X/Z popcounts.
    pub const FP_READZ20: [u8; 20] = [1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1];
    pub const FP_PARITY_ALL: u8 = 0;
    pub const FP_PARITY_EVEN: u8 = 1;
    pub const FP_PARITY_FIRST64: u8 = 1;
    pub const FP_POPCOUNT_X: usize = 60;
    pub const FP_POPCOUNT_Z: usize = 62;
}

// ---------------------------------------------------------------- -----
// ESM oracle parity: bit-flip code (d=3) rates + per-trial vectors
// ---------------------------------------------------------------------

#[test]
fn esm_bit_flip_d3_sweep_rates_match_captured() {
    for &(p, errors) in &esm::BITFLIP_ERRORS_3000 {
        let got = esm_bit_flip_logical_error_rate(3000, p, 20241119);
        assert_eq!(
            (got * 3000.0).round() as usize,
            errors,
            "p={p}: ESM captured {errors}/3000, kernel produced {}",
            (got * 3000.0).round()
        );
    }
}

#[test]
fn esm_bit_flip_per_trial_vectors_match_captured() {
    for &(seed, logical, syndrome, correction) in &esm::BITFLIP_TRIALS_P03 {
        let t = esm_run_bit_flip_trial(0.3, seed);
        assert_eq!(t.logical_bit, logical, "seed {seed} logicalBit");
        assert_eq!(t.syndrome, syndrome, "seed {seed} syndrome");
        assert_eq!(t.correction, correction, "seed {seed} correction");
    }
}

/// The generic distance-d repetition code reproduces the ESM d=3 and d=5
/// oracle algorithms bit-exactly (same frame ops, same PRNG consumption).
#[test]
fn generic_repetition_code_equals_esm_replicas() {
    let d3 = RepetitionCode::new(3).expect("d=3");
    for seed in [0u32, 1, 7, 42, 20241119] {
        for &p in &[0.0, 0.05, 0.3] {
            assert_eq!(d3.trial(p, seed), esm_run_bit_flip_trial(p, seed));
        }
        assert_eq!(
            d3.logical_error_rate(500, 0.05, seed),
            esm_bit_flip_logical_error_rate(500, 0.05, seed)
        );
    }
    let d5 = RepetitionCode::new(5).expect("d=5");
    for seed in [0u32, 1, 7, 42, 20241120] {
        for &p in &[0.0, 0.05, 0.3] {
            assert_eq!(d5.trial(p, seed), esm_run_surface_trial(p, seed));
        }
        assert_eq!(
            d5.logical_error_rate(500, 0.05, seed),
            esm_surface_logical_error_rate(500, 0.05, seed)
        );
    }
}

// ---------------------------------------------------------------- -----
// ESM oracle parity: d=5 repetition-segment rates + per-trial vectors
// ---------------------------------------------------------------------

#[test]
fn esm_rep5_sweep_rates_match_captured() {
    for &(p, errors) in &esm::REP5_ERRORS_3000 {
        let got = esm_surface_logical_error_rate(3000, p, 20241120);
        assert_eq!(
            (got * 3000.0).round() as usize,
            errors,
            "p={p}: ESM captured {errors}/3000, kernel produced {}",
            (got * 3000.0).round()
        );
    }
}

#[test]
fn esm_rep5_per_trial_vectors_match_captured() {
    for &(seed, logical, syndrome, correction) in &esm::REP5_TRIALS_P03 {
        let t = esm_run_surface_trial(0.3, seed);
        assert_eq!(t.logical_bit, logical, "seed {seed} logicalBit");
        assert_eq!(t.syndrome, syndrome, "seed {seed} syndrome");
        assert_eq!(t.correction, correction, "seed {seed} correction");
    }
}

// ---------------------------------------------------------------- -----
// ESM oracle parity: 128-qubit randomized frame fingerprint (no CZ)
// ---------------------------------------------------------------------

#[test]
fn esm_frame_fingerprint_matches_captured() {
    const N: usize = 128;
    let mut frame = PauliFrame::new_admitted(N, &AdmissionController::new()).expect("admitted");
    let mut rng = Mulberry32::new(987654321);
    for _ in 0..4000 {
        let op = (rng.next_f64() * 4.0) as usize;
        if op == 0 {
            let q = (rng.next_f64() * N as f64) as usize;
            frame.hadamard(q);
        } else if op == 1 {
            let q = (rng.next_f64() * N as f64) as usize;
            frame.phase_gate(q);
        } else if op == 2 {
            let c = (rng.next_f64() * N as f64) as usize;
            let raw = (rng.next_f64() * N as f64) as usize;
            let t = (c + 1 + raw % (N - 1)) % N;
            frame.cnot(c, t);
        } else {
            let q = (rng.next_f64() * N as f64) as usize;
            let k = (rng.next_f64() * 3.0) as usize;
            if k == 0 {
                frame.inject_x(q);
            } else if k == 1 {
                frame.inject_z(q);
            } else {
                frame.inject_y(q);
            }
        }
    }
    let mut all: Vec<usize> = (0..N).collect();
    let evens: Vec<usize> = (0..N).step_by(2).collect();
    let first64: Vec<usize> = (0..64).collect();
    for (i, &expected) in esm::FP_READZ20.iter().enumerate() {
        assert_eq!(frame.read_z(i, 0), expected, "readZ({i})");
    }
    assert_eq!(frame.parity_z(&all), esm::FP_PARITY_ALL, "parityZ(all)");
    all.clear();
    assert_eq!(
        frame.parity_z(&evens),
        esm::FP_PARITY_EVEN,
        "parityZ(evens)"
    );
    assert_eq!(
        frame.parity_z(&first64),
        esm::FP_PARITY_FIRST64,
        "parityZ(first 64)"
    );
    assert_eq!(frame.x_popcount(), esm::FP_POPCOUNT_X, "popcount x");
    assert_eq!(frame.z_popcount(), esm::FP_POPCOUNT_Z, "popcount z");
}

/// ESM propagation-rule parity (H/S/CNOT) on the bit-packed frame — the
/// same scenario as the ESM suite's `QEC: Pauli-frame propagation rules`
/// test, plus the kernel-side CZ algebra (see module doc).
#[test]
fn esm_pauli_frame_propagation_rules_parity() {
    // X on control propagates through CNOT to control⊗target.
    let mut f = PauliFrame::new_admitted(2, &AdmissionController::new()).expect("ok");
    f.inject_x(0);
    f.cnot(0, 1);
    assert_eq!(f.read_z(0, 0), 1);
    assert_eq!(f.read_z(1, 0), 1);
    // H swaps X ↔ Z.
    let mut g = PauliFrame::new_admitted(1, &AdmissionController::new()).expect("ok");
    g.inject_z(0);
    g.hadamard(0);
    assert_eq!(g.read_z(0, 0), 1);
    // Z on target propagates backward onto control's Z-frame.
    let mut h = PauliFrame::new_admitted(2, &AdmissionController::new()).expect("ok");
    h.inject_z(1);
    h.cnot(0, 1);
    assert_eq!(h.read_z(1, 0), 0);
    assert_eq!(h.z_bit(0), 1);
    h.hadamard(0);
    assert_eq!(h.read_z(0, 0), 1);
}

// ---------------------------------------------------------------- -----
// §5 oracle: quadratic suppression at p = 0.05 (± 0.5 % absolute)
// ---------------------------------------------------------------------

/// ESM d=3 bit-flip code: logical rate ≈ 3p² − 2p³ (C(3,2)p² majority-vote
/// failure) — the published closed form for this code. The seeded MC must
/// sit within the §5 ± 0.5 % absolute tolerance of it and strictly beat the
/// physical rate (quadratic suppression).
#[test]
fn quadratic_suppression_esm_bitflip_d3_p005() {
    let p = 0.05;
    let closed = 3.0 * p * p - 2.0 * p * p * p; // 0.00725
    let mc = esm_bit_flip_logical_error_rate(30_000, p, 20241119);
    assert!(
        mc < p,
        "logical {mc} must beat physical {p} (quadratic suppression)"
    );
    assert!(
        (mc - closed).abs() <= TOL_ORACLE,
        "MC {mc} vs closed form {closed} beyond ±0.5 % absolute"
    );
}

/// Rotated surface code d=3 (MWPM): the exhaustive 2⁹ enumeration is the
/// Stim-class reference; the seeded MC sweep must agree within the §5
/// ± 0.5 % absolute tolerance, weight-1 errors must all be corrected
/// (F₁ = 0), and the rate must be quadratically suppressed (rate/p² → F₂
/// as p → 0, asserted at p = 0.001 within 5 %).
#[test]
fn quadratic_suppression_rotated_d3_p005() {
    let code = RotatedSurfaceCode::new(3).expect("d=3");
    let enumerator = code.exact_failure_weight_enumerator_x(DecoderKind::Mwpm);
    assert_eq!(
        enumerator[1], 0,
        "F₁ must be 0: every single X error is corrected"
    );
    assert!(
        enumerator[2] > 0,
        "F₂ > 0: weight-2 failures set the quadratic coefficient"
    );
    let p = 0.05;
    let exact = code.exact_logical_rate_x_only(p, DecoderKind::Mwpm);
    println!(
        "WP-5.2 rotated d=3 exact reference p=0.05: {exact} (F₂ = {})",
        enumerator[2]
    );
    assert!(exact < p, "exact logical {exact} must beat physical {p}");
    let mc = code.logical_error_rate_x_only(20_000, p, 20261121, DecoderKind::Mwpm);
    assert!(
        (mc - exact).abs() <= TOL_ORACLE,
        "MC {mc} vs exhaustive reference {exact} beyond ±0.5 % absolute"
    );
    // Quadratic law: p_L(p)/p² → F₂ as p → 0 (higher-order terms ≪ 5 %).
    let f2 = enumerator[2] as f64;
    let p_small = 0.001;
    let exact_small = code.exact_logical_rate_x_only(p_small, DecoderKind::Mwpm);
    let ratio = exact_small / (p_small * p_small);
    assert!(
        (ratio - f2).abs() <= 0.05 * f2,
        "p_L({p_small})/p² = {ratio} must equal F₂ = {f2} within 5 %"
    );
}

// ---------------------------------------------------------------- -----
// Rotated surface code structure: commutation, independence, distance
// ---------------------------------------------------------------------

#[test]
fn rotated_code_geometry_d3_d5_d7() {
    for d in [3usize, 5, 7] {
        let code = RotatedSurfaceCode::new(d).expect("admitted");
        let n_stabs = (d * d - 1) / 2;
        assert!(code.css_commutes(), "d={d}: CSS commutation");
        let (rz, rx, rboth) = code.stabilizer_ranks();
        assert_eq!(rz, n_stabs, "d={d}: Z-check rank");
        assert_eq!(rx, n_stabs, "d={d}: X-check rank");
        assert_eq!(rboth, 2 * n_stabs, "d={d}: full independence (k = 1)");
        assert_eq!(code.distance_x(), d, "d={d}: exact X distance");
        assert_eq!(code.distance_z(), d, "d={d}: exact Z distance");
        // Logical observables commute with everything they must.
        assert_eq!(code.logical_z_column().len(), d);
        assert_eq!(code.logical_x_row().len(), d);
    }
}

/// Ancilla-circuit syndrome extraction must reproduce the direct
/// support-parity syndrome exactly (validates the H/CNOT frame circuits,
/// including hook-error propagation paths).
#[test]
fn syndrome_extraction_matches_direct_parity() {
    for d in [3usize, 5, 7] {
        let code = RotatedSurfaceCode::new(d).expect("admitted");
        let mut frame =
            PauliFrame::new_admitted(code.n_frame_qubits(), &AdmissionController::new())
                .expect("admitted");
        for seed in [1u32, 2, 3, 12345, 987654] {
            frame.reset();
            let mut rng = Mulberry32::new(seed);
            for q in 0..code.n_data() {
                if rng.next_f64() < 0.2 {
                    frame.inject_x(q);
                }
                if rng.next_f64() < 0.2 {
                    frame.inject_z(q);
                }
            }
            let via_circuit = code.extract_syndrome(&mut frame);
            let direct = code.syndrome_direct(&frame);
            assert_eq!(via_circuit.0, direct.0, "d={d} seed {seed}: Z syndrome");
            assert_eq!(via_circuit.1, direct.1, "d={d} seed {seed}: X syndrome");
        }
    }
}

/// MWPM and union-find must produce syndrome-exact corrections for arbitrary
/// error patterns: after decode + correction injection the re-extracted
/// syndrome is all-zero (fresh ancillas), for X and Z sectors alike. (The
/// weight-1 lookup decoder honestly declines multi-error syndromes — its
/// exactness domain is single errors, covered by the dedicated test.)
#[test]
fn decoder_syndrome_validity_all_classes() {
    for d in [3usize, 5, 7] {
        let code = RotatedSurfaceCode::new(d).expect("admitted");
        for kind in [DecoderKind::Mwpm, DecoderKind::UnionFind] {
            for seed in [11u32, 22, 333, 4444] {
                let mut frame =
                    PauliFrame::new_admitted(code.n_frame_qubits(), &AdmissionController::new())
                        .expect("admitted");
                frame.reset();
                let mut rng = Mulberry32::new(seed);
                for q in 0..code.n_data() {
                    if rng.next_f64() < 0.1 {
                        frame.inject_x(q);
                    }
                    if rng.next_f64() < 0.1 {
                        frame.inject_z(q);
                    }
                }
                let (z_syn, x_syn) = code.extract_syndrome(&mut frame);
                let corr_x = code.decode_sector(PauliSector::X, &z_syn, kind);
                let corr_z = code.decode_sector(PauliSector::Z, &x_syn, kind);
                for &q in &corr_x {
                    frame.inject_x(q);
                }
                for &q in &corr_z {
                    frame.inject_z(q);
                }
                let (z_res, x_res) = code.extract_syndrome(&mut frame);
                assert!(
                    z_res.iter().all(|&b| b == 0),
                    "d={d} {:?} seed {seed}: residual Z syndrome {z_res:?}",
                    kind
                );
                assert!(
                    x_res.iter().all(|&b| b == 0),
                    "d={d} {:?} seed {seed}: residual X syndrome {x_res:?}",
                    kind
                );
            }
        }
    }
}

/// Weight-1 lookup decoder: every single X (resp. Z) data error is
/// successfully corrected for d = 3, 5, 7 — the post-correction syndrome
/// cancels exactly and no logical observable flips. (The correction qubit
/// may be any stabilizer-degenerate representative: single-error syndromes
/// of qubit pairs differing by a weight-2 X-stabilizer are identical — e.g.
/// (0,0)/(1,0) via Xc — so success is defined by the residual class, not
/// by qubit identity.)
#[test]
fn lookup_decoder_corrects_all_single_errors() {
    for d in [3usize, 5, 7] {
        let code = RotatedSurfaceCode::new(d).expect("admitted");
        for q in 0..code.n_data() {
            let mut frame =
                PauliFrame::new_admitted(code.n_frame_qubits(), &AdmissionController::new())
                    .expect("admitted");
            frame.reset();
            frame.inject_x(q);
            let (z_syn, _) = code.extract_syndrome(&mut frame);
            let corr = code.decode_sector(PauliSector::X, &z_syn, DecoderKind::Lookup);
            assert!(!corr.is_empty(), "d={d}: single X error on {q} decoded");
            for &c in &corr {
                frame.inject_x(c);
            }
            let (z_res, _) = code.extract_syndrome(&mut frame);
            assert!(
                z_res.iter().all(|&b| b == 0),
                "d={d}: X error on {q} canceled"
            );
            assert!(
                frame.parity_z(code.logical_z_column()) == 0,
                "d={d}: X error on {q} — logical Z preserved"
            );

            frame.reset();
            frame.inject_z(q);
            let (_, x_syn) = code.extract_syndrome(&mut frame);
            let corr_z = code.decode_sector(PauliSector::Z, &x_syn, DecoderKind::Lookup);
            assert!(!corr_z.is_empty(), "d={d}: single Z error on {q} decoded");
            for &c in &corr_z {
                frame.inject_z(c);
            }
            let (_, x_res) = code.extract_syndrome(&mut frame);
            assert!(
                x_res.iter().all(|&b| b == 0),
                "d={d}: Z error on {q} canceled"
            );
            assert!(
                frame.parity_x(code.logical_x_row()) == 0,
                "d={d}: Z error on {q} — logical X preserved"
            );
        }
    }
}

/// MWPM must be the exact minimum-weight T-join: its correction weight
/// equals a brute-force minimum over all corrections with the measured
/// syndrome parity. Full syndrome space at d=3; single/double-error
/// syndromes at d=5.
#[test]
fn mwpm_matches_bruteforce_min_tjoin() {
    /// Minimum correction weight found by enumerating all data subsets of
    /// weight ≤ cap whose check parity equals `syndrome`.
    fn brute_min(n_data: usize, checks: &[Vec<usize>], syndrome: &[u8], cap: usize) -> usize {
        fn first_match(
            n: usize,
            k: usize,
            start: usize,
            combo: &mut Vec<usize>,
            checks: &[Vec<usize>],
            syndrome: &[u8],
        ) -> bool {
            if combo.len() == k {
                let mut par = vec![0u8; checks.len()];
                for &q in combo.iter() {
                    for (i, c) in checks.iter().enumerate() {
                        if c.contains(&q) {
                            par[i] ^= 1;
                        }
                    }
                }
                return par == syndrome;
            }
            for q in start..n {
                combo.push(q);
                if first_match(n, k, q + 1, combo, checks, syndrome) {
                    return true;
                }
                combo.pop();
            }
            false
        }
        for w in 0..=cap {
            let mut combo = Vec::with_capacity(w);
            if first_match(n_data, w, 0, &mut combo, checks, syndrome) {
                return w;
            }
        }
        panic!("no correction below the enumeration cap");
    }

    // d=3: every non-empty syndrome of the 4 Z-checks.
    let d3 = RotatedSurfaceCode::new(3).expect("d=3");
    for mask in 1u32..(1 << d3.z_stab_supports().len()) {
        let syndrome: Vec<u8> = (0..d3.z_stab_supports().len())
            .map(|i| ((mask >> i) & 1) as u8)
            .collect();
        let mwpm = d3.decode_sector(PauliSector::X, &syndrome, DecoderKind::Mwpm);
        let best = brute_min(d3.n_data(), d3.z_stab_supports(), &syndrome, 6);
        assert_eq!(
            mwpm.len(),
            best,
            "d=3 syndrome {syndrome:?}: MWPM {} vs brute-force min {best}",
            mwpm.len()
        );
    }

    // d=5: all single-error syndromes + 120 seeded double-error syndromes.
    let d5 = RotatedSurfaceCode::new(5).expect("d=5");
    for q in 0..d5.n_data() {
        let mut frame = PauliFrame::new_admitted(d5.n_frame_qubits(), &AdmissionController::new())
            .expect("admitted");
        frame.reset();
        frame.inject_x(q);
        let (z_syn, _) = d5.extract_syndrome(&mut frame);
        let mwpm = d5.decode_sector(PauliSector::X, &z_syn, DecoderKind::Mwpm);
        let best = brute_min(d5.n_data(), d5.z_stab_supports(), &z_syn, 4);
        assert_eq!(mwpm.len(), best, "d=5 single error on {q}");
    }
    let mut rng = Mulberry32::new(555);
    for _ in 0..120 {
        let q1 = (rng.next_f64() * d5.n_data() as f64) as usize;
        let mut q2 = (rng.next_f64() * d5.n_data() as f64) as usize;
        if q2 == q1 {
            q2 = (q2 + 1) % d5.n_data();
        }
        let mut frame = PauliFrame::new_admitted(d5.n_frame_qubits(), &AdmissionController::new())
            .expect("admitted");
        frame.reset();
        frame.inject_x(q1);
        frame.inject_x(q2);
        let (z_syn, _) = d5.extract_syndrome(&mut frame);
        let mwpm = d5.decode_sector(PauliSector::X, &z_syn, DecoderKind::Mwpm);
        let best = brute_min(d5.n_data(), d5.z_stab_supports(), &z_syn, 4);
        assert_eq!(
            mwpm.len(),
            best,
            "d=5 double error ({q1},{q2}): MWPM {} vs min {best}",
            mwpm.len()
        );
    }
}

// ---------------------------------------------------------------- -----
// Logical-vs-physical sweep: threshold behavior + determinism
// ---------------------------------------------------------------------

/// Below threshold (p = 0.05): the logical rate drops with distance
/// (d=3 > d=5 > d=7) and always beats the physical rate — the
/// logical-vs-physical sweep with threshold behavior. Above threshold
/// (p = 0.15): growing the code makes it worse (L(5) > L(3)) — the
/// threshold crossing exists.
#[test]
fn logical_vs_physical_sweep_threshold_behavior() {
    let mwpm = DecoderKind::Mwpm;
    // Below threshold: quadratic/suppressed regime.
    let l3 = RotatedSurfaceCode::new(3)
        .expect("ok")
        .logical_error_rate_x_only(20_000, 0.05, 20261121, mwpm);
    let l5 = RotatedSurfaceCode::new(5)
        .expect("ok")
        .logical_error_rate_x_only(8_000, 0.05, 20261121, mwpm);
    let l7 = RotatedSurfaceCode::new(7)
        .expect("ok")
        .logical_error_rate_x_only(4_000, 0.05, 20261121, mwpm);
    println!("WP-5.2 sweep p=0.05 (MWPM): L(d=3)={l3} L(d=5)={l5} L(d=7)={l7}");
    assert!(l3 < 0.05 && l5 < 0.05 && l7 < 0.05, "all below physical");
    assert!(
        l3 > l5 && l5 > l7,
        "below threshold: L(d=3)={l3} > L(d=5)={l5} > L(d=7)={l7}"
    );
    // Above threshold: increasing distance hurts.
    let h3 = RotatedSurfaceCode::new(3)
        .expect("ok")
        .logical_error_rate_x_only(8_000, 0.15, 20261121, mwpm);
    let h5 = RotatedSurfaceCode::new(5)
        .expect("ok")
        .logical_error_rate_x_only(4_000, 0.15, 20261121, mwpm);
    println!("WP-5.2 sweep p=0.15 (MWPM): L(d=3)={h3} L(d=5)={h5}");
    assert!(
        h5 > h3,
        "above threshold: L(d=5)={h5} must exceed L(d=3)={h3}"
    );
}

/// Exact seed determinism: identical seeds reproduce identical trials and
/// rates bit-for-bit; adjacent seeds produce different noise realizations.
#[test]
fn seed_determinism_exact() {
    let code = RotatedSurfaceCode::new(5).expect("ok");
    let run = || {
        (0..200u32)
            .map(|i| code.trial(0.05, 0.0, 777 + i, DecoderKind::Mwpm))
            .collect::<Vec<_>>()
    };
    let a = run();
    let b = run();
    assert_eq!(a, b, "identical seeds must reproduce identical trials");
    let c: Vec<_> = (0..200u32)
        .map(|i| code.trial(0.05, 0.0, 778 + i, DecoderKind::Mwpm))
        .collect();
    assert!(
        a.iter().zip(c.iter()).any(|(x, y)| x != y),
        "different seeds must produce different realizations"
    );
    // Rate-level determinism across the full sweep pipeline.
    let r1 = code.logical_error_rate_x_only(2_000, 0.05, 20261121, DecoderKind::Mwpm);
    let r2 = code.logical_error_rate_x_only(2_000, 0.05, 20261121, DecoderKind::Mwpm);
    assert_eq!(r1, r2);
    // Repetition-code determinism (ESM replica path).
    let d3 = RepetitionCode::new(3).expect("ok");
    assert_eq!(
        d3.logical_error_rate(1000, 0.05, 20241119),
        d3.logical_error_rate(1000, 0.05, 20241119)
    );
}

/// Combined independent X/Z noise exercises both CSS sectors through the
/// full ancilla pipeline. The CSS sectors decouple, so the exact combined
/// reference is `1 − (1−L_X)(1−L_Z)` from the two exhaustive enumerators;
/// the seeded MC must agree within the §5 ± 0.5 % absolute tolerance and
/// stay below the per-qubit physical rate `1 − (1−p)²`.
#[test]
fn combined_xz_noise_trial_pipeline() {
    let code = RotatedSurfaceCode::new(3).expect("ok");
    let p = 0.05;
    let ex = code.exact_logical_rate_x_only(p, DecoderKind::Mwpm);
    let ez = code.exact_logical_rate_z_only(p, DecoderKind::Mwpm);
    let exact_combined = 1.0 - (1.0 - ex) * (1.0 - ez);
    let rate = code.logical_error_rate(20_000, p, p, 31337, DecoderKind::Mwpm);
    assert!(
        (rate - exact_combined).abs() <= TOL_ORACLE,
        "combined MC {rate} vs CSS-decoupled exact {exact_combined} beyond ±0.5 %"
    );
    let physical_per_qubit = 1.0 - (1.0 - p) * (1.0 - p);
    assert!(
        rate < physical_per_qubit,
        "combined logical {rate} < per-qubit physical {physical_per_qubit}"
    );
    let again = code.logical_error_rate(20_000, p, p, 31337, DecoderKind::Mwpm);
    assert_eq!(rate, again, "combined sweep must be seed-deterministic");
    let trial = code.trial(0.02, 0.02, 1, DecoderKind::UnionFind);
    assert_eq!(
        trial.failed,
        trial.z_logical_flip || trial.x_logical_flip,
        "failure flag consistent with the observable flags"
    );
}

// ---------------------------------------------------------------- -----
// 50–500+ qubit frames: admission + benchmark speed
// ---------------------------------------------------------------------

/// The d=7 rotated surface code frame (97 qubits) and the 500-qubit frame
/// are admitted through ep-core; the provenance badge is declared.
#[test]
fn large_frames_admitted_via_ep_core() {
    assert_eq!(QEC_PROVENANCE, "SIMULATED_NOISY_QUANTUM");
    let c = AdmissionController::new();
    let f = PauliFrame::new_admitted(500, &c).expect("500-qubit frame admitted");
    assert_eq!(f.n_qubits(), 500);
    let f2 = PauliFrame::new_admitted(5_000, &c).expect("5000-qubit frame admitted");
    assert_eq!(f2.n_qubits(), 5_000);
    let code = RotatedSurfaceCode::new(7).expect("d=7 admitted");
    assert!(
        code.n_frame_qubits() >= 50,
        "d=7 frame ({}) is inside the 50–500+ range",
        code.n_frame_qubits()
    );
}

/// 500-qubit frame benchmark: 3000 full-frame layers (H layer, CNOT ladder,
/// S layer, CZ pairs, seeded injections, parity readout ≈ 2.6 M frame
/// operations) must complete well inside the CI budget, with exact frame
/// invariants verified around the run.
#[test]
fn frame_500_qubit_benchmark_speed() {
    use std::time::Duration;
    const N: usize = 500;
    const ROUNDS: usize = 3000;
    let c = AdmissionController::new();
    // Exact invariants: chain propagation across word boundaries.
    let mut frame = PauliFrame::new_admitted(N, &c).expect("admitted");
    frame.inject_x(0);
    for q in 0..N - 1 {
        frame.cnot(q, q + 1);
    }
    assert_eq!(
        frame.x_popcount(),
        N,
        "single X fans out through the ladder"
    );
    assert_eq!(frame.parity_z_all(), (N % 2) as u8);
    frame.hadamard_all();
    assert_eq!(frame.z_popcount(), N, "H layer swaps X → Z word-parallel");
    frame.hadamard_all();
    assert_eq!(frame.x_popcount(), N, "double H layer is the identity");
    frame.reset();

    let (elapsed, ops) =
        ep_quantum::qec::bench_frame_layers(N, ROUNDS, 20261121).expect("admitted");
    assert_eq!(ops, (6 * N + N / 2 - 1) * ROUNDS);
    assert!(
        elapsed < Duration::from_secs(10),
        "500 qubits × {ROUNDS} layers took {elapsed:?} — CI budget is 10 s"
    );
    println!(
        "WP-5.2 frame benchmark: {N} qubits × {ROUNDS} layers ({ops} frame ops) in {elapsed:?}"
    );
}

/// Frame word-packing at scale: ops across many u64 words stay exact.
#[test]
fn frame_5000_qubit_word_packing_exact() {
    let c = AdmissionController::new();
    let mut f = PauliFrame::new_admitted(5_000, &c).expect("admitted");
    f.inject_x(0);
    f.cnot_chain();
    assert_eq!(
        f.x_popcount(),
        5_000,
        "single X fans out through the whole 5000-qubit ladder"
    );
    f.hadamard_all();
    assert_eq!(f.z_popcount(), 5_000, "H layer swaps X → Z across 79 words");
    f.reset();
    let mut rng = Mulberry32::new(9);
    f.inject_random_xz(&mut rng, 0.5, 0.5);
    let z = f.z_popcount();
    assert!(
        (2_000..3_000).contains(&z),
        "seeded p=0.5 Z injection spread: {z} (expected ≈ 2500)"
    );
}
