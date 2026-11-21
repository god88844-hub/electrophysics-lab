/**
 * WP-2.5 — Direct 3D schematic editing → kernel-compatible netlist compile.
 *
 * Pure, dependency-free and Node-importable (the WP-2.5 unit tests run it
 * directly under `node --test`, same contract as `sky130Spec.mjs`). The
 * controller (`directEditing.ts`) feeds it the sealed reference constants;
 * nothing here reads files or the DOM.
 *
 * What this module owns (03_PHYSICS_MATH_FUNDAMENTALS.md §1.3 + §5):
 *   1. `wirePinNode`      — the kind-aware junction pin a RouteWire attaches
 *                          to on each placed component.
 *   2. `deriveTraceComponents` — routed Manhattan wires → copper `trace`
 *                          elements carrying live parasitics
 *                          R = ρ(T)·L/(w·t) (copper, 02 JSON) and the
 *                          Pi-model shunt capacitance C = ε₀·ε_r·w·L/d
 *                          (03 §1.3; ε₀ from 01 JSON, ε_r/d from 02 JSON).
 *   3. `buildKernelNetlistMirror` — the compiled netlist as the
 *                          `ep-circuit`-compatible JSON schema
 *                          (`ep-circuit/netlist@1`): `nodeNames` + `elements`
 *                          mirroring `crates/ep-kernel/ep-circuit/src/
 *                          netlist.rs` (`ElementKind::Resistor|VSource|ISource|
 *                          Mosfet`, `Element { kind, label, nodes, r, v, i,
 *                          mosfet }` — node 0 is the ground reference, element
 *                          `nodes` hold node indices, exactly like the kernel).
 *   4. `admissionRequestFor` + `checkAdmission` — the fail-closed
 *                          ≤ 64 nodes / ≤ 32 V-sources admission request in
 *                          the ep-core `AdmissionRequest::Mna` shape with the
 *                          ep-core refusal semantics mirrored verbatim
 *                          (02_SYSTEM_ARCHITECTURE.md §2.3; Law 4: refuse with
 *                          an honest reason, never clamp).
 *
 * Every physical constant arrives via `validateReferenceConstants` from the
 * SHA-256-sealed reference vault — zero invented constants (Law 5). The two
 * declared workbench geometry mappings (bench→scene scale and the rendered
 * trace width) are cited to their owning files below.
 */

/** ep-circuit-compatible netlist JSON schema tag (see netlist.rs element model). */
export const EPCIRCUIT_NETLIST_FORMAT = 'ep-circuit/netlist@1';

/**
 * Declared workbench geometry mappings (not measured constants — they are
 * the schematic scale the v3 Silicon CAD renders at):
 *   - `BENCH_TO_WORLD_X/Z`: bench position → scene transform from
 *     `src/world.ts setSandboxComponents` / `src/App.tsx benchHitOf`
 *     (`world.x = -2 + bench.x·1.4`, `world.z = -1.4 + bench.y·1.2`).
 *   - `TRACE_ROUTE_WIDTH_UM`: the Manhattan trace is rendered by
 *     `src/world.ts addManhattanTrace` as a tube of radius 0.035 scene
 *     units → diameter 0.07 units; per the cad-specs 01 `units` contract
 *     (1 scene unit = 1 µm) the electrical trace width is 0.07 µm.
 *   - Scene units are µm per `data/cad-specs/01_sky130_primitives_geometry.json`
 *     → `units.length = 'um'` (vertical exaggeration ×3 is render-only and
 *     never enters the electrical model).
 */
export const BENCH_TO_WORLD_X = 1.4;
export const BENCH_TO_WORLD_Z = 1.2;
export const TRACE_ROUTE_WIDTH_UM = 0.07;
/** met2 hosts the bench's Manhattan traces (world.ts: `layerY('met2')`). */
export const TRACE_LAYER = 'met2';

/**
 * Fail-closed validation of the sealed reference constants this module needs.
 * `consts` is read by the caller from `data/reference-library/
 * 02_semiconductor_pdk_silicon.json` (copper, SiO₂, met2 stack, field oxide)
 * and `data/reference-library/01_fundamental_constants.json` (ε₀).
 * Missing/malformed fields throw with the exact reason (Law 4 admission).
 */
