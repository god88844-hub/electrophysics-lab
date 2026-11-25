import * as THREE from 'three';
import { createPbrTextureCache, PBR_SURFACES } from './pbrTextures.js';

export type PbrSurface = 'aluminum' | 'gold' | 'brass' | 'copper' | 'silicon' |
  'fr4-green' | 'fr4-black' | 'glass' | 'sapphire';

const pbrCache = createPbrTextureCache((spec: { data: Uint8Array<ArrayBuffer>; size: number; colorSpace: string }, name: string) => {
  const texture = new THREE.DataTexture(spec.data, spec.size, spec.size, THREE.RGBAFormat);
  texture.name = name;
  texture.colorSpace = spec.colorSpace === 'srgb' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
});

/** Each material owns one cache lease. Shared MAT lives with the workbench. */
export function applyProceduralPbr<T extends THREE.MeshStandardMaterial>(material: T, surface: PbrSurface): T {
  if (!PBR_SURFACES.includes(surface)) throw new RangeError('Unknown material finish');
  const { maps, release } = pbrCache.acquire(surface);
  material.map = maps.albedo;
  material.normalMap = maps.normal;
  material.roughnessMap = maps.roughness;
  material.normalScale.setScalar(surface === 'glass' || surface === 'sapphire' ? 0.045 : 0.23);
  if (maps.metalness) {
    material.color.setHex(0xffffff);
    material.metalness = 1;
    material.metalnessMap = maps.metalness;
  }
  material.userData.pbrSurface = surface;
  const dispose = () => {
    material.removeEventListener('dispose', dispose);
    release();
    pbrCache.disposeUnused();
  };
  material.addEventListener('dispose', dispose);
  return material;
}

/**
 * Authentic physical laboratory materials (M8 digital-twin pass).
 * Colors/roughness follow the real-world reference values requested for the
 * photorealistic cleanroom bench: 24k brushed gold OFHC plates, electroplated
 * copper interconnect, ENIG gold pads, matte FR-4, anodized aluminum optics
 * bench. Physics constants still come from data/reference-library/*.json.
 */
export const MAT = {
  // Bay 1 — quantum cryostat
  brushedGold: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.92, roughness: 0.24 }), 'gold'),
  goldPolished: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xe8c860, metalness: 0.95, roughness: 0.12 }), 'gold'),
  ofhcCopper: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.95, roughness: 0.3 }), 'copper'),
  braidedStrap: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x8a6f4d, metalness: 0.8, roughness: 0.55 }), 'brass'),
  niobiumSilver: new THREE.MeshStandardMaterial({ color: 0xaab2bd, metalness: 0.9, roughness: 0.28 }),
  sapphireDie: applyProceduralPbr(new THREE.MeshPhysicalMaterial({ color: 0x10141c, metalness: 0, transmission: 0.85, ior: 1.76, roughness: 0.08, clearcoat: 0.8, clearcoatRoughness: 0.1 }), 'sapphire'),
  braidedCoax: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.85, roughness: 0.42 }), 'aluminum'),
  stainless: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.9, roughness: 0.3 }), 'aluminum'),
  matteSteel: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x565c66, metalness: 0.75, roughness: 0.55 }), 'aluminum'),
  vacuumShroud: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x3a4048, metalness: 0.7, roughness: 0.45 }), 'aluminum'),
  // Bay 2 — silicon foundry (true foundry layer colors)
  waferDark: applyProceduralPbr(new THREE.MeshPhysicalMaterial({ color: 0x3a424d, metalness: 0.85, roughness: 0.18, clearcoat: 0.65, clearcoatRoughness: 0.15, iridescence: 0.27, iridescenceThicknessRange: [130, 320] }), 'silicon'),
  siliconDie: applyProceduralPbr(new THREE.MeshPhysicalMaterial({ color: 0x2a313c, metalness: 0.6, roughness: 0.14, clearcoat: 0.5, iridescence: 0.16 }), 'silicon'),
  psub: new THREE.MeshStandardMaterial({ color: 0x3d4450, metalness: 0.3, roughness: 0.5 }),
  nwell: new THREE.MeshStandardMaterial({ color: 0x6a6a3f, metalness: 0.35, roughness: 0.45 }),
  polyGate: new THREE.MeshStandardMaterial({ color: 0x8a3f38, metalness: 0.3, roughness: 0.5 }),
  li1Tungsten: new THREE.MeshStandardMaterial({ color: 0x8f949c, metalness: 0.8, roughness: 0.35 }),
  met1Blue: new THREE.MeshStandardMaterial({ color: 0x3d6a8a, metalness: 0.8, roughness: 0.3 }),
  met2Copper: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.92, roughness: 0.26 }), 'copper'),
  met3Gold: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.92, roughness: 0.22 }), 'gold'),
  sio2Glass: applyProceduralPbr(new THREE.MeshPhysicalMaterial({ color: 0xaebfcf, transparent: true, opacity: 0.22, roughness: 0.06, metalness: 0, transmission: 0.7 }), 'glass'),
  viaMetal: new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.9, roughness: 0.3 }),
  // Bay 3 — PCB & packaging
  pcbGreen: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x0f5132, metalness: 0.08, roughness: 0.62 }), 'fr4-green'),
  pcbBlack: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x121519, metalness: 0.1, roughness: 0.6 }), 'fr4-black'),
  enigGold: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xe5c158, metalness: 0.95, roughness: 0.18 }), 'gold'),
  bgaSolder: new THREE.MeshStandardMaterial({ color: 0xb5bcc4, metalness: 0.85, roughness: 0.25 }),
  epoxyDie: new THREE.MeshStandardMaterial({ color: 0x1f242c, metalness: 0.3, roughness: 0.5 }),
  interposerGrey: new THREE.MeshStandardMaterial({ color: 0x4a515c, metalness: 0.5, roughness: 0.4 }),
  aluHeatSpreader: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xb7bdc7, metalness: 0.9, roughness: 0.32 }), 'aluminum'),
  copper: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.95, roughness: 0.28 }), 'copper'),
  aluminium: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0xb7bdc7, metalness: 0.95, roughness: 0.22 }), 'aluminum'),
  // Bench & environment
  opticalBench: applyProceduralPbr(new THREE.MeshStandardMaterial({ color: 0x1d2126, metalness: 0.55, roughness: 0.85 }), 'aluminum'),
  esdMat: new THREE.MeshStandardMaterial({ color: 0x22262b, metalness: 0.1, roughness: 0.9 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 0.92, metalness: 0.1 }),
  plasticDark: new THREE.MeshStandardMaterial({ color: 0x1c212b, metalness: 0.35, roughness: 0.6 }),
  substrate: new THREE.MeshStandardMaterial({ color: 0x131720, metalness: 0.4, roughness: 0.35 }),
  glassShroud: applyProceduralPbr(new THREE.MeshPhysicalMaterial({
    color: 0xdde8f2,
    transparent: true,
    opacity: 0.14,
    roughness: 0.04,
    metalness: 0,
    transmission: 0.92,
    side: THREE.DoubleSide,
  }), 'glass'),
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
  // Seeded machining noise, fixed across calls.
  let seed = 72;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.008 + random() * 0.012})`;
    ctx.fillRect(random() * 512, random() * 512, 1.5, 1.5);
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
