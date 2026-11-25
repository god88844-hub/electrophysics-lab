import * as THREE from 'three';
import type { MaterialParams } from './rigSpec.mjs';
import { applyProceduralPbr, type PbrSurface } from '../materials.js';

/**
 * WP-5.4 — PBR material factory for the Quantum Lab rigs.
 *
 * Every material is built from a `MaterialParams` object that
 * `rigSpec.mjs` parsed directly out of the cad-specs 03 JSON strings
 * (e.g. "24k brushed gold #d4af37, metalness 0.92, roughness 0.24") —
 * the renderer never invents colors or PBR coefficients. Materials are
 * cached per parsed params so rig rebuilds share GPU programs (iGPU
 * budget, Builder Law 4).
 */

const cache = new Map<string, THREE.Material>();

function surfaceFor(label: string): PbrSurface | undefined {
  if (label.startsWith('stage-') || /^(qubit-pads|jj-markers|mzi-coupler)$/.test(label)) return 'gold';
  if (/^(canister|coax-lines|support-rods|uhv-chamber|optical-table|cpw-resonators)$/.test(label)) return 'aluminum';
  if (label === 'thermal-straps') return 'copper';
  if (label === 'transmon-substrate') return 'sapphire';
  if (/^(mzi-substrate|mzi-waveguides)$/.test(label)) return 'silicon';
  return undefined;
}
function key(p: MaterialParams): string {
  return `${p.colorHex}|${p.metalness}|${p.roughness}|${p.clearcoat}|${surfaceFor(p.label) ?? ""}`;
}

/** Standard PBR material; upgrades to a clearcoat physical material when the spec string carries one. */
export function materialFor(p: MaterialParams): THREE.MeshStandardMaterial {
  const k = key(p);
  const hit = cache.get(k);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const mat =
    p.clearcoat > 0
      ? new THREE.MeshPhysicalMaterial({
          color: p.colorHex,
          metalness: p.metalness,
          roughness: p.roughness,
          clearcoat: p.clearcoat,
          clearcoatRoughness: Math.max(0.05, p.roughness * 0.8),
        })
      : new THREE.MeshStandardMaterial({
          color: p.colorHex,
          metalness: p.metalness,
          roughness: p.roughness,
        });
  const surface = surfaceFor(p.label);
  if (surface === 'sapphire' && mat instanceof THREE.MeshPhysicalMaterial) {
    mat.transmission = 0.78;
    mat.ior = 1.76;
  }
  if (surface) applyProceduralPbr(mat, surface);
  mat.name = p.label;
  cache.set(k, mat);
  return mat as THREE.MeshStandardMaterial;
}

/** Emissive variant for beam/energy presentation (hue still spec-parsed). */
export function emissiveMaterialFor(p: MaterialParams, emissiveIntensity: number): THREE.MeshStandardMaterial {
  const k = `${key(p)}|e${emissiveIntensity}`;
  const hit = cache.get(k);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const base = materialFor(p);
  const mat = new THREE.MeshStandardMaterial({
    color: p.colorHex,
    emissive: p.colorHex,
    emissiveIntensity,
    metalness: Math.min(p.metalness, 0.3),
    roughness: Math.max(p.roughness, 0.3),
  });
  mat.name = `${p.label}-emissive`;
  cache.set(k, mat);
  void base;
  return mat;
}

/** Translucent beam/viewport material (hues from parsed spec values). */
export function beamMaterialFor(colorHex: number, opacity: number, name: string): THREE.MeshBasicMaterial {
  const k = `beam|${colorHex}|${opacity}`;
  const hit = cache.get(k);
  if (hit) return hit as THREE.MeshBasicMaterial;
  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  mat.name = name;
  cache.set(k, mat);
  return mat;
}
