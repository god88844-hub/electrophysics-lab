/**
 * Systolic TPU (weight-stationary INT8/QDQ) + SIMT GPU + SoC architecture
 * comparison models. Cycle and utilization math follows
 * 05_chip_architecture_benchmarks.json: cycles = ceil(M/P)·ceil(N/P)·(K + 2P − 2)
 * for a P×P tile; per-tile dynamic power P = α·C·V²·f.
 */

/** Weight-stationary systolic matmul with real INT8 arithmetic + cycle model. */
export function systolicMatmul(A, B, opts = {}) {
  const M = A.length;
  const K = A[0].length;
  const N = B[0].length;
  const P = opts.gridSize ?? 8;
  const clockMHz = opts.clockMHz ?? 100;
  const vdd = opts.vdd ?? 0.8;
  const alpha = opts.activityFactor ?? 0.35;
  const capPerMacFf = opts.capPerMacFf ?? 1.2e-13; // F — order-of-magnitude MAC switch cap

  // Quantize to INT8 (QDQ semantics: quantize → int8 math → dequantize).
  const clamp8 = (v) => Math.max(-127, Math.min(127, Math.round(v)));
  const qA = A.map((row) => row.map(clamp8));
  const qB = B.map((row) => row.map(clamp8));

  // Exact INT8×INT8 → INT32 accumulation (saturating at INT32 bounds per the
  // 05-JSON accumulator note; K ≤ 33038 never saturates for these inputs).
  const C = Array.from({ length: M }, () => new Array(N).fill(0));
  const tileOverflow = [];
  let macOps = 0;
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      let acc = 0;
      for (let k = 0; k < K; k++) {
        acc += qA[i][k] * qB[k][j];
        macOps++;
        if (acc > 2147483647 || acc < -2147483648) {
          tileOverflow.push([i, j, k]);
          acc = Math.max(-2147483648, Math.min(2147483647, acc));
        }
      }
      C[i][j] = acc;
    }
  }
  const tiles = Math.ceil(M / P) * Math.ceil(N / P);
  const cycles = tiles * (K + 2 * P - 2);
  const utilization = (M * N * K) / (tiles * (K + 2 * P - 2) * P * P);
  // Dynamic power: α·C·V²·f per switching MAC event, spread over the array.
  const dynamicPowerW = alpha * capPerMacFf * vdd * vdd * (clockMHz * 1e6) * P * P;
  return {
    C,
    cycles,
    utilization,
    macOps,
    tiles,
    dynamicPowerW,
    tileOverflow,
    peakTilePowerW: dynamicPowerW,
  };
}

/**
 * SIMT warp execution with divergence tracking. Kernel fn receives (lane,
 * laneData) and may return {value, tookBranch} — divergent lanes serialize
 * (2× cycle cost for the divergent portion, the classic SIMT model).
 */
export function simulateWarpKernel(lanes, kernel, inputs) {
  let cycles = 0;
  const results = [];
  let divergenceEvents = 0;
  for (let warp = 0; warp < Math.ceil(lanes / 32); warp++) {
    const laneResults = [];
    let diverged = false;
    for (let l = 0; l < 32 && warp * 32 + l < lanes; l++) {
      const laneId = warp * 32 + l;
      const r = kernel(laneId, inputs?.[laneId]);
      laneResults.push(r);
      if (r && r.tookBranch) diverged = true;
    }
    cycles += diverged ? 2 : 1; // divergent warps run both paths
    if (diverged) divergenceEvents++;
    results.push(...laneResults);
  }
  return { results, cycles, divergenceEvents, occupancy: lanes / Math.ceil(lanes / 32) / 32 };
}

/**
 * Unified-memory vs discrete PCIe comparison + binary INT8 vs Q4 NPU swap.
 * All figures are computed from the workload, transparently badged
 * SIMULATED_ARCHITECTURAL_MODEL by the caller.
 */
