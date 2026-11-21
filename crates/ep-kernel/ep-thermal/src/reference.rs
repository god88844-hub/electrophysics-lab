//! SHA-256-verified reference data for the thermal kernel (WP-2.3).
//!
//! `02_semiconductor_pdk_silicon.json` (materials) and
//! `06_failure_physics_thresholds.json` (thresholds + blackbody stops) are
//! embedded byte-exactly and verified against their sealed
//! `MANIFEST.json` entries through ep-core before any parse — fail-closed on
//! any byte mismatch (Builder Rule 5: zero invented constants).

use ep_core::reference::{verify_entry, LibraryError};

/// `data/reference-library/02_semiconductor_pdk_silicon.json` verbatim.
pub const SEMICONDUCTOR_JSON: &str = include_str!(concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../../../data/reference-library/02_semiconductor_pdk_silicon.json"
));
/// `data/reference-library/06_failure_physics_thresholds.json` verbatim.
pub const FAILURE_JSON: &str = include_str!(concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../../../data/reference-library/06_failure_physics_thresholds.json"
));
/// `data/reference-library/MANIFEST.json` verbatim (seals the payloads above).
pub const MANIFEST_JSON: &str = include_str!(concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../../../data/reference-library/MANIFEST.json"
));

/// Verify both embedded payloads against their sealed manifest entries.
pub fn verify_embedded_reference() -> Result<(), LibraryError> {
    let manifest: ep_core::reference::Manifest =
        serde_json::from_str(MANIFEST_JSON).map_err(|e| LibraryError {
            file: "MANIFEST.json".into(),
            reason: format!("parse: {e}"),
        })?;
    let check = |file: &str, bytes: &str| -> Result<(), LibraryError> {
        let entry = manifest
            .files
            .iter()
            .find(|e| e.file == file)
            .ok_or_else(|| LibraryError {
                file: "MANIFEST.json".into(),
                reason: format!("{file} not sealed"),
            })?;
        verify_entry(entry, bytes.as_bytes())
    };
    check("02_semiconductor_pdk_silicon.json", SEMICONDUCTOR_JSON)?;
    check("06_failure_physics_thresholds.json", FAILURE_JSON)?;
    Ok(())
}

/// Volumetric material properties for the Fourier PDE (02 JSON).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MaterialProps {
    /// Thermal conductivity W/(m·K).
    pub k_w_mk: f64,
    /// Density kg/m³.
    pub density_kg_m3: f64,
    /// Specific heat J/(kg·K).
    pub cp_j_kg_k: f64,
}

impl MaterialProps {
    /// Volumetric heat capacity ρ·c_p in J/(m³·K).
    pub fn rho_c(&self) -> f64 {
        self.density_kg_m3 * self.cp_j_kg_k
    }
}

/// Copper electrical model (02 JSON): TCR resistivity + melting point.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CopperElectro {
    /// ρ₀ at 300 K (Ω·m).
    pub resistivity_ohm_m_300k: f64,
    /// Temperature coefficient α (1/K).
    pub tcr_per_k: f64,
    /// Reference temperature T₀ (K).
    pub ref_k: f64,
    /// Melting point (°C).
    pub melting_point_c: f64,
}

impl CopperElectro {
    /// `ρ(T) = ρ₀·[1 + α·(T − T₀)]` — §1.5. The linear model is valid near
    /// 300 K; the bracket is floored at 0.01·ρ₀ as a documented numeric guard
    /// (never reached in admitted thermal ranges, keeps the Joule source
    /// finite under any implicit step).
    pub fn resistivity_at(&self, temp_k: f64) -> f64 {
        let bracket = (1.0 + self.tcr_per_k * (temp_k - self.ref_k)).max(0.01);
        self.resistivity_ohm_m_300k * bracket
    }

    /// Branch resistance at temperature: `R(T) = ρ_e(T)·length/area` — the
    /// R(T) TCR loop driven by WP-2.1 branch currents.
    pub fn resistance_at(&self, temp_k: f64, length_m: f64, area_m2: f64) -> f64 {
        self.resistivity_at(temp_k) * length_m / area_m2
    }
}

