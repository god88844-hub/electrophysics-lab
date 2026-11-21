/**
 * WP-1.4 — Command-pattern Undo/Redo for the CAD workbench
 * (`docs/master-plan/phases/PHASE_01_DESKTOP_CAD_AND_RUST_CORE.md` → WP-1.4).
 *
 * Contract (Builder Rules 1 & 2; PHASE_01 failure modes):
 *  - Every CAD edit is a Command with `apply(ctx)` / `revert(ctx)` — the
 *    store state after `revert` is bit-for-bit the state before `apply`
 *    (verified by state-hash parity in tests/wp14-undo-redo.test.mjs).
 *  - Per-workspace stacks, depth 200 (oldest commands fall out of the undo
 *    range), LRU memory bound on the recorded payloads.
 *  - Auto-save (WP-1.3) serializes ONLY the committed history head: the
 *    store state after `undo` IS the committed head (the redo stack holds
 *    speculative future states that are never serialized until re-applied).
 *    `committedHeadSnapshot(ctx)` is the sanctioned auto-save entry point.
 *  - This file is pure JavaScript + JSDoc with ZERO imports so the Node CI
 *    test can load these exact bytes via a data-URL (same contract as
 *    `src/state/project.ts`).
 */

/**
 * Command type identifiers (`docs/master-plan/schemas/eplab-project.schema.json`
 * edits are expressed through these five primitive CAD mutations).
 */
export const COMMAND_TYPES = Object.freeze({
  PlaceComponent: 'PlaceComponent',
  DeleteComponent: 'DeleteComponent',
  RouteWire: 'RouteWire',
  MoveComponent: 'MoveComponent',
  SetParam: 'SetParam',
});

/** Undo-stack depth per workspace (Builder Rule / PHASE_01: depth 200). */
export const HISTORY_DEPTH = 200;
/** Default LRU memory budget for recorded commands (bytes of payload JSON). */
export const DEFAULT_MEMORY_BUDGET_BYTES = 4 * 1024 * 1024;

/**
 * Deterministic workspace-state hash for parity checks: components sorted by
 * id + wires + session params. Pure function of the CAD slice — used by the
 * unit tests (`apply → revert` hash equality) and by the committed-head guard.
 *
 * @param {{ sandboxComponents?: Array<{id: string, [k: string]: unknown}>, wires?: Array<{from: string, to: string}>, vddSlider?: number }} state
 * @returns {string}
 */
export function stateHash(state) {
  const comps = (state.sandboxComponents ?? [])
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((c) => ({ id: c.id, kind: c.kind, params: c.params ?? {}, nodes: c.nodes ?? [], position: c.position ?? [] }));
  const wires = (state.wires ?? [])
    .slice()
    .sort((a, b) => (a.from + '|' + a.to < b.from + '|' + b.to ? -1 : 1));
  const payload = JSON.stringify({
    c: comps,
    w: wires,
    v: state.vddSlider ?? null,
  });
  // FNV-1a 32-bit — deterministic, dependency-free, adequate for parity checks.
  let h = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8) + ':' + payload.length;
}

/** Approximate memory footprint of a command payload (bytes, UTF-16 counted as 2). */
function payloadBytes(payload) {
  try {
    return JSON.stringify(payload ?? {}).length * 2;
  } catch {
    return 256;
  }
}

/**
 * Command factories — each returns a Command record:
 * `{ type, workspace, label, payload, memBytes, apply(ctx), revert(ctx) }`.
 * `ctx` is the app-side mutation surface (see `makeAppContext` below); tests
 * pass an in-memory mock with the same primitive surface.
 */

export function makePlaceComponent(workspace, component) {
  return {
    type: COMMAND_TYPES.PlaceComponent,
    workspace,
    label: 'Place ' + component.id,
    payload: { component },
    memBytes: payloadBytes({ component }),
    apply(ctx) {
      const comps = ctx.getComponents();
      if (comps.some((c) => c.id === component.id)) return;
      ctx.setComponents([...comps, component]);
    },
    revert(ctx) {
      ctx.setComponents(ctx.getComponents().filter((c) => c.id !== component.id));
    },
  };
}

export function makeDeleteComponent(workspace, component) {
  return {
    type: COMMAND_TYPES.DeleteComponent,
    workspace,
    label: 'Delete ' + component.id,
    payload: { component },
    memBytes: payloadBytes({ component }),
    apply(ctx) {
      ctx.setComponents(ctx.getComponents().filter((c) => c.id !== component.id));
    },
    revert(ctx) {
      const comps = ctx.getComponents();
      if (comps.some((c) => c.id === component.id)) return;
      ctx.setComponents([...comps, component]);
    },
  };
}

export function makeRouteWire(workspace, wire) {
  return {
    type: COMMAND_TYPES.RouteWire,
    workspace,
    label: 'Wire ' + wire.from + ' → ' + wire.to,
    payload: { wire },
    memBytes: payloadBytes({ wire }),
    apply(ctx) {
      const wires = ctx.getWires();
      if (wires.some((w) => w.from === wire.from && w.to === wire.to)) return;
      ctx.setWires([...wires, wire]);
      if (ctx.addTraceMesh) ctx.addTraceMesh(wire.from, wire.to);
    },
    revert(ctx) {
      ctx.setWires(ctx.getWires().filter((w) => !(w.from === wire.from && w.to === wire.to)));
      if (ctx.removeTraceMesh) ctx.removeTraceMesh(wire.from, wire.to);
    },
  };
}

