import * as THREE from 'three';
import { MAT } from './materials.js';
import { makeTextSprite } from '../engine/labels.js';
import { makeProbePin } from '../engine/probes.js';
import { SKY130, Q4_PRIMITIVES } from '../data/reference.js';
import { parseSky130Spec } from './silicon/sky130Spec.mjs';
import { Sky130PolyCellViewer } from './silicon/sky130CellViewer.js';
// WP-3.4 geometry source of truth — SHA-256 sealed in data/cad-specs/MANIFEST.json.
import sky130CadSpecRaw from '../../../../data/cad-specs/01_sky130_primitives_geometry.json';

export const SKY130_LAYERS = [
  { key: 'substrate', name: 'Substrate', thickness: 0.22 },
  { key: 'nwell', name: 'nwell', thickness: 0.05 },
  { key: 'psub', name: 'psub', thickness: 0.05 },
  { key: 'diffusion', name: 'Diffusion', thickness: 0.05 },
  { key: 'poly', name: 'Poly', thickness: 0.05 },
  { key: 'li1', name: 'li1', thickness: 0.05 },
  { key: 'mcon', name: 'mcon', thickness: 0.07 },
  { key: 'met1', name: 'met1', thickness: 0.09 },
  { key: 'via', name: 'via', thickness: 0.07 },
  { key: 'met2', name: 'met2', thickness: 0.1 },
  { key: 'via2', name: 'via2', thickness: 0.07 },
  { key: 'met3', name: 'met3', thickness: 0.12 },
] as const;

export type LayerKey = (typeof SKY130_LAYERS)[number]['key'];

interface LayerRecord {
  key: LayerKey;
  name: string;
  group: THREE.Group;
  baseY: number;
  materials: THREE.MeshStandardMaterial[];
}

/**
 * Bay 2 — Silicon Foundry & Multi-Radix Microscope.
 * Reflective dark wafer + the true SKY130A multi-layer 3D metal stack
 * (Substrate → nwell/psub → Diffusion/Poly → li1 → mcon → met1 → via → met2 →
 * via2 → met3) hosting the 4 verified Phase 0 SKY130A Q4 primitives
 * (q4_thresh_det, q4_inv, q4_mux4, q4_half_adder) plus binary inverter/adder
 * comparison cells, with a live Layer-Peel Slicer (L hotkey).
 * Sheet resistances and thicknesses: 02_semiconductor_pdk_silicon.json.
 * WP-3.4: the polygon-accurate cell-inspection stage (`polyCellViewer`,
 * generated from data/cad-specs/01_sky130_primitives_geometry.json) rides the
 * same Layer panel (visibility/opacity) and Layer-Peel Slicer as this rig.
 */
export class Bay2Foundry {
  readonly group = new THREE.Group();
  /** WP-3.4 — true-to-scale per-primitive polygon stage (see silicon/ modules). */
  readonly polyCellViewer: Sky130PolyCellViewer;
  private layers: LayerRecord[] = [];
  private primitiveCells: Array<{ cell: THREE.Group; label: THREE.Sprite | null }> = [];
  private peelT = 0; // animated parameter 0..1 toward goal
  private peelGoal = 0;
  private crossDepthGoal: number = SKY130_LAYERS.length; // 0 = met3 only … 11 = everything
  private crossDepthT: number = SKY130_LAYERS.length;
  /** Flow paths registered for the electron-pulse system (VDD/GND rails). */
  flowCurves: Array<{ id: string; curve: THREE.Curve3; radix: 'binary' | 'q4' }> = [];

