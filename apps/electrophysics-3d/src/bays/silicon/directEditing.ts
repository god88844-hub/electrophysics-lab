/**
 * WP-2.5 — Direct 3D editing controller for the Silicon CAD bench.
 *
 * Owns the edit → compile pipeline that the direct Place (C) / Manhattan
 * Route Wire (W) / 3D Probe (P) flow feeds:
 *
 *   1. **Kernel-compatible compile on every edit (incl. undo/redo).** A store
 *      subscription diffs `sandboxComponents` / `wires` / `vddSlider` and
 *      recompiles the *whole* bench — placed components, routed wires
 *      translated to pin-node copper traces, and the ρ(T)·L/(w·t) parasitics —
 *      through `kernelNetlist.mjs` + `compileSandbox`, then pushes the spec to
 *      the solver. Because it watches the store (not the click handlers),
 *      every mutation path compiles: palette edits, 3D clicks, AND WP-1.4
 *      undo/redo (which previously left the solver stale).
 *   2. **Fail-closed admission at the edit level.** The compiled netlist
 *      mirror is measured in the ep-core `AdmissionRequest::Mna` shape and
 *      checked against the ≤ 64 nodes / ≤ 32 V-sources budgets *before* any
 *      solver message; refusals surface on the WP-1.6 admission banner bus
 *      (`admitAndSurface`) + toast, and the last ADMITTED netlist stays live
 *      — honest refusal, never a clamp (Law 4).
 *   3. **WP-1.4 history hookup.** The direct wire route already pushes
 *      `RouteWire` commands (App.tsx, untouched here) and component edits are
 *      recorded as `PlaceComponent` / `DeleteComponent` by the store
 *      subscription recorder. What was broken is *undo-time* wire state: the
 *      shared `window.__lab.historyCtx` had a no-op `setWires`, so Ctrl+Z on a
 *      routed wire removed the mesh but left the wire in the store (and in
 *      the solve). This controller installs an enhanced ctx — same surface,
 *      but `setWires` commits to the store — so `RouteWire` revert/apply is
 *      real, and re-syncs trace meshes from the store (the authoritative
 *      registry) after every mutation.
 *   4. **Probe pins read kernel frames per node.** Each `P` probe gets a 3D
 *      pin mesh on the bench (bay2 `syncProbePins`) and a frame-sample record
 *      read through the solver-frame envelope (`frameStore.readNode`) for its
 *      resolved node — the same typed-array contract as the dock, per node.
 *
 * All physical constants come from the SHA-256-sealed reference vault
 * (`@reflib/*` — copper ρ₀/TCR, SiO₂ ε_r, met2 thickness, field oxide, ε₀);
 * the pure math lives in `kernelNetlist.mjs`. No new floating labels, no
 * per-frame allocations (compiles are event-driven; the probe sampler is a
 * fixed 100 ms interval over a small map).
 */
import { flashToast, store, type LabState, type SandboxComponent } from '../../state/store.js';
import { physicsClient, type PhysicsSnapshot } from '../../physics/physicsClient.js';
import { frameStore } from '../../engine/solverFrame.mjs';
import { admitAndSurface } from '../../ui/cad/admissionSurface.mjs';
import semiJson from '@reflib/02_semiconductor_pdk_silicon.json';
import constantsJson from '@reflib/01_fundamental_constants.json';
import { compileSandbox } from '@physics/index.mjs';
import {
  admissionRequestFor,
  buildKernelNetlistMirror,
  checkAdmission,
  deriveTraceComponents,
  wirePinNode,
} from './kernelNetlist.mjs';

/** Minimal world surface the controller needs (satisfied by src/world.ts). */
interface WorldSurface {
  bay2: {
    group: {
      getObjectByName(name: string): { children: Array<{ name: string }> } | undefined;
    };
    syncProbePins(pins: Array<{ id: number; color: string; x: number; z: number }>): void;
  };
  addManhattanTrace(fromId: string, toId: string): void;
}

/** Parasitics of one routed wire in the last admitted compile. */
export interface RouteParasitics {
  wire: { from: string; to: string };
  traceId: string;
  pinA: string;
  pinB: string;
  lengthUm: number;
  widthUm: number;
  thicknessUm: number;
  resistanceOhm: number;
  capacitanceFarads: number;
  tempK: number;
}

