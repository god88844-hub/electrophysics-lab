// Phase35: original published, condition-matched healthy 24 V BLDC recordings.
// Training and holdout MUST be independent physical motor units.
// This does NOT measure the example 3 V brushed motor, impeller or fan reliability.
export const PH35_FORMAT='invention-lab/phase35-independent-bldc-motor-unit-holdout/1';
const ORIGIN='Atikas/OpenBLDCData',ORIGINAL_COMMIT='1ce35456f83be8f36aec183ab19d6e6e46603023';
const HEADERS=['t_us','ax','ay','az','ax1','ay1','az1','shunt_raw','bus_raw','curr_raw','pg_rpm','seq','dt'];
const PINNED=[
 ['training-motor2-2500','training','motor2',2500,'analize_healthy11_2500rpm_96mA_mait.csv',4737417,'329d53ec77d708cca07f6b3a37f6a3346063eb66'],
 ['holdout-motor3-2500','holdout','motor3',2500,'analize_healthy20_2500rpm_96mA_mait.csv',4982886,'2de45c123e65711bb33f28609889581826f10cb2'],
 ['training-motor2-2000','operating-point-contrast','motor2',2000,'analize_healthy11_2000rpm_96mA_mait.csv',4707183,'7d02bca4073775be034ec00e906b4f7d28a49725']
];
function freeze(x){return Object.freeze(JSON.parse(JSON.stringify(x)));}
function finite(v){return typeof v==='number'&&Number.isFinite(v);}
export function verifyStudy(policy){
 if(policy?.format!=='invention-lab/phase35-source-locked-separate-device-holdout/1'||
  policy.sourceRepository!==ORIGIN||policy.sourceCommit!==ORIGINAL_COMMIT||
  policy.author!=='Robertas Ūselis'||policy.license!=='CC BY 4.0'||
  policy.motorType!=='STEPPEROLINE BLDC 57BYA54-24-01'||
  policy.motorRatedVoltageV!==24||policy.driver!=='BD10LR BLDC'||
  policy.powerSupply!=='UNIT-T UTP3305 laboratory supply'||
  policy.speedPulsesPerMechanicalRevolution!==6||
  policy.sourceBusVoltageLSBV!==0.00125||
  policy.sourceCurrentLSBA!==0.00030518||
  policy.sourcePublisherInstrumentCalibrationIndependentlyVerified!==false||
  policy.target3VBrushedFanMatchingMotorPart!==false||
  policy.sourceMeasurementsTransferToTarget3VFan!==false||
  policy.numberOfIndependentMotorUnitsForThisStudy!==2||
  policy.realWorldFanBuildSuccessPercent!==null||
  policy.realWorldBuildSuccessPercent!==null||
  policy.physicalValidationOfPhase31Fan!=='none'||
  policy.physicalVerdictOfPhase31Fan!=='unknown'||
  !Array.isArray(policy.readings)||policy.readings.length!==3||
  JSON.stringify(policy.trainingOnly)!==JSON.stringify(['training-motor2-2500','training-motor2-2000'])||
  JSON.stringify(policy.holdoutOnly)!==JSON.stringify(['holdout-motor3-2500'])||
  policy.splitMethod!=='publisher-independent-motor-unit: training motor2, holdout motor3')
  throw Error('Pinned original independent-device BLDC source and physical limits are invalid');
 for(let i=0;i<PINNED.length;i++){
  const r=policy.readings[i],p=PINNED[i];
  if(!r||r.id!==p[0]||r.role!==p[1]||r.unit!==p[2]||
   r.speedSetpointRpm!==p[3]||r.path!=='data/'+p[4]||
   r.bytes!==p[5]||r.gitBlobSHA1!==p[6]||
   r.loadCurrentSettingMilliamp!==96||r.source!=='mait'||
   r.publisherHealth!=='healthy')
   throw Error('One or more original healthy motor-unit dataset pins changed');
 }
 return true;
}
/** Parses real raw CSV text and calculates measured period speed, not filename
 * RPM. A quiet sensor remains unmeasured. Two repetitions of one unit are
 * never counted as separate independent motors.
 */
