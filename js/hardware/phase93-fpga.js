// Phase 93 — FPGA bridge. Pure browser/Node module. No invented board pins,
// native USB access, physical signoff, or hidden toolchain execution.
export const FPGA_FORMAT='invention-lab/phase93-fpga-bridge/1';
const ID=/^[A-Za-z_][A-Za-z_0-9]{0,63}$/;
const boardID=/^[A-Za-z0-9_-]{2,64}$/;
const int=(x,min,max,label)=>{if(!Number.isInteger(x)||x<min||x>max)throw Error('Invalid '+label);return x;};
const safe=x=>typeof x==='string'&&ID.test(x);
export function fpgaLogicSpec({name='invented_q4_half_adder',radix=4,
 kind='half-adder',truthTable=null}={}){
 if(!safe(name)||!['half-adder','lookup'].includes(kind)||![2,3,4].includes(radix))
  throw Error('Unsupported bounded FPGA logic target');
 const codeBits=radix===2?1:2;
 let rows=[];
 if(kind==='lookup'){
  if(!Array.isArray(truthTable)||truthTable.length!==radix*radix)
   throw Error('Exhaustive truth table required');
  const seen=new Set();
  for(const row of truthTable){
   if(!row||!['a','b','sum','carry'].every(k=>Number.isInteger(row[k]))||
    [row.a,row.b,row.sum].some(x=>x<0||x>=radix)||
    row.carry<0||row.carry>=radix)throw Error('Invalid truth table row');
   const key=row.a+':'+row.b;
   if(seen.has(key))throw Error('Repeated truth-table input');
   seen.add(key);rows.push({a:row.a,b:row.b,sum:row.sum,carry:row.carry});
  }
 }else{
  for(let a=0;a<radix;a++)for(let b=0;b<radix;b++)
   rows.push({a,b,sum:(a+b)%radix,carry:Math.floor((a+b)/radix)});
 }
 rows.sort((x,y)=>x.a-y.a||x.b-y.b);
 return {format:FPGA_FORMAT,name,radix,codeBits,kind,truthTable:rows,
  binaryEmulation:radix===4?'two-bits-per-quat':radix===3?'two-bits-per-trit':'binary',
  physicalVoltageLevelsVerified:false};
}
export function emitFPGAVerilog(spec,{language='systemverilog'}={}){
 if(spec?.format!==FPGA_FORMAT||!safe(spec.name)||!['systemverilog','verilog'].includes(language))
  throw Error('Explicit verified logic specification required');
 const checked=fpgaLogicSpec({name:spec.name,radix:spec.radix,kind:'lookup',truthTable:spec.truthTable});
 if(checked.codeBits!==spec.codeBits)throw Error('Incorrect radix encoding');
 const b=spec.codeBits;
 const fmt=n=>b+"'d"+n;
 const lines=[
  '// Functional binary-emulation wrapper only; NOT multi-level analog voltage.',
  '// A real FPGA pin remains binary CMOS regardless of radix.',
  'module '+spec.name+' (',
  ' input wire ['+(b-1)+':0] a, b,',
  ' output reg ['+(b-1)+':0] sum, carry',
  ');',
  "always @* begin",
  " sum="+fmt(0)+"; carry="+fmt(0)+";",
  ' case ({a,b})'
 ];
 for(const row of checked.truthTable){
  lines.push("  "+fmt(row.a)+", "+fmt(row.b)+": begin sum="+fmt(row.sum)+"; carry="+fmt(row.carry)+"; end");
 }
 // The combined pair is a 2*b-bit concatenation — don't write two
 // separate case-expression operands.
 lines.splice(lines.indexOf(' case ({a,b})')+1);
 for(const row of checked.truthTable)
  lines.push('  {'+fmt(row.a)+','+fmt(row.b)+'}: begin sum='+fmt(row.sum)+'; carry='+fmt(row.carry)+'; end');
 lines.push('  default: begin sum='+fmt(0)+'; carry='+fmt(0)+'; end',
  ' endcase','end','endmodule','');
 return {format:FPGA_FORMAT,language,top:spec.name,
  filename:spec.name+(language==='systemverilog'?'.sv':'.v'),
  content:lines.join('\n'),functionalReference:true,
  synthesized:false,pinConstraintsVerified:false,
  physicalValidation:'none'};
}
export function planOpenFPGAFlow({spec,board,device='hx8k',
 packageName='ct256',pinConstraintsFile=null,bitstreamFile='top.bin',
 approved=false}={}){
 if(spec?.format!==FPGA_FORMAT||!safe(spec.name)||!boardID.test(board||'')||
    !['hx1k','hx4k','hx8k','lp1k','lp4k','lp8k'].includes(device)||
    !/^[A-Za-z0-9_-]{2,32}$/.test(packageName)||
    !/^[a-zA-Z0-9_.-]{1,100}\.pcf$/.test(pinConstraintsFile||'')||
    !/^[a-zA-Z0-9_.-]{1,100}\.bin$/.test(bitstreamFile))
  throw Error('Missing explicitly validated iCE40 board, package and pin constraints');
 // No shell strings! Only stable argv lists. A user must supply the real
 // compatible board constraint file and opt in before flashing.
 const source=spec.name+'.sv',json=spec.name+'.json',asc=spec.name+'.asc';
 const bitstream=bitstreamFile;
 const commands=[
  {bin:'yosys',args:['-p','read_verilog -sv '+source+'; synth_ice40 -top '+spec.name+' -json '+json]},
  {bin:'nextpnr-ice40',args:['--'+device,'--package',packageName,'--json',json,'--pcf',pinConstraintsFile,'--asc',asc]},
  {bin:'icepack',args:[asc,bitstream]},
  {bin:'openFPGALoader',args:['-b',board,bitstream]}
 ];
 return {format:FPGA_FORMAT,commands,board,device,packageName,pinConstraintsFile,
  status:approved===true?'HUMAN_APPROVED_EXECUTION_PLAN_ONLY':'NOT_APPROVED',
  executed:false,bitstreamMeasured:false,physicalValidation:'none',
  note:'Board pin mapping, clock, voltage and board compatibility require independent validation'};
}
export const UART_FRAME_BYTES=8,UART_START=0xa5;
export function decodeFPGAFrame(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length!==UART_FRAME_BYTES||bytes[0]!==UART_START)
  throw Error('Invalid fixed binary UART frame');
 const parity=bytes.slice(0,7).reduce((x,y)=>x^y,0);
 if(parity!==bytes[7])throw Error('UART XOR parity mismatch');
 const seq=(bytes[1]<<8)|bytes[2],a=bytes[3],b=bytes[4],
  sum=bytes[5],carry=bytes[6];
 if([a,b,sum,carry].some(x=>x>3))throw Error('Unmapped Q4 sample state');
 return {format:FPGA_FORMAT,sequence:seq,a,b,sum,carry,
  voltageCalibrated:false,source:'UART_FRAME_UNAUTHENTICATED',
  hardwareMeasurementAuthenticated:false};
}
export function encodeFPGAFrame({sequence,a,b,sum,carry}){
 int(sequence,0,65535,'sequence');
 for(const [k,v] of Object.entries({a,b,sum,carry}))int(v,0,3,k);
 const raw=Uint8Array.of(UART_START,sequence>>8,sequence&255,a,b,sum,carry,0);
 raw[7]=raw.slice(0,7).reduce((x,y)=>x^y,0);
 return raw;
}
export class FPGATelemetryDecoder{
 constructor({onFrame=()=>{},onError=()=>{},maxFrames=5000}={}){
  if(typeof onFrame!=='function'||typeof onError!=='function')throw Error('Invalid parser callbacks');
  int(maxFrames,1,1e6,'maximum frame count');
  this.onFrame=onFrame;this.onError=onError;this.maxFrames=maxFrames;
  this.pending=[];this.seen=0;this.expected=null;this.invalid=0;
 }
 push(chunk){
  if(!(chunk instanceof Uint8Array)||chunk.length>65536)throw Error('Invalid UART byte chunk');
  for(const byte of chunk){
   if(this.pending.length===0&&byte!==UART_START)continue;
   this.pending.push(byte);
   if(this.pending.length===UART_FRAME_BYTES){
    try{
     const sample=decodeFPGAFrame(Uint8Array.from(this.pending));
     if(this.expected!==null&&sample.sequence!==this.expected)
      throw Error('FPGA sequence discontinuity');
     this.expected=(sample.sequence+1)&65535;
     this.seen++;
     if(this.seen>this.maxFrames)throw Error('Maximum frame count exceeded');
     this.onFrame(sample);
    }catch(e){this.invalid++;this.onError(e.message);this.expected=null;}
    this.pending=[];
   }
  }
 }
}
export function makeFPGACaptureSession({designId,boardId,deviceSerial,
 operatorId,utc=null}={}){
 const string=x=>typeof x==='string'&&x.length>2&&x.length<=120&&/^[\w.-]+$/.test(x);
 if(![designId,boardId,deviceSerial,operatorId].every(string))throw Error('Hardware session identity required');
 return {format:FPGA_FORMAT,designId,boardId,deviceSerial,operatorId,
  recordedAtUTC:utc??new Date().toISOString(),
  acquisition:'UNVERIFIED_DEVICE_IDENTITY',
  provenance:'CLAIMED_OPERATOR_METADATA',signed:false,
  physicalQualification:'NO_GO'};
}
