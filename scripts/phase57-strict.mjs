import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {releaseAudit} from '../js/evidence/phase57-unified-audit.js';
const r=JSON.parse(await readFile('benchmarks/evidence/phase57/phase57.json'));
const paths=Object.keys(r.inputsSha256);
const buf=await Promise.all(paths.map(p=>readFile(p)));
for(let i=0;i<paths.length;i++)assert.equal(r.inputsSha256[paths[i]],createHash('sha256').update(buf[i]).digest('hex'));
assert.equal(r.sourceCommit,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
const get=p=>JSON.parse(buf[paths.indexOf(p)]),txt=p=>buf[paths.indexOf(p)].toString();
const inputs={phase56:get(paths[1]),phase55:get(paths[2]),phase54:get(paths[3]),
 phase53:get(paths[4]),phase52:get(paths[5]),
 fanSources:{hardware:get(paths[6]),capture:get(paths[7]),whole:get(paths[8]),fault:get(paths[9])},
 flowScripts:Object.fromEntries(paths.slice(10).map(p=>[p,txt(p)]))};
assert.deepEqual(r.decision,releaseAudit(get(paths[0]),inputs));
assert.equal(r.decision.physicalProofSufficient,false);
assert.equal(r.decision.productionReleaseAuthorized,false);
assert.equal(r.decision.realWorldBuildSuccessPercent,null);
console.log('PH57 STRICT PASS: source-hash replay and physical release/production NO-GO');