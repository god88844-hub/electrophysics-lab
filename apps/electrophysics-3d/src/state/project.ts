// @ts-nocheck
/**
 * WP-1.3 — `.eplab` project persistence (Save / Open / Auto-save).
 *
 * Implements `docs/master-plan/schemas/eplab-project.schema.json`:
 *  - serialize the four workspaces (components / wires / probes / quantum
 *    circuit) plus the committed session slice into the versioned container,
 *  - SHA-256 seal over the canonical payload + `referenceLibraryLockedAt`
 *    snapshot (the MANIFEST `generatedAt` at save time), recomputed on every
 *    mutation batch (explicit save AND every auto-save tick),
 *  - fail-closed Open: schema validation + exact seal re-hash + library
 *    snapshot check — a corrupt or tampered `.eplab` is refused with the
 *    precise mismatch reason; state is never partially applied.
 *
 * Runtime surfaces:
 *  - desktop (Tauri shell detected): native save/open dialogs via the WP-1.1
 *    `desktopBridge.openNativeFileDialog`, then file bytes through the
 *    feature-detected `__TAURI__.fs` surface; when the shell does not expose
 *    an fs surface yet the transport degrades to the web one with an honest
 *    status (same policy as WP-1.1's typed bridge).
 *  - web (`npm run dev`, `vite preview`, Playwright): explicit save →
 *    `.eplab` download; open → file input upload; auto-save → localStorage.
 *
 * This module is deliberately IMPORT-FREE pure JavaScript with JSDoc types:
 * the same bytes typecheck as TypeScript for the app bundle and are imported
 * verbatim by `tests/wp13-eplab-project.test.mjs` on Node 20/22/24 (data-URL
 * import) — the tests and the app can never drift. `@ts-nocheck` keeps
 * `tsc` quiet about the (intentional) lack of syntax-level annotations:
 * types are specified in JSDoc and the runtime behavior is sealed by the
 * WP-1.3 unit + Playwright suites.
 *
 * Transient tool state (activeTool, placingKind, pendingWireFrom, hover,
 * cursor, live probe samples, physics/quantum telemetry) is never serialized:
 * auto-save serializes the current *committed* state only (PHASE_01 failure
 * mode: "Auto-save races with undo/redo → auto-save serializes the current
 * committed history head only").
 */

/** Schema format const (`eplab-project.schema.json`). */
export const EPLAB_FORMAT = 'invention-lab/eplab-project/1';

/** localStorage key for the 30 s / blur auto-save (web transport). */
export const AUTOSAVE_KEY = 'eplab.autosave.v1';

/** Workspace ids in the container (schema enum, fixed order for round-trips). */
export const WORKSPACE_IDS = ['quantum', 'silicon', 'soc', 'library'];

/**
 * Validation failure — thrown, never returned as a partial state.
 * The `message` is the precise fail-closed reason shown in the UI.
 */
export class EplabValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EplabValidationError';
  }
}

/**
 * Deterministic JSON with recursively sorted object keys — the canonical
 * byte form the seal hashes. Two structurally equal objects always seal to
 * the same digest regardless of insertion order.
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((v) => canonicalJson(v)).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
}

/**
 * SHA-256 hex of a UTF-8 string (WebCrypto — browser and Node ≥ 20).
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function sha256Hex(text) {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) throw new EplabValidationError('SHA-256 unavailable: no WebCrypto subtle surface in this runtime');
  const bytes = new TextEncoder().encode(text);
  const digest = await subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * The payload slice the seal covers — every container property except
 * `integrity` itself, in the fixed closed property set.
 * @param {Record<string, unknown>} project
 * @returns {Record<string, unknown>}
 */
export function sealPayloadOf(project) {
  return {
    format: project.format,
    formatVersion: project.formatVersion,
    createdAt: project.createdAt,
    modifiedAt: project.modifiedAt,
    name: project.name,
    workspaces: project.workspaces,
    experiments: project.experiments,
    autoSave: project.autoSave,
    session: project.session,
  };
}