export function validateReferenceConstants(consts) {
  const need = (cond, what) => {
    if (!cond) throw new Error(`kernelNetlist: reference constants missing — ${what}`);
  };
  need(consts && typeof consts === 'object', 'constants object required');
  const cu = consts.copper ?? {};
  need(typeof cu.resistivity_ohm_m_at_300K === 'number' && cu.resistivity_ohm_m_at_300K > 0,
    'material_properties.copper.resistivity_ohm_m_at_300K (02 JSON)');
  need(typeof cu.tcr_per_k === 'number' && cu.tcr_per_k >= 0,
    'material_properties.copper.tcr_per_k (02 JSON)');
  const sio2 = consts.siliconDioxide ?? {};
  need(typeof sio2.dielectric_constant === 'number' && sio2.dielectric_constant > 0,
    'material_properties.silicon_dioxide.dielectric_constant (02 JSON)');
  const met2 = (consts.metalStack ?? {}).met2 ?? {};
  need(typeof met2.thickness_nm === 'number' && met2.thickness_nm > 0,
    'parameters.sky130a.metal_stack.met2.thickness_nm (02 JSON)');
  const ox = consts.oxideThickness ?? {};
  need(typeof ox.field_oxide === 'number' && ox.field_oxide > 0,
    'parameters.sky130a.oxide_thickness_nm.field_oxide (02 JSON)');
  need(typeof consts.vacuumPermittivity === 'number' && consts.vacuumPermittivity > 0,
    'vacuum_permittivity (01_fundamental_constants.json)');
  return true;
}

/**
 * Live copper trace parasitics for one Manhattan route segment.
 *
 * R = ρ(T)·L/(w·t) with ρ(T) = ρ₀·(1 + α·(T − 300 K)) — the same TCR law the
 * solver applies to the supply rail (`heat.mjs resistanceAtTemp`), evaluated
 * at the LIVE trace temperature sampled from the current solver frame at
 * commit time. C is the Pi-model shunt capacitance split half to each end
 * (03 §1.3): C = ε₀·ε_r·w·L/d over the field-oxide dielectric.
 *
 * @param {{ lengthUm: number, tempK?: number }} route Manhattan length in
 *        scene units (µm) and the live trace temperature in kelvin (300 K
 *        default = the sealed ρ₀ reference temperature).
 * @param {object} consts validated reference constants.
 * @returns {{ rho0UmOhm, rhoT, lengthUm, widthUm, thicknessUm, resistanceOhm,
 *             capacitanceFarads, halfCapacitanceFarads, tempK, tempC }}
 */
export function traceParasitics(route, consts) {
  validateReferenceConstants(consts);
  const lengthUm = route.lengthUm;
  if (!(typeof lengthUm === 'number' && Number.isFinite(lengthUm) && lengthUm > 0)) {
    throw new Error(`kernelNetlist: trace length must be finite > 0 (got ${lengthUm})`);
  }
  const widthUm = TRACE_ROUTE_WIDTH_UM;
  const thicknessUm = consts.metalStack.met2.thickness_nm / 1000; // nm → µm
  const tempK = route.tempK ?? 300;
  if (!(typeof tempK === 'number' && Number.isFinite(tempK) && tempK > 0)) {
    throw new Error(`kernelNetlist: trace temperature must be finite > 0 K (got ${tempK})`);
  }
  const rho0 = consts.copper.resistivity_ohm_m_at_300K;
  const alpha = consts.copper.tcr_per_k;
  const rhoT = rho0 * (1 + alpha * (tempK - 300));
  // R = ρ(T)·L/(w·t) — every length converted to metres exactly once.
  const resistanceOhm =
    (rhoT * (lengthUm * 1e-6)) / (widthUm * 1e-6 * thicknessUm * 1e-6);
  // C = ε₀·ε_r·w·L/d over the field oxide (03 §1.3 Pi model).
  const dielectricUm = consts.oxideThickness.field_oxide / 1000; // nm → µm
  const capacitanceFarads =
    consts.vacuumPermittivity *
    consts.siliconDioxide.dielectric_constant *
    ((widthUm * lengthUm * 1e-12) / (dielectricUm * 1e-6));
  return {
    rho0,
    rhoT,
    lengthUm,
    widthUm,
    thicknessUm,
    resistanceOhm,
    capacitanceFarads,
    halfCapacitanceFarads: capacitanceFarads / 2,
    tempK,
    tempC: tempK - 273.15,
  };
}

/**
 * The junction pin a RouteWire attaches to on a component, by kind. The bench
 * netlist is name-based (every component references global node names), so the
 * pin choice is the terminal a schematic wire meaningfully lands on:
 *   rail/gnd → their single supply/return pin; resistor → its driven terminal
 *   (nodes[0] = 'drain'); nmos/pmos/cells/trace → the output/drain pin
 *   (nodes[1]); anything else falls back to nodes[1] ?? nodes[0].
 */
export function wirePinNode(component) {
  if (!component || !Array.isArray(component.nodes) || component.nodes.length === 0) return null;
  const kind = component.kind;
  const n0 = component.nodes[0];
  const n1 = component.nodes.length > 1 ? component.nodes[1] : null;
  if (kind === 'rail' || kind === 'gnd') return n0;
  if (kind === 'resistor') return n0;
  return n1 ?? n0;
}

