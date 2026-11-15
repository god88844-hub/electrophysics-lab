// mna.js — dense linear algebra for Modified Nodal Analysis.
// Real Gaussian elimination with partial pivoting; AC analysis uses the
// standard real-embedding of complex systems (a+bi at (i,j) becomes a
// 2x2 block [[a,-b],[b,a]]), so one solver serves DC/transient/AC.

/** Solve A x = b (real, dense). Returns x; throws on singular system. */
export function solveReal(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // partial pivot
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-14) throw new Error(`Singular MNA matrix (column ${col}) — check for floating nodes/shorted sources`);
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col];
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / d;
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let c = r + 1; c < n; c++) s -= M[r][c] * x[c];
    x[r] = s / M[r][r];
  }
  return x;
}

/**
 * Build a real 2n×2n system from complex stamps.
 * addComplex(G, i, j, re, im) stamps (re + i·im) at complex position (i, j).
 */
export function makeComplexSystem(n) {
  const size = 2 * n;
  const G = Array.from({ length: size }, () => new Float64Array(size));
  const rhs = new Float64Array(size);
  return {
    G, rhs, size,
    add(i, j, re, im) {
      G[2 * i][2 * j] += re; G[2 * i][2 * j + 1] += -im;
      G[2 * i + 1][2 * j] += im; G[2 * i + 1][2 * j + 1] += re;
    },
    addRhs(i, re, im) {
      rhs[2 * i] += re; rhs[2 * i + 1] += im;
    },
    solve() {
      const A = G.map((r) => [...r]);
      return solveReal(A, [...rhs]);
    },
    /** extract complex solution for unknown k -> {re, im} */
    get(x, k) { return { re: x[2 * k], im: x[2 * k + 1] }; },
  };
}
