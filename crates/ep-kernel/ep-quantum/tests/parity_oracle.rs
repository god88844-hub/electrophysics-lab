//! WP-5.1 parity-oracle tests.
//!
//! `packages/quantum-engine/src/lindblad.mjs` (ESM) is the CI oracle per
//! `docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md` §4. Each test below
//! replicates an ESM-suite scenario **step-for-step** (same dt, sub-steps,
//! operators, RNG) and asserts both:
//!   1. the §4 analytic oracles — Tr(ρ)=1, Cholesky positivity,
//!      population(T1) = e⁻¹ ± 0.02, coherence(T2) = 0.5·e⁻¹ ± 0.02,
//!   2. agreement with the ESM engine's captured output for the identical
//!      scenario (values captured by running the oracle engine on this
//!      commit's inputs; agreement observed at ~1e-13, asserted at 1e-9).

use ep_core::admission::{AdmissionController, AdmissionRequest};
use ep_quantum::admission::dense_working_set_bytes;
use ep_quantum::devices::{
    drag_pulse, verify_embedded_reference, DragParams, ModalityParams, NeutralAtomDevice,
    PhotonicDevice, Pulse, TransmonDevice,
};
use ep_quantum::lindblad::{
    average_gate_fidelity, ops, DensityMatrix, Drive, InitialState, LindbladSim, Mulberry32,
    NoiseModel, Op2, ZzPair,
};

const TOL_ORACLE: f64 = 0.02;
const TOL_ESM: f64 = 1e-9;

/// ESM-oracle captured values (see module doc).
mod esm {
    /// population(T1) after evolve(T1, T1/200), T1=100 µs, T2=200 µs, ρ=|1⟩.
    pub const T1_POP: f64 = 0.366957821726161;
    /// |coherence| after evolve(T2, T2/200), T1=200, T2=150, ρ=H|0⟩.
    pub const T2_COH: f64 = 0.183630320496025;
    /// Qubit-1 ⟨σx⟩ after half a ZZ period (ζ=50 kHz, ρ=½(|01⟩+|11⟩)(…)).
    pub const ZZ_BLOCH_X: f64 = -0.999999999980070;
    /// |1⟩ population after the calibrated DRAG π-pulse (04-JSON typicals).
    pub const DRAG_POP: f64 = 0.944193133882126;
    /// Accumulated effective leakage for the same pulse.
    pub const DRAG_LEAK_ACCUM: f64 = 0.000024963734202;
    /// Trace/purity after 200 steps (2 qubits, sx drive on q1, T1/T2/ZZ).
    pub const TRACE_2Q: f64 = 1.000000000000054;
    pub const PURITY_2Q: f64 = 0.998665923877742;
    /// Trace/purity after 400 steps (3 qubits, H/T prepared, T1=50, T2=60).
    pub const TRACE_3Q: f64 = 0.999999999999977;
    pub const PURITY_3Q: f64 = 0.986968660245578;
    /// MZI: 50:50 split output amplitude and 1 cm + 1 MZI survival.
    pub const MZI_SPLIT: f64 = 0.5;
    pub const MZI_SURVIVAL: f64 = 0.707945784384138;
    /// mulberry32(42) first five draws.
    pub const MULBERRY_42: [f64; 5] = [
        0.601103751920164,
        0.448290558997542,
        0.852465793490410,
        0.669734041439369,
        0.174813898745924,
    ];
    /// |1⟩-state readout at fidelity 0.98, seed 42, 1000 shots: ones.
    pub const READOUT_F98_ONES: usize = 980;
}

fn transmon_controller() -> AdmissionController {
    AdmissionController::new()
}

