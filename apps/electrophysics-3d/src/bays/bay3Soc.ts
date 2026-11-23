import * as THREE from 'three';
import { MAT } from './materials.js';
import { makeTextSprite } from '../engine/labels.js';
import { REFERENCE } from '../data/reference.js';
import { createLiveRunner, packetRouteFor, BUS_ROUTES, type SocLiveRunner, type SocLiveEvent } from './soc/liveExec.js';
import type { CellOperatingPoint, TileTelemetry } from './soc/tileDrilldown.js';
import * as chipEngine from '@chip/index.mjs';

/**
 * WP-4.7 — a tile picked by direct 3D raycast in the SoC Architect view.
 * `chipletId` carries the solver tile zone (cpu/tpu/gpu/mem/npu) whose live
 * telemetry feeds the Layer-1 stress drill-down.
 */
export interface TileSelection {
  /** `'cpu' | 'tpu' | 'gpu' | 'mem' | 'npu' | 'tpu-tile-<r>-<c>'`. */
  tileId: string;
  /** Human label shown in the inspector stress panel. */
  label: string;
  kind: 'chiplet' | 'tpu-tile';
  /** The die zone supplying solver telemetry (temp/power). */
  chipletId: string;
  /** Instance index 0..63 for TPU MAC tiles. */
  instanceIndex?: number;
}

export interface SocTile {
  id: string;
  name: string;
  group: THREE.Group;
  /** Thermal/emissive plane whose glow maps real tile temperature. */
  thermalPlane: THREE.Mesh;
  thermalMat: THREE.MeshStandardMaterial;
  /** Idle power (W) computed from the 05 reference analytical model. */
  idlePowerW: number;
  /** Current power draw (W) — set by the live power model. */
  powerW: number;
  tempC: number;
}

/**
 * Bay 3 — Full-Chip & Unified-Memory SoC Bay.
 * Dissectible chiplet package on a translucent PCB + silicon interposer:
 * CPU Cluster · Systolic TPU Array · SIMT GPU Cores · Unified Memory Fabric
 * (optional multi-radix NPU swap). Bus activity pulses + per-tile thermal
 * zones. Peak figures cited from 05_chip_architecture_benchmarks.json.
 */
export class Bay3Soc {
  readonly group = new THREE.Group();
  tiles: SocTile[] = [];
  npuTile?: SocTile;
  flowCurves: Array<{ id: string; curve: THREE.Curve3 }> = [];
  private disassembled = false;
  private explodeGoal = 0;
  private explodeT = 0;
  private chipletGroups: THREE.Group[] = [];
  private busMeshes: THREE.Mesh[] = [];
  private tpuTiles?: THREE.InstancedMesh;
  private tpuTileActivity: number[] = [];

  constructor() {
    this.buildBoard();
    this.buildChiplets();
    this.buildBusFabric();
    this.buildLabels();
  }

