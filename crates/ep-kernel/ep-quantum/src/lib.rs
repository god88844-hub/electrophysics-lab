//! `ep-quantum` — Lindblad/Kraus density-matrix kernel (WP-5.1).
//!
//! Operator-splitting exact solver for 1–6 interactive qubits (strictly
//! admission-gated through **ep-core**: `n > 6` is refused interactively with
//! an honest reason; the offline path is memory-admitted through the kernel
//! arena budget). Device models — transmon DRAG + ZZ + effective leakage,
//! SOI photonic MZI + dB/cm loss, neutral-atom Rydberg blockade — read every
//! constant from the SHA-256-verified
//! `data/reference-library/04_quantum_hardware_modalities.json` (embedded
//! byte-exactly for wasm; no invented constants).
//!
//! Parity: the ESM engine `packages/quantum-engine/src/lindblad.mjs` is the
//! CI oracle (03_PHYSICS_MATH_FUNDAMENTALS.md §4) — trace/positivity/T1/T2
//! oracles ±0.02 and embedded same-arithmetic parity values are asserted in
//! `tests/parity_oracle.rs`.
//!
//! No unsafe; no I/O; wasm32-compatible.

#![forbid(unsafe_code)]

pub mod admission;
pub mod devices;
pub mod lindblad;

pub use admission::{admit_offline, dense_working_set_bytes, offline_max_qubits};
pub use devices::{
    apply_rydberg_cz_phase, drag_pulse, verify_embedded_reference, DragParams, DragSample,
    ModalityParams, NeutralAtomDevice, PhotonicDevice, Pulse, TransmonDevice,
};
pub use lindblad::ops;
pub use lindblad::{
    average_gate_fidelity, rotation, Axis, DensityMatrix, Drive, InitialState, LindbladSim,
    Mulberry32, NoiseModel, Op2, ZzPair, DENSITY_MATRIX_MAX_QUBITS,
};

#[cfg(test)]
mod tests {
    use super::*;

    /// The embedded 04 JSON verifies byte-exactly against its sealed
    /// MANIFEST.json entry (SHA-256 + size) through ep-core.
    #[test]
    fn embedded_reference_verifies() {
        verify_embedded_reference().expect("embedded 04 JSON must match its manifest seal");
    }

    /// Device parameters load from the verified JSON with exact typical
    /// values (spot grid across all three modalities).
    #[test]
    fn modality_params_read_json_typicals() {
        let p = ModalityParams::from_verified_embedded().expect("verified params");
        assert!((p.transmon.t1_us_typical - 100.0).abs() < 1e-12);
        assert!((p.transmon.t2_us_typical - 150.0).abs() < 1e-12);
        assert!((p.transmon.anharmonicity_alpha_mhz_typical - (-280.0)).abs() < 1e-12);
        assert!((p.transmon.zz_crosstalk_khz_typical - 50.0).abs() < 1e-12);
        assert!((p.transmon.readout_fidelity_typical - 0.98).abs() < 1e-12);
        assert!((p.transmon.gate_1q_duration_ns_typical - 25.0).abs() < 1e-12);
        assert!((p.photonic.waveguide_loss_db_per_cm_typical - 0.5).abs() < 1e-12);
        assert!((p.photonic.mzi_insertion_loss_db_typical - 1.0).abs() < 1e-12);
        assert!((p.photonic.p_pi_mw_typical - 5.0).abs() < 1e-12);
        assert!((p.photonic.thermal_crosstalk_db_typical - (-15.0)).abs() < 1e-12);
        assert!((p.neutral_atom.rydberg_c6_ghz_um6_typical - 500.0).abs() < 1e-12);
        assert!((p.neutral_atom.rydberg_blockade_radius_um_typical - 5.0).abs() < 1e-12);
    }
}
