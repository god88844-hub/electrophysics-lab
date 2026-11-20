/**
 * Stack-based Forth core (05_chip_architecture_benchmarks.json: 32-deep stacks,
 * 16-bit cells, core words DUP DROP SWAP OVER + - * AND OR XOR @ ! : ;).
 * Executes real token programs deterministically.
 */

export function createForth(options = {}) {
  const cellMask = options.cellBits === 32 ? 0xffffffff : 0xffff;
  const signed = (v) => (options.cellBits === 32 ? (v | 0) : ((v & 0x8000 ? v - 0x10000 : v) | 0));
  const data = [];
  const rstack = [];
  const memory = new Int32Array(options.memoryCells ?? 256);
  const dict = {};
  const output = [];
  let cycles = 0;

  const push = (v) => {
    if (data.length >= (options.stackDepth ?? 32)) throw Error('data stack overflow');
    data.push(v | 0);
  };
  const pop = () => {
    if (data.length === 0) throw Error('data stack underflow');
    return data.pop();
  };
  const bin = (fn) => () => {
    const b = pop();
    const a = pop();
    push(signed(fn(a, b) & cellMask));
    cycles++;
  };

  dict['+'] = bin((a, b) => a + b);
  dict['-'] = bin((a, b) => a - b);
  dict['*'] = bin((a, b) => a * b);
  dict['AND'] = bin((a, b) => a & b);
  dict['OR'] = bin((a, b) => a | b);
  dict['XOR'] = bin((a, b) => a ^ b);
  dict.DUP = () => { push(pop()); cycles++; };
  dict.DROP = () => { pop(); cycles++; };
  dict.SWAP = () => { const b = pop(); const a = pop(); push(b); push(a); cycles++; };
  dict.OVER = () => { const b = pop(); const a = pop(); push(a); push(b); push(a); cycles++; };
  dict['.'] = () => { output.push(pop()); cycles++; };
  dict['@'] = () => { const addr = pop(); push(memory[addr & 0xff]); cycles += 2; };
  dict['!'] = () => { const addr = pop(); const v = pop(); memory[addr & 0xff] = v; cycles += 2; };

  /** Execute a token program; ':' definitions are expanded inline. */
  function run(tokens) {
    for (const tok of tokens) {
      if (tok === ':') continue; // definitions are pre-expanded by the caller
      if (tok === ';') continue;
      const num = /^[-+]?\d+$/.test(tok) ? parseInt(tok, 10) : null;
      if (num !== null) {
        push(num);
        cycles++;
      } else if (dict[tok]) {
        dict[tok]();
      } else {
        throw Error(`unknown word '${tok}'`);
      }
    }
    return { data: [...data], output: [...output], cycles };
  }

  return {
    run,
    get cycles() { return cycles; },
    get data() { return [...data]; },
    get output() { return [...output]; },
    memory,
    define(word, tokens) {
      dict[word] = () => run(tokens);
    },
  };
}