export function compareArchitectures(workload, opts = {}) {
  const { M = 64, N = 64, K = 64 } = workload;
  const P = opts.gridSize ?? 8;
  const clockMHz = opts.clockMHz ?? 700;
  const vdd = opts.vdd ?? 0.8;
  const pcieGBps = opts.pcieGBps ?? 32; // PCIe 4.0 x16 ≈ 32 GB/s
  const lpddrGBps = opts.lpddrGBps ?? 68; // 05 JSON: Intel Iris Xe LPDDR5
  const hbmGBps = opts.hbmGBps ?? 600; // 05 JSON: TPU v1 HBM

  // Bytes moved per inference: weights K×N INT8 + activations M×K + outputs M×N.
  const weightBytes = K * N;
  const actBytes = M * K;
  const outBytes = M * N;

  // Systolic compute cycles (weight-stationary: weights loaded once per tile).
  const tiles = Math.ceil(M / P) * Math.ceil(N / P);
  const computeCycles = tiles * (K + 2 * P - 2);

  function evaluate({ memoryGBps, zeroCopy, radix }) {
    const bytesPerElement = radix === 'q4' ? 0.5 : 1; // Q4 packs 2 digits/byte
    const weightsMoved = zeroCopy ? 0 : weightBytes * bytesPerElement; // unified: no host copy
    const actsMoved = actBytes * bytesPerElement;
    const outMoved = outBytes * bytesPerElement;
    const bytesOnBus = weightsMoved + actsMoved + outMoved;
    const bytesPerCycle = (memoryGBps * 1e9) / (clockMHz * 1e6); // bus width × clock
    const dmaCycles = bytesOnBus / bytesPerCycle;
    // Q4 dequant overhead: one extra cycle per output tile row pass.
    const dequantCycles = radix === 'q4' ? Math.ceil(M / P) * Math.ceil(N / P) * P : 0;
    const totalCycles = computeCycles + Math.ceil(dmaCycles) + dequantCycles;
    const bandwidthGBps = bytesOnBus / (totalCycles / clockMHz / 1e6) / 1e9;
    const energyPerOpPJ = ((alphaEnergy(radix) * vdd * vdd) * 1e12); // pJ per MAC-ish op
    const ops = M * N * K;
    const dynamicPowerW = (ops * energyPerOpPJ * 1e-12) / (totalCycles / clockMHz / 1e6);
    // Hotspot: share of compute power into one tile thermal resistance (0.8 K/W).
    const hotspotC = 45 + dynamicPowerW * 0.8 * 10;
    return {
      architecture: zeroCopy ? 'unified-memory' : 'discrete-pcie',
      radix,
      totalCycles,
      bandwidthGBps,
      energyPerOpPJ,
      dynamicPowerW,
      hotspotC,
      bytesOnBus,
    };
  }
  const alphaEnergy = (radix) => (radix === 'q4' ? 0.9 : 1.2); // relative switching energy factor

  const discreteInt8 = evaluate({ memoryGBps: pcieGBps, zeroCopy: false, radix: 'int8' });
  const discreteQ4 = evaluate({ memoryGBps: pcieGBps, zeroCopy: false, radix: 'q4' });
  const unifiedInt8 = evaluate({ memoryGBps: lpddrGBps, zeroCopy: true, radix: 'int8' });
  const unifiedQ4 = evaluate({ memoryGBps: lpddrGBps, zeroCopy: true, radix: 'q4' });
  return {
    discreteInt8,
    discreteQ4,
    unifiedInt8,
    unifiedQ4,
    delta: {
      cycleReductionPct: ((discreteInt8.totalCycles - unifiedInt8.totalCycles) / discreteInt8.totalCycles) * 100,
      energyReductionPct: ((discreteInt8.energyPerOpPJ - unifiedInt8.energyPerOpPJ) / discreteInt8.energyPerOpPJ) * 100,
      q4BandwidthGainPct: ((unifiedQ4.bandwidthGBps - unifiedInt8.bandwidthGBps) / unifiedInt8.bandwidthGBps) * 100,
    },
    badge: 'SIMULATED_ARCHITECTURAL_MODEL',
  };
}
