#!/usr/bin/env python3
# quantum-runner.py — independent quantum reference execution for benchmarks.
#
# Two modes (chosen by the "mode" field of the stdin JSON):
#   "qiskit" — real Qiskit statevector simulation (qubit circuits).
#              Qiskit's little-endian convention (qubit 0 = least significant
#              bit) is handled by the JS adapter via index bit-reversal.
#   "numpy"  — an INDEPENDENTLY IMPLEMENTED NumPy qudit reference. Gate
#              matrices are written fresh here (not copied from Invention
#              Lab); application uses tensordot on a [d]*n tensor whose
#              axis 0 is qudit q0 (most significant) — the same documented
#              basis order as Invention Lab, implemented independently.
#
# Output (stdout): JSON { engine, version, amplitudes: [{re, im}], notes }
# Output conventions match Invention Lab: index j of amplitudes corresponds
# to digit string q0 q1 ... q_{n-1} (q0 most significant).
#
# This program NEVER receives Invention Lab numbers — it computes the
# reference result from the gate list alone.

import json
import sys

import numpy as np  # module level: the gate-matrix helpers reference np

def main():
    spec = json.load(sys.stdin)
    mode = spec.get("mode", "numpy")
    n = spec["n"]
    d = spec.get("d", 2)
    gates = spec.get("gates", [])

    if mode == "qiskit":
        run_qiskit(spec, n, d, gates)
    elif mode == "numpy":
        run_numpy(spec, n, d, gates)
    else:
        json.dump({"error": f"unknown mode {mode}"}, sys.stdout)
        sys.exit(2)

# ---------------------------------------------------------------- qiskit ----
def run_qiskit(spec, n, d, gates):
    import qiskit
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector

    if d != 2:
        json.dump({"error": "qiskit mode supports d=2 (qubits) only; use numpy mode for qudits"}, sys.stdout)
        sys.exit(2)

    qc = QuantumCircuit(n)
    # Invention Lab convention: q0 is the MOST significant digit.
    # Qiskit convention: qubit 0 is the LEAST significant bit.
    # Mapping: Invention Lab qudit q  ->  Qiskit qubit (n - 1 - q)
    def qk(q):
        return n - 1 - q

    for g in gates:
        kind = g["kind"].lower()
        qs = [qk(q) for q in g["qubits"]]
        p = g.get("params", {})
        if kind == "h": qc.h(qs[0])
        elif kind == "x": qc.x(qs[0])
        elif kind == "y": qc.y(qs[0])
        elif kind == "z": qc.z(qs[0])
        elif kind == "s": qc.s(qs[0])
        elif kind == "t": qc.t(qs[0])
        elif kind == "phase": qc.p(p["theta"], qs[0])
        elif kind == "rx": qc.rx(p["theta"], qs[0])
        elif kind == "ry": qc.ry(p["theta"], qs[0])
        elif kind == "rz": qc.rz(p["theta"], qs[0])
        elif kind == "cnot": qc.cx(qs[0], qs[1])
        elif kind == "cz": qc.cz(qs[0], qs[1])
        elif kind == "swap": qc.swap(qs[0], qs[1])
        elif kind == "cp": qc.cp(p["theta"], qs[0], qs[1])
        else:
            json.dump({"error": f"qiskit runner: unsupported gate kind {kind}"}, sys.stdout)
            sys.exit(2)

    sv = Statevector.from_instruction(qc)
    out = {
        "engine": f"qiskit {qiskit.__version__}",
        "amplitudes": [{"re": float(a.real), "im": float(a.imag)} for a in sv.data],
        "notes": ["Qiskit Statevector; little-endian (qubit 0 = LSB) — JS adapter bit-reverses to Invention Lab order."],
    }
    json.dump(out, sys.stdout)

# ----------------------------------------------------------------- numpy ----
# Gate matrices implemented FRESH for this reference (independent of the
# Invention Lab implementation, which this benchmarks).
def mat_h(): return (1 / 2**0.5) * np.array([[1, 1], [1, -1]], dtype=complex)
def mat_x(): return np.array([[0, 1], [1, 0]], dtype=complex)
def mat_y(): return np.array([[0, -1j], [1j, 0]], dtype=complex)
def mat_z(): return np.diag([1, -1]).astype(complex)
def mat_s(): return np.diag([1, 1j]).astype(complex)
def mat_t(): return np.diag([1, np.exp(1j * np.pi / 4)]).astype(complex)
def mat_phase(theta): return np.diag([1, np.exp(1j * theta)]).astype(complex)
def mat_rx(theta): return np.array([[np.cos(theta/2), -1j*np.sin(theta/2)], [-1j*np.sin(theta/2), np.cos(theta/2)]], dtype=complex)
def mat_ry(theta): return np.array([[np.cos(theta/2), -np.sin(theta/2)], [np.sin(theta/2), np.cos(theta/2)]], dtype=complex)
def mat_rz(theta): return np.diag([np.exp(-1j*theta/2), np.exp(1j*theta/2)]).astype(complex)
def mat_cnot(): u = np.eye(4, dtype=complex); u[[2, 3]] = u[[3, 2]]; return u
def mat_cz(): return np.diag([1, 1, 1, -1]).astype(complex)
def mat_swap(): u = np.eye(4, dtype=complex); u[[1, 2]] = u[[2, 1]]; return u
def mat_cp(theta):
    u = np.eye(4, dtype=complex); u[3, 3] = np.exp(1j * theta); return u
