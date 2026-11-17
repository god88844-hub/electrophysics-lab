import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {verifyStudy,analyzeBLDCHealthy,independentMotorHoldout}
 from '../js/measure/phase35-independent-holdout.js';
const root='benchmarks/evidence/phase35/',sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
try{
 const policyRaw=await readFile('benchmarks/phase35/acceptance.json');
 const policy=JSON.parse(policyRaw);verifyStudy(policy);
 const prior=JSON.parse(await readFile(root+'phase35.json','utf8'));
 const actual=[],source=[];
 for(const item of policy.readings){
  const file=root+item.path.split('/').at(-1);
  const bytes=await readFile(file);
  const sha1=git('hash-object',file);
  if(bytes.length!==item.bytes||sha1!==item.gitBlobSHA1)
   throw Error('Independent publisher raw source Git bytes do not match the original');
  actual.push(analyzeBLDCHealthy(bytes.toString('utf8'),policy,item.id,{sourceGitBlobVerified:true}));
  source.push({id:item.id,rawBytes:bytes.length,sourceGitObject:sha1,sha256:sha(bytes)});
 }
 const expected=independentMotorHoldout(policy,actual);
 const head=git('rev-parse','HEAD');
 if(prior.format!=='invention-lab/phase35-verified-motor-unit-original-holdout-replay/1'||
  prior.sourceCommit!==head||prior.publisherCommit!==policy.sourceCommit||
  prior.publisherOriginalMotorPart!==policy.motorType||
  prior.publisherLicense!=='CC BY 4.0'||
  prior.policySHA256!==sha(policyRaw)||
  prior.analyzerSourceSHA256!==sha(await readFile('js/measure/phase35-independent-holdout.js'))||
  !isDeepStrictEqual(prior.originalPublisherFiles,source)||
  !isDeepStrictEqual(prior.evidence,expected)||
  prior.independentlyCalibratedPhysicalPredictionErrorForCurrent3VFan!==null||
  prior.physicalValidation!=='none'||prior.physicalVerdict!=='unknown'||
  prior.realWorldBuildSuccessPercent!==null||
  expected.independentDeviceHeldOutSourceValidated!==true||
  expected.holdoutWasUsedToFitPrediction!==false||
  expected.targetFanErrorBoundFromIndependentStudy!==null||
  expected.actualMatchedFanPhysicalMeasurements!==0||
  expected.realWorldBuildSuccessPercent!==null)
  throw Error('Phase35 original source or independent-unseen-hardware validation incorrectly replayed');
 const summary={
  format:'invention-lab/phase35-strict-original-healthy-bldc-independent-motor-holdout/1',
  sourceCommit:head,publisherGitCommit:policy.sourceCommit,
  accepted:true,sourceOriginalGitBlobVerifiedAll:true,
  originalHealthyPublisherFiles:source.length,
  originalPublisherMeasuredRows:expected.actualExperimentRows,
  independentMotorUnits:2,
  trainingMotorUnit:'motor2',heldOutMotorUnit:'motor3',
  setpointRpm:2500,actualMeasuredTrainingRpm:expected.trainingMatchedSpeedRpm,
  actualMeasuredHoldoutRpm:expected.heldOutMeasuredMotor3SpeedRpm,
  heldOutDifferenceRpm:expected.heldOutAbsoluteSpeedDifferenceRpm,
  heldOutDifferencePercentOfTrainingMotor:expected.heldOutRelativeSpeedDifferencePercent,
  heldOutUpstreamElectricalCurrentDifferenceA:expected.heldOutUpstreamCurrentDifferenceA,
  cannotClaimStatisticalManufacturingAccuracy:true,
  sourceToUserFanHardwareTransferBlocked:true,
  actualPhysical3VFanMeasures:0,
  actualRealWorldFanSuccessPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null,
  blockers:[
   'Only two other 24V BLDC physical motor units and three original recordings, not a population manufacturing sample',
   'Same 2500RPM setpoint is an input operating condition, not a guaranteed actual tachometer reading',
   'Source sensor calibration is publisher-described, not independently certificated by this project',
   'Original Phase31 3V brushed DC battery/wires/fan is a different electromechanical system',
   'No measured impeller, controller, battery, manufacturer-defect distributions or independent target system validation'
  ]
 };
 await writeFile(root+'phase35-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH35 STRICT PASS: '+expected.actualExperimentRows+' actual public publisher source sensor rows from TWO motor units; independent holdout difference '+expected.heldOutRelativeSpeedDifferencePercent.toFixed(3)+'%, target 3V fan physical success UNKNOWN');
}catch(error){console.error('PH35 STRICT FAIL: '+error.message);process.exitCode=1;}
