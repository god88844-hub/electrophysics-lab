import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { createRenderer, createQualityGovernor, type RendererBundle } from './engine/renderer.js';
import { CameraRig } from './engine/cameraRig.js';
import { LabWorld, BAY_DEFS } from './world.js';
import { store, flashToast } from './state/store.js';
import { verifyReferenceIntegrity } from './data/reference.js';
import { LibraryOverlay } from './ui/LibraryOverlay.js';
import { InspectorPanels } from './ui/InspectorPanels.js';

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

    // Integrity badge — SHA-256 over exact bytes of all 6 reference files.
    verifyReferenceIntegrity().then((res) => {
      store.set({ integrity: { verified: res.verified, total: res.total, allVerified: res.allVerified, done: true } });
    });

    const governor = createQualityGovernor(renderer);
    let frameId = 0;
    let last = performance.now();
    let frames = 0;
    let fpsTimer = last;
    const clock = new THREE.Clock();

    function loop(): void {
      frameId = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      rig.update(dt);
      world.update(dt, renderer.camera, 0);
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
    };
  }, []);

  // React → world parameter bridge.
  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;
    b.world.setBay1Mode(state.bay1Mode);
    b.world.setLayerPeel(state.peelMode === 'exploded', state.peelDepth);
    b.world.setNpuAttached(state.npuAttached);
  }, [state.bay1Mode, state.peelMode, state.peelDepth, state.npuAttached]);

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
        store.set({ activeBay: 0, inspectorOpen: false, libraryOpen: false });
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
          background: 'rgba(8,12,18,0.82)',
          borderRadius: 22,
          padding: '5px 12px',
          border: '1px solid #223042',
          zIndex: 100,
          backdropFilter: 'blur(6px)',
        }}
      >
        {BAY_DEFS.map((bay) => (
          <button
            key={bay.id}
            onClick={() => selectBay(bay.id as 1 | 2 | 3 | 4 | 5)}
            style={{
              background: state.activeBay === bay.id ? bay.color : 'transparent',
              color: state.activeBay === bay.id ? '#0a0e14' : '#8ea1b8',
              border: 'none',
              borderRadius: 15,
              padding: '3px 11px',
              cursor: 'pointer',
              fontWeight: state.activeBay === bay.id ? 700 : 400,
              fontSize: 13,
            }}
            title={bay.name}
          >
            {bay.id}
          </button>
        ))}
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
        1–5 bays · L layer peel · Tab inspector · Esc overview · drag orbit · WASD pan
      </div>

      {/* Toast */}
      {state.toast && (
        <div
          style={{
            position: 'absolute',
            bottom: 38,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8,12,18,0.9)',
            border: '1px solid #223042',
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
          background: 'rgba(13,18,26,0.94)',
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
          <h3 style={{ color: '#e8eef7', margin: 0, fontSize: 15 }}>{activeDef ? activeDef.name : 'Inspector'}</h3>
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
    </div>
  );
}
