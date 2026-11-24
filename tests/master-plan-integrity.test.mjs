import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

const DATA_TREES = [
  'data/reference-library',
  'data/cad-specs',
  'data/curriculum',
];

const PROVENANCE_TAG = /"provenance_status"\s*:\s*"verified_offline_standard"/;
const UNITS_TAG = /"units"\s*:|"(length|mass|time|temperature|current)"\s*:\s*"/;

/** Every data JSON matches its SHA-256 manifest, has provenance + SI units, zero NaN. */
for (const tree of DATA_TREES) {
  test(`integrity: ${tree} matches its SHA-256 MANIFEST`, () => {
    const manifest = JSON.parse(readFileSync(path.join(root, tree, 'MANIFEST.json'), 'utf8'));
    assert.equal(manifest.format, 'invention-lab/reference-library-manifest/1');
    const diskFiles = readdirSync(path.join(root, tree)).filter((f) => f.endsWith('.json') && f !== 'MANIFEST.json').sort();
    const manifestFiles = manifest.files.map((f) => f.file).sort();
    assert.deepEqual(manifestFiles, diskFiles, 'manifest lists exactly the on-disk JSON files');
    for (const entry of manifest.files) {
      const raw = readFileSync(path.join(root, tree, entry.file));
      const actual = createHash('sha256').update(raw).digest('hex');
      assert.equal(actual, entry.sha256, `${tree}/${entry.file} bytes match manifest SHA-256`);
      assert.equal(raw.length, entry.size_bytes, `${tree}/${entry.file} size matches manifest`);
    }
  });

  test(`integrity: ${tree} JSONs parse, carry provenance, no NaN/placeholder values`, () => {
    const files = readdirSync(path.join(root, tree)).filter((f) => f.endsWith('.json') && f !== 'MANIFEST.json');
    assert.ok(files.length > 0, `${tree} is not empty`);
    for (const f of files) {
      const raw = readFileSync(path.join(root, tree, f), 'utf8');
      const json = JSON.parse(raw); // throws on invalid JSON
      assert.equal(JSON.stringify(json).includes('NaN'), false, `${tree}/${f} contains NaN literal`);
      assert.equal(JSON.stringify(json).toLowerCase().includes('"todo": true'), false, `${tree}/${f} is a placeholder`);
      if (f !== 'MANIFEST.json') {
        assert.match(raw, PROVENANCE_TAG, `${tree}/${f} carries provenance_status verified_offline_standard`);
        assert.match(raw, UNITS_TAG, `${tree}/${f} declares units`);
        assert.match(raw, /"source_citation"/, `${tree}/${f} cites its authoritative source`);
      }
    }
  });
}

/** Every JSON Schema in docs/master-plan/schemas/ is valid JSON with $schema. */
test('integrity: all master-plan JSON Schemas are valid JSON with $schema + required keys', () => {
  const schemaDir = path.join(root, 'docs', 'master-plan', 'schemas');
  assert.ok(existsSync(schemaDir), 'schemas directory exists');
  const files = readdirSync(schemaDir).filter((f) => f.endsWith('.json'));
  assert.ok(files.length >= 4, 'at least the 4 core schemas exist');
  for (const f of files) {
    const json = JSON.parse(readFileSync(path.join(schemaDir, f), 'utf8'));
    assert.equal(json.$schema, 'https://json-schema.org/draft/2020-12/schema', `${f} pins draft 2020-12`);
    assert.ok(json.type === 'object', `${f} root type is object`);
    assert.ok(Array.isArray(json.required), `${f} declares required keys`);
  }
});

const plan = path.join(root, 'docs', 'master-plan');
const phases = path.join(plan, 'phases');
const phase07 = 'PHASE_07_PHOTOREALISTIC_STUDIO_RENDERING.md';
const phase08 = 'PHASE_08_NATIVE_RUST_KERNEL_AND_LIVE_STUDIOS.md';

function headingAnchor(heading) {
  return heading.trim().toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-');
}

