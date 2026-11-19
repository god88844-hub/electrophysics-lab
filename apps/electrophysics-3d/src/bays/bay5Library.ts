import * as THREE from 'three';
import { MAT } from './materials.js';
import { makeTextSprite } from '../engine/labels.js';
import { REFERENCE } from '../data/reference.js';

/**
 * Bay 5 — Offline Physics Library.
 * A quiet reading terminal anchored in 3D: six bound volumes (one per
 * verified JSON reference file) plus a holographic index screen. The actual
 * searchable library is a UI overlay (LibraryOverlay.tsx) fed live by the
 * same JSON files with SHA-256 verification badge.
 */
export class Bay5Library {
  readonly group = new THREE.Group();
  private screenMat: THREE.MeshStandardMaterial;
  private books: Array<{ mesh: THREE.Mesh; file: string; title: string; color: number }> = [];

  constructor() {
    // Reading desk.
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 1.7), new THREE.MeshStandardMaterial({ color: 0x3a2d20, roughness: 0.7, metalness: 0.05 }));
    desk.position.y = 1.0;
    desk.castShadow = true;
    this.group.add(desk);
    for (const [dx, dz] of [
      [-1.1, -0.65],
      [1.1, -0.65],
      [-1.1, 0.65],
      [1.1, 0.65],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.0, 10), MAT.plasticDark);
      leg.position.set(dx, 0.5, dz);
      leg.castShadow = true;
      this.group.add(leg);
    }

    // Six reference volumes — one per verified JSON file.
    const titles: Array<[string, string, number]> = [
      ['01_fundamental_constants.json', 'CODATA 2022 constants', 0x4fc3f7],
      ['02_semiconductor_pdk_silicon.json', 'SKY130A / FreePDK45 / ASAP7', 0xffc107],
      ['03_multiradix_logic_baselines.json', 'Multi-radix logic baselines', 0x8ef0b2],
      ['04_quantum_hardware_modalities.json', 'Quantum hardware modalities', 0xff6d8a],
      ['05_chip_architecture_benchmarks.json', 'Chip architecture benchmarks', 0xb08cff],
      ['06_failure_physics_thresholds.json', 'Failure physics thresholds', 0xff9d5c],
    ];
    for (let i = 0; i < titles.length; i++) {
      const [file, title, color] = titles[i];
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.5, 0.28),
        new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.6 })
      );
      book.position.set(-1.0 + i * 0.4, 1.32, -0.55);
      book.rotation.y = (Math.random() - 0.5) * 0.12;
      book.castShadow = true;
      this.group.add(book);
      this.books.push({ mesh: book, file, title, color });
    }

    // Holographic index screen.
    this.screenMat = new THREE.MeshStandardMaterial({
      color: 0x0a2536,
      emissive: 0x2a8ac0,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.05), this.screenMat);
    screen.position.set(0.2, 1.72, -0.25);
    screen.rotation.x = -0.35;
    this.group.add(screen);
    const label = makeTextSprite('Offline Physics Library — 6 verified datasets · SHA-256 ✓', { scale: 1.0, color: '#9fdcff' });
    label.position.set(0.2, 2.42, -0.1);
    this.group.add(label);
    const cite = makeTextSprite(REFERENCE.manifest.generatedAt.slice(0, 10) + ' · provenance: verified_offline_standard', { scale: 0.72, color: '#6f8aa8' });
    cite.position.set(0.2, 2.3, 0.25);
    this.group.add(cite);

    // Warm desk lamp.
    const lampLight = new THREE.PointLight(0xffc46b, 3.2, 4.5, 2);
    lampLight.position.set(0, 1.9, 0.3);
    this.group.add(lampLight);
  }

  /** Book hover glow by index (linked to overlay search focus). */
  setFocusedBook(index: number): void {
    this.books.forEach((b, i) => {
      const mat = b.mesh.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(i === index ? b.color : 0x000000);
      mat.emissiveIntensity = i === index ? 0.6 : 0;
    });
  }

  /** Screen pulse while integrity verification runs; steady green when verified. */
  setIntegrity(allVerified: boolean, done: boolean): void {
    const mat = this.screenMat;
    if (!done) {
      mat.emissive.setHex(0x2a8ac0);
      mat.emissiveIntensity = 0.6 + 0.3 * Math.sin(performance.now() * 0.004);
    } else if (allVerified) {
      mat.emissive.setHex(0x1f9d55);
      mat.emissiveIntensity = 1.0;
    } else {
      mat.emissive.setHex(0xb32020);
      mat.emissiveIntensity = 1.2;
    }
  }

  update(dt: number, time: number): void {
    void dt;
    void time;
  }
}
