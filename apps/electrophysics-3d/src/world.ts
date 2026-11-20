import * as THREE from 'three';
import { ElectronFlow } from './engine/electronFlow.js';
import { MAT } from './bays/materials.js';
import { makeTextSprite } from './engine/labels.js';
import { makeBreadboardTexture } from './bays/materials.js';
import { Bay1Quantum, type Bay1Mode } from './bays/bay1Quantum.js';
import { Bay2Foundry } from './bays/bay2Foundry.js';
import { Bay3Soc } from './bays/bay3Soc.js';
import { Bay4Forensics } from './bays/bay4Forensics.js';
import { Bay5Library } from './bays/bay5Library.js';
import { REFERENCE } from './data/reference.js';
import { ThermalVisuals } from './physics/thermalVisuals.js';
import { SmokeSystem } from './physics/smoke.js';
import { tempToRGBf } from '@physics/blackbody.mjs';
import type { PhysicsSnapshot, FaultFx } from './physics/physicsClient.js';

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
  readonly thermal = new ThermalVisuals();
  private smokeDie!: SmokeSystem;
  private smokeCryo!: SmokeSystem;
  private railTubeMat?: THREE.MeshStandardMaterial;
  /** Q4 voltage-level → flow colour (03_multiradix_logic_baselines.json levels). */
  private static Q4_COLORS: Record<string, number> = {
    '0': 0x4a5568,
    '0.6': 0xff9d5c,
    '1.2': 0xffc46b,
    '1.8': 0xffe08a,
  };

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
    this.smokeDie = new SmokeSystem(scene, 200, 0x8a949f, 0.26);
    this.smokeCryo = new SmokeSystem(scene, 160, 0xaad4ff, 0.3);
    this.registerThermalMeshes();
  }

  /** Register trace/tile/DUT meshes with the thermal-camera system. */
  private registerThermalMeshes(): void {
    // Bay 2 supply rail tube (temperature-driven).
    const met2Group = this.bay2.group.children.find((c) => c.name === 'layer-met2') as THREE.Group | undefined;
    if (met2Group) {
      const tube = met2Group.children.find((c) => (c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry?.type === 'TubeGeometry') as THREE.Mesh | undefined;
      if (tube) {
        this.railTubeMat = tube.material as THREE.MeshStandardMaterial;
        const bayX = BAY_DEFS[1].x;
        this.thermal.register(tube, () => this.lastSnapshot?.temps?.traceC != null ? this.lastSnapshot.temps.traceC + 273.15 : 300);
        void bayX;
      }
    }
    // Bay 3 tile thermal planes.
    for (const tile of this.bay3.tiles) {
      this.thermal.register(tile.thermalPlane, () => (this.lastSnapshot?.temps?.tiles?.[tile.id] ?? 45) + 273.15);
    }
    // Bay 4 DUT.
    const dut = this.bay4.group.getObjectByName('dutChip');
    if (dut) this.thermal.register(dut as THREE.Mesh, () => (this.lastSnapshot?.temps?.junctionC ?? 27) + 273.15);
  }

  private lastSnapshot: PhysicsSnapshot | null = null;

  private sandboxGroup = new THREE.Group();

  /** Render user-placed sandbox components on the Bay 2 bench (real meshes). */
  setSandboxComponents(components: Array<{ id: string; kind: string; position: [number, number] }>): void {
    this.bay2.group.add(this.sandboxGroup);
    for (const child of [...this.sandboxGroup.children]) {
      this.sandboxGroup.remove(child);
    }
    for (const c of components) {
      const [sx, sz] = c.position;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.16, 0.34),
        new THREE.MeshStandardMaterial({ color: 0x5a4a38, metalness: 0.6, roughness: 0.4 })
      );
      mesh.position.set(-2 + sx * 1.4, this.bay2.layerY('met3') + 0.35, -1.4 + sz * 1.2);
      mesh.castShadow = true;
      mesh.name = 'sandbox-' + c.id;
      this.sandboxGroup.add(mesh);
      const label = makeTextSprite(c.kind, { scale: 0.4, color: '#ffd98a', fontSize: 30 });
      label.position.set(mesh.position.x, mesh.position.y + 0.3, mesh.position.z);
      this.sandboxGroup.add(label);
    }
  }

  /** Map a live (or replayed) physics snapshot onto every physics-driven visual. */
  applyPhysicsSnapshot(s: PhysicsSnapshot): void {
    this.lastSnapshot = s;
    // Electron pulses: speed ∝ rail current, colour = Q4 output level.
    const voutQ4 = s.nodes.vout_q4 ?? 0;
    const q4Key = [0, 0.6, 1.2, 1.8].reduce((best, lvl) =>
      Math.abs(lvl - voutQ4) < Math.abs(best - voutQ4) ? lvl : best, 0);
    const iRef = 0.36;
    const iNorm = Math.min(3, s.currents.RAIL / iRef);
    this.setFlowActivity('vdd-met2', iNorm, 0.35 + iNorm * 0.45, new THREE.Color(LabWorld.Q4_COLORS[String(q4Key)] ?? 0xffc46b));
    this.setFlowActivity('gnd-met3', iNorm, 0.3 + iNorm * 0.4, new THREE.Color(LabWorld.Q4_COLORS[String(q4Key)] ?? 0xffc46b));
    // Rail glow: blackbody ramp at the computed trace temperature (visible > ~500 K).
    if (this.railTubeMat) {
      const tK = (s.temps.traceC ?? 27) + 273.15;
      if (tK > 500) {
        const [r, g, b] = tempToRGBf(tK);
        this.railTubeMat.emissive.setRGB(r, g, b);
        this.railTubeMat.emissiveIntensity = Math.min(2.4, (tK - 500) / 700);
      } else {
        this.railTubeMat.emissive.setHex(0x6a5010);
        this.railTubeMat.emissiveIntensity = 0.4;
      }
    }
    // SoC tile thermal zones.
    if (s.temps.tiles) this.bay3.setTileTemps(s.temps.tiles as Record<string, number>);
    // Cryo stages.
    this.bay1.setStageTemps([300, 4, 0.1, s.temps.cryoK ?? 0.015]);
    // SOA bench status line.
    const fault = s.temps.cryoK > 1.2 || (s.vgsMax ?? 0) >= 1.95;
    this.bay4.setStatus(`SOA bench · VDD ${s.vdd.toFixed(2)} V · I ${Math.abs(s.currents.RAIL * 1000).toFixed(1)} mA`, fault);
    this.thermal.update();
  }

  /** Physics-worker fault events → 3D effects (arc, melt smoke, quench vapour). */
  handleFaultFx(fx: FaultFx): void {
    if (fx.kind === 'arc') {
      this.bay4.triggerArc();
      const bay2Pos = new THREE.Vector3(BAY_DEFS[1].x + 0.6, this.bay2.layerY('met1') + 0.25, -0.4);
      const flash = new THREE.PointLight(0xbfdcff, 18, 6, 2);
      flash.position.copy(bay2Pos);
      this.scene.add(flash);
      setTimeout(() => this.scene.remove(flash), 450);
      this.bay4.applyCharDecal();
      this.bay4.setShortedGate(true);
    } else if (fx.kind === 'melt') {
      const railPos = new THREE.Vector3(BAY_DEFS[1].x, this.bay2.layerY('met2') + 0.2, -1.15);
      this.smokeDie.spawn(railPos, 26, 0.25, 0.55);
    } else if (fx.kind === 'smoke') {
      const pcbPos = new THREE.Vector3(BAY_DEFS[2].x + 1.2, 0.85, 1.4);
      this.smokeDie.spawn(pcbPos, 30, 0.4, 0.7);
    } else if (fx.kind === 'quench') {
      const mcPos = new THREE.Vector3(BAY_DEFS[0].x, 1.0, 0);
      this.smokeCryo.spawn(mcPos, 40, 0.5, 0.9);
    }
  }

  setThermalView(on: boolean): void {
    this.thermal.setView(on);
  }

  /** Replay scrubbing: apply a recorded snapshot to the visuals. */
  applyReplaySample(s: PhysicsSnapshot): void {
    this.applyPhysicsSnapshot(s);
  }

  /** Clear all failure visuals (after AI Fix & Re-Test / reset). */
  clearFailureVisuals(): void {
    this.bay4.clearFailureState();
    this.resetFlowToBaseline();
  }

  private buildFloor(): void {
    // Real precision optical breadboard: matte anodized dark-slate aluminum
    // with an M6 tapped-hole grid on 25 mm centers (procedural texture).
    const tex = makeBreadboardTexture();
    tex.repeat.set(20, 11.5);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 46),
      new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, metalness: 0.55, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);
    // Anti-static ESD bench mats under the foundry and SoC bays.
    for (const x of [BAY_DEFS[1].x, BAY_DEFS[2].x]) {
      const mat = new THREE.Mesh(new THREE.BoxGeometry(14, 0.02, 9), MAT.esdMat);
      mat.position.set(x, 0.005, 0);
      mat.receiveShadow = true;
      this.scene.add(mat);
    }
    // Machined bay divider channels (brushed steel, not neon).
    for (const x of [-12, -4, 4, 12]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 40), MAT.stainless);
      strip.position.set(x, 0.012, 0);
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
    this.smokeDie.update(dt);
    this.smokeCryo.update(dt);
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