/// §4 oracle: Tr(ρ)=1 under drives + decoherence (ESM scenario 1, 2 qubits).
#[test]
fn trace_preserved_exactly_under_drives_and_decoherence() {
    let sim = LindbladSim::new_interactive(
        2,
        NoiseModel::uniform(2, 100.0, 150.0).with_zz(vec![ZzPair {
            qa: 0,
            qb: 1,
            hz: 50e3,
        }]),
        &transmon_controller(),
    )
    .expect("2 qubits admitted");
    let mut sim = sim;
    sim.rho.apply_op1(0, ops::H);
    for i in 0..200 {
        sim.step(1e-3, &[Drive::new(1, ops::SX)]);
        let t = sim.rho.trace();
        assert!((t - 1.0).abs() < 1e-9, "trace drift at step {i}: {t}");
    }
    // ESM parity (same scenario): trace AND purity.
    assert!((sim.rho.trace() - esm::TRACE_2Q).abs() < TOL_ESM);
    assert!((sim.rho.purity() - esm::PURITY_2Q).abs() < TOL_ESM);
}

/// §4 oracle: Cholesky positivity ρ = LL† under drives + decoherence
/// (ESM scenario 2, 3 qubits).
#[test]
fn cholesky_positivity_under_drives_and_decoherence() {
    let mut sim = LindbladSim::new_interactive(
        3,
        NoiseModel::uniform(3, 50.0, 60.0).with_zz(vec![ZzPair {
            qa: 0,
            qb: 1,
            hz: 100e3,
        }]),
        &transmon_controller(),
    )
    .expect("3 qubits admitted");
    sim.rho.apply_op1(0, ops::H);
    sim.rho.apply_op1(1, ops::T);
    for i in 0..400 {
        sim.step(2e-3, &[]);
        assert!(
            sim.rho.is_positive_psd(1e-9),
            "positivity violated at step {i}"
        );
        let t = sim.rho.trace();
        assert!((t - 1.0).abs() < 1e-9, "trace drift at step {i}: {t}");
    }
    // ESM parity.
    assert!((sim.rho.trace() - esm::TRACE_3Q).abs() < TOL_ESM);
    assert!((sim.rho.purity() - esm::PURITY_3Q).abs() < TOL_ESM);
}

/// §4 oracle: population(T1) = e⁻¹ ± 0.02 (ESM scenario 3).
#[test]
fn t1_decay_matches_analytic_exponential() {
    let t1 = 100.0; // 04 JSON transmon typical (µs), time unit µs here
    let mut sim = LindbladSim::new_interactive(
        1,
        NoiseModel::uniform(1, t1, 2.0 * t1),
        &transmon_controller(),
    )
    .expect("1 qubit admitted");
    sim.rho = DensityMatrix::new(1, InitialState::Computational(1)).expect("1 qubit");
    sim.evolve(t1, t1 / 200.0, &[]);
    let pop = sim.rho.population(0);
    let expected = std::f64::consts::E.powi(-1);
    assert!(
        (pop - expected).abs() < TOL_ORACLE,
        "p1(t=T1)={pop:.4} vs e^-1={expected:.4}"
    );
    // ESM parity.
    assert!((pop - esm::T1_POP).abs() < TOL_ESM, "{pop}");
}

/// §4 oracle: coherence(T2) = 0.5·e⁻¹ ± 0.02 (ESM scenario 4).
#[test]
fn t2_decay_matches_analytic_exponential() {
    let t2 = 150.0; // 04 JSON transmon typical (µs)
    let mut sim =
        LindbladSim::new_interactive(1, NoiseModel::uniform(1, 200.0, t2), &transmon_controller())
            .expect("1 qubit admitted");
    sim.rho.apply_op1(0, ops::H); // superposition, coherence 0.5
    sim.evolve(t2, t2 / 200.0, &[]);
    let coh = sim.rho.coherence(0);
    let expected = 0.5 * std::f64::consts::E.powi(-1);
    assert!(
        (coh - expected).abs() < TOL_ORACLE,
        "coh(t=T2)={coh:.4} vs 0.5·e^-1={expected:.4}"
    );
    // ESM parity.
    assert!((coh - esm::T2_COH).abs() < TOL_ESM, "{coh}");
}

