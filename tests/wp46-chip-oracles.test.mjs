// WP-4.6 — QEMU + ONNX Runtime CI oracle harnesses: unit tests.
//
// These tests run in the pure-Node CI suite (`npm test`) and enforce the
// WP-4.6 oracle-infrastructure contracts WITHOUT requiring QEMU/Python ORT:
//   1. the harness modules' pure logic (LE word parsing, bit-exact sequence
//      comparison, the §5 ±1e-5 relative tolerance semantics, dump-protocol
//      validation),
//   2. the loud-skip / `--require-live` exit contract (a skip is NEVER a
//      silent pass; CI fails closed),
//   3. the workflow file runs BOTH live oracles with `--require-live`,
//      installs qemu-user and the pinned ONNX Runtime, and keeps generated
//      evidence outside the working tree (Phase 30/39 clean-tree discipline),
//   4. the read-only example + harness scripts exist and parse
//      (node syntax check; python compile check when python3 is available —
//      absent python3 SKIPs loudly, mirroring the oracle discipline).

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import {
  DUMP_FORMAT,
  RELATIVE_TOLERANCE,
  assertDumpProtocol,
  compareWordSequences,
  leWordsFromBytes,
  maxRelativeError,
  toolOnPath,
  withinRelativeTolerance,
} from '../scripts/v4-oracles/oracle-lib.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HARNESS_DIR = join(ROOT, 'scripts', 'v4-oracles');

// ---------------------------------------------------------------------------
// 1. Pure oracle logic
// ---------------------------------------------------------------------------

test('WP-4.6: LE word parsing is bit-exact incl. the INT32 edge words', () => {
  const bytes = new Uint8Array(48);
  const expected = [77, 0, 2147483648, 2147483647, 2147483648, 0, 0, 2147483648, 4294967295, 4294967295, 2147483648, 2147483648];
  for (let i = 0; i < expected.length; i++) {
    const v = expected[i] >>> 0;
    bytes[i * 4] = v & 0xff;
    bytes[i * 4 + 1] = (v >>> 8) & 0xff;
    bytes[i * 4 + 2] = (v >>> 16) & 0xff;
    bytes[i * 4 + 3] = (v >>> 24) & 0xff;
  }
  assert.deepEqual(leWordsFromBytes(bytes), expected);
  // A truncated stream yields no partial word (exact 4-byte granularity).
  assert.equal(leWordsFromBytes(bytes.slice(0, 47)).length, 11);
});

test('WP-4.6: sequence comparison reports the first mismatch, not a shrug', () => {
  assert.deepEqual(compareWordSequences([1, 2, 3], [1, 2, 3]), { equal: true, reason: null });
  const cmp = compareWordSequences([1, 2, 4], [1, 2, 3]);
  assert.equal(cmp.equal, false);
  assert.match(cmp.reason, /word 2: 4 != 3/);
  assert.equal(compareWordSequences([1, 2], [1, 2, 3]).equal, false);
});

test('WP-4.6: §5 relative tolerance — ±1e-5 inclusive, zero reference demands zero', () => {
  assert.equal(RELATIVE_TOLERANCE, 1e-5, '§5 ONNX row tolerance');
  assert.equal(withinRelativeTolerance(1.0 + 0.5e-5, 1.0), true, 'inside the band');
  assert.equal(withinRelativeTolerance(1.0 + 2.0e-5, 1.0), false, 'outside the band');
  // The bound is inclusive by construction (≤); binary FP cannot represent an
  // "exactly at the edge" decimal case, so the inclusive semantics are
  // asserted with a band-free quantity instead.
  assert.equal(withinRelativeTolerance(1.0 + 1e-5, 1.0 + 1e-5), true, 'identical values always pass');
  assert.equal(withinRelativeTolerance(1e-7, 0.0), false, 'non-zero vs exact-zero reference is a violation');
  assert.equal(withinRelativeTolerance(0.0, 0.0), true);
  assert.equal(withinRelativeTolerance(Number.NaN, 1.0), false, 'NaN never passes');
  assert.equal(withinRelativeTolerance(1.0, Number.POSITIVE_INFINITY), false);
});

test('WP-4.6: max relative error tracks the worst element', () => {
  const err = maxRelativeError([1.0, 2.0, 3.0 + 3e-5], [1.0, 2.0, 3.0]);
  assert.ok(err > 9e-6 && err < 1.1e-5, `worst error ${err}`);
  assert.equal(maxRelativeError([1.0], [1.0, 2.0]), Number.POSITIVE_INFINITY, 'length mismatch = +inf');
});

// ---------------------------------------------------------------------------
// 2. Dump-protocol validation (fail-closed)
// ---------------------------------------------------------------------------

