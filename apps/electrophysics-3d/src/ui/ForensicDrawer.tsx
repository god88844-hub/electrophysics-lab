import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { store, flashToast } from '../state/store.js';
import { physicsClient, type ForensicReport, type PhysicsSnapshot, type ProposedFix } from '../physics/physicsClient.js';
import { worldRef } from '../worldRef.js';

const getStore = () => store.get();
const subscribeStore = (fn: () => void) => store.subscribe(fn);

/** Oscilloscope chart over the recorded 100 ms window (canvas 2D). */
function Scope({ replay, scrub }: { replay: Array<Record<string, number>>; scrub: number | null }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || replay.length < 2) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0f16';
    ctx.fillRect(0, 0, W, H);
    const t0 = replay[0].t;
    const t1 = replay[replay.length - 1].t || 1e-6;
    const series: Array<{ key: string; color: string; label: string; scale: number }> = [
      { key: 'vgsMax', color: '#ff9d5c', label: 'Vgs (V)', scale: 1 },
      { key: 'vdd', color: '#6fd0ff', label: 'VDD (V)', scale: 1 },
      { key: 'iMax', color: '#ffd98a', label: 'I ×100 mA', scale: 100 },
      { key: 'tempMaxC', color: '#ff5030', label: 'T (°C)', scale: 1 / 40 },
    ];
    const all = series.flatMap((s) => replay.map((r) => (r[s.key] ?? 0) * s.scale));
    const max = Math.max(1e-6, ...all);
    // grid
    ctx.strokeStyle = '#16202e';
    ctx.lineWidth = 1;
    for (let g = 1; g < 4; g++) {
      ctx.beginPath();
      ctx.moveTo(0, (H * g) / 4);
      ctx.lineTo(W, (H * g) / 4);
      ctx.stroke();
    }
    for (const s of series) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      replay.forEach((r, i) => {
        const x = ((r.t - t0) / (t1 - t0)) * W;
        const y = H - 8 - ((r[s.key] ?? 0) * s.scale / max) * (H - 20);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    // scrub cursor
    if (scrub !== null && replay[scrub]) {
      const x = ((replay[scrub].t - t0) / (t1 - t0)) * W;
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // legend
    ctx.font = '11px monospace';
    series.forEach((s, i) => {
      ctx.fillStyle = s.color;
      ctx.fillText(s.label, 8 + i * 110, 14);
    });
  }, [replay, scrub]);
  return <canvas ref={canvasRef} width={560} height={180} style={{ width: '100%', borderRadius: 8, border: '1px solid #223042' }} />;
}

