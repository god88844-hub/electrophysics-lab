// components.js — Quantum Lab component library (canvas blocks).
// Gate blocks sit on qubit wires (WIRE blocks mark the qubit lines); the
// lab engine extracts the circuit by walking each wire left-to-right.

import { registerComponent } from '../../core/registry.js';
import * as G from './gates.js';

const qport = (dir, id, name) => ({ id, name, dir, type: 'quantum' });

function gate1(typeId, label, sym, makeU, desc, extraParams = [], { dOnly = 2 } = {}) {
  return {
    typeId, lab: 'quantum', category: 'Gates', label, desc,
    params: [...extraParams],
    ports: () => [qport('in', 'qin', 'in'), qport('out', 'qout', 'out')],
    quantum: {
      kind: typeId.replace('quantum.', '').toLowerCase(), arity: 1,
      matrix: (p, d) => {
        if (d !== dOnly) throw new Error(`Qubit gate requires qudit dimension d=${dOnly} (diagram uses d=${d})`);
        return makeU(p);
      },
    },
    draw: sym,
    passThrough: { qin: 'qout' },
    validation: { provenance: 'Exact unitary matrix applied to a pure state vector. No decoherence/noise modeled (stated openly); use the noise fields of real hardware data for error budgets.' },
  };
}

const defs = [
  {
    typeId: 'quantum.WIRE', lab: 'quantum', category: 'I/O', label: 'Qubit wire',
    desc: 'Declares a qudit line. Order (top to bottom) = qudit index. Initial state |0>.',
    params: [{ key: 'name', label: 'Label', type: 'text', default: 'q' }],
    ports: () => [qport('out', 'out', 'out')],
    quantum: { kind: 'wire', arity: 0 },
    draw: '—',
    validation: { provenance: 'Ideal qubit line initialized to |0>.' },
  },
  {
    typeId: 'quantum.MEASURE', lab: 'quantum', category: 'I/O', label: 'Measure',
    desc: 'Terminal measurement on a wire (all wires are measured at the end of the run regardless).',
    params: [],
    ports: () => [qport('in', 'in', 'in')],
    quantum: { kind: 'measure', arity: 0 },
    draw: 'M',
    validation: { provenance: 'Projective measurement in the computational basis.' },
  },
  gate1('quantum.H', 'Hadamard', 'H', () => G.H, 'Hadamard: |0>→|+>, |1>→|−>. Qubit gate (d=2).'),
  gate1('quantum.X', 'Pauli X', 'X', () => G.X, 'Bit flip. Qubit gate (d=2).'),
  gate1('quantum.Y', 'Pauli Y', 'Y', () => G.Y, 'Bit+phase flip. Qubit gate (d=2).'),
  gate1('quantum.Z', 'Pauli Z', 'Z', () => G.Z, 'Phase flip. Qubit gate (d=2).'),
  gate1('quantum.S', 'S (phase)', 'S', () => G.S, 'Phase gate diag(1, i).'),
  gate1('quantum.T', 'T (π/8)', 'T', () => G.T, 'T gate diag(1, e^{iπ/4}).'),
  gate1('quantum.PHASE', 'Phase(θ)', 'Pθ',
    (p) => G.PHASE(p.theta), 'Arbitrary phase rotation diag(1, e^{iθ}).',
    [{ key: 'theta', label: 'θ (radians)', type: 'number', default: Math.PI / 4, noTolRequired: true }]),
  gate1('quantum.RX', 'Rx(θ)', 'Rx',
    (p) => G.RX(p.theta), 'X-axis rotation.',
    [{ key: 'theta', label: 'θ (radians)', type: 'number', default: Math.PI / 2, noTolRequired: true }]),
  gate1('quantum.RY', 'Ry(θ)', 'Ry',
    (p) => G.RY(p.theta), 'Y-axis rotation.',
    [{ key: 'theta', label: 'θ (radians)', type: 'number', default: Math.PI / 2, noTolRequired: true }]),
  gate1('quantum.RZ', 'Rz(θ)', 'Rz',
    (p) => G.RZ(p.theta), 'Z-axis rotation.',
    [{ key: 'theta', label: 'θ (radians)', type: 'number', default: Math.PI / 2, noTolRequired: true }]),

  {
    typeId: 'quantum.CNOT', lab: 'quantum', category: 'Gates', label: 'CNOT',
    desc: 'Controlled-NOT on two qubit wires.',
    params: [],
    ports: () => [qport('in', 'cin', 'ctrl'), qport('out', 'cout', 'ctrl'),
                  qport('in', 'tin', 'target'), qport('out', 'tout', 'target')],
    quantum: { kind: 'cnot', arity: 2, matrix: () => G.CNOT() },
    draw: '⊕',
    passThrough: { cin: 'cout', tin: 'tout' },
    validation: { provenance: 'Exact 4×4 unitary on the control/target pair.' },
  },
  {
    typeId: 'quantum.CZ', lab: 'quantum', category: 'Gates', label: 'CZ',
    desc: 'Controlled-Z on two qubit wires.',
    params: [],
    ports: () => [qport('in', 'cin', 'ctrl'), qport('out', 'cout', 'ctrl'),
                  qport('in', 'tin', 'target'), qport('out', 'tout', 'target')],
    quantum: { kind: 'cz', arity: 2, matrix: () => G.CZ() },
    draw: 'Z⊕',
    passThrough: { cin: 'cout', tin: 'tout' },
    validation: { provenance: 'Exact 4×4 unitary.' },
  },
  {
    typeId: 'quantum.SWAP', lab: 'quantum', category: 'Gates', label: 'SWAP',
    desc: 'Exchanges the states of two wires.',
    params: [],
    ports: () => [qport('in', 'ain', 'a'), qport('out', 'aout', 'a'),
                  qport('in', 'bin', 'b'), qport('out', 'bout', 'b')],
    quantum: { kind: 'swap', arity: 2, matrix: () => G.SWAP() },
    draw: '×',
    passThrough: { ain: 'aout', bin: 'bout' },
    validation: { provenance: 'Exact 4×4 unitary.' },
  },

  // ---- qudit (d=3/4) gates --------------------------------------------------
  {
    typeId: 'quantum.SHIFT', lab: 'quantum', category: 'Qudit gates', label: 'Shift X_d',
    desc: 'Generalized X: |k> → |(k+1) mod d>. Any dimension.',
    params: [],
    ports: () => [qport('in', 'qin', 'in'), qport('out', 'qout', 'out')],
    quantum: { kind: 'shift', arity: 1, matrix: (p, d) => G.SHIFT(d) },
    draw: 'X_d',
    passThrough: { qin: 'qout' },
    validation: { provenance: 'Exact d×d cyclic shift unitary.' },
  },
  {
    typeId: 'quantum.FOURIER', lab: 'quantum', category: 'Qudit gates', label: 'Fourier F_d',
    desc: 'Quantum Fourier transform over Z_d: F[j][k] = ω^{jk}/√d. Any dimension.',
    params: [],
    ports: () => [qport('in', 'qin', 'in'), qport('out', 'qout', 'out')],
    quantum: { kind: 'fourier', arity: 1, matrix: (p, d) => G.FOURIER(d) },
    draw: 'F_d',
    passThrough: { qin: 'qout' },
    validation: { provenance: 'Exact discrete Fourier unitary; unitarity checked at apply time.' },
  },
  {
    typeId: 'quantum.PHASEK', lab: 'quantum', category: 'Qudit gates', label: 'Phase_k',
    desc: 'Qudit phase gate diag(1, ω^k, ω^{2k}, ...), ω = e^{2πi/d}.',
    params: [{ key: 'k', label: 'k', type: 'number', default: 1, noTolRequired: true }],
    ports: () => [qport('in', 'qin', 'in'), qport('out', 'qout', 'out')],
    quantum: { kind: 'phasek', arity: 1, matrix: (p, d) => G.PHASEK(d, p.k) },
    draw: 'P_k',
    passThrough: { qin: 'qout' },
    validation: { provenance: 'Exact diagonal unitary.' },
  },
  {
    typeId: 'quantum.SUM', lab: 'quantum', category: 'Qudit gates', label: 'SUM (mod d)',
    desc: 'Qudit adder: |a b> → |a, (a+b) mod d>. Generalized CNOT. Any dimension.',
    params: [],
    ports: () => [qport('in', 'ain', 'a'), qport('out', 'aout', 'a'),
                  qport('in', 'bin', 'b'), qport('out', 'bout', 'b')],
    quantum: { kind: 'sum', arity: 2, matrix: (p, d) => G.SUM(d) },
    draw: '+',
    passThrough: { ain: 'aout', bin: 'bout' },
    validation: { provenance: 'Exact d²×d² permutation unitary.' },
  },
];

for (const d of defs) registerComponent(d);
