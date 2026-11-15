// engine.js — Chip Lab analog simulation engine.
//
// Modified Nodal Analysis (MNA), the same formulation SPICE uses:
//   DC / transient : real MNA + Newton-Raphson for nonlinear devices
//                    (numeric Jacobians — immune to hand-derived stamp bugs)
//   AC             : complex MNA via real embedding (mna.js), linear devices
//   transient      : backward Euler, fixed dt
//
// Honesty rules:
//  - no ground reference or floating terminal -> explicit error
//  - AC with nonlinear devices -> refused (no silent linearization lies)
//  - non-convergence -> error, never a wrong number
//  - every result block states which model produced it

import { getComponent } from '../../core/registry.js';
import { solveReal, makeComplexSystem } from './mna.js';
import { CONST } from '../../core/units.js';

const Vt = (T = 300) => (CONST.k_B * T) / CONST.q_e; // ≈ 25.85 mV @ 300 K

// ---------------------------------------------------------------------------
// netlist extraction: wires -> electrical nets (union-find)
// ---------------------------------------------------------------------------
export function buildNetlist(diagram) {
  const problems = [];
  const entries = diagram.blocks
    .map((block) => ({
      block,
      def: getComponent(block.type),
      // deep-copy params: analyses must never mutate the caller's design
      // (audit regression: paramOverrides changed the original resistor)
      params: JSON.parse(JSON.stringify(block.params)),
    }))
    .filter((e) => e.def?.chip);

  const parent = new Map();
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };

  for (const { block, def } of entries) {
    for (const port of def.ports(block.params)) {
      if (port.type === 'analog') parent.set(`${block.id}/${port.id}`, `${block.id}/${port.id}`);
    }
  }
  for (const w of diagram.wires) {
    const a = `${w.from.block}/${w.from.port}`, c = `${w.to.block}/${w.to.port}`;
    if (parent.has(a) && parent.has(c)) union(a, c);
  }

  let groundNet = null;
  for (const { block, def } of entries) {
    if (def.chip.kind === 'gnd') groundNet = find(`${block.id}/g`);
  }
  if (!groundNet) {
    problems.push('No ground (GND block) in the circuit — nodal analysis has no reference.');
    return { entries, netOf: new Map(), netCount: 0, problems, aliases: {} };
  }

  const netOf = new Map();
  const aliases = {};
  const byRoot = new Map();
  for (const key of parent.keys()) {
    const r = find(key);
    if (!byRoot.has(r)) byRoot.set(r, []);
    byRoot.get(r).push(key);
  }
  let count = 0;
  for (const [root, keys] of byRoot) {
    if (root === groundNet) { for (const k of keys) netOf.set(k, 0); continue; }
    count += 1;
    for (const k of keys) netOf.set(k, count);
    aliases[`n${count}`] = keys.map((k) => k.replace('/', '.'));
  }

  // floating-terminal check (voltmeter exempt, warned)
  for (const [, keys] of byRoot) {
    if (keys.length > 1) continue;
    const [blockId, portId] = keys[0].split('/');
    const entry = entries.find((e) => e.block.id === blockId);
    if (!entry || entry.def.chip.kind === 'gnd') continue;
    if (entry.def.chip.kind === 'voltmeter') problems.push(`Voltmeter ${blockId}: probe unconnected — reads 0 V.`);
    else problems.push(`Block ${blockId}: terminal "${portId}" is not connected (floating).`);
  }

  return { entries, netOf, netCount: count, problems, aliases };
}

// ---------------------------------------------------------------------------
// device models: out-of-node terminal currents (numeric-Jacobian friendly)
// ---------------------------------------------------------------------------

/** MOSFET square-law. v = [vd, vg, vs] -> out-of-node currents [iD, iG, iS].
 * lambda (channel-length modulation) gives the saturation region a finite
 * output conductance — without it, single-MOSFET nodes are numerically
 * floating and Newton diverges (and real devices DO have finite gds). */
