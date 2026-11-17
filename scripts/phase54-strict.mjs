import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const paths=['benchmarks/phase54/prototype-acquisition-policy.json',
 'benchmarks/phase53/signoff-boundary.json','benchmarks/phase13/rtl/alu8.v',
 'benchmarks/phase27/acceptance.json'];
const r=JSON.parse(await readFile('benchmarks/evidence/phase54/phase54.json'));
const raw=await Promise.all(paths.map(p=>readFile(p)));
assert.equal(r.format,'invention-lab/phase54-original-alu-source-lab-handoff/1');
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
for(let i=0;i<paths.length;i++)assert.equal(r.inputSourceSHA256[paths[i]],
 createHash('sha256').update(raw[i]).digest('hex'));
assert.equal(r.originalRtlGitBlobSHA1,execFileSync('git',['hash-object',paths[2]],{encoding:'utf8'}).trim());
assert.equal(r.originalRtlGitBlobSHA1,'3a41d0163a473a00b17a7c4b1893169961519f54');
const {labFacingInputHandoff:p,untrustedBlankReturnAssessment:review}=r;
assert.equal(p.vectorInputs.length,1024);
assert.equal(p.plannedSessions.length,48);
assert.equal(p.plannedDies.length,8);
assert.equal(new Set(p.plannedSessions.map(x=>x.sessionId)).size,48);
assert.equal(new Set(p.plannedDies.map(x=>x.slotId)).size,8);
assert.deepEqual(p.vectorInputs.map(x=>x.index),Array.from({length:1024},(_,i)=>i));
assert.equal(createHash('sha256').update(JSON.stringify(p.vectorInputs)).digest('hex'),
 'c41a51ffcb1ffbbdc92e5668c98de176746b21ece709f9a235aee4484b23ab26');
for(const v of p.vectorInputs)assert.deepEqual(Object.keys(v).sort(),['a','b','index','op']);
for(const sess of p.plannedSessions){
 assert.equal(sess.rawInstrumentExportSHA256,null);
 assert.equal(sess.measuredVectorReadings,0);
 assert.equal(sess.independentCalibrationAttested,false);
}
for(const die of p.plannedDies)assert.equal(die.purchasedDieIdentity,null);
assert.equal(p.predictedDigitalOutputsIncluded,false);
assert.equal(p.actualManufacturedDieCount,0);
assert.equal(p.actualOriginalInstrumentReadings,0);
assert.equal(review.originalDieAndMaskSourceIndependentlyAuthenticated,false);
assert.equal(review.authenticatedHardwareSamplesAdmitted,0);
assert.equal(review.physicalProofReady,false);
assert.equal(review.physicalMeasurementValuesAdmitted,0);
assert.equal(r.physicallyManufacturedALUDies,0);
assert.equal(r.originalInstrumentMeasurements,0);
assert.equal(r.physicalMaskTapeoutAuthorized,false);
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH54 STRICT PASS: 1024 original blind input vectors, 48 unmeasured sessions, zero independently verified physical silicon');