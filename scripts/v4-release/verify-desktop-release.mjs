import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { pinnedProvenance, LEVEL1_INSUFFICIENT_MODEL_DATA, LEVEL2_UNQUALIFIED_NO_GO }
  from '../v4-oracles/pdk-admission-gate.mjs';

export const FORMAT = 'invention-lab/desktop-release-receipt/1';
export const RECEIPT_NAME = 'desktop-release-receipt.json';
const PHASE39_FORMAT = 'invention-lab/phase39-verified-source-release/1';
const ARCHIVE_NAME = 'invention-lab-phase39-source.zip';
const VAULT_MANIFEST = 'invention-lab/reference-library-manifest/1';
const VAULTS = ['cad-specs', 'curriculum', 'reference-library'];
const SHA = /^[0-9a-f]{64}$/;
const MAX_FILE_BYTES = 256 * 1024 * 1024;
const BUILD_PATH = /(?:^|\/)(?:dist|target|pkg)(?:\/|$)|\.(?:exe|msi|zip)$/i;

function check(condition, reason) {
  if (!condition) throw Error(reason);
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function canonicalJson(value) {
  const sort = (v) => Array.isArray(v) ? v.map(sort) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().map((key) => [key, sort(v[key])])) : v;
  return JSON.stringify(sort(value), null, 2) + '\n';
}

function file(path) {
  let stat;
  try {
    stat = lstatSync(path);
  } catch (err) {
    if (err.code === 'ENOENT') throw Error('Missing release input: ' + path);
    throw err;
  }
  check(stat.isFile() && stat.size > 0 && stat.size <= MAX_FILE_BYTES,
    'Invalid release file type or size: ' + path);
  return readFileSync(path);
}

function bytesRecord(bytes) {
  return { bytes: bytes.length, sha256: sha256(bytes) };
}

function git(repo, ...args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
}

export function cleanGitIdentity(repo) {
  check(!git(repo, 'status', '--porcelain=v1', '--untracked-files=no', '--ignore-submodules=none').trim(),
    'Dirty tracked tree; seal from an exact Git checkout');
  const paths = git(repo, 'ls-tree', '-rz', '--name-only', 'HEAD').split('\0').filter(Boolean);
  const bad = paths.find((name) => BUILD_PATH.test(name));
  check(!bad, 'Tracked release artifact refused: ' + bad);
  return { commit: git(repo, 'rev-parse', 'HEAD').trim(), tree: git(repo, 'rev-parse', 'HEAD^{tree}').trim() };
}

export function phase39Identity(info, archive, gitIdentity) {
  check(info?.format === PHASE39_FORMAT && info.sourceCommit === gitIdentity.commit
    && info.sourceTree === gitIdentity.tree && info.archiveName === ARCHIVE_NAME
    && info.deterministicBuild === true && info.physicalValidation === 'none',
  'Phase 39 metadata does not bind current HEAD, tree and physical scope');
  check(info.archiveBytes === archive.bytes && info.archiveSHA256 === archive.sha256,
    'Phase 39 archive SHA-256 or byte length mismatch');
  check(SHA.test(info.sourceManifestSHA256) && SHA.test(info.scopeSHA256)
    && Number.isSafeInteger(info.trackedFilesVerified) && info.trackedFilesVerified > 0,
  'Phase 39 manifest or scope evidence missing');
  return {
    name: ARCHIVE_NAME, ...archive, manifestSha256: info.sourceManifestSHA256,
    scopeSha256: info.scopeSHA256, files: info.trackedFilesVerified,
  };
}