function download(name: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Forensic Autopsy Drawer — opens automatically the instant a real failure
 * threshold trips. Slow-motion replay scrubber + oscilloscope + physics-valid
 * "AI Fix & Re-Test".
 */
export function ForensicDrawer(): React.ReactElement | null {
  const state = useSyncExternalStore(subscribeStore, getStore);
  const forensic = state.forensic;
  if (!forensic || !state.autopsyOpen) return null;
  const report = forensic.report as ForensicReport;
  const replay = forensic.replay as Array<PhysicsSnapshot>;
  const fix = forensic.fix as ProposedFix | null;
  const scrub = state.replayIndex;

  const applyFixAndRetest = () => {
    if (!fix) return;
    physicsClient.applyFix(fix.patch);
    if (fix.patch.vddMaxV !== undefined) store.set({ vddSlider: Math.min(state.vddSlider, fix.patch.vddMaxV as number) });
    store.set({ forensic: null, autopsyOpen: false, replayIndex: null });
    physicsClient.setParams({ vdd: Math.min(state.vddSlider, (fix.patch.vddMaxV as number) ?? state.vddSlider) });
    flashToast(`Fix applied: ${fix.title} — re-running clean`);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 600,
        height: '100%',
        background: 'rgba(16,10,10,0.96)',
        borderRight: '2px solid #7a2620',
        zIndex: 150,
        padding: 18,
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ color: '#ff9d7a', fontSize: 16, margin: 0 }}>Forensic Autopsy — {report.failure.type}</h2>
        <button onClick={() => store.set({ autopsyOpen: false })} style={{ background: 'none', border: 'none', color: '#8a5a50', cursor: 'pointer', fontSize: 16 }}>
          ✕
        </button>
      </div>
      <div style={{ color: '#c9a29a', fontSize: 12.5, marginTop: 8, lineHeight: 1.6 }}>
        <b>Triggered:</b> {report.failure.value} vs threshold {report.failure.threshold}
        {report.failure.node ? <> at <code style={{ color: '#ffd98a' }}>{report.failure.node}</code></> : null}
        <br />
        <b>Governing physics:</b> {report.failure.governingEquation}
        <br />
        <b>Finding:</b> {report.failure.note}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ color: '#8ea1b8', fontSize: 11, marginBottom: 6 }}>SLOW-MOTION REPLAY — LAST 100 MS ({replay.length} samples)</div>
        <Scope replay={replay as unknown as Array<Record<string, number>>} scrub={scrub} />
        <input
          type="range"
          min={0}
          max={replay.length - 1}
          step={1}
          value={scrub ?? replay.length - 1}
          onChange={(e) => {
            const idx = parseInt(e.target.value);
            store.set({ replayIndex: idx });
            physicsClient.replaySample = replay[idx];
            worldRef.current?.applyReplaySample(replay[idx]);
          }}
          style={{ width: '100%', accentColor: '#ff9d5a', marginTop: 8 }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button
            onClick={() => {
              store.set({ replayIndex: null });
              if (physicsClient.latest) worldRef.current?.applyPhysicsSnapshot(physicsClient.latest);
            }}
            style={btn}
          >
            Back to live
          </button>
          <span style={{ color: '#6f5a52', fontSize: 11.5, alignSelf: 'center' }}>
            {scrub !== null && replay[scrub]
              ? `t = ${replay[scrub].t.toFixed(4)} s · VDD ${replay[scrub].vdd?.toFixed(2)} V · Vgs ${replay[scrub].vgsMax?.toFixed(2)} V · T ${replay[scrub].tempMaxC?.toFixed(0)} °C`
              : 'live (sim paused at failure)'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <button
          style={btn}
          onClick={() => {
            download(`forensic-${report.failure.type}-${Date.now()}.json`, JSON.stringify(report, null, 2), 'application/json');
            flashToast('JSON forensic report exported');
          }}
        >
          Export JSON
        </button>
        <button
          style={btn}
          onClick={async () => {
            const { reportToMarkdown } = await import('@physics/forensics.mjs');
            download(`forensic-${report.failure.type}-${Date.now()}.md`, reportToMarkdown(report), 'text/markdown');
            flashToast('Markdown forensic report exported');
          }}
        >
          Export Markdown
        </button>
      </div>

      {fix && (
        <div style={{ marginTop: 14, padding: 12, background: 'rgba(40,52,40,0.5)', borderRadius: 10, border: '1px solid #2e4430' }}>
          <div style={{ color: '#8ef0b2', fontSize: 12.5, fontWeight: 700 }}>AI Fix &amp; Re-Test — {fix.title}</div>
          <div style={{ color: '#a9c9b2', fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>{fix.description}</div>
          <div style={{ color: '#5f7a64', fontSize: 10.5, marginTop: 6, fontFamily: 'monospace' }}>source: {fix.source}</div>
          <button
            onClick={applyFixAndRetest}
            style={{ ...btn, marginTop: 10, background: '#2e7d4f', color: '#fff', borderColor: '#3a9d64' }}
          >
            Apply fix &amp; re-run clean
          </button>
        </div>
      )}

      <div style={{ color: '#6f5a52', fontSize: 11, marginTop: 16 }}>
        Simulation evidence only — not physical validation. Thresholds from
        06_failure_physics_thresholds.json (SHA-256 verified).
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: 'transparent',
  color: '#c9a29a',
  border: '1px solid #4a3028',
  borderRadius: 8,
  padding: '5px 12px',
  cursor: 'pointer',
  fontSize: 12,
};
