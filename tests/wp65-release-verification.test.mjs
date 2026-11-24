import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  FORMAT, canonicalJson, cleanGitIdentity, frontendEvidence, phase39Identity,
  receiptEnvelope, sealedVaults, sha256, verifyReceiptBytes, windowsArtifacts,
} from '../scripts/v4-release/verify-desktop-release.mjs';

function scratch(t) {
  const path = mkdtempSync(join(tmpdir(), 'wp65-test-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

const commit = 'a'.repeat(40);
const tree = 'b'.repeat(40);
const archive = { bytes: 812, sha256: sha256('original zip bytes') };
const baseline = {
  format: 'invention-lab/phase39-verified-source-release/1',
  sourceCommit: commit, sourceTree: tree,
  archiveBytes: archive.bytes, archiveSHA256: archive.sha256,
  archiveName: 'invention-lab-phase39-source.zip',
  sourceManifestSHA256: sha256('manifest'), scopeSHA256: sha256('physical scope'),
  deterministicBuild: true, physicalValidation: 'none', trackedFilesVerified: 417,
};

test('WP-6.5 Phase 39 identity binds the commit, tree, archive and physical scope', () => {
  assert.deepEqual(phase39Identity(baseline, archive, { commit, tree }), {
    name: baseline.archiveName, ...archive, manifestSha256: baseline.sourceManifestSHA256,
    scopeSha256: baseline.scopeSHA256, files: 417,
  });
  assert.throws(() => phase39Identity(baseline, archive, { commit: 'c'.repeat(40), tree }), /current HEAD/);
  assert.throws(() => phase39Identity(baseline, { ...archive, sha256: sha256('tampered') }, { commit, tree }), /SHA-256/);
  assert.throws(() => phase39Identity({ ...baseline, physicalValidation: 'passed' }, archive, { commit, tree }), /physical scope/);
});

function pe(machine) {
  const data = Buffer.alloc(160, 0);
  data.write('MZ');
  data.writeUInt32LE(64, 60);
  data.write('PE\0\0', 64);
  data.writeUInt16LE(machine, 68);
  return data;
}

test('WP-6.5 enumerates and hashes the exact three native artifacts and rejects wrong types', (t) => {
  const dir = scratch(t);
  const app = join(dir, 'electrophysics-lab.exe');
  const setup = join(dir, 'Electrophysics Lab_3.0.0_x64-setup.exe');
  const msi = join(dir, 'Electrophysics Lab_3.0.0_x64_en-US.msi');
  const msiBytes = Buffer.alloc(512);
  Buffer.from('d0cf11e0a1b11ae1', 'hex').copy(msiBytes);
  writeFileSync(app, pe(0x8664));
  writeFileSync(setup, pe(0x14c));
  assert.throws(() => windowsArtifacts(dir), /msi-installer/);
  writeFileSync(msi, msiBytes);
  const artifacts = windowsArtifacts(dir);
  assert.deepEqual(artifacts.map((a) => a.role), ['desktop-executable', 'nsis-installer', 'msi-installer']);
  assert.equal(artifacts[2].sha256, sha256(msiBytes));
  assert.equal(artifacts[2].bytes, 512);
  const gnu = Buffer.alloc(512);
  pe(0x8664).copy(gnu);
  gnu.writeUInt16LE(1, 70);
  gnu.writeUInt16LE(128, 84);
  gnu.writeUInt32LE(0x1000, 208);
  gnu.writeUInt32LE(0x1000, 228);
  gnu.writeUInt32LE(128, 232);
  gnu.writeUInt32LE(256, 236);
  gnu.writeUInt32LE(0x1040, 268);
  gnu.write('WebView2Loader.dll\0', 320);
  writeFileSync(app, gnu);
  assert.throws(() => windowsArtifacts(dir), /webview2-loader/);
  writeFileSync(join(dir, 'WebView2Loader.dll'), pe(0x8664));
  assert.equal(windowsArtifacts(dir).at(-1).role, 'webview2-loader');
  rmSync(join(dir, 'WebView2Loader.dll'));
  writeFileSync(app, pe(0xaa64));
  assert.throws(() => windowsArtifacts(dir), /architecture/);
});

test('WP-6.5 frontend receipt binds all Vite assets and refuses missing manifest dependencies', (t) => {
  const dir = scratch(t);
  mkdirSync(join(dir, '.vite'));
  mkdirSync(join(dir, 'assets'));
  writeFileSync(join(dir, 'index.html'), '<script type="module" src="/assets/a.js"></script>');
  const manifest = { 'index.html': { file: 'assets/a.js', isEntry: true } };
  writeFileSync(join(dir, '.vite/manifest.json'), JSON.stringify(manifest));
  assert.throws(() => frontendEvidence(dir), /Missing Vite asset/);
  writeFileSync(join(dir, 'assets/a.js'), 'document.title="Test"');
  const evidence = frontendEvidence(dir);
  assert.equal(evidence.manifest.sha256, sha256(JSON.stringify(manifest)));
  writeFileSync(join(dir, 'assets/a.js'), 'document.title="Changed"');
  const changed = frontendEvidence(dir);
  assert.equal(changed.manifest.sha256, evidence.manifest.sha256);
  assert.notEqual(changed.bundleSha256, evidence.bundleSha256);
});

test('WP-6.5 rejects edited, resealed and noncanonical receipts against current artifacts', () => {
  const payload = { format: FORMAT, artifacts: [{ role: 'msi-installer', bytes: 512, sha256: sha256('installer') }], source: { commit } };
  const expected = receiptEnvelope(payload);
  const exact = canonicalJson(expected);
  assert.deepEqual(verifyReceiptBytes(exact, expected), expected);
  assert.equal(canonicalJson(receiptEnvelope({ ...payload, artifacts: [...payload.artifacts] })), exact);
  assert.throws(() => verifyReceiptBytes(exact.replace('512', '513'), expected), /SHA-256 seal/);
  assert.throws(() => verifyReceiptBytes(JSON.stringify(expected), expected), /canonical/);
  const changed = receiptEnvelope({ ...payload, artifacts: [{ ...payload.artifacts[0], sha256: sha256('replacement') }] });
  assert.throws(() => verifyReceiptBytes(canonicalJson(changed), expected), /does not match/);
});

test('WP-6.5 refuses working tree edits, staged edits and tracked binary outputs', (t) => {
  const dir = scratch(t);
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
  git('init', '-q');
  git('config', 'user.name', 'WP65 test');
  git('config', 'user.email', 'wp65@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  writeFileSync(join(dir, 'source.txt'), 'clean');
  git('add', 'source.txt');
  git('commit', '-qm', 'source fixture');
  assert.match(cleanGitIdentity(dir).commit, /^[a-f0-9]{40}$/);
  writeFileSync(join(dir, 'source.txt'), 'modified');
  assert.throws(() => cleanGitIdentity(dir), /Dirty tracked tree/);
  git('add', 'source.txt');
  assert.throws(() => cleanGitIdentity(dir), /Dirty tracked tree/);
  git('commit', '-qm', 'tracked source change');
  writeFileSync(join(dir, 'setup.exe'), pe(0x14c));
  assert.doesNotThrow(() => cleanGitIdentity(dir));
  git('add', 'setup.exe');
  git('commit', '-qm', 'binary appears in tree');
  assert.throws(() => cleanGitIdentity(dir), /Tracked release artifact/);
});

test('WP-6.5 checks every sealed vault member before retaining its manifest root', (t) => {
  const dir = scratch(t);
  for (const name of ['cad-specs', 'curriculum', 'reference-library']) {
    const root = join(dir, 'data', name);
    mkdirSync(root, { recursive: true });
    writeFileSync(join(root, 'payload.json'), '{}');
    writeFileSync(join(root, 'MANIFEST.json'), JSON.stringify({
      format: 'invention-lab/reference-library-manifest/1',
      files: [{ file: 'payload.json', size_bytes: 2, sha256: sha256('{}') }],
    }));
  }
  assert.equal(sealedVaults(dir).length, 3);
  writeFileSync(join(dir, 'data', 'curriculum', 'payload.json'), '[]');
  assert.throws(() => sealedVaults(dir), /sealed vault member SHA-256/i);
});

test('WP-6.5 Windows workflow is release-only and uploads verified installers and receipt', () => {
  const workflow = readFileSync(new URL('../.github/workflows/v4-desktop-release.yml', import.meta.url), 'utf8');
  assert.match(workflow, /^on:\s*\n {2}workflow_dispatch:\s*\n {2}push:\s*\n {4}tags:\s*\n {6}- 'v\*'/m);
  assert.doesNotMatch(workflow, /^\s*pull_request(?:_target)?:/m);
  assert.match(workflow, /runs-on: windows-latest/);
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /phase39-source-baseline\.py --verify/);
  assert.match(workflow, /phase39-strict-audit\.py/);
  assert.ok(workflow.indexOf('build-desktop-release.ps1') < workflow.indexOf('actions/upload-artifact@'));
  for (const artifact of ['electrophysics-lab.exe', '*-setup.exe', '*.msi', 'desktop-release-receipt.json']) {
    assert.ok(workflow.includes(artifact), artifact);
  }
});