function authenticateArchive(repo, baseline, source) {
  const python = process.env.WP65_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const helper = fileURLToPath(new URL('./phase39-release-source.py', import.meta.url));
  const args = [helper, repo, baseline, ...(source ? [source] : [])];
  try {
    return JSON.parse(execFileSync(python, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (err) {
    throw Error(String(err.stderr || err.message).trim());
  }
}

/** Verify the actual byte-exact Phase 39 ZIP before extracting into a new source directory. */
export function prepareSource(repo, baseline, source) {
  cleanGitIdentity(repo);
  return authenticateArchive(repo, baseline, source);
}

function verifyExtractedSource(repo, baseline, source) {
  const info = authenticateArchive(repo, baseline);
  const manifest = file(join(source, 'SOURCE-MANIFEST.json'));
  const scope = file(join(source, 'PHYSICAL-SCOPE.json'));
  check(sha256(manifest) === info.sourceManifestSHA256 && sha256(scope) === info.scopeSHA256,
    'Extracted Phase 39 metadata SHA-256 mismatch');
  for (const entry of JSON.parse(manifest).sources) {
    const actual = file(join(source, entry.path));
    check(actual.length === entry.sizeBytes && sha256(actual) === entry.sha256,
      'Extracted Phase 39 source changed: ' + entry.path);
  }
}

function validName(name) {
  return typeof name === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_. -]*$/.test(name)
    && !name.endsWith('.') && !name.endsWith(' ');
}

export function sealedVaults(repo) {
  return VAULTS.map((vault) => {
    const dir = join(repo, 'data', vault);
    const raw = file(join(dir, 'MANIFEST.json'));
    const manifest = JSON.parse(raw);
    check(manifest.format === VAULT_MANIFEST && Array.isArray(manifest.files) && manifest.files.length > 0,
      'Invalid sealed vault manifest: ' + vault);
    const names = new Set();
    for (const item of manifest.files) {
      check(validName(item.file) && item.file !== 'MANIFEST.json' && !names.has(item.file),
        'Invalid sealed vault member: ' + vault);
      names.add(item.file);
      const record = bytesRecord(file(join(dir, item.file)));
      check(record.bytes === item.size_bytes && record.sha256 === item.sha256,
        'Sealed vault member SHA-256 mismatch: ' + vault + '/' + item.file);
    }
    const dataNames = readdirSync(dir).filter((name) => name.endsWith('.json') && name !== 'MANIFEST.json');
    check(dataNames.length === names.size && dataNames.every((name) => names.has(name)),
      'Sealed vault has missing or unlisted JSON: ' + vault);
    return { path: 'data/' + vault + '/MANIFEST.json', files: names.size, ...bytesRecord(raw) };
  });
}

function provenance(repo) {
  const q4 = file(join(repo, 'data/reference-library/03_multiradix_logic_baselines.json')).toString('utf8');
  const silicon = JSON.parse(file(join(repo, 'data/reference-library/02_semiconductor_pdk_silicon.json')));
  const failure = JSON.parse(file(join(repo, 'data/reference-library/06_failure_physics_thresholds.json')));
  const thresholds = JSON.parse(file(join(repo, 'benchmarks/stage-m-qualification-thresholds.json')));
  const pinned = pinnedProvenance(q4, thresholds);
  check(!pinned.errors.length && pinned.soaCeilingV === silicon.parameters.sky130a.core_soa_max_vgs_v
    && pinned.soaCeilingV === failure.failure_thresholds.gate_oxide_tddb.vgs_threshold_v,
  'Pinned SKY130/Q4 release evidence mismatch: ' + pinned.errors.join(', '));
  return {
    kind: 'SOFTWARE_RELEASE_EVIDENCE', physicalValidation: 'none',
    level1: LEVEL1_INSUFFICIENT_MODEL_DATA, level2: LEVEL2_UNQUALIFIED_NO_GO,
    sky130SoaV: pinned.soaCeilingV, sky130Commit: pinned.sky130Commit, openPdksCommit: pinned.openPdksCommit,
    q4Verified: 4, q4Primitives: pinned.deckIds.toSorted(), q4SourceSha256: pinned.q4PayloadSha256,
  };
}

function walkFrontend(root, folder = root) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return walkFrontend(root, path);
    check(entry.isFile(), 'Nonregular Vite asset: ' + path);
    return [{ path: relative(root, path).split(sep).join('/'), ...bytesRecord(file(path)) }];
  });
}

