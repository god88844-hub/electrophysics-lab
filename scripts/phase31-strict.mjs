// Independent exact replay of seeded simulation, original user-facing UI,
// original frozen policy and model credibility boundaries.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {fanIllustrativeScenario,predictFan,MOTOR_MODEL} from '../js/evidence/phase31-first-principles.js';
const root='benchmarks/evidence/phase31/';
const sha=b=>createHash('sha256').update(b).digest('hex');
try{
 const record=JSON.parse(await readFile(root+'phase31.json','utf8'));
 const original=await readFile('benchmarks/phase31/acceptance.json');
 const policy=JSON.parse(original);
 const sourceCode=await readFile('js/evidence/phase31-first-principles.js');
 const ui=await readFile('js/ui/app.js'),smoke=await readFile('tests/browser-3d.html');
 if(policy.illustrativeModel!==MOTOR_MODEL||
  policy.nominalVoltageV!==3||policy.nominalVariationStdPercent!==4||
  policy.minModeledRpm!==1150||policy.maxMotorCurrentA!==0.8||
  policy.assumedDiscrepancyRpm!==150||
  policy.experimentalFanMeasurements!==0||
  policy.physicalFanValidation!==false||
  policy.independentHardwareDataAvailable!==false||
  policy.physicalVerdict!=='unknown'||policy.realWorldBuildSuccessPercent!==null)
  throw Error('Frozen physical fan acceptance policy changed');
 const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const input={
  phase30ReferenceSourceCommit:'0ee731adb6372a694e6c374eb806d43d16f1282e',
  versionedPolicySha256:sha(original),sourceCodeSha256:sha(sourceCode),
  browserCodeSha256:sha(ui),browserSmokeSha256:sha(smoke)
 };
 const known={
  voltageV:3,sourceResistanceOhm:0.25,wireResistanceOhm:0.15,
  motorResistanceOhm:5,motorConstantSI:0.012,
  staticFrictionTorqueNm:0.0006,runningFrictionTorqueNm:0.0004,
  dragCoefficientNmPerRad2:2e-7
 };
 const nominal=predictFan(known),baseline=fanIllustrativeScenario({samples:5000,
  seed:31,voltageV:3,voltageStdPercent:4,minRpm:1150,maxMotorCurrentA:0.8});
 const sensitivity=fanIllustrativeScenario({samples:5000,seed:31,voltageV:3,
  voltageStdPercent:4,minRpm:1150,maxMotorCurrentA:0.8,rpmDiscrepancyAllowance:150});
 const jammedFan=predictFan({...known,staticFrictionTorqueNm:1});
 if(record.format!=='invention-lab/phase31-computed-conditional-first-principles-simulation/1'||
  record.sourceCommit!==head||!isDeepStrictEqual(record.input,input)||
  !isDeepStrictEqual(record.nominal,nominal)||
  !isDeepStrictEqual(record.baseline,baseline)||
  !isDeepStrictEqual(record.sensitivity,sensitivity)||
  !isDeepStrictEqual(record.jammedFan,jammedFan)||
  jammedFan.started!==0||
  baseline.status!=='model-only'||sensitivity.status!=='model-only'||
  record.actualMeasuredFanSamples!==0||
  record.physicalValidation!=='none'||record.physicalVerdict!=='unknown'||
  record.realWorldBuildSuccessPercent!==null||
  baseline.realWorldBuildSuccessPercent!==null||sensitivity.realWorldBuildSuccessPercent!==null)
  throw Error('Physics/probability original calculation replay failed or physical evidence fabricated');
 const summary={
  format:'invention-lab/phase31-verified-conditional-model-only-science/1',
  sourceCommit:head,modelVersion:MOTOR_MODEL,
  exactSteadyRpm:nominal.speedRpm,exactModeledMotorCurrentA:nominal.motorCurrentA,
  independentSourceVerified:true,physicalMotorMeasurementCount:0,
  declaredUnvalidatedParameterDistributions:baseline.parameterDistributions.length,
  conditionalModelPassRatePercent:baseline.conditionalModeledSuccessPercent,
  conditionalWorstCaseWithAssumed150RPMErrorPercent:sensitivity.conditionalWorstCaseModeledSuccessPercent,
  conditionalBestCaseWithAssumed150RPMErrorPercent:sensitivity.conditionalBestCaseModeledSuccessPercent,
  numericalMonteCarlo95IntervalOnly:baseline.conditionalMonteCarloInterval95Percent,
  actualBuildProbability:null,fanLifeOrManufacturingYield:null,
  physicallyAuthenticatedMotorModelError:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null,
  releaseScope:'new first-principles educational engine, not physical equivalence or certified chip validation'
 };
 await writeFile(root+'phase31-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH31 STRICT PASS: positive energy-conserving DC fan model, seeded probability, hypothetical discrepancy, 0 physical samples');
}catch(e){console.error('PH31 STRICT FAIL: '+e.message);process.exitCode=1;}
