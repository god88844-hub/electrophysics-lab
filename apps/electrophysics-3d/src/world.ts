import * as THREE from 'three';
import { ElectronFlow } from './engine/electronFlow.js';
import { MAT, makeBreadboardTexture } from './bays/materials.js';
import { makeTextSprite } from './engine/labels.js';
import { Bay1Quantum, type Bay1Mode } from './bays/bay1Quantum.js';
import { Bay2Foundry, type LayerKey } from './bays/bay2Foundry.js';
import { Bay3Soc } from './bays/bay3Soc.js';
import { Bay4Forensics } from './bays/bay4Forensics.js';
import { ThermalVisuals } from './physics/thermalVisuals.js';
import { SmokeSystem } from './physics/smoke.js';
import { tempToRGBf } from '@physics/blackbody.mjs';
import type { PhysicsSnapshot, FaultFx } from './physics/physicsClient.js';

export type WorkspaceId = 'quantum' | 'silicon' | 'soc' | 'library';

export const WORKSPACES: Array<{ id: WorkspaceId; name: string; unit: string }> = [
  { id: 'quantum', name: 'Quantum Lab', unit: 'cm' },
  { id: 'silicon', name: 'Silicon CAD', unit: 'µm' },
  { id: 'soc', name: 'SoC Architect', unit: 'mm' },
  { id: 'library', name: 'Reference Library', unit: '—' },
];

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

/**
 * CAD/EDA workbench world (v3): ONLY the active workspace is mounted and
 * rendered. Rigs are built once and cached (visibility toggling) so switching
 * is instant and the GPU cost is a single workspace — the locked 60 FPS target
 * on integrated Intel Graphics. No floor discs, no permanent floating labels,
 * no decorative clutter.
 */
export class LabWorld {
  readonly scene: THREE.Scene;
  readonly bay1: Bay1Quantum;
  readonly bay2: Bay2Foundry;
  readonly bay3: Bay3Soc;
  readonly bay4: Bay4Forensics;
  readonly libraryRig = new THREE.Group();
  readonly flow!: ElectronFlow;
  readonly thermal = new ThermalVisuals();
  private smokeDie!: SmokeSystem;
  private smokeCryo!: SmokeSystem;
  private railTubeMat?: THREE.MeshStandardMaterial;
  private workspaceGroups: Record<WorkspaceId, THREE.Group>;
  private activeWorkspace: WorkspaceId = 'quantum';
  private rigRoot = new THREE.Group();
  private lastSnapshot: PhysicsSnapshot | null = null;
  private hoverTargets: THREE.Object3D[] = [];
  private flowIndexById = new Map<string, number>();
  private baselineActivity: Array<{ speed: number; brightness: number }> = [];
  private raycaster = new THREE.Raycaster();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildEnvironment();
    this.bay1 = new Bay1Quantum();
    this.bay2 = new Bay2Foundry();
    this.bay3 = new Bay3Soc();
    this.bay4 = new Bay4Forensics();
    this.buildLibraryRig();

