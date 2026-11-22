import * as THREE from 'three';
import { BLACKBODY_STOPS } from '../data/reference.js';

/**
 * Thermal-camera shader: computed temperature → Planck/CIE blackbody RGB.
 * The colour ramp anchors are the verified stops from
 * 06_failure_physics_thresholds.json (300 K → 2500 K), injected as uniforms.
 */
const STOP_DATA = BLACKBODY_STOPS; // [{tK, rgb}] — exact verified values

function makeThermalMaterial(): THREE.ShaderMaterial {
  const stops = STOP_DATA.map((s) => new THREE.Vector3(s.rgb[0] / 255, s.rgb[1] / 255, s.rgb[2] / 255));
  return new THREE.ShaderMaterial({
    uniforms: {
      uTempK: { value: 300 },
      uStops: { value: stops },
      uStopsT: { value: STOP_DATA.map((s) => s.tK) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTempK;
      uniform vec3 uStops[7];
      uniform float uStopsT[7];
      varying vec2 vUv;
      vec3 blackbody(float tK) {
        if (tK <= uStopsT[0]) return uStops[0];
        for (int i = 0; i < 6; i++) {
          float a = uStopsT[i];
          float b = uStopsT[i + 1];
          if (tK >= a && tK <= b) {
            float f = (tK - a) / (b - a);
            return mix(uStops[i], uStops[i + 1], f);
          }
        }
        return uStops[6];
      }
      void main() {
        vec3 c = blackbody(uTempK);
        // faint scanline grid for the thermal-camera look
        float grid = step(0.97, fract(vUv.x * 24.0)) + step(0.97, fract(vUv.y * 24.0));
        c += grid * 0.05;
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
}

export interface ThermalEntry {
  mesh: THREE.Mesh;
  normalMaterial: THREE.Material;
  thermalMaterial: THREE.ShaderMaterial;
  getTempK: () => number;
}

/** Registry of meshes that participate in the thermal camera view. */
export class ThermalVisuals {
  private entries: ThermalEntry[] = [];
  viewOn = false;

  register(mesh: THREE.Mesh, getTempK: () => number): void {
    if (this.entries.some((e) => e.mesh === mesh)) return;
    this.entries.push({
      mesh,
      normalMaterial: mesh.material as THREE.Material,
      thermalMaterial: makeThermalMaterial(),
      getTempK,
    });
  }

  setView(on: boolean): void {
    this.viewOn = on;
    for (const e of this.entries) e.mesh.material = on ? e.thermalMaterial : e.normalMaterial;
  }

  update(): void {
    if (!this.viewOn) return;
    for (const e of this.entries) e.thermalMaterial.uniforms.uTempK.value = e.getTempK();
  }

  dispose(): void {
    for (const e of this.entries) e.thermalMaterial.dispose();
    this.entries = [];
  }
}

// ---------------------------------------------------------------------------
// WP-2.6 — forensic overlay: oxide-arc flash + char decal anchored at the
// KERNEL-REPORTED failing coordinates (forensicEvents bench mapping of the
// failing heat-grid cell). Created only from real threshold events; the
// layer self-disposes on forensic reset.
// ---------------------------------------------------------------------------

export interface BenchAnchor {
  x: number;
  y: number;
  z: number;
}

export interface ForensicOverlay {
  /** Oxide-arc flash: cold-white point light + brief spark burst at the anchor. */
  arcFlash(anchor: BenchAnchor): void;
  /** Charred decal burned onto the die plane at the anchor (persists). */
  charDecal(anchor: BenchAnchor): void;
  /** Dispose everything (forensic reset). */
  dispose(): void;
}

export function createForensicOverlay(scene: THREE.Scene): ForensicOverlay {
  const group = new THREE.Group();
  group.name = 'forensic-vfx';
  scene.add(group);
  const disposables: Array<THREE.Material | THREE.BufferGeometry | THREE.Texture> = [];
  const decals: THREE.Mesh[] = [];

  return {
    arcFlash(anchor) {
      // Point flash at the failing cell — brief, physics-triggered only.
      const light = new THREE.PointLight(0xbfdcff, 18, 6, 2);
      light.position.set(anchor.x, anchor.y + 0.25, anchor.z);
      group.add(light);
      // Spark burst: a small one-shot particle ring at the same coordinate.
      const sparkCount = 14;
      const positions = new Float32Array(sparkCount * 3);
      for (let i = 0; i < sparkCount; i++) {
        positions[i * 3] = anchor.x;
        positions[i * 3 + 1] = anchor.y + 0.05;
        positions[i * 3 + 2] = anchor.z;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color: 0xdfe9ff, size: 0.06, transparent: true, opacity: 0.9, depthWrite: false });
      const sparks = new THREE.Points(geo, mat);
      sparks.frustumCulled = false;
      group.add(sparks);
      disposables.push(geo, mat);
      // 450 ms flash lifetime (mirrors the oracle bay's arc flash window).
      setTimeout(() => {
        group.remove(light);
        group.remove(sparks);
        light.dispose();
      }, 450);
    },

    charDecal(anchor) {
      // Charred burn mark on the die plane at the failing cell (persists
      // until forensic reset — real damage evidence, never decorative).
      const geo = new THREE.CircleGeometry(0.09, 20);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0d0d0f,
        roughness: 0.95,
        metalness: 0.0,
        transparent: true,
        opacity: 0.88,
      });
      const decal = new THREE.Mesh(geo, mat);
      decal.rotation.x = -Math.PI / 2;
      decal.position.set(anchor.x, anchor.y - 0.015, anchor.z);
      decal.name = 'forensic-char-decal';
      group.add(decal);
      decals.push(decal);
      disposables.push(geo, mat);
    },

    dispose() {
      for (const d of disposables) d.dispose();
      disposables.length = 0;
      decals.length = 0;
      scene.remove(group);
      group.clear();
    },
  };
}
