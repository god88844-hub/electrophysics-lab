/**
 * WP-1.6 — frontend admission-refusal surface (the UI half of the §2.3
 * fail-closed admission contract).
 *
 * The kernel-side admission controller lives in `ep-core` (WP-1.2, Rust,
 * 16 unit tests). This module is its UI reflection: the typed refusal
 * payload `{ admitted: false, reason }` that `AdmissionBanner.tsx` renders
 * in the dock and the status bar, plus the runtime detection of workloads
 * that exceed the §2.3 interactive budgets at the frame boundary.
 *
 * Budgets are the documented interactive budgets of
 * `docs/master-plan/02_SYSTEM_ARCHITECTURE.md` §2.3 — the same constants
 * `ep-core` enforces and the desktop shell mirrors (WP-1.1). Refusal
 * reasons carry the requested value, the exact limit and the citation, and
 * are passed through **verbatim** to the UI — never clamped, summarized
 * away, or hidden (Builder Rule 1 / Law 4).
 *
 * Plain ESM (no imports) so the Node unit tests (tests/wp16-admission
 * -dock.test.mjs) and the browser bundle share the exact same
 * implementation — same pattern as src/engine/solverFrame.mjs.
 */

export const ADMISSION_SOURCE =
  'docs/master-plan/02_SYSTEM_ARCHITECTURE.md §2.3 (interactive budgets)';

/** Documented §2.3 interactive budgets (identical to ep-core's constants). */
export const ADMISSION_BUDGETS = Object.freeze({
  quantumMaxQubits: 6, // interactive density matrix: n ≤ 6 (d ≤ 64), 60 Hz
  mnaMaxNodes: 64, // MNA netlist per frame
  mnaMaxVoltageSources: 32, // MNA voltage sources per frame
  thermalMaxCols: 128, // thermal grid per workspace
  thermalMaxRows: 128,
  arenaMaxBytes: 536870912, // 512 MiB kernel arena (app ≤ 2 GB, Law 4)
});

/** The four budget domains of §2.3 (one refusal class each). */
export const ADMISSION_DOMAINS = Object.freeze(['quantum', 'mna', 'thermal', 'arena']);

const REFUSAL_RING_LEN = 8;
const refusalRing = new Array(REFUSAL_RING_LEN);
for (let i = 0; i < REFUSAL_RING_LEN; i++) {
  refusalRing[i] = { admitted: false, reason: '', domain: '', requested: 0, limit: 0, tsUnixMs: 0 };
}
let refusalCursor = 0;
let refusalCount = 0;
let latestRefusal = null; // stable reference between publishes (React snapshot)
const refusalListeners = new Set();
let notifyScheduled = false;

/**
 * Evaluate one workload against the §2.3 budgets.
 *
 * Request shapes (domain → measures):
 * - `quantum`: `{ domain:'quantum', qubits }`
 * - `mna`: `{ domain:'mna', nodes, voltageSources? }`
 * - `thermal`: `{ domain:'thermal', cols, rows }`
 * - `arena`: `{ domain:'arena', bytes }`
 *
 * Returns `{ admitted: true, request }` or an honest refusal
 * `{ admitted: false, reason, domain, requested, limit }`. Non-finite or
 * negative measures are refused too (fail-closed — no silent clamps).
 */
