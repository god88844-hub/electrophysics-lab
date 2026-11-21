//! Component library — ports, parameter defaults, and eval semantics ported
//! 1:1 from Phase 0 `js/labs/logic/components.js` (the parity oracle), plus
//! the verified multi-radix cells.
//!
//! Multi-valued algebra (documented, exhaustively truth-table tested):
//!   AND  = min(a, b)                 OR   = max(a, b)
//!   NOT  = (r−1) − v                 NAND = (r−1) − min(a, b)
//!   NOR  = (r−1) − max(a, b)         XOR  = (a + b) mod r   (r=2 → classic XOR)
//!   XNOR = (r−1) − ((a+b) mod r)
//! `'Z'` propagates through every primitive (intentional honesty).
//!
//! Verified cells (designs/stage-m/q4-candidates/*.spice + 03/08 JSON):
//!   q4_thresh_det  nearest-partition detector (logic level: identity)
//!   q4_inv         Q_out = 3 − Q_in
//!   q4_mux4        out = d[sel] — single quaternary selector digit
//!                  (verified candidate: `.subckt q4_mux4 sel d0 d1 d2 d3 out`,
//!                  thermometer decode S0=!t1, S1=t1&&!t2, S2=t2&&!t3, S3=t3;
//!                  the 08 JSON "2-digit selector" blurb is superseded by the
//!                  verified candidate netlist)
//!   q4_half_adder  S = (A+B) mod 4, C = ⌊(A+B)/4⌋ (carry digit 0/1)
//!   ternary_inv    Q_out = 2 − Q_in
//!   ternary_half_adder  S = (A+B) mod 3, C = ⌊(A+B)/3⌋

use crate::value::LogicValue;
use serde::{Deserialize, Serialize};

/// Component kinds — `type_id` strings match Phase 0 `js/labs/logic` exactly;
/// the `kernel.*` cells mirror the verified designs (see `tests/generate_fixtures.mjs`
/// for the JS mirror used by the event-order oracle).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ComponentKind {
    In,
    Const,
    Probe,
    Clock,
    And,
    Or,
    Nand,
    Nor,
    Xor,
    Xnor,
    Not,
    Buf,
    AddN,
    CmpN,
    Mux2,
    Dff,
    Q4ThreshDet,
    Q4Inv,
    Q4Mux4,
    Q4HalfAdder,
    TernaryInv,
    TernaryHalfAdder,
}

impl ComponentKind {
    /// Parse a Phase 0 `type_id` (fail-closed on unknown types — the engine
    /// records a problem and skips the block, exactly like the oracle).
    pub fn from_type_id(type_id: &str) -> Option<Self> {
        Some(match type_id {
            "logic.IN" => Self::In,
            "logic.CONST" => Self::Const,
            "logic.PROBE" => Self::Probe,
            "logic.CLOCK" => Self::Clock,
            "logic.AND" => Self::And,
            "logic.OR" => Self::Or,
            "logic.NAND" => Self::Nand,
            "logic.NOR" => Self::Nor,
            "logic.XOR" => Self::Xor,
            "logic.XNOR" => Self::Xnor,
            "logic.NOT" => Self::Not,
            "logic.BUF" => Self::Buf,
            "logic.ADDN" => Self::AddN,
            "logic.CMPN" => Self::CmpN,
            "logic.MUX2" => Self::Mux2,
            "logic.DFF" => Self::Dff,
            "kernel.q4_thresh_det" => Self::Q4ThreshDet,
            "kernel.q4_inv" => Self::Q4Inv,
            "kernel.q4_mux4" => Self::Q4Mux4,
            "kernel.q4_half_adder" => Self::Q4HalfAdder,
            "kernel.ternary_inv" => Self::TernaryInv,
            "kernel.ternary_half_adder" => Self::TernaryHalfAdder,
            _ => return None,
        })
    }

