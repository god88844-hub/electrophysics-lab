import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareCompilerEngines,compileProgram,validateProgram,SAMPLE} from '../js/evidence/phase58-compiler-cosim.js';
test('Phase58 simple compiled IR agrees across arithmetic oracle and both CPU engines',()=>{
 const r=compareCompilerEngines(SAMPLE);
 assert.equal(r.pass,true);assert.equal(r.pipelinePorts[0].value,19);
 assert.equal(r.pipelinePorts[1].value,254);
 assert.equal(r.independentRtlWaveformComparison,'NOT_PERFORMED');
});
test('Wraparound arithmetic and overlapping source/destination are exact',()=>{
 const p={...structuredClone(SAMPLE),operations:[{op:'ADD',dst:0,src:0},{op:'SUB',dst:1,src:0},
  {op:'AND',dst:2,src:1},{op:'OR',dst:5,src:1},{op:'XOR',dst:6,src:5}]};
 assert.equal(compareCompilerEngines(p).pass,true);
});
test('Compiler rejects unsupported op, malformed ports and unbounded workloads',()=>{
 for(const edit of [p=>p.operations[0].op='MUL',p=>p.outputs[0].port=256,
 p=>p.initial[0]=-1,p=>p.operations.push(...Array.from({length:1001},()=>p.operations[0])),
 p=>p.extra='untrusted']){
  const p=structuredClone(SAMPLE);edit(p);assert.throws(()=>compileProgram(p));
 }
});
test('Deterministic reproducibility without timing or silicon claims',()=>{
 const a=compareCompilerEngines(SAMPLE),b=compareCompilerEngines(SAMPLE);
 assert.deepEqual(a,b);assert.equal(a.physicalVerdict,'unknown');
 assert.equal(a.realWorldBuildSuccessPercent,null);
});
test('Structured generated programs exercise ALU invariants across several seeds',()=>{
 for(let s=0;s<20;s++){
  const p=structuredClone(SAMPLE);
  p.initial=Array.from({length:8},(_,i)=>(i*37+s*41)&255);
  p.operations=Array.from({length:24},(_,i)=>({op:['ADD','SUB','AND','OR','XOR'][(i+s)%5],
    dst:i%8,src:(i*3+s)%8}));
  assert.equal(validateProgram(p),true);assert.equal(compareCompilerEngines(p).pass,true);
 }
});