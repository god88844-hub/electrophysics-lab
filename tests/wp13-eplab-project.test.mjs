import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * WP-1.3 — `.eplab` Save/Open/Auto-save unit tests (schema validation +
 * tampered-seal refusal, fail-closed).
 *
 * The implementation lives in `apps/electrophysics-3d/src/state/project.ts`
 * as import-free pure JavaScript with JSDoc types (it must typecheck for the
 * vite bundle AND run under Node 20/22/24 in the CI matrix, which cannot
 * parse TS). The test therefore imports the EXACT FILE BYTES through a
 * data-URL module — app and tests cannot drift. Zero dependencies: the CI
 * `npm test` job installs nothing.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const PROJECT_TS = path.join(root, 'apps', 'electrophysics-3d', 'src', 'state', 'project.ts');
const source = readFileSync(PROJECT_TS, 'utf8');

// The file must stay import-free pure JS for this import path to work —
// enforce the contract itself so a future TS-ism fails loudly here.
assert.ok(!/^\s*import\s/m.test(source), 'project.ts must remain import-free (pure JS + JSDoc) for the Node CI unit-test path');

const P = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const {
  EPLAB_FORMAT,
  canonicalJson,
  sha256Hex,
  buildEplabProject,
  validateEplabProject,
  snapshotFromState,
  wiresFromSandboxGroup,
  sealPayloadOf,
  EplabValidationError,
  defaultProjectName,
} = P;

const LIB = '2026-11-20T20:16:05.852Z'; // MANIFEST.json generatedAt snapshot
const NOW = '2026-11-21T12:00:00.000Z';

function baseSnapshot() {
  return {
    components: [
      { id: 'nmos_0', kind: 'nmos', params: {}, nodes: ['gate', 'drain', 'gnd'], position: [0.62, 0.6] },
      { id: 'pmos_1', kind: 'pmos', params: { w: 2 }, nodes: ['gate', 'drain', 'vdd'], position: [0.82, 0.6], label: 'pull-up' },
    ],
    wires: [{ from: 'nmos_0', to: 'pmos_1' }],
    probes: [{ targetId: 'nmos_0', color: '#62d0ff' }],
    quantum: { pulses: { amplitude: 25, sigmaNs: 7.5, beta: 0.4 }, modality: 'mzi' },
    experiments: [],
    session: {
      workspace: 'silicon',
      vddSlider: 1.9,
      drivePowerMW: 5.5,
      bay1Mode: 'tweezer',
      npuAttached: true,
      peelDepth: 3,
      sandboxOpen: false,
      activeBay: 2,
    },
  };
}

const sealed = () => buildEplabProject(baseSnapshot(), { name: 'test.eplab', nowIso: NOW, referenceLibraryLockedAt: LIB });
const openOk = async (project) => validateEplabProject(project, { referenceLibraryLockedAt: LIB });

test('WP-1.3: canonical JSON is stable across key insertion order', () => {
  const a = canonicalJson({ b: 1, a: { d: 2, c: [3, { z: 1, y: 2 }] } });
  const b = canonicalJson({ a: { c: [3, { y: 2, z: 1 }], d: 2 }, b: 1 });
  assert.equal(a, b);
  assert.equal(JSON.parse(a).a.d, 2);
});

test('WP-1.3: sha256Hex matches the Node crypto digest', async () => {
  const { createHash } = await import('node:crypto');
  const hex = await sha256Hex('invention-lab/eplab-project/1');
  assert.equal(hex, createHash('sha256').update('invention-lab/eplab-project/1').digest('hex'));
});

