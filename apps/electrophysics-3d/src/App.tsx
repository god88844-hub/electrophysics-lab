import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { createRenderer, createQualityGovernor, type RendererBundle } from './engine/renderer.js';
import { CameraRig } from './engine/cameraRig.js';
import { LabWorld, BAY_DEFS } from './world.js';
import { worldRef } from './worldRef.js';
import { store, flashToast } from './state/store.js';
import { verifyReferenceIntegrity } from './data/reference.js';
import { physicsClient, type PhysicsSnapshot, type ForensicReport, type ProposedFix, type FaultFx } from './physics/physicsClient.js';
import { quantumClient, type BlochState, type BreakthroughBundle } from './physics/quantumClient.js';
import { LibraryOverlay } from './ui/LibraryOverlay.js';
import { InspectorPanels } from './ui/InspectorPanels.js';
import { ForensicDrawer } from './ui/ForensicDrawer.js';

function useLabState() {
  return useSyncExternalStore(
    (fn) => store.subscribe(fn),
    () => store.get()
  );
}

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const bundleRef = useRef<{ renderer: RendererBundle; rig: CameraRig; world: LabWorld } | null>(null);
  const state = useLabState();

  // Boot the 3D engine once.
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const renderer = createRenderer(container);
    const world = new LabWorld(renderer.scene, {
      onFps: (fps) => store.set({ fps }),
    });
    const rig = new CameraRig(renderer.camera, renderer.renderer.domElement);
    rig.pickHandler = (ndcX, ndcY) => world.pickBay(ndcX, ndcY, renderer.camera);
    bundleRef.current = { renderer, rig, world };
    worldRef.current = world;

    // Live physics: worker boot + visual mapping.
    physicsClient.ensure();
    physicsClient.onSnapshot((s: PhysicsSnapshot) => {
      world.applyPhysicsSnapshot(s);
      // Throttle React HUD updates to ~10 Hz.
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
      store.set({ forensic: { report, replay, fix }, autopsyOpen: true, replayIndex: null });
      flashToast(`FAILURE: ${report.failure.type} — forensic capture opened`);
    });
    physicsClient.setParams({ vdd: store.get().vddSlider, drivePowerW: store.get().drivePowerMW / 1000 });

    // Live quantum: Lindblad Bloch readouts + AI Co-Inventor events.
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
      store.set({
        quantumExp: { ...store.get().quantumExp, running: false, bundle, finalError: 1 - bundle.optimizedFidelity },
      });
      flashToast(`Discovery complete: fidelity ${(bundle.optimizedFidelity * 100).toFixed(1)}% (SIMULATED_NOISY_MODEL)`);
    });

    // Integrity badge — SHA-256 over exact bytes of all 6 reference files.
    verifyReferenceIntegrity().then((res) => {
      store.set({ integrity: { verified: res.verified, total: res.total, allVerified: res.allVerified, done: true } });
    });

    const governor = createQualityGovernor(renderer);
    let frameId = 0;
    let last = performance.now();
    let lastHudPush = 0;
    let frames = 0;
    let fpsTimer = last;
    const clock = new THREE.Clock();

    function loop(): void {
      frameId = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      rig.update(dt);
      world.update(dt, renderer.camera, 0);
      // Pulse beam decay — visual acknowledgment of a real applied pulse.
      const bay1 = world.bay1;
      bay1.setPulseLevel(bay1.pulseBeamLevel * Math.exp(-dt * 6));
      governor(dt);
      renderer.render(dt);
      frames++;
      const now = performance.now();
      if (now - fpsTimer > 1000) {
        const fps = Math.round((frames * 1000) / (now - fpsTimer));
        store.set({ fps });
        frames = 0;
        fpsTimer = now;
      }
      void last;
    }
    loop();

    return () => {
      cancelAnimationFrame(frameId);
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
  }, [state.bay1Mode, state.peelMode, state.peelDepth, state.npuAttached, state.sandboxComponents]);

  // Keyboard shortcuts: 1–5 bays · L layer peel · Tab inspector · Esc overview · 5 also library.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 5) {
        selectBay(num as 1 | 2 | 3 | 4 | 5);
        return;
      }
      if (e.key === 'Escape') {
        const s = store.get();
        // Close the topmost panel first: autopsy > library > inspector.
        if (s.autopsyOpen) store.set({ autopsyOpen: false });
        else store.set({ activeBay: 0, inspectorOpen: false, libraryOpen: false });
        const b = bundleRef.current;
        if (b) b.rig.glideTo(new THREE.Vector3(0, 1.3, 2), 19);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        store.set({ inspectorOpen: !store.get().inspectorOpen });
      }
      if (e.key.toLowerCase() === 'l') {
        const next = store.get().peelMode === 'assembled' ? 'exploded' : 'assembled';
        store.set({ peelMode: next });
        flashToast(next === 'exploded' ? 'Layer peel: exploded stack' : 'Layer peel: assembled');
      }
      if (e.key.toLowerCase() === 't') {
        const on = !store.get().thermalView;
        store.set({ thermalView: on });
        const b = bundleRef.current;
        b?.world.setThermalView(on);
        flashToast(on ? 'Thermal camera ON — Planck/CIE blackbody ramp' : 'Thermal camera OFF');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function selectBay(id: 1 | 2 | 3 | 4 | 5): void {
    const b = bundleRef.current;
    store.set({ activeBay: id, inspectorOpen: true, libraryOpen: id === 5 ? store.get().libraryOpen : false });
    if (b) {
      const center = b.world.bayCenters[id - 1];
      const radius = id === 2 ? 9.5 : id === 3 ? 12 : 9;
      b.rig.glideTo(center, radius);
    }
  }

  const activeDef = BAY_DEFS.find((d) => d.id === state.activeBay);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Top navigation pill — zero-clutter HUD */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
          background: 'rgba(20,23,28,0.92)',
          borderRadius: 22,
          padding: '5px 12px',
          border: '1px solid #3a4250',
          zIndex: 100,
          backdropFilter: 'blur(6px)',
        }}
      >
        {BAY_DEFS.map((bay) => {
          const active = state.activeBay === bay.id;
          return (
            <button
              key={bay.id}
              onClick={() => selectBay(bay.id as 1 | 2 | 3 | 4 | 5)}
              style={{
                background: active ? '#d8a03a' : 'rgba(26,32,41,0.9)',
                color: active ? '#14171c' : '#eceff4',
                border: active ? '1px solid #f0c464' : '1px solid #3a4250',
                borderRadius: 12,
                padding: '3px 11px',
                cursor: 'pointer',
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                boxShadow: active ? '0 0 0 1px #14171c inset' : 'none',
              }}
              title={bay.name}
              aria-pressed={active}
            >
              {bay.id}
            </button>
          );
        })}
        <span style={{ color: '#3a4a5f', margin: '0 4px' }}>|</span>
        <span
          style={{
            color: state.fps >= 55 ? '#5fd48a' : state.fps >= 42 ? '#f0c94f' : '#f07a4f',
            fontWeight: 700,
            fontSize: 12,
            alignSelf: 'center',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {state.fps} FPS
        </span>
        <span
          style={{
            color: state.integrity.allVerified ? '#5fd48a' : '#4e5d70',
            fontSize: 11,
            alignSelf: 'center',
            marginLeft: 6,
            fontFamily: 'monospace',
          }}
          title="SHA-256 verified reference datasets"
        >
          {state.integrity.done
            ? `SHA-256 ${state.integrity.verified}/${state.integrity.total}${state.integrity.allVerified ? ' ✓' : ' ✗'}`
            : 'SHA-256 …'}
        </span>
      </div>

      {/* Bottom-left hint line */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          color: '#4e5d70',
          fontSize: 11.5,
          fontFamily: 'monospace',
          zIndex: 100,
          userSelect: 'none',
        }}
      >
        1–5 bays · L layer peel · T thermal · Tab inspector · Esc overview · drag orbit · WASD pan
      </div>

      {/* Toast */}
      {state.toast && (
        <div
          style={{
            position: 'absolute',
            bottom: 38,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(20,23,28,0.94)',
            border: '1px solid #3a4250',
            color: '#cfe2f7',
            padding: '6px 14px',
            borderRadius: 12,
            fontSize: 13,
            zIndex: 120,
          }}
        >
          {state.toast}
        </div>
      )}

      {/* Inspector Drawer — starts CLOSED */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 320,
          height: '100%',
          background: 'rgba(20,23,28,0.96)',
          borderLeft: '1px solid #223042',
          transform: state.inspectorOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          padding: 16,
          zIndex: 90,
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ color: '#eceff4', margin: 0, fontSize: 15 }}>{activeDef ? activeDef.name : 'Inspector'}</h3>
          <button
            onClick={() => store.set({ inspectorOpen: false })}
            style={{ background: 'none', border: 'none', color: '#4e5d70', cursor: 'pointer', fontSize: 16 }}
            title="Close (Tab)"
          >
            ✕
          </button>
        </div>
        <InspectorPanels
          bay={state.activeBay}
          state={state}
          dispatch={(patch) => store.set(patch)}
        />
      </div>

      {/* Bay 5 — Offline Physics Library overlay */}
      {state.libraryOpen && <LibraryOverlay onClose={() => store.set({ libraryOpen: false })} />}

      {/* Forensic Autopsy Drawer (opens automatically on real failure trips) */}
      <ForensicDrawer />

      {/* Bottom-right live physics strip (throttled HUD, zero clutter) */}
      {state.physics && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            color: '#4e5d70',
            fontSize: 11,
            fontFamily: 'monospace',
            zIndex: 100,
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          VDD {state.physics.vdd.toFixed(2)} V · V<sub>out</sub>(Q4) {state.physics.voutQ4.toFixed(2)} V · I{' '}
          {Math.abs(state.physics.iRail * 1000).toFixed(1)} mA · T<sub>trace</sub> {state.physics.traceC.toFixed(0)} °C
          {(state.physics.shorted || state.physics.melted) && (
            <span style={{ color: '#ff9d7a' }}> · FAULT</span>
          )}
        </div>
      )}
    </div>
  );
}
