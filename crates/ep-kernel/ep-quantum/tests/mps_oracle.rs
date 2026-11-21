//! WP-5.3 MPS oracle tests.
//!
//! 1. Exact state parity: untruncated MPS vs the exact density-matrix
//!    solver ([`ep_thermal`-style]) — seeded random 6-qubit circuits, ρ_mps =
//!    |ψ_mps⟩⟨ψ_mps| vs ρ_exact elementwise ≤ 1e-9 (plus per-site Bloch
//!    parity; the PHASE_05 checklist's ±0.02 observable bound is thereby
//!    exceeded by 7 orders of magnitude).
//! 2. Scaling: GHZ (exact bond 2) and product states to 100/250/500 qubits
//!    with zero truncation.
//! 3. Fail-closed ep-core arena admission (`n·(2·chi²)·16` vs 512 MB).
//! 4. Truncation telemetry + provenance badges
//!    (SIMULATED_PHYSICS_MODEL / SIMULATED_NOISY_QUANTUM).
//! 5. Seeded measurement sampling determinism + GHZ statistics.
//! 6. SWAP routing parity for long-range gates.

use ep_core::admission::AdmissionController;
use ep_quantum::lindblad::{ops, Axis, DensityMatrix, InitialState, Mulberry32, Op2};
use ep_quantum::{
    admit_mps, apply_two_qubit_to_density, mps_working_set_bytes, Gate2, MpsSim, C64,
    MPS_MAX_QUBITS, MPS_PROVENANCE_EXACT, MPS_PROVENANCE_TRUNCATED,
};
use std::ops::{Add, Mul};

fn admission() -> AdmissionController {
    AdmissionController::new()
}

/// 2×2 complex rotation helpers for random circuits.
fn rand_rot(rng: &mut Mulberry32) -> Op2 {
    let a = rng.next_f64() * std::f64::consts::TAU;
    let b = rng.next_f64() * std::f64::consts::TAU;
    let c = rng.next_f64() * std::f64::consts::TAU;
    // Rz(c)·Ry(b)·Rx(a) composed as sequential ops (applied in order).
    let _ = (a, b, c);
    // Composition is done by the caller applying three 1-qubit ops.
    Op2::new([1.0, 0.0, 0.0, 1.0], [0.0; 4])
}

/// Apply 1-qubit op `op` at `site` to the exact density matrix.
fn dm_apply_1q(rho: &mut DensityMatrix, site: usize, op: &Op2) {
    rho.apply_op1(site, *op);
}

/// Build ρ_mps = |ψ⟩⟨ψ| from the MPS amplitudes. The MPS amplitude index
/// carries qubit 0 as the MSB; the density matrix indexes bit q as `1<<q`
/// (LSB) — bit-reverse on the way in.
fn density_from_amplitudes(amps: &[C64], n: usize) -> (Vec<f64>, Vec<f64>) {
    let d = 1usize << n;
    let rev = |x: usize| -> usize {
        (0..n)
            .map(|b| ((x >> (n - 1 - b)) & 1) << b)
            .fold(0, |a, v| a | v)
    };
    let mut re = vec![0.0; d * d];
    let mut im = vec![0.0; d * d];
    for i in 0..d {
        for j in 0..d {
            let a = amps[rev(i)].mul(amps[rev(j)].conj());
            re[i * d + j] = a.re;
            im[i * d + j] = a.im;
        }
    }
    (re, im)
}

/// Seeded random 6-qubit circuit: layers of random 1-qubit rotations and
/// NN 2-qubit gates (CNOT / CZ / controlled-rotation, seeded choice).
struct CircuitOp {
    q0: usize,
    q1: Option<usize>,
    one: Option<Op2>,
    two: Option<Gate2>,
}

