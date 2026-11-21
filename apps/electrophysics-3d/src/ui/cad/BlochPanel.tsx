import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { store } from '../../state/store.js';

const getStore = () => store.get();
const subscribeStore = (fn: () => void) => store.subscribe(fn);

/**
 * Quantum Bloch instrument panel — docked (M13): three live spheres fed by the
 * Lindblad density-matrix readouts from the quantum worker. Replaces the old
 * floating-in-scene wireframe balls (HUD overlay toggle kept in the quantum
 * inspector).
 */
export function BlochPanel(): React.ReactElement {
  const refs = useRef<Array<HTMLCanvasElement | null>>([null, null, null]);
  const state = useSyncExternalStore(subscribeStore, getStore);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    refs.current.forEach((canvas, i) => {
      if (!canvas) return;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(150, 150, false);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
      camera.position.set(2.2, 1.8, 2.2);
      camera.lookAt(0, 0, 0);
      scene.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.72, 18, 12),
          new THREE.MeshBasicMaterial({ color: 0x2a5a80, wireframe: true, transparent: true, opacity: 0.45 })
        )
      );
      const equator = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.01, 6, 36), new THREE.MeshBasicMaterial({ color: 0x3a7ab0 }));
      equator.rotation.x = Math.PI / 2;
      scene.add(equator);
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.72, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x62d0ff, transparent: true, opacity: 0.2 })
      );
      scene.add(shell);
      const arrow = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.62, 8),
        new THREE.MeshStandardMaterial({ color: 0xffc46b, emissive: 0x8a6b1d, emissiveIntensity: 0.9 })
      );
      shaft.position.y = 0.31;
      arrow.add(shaft);
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.2, 10),
        new THREE.MeshStandardMaterial({ color: 0xffc46b, emissive: 0x8a6b1d, emissiveIntensity: 1.1 })
      );
      tip.position.y = 0.7;
      arrow.add(tip);
      scene.add(arrow);
      scene.add(new THREE.AmbientLight(0xeceff4, 1.0));
      const key = new THREE.DirectionalLight(0xf6f7f4, 1.4);
      key.position.set(3, 5, 4);
      scene.add(key);

      const timer = setInterval(() => {
        const q = store.get().quantum;
        const b = q?.bloch?.[i] ?? { x: 0, y: 0, z: 1, purity: 1 };
        const v = new THREE.Vector3(b.x, b.z, -b.y);
        if (v.lengthSq() > 1e-6) arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
        arrow.scale.setScalar(Math.max(0.12, Math.min(1, v.length())));
        shell.scale.setScalar(0.3 + 0.7 * Math.max(0.33, Math.min(1, b.purity)));
        (shell.material as THREE.MeshStandardMaterial).opacity = 0.12 + 0.22 * b.purity;
        renderer.render(scene, camera);
      }, 120);
      cleanups.push(() => {
        clearInterval(timer);
        renderer.dispose();
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <canvas
            ref={(el) => {
              refs.current[i] = el;
            }}
            width={150}
            height={150}
            style={{ width: 150, height: 150, border: '1px solid #3a4250', borderRadius: 8, background: '#0a0f16' }}
          />
          <div style={{ color: '#8fa0b4', fontSize: 11, fontFamily: 'monospace' }}>
            q{i} · {state.quantum?.bloch?.[i] ? `purity ${state.quantum.bloch[i].purity.toFixed(3)}` : 'idle'}
          </div>
        </div>
      ))}
    </div>
  );
}
