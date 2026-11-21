//! `ep-kernel` — native kernel entry (WP-1.2).
//!
//! Re-exports `ep-core` (units, SHA-256-verified reference data, schema
//! mirrors, admission controller) as the single kernel surface. Tauri IPC
//! commands (Phase 1) call into this crate; wasm targets use
//! `crates/ep-kernel-wasm` which wraps the same `ep-core`.

pub use ep_core::admission::{
    AdmissionBudgets, AdmissionController, AdmissionDecision, AdmissionRequest,
};
pub use ep_core::reference::{verify_library_dir, LibraryError};
pub use ep_core::schema_types::{ProvenanceBadge, SolverFrame};
pub use ep_core::{Ampere, Celsius, Kelvin, Ohm, Volt, Watt};

/// Native entry: verify the reference library under `dir` and return the
/// number of verified files (fail-closed on any byte mismatch).
pub fn verify_reference_library(dir: &std::path::Path) -> Result<usize, LibraryError> {
    verify_library_dir(dir)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn kernel_surfaces_admission_and_library() {
        let c = AdmissionController::new();
        let ok = c.admit(&AdmissionRequest::QuantumInteractive { n_qubits: 2 });
        assert!(ok.admitted);
        let d = c.admit(&AdmissionRequest::Mna {
            nodes: 100,
            voltage_sources: 1,
        });
        assert!(!d.admitted);

        // crates/ep-kernel → repo root is two levels up (ep-core is three).
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .ancestors()
            .nth(2)
            .expect("repo root")
            .to_path_buf();
        let n = verify_reference_library(&root.join("data").join("reference-library")).unwrap();
        assert_eq!(n, 8);
    }
}