fn seeded_random_circuit(n: usize, seed: u32) -> Vec<CircuitOp> {
    let mut rng = Mulberry32::new(seed);
    let mut ops_out = Vec::new();
    for layer in 0..4u32 {
        for q in 0..n {
            let a = rng.next_f64() * std::f64::consts::TAU;
            let b = rng.next_f64() * std::f64::consts::TAU;
            let c = rng.next_f64() * std::f64::consts::TAU;
            ops_out.push(CircuitOp {
                q0: q,
                q1: None,
                one: Some(ep_quantum::rotation(Axis::X, a)),
                two: None,
            });
            ops_out.push(CircuitOp {
                q0: q,
                q1: None,
                one: Some(ep_quantum::rotation(Axis::Y, b)),
                two: None,
            });
            ops_out.push(CircuitOp {
                q0: q,
                q1: None,
                one: Some(ep_quantum::rotation(Axis::Z, c)),
                two: None,
            });
        }
        // NN entangling layer (staggered).
        let pairs: Vec<(usize, usize)> = if layer % 2 == 0 {
            (0..n - 1).step_by(2).map(|i| (i, i + 1)).collect()
        } else {
            (1..n - 1).step_by(2).map(|i| (i, i + 1)).collect()
        };
        for (qa, qb) in pairs {
            let pick = (rng.next_f64() * 3.0) as usize;
            let gate = match pick {
                0 => Gate2::cnot(),
                1 => Gate2::cz(),
                _ => {
                    let theta = rng.next_f64() * std::f64::consts::PI;
                    Gate2::controlled_rotation(Axis::Y, theta)
                }
            };
            ops_out.push(CircuitOp {
                q0: qa,
                q1: Some(qb),
                one: None,
                two: Some(gate),
            });
        }
    }
    // Deterministic final pass: mark unused rng draws consumed.
    let _ = rand_rot(&mut rng);
    ops_out
}

/// Untruncated MPS vs the exact density-matrix solver on a seeded random
/// 6-qubit circuit: max |ρ_mps − ρ_exact| ≤ 1e-9 and per-site Bloch parity.
#[test]
fn mps_matches_exact_density_matrix_on_6q_random_circuits() {
    for seed in [7u32, 42, 2024, 65535] {
        let circuit = seeded_random_circuit(6, seed);
        // Exact path.
        let mut rho = DensityMatrix::new(6, InitialState::Zeros).expect("6 qubits admitted");
        // MPS path (chi 64 — far above the 6-qubit bond ceiling of 8).
        let mut mps = MpsSim::new_admitted(6, 64, &admission()).expect("admitted");
        for op in &circuit {
            if let (Some(one), None) = (&op.one, &op.two) {
                dm_apply_1q(&mut rho, op.q0, one);
                mps.apply_one_qubit(op.q0, one);
            } else if let (Some(qb), Some(gate)) = (&op.q1, &op.two) {
                apply_two_qubit_to_density(&mut rho, op.q0, *qb, gate);
                mps.apply_two_qubit(op.q0, *qb, gate);
            }
        }
        // Truncation must be zero (untruncated representation).
        assert_eq!(
            mps.telemetry().truncations,
            0,
            "seed {seed}: bond ≤ 8 < chi 64"
        );
        assert!((mps.truncation_error_norm()).abs() < 1e-24);
        assert_eq!(mps.provenance_badge(), MPS_PROVENANCE_EXACT);
        // ρ_mps = |ψ⟩⟨ψ| vs ρ_exact — elementwise ≤ 1e-9.
        let amps = mps.amplitudes().expect("n = 6 within the dense cap");
        let (re_mps, im_mps) = density_from_amplitudes(&amps, 6);
        let d = 64usize;
        let mut max_diff = 0.0f64;
        let mut at = (0usize, 0usize);
        for i in 0..d {
            for j in 0..d {
                let dd = ((re_mps[i * d + j] - rho.re[i * d + j]).abs())
                    .max((im_mps[i * d + j] - rho.im[i * d + j]).abs());
                if dd > max_diff {
                    max_diff = dd;
                    at = (i, j);
                }
            }
        }
        if max_diff > 1e-9 {
            println!("seed {seed}: max diff {max_diff:.3e} at (i={:06b}, j={:06b}) — MPS amps at (i, j): ({:+.6e}, {:+.6e}) vs ({:+.6e}, {:+.6e})",
                at.0, at.1, re_mps[at.0 * d + at.1], im_mps[at.0 * d + at.1], rho.re[at.0 * d + at.1], rho.im[at.0 * d + at.1]);
        }
        assert!(
            max_diff < 1e-9,
            "seed {seed}: max |ρ_mps − ρ_exact| = {max_diff} at (i={:06b}, j={:06b})",
            at.0,
            at.1
        );
        // Per-site Bloch parity (the checklist's ±0.02 observable oracle).
        for q in 0..6 {
            let (bx_e, by_e, bz_e) = rho.bloch_vector(q);
            let bx_m = mps.expectation_local(q, &ops::X).re;
            let by_m = mps.expectation_local(q, &ops::Y).re;
            let bz_m = mps.expectation_local(q, &ops::Z).re;
            assert!(
                (bx_m - bx_e).abs() < 1e-9,
                "seed {seed} q{q} ⟨X⟩: {bx_m} vs {bx_e}"
            );
            assert!(
                (by_m - by_e).abs() < 1e-9,
                "seed {seed} q{q} ⟨Y⟩: {by_m} vs {by_e}"
            );
            assert!(
                (bz_m - bz_e).abs() < 1e-9,
                "seed {seed} q{q} ⟨Z⟩: {bz_m} vs {bz_e}"
            );
        }
    }
}

