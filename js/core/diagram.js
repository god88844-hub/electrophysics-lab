// diagram.js — the universal design document: blocks + wires + metadata.
// Serializes to JSON ("format": "invention-lab/1") and round-trips exactly.
// Wires always connect one output port to one input port; nets (many-to-many
// electrical nodes) are derived by each lab's engine from these wires.

import { Block, portsOf, canConnect } from './block.js';
import { getComponent } from './registry.js';

const FORMAT = 'invention-lab/1';

let _uidCounter = 0;
export function uid(prefix = 'id') {
  _uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${_uidCounter.toString(36)}`;
}

export class Diagram {
  constructor({ id = uid('dg'), name = 'Untitled', lab, meta = {} } = {}) {
    this.format = FORMAT;
    this.id = id;
    this.name = name;
    this.lab = lab;
    this.meta = meta;                    // lab-specific (e.g. logic radix, quantum qubit count)
    this.blocks = [];                    // Block[]
    this.wires = [];                     // { id, from:{block,port}, to:{block,port} }
  }

  block(id) { return this.blocks.find((b) => b.id === id) || null; }

  nextBlockId(type) {
    const base = type.replace(/[^a-zA-Z0-9]/g, '');
    let n = 1;
    while (this.blocks.some((b) => b.id === `${base}${n}`)) n += 1;
    return `${base}${n}`;
  }

  /** Create a block from a registered type, applying parameter defaults. */
  addBlock(type, { params = {}, x = 0, y = 0, id = null } = {}) {
    const def = getComponent(type);
    if (!def) throw new Error(`Unknown component type "${type}"`);
    const full = {};
    for (const p of def.params || []) full[p.key] = p.default;
    Object.assign(full, params);
    const block = new Block({ id: id || this.nextBlockId(type), type, params: full, x, y });
    this.blocks.push(block);
    return block;
  }

  removeBlock(id) {
    const i = this.blocks.findIndex((b) => b.id === id);
    if (i < 0) return false;
    this.blocks.splice(i, 1);
    this.wires = this.wires.filter((w) => w.from.block !== id && w.to.block !== id);
    return true;
  }

  connect(fromBlockId, fromPort, toBlockId, toPort) {
    const fb = this.block(fromBlockId), tb = this.block(toBlockId);
    if (!fb || !tb) throw new Error('connect: unknown block');
    if (!canConnect(fb, fromPort, tb, toPort)) {
      throw new Error(`connect: cannot connect ${fb.type}.${fromPort} -> ${tb.type}.${toPort} (need out->in, compatible types)`);
    }
    if (this.wires.some((w) => w.from.block === fromBlockId && w.from.port === fromPort &&
                              w.to.block === toBlockId && w.to.port === toPort)) return null;
    const wire = { id: uid('w'), from: { block: fromBlockId, port: fromPort }, to: { block: toBlockId, port: toPort } };
    this.wires.push(wire);
    return wire;
  }

  disconnect(wireId) {
    const i = this.wires.findIndex((w) => w.id === wireId);
    if (i < 0) return false;
    this.wires.splice(i, 1);
    return true;
  }

  /** Wires attached to a block (either end). */
  wiresOf(blockId) {
    return this.wires.filter((w) => w.from.block === blockId || w.to.block === blockId);
  }

  /** All signals driving a given input port (usually 0 or 1). */
  driversOf(blockId, portId) {
    return this.wires
      .filter((w) => w.to.block === blockId && w.to.port === portId)
      .map((w) => ({ wire: w, block: this.block(w.from.block) }))
      .filter((d) => d.block);
  }

  /** Structural problems only (unknown types, dangling wire ends, bad ports). */
  issues() {
    const out = [];
    const ids = new Set(this.blocks.map((b) => b.id));
    for (const w of this.wires) {
      for (const end of [w.from, w.to]) {
        if (!ids.has(end.block)) out.push(`Wire ${w.id}: references missing block "${end.block}"`);
      }
    }
    for (const b of this.blocks) {
      const def = getComponent(b.type);
      if (!def) { out.push(`Block ${b.id}: unknown component type "${b.type}"`); continue; }
      const portIds = new Set(portsOf(b).map((p) => p.id));
      for (const w of this.wiresOf(b.id)) {
        for (const end of [w.from, w.to]) {
          if (end.block === b.id && !portIds.has(end.port)) {
            out.push(`Wire ${w.id}: block ${b.id} has no port "${end.port}"`);
          }
        }
      }
    }
    return out;
  }

  clone() { return Diagram.fromJSON(JSON.parse(JSON.stringify(this.toJSON()))); }

  toJSON() {
    return {
      format: FORMAT,
      id: this.id,
      name: this.name,
      lab: this.lab,
      meta: this.meta,
      blocks: this.blocks.map((b) => ({ id: b.id, type: b.type, params: b.params, x: b.x, y: b.y })),
      wires: this.wires.map((w) => ({ id: w.id, from: { ...w.from }, to: { ...w.to } })),
    };
  }

  static fromJSON(obj) {
    if (!obj || obj.format !== FORMAT) {
      throw new Error('Not an Invention Lab file (missing "format": "invention-lab/1")');
    }
    const d = new Diagram({ id: obj.id, name: obj.name, lab: obj.lab, meta: obj.meta || {} });
    d.blocks = (obj.blocks || []).map((b) => new Block(b));
    d.wires = (obj.wires || []).map((w) => ({ id: w.id || uid('w'), from: { ...w.from }, to: { ...w.to } }));
    return d;
  }
}
