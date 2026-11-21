//! Forensic ring buffer + autopsy payload builder (WP-2.3).
//!
//! Mirrors `packages/physics-engine/src/forensics.mjs`: a fixed-capacity
//! sample ring (`{t, vdd, vgsMax, iMax, tempMaxC, nodes, currents, temps}`)
//! and the `invention-lab/forensic-autopsy/1` report builder with peaks over
//! the recorded window, the oscilloscope view, and the threshold provenance.
//! All numbers flow from the solver + the verified 06 JSON — nothing invented.

use crate::thresholds::ThresholdEvent;
use serde::Serialize;
use std::collections::VecDeque;

/// One recorded sample of the solver/physics telemetry.
#[derive(Debug, Clone, Serialize)]
pub struct SampleRecord {
    /// Simulation time (s).
    pub t: f64,
    pub vdd: f64,
    #[serde(rename = "vgsMax")]
    pub vgs_max: f64,
    #[serde(rename = "iMax")]
    pub i_max: f64,
    #[serde(rename = "tempMaxC")]
    pub temp_max_c: f64,
    /// Named node voltages (e.g. `vout_q4`, `vout_bin`).
    pub nodes: std::collections::BTreeMap<String, f64>,
    /// Named branch currents (e.g. `VDD`).
    pub currents: std::collections::BTreeMap<String, f64>,
    /// Named temperatures in °C (e.g. `traceC`, `pcbC`).
    pub temps: std::collections::BTreeMap<String, f64>,
}

/// Fixed-capacity forensic ring buffer (oldest samples evicted first).
#[derive(Debug, Clone)]
pub struct ForensicRingBuffer {
    capacity: usize,
    buffer: VecDeque<SampleRecord>,
}

impl ForensicRingBuffer {
    pub fn new(capacity: usize) -> Self {
        Self {
            capacity: capacity.max(1),
            buffer: VecDeque::new(),
        }
    }

    /// Push a sample; evicts the oldest when at capacity.
    pub fn push(&mut self, sample: SampleRecord) {
        if self.buffer.len() == self.capacity {
            self.buffer.pop_front();
        }
        self.buffer.push_back(sample);
    }

    /// Number of recorded samples (≤ capacity).
    pub fn len(&self) -> usize {
        self.buffer.len()
    }

    pub fn is_empty(&self) -> bool {
        self.buffer.is_empty()
    }

    /// The full window in chronological order.
    pub fn window(&self) -> Vec<SampleRecord> {
        self.buffer.iter().cloned().collect()
    }

    /// The last `n` samples (chronological), or the whole buffer if fewer.
    pub fn last(&self, n: usize) -> Vec<SampleRecord> {
        let n = n.min(self.buffer.len());
        self.buffer
            .iter()
            .skip(self.buffer.len() - n)
            .cloned()
            .collect()
    }

    pub fn clear(&mut self) {
        self.buffer.clear();
    }
}

/// Report metadata (host-supplied; the kernel is deterministic — no clock).
#[derive(Debug, Clone, Default, Serialize)]
pub struct ForensicMeta {
    #[serde(rename = "simTimeS")]
    pub sim_time_s: f64,
    #[serde(rename = "playbackScale", skip_serializing_if = "Option::is_none")]
    pub playback_scale: Option<f64>,
    #[serde(rename = "gitSha", skip_serializing_if = "Option::is_none")]
    pub git_sha: Option<String>,
    #[serde(rename = "datasetSha256", skip_serializing_if = "Option::is_none")]
    pub dataset_sha256: Option<String>,
    #[serde(rename = "generatedAt", skip_serializing_if = "Option::is_none")]
    pub generated_at: Option<String>,
}

/// Peaks over the recorded window.
#[derive(Debug, Clone, Serialize)]
pub struct AutopsyPeaks {
    #[serde(rename = "vddV")]
    pub vdd_v: Option<f64>,
    #[serde(rename = "vgsV")]
    pub vgs_v: Option<f64>,
    #[serde(rename = "currentA")]
    pub current_a: Option<f64>,
    #[serde(rename = "tempC")]
    pub temp_c: Option<f64>,
}