/// GHZ states (exact bond 2) scale to 100 / 250 / 500 qubits with ZERO
/// truncation; ⟨Z⟩ = 0 per site and Z-basis samples are all-equal bits.
#[test]
fn mps_ghz_scaling_to_500_qubits() {
    for n in [100usize, 250, 500] {
        let mut mps = MpsSim::new_admitted(n, 4, &admission()).expect("GHZ admitted");
        mps.apply_one_qubit(0, &ops::H);
        for i in 0..n - 1 {
            mps.apply_two_qubit_nn(i, &Gate2::cnot());
        }
        assert_eq!(mps.provenance_badge(), MPS_PROVENANCE_EXACT);
        assert_eq!(mps.telemetry().truncations, 0, "GHZ bond = 2 ≤ chi 4");
        assert!(mps.truncation_error_norm() < 1e-24);
        // Bond dims exactly 2 (the GHZ cut entanglement).
        assert!(
            mps.bond_dims().iter().all(|&b| b == 2),
            "{:?}",
            mps.bond_dims()
        );
        // ⟨Z_i⟩ = 0 and ⟨X_i⟩ = 0 for every site (GHZ support).
        for i in [0usize, 1, n / 2, n - 1] {
            assert!(
                (mps.expectation_local(i, &ops::Z).re).abs() < 1e-9,
                "n={n} ⟨Z{i}⟩"
            );
            assert!(
                (mps.expectation_local(i, &ops::X).re).abs() < 1e-9,
                "n={n} ⟨X{i}⟩"
            );
        }
        // Seeded Z-basis sampling: every shot is all-0 or all-1 (perfect GHZ).
        let mut rng = Mulberry32::new(11);
        for _ in 0..8 {
            let mut mps_shot = MpsSim::new_admitted(n, 4, &admission()).expect("admitted");
            mps_shot.apply_one_qubit(0, &ops::H);
            for i in 0..n - 1 {
                mps_shot.apply_two_qubit_nn(i, &Gate2::cnot());
            }
            let bits = mps_shot.sample_bits(&mut rng);
            let all0 = bits.iter().all(|b| !b);
            let all1 = bits.iter().all(|b| *b);
            assert!(all0 || all1, "GHZ Z-basis shot must be 00…0 or 11…1");
        }
    }
}

