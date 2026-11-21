import * as THREE from 'three';
import { buildAllCellLayouts } from './sky130Layout.mjs';
import type { Sky130Spec } from './sky130Spec.mjs';

/**
 * WP-3.4 — Polygon-accurate SKY130A Q4-primitive 3D layer viewer.
 *
 * A dedicated "cell inspection microscope stage" inside Bay 2: one true-to-scale
 * (1 horizontal scene unit = 1 µm) multi-layer rig per verified primitive —
 * substrate → nwell → psub → diffusion → poly → li1 → mcon → met1 → via →
 * met2 → via2 → met3 — generated 100% parametrically from
 * `data/cad-specs/01_sky130_primitives_geometry.json` (zero binary .glb assets,
 * zero hardcoded dimensions: every size/color traces to the JSON, see
 * `sky130Layout.mjs` for the full derivation ledger).
 *
 * KLayout-style layer behavior (reuses the existing Bay 2 Layer panel — no UI
 * changes): per-layer visibility, per-layer opacity and the Layer-Peel Slicer
 * all drive this viewer through Bay2Foundry's existing public API.
 *
 * Law 1/5 (honesty): no permanent floating labels — identification is via the
 * hover callout (meshes carry `cell/role` names) and stage userData carries the
 * exact presentation scale (declared ×3 film exaggeration + declared substrate
 * clip) so no scale is ever hidden.
 * Law 4 (iGPU 60 FPS): one shared unit-box geometry, one InstancedMesh per
 * polygon role, no shadows, no per-frame allocations.
 */

/** Layout polygons grouped per layer (inferred from the JSDoc-typed .mjs modules). */
interface LayoutPolygon {
  x: number;
  z: number;
  w: number;
  d: number;
  yBase: number;
  hScene: number;
  role: string;
  trace: string;
}
interface LayoutLayer {
  key: string;
  thicknessUm: number;
  thicknessScene: number;
  yBase: number;
  yTop: number;
  colorHex: number;
  clearcoat: boolean;
  polygons: LayoutPolygon[];
}
interface LayoutPin {
  name: string;
  index: number;
  x: number;
  z: number;
  layer: string;
}
interface CellLayout {
  cell: { name: string; gates: number; footprintWUm: number; footprintHUm: number };
  layers: LayoutLayer[];
  pins: LayoutPin[];
  counts: Record<string, number>;
  stackTopScene: number;
}

interface ViewerLayerRecord {
  key: string;
  /** One group per cell rig (all carry the same layer key). */
  groups: THREE.Group[];
  /** Shared per-key materials — opacity applies across all 4 cells at once. */
  materials: THREE.MeshStandardMaterial[];
  baseY: number;
}

export class Sky130PolyCellViewer {
  /** Stage root — parented to bay2.group. 1 unit = 1 µm at cell scale. */
  readonly group = new THREE.Group();
  /** Per-cell rigs keyed by cell name. */
  readonly cells = new Map<string, THREE.Group>();
  /** Layer-key records driving KLayout-style visibility/opacity/peel. */
  private layerRecords: ViewerLayerRecord[] = [];
  private layouts = new Map<string, CellLayout>();
  // Initialized settled at the app's boot default (assembled, no peel) so the
  // mount-time `setLayerPeel(false, 0)` is a no-op — no wasteful fold-in
  // animation, and layer-panel state is deterministic immediately (Law 4).
  private peelT = 0;
  private peelGoal = 0;
  private crossDepthT = 0;
  private crossDepthGoal = 0;
  private sharedBox = new THREE.BoxGeometry(1, 1, 1);
  /** Declared presentation parameters (surfaced for status/e2e — never hidden). */
  readonly presentation: {
    units: 'um';
    verticalExaggeration: number;
    substrateClipUm: number;
    substrateTrueThicknessUm: number;
    source: string;
  };

  constructor(spec: Sky130Spec) {
    this.group.name = 'sky130-poly-cell-stage';
    this.presentation = {
      units: 'um',
      verticalExaggeration: spec.verticalExaggeration,
      substrateClipUm: spec.substrateClipUm,
      substrateTrueThicknessUm: spec.substrateThicknessUm,
      source: 'data/cad-specs/01_sky130_primitives_geometry.json',
    };
    this.group.userData = {
      wp: 'WP-3.4',
      ...this.presentation,
      layerOrder: spec.layers.map((l) => l.key),
      note: `1 scene unit = 1 µm; film stack vertically exaggerated ×${spec.verticalExaggeration} (declared in spec scene_note); substrate clipped at ${spec.substrateClipUm} µm (largest verified cell height; true wafer thickness ${spec.substrateThicknessUm} µm shown by the bay wafer rig)`,
    };
    this.build(spec);
  }