    /// The Phase 0 type_id.
    pub fn type_id(self) -> &'static str {
        match self {
            Self::In => "logic.IN",
            Self::Const => "logic.CONST",
            Self::Probe => "logic.PROBE",
            Self::Clock => "logic.CLOCK",
            Self::And => "logic.AND",
            Self::Or => "logic.OR",
            Self::Nand => "logic.NAND",
            Self::Nor => "logic.NOR",
            Self::Xor => "logic.XOR",
            Self::Xnor => "logic.XNOR",
            Self::Not => "logic.NOT",
            Self::Buf => "logic.BUF",
            Self::AddN => "logic.ADDN",
            Self::CmpN => "logic.CMPN",
            Self::Mux2 => "logic.MUX2",
            Self::Dff => "logic.DFF",
            Self::Q4ThreshDet => "kernel.q4_thresh_det",
            Self::Q4Inv => "kernel.q4_inv",
            Self::Q4Mux4 => "kernel.q4_mux4",
            Self::Q4HalfAdder => "kernel.q4_half_adder",
            Self::TernaryInv => "kernel.ternary_inv",
            Self::TernaryHalfAdder => "kernel.ternary_half_adder",
        }
    }

    /// Ports in definition order (matches `ports()` in components.js).
    pub fn ports(self) -> &'static [PortDef] {
        match self {
            Self::In | Self::Const | Self::Clock => &PORT_OUT,
            Self::Probe => &PORT_IN,
            Self::And | Self::Or | Self::Nand | Self::Nor | Self::Xor | Self::Xnor => &PORT_A_B_Y,
            Self::Not | Self::Buf | Self::Q4ThreshDet | Self::Q4Inv | Self::TernaryInv => &PORT_A_Y,
            Self::AddN => &PORT_ADDN,
            Self::CmpN => &PORT_CMPN,
            Self::Mux2 => &PORT_MUX2,
            Self::Dff => &PORT_DFF,
            Self::Q4Mux4 => &PORT_Q4MUX4,
            Self::Q4HalfAdder | Self::TernaryHalfAdder => &PORT_A_B_SUM_CARRY,
        }
    }

    /// Input port ids in definition order.
    pub fn input_ports(self) -> &'static [&'static str] {
        match self {
            Self::In | Self::Const | Self::Clock => &[],
            Self::Probe => &["in"],
            Self::Not | Self::Buf | Self::Q4ThreshDet | Self::Q4Inv | Self::TernaryInv => &["a"],
            Self::And | Self::Or | Self::Nand | Self::Nor | Self::Xor | Self::Xnor => &["a", "b"],
            Self::AddN => &["a", "b", "cin"],
            Self::CmpN => &["a", "b"],
            Self::Mux2 => &["sel", "a", "b"],
            Self::Dff => &["d", "clk"],
            Self::Q4Mux4 => &["sel", "d0", "d1", "d2", "d3"],
            Self::Q4HalfAdder | Self::TernaryHalfAdder => &["a", "b"],
        }
    }
}

/// Port direction.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PortDir {
    In,
    Out,
}

/// Port definition.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PortDef {
    pub id: &'static str,
    pub dir: PortDir,
}

