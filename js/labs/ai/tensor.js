// tensor.js — numeric kernels for the AI Accelerator Lab.
// matmul supports three documented precision modes:
//   'f64'  — double precision (the reference; matches NumPy within 1e-12)
//   'f32'  — inputs and accumulation rounded to float32 (Math.fround)
//   'int8' — per-tensor symmetric quantization, int32 accumulation,
//            dequantized output (like TFLite / TPU int8 paths)
// Every mode reports its own max error against f64 — the platform never
// claims precision it does not simulate.

import { mulberry32 } from '../../core/validation.js';

export function matmulF64(A, B) {
  const M = A.length, K = A[0].length, N = B[0].length;
  const C = Array.from({ length: M }, () => new Array(N).fill(0));
  for (let i = 0; i < M; i++) {
    for (let k = 0; k < K; k++) {
      const a = A[i][k];
      if (a === 0) continue;
      const Bi = B[k];
      const Ci = C[i];
      for (let j = 0; j < N; j++) Ci[j] += a * Bi[j];
    }
  }
  return C;
}

const f32 = (x) => Math.fround(x);

/** per-tensor symmetric quantization: x_q = round(x/scale), scale = max|x|/(2^(b-1)-1) */
export function quantizeSym(x2d, bits = 8) {
  let maxAbs = 0;
  for (const row of x2d) for (const v of row) maxAbs = Math.max(maxAbs, Math.abs(v));
  const qmax = (1 << (bits - 1)) - 1;
  const scale = maxAbs === 0 ? 1 : maxAbs / qmax;
  return {
    scale,
    q: x2d.map((row) => row.map((v) => Math.round(v / scale))),
  };
}

export function matmul(A, B, { precision = 'f64', bits = 8 } = {}) {
  const M = A.length, K = A[0].length, N = B[0].length;
  if (precision === 'f64') return matmulF64(A, B);

  if (precision === 'f32') {
    const C = Array.from({ length: M }, () => new Array(N).fill(0));
    for (let i = 0; i < M; i++) {
      for (let k = 0; k < K; k++) {
        const a = f32(A[i][k]);
        const bRow = B[k];
        const Ci = C[i];
        for (let j = 0; j < N; j++) Ci[j] = f32(Ci[j] + f32(a * f32(bRow[j])));
      }
    }
    return C;
  }

  // int8
  const Aq = quantizeSym(A, bits), Bq = quantizeSym(B, bits);
  const accMax = (1 << (bits - 1)) - 1;
  const C = Array.from({ length: M }, () => new Array(N).fill(0));
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      let acc = 0;
      for (let k = 0; k < K; k++) acc += Aq.q[i][k] * Bq.q[k][j]; // int32 accumulation
      C[i][j] = acc * Aq.scale * Bq.scale;
    }
  }
  return C;
}

export function maxAbsError(C, ref) {
  let m = 0;
  for (let i = 0; i < C.length; i++) {
    for (let j = 0; j < C[0].length; j++) {
      m = Math.max(m, Math.abs(C[i][j] - ref[i][j]));
    }
  }
  return m;
}

/** direct 2-D convolution, single channel, stride 1, no padding. */
export function conv2d(input, kernel) {
  const H = input.length, W = input[0].length;
  const KH = kernel.length, KW = kernel[0].length;
  const OH = H - KH + 1, OW = W - KW + 1;
  if (OH < 1 || OW < 1) throw new Error('kernel larger than input');
  const out = Array.from({ length: OH }, () => new Array(OW).fill(0));
  for (let y = 0; y < OH; y++) {
    for (let x = 0; x < OW; x++) {
      let s = 0;
      for (let ky = 0; ky < KH; ky++) {
        for (let kx = 0; kx < KW; kx++) s += input[y + ky][x + kx] * kernel[ky][kx];
      }
      out[y][x] = s;
    }
  }
  return out;
}

export function relu(x2d) { return x2d.map((r) => r.map((v) => Math.max(0, v))); }
export function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
export function tanh(x) { return Math.tanh(x); }
export function softmaxRow(v) {
  const m = Math.max(...v);
  const ex = v.map((x) => Math.exp(x - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((x) => x / s);
}

/** deterministic random matrix for demos/tests */
export function randMatrix(rows, cols, { seed = 1, min = -1, max = 1 } = {}) {
  const rng = mulberry32(seed);
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => min + rng() * (max - min)));
}