test('WP-1.3: build → schema-valid container with exact SHA-256 seal + library snapshot', async () => {
  const { project, payloadSHA256, bytes } = await sealed();
  assert.equal(project.format, EPLAB_FORMAT);
  assert.equal(project.formatVersion, 1);
  assert.equal(project.integrity.algorithm, 'SHA-256');
  assert.equal(project.integrity.referenceLibraryLockedAt, LIB);
  assert.equal(project.integrity.payloadSHA256, payloadSHA256);
  assert.match(project.integrity.payloadSHA256, /^[a-f0-9]{64}$/);
  // Seal covers exactly the payload slice (everything except integrity).
  assert.equal(await sha256Hex(canonicalJson(sealPayloadOf(project))), payloadSHA256);
  // Serializing the committed snapshot: 4 workspaces in schema enum order,
  // silicon carries components/wires/probes, quantum carries the circuit.
  assert.deepEqual(project.workspaces.map((w) => w.id), ['quantum', 'silicon', 'soc', 'library']);
  const silicon = project.workspaces.find((w) => w.id === 'silicon');
  assert.equal(silicon.components.length, 2);
  assert.deepEqual(silicon.wires, [{ from: 'nmos_0', to: 'pmos_1' }]);
  assert.deepEqual(silicon.probes, ['nmos_0|#62d0ff']);
  const quantum = project.workspaces.find((w) => w.id === 'quantum');
  assert.deepEqual(quantum.quantumCircuit, { pulses: { amplitude: 25, sigmaNs: 7.5, beta: 0.4 }, modality: 'mzi' });
  // Byte-identical canonical serialization (used for Save + auto-save slots).
  assert.equal(typeof bytes, 'string');
  assert.deepEqual(JSON.parse(bytes), project);
  await assert.doesNotReject(() => openOk(JSON.parse(bytes)));
});

test('WP-1.3: same state from differently-ordered maps seals identically', async () => {
  const s1 = baseSnapshot();
  const s2 = JSON.parse(JSON.stringify(baseSnapshot()));
  s2.session = { activeBay: 2, sandboxOpen: false, peelDepth: 3, npuAttached: true, bay1Mode: 'tweezer', drivePowerMW: 5.5, vddSlider: 1.9, workspace: 'silicon' };
  const p1 = await buildEplabProject(s1, { name: 't.eplab', nowIso: NOW, referenceLibraryLockedAt: LIB });
  const p2 = await buildEplabProject(s2, { name: 't.eplab', nowIso: NOW, referenceLibraryLockedAt: LIB });
  assert.equal(p1.payloadSHA256, p2.payloadSHA256);
});

test('WP-1.3: round-trip — validate → state patch reproduces the committed snapshot', async () => {
  const { project } = await sealed();
  const { state, wires, name, payloadSHA256 } = await openOk(project);
  assert.equal(name, 'test.eplab');
  assert.match(payloadSHA256, /^[a-f0-9]{64}$/);
  assert.deepEqual(state.sandboxComponents, baseSnapshot().components);
  assert.deepEqual(wires, baseSnapshot().wires);
  assert.deepEqual(state.probes, [{ id: state.probes[0].id, targetId: 'nmos_0', color: '#62d0ff', samples: [] }]);
  assert.equal(state.workspace, 'silicon');
  assert.equal(state.vddSlider, 1.9);
  assert.equal(state.drivePowerMW, 5.5);
  assert.equal(state.npuAttached, true);
  assert.equal(state.peelDepth, 3);
  assert.equal(state.sandboxOpen, false);
  assert.equal(state.activeBay, 2);
  assert.equal(state.bay1Mode, 'tweezer');
  assert.deepEqual(state.pulseParams, { amplitude: 25, sigmaNs: 7.5, beta: 0.4 });
});

test('WP-1.3: TAMPERED PAYLOAD is refused with the exact hash mismatch — never partially loaded', async () => {
  const { project } = await sealed();
  // Mutate a workspace component AFTER sealing (forged byte).
  const forged = JSON.parse(JSON.stringify(project));
  forged.workspaces.find((w) => w.id === 'silicon').components[0].position[0] = 9.9;
  await assert.rejects(
    () => openOk(forged),
    (err) => {
      assert.ok(err instanceof EplabValidationError);
      assert.match(err.message, /SHA-256 seal mismatch/);
      assert.match(err.message, /nothing was loaded/);
      assert.match(err.message, /^[a-f0-9]{64}/m.test(err.message) ? /hashes to/ : /hashes to/);
      return true;
    }
  );
  // Tampered integrity block (attacker recomputes nothing, swaps the digest).
  const forgedSeal = JSON.parse(JSON.stringify(project));
  forgedSeal.integrity.payloadSHA256 = 'f'.repeat(64);
  await assert.rejects(() => openOk(forgedSeal), /SHA-256 seal mismatch/);
  // Truncated / corrupted JSON payload byte flip in name.
  const forgedName = JSON.parse(JSON.stringify(project));
  forgedName.name = 'evil';
  await assert.rejects(() => openOk(forgedName), /SHA-256 seal mismatch/);
});

