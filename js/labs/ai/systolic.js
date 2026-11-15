// systolic.js — analytical performance model for a P×P systolic array
// computing C[M×N] = A[M×K]·B[K×N], output-stationary dataflow (TPU-style).
//
// Honesty: this is an ANALYTICAL model, not a cycle-accurate simulator.
// It excludes memory traffic, DMA overhead and DRAM bandwidth. Typical
// silicon lands within ±30% of it. Every report says so.

export function systolicModel({ M, K, N, grid = 8, clockMHz = 500, pjPerMac = 0.5 } = {}) {
  if (grid < 1 || clockMHz <= 0) throw new Error('bad systolic params');
  const P = Math.round(grid);
  const tiles = Math.ceil(M / P) * Math.ceil(N / P);
  const cyclesPerTile = K + 2 * P - 2;      // pipeline fill + drain
  const cycles = tiles * cyclesPerTile;
  const macs = 2 * M * K * N;               // multiply+accumulate counted as 1 MAC
  const peakMacsPerCycle = P * P;
  const busyMacs = tiles * K * P * P;       // MACs actually issued (padded tiles)
  const utilization = busyMacs / (cycles * peakMacsPerCycle);
  const latencyUs = cycles / clockMHz;      // cycles / (cycles per microsecond)
  const energyNJ = (busyMacs * pjPerMac) / 1000; // pJ -> nJ
  const gmacs = (macs / cycles) * clockMHz / 1000; // GMAC/s
  return {
    grid: P, tiles, cyclesPerTile, cycles, K,
    macs, peakMacsPerCycle,
    utilization, latencyUs, energyNJ, gmacs,
    assumptions: [
      'Analytical model (output-stationary systolic array).',
      'Excludes memory traffic, DMA and DRAM bandwidth.',
      'Typical silicon deviation: ±30%.',
    ],
  };
}
