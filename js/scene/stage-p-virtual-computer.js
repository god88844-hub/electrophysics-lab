// Stage P / Phase 91: bounded virtual computer with CPU, RAM, ROM, IRQ,
// display/UART, plus an in-memory Forth-like shell. NOT RISC-V Linux boot.
import {createCustomISA,runCustomCPU,assembleCustom} from './stage-p-custom-isa.js';
export const VIRTUAL_COMPUTER_FORMAT='invention-lab/phase91-virtual-computer/1';
const ID=/^[a-z][a-z0-9-]{0,63}$/;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function createVirtualComputer({isa=createCustomISA(),romSource='HALT',
 ramWords=null,uartBase=240,displayColumns=40,displayRows=12,
 interruptVector=0}={}){
 if(isa?.format!=='invention-lab/phase89-custom-radix-isa/1'||
    typeof romSource!=='string'||romSource.length>25000||
    !Number.isInteger(uartBase)||uartBase<0||uartBase>=isa.memoryWords||
    !Number.isInteger(interruptVector)||interruptVector<0||interruptVector>255||
    !Number.isInteger(displayColumns)||displayColumns<8||displayColumns>160||
    !Number.isInteger(displayRows)||displayRows<3||displayRows>80)
  throw Error('Invalid virtual computer board parameters');
 const ram=ramWords??isa.memoryWords;
 if(!Number.isInteger(ram)||ram<8||ram>isa.memoryWords)
  throw Error('RAM cannot exceed ISA memory model');
 const nodes=[
  ['cpu','custom-cpu',0,0],['ram','sram',18,0],
  ['rom','boot-rom',-18,0],['irq','interrupt-controller',0,-16],
  ['uart','uart',18,-16],['display','virtual-display',35,-16]
 ].map(([id,kind,xMm,zMm])=>({
  id,kind,xMm,zMm,yMm:0,geometry:'illustrative-3d-block'}));
 const buses=[
  ['cpu','ram','address-data'],['cpu','rom','instruction'],
  ['irq','cpu','interrupt'],['cpu','uart','mmio'],
  ['uart','display','text']
 ].map(([from,to,protocol])=>({from,to,protocol}));
 return {format:VIRTUAL_COMPUTER_FORMAT,isa,romSource,ramWords:ram,
  uartBase,displayColumns,displayRows,interruptVector,
  nodes,buses,layoutUnits:'mm',physicalValidation:'none',
  bootMode:'custom-isa-rom-or-sandboxed-forth-not-riscv-linux',
  rISCVLinuxCompatible:false};
}
export function validateVirtualComputer(board){
 if(board?.format!==VIRTUAL_COMPUTER_FORMAT||
    !Array.isArray(board.nodes)||!Array.isArray(board.buses))
  throw Error('Virtual board schema required');
 const ids=new Set(board.nodes.map(x=>x.id));
 const required=['cpu','ram','rom','irq','uart','display'];
 for(const id of required)if(!ids.has(id))throw Error('Missing required computer component '+id);
 const edges=new Set(board.buses.map(x=>x.from+'>'+x.to+':'+x.protocol));
 for(const [from,to,protocol] of [
  ['cpu','ram','address-data'],['cpu','rom','instruction'],
  ['irq','cpu','interrupt'],['cpu','uart','mmio'],['uart','display','text']
 ])if(!edges.has(from+'>'+to+':'+protocol))throw Error('Disconnected bus '+from+'/'+to);
 return {connected:true,devices:required.length,bootMode:board.bootMode,
  physicallyQualified:false};
}
function displayFrame(text,cols,rows){
 const raw=String(text).split('\n'),lines=[];
 for(const line of raw){for(let i=0;i<line.length||i===0;i+=cols)lines.push(line.slice(i,i+cols));}
 return lines.slice(-rows).map(x=>x.padEnd(cols,' '));
}
export function bootVirtualComputer(board,{maxCycles=100000,initialMemory=[]}={}){
 validateVirtualComputer(board);
 const compiled=assembleCustom(board.isa,board.romSource);
 const cpu=runCustomCPU(board.isa,compiled,{maxCycles,initialMemory});
 const uart=cpu.outputs.map(x=>({cycle:cpu.cycles,text:x,device:'virtual-uart'}));
 const text=uart.map(x=>x.text).join('\n');
 return {format:'invention-lab/phase91-boot-result/1',
  status:cpu.halted?'ROM_HALTED':'CPU_BUDGET_OR_BOOT_FAILURE',
  cpu,uart,displayText:text,
  displayFrame:displayFrame(text,board.displayColumns,board.displayRows),
  interruptController:{vector:board.interruptVector,delivery:'NOT_MODELED'},
  physicalValidation:'none',linuxBooted:false,
  simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
export function createForthMonitor(board,{maxStack=128,maxWords=256}={}){
 validateVirtualComputer(board);
 if(!Number.isInteger(maxStack)||maxStack<2||maxStack>10000||
    !Number.isInteger(maxWords)||maxWords<1||maxWords>4096)
  throw Error('Invalid Forth monitor limits');
 let stack=[],cells=Array(board.ramWords).fill(0n),lines=[],steps=0;
 function run(source){
  if(typeof source!=='string'||source.length>10000)throw Error('Forth source too long');
  // No eval, filesystem, network, JavaScript or arbitrary native code.
  const tokens=source.replace(/\\[^\n]*/g,'').trim().split(/\s+/).filter(Boolean);
  if(tokens.length>maxWords)throw Error('Forth instruction budget exceeded');
  const buffer=[];
  function pop(){if(!stack.length)throw Error('Forth stack underflow');return stack.pop();}
  function push(x){if(stack.length>=maxStack)throw Error('Forth stack overflow');stack.push(x);}
  for(const word of tokens){
   if(++steps>100000)throw Error('Forth session budget exceeded');
   if(/^-?\d+$/.test(word)){
    const n=BigInt(word);if(n<-(1n<<63n)||n>(1n<<63n)-1n)throw Error('Forth value out of range');
    push(n);continue;
   }
   if(word==='DUP'){const x=pop();push(x);push(x);}
   else if(word==='DROP'){pop();}
   else if(word==='SWAP'){const a=pop(),b=pop();push(a);push(b);}
   else if(['+','-','*','/','MOD','<','>','='].includes(word)){
    const b=pop(),a=pop();let v;
    if(word==='+')v=a+b;else if(word==='-')v=a-b;else if(word==='*')v=a*b;
    else if(word==='/'){if(b===0n)throw Error('Forth divide by zero');v=a/b;}
    else if(word==='MOD'){if(b===0n)throw Error('Forth modulo zero');v=a%b;}
    else if(word==='<')v=a<b?1n:0n;
    else if(word==='>')v=a>b?1n:0n;else v=a===b?1n:0n;
    push(v);
   }else if(word==='!'){
    const addr=pop(),v=pop();
    if(addr<0n||addr>=BigInt(cells.length))throw Error('Forth memory overflow');
    cells[Number(addr)]=v;
   }else if(word==='@'){
    const addr=pop();
    if(addr<0n||addr>=BigInt(cells.length))throw Error('Forth memory overflow');
    push(cells[Number(addr)]);
   }else if(word==='.'||word==='EMIT'){
    const v=pop();
    buffer.push(word==='.'?v.toString():
     v>=0n&&v<=127n?String.fromCharCode(Number(v)):'?');
   }else if(word==='CR')buffer.push('\n');
   else throw Error('Unsupported sandbox Forth word '+word);
  }
  lines.push(buffer.join(''));const text=lines.join('\n');
  return {format:'invention-lab/phase91-forth-monitor/1',ok:true,steps,
   stack:stack.map(String),stdout:buffer.join(''),displayText:text,
   displayFrame:displayFrame(text,board.displayColumns,board.displayRows),
   memoryTouched:cells.some(x=>x!==0n),
   interpreter:'bounded-Forth-subset-not-Linux-or-RTOS',
   physicalValidation:'none'};
 }
 return {run,reset(){stack=[];cells=Array(board.ramWords).fill(0n);lines=[];steps=0;}};
}
export function bootLinuxImage(){
 return {status:'UNSUPPORTED_CPU_ISA_OR_MACHINE_ABI',
  reason:'RISC-V Linux image requires genuine RISC-V instruction/MMU/privilege and device emulation',
  linuxBooted:false,physicalValidation:'none'};
}
