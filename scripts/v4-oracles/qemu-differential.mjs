/**
 * WP-4.6 oracle harness 1 — ep-chip RV32IM strict core vs QEMU user-mode.
 *
 * Reads the dump emitted by `cargo run -p ep-kernel --example chip_oracle_dump`
 * (format `invention-lab/wp46-oracle-dump/1`), then:
 *   1. re-asserts the Rust side against the frozen Phase 8 manifest
 *      (unconditional — this holds without QEMU),
 *   2. assembles the dump's exact program words with the GNU RISC-V
 *      toolchain using the phase8-identical pipeline
 *      (`as -march=rv32im -mabi=ilp32` → `ld -m elf32lriscv -Ttext=0x10000
 *      -e _start --no-relax` — the layout `scripts/phase8-qemu-rv32m.mjs`
 *      proves on these runners daily),
 *   3. runs `qemu-riscv32` user-mode and asserts QEMU's real `write(1, a1, 48)`
 *      stdout equals the strict core's result words AND the frozen manifest
 *      words — **bit-exact** (§5 row: RV32IM execution → bit-exact).
 *
 * Usage:
 *   node scripts/v4-oracles/qemu-differential.mjs <dump.json> [--require-live]
 *
 * Requires `qemu-riscv32`, `riscv64-unknown-elf-as` and `riscv64-unknown-elf-ld`
 * (the same packages the phase8 workflow installs). Absent tools print a loud
 * WP46-QEMU-ORACLE-SKIP verdict on both channels; `--require-live` (CI) turns
 * that into a hard failure — never a silent pass (PHASE_04 failure modes).
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  assertDumpProtocol,
  compareWordSequences,
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

  // (2) Oracle availability is explicit — absent tools are a LOUD skip.
  const tools = ['qemu-riscv32', 'riscv64-unknown-elf-as', 'riscv64-unknown-elf-ld'];
  const missing = tools.filter((t) => !toolOnPath(t));
  if (missing.length > 0) {
    printSkipVerdict(
      'qemu',
      `${missing.join(', ')} not on PATH — the user-mode differential executes only where the ` +
        'phase8 oracle toolchain exists' +
        (requireLive ? ' (--require-live: CI requires the live oracle)' : '')
    );
    process.exit(requireLive ? 1 : 0);
  }

  // (3) Live differential: assemble the dump's exact program words with the
  // phase8-identical GNU pipeline (result_words .data block mirrors the
  // original rv32m-operations.S layout), run real QEMU user-mode.
  const words = dump.rv32.program.words;
  const dataBytes = frozen.length * 4;
  const asm = [
    '.text',
    '.balign 4',
    '.global _start',
    '_start:',
    ...words.map((w) => `.word ${w}`),
    '.data',
    '.balign 4',
    'result_words:',
    `.zero ${dataBytes}`,
    '',
  ].join('\n');

  const temp = mkdtempSync(join(tmpdir(), 'wp46-qemu-'));
  try {
    const asmPath = join(temp, 'wp46.S');
    const objPath = join(temp, 'wp46.o');
    const elfPath = join(temp, 'wp46.elf');
    writeFileSync(asmPath, asm);

    const asRun = spawnSync('riscv64-unknown-elf-as', ['-march=rv32im', '-mabi=ilp32', asmPath, '-o', objPath], {
      encoding: 'buffer',
    });
    if (asRun.status !== 0) fail(`as failed: ${asRun.stderr.toString().slice(0, 400)}`);
    const ldRun = spawnSync(
      'riscv64-unknown-elf-ld',
      ['-m', 'elf32lriscv', '-Ttext=0x10000', '-e', '_start', '--no-relax', objPath, '-o', elfPath],
      { encoding: 'buffer' }
    );
    if (ldRun.status !== 0) fail(`ld failed: ${ldRun.stderr.toString().slice(0, 400)}`);

    const run = spawnSync('qemu-riscv32', [elfPath], { encoding: 'buffer' });
    if (run.error) fail(`qemu-riscv32 could not execute: ${run.error.message}`);
    if (run.status !== 0) {
      fail(
        `qemu-riscv32 exited ${run.status}: ${run.stderr.toString().slice(0, 400)} ` +
          `(elf at ${elfPath} preserved for inspection in the job temp dir)`
      );
    }

    const expectedBytes = dataBytes;
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
      program: 'frozen Phase 8 RV32M program (WP-4.1 fixture :: qemuProgram), GNU-assembled phase8-identical',
      frozenManifestWords: frozen.length,
      tolerance: 'bit-exact',
    });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

main();
