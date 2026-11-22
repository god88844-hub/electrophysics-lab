/**
 * WP-4.2 parity-fixture generator (provenance tool, not a test).
 *
 * Captures deterministic golden vectors from the REAL Phase 0 oracle
 * `packages/chip-engine/src/accelerators.mjs` (`simulateWarpKernel`) into
 * `gpu_parity_vectors.json`, which `tests/gpu_oracle.rs` asserts bit-exactly
 * (cycle counts, divergence events, occupancy to the last f64 bit, and the
 * per-lane {value, tookBranch} results in lane order).
 *
 * Kernels are the named deterministic kernels below (mirrored exactly in the
 * Rust test); inputs are literal integer arrays captured into the fixture —
 * the Rust side materializes them without any RNG-port risk. A probe of the
 * mulberry32 stream pins the input generation per case.
 *
 * Run from the repo root:
 *   node crates/ep-kernel/ep-chip/tests/data/gen_gpu_parity.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { simulateWarpKernel } from '../../../../../packages/chip-engine/src/accelerators.mjs';

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

/** The named kernels — mirrored EXACTLY in tests/gpu_oracle.rs. */
const KERNELS = {
  // Never branches: every warp uniform (1 cycle per warp).
  uniform: (lane, x) => ({ value: 2 * x + lane, tookBranch: false }),
  // Branches on the input payload: mixed divergence inside data warps.
  threshold: (lane, x) => {
    const t = x > 100;
    return { value: t ? x - 100 : x + 100, tookBranch: t };
  },
  // Branches on lane parity: alternating lanes inside every warp.
  mod2: (lane, x) => {
    const t = lane % 2 === 0;
    return { value: t ? Math.floor(lane / 2) : 3 * lane + 1, tookBranch: t };
  },
  // Every lane takes the branch — the ESM convention counts this divergent
  // (any tookBranch) even though the mask is uniform-taken.
  allBranch: (lane, x) => ({ value: lane + x, tookBranch: true }),
  // Branches on input oddness.
  oddBranch: (lane, x) => {
    const t = (x & 1) === 1;
    return { value: t ? x * 3 : x + 1, tookBranch: t };
  },
  // Branches for lanes ≥ 16: warp 0 mixed, all later warps uniform-taken.
  highLaneBranch: (lane, x) => {
    const t = lane >= 16;
    return { value: t ? lane * 5 : lane * 7, tookBranch: t };
  },
  // Branches for lanes < 16 only: warp 0 mixed, later warps uniform
  // not-taken (1 cycle each — divergence localized to warp 0).
  lowLaneBranch: (lane, x) => {
    const t = lane < 16;
    return { value: t ? lane * 5 : lane * 7, tookBranch: t };
  },
};

/** Seeded integer inputs in [0, 300). */
function inputs(lanes, seed) {
  const rand = lcg(seed);
  const out = [];
  for (let i = 0; i < lanes; i++) out.push(Math.floor(rand() * 300));
  return [out, [out[0], out[1], out[2], out[3]]];
}

const caseList = [
  // Edge sizes: single lane, partial warps, exact warp boundaries.
  ['uniform', 1, 11], ['uniform', 15, 12], ['uniform', 16, 13],
  ['uniform', 31, 14], ['uniform', 32, 15], ['uniform', 33, 16],
  ['uniform', 47, 17], ['uniform', 64, 18], ['uniform', 96, 19],
  ['uniform', 128, 20], ['uniform', 1000, 21],
  // Mixed data-driven divergence.
  ['threshold', 1, 22], ['threshold', 16, 23], ['threshold', 32, 24],
  ['threshold', 33, 25], ['threshold', 64, 26], ['threshold', 128, 27],
  ['threshold', 1000, 28],
  // Lane-parity divergence (every warp mixed).
  ['mod2', 1, 29], ['mod2', 16, 30], ['mod2', 32, 31], ['mod2', 33, 32],
  ['mod2', 64, 33], ['mod2', 128, 34], ['mod2', 1000, 35],
  // Uniform-taken (ESM counts divergent; 2 cycles/warp).
  ['allBranch', 1, 36], ['allBranch', 16, 37], ['allBranch', 32, 38],
  ['allBranch', 33, 39], ['allBranch', 64, 40], ['allBranch', 128, 41],
  ['allBranch', 1000, 42],
  // Input-oddness divergence.
  ['oddBranch', 15, 43], ['oddBranch', 47, 44], ['oddBranch', 96, 45],
  // Divergence localized to warp 0 (lanes < 16), tail warps uniform.
  ['highLaneBranch', 32, 46], ['highLaneBranch', 64, 47],
  ['highLaneBranch', 128, 48],
  ['lowLaneBranch', 32, 49], ['lowLaneBranch', 64, 50],
  ['lowLaneBranch', 128, 51],
];

const vectors = [];
for (const [kernelName, lanes, seed] of caseList) {
  const [xs, probe] = inputs(lanes, seed);
  const r = simulateWarpKernel(lanes, KERNELS[kernelName], xs);
  vectors.push({
    name: `${kernelName}_${lanes}lanes_seed${seed}`,
    kernel: kernelName,
    lanes,
    inputs: xs,
    probe,
    results: r.results.map((v) => ({ value: v.value, tookBranch: v.tookBranch })),
    cycles: r.cycles,
    divergenceEvents: r.divergenceEvents,
    occupancy: r.occupancy,
  });
}

const fixture = {
  _provenance: 'Golden vectors captured from packages/chip-engine/src/accelerators.mjs :: simulateWarpKernel (WP-4.2); regenerate with gen_gpu_parity.mjs. Bit-exact parity target: cycles, divergenceEvents, occupancy (f64) and the per-lane results array.',
  vectors,
};

const out = path.join(here, 'gpu_parity_vectors.json');
writeFileSync(out, JSON.stringify(fixture, null, 1) + '\n');
console.log(`wrote ${vectors.length} vectors to ${out}`);