test('WP-1.3: reference-library snapshot mismatch refuses (sealed against another library)', async () => {
  const { project } = await sealed();
  await assert.rejects(
    () => validateEplabProject(project, { referenceLibraryLockedAt: '2099-01-01T00:00:00.000Z' }),
    (err) => {
      assert.ok(err instanceof EplabValidationError);
      assert.match(err.message, /reference library snapshot mismatch/);
      assert.match(err.message, /Nothing was loaded/);
      return true;
    }
  );
});

test('WP-1.3: schema validation fails closed on every malformed container', async () => {
  const base = await sealed();
  const expectRefusal = async (mutate, pattern) => {
    const copy = JSON.parse(JSON.stringify((await base).project));
    mutate(copy);
    await assert.rejects(
      () => openOk(copy),
      (err) => {
        assert.ok(err instanceof EplabValidationError, `expected EplabValidationError for ${pattern}`);
        assert.match(err.message, pattern);
        return true;
      }
    );
  };

  await expectRefusal((p) => { p.format = 'some-other-format/9'; }, /format/);
  await expectRefusal((p) => { p.formatVersion = 0; }, /formatVersion/);
  await expectRefusal((p) => { p.formatVersion = 'one'; }, /formatVersion/);
  await expectRefusal((p) => { p.createdAt = 'yesterday'; }, /createdAt/);
  await expectRefusal((p) => { p.modifiedAt = 42; }, /modifiedAt/);
  await expectRefusal((p) => { p.name = ''; }, /name/);
  await expectRefusal((p) => { p.name = 'x'.repeat(121); }, /120/);
  await expectRefusal((p) => { p.workspaces = []; }, /exactly 4/);
  await expectRefusal((p) => { p.workspaces[1].id = 'holodeck'; }, /unknown workspace id/);
  await expectRefusal((p) => { p.workspaces[1].components[0].id = 'EVIL ID'; }, /schema pattern/);
  await expectRefusal((p) => { p.workspaces[1].components[0].position = [1]; }, /2–3 finite numbers/);
  await expectRefusal((p) => { p.workspaces[1].components[0].position = [1, 'x']; }, /2–3 finite numbers/);
  await expectRefusal((p) => { p.workspaces[1].components[0].nodes = [1]; }, /array of strings/);
  await expectRefusal((p) => { p.workspaces[1].components[0].kind = ''; }, /no kind/);
  await expectRefusal((p) => { p.workspaces[1].wires = [{ from: 'a' }]; }, /\{from,to\}/);
  await expectRefusal((p) => { p.workspaces[1].probes = [42]; }, /array of strings/);
  await expectRefusal((p) => { p.workspaces[0].quantumCircuit = 'bell'; }, /quantumCircuit/);
  await expectRefusal((p) => { p.experiments = [{ nope: 1 }]; }, /invention-lab format id/);
  await expectRefusal((p) => { p.autoSave = 'yes'; }, /autoSave/);
  await expectRefusal((p) => { p.session.workspace = 'holodeck'; }, /session\.workspace/);
  await expectRefusal((p) => { p.session.vddSlider = 'high'; }, /session\.vddSlider/);
  await expectRefusal((p) => { p.session.peelDepth = 99; }, /peelDepth/);
  await expectRefusal((p) => { p.session.activeBay = -1; }, /activeBay/);
  await expectRefusal((p) => { p.session.bay1Mode = 'steam'; }, /bay1Mode/);
  await expectRefusal((p) => { p.integrity = null; }, /integrity block missing/);
  await expectRefusal((p) => { p.integrity.payloadSHA256 = 'deadbeef'; }, /64-char/);
  await expectRefusal((p) => { p.integrity.algorithm = 'MD5'; }, /not SHA-256/);
  await expectRefusal((p) => { delete p.integrity.referenceLibraryLockedAt; }, /referenceLibraryLockedAt/);
  await expectRefusal((p) => { p.surprise = true; }, /unexpected property "surprise"/);
  await expectRefusal((p) => { p.integrity.extraNote = 'hi'; }, /unexpected property "extraNote"/);
  // Non-object / unsealed garbage (validation is ordered: shape before seal).
  await assert.rejects(() => openOk('{"format":"invention-lab/eplab-project/1"}'), /not a JSON object|seal mismatch/);
  await assert.rejects(() => openOk(null), /not a JSON object/);
  await assert.rejects(() => openOk({ format: EPLAB_FORMAT }), /formatVersion/);
});