export function frontendEvidence(dir) {
  const manifestPath = '.vite/manifest.json';
  const raw = file(join(dir, manifestPath));
  const manifest = JSON.parse(raw);
  const files = walkFrontend(dir).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const available = new Set(files.map((entry) => entry.path));
  check(available.has('index.html') && manifest['index.html']?.isEntry === true,
    'Vite entrypoint missing from frontend bundle or manifest');
  for (const entry of Object.values(manifest)) {
    check(typeof entry.file === 'string' && available.has(entry.file)
      && [...(entry.css ?? []), ...(entry.assets ?? [])].every((path) => available.has(path)),
    'Missing Vite asset named by frontend manifest');
    check([...(entry.imports ?? []), ...(entry.dynamicImports ?? [])].every((key) => Object.hasOwn(manifest, key)),
      'Vite manifest has unresolved imports');
  }
  return {
    manifest: { path: manifestPath, ...bytesRecord(raw) },
    bundleSha256: sha256(canonicalJson(files)), files,
  };
}

function pe(bytes, machine = [0x8664]) {
  if (bytes.length < 64 || bytes.toString('ascii', 0, 2) !== 'MZ') return false;
  const offset = bytes.readUInt32LE(60);
  return offset >= 64 && offset <= bytes.length - 6
    && bytes.toString('ascii', offset, offset + 4) === 'PE\0\0' && machine.includes(bytes.readUInt16LE(offset + 4));
}

function needsWebViewLoader(bytes) {
  if (!pe(bytes)) return false;
  const coff = bytes.readUInt32LE(60) + 4;
  if (coff + 20 > bytes.length) return false;
  const count = bytes.readUInt16LE(coff + 2);
  const size = bytes.readUInt16LE(coff + 16);
  const optional = coff + 20;
  if (size < 128 || optional + size + count * 40 > bytes.length) return false;
  const rvaToFile = (rva) => {
    for (let i = 0; i < count; i++) {
      const row = optional + size + i * 40;
      const base = bytes.readUInt32LE(row + 12);
      const dataSize = bytes.readUInt32LE(row + 16);
      const raw = bytes.readUInt32LE(row + 20);
      if (rva >= base && rva - base < dataSize) return raw + rva - base;
    }
    return -1;
  };
  const imports = rvaToFile(bytes.readUInt32LE(optional + 120));
  if (imports < 0) return false;
  for (let row = imports; row + 20 <= bytes.length; row += 20) {
    const rva = bytes.readUInt32LE(row + 12);
    if (!rva) break;
    const name = rvaToFile(rva);
    if (name < 0 || name >= bytes.length) throw Error('Invalid executable import name');
    const end = bytes.indexOf(0, name);
    if (end !== -1 && bytes.toString('ascii', name, end).toLowerCase() === 'webview2loader.dll') return true;
  }
  return false;
}

export function windowsArtifacts(dir) {
  const files = readdirSync(dir);
  const contracts = [
    ['desktop-executable', /^electrophysics-lab\.exe$/, pe],
    ['nsis-installer', /^Electrophysics Lab_\d+\.\d+\.\d+_x64-setup\.exe$/, (b) => pe(b, [0x14c, 0x8664])],
    ['msi-installer', /^Electrophysics Lab_\d+\.\d+\.\d+_x64_en-US\.msi$/,
      (b) => b.length >= 512 && b.subarray(0, 8).toString('hex') === 'd0cf11e0a1b11ae1'],
  ];
  const executable = file(join(dir, 'electrophysics-lab.exe'));
  const loader = 'WebView2Loader.dll';
  if (executable.includes(Buffer.from(loader + '\0'))) {
    contracts.push(['webview2-loader', /^WebView2Loader\.dll$/, pe]);
  } else if (files.includes(loader)) {
    throw Error('Unexpected WebView2 loader beside a statically linked release');
  }
  return contracts.map(([role, name, inspect]) => {
    const matching = files.filter((f) => name.test(f));
    check(matching.length === 1, 'Expected one Windows release artifact for ' + role);
    const filename = matching[0];
    const bytes = file(join(dir, filename));
    check(inspect(bytes), 'Unexpected binary type or architecture: ' + filename);
    return { role, name: filename, ...bytesRecord(bytes) };
  });
}