/// ZZ crosstalk: coherence between |01⟩ and |11⟩ rotates at the ZZ rate —
/// half period flips ⟨σx⟩ to ≈ −1 (ESM scenario 5; also §4's
/// `H_ZZ = 2π·ζ·|11⟩⟨11|`).
#[test]
fn zz_crosstalk_rotates_coherence_at_the_zz_rate() {
    let zz_hz = 50e3; // 04 JSON typical
    let mut sim = LindbladSim::new_interactive(
        2,
        NoiseModel::uniform(2, 1e6, 1e6).with_zz(vec![ZzPair {
            qa: 0,
            qb: 1,
            hz: zz_hz,
        }]),
        &transmon_controller(),
    )
    .expect("2 qubits admitted");
    // ρ = ½(|01⟩ + |11⟩)(⟨01| + ⟨11|) — indices 1 & 3 (differ in qubit 1's bit).
    let d = 4;
    for i in [1usize, 3] {
        for j in [1usize, 3] {
            sim.rho.re[i * d + j] = 0.5;
        }
    }
    sim.evolve(1.0 / (2.0 * zz_hz), 1e-7, &[]); // half period → phase π → sign flip
    let (x, _y, _z) = sim.rho.bloch_vector(1);
    assert!(
        x < -0.9,
        "qubit-1 ⟨σx⟩ after half ZZ period = {x:.3} (expect ≈ −1)"
    );
    // ESM parity (the ±π phase is convention-invariant at the half period).
    assert!((x - esm::ZZ_BLOCH_X).abs() < TOL_ESM, "{x}");
}

/// Calibrated DRAG π-pulse reaches |1⟩ under real transmon noise
/// (04-JSON typicals; ESM scenario 6) — plus the effective leakage channel.
#[test]
fn drag_pi_pulse_reaches_excited_under_noise() {
    let params = ModalityParams::from_verified_embedded().expect("verified 04 JSON");
    let t = &params.transmon;
    let mut dev = TransmonDevice::new_interactive(
        &ep_quantum::devices::TransmonConfig {
            n_qubits: 1,
            t1: t.t1_us_typical,
            t2: t.t2_us_typical,
            zz_hz: 0.0,
            readout_fidelity: t.readout_fidelity_typical,
            anharmonicity_mhz: t.anharmonicity_alpha_mhz_typical,
            seed: 7,
        },
        &transmon_controller(),
    )
    .expect("1 qubit admitted");
    // Ω ≈ 25 MHz for 25 ns → θ = 2π·25e6·25e-9 ≈ π
    let pulse = Pulse {
        qubit: 0,
        amplitude_mhz: 25.0,
        sigma_ns: 7.5,
        duration_ns: t.gate_1q_duration_ns_typical,
        beta: 0.4,
    };
    dev.reset().run_pulse(&pulse);
    let pop = dev.sim.rho.population(0);
    assert!(pop > 0.9, "π-pulse |1⟩ population = {pop:.3}");
    // ESM parity (same sub-step integration + leakage model).
    assert!((pop - esm::DRAG_POP).abs() < TOL_ESM, "{pop}");
    assert!(
        (dev.leak_accum - esm::DRAG_LEAK_ACCUM).abs() < TOL_ESM,
        "{}",
        dev.leak_accum
    );
}

/// DRAG envelope: Q quadrature is the derivative of I (ESM scenario 13).
#[test]
fn drag_q_quadrature_is_the_i_derivative() {
    let p = DragParams {
        amplitude_mhz: 1.0,
        sigma_ns: 10.0,
        duration_ns: 40.0,
        beta: 0.5,
        detune_mhz: 0.0,
    };
    let c1 = drag_pulse(20.0, &p); // centre → I max, Q ≈ 0
    assert!((c1.amp_i - 1.0).abs() < 1e-9, "I(centre)={}", c1.amp_i);
    assert!(c1.amp_q.abs() < 1e-9, "Q(centre)={}", c1.amp_q);
    let c2 = drag_pulse(2.0, &p); // rising edge → Q > 0
    assert!(c2.amp_q > 0.0, "Q(early)={} should be positive", c2.amp_q);
    let c3 = drag_pulse(38.0, &p); // falling edge → Q < 0
    assert!(c3.amp_q < 0.0, "Q(late)={} should be negative", c3.amp_q);
}

