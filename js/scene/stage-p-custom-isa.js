// Stage P / Phase 89: user-declared radix-register ISA and deterministic bytecode.
// This is a bounded *architectural* cycle model, not timing-closed RTL or a C compiler.
export const CUSTOM_ISA_FORMAT='invention-lab/phase89-custom-radix-isa/1';
export const INSTRUCTION_BYTES=12;
const OPS=Object.freeze({NOP:0,LDI:1,MOV:2,ADD:3,SUB:4,MUL:5,DIV:6,
 CMP:7,LD:8,ST:9,JMP:10,JEQ:11,JLT:12,JGT:13,JLE:14,JGE:15,
 OUT:16,OUTM:17,HALT:18});
const REVERSE=Object.fromEntries(Object.entries(OPS).map(([k,v])=>[v,k]));
const COST=Object.freeze({NOP:1,LDI:1,MOV:1,ADD:1,SUB:1,MUL:4,DIV:8,
 CMP:1,LD:2,ST:2,JMP:2,JEQ:2,JLT:2,JGT:2,JLE:2,JGE:2,
 OUT:2,OUTM:2,HALT:1});
const unsigned=x=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=0;
const name=x=>typeof x==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(x);
export function createCustomISA({
 name:isaName='Invented-CPU',
 banks=[{name:'B',radix:2,digits:32,count:4},{name:'Q',radix:4,digits:16,count:8}],
 memoryWords=256,clockHz=1000000
}={}){
 if(!name(isaName)||!Array.isArray(banks)||banks.length<1||banks.length>4||
    !unsigned(memoryWords)||memoryWords<8||memoryWords>1024||
    typeof clockHz!=='number'||!Number.isFinite(clockHz)||clockHz<=0||clockHz>1e10)
  throw Error('Invalid custom ISA envelope');
 const registers=[],seen=new Set();
 for(const b of banks){
  if(!name(b?.name)||!Number.isInteger(b?.radix)||b.radix<2||b.radix>16||
     !Number.isInteger(b?.digits)||b.digits<1||b.digits>32||
     !Number.isInteger(b?.count)||b.count<1||b.count>16)
   throw Error('Invalid radix register bank');
  const modulus=BigInt(b.radix)**BigInt(b.digits);
  if(modulus>1n<<64n)throw Error('Register width exceeds 64-bit exact ISA limit');
  for(let i=0;i<b.count;i++){
   const id=b.name+i;if(seen.has(id))throw Error('Duplicate register '+id);
   seen.add(id);registers.push({id,radix:b.radix,digits:b.digits,
    modulus:modulus.toString()});
  }
 }
 if(registers.length>32)throw Error('Register count exceeds 32');
 return {format:CUSTOM_ISA_FORMAT,name:isaName,banks:structuredClone(banks),
  registers,memoryWords,clockHz,instructionBytes:INSTRUCTION_BYTES,
  model:'single-issue-in-order-architectural-cycles-not-transistor-timing',
  physicalValidation:'none'};
}
function checkISA(isa){
 if(isa?.format!==CUSTOM_ISA_FORMAT||!Array.isArray(isa.registers)||
    !unsigned(isa.memoryWords)||isa.memoryWords>1024)throw Error('Valid ISA descriptor required');
 return isa;
}
function strip(line){return line.replace(/(?:;|#).*$/,'').trim();}
function parseImmediate(x){
 if(!/^-?(?:0x[0-9a-f]+|0b[01]+|\d+)$/i.test(x??''))
  throw Error('Numeric immediate required: '+x);
 const n=BigInt(x);
 if(n<-(1n<<63n)||n>(1n<<64n)-1n)throw Error('Immediate outside signed/unsigned 64-bit range');
 return n;
}
function opOperands(op,items,registerNames,labels,lineNo){
 const reg=s=>{
  const i=registerNames.indexOf(s);
  if(i<0)throw Error('Line '+lineNo+': undeclared register '+s);
  return i;
 };
 const address=s=>{
  const m=/^\[(\d+)\]$/.exec(s||'');
  if(!m)throw Error('Line '+lineNo+': expected fixed memory address [n]');
  return BigInt(m[1]);
 };
 const jump=s=>{
  if(!labels.has(s))throw Error('Line '+lineNo+': missing branch label '+s);
  return BigInt(labels.get(s));
 };
 const pair=['MOV','ADD','SUB','MUL','DIV','CMP'].includes(op);
 if(pair){if(items.length!==2)throw Error('Line '+lineNo+': expected two registers');
  return {a:reg(items[0]),b:reg(items[1]),imm:0n};}
 if(op==='LDI'){
  if(items.length!==2)throw Error('Line '+lineNo+': LDI register, immediate');
  return {a:reg(items[0]),b:0,imm:parseImmediate(items[1])};
 }
 if(op==='LD'){if(items.length!==2)throw Error('Line '+lineNo+': LD reg,[addr]');
  return {a:reg(items[0]),b:0,imm:address(items[1])};}
 if(op==='ST'){if(items.length!==2)throw Error('Line '+lineNo+': ST [addr],reg');
  return {a:reg(items[1]),b:0,imm:address(items[0])};}
 if(op==='OUT'){if(items.length!==1)throw Error('Line '+lineNo+': OUT reg');
  return {a:reg(items[0]),b:0,imm:0n};}
 if(op==='OUTM'){if(items.length!==1)throw Error('Line '+lineNo+': OUTM addr');
  return {a:0,b:0,imm:parseImmediate(items[0])};}
 if(['JMP','JEQ','JLT','JGT','JLE','JGE'].includes(op)){
  if(items.length!==1)throw Error('Line '+lineNo+': branch label required');
  return {a:0,b:0,imm:jump(items[0])};}
 if(['NOP','HALT'].includes(op)&&items.length===0)return {a:0,b:0,imm:0n};
 throw Error('Line '+lineNo+': invalid operands for '+op);
}
function encodeInstructions(rows){
 const buffer=new Uint8Array(rows.length*INSTRUCTION_BYTES);
 const view=new DataView(buffer.buffer);
 for(let i=0;i<rows.length;i++){
  const {op,a,b,imm}=rows[i],offset=i*INSTRUCTION_BYTES;
  view.setUint8(offset,OPS[op]);view.setUint8(offset+1,a);view.setUint8(offset+2,b);
  view.setBigUint64(offset+4,BigInt.asUintN(64,imm),true);
 }
 return buffer;
}
export function assembleCustom(isa,source){
 checkISA(isa);
 if(typeof source!=='string'||source.length>100000)throw Error('Bounded assembly text required');
 const lines=source.split(/\r?\n/),labels=new Map(),rows=[];
 for(let n=0;n<lines.length;n++){
  let line=strip(lines[n]);if(!line)continue;
  const m=/^([A-Za-z][A-Za-z0-9_]*):(?:\s*|$)/.exec(line);
  if(m){if(labels.has(m[1]))throw Error('Duplicate label '+m[1]);
   labels.set(m[1],rows.length);line=line.slice(m[0].length).trim();}
  if(!line)continue;
  const match=/^([A-Za-z]+)(?:\s+(.+))?$/.exec(line);
  if(!match||!Object.hasOwn(OPS,match[1].toUpperCase()))
   throw Error('Line '+(n+1)+': unknown instruction');
  const op=match[1].toUpperCase(),items=match[2]?match[2].split(',').map(x=>x.trim()):[];
  rows.push({op,items,lineNo:n+1});
  if(rows.length>4096)throw Error('Instruction budget exceeded');
 }
 const names=isa.registers.map(r=>r.id);
 const instructions=rows.map(row=>({op:row.op,
  ...opOperands(row.op,row.items,names,labels,row.lineNo)}));
 for(const ins of instructions){
  if(['LD','ST','OUTM'].includes(ins.op)&&
     (ins.imm<0n||ins.imm>=BigInt(isa.memoryWords)))throw Error('Memory access outside RAM');
  if(ins.op.startsWith('J')&&(ins.imm<0n||ins.imm>=BigInt(instructions.length)))
   throw Error('Invalid branch destination');
 }
 return {format:'invention-lab/phase89-bytecode/1',
  isaName:isa.name,instructionCount:instructions.length,
  bytes:encodeInstructions(instructions),source};
}
export function decodeCustom(isa,bytes){
 checkISA(isa);
 if(!(bytes instanceof Uint8Array)||bytes.length%INSTRUCTION_BYTES!==0||
    bytes.length>INSTRUCTION_BYTES*4096)throw Error('Invalid fixed-size instruction bytecode');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),out=[];
 for(let p=0;p<bytes.length;p+=INSTRUCTION_BYTES){
  const op=REVERSE[view.getUint8(p)];
  if(!op||view.getUint8(p+3)!==0)throw Error('Unknown opcode/reserved byte');
  const a=view.getUint8(p+1),b=view.getUint8(p+2),imm=view.getBigUint64(p+4,true);
  if(a>=isa.registers.length&&['LDI','LD','ST','OUT','MOV','ADD','SUB','MUL','DIV','CMP'].includes(op))
   throw Error('Bad destination register encoding');
  if(b>=isa.registers.length&&['MOV','ADD','SUB','MUL','DIV','CMP'].includes(op))
   throw Error('Bad source register encoding');
  out.push({op,a,b,imm});
 }
 return out;
}
export function disassembleCustom(isa,bytes){
 const ins=decodeCustom(isa,bytes),r=i=>isa.registers[i].id;
 return ins.map(({op,a,b,imm},pc)=>{
  let args='';
  if(['MOV','ADD','SUB','MUL','DIV','CMP'].includes(op))args=r(a)+', '+r(b);
  else if(op==='LDI')args=r(a)+', '+imm;
  else if(op==='LD')args=r(a)+', ['+imm+']';
  else if(op==='ST')args='['+imm+'], '+r(a);
  else if(op==='OUT')args=r(a);
  else if(op==='OUTM')args=String(imm);
  else if(op.startsWith('J'))args='L'+imm;
  return {pc,op,text:op+(args?' '+args:''),latencyCycles:COST[op]};
 });
}
const bounded=x=>x>100000n?100000n:x;
export function runCustomCPU(isa,program,{initialMemory=[],maxCycles=100000,traceLimit=1000}={}){
 checkISA(isa);
 if(!Number.isInteger(maxCycles)||maxCycles<1||maxCycles>1e7||
    !Number.isInteger(traceLimit)||traceLimit<0||traceLimit>10000||
    !Array.isArray(initialMemory)||initialMemory.length>isa.memoryWords)
  throw Error('Invalid virtual CPU execution bounds');
 const instructions=decodeCustom(isa,program?.bytes??program),memory=Array(isa.memoryWords).fill(0n);
 for(let i=0;i<initialMemory.length;i++){const x=initialMemory[i];
  if(!Number.isSafeInteger(x)||x<0)throw Error('Invalid initial memory');
  memory[i]=BigInt(x);
 }
 const registers=isa.registers.map(()=>0n),mod=isa.registers.map(x=>BigInt(x.modulus));
 const read=(i)=>registers[i],write=(i,v)=>registers[i]=((v%mod[i])+mod[i])%mod[i];
 const outputs=[],trace=[];let pc=0,cycles=0,retired=0,cmp=0,halted=false;
 while(pc<instructions.length){
  const x=instructions[pc],cost=COST[x.op],next=pc+1;
  if(cycles+cost>maxCycles)break;
  const val=()=>x.imm;let target=next;
  switch(x.op){
   case 'LDI':write(x.a,BigInt.asIntN(64,x.imm));break;
   case 'MOV':write(x.a,read(x.b));break;
   case 'ADD':write(x.a,read(x.a)+read(x.b));break;
   case 'SUB':write(x.a,read(x.a)-read(x.b));break;
   case 'MUL':write(x.a,read(x.a)*read(x.b));break;
   case 'DIV':if(read(x.b)===0n)throw Error('CPU divide by zero');
    write(x.a,read(x.a)/read(x.b));break;
   case 'CMP':cmp=read(x.a)<read(x.b)?-1:read(x.a)>read(x.b)?1:0;break;
   case 'LD':if(val()>=BigInt(memory.length))throw Error('CPU memory overflow');
    write(x.a,memory[Number(val())]);break;
   case 'ST':if(val()>=BigInt(memory.length))throw Error('CPU memory overflow');
    memory[Number(val())]=read(x.a);break;
   case 'JMP':target=Number(val());break;
   case 'JEQ':if(cmp===0)target=Number(val());break;
   case 'JLT':if(cmp<0)target=Number(val());break;
   case 'JGT':if(cmp>0)target=Number(val());break;
   case 'JLE':if(cmp<=0)target=Number(val());break;
   case 'JGE':if(cmp>=0)target=Number(val());break;
   case 'OUT':outputs.push(read(x.a).toString());break;
   case 'OUTM':if(val()>=BigInt(memory.length))throw Error('CPU memory overflow');
    outputs.push(memory[Number(val())].toString());break;
   case 'HALT':halted=true;break;
  }
  if(target>=instructions.length&&!halted)throw Error('CPU jumped beyond program');
  cycles+=cost;retired++;
  if(trace.length<traceLimit)trace.push({pc,op:x.op,cycleEnd:cycles});
  if(halted)break;
  pc=target;
 }
 return {format:'invention-lab/phase89-custom-cpu-result/1',
  ok:halted,halted,cycles,retired,clockHz:isa.clockHz,
  elapsedSeconds:cycles/isa.clockHz,outputs,
  registers:Object.fromEntries(isa.registers.map((r,i)=>[r.id,registers[i].toString()])),
  memory:memory.slice(0,64).map(String),trace,
  reason:halted?null:'UNHALTED_OR_CYCLE_BUDGET',
  model:'declared-abstract-instruction-latencies-not-measured-RTL',
  calibratedDeviceData:false,physicalValidation:'none',
  simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
export function compileStructuredWorkload(isa,{kind,values=[],a=0,b=0}={}){
 checkISA(isa);
 const nonBinary=isa.registers.filter(x=>x.radix!==2);
 const chosen=nonBinary.length>=2?nonBinary:isa.registers;
 const r=chosen[0]?.id,t=chosen[1]?.id;
 if(!t)throw Error('Workload needs at least two declared registers');
 const lines=[];
 if(kind==='sort'){
  if(!Array.isArray(values)||values.length<2||values.length>24||
     values.some(x=>!Number.isSafeInteger(x)||x<0))
   throw Error('Sort needs 2..24 nonnegative safe integer values');
  if(values.length>isa.memoryWords)throw Error('Sort exceeds configured RAM');
  for(let i=0;i<values.length;i++)lines.push('LDI '+r+', '+values[i],'ST ['+i+'], '+r);
  let label=0;
  for(let end=values.length;end>1;end--)for(let i=0;i<end-1;i++){
   const skip='L'+(label++);
   lines.push('LD '+r+', ['+i+']','LD '+t+', ['+(i+1)+']',
    'CMP '+r+', '+t,'JLE '+skip,'ST ['+i+'], '+t,
    'ST ['+(i+1)+'], '+r,skip+':');
  }
  for(let i=0;i<values.length;i++)lines.push('OUTM '+i);
 }else if(kind==='math'){
  if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<0)
   throw Error('Math operands must be safe nonnegative integers');
  lines.push('LDI '+r+', '+a,'LDI '+t+', '+b,
   'ADD '+r+', '+t,'MUL '+r+', '+t,'OUT '+r);
 }else throw Error('Only bounded sort and math bytecode backends supported');
 lines.push('HALT');
 const source=lines.join('\n');
 return {format:'invention-lab/phase89-structured-compiler/1',
  language:'bounded-C-like-structured-IR-not-general-C',kind,source,
  bytecode:assembleCustom(isa,source)};
}
export function compileTinyCLike(isa,source){
 checkISA(isa);
 if(typeof source!=='string'||source.length>10000)throw Error('Bounded tiny C-like source required');
 const regs=new Set(isa.registers.map(x=>x.id)),out=[];
 for(const statement of source.split(';').map(x=>x.trim()).filter(Boolean)){
  let m=/^let\s+([A-Za-z]\w*)\s*=\s*(\d+)$/.exec(statement);
  if(m&&regs.has(m[1])){out.push('LDI '+m[1]+', '+m[2]);continue;}
  m=/^([A-Za-z]\w*)\s*=\s*\1\s*([+*-])\s*([A-Za-z]\w*)$/.exec(statement);
  if(m&&regs.has(m[1])&&regs.has(m[3])){
   out.push(({'+':'ADD','-':'SUB','*':'MUL'})[m[2]]+' '+m[1]+', '+m[3]);continue;
  }
  m=/^print\(([A-Za-z]\w*)\)$/.exec(statement);
  if(m&&regs.has(m[1])){out.push('OUT '+m[1]);continue;}
  throw Error('Unsupported or unsafe C-like syntax: '+statement.slice(0,80));
 }
 if(!out.length)throw Error('Empty C-like program');
 out.push('HALT');
 return {format:'invention-lab/phase89-tiny-c-compiler/1',
  language:'restricted-C-like-register-expressions',bytecode:assembleCustom(isa,out.join('\n'))};
}