/// The §1.4 material set (02 JSON verified).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MaterialSet {
    pub silicon: MaterialProps,
    pub copper: MaterialProps,
    pub fr4: MaterialProps,
    pub copper_electro: CopperElectro,
}

/// Failure-threshold table (06 JSON verified) — exact §1.5 values.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ThresholdTable {
    /// SKY130 core SOA ceiling: `Vgs > 1.95 V` trips the oxide-arc event.
    pub vgs_threshold_v: f64,
    /// E-model TDDB slope γ ≈ 300 dec/V.
    pub gamma_dec_per_v: f64,
    /// Optional hard-breakdown ceiling (permanent shorted gate), if sealed.
    pub hard_breakdown_v: Option<f64>,
    /// Cu trace fusing (°C).
    pub cu_melting_c: f64,
    /// FR-4 delamination (°C) — the verified 260 °C (400 °C draft superseded).
    pub fr4_delamination_c: f64,
    /// Si thermal-runaway onset (°C).
    pub si_thermal_runaway_c: f64,
    /// Cryo quench: strict `Q_load > 12 mW`.
    pub cryo_quench_15mk_w: f64,
}

/// `path.to.field.typical`-style extraction with an exact-path error.
fn value_at<'a>(
    root: &'a serde_json::Value,
    path: &[&str],
) -> Result<&'a serde_json::Value, String> {
    let mut v = Some(root);
    for seg in path {
        v = v.and_then(|x| x.get(seg));
    }
    v.ok_or_else(|| format!("reference JSON: missing path {}", path.join(".")))
}

fn f64_at(root: &serde_json::Value, path: &[&str]) -> Result<f64, String> {
    value_at(root, path)?
        .as_f64()
        .ok_or_else(|| format!("reference JSON: {} is not a number", path.join(".")))
}

/// Parse + verify the embedded payloads in one call.
pub fn verified_materials() -> Result<MaterialSet, String> {
    verify_embedded_reference().map_err(|e| e.to_string())?;
    let root: serde_json::Value =
        serde_json::from_str(SEMICONDUCTOR_JSON).map_err(|e| format!("02 JSON parse: {e}"))?;
    let mat = |name: &str| -> Result<MaterialProps, String> {
        Ok(MaterialProps {
            k_w_mk: f64_at(
                &root,
                &[
                    "material_properties",
                    name,
                    "thermal_conductivity_w_per_m_k",
                ],
            )?,
            density_kg_m3: f64_at(&root, &["material_properties", name, "density_kg_per_m3"])?,
            cp_j_kg_k: f64_at(
                &root,
                &["material_properties", name, "specific_heat_j_per_kg_k"],
            )?,
        })
    };
    Ok(MaterialSet {
        silicon: mat("silicon")?,
        copper: mat("copper")?,
        fr4: mat("fr4_pcb")?,
        copper_electro: CopperElectro {
            resistivity_ohm_m_300k: f64_at(
                &root,
                &["material_properties", "copper", "resistivity_ohm_m_at_300K"],
            )?,
            tcr_per_k: f64_at(&root, &["material_properties", "copper", "tcr_per_k"])?,
            ref_k: 300.0, // 02 JSON: resistivity_ohm_m_at_300K (the reference temperature of the table)
            melting_point_c: f64_at(&root, &["material_properties", "copper", "melting_point_c"])?,
        },
    })
}

