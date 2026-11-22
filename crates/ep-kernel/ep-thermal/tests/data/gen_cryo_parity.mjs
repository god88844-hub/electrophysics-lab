/**
 * WP-5.6 parity-fixture generator (provenance tool, not a test).
 *
 * Captures deterministic golden step sequences from the REAL Phase 0 oracle
 * `packages/physics-engine/src/cryo.mjs` (`createCryoStage`) into
 * `cryo_parity.json`, which `tests/cryo_quench.rs` asserts bit-exactly.
 *
 * Run from the repo root:
 *   node crates/ep-kernel/ep-thermal/tests/data/gen_cryo_parity.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createCryoStage } from '../../../../../packages/physics-engine/src/cryo.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

const scenarios = [
  {
    name: 'hold_equilibrium_12mw',
    steps: 120,
    dt: 1.0,
    load: 0.012, // exactly the 15 mK stage capacity — equilibrium, no quench
  },
  {
    name: 'overload_heating_13mw',
    steps: 60,
    dt: 1.0,
    load: 0.013, // > 12 mW — quench: the stage warms
  },
  {
    name: 'recovery_5mw',
    steps: 200,
    dt: 1.0,
    load: 0.005, // below capacity — the stage cools back to the floor
  },
  {
    name: 'large_dt_stability',
    steps: 40,
    dt: 10.0,
    load: 0.02, // far above capacity with a huge dt — substepping must stay stable
  },
  {
    name: 'full_quench_wave',
    steps: 300,
    dt: 2.0,
    load: 0.3, // 300 mW — past the Al transition for the collapse flag
  },
];

const vectors = scenarios.map(({ name, steps, dt, load }) => {
  const stage = createCryoStage({});
  const temps = [];
  const nets = [];
  for (let i = 0; i < steps; i++) {
    const out = stage.step(dt, load);
    temps.push(out.tempK);
    nets.push(out.netW);
  }
  return {
    name,
    opts: { cthJPerK: 5e-3, floorK: 0.015, initialK: 0.015 },
    steps,
    dt,
    load,
    temps,
    finalNetW: nets[nets.length - 1],
    _provenance: 'captured deterministically from packages/physics-engine/src/cryo.mjs',
  };
});

const fixture = {
  _provenance: {
    generator: 'crates/ep-kernel/ep-thermal/tests/data/gen_cryo_parity.mjs',
    oracle: 'packages/physics-engine/src/cryo.mjs :: createCryoStage',
    equations: [
      'C_th·dT/dt = Q_load − Q_cool(T)',
      'Q_cool: max(Q_15mK, Q_100mK·(T/0.1)²) below 0.1 K; linear Q_100mK→Q_4K to 4 K; capped above',
      'explicit Euler substepping dt_sub = 0.4·τ, τ = C_th/(dQ_cool/dT)',
    ],
    note: 'Re-run the generator to reproduce byte-identically (pure deterministic float math).',
  },
  vectors,
};

const outPath = path.join(here, 'cryo_parity.json');
writeFileSync(outPath, JSON.stringify(fixture, null, 2) + '\n');
console.log(`wrote ${outPath}: ${vectors.length} vectors`);
for (const v of vectors) {
  console.log(`  ${v.name}: final T = ${v.temps[v.temps.length - 1].toExponential(6)} K, net = ${v.finalNetW.toExponential(4)} W`);
}
