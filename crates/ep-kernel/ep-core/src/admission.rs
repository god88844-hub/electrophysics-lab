//! Fail-closed admission controller (docs/master-plan/02 §2.3, Law 4).
//!
//! Workloads outside budget are REFUSED with an honest machine-readable
//! reason — never silently clamped, never crashed. Every budget is a hard
//! constant here; the controller is the single admission authority.

use serde::{Deserialize, Serialize};

pub const QUANTUM_INTERACTIVE_MAX_QUBITS: usize = 6;
pub const MNA_MAX_NODES: usize = 64;
pub const MNA_MAX_VOLTAGE_SOURCES: usize = 32;
pub const THERMAL_MAX_COLS: usize = 128;
pub const THERMAL_MAX_ROWS: usize = 128;
pub const ARENA_MAX_BYTES: u64 = 512 * 1024 * 1024; // 512 MB (Law 4: app ≤ 2 GB)

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdmissionBudgets {
    #[serde(rename = "quantumInteractiveMaxQubits")]
    pub quantum_interactive_max_qubits: usize,
    #[serde(rename = "mnaMaxNodes")]
    pub mna_max_nodes: usize,
    #[serde(rename = "mnaMaxVoltageSources")]
    pub mna_max_voltage_sources: usize,
    #[serde(rename = "thermalMaxCols")]
    pub thermal_max_cols: usize,
    #[serde(rename = "thermalMaxRows")]
    pub thermal_max_rows: usize,
    #[serde(rename = "arenaMaxBytes")]
    pub arena_max_bytes: u64,
}

