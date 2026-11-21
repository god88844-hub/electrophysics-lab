import * as THREE from 'three';
import { materialFor, emissiveMaterialFor } from './quantumMaterials.js';
import type { QuantumRigGeometry } from './rigTypes.js';

/**
 * WP-5.4 — silicon photonic MZI chip builder.
 *
 * Every position/size/material comes from the derived QuantumRigGeometry
 * (cad-specs 03 JSON): die 1.7×1.2 cm, two 1550 nm waveguide arms, one
 * directional coupler, thermo-optic heater pads (Pπ = 5 mW from the spec),
 * two edge grating couplers. Mesh names are asserted by the e2e
 * geometry-from-JSON spec.
 */
export function buildMziRig(g: QuantumRigGeometry): THREE.Group {
  const group = new THREE.Group();
  const m = g.mzi;
  const y = m.die.mountYCm;

  const die = new THREE.Mesh(new THREE.BoxGeometry(m.die.widthCm, m.die.thicknessCm, m.die.heightCm), materialFor(m.die.substrate));
  die.position.y = y;
  die.castShadow = true;
  die.receiveShadow = true;
  die.name = 'mzi-die';
  group.add(die);

  // Waveguide arms — 1550 nm C-band presentation glow from the spec hue.
  const waveMat = emissiveMaterialFor(m.waveguides.material, 1.4);
  m.waveguides.paths.forEach((path, i) => {
    const pts = path.map((p) => new THREE.Vector3(p.x, y + m.die.thicknessCm / 2, p.z));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, m.waveguides.tubeRadiusCm, 8, false), waveMat);
    tube.name = `mzi-waveguide-${i}`;
    group.add(tube);
  });

  // Directional coupler block at the arm split (spec: brushed gold).
  const coupler = new THREE.Mesh(
    new THREE.BoxGeometry(m.coupler.lengthCm, m.coupler.heightCm, m.coupler.zSizeCm),
    materialFor(m.coupler.material)
  );
  coupler.position.set(m.coupler.position.x, y + m.die.thicknessCm / 2 + m.coupler.heightCm / 2, m.coupler.position.z);
  coupler.name = 'mzi-coupler';
  group.add(coupler);

  // Thermo-optic heater pads over the waveguide arms (Pπ from the spec).
  m.heaters.pads.forEach((pad, i) => {
    const heater = new THREE.Mesh(
      new THREE.BoxGeometry(pad.lengthCm, pad.heightCm, pad.widthCm),
      materialFor(m.heaters.material)
    );
    heater.position.set(pad.xCm, y + m.die.thicknessCm / 2 + pad.heightCm / 2, pad.zCm);
    heater.name = `mzi-heater-${i}`;
    group.add(heater);
  });

  // Edge grating couplers: ribbed fin stacks at the die edges.
  const finGeo = new THREE.BoxGeometry(m.gratings.finThicknessCm, m.gratings.finHeightCm, m.gratings.finWidthCm);
  m.gratings.positions.forEach((pos, gi) => {
    for (let f = 0; f < m.gratings.finCount; f++) {
      const fin = new THREE.Mesh(finGeo, materialFor(m.waveguides.material));
      fin.position.set(
        pos.x + (f - (m.gratings.finCount - 1) / 2) * m.gratings.finThicknessCm * 2.5,
        y + m.die.thicknessCm / 2 + m.gratings.finHeightCm / 2,
        pos.z
      );
      fin.name = `mzi-grating-${gi}`;
      group.add(fin);
    }
  });

  return group;
}
