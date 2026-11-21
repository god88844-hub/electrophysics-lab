import * as THREE from 'three';
import { materialFor, emissiveMaterialFor } from './quantumMaterials.js';
import type { QuantumRigGeometry } from './rigTypes.js';
import { makeProbePin } from '../../engine/probes.js';

/**
 * WP-5.4 — dilution cryostat + 16-qubit transmon die builder.
 *
 * Pure mesh assembly: every position/size/material comes from the
 * `QuantumRigGeometry` values derived by `rigSpec.mjs` from
 * `data/cad-specs/03_quantum_hardware_rigs.json`. Mesh names are contract
 * surface for the geometry-from-JSON Playwright assertions
 * (e2e/quantum-rigs-geometry.spec.mjs).
 */

/** Build the multi-stage dilution cryostat with the transmon die on its 15 mK stage. */
export function buildCryostatRig(g: QuantumRigGeometry): THREE.Group {
  const group = new THREE.Group();
  const cryo = g.cryostat;
  const goldMat = materialFor(cryo.stages[0].material);

  // Support frame rods (spec: 4 × stainless steel) + G10 spacers at the
  // intermediate stage boundaries.
  const rodGeo = new THREE.CylinderGeometry(cryo.supportRods.radiusCm, cryo.supportRods.radiusCm, cryo.supportRods.lengthCm, 10);
  const rodMat = materialFor(cryo.supportRods.material);
  const rodRing = cryo.supportRods.ringRadiusCm;
  for (const dx of [-rodRing, rodRing]) {
    for (const dz of [-rodRing, rodRing]) {
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(dx, cryo.supportRods.centerYCm, dz);
      rod.castShadow = true;
      rod.name = 'cryo-support-rod';
      group.add(rod);
    }
  }
  const spacerGeo = new THREE.CylinderGeometry(
    cryo.supportRods.spacers[0]?.radiusCm ?? cryo.supportRods.radiusCm,
    cryo.supportRods.spacers[0]?.radiusCm ?? cryo.supportRods.radiusCm,
    cryo.supportRods.spacers[0]?.thicknessCm ?? 0.03,
    10
  );
  const spacerMat = materialFor({ colorHex: 0x2e4a35, metalness: 0.1, roughness: 0.7, clearcoat: 0, label: 'G10-spacer' });
  for (const dx of [-rodRing, rodRing]) {
    for (const dz of [-rodRing, rodRing]) {
      for (const s of cryo.supportRods.spacers) {
        const spacer = new THREE.Mesh(spacerGeo, spacerMat);
        spacer.position.set(dx, s.yCm, dz);
        spacer.name = 'cryo-g10-spacer';
        group.add(spacer);
      }
    }
  }

  // Pulse-tube canister on top of the 300 K plate (spec radius/height).
  const canister = new THREE.Mesh(
    new THREE.CylinderGeometry(cryo.canister.radiusCm, cryo.canister.radiusCm, cryo.canister.heightCm, 28),
    materialFor(cryo.canister.material)
  );
  canister.position.y = cryo.canister.centerYCm;
  canister.castShadow = true;
  canister.name = 'cryo-canister';
  group.add(canister);

  // Stage plates (gold-plated OFHC copper) + central cold-finger links.
  const stageGeos = cryo.stages.map((s) => new THREE.CylinderGeometry(s.radiusCm, s.radiusCm, s.thicknessCm, 40));
  for (let i = 0; i < cryo.stages.length; i++) {
    const s = cryo.stages[i];
    const plate = new THREE.Mesh(stageGeos[i], goldMat);
    plate.position.y = s.yCm;
    plate.castShadow = true;
    plate.receiveShadow = true;
    plate.name = s.name; // e.g. "stage-300K" — asserted by e2e against the JSON.
    group.add(plate);

    if (i > 0) {
      const link = cryo.coldLinks[i - 1];
      const linkMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(link.radiusCm, link.radiusCm, link.yFromCm - link.yToCm, 10),
        materialFor(link.material)
      );
      linkMesh.position.set(0, (link.yFromCm + link.yToCm) / 2, 0);
      linkMesh.name = `cryo-cold-link-${i - 1}`;
      group.add(linkMesh);
    }
  }

  // Braided OFHC thermal straps (spec routing: 4 K→100 mK, 100 mK→15 mK).
  const strapMat = materialFor(cryo.thermalStraps.material);
  cryo.thermalStraps.routes.forEach((route, i) => {
    const pts = route.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const strap = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, cryo.thermalStraps.radiusCm, 8, false),
      strapMat
    );
    strap.castShadow = true;
    strap.name = `cryo-thermal-strap-${i}`;
    group.add(strap);
  });

  // Coaxial microwave lines (spec: 7 × stainless SMA bundles) with
  // attenuator barrels at each stage below 300 K.
  const coaxMat = materialFor(cryo.coaxLines.material);
  const barrelGeo = new THREE.CylinderGeometry(
    cryo.coaxLines.barrels[0]?.radiusCm ?? cryo.coaxLines.tubeRadiusCm,
    cryo.coaxLines.barrels[0]?.radiusCm ?? cryo.coaxLines.tubeRadiusCm,
    cryo.coaxLines.barrels[0]?.lengthCm ?? cryo.coaxLines.tubeRadiusCm,
    8
  );
  const barrelMat = emissiveMaterialFor(cryo.coaxLines.material, 0.35);
  const barrelInstances: THREE.Matrix4[] = [];
  for (let i = 0; i < cryo.coaxLines.count; i++) {
    const angle = (i / cryo.coaxLines.count) * Math.PI * 2 + 0.3;
    const pts = cryo.coaxLines.waypoints(angle).map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, cryo.coaxLines.tubeRadiusCm, 8, false), coaxMat);
    tube.castShadow = true;
    tube.name = `cryo-coax-${i}`;
    group.add(tube);
    for (const b of cryo.coaxLines.barrels) {
      const m = new THREE.Matrix4();
      m.setPosition(Math.cos(angle) * b.ringRadiusCm, b.yCm, Math.sin(angle) * b.ringRadiusCm);
      barrelInstances.push(m);
    }
  }
  const barrels = new THREE.InstancedMesh(barrelGeo, barrelMat, barrelInstances.length);
  barrelInstances.forEach((m, i) => barrels.setMatrixAt(i, m));
  barrels.name = 'cryo-attenuator-barrels';
  group.add(barrels);

  // Transmon die on the 15 mK mixing-chamber stage.
  group.add(buildTransmonDie(g));

  // Qubit coherence hologram above the base stage — dissolves on quench
  // (T > Al Tc parsed from the cad-spec JSON). Radius is a presentation
  // fraction of the die size.
  const holoRadiusCm = g.transmon.sizeCm * 0.68;
  const holo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(holoRadiusCm, 2),
    new THREE.MeshStandardMaterial({
      color: 0x62d0ff,
      emissive: 0x2a7fb8,
      emissiveIntensity: 0.7,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    })
  );
  holo.position.set(0, g.transmon.dieCenterYCm + holoRadiusCm * 1.9, 0);
  holo.name = 'qubitHolo';
  group.add(holo);

  // Instrument probes at the base stage (unchanged hover targets).
  const probe1 = makeProbePin(1.0, 0x62d0ff);
  probe1.position.set(-0.75, g.transmon.dieCenterYCm - 0.03, 0.45);
  probe1.name = 'cryo-probe-1';
  group.add(probe1);
  const probe2 = makeProbePin(1.0, 0xff9d5c);
  probe2.position.set(0.72, g.transmon.dieCenterYCm - 0.03, -0.42);
  probe2.name = 'cryo-probe-2';
  group.add(probe2);

  return group;
}