export function admitWorkload(request) {
  if (!request || typeof request !== 'object') {
    return refuse('mna', NaN, ADMISSION_BUDGETS.mnaMaxNodes, 'malformed admission request');
  }
  const domain = request.domain;
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
  switch (domain) {
    case 'quantum': {
      const qubits = num(request.qubits);
      if (!(qubits >= 0)) return refuse('quantum', qubits, ADMISSION_BUDGETS.quantumMaxQubits, 'non-finite qubit count');
      if (qubits > ADMISSION_BUDGETS.quantumMaxQubits) {
        return refuse(
          'quantum',
          qubits,
          ADMISSION_BUDGETS.quantumMaxQubits,
          `admission refused: quantum workload requests ${qubits} qubits, interactive budget is ≤ ${ADMISSION_BUDGETS.quantumMaxQubits} (density matrix d ≤ 64) — ${ADMISSION_SOURCE}`
        );
      }
      return { admitted: true, request };
    }
    case 'mna': {
      const nodes = num(request.nodes);
      const vsrc = request.voltageSources === undefined ? 0 : num(request.voltageSources);
      if (!(nodes >= 0)) return refuse('mna', nodes, ADMISSION_BUDGETS.mnaMaxNodes, 'non-finite node count');
      if (nodes > ADMISSION_BUDGETS.mnaMaxNodes) {
        return refuse(
          'mna',
          nodes,
          ADMISSION_BUDGETS.mnaMaxNodes,
          `admission refused: MNA workload requests ${nodes} nodes, budget is ≤ ${ADMISSION_BUDGETS.mnaMaxNodes} per frame — ${ADMISSION_SOURCE}`
        );
      }
      if (!(vsrc >= 0)) return refuse('mna', vsrc, ADMISSION_BUDGETS.mnaMaxVoltageSources, 'non-finite voltage-source count');
      if (vsrc > ADMISSION_BUDGETS.mnaMaxVoltageSources) {
        return refuse(
          'mna',
          vsrc,
          ADMISSION_BUDGETS.mnaMaxVoltageSources,
          `admission refused: MNA workload requests ${vsrc} voltage sources, budget is ≤ ${ADMISSION_BUDGETS.mnaMaxVoltageSources} per frame — ${ADMISSION_SOURCE}`
        );
      }
      return { admitted: true, request };
    }
    case 'thermal': {
      const cols = num(request.cols);
      const rows = num(request.rows);
      const lim = `${ADMISSION_BUDGETS.thermalMaxCols}×${ADMISSION_BUDGETS.thermalMaxRows}`;
      if (!(cols >= 0) || !(rows >= 0)) return refuse('thermal', NaN, NaN, 'non-finite thermal grid measure');
      if (cols > ADMISSION_BUDGETS.thermalMaxCols || rows > ADMISSION_BUDGETS.thermalMaxRows) {
        return refuse(
          'thermal',
          Math.max(cols, rows),
          Math.max(ADMISSION_BUDGETS.thermalMaxCols, ADMISSION_BUDGETS.thermalMaxRows),
          `admission refused: thermal workload requests ${cols}×${rows} cells, budget is ≤ ${lim} per workspace — ${ADMISSION_SOURCE}`
        );
      }
      return { admitted: true, request };
    }
    case 'arena': {
      const bytes = num(request.bytes);
      if (!(bytes >= 0)) return refuse('arena', bytes, ADMISSION_BUDGETS.arenaMaxBytes, 'non-finite byte count');
      if (bytes > ADMISSION_BUDGETS.arenaMaxBytes) {
        return refuse(
          'arena',
          bytes,
          ADMISSION_BUDGETS.arenaMaxBytes,
          `admission refused: kernel arena requests ${bytes} bytes, budget is ≤ ${ADMISSION_BUDGETS.arenaMaxBytes} (512 MiB, app ≤ 2 GB per Law 4) — ${ADMISSION_SOURCE}`
        );
      }
      return { admitted: true, request };
    }
    default:
      return refuse(String(domain), NaN, NaN, 'unknown admission domain');
  }
}

function refuse(domain, requested, limit, reason) {
  return { admitted: false, reason, domain, requested, limit };
}

/**
 * Publish a refusal to the banner bus (bounded pre-allocated ring — the
 * oldest refusal is overwritten; nothing is dropped silently without the
 * `refusalCount` monotonic counter recording it). Allocation happens only
 * on the rare publish event, never per frame.
 */
export function publishRefusal(outcome) {
  if (!outcome || outcome.admitted !== false || typeof outcome.reason !== 'string') {
    throw new Error('publishRefusal requires an { admitted: false, reason } outcome');
  }
  const slot = refusalRing[refusalCursor];
  slot.admitted = false;
  slot.reason = outcome.reason;
  slot.domain = outcome.domain ?? '';
  slot.requested = Number.isFinite(outcome.requested) ? outcome.requested : -1;
  slot.limit = Number.isFinite(outcome.limit) ? outcome.limit : -1;
  slot.tsUnixMs = Date.now();
  refusalCursor = (refusalCursor + 1) % REFUSAL_RING_LEN;
  refusalCount += 1;
  latestRefusal = slot;
  if (!notifyScheduled) {
    notifyScheduled = true;
    // Coalesce same-tick publishes into one React notification.
    queueMicrotask(() => {
      notifyScheduled = false;
      for (const fn of refusalListeners) fn(latestRefusal);
    });
  }
  return slot;
}

/** Subscribe to refusal publishes. Returns the unsubscribe function. */
export function subscribeRefusals(fn) {
  refusalListeners.add(fn);
  return () => refusalListeners.delete(fn);
}

/** Latest refusal payload (stable object reference; React-safe snapshot). */
export function getLatestRefusal() {
  return latestRefusal;
}

/** Monotonic count of every refusal ever published this session. */
export function getRefusalCount() {
  return refusalCount;
}

/** Bounded ring of the last ≤ 8 refusals (oldest first, live slots). */
export function readRefusalRing() {
  const out = [];
  for (let i = 0; i < REFUSAL_RING_LEN; i++) {
    const slot = refusalRing[(refusalCursor + i) % REFUSAL_RING_LEN];
    if (slot.tsUnixMs > 0) out.push(slot);
  }
  return out;
}

/** Reset session state (unit-test isolation; never called per frame). */
export function resetAdmissionSurface() {
  for (const slot of refusalRing) slot.tsUnixMs = 0;
  refusalCursor = 0;
  refusalCount = 0;
  latestRefusal = null;
}

/**
 * Convenience: evaluate a workload and publish it when refused. Returns the
 * outcome either way — the caller never needs to remember to surface it.
 */
export function admitAndSurface(request) {
  const outcome = admitWorkload(request);
  if (outcome.admitted === false) publishRefusal(outcome);
  return outcome;
}

/** The API surface mounted on `window.__lab` for e2e determinism. */
export const admissionSurfaceApi = {
  budgets: ADMISSION_BUDGETS,
  source: ADMISSION_SOURCE,
  admitWorkload,
  admitAndSurface,
  publishRefusal,
  latest: getLatestRefusal,
  count: getRefusalCount,
  ring: readRefusalRing,
};