  private build(spec: Sky130Spec): void {
    this.layouts = buildAllCellLayouts(spec) as unknown as Map<string, CellLayout>;
    // Shared per-layer materials (one per layer key across all cell rigs).
    // Colors come verbatim from the spec `materials` strings (parsed hex);
    // substrate uses the declared clearcoat silicon presentation.
    const materialsByKey = new Map<string, THREE.MeshStandardMaterial>();
    for (const layer of spec.layers) {
      const mat =
        layer.clearcoat && layer.key === 'substrate'
          ? new THREE.MeshPhysicalMaterial({ color: layer.colorHex, metalness: 0.5, roughness: 0.32, clearcoat: 0.65, clearcoatRoughness: 0.18 })
          : new THREE.MeshStandardMaterial({
              color: layer.colorHex,
              metalness: layer.key.startsWith('met') || layer.key === 'li1' ? 0.9 : 0.35,
              roughness: layer.key.startsWith('met') || layer.key === 'li1' ? 0.24 : 0.48,
            });
      materialsByKey.set(layer.key, mat);
    }

    // Inter-cell spacing on the stage = one gate pitch (the spec's own grid).
    const gap = spec.gatePitchUm;
    const totalWidth = spec.cells.reduce((sum, c) => sum + c.footprintWUm, 0) + gap * (spec.cells.length - 1);
    let x = -totalWidth / 2;
    const recordsByKey = new Map<string, ViewerLayerRecord>();

    for (const [cellName, layout] of this.layouts) {
      const rig = new THREE.Group();
      rig.name = `poly-cell-${cellName}`;
      rig.position.set(x + layout.cell.footprintWUm / 2, 0, 0);
      rig.userData = {
        cell: cellName,
        gates: layout.cell.gates,
        footprintUm: `${layout.cell.footprintWUm} × ${layout.cell.footprintHUm}`,
        pins: layout.pins.map((p) => ({ name: p.name, x: p.x, z: p.z, layer: p.layer })),
        // Full traceability for status/e2e: per-layer JSON thickness + the
        // exact scene band the viewer derived (declared scale contract).
        layerSceneBands: layout.layers.map((l) => ({
          key: l.key,
          thicknessUm: l.thicknessUm,
          thicknessScene: l.thicknessScene,
          yBase: l.yBase,
          yTop: l.yTop,
        })),
        stackTopScene: layout.stackTopScene,
      };
      for (const layer of layout.layers) {
        const layerGroup = new THREE.Group();
        layerGroup.name = `poly-cell-${cellName}-layer-${layer.key}`;
        layerGroup.position.y = 0; // polygons carry absolute cell-local Y
        const mat = materialsByKey.get(layer.key)!;
        this.addRoleMeshes(layerGroup, cellName, layer, mat);
        rig.add(layerGroup);
        let record = recordsByKey.get(layer.key);
        if (!record) {
          record = { key: layer.key, groups: [], materials: [mat], baseY: layer.yBase };
          recordsByKey.set(layer.key, record);
        }
        record.groups.push(layerGroup);
      }
      this.group.add(rig);
      this.cells.set(cellName, rig);
      x += layout.cell.footprintWUm + gap;
    }
    // Bottom → top records (substrate first … met3 last) for peel indexing.
    this.layerRecords = spec.layers.map((l) => recordsByKey.get(l.key)!);
  }