/// Parse + verify the embedded failure thresholds.
pub fn verified_thresholds() -> Result<ThresholdTable, String> {
    verify_embedded_reference().map_err(|e| e.to_string())?;
    let root: serde_json::Value =
        serde_json::from_str(FAILURE_JSON).map_err(|e| format!("06 JSON parse: {e}"))?;
    Ok(ThresholdTable {
        vgs_threshold_v: f64_at(
            &root,
            &["failure_thresholds", "gate_oxide_tddb", "vgs_threshold_v"],
        )?,
        gamma_dec_per_v: f64_at(
            &root,
            &["failure_thresholds", "gate_oxide_tddb", "gamma_dec_per_v"],
        )?,
        hard_breakdown_v: root
            .get("failure_thresholds")
            .and_then(|t| t.get("gate_oxide_tddb"))
            .and_then(|t| t.get("hard_breakdown_v"))
            .and_then(|v| v.as_f64()),
        cu_melting_c: f64_at(&root, &["failure_thresholds", "cu_melting_c"])?,
        fr4_delamination_c: f64_at(&root, &["failure_thresholds", "fr4_delamination_c"])?,
        si_thermal_runaway_c: f64_at(&root, &["failure_thresholds", "si_thermal_runaway_c"])?,
        cryo_quench_15mk_w: f64_at(&root, &["failure_thresholds", "cryo_quench_15mk_w"])?,
    })
}

/// Thresholds + blackbody ramp parsed from the same verified payloads.
pub fn verified_thresholds_and_ramp(
) -> Result<(ThresholdTable, crate::blackbody::BlackbodyRamp), String> {
    verify_embedded_reference().map_err(|e| e.to_string())?;
    let table = verified_thresholds()?;
    let root: serde_json::Value =
        serde_json::from_str(FAILURE_JSON).map_err(|e| format!("06 JSON parse: {e}"))?;
    let ramp = crate::blackbody::BlackbodyRamp::from_json(&root)?;
    Ok((table, ramp))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Embedded 02 + 06 payloads verify byte-exactly against their sealed
    /// MANIFEST.json entries (SHA-256 + size) through ep-core.
    #[test]
    fn embedded_reference_verifies() {
        verify_embedded_reference().expect("embedded 02/06 JSON must match their manifest seals");
    }

    /// §1.4/§1.5 material + threshold constants equal their 02/06 JSON values.
    #[test]
    fn constants_match_verified_json() {
        let m = verified_materials().expect("verified materials");
        // §1.4: Si k=148, ρ=2329, c_p=700; Cu k=401, ρ=8960, c_p=385; FR-4 k=0.3, ρ=1900, c_p=600.
        assert_eq!(m.silicon.k_w_mk, 148.0);
        assert_eq!(m.silicon.density_kg_m3, 2329.0);
        assert_eq!(m.silicon.cp_j_kg_k, 700.0);
        assert_eq!(m.copper.k_w_mk, 401.0);
        assert_eq!(m.copper.density_kg_m3, 8960.0);
        assert_eq!(m.copper.cp_j_kg_k, 385.0);
        assert_eq!(m.fr4.k_w_mk, 0.3);
        assert_eq!(m.fr4.density_kg_m3, 1900.0);
        assert_eq!(m.fr4.cp_j_kg_k, 600.0);
        // §1.5: Cu α = 0.0039 /K, T₀ = 300 K, ρ₀ = 1.68e-8 Ω·m, melt 1085 °C.
        assert_eq!(m.copper_electro.tcr_per_k, 0.0039);
        assert_eq!(m.copper_electro.resistivity_ohm_m_300k, 1.68e-8);
        assert_eq!(m.copper_electro.melting_point_c, 1085.0);
        let t = verified_thresholds().expect("verified thresholds");
        assert_eq!(t.vgs_threshold_v, 1.95);
        assert_eq!(t.gamma_dec_per_v, 300.0);
        assert_eq!(t.cu_melting_c, 1085.0);
        assert_eq!(t.fr4_delamination_c, 260.0);
        assert_eq!(t.si_thermal_runaway_c, 200.0);
        assert_eq!(t.cryo_quench_15mk_w, 0.012);
    }

    /// Cu resistivity rises linearly with T (TCR loop): ρ(350 K) ≈ ρ₀·1.195.
    #[test]
    fn copper_resistivity_tcr_loop() {
        let m = verified_materials().expect("verified materials");
        let rho350 = m.copper_electro.resistivity_at(350.0);
        assert!((rho350 - 1.68e-8 * (1.0 + 0.0039 * 50.0)).abs() < 1e-15);
        let r = m.copper_electro.resistance_at(350.0, 0.01, 1e-10);
        assert!((r - rho350 * 0.01 / 1e-10).abs() < 1e-24);
    }
}
