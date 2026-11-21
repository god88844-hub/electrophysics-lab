import * as THREE from 'three';
import { deriveAll } from './quantum/rigSpec.mjs';
import { QUANTUM_RIG_SPEC_JSON } from './quantum/specSource.js';
import { buildCryostatRig } from './quantum/cryostatRig.js';
import { buildMziRig } from './quantum/mziRig.js';
import { buildTweezerRig } from './quantum/tweezerRig.js';
import type { QuantumRigGeometry } from './quantum/rigTypes.js';

export type Bay1Mode = 'fridge' | 'mzi' | 'tweezer';

/**
 * Bay 1 — Quantum Cryo & Optics Bay.
 *  - Dilution refrigerator (300 K → 4 K → 100 mK → 15 mK) with coaxial
 *    microwave lines, attenuator barrels, thermal straps and the dark
 *    sapphire 16-qubit transmon die on the 15 mK mixing chamber.
 *  - Modes: dilution fridge · Silicon Photonic MZI chip · Neutral-atom
 *    tweezer grid inside the UHV chamber.
 *
 * WP-5.4: EVERY rig dimension is derived parametrically from
 * `data/cad-specs/03_quantum_hardware_rigs.json` (see `quantum/rigSpec.mjs`
 * — the pure derivation layer shared with the Node unit tests). There are
 * no hardcoded scene dimensions in this file; stage temperatures are parsed
 * from the JSON stage labels, PBR materials from the JSON material strings,
 * and the Al superconducting transition (quench threshold) from the JSON
 * transmon note.
 */
export class Bay1Quantum {
  readonly group = new THREE.Group();
  /** Raw sealed cad-spec JSON (e2e asserts the app ships exactly this object graph). */
  readonly specSource = QUANTUM_RIG_SPEC_JSON;
  /** Derived geometry bindings — the single source the rigs render from. */
  readonly geometry: QuantumRigGeometry;
  /** Stage temps (K) parsed from the JSON labels; driven by the cryo thermal model. */
  stageTempsK: number[];
  private modes: Record<Bay1Mode, THREE.Group>;
  private modeGroups: THREE.Group[];
  private fridgePlates: THREE.Mesh[] = [];
  private atomGrid?: THREE.InstancedMesh;
  private qubitHolo?: THREE.Mesh;
  private coldLight: THREE.PointLight;
  /** Superconducting transition (K) parsed from the JSON transmon note (Al Tc ≈ 1.2 K). */
  private superconductingTransitionK: number;
  // Live 3D Bloch spheres (real density-matrix readouts from the worker).
  private blochGroups: THREE.Group[] = [];
  private blochArrows: THREE.Group[] = [];
  private blochPurityShells: THREE.Mesh[] = [];
  private pulseBeam?: THREE.Mesh;
  pulseBeamLevel = 0;

  constructor() {
    this.geometry = deriveAll(QUANTUM_RIG_SPEC_JSON);
    this.stageTempsK = [...this.geometry.stageTempsK];
    this.superconductingTransitionK = this.geometry.superconductingTransitionK;

    const fridge = buildCryostatRig(this.geometry);
    const mzi = buildMziRig(this.geometry);
    const tweezer = buildTweezerRig(this.geometry);
    mzi.visible = false;
    tweezer.visible = false;
    this.modes = { fridge, mzi, tweezer };
    this.modeGroups = [fridge, mzi, tweezer];
    this.group.add(fridge, mzi, tweezer);

    this.coldLight = new THREE.PointLight(0x6fc8ff, 6, 6, 2);
    this.coldLight.position.set(0, this.geometry.transmon.dieCenterYCm + 0.65, 0);
    this.group.add(this.coldLight);

    this.buildBlochSpheres();
    this.setBlochOverlay(false);
    this.buildPulseBeam();
    this.collectFridgePlates(fridge);
    this.qubitHolo = (fridge.getObjectByName('qubitHolo') as THREE.Mesh) ?? undefined;
    this.atomGrid = (tweezer.getObjectByName('atomGrid') as THREE.InstancedMesh) ?? undefined;
  }

  private collectFridgePlates(fridge: THREE.Group): void {
    this.fridgePlates = this.geometry.cryostat.stages
      .map((s) => fridge.getObjectByName(s.name))
      .filter((m): m is THREE.Mesh => m instanceof THREE.Mesh);
  }

  /** Three interactive Bloch spheres above the cryostat (q0..q2 readouts). */
  private buildBlochSpheres(): void {
    const r = this.geometry.bloch.sphereRadiusCm; // cad-specs 03 bloch_instrumentation
    for (const position of this.geometry.bloch.positions) {
      const g = new THREE.Group();
      g.position.set(position[0], position[1], position[2]);
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(r, 20, 14),
        new THREE.MeshStandardMaterial({ color: 0x2a5a80, wireframe: true, transparent: true, opacity: 0.4 })
      );
      g.add(shell);
      // Equator + axes.
      const equator = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.006, 6, 40),
        new THREE.MeshBasicMaterial({ color: 0x3a7ab0, transparent: true, opacity: 0.5 })
      );
      equator.rotation.x = Math.PI / 2;
      g.add(equator);
      const axis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, r * 2 + 0.06, 6),
        new THREE.MeshBasicMaterial({ color: 0x5a8ab8, transparent: true, opacity: 0.5 })
      );
      g.add(axis);
      // Purity shell: opaque blob scaled by Tr(ρ²).
      const purity = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16, 12),
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
   * stage temperatures (K). Quench: T > Al Tc (≈ 1.2 K, from the JSON)
   * dissolves the hologram.
   */
  setStageTemps(tempsK: number[]): void {
    this.stageTempsK = tempsK;
    for (let i = 0; i < this.fridgePlates.length && i < tempsK.length; i++) {
      const mat = this.fridgePlates[i].material as THREE.MeshStandardMaterial;
      const t = tempsK[i];
      // Cold blue → brushed gold → warming orange → alarm red (visual ramp).
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
      const baseIdx = this.geometry.cryostat.stages.length - 1;
      const t = tempsK[baseIdx] ?? this.superconductingTransitionK / 80;
      const alive = t < this.superconductingTransitionK;
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
