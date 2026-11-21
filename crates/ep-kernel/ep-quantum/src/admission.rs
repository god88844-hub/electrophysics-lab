//! Quantum admission (WP-5.1): every exact-solver construction is gated
//! through the **ep-core** fail-closed admission controller — interactive
//! frames through the 6-qubit cap, offline frames through the kernel arena
//! memory budget (02 §2.3, Law 4). Refusals carry the honest
//! `{ admitted, reason }` payload; nothing is clamped or crashed.

use ep_core::admission::{AdmissionController, AdmissionDecision, AdmissionRequest};

/// Working-set estimate for the exact dense solver: ρ + one Kraus workspace
/// clone + one channel accumulator, each stored as re/im `f64` pairs →
/// `6 · d² · 8` bytes (`d = 2^n`).
///
/// Derived admission ceiling (no invented constants): the ep-core arena
/// budget (512 MB) admits 11 qubits (`6 · 2048² · 8 ≈ 201 MB`) and refuses
/// 12 (`≈ 805 MB`).
pub fn dense_working_set_bytes(n_qubits: usize) -> Option<u64> {
    let d = 1usize.checked_shl(n_qubits as u32)?;
    let cells = d.checked_mul(d)?;
    (u64::try_from(cells).ok()?).checked_mul(6 * 8)
}

/// Offline-path admission: same fail-closed controller, memory budget
/// instead of the interactive qubit cap.
pub fn admit_offline(controller: &AdmissionController, n_qubits: usize) -> AdmissionDecision {
    if n_qubits == 0 {
        return AdmissionDecision {
            admitted: false,
            reason: "quantum offline: nQubits must be ≥ 1".into(),
        };
    }
    let Some(bytes) = dense_working_set_bytes(n_qubits) else {
        return AdmissionDecision {
            admitted: false,
            reason: format!(
                "quantum offline: {n_qubits} qubits exceeds the dense-solver shift ceiling (use the MPS path)"
            ),
        };
    };
    controller.admit(&AdmissionRequest::Arena { bytes })
}

/// Largest n whose dense working set fits the ep-core arena budget.
pub fn offline_max_qubits(controller: &AdmissionController) -> usize {
    (1..)
        .take_while(|n| {
            dense_working_set_bytes(*n)
                .map(|b| {
                    controller
                        .admit(&AdmissionRequest::Arena { bytes: b })
                        .admitted
                })
                .unwrap_or(false)
        })
        .last()
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn interactive_gate_is_ep_core() {
        let c = AdmissionController::new();
        assert!(admit_offline(&c, 1).admitted);
        // The interactive refusal path lives in ep-core itself; the sim
        // constructor surfaces its exact reason (asserted in parity tests).
        let d = c.admit(&AdmissionRequest::QuantumInteractive { n_qubits: 7 });
        assert!(!d.admitted);
        assert!(d.reason.contains("7 qubits > 6"));
    }

    #[test]
    fn offline_arena_budget_derives_the_cap() {
        let c = AdmissionController::new();
        assert!(
            admit_offline(&c, 11).admitted,
            "11 qubits ≈ 201 MB fits the arena"
        );
        let d = admit_offline(&c, 12);
        assert!(!d.admitted, "12 qubits ≈ 805 MB exceeds the 512 MB arena");
        assert!(d.reason.contains("arena cap"), "{}", d.reason);
        assert!(!admit_offline(&c, 0).admitted);
        assert_eq!(offline_max_qubits(&c), 11);
    }
}