/** PBR-free committed-state snapshot handed to `buildEplabProject`. */
export function snapshotFromState(state, wires) {
  return {
    components: state.sandboxComponents,
    wires,
    probes: state.probes.map((p) => ({ targetId: p.targetId, color: p.color })),
    quantum: {
      pulses: {
        amplitude: state.pulseParams.amplitude,
        sigmaNs: state.pulseParams.sigmaNs,
        beta: state.pulseParams.beta,
      },
      modality: state.bay1Mode,
    },
    experiments: state.quantumExp && state.quantumExp.bundle ? [state.quantumExp.bundle] : [],
    session: {
      workspace: state.workspace,
      vddSlider: state.vddSlider,
      drivePowerMW: state.drivePowerMW,
      bay1Mode: state.bay1Mode,
      npuAttached: state.npuAttached,
      peelDepth: state.peelDepth,
      sandboxOpen: state.sandboxOpen,
      activeBay: state.activeBay,
    },
  };
}

/**
 * Extract the Manhattan traces from the rendered sandbox group — trace mesh
 * names are `trace-<fromId>-<toId>` (world.ts `addManhattanTrace`).
 * Accepts any object with `getObjectByName` (a THREE.Group in the app).
 * @param {{ getObjectByName?: (name: string) => { name?: string } | undefined }} group
 * @returns {Array<{ from: string, to: string }>}
 */
export function wiresFromSandboxGroup(group) {
  const sandbox = group && typeof group.getObjectByName === 'function' ? group.getObjectByName('sandbox-group') : null;
  const wires = [];
  if (!sandbox || !Array.isArray(sandbox.children)) return wires;
  for (const child of sandbox.children) {
    const name = typeof child.name === 'string' ? child.name : '';
    if (!name.startsWith('trace-')) continue;
    const rest = name.slice('trace-'.length);
    const sep = rest.indexOf('-');
    if (sep <= 0 || sep === rest.length - 1) continue;
    wires.push({ from: rest.slice(0, sep), to: rest.slice(sep + 1) });
  }
  return wires;
}

/**
 * Build a sealed `.eplab` container from a committed-state snapshot.
 * The seal covers the canonical payload bytes (closed property set) —
 * recomputed on EVERY mutation batch (explicit save and auto-save alike).
 *
 * @param {ReturnType<typeof snapshotFromState>} snapshot
 * @param {{ name: string, nowIso?: string, createdAtIso?: string, referenceLibraryLockedAt: string, autoSave?: boolean }} opts
 * @returns {Promise<{ project: Record<string, unknown>, payloadSHA256: string, bytes: string }>}
 */
export async function buildEplabProject(snapshot, opts) {
  const nowIso = opts.nowIso || new Date().toISOString();
  const name = typeof opts.name === 'string' && opts.name.length > 0 ? opts.name : 'untitled';
  if (name.length > 120) throw new EplabValidationError('project name exceeds the 120-character schema limit');
  if (typeof opts.referenceLibraryLockedAt !== 'string' || opts.referenceLibraryLockedAt.length === 0) {
    throw new EplabValidationError('referenceLibraryLockedAt snapshot (MANIFEST generatedAt) is required to seal a project');
  }

  const components = Array.isArray(snapshot.components) ? snapshot.components : [];
  const workspaces = WORKSPACE_IDS.map((id) => ({
    id,
    components: id === 'silicon' ? components : [],
    wires: id === 'silicon' ? (snapshot.wires || []) : [],
    probes: id === 'silicon' ? snapshot.probes.map((p) => p.targetId + '|' + p.color) : [],
    ...(id === 'quantum' ? { quantumCircuit: snapshot.quantum } : {}),
  }));

  const project = {
    format: EPLAB_FORMAT,
    formatVersion: 1,
    createdAt: opts.createdAtIso || nowIso,
    modifiedAt: nowIso,
    name,
    workspaces,
    experiments: Array.isArray(snapshot.experiments) ? snapshot.experiments : [],
    autoSave: opts.autoSave !== false,
    session: snapshot.session,
    integrity: null,
  };
  const payload = sealPayloadOf(project);
  const payloadSHA256 = await sha256Hex(canonicalJson(payload));
  project.integrity = {
    payloadSHA256,
    algorithm: 'SHA-256',
    referenceLibraryLockedAt: opts.referenceLibraryLockedAt,
  };
  return { project, payloadSHA256, bytes: canonicalJson(project) };
}

// ---------------------------------------------------------------------------
// Validation — fail closed, ordered checks, precise reasons, never partial.
// (Closed property sets: stricter than the JSON Schema's open
// `additionalProperties`, so the seal covers every byte of meaning.)
// ---------------------------------------------------------------------------

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function requireClosedProps(obj, allowed, where) {
  for (const k of Object.keys(obj)) {
    if (!allowed.includes(k)) throw new EplabValidationError(`${where}: unexpected property "${k}" (closed container contract)`);
  }
}

