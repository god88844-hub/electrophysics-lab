// @ts-nocheck
/**
 * WP-4.5 — SoC live-program runner (Assembly / Forth / pre-compiled
 * C→RV32IM machine-word binary) driving the 3D interposer packet flow.
 *
 * PURE, IMPORT-FREE JavaScript (JSDoc types — the data-URL Node CI contract
 * shared with project.ts/history.ts/forensicEvents.ts): the CPU + Forth
 * engines are INJECTED (packages/chip-engine `createRV32`/`asm`/`createForth`
 * — the browser execution path per Builder Law 6), so this module is
 * deterministic and unit-testable without any import graph.
 *
 * Every executed instruction produces a structured execution event; memory
 * transactions (`lw`/`sw`, Forth `@`/`!`) become interposer bus packets with
 * a route + direction, ALU/MUL ops inject CPU-tile power, systolic dispatch
 * drives the CPU→TPU route. When the program is halted or paused NOTHING is
 * emitted — zero decorative packet loops.
 */

/** Bus routes matching `Bay3Soc.buildBusFabric` (index order = route id). */
export const BUS_ROUTES = Object.freeze(['mem-cpu', 'mem-tpu', 'mem-gpu', 'cpu-tpu', 'tpu-gpu']);

/**
 * The runner surface Bay 3 consumes (structural — engines are injected).
 * @typedef {object} SocLiveRunner
 * @property {() => unknown} play
 * @property {() => unknown} pause
 * @property {() => { event: SocLiveEvent | null, state: unknown }} step
 * @property {() => unknown} reset
 * @property {(dt: number) => SocLiveEvent[]} tick
 * @property {(count?: number) => SocLiveEvent[]} systolicDispatch
 * @property {(kind: 'asm' | 'forth' | 'cbinary') => unknown} loadProgram
 * @property {() => Record<string, unknown> & { running: boolean, halted: boolean, packetsEmitted: number }} state
 */

/**
 * One executed-instruction event (structural).
 * @typedef {object} SocLiveEvent
 * @property {string} kind 'load' | 'store' | 'alu' | 'mul' | 'branch' | 'jump' | 'systolic' | 'system'
 * @property {number} [addr] effective data address (loads/stores)
 * @property {number} [cycles] cycle cost of the instruction
 * @property {number} [pc] instruction address
 * @property {string} [note] engine note
 * @property {number} [packetsEmitted] running packet counter
 */

/** Route index + traversal direction for a packet on the interposer. */
export function packetRouteFor(event) {
  switch (event.kind) {
    case 'load':
      // CPU loads from unified memory: memory → CPU (bus-0 forward).
      return { route: 0, dir: 1 };
    case 'store':
      // CPU stores to unified memory: CPU → memory (bus-0 reverse).
      return { route: 0, dir: -1 };
    case 'systolic':
      // Systolic dispatch: CPU → TPU (bus-3).
      return { route: 3, dir: 1 };
    case 'gpu-dispatch':
      return { route: 2, dir: 1 };
    default:
      // ALU/MUL/branch/jump never touch the interposer — no packet.
      return null;
  }
}

/** The built-in programs. The C binary is the -O0 RV32IM compilation of the
 * C source in the comment (machine words assembled with the same `asm`
 * helpers the kernel test bench uses — a real executable binary, not prose). */
