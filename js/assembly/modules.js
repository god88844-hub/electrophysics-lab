// modules.js — reusable SINGLE-LEVEL computing assemblies on the canonical Diagram.
// Simulation keeps using real blocks/wires, not a second shadow or substitute solver.
import { Diagram, uid } from '../core/diagram.js';
import { Block, canConnect, portsOf } from '../core/block.js';
import { getComponent } from '../core/registry.js';

export const MODULE_FORMAT = 'invention-lab/computing-module/1';
export const LIBRARY_FORMAT = 'invention-lab/module-library/1';
export const ASSEMBLY_FORMAT = 'invention-lab/assembly-instance/1';
const MAX_BLOCKS = 250;
const MAX_WIRES = 1500;
const MAX_INTERFACES = 1000;
const OWN = (x, k) => Object.prototype.hasOwnProperty.call(x, k);
const text = (v, field, max = 100) => {
  if (typeof v !== 'string' || !v.trim() || v.length > max) throw Error(field + ' must be a non-empty string of at most ' + max + ' characters');
  return v.trim();
};
const plain = (v) => v && typeof v === 'object' && !Array.isArray(v);
const copy = (v) => structuredClone(v);
const finitePosition = (v) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 1e6;
const checkDiagram = (d) => {
  if (!(d instanceof Diagram) || !['logic','chip','quantum'].includes(d.lab)) {
    throw Error('Reusable computing modules require a Logic, Chip, or Quantum Diagram');
  }
};
function validateParamData(value, path = 'params', depth = 0) {
  if (depth > 12) throw Error(path + ': parameter nesting exceeds supported depth');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (Array.isArray(value)) {
    if (value.length > 2048) throw Error(path + ': parameter array too large');
    for (let i=0;i<value.length;i++) validateParamData(value[i], path + '[' + i + ']', depth+1);
    return;
  }
  if (plain(value)) {
    if (Object.keys(value).length > 256) throw Error(path + ': too many parameter keys');
    for (const [key,val] of Object.entries(value)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') throw Error('Unsafe parameter key: ' + key);
      validateParamData(val, path + '.' + key, depth+1);
    }
    return;
  }
  throw Error(path + ': unsupported or nonfinite parameter value');
}
function indexTemplate(template) {
  const errors = [];
  const blocks = new Map();
  const wireKeys = new Set(), wireIds = new Set();
  if (!plain(template) || template.format !== MODULE_FORMAT) return { errors:['Unknown module-template format'], blocks };
  if (typeof template.id !== 'string' || !template.id.trim() || template.id.length>100) errors.push('Invalid module ID');
  if (typeof template.name !== 'string' || !template.name.trim() || template.name.length>100) errors.push('Invalid module name');
  if (!['logic','chip','quantum'].includes(template.lab)) errors.push('Unsupported module lab');
  if (!Array.isArray(template.blocks) || !template.blocks.length || template.blocks.length>MAX_BLOCKS) errors.push('Invalid module block count');
  if (!Array.isArray(template.wires) || template.wires.length>MAX_WIRES) errors.push('Invalid module wire count');
  if (!Array.isArray(template.interfaces) || template.interfaces.length>MAX_INTERFACES) errors.push('Invalid interface count');
  if (errors.length) return {errors,blocks};
  for (const b of template.blocks) {
    if (!plain(b) || typeof b.id !== 'string' || !b.id.trim() || b.id.length>100 || blocks.has(b.id)) {
      errors.push('Duplicate/missing module block ID'); continue;
    }
    const def = getComponent(b.type);
    if (!def || def.lab !== template.lab) errors.push('Unknown or cross-lab component: ' + b.type);
    if (!finitePosition(b.x) || !finitePosition(b.y)) errors.push('Invalid component coordinates: ' + b.id);
    try { if (!plain(b.params)) throw Error('params must be an object'); validateParamData(b.params); }
    catch (err) { errors.push('Invalid parameters for ' + b.id + ': ' + err.message); }
    blocks.set(b.id, b);
  }
  for (const w of template.wires) {
    if (!plain(w) || typeof w.id !== 'string' || !w.id.trim() || wireIds.has(w.id) ||
        !w.from || !w.to || !blocks.has(w.from.block) || !blocks.has(w.to.block)) {
      errors.push('Invalid/duplicate module wire ID or endpoint'); continue;
    }
    wireIds.add(w.id);
    const src = blocks.get(w.from.block), dst = blocks.get(w.to.block);
    if (!canConnect(new Block(src), w.from.port, new Block(dst), w.to.port)) {
      errors.push('Incompatible internal module wire ' + w.id); continue;
    }
    const key = [w.from.block,w.from.port,w.to.block,w.to.port].join('\x00');
    if (wireKeys.has(key)) errors.push('Duplicate internal module connection');
    wireKeys.add(key);
  }
  const names = new Set(), endings = new Set();
  for (const port of template.interfaces) {
    if (!plain(port) || typeof port.name !== 'string' || !port.name.trim() ||
        names.has(port.name) || !blocks.has(port.blockId)) {
      errors.push('Invalid/duplicate module interface'); continue;
    }
    names.add(port.name);
    const definition = portsOf(new Block(blocks.get(port.blockId))).find(p => p.id === port.portId);
    if (!definition || port.dir !== definition.dir || port.type !== definition.type) {
      errors.push('Interface signature mismatch at ' + port.name);
    }
    const key = [port.blockId,port.portId].join('\x00');
    if (endings.has(key)) errors.push('Duplicate exposed module port');
    endings.add(key);
  }
  // Every internal-to-external boundary is an actual exposed port. Flattened
  // modules never create a magical top-level pin absent from the real netlist.
  return {errors, blocks};
}
export function validateModuleTemplate(template) {
  const {errors} = indexTemplate(template);
  return {ok: errors.length===0,errors};
}
function requireTemplate(template) {
  const verdict=validateModuleTemplate(template);
  if (!verdict.ok) throw Error('Invalid module template: ' + verdict.errors.join('; '));
}
function groupRecords(diagram) {
  return Array.isArray(diagram.meta?.assemblies) ? diagram.meta.assemblies : [];
}
export function assemblyIssues(diagram) {
  checkDiagram(diagram);
  const problems=[], used = new Set(), ids = new Set();
  for (const group of groupRecords(diagram)) {
    if (!group || group.format !== ASSEMBLY_FORMAT || typeof group.id !== 'string' || ids.has(group.id)) {
      problems.push('Invalid or duplicate assembly record'); continue;
    }
    ids.add(group.id);
    if (!Array.isArray(group.blockIds) || !group.blockIds.length) problems.push('Assembly ' + group.id + ' has no members');
    for (const id of group.blockIds || []) {
      if (!diagram.block(id)) problems.push('Assembly ' + group.id + ' references removed block ' + id);
      if (used.has(id)) problems.push('Block ' + id + ' belongs to overlapping assemblies');
      used.add(id);
    }
  }
  return problems;
}
export function listAssemblies(diagram) {
  checkDiagram(diagram);
  return groupRecords(diagram).map(group => ({
    ...copy(group),
    staleBlockIds: (group.blockIds || []).filter(id => !diagram.block(id)),
  }));
}
export function registerAssembly(diagram, {name,blockIds,templateId=null,id=uid('assembly')}={}) {
  checkDiagram(diagram);
  text(name,'assembly name');
  text(id,'assembly ID');
  if (!Array.isArray(blockIds) || !blockIds.length || blockIds.length>MAX_BLOCKS) throw Error('Assembly needs 1–250 block IDs');
  const ownIds=new Set(blockIds);
  if (ownIds.size!==blockIds.length) throw Error('Duplicate member block ID');
  for (const bid of blockIds) if (!diagram.block(bid)) throw Error('Unknown assembly member ' + bid);
  const occupied=new Set(groupRecords(diagram).flatMap(g=>g.blockIds || []));
  if (blockIds.some(bid=>occupied.has(bid))) throw Error('A block cannot belong to multiple assemblies');
  if (groupRecords(diagram).some(g=>g.id===id)) throw Error('Duplicate assembly ID');
  const record = {
    format:ASSEMBLY_FORMAT,id,name:name.trim(),templateId,
    lab:diagram.lab,blockIds:[...blockIds],
  };
  diagram.meta.assemblies=[...groupRecords(diagram), record];
  return copy(record);
}
export function ungroupAssembly(diagram, assemblyId) {
  checkDiagram(diagram);
  const old=groupRecords(diagram);
  const next=old.filter(a=>a.id!==assemblyId);
  if (next.length===old.length) return false;
  diagram.meta.assemblies=next; // No blocks or wires deleted.
  return true;
}
export function captureModuleTemplate(diagram,{name,blockIds,id=uid('module')}={}) {
  checkDiagram(diagram);
  text(name,'module name');text(id,'module ID');
  if(!Array.isArray(blockIds)||!blockIds.length||blockIds.length>MAX_BLOCKS ||
      new Set(blockIds).size!==blockIds.length) throw Error('Module capture requires 1–250 distinct blocks');
  const selected=new Set(blockIds);
  const blocks=diagram.blocks.filter(b=>selected.has(b.id));
  if(blocks.length!==selected.size) throw Error('Cannot capture missing blocks');
  for(const block of blocks){
    const def=getComponent(block.type);
    if(!def||def.lab!==diagram.lab)throw Error('Cannot capture unknown or cross-lab block '+block.type);
    if(!finitePosition(block.x)||!finitePosition(block.y))throw Error('Invalid block placement');
    validateParamData(block.params);
  }
  const minX=Math.min(...blocks.map(b=>b.x)),minY=Math.min(...blocks.map(b=>b.y));
  const wires=diagram.wires.filter(w=>selected.has(w.from.block)&&selected.has(w.to.block))
    .map(w=>copy({id:w.id,from:w.from,to:w.to}));
  const internalUsed=new Set(wires.flatMap(w=>[w.from.block+'\x00'+w.from.port,w.to.block+'\x00'+w.to.port]));
  const boundaryUsed=new Set(diagram.wires.filter(w=>selected.has(w.from.block)!==selected.has(w.to.block))
    .map(w=>selected.has(w.from.block)?w.from.block+'\x00'+w.from.port:w.to.block+'\x00'+w.to.port));
  const interfaces=[];
  for(const block of blocks) {
    for(const port of portsOf(block)){
      const key=block.id+'\x00'+port.id;
      if(!internalUsed.has(key)||boundaryUsed.has(key)){
        interfaces.push({name:block.id+'.'+port.id,blockId:block.id,portId:port.id,dir:port.dir,type:port.type});
      }
    }
  }
  const template={
    format:MODULE_FORMAT,id,name:name.trim(),lab:diagram.lab,
    blocks:blocks.map(b=>({id:b.id,type:b.type,params:copy(b.params),x:b.x-minX,y:b.y-minY})),
    wires,interfaces,origin:{diagramId:diagram.id,kind:'flattened-graph-capture'},
  };
  requireTemplate(template);
  return template;
}
export function instantiateModule(diagram,template,{x=0,y=0,name=template?.name,id=uid('assembly')}={}) {
  checkDiagram(diagram);
  requireTemplate(template);
  if (template.lab!==diagram.lab) throw Error('Cannot instantiate module across computing labs');
  if (!finitePosition(x)||!finitePosition(y)) throw Error('Module placement requires finite coordinates');
  text(name,'assembly name');text(id,'assembly ID');
  if (groupRecords(diagram).some(g=>g.id===id)) throw Error('Duplicate assembly ID');
  // Transaction: validate and build in a scratch copy. Nothing in the original
  // document is modified if a port, component or name cannot be instantiated.
  const candidate=diagram.clone();
  const existingBlocks=candidate.blocks.length,existingWires=candidate.wires.length;
  const oldToNew=new Map();
  for(const b of template.blocks){
    const created=candidate.addBlock(b.type,{x:x+b.x,y:y+b.y,params:copy(b.params)});
    oldToNew.set(b.id,created.id);
  }
  for(const w of template.wires){
    const edge=candidate.connect(oldToNew.get(w.from.block),w.from.port,oldToNew.get(w.to.block),w.to.port);
    if(!edge)throw Error('Unexpected duplicate template connection');
  }
  const blockIds=[...oldToNew.values()];
  const record=registerAssembly(candidate,{name,blockIds,templateId:template.id,id});
  const exposed=template.interfaces.map(p=>({
    name:p.name,blockId:oldToNew.get(p.blockId),portId:p.portId,dir:p.dir,type:p.type,
  }));
  const createdBlocks=candidate.blocks.slice(existingBlocks);
  const createdWires=candidate.wires.slice(existingWires);
  // Commit only after all operations and typed-port checks succeed.
  diagram.blocks.push(...createdBlocks);
  diagram.wires.push(...createdWires);
  diagram.meta.assemblies=candidate.meta.assemblies;
  return {assembly:record,createdBlockIds:blockIds,createdWireIds:createdWires.map(w=>w.id),exposedPorts:exposed};
}
export function serializeModuleLibrary(templates) {
  if(!Array.isArray(templates)||templates.length>100)throw Error('Module library exceeds 100 templates');
  const seen=new Set();
  for(const template of templates){
    requireTemplate(template);
    if(seen.has(template.id))throw Error('Module library contains duplicate template IDs');
    seen.add(template.id);
  }
  return JSON.stringify({format:LIBRARY_FORMAT,templates},null,2);
}
export function parseModuleLibrary(raw) {
  if(typeof raw!=='string'||raw.length>2_000_000)throw Error('Module library JSON exceeds supported size');
  let parsed;
  try{parsed=JSON.parse(raw);}catch{throw Error('Module library must be valid JSON');}
  if (!plain(parsed)||parsed.format!==LIBRARY_FORMAT||!Array.isArray(parsed.templates))
    throw Error('Unknown computing-module library format');
  // Verify and return a canonical detached copy, no caller-owned aliases.
  const templates=parsed.templates;
  serializeModuleLibrary(templates);
  return copy(templates);
}
