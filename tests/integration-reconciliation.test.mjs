import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
// Generic CI jobs commonly fetch HEAD only. Do not invent Git-ancestry evidence
// from a shallow checkout; the dedicated integration workflow fetches depth=0.
const historyAvailable=execFileSync('git',['rev-parse','--is-shallow-repository'],{encoding:'utf8'}).trim()==='false';
const requiresHistory=historyAvailable?{}:{skip:'Full Git ancestry unavailable in shallow checkout; dedicated integration CI verifies with fetch-depth: 0'};
import {integrationAudit,MAIN,PHASE3,PHASE72,RESTORED} from '../js/release/integration-reconcile.js';
test('Both phase-history ancestors, exact source blobs and original measurements are preserved',requiresHistory,async()=>{
 const a=await integrationAudit();
 assert.equal(a.ancestorChecks[MAIN],true);
 assert.equal(a.ancestorChecks[PHASE3],true);
 assert.equal(a.ancestorChecks[PHASE72],true);
 assert.deepEqual(a.missingMainPaths,[]);
 assert.deepEqual(a.missingPhase72Paths,[]);
 assert.equal(Object.keys(a.exactRestoredPhase3Files).length,Object.keys(RESTORED).length);
 assert.ok(Object.values(a.exactRestoredPhase3Files).every(x=>x.exact));
 assert.ok(Object.values(a.unmodifiedPhase3ScientificModules).every(x=>x.unchanged));
 assert.ok(Object.values(a.baselineReferenceBenchmarks).every(x=>x.preserved));
});
test('Automated source integrity does not claim user, independent hardware or production approval',requiresHistory,async()=>{
 const x=await integrationAudit();
 assert.equal(x.mainBranchChangedByAudit,false);
 assert.equal(x.completeMergingAllOldPRs,false);
 assert.equal(x.realWorldBuildSuccessPercent,null);
 assert.equal(x.independentScientificReview,'NOT_PERFORMED');
});