export const PROGRAMS = Object.freeze({
  asm: {
    kind: 'asm',
    label: 'RV32IM Assembly',
    source: [
      '# sum 1..10 with a memory round-trip per iteration',
      'addi x5, x0, 0      # acc = 0',
      'addi x6, x0, 10     # i = 10',
      'loop:',
      '  sw   x5, 256(x0)  # store partial acc  → mem packet',
      '  lw   x7, 256(x0)  # load it back       ← mem packet',
      '  add  x5, x5, x6   # acc += i',
      '  addi x6, x6, -1   # i -= 1',
      '  bne  x6, x0, loop',
      'halt                # addi x0, x0, 1 sentinel',
    ],
  },
  forth: {
    kind: 'forth',
    label: 'Forth',
    source: [
      '# memory round-trip + stack arithmetic',
      '5 256 !   7 257 !   # store two cells',
      '256 @ .             # load + print 5',
      '257 @ .             # load + print 7',
      '256 @ 257 @ + .     # load both, add → print 12 (stack empty at end)',
    ],
    tokens: ['5', '256', '!', '256', '@', '.', '7', '257', '!', '257', '@', '.', '256', '@', '257', '@', '+', '.'],
  },
  cbinary: {
    kind: 'cbinary',
    label: 'C binary (RV32IM)',
    cSource: [
      '// acc = 0; for (i = 5; i != 0; --i) acc += 2 * i;   // 30',
      '// mem[512/4] = acc;                                  // sw x5, 512(x0)',
      '// compiled -O0 → RV32IM machine words (asm helpers)',
    ],
    words: null, // assembled in the factory (needs `asm`)
  },
});

function isMemToken(tok) {
  return tok === '@' || tok === '!';
}

/**
 * Create the live runner. Engines are injected:
 * @param {object} engines `{ createRV32, asm, createForth }` from packages/chip-engine
 * @param {object} [hooks] `{ onPower?: (watts: number) => void }` — per-tile
 *        power/thermal injection for executed instructions (real coupling).
 */
