/**
 * WP-4.3 parity-fixture generator (provenance tool, not a test).
 *
 * Captures deterministic golden vectors from the REAL Phase 0 oracle
 * `packages/chip-engine/src/accelerators.mjs` (`systolicMatmul`) into
 * `tpu_parity_vectors.json`, which `tests/tpu_oracle.rs` asserts bit-exactly.
 *
 * Compact representation: matrix operands are stored as SPECS, not arrays —
 * `{ kind: "lcg", seed, rows, cols, max }` (deterministic mulberry32 stream,
 * values on a 0.5 grid) or `{ kind: "fill", value, rows, cols }` — and the
 * Rust test materializes them with a bit-exact LCG port (pinned per-case by
 * a captured `probe` of the first four flat values). Outputs (C, overflow
 * events, cycle/power scalars) are captured materialized from the oracle.
 *
 * Run from the repo root:
 *   node crates/ep-kernel/ep-chip/tests/data/gen_tpu_parity.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { systolicMatmul } from '../../../../../packages/chip-engine/src/accelerators.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Deterministic mulberry32 (shared, pinned, integer-exact). */
function lcg(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Materialize a matrix SPEC exactly as the Rust test will. */
function materialize(spec) {
  if (spec.kind === 'fill') {
    return Array.from({ length: spec.rows }, () =>
      Array.from({ length: spec.cols }, () => spec.value)
    );
  }
  if (spec.kind === 'lcg') {
    const rand = lcg(spec.seed);
    return Array.from({ length: spec.rows }, () =>
      Array.from({ length: spec.cols }, () => (Math.floor(rand() * (2 * spec.max + 1)) - spec.max) / 2)
    );
  }
  return spec; // explicit literal
}

function probe(mat) {
  // First four FLAT values (row-major) — unambiguous against any geometry.
  const flat = mat.flat();
  return [flat[0], flat[1], flat[2], flat[3]];
}

const cases = [
  {
    name: 'small_odd_partial_tiles',
    opts: { gridSize: 2 },
    A: { kind: 'lcg', seed: 0x1515, rows: 4, cols: 3, max: 60 },
    B: { kind: 'lcg', seed: 0x2525, rows: 3, cols: 5, max: 60 },
  },
  {
    name: 'default_grid_partial',
    opts: {}, // defaults: P=8, 100 MHz, 0.8 V, α=0.35, C=1.2e-13 F
    A: { kind: 'lcg', seed: 0x3535, rows: 10, cols: 7, max: 110 },
    B: { kind: 'lcg', seed: 0x4545, rows: 7, cols: 9, max: 110 },
  },
  {
    name: 'exact_64_tiles_heatmap',
    opts: { gridSize: 8 },
    A: { kind: 'lcg', seed: 0x5555, rows: 64, cols: 64, max: 200 },
    B: { kind: 'lcg', seed: 0x6565, rows: 64, cols: 64, max: 200 },
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
    A: { kind: 'fill', value: 127, rows: 2, cols: 133145 },
    B: { kind: 'fill', value: 127, rows: 133145, cols: 2 },
  },
  {
    name: 'overflow_negative_saturation',
    opts: { gridSize: 8 },
    A: { kind: 'fill', value: -127, rows: 2, cols: 133145 },
    B: { kind: 'fill', value: 127, rows: 133145, cols: 2 },
  },
  {
    name: 'mixed_signs_p4',
    opts: { gridSize: 4, clockMHz: 700, vdd: 0.9, activityFactor: 0.2, capPerMacFf: 0.9e-13 },
    A: { kind: 'lcg', seed: 0x7575, rows: 9, cols: 6, max: 200 },
    B: { kind: 'lcg', seed: 0x8585, rows: 6, cols: 11, max: 200 },
  },
];

const vectors = cases.map(({ name, opts, A, B }) => {
  const matA = materialize(A);
  const matB = materialize(B);
  const out = systolicMatmul(matA, matB, opts);
  return {
    name,
    opts: {
      gridSize: opts.gridSize ?? 8,
      clockMHz: opts.clockMHz ?? 100,
      vdd: opts.vdd ?? 0.8,
      activityFactor: opts.activityFactor ?? 0.35,
      capPerMacFf: opts.capPerMacFf ?? 1.2e-13,
    },
    A: A.kind === 'lcg' ? { ...A, probe: probe(matA) } : A,
    B: B.kind === 'lcg' ? { ...B, probe: probe(matB) } : B,
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
    lcg: 'mulberry32 — deterministic; the Rust test ports it bit-exactly and pins each stream with the captured per-case probe',
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
