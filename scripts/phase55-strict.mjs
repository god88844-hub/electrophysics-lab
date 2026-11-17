import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {blankIntake,screenProvenance} from '../js/evidence/phase55-provenance.js';
const paths=['benchmarks/phase55/provenance-policy.json',
 'benchmarks/phase54/prototype-acquisition-policy.json','benchmarks/phase53/signoff-boundary.json'];
const raw=await Promise.all(paths.map(p=>readFile(p))),[p,old,signoff]=raw.map(b=>JSON.parse(b));
const report=JSON.parse(await readFile('benchmarks/evidence/phase55/phase55.json'));
assert.equal(report.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
for(let i=0;i<paths.length;i++)assert.equal(report.sourceSHA256[paths[i]],
 createHash('sha256').update(raw[i]).digest('hex'));
assert.deepEqual(report.intake,blankIntake(p,old,signoff));
assert.deepEqual(report.screen,screenProvenance(p,old,signoff));
assert.equal(report.screen.physicalProvenanceAccepted,false);
assert.equal(report.screen.originalRawFilesMatched,0);
assert.equal(report.realWorldBuildSuccessPercent,null);
console.log('PH55 STRICT PASS: original inputs independently replayed, no physical data admitted');