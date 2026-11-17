import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {integrationAudit} from '../js/release/integration-reconcile.js';
const stored=JSON.parse(await readFile('benchmarks/evidence/integration/integration.json','utf8'));
assert.deepEqual(stored,await integrationAudit());
console.log('STRICT REPLAY PASS: source reconciliation archive matches live tracked Git history');