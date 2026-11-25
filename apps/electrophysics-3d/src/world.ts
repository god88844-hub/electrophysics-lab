import * as THREE from 'three';
import { ElectronFlow } from './engine/electronFlow.js';
import { frameStore } from './engine/solverFrame.mjs';
import { fpsTrend } from './engine/fpsTrend.mjs';
import { MAT } from './bays/materials.js';
import { store } from './state/store.js';
import { ADMISSION_BUDGETS } from './ui/cad/admissionSurface.mjs';
import { makeTextSprite } from './engine/labels.js';
import { Bay1Quantum, type Bay1Mode } from './bays/bay1Quantum.js';
import { Bay2Foundry, type LayerKey } from './bays/bay2Foundry.js';
import { Bay3Soc } from './bays/bay3Soc.js';
import { Bay4Forensics } from './bays/bay4Forensics.js';
import { ThermalVisuals } from './physics/thermalVisuals.js';
import { SmokeSystem } from './physics/smoke.js';
import { tempToRGBf } from '@physics/blackbody.mjs';
import { physicsClient, type PhysicsSnapshot, type FaultFx } from './physics/physicsClient.js';
import { quantumClient, type BlochState } from './physics/quantumClient.js';

export type WorkspaceId = 'quantum' | 'silicon' | 'soc' | 'library';

export const WORKSPACES: Array<{ id: WorkspaceId; name: string; unit: string }> = [
  { id: 'quantum', name: 'Quantum Lab', unit: 'cm' },
  { id: 'silicon', name: 'Silicon CAD', unit: 'µm' },
  { id: 'soc', name: 'SoC Architect', unit: 'mm' },
  { id: 'library', name: 'Reference Library', unit: '—' },
];

/**
 * bay4's status lamp is fault-state only (its `text` arg is deliberately
 * unused upstream) — a pre-allocated constant avoids a per-frame template
 * string on the frame→visual path (zero-GC contract).
 */
const BAY4_STATUS_TEXT = 'kernel-frame telemetry';

