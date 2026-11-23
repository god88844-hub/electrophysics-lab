//! Hierarchical ALU templates using sealed WP-3.3 IC packages.
//!
//! Operands and results are little-endian: a0/b0/y0 are least significant.
//! Binary op (op2:op1:op0): ADD, SUB, AND, OR, XOR, CMP, reserved, reserved.
//! SUB carry means no borrow. Overflow is two's-complement overflow; CMP is
//! unsigned and drives less/equal. Result and unused flags are zero for CMP.
//!
//! Ternary op (3*op1+op0): ADD, MIN, MAX, INV, CMP, then reserved. Balanced
//! trits 0/1/2 encode -1/0/+1, including carry. MIN and MAX compare whole words.
//! CMP returns 0/1/2 in y0 for less/equal/greater (a relation code in both modes).
//!
//! Q4 op: ADD, INV, MUX, CMP. MUX sel=0/1/2/3 selects A/B/INV(A)/INV(B).
//! ADD produces one base-4 digit and a carry. Q4 CMP uses the same codes as
//! ternary. Inactive carries and reserved data outputs encode numeric zero.

use crate::characterize::TimingLibrary;
use crate::components::{self, BlockParams, BlockState, ComponentKind};
use crate::packager::{
    hd_footprint, Circuit, Conditions, Connection, CustomIcPackage, Direction, Endpoint, Footprint,
    Instance, PackageError, PackageSpec, Packager, Pin, Registry, Status,
};
use crate::{radix, LogicValue, Radix};

type Result<T> = std::result::Result<T, PackageError>;

const NAND: &str = "alu_bin_nand";
const NOT: &str = "alu_bin_inv";
const AND: &str = "alu_bin_and";
const OR: &str = "alu_bin_or";
const XOR: &str = "alu_bin_xor";
const BIN_HALF: &str = "alu_bin_half";
const BIN_FULL: &str = "alu_bin_full";
const BIN_MUX: &str = "alu_bin_mux";
const TERNARY_INV: &str = "alu_ternary_inv";
const TERNARY_MUX: &str = "alu_ternary_mux";
const TERNARY_CMP: &str = "alu_ternary_cmp";
const TERNARY_JOIN: &str = "alu_ternary_compare_words";
const Q4_THRESH: &str = "alu_q4_threshold";
const Q4_INV: &str = "alu_q4_inv";
const Q4_MUX: &str = "alu_q4_mux";
const Q4_HALF: &str = "alu_q4_half";
const Q4_CMP: &str = "alu_q4_cmp";
const Q4_ZERO: &str = "alu_q4_zero";

const BASELINES: &str = "data/reference-library/03_multiradix_logic_baselines.json and data/reference-library/08_standard_and_multiradix_cells.json";
const AB_Y: &[&str] = &["a", "b", "y"];
const AB_SUM: &[&str] = &["a", "b", "sum", "carry"];
const ABC_SUM: &[&str] = &["a", "b", "cin", "sum", "carry"];
const MUX_INPUTS: &[&str] = &["sel", "d0", "d1", "d2", "y"];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AluFamily {
    Binary,
    TernaryBalanced,
    TernaryUnbalanced,
    Q4,
}

impl AluFamily {
    pub fn radix(self) -> u32 {
        match self {
            Self::Binary => 2,
            Self::TernaryBalanced | Self::TernaryUnbalanced => 3,
            Self::Q4 => 4,
        }
    }

    /// Primary radix-economy metric E(R) = R/ln(R), from the sealed 03 baseline.
    pub fn radix_economy(self) -> f64 {
        radix::radix_economy(self.radix())
    }

    fn name(self) -> &'static str {
        match self {
            Self::Binary => "binary",
            Self::TernaryBalanced => "balanced_ternary",
            Self::TernaryUnbalanced => "unbalanced_ternary",
            Self::Q4 => "q4",
        }
    }

    /// Digit width of each template: two binary/ternary digits, one Q4 digit.
    pub fn width(self) -> usize {
        match self {
            Self::Q4 => 1,
            _ => 2,
        }
    }
}

/// A reusable composer retains every dependency needed to install or resolve
/// the returned IC. Footprints are caller-declared envelopes (no inferred
/// placement or parasitics); binary leaf footprints use the sealed HD cells.
pub struct AluComposer<'a> {
    packager: Packager<'a>,
    conditions: Conditions,
    footprint: Footprint,
    checked_at: &'a str,
    registry: Registry,
}