  constructor() {
    this.buildWafer();
    this.buildStack();
    this.buildPrimitives();
    this.buildTransistorFins();
    this.buildProbePins();
    // WP-3.4 — polygon-accurate Q4-primitive stage. It sits clear of the
    // default Silicon camera frustum (wafer + die + bench stay the default
    // composition) on the lab floor at 1 stage unit = 1 µm cell scale;
    // zoom out (orbit radius ≥ ~30) or pan right to inspect it. Sandbox/place
    // interaction stays ground-plane-based, so there is no click interference.
    this.polyCellViewer = new Sky130PolyCellViewer(parseSky130Spec(sky130CadSpecRaw));
    this.polyCellViewer.group.position.set(17, 0, 9);
    this.group.add(this.polyCellViewer.group);
    this.applyPeel(0, this.crossDepthGoal, true);
  }

  private buildWafer(): void {
    const wafer = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.14, 64), MAT.waferDark);
    wafer.position.y = 0.62;
    wafer.castShadow = true;
    wafer.receiveShadow = true;
    wafer.name = 'wafer';
    this.group.add(wafer);
    // Notch marker + PDK label.
    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.3), MAT.plasticDark);
    notch.position.set(-2.56, 0.62, 0);
    this.group.add(notch);
  }

  private materialForLayer(key: LayerKey): { mat: THREE.MeshStandardMaterial; kind: 'slab' | 'vias' } {
    switch (key) {
      case 'substrate':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x1a2029, metalness: 0.5, roughness: 0.32 }), kind: 'slab' };
      case 'nwell':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x6a6a3f, transparent: true, opacity: 0.7, metalness: 0.25, roughness: 0.45 }), kind: 'slab' };
      case 'psub':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x3d4450, transparent: true, opacity: 0.66, metalness: 0.25, roughness: 0.5 }), kind: 'slab' };
      case 'diffusion':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x7a5a48, metalness: 0.35, roughness: 0.5 }), kind: 'slab' };
      case 'poly':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x8a3f38, metalness: 0.4, roughness: 0.48 }), kind: 'slab' };
      case 'li1':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x8f949c, metalness: 0.85, roughness: 0.3 }), kind: 'slab' };
      case 'mcon':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x7c8496, metalness: 0.9, roughness: 0.3 }), kind: 'vias' };
      case 'met1':
        return { mat: new THREE.MeshStandardMaterial({ color: 0x3d6a8a, metalness: 0.95, roughness: 0.22 }), kind: 'slab' };
      case 'via':
        return { mat: new THREE.MeshStandardMaterial({ color: 0xbfc5cf, metalness: 0.95, roughness: 0.25 }), kind: 'vias' };
      case 'met2':
        return { mat: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.95, roughness: 0.2 }), kind: 'slab' };
      case 'via2':
        return { mat: new THREE.MeshStandardMaterial({ color: 0xcdd3dd, metalness: 0.95, roughness: 0.25 }), kind: 'vias' };
      case 'met3':
        return { mat: new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.95, roughness: 0.18 }), kind: 'slab' };
    }
  }

  private buildStack(): void {
    const dieW = 4.2;
    const dieD = 2.9;
    let y = 0.7 + SKY130_LAYERS[0].thickness / 2;
    let viasBelow = 0;
    for (let i = 0; i < SKY130_LAYERS.length; i++) {
      const spec = SKY130_LAYERS[i];
      const { mat, kind } = this.materialForLayer(spec.key);
      const layerGroup = new THREE.Group();
      layerGroup.name = `layer-${spec.key}`;
      if (kind === 'slab') {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(dieW, spec.thickness, dieD), mat);
        slab.castShadow = true;
        slab.receiveShadow = true;
        layerGroup.add(slab);
        // Cut-away rail pattern on metal layers (real interconnect look).
        if (spec.key.startsWith('met')) {
          const railMat = new THREE.MeshStandardMaterial({ color: 0x9aa2b2, metalness: 0.95, roughness: 0.3 });
          const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(dieW * 0.94, spec.thickness * 0.35, 0.14), railMat, 7);
          const dummy = new THREE.Object3D();
          for (let r = 0; r < 7; r++) {
            dummy.position.set(0, 0, -dieD / 2 + 0.35 + r * ((dieD - 0.7) / 6));
            dummy.updateMatrix();
            rails.setMatrixAt(r, dummy.matrix);
          }
          layerGroup.add(rails);
        }
      } else {
        // Via/mcon layer: instanced cylindrical vias in a grid.
        const cols = 16;
        const rows = 10;
        const vias = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.045, 0.045, spec.thickness, 8), mat, cols * rows);
        const dummy = new THREE.Object3D();
        let v = 0;
        for (let cx = 0; cx < cols; cx++) {
          for (let cz = 0; cz < rows; cz++) {
            dummy.position.set(-dieW / 2 + 0.3 + cx * ((dieW - 0.6) / (cols - 1)), 0, -dieD / 2 + 0.28 + cz * ((dieD - 0.56) / (rows - 1)));
            dummy.updateMatrix();
            vias.setMatrixAt(v++, dummy.matrix);
          }
        }
        layerGroup.add(vias);
      }
      layerGroup.position.y = y;
      this.group.add(layerGroup);
      this.layers.push({ key: spec.key, name: spec.name, group: layerGroup, baseY: y, materials: [mat] });

      // Vias visually bridge: place a thin link slab under via layers is skipped;
      // instead vias span between consecutive layer heights.
      void viasBelow;
      y += spec.thickness / 2 + (i + 1 < SKY130_LAYERS.length ? SKY130_LAYERS[i + 1].thickness / 2 : 0);
      viasBelow++;
    }
    const stackTop = y;
    for (const layer of this.layers) {
    }
    this.stackTopY = stackTop;
    // Supply rails on met2 (VDD) and met3 (GND return) — real current paths.
    // Tubes + flow curves are parented to their metal layer so they ride the peel.
    const met2 = this.layers.find((l) => l.key === 'met2')!;
    const met3 = this.layers.find((l) => l.key === 'met3')!;
    const railPts = (zOff: number, localY: number) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.9, localY, zOff),
        new THREE.Vector3(-0.8, localY, zOff),
        new THREE.Vector3(0.3, localY, zOff),
        new THREE.Vector3(1.9, localY, zOff),
      ]);
    const vddCurve = railPts(-1.15, 0.08);
    const gndCurve = railPts(1.15, 0.1);
    this.flowCurves.push({ id: 'vdd-met2', curve: vddCurve, radix: 'q4' });
    this.flowCurves.push({ id: 'gnd-met3', curve: gndCurve, radix: 'q4' });
    for (const [fc, host] of [
      [this.flowCurves[0], met2],
      [this.flowCurves[1], met3],
    ] as const) {
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(fc.curve, 32, 0.03, 8, false),
        new THREE.MeshStandardMaterial({ color: 0xe6c15c, metalness: 1, roughness: 0.2, emissive: 0x6a5010, emissiveIntensity: 0.4 })
      );
      tube.castShadow = true;
      host.group.add(tube);
    }
  }

  /** KLayout-style per-layer opacity (0..1) for the layer panel. */
  setLayerOpacity(key: string, opacity: number): void {
    const layer = this.layers.find((l) => l.key === key);
    if (layer) {
      for (const mat of layer.materials) {
        mat.transparent = true;
        mat.opacity = Math.max(0.05, Math.min(1, opacity));
      }
    }
    // WP-3.4: the polygon viewer reuses the same Layer panel control.
    this.polyCellViewer.setLayerOpacity(key, opacity);
  }

  /** KLayout-style per-layer visibility toggle (M13 layer panel). */
  setLayerVisibility(visible: Record<string, boolean>): void {
    for (const layer of this.layers) {
      const show = visible[layer.key] ?? true;
      layer.group.visible = show;
    }
    // WP-3.4: the polygon viewer reuses the same Layer panel control.
    this.polyCellViewer.setLayerVisibility(visible);
  }

  /** Current peel offset (world Y) of a layer — lets flow pulses ride the peel. */
  getLayerOffsetY(key: LayerKey): number {
    const layer = this.layers.find((l) => l.key === key);
    return layer ? layer.group.position.y - layer.baseY : 0;
  }

  private stackTopY = 0;

  /** 4 verified Q4 primitives + binary comparison cells on met3 (ride the peel). */
  private buildPrimitives(): void {
    const met3 = this.layers.find((l) => l.key === 'met3')!;
    const polyFingersGroup = new THREE.Group();
    met3.group.add(polyFingersGroup);
    const met3Base = met3.baseY;
    const zTop = this.stackTopY + 0.08 - met3Base; // local to met3 group
    const cells = [
      ...Q4_PRIMITIVES.map((p) => ({ name: p.cell_name, note: p.function, radix: 'q4' as const })),
      { name: 'binary_inv', note: 'binary inverter (radix-2 comparison)', radix: 'binary' as const },
      { name: 'binary_half_adder', note: 'binary half adder (radix-2 comparison)', radix: 'binary' as const },
    ];
    const cols = 3;
    for (let i = 0; i < cells.length; i++) {
      const cx = -1.35 + (i % cols) * 1.35;
      const cz = i < cols ? -0.72 : 0.72;
      const cell = new THREE.Group();
      const isQ4 = cells[i].radix === 'q4';
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isQ4 ? 0xe6c15c : 0x9fd0ff,
        emissive: isQ4 ? 0x7a5c14 : 0x1c4a7a,
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.3,
        transparent: true,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.07, 0.62), bodyMat);
      body.castShadow = true;
      cell.add(body);
      // Sub-cell gate blocks (gate_count from the verified manifest).
      const gateCount = i < 4 ? Q4_PRIMITIVES[i].gate_count : 6;
      const blocks = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.1, 0.05, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x2a3342, metalness: 0.6, roughness: 0.4 }),
        gateCount
      );
      const dummy = new THREE.Object3D();
      for (let b = 0; b < gateCount; b++) {
        dummy.position.set(-0.42 + (b % 5) * 0.21, 0.06, b < 5 ? -0.14 : 0.14);
        dummy.updateMatrix();
        blocks.setMatrixAt(b, dummy.matrix);
      }
      cell.add(blocks);
      cell.position.set(cx, zTop + 0.04, cz);
      met3.group.add(cell);

      // Cell-detail geometry: brick-red poly gate fingers, tungsten li1 stubs,
      // met1 pads — routed to the cell's verified gate_count from Phase 0.
      const fingers = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.06, 0.055, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x8a3f38, metalness: 0.3, roughness: 0.5 }),
        Math.min(8, gateCount)
      );
      const liStub = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.1, 0.045, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x8f949c, metalness: 0.8, roughness: 0.35 }),
        Math.min(8, gateCount)
      );
      const pad = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.12, 0.02, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x3d6a8a, metalness: 0.8, roughness: 0.3 }),
        Math.min(8, gateCount)
      );
      const fd = new THREE.Object3D();
      for (let f = 0; f < Math.min(8, gateCount); f++) {
        const fx = -0.36 + f * 0.12;
        fd.position.set(fx, 0.055, 0);
        fd.rotation.set(0, 0, 0);
        fd.updateMatrix();
        fingers.setMatrixAt(f, fd.matrix);
        fd.position.set(fx, 0.085, 0.2);
        fd.updateMatrix();
        liStub.setMatrixAt(f, fd.matrix);
        fd.position.set(fx, 0.105, -0.18);
        fd.updateMatrix();
        pad.setMatrixAt(f, fd.matrix);
      }
      polyFingersGroup.add(fingers, liStub, pad);
      this.primitiveCells.push({ cell, label: null as unknown as THREE.Sprite });
    }
    // Verified badge.
  }

  /** Silicon transistors visible at the diffusion/poly level (fin array). */
  private buildTransistorFins(): void {
    const finY = this.layers.find((l) => l.key === 'diffusion')!.baseY + 0.045;
    const fins = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.16, 0.06, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x86755f, metalness: 0.4, roughness: 0.5 }),
      24
    );
    const dummy = new THREE.Object3D();
    let f = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        dummy.position.set(-1.5 + c * 0.6, finY, -0.9 + r * 0.6);
        dummy.updateMatrix();
        fins.setMatrixAt(f++, dummy.matrix);
      }
    }
    fins.name = 'transistorFins';
    this.group.add(fins);
  }

  private buildProbePins(): void {
    const met3 = this.layers.find((l) => l.key === 'met3')!;
    const topY = this.stackTopY + 0.16 - met3.baseY;
    const p1 = makeProbePin(1.0, 0xffc46b);
    p1.position.set(-2.15, topY, 0);
    met3.group.add(p1);
    const p2 = makeProbePin(1.0, 0x62d0ff);
    p2.position.set(2.15, topY, 0.2);
    met3.group.add(p2);
    const p3 = makeProbePin(1.0, 0xff6d8a);
    p3.position.set(2.05, topY, -0.7);
    met3.group.add(p3);
  }

  /**
   * Layer-Peel Slicer.
   * @param exploded 0..1 — L-key toggle separates the stack (met3 stays, silicon drops away).
   * @param crossDepth 0..12 — microscope focal plane: layers above the plane lift & fade.
   */
  setPeelTargets(exploded: number, crossDepth: number): void {
    this.peelGoal = exploded;
    this.crossDepthGoal = crossDepth;
    // WP-3.4: the polygon viewer rides the same Layer-Peel Slicer.
    this.polyCellViewer.setPeelTargets(exploded, crossDepth);
  }

  private applyPeel(exploded: number, crossDepth: number, instant = false): void {
    this.peelT = exploded;
    this.crossDepthT = crossDepth;
    const count = this.layers.length;
    const peeledCount = Math.min(count, Math.max(0, crossDepth)); // top layers peeled away
    this.layers.forEach((layer, i) => {
      const gap = 0.55;
      // Exploded separation: bottom layers stay put, top layers lift highest.
      const explodeLift = exploded * gap * i;
      // Microscope focal plane: the topmost `peeledCount` layers lift + fade,
      // peeling from Metal 3 downwards to the silicon transistors.
      const isPeeled = i >= count - peeledCount;
      const sectionLift = isPeeled ? (i - (count - peeledCount) + 1) * 0.42 : 0;
      const targetOpacity = isPeeled ? 0.12 : 1;
      layer.group.position.y = layer.baseY + explodeLift + sectionLift;
      for (const mat of layer.materials) {
        mat.transparent = true;
        mat.opacity = instant ? targetOpacity : mat.opacity + (targetOpacity - mat.opacity) * 0.3;
      }
    });
  }

  update(dt: number): void {
    const eps = 0.001;
    if (Math.abs(this.peelT - this.peelGoal) > eps || Math.abs(this.crossDepthT - this.crossDepthGoal) > eps) {
      const k = 1 - Math.exp(-6 * dt);
      this.peelT += (this.peelGoal - this.peelT) * k;
      this.crossDepthT += (this.crossDepthGoal - this.crossDepthT) * k;
      this.applyPeel(this.peelT, Math.round(this.crossDepthT));
    }
    this.polyCellViewer.update(dt);
    // Primitive cells gently pulse with verified-status glow (visual status only).
    const time = performance.now() * 0.001;
    this.primitiveCells.forEach(({ cell }, i) => {
      const body = cell.children[0] as THREE.Mesh;
      const mat = body.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.42 + 0.12 * Math.sin(time * 1.4 + i);
    });
  }

  /** Die-space Y of a layer for FX anchoring (arc FX targets met1 gates). */
  layerY(key: LayerKey): number {
    return this.layers.find((l) => l.key === key)?.baseY ?? this.stackTopY;
  }
}
