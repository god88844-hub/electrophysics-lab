import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * WP-1.4 — Command-pattern Undo/Redo unit tests (apply→revert state-hash
 * parity, LRU eviction, per-workspace isolation, committed-head contract).
 *
 * Same import contract as tests/wp13-eplab-project.test.mjs: the
 * implementation lives in `apps/electrophysics-3d/src/state/history.ts` as
 * import-free pure JavaScript with JSDoc types (Node CI cannot parse TS), and
 * the test loads the EXACT FILE BYTES through a data-URL module — app and
 * tests cannot drift. Zero dependencies: the CI `npm test` job installs
 * nothing.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const HISTORY_TS = path.join(root, 'apps', 'electrophysics-3d', 'src', 'state', 'history.ts');
const source = readFileSync(HISTORY_TS, 'utf8');

// Enforce the import-free contract itself so a future TS-ism fails loudly.
assert.ok(!/^\s*import\s/m.test(source), 'history.ts must remain import-free (pure JS + JSDoc) for the Node CI unit-test path');

const H = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const {
  COMMAND_TYPES,
  HISTORY_DEPTH,
  DEFAULT_MEMORY_BUDGET_BYTES,
  stateHash,
  makePlaceComponent,
  makeDeleteComponent,
  makeRouteWire,
  makeMoveComponent,
  makeSetParam,
  HistoryStack,
  HistoryManager,
  committedHeadSnapshot,
} = H;

/** In-memory mock of the app mutation surface (same primitives as App ctx). */
function makeMockCtx(initial = {}) {
  const state = {
    sandboxComponents: initial.components ?? [],
    wires: initial.wires ?? [],
    traces: [],
    vddSlider: initial.vddSlider ?? 1.8,
    ...initial.extra,
  };
  const ctx = {
    getComponents: () => state.sandboxComponents.map((c) => ({ ...c })),
    setComponents: (comps) => {
      state.sandboxComponents = comps.map((c) => ({ ...c }));
    },
    getWires: () => state.wires.map((w) => ({ ...w })),
    setWires: (wires) => {
      state.wires = wires.map((w) => ({ ...w }));
    },
    setParam: (key, value) => {
      state[key] = value;
    },
    snapshot: () => ({
      sandboxComponents: state.sandboxComponents.map((c) => ({ ...c })),
      wires: state.wires.map((w) => ({ ...w })),
      vddSlider: state.vddSlider,
    }),
    /** Reads the live state for hash parity (same slice the hash covers). */
    __state: state,
    traces: [],
    addTraceMesh: (from, to) => {
      ctx.__state.traces.push({ from, to });
    },
    removeTraceMesh: (from, to) => {
      ctx.__state.traces = ctx.__state.traces.filter((t) => !(t.from === from && t.to === to));
    },
  };
  return ctx;
}

const NMOS = (id, pos = [0.35, 0.0]) => ({
  id,
  kind: 'nmos',
  params: {},
  nodes: ['gate', 'drain', 'gnd'],
  position: pos.slice(),
});

test('WP-1.4: apply → revert state-hash parity for every command type', () => {
  const ctx = makeMockCtx({
    components: [NMOS('nmos_0'), NMOS('nmos_1', [0.7, 0.35])],
    wires: [{ from: 'nmos_0', to: 'nmos_1' }],
  });
  const baseHash = stateHash(ctx.snapshot());

  const cases = [
    H.makePlaceComponent('silicon', NMOS('nmos_2', [1.05, 0.7])),
    H.makeDeleteComponent('silicon', NMOS('nmos_1', [0.7, 0.35])),
    H.makeRouteWire('silicon', { from: 'nmos_2', to: 'nmos_0' }),
    H.makeMoveComponent('silicon', 'nmos_0', [0.35, 0.0], [0.7, 0.7]),
    H.makeSetParam('silicon', 'vddSlider', 1.8, 2.5),
  ];
  for (const [i, command] of cases.entries()) {
    // apply: hash changes (the edit took effect) …
    const before = stateHash(ctx.snapshot());
    command.apply(ctx);
    const afterApply = stateHash(ctx.snapshot());
    assert.notEqual(afterApply, before, `case ${i}: apply must change state (${command.type})`);
    // … and revert restores the pre-apply hash exactly (state-hash parity).
    command.revert(ctx);
    const afterRevert = stateHash(ctx.snapshot());
    assert.equal(afterRevert, before, `case ${i}: revert must restore the pre-apply hash (${command.type})`);
    // re-apply reproduces the applied hash exactly (deterministic commands).
    command.apply(ctx);
    assert.equal(stateHash(ctx.snapshot()), afterApply, `case ${i}: re-apply determinism (${command.type})`);
    command.revert(ctx);
    assert.equal(stateHash(ctx.snapshot()), before, `case ${i}: cleanup (${command.type})`);
  }
  assert.equal(stateHash(ctx.snapshot()), baseHash, 'context returns to the base hash');
});

