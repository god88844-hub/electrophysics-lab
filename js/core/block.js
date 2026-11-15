// block.js — the universal component model.
// A Block is one placed component: a type reference, its parameters, and a
// canvas position. Its ports come from the registered component definition,
// so the same definition drives palette, inspector, wiring rules and engine.

import { getComponent } from './registry.js';

export const PORT_TYPES = ['logic', 'analog', 'quantum', 'digital', 'any'];

export class Block {
  constructor({ id, type, params = {}, x = 0, y = 0 }) {
    this.id = id;
    this.type = type;      // registered component typeId
    this.params = params;  // plain object, values per component def schema
    this.x = x;
    this.y = y;
  }
}

/** Resolve the ports of a block via its component definition. */
export function portsOf(block) {
  const def = getComponent(block.type);
  if (!def) return [];
  return def.ports ? def.ports(block.params) : [];
}

export function portOf(block, portId) {
  return portsOf(block).find((p) => p.id === portId) || null;
}

/** Direction/type compatibility rule used by Diagram.connect and the UI. */
export function canConnect(fromBlock, fromPort, toBlock, toPort) {
  const fp = portOf(fromBlock, fromPort);
  const tp = portOf(toBlock, toPort);
  if (!fp || !tp) return false;
  const dirOk = (fp.dir === 'out' && tp.dir === 'in') ||
                (fp.dir === 'bidi' && tp.dir === 'bidi') ||
                (fp.dir === 'bidi' && tp.dir === 'in') ||
                (fp.dir === 'out' && tp.dir === 'bidi');
  if (!dirOk) return false;
  return fp.type === tp.type || fp.type === 'any' || tp.type === 'any';
}
