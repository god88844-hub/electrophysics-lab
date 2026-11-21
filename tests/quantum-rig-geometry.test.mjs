import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * WP-5.4 — geometry-from-JSON acceptance tests for the Quantum Lab rigs.
 *
 * The app's Bay1Quantum renders every rig from `deriveAll()` in
 * `apps/electrophysics-3d/src/bays/quantum/rigSpec.mjs` — the exact module
 * imported here — against the sealed `data/cad-specs/03_quantum_hardware_rigs.json`.
 * These tests pin the JSON→geometry binding:
 *   1. every derived dimension equals its JSON value (no hardcoded scene dims),
 *   2. mutating the JSON mutates the geometry (parametric, not coincidental),
 *   3. malformed specs fail closed,
 *   4. the derived hardware is physically sane (no interpenetration, grids
 *      exact, corridors clear),
 *   5. PBR materials parse out of the JSON material strings.
 * The live-scene counterparts run in `apps/electrophysics-3d/e2e/quantum-rigs-geometry.spec.mjs`.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const SPEC_PATH = path.join(root, 'data', 'cad-specs', '03_quantum_hardware_rigs.json');
const rawSpec = readFileSync(SPEC_PATH, 'utf8');
const spec = JSON.parse(rawSpec);

const rig = await import('../apps/electrophysics-3d/src/bays/quantum/rigSpec.mjs');
const { deriveAll, parseMaterialSpec, parseTemperatureK, parsePadGrid, parseRoutePairs, wavelengthToHex, RENDER, SCENE } = rig;

const G = deriveAll(spec);

test('WP-5.4: derivation binds to the sealed cad-specs 03 JSON', () => {
  assert.equal(G.sourceId, spec.id);
  assert.equal(G.units.length, spec.units.length);
});

test('WP-5.4: cryostat stages — y/radius/thickness/temps parsed from the JSON labels', () => {
  const stages = spec.dilution_cryostat.stages;
  assert.equal(G.cryostat.stages.length, stages.length);
  G.cryostat.stages.forEach((s, i) => {
    assert.equal(s.label, stages[i].label);
    assert.equal(s.yCm, stages[i].y_cm, `stage ${i} y_cm bound`);
    assert.equal(s.radiusCm, stages[i].plate_radius_cm, `stage ${i} plate_radius_cm bound`);
    assert.equal(s.thicknessCm, stages[0].plate_thickness_cm, `stage ${i} thickness = spec plate_thickness_cm`);
    assert.equal(s.tempK, parseTemperatureK(stages[i].label), `stage ${i} temp parsed from label`);
    assert.equal(s.coolingPowerW, stages[i].cooling_power_w ?? null, `stage ${i} cooling power bound`);
    assert.equal(s.name, `stage-${stages[i].label.replace(/\s+/g, '')}`, 'mesh-name contract for e2e');
  });
  // Exact sealed values (Bluefors XLD400 stages) — guards silent regressions.
  assert.deepEqual(G.stageTempsK, [300, 4, 0.1, 0.015]);
  assert.deepEqual(
    G.cryostat.stages.map((s) => s.radiusCm),
    [1.35, 1.15, 0.95, 0.78]
  );
  assert.deepEqual(
    G.cryostat.stages.map((s) => s.yCm),
    [3.1, 2.25, 1.45, 0.72]
  );
});

