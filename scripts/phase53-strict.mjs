import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const p=JSON.parse(await readFile('benchmarks/phase53/signoff-boundary.json'));
const r=JSON.parse(await readFile('benchmarks/evidence/phase53/phase53.json'));
const files=[...p.sourceOpenFlowScripts,'benchmarks/phase53/signoff-boundary.json'];
assert.equal(r.format,'invention-lab/phase53-source-traced-signoff-assessment/1');
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
for(const path of files){
 assert.equal(r.originalSourceSHA256[path],
 createHash('sha256').update(await readFile(path)).digest('hex'));
}
const blob=execFileSync('git',['hash-object','benchmarks/phase13/rtl/alu8.v'],{encoding:'utf8'}).trim();
assert.equal(blob,'3a41d0163a473a00b17a7c4b1893169961519f54');
assert.equal(r.originalRtlGitBlobSHA1,blob);
assert.equal(p.sourcePDKNotice,'experimental-preview-not-intended-for-production');
assert.equal(p.requiredIndependentFoundrySignoff.length,10);
assert.ok(p.requiredIndependentFoundrySignoff.every(x=>x.foundryQualified===false&&x.independentApprovalRecord===null));
assert.deepEqual(r.decision.missingFoundryAcceptanceClasses,p.requiredIndependentFoundrySignoff.map(x=>x.id));
assert.equal(r.decision.originalSignedGDSExternallyAuthenticated,false);
assert.equal(r.decision.maskTapeoutAuthorized,false);
assert.equal(r.decision.foundryCertified,false);
assert.equal(r.genuineFoundrySignoffDocumentAvailable,false);
assert.equal(r.actualSiliconTestMeasurements,0);
assert.equal(r.physicalVerdict,'unknown');
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH53 STRICT PASS: original ALU blob/source checks and experimental PDK not production-signoff');