export function createLiveRunner(engines, hooks = {}) {
  const { createRV32, asm, createForth } = engines;
  if (typeof createRV32 !== 'function' || typeof createForth !== 'function' || !asm) {
    throw new Error('liveExec: chip engines must be injected (createRV32/asm/createForth)');
  }

  const INSTRUCTIONS_PER_SECOND = 120; // deterministic playback speed (2 inst/frame @ 60 FPS)
  const PROGRAM_BASE = 0; // code at 0; data window at 256 (byte addr, word 64)

  let kind = null;
  let cpu = null;
  let forth = null;
  let tokens = [];
  let tokenIndex = 0;
  let running = false;
  let halted = false;
  let acc = 0; // fractional instruction accumulator for play mode
  let packetsEmitted = 0;
  let recent = []; // bounded recent events (last 64)
  let stats = { instructions: 0, loads: 0, stores: 0, alu: 0, mul: 0, branches: 0, systolic: 0 };

  function resetStats() {
    packetsEmitted = 0;
    stats = { instructions: 0, loads: 0, stores: 0, alu: 0, mul: 0, branches: 0, systolic: 0 };
    recent = [];
  }

  /** Decode the effective data address of a load/store BEFORE executing. */
  function dataAddressOf(inst) {
    const opcode = inst & 0x7f;
    const rs1 = (inst >>> 15) & 0x1f;
    const immI = ((inst >>> 20) << 20) >> 20;
    const immS = ((((inst >>> 25) & 0x7f) << 5) | ((inst >>> 7) & 0x1f)) << 20 >> 20;
    if (opcode === 0x03) return (cpu.regs[rs1] + immI) | 0;
    if (opcode === 0x23) return (cpu.regs[rs1] + immS) | 0;
    return null;
  }

  function emit(event) {
    // Only packet-bearing events (loads/stores/systolic) advance the packet
    // counter — ALU/MUL/branch/jump stay on the CPU tile.
    const packet = event.kind === 'load' || event.kind === 'store' || event.kind === 'systolic';
    if (packet) event.packetsEmitted = ++packetsEmitted;
    recent.push(event);
    if (recent.length > 64) recent.shift();
    return event;
  }

  /** Execute exactly one instruction of the loaded program. */
  function stepOne() {
    if (halted || (!cpu && !forth)) return null;
    if (kind === 'asm' || kind === 'cbinary') {
      const inst = cpu.mem[cpu.pc] >>> 0 | (cpu.mem[cpu.pc + 1] << 8) >>> 0 | (cpu.mem[cpu.pc + 2] << 16) >>> 0 | (cpu.mem[cpu.pc + 3] << 24) >>> 0;
      const opcode = inst & 0x7f;
      const addr = dataAddressOf(inst);
      const isMul = opcode === 0x33 && ((inst >>> 25) & 0x7f) === 1;
      const before = { pc: cpu.pc, cycles: cpu.cycles };
      const out = cpu.step();
      if (!out) return null; // already halted
      stats.instructions += 1;
      let event = null;
      if (out.note === 'lw') {
        stats.loads += 1;
        event = emit({ kind: 'load', addr, cycles: cpu.cycles - before.cycles, pc: before.pc });
      } else if (out.note === 'sw') {
        stats.stores += 1;
        event = emit({ kind: 'store', addr, cycles: cpu.cycles - before.cycles, pc: before.pc });
      } else if (isMul) {
        stats.mul += 1;
        event = emit({ kind: 'mul', cycles: cpu.cycles - before.cycles, pc: before.pc });
        if (hooks.onPower) hooks.onPower(0.8); // MUL MAC row switching (W-scale visual injection)
      } else if (out.note === 'halt') {
        halted = true;
        running = false;
        event = emit({ kind: 'system', note: 'halt', pc: before.pc });
      } else if (out.note.startsWith('branch')) {
        stats.branches += 1;
        event = emit({ kind: 'branch', cycles: cpu.cycles - before.cycles, pc: before.pc });
      } else {
        stats.alu += 1;
        event = emit({ kind: 'alu', cycles: cpu.cycles - before.cycles, pc: before.pc });
        if (hooks.onPower) hooks.onPower(0.15);
      }
      return event;
    }
    // Forth: one token per step.
    if (tokenIndex >= tokens.length) {
      halted = true;
      running = false;
      return emit({ kind: 'system', note: 'halt' });
    }
    const tok = tokens[tokenIndex++];
    const before = forth.cycles;
    const dataBefore = forth.data.length;
    // Forth @/! pop the address operand — capture it BEFORE execution so the
    // memory-transaction packet carries the real effective byte address.
    const addrOperand = isMemToken(tok) ? forth.data[forth.data.length - 1] ?? 0 : null;
    forth.run([tok]);
    stats.instructions += 1;
    const isMem = tok === '@' || tok === '!';
    const isAlu = ['+', '-', '*', 'AND', 'OR', 'XOR'].includes(tok);
    // (addrOperand captured above when isMem)
    let event;
    if (isMem) {
      // Forth memory access: the address cell is the popped operand.
      event = emit({ kind: tok === '@' ? 'load' : 'store', addr: addrOperand * 4, cycles: forth.cycles - before, cell: tok });
      if (tok === '@') stats.loads += 1;
      else stats.stores += 1;
    } else if (isAlu) {
      event = emit({ kind: 'alu', cycles: forth.cycles - before, stackDepth: forth.data.length, stackTop: forth.data[dataBefore - 1] ?? null, token: tok });
      stats.alu += 1;
      if (hooks.onPower) hooks.onPower(0.15);
    } else {
      event = emit({ kind: 'alu', cycles: forth.cycles - before, stackDepth: forth.data.length, token: tok });
      stats.alu += 1;
    }
    void dataBefore;
    return event;
  }

  return {
    /** Load (or reload) a program; resets all state. */
    loadProgram(programKind) {
      if (!PROGRAMS[programKind]) throw new Error(`liveExec: unknown program kind "${programKind}"`);
      kind = programKind;
      running = false;
      halted = false;
      acc = 0;
      tokenIndex = 0;
      tokens = [];
      resetStats();
      if (kind === 'asm') {
        cpu = createRV32({ pcStart: PROGRAM_BASE, memoryBytes: 4096 });
        cpu.load(
          [
            asm.opImm(0, 5, 0, 0), // addi x5, x0, 0
            asm.opImm(0, 6, 0, 10), // addi x6, x0, 10
            asm.S(256, 5, 0, 2, 0x23), // sw x5, 256(x0)
            asm.I(256, 0, 2, 7, 0x03), // lw x7, 256(x0)
            asm.R(0, 6, 5, 0, 5, 0x33), // add x5, x5, x6
            asm.opImm(0, 6, 6, -1), // addi x6, x6, -1
            asm.B(-16, 0, 6, 1, 0x63), // bne x6, x0, loop (back to sw @ pc=8)
            asm.halt(),
          ],
          PROGRAM_BASE
        );
        forth = null;
      } else if (kind === 'cbinary') {
        // -O0 compilation of the documented C loop (MUL exercised).
        cpu = createRV32({ pcStart: PROGRAM_BASE, memoryBytes: 4096 });
        cpu.load(
          [
            asm.opImm(0, 5, 0, 0), // acc = 0
            asm.opImm(0, 6, 0, 5), // i = 5
            asm.opImm(0, 7, 0, 2), // c = 2
            asm.R(1, 6, 7, 0, 7, 0x33), // mul x7, x7, i
            asm.R(0, 7, 5, 0, 5, 0x33), // acc += 2*i
            asm.opImm(0, 6, 6, -1), // i -= 1
            asm.B(-16, 0, 6, 1, 0x63), // bne i, x0, loop (back to addi x7 @ pc=8)
            asm.S(512, 5, 0, 2, 0x23), // sw acc, 512(x0)
            asm.halt(),
          ],
          PROGRAM_BASE
        );
        forth = null;
      } else {
        forth = createForth({ cellBits: 16, memoryCells: 256, stackDepth: 32 });
        tokens = PROGRAMS.forth.tokens;
        cpu = null;
      }
      return this.state();
    },

    /** Play: execute instructions continuously (tick-driven). */
    play() {
      if (halted) return this.state();
      running = true;
      return this.state();
    },

    /** Pause playback. */
    pause() {
      running = false;
      return this.state();
    },

    /** Step exactly one instruction (one retired instruction). */
    step() {
      running = false;
      const event = stepOne();
      return { event, state: this.state() };
    },

    /** Reset to the freshly-loaded program state. */
    reset() {
      const k = kind;
      running = false;
      halted = false;
      acc = 0;
      if (k) this.loadProgram(k);
      return this.state();
    },

    /**
     * Frame tick (driven by bay3.update). Executes floor(dt·IPS) new
     * instructions while playing and returns their events (bounded).
     * @param {number} dt seconds
     * @returns {Array<object>} execution events (may be empty — halted/paused)
     */
    tick(dt) {
      const events = [];
      if (!running || halted) return events;
      acc += dt * INSTRUCTIONS_PER_SECOND;
      let n = Math.floor(acc);
      if (n > 24) n = 24; // bounded per frame (60 FPS budget)
      acc -= n;
      for (let i = 0; i < n; i++) {
        const event = stepOne();
        if (event) events.push(event);
        if (halted) break;
      }
      return events;
    },

    /** Systolic dispatch events (TPU workload path → CPU→TPU packets). */
    systolicDispatch(count = 1) {
      const events = [];
      for (let i = 0; i < count; i++) {
        events.push(emit({ kind: 'systolic', cycles: 1 }));
        stats.systolic += 1;
        if (hooks.onPower) hooks.onPower(2.5);
      }
      return events;
    },

    /** Snapshot of the runner state (register/PC/stack inspector readouts). */
    state() {
      const base = {
        kind,
        running,
        halted,
        packetsEmitted,
        stats: { ...stats },
        recent: [...recent],
      };
      if (kind === 'asm' || kind === 'cbinary') {
        return {
          ...base,
          pc: cpu.pc,
          x5: cpu.regs[5],
          x6: cpu.regs[6],
          x7: cpu.regs[7],
          cycles: cpu.cycles,
          retired: cpu.retired,
          memWordAt: (addr) => cpu.mem[addr] | (cpu.mem[addr + 1] << 8) | (cpu.mem[addr + 2] << 16) | (cpu.mem[addr + 3] << 24),
        };
      }
      if (kind === 'forth') {
        return {
          ...base,
          cycles: forth.cycles,
          stack: forth.data,
          stackDepth: forth.data.length,
          output: forth.output,
        };
      }
      return base;
    },
  };
}

/** True when the runner produces no new events (halted/paused) — the packet
 * system drains to zero and stays there. */
export function isIdle(runnerState) {
  return !runnerState.running || runnerState.halted;
}
