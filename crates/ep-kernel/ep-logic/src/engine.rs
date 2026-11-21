//! Discrete-event engine — a 1:1 port of Phase 0 `js/labs/logic/engine.js`
//! (the §5 CI oracle: "identical truth tables, identical event order").
//!
//! Honest-behavior rules (mirrored from the oracle):
//!  - unconnected inputs read `'Z'` and `'Z'` propagates; a warning is emitted,
//!  - an input driven by 2+ outputs is flagged (contention, last-write-wins
//!    by `(time, seq)` — the oracle processes every driver event too),
//!  - event storms (oscillation) abort with an explicit error,
//!  - outputs only emit when the *output value* changes; input events dedup
//!    on the current input value,
//!  - probes record every value change over simulated time (empty records are
//!    back-filled with `(0, 'Z')`).
//!
//! Beyond the oracle: every queue delivery is recorded into a structured
//! event stream (`RunResult::events`) for WP-1.6's Logic Analyzer — the same
//! pop sequence the oracle produces, so parity is checkable element-by-element
//! against the committed golden fixtures.

use serde::Serialize;

use crate::components::{eval, BlockParams, BlockState, ComponentKind, PortDir};
use crate::queue::{EventPayload, EventQueue};
use crate::radix::Radix;
use crate::value::LogicValue;

/// A block instance (oracle `diagram.blocks` entry).
#[derive(Debug, Clone)]
pub struct Block {
    pub id: String,
    pub kind: ComponentKind,
    pub params: BlockParams,
}

/// A wire: `from.block.from.port → to.block.to.port`.
#[derive(Debug, Clone)]
pub struct Wire {
    pub from: PortRef,
    pub to: PortRef,
}

/// Endpoint reference.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PortRef {
    pub block: String,
    pub port: String,
}

/// Logic diagram (oracle `diagram`): radix + blocks + wires.
#[derive(Debug, Clone, Default)]
pub struct LogicDiagram {
    pub radix: Radix,
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
}

impl LogicDiagram {
    /// Wires driving `block_id.port_id` whose source block exists
    /// (oracle `diagram.driversOf`).
    pub fn drivers_of(&self, block_id: &str, port_id: &str) -> usize {
        self.wires
            .iter()
            .filter(|w| {
                w.to.block == block_id
                    && w.to.port == port_id
                    && self.blocks.iter().any(|b| b.id == w.from.block)
            })
            .count()
    }
}

/// Structured event-stream record — the Logic Analyzer surface (WP-1.6).
/// Serialization matches the golden fixtures byte-for-byte (camelCase keys,
/// digits as JSON numbers, `'Z'` as the string `"Z"`).
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(untagged)]
pub enum EventRecord {
    Input {
        time: u64,
        #[serde(rename = "type")]
        kind: InputTag,
        #[serde(rename = "blockId")]
        block_id: String,
        #[serde(rename = "portId")]
        port_id: String,
        value: LogicValue,
    },
    Callback {
        time: u64,
        #[serde(rename = "type")]
        kind: CallbackTag,
    },
}

/// Input-event tag (serializes as `"input"`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum InputTag {
    #[serde(rename = "input")]
    Input,
}

/// Callback tag (serializes as `"callback"`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum CallbackTag {
    #[serde(rename = "callback")]
    Callback,
}

/// Probe record (oracle `probes[blockId]`).
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbeRecord {
    pub times: Vec<u64>,
    pub values: Vec<LogicValue>,
    pub label: String,
}

/// Run statistics (oracle `stats`).
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunStats {
    pub events: u64,
    pub max_time: u64,
    pub radix: u32,
}

/// Simulation failure — the honest abort paths.
#[derive(Debug, Clone, PartialEq)]
pub enum RunError {
    /// Event storm / oscillation (oracle throws the same message).
    Oscillation { max_events: u64, at_time: u64 },
    /// Radix below 2 (oracle: `Logic radix must be >= 2`).
    InvalidRadix(String),
}

