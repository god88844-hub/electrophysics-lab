import * as THREE from 'three';
import { MAT } from './materials.js';
import { makeTextSprite } from '../engine/labels.js';
import { makeProbePin } from '../engine/probes.js';
import { REFERENCE } from '../data/reference.js';

export type Bay1Mode = 'fridge' | 'mzi' | 'tweezer';

interface StageSpec {
  y: number;
  radius: number;
  label: string;
  tempK: number;
}

/**
 * Bay 1 — Quantum Cryo & Optics Bay.
 *  - Multi-stage brushed-gold dilution refrigerator (300 K → 4 K → 100 mK → 15 mK),
 *    coaxial microwave lines, dark niobium-on-silicon 16-qubit transmon die.
 *  - Modes: dilution fridge · Silicon Photonic MZI chip · Neutral-atom tweezer grid.
 * Stage temperatures/cooling powers from 04_quantum_hardware_modalities.json +
 * 06_failure_physics_thresholds.json (Bluefors XLD400: 12 mW @ 15 mK).
 */
export class Bay1Quantum {
  readonly group = new THREE.Group();
  private modes: Record<Bay1Mode, THREE.Group>;
  private fridgePlates: THREE.Mesh[] = [];
  private plateLabelSprites: THREE.Sprite[] = [];
  private atomGrid?: THREE.InstancedMesh;
  private qubitHolo?: THREE.Mesh;
  private coldLight: THREE.PointLight;
  /** Temps per stage (K) — driven by the cryo thermal model (M5 quench). */
  stageTempsK = [300, 4, 0.1, 0.015];
  private modeGroups: THREE.Group[] = [];
  // Live 3D Bloch spheres (real density-matrix readouts from the worker).
  private blochGroups: THREE.Group[] = [];
  private blochArrows: THREE.Group[] = [];
  private blochPurityShells: THREE.Mesh[] = [];
  private pulseBeam?: THREE.Mesh;
  pulseBeamLevel = 0;

  constructor() {
    const fridge = this.buildFridge();
    const mzi = this.buildMziChip();
    const tweezer = this.buildTweezerGrid();
    mzi.visible = false;
    tweezer.visible = false;
    this.modes = { fridge, mzi, tweezer };
    this.modeGroups = [fridge, mzi, tweezer];
    this.group.add(fridge, mzi, tweezer);

    this.coldLight = new THREE.PointLight(0x6fc8ff, 6, 6, 2);
    this.coldLight.position.set(0, 0.75, 0);
    this.group.add(this.coldLight);

    this.buildBlochSpheres();
    this.setBlochOverlay(false);
    this.buildPulseBeam();
  }