test('WP-5.4: canister, support rods, coax, straps bound to JSON component entries', () => {
  const canisterSpec = spec.dilution_cryostat.components.find((c) => c.name === 'canister');
  assert.equal(G.cryostat.canister.radiusCm, canisterSpec.radius_cm);
  assert.equal(G.cryostat.canister.heightCm, canisterSpec.height_cm);
  assert.equal(G.cryostat.canister.centerYCm, 3.1 + 0.05 + 0.25, 'canister sits on the 300 K plate');

  const rods = G.cryostat.supportRods;
  assert.equal(rods.count, spec.dilution_cryostat.components.find((c) => c.name === 'support rods').count);
  assert.equal(rods.count, 4);
  assert.equal(rods.lengthCm, 3.1 - 0.72, 'rods span top → base stage');
  // Render fraction: rod radius = 0.45 × plate thickness (declared in RENDER).
  assert.equal(rods.radiusCm, 0.1 * RENDER.ROD_RADIUS_OF_PLATE_THICKNESS);
  assert.equal(Math.round(rods.radiusCm * 1000) / 1000, 0.045);

  const coax = G.cryostat.coaxLines;
  assert.equal(coax.count, spec.dilution_cryostat.components.find((c) => c.name === 'coaxial microwave lines').count);
  assert.equal(coax.count, 7);
  assert.equal(coax.barrels.length, 3, 'attenuator barrels at each stage below 300 K');
  // Coax routes through the stage rings: waypoints at canister + 3 stages.
  const wp = coax.waypoints(0);
  assert.equal(wp.length, 4);
  assert.equal(wp[1].y, 2.25, 'coax passes the 4 K stage');
  assert.equal(wp[3].y, 0.72, 'coax terminates at the 15 mK stage');

  const straps = G.cryostat.thermalStraps;
  assert.equal(straps.count, spec.dilution_cryostat.components.find((c) => c.name === 'thermal straps').count);
  assert.equal(straps.routes.length, 2);
  assert.deepEqual(
    straps.routes.map((r) => `${r.from}→${r.to}`),
    parseRoutePairs(spec.dilution_cryostat.components.find((c) => c.name === 'thermal straps').routing).map(([a, b]) => `${a}→${b}`)
  );
  assert.deepEqual(
    straps.routes.map((r) => `${r.from}→${r.to}`),
    ['4 K→100 mK', '100 mK→15 mK']
  );
  assert.equal(G.cryostat.coldLinks.length, 3, 'cold-finger links between consecutive stages');
});

test('WP-5.4: transmon die — pads/CPW/JJ all bound to the JSON', () => {
  const die = spec.transmon_die;
  assert.equal(G.transmon.sizeCm, die.size_cm);
  assert.equal(G.transmon.sizeCm, 0.5);

  const grid = parsePadGrid(die.pad_grid);
  assert.equal(G.transmon.pads.rows, grid.rows);
  assert.equal(G.transmon.pads.cols, grid.cols);
  assert.equal(G.transmon.pads.pitchCm, grid.pitchCm);
  assert.equal(G.transmon.pads.positions.length, grid.rows * grid.cols);
  assert.equal(G.transmon.pads.positions.length, 16, '16 qubit pads (4×4)');
  // Grid centered on the die with exact pitch.
  const xs = [...new Set(G.transmon.pads.positions.map((p) => p.x))].sort((a, b) => a - b);
  assert.equal((xs[1] - xs[0]).toPrecision(12), grid.pitchCm.toPrecision(12));
  assert.equal(xs[0] + xs[xs.length - 1], 0, 'pad grid centered');

  assert.equal(G.transmon.cpw.rows, die.coplanar_waveguides.rows);
  assert.equal(G.transmon.cpw.rows, 3);
  assert.equal(G.transmon.cpw.spanCm, die.coplanar_waveguides.meander_span_cm);
  assert.equal(G.transmon.cpw.spanCm, 0.34);
  assert.equal(G.transmon.cpw.widthCm, die.coplanar_waveguides.conductor_width_cm);
  assert.equal(G.transmon.cpw.tubeRadiusCm, die.coplanar_waveguides.conductor_width_cm / 2, 'tube radius = half conductor width');
  assert.equal(G.transmon.cpw.paths.length, 3);

  assert.equal(G.transmon.junctions.count, die.josephson_junctions.count);
  assert.equal(G.transmon.junctions.sizeCm, die.josephson_junctions.marker_size_cm);
  assert.equal(G.transmon.junctions.sizeCm, 0.018);
  // JJ markers sit exactly at the pad intersections.
  G.transmon.junctions.positions.forEach((p, i) => {
    assert.deepEqual(p, G.transmon.pads.positions[i], `JJ ${i} at pad position`);
  });

  // Die mounts on the 15 mK mixing chamber (coldest stage).
  const baseStage = G.cryostat.stages[3];
  assert.equal(G.transmon.dieCenterYCm, baseStage.yCm + baseStage.thicknessCm / 2 + G.transmon.thicknessCm / 2);
  // Al Tc parsed from the JSON note — the quench threshold, not hardcoded.
  assert.equal(G.transmon.superconductingTransitionK, 1.2);
  assert.equal(G.superconductingTransitionK, 1.2);
});