/** Dark sapphire substrate + 4×4 gold pads + 3 CPW resonators + 16 JJ markers. */
export function buildTransmonDie(g: QuantumRigGeometry): THREE.Group {
  const t = g.transmon;
  const dieGroup = new THREE.Group();

  const die = new THREE.Mesh(new THREE.BoxGeometry(t.sizeCm, t.thicknessCm, t.sizeCm), materialFor(t.substrate));
  die.position.y = t.dieCenterYCm;
  die.castShadow = true;
  die.name = 'transmon-die';
  dieGroup.add(die);

  // Qubit pads: spec "4×4 gold pads, 0.1 cm pitch".
  const pads = new THREE.InstancedMesh(
    new THREE.BoxGeometry(t.pads.sizeCm, t.pads.thicknessCm, t.pads.sizeCm),
    materialFor(t.pads.material),
    t.pads.positions.length
  );
  const dummy = new THREE.Object3D();
  t.pads.positions.forEach((p, i) => {
    dummy.position.set(p.x, t.padsYCm, p.z);
    dummy.updateMatrix();
    pads.setMatrixAt(i, dummy.matrix);
  });
  pads.name = 'transmon-pads';
  dieGroup.add(pads);

  // λ/4 CPW resonators: spec rows/meander span/conductor width, niobium.
  const cpwMat = materialFor(t.cpw.material);
  t.cpw.paths.forEach((path, i) => {
    const pts = path.map((p) => new THREE.Vector3(p.x, t.padsYCm, p.z));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, t.cpw.tubeRadiusCm, 8, false), cpwMat);
    tube.name = `transmon-cpw-${i}`;
    dieGroup.add(tube);
  });

  // Al/AlOx/Al junction markers at the pad intersections.
  const jj = new THREE.InstancedMesh(
    new THREE.BoxGeometry(t.junctions.sizeCm, t.junctions.thicknessCm, t.junctions.sizeCm),
    materialFor(t.junctions.material),
    t.junctions.positions.length
  );
  t.junctions.positions.forEach((p, i) => {
    dummy.position.set(p.x, t.junctionYCm, p.z);
    dummy.updateMatrix();
    jj.setMatrixAt(i, dummy.matrix);
  });
  jj.name = 'transmon-junctions';
  dieGroup.add(jj);

  return dieGroup;
}