export function mosCurrents(v, kind, params) {
  const [vd, vg, vs] = v;
  const k = Math.max(1e-12, params.k);
  const lambda = params.lambda ?? 0.01;
  let vgs = vg - vs, vds = vd - vs, vth = params.vth;
  if (kind === 'pmos') { vgs = -vgs; vds = -vds; vth = -vth; }
  let id = 0;
  const over = vgs - vth;
  if (over > 0 && vds >= 0) {
    id = vds >= over
      ? 0.5 * k * over * over * (1 + lambda * vds)     // saturation + CLM
      : k * (over * vds - 0.5 * vds * vds);            // linear
  }
  // out-of-node convention: NMOS on -> current leaves drain [id, 0, -id];
  // PMOS on (id computed in sign-reversed variables) -> leaves source [-id, 0, id]
  const s = kind === 'pmos' ? -1 : 1;
  return [s * id, 0, -s * id];
}

/** Shockley diode. v = [va, vc] -> [ia, ic], with voltage limiting. */
export function diodeCurrents(v, params, T = 300) {
  const [va, vc] = v;
  let vd = va - vc;
  if (vd > 0.9) vd = 0.9;
  if (vd < -5) vd = -5;
  const i = params.is * (Math.exp(vd / (params.n * Vt(T))) - 1);
  return [i, -i];
}

function numericJacobian(f, base) {
  const n = base.length;
  const i0 = f(base);
  const J = Array.from({ length: i0.length }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const h = 1e-6 * Math.max(1, Math.abs(base[j]));
    const vp = [...base], vm = [...base];
    vp[j] += h; vm[j] -= h;
    const ip = f(vp), im = f(vm);
    for (let k = 0; k < i0.length; k++) J[k][j] = (ip[k] - im[k]) / (2 * h);
  }
  return { i0, J };
}

/** Stamp element via J = d(i_out)/d(v_terminal) at operating point vTerm. */
function stampNonlinear(G, rhs, nodeIdxs, vTerm, currentsFn) {
  const { i0, J } = numericJacobian(currentsFn, vTerm);
  const n = nodeIdxs.length;
  for (let k = 0; k < n; k++) {
    const nk = nodeIdxs[k];
    if (nk === 0) continue;
    for (let j = 0; j < n; j++) {
      const nj = nodeIdxs[j];
      if (nj === 0) continue;
      G[nk - 1][nj - 1] += J[k][j];
    }
    let corr = i0[k];
    for (let j = 0; j < n; j++) corr -= J[k][j] * vTerm[j];
    rhs[nk - 1] -= corr;
  }
}

function waveValue(params, t) {
  switch (params.mode) {
    case 'sine': return (params.offset || 0) + params.amp * Math.sin(2 * Math.PI * params.freq * t + (params.phase || 0));
    case 'pulse': {
      const period = 1 / Math.max(1e-15, params.freq);
      const ph = ((t % period) + period) % period;
      return (params.offset || 0) + (ph < period * params.duty ? params.amp : 0);
    }
    default: return params.dc;
  }
}

