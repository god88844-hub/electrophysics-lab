// Phase 58: deterministic bounded micro-program compiler and independent
// architectural/IL-8 pipeline comparison. This is not RTL waveform co-sim.
import {assemble} from '../labs/cpu/assembler.js';
import {referenceRun,runCPU} from '../labs/cpu/cpu.js';
const FORMAT='invention-lab/phase58-il8-compiler-architecture/1';
const OP=new Set(['ADD','SUB','AND','OR','XOR']);
function guard(ok,msg){if(!ok)throw new Error(msg)}
function reg(v){guard(Number.isInteger(v)&&v>=0&&v<=7,'Register must be 0..7');return 'R'+v}
export function validateProgram(p){
 guard(p&&typeof p==='object'&&!Array.isArray(p)&&
  Object.keys(p).sort().join(',')==='format,initial,operations,outputs',
  'Unexpected or missing program fields');
 guard(p.format===FORMAT,'Unsupported compiler IR format');
 guard(Array.isArray(p.initial)&&p.initial.length===8&&
   p.initial.every(v=>Number.isInteger(v)&&v>=0&&v<=255),
   'Eight explicit byte-wide initial registers required');
 guard(Array.isArray(p.operations)&&p.operations.length<=1000,'Operation budget exceeded');
 for(const o of p.operations){
  guard(o&&Object.keys(o).sort().join(',')==='dst,op,src'&&OP.has(o.op),
    'Only explicit two-register ALU operations allowed');
  reg(o.dst);reg(o.src);
 }
 guard(Array.isArray(p.outputs)&&p.outputs.length<=16,'Output budget exceeded');
 for(const x of p.outputs){
  guard(x&&Object.keys(x).sort().join(',')==='port,reg'&&
   Number.isInteger(x.port)&&x.port>=0&&x.port<=255,'Invalid output port');
  reg(x.reg);
 }
 return true;
}
export function compileProgram(p){
 validateProgram(p);
 const statements=[...p.initial.map((v,i)=>'LDI '+reg(i)+', '+v),
   ...p.operations.map(o=>o.op+' '+reg(o.dst)+', '+reg(o.src)),
   ...p.outputs.map(x=>'OUT '+x.port+', '+reg(x.reg)),'HLT'];
 const source=statements.join('\n');
 const assembled=assemble(source);
 guard(assembled.ok,'Assembler rejected generated program '+assembled.errors.join('; '));
 return {format:'invention-lab/phase58-compiled-il8/1',source,
   instructionCount:statements.length,byteLength:assembled.bytes.length,
   bytes:assembled.bytes};
}
export function pureOracle(p){
 validateProgram(p);
 const reg8=[...p.initial];
 for(const {op,dst,src} of p.operations){
  const a=reg8[dst],b=reg8[src];
  reg8[dst]=({ADD:()=>a+b,SUB:()=>a-b,AND:()=>a&b,
   OR:()=>a|b,XOR:()=>a^b})[op]()&255;
 }
 return {regs:reg8,outputs:p.outputs.map(({port,reg})=>({port,value:reg8[reg]}))};
}
export function compareCompilerEngines(p){
 const compiled=compileProgram(p),oracle=pureOracle(p);
 const arch=referenceRun(compiled.bytes),pipeline=runCPU(compiled.bytes,{maxCycles:20000});
 const ports=x=>x.map(({port,value})=>({port,value}));
 const json=x=>JSON.stringify(x);
 const pass=pipeline.ok&&arch.halted&&pipeline.halted&&
   json(pipeline.regs)===json(arch.regs)&&json(arch.regs)===json(oracle.regs)&&
   json(ports(pipeline.ports))===json(ports(arch.ports))&&
   json(ports(arch.ports))===json(oracle.outputs);
 return {format:'invention-lab/phase58-cross-engine-result/1',pass,
  compilerInstructionCount:compiled.instructionCount,
  oracleRegisterBytes:oracle.regs,architectureRegisterBytes:arch.regs,
  pipelineRegisterBytes:pipeline.regs,
  referencePorts:ports(arch.ports),pipelinePorts:ports(pipeline.ports),
  pipelineCycles:pipeline.stats.cycles,pipelineStalls:pipeline.stats.stalls,
  independentRtlWaveformComparison:'NOT_PERFORMED',
  externalQemuForThisIL8Program:'NOT_APPLICABLE',
  physicalChipValidation:'NOT_PERFORMED',
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export const SAMPLE=Object.freeze({format:FORMAT,
 initial:[200,75,0,1,255,0,0,0],
 operations:[{op:'ADD',dst:0,src:1},{op:'XOR',dst:2,src:0},
  {op:'SUB',dst:4,src:3},{op:'OR',dst:5,src:4}],
 outputs:[{port:0,reg:0},{port:1,reg:4}]});
