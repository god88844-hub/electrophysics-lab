//! SHA-256-verified reference-library loading (`data/reference-library/*.json`).
//!
//! The MANIFEST.json pins `sha256` + `size_bytes` per file; loading fails
//! closed on any mismatch. Wasm targets receive the bytes from the host (no
//! filesystem access) through [`verify_manifest_bytes`].

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestEntry {
    pub file: String,
    pub sha256: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub format: String,
    #[serde(rename = "generatedAt")]
    pub generated_at: String,
    pub files: Vec<ManifestEntry>,
}

#[derive(Debug)]
pub struct LibraryError {
    pub file: String,
    pub reason: String,
}

impl std::fmt::Display for LibraryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "reference-library '{}': {}", self.file, self.reason)
    }
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let digest = hasher.finalize();
    let mut hex = String::with_capacity(digest.len() * 2);
    for b in digest {
        hex.push_str(&format!("{b:02x}"));
    }
    hex
}

/// Verify one entry against its exact bytes (size + SHA-256).
pub fn verify_entry(entry: &ManifestEntry, bytes: &[u8]) -> Result<(), LibraryError> {
    if bytes.len() as u64 != entry.size_bytes {
        return Err(LibraryError {
            file: entry.file.clone(),
            reason: format!("size mismatch: {} != {}", bytes.len(), entry.size_bytes),
        });
    }
    let actual = sha256_hex(bytes);
    if actual != entry.sha256 {
        return Err(LibraryError {
            file: entry.file.clone(),
            reason: format!("sha256 mismatch: {actual} != {}", entry.sha256),
        });
    }
    Ok(())
}

/// Verify a whole manifest given a byte-fetcher (works for both native FS and wasm host).
pub fn verify_manifest_bytes(
    manifest_json: &str,
    fetch: &dyn Fn(&str) -> Option<Vec<u8>>,
) -> Result<usize, LibraryError> {
    let manifest: Manifest = serde_json::from_str(manifest_json).map_err(|e| LibraryError {
        file: "MANIFEST.json".into(),
        reason: format!("parse: {e}"),
    })?;
    if manifest.format != "invention-lab/reference-library-manifest/1" {
        return Err(LibraryError {
            file: "MANIFEST.json".into(),
            reason: format!("unexpected manifest format '{}'", manifest.format),
        });
    }
    for entry in &manifest.files {
        let bytes = fetch(&entry.file).ok_or_else(|| LibraryError {
            file: entry.file.clone(),
            reason: "missing from working tree".into(),
        })?;
        verify_entry(entry, &bytes)?;
    }
    Ok(manifest.files.len())
}

/// Native loader: verify every manifest entry under `dir` (exact bytes on disk).
pub fn verify_library_dir(dir: &Path) -> Result<usize, LibraryError> {
    let manifest_path = dir.join("MANIFEST.json");
    let manifest_json = std::fs::read_to_string(&manifest_path).map_err(|e| LibraryError {
        file: "MANIFEST.json".into(),
        reason: format!("read: {e}"),
    })?;
    verify_manifest_bytes(&manifest_json, &|name| std::fs::read(dir.join(name)).ok())
}

