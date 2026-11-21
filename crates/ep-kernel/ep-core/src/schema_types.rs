//! Rust mirrors of the binding JSON Schemas in `docs/master-plan/schemas/`.
//! These are the kernel-side types for the four core contracts. Required
//! fields of the schemas are `required` here; optional fields are Option.

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// solver-frame.schema.json — 60 Hz telemetry frame
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProvenanceBadge {
    #[serde(rename = "SIMULATED_PHYSICS_MODEL")]
    SimulatedPhysicsModel,
    #[serde(rename = "SIMULATED_ARCHITECTURAL_MODEL")]
    SimulatedArchitecturalModel,
    #[serde(rename = "SIMULATED_NOISY_QUANTUM")]
    SimulatedNoisyQuantum,
    #[serde(rename = "SIMULATED_NOISY_MODEL")]
    SimulatedNoisyModel,
    #[serde(rename = "ORACLE_VERIFIED_AGAINST_NGSPICE")]
    OracleVerifiedAgainstNgspice,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlochState {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub purity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitFrame {
    pub id: String,
    #[serde(rename = "nodeVoltages")]
    pub node_voltages: Vec<f64>,
    pub currents: Vec<f64>,
    #[serde(rename = "vgsMax")]
    pub vgs_max: f64,
    #[serde(rename = "vgsMaxNode")]
    pub vgs_max_node: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalFrame {
    #[serde(rename = "gridMaxC")]
    pub grid_max_c: f64,
    pub tiles: std::collections::BTreeMap<String, f64>,
    #[serde(rename = "traceC")]
    pub trace_c: f64,
    #[serde(rename = "junctionC")]
    pub junction_c: f64,
    #[serde(rename = "cryoK")]
    pub cryo_k: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolverFrame {
    pub format: String,
    #[serde(rename = "frameId")]
    pub frame_id: u64,
    #[serde(rename = "tSimS")]
    pub t_sim_s: f64,
    pub live: bool,
    pub circuits: Vec<CircuitFrame>,
    pub thermal: ThermalFrame,
    pub provenance: ProvenanceFrame,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProvenanceFrame {
    pub badge: ProvenanceBadge,
    pub solver: String,
}

impl SolverFrame {
    pub const FORMAT: &'static str = "invention-lab/solver-frame/1";

    pub fn validate(&self) -> Result<(), String> {
        if self.format != Self::FORMAT {
            return Err(format!("unexpected format '{}'", self.format));
        }
        if self.thermal.grid_max_c.is_nan() {
            return Err("gridMaxC is NaN".into());
        }
        for c in &self.circuits {
            if c.node_voltages.iter().any(|v| v.is_nan()) {
                return Err(format!("circuit '{}' has NaN node voltage", c.id));
            }
        }
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// eplab-project.schema.json — desktop project container (WP-1.3 will extend)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectComponent {
    pub id: String,
    pub kind: String,
    #[serde(default)]
    pub params: serde_json::Map<String, serde_json::Value>,
    pub nodes: Vec<String>,
    pub position: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectWire {
    pub from: String,
    pub to: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectWorkspace {
    pub id: String,
    pub components: Vec<ProjectComponent>,
    pub wires: Vec<ProjectWire>,
    pub probes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectIntegrity {
    #[serde(rename = "payloadSHA256")]
    pub payload_sha256: String,
    pub algorithm: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EplabProject {
    pub format: String,
    #[serde(rename = "formatVersion")]
    pub format_version: u32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub name: String,
    pub workspaces: Vec<ProjectWorkspace>,
    pub integrity: ProjectIntegrity,
}

impl EplabProject {
    pub const FORMAT: &'static str = "invention-lab/eplab-project/1";
}

// ---------------------------------------------------------------------------
// custom-ic.schema.json — hierarchical IC package (kernel-side macro-model)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IcPin {
    pub name: String,
    pub direction: String,
    pub radix: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IcTimingArc {
    pub from: String,
    pub to: String,
    #[serde(rename = "delayNs")]
    pub delay_ns: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IcMacroModel {
    #[serde(rename = "timingArcs")]
    pub timing_arcs: Vec<IcTimingArc>,
    #[serde(rename = "dynamicPower")]
    pub dynamic_power: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomIc {
    pub format: String,
    #[serde(rename = "icId")]
    pub ic_id: String,
    pub pins: Vec<IcPin>,
    #[serde(rename = "radixDomain")]
    pub radix_domain: String,
    #[serde(rename = "macroModel")]
    pub macro_model: IcMacroModel,
}

impl CustomIc {
    pub const FORMAT: &'static str = "invention-lab/custom-ic/1";
}

// ---------------------------------------------------------------------------
// experiment-bundle.schema.json — reproducible research export
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExperimentBundle {
    pub format: String,
    pub kind: String,
    pub badge: ProvenanceBadge,
    pub seed: u64,
    #[serde(rename = "initialFidelity")]
    pub initial_fidelity: f64,
    #[serde(rename = "optimizedFidelity")]
    pub optimized_fidelity: f64,
    pub citation: String,
    #[serde(rename = "sha256")]
    pub sha256: String,
}

impl ExperimentBundle {
    pub const FORMAT: &'static str = "invention-lab/breakthrough-bundle/1";
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn solver_frame_round_trips_and_validates() {
        let frame = SolverFrame {
            format: SolverFrame::FORMAT.into(),
            frame_id: 1,
            t_sim_s: 0.5,
            live: true,
            circuits: vec![CircuitFrame {
                id: "bench".into(),
                node_voltages: vec![0.0, 1.8],
                currents: vec![0.0006],
                vgs_max: 1.8,
                vgs_max_node: Some("MP_Q4".into()),
            }],
            thermal: ThermalFrame {
                grid_max_c: 27.0,
                tiles: std::collections::BTreeMap::new(),
                trace_c: 27.0,
                junction_c: 27.0,
                cryo_k: 0.015,
            },
            provenance: ProvenanceFrame {
                badge: ProvenanceBadge::SimulatedPhysicsModel,
                solver: "packages/physics-engine".into(),
            },
        };
        let json = serde_json::to_string(&frame).unwrap();
        let back: SolverFrame = serde_json::from_str(&json).unwrap();
        assert!(back.validate().is_ok());
        // NaN frame must fail validation (fail-closed honesty).
        let mut nan = frame.clone();
        nan.thermal.grid_max_c = f64::NAN;
        assert!(nan.validate().is_err());
    }

    #[test]
    fn experiment_bundle_badges_round_trip() {
        let b = ExperimentBundle {
            format: ExperimentBundle::FORMAT.into(),
            kind: "x-gate".into(),
            badge: ProvenanceBadge::SimulatedNoisyModel,
            seed: 20241119,
            initial_fidelity: 0.946,
            optimized_fidelity: 0.9997,
            citation: "04_quantum_hardware_modalities.json".into(),
            sha256: "a".repeat(64),
        };
        let json = serde_json::to_string(&b).unwrap();
        assert!(json.contains("SIMULATED_NOISY_MODEL"));
        let back: ExperimentBundle = serde_json::from_str(&json).unwrap();
        assert_eq!(back.seed, 20241119);
    }

    #[test]
    fn eplab_project_round_trip() {
        let p = EplabProject {
            format: EplabProject::FORMAT.into(),
            format_version: 1,
            created_at: "2026-01-01T00:00:00Z".into(),
            name: "demo".into(),
            workspaces: vec![ProjectWorkspace {
                id: "silicon".into(),
                components: vec![ProjectComponent {
                    id: "nmos_0".into(),
                    kind: "nmos".into(),
                    params: serde_json::Map::new(),
                    nodes: vec!["gate".into(), "drain".into(), "gnd".into()],
                    position: vec![0.35, 0.0],
                }],
                wires: vec![ProjectWire {
                    from: "vdd".into(),
                    to: "vdd".into(),
                }],
                probes: vec![],
            }],
            integrity: ProjectIntegrity {
                payload_sha256: "a".repeat(64),
                algorithm: "SHA-256".into(),
            },
        };
        let json = serde_json::to_string(&p).unwrap();
        let back: EplabProject = serde_json::from_str(&json).unwrap();
        assert_eq!(back.workspaces[0].components[0].id, "nmos_0");
    }
}