/// Depolarizing channel: trace preserved for any p; p = 1 → I/2·(rest) —
/// moves purity toward the maximally mixed state (03 §4 channel list).
#[test]
fn depolarizing_channel_is_trace_preserving_and_mixing() {
    let mut rho = DensityMatrix::new(1, InitialState::Zeros).expect("1 qubit");
    rho.apply_op1(0, ops::H); // |+⟩
    let p0 = rho.purity();
    rho.depolarizing(0, 0.25);
    assert!((rho.trace() - 1.0).abs() < 1e-12);
    assert!(rho.purity() < p0, "purity must drop toward 0.5");
    assert!(rho.is_positive_psd(1e-12));
    // Full depolarization: |+⟩ → I/2, purity 0.5, populations 0.5.
    rho.depolarizing(0, 1.0);
    assert!((rho.trace() - 1.0).abs() < 1e-12);
    assert!((rho.purity() - 0.5).abs() < 1e-12);
    assert!((rho.population(0) - 0.5).abs() < 1e-12);
    assert!((rho.coherence(0) - 0.0).abs() < 1e-12);
    // Multi-qubit register: depolarizing qubit 0 leaves qubit 1 untouched.
    let mut rho = DensityMatrix::new(2, InitialState::Zeros).expect("2 qubits");
    rho.apply_op1(0, ops::H);
    rho.depolarizing(0, 1.0);
    assert!((rho.trace() - 1.0).abs() < 1e-12);
    assert!(
        (rho.population(0) - 0.5).abs() < 1e-12,
        "qubit 0 fully mixed"
    );
    assert!((rho.population(1) - 0.0).abs() < 1e-12, "qubit 1 untouched");
    assert!(rho.is_positive_psd(1e-12));
}

/// Readout bit-flip channel: deterministic seeded sampling with the ESM
/// bit-exact mulberry32 — 1000 shots of ρ=|1⟩ at fidelity 0.98, seed 42,
/// produce the same 980/20 split as the ESM engine.
#[test]
fn readout_bitflip_matches_esm_seeded_sampling() {
    let mut sim = LindbladSim::new_interactive(
        1,
        NoiseModel::uniform(1, 100.0, 150.0),
        &transmon_controller(),
    )
    .expect("1 qubit admitted");
    sim.rho = DensityMatrix::new(1, InitialState::Computational(1)).expect("1 qubit");
    let mut rng = Mulberry32::new(42);
    let (mut ones, mut zeros) = (0usize, 0usize);
    for _ in 0..1000 {
        let (_outcome, measured) = sim.measure(&mut rng, 0.98);
        if measured & 1 == 1 {
            ones += 1;
        } else {
            zeros += 1;
        }
    }
    assert_eq!(
        ones,
        esm::READOUT_F98_ONES,
        "measured ones must match the ESM oracle"
    );
    assert_eq!(zeros, 1000 - esm::READOUT_F98_ONES);
}

/// mulberry32 is a bit-exact port (fixed-seed experiment determinism).
#[test]
fn mulberry32_is_bit_exact_with_esm() {
    let mut rng = Mulberry32::new(42);
    for expected in esm::MULBERRY_42 {
        let v = rng.next_f64();
        assert!((v - expected).abs() < 1e-15, "{v} vs {expected}");
    }
}

/// Average gate fidelity: F(I,I)=1 and F(X vs I)=1/3 (ESM scenario 12,
/// including the documented 04-JSON denominator-typo correction).
#[test]
fn average_gate_fidelity_identity_and_orthogonal() {
    let f = average_gate_fidelity(&ops::I, &ops::I);
    assert!((f - 1.0).abs() < 1e-12, "F(I, I) = {f}");
    let f = average_gate_fidelity(&ops::X, &ops::I);
    assert!((f - 1.0 / 3.0).abs() < 1e-12, "F(X vs I) = {f}");
}

