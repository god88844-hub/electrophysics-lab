// canvas.js — the shared drag-and-drop diagram editor.
// One CanvasEditor instance per canvas lab. Features: block drag, port-to-port
// wiring, pan/zoom, selection, keyboard ops (del/dup handled by app.js),
// grid snapping, ghost wire preview.

import { portsOf, canConnect } from '../core/block.js';
import { getComponent } from '../core/registry.js';

const GRID = 20;
const BLOCK_W = 110;
const PORT_R = 5;

export class CanvasEditor {
  constructor(container, { onChange = () => {}, onSelect = () => {} } = {}) {
    this.container = container;
    this.onChange = onChange;
    this.onSelect = onSelect;
    this.diagram = null;
    this.selection = null;      // {kind:'block'|'wire', id}
    this.view = { x: 0, y: 0, zoom: 1 };
    this.drag = null;           // {mode:'block'|'pan'|'wire', ...}
    this.hoverPort = null;
    this._raf = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'lab-canvas';
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('aria-label', 'Diagram editor canvas');
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('pointerdown', (e) => this._down(e));
    window.addEventListener('pointermove', (e) => this._move(e));
    window.addEventListener('pointerup', (e) => this._up(e));
    this.canvas.addEventListener('wheel', (e) => this._wheel(e), { passive: false });
    this.canvas.addEventListener('dblclick', (e) => this._dbl(e));
    this._resizeObserver = new ResizeObserver(() => this.resize());
    this._resizeObserver.observe(container);
    this.resize();
  }

  mount(diagram) {
    this.diagram = diagram;
    this.selection = null;
    this.view = { x: 0, y: 0, zoom: 1 };
    this.requestRender();
  }

  resize() {
    const r = this.container.getBoundingClientRect();
    this.canvas.width = Math.max(50, r.width);
    this.canvas.height = Math.max(50, r.height);
    this.requestRender();
  }