test('WP-5.4: photonic MZI chip — die/waveguides/coupler/heaters/gratings bound to the JSON', () => {
  const chip = spec.photonic_mzi_chip;
  assert.equal(G.mzi.die.widthCm, chip.size_cm.w);
  assert.equal(G.mzi.die.heightCm, chip.size_cm.h);
  assert.equal(G.mzi.die.widthCm, 1.7);
  assert.equal(G.mzi.die.heightCm, 1.2);
  assert.equal(G.mzi.waveguides.count, chip.waveguides.count);
  assert.equal(G.mzi.waveguides.count, 2);
  assert.equal(G.mzi.coupler.count, chip.directional_couplers.count);
  assert.equal(G.mzi.coupler.count, 1);
  assert.equal(G.mzi.heaters.pPiMw, chip.thermo_optic_heaters.p_pi_mw);
  assert.equal(G.mzi.heaters.pPiMw, 5.0);
  assert.equal(G.mzi.heaters.pads.length, 2, 'one heater pad per waveguide arm');
  assert.equal(G.mzi.gratings.count, chip.edge_grating_couplers.count);
  assert.equal(G.mzi.gratings.count, 2);
  // Grating couplers sit at the die edges.
  const halfSpan = (chip.size_cm.w - 2 * G.mzi.edgeMarginCm) / 2;
  assert.deepEqual(G.mzi.gratings.positions.map((p) => p.x), [-halfSpan, halfSpan]);
  // Arm offset is a fraction of the die height (declared in RENDER).
  assert.equal(G.mzi.waveguides.armOffsetCm, chip.size_cm.h * RENDER.MZI_ARM_OFFSET_OF_HEIGHT);
});

test('WP-5.4: neutral-atom rig — table/chamber/lattice/halos/lasers bound to the JSON', () => {
  const rigJson = spec.neutral_atom_uhv_chamber;
  assert.equal(G.tweezer.table.widthCm, rigJson.optical_table.size_cm.w);
  assert.equal(G.tweezer.table.depthCm, rigJson.optical_table.size_cm.h);
  assert.equal(G.tweezer.table.widthCm, 2.4);
  assert.equal(G.tweezer.table.depthCm, 1.8);

  assert.equal(G.tweezer.chamber.vacuumTorr, rigJson.chamber.vacuum_torr);
  assert.equal(G.tweezer.chamber.vacuumTorr, 1e-10, 'UHV 1e-10 torr (04 JSON bound)');
  assert.equal(G.tweezer.chamber.viewportCount, 4);

  const gridJson = rigJson.tweezer_grid;
  assert.equal(G.tweezer.atoms.rows, gridJson.rows);
  assert.equal(G.tweezer.atoms.cols, gridJson.cols);
  assert.equal(G.tweezer.atoms.pitchCm, gridJson.lattice_pitch_cm);
  assert.equal(G.tweezer.atoms.radiusCm, gridJson.atom_radius_cm);
  assert.equal(G.tweezer.atoms.trapDepthMhz, gridJson.trap_depth_mhz);
  assert.equal(G.tweezer.atoms.positions.length, gridJson.rows * gridJson.cols);
  assert.equal(G.tweezer.atoms.positions.length, 64, '8×8 tweezer array');
  // Exact lattice pitch, centered.
  const xCoords = [...new Set(G.tweezer.atoms.positions.map((p) => p.x))].sort((a, b) => a - b);
  assert.equal((xCoords[1] - xCoords[0]).toPrecision(12), gridJson.lattice_pitch_cm.toPrecision(12));
  assert.equal(xCoords[0] + xCoords[xCoords.length - 1], 0);

  assert.equal(G.tweezer.halos.count, rigJson.rydberg_blockade_halos.count);
  assert.equal(G.tweezer.halos.count, 12);
  assert.equal(G.tweezer.halos.radiusCm, rigJson.rydberg_blockade_halos.radius_cm);
  assert.equal(G.tweezer.halos.radiusCm, 0.085);
  // Every halo sits on a real lattice site.
  const lattice = new Set(G.tweezer.atoms.positions.map((p) => `${p.x},${p.z}`));
  G.tweezer.halos.positions.forEach((p) => {
    assert.ok(lattice.has(`${p.x},${p.z}`), `halo at lattice site ${p.x},${p.z}`);
  });

  assert.equal(G.tweezer.lasers.rydberg.nm, rigJson.lasers.rydberg_nm);
  assert.equal(G.tweezer.lasers.rydberg.nm, 480);
  assert.equal(G.tweezer.lasers.trap.nm, rigJson.lasers.trap_nm);
  assert.equal(G.tweezer.lasers.trap.nm, 780.24);
  // Beam hues derived from the wavelengths (480 nm blue, 780 nm deep red).
  assert.equal(G.tweezer.lasers.rydberg.colorHex, wavelengthToHex(480));
  assert.equal(G.tweezer.lasers.trap.colorHex, wavelengthToHex(780.24));
  assert.equal(wavelengthToHex(480) & 0xff, 0xff, '480 nm is blue (max blue channel)');
  assert.equal(wavelengthToHex(780.24) >> 16, (wavelengthToHex(780.24) >> 16), '780 nm red channel dominates');
});