impl<'a> AluComposer<'a> {
    pub fn new(
        library: &'a TimingLibrary,
        conditions: Conditions,
        footprint: Footprint,
        checked_at: &'a str,
    ) -> Result<Self> {
        radix::verify_embedded_reference().map_err(|e| PackageError(e.to_string()))?;
        Ok(Self {
            packager: Packager::new(library),
            conditions,
            footprint,
            checked_at,
            registry: Registry::new(),
        })
    }

    /// Compose a supported template and return its registry ID.
    pub fn compose(&mut self, family: AluFamily) -> Result<String> {
        let id = format!("alu_{}", family.name());
        if !self.registry.contains_key(&id) {
            let circuit = match family {
                AluFamily::Binary => self.binary()?,
                AluFamily::TernaryBalanced => self.ternary(true)?,
                AluFamily::TernaryUnbalanced => self.ternary(false)?,
                AluFamily::Q4 => self.q4()?,
            };
            self.hierarchy(&id, circuit)?;
        }
        Ok(id)
    }

    pub fn registry(&self) -> &Registry {
        &self.registry
    }

    pub fn into_registry(self) -> Registry {
        self.registry
    }

    fn install(&mut self, package: CustomIcPackage) -> Result<()> {
        if package.verification.status != Status::Verified {
            return Err(PackageError(format!(
                "ALU cell {} did not verify",
                package.ic_id
            )));
        }
        self.registry.insert(package.ic_id.clone(), package);
        Ok(())
    }

