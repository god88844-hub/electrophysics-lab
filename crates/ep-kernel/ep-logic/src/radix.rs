//! Multi-radix math (03_PHYSICS_MATH_FUNDAMENTALS §2) over the verified
//! reference data (Law 5: every constant traced to `data/reference-library/03`
//! and `/08`, embedded byte-exactly and SHA-256-verified through `ep-core`).
//!
//! - Level map `L_k = k·VDD/(R−1)`, `k = 0..R−1`, `VDD = 1.8 V`
//!   (03 JSON: binary {0, 1.8}, ternary {0, 0.9, 1.8}, quaternary {0, 0.6, 1.2, 1.8}).
//! - Noise-margin bound `NM ≥ VDD/(2·(R−1))`; verified Phase 0 per-level
//!   margins from 03 JSON: binary 0.6 V, balanced-ternary 0.45 V, Q4 0.3 V.
//! - Radix economy `E(R) = R/ln(R)`, minimum at `R = e ≈ 2.718`
//!   (08 JSON alternative digit-count form `R/log₂(R)` also provided).
//! - Threshold detection: nearest partition digit via the 03 JSON nominal
//!   midpoints (binary {0.9}, ternary {0.45, 1.35}, Q4 {0.3, 0.9, 1.5}) —
//!   the digital-domain transfer of the verified `q4_thresh_det` cell.
//! - Radix economy and cell gate counts come from 08 JSON (q4_cells 6/6/8/8).

use ep_core::reference::{verify_entry, LibraryError};
use serde::{Deserialize, Serialize};

/// Byte-exact embedded reference data (wasm-safe: no filesystem access).
pub mod embedded {
    /// `data/reference-library/03_multiradix_logic_baselines.json` verbatim.
    pub const MULTIRADIX_JSON: &str = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../data/reference-library/03_multiradix_logic_baselines.json"
    ));
    /// `data/reference-library/08_standard_and_multiradix_cells.json` verbatim.
    pub const CELLS_JSON: &str = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../data/reference-library/08_standard_and_multiradix_cells.json"
    ));
    /// `data/reference-library/MANIFEST.json` verbatim (seals the above).
    pub const MANIFEST_JSON: &str = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../data/reference-library/MANIFEST.json"
    ));
}

/// Fail-closed verification of the embedded 03 + 08 JSONs against their
/// sealed MANIFEST.json entries (SHA-256 + size, ep-core `verify_entry`).
pub fn verify_embedded_reference() -> Result<(), LibraryError> {
    let manifest: ep_core::reference::Manifest = serde_json::from_str(embedded::MANIFEST_JSON)
        .map_err(|e| LibraryError {
            file: "MANIFEST.json".into(),
            reason: format!("parse: {e}"),
        })?;
    for (file, bytes) in [
        (
            "03_multiradix_logic_baselines.json",
            embedded::MULTIRADIX_JSON.as_bytes(),
        ),
        (
            "08_standard_and_multiradix_cells.json",
            embedded::CELLS_JSON.as_bytes(),
        ),
    ] {
        let entry = manifest
            .files
            .iter()
            .find(|e| e.file == file)
            .ok_or_else(|| LibraryError {
                file: "MANIFEST.json".into(),
                reason: format!("{file} not sealed"),
            })?;
        verify_entry(entry, bytes)?;
    }
    Ok(())
}

// ---- verified payload shapes (fail-closed: missing paths are errors) ------

#[derive(Deserialize)]
struct FamilyLevels {
    #[serde(rename = "voltage_levels_v")]
    voltage_levels_v: Vec<f64>,
    #[serde(rename = "nominal_midpoints_v", default)]
    nominal_midpoints_v: Vec<f64>,
    #[serde(rename = "noise_margin_per_level_v", default)]
    noise_margin_per_level_v: Option<f64>,
    #[serde(rename = "noise_margin_low_v", default)]
    noise_margin_low_v: Option<f64>,
}

/// Root shape of `03_multiradix_logic_baselines.json` (parameters wrapper).
#[derive(Deserialize)]
struct File03 {
    parameters: MultiradixParams,
}

/// Root shape of `08_standard_and_multiradix_cells.json` (parameters wrapper).
#[derive(Deserialize)]
struct File08 {
    parameters: CellsParams,
}