/**
 * Derive the compile-time copper `trace` elements for the routed wires.
 *
 * Semantics (documented, honest):
 *   - A wire between two DISTINCT pin node names compiles as a real copper
 *     `trace` component (a resistor carrying R = ρ(T)·L/(w·t)) — the
 *     parasitic is in the solve, exactly the WP-2.5 contract.
 *   - A wire between two pins that ALREADY share a node name is an idealized
 *     connection in the name-based netlist (union-find merges them with zero
 *     impedance); no resistive element can exist between identical node
 *     names, so the wire is passed through as an ideal union and the trace
 *     element is skipped — reported in `idealWires`.
 *   - Wires whose endpoints are missing (deleted/undone components) are
 *     dropped with the reason in `droppedWires` — never silently compiled.
 *   - Duplicate routes are deduplicated (first occurrence wins, stable order).
 *
 * @param {Array<{from: string, to: string}>} wires store wires (component ids).
 * @param {Array<SandboxComponent>} components placed components.
 * @param {object} consts validated reference constants.
 * @param {number} tempK live trace temperature (kelvin) for ρ(T).
 */
export function deriveTraceComponents(wires, components, consts, tempK) {
  validateReferenceConstants(consts);
  const byId = new Map(components.map((c) => [c.id, c]));
  const traceComponents = [];
  const idealWires = [];
  const droppedWires = [];
  const parasitics = [];
  const seen = new Set();
  let n = 0;
  for (const w of wires ?? []) {
    if (!w || typeof w.from !== 'string' || typeof w.to !== 'string') {
      droppedWires.push({ wire: w, reason: 'malformed wire (from/to must be component ids)' });
      continue;
    }
    const key = w.from + '|' + w.to;
    if (seen.has(key)) continue; // duplicate route — first wins (stable order)
    seen.add(key);
    const a = byId.get(w.from);
    const b = byId.get(w.to);
    if (!a || !b) {
      droppedWires.push({ wire: w, reason: !a && !b ? `both endpoints missing (${w.from}, ${w.to})` : `endpoint missing (${!a ? w.from : w.to})` });
      continue;
    }
    const pinA = wirePinNode(a);
    const pinB = wirePinNode(b);
    if (!pinA || !pinB) {
      droppedWires.push({ wire: w, reason: 'endpoint component has no junction pin' });
      continue;
    }
    if (pinA === pinB) {
      idealWires.push({ from: w.from, to: w.to, pinA, pinB });
      continue;
    }
    // Manhattan route length between the two placed components, in scene
    // units (µm): bench Δ → world Δ via the declared schematic transform.
    const dx = Math.abs((a.position?.[0] ?? 0) - (b.position?.[0] ?? 0)) * BENCH_TO_WORLD_X;
    const dz = Math.abs((a.position?.[1] ?? 0) - (b.position?.[1] ?? 0)) * BENCH_TO_WORLD_Z;
    const lengthUm = dx + dz;
    if (!(lengthUm > 0)) {
      droppedWires.push({ wire: w, reason: 'zero-length route (overlapping placements)' });
      continue;
    }
    const par = traceParasitics({ lengthUm, tempK }, consts);
    const id = `trace_${w.from}_${w.to}_${n++}`;
    // The compiler clamps trace width to ≥ 0.2 µm (sandbox.mjs
    // `traceResistance` guard), so `sheetR` is normalized against that floor:
    // with widthEffective = max(0.2, widthUm), sheetR = R(T)·widthEffective/L
    // reproduces R(T) = ρ(T)·L/(w·t) EXACTLY through the compiler's
    // R = sheetR·L/W (verified by the WP-2.5 unit tests). The true electrical
    // geometry (rendered width, met2 thickness) stays in `widthUm`/`thicknessUm`
    // and in the parasitics record.
    const widthEffectiveUm = Math.max(0.2, par.widthUm);
    traceComponents.push({
      id,
      kind: 'trace',
      params: {
        lengthUm,
        widthUm: par.widthUm,
        widthEffectiveUm,
        thicknessUm: par.thicknessUm,
        sheetR: (par.resistanceOhm * widthEffectiveUm) / par.lengthUm,
        resistanceOhm: par.resistanceOhm,
        capacitanceFarads: par.capacitanceFarads,
        tempK: par.tempK,
      },
      nodes: [pinA, pinB],
      position: [
        ((a.position?.[0] ?? 0) + (b.position?.[0] ?? 0)) / 2,
        ((a.position?.[1] ?? 0) + (b.position?.[1] ?? 0)) / 2,
      ],
    });
    parasitics.push({ wire: { from: w.from, to: w.to }, traceId: id, pinA, pinB, ...par });
  }
  return { traceComponents, idealWires, droppedWires, parasitics };
}

