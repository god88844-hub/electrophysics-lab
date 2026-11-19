import * as THREE from 'three';

/**
 * Authentic physical laboratory materials (M8 digital-twin pass).
 * Colors/roughness follow the real-world reference values requested for the
 * photorealistic cleanroom bench: 24k brushed gold OFHC plates, electroplated
 * copper interconnect, ENIG gold pads, matte FR-4, anodized aluminum optics
 * bench. Physics constants still come from data/reference-library/*.json.
 */
export const MAT = {
  // Bay 1 — quantum cryostat
  brushedGold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.92, roughness: 0.24 }),
  goldPolished: new THREE.MeshStandardMaterial({ color: 0xe8c860, metalness: 0.95, roughness: 0.12 }),
  ofhcCopper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.95, roughness: 0.3 }),
  braidedStrap: new THREE.MeshStandardMaterial({ color: 0x8a6f4d, metalness: 0.8, roughness: 0.55 }),
  niobiumSilver: new THREE.MeshStandardMaterial({ color: 0xaab2bd, metalness: 0.9, roughness: 0.28 }),
  sapphireDie: new THREE.MeshPhysicalMaterial({ color: 0x10141c, metalness: 0.4, roughness: 0.08, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
  braidedCoax: new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.85, roughness: 0.42 }),
  stainless: new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.9, roughness: 0.3 }),
  matteSteel: new THREE.MeshStandardMaterial({ color: 0x565c66, metalness: 0.75, roughness: 0.55 }),
  vacuumShroud: new THREE.MeshStandardMaterial({ color: 0x3a4048, metalness: 0.7, roughness: 0.45 }),
  // Bay 2 — silicon foundry (true foundry layer colors)
  waferDark: new THREE.MeshPhysicalMaterial({ color: 0x3a424d, metalness: 0.85, roughness: 0.18, clearcoat: 0.65, clearcoatRoughness: 0.15 }),
  siliconDie: new THREE.MeshPhysicalMaterial({ color: 0x2a313c, metalness: 0.6, roughness: 0.14, clearcoat: 0.5 }),
  psub: new THREE.MeshStandardMaterial({ color: 0x3d4450, metalness: 0.3, roughness: 0.5 }),
  nwell: new THREE.MeshStandardMaterial({ color: 0x6a6a3f, metalness: 0.35, roughness: 0.45 }),
  polyGate: new THREE.MeshStandardMaterial({ color: 0x8a3f38, metalness: 0.3, roughness: 0.5 }),
  li1Tungsten: new THREE.MeshStandardMaterial({ color: 0x8f949c, metalness: 0.8, roughness: 0.35 }),
  met1Blue: new THREE.MeshStandardMaterial({ color: 0x3d6a8a, metalness: 0.8, roughness: 0.3 }),
  met2Copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.92, roughness: 0.26 }),
  met3Gold: new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.92, roughness: 0.22 }),
  sio2Glass: new THREE.MeshPhysicalMaterial({ color: 0xaebfcf, transparent: true, opacity: 0.22, roughness: 0.06, metalness: 0, transmission: 0.7 }),
  viaMetal: new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.9, roughness: 0.3 }),
  // Bay 3 — PCB & packaging
  pcbGreen: new THREE.MeshStandardMaterial({ color: 0x0f5132, metalness: 0.08, roughness: 0.62 }),
  pcbBlack: new THREE.MeshStandardMaterial({ color: 0x121519, metalness: 0.1, roughness: 0.6 }),
  enigGold: new THREE.MeshStandardMaterial({ color: 0xe5c158, metalness: 0.95, roughness: 0.18 }),
  bgaSolder: new THREE.MeshStandardMaterial({ color: 0xb5bcc4, metalness: 0.85, roughness: 0.25 }),
  epoxyDie: new THREE.MeshStandardMaterial({ color: 0x1f242c, metalness: 0.3, roughness: 0.5 }),
  interposerGrey: new THREE.MeshStandardMaterial({ color: 0x4a515c, metalness: 0.5, roughness: 0.4 }),
  aluHeatSpreader: new THREE.MeshStandardMaterial({ color: 0xb7bdc7, metalness: 0.9, roughness: 0.32 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.95, roughness: 0.28 }),
  aluminium: new THREE.MeshStandardMaterial({ color: 0xb7bdc7, metalness: 0.95, roughness: 0.22 }),
  // Bench & environment
  opticalBench: new THREE.MeshStandardMaterial({ color: 0x1d2126, metalness: 0.55, roughness: 0.85 }),
  esdMat: new THREE.MeshStandardMaterial({ color: 0x22262b, metalness: 0.1, roughness: 0.9 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 0.92, metalness: 0.1 }),
  plasticDark: new THREE.MeshStandardMaterial({ color: 0x1c212b, metalness: 0.35, roughness: 0.6 }),
  substrate: new THREE.MeshStandardMaterial({ color: 0x131720, metalness: 0.4, roughness: 0.35 }),
  glassShroud: new THREE.MeshPhysicalMaterial({
    color: 0xdde8f2,
    transparent: true,
    opacity: 0.14,
    roughness: 0.04,
    metalness: 0,
    transmission: 0.92,
    side: THREE.DoubleSide,
  }),
  dangerStripe: new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.25, roughness: 0.55 }),
} as const;

/** Dispose helper for bay rebuilds (mode switches). */
export function disposeGroup(group: THREE.Group): void {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    // Shared MAT instances are intentionally not disposed.
  });
}

/** Anodized-aluminum optical breadboard texture: matte slate with M6 hole grid. */
export function makeBreadboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1d2126';
  ctx.fillRect(0, 0, 512, 512);
  // Subtle machining noise.
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.008 + Math.random() * 0.012})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
  }
  // M6 tapped hole grid on 25 mm centers — 8 holes per tile edge.
  for (let x = 32; x < 512; x += 64) {
    for (let y = 32; y < 512; y += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#101318';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 1.5, y - 1.5, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(150,165,185,0.22)';
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
