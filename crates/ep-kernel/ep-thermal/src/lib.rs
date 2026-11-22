//! `ep-thermal` — implicit-stable Fourier heat PDE kernel (WP-2.3).
//!
//! Replaces the M5-era explicit FTCS solver (whose `Δt ≤ dx²/(4α)` bound
//! caused blowups at coarse timesteps) with unconditionally stable implicit
//! schemes per `docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md` §1.4:
//!
//! `ρ·c_p·∂T/∂t = ∇·(k∇T) + J²ρ_elec(T) − h·(T − T_amb)`
//!
//! - **Backward Euler**: `(I + Δt·A)·T_new = T_old + Δt·f` solved by cached
//!   banded LU triangular factorization (A in positive-decay form; see
//!   `pde`). Any grid shape admitted by ep-core.
//! - **Crank–Nicolson**: Douglas–Gunn ADI — per-direction tridiagonal
//!   (Thomas) triangular solves, second-order in time, for ≤ 64² grids per
//!   the spec's "cheap tridiagonal" guidance.
//!
//! Both schemes are unconditionally stable (no NaN after 200+ steps at any
//! Δt) and, with insulated edges and `h = 0`, conserve ΣT exactly (Kraus-like
//! conservative flux discretization — residual < 1e-9 asserted).
//!
//! Material constants and failure thresholds are embedded byte-exactly from
//! `data/reference-library/02_semiconductor_pdk_silicon.json` and
//! `06_failure_physics_thresholds.json`, SHA-256-verified through ep-core
//! (`verify_entry`) — nothing invented. Temperature-dependent Cu resistivity
//! `ρ(T) = ρ₀·(1 + α(T − T₀))`, Planck blackbody RGB stops (300–2500 K),
//! failure-threshold detectors (SKY130 `Vgs > 1.95 V` oxide arc, FR-4
//! `260 °C` delamination, Cu `1085 °C` melt, Si `200 °C` runaway, cryo quench
//! `Q_load > 12 mW`), and the forensic ring buffer + autopsy payload builder
//! (`invention-lab/forensic-autopsy/1`) complete the Layer-1 kernel surface.
//!
//! No unsafe; no I/O; wasm32-compatible.

#![forbid(unsafe_code)]

pub mod blackbody;
pub mod cryo;
pub mod forensics;
pub mod pde;
pub mod reference;
pub mod thresholds;

use ep_core::admission::AdmissionController;
use std::sync::OnceLock;

static ADMISSION: OnceLock<AdmissionController> = OnceLock::new();

/// Process-wide admission controller with the default WP-1.2 budgets
/// (ep-circuit convention).
pub fn admission() -> &'static AdmissionController {
    ADMISSION.get_or_init(AdmissionController::new)
}

pub use blackbody::{blackbody_rgb, BlackbodyRamp};
pub use forensics::{
    build_autopsy, ForensicMeta, ForensicReport, ForensicRingBuffer, SampleRecord,
};
pub use pde::{
    admit_grid_2d, admit_grid_3d, BoundaryMode, Scheme, ThermalGrid2D, ThermalGrid3D,
    MAX_THERMAL_CELLS,
};
pub use reference::{
    verified_materials, verified_thresholds, verified_thresholds_and_ramp, CopperElectro,
    MaterialProps, MaterialSet, ThresholdTable,
};
pub use thresholds::{evaluate_thresholds, Severity, Snapshot, ThresholdEvent};