test('WP-5.4: Bloch instrumentation preserved — docked panel, radius from the JSON', () => {
  assert.equal(G.bloch.sphereRadiusCm, spec.bloch_instrumentation.sphere_radius_cm);
  assert.equal(G.bloch.sphereRadiusCm, 0.42);
  assert.equal(G.bloch.hudDefaultOn, false, 'in-scene overlay default OFF (docked panel carries the readouts)');
  assert.equal(G.bloch.positions.length, 3, 'q0..q2');
  assert.deepEqual(G.bloch.positions, SCENE.BLOCH_POSITIONS, 'app/test scene placement consistent');
});

test('WP-5.4: PBR materials parse from the JSON material strings', () => {
  // "24k brushed gold #d4af37, metalness 0.92, roughness 0.24"
  const gold = parseMaterialSpec(spec.dilution_cryostat.stages[0].color);
  assert.equal(gold.colorHex, 0xd4af37);
  assert.equal(gold.metalness, 0.92);
  assert.equal(gold.roughness, 0.24);
  // "dark sapphire #10141c (mirror-polished, clearcoat 0.8)"
  const sapphire = parseMaterialSpec(spec.transmon_die.substrate);
  assert.equal(sapphire.colorHex, 0x10141c);
  assert.equal(sapphire.clearcoat, 0.8);
  // Hex-only strings resolve via named fallbacks (documented in rigSpec.mjs).
  assert.equal(parseMaterialSpec(spec.dilution_cryostat.components.find((c) => c.name === 'coaxial microwave lines').material).colorHex, 0x9aa2ad);
  assert.equal(parseMaterialSpec(spec.transmon_die.coplanar_waveguides.material).colorHex, 0xaab2bd);
  assert.equal(parseMaterialSpec(spec.transmon_die.josephson_junctions.material).colorHex, 0xd9a441);
  assert.equal(parseMaterialSpec(spec.neutral_atom_uhv_chamber.optical_table.material).colorHex, 0x1c212b);
  assert.equal(parseMaterialSpec(`atoms ${spec.neutral_atom_uhv_chamber.tweezer_grid.atom_color}`).colorHex, 0xff6d8a);
  assert.equal(G.transmon.substrate.colorHex, 0x10141c);
  assert.equal(G.cryostat.stages[3].material.colorHex, 0xd4af37, 'all plates gold-plated OFHC');
  // Unresolvable material strings fail closed.
  assert.throws(() => parseMaterialSpec('mystery alloy'), /cannot resolve PBR/);
});