    fn package_spec(&self) -> PackageSpec<'a> {
        PackageSpec {
            conditions: self.conditions.clone(),
            footprint: self.footprint.clone(),
            checked_at: self.checked_at,
        }
    }

    fn hierarchy(&mut self, id: &str, circuit: Netlist) -> Result<()> {
        if !self.registry.contains_key(id) {
            let spec = self.package_spec();
            let package = self
                .packager
                .package_reconvergent(id, circuit.0, &self.registry, spec)
                .map_err(|error| PackageError(format!("{id}: {error}")))?;
            self.install(package)?;
        }
        Ok(())
    }

    fn primitive(
        &mut self,
        id: &str,
        kind: ComponentKind,
        radix: u32,
        footprint: Footprint,
    ) -> Result<()> {
        if !self.registry.contains_key(id) {
            let package = self.packager.package_primitive(
                id,
                kind,
                radix,
                self.conditions.clone(),
                footprint,
                self.checked_at,
            )?;
            self.install(package)?;
        }
        Ok(())
    }

    fn logical(
        &mut self,
        id: &str,
        radix: u32,
        names: &[&str],
        input_count: usize,
        truth: impl Fn(&[u8]) -> Vec<u8>,
    ) -> Result<()> {
        if !self.registry.contains_key(id) {
            let package = self.packager.package_logical(
                id,
                pins(radix, names, input_count)?,
                truth,
                BASELINES,
                self.package_spec(),
            )?;
            self.install(package)?;
        }
        Ok(())
    }

    fn binary_leaves(&mut self) -> Result<()> {
        let depth = self.footprint.dimensions_um.depth;
        self.primitive(
            NAND,
            ComponentKind::Nand,
            2,
            hd_footprint("sky130_fd_sc_hd__nand2_1", depth)?,
        )?;
        self.primitive(
            NOT,
            ComponentKind::Not,
            2,
            hd_footprint("sky130_fd_sc_hd__inv_1", depth)?,
        )?;

        let [a, b] = boundary(["a", "b"]);
        let mut gate = Netlist::new(2, AB_Y, 2)?;
        let n = gate.pair(NAND, &a, &b);
        let y = gate.unary(NOT, &n);
        gate.output("y", y);
        self.hierarchy(AND, gate)?;

        let mut gate = Netlist::new(2, AB_Y, 2)?;
        let na = gate.unary(NOT, &a);
        let nb = gate.unary(NOT, &b);
        let y = gate.pair(NAND, &na, &nb);
        gate.output("y", y);
        self.hierarchy(OR, gate)?;

        let mut gate = Netlist::new(2, AB_Y, 2)?;
        let n = gate.pair(NAND, &a, &b);
        let left = gate.pair(NAND, &a, &n);
        let right = gate.pair(NAND, &b, &n);
        let y = gate.pair(NAND, &left, &right);
        gate.output("y", y);
        self.hierarchy(XOR, gate)?;

        let mut half = Netlist::new(2, AB_SUM, 2)?;
        let sum = half.pair(XOR, &a, &b);
        let carry = half.pair(AND, &a, &b);
        half.output("sum", sum);
        half.output("carry", carry);
        self.hierarchy(BIN_HALF, half)?;

        self.full_adder(2, BIN_FULL, BIN_HALF, OR, "y")?;

        // 2:1 multiplexer made from the same characterized NAND/inverter leaves.
        let [sel, d0, d1] = boundary(["sel", "d0", "d1"]);
        let mut mux = Netlist::new(2, &["sel", "d0", "d1", "y"], 3)?;
        let not_sel = mux.unary(NOT, &sel);
        let low = mux.pair(NAND, &not_sel, &d0);
        let high = mux.pair(NAND, &sel, &d1);
        let y = mux.pair(NAND, &low, &high);
        mux.output("y", y);
        self.hierarchy(BIN_MUX, mux)
    }

    fn full_adder(
        &mut self,
        radix: u32,
        full: &str,
        half: &str,
        combine: &str,
        combine_pin: &str,
    ) -> Result<()> {
        let [a, b, cin] = boundary(["a", "b", "cin"]);
        let mut net = Netlist::new(radix, ABC_SUM, 3)?;
        let [partial, c0] = net.half(half, &a, &b);
        let [sum, c1] = net.half(half, &partial, &cin);
        let [carry] = net.place(combine, [("a", &c0), ("b", &c1)], [combine_pin]);
        net.output("sum", sum);
        net.output("carry", carry);
        self.hierarchy(full, net)
    }

    fn binary(&mut self) -> Result<Netlist> {
        self.binary_leaves()?;
        let [a0, a1, b0, b1, op0, op1, op2] =
            boundary(["a0", "a1", "b0", "b1", "op0", "op1", "op2"]);
        let mut net = Netlist::new(
            2,
            &[
                "a0", "a1", "b0", "b1", "op0", "op1", "op2", "y0", "y1", "carry", "overflow",
                "less", "equal",
            ],
            7,
        )?;
        let not_op1 = net.unary(NOT, &op1);
        let not_op0 = net.unary(NOT, &op0);
        let zero = net.pair(AND, &op0, &not_op0);

        let mut carry = op0.clone();
        let mut carry_into_msb = carry.clone();
        let mut difference = Vec::new();
        for (a, b, out) in [(&a0, &b0, "y0"), (&a1, &b1, "y1")] {
            let arithmetic_b = net.pair(XOR, b, &op0);
            carry_into_msb = carry;
            let [sum, next_carry] = net.place(
                BIN_FULL,
                [("a", a), ("b", &arithmetic_b), ("cin", &carry_into_msb)],
                ["sum", "carry"],
            );
            carry = next_carry;
            let both = net.pair(AND, a, b);
            let either = net.pair(OR, a, b);
            let xor = net.pair(XOR, a, b);
            let and_or = net.mux2(&op0, &both, &either);
            let low_bank = net.mux2(&op1, &sum, &and_or);
            let xor_or_cmp = net.mux2(&op0, &xor, &zero);
            let high_bank = net.mux2(&op1, &xor_or_cmp, &zero);
            let y = net.mux2(&op2, &low_bank, &high_bank);
            net.output(out, y);
            difference.push(xor);
        }

        let flag_block = net.pair(OR, &op1, &op2);
        let enable_arithmetic = net.unary(NOT, &flag_block);
        let overflow = net.pair(XOR, &carry_into_msb, &carry);
        let carry_flag = net.pair(AND, &enable_arithmetic, &carry);
        let overflow_flag = net.pair(AND, &enable_arithmetic, &overflow);
        let compare_bank = net.pair(AND, &op2, &not_op1);
        let enable_cmp = net.pair(AND, &compare_bank, &op0);
        let borrowed = net.unary(NOT, &carry);
        let any_diff = net.pair(OR, &difference[0], &difference[1]);
        let same = net.unary(NOT, &any_diff);
        let less = net.pair(AND, &enable_cmp, &borrowed);
        let equal = net.pair(AND, &enable_cmp, &same);
        net.output("carry", carry_flag);
        net.output("overflow", overflow_flag);
        net.output("less", less);
        net.output("equal", equal);
        Ok(net)
    }

    fn ternary(&mut self, balanced: bool) -> Result<Netlist> {
        let (half, full, tie, zero) = if balanced {
            (
                "alu_balanced_half",
                "alu_balanced_full",
                "alu_balanced_zero",
                1,
            )
        } else {
            (
                "alu_unbalanced_half",
                "alu_unbalanced_full",
                "alu_unbalanced_zero",
                0,
            )
        };
        self.logical(TERNARY_INV, 3, &["a", "y"], 1, |v| {
            ternary_reference(ComponentKind::TernaryInv, &["a"], &["y"], v)
        })?;
        self.logical(half, 3, AB_SUM, 2, |v| {
            if balanced {
                let sum = i16::from(v[0]) + i16::from(v[1]) - 2;
                let digit = (sum + 1).rem_euclid(3) - 1;
                vec![(digit + 1) as u8, ((sum - digit) / 3 + 1) as u8]
            } else {
                ternary_reference(
                    ComponentKind::TernaryHalfAdder,
                    &["a", "b"],
                    &["sum", "carry"],
                    v,
                )
            }
        })?;
        // The two half-adder carries sum to a representable digit. The same
        // half-adder's sum port combines them for both digit conventions.
        self.full_adder(3, full, half, half, "sum")?;
        self.logical(tie, 3, &["a", "y"], 1, |_| vec![zero])?;
        self.logical(TERNARY_MUX, 3, MUX_INPUTS, 4, |v| {
            vec![v[usize::from(v[0]) + 1]]
        })?;
        self.logical(TERNARY_CMP, 3, AB_Y, 2, relation)?;
        self.logical(TERNARY_JOIN, 3, AB_Y, 2, |v| {
            vec![if v[0] == 1 { v[1] } else { v[0] }]
        })?;

        let [a0, a1, b0, b1, op0, op1] = boundary(["a0", "a1", "b0", "b1", "op0", "op1"]);
        let mut net = Netlist::new(
            3,
            &["a0", "a1", "b0", "b1", "op0", "op1", "y0", "y1", "carry"],
            6,
        )?;
        let zero = net.unary(tie, &op0);
        let [sum0, carry0] = net.half(half, &a0, &b0);
        let [sum1, carry1] = net.place(
            full,
            [("a", &a1), ("b", &b1), ("cin", &carry0)],
            ["sum", "carry"],
        );
        let low = net.pair(TERNARY_CMP, &a0, &b0);
        let high = net.pair(TERNARY_CMP, &a1, &b1);
        let compare = net.pair(TERNARY_JOIN, &high, &low);
        for (a, b, sum, cmp, out) in [
            (&a0, &b0, &sum0, &compare, "y0"),
            (&a1, &b1, &sum1, &zero, "y1"),
        ] {
            let min = net.mux3(&compare, a, a, b);
            let max = net.mux3(&compare, b, b, a);
            let inv = net.unary(TERNARY_INV, a);
            let bank0 = net.mux3(&op0, sum, &min, &max);
            let bank1 = net.mux3(&op0, &inv, cmp, &zero);
            let y = net.mux3(&op1, &bank0, &bank1, &zero);
            net.output(out, y);
        }
        let add_carry = net.mux3(&op0, &carry1, &zero, &zero);
        let carry = net.mux3(&op1, &add_carry, &zero, &zero);
        net.output("carry", carry);
        Ok(net)
    }

    fn q4(&mut self) -> Result<Netlist> {
        for (id, kind) in [
            (Q4_THRESH, ComponentKind::Q4ThreshDet),
            (Q4_INV, ComponentKind::Q4Inv),
            (Q4_MUX, ComponentKind::Q4Mux4),
            (Q4_HALF, ComponentKind::Q4HalfAdder),
        ] {
            self.primitive(id, kind, 4, self.footprint.clone())?;
        }
        self.logical(Q4_CMP, 4, AB_Y, 2, relation)?;
        self.logical(Q4_ZERO, 4, &["a", "y"], 1, |_| vec![0])?;

        let [a, b, op, sel] = boundary(["a0", "b0", "op0", "sel"]);
        let mut net = Netlist::new(4, &["a0", "b0", "op0", "sel", "y0", "carry"], 4)?;
        let op = net.unary(Q4_THRESH, &op);
        let sel = net.unary(Q4_THRESH, &sel);
        let [sum, add_carry] = net.half(Q4_HALF, &a, &b);
        let inv_a = net.unary(Q4_INV, &a);
        let inv_b = net.unary(Q4_INV, &b);
        let compare = net.pair(Q4_CMP, &a, &b);
        let selected = net.mux4(&sel, &a, &b, &inv_a, &inv_b);
        let y = net.mux4(&op, &sum, &inv_a, &selected, &compare);
        let zero = net.unary(Q4_ZERO, &a);
        let carry = net.mux4(&op, &add_carry, &zero, &zero, &zero);
        net.output("y0", y);
        net.output("carry", carry);
        Ok(net)
    }
}

