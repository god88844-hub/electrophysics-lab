import * as THREE from 'three';

export interface FlowPath {
  id: string;
  curve: THREE.Curve<THREE.Vector3>;
  color: THREE.Color;
}

interface FlowEntry {
  path: FlowPath;
  mesh: THREE.InstancedMesh;
  params: Float32Array;
  speed: number;
  brightness: number;
  color?: THREE.Color;
}

/** Workspace-owned pulses. They start hidden and require a live current sample. */
export class ElectronFlow {
  private entries: FlowEntry[] = [];
  private geometry = new THREE.SphereGeometry(0.045, 8, 6);
  private material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  private dummy = new THREE.Object3D();
  private pulseColor = new THREE.Color();

  constructor(
    private owner: THREE.Group,
    private instancesPerPath = 14
  ) {}

  addPath(path: FlowPath): number {
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, this.instancesPerPath);
    mesh.name = `electron-flow:${path.id}`;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.instancesPerPath * 3), 3);
    mesh.frustumCulled = false;
    mesh.visible = false;
    // Pulses are indicators and do not intercept CAD trace selection.
    mesh.raycast = () => {};
    this.owner.add(mesh);
    const entry: FlowEntry = {
      path, mesh, params: new Float32Array(this.instancesPerPath), speed: 0, brightness: 0,
    };
    this.reset(entry);
    return this.entries.push(entry) - 1;
  }

  setActivity(index: number, speed: number, brightness: number, color?: THREE.Color): void {
    const entry = this.entries[index];
    if (!entry) return;
    if (!(Number.isFinite(speed) && speed > 0 && Number.isFinite(brightness) && brightness > 0)) {
      this.reset(entry);
      return;
    }
    entry.speed = speed;
    entry.brightness = brightness;
    entry.color = color;
  }

  clear(): void {
    for (const entry of this.entries) {
      if (entry.speed > 0 || entry.mesh.visible) this.reset(entry);
    }
  }

  private reset(entry: FlowEntry): void {
    entry.mesh.visible = false;
    entry.speed = 0;
    entry.brightness = 0;
    entry.color = undefined;
    for (let i = 0; i < entry.params.length; i++) entry.params[i] = i / entry.params.length;
  }

  update(dt: number): void {
    if (!this.owner.visible) return;
    for (const { path, mesh, params, speed, brightness, color } of this.entries) {
      if (speed === 0) continue;
      const advance = speed * 0.22 * dt;
      for (let i = 0; i < params.length; i++) {
        const s = params[i] = (params[i] + advance) % 1;
        path.curve.getPointAt(Math.min(0.999, s), this.dummy.position);
        const edgeFade = Math.min(1, Math.min(s, 1 - s) * 6);
        this.pulseColor.copy(color ?? path.color).multiplyScalar(brightness * edgeFade + 0.05);
        mesh.setColorAt(i, this.pulseColor);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.visible = true;
    }
  }

  dispose(): void {
    for (const entry of this.entries) {
      entry.mesh.removeFromParent();
      entry.mesh.dispose();
    }
    this.entries.length = 0;
    this.geometry.dispose();
    this.material.dispose();
  }
}
