import * as THREE from 'three';
import { materialFor, emissiveMaterialFor, beamMaterialFor } from './quantumMaterials.js';
import type { QuantumRigGeometry } from './rigTypes.js';

/**
 * WP-5.4 — neutral-atom UHV chamber + optical tweezer array builder.
 *
 * Every position/size/material comes from the derived QuantumRigGeometry
 * (cad-specs 03 JSON): matte-black optical table, stainless UHV chamber
 * with glass viewports (vacuum 1e-10 torr), 8×8 87Rb tweezer lattice, 12
 * Rydberg blockade halos, 480 nm Rydberg beam with focus cones and the
 * 780.24 nm trap beam — hues derived from the spec wavelengths. Mesh names
 * are asserted by the e2e geometry-from-JSON spec.
 */
export function buildTweezerRig(g: QuantumRigGeometry): THREE.Group {
  const group = new THREE.Group();
  const tw = g.tweezer;

  // Optical table (spec: matte black, 2.4×1.8 cm).
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(tw.table.widthCm, tw.table.thicknessCm, tw.table.depthCm),
    materialFor(tw.table.material)
  );
  table.position.y = tw.table.topYCm - tw.table.thicknessCm / 2;
  table.castShadow = true;
  table.receiveShadow = true;
  table.name = 'tweezer-table';
  group.add(table);

  // UHV chamber: stainless shell rendered as a translucent cutaway so the
  // tweezer array, blockade halos and beams stay visible (instrument-render
  // presentation) + opaque lid and base ring on the table.
  const chamberY = tw.chamber.centerYCm;
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x5a626c,
    metalness: 0.6,
    roughness: 0.25,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide,
    depthWrite: false,
    name: 'uhv-chamber-steel',
  });
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(
      tw.chamber.radiusCm,
      tw.chamber.radiusCm,
      tw.chamber.heightCm,
      36,
      1,
      true,
      0,
      Math.PI * 2
    ),
    shellMat
  );
  shell.position.y = chamberY;
  shell.renderOrder = 2;
  shell.name = 'uhv-chamber-shell';
  group.add(shell);
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(tw.chamber.radiusCm, tw.chamber.radiusCm, tw.chamber.wallThicknessCm, 36),
    materialFor(tw.chamber.material)
  );
  lid.position.y = chamberY + tw.chamber.heightCm / 2;
  lid.name = 'uhv-chamber-lid';
  group.add(lid);
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(tw.chamber.radiusCm, tw.chamber.wallThicknessCm, 8, 36),
    materialFor(tw.chamber.material)
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = tw.chamber.baseYCm;
  baseRing.name = 'uhv-chamber-base-ring';
  group.add(baseRing);

  // Glass viewports on the atom focal plane (two on the Rydberg beam axis).
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdde8f2,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.9,
    side: THREE.DoubleSide,
    name: 'uhv-viewport-glass',
  });
  for (let v = 0; v < tw.chamber.viewportCount; v++) {
    const angle = (v / tw.chamber.viewportCount) * Math.PI * 2;
    const viewport = new THREE.Mesh(
      new THREE.CylinderGeometry(tw.chamber.viewportRadiusCm, tw.chamber.viewportRadiusCm, tw.chamber.wallThicknessCm * 0.8, 20),
      glassMat
    );
    viewport.position.set(Math.cos(angle) * tw.chamber.radiusCm, tw.chamber.viewportYCm, Math.sin(angle) * tw.chamber.radiusCm);
    viewport.rotation.z = Math.PI / 2;
    viewport.rotation.y = -angle;
    viewport.name = `uhv-viewport-${v}`;
    group.add(viewport);
  }

  // 87Rb tweezer lattice (spec rows/cols/pitch/atom radius/color).
  const atomMat = emissiveMaterialFor(tw.atoms.material, 1.6);
  const grid = new THREE.InstancedMesh(new THREE.SphereGeometry(tw.atoms.radiusCm, 10, 8), atomMat, tw.atoms.positions.length);
  const dummy = new THREE.Object3D();
  tw.atoms.positions.forEach((p, i) => {
    dummy.position.set(p.x, tw.atoms.planeYCm, p.z);
    dummy.updateMatrix();
    grid.setMatrixAt(i, dummy.matrix);
  });
  grid.name = 'atomGrid';
  group.add(grid);

  // Rydberg blockade halos — translucent rings around atoms inside each
  // other's blockade radius (V = C6/r⁶, C6 = 500 GHz·µm⁶ per 04 JSON).
  const haloMat = beamMaterialFor(tw.atoms.material.colorHex, 0.16, 'blockade-halos');
  const halos = new THREE.InstancedMesh(
    new THREE.RingGeometry(tw.halos.innerRadiusCm, tw.halos.radiusCm, 20),
    haloMat,
    tw.halos.positions.length
  );
  tw.halos.positions.forEach((p, i) => {
    dummy.position.set(p.x, tw.halos.planeYCm, p.z);
    dummy.rotation.set(0, 0, 0);
    dummy.rotation.x = -Math.PI / 2;
    dummy.updateMatrix();
    halos.setMatrixAt(i, dummy.matrix);
  });
  halos.name = 'blockade-halos';
  group.add(halos);

  // Rydberg 480 nm excitation beam through the X-axis viewports + focus cones.
  const ryd = tw.lasers.rydberg;
  const rydMat = beamMaterialFor(ryd.colorHex, 0.35, 'laser-rydberg-480nm');
  const rydberg = new THREE.Mesh(new THREE.CylinderGeometry(ryd.beamRadiusCm, ryd.beamRadiusCm, ryd.lengthCm, 10), rydMat);
  rydberg.rotation.z = Math.PI / 2;
  rydberg.position.set(0, ryd.planeYCm, 0);
  rydberg.name = 'laser-rydberg-beam';
  group.add(rydberg);
  for (const side of [-1, 1]) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(ryd.coneRadiusCm, ryd.coneLengthCm, 12),
      beamMaterialFor(ryd.colorHex, 0.22, 'laser-rydberg-cone')
    );
    cone.rotation.z = side > 0 ? Math.PI / 2 : -Math.PI / 2; // focus inward
    cone.position.set(side * (ryd.lengthCm / 2 - ryd.coneLengthCm / 2), ryd.planeYCm, 0);
    cone.name = `laser-rydberg-cone-${side > 0 ? 'p' : 'n'}`;
    group.add(cone);
  }

  // Trap 780.24 nm tweezer beam through the Z-axis viewports (the atom
  // plane is pinned to the viewport plane by the derivation, so this beam
  // runs horizontal, crossing the 480 nm beam at the lattice center).
  const trap = tw.lasers.trap;
  const trapMat = beamMaterialFor(trap.colorHex, 0.3, 'laser-trap-780nm');
  const trapBeam = new THREE.Mesh(new THREE.CylinderGeometry(trap.beamRadiusCm, trap.beamRadiusCm, trap.lengthCm, 8), trapMat);
  trapBeam.rotation.x = Math.PI / 2;
  trapBeam.position.set(0, trap.planeYCm, 0);
  trapBeam.name = 'laser-trap-beam';
  group.add(trapBeam);

  return group;
}