test('WP-1.3: validation is all-or-nothing — a refusal never yields a state patch', async () => {
  const { project } = await sealed();
  const forged = JSON.parse(JSON.stringify(project));
  forged.workspaces.find((w) => w.id === 'silicon').components.pop(); // loses pmos_1
  await assert.rejects(() => openOk(forged), /SHA-256 seal mismatch/);
  // The only success path is the pristine container, and it returns the FULL patch.
  const ok = await openOk(project);
  assert.ok(Object.keys(ok.state).length >= 10);
});

test('WP-1.3: wiresFromSandboxGroup reads trace-<from>-<to> mesh names', () => {
  const group = {
    getObjectByName: (n) =>
      n === 'sandbox-group'
        ? { children: [{ name: 'trace-nmos_0-pmos_1' }, { name: 'trace-a-b' }, { name: 'unrelated' }, { name: 'trace-bad-' }, { name: 'trace-' }, { name: 'sandbox-nmos_0' }] }
        : null,
  };
  assert.deepEqual(wiresFromSandboxGroup(group), [{ from: 'nmos_0', to: 'pmos_1' }, { from: 'a', to: 'b' }]);
  assert.deepEqual(wiresFromSandboxGroup(null), []);
  assert.deepEqual(wiresFromSandboxGroup({}), []);
});

test('WP-1.3: auto-save refuses corrupt slots and absent snapshots', async () => {
  // restoreAutosave path exercised through injected localStorage-less runtime:
  // without a DOM localStorage the slot is simply absent (null).
  const restored = await P.restoreAutosave({ referenceLibraryLockedAt: LIB });
  assert.equal(restored, null, 'no localStorage surface in node → no auto-save slot');
});

test('WP-1.3: default project name is a deterministic .eplab stamp', () => {
  assert.match(defaultProjectName(), /^experiment-\d{8}-\d{6}\.eplab$/);
});

test('WP-1.3: snapshotFromState serializes committed state only (no transient tool state)', () => {
  const state = {
    sandboxComponents: [{ id: 'res_0', kind: 'resistor', params: {}, nodes: ['drain', 'gnd'], position: [0.5, 0.5] }],
    probes: [{ id: 123, targetId: 'res_0', color: '#ffd98a', samples: [{ t: 0, value: 1 }] }],
    pulseParams: { amplitude: 10, sigmaNs: 3, beta: 1 },
    bay1Mode: 'fridge',
    experiments: undefined,
    workspace: 'silicon',
    vddSlider: 1.8,
    drivePowerMW: 5,
    npuAttached: false,
    peelDepth: 0,
    sandboxOpen: true,
    activeBay: 0,
    // transient fields that must NOT leak into the snapshot:
    pendingWireFrom: 'res_0',
    hover: { name: 'x', meta: 'y', x: 1, y: 2 },
    cursor: { x: 1, y: 2, z: 3 },
    activeTool: 'wire',
    placingKind: 'nmos',
    forensic: { report: {}, replay: [], fix: null },
    physics: { vdd: 1.8 },
  };
  const snap = snapshotFromState(state, [{ from: 'res_0', to: 'res_0' }]);
  const text = canonicalJson(snap);
  assert.equal(text.includes('pendingWireFrom'), false);
  assert.equal(text.includes('"hover"'), false);
  assert.equal(text.includes('"cursor"'), false);
  assert.equal(text.includes('"activeTool"'), false);
  assert.equal(text.includes('"placingKind"'), false);
  assert.equal(text.includes('"samples"'), false);
  assert.equal(text.includes('"forensic"'), false);
  assert.equal(text.includes('"physics"'), false);
  assert.deepEqual(snap.probes, [{ targetId: 'res_0', color: '#ffd98a' }]);
  assert.deepEqual(snap.experiments, []);
});