    const groups: Record<WorkspaceId, THREE.Group> = {
      quantum: this.bay1.group,
      silicon: this.bay2.group,
      soc: this.bay3.group,
      library: this.libraryRig,
    };
    this.workspaceGroups = groups;
    for (const g of Object.values(groups)) {
      g.visible = false;
      this.rigRoot.add(g);
    }
    // The SOA forensic bench rides the Silicon CAD workspace.
    this.bay4.group.visible = false;
    this.rigRoot.add(this.bay4.group);
    scene.add(this.rigRoot);
    this.flow = new ElectronFlow(this.scene);
    this.setWorkspace('quantum', true);
    this.buildFlowSystem();
    this.smokeDie = new SmokeSystem(scene, 200, 0x8a949f, 0.26);
    this.smokeCryo = new SmokeSystem(scene, 160, 0xaad4ff, 0.3);
  }

  get currentWorkspace(): WorkspaceId {
    return this.activeWorkspace;
  }

  get hoverables(): THREE.Object3D[] {
    return this.hoverTargets;
  }

  private buildLibraryRig(): void {
    // Quiet reference-library terminal: dark bench slab + holo screen, no books.
    const slab = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.0), MAT.plasticDark);
    slab.position.y = 0.9;
    slab.castShadow = true;
    slab.name = 'library-terminal';
    this.libraryRig.add(slab);
    for (const [dx, dz] of [[-1.3, -0.7], [1.3, -0.7], [-1.3, 0.7], [1.3, 0.7]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 10), MAT.matteSteel);
      leg.position.set(dx, 0.45, dz);
      this.libraryRig.add(leg);
    }
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x101820, emissive: 0x1f4a66, emissiveIntensity: 0.7, transparent: true, opacity: 0.92 })
    );
    screen.position.set(0.3, 1.7, -0.35);
    screen.rotation.x = -0.4;
    screen.name = 'library-screen';
    this.libraryRig.add(screen);
    const lamp = new THREE.PointLight(0xffd9a0, 2.6, 4.5, 2);
    lamp.position.set(0, 2.1, 0.4);
    this.libraryRig.add(lamp);
  }

  private buildEnvironment(): void {
    const tex = makeBreadboardTexture();
    tex.repeat.set(24, 14);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 70),
      new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, metalness: 0.55, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(26, 0.06, 16), MAT.esdMat);
    bench.position.y = 0.03;
    bench.receiveShadow = true;
    this.scene.add(bench);
    // Neutral studio lights (5600 K), one shadowed key.
    const key = new THREE.DirectionalLight(0xf6f7f4, 2.1);
    key.position.set(8, 14, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -16;
    key.shadow.camera.right = 16;
    key.shadow.camera.top = 16;
    key.shadow.camera.bottom = -16;
    key.shadow.camera.far = 50;
    key.shadow.bias = -0.0004;
    this.scene.add(key);
    this.scene.add(new THREE.AmbientLight(0xdfe3ea, 0.5));
    const fill = new THREE.DirectionalLight(0xdde4ee, 0.4);
    fill.position.set(-9, 5, 7);
    this.scene.add(fill);
  }

  /** Mount exactly one workspace rig; cache the rest (visibility only). */
  setWorkspace(id: WorkspaceId): void {
    if (!this.workspaceGroups[id]) return;
    this.activeWorkspace = id;
    for (const [key, g] of Object.entries(this.workspaceGroups)) {
      g.visible = key === id;
    }
    this.bay4.group.visible = id === 'silicon';
    // Hover targets: rig contents + SOA bench when in silicon.
    this.hoverTargets = [];
    (this.workspaceGroups[id] as THREE.Group).traverse((o) => this.hoverTargets.push(o));
    if (id === 'silicon') this.bay4.group.traverse((o) => this.hoverTargets.push(o));
  }

  setBay1Mode(mode: Bay1Mode): void {
    this.bay1.setMode(mode);
  }

  setLayerPeel(exploded: boolean, depth: number): void {
    this.bay2.setPeelTargets(exploded ? 1 : 0, depth);
  }

  setLayerVisibility(visible: Record<string, boolean>): void {
    this.bay2.setLayerVisibility(visible);
  }

  setNpuAttached(attached: boolean): void {
    this.bay3.setNpuAttached(attached);
  }

  setSoCDisassembled(v: boolean): void {
    this.bay3.setDisassembled(v ? 1 : 0);
  }

  setThermalView(on: boolean): void {
    this.thermal.setView(on);
  }

  clearFailureVisuals(): void {
    this.bay4.clearFailureState();
    this.resetFlowToBaseline();
  }

  private buildFlowSystem(): void {
    for (const fc of this.bay2.flowCurves) {
      const color = fc.radix === 'q4' ? new THREE.Color(0xffc46b) : new THREE.Color(0x9fd0ff);
      const layerKey: LayerKey = fc.id === 'vdd-met2' ? 'met2' : 'met3';
      const ridingCurve = new OffsetCurve(fc.curve, () => this.bay2.getLayerOffsetY(layerKey));
      this.flow.addPath({ curve: ridingCurve, color, nominalCurrent: 0.36 });
      this.flowIndexById.set(fc.id, this.flow.activityCount() - 1);
      this.baselineActivity.push({ speed: 0.75, brightness: 0.55 });
    }
    for (const fc of this.bay3.flowCurves) {
      this.flow.addPath({ curve: fc.curve, color: new THREE.Color(0x6fd0ff), nominalCurrent: 0.4 });
      this.flowIndexById.set(fc.id, this.flow.activityCount() - 1);
      this.baselineActivity.push({ speed: 0.5, brightness: 0.4 });
    }
    const met2Group = this.bay2.group.children.find((c) => c.name === 'layer-met2') as THREE.Group | undefined;
    if (met2Group) {
      const tube = met2Group.children.find(
        (c) => (c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry?.type === 'TubeGeometry'
      ) as THREE.Mesh | undefined;
      if (tube) {
        this.railTubeMat = tube.material as THREE.MeshStandardMaterial;
        this.thermal.register(tube, () => (this.lastSnapshot?.temps?.traceC != null ? this.lastSnapshot.temps.traceC + 273.15 : 300));
      }
    }
    for (const tile of this.bay3.tiles) {
      this.thermal.register(tile.thermalPlane, () => (this.lastSnapshot?.temps?.tiles?.[tile.id] ?? 45) + 273.15);
    }
    const dut = this.bay4.group.getObjectByName('dutChip');
    if (dut) this.thermal.register(dut as THREE.Mesh, () => (this.lastSnapshot?.temps?.junctionC ?? 27) + 273.15);
  }

  applyPhysicsSnapshot(s: PhysicsSnapshot): void {
    this.lastSnapshot = s;
    const voutQ4 = s.nodes.vout_q4 ?? 0;
    const q4Key = [0, 0.6, 1.2, 1.8].reduce((best, lvl) =>
      Math.abs(lvl - voutQ4) < Math.abs(best - voutQ4) ? lvl : best, 0);
    const flowColor = new THREE.Color(q4Key >= 1.2 ? 0xffc46b : q4Key >= 0.6 ? 0xff9d5c : 0x4a5568);
    const iNorm = Math.min(3, Math.abs(s.currents.RAIL ?? 0) / 0.36);
    this.setFlowActivity('vdd-met2', iNorm, 0.35 + iNorm * 0.45, flowColor);
    this.setFlowActivity('gnd-met3', iNorm, 0.3 + iNorm * 0.4, flowColor);
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
    if (s.temps.tiles) this.bay3.setTileTemps(s.temps.tiles as Record<string, number>);
    this.bay1.setStageTemps([300, 4, 0.1, s.temps.cryoK ?? 0.015]);
    const fault = (s.temps.cryoK ?? 0.015) > 1.2 || (s.vgsMax ?? 0) >= 1.95;
    this.bay4.setStatus(`VDD ${s.vdd.toFixed(2)} V · I ${Math.abs(s.currents.RAIL * 1000).toFixed(1)} mA`, fault);
    this.thermal.update();
  }

  handleFaultFx(fx: FaultFx): void {
    if (fx.kind === 'arc') {
      this.bay4.triggerArc();
      const flash = new THREE.PointLight(0xbfdcff, 18, 6, 2);
      flash.position.set(0.6, this.bay2.layerY('met1') + 0.25, -0.4);
      this.scene.add(flash);
      setTimeout(() => this.scene.remove(flash), 450);
      this.bay4.applyCharDecal();
      this.bay4.setShortedGate(true);
    } else if (fx.kind === 'melt') {
      this.smokeDie.spawn(new THREE.Vector3(0, this.bay2.layerY('met2') + 0.2, -1.15), 26, 0.25, 0.55);
    } else if (fx.kind === 'smoke') {
      this.smokeDie.spawn(new THREE.Vector3(1.2, 0.85, 1.4), 30, 0.4, 0.7);
    } else if (fx.kind === 'quench') {
      this.smokeCryo.spawn(new THREE.Vector3(0, 1.0, 0), 40, 0.5, 0.9);
    }
  }

  applyReplaySample(s: PhysicsSnapshot): void {
    this.applyPhysicsSnapshot(s);
  }

  setFlowActivity(id: string, speed: number, brightness: number, color?: THREE.Color): void {
    const idx = this.flowIndexById.get(id);
    if (idx !== undefined) this.flow.setActivity(idx, { speed, brightness, color });
  }

  resetFlowToBaseline(): void {
    let i = 0;
    for (const [id] of this.flowIndexById) {
      const base = this.baselineActivity[i] ?? { speed: 0.5, brightness: 0.4 };
      this.flow.setActivity(i, { ...base, color: id.startsWith('bus') ? new THREE.Color(0x6fd0ff) : undefined });
      i++;
    }
  }

  /** Raycast hover callout: hovered object name + live telemetry meta. */
  pickHover(ndcX: number, ndcY: number, camera: THREE.PerspectiveCamera): { name: string; meta: string } | null {
    if (this.hoverTargets.length === 0) return null;
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const hits = this.raycaster.intersectObjects(this.hoverTargets, true);
    if (hits.length === 0) return null;
    const obj = hits[0].object;
    let name = obj.name || '';
    let p: THREE.Object3D | null = obj;
    while (p && !name) {
      p = p.parent;
      if (p) name = p.name || '';
    }
    const parts: string[] = [];
    if (this.currentWorkspace === 'silicon') parts.push('SKY130A');
    if (this.currentWorkspace === 'quantum') parts.push('cryo 15 mK');
    const s = this.lastSnapshot;
    if (s) {
      parts.push(`T_trace ${s.temps.traceC.toFixed(0)} °C`);
      parts.push(`I ${Math.abs(s.currents.RAIL * 1000).toFixed(1)} mA`);
      parts.push(`VDD ${s.vdd.toFixed(2)} V`);
    }
    return { name: name || obj.type, meta: parts.join(' · ') };
  }

  private ghost?: THREE.Mesh;

  /** Grid-snapped ghost preview for the Place tool (C). */
  setGhost(kind: string | null, position: [number, number] | null): void {
    if (!kind || !position) {
      if (this.ghost) this.ghost.visible = false;
      return;
    }
    if (!this.ghost) {
      this.ghost = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.16, 0.34),
        new THREE.MeshStandardMaterial({ color: 0x8ef0b2, transparent: true, opacity: 0.45 })
      );
      this.bay2.group.add(this.ghost);
    }
    const [sx, sz] = position;
    const snap = (v: number) => Math.round(v / 0.35) * 0.35;
    this.ghost.position.set(-2 + snap(sx), this.bay2.layerY('met3') + 0.35, -1.4 + snap(sz));
    this.ghost.visible = true;
  }

  /** Manhattan orthogonal copper trace between two placed components. */
  addManhattanTrace(fromId: string, toId: string): void {
    const group = this.bay2.group.getObjectByName('sandbox-group');
    if (!group) return;
    const a = group.getObjectByName('sandbox-' + fromId);
    const b = group.getObjectByName('sandbox-' + toId);
    if (!a || !b) return;
    const y = this.bay2.layerY('met2') + 0.12;
    const ax = a.position.x, az = a.position.z;
    const bx = b.position.x, bz = b.position.z;
    // Manhattan: X leg → Z leg → X leg.
    const pts = [
      new THREE.Vector3(ax, y, az),
      new THREE.Vector3((ax + bx) / 2, y, az),
      new THREE.Vector3((ax + bx) / 2, y, bz),
      new THREE.Vector3(bx, y, bz),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.035, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.92, roughness: 0.26 })
    );
    tube.name = 'trace-' + fromId + '-' + toId;
    group.add(tube);
    this.flow.addPath({ curve, color: new THREE.Color(0xb87333), nominalCurrent: 0.36 });
  }

  /** Render user-placed sandbox components on the silicon bench (real meshes). */
  setSandboxComponents(components: Array<{ id: string; kind: string; position: [number, number] }>): void {
    if (!this.bay2.group.parent) return;
    const existing = this.bay2.group.getObjectByName('sandbox-group');
    const group = existing ?? new THREE.Group();
    if (!existing) {
      group.name = 'sandbox-group';
      this.bay2.group.add(group);
    }
    for (const child of [...group.children]) group.remove(child);
    for (const c of components) {
      const [sx, sz] = c.position;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.16, 0.34),
        new THREE.MeshStandardMaterial({ color: 0x5a4a38, metalness: 0.6, roughness: 0.4 })
      );
      mesh.position.set(-2 + sx * 1.4, this.bay2.layerY('met3') + 0.35, -1.4 + sz * 1.2);
      mesh.castShadow = true;
      mesh.name = 'sandbox-' + c.id;
      group.add(mesh);
    }
  }

  update(dt: number): void {
    this.bay1.update(dt, performance.now() * 0.001);
    this.bay2.update(dt);
    this.bay3.update(dt);
    this.bay4.update(dt, performance.now() * 0.001);
    this.smokeDie.update(dt);
    this.smokeCryo.update(dt);
    this.flow.update(dt, 1);
  }

  dispose(): void {
    this.flow.dispose();
    this.thermal.dispose();
    this.smokeDie.dispose();
    this.smokeCryo.dispose();
  }
}