/// One oscilloscope view row (ESM key mapping).
#[derive(Debug, Clone, Serialize)]
pub struct AutopsyScopeRow {
    pub t: f64,
    pub vdd: f64,
    #[serde(rename = "vout_q4", skip_serializing_if = "Option::is_none")]
    pub vout_q4: Option<f64>,
    #[serde(rename = "vout_bin", skip_serializing_if = "Option::is_none")]
    pub vout_bin: Option<f64>,
    #[serde(rename = "i_vdd", skip_serializing_if = "Option::is_none")]
    pub i_vdd: Option<f64>,
    #[serde(rename = "trace_c", skip_serializing_if = "Option::is_none")]
    pub trace_c: Option<f64>,
    #[serde(rename = "pcb_c", skip_serializing_if = "Option::is_none")]
    pub pcb_c: Option<f64>,
}

/// `invention-lab/forensic-autopsy/1` — structured, JSON-serialisable report.
#[derive(Debug, Clone, Serialize)]
pub struct ForensicReport {
    pub format: &'static str,
    pub generated_at: String,
    pub failure: AutopsyFailure,
    pub peaks: AutopsyPeaks,
    pub oscilloscope: Vec<AutopsyScopeRow>,
    #[serde(rename = "thresholdsUsed")]
    pub thresholds_used: serde_json::Value,
    pub meta: ForensicMeta,
}

/// The failure block (exact ESM field set).
#[derive(Debug, Clone, Serialize)]
pub struct AutopsyFailure {
    #[serde(rename = "type")]
    pub kind: String,
    pub severity: String,
    pub value: f64,
    pub threshold: f64,
    pub node: Option<String>,
    #[serde(rename = "governingEquation")]
    pub governing_equation: String,
    pub note: String,
}

/// Build the forensic autopsy report from a tripped event + the ring-buffer
/// window + the verified threshold table (serialized as provenance).
pub fn build_autopsy(
    event: &ThresholdEvent,
    samples: &[SampleRecord],
    thresholds_used: &serde_json::Value,
    meta: ForensicMeta,
) -> ForensicReport {
    let peak_of = |pick: &dyn Fn(&SampleRecord) -> f64| -> Option<f64> {
        if samples.is_empty() {
            None
        } else {
            Some(samples.iter().map(pick).fold(f64::MIN, f64::max))
        }
    };
    let peaks = AutopsyPeaks {
        vdd_v: peak_of(&|s| s.vdd),
        vgs_v: peak_of(&|s| s.vgs_max),
        current_a: peak_of(&|s| s.i_max),
        temp_c: peak_of(&|s| s.temp_max_c),
    };
    let oscilloscope = samples
        .iter()
        .map(|s| AutopsyScopeRow {
            t: (s.t * 1e6).round() / 1e6,
            vdd: s.vdd,
            vout_q4: s.nodes.get("vout_q4").copied(),
            vout_bin: s.nodes.get("vout_bin").copied(),
            i_vdd: s.currents.get("VDD").copied(),
            trace_c: s.temps.get("traceC").copied(),
            pcb_c: s.temps.get("pcbC").copied(),
        })
        .collect();
    ForensicReport {
        format: "invention-lab/forensic-autopsy/1",
        generated_at: meta
            .generated_at
            .clone()
            .unwrap_or_else(|| "kernel-deterministic".into()),
        failure: AutopsyFailure {
            kind: event.kind.clone(),
            severity: match event.severity {
                crate::thresholds::Severity::Warn => "warn".into(),
                crate::thresholds::Severity::Fault => "fault".into(),
            },
            value: event.value,
            threshold: event.threshold,
            node: event.node.clone(),
            governing_equation: event.equation.clone(),
            note: event.note.clone(),
        },
        peaks,
        oscilloscope,
        thresholds_used: thresholds_used.clone(),
        meta,
    }
}
