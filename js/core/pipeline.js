// pipeline.js — cross-lab coupling helpers (plan Step 8).
// Labs run as separate engines; coupling happens through explicit, documented
// adapters so the boundary semantics are never implicit.

/**
 * Run an ordered sequence of lab stages, piping outputs forward.
 * steps: [{ name, run(inputs) -> outputs, map?(prevOutputs) -> inputs }]
 * Returns [{ name, inputs, outputs }].
 */
export async function runSequence(steps) {
  const results = [];
  let prev = null;
  for (const step of steps) {
    const inputs = step.map ? step.map(prev) : {};
    const outputs = await step.run(inputs);
    results.push({ name: step.name, inputs, outputs });
    prev = outputs;
  }
  return results;
}

/** Analog -> digital: hard threshold. (Documented ADC model, no hysteresis.) */
export function threshold(v, t = 0.5) { return v >= t ? 1 : 0; }

/** Continuous -> quantized integer level in [0, levels-1]. */
export function quantize(x, { min = 0, max = 1, levels = 256 } = {}) {
  const clamped = Math.min(max, Math.max(min, x));
  const q = Math.round(((clamped - min) / (max - min)) * (levels - 1));
  return Math.min(levels - 1, Math.max(0, q));
}

/** Bit list -> byte list (MSB first within each byte). */
export function bitsToBytes(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | (bits[i + j] ? 1 : 0);
    }
    bytes.push(b);
  }
  return bytes;
}

export function bytesToBits(bytes) {
  const bits = [];
  for (const b of bytes) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  return bits;
}