/** Curve decorator that adds a live Y offset — flow pulses ride layer peels. */
class OffsetCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private base: THREE.Curve<THREE.Vector3>,
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
  private hoverTargets: THREE.Object3D[] = [];
  private flowIndexById = new Map<string, number>();
  private raycaster = new THREE.Raycaster();
  // WP-1.5 pre-allocated scratch — the frame→visual path never allocates.
  private flowColorScratch = new THREE.Color();
  private hoverNdcScratch = new THREE.Vector2();
  private hoverResult: { name: string; meta: string } = { name: '', meta: '' };
  private stageTempsScratch = [300, 4, 0.1, 0.015];
  private tilesRecordScratch: Record<string, number> = { cpu: 27, tpu: 27, gpu: 27, mem: 27 };
  private unsubs: Array<() => void> = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
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
    this.flow = new ElectronFlow(this.bay2.group);
    this.buildFlowSystem();
    this.setWorkspace('quantum');
    this.smokeDie = new SmokeSystem(scene, 200, 0x8a949f, 0.26);
    this.smokeCryo = new SmokeSystem(scene, 160, 0xaad4ff, 0.3);

    // WP-1.5 frame surface: renderer, ViewCube, hover telemetry and the
    // Playwright probes all read this ONE pre-allocated frame envelope.
    if (typeof window !== 'undefined' && window.__lab) {
      (window.__lab as unknown as Record<string, unknown>).frame = frameStore;
      (window.__lab as unknown as Record<string, unknown>).fpsTrend = fpsTrend;
    }
    // Recompiled netlists change node/current topology — re-learn keys once.
    this.unsubs.push(physicsClient.onNetlist(() => {
      frameStore.resetTopology();
      this.flow.clear();
    }));
    this.unsubs.push(physicsClient.onFailure(() => this.flow.clear()));
    this.unsubs.push(
      quantumClient.onState(({ bloch, gateFidelity }: { bloch: BlochState[]; gateFidelity: number | null }) =>
        frameStore.ingestQuantum(bloch, gateFidelity)
      )
    );
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

  /** Mount exactly one workspace rig; cache the rest (visibility only). */
  setWorkspace(id: WorkspaceId): void {
    if (!this.workspaceGroups[id]) return;
    if (this.activeWorkspace !== id) {
      this.flow.clear();
      store.set({ hover: null, cursor: null });
    }
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
    this.flow.clear();
  }

  private buildFlowSystem(): void {
    for (const fc of this.bay2.flowCurves) {
      const color = fc.radix === 'q4' ? new THREE.Color(0xffc46b) : new THREE.Color(0x9fd0ff);
      const layerKey: LayerKey = fc.id === 'vdd-met2' ? 'met2' : 'met3';
      const ridingCurve = new OffsetCurve(fc.curve, () => this.bay2.getLayerOffsetY(layerKey));
      this.flowIndexById.set(fc.id, this.flow.addPath({ id: fc.id, curve: ridingCurve, color }));
    }
    // SoC has its own execution-driven packets under the SoC rig (WP-4.5).
    const met2Group = this.bay2.group.children.find((c) => c.name === 'layer-met2') as THREE.Group | undefined;
    if (met2Group) {
      const tube = met2Group.children.find(
        (c) => (c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry?.type === 'TubeGeometry'
      ) as THREE.Mesh | undefined;
      if (tube) {
        this.railTubeMat = tube.material as THREE.MeshStandardMaterial;
        this.thermal.register(tube, () => frameStore.thermal.traceC + 273.15);
      }
    }
    for (const tile of this.bay3.tiles) {
      this.thermal.register(tile.thermalPlane, () => (frameStore.readTileC(tile.id) ?? 45) + 273.15);
    }
    const dut = this.bay4.group.getObjectByName('dutChip');
    if (dut) this.thermal.register(dut as THREE.Mesh, () => frameStore.thermal.junctionC + 273.15);
  }

  /**
   * WP-1.5: the renderer consumes solver-frame typed arrays. The snapshot is
   * ingested once into the pre-allocated frame envelope (zero per-frame heap
   * allocation in steady state), then the visuals read the frame buffers.
   */
  applyPhysicsSnapshot(s: PhysicsSnapshot, opts: { live?: boolean } = {}): void {
    const live = opts.live ?? physicsClient.live === true;
    frameStore.ingestSnapshot(s, { live });
    this.applySolverFrame();
    if (this.activeWorkspace !== 'silicon') return;
    if (!live || !store.get().playing || !Number.isFinite(s.currents?.RAIL) ||
        Object.keys(s.nodes ?? {}).length > ADMISSION_BUDGETS.mnaMaxNodes) {
      this.flow.clear();
      return;
    }
    this.applyRailFlow();
  }

  /** Forensic-replay frames: identical pipeline, schema-honest `live: false`. */
  applyReplaySample(s: PhysicsSnapshot): void {
    this.applyPhysicsSnapshot(s, { live: false });
  }

  private applyRailFlow(): void {
    // Thresholds are the midpoints between the sealed Q4 voltage levels.
    const voltage = frameStore.readNode('vout_q4');
    const color = this.flowColorScratch.setHex(voltage > 0.9 ? 0xffc46b : voltage > 0.3 ? 0xff9d5c : 0x4a5568);
    const speed = Math.min(3, Math.abs(frameStore.readCurrent('RAIL')) / 0.36);
    this.flow.setActivity(this.flowIndexById.get('vdd-met2')!, speed, 0.35 + speed * 0.45, color);
    this.flow.setActivity(this.flowIndexById.get('gnd-met3')!, speed, 0.3 + speed * 0.4, color);
  }

  /** Apply the current solver-frame buffers to the visuals (allocation-free). */
  private applySolverFrame(): void {
    const th = frameStore.thermal;
    const circuit = frameStore.circuits[0];
    if (this.railTubeMat) {
      const tK = th.traceC + 273.15;
      if (tK > 500) {
        const [r, g, b] = tempToRGBf(tK);
        this.railTubeMat.emissive.setRGB(r, g, b);
        this.railTubeMat.emissiveIntensity = Math.min(2.4, (tK - 500) / 700);
      } else {
        this.railTubeMat.emissive.setHex(0x6a5010);
        this.railTubeMat.emissiveIntensity = 0.4;
      }
    }
    if (th.tileCount > 0) {
      for (let i = 0; i < th.tileCount; i++) {
        const id = frameStore.tileIdAt(i);
        if (id) this.tilesRecordScratch[id] = th.tiles[i];
      }
      this.bay3.setTileTemps(this.tilesRecordScratch);
    }
    this.stageTempsScratch[3] = th.cryoK;
    this.bay1.setStageTemps(this.stageTempsScratch);
    const fault = th.cryoK > 1.2 || circuit.vgsMax >= 1.95;
    this.bay4.setStatus(BAY4_STATUS_TEXT, fault);
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

  /**
   * Raycast hover callout: hovered object name + live frame telemetry meta.
   * WP-1.5: telemetry values are read from the solver-frame typed buffers —
   * frames, not ad-hoc snapshot state. Raycast + result reuse pre-allocated
   * objects; the meta string is built only while actually hovering.
   */
  pickHover(ndcX: number, ndcY: number, camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): { name: string; meta: string } | null {
    if (this.hoverTargets.length === 0) return null;
    this.hoverNdcScratch.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.hoverNdcScratch, camera);
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
    if (frameStore.stats.ingested > 0) {
      parts.push(`T_trace ${frameStore.thermal.traceC.toFixed(0)} °C`);
      parts.push(`I ${Math.abs(frameStore.readCurrent('RAIL') * 1000).toFixed(1)} mA`);
      parts.push(`VDD ${frameStore.vdd.toFixed(2)} V`);
      parts.push(`${frameStore.provenance.badge} · frame ${frameStore.frameId}`);
    }
    this.hoverResult.name = name || obj.type;
    this.hoverResult.meta = parts.join(' · ');
    return this.hoverResult;
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
    fpsTrend.frame(); // WP-1.5 FPS trend sampling (per rendered frame)
    this.bay1.update(dt, performance.now() * 0.001);
    this.bay2.update(dt);
    this.bay3.update(dt);
    this.bay4.update(dt, performance.now() * 0.001);
    this.smokeDie.update(dt);
    this.smokeCryo.update(dt);
    if (store.get().playing) this.flow.update(dt);
    else this.flow.clear();
  }

  dispose(): void {
    for (const fn of this.unsubs) fn();
    this.unsubs.length = 0;
    this.flow.dispose();
    this.thermal.dispose();
    this.smokeDie.dispose();
    this.smokeCryo.dispose();
  }
}