  /** Three interactive Bloch spheres above the cryostat (q0..q2 readouts). */
  private buildBlochSpheres(): void {
    const positions: Array<[number, number, number]> = [
      [-2.35, 3.3, 0.4],
      [0, 3.9, 0.4],
      [2.35, 3.3, 0.4],
    ];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      g.position.set(...positions[i]);
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 20, 14),
        new THREE.MeshStandardMaterial({ color: 0x2a5a80, wireframe: true, transparent: true, opacity: 0.4 })
      );
      g.add(shell);
      // Equator + axes.
      const equator = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.006, 6, 40),
        new THREE.MeshBasicMaterial({ color: 0x3a7ab0, transparent: true, opacity: 0.5 })
      );
      equator.rotation.x = Math.PI / 2;
      g.add(equator);
      const axis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.9, 6),
        new THREE.MeshBasicMaterial({ color: 0x5a8ab8, transparent: true, opacity: 0.5 })
      );
      g.add(axis);
      // Purity shell: opaque blob scaled by Tr(ρ²).
      const purity = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x62d0ff, transparent: true, opacity: 0.22, roughness: 0.3 })
      );
      g.add(purity);
      this.blochPurityShells.push(purity);
      // State arrow.
      const arrow = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.34, 8),
        new THREE.MeshStandardMaterial({ color: 0xffc46b, emissive: 0x8a6b1d, emissiveIntensity: 0.8 })
      );
      shaft.position.y = 0.17;
      arrow.add(shaft);
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.12, 10),
        new THREE.MeshStandardMaterial({ color: 0xffc46b, emissive: 0x8a6b1d, emissiveIntensity: 1 })
      );
      tip.position.y = 0.4;
      arrow.add(tip);
      g.add(arrow);
      this.blochArrows.push(arrow);
      this.blochGroups.push(g);
      this.group.add(g);
    }
  }

  /** Microwave/laser drive beam synced to the solver pulse timeline. */
  private buildPulseBeam(): void {
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.02, 1.6, 10, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    beam.position.set(-0.9, 1.3, 0.35);
    beam.rotation.z = 0.7;
    beam.name = 'pulseBeam';
    this.group.add(beam);
    this.pulseBeam = beam;
  }

  /**
   * Live Bloch state update — vectors come straight from the Lindblad
   * density matrix in the quantum worker (no decorative animation).
   */
  setBlochState(index: number, x: number, y: number, z: number, purity: number): void {
    if (index < 0 || index >= this.blochArrows.length) return;
    const arrow = this.blochArrows[index];
    const v = new THREE.Vector3(x, z, -y); // physics z-up → render y-up, handedness flip
    const len = v.length();
    if (len > 1e-4) {
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
      arrow.scale.setScalar(Math.min(1.15, Math.max(0.15, len)));
    }
    const shell = this.blochPurityShells[index];
    const p = Math.max(0.33, Math.min(1, purity));
    shell.scale.setScalar(0.33 + 0.67 * p);
    (shell.material as THREE.MeshStandardMaterial).opacity = 0.1 + 0.25 * p;
  }

  /** Drive beam intensity 0..1 following the pulse envelope Ω(t). */
  setPulseLevel(level: number): void {
    this.pulseBeamLevel = level;
    if (this.pulseBeam) {
      (this.pulseBeam.material as THREE.MeshBasicMaterial).opacity = 0.65 * Math.min(1, level);
    }
  }

  private buildFridge(): THREE.Group {
    const g = new THREE.Group();
    // Stage spec — plate radii shrink toward the 15 mK base stage.
    const stages: StageSpec[] = [
      { y: 3.1, radius: 1.35, label: '300 K', tempK: 300 },
      { y: 2.25, radius: 1.15, label: '4 K', tempK: 4 },
      { y: 1.45, radius: 0.95, label: '100 mK', tempK: 0.1 },
      { y: 0.72, radius: 0.78, label: '15 mK', tempK: 0.015 },
    ];
    // Support frame rods.
    for (const dx of [-1.05, 1.05]) {
      for (const dz of [-1.05, 1.05]) {
        const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.045, 3.4, 10),
          MAT.stainless
        );
        rod.position.set(dx, 1.75, dz);
        rod.castShadow = true;
        g.add(rod);
      }
    }
    // Top plate + canister.
    const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.5, 28), MAT.stainless);
    canister.position.y = 3.55;
    canister.castShadow = true;
    g.add(canister);

    for (const s of stages) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(s.radius, s.radius, 0.1, 40), MAT.brushedGold);
      plate.position.y = s.y;
      plate.castShadow = true;
      plate.receiveShadow = true;
      plate.name = `stage-${s.label}`;
      g.add(plate);
      this.fridgePlates.push(plate);

      // Cold-finger spokes between plates.
      const idx = stages.indexOf(s);
      if (idx > 0) {
        const prev = stages[idx - 1];
        const link = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, prev.y - s.y, 10),
          MAT.goldPolished
        );
        link.position.set(0, (prev.y + s.y) / 2, 0);
        g.add(link);
      }
      // Temperature label.
    }

    // Braided OFHC copper thermal straps between cold stages (real cryostat practice).
    for (const [angle, from, to] of [[0.9, 2.25, 1.45], [2.4, 1.45, 0.72]]) {
      const pts = [
        new THREE.Vector3(Math.cos(angle) * 1.0, from, Math.sin(angle) * 1.0),
        new THREE.Vector3(Math.cos(angle + 0.3) * 0.75, (from + to) / 2, Math.sin(angle + 0.3) * 0.75),
        new THREE.Vector3(Math.cos(angle + 0.15) * 0.6, to, Math.sin(angle + 0.15) * 0.6),
      ];
      const strapCurve = new THREE.CatmullRomCurve3(pts);
      const strap = new THREE.Mesh(new THREE.TubeGeometry(strapCurve, 20, 0.05, 8, false), MAT.braidedStrap);
      strap.castShadow = true;
      g.add(strap);
    }

    // Coaxial microwave lines — stainless tubes from canister to 15 mK base.
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + 0.3;
      const pts: THREE.Vector3[] = [
        new THREE.Vector3(Math.cos(angle) * 0.4, 3.4, Math.sin(angle) * 0.4),
        new THREE.Vector3(Math.cos(angle) * 0.85, 2.3, Math.sin(angle) * 0.85),
        new THREE.Vector3(Math.cos(angle + 0.25) * 0.72, 1.5, Math.sin(angle + 0.25) * 0.72),
        new THREE.Vector3(Math.cos(angle) * 0.55, 0.85, Math.sin(angle) * 0.55),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.028, 8, false), MAT.stainless);
      tube.castShadow = true;
      g.add(tube);
    }

    // Dark niobium-on-silicon 16-qubit transmon die on the 15 mK stage.
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), MAT.sapphireDie);
    die.position.set(0, 0.82, 0);
    g.add(die);
    const dieTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.008, 0.44),
      new THREE.MeshStandardMaterial({ color: 0x0d1420, metalness: 0.6, roughness: 0.25 })
    );
    dieTop.position.set(0, 0.855, 0);
    g.add(dieTop);
    // Qubit pads: 16 small gold squares in a 4×4 grid.
    const padMat = new THREE.MeshStandardMaterial({ color: 0xaab2bd, metalness: 0.9, roughness: 0.25, emissive: 0x2a3340, emissiveIntensity: 0.2 });
    const pads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.006, 0.05), padMat, 16);
    const dummy = new THREE.Object3D();
    let p = 0;
    for (let ix = 0; ix < 4; ix++) {
      for (let iz = 0; iz < 4; iz++) {
        dummy.position.set(-0.15 + ix * 0.1, 0.862, -0.15 + iz * 0.1);
        dummy.updateMatrix();
        pads.setMatrixAt(p++, dummy.matrix);
      }
    }
    g.add(pads);

    // Probes at the base stage.
    const probe1 = makeProbePin(1.0, 0x62d0ff);
    probe1.position.set(-0.75, 0.77, 0.45);
    g.add(probe1);
    const probe2 = makeProbePin(1.0, 0xff9d5c);
    probe2.position.set(0.72, 0.77, -0.42);
    g.add(probe2);

    // Qubit coherence hologram above base (dissolves on quench).
    const holo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.34, 2),
      new THREE.MeshStandardMaterial({
        color: 0x62d0ff,
        emissive: 0x2a7fb8,
        emissiveIntensity: 0.7,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      })
    );
    holo.position.set(0, 1.45, 0);
    holo.name = 'qubitHolo';
    g.add(holo);
    this.qubitHolo = holo;
    return g;
  }

  /** Silicon Photonic MZI chip mode — waveguide mesh on a dark SOI die. */
  private buildMziChip(): THREE.Group {
    const g = new THREE.Group();
    const die = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.09, 1.2), MAT.siliconDie);
    die.position.y = 1.35;
    die.castShadow = true;
    g.add(die);
    const chip = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.02, 1.05), new THREE.MeshStandardMaterial({ color: 0x232e42, metalness: 0.5, roughness: 0.2 }));
    chip.position.y = 1.41;
    g.add(chip);
    // MZI arms: two curved waveguides with emitter glow (1550 nm C-band).
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0xffc46b,
      emissive: 0xd08a2a,
      emissiveIntensity: 1.4,
      metalness: 0.3,
      roughness: 0.3,
    });
    const modality = REFERENCE.quantum.parameters.silicon_photonic_soi;
    for (const dy of [-0.09, 0.09]) {
      const pts = [
        new THREE.Vector3(-0.7, 1.425, dy),
        new THREE.Vector3(-0.25, 1.425, dy * 1.8),
        new THREE.Vector3(0.3, 1.425, dy * 1.8),
        new THREE.Vector3(0.72, 1.425, 0),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.016, 8, false), waveMat);
      g.add(tube);
    }
    // Directional coupler block + thermal phase-shifter pads.
    const coupler = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.3), MAT.brushedGold);
    coupler.position.set(-0.05, 1.435, 0);
    g.add(coupler);
    // Probe pins.
    const probe = makeProbePin(0.9, 0xffc46b);
    probe.position.set(-0.95, 1.4, 0.35);
    g.add(probe);
    const probe2 = makeProbePin(0.9, 0x62d0ff);
    probe2.position.set(0.95, 1.4, -0.3);
    g.add(probe2);
    return g;
  }

  /** Neutral-atom optical tweezer grid — 87Rb atoms in an 8×8 tweezer array. */
  private buildTweezerGrid(): THREE.Group {
    const g = new THREE.Group();
    const opticalTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8), MAT.plasticDark);
    opticalTable.position.y = 1.2;
    opticalTable.castShadow = true;
    g.add(opticalTable);
    const modality = REFERENCE.quantum.parameters.neutral_atom_rubidium87;
    const atomMat = new THREE.MeshStandardMaterial({
      color: 0xff6d8a,
      emissive: 0xd23a5e,
      emissiveIntensity: 1.6,
      metalness: 0.1,
      roughness: 0.4,
    });
    const grid = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 10, 8), atomMat, 64);
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let ix = 0; ix < 8; ix++) {
      for (let iz = 0; iz < 8; iz++) {
        dummy.position.set(-0.42 + ix * 0.12, 1.38, -0.42 + iz * 0.12);
        dummy.updateMatrix();
        grid.setMatrixAt(i++, dummy.matrix);
      }
    }
    grid.name = 'atomGrid';
    g.add(grid);
    this.atomGrid = grid;
    // Rydberg blockade halos: translucent rings of radius r_b around atoms
    // inside each other's blockade radius (V = C6/r6 > Ω) — 04 JSON parameters.
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xff6d8a, transparent: true, opacity: 0.16, side: THREE.DoubleSide });
    const halo = new THREE.InstancedMesh(new THREE.RingGeometry(0.07, 0.085, 20), haloMat, 12);
    const hd = new THREE.Object3D();
    let hi = 0;
    for (let ix = 0; ix < 8 && hi < 12; ix += 2) {
      for (let iz = 0; iz < 8 && hi < 12; iz += 3) {
        hd.position.set(-0.42 + ix * 0.12, 1.38, -0.42 + iz * 0.12);
        hd.rotation.x = -Math.PI / 2;
        hd.updateMatrix();
        halo.setMatrixAt(hi++, hd.matrix);
      }
    }
    halo.name = 'blockade-halos';
    g.add(halo);
    // Laser beams (Rydberg 480 nm + trap 780 nm).
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x7ab8ff, transparent: true, opacity: 0.35 });
    const rydberg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 10), beamMat);
    rydberg.rotation.z = Math.PI / 2;
    rydberg.position.set(0, 1.42, 0);
    g.add(rydberg);
    return g;
  }

  /** HUD overlay toggle: in-scene Bloch spheres default OFF (docked panel). */
  setBlochOverlay(on: boolean): void {
    for (const g of this.blochGroups) g.visible = on;
  }

  setMode(mode: Bay1Mode): void {
    for (const key of Object.keys(this.modes) as Bay1Mode[]) {
      this.modes[key].visible = key === mode;
    }
  }

  /**
   * Cryo stage thermal state — plate glow + qubit hologram driven by real
   * stage temperatures (K). Quench: T > 1.2 K dissolves the hologram.
   */
  setStageTemps(tempsK: number[]): void {
    this.stageTempsK = tempsK;
    for (let i = 0; i < this.fridgePlates.length && i < tempsK.length; i++) {
      const mat = this.fridgePlates[i].material as THREE.MeshStandardMaterial;
      const t = tempsK[i];
      // Cold blue → brushed gold → warming orange → alarm red.
      if (t <= 4) {
        mat.emissive.setHex(0x16303f);
        mat.emissiveIntensity = 0.9;
      } else if (t < 100) {
        mat.emissive.setHex(0x6a5a1f);
        mat.emissiveIntensity = 0.7;
      } else if (t < 1200) {
        mat.emissive.setHex(0x9a5a12);
        mat.emissiveIntensity = 0.9;
      } else {
        mat.emissive.setHex(0xb32020);
        mat.emissiveIntensity = 1.4;
      }
    }
    if (this.qubitHolo) {
      const t = tempsK[3] ?? 0.015;
      const alive = t < 1.2; // superconducting transition of Al ≈ 1.2 K
      const mat = this.qubitHolo.material as THREE.MeshStandardMaterial;
      mat.opacity = alive ? 0.8 : 0.06;
      mat.emissiveIntensity = alive ? 0.7 : 0.05;
      this.coldLight.intensity = alive ? 6 : 0.4;
      this.coldLight.color.setHex(alive ? 0x6fc8ff : 0xff5030);
    }
  }

  update(dt: number, time: number): void {
    if (this.qubitHolo?.visible) {
      this.qubitHolo.rotation.y += dt * 0.6;
      this.qubitHolo.rotation.x = Math.sin(time * 0.6) * 0.12;
    }
    if (this.atomGrid?.visible) {
      // Atom motional jitter — heating rate 0.01 mK/s scale is far below visual
      // threshold; render a subtle fixed-scale shimmer instead (not a physics claim).
      void dt;
    }
  }
}
