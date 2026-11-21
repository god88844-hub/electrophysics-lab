//! `ep-circuit` — kernel MNA DC solver (WP-2.1).
//!
//! Stamps: R, V, I sources, symmetric drain/source Shichman–Hodges MOSFET.
//! Newton–Raphson with numeric Jacobian, damped stepping, source stepping
//! (λ ∈ {0.05..1.0}), consistent gmin escalation. Admission is enforced
//! through `ep-core` (≤64 nodes / ≤32 voltage sources, fail-closed) before
//! any allocation. Parity oracle: `packages/physics-engine/src/mna.mjs`.

pub mod mosfet;
pub mod netlist;
pub mod solver;
#[cfg(test)]
mod tests;

pub use mosfet::{mosfet_current, operating_point, MosfetParams, MosfetType, OperatingPoint};
pub use netlist::{Element, ElementKind, Netlist};
pub use solver::{
    kcl_max_residual, solve_dc, solve_dc_default, SolveError, SolveOptions, SolveResult,
};

use ep_core::admission::AdmissionController;
use std::sync::OnceLock;

static ADMISSION: OnceLock<AdmissionController> = OnceLock::new();

/// Process-wide admission controller with the default WP-1.2 budgets.
pub fn admission() -> &'static AdmissionController {
    ADMISSION.get_or_init(AdmissionController::new)
}

/// Convenience: solve against the process-wide default admission controller.
pub fn solve(netlist: &Netlist) -> Result<SolveResult, SolveError> {
    solve_dc(netlist, &SolveOptions::default(), admission())
}
