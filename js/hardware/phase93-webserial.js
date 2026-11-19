// Explicit-user-gesture browser Web Serial helper. This is optional:
// outside secure browser contexts, users can ingest a saved UART file.
import {FPGATelemetryDecoder,FPGA_FORMAT} from './phase93-fpga.js';
export async function attachFPGAWebSerial({
 serial=globalThis.navigator?.serial,baudRate=115200,
 requestPermission=false,onFrame=()=>{},onError=()=>{},
 maxFrames=5000,abortSignal=null
}={}){
 if(!serial||typeof serial.requestPort!=='function'||
    requestPermission!==true||
    !Number.isInteger(baudRate)||baudRate<1200||baudRate>3000000)
  throw Error('User permission and Web Serial-capable secure context required');
 const port=await serial.requestPort({filters:[]});
 if(!port||typeof port.open!=='function')throw Error('Browser did not grant a Web Serial port');
 let opened=false,reader=null,stopped=false;
 const decoder=new FPGATelemetryDecoder({onFrame,onError,maxFrames});
 try{
  await port.open({baudRate,bufferSize:4096});opened=true;
  if(!port.readable?.getReader)throw Error('Serial port is not readable');
  reader=port.readable.getReader();
  const closed=(async()=>{
   try{
    while(!stopped&&!abortSignal?.aborted){
     const {value,done}=await reader.read();
     if(done)break;
     if(value)decoder.push(value);
    }
   }catch(e){onError('Serial read stopped: '+e.message);}
   finally{
    try{reader.releaseLock();}catch{/* detached */}
    if(opened){try{await port.close();}catch{/* disconnected */}}
   }
  })();
  return {format:FPGA_FORMAT,source:'BROWSER_WEBSERIAL_UNAUTHENTICATED',
   close(){stopped=true;try{reader.cancel();}catch{/* already closed */}},
   closed,decoder,hardwareOriginVerified:false,
   physicalQualification:'NO_GO'};
 }catch(e){
  if(reader){try{reader.releaseLock();}catch{}}
  if(opened){try{await port.close();}catch{}}
  throw e;
 }
}
