//! Planck blackbody RGB curve (03 §1.5) — verified stops 300→2500 K from
//! `06_failure_physics_thresholds.json → parameters.blackbody_rgb_temperature_curve`,
//! interpolated piecewise-linear in temperature.

use serde::{Deserialize, Serialize};

/// One color stop: temperature (K) + sRGB bytes + the sealed provenance note.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BlackbodyStop {
    pub t_k: f64,
    pub rgb: [u8; 3],
    pub note: String,
}

/// Piecewise-linear temperature → RGB ramp over the verified stops.
#[derive(Debug, Clone, PartialEq)]
pub struct BlackbodyRamp {
    stops: Vec<BlackbodyStop>,
}

/// Parse the ramp from the verified 06 JSON root
/// (`parameters.blackbody_rgb_temperature_curve.visible_color_mapping`,
/// keys shaped `"<temp>_k"`). Fail-closed on missing/malformed stops.
pub fn parse_ramp(json06: &serde_json::Value) -> Result<BlackbodyRamp, String> {
    let mapping = json06
        .get("parameters")
        .and_then(|p| p.get("blackbody_rgb_temperature_curve"))
        .and_then(|b| b.get("visible_color_mapping"))
        .and_then(|m| m.as_object())
        .ok_or_else(|| "06 JSON: blackbody visible_color_mapping missing".to_string())?;
    let mut stops = Vec::new();
    for (key, v) in mapping {
        let t_k = key
            .strip_suffix("_k")
            .and_then(|digits| digits.parse::<f64>().ok())
            .ok_or_else(|| format!("06 JSON: blackbody stop key '{key}' is not '<temp>_k'"))?;
        let rgb = v
            .get("rgb")
            .and_then(|r| r.as_array())
            .filter(|a| a.len() == 3)
            .map(|a| {
                let mut out = [0u8; 3];
                for (i, ch) in a.iter().enumerate() {
                    out[i] = ch.as_u64().unwrap_or(0).clamp(0, 255) as u8;
                }
                out
            })
            .ok_or_else(|| format!("06 JSON: blackbody stop '{key}' rgb must be [r,g,b]"))?;
        let note = v
            .get("note")
            .and_then(|n| n.as_str())
            .unwrap_or_default()
            .to_string();
        stops.push(BlackbodyStop { t_k, rgb, note });
    }
    if stops.len() < 2 {
        return Err("06 JSON: blackbody ramp needs ≥ 2 stops".into());
    }
    stops.sort_by(|a, b| a.t_k.partial_cmp(&b.t_k).expect("finite stop keys"));
    Ok(BlackbodyRamp { stops })
}

impl BlackbodyRamp {
    /// Parse from the embedded verified 06 JSON (fail-closed).
    pub fn from_json(json06: &serde_json::Value) -> Result<Self, String> {
        parse_ramp(json06)
    }

    /// The verified stops (ascending temperature).
    pub fn stops(&self) -> &[BlackbodyStop] {
        &self.stops
    }

    /// Piecewise-linear sRGB interpolation at `t_k`. Below the first stop →
    /// the first stop's color; above the last → the last stop's color.
    pub fn rgb_at(&self, t_k: f64) -> [u8; 3] {
        let stops = &self.stops;
        if t_k <= stops[0].t_k {
            return stops[0].rgb;
        }
        let last = &stops[stops.len() - 1];
        if t_k >= last.t_k {
            return last.rgb;
        }
        for w in stops.windows(2) {
            let (a, b) = (&w[0], &w[1]);

            if t_k >= a.t_k && t_k <= b.t_k {
                let span = (b.t_k - a.t_k).max(1e-9);
                let frac = (t_k - a.t_k) / span;
                let out = [
                    {
                        let v = a.rgb[0] as f64 + frac * (b.rgb[0] as f64 - a.rgb[0] as f64);
                        v.round().clamp(0.0, 255.0) as u8
                    },
                    {
                        let v = a.rgb[1] as f64 + frac * (b.rgb[1] as f64 - a.rgb[1] as f64);
                        v.round().clamp(0.0, 255.0) as u8
                    },
                    {
                        let v = a.rgb[2] as f64 + frac * (b.rgb[2] as f64 - a.rgb[2] as f64);
                        v.round().clamp(0.0, 255.0) as u8
                    },
                ];
                return out;
            }
        }
        last.rgb
    }

    /// Normalized (0..1) RGB for shader uniforms.
    pub fn rgb_normalized(&self, t_k: f64) -> [f64; 3] {
        let [r, g, b] = self.rgb_at(t_k);
        [
            f64::from(r) / 255.0,
            f64::from(g) / 255.0,
            f64::from(b) / 255.0,
        ]
    }
}

/// Convenience: ramp from the crate's embedded verified 06 JSON.
pub fn blackbody_rgb(t_k: f64) -> Result<[u8; 3], String> {
    let root: serde_json::Value = serde_json::from_str(crate::reference::FAILURE_JSON)
        .map_err(|e| format!("06 JSON: {e}"))?;
    Ok(parse_ramp(&root)?.rgb_at(t_k))
}