function validDump() {
  return {
    format: DUMP_FORMAT,
    provenance: 'SIMULATED_ARCHITECTURAL_MODEL',
    rv32: {
      program: { words: [1, 2, 3], base: 65620 },
      frozenExpectedWords: [7],
      rustResultWords: [7],
      stopReason: 'ecall',
    },
    tpu: {
      badge: 'SIMULATED_ARCHITECTURAL_MODEL',
      workload: { m: 2, k: 2, n: 2, gridP: 2, scales: { aPerRow: [0.5, 0.5], bPerCol: [0.25, 0.25] } },
      qA: [1, 2, 3, 4],
      qB: [1, 2, 3, 4],
      cI32: [7, 7, 7, 7],
      cDequant: [0.875, 0.875, 0.875, 0.875],
    },
  };
}

test('WP-4.6: dump protocol accepts the canonical shape and refuses tampering', () => {
  assert.deepEqual(assertDumpProtocol(validDump()), [], 'canonical dump validates');
  const tampered = validDump();
  tampered.format = 'invention-lab/wp46-oracle-dump/2';
  assert.ok(assertDumpProtocol(tampered).some((e) => /format/.test(e)), 'wrong format refused');
  const noStop = validDump();
  noStop.rv32.stopReason = 'ebreak';
  assert.ok(assertDumpProtocol(noStop).some((e) => /stopReason/.test(e)), 'non-ecall stop refused');
  const shortQ = validDump();
  shortQ.tpu.qA = [1, 2, 3];
  assert.ok(assertDumpProtocol(shortQ).some((e) => /qA/.test(e)), 'operand length mismatch refused');
  const lenScales = validDump();
  lenScales.tpu.workload.scales.aPerRow = [0.5];
  assert.ok(assertDumpProtocol(lenScales).some((e) => /aPerRow/.test(e)), 'per-axis scale length enforced (M rows)');
  const forged = validDump();
  forged.provenance = 'ORACLE_VERIFIED_AGAINST_NGSPICE';
  assert.ok(assertDumpProtocol(forged).length > 0, 'forged provenance refused');
});

// ---------------------------------------------------------------------------
// 3. Loud-skip / require-live exit contract (live subprocess behavior)
// ---------------------------------------------------------------------------

function makeSyntheticDump(dest) {
  const dump = validDump();
  writeFileSync(dest, JSON.stringify(dump));
}

test('WP-4.6: absent oracle tool → loud skip verdict, exit 0 locally', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wp46-test-'));
  const dumpPath = join(dir, 'dump.json');
  makeSyntheticDump(dumpPath);

  const run = spawnSync(process.execPath, [join(HARNESS_DIR, 'qemu-differential.mjs'), dumpPath], {
    encoding: 'utf8',
  });
  // When qemu-riscv32 IS present this test cannot exercise the skip path —
  // note it loudly instead of pretending.
  if (toolOnPath('qemu-riscv32')) {
    assert.equal(run.status, 0, 'with QEMU present the harness runs the live differential');
    console.log('WP46-NOTE: qemu-riscv32 present — the skip-path contract was exercised only structurally here');
    return;
  }
  assert.equal(run.status, 0, 'local skip exits 0 (loud, not a failure)');
  assert.match(run.stderr, /WP46-QEMU-ORACLE-SKIP/, 'skip is printed on stderr');
  const verdict = JSON.parse(run.stdout);
  assert.equal(verdict.skipped, true);
  assert.equal(verdict.pass, false, 'a skip never reads as a pass');

  // CI mode: the same skip is a hard failure — never a silent pass.
  const ciRun = spawnSync(process.execPath, [join(HARNESS_DIR, 'qemu-differential.mjs'), dumpPath, '--require-live'], {
    encoding: 'utf8',
  });
  assert.equal(ciRun.status, 1, '--require-live turns an absent oracle into a hard failure');
  assert.match(ciRun.stderr, /--require-live: CI requires the live oracle/);
});

test('WP-4.6: harness fails loudly on a forged/tampered dump (before any oracle call)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wp46-test-'));
  const dumpPath = join(dir, 'dump.json');
  const dump = validDump();
  dump.rv32.rustResultWords = [1, 2, 3]; // disagrees with the frozen manifest
  writeFileSync(dumpPath, JSON.stringify(dump));
  const run = spawnSync(process.execPath, [join(HARNESS_DIR, 'qemu-differential.mjs'), dumpPath], {
    encoding: 'utf8',
  });
  assert.equal(run.status, 1, 'Rust-vs-manifest mismatch fails before the oracle runs');
  assert.match(run.stderr, /WP46-QEMU-ORACLE-FAIL/);
});