def mat_shift(d):  # |k> -> |(k+1) mod d>
    u = np.zeros((d, d), dtype=complex)
    for k in range(d):
        u[(k + 1) % d, k] = 1
    return u
def mat_fourier(d):
    j, k = np.meshgrid(np.arange(d), np.arange(d), indexing="ij")
    return np.exp(2j * np.pi * j * k / d) / np.sqrt(d)
def mat_phasek(d, k):
    return np.diag([np.exp(2j * np.pi * k * m / d) for m in range(d)]).astype(complex)
def mat_sum(d):  # |a b> -> |a, (a+b) mod d>
    D = d * d
    u = np.zeros((D, D), dtype=complex)
    for a in range(d):
        for b in range(d):
            src = a * d + b
            dst = a * d + (a + b) % d
            u[dst, src] = 1
    return u

def apply1(psi, q, U, n, d):
    # axis 0 of psi.reshape([d]*n) is qudit q0 (most significant)
    t = psi.reshape([d] * n)
    t = np.tensordot(U, t, axes=(1, q))
    t = np.moveaxis(t, 0, q)
    return t.reshape(-1)

def apply2(psi, q1, q2, U, n, d):
    # U rows/cols indexed a*d+b where a acts on q1, b on q2 (q1 more significant)
    if q1 > q2:
        raise ValueError("apply2 requires q1 < q2")
    t = psi.reshape([d] * n)
    t = np.moveaxis(t, [q1, q2], [0, 1])
    t = t.reshape(d * d, -1)
    t = U @ t
    t = t.reshape([d] * n)
    t = np.moveaxis(t, [0, 1], [q1, q2])
    return t.reshape(-1)

def run_numpy(spec, n, d, gates):
    import numpy as np
    psi = np.zeros(d ** n, dtype=complex)
    psi[0] = 1.0
    notes = ["Independent NumPy qudit reference: fresh matrix definitions, tensordot application, axis 0 = q0."]
    used_full_diag = False
    for g in gates:
        kind = g["kind"].lower()
        qs = g["qubits"]
        p = g.get("params", {})
        if kind in ("h",): U = mat_h()
        elif kind == "x": U = mat_x()
        elif kind == "y": U = mat_y()
        elif kind == "z": U = mat_z()
        elif kind == "s": U = mat_s()
        elif kind == "t": U = mat_t()
        elif kind == "phase": U = mat_phase(p["theta"])
        elif kind == "rx": U = mat_rx(p["theta"])
        elif kind == "ry": U = mat_ry(p["theta"])
        elif kind == "rz": U = mat_rz(p["theta"])
        elif kind == "cnot": U = mat_cnot()
        elif kind == "cz": U = mat_cz()
        elif kind == "swap": U = mat_swap()
        elif kind == "cp": U = mat_cp(p["theta"])
        elif kind == "shift": U = mat_shift(d)
        elif kind == "fourier": U = mat_fourier(d)
        elif kind == "phasek": U = mat_phasek(d, p["k"])
        elif kind == "sum": U = mat_sum(d)
        else:
            json.dump({"error": f"numpy runner: unsupported gate kind {kind}"}, sys.stdout)
            sys.exit(2)
        if len(qs) == 1:
            psi = apply1(psi, qs[0], U, n, d)
        elif len(qs) == 2:
            lo, hi = min(qs), max(qs)
            if lo == hi:
                json.dump({"error": "two-qudit gate needs two distinct qudits"}, sys.stdout)
                sys.exit(2)
            if kind in ("swap", "sum"):
                # symmetric-style gates: row convention is (lower digit acts on
                # the more significant axis). For swap the matrix is symmetric
                # in (a,b) so ordering is irrelevant; for sum the row index
                # a*d+b requires q1 = the control/first qudit = the SMALLER
                # index to match apply2's (q1, q2) = (lo, hi) requirement.
                psi = apply2(psi, lo, hi, U, n, d)
            else:
                psi = apply2(psi, lo, hi, U, n, d)
        else:
            json.dump({"error": f"gate {kind} has unsupported arity {len(qs)}"}, sys.stdout)
            sys.exit(2)
    out = {
        "engine": f"numpy {np.__version__} (independent qudit reference)",
        "amplitudes": [{"re": float(a.real), "im": float(a.imag)} for a in psi],
        "notes": notes,
    }
    json.dump(out, sys.stdout)
    # TEST-ONLY hook: lets the JS adapter regression suite verify that a
    # nonzero exit after plausible output is classified as a reference
    # failure. Never triggered by real benchmarks.
    if spec.get("sabotage") == "exit-nonzero":
        sys.exit(1)

if __name__ == "__main__":
    main()