// ---------------------------------------------------------------------------
// real MNA system builder (DC + transient + Newton states)
// vNode: 1-based array [_, v1..vN] used to linearize nonlinear devices.
// ---------------------------------------------------------------------------
function buildRealSystem(nl, opts) {
  const {
    dt = null, dcMode = false, t = 0,
    vNode = null, iPrevL = {}, vPrevC = {}, opampClamp = {}, gmin = 1e-12,
    alpha = 1, // source scaling for homotopy (source stepping)
  } = opts;
  const N = nl.netCount;
  const branches = [];
  const branchOf = new Map();
  for (const { block, def } of nl.entries) {
    const kind = def.chip.kind;
    if (kind === 'vsource' || kind === 'ammeter' || kind === 'opamp' || (kind === 'ind' && dcMode)) {
      branchOf.set(block.id, branches.length);
      branches.push({ blockId: block.id, kind });
    }
  }
  const M = N + branches.length;
  const G = Array.from({ length: M }, () => new Float64Array(M));
  const rhs = new Float64Array(M);
  const nodeV = (portKey) => nl.netOf.get(portKey) ?? 0;
  const iterV = (node) => (node && vNode ? (vNode[node] ?? 0) : 0);

  const stampCond = (i, j, gVal) => {
    if (i && j) {
      G[i - 1][i - 1] += gVal; G[j - 1][j - 1] += gVal;
      G[i - 1][j - 1] -= gVal; G[j - 1][i - 1] -= gVal;
    } else if (i) G[i - 1][i - 1] += gVal;   // single-ended to ground
    else if (j) G[j - 1][j - 1] += gVal;
  };
  const stampVSource = (i, j, br, E) => {
    if (i) { G[i - 1][br] += 1; G[br][i - 1] += 1; }
    if (j) { G[j - 1][br] -= 1; G[br][j - 1] -= 1; }
    rhs[br] += E;
  };

  for (const { block, def, params: P } of nl.entries) {
    const kind = def.chip.kind;
    const bid = block.id;
    const np = nodeV(`${bid}/p`), nn = nodeV(`${bid}/n`);
    switch (kind) {
      case 'gnd': case 'voltmeter': break;
      case 'res':
        stampCond(np, nn, 1 / Math.max(1e-9, P.r));
        break;
      case 'cap': {
        if (dcMode) break; // open circuit at DC
        const gEq = P.c / dt;
        stampCond(np, nn, gEq);
        const v0 = vPrevC[bid] ?? P.vInit ?? 0;
        if (np) rhs[np - 1] += gEq * v0;
        if (nn) rhs[nn - 1] -= gEq * v0;
        break;
      }
      case 'ind': {
        if (dcMode) stampVSource(np, nn, N + branchOf.get(bid), 0); // ideal short
        else {
          const gEq = dt / Math.max(1e-15, P.l);
          stampCond(np, nn, gEq);
          const i0 = iPrevL[bid] ?? P.iInit ?? 0;
          if (np) rhs[np - 1] -= i0;
          if (nn) rhs[nn - 1] += i0;
        }
        break;
      }
      case 'vsource':
        stampVSource(np, nn, N + branchOf.get(bid), (dcMode ? P.dc : waveValue(P, t)) * alpha);
        break;
      case 'ammeter':
        stampVSource(np, nn, N + branchOf.get(bid), 0); // ideal 0 V series element
        break;
      case 'isource':
        if (np) rhs[np - 1] += P.i * alpha;
        if (nn) rhs[nn - 1] -= P.i * alpha;
        break;
      case 'diode': {
        const na = nodeV(`${bid}/a`), nc = nodeV(`${bid}/c`);
        // junction voltage limiting (SPICE-style): linearize at a clamped
        // junction voltage so Newton cannot oscillate across the exponential
        let va = iterV(na), vc = iterV(nc);
        let vd = va - vc;
        if (vd > 0.9) va = vc + 0.9;
        if (vd < -5) va = vc - 5;
        stampNonlinear(G, rhs, [na, nc], [va, vc], (v) => diodeCurrents(v, P));
        stampCond(na, nc, gmin * 10);
        break;
      }
      case 'nmos': case 'pmos': {
        const nd = nodeV(`${bid}/d`), ng = nodeV(`${bid}/g`), ns = nodeV(`${bid}/s`);
        stampNonlinear(G, rhs, [nd, ng, ns], [iterV(nd), iterV(ng), iterV(ns)], (v) => mosCurrents(v, kind, P));
        break;
      }
      case 'opamp': {
        const nvp = nodeV(`${bid}/vp`), nvn = nodeV(`${bid}/vn`), nvo = nodeV(`${bid}/vout`);
        const br = N + branchOf.get(bid);
        const clamp = opampClamp[bid];
        if (clamp !== undefined && clamp !== null) {
          stampVSource(nvo, 0, br, clamp); // rail-clamped: output fixed
        } else {
          if (nvo) { G[nvo - 1][br] += 1; G[br][nvo - 1] += 1; }
          if (nvp) G[br][nvp - 1] -= P.gain;
          if (nvn) G[br][nvn - 1] += P.gain;
        }
        break;
      }
      default: break;
    }
  }
  // ground leakage (gmin, as SPICE does) keeps every node solvable
  for (let i = 1; i <= N; i++) G[i - 1][i - 1] += gmin;
  return { G, rhs, M, N, branchOf };
}

