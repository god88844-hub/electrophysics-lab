import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {compareCompilerEngines,SAMPLE} from '../js/evidence/phase58-compiler-cosim.js';
const policyPath='benchmarks/phase58/compiler-cosimulation-policy.json';
const original=await readFile(policyPath),policy=JSON.parse(original);
if(policy.rtlWaveformComparisonAvailable||policy.originalHardwareReadings)
 throw Error('Unfounded RTL or physical hardware qualification');
const report={format:'invention-lab/phase58-compiler-engine-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourcePolicySHA256:createHash('sha256').update(original).digest('hex'),
 result:compareCompilerEngines(SAMPLE)};
if(!report.result.pass)throw Error('Architectural comparison failed');
await mkdir('benchmarks/evidence/phase58',{recursive:true});
await writeFile('benchmarks/evidence/phase58/phase58.json',JSON.stringify(report,null,2)+'\n');
console.log('PH58 PASS: source-compiled byte-program compared against two software CPU engines; no RTL/silicon claim');