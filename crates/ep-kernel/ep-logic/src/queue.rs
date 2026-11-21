//! Deterministic discrete-event priority queue — byte-for-byte the ordering
//! contract of Phase 0 `js/core/events.js`: strictly ordered by
//! `(time, insertion sequence)` so identical diagrams always produce
//! identical runs (time is an integer tick, 1 tick = 1 ps nominal).

use crate::value::LogicValue;
use std::cmp::Reverse;

/// Scheduled work: deliver a value to a block input, or fire a scheduled
/// source callback (clock toggles).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EventPayload {
    Input {
        block_id: String,
        port_id: String,
        value: LogicValue,
    },
    /// Source callback (clock toggle) — emits `value` on `block_id.port_id`
    /// with zero additional delay at fire time.
    Callback {
        block_id: String,
        port_id: String,
        value: LogicValue,
    },
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct Node {
    time: u64,
    seq: u64,
    payload: EventPayload,
}

impl Ord for Node {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        (self.time, self.seq).cmp(&(other.time, other.seq))
    }
}

impl PartialOrd for Node {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

/// Min-heap on `(time, seq)` — the Phase 0 ordering contract.
#[derive(Debug, Default)]
pub struct EventQueue {
    heap: std::collections::BinaryHeap<std::cmp::Reverse<Node>>,
    seq: u64,
}

impl EventQueue {
    pub fn new() -> Self {
        Self::default()
    }

    /// Schedule `payload` at integer tick `time` (insertion sequence assigned
    /// here — the tie-breaker that makes runs reproducible).
    pub fn push(&mut self, time: u64, payload: EventPayload) {
        self.seq += 1;
        self.heap.push(Reverse(Node {
            time,
            seq: self.seq,
            payload,
        }));
    }

    /// Pop the earliest `(time, seq)` event, or `None` when empty.
    pub fn pop(&mut self) -> Option<(u64, EventPayload)> {
        self.heap
            .pop()
            .map(|Reverse(node)| (node.time, node.payload))
    }

    /// Pending event count.
    pub fn len(&self) -> usize {
        self.heap.len()
    }

    /// `true` when no events are pending.
    pub fn is_empty(&self) -> bool {
        self.heap.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn input(block: &str, port: &str, value: u8) -> EventPayload {
        EventPayload::Input {
            block_id: block.to_string(),
            port_id: port.to_string(),
            value: LogicValue::Digit(value),
        }
    }

    #[test]
    fn ordering_is_time_then_insertion_sequence() {
        let mut q = EventQueue::new();
        q.push(10, input("a", "x", 1));
        q.push(5, input("b", "x", 2));
        q.push(10, input("c", "x", 3));
        q.push(5, input("d", "x", 4));
        // time ascending; equal times in insertion order (c pushed before d).
        assert_eq!(q.pop(), Some((5, input("b", "x", 2))));
        assert_eq!(q.pop(), Some((5, input("d", "x", 4))));
        assert_eq!(q.pop(), Some((10, input("a", "x", 1))));
        assert_eq!(q.pop(), Some((10, input("c", "x", 3))));
        assert!(q.is_empty());
    }
}