export function analyzeBLDCHealthy(csv,policy,pin,{sourceGitBlobVerified=false}={}){
 verifyStudy(policy);
 const selected=policy.readings.find(x=>x.id===pin);
 if(!selected)throw Error('Original data must be specifically pinned to the exact motor source');
 if(typeof csv!=='string'||csv.length<90||csv.length>80000000)
  throw Error('Empty, oversized or missing original healthy CSV');
 const lines=csv.trimEnd().split(/\r?\n/);
 const headers=lines.shift().split(',');
 if(headers.length!==HEADERS.length||headers.some((v,i)=>v!==HEADERS[i]))
  throw Error('Invalid BLDC original 13-column measurement schema');
 if(sourceGitBlobVerified&&(lines.length<1000||csv.length!==selected.bytes))
  throw Error('Original source bytes or acquisition count mismatch with publisher Git blob');
 let n=0,firstT=null,lastT=null,lastSequence=null,pulsePrevious=null,
  rising=0,high=0,low=0,missingFirstDt=0,dtInconsistent=0,
  nonMonotone=0,sequenceGap=0,sequenceWrapCount=0,firstSequenceGap=null,jitterMax=0;
 let meanV=0,meanC=0,meanW=0,minV=Infinity,maxV=-Infinity,minC=Infinity,maxC=-Infinity;
 const pulseTimes=[],windows=new Map();
 for(const [index,line] of lines.entries()){
  const v=line.split(',');
  if(v.length!==13)throw Error('Incorrect number of original source CSV fields on row '+index);
  const x=v.map((z,k)=>z===''&&k===12?null:Number(z));
  if(x.slice(0,12).some(k=>!finite(k))||
   !Number.isSafeInteger(x[0])||!Number.isSafeInteger(x[11])||
   x[0]<0||x[8]<0||x[9]<0||
   (x[10]!==0&&x[10]!==1)||
   (x[12]!==null&&(!finite(x[12])||x[12]<0)))
   throw Error('Malformed or impossible publisher raw sample '+index);
  const time=x[0],seq=x[11],pg=x[10],dt=x[12];
  if(firstT===null)firstT=time;
  if(lastT!==null){
   if(time<=lastT)nonMonotone++;
   if(seq!==lastSequence+1){
    if(lastSequence===65535&&seq===0)sequenceWrapCount++;
    else{
     sequenceGap++;
     if(firstSequenceGap===null)firstSequenceGap={row:index,lastSequence,sequence:seq,
       step:seq-lastSequence,timeDeltaUs:time-lastT};
    }
   }
   const computed=(time-lastT)/1e6;
   if(dt===null||Math.abs(dt-computed)>1e-6)dtInconsistent++;
   jitterMax=Math.max(jitterMax,Math.abs(computed-.001));
  }else if(dt===null)missingFirstDt++;
  if(pg===1)high++;else low++;
  if(pulsePrevious===0&&pg===1){rising++;pulseTimes.push(time);}
  pulsePrevious=pg;
  const vbus=x[8]*policy.sourceBusVoltageLSBV;
  const amps=x[9]*policy.sourceCurrentLSBA;
  meanV+=vbus;meanC+=amps;meanW+=vbus*amps;
  minV=Math.min(minV,vbus);maxV=Math.max(maxV,vbus);
  minC=Math.min(minC,amps);maxC=Math.max(maxC,amps);
  const w=Math.floor((time-firstT)/1000000);
  if(!windows.has(w))windows.set(w,{sampleCount:0,amperesTotal:0,voltageTotal:0,pulseCount:0});
  const bin=windows.get(w);
  bin.sampleCount++;bin.amperesTotal+=amps;bin.voltageTotal+=vbus;
  if(pulsePrevious===pg&&pg===1&&pulseTimes.at(-1)===time)bin.pulseCount++;
  n++;lastT=time;lastSequence=seq;
 }
 if(n<4||lastT===firstT)throw Error('Insufficient actual original motor recording');
 if(nonMonotone||sequenceGap||dtInconsistent)
  throw Error('Corrupt original acquisition timing or sequence cannot support physical source validation: '+
   JSON.stringify({nonMonotone,sequenceGap,firstSequenceGap,sequenceWrapCount,dtInconsistent}));
 const elapsed=(lastT-firstT)/1e6;
 const issue=(nonMonotone||sequenceGap||dtInconsistent||rising<12||
   high===0||low===0||elapsed<2);
 // We analyze only original speed measured by tach pulses. The edge count
 // in a FULL second provides independent bin summaries; incomplete last
 // second is excluded from the one-second window analysis.
 const perSecond=[...windows.entries()].sort((a,b)=>a[0]-b[0]).flatMap(([i,b])=>
  b.sampleCount>=850&&b.sampleCount<=1200?[{
   second:i,samples:b.sampleCount,pulseRisingEdges:b.pulseCount,
   observedRpm:b.pulseCount*60/policy.speedPulsesPerMechanicalRevolution,
   meanCurrentA:b.amperesTotal/b.sampleCount,
   meanVoltageV:b.voltageTotal/b.sampleCount
  }]:[]);
 const inferredRpm=!issue&&pulseTimes.length>=12?
   (pulseTimes.length-1)*60*1e6/
   (policy.speedPulsesPerMechanicalRevolution*(pulseTimes.at(-1)-pulseTimes[0])):null;
 return freeze({
  format:'invention-lab/phase35-original-healthy-recorded-motor-signals/1',
  originalSourceId:selected.id,declaredMotorUnit:selected.unit,
  declaredRole:selected.role,publisherSpeedSetpointRpm:selected.speedSetpointRpm,
  publisherLoadSettingMilliamp:selected.loadCurrentSettingMilliamp,
  originalPublisherGitBlob:selected.gitBlobSHA1,
  sourceGitBlobVerified:Boolean(sourceGitBlobVerified),
  rawSampleCount:n,durationS:elapsed,
  meanBusVoltageV:meanV/n,meanUpstreamCurrentA:meanC/n,
  meanUpstreamElectricalPowerW:meanW/n,
  measuredBusVoltageRangeV:[minV,maxV],
  measuredUpstreamCurrentRangeA:[minC,maxC],
  tachHighSamples:high,tachLowSamples:low,
  actualTachRisingEdges:rising,
  measuredSpeedRpm:inferredRpm,
  tachAcquisitionUsable:inferredRpm!==null,
  acquisitionQuality:{
   timeNonmonotone:nonMonotone,sequenceGaps:sequenceGap,
   documented16BitCounterWraps:sequenceWrapCount,firstUnexpectedSequenceGap:firstSequenceGap,
   inconsistentReportedDt:dtInconsistent,missingInitialDt:missingFirstDt,
   maxAbsJitterFrom1msS:jitterMax
  },
  completeOneSecondWindows:perSecond,
  individualRowsAreIndependentMotorUnits:false,
  sourceMotorUnitDifferentFromPhase31Fan:true,
  originalPhysicalFanObservationCount:0,
  independentCalibrationCertificates:null,
  speedSensorExternalCalibrationCertificate:null,
  physicalModelDiscrepancyBoundForPhase31Fan:null,
  realWorldBuildSuccessPercent:null,
  physicalValidationForTarget:'none',physicalVerdictForTarget:'unknown'
 });
}
export function independentMotorHoldout(policy,recordings){
 verifyStudy(policy);
 if(!Array.isArray(recordings)||recordings.length!==3)
  throw Error('Exact three original independently pinned source recordings required');
 const map=new Map(recordings.map(x=>[x.originalSourceId,x]));
 if(map.size!==3||policy.readings.some(x=>!map.has(x.id)))throw Error('A required source is missing or duplicated');
 const train=map.get('training-motor2-2500');
 const hold=map.get('holdout-motor3-2500');
 const contrast=map.get('training-motor2-2000');
 for(const item of recordings){
  const source=policy.readings.find(x=>x.id===item.originalSourceId);
  if(item.originalPublisherGitBlob!==source?.gitBlobSHA1||
     item.sourceGitBlobVerified!==true||item.declaredMotorUnit!==source.unit||
     item.declaredRole!==source.role||item.publisherSpeedSetpointRpm!==source.speedSetpointRpm||
     item.measuredSpeedRpm===null||
     !finite(item.measuredSpeedRpm)||item.measuredSpeedRpm<=0||
     !finite(item.meanUpstreamCurrentA)||item.meanUpstreamCurrentA<0)
   throw Error('A different/stale motor or failed tachometer cannot be used to train or validate a physical model');
 }
 if(train.declaredMotorUnit===hold.declaredMotorUnit||
    train.declaredMotorUnit!==contrast.declaredMotorUnit||
    train.declaredMotorUnit!=='motor2'||hold.declaredMotorUnit!=='motor3'||
    train.publisherSpeedSetpointRpm!==hold.publisherSpeedSetpointRpm||
    train.publisherLoadSettingMilliamp!==hold.publisherLoadSettingMilliamp)
  throw Error('Independent motor-device holdout contaminated by a training specimen');
 const prediction=train.measuredSpeedRpm;
 return freeze({
  format:PH35_FORMAT,
  sourceRepository:policy.sourceRepository,publisherGitCommit:policy.sourceCommit,
  publisherLicense:policy.license,independentMotorUnitsRepresented:2,
  independentHoldoutMotorUnit:'motor3',trainingMotorUnit:'motor2',
  fixedComparisonCondition:{rpmSetpoint:2500,loadControllerMilliamp:96,
    powerSupply:'UNIT-T UTP3305',motorPart:policy.motorType},
  trainingOperatingPointsRpmSetpoint:[2000,2500],
  actualExperimentRows:recordings.reduce((a,b)=>a+b.rawSampleCount,0),
  originalMotorUnitRecords:recordings,
  trainingMatchedSpeedRpm:prediction,
  heldOutMeasuredMotor3SpeedRpm:hold.measuredSpeedRpm,
  heldOutAbsoluteSpeedDifferenceRpm:Math.abs(hold.measuredSpeedRpm-prediction),
  heldOutRelativeSpeedDifferencePercent:100*Math.abs(hold.measuredSpeedRpm-prediction)/prediction,
  heldOutUpstreamCurrentDifferenceA:hold.meanUpstreamCurrentA-train.meanUpstreamCurrentA,
  heldOutMeasuredVsSetpointRpm:hold.measuredSpeedRpm-hold.publisherSpeedSetpointRpm,
  independentDeviceHeldOutSourceValidated:true,
  holdoutWasUsedToFitPrediction:false,
  claim:'Empirical agreement/disagreement across two real OTHER BLDC motor units at one condition. This is not calibrated 3V fan accuracy, future-unit population confidence, or physical manufacturing yield.',
  actualMatchedFanPhysicalMeasurements:0,
  physicalQualificationOfActiveFan:false,
  targetFanErrorBoundFromIndependentStudy:null,
  manufacturingFailurePopulationRate:null,
  realWorldBuildSuccessPercent:null,
  physicalValidationForTarget:'none',physicalVerdictForTarget:'unknown'
 });
}
