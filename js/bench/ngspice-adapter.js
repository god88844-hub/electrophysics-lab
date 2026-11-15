// ngspice-adapter.js — executes the real Ngspice binary as a separate process
// and parses machine-readable output. This is the independent reference —
// no Invention Lab code participates in producing its numbers.
//
// Output formats (verified empirically against ngspice-47):
//   - `.control ... op print v(n)` lines look like:  v(n_mid) = 2.500000e+00
//   - `wrdata file v(out)` writes bare numeric rows; EACH requested vector
//     contributes an (x, y) column PAIR:  x1 y1 x2 y2 ...
//   - CAUTION: in wrdata, vp() is written in RADIANS (print uses degrees).
//     The parser exposes raw values and documents this here; unit conversion
//     is the benchmark case's responsibility.

import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const DEFAULT_TIMEOUT_MS = 30_000;

export function defaultNgspicePaths() {
  const candidates = [];
  if (process.env.NGSPICE_EXEC) candidates.push(process.env.NGSPICE_EXEC);
  if (process.platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\ngspice\\bin\\ngspice_con.exe',
      'C:\\Program Files (x86)\\ngspice\\bin\\ngspice_con.exe',
    );
    // repo-local portable install (see docs/BENCHMARKING.md)
    candidates.push(path.resolve('tools/ngspice-47/Spice64/bin/ngspice_con.exe'));
  } else {
    candidates.push('/usr/bin/ngspice', '/usr/local/bin/ngspice');
  }
  return candidates;
}

export async function resolveNgspice(explicitPath) {
  const candidates = explicitPath ? [explicitPath, ...defaultNgspicePaths()] : defaultNgspicePaths();
  for (const exe of candidates) {
    try {
      const { version } = await ngspiceVersion(exe);
      return { exe, version };
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function ngspiceVersion(exe) {
  const r = await runNgspice({ exe, deck: '* version probe', timeoutMs: 15_000, bare: true });
  const m = (r.stdout || '').match(/\*\*\s*ngspice-(\d+[^:\s]*)/);
  if (!m) throw new Error(`could not determine ngspice version (stdout: ${(r.stdout || '').slice(0, 120)})`);
  return { version: m[1] };
}

/**
 * Run a deck in batch mode. Uses execFile-style spawning (no shell) so deck
 * content cannot inject shell commands; the deck is passed as a temp FILE.
 * Returns { stdout, stderr, code, timedOut, artifacts }.
 */
export async function runNgspice({ exe, deck, timeoutMs = DEFAULT_TIMEOUT_MS, bare = false }) {
  const dir = await mkdtemp(path.join(tmpdir(), 'il-bench-ngspice-'));
  const deckPath = path.join(dir, 'bench.cir');
  await writeFile(deckPath, deck, 'utf8');
  const args = bare ? ['--version'] : ['-b', '-o', 'run.log', deckPath];
  const t0 = Date.now();
  return new Promise((resolve) => {
    let stdout = '', stderr = '', timedOut = false;
    let child;
    try {
      child = spawn(exe, args, { cwd: dir, windowsHide: true });
    } catch (e) {
      resolve({ status: 'reference-unavailable', error: `spawn failed: ${e.message}` });
      return;
    }
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch { /* already gone */ }
    }, timeoutMs);
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', (e) => {
      clearTimeout(timer);
      const missing = e.code === 'ENOENT';
      resolve({ status: missing ? 'reference-unavailable' : 'reference-failure', error: e.message });
    });
    child.on('close', async (code) => {
      clearTimeout(timer);
      let log = '';
      try { log = await readFile(path.join(dir, 'run.log'), 'utf8'); } catch { /* optional */ }
      // collect any wrdata artifacts written into the temp dir
      const artifacts = {};
      try {
        const { readdir } = await import('node:fs/promises');
        for (const f of await readdir(dir)) {
          if (f.endsWith('.txt')) artifacts[f] = await readFile(path.join(dir, f), 'utf8');
        }
      } catch { /* ignore */ }
      resolve({
        status: timedOut ? 'timeout' : 'ok',
        code, stdout, stderr, log, timedOut, artifacts, workdir: dir,
        // batch mode (-o run.log) sends command output (print etc.) to the log,
        // not stdout — fullText is what parsers should read
        fullText: stdout + '\n' + log,
        durationMs: Date.now() - t0,
      });
    });
  });
}

