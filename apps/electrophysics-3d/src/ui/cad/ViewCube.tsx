import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type ViewPreset = 'iso' | 'top' | 'bottom' | 'front' | 'right';

interface Props {
  /** Called with the preset view direction (world-space). */
  onView: (dir: THREE.Vector3, up: THREE.Vector3) => void;
  /** Main-camera orientation sync source (quaternion). */
  getCameraQuaternion: () => THREE.Quaternion;
}

/**
 * Interactive 3D ViewCube gizmo (Fusion/KiCad style) — a tiny self-rendered
 * three.js scene whose cube rotation mirrors the main camera; clicking a face
 * snaps the main camera to that view.
 */
export function ViewCube({ onView, getCameraQuaternion }: Props): React.ReactElement {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{ renderer?: THREE.WebGLRenderer; scene?: THREE.Scene; camera?: THREE.PerspectiveCamera; cube?: THREE.Mesh; ray?: THREE.Raycaster }>({});
  const faceNames = ['TOP', 'BOTTOM', 'FRONT', 'BACK', 'RIGHT', 'LEFT'];
  const faceDirs: Array<[THREE.Vector3, THREE.Vector3]> = [
    [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)],
    [new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1)],
    [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0)],
    [new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)],
    [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)],
    [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0)],
  ];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(104, 104);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(3.2, 3.2, 3.2);
    camera.lookAt(0, 0, 0);
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x232a35, metalness: 0.4, roughness: 0.4, transparent: true, opacity: 0.9 })
    );
    scene.add(cube);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x8fa0b4 });
    scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.52, 1.52, 1.52)), edgeMat));
    // Face labels via canvas sprites.
    const labelSprites: Array<{ sprite: THREE.Sprite; dir: THREE.Vector3 }> = [];
    faceNames.forEach((name, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#eceff4';
      ctx.font = '600 26px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, 64, 32);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
      sprite.scale.set(0.9, 0.45, 1);
      sprite.position.copy(faceDirs[i][0]).multiplyScalar(0.85);
      scene.add(sprite);
      labelSprites.push({ sprite, dir: faceDirs[i][0] });
    });
    scene.add(new THREE.AmbientLight(0xeceff4, 1.1));
    const key = new THREE.DirectionalLight(0xf6f7f4, 1.6);
    key.position.set(4, 6, 5);
    scene.add(key);
    const ray = new THREE.Raycaster();
    stateRef.current = { renderer, scene, camera, cube, ray };
    renderer.domElement.addEventListener('pointerdown', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      );
      ray.setFromCamera(ndc, camera);
      const labelHit = ray.intersectObjects(labelSprites.map((l) => l.sprite), false)[0];
      if (labelHit) {
        const found = labelSprites.find((l) => l.sprite === labelHit.object);
        if (found) {
          const idx = labelSprites.indexOf(found);
          onView(faceDirs[idx][0].clone(), faceDirs[idx][1].clone());
          return;
        }
      }
      const hits = ray.intersectObject(cube, false);
      if (hits.length > 0) {
        const n = hits[0].face?.normal.clone().applyQuaternion(cube.quaternion) ?? new THREE.Vector3(0, 1, 0);
        onView(n.clone().normalize(), Math.abs(n.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0));
      }
    });

    let frame = 0;
    let lastRender = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (performance.now() - lastRender < 33) return; // 30 Hz gizmo is plenty
      lastRender = performance.now();
      // Mirror main camera orientation.
      cube.quaternion.copy(getCameraQuaternion()).invert();
      for (const l of labelSprites) {
        l.sprite.position.copy(l.dir).multiplyScalar(0.85).applyQuaternion(cube.quaternion);
      }
      renderer.render(scene, camera);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      title="ViewCube — click a face (Iso/Top/Front/Right/Bottom)"
      style={{ position: 'absolute', top: 52, right: 12, width: 104, height: 104, zIndex: 60, cursor: 'pointer' }}
    />
  );
}
