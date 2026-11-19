#!/usr/bin/env node
/**
 * Optional physics-kernel daemon: attaches a locally installed ngspice to the
 * Electrophysics Lab 3D client over WebSocket (default ws://localhost:8765).
 *
 * The client works fully offline with its built-in MNA solver; when this
 * daemon is running, the client can request cross-check runs against real
 * ngspice for the same netlist (evidence: crossSolver, never claimed as
 * physical validation).
 *
 * Usage:
 *   npm i ws          # once, in this folder (optional dependency)
 *   npm start
 *
 * Protocol (JSON):
 *   ← {type:"spice", netlist:"* full SPICE deck *", id:"..."}
 *   → {type:"spiceResult", id:"...", ok:true, stdout:"..."} | {type:"error", ...}
 *   → {type:"hello", ngspice:"<path or null>"}
 */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFileSync, rmSync } from 'node:fs';

const PORT = Number(process.env.PHYSICS_KERNEL_PORT ?? 8765);

function resolveNgspice() {
  if (process.env.NGSPICE_PATH) return process.env.NGSPICE_PATH;
  return null; // explicit-path-only resolution, matching js/bench policy
}

const ngspicePath = resolveNgspice();

let WebSocketServer;
try {
  const mod = await import('ws');
  WebSocketServer = mod.WebSocketServer;
} catch {
  console.error('[physics-kernel] The optional "ws" package is not installed.');
  console.error('           Run `npm i ws` in services/physics-kernel and retry.');
  process.exit(2);
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[physics-kernel] listening on ws://localhost:${PORT}`);
console.log(`[physics-kernel] ngspice: ${ngspicePath ?? '(not found — set NGSPICE_PATH to enable)'}`);

function runNgspice(deck, onDone) {
  if (!ngspicePath) {
    onDone(new Error('ngspice not available — set NGSPICE_PATH'));
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), 'physics-kernel-'));
  const deckPath = join(dir, 'deck.cir');
  const outPath = join(dir, 'out.txt');
  writeFileSync(deckPath, deck.includes('-o out.txt') ? deck : `${deck}\n.control\nprint all\n.endc\n`);
  const child = spawn(ngspicePath, ['-b', deckPath], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  child.stdout.on('data', (d) => (stdout += d));
  child.stderr.on('data', (d) => (stdout += d));
  child.on('close', () => {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* temp cleanup best-effort */
    }
    onDone(null, stdout);
  });
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'hello', ngspice: ngspicePath }));
  socket.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      socket.send(JSON.stringify({ type: 'error', error: 'bad json' }));
      return;
    }
    if (msg.type === 'spice' && typeof msg.netlist === 'string') {
      runNgspice(msg.netlist, (err, stdout) => {
        if (err) socket.send(JSON.stringify({ type: 'spiceResult', id: msg.id, ok: false, error: err.message }));
        else socket.send(JSON.stringify({ type: 'spiceResult', id: msg.id, ok: true, stdout }));
      });
    } else {
      socket.send(JSON.stringify({ type: 'error', error: `unknown message type ${msg.type}` }));
    }
  });
});
