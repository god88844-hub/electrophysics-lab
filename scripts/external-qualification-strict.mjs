import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {INPUTS,prepareExternalQualificationPacket,verifyExternalQualificationPacket} from '../js/release/external-qualification-kit.js';
import assert from 'node:assert/strict';
const raw=Object.fromEntries(await Promise.all(INPUTS.map(async path=>[path,await readFile(path)])));
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const actual=JSON.parse(await readFile('benchmarks/evidence/external-qualification/qualification-request.json','utf8'));
verifyExternalQualificationPacket(actual);
assert.deepEqual(actual,prepareExternalQualificationPacket(head,raw));
const md=await readFile('benchmarks/evidence/external-qualification/lab-and-reviewer-request.md','utf8');
for(const s of [head,'NOT QUALIFIED','Foundry/tapeout approval','NO-GO','SHA-256']){
 if(!md.includes(s))throw Error('External handoff missing required precaution '+s);
}
assert.equal(actual.originalEvidenceIntake.receivedExternalEvidenceFiles,0);
assert.equal(actual.originalEvidenceIntake.approvedIndependentReviewers,0);
assert.equal(actual.signedProductReleaseAuthorized,false);
console.log('EXTERNAL QUALIFICATION STRICT PASS: source-bound request and honest external evidence NO-GO');