function requireIsoDate(value, where) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) {
    throw new EplabValidationError(`${where}: not an ISO date-time string`);
  }
}

function requireSealedContainer(json) {
  if (!isPlainObject(json)) throw new EplabValidationError('Open refused: file is not a JSON object');
  requireClosedProps(json, ['format', 'formatVersion', 'createdAt', 'modifiedAt', 'name', 'workspaces', 'experiments', 'autoSave', 'session', 'integrity'], 'container');
  if (json.format !== EPLAB_FORMAT) {
    throw new EplabValidationError(`Open refused: format "${String(json.format)}" is not ${EPLAB_FORMAT}`);
  }
  if (!Number.isInteger(json.formatVersion) || json.formatVersion < 1) {
    throw new EplabValidationError('Open refused: formatVersion must be an integer ≥ 1');
  }
  requireIsoDate(json.createdAt, 'createdAt');
  requireIsoDate(json.modifiedAt, 'modifiedAt');
  if (typeof json.name !== 'string' || json.name.length === 0 || json.name.length > 120) {
    throw new EplabValidationError('Open refused: name must be a non-empty string ≤ 120 chars');
  }
  if (!Array.isArray(json.workspaces) || json.workspaces.length !== WORKSPACE_IDS.length) {
    throw new EplabValidationError(`Open refused: workspaces must list exactly ${WORKSPACE_IDS.length} workspaces`);
  }
  const seen = [];
  for (const ws of json.workspaces) {
    if (!isPlainObject(ws)) throw new EplabValidationError('Open refused: workspace entries must be objects');
    requireClosedProps(ws, ['id', 'components', 'wires', 'probes', 'quantumCircuit'], 'workspace');
    if (!WORKSPACE_IDS.includes(ws.id)) throw new EplabValidationError(`Open refused: unknown workspace id "${String(ws.id)}"`);
    if (seen.includes(ws.id)) throw new EplabValidationError(`Open refused: duplicate workspace "${ws.id}"`);
    seen.push(ws.id);
    if (!Array.isArray(ws.components)) throw new EplabValidationError(`Open refused: workspace ${ws.id} components must be an array`);
    for (const c of ws.components) {
      if (!isPlainObject(c)) throw new EplabValidationError(`Open refused: workspace ${ws.id} has a non-object component`);
      requireClosedProps(c, ['id', 'kind', 'params', 'nodes', 'position', 'label'], 'component');
      if (typeof c.id !== 'string' || !/^[a-z0-9_\-]+$/.test(c.id)) {
        throw new EplabValidationError(`Open refused: component id "${String(c.id)}" violates the schema pattern ^[a-z0-9_\\-]+$`);
      }
      if (typeof c.kind !== 'string' || c.kind.length === 0) throw new EplabValidationError(`Open refused: component ${c.id} has no kind`);
      if (c.params !== undefined && !isPlainObject(c.params)) throw new EplabValidationError(`Open refused: component ${c.id} params must be an object`);
      if (!Array.isArray(c.nodes) || c.nodes.some((n) => typeof n !== 'string')) {
        throw new EplabValidationError(`Open refused: component ${c.id} nodes must be an array of strings`);
      }
      if (!Array.isArray(c.position) || c.position.length < 2 || c.position.length > 3 || c.position.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
        throw new EplabValidationError(`Open refused: component ${c.id} position must be 2–3 finite numbers`);
      }
      if (c.label !== undefined && typeof c.label !== 'string') throw new EplabValidationError(`Open refused: component ${c.id} label must be a string`);
    }
    if (!Array.isArray(ws.wires)) throw new EplabValidationError(`Open refused: workspace ${ws.id} wires must be an array`);
    for (const w of ws.wires) {
      if (!isPlainObject(w) || typeof w.from !== 'string' || typeof w.to !== 'string') {
        throw new EplabValidationError(`Open refused: workspace ${ws.id} wires must be {from,to} string pairs`);
      }
    }
    if (!Array.isArray(ws.probes) || ws.probes.some((p) => typeof p !== 'string')) {
      throw new EplabValidationError(`Open refused: workspace ${ws.id} probes must be an array of strings`);
    }
    if (ws.quantumCircuit !== undefined && !isPlainObject(ws.quantumCircuit)) {
      throw new EplabValidationError(`Open refused: workspace ${ws.id} quantumCircuit must be an object`);
    }
  }
  if (json.experiments !== undefined) {
    if (!Array.isArray(json.experiments)) throw new EplabValidationError('Open refused: experiments must be an array');
    for (const e of json.experiments) {
      if (!isPlainObject(e) || typeof e.format !== 'string' || !e.format.startsWith('invention-lab/')) {
        throw new EplabValidationError('Open refused: experiment entries must carry an invention-lab format id');
      }
    }
  }
  if (json.autoSave !== undefined && typeof json.autoSave !== 'boolean') {
    throw new EplabValidationError('Open refused: autoSave must be a boolean');
  }
  if (!isPlainObject(json.session)) throw new EplabValidationError('Open refused: session slice must be an object');
  requireClosedProps(json.session, ['workspace', 'vddSlider', 'drivePowerMW', 'bay1Mode', 'npuAttached', 'peelDepth', 'sandboxOpen', 'activeBay'], 'session');
  if (!WORKSPACE_IDS.includes(json.session.workspace)) throw new EplabValidationError(`Open refused: session.workspace "${String(json.session.workspace)}" is not a workspace`);
  for (const key of ['vddSlider', 'drivePowerMW']) {
    if (typeof json.session[key] !== 'number' || !Number.isFinite(json.session[key])) {
      throw new EplabValidationError(`Open refused: session.${key} must be a finite number`);
    }
  }
  for (const key of ['npuAttached', 'sandboxOpen']) {
    if (typeof json.session[key] !== 'boolean') throw new EplabValidationError(`Open refused: session.${key} must be a boolean`);
  }
  if (!Number.isInteger(json.session.peelDepth) || json.session.peelDepth < 0 || json.session.peelDepth > 11) {
    throw new EplabValidationError('Open refused: session.peelDepth must be an integer in [0, 11]');
  }
  if (!Number.isInteger(json.session.activeBay) || json.session.activeBay < 0 || json.session.activeBay > 5) {
    throw new EplabValidationError('Open refused: session.activeBay must be an integer in [0, 5]');
  }
  if (!['fridge', 'mzi', 'tweezer'].includes(json.session.bay1Mode)) {
    throw new EplabValidationError('Open refused: session.bay1Mode must be fridge | mzi | tweezer');
  }
  const integrity = json.integrity;
  if (!isPlainObject(integrity)) throw new EplabValidationError('Open refused: integrity block missing — unsealed container');
  requireClosedProps(integrity, ['payloadSHA256', 'algorithm', 'referenceLibraryLockedAt'], 'integrity');
  if (typeof integrity.payloadSHA256 !== 'string' || !/^[a-f0-9]{64}$/.test(integrity.payloadSHA256)) {
    throw new EplabValidationError('Open refused: integrity.payloadSHA256 must be a 64-char lowercase hex digest');
  }
  if (integrity.algorithm !== undefined && integrity.algorithm !== 'SHA-256') {
    throw new EplabValidationError(`Open refused: integrity.algorithm "${String(integrity.algorithm)}" is not SHA-256`);
  }
  if (typeof integrity.referenceLibraryLockedAt !== 'string' || integrity.referenceLibraryLockedAt.length === 0) {
    throw new EplabValidationError('Open refused: integrity.referenceLibraryLockedAt snapshot missing — cannot bind the sealed reference library');
  }
}

