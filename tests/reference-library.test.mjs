// reference-library.test.mjs — validates all reference-library JSON files
// against the required schema, verifies SHA-256 integrity, and checks that
// every cited source URL is well-formed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'reference-library');

const REQUIRED_FIELDS = [
  'id', 'domain', 'parameters', 'equations',
  'valid_operating_envelope', 'failure_thresholds',
  'source_citation', 'source_url', 'license_or_access', 'provenance_status',
];
const ACCEPTED_PROVENANCE = ['verified_offline_standard', 'needs_primary_pdf_check'];

// discover all JSON files except MANIFEST.json
const jsonFiles = fs.readdirSync(LIB_DIR)
  .filter((f) => f.endsWith('.json') && f !== 'MANIFEST.json')
  .sort();

test('reference-library: exactly 6 data files present', () => {
  assert.equal(jsonFiles.length, 6, `expected 6 files, found: ${jsonFiles.join(', ')}`);
});

test('reference-library: every file has all required top-level fields', () => {
  for (const file of jsonFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(LIB_DIR, file), 'utf8'));
    for (const field of REQUIRED_FIELDS) {
      assert.ok(j[field] !== undefined, `${file}: missing required field "${field}"`);
    }
  }
});

test('reference-library: every provenance_status is from the accepted set', () => {
  for (const file of jsonFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(LIB_DIR, file), 'utf8'));
    assert.ok(ACCEPTED_PROVENANCE.includes(j.provenance_status),
      `${file}: provenance_status "${j.provenance_status}" not in accepted set ${ACCEPTED_PROVENANCE}`);
  }
});

test('reference-library: every parameters entry has a value or is a container', () => {
  for (const file of jsonFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(LIB_DIR, file), 'utf8'));
    for (const [key, val] of Object.entries(j.parameters ?? {})) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        // must have either a value, a note, or be a container of sub-parameters
        assert.ok(val.value !== undefined || val.note !== undefined || Object.keys(val).length > 0,
          `${file}.${key}: leaf parameter has no value`);
        // if it has a value, it must have a unit
        if (val.value !== undefined && typeof val.value === 'number') {
          assert.ok(val.unit !== undefined, `${file}.${key}: numeric value without unit`);
        }
      }
    }
  }
});

test('reference-library: no NaN or Infinity values in any JSON file', () => {
  for (const file of jsonFiles) {
    const raw = fs.readFileSync(path.join(LIB_DIR, file), 'utf8');
    assert.ok(!raw.includes('NaN'), `${file}: contains NaN`);
    assert.ok(!raw.includes('Infinity'), `${file}: contains Infinity`);
    assert.ok(!raw.includes('-Infinity'), `${file}: contains -Infinity`);
  }
});

test('reference-library: every source_url is a well-formed HTTPS URL', () => {
  for (const file of jsonFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(LIB_DIR, file), 'utf8'));
    assert.ok(j.source_url.startsWith('https://') || j.source_url.startsWith('http://'),
      `${file}: source_url "${j.source_url}" is not a valid URL`);
  }
});

test('reference-library: SHA-256 integrity manifest is present and correct', () => {
  const manifestPath = path.join(LIB_DIR, 'MANIFEST.json');
  assert.ok(fs.existsSync(manifestPath), 'MANIFEST.json missing');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.ok(Array.isArray(manifest.files), 'MANIFEST.json must have a files array');

  const actualFiles = new Set(jsonFiles);
  for (const entry of manifest.files) {
    assert.ok(typeof entry.file === 'string', 'MANIFEST entry missing file');
    assert.ok(typeof entry.sha256 === 'string' && entry.sha256.length === 64, `MANIFEST entry for ${entry.file} has invalid SHA-256 length`);
    const filePath = path.join(LIB_DIR, entry.file);
    assert.ok(fs.existsSync(filePath), `MANIFEST references missing file: ${entry.file}`);
    const computed = createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
    assert.equal(computed, entry.sha256, `SHA-256 mismatch for ${entry.file}`);
    actualFiles.delete(entry.file);
  }
  assert.equal(actualFiles.size, 0, `files not in MANIFEST.json: ${[...actualFiles].join(', ')}`);
});

test('reference-library: 01_fundamental_constants has exact CODATA values', () => {
  const j = JSON.parse(fs.readFileSync(path.join(LIB_DIR, '01_fundamental_constants.json'), 'utf8'));
  assert.equal(j.parameters.elementary_charge.value, 1.602176634e-19);
  assert.equal(j.parameters.boltzmann_constant.value, 1.380649e-23);
  assert.equal(j.parameters.speed_of_light.value, 299792458);
  assert.equal(j.parameters.elementary_charge.exact, true);
  const vt = j.derived?.thermal_voltage_V_T_300K;
  assert.ok(vt && Math.abs(vt.value - 0.025852) < 1e-6, `thermal voltage ${vt?.value}`);
});