  /** One InstancedMesh per polygon role (uniform sizes within a role). */
  private addRoleMeshes(layerGroup: THREE.Group, cellName: string, layer: LayoutLayer, mat: THREE.MeshStandardMaterial): void {
    const byRole = new Map<string, LayoutPolygon[]>();
    for (const poly of layer.polygons) {
      const list = byRole.get(poly.role) ?? [];
      list.push(poly);
      byRole.set(poly.role, list);
    }
    for (const [role, polys] of byRole) {
      const mesh = new THREE.InstancedMesh(this.sharedBox, mat, polys.length);
      mesh.name = `${cellName}/${role}`;
      const dummy = new THREE.Object3D();
      polys.forEach((poly, i) => {
        dummy.position.set(poly.x, poly.yBase + poly.hScene / 2, poly.z);
        dummy.scale.set(poly.w, poly.hScene, poly.d);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.userData = { cell: cellName, layer: layer.key, role, trace: polys[0].trace };
      layerGroup.add(mesh);
    }
  }

  /** KLayout-style per-layer visibility (M13 layer panel, reused). */
  setLayerVisibility(visible: Record<string, boolean>): void {
    for (const record of this.layerRecords) {
      const show = visible[record.key] ?? true;
      for (const g of record.groups) g.visible = show;
    }
  }

  /** KLayout-style per-layer opacity 0..1 (Bay 2 layer panel, reused). */
  setLayerOpacity(key: string, opacity: number): void {
    const record = this.layerRecords.find((r) => r.key === key);
    if (!record) return;
    for (const mat of record.materials) {
      mat.transparent = true;
      mat.opacity = Math.max(0.05, Math.min(1, opacity));
    }
  }

  /** Layer-Peel Slicer (L hotkey) — same semantics as the Bay 2 die rig. */
  setPeelTargets(exploded: number, crossDepth: number): void {
    this.peelGoal = exploded;
    this.crossDepthGoal = crossDepth;
  }

  private applyPeel(exploded: number, crossDepth: number, instant = false): void {
    this.peelT = exploded;
    this.crossDepthT = crossDepth;
    const count = this.layerRecords.length;
    const peeledCount = Math.min(count, Math.max(0, crossDepth));
    this.layerRecords.forEach((record, i) => {
      const gapLift = 0.55;
      const explodeLift = exploded * gapLift * i;
      const isPeeled = i >= count - peeledCount;
      const sectionLift = isPeeled ? (i - (count - peeledCount) + 1) * 0.42 : 0;
      const targetOpacity = isPeeled ? 0.12 : 1;
      for (const g of record.groups) g.position.y = explodeLift + sectionLift;
      for (const mat of record.materials) {
        mat.transparent = true;
        mat.opacity = instant ? targetOpacity : mat.opacity + (targetOpacity - mat.opacity) * 0.3;
      }
    });
  }

  /** True once peel/cross-depth animation has settled (deterministic e2e + UX hook). */
  get isIdle(): boolean {
    return Math.abs(this.peelT - this.peelGoal) <= 0.001 && Math.abs(this.crossDepthT - this.crossDepthGoal) <= 0.001;
  }

  update(dt: number): void {
    const eps = 0.001;
    if (Math.abs(this.peelT - this.peelGoal) > eps || Math.abs(this.crossDepthT - this.crossDepthGoal) > eps) {
      const k = 1 - Math.exp(-6 * dt);
      this.peelT += (this.peelGoal - this.peelT) * k;
      this.crossDepthT += (this.crossDepthGoal - this.crossDepthT) * k;
      this.applyPeel(this.peelT, Math.round(this.crossDepthT));
    }
  }

  /** Polygon instance count for a cell/layer (optionally by role) — e2e + unit assertions. */
  countPolygons(cellName: string, layerKey: string, role?: string): number {
    const rig = this.cells.get(cellName);
    if (!rig) return 0;
    const layerGroup = rig.getObjectByName(`poly-cell-${cellName}-layer-${layerKey}`);
    if (!layerGroup) return 0;
    let total = 0;
    layerGroup.traverse((o) => {
      const m = o as THREE.InstancedMesh;
      if (!m.isInstancedMesh) return;
      const u = m.userData as { layer?: string; role?: string };
      if (u.layer !== layerKey) return;
      if (role && u.role !== role) return;
      total += m.count;
    });
    return total;
  }

  /** Verified external pin coordinates (met3 landings) for a cell. */
  pins(cellName: string): LayoutPin[] {
    return (this.layouts.get(cellName)?.pins ?? []) as LayoutPin[];
  }

  /** Total polygon instances across the whole stage (budget sanity for Law 4). */
  totalPolygons(): number {
    let total = 0;
    for (const cellName of this.cells.keys()) {
      const rig = this.cells.get(cellName)!;
      rig.traverse((o) => {
        const m = o as THREE.InstancedMesh;
        if (m.isInstancedMesh) total += m.count;
      });
    }
    return total;
  }

  dispose(): void {
    this.sharedBox.dispose();
  }
}