#[derive(Deserialize)]
struct MultiradixParams {
    #[serde(rename = "binary_radix2_1p8v")]
    binary: FamilyLevels,
    #[serde(rename = "ternary_balanced_1p8v")]
    ternary: FamilyLevels,
    #[serde(rename = "quaternary_q4_1p8v_ldo")]
    quaternary: FamilyLevels,
}

/// Verified Q4 cell macro-spec (08 JSON ).
#[derive(Debug, Clone, Deserialize)]
pub struct Q4CellSpec {
    /// Documented function (e.g. "Q_out = 3 − Q_in (mod-4 inversion)").
    pub function: String,
    /// Verified gate count (6/6/8/8).
    pub gates: u32,
}

#[derive(Deserialize)]
struct CellsParams {
    #[serde(rename = "multiradix_cells")]
    multiradix_cells: MultiradixCells,
}

#[derive(Deserialize)]
struct MultiradixCells {
    #[serde(rename = "radix_r_level_map")]
    level_map: RadixLevelMap,
    #[serde(rename = "q4_cells")]
    q4_cells: std::collections::BTreeMap<String, Q4CellSpec>,
    #[serde(rename = "radix_economy")]
    radix_economy: RadixEconomySpec,
}

#[derive(Deserialize)]
struct RadixLevelMap {
    equation: String,
    #[serde(rename = "binary_r2_v")]
    binary_r2_v: Vec<f64>,
    #[serde(rename = "ternary_r3_v")]
    ternary_r3_v: Vec<f64>,
    #[serde(rename = "quaternary_r4_v")]
    quaternary_r4_v: Vec<f64>,
}

#[derive(Deserialize)]
struct RadixEconomySpec {
    equation: String,
    #[serde(rename = "minimum_at")]
    minimum_at: String,
}

/// Verified multi-radix constants (03 + 08 JSON), parsed fail-closed.
#[derive(Debug, Clone)]
pub struct RadixConstants {
    /// Nominal rail voltage (last level of every verified family = 1.8 V).
    pub vdd_v: f64,
    /// Per-family verified level maps from 03 JSON.
    pub binary_levels_v: Vec<f64>,
    pub ternary_levels_v: Vec<f64>,
    pub quaternary_levels_v: Vec<f64>,
    /// Verified per-level noise margins (03 JSON): binary 0.6, ternary 0.45, Q4 0.3.
    pub binary_nm_v: f64,
    pub ternary_nm_v: f64,
    pub quaternary_nm_v: f64,
    /// Nominal decision midpoints (03 JSON): binary {0.9}, ternary {0.45, 1.35}, Q4 {0.3, 0.9, 1.5}.
    pub binary_midpoints_v: Vec<f64>,
    pub ternary_midpoints_v: Vec<f64>,
    pub quaternary_midpoints_v: Vec<f64>,
    /// Verified Q4 cells (08 JSON): name → {function, gates} —
    /// thresh_det 6, inv 6, mux4 8, half_adder 8 gates.
    pub q4_cells: std::collections::BTreeMap<String, Q4CellSpec>,
    /// Radix economy equation + minimum note (08 JSON provenance strings).
    pub radix_economy_equation: String,
    pub radix_economy_minimum_at: String,
    /// Cross-family level-map equation (08 JSON).
    pub level_map_equation: String,
}

