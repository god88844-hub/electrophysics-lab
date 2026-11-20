import * as THREE from 'three';
import { MAT } from './materials.js';
import { makeTextSprite } from '../engine/labels.js';
import { makeProbePin } from '../engine/probes.js';

/**
 * Bay 4 — Failure Forensics Vault.
 * Dedicated slow-motion breakdown stage + 100 ms timeline scrubber (UI side)
 * + Forensic Autopsy panel (UI side). The DUT socket position is exported so
 * the M5 physics engine can anchor arcs, char decals and smoke plumes at the
 * exact failing location.
 */
export class Bay4Forensics {
  readonly group = new THREE.Group();
  /** World-space anchor of the DUT gate (arc / char decal origin). */
  dutAnchor = new THREE.Vector3(0, 1.62, 0);
  private dutMat: THREE.MeshStandardMaterial;
  private charDecal: THREE.Mesh;

  private arcLight: THREE.PointLight;
  private faultLamp: THREE.Mesh;
  private arcLine: THREE.Line;
  private arcT = 0;

  constructor() {
    // Vault platform with danger ring.
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.35, 48), MAT.plasticDark);
    platform.position.y = 0.18;
    platform.receiveShadow = true;
    platform.castShadow = true;
    this.group.add(platform);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.05, 8, 64), MAT.dangerStripe);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.37;
    this.group.add(ring);

    // DUT socket + chip (SOA test vehicle — SKY130 inverter).
    const socket = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 1.0), new THREE.MeshStandardMaterial({ color: 0x0e1118, metalness: 0.3, roughness: 0.6 }));
    socket.position.set(0, 0.42, 0);
    this.group.add(socket);
    const dut = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.07, 0.72),
      (this.dutMat = new THREE.MeshStandardMaterial({ color: 0x1c2635, metalness: 0.55, roughness: 0.3, emissive: 0x0d2436, emissiveIntensity: 0.4 }))
    );
    dut.position.set(0, 0.52, 0);
    dut.castShadow = true;
    dut.name = 'dutChip';
    this.group.add(dut);
    // Gate region marker at the DUT centre (highest-field MOSFET gate).
    const gateMarker = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.02, 0.16),
      new THREE.MeshStandardMaterial({ color: 0xe6c15c, metalness: 1, roughness: 0.25 })
    );
    gateMarker.position.set(0, 0.562, 0);
    this.group.add(gateMarker);
    this.dutAnchor.set(0, 0.58, 0);

    // Permanent char decal (hidden until oxide breakdown actually fires).
    this.charDecal = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 20),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.95, transparent: true, opacity: 0 })
    );
    this.charDecal.rotation.x = -Math.PI / 2;
    this.charDecal.position.set(0, 0.565, 0);
    this.charDecal.visible = false;
    this.group.add(this.charDecal);

    // HV probe tower.
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.6, 12), MAT.stainless);
    tower.position.set(-1.1, 1.15, -0.5);
    tower.castShadow = true;
    this.group.add(tower);
    const hvProbe = makeProbePin(0.9, 0xff5030);
    hvProbe.position.set(-0.62, 1.35, -0.28);
    hvProbe.rotation.z = 0.5;
    this.group.add(hvProbe);
    const senseProbe = makeProbePin(0.8, 0x62d0ff);
    senseProbe.position.set(0.75, 0.6, 0.45);
    senseProbe.rotation.z = -0.35;
    this.group.add(senseProbe);

    // Containment glass cylinder (raises during a breakdown event).
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.5, 32, 1, true), MAT.glassShroud);
    glass.position.y = 1.1;
    glass.name = 'containmentGlass';
    this.group.add(glass);

    // Fault status lamp + label.
    this.faultLamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0x1d4d66, emissive: 0x0d3748, emissiveIntensity: 0.8 })
    );
    this.faultLamp.position.set(1.6, 1.25, -0.8);
    this.group.add(this.faultLamp);

    this.arcLight = new THREE.PointLight(0xbfdcff, 0, 7, 2);
    this.arcLight.position.copy(this.dutAnchor).add(new THREE.Vector3(0, 0.35, 0));
    this.group.add(this.arcLight);

    // Breakdown arc: jagged polyline regenerated every frame while active.
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(16 * 3), 3));
    this.arcLine = new THREE.Line(
      arcGeo,
      new THREE.LineBasicMaterial({ color: 0xd8ecff, transparent: true, opacity: 0 })
    );
    this.arcLine.visible = false;
    this.arcLine.frustumCulled = false;
    this.group.add(this.arcLine);
  }

  /** Trigger the oxide-breakdown arc burst at the DUT gate (called on real Vgs trip). */
  triggerArc(durationS = 0.55): void {
    this.arcT = durationS;
    this.arcLine.visible = true;
  }

  private updateArc(dt: number): void {
    if (this.arcT <= 0) {
      if (this.arcLine.visible) {
        this.arcLine.visible = false;
        (this.arcLine.material as THREE.LineBasicMaterial).opacity = 0;
        this.setArcFlash(0);
      }
      return;
    }
    this.arcT -= dt;
    const pos = this.arcLine.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const a = this.dutAnchor;
    const up = new THREE.Vector3(0, 0.5, 0);
    for (let i = 0; i < 16; i++) {
      const f = i / 15;
      arr[i * 3] = a.x + (Math.random() - 0.5) * 0.14 * Math.sin(f * Math.PI);
      arr[i * 3 + 1] = a.y + up.y * f + (Math.random() - 0.5) * 0.03;
      arr[i * 3 + 2] = a.z + (Math.random() - 0.5) * 0.14 * Math.sin(f * Math.PI);
    }
    pos.needsUpdate = true;
    const fade = Math.max(0, this.arcT / 0.55);
    (this.arcLine.material as THREE.LineBasicMaterial).opacity = Math.min(1, fade * 1.6);
    this.setArcFlash(fade * 14);
  }

  /** Set the live VDD readout on the bench label (real slider value). */
  /** Live bench readout moved to the CAD status bar; only the lamp remains. */
  setStatus(text: string, fault: boolean): void {
    void text;
    const lampMat = this.faultLamp.material as THREE.MeshStandardMaterial;
    if (fault) {
      lampMat.emissive.setHex(0xff2010);
      lampMat.emissiveIntensity = 2.2;
    } else {
      lampMat.emissive.setHex(0x0d3748);
      lampMat.emissiveIntensity = 0.8;
    }
  }

  /** Physics FX anchors (M5): arc flash intensity, char permanence. */
  setArcFlash(intensity: number): void {
    this.arcLight.intensity = intensity;
  }

  applyCharDecal(): void {
    this.charDecal.visible = true;
    (this.charDecal.material as THREE.MeshStandardMaterial).opacity = 0.92;
  }

  clearFailureState(): void {
    this.charDecal.visible = false;
    (this.charDecal.material as THREE.MeshStandardMaterial).opacity = 0;
    this.dutMat.emissive.setHex(0x0d2436);
    this.dutMat.emissiveIntensity = 0.4;
    this.setArcFlash(0);
  }

  /** Shorted-gate electrical fault state — DUT visibly darkened/charred. */
  setShortedGate(shorted: boolean): void {
    if (shorted) {
      this.dutMat.emissive.setHex(0x180a06);
      this.dutMat.emissiveIntensity = 0.5;
    } else {
      this.dutMat.emissive.setHex(0x0d2436);
      this.dutMat.emissiveIntensity = 0.4;
    }
  }

  update(dt: number, time: number): void {
    this.updateArc(dt);
    void time;
  }
}
