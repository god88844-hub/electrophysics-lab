/**
 * Type declarations for fpsTrend.mjs (WP-1.5).
 */

export interface FpsTrendSummary {
  samples: number;
  capacity: number;
  windowS: number;
  elapsedS: number;
  complete: boolean;
  medianFps: number;
  minFps: number;
  maxFps: number;
  p10Fps: number;
  targetFps: number;
  targetMet: boolean;
  framesTotal: number;
}

export declare class FpsTrendRecorder {
  readonly windowS: number;
  readonly sampleIntervalMs: number;
  readonly targetFps: number;
  readonly capacity: number;
  readonly samples: Float32Array;
  count: number;
  head: number;
  framesTotal: number;
  startedAtMs: number;
  constructor(opts?: { windowS?: number; sampleIntervalMs?: number; targetFps?: number });
  frame(nowMs?: number): FpsTrendRecorder;
  complete(): boolean;
  summary(nowMs?: number): FpsTrendSummary;
  reset(): FpsTrendRecorder;
}

export declare const fpsTrend: FpsTrendRecorder;