fn relation(v: &[u8]) -> Vec<u8> {
    vec![match v[0].cmp(&v[1]) {
        std::cmp::Ordering::Less => 0,
        std::cmp::Ordering::Equal => 1,
        std::cmp::Ordering::Greater => 2,
    }]
}

fn ternary_reference(
    kind: ComponentKind,
    in_names: &[&'static str],
    out_names: &[&str],
    digits: &[u8],
) -> Vec<u8> {
    let input = in_names
        .iter()
        .copied()
        .zip(digits.iter().copied().map(LogicValue::Digit))
        .collect();
    let result = components::eval(
        kind,
        Radix::TERNARY,
        &BlockParams::defaults_for(kind),
        &mut BlockState::default(),
        &input,
        None,
    );
    out_names
        .iter()
        .map(|out| {
            result
                .iter()
                .find(|(name, _)| name == out)
                .and_then(|(_, value)| value.digit())
                .expect("ternary reference must drive each output for valid digits")
        })
        .collect()
}

fn pins(radix: u32, names: &[&str], input_count: usize) -> Result<Vec<Pin>> {
    names
        .iter()
        .enumerate()
        .map(|(i, name)| {
            let direction = if i < input_count {
                Direction::Input
            } else {
                Direction::Output
            };
            Pin::digital(name, direction, radix)
        })
        .collect()
}

fn boundary<const N: usize>(names: [&str; N]) -> [Endpoint; N] {
    names.map(Endpoint::boundary)
}

struct Netlist(Circuit);

impl Netlist {
    fn new(radix: u32, names: &[&str], input_count: usize) -> Result<Self> {
        Ok(Self(Circuit {
            pins: pins(radix, names, input_count)?,
            instances: Vec::new(),
            wires: Vec::new(),
        }))
    }

    fn place<const N: usize, const M: usize>(
        &mut self,
        ic: &str,
        inputs: [(&str, &Endpoint); N],
        outputs: [&str; M],
    ) -> [Endpoint; M] {
        let id = format!("{ic}_{}", self.0.instances.len());
        self.0.wires.extend(inputs.map(|(port, source)| Connection {
            from: source.clone(),
            to: Endpoint::at(&id, port),
        }));
        let endpoints = outputs.map(|port| Endpoint::at(&id, port));
        self.0.instances.push(Instance {
            id,
            ic_id: ic.into(),
        });
        endpoints
    }

    fn output(&mut self, name: &str, from: Endpoint) {
        self.0.wires.push(Connection {
            from,
            to: Endpoint::boundary(name),
        });
    }

    fn unary(&mut self, id: &str, a: &Endpoint) -> Endpoint {
        let [y] = self.place(id, [("a", a)], ["y"]);
        y
    }

    fn pair(&mut self, id: &str, a: &Endpoint, b: &Endpoint) -> Endpoint {
        let [y] = self.place(id, [("a", a), ("b", b)], ["y"]);
        y
    }

    fn half(&mut self, id: &str, a: &Endpoint, b: &Endpoint) -> [Endpoint; 2] {
        self.place(id, [("a", a), ("b", b)], ["sum", "carry"])
    }

    fn mux2(&mut self, sel: &Endpoint, d0: &Endpoint, d1: &Endpoint) -> Endpoint {
        let [y] = self.place(BIN_MUX, [("sel", sel), ("d0", d0), ("d1", d1)], ["y"]);
        y
    }

    fn mux3(&mut self, sel: &Endpoint, d0: &Endpoint, d1: &Endpoint, d2: &Endpoint) -> Endpoint {
        let [y] = self.place(
            TERNARY_MUX,
            [("sel", sel), ("d0", d0), ("d1", d1), ("d2", d2)],
            ["y"],
        );
        y
    }

    fn mux4(
        &mut self,
        sel: &Endpoint,
        d0: &Endpoint,
        d1: &Endpoint,
        d2: &Endpoint,
        d3: &Endpoint,
    ) -> Endpoint {
        let [y] = self.place(
            Q4_MUX,
            [("sel", sel), ("d0", d0), ("d1", d1), ("d2", d2), ("d3", d3)],
            ["y"],
        );
        y
    }
}