export interface ProbeFrameSample {
  node: string;
  value: number;
  frameId: number;
  badge: string;
  frameRead: boolean;
  t: number;
}

interface LabWindow {
  __lab: {
    store: typeof store;
    worldRef: { current: WorldSurface | null };
    historyCtx?: Record<string, unknown>;
    [key: string]: unknown;
  };
  __probeNodes?: Map<number, string>;
  __probeSamples?: Map<number, Array<{ t: number; value: number }>>;
  __probeFrameSamples?: Map<number, ProbeFrameSample>;
}

const labWindow = (): LabWindow => window as unknown as LabWindow;

/** Sealed vault constants for `kernelNetlist.mjs` (fail-closed validated). */
const REFERENCE_CONSTANTS = {
  copper: semiJson.material_properties.copper,
  siliconDioxide: semiJson.material_properties.silicon_dioxide,
  metalStack: semiJson.parameters.sky130a.metal_stack,
  oxideThickness: semiJson.parameters.sky130a.oxide_thickness_nm,
  // 01_fundamental_constants.json → parameters.vacuum_permittivity.value.
  vacuumPermittivity: (
    constantsJson as { parameters?: { vacuum_permittivity?: { value?: number } } }
  ).parameters?.vacuum_permittivity?.value,
};

export interface SiliconEditController {
  /** Admitted compiles pushed to the solver (monotonic). */
  readonly compileCount: number;
  /** Honest refusals (admission caps, compile errors). */
  readonly refusalCount: number;
  readonly lastSpec: Record<string, unknown> | null;
  readonly lastMirror: Record<string, unknown> | null;
  readonly lastAdmission: { admitted: boolean; reason?: string } | null;
  readonly lastRefusal: { reason: string } | null;
  /** Copper parasitics of the routed wires in the last admitted compile. */
  readonly parasitics: readonly RouteParasitics[];
  readonly droppedWires: ReadonlyArray<{ wire: { from: string; to: string }; reason: string }>;
  /** Latest per-probe kernel-frame reads (pid → sample). */
  readonly probeFrames: ReadonlyMap<number, ProbeFrameSample>;
  /** Number of live 3D probe pin meshes. */
  readonly pinCount: number;
  /** Force a compile pass now (e2e determinism helper). */
  compileNow(): void;
  dispose(): void;
}

interface ControllerMutable {
  compileCount: number;
  refusalCount: number;
  lastSpec: Record<string, unknown> | null;
  lastMirror: Record<string, unknown> | null;
  lastAdmission: { admitted: boolean; reason?: string } | null;
  lastRefusal: { reason: string } | null;
  parasitics: RouteParasitics[];
  droppedWires: Array<{ wire: { from: string; to: string }; reason: string }>;
  probeFrames: Map<number, ProbeFrameSample>;
  pinCount: number;
}

let ctl: ControllerMutable | null = null;
let unsubscribeFns: Array<() => void> = [];
let compileScheduled = false;
let origSetNetlist: ((spec: Record<string, unknown>) => void) | null = null;
let controllerPosting = false;
let prevComponentsRef: Array<SandboxComponent> | null = null;
let prevWiresRef: Array<{ from: string; to: string }> | null = null;
let prevVdd: number | null = null;
let prevDroppedKeys = '';
let originalHistoryCtx: Record<string, unknown> | null = null;

function worldOf(): WorldSurface | null {
  return labWindow().__lab.worldRef.current ?? null;
}

// Stable empty reference — `wiresOf()` must return the SAME array when the
// store has no wires, or every unrelated store.set (100 ms physics snapshots)
// would look like a wire change and schedule a compile.
const EMPTY_WIRES: Array<{ from: string; to: string }> = [];

function wiresOf(): Array<{ from: string; to: string }> {
  return (store.get() as LabState & { wires?: Array<{ from: string; to: string }> }).wires ?? EMPTY_WIRES;
}

function traceMeshName(w: { from: string; to: string }): string {
  return `trace-${w.from}-${w.to}`;
}

