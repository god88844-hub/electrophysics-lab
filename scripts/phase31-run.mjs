// Real mathematical model computation; zero invented fan or silicon observations.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fanIllustrativeScenario,predictFan,MOTOR_MODEL} from '../js/evidence/phase31-first-principles.js';
const root='benchmarks/evidence/phase31/';
const original=await readFile('benchmarks/phase31/acceptance.json');
const policy=JSON.parse(original);
const sha=b=>createHash('sha256').update(b).digest('hex');
if(policy.format!=='invention-lab/phase31-first-principles-conditional-physics/1'||
   policy.illustrativeModel!==MOTOR_MODEL||policy.nominalVoltageV!==3||
   policy.nominalVariationStdPercent!==4||policy.minModeledRpm!==900||
   policy.maxMotorCurrentA!==0.8||policy.assumedDiscrepancyRpm!==150||
   policy.experimentalFanMeasurements!==0||policy.physicalFanValidation!==false||
   policy.independentHardwareDataAvailable!==false||
   policy.fanManufacturingYieldEstimate!==null||
   policy.actualPhysicalFanSuccessPercent!==null||
   policy.physicalValidation!=='none'||policy.physicalVerdict!=='unknown'||
   policy.realWorldBuildSuccessPercent!==null)throw Error('Phase31 policy tampered / unmeasured physical evidence invented');
const known={
 voltageV:3,sourceResistanceOhm:0.25,wireResistanceOhm:0.15,
 motorResistanceOhm:5,motorConstantSI:0.012,
 staticFrictionTorqueNm:0.0006,runningFrictionTorqueNm:0.0004,
 dragCoefficientNmPerRad2:2e-7
};
const exact=predictFan(known);
const baseline=fanIllustrativeScenario({samples:5000,seed:31,voltageV:3,
 voltageStdPercent:4,minRpm:900,maxMotorCurrentA:0.8});
const sensitivity=fanIllustrativeScenario({samples:5000,seed:31,voltageV:3,
 voltageStdPercent:4,minRpm:900,maxMotorCurrentA:0.8,
 rpmDiscrepancyAllowance:150});
const blocked=predictFan({...known,staticFrictionTorqueNm:1});
if(baseline.status!=='model-only'||sensitivity.status!=='model-only'||
 baseline.realWorldBuildSuccessPercent!==null||
 sensitivity.realWorldBuildSuccessPercent!==null||
 blocked.started!==0||blocked.speedRpm!==0||
 sensitivity.conditionalWorstCaseModeledSuccessPercent>baseline.conditionalModeledSuccessPercent||
 sensitivity.conditionalBestCaseModeledSuccessPercent<baseline.conditionalModeledSuccessPercent)
 throw Error('Model success probability, startup or discrepancy monotonicity failed');
const input={
 phase30ReferenceSourceCommit:'0ee731adb6372a694e6c374eb806d43d16f1282e',
 versionedPolicySha256:sha(original),
 sourceCodeSha256:sha(await readFile('js/evidence/phase31-first-principles.js')),
 browserCodeSha256:sha(await readFile('js/ui/app.js')),
 browserSmokeSha256:sha(await readFile('tests/browser-3d.html'))
};
const record={
 format:'invention-lab/phase31-computed-conditional-first-principles-simulation/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 input,nominal:exact,baseline,sensitivity,jammedFan:blocked,
 actualMeasuredFanSamples:0,physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null,
 statisticalScope:'Monte Carlo sampling uncertainty only; model error and real component population unverified'
};
await mkdir(root,{recursive:true});
await writeFile(root+'phase31.json',JSON.stringify(record,null,2)+'\n');
console.log('PH31 fan first principles: nominal '+exact.speedRpm.toFixed(2)+' RPM, '+exact.motorCurrentA.toFixed(4)+' A');
console.log('PH31 CONDITIONAL model success '+baseline.conditionalModeledSuccessPercent.toFixed(2)+'%; physical success UNKNOWN, not claimed');