impl std::fmt::Display for RunError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RunError::Oscillation {
                max_events,
                at_time,
            } => write!(
                f,
                "Event storm / oscillation detected (> {max_events} events at t={at_time}). \
                 Check for combinational feedback loops (e.g. a NOT gate feeding itself)."
            ),
            RunError::InvalidRadix(msg) => write!(f, "{msg}"),
        }
    }
}

impl std::error::Error for RunError {}

/// Successful run — ok/problems/warnings/probes/stats exactly like the
/// oracle, plus the structured event stream.
#[derive(Debug, Clone)]
pub struct RunResult {
    pub ok: bool,
    pub problems: Vec<String>,
    pub warnings: Vec<String>,
    /// Probe records keyed by block id (insertion order preserved).
    pub probes: Vec<(String, ProbeRecord)>,
    pub stats: RunStats,
    /// Every queue delivery in `(time, seq)` order — the WP-1.6 event stream
    /// and the fixture-parity surface.
    pub events: Vec<EventRecord>,
}

/// Options (oracle `opts`).
#[derive(Debug, Clone, Copy)]
pub struct RunOptions {
    /// Abort above this many processed events (default 250 000).
    pub max_events: u64,
    /// Clock scheduling window (default 4000 — clocks schedule toggles up to
    /// `maxTicks + period`).
    pub max_ticks: u64,
}

impl Default for RunOptions {
    fn default() -> Self {
        Self {
            max_events: 250_000,
            max_ticks: 4000,
        }
    }
}

