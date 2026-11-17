import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyBatteryAssumptions,evaluateBatteryScenario} from '../js/evidence/phase43-battery-model.js';
const files=['benchmarks/phase43/e91-assumptions.json','benchmarks/phase41/reference-hardware-candidate.json'];
const [aRaw,bRaw]=await Promise.all(files.map(f=>readFile(f)));
const a=JSON.parse(aRaw),b=JSON.parse(bRaw);
verifyBatteryAssumptions(a,b);
const scenarios=[0,0.5,4].map(currentA=>evaluateBatteryScenario(a,b,{assumedCurrentA:currentA,ambientTemperatureC:21}));
const report={format:'invention-lab/phase43-e91-source-conditional-replay/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 batterySourceSHA256:createHash('sha256').update(aRaw).digest('hex'),
 originalHardwareCandidateSHA256:createHash('sha256').update(bRaw).digest('hex'),
 scenarios,originalSourceMatchedBatterySpecimens:0,
 actualFullDischargeCurvesMeasured:0,measuredRuntimeDistribution:null,
 batteryExperimentComplete:false,scientificStatus:'CONDITIONAL_NOT_CALIBRATED',
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
await mkdir('benchmarks/evidence/phase43',{recursive:true});
await writeFile('benchmarks/evidence/phase43/phase43.json',JSON.stringify(report,null,2)+'\n');
console.log('PH43 REPORT PASS: 3 nominal-IR conditional scenarios, 0 source-matched battery specimens, no physical runtime validation');