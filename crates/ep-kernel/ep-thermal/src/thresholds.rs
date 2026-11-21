//! Failure-threshold evaluation (WP-2.3, 03 §1.5) — data-driven from the
//! verified `06_failure_physics_thresholds.json` via
//! [`crate::reference::verified_thresholds`]. Event shapes/severities mirror
//! `packages/physics-engine/src/thresholds.mjs` (the Layer-1 VFX oracle).
//!
//! Trip semantics (exact): temperatures trip at `value ≥ threshold`
//! (trace fusing, FR-4 delamination, Si runaway); `Vgs` and the cryo quench
//! trip **strictly above** the threshold (`Vgs > 1.95 V`, `Q_load > 12 mW`).

use crate::reference::ThresholdTable;
use serde::Serialize;

/// Event severity (ESM parity).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Warn,
    Fault,
}

/// One tripped failure event — exact ESM `evaluateThresholds` shape.
#[derive(Debug, Clone, Serialize)]
pub struct ThresholdEvent {
    #[serde(rename = "type")]
    pub kind: String,
    pub severity: Severity,
    pub value: f64,
    pub threshold: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub node: Option<String>,
    pub equation: String,
    pub note: String,
}

/// Observable snapshot for one evaluation pass (all fields optional — an
/// absent quantity is never evaluated, ESM parity).
#[derive(Debug, Clone, Default)]
pub struct Snapshot<'a> {
    pub vgs_max_v: Option<f64>,
    pub vgs_max_node: Option<&'a str>,
    pub trace_temp_c: Option<f64>,
    pub trace_node: Option<&'a str>,
    pub pcb_temp_c: Option<f64>,
    pub pcb_node: Option<&'a str>,
    pub junction_temp_c: Option<f64>,
    pub junction_node: Option<&'a str>,
    pub drive_load_w: Option<f64>,
}

/// Evaluate a snapshot against the threshold table (ESM parity, including
/// the else-if chain: at most ONE of the three temperature events fires).
pub fn evaluate_thresholds(snapshot: &Snapshot, t: &ThresholdTable) -> Vec<ThresholdEvent> {
    let mut events = Vec::new();
    if let Some(vgs) = snapshot.vgs_max_v {
        if vgs > t.vgs_threshold_v {
            let hard = t.hard_breakdown_v.map(|hb| vgs >= hb).unwrap_or(false);
            events.push(ThresholdEvent {
                kind: "gate_oxide_breakdown".into(),
                severity: Severity::Fault,
                value: vgs,
                threshold: t.vgs_threshold_v,
                node: snapshot.vgs_max_node.map(|s| s.to_string()),
                equation: format!(
                    "E-model TDDB: ln(TTF) = ln(A) − γ·Vgs (γ ≈ {} dec/V)",
                    t.gamma_dec_per_v
                ),
                note: if hard {
                    format!(
                        "Vgs {vgs:.2} V ≥ hard-breakdown {} V — gate oxide destroyed (shorted gate)",
                        t.hard_breakdown_v.expect("checked above")
                    )
                } else {
                    format!(
                        "Vgs {vgs:.2} V exceeded the SKY130 core SOA ceiling {} V — TDDB accelerated; oxide breakdown",
                        t.vgs_threshold_v
                    )
                },
            });
        }
    }
    if let Some(trace) = snapshot.trace_temp_c {
        if trace >= t.cu_melting_c {
            events.push(ThresholdEvent {
                kind: "trace_fusing".into(),
                severity: Severity::Fault,
                value: trace,
                threshold: t.cu_melting_c,
                node: snapshot.trace_node.map(|s| s.to_string()),
                equation: "P = I²·R(T); Onderdonk: I_f = S·√((T_melt − T_amb)/(t·ρ₀·α))".into(),
                note: format!(
                    "Trace reached {trace:.0} °C ≥ Cu melting {} °C — open-circuit fusing",
                    t.cu_melting_c
                ),
            });
            return events; // else-if chain (ESM parity)
        }
        if let Some(pcb) = snapshot.pcb_temp_c {
            if pcb >= t.fr4_delamination_c {
                events.push(ThresholdEvent {
                    kind: "pcb_delamination".into(),
                    severity: Severity::Fault,
                    value: pcb,
                    threshold: t.fr4_delamination_c,
                    node: snapshot.pcb_node.map(|s| s.to_string()),
                    equation: "ρ·cp·∂T/∂t = k·∇²T + q − h·(T − T_amb)".into(),
                    note: format!(
                        "FR-4 reached {pcb:.0} °C ≥ delamination {} °C — board-level thermal fault",
                        t.fr4_delamination_c
                    ),
                });
                return events; // else-if chain (ESM parity)
            }
            if let Some(junction) = snapshot.junction_temp_c {
                if junction >= t.si_thermal_runaway_c {
                    events.push(ThresholdEvent {
                        kind: "si_thermal_runaway".into(),
                        severity: Severity::Warn,
                        value: junction,
                        threshold: t.si_thermal_runaway_c,
                        node: snapshot.junction_node.map(|s| s.to_string()),
                        equation:
                            "I_leak(T) = I₀·exp(−E_g/(2·k_B·T)) — doubles every ≈10 °C above 300 K"
                                .into(),
                        note: format!(
                            "Junction {junction:.0} °C ≥ Si thermal-runaway onset {} °C",
                            t.si_thermal_runaway_c
                        ),
                    });
                    return events; // else-if chain (ESM parity)
                }
            }
        }
    }
    if let Some(load) = snapshot.drive_load_w {
        if load > t.cryo_quench_15mk_w {
            events.push(ThresholdEvent {
                kind: "cryo_quench".into(),
                severity: Severity::Fault,
                value: load,
                threshold: t.cryo_quench_15mk_w,
                node: None,
                equation:
                    "dT/dt = (Q_load − Q_cool(T))/C_th; Q_cool(15 mK) = 12 mW (Bluefors XLD400)"
                        .into(),
                note: format!(
                    "Mixing-chamber load {load} W > cooling capacity {} W — thermal quench",
                    t.cryo_quench_15mk_w
                ),
            });
        }
    }
    events
}