// ---- static port tables (definition order = oracle ports() order) --------
const PORT_OUT: [PortDef; 1] = [PortDef {
    id: "out",
    dir: PortDir::Out,
}];
const PORT_IN: [PortDef; 1] = [PortDef {
    id: "in",
    dir: PortDir::In,
}];
const PORT_A_Y: [PortDef; 2] = [
    PortDef {
        id: "a",
        dir: PortDir::In,
    },
    PortDef {
        id: "y",
        dir: PortDir::Out,
    },
];
const PORT_A_B_Y: [PortDef; 3] = [
    PortDef {
        id: "a",
        dir: PortDir::In,
    },
    PortDef {
        id: "b",
        dir: PortDir::In,
    },
    PortDef {
        id: "y",
        dir: PortDir::Out,
    },
];
const PORT_ADDN: [PortDef; 5] = [
    PortDef {
        id: "a",
        dir: PortDir::In,
    },
    PortDef {
        id: "b",
        dir: PortDir::In,
    },
    PortDef {
        id: "cin",
        dir: PortDir::In,
    },
    PortDef {
        id: "sum",
        dir: PortDir::Out,
    },
    PortDef {
        id: "cout",
        dir: PortDir::Out,
    },
];
const PORT_CMPN: [PortDef; 4] = [
    PortDef {
        id: "a",
        dir: PortDir::In,
    },
    PortDef {
        id: "b",
        dir: PortDir::In,
    },
    PortDef {
        id: "gt",
        dir: PortDir::Out,
    },
    PortDef {
        id: "eq",
        dir: PortDir::Out,
    },
];
const PORT_MUX2: [PortDef; 4] = [
    PortDef {
        id: "sel",
        dir: PortDir::In,
    },
    PortDef {
        id: "a",
        dir: PortDir::In,
    },
    PortDef {
        id: "b",
        dir: PortDir::In,
    },
    PortDef {
        id: "y",
        dir: PortDir::Out,
    },
];
const PORT_DFF: [PortDef; 3] = [
    PortDef {
        id: "d",
        dir: PortDir::In,
    },
    PortDef {
        id: "clk",
        dir: PortDir::In,
    },
    PortDef {
        id: "q",
        dir: PortDir::Out,
    },
];
const PORT_Q4MUX4: [PortDef; 6] = [
    PortDef {
        id: "sel",
        dir: PortDir::In,
    },
    PortDef {
        id: "d0",
        dir: PortDir::In,
    },
    PortDef {
        id: "d1",
        dir: PortDir::In,
    },
    PortDef {
        id: "d2",
        dir: PortDir::In,
    },
    PortDef {
        id: "d3",
        dir: PortDir::In,
    },
    PortDef {
        id: "y",
        dir: PortDir::Out,
    },
];
const PORT_A_B_SUM_CARRY: [PortDef; 4] = [
    PortDef {
        id: "a",
        dir: PortDir::In,
    },
    PortDef {
        id: "b",
        dir: PortDir::In,
    },
    PortDef {
        id: "sum",
        dir: PortDir::Out,
    },
    PortDef {
        id: "carry",
        dir: PortDir::Out,
    },
];

/// Block parameters with Phase 0 defaults (`addBlock` applies component
/// defaults, then user overrides — mirrored here).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BlockParams {
    /// IN/CONST driven value (default 0).
    #[serde(default)]
    pub value: u32,
    /// Gate/combinational delay in ticks (default 10).
    #[serde(default)]
    pub delay: u64,
    /// DFF clock-to-Q delay (default 10).
    #[serde(default)]
    pub tco: u64,
    /// DFF initial Q (default 0).
    #[serde(default)]
    pub init: u32,
    /// CLOCK period in ticks (default 100).
    #[serde(default)]
    pub period: u64,
    /// CLOCK duty cycle (default 0.5).
    #[serde(default)]
    pub duty: f64,
    /// PROBE label (default: block id).
    #[serde(default)]
    pub name: Option<String>,
}

impl Default for BlockParams {
    fn default() -> Self {
        Self {
            value: 0,
            delay: 10,
            tco: 10,
            init: 0,
            period: 100,
            duty: 0.5,
            name: None,
        }
    }
}

impl BlockParams {
    /// Component-default parameters for `kind` (mirrors the JS defaults table).
    pub fn defaults_for(kind: ComponentKind) -> Self {
        let mut p = Self::default();
        if kind == ComponentKind::Clock {
            p.period = 100;
            p.duty = 0.5;
        }
        if kind == ComponentKind::Dff {
            p.tco = 10;
            p.init = 0;
        }
        p
    }

