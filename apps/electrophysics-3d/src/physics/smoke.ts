import * as THREE from 'three';

/**
 * Lightweight sprite-particle smoke/vapour system (delamination smoke,
 * fusing break, cryo quench vapour). Not a physics claim — a visual cue
 * anchored to real computed failure events.
 */
export class SmokeSystem {
  private points: THREE.Points;
  private positions: Float32Array;
  private velocities: Float32Array;
  private life: Float32Array;
  private maxLife: Float32Array;
  private count: number;
  private cursor = 0;
  private color: THREE.Color;

  constructor(scene: THREE.Scene, count = 220, color = 0x9aa4b0, size = 0.22) {
    this.count = count;
    this.color = new THREE.Color(color);
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    this.maxLife = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      this.positions[i * 3 + 1] = -100;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,0.85)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({
      size,
      map: tex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: this.color,
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  setColor(hex: number): void {
    (this.points.material as THREE.PointsMaterial).color.setHex(hex);
  }

  spawn(origin: THREE.Vector3, n = 12, spread = 0.15, upSpeed = 0.7): void {
    for (let k = 0; k < n; k++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.count;
      this.positions[i * 3] = origin.x + (Math.random() - 0.5) * spread;
      this.positions[i * 3 + 1] = origin.y + Math.random() * 0.05;
      this.positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;
      this.velocities[i * 3] = (Math.random() - 0.5) * 0.25;
      this.velocities[i * 3 + 1] = upSpeed * (0.6 + Math.random() * 0.8);
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      this.life[i] = 1;
      this.maxLife[i] = 2.2 + Math.random() * 1.6;
    }
  }

  /**
   * WP-2.6 — spawn from a KERNEL-REPORTED failing coordinate (bench-space
   * position mapped by forensicEvents from the failing heat-grid cell).
   * VFX only ever triggers from real threshold events carrying an anchor.
   */
  spawnAnchored(anchor: { x: number; y: number; z: number }, n = 12, spread = 0.15, upSpeed = 0.7): void {
    this.spawn(new THREE.Vector3(anchor.x, anchor.y, anchor.z), n, spread, upSpeed);
  }

  update(dt: number): void {
    const pos = this.positions;
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt / this.maxLife[i];
      pos[i * 3] += this.velocities[i * 3] * dt;
      pos[i * 3 + 1] += this.velocities[i * 3 + 1] * dt;
      pos[i * 3 + 2] += this.velocities[i * 3 + 2] * dt;
      this.velocities[i * 3 + 1] *= 1 - dt * 0.15;
      if (this.life[i] <= 0) pos[i * 3 + 1] = -100;
    }
    (this.points.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (this.points.material as THREE.PointsMaterial).opacity = 0.5;
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.PointsMaterial).map?.dispose();
    (this.points.material as THREE.Material).dispose();
    this.points.parent?.remove(this.points);
  }
}
