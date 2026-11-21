import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import {
  LOGIC_STREAM_FORMAT,
  getLogicStream,
  logicEventStats,
  readLogicEvents,
  subscribeLogic,
} from './logicStream.mjs';

const getStream = () => getLogicStream();
const subscribe = (fn: () => void) => subscribeLogic(fn);

/**
 * WP-1.6 — Logic Analyzer tab: renders the typed `ep-logic` event stream
 * attached through `logicStream.mjs` (the Phase 3 stub contract).
 *
 * Honesty rules (Builder Rule 1):
 * - With **no stream attached** the tab shows an explicit
 *   `SIMULATED_ARCHITECTURAL_MODEL` badge and "no logic stream attached —
 *   Phase 3 ep-logic" — the instrument never fabricates events.
 * - With a stream attached but zero published events it shows an honest
 *   "buffer empty" state plus the stream's declared channels.
 * - Events render exactly as published (`t`, channel, value, edge) with the
 *   session's accepted/refused counters; refused publishes were already
 *   refused fail-closed at the stream boundary and are never re-fabricated.
 */
export function LogicAnalyzer(): React.ReactElement {
  const stream = useSyncExternalStore(subscribe, getStream);
  const tableRef = useRef<HTMLDivElement>(null);
  const stats = logicEventStats();

  // Keep the newest event visible (bounded ring — oldest rolls off).
  useEffect(() => {
    const el = tableRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [stats.total]);

  if (!stream) {
    return (
      <div data-testid="wp16-logic-inactive" style={{ marginTop: 10 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            border: '1px solid #3a4250',
            borderRadius: 8,
            background: 'rgba(26,32,41,0.9)',
            color: '#d8a03a',
            fontSize: 11.5,
            fontFamily: 'monospace',
          }}
        >
          SIMULATED_ARCHITECTURAL_MODEL
        </div>
        <div style={{ color: '#6f8aa8', fontSize: 12.5, marginTop: 10, lineHeight: 1.55 }}>
          No logic stream attached — the event buffer is empty until a real
          <b> Phase 3 <code>ep-logic</code></b> publisher attaches through the
          stream interface (<code>{LOGIC_STREAM_FORMAT}</code>). No synthetic
          events are fabricated for display.
        </div>
      </div>
    );
  }

  const events = readLogicEvents(14);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ color: '#eceff4' }}>
          stream: <b style={{ color: '#d8a03a' }}>{stream.name}</b>
        </span>
        <span style={{ color: '#8fa0b4', fontFamily: 'monospace', fontSize: 11 }}>
          {stream.format} · {stream.badge}
        </span>
        <span style={{ color: '#8fa0b4', fontFamily: 'monospace', fontSize: 11 }}>
          channels: {stream.channels.join(', ')}
        </span>
        <span style={{ color: '#8fa0b4', fontFamily: 'monospace', fontSize: 11 }}>
          events {stats.total} · buffered {stats.buffered}/{stats.capacity} · refused {stats.refused}
        </span>
      </div>
      {events.length === 0 ? (
        <div style={{ color: '#6f8aa8', fontSize: 12.5, marginTop: 10 }}>
          Stream attached, event buffer empty — awaiting real <code>ep-logic</code> publishes
          (no synthetic events are fabricated for display).
        </div>
      ) : (
        <div
          ref={tableRef}
          data-testid="wp16-logic-events"
          style={{ marginTop: 8, maxHeight: 130, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11.5 }}
        >
          {events.map((ev, i) => (
            <div key={`${ev.t}-${ev.channel}-${i}`} style={{ display: 'flex', gap: 14, color: '#c9d4e2' }}>
              <span style={{ color: '#54677d', width: 90 }}>t={ev.t.toFixed(6)}</span>
              <span style={{ color: '#62d0ff', width: 70 }}>{ev.channel}</span>
              <span style={{ width: 40 }}>{ev.value}</span>
              <span style={{ color: ev.edge === 'rising' ? '#7ee081' : ev.edge === 'falling' ? '#e05a40' : '#54677d' }}>
                {ev.edge || 'level'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