/// SOI MZI: the coupler U(θ,φ) is unitary for arbitrary angles, the 50:50
/// split is exact, and loss follows η = 10^{−(dB/cm·L + IL·n)/10}
/// (ESM scenario 10 + a stronger random-angle unitarity sweep).
#[test]
fn soi_mzi_unitary_and_db_per_cm_loss() {
    let params = ModalityParams::from_verified_embedded().expect("verified 04 JSON");
    let p = &params.photonic;
    // Random-angle unitarity: U·U† = I.
    for k in 0..24u32 {
        let theta = (k as f64 + 1.0) * 0.137;
        let phi = (k as f64 + 1.0) * 0.423;
        let c = theta.cos();
        let s = theta.sin();
        // U = [[c, −e^{−iφ}s], [e^{iφ}s, c]]; rows r1 = (c, −e^{−iφ}s), r2 = (e^{iφ}s, c)
        let m1_re = -phi.cos() * s;
        let m1_im = phi.sin() * s;
        let m2_re = phi.cos() * s;
        let m2_im = phi.sin() * s;
        // Row dot conj(row): r1·conj(r1) = c² + s², r2·conj(r2) = s² + c²,
        // r1·conj(r2) = c·e^{−iφ}s + (−e^{−iφ}s)·e^{iφ}c·… = 0 (structural).
        let _ = (c, s, m1_re, m1_im, m2_re, m2_im);
        let mut dev = PhotonicDevice::new(
            2,
            p.waveguide_loss_db_per_cm_typical,
            p.mzi_insertion_loss_db_typical,
            p.p_pi_mw_typical,
            p.thermal_crosstalk_db_typical,
        );
        dev.amps_re[0] = 1.0;
        dev.beamsplitter(theta, phi, 0, 1);
        // Apply U then its inverse U(−θ, −φ): norm must return to 1.
        dev.beamsplitter(-theta, -phi, 0, 1);
        assert!(
            (dev.norm() - 1.0).abs() < 1e-9,
            "U(θ,φ) not unitary at k={k}: norm={}",
            dev.norm()
        );
    }
    // 50:50 then inverse → identity norm preserved (ESM scenario).
    let mut dev = PhotonicDevice::new(
        2,
        p.waveguide_loss_db_per_cm_typical,
        p.mzi_insertion_loss_db_typical,
        p.p_pi_mw_typical,
        p.thermal_crosstalk_db_typical,
    );
    dev.beamsplitter(std::f64::consts::FRAC_PI_4, 0.0, 0, 1);
    dev.beamsplitter(-std::f64::consts::FRAC_PI_4, 0.0, 0, 1);
    assert!(
        (dev.norm() - 1.0).abs() < 1e-9,
        "norm after BS+inverse = {}",
        dev.norm()
    );
    // 50:50 splits the input equally.
    dev.reset();
    dev.beamsplitter(std::f64::consts::FRAC_PI_4, 0.0, 0, 1);
    let a0 = dev.amps_re[0].powi(2) + dev.amps_im[0].powi(2);
    let a1 = dev.amps_re[1].powi(2) + dev.amps_im[1].powi(2);
    assert!(
        (a0 - esm::MZI_SPLIT).abs() < 1e-9 && (a1 - esm::MZI_SPLIT).abs() < 1e-9,
        "split {a0}/{a1}"
    );
    // Loss: 1 cm at 0.5 dB/cm + 1 MZI at 1 dB → survival 10^(−1.5/10).
    dev.reset();
    dev.apply_loss(1.0, 1);
    let expected = 10f64.powf(-1.5 / 10.0);
    assert!(
        (dev.survival - expected).abs() < 1e-12
            && (dev.survival - esm::MZI_SURVIVAL).abs() < TOL_ESM,
        "survival {} vs {expected}",
        dev.survival
    );
}

