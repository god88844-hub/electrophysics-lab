import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { store } from '../../state/store.js';
import { physicsClient, type ForensicReport, type PhysicsSnapshot, type ProposedFix } from '../../physics/physicsClient.js';
import { worldRef } from '../../worldRef.js';
import { BlochPanel } from './BlochPanel.js';
import { BundleExporter } from './BundleExporter.js';
import { flashToast } from '../../state/store.js';
import { SolverScope } from './SolverScope.js';
import { LogicAnalyzer } from './LogicAnalyzer.js';
import { AdmissionBanner } from './AdmissionBanner.js';
import { createTelemetryHistory, sampleFrameStore, TELEMETRY_SAMPLE_MS } from './telemetryScope.mjs';

const getStore = () => store.get();
const subscribeStore = (fn: () => void) => store.subscribe(fn);

function Scope({ replay, scrub }: { replay: Array<Record<string, number>>; scrub: number | null }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || replay.length < 2) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#0a0f16';
    ctx.fillRect(0, 0, W, H);
    const t0 = replay[0].t;
    const t1 = replay[replay.length - 1].t || 1e-6;
    const series: Array<{ key: string; color: string; label: string; scale: number }> = [
      { key: 'vgsMax', color: '#f0a94f', label: 'Vgs (V)', scale: 1 },
      { key: 'vdd', color: '#62d0ff', label: 'VDD (V)', scale: 1 },
      { key: 'iMax', color: '#ffd98a', label: 'I ×100 mA', scale: 100 },
      { key: 'tempMaxC', color: '#e05a40', label: 'T (°C)', scale: 1 / 40 },
    ];
    const all = series.flatMap((s) => replay.map((r) => (r[s.key] ?? 0) * s.scale));
    const max = Math.max(1e-6, ...all);
    ctx.strokeStyle = '#1c2836';
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
    if (scrub !== null && replay[scrub]) {
      const x = ((replay[scrub].t - t0) / (t1 - t0)) * W;
      ctx.strokeStyle = '#eceff4';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.font = '11px monospace';
    series.forEach((s, i) => {
      ctx.fillStyle = s.color;
      ctx.fillText(s.label, 8 + i * 110, 14);
    });
  }, [replay, scrub]);
  return <canvas ref={canvasRef} width={720} height={170} style={{ width: '100%', borderRadius: 6, border: '1px solid #3a4250' }} />;
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

export type DockTab = 'scope' | 'autopsy' | 'ai' | 'bloch';