    /// Output delay for `port` — the oracle rule:
    /// `def.delay ? def.delay(...) : (port === 'q' && params.tco !== undefined ? tco : delay ?? 10)`.
    pub fn output_delay(&self, port: &str) -> u64 {
        if port == "q" {
            self.tco
        } else {
            self.delay
        }
    }
}

/// Combinational/sequential eval — returns the changed outputs.
/// `radix` is the diagram radix; `changed` is the port whose event triggered
/// this evaluation (mirrors `changed.includes(port)` in the oracle).
pub(crate) fn eval(
    kind: ComponentKind,
    radix: crate::radix::Radix,
    _params: &BlockParams,
    state: &mut BlockState,
    inputs: &std::collections::HashMap<&'static str, LogicValue>,
    changed: Option<&'static str>,
) -> Vec<(&'static str, LogicValue)> {
    use ComponentKind as K;
    use LogicValue::{Digit, Z};

    /// Z-propagation helper: all listed inputs must be digits.
    fn digits(
        inputs: &std::collections::HashMap<&'static str, LogicValue>,
        keys: &[&str],
    ) -> Option<Vec<u8>> {
        keys.iter()
            .map(|k| inputs.get(*k).copied().and_then(|v| v.digit()))
            .collect()
    }

    match kind {
        K::In | K::Const | K::Probe | K::Clock => Vec::new(),
        K::And => match digits(inputs, &["a", "b"]) {
            Some(v) => vec![("y", Digit(v[0].min(v[1])))],
            None => vec![("y", Z)],
        },
        K::Or => match digits(inputs, &["a", "b"]) {
            Some(v) => vec![("y", Digit(v[0].max(v[1])))],
            None => vec![("y", Z)],
        },
        K::Nand => match digits(inputs, &["a", "b"]) {
            Some(v) => vec![("y", Digit(radix.max_digit() - v[0].min(v[1])))],
            None => vec![("y", Z)],
        },
        K::Nor => match digits(inputs, &["a", "b"]) {
            Some(v) => vec![("y", Digit(radix.max_digit() - v[0].max(v[1])))],
            None => vec![("y", Z)],
        },
        K::Xor => match digits(inputs, &["a", "b"]) {
            Some(v) => vec![("y", Digit((v[0] + v[1]) % radix.get() as u8))],
            None => vec![("y", Z)],
        },
        K::Xnor => match digits(inputs, &["a", "b"]) {
            Some(v) => vec![(
                "y",
                Digit(radix.max_digit() - (v[0] + v[1]) % radix.get() as u8),
            )],
            None => vec![("y", Z)],
        },
        K::Not | K::TernaryInv => {
            // NOT: (r−1) − v. ternary_inv: 2 − Q (identical at R=3; the named
            // cell is fixed to the verified ternary family per 08 JSON).
            let top = if kind == K::Not { radix.max_digit() } else { 2 };
            match digits(inputs, &["a"]) {
                Some(v) => vec![("y", Digit(top - v[0]))],
                None => vec![("y", Z)],
            }
        }
        K::Buf => match digits(inputs, &["a"]) {
            Some(v) => vec![("y", Digit(v[0]))],
            None => vec![("y", Z)],
        },
        K::AddN => match digits(inputs, &["a", "b", "cin"]) {
            Some(v) => {
                let t = v[0] + v[1] + v[2];
                let r = radix.get() as u8;
                vec![("sum", Digit(t % r)), ("cout", Digit(t / r))]
            }
            None => vec![("sum", Z), ("cout", Z)],
        },
        K::Q4HalfAdder | K::TernaryHalfAdder => {
            // Verified cells: no carry-in port — S = (A+B) mod r,
            // C = ⌊(A+B)/r⌋ (carry digit 0/1; verified SPICE half-adder).
            let r = match kind {
                K::Q4HalfAdder => 4u8, // verified Q4 cell: fixed base 4
                _ => 3,                // verified ternary cell: fixed base 3
            };
            match digits(inputs, &["a", "b"]) {
                Some(v) => {
                    let t = v[0] + v[1];
                    vec![("sum", Digit(t % r)), ("carry", Digit(t / r))]
                }
                None => vec![("sum", Z), ("carry", Z)],
            }
        }
        K::CmpN => match digits(inputs, &["a", "b"]) {
            Some(v) => vec![
                ("gt", Digit(if v[0] > v[1] { radix.max_digit() } else { 0 })),
                (
                    "eq",
                    Digit(if v[0] == v[1] { radix.max_digit() } else { 0 }),
                ),
            ],
            None => vec![("gt", Z), ("eq", Z)],
        },
        K::Mux2 => match digits(inputs, &["sel", "a", "b"]) {
            Some(v) => vec![("y", Digit(if v[0] == 0 { v[1] } else { v[2] }))],
            None => vec![("y", Z)],
        },
        K::Dff => {
            // Edge-triggered: sample D on the rising clock edge (0 → r−1),
            // only when the trigger event was the clk port (oracle:
            // `changed.includes('clk')`).
            if changed == Some("clk") {
                let clk = inputs.get("clk").copied().unwrap_or(Z);
                let rising = state.dff_last_clk == Digit(0) && clk == Digit(radix.max_digit());
                state.dff_last_clk = clk;
                if rising {
                    let d = inputs.get("d").copied().unwrap_or(Z);
                    return vec![("q", d)];
                }
            }
            Vec::new()
        }
        K::Q4ThreshDet => {
            // Verified cell: maps an analogue input to the nearest Q4 digit.
            // At the logic level a valid Q4 level re-partitions to itself
            // (exact mirror of the oracle: identity on digits — the analogue
            // bridge is `Radix::detect_voltage`, tested against the 03 JSON
            // midpoints). Instantiation outside a Q4 diagram is a design
            // error, as the SPICE cell is Q4-only.
            match digits(inputs, &["a"]) {
                Some(v) => vec![("y", Digit(v[0]))],
                None => vec![("y", Z)],
            }
        }
        K::Q4Inv => match digits(inputs, &["a"]) {
            Some(v) => vec![("y", Digit(3 - v[0]))],
            None => vec![("y", Z)],
        },
        K::Q4Mux4 => match digits(inputs, &["sel", "d0", "d1", "d2", "d3"]) {
            Some(v) => {
                let data = [v[1], v[2], v[3], v[4]];
                if usize::from(v[0]) < 4 {
                    vec![("y", Digit(data[usize::from(v[0])]))]
                } else {
                    // Selector digit beyond the 4:1 contract — honest
                    // undefined selection (mirrors the oracle's Z honesty).
                    vec![("y", Z)]
                }
            }
            None => vec![("y", Z)],
        },
    }
}

