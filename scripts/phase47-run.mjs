import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyCoupledHypotheses,simulateCoupledHypothesis} from '../js/evidence/phase47-coupled-solver.js';
const paths=['benchmarks/phase47/coupled-hypotheses.json',
'benchmarks/phase41/reference-hardware-candidate.json',
'benchmarks/phase43/e91-assumptions.json',
'benchmarks/phase44/copper-harness-assumptions.json',
'benchmarks/phase45/pololu1592-endpoint-model.json',
'benchmarks/phase46/fan-affinity-assumptions.json'];
const bufs=await Promise.all(paths.map(x=>readFile(x)));
const [p,candidate,battery,wire,motor,fan]=bufs.map(x=>JSON.parse(x));
const models={candidate,battery,wire,motor,fan};verifyCoupledHypotheses(p,models);
const runs=[0,5e-10,1e-9].map(x=>simulateCoupledHypothesis(p,models,
 {fanTorqueCoefficientNmPerRadPerS_Squared:x}));
const report={format:'invention-lab/phase47-source-locked-conditional-coupled-simulator/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceHashes:Object.fromEntries(paths.map((x,i)=>[x,createHash('sha256').update(bufs[i]).digest('hex')])),
 runs,physicalMatchedFanTests:0,actualFanLoadTorqueCurve:null,
 measuredThermalTimeConstants:null,physicallyCalibratedMotorConstants:null,
 systemModelPhysicallyValidated:false,physicalValidation:'none',
 physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase47',{recursive:true});
await writeFile('benchmarks/evidence/phase47/phase47.json',JSON.stringify(report,null,2)+'\n');
console.log('PH47 SOURCE-CONTROLLED REPORT PASS: three coupled-energy hypothetical load scenarios, physical fan validation UNKNOWN');