/** Re-sync Manhattan trace meshes with the authoritative store wire list.
 * Deduplicates repeated mesh names (the app's own restore path re-adds after
 * every component rebuild) and removes meshes for wires that are gone or
 * dangling. Runs deferred (after the app's own restore macrotask) so it sees
 * the post-restore group and cleans it to exactly the store wires. */
function syncTraceMeshes(world: WorldSurface): void {
  const group = world.bay2.group.getObjectByName('sandbox-group');
  if (!group) return;
  const comps = store.get().sandboxComponents;
  const wires = wiresOf().filter(
    (w) => comps.some((c) => c.id === w.from) && comps.some((c) => c.id === w.to),
  );
  const wanted = new Set(wires.map(traceMeshName));
  const seen = new Set<string>();
  for (const child of [...group.children]) {
    if (!child.name.startsWith('trace-')) continue;
    const keep = wanted.has(child.name) && !seen.has(child.name);
    if (keep) {
      seen.add(child.name);
    } else {
      group.children.splice(group.children.indexOf(child as never), 1);
    }
  }
  for (const w of wires) {
    if (!seen.has(traceMeshName(w))) {
      world.addManhattanTrace(w.from, w.to);
    }
  }
}

/** Rebuild the 3D probe pins from the store (probe id → probed component). */
function syncProbePins(world: WorldSurface): void {
  const s = store.get();
  const pins = s.probes
    .map((p) => {
      const comp = s.sandboxComponents.find((c) => c.id === p.targetId);
      return comp ? { id: p.id, color: p.color, x: comp.position[0], z: comp.position[1] } : null;
    })
    .filter((p): p is { id: number; color: string; x: number; z: number } => p !== null);
  world.bay2.syncProbePins(pins);
  if (ctl) ctl.pinCount = pins.length;
}

/**
 * One compile pass: derive copper traces → compile → mirror → admit → push.
 * Deferred a macrotask by `schedulePass` so any synchronous `setNetlist`
 * posted by the interaction handlers lands first — the controller's full spec
 * (components + routed traces + rails) is always the last, authoritative one
 * the worker applies.
 */
function runCompile(): void {
  compileScheduled = false;
  if (!ctl) return;
  const s = store.get();
  const wires = wiresOf();
  // An EMPTY bench keeps the built-in electro-thermal bench solve alive —
  // the sandbox netlist only takes over once the user places the first
  // component (the pre-WP-2.5 contract: the forensic bench, breakdown flow
  // and dock waveforms all run on the built-in circuit until a real edit
  // exists). Nothing is posted for an empty bench — never a silent clobber.
  if (s.sandboxComponents.length === 0 && wires.length === 0) {
    return;
  }
  const tempK = frameStore.thermal.traceC + 273.15;
  try {
    const derived = deriveTraceComponents(wires, s.sandboxComponents, REFERENCE_CONSTANTS, tempK);
    const spec = {
      components: [...s.sandboxComponents, ...derived.traceComponents],
      wires: derived.idealWires.map((w) => ({ from: w.pinA, to: w.pinB })),
      rails: { vdd: s.vddSlider },
    };
    // Compile-check (throws on invalid kinds/nodes — honest error, the last
    // admitted netlist stays live). Static import: the physics chunk loads at
    // boot, so this post is synchronous and ALWAYS lands after the
    // interaction handlers' own (now-instantly-resolved dynamic) setNetlist —
    // deterministic ordering.
    const compiled = compileSandbox(spec as never);
    const mirror = buildKernelNetlistMirror(compiled as never);
    const request = admissionRequestFor(mirror as never);
    // Fail-closed admission (≤ 64 nodes / ≤ 32 V-sources) BEFORE any solver
    // message; the banner bus is the UI surface (WP-1.6, untouched file).
    const outcome = admitAndSurface(request);
    const pure = checkAdmission(request);
    if (!outcome.admitted || !pure.admitted) {
      const reason = (!outcome.admitted && 'reason' in outcome ? outcome.reason : null)
        ?? (!pure.admitted ? pure.reason : null)
        ?? 'admission refused';
      ctl.refusalCount += 1;
      ctl.lastRefusal = { reason };
      ctl.lastAdmission = { admitted: false, reason };
      flashToast(`Edit refused — ${reason}`);
      return;
    }
    ctl.compileCount += 1;
    ctl.lastSpec = spec as unknown as Record<string, unknown>;
    ctl.lastMirror = mirror as unknown as Record<string, unknown>;
    ctl.lastAdmission = { admitted: true };
    ctl.parasitics = derived.parasitics;
    ctl.droppedWires = derived.droppedWires;
    const droppedKeys = derived.droppedWires
      .map((d) => `${d.wire.from}|${d.wire.to}: ${d.reason}`)
      .join('; ');
    if (droppedKeys && droppedKeys !== prevDroppedKeys) {
      flashToast(`Trace compile note — dropped wires: ${droppedKeys}`);
      prevDroppedKeys = droppedKeys;
    }
    controllerPosting = true;
    origSetNetlist!(spec as unknown as Record<string, unknown>);
    controllerPosting = false;
  } catch (err) {
    ctl.refusalCount += 1;
    ctl.lastRefusal = { reason: err instanceof Error ? err.message : String(err) };
    flashToast(`Netlist compile failed — ${ctl.lastRefusal.reason} (previous netlist kept)`);
  }
}