// ---------------------------------------------------------------------------
// Newton-Raphson with three escalating strategies (as in SPICE):
//   1. direct iteration (warm start allowed)
//   2. source stepping: solve alpha*Vsrc for alpha = 0.1..1 (homotopy)
//   3. gmin stepping: heavier ground leakage relaxes the nonlinearity
// ---------------------------------------------------------------------------
function newtonCore(nl, opts, { vStart = null, alpha = 1, gmin = 1e-12, maxIter = 200, maxStep = 1.0 } = {}) {
  const N = nl.netCount;
  let vNode = vStart ? [...vStart] : new Array(N + 1).fill(0);
  let bestDelta = Infinity, stall = 0, step = maxStep;
  for (let iter = 0; iter < maxIter; iter++) {
    const sys = buildRealSystem(nl, { ...opts, vNode, gmin, alpha });
    let x;
    try { x = solveReal(sys.G, sys.rhs); } catch (e) {
      if (/Singular/.test(e.message)) return { failed: true, reason: e.message };
      throw e;
    }
    const next = new Array(N + 1).fill(0);
    for (let i = 1; i <= N; i++) next[i] = x[i - 1];
    // damped Newton: cap the per-iteration node-voltage step. Prevents the
    // classic saturation-region "current source slingshot" oscillation.
    if (step > 0) {
      for (let i = 1; i <= N; i++) {
        const d = next[i] - vNode[i];
        if (Math.abs(d) > step) next[i] = vNode[i] + Math.sign(d) * step;
      }
    }
    let delta = 0;
    for (let i = 1; i <= N; i++) delta = Math.max(delta, Math.abs(next[i] - vNode[i]));
    // adaptive: if stalled (bouncing around a region-boundary kink), shrink
    // the step so the iteration can crawl into the kink neighborhood
    if (delta < bestDelta - 1e-12) { bestDelta = delta; stall = 0; }
    else if (++stall >= 4 && step > 1e-4) { step = Math.max(1e-4, step * 0.5); stall = 0; }
    vNode = next;
    if (delta < 1e-9) return { vNode, gminUsed: gmin, failed: false, iters: iter + 1 };
  }
  return { failed: true, reason: `no convergence in ${maxIter} iterations` };
}

function newtonSolve(nl, opts) {
  const N = nl.netCount;
  const vStart = opts.vNode && opts.vNode.length === N + 1 ? opts.vNode : null;

  // 1. direct
  let res = newtonCore(nl, opts, { vStart });
  if (!res.failed) return res;

  // 2. source stepping homotopy, finer near the top, gmin escalation per step
  let vPrev = vStart || new Array(N + 1).fill(0);
  const alphas = [];
  for (let k = 1; k <= 20; k++) alphas.push(k / 20);
  for (const a of alphas) {
    let done = null;
    for (const gmin of [1e-12, 1e-9, 1e-6]) {
      done = newtonCore(nl, opts, { vStart: vPrev, alpha: a, gmin, maxIter: 150 });
      if (!done.failed) break;
    }
    if (!done || done.failed) return { failed: true, reason: `source stepping failed at alpha=${a}: ${done?.reason}` };
    vPrev = done.vNode;
  }
  return done;
}

