import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { createRenderer, createQualityGovernor, type RendererBundle } from './engine/renderer.js';
import { CameraRig } from './engine/cameraRig.js';
import { LabWorld, WORKSPACES, type WorkspaceId } from './world.js';
import { worldRef } from './worldRef.js';
import { store, flashToast } from './state/store.js';
import { verifyReferenceIntegrity } from './data/reference.js';
import { physicsClient, type PhysicsSnapshot, type ForensicReport, type ProposedFix, type FaultFx } from './physics/physicsClient.js';
import { quantumClient, type BlochState, type BreakthroughBundle } from './physics/quantumClient.js';
import { LibraryOverlay } from './ui/LibraryOverlay.js';
import { InspectorPanels } from './ui/InspectorPanels.js';
import { BottomDock } from './ui/cad/BottomDock.js';
import { ViewCube } from './ui/cad/ViewCube.js';

function useLabState() {
  return useSyncExternalStore(
    (fn) => store.subscribe(fn),
    () => store.get()
  );
}

const TOOLBAR_H = 40;
const STATUS_H = 24;

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const bundleRef = useRef<{ renderer: RendererBundle; rig: CameraRig; world: LabWorld } | null>(null);
  const state = useLabState();
  const pointerNdc = useRef({ x: -2, y: -2, clientX: 0, clientY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const renderer = createRenderer(container);
    const world = new LabWorld(renderer.scene);
    const rig = new CameraRig(renderer, renderer.renderer.domElement);
    bundleRef.current = { renderer, rig, world };
    worldRef.current = world;

    physicsClient.ensure();
    physicsClient.onSnapshot((s: PhysicsSnapshot) => {
      world.applyPhysicsSnapshot(s);
      const now = performance.now();
      if (now - lastHudPush > 100) {
        lastHudPush = now;
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

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
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
        <div style={{ flex: 1 }} />
        <span style={{ color: state.fps >= 55 ? '#8ef0b2' : state.fps >= 42 ? '#f0c94f' : '#f07a4f', fontWeight: 700, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
          {state.fps} FPS
        </span>
        <span style={{ color: state.integrity.allVerified ? '#8ef0b2' : '#8fa0b4', fontSize: 11, fontFamily: 'monospace' }}>
          {state.integrity.done ? `SHA-256 ${state.integrity.verified}/${state.integrity.total}${state.integrity.allVerified ? ' ✓' : ' ✗'}` : 'SHA-256 …'}
        </span>
      </div>

      {/* 3D viewport — full remaining height (80 %+ unobstructed) */}
      <div ref={mountRef} style={{ position: 'absolute', top: TOOLBAR_H, left: 0, right: 0, bottom: STATUS_H }} />

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
