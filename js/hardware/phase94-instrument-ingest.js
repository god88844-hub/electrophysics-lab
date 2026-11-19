// Phase 94 — bounded instrument captures. Ingestion is *not* authentication.
// Drivers are injected for tests or controlled native-side adapters; the web
// page never obtains hidden USB or VISA privileges.
export const INSTRUMENT_FORMAT='invention-lab/phase94-instrument-trace/1';
const valid=x=>typeof x==='number'&&Number.isFinite(x);
const units=Object.freeze({voltage:'V',current:'A',temperature:'degC',
 frequency:'Hz',timing:'s',digital:'logic',power:'W'});
const clean=x=>typeof x==='string'&&x.length>=1&&x.length<=120&&
 /^[\w./: -]+$/.test(x);
function validateNumbers(samples){
 if(!Array.isArray(samples)||samples.length<1||samples.length>100000||
    samples.some(x=>!valid(x)))throw Error('Finite bounded instrument samples required');
}
export function parseSCPIAsciiWaveform(text,{
 channel='CH1',quantity='voltage',timeIncrementS,
 timeOriginS=0,verticalMultiplier=1,verticalOffset=0,maxSamples=100000
}={}){
 if(typeof text!=='string'||text.length>2000000||
   !clean(channel)||!Object.hasOwn(units,quantity)||
   !valid(timeIncrementS)||timeIncrementS<=0||timeIncrementS>10000||
   !valid(timeOriginS)||!valid(verticalMultiplier)||verticalMultiplier===0||
   !valid(verticalOffset)||!Number.isInteger(maxSamples)||maxSamples<1||maxSamples>100000)
  throw Error('Invalid SCPI waveform capture parameters');
 const body=text.trim().replace(/^#[0-9]/,''); // only plain CSV supported; reject binary blocks
 if(text.trim().startsWith('#'))throw Error('SCPI binary block requires a device-specific decoder');
 const tokens=body.split(/[\s,;]+/).filter(Boolean);
 if(tokens.length<1||tokens.length>maxSamples)throw Error('SCPI trace length outside budget');
 const raw=tokens.map(Number);
 validateNumbers(raw);
 const values=raw.map(x=>x*verticalMultiplier+verticalOffset);
 if(values.some(x=>!valid(x)))throw Error('SCPI scaled voltage overflow');
 return {format:INSTRUMENT_FORMAT,channel,quantity,unit:units[quantity],
  axisUnit:'s',times:values.map((_,i)=>timeOriginS+i*timeIncrementS),
  values,sourceProtocol:'SCPI_ASCII_WAVEFORM',
  originalCaptureAuthenticated:false,physicalQualification:'NO_GO'};
}
export function parseSigrokCSV(text,{timeColumn='Time',channel='D0',
 periodS=null}={}){
 if(typeof text!=='string'||text.length>2000000||!clean(channel)||
    !clean(timeColumn))throw Error('Invalid bounded sigrok CSV capture');
 const lines=text.trim().split(/\r?\n/);
 if(lines.length<2||lines.length>100001)throw Error('Sigrok CSV row count outside budget');
 const head=lines[0].split(',').map(s=>s.trim());
 const channelIndex=head.indexOf(channel),timeIndex=head.indexOf(timeColumn);
 if(channelIndex<0||timeIndex<0||channelIndex===timeIndex)throw Error('Sigrok header needs channel and time');
 const times=[],values=[];
 for(const line of lines.slice(1)){
  const row=line.split(',').map(x=>x.trim());
  if(row.length!==head.length)throw Error('Sigrok row width mismatch');
  const time=Number(row[timeIndex]),v=Number(row[channelIndex]);
  if(!valid(time)||!Number.isInteger(v)||v<0||v>1||
     times.length&&time<=times.at(-1))throw Error('Invalid monotonic sigrok sample');
  times.push(time);values.push(v);
 }
 if(periodS!==null&&(!valid(periodS)||periodS<=0))
  throw Error('Invalid sample period');
 return {format:INSTRUMENT_FORMAT,channel,quantity:'digital',unit:'logic',
  axisUnit:'s',times,values,sourceProtocol:'SIGROK_CSV',
  originalCaptureAuthenticated:false,physicalQualification:'NO_GO'};
}
// Authenticity of this public sample is NOT independently established.
// Tektronix TDS2012C-style 5-column CSV: metadata, metadata value, blank,
// instrument sample time, instrument channel voltage.
export function parseTektronixCSV(text,{maxSamples=100000}={}){
 if(typeof text!=='string'||text.length>2000000||
    !Number.isInteger(maxSamples)||maxSamples<2||maxSamples>100000)
  throw Error('Invalid Tektronix CSV source bounds');
 const rows=text.trim().split(/\r?\n/);
 if(rows.length<2||rows.length>maxSamples+1)
  throw Error('Tektronix waveform length outside budget');
 const metadata={},times=[],values=[];
 for(const row of rows){
  const fields=row.split(',');
  if(fields.length<5)throw Error('Tektronix source row width mismatch');
  const [key,value,,timeText,signalText]=fields.map(x=>x.trim());
  if(key&&value)metadata[key]=value;
  const t=Number(timeText),v=Number(signalText);
  if(!valid(t)||!valid(v)||times.length&&t<=times.at(-1))
   throw Error('Invalid monotonic Tektronix capture');
  times.push(t);values.push(v);
 }
 if(metadata['Vertical Units']!=='V'||metadata['Horizontal Units']!=='s'||
    !/^[A-Za-z0-9-]+$/.test(metadata['Model Number']||'')||
    !/^[A-Za-z0-9-]+$/.test(metadata['Serial Number']||''))
  throw Error('Missing original instrument waveform metadata');
 const declared=Number(metadata['Record Length']);
 if(Number.isInteger(declared)&&declared!==times.length)
  throw Error('Tektronix sample count differs from instrument record');
 return {format:INSTRUMENT_FORMAT,channel:metadata.Source||'CH1',
  quantity:'voltage',unit:'V',axisUnit:'s',times,values,
  modelClaim:metadata['Model Number'],
  serialClaim:metadata['Serial Number'],
  metadata,sourceProtocol:'TEKTRONIX_CSV_RECORDED_SAMPLE',
  originalCaptureAuthenticated:false,physicalQualification:'NO_GO'};
}

export function parseSensorCSV(text,{
 timeColumn='t_s',valueColumn='temperature_c',quantity='temperature'
}={}){
 if(typeof text!=='string'||text.length>2000000||
    !['temperature','current','voltage','power'].includes(quantity)||
    !clean(timeColumn)||!clean(valueColumn))
  throw Error('Invalid sensor CSV source');
 const lines=text.trim().split(/\r?\n/);
 if(lines.length<2||lines.length>100001)throw Error('Sensor CSV outside bounded range');
 const keys=lines[0].split(',').map(x=>x.trim()),t=keys.indexOf(timeColumn),v=keys.indexOf(valueColumn);
 if(t<0||v<0||t===v)throw Error('Sensor header missing required columns');
 const times=[],values=[];
 for(const line of lines.slice(1)){
  const fields=line.split(',');
  if(fields.length!==keys.length)throw Error('Sensor row schema mismatch');
  const time=Number(fields[t]),val=Number(fields[v]);
  if(!valid(time)||!valid(val)||times.length&&time<=times.at(-1))
   throw Error('Invalid sensor sample');
  times.push(time);values.push(val);
 }
 return {format:INSTRUMENT_FORMAT,channel:valueColumn,quantity,unit:units[quantity],
  axisUnit:'s',times,values,sourceProtocol:'SERIAL_SENSOR_CSV',
  originalCaptureAuthenticated:false,physicalQualification:'NO_GO'};
}
export function makeInstrumentSession({instrumentModel,instrumentSerial,
 operatorId,calibrationCertificateId=null,designId,utc=null}={}){
 if(![instrumentModel,instrumentSerial,operatorId,designId].every(clean)||
    calibrationCertificateId!==null&&!clean(calibrationCertificateId))
  throw Error('Instrument session requires explicit identity and design');
 return {format:INSTRUMENT_FORMAT,instrumentModel,instrumentSerial,operatorId,designId,
  calibrationCertificateId,recordedAtUTC:utc??new Date().toISOString(),
  signed:false,certificateAuthenticated:false,physicalQualification:'NO_GO'};
}
export async function querySCPIInstrument({
 transport,command='*IDN?',timeoutMs=3000
}={}){
 if(!transport||typeof transport.query!=='function'||
    !['*IDN?','*OPC?','SYST:ERR?','WAV:DATA?','CURV?'].includes(command)||
    !Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>10000)
  throw Error('Explicit allowed read-only SCPI transport required');
 const response=await transport.query(command,{timeoutMs});
 if(typeof response!=='string'||response.length>2000000)
  throw Error('Invalid SCPI response frame');
 return {command,response,originalDeviceAuthenticated:false,
  source:'INJECTED_TRANSPORT_READ_ONLY'};
}
export async function pollInstrumentTrace({transport,query='CURV?',
 parameters,session,maxSamples=100000}={}){
 if(session?.format!==INSTRUMENT_FORMAT)throw Error('Recorded session metadata required');
 const response=await querySCPIInstrument({transport,command:query});
 const trace=parseSCPIAsciiWaveform(response.response,{...parameters,maxSamples});
 return {format:INSTRUMENT_FORMAT,session,trace,
  signed:false,physicalQualification:'NO_GO'};
}
export function compareCapturedWaveform({trace,simulation,absoluteTolerance,
 relativeTolerance=0}={}){
 if(trace?.format!==INSTRUMENT_FORMAT||
    !Array.isArray(simulation)||simulation.length!==trace.values.length||
    simulation.some(x=>!valid(x))||
    !valid(absoluteTolerance)||absoluteTolerance<0||
    !valid(relativeTolerance)||relativeTolerance<0||relativeTolerance>1)
  throw Error('Comparable simulated samples and declared error bounds required');
 const residuals=trace.values.map((value,i)=>value-simulation[i]);
 const n=residuals.length;
 const rmse=Math.sqrt(residuals.reduce((s,x)=>s+x*x,0)/n);
 const maxAbs=Math.max(...residuals.map(Math.abs));
 const outside=residuals.filter((r,i)=>Math.abs(r)>
   absoluteTolerance+relativeTolerance*Math.abs(simulation[i])).length;
 return {format:INSTRUMENT_FORMAT,channel:trace.channel,unit:trace.unit,
  samples:n,rmse,maxAbsoluteResidual:maxAbs,outsideDeclaredTolerance:outside,
  residuals,comparison:'UNAUTHENTICATED_INSTRUMENT_TRACE_VS_SIMULATION',
  physicalQualification:'NO_GO'};
}
export function capturedTraceToSceneOverlay(trace,{maxPoints=512}={}){
 if(trace?.format!==INSTRUMENT_FORMAT||!Array.isArray(trace.values)||
    !Array.isArray(trace.times)||trace.values.length!==trace.times.length||
    !Number.isInteger(maxPoints)||maxPoints<2||maxPoints>1024)
  throw Error('Invalid instrument trace overlay source');
 const stride=Math.max(1,Math.ceil(trace.values.length/maxPoints));
 const samples=[];
 for(let i=0;i<trace.values.length;i+=stride)
  samples.push({timeS:trace.times[i],value:trace.values[i],unit:trace.unit});
 return {format:INSTRUMENT_FORMAT,source:'CAPTURED_UNAUTHENTICATED',
  samples,channel:trace.channel,hardwareAuthenticated:false};
}