/** opamp rail enforcement: clamp violating outputs and re-solve (≤3 rounds). */
function solveDCWithRails(nl, opts) {
  const clamps = {};
  for (let round = 0; round < 3; round++) {
    const res = newtonSolve(nl, { ...opts, opampClamp: clamps });
    if (res.failed) return res;
    let violated = false;
    for (const { block, params: P, def } of nl.entries) {
      if (def.chip.kind !== 'opamp') continue;
      if (clamps[block.id] !== undefined) continue;
      const vo = res.vNode[nl.netOf.get(`${block.id}/vout`)] ?? 0;
      if (vo > P.vcc) { clamps[block.id] = P.vcc; violated = true; }
      else if (vo < -P.vcc) { clamps[block.id] = -P.vcc; violated = true; }
    }
    if (!violated) return { ...res, clamps };
  }
  return { ...newtonSolve(nl, { ...opts, opampClamp: clamps }), clamps };
}

// ---------------------------------------------------------------------------
// analyses
// ---------------------------------------------------------------------------

function collectMeters(nl, vNode, branchCurrents) {
  const meters = {};
  for (const { block, def } of nl.entries) {
    const kind = def.chip.kind;
    if (kind === 'voltmeter') {
      const node = nl.netOf.get(`${block.id}/p`) ?? 0;
      meters[block.id] = node === 0 ? 0 : vNode[node];
    } else if (kind === 'ammeter') {
      const br = branchCurrents.get(block.id);
      meters[block.id] = br ?? 0;
    }
  }
  return meters;
}

/** Extract branch currents from a solved system. */
function branchCurrentsFrom(sys, x, N) {
  const out = new Map();
  let bi = 0;
  for (const [blockId] of sys.branchOf) {
    out.set(blockId, x[N + bi]);
    bi += 1;
  }
  return out;
}

/** DC operating point. opts: {paramOverrides: {blockId: {key: value}}} */
export function solveDC(diagram, opts = {}) {
  const nl = buildNetlist(diagram);
  if (nl.problems.length) return { ok: false, problems: nl.problems };
  if (opts.paramOverrides) applyOverrides(nl, opts.paramOverrides);
  const res = solveDCWithRails(nl, { dcMode: true });
  if (res.failed) return { ok: false, problems: [res.reason] };

  // re-solve once more to get branch currents from the final system
  const sys = buildRealSystem(nl, { dcMode: true, vNode: res.vNode, opampClamp: res.clamps });
  let x;
  try { x = solveReal(sys.G, sys.rhs); } catch (e) { return { ok: false, problems: [e.message] }; }
  const currents = branchCurrentsFrom(sys, x, nl.netCount);
  const voltages = {};
  for (let i = 1; i <= nl.netCount; i++) voltages[`n${i}`] = res.vNode[i];
  const meters = collectMeters(nl, res.vNode, currents);
  return {
    ok: true, analysis: 'dc',
    nodes: voltages, nodeAliases: nl.aliases, meters,
    elements: elementReport(nl, { dc: true, vNode: res.vNode, currents }),
    gminUsed: res.gminUsed,
  };
}

function applyOverrides(nl, overrides) {
  for (const e of nl.entries) {
    const o = overrides[e.block.id];
    if (o) Object.assign(e.params, o);
  }
}

