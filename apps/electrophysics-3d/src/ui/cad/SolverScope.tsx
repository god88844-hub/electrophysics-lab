import React, { useEffect, useRef } from 'react';
import {
  TELEMETRY_CHANNELS,
  TELEMETRY_CHANNEL_COUNT,
  readChannelInto,
  type TelemetryHistory,
} from './telemetryScope.mjs';

/**
 * WP-1.6 — Solver-frame oscilloscope: multi-channel waveform chart whose
 * channels are driven **strictly** by WP-1.5's pre-allocated solver-frame
 * typed arrays (via `telemetryScope.mjs`'s zero-allocation ring history).
 *
 * Drawing reuses one scratch `Float64Array` per draw (allocated once per
 * mount, not per frame) and runs on a 120 ms repaint interval — the 60 Hz
 * telemetry pipeline itself stays allocation-free. Every channel shows its
 * live last-sample value (equal to the ring's newest entry — the e2e suite
 * asserts this equality against `window.__lab.telemetry`); before any
 * solver frame has arrived the channels render an honest empty state, never
 * a fabricated waveform (Builder Rule 1).
 */
export function SolverScope({ history }: { history: TelemetryHistory }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchRef = useRef<Float64Array>(new Float64Array(history.ringLen));
  const versionRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const timer = setInterval(() => {
      const scratch = scratchRef.current;
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
      if (history.samples === 0) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#6f8aa8';
        ctx.fillText('awaiting solver frames — channels are drawn strictly from the solver-frame typed arrays', 12, H / 2);
        return;
      }
      // Per-channel auto-scale over the visible window (typed-array reads only).
      for (let c = 0; c < TELEMETRY_CHANNEL_COUNT; c++) {
        const n = readChannelInto(history, c, scratch, history.ringLen);
        if (n < 2) continue;
        const ch = TELEMETRY_CHANNELS[c];
        let max = 1e-9;
        for (let i = 0; i < n; i++) max = Math.max(max, Math.abs(scratch[i]));
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const x = (i / (n - 1)) * W;
          const y = H - 8 - (Math.abs(scratch[i]) / max) * (H - 20);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (versionRef.current !== history.samples) versionRef.current = history.samples;
    }, 120);
    return () => clearInterval(timer);
  }, [history]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        data-testid="wp16-scope-canvas"
        width={720}
        height={150}
        style={{ width: '100%', borderRadius: 6, border: '1px solid #3a4250' }}
      />
      <div data-testid="wp16-scope-channels" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', marginTop: 6, fontSize: 11.5, fontFamily: 'monospace' }}>
        {TELEMETRY_CHANNELS.map((ch, c) => (
          <span key={ch.id} data-testid={`wp16-channel-${ch.id}`} style={{ color: ch.color }}>
            {ch.label}
            {' '}
            {history.samples === 0 ? '—' : `${formatValue(history.lastValues[c])} ${ch.unit}`}
            <span style={{ color: '#54677d' }}> · solver-frame</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function formatValue(v: number): string {
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 1) return v.toFixed(2);
  if (a >= 0.01) return v.toFixed(3);
  return v.toExponential(1);
}
