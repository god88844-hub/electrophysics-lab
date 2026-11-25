// @ts-nocheck
// Plain ECMAScript so the input guards and dimension contracts run in root Node CI.
import * as THREE from 'three';
import instruments from '../../../../data/cad-specs/04_lab_instruments_and_probes.json';
import packages from '../../../../data/cad-specs/02_pcb_bga_soc_packages.json';

const probeSpec = instruments.oscilloscope_probe;
const capSpec = packages.smd_passives['0402_decoupling_cap'];
const Y = new THREE.Vector3(0, 1, 0);


function dimension(value, name) {
  if (!Number.isFinite(value) || value < 0.00001 || value > 10000) {
    throw new RangeError(`${name} must be finite and within the scene dimension budget`);
  }
}

function count(value, min, max, name) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer in [${min}, ${max}]`);
  }
}

function finish(geometry) {
  geometry.normalizeNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function part(name, owned) {
  const group = Object.assign(new THREE.Group(), {
    dispose() {
      for (const mesh of group.children) {
        if (mesh.isInstancedMesh) mesh.dispose();
        mesh.geometry.dispose();
      }
      group.clear();
      for (const material of owned.splice(0)) material.dispose();
      group.removeFromParent();
    },
  });
  group.name = name;
  return group;
}

function standard(color, metalness, roughness) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function mesh(group, name, geometry, material, y = 0) {
  const result = new THREE.Mesh(geometry, material);
  result.name = name;
  result.position.y = y;
  result.castShadow = true;
  result.receiveShadow = true;
  group.add(result);
  return result;
}

/** Centered XYZ slab with a single planar chamfer strip at each edge. */
export function createBeveledSlab(w, h, d, bevel) {
  dimension(w, 'width'); dimension(h, 'height'); dimension(d, 'depth'); dimension(bevel, 'bevel');
  if (bevel * 2 + 0.00001 >= Math.min(w, h, d)) throw new RangeError('Bevel exceeds the slab envelope');
  const x = w / 2 - bevel;
  const y = d / 2 - bevel;
  const section = new THREE.Shape();
  section.moveTo(-x, -y);
  section.lineTo(x, -y);
  section.lineTo(x, y);
  section.lineTo(-x, y);
  section.closePath();
  const depth = h - 2 * bevel;
  return finish(new THREE.ExtrudeGeometry(section, {
    depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, steps: 1,
  }).rotateX(-Math.PI / 2).translate(0, -depth / 2, 0));
}

function socketHead(radius, height) {
  const outline = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) outline.moveTo(x, y);
    else outline.lineTo(x, y);
  }
  outline.closePath();
  const socket = new THREE.Path();
  for (let i = 5; i >= 0; i--) {
    const a = i * Math.PI / 3;
    const x = Math.cos(a) * radius * 0.54;
    const y = Math.sin(a) * radius * 0.54;
    if (i === 5) socket.moveTo(x, y);
    else socket.lineTo(x, y);
  }
  socket.closePath();
  outline.holes.push(socket);
  return finish(new THREE.ExtrudeGeometry(outline, {
    depth: height, bevelEnabled: false, steps: 1,
  }).rotateX(-Math.PI / 2));
}

/** Bored annular flange with an instanced ring of recessed hex-drive fasteners. */
export function createMachinedFlange(rOuter, rInner, thickness, boltCount) {
  dimension(rOuter, 'outer radius'); dimension(rInner, 'bore radius'); dimension(thickness, 'thickness');
  count(boltCount, 3, 32, 'bolt count');
  if (rOuter - rInner <= 0.00005) throw new RangeError('Flange bore leaves no material');
  const mid = (rInner + rOuter) / 2;
  const bevel = Math.min((rOuter - rInner) / 6, thickness / 5);
  const half = thickness / 2;
  const boltR = Math.min((rOuter - rInner) / 5, mid * Math.sin(Math.PI / boltCount) / 2);
  const boltH = Math.min(thickness / 2, boltR);
  const flange = standard(0xb7bdc7, 0.9, 0.32);
  const bolt = standard(0x6e7680, 0.88, 0.31);
  const group = part('machined flange', [flange, bolt]);
  const section = [
    [rInner + bevel, -half], [rOuter - bevel, -half], [rOuter, -half + bevel],
    [rOuter, half - bevel], [rOuter - bevel, half], [rInner + bevel, half],
    [rInner, half - bevel], [rInner, -half + bevel], [rInner + bevel, -half],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  mesh(group, 'flange body', finish(new THREE.LatheGeometry(section, 40)), flange);
  const boltMesh = new THREE.InstancedMesh(socketHead(boltR, boltH), bolt, boltCount);
  boltMesh.name = 'socket-head fasteners';
  boltMesh.castShadow = true;
  const transform = new THREE.Matrix4();
  for (let i = 0; i < boltCount; i++) {
    const angle = i * 2 * Math.PI / boltCount;
    boltMesh.setMatrixAt(i, transform.makeTranslation(mid * Math.cos(angle), half - boltH * 0.25, mid * Math.sin(angle)));
  }
  boltMesh.instanceMatrix.needsUpdate = true;
  boltMesh.computeBoundingBox();
  boltMesh.computeBoundingSphere();
  group.add(boltMesh);
  return group;
}

/** 0402 footprint in mm from cad-specs 02. Height is a render proportion. */
export function createSmdCapacitor0402() {
  const { body_l_mm: length, body_w_mm: width } = capSpec;
  const height = width * 0.7;
  const terminalWidth = length * 0.22;
  const ceramic = standard(0x977149, 0, 0.52);
  const tin = standard(0xbbc0c7, 0.9, 0.27);
  const group = part('0402 capacitor', [ceramic, tin]);
  group.userData.footprintMm = { length, width };
  mesh(group, 'ceramic core', createBeveledSlab(length - 2 * terminalWidth, height * 0.95, width * 0.96, 0.025), ceramic);
  const terminals = new THREE.InstancedMesh(createBeveledSlab(terminalWidth, height, width, 0.025), tin, 2);
  terminals.name = 'tin terminations';
  terminals.castShadow = true;
  const transform = new THREE.Matrix4();
  terminals.setMatrixAt(0, transform.makeTranslation((terminalWidth - length) / 2, 0, 0));
  terminals.setMatrixAt(1, transform.makeTranslation((length - terminalWidth) / 2, 0, 0));
  terminals.instanceMatrix.needsUpdate = true;
  terminals.computeBoundingBox();
  terminals.computeBoundingSphere();
  group.add(terminals);
  return group;
}

/** Centered XZ array with a single shared low-poly solder sphere. */
export function createBgaBallArray(cols, rows, pitch, radius) {
  count(cols, 1, 32, 'columns'); count(rows, 1, 32, 'rows');
  dimension(pitch, 'pitch'); dimension(radius, 'ball radius');
  if (cols * rows > 256 || pitch <= 2 * radius) throw new RangeError('BGA budget or ball clearance exceeded');
  const solder = standard(0xb5bcc4, 0.85, 0.25);
  const group = part('BGA', [solder]);
  const balls = new THREE.InstancedMesh(finish(new THREE.SphereGeometry(radius, 12, 8)), solder, cols * rows);
  balls.name = 'solder balls';
  balls.castShadow = true;
  const transform = new THREE.Matrix4();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      balls.setMatrixAt(row * cols + col, transform.makeTranslation(
        (col - (cols - 1) / 2) * pitch, 0, (row - (rows - 1) / 2) * pitch,
      ));
    }
  }
  balls.instanceMatrix.needsUpdate = true;
  balls.computeBoundingBox();
  balls.computeBoundingSphere();
  group.add(balls);
  return group;
}

/** Scale the sealed probe proportions from their source unit to a scene length. */
export function describeSpringProbe(length) {
  dimension(length, 'needle length');
  const scale = length / probeSpec.needle_length_cm;
  return {
    scale,
    tip: probeSpec.tip_cone_height_cm * scale,
    collarRadius: probeSpec.collar_ring_radius_cm * scale,
    shankTop: probeSpec.needle_diameter_cm.top * scale / 2,
    shankBottom: probeSpec.needle_diameter_cm.bottom * scale / 2,
    barrelTop: probeSpec.base_diameter_cm.top * scale / 2,
    barrelBottom: probeSpec.base_diameter_cm.bottom * scale / 2,
  };
}
/** Scaled instrument presentation. The probe remains rooted at the same bench point. */
export function createSpringProbeNeedle(length, channelColor = 0x62d0ff, shared) {
  dimension(length, 'needle length');
  if (!Number.isInteger(channelColor) || channelColor < 0 || channelColor > 0xffffff) throw new RangeError('Invalid channel color');
  const { scale, tip, collarRadius, shankBottom, shankTop, barrelTop, barrelBottom } = describeSpringProbe(length);
  const surfaces = shared ?? {
    stainless: standard(0x9aa2ad, 0.9, 0.3), gold: standard(0xd4af37, 0.92, 0.24), barrel: standard(0x1d2126, 0.55, 0.85),
  };
  const channel = new THREE.MeshStandardMaterial({
    color: channelColor, emissive: channelColor, emissiveIntensity: 0.65, metalness: 0.45, roughness: 0.38,
  });
  const group = part('spring probe', shared ? [channel] : [channel, ...Object.values(surfaces)]);
  group.userData.probeSpec = { source: instruments.id, lengthCm: probeSpec.needle_length_cm, tipCm: probeSpec.tip_cone_height_cm, scale };
  mesh(group, 'machined barrel', finish(new THREE.CylinderGeometry(barrelTop, barrelBottom, length * 0.22, 16)), surfaces.barrel, length * 0.11);
  mesh(group, 'spring plunger', finish(new THREE.CylinderGeometry(shankTop, shankBottom, length, 12)), surfaces.stainless, length / 2);
  const knurl = new THREE.TorusGeometry(collarRadius, collarRadius * 0.28, 6, 32);
  const vertices = knurl.getAttribute('position');
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i);
    const y = vertices.getY(i);
    const ridge = 1 + 0.065 * Math.cos(16 * Math.atan2(y, x));
    vertices.setXY(i, x * ridge, y * ridge);
  }
  knurl.computeVertexNormals();
  mesh(group, 'knurled channel collar', finish(knurl.rotateX(-Math.PI / 2)), channel, length * 0.82);
  mesh(group, 'gold pogo tip', finish(new THREE.ConeGeometry(shankTop, tip, 12)), surfaces.gold, length + tip / 2);
  return group;
}

/** Semi-rigid coax with instanced gold collars aligned to the cable tangent. */
export function createCoaxBundle(curve, radius, collarCount) {
  dimension(radius, 'coax radius');
  count(collarCount, 0, 16, 'collar count');
  if (!(curve instanceof THREE.Curve)) throw new RangeError('Expected a Three.js cable curve');
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    if (![p.x, p.y, p.z, tangent.x, tangent.y, tangent.z].every((v) => Number.isFinite(v) && Math.abs(v) <= 10000) ||
        tangent.lengthSq() < 0.00001) throw new RangeError('Invalid or stationary coax path');
  }
  const length = curve.getLength();
  dimension(length, 'coax length');
  if (length <= radius * 4) throw new RangeError('Coax is too short for its radius');
  const steel = standard(0x9aa2ad, 0.9, 0.3);
  const gold = standard(0xd4af37, 0.92, 0.24);
  const group = part('semi-rigid coax', [steel, gold]);
  mesh(group, 'coax jacket', finish(new THREE.TubeGeometry(curve, 24, radius, 8, false)), steel);
  if (collarCount === 0) return group;
  const collars = new THREE.InstancedMesh(
    finish(new THREE.CylinderGeometry(radius * 1.65, radius * 1.65, Math.min(3 * radius, length / (collarCount + 1) * 0.65), 12)),
    gold, collarCount,
  );
  collars.name = 'gold SMA collars';
  collars.castShadow = true;
  const transform = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < collarCount; i++) {
    const t = (i + 1) / (collarCount + 1);
    rotation.setFromUnitVectors(Y, curve.getTangentAt(t));
    collars.setMatrixAt(i, transform.compose(curve.getPointAt(t), rotation, scale));
  }
  collars.instanceMatrix.needsUpdate = true;
  collars.computeBoundingBox();
  collars.computeBoundingSphere();
  group.add(collars);
  return group;
}