test('WP-1.4: stack undo/redo parity — store IS the committed head', () => {
  const ctx = makeMockCtx({});
  const stack = new HistoryStack();
  const c1 = H.makePlaceComponent('silicon', NMOS('nmos_0'));
  const c2 = H.makePlaceComponent('silicon', NMOS('nmos_1', [0.7, 0.35]));

  stack.push(c1, ctx);
  assert.equal(ctx.__state.sandboxComponents.length, 1);
  const hashAfter1 = stateHash(ctx.snapshot());
  assert.equal(stack.headHash(ctx), hashAfter1, 'committed head == store after apply');

  stack.push(c2, ctx);
  assert.equal(ctx.__state.sandboxComponents.length, 2);
  const hashAfter2 = stateHash(ctx.snapshot());

  // Undo → store IS the after-1 committed head (the after-2 state is
  // speculative future, never serialized by auto-save).
  const undone = stack.undo(ctx);
  assert.equal(undone.type, COMMAND_TYPES.PlaceComponent);
  assert.equal(stateHash(ctx.snapshot()), hashAfter1, 'undo restores the committed after-1 head');
  assert.equal(committedHeadSnapshot(ctx).sandboxComponents.length, 1, 'auto-save serializes the committed head only');

  // Redo → re-applies to the after-2 committed head.
  const redone = stack.redo(ctx);
  assert.equal(redone.type, COMMAND_TYPES.PlaceComponent);
  assert.equal(stateHash(ctx.snapshot()), hashAfter2, 'redo restores the after-2 head');
  assert.equal(committedHeadSnapshot(ctx).sandboxComponents.length, 2);

  // Double undo to the empty base (two commands applied), then double redo.
  stack.undo(ctx); // reverts nmos_1
  assert.equal(ctx.__state.sandboxComponents.length, 1);
  stack.undo(ctx); // reverts nmos_0
  assert.equal(stateHash(ctx.snapshot()), stateHash({ components: [], wires: [], vddSlider: 1.8 }));
  stack.redo(ctx);
  assert.equal(stateHash(ctx.snapshot()), hashAfter1);
  stack.redo(ctx);
  assert.equal(stateHash(ctx.snapshot()), hashAfter2);
  assert.equal(stack.undoDepth(), 2);
  assert.equal(stack.redoDepth(), 0);
});

test('WP-1.4: new edit invalidates the speculative redo stack', () => {
  const ctx = makeMockCtx({});
  const stack = new HistoryStack();
  stack.push(H.makePlaceComponent('silicon', NMOS('nmos_0')), ctx);
  stack.undo(ctx);
  assert.equal(stack.redoDepth(), 1);
  // A brand-new edit discards the speculative future.
  stack.push(H.makePlaceComponent('silicon', NMOS('nmos_1', [0.7, 0.35])), ctx);
  assert.equal(stack.redoDepth(), 0, 'redo stack truncated by a new edit');
  assert.equal(stack.undoDepth(), 1, 'the undone command is discarded by a new edit');
});

test('WP-1.4: depth-200 bound evicts the oldest undo entries', () => {
  const ctx = makeMockCtx({});
  const stack = new HistoryStack({ depth: 200 });
  for (let i = 0; i < 205; i++) {
    stack.push(H.makePlaceComponent('silicon', NMOS('nmos_' + i, [0.35 + (i % 8) * 0.2, 0.35 + Math.floor(i / 8) * 0.2])), ctx);
  }
  assert.equal(stack.undoDepth(), 200, 'undo depth capped at 200');
  assert.equal(stack.redoDepth(), 0);
  // The five oldest commands are evicted: undoing 200 lands on nmos_204's
  // pre-apply state — i.e., exactly 200 components remain (204..5).
  for (let i = 0; i < 200; i++) stack.undo(ctx);
  assert.equal(stack.undoDepth(), 0);
  const remaining = ctx.__state.sandboxComponents.map((c) => c.id).sort();
  assert.equal(remaining.length, 5, 'evicted commands are permanently outside the undo range');
  assert.deepEqual(remaining, ['nmos_0', 'nmos_1', 'nmos_2', 'nmos_3', 'nmos_4'],
    'the five evicted oldest placements survive every undo');
});

