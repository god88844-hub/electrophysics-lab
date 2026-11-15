// gates.js — gate matrix library for the Quantum Lab.
// Qubit gates (d=2): H X Y Z S T PHASE RX RY RZ CNOT CZ SWAP
// Qudit gates (any d): SHIFT (X_d), FOURIER (F_d), PHASEK, SUM (mod-d adder)
// All matrices are checked unitary at application time by qudit.js.

import { c, cExpI } from './qudit.js';

const r2 = 1 / Math.SQRT2;

export const H = [[c(r2), c(r2)], [c(r2), c(-r2)]];
export const X = [[c(0), c(1)], [c(1), c(0)]];
export const Y = [[c(0), c(0, -1)], [c(0, 1), c(0)]];
export const Z = [[c(1), c(0)], [c(0), c(-1)]];
export const S = [[c(1), c(0)], [c(0), c(0, 1)]];
export const T = [[c(1), c(0)], [c(0, Math.SQRT1_2), c(0, Math.SQRT1_2)]];

export function PHASE(theta) { return [[c(1), c(0)], [c(0), cExpI(theta)]]; }
export function RX(theta) {
  const co = Math.cos(theta / 2), si = Math.sin(theta / 2);
  return [[c(co), c(0, -si)], [c(0, -si), c(co)]];
}
export function RY(theta) {
  const co = Math.cos(theta / 2), si = Math.sin(theta / 2);
  return [[c(co), c(-si)], [c(si), c(co)]];
}
export function RZ(theta) {
  return [[cExpI(-theta / 2), c(0)], [c(0), cExpI(theta / 2)]];
}

/** CNOT: basis |c t>, c = more significant within the applied pair. */
export function CNOT() {
  const U = [];
  for (let i = 0; i < 4; i++) U.push([c(0), c(0), c(0), c(0)]);
  U[0][0] = c(1); U[1][1] = c(1);
  U[2][3] = c(1); U[3][2] = c(1);
  return U;
}
export function CZ() {
  return [[c(1), c(0), c(0), c(0)], [c(0), c(1), c(0), c(0)], [c(0), c(0), c(1), c(0)], [c(0), c(0), c(0), c(-1)]];
}
export function SWAP() {
  return [[c(1), c(0), c(0), c(0)], [c(0), c(0), c(1), c(0)], [c(0), c(1), c(0), c(0)], [c(0), c(0), c(0), c(1)]];
}

// ---- generalized qudit gates ------------------------------------------------
export function SHIFT(d) { // X_d: |k> -> |(k+1) mod d>
  return Array.from({ length: d }, (_, j) =>
    Array.from({ length: d }, (_, k) => c((j === (k + 1) % d) ? 1 : 0)));
}
export function FOURIER(d) { // F_d[j][k] = ω^{jk} / √d
  const inv = 1 / Math.sqrt(d);
  return Array.from({ length: d }, (_, j) =>
    Array.from({ length: d }, (_, k) => {
      const w = cExpI((2 * Math.PI * j * k) / d);
      return c(w.re * inv, w.im * inv);
    }));
}
export function PHASEK(d, k) { // diag(1, ω^k, ω^{2k}, ...)
  return Array.from({ length: d }, (_, j) =>
    Array.from({ length: d }, (_, m) => c(j === m ? Math.cos((2 * Math.PI * k * j) / d) : 0,
                                         j === m ? Math.sin((2 * Math.PI * k * j) / d) : 0)));
}
/** SUM gate: |a b> -> |a, (a+b) mod d> (generalized CNOT for qudits).
 * Built in output-row convention (row = output basis state), matching the
 * apply1/apply2 convention new[i] = Σ_j U[i][j]·old[j]. */
export function SUM(d) {
  const D = d * d;
  return Array.from({ length: D }, (_, out) => {
    const a = Math.floor(out / d), cOut = out % d;
    const row = new Array(D).fill(0).map(() => c(0));
    const b = ((cOut - a) % d + d) % d; // input b that produces this output
    row[a * d + b] = c(1);
    return row;
  });
}
