//! `ep-core` — units, SHA-256-verified reference data, schema mirrors, and the
//! fail-closed admission controller (WP-1.2).
//!
//! No solver physics lives here (Phase 2+ crates); no UI code; no unsafe.

pub mod admission;
pub mod reference;
pub mod schema_types;
pub mod units;

pub use admission::{
    AdmissionBudgets, AdmissionController, AdmissionDecision, AdmissionRequest, ARENA_MAX_BYTES,
    MNA_MAX_NODES, MNA_MAX_VOLTAGE_SOURCES, QUANTUM_INTERACTIVE_MAX_QUBITS, THERMAL_MAX_COLS,
    THERMAL_MAX_ROWS,
};
pub use reference::{
    parse_reference_data, sha256_hex, verify_entry, verify_library_dir, verify_manifest_bytes,
    Constant, CopperMaterial, FundamentalConstants, LibraryError, Manifest, ManifestEntry,
    ReferenceData,
};
pub use schema_types::{
    BlochState, CircuitFrame, CustomIc, EplabProject, ExperimentBundle, IcMacroModel, IcPin,
    IcTimingArc, ProjectComponent, ProjectIntegrity, ProjectWire, ProjectWorkspace,
    ProvenanceBadge, ProvenanceFrame, SolverFrame, ThermalFrame,
};
pub use units::{Ampere, Celsius, Kelvin, Meter, Ohm, Second, Volt, Watt};
