import * as THREE from 'three';

/**
 * Shared PBR materials. Physical properties (sheet resistance, conductivity,
 * melting points) come from data/reference-library/02_semiconductor_pdk_silicon.json;
 * colours/roughness here are tuned render parameters for that physics.
 */
export const MAT = {
  brushedGold: new THREE.MeshStandardMaterial({ color: 0xd9b34a, metalness: 1.0, roughness: 0.34 }),
  goldPolished: new THREE.MeshStandardMaterial({ color: 0xf0cc66, metalness: 1.0, roughness: 0.12 }),
  niobiumDark: new THREE.MeshStandardMaterial({ color: 0x232a36, metalness: 0.85, roughness: 0.42 }),
  stainless: new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.9, roughness: 0.3 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xc47a3d, metalness: 1.0, roughness: 0.28 }),
  aluminium: new THREE.MeshStandardMaterial({ color: 0xb7bdc7, metalness: 0.95, roughness: 0.22 }),
  siliconDie: new THREE.MeshStandardMaterial({ color: 0x171d2b, metalness: 0.55, roughness: 0.28 }),
  waferDark: new THREE.MeshStandardMaterial({ color: 0x10141c, metalness: 0.92, roughness: 0.12 }),
  polySilicon: new THREE.MeshStandardMaterial({ color: 0x5e6b80, metalness: 0.35, roughness: 0.5 }),
  diffusion: new THREE.MeshStandardMaterial({ color: 0x6e5a4e, metalness: 0.3, roughness: 0.55 }),
  oxideGlass: new THREE.MeshPhysicalMaterial({
    color: 0x8fb4d8,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.6,
  }),
  nwell: new THREE.MeshStandardMaterial({ color: 0x2e6e58, transparent: true, opacity: 0.55, metalness: 0.2, roughness: 0.45 }),
  psub: new THREE.MeshStandardMaterial({ color: 0x35506e, transparent: true, opacity: 0.5, metalness: 0.2, roughness: 0.5 }),
  pcbGreen: new THREE.MeshPhysicalMaterial({
    color: 0x0e4624,
    metalness: 0.05,
    roughness: 0.55,
    transparent: true,
    opacity: 0.94,
  }),
  pcbBlack: new THREE.MeshStandardMaterial({ color: 0x101318, metalness: 0.1, roughness: 0.6 }),
  substrate: new THREE.MeshStandardMaterial({ color: 0x131720, metalness: 0.4, roughness: 0.35 }),
  plasticDark: new THREE.MeshStandardMaterial({ color: 0x1c212b, metalness: 0.35, roughness: 0.6 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x0b0f16, roughness: 0.85, metalness: 0.15 }),
  glassShroud: new THREE.MeshPhysicalMaterial({
    color: 0xaad4ff,
    transparent: true,
    opacity: 0.12,
    roughness: 0.03,
    metalness: 0,
    transmission: 0.9,
    side: THREE.DoubleSide,
  }),
  dangerStripe: new THREE.MeshStandardMaterial({ color: 0xd8b021, metalness: 0.2, roughness: 0.6 }),
} as const;

/** Dispose helper for bay rebuilds (mode switches). */
export function disposeGroup(group: THREE.Group): void {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    // Shared MAT instances are intentionally not disposed.
  });
}
