import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const paths=['benchmarks/phase50/uncertainty-envelope.json',
 'benchmarks/phase41/reference-hardware-candidate.json',
 'benchmarks/phase43/e91-assumptions.json','benchmarks/phase44/copper-harness-assumptions.json',
 'benchmarks/phase45/pololu1592-endpoint-model.json',
 'benchmarks/phase49/synthetic-identifiability.json'];
const r=JSON.parse(await readFile('benchmarks/evidence/phase50/phase50.json'));
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
assert.equal(r.format,'invention-lab/phase50-source-interval-not-physical-prediction/1');
for(const path of paths)
 assert.equal(r.sourceSHA256[path],createHash('sha256').update(await readFile(path)).digest('hex'));
const d=.127e-3*Math.pow(92,12/39),area=Math.PI*d*d/4,wire=(1/58e6)*.5/area;
const low=3/(.75+.6+wire+.1),high=3/(.75+.3+wire);
assert.ok(Math.abs(r.bounds.hypotheticalStoppedRotorCurrentRangeA.lower-low)<1e-12);
assert.ok(Math.abs(r.bounds.hypotheticalStoppedRotorCurrentRangeA.upper-high)<1e-12);
assert.equal(r.bounds.physicallyQualified,false);
assert.equal(r.bounds.statisticallyCalibratedPredictionInterval,null);
assert.equal(r.bounds.physicalIndependentHoldoutSpecimens,0);
assert.equal(r.leakageCheck.groupSeparationClaimInternallyConsistent,true);
assert.equal(r.leakageCheck.externallyVerifiedHardwareSpecimenIDs,0);
assert.equal(r.actualPhysicalIndependentHoldoutTests,0);
assert.equal(r.physicalValidation,'none');
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH50 STRICT PASS: independent mathematical interval and zero original physical holdouts');