/**
 * Mirror a compiled netlist (the `compileSandbox` output) into the
 * `ep-circuit`-compatible JSON schema. Field mapping — exactly
 * `crates/ep-kernel/ep-circuit/src/netlist.rs`:
 *   `Netlist { node_names, node_index, elements }` with
 *   `Element { kind: R|V|I|Q, label, nodes: [usize;3], r, v, i, mosfet }`
 *   (R/I use nodes[0..2] = [a,b]; V uses its branch [a,b]; Q uses [g,d,s];
 *   node index 0 is the ground reference). `mosfet` mirrors
 *   `MosfetParams { mos_type, vth, kp, lambda }`.
 *
 * @param {{ netlist: { nodeNames: string[], elements: Array<object> }, nodeNames: string[] }} compiled
 */
export function buildKernelNetlistMirror(compiled) {
  const netlist = compiled?.netlist;
  if (!netlist || !Array.isArray(netlist.nodeNames) || !Array.isArray(netlist.elements)) {
    throw new Error('kernelNetlist: buildKernelNetlistMirror requires a compiled netlist');
  }
  const nodeNames = netlist.nodeNames.slice();
  const elements = netlist.elements.map((el) => {
    const base = { kind: el.kind, label: el.label ?? null };
    if (el.kind === 'R') return { ...base, nodes: [el.a, el.b, -1], r: el.R };
    if (el.kind === 'V') return { ...base, nodes: [el.a, el.b, -1], v: el.V };
    if (el.kind === 'I') return { ...base, nodes: [el.a, el.b, -1], i: el.I };
    if (el.kind === 'Q') {
      return {
        ...base,
        nodes: [el.g, el.d, el.s],
        mosfet: { type: el.type, vth: el.vth, kp: el.kp, lambda: el.lambda },
      };
    }
    throw new Error(`kernelNetlist: unknown element kind '${el.kind}' (kernel mirror is R|V|I|Q)`);
  });
  return { format: EPCIRCUIT_NETLIST_FORMAT, nodeNames, elements };
}

/**
 * The ep-core `AdmissionRequest::Mna` measure of a compiled netlist mirror
 * (`{ domain: 'mna', nodes, voltageSources }` — 02 §2.3 budgets).
 */
export function admissionRequestFor(mirror) {
  if (!mirror || !Array.isArray(mirror.nodeNames) || !Array.isArray(mirror.elements)) {
    throw new Error('kernelNetlist: admissionRequestFor requires an ep-circuit netlist mirror');
  }
  const voltageSources = mirror.elements.filter((e) => e.kind === 'V').length;
  return { domain: 'mna', nodes: mirror.nodeNames.length, voltageSources };
}

/**
 * Pure mirror of the ep-core fail-closed admission decision for the MNA
 * domain (`crates/ep-kernel/ep-core/src/admission.rs`): `MNA_MAX_NODES = 64`,
 * `MNA_MAX_VOLTAGE_SOURCES = 32`, refusal reasons in the same wording so the
 * UI surfaces one honest contract whether the kernel or this mirror answers.
 * The runtime path always ALSO routes through `admissionSurface.admitAndSurface`
 * (the banner bus); this pure check exists for unit tests and for deciding
 * the compile before any worker message is posted.
 */
export function checkAdmission(request, budgets = { mnaMaxNodes: 64, mnaMaxVoltageSources: 32 }) {
  const nodes = request?.nodes;
  const vsrc = request?.voltageSources ?? 0;
  const refuse = (requested, limit, what) => ({
    admitted: false,
    reason: `admission refused: MNA workload requests ${requested} ${what}, budget is ≤ ${limit} per frame — docs/master-plan/02_SYSTEM_ARCHITECTURE.md §2.3 (interactive budgets)`,
    domain: 'mna',
    requested,
    limit,
  });
  if (typeof nodes !== 'number' || !Number.isFinite(nodes) || nodes < 0) {
    return { admitted: false, reason: 'admission refused: non-finite node count', domain: 'mna', requested: nodes, limit: budgets.mnaMaxNodes };
  }
  if (nodes > budgets.mnaMaxNodes) return refuse(nodes, budgets.mnaMaxNodes, 'nodes');
  if (typeof vsrc !== 'number' || !Number.isFinite(vsrc) || vsrc < 0) {
    return { admitted: false, reason: 'admission refused: non-finite voltage-source count', domain: 'mna', requested: vsrc, limit: budgets.mnaMaxVoltageSources };
  }
  if (vsrc > budgets.mnaMaxVoltageSources) return refuse(vsrc, budgets.mnaMaxVoltageSources, 'voltage sources');
  return { admitted: true, request };
}