export function makeMoveComponent(workspace, id, from, to) {
  return {
    type: COMMAND_TYPES.MoveComponent,
    workspace,
    label: 'Move ' + id,
    payload: { id, from, to },
    memBytes: payloadBytes({ id, from, to }),
    apply(ctx) {
      ctx.setComponents(ctx.getComponents().map((c) => (c.id === id ? { ...c, position: to.slice() } : c)));
    },
    revert(ctx) {
      ctx.setComponents(ctx.getComponents().map((c) => (c.id === id ? { ...c, position: from.slice() } : c)));
    },
  };
}

export function makeSetParam(workspace, key, from, to) {
  return {
    type: COMMAND_TYPES.SetParam,
    workspace,
    label: 'Set ' + key,
    payload: { key, from, to },
    memBytes: payloadBytes({ key, from, to }),
    apply(ctx) {
      ctx.setParam(key, to);
    },
    revert(ctx) {
      ctx.setParam(key, from);
    },
  };
}

/**
 * Per-workspace undo/redo stack with depth + LRU memory bounds.
 * `undo`/`redo` drive the mutation surface through the commands themselves —
 * the store after any call is the committed history head.
 */
export class HistoryStack {
  /**
   * @param {{ depth?: number, memoryBudgetBytes?: number }} options
   */
  constructor(options = {}) {
    this.depth = options.depth ?? HISTORY_DEPTH;
    this.memoryBudgetBytes = options.memoryBudgetBytes ?? DEFAULT_MEMORY_BUDGET_BYTES;
    /** @type {Array<Command>} oldest → newest applied */
    this.undoStack = [];
    /** @type {Array<Command>} newest-first revertable commands */
    this.redoStack = [];
    this.memoryBytes = 0;
  }

  /** Record an already-applied command (caller applied it through ctx). */
  record(command) {
    this.undoStack.push(command);
    this.memoryBytes += command.memBytes;
    this.redoStack.length = 0; // new edit invalidates the speculative future
    this._enforceBounds();
  }

  /** Apply + record in one call (returns the command for label display). */
  push(command, ctx) {
    command.apply(ctx);
    this.record(command);
    return command;
  }

  _enforceBounds() {
    // Depth bound: oldest undo entries fall out of the undo range.
    while (this.undoStack.length > this.depth) {
      const evicted = this.undoStack.shift();
      this.memoryBytes -= evicted.memBytes;
    }
    // LRU memory bound: evict oldest until under budget.
    while (this.memoryBytes > this.memoryBudgetBytes && this.undoStack.length > 0) {
      const evicted = this.undoStack.shift();
      this.memoryBytes -= evicted.memBytes;
    }
    if (this.undoStack.length === 0) {
      this.memoryBytes = 0;
    }
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undoDepth() {
    return this.undoStack.length;
  }

  redoDepth() {
    return this.redoStack.length;
  }

  /** Revert the newest applied command (Ctrl+Z). */
  undo(ctx) {
    const command = this.undoStack.pop();
    if (!command) return null;
    command.revert(ctx);
    this.redoStack.push(command);
    return command;
  }

  /** Re-apply the newest reverted command (Ctrl+Y / Ctrl+Shift+Z). */
  redo(ctx) {
    const command = this.redoStack.pop();
    if (!command) return null;
    command.apply(ctx);
    this.undoStack.push(command);
    this.memoryBytes += command.memBytes;
    this._enforceBounds();
    return command;
  }

  /** Committed history head hash (parity check / auto-save guard). */
  headHash(ctx) {
    return stateHash(ctx.snapshot());
  }

  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.memoryBytes = 0;
  }
}

/**
 * Per-workspace isolated history manager: undo/redo route by workspace id so
 * Silicon CAD edits never touch the Quantum stack (and vice versa).
 */
export class HistoryManager {
  constructor(options = {}) {
    this.options = options ?? {};
    /** @type {Map<string, HistoryStack>} */
    this.stacks = new Map();
    /** false while a command apply/revert is mutating the store — the App's
     *  recording subscription checks this to skip command-driven changes. */
    this.recording = true;
  }

  stackFor(workspace) {
    let stack = this.stacks.get(workspace);
    if (!stack) {
      stack = new HistoryStack(this.options);
      this.stacks.set(workspace, stack);
    }
    return stack;
  }

  /** Apply + record a command on its workspace stack. The apply mutates the
   *  store with recording suppressed (the App subscription must not re-record
   *  command-driven changes). */
  push(command, ctx) {
    const prev = this.recording;
    this.recording = false;
    try {
      command.apply(ctx);
    } finally {
      this.recording = prev;
    }
    return this.stackFor(command.workspace).record(command);
  }

  undo(workspace, ctx) {
    const prev = this.recording;
    this.recording = false;
    try {
      return this.stackFor(workspace).undo(ctx);
    } finally {
      this.recording = prev;
    }
  }

  redo(workspace, ctx) {
    const prev = this.recording;
    this.recording = false;
    try {
      return this.stackFor(workspace).redo(ctx);
    } finally {
      this.recording = prev;
    }
  }

  canUndo(workspace) {
    return this.stackFor(workspace).canUndo();
  }

  canRedo(workspace) {
    return this.stackFor(workspace).canRedo();
  }

  undoDepth(workspace) {
    return this.stackFor(workspace).undoDepth();
  }

  redoDepth(workspace) {
    return this.stackFor(workspace).redoDepth();
  }

  clearWorkspace(workspace) {
    this.stackFor(workspace).clear();
  }

  clearAll() {
    for (const stack of this.stacks.values()) stack.clear();
  }
}

/** Global singleton used by the app + e2e (window.__lab.history). */
export const historyManager = new HistoryManager();

/**
 * Sanctioned auto-save entry point: the committed history head snapshot.
 * Auto-save (WP-1.3) MUST call this — never a speculative redo state.
 *
 * @param {{ workspace: string, snapshot: () => object }} ctx
 */
export function committedHeadSnapshot(ctx) {
  return ctx.snapshot();
}
