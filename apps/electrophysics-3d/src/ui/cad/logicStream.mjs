/**
 * WP-1.6 — Logic Analyzer event-stream interface (Phase 3 stub contract).
 *
 * The Phase 3 `ep-logic` kernel crate will publish radix-logic event
 * streams; this module is the typed frontend attach point they land in:
 * a validated stream descriptor (`attachLogicStream`), a bounded
 * pre-allocated event ring (`publishLogicEvents`, zero per-event object
 * allocation for the event slots themselves), change subscriptions for the
 * dock tab, and an honest inactive state — the tab renders
 * `SIMULATED_ARCHITECTURAL_MODEL` + "no logic stream attached" until a real
 * stream attaches. **No synthetic events are ever fabricated** (Builder
 * Rule 1): an attached stream with no publishes shows an empty, honestly
 * labeled buffer.
 *
 * Plain ESM (no imports) so the Node unit tests and the browser bundle
 * share the exact implementation.
 */

export const LOGIC_STREAM_FORMAT = 'invention-lab/ep-logic-event-stream/1';

/** Bounded event ring: the newest 512 events survive; the ring never grows. */
export const LOGIC_RING_EVENTS = 512;

const eventSlots = new Array(LOGIC_RING_EVENTS);
for (let i = 0; i < LOGIC_RING_EVENTS; i++) {
  eventSlots[i] = { t: 0, channel: '', value: 0, edge: '' };
}
let eventCursor = 0;
let eventFilled = 0;
let eventTotal = 0;
let eventRefusedTotal = 0;
let stream = null; // { name, channels, badge, format }
const logicListeners = new Set();
let notifyScheduled = false;

function notify() {
  if (notifyScheduled) return;
  notifyScheduled = true;
  queueMicrotask(() => {
    notifyScheduled = false;
    for (const fn of logicListeners) fn(getLogicStream());
  });
}

const isName = (v) => typeof v === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(v);

/**
 * Attach a logic event stream (the Phase 3 `ep-logic` publisher side).
 * Descriptor: `{ name, channels: string[] }` — channels are the declared
 * signal ids the stream may publish (1..32, each a short identifier).
 * Attaching replaces any previous stream and clears the event ring (a new
 * stream starts empty — honest, no stale rows).
 */
export function attachLogicStream(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') {
    throw new Error('logic stream descriptor required');
  }
  if (!isName(descriptor.name)) {
    throw new Error('logic stream name must be a short identifier');
  }
  const channels = descriptor.channels;
  if (
    !Array.isArray(channels) ||
    channels.length < 1 ||
    channels.length > 32 ||
    !channels.every((c) => isName(c)) ||
    new Set(channels).size !== channels.length
  ) {
    throw new Error('logic stream channels must be 1..32 unique short identifiers');
  }
  stream = {
    name: descriptor.name,
    channels: channels.slice(),
    badge: typeof descriptor.badge === 'string' ? descriptor.badge : 'SIMULATED_ARCHITECTURAL_MODEL',
    format: LOGIC_STREAM_FORMAT,
  };
  eventCursor = 0;
  eventFilled = 0;
  for (const slot of eventSlots) {
    slot.t = 0;
    slot.channel = '';
    slot.value = 0;
    slot.edge = '';
  }
  notify();
  return stream;
}

/** Detach the active stream (the tab returns to its honest inactive badge). */
export function detachLogicStream() {
  const had = stream !== null;
  stream = null;
  eventCursor = 0;
  eventFilled = 0;
  if (had) notify();
  return had;
}

/** The active stream descriptor, or `null` when none is attached. */
export function getLogicStream() {
  return stream;
}

/** Whether a stream is attached (drives the tab's honest badge). */
export function isLogicStreamActive() {
  return stream !== null;
}

/**
 * Publish events from the active stream. Every event must carry
 * `{ t, channel, value, edge? }` with `channel` declared by the stream
 * descriptor — unknown channels are **refused, never silently renamed**
 * (fail-closed), and the refusal is counted and returned. `t` advances the
 * ring monotonically; out-of-order timestamps are refused. Publishing with
 * no active stream is refused too. Returns
 * `{ accepted, refused, reasons }` (refusals carry per-event reasons).
 */
