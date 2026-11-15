// ai.test.mjs — AI Accelerator Lab numeric and performance-model tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { matmul, matmulF64, maxAbsError, conv2d, randMatrix, quantizeSym, relu, softmaxRow } from '../js/labs/ai/tensor.js';
import { systolicModel } from '../js/labs/ai/systolic.js';
import { MLP } from '../js/labs/ai/mlp.js';
import { aiLab } from '../js/labs/ai/lab.js';

test('ai: matmul f64 matches a hand-computed product', () => {
  const A = [[1, 2], [3, 4]];
  const B = [[5, 6], [7, 8]];
  const C = matmulF64(A, B);
  assert.deepEqual(C, [[19, 22], [43, 50]]);
});

test('ai: matmul f64 matches naive reference on random matrices to 1e-12', () => {
  const A = randMatrix(6, 7, { seed: 3 });
  const B = randMatrix(7, 5, { seed: 4 });
  // naive independent implementation
  const ref = [];
  for (let i = 0; i < 6; i++) {
    ref.push([]);
    for (let j = 0; j < 5; j++) {
      let s = 0;
      for (let k = 0; k < 7; k++) s += A[i][k] * B[k][j];
      ref[i].push(s);
    }
  }
  const C = matmul(A, B, { precision: 'f64' });
  assert.ok(maxAbsError(C, ref) < 1e-12);
});

test('ai: f32 mode error bounded (~1e-6 relative for small K)', () => {
  const A = randMatrix(8, 8, { seed: 5 });
  const B = randMatrix(8, 8, { seed: 6 });
  const ref = matmulF64(A, B);
  const err = maxAbsError(matmul(A, B, { precision: 'f32' }), ref);
  assert.ok(err < 1e-5, `f32 error ${err} too large`);
  assert.ok(err > 0, 'f32 rounding must actually differ from f64 somewhere');
});

test('ai: int8 mode error bounded and deterministic', () => {
  const A = randMatrix(8, 8, { seed: 5 });
  const B = randMatrix(8, 8, { seed: 6 });
  const ref = matmulF64(A, B);
  const err = maxAbsError(matmul(A, B, { precision: 'int8' }), ref);
  assert.ok(err < 0.03, `int8 error ${err} too large`);
  const err2 = maxAbsError(matmul(A, B, { precision: 'int8' }), ref);
  assert.equal(err, err2, 'deterministic: same inputs -> same error');
});

test('ai: quantizeSym scales into int8 range symmetrically', () => {
  const { scale, q } = quantizeSym([[0.5, -1.0], [0.25, 0]], 8);
  assert.equal(q[0][1], -127, 'max-magnitude element maps to -127');
  assert.equal(Math.min(...q.flat()), -127);
  assert.ok(Math.max(...q.flat()) <= 127);
  assert.ok(scale > 0);
});

test('ai: conv2d identity kernel reproduces input interior; 1x1 kernel scales', () => {
  const inp = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  const identity = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
  assert.deepEqual(conv2d(inp, identity), [[5]]);
  const scale2 = [[2]];
  assert.deepEqual(conv2d(inp, scale2), [[2, 4, 6], [8, 10, 12], [14, 16, 18]]);
  // 2x2 kernel vs manual
  const k = [[1, 0], [0, -1]];
  const out = conv2d(inp, k);
  assert.deepEqual(out, [[1 - 5, 2 - 6], [4 - 8, 5 - 9]]);
});

test('ai: relu and softmax basics', () => {
  assert.deepEqual(relu([[-1, 2]]), [[0, 2]]);
  const s = softmaxRow([1, 2, 3]);
  assert.ok(Math.abs(s.reduce((a, b) => a + b, 0) - 1) < 1e-12);
  assert.ok(s[2] > s[0]);
});

test('ai: systolic model self-consistency and sane values', () => {
  const p = systolicModel({ M: 64, K: 64, N: 64, grid: 8, clockMHz: 500 });
  assert.ok(p.cycles > 0);
  assert.ok(p.utilization > 0 && p.utilization <= 1.0000001);
  assert.ok(p.gmacs > 0);
  assert.ok(p.latencyUs > 0);
  assert.equal(p.macs, 2 * 64 * 64 * 64);
  // utilization must equal busyMacs / (cycles * P^2) exactly,
  // with busyMacs = tiles * K * P^2 (steady-state MACs per tile)
  const recomputed = (p.tiles * p.K * p.grid * p.grid) / (p.cycles * p.grid * p.grid);
  assert.ok(Math.abs(p.utilization - recomputed) < 1e-12);
});

test('ai: systolic scales — bigger array, fewer cycles for same problem', () => {
  const small = systolicModel({ M: 128, K: 128, N: 128, grid: 4 });
  const big = systolicModel({ M: 128, K: 128, N: 128, grid: 16 });
  assert.ok(big.cycles < small.cycles, 'larger array should reduce cycles');
});

test('ai: MLP learns XOR deterministically to <0.2 error', () => {
  const mlp = new MLP([2, 3, 1], { seed: 42 });
  const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const Y = [[0], [1], [1], [0]];
  mlp.train(X, Y, { epochs: 4000, lr: 1.2 });
  const preds = X.map((x) => mlp.predict(x)[0]);
  const worst = Math.max(...preds.map((p, i) => Math.abs(p - Y[i][0])));
  assert.ok(worst < 0.2, `XOR not learned, worst error ${worst}`);
  // determinism
  const mlp2 = new MLP([2, 3, 1], { seed: 42 });
  mlp2.train(X, Y, { epochs: 4000, lr: 1.2 });
  const preds2 = X.map((x) => mlp2.predict(x)[0]);
  assert.deepEqual(preds, preds2);
});

test('ai: lab.run + validate produce passing report with honest warnings', () => {
  const diagram = { name: 'ai-demo', lab: 'ai', meta: {}, blocks: [], wires: [] };
  const report = aiLab.report(diagram);
  const perf = report.checks.find((c) => c.name.startsWith('Systolic'));
  assert.equal(perf.verdict, 'pass');
  const honesty = report.checks.find((c) => c.name.includes('honesty'));
  assert.equal(honesty.verdict, 'warn'); // analytical model flagged as such
  const xor = report.checks.find((c) => c.name.includes('XOR'));
  assert.equal(xor.verdict, 'pass');
});