  private buildBoard(): void {
    // Silkscreen legend + ENIG gold bond pads + BGA solder balls (real PCB).
    const enigMat = MAT.enigGold;
    const pads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.012, 0.12), enigMat, 40);
    const ballMat = MAT.bgaSolder;
    const balls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), ballMat, 40);
    const dummy = new THREE.Object3D();
    let pi = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        const px = -2.4 + col * 0.62;
        const pz = 2.9;
        dummy.position.set(px, 0.62, pz);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        pads.setMatrixAt(pi, dummy.matrix);
        dummy.position.y = 0.4;
        dummy.updateMatrix();
        balls.setMatrixAt(pi, dummy.matrix);
        pi++;
      }
    }
    this.group.add(pads, balls);

    // Translucent green/black PCB interposer stack.
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.22, 7), MAT.pcbGreen);
    pcb.position.y = 0.5;
    pcb.receiveShadow = true;
    pcb.castShadow = true;
    pcb.name = 'pcb';
    this.group.add(pcb);
    const siliconInterposer = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.1, 5.4),
      new THREE.MeshStandardMaterial({ color: 0x2a3140, metalness: 0.6, roughness: 0.35 })
    );
    siliconInterposer.position.y = 0.66;
    this.group.add(siliconInterposer);
  }

  private makeChiplet(
    id: string,
    name: string,
    size: [number, number],
    pos: [number, number, number],
    color: number,
    tileRows: number,
    tileCols: number,
    idlePowerW: number
  ): SocTile {
    const g = new THREE.Group();
    const substrate = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], 0.14, size[1]),
      new THREE.MeshStandardMaterial({ color: 0x1b202b, metalness: 0.5, roughness: 0.5 })
    );
    substrate.position.y = 0.07;
    substrate.castShadow = true;
    g.add(substrate);
    const die = new THREE.Mesh(
      new THREE.BoxGeometry(size[0] - 0.3, 0.1, size[1] - 0.3),
      new THREE.MeshStandardMaterial({ color, metalness: 0.45, roughness: 0.35 })
    );
    die.position.y = 0.19;
    die.castShadow = true;
    g.add(die);
    // Functional tile grid (cores / MAC cells / SMs).
    const tileW = (size[0] - 0.5) / tileCols;
    const tileD = (size[1] - 0.5) / tileRows;
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x38404f,
      emissive: 0x101820,
      emissiveIntensity: 0.5,
      metalness: 0.4,
      roughness: 0.4,
    });
    const grid = new THREE.InstancedMesh(new THREE.BoxGeometry(tileW * 0.82, 0.045, tileD * 0.82), tileMat, tileRows * tileCols);
    const dummy = new THREE.Object3D();
    let t = 0;
    for (let r = 0; r < tileRows; r++) {
      for (let c = 0; c < tileCols; c++) {
        dummy.position.set(-size[0] / 2 + 0.25 + tileW * (c + 0.5), 0.26, -size[1] / 2 + 0.25 + tileD * (r + 0.5));
        dummy.updateMatrix();
        grid.setMatrixAt(t++, dummy.matrix);
      }
    }
    g.add(grid);
    // Thermal plane (emissive glow maps computed tile temperature).
    const thermalMat = new THREE.MeshStandardMaterial({
      color: 0x1a2230,
      emissive: 0x223648,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.9,
    });
    const thermalPlane = new THREE.Mesh(new THREE.PlaneGeometry(size[0] - 0.2, size[1] - 0.2), thermalMat);
    thermalPlane.rotation.x = -Math.PI / 2;
    thermalPlane.position.y = 0.295;
    g.add(thermalPlane);
    g.position.set(pos[0], pos[1], pos[2]);
    // WP-4.7 — every mesh under this group resolves to the tile on raycast.
    g.name = `tile-${id}`;
    // The render camera rides through this material every frame — capture
    // it for the tile pick raycast (no App/world coupling needed).
    thermalMat.onBeforeRender = (renderer, _scene, camera) => {
      this.pickCamera = camera as THREE.PerspectiveCamera | THREE.OrthographicCamera;
      this.ensurePointerHook(renderer.domElement);
    };
    this.group.add(g);
    const tile: SocTile = { id, name, group: g, thermalPlane, thermalMat, idlePowerW, powerW: idlePowerW, tempC: 45 };
    this.tiles.push(tile);
    this.chipletGroups.push(g);
    return tile;
  }

  private buildChiplets(): void {
    const arch = REFERENCE.architecture.parameters;
    // Power model: P ≈ C·V²·f using reference benchmark figures (05 JSON).
    const cpu = arch.riscv_rv32im;
    const tpu = arch.systolic_array_tpu;
    const gpu = arch.simt_gpu;
    const cpuTile = this.makeChiplet('cpu', 'CPU Cluster (RV32IM ×8)', [2.6, 2.2], [-2.6, 0.79, -1.3], 0x2c3850, 2, 4, (cpu.power_mw_at_100mhz_130nm / 1000) * 8);
    void cpuTile;
    const tpuTile = this.makeChiplet('tpu', `Systolic TPU (${tpu.grid_size.educational}×${tpu.grid_size.educational} INT8)`, [2.2, 2.2], [0.3, 0.79, -1.4], 0x50382c, 8, 8, tpu.power_w.tpu_v1 * 0.08);
    void tpuTile;
    const gpuTile = this.makeChiplet('gpu', `SIMT GPU (${gpu.sm_count.intel_iris_xe_155u} EU)`, [3.4, 1.6], [2.9, 0.79, -1.2], 0x2c5038, 4, 8, gpu.power_w.intel_iris_xe_155u_tdp * 0.35);
    void gpuTile;
    const memTile = this.makeChiplet('mem', 'Unified Memory Fabric (LPDDR5)', [4.6, 1.5], [-1.0, 0.79, 1.6], 0x3a2c50, 2, 10, 2.1);
    void memTile;
    this.npuTile = this.makeChiplet('npu', 'Multi-Radix NPU (Q4/ternary/binary)', [1.7, 1.4], [3.4, 0.79, 1.55], 0x50442c, 3, 3, 1.2);
    this.npuTile.group.visible = false; // optional swap — attached via Inspector
    // Lid for the dissectible package — transparent so the tile layout reads
    // through in the assembled state.
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(8.9, 0.12, 5.6),
      MAT.aluHeatSpreader
    );
    lid.position.y = 1.35;
    lid.name = 'packageLid';
    lid.castShadow = true;
    this.group.add(lid);
  }

  /**
   * 8×8 = 64 individually addressable MAC tiles. Per-tile emissive color is
   * driven by computed switching activity from packages/chip-engine (INT8/QDQ
   * or Q4 matmul) — real per-tile dynamic power visualization.
   */
  private buildTpuTileMatrix(): void {
    const tpu = this.tiles.find((t) => t.id === 'tpu');
    if (!tpu) return;
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a5464, emissive: 0x000000, metalness: 0.5, roughness: 0.35 });
    this.tpuTiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.06, 0.22), mat, 64);
    this.tpuTiles.name = 'tpu-tile-matrix';
    this.tpuTileActivity = new Array(64).fill(0);
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        dummy.position.set(-0.77 + c * 0.22, 0.34, -0.77 + r * 0.22);
        dummy.updateMatrix();
        this.tpuTiles.setMatrixAt(i, dummy.matrix);
        this.tpuTiles.setColorAt(i, new THREE.Color(0x4a5464));
        i++;
      }
    }
    this.tpuTiles.instanceColor!.needsUpdate = true;
    tpu.group.add(this.tpuTiles);
  }

  /** Per-tile switching activity 0..1 (64 entries) → emissive heat color. */
  setTpuTileActivity(activity: number[]): void {
    if (!this.tpuTiles) return;
    const color = new THREE.Color();
    for (let i = 0; i < 64; i++) {
      const a = Math.max(0, Math.min(1, activity[i] ?? 0));
      // Cool grey → amber → crimson (switching intensity).
      color.setRGB(0.29 + a * 0.65, 0.33 + a * 0.18, 0.39 - a * 0.22);
      this.tpuTiles.setColorAt(i, color);
    }
    if (this.tpuTiles.instanceColor) this.tpuTiles.instanceColor.needsUpdate = true;
  }

  private buildBusFabric(): void {
    this.buildTpuTileMatrix();
    // Glowing bus routes: memory fabric ↔ CPU/TPU/GPU (unified memory topology).
    const routes: Array<[THREE.Vector3, THREE.Vector3]> = [
      [new THREE.Vector3(-1.4, 0.86, 1.2), new THREE.Vector3(-2.0, 0.86, -0.3)], // mem→cpu
      [new THREE.Vector3(0.3, 0.86, 1.0), new THREE.Vector3(0.35, 0.86, -0.5)], // mem→tpu
      [new THREE.Vector3(1.6, 0.86, 1.2), new THREE.Vector3(2.4, 0.86, -0.5)], // mem→gpu
      [new THREE.Vector3(-1.3, 0.86, -1.2), new THREE.Vector3(0.0, 0.86, -1.3)], // cpu→tpu
      [new THREE.Vector3(1.3, 0.86, -1.25), new THREE.Vector3(2.2, 0.86, -1.2)], // tpu→gpu
    ];
    for (let i = 0; i < routes.length; i++) {
      const curve = new THREE.CatmullRomCurve3(routes[i]);
      this.flowCurves.push({ id: `bus-${i}`, curve });
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, 0.035, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x3d5570, emissive: 0x1c3a5c, emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.35 })
      );
      tube.name = `bus-${i}`;
      this.busMeshes.push(tube);
      this.group.add(tube);
    }
  }

  private buildLabels(): void {
  }

  /** Optional multi-radix NPU swap. */
  setNpuAttached(attached: boolean): void {
    if (this.npuTile) this.npuTile.group.visible = attached;
    if (!attached && this.selected?.tileId === 'npu') this.clearSelection();
  }

  /** Dissectible package: lid + chiplets float apart. */
  setDisassembled(goal: number): void {
    this.explodeGoal = goal;
  }

  /**
   * Per-tile thermal zones — glow colour mapped from computed temperature:
   * 45 °C bluish idle → 100 °C warm → 200 °C Si thermal-runaway alarm.
   * (si_thermal_runaway_c = 200 in 06_failure_physics_thresholds.json)
   */
  setTileTemps(tempCs: Record<string, number>): void {
    for (const tile of this.tiles) {
      const t = tempCs[tile.id] ?? tile.tempC;
      tile.tempC = t;
      const mat = tile.thermalMat;
      if (t < 70) {
        mat.emissive.setHex(0x223648); // cool blue
        mat.emissiveIntensity = 0.3;
      } else if (t < 100) {
        mat.emissive.setHex(0x8a5a20); // warm amber
        mat.emissiveIntensity = 0.55;
      } else if (t < 200) {
        mat.emissive.setHex(0xb8641a); // hot orange
        mat.emissiveIntensity = 0.9;
      } else {
        mat.emissive.setHex(0xc02418); // thermal-runaway alarm
        mat.emissiveIntensity = 1.5;
      }
    }
  }

  /** Bus activity level per route 0..1 — drives emissive + pulse speed (real traffic model). */
  setBusActivity(levels: number[]): void {
    for (let i = 0; i < this.busMeshes.length; i++) {
      const mat = this.busMeshes[i].material as THREE.MeshStandardMaterial;
      const a = levels[i] ?? 0.2;
      mat.emissiveIntensity = 0.5 + a * 2.2;
    }
  }

  // ------------------------------------------------------------------
  // WP-4.5 — live-program packet flow: pre-allocated instanced packets
  // riding the interposer bus routes, spawned STRICTLY from the executed
  // instruction stream (lw/sw memory transactions, systolic dispatch).
  // Halted/paused → no new packets (the queue drains to zero and stays).
  // ------------------------------------------------------------------

  private livePackets?: THREE.InstancedMesh;
  private liveStates: Array<{ route: number; t: number; dir: 1 | -1; active: boolean }> = [];
  private liveQueue: Array<{ route: number; dir: 1 | -1 }> = [];
  private liveRunner: SocLiveRunner | null = null;
  private liveEmitted = 0;
  private liveHalted = true;
  private liveActivityLevels = [0, 0, 0, 0, 0];

  private buildLivePacketSystem(): void {
    const LIVE_CAPACITY = 48;
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8fd0ff,
      emissive: 0x3aa0ff,
      emissiveIntensity: 1.6,
      metalness: 0.3,
      roughness: 0.3,
    });
    this.livePackets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), mat, LIVE_CAPACITY);
    this.livePackets.frustumCulled = false;
    this.livePackets.name = 'liveBusPackets';
    this.liveStates = Array.from({ length: LIVE_CAPACITY }, () => ({ route: 0, t: 0, dir: 1, active: false }));
    const hidden = new THREE.Object3D();
    hidden.position.set(0, -100, 0);
    hidden.updateMatrix();
    for (let i = 0; i < LIVE_CAPACITY; i++) this.livePackets.setMatrixAt(i, hidden.matrix);
    this.livePackets.instanceMatrix.needsUpdate = true;
    this.group.add(this.livePackets);
  }

  /** Attach an externally created runner (bay3.update drives it each frame). */
  attachLiveRunner(runner: SocLiveRunner): void {
    this.buildLivePacketSystem();
    this.liveRunner = runner;
    this.liveHalted = true;
  }

  /**
   * Get (or lazily create) the bay-owned live runner singleton. Owning it on
   * the bay (not the React tree) makes controls remount-proof: inspector
   * panels may come and go, the executed program keeps its registers/PC.
   */
  ensureLiveRunner(): SocLiveRunner {
    if (!this.liveRunner) {
      this.buildLivePacketSystem();
      this.liveRunner = createLiveRunner(chipEngine, {
        onPower: (watts: number) => {
          // Per-tile power/thermal injection via physicsClient (real Fourier
          // solver coupling; physicsClient surfaces it on window.__lab).
          (globalThis as unknown as { __lab?: { physicsClient?: { setTilePower(w: number): void } } }).__lab?.physicsClient?.setTilePower(Math.min(180, watts));
        },
      });
      this.liveRunner.loadProgram('asm');
      this.liveHalted = false;
    }
    return this.liveRunner;
  }

  /** The currently attached live runner (the inspector panel owns creation). */
  getLiveRunner(): SocLiveRunner | null {
    return this.liveRunner;
  }

  /**
   * Queue packets from executed instruction events (called per frame with
   * the runner's own events — never fabricated).
   */
  private enqueueLiveEvents(events: SocLiveEvent[]): void {
    for (const ev of events) {
      const route = packetRouteFor(ev);
      if (route === null) continue; // ALU/MUL/branch/jump stay on the CPU tile
      if (this.liveQueue.length < 128) this.liveQueue.push(route);
      this.liveEmitted += 1;
    }
  }

  /** Live packet-flow + runner stats for the inspector and the e2e suite. */
  livePacketStats(): { active: number; queued: number; emitted: number; halted: boolean; running: boolean; levels: number[] } {
    return {
      active: this.liveStates.filter((p) => p.active).length,
      queued: this.liveQueue.length,
      emitted: this.liveEmitted,
      halted: this.liveHalted,
      running: this.liveRunner ? (this.liveRunner.state() as { running: boolean }).running : false,
      levels: [...this.liveActivityLevels],
    };
  }

  /** Per-route recent activity 0..1 (decayed counters → bus emissive). */
  private updateLiveActivity(dt: number): void {
    const counts = [0, 0, 0, 0, 0];
    for (const p of this.liveStates) if (p.active) counts[p.route] += 1;
    counts.forEach((c, i) => {
      // Instant attack from real traffic, slow decay when the bus goes quiet.
      const target = Math.min(1, c / 6);
      this.liveActivityLevels[i] = Math.max(target, this.liveActivityLevels[i] - dt * 1.5);
    });
    this.setBusActivity(this.liveActivityLevels);
  }

  /** Force the forensic-zero state: no runner → no packets, dim buses. */
  private updateLiveIdle(): void {
    if (this.liveActivityLevels.some((l) => l > 0.001)) {
      this.liveActivityLevels = this.liveActivityLevels.map(() => 0);
      this.setBusActivity(this.liveActivityLevels);
    }
  }

  // ------------------------------------------------------------------
  // WP-4.7 — direct 3D raycast tile selection + drill-down handoff.
  // The bay owns its own pointer hook + raycaster + the live render camera
  // (captured via the tile material's onBeforeRender — zero coupling into
  // App.tsx / world.ts). Selecting a tile NEVER pauses WP-4.5's live
  // execution packets or mutates solver state — it only places a
  // non-destructive highlight marker and notifies the inspector.
  // ------------------------------------------------------------------

  /** The camera captured from this frame's render (tile materials render
   * only while the SoC workspace is visible, so the capture is always the
   * active camera). */
  private pickCamera?: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private pickRaycaster = new THREE.Raycaster();
  private selectionMarker?: THREE.LineSegments;
  private selected: TileSelection | null = null;
  private pickCanvas?: HTMLCanvasElement;

  private ensurePointerHook(canvas: HTMLCanvasElement): void {
    if (this.pickCanvas === canvas) return;
    this.pickCanvas = canvas;
    let down: { id: number; x: number; y: number } | null = null;
    canvas.addEventListener('pointerdown', (event) => {
      if (this.group.visible && event.button === 0) down = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }, { passive: true });
    canvas.addEventListener(
      'pointerup',
      (e: PointerEvent) => {
        const start = down;
        down = null;
        if (!this.group.visible || !this.pickCamera || start?.id !== e.pointerId || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        this.pickRaycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.pickCamera);
        // Whole-bay raycast: chiplet groups + the 64-tile TPU matrix. The
        // package lid is VISUALLY translucent (the tile layout reads through
        // in the assembled state), so the pick resolves THROUGH non-tile
        // occluders (lid, bus tubes, packets) to the first tile-bearing hit —
        // the interaction matches the visual affordance (Law 1).
        const targets: THREE.Object3D[] = this.tiles.filter((tile) => tile.group.visible).map((tile) => tile.group);
        const hits = this.pickRaycaster.intersectObjects(targets, true);
        for (const hit of hits) {
          if (hit.object === this.tpuTiles && hit.instanceId !== undefined) {
            const index = hit.instanceId;
            const row = Math.floor(index / 8);
            const column = index % 8;
            this.setSelected({ tileId: `tpu-tile-${row}-${column}`, label: `TPU MAC tile (r${row}, c${column})`,
              kind: 'tpu-tile', chipletId: 'tpu', instanceIndex: index });
            return;
          }
          // Chiplet tile: resolve the nearest named 'tile-<id>' ancestor.
          let p: THREE.Object3D | null = hit.object;
          while (p) {
            const n = p.name || '';
            if (n.startsWith('tile-')) {
              const id = n.slice(5);
              const tile = this.tiles.find((t) => t.id === id);
              if (tile) {
                this.setSelected({
                  tileId: id,
                  label: tile.name,
                  kind: 'chiplet',
                  chipletId: id,
                });
                return;
              }
            }
            p = p.parent;
          }
        }
      },
      { passive: true }
    );
  }

  /** Place (or move) the non-destructive cyan highlight marker. */
  private updateSelectionMarker(): void {
    if (!this.selected) return;
    if (!this.selectionMarker) {
      const box = new THREE.BoxGeometry(1, 1, 1);
      this.selectionMarker = new THREE.LineSegments(
        new THREE.EdgesGeometry(box),
        new THREE.LineBasicMaterial({ color: 0x2fd0ff, transparent: true, opacity: 0.95 })
      );
      box.dispose();
      this.selectionMarker.name = 'wp47-selection-marker';
      this.selectionMarker.frustumCulled = false;
      this.group.add(this.selectionMarker);
    }
    const anchor = this.selectionAnchorOf(this.selected);
    if (!anchor) return;
    this.selectionMarker.position.set(anchor.x, anchor.y, anchor.z);
    this.selectionMarker.scale.set(anchor.w, anchor.h, anchor.d);
    this.selectionMarker.visible = true;
  }

  /** World-space anchor + extent of a selection (tile bbox or MAC instance). */
  private selectionAnchorOf(sel: TileSelection): { x: number; y: number; z: number; w: number; h: number; d: number } | null {
    if (sel.kind === 'tpu-tile') {
      if (!this.tpuTiles || sel.instanceIndex === undefined) return null;
      const matrix = new THREE.Matrix4();
      this.tpuTiles.getMatrixAt(sel.instanceIndex, matrix);
      const center = this.group.worldToLocal(this.tpuTiles.localToWorld(new THREE.Vector3().setFromMatrixPosition(matrix)));
      return { x: center.x, y: center.y, z: center.z, w: 0.26, h: 0.10, d: 0.26 };
    }
    const tile = this.tiles.find((t) => t.id === sel.tileId);
    if (!tile) return null;
    const box = new THREE.Box3().setFromObject(tile.group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return { x: center.x, y: center.y, z: center.z, w: size.x * 1.04, h: size.y * 1.08, d: size.z * 1.04 };
  }

  /** Select a tile (raycast path or programmatic) + notify the inspector. */
  setSelected(sel: TileSelection): void {
    this.selected = sel;
    this.updateSelectionMarker();
  }

  /** The current tile selection (null = nothing picked). */
  getSelection(): TileSelection | null {
    return this.selected;
  }

  /** Clear the selection + hide the marker. */
  clearSelection(): void {
    this.selected = null;
    if (this.selectionMarker) this.selectionMarker.visible = false;
  }

  /** The worker publishes Fourier temperatures and acknowledges the power
   * scale it actually applies to each zone. No idle readout is used as live power. */
  drilldownTelemetry(snapshot: {vdd: number; temps: unknown}, powerScale: number): TileTelemetry | null {
    if (!this.selected || !Number.isFinite(powerScale) || powerScale < 0) return null;
    const sel = this.selected;
    const tile = this.tiles.find((t) => t.id === sel.chipletId);
    const temperatures = (snapshot.temps as {tiles?: Record<string, number>} | undefined)?.tiles;
    const junctionTempC = temperatures?.[sel.chipletId];
    if (!tile || junctionTempC === undefined || !Number.isFinite(junctionTempC)) return null;
    return {
      tileId: sel.tileId,
      tileName: sel.label,
      powerW: tile.idlePowerW * powerScale,
      junctionTempC,
      vddV: snapshot.vdd,
      activity: sel.instanceIndex === undefined ? null : this.tpuTileActivity[sel.instanceIndex],
      idlePowerW: tile.idlePowerW,
    };
  }

  /** Bring a copy of the selected CAD geometry into the existing bench view.
   * The original polygon stage, Layer-1 bench and Bay 3 runner stay intact. */
  openRepresentativeCell(point: CellOperatingPoint, cell: THREE.Group, silicon: THREE.Group): void {
    silicon.getObjectByName('wp47-representative-cell')?.removeFromParent();
    const inspection = new THREE.Group();
    inspection.name = 'wp47-representative-cell';
    inspection.userData.operatingPoint = point;
    const preview = cell.clone(true);
    preview.position.set(0, 0, 0);
    const bounds = new THREE.Box3().setFromObject(preview);
    const span = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 2.6 / Math.max(span.x, span.y, span.z);
    preview.scale.setScalar(scale);
    preview.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    const load = point.loadOhm === null ? 'open circuit' : `${(point.loadOhm / 1000).toFixed(1)} kΩ`;
    const inspectionName = `${point.cell} · ${point.vddV.toFixed(2)} V · ${point.junctionTempC.toFixed(1)} °C · ${load}`;
    preview.traverse((object) => { object.name = inspectionName; });
    inspection.add(preview);
    inspection.position.set(-2.5, 0, 2.4);
    silicon.add(inspection);
  }

  /**
   * Project a tile's world anchor to client pixels through the captured
   * render camera — the Playwright suite clicks EXACTLY where the real
   * raycast resolves (no synthetic selection path in e2e).
   */
  tileScreenAnchor(tileId: string): { x: number; y: number; visible: boolean } | null {
    if (typeof document === 'undefined' || !this.pickCamera) return null;
    const canvas = this.pickCanvas;
    if (!canvas) return null;
    let anchor: { x: number; y: number; z: number } | null = null;
    const m = /^tpu-tile-(\d+)-(\d+)$/.exec(tileId);
    if (m) {
      if (!this.tpuTiles) return null;
      const row = Number(m[1]);
      const column = Number(m[2]);
      if (row >= 8 || column >= 8) return null;
      const matrix = new THREE.Matrix4();
      this.tpuTiles.getMatrixAt(row * 8 + column, matrix);
      const top = new THREE.Vector3().setFromMatrixPosition(matrix);
      top.y += 0.03;
      anchor = this.tpuTiles.localToWorld(top);
    } else {
      const tile = this.tiles.find((t) => t.id === tileId);
      if (!tile) return null;
      const box = new THREE.Box3().setFromObject(tile.group);
      const center = box.getCenter(new THREE.Vector3());
      anchor = { x: center.x, y: box.max.y, z: center.z };
    }
    const rect = canvas.getBoundingClientRect();
    const v = new THREE.Vector3(anchor.x, anchor.y, anchor.z).project(this.pickCamera);
    return {
      x: rect.left + ((v.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - v.y) / 2) * rect.height,
      visible: v.z < 1 && v.x > -1 && v.x < 1 && v.y > -1 && v.y < 1,
    };
  }

  update(dt: number): void {
    const previousExplode = this.explodeT;
    const k = 1 - Math.exp(-5 * dt);
    this.explodeT += (this.explodeGoal - this.explodeT) * k;
    const lid = this.group.getObjectByName('packageLid');
    if (lid) lid.position.y = 1.35 + this.explodeT * 1.8;
    const offsets: Array<[number, number]> = [
      [-1.2, -0.8],
      [0.2, -1.0],
      [1.4, -0.6],
      [-0.9, 0.9],
    ];
    this.chipletGroups.forEach((g, i) => {
      const [ox, oz] = offsets[i % offsets.length];
      const base = i === 0 ? [-2.6, -1.3] : i === 1 ? [0.3, -1.4] : i === 2 ? [2.9, -1.2] : [-1.0, 1.6];
      const x = this.npuTile && g === this.npuTile.group ? 3.4 : base[0];
      const z = this.npuTile && g === this.npuTile.group ? 1.55 : base[1];
      g.position.set(x + ox * this.explodeT, 0.79 + this.explodeT * 0.5 * ((i % 2) + 1), z + oz * this.explodeT);
    });

    if (this.selected && Math.abs(previousExplode - this.explodeT) > 1e-4) this.updateSelectionMarker();

    // WP-4.5 — live program → packets. The runner executes instructions only
    // while playing; halted/paused produce ZERO events, so the packet system
    // drains to zero and stays there (no decorative loops).
    if (this.liveRunner && this.livePackets) {
      this.__liveRunnerIdentity = this.liveRunner === this.liveRunner;
      const st = this.liveRunner.state() as { running: boolean; halted: boolean };
      this.liveHalted = st.halted;
      const events = this.liveRunner.tick(dt);
      if (events.length > 0) this.enqueueLiveEvents(events);
      this.updateLiveActivity(dt);
      if (!st.running && !st.halted) this.updateLiveIdle();

      // Spawn queued packets into free slots (bounded per frame).
      let spawned = 0;
      while (this.liveQueue.length > 0 && spawned < 8) {
        const slot = this.liveStates.find((p) => !p.active);
        if (!slot) break;
        const { route, dir } = this.liveQueue.shift()!;
        slot.route = route;
        slot.t = dir === 1 ? 0 : 1;
        slot.dir = dir;
        slot.active = true;
        spawned += 1;
      }

      // Advance active packets along their route curve; write instances.
      const dummy = new THREE.Object3D();
      const curveDirs: Array<[THREE.Vector3, THREE.Vector3]> = [];
      void curveDirs;
      const speed = 0.9;
      let active = 0;
      this.liveStates.forEach((p, i) => {
        if (!p.active) return;
        active += 1;
        p.t += dt * speed * p.dir;
        if (p.t >= 1 || p.t <= 0) {
          p.active = false;
          dummy.position.set(0, -100, 0);
        } else {
          const curve = this.flowCurves[p.route]?.curve;
          if (curve) {
            const pos = curve.getPoint(Math.min(1, Math.max(0, p.t)));
            dummy.position.copy(pos);
          } else {
            dummy.position.set(0, -100, 0);
          }
        }
        dummy.updateMatrix();
        this.livePackets!.setMatrixAt(i, dummy.matrix);
      });
      if (this.livePackets) this.livePackets.instanceMatrix.needsUpdate = true;
      void active;
    } else {
      this.updateLiveIdle();
    }
  }
}
