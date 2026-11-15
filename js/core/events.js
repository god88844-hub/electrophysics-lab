// events.js — deterministic discrete-event priority queue.
// Used by the Logic Lab engine; time is an integer tick (1 tick = 1 ps nominal).
// Ordering: strictly by (time, insertion sequence) so runs are reproducible.

export class EventQueue {
  constructor() {
    this._heap = [];   // array of { time, seq, payload }
    this._seq = 0;
  }
  get size() { return this._heap.length; }
  clear() { this._heap.length = 0; }

  push(time, payload) {
    const node = { time, seq: this._seq++, payload };
    this._heap.push(node);
    let i = this._heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this._less(i, p)) { [this._heap[i], this._heap[p]] = [this._heap[p], this._heap[i]]; i = p; }
      else break;
    }
  }

  pop() {
    if (this._heap.length === 0) return null;
    const top = this._heap[0];
    const last = this._heap.pop();
    if (this._heap.length > 0) {
      this._heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let s = i;
        if (l < this._heap.length && this._less(l, s)) s = l;
        if (r < this._heap.length && this._less(r, s)) s = r;
        if (s === i) break;
        [this._heap[i], this._heap[s]] = [this._heap[s], this._heap[i]];
        i = s;
      }
    }
    return { time: top.time, payload: top.payload };
  }

  _less(a, b) {
    const x = this._heap[a], y = this._heap[b];
    return x.time < y.time || (x.time === y.time && x.seq < y.seq);
  }
}