// ---------------------------------------------------------------------------
// 4. Workflow + scripts structure (CI wiring is real, skips are impossible)
// ---------------------------------------------------------------------------

test('WP-4.6: the workflow runs BOTH oracles live with --require-live and pinned tools', () => {
  const yml = readFileSync(join(ROOT, '.github', 'workflows', 'v4-chip-oracles.yml'), 'utf8');
  // Both harnesses, both in CI mode — a skip is structurally impossible.
  assert.match(yml, /node scripts\/v4-oracles\/qemu-differential\.mjs "\$RUNNER_TEMP\/wp46-oracles\/chip_oracle_dump\.json" --require-live/);
  assert.match(yml, /python3 scripts\/v4-oracles\/onnx-tpu-differential\.py "\$RUNNER_TEMP\/wp46-oracles\/chip_oracle_dump\.json" --require-live/);
  // Real tools installed, loudly asserted.
  assert.match(yml, /apt-get install -y qemu-user binutils-riscv64-unknown-elf/);
  assert.match(yml, /command -v qemu-riscv32/);
  assert.match(yml, /onnxruntime==1\.32\.0/, 'pinned ONNX Runtime (Phase 10 convention)');
  assert.match(yml, /onnx==1\.23\.2/);
  assert.match(yml, /CPUExecutionProvider/);
  // The dump comes from the read-only example, built locked.
  assert.match(yml, /cargo build --locked -p ep-kernel --example chip_oracle_dump/);
  assert.match(yml, /cargo run --locked -p ep-kernel --example chip_oracle_dump/);
  // Evidence stays outside the working tree (Phase 30/39 clean tree).
  assert.match(yml, /runner\.temp/);
  assert.doesNotMatch(yml, /benchmarks\/evidence\/wp46/);
  // The ep-chip suite runs with QEMU present — the WP-4.1 differential goes live.
  assert.match(yml, /cargo test --locked -p ep-chip/);
});

test('WP-4.6: harness scripts and the read-only example exist and parse', () => {
  for (const f of [
    'scripts/v4-oracles/oracle-lib.mjs',
    'scripts/v4-oracles/qemu-differential.mjs',
    'scripts/v4-oracles/onnx-tpu-differential.py',
    'crates/ep-kernel/examples/chip_oracle_dump.rs',
  ]) {
    assert.ok(existsSync(join(ROOT, f)), `${f} exists`);
  }
  for (const f of ['scripts/v4-oracles/oracle-lib.mjs', 'scripts/v4-oracles/qemu-differential.mjs']) {
    execFileSync(process.execPath, ['--check', join(ROOT, f)], { stdio: 'pipe' });
  }
  // Python harness compiles when a WORKING python interpreter exists (loud
  // note otherwise — same discipline as the oracles themselves). The probe
  // executes `--version` because Windows' `where` finds Store alias stubs
  // that cannot actually run.
  let python3 = null;
  for (const candidate of ['python3', 'python']) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'pipe' });
      python3 = candidate;
      break;
    } catch {
      // try the next candidate
    }
  }
  if (python3) {
    // PYTHONPYCACHEPREFIX keeps the py_compile cache out of the working tree
    // (Phase 30/39 clean-tree discipline — no generated files land in scripts/).
    execFileSync(
      python3,
      ['-m', 'py_compile', join(ROOT, 'scripts/v4-oracles/onnx-tpu-differential.py')],
      { stdio: 'pipe', env: { ...process.env, PYTHONPYCACHEPREFIX: join(tmpdir(), 'wp46-pycache') } }
    );
  } else {
    console.log('WP46-NOTE: no working python interpreter on PATH — the py_compile check was skipped loudly');
  }
});

test('WP-4.6: the example depends on the ep-chip kernel surface without touching library files', () => {
  const cargo = readFileSync(join(ROOT, 'crates', 'ep-kernel', 'Cargo.toml'), 'utf8');
  assert.match(cargo, /ep-chip = \{ path = "ep-chip" \}/, 'ep-kernel depends on ep-chip for the example');
  const source = readFileSync(join(ROOT, 'crates', 'ep-kernel', 'examples', 'chip_oracle_dump.rs'), 'utf8');
  assert.match(source, /ep_chip::cpu::\{Cpu, CpuIsa\}|use ep_chip::cpu::\{ Cpu, CpuIsa \}/, 'strict RV32IM core surfaced');
  assert.match(source, /SystolicTpu/, 'WP-4.3 TPU surfaced');
  assert.match(source, /SIMULATED_ARCHITECTURAL_MODEL/, 'provenance badge on the dump');
  assert.match(source, /read-only/i, 'declared read-only');
});