/**
 * Validate a `.eplab` container and return the committed-state patch it
 * describes. FAIL-CLOSED: any schema, seal, or reference-library mismatch
 * throws `EplabValidationError` — callers must not touch state afterwards.
 *
 * @param {unknown} json parsed `.eplab` contents
 * @param {{ referenceLibraryLockedAt: string }} expected current MANIFEST generatedAt
 * @returns {Promise<{ state: Record<string, unknown>, wires: Array<{ from: string, to: string }>, name: string, payloadSHA256: string }>}
 */
export async function validateEplabProject(json, expected) {
  requireSealedContainer(json);
  const payload = sealPayloadOf(json);
  const actual = await sha256Hex(canonicalJson(payload));
  if (actual !== json.integrity.payloadSHA256) {
    throw new EplabValidationError(
      `Open refused: SHA-256 seal mismatch — payload hashes to ${actual} but the container declares ${json.integrity.payloadSHA256}. The file was corrupted or tampered with; nothing was loaded.`
    );
  }
  if (json.integrity.referenceLibraryLockedAt !== expected.referenceLibraryLockedAt) {
    throw new EplabValidationError(
      `Open refused: reference library snapshot mismatch — file was sealed against library ${json.integrity.referenceLibraryLockedAt} but this lab runs ${expected.referenceLibraryLockedAt}. Nothing was loaded.`
    );
  }

  const silicon = json.workspaces.find((w) => w.id === 'silicon');
  const quantum = json.workspaces.find((w) => w.id === 'quantum');
  const probes = silicon.probes.map((entry, i) => {
    const sep = entry.lastIndexOf('|');
    if (sep <= 0) throw new EplabValidationError(`Open refused: probe entry ${i} "${entry}" must be "<targetId>|<color>"`);
    return { id: (Date.now() % 100000) + i, targetId: entry.slice(0, sep), color: entry.slice(sep + 1), samples: [] };
  });
  const circuit = quantum.quantumCircuit || { pulses: { amplitude: 25, sigmaNs: 7.5, beta: 0 }, modality: 'fridge' };

  const state = {
    sandboxComponents: silicon.components,
    probes,
    workspace: json.session.workspace,
    vddSlider: json.session.vddSlider,
    drivePowerMW: json.session.drivePowerMW,
    npuAttached: json.session.npuAttached,
    peelDepth: json.session.peelDepth,
    sandboxOpen: json.session.sandboxOpen,
    activeBay: json.session.activeBay,
    bay1Mode: json.session.bay1Mode,
    pulseParams: { ...circuit.pulses },
  };
  return { state, wires: silicon.wires, name: json.name, payloadSHA256: json.integrity.payloadSHA256 };
}