/** Per-element currents/power/thermal/noise for a solved instant or DC. */
function elementReport(nl, { dc = false, t = 0, dt = null, vNode, vPrevC = {}, iPrevL = {}, currents }) {
  const out = [];
  const nodeV = (k) => {
    const idx = nl.netOf.get(k) ?? 0;
    return idx === 0 ? 0 : vNode[idx];
  };
  for (const { block, def, params: P } of nl.entries) {
    const kind = def.chip.kind;
    const bid = block.id;
    const vp = nodeV(`${bid}/p`), vn = nodeV(`${bid}/n`);
    let v = vp - vn;
    let i = 0, label = `${kind} ${bid}`;
    switch (kind) {
      case 'res': i = v / P.r; break;
      case 'cap': i = dc ? 0 : (P.c * (v - (vPrevC[bid] ?? P.vInit ?? 0))) / dt; break;
      case 'ind': i = dc ? (currents.get(bid) ?? 0) : (iPrevL[bid] ?? P.iInit ?? 0) + (dt / P.l) * v; break;
      case 'diode': {
        // audit fix: diodes have anode/cathode, not p/n — power = Va·Ia
        const va = nodeV(`${bid}/a`), vc = nodeV(`${bid}/c`);
        v = va - vc;
        i = diodeCurrents([va, vc], P)[0];
        break;
      }
      case 'nmos': case 'pmos': {
        // audit fix: MOSFETs have drain/gate/source, not p/n —
        // dissipated power is P = Vds · Id (gate dissipates nothing)
        const vd = nodeV(`${bid}/d`), vg = nodeV(`${bid}/g`), vs = nodeV(`${bid}/s`);
        v = vd - vs;
        i = mosCurrents([vd, vg, vs], kind, P)[0];
        label = `${kind} ${bid} (Vds=${v.toFixed(3)}V)`;
        break;
      }
      case 'vsource': i = -(currents.get(bid) ?? 0); break; // delivered to circuit
      case 'isource': i = P.i; break;
      case 'opamp': i = currents.get(bid) ?? 0; break;
      case 'ammeter': i = currents.get(bid) ?? 0; break;
      default: continue;
    }
    const power = Math.abs(v * i);
    const row = { blockId: bid, kind, label, v, i, power };
    if (P.rth) row.tempC = 25 + power * P.rth;
    if (kind === 'res') row.noiseVRms = Math.sqrt(4 * CONST.k_B * 300 * P.r * 1e6); // Johnson, B=1MHz
    out.push(row);
  }
  return out;
}

/**
 * Transient analysis (backward Euler).
 * opts: { tstop, dt (or points), maxPoints }
 */
export function runTransient(diagram, opts = {}) {
  const nl = buildNetlist(diagram);
  if (nl.problems.length) return { ok: false, problems: nl.problems };
  const tstop = opts.tstop ?? 1e-3;
  const dt = opts.dt ?? tstop / 1000;
  if (dt <= 0) return { ok: false, problems: ['dt must be > 0'] };
  const steps = Math.min(Math.ceil(tstop / dt), 2_000_000);
  const maxPoints = opts.maxPoints ?? 2000;
  const recordEvery = Math.max(1, Math.floor(steps / maxPoints));

  const series = { t: [], meters: {}, elements: [] };
  const meterIds = nl.entries.filter((e) => ['voltmeter', 'ammeter'].includes(e.def.chip.kind)).map((e) => e.block.id);
  for (const id of meterIds) series.meters[id] = [];
  const elemSeries = {};

  let vPrevC = {}, iPrevL = {};
  let vNode = null;
  const warnings = [];
  for (let step = 0; step <= steps; step++) {
    const t = step * dt;
    // advance: solve this instant using previous state for companions
    const res = newtonSolve(nl, { dt, t, vNode, iPrevL, vPrevC });
    if (res.failed) return { ok: false, problems: [`Transient failed at t=${t.toExponential(3)}: ${res.reason}`] };
    vNode = res.vNode;
    const sys = buildRealSystem(nl, { dt, t, vNode, iPrevL, vPrevC });
    let x;
    try { x = solveReal(sys.G, sys.rhs); } catch (e) {
      return { ok: false, problems: [`Transient failed at t=${t.toExponential(3)}: ${e.message}`] };
    }
    const currents = branchCurrentsFrom(sys, x, nl.netCount);
    const elems = elementReport(nl, { t, dt, vNode, vPrevC, iPrevL, currents });
    if (step % recordEvery === 0 || step === steps) {
      series.t.push(t);
      const meters = collectMeters(nl, vNode, currents);
      for (const id of meterIds) series.meters[id].push(meters[id]);
      for (const e of elems) {
        (elemSeries[e.blockId] ??= { kind: e.kind, label: e.label, power: [], current: [] });
        elemSeries[e.blockId].power.push(e.power);
        elemSeries[e.blockId].current.push(e.i);
      }
    }
    // update state companions for next step
    const nextC = {}, nextL = {};
    for (const { block, def } of nl.entries) {
      const kind = def.chip.kind;
      const bid = block.id;
      const vp = (() => { const i = nl.netOf.get(`${bid}/p`) ?? 0; return i ? vNode[i] : 0; })();
      const vn = (() => { const i = nl.netOf.get(`${bid}/n`) ?? 0; return i ? vNode[i] : 0; })();
      if (kind === 'cap') nextC[bid] = vp - vn;
      if (kind === 'ind') nextL[bid] = (iPrevL[bid] ?? def.params.iInit ?? 0) + (dt / Math.max(1e-15, def.params.l)) * (vp - vn);
    }
    vPrevC = nextC; iPrevL = nextL;
  }
  return {
    ok: true, analysis: 'tran',
    t: series.t, meters: series.meters, elements: elemSeries,
    nodeAliases: nl.aliases, warnings,
  };
}