/** detect real Ngspice failures in its output (convergence, syntax, etc.) */
export function detectNgspiceFailure(result) {
  const text = `${result.stderr || ''}\n${result.stdout || ''}\n${result.log || ''}`;
  if (result.timedOut) return 'Ngspice timed out';
  if (result.status === 'reference-unavailable') return 'Ngspice executable not found';
  if (result.status === 'reference-failure') return `Ngspice failed to start: ${result.error}`;
  const patterns = [
    /failed to converge/i,
    /\berror\b.*:/i,
    /no such (device|parameter|vector|file)/i,
    /unknown (subcircuit|device|parameter)/i,
    /syntax error/i,
    /there aren't any circuits/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return `Ngspice reported a problem: "${m[0]}"`;
  }
  if (typeof result.code === 'number' && result.code !== 0 && !result.stdout.includes('quit')) {
    return `Ngspice exited with code ${result.code}`;
  }
  return null;
}

/**
 * Parse `.control op print ...` style lines for ANY vector:
 *     v(n_mid) = 2.500000e+00
 *     i(vchipammeter1) = 5.000000e-02
 * Returns { '<vector>': value, ... } with lowercased keys.
 */
export function parsePrints(stdout) {
  const out = {};
  const re = /^([a-z][\w().]*)\s*=\s*([-+0-9.eE]+)\s*$/;
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.trim().match(re);
    if (m) out[m[1].toLowerCase()] = parseFloat(m[2]);
  }
  if (Object.keys(out).length === 0) {
    throw new Error('no "vector = value" lines found in Ngspice output (malformed or empty .op result)');
  }
  return out;
}

/** Parse only v() node-voltage prints (subset of parsePrints). */
export function parseOp(stdout) {
  const all = parsePrints(stdout);
  const out = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith('v(')) out[k.slice(2, -1)] = v;
  }
  if (Object.keys(out).length === 0) {
    throw new Error('no v() = value lines found in Ngspice output (malformed or empty .op result)');
  }
  return out;
}

/**
 * Parse a wrdata file. Each requested vector contributes an (x, y) column
 * PAIR, so columns = [x1, y1, x2, y2, ...] interleaved. Returns
 * { series: [ { x: [{x, y}], ... } ] } — one series per requested vector.
 * Throws on malformed rows (odd column counts, non-numeric data).
 */
export function parseWrdata(text, expectedVectors = 1) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const nums = t.split(/\s+/).map(parseFloat);
    if (nums.some((n) => !Number.isFinite(n))) {
      throw new Error(`malformed wrdata row (non-numeric field): "${t.slice(0, 80)}"`);
    }
    if (nums.length !== expectedVectors * 2) {
      throw new Error(`wrdata row has ${nums.length} columns, expected ${expectedVectors * 2} (x/y pairs for ${expectedVectors} vectors)`);
    }
    rows.push(nums);
  }
  if (rows.length === 0) throw new Error('wrdata output is empty');
  const series = [];
  for (let v = 0; v < expectedVectors; v++) {
    const xs = 2 * v, ys = 2 * v + 1;
    series.push(rows.map((r) => ({ x: r[xs], y: r[ys] })));
  }
  return { series, rowCount: rows.length };
}

/** build a deck from lines (helper keeps case definitions readable) */
export function deck(...lines) {
  return `* Invention Lab benchmark deck\n${lines.join('\n')}\n`;
}
