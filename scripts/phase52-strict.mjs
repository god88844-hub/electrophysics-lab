import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const paths=['benchmarks/phase52/reference-system-qualification.json',
 'benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase42/physical-capture-protocol.json',
 'benchmarks/phase48/whole-system-readiness.json',
 'benchmarks/phase51/fault-model-scope.json'];
const raws=await Promise.all(paths.map(x=>readFile(x)));
const [policy,h,c,w,f]=raws.map(x=>JSON.parse(x));
const r=JSON.parse(await readFile('benchmarks/evidence/phase52/phase52.json'));
assert.equal(r.format,'invention-lab/phase52-source-locked-hardware-readiness/1');
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
for(let i=0;i<paths.length;i++)assert.equal(r.originalSHA256[paths[i]],
 createHash('sha256').update(raws[i]).digest('hex'));
assert.equal(r.decision.missingPhysicalGates.length,12);
assert.deepEqual(r.decision.missingPhysicalGates,policy.requiredPhysicalGates.map(x=>x.id));
assert.ok(policy.requiredPhysicalGates.every(x=>x.verified===false&&x.evidence===null&&x.independentReview===null));
assert.equal(h.actualPhysicalFanMeasurements,0);
assert.equal(c.actualSourceMatchedFanMeasurements,0);
assert.equal(w.originalPhysicalSamples,0);
assert.equal(f.realUnitFailureCounts,0);
assert.equal(r.decision.authorizationToSpinOrEnergizeImpeller,false);
assert.equal(r.decision.qualifiedActualSpecimens,0);
assert.equal(r.decision.releaseDecision,'NO_GO_MISSING_REAL_ASSEMBLY_AND_SAFETY_EVIDENCE');
assert.equal(r.decision.realWorldBuildSuccessPercent,null);
assert.equal(r.physicalReviewAuthenticated,false);
assert.equal(r.physicalValidation,'none');
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH52 STRICT PASS: independent immutable hardware-source evidence audit, 12 mandatory gates still missing');