/**
 * AC analysis (linear devices only). Returns per-meter magnitude/phase.
 * opts: { fstart, fstop, points }
 */
export function runAC(diagram, opts = {}) {
  const nl = buildNetlist(diagram);
  if (nl.problems.length) return { ok: false, problems: nl.problems };
  const nonlinear = nl.entries.filter((e) => ['diode', 'nmos', 'pmos'].includes(e.def.chip.kind));
  if (nonlinear.length) {
    return {
      ok: false,
      problems: [
        `AC analysis is linear and cannot include: ${nonlinear.map((e) => e.block.id).join(', ')}. ` +
        'Use transient analysis for nonlinear circuits, or remove these elements. (Small-signal linearization about a bias point is not supported in v1 — stated openly rather than guessed.)',
      ],
    };
  }
  const fstart = opts.fstart ?? 10;
  const fstop = opts.fstop ?? 1e7;
  const points = opts.points ?? 200;
  const f = [];
  for (let i = 0; i < points; i++) f.push(fstart * Math.pow(fstop / fstart, i / (points - 1)));

  const meterIds = nl.entries.filter((e) => ['voltmeter', 'ammeter'].includes(e.def.chip.kind)).map((e) => e.block.id);
  const out = { ok: true, analysis: 'ac', f, meters: {}, nodeAliases: nl.aliases };
  for (const id of meterIds) out.meters[id] = { db: [], phase: [], mag: [] };

  for (const freq of f) {
    const omega = 2 * Math.PI * freq;
    const N = nl.netCount;
    const branches = [];
    const branchOf = new Map();
    for (const { block, def } of nl.entries) {
      if (['vsource', 'ammeter', 'opamp'].includes(def.chip.kind)) {
        branchOf.set(block.id, branches.length);
        branches.push(block.id);
      }
    }
    const M = N + branches.length;
    const sys = makeComplexSystem(M);
    // NOTE: complex unknowns are 0-BASED (node i -> unknown i-1).
    // cn() maps a net to its 0-based unknown index, or -1 for ground/absent.
    const cn = (portKey) => {
      const i = nl.netOf.get(portKey) ?? 0;
      return i > 0 ? i - 1 : -1;
    };
    // single complex entry add; ground entries (i or j = -1) are dropped
    const C = (i, j, re, im) => { if (i >= 0 && j >= 0) sys.add(i, j, re, im); };
    const vs = (i, j, br, E) => {
      if (i >= 0) { sys.add(i, br, 1, 0); sys.add(br, i, 1, 0); }
      if (j >= 0) { sys.add(j, br, -1, 0); sys.add(br, j, -1, 0); }
      sys.rhs[2 * br] += E.re; sys.rhs[2 * br + 1] += E.im;
    };

    for (const { block, def, params: P } of nl.entries) {
      const kind = def.chip.kind;
      const bid = block.id;
      const np = cn(`${bid}/p`), nn = cn(`${bid}/n`);
      switch (kind) {
        case 'res': C(np, np, 1 / P.r, 0); C(nn, nn, 1 / P.r, 0); C(np, nn, -1 / P.r, 0); C(nn, np, -1 / P.r, 0); break;
        case 'cap': {
          const im = omega * P.c;
          C(np, np, 0, im); C(nn, nn, 0, im); C(np, nn, 0, -im); C(nn, np, 0, -im);
          break;
        }
        case 'ind': {
          const im = -1 / (omega * Math.max(1e-15, P.l));
          C(np, np, 0, im); C(nn, nn, 0, im); C(np, nn, 0, -im); C(nn, np, 0, -im);
          break;
        }
        case 'vsource': {
          const br = N + branchOf.get(bid);
          const E = P.mode === 'ac'
            ? { re: P.amp * Math.cos(P.phase || 0), im: P.amp * Math.sin(P.phase || 0) }
            : { re: 0, im: 0 };
          vs(np, nn, br, E);
          break;
        }
        case 'ammeter': {
          const br = N + branchOf.get(bid);
          vs(np, nn, br, { re: 0, im: 0 });
          break;
        }
        case 'isource': break; // DC source: zero small-signal excitation
        case 'opamp': {
          const nvp = cn(`${bid}/vp`), nvn = cn(`${bid}/vn`), nvo = cn(`${bid}/vout`);
          const br = N + branchOf.get(bid);
          if (nvo >= 0) { sys.add(nvo, br, 1, 0); sys.add(br, nvo, 1, 0); }
          if (nvp >= 0) sys.add(br, nvp, -P.gain, 0);
          if (nvn >= 0) sys.add(br, nvn, P.gain, 0);
          break;
        }
        default: break;
      }
    }
    let x;
    try { x = sys.solve(); } catch (e) { return { ok: false, problems: [`AC failed at ${freq.toExponential(2)} Hz: ${e.message}`] }; }
    for (const { block, def } of nl.entries) {
      const kind = def.chip.kind;
      if (kind === 'voltmeter') {
        const node0 = cn(`${block.id}/p`);
        const z = node0 < 0 ? { re: 0, im: 0 } : sys.get(x, node0);
        const mag = Math.hypot(z.re, z.im);
        out.meters[block.id].mag.push(mag);
        out.meters[block.id].db.push(20 * Math.log10(Math.max(mag, 1e-30)));
        out.meters[block.id].phase.push(Math.atan2(z.im, z.re) * 180 / Math.PI);
      } else if (kind === 'ammeter') {
        const br = N + branchOf.get(block.id);
        const z = sys.get(x, br);
        const mag = Math.hypot(z.re, z.im);
        out.meters[block.id].mag.push(mag);
        out.meters[block.id].db.push(20 * Math.log10(Math.max(mag, 1e-30)));
        out.meters[block.id].phase.push(Math.atan2(z.im, z.re) * 180 / Math.PI);
      }
    }
  }
  return out;
}