/// Product states scale to the full 500-qubit bound with chi = 1 and zero
/// truncation; local observables match the analytic single-qubit values.
#[test]
fn mps_product_state_scaling_to_500_qubits() {
    let n = MPS_MAX_QUBITS;
    let mut rng = Mulberry32::new(99);
    let mut mps = MpsSim::new_admitted(n, 1, &admission()).expect("500 qubits chi 1 admitted");
    // Per-qubit rotation angles (seeded, remembered for the analytic check).
    let mut angles = Vec::with_capacity(n);
    for i in 0..n {
        let theta = rng.next_f64() * std::f64::consts::PI;
        angles.push(theta);
        mps.apply_one_qubit(i, &ep_quantum::rotation(Axis::X, theta));
    }
    assert_eq!(mps.provenance_badge(), MPS_PROVENANCE_EXACT);
    assert!(mps.truncation_error_norm() < 1e-24);
    assert!(
        mps.bond_dims().iter().all(|&b| b == 1),
        "product state: chi 1"
    );
    // The ESM rotation convention (real symmetric R_x = [[c, −s],[−s, c]]):
    // R_x(θ)|0⟩ = (c, −s) → ⟨Z⟩ = cos θ, ⟨X⟩ = −sin θ, ⟨Y⟩ = 0.
    for i in [0usize, 1, n / 2, n - 1] {
        let theta = angles[i];
        let z = mps.expectation_local(i, &ops::Z).re;
        let y = mps.expectation_local(i, &ops::Y).re;
        let x = mps.expectation_local(i, &ops::X).re;
        assert!(
            (z - theta.cos()).abs() < 1e-9,
            "q{i} ⟨Z⟩ {z} vs cos {theta}"
        );
        assert!(
            (x + theta.sin()).abs() < 1e-9,
            "q{i} ⟨X⟩ {x} vs −sin {theta}"
        );
        assert!(y.abs() < 1e-9, "q{i} ⟨Y⟩ {y} must vanish");
    }
}

/// Fail-closed admission: over-budget chi / qubit counts are refused with
/// the honest reason BEFORE allocation; the 500-qubit bound holds.
#[test]
fn mps_budget_refusal_is_fail_closed() {
    let c = admission();
    // n = 500, chi = 184 → 541.7 MB > 512 MB arena → refused.
    let bytes = mps_working_set_bytes(500, 184).expect("no overflow");
    assert!(bytes > 512 * 1024 * 1024);
    let d = admit_mps(&c, 500, 184);
    assert!(!d.admitted);
    assert!(d.reason.contains("arena cap"), "{}", d.reason);
    // chi = 183 → 536.2 MB ≤ 512 MB? — 536,236,800 < 536,870,912 ✓ admitted.
    let bytes183 = mps_working_set_bytes(500, 183).expect("no overflow");
    assert!(bytes183 <= 512 * 1024 * 1024);
    assert!(admit_mps(&c, 500, 183).admitted);
    // Structural refusal: > 500 qubits.
    let d = admit_mps(&c, 501, 8);
    assert!(
        !d.admitted && d.reason.contains("501 qubits > 500"),
        "{}",
        d.reason
    );
    assert!(MpsSim::new_admitted(501, 8, &c).is_err());
    // Zero qubits / zero chi refused.
    assert!(!admit_mps(&c, 0, 8).admitted);
    assert!(!admit_mps(&c, 4, 0).admitted);
    // The 500-qubit constructor itself works at chi 2 (and admits).
    assert!(MpsSim::new_admitted(500, 2, &c).is_ok());
    // n = 6 interactive-parity sizes are admitted.
    assert!(MpsSim::new_admitted(6, 64, &c).is_ok());
}