/** One coalesced deferred pass: mesh re-sync (after the app's own restore
 * macrotask — both are setTimeout(0), the app's was registered first) then
 * the compile. Event-driven; never per frame. */
function schedulePass(): void {
  if (compileScheduled) return;
  compileScheduled = true;
  setTimeout(() => {
    compileScheduled = false;
    const world = worldOf();
    if (world) syncTraceMeshes(world);
    runCompile();
  }, 0);
}

/** Per-probe kernel-frame reads (solver-frame envelope, per node). */
function sampleProbeFrames(): void {
  if (!ctl) return;
  const frameSamples = labWindow().__probeFrameSamples;
  if (!frameSamples) return;
  const probes = store.get().probes;
  const probeNodes = labWindow().__probeNodes;
  const live = probes.map((p) => p.id);
  for (const pid of [...frameSamples.keys()]) {
    if (!live.includes(pid)) {
      frameSamples.delete(pid);
      ctl.probeFrames.delete(pid);
    }
  }
  const snap: PhysicsSnapshot | null = physicsClient.latest;
  for (const p of probes) {
    // The probe reads the component's junction pin — the same kind-aware pin
    // map the router uses (the legacy probeNodes map carried nodes[1], which
    // for resistors is the ground pin, not the junction).
    const comp = store.get().sandboxComponents.find((c) => c.id === p.targetId);
    const node = (comp ? wirePinNode(comp) : null) ?? probeNodes?.get(p.id) ?? null;
    if (!node) continue;
    // Kernel frame first (solver-frame envelope per node); the raw snapshot
    // is the documented fallback while the topology has not been learned.
    const frameValue = frameStore.readNode(node);
    const frameRead = frameValue !== undefined && frameValue !== null;
    const value = frameRead ? (frameValue as number) : (snap?.nodes?.[node] ?? 0);
    const record: ProbeFrameSample = {
      node,
      value,
      frameId: frameStore.frameId,
      badge: frameStore.provenance.badge,
      frameRead,
      t: frameStore.tSimS,
    };
    frameSamples.set(p.id, record);
    ctl.probeFrames.set(p.id, record);
  }
}

/**
 * Attach the WP-2.5 editing controller to the silicon bay. Idempotent —
 * later calls return the same controller. Called lazily from
 * `Bay2Foundry.update` once the world is registered on `window.__lab`.
 */