impl RadixConstants {
    /// Parse + fail-closed verify the embedded payloads.
    pub fn embedded() -> Result<Self, LibraryError> {
        verify_embedded_reference()?;
        let m03: File03 =
            serde_json::from_str(embedded::MULTIRADIX_JSON).map_err(|e| LibraryError {
                file: "03_multiradix_logic_baselines.json".into(),
                reason: format!("parse: {e}"),
            })?;
        let m08: File08 = serde_json::from_str(embedded::CELLS_JSON).map_err(|e| LibraryError {
            file: "08_standard_and_multiradix_cells.json".into(),
            reason: format!("parse: {e}"),
        })?;

        let p03 = &m03.parameters;
        let families = [&p03.binary, &p03.ternary, &p03.quaternary];
        let vdd = families
            .iter()
            .map(|f| {
                f.voltage_levels_v
                    .last()
                    .copied()
                    .ok_or_else(|| LibraryError {
                        file: "03_multiradix_logic_baselines.json".into(),
                        reason: "family level map empty".into(),
                    })
            })
            .collect::<Result<Vec<_>, _>>()?;
        if vdd.iter().any(|v| (*v - 1.8).abs() > 1e-12) {
            return Err(LibraryError {
                file: "03_multiradix_logic_baselines.json".into(),
                reason: "rail must be 1.8 V".into(),
            });
        }
        // The verified maps must satisfy L_k = k·VDD/(R−1) exactly.
        for (levels, r) in [
            (&p03.binary.voltage_levels_v, 2u32),
            (&p03.ternary.voltage_levels_v, 3),
            (&p03.quaternary.voltage_levels_v, 4),
        ] {
            for (k, lv) in levels.iter().enumerate() {
                let expect = k as f64 * 1.8 / f64::from(r - 1);
                if (lv - expect).abs() > 1e-12 {
                    return Err(LibraryError {
                        file: "03_multiradix_logic_baselines.json".into(),
                        reason: format!("level map violates L_k = k·VDD/(R−1) at R={r}, k={k}"),
                    });
                }
            }
        }
        // 08's cross-family level map must agree with 03's.
        let lm = &m08.parameters.multiradix_cells.level_map;
        for (a, b) in [
            (&lm.binary_r2_v, &p03.binary.voltage_levels_v),
            (&lm.ternary_r3_v, &p03.ternary.voltage_levels_v),
            (&lm.quaternary_r4_v, &p03.quaternary.voltage_levels_v),
        ] {
            if a.len() != b.len() || a.iter().zip(b.iter()).any(|(x, y)| (x - y).abs() > 1e-12) {
                return Err(LibraryError {
                    file: "08_standard_and_multiradix_cells.json".into(),
                    reason: "level map disagrees with 03 JSON".into(),
                });
            }
        }
        let nm = |f: &FamilyLevels| {
            f.noise_margin_per_level_v
                .or(f.noise_margin_low_v)
                .ok_or_else(|| LibraryError {
                    file: "03_multiradix_logic_baselines.json".into(),
                    reason: "verified noise margin missing".into(),
                })
        };
        let mut q4_cells = std::collections::BTreeMap::new();
        for (name, cell) in &m08.parameters.multiradix_cells.q4_cells {
            q4_cells.insert(
                name.clone(),
                Q4CellSpec {
                    function: cell.function.clone(),
                    gates: cell.gates,
                },
            );
        }

        Ok(Self {
            vdd_v: 1.8,
            binary_levels_v: p03.binary.voltage_levels_v.clone(),
            ternary_levels_v: p03.ternary.voltage_levels_v.clone(),
            quaternary_levels_v: p03.quaternary.voltage_levels_v.clone(),
            binary_nm_v: nm(&p03.binary)?,
            ternary_nm_v: nm(&p03.ternary)?,
            quaternary_nm_v: nm(&p03.quaternary)?,
            binary_midpoints_v: p03.binary.nominal_midpoints_v.clone(),
            ternary_midpoints_v: p03.ternary.nominal_midpoints_v.clone(),
            quaternary_midpoints_v: p03.quaternary.nominal_midpoints_v.clone(),
            q4_cells,
            radix_economy_equation: m08.parameters.multiradix_cells.radix_economy.equation,
            radix_economy_minimum_at: m08.parameters.multiradix_cells.radix_economy.minimum_at,
            level_map_equation: m08.parameters.multiradix_cells.level_map.equation.clone(),
        })
    }
}

/// A logic radix `R ≥ 2` (custom radix support; digits stored as `u8`, so
/// `R ≤ 16` — the Phase 0 value parameter caps at 15).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Radix(pub(crate) u32);

impl Default for Radix {
    fn default() -> Self {
        Self::BINARY
    }
}

impl Radix {
    /// Binary (R=2).
    pub const BINARY: Radix = Radix(2);
    /// Balanced ternary (R=3).
    pub const TERNARY: Radix = Radix(3);
    /// Quaternary Q4 (R=4).
    pub const Q4: Radix = Radix(4);

    /// Fail-closed construction: `2 ≤ R ≤ 16`.
    pub fn new(r: u32) -> Result<Self, String> {
        if !(2..=16).contains(&r) {
            return Err(format!(
                "Logic radix must be >= 2 (got {r}); digits store in u8 so R ≤ 16"
            ));
        }
        Ok(Radix(r))
    }

