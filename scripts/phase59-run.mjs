import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {scheduleMatrix,SAMPLE} from '../js/evidence/phase59-scheduler.js';
const path='benchmarks/phase59/accelerator-scheduler-policy.json',raw=await readFile(path),p=JSON.parse(raw);
if(p.measuredAcceleratorPerformanceSamples!==0||p.physicalValidation!=='none')
 throw Error('Cannot promote synthetic latency to measured silicon evidence');
const r={format:'invention-lab/phase59-scheduler-model-evidence/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourcePolicySHA256:createHash('sha256').update(raw).digest('hex'),
 systolic:scheduleMatrix(SAMPLE),simt:scheduleMatrix({...SAMPLE,architecture:'simt',lanes:8})};
if(!r.systolic.functionalMatchesReference||!r.simt.functionalMatchesReference)
 throw Error('Independent accelerator arithmetic mismatch');
await mkdir('benchmarks/evidence/phase59',{recursive:true});
await writeFile('benchmarks/evidence/phase59/phase59.json',JSON.stringify(r,null,2)+'\n');
console.log('PH59 PASS: bounded SIMT/systolic tile models, independent INT8 arithmetic; physical power/timing unknown');