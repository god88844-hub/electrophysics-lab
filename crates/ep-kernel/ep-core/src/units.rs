//! SI unit types (Law: every quantity carries its unit; conversions are
//! explicit and total). Units are newtype-wrapped `f64`s; arithmetic is only
//! allowed where dimensionally correct.

use serde::{Deserialize, Serialize};

macro_rules! si_unit {
    ($(#[$meta:meta])* $name:ident, $symbol:expr) => {
        $(#[$meta])*
        #[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize, Default)]
        pub struct $name(pub f64);

        impl $name {
            pub const SYMBOL: &'static str = $symbol;
            pub fn new(v: f64) -> Self { Self(v) }
            pub fn value(&self) -> f64 { self.0 }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{:.6} {}", self.0, $symbol)
            }
        }

        impl std::ops::Add for $name {
            type Output = $name;
            fn add(self, rhs: $name) -> $name { Self(self.0 + rhs.0) }
        }
        impl std::ops::Sub for $name {
            type Output = $name;
            fn sub(self, rhs: $name) -> $name { Self(self.0 - rhs.0) }
        }
        impl std::ops::Mul<f64> for $name {
            type Output = $name;
            fn mul(self, k: f64) -> $name { Self(self.0 * k) }
        }
    };
}

si_unit!(Meter, "m");
si_unit!(Second, "s");
si_unit!(Kelvin, "K");
si_unit!(Volt, "V");
si_unit!(Ampere, "A");
si_unit!(Ohm, "Ω");
si_unit!(Watt, "W");
si_unit!(Celsius, "°C");

impl Kelvin {
    /// Absolute zero anchor: K = °C + 273.15 (exact by SI definition).
    pub fn from_celsius(c: Celsius) -> Self {
        Self(c.0 + 273.15)
    }
    pub fn to_celsius(&self) -> Celsius {
        Celsius(self.0 - 273.15)
    }
}

impl Celsius {
    pub fn from_kelvin(k: Kelvin) -> Self {
        Self(k.0 - 273.15)
    }
    pub fn to_kelvin(&self) -> Kelvin {
        Kelvin(self.0 + 273.15)
    }
}

impl Volt {
    /// Ohm's law: V = I·R.
    pub fn from_ohms_law(i: Ampere, r: Ohm) -> Self {
        Self(i.0 * r.0)
    }
}

impl Watt {
    /// Joule heating: P = I²·R (physics-engine parity: P = I²·R(T)).
    pub fn joule_heating(i: Ampere, r: Ohm) -> Self {
        Self(i.0 * i.0 * r.0)
    }
    /// Dynamic switching power: P = α·C·V²·f (05_chip_architecture_benchmarks.json).
    pub fn switching(alpha: f64, cap_farads: f64, v: Volt, freq_hz: f64) -> Self {
        Self(alpha * cap_farads * v.0 * v.0 * freq_hz)
    }
}

impl Ohm {
    /// Temperature-dependent resistance: R(T) = R₀·(1 + α·(T − T₀)) (02 JSON TCR).
    pub fn at_temperature(r0: Ohm, alpha_per_k: f64, temp_k: Kelvin, ref_k: Kelvin) -> Self {
        Self(r0.0 * (1.0 + alpha_per_k * (temp_k.0 - ref_k.0)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn celsius_kelvin_round_trip_exact() {
        let k = Kelvin::from_celsius(Celsius(25.0));
        assert!((k.0 - 298.15).abs() < 1e-9);
        let c = k.to_celsius();
        assert!((c.0 - 25.0).abs() < 1e-9);
    }

    #[test]
    fn ohms_law_and_joule_heating() {
        let v = Volt::from_ohms_law(Ampere(0.002), Ohm(1000.0));
        assert!((v.0 - 2.0).abs() < 1e-12);
        let p = Watt::joule_heating(Ampere(0.002), Ohm(1000.0));
        assert!((p.0 - 0.004).abs() < 1e-12);
    }

    #[test]
    fn tcr_matches_esm_reference_values() {
        // 02 JSON: Cu alpha = 0.0039/K; physics-engine resistanceAtTemp oracle.
        let r = Ohm::at_temperature(Ohm(0.125), 0.0039, Kelvin(1358.0), Kelvin(300.0));
        // Expected ~0.125·(1+0.0039·1058) ≈ 0.6407 Ω — must exceed 4×R0 (fusing regime).
        assert!(r.0 > 0.125 * 4.0 && r.0 < 0.125 * 6.0, "R(T) = {}", r.0);
    }

    #[test]
    fn switching_power_scales_with_v_squared_and_f() {
        let base = Watt::switching(0.35, 1.2e-13, Volt(0.8), 100e6);
        let f2 = Watt::switching(0.35, 1.2e-13, Volt(0.8), 200e6);
        let v2 = Watt::switching(0.35, 1.2e-13, Volt(1.0), 100e6);
        assert!((f2.0 / base.0 - 2.0).abs() < 1e-9, "P ∝ f");
        assert!(
            (v2.0 / base.0 - (1.0 / 0.8_f64).powi(2)).abs() < 1e-9,
            "P ∝ V²"
        );
    }
}
