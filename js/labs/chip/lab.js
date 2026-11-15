// lab.js — Chip Lab registration: run hooks + design validation.

import { registerLab } from '../../core/registry.js';
import { runChip, solveDC, buildNetlist } from './engine.js';
import { toSpiceDeck } from './spice-export.js';
import { makeCheck, unknownCheck, assembleReport, withinTol } from '../../core/validation.js';

export const chipLab = {
  id: 'chip',
  label: 'Chip Lab',
  blurb: 'Analog circuits: SPICE-style MNA (DC/transient/AC), transistor models, power & thermal estimates, SPICE deck export.',
  accent: '#e0a34f',
  metaSchema: [
    { key: 'analysis', label: 'Analysis', type: 'select', options: ['dc', 'tran', 'ac'], default: 'tran' },
    { key: 'tstop', label: 'Transient stop time (s)', type: 'number', default: 1e-3, noTolRequired: true },
    { key: 'dt', label: 'Transient timestep (s)', type: 'number', default: 1e-6, noTolRequired: true },
    { key: 'fstart', label: 'AC start (Hz)', type: 'number', default: 10, noTolRequired: true },
    { key: 'fstop', label: 'AC stop (Hz)', type: 'number', default: 1e7, noTolRequired: true },
  ],

  run(diagram, opts = {}) {
    return runChip(diagram, { ...Object.fromEntries((this.metaSchema || []).map((s) => [s.key, diagram.meta?.[s.key] ?? s.default])), ...opts });
  },

  /** Analytical references used to validate the solver on the drawn circuit. */
  validate(diagram) {
    const checks = [];
    const issues = diagram.issues();
    checks.push(issues.length === 0
      ? { name: 'Structure: no dangling wires or unknown types', verdict: 'pass', actual: 0, expected: 0, tolerance: 0, note: '', evidence: null }
      : { name: `Structure: ${issues.length} issue(s)`, verdict: 'fail', actual: issues.length, expected: 0, tolerance: 0, note: issues.join('; '), evidence: null });

    const nl = buildNetlist(diagram);
    if (nl.problems.length) {
      checks.push({ name: 'Netlist: solvable topology', verdict: 'fail', actual: nl.problems.length, expected: 0, tolerance: 0, note: nl.problems.join('; '), evidence: null });
      return checks;
    }

    // ---- RC low-pass check: simulated cutoff vs theory 1/(2πRC) ----------
    const caps = nl.entries.filter((e) => e.def.chip.kind === 'cap');
    const res = nl.entries.filter((e) => e.def.chip.kind === 'res');
    if (caps.length === 1 && res.length === 1) {
      const R = res[0].params.r, Cc = caps[0].params.c;
      const fTheory = 1 / (2 * Math.PI * R * Cc);
      const ac = this.run(diagram, { analysis: 'ac', fstart: fTheory / 100, fstop: fTheory * 100, points: 200 });
      if (ac.ok) {
        const meterId = Object.keys(ac.meters)[0];
        if (meterId) {
          const db = ac.meters[meterId].db;
          let f3db = null;
          for (let i = 1; i < db.length; i++) {
            if (db[i] <= -3 && db[i - 1] > -3) {
              const t = (-3 - db[i - 1]) / (db[i] - db[i - 1]);
              f3db = ac.f[i - 1] + t * (ac.f[i] - ac.f[i - 1]);
              break;
            }
          }
          if (f3db) {
            checks.push(makeCheck({
              name: `RC low-pass cutoff (R=${R}Ω, C=${Cc.toExponential(1)}F)`,
              actual: f3db, expected: fTheory, rel: 0.05,
              note: '−3 dB point from AC sweep vs 1/(2πRC)',
              evidence: { method: 'AC sweep interpolation', points: db.length },
            }));
          } else {
            checks.push(unknownCheck('RC cutoff: −3 dB point not crossed in sweep', 'Widen the AC frequency range.'));
          }
        }
      } else {
        checks.push({ name: 'AC sweep for cutoff', verdict: 'fail', actual: null, expected: null, tolerance: 0, note: ac.problems.join('; '), evidence: null });
      }
    }

    // ---- DC sanity: element powers finite, no NaN ------------------------
    const dc = solveDC(diagram);
    if (dc.ok) {
      const bad = dc.elements.filter((e) => !isFinite(e.power) || !isFinite(e.i));
      checks.push(makeCheck({
        name: 'DC operating point: all element currents/powers finite',
        actual: bad.length, expected: 0,
        note: bad.length ? `non-finite at: ${bad.map((b) => b.blockId).join(', ')}` : `total power ${dc.elements.reduce((a, b) => a + b.power, 0).toExponential(3)} W`,
      }));
      // thermal estimates within plausible range
      const hot = dc.elements.filter((e) => e.tempC && e.tempC > 200);
      if (hot.length) {
        checks.push(makeCheck({
          name: 'Thermal estimate: junction temperature < 200 °C',
          actual: Math.max(...hot.map((h) => h.tempC)), expected: 200, abs: 0,
          verdict: 'warn',
          note: `hot elements: ${hot.map((h) => `${h.blockId} @ ${h.tempC.toFixed(0)}°C`).join(', ')} (Rth model, not measured)`,
        }));
      }
    } else {
      checks.push({ name: 'DC operating point', verdict: 'fail', actual: null, expected: null, tolerance: 0, note: dc.problems.join('; '), evidence: null });
    }

    return checks;
  },

  report(diagram) {
    return assembleReport({ diagram, checks: this.validate(diagram) });
  },

  exportSpice(diagram, opts) {
    return toSpiceDeck(diagram, opts);
  },
};

registerLab(chipLab);