/** Multi-channel live probe waveform chart fed by the 3D probe pins (P tool). */
function ProbeScope(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useSyncExternalStore(subscribeStore, getStore);
  const probes = state.probes;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const timer = setInterval(() => {
      const samples = (window as unknown as { __probeSamples?: Map<number, Array<{ t: number; value: number }>> }).__probeSamples;
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = '#0a0f16';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#1c2836';
      for (let g = 1; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(0, (H * g) / 4);
        ctx.lineTo(W, (H * g) / 4);
        ctx.stroke();
      }
      let maxV = 1e-6;
      for (const p of probes) {
        for (const s of samples?.get(p.id) ?? []) maxV = Math.max(maxV, Math.abs(s.value));
      }
      for (const p of probes) {
        const arr = samples?.get(p.id) ?? [];
        if (arr.length < 2) continue;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        arr.forEach((s, i) => {
          const x = (i / (arr.length - 1)) * W;
          const y = H / 2 - (s.value / maxV) * (H / 2 - 14);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
      ctx.font = '11px monospace';
      probes.forEach((p, i) => {
        ctx.fillStyle = p.color;
        ctx.fillText(`ch${i + 1} ${p.targetId}`, 8 + i * 140, 14);
      });
    }, 120);
    return () => clearInterval(timer);
  }, [probes]);
  if (probes.length === 0) {
    return <div style={{ color: '#6f8aa8', fontSize: 12.5, marginTop: 12 }}>No probes pinned. Use the <b>P</b> tool and click a placed component in Silicon CAD.</div>;
  }
  return <canvas ref={canvasRef} width={720} height={170} style={{ width: '100%', borderRadius: 6, border: '1px solid #3a4250' }} />;
}

/**
 * Collapsible bottom instrument dock (starts collapsed; ≤32 % height on
 * auto-open). Houses the oscilloscope (solver-frame channels + probe pins),
 * forensic autopsy, AI convergence, Bloch instruments and the WP-1.6 Logic
 * Analyzer. The 3D viewport is NEVER squeezed by side panels.
 *
 * WP-1.6: the dock owns the admission-refusal strip (AdmissionBanner) and
 * the Logic Analyzer tab via local tab state (the store's `dockTab` union
 * is untouched); store tabs clear the local selection.
 */
export function BottomDock(): React.ReactElement | null {
  const state = useSyncExternalStore(subscribeStore, getStore);
  const forensic = state.forensic;
  const open = state.dockOpen;
  const [wp16Tab, setWp16Tab] = useState<'logic' | null>(null);
  // WP-1.6 telemetry history: allocated exactly once per dock mount; the
  // sampler writes the ring on the solver-frame cadence (zero-alloc).
  const [telemetry] = useState(() => createTelemetryHistory());
  useEffect(() => {
    if (!open) return; // dock collapsed → no sampling (honest gap, not fabricated data)
    const timer = setInterval(() => sampleFrameStore(telemetry), TELEMETRY_SAMPLE_MS);
    return () => clearInterval(timer);
  }, [open, telemetry]);
  if (!open) return <BundleExporter state={state} compact />;
  const report = forensic?.report as ForensicReport | undefined;
  const replay = (forensic?.replay ?? []) as Array<PhysicsSnapshot>;
  const fix = forensic?.fix as ProposedFix | null;
  const scrub = state.replayIndex;
  const tab = state.dockTab;

  const selectStoreTab = (id: DockTab) => {
    setWp16Tab(null);
    store.set({ dockTab: id });
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '32%',
        background: 'rgba(20,23,28,0.97)',
        borderTop: '2px solid #3a4250',
        zIndex: 110,
        padding: '10px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {([['scope', 'Oscilloscope'], ['autopsy', report ? `Forensic Autopsy — ${report.failure.type}` : 'Forensic Autopsy'], ['ai', 'AI Co-Inventor'], ['bloch', 'Bloch Instruments']] as Array<[DockTab, string]>).map(([id, label]) => (
            <button
              key={id}
              onClick={() => selectStoreTab(id)}
              style={{
                background: wp16Tab === null && tab === id ? '#d8a03a' : 'rgba(26,32,41,0.9)',
                color: wp16Tab === null && tab === id ? '#14171c' : '#eceff4',
                border: '1px solid #3a4250',
                borderRadius: 8,
                padding: '3px 12px',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: wp16Tab === null && tab === id ? 700 : 400,
              }}
            >
              {label}
            </button>
          ))}
          <button
            data-testid="wp16-logic-tab"
            onClick={() => setWp16Tab('logic')}
            style={{
              background: wp16Tab === 'logic' ? '#d8a03a' : 'rgba(26,32,41,0.9)',
              color: wp16Tab === 'logic' ? '#14171c' : '#eceff4',
              border: '1px solid #3a4250',
              borderRadius: 8,
              padding: '3px 12px',
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: wp16Tab === 'logic' ? 700 : 400,
            }}
          >
            Logic Analyzer
          </button>
        </div>
        <BundleExporter state={state} />
        <button
          onClick={() => store.set({ dockOpen: false })}
          title="Close dock (Esc)"
          style={{ background: 'none', border: '1px solid #3a4250', color: '#eceff4', borderRadius: 6, cursor: 'pointer', fontSize: 15, padding: '0 10px' }}
        >
          ✕
        </button>
      </div>

      {/* WP-1.6 — admission-refusal strip: every { admitted:false, reason }
          payload is surfaced here verbatim (fail-closed, never hidden). */}
      <AdmissionBanner />

      {wp16Tab === 'logic' && <LogicAnalyzer />}
      {wp16Tab === null && tab === 'autopsy' && report && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: '#c9a29a', fontSize: 12.5, lineHeight: 1.55 }}>
            <b>Triggered:</b> {report.failure.value} vs threshold {report.failure.threshold}
            {report.failure.node ? <> at <code style={{ color: '#ffd98a' }}>{report.failure.node}</code></> : null}
            {' · '}
            <b>Physics:</b> {report.failure.governingEquation}
            <br />
            <b>Finding:</b> {report.failure.note}
          </div>
          <div style={{ marginTop: 8 }}>
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
                worldRef.current?.applyReplaySample(replay[idx]);
              }}
              style={{ width: '100%', accentColor: '#f0a94f', marginTop: 6 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button style={btn} onClick={() => {
                store.set({ replayIndex: null });
                if (physicsClient.latest) worldRef.current?.applyPhysicsSnapshot(physicsClient.latest);
              }}>
                Back to live
              </button>
              <button style={btn} onClick={() => {
                download(`forensic-${report.failure.type}-${Date.now()}.json`, JSON.stringify(report, null, 2), 'application/json');
                flashToast('JSON forensic report exported');
              }}>Export JSON</button>
              <button style={btn} onClick={async () => {
                const { reportToMarkdown } = await import('@physics/forensics.mjs');
                download(`forensic-${report.failure.type}-${Date.now()}.md`, reportToMarkdown(report), 'text/markdown');
                flashToast('Markdown forensic report exported');
              }}>Export Markdown</button>
              {fix && (
                <button style={{ ...btn, background: '#2e7d4f', color: '#fff', borderColor: '#3a9d64' }} onClick={() => {
                  physicsClient.applyFix(fix.patch);
                  if (fix.patch.vddMaxV !== undefined) store.set({ vddSlider: Math.min(store.get().vddSlider, fix.patch.vddMaxV as number) });
                  store.set({ forensic: null, replayIndex: null });
                  physicsClient.setParams({ vdd: Math.min(store.get().vddSlider, (fix.patch.vddMaxV as number) ?? store.get().vddSlider) });
                  flashToast(`Fix applied: ${fix.title} — re-running clean`);
                }}>
                  AI Fix &amp; Re-Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {wp16Tab === null && tab === 'autopsy' && !report && (
        <div style={{ color: '#6f8aa8', fontSize: 12.5, marginTop: 12 }}>
          No forensic capture recorded. Drive a real failure (Vgs &gt; 1.95 V, trace fusing, cryo quench) to open the autopsy.
        </div>
      )}
      {wp16Tab === null && tab === 'scope' && (
        <div>
          {/* WP-1.6 — solver-frame-driven channels (strict typed-array source). */}
          <SolverScope history={telemetry} />
          <div style={{ color: '#54677d', fontSize: 11, margin: '4px 0 2px' }}>probe-pin channels (P tool):</div>
          <ProbeScope />
        </div>
      )}
      {wp16Tab === null && tab === 'ai' && (
        <div style={{ color: '#6f8aa8', fontSize: 12.5, marginTop: 12 }}>
          AI Co-Inventor convergence plot lives in the Quantum workspace inspector (Run AI Discovery Experiment). The docked panel mirrors it once an experiment has run.
        </div>
      )}
      {wp16Tab === null && tab === 'bloch' && <BlochPanel />}
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
