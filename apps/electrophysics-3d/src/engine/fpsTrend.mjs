/**
 * WP-1.5 — FPS trend instrumentation for the 60 FPS iGPU acceptance target.
 *
 * Ring-buffer recorder sampled from the render loop (world.update → frame()).
 * Fixed pre-allocated Float32Array storage; the median is computed in-place on
 * a pre-allocated scratch copy (typed-array sort is numeric). Builder Rule 4:
 * the FPS acceptance is a **trend check on the CI runner, not a gate
 * absolute** — the recorder therefore reports the measured distribution
 * (median/min/p10/max) plus the 55 FPS target verdict honestly.
 *
 * Plain ESM so Node unit tests and the browser bundle share one implementation.
 */

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export class FpsTrendRecorder {
  /** @param {{ windowS?: number, sampleIntervalMs?: number, targetFps?: number }} opts */
  constructor(opts = {}) {
    this.windowS = opts.windowS ?? 60;
    this.sampleIntervalMs = opts.sampleIntervalMs ?? 500;
    this.targetFps = opts.targetFps ?? 55;
    this.capacity = Math.max(1, Math.round((this.windowS * 1000) / this.sampleIntervalMs));
    this.samples = new Float32Array(this.capacity); // ring, oldest → newest
    this.count = 0;
    this.head = 0; // next write slot
    this.framesTotal = 0;
    this.startedAtMs = now();
    this._frames = 0;
    this._lastSampleMs = null; // anchored on the first frame() call
    this._scratch = new Float32Array(this.capacity);
  }

  /** Call once per rendered frame. The first call anchors the trend window. */
  frame(nowMs = now()) {
    this.framesTotal += 1;
    if (this._lastSampleMs === null) {
      this.startedAtMs = nowMs;
      this._lastSampleMs = nowMs;
      this._frames = 1;
      return this;
    }
    this._frames += 1;
    if (nowMs - this._lastSampleMs >= this.sampleIntervalMs) {
      const fps = (this._frames * 1000) / Math.max(1, nowMs - this._lastSampleMs);
      this._frames = 0;
      this._lastSampleMs = nowMs;
      this.samples[this.head] = fps;
      this.head = (this.head + 1) % this.capacity;
      if (this.count < this.capacity) this.count += 1;
    }
    return this;
  }

  /** True once a full `windowS` has elapsed with ≥90 % of the ring filled. */
  complete(nowMs = now()) {
    const elapsedS = (nowMs - this.startedAtMs) / 1000;
    return elapsedS >= this.windowS && this.count >= Math.floor(this.capacity * 0.9);
  }

  /** Distribution summary over the newest `windowS` (median/min/p10/max). */
  summary(nowMs = now()) {
    const n = this.count;
    for (let i = 0; i < n; i++) {
      const oldest = this.head - n + i;
      this._scratch[i] = this.samples[(oldest + this.capacity * 2) % this.capacity];
    }
    // Float32Array.sort is numeric — in-place, no allocation.
    const sorted = this._scratch.subarray(0, n);
    sorted.sort();
    const median = n === 0 ? 0 : (sorted[(n - 1) >> 1] + sorted[n >> 1]) / 2;
    return {
      samples: n,
      capacity: this.capacity,
      windowS: this.windowS,
      elapsedS: Math.max(0, (nowMs - this.startedAtMs) / 1000),
      complete: this.complete(nowMs),
      medianFps: Math.round(median * 10) / 10,
      minFps: n === 0 ? 0 : Math.round(sorted[0] * 10) / 10,
      maxFps: n === 0 ? 0 : Math.round(sorted[n - 1] * 10) / 10,
      p10Fps: n === 0 ? 0 : Math.round(sorted[Math.floor((n - 1) * 0.1)] * 10) / 10,
      targetFps: this.targetFps,
      targetMet: n > 0 && median >= this.targetFps,
      framesTotal: this.framesTotal,
    };
  }

  reset() {
    this.samples.fill(0);
    this.count = 0;
    this.head = 0;
    this.framesTotal = 0;
    this.startedAtMs = now();
    this._frames = 0;
    this._lastSampleMs = null; // re-anchor on the next frame
    return this;
  }
}

/** App-wide recorder fed by LabWorld.update (exposed to tests via window.__lab). */
export const fpsTrend = new FpsTrendRecorder({ windowS: 60, sampleIntervalMs: 500, targetFps: 55 });