/// Run a logic diagram to quiescence (or honest abort). Deterministic:
/// identical diagrams always produce identical runs.
pub fn run_logic(diagram: &LogicDiagram, opts: RunOptions) -> Result<RunResult, RunError> {
    if diagram.radix.get() < 2 {
        return Err(RunError::InvalidRadix(
            "Logic radix must be >= 2".to_string(),
        ));
    }

    // ---- index the netlist -------------------------------------------------
    let mut fanout: std::collections::HashMap<(String, String), Vec<(String, String)>> =
        std::collections::HashMap::new();
    for w in &diagram.wires {
        fanout
            .entry((w.from.block.clone(), w.from.port.clone()))
            .or_default()
            .push((w.to.block.clone(), w.to.port.clone()));
    }

    // ---- per-block runtime state ------------------------------------------
    struct BlockState_<'a> {
        block: &'a Block,
        inputs: Vec<(&'static str, LogicValue)>,
        /// Oracle `s.out` starts as `{}` — ports are UNSET until first emit
        /// (a first `'Z'` output must still be emitted, never deduped).
        out: Vec<(&'static str, Option<LogicValue>)>,
        state: BlockState,
        probe: Option<ProbeRecord>,
    }
    let mut st: Vec<BlockState_> = Vec::with_capacity(diagram.blocks.len());
    // Unknown component types cannot be constructed here (fail-closed at
    // the API boundary), so the problem list stays empty — the oracle records
    // unknown-type problems, mirrored as build-time refusals instead.
    let problems: Vec<String> = Vec::new();
    for b in &diagram.blocks {
        // Inputs start at 'Z' so partially-connected blocks behave honestly.
        let inputs = b
            .kind
            .input_ports()
            .iter()
            .map(|p| (*p, LogicValue::Z))
            .collect();
        let out = b
            .kind
            .ports()
            .iter()
            .filter(|p| p.dir == PortDir::Out)
            .map(|p| (p.id, None))
            .collect();
        let probe = if b.kind == ComponentKind::Probe {
            Some(ProbeRecord {
                times: Vec::new(),
                values: Vec::new(),
                label: b.params.name.clone().unwrap_or_else(|| b.id.clone()),
            })
        } else {
            None
        };
        st.push(BlockState_ {
            block: b,
            inputs,
            out,
            state: BlockState::default(),
            probe,
        });
    }
    let find = |st: &[BlockState_<'_>], id: &str| st.iter().position(|s| s.block.id == id);

    let mut queue = EventQueue::new();
    let mut time: u64 = 0;

    // Emit an output: record it on the block, then queue one input event per
    // fanout target at `time + delay` (oracle `emitOutput`).
    macro_rules! emit_output {
        ($st:expr, $block_id:expr, $port_id:expr, $value:expr, $time:expr, $delay:expr) => {{
            let (block_id, port_id, value, time, delay) =
                ($block_id, $port_id, $value, $time, $delay);
            if let Some(i) = find(&$st, &block_id) {
                if let Some(slot) = $st[i].out.iter_mut().find(|(p, _)| *p == port_id) {
                    slot.1 = Some(value);
                }
                if let Some(targets) = fanout.get(&(block_id.clone(), port_id.to_string())) {
                    for (tb, tp) in targets {
                        queue.push(
                            time + delay,
                            EventPayload::Input {
                                block_id: tb.clone(),
                                port_id: tp.clone(),
                                value,
                            },
                        );
                    }
                }
            }
        }};
    }

    // ---- init: inputs + clocks drive the net (t = 0) -----------------------
    for i in 0..st.len() {
        let (kind, params) = (st[i].block.kind, st[i].block.params.clone());
        let block_id = st[i].block.id.clone();
        match kind {
            ComponentKind::In | ComponentKind::Const => {
                let v = LogicValue::Digit(params.value.min(15) as u8);
                emit_output!(st, block_id, "out", v, 0, 0);
            }
            ComponentKind::Dff => {
                st[i].state.dff_last_clk = LogicValue::Digit(0);
                let v = LogicValue::Digit(params.init.min(15) as u8);
                emit_output!(st, block_id, "q", v, 0, 0);
            }
            ComponentKind::Clock => {
                // Square wave 0 ↔ (radix−1): toggles at t = half and
                // t = half + (period − half), repeating; scheduled up to
                // maxTicks + period (oracle `init` window).
                let period = params.period.max(2);
                let half = ((period as f64 * params.duty).round() as u64).max(1);
                let high = LogicValue::Digit(diagram.radix.max_digit());
                let mut t = half;
                while t <= opts.max_ticks.saturating_add(period) {
                    queue.push(
                        t,
                        EventPayload::Callback {
                            block_id: block_id.clone(),
                            port_id: "out".into(),
                            value: high,
                        },
                    );
                    queue.push(
                        t + (period - half),
                        EventPayload::Callback {
                            block_id: block_id.clone(),
                            port_id: "out".into(),
                            value: LogicValue::Digit(0),
                        },
                    );
                    t += period;
                }
            }
            _ => {}
        }
    }

    // ---- evaluate one block (oracle `evaluate`) ----------------------------
    // Returns true when a probe recorded a change.
    fn evaluate(
        st: &mut [BlockState_<'_>],
        i: usize,
        changed: Option<&'static str>,
        time: u64,
        radix: Radix,
        queue: &mut EventQueue,
        fanout: &std::collections::HashMap<(String, String), Vec<(String, String)>>,
    ) {
        let (kind, params) = (st[i].block.kind, st[i].block.params.clone());
        if kind == ComponentKind::Probe {
            let v = st[i]
                .inputs
                .iter()
                .find(|(p, _)| *p == "in")
                .map(|(_, v)| *v)
                .unwrap_or(LogicValue::Z);
            let rec = st[i].probe.as_mut().unwrap();
            let last_changed = match rec.values.last() {
                None => true,
                Some(last) => *last != v,
            };
            if last_changed {
                rec.times.push(time);
                rec.values.push(v);
            }
            return;
        }
        // Build the input view for eval (port-id → value).
        let input_view: std::collections::HashMap<&'static str, LogicValue> =
            st[i].inputs.iter().copied().collect();
        let mut state = st[i].state.clone();
        let outs = eval(kind, radix, &params, &mut state, &input_view, changed);
        st[i].state = state;
        let block_id = st[i].block.id.clone();
        for (port, val) in outs {
            let emitted = st[i]
                .out
                .iter()
                .find(|(p, _)| *p == port)
                .and_then(|(_, v)| *v);
            if emitted == Some(val) {
                continue; // oracle: outputs only emit when the value changes
            }
            let delay = params.output_delay(port);
            // oracle `emitOutput`
            if let Some(slot) = st[i].out.iter_mut().find(|(p, _)| *p == port) {
                slot.1 = Some(val);
            }
            if let Some(targets) = fanout.get(&(block_id.clone(), port.to_string())) {
                for (tb, tp) in targets {
                    queue.push(
                        time + delay,
                        EventPayload::Input {
                            block_id: tb.clone(),
                            port_id: tp.clone(),
                            value: val,
                        },
                    );
                }
            }
        }
    }

    // ---- event loop ---------------------------------------------------------
    let mut events_count: u64 = 0;
    let mut event_stream: Vec<EventRecord> = Vec::new();
    while let Some((ev_time, payload)) = queue.pop() {
        time = ev_time;
        events_count += 1;
        if events_count > opts.max_events {
            return Err(RunError::Oscillation {
                max_events: opts.max_events,
                at_time: time,
            });
        }
        match payload {
            EventPayload::Callback { .. } => {
                event_stream.push(EventRecord::Callback {
                    time: ev_time,
                    kind: CallbackTag::Callback,
                });
                let (block_id, port_id, value) = match payload {
                    EventPayload::Callback {
                        block_id,
                        port_id,
                        value,
                    } => (block_id, port_id, value),
                    _ => unreachable!(),
                };
                // Oracle callbacks: `p.fn()` → api.emit → emitOutput(…, 0 delay).
                if let Some(i) = find(&st, &block_id) {
                    if let Some(slot) = st[i].out.iter_mut().find(|(p, _)| *p == port_id) {
                        slot.1 = Some(value);
                    }
                    if let Some(targets) = fanout.get(&(block_id.clone(), port_id.clone())) {
                        for (tb, tp) in targets {
                            queue.push(
                                ev_time,
                                EventPayload::Input {
                                    block_id: tb.clone(),
                                    port_id: tp.clone(),
                                    value,
                                },
                            );
                        }
                    }
                }
            }
            EventPayload::Input {
                block_id,
                port_id,
                value,
            } => {
                event_stream.push(EventRecord::Input {
                    time: ev_time,
                    kind: InputTag::Input,
                    block_id: block_id.clone(),
                    port_id: port_id.clone(),
                    value,
                });
                let Some(i) = find(&st, &block_id) else {
                    continue;
                };
                let port_static = st[i]
                    .block
                    .kind
                    .input_ports()
                    .iter()
                    .find(|p| **p == port_id)
                    .copied();
                let Some(port_static) = port_static else {
                    continue;
                };
                // oracle: `if (s.inputs[p.portId] === p.value) continue;`
                if st[i]
                    .inputs
                    .iter()
                    .find(|(p, _)| *p == port_static)
                    .map(|(_, v)| *v)
                    == Some(value)
                {
                    continue;
                }
                if let Some(slot) = st[i].inputs.iter_mut().find(|(p, _)| *p == port_static) {
                    slot.1 = value;
                }
                evaluate(
                    &mut st,
                    i,
                    Some(port_static),
                    ev_time,
                    diagram.radix,
                    &mut queue,
                    &fanout,
                );
            }
        }
    }

    // ---- structural warnings ------------------------------------------------
    let mut warnings: Vec<String> = Vec::new();
    for s in &st {
        for port in s.block.kind.ports().iter().filter(|p| p.dir == PortDir::In) {
            let n_drivers = diagram.drivers_of(&s.block.id, port.id);
            let reads_z = s
                .inputs
                .iter()
                .find(|(p, _)| *p == port.id)
                .map(|(_, v)| v.is_z())
                .unwrap_or(true);
            if n_drivers == 0 && reads_z {
                warnings.push(format!(
                    "Block {}: input \"{}\" unconnected (reads 'Z').",
                    s.block.id, port.id
                ));
            } else if n_drivers > 1 {
                warnings.push(format!(
                    "Block {}: input \"{}\" driven by {} outputs — contention, result not meaningful.",
                    s.block.id, port.id, n_drivers
                ));
            }
        }
    }

    // ---- collect probe records ----------------------------------------------
    let mut probes: Vec<(String, ProbeRecord)> = Vec::new();
    for s in &st {
        let Some(mut rec) = s.probe.clone() else {
            continue;
        };
        if rec.values.is_empty() {
            rec.times.push(0);
            rec.values.push(LogicValue::Z);
        }
        probes.push((s.block.id.clone(), rec));
    }

    Ok(RunResult {
        ok: problems.is_empty(),
        problems,
        warnings,
        probes,
        stats: RunStats {
            events: events_count,
            max_time: time,
            radix: diagram.radix.get(),
        },
        events: event_stream,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::components::ComponentKind;

    fn block(id: &str, kind: ComponentKind, params: BlockParams) -> Block {
        Block {
            id: id.to_string(),
            kind,
            params,
        }
    }

    fn wire(from: (&str, &str), to: (&str, &str)) -> Wire {
        Wire {
            from: PortRef {
                block: from.0.into(),
                port: from.1.into(),
            },
            to: PortRef {
                block: to.0.into(),
                port: to.1.into(),
            },
        }
    }

    #[test]
    fn binary_not_chain_propagates_through_the_event_queue() {
        let d = LogicDiagram {
            radix: Radix::BINARY,
            blocks: vec![
                block(
                    "IN",
                    ComponentKind::In,
                    BlockParams {
                        value: 1,
                        ..Default::default()
                    },
                ),
                block("NOT", ComponentKind::Not, BlockParams::default()),
                block("P", ComponentKind::Probe, BlockParams::default()),
            ],
            wires: vec![
                wire(("IN", "out"), ("NOT", "a")),
                wire(("NOT", "y"), ("P", "in")),
            ],
        };
        let res = run_logic(&d, RunOptions::default()).unwrap();
        assert!(res.ok);
        // IN emits 1 at t=0 (init) → NOT.a delivery @0 → y=0 emitted → P.in @10.
        // Events are QUEUE DELIVERIES (the oracle pop order): 2 deliveries.
        let (_, rec) = &res.probes[0];
        assert_eq!(rec.times, vec![10]);
        assert_eq!(rec.values, vec![LogicValue::Digit(0)]);
        assert_eq!(res.stats.events, 2, "NOT.a delivery + P.in delivery");
        assert_eq!(res.stats.max_time, 10);
        // First pop: the NOT.a input event queued by IN's init emit.
        assert_eq!(
            serde_json::to_value(&res.events[0]).unwrap(),
            serde_json::json!({"time": 0, "type": "input", "blockId": "NOT", "portId": "a", "value": 1})
        );
    }

    #[test]
    fn oscillating_self_loop_aborts_with_the_oracle_error() {
        let d = LogicDiagram {
            radix: Radix::BINARY,
            blocks: vec![
                block(
                    "IN",
                    ComponentKind::In,
                    BlockParams {
                        value: 0,
                        ..Default::default()
                    },
                ),
                block("NOT", ComponentKind::Not, BlockParams::default()),
                block("P", ComponentKind::Probe, BlockParams::default()),
            ],
            wires: vec![
                wire(("IN", "out"), ("NOT", "a")),
                wire(("NOT", "y"), ("NOT", "a")), // self-loop on top of the driver
                wire(("NOT", "y"), ("P", "in")),
            ],
        };
        let err = run_logic(
            &d,
            RunOptions {
                max_events: 2000,
                max_ticks: 4000,
            },
        )
        .unwrap_err();
        match err {
            RunError::Oscillation { max_events, .. } => assert_eq!(max_events, 2000),
            other => panic!("expected oscillation, got {other:?}"),
        }
        assert!(err.to_string().contains("oscillation"));
        assert!(err.to_string().contains("NOT gate feeding itself"));
    }

    #[test]
    fn contention_is_last_write_wins_by_event_order_plus_warning() {
        let d = LogicDiagram {
            radix: Radix::BINARY,
            blocks: vec![
                block(
                    "I1",
                    ComponentKind::In,
                    BlockParams {
                        value: 0,
                        ..Default::default()
                    },
                ),
                block(
                    "I2",
                    ComponentKind::In,
                    BlockParams {
                        value: 1,
                        ..Default::default()
                    },
                ),
                block("P", ComponentKind::Probe, BlockParams::default()),
            ],
            wires: vec![
                wire(("I1", "out"), ("P", "in")),
                wire(("I2", "out"), ("P", "in")),
            ],
        };
        let res = run_logic(&d, RunOptions::default()).unwrap();
        // Oracle warning text, exact.
        assert_eq!(
            res.warnings,
            vec![
                "Block P: input \"in\" driven by 2 outputs — contention, result not meaningful."
                    .to_string()
            ]
        );
        // Both events delivered in seq order → probe records (0,0) then (0,1).
        let (_, rec) = &res.probes[0];
        assert_eq!(rec.times, vec![0, 0]);
        assert_eq!(rec.values, vec![LogicValue::Digit(0), LogicValue::Digit(1)]);
    }

    #[test]
    fn unconnected_input_warns_and_z_reaches_the_probe() {
        let d = LogicDiagram {
            radix: Radix::BINARY,
            blocks: vec![
                block("ANDG", ComponentKind::And, BlockParams::default()),
                block("PY", ComponentKind::Probe, BlockParams::default()),
            ],
            wires: vec![wire(("ANDG", "y"), ("PY", "in"))],
        };
        let res = run_logic(&d, RunOptions::default()).unwrap();
        assert_eq!(
            res.warnings,
            vec![
                "Block ANDG: input \"a\" unconnected (reads 'Z').".to_string(),
                "Block ANDG: input \"b\" unconnected (reads 'Z').".to_string()
            ]
        );
        let (_, rec) = &res.probes[0];
        assert_eq!(rec.values, vec![LogicValue::Z]);
        assert_eq!(rec.times, vec![0]); // back-filled (no change ever recorded)
    }

    #[test]
    fn radix_below_two_fails_closed() {
        // Radix::new rejects < 2 at the API boundary; the engine's guard is
        // defense in depth for crate-internal misuse (crate-visible field).
        assert!(Radix::new(1).is_err());
        let invalid = Radix(1);
        let err = run_logic(
            &LogicDiagram {
                radix: invalid,
                blocks: vec![],
                wires: vec![],
            },
            RunOptions::default(),
        )
        .unwrap_err();
        assert_eq!(
            err,
            RunError::InvalidRadix("Logic radix must be >= 2".to_string())
        );
    }

    #[test]
    fn event_stream_records_match_the_oracle_pop_order() {
        let d = LogicDiagram {
            radix: Radix::Q4,
            blocks: vec![
                block(
                    "A",
                    ComponentKind::In,
                    BlockParams {
                        value: 3,
                        ..Default::default()
                    },
                ),
                block(
                    "B",
                    ComponentKind::In,
                    BlockParams {
                        value: 2,
                        ..Default::default()
                    },
                ),
                block("ADD", ComponentKind::AddN, BlockParams::default()),
                block(
                    "PS",
                    ComponentKind::Probe,
                    BlockParams {
                        name: Some("SUM".into()),
                        ..Default::default()
                    },
                ),
            ],
            wires: vec![
                wire(("A", "out"), ("ADD", "a")),
                wire(("B", "out"), ("ADD", "b")),
                wire(("ADD", "sum"), ("PS", "in")),
            ],
        };
        let res = run_logic(&d, RunOptions::default()).unwrap();
        // No cin driver: ADDN honest-Z semantics — a=3 arrives → evaluate with
        // b=Z → sum Z (first Z output EMITS, out is unset); b=2 → still Z (dedup);
        // cin never driven → outputs stay Z forever (honest).
        let records = serde_json::to_value(&res.events).unwrap();
        let arr = records.as_array().unwrap();
        // First pops: the input events queued by the IN init emits.
        assert_eq!(
            arr[0],
            serde_json::json!({"time": 0, "type": "input", "blockId": "ADD", "portId": "a", "value": 3})
        );
        assert_eq!(
            arr[1],
            serde_json::json!({"time": 0, "type": "input", "blockId": "ADD", "portId": "b", "value": 2})
        );
        // The first Z output reaches the probe at t=10.
        assert_eq!(
            arr[2],
            serde_json::json!({"time": 10, "type": "input", "blockId": "PS", "portId": "in", "value": "Z"})
        );
        assert_eq!(res.stats.events, 3);
    }
}
