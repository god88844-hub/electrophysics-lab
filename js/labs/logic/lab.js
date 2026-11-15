// lab.js — Logic Lab registration: run hooks + design validation.
// Validation follows the platform mission: verdicts come from exhaustive
// truth-table evidence against the documented algebra, and anything without
// evidence is reported as 'unknown', never as a pass.

import { registerLab, getComponent } from '../../core/registry.js';
import { runLogic, truthTableTest } from './engine.js';
import { makeCheck, unknownCheck, assembleReport } from '../../core/validation.js';
import { diagramIssues } from './check-utils.js';

// Independent reference algebra (kept separate from the implementation on
// purpose: the check re-derives the expected outputs from the definitions).
const REF = {
  'logic.AND':   (i, r) => ({ y: Math.min(i.a, i.b) }),
  'logic.OR':    (i, r) => ({ y: Math.max(i.a, i.b) }),
  'logic.NAND':  (i, r) => ({ y: r - 1 - Math.min(i.a, i.b) }),
  'logic.NOR':   (i, r) => ({ y: r - 1 - Math.max(i.a, i.b) }),
  'logic.XOR':   (i, r) => ({ y: (i.a + i.b) % r }),
  'logic.XNOR':  (i, r) => ({ y: r - 1 - ((i.a + i.b) % r) }),
  'logic.NOT':   (i, r) => ({ y: r - 1 - i.a }),
  'logic.BUF':   (i, r) => ({ y: i.a }),
  'logic.ADDN':  (i, r) => { const t = i.a + i.b + i.cin; return { sum: t % r, cout: Math.floor(t / r) }; },
  'logic.CMPN':  (i, r) => ({ gt: i.a > i.b ? r - 1 : 0, eq: i.a === i.b ? r - 1 : 0 }),
  'logic.MUX2':  (i, r) => ({ y: i.sel === 0 ? i.a : i.b }),
};

const TEST_PORTS = {
  'logic.ADDN': ['a', 'b', 'cin'],
  'logic.CMPN': ['a', 'b'],
  'logic.MUX2': ['sel', 'a', 'b'],
  'logic.NOT': ['a'],
  'logic.BUF': ['a'],
};

export const logicLab = {
  id: 'logic',
  label: 'Logic Lab',
  blurb: 'Arbitrary-radix digital circuits (binary, ternary, quaternary): gates, flip-flops, adders, waveform scopes.',
  accent: '#4f9cf9',
  metaSchema: [
    { key: 'radix', label: 'Signal radix', type: 'select', options: [2, 3, 4], default: 2 },
  ],

  run(diagram, opts = {}) {
    return runLogic(diagram, opts);
  },

  /** Design-level validation of the current diagram (returns checks[]). */
  validate(diagram) {
    const checks = [];
    const radix = diagram.meta?.radix ?? 2;
    const used = new Set(diagram.blocks.map((b) => b.type));

    for (const issues of diagramIssues(diagram)) checks.push(makeCheck({
      name: `Structure: ${issues}`,
      actual: 0, expected: 0, note: 'dangling wires / unknown types', verdict: 'fail',
    }));
    if (diagram.issues().length === 0) checks.push({
      name: 'Structure: no dangling wires or unknown component types',
      verdict: 'pass', actual: 0, expected: 0, tolerance: 0, note: '', evidence: null,
    });

    for (const typeId of used) {
      const def = getComponent(typeId);
      if (!def?.logic?.eval) continue;
      const ports = TEST_PORTS[typeId];
      if (ports && REF[typeId]) {
        const t = truthTableTest(def, radix, REF[typeId], ports);
        checks.push(makeCheck({
          name: `Truth table: ${def.label} @ radix ${radix} (${t.rows.length} combinations, exhaustive)`,
          actual: t.mismatches.length,
          expected: 0,
          abs: 0,
          note: t.pass ? 'all combinations match reference algebra' : `mismatches: ${JSON.stringify(t.mismatches.slice(0, 3))}`,
          evidence: { rows: t.rows.length, mismatches: t.mismatches.length },
        }));
      } else if (!def.validation?.provenance) {
        checks.push(unknownCheck(`${def.label}: no validated model`, 'Component has no truth-table reference and no provenance.'));
      }
    }
    return checks;
  },

  report(diagram) {
    return assembleReport({ diagram, checks: this.validate(diagram) });
  },
};

registerLab(logicLab);