    /// The raw radix value.
    pub fn get(self) -> u32 {
        self.0
    }

    /// Highest digit `R−1`.
    pub fn max_digit(self) -> u8 {
        (self.0 - 1) as u8
    }

    /// Level map `L_k = k·VDD/(R−1)` for `k = 0..R−1` (03_PHYSICS §2).
    pub fn level_map(self) -> Vec<f64> {
        let r = f64::from(self.0);
        (0..self.0)
            .map(|k| f64::from(k) * self.vdd() / (r - 1.0))
            .collect()
    }

    /// Voltage of digit `k` (`L_k`); fails closed for `k ≥ R`.
    pub fn level_voltage(self, k: u8) -> Result<f64, String> {
        if u32::from(k) >= self.0 {
            return Err(format!("digit {k} out of range for radix {}", self.0));
        }
        Ok(f64::from(k) * self.vdd() / f64::from(self.0 - 1))
    }

    /// Nominal decision midpoints between adjacent levels (`L_k + L_{k+1} / 2`).
    pub fn midpoints(self) -> Vec<f64> {
        let levels = self.level_map();
        levels.windows(2).map(|w| (w[0] + w[1]) / 2.0).collect()
    }

    /// Nearest-partition digit for an analogue voltage — the `q4_thresh_det`
    /// transfer ("Q_out = round(R partition of Vin)", 08 JSON) generalized to
    /// any radix: the digit whose level interval [midpoint_{k−1}, midpoint_k)
    /// contains `v`.
    pub fn detect_voltage(self, v: f64) -> u8 {
        let mids = self.midpoints();
        let mut digit = 0u8;
        for m in &mids {
            if v >= *m {
                digit += 1;
            }
        }
        digit.min(self.max_digit())
    }

    /// Theoretical noise-margin bound `NM ≥ VDD/(2·(R−1))` (03_PHYSICS §2,
    /// 08 `noise_margin_bounds`).
    pub fn noise_margin_bound(self) -> f64 {
        self.vdd() / (2.0 * f64::from(self.0 - 1))
    }

    /// Verified per-level noise margin from 03 JSON (binary 0.6 V,
    /// balanced-ternary 0.45 V, Q4 0.3 V); `None` for unverified custom radixes.
    pub fn verified_noise_margin(self, c: &RadixConstants) -> Option<f64> {
        match self.0 {
            2 => Some(c.binary_nm_v),
            3 => Some(c.ternary_nm_v),
            4 => Some(c.quaternary_nm_v),
            _ => None,
        }
    }

    /// Rail voltage (1.8 V — every verified family).
    pub fn vdd(self) -> f64 {
        1.8
    }
}

/// Radix economy `E(R) = R/ln(R)` (03_PHYSICS §2; 03 JSON primary form) —
/// the cost-per-digit ratio, minimized at `R = e ≈ 2.718`.
pub fn radix_economy(r: u32) -> f64 {
    f64::from(r) / (r as f64).ln()
}