impl Default for AdmissionBudgets {
    fn default() -> Self {
        Self {
            quantum_interactive_max_qubits: QUANTUM_INTERACTIVE_MAX_QUBITS,
            mna_max_nodes: MNA_MAX_NODES,
            mna_max_voltage_sources: MNA_MAX_VOLTAGE_SOURCES,
            thermal_max_cols: THERMAL_MAX_COLS,
            thermal_max_rows: THERMAL_MAX_ROWS,
            arena_max_bytes: ARENA_MAX_BYTES,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum AdmissionRequest {
    /// Interactive density-matrix simulation.
    #[serde(rename = "quantum_interactive")]
    QuantumInteractive {
        #[serde(rename = "nQubits")]
        n_qubits: usize,
    },
    /// MNA DC/transient solve.
    #[serde(rename = "mna")]
    Mna {
        nodes: usize,
        #[serde(rename = "voltageSources")]
        voltage_sources: usize,
    },
    /// 2D/3D Fourier thermal grid.
    #[serde(rename = "thermal_grid")]
    ThermalGrid { cols: usize, rows: usize },
    /// Kernel arena allocation.
    #[serde(rename = "arena")]
    Arena { bytes: u64 },
}

/// Honest machine-readable admission decision — exactly the shape surfaced to
/// the UI/status surfaces: `{ "admitted": bool, "reason": "..." }`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AdmissionDecision {
    pub admitted: bool,
    pub reason: String,
}

impl AdmissionDecision {
    fn ok() -> Self {
        Self {
            admitted: true,
            reason: "within budget".into(),
        }
    }
    fn refuse(reason: String) -> Self {
        Self {
            admitted: false,
            reason,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct AdmissionController {
    pub budgets: AdmissionBudgets,
}

impl AdmissionController {
    pub fn new() -> Self {
        Self::default()
    }

    /// Fail-closed admission: any out-of-budget request is refused with a
    /// specific, user-displayable reason.
    pub fn admit(&self, request: &AdmissionRequest) -> AdmissionDecision {
        match request {
            AdmissionRequest::QuantumInteractive { n_qubits } => {
                if *n_qubits == 0 {
                    return AdmissionDecision::refuse(
                        "quantum interactive: nQubits must be ≥ 1".into(),
                    );
                }
                if *n_qubits > self.budgets.quantum_interactive_max_qubits {
                    return AdmissionDecision::refuse(format!(
                        "quantum interactive cap: {} qubits > {} (use the MPS offline path for larger frames)",
                        n_qubits, self.budgets.quantum_interactive_max_qubits
                    ));
                }
                AdmissionDecision::ok()
            }
            AdmissionRequest::Mna {
                nodes,
                voltage_sources,
            } => {
                if *nodes == 0 {
                    return AdmissionDecision::refuse(
                        "MNA: at least one non-ground node required".into(),
                    );
                }
                if *nodes > self.budgets.mna_max_nodes {
                    return AdmissionDecision::refuse(format!(
                        "MNA node cap: {} nodes > {} (split the netlist or raise the budget explicitly)",
                        nodes, self.budgets.mna_max_nodes
                    ));
                }
                if *voltage_sources > self.budgets.mna_max_voltage_sources {
                    return AdmissionDecision::refuse(format!(
                        "MNA voltage-source cap: {} sources > {}",
                        voltage_sources, self.budgets.mna_max_voltage_sources
                    ));
                }
                AdmissionDecision::ok()
            }
            AdmissionRequest::ThermalGrid { cols, rows } => {
                if *cols == 0 || *rows == 0 {
                    return AdmissionDecision::refuse(
                        "thermal grid: cols and rows must be ≥ 1".into(),
                    );
                }
                if *cols > self.budgets.thermal_max_cols || *rows > self.budgets.thermal_max_rows {
                    return AdmissionDecision::refuse(format!(
                        "thermal grid cap: {}×{} > {}×{} (coarsen the mesh or run the offline batch path)",
                        cols, rows, self.budgets.thermal_max_cols, self.budgets.thermal_max_rows
                    ));
                }
                AdmissionDecision::ok()
            }
            AdmissionRequest::Arena { bytes } => {
                if *bytes == 0 {
                    return AdmissionDecision::refuse("arena: allocation must be > 0 bytes".into());
                }
                if *bytes > self.budgets.arena_max_bytes {
                    return AdmissionDecision::refuse(format!(
                        "arena cap: {} bytes > {} bytes (app RAM budget ≤ 2 GB, Law 4)",
                        bytes, self.budgets.arena_max_bytes
                    ));
                }
                AdmissionDecision::ok()
            }
        }
    }

    /// JSON shape: `{ "admitted": false, "reason": "..." }` — the exact
    /// machine-readable refusal contract surfaced to the UI.
    pub fn admit_json(&self, request: &AdmissionRequest) -> String {
        serde_json::to_string(&self.admit(request)).expect("AdmissionDecision serializes")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn quantum_interactive_cap_is_six_qubits() {
        let c = AdmissionController::new();
        assert!(
            c.admit(&AdmissionRequest::QuantumInteractive { n_qubits: 6 })
                .admitted
        );
        let d = c.admit(&AdmissionRequest::QuantumInteractive { n_qubits: 7 });
        assert!(!d.admitted);
        assert!(d.reason.contains("7 qubits > 6"), "{}", d.reason);
        assert!(d.reason.to_lowercase().contains("mps offline path"));
    }

    #[test]
    fn quantum_zero_qubits_refused() {
        let c = AdmissionController::new();
        assert!(
            !c.admit(&AdmissionRequest::QuantumInteractive { n_qubits: 0 })
                .admitted
        );
    }

    #[test]
    fn mna_node_and_source_caps_refuse_closed() {
        let c = AdmissionController::new();
        assert!(
            c.admit(&AdmissionRequest::Mna {
                nodes: 64,
                voltage_sources: 32
            })
            .admitted
        );
        let d1 = c.admit(&AdmissionRequest::Mna {
            nodes: 65,
            voltage_sources: 1,
        });
        assert!(
            !d1.admitted && d1.reason.contains("65 nodes > 64"),
            "{}",
            d1.reason
        );
        let d2 = c.admit(&AdmissionRequest::Mna {
            nodes: 2,
            voltage_sources: 33,
        });
        assert!(
            !d2.admitted && d2.reason.contains("33 sources > 32"),
            "{}",
            d2.reason
        );
        let d3 = c.admit(&AdmissionRequest::Mna {
            nodes: 0,
            voltage_sources: 0,
        });
        assert!(!d3.admitted && d3.reason.contains("at least one non-ground node"));
    }

    #[test]
    fn thermal_grid_cap_refuses_129_and_accepts_128() {
        let c = AdmissionController::new();
        assert!(
            c.admit(&AdmissionRequest::ThermalGrid {
                cols: 128,
                rows: 128
            })
            .admitted
        );
        let d = c.admit(&AdmissionRequest::ThermalGrid {
            cols: 129,
            rows: 128,
        });
        assert!(
            !d.admitted && d.reason.contains("129×128 > 128×128"),
            "{}",
            d.reason
        );
        let d2 = c.admit(&AdmissionRequest::ThermalGrid { cols: 0, rows: 10 });
        assert!(!d2.admitted && d2.reason.contains("must be ≥ 1"));
    }

    #[test]
    fn arena_cap_refuses_above_512mb() {
        let c = AdmissionController::new();
        assert!(
            c.admit(&AdmissionRequest::Arena {
                bytes: 512 * 1024 * 1024
            })
            .admitted
        );
        let d = c.admit(&AdmissionRequest::Arena {
            bytes: 512 * 1024 * 1024 + 1,
        });
        assert!(
            !d.admitted && d.reason.contains("arena cap"),
            "{}",
            d.reason
        );
        assert!(!c.admit(&AdmissionRequest::Arena { bytes: 0 }).admitted);
    }

    #[test]
    fn refusal_json_shape_is_exact() {
        let c = AdmissionController::new();
        let json = c.admit_json(&AdmissionRequest::QuantumInteractive { n_qubits: 9 });
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(v["admitted"], serde_json::Value::Bool(false));
        assert!(v["reason"].as_str().unwrap().contains("9 qubits > 6"));
        // Exact contract keys only.
        let obj = v.as_object().unwrap();
        assert_eq!(obj.len(), 2);
        assert!(obj.contains_key("admitted") && obj.contains_key("reason"));
    }
}