test('WP-1.4: LRU memory bound evicts oldest commands first', () => {
  const ctx = makeMockCtx({});
  // Tiny budget: each placement payload is ~100-200 bytes; 512 B holds ~3.
  const stack = new HistoryStack({ memoryBudgetBytes: 512 });
  for (let i = 0; i < 6; i++) {
    stack.push(H.makePlaceComponent('silicon', NMOS('nmos_' + i, [0.35 + i * 0.2, 0.35])), ctx);
  }
  assert.ok(stack.undoDepth() < 6, `LRU must evict (undo depth ${stack.undoDepth()})`);
  assert.ok(stack.memoryBytes <= 512, `memory bytes ${stack.memoryBytes} within budget`);
  // Every retained command still reverts cleanly (evicted ones are gone).
  while (stack.canUndo()) stack.undo(ctx);
  assert.equal(stack.undoDepth(), 0);
  assert.ok(ctx.__state.sandboxComponents.length >= 1, 'evicted placements remain in the state');
});

test('WP-1.4: per-workspace isolation — Silicon undo never touches Quantum', () => {
  const manager = new HistoryManager();
  const siliconCtx = makeMockCtx({});
  const quantumCtx = makeMockCtx({ components: [NMOS('q_nmos_0')] });
  const siliconHashBefore = stateHash(siliconCtx.snapshot());

  manager.push(H.makePlaceComponent('silicon', NMOS('nmos_0')), siliconCtx);
  manager.push(H.makeSetParam('quantum', 'vddSlider', 1.8, 2.5), quantumCtx);
  const quantumHashBefore = stateHash(quantumCtx.snapshot()); // committed quantum head

  assert.equal(manager.canUndo('silicon'), true);
  assert.equal(manager.canUndo('quantum'), true);
  // Isolation: the silicon stack is independent of the quantum stack.
  assert.equal(manager.undo('silicon', siliconCtx).type, COMMAND_TYPES.PlaceComponent);
  assert.equal(stateHash(siliconCtx.snapshot()), siliconHashBefore, 'silicon reverted');
  assert.equal(stateHash(quantumCtx.snapshot()), quantumHashBefore, 'quantum untouched by silicon undo');

  // The quantum undo reverts its OWN command: vddSlider back to 1.8.
  manager.undo('quantum', quantumCtx);
  assert.equal(quantumCtx.snapshot().vddSlider, 1.8, 'quantum undo reverts its own param');
  assert.equal(manager.canUndo('silicon'), false, 'silicon stack exhausted independently');
  assert.equal(manager.canRedo('quantum'), true, 'quantum redo retained');
  // clearWorkspace clears only one workspace.
  manager.clearWorkspace('silicon');
  assert.equal(manager.canRedo('quantum'), true, 'quantum stack survives clearWorkspace(silicon)');
  manager.clearAll();
  assert.equal(manager.canUndo('quantum'), false);
});

test('WP-1.4: committed-head contract — auto-save never serializes the redo future', () => {
  const ctx = makeMockCtx({});
  const stack = new HistoryStack();
  stack.push(H.makePlaceComponent('silicon', NMOS('nmos_0')), ctx);
  stack.push(H.makePlaceComponent('silicon', NMOS('nmos_1', [0.7, 0.35])), ctx);
  stack.undo(ctx);
  // The committed head holds exactly one component; the undone one lives only
  // on the redo stack (speculative future).
  const head = committedHeadSnapshot(ctx);
  assert.equal(head.sandboxComponents.length, 1, 'committed head = post-undo state');
  assert.equal(stack.redoDepth(), 1, 'redo future retained for Ctrl+Y');
  // After redo the future becomes the committed head.
  stack.redo(ctx);
  assert.equal(committedHeadSnapshot(ctx).sandboxComponents.length, 2);
});
