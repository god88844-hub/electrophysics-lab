/**
 * WP-4.3 parity-fixture generator (provenance tool, not a test).
 *
 * Captures deterministic golden vectors from the REAL Phase 0 oracle
 * `packages/chip-engine/src/accelerators.mjs` (`systolicMatmul`) into
 * `tpu_parity_vectors.json`, which `tests/tpu_oracle.rs` asserts bit-exactly.
 *
 * Run from the repo root:
 *   node crates/ep-kernel/ep-chip/tests/data/gen_tpu_parity.mjs
 *
 * Determinism: every input is a pure function of the case name (fixed LCG
 * seed per case) — re-running regenerates byte-identical vectors.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { systolicMatmul } from '../../../../../packages/chip-engine/src/accelerators.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Deterministic LCG (mulberry32). */
function lcg(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic matrix with values in [-max, max] on a 0.5 grid (halves
 * exercise the JS `Math.round` quantization boundary). */
function lcgMatrix(rows, cols, seed, max = 200) {
  const rand = lcg(seed);
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.floor(rand() * (2 * max + 1)) - max) / 2)
  );
}

function constMatrix(rows, cols, value) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => value));
}

const cases = [
  {
    name: 'small_odd_partial_tiles',
    opts: { gridSize: 2 },
    A: lcgMatrix(4, 3, 0x1515, 60),
    B: lcgMatrix(3, 5, 0x2525, 60),
  },
  {
    name: 'default_grid_partial',
    opts: {}, // defaults: P=8, 100 MHz, 0.8 V, α=0.35, C=1.2e-13 F
    A: lcgMatrix(10, 7, 0x3535, 110),
    B: lcgMatrix(7, 9, 0x4545, 110),
  },
  {
    name: 'exact_64_tiles_heatmap',
    opts: { gridSize: 8 },
    A: lcgMatrix(64, 64, 0x5555),
    B: lcgMatrix(64, 64, 0x6565),
  },
  {
    name: 'single_element_p1',
    opts: { gridSize: 1 },
    A: [[-3.5]],
    B: [[9.5]],
  },
  {
    name: 'half_rounding_boundaries',
    opts: { gridSize: 2, clockMHz: 100 },
    A: [[0.5, -0.5, 127.5, -127.5], [126.5, -126.5, 1.5, -1.5], [64.5, -64.5, 32.5, -32.5]],
    B: [[0.5, -0.5], [127.5, 127.5], [-126.5, 126.5], [63.5, -63.5]],
  },
  {
    // The oracle clamps inputs to ±127 first, so real INT32 saturation needs
    // K·127·127 > 2^31 − 1 → K ≥ 133145 (the K_max = 2^31/(255·255) = 33025
    // admission guard is the conservative worst-case INT8 bound that protects
    // any INT8 inputs, clamped or not).
    name: 'overflow_positive_saturation',
    opts: { gridSize: 8 },
    A: constMatrix(2, 133145, 127),
    B: constMatrix(133145, 2, 127),
  },
  {
    name: 'overflow_negative_saturation',
    opts: { gridSize: 8 },
    A: constMatrix(2, 133145, -127),
    B: constMatrix(133145, 2, 127),
  },
  {
    name: 'mixed_signs_p4',
    opts: { gridSize: 4, clockMHz: 700, vdd: 0.9, activityFactor: 0.2, capPerMacFf: 0.9e-13 },
    A: lcgMatrix(9, 6, 0x7575),
    B: lcgMatrix(6, 11, 0x8585),
  },
];

const vectors = cases.map(({ name, opts, A, B }) => {
  const out = systolicMatmul(A, B, opts);
  return {
    name,
    opts: {
      gridSize: opts.gridSize ?? 8,
      clockMHz: opts.clockMHz ?? 100,
      vdd: opts.vdd ?? 0.8,
      activityFactor: opts.activityFactor ?? 0.35,
      capPerMacFf: opts.capPerMacFf ?? 1.2e-13,
    },
    A,
    B,
    C: out.C,
    cycles: out.cycles,
    utilization: out.utilization,
    macOps: out.macOps,
    tiles: out.tiles,
    dynamicPowerW: out.dynamicPowerW,
    peakTilePowerW: out.peakTilePowerW,
    tileOverflow: out.tileOverflow,
  };
});

const fixture = {
  _provenance: {
    generator: 'crates/ep-kernel/ep-chip/tests/data/gen_tpu_parity.mjs',
    oracle: 'packages/chip-engine/src/accelerators.mjs :: systolicMatmul',
    oracle_equations: [
      'cycles = ceil(M/P) · ceil(N/P) · (K + 2P − 2)',
      'utilization = (M·N·K) / (tiles · (K + 2P − 2) · P²)',
      'dynamicPowerW = α · C · V² · f · P²',
    ],
    note: 'Captured deterministically from the sealed Phase 0 chip-engine (WP-4.3 bit-exact oracle, 03 §5: TPU GEMM — exact INT8 reference math, tolerance bit-exact). Re-run the generator to reproduce byte-identically.',
  },
  vectors,
};

const outPath = path.join(here, 'tpu_parity_vectors.json');
writeFileSync(outPath, JSON.stringify(fixture, null, 2) + '\n');
const sum = fixture.vectors.reduce((a, v) => a + v.tileOverflow.length, 0);
console.log(`wrote ${outPath}: ${vectors.length} vectors, ${sum} overflow events total`);
for (const v of vectors) {
  console.log(`  ${v.name}: tiles=${v.tiles} cycles=${v.cycles} util=${v.utilization.toFixed(6)} overflow=${v.tileOverflow.length} dynW=${v.dynamicPowerW}`);
}
