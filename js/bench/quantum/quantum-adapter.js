// quantum-adapter.js — spawns the Python quantum reference (Qiskit for
// qubits; independent NumPy qudit reference for d>2), speaks the JSON
// protocol, and maps index conventions.

import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_TIMEOUT_MS = 60_000;

/** bit-reverse an n-bit integer (Qiskit little-endian <-> Invention Lab q0-MSB) */
export function bitReverse(i, n) {
  let r = 0;
  for (let b = 0; b < n; b++) r = (r << 1) | ((i >> b) & 1);
  return r;
}

export async function resolvePython(explicitPath) {
  const candidates = [];
  if (explicitPath || process.env.IL_PYTHON) candidates.push(explicitPath || process.env.IL_PYTHON);
  candidates.push('python', 'python3');
  for (const exe of candidates) {
    try {
      const r = await runPython(exe, ['-c', 'import sys,json;print(json.dumps({"v":sys.version.split()[0]}))'], '{}', 15_000);
      if (r.status === 'ok') return { exe, version: JSON.parse(r.stdout).v };
    } catch { /* next */ }
  }
  return null;
}

/**
 * Run the quantum reference. circuit: { mode: 'qiskit'|'numpy', n, d, gates }.
 * Returns { status, amplitudes, engine, notes, error }.
 */
export async function runQuantumRef(pythonExe, circuit, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'il-bench-quantum-'));
  const runnerPath = path.join(dir, 'quantum-runner.py');
  const srcRunner = fileURLToPath(new URL('./quantum-runner.py', import.meta.url));
  try {
    await writeFile(runnerPath, await readFile(srcRunner, 'utf8'));
  } catch (e) {
    return { status: 'reference-failure', error: `cannot read quantum-runner.py: ${e.message}` };
  }
  const t0 = Date.now();
  const r = await runPython(pythonExe, [runnerPath], JSON.stringify({
    mode: circuit.mode,
    n: circuit.n,
    d: circuit.d ?? 2,
    gates: circuit.gates ?? [],
  }), timeoutMs);
  if (r.status !== 'ok') return r;
  let parsed;
  try {
    parsed = JSON.parse(r.stdout);
  } catch {
    return { status: 'reference-failure', error: `malformed JSON from python runner: ${r.stdout.slice(0, 160)}` };
  }
  if (parsed.error) return { status: 'reference-failure', error: parsed.error };
  return {
    status: 'ok',
    amplitudes: parsed.amplitudes,
    engine: parsed.engine,
    notes: parsed.notes || [],
    durationMs: Date.now() - t0,
  };
}

function runPython(exe, args, stdinText, timeoutMs) {
  return new Promise((resolve) => {
    let stdout = '', stderr = '', timedOut = false;
    let child;
    try {
      child = spawn(exe, args, { windowsHide: true });
    } catch (e) {
      resolve({ status: 'reference-unavailable', error: `spawn failed: ${e.message}` });
      return;
    }
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch { /* gone */ }
    }, timeoutMs);
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', (e) => {
      clearTimeout(timer);
      const missing = e.code === 'ENOENT';
      resolve({ status: missing ? 'reference-unavailable' : 'reference-failure', error: e.message });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) { resolve({ status: 'timeout', error: `python timed out after ${timeoutMs} ms` }); return; }
      if (code !== 0 && !stdout) {
        resolve({ status: 'reference-failure', error: `python exited ${code}: ${stderr.slice(0, 300)}` });
        return;
      }
      resolve({ status: 'ok', stdout, stderr, code });
    });
    child.stdin.write(stdinText);
    child.stdin.end();
  });
}

/**
 * Map Qiskit amplitudes into Invention Lab index order.
 *
 * benchmark-found defect: this USED to bit-reverse, which is wrong for our
 * gate mapping. Reasoning: the runner maps Invention Lab qudit q to Qiskit
 * qubit (n-1-q), so Invention Lab q0 sits on Qiskit's MOST significant bit.
 * Qiskit index i = Σ_k (qubit k)·2^k = Σ_q (my q_q)·2^(n-1-q) = the
 * Invention Lab index itself. The mapping is therefore the IDENTITY — the
 * bit-reversal double-counted the convention and misaligned every
 * non-symmetric state (caught by the swap-chain and QFT benchmarks).
 */
export function qiskitToIlOrder(amplitudes, n) {
  return amplitudes.map((a) => ({ re: a.re, im: a.im }));
}
