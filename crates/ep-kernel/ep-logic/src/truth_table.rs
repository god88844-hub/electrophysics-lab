//! Exhaustive truth-table checking — the Rust mirror of Phase 0
//! `engine.js truthTableTest`: enumerate every input digit combination at a
//! radix (LSB-first over the input ports, matching the oracle's enumeration
//! order) and compare against an independently supplied reference function.

use crate::components::{eval, BlockParams, BlockState, ComponentKind};
use crate::radix::Radix;
use crate::value::LogicValue;
use serde::Serialize;

/// Independently-written reference function (oracle `refFn`): input digits +
/// radix → expected `(port, value)` pairs.
pub type ReferenceFn<'a> = &'a dyn Fn(&[u8], Radix) -> Vec<(&'static str, LogicValue)>;

/// Owned boxed reference closure (test helpers).
pub type BoxedReferenceFn = Box<dyn Fn(&[u8], Radix) -> Vec<(&'static str, LogicValue)>>;

/// One truth-table row (oracle `rows` entry).
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct TruthRow {
    /// Input digits, LSB-first over the declared input ports.
    pub inputs: Vec<u8>,
    /// Evaluated outputs in port order.
    pub got: Vec<(&'static str, LogicValue)>,
    /// Reference outputs (same order as `got`).
    pub expected: Vec<(&'static str, LogicValue)>,
    pub ok: bool,
}

/// Exhaustive truth table for one primitive at one radix.
///
/// `reference(inputs, radix)` returns the expected `(port, value)` pairs in
/// the same order as the primitive's eval — an independently written
/// specification, exactly like the oracle's `refFn`.
pub fn truth_table(kind: ComponentKind, radix: Radix, reference: ReferenceFn<'_>) -> TruthTable {
    let ports = kind.input_ports().to_vec();
    let k = ports.len();
    let total = (radix.get() as u64).pow(k as u32);
    let mut rows = Vec::with_capacity(total as usize);
    let mut mismatches = 0u64;
    for i in 0..total {
        let mut digits = vec![0u8; k];
        let mut x = i;
        for slot in digits.iter_mut() {
            *slot = (x % u64::from(radix.get())) as u8;
            x /= u64::from(radix.get());
        }
        let inputs: std::collections::HashMap<&'static str, LogicValue> = ports
            .iter()
            .copied()
            .zip(digits.iter().copied().map(LogicValue::Digit))
            .collect();
        let mut state = BlockState::default();
        let got = eval(
            kind,
            radix,
            &BlockParams::default(),
            &mut state,
            &inputs,
            None,
        );
        let expected = reference(&digits, radix);
        let ok = got == expected;
        if !ok {
            mismatches += 1;
        }
        rows.push(TruthRow {
            inputs: digits,
            got,
            expected,
            ok,
        });
    }
    TruthTable {
        type_id: kind.type_id(),
        radix,
        total_rows: rows.len() as u64,
        pass: mismatches == 0,
        rows,
    }
}

/// A completed truth table with its pass verdict.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct TruthTable {
    pub type_id: &'static str,
    pub radix: Radix,
    pub total_rows: u64,
    pub pass: bool,
    pub rows: Vec<TruthRow>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use LogicValue::{Digit, Z};

    fn ref_gate2(name: &str) -> impl Fn(&[u8], Radix) -> Vec<(&'static str, LogicValue)> + '_ {
        move |d, r| {
            let top = r.max_digit();
            let y = match name {
                "logic.AND" => Digit(d[0].min(d[1])),
                "logic.OR" => Digit(d[0].max(d[1])),
                "logic.NAND" => Digit(top - d[0].min(d[1])),
                "logic.NOR" => Digit(top - d[0].max(d[1])),
                "logic.XOR" => Digit((d[0] + d[1]) % r.get() as u8),
                "logic.XNOR" => Digit(top - (d[0] + d[1]) % r.get() as u8),
                "logic.NOT" => Digit(top - d[0]),
                "logic.BUF" => Digit(d[0]),
                _ => panic!(),
            };
            vec![("y", y)]
        }
    }

    /// The oracle's own reference table (tests/core.test.mjs REF) across
    /// Binary/Ternary/Q4 — the exact parity contract.
    #[test]
    fn all_standard_gates_match_the_reference_across_binary_ternary_q4() {
        const GATES: [(&str, ComponentKind); 8] = [
            ("logic.AND", ComponentKind::And),
            ("logic.OR", ComponentKind::Or),
            ("logic.NAND", ComponentKind::Nand),
            ("logic.NOR", ComponentKind::Nor),
            ("logic.XOR", ComponentKind::Xor),
            ("logic.XNOR", ComponentKind::Xnor),
            ("logic.NOT", ComponentKind::Not),
            ("logic.BUF", ComponentKind::Buf),
        ];
        for (name, kind) in GATES {
            for radix in [Radix::BINARY, Radix::TERNARY, Radix::Q4] {
                let t = truth_table(kind, radix, &ref_gate2(name));
                assert!(t.pass, "{} @ R={} has mismatches", name, radix.get());
                let expected_rows =
                    u64::from(radix.get()).pow(if name == "logic.NOT" || name == "logic.BUF" {
                        1
                    } else {
                        2
                    });
                assert_eq!(t.total_rows, expected_rows);
            }
        }
    }

    #[test]
    fn addn_matches_reference_arithmetic_for_radix_2_3_4_and_custom_5() {
        for radix in [
            Radix::BINARY,
            Radix::TERNARY,
            Radix::Q4,
            Radix::new(5).unwrap(),
        ] {
            let t = truth_table(ComponentKind::AddN, radix, &|d, r| {
                let s = d[0] + d[1] + d[2];
                vec![
                    ("sum", Digit(s % r.get() as u8)),
                    ("cout", Digit(s / r.get() as u8)),
                ]
            });
            assert!(t.pass, "ADDN @ R={}", radix.get());
            assert_eq!(t.total_rows, u64::from(radix.get()).pow(3));
        }
    }

    #[test]
    fn q4_cells_exhaustive_truth_tables() {
        // q4_inv: Q_out = 3 − Q_in.
        let t = truth_table(ComponentKind::Q4Inv, Radix::Q4, &|d, _| {
            vec![("y", Digit(3 - d[0]))]
        });
        assert!(t.pass);
        assert_eq!(t.total_rows, 4);
        // q4_half_adder: S = (A+B) mod 4, C = ⌊(A+B)/4⌋ (carry digit 0/1).
        let t = truth_table(ComponentKind::Q4HalfAdder, Radix::Q4, &|d, _| {
            let s = d[0] + d[1];
            vec![("sum", Digit(s % 4)), ("carry", Digit(s / 4))]
        });
        assert!(t.pass);
        assert_eq!(t.total_rows, 16);
        // q4_mux4: out = d[sel] for sel 0..3 (verified candidate netlist).
        let t = truth_table(ComponentKind::Q4Mux4, Radix::Q4, &|d, _| {
            let data = [d[1], d[2], d[3], d[4]];
            if usize::from(d[0]) < 4 {
                vec![("y", Digit(data[usize::from(d[0])]))]
            } else {
                vec![("y", Z)]
            }
        });
        assert!(t.pass);
        assert_eq!(t.total_rows, 4 * 4 * 4 * 4 * 4);
        // Every in-range selector row drives exactly the selected data digit.
        for row in &t.rows {
            let sel = row.inputs[0];
            let got = row.got[0].1;
            let expected = if usize::from(sel) < 4 {
                Digit(row.inputs[1 + usize::from(sel)])
            } else {
                Z
            };
            assert_eq!(got, expected);
        }
        // q4_thresh_det: identity at the logic level (nearest-partition bridge
        // is voltage-domain, radix.rs).
        let t = truth_table(ComponentKind::Q4ThreshDet, Radix::Q4, &|d, _| {
            vec![("y", Digit(d[0]))]
        });
        assert!(t.pass);
        // ternary_half_adder: S = (A+B) mod 3, C = ⌊(A+B)/3⌋.
        let t = truth_table(ComponentKind::TernaryHalfAdder, Radix::TERNARY, &|d, _| {
            let s = d[0] + d[1];
            vec![("sum", Digit(s % 3)), ("carry", Digit(s / 3))]
        });
        assert!(t.pass);
        assert_eq!(t.total_rows, 9);
        // ternary_inv: 2 − Q.
        let t = truth_table(ComponentKind::TernaryInv, Radix::TERNARY, &|d, _| {
            vec![("y", Digit(2 - d[0]))]
        });
        assert!(t.pass);
    }

    #[test]
    fn custom_radix_truth_tables_are_exhaustive() {
        // Custom R=5: gate algebra generalizes; XOR is addition mod 5.
        let r5 = Radix::new(5).unwrap();
        let t = truth_table(ComponentKind::Xor, r5, &|d, r| {
            vec![("y", Digit((d[0] + d[1]) % r.get() as u8))]
        });
        assert!(t.pass);
        assert_eq!(t.total_rows, 25);
        let t = truth_table(ComponentKind::Nand, r5, &|d, r| {
            vec![("y", Digit(r.max_digit() - d[0].min(d[1])))]
        });
        assert!(t.pass);
        // ADDN at R=5: cout can be 2 (4+4+4 = 12 → sum 2, cout 2).
        let t = truth_table(ComponentKind::AddN, r5, &|d, r| {
            let s = d[0] + d[1] + d[2];
            vec![
                ("sum", Digit(s % r.get() as u8)),
                ("cout", Digit(s / r.get() as u8)),
            ]
        });
        assert!(t.pass);
        let top_row = t.rows.last().unwrap();
        assert_eq!(top_row.inputs, vec![4, 4, 4]);
        assert_eq!(top_row.got, vec![("sum", Digit(2)), ("cout", Digit(2))]);
    }

    #[test]
    fn a_deliberately_wrong_reference_fails_the_table() {
        let t = truth_table(ComponentKind::And, Radix::BINARY, &|d, _| {
            vec![("y", Digit(d[0] | d[1]))]
        });
        assert!(!t.pass, "OR-reference must not match AND");
        // (1,1) agrees (AND=1, OR=1); (0,1) and (1,0) mismatch.
        assert_eq!(t.rows.iter().filter(|r| !r.ok).count(), 2);
    }
}
