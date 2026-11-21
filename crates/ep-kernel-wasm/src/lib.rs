//! `ep-kernel-wasm` — wasm-bindgen exports of the WP-1.2 kernel surface.
//!
//! Browser dev preview + Playwright CI exercise the same `ep-core` admission
//! controller and reference verification as the native kernel. Bytes come
//! from the JS host (no filesystem in wasm).

use ep_core::admission::{AdmissionController, AdmissionDecision, AdmissionRequest};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Admission controller handle (JS holds the opaque pointer).
#[wasm_bindgen]
pub struct WasmAdmissionController {
    inner: AdmissionController,
}

impl Default for WasmAdmissionController {
    fn default() -> Self {
        Self {
            inner: AdmissionController::new(),
        }
    }
}

#[wasm_bindgen]
impl WasmAdmissionController {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: AdmissionController::new(),
        }
    }

    /// Admit a request JSON: `{"kind":"quantum_interactive","nQubits":7}` etc.
    /// Returns `{"admitted":bool,"reason":"..."}` — fail-closed, honest.
    pub fn admit(&self, request_json: &str) -> Result<String, JsValue> {
        let req: AdmissionRequest = serde_json::from_str(request_json)
            .map_err(|e| JsValue::from_str(&format!("bad request JSON: {e}")))?;
        let decision: AdmissionDecision = self.inner.admit(&req);
        serde_json::to_string(&decision).map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
    }
}

/// No-op solve smoke (WP-1.2 checklist): proves the wasm boundary is callable
/// and returns a typed frame envelope. Real solving arrives with Phase 2.
#[wasm_bindgen]
pub fn noop_solve(frame_id: u64) -> Result<String, JsValue> {
    let frame = serde_json::json!({
        "format": "invention-lab/solver-frame/1",
        "frameId": frame_id,
        "tSimS": 0.0,
        "live": false,
        "provenance": { "badge": "SIMULATED_PHYSICS_MODEL", "solver": "ep-kernel-wasm noop (WP-1.2)" }
    });
    serde_json::to_string(&frame).map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
}

#[derive(Serialize, Deserialize)]
struct ManifestEntryWire {
    file: String,
    #[serde(rename = "sha256")]
    sha256: String,
    #[serde(rename = "size_bytes")]
    size_bytes: u64,
}

#[derive(Serialize, Deserialize)]
struct ManifestWire {
    files: Vec<ManifestEntryWire>,
}

#[derive(Serialize)]
struct VerifyReport {
    verified: usize,
    total: usize,
    #[serde(rename = "allVerified")]
    all_verified: bool,
    failures: Vec<String>,
}

/// Verify reference-library bytes supplied by the JS host against a manifest.
/// `manifest_json`: MANIFEST.json contents; `file_bytes_json`:
/// `{"<file>": "<base64-free byte array as number[]>"}`.
#[wasm_bindgen]
pub fn verify_reference_library(
    manifest_json: &str,
    file_bytes_json: &str,
) -> Result<String, JsValue> {
    let manifest: ManifestWire = serde_json::from_str(manifest_json)
        .map_err(|e| JsValue::from_str(&format!("bad manifest: {e}")))?;
    let files: std::collections::BTreeMap<String, Vec<u8>> = serde_json::from_str(file_bytes_json)
        .map_err(|e| JsValue::from_str(&format!("bad file bytes: {e}")))?;
    let mut report = VerifyReport {
        verified: 0,
        total: manifest.files.len(),
        all_verified: true,
        failures: vec![],
    };
    for entry in &manifest.files {
        match files.get(&entry.file) {
            Some(bytes) => {
                let n = ep_core::reference::verify_entry(
                    &ep_core::reference::ManifestEntry {
                        file: entry.file.clone(),
                        sha256: entry.sha256.clone(),
                        size_bytes: entry.size_bytes,
                    },
                    bytes,
                );
                match n {
                    Ok(()) => report.verified += 1,
                    Err(e) => {
                        report.all_verified = false;
                        report.failures.push(format!("{e}"));
                    }
                }
            }
            None => {
                report.all_verified = false;
                report.failures.push(format!("{}: missing", entry.file));
            }
        }
    }
    serde_json::to_string(&report).map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn admit_json_refuses_out_of_budget() {
        let c = WasmAdmissionController::new();
        let out = c
            .admit(r#"{ "kind": "quantum_interactive", "nQubits": 9 }"#)
            .unwrap();
        let v: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert_eq!(v["admitted"], serde_json::Value::Bool(false));
        assert!(v["reason"].as_str().unwrap().contains("9 qubits > 6"));
    }

    #[test]
    fn noop_solve_returns_typed_envelope() {
        let out = noop_solve(7).unwrap();
        let v: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert_eq!(v["frameId"], 7);
        assert_eq!(v["format"], "invention-lab/solver-frame/1");
    }

    #[test]
    fn verify_reference_library_reports_failures() {
        let manifest = ManifestWire {
            files: vec![ManifestEntryWire {
                file: "a.json".into(),
                sha256: "2".repeat(64),
                size_bytes: 1,
            }],
        };
        let manifest_json = serde_json::to_string(&manifest).unwrap();
        let out = verify_reference_library(&manifest_json, r#"{ "a.json": [66] }"#).unwrap();
        assert!(out.contains("\"allVerified\":false") || out.contains("\"allVerified\": false"));
    }
}