/// Per-block runtime state (oracle `st.state`).
#[derive(Debug, Default, Clone, PartialEq)]
pub struct BlockState {
    /// DFF: previous clock value (init 0 — oracle `ctx.state.lastClk = 0`).
    pub dff_last_clk: LogicValue,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::radix::Radix;
    use std::collections::HashMap;
    use LogicValue::Digit;

    fn inputs(pairs: &[(&'static str, u8)]) -> HashMap<&'static str, LogicValue> {
        pairs
            .iter()
            .map(|(k, v)| (*k, LogicValue::Digit(*v)))
            .collect()
    }

    fn eval1(
        kind: ComponentKind,
        radix: crate::radix::Radix,
        pairs: &[(&'static str, u8)],
    ) -> Vec<(&'static str, LogicValue)> {
        let mut st = BlockState::default();
        eval(
            kind,
            radix,
            &BlockParams::default(),
            &mut st,
            &inputs(pairs),
            None,
        )
    }

    #[test]
    fn gate_algebra_matches_the_documented_multivalued_definitions() {
        let r4 = Radix::Q4;
        assert_eq!(
            eval1(ComponentKind::And, r4, &[("a", 2), ("b", 3)]),
            vec![("y", Digit(2))]
        );
        assert_eq!(
            eval1(ComponentKind::Or, r4, &[("a", 1), ("b", 3)]),
            vec![("y", Digit(3))]
        );
        assert_eq!(
            eval1(ComponentKind::Nand, r4, &[("a", 2), ("b", 3)]),
            vec![("y", Digit(1))]
        );
        assert_eq!(
            eval1(ComponentKind::Nor, r4, &[("a", 1), ("b", 2)]),
            vec![("y", Digit(1))]
        );
        assert_eq!(
            eval1(ComponentKind::Xor, r4, &[("a", 3), ("b", 2)]),
            vec![("y", Digit(1))]
        );
        assert_eq!(
            eval1(ComponentKind::Xnor, r4, &[("a", 3), ("b", 2)]),
            vec![("y", Digit(2))]
        );
        assert_eq!(
            eval1(ComponentKind::Not, r4, &[("a", 1)]),
            vec![("y", Digit(2))]
        );
        assert_eq!(
            eval1(ComponentKind::Buf, r4, &[("a", 3)]),
            vec![("y", Digit(3))]
        );
        // XOR at r=2 is the classic XOR.
        let r2 = Radix::BINARY;
        assert_eq!(
            eval1(ComponentKind::Xor, r2, &[("a", 1), ("b", 1)]),
            vec![("y", Digit(0))]
        );
        assert_eq!(
            eval1(ComponentKind::Xor, r2, &[("a", 1), ("b", 0)]),
            vec![("y", Digit(1))]
        );
    }

    #[test]
    fn z_propagates_through_every_primitive() {
        let r4 = Radix::Q4;
        for kind in [
            ComponentKind::And,
            ComponentKind::Xor,
            ComponentKind::AddN,
            ComponentKind::Mux2,
            ComponentKind::Q4Mux4,
        ] {
            let out = eval1(kind, r4, &[]);
            for (_, v) in out {
                assert!(v.is_z(), "{:?} must propagate Z", kind);
            }
        }
    }

    #[test]
    fn addn_and_q4_half_adder_carry_arithmetic() {
        // Radix full adder: 3+2+0 @ R=4 → sum 1, cout 1.
        let out = eval1(
            ComponentKind::AddN,
            Radix::Q4,
            &[("a", 3), ("b", 2), ("cin", 0)],
        );
        assert_eq!(out, vec![("sum", Digit(1)), ("cout", Digit(1))]);
        // Q4 half adder (fixed base 4): 3+2 → S=1, C=1.
        let out = eval1(ComponentKind::Q4HalfAdder, Radix::Q4, &[("a", 3), ("b", 2)]);
        assert_eq!(out, vec![("sum", Digit(1)), ("carry", Digit(1))]);
        // Carry digit is 0/1 (verified SPICE: c = floor((A+B)/4)).
        let out = eval1(ComponentKind::Q4HalfAdder, Radix::Q4, &[("a", 3), ("b", 3)]);
        assert_eq!(out, vec![("sum", Digit(2)), ("carry", Digit(1))]);
        // Ternary half adder: 2+2 → S=1, C=1 ((4)/3 = 1).
        let out = eval1(
            ComponentKind::TernaryHalfAdder,
            Radix::TERNARY,
            &[("a", 2), ("b", 2)],
        );
        assert_eq!(out, vec![("sum", Digit(1)), ("carry", Digit(1))]);
    }

    #[test]
    fn q4_cells_match_the_verified_functions() {
        assert_eq!(
            eval1(ComponentKind::Q4Inv, Radix::Q4, &[("a", 3)]),
            vec![("y", Digit(0))]
        );
        assert_eq!(
            eval1(ComponentKind::Q4Inv, Radix::Q4, &[("a", 0)]),
            vec![("y", Digit(3))]
        );
        // mux4: out = d[sel] (verified candidate netlist).
        let out = eval1(
            ComponentKind::Q4Mux4,
            Radix::Q4,
            &[("sel", 2), ("d0", 0), ("d1", 1), ("d2", 2), ("d3", 3)],
        );
        assert_eq!(out, vec![("y", Digit(2))]);
        let out = eval1(
            ComponentKind::Q4Mux4,
            Radix::Q4,
            &[("sel", 0), ("d0", 0), ("d1", 1), ("d2", 2), ("d3", 3)],
        );
        assert_eq!(out, vec![("y", Digit(0))]);
        // thresh_det: valid Q4 level re-partitions to itself at the logic level.
        let out = eval1(ComponentKind::Q4ThreshDet, Radix::Q4, &[("a", 2)]);
        assert_eq!(out, vec![("y", Digit(2))]);
        // ternary_inv: 2 − Q.
        assert_eq!(
            eval1(ComponentKind::TernaryInv, Radix::TERNARY, &[("a", 0)]),
            vec![("y", Digit(2))]
        );
        assert_eq!(
            eval1(ComponentKind::TernaryInv, Radix::TERNARY, &[("a", 2)]),
            vec![("y", Digit(0))]
        );
    }

    #[test]
    fn dff_samples_only_on_the_rising_edge_of_the_clk_event() {
        let mut st = BlockState {
            dff_last_clk: Digit(0),
        };
        let mut ins = inputs(&[("d", 1), ("clk", 1)]);
        // clk event (changed = clk): rising 0 → 3(Q4)… at R=2: 0 → 1.
        let out = eval(
            ComponentKind::Dff,
            Radix::BINARY,
            &BlockParams::default(),
            &mut st,
            &ins,
            Some("clk"),
        );
        assert_eq!(out, vec![("q", Digit(1))]);
        assert_eq!(st.dff_last_clk, Digit(1));
        // d event alone must NOT retrigger.
        ins.insert("d", Digit(0));
        let out = eval(
            ComponentKind::Dff,
            Radix::BINARY,
            &BlockParams::default(),
            &mut st,
            &ins,
            Some("d"),
        );
        assert!(out.is_empty());
        // Falling edge: no sample.
        ins.insert("clk", Digit(0));
        let out = eval(
            ComponentKind::Dff,
            Radix::BINARY,
            &BlockParams::default(),
            &mut st,
            &ins,
            Some("clk"),
        );
        assert!(out.is_empty());
        assert_eq!(st.dff_last_clk, Digit(0));
        // Second rising edge samples the NEW d.
        ins.insert("clk", Digit(1));
        let out = eval(
            ComponentKind::Dff,
            Radix::BINARY,
            &BlockParams::default(),
            &mut st,
            &ins,
            Some("clk"),
        );
        assert_eq!(out, vec![("q", Digit(0))]);
    }

    #[test]
    fn cmpn_and_mux2_semantics() {
        let out = eval1(ComponentKind::CmpN, Radix::Q4, &[("a", 3), ("b", 1)]);
        assert_eq!(out, vec![("gt", Digit(3)), ("eq", Digit(0))]);
        let out = eval1(ComponentKind::CmpN, Radix::Q4, &[("a", 2), ("b", 2)]);
        assert_eq!(out, vec![("gt", Digit(0)), ("eq", Digit(3))]);
        // MUX2: sel=0 → a, else b (oracle `sel === 0 ? a : b`).
        assert_eq!(
            eval1(
                ComponentKind::Mux2,
                Radix::BINARY,
                &[("sel", 0), ("a", 1), ("b", 0)]
            ),
            vec![("y", Digit(1))]
        );
        assert_eq!(
            eval1(
                ComponentKind::Mux2,
                Radix::BINARY,
                &[("sel", 1), ("a", 1), ("b", 0)]
            ),
            vec![("y", Digit(0))]
        );
    }
}