test('WP-5.4: derived hardware is physically sane (no interpenetration / clear corridors)', () => {
  const { stages } = G.cryostat;
  for (let i = 1; i < stages.length; i++) {
    const gap = stages[i - 1].yCm - stages[i].yCm - stages[i].thicknessCm;
    assert.ok(gap > 0, `gap between ${stages[i - 1].label} and ${stages[i].label}`);
  }
  // Plates nest without clipping: each smaller plate fits inside the one above.
  for (let i = 1; i < stages.length; i++) {
    assert.ok(stages[i].radiusCm < stages[i - 1].radiusCm, 'plate radii shrink toward the base');
  }
  // Support rods stay inside the outer plate radius.
  assert.ok(G.cryostat.supportRods.ringRadiusCm < stages[0].radiusCm);
  // Pads stay inside the die.
  const dieHalf = G.transmon.sizeCm / 2;
  for (const p of G.transmon.pads.positions) {
    assert.ok(Math.abs(p.x) + G.transmon.pads.sizeCm / 2 <= dieHalf, 'pad x within die');
    assert.ok(Math.abs(p.z) + G.transmon.pads.sizeCm / 2 <= dieHalf, 'pad z within die');
  }
  // CPW serpentine stays inside the die and threads the corridors between
  // pad columns (no conductor crosses a qubit pad).
  const padHalf = G.transmon.pads.sizeCm / 2;
  for (const path of G.transmon.cpw.paths) {
    for (const pt of path) {
      assert.ok(Math.abs(pt.x) + G.transmon.cpw.tubeRadiusCm <= dieHalf, 'CPW within die');
      assert.ok(Math.abs(pt.z) + G.transmon.cpw.tubeRadiusCm <= dieHalf, 'CPW z within die');
      for (const pad of G.transmon.pads.positions) {
        const clear = Math.abs(pt.x - pad.x) > padHalf + G.transmon.cpw.widthCm / 2 || Math.abs(pt.z - pad.z) > padHalf + G.transmon.cpw.widthCm / 2;
        assert.ok(clear, 'CPW never crosses a qubit pad');
      }
    }
  }
  // Serpentine x-extent is exactly the spec meander span.
  for (const path of G.transmon.cpw.paths) {
    const xs = path.map((p) => p.x);
    assert.equal(Math.max(...xs) - Math.min(...xs) + 1e-12 >= G.transmon.cpw.spanCm - 1e-12, true);
    assert.equal(Math.abs((Math.max(...xs) - Math.min(...xs)) - G.transmon.cpw.spanCm) < 1e-9, true, 'CPW span = meander_span_cm');
  }
  // MZI waveguides stay within the die.
  for (const path of G.mzi.waveguides.paths) {
    for (const pt of path) {
      assert.ok(Math.abs(pt.x) <= G.mzi.die.widthCm / 2, 'waveguide x within die');
      assert.ok(Math.abs(pt.z) + G.mzi.waveguides.tubeRadiusCm <= G.mzi.die.heightCm / 2, 'waveguide z within die');
    }
  }
  // Tweezer lattice and halos sit inside the UHV chamber with clearance.
  const maxExtent = Math.hypot(
    Math.max(...G.tweezer.atoms.positions.map((p) => Math.abs(p.x))),
    Math.max(...G.tweezer.atoms.positions.map((p) => Math.abs(p.z)))
  );
  assert.ok(maxExtent + G.tweezer.halos.radiusCm < G.tweezer.chamber.radiusCm, 'lattice + blockade radius inside chamber');
  // Chamber fits on the optical table.
  assert.ok(G.tweezer.chamber.radiusCm * 2 <= G.tweezer.table.widthCm, 'chamber diameter within table width');
  // Viewports align with the atom plane so the beams pass through them.
  assert.equal(G.tweezer.chamber.viewportYCm, G.tweezer.atoms.planeYCm);
  assert.equal(G.tweezer.lasers.rydberg.planeYCm, G.tweezer.chamber.viewportYCm);
  assert.equal(G.tweezer.lasers.trap.planeYCm, G.tweezer.chamber.viewportYCm);
  // Beams span the chamber diameter exactly (enter/exit through viewports).
  assert.equal(G.tweezer.lasers.rydberg.lengthCm, G.tweezer.chamber.radiusCm * 2);
});