/// Alternative digit-count economics `R/log₂(R)` (08 JSON `radix_economy`).
pub fn radix_economy_log2(r: u32) -> f64 {
    f64::from(r) / (r as f64).log2()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn constants() -> RadixConstants {
        RadixConstants::embedded().expect("embedded 03/08 reference data must verify + parse")
    }

    #[test]
    fn embedded_reference_verifies_against_manifest() {
        verify_embedded_reference().expect("03 + 08 sealed by MANIFEST.json");
    }

    #[test]
    fn verified_level_maps_match_the_03_json() {
        let c = constants();
        assert_eq!(c.binary_levels_v, vec![0.0, 1.8]);
        assert_eq!(c.ternary_levels_v, vec![0.0, 0.9, 1.8]);
        assert_eq!(c.quaternary_levels_v, vec![0.0, 0.6, 1.2, 1.8]);
        // L_k = k·VDD/(R−1) generalized to a custom radix (R=5 → 0.45 V steps).
        assert_eq!(
            Radix::new(5).unwrap().level_map(),
            vec![0.0, 0.45, 0.9, 1.35, 1.8]
        );
    }

    #[test]
    fn verified_noise_margins_and_theoretical_bound() {
        let c = constants();
        assert_eq!(c.binary_nm_v, 0.6);
        assert_eq!(c.ternary_nm_v, 0.45);
        assert_eq!(c.quaternary_nm_v, 0.3);
        // NM ≥ VDD/(2·(R−1)): binary 0.9, ternary 0.45, Q4 0.3 (08 JSON bounds).
        assert_eq!(Radix::BINARY.noise_margin_bound(), 0.9);
        assert_eq!(Radix::TERNARY.noise_margin_bound(), 0.45);
        assert_eq!(Radix::Q4.noise_margin_bound(), 0.3);
        // Verified margins respect the theoretical bound for every family.
        for (r, verified) in [
            (Radix::BINARY, c.binary_nm_v),
            (Radix::TERNARY, c.ternary_nm_v),
            (Radix::Q4, c.quaternary_nm_v),
        ] {
            assert!(
                verified > 0.0 && verified <= r.noise_margin_bound() + 1e-12,
                "R={}",
                r.get()
            );
        }
    }

    #[test]
    fn q4_threshold_detector_partitions_at_the_03_midpoints() {
        let c = constants();
        assert_eq!(c.quaternary_midpoints_v, vec![0.3, 0.9, 1.5]);
        let r = Radix::Q4;
        assert_eq!(r.detect_voltage(0.0), 0);
        assert_eq!(r.detect_voltage(0.29), 0);
        assert_eq!(r.detect_voltage(0.3), 1);
        assert_eq!(r.detect_voltage(0.89), 1);
        assert_eq!(r.detect_voltage(0.9), 2);
        assert_eq!(r.detect_voltage(1.5), 3);
        assert_eq!(r.detect_voltage(1.8), 3);
        assert_eq!(r.detect_voltage(2.5), 3, "clamped to the top digit");
        // Ternary midpoints {0.45, 1.35} (03 JSON).
        assert_eq!(Radix::TERNARY.detect_voltage(0.44), 0);
        assert_eq!(Radix::TERNARY.detect_voltage(0.45), 1);
        assert_eq!(Radix::TERNARY.detect_voltage(1.35), 2);
        // Round-trip: every valid level re-detects to its own digit.
        for k in 0..4u8 {
            let v = r.level_voltage(k).unwrap();
            assert_eq!(r.detect_voltage(v), k);
        }
    }

    #[test]
    fn radix_economy_minimizes_near_e() {
        // E(R) = R/ln(R): E(3) < E(2) and E(3) < E(4) — radix-3 most economical.
        let e = |r: u32| radix_economy(r);
        assert!(e(3) < e(2), "E(3)={} E(2)={}", e(3), e(2));
        assert!(e(3) < e(4));
        // Minimum at R = e ≈ 2.718 → integers 2 and 3 bracket it, 3 is lower.
        let e_float = |x: f64| x / x.ln();
        let at_e = e_float(std::f64::consts::E);
        assert!((e(3) - at_e).abs() < (e(2) - at_e).abs());
        // 08 alternative digit-count form agrees in ordering.
        assert!(
            radix_economy_log2(3) < radix_economy_log2(2)
                && radix_economy_log2(3) < radix_economy_log2(4)
        );
        // Exact published form at R=2: 2/ln 2.
        assert!((e(2) - 2.0 / 2.0f64.ln()).abs() < 1e-12);
    }

    #[test]
    fn verified_q4_cell_gate_counts_from_08_json() {
        let c = constants();
        assert_eq!(c.q4_cells.get("q4_thresh_det").map(|s| s.gates), Some(6));
        assert_eq!(c.q4_cells.get("q4_inv").map(|s| s.gates), Some(6));
        assert_eq!(c.q4_cells.get("q4_mux4").map(|s| s.gates), Some(8));
        assert_eq!(c.q4_cells.get("q4_half_adder").map(|s| s.gates), Some(8));
    }

    #[test]
    fn radix_construction_is_fail_closed() {
        assert!(Radix::new(1).is_err());
        assert!(Radix::new(0).is_err());
        assert!(Radix::new(17).is_err());
        assert!(Radix::new(2).is_ok());
        assert!(Radix::new(16).is_ok());
        assert!(Radix::BINARY.level_voltage(2).is_err());
    }
}