/// Truncation telemetry + provenance badges: forcing chi_max = 2 on an
/// 8-qubit random circuit truncates (error > 0, badge flips), while the
/// same circuit at chi 16 is exact.
#[test]
fn truncation_telemetry_and_badges() {
    let circuit = seeded_random_circuit(8, 31);
    // Truncated run.
    let mut mps_t = MpsSim::new_admitted(8, 2, &admission()).expect("admitted");
    for op in &circuit {
        if let (Some(one), None) = (&op.one, &op.two) {
            mps_t.apply_one_qubit(op.q0, one);
        } else if let (Some(qb), Some(gate)) = (&op.q1, &op.two) {
            mps_t.apply_two_qubit(op.q0, *qb, gate);
        }
    }
    assert!(
        mps_t.telemetry().truncations > 0,
        "chi 2 on 8 qubits must truncate"
    );
    assert!(mps_t.truncation_error_norm() > 0.0);
    assert!(mps_t.telemetry().max_discarded_weight > 0.0);
    assert_eq!(mps_t.provenance_badge(), MPS_PROVENANCE_TRUNCATED);
    // Bond dims capped at chi_max.
    assert!(mps_t.bond_dims().iter().all(|&b| b <= 2));
    // Untruncated run (chi 16 ≥ 2^3 ceiling for 8 qubits).
    let mut mps_e = MpsSim::new_admitted(8, 16, &admission()).expect("admitted");
    for op in &circuit {
        if let (Some(one), None) = (&op.one, &op.two) {
            mps_e.apply_one_qubit(op.q0, one);
        } else if let (Some(qb), Some(gate)) = (&op.q1, &op.two) {
            mps_e.apply_two_qubit(op.q0, *qb, gate);
        }
    }
    assert_eq!(mps_e.telemetry().truncations, 0);
    assert_eq!(mps_e.provenance_badge(), MPS_PROVENANCE_EXACT);
}

/// Seeded sampling: identical seeds reproduce identical shots; |0…0⟩ always
/// samples all-zero; the norm stays 1 through projection rounds.
#[test]
fn measurement_sampling_is_seeded_and_deterministic() {
    // Determinism under a fixed seed.
    let run = |seed: u32| -> Vec<Vec<bool>> {
        let mut rng = Mulberry32::new(seed);
        let mut mps = MpsSim::new_admitted(6, 16, &admission()).expect("admitted");
        mps.apply_one_qubit(2, &ops::H); // |0⟩+|1⟩ on q2
        (0..12).map(|_| mps.sample_bits(&mut rng)).collect()
    };
    let a = run(1234);
    let b = run(1234);
    assert_eq!(a, b, "fixed seed must reproduce the exact sample sequence");
    // q2 flips across shots (superposition), all other qubits stay |0⟩.
    let flips: Vec<bool> = a.iter().map(|shot| shot[2]).collect();
    assert!(flips.iter().any(|b| *b) && flips.iter().any(|b| !b));
    for shot in &a {
        for (q, bit) in shot.iter().enumerate() {
            if q != 2 {
                assert!(!bit, "q{q} must stay |0⟩");
            }
        }
    }
    // |00…0⟩ always samples all-zero.
    let mut rng = Mulberry32::new(5);
    let mps = MpsSim::new_admitted(10, 8, &admission()).expect("admitted");
    for _ in 0..4 {
        let bits = mps.sample_bits(&mut rng);
        assert!(bits.iter().all(|b| !b), "product |0…0⟩ sample");
        // The projection never disturbs the all-zero product state.
        assert!((mps.norm_squared() - 1.0).abs() < 1e-12);
    }
}

/// Long-range 2-qubit gates: CZ(q0, q3) via SWAP routing matches the exact
/// density-matrix application elementwise (≤ 1e-9, untruncated).
#[test]
fn swap_routing_matches_exact_density_matrix() {
    let n = 5usize;
    // Build a seeded entangled seed state first (H layer + staggered CNOTs).
    let mut mps = MpsSim::new_admitted(n, 16, &admission()).expect("admitted");
    let mut rho = DensityMatrix::new(n, InitialState::Zeros).expect("5 qubits admitted");
    for q in 0..n {
        mps.apply_one_qubit(q, &ops::H);
        dm_apply_1q(&mut rho, q, &ops::H);
    }
    for (qa, qb) in [(0usize, 1usize), (2, 3)] {
        let g = Gate2::cnot();
        mps.apply_two_qubit(qa, qb, &g);
        apply_two_qubit_to_density(&mut rho, qa, qb, &g);
    }
    // The long-range gate: CZ(q0, q4) — routed across 3 sites.
    let gate = Gate2::cz();
    mps.apply_two_qubit(0, 4, &gate);
    apply_two_qubit_to_density(&mut rho, 0, 4, &gate);
    // Parity.
    let amps = mps.amplitudes().expect("n = 5 within the dense cap");
    let (re_mps, im_mps) = density_from_amplitudes(&amps, n);
    let d = 1usize << n;
    let mut max_diff = 0.0f64;
    for i in 0..d * d {
        max_diff = max_diff.max((re_mps[i] - rho.re[i]).abs());
        max_diff = max_diff.max((im_mps[i] - rho.im[i]).abs());
    }
    assert!(max_diff < 1e-9, "SWAP-routed CZ parity: {max_diff}");
    assert_eq!(mps.provenance_badge(), MPS_PROVENANCE_EXACT);
    // The routed gate is exact here — zero truncation at chi 16.
    assert_eq!(mps.telemetry().truncations, 0);
}

