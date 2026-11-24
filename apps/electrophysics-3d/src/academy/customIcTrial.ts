import '../../../../js/labs/chip/components.js';
import { EventQueue } from '../../../../js/core/events.js';
import { runTransient } from '../../../../js/labs/chip/engine.js';
import { canonicalJson, sha256Hex } from '../state/project.js';
import { REFERENCE, SKY130 } from '../data/reference.js';
import type { SandboxComponent } from '../state/store.js';

type Terminal = { block: string; port: string };
const PERIOD = 300e-12;
const FIXTURE_LOAD_F = 15e-15;
const HALF = PERIOD / 2;

function trialDiagram(components: SandboxComponent[], vdd: number) {
  if (!components.length || components.length > 24) throw Error('Academy transient fixture admits 1–24 components');
  const input = components.find((c) => c.id === 'academy_input' && c.kind === 'rail');
  const output = components.find((c) => c.kind === 'probe');
  if (!input?.nodes[0] || !output?.nodes[0]) throw Error('Leave the Academy input rail and an output probe in the schematic');
  const blocks: Array<{ id: string; type: string; params: Record<string, unknown> }> = [];
  const wires: Array<{ from: Terminal; to: Terminal }> = [];
  const terminals = new Map<string, Terminal>();
  function add(id: string, type: string, params: Record<string, unknown>, ports: Record<string, string>) {
    blocks.push({ id, type, params });
    for (const [port, net] of Object.entries(ports)) {
      if (!net) throw Error('Unconnected Academy test fixture terminal');
      const to = { block: id, port };
      const from = terminals.get(net);
      if (from) wires.push({ from, to });
      else terminals.set(net, to);
    }
  }
  add('fixture_ground', 'chip.GND', {}, { g: 'gnd' });
  for (const c of components) {
    if (c.id.startsWith('fixture_')) throw Error('Reserved Academy fixture ID');
    const [a, b, source] = c.nodes;
    if (c.kind === 'rail') {
      const params = c === input
        ? { mode: 'sine', freq: 1 / PERIOD, amp: vdd / 2, offset: vdd / 2, phase: -Math.PI / 2 }
        : { mode: 'dc', dc: vdd };
      add(c.id, 'chip.VSOURCE', params, { p: a, n: 'gnd' });
    } else if (c.kind === 'nmos' || c.kind === 'pmos') {
      add(c.id, c.kind === 'nmos' ? 'chip.NMOS' : 'chip.PMOS',
        { k: c.params?.kp ?? 0.004, vth: c.params?.vth ?? (c.kind === 'nmos' ? SKY130.VTH_NMOS_V : SKY130.VTH_PMOS_V), lambda: c.params?.lambda ?? 0.06 },
        { g: a, d: b, s: source });
    } else if (c.kind === 'resistor') {
      add(c.id, 'chip.RES', { r: c.params?.R ?? 100000 }, { p: a, n: b });
    } else if (c.kind !== 'probe' && !(c.kind === 'gnd' && a === 'gnd')) {
      throw Error('Academy transient fixture supports rails, MOSFETs, resistors, ground and probes');
    }
  }
  add('fixture_input_probe', 'chip.VOLTMETER', {}, { p: input.nodes[0] });
  add('fixture_probe', 'chip.VOLTMETER', {}, { p: output.nodes[0] });
  add('fixture_load', 'chip.CAP', { c: FIXTURE_LOAD_F, vInit: 0 }, { p: output.nodes[0], n: 'gnd' });
  return { blocks, wires };
}

function measure(diagram: ReturnType<typeof trialDiagram>, vdd: number, dt: number) {
  const run = runTransient(diagram, { tstop: PERIOD * 2.8, dt, maxPoints: 9000 });
  if (!run.ok || !run.t || !run.meters || !run.elements) throw Error(run.problems?.join('; ') || 'Transient solve refused');
  const times = run.t;
  const { fixture_probe: values, fixture_input_probe: inputs } = run.meters as Record<string, number[]>;
  const feeds = Object.entries(run.elements).filter(([id, e]) => e.kind === 'vsource' && id !== 'academy_input');
  if (!values || !inputs || feeds.length === 0 || values.some((v: number) => !Number.isFinite(v))) throw Error('Transient probe or supply telemetry missing');
  const power = times.map((_: number, i: number) => feeds.reduce((sum, [, e]) => sum + vdd * e.current[i], 0));
  if (power.some((v: number) => !Number.isFinite(v))) throw Error('Transient supply current missing');
  const mid = vdd / 2;
  const indexAt = (instant: number) => Math.round(instant / dt);
  // Interior full cycle with a falling and a rising edge, after initial DC.
  const edges = [PERIOD * 1.75, PERIOD * 2.25];
  const windows = edges.map((edge) => {
    const start = indexAt(edge - HALF / 4);
    const stop = indexAt(edge + HALF / 4);
    const first = indexAt(edge);
    const finalLogic = Number(values[stop] > mid);
    const initialLogic = Number(values[start] > mid);
    if (finalLogic === initialLogic) throw Error('No sensitized transition at the output probe');
    function crossing(samples: number[], target: number) {
      const k = samples.findIndex((v, i) => i > start && i <= stop && Number(v > mid) === target);
      if (k <= start || !Number.isFinite(samples[k - 1])) throw Error('No measured propagation delay');
      return times[k - 1] + (mid - samples[k - 1]) / (samples[k] - samples[k - 1]) * dt;
    }
    const delayNs = (crossing(values, finalLogic) - crossing(inputs, Number(inputs[stop] > mid))) * 1e9;
    if (!Number.isFinite(delayNs) || delayNs <= 0) throw Error('No positive propagation delay measured');
    let energy = 0;
    const idlePower = power[indexAt(edge + HALF / 2)];
    const last = indexAt(edge + HALF) - 1;
    for (let i = first; i <= last; i++) energy += (power[i] - idlePower) * dt;
    return { delayNs, energy, finalLogic };
  });
  const cycle = windows.reduce((sum, edge) => sum + edge.energy, 0);
  if (!Number.isFinite(cycle) || cycle <= 0) throw Error('No positive switching energy resolved from the transient');
  return { windows, cycle };
}