test('integrity: the ledger has one row per work package and the v4 baseline stays verified', () => {
  const ledger = readFileSync(path.join(plan, '05_ACCEPTANCE_LEDGER.md'), 'utf8');
  const rows = [...ledger.matchAll(/^\| (WP-(?:0A|\d+)\.\d+) \|[^|]*\| (\w+) \| ([^|]*)\|([^|]*)\|(.*)\|[ \t]*$/gm)];
  const byId = new Map(rows.map(([, id, status, dependencies, verification, evidence]) =>
    [id, { status, dependencies: dependencies.trim(), verification, evidence }]));
  assert.equal(rows.length, 49, 'the v5 lock defines 49 work packages');
  assert.equal(rows.length, byId.size, 'duplicate work package rows');
  assert.equal([...byId.keys()].filter((id) => !/^WP-[78]\./.test(id)).length, 39);

  for (const [id, row] of byId) {
    assert.ok(['VERIFIED', 'IN_PROGRESS', 'NOT_STARTED'].includes(row.status), `${id} has a valid status`);
    if (!/^WP-[78]\./.test(id)) assert.equal(row.status, 'VERIFIED', `${id} is a verified v4 baseline`);
  }

  for (const file of readdirSync(phases).filter((file) => /^PHASE_.*\.md$/.test(file))) {
    const playbook = readFileSync(path.join(phases, file), 'utf8');
    for (const id of new Set(playbook.match(/WP-(?:0A|\d+)\.\d+/g))) {
      assert.ok(byId.has(id), `${id} from ${file} has a ledger row`);
    }
  }

  const phase7Ids = ['WP-7.1', 'WP-7.2', 'WP-7.3', 'WP-7.4', 'WP-7.5'];
  const dependencies = {
    'WP-7.1': 'WP-6.5',
    'WP-7.2': 'WP-6.5',
    'WP-7.3': 'WP-7.1, WP-7.2',
    'WP-7.4': 'WP-7.1, WP-7.2',
    'WP-7.5': 'WP-7.1, WP-7.2',
    'WP-8.1': phase7Ids.join(', '),
    'WP-8.2': 'WP-8.1',
    'WP-8.3': 'WP-8.1, WP-8.2',
    'WP-8.4': 'WP-8.1',
    'WP-8.5': 'WP-8.2, WP-8.3, WP-8.4',
  };
  for (const [phase, file] of [[7, phase07], [8, phase08]]) {
    const playbook = readFileSync(path.join(phases, file), 'utf8');
    const sections = playbook.split(/^## (?=WP-)/m).slice(1);
    const ids = Object.keys(dependencies).filter((id) => id.startsWith(`WP-${phase}.`));
    assert.deepEqual(sections.map((section) => section.split(' ', 1)[0]), ids, file);
    for (const [index, section] of sections.entries()) {
      const id = ids[index];
      const row = byId.get(id);
      assert.equal(row.dependencies, dependencies[id], `${id} follows the locked DAG`);
      assert.match(row.verification, /Playwright.+WebView2|Playwright.+native installer smoke/, `${id} requires desktop verification`);
      if (row.status === 'NOT_STARTED') {
        const anchor = headingAnchor(section.split('\n', 1)[0]);
        assert.ok(row.evidence.includes(`[${id}](phases/${file}#${anchor})`), `${id} links to its exact checklist`);
      }
      for (const label of ['Objective', 'Exact files', 'Interface contracts', 'Failure modes', 'Hard acceptance gates']) {
        assert.ok(section.includes(`**${label}**`), `${id} specifies ${label}`);
      }
      assert.match(section, /^- \[[ x]\] /m, `${id} has a checklist`);
      assert.match(section.split('**Hard acceptance gates**')[1], /Playwright/, `${id} has a UI gate`);
    }
  }
});

test('integrity: Phase 07 and Phase 08 are indexed and governed by Law 7', () => {
  const rules = readFileSync(path.join(plan, '01_BUILDER_RULES.md'), 'utf8');
  assert.match(rules, /^## Law 7 — End-to-End Desktop Visibility\s*$/m);
  for (const name of ['00_INDEX.md', '02_SYSTEM_ARCHITECTURE.md', '04_ROADMAP_MASTER.md']) {
    const document = readFileSync(path.join(plan, name), 'utf8');
    for (const file of [phase07, phase08]) {
      assert.ok(document.includes(`](phases/${file})`), `${name} links to ${file}`);
    }
  }
  for (const file of [phase07, phase08]) {
    assert.match(readFileSync(path.join(phases, file), 'utf8'), /\[Law 7\]/, `${file} makes Law 7 explicit`);
  }
});

test('integrity: zero broken relative markdown links or heading anchors in docs/master-plan', () => {
  const markdownFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(file);
    return entry.name.endsWith('.md') ? [file] : [];
  });
  const files = markdownFiles(plan);
  assert.ok(files.length >= 15, 'master-plan markdown inventory complete');
  const linkRe = /\]\((?![a-z]+:)([^)#]*)(?:#([^)]*))?\)/gi;
  for (const file of files) {
    const md = readFileSync(file, 'utf8');
    for (const [, relative, anchor] of md.matchAll(linkRe)) {
      const target = relative ? path.resolve(path.dirname(file), relative.trim()) : file;
      const source = path.relative(root, file);
      assert.ok(existsSync(target), `${source} → broken relative link: ${relative}`);
      if (anchor && target.endsWith('.md')) {
        const headings = readFileSync(target, 'utf8').matchAll(/^#{1,6}[ \t]+(.+)$/gm);
        const anchors = Array.from(headings, ([, heading]) => headingAnchor(heading));
        assert.ok(anchors.includes(anchor), `${source} → missing heading: ${relative}#${anchor}`);
      }
    }
  }
});
