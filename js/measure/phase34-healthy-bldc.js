// Phase34 source-pinned publisher healthy BLDC PG pulse reconstruction.
export const FORMAT='invention-lab/phase34-published-healthy-bldc-speed-audit/1';
const COLUMNS=['t_us','ax','ay','az','ax1','ay1','az1','shunt_raw','bus_raw',
 'curr_raw','pg_rpm','seq','dt'];
export function verifyHealthyPin(p){
 if(p?.format!=='invention-lab/phase34-original-healthy-bldc-acquisition-pin/1'||
   p.sourceRepository!=='Atikas/OpenBLDCData'||
   p.sourceCommit!=='1ce35456f83be8f36aec183ab19d6e6e46603023'||
   p.sourcePath!=='data/analize_healthy10_500rpm_19mA_bat.csv'||
   p.expectedGitBlobSHA1!=='8dd094813462b489e3a24519d1b7a154bd12cf04'||
   p.expectedBytes!==22712053||p.sourceLicense!=='CC BY 4.0'||
   !p.attribution.includes('Robertas')||p.namedRpmSetpoint!==500||
   p.namedHysteresisBrakeLoadMilliamp!==19||
   p.motorUnitAndExperimentId!=='10'||p.speedPulsesPerRevolution!==6||
   p.busVoltageVPerRawCount!==0.00125||
   p.currentAperRawCount!==0.00030518||
   p.pairedFaultCaseSourceBlob!=='7249edf7f21a337bec52fa11fa3c6e555d3e4627'||
   p.deviceIndependenceFromFaultCase!==false||
   p.actualOurFanSiliconMeasurements!==0||
   p.realWorldBuildSuccessPercent!==null||
   p.modelErrorCertifiedForPhase31Fan!==null||
   p.physicalValidationForOurFan!=='none'||
   p.physicalVerdictForOurFan!=='unknown')
  throw Error('Phase34 original healthy publisher source, identity or physical gate tampered');
 return true;
}
export async function inspectHealthyPublishedRecording(lines,p){
 verifyHealthyPin(p);
 if(!lines||typeof lines[Symbol.asyncIterator]!=='function')
  throw Error('Streaming raw original source lines required');
 let seenHeader=false,n=0,startT=null,previousT=null,previousSeq=null,prevPulse=null;
 let pulseEdges=0,pulseHigh=0,pulseLow=0,busSum=0,currentSum=0;
 let busMin=Infinity,busMax=-Infinity,currentMin=Infinity,currentMax=-Infinity;
 let clockJitterMaxS=0,seqGaps=0,dtInconsistencies=0,dtMissing=0;
 for await(const line of lines){
  if(!line||!line.trim())continue;
  if(!seenHeader){
   const h=line.trim().split(',');
   if(h.length!==COLUMNS.length||h.some((x,i)=>x!==COLUMNS[i]))
    throw Error('Original healthy BLDC source 13-column measurement format changed');
   seenHeader=true;continue;
  }
  const fields=line.split(',');
  if(fields.length!==COLUMNS.length)throw Error('Invalid original motor sample row '+(n+1));
  const x=fields.map((s,i)=>i===12&&s.trim()===''?null:Number(s.trim()));
  if(x.some((v,i)=>v===null?i!==12:!Number.isFinite(v))||
   x.slice(0,12).some(v=>!Number.isSafeInteger(v))||
   x[0]<0||x[8]<0||x[9]<0||(x[10]!==0&&x[10]!==1))
   throw Error('Unusable raw sensor values or invalid PG speed-pulse samples');
  const [t,busRaw,currentRaw,pulse,seq,dt]=[x[0],x[8],x[9],x[10],x[11],x[12]];
  if(startT===null)startT=t;
  if(previousT!==null){
   if(t<=previousT)throw Error('Nonmonotonic publisher acquisition timestamp');
   if(seq!==previousSeq+1)seqGaps++;
   const elapsed=(t-previousT)/1e6;
   clockJitterMaxS=Math.max(clockJitterMaxS,Math.abs(elapsed-.001));
   if(dt===null)dtMissing++;
   else if(dt<=0||Math.abs(elapsed-dt)>1e-7)dtInconsistencies++;
  }
  if(prevPulse===0&&pulse===1)pulseEdges++;
  if(pulse===1)pulseHigh++;else pulseLow++;
  prevPulse=pulse;
  const v=busRaw*p.busVoltageVPerRawCount;
  const c=currentRaw*p.currentAperRawCount;
  busSum+=v;currentSum+=c;busMin=Math.min(v,busMin);
  busMax=Math.max(v,busMax);currentMin=Math.min(c,currentMin);
  currentMax=Math.max(c,currentMax);
  previousT=t;previousSeq=seq;n++;
 }
 if(!seenHeader||n<2)throw Error('Original published healthy motor recording contains no usable time-series');
 const duration=(previousT-startT)/1e6;
 if(!(duration>0))throw Error('No physical time in original motor recording');
 const pulseValid=pulseEdges>=6&&pulseHigh>0&&pulseLow>0;
 // This is time-weighted-ish pulse-count speed of this published driver
 // signal, not the mechanical RPM of OUR 3V fan. No metrology certification.
 return {
  format:FORMAT,publisherPart:p.publisherMotor,
  rawRecordedSamples:n,recordDurationSeconds:duration,
  publisherSpeedSetpointRpm:p.namedRpmSetpoint,
  originalMotorUnitAndExperimentId:p.motorUnitAndExperimentId,
  acquisitionClockMonotone:true,sequenceGapEvents:seqGaps,
  reportedDtMissing:dtMissing,reportedDtInconsistent:dtInconsistencies,
  maxAbsoluteSampleJitterFrom1msSeconds:clockJitterMaxS,
  pgHighSamples:pulseHigh,pgLowSamples:pulseLow,
  pgRisingEdges:pulseEdges,
  originalPublisherPGSignalSpeedUsable:pulseValid,
  reconstructedPublisherPGSpeedRpm:pulseValid?
   pulseEdges/p.speedPulsesPerRevolution/duration*60:null,
  differenceToSetpointRpm:pulseValid?
   pulseEdges/p.speedPulsesPerRevolution/duration*60-p.namedRpmSetpoint:null,
  upstreamBusVoltageMeanV:busSum/n,upstreamBusVoltageMinV:busMin,
  upstreamBusVoltageMaxV:busMax,
  upstreamElectricalCurrentMeanA:currentSum/n,
  upstreamElectricalCurrentMinA:currentMin,upstreamElectricalCurrentMaxA:currentMax,
  sourceHardwareMeasurementsBelongToOther24VBLDC:true,
  sourcePublisherCalibrationIndependentlyReviewedByUs:false,
  separateMotorUnitHoldoutEstablishableFromThisRecording:false,
  current3VFanMeasuredRpm:null,current3VFanMeasuredPhysicalSamples:0,
  modelErrorForOur3VFan:null,realWorldBuildSuccessPercent:null,
  physicalValidationForOurFan:'none',physicalVerdictForOurFan:'unknown'
 };
}
export function comparePublishedHealthyWithFault(healthy,fault){
 if(healthy?.format!==FORMAT||
  fault?.format!=='invention-lab/phase33-original-24v-bldc-measurement-audit/1')
  throw Error('Only independently parsed original 24V BLDC recordings can be compared');
 return {
  study:'matched-publisher-rig-setting-not-independently-heldout-motor-units',
  publisherMotorUnitCondition:'10, ~500 RPM setpoint, 19mA hysteresis brake setting, 2x lead-acid supply',
  healthyOriginalRows:healthy.rawRecordedSamples,
  faultOriginalRows:fault.parsedOriginalPublishedRows,
  healthyPulseReconstructedRPM:healthy.reconstructedPublisherPGSpeedRpm,
  faultyPulseReconstructedRPM:fault.inferredRpmFromPulseEdges,
  faultSensorFlag:'SF',
  experimentalSameTrueMechanicalRpmEstablished:false,
  externalControlPopulationStatisticsEstimated:false,
  validSameTargetSourceMotorIdentityConfirmed:true,
  deviceMatchesHypothetical3VBrushedFan:false,
  originalTargetFanPhysicalObservations:0,
  realWorldBuildSuccessPercent:null,physicalVerdict:'unknown'
 };
}