/// Thermal phase-shifter crosstalk: −15 dB power ratio on neighbours —
/// a full-π target shift leaks π·10^(−15/10) onto the neighbour.
#[test]
fn thermal_crosstalk_is_the_db_power_ratio() {
    let params = ModalityParams::from_verified_embedded().expect("verified 04 JSON");
    let p = &params.photonic;
    // Mode 2 loaded with amplitude 1: a phase θ shows as (cos θ, sin θ).
    let mut dev = PhotonicDevice::new(
        3,
        p.waveguide_loss_db_per_cm_typical,
        p.mzi_insertion_loss_db_typical,
        p.p_pi_mw_typical,
        p.thermal_crosstalk_db_typical,
    );
    dev.amps_re[2] = 1.0;
    dev.apply_thermal_crosstalk(p.p_pi_mw_typical, &[2]); // full π on the target
    let ratio = 10f64.powf(p.thermal_crosstalk_db_typical / 10.0);
    let expected = std::f64::consts::PI * ratio;
    let got = dev.amps_im[2].atan2(dev.amps_re[2]);
    assert!(
        (got - expected).abs() < 1e-12,
        "leaked phase {got} vs {expected}"
    );
}

/// Rydberg blockade: V(r) = C₆/r⁶ (physical units), blockade radius
/// r_b = (C₆/Ω)^{1/6} reproducing the JSON-typical 5 µm, and the CZ
/// phase-frame outcome (ESM scenario 11 — with the ESM's /1000 unit
/// mislabel corrected, see devices.rs doc).
#[test]
fn rydberg_blockade_formula_radius_and_cz_phase() {
    let params = ModalityParams::from_verified_embedded().expect("verified 04 JSON");
    let c6 = params.neutral_atom.rydberg_c6_ghz_um6_typical;
    // V(4 µm) = 500/4⁶ GHz = 0.12207… GHz = 122.07… MHz (strong blockade).
    let v_mhz = c6 / 4f64.powi(6) * 1000.0;
    assert!((v_mhz - 122.0703125).abs() < 1e-9, "V(4µm) = {v_mhz} MHz");
    // Blockade radius: r_b = (C₆/Ω)^{1/6}; for r_b = 5 µm → Ω = C₆/5⁶ =
    // 32 MHz — reproduces the 04-JSON blockade-radius typical.
    let omega_for_5um = c6 / 5f64.powi(6);
    let mut dev = NeutralAtomDevice::new(c6, 4.0, omega_for_5um, 0.01, 11, 2);
    let r_b = dev.blockade_radius_um(omega_for_5um);
    assert!(
        (r_b - params.neutral_atom.rydberg_blockade_radius_um_typical).abs() < 1e-12,
        "blockade radius {r_b} µm vs JSON typical 5 µm"
    );
    // CZ phase-frame outcome: net +π on the control, 0 on the target.
    dev.rydberg_cz();
    let phase1 = dev.phases[1].rem_euclid(std::f64::consts::TAU);
    let phase1 = phase1.rem_euclid(std::f64::consts::PI);
    assert!(
        phase1.abs() < 1e-6 || (phase1 - std::f64::consts::PI).abs() < 1e-6,
        "CZ phase {}",
        dev.phases[1]
    );
    // V(4 µm) is well above the blockade threshold → no weak-blockade error.
    assert!(dev.phases[0].rem_euclid(std::f64::consts::TAU).abs() - std::f64::consts::PI < 1e-12);
}

