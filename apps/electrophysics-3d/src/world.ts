import * as THREE from 'three';
import { ElectronFlow } from './engine/electronFlow.js';
import { MAT } from './bays/materials.js';
import { makeTextSprite } from './engine/labels.js';
import { Bay1Quantum, type Bay1Mode } from './bays/bay1Quantum.js';
import { Bay2Foundry } from './bays/bay2Foundry.js';
import { Bay3Soc } from './bays/bay3Soc.js';
import { Bay4Forensics } from './bays/bay4Forensics.js';
import { Bay5Library } from './bays/bay5Library.js';
import { REFERENCE } from './data/reference.js';

export const BAY_DEFS = [
  { id: 1, name: 'Quantum Cryo & Optics', color: 0x4fc3f7, x: -16 },
  { id: 2, name: 'Silicon Foundry & Multi-Radix', color: 0xffc107, x: -8 },
  { id: 3, name: 'Full-Chip & Unified-Memory SoC', color: 0x26c6da, x: 0 },
  { id: 4, name: 'Failure Forensics Vault', color: 0xff6d5a, x: 8 },
  { id: 5, name: 'Offline Physics Library', color: 0x9fd0ff, x: 16 },
] as const;

export type BayNumber = 1 | 2 | 3 | 4 | 5;

/** Curve decorator that adds a live Y offset — flow pulses ride layer peels. */
class OffsetCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private base: THREE.Curve3,
    private getOffsetY: () => number
  ) {
    super();
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const p = this.base.getPoint(t, optionalTarget);
    p.y += this.getOffsetY();
    return p;
  }
}

export interface WorldCallbacks {
  onFps?: (fps: number) => void;
}

/**
 * The full laboratory world: five cleanly separated bays on a shared studio
 * floor, click-to-glide navigation, and the electron-pulse flow system whose
 * speed/brightness come from computed physics (nominal analytic currents in
 * M4; live MNA results from M5 onward).
 */
export class LabWorld {
  readonly scene: THREE.Scene;
  readonly bayCenters: THREE.Vector3[] = [];
  readonly bay1: Bay1Quantum;
  readonly bay2: Bay2Foundry;
  readonly bay3: Bay3Soc;
  readonly bay4: Bay4Forensics;
  readonly bay5: Bay5Library;
  readonly flow: ElectronFlow;
  private pedestals: THREE.Mesh[] = [];
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private holoMeshes: THREE.Mesh[] = [];
  private flowIndexById = new Map<string, number>();
  /** Baseline (nominal) per-path activity — replaced by live solver data in M5. */
  private baselineActivity: Array<{ speed: number; brightness: number }> = [];

  constructor(scene: THREE.Scene, private callbacks: WorldCallbacks = {}) {
    this.scene = scene;
    this.buildFloor();
    this.bay1 = new Bay1Quantum();
    this.bay2 = new Bay2Foundry();
    this.bay3 = new Bay3Soc();
    this.bay4 = new Bay4Forensics();
    this.bay5 = new Bay5Library();
    for (const def of BAY_DEFS) {
      this.bayCenters.push(new THREE.Vector3(def.x, 1.3, 0));
    }
    this.bay1.group.position.set(BAY_DEFS[0].x, 0, 0);
    this.bay2.group.position.set(BAY_DEFS[1].x, 0, 0);
    this.bay3.group.position.set(BAY_DEFS[2].x, 0, 0);
    this.bay4.group.position.set(BAY_DEFS[3].x, 0, 0);
    this.bay5.group.position.set(BAY_DEFS[4].x, 0, 0);
    scene.add(this.bay1.group, this.bay2.group, this.bay3.group, this.bay4.group, this.bay5.group);
    this.buildPedestals();
    this.buildFlowSystem();
  }