// ---------------------------------------------------------------------------
// Typed constant/material accessors (subset mirrored from the JSONs; full
// parity lives with the JSON payloads — schema mirrors in schema_types.rs).
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FundamentalConstants {
    #[serde(rename = "elementary_charge")]
    pub elementary_charge: Constant,
    #[serde(rename = "boltzmann_constant")]
    pub boltzmann_constant: Constant,
    #[serde(rename = "stefan_boltzmann_constant")]
    pub stefan_boltzmann: Constant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Constant {
    #[serde(rename = "symbol")]
    pub symbol: String,
    pub value: f64,
    pub unit: String,
    #[serde(rename = "exact")]
    pub exact: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct CopperMaterial {
    #[serde(rename = "resistivity_ohm_m_at_300K")]
    pub resistivity_ohm_m_at_300k: f64,
    #[serde(rename = "tcr_per_k")]
    pub tcr_per_k: f64,
    #[serde(rename = "thermal_conductivity_w_per_m_k")]
    pub thermal_conductivity_w_per_m_k: f64,
    #[serde(rename = "melting_point_c")]
    pub melting_point_c: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReferenceData {
    pub constants: FundamentalConstants,
    pub copper: CopperMaterial,
}

/// Parse the constants + material tables from the verified 01/02 JSON payloads.
pub fn parse_reference_data(json01: &str, json02: &str) -> Result<ReferenceData, LibraryError> {
    #[derive(Deserialize)]
    struct File01 {
        parameters: FundamentalConstants,
    }
    #[derive(Deserialize)]
    struct MaterialWrap {
        copper: CopperMaterial,
    }
    #[derive(Deserialize)]
    struct File02 {
        #[serde(rename = "material_properties")]
        material_properties: MaterialWrap,
    }
    let c01: File01 = serde_json::from_str(json01).map_err(|e| LibraryError {
        file: "01_fundamental_constants.json".into(),
        reason: format!("parse: {e}"),
    })?;
    let c02: File02 = serde_json::from_str(json02).map_err(|e| LibraryError {
        file: "02_semiconductor_pdk_silicon.json".into(),
        reason: format!("parse: {e}"),
    })?;
    Ok(ReferenceData {
        constants: c01.parameters,
        copper: c02.material_properties.copper,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn repo_root() -> std::path::PathBuf {
        // crates/ep-kernel/ep-core → repo root is three levels up.
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .ancestors()
            .nth(3)
            .expect("repo root")
            .to_path_buf()
    }

    #[test]
    fn manifest_verifies_all_eight_reference_files_on_disk() {
        let n = verify_library_dir(&repo_root().join("data").join("reference-library"))
            .expect("reference library must verify");
        assert_eq!(n, 8, "01–08 reference files all verify byte-exactly");
    }

    #[test]
    fn tampered_payload_is_refused() {
        let manifest = r#"{
            "format": "invention-lab/reference-library-manifest/1",
            "generatedAt": "2026-01-01T00:00:00Z",
            "files": [
                { "file": "tampered.json", "sha256": "1111111111111111111111111111111111111111111111111111111111111111", "size_bytes": 4 }
            ]
        }"#;
        let err = verify_manifest_bytes(manifest, &|name| {
            if name == "tampered.json" {
                Some(b"BBBB".to_vec())
            } else {
                None
            }
        })
        .unwrap_err();
        assert!(err.reason.contains("sha256 mismatch"), "{}", err.reason);
    }

    #[test]
    fn constants_and_copper_parse_from_verified_payloads() {
        let root = repo_root();
        let j01 = std::fs::read_to_string(
            root.join("data/reference-library/01_fundamental_constants.json"),
        )
        .unwrap();
        let j02 = std::fs::read_to_string(
            root.join("data/reference-library/02_semiconductor_pdk_silicon.json"),
        )
        .unwrap();
        let data = parse_reference_data(&j01, &j02).expect("parse");
        // CODATA 2022 exact values (01 JSON): q_e = 1.602176634e-19 C (exact), k_B = 1.380649e-23 J/K (exact).
        let close = |a: f64, b: f64| (a - b).abs() <= 1e-15 * b.abs().max(1e-300);
        assert!(
            close(data.constants.elementary_charge.value, 1.602176634e-19),
            "q_e = {}",
            data.constants.elementary_charge.value
        );
        assert!(data.constants.elementary_charge.exact);
        assert!(
            close(data.constants.boltzmann_constant.value, 1.380649e-23),
            "k_B = {}",
            data.constants.boltzmann_constant.value
        );
        // Cu: resistivity 1.68e-8 Ω·m, TCR 0.0039/K, melt 1085 °C (02 JSON).
        assert!((data.copper.resistivity_ohm_m_at_300k - 1.68e-8).abs() < 1e-20);
        assert!((data.copper.tcr_per_k - 0.0039).abs() < 1e-9);
        assert!((data.copper.melting_point_c - 1085.0).abs() < 1e-9);
    }
}