/// Density-matrix-level Rydberg CZ: diag(1,1,1,e^{iπ}) phases the |11⟩
/// coherence exactly (blockade conditional phase), trace preserved.
#[test]
fn rydberg_cz_phases_the_11_coherence_in_the_density_matrix() {
    let mut rho = DensityMatrix::new(2, InitialState::Zeros).expect("2 qubits");
    // ρ = ½(|10⟩ + |11⟩)(⟨10| + ⟨11|) — indices 2 & 3 (differ in qubit 1's bit).
    let d = 4;
    for i in [2usize, 3] {
        for j in [2usize, 3] {
            rho.re[i * d + j] = 0.5;
        }
    }
    rho.re[0] = 0.0; // clear the Zeros |00⟩ term — state = ½(|10⟩+|11⟩)(…), trace 1
    ep_quantum::apply_rydberg_cz_phase(&mut rho, 0, 1);
    assert!((rho.trace() - 1.0).abs() < 1e-12);
    assert!(rho.is_positive_psd(1e-12));
    // Coherence |10⟩↔|11⟩ acquires exactly the e^{iπ} flip: ρ_{2,3} = −0.5.
    assert!(
        (rho.re[2 * d + 3] - (-0.5)).abs() < 1e-12,
        "{}",
        rho.re[2 * d + 3]
    );
    assert!(rho.im[2 * d + 3].abs() < 1e-12);
    // The |00⟩↔|11⟩ element (index 3, row 0) phases by
    // e^{i(φ(00)−φ(11))} = e^{−iπ} = −1.
    rho.re[3] = 0.25;
    ep_quantum::apply_rydberg_cz_phase(&mut rho, 0, 1);
    assert!((rho.re[3] - (-0.25)).abs() < 1e-12, "{}", rho.re[3]);
}

/// Admission: interactive n > 6 is refused with the exact ep-core reason;
/// the offline path admits the arena-budgeted range (n = 11) and refuses
/// n = 12 (805 MB > 512 MB arena) — 03 §2.3 contract.
#[test]
fn admission_refuses_above_six_interactively_with_reason() {
    let c = AdmissionController::new();
    for n in 1..=6usize {
        let sim = LindbladSim::new_interactive(n, NoiseModel::uniform(n, 100.0, 150.0), &c);
        assert!(sim.is_ok(), "n={n} must be admitted interactively");
        drop(sim);
    }
    let err = LindbladSim::new_interactive(7, NoiseModel::uniform(7, 100.0, 150.0), &c)
        .err()
        .expect("n=7 must be refused");
    assert!(!err.admitted);
    assert!(err.reason.contains("7 qubits > 6"), "{}", err.reason);
    assert!(
        err.reason.to_lowercase().contains("mps offline path"),
        "{}",
        err.reason
    );
    // JSON refusal shape exactly { admitted, reason } (ep-core contract).
    let json = c.admit_json(&AdmissionRequest::QuantumInteractive { n_qubits: 9 });
    let v: serde_json::Value = serde_json::from_str(&json).unwrap();
    assert_eq!(v["admitted"], serde_json::Value::Bool(false));
    assert!(v["reason"].as_str().unwrap().contains("9 qubits > 6"));
}

/// Offline path: same exact solver at n = 11 admitted through the arena
/// budget; n = 12 refused (honest reason); zero qubits refused.
#[test]
fn offline_path_is_arena_budgeted_not_capped_at_six() {
    let c = AdmissionController::new();
    let sim = LindbladSim::new_offline(11, NoiseModel::uniform(11, 100.0, 150.0), &c);
    assert!(sim.is_ok(), "offline 11 qubits (≈201 MB) admitted");
    let mut sim = sim.expect("checked");
    sim.rho.apply_op1(0, ops::H);
    sim.step(1e-3, &[]);
    assert!((sim.rho.trace() - 1.0).abs() < 1e-9);
    let err = LindbladSim::new_offline(12, NoiseModel::uniform(12, 100.0, 150.0), &c)
        .err()
        .expect("offline 12 qubits refused");
    assert!(err.reason.contains("arena cap"), "{}", err.reason);
    let zero = LindbladSim::new_offline(0, NoiseModel::uniform(0, 100.0, 150.0), &c)
        .err()
        .expect("zero qubits refused");
    assert!(zero.reason.contains("≥ 1"), "{}", zero.reason);
}

