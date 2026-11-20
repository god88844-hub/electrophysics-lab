import * as THREE from 'three';

export interface RigCameraSource {
  activeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  useOrtho: boolean;
}

/**
 * Damped glide camera: click-to-glide between bays, left-drag orbit, wheel
 * zoom, WASD ground-plane panning, Q/E height. All motion is exponentially
 * damped (frame-rate independent) for a smooth game-like feel.
 */
export class CameraRig {
  target = new THREE.Vector3(0, 1.0, 0);
  goalTarget = new THREE.Vector3(0, 1.0, 0);
  radius = 16;
  goalRadius = 16;
  azimuth = Math.PI * 0.06;
  goalAzimuth = Math.PI * 0.06;
  elevation = 0.42; // radians above ground plane
  goalElevation = 0.42;
  upHint = new THREE.Vector3(0, 1, 0);

  /** Set by LabWorld: returns a bay id if the pointer hits a pedestal. */
  pickHandler: ((ndcX: number, ndcY: number) => number | null) | null = null;

  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private keys = new Set<string>();
  private keyDown = (e: KeyboardEvent): void => {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e'].includes(k)) this.keys.add(k);
  };
  private keyUp = (e: KeyboardEvent): void => this.keys.delete(e.key.toLowerCase());

  constructor(public cameraSource: RigCameraSource, private dom: HTMLElement) {
    dom.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (this.pickHandler) {
        const rect = dom.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        const bay = this.pickHandler(ndcX, ndcY);
        if (bay !== null) return; // world already handled the glide
      }
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      dom.setPointerCapture(e.pointerId);
    });
    dom.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.goalAzimuth -= dx * 0.005;
      this.goalElevation = THREE.MathUtils.clamp(this.goalElevation + dy * 0.004, 0.08, 1.35);
    });
    const endDrag = () => {
      this.dragging = false;
    };
    dom.addEventListener('pointerup', endDrag);
    dom.addEventListener('pointercancel', endDrag);
    dom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.goalRadius = THREE.MathUtils.clamp(this.goalRadius + e.deltaY * 0.02, 4, 40);
      },
      { passive: false }
    );
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
  }

  /** Glide to a bay: retarget orbit centre + comfortable framing. */
  glideTo(center: THREE.Vector3, radius = 10): void {
    this.goalTarget.copy(center);
    this.goalRadius = radius;
  }

  /** Snap the orbit to a preset view direction (ViewCube). */
  setPresetView(dir: THREE.Vector3, up: THREE.Vector3): void {
    const d = dir.clone().normalize();
    this.goalAzimuth = Math.atan2(d.x, d.z);
    this.goalElevation = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(d.y, -1, 1)), -1.35, 1.5);
    this.upHint = up.clone();
  }

  update(dt: number): void {
    // WASD/QE pan relative to current azimuth.
    const speed = 6 * dt;
    const fwd = new THREE.Vector3(Math.sin(this.azimuth + Math.PI), 0, Math.cos(this.azimuth + Math.PI));
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    if (this.keys.has('w')) this.goalTarget.addScaledVector(fwd, speed);
    if (this.keys.has('s')) this.goalTarget.addScaledVector(fwd, -speed);
    if (this.keys.has('a')) this.goalTarget.addScaledVector(right, -speed);
    if (this.keys.has('d')) this.goalTarget.addScaledVector(right, speed);
    if (this.keys.has('q')) this.goalTarget.y += speed * 0.7;
    if (this.keys.has('e')) this.goalTarget.y -= speed * 0.7;
    this.goalTarget.y = THREE.MathUtils.clamp(this.goalTarget.y, 0.3, 10);

    // Exponential damping — smooth glide at any framerate.
    const k = 1 - Math.exp(-4.2 * dt);
    this.target.lerp(this.goalTarget, k);
    this.radius += (this.goalRadius - this.radius) * k;
    this.azimuth += (this.goalAzimuth - this.azimuth) * k;
    this.elevation += (this.goalElevation - this.elevation) * k;

    const cam = this.cameraSource.activeCamera;
    if (this.cameraSource.useOrtho) {
      const ortho = cam as THREE.OrthographicCamera;
      // Ortho zoom tracks the orbit radius (base radius 16 → zoom 1).
      const zoom = Math.max(0.2, 16 / this.radius);
      ortho.zoom = zoom;
      ortho.position.set(
        this.target.x + Math.sin(this.azimuth) * 20 * Math.cos(this.elevation),
        this.target.y + 20 * Math.sin(this.elevation) || 8,
        this.target.z + Math.cos(this.azimuth) * 20 * Math.cos(this.elevation)
      );
      ortho.up.copy(this.upHint);
      ortho.lookAt(this.target);
      ortho.updateProjectionMatrix();
    } else {
      const pos = new THREE.Vector3(
        this.target.x + this.radius * Math.sin(this.azimuth) * Math.cos(this.elevation),
        this.target.y + this.radius * Math.sin(this.elevation),
        this.target.z + this.radius * Math.cos(this.azimuth) * Math.cos(this.elevation)
      );
      const persp = cam as THREE.PerspectiveCamera;
      persp.up.copy(this.upHint);
      persp.position.copy(pos);
      persp.lookAt(this.target);
    }
  }
}
