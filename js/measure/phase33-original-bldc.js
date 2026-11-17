// Phase33 inspect ORIGINAL published BLDC source data, fail closed on bad
// sensors and use a separate physical-population / device transfer gate.
export const FORMAT='invention-lab/phase33-original-24v-bldc-measurement-audit/1';
const HEADER=['t_us','ax','ay','az','ax1','ay1','az1','shunt_raw','bus_raw',
 'curr_raw','pg_rpm','seq','dt'];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const mean=x=>x.sum/x.n;
export function verifyPublicPin(policy){
 if(policy?.format!=='invention-lab/phase33-original-published-bldc-data-pin/1'||
  policy.sourceRepository!=='Atikas/OpenBLDCData'||
  policy.sourceCommit!=='1ce35456f83be8f36aec183ab19d6e6e46603023'||
  policy.sourcePath!=='data/analize_misalignment10_SF_500rpm_19mA_bat.csv'||
  policy.expectedGitBlobSHA1!=='7249edf7f21a337bec52fa11fa3c6e555d3e4627'||
  policy.expectedRawBytes!==421672||policy.expectedRows!==5073||
  policy.licensedAs!=='CC BY 4.0'||!policy.acknowledgement.includes('Robertas')||
  policy.sourceMotorPart!=='STEPPEROLINE BLDC 57BYA54-24-01'||
  policy.sourceRatedVoltageV!==24||
  policy.sourceControlTechnology!=='BD10LR BLDC driver'||
  policy.conditionSetpointRpm!==500||policy.loadControllerSettingMilliamp!==19||
  policy.ina226BusVoltageLSBVolts!==0.00125||
  policy.ina226CurrentLSBAmps!==0.00030518||
  policy.speedEncoderPulsesPerRevolution!==6||
  policy.sourceFaultCategory!=='misalignment AND SF (sensor failure/drift)'||
  policy.sourcePublisherIndependentlyAudited!==false||
  policy.target3VBatteryFanHardwareMeasurements!==0||
  policy.target3VFanPhysicallyCalibratedModelError!==null||
  policy.target3VFanSuccessPercent!==null||
  policy.physicalValidationForTarget!=='none'||
  policy.physicalVerdictForTarget!=='unknown'||
  policy.realWorldBuildSuccessPercent!==null)
  throw Error('Original BLDC source pin changed, source identity lost or 3V fan falsely validated');
 return true;
}
export function inspectPublishedBLDC(csv,policy,{strictPinnedFile=false}={}){
 verifyPublicPin(policy);
 if(typeof csv!=='string'||csv.length<80||csv.length>10000000)
  throw Error('Empty, oversized or missing BLDC raw sample file');
 const rows=csv.trimEnd().split(/\r?\n/);
 const h=rows.shift().split(',');
 if(h.length!==HEADER.length||h.some((x,i)=>x!==HEADER[i]))
  throw Error('BLDC original raw acquisition columns differ from expected measurement sensors');
 if(strictPinnedFile && (rows.length!==policy.expectedRows||csv.length!==policy.expectedRawBytes))
  throw Error('Pinned original BLDC raw acquisition file size/row count changed');
 let previousTime=null,previousSequence=null,pulsePrevious=null,pulseRisingEdges=0,
  highCount=0,lowCount=0,dtReportedCount=0,jitterMaxSeconds=0;
 const current={sum:0,n:0},bus={sum:0,n:0};
 let busMin=Infinity,busMax=-Infinity,currentMin=Infinity,currentMax=-Infinity;
 let firstTime=null,lastTime=null;
 for(let i=0;i<rows.length;i++){
  const columns=rows[i].split(',');
  if(columns.length!==13)throw Error('Raw BLDC row '+i+' has wrong number of sensor values');
  const x=columns.map((v,k)=>v===''&&k===12?null:Number(v));
  if(x.some((v,k)=>v===null?k!==12:!finite(v))||
    x.slice(0,12).some(v=>!Number.isSafeInteger(v))||
    x[0]<0||x[10]!==0&&x[10]!==1||
    x[8]<0||x[9]<0)
   throw Error('Original BLDC raw sensor row '+i+' contains nonfinite/physically invalid data');
  const t=x[0],seq=x[11],p=x[10],d=x[12];
  if(firstTime===null)firstTime=t;
  if(previousTime!==null){
   if(t<=previousTime)throw Error('Unordered or duplicate original timestamps');
   if(seq!==previousSequence+1)throw Error('Skipped or duplicated acquisition sample sequence');
   const actual=(t-previousTime)/1e6;
   if(d===null||d<=0||Math.abs(d-actual)>1e-7)
    throw Error('Recorded time interval inconsistent with original timestamp clock');
   jitterMaxSeconds=Math.max(jitterMaxSeconds,Math.abs(actual-0.001));
   dtReportedCount++;
  }
  if(p===1)highCount++;else lowCount++;
  if(pulsePrevious===0&&p===1)pulseRisingEdges++;
  pulsePrevious=p;
  const cur=x[9]*policy.ina226CurrentLSBAmps;
  const voltage=x[8]*policy.ina226BusVoltageLSBVolts;
  current.sum+=cur;current.n++;
  bus.sum+=voltage;bus.n++;
  busMin=Math.min(busMin,voltage);busMax=Math.max(busMax,voltage);
  currentMin=Math.min(currentMin,cur);currentMax=Math.max(currentMax,cur);
  previousTime=t;lastTime=t;previousSequence=seq;
 }
 if(!rows.length)throw Error('No original electrical sensor data');
 const elapsed=(lastTime-firstTime)/1e6;
 if(!(elapsed>0))throw Error('No recorded physical time elapsed');
 // A constant encoder PG signal or <2 pulses cannot support speed inference.
 const rpmValid=pulseRisingEdges>=2&&highCount>0&&lowCount>0;
 const publisherBad=policy.sourceFaultCategory.includes('SF (sensor failure/drift)');
 return Object.freeze({
  format:FORMAT,sourceRepository:policy.sourceRepository,
  sourceCommit:policy.sourceCommit,
  sourceFile:policy.sourcePath,
  sourceMotorPart:policy.sourceMotorPart,
  sourceRatedVoltageV:policy.sourceRatedVoltageV,
  sourceConditionSetpointRpm:policy.conditionSetpointRpm,
  sourceFaultCategory:policy.sourceFaultCategory,
  parsedOriginalPublishedRows:rows.length,
  elapsedRecordSeconds:elapsed,
  sampleSequenceConsecutive:true,
  clockRecordMonotone:true,
  reportedIntervalCount:dtReportedCount,
  maxDeviationFrom1msSeconds:jitterMaxSeconds,
  measuredBusVoltageMeanV:mean(bus),
  measuredBusVoltageMinV:busMin,measuredBusVoltageMaxV:busMax,
  measuredElectricalCurrentMeanA:mean(current),
  measuredElectricalCurrentMinA:currentMin,
  measuredElectricalCurrentMaxA:currentMax,
  tachPulseRisingEdges:pulseRisingEdges,
  tachHighSamples:highCount,tachLowSamples:lowCount,
  physicallyUsableTachometerEstimate:rpmValid&&!publisherBad,
  inferredRpmFromPulseEdges:rpmValid&&!publisherBad?
    pulseRisingEdges/policy.speedEncoderPulsesPerRevolution/elapsed*60:null,
  sourcePublisherSensorFaultDeclared:publisherBad,
  sourcePublisherIndependentLabAudit:false,
  rawSourceGitObjectBoundToPublisherBytes:strictPinnedFile,
  independentlyQualifiedCurrentOrVoltageCalibration:false,
  individualSamplesAreIndependentHardwareUnits:false,
  deviceMatchesPhase31Illustrative3VFan:false,
  originalMatching3VFanHardwareObservations:0,
  physicalFanModelErrorBound:null,
  trueManufacturingSuccessPercent:null,
  realWorldBuildSuccessPercent:null,
  physicalValidationForTarget:'none',physicalVerdictForTarget:'unknown',
  conclusion:publisherBad?'Original published BLDC test bench has an SF sensor-failure label; abnormal PG channel makes RPM unidentifiable. Voltage/current are published sensor readings, NOT qualified target-fan physical tests.'
   :'Published other-motor acquisition parsed; no automatic hardware equivalence to 3V fan.'
 });
}