// ---------------------------------------------------------------------------
// Persistence transports — DOM-guarded, honest degradation (web ↔ desktop).
// ---------------------------------------------------------------------------

/**
 * Web transport: download the `.eplab` bytes as a file (browser + WebView2).
 * @param {{ bytes: string }} sealed result of `buildEplabProject`
 * @param {string} filename
 * @returns {{ ok: boolean, mode: string, filename: string, reason: string | null }}
 */
export function downloadProjectFile(sealed, filename) {
  if (typeof document === 'undefined') {
    return { ok: false, mode: 'browser-download', filename, reason: 'no DOM surface in this runtime' };
  }
  const blob = new Blob([sealed.bytes], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return { ok: true, mode: 'browser-download', filename, reason: null };
}

/**
 * Web transport: pick + read a `.eplab` file through a hidden file input.
 * Resolves `{ name, text }`, or `null` when cancelled / no DOM surface.
 * @returns {Promise<{ name: string, text: string } | null>}
 */
export function readProjectFileViaInput() {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.eplab,application/json';
    input.style.display = 'none';
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(value);
    };
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) {
        finish(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => finish({ name: file.name, text: String(reader.result) });
      reader.onerror = () => finish(null);
      reader.readAsText(file);
    });
    document.body.appendChild(input);
    input.click();
  });
}

/** Desktop transport result — mirrors the honest WP-1.1 degradation style. */
/**
 * Desktop transport: pick a save path via the native dialog, then write the
 * bytes through the feature-detected `__TAURI__.fs` surface. When the shell
 * does not expose an fs surface the caller falls back to the web transport
 * with the returned reason surfaced honestly.
 *
 * @param {{ bytes: string }} sealed result of `buildEplabProject`
 * @param {{ openNativeFileDialog?: (opts?: unknown) => Promise<{ available: boolean, accepted: boolean, path: string | null, cancelled: boolean, reason: string | null }> }} desktop the WP-1.1 bridge (duck-typed)
 * @param {string} suggestedName
 * @returns {Promise<{ ok: boolean, mode: string, path: string | null, reason: string | null }>}
 */