  private buildFloor(): void {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 46), MAT.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);
    const grid = new THREE.GridHelper(80, 80, 0x1e3a5f, 0x111a28);
    grid.position.y = 0.005;
    this.scene.add(grid);
    // Bay divider strips (cleanly separated labs).
    for (const x of [-12, -4, 4, 12]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 40), new THREE.MeshStandardMaterial({ color: 0x223047, roughness: 0.8 }));
      strip.position.set(x, 0.01, 0);
      this.scene.add(strip);
    }
  }

  private buildPedestals(): void {
    for (const def of BAY_DEFS) {
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.4, 0.22, 36),
        new THREE.MeshStandardMaterial({ color: def.color, metalness: 0.65, roughness: 0.35, transparent: true, opacity: 0.22 })
      );
      pedestal.position.set(def.x, 0.11, 6.5);
      pedestal.userData = { bayId: def.id };
      pedestal.name = `pedestal-${def.id}`;
      this.scene.add(pedestal);
      this.pedestals.push(pedestal);

      const label = makeTextSprite(`${def.id} · ${def.name}`, { scale: 0.95, color: '#cfe2f7' });
      label.position.set(def.x, 1.1, 6.5);
      this.scene.add(label);

      // Ambient accent light per bay (cheap, no shadows).
      const accent = new THREE.PointLight(def.color, 2.2, 12, 2);
      accent.position.set(def.x, 4.4, 2.5);
      this.scene.add(accent);
    }
  }

  private buildFlowSystem(): void {
    this.flow = new ElectronFlow(this.scene);
    // Bay 2 die supply rails — nominal current from sheet resistance analysis:
    // met2 rail 0.125 Ω/sq, supply droop budget P = V²/R → I = V/R_eff.
    const vdd = REFERENCE.semiconductor.parameters.sky130a.nominal_vdd_v as number;
    const met2 = REFERENCE.semiconductor.parameters.sky130a.metal_stack.met2 as { sheet_resistance_ohm_per_sq: number };
    const railR = met2.sheet_resistance_ohm_per_sq * 40; // 40 squares rail estimate
    const iRail = vdd / railR; // ≈ 0.36 A — speed/brightness scale from this
    for (const fc of this.bay2.flowCurves) {
      const color = fc.radix === 'q4' ? new THREE.Color(0xffc46b) : new THREE.Color(0x9fd0ff);
      // Decorate with live layer offsets so pulses ride the layer-peel slicer.
      const layerKey = fc.id === 'vdd-met2' ? 'met2' : 'met3';
      const ridingCurve = new OffsetCurve(fc.curve, () => this.bay2.getLayerOffsetY(layerKey));
      this.flow.addPath({ curve: ridingCurve, color, nominalCurrent: iRail });
      this.flowIndexById.set(fc.id, this.flow.activityCount() - 1);
      this.baselineActivity.push({ speed: 0.75, brightness: 0.55 });
    }
    // Bay 3 bus fabric — nominal activity from reference benchmark traffic.
    for (const fc of this.bay3.flowCurves) {
      this.flow.addPath({ curve: fc.curve, color: new THREE.Color(0x6fd0ff), nominalCurrent: 0.4 });
      this.flowIndexById.set(fc.id, this.flow.activityCount() - 1);
      this.baselineActivity.push({ speed: 0.5, brightness: 0.4 });
    }
  }

  /** Map a live physics snapshot onto flow activity (M5 wires this to the worker). */
  setFlowActivity(id: string, speed: number, brightness: number, color?: THREE.Color): void {
    const idx = this.flowIndexById.get(id);
    if (idx !== undefined) this.flow.setActivity(idx, { speed, brightness, color });
  }

  resetFlowToBaseline(): void {
    let i = 0;
    for (const [id] of this.flowIndexById) {
      const base = this.baselineActivity[i] ?? { speed: 0.5, brightness: 0.4 };
      this.flow.setActivity(i, { ...base, color: id.includes('vdd') || id.startsWith('bus') ? new THREE.Color(0x6fd0ff) : undefined });
      i++;
    }
  }

  /** Raycast pedestals; returns bay id or null. Wired into CameraRig pick. */
  pickBay(ndcX: number, ndcY: number, camera: THREE.PerspectiveCamera): number | null {
    this.pointerNdc.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.pointerNdc, camera);
    const hits = this.raycaster.intersectObjects(this.pedestals, false);
    if (hits.length > 0) {
      return (hits[0].object.userData as { bayId: number }).bayId;
    }
    return null;
  }

  setBay1Mode(mode: Bay1Mode): void {
    this.bay1.setMode(mode);
  }

  setLayerPeel(exploded: boolean, depth: number): void {
    this.bay2.setPeelTargets(exploded ? 1 : 0, depth);
  }

  setNpuAttached(attached: boolean): void {
    this.bay3.setNpuAttached(attached);
  }

  setSoCDisassembled(v: boolean): void {
    this.bay3.setDisassembled(v ? 1 : 0);
  }

  update(dt: number, camera: THREE.PerspectiveCamera, frame: number): void {
    this.bay1.update(dt, performance.now() * 0.001);
    this.bay2.update(dt);
    this.bay3.update(dt);
    this.bay4.update(dt, performance.now() * 0.001);
    this.bay5.update(dt, performance.now() * 0.001);
    // Sim-time-integrated pulse advance (1 sim step per rendered frame).
    this.flow.update(dt, 1);
    // Pedestal pulse highlight when hovering is skipped; subtle idle bob:
    this.pedestals.forEach((p, i) => {
      p.position.y = 0.11 + Math.sin(performance.now() * 0.001 + i) * 0.012;
    });
    void camera;
    void frame;
  }

  dispose(): void {
    this.flow.dispose();
  }
}