  requestRender() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this.render(); });
  }

  // ---- coordinate transforms ----------------------------------------------
  toWorld(px, py) {
    return { x: (px - this.view.x) / this.view.zoom, y: (py - this.view.y) / this.view.zoom };
  }
  toScreen(wx, wy) {
    return { x: wx * this.view.zoom + this.view.x, y: wy * this.view.zoom + this.view.y };
  }

  blockRect(b) {
    const def = getComponent(b.type);
    const ports = portsOf(b);
    const nIn = ports.filter((p) => p.dir === 'in').length;
    const nOut = ports.filter((p) => p.dir === 'out').length;
    const rows = Math.max(1, nIn, nOut);
    const label = def?.label || b.type;
    const w = Math.max(BLOCK_W, 14 + label.length * 8);
    return { x: b.x, y: b.y, w, h: 26 + rows * 22 };
  }

  portPos(b, portId) {
    const rect = this.blockRect(b);
    const ports = portsOf(b);
    const ins = ports.filter((p) => p.dir === 'in');
    const outs = ports.filter((p) => p.dir === 'out');
    const inIdx = ins.findIndex((p) => p.id === portId);
    const outIdx = outs.findIndex((p) => p.id === portId);
    if (inIdx >= 0) return { x: rect.x, y: rect.y + 26 + inIdx * 22 + 11, side: 'in' };
    if (outIdx >= 0) return { x: rect.x + rect.w, y: rect.y + 26 + outIdx * 22 + 11, side: 'out' };
    return { x: rect.x, y: rect.y, side: 'in' };
  }

  // ---- hit testing ---------------------------------------------------------
  hitTest(wx, wy) {
    // ports first (they sit on block edges)
    for (const b of [...this.diagram.blocks].reverse()) {
      for (const p of portsOf(b)) {
        const pos = this.portPos(b, p.id);
        const dx = wx - pos.x, dy = wy - pos.y;
        if (dx * dx + dy * dy < 12 * 12) return { kind: 'port', block: b, port: p, pos };
      }
    }
    for (const b of [...this.diagram.blocks].reverse()) {
      const r = this.blockRect(b);
      if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) {
        return { kind: 'block', block: b };
      }
    }
    // wires: sample bezier
    for (const w of this.diagram.wires) {
      const fb = this.diagram.block(w.from.block), tb = this.diagram.block(w.to.block);
      if (!fb || !tb) continue;
      const a = this.portPos(fb, w.from.port), c = this.portPos(tb, w.to.port);
      const pts = this.wirePoints(a, c);
      for (let t = 0; t <= 16; t++) {
        const p = this.bezier(pts, t / 16);
        const dx = wx - p.x, dy = wy - p.y;
        if (dx * dx + dy * dy < 8 * 8) return { kind: 'wire', wire: w };
      }
    }
    return { kind: 'empty' };
  }

  wirePoints(a, c) {
    const dx = Math.max(40, Math.abs(c.x - a.x) * 0.5);
    return {
      a,
      c1: a.side === 'out' ? { x: a.x + dx, y: a.y } : { x: a.x - dx, y: a.y },
      c2: c.side === 'in' ? { x: c.x - dx, y: c.y } : { x: c.x + dx, y: c.y },
      c,
    };
  }
  bezier({ a, c1, c2, c }, t) {
    const u = 1 - t;
    const x = u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * c.x;
    const y = u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * c.y;
    return { x, y };
  }

  // ---- pointer interactions -------------------------------------------------
  _down(e) {
    this.canvas.focus();
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const w = this.toWorld(sx, sy);
    const hit = this.hitTest(w.x, w.y);

    if (hit.kind === 'port') {
      if (hit.port.dir === 'in' || hit.port.dir === 'bidi') {
        // allow starting from an input: find its driver if any
        const drv = this.diagram.driversOf(hit.block.id, hit.port.id)[0];
        if (drv) {
          const fb = this.diagram.block(drv.wire.from.block);
          const pos = this.portPos(fb, drv.wire.from.port);
          this.drag = { mode: 'wire', from: { block: drv.wire.from.block, port: drv.wire.from.port }, cursor: w, fromPos: pos };
        } else {
          this.drag = { mode: 'wirePendingInput', block: hit.block, port: hit.port, cursor: w };
        }
      } else {
        this.drag = { mode: 'wire', from: { block: hit.block.id, port: hit.port.id }, cursor: w, fromPos: hit.pos };
      }
    } else if (hit.kind === 'block') {
      this.selection = { kind: 'block', id: hit.block.id };
      this.drag = { mode: 'block', id: hit.block.id, offX: w.x - hit.block.x, offY: w.y - hit.block.y, moved: false };
      this.onSelect(this.selection);
    } else if (hit.kind === 'wire') {
      this.selection = { kind: 'wire', id: hit.wire.id };
      this.onSelect(this.selection);
    } else {
      this.selection = null;
      this.onSelect(null);
      this.drag = { mode: 'pan', sx, sy, vx: this.view.x, vy: this.view.y };
    }
    this.requestRender();
  }

  _move(e) {
    if (!this.drag) return;
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const w = this.toWorld(sx, sy);
    if (this.drag.mode === 'pan') {
      this.view.x = this.drag.vx + (sx - this.drag.sx);
      this.view.y = this.drag.vy + (sy - this.drag.sy);
    } else if (this.drag.mode === 'block') {
      const b = this.diagram.block(this.drag.id);
      if (b) {
        b.x = Math.round((w.x - this.drag.offX) / GRID) * GRID;
        b.y = Math.round((w.y - this.drag.offY) / GRID) * GRID;
        this.drag.moved = true;
      }
    } else if (this.drag.mode === 'wire' || this.drag.mode === 'wirePendingInput') {
      this.drag.cursor = w;
    }
    this.requestRender();
  }

  _up(e) {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;
    if (d.mode === 'wire') {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      const w = this.toWorld(sx, sy);
      const hit = this.hitTest(w.x, w.y);
      if (hit.kind === 'port' && (hit.port.dir === 'in' || hit.port.dir === 'bidi')) {
        try {
          const fb = this.diagram.block(d.from.block);
          const tb = hit.block;
          if (canConnect(fb, d.from.port, tb, hit.port.id)) {
            this.diagram.connect(d.from.block, d.from.port, tb.id, hit.port.id);
            this.onChange('connect');
          } else {
            this.onSelect({ kind: 'error', message: `Cannot connect ${fb.type}.${d.from.port} → ${tb.type}.${hit.port.id}: incompatible types.` });
          }
        } catch (err) {
          this.onSelect({ kind: 'error', message: String(err.message) });
        }
      }
    } else if (d.mode === 'block' && d.moved) {
      this.onChange('move');
    }
    this.requestRender();
  }

  _wheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const before = this.toWorld(sx, sy);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    this.view.zoom = Math.min(3, Math.max(0.25, this.view.zoom * factor));
    const after = this.toWorld(sx, sy);
    this.view.x += (after.x - before.x) * this.view.zoom;
    this.view.y += (after.y - before.y) * this.view.zoom;
    this.requestRender();
  }

  _dbl(e) {
    const rect = this.canvas.getBoundingClientRect();
    const w = this.toWorld(e.clientX - rect.left, e.clientY - rect.top);
    const hit = this.hitTest(w.x, w.y);
    if (hit.kind === 'block') this.onSelect({ kind: 'block', id: hit.block.id, focus: true });
  }

  // ---- programmatic API used by app.js --------------------------------------
  addBlock(typeId, x, y) {
    const b = this.diagram.addBlock(typeId, {
      x: Math.round(x / GRID) * GRID,
      y: Math.round(y / GRID) * GRID,
    });
    this.selection = { kind: 'block', id: b.id };
    this.onChange('add');
    this.onSelect(this.selection);
    this.requestRender();
    return b;
  }

  deleteSelection() {
    if (!this.selection) return false;
    if (this.selection.kind === 'block') {
      this.diagram.removeBlock(this.selection.id);
    } else if (this.selection.kind === 'wire') {
      this.diagram.disconnect(this.selection.id);
    }
    this.selection = null;
    this.onChange('delete');
    this.onSelect(null);
    this.requestRender();
    return true;
  }

  duplicateSelection() {
    if (!this.selection || this.selection.kind !== 'block') return null;
    const b = this.diagram.block(this.selection.id);
    if (!b) return null;
    const nb = this.diagram.addBlock(b.type, { params: JSON.parse(JSON.stringify(b.params)), x: b.x + GRID * 2, y: b.y + GRID * 2 });
    this.selection = { kind: 'block', id: nb.id };
    this.onChange('duplicate');
    this.onSelect(this.selection);
    this.requestRender();
    return nb;
  }

  fit() {
    if (!this.diagram.blocks.length) { this.view = { x: 0, y: 0, zoom: 1 }; this.requestRender(); return; }
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const b of this.diagram.blocks) {
      const r = this.blockRect(b);
      minX = Math.min(minX, r.x); minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.h);
    }
    const zoom = Math.min(2, Math.max(0.25, Math.min(
      (this.canvas.width - 80) / Math.max(1, maxX - minX),
      (this.canvas.height - 80) / Math.max(1, maxY - minY))));
    this.view.zoom = zoom;
    this.view.x = 40 - minX * zoom;
    this.view.y = 40 - minY * zoom;
    this.requestRender();
  }

  selectedBlock() {
    return this.selection?.kind === 'block' ? this.diagram.block(this.selection.id) : null;
  }

  // ---- rendering ------------------------------------------------------------
  render() {
    const { ctx, canvas } = this;
    const { zoom } = this.view;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim() || '#12161d';
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    const step = GRID * zoom;
    if (step > 7) {
      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.lineWidth = 1;
      const ox = this.view.x % step, oy = this.view.y % step;
      ctx.beginPath();
      for (let x = ox; x < canvas.width; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
      for (let y = oy; y < canvas.height; y += step) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
      ctx.stroke();
    }

    ctx.translate(this.view.x, this.view.y);
    ctx.scale(zoom, zoom);

    // wires
    for (const w of this.diagram.wires) {
      const fb = this.diagram.block(w.from.block), tb = this.diagram.block(w.to.block);
      if (!fb || !tb) continue;
      const pts = this.wirePoints(this.portPos(fb, w.from.port), this.portPos(tb, w.to.port));
      const selected = this.selection?.kind === 'wire' && this.selection.id === w.id;
      ctx.strokeStyle = selected ? '#ffd479' : 'rgba(140, 190, 255, 0.75)';
      ctx.lineWidth = selected ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(pts.a.x, pts.a.y);
      ctx.bezierCurveTo(pts.c1.x, pts.c1.y, pts.c2.x, pts.c2.y, pts.c.x, pts.c.y);
      ctx.stroke();
    }

    // ghost wire
    if (this.drag?.mode === 'wire' && this.drag.cursor) {
      const fb = this.diagram.block(this.drag.from.block);
      if (fb) {
        const a = this.portPos(fb, this.drag.from.port);
        const pts = this.wirePoints(a, { x: this.drag.cursor.x, y: this.drag.cursor.y, side: 'in' });
        ctx.strokeStyle = 'rgba(255, 212, 121, 0.7)';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pts.a.x, pts.a.y);
        ctx.bezierCurveTo(pts.c1.x, pts.c1.y, pts.c2.x, pts.c2.y, pts.c.x, pts.c.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // blocks
    for (const b of this.diagram.blocks) {
      this._drawBlock(b);
    }
    ctx.restore();
  }

  _drawBlock(b) {
    const { ctx } = this;
    const def = getComponent(b.type);
    const rect = this.blockRect(b);
    const selected = this.selection?.kind === 'block' && this.selection.id === b.id;
    const accent = def?.lab ? (this.labAccent?.(def.lab) || '#5aa2e8') : '#5aa2e8';

    ctx.save();
    // shadow + body
    ctx.fillStyle = selected ? '#1d2634' : '#171d27';
    ctx.strokeStyle = selected ? '#ffd479' : 'rgba(255,255,255,0.16)';
    ctx.lineWidth = selected ? 2 : 1;
    this._roundRect(rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fill();
    ctx.stroke();

    // accent bar + title
    ctx.fillStyle = accent;
    this._roundRect(rect.x, rect.y, 5, rect.h, 2.5);
    ctx.fill();
    ctx.fillStyle = '#e8eef7';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(def?.label || b.type, rect.x + 12, rect.y + 17);

    // custom glyph from def.draw
    if (def?.draw) {
      ctx.font = '600 15px ui-monospace, monospace';
      ctx.fillStyle = accent;
      ctx.textAlign = 'center';
      ctx.fillText(String(def.draw).slice(0, 4), rect.x + rect.w / 2 + 10, rect.y + rect.h - 8);
    }

    // ports
    for (const p of portsOf(b)) {
      const pos = this.portPos(b, p.id);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PORT_R, 0, Math.PI * 2);
      ctx.fillStyle = p.dir === 'out' ? accent : '#9fb4cc';
      ctx.fill();
      ctx.strokeStyle = '#0b0e13';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#7f93ab';
      ctx.font = '9px system-ui, sans-serif';
      ctx.textAlign = p.dir === 'out' ? 'right' : 'left';
      if (p.dir === 'out') ctx.fillText(p.name, pos.x - 9, pos.y + 3);
      else ctx.fillText(p.name, pos.x + 9, pos.y + 3);
    }
    ctx.restore();
  }

  _roundRect(x, y, w, h, r) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
