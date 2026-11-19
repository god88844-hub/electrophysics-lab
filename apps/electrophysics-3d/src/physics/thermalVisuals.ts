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