/** Package the active instructional circuit and test it with a separate stimulus fixture. */
export async function characterizeAcademyIc(components: SandboxComponent[], vdd: number) {
  if (!Number.isFinite(vdd) || vdd <= 0 || vdd > SKY130.VDD_NOMINAL_V) throw Error('Use a positive nominal SKY130 rail for macro extraction');
  const diagram = trialDiagram(components, vdd);
  const extracted = measure(diagram, vdd, 0.2e-12);
  const reference = measure(diagram, vdd, 0.1e-12);
  const pins = [
    { name: 'in', direction: 'input', radix: 'binary', voltageLevelsV: [0, vdd] },
    { name: 'out', direction: 'output', radix: 'binary', voltageLevelsV: [0, vdd] },
  ];
  const a = extracted.windows.map((p) => p.delayNs);
  const b = reference.windows.map((p) => p.delayNs);
  const timingMatches = a.every((delay, i) => Math.abs(delay - b[i]) <= 0.05 * b[i]);
  const powerMatches = Math.abs(extracted.cycle - reference.cycle) <= 0.10 * reference.cycle;
  const stateMatches = extracted.windows.every((edge, i) => edge.finalLogic === reference.windows[i].finalLogic);
  const footprint = REFERENCE.cells.parameters.sky130a_binary_cells.cells.sky130_fd_sc_hd__inv_1;
  const payload = {
    format: 'invention-lab/custom-ic/1', icId: 'academy_macro', pins, radixDomain: 'binary',
    implementation: { kind: 'netlist', components: diagram.blocks, wires: diagram.wires },
    macroModel: {
      timingArcs: [{ from: 'in', to: 'out', delayNs: Math.max(...a), tolerancePct: 5 }],
      transitionDelaysNs: a,
      dynamicPower: { wattsPerToggle: extracted.cycle, tolerancePct: 10 },
      logic: extracted.windows.map((p) => p.finalLogic),
      loadF: FIXTURE_LOAD_F,
      provenance: 'SIMULATED_PHYSICS_MODEL',
    },
    footprint: { kind: 'custom_rect', dimensionsUm: { w: footprint.width_um, h: footprint.height_um } },
    verification: {
      status: timingMatches && powerMatches && stateMatches ? 'VERIFIED_AGAINST_INTERNAL_SOLVE' : 'STALE',
      checkedAt: new Date().toISOString(),
    },
  };
  const contentSeal = await sha256Hex(canonicalJson(payload));
  const fresh = JSON.parse(canonicalJson({ ...payload, contentSeal }));
  const { contentSeal: received, ...loaded } = fresh;
  if (await sha256Hex(canonicalJson(loaded)) !== received) throw Error('Custom IC content seal mismatch');
  // Fresh one-instance test schematic, driven through its two boundary pins.
  const schematic = {
    instance: fresh,
    stimulus: [{ tick: 0, digit: 0 }, { tick: 10_000, digit: 1 }],
    probe: [] as number[],
  };
  const queue = new EventQueue();
  for (const { tick, digit } of schematic.stimulus) {
    const model = schematic.instance.macroModel;
    const arc = model.timingArcs[0];
    if (arc.from !== 'in' || arc.to !== 'out') throw Error('Custom IC pin map mismatch');
    queue.push(tick + Math.round(model.transitionDelaysNs[digit] * 1000), model.logic[digit]);
  }
  for (let sample = queue.pop(); sample; sample = queue.pop()) {
    schematic.probe.push(sample.payload);
  }
  return {
    arcDelayNs: a, internalDelayNs: b, cycleEnergyJ: [extracted.cycle], internalEnergyJ: [reference.cycle],
    sealVerified: true, replayedLogic: schematic.probe, internalLogic: reference.windows.map((p) => p.finalLogic), packagedIc: fresh,
  };
}
