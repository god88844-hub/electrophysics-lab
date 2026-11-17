import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {analyzeBLDCHealthy} from '../js/measure/phase35-independent-holdout.js';
import {verifyPhase36,analyzeNewHoldoutOriginal,evaluateTwoRegimeHoldout} from '../js/measure/phase36-source-calibration.js';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const sha=b=>createHash('sha256').update(b).digest('hex');
try{
 const p35raw=await readFile('benchmarks/phase35/acceptance.json');
 const p36raw=await readFile('benchmarks/phase36/acceptance.json');
 const p35=JSON.parse(p35raw),p36=JSON.parse(p36raw);
 verifyPhase36(p35,p36);
 const original=[],records=[];
 for(const pin of [...p35.readings,p36.additionalHeldOutPublisherRecording]){
  const newer=pin.id==='holdout-motor3-2000';
  const file='benchmarks/evidence/'+(newer?'phase36/':'phase35/')+pin.path.split('/').at(-1);
  const bytes=await readFile(file),blob=git('hash-object',file);
  if(bytes.length!==pin.bytes||blob!==pin.gitBlobSHA1)throw Error('Publisher Git source identity mismatch '+pin.id);
  original.push({id:pin.id,path:pin.path,bytes:bytes.length,gitBlobSHA1:blob,sha256:sha(bytes),unit:pin.unit,setpointRpm:pin.speedSetpointRpm});
  records.push(newer?
   analyzeNewHoldoutOriginal(bytes.toString('utf8'),p35,p36,{sourceGitBlobVerified:true}):
   analyzeBLDCHealthy(bytes.toString('utf8'),p35,pin.id,{sourceGitBlobVerified:true}));
 }
 const comparison=evaluateTwoRegimeHoldout(p35,p36,records);
 const saved=JSON.parse(await readFile('benchmarks/evidence/phase36/phase36.json','utf8'));
 if(saved.format!=='invention-lab/phase36-original-source-locked-replay/1'||
  saved.sourceCommit!==git('rev-parse','HEAD')||
  saved.publisherCommit!==p36.sourceCommit||
  saved.policy35SHA256!==sha(p35raw)||saved.policy36SHA256!==sha(p36raw)||
  saved.source36SHA256!==sha(await readFile('js/measure/phase36-source-calibration.js'))||
  !isDeepStrictEqual(saved.originalPublisherFiles,original)||
  !isDeepStrictEqual(saved.evaluation,comparison)||
  comparison.evaluationUsedHoldoutToFit!==false||
  comparison.actualDistinctMotorUnits!==2||comparison.heldOutOperatingRegimes!==2||
  comparison.credibleNewDevicePredictionIntervalRpm!==null||
  comparison.matchedPhysical3VFanMeasurements!==0||
  comparison.realWorldBuildSuccessPercent!==null||
  saved.physicalValidation!=='none'||saved.physicalVerdict!=='unknown'||saved.realWorldBuildSuccessPercent!==null)
  throw Error('Model training split, source evidence or replay changed unexpectedly');
 const summary={format:'invention-lab/phase36-strict-two-regime-source-model/1',
  sourceCommit:git('rev-parse','HEAD'),accepted:true,
  originalRecordings:4,distinctSourcePhysicalMotorUnits:2,
  originalSourceSensorRows:comparison.originalPhysicalSourceRows,
  independentlyHeldOutTestRegimes:comparison.heldOutOperatingRegimes,
  trainingOnlyUnit:'motor2',holdoutOnlyUnit:'motor3',
  heldOutMeanAbsoluteErrorRpm:comparison.heldOutMeanAbsoluteErrorRpm,
  heldOutMaxAbsoluteErrorRpm:comparison.heldOutMaximumAbsoluteErrorRpm,
  baselineSetpointMeanAbsoluteErrorRpm:comparison.heldOutBaselineSetpointMeanAbsoluteErrorRpm,
  modelImprovedAgainstSetpointBaseline:comparison.heldOutModelImprovesOnSetpointBaseline,
  cannotInferPredictionIntervalFromOneHeldOutMotor:true,
  cannotTransfer24VBrakeBLDCToUnobserved3VFan:true,
  independentCalibrationAvailable:false,
  realTargetFanMeasurements:0,realWorldBuildSuccessPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown'};
 await writeFile('benchmarks/evidence/phase36/phase36-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH36 STRICT PASS: '+comparison.originalPhysicalSourceRows+' actual original publisher sensor rows, '+comparison.heldOutMeanAbsoluteErrorRpm.toFixed(4)+' RPM held-out MAE across two operating conditions; physical fan qualification UNKNOWN');
}catch(e){console.error('PH36 STRICT FAIL: '+e.message);process.exitCode=1;}
