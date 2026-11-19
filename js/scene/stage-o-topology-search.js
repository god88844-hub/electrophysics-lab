// Stage O / Phase 85: deterministic candidate search. No fake SPICE data.
// Functional candidates are bounded before evidence-backed expensive evaluation.
import {evaluateRadixAlu} from '../evidence/phase73-mvl-devices.js';
import {Diagram} from '../core/diagram.js';
import {runLogic} from '../labs/logic/engine.js';
import {generateIdealAdderReference} from './stage-o-agent-tools.js';
import {seededUniformGenerator} from '../evidence/phase75-monte-carlo.js';
export const SEARCH_FORMAT='invention-lab/phase85-topology-search/1';
const number=x=>typeof x==='number'&&Number.isFinite(x);
export function candidateSignature(candidate){
 if(!candidate||!Number.isInteger(candidate.radix)||candidate.radix<2||candidate.radix>16||
   ![4,8].includes(candidate.width)||!Number.isInteger(candidate.gateBudget)||
   candidate.gateBudget<1||candidate.gateBudget>100000||
   !Number.isInteger(candidate.pipelineDepth)||candidate.pipelineDepth<0||
   candidate.pipelineDepth>32||!number(candidate.driveScale)||candidate.driveScale<=0||
   candidate.driveScale>16||!number(candidate.wireSpacingMm)||candidate.wireSpacingMm<=0||
   candidate.wireSpacingMm>100||!['standard','lvt','hvt'].includes(candidate.threshold))
  throw Error('Invalid topology candidate parameters');
 return [candidate.radix,candidate.width,candidate.gateBudget,candidate.pipelineDepth,
  candidate.driveScale,candidate.wireSpacingMm,candidate.threshold].join(':');
}
export function generateTopologyCandidates({seed=73,count=12,radix=4,width=4,
 baseline={gateBudget:30,pipelineDepth:1,driveScale:1,wireSpacingMm:.2,threshold:'standard'}}={}){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||
    !Number.isInteger(count)||count<1||count>512||!Number.isInteger(radix)||
    radix<2||radix>16||![4,8].includes(width))throw Error('Invalid topology search domain');
 const next=seededUniformGenerator(seed);
 const variants=['standard','lvt','hvt'];const seen=new Set(),result=[];
 for(let i=0;i<count*8&&result.length<count;i++){
  const candidate={radix,width,
   gateBudget:Math.max(1,Math.min(100000,Math.round((baseline.gateBudget??30)*(0.8+next()*.7)))),
   pipelineDepth:Math.max(0,Math.min(32,Math.round((baseline.pipelineDepth??1)+(next()-.5)*4))),
   driveScale:+Math.max(.05,Math.min(16,(baseline.driveScale??1)*(.6+next()*1.5))).toFixed(5),
   wireSpacingMm:+Math.max(.001,Math.min(100,(baseline.wireSpacingMm??.2)*(.6+next()*1.8))).toFixed(5),
   threshold:variants[Math.floor(next()*variants.length)],
   iteration:result.length};
  const signature=candidateSignature(candidate);if(seen.has(signature))continue;
  seen.add(signature);result.push({id:'candidate-'+String(result.length).padStart(4,'0'),
   ...candidate,signature,status:'UNVERIFIED_TOPOLOGY'});
 }
 if(result.length!==count)throw Error('Search space exhausted before candidate budget');
 return {format:SEARCH_FORMAT,seed,radix,width,candidates:result,
  generatedFrom:'bounded-seeded-mutation-not-trained-AI',physicalValidation:'none'};
}
export function fastFunctionalPrune(candidate,{referenceWidth=null}={}){
 candidateSignature(candidate);
 const width=referenceWidth??candidate.width;
 if(width!==candidate.width)throw Error('Candidate width mismatch');
 // A candidate topology without a transistor netlist cannot be proved
 // functionally equivalent by a mathematical radix reference alone.
 const vectors=[
  [Array(width).fill(0),[...Array(width-1).fill(0),1]],
  [Array(width).fill(candidate.radix-1),[...Array(width-1).fill(0),1]],
  [Array(width).fill(1),Array(width).fill(1)]
 ];
 const golden=vectors.map(([a,b])=>evaluateRadixAlu({
  base:candidate.radix,width,a,b,operation:'add'}));
 return {status:'REFERENCE_ONLY',goldenVectors:golden.length,
  testVectors:vectors.map(([a,b],i)=>({a,b,expected:golden[i].digits})),
  candidateRTLVerified:false,requiresRealCandidateRTL:true,
  physicalValidation:'none'};
}
// Execute the EXISTING canonical multi-radix discrete-event simulator
// against exhaustive input vectors for an ideal adder candidate. Passing
// means functional reference equivalence only; NOT transistor validity.
export function verifyIdealAdderWithLogicEngine({radix=4}={}){
 if(![2,3,4].includes(radix))
  throw Error('Reference adder solver supports declared radix 2/3/4 only');
 const prompt=(radix===4?'Q4 ':radix===3?'ternary ':'binary ')+
  'half-adder reference';
 const generated=generateIdealAdderReference(prompt);
 const baseline=Diagram.fromJSON(generated.diagram);
 const failures=[];
 for(let a=0;a<radix;a++)for(let b=0;b<radix;b++){
  const d=baseline.clone();
  d.block('inputA').params.value=a;
  d.block('inputB').params.value=b;
  const sim=runLogic(d,{maxEvents:10000,maxTicks:10000});
  const sum=sim.probes.sumProbe?.values?.at(-1);
  const carry=sim.probes.carryProbe?.values?.at(-1);
  if(!sim.ok||sum!==(a+b)%radix||carry!==Math.floor((a+b)/radix))
   failures.push({a,b,sum,carry,problems:sim.problems});
 }
 return {format:SEARCH_FORMAT,status:failures.length?'FUNCTIONAL_FAIL':'PASS',
  radix,examined:radix*radix,failures,
  source:'existing-canonical-discrete-event-logic-engine',
  verifiedPhysicalImplementation:false,verifiedTransistorSpice:false};
}
export async function exploreTopologies({
 candidates,verifyFunctional=null,verifySpice=null,maxSpiceCandidates=4,
 concurrency=3}={}){
 if(!Array.isArray(candidates)||!candidates.length||candidates.length>512||
    !Number.isInteger(maxSpiceCandidates)||maxSpiceCandidates<0||maxSpiceCandidates>64||
    !Number.isInteger(concurrency)||concurrency<1||concurrency>16)
  throw Error('Invalid bounded exploration request');
 for(const c of candidates)candidateSignature(c);
 // Callbacks are authoritative only when backed by an external authenticated
 // replay. This module does not upgrade user-supplied pass flags to silicon.
 const rows=Array(candidates.length);let index=0;
 async function worker(){
  while(index<candidates.length){
   const i=index++,candidate=candidates[i];
   let functional;
   try{
    functional=typeof verifyFunctional==='function'?
     await verifyFunctional(structuredClone(candidate),fastFunctionalPrune(candidate)):
     fastFunctionalPrune(candidate);
    if(!functional||!['PASS','FAIL','REFERENCE_ONLY'].includes(functional.status))
     throw Error('Malformed functional evaluator report');
   }catch(e){rows[i]={candidateId:candidate.id,status:'FUNCTIONAL_UNKNOWN',reason:String(e.message)};continue;}
   rows[i]={candidateId:candidate.id,status:functional.status==='FAIL'?'FUNCTIONAL_FAIL':
    functional.status==='PASS'?'FUNCTIONAL_PASS_UNAUTHENTICATED':'FUNCTIONAL_REFERENCE_ONLY',
    candidate,functional};
  }
 }
 await Promise.all(Array.from({length:Math.min(concurrency,candidates.length)},worker));
 const eligible=rows.filter(r=>r.status==='FUNCTIONAL_PASS_UNAUTHENTICATED')
  .sort((a,b)=>a.candidate.gateBudget-b.candidate.gateBudget||
    a.candidateId.localeCompare(b.candidateId)).slice(0,maxSpiceCandidates);
 for(const row of eligible){
  if(typeof verifySpice!=='function')continue;
  try{
   const report=await verifySpice(structuredClone(row.candidate));
   row.spice=report??{status:'INSUFFICIENT_MODEL_DATA'};
   row.status='SPICE_EVALUATED_UNVERIFIED';
  }catch(e){row.status='SPICE_FAILED_CLOSED';row.reason=String(e.message);}
 }
 return {format:SEARCH_FORMAT,results:rows,
  pruned:rows.filter(x=>x.status==='FUNCTIONAL_FAIL').length,
  spiceEvaluated:rows.filter(x=>x.spice).length,
  virtualQualified:false,physicalValidation:'none',
  simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
