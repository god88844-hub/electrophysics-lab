/**
 * WP-4.6 shared oracle-harness primitives (pure functions — unit-tested by
 * tests/wp46-chip-oracles.test.mjs).
 *
 * Oracle contract (03_PHYSICS_MATH_FUNDAMENTALS.md §5):
 *  - RV32IM execution → QEMU user-mode: register/memory state **bit-exact**.
 *  - ONNX INT8/QDQ inference → ONNX Runtime CPU: logits **±1e-5 relative**.
 *
 * Skip discipline (PHASE_04 failure modes): a missing oracle tool produces a
 * LOUD, printed skip verdict — locally it exits 0 with the skip on stderr AND
 * stdout; under `--require-live` (the CI mode) a missing tool is a hard
 * failure. A skip never mutates any evidence and never reads as a pass.
 */

import { execFileSync } from 'node:child_process';

export const DUMP_FORMAT = 'invention-lab/wp46-oracle-dump/1';
export const RELATIVE_TOLERANCE = 1e-5;

/** Parse little-endian u32 words from raw bytes. */
export function leWordsFromBytes(bytes) {
  const words = [];
  for (let offset = 0; offset + 4 <= bytes.length; offset += 4) {
    words.push(
      (bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)) >>> 0
    );
  }
  return words;
}

/** Bit-exact sequence comparison with the first mismatch for diagnostics. */
export function compareWordSequences(actual, expected) {
  if (actual.length !== expected.length) {
    return { equal: false, reason: `length ${actual.length} != ${expected.length}` };
  }
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      return { equal: false, reason: `word ${i}: ${actual[i]} != ${expected[i]}` };
    }
  }
  return { equal: true, reason: null };
}

/**
 * §5 relative tolerance: |actual − expected| ≤ tol·|expected|.
 * An exact-zero reference demands an exact-zero actual (the tolerance is
 * relative, never an absolute blanket).
 */
export function withinRelativeTolerance(actual, expected, tol = RELATIVE_TOLERANCE) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  const scale = Math.abs(expected);
  const bound = tol * Math.max(scale, 1e-30);
  return Math.abs(actual - expected) <= bound;
}

/** Max relative error over two equal-length float arrays (for verdicts). */
export function maxRelativeError(actual, expected) {
  if (actual.length !== expected.length) return Number.POSITIVE_INFINITY;
  let max = 0;
  for (let i = 0; i < expected.length; i++) {
    const scale = Math.max(Math.abs(expected[i]), 1e-30);
    const rel = Math.abs(actual[i] - expected[i]) / scale;
    if (rel > max) max = rel;
  }
  return max;
}

/** Structural validation of the example's dump protocol (fail-closed). */
export function assertDumpProtocol(dump) {
  const errors = [];
  if (!dump || typeof dump !== 'object') return ['dump is not an object'];
  if (dump.format !== DUMP_FORMAT) errors.push(`format must be ${DUMP_FORMAT}`);
  if (dump.provenance !== 'SIMULATED_ARCHITECTURAL_MODEL') {
    errors.push('dump must carry the SIMULATED_ARCHITECTURAL_MODEL provenance');
  }
  const rv = dump.rv32;
  if (!rv || typeof rv !== 'object') errors.push('missing rv32 section');
  else {
    if (!Array.isArray(rv.program?.words) || rv.program.words.length === 0) {
      errors.push('rv32.program.words missing/empty');
    }
    if (typeof rv.elfBase64 !== 'string' || rv.elfBase64.length === 0) {
      errors.push('rv32.elfBase64 missing');
    }
    if (!Array.isArray(rv.frozenExpectedWords) || rv.frozenExpectedWords.length === 0) {
      errors.push('rv32.frozenExpectedWords missing/empty');
    }
    if (!Array.isArray(rv.rustResultWords)) errors.push('rv32.rustResultWords missing');
    if (rv.stopReason !== 'ecall') errors.push(`rv32.stopReason must be "ecall", got ${JSON.stringify(rv.stopReason)}`);
  }
  const tp = dump.tpu;
  if (!tp || typeof tp !== 'object') errors.push('missing tpu section');
  else {
    const { m, k, n } = tp.workload ?? {};
    if (!m || !k || !n) errors.push('tpu.workload m/k/n missing');
    else {
      if (!Array.isArray(tp.qA) || tp.qA.length !== m * k) errors.push('tpu.qA length != M·K');
      if (!Array.isArray(tp.qB) || tp.qB.length !== k * n) errors.push('tpu.qB length != K·N');
      if (!Array.isArray(tp.cI32) || tp.cI32.length !== m * n) errors.push('tpu.cI32 length != M·N');
      if (!Array.isArray(tp.cDequant) || tp.cDequant.length !== m * n) errors.push('tpu.cDequant length != M·N');
      const sa = tp.workload?.scales?.aPerRow;
      const sb = tp.workload?.scales?.bPerCol;
      if (!Array.isArray(sa) || sa.length !== m) errors.push('scales.aPerRow length != M');
      if (!Array.isArray(sb) || sb.length !== n) errors.push('scales.bPerCol length != N');
    }
    if (tp.badge !== 'SIMULATED_ARCHITECTURAL_MODEL') errors.push('tpu badge missing');
  }
  return errors;
}

/** Decode base64 (node Buffer). */
export function decodeBase64(b64) {
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

/** Cross-platform PATH probe for an oracle tool. */
export function toolOnPath(tool) {
  try {
    const output = execFileSync(process.platform === 'win32' ? 'where' : 'which', [tool], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.toString().trim().length > 0;
  } catch {
    return false;
  }
}

/** Loud skip verdict — printed on BOTH channels so it can never be missed. */
export function printSkipVerdict(kind, reason) {
  const verdict = {
    oracle: kind,
    skipped: true,
    pass: false,
    reason,
    discipline: 'loud skip — a skip is never a silent pass (PHASE_04 failure modes)',
  };
  const line = `WP46-${kind.toUpperCase()}-ORACLE-SKIP: ${reason}`;
  console.error(line);
  console.log(JSON.stringify(verdict));
  return verdict;
}
