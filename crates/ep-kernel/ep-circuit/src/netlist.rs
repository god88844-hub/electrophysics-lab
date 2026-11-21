//! Netlist builder — node-name interning and element stamps, mirroring
//! `packages/physics-engine/src/mna.mjs` → `createNetlist`. Node index 0 is
//! the ground reference.

use crate::mosfet::MosfetParams;
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ElementKind {
    Resistor,
    VSource,
    ISource,
    Mosfet,
}

#[derive(Debug, Clone)]
pub struct Element {
    pub kind: ElementKind,
    pub label: String,
    /// Terminal node indices (ground = 0). Meaning per kind:
    ///   R/I: [a, b] current leaves a, enters b
    ///   V:   [a, b] branch eq v_a − v_b − V = 0; branch current leaves a
    ///   Q:   [g, d, s]
    pub nodes: [usize; 3],
    pub r: f64,
    pub v: f64,
    pub i: f64,
    pub mosfet: Option<MosfetParams>,
    /// Permanent post-breakdown fault: gate tied to source through `gate_short_r`.
    pub gate_shorted: bool,
    pub gate_short_r: f64,
}

impl Element {
    pub fn is_v_source(&self) -> bool {
        self.kind == ElementKind::VSource
    }
}

#[derive(Debug, Clone)]
pub struct Netlist {
    pub node_names: Vec<String>,
    node_index: HashMap<String, usize>,
    pub elements: Vec<Element>,
}

impl Netlist {
    /// `node_names[0]` is the ground reference (V = 0).
    pub fn new(node_names: &[&str]) -> Self {
        Self {
            node_names: node_names.iter().map(|s| s.to_string()).collect(),
            node_index: node_names
                .iter()
                .enumerate()
                .map(|(i, s)| (s.to_string(), i))
                .collect(),
            elements: Vec::new(),
        }
    }

    pub fn n_nodes(&self) -> usize {
        self.node_names.len()
    }

    pub fn node_index(&self, name: &str) -> Option<usize> {
        self.node_index.get(name).copied()
    }

    fn idx(&self, name: &str) -> usize {
        *self.node_index.get(name).expect("unknown node name")
    }

    pub fn add_resistor(&mut self, a: &str, b: &str, r: f64, label: &str) {
        let (ia, ib) = (self.idx(a), self.idx(b));
        self.elements.push(Element {
            kind: ElementKind::Resistor,
            label: label.to_string(),
            nodes: [ia, ib, 0],
            r,
            v: 0.0,
            i: 0.0,
            mosfet: None,
            gate_shorted: false,
            gate_short_r: 0.0,
        });
    }

    pub fn add_v_source(&mut self, a: &str, b: &str, v: f64, label: &str) {
        let (ia, ib) = (self.idx(a), self.idx(b));
        self.elements.push(Element {
            kind: ElementKind::VSource,
            label: label.to_string(),
            nodes: [ia, ib, 0],
            r: 0.0,
            v,
            i: 0.0,
            mosfet: None,
            gate_shorted: false,
            gate_short_r: 0.0,
        });
    }

    pub fn add_i_source(&mut self, a: &str, b: &str, i: f64, label: &str) {
        let (ia, ib) = (self.idx(a), self.idx(b));
        self.elements.push(Element {
            kind: ElementKind::ISource,
            label: label.to_string(),
            nodes: [ia, ib, 0],
            r: 0.0,
            v: 0.0,
            i,
            mosfet: None,
            gate_shorted: false,
            gate_short_r: 0.0,
        });
    }

    pub fn add_mosfet(&mut self, label: &str, g: &str, d: &str, s: &str, params: MosfetParams) {
        let (ig, id_, is_) = (self.idx(g), self.idx(d), self.idx(s));
        self.elements.push(Element {
            kind: ElementKind::Mosfet,
            label: label.to_string(),
            nodes: [ig, id_, is_],
            r: 0.0,
            v: 0.0,
            i: 0.0,
            mosfet: Some(params),
            gate_shorted: false,
            gate_short_r: 1.0,
        });
    }

    /// Voltage sources in stamp order (branch-current unknowns follow node order).
    pub fn v_sources(&self) -> Vec<&Element> {
        self.elements.iter().filter(|e| e.is_v_source()).collect()
    }

    pub fn v_source_count(&self) -> usize {
        self.v_sources().len()
    }

    pub fn mosfet_mut(&mut self, label: &str) -> Option<&mut Element> {
        self.elements
            .iter_mut()
            .find(|e| e.kind == ElementKind::Mosfet && e.label == label)
    }

    pub fn resistor_mut(&mut self, label: &str) -> Option<&mut Element> {
        self.elements
            .iter_mut()
            .find(|e| e.kind == ElementKind::Resistor && e.label == label)
    }

    pub fn element(&self, label: &str) -> Option<&Element> {
        self.elements.iter().find(|e| e.label == label)
    }
}
