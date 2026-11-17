// Phase 36: strict *between-device* holdout on TWO conditions, not row-level cross-validation.
// Descriptive affine control-setpoint calibration, NOT electromechanical laws or fan qualification.
import {verifyStudy} from './phase35-independent-holdout.js';
export const PH36_FORMAT='invention-lab/phase36-two-regime-independent-device-model-check/1';
const ADDITIONAL='195dea9f1b551e6ad209a511713895727af27c94';
const ROWS=['training-motor2-2000','training-motor2-2500','holdout-motor3-2000','holdout-motor3-2500'];
const header='t_us,ax,ay,az,ax1,ay1,az1,shunt_raw,bus_raw,curr_raw,pg_rpm,seq,dt';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const frozen=x=>Object.freeze(JSON.parse(JSON.stringify(x)));
export function verifyPhase36(p35,p36){
 verifyStudy(p35);
 const r=p36?.additionalHeldOutPublisherRecording;
 if(p36?.format!=='invention-lab/phase36-two-condition-independent-device-evaluation/1'||
  p36.sourceRepository!=='Atikas/OpenBLDCData'||
  p36.sourceCommit!==p35.sourceCommit||
  p36.author!=='Robertas Ūselis'||p36.license!=='CC BY 4.0'||
  p36.trainingMotorUnit!=='motor2'||p36.independentTestMotorUnit!=='motor3'||
  p36.sourceMotorType!==p35.motorType||p36.sourceMotorRatedVoltageV!==24||
  p36.sourceDriver!==p35.driver||p36.sourcePowerSupply!==p35.powerSupply||
  p36.sourceLoadControllerSettingMilliamp!==96||
  JSON.stringify(p36.sourceOperatingSetpointsRpm)!=='[2000,2500]'||
  p36.sourcePGPulsesPerMechanicalRevolution!==6||
  p36.speedModel!=='two-point-affine-controller-setpoint-to-PG-tach-speed/1'||
  !r||r.id!=='holdout-motor3-2000'||r.role!=='holdout'||r.unit!=='motor3'||
  r.speedSetpointRpm!==2000||r.loadCurrentSettingMilliamp!==96||
  r.source!=='mait'||r.publisherHealth!=='healthy'||
  r.path!=='data/analize_healthy20_2000rpm_96mA_mait.csv'||
  r.bytes!==23964792||r.gitBlobSHA1!==ADDITIONAL||
  p36.publisherSensorCalibrationsIndependentlyCertified!==false||
  p36.matchedPhysical3VBrushedBatteryFanMeasurements!==0||
  p36.physicallyQualifiedPredictionIntervalForOtherMotorUnits!==null||
  p36.physicalValidationForTarget3VFan!=='none'||
  p36.physicalVerdictForTarget3VFan!=='unknown'||
  p36.realWorldBuildSuccessPercent!==null)
  throw Error('Phase36 source-locked, two-unit source policy or non-transfer constraints changed');
 return true;
}
// The new 24-MB source recording has an authenticated Git blob checked by the
// acquisition runner *before* analysis. Synthetic unit-test fixtures are never
// allowed through the source-verified production gate.
export function analyzeNewHoldoutOriginal(csv,p35,p36,{sourceGitBlobVerified=false}={}){
 verifyPhase36(p35,p36);
 const pin=p36.additionalHeldOutPublisherRecording;
 if(typeof csv!=='string'||csv.length<90||csv.length>60000000)
  throw Error('Missing or oversized original raw motor3-2000 sensor file');
 if(sourceGitBlobVerified&&Buffer.byteLength(csv,'utf8')!==pin.bytes)
  throw Error('Source-verified file byte length differs from original Git blob');
 const lines=csv.trimEnd().split(/\r?\n/);
 if(lines.shift()!==header)throw Error('Original heldout motor3 CSV schema changed');
 let n=0,lastTime=null,firstTime=null,lastSeq=null,lastPG=null,firstRise=null,lastRise=null,
  rise=0,high=0,low=0,wrap=0,totalI=0,totalV=0,dtBad=0,gaps=0,nonmonotone=0;
 for(const line of lines){
  const cells=line.split(',');
  if(cells.length!==13)throw Error('Bad sensor column count');
  const value=cells.map((raw,i)=>i===12&&raw===''?null:Number(raw));
  if(value.slice(0,12).some(x=>!finite(x))||
   !Number.isSafeInteger(value[0])||!Number.isSafeInteger(value[11])||
   value[0]<0||value[8]<0||value[9]<0||value[10]<0||value[10]>1||
   (value[12]!==null&&(!finite(value[12])||value[12]<0)))
   throw Error('Invalid original time, PG pulse or electrical measurement');
  const [t,pg,seq,dt]=[value[0],value[10],value[11],value[12]];
  if(firstTime===null)firstTime=t;
  if(lastTime!==null){
   if(t<=lastTime)nonmonotone++;
   if(seq!==lastSeq+1){
    if(lastSeq===65535&&seq===0)wrap++;
    else gaps++;
   }
   if(dt===null||Math.abs(dt-(t-lastTime)/1e6)>1e-6)dtBad++;
  }
  if(lastPG===0&&pg===1){rise++;if(firstRise===null)firstRise=t;lastRise=t;}
  if(pg===1)high++;else low++;
  totalV+=value[8]*p35.sourceBusVoltageLSBV;
  totalI+=value[9]*p35.sourceCurrentLSBA;
  n++;lastTime=t;lastPG=pg;lastSeq=seq;
 }
 if(n<3000||lastTime<=firstTime||rise<12||!high||!low||
  nonmonotone||gaps||dtBad||lastRise<=firstRise)
  throw Error('Original motor3-2000 tach/time/counter source acquisition unusable');
 const rpm=(rise-1)*60e6/(p35.speedPulsesPerMechanicalRevolution*(lastRise-firstRise));
 if(!finite(rpm)||rpm<100||rpm>6000)
  throw Error('Original motor3-2000 physically implausible pulse-measured speed');
 return frozen({
  format:'invention-lab/phase36-original-verified-extra-physical-recording/1',
  originalSourceId:pin.id,declaredRole:pin.role,declaredMotorUnit:pin.unit,
  originalPublisherGitBlob:pin.gitBlobSHA1,
  sourceGitBlobVerified:Boolean(sourceGitBlobVerified),
  publisherSpeedSetpointRpm:pin.speedSetpointRpm,
  publisherLoadSettingMilliamp:pin.loadCurrentSettingMilliamp,
  rawSampleCount:n,durationS:(lastTime-firstTime)/1e6,
  actualTachRisingEdges:rise,measuredSpeedRpm:rpm,tachAcquisitionUsable:true,
  meanBusVoltageV:totalV/n,meanUpstreamCurrentA:totalI/n,
  acquisitionQuality:{timeNonmonotone:nonmonotone,sequenceGaps:gaps,
   documented16BitCounterWraps:wrap,inconsistentReportedDt:dtBad},
  independentCalibrationCertificates:null,
  originalPhysicalFanObservationCount:0,
  realWorldBuildSuccessPercent:null,
  physicalValidationForTarget:'none',physicalVerdictForTarget:'unknown'
 });
}
export function evaluateTwoRegimeHoldout(p35,p36,records){
 verifyPhase36(p35,p36);
 if(!Array.isArray(records)||records.length!==4)
  throw Error('Four original whole recordings from TWO motor units required');
 const byId=new Map(records.map(x=>[x?.originalSourceId,x]));
 if(byId.size!==4||ROWS.some(id=>!byId.has(id)))
  throw Error('Duplicate, missing or unrecognized physical source recording');
 const pins=[...p35.readings,p36.additionalHeldOutPublisherRecording];
 for(const item of records){
  const pin=pins.find(p=>p.id===item.originalSourceId);
  if(!pin||pin.gitBlobSHA1!==item.originalPublisherGitBlob||
   item.sourceGitBlobVerified!==true||item.declaredRole!==pin.role&&
   !(item.originalSourceId==='training-motor2-2000'&&item.declaredRole==='operating-point-contrast')||
   item.declaredMotorUnit!==pin.unit||
   item.publisherSpeedSetpointRpm!==pin.speedSetpointRpm||
   item.publisherLoadSettingMilliamp!==96||
   item.tachAcquisitionUsable!==true||
   !finite(item.measuredSpeedRpm)||item.measuredSpeedRpm<100||item.measuredSpeedRpm>6000||
   !finite(item.meanUpstreamCurrentA)||item.meanUpstreamCurrentA<0||
   !finite(item.meanBusVoltageV)||item.meanBusVoltageV<=0||
   !Number.isSafeInteger(item.rawSampleCount)||item.rawSampleCount<3000||
   item.realWorldBuildSuccessPercent!==null||item.physicalValidationForTarget!=='none')
   throw Error('Source-verified fixed-role independent-device physical record invalid');
 }
 const a=byId.get('training-motor2-2000'),b=byId.get('training-motor2-2500');
 const slope=(b.measuredSpeedRpm-a.measuredSpeedRpm)/500;
 const intercept=a.measuredSpeedRpm-2000*slope;
 if(!finite(slope)||slope<0.5||slope>1.5||!finite(intercept))
  throw Error('Training tach observations cannot support bounded two-point descriptive fit');
 const currentSlope=(b.meanUpstreamCurrentA-a.meanUpstreamCurrentA)/500;
 const currentIntercept=a.meanUpstreamCurrentA-2000*currentSlope;
 const tests=[2000,2500].map(setpoint=>{
  const item=byId.get('holdout-motor3-'+setpoint);
  const predicted=slope*setpoint+intercept;
  const predictedCurrent=currentSlope*setpoint+currentIntercept;
  const err=predicted-item.measuredSpeedRpm;
  return {
   rpmSetpoint:setpoint,trainingMotorUnit:'motor2',testMotorUnit:'motor3',
   heldOutPublisherSourceId:item.originalSourceId,
   heldOutOriginalGitBlob:item.originalPublisherGitBlob,
   predictedSourcePGSpeedRpm:predicted,observedSourcePGSpeedRpm:item.measuredSpeedRpm,
   signedPredictionMinusMeasuredRpm:err,
   absolutePredictionErrorRpm:Math.abs(err),
   absoluteRelativePredictionErrorPercent:100*Math.abs(err)/item.measuredSpeedRpm,
   uncalibratedSetpointBaselineAbsoluteErrorRpm:Math.abs(setpoint-item.measuredSpeedRpm),
   predictedUpstreamDriverInputCurrentA:predictedCurrent,
   observedUpstreamDriverInputCurrentA:item.meanUpstreamCurrentA,
   upstreamCurrentAbsolutePredictionErrorA:Math.abs(predictedCurrent-item.meanUpstreamCurrentA)
  };
 });
 const abs=tests.map(x=>x.absolutePredictionErrorRpm);
 const base=tests.map(x=>x.uncalibratedSetpointBaselineAbsoluteErrorRpm);
 const mean=x=>x.reduce((a,b)=>a+b,0)/x.length;
 return frozen({
  format:PH36_FORMAT,sourceRepository:p36.sourceRepository,
  publisherCommit:p36.sourceCommit,publisherLicense:p36.license,
  trainingMotorUnit:'motor2',strictlyIndependentHeldOutMotorUnit:'motor3',
  independentlyHeldOutMotorUnits:1,heldOutOperatingRegimes:2,
  actualDistinctMotorUnits:2,wholeRecordings:4,
  originalPhysicalSourceRows:records.reduce((sum,r)=>sum+r.rawSampleCount,0),
  fit:{kind:p36.speedModel,trainedOnlyOnUnit:'motor2',
   speedSetpointsRpm:[2000,2500],pointsUsedToFit:2,
   slopeObservedRpmPerRpmSetpoint:slope,interceptObservedRpm:intercept,
   trainingResidualDegreesOfFreedom:0,
   isPhysicalTorqueOrImpedanceModel:false,
   upstreamCurrentSlopeAperRpmSetpoint:currentSlope,
   upstreamCurrentInterceptA:currentIntercept},
  measuredIndependentDeviceTests:tests,
  heldOutMeanAbsoluteErrorRpm:mean(abs),
  heldOutMaximumAbsoluteErrorRpm:Math.max(...abs),
  heldOutBaselineSetpointMeanAbsoluteErrorRpm:mean(base),
  heldOutModelImprovesOnSetpointBaseline:mean(abs)<mean(base),
  evaluationUsedHoldoutToFit:false,independentSampleUnit:'physical-motor-unit',
  credibleNewDevicePredictionIntervalRpm:null,
  calibratedPhysicalSpeedErrorFor3VFan:null,
  sensorCalibrationIndependentCertificate:null,
  missingReplication:'One held-out unit, two source setpoints, 96mA brake setting, laboratory supply. No independent instrument traceability, repeated hardware lots, environmental coverage or fan data.',
  targetIsUnrelated3VBrushedFan:false,
  matchedPhysical3VFanMeasurements:0,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 });
}
