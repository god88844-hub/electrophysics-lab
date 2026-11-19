import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Bay definitions
const BAYS = [
  { id: 1, name: 'Quantum Cryo & Optics', color: 0x4fc3f7, x: -8 },
  { id: 2, name: 'Silicon Foundry & Multi-Radix', color: 0xffc107, x: 0 },
  { id: 3, name: 'Full-Chip Architecture', color: 0x26c6da, x: 8 },
] as const;

type BayId = 1 | 2 | 3;

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeBay, setActiveBay] = useState<BayId | 0>(0);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e14);
    scene.fog = new THREE.Fog(0x0a0e14, 20, 60);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 4, 14);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 0.8);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 10, 7);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.5);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);

    // Floor with grid
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);

    const grid = new THREE.GridHelper(60, 60, 0x1e3a5f, 0x16213e);
    grid.position.y = 0.005;
    scene.add(grid);

    // Bays
    const bayMeshes: THREE.Group[] = [];
    for (const bay of BAYS) {
      const group = new THREE.Group();
      group.position.set(bay.x, 0, 0);

      // Pedestal
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2, 0.3, 32),
        new THREE.MeshStandardMaterial({ color: bay.color, roughness: 0.3, metalness: 0.7 })
      );
      pedestal.position.y = 0.15;
      group.add(pedestal);

      // Floating hologram sphere
      const hologram = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.8, 2),
        new THREE.MeshStandardMaterial({
          color: bay.color,
          emissive: bay.color,
          emissiveIntensity: 0.4,
          wireframe: true,
        })
      );
      hologram.position.y = 1.8;
      hologram.name = 'hologram';
      group.add(hologram);

      // Nameplate
      group.userData = { bayId: bay.id, name: bay.name };
      scene.add(group);
      bayMeshes.push(group);
    }

    // Animation loop
    let frameId = 0;
    let lastTime = performance.now();
    let frames = 0;
    let fpsTimer = 0;
    const clock = new THREE.Clock();

    function animate() {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate holograms
      for (const group of bayMeshes) {
        const holo = group.getObjectByName('hologram');
        if (holo) {
          holo.rotation.y += delta * 0.5;
          holo.position.y = 1.8 + Math.sin(performance.now() * 0.001) * 0.1;
        }
      }

      renderer.render(scene, camera);

      // FPS counter
      frames++;
      const now = performance.now();
      if (now - fpsTimer > 1000) {
        setFps(Math.round((frames * 1000) / (now - fpsTimer)));
        frames = 0;
        fpsTimer = now;
      }
    }
    animate();

    // Resize handler
    const onResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 3) {
        setActiveBay(num as BayId);
        setInspectorOpen(true);
      }
      if (e.key === 'Escape') {
        setActiveBay(0);
        setInspectorOpen(false);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setInspectorOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Camera fly-to on bay change
  useEffect(() => {
    // Camera moves to the active bay (simplified — no smooth tween for now)
    if (activeBay > 0) {
      const bay = BAYS.find((b) => b.id === activeBay);
      if (bay) console.log(`Flying to Bay ${bay.id}: ${bay.name}`);
    }
  }, [activeBay]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D canvas container */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Top navigation pill */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
          background: 'rgba(10,14,20,0.85)',
          borderRadius: 24,
          padding: '6px 16px',
          border: '1px solid #263042',
          zIndex: 100,
        }}
      >
        {BAYS.map((bay) => (
          <button
            key={bay.id}
            onClick={() => { setActiveBay(bay.id); setInspectorOpen(true); }}
            style={{
              background: activeBay === bay.id ? bay.color : 'transparent',
              color: activeBay === bay.id ? '#000' : '#8ea1b8',
              border: 'none',
              borderRadius: 16,
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: activeBay === bay.id ? 600 : 400,
            }}
          >
            {bay.id}
          </button>
        ))}
        <span style={{ color: '#4e5d70', margin: '0 6px' }}>|</span>
        <span style={{ color: fps >= 55 ? '#5fd48a' : '#f0a94f', fontWeight: 600, fontSize: 12, alignSelf: 'center' }}>
          {fps} FPS
        </span>
      </div>

      {/* Inspector Drawer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 300,
          height: '100%',
          background: 'rgba(20,26,35,0.95)',
          borderLeft: '1px solid #263042',
          transform: inspectorOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          padding: 16,
          zIndex: 90,
        }}
      >
        <h3 style={{ color: '#e8eef7', marginBottom: 8 }}>
          {activeBay ? BAYS.find((b) => b.id === activeBay)?.name : 'Inspector'}
        </h3>
        {activeBay === 1 && (
          <p style={{ color: '#8ea1b8', fontSize: 12 }}>
            Quantum Cryo &amp; Optics Station. Dilution refrigerator at 15 mK. Qubits: transmon, photonic, neutral-atom.
          </p>
        )}
        {activeBay === 2 && (
          <p style={{ color: '#8ea1b8', fontSize: 12 }}>
            Silicon Foundry &amp; Multi-Radix Station. SKY130A Q4 primitives loaded from Phase 0.
          </p>
        )}
        {activeBay === 3 && (
          <p style={{ color: '#8ea1b8', fontSize: 12 }}>
            Full-Chip Architecture Station. RV32IM CPU, systolic TPU, SIMT GPU holographic die.
          </p>
        )}
      </div>
    </div>
  );
}