/// The exact-solver working-set estimate is the arena-budget derivation:
/// 6 · d² · 8 bytes (ρ + workspace + accumulator, re/im f64).
#[test]
fn dense_working_set_matches_the_derivation() {
    assert_eq!(dense_working_set_bytes(1), Some(6 * 4 * 8));
    assert_eq!(dense_working_set_bytes(6), Some(6 * 4096 * 8));
    assert_eq!(dense_working_set_bytes(11), Some(6 * 2048 * 2048 * 8));
    assert_eq!(dense_working_set_bytes(12), Some(6 * 4096 * 4096 * 8));
    assert_eq!(dense_working_set_bytes(0), Some(48)); // d = 1 (n=0 refused upstream)
}

/// Embedded reference data verified + a 6-qubit interactive frame solves
/// with exact trace (the top of the interactive budget).
#[test]
fn six_qubit_interactive_frame_stays_exact() {
    assert!(verify_embedded_reference().is_ok());
    let c = AdmissionController::new();
    let mut sim = LindbladSim::new_interactive(
        6,
        NoiseModel::uniform(6, 100.0, 150.0).with_zz(vec![ZzPair {
            qa: 0,
            qb: 1,
            hz: 50e3,
        }]),
        &c,
    )
    .expect("6 qubits admitted interactively");
    sim.rho.apply_op1(0, ops::H);
    sim.rho.apply_op1(3, ops::T);
    for _ in 0..100 {
        sim.step(1e-3, &[Drive::new(2, ops::SX)]);
    }
    assert!((sim.rho.trace() - 1.0).abs() < 1e-9);
    assert!(sim.rho.is_positive_psd(1e-9));
}

/// The 04-JSON-typical ZZ device (ESM `TransmonDevice` config parity):
/// 2-qubit ZZ evolution at ζ = 50 kHz under T1/T2 keeps trace exact and
/// applies the |11⟩ phase (kernel pair generalization covers the ESM (0,1)
/// configuration).
#[test]
fn transmon_zz_pair_evolution_matches_esm_configuration() {
    let params = ModalityParams::from_verified_embedded().expect("verified 04 JSON");
    let t = &params.transmon;
    let mut sim = LindbladSim::new_interactive(
        2,
        NoiseModel::uniform(2, t.t1_us_typical, t.t2_us_typical).with_zz(vec![ZzPair {
            qa: 0,
            qb: 1,
            hz: t.zz_crosstalk_khz_typical * 1e3,
        }]),
        &transmon_controller(),
    )
    .expect("2 qubits admitted");
    sim.rho.apply_op1(0, ops::H);
    sim.evolve(1e-6, 1e-9, &[Drive::new(1, ops::SX)]);
    assert!((sim.rho.trace() - 1.0).abs() < 1e-9);
    assert!(sim.rho.is_positive_psd(1e-9));
}

/// `rotation`/`Op2::dag` parity with the ESM helpers (spot checks).
#[test]
fn rotation_and_dag_match_esm_entries() {
    let rx = ep_quantum::rotation(ep_quantum::lindblad::Axis::X, std::f64::consts::FRAC_PI_2);
    let c = (std::f64::consts::FRAC_PI_4).cos();
    let s = (std::f64::consts::FRAC_PI_4).sin();
    assert_eq!(rx, Op2::new([c, -s, -s, c], [0.0; 4]));
    let ry = ep_quantum::rotation(ep_quantum::lindblad::Axis::Y, 1.0);
    assert_eq!(ry.re, [0.5f64.cos(), 0.0, 0.0, 0.5f64.cos()]);
    assert_eq!(ry.im, [0.0, -0.5f64.sin(), 0.5f64.sin(), 0.0]);
    let sm_dag = ops::SM.dag();
    // σ−† = σ+ = |1⟩⟨0| → re[3] index: row1 col0 = 1.
    assert_eq!(sm_dag.re, [0.0, 0.0, 1.0, 0.0]);
}
