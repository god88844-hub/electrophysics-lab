import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * WP-4.5 — live-exec unit tests: exact execution output + the
 * memory-transaction-to-packet-event binding, against the REAL
 * packages/chip-engine engines (createRV32 + asm + createForth — the same
 * browser execution path InspectorPanels wires).
 *
 * The runner module (`bays/soc/liveExec.ts`) is import-free pure JS with
 * engine INJECTION, imported here via the data-URL contract; the chip-engine
 * ES modules are imported directly (pure ESM, node-safe).
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const RUNNER_TS = path.join(root, 'apps', 'electrophysics-3d', 'src', 'bays', 'soc', 'liveExec.ts');
const source = readFileSync(RUNNER_TS, 'utf8');

assert.ok(!/^\s*import\s/m.test(source), 'liveExec.ts must remain import-free (pure JS + JSDoc + injected engines) for the Node CI unit-test path');

const LE = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const { createLiveRunner, PROGRAMS, packetRouteFor, BUS_ROUTES, isIdle } = LE;

const chip = await import('../packages/chip-engine/src/index.mjs');

function makeRunner(hooks = {}) {
  return createLiveRunner(chip, hooks);
}

test('WP-4.5: RV32IM assembly executes exactly — x5 = 55 (sum 1..10) with a store+load per iteration', () => {
  const runner = makeRunner();
  runner.loadProgram('asm');
  runner.play();
  // Execute to quiescence via the frame tick (deterministic playback).
  for (let f = 0; f < 100 && !runner.state().halted; f++) runner.tick(1 / 60);
  const st = runner.state();
  assert.equal(st.halted, true, 'program reaches the HALT sentinel');
  assert.equal(st.x5, 55, 'x5 = sum 1..10 = 55 (exact execution output)');
  assert.equal(st.x7, 54, 'x7 holds the last loaded partial sum (54 — stored before the final add)');
  assert.equal(st.stats.loads, 10, '10 lw executed');
  assert.equal(st.stats.stores, 10, '10 sw executed');
  assert.equal(st.stats.mul, 0, 'no mul in the asm program');
  // Exact memory round-trip: the last stored partial sum (45) at byte 256.
  assert.equal(st.memWordAt(256), 54, 'mem[256] holds the last stored partial sum');
  assert.equal(st.packetsEmitted, 20, 'every lw/sw produced exactly one packet event');
});

test('WP-4.5: every memory transaction binds to a packet event with the exact address', () => {
  const runner = makeRunner();
  runner.loadProgram('asm');
  // Drive step-by-step and capture every memory transaction with its exact
  // effective address (recomputing regs[rs1]+imm BEFORE each execution).
  const runner2 = makeRunner();
  runner2.loadProgram('asm');
  const txs = [];
  let g = 0;
  while (!runner2.state().halted && g++ < 200) {
    const { event } = runner2.step();
    if (event && (event.kind === 'load' || event.kind === 'store')) txs.push(event);
  }
  // 10 iterations × (sw then lw), in that order, all at byte address 256.
  assert.equal(txs.length, 20);
  for (let i = 0; i < 10; i++) {
    assert.equal(txs[2 * i].kind, 'store');
    assert.equal(txs[2 * i].addr, 256, `store ${i} effective address = 256`);
    assert.equal(txs[2 * i + 1].kind, 'load');
    assert.equal(txs[2 * i + 1].addr, 256, `load ${i} effective address = 256`);
  }
});

test('WP-4.5: transaction→packet binding — lw/sw map to bus route 0, ALU/MUL emit no packets', () => {
  // lw: memory → CPU (route 0 forward); sw: CPU → memory (route 0 reverse).
  assert.deepEqual(packetRouteFor({ kind: 'load', addr: 256 }), { route: 0, dir: 1 });
  assert.deepEqual(packetRouteFor({ kind: 'store', addr: 256 }), { route: 0, dir: -1 });
  // Systolic dispatch: CPU → TPU (route 3).
  assert.deepEqual(packetRouteFor({ kind: 'systolic' }), { route: 3, dir: 1 });
  // ALU/MUL/branch/jump stay on the CPU tile — NO interposer packet.
  assert.equal(packetRouteFor({ kind: 'alu' }), null);
  assert.equal(packetRouteFor({ kind: 'mul' }), null);
  assert.equal(packetRouteFor({ kind: 'branch' }), null);
  assert.equal(packetRouteFor({ kind: 'jump' }), null);
  // Route ids match Bay3Soc.buildBusFabric order (mem→cpu, mem→tpu, mem→gpu, cpu→tpu, tpu→gpu).
  assert.deepEqual([...BUS_ROUTES], ['mem-cpu', 'mem-tpu', 'mem-gpu', 'cpu-tpu', 'tpu-gpu']);
});

test('WP-4.5: C binary (pre-compiled RV32IM machine words) executes exactly — acc = 30, MUL ops exercised', () => {
  const runner = makeRunner();
  runner.loadProgram('cbinary');
  let guard = 0;
  while (!runner.state().halted && guard++ < 200) runner.step();
  const st = runner.state();
  assert.equal(st.halted, true);
  assert.equal(st.x5, 30, 'acc = 2*(5+4+3+2+1) = 30 (exact compiled-C output)');
  assert.equal(st.stats.mul, 5, '5 MUL executed (one per iteration)');
  assert.equal(st.memWordAt(512), 30, 'the compiled store lands acc at byte 512');
  assert.equal(st.stats.stores, 1);
});