export function attachDirectEditing(_bay2: unknown): SiliconEditController {
  if (ctl) return controllerApi;
  const mutable: ControllerMutable = {
    compileCount: 0,
    refusalCount: 0,
    lastSpec: null,
    lastMirror: null,
    lastAdmission: null,
    lastRefusal: null,
    parasitics: [],
    droppedWires: [],
    probeFrames: new Map<number, ProbeFrameSample>(),
    pinCount: 0,
  };
  ctl = mutable;

  // Reconciliation on the shared physics client: foreign setNetlist callers
  // (the interaction handlers' and palette's dynamic-import specs) can land
  // AFTER the controller's authoritative compile — their import resolves on
  // its own schedule, so post order is not deterministic without this. Any
  // foreign post is immediately followed by a re-post of the controller's
  // last admitted spec (routed copper parasitics stay in the solve); the next
  // scheduled compile for the new store state is always the final authority.
  origSetNetlist = physicsClient.setNetlist.bind(physicsClient);
  physicsClient.setNetlist = (spec: Record<string, unknown>): void => {
    origSetNetlist!(spec);
    if (!controllerPosting && ctl?.lastSpec) {
      origSetNetlist!(ctl.lastSpec);
    }
  };

  // Enhanced WP-1.4 ctx — identical surface, but `setWires` commits to the
  // store so RouteWire undo/redo reverts the routed wire for real (the default
  // shared ctx was mesh-only). Push-time commands keep working unchanged.
  originalHistoryCtx = labWindow().__lab.historyCtx ?? null;
  if (originalHistoryCtx) {
    labWindow().__lab.historyCtx = {
      ...originalHistoryCtx,
      setWires: (wires: Array<{ from: string; to: string }>) => {
        store.set({ wires } as unknown as Partial<LabState>);
      },
    };
  }

  prevComponentsRef = store.get().sandboxComponents;
  prevWiresRef = wiresOf();
  prevVdd = store.get().vddSlider;
  unsubscribeFns.push(
    store.subscribe(() => {
      const s = store.get();
      const wires = wiresOf();
      const world = worldOf();
      if (world) syncProbePins(world);
      const compsChanged = s.sandboxComponents !== prevComponentsRef;
      const wiresChanged = wires !== prevWiresRef;
      const vddChanged = s.vddSlider !== prevVdd;
      if (compsChanged || wiresChanged || vddChanged) {
        prevComponentsRef = s.sandboxComponents;
        prevWiresRef = wires;
        prevVdd = s.vddSlider;
        schedulePass();
      }
    }),
  );

  // Escape cancels a pending wire route (no conflict with WP-1.4's chords).
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && store.get().pendingWireFrom) {
      store.set({ pendingWireFrom: null });
      flashToast('Wire route cancelled');
    }
  };
  window.addEventListener('keydown', onKey);
  unsubscribeFns.push(() => window.removeEventListener('keydown', onKey));

  // Per-probe kernel-frame reads (fixed 100 ms cadence, small map).
  labWindow().__probeFrameSamples = new Map<number, ProbeFrameSample>();
  const sampler = setInterval(sampleProbeFrames, 100);
  unsubscribeFns.push(() => clearInterval(sampler));

  // Initial compile for any pre-attached bench state.
  schedulePass();
  // E2E/telemetry surface (window.__lab contract, like history/frame/admission).
  labWindow().__lab.siliconEdit = controllerApi;
  return controllerApi;
}

/** Detach everything (restore the original history ctx + client). */
export function detachDirectEditing(): void {
  for (const fn of unsubscribeFns) fn();
  unsubscribeFns = [];
  if (originalHistoryCtx) {
    labWindow().__lab.historyCtx = originalHistoryCtx;
    originalHistoryCtx = null;
  }
  if (origSetNetlist) {
    physicsClient.setNetlist = origSetNetlist;
    origSetNetlist = null;
  }
  compileScheduled = false;
  ctl = null;
}

const controllerApi: SiliconEditController = {
  get compileCount() { return ctl?.compileCount ?? 0; },
  get refusalCount() { return ctl?.refusalCount ?? 0; },
  get lastSpec() { return ctl?.lastSpec ?? null; },
  get lastMirror() { return ctl?.lastMirror ?? null; },
  get lastAdmission() { return ctl?.lastAdmission ?? null; },
  get lastRefusal() { return ctl?.lastRefusal ?? null; },
  get parasitics() { return ctl?.parasitics ?? []; },
  get droppedWires() { return ctl?.droppedWires ?? []; },
  get probeFrames() { return ctl?.probeFrames ?? new Map<number, ProbeFrameSample>(); },
  get pinCount() { return ctl?.pinCount ?? 0; },
  compileNow() { schedulePass(); },
  dispose() { detachDirectEditing(); },
};
