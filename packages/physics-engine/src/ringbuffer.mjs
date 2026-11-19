/**
 * Fixed-capacity time-indexed ring buffer — the 100 ms slow-motion failure
 * recorder. Samples are pushed at the physics tick rate (240 Hz default) and
 * the buffer keeps the most recent `capacityMs` milliseconds.
 */
export class RingBuffer {
  /**
   * @param {number} capacity maximum samples retained
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.samples = [];
    this.total = 0;
  }

  /** @param {object} sample must include numeric `t` (sim time seconds). */
  push(sample) {
    if (this.samples.length >= this.capacity) this.samples.shift();
    this.samples.push(sample);
    this.total++;
  }

  /** Oldest → newest snapshot of the retained window. */
  toArray() {
    return this.samples.slice();
  }

  /** Samples within the last `ms` of the newest sample's time. */
  windowLast(ms) {
    if (this.samples.length === 0) return [];
    const tNewest = this.samples[this.samples.length - 1].t;
    const cutoff = tNewest - ms / 1000;
    return this.samples.filter((s) => s.t >= cutoff);
  }

  get length() {
    return this.samples.length;
  }

  clear() {
    this.samples = [];
    this.total = 0;
  }
}
