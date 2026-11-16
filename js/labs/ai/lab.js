// lab.js — AI Accelerator Lab registration.
// Validation policy: numerics are checked against the f64 reference with
// precision-dependent bounds, and the performance model's self-consistency
// is verified. Deterministic seeds make every claim reproducible.

import { registerLab } from '../../core/registry.js';
import { matmul, matmulF64, maxAbsError, conv2d, randMatrix } from './tensor.js';
import { systolicModel } from './systolic.js';
import { MLP } from './mlp.js';
import { makeCheck, assembleReport, mulberry32 } from '../../core/validation.js';

export const aiLab = {
  id: 'ai',
  label: 'AI Accelerator Lab',
  blurb: 'Matrix/tensor units: precision modes (f64/f32/int8), convolution, systolic-array performance & energy model, trainable MLP.',
  accent: '#b48be4',
  metaSchema: [
    { key: 'precision', label: 'MAC precision', type: 'select', options: ['f64', 'f32', 'int8'], default: 'f32' },
    { key: 'dims', label: 'Matmul dims MxKxN', type: 'text', default: '8x8x8' },
    { key: 'grid', label: 'Systolic array size', type: 'number', default: 8, noTolRequired: true },
    { key: 'clockMHz', label: 'Clock (MHz)', type: 'number', default: 500, noTolRequired: true },
    { key: 'seed', label: 'Seed', type: 'number', default: 7, noTolRequired: true },
  ],

  /**
   * Run the default AI workload: random matmul at the chosen precision,
   * systolic performance model, XOR MLP training demo.
   */
  run(diagram, opts = {}) {
    const meta = diagram.meta || {};
    const dims = String(meta.dims || '8x8x8').split('x').map((n) => parseInt(n, 10));
    const [M = 8, K = 8, N = 8] = dims;
    const seed = meta.seed ?? 7;
    const precision = meta.precision || 'f32';

    const A = randMatrix(M, K, { seed, min: -1, max: 1 });
    const B = randMatrix(K, N, { seed: seed + 1, min: -1, max: 1 });
    const ref = matmulF64(A, B);
    const C = matmul(A, B, { precision });
    const err = maxAbsError(C, ref);

    const perf = systolicModel({
      M, K, N, grid: meta.grid ?? 8, clockMHz: meta.clockMHz ?? 500,
    });

    // tiny trainable MLP on XOR (deterministic seed)
    const mlp = new MLP([2, 3, 1], { seed });
    const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const Y = [[0], [1], [1], [0]];
    mlp.train(X, Y, { epochs: opts.epochs ?? 4000, lr: 1.2 });
    const preds = X.map((x) => mlp.predict(x)[0]);

    return {
      ok: true,
      matmul: { A, B, C, ref, err, precision, dims: [M, K, N] },
      perf,
      mlp: { predictions: preds, targets: Y.map((y) => y[0]) },
    };
  },

  validate(diagram) {
    const checks = [];
    const res = this.run(diagram);
    const { err, precision, ref, C } = res.matmul;
    const refMax = Math.max(...ref.flat().map(Math.abs), 1e-12);
    const rel = err / refMax;

    // precision-dependent numeric bounds (documented, deterministic)
    const bounds = { f64: 1e-12, f32: 1e-5, int8: 0.03 };
    checks.push(makeCheck({
      name: `Numeric accuracy: ${precision} matmul vs f64 reference`,
      actual: rel, expected: 0, abs: bounds[precision] ?? 1e-4,
      note: `max abs error ${err.toExponential(3)} on |ref|max ${refMax.toFixed(3)}; bound ${bounds[precision]} (relative)`,
      evidence: { dims: res.matmul.dims, seed: diagram.meta?.seed ?? 7 },
    }));

    const p = res.perf;
    checks.push(makeCheck({
      name: 'Systolic model self-consistency: utilization ∈ (0, 1]',
      actual: p.utilization, expected: 0, abs: 1,
      verdict: p.utilization > 0 && p.utilization <= 1 ? 'pass' : 'fail',
      note: `${p.cycles} cycles, ${(p.utilization * 100).toFixed(1)}% utilization, ${p.gmacs.toFixed(2)} GMAC/s, ${p.energyNJ.toFixed(1)} nJ`,
    }));
    checks.push({
      name: 'Performance model honesty: analytical only',
      verdict: 'warn',
      stage: 'physical',
      actual: null, expected: null, tolerance: null,
      note: 'Analytical model excludes memory traffic, interconnect, caches, thermal effects and measured silicon calibration. No defensible error bound or device performance guarantee is available; this is not cycle-accurate.',
      evidence: null,
    });

    const worst = Math.max(...res.mlp.predictions.map((pred, i) => Math.abs(pred - res.mlp.targets[i])));
    checks.push(makeCheck({
      name: 'MLP learns XOR (deterministic seed)',
      actual: worst, expected: 0, abs: 0.2,
      note: `predictions [${res.mlp.predictions.map((v) => v.toFixed(2)).join(', ')}] vs targets [${res.mlp.targets.join(', ')}]`,
    }));

    return checks;
  },

  report(diagram) {
    return assembleReport({ diagram, checks: this.validate(diagram) });
  },

  matmul, matmulF64, maxAbsError, conv2d, systolicModel, MLP, randMatrix,
};

registerLab(aiLab);
