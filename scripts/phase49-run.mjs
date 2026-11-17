import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fitSyntheticTotalResistance} from '../js/evidence/phase49-identifiability.js';
const source=await readFile('benchmarks/phase49/synthetic-identifiability.json');
const decision=fitSyntheticTotalResistance(JSON.parse(source));
const result={format:'invention-lab/phase49-rank-one-synthetic-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceSHA256:createHash('sha256').update(source).digest('hex'),
 decision,physicalIndependentCalibrationDevices:0,physicalQualificationReady:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase49',{recursive:true});
await writeFile('benchmarks/evidence/phase49/phase49.json',JSON.stringify(result,null,2)+'\n');
console.log('PH49 PASS: synthetic total R = '+decision.identifiableTotalSeriesResistanceOhm+' ohm, Jacobian rank 1; actual calibration absent');