test('WP-4.5: Forth executes exactly — memory round-trip + stack output', () => {
  const runner = makeRunner();
  runner.loadProgram('forth');
  const events = [];
  let guard = 0;
  while (!runner.state().halted && guard++ < 100) {
    const { event } = runner.step();
    if (event) events.push(event);
  }
  const st = runner.state();
  assert.equal(st.halted, true);
  assert.deepEqual(st.output, [5, 7, 12], 'Forth `.` output exact: 5, 7, then 12');
  assert.deepEqual(st.stack, [], 'stack empty at program end');
  // The two `!` stores + two `@` loads produced memory-transaction packets.
  const memEvents = events.filter((e) => e.kind === 'load' || e.kind === 'store');
  assert.equal(memEvents.length, 6, "4 loads + 2 stores");
  assert.equal(memEvents.filter((e) => e.kind === 'store').length, 2);
  assert.equal(memEvents.filter((e) => e.kind === 'load').length, 4);
});

test('WP-4.5: Step-1-inst advances exactly one instruction; halted emits nothing', () => {
  const runner = makeRunner();
  runner.loadProgram('asm');
  const before = runner.state();
  const { event } = runner.step();
  const after = runner.state();
  assert.equal(after.stats.instructions, before.stats.instructions + 1, 'exactly one retired instruction');
  assert.ok(event);
  assert.equal(after.pc, before.pc + 4, 'PC advanced one instruction word');
  // Run to halt, then step: halted emits NOTHING (zero packets — no decorative loops).
  let guard = 0;
  while (!runner.state().halted && guard++ < 200) runner.step();
  const haltedState = runner.state();
  const { event: haltedEvent } = runner.step();
  assert.equal(haltedEvent, null, 'stepping a halted CPU produces no event');
  assert.equal(runner.state().packetsEmitted, haltedState.packetsEmitted, 'no packets emitted while halted');
  assert.ok(isIdle(runner.state()), 'halted runner is idle');
});

test('WP-4.5: play/pause/reset controls — pause stops emission mid-program, reset restores initial state', () => {
  const runner = makeRunner();
  runner.loadProgram('asm');
  runner.play();
  runner.tick(0.1); // ~12 instructions execute
  const mid = runner.state();
  assert.ok(mid.stats.instructions > 0, 'play executes instructions');
  runner.pause();
  const afterPause = runner.tick(5); // 5 seconds paused → nothing
  assert.equal(afterPause.length, 0, 'paused runner emits zero events');
  const pausedState = runner.state();
  assert.equal(pausedState.stats.instructions, mid.stats.instructions, 'pause froze execution');
  runner.reset();
  const reset = runner.state();
  assert.equal(reset.stats.instructions, 0, 'reset restores the freshly-loaded state');
  assert.equal(reset.pc, 0);
  assert.equal(reset.x5, 0);
  assert.equal(reset.halted, false);
  assert.equal(reset.packetsEmitted, 0);
});

test('WP-4.5: systolic dispatch drives CPU→TPU packets + power injection', () => {
  let power = 0;
  const runner = makeRunner({ onPower: (w) => { power += w; } });
  runner.loadProgram('asm');
  const events = runner.systolicDispatch(12);
  assert.equal(events.length, 12);
  assert.equal(events.every((e) => e.kind === 'systolic'), true);
  const st = runner.state();
  assert.equal(st.stats.systolic, 12);
  assert.equal(st.packetsEmitted, 12, 'each dispatch is a packet event');
  // Route binding: every systolic packet maps to the CPU→TPU route.
  assert.ok(events.every((e) => packetRouteFor(e).route === 3 && packetRouteFor(e).dir === 1));
  assert.ok(power > 0, 'systolic dispatch injected per-tile power');
});

test('WP-4.5: programs are documented (assembly/Forth sources + compiled-C provenance)', () => {
  assert.ok(PROGRAMS.asm.source.join('\n').includes('bne'), 'assembly source listing');
  assert.ok(PROGRAMS.forth.tokens.length > 0, 'forth token program');
  assert.ok(PROGRAMS.cbinary.cSource.join('\n').includes('acc'), 'compiled-C provenance comment');
  assert.ok(PROGRAMS.cbinary.label.includes('RV32IM'));
});

test('WP-4.5: determinism — identical runs produce identical packet/event streams', () => {
  const runOnce = () => {
    const runner = makeRunner();
    runner.loadProgram('asm');
    const txs = [];
    let guard = 0;
    while (!runner.state().halted && guard++ < 200) {
      const { event } = runner.step();
      if (event) txs.push({ kind: event.kind, addr: event.addr ?? null, pc: event.pc });
    }
    return txs;
  };
  const a = runOnce();
  const b = runOnce();
  assert.deepEqual(a, b, 'bit-for-bit deterministic execution + event order');
});
