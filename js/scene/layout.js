// layout.js — presentation-only 3D projection of the CANONICAL 2D Diagram.
// Never substitutes for a physics solver or changes the design's netlist.
import { portsOf } from '../core/block.js';
import { getComponent } from '../core/registry.js';

export const SCENE_SCALE = 1 / 60;
const SNAP = 20;
const BOX_WIDTH = 1.85, BOX_DEPTH = 1.10;
const PALETTE = {
  chip: [0.92, 0.58, 0.27],
  logic: [0.28, 0.72, 0.96],
  quantum: [0.69, 0.48, 0.98],
};

export function designToWorld(x, y) {
  return { x: (x + 55) * SCENE_SCALE, z: (y + 35) * SCENE_SCALE };
}
export function worldToDesign(x, z) {
  if (![x, z].every(Number.isFinite)) throw new Error('3D placement requires finite coordinates');
  return { x: Math.round((x / SCENE_SCALE - 55) / SNAP) * SNAP,
    y: Math.round((z / SCENE_SCALE - 35) / SNAP) * SNAP };
}
function colorFor(type, lab) {
  const base = PALETTE[lab] || [0.53, 0.67, 0.82];
  if (type.includes('GND')) return [0.48, 0.56, 0.64];
  if (/SOURCE|INPUT|IN\b|HADAMARD|H\b/i.test(type)) return [0.33, 0.86, 0.67];
  return base;
}
function portsFor(block) {
  const ports = portsOf(block);
  return {
    incoming: ports.filter(p => p.dir === 'in' || p.dir === 'bidi'),
    outgoing: ports.filter(p => p.dir === 'out' || p.dir === 'bidi'),
  };
}
/** Deterministic 3D socket position; does not modify the electrical netlist. */
export function portPoint3D(box, portId, direction) {
  const arr=direction==='out'?box.ports.outgoing:box.ports.incoming;
  const i=arr.findIndex(p=>p.id===portId);
  if(i<0)return null;
  const offset=(i+1)/(arr.length+1)-0.5;
  return {
    x:box.x+(direction==='out'?box.width/2:-box.width/2),
    y:box.height*0.7,
    z:box.z+offset*box.depth,
  };
}
export function sceneFromDiagram(diagram, { visibleBlockIds = null } = {}) {
  if (!diagram || !Array.isArray(diagram.blocks) || !Array.isArray(diagram.wires)) {
    throw new Error('3D scene requires a diagram with blocks and wires');
  }
  const blocks = [], byId = new Map();
  const allowed = visibleBlockIds === null ? null : new Set(visibleBlockIds);
  for (const block of diagram.blocks) {
    if (allowed && !allowed.has(block.id)) continue;
    if (!Number.isFinite(block.x) || !Number.isFinite(block.y)) continue;
    const def = getComponent(block.type);
    const { x, z } = designToWorld(block.x, block.y);
    const ports = portsFor(block);
    const entry = {
      id: block.id, type: block.type, label: def?.label || block.type,
      x, z, width: BOX_WIDTH, depth: BOX_DEPTH,
      height: diagram.lab === 'chip' ? 0.42 : diagram.lab === 'quantum' ? 0.29 : 0.33,
      color: colorFor(block.type, diagram.lab), ports,
    };
    blocks.push(entry);
    byId.set(block.id, entry);
  }
  const portPoint = portPoint3D;
  const wires = [];
  for (const wire of diagram.wires) {
    const from = byId.get(wire.from?.block), to = byId.get(wire.to?.block);
    if (!from || !to) continue;
    const a = portPoint(from, wire.from.port, 'out');
    const b = portPoint(to, wire.to.port, 'in');
    if (!a || !b) continue;
    const midway = (a.x + b.x) / 2;
    wires.push({
      id: wire.id,
      from: a, to: b,
      points: [a, { x: midway, y: 0.08, z: a.z }, { x: midway, y: 0.08, z: b.z }, b],
    });
  }
  const assemblies = [];
  for (const group of diagram.meta?.assemblies || []) {
    if (!Array.isArray(group.blockIds)) continue;
    const members = group.blockIds.map(id => byId.get(id)).filter(Boolean);
    if (!members.length) continue;
    const margin = 0.45;
    const left = Math.min(...members.map(b => b.x - b.width / 2)) - margin;
    const right = Math.max(...members.map(b => b.x + b.width / 2)) + margin;
    const top = Math.min(...members.map(b => b.z - b.depth / 2)) - margin;
    const bottom = Math.max(...members.map(b => b.z + b.depth / 2)) + margin;
    assemblies.push({
      id: group.id, name: group.name, blockIds: group.blockIds.filter(id => byId.has(id)),
      x: (left + right) / 2, z: (top + bottom) / 2,
      width: right - left, depth: bottom - top,
      incomplete: members.length !== group.blockIds.length,
    });
  }
  const coordinates = blocks.flatMap(b => [[b.x - b.width / 2, b.z - b.depth / 2],
    [b.x + b.width / 2, b.z + b.depth / 2]]);
  const minX = coordinates.length ? Math.min(...coordinates.map(v => v[0])) : -5;
  const maxX = coordinates.length ? Math.max(...coordinates.map(v => v[0])) : 5;
  const minZ = coordinates.length ? Math.min(...coordinates.map(v => v[1])) : -5;
  const maxZ = coordinates.length ? Math.max(...coordinates.map(v => v[1])) : 5;
  return {
    blocks, wires, assemblies,
    center: { x: (minX + maxX) / 2, y: 0, z: (minZ + maxZ) / 2 },
    span: Math.max(4, maxX - minX, maxZ - minZ),
    source: { id: diagram.id, lab: diagram.lab, blockCount: blocks.length, wireCount: wires.length },
  };
}