export async function saveProjectViaDesktop(sealed, desktop, suggestedName) {
  if (!desktop || typeof desktop.openNativeFileDialog !== 'function') {
    return { ok: false, mode: 'desktop', path: null, reason: 'desktop bridge unavailable' };
  }
  const dialog = await desktop.openNativeFileDialog({
    kind: 'save-file',
    title: 'Save Electrophysics Lab Project',
    filters: [{ name: 'Electrophysics Lab Project', extensions: ['eplab'] }],
  });
  if (!dialog.available || !dialog.accepted || !dialog.path) {
    return { ok: false, mode: 'desktop', path: null, reason: dialog.cancelled ? 'cancelled' : (dialog.reason || 'native dialog unavailable') };
  }
  const tauri = /** @type {{ fs?: { writeTextFile?: (path: string, data: string) => Promise<unknown> } }} */ (globalThis).__TAURI__;
  if (!tauri || !tauri.fs || typeof tauri.fs.writeTextFile !== 'function') {
    return { ok: false, mode: 'desktop', path: dialog.path, reason: 'native dialog accepted, but this shell does not expose an fs write surface yet — falling back to browser persistence' };
  }
  try {
    await tauri.fs.writeTextFile(dialog.path, sealed.bytes);
    return { ok: true, mode: 'desktop', path: dialog.path, reason: null };
  } catch (err) {
    return { ok: false, mode: 'desktop', path: dialog.path, reason: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Desktop transport: pick + read a project through the native dialog and the
 * feature-detected `__TAURI__.fs` read surface.
 *
 * @param {{ openNativeFileDialog?: (opts?: unknown) => Promise<{ available: boolean, accepted: boolean, path: string | null, cancelled: boolean, reason: string | null }> }} desktop the WP-1.1 bridge (duck-typed)
 * @returns {Promise<{ ok: boolean, name: string, text: string, reason: string | null }>}
 */
export async function openProjectViaDesktop(desktop) {
  if (!desktop || typeof desktop.openNativeFileDialog !== 'function') {
    return { ok: false, name: '', text: '', reason: 'desktop bridge unavailable' };
  }
  const dialog = await desktop.openNativeFileDialog({
    kind: 'open-file',
    title: 'Open Electrophysics Lab Project',
    filters: [{ name: 'Electrophysics Lab Project', extensions: ['eplab'] }],
  });
  if (!dialog.available || !dialog.accepted || !dialog.path) {
    return { ok: false, name: '', text: '', reason: dialog.cancelled ? 'cancelled' : (dialog.reason || 'native dialog unavailable') };
  }
  const tauri = /** @type {{ fs?: { readTextFile?: (path: string) => Promise<string> } }} */ (globalThis).__TAURI__;
  if (!tauri || !tauri.fs || typeof tauri.fs.readTextFile !== 'function') {
    return { ok: false, name: '', text: '', reason: 'native dialog accepted, but this shell does not expose an fs read surface yet — falling back to the browser file picker' };
  }
  try {
    const text = await tauri.fs.readTextFile(dialog.path);
    const name = String(dialog.path).replace(/\\/g, '/').split('/').pop() || 'project.eplab';
    return { ok: true, name, text, reason: null };
  } catch (err) {
    return { ok: false, name: '', text: '', reason: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Auto-save — 30 s interval + window blur, committed state only, sealed on
// every batch like an explicit save.
// ---------------------------------------------------------------------------

/**
 * Store the sealed project as the auto-save slot. @param {Record<string, unknown>} project
 * @returns {boolean} whether the runtime had a localStorage surface
 */
export function saveAutosave(project) {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(AUTOSAVE_KEY, canonicalJson(project));
    return true;
  } catch {
    return false;
  }
}

/** Raw auto-save bytes, or null when absent / no localStorage surface. @returns {string | null} */
export function loadAutosaveRaw() {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(AUTOSAVE_KEY);
  } catch {
    return null;
  }
}

/** Drop the auto-save slot (used after a refused restore — fail-closed hygiene). @returns {boolean} */
export function clearAutosave() {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate + map the auto-save slot to a committed-state patch.
 * Throws `EplabValidationError` on any mismatch (caller clears the slot and
 * shows the reason — never a partial restore).
 *
 * @param {{ referenceLibraryLockedAt: string }} expected current MANIFEST generatedAt
 * @returns {Promise<{ state: Record<string, unknown>, wires: Array<{ from: string, to: string }>, name: string, payloadSHA256: string } | null>} null when no auto-save exists
 */
export async function restoreAutosave(expected) {
  const raw = loadAutosaveRaw();
  if (raw === null) return null;
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new EplabValidationError(`Auto-save restore refused: stored bytes are not valid JSON (${err instanceof Error ? err.message : String(err)})`);
  }
  return validateEplabProject(json, expected);
}

/**
 * Default project filename — `experiment-<UTC stamp>.eplab`. @returns {string}
 */
export function defaultProjectName() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `experiment-${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}.eplab`;
}
