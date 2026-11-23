//! `ep-logic` — kernel event-driven multi-radix logic simulator (WP-3.1).
//!
//! Deterministic digital simulation for Binary (R=2), balanced Ternary (R=3),
//! Quaternary Q4 (R=4) and general Custom-Radix (`R ≥ 2`) logic families:
//!
//! - `(time, seq)`-ordered event queue (1 tick = 1 ps nominal) — the exact
//!   ordering contract of Phase 0 `js/core/events.js`,
//! - radix-parameterized gate algebra (min/max/mod-sum, threshold detectors),
//!   `'Z'` propagation, contention + oscillation detection,
//! - the four Phase 0 verified SKY130A Q4 primitives (`q4_thresh_det`,
//!   `q4_inv`, `q4_mux4`, `q4_half_adder`) and the named ternary cells, with
//!   constants embedded byte-exactly from `data/reference-library/03` + `/08`
//!   and SHA-256-verified through `ep-core` (Law 5: nothing invented),
//! - level maps `L_k = k·VDD/(R−1)`, noise-margin bounds
//!   `NM ≥ VDD/(2·(R−1))` + verified per-level margins, radix economy
//!   `E(R) = R/ln(R)`,
//! - structured event-stream output (`RunResult::events`) for WP-1.6's Logic
//!   Analyzer — the same pop sequence as the oracle.
//!
//! Parity oracle (03_PHYSICS §5 CI table): Phase 0 `js/labs/logic` —
//! **identical truth tables, identical event order**. Golden fixtures in
//! `tests/fixtures/*.json` were produced by the real Phase 0 engine
//! (`tests/generate_fixtures.mjs`); `cargo test` replays them event-for-event.
//!
//! Fail-closed honesty: unconnected inputs read `'Z'` (warning), `'Z'`
//! propagates, bus contention warns (last-write-wins by event order), and
//! oscillation aborts with the oracle's explicit event-storm error.

pub mod characterize;
pub mod components;
pub mod engine;
pub mod packager;
pub mod queue;
pub mod radix;
pub mod truth_table;
pub mod value;

#[cfg(test)]
mod tests;

pub use characterize::{
    characterize_cell_arcs, half_adder_binary_cell, inv1_cell, nand2_cell, noise_margins,
    q4_level_margins_v, run_arc, sweep_vtc, worst_leakage_w, ArcProvenance, ArcRow, ArcRun,
    CellTiming, CharError, CharLevel, CharacterizationConfig, CharacterizedArc, Device,
    OperatingCorner, OutDir, TimingLibrary, TransNetlist, TransientConfig, INV_W_N_UM, INV_W_P_UM,
    L_UM,
};
pub use engine::{
    run_logic, Block, CallbackTag, EventRecord, InputTag, LogicDiagram, PortRef, ProbeRecord,
    RunError, RunOptions, RunResult, RunStats, Wire,
};
pub use queue::{EventPayload, EventQueue};
pub use radix::{radix_economy, radix_economy_log2, Radix, RadixConstants};
pub use truth_table::{truth_table, TruthRow, TruthTable};
pub use value::LogicValue;

#[cfg(test)]
mod sanity {
    use super::*;

    /// The verified reference data behind every constant in this crate must
    /// verify against its sealed manifest (fail-closed, Law 5).
    #[test]
    fn embedded_reference_library_is_sealed() {
        radix::verify_embedded_reference().expect("03 + 08 reference data sealed by MANIFEST.json");
    }
}
