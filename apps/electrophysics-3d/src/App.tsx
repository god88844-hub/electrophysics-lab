import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { createRenderer, createQualityGovernor, type RendererBundle } from './engine/renderer.js';
import { CameraRig } from './engine/cameraRig.js';
import { LabWorld, WORKSPACES, type WorkspaceId } from './world.js';
import { worldRef } from './worldRef.js';
import { store, flashToast, type LabState } from './state/store.js';
import {
  buildEplabProject,
  validateEplabProject,
  snapshotFromState,
  wiresFromSandboxGroup,
  downloadProjectFile,
  readProjectFileViaInput,
  saveProjectViaDesktop,
  openProjectViaDesktop,
  saveAutosave,
  restoreAutosave,
  clearAutosave,
  defaultProjectName,
} from './state/project.js';
import { desktopBridge } from './desktop/index.js';
import { verifyReferenceIntegrity, REFERENCE } from './data/reference.js';
import { physicsClient, type PhysicsSnapshot, type ForensicReport, type ProposedFix, type FaultFx } from './physics/physicsClient.js';
import { quantumClient, type BlochState, type BreakthroughBundle } from './physics/quantumClient.js';
import { LibraryOverlay } from './ui/LibraryOverlay.js';
import { historyManager, makePlaceComponent, makeRouteWire, makeSetParam, committedHeadSnapshot } from './state/history.js';
import { InspectorPanels } from './ui/InspectorPanels.js';
import { BottomDock } from './ui/cad/BottomDock.js';
import { ViewCube } from './ui/cad/ViewCube.js';
import { AdmissionBanner } from './ui/cad/AdmissionBanner.js';
import { admitAndSurface, ADMISSION_BUDGETS, admissionSurfaceApi } from './ui/cad/admissionSurface.mjs';
import { createTelemetryHistory, sampleFrameStore, TELEMETRY_SAMPLE_MS } from './ui/cad/telemetryScope.mjs';
import { logicSurfaceApi } from './ui/cad/logicStream.mjs';

function useLabState() {
  return useSyncExternalStore(
    (fn) => store.subscribe(fn),
    () => store.get()
  );
}

const TOOLBAR_H = 40;
const STATUS_H = 24;

/**
 * WP-1.6 — instrument-dock mount hook: starts the zero-allocation
 * solver-frame telemetry sampler, routes real over-budget workloads to the
 * admission-refusal surface (frame boundary + quantum stream), and exposes
 * the typed WP-1.6 surfaces on `window.__lab` for the e2e suite (same
 * pattern as `window.__lab.physicsClient`).
 */
function useWP16Instruments(): void {
  useEffect(() => {
    const telemetry = createTelemetryHistory();
    const sampler = setInterval(() => sampleFrameStore(telemetry), TELEMETRY_SAMPLE_MS);
    // Frame-boundary admission checks: a snapshot whose node/voltage-source
    // tables exceed the §2.3 interactive budgets is being refused at the
    // frame boundary — surface it honestly (never silently dropped).
    const unsubSnap = physicsClient.onSnapshot((s) => {
      const nodes = Object.keys(s.nodes ?? {}).length;
      if (nodes > ADMISSION_BUDGETS.mnaMaxNodes) {
        admitAndSurface({ domain: 'mna', nodes });
      }
    });
    const unsubQuantum = quantumClient.onState(({ bloch }) => {
      if (Array.isArray(bloch) && bloch.length > ADMISSION_BUDGETS.quantumMaxQubits) {
        admitAndSurface({ domain: 'quantum', qubits: bloch.length });
      }
    });
    const lab = (window as unknown as { __lab?: Record<string, unknown> }).__lab;
    if (lab) {
      lab.telemetry = telemetry;
      lab.admission = admissionSurfaceApi;
      lab.logic = logicSurfaceApi;
    }
    return () => {
      clearInterval(sampler);
      unsubSnap();
      unsubQuantum();
    };
  }, []);
}

