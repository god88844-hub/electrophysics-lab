// optics/index.js — the "Lab VII" plugin demo (plan Step 9).
// A complete third-party lab built ONLY on the public plugin API:
// registerComponent + registerLab (+ registerExample). No core changes.
// Physics: paraxial thin-lens optics.

import { registerComponent, registerLab, registerExample } from '../../core/registry.js';
import { Diagram } from '../../core/diagram.js';
import { makeCheck, assembleReport } from '../../core/validation.js';

const PORT = (dir, id, name) => ({ id, name, dir, type: 'optics' });

registerComponent({
  typeId: 'optics.SOURCE', lab: 'optics', category: 'Optics', label: 'Point Source',
  desc: 'Object point at distance u before the lens, height h on the axis.',
  params: [
    { key: 'u', label: 'Object distance u (mm)', type: 'number', default: 60, min: 0.001 },
    { key: 'h', label: 'Object height h (mm)', type: 'number', default: 10 },
  ],
  ports: () => [PORT('out', 'out', '→')],
  optics: { kind: 'source' },
  draw: '☀',
  validation: { provenance: 'Ideal point source (geometric optics). No extended source, no spectrum.' },
});

registerComponent({
  typeId: 'optics.LENS', lab: 'optics', category: 'Optics', label: 'Thin Lens',
  desc: 'Ideal thin lens, focal length f, aperture a. Paraxial model.',
  params: [
    { key: 'f', label: 'Focal length f (mm)', type: 'number', default: 40, tol: 0.02, min: 0.001 },
    { key: 'aperture', label: 'Aperture (mm)', type: 'number', default: 20, noTolRequired: true },
  ],
  ports: () => [PORT('in', 'in', 'in'), PORT('out', 'out', 'out')],
  optics: { kind: 'lens' },
  draw: ')(  ',
  validation: { provenance: 'Thin-lens equation 1/u + 1/v = 1/f (paraxial). No aberrations, no diffraction; real lenses deviate at short distances and large angles.' },
});

registerComponent({
  typeId: 'optics.SCREEN', lab: 'optics', category: 'Optics', label: 'Screen',
  desc: 'Observation screen at distance d after the lens. Reports spot size.',
  params: [
    { key: 'd', label: 'Screen distance d (mm)', type: 'number', default: 80, min: 0 },
  ],
  ports: () => [PORT('in', 'in', 'in')],
  optics: { kind: 'screen' },
  draw: '▤',
  validation: { provenance: 'Geometric projection of the paraxial image.' },
});

export const opticsLab = {
  id: 'optics',
  label: 'Optics Lab',
  blurb: 'Paraxial thin-lens optics (third-party plugin demo): sources, lenses, screens, ray diagrams.',
  accent: '#5fd4d0',
  hasCanvas: true,
  metaSchema: [],

  run(diagram) {
    const problems = [];
    const blocks = diagram.blocks;
    const source = blocks.find((b) => b.type === 'optics.SOURCE');
    const lens = blocks.find((b) => b.type === 'optics.LENS');
    const screen = blocks.find((b) => b.type === 'optics.SCREEN');
    if (!source) problems.push('Missing a Point Source block.');
    if (!lens) problems.push('Missing a Thin Lens block.');
    if (!screen) problems.push('Missing a Screen block.');
    if (problems.length) return { ok: false, problems };

    // verify the chain is actually wired source -> lens -> screen
    const connected = (a, b) => diagram.wires.some((w) =>
      (w.from.block === a && w.to.block === b) || (w.from.block === b && w.to.block === a));
    if (!connected(source.id, lens.id) || !connected(lens.id, screen.id)) {
      problems.push('Blocks must be wired in series: Source → Lens → Screen.');
      return { ok: false, problems };
    }

    const u = source.params.u, h = source.params.h;
    const f = lens.params.f, aperture = lens.params.aperture;
    const d = screen.params.d;

    // thin-lens equation; object at focal point -> image at infinity
    const v = Math.abs(u - f) < 1e-12 ? Infinity : 1 / (1 / f - 1 / u);
    const m = v === Infinity ? Infinity : -v / u;
    const spot = v === Infinity ? Infinity : aperture * Math.abs(d - v) / Math.abs(v);

    return {
      ok: true, u, h, f, aperture, d, v, m, spot,
      warnings: v === Infinity ? ['Object at the focal point: image forms at infinity — screen shows a diffuse spot.'] : [],
    };
  },

  validate(diagram) {
    const checks = [];
    const res = this.run(diagram);
    if (!res.ok) {
      checks.push({ name: 'Optical chain', verdict: 'fail', actual: null, expected: null, tolerance: 0, note: res.problems.join('; '), evidence: null });
      return checks;
    }
    // lens formula conservation (exact by construction — verifies the engine)
    if (res.v !== Infinity) {
      checks.push(makeCheck({
        name: 'Thin-lens formula: 1/u + 1/v = 1/f',
        actual: 1 / res.u + 1 / res.v, expected: 1 / res.f, abs: 1e-9,
        note: 'geometric identity of the paraxial model',
      }));
    } else {
      checks.push({ name: 'Object at focal point: image at infinity', verdict: 'warn', actual: null, expected: null, tolerance: null, note: 'no conjugate image — spot undefined', evidence: null });
    }
    // physical sanity: magnification sign convention
    if (res.v !== Infinity) {
      checks.push(makeCheck({
        name: 'Image forms on the far side (v > 0) for object outside focal length',
        actual: res.v > 0 ? 1 : 0, expected: res.u > res.f ? 1 : 0,
        verdict: (res.v > 0) === (res.u > res.f) ? 'pass' : 'fail',
        note: res.u > res.f ? 'real image expected' : 'virtual image expected (v < 0)',
      }));
    }
    checks.push({
      name: 'Paraxial assumption honesty',
      verdict: 'warn', actual: null, expected: null, tolerance: null,
      note: 'Thin-lens/paraxial model: no aberrations, no diffraction. Exact only for small angles.',
      evidence: null,
    });
    return checks;
  },

  report(diagram) {
    return assembleReport({ diagram, checks: this.validate(diagram) });
  },
};

registerLab(opticsLab);

// example that ships with the plugin
registerExample({
  id: 'optics-lens-demo',
  label: 'Optics: converging lens (plugin demo)',
  lab: 'optics',
  blurb: 'Point source + thin lens + screen: image distance, magnification and spot size.',
  getJSON: () => {
    const d = new Diagram({ name: 'Converging lens', lab: 'optics' });
    const src = d.addBlock('optics.SOURCE', { params: { u: 60, h: 10 }, x: 40, y: 80 });
    const lens = d.addBlock('optics.LENS', { params: { f: 40, aperture: 20 }, x: 240, y: 80 });
    const scr = d.addBlock('optics.SCREEN', { params: { d: 120 }, x: 440, y: 80 });
    d.connect(src.id, 'out', lens.id, 'in');
    d.connect(lens.id, 'out', scr.id, 'in');
    return d.toJSON();
  },
});