/**
 * DC sweep: vary one source parameter, record meters at each point.
 * opts: { blockId, param='dc', from, to, steps }
 */
export function dcSweep(diagram, opts = {}) {
  const { blockId, param = 'dc', from, to, steps = 50 } = opts;
  const sweepVals = [];
  const meters = {};
  for (let i = 0; i <= steps; i++) {
    const val = from + ((to - from) * i) / steps;
    const d2 = diagram.clone();
    const b = d2.block(blockId);
    if (!b) return { ok: false, problems: [`dcSweep: block ${blockId} not found`] };
    b.params[param] = val;
    const res = solveDC(d2);
    if (!res.ok) return { ok: false, problems: res.problems, at: { val } };
    sweepVals.push(val);
    for (const [id, v] of Object.entries(res.meters)) (meters[id] ??= []).push(v);
  }
  return { ok: true, analysis: 'dc-sweep', sweep: { blockId, param, from, to, steps }, sweepVals, meters };
}

export function runChip(diagram, opts = {}) {
  const analysis = opts.analysis ?? 'dc';
  switch (analysis) {
    case 'dc': return solveDC(diagram, opts);
    case 'tran': return runTransient(diagram, opts);
    case 'ac': return runAC(diagram, opts);
    case 'dc-sweep': return dcSweep(diagram, opts);
    default: return { ok: false, problems: [`Unknown analysis "${analysis}"`] };
  }
}