export function receiptEnvelope(payload) {
  return { ...payload, receiptSha256: sha256(canonicalJson(payload)) };
}

export function verifyReceiptBytes(raw, expected) {
  const receipt = JSON.parse(raw);
  const { receiptSha256, ...payload } = receipt;
  check(payload.format === FORMAT && SHA.test(receiptSha256)
    && receiptSha256 === sha256(canonicalJson(payload)), 'Release receipt schema or SHA-256 seal mismatch');
  check(raw === canonicalJson(receipt), 'Release receipt is not canonical JSON');
  check(raw === canonicalJson(expected), 'Release receipt does not match the verified source, frontend or installer SHA-256');
  return receipt;
}

export function buildReceipt({ repo, baseline, artifacts, frontend }) {
  const identity = cleanGitIdentity(repo);
  const metadata = authenticateArchive(repo, baseline);
  const archive = bytesRecord(file(join(baseline, ARCHIVE_NAME)));
  const phase39 = phase39Identity(metadata, archive, identity);
  const receipt = receiptEnvelope({
    format: FORMAT,
    source: { ...identity, phase39 },
    vaults: sealedVaults(repo),
    provenance: provenance(repo),
    frontend: frontendEvidence(frontend),
    artifacts: windowsArtifacts(artifacts),
  });
  check(canonicalJson(cleanGitIdentity(repo)) === canonicalJson(identity), 'HEAD or tree changed during release verification');
  return receipt;
}

function outside(repo, target) {
  const path = relative(repo, target);
  return path && (path === '..' || path.startsWith('..' + sep) || isAbsolute(path));
}

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      repo: { type: 'string', default: '.' },
      baseline: { type: 'string' },
      source: { type: 'string' },
      artifacts: { type: 'string' },
      frontend: { type: 'string' },
      receipt: { type: 'string' },
    },
  });
  const [operation] = positionals;
  check(positionals.length === 1 && ['prepare', 'check-source', 'record', 'verify'].includes(operation),
    'Usage: verify-desktop-release.mjs prepare|check-source|record|verify --repo ROOT --baseline DIR [--source NEW_DIR | --artifacts DIR --frontend DIST --receipt FILE]');
  const repo = resolve(values.repo);
  const baseline = resolve(values.baseline ?? join(repo, 'benchmarks/evidence/phase39'));
  if (operation === 'prepare') {
    check(values.source, 'A new --source directory is required');
    const info = prepareSource(repo, baseline, resolve(values.source));
    console.log('Verified Phase 39 source SHA-256 ' + info.archiveSHA256);
    return;
  }
  if (operation === 'check-source') {
    check(values.source, 'An extracted --source directory is required');
    verifyExtractedSource(repo, baseline, resolve(values.source));
    console.log('Verified extracted Phase 39 source after the Windows builds');
    return;
  }
  check(values.artifacts && values.frontend && values.receipt, 'Specify --artifacts, --frontend and --receipt');
  const receiptPath = resolve(values.receipt);
  check(outside(repo, receiptPath), 'Generated receipts belong outside the Git checkout');
  check(basename(receiptPath) === RECEIPT_NAME, 'Expected receipt filename ' + RECEIPT_NAME);
  const receipt = buildReceipt({
    repo, baseline, artifacts: resolve(values.artifacts), frontend: resolve(values.frontend),
  });
  if (operation === 'record') writeFileSync(receiptPath, canonicalJson(receipt), { flag: 'wx' });
  else verifyReceiptBytes(file(receiptPath).toString('utf8'), receipt);
  console.log(operation + ' desktop release ' + receipt.receiptSha256);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    main();
  } catch (err) {
    console.error('Desktop release refused: ' + err.message);
    process.exitCode = 1;
  }
}
