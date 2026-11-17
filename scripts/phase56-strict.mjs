import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {blankAdmission,assessAdmission} from '../js/evidence/phase56-admission.js';
const paths=['benchmarks/phase56/admission-policy.json','benchmarks/phase55/provenance-policy.json',
 'benchmarks/phase54/prototype-acquisition-policy.json','benchmarks/phase53/signoff-boundary.json'];
const bytes=await Promise.all(paths.map(x=>readFile(x)));
const inputs=bytes.map(x=>JSON.parse(x)),r=JSON.parse(await readFile('benchmarks/evidence/phase56/phase56.json'));
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
for(let i=0;i<paths.length;i++)assert.equal(r.originalInputsSHA256[paths[i]],createHash('sha256').update(bytes[i]).digest('hex'));
assert.deepEqual(r.intake,blankAdmission(...inputs));assert.deepEqual(r.decision,assessAdmission(...inputs));
assert.equal(r.decision.verifiedPhysicalMeasurementsAdmitted,0);
assert.equal(r.decision.physicalQualification,'UNKNOWN');
assert.equal(r.realWorldBuildSuccessPercent,null);
console.log('PH56 STRICT PASS: source SHA replay and original external-hardware NO-GO');