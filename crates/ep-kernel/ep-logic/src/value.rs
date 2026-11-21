//! Logic values — a digit in `0..radix` or high-impedance `'Z'`.
//!
//! Mirrors the Phase 0 `js/labs/logic` engine exactly: inputs start `'Z'`,
//! `'Z'` propagates through every primitive (an unconnected input is a real
//! design defect the engine reports), and multi-driver inputs resolve
//! last-write-wins by `(time, seq)` event order with a contention warning.
//!
//! Custom radix: any `R ≥ 2`; digits are stored as `u8` (the Phase 0 value
//! parameter caps at 15, so `R ≤ 16` covers every representable digit).

use serde::{Deserialize, Serialize};

/// A multi-valued logic value: a digit (`0..=15`, validity `R`-checked) or `'Z'`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum LogicValue {
    /// High-impedance / unknown — propagates through every primitive.
    #[default]
    Z,
    /// A valid digit in `0..radix`.
    Digit(u8),
}

impl LogicValue {
    /// The digit, or `None` for `'Z'`.
    pub fn digit(self) -> Option<u8> {
        match self {
            LogicValue::Digit(d) => Some(d),
            LogicValue::Z => None,
        }
    }

    /// `true` when this is `'Z'`.
    pub fn is_z(self) -> bool {
        matches!(self, LogicValue::Z)
    }
}

/// Serialize a digit as a JSON number and `'Z'` as the string `"Z"` — the
/// exact Phase 0 oracle encoding (`tests/fixtures/*.json`).
impl Serialize for LogicValue {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            LogicValue::Digit(d) => serializer.serialize_u8(*d),
            LogicValue::Z => serializer.serialize_str("Z"),
        }
    }
}

impl<'de> Deserialize<'de> for LogicValue {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct V;
        impl serde::de::Visitor<'_> for V {
            type Value = LogicValue;
            fn expecting(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.write_str("a digit number or the string \"Z\"")
            }
            fn visit_u64<E: serde::de::Error>(self, v: u64) -> Result<Self::Value, E> {
                u8::try_from(v)
                    .map(LogicValue::Digit)
                    .map_err(|_| E::custom(format!("digit {v} out of range")))
            }
            fn visit_str<E: serde::de::Error>(self, v: &str) -> Result<Self::Value, E> {
                if v == "Z" {
                    Ok(LogicValue::Z)
                } else {
                    Err(E::custom(format!("unknown logic value \"{v}\"")))
                }
            }
        }
        deserializer.deserialize_any(V)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serde_matches_phase0_oracle_encoding() {
        assert_eq!(
            serde_json::to_value(LogicValue::Digit(3)).unwrap(),
            serde_json::json!(3)
        );
        assert_eq!(
            serde_json::to_value(LogicValue::Z).unwrap(),
            serde_json::json!("Z")
        );
        assert_eq!(
            serde_json::from_str::<LogicValue>("2").unwrap(),
            LogicValue::Digit(2)
        );
        assert_eq!(
            serde_json::from_str::<LogicValue>("\"Z\"").unwrap(),
            LogicValue::Z
        );
        assert!(serde_json::from_str::<LogicValue>("\"X\"").is_err());
    }
}
