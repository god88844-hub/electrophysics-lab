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

/** Work Package IDs: every PHASE_*.md WP-X.Y appears in 05_ACCEPTANCE_LEDGER.md. */
test('integrity: every WP-X.Y in phase playbooks appears in the acceptance ledger', () => {
  const phasesDir = path.join(root, 'docs', 'master-plan', 'phases');
  const ledger = readFileSync(path.join(root, 'docs', 'master-plan', '05_ACCEPTANCE_LEDGER.md'), 'utf8');
  const phaseFiles = readdirSync(phasesDir).filter((f) => f.startsWith('PHASE_') && f.endsWith('.md'));
  assert.ok(phaseFiles.length >= 7, 'all 7 phase playbooks exist');
  let totalWps = 0;
  for (const f of phaseFiles) {
    const md = readFileSync(path.join(phasesDir, f), 'utf8');
    const wps = md.match(/WP-[0-9A-z]+\.\d+/g) ?? [];
    totalWps += wps.length;
    for (const wp of new Set(wps)) {
      assert.ok(ledger.includes(wp), `${f} declares ${wp} — must appear in 05_ACCEPTANCE_LEDGER.md`);
    }
  }
  assert.ok(totalWps >= 30, `work-package count ${totalWps} ≥ 30 (granular plan)`);
});

/** No broken relative markdown links inside docs/master-plan/. */
test('integrity: zero broken relative markdown links in docs/master-plan', () => {
  const base = path.join(root, 'docs', 'master-plan');
  const files = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = path.join(dir, f);
      if (f.endsWith('.md')) files.push(p);
      else if (!f.includes('.')) walk(p);
      else if (f.endsWith('.json')) continue;
      else walk(p);
    }
  };
  walk(base);
  assert.ok(files.length >= 13, 'master-plan markdown inventory complete');
  const linkRe = /\]\((?!http|https|#|mailto)([^)#]+)/g;
  for (const file of files) {
    const md = readFileSync(file, 'utf8');
    for (const m of md.matchAll(linkRe)) {
      const target = path.resolve(path.dirname(file), m[1].trim());
      assert.ok(
        existsSync(target),
        `${path.relative(root, file)} → broken relative link: ${m[1]}`
      );
    }
  }
});
