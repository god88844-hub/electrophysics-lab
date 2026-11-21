import React, { useSyncExternalStore } from 'react';
import {
  ADMISSION_BUDGETS,
  ADMISSION_SOURCE,
  getLatestRefusal,
  getRefusalCount,
  subscribeRefusals,
} from './admissionSurface.mjs';

const getSnapshot = () => getLatestRefusal();
const subscribe = (fn: () => void) => subscribeRefusals(fn);

/**
 * WP-1.6 — AdmissionBanner: the fail-closed rendering surface for kernel /
 * frame-boundary admission refusals.
 *
 * Every published `{ admitted: false, reason }` payload is rendered with its
 * reason **verbatim** (requested value, exact budget, §2.3 citation) in the
 * instrument dock and the status bar. The banner is never auto-hidden — a
 * refusal stays visible with its monotonic session count until an explicit
 * re-run clears it elsewhere; hiding or auto-dismissing a refusal would be
 * a Builder Rule 1 / Law 4 violation ("refusal is an honest, displayed
 * result with the reason; not a silent clamp").
 *
 * `compact` renders the status-bar variant (single line); the default
 * renders the dock strip with the full reason text and budget citation.
 */
export function AdmissionBanner({ compact = false }: { compact?: boolean }): React.ReactElement | null {
  const refusal = useSyncExternalStore(subscribe, getSnapshot);
  const count = getRefusalCount();
  if (!refusal) return null; // no refusal published — the banner renders nothing
  const shortReason =
    refusal.reason.split('—')[0]?.trim() ?? refusal.reason; // reason minus the citation suffix
  if (compact) {
    return (
      <span
        data-testid="admission-banner-status"
        title={refusal.reason}
        style={{ color: '#ff7a5c', fontWeight: 700 }}
      >
        ⛔ ADM REFUSED [{refusal.domain}] ×{count}
        {' — '}
        {shortReason}
      </span>
    );
  }
  return (
    <div
      data-testid="admission-banner-dock"
      style={{
        marginTop: 8,
        padding: '6px 10px',
        border: '1px solid #7a3a2a',
        borderRadius: 8,
        background: 'rgba(64,20,14,0.55)',
        color: '#ffb3a0',
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      <b style={{ color: '#ff7a5c' }}>⛔ ADMISSION REFUSED</b>
      <span style={{ color: '#8fa0b4' }}> ({refusal.domain} · refusal #{count} this session · never clamped or hidden)</span>
      <br />
      <code style={{ color: '#ffd0c4' }}>{refusal.reason}</code>
      <br />
      <span style={{ color: '#8fa0b4', fontSize: 11 }}>
        budget source: {ADMISSION_SOURCE} · session refusals: {count} of {ADMISSION_BUDGETS.mnaMaxNodes}-node /
        {' '}{ADMISSION_BUDGETS.quantumMaxQubits}-qubit / {ADMISSION_BUDGETS.thermalMaxCols}×{ADMISSION_BUDGETS.thermalMaxRows} /
        {' '}{ADMISSION_BUDGETS.arenaMaxBytes}-byte budgets
      </span>
    </div>
  );
}