/// The complex SVD core: seeded random matrices reconstruct exactly with
/// orthonormal U / Vt and descending singular values.
#[test]
fn svd_core_reconstruction_and_orthogonality() {
    let mut rng = Mulberry32::new(777);
    for &(rows, cols) in &[(3usize, 3usize), (6, 4), (4, 6), (12, 12), (8, 2), (2, 8)] {
        let mut g = vec![C64::ZERO; rows * cols];
        for x in &mut g {
            *x = C64::new(rng.next_f64() - 0.5, rng.next_f64() - 0.5);
        }
        let (u, s, vt) = ep_quantum::svd_complex(&g, rows, cols);
        let k = rows.min(cols);
        // Descending, non-negative singular values.
        for w in s.windows(2) {
            assert!(w[0] >= w[1] - 1e-12, "s not descending: {s:?}");
        }
        // Reconstruction ‖G − U·diag(s)·Vt‖_F ≤ 1e-9.
        let mut rec = vec![C64::ZERO; rows * cols];
        for i in 0..rows {
            for j in 0..cols {
                let mut acc = C64::ZERO;
                for t in 0..k {
                    acc = acc.add(u[i * k + t].mul(vt[t * cols + j].scale(s[t])));
                }
                rec[i * cols + j] = acc;
            }
        }
        let mut frob = 0.0f64;
        for i in 0..rows * cols {
            frob += (rec[i].re - g[i].re).powi(2) + (rec[i].im - g[i].im).powi(2);
        }
        assert!(
            frob.sqrt() < 1e-9,
            "{rows}×{cols} reconstruction error {frob}"
        );
        // U†·U = I on the significant spectrum (rank-deficient shapes carry
        // legitimate zero columns beyond the rank).
        for t1 in 0..k {
            for t2 in 0..k {
                let mut acc = C64::ZERO;
                for i in 0..rows {
                    acc = acc.add(u[i * k + t1].conj().mul(u[i * k + t2]));
                }
                let want = if t1 == t2 && s[t1] > s[0] * 1e-9 {
                    1.0
                } else {
                    0.0
                };
                assert!(
                    (acc.re - want).abs() < 1e-7 && acc.im.abs() < 1e-7,
                    "U†U[{t1}][{t2}] = ({}, {}) want {want}",
                    acc.re,
                    acc.im
                );
            }
        }
        // Vt·Vt† = I on the significant spectrum.
        for t1 in 0..k {
            for t2 in 0..k {
                let mut acc = C64::ZERO;
                for j in 0..cols {
                    acc = acc.add(vt[t1 * cols + j].mul(vt[t2 * cols + j].conj()));
                }
                let want = if t1 == t2 && s[t1] > s[0] * 1e-9 {
                    1.0
                } else {
                    0.0
                };
                assert!(
                    (acc.re - want).abs() < 1e-7 && acc.im.abs() < 1e-7,
                    "Vt·Vt†[{t1}][{t2}] = ({}, {}) want {want}",
                    acc.re,
                    acc.im
                );
            }
        }
    }
}

/// The dense-amplitude helper honestly refuses beyond its documented cap.
#[test]
fn amplitudes_refuse_beyond_dense_cap() {
    let mps = MpsSim::new_admitted(17, 2, &admission()).expect("admitted");
    let err = mps.amplitudes().expect_err("n = 17 refused");
    assert!(err.contains("dense vector cap"), "{}", err);
}
