//! Hierarchical custom IC compiler and pin-level simulator (WP-3.3).
//!
//! Schema fields are camelCase. Extensions hold executable transition models,
//! leakage, source netlists, extraction conditions and verification evidence.
//! `wattsPerToggle` is energy in J (W per toggle/s); `power_w` multiplies it
//! by the declared cycle rate and adds DC leakage. No default timing tables.
//!
//! Extraction admits finite combinational circuits within explicit budgets.
//! Stateful/oscillating or uncharacterized circuits are refused, never stamped
//! VERIFIED. Q4 retains WP-3.2's unqualified stage-chain provenance. Custom
//! R=5..8 pins use the schema's analog domain with declared discrete levels.
//! The app composer consumes Progress and Verification; app UI is out of scope.

use crate::characterize::{self as ch, OperatingCorner, OutDir, TimingLibrary, TransientConfig};
use crate::components::{self, BlockParams, BlockState, ComponentKind, PortDir};
use crate::engine::{LogicDiagram, PortRef};
use crate::queue::{EventPayload, EventQueue};
use crate::{radix, LogicValue, Radix};
use ep_circuit::bsim::{self, BsimModelId};
use ep_core::reference::sha256_hex;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub const FORMAT: &str = "invention-lab/custom-ic/1";
pub const SCHEMA: &str = include_str!("../../../../docs/master-plan/schemas/custom-ic.schema.json");
const MAX_STATES: usize = 1024;
const MAX_TRANSITIONS: usize = 16384;
const MAX_INSTANCES: usize = 1024;
const MAX_DEPTH: usize = 64;
const MAX_EVENTS: usize = 250_000;