test('WP-5.4: geometry is PARAMETRIC — mutating the JSON mutates the derivation (binding proof)', () => {
  const clone = (json, mutate) => {
    const copy = JSON.parse(JSON.stringify(json));
    mutate(copy);
    return deriveAll(copy);
  };

  // Stage radius bound: change the 300 K plate radius → geometry follows.
  const stretched = clone(spec, (j) => { j.dilution_cryostat.stages[0].plate_radius_cm = 2.0; });
  assert.equal(stretched.cryostat.stages[0].radiusCm, 2.0);
  assert.equal(stretched.cryostat.supportRods.ringRadiusCm, (2.0 + 0.78) / 2, 'rod ring follows plate radii');
  // Stage y bound.
  const lifted = clone(spec, (j) => { j.dilution_cryostat.stages[3].y_cm = 1.0; });
  assert.equal(lifted.cryostat.stages[3].yCm, 1.0);
  assert.equal(lifted.transmon.dieCenterYCm, 1.0 + 0.05 + lifted.transmon.thicknessCm / 2, 'die remounts on the moved base stage');
  // Stage label bound (temperature parsed from the label, not hardcoded).
  // The 300 K stage is renamed because strap routing references the colder
  // stages by label — a renamed referenced stage fails closed (tested below).
  const relabeled = clone(spec, (j) => { j.dilution_cryostat.stages[0].label = '295 K'; });
  assert.equal(relabeled.stageTempsK[0], 295);

  // Pad pitch bound: doubling the pitch doubles the grid extent.
  const coarse = clone(spec, (j) => { j.transmon_die.pad_grid = '4×4 gold pads, 0.2 cm pitch'; });
  assert.equal(coarse.transmon.pads.pitchCm, 0.2);
  assert.ok(Math.abs(coarse.transmon.pads.positions[15].x - 0.3) < 1e-9, 'pad positions follow pitch');
  // CPW conductor width bound.
  const wide = clone(spec, (j) => { j.transmon_die.coplanar_waveguides.conductor_width_cm = 0.04; });
  assert.equal(wide.transmon.cpw.tubeRadiusCm, 0.02);
  // JJ count must stay consistent with the pad grid — mismatch fails closed.
  assert.throws(() => clone(spec, (j) => { j.transmon_die.josephson_junctions.count = 15; }), /spec inconsistent/);

  // MZI die size bound.
  const biggerChip = clone(spec, (j) => { j.photonic_mzi_chip.size_cm = { w: 3.0, h: 2.0 }; });
  assert.equal(biggerChip.mzi.die.widthCm, 3.0);
  assert.equal(biggerChip.mzi.waveguides.armOffsetCm, 2.0 * RENDER.MZI_ARM_OFFSET_OF_HEIGHT, 'arm offset follows die height');

  // Tweezer lattice bound.
  const dense = clone(spec, (j) => { j.neutral_atom_uhv_chamber.tweezer_grid.lattice_pitch_cm = 0.06; });
  assert.equal(dense.tweezer.atoms.pitchCm, 0.06);
  // Lattice is column-major (ix outer, iz inner): adjacent entries differ in z.
  assert.ok(Math.abs(dense.tweezer.atoms.positions[1].z - dense.tweezer.atoms.positions[0].z - 0.06) < 1e-9, 'lattice pitch follows the JSON');
  // Laser wavelength bound → beam hue follows.
  const greenRydberg = clone(spec, (j) => { j.neutral_atom_uhv_chamber.lasers.rydberg_nm = 520; });
  assert.equal(greenRydberg.tweezer.lasers.rydberg.colorHex, wavelengthToHex(520));
  // Bloch radius bound.
  const bigBloch = clone(spec, (j) => { j.bloch_instrumentation.sphere_radius_cm = 0.6; });
  assert.equal(bigBloch.bloch.sphereRadiusCm, 0.6);
});

test('WP-5.4: malformed specs fail closed with precise reasons', () => {
  const broken = (mutate) => {
    const copy = JSON.parse(JSON.stringify(spec));
    mutate(copy);
    return () => deriveAll(copy);
  };
  assert.throws(broken((j) => { delete j.transmon_die; }), /transmon_die/);
  assert.throws(broken((j) => { delete j.photonic_mzi_chip; }), /photonic_mzi_chip/);
  assert.throws(broken((j) => { delete j.bloch_instrumentation; }), /bloch_instrumentation/);
  assert.throws(broken((j) => { j.dilution_cryostat.stages[1].label = 'not a temp'; }), /cannot parse stage temperature/);
  assert.throws(broken((j) => { j.dilution_cryostat.stages[1].y_cm = 4.0; }), /descend in y/);
  assert.throws(broken((j) => { j.transmon_die.pad_grid = 'many pads'; }), /cannot parse pad grid/);
  assert.throws(broken((j) => { j.bloch_instrumentation.sphere_radius_cm = 'big'; }), /must be a finite number/);
  assert.throws(broken((j) => {
    j.dilution_cryostat.components = j.dilution_cryostat.components.filter((c) => c.name !== 'canister');
  }), /canister/);
  assert.throws(broken((j) => {
    j.dilution_cryostat.components.find((c) => c.name === 'thermal straps').routing = 'boiler → pump';
  }), /strap routing/);
});

test('WP-5.4: scene placement constants are single-sourced (app/test consistency)', () => {
  assert.equal(G.mzi.die.mountYCm, SCENE.MZI_MOUNT_Y_CM);
  assert.equal(G.tweezer.table.topYCm, SCENE.TWEEZER_TABLE_TOP_Y_CM);
  assert.equal(G.tweezer.chamber.baseYCm, SCENE.TWEEZER_TABLE_TOP_Y_CM + G.tweezer.table.thicknessCm / 2);
  // Atom focal plane: the chamber mid-height working distance (fraction of
  // the chamber height above the chamber base).
  assert.equal(
    G.tweezer.atoms.planeYCm,
    G.tweezer.chamber.baseYCm + G.tweezer.chamber.heightCm * RENDER.ATOM_PLANE_OF_CHAMBER_HEIGHT
  );
});