export function publishLogicEvents(events) {
  const reasons = [];
  let accepted = 0;
  if (!stream) {
    return { accepted: 0, refused: Array.isArray(events) ? events.length : 0, reasons: ['no logic stream attached'] };
  }
  if (!Array.isArray(events)) {
    return { accepted: 0, refused: 0, reasons: ['events must be an array'] };
  }
  const channelSet = new Set(stream.channels);
  let lastT = eventTotal === 0 ? -Infinity : eventSlots[(eventCursor - 1 + LOGIC_RING_EVENTS) % LOGIC_RING_EVENTS].t;
  for (const ev of events) {
    if (!ev || typeof ev !== 'object') {
      reasons.push('malformed event');
      eventRefusedTotal += 1;
      continue;
    }
    const { t, channel, value, edge } = ev;
    if (typeof t !== 'number' || !Number.isFinite(t) || t < 0) {
      reasons.push(`event t must be a finite ≥ 0 number (got ${String(t)})`);
      eventRefusedTotal += 1;
      continue;
    }
    if (t < lastT) {
      reasons.push(`event t ${t} is out of order (last ${lastT})`);
      eventRefusedTotal += 1;
      continue;
    }
    if (typeof channel !== 'string' || !channelSet.has(channel)) {
      reasons.push(`event channel '${String(channel)}' is not declared by stream '${stream.name}'`);
      eventRefusedTotal += 1;
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      reasons.push(`event value must be finite (got ${String(value)})`);
      eventRefusedTotal += 1;
      continue;
    }
    if (edge !== undefined && edge !== 'rising' && edge !== 'falling') {
      reasons.push(`event edge must be 'rising' | 'falling' (got ${String(edge)})`);
      eventRefusedTotal += 1;
      continue;
    }
    const slot = eventSlots[eventCursor];
    slot.t = t;
    slot.channel = channel;
    slot.value = value;
    slot.edge = edge === undefined ? '' : edge;
    eventCursor = (eventCursor + 1) % LOGIC_RING_EVENTS;
    if (eventFilled < LOGIC_RING_EVENTS) eventFilled += 1;
    lastT = t;
    eventTotal += 1;
    accepted += 1;
  }
  if (accepted > 0) notify();
  return { accepted, refused: reasons.length, reasons };
}

/** Read the event ring in chronological order (bounded view; no copies). */
export function readLogicEvents(max = LOGIC_RING_EVENTS) {
  const count = Math.min(max, eventFilled);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(eventSlots[(eventCursor - count + i + LOGIC_RING_EVENTS * 2) % LOGIC_RING_EVENTS]);
  }
  return out;
}

/** Monotonic totals for the tab's honesty line. */
export function logicEventStats() {
  return { total: eventTotal, refused: eventRefusedTotal, buffered: eventFilled, capacity: LOGIC_RING_EVENTS };
}

/** Subscribe to attach/detach/publish notifications. Returns unsubscribe. */
export function subscribeLogic(fn) {
  logicListeners.add(fn);
  return () => logicListeners.delete(fn);
}

/** Reset session state (unit-test isolation; never called per frame). */
export function resetLogicStream() {
  stream = null;
  eventCursor = 0;
  eventFilled = 0;
  eventTotal = 0;
  eventRefusedTotal = 0;
  for (const slot of eventSlots) {
    slot.t = 0;
    slot.channel = '';
    slot.value = 0;
    slot.edge = '';
  }
}

/** The API surface mounted on `window.__lab` for e2e determinism. */
export const logicSurfaceApi = {
  format: LOGIC_STREAM_FORMAT,
  attach: attachLogicStream,
  detach: detachLogicStream,
  publish: publishLogicEvents,
  get: getLogicStream,
  isActive: isLogicStreamActive,
  events: readLogicEvents,
  stats: logicEventStats,
};
