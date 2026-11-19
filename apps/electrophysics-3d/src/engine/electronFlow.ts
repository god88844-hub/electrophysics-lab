import * as THREE from 'three';

export interface FlowPath {
  curve: THREE.Curve3;
  /** Base hue of the charge packets (set from node voltage / radix). */
  color: THREE.Color;
  /** Nominal DC current in A — used to derive baseline speed (I = V/R analysis). */
  nominalCurrent: number;
}

export interface FlowActivity {
  /** Speed multiplier: 0 = stopped (no current), 1 = nominal, >1 = overdrive. */
  speed: number;
  /** Emissive brightness multiplier. */
  brightness: number;
  /** Optional per-frame colour override (voltage-coded). */
  color?: THREE.Color;
}

/**
 * Real-time electron/signal pulses along metal traces, rendered with one
 * InstancedMesh per path (cheap on integrated GPUs). Speed and brightness are
 * driven strictly by computed node currents I(t) and voltages V(t) — never by
 * decorative animation.
 */
export class ElectronFlow {
  private entries: Array<{
    path: FlowPath;
    mesh: THREE.InstancedMesh;
    params: Float32Array; // per-instance s ∈ [0,1)
    activity: FlowActivity;
  }> = [];
  private dummy = new THREE.Object3D();
  private pulseColor = new THREE.Color();
  private baseColor = new THREE.Color();

  constructor(
    private scene: THREE.Scene,
    private instancesPerPath = 14
  ) {}

  addPath(path: FlowPath): string {
    const geometry = new THREE.SphereGeometry(0.045, 8, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geometry, material, this.instancesPerPath);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.instancesPerPath * 3), 3);
    mesh.frustumCulled = false;
    const params = new Float32Array(this.instancesPerPath);
    for (let i = 0; i < this.instancesPerPath; i++) {
      params[i] = i / this.instancesPerPath;
    }
    this.scene.add(mesh);
    const id = `flow-${this.entries.length}`;
    this.entries.push({ path, mesh, params, activity: { speed: 1, brightness: 1 } });
    return id;
  }

  setActivity(index: number, activity: FlowActivity): void {
    if (this.entries[index]) this.entries[index].activity = activity;
  }

  activityCount(): number {
    return this.entries.length;
  }

  update(dt: number, simSpeed = 1): void {
    for (const entry of this.entries) {
      const { path, mesh, params, activity } = entry;
      const curve = path.curve;
      const advance = activity.speed * simSpeed * 0.22 * dt;
      const brightness = Math.max(0, activity.brightness);
      if (activity.color) this.baseColor.copy(activity.color);
      else this.baseColor.copy(path.color);

      for (let i = 0; i < params.length; i++) {
        params[i] = (params[i] + advance) % 1;
        const p = curve.getPointAt(Math.min(0.999, params[i]));
        this.dummy.position.copy(p);
        // Fade packets near path ends for a smooth flow illusion.
        const s = params[i];
        const edgeFade = Math.min(1, Math.min(s, 1 - s) * 6);
        this.pulseColor.copy(this.baseColor).multiplyScalar(brightness * edgeFade + 0.05);
        mesh.setColorAt(i, this.pulseColor);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }

  dispose(): void {
    for (const e of this.entries) {
      this.scene.remove(e.mesh);
      e.mesh.geometry.dispose();
      (e.mesh.material as THREE.Material).dispose();
    }
    this.entries = [];
  }
}
