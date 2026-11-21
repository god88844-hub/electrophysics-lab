/**
 * WP-4.6 oracle harness 1 — ep-chip RV32IM strict core vs QEMU user-mode.
 *
 * Reads the dump emitted by `cargo run -p ep-kernel --example chip_oracle_dump`
 * (format `invention-lab/wp46-oracle-dump/1`), then:
 *   1. re-asserts the Rust side against the frozen Phase 8 manifest
 *      (unconditional — this holds without QEMU),
 *   2. packs the dump's minimal RV32 ELF, runs `qemu-riscv32` user-mode and
 *      asserts QEMU's real `write(1, a1, 48)` stdout equals the strict core's
 *      memory bytes AND the frozen manifest words — **bit-exact** (§5 row:
 *      RV32IM execution → bit-exact).
 *
 * Usage:
 *   node scripts/v4-oracles/qemu-differential.mjs <dump.json> [--require-live]
 *
 * Skip discipline: absent `qemu-riscv32` prints a loud WP46-QEMU-ORACLE-SKIP
 * verdict on both channels; `--require-live` (CI) turns that into a hard
 * failure — never a silent pass (PHASE_04 failure modes).
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  assertDumpProtocol,
  compareWordSequences,
  decodeBase64,
  leWordsFromBytes,
  printSkipVerdict,
  toolOnPath,
} from './oracle-lib.mjs';

function fail(msg) {
  console.error(`WP46-QEMU-ORACLE-FAIL: ${msg}`);
  console.log(JSON.stringify({ oracle: 'qemu', skipped: false, pass: false, reason: msg }));
  process.exit(1);
}

function pass(verdict) {
  console.log(JSON.stringify(verdict));
  console.error(
    `WP46-QEMU-ORACLE-PASS: qemu-riscv32 user-mode output bit-exact with the ep-chip strict core (${verdict.words} result words)`
  );
}

function main() {
  const args = process.argv.slice(2);
  const requireLive = args.includes('--require-live');
  const dumpPath = args.find((a) => !a.startsWith('--'));
  if (!dumpPath) {
    console.error('usage: node scripts/v4-oracles/qemu-differential.mjs <dump.json> [--require-live]');
    process.exit(2);
  }
  const dump = JSON.parse(readFileSync(dumpPath, 'utf8'));

  const protocolErrors = assertDumpProtocol(dump);
  if (protocolErrors.length > 0) fail(`dump protocol invalid: ${protocolErrors.join('; ')}`);

  // (1) Unconditional Rust-side differential vs the frozen Phase 8 manifest.
  const frozen = dump.rv32.frozenExpectedWords;
  const rust = dump.rv32.rustResultWords;
  const rustCheck = compareWordSequences(rust, frozen);
  if (!rustCheck.equal) fail(`strict core vs frozen Phase 8 manifest mismatch: ${rustCheck.reason}`);

  // (2) Oracle availability is explicit — absent QEMU is a LOUD skip.
  if (!toolOnPath('qemu-riscv32')) {
    printSkipVerdict(
      'qemu',
      'qemu-riscv32 is not on PATH — the user-mode differential executes only where QEMU exists' +
        (requireLive ? ' (--require-live: CI requires the live oracle)' : '')
    );
    process.exit(requireLive ? 1 : 0);
  }

  // (3) Live differential: pack the ELF, run real QEMU user-mode.
  const elf = decodeBase64(dump.rv32.elfBase64);
  const temp = mkdtempSync(join(tmpdir(), 'wp46-qemu-'));
  const elfPath = join(temp, 'wp46-rv32im.elf');
  try {
    writeFileSync(elfPath, elf);
    const run = spawnSync('qemu-riscv32', [elfPath], { encoding: 'buffer' });
    if (run.error) fail(`qemu-riscv32 could not execute: ${run.error.message}`);
    if (run.status !== 0) {
      // Full diagnostics for the load/run failure (version, ELF header, wave-front trace).
      const version = spawnSync('qemu-riscv32', ['--version'], { encoding: 'utf8' });
      console.error(`qemu: ${(version.stdout || '').split('\n')[0] ?? 'unknown'}`);
      console.error(`elf bytes: ${elf.length}; header: ${Buffer.from(elf.slice(0, 84)).toString('hex')}`);
      const logPath = join(temp, 'trace.log');
      const traced = spawnSync('qemu-riscv32', ['-d', 'in_asm,cpu', '-D', logPath, elfPath], { encoding: 'buffer' });
      console.error(`traced run: exit=${traced.status} stdout=${traced.stdout.length}B stderr=${traced.stderr.toString().slice(0, 200)}`);
      try {
        const log = readFileSync(logPath, 'utf8');
        console.error(`in_asm tail:\n${log.split('\n').slice(-40).join('\n')}`);
      } catch {
        console.error('in_asm log unavailable (guest likely never started)');
      }
      fail(`qemu-riscv32 exited ${run.status}: ${run.stderr.toString().slice(0, 400)}`);
    }

    const expectedBytes = 4 * frozen.length;
    if (run.stdout.length !== expectedBytes) {
      fail(`QEMU emitted ${run.stdout.length} bytes, expected ${expectedBytes} (write(1, a1, 48) protocol)`);
    }
    const qemuWords = leWordsFromBytes(run.stdout);

    const vsFrozen = compareWordSequences(qemuWords, frozen);
    if (!vsFrozen.equal) fail(`QEMU vs frozen Phase 8 manifest mismatch: ${vsFrozen.reason}`);
    const vsRust = compareWordSequences(qemuWords, rust);
    if (!vsRust.equal) fail(`QEMU vs ep-chip strict core mismatch: ${vsRust.reason}`);

    pass({
      oracle: 'qemu',
      skipped: false,
      pass: true,
      words: qemuWords.length,
      differential: 'qemu-riscv32 user-mode vs ep-chip strict RV32IM core — bit-exact (03 §5)',
      program: 'frozen Phase 8 RV32M program (WP-4.1 fixture :: qemuProgram)',
      frozenManifestWords: frozen.length,
      tolerance: 'bit-exact',
    });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

main();
