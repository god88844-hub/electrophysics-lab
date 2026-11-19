// Stage Q opt-in physical bridge controls. Never grants physical qualification
// from browser UI, mocked serial streams, or user-selected instrument files.
import {attachPanelClose} from '../ui/panel-close.mjs';
import {fpgaLogicSpec,emitFPGAVerilog,makeFPGACaptureSession}
 from '../hardware/phase93-fpga.js';
import {attachFPGAWebSerial} from '../hardware/phase93-webserial.js';
import {parseSCPIAsciiWaveform,parseSigrokCSV,parseSensorCSV,parseTektronixCSV,
 capturedTraceToSceneOverlay,compareCapturedWaveform}
 from '../hardware/phase94-instrument-ingest.js';
import {planTapeout,createUnqualifiedFoundryBundle}
 from '../hardware/phase95-tapeout-package.js';
// Physical qualification is intentionally server/evidence-side only.
// Browser UI must not import Stage 96 native/calibration modules.
const make=(d,tag,label)=>{const e=d.createElement(tag);if(label)e.textContent=label;return e;};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function attachStageQHardwareBridge(viewer){
 const d=viewer.root.ownerDocument;
 const toggle=make(d,'button','Optional Real Hardware Bridge (Stage Q)');
 toggle.type='button';toggle.dataset.action='stage-q-hardware-bridge';
 toggle.setAttribute('aria-expanded','false');
 const panel=make(d,'section');panel.hidden=true;panel.className='scene3d-wire-editor';
 panel.setAttribute('aria-label','Stage Q optional physical evidence ingestion');
 const warning=make(d,'p','Hardware evidence NOT VERIFIED. USB/UART, SCPI or uploaded CSV claims cannot authorize silicon fabrication, release, or PHYSICALLY_QUALIFIED.');
 const design=make(d,'input');design.value='q4-half-adder-1';
 design.setAttribute('aria-label','Physical design identifier');
 const exportRTL=make(d,'button','Download Q4 binary-emulation SystemVerilog');
 exportRTL.type='button';exportRTL.dataset.action='stage-q-export-rtl';
 const serial=make(d,'button','Connect FPGA UART with browser permission');
 serial.type='button';serial.dataset.action='stage-q-connect-serial';
 const closeSerial=make(d,'button','Disconnect FPGA UART');
 closeSerial.type='button';closeSerial.disabled=true;
 const captureMode=make(d,'select');captureMode.setAttribute('aria-label','Recorded instrument capture format');
 for(const [v,t] of [['tek','Tektronix CSV'],['sigrok','sigrok time/digital CSV'],
  ['sensor','Temperature/current sensor CSV'],['scpi','SCPI ASCII voltage samples']]){
  const o=make(d,'option',t);o.value=v;captureMode.append(o);
 }
 const captureText=make(d,'textarea');captureText.rows=4;
 captureText.setAttribute('aria-label','Imported instrument trace CSV or SCPI ASCII');
 const modelText=make(d,'textarea');modelText.rows=2;
 modelText.setAttribute('aria-label','Optional aligned simulated voltage samples (CSV list)');
 modelText.placeholder='Optional aligned simulated samples to compare with capture';
 const sampleTime=make(d,'input');sampleTime.type='number';sampleTime.step='any';
 sampleTime.value='.000001';sampleTime.setAttribute('aria-label','SCPI sample period in seconds');
 const ingest=make(d,'button','Inspect recorded instrument samples');
 ingest.type='button';ingest.dataset.action='stage-q-ingest-trace';
 const filePicker=make(d,'input');filePicker.type='file';filePicker.multiple=true;
 filePicker.setAttribute('aria-label','Original GDSII LEF DEF SPICE and test vector files');
 const inspectPackage=make(d,'button','Inspect unqualified foundry artifact bundle');
 inspectPackage.type='button';inspectPackage.dataset.action='stage-q-foundry-inspect';
 const status=make(d,'pre');status.setAttribute('role','status');
 status.style.whiteSpace='pre-wrap';status.style.maxHeight='20rem';status.style.overflow='auto';
 const canvas=make(d,'canvas');canvas.width=520;canvas.height=140;
 canvas.setAttribute('aria-label','Side-by-side measured and simulated trace plot (unqualified)');
 panel.append(make(d,'strong','Stage Q — FPGA, instruments and physical evidence'),warning,
  design,exportRTL,serial,closeSerial,captureMode,captureText,modelText,sampleTime,
  ingest,canvas,filePicker,inspectPackage,status);
 viewer.root.append(panel);viewer.controls.append(toggle);
 let link=null,latestTrace=null,latestModel=null;
 function show(value){status.textContent=typeof value==='string'?value:
  JSON.stringify(value,null,2).slice(0,15000);}
 function renderTrace(){
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#111827';ctx.fillRect(0,0,canvas.width,canvas.height);
  if(!latestTrace)return;
  const values=[...latestTrace.values,...(latestModel??[])];
  const min=Math.min(...values),max=Math.max(...values);
  const delta=Math.max(1e-9,max-min);
  function plot(samples,color){
   if(!samples?.length)return;
   ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2;
   for(let i=0;i<samples.length;i+=Math.max(1,Math.ceil(samples.length/512))){
    const x=10+i/(samples.length-1)*500;
    const y=125-(samples[i]-min)/delta*110;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   ctx.stroke();
  }
  plot(latestTrace.values,'#22d3ee');plot(latestModel,'#f59e0b');
  ctx.font='11px sans-serif';ctx.fillStyle='#e2e8f0';
  ctx.fillText('cyan: captured, amber: simulated — both UNQUALIFIED',12,15);
 }
 toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;
  toggle.setAttribute('aria-expanded',String(!panel.hidden));});
 attachPanelClose({panel,toggle,label:'Close hardware bridge panel'});
 exportRTL.addEventListener('click',()=>{
  try{
   const spec=fpgaLogicSpec({radix:4,name:'q4_half_adder'});
   const verilog=emitFPGAVerilog(spec);
   const blob=new Blob([verilog.content],{type:'text/plain'});
   const uri=URL.createObjectURL(blob),a=make(d,'a');
   a.href=uri;a.download=verilog.filename;a.click();
   URL.revokeObjectURL(uri);
   show({filename:verilog.filename,logic:'Q4 encoded on 2 FPGA bits per quat',
    synthesizableReference:true,physicalValidation:'none',
    boardPinsConfigured:false,programmed:false});
  }catch(e){show('RTL export refused: '+e.message);}
 });
 serial.addEventListener('click',async()=>{
  try{
   if(link)throw Error('Disconnect the prior UART connection first');
   const session=makeFPGACaptureSession({designId:design.value,boardId:'user-fpga',
    deviceSerial:'unverified-user-device',operatorId:'local-operator'});
   link=await attachFPGAWebSerial({requestPermission:true,
    onFrame:frame=>{
     show({session,latestFrame:frame,source:'UNAUTHENTICATED_FPGA_UART',
      physicalQualification:'NO_GO'});
     viewer.requestRender();
    },onError:error=>show('UART read/parity error: '+error)});
   closeSerial.disabled=false;
   show({status:'UART_LINK_OPEN_NOT_AUTHENTICATED',session,
    physicalQualification:'NO_GO'});
  }catch(e){show('UART connection refused: '+e.message);}
 });
 closeSerial.addEventListener('click',()=>{
  link?.close();link=null;closeSerial.disabled=true;
  show('UART closed: no physical qualification was issued');
 });
 ingest.addEventListener('click',()=>{
  try{
   const t=captureText.value;
   latestTrace=captureMode.value==='tek'?parseTektronixCSV(t):
    captureMode.value==='sigrok'?parseSigrokCSV(t):
    captureMode.value==='sensor'?parseSensorCSV(t):
    parseSCPIAsciiWaveform(t,{timeIncrementS:Number(sampleTime.value)});
   const userModel=modelText.value.trim();
   latestModel=userModel?userModel.split(/[,\s]+/).map(Number):null;
   if(latestModel&&(!latestModel.every(finite)||latestModel.length!==latestTrace.values.length))
    throw Error('Simulated samples must align exactly to captured samples');
   const comparison=latestModel?compareCapturedWaveform({
    trace:latestTrace,simulation:latestModel,absoluteTolerance:.1}):null;
   renderTrace();
   show({capture:capturedTraceToSceneOverlay(latestTrace,{maxPoints:10}),
    comparison,traceAuthenticity:'NOT_ESTABLISHED',
    physicalQualification:'NO_GO'});
  }catch(e){latestTrace=null;latestModel=null;show('Instrument trace refused: '+e.message);}
 });
 inspectPackage.addEventListener('click',async()=>{
  try{
   const plan=planTapeout({designId:design.value,foundry:'SKY130'});
   const entries=[];
   for(const file of filePicker.files??[]){
    const name=file.name,kind=/\.gds(ii)?$/i.test(name)?'gds':
     /\.lef$/i.test(name)?'lef':/\.def$/i.test(name)?'def':
     /\.(sp|spice|cir)$/i.test(name)?'spice':
     /\.json$/i.test(name)?'testvectors':null;
    if(!kind)throw Error('Unknown foundry artifact extension');
    entries.push({kind,filename:name,bytes:new Uint8Array(await file.arrayBuffer())});
   }
   if(!entries.length){show(plan);return;}
   show(await createUnqualifiedFoundryBundle({plan,artifacts:entries}));
  }catch(e){show('Foundry packager refused: '+e.message);}
 });
 return {toggle,panel,exportRTL,serial,closeSerial,captureMode,captureText,
  modelText,sampleTime,ingest,inspectPackage,status,canvas,
  get latestTrace(){return latestTrace;},
  dispose(){link?.close();panel.remove();toggle.remove();}};
}
