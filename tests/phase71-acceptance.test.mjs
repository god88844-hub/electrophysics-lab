import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WORKFLOWS,verifyApiFreeze,evaluateExample,runAcceptance} from '../js/evidence/phase71-acceptance.js';
const policy=JSON.parse(readFileSync(new URL('../benchmarks/phase71/acceptance-policy.json',import.meta.url),'utf8'));
test('Public API is frozen by exact committed source blob identifiers',()=>{
 assert.equal(verifyApiFreeze(policy),true);
 const altered=structuredClone(policy);altered.frozenGitBlobs['js/core/registry.js']='f'.repeat(40);
 assert.throws(()=>verifyApiFreeze(altered),/Public API source changed/);
 const fake=structuredClone(policy);fake.independentlyAcceptedByUsers=true;assert.throws(()=>verifyApiFreeze(fake));
});
test('Six representative built-in designs roundtrip, run and produce scientific reports',()=>{
 const r=runAcceptance(policy);
 assert.equal(r.examplesPassing,6);
 assert.ok(r.cases.every(x=>x.importedAndExportedWithoutDataLoss&&x.simulationReturned&&x.failedChecks===0));
 assert.equal(r.representativeHumanUserAcceptance,'NOT_CONDUCTED');
});
test('Reject invalid/mismatched examples and refuse fictional human acceptance',()=>{
 assert.throws(()=>evaluateExample({lab:'logic',example:'chip-divider'}));
 assert.throws(()=>evaluateExample({lab:'fake',example:'invalid'}));
 assert.equal(evaluateExample(WORKFLOWS[0]).realWorldBuildSuccessPercent,null);
});
