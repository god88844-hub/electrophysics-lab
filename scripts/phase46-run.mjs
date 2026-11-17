import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyFanReference,evaluateFanAffinity} from '../js/evidence/phase46-fan-affinity.js';
const paths=['benchmarks/phase46/fan-affinity-assumptions.json','benchmarks/phase41/reference-hardware-candidate.json'];
const bufs=await Promise.all(paths.map(p=>readFile(p)));
const [a,c]=bufs.map(x=>JSON.parse(x));verifyFanReference(a,c);
const cases=a.hypotheticalScenarioSpeedsRpm.map(hypotheticalRpm=>evaluateFanAffinity(a,c,{hypotheticalRpm}));
const report={format:'invention-lab/phase46-fan-laws-ratio-only-report/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceHashes:Object.fromEntries(paths.map((p,i)=>[p,createHash('sha256').update(bufs[i]).digest('hex')])),
 cases,measuredSourceMatchedFanSpecimens:0,absoluteFanTorqueCurve:null,
 safeFanSpeedLimitRpm:null,shaftFitVerified:false,physicalTestingAuthorized:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase46',{recursive:true});
await writeFile('benchmarks/evidence/phase46/phase46.json',JSON.stringify(report,null,2)+'\n');
console.log('PH46 REPORT PASS: three ratios only, NO absolute fan flow/torque or qualified spinning speed');