export function App() {
  useWP16Instruments();
  const mountRef = useRef<HTMLDivElement>(null);
  const bundleRef = useRef<{ renderer: RendererBundle; rig: CameraRig; world: LabWorld } | null>(null);
  const state = useLabState();
  const pointerNdc = useRef({ x: -2, y: -2, clientX: 0, clientY: 0 });
  const suppressHistoryRef = useRef(false);

  // ---- WP-1.3 — .eplab project persistence (Save / Open / Auto-save) ----
  // Reference-library snapshot every seal is bound to (MANIFEST generatedAt).
  const libraryLockedAt = REFERENCE.manifest.generatedAt;
  // Committed-state snapshot only (transient tool state is never serialized).
  const persistSnapshot = () =>
    snapshotFromState(store.get(), wiresFromSandboxGroup(worldRef.current?.bay2.group ?? null));
  const applyLoadedProject = (loaded: { state: Record<string, unknown>; wires: Array<{ from: string; to: string }>; name: string; payloadSHA256: string }) => {
    store.set(loaded.state as Partial<LabState>);
    // Traces are mesh-only (not in the store) — re-add after the sandbox
    // components have re-rendered (setTimeout lands after React effects).
    setTimeout(() => {
      for (const w of loaded.wires) worldRef.current?.addManhattanTrace(w.from, w.to);
    }, 0);
    // Durable persistence marker (the toast is transient, 2.6 s).
    const lab = window.__lab as unknown as Record<string, unknown>;
    if (lab) lab.projectLastOpen = { name: loaded.name, sha: loaded.payloadSHA256.slice(0, 8), wires: loaded.wires.length, at: new Date().toISOString() };
    flashToast(`Opened ${loaded.name} — SHA-256 seal verified (${loaded.payloadSHA256.slice(0, 8)}…), ${loaded.wires.length} traces restored`);
  };
  const saveProjectAction = async () => {
    try {
      const filename = defaultProjectName();
      const sealed = await buildEplabProject(persistSnapshot(), { name: filename, referenceLibraryLockedAt: libraryLockedAt });
      let status: string | null = null;
      if (desktopBridge.isDesktop()) {
        const res = await saveProjectViaDesktop(sealed, desktopBridge, filename);
        if (res.ok) status = `Saved ${res.path} — seal ${sealed.payloadSHA256.slice(0, 8)}…`;
        else if (res.reason === 'cancelled') {
          flashToast('Save cancelled');
          return;
        } else {
          // Native dialog/acceptance problem — surface it, fall back to web.
          flashToast('Native save unavailable (' + res.reason + ') — using browser download');
        }
      }
      if (!status) {
        const dl = downloadProjectFile(sealed, filename);
        status = dl.ok
          ? `Saved ${filename} — seal ${sealed.payloadSHA256.slice(0, 8)}… (browser download)`
          : 'Save failed: ' + dl.reason;
      }
      flashToast(status);
    } catch (err) {
      flashToast('Save failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  const openProjectAction = async () => {
    let picked: { name: string; text: string } | null = null;
    if (desktopBridge.isDesktop()) {
      const res = await openProjectViaDesktop(desktopBridge);
      if (res.ok) picked = { name: res.name, text: res.text };
      else if (res.reason === 'cancelled') {
        flashToast('Open cancelled');
        return;
      } else {
        flashToast('Native open unavailable (' + res.reason + ') — using the browser file picker');
      }
    }
    if (!picked) picked = (await readProjectFileViaInput()) as { name: string; text: string } | null;
    if (!picked) {
      flashToast('Open cancelled');
      return;
    }
    try {
      const loaded = await validateEplabProject(JSON.parse(picked.text), { referenceLibraryLockedAt: libraryLockedAt });
      applyLoadedProject(loaded);
    } catch (err) {
      // Fail-closed: corrupt/tampered file — store untouched, reason shown.
      // Validation messages already carry the precise "Open refused:" reason.
      flashToast(err instanceof Error ? err.message : String(err));
    }
  };
  // -----------------------------------------------------------------------

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const renderer = createRenderer(container);
    const world = new LabWorld(renderer.scene);
    const rig = new CameraRig(renderer, renderer.renderer.domElement);
    bundleRef.current = { renderer, rig, world };
    worldRef.current = world;
    if (typeof window !== 'undefined' && window.__lab) {
      window.__lab.worldRef.current = world;
      window.__lab.physicsClient = physicsClient;
      // WP-1.4 — history manager + mutation surface for the command pattern.
      window.__lab.history = historyManager;
      window.__lab.historyCtx = {
        workspace: () => store.get().workspace,
        getComponents: () => store.get().sandboxComponents,
        setComponents: (components: Array<Record<string, unknown>>) => {
          store.set({ sandboxComponents: components as unknown as LabState['sandboxComponents'] });
          world.setSandboxComponents(components as Array<{ id: string; kind: string; position: [number, number] }>);
        },
        getWires: () => store.get().wires ?? [],
        setWires: () => {
          /* wires are mesh-tracked: cadTraces registry + snapshotFromState reads the group */
        },
        addTraceMesh: (fromId: string, toId: string) => world.addManhattanTrace(fromId, toId),
        removeTraceMesh: (fromId: string, toId: string) => {
          const group = world.bay2.group.getObjectByName('sandbox-group');
          if (!group) return;
          const prefix = 'trace-' + fromId + '-' + toId;
          for (const child of [...group.children]) {
            if (child.name.startsWith(prefix)) group.remove(child);
          }
        },
        addTraceMeshDual: (f: string, t: string) => {
          world.addManhattanTrace(f, t);
          cadTraces.push({ from: f, to: t });
        },
        setParam: (key: string, value: unknown) => {
          store.set({ [key]: value } as unknown as Partial<LabState>);
          if (key === 'vddSlider') physicsClient.setParams({ vdd: value as number });
        },
        snapshot: () => snapshotFromState(store.get(), wiresFromSandboxGroup(worldRef.current?.bay2.group ?? null)),
      };
      window.__lab.projectToScreen = (obj: THREE.Object3D) => {
        const cam = renderer.activeCamera;
        const v = new THREE.Vector3();
        obj.getWorldPosition(v);
        v.project(cam);
        const rect = container.getBoundingClientRect();
        return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
      };
    }

    // WP-1.4 — history recording + committed-head contract. Palette edits
    // route through the store (InspectorPanels is file-isolated), so a store
    // subscription diffs component/param changes into commands. Undo/redo
    // suppress the recorder (the command's own revert mutates the store).
    const cadTraces: Array<{ from: string; to: string }> = [];
    let prevComponents = store.get().sandboxComponents.map((c) => ({ ...c }));
    let prevVddSlider = store.get().vddSlider;
    store.subscribe(() => {
      const s = store.get();
      const next = s.sandboxComponents.map((c) => ({ ...c }));
      if (suppressHistoryRef.current || !historyManager.recording) {
        prevComponents = next;
        prevVddSlider = s.vddSlider;
        return;
      }
      const workspace = s.workspace;
      for (const c of next) {
        if (!prevComponents.some((p) => p.id === c.id)) {
          historyManager.stackFor(workspace).record(makePlaceComponent(workspace, c));
        }
      }
      for (const c of prevComponents) {
        if (!next.some((p) => p.id === c.id)) {
          historyManager.stackFor(workspace).record(makeDeleteComponent(workspace, c));
        }
      }
      if (s.vddSlider !== prevVddSlider) {
        historyManager.stackFor(workspace).record(makeSetParam(workspace, 'vddSlider', prevVddSlider, s.vddSlider));
        prevVddSlider = s.vddSlider;
      }
      prevComponents = next;
      // Component re-renders wipe trace meshes — restore them from the
      // committed registry (deferred so the re-render lands first).
      if (cadTraces.length > 0) {
        setTimeout(() => {
          for (const t of cadTraces) world.addManhattanTrace(t.from, t.to);
        }, 0);
      }
    });

    physicsClient.ensure();
    const probeNodes = new Map<number, string>();
    const probeSamples = new Map<number, Array<{ t: number; value: number }>>();
    (window as unknown as { __probeNodes?: Map<number, string> }).__probeNodes = probeNodes;
    (window as unknown as { __probeSamples?: Map<number, Array<{ t: number; value: number }>> }).__probeSamples = probeSamples;
    physicsClient.onSnapshot((s: PhysicsSnapshot) => {
      world.applyPhysicsSnapshot(s);
      const now = performance.now();
      if (now - lastHudPush > 100) {
        lastHudPush = now;
        for (const [pid, node] of probeNodes) {
          const value = s.nodes[node] ?? 0;
          const arr = probeSamples.get(pid) ?? [];
          arr.push({ t: s.t, value });
          if (arr.length > 240) arr.shift();
          probeSamples.set(pid, arr);
        }
        store.set({
          physics: {
            vdd: s.vdd,
            voutQ4: s.nodes.vout_q4 ?? 0,
            voutBin: s.nodes.vout_bin ?? 0,
            iRail: s.currents.RAIL ?? 0,
            traceC: s.temps.traceC ?? 27,
            pcbC: s.temps.pcbC ?? 27,
            junctionC: s.temps.junctionC ?? 27,
            cryoK: s.temps.cryoK ?? 0.015,
            driveW: store.get().drivePowerMW / 1000,
            melted: (s.temps.traceC ?? 0) >= 1085,
            shorted: (s.vgsMax ?? 0) >= 1.95,
            paused: false,
          },
        });
      }
    });
    physicsClient.onFx((fx: FaultFx) => world.handleFaultFx(fx));
    physicsClient.onFailure((report: ForensicReport, replay, fix: ProposedFix | null) => {
      // Forensic dock slides up (max 32 % height) — viewport stays wide.
      store.set({ forensic: { report, replay, fix }, dockOpen: true, dockTab: 'autopsy', replayIndex: null });
      flashToast(`FAILURE: ${report.failure.type} — forensic dock opened`);
    });
    physicsClient.setParams({ vdd: store.get().vddSlider, drivePowerW: store.get().drivePowerMW / 1000 });

    quantumClient.ensure();
    quantumClient.onState(({ bloch, gateFidelity }: { bloch: BlochState[]; gateFidelity: number | null }) => {
      bloch.forEach((b, i) => world.bay1.setBlochState(i, b.x, b.y, b.z, b.purity));
      store.set({ quantum: { bloch, gateFidelity } });
    });
    quantumClient.onProgress((k, total, error) => {
      const exp = store.get().quantumExp;
      store.set({ quantumExp: { ...exp, running: k < total, k, total, history: [...exp.history, { k, error }] } });
    });
    quantumClient.onDone((bundle: BreakthroughBundle) => {
      store.set({ quantumExp: { ...store.get().quantumExp, running: false, bundle, finalError: 1 - bundle.optimizedFidelity } });
      flashToast(`Discovery complete: fidelity ${(bundle.optimizedFidelity * 100).toFixed(1)}% (SIMULATED_NOISY_MODEL)`);
    });

    verifyReferenceIntegrity().then((res) => {
      store.set({ integrity: { verified: res.verified, total: res.total, allVerified: res.allVerified, done: true } });
    });

    const governor = createQualityGovernor(renderer);
    let frameId = 0;
    let lastHudPush = 0;
    let frames = 0;
    let fpsTimer = performance.now();
    const clock = new THREE.Clock();

    function hitPointOf(ndcX: number, ndcY: number, camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): THREE.Vector3 | null {
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const out = new THREE.Vector3();
      return ray.ray.intersectPlane(plane, out) ? out : null;
    }

    function loop(): void {
      frameId = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      rig.update(dt);
      world.update(dt);
      world.bay1.setPulseLevel(world.bay1.pulseBeamLevel * Math.exp(-dt * 6));
      governor(dt);
      renderer.render(dt);
      const p = pointerNdc.current;
      if (p.x > -1.5) {
        const hit = world.pickHover(p.x, p.y, renderer.activeCamera);
        const hitPoint = hit ? hitPointOf(p.x, p.y, renderer.activeCamera) : null;
        store.set({ hover: hit ? { ...hit, x: p.clientX, y: p.clientY } : null });
        if (hitPoint) store.set({ cursor: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z } });
        // Place-tool ghost preview (grid-snapped bench position).
        if (store.get().activeTool === 'place' && store.get().workspace === 'silicon' && hitPoint) {
          const benchX = (hitPoint.x + 2) / 1.4;
          const benchZ = (hitPoint.z + 1.4) / 1.2;
          world.setGhost(store.get().placingKind, [benchX, benchZ]);
        } else {
          world.setGhost(null, null);
        }
      }
      frames++;
      const now = performance.now();
      if (now - fpsTimer > 1000) {
        store.set({ fps: Math.round((frames * 1000) / (now - fpsTimer)) });
        frames = 0;
        fpsTimer = now;
      }
    }
    loop();

    // Direct 3D CAD interaction: place (C) / route wire (W) / probe (P).
    function benchHitOf(e: PointerEvent): { bench: [number, number]; meshName: string | null } | null {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(nx, ny), renderer.activeCamera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const out = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, out)) return null;
      const bench: [number, number] = [(out.x + 2) / 1.4, (out.z + 1.4) / 1.2];
      // Component pick: sandbox meshes + traces.
      const sandboxGroup = world.bay2.group.getObjectByName('sandbox-group');
      let meshName: string | null = null;
      if (sandboxGroup) {
        const hits = ray.intersectObjects(sandboxGroup.children, true);
        if (hits.length > 0) {
          let o: THREE.Object3D | null = hits[0].object;
          while (o && !o.name.startsWith('sandbox-') && !o.name.startsWith('trace-')) o = o.parent;
          if (o) meshName = o.name;
        }
      }
      return { bench, meshName };
    }
    function compileSandboxSpec(components: Array<{ id: string; kind: string; params?: Record<string, unknown>; nodes: string[]; position: [number, number] }>) {
      return { components, wires: [], rails: { vdd: store.get().vddSlider } };
    }
    async function sendNetlist(components: Array<{ id: string; kind: string; params?: Record<string, unknown>; nodes: string[]; position: [number, number] }>) {
      const { compileSandbox } = await import('@physics/index.mjs');
      compileSandbox(compileSandboxSpec(components)); // compile-check (throws on invalid)
      physicsClient.setNetlist(compileSandboxSpec(components));
    }
    const onViewportClick = (e: PointerEvent) => {
      const tool = store.get().activeTool;
      if (tool !== 'place' && tool !== 'wire' && tool !== 'probe') return;
      if (store.get().workspace !== 'silicon') return;
      const hit = benchHitOf(e);
      if (!hit) return;
      const comps = store.get().sandboxComponents;
      if (tool === 'place') {
        const id = store.get().placingKind + '_' + comps.length;
        const nodes = store.get().placingKind === 'nmos' ? ['gate', 'drain', 'gnd']
          : store.get().placingKind === 'pmos' ? ['gate', 'drain', 'vdd']
          : store.get().placingKind === 'rail' ? ['vdd']
          : store.get().placingKind === 'resistor' ? ['drain', 'gnd']
          : ['in', 'drain', 'vdd'];
        const next = [
          ...comps,
          { id, kind: store.get().placingKind, params: {}, nodes, position: [hit.bench[0], hit.bench[1]] as [number, number] },
        ];
        store.set({ sandboxComponents: next });
        void sendNetlist(next);
        flashToast('Placed ' + id + ' — netlist recompiled');
      } else if (tool === 'wire') {
        const target = hit.meshName?.replace('sandbox-', '') ?? null;
        if (!target) {
          flashToast('Wire tool: click a placed component');
          return;
        }
        const pending = store.get().pendingWireFrom;
        if (!pending) {
          store.set({ pendingWireFrom: target });
          flashToast('Wire from ' + target + ' — click destination');
        } else if (pending !== target) {
          historyManager.push(
            makeRouteWire('silicon', { from: pending, to: target }),
            {
              setWires: (wires) => store.set({ wires } as unknown as Partial<LabState>),
              addTraceMesh: (f: string, t: string) => {
                world.addManhattanTrace(f, t);
                cadTraces.push({ from: f, to: t });
              },
              removeTraceMesh: (f: string, t: string) => {
                const group = world.bay2.group.getObjectByName('sandbox-group');
                if (group) {
                  const prefix = 'trace-' + f + '-' + t;
                  for (const child of [...group.children]) {
                    if (child.name.startsWith(prefix)) group.remove(child);
                  }
                }
                const i = cadTraces.findIndex((w) => w.from === f && w.to === t);
                if (i >= 0) cadTraces.splice(i, 1);
              },
            },
          );
          store.set({ pendingWireFrom: null });
          void sendNetlist(comps);
          flashToast('Copper trace routed ' + pending + ' → ' + target + ' — netlist recompiled');
        }
      } else if (tool === 'probe') {
        const target = hit.meshName?.replace('sandbox-', '') ?? null;
        if (!target) {
          flashToast('Probe tool: click a placed component');
          return;
        }
        const comp = comps.find((c) => c.id === target);
        const node = comp?.nodes?.[1] ?? 'drain';
        const colors = ['#62d0ff', '#ffd98a', '#ff9d7a', '#8ef0b2'];
        const probeId = Date.now() % 100000;
        store.set({ probes: [...store.get().probes, { id: probeId, targetId: target, color: colors[store.get().probes.length % 4], samples: [] }].slice(-4) });
        probeNodes.set(probeId, node);
        store.set({ dockOpen: true, dockTab: 'scope' });
        flashToast('Probe pinned on ' + target + ' (node ' + node + ') — live waveform in dock');
      }
    };
    container.addEventListener('pointerdown', onViewportClick);

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerNdc.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        clientX: e.clientX,
        clientY: e.clientY,
      };
    };
    window.addEventListener('pointermove', onPointerMove);

    // WP-1.3 — auto-save: 30 s interval + window blur, sealed committed state
    // only. Boot: fail-closed restore of the auto-save slot (refused slots
    // are cleared, never partially applied).
    const autosaveNow = () => {
      void buildEplabProject(persistSnapshot(), { name: 'autosave', referenceLibraryLockedAt: libraryLockedAt })
        .then((sealed) => {
          saveAutosave(sealed.project);
          const lab = window.__lab as unknown as Record<string, unknown>;
          if (lab) lab.projectAutosaveAt = sealed.project.modifiedAt;
        })
        .catch(() => { /* best-effort: explicit saves report failures honestly */ });
    };
    void restoreAutosave({ referenceLibraryLockedAt: libraryLockedAt })
      .then((restored) => {
        if (restored) applyLoadedProject(restored);
      })
      .catch((err: unknown) => {
        clearAutosave();
        flashToast(err instanceof Error ? err.message : String(err));
      });
    const autosaveTimer = window.setInterval(autosaveNow, 30_000);
    window.addEventListener('blur', autosaveNow);
    const lab = window.__lab as unknown as Record<string, unknown>;
    if (lab) {
      lab.project = { mode: desktopBridge.mode, autosaveNow, saveNow: saveProjectAction, openPicker: openProjectAction };
    }

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('pointerdown', onViewportClick);
      window.removeEventListener('pointermove', onPointerMove);
      window.clearInterval(autosaveTimer);
      window.removeEventListener('blur', autosaveNow);
      world.dispose();
      renderer.dispose();
      rig.dispose();
      bundleRef.current = null;
      worldRef.current = null;
    };
  }, []);

  // React → world parameter bridge.
  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;
    b.world.setBay1Mode(state.bay1Mode);
    b.world.setLayerPeel(state.peelMode === 'exploded', state.peelDepth);
    b.world.setNpuAttached(state.npuAttached);
    b.world.setSandboxComponents(state.sandboxComponents);
    b.world.bay1.setBlochOverlay(state.blochOverlay);
  }, [state.bay1Mode, state.peelMode, state.peelDepth, state.npuAttached, state.sandboxComponents, state.blochOverlay]);

  // Workspace switching → single-workspace mounting.
  useEffect(() => {
    bundleRef.current?.world.setWorkspace(state.workspace);
    const rig = bundleRef.current?.rig;
    if (rig) {
      rig.goalTarget.set(0, 1.2, 0);
      rig.goalRadius = state.workspace === 'soc' ? 13 : state.workspace === 'library' ? 8 : 10;
      rig.upHint.set(0, 1, 0);
    }
  }, [state.workspace]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;
    b.renderer.useOrtho = state.ortho;
  }, [state.ortho]);

  // Keyboard: V/C/W/P tools · L peel · T thermal · O ortho · Space run/pause ·
  // Step · 1–4 workspaces · Tab inspector · Esc topmost-close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // WP-1.4 — Undo/Redo chords (guarded before tool hotkeys: Ctrl+Z must
      // never double-fire the 'z' tool path, and tool hotkeys stay Ctrl-free).
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === 'z' && !e.shiftKey) {
          e.preventDefault();
          suppressHistoryRef.current = true;
          const workspace = store.get().workspace;
          const undone = historyManager.undo(workspace, (window as unknown as { __lab: { historyCtx: unknown } }).__lab.historyCtx as never);
          suppressHistoryRef.current = false;
          flashToast(undone ? 'Undo: ' + undone.label : 'Nothing to undo');
          return;
        }
        if (k === 'y' || (k === 'z' && e.shiftKey)) {
          e.preventDefault();
          suppressHistoryRef.current = true;
          const workspace = store.get().workspace;
          const redone = historyManager.redo(workspace, (window as unknown as { __lab: { historyCtx: unknown } }).__lab.historyCtx as never);
          suppressHistoryRef.current = false;
          flashToast(redone ? 'Redo: ' + redone.label : 'Nothing to redo');
          return;
        }
        return; // other chords are not tool hotkeys
      }
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) {
        const ids: WorkspaceId[] = ['quantum', 'silicon', 'soc', 'library'];
        store.set({ workspace: ids[num - 1], inspectorOpen: false, libraryOpen: false });
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'v') store.set({ activeTool: 'select' });
      if (k === 'c') store.set({ activeTool: 'place' });
      if (k === 'w') store.set({ activeTool: 'wire' });
      if (k === 'p') store.set({ activeTool: 'probe' });
      if (k === 'l') {
        const next = store.get().peelMode === 'assembled' ? 'exploded' : 'assembled';
        store.set({ peelMode: next });
        flashToast(next === 'exploded' ? 'Layer peel: exploded' : 'Layer peel: assembled');
      }
      if (k === 't') {
        const on = !store.get().thermalView;
        store.set({ thermalView: on });
        bundleRef.current?.world.setThermalView(on);
        flashToast(on ? 'Thermal camera ON' : 'Thermal camera OFF');
      }
      if (k === 'o') {
        const next = !store.get().ortho;
        store.set({ ortho: next });
        flashToast(next ? 'Orthographic camera' : 'Perspective camera');
      }
      if (e.key === ' ') {
        e.preventDefault();
        const next = !store.get().playing;
        store.set({ playing: next });
        if (next) physicsClient.resume();
        else physicsClient.pauseSimulation();
        flashToast(next ? 'Simulation running' : 'Simulation paused');
      }
      if (e.key === '.') physicsClient.stepOnce();
      if (e.key === 'Escape') {
        const s = store.get();
        if (s.libraryOpen) store.set({ libraryOpen: false });
        else if (s.inspectorOpen) store.set({ inspectorOpen: false });
        else if (s.dockOpen) store.set({ dockOpen: false });
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        store.set({ inspectorOpen: !store.get().inspectorOpen });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const unit = WORKSPACES.find((w) => w.id === state.workspace)?.unit ?? '—';
  const ph = state.physics;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#14171c' }}>
      {/* CAD toolbar (40 px) */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: TOOLBAR_H,
          background: '#14171c', borderBottom: '1px solid #3a4250',
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', zIndex: 130,
        }}
      >
        {WORKSPACES.map((w) => (
          <button
            key={w.id}
            onClick={() => store.set({ workspace: w.id, inspectorOpen: false, libraryOpen: false })}
            style={{
              background: state.workspace === w.id ? '#d8a03a' : 'rgba(26,32,41,0.9)',
              color: state.workspace === w.id ? '#14171c' : '#eceff4',
              border: '1px solid #3a4250', borderRadius: 8, padding: '3px 12px',
              cursor: 'pointer', fontSize: 12.5, fontWeight: state.workspace === w.id ? 700 : 500,
            }}
            title={`Workspace: ${w.name}`}
          >
            {w.name}
          </button>
        ))}
        <span style={{ width: 1, height: 22, background: '#3a4250' }} />
        {([['select', 'V', 'Select'], ['place', 'C', 'Place'], ['wire', 'W', 'Route Wire'], ['probe', 'P', 'Probe']] as Array<[typeof state.activeTool, string, string]>).map(([tool, key, name]) => (
          <button
            key={tool}
            onClick={() => store.set({ activeTool: tool })}
            style={{
              background: state.activeTool === tool ? '#2e6ea6' : 'rgba(26,32,41,0.9)',
              color: '#eceff4',
              border: '1px solid #3a4250', borderRadius: 8, padding: '3px 9px',
              cursor: 'pointer', fontSize: 12,
            }}
            title={`${name} [${key}]`}
          >
            {name} {key}
          </button>
        ))}
        <button style={toolBtn} onClick={() => {
          const next = store.get().peelMode === 'assembled' ? 'exploded' : 'assembled';
          store.set({ peelMode: next });
        }} title="Layer Peel [L]">Peel L</button>
        <button style={toolBtn} onClick={() => {
          const on = !store.get().thermalView;
          store.set({ thermalView: on });
          bundleRef.current?.world.setThermalView(on);
        }} title="Thermal Camera [T]">Thermal T</button>
        <button style={toolBtn} onClick={() => store.set({ ortho: !state.ortho })} title="Ortho/Persp [O]">
          {state.ortho ? 'Ortho O' : 'Persp O'}
        </button>
        <span style={{ width: 1, height: 22, background: '#3a4250' }} />
        <button style={{ ...toolBtn, color: state.playing ? '#8ef0b2' : '#eceff4' }} onClick={() => {
          const next = !store.get().playing;
          store.set({ playing: next });
          if (next) physicsClient.resume();
          else physicsClient.pauseSimulation();
        }} title="Run/Pause [Space]">{state.playing ? '❚❚ Pause' : '▶ Run'}</button>
        <button style={toolBtn} onClick={() => physicsClient.stepOnce()} title="Step one tick [.]">Step</button>
        <button style={toolBtn} onClick={() => { physicsClient.reset(); worldRef.current?.clearFailureVisuals(); }} title="Reset">Reset</button>
        <span style={{ width: 1, height: 22, background: '#3a4250' }} />
        <button style={toolBtn} onClick={() => { void saveProjectAction(); }} title="Save project (.eplab) — SHA-256 sealed">Save</button>
        <button style={toolBtn} onClick={() => { void openProjectAction(); }} title="Open project (.eplab) — validated fail-closed">Open</button>
        {state.toast && (
          <span
            data-testid="project-toast"
            style={{
              maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: /refused|failed|mismatch/i.test(state.toast) ? '#f07a4f' : '#8ef0b2',
              fontSize: 11.5, fontFamily: 'monospace',
            }}
            title={state.toast}
          >
            {state.toast}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ color: state.fps >= 55 ? '#8ef0b2' : state.fps >= 42 ? '#f0c94f' : '#f07a4f', fontWeight: 700, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
          {state.fps} FPS
        </span>
        <span style={{ color: state.integrity.allVerified ? '#8ef0b2' : '#8fa0b4', fontSize: 11, fontFamily: 'monospace' }}>
          {state.integrity.done ? `SHA-256 ${state.integrity.verified}/${state.integrity.total}${state.integrity.allVerified ? ' ✓' : ' ✗'}` : 'SHA-256 …'}
        </span>
      </div>

      {/* 3D viewport — full remaining height (80 %+ unobstructed) */}
      <div ref={mountRef} data-testid="cad-viewport" style={{ position: 'absolute', top: TOOLBAR_H, left: 0, right: 0, bottom: STATUS_H }} />

      {/* ViewCube gizmo (top-right of viewport) */}
      <ViewCube
        getCameraQuaternion={() => {
          const cam = bundleRef.current?.renderer.activeCamera;
          const q = new THREE.Quaternion();
          if (cam) {
            const m = new THREE.Matrix4().lookAt(cam.position, new THREE.Vector3(0, 0, 0), cam.up);
            q.setFromRotationMatrix(m);
          }
          return q;
        }}
        onView={(dir, up) => {
          bundleRef.current?.rig.setPresetView(dir, up);
        }}
      />
      {/* Axis triad hint (bottom-left) */}
      <div
        style={{
          position: 'absolute', bottom: STATUS_H + 8, left: 10, zIndex: 60,
          color: '#8fa0b4', fontSize: 11, fontFamily: 'monospace',
          background: 'rgba(20,23,28,0.7)', padding: '4px 8px', borderRadius: 6, border: '1px solid #2a323c',
        }}
      >
        <span style={{ color: '#e05a40' }}>X</span>
        <span style={{ color: '#8ef0b2' }}> Y</span>
        <span style={{ color: '#62a8e0' }}> Z</span> · {unit}
      </div>

      {/* Hover callout — replaces all permanent floating labels */}
      {state.hover && (
        <div
          style={{
            position: 'fixed',
            left: state.hover.x + 14,
            top: state.hover.y + 14,
            background: 'rgba(20,23,28,0.95)',
            border: '1px solid #3a4250',
            color: '#eceff4',
            padding: '5px 9px',
            borderRadius: 6,
            fontSize: 11.5,
            fontFamily: 'monospace',
            zIndex: 140,
            pointerEvents: 'none',
          }}
        >
          <b>{state.hover.name}</b>
          {state.hover.meta && <div style={{ color: '#8fa0b4' }}>{state.hover.meta}</div>}
        </div>
      )}

      {/* Right property inspector (starts collapsed) */}
      <div
        style={{
          position: 'absolute', top: TOOLBAR_H, right: 0, width: 320, bottom: STATUS_H,
          background: 'rgba(20,23,28,0.96)', borderLeft: '1px solid #3a4250',
          transform: state.inspectorOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          padding: 14, zIndex: 90, overflowY: 'auto', boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ color: '#eceff4', margin: 0, fontSize: 14 }}>
            {WORKSPACES.find((w) => w.id === state.workspace)?.name ?? 'Inspector'}
          </h3>
          <button
            onClick={() => store.set({ inspectorOpen: false })}
            style={{ background: 'none', border: '1px solid #3a4250', color: '#eceff4', cursor: 'pointer', fontSize: 14, borderRadius: 6, padding: '0 8px' }}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
        <InspectorPanels bay={state.workspace === 'quantum' ? 1 : state.workspace === 'silicon' ? 2 : state.workspace === 'soc' ? 3 : 5} state={state} dispatch={(patch) => store.set(patch)} />
      </div>

      {/* Bay 5 library overlay */}
      {state.libraryOpen && <LibraryOverlay onClose={() => store.set({ libraryOpen: false })} />}

      {/* Bottom instrument dock */}
      <BottomDock />

      {/* CAD status bar (24 px) */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: STATUS_H,
          background: '#14171c', borderTop: '1px solid #3a4250',
          display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', zIndex: 130,
          color: '#8fa0b4', fontSize: 11, fontFamily: 'monospace',
        }}
      >
        <span>
          X {state.cursor ? state.cursor.x.toFixed(3) : '—'} · Y {state.cursor ? state.cursor.y.toFixed(3) : '—'} · Z{' '}
          {state.cursor ? state.cursor.z.toFixed(3) : '—'} {unit}
        </span>
        <span>tool: {state.activeTool}</span>
        {ph && (
          <>
            <span>VDD {ph.vdd.toFixed(2)} V</span>
            <span>I_rail {Math.abs(ph.iRail * 1000).toFixed(1)} mA</span>
            <span style={{ color: ph.traceC > 200 ? '#f07a4f' : '#8fa0b4' }}>T_max {ph.traceC.toFixed(0)} °C</span>
            {(ph.shorted || ph.melted) && <span style={{ color: '#f07a4f', fontWeight: 700 }}>FAULT</span>}
          </>
        )}
        <div style={{ flex: 1 }} />
        {/* WP-1.6 — admission refusals surface in the status bar too. */}
        <AdmissionBanner compact />
        <span>{WORKSPACES.find((w) => w.id === state.workspace)?.name}</span>
      </div>
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  background: 'rgba(26,32,41,0.9)',
  color: '#eceff4',
  border: '1px solid #3a4250',
  borderRadius: 8,
  padding: '3px 9px',
  cursor: 'pointer',
  fontSize: 12,
};
