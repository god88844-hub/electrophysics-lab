// Phase 64 - typed, bounded cross-domain software workflows.
// The connections are explicit transfers of simulated values, never physical interfaces.
import {assemble} from '../labs/cpu/assembler.js';
import {runCPU,referenceRun} from '../labs/cpu/cpu.js';
import {bell,probabilities} from './phase61-density-noise.js';
import {quantize} from '../core/pipeline.js';
export const FORMAT='invention-lab/phase64-typed-coupling/1';
const types={quantum:['none','probability'],adc:['probability','byte'],cpu:['byte','byte'],bit:['byte','bit']};
const fail=(m)=>{throw Error(m)};
const allowedKeys=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&
 Object.keys(value).sort().join(',')===keys.slice().sort().join(',');
export function verifyWorkflow(plan){
 if(!allowedKeys(plan,['format','stages'])||plan.format!==FORMAT||!Array.isArray(plan.stages)||
    plan.stages.length!==4)fail('Expected four explicitly typed stages');
 const ids=new Set();
 for(let i=0;i<4;i++){
  const s=plan.stages[i],kind=['quantum','adc','cpu','bit'][i];
  if(!allowedKeys(s,['id','kind','source','config'])||s.kind!==kind||
     typeof s.id!=='string'||!/^[a-z][a-z0-9-]{0,31}$/.test(s.id)||ids.has(s.id))
   fail('Invalid stage kind, identity or ordering');
  ids.add(s.id);
  if(i===0){if(s.source!==null||!allowedKeys(s.config,['dephasingProbability'])||
     typeof s.config.dephasingProbability!=='number'||!Number.isFinite(s.config.dephasingProbability)||
     s.config.dephasingProbability<0||s.config.dephasingProbability>1)fail('Invalid quantum source');}
  else if(s.source!==plan.stages[i-1].id)fail('Unconnected or reordered cross-lab input');
  if(i===1&&(!allowedKeys(s.config,['levels'])||s.config.levels!==256))fail('Unsupported ADC precision');
  if(i===2&&(!allowedKeys(s.config,['assembly','inputPort','outputPort'])||
   s.config.assembly!=='IN R1, 7\nOUT 0, R1\nHLT'||s.config.inputPort!==7||s.config.outputPort!==0))
   fail('CPU source and port mapping must be pinned');
  if(i===3&&(!allowedKeys(s.config,['threshold'])||s.config.threshold!==128))fail('Invalid byte threshold');
 }
 return true;
}
export const BASELINE={format:FORMAT,stages:[
 {id:'q-model',kind:'quantum',source:null,config:{dephasingProbability:0}},
 {id:'prob-to-byte',kind:'adc',source:'q-model',config:{levels:256}},
 {id:'il8',kind:'cpu',source:'prob-to-byte',config:{assembly:'IN R1, 7\nOUT 0, R1\nHLT',inputPort:7,outputPort:0}},
 {id:'byte-to-bit',kind:'bit',source:'il8',config:{threshold:128}}
]};
export function runWorkflow(plan){
 verifyWorkflow(plan);
 const stages=plan.stages,intermediates=[];
 const q=probabilities(bell('dephasing',stages[0].config.dephasingProbability));
 const p00=q[0];
 if(!Number.isFinite(p00)||p00<0||p00>1)fail('Invalid quantum probability');
 intermediates.push({id:stages[0].id,kind:'quantum',outputType:'probability',value:p00,
  semantic:'exact conditional density-matrix probability'});
 // Normalize accumulated floating-point roundoff before the exact 1/2 ADC tie.
 const normalizedP00=Math.round(p00*1e12)/1e12;
 const byte=quantize(normalizedP00,{min:0,max:1,levels:stages[1].config.levels});
 if(!Number.isInteger(byte)||byte<0||byte>255)fail('ADC produced an invalid byte');
 intermediates.push({id:stages[1].id,kind:'adc',inputType:'probability',outputType:'byte',
  value:byte,semantic:'explicit unitless 8-bit quantization'});
 const compiled=assemble(stages[2].config.assembly);
 if(!compiled.ok)fail('Source-locked CPU failed assembly');
 const cpu=runCPU(compiled.bytes,{inputs:{[stages[2].config.inputPort]:byte},maxCycles:200});
 const ref=referenceRun(compiled.bytes,{inputs:{[stages[2].config.inputPort]:byte},maxSteps:200});
 const ports=x=>x.map(v=>({port:v.port,value:v.value}));
 if(!cpu.ok||!cpu.halted||!ref.halted||
    JSON.stringify(cpu.regs)!==JSON.stringify(ref.regs)||
    JSON.stringify(ports(cpu.ports))!==JSON.stringify(ports(ref.ports)))fail('CPU differential reference mismatch');
 if(cpu.ports.length!==1||cpu.ports[0].port!==stages[2].config.outputPort)fail('CPU output mapping invalid');
 const received=cpu.ports[0].value;
 if(!Number.isInteger(received)||received<0||received>255)fail('CPU byte out of bounds');
 intermediates.push({id:stages[2].id,kind:'cpu',inputType:'byte',outputType:'byte',
  value:received,semantic:'IL-8 software simulation, architectural cross-check'});
 const bit=received>=stages[3].config.threshold?1:0;
 intermediates.push({id:stages[3].id,kind:'bit',inputType:'byte',outputType:'bit',
  value:bit,semantic:'unitless comparator'});
 return {format:'invention-lab/phase64-scope-bounded-result/1',
  transferGraph:stages.map(s=>({id:s.id,kind:s.kind,source:s.source})),
  outputs:intermediates,
  canonicalResult:{p00,adcByte:byte,cpuByte:received,outputBit:bit},
  coupledPhysicalModels:false,hardwareInterfaceExercised:false,
  hardwareCalibrationSamples:0,physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null};
}