import * as THREE from 'three';

/** Crisp 3D measurement probe pin: needle + emissive collar + base. */
export function makeProbePin(height = 1.1, color = 0x62d0ff): THREE.Group {
  const group = new THREE.Group();
  const needle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.032, height, 10),
    new THREE.MeshStandardMaterial({ color: 0x9aa4b2, metalness: 0.9, roughness: 0.25 })
  );
  needle.position.y = height / 2;
  needle.castShadow = true;
  group.add(needle);
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.032, 0.14, 10),
    new THREE.MeshStandardMaterial({ color: 0xe8eef7, metalness: 0.8, roughness: 0.2 })
  );
  tip.rotation.x = Math.PI;
  tip.position.y = height + 0.07;
  group.add(tip);
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.016, 8, 16),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, metalness: 0.4, roughness: 0.4 })
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = height * 0.82;
  group.add(collar);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.07, 14),
    new THREE.MeshStandardMaterial({ color: 0x20262f, metalness: 0.6, roughness: 0.5 })
  );
  base.position.y = 0.035;
  group.add(base);
  return group;
}
