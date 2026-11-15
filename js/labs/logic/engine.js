// engine.js — discrete-event digital simulation for the Logic Lab.
// Time is an integer tick (1 tick = 1 ps nominal). Deterministic: identical
// diagrams always produce identical runs (no floating-point scheduling).
//
// Honest-behavior rules:
//  - Unconnected inputs read 'Z' and 'Z' propagates; a warning is emitted.
//  - An input driven by 2+ outputs is flagged (bus contention is undefined).
//  - Event storms (oscillation) abort the run with an explicit error.
//
// Requires logic component defs registered (import components.js first).

import { portsOf } from '../../core/block.js';
import { getComponent } from '../../core/registry.js';
import { EventQueue } from '../../core/events.js';

export const Z = 'Z';

export function runLogic(diagram, opts = {}) {
  const radix = diagram.meta?.radix ?? 2;
  const maxEvents = opts.maxEvents ?? 250_000;
  const maxTicks = opts.maxTicks ?? 4000;
  const warnings = [];
  const problems = [];

  if (radix < 2) throw new Error('Logic radix must be >= 2');

  // ---- index the netlist -------------------------------------------------
  const fanout = new Map(); // "blockId/port" (out) -> [{blockId, portId}]
  for (const w of diagram.wires) {
    const key = `${w.from.block}/${w.from.port}`;
    if (!fanout.has(key)) fanout.set(key, []);
    fanout.get(key).push({ blockId: w.to.block, portId: w.to.port });
  }

  // ---- per-block runtime state ------------------------------------------
  const st = new Map();
  for (const b of diagram.blocks) {
    const def = getComponent(b.type);
    if (!def) { problems.push(`Block ${b.id}: unknown type "${b.type}" — skipped.`); continue; }
    // every input starts at 'Z' so partially-connected blocks behave honestly
    const inputs = {};
    for (const p of portsOf(b)) if (p.dir === 'in') inputs[p.id] = Z;
    const rec = def.typeId === 'logic.PROBE'
      ? { times: [], values: [], label: b.params.name || b.id }
      : null;
    st.set(b.id, { block: b, def, inputs, out: {}, state: {}, rec });
  }

  const queue = new EventQueue();
  let _time = 0;

  function emitOutput(blockId, portId, value, time, delay) {
    const s = st.get(blockId);
    if (!s) return;
    s.out[portId] = value;
    const targets = fanout.get(`${blockId}/${portId}`) || [];
    for (const t of targets) {
      queue.push(time + delay, { type: 'input', blockId: t.blockId, portId: t.portId, value });
    }
  }

  const api = {
    maxTicks,
    warn: (msg) => warnings.push(msg),
    at: (t, fn) => queue.push(Math.max(0, t), { type: 'callback', fn }),
  };

  function outputDelay(def, params, portId) {
    if (def.delay) return Math.max(0, def.delay(params, portId));
    if (portId === 'q' && params.tco !== undefined) return Math.max(0, params.tco);
    return Math.max(0, params.delay ?? 10);
  }

  function evaluate(blockId, changedPorts, time) {
    const s = st.get(blockId);
    if (!s) return;
    if (s.def.typeId === 'logic.PROBE') {
      const v = s.inputs.in ?? Z;
      const last = s.rec.values[s.rec.values.length - 1];
      if (last === undefined || last !== v) { s.rec.times.push(time); s.rec.values.push(v); }
      return;
    }
    if (!s.def.logic?.eval) return;
    const ctx = { block: s.block, params: s.block.params, radix, state: s.state, api };
    const outs = s.def.logic.eval(ctx, s.inputs, changedPorts) || {};
    for (const [port, val] of Object.entries(outs)) {
      if (s.out[port] === val) continue;
      emitOutput(blockId, port, val, time, outputDelay(s.def, s.block.params, port));
    }
  }

  // ---- init: inputs + clocks drive the net (t = 0) ------------------------
  // Each block gets its own api view with emit bound to ITSELF, so scheduled
  // callbacks (clocks) emit from the right block even after all inits ran.
  for (const [blockId, s] of st) {
    if (!s.def.logic?.init) continue;
    const blockApi = Object.create(api);
    blockApi.emit = (portId, value) => emitOutput(blockId, portId, value, _time, 0);
    const ctx = { block: s.block, params: s.block.params, radix, state: s.state, api: blockApi };
    const outs = s.def.logic.init(ctx) || {};
    for (const [port, val] of Object.entries(outs)) emitOutput(blockId, port, val, 0, 0);
  }

  // ---- event loop ---------------------------------------------------------
  let events = 0;
  let ev;
  while ((ev = queue.pop())) {
    _time = ev.time;
    if (++events > maxEvents) {
      throw new Error(`Event storm / oscillation detected (> ${maxEvents} events at t=${ev.time}). ` +
        'Check for combinational feedback loops (e.g. a NOT gate feeding itself).');
    }
    const p = ev.payload;
    if (p.type === 'callback') { p.fn(); continue; }
    const s = st.get(p.blockId);
    if (!s) continue;
    if (s.inputs[p.portId] === p.value) continue;
    s.inputs[p.portId] = p.value;
    evaluate(p.blockId, [p.portId], ev.time);
  }

  // ---- structural warnings ------------------------------------------------
  for (const [blockId, s] of st) {
    for (const port of portsOf(s.block)) {
      if (port.dir !== 'in') continue;
      const nDrivers = diagram.driversOf(blockId, port.id).length;
      if (nDrivers === 0 && s.inputs[port.id] === Z) {
        warnings.push(`Block ${blockId}: input "${port.id}" unconnected (reads 'Z').`);
      } else if (nDrivers > 1) {
        warnings.push(`Block ${blockId}: input "${port.id}" driven by ${nDrivers} outputs — contention, result not meaningful.`);
      }
    }
  }

  // ---- collect probe records ----------------------------------------------
  const probes = {};
  for (const [blockId, s] of st) {
    if (!s.rec) continue;
    if (s.rec.values.length === 0) { s.rec.times.push(0); s.rec.values.push(Z); }
    probes[blockId] = s.rec;
  }

  return {
    ok: problems.length === 0,
    problems, warnings, probes,
    stats: { events, maxTime: _time, radix },
  };
}

/**
 * Exhaustive truth-table check of one gate at one radix, against an
 * independently supplied reference function.
 * refFn(inputs, radix) -> { portId: expectedValue }
 */
export function truthTableTest(def, radix, refFn, inputPorts) {
  const k = inputPorts.length;
  const rows = [];
  const mismatches = [];
  const total = Math.pow(radix, k);
  for (let i = 0; i < total; i++) {
    const inputs = {};
    let x = i;
    for (const p of inputPorts) { inputs[p] = x % radix; x = Math.floor(x / radix); }
    const expected = refFn(inputs, radix);
    const ctx = { block: { params: {} }, params: {}, radix, state: {}, api: {} };
    const got = def.logic.eval(ctx, inputs, []);
    const ok = Object.keys(expected).every((port) => got[port] === expected[port]);
    rows.push({ inputs: { ...inputs }, expected, got: { ...got }, ok });
    if (!ok) mismatches.push({ inputs: { ...inputs }, expected, got: { ...got } });
  }
  return { typeId: def.typeId, radix, rows, pass: mismatches.length === 0, mismatches };
}