#[derive(Debug, Clone, PartialEq)]
pub struct PackageError(pub String);
impl std::fmt::Display for PackageError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}
impl std::error::Error for PackageError {}
type Result<T> = std::result::Result<T, PackageError>;
fn fail<T>(message: impl Into<String>) -> Result<T> {
    Err(PackageError(message.into()))
}
fn decoded<T: serde::de::DeserializeOwned>(v: Value) -> Result<T> {
    serde_json::from_value(v).map_err(|e| PackageError(e.to_string()))
}
fn encoded<T: Serialize>(v: &T) -> Result<Value> {
    serde_json::to_value(v).map_err(|e| PackageError(e.to_string()))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Direction {
    Input,
    Output,
    Inout,
    Power,
    Ground,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PinRadix {
    Binary,
    Ternary,
    Quaternary,
    Analog,
    Clock,
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Pin {
    pub name: String,
    pub direction: Direction,
    pub radix: PinRadix,
    pub voltage_levels_v: Vec<f64>,
}
impl Pin {
    pub fn digital(name: &str, direction: Direction, radix: u32) -> Result<Self> {
        if !(2..=8).contains(&radix) {
            return fail("pin radix must be in 2..8");
        }
        radix::verify_embedded_reference().map_err(|e| PackageError(e.to_string()))?;
        let r = Radix::new(radix).map_err(PackageError)?;
        Ok(Self {
            name: name.into(),
            direction,
            radix: match radix {
                2 => PinRadix::Binary,
                3 => PinRadix::Ternary,
                4 => PinRadix::Quaternary,
                _ => PinRadix::Analog,
            },
            voltage_levels_v: r.level_map(),
        })
    }
    pub fn digit_count(&self) -> usize {
        self.voltage_levels_v.len()
    }
    fn validate(&self) -> Result<()> {
        let n = self.digit_count();
        if self.name.is_empty() || !(2..=8).contains(&n) {
            return fail("digital pin requires name and 2..8 voltage levels");
        }
        let expected = match self.radix {
            PinRadix::Binary | PinRadix::Clock => 2,
            PinRadix::Ternary => 3,
            PinRadix::Quaternary => 4,
            PinRadix::Analog => n,
        };
        if n != expected {
            return fail(format!("pin {} radix/level count mismatch", self.name));
        }
        let vdd = *self.voltage_levels_v.last().unwrap();
        if !vdd.is_finite() || vdd <= 0.0 {
            return fail("invalid pin supply");
        }
        for (k, &v) in self.voltage_levels_v.iter().enumerate() {
            if !v.is_finite() || (v - k as f64 * vdd / (n - 1) as f64).abs() > 1e-9 {
                return fail(format!("pin {} violates L_k = k VDD/(R-1)", self.name));
            }
        }
        if !matches!(self.direction, Direction::Input | Direction::Output) {
            return fail("simulation requires directed digital boundary pins");
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DimensionsUm {
    pub w: f64,
    pub h: f64,
    pub depth: f64,
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Footprint {
    pub kind: String,
    pub dimensions_um: DimensionsUm,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parametric_spec_ref: Option<String>,
}
impl Footprint {
    pub fn custom(w: f64, h: f64, depth: f64) -> Self {
        Self {
            kind: "custom_rect".into(),
            dimensions_um: DimensionsUm { w, h, depth },
            parametric_spec_ref: None,
        }
    }
    pub fn dimensions_mm(&self) -> [f64; 3] {
        [
            self.dimensions_um.w / 1000.0,
            self.dimensions_um.h / 1000.0,
            self.dimensions_um.depth / 1000.0,
        ]
    }
}

/// Boundary endpoints have instance="". Namespaced instance IDs are opaque.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub struct Endpoint {
    pub instance: String,
    pub pin: String,
}
impl Endpoint {
    pub fn boundary(pin: &str) -> Self {
        Self::at("", pin)
    }
    pub fn at(instance: &str, pin: &str) -> Self {
        Self {
            instance: instance.into(),
            pin: pin.into(),
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub from: Endpoint,
    pub to: Endpoint,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Instance {
    pub id: String,
    pub ic_id: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Circuit {
    pub pins: Vec<Pin>,
    pub instances: Vec<Instance>,
    pub wires: Vec<Connection>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum Implementation {
    #[serde(rename = "netlist")]
    Netlist {
        components: Vec<Value>,
        wires: Vec<Value>,
        source: LeafSource,
    },
    #[serde(rename = "subICs")]
    SubIcs {
        #[serde(rename = "subICs")]
        sub_ics: Vec<String>,
        circuit: Circuit,
        #[serde(rename = "dependencySeals")]
        dependency_seals: BTreeMap<String, String>,
    },
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum LeafSource {
    Characterized {
        kind: String,
        radix: u32,
        cell: String,
    },
    Transistors {
        netlist: TransistorNetlist,
    },
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimingArc {
    pub from: String,
    pub to: String,
    pub delay_ns: f64,
    pub tolerance_pct: u8,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DynamicPower {
    pub watts_per_toggle: f64,
    pub tolerance_pct: u8,
    pub definition: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub inputs: Vec<u8>,
    pub outputs: Vec<u8>,
    pub leakage_w: Option<f64>,
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct OutputEvent {
    pub pin: String,
    pub value: u8,
    pub delay_ns: f64,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transition {
    pub before: Vec<u8>,
    pub after: Vec<u8>,
    pub events: Vec<OutputEvent>,
    /// Signed rail energy for this directed transition; a complete cycle is nonnegative.
    pub energy_j: f64,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Conditions {
    pub load_ff: f64,
    pub slew_ps: f64,
    pub corner: OperatingCorner,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MacroModel {
    pub timing_arcs: Vec<TimingArc>,
    pub dynamic_power: DynamicPower,
    pub leakage_power_w: Option<f64>,
    pub states: Vec<State>,
    pub transitions: Vec<Transition>,
    pub conditions: Conditions,
    pub provenance: Vec<String>,
}
impl MacroModel {
    pub fn power_w(&self, cycles_per_second: f64) -> Result<f64> {
        if !cycles_per_second.is_finite() || cycles_per_second < 0.0 {
            return fail("invalid cycle rate");
        }
        let leakage = self
            .leakage_power_w
            .ok_or_else(|| PackageError("leakage unavailable: INSUFFICIENT_MODEL_DATA".into()))?;
        Ok(leakage + self.dynamic_power.watts_per_toggle * cycles_per_second)
    }
    fn state(&self, inputs: &[u8]) -> Result<&State> {
        self.states
            .iter()
            .find(|s| s.inputs == inputs)
            .ok_or_else(|| PackageError("input state outside characterized model".into()))
    }
    fn transition(&self, before: &[u8], after: &[u8]) -> Result<Transition> {
        if before == after {
            return Ok(Transition {
                before: before.into(),
                after: after.into(),
                events: vec![],
                energy_j: 0.0,
            });
        }
        self.transitions
            .iter()
            .find(|t| t.before == before && t.after == after)
            .cloned()
            .ok_or_else(|| {
                PackageError(
                    "transition outside characterized model; change one pin at a time".into(),
                )
            })
    }
}
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Status {
    #[serde(rename = "VERIFIED_AGAINST_INTERNAL_SOLVE")]
    Verified,
    #[serde(rename = "STALE")]
    Stale,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Verification {
    pub status: Status,
    pub checked_at: String,
    pub timing_error_pct: f64,
    pub power_error_pct: f64,
    pub leakage_error_pct: f64,
    pub compared_transitions: usize,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomIcPackage {
    pub format: String,
    pub ic_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    pub pins: Vec<Pin>,
    pub radix_domain: String,
    pub implementation: Implementation,
    pub macro_model: MacroModel,
    pub footprint: Footprint,
    pub verification: Verification,
    pub content_seal: String,
}
pub type Registry = BTreeMap<String, CustomIcPackage>;
#[derive(Debug, Clone, PartialEq)]
pub struct Progress {
    pub stage: &'static str,
    pub completed: usize,
    pub total: usize,
}

/// Validates directly against the pinned schema, including every required
/// field and oneOf branch. No dependency or independently drifting schema copy.
pub fn validate_json(value: &Value) -> Result<()> {
    fn check(s: &Value, v: &Value, path: &str) -> Result<()> {
        let bad = || PackageError(format!("schema violation at {path}"));
        if let Some(t) = s.get("type").and_then(Value::as_str) {
            let ok = match t {
                "object" => v.is_object(),
                "array" => v.is_array(),
                "string" => v.is_string(),
                "number" => v.is_number(),
                _ => false,
            };
            if !ok {
                return Err(bad());
            }
        }
        if let Some(c) = s.get("const") {
            if c != v {
                return Err(bad());
            }
        }
        if let Some(e) = s.get("enum").and_then(Value::as_array) {
            if !e.contains(v) {
                return Err(bad());
            }
        }
        if let Some(o) = v.as_object() {
            if let Some(req) = s.get("required").and_then(Value::as_array) {
                for k in req {
                    if !o.contains_key(k.as_str().unwrap()) {
                        return fail(format!("{path}: missing {k}"));
                    }
                }
            }
            if let Some(props) = s.get("properties").and_then(Value::as_object) {
                for (k, ss) in props {
                    if let Some(vv) = o.get(k) {
                        check(ss, vv, &format!("{path}/{k}"))?;
                    }
                }
            }
        }
        if let Some(a) = v.as_array() {
            if s.get("minItems")
                .and_then(Value::as_u64)
                .is_some_and(|n| a.len() < n as usize)
            {
                return Err(bad());
            }
            if let Some(items) = s.get("items") {
                for (i, vv) in a.iter().enumerate() {
                    check(items, vv, &format!("{path}/{i}"))?;
                }
            }
        }
        if let Some(n) = v.as_f64() {
            if !n.is_finite()
                || s.get("minimum")
                    .and_then(Value::as_f64)
                    .is_some_and(|min| n < min)
            {
                return Err(bad());
            }
        }
        if let Some(st) = v.as_str() {
            if s.get("maxLength")
                .and_then(Value::as_u64)
                .is_some_and(|n| st.chars().count() > n as usize)
            {
                return Err(bad());
            }
            if s.get("pattern").is_some()
                && (st.is_empty()
                    || !st.bytes().all(|c| {
                        c.is_ascii_lowercase() || c.is_ascii_digit() || b"_-".contains(&c)
                    }))
            {
                return Err(bad());
            }
            if s.get("format").and_then(Value::as_str) == Some("date-time") && !date_time(st) {
                return Err(bad());
            }
        }
        if let Some(branches) = s.get("oneOf").and_then(Value::as_array) {
            if branches
                .iter()
                .filter(|b| check(b, v, path).is_ok())
                .count()
                != 1
            {
                return Err(bad());
            }
        }
        Ok(())
    }
    check(&serde_json::from_str::<Value>(SCHEMA).unwrap(), value, "$")
}
fn date_time(s: &str) -> bool {
    // RFC3339 calendar and timezone validation, including leap years.
    let b = s.as_bytes();
    if b.len() < 20
        || b[4] != b'-'
        || b[7] != b'-'
        || !b"Tt".contains(&b[10])
        || b[13] != b':'
        || b[16] != b':'
    {
        return false;
    }
    let num = |start: usize, end: usize| s.get(start..end).and_then(|v| v.parse::<u32>().ok());
    let (Some(y), Some(m), Some(d), Some(h), Some(min), Some(sec)) = (
        num(0, 4),
        num(5, 7),
        num(8, 10),
        num(11, 13),
        num(14, 16),
        num(17, 19),
    ) else {
        return false;
    };
    let leap = y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
    let days = match m {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 => {
            if leap {
                29
            } else {
                28
            }
        }
        _ => 0,
    };
    if d == 0 || d > days || h > 23 || min > 59 || sec > 59 {
        return false;
    }
    let mut i = 19;
    if b.get(i) == Some(&b'.') {
        i += 1;
        let start = i;
        while b.get(i).is_some_and(u8::is_ascii_digit) {
            i += 1;
        }
        if i == start {
            return false;
        }
    }
    if b.get(i).is_some_and(|c| b"Zz".contains(c)) {
        return i + 1 == b.len();
    }
    b.len() == i + 6
        && b.get(i).is_some_and(|c| b"+-".contains(c))
        && b[i + 3] == b':'
        && num(i + 1, i + 3).is_some_and(|n| n <= 23)
        && num(i + 4, i + 6).is_some_and(|n| n <= 59)
}
fn digest(p: &CustomIcPackage) -> Result<String> {
    let mut v = encoded(p)?;
    v.as_object_mut().unwrap().remove("contentSeal");
    // serde_json's sorted object maps give deterministic recursive key ordering.
    Ok(sha256_hex(
        &serde_json::to_vec(&v).map_err(|e| PackageError(e.to_string()))?,
    ))
}
fn seal(p: &mut CustomIcPackage) -> Result<()> {
    p.content_seal = digest(p)?;
    Ok(())
}
pub fn verify_seal(p: &CustomIcPackage) -> Result<()> {
    if p.content_seal.len() != 64 || p.content_seal != digest(p)? {
        return fail("content seal mismatch: STALE");
    }
    Ok(())
}
impl CustomIcPackage {
    pub fn from_json(value: Value) -> Result<Self> {
        validate_json(&value)?;
        let p: Self = decoded(value)?;
        p.validate()?;
        verify_seal(&p)?;
        Ok(p)
    }
    pub fn mark_stale(&mut self) {
        self.verification.status = Status::Stale;
    }
    pub fn validate(&self) -> Result<()> {
        validate_json(&encoded(self)?)?;
        validate_pins(&self.pins)?;
        if !self.footprint.dimensions_um.depth.is_finite()
            || self.footprint.dimensions_um.depth <= 0.0
        {
            return fail("invalid footprint depth");
        }
        if self.radix_domain != domain(&self.pins) {
            return fail("radixDomain disagrees with pins");
        }
        validate_model(&self.pins, &self.macro_model)?;
        match &self.implementation {
            Implementation::Netlist {
                components,
                wires,
                source: LeafSource::Transistors { netlist },
            } => {
                netlist.validate(&self.macro_model.conditions)?;
                if netlist.pins() != self.pins
                    || *components
                        != netlist
                            .devices
                            .iter()
                            .map(encoded)
                            .collect::<Result<Vec<_>>>()?
                    || *wires
                        != netlist
                            .capacitors
                            .iter()
                            .map(encoded)
                            .collect::<Result<Vec<_>>>()?
                {
                    return fail("Layer-1 implementation metadata mismatch");
                }
            }
            Implementation::Netlist {
                components,
                wires,
                source,
            } => {
                let LeafSource::Characterized { kind, radix, cell } = source else {
                    unreachable!()
                };
                let expected = match kind.as_str() {
                    "kernel.q4_thresh_det" => "q4_thresh_det",
                    "kernel.q4_inv" => "q4_inv",
                    "kernel.q4_mux4" => "q4_mux4",
                    "kernel.q4_half_adder" => "q4_half_adder",
                    _ => return fail("unsupported characterized source"),
                };
                let kind = ComponentKind::from_type_id(kind).unwrap();
                let expected_pins = kind
                    .ports()
                    .iter()
                    .map(|p| {
                        Pin::digital(
                            p.id,
                            if p.dir == PortDir::In {
                                Direction::Input
                            } else {
                                Direction::Output
                            },
                            4,
                        )
                    })
                    .collect::<Result<Vec<_>>>()?;
                if *radix != 4
                    || cell != expected
                    || self.pins != expected_pins
                    || self.macro_model.conditions.corner != OperatingCorner::sky130_nominal()
                {
                    return fail("characterized source domain/function mismatch");
                }
                if *components != vec![encoded(source)?] || !wires.is_empty() {
                    return fail("characterized implementation metadata mismatch");
                }
            }
            Implementation::SubIcs {
                circuit,
                sub_ics,
                dependency_seals,
            } => {
                let children: BTreeSet<_> =
                    circuit.instances.iter().map(|i| i.ic_id.clone()).collect();
                if circuit.pins != self.pins
                    || sub_ics.len() != children.len()
                    || sub_ics.iter().cloned().collect::<BTreeSet<_>>() != children
                    || dependency_seals.keys().cloned().collect::<BTreeSet<_>>() != children
                {
                    return fail("hierarchy implementation metadata mismatch");
                }
            }
        }
        for n in [
            self.verification.timing_error_pct,
            self.verification.power_error_pct,
            self.verification.leakage_error_pct,
        ] {
            if !n.is_finite() || n < 0.0 {
                return fail("invalid verification evidence");
            }
        }
        if self.verification.status == Status::Verified
            && (self.verification.timing_error_pct > 5.0
                || self.verification.power_error_pct > 10.0
                || self.verification.leakage_error_pct > 10.0
                || self.verification.compared_transitions != self.macro_model.transitions.len())
        {
            return fail("verification outside ±5% timing / ±10% power");
        }
        Ok(())
    }
}
fn validate_pins(pins: &[Pin]) -> Result<()> {
    let mut names = BTreeSet::new();
    for p in pins {
        p.validate()?;
        if !names.insert(&p.name) {
            return fail("duplicate pin");
        }
    }
    if !pins.iter().any(|p| p.direction == Direction::Input)
        || !pins.iter().any(|p| p.direction == Direction::Output)
    {
        return fail("circuit requires input and output pins");
    }
    Ok(())
}
fn domain(pins: &[Pin]) -> String {
    let ds: BTreeSet<_> = pins.iter().map(|p| p.digit_count()).collect();
    match ds.iter().next().filter(|_| ds.len() == 1) {
        Some(2) => "binary",
        Some(3) => "ternary",
        Some(4) => "quaternary",
        _ => "mixed",
    }
    .into()
}
fn inputs(pins: &[Pin]) -> Vec<&Pin> {
    pins.iter()
        .filter(|p| p.direction == Direction::Input)
        .collect()
}
fn outputs(pins: &[Pin]) -> Vec<&Pin> {
    pins.iter()
        .filter(|p| p.direction == Direction::Output)
        .collect()
}
fn vectors(pins: &[Pin]) -> Result<Vec<Vec<u8>>> {
    let ins = inputs(pins);
    let n = ins
        .iter()
        .try_fold(1usize, |a, p| a.checked_mul(p.digit_count()))
        .unwrap_or(usize::MAX);
    let transitions = n.saturating_mul(ins.iter().map(|p| p.digit_count() - 1).sum());
    if n > MAX_STATES || transitions > MAX_TRANSITIONS {
        return fail("extraction state/transition admission budget exceeded");
    }
    Ok((0..n)
        .map(|mut i| {
            ins.iter()
                .map(|p| {
                    let v = (i % p.digit_count()) as u8;
                    i /= p.digit_count();
                    v
                })
                .collect()
        })
        .collect())
}
fn pairs(states: &[Vec<u8>]) -> impl Iterator<Item = (&Vec<u8>, &Vec<u8>)> {
    states.iter().flat_map(move |a| {
        states
            .iter()
            .filter(move |b| a.iter().zip(b.iter()).filter(|(x, y)| x != y).count() == 1)
            .map(move |b| (a, b))
    })
}

fn summarize(
    pins: &[Pin],
    states: Vec<State>,
    transitions: Vec<Transition>,
    conditions: Conditions,
    provenance: Vec<String>,
) -> Result<MacroModel> {
    let ins = inputs(pins);
    let mut arcs: BTreeMap<(String, String), f64> = BTreeMap::new();
    let mut cycle_energy = 0.0_f64;
    let energies: BTreeMap<_, _> = transitions
        .iter()
        .map(|t| ((t.before.as_slice(), t.after.as_slice()), t.energy_j))
        .collect();
    for t in &transitions {
        let Some(index) = t.before.iter().zip(&t.after).position(|(a, b)| a != b) else {
            return fail("transition has no changed input");
        };
        for e in &t.events {
            arcs.entry((ins[index].name.clone(), e.pin.clone()))
                .and_modify(|d| *d = d.max(e.delay_ns))
                .or_insert(e.delay_ns);
        }
        if let Some(reverse) = energies.get(&(t.after.as_slice(), t.before.as_slice())) {
            cycle_energy = cycle_energy.max(t.energy_j + reverse);
        }
    }
    let leakage_power_w = states
        .iter()
        .try_fold(0.0_f64, |p, s| s.leakage_w.map(|v| p.max(v)));
    Ok(MacroModel {
        timing_arcs: arcs.into_iter().map(|((from,to),delay_ns)|TimingArc {from,to,delay_ns,tolerance_pct:5}).collect(),
        dynamic_power: DynamicPower {watts_per_toggle:cycle_energy,tolerance_pct:10,
            definition:"worst sensitized one-input out-and-back cycle supply energy (J = W/(cycle/s)); DC leakage subtracted; load and slew in conditions".into()},
        leakage_power_w,states,transitions,conditions,provenance,
    })
}
fn finite_nonnegative(v: f64) -> bool {
    v.is_finite() && v >= 0.0
}
fn validate_model(pins: &[Pin], model: &MacroModel) -> Result<()> {
    let expected = vectors(pins)?;
    let ins = inputs(pins);
    let outs = outputs(pins);
    let states: BTreeSet<_> = model.states.iter().map(|s| s.inputs.clone()).collect();
    if states.len() != model.states.len() || states != expected.iter().cloned().collect() {
        return fail("incomplete/duplicate state table");
    }
    for s in &model.states {
        if s.outputs.len() != outs.len()
            || s.outputs
                .iter()
                .zip(&outs)
                .any(|(&v, p)| v as usize >= p.digit_count())
            || s.leakage_w.is_some_and(|n| !finite_nonnegative(n))
        {
            return fail("invalid state outputs/leakage");
        }
    }
    let event_count = model
        .transitions
        .iter()
        .try_fold(0usize, |n, t| n.checked_add(t.events.len()))
        .unwrap_or(usize::MAX);
    if event_count > MAX_EVENTS {
        return fail("model event admission budget exceeded");
    }
    let mut seen = BTreeSet::new();
    for t in &model.transitions {
        if !states.contains(&t.before)
            || !states.contains(&t.after)
            || t.before
                .iter()
                .zip(&t.after)
                .filter(|(a, b)| a != b)
                .count()
                != 1
            || !seen.insert((t.before.clone(), t.after.clone()))
            || !t.energy_j.is_finite()
        {
            return fail("invalid/duplicate transition");
        }
        let mut result = model.state(&t.before)?.outputs.clone();
        let mut prev = 0.0;
        for e in &t.events {
            let i = outs
                .iter()
                .position(|p| p.name == e.pin)
                .ok_or_else(|| PackageError("event references unknown output pin".into()))?;
            if !finite_nonnegative(e.delay_ns)
                || e.delay_ns < prev
                || e.value as usize >= outs[i].digit_count()
            {
                return fail("invalid output event");
            }
            result[i] = e.value;
            prev = e.delay_ns;
        }
        if result != model.state(&t.after)?.outputs {
            return fail("transition disagrees with state table");
        }
    }
    if seen.len() != pairs(&expected).count() {
        return fail("incomplete transition table");
    }
    let c = &model.conditions;
    if !finite_nonnegative(c.load_ff)
        || !finite_nonnegative(c.slew_ps)
        || c.slew_ps == 0.0
        || !c.corner.vdd_v.is_finite()
        || !c.corner.temp_c.is_finite()
    {
        return fail("invalid extraction conditions");
    }
    for p in pins {
        if (p.voltage_levels_v.last().unwrap() - c.corner.vdd_v).abs() > 1e-9 {
            return fail("pin voltage levels disagree with extraction supply");
        }
    }
    let summary = summarize(
        pins,
        model.states.clone(),
        model.transitions.clone(),
        c.clone(),
        model.provenance.clone(),
    )?;
    if model.timing_arcs.len() != summary.timing_arcs.len()
        || !finite_nonnegative(model.dynamic_power.watts_per_toggle)
    {
        return fail("invalid macro summary");
    }
    let unique_arcs: BTreeSet<_> = model.timing_arcs.iter().map(|a| (&a.from, &a.to)).collect();
    if unique_arcs.len() != model.timing_arcs.len() {
        return fail("duplicate timing arcs");
    }
    for a in &model.timing_arcs {
        if !ins.iter().any(|p| p.name == a.from)
            || !outs.iter().any(|p| p.name == a.to)
            || !finite_nonnegative(a.delay_ns)
        {
            return fail("invalid timing arc pins/delay");
        }
        if !summary
            .timing_arcs
            .iter()
            .any(|s| s.from == a.from && s.to == a.to && s.delay_ns == a.delay_ns)
        {
            return fail("timing summary disagrees with transition table");
        }
    }
    if model.dynamic_power.watts_per_toggle != summary.dynamic_power.watts_per_toggle
        || model.leakage_power_w != summary.leakage_power_w
    {
        return fail("power summary disagrees with transition table");
    }
    Ok(())
}
fn error_pct(actual: f64, expected: f64) -> f64 {
    if actual == expected {
        0.0
    } else if expected.abs() < 1e-30 {
        f64::MAX
    } else {
        100.0 * (actual - expected).abs() / expected.abs()
    }
}
fn compare_models(
    pins: &[Pin],
    model: &MacroModel,
    reference: &MacroModel,
    checked_at: &str,
) -> Result<Verification> {
    validate_model(pins, model)?;
    validate_model(pins, reference)?;
    let mut timing = 0.0_f64;
    let mut power = 0.0_f64;
    let mut leakage = 0.0_f64;
    for state in &model.states {
        let direct = reference.state(&state.inputs)?;
        if state.outputs != direct.outputs {
            return fail("macro truth disagrees with internal solve");
        }
        match (state.leakage_w, direct.leakage_w) {
            (Some(a), Some(b)) => leakage = leakage.max(error_pct(a, b)),
            (None, None) => {}
            _ => return fail("leakage availability disagrees with internal solve"),
        }
    }
    let reference_transitions: BTreeMap<_, _> = reference
        .transitions
        .iter()
        .map(|t| ((t.before.as_slice(), t.after.as_slice()), t))
        .collect();
    let model_transitions: BTreeMap<_, _> = model
        .transitions
        .iter()
        .map(|t| ((t.before.as_slice(), t.after.as_slice()), t))
        .collect();
    for t in &model.transitions {
        let direct = reference_transitions[&(t.before.as_slice(), t.after.as_slice())];
        if t.events.len() != direct.events.len() {
            return fail("macro event count disagrees with internal solve");
        }
        for (a, b) in t.events.iter().zip(&direct.events) {
            if a.pin != b.pin || a.value != b.value {
                return fail("macro event disagrees with internal solve");
            }
            timing = timing.max(error_pct(a.delay_ns, b.delay_ns));
        }
        let reverse = model_transitions[&(t.after.as_slice(), t.before.as_slice())];
        let direct_reverse = reference_transitions[&(t.after.as_slice(), t.before.as_slice())];
        power = power.max(error_pct(
            t.energy_j + reverse.energy_j,
            direct.energy_j + direct_reverse.energy_j,
        ));
    }
    Ok(Verification {
        status: if timing <= 5.0 && power <= 10.0 && leakage <= 10.0 {
            Status::Verified
        } else {
            Status::Stale
        },
        checked_at: checked_at.into(),
        timing_error_pct: timing,
        power_error_pct: power,
        leakage_error_pct: leakage,
        compared_transitions: model.transitions.len(),
    })
}
fn finish(
    id: &str,
    pins: Vec<Pin>,
    implementation: Implementation,
    model: MacroModel,
    reference: MacroModel,
    footprint: Footprint,
    checked_at: &str,
) -> Result<CustomIcPackage> {
    let verification = compare_models(&pins, &model, &reference, checked_at)?;
    let mut package = CustomIcPackage {
        format: FORMAT.into(),
        ic_id: id.into(),
        label: None,
        radix_domain: domain(&pins),
        pins,
        implementation,
        macro_model: model,
        footprint,
        verification,
        content_seal: String::new(),
    };
    package.validate()?;
    seal(&mut package)?;
    Ok(package)
}

pub struct Packager<'a> {
    pub library: &'a TimingLibrary,
    progress: Box<dyn FnMut(Progress) + 'a>,
}
impl<'a> Packager<'a> {
    pub fn new(library: &'a TimingLibrary) -> Self {
        Self {
            library,
            progress: Box::new(|_| {}),
        }
    }
    pub fn with_progress(mut self, sink: impl FnMut(Progress) + 'a) -> Self {
        self.progress = Box::new(sink);
        self
    }
    fn report(&mut self, stage: &'static str, completed: usize, total: usize) {
        (self.progress)(Progress {
            stage,
            completed,
            total,
        });
    }

    /// Convert an existing WP-3.2 cell feed to an executable leaf. A binary
    /// half-adder is NOT a full-adder, and an inverter is NOT a buffer:
    /// mismatched and uncharacterized mappings fail closed.
    pub fn package_primitive(
        &mut self,
        id: &str,
        kind: ComponentKind,
        radix: u32,
        conditions: Conditions,
        footprint: Footprint,
        checked_at: &str,
    ) -> Result<CustomIcPackage> {
        let cell = match (kind, radix) {
            (ComponentKind::Not, 2) => "inv1",
            (ComponentKind::Nand, 2) => "nand2",
            (ComponentKind::Q4ThreshDet, 4) => "q4_thresh_det",
            (ComponentKind::Q4Inv, 4) => "q4_inv",
            (ComponentKind::Q4Mux4, 4) => "q4_mux4",
            (ComponentKind::Q4HalfAdder, 4) => "q4_half_adder",
            _ => {
                return fail(format!(
                    "uncharacterized function/domain {} R={radix}; supply a Layer-1 netlist",
                    kind.type_id()
                ))
            }
        };
        if conditions.corner != self.library.corner {
            return fail("corner requires re-characterization");
        }
        let timing = self
            .library
            .cells
            .get(cell)
            .ok_or_else(|| PackageError("missing characterized cell".into()))?;
        // Check the feed envelope before admitting a potentially expensive solve.
        for arc in &timing.arcs {
            for dir in [OutDir::Hl, OutDir::Lh] {
                arc.tpd_ps(conditions.load_ff, conditions.slew_ps, dir)
                    .map_err(|e| PackageError(e.to_string()))?;
            }
        }
        if radix == 2 {
            let cell = if kind == ComponentKind::Not {
                ch::inv1_cell()
            } else {
                ch::nand2_cell()
            };
            // Resolve non-sensitized switching and leakage from Layer 1 too;
            // the arc feed alone does not characterize those states.
            return self.package_transistors(
                id,
                TransistorNetlist::from_cell(&cell, 2)?,
                conditions,
                footprint,
                checked_at,
            );
        }
        let pins: Vec<Pin> = kind
            .ports()
            .iter()
            .map(|p| {
                Pin::digital(
                    p.id,
                    if p.dir == PortDir::In {
                        Direction::Input
                    } else {
                        Direction::Output
                    },
                    radix,
                )
            })
            .collect::<Result<_>>()?;
        let vs = vectors(&pins)?;
        let mut states = Vec::new();
        for v in &vs {
            let values: HashMap<_, _> = kind
                .input_ports()
                .iter()
                .zip(v)
                .map(|(&p, &v)| (p, LogicValue::Digit(v)))
                .collect();
            let results = components::eval(
                kind,
                Radix::new(radix).map_err(PackageError)?,
                &BlockParams::defaults_for(kind),
                &mut BlockState::default(),
                &values,
                None,
            );
            let out = outputs(&pins)
                .iter()
                .map(|p| {
                    results
                        .iter()
                        .find(|(name, _)| *name == p.name)
                        .and_then(|(_, v)| v.digit())
                        .ok_or_else(|| PackageError("unknown output during extraction".into()))
                })
                .collect::<Result<Vec<_>>>()?;
            states.push(State {
                inputs: v.clone(),
                outputs: out,
                leakage_w: timing.leakage_w,
            });
        }
        self.report("states", states.len(), states.len());
        let ins = inputs(&pins);
        let outs = outputs(&pins);
        let mut transitions = Vec::new();
        for (before, after) in pairs(&vs) {
            let changed = before.iter().zip(after).position(|(a, b)| a != b).unwrap();
            let old = states.iter().find(|s| s.inputs == *before).unwrap();
            let new = states.iter().find(|s| s.inputs == *after).unwrap();
            let mut events = Vec::new();
            let mut energy = 0.0_f64;
            for (i, p) in outs.iter().enumerate() {
                if old.outputs[i] == new.outputs[i] {
                    continue;
                }
                // WP-3.2 mux data arcs are collectively named "d".
                let from = if cell == "q4_mux4" && ins[changed].name.starts_with('d') {
                    "d"
                } else {
                    &ins[changed].name
                };
                let arc = timing
                    .arcs
                    .iter()
                    .find(|a| a.from == from && a.to == p.name)
                    .ok_or_else(|| PackageError("missing characterized pin arc".into()))?;
                let dir = if new.outputs[i] > old.outputs[i] {
                    OutDir::Lh
                } else {
                    OutDir::Hl
                };
                let delay = arc
                    .tpd_ps(conditions.load_ff, conditions.slew_ps, dir)
                    .map_err(|e| PackageError(e.to_string()))?;
                let e = arc
                    .e_dyn_j(conditions.load_ff, conditions.slew_ps, dir)
                    .map_err(|e| PackageError(e.to_string()))?;
                if !finite_nonnegative(delay) || !e.is_finite() {
                    return fail("invalid characterized arc");
                }
                events.push(OutputEvent {
                    pin: p.name.clone(),
                    value: new.outputs[i],
                    delay_ns: delay / 1000.0,
                });
                // A cell's supply is measured once per input transition;
                // output-arc runs are alternative probes, never additive rails.
                if energy.abs() < e.abs() {
                    energy = e;
                }
            }
            events.sort_by(|a, b| a.delay_ns.total_cmp(&b.delay_ns));
            transitions.push(Transition {
                before: before.clone(),
                after: after.clone(),
                events,
                energy_j: energy,
            });
        }
        self.report("transitions", transitions.len(), transitions.len());
        let provenance =
            vec![serde_json::to_string(&timing.provenance)
                .map_err(|e| PackageError(e.to_string()))?];
        let model = summarize(&pins, states, transitions, conditions, provenance)?;
        let source = LeafSource::Characterized {
            kind: kind.type_id().into(),
            radix,
            cell: cell.into(),
        };
        let implementation = Implementation::Netlist {
            components: vec![encoded(&source)?],
            wires: vec![],
            source,
        };
        // Independent Layer-1 acceptance is exercised against run_arc in the
        // oracle suite; the imported feed's transition model is exact here.
        finish(
            id,
            pins,
            implementation,
            model.clone(),
            model,
            footprint,
            checked_at,
        )
    }
}

/// Serializable Layer-1 graph. Standard-Vt SKY130 devices are the model set
/// actually qualified by WP-2.2; unsupported devices are rejected on import.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MosDevice {
    pub pmos: bool,
    pub g: usize,
    pub d: usize,
    pub s: usize,
    pub w_um: f64,
    pub l_um: f64,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capacitor {
    pub a: usize,
    pub b: usize,
    pub farads: f64,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodePin {
    pub node: usize,
    pub pin: Pin,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransistorNetlist {
    pub node_count: usize,
    pub vdd_node: usize,
    pub devices: Vec<MosDevice>,
    pub capacitors: Vec<Capacitor>,
    pub ports: Vec<NodePin>,
    pub fixed_voltages: Vec<(usize, f64)>,
    pub settings: TransientSettings,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransientSettings {
    pub dt_ps: f64,
    pub settle_ps: f64,
}
impl Default for TransientSettings {
    fn default() -> Self {
        Self {
            dt_ps: 1.0,
            settle_ps: 300.0,
        }
    }
}
impl TransistorNetlist {
    pub fn from_cell(cell: &ch::TransCell, radix: u32) -> Result<Self> {
        let devices = cell
            .nl
            .devices
            .iter()
            .map(|d| {
                let pmos = match d.model {
                    BsimModelId::Sky130aNfet01v8 => false,
                    BsimModelId::Sky130aPfet01v8 => true,
                    _ => return fail("unsupported Layer-1 model"),
                };
                Ok(MosDevice {
                    pmos,
                    g: d.g,
                    d: d.d,
                    s: d.s,
                    w_um: d.w_um,
                    l_um: d.l_um,
                })
            })
            .collect::<Result<_>>()?;
        let mut ports = Vec::new();
        for (items, dir) in [
            (&cell.inputs, Direction::Input),
            (&cell.outputs, Direction::Output),
        ] {
            for &(node, name) in items {
                ports.push(NodePin {
                    node,
                    pin: Pin::digital(name, dir, radix)?,
                });
            }
        }
        let mut fixed_voltages = Vec::new();
        for forced in &cell.nl.forced {
            let v = forced
                .pwl
                .first()
                .ok_or_else(|| PackageError("empty forced waveform".into()))?
                .1;
            if forced.pwl.iter().any(|(_, vv)| *vv != v) {
                return fail("time-dependent internal source requires a stateful model");
            }
            if forced.node != cell.vdd_node && forced.node != 0 {
                fixed_voltages.push((forced.node, v));
            }
        }
        Ok(Self {
            node_count: cell.nl.n_nodes,
            vdd_node: cell.vdd_node,
            devices,
            capacitors: cell
                .nl
                .caps
                .iter()
                .map(|c| Capacitor {
                    a: c.a,
                    b: c.b,
                    farads: c.c_f,
                })
                .collect(),
            ports,
            fixed_voltages,
            settings: TransientSettings::default(),
        })
    }
    pub fn pins(&self) -> Vec<Pin> {
        self.ports.iter().map(|p| p.pin.clone()).collect()
    }
    fn validate(&self, c: &Conditions) -> Result<()> {
        validate_pins(&self.pins())?;
        if self.node_count < 3
            || self.node_count > 64
            || self.devices.len() > MAX_INSTANCES
            || self.devices.is_empty()
            || self.vdd_node == 0
            || self.vdd_node >= self.node_count
        {
            return fail("Layer-1 node/device admission budget or rail invalid");
        }
        if !finite_nonnegative(self.settings.dt_ps)
            || self.settings.dt_ps == 0.0
            || !finite_nonnegative(self.settings.settle_ps)
            || self.settings.settle_ps == 0.0
            || (c.slew_ps + self.settings.settle_ps) / self.settings.dt_ps > 100_000.0
        {
            return fail("transient sample admission budget exceeded");
        }
        let mut used = BTreeSet::from([0, self.vdd_node]);
        for &(node, v) in &self.fixed_voltages {
            if node >= self.node_count || !v.is_finite() || !used.insert(node) {
                return fail("invalid fixed voltage node");
            }
        }
        for p in &self.ports {
            if p.node >= self.node_count || !used.insert(p.node) {
                return fail("invalid/overlapping port node");
            }
            if (p.pin.voltage_levels_v.last().unwrap() - c.corner.vdd_v).abs() > 1e-9 {
                return fail("Layer-1 pin supply mismatch");
            }
        }
        for d in &self.devices {
            if [d.g, d.d, d.s].iter().any(|&n| n >= self.node_count)
                || !d.w_um.is_finite()
                || !d.l_um.is_finite()
                || d.w_um <= 0.0
                || d.l_um <= 0.0
            {
                return fail("invalid transistor geometry/node");
            }
        }
        for cap in &self.capacitors {
            if cap.a >= self.node_count
                || cap.b >= self.node_count
                || !finite_nonnegative(cap.farads)
            {
                return fail("invalid capacitor");
            }
        }
        // WP-3.2 uses the card's nominal temperature. A different T requires
        // a model re-characterization, not a label change.
        if c.corner != OperatingCorner::sky130_nominal()
            || !finite_nonnegative(c.load_ff)
            || !c.slew_ps.is_finite()
            || c.slew_ps <= 0.0
        {
            return fail("Layer-1 conditions outside characterized corner");
        }
        Ok(())
    }
    fn netlist(&self, c: &Conditions, before: &[u8], after: &[u8]) -> ch::TransNetlist {
        let mut nl = ch::TransNetlist {
            n_nodes: self.node_count,
            devices: self
                .devices
                .iter()
                .map(|d| ch::Device {
                    model: if d.pmos {
                        BsimModelId::Sky130aPfet01v8
                    } else {
                        BsimModelId::Sky130aNfet01v8
                    },
                    g: d.g,
                    d: d.d,
                    s: d.s,
                    w_um: d.w_um,
                    l_um: d.l_um,
                })
                .collect(),
            caps: self
                .capacitors
                .iter()
                .map(|c| ch::LinCap {
                    a: c.a,
                    b: c.b,
                    c_f: c.farads,
                })
                .collect(),
            forced: vec![ch::ForcedNode::constant(self.vdd_node, c.corner.vdd_v)],
        };
        for &(node, v) in &self.fixed_voltages {
            nl.forced.push(ch::ForcedNode::constant(node, v));
        }
        let mut i = 0;
        for p in &self.ports {
            if p.pin.direction == Direction::Input {
                let (a, b) = (
                    p.pin.voltage_levels_v[before[i] as usize],
                    p.pin.voltage_levels_v[after[i] as usize],
                );
                i += 1;
                nl.forced.push(ch::ForcedNode {
                    node: p.node,
                    pwl: vec![
                        (0.0, a),
                        (c.slew_ps * 1e-12, b),
                        ((c.slew_ps + self.settings.settle_ps) * 2e-12, b),
                    ],
                });
            } else {
                nl.caps.push(ch::LinCap {
                    a: p.node,
                    b: 0,
                    c_f: c.load_ff * 1e-15,
                });
            }
        }
        nl
    }
}
fn soa(nl: &ch::TransNetlist, v: &[f64], factor: f64) -> Result<()> {
    for d in &nl.devices {
        let vgs = (v[d.g] - v[d.s]).abs();
        if bsim::soa_check(bsim::profile(d.model), vgs)
            .is_some_and(|s| s.violated && vgs > s.ceiling_v * factor)
        {
            return fail("Layer-1 SOA violated");
        }
    }
    Ok(())
}
fn digit(pin: &Pin, v: f64) -> Result<u8> {
    let levels = &pin.voltage_levels_v;
    let step = levels[1] - levels[0];
    if !v.is_finite() || v < levels[0] - step / 2.0 || v > levels.last().unwrap() + step / 2.0 {
        return fail("Layer-1 output outside voltage partitions");
    }
    Ok(levels
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| (*a - v).abs().total_cmp(&(*b - v).abs()))
        .unwrap()
        .0 as u8)
}
fn raw_model(netlist: &TransistorNetlist, c: &Conditions) -> Result<MacroModel> {
    raw_model_progress(netlist, c, &mut |_| {})
}
fn raw_model_progress(
    netlist: &TransistorNetlist,
    c: &Conditions,
    progress: &mut dyn FnMut(Progress),
) -> Result<MacroModel> {
    netlist.validate(c)?;
    let pins = netlist.pins();
    let vs = vectors(&pins)?;
    let mut states = Vec::new();
    let cfg = TransientConfig {
        dt_s: netlist.settings.dt_ps * 1e-12,
        ..Default::default()
    };
    for input in &vs {
        let nl = netlist.netlist(c, input, input);
        let v = ch::solve_dc_op(&nl, &cfg).map_err(|e| PackageError(e.to_string()))?;
        soa(&nl, &v, 1.0)?;
        let output = netlist
            .ports
            .iter()
            .filter(|p| p.pin.direction == Direction::Output)
            .map(|p| digit(&p.pin, v[p.node]))
            .collect::<Result<_>>()?;
        let leakage = ch::leakage_current_a(&nl, &v).map_err(|e| PackageError(e.to_string()))?
            * c.corner.vdd_v;
        if !finite_nonnegative(leakage) {
            return fail("invalid DC leakage");
        }
        states.push(State {
            inputs: input.clone(),
            outputs: output,
            leakage_w: Some(leakage),
        });
        progress(Progress {
            stage: "states",
            completed: states.len(),
            total: vs.len(),
        });
    }
    let mut transitions = Vec::new();
    let total_transitions = pairs(&vs).count();
    for (before, after) in pairs(&vs) {
        let nl = netlist.netlist(c, before, after);
        let end = (c.slew_ps + netlist.settings.settle_ps) * 1e-12;
        let (samples, energy) =
            ch::run_transient(&nl, end, &cfg).map_err(|e| PackageError(e.to_string()))?;
        let first = samples
            .first()
            .ok_or_else(|| PackageError("empty transient".into()))?;
        let last = samples.last().unwrap();
        soa(&nl, &first.v, 1.0)?;
        soa(&nl, &last.v, 1.0)?;
        for sample in &samples {
            soa(&nl, &sample.v, 2.0)?;
        }
        let old = states.iter().find(|s| s.inputs == *before).unwrap();
        let new = states.iter().find(|s| s.inputs == *after).unwrap();
        let mut events = Vec::new();
        for (i, p) in netlist
            .ports
            .iter()
            .filter(|p| p.pin.direction == Direction::Output)
            .enumerate()
        {
            if digit(&p.pin, last.v[p.node])? != new.outputs[i] {
                return fail("transient failed to settle to DC truth");
            }
            let tail = &samples[samples.len().saturating_sub(5)..];
            if tail
                .iter()
                .any(|s| (s.v[p.node] - last.v[p.node]).abs() > 1e-3)
            {
                return fail("transient not settled; increase settlePs");
            }
            if old.outputs[i] == new.outputs[i] {
                continue;
            }
            let threshold = (p.pin.voltage_levels_v[old.outputs[i] as usize]
                + p.pin.voltage_levels_v[new.outputs[i] as usize])
                / 2.0;
            let crossing = samples
                .windows(2)
                .find_map(|w| {
                    let (a, b) = (w[0].v[p.node], w[1].v[p.node]);
                    if a != b && (a - threshold) * (b - threshold) <= 0.0 {
                        Some(w[0].t_s + (threshold - a) / (b - a) * (w[1].t_s - w[0].t_s))
                    } else {
                        None
                    }
                })
                .ok_or_else(|| PackageError("no output partition crossing".into()))?;
            let delay_ns = (crossing - c.slew_ps * 0.5e-12) * 1e9;
            if !finite_nonnegative(delay_ns) {
                return fail("negative propagation delay cannot be represented by schema");
            }
            events.push(OutputEvent {
                pin: p.pin.name.clone(),
                value: new.outputs[i],
                delay_ns,
            });
        }
        events.sort_by(|a, b| a.delay_ns.total_cmp(&b.delay_ns));
        // The transient integrator samples supply current at each step. Remove
        // the corresponding steady-state baseline, split at input midpoint.
        let baseline = samples
            .iter()
            .map(|s| {
                if s.t_s < c.slew_ps * 0.5e-12 {
                    old.leakage_w.unwrap()
                } else {
                    new.leakage_w.unwrap()
                }
            })
            .sum::<f64>()
            * cfg.dt_s;
        transitions.push(Transition {
            before: before.clone(),
            after: after.clone(),
            events,
            energy_j: energy - baseline,
        });
        progress(Progress {
            stage: "transitions",
            completed: transitions.len(),
            total: total_transitions,
        });
    }
    summarize(&pins,states,transitions,c.clone(),vec!["SIMULATED_PHYSICS_MODEL: ep-logic WP-3.2 charge-conserving backward Euler / ep-circuit WP-2.2 SKY130 standard-Vt BSIM; nominal corner only; bulk tied to source; no silicon qualification".into()])
}
impl Packager<'_> {
    /// Extract arbitrary user Layer-1 netlists, not just named library cells.
    /// Verification independently repeats the full solve at half the timestep.
    pub fn package_transistors(
        &mut self,
        id: &str,
        netlist: TransistorNetlist,
        conditions: Conditions,
        footprint: Footprint,
        checked_at: &str,
    ) -> Result<CustomIcPackage> {
        self.report("layer1", 0, 2);
        let model = raw_model_progress(&netlist, &conditions, &mut self.progress)?;
        self.report("layer1", 1, 2);
        let mut refined = netlist.clone();
        refined.settings.dt_ps /= 2.0;
        let reference = raw_model_progress(&refined, &conditions, &mut self.progress)?;
        self.report("layer1", 2, 2);
        let pins = netlist.pins();
        let components = netlist
            .devices
            .iter()
            .map(encoded)
            .collect::<Result<Vec<_>>>()?;
        let wires = netlist
            .capacitors
            .iter()
            .map(encoded)
            .collect::<Result<Vec<_>>>()?;
        let source = LeafSource::Transistors { netlist };
        let package = finish(
            id,
            pins,
            Implementation::Netlist {
                components,
                wires,
                source,
            },
            model,
            reference,
            footprint,
            checked_at,
        );
        self.report("verification", 1, 1);
        package
    }
}

/// Registry graph audit is iterative-bounded by depth and completed nodes.
/// It also checks all child seals before a parent becomes instantiable.
pub fn validate_sub_ic_dag(registry: &Registry, root: &str) -> Result<()> {
    fn visit(
        registry: &Registry,
        id: &str,
        stack: &mut Vec<String>,
        done: &mut BTreeSet<String>,
    ) -> Result<()> {
        if stack.iter().any(|s| s == id) {
            stack.push(id.into());
            return fail(format!("cyclic IC inclusion: {}", stack.join(" -> ")));
        }
        if done.contains(id) {
            return Ok(());
        }
        if stack.len() >= MAX_DEPTH || done.len() >= MAX_INSTANCES {
            return fail("hierarchy admission budget exceeded");
        }
        let p = registry
            .get(id)
            .ok_or_else(|| PackageError(format!("unknown sub-IC {id}")))?;
        if p.ic_id != id {
            return fail("registry key/icId mismatch");
        }
        p.validate()?;
        verify_seal(p)?;
        if p.verification.status != Status::Verified {
            return fail(format!("IC {id} is STALE"));
        }
        stack.push(id.into());
        if let Implementation::SubIcs {
            sub_ics,
            circuit,
            dependency_seals,
        } = &p.implementation
        {
            let referenced: BTreeSet<_> =
                circuit.instances.iter().map(|i| i.ic_id.clone()).collect();
            if sub_ics.iter().cloned().collect::<BTreeSet<_>>() != referenced
                || sub_ics.len() != referenced.len()
                || circuit.pins != p.pins
            {
                return fail("sub-IC graph metadata mismatch");
            }
            for child in sub_ics {
                visit(registry, child, stack, done)?;
                let c = &registry[child].macro_model.conditions;
                let parent = &p.macro_model.conditions;
                if c.load_ff != parent.load_ff
                    || c.slew_ps != parent.slew_ps
                    || c.corner != parent.corner
                {
                    return fail("STALE: dependency operating conditions changed");
                }
                if dependency_seals.get(child) != Some(&registry[child].content_seal) {
                    return fail(format!(
                        "STALE: dependency {child} changed since extraction"
                    ));
                }
            }
            if dependency_seals.len() != sub_ics.len() {
                return fail("dependency seal metadata mismatch");
            }
            validate_circuit(registry, circuit)?;
        }
        stack.pop();
        done.insert(id.into());
        Ok(())
    }
    visit(registry, root, &mut Vec::new(), &mut BTreeSet::new())
}
fn endpoint_pin<'a>(registry: &'a Registry, c: &'a Circuit, e: &Endpoint) -> Result<&'a Pin> {
    let pins = if e.instance.is_empty() {
        &c.pins
    } else {
        let instance = c
            .instances
            .iter()
            .find(|i| i.id == e.instance)
            .ok_or_else(|| PackageError(format!("unknown instance {}", e.instance)))?;
        &registry
            .get(&instance.ic_id)
            .ok_or_else(|| PackageError(format!("unknown IC {}", instance.ic_id)))?
            .pins
    };
    pins.iter()
        .find(|p| p.name == e.pin)
        .ok_or_else(|| PackageError(format!("unknown pin {}.{}", e.instance, e.pin)))
}
fn validate_circuit(registry: &Registry, c: &Circuit) -> Result<Vec<usize>> {
    validate_pins(&c.pins)?;
    vectors(&c.pins)?;
    if c.instances.len() > MAX_INSTANCES || c.wires.len() > MAX_INSTANCES * 32 {
        return fail("circuit admission budget exceeded");
    }
    let mut names = BTreeSet::new();
    for i in &c.instances {
        if i.id.is_empty() || !names.insert(&i.id) || !registry.contains_key(&i.ic_id) {
            return fail("duplicate/empty instance or missing IC");
        }
    }
    let mut targets = BTreeSet::new();
    for w in &c.wires {
        let a = endpoint_pin(registry, c, &w.from)?;
        let b = endpoint_pin(registry, c, &w.to)?;
        let source = if w.from.instance.is_empty() {
            Direction::Input
        } else {
            Direction::Output
        };
        let sink = if w.to.instance.is_empty() {
            Direction::Output
        } else {
            Direction::Input
        };
        if a.direction != source || b.direction != sink {
            return fail("wire pin direction mismatch");
        }
        if a.radix != b.radix || a.voltage_levels_v != b.voltage_levels_v {
            return fail(format!("pin radix mismatch: {:?} -> {:?}", w.from, w.to));
        }
        if !targets.insert(w.to.clone()) {
            return fail("pin contention: more than one driver");
        }
    }
    for p in outputs(&c.pins) {
        if !targets.contains(&Endpoint::boundary(&p.name)) {
            return fail("undriven boundary output");
        }
    }
    for i in &c.instances {
        for p in inputs(&registry[&i.ic_id].pins) {
            if !targets.contains(&Endpoint::at(&i.id, &p.name)) {
                return fail("undriven instance input");
            }
        }
    }
    let mut order = Vec::new();
    let mut done = BTreeSet::new();
    while order.len() < c.instances.len() {
        let next = c
            .instances
            .iter()
            .enumerate()
            .find(|(idx, i)| {
                !done.contains(idx)
                    && c.wires
                        .iter()
                        .filter(|w| w.to.instance == i.id && !w.from.instance.is_empty())
                        .all(|w| {
                            c.instances
                                .iter()
                                .position(|b| b.id == w.from.instance)
                                .is_some_and(|idx| done.contains(&idx))
                        })
            })
            .map(|(i, _)| i);
        let Some(idx) = next else {
            return fail("cyclic/oscillating internal circuit: combinational DAG required");
        };
        done.insert(idx);
        order.push(idx);
    }
    Ok(order)
}
fn validate_dependencies(registry: &Registry, c: &Circuit) -> Result<()> {
    for i in &c.instances {
        validate_sub_ic_dag(registry, &i.ic_id)?;
    }
    validate_circuit(registry, c)?;
    Ok(())
}

/// Expand all hierarchy levels, preserving boundary routing and unique names.
/// The returned leaf circuit is the independent internal simulation oracle.
pub fn flatten(registry: &Registry, circuit: &Circuit) -> Result<Circuit> {
    validate_dependencies(registry, circuit)?;
    flatten_validated(registry, circuit)
}
fn flatten_validated(registry: &Registry, circuit: &Circuit) -> Result<Circuit> {
    let mut c = circuit.clone();
    let mut expanded = 0;
    loop {
        let child = c.instances.iter().enumerate().find_map(|(idx, i)| {
            match &registry[&i.ic_id].implementation {
                Implementation::SubIcs { circuit, .. } => Some((idx, i.clone(), circuit.clone())),
                _ => None,
            }
        });
        let Some((idx, instance, inner)) = child else {
            break;
        };
        expanded += 1;
        if expanded > MAX_INSTANCES || c.instances.len() + inner.instances.len() > MAX_INSTANCES {
            return fail("flattened instance budget exceeded");
        }
        c.instances.remove(idx);
        let map = |e: &Endpoint| {
            if e.instance.is_empty() {
                Endpoint::at(&instance.id, &e.pin)
            } else {
                Endpoint::at(&format!("{}/{}", instance.id, e.instance), &e.pin)
            }
        };
        for i in &inner.instances {
            c.instances.push(Instance {
                id: format!("{}/{}", instance.id, i.id),
                ic_id: i.ic_id.clone(),
            });
        }
        c.wires.extend(inner.wires.iter().map(|w| Connection {
            from: map(&w.from),
            to: map(&w.to),
        }));
        for pin in &inner.pins {
            let connector = Endpoint::at(&instance.id, &pin.name);
            let sources: Vec<_> = c
                .wires
                .iter()
                .filter(|w| w.to == connector)
                .map(|w| w.from.clone())
                .collect();
            let sinks: Vec<_> = c
                .wires
                .iter()
                .filter(|w| w.from == connector)
                .map(|w| w.to.clone())
                .collect();
            c.wires.retain(|w| w.from != connector && w.to != connector);
            for from in &sources {
                for to in &sinks {
                    c.wires.push(Connection {
                        from: from.clone(),
                        to: to.clone(),
                    });
                }
            }
        }
    }
    validate_circuit(registry, &c)?;
    Ok(c)
}
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SolveMode {
    BlackBox,
    Flattened,
}
#[derive(Debug, Clone)]
pub struct Stimulus {
    pub time_ns: f64,
    pub pin: String,
    pub value: u8,
}
#[derive(Debug, Clone)]
pub struct Simulation {
    pub outputs: Vec<u8>,
    pub events: Vec<OutputEvent>,
    pub dynamic_energy_j: f64,
    pub leakage_w: Option<f64>,
}
fn fs(ns: f64) -> Result<u64> {
    if !finite_nonnegative(ns) || ns * 1e6 > u64::MAX as f64 {
        return fail("event time outside simulation range");
    }
    Ok((ns * 1e6).round() as u64)
}
fn steady(
    registry: &Registry,
    c: &Circuit,
    order: &[usize],
    initial: &[u8],
) -> Result<(BTreeMap<Endpoint, u8>, Option<f64>)> {
    let ins = inputs(&c.pins);
    if initial.len() != ins.len()
        || initial
            .iter()
            .zip(&ins)
            .any(|(&v, p)| v as usize >= p.digit_count())
    {
        return fail("initial input radix/arity mismatch");
    }
    let mut values: BTreeMap<_, _> = ins
        .iter()
        .zip(initial)
        .map(|(p, &v)| (Endpoint::boundary(&p.name), v))
        .collect();
    let driver = |target: &Endpoint, values: &BTreeMap<Endpoint, u8>| -> Result<u8> {
        let wire = c
            .wires
            .iter()
            .find(|w| &w.to == target)
            .ok_or_else(|| PackageError("undriven pin".into()))?;
        values
            .get(&wire.from)
            .copied()
            .ok_or_else(|| PackageError("unsettled source".into()))
    };
    let mut leakage = Some(0.0);
    for &idx in order {
        let i = &c.instances[idx];
        let p = &registry[&i.ic_id];
        let input = inputs(&p.pins)
            .iter()
            .map(|pin| driver(&Endpoint::at(&i.id, &pin.name), &values))
            .collect::<Result<Vec<_>>>()?;
        for (pin, &v) in inputs(&p.pins).iter().zip(&input) {
            values.insert(Endpoint::at(&i.id, &pin.name), v);
        }
        let state = p.macro_model.state(&input)?;
        for (pin, &v) in outputs(&p.pins).iter().zip(&state.outputs) {
            values.insert(Endpoint::at(&i.id, &pin.name), v);
        }
        leakage = leakage.zip(state.leakage_w).map(|(a, b)| a + b);
    }
    for p in outputs(&c.pins) {
        let e = Endpoint::boundary(&p.name);
        let v = driver(&e, &values)?;
        values.insert(e, v);
    }
    Ok((values, leakage))
}
/// Pin-event simulation uses ep-logic's deterministic (time, sequence) queue.
/// Custom IC time ticks are femtoseconds, so sub-ps characterized arcs do not
/// lose their ±5% tolerance when the package crosses a hierarchy boundary.
pub fn run_circuit(
    registry: &Registry,
    circuit: &Circuit,
    initial: &[u8],
    stimuli: &[Stimulus],
    mode: SolveMode,
) -> Result<Simulation> {
    validate_dependencies(registry, circuit)?;
    let c = if mode == SolveMode::Flattened {
        flatten_validated(registry, circuit)?
    } else {
        circuit.clone()
    };
    simulate(registry, &c, initial, stimuli)
}
fn simulate(
    registry: &Registry,
    c: &Circuit,
    initial: &[u8],
    stimuli: &[Stimulus],
) -> Result<Simulation> {
    let order = validate_circuit(registry, c)?;
    let (mut values, _) = steady(registry, c, &order, initial)?;
    let mut queue = EventQueue::new();
    let mut previous = 0;
    for s in stimuli {
        let t = fs(s.time_ns)?;
        let p = c
            .pins
            .iter()
            .find(|p| p.direction == Direction::Input && p.name == s.pin)
            .ok_or_else(|| PackageError("stimulus references unknown input".into()))?;
        if t < previous || s.value as usize >= p.digit_count() {
            return fail("stimulus order/radix mismatch");
        }
        previous = t;
        queue.push(
            t,
            EventPayload::Callback {
                block_id: String::new(),
                port_id: s.pin.clone(),
                value: LogicValue::Digit(s.value),
            },
        );
    }
    let mut events = Vec::new();
    let mut energy = 0.0;
    let mut count = 0;
    let mut pending_until: BTreeMap<String, u64> = BTreeMap::new();
    while let Some((time, payload)) = queue.pop() {
        count += 1;
        if count > MAX_EVENTS {
            return fail("event budget exceeded (oscillation)");
        }
        match payload {
            EventPayload::Callback {
                block_id,
                port_id,
                value,
            } => {
                let source = Endpoint::at(&block_id, &port_id);
                let v = value
                    .digit()
                    .ok_or_else(|| PackageError("unknown output".into()))?;
                if values.get(&source) == Some(&v) {
                    continue;
                }
                values.insert(source.clone(), v);
                for w in c.wires.iter().filter(|w| w.from == source) {
                    queue.push(
                        time,
                        EventPayload::Input {
                            block_id: w.to.instance.clone(),
                            port_id: w.to.pin.clone(),
                            value,
                        },
                    );
                }
            }
            EventPayload::Input {
                block_id,
                port_id,
                value,
            } => {
                let endpoint = Endpoint::at(&block_id, &port_id);
                let v = value
                    .digit()
                    .ok_or_else(|| PackageError("unknown input".into()))?;
                if values.get(&endpoint) == Some(&v) {
                    continue;
                }
                if block_id.is_empty() {
                    values.insert(endpoint, v);
                    events.push(OutputEvent {
                        pin: port_id,
                        value: v,
                        delay_ns: time as f64 / 1e6,
                    });
                    continue;
                }
                let i = c
                    .instances
                    .iter()
                    .find(|i| i.id == block_id)
                    .ok_or_else(|| PackageError("unknown simulation instance".into()))?;
                let package = &registry[&i.ic_id];
                if matches!(package.implementation, Implementation::SubIcs { .. })
                    && pending_until.get(&block_id).is_some_and(|&t| time < t)
                {
                    return fail("overlapping black-box transitions require the flattened solver");
                }
                let ins = inputs(&package.pins);
                let before = ins
                    .iter()
                    .map(|p| values[&Endpoint::at(&block_id, &p.name)])
                    .collect::<Vec<_>>();
                values.insert(endpoint, v);
                let after = ins
                    .iter()
                    .map(|p| values[&Endpoint::at(&block_id, &p.name)])
                    .collect::<Vec<_>>();
                let t = package.macro_model.transition(&before, &after)?;
                energy += t.energy_j;
                for e in t.events {
                    let at = time
                        .checked_add(fs(e.delay_ns)?)
                        .ok_or_else(|| PackageError("event time overflow".into()))?;
                    pending_until
                        .entry(block_id.clone())
                        .and_modify(|t| *t = (*t).max(at))
                        .or_insert(at);
                    queue.push(
                        at,
                        EventPayload::Callback {
                            block_id: block_id.clone(),
                            port_id: e.pin,
                            value: LogicValue::Digit(e.value),
                        },
                    );
                }
            }
        }
    }
    let out = outputs(&c.pins)
        .iter()
        .map(|p| values[&Endpoint::boundary(&p.name)])
        .collect();
    let final_inputs = inputs(&c.pins)
        .iter()
        .map(|p| values[&Endpoint::boundary(&p.name)])
        .collect::<Vec<_>>();
    let (_, leakage) = steady(registry, c, &order, &final_inputs)?;
    Ok(Simulation {
        outputs: out,
        events,
        dynamic_energy_j: energy,
        leakage_w: leakage,
    })
}
fn circuit_model(
    registry: &Registry,
    circuit: &Circuit,
    conditions: Conditions,
    mode: SolveMode,
) -> Result<MacroModel> {
    let c = if mode == SolveMode::Flattened {
        flatten_validated(registry, circuit)?
    } else {
        circuit.clone()
    };
    let order = validate_circuit(registry, &c)?;
    let vs = vectors(&c.pins)?;
    let mut states = Vec::new();
    for input in &vs {
        let (values, leakage) = steady(registry, &c, &order, input)?;
        states.push(State {
            inputs: input.clone(),
            outputs: outputs(&c.pins)
                .iter()
                .map(|p| values[&Endpoint::boundary(&p.name)])
                .collect(),
            leakage_w: leakage,
        });
    }
    let ins = inputs(&c.pins);
    let mut transitions = Vec::new();
    for (before, after) in pairs(&vs) {
        let index = before.iter().zip(after).position(|(a, b)| a != b).unwrap();
        let result = simulate(
            registry,
            &c,
            before,
            &[Stimulus {
                time_ns: 0.0,
                pin: ins[index].name.clone(),
                value: after[index],
            }],
        )?;
        if result.outputs != states.iter().find(|s| s.inputs == *after).unwrap().outputs {
            return fail("internal circuit did not settle");
        }
        if transitions
            .iter()
            .map(|t: &Transition| t.events.len())
            .sum::<usize>()
            + result.events.len()
            > MAX_EVENTS
        {
            return fail("extraction event admission budget exceeded");
        }
        transitions.push(Transition {
            before: before.clone(),
            after: after.clone(),
            events: result.events,
            energy_j: result.dynamic_energy_j,
        });
    }
    let mut provenance = BTreeSet::new();
    for i in &c.instances {
        provenance.extend(registry[&i.ic_id].macro_model.provenance.iter().cloned());
    }
    provenance.insert("SIMULATED_ARCHITECTURAL_MODEL: exhaustive pin transitions; source energies counted once per leaf input event; ideal wires (no unspecified parasitics)".into());
    summarize(
        &c.pins,
        states,
        transitions,
        conditions,
        provenance.into_iter().collect(),
    )
}
impl Packager<'_> {
    pub fn package_circuit(
        &mut self,
        id: &str,
        circuit: Circuit,
        registry: &Registry,
        conditions: Conditions,
        footprint: Footprint,
        checked_at: &str,
    ) -> Result<CustomIcPackage> {
        self.report("validate", 0, 1);
        validate_dependencies(registry, &circuit)?;
        for i in &circuit.instances {
            let mut todo = vec![i.ic_id.as_str()];
            let mut seen = BTreeSet::new();
            while let Some(child) = todo.pop() {
                if child == id {
                    return fail(format!("cyclic IC self-inclusion: {id}"));
                }
                if !seen.insert(child) {
                    continue;
                }
                let p = &registry[child];
                if p.macro_model.conditions.load_ff != conditions.load_ff
                    || p.macro_model.conditions.slew_ps != conditions.slew_ps
                    || p.macro_model.conditions.corner != conditions.corner
                {
                    return fail(
                        "sub-IC operating conditions mismatch; re-extract before composition",
                    );
                }
                if let Implementation::SubIcs { sub_ics, .. } = &p.implementation {
                    todo.extend(sub_ics.iter().map(String::as_str));
                }
            }
        }
        self.report("validate", 1, 1);
        self.report("extraction", 0, 2);
        let model = circuit_model(registry, &circuit, conditions.clone(), SolveMode::BlackBox)?;
        self.report("extraction", 1, 2);
        let reference = circuit_model(registry, &circuit, conditions, SolveMode::Flattened)?;
        self.report("extraction", 2, 2);
        let sub_ics = circuit
            .instances
            .iter()
            .map(|i| i.ic_id.clone())
            .collect::<BTreeSet<_>>()
            .into_iter()
            .collect();
        let pins = circuit.pins.clone();
        let p = finish(
            id,
            pins,
            Implementation::SubIcs {
                dependency_seals: circuit
                    .instances
                    .iter()
                    .map(|i| (i.ic_id.clone(), registry[&i.ic_id].content_seal.clone()))
                    .collect(),
                sub_ics,
                circuit,
            },
            model,
            reference,
            footprint,
            checked_at,
        )?;
        self.report("verification", 1, 1);
        Ok(p)
    }
}

/// A reusable black-box instance exposes only characterized pin behavior.
/// All dependency seals, schema constraints and verification gates are checked
/// once on construction; every requested state/transition is checked at use.
pub struct CustomIcInstance<'a> {
    package: &'a CustomIcPackage,
}
impl<'a> CustomIcInstance<'a> {
    pub fn new(registry: &'a Registry, id: &str) -> Result<Self> {
        validate_sub_ic_dag(registry, id)?;
        Ok(Self {
            package: &registry[id],
        })
    }
    pub fn state(&self, inputs: &[u8]) -> Result<&State> {
        self.package.macro_model.state(inputs)
    }
    pub fn transition(&self, before: &[u8], after: &[u8]) -> Result<Transition> {
        self.package.macro_model.transition(before, after)
    }
}
/// Re-run the full internal graph (or a refined Layer-1 solve), recompute the
/// tolerance gate and seal the resulting VERIFIED/STALE evidence. A modified
/// behavioral model cannot regain VERIFIED just by computing a new hash.
pub fn reverify(
    package: &mut CustomIcPackage,
    registry: &Registry,
    checked_at: &str,
) -> Result<Verification> {
    package.verification.status = Status::Stale;
    package.validate()?;
    let reference = match &package.implementation {
        Implementation::SubIcs { circuit, .. } => {
            validate_dependencies(registry, circuit)?;
            circuit_model(
                registry,
                circuit,
                package.macro_model.conditions.clone(),
                SolveMode::Flattened,
            )?
        }
        Implementation::Netlist {
            source: LeafSource::Transistors { netlist },
            ..
        } => {
            let mut refined = netlist.clone();
            refined.settings.dt_ps /= 2.0;
            raw_model(&refined, &package.macro_model.conditions)?
        }
        _ => return fail("characterized feed must be re-extracted from TimingLibrary"),
    };
    let evidence = compare_models(&package.pins, &package.macro_model, &reference, checked_at)?;
    if let Implementation::SubIcs {
        sub_ics,
        dependency_seals,
        ..
    } = &mut package.implementation
    {
        *dependency_seals = sub_ics
            .iter()
            .map(|id| (id.clone(), registry[id].content_seal.clone()))
            .collect();
    }
    package.verification = evidence.clone();
    package.validate()?;
    seal(package)?;
    Ok(evidence)
}

/// Verified 08 cell width/height plus caller-declared package depth. There is
/// no inferred silicon thickness or fabricated Q4 placement geometry.
pub fn hd_footprint(cell: &str, depth_um: f64) -> Result<Footprint> {
    radix::verify_embedded_reference().map_err(|e| PackageError(e.to_string()))?;
    let data: Value = serde_json::from_str(radix::embedded::CELLS_JSON)
        .map_err(|e| PackageError(e.to_string()))?;
    let fig = &data["parameters"]["sky130a_binary_cells"]["cells"][cell];
    let w = fig["width_um"]
        .as_f64()
        .ok_or_else(|| PackageError("unknown verified hd footprint".into()))?;
    let h = fig["height_um"]
        .as_f64()
        .ok_or_else(|| PackageError("missing verified hd height".into()))?;
    Ok(Footprint {kind:"sky130_hd".into(),dimensions_um:DimensionsUm {w,h,depth:depth_um},parametric_spec_ref:Some(format!("data/reference-library/08_standard_and_multiradix_cells.json#parameters.sky130a_binary_cells.cells.{cell}"))})
}
pub struct PackagedRegion {
    pub package: CustomIcPackage,
    pub dependencies: Registry,
}
impl PackagedRegion {
    pub fn install(self, registry: &mut Registry) -> Result<()> {
        let root = self.package.ic_id.clone();
        let mut pending = self.dependencies;
        pending.insert(root.clone(), self.package);
        for (id, p) in &pending {
            if registry
                .get(id)
                .is_some_and(|old| old.content_seal != p.content_seal)
            {
                return fail("IC identity collision; use a new icId");
            }
        }
        let mut inserted = Vec::new();
        for (id, p) in pending {
            if let std::collections::btree_map::Entry::Vacant(entry) = registry.entry(id) {
                inserted.push(entry.key().clone());
                entry.insert(p);
            }
        }
        if let Err(error) = validate_sub_ic_dag(registry, &root) {
            for id in inserted {
                registry.remove(&id);
            }
            return Err(error);
        }
        Ok(())
    }
}
impl Packager<'_> {
    /// Select a region of a WP-3.1 diagram. Selected IN/PROBE blocks become
    /// named boundary pins; crossing wires become explicit cut pins. All
    /// characterized timing is installed automatically (oracle defaults and
    /// caller-edited gate delays are never accepted as physical evidence).
    #[allow(clippy::too_many_arguments)]
    pub fn package_region(
        &mut self,
        id: &str,
        diagram: &LogicDiagram,
        selected: &[&str],
        conditions: Conditions,
        footprint: Footprint,
        leaf_footprints: &BTreeMap<String, Footprint>,
        checked_at: &str,
    ) -> Result<PackagedRegion> {
        if !(2..=8).contains(&diagram.radix.get()) {
            return fail("region radix outside 2..8");
        }
        let chosen: BTreeSet<_> = selected.iter().copied().collect();
        if chosen.len() != selected.len() || chosen.is_empty() || chosen.len() > MAX_INSTANCES {
            return fail("invalid region selection");
        }
        let mut ids = BTreeSet::new();
        for b in &diagram.blocks {
            if !ids.insert(b.id.as_str()) {
                return fail("duplicate diagram block");
            }
        }
        if !chosen.is_subset(&ids) {
            return fail("region references missing block");
        }
        let mut pins = Vec::new();
        let mut instances = Vec::new();
        let mut dependencies = Registry::new();
        for b in diagram
            .blocks
            .iter()
            .filter(|b| chosen.contains(b.id.as_str()))
        {
            match b.kind {
                ComponentKind::In => {
                    pins.push(Pin::digital(&b.id, Direction::Input, diagram.radix.get())?)
                }
                ComponentKind::Probe => {
                    pins.push(Pin::digital(&b.id, Direction::Output, diagram.radix.get())?)
                }
                _ => {
                    let leaf_id = format!("{id}-leaf-{}", instances.len());
                    let fp = leaf_footprints.get(b.kind.type_id()).ok_or_else(|| {
                        PackageError("region requires declared leaf footprint".into())
                    })?;
                    let leaf = self.package_primitive(
                        &leaf_id,
                        b.kind,
                        diagram.radix.get(),
                        conditions.clone(),
                        fp.clone(),
                        checked_at,
                    )?;
                    instances.push(Instance {
                        id: b.id.clone(),
                        ic_id: leaf_id.clone(),
                    });
                    dependencies.insert(leaf_id, leaf);
                }
            }
        }
        let mut wires = Vec::new();
        let mut cut_inputs: BTreeMap<(String, String), String> = BTreeMap::new();
        let mut cut_outputs: BTreeSet<(String, String)> = BTreeSet::new();
        for w in &diagram.wires {
            let from_inside = chosen.contains(w.from.block.as_str());
            let to_inside = chosen.contains(w.to.block.as_str());
            if !from_inside && !to_inside {
                continue;
            }
            let find = |e: &PortRef, dir| -> Result<ComponentKind> {
                let b = diagram
                    .blocks
                    .iter()
                    .find(|b| b.id == e.block)
                    .ok_or_else(|| PackageError("wire references missing block".into()))?;
                if !b
                    .kind
                    .ports()
                    .iter()
                    .any(|p| p.id == e.port && p.dir == dir)
                {
                    return fail("wire references invalid port/direction");
                }
                Ok(b.kind)
            };
            let from_kind = find(&w.from, PortDir::Out)?;
            let to_kind = find(&w.to, PortDir::In)?;
            let source = if !from_inside {
                let key = (w.from.block.clone(), w.from.port.clone());
                let name = cut_inputs
                    .entry(key)
                    .or_insert_with(|| format!("cut_in_{}", pins.len()))
                    .clone();
                if !pins.iter().any(|p| p.name == name) {
                    pins.push(Pin::digital(&name, Direction::Input, diagram.radix.get())?);
                }
                Endpoint::boundary(&name)
            } else if from_kind == ComponentKind::In {
                Endpoint::boundary(&w.from.block)
            } else {
                Endpoint::at(&w.from.block, &w.from.port)
            };
            let target = if !to_inside {
                let key = (w.from.block.clone(), w.from.port.clone());
                if !cut_outputs.insert(key) {
                    continue;
                }
                let name = format!("cut_out_{}_{}", w.from.block, w.from.port);
                pins.push(Pin::digital(&name, Direction::Output, diagram.radix.get())?);
                Endpoint::boundary(&name)
            } else if to_kind == ComponentKind::Probe {
                Endpoint::boundary(&w.to.block)
            } else {
                Endpoint::at(&w.to.block, &w.to.port)
            };
            wires.push(Connection {
                from: source,
                to: target,
            });
        }
        let circuit = Circuit {
            pins,
            instances,
            wires,
        };
        let package = self.package_circuit(
            id,
            circuit,
            &dependencies,
            conditions,
            footprint,
            checked_at,
        )?;
        Ok(PackagedRegion {
            package,
            dependencies,
        })
    }
}
