// Stage P / Phase 92: deterministic classical <-> quantum feedback model.
// QPU is the repository's ideal QuditCircuit; readout is a sampled parity
// *simulation*, not measured nondemolition syndrome hardware or Qiskit service.
import {QuditCircuit} from '../labs/quantum/qudit.js';
import {H,X,CNOT,RY} from '../labs/quantum/gates.js';
import {seededUniformGenerator} from '../evidence/phase75-monte-carlo.js';
import {createCustomISA,assembleCustom,runCustomCPU} from './stage-p-custom-isa.js';
export const HYBRID_FORMAT='invention-lab/phase92-hybrid-classical-quantum/1';
const valid=n=>typeof n==='number'&&Number.isFinite(n);
export function createHybridArchitecture({
 isa=createCustomISA(),readoutLatencyCycles=40,
 commandLatencyCycles=6,feedbackDeadlineCycles=100,
 qpuKind='ideal-statevector',qubits=2,qubitPitchMm=5
}={}){
 if(isa?.format!=='invention-lab/phase89-custom-radix-isa/1'||
    !Number.isInteger(readoutLatencyCycles)||readoutLatencyCycles<1||
    readoutLatencyCycles>1e7||
    !Number.isInteger(commandLatencyCycles)||commandLatencyCycles<1||
    commandLatencyCycles>1e7||
    !Number.isInteger(feedbackDeadlineCycles)||feedbackDeadlineCycles<1||
    feedbackDeadlineCycles>1e7||
    !Number.isInteger(qubits)||qubits<2||qubits>8||
    !valid(qubitPitchMm)||qubitPitchMm<.1||qubitPitchMm>100||
    qpuKind!=='ideal-statevector')
  throw Error('Invalid hybrid device architecture');
 const blocks=[
  {id:'classical-controller',kind:'custom-radix-cpu',xMm:0,yMm:0,zMm:0},
  {id:'readout-interface',kind:'quantum-readout',xMm:8,yMm:0,zMm:0},
  ...Array.from({length:qubits},(_,i)=>({
   id:'qubit-'+i,kind:'ideal-qubit',xMm:16+i*qubitPitchMm,yMm:0,zMm:0
  }))
 ];
 return {format:HYBRID_FORMAT,isa,readoutLatencyCycles,commandLatencyCycles,
  feedbackDeadlineCycles,qpuKind,qubits,qubitPitchMm,blocks,
  connections:[
   {from:'qubit-0',to:'readout-interface',kind:'syndrome-readout'},
   {from:'qubit-1',to:'readout-interface',kind:'syndrome-readout'},
   {from:'readout-interface',to:'classical-controller',kind:'measured-classical-bit'},
   {from:'classical-controller',to:'qubit-1',kind:'conditional-x-command'}
  ],
  physicalCoherenceValidated:false,hardwareFeedbackCalibrated:false,
  physicalValidation:'none',simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
function parityProbabilities(circuit){
 const p=circuit.probs(),n=circuit.n;
 const odds=p.reduce((sum,prob,index)=>{
  // Computational basis parity on q0 and q1, all other qubits zero.
  const q0=Math.floor(index/Math.pow(2,n-1))%2;
  const q1=Math.floor(index/Math.pow(2,n-2))%2;
  return sum+(q0^q1?prob:0);
 },0);
 return {even:Math.max(0,1-odds),odd:Math.max(0,odds)};
}
export function runHybridBellFeedback(architecture,{
 seed=92,injectBitFlip=false,controlSource=null,
 initialSyndromeMeasurementCycles=0
}={}){
 if(architecture?.format!==HYBRID_FORMAT||architecture.qubits<2)
  throw Error('Hybrid architecture required');
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||
    typeof injectBitFlip!=='boolean'||
    !Number.isInteger(initialSyndromeMeasurementCycles)||
    initialSyndromeMeasurementCycles<0)
  throw Error('Invalid hybrid feedback experiment');
 const q=new QuditCircuit(architecture.qubits,2);
 q.apply1(0,H);q.apply2(0,1,CNOT());
 if(injectBitFlip)q.apply1(1,X);
 const before=parityProbabilities(q);
 const rng=seededUniformGenerator(seed);
 const syndrome=rng()<before.odd?1:0;
 // This parity sampling does not collapse the state in the ideal reference.
 // Real non-demolition stabilizer measurement is NOT modeled.
 const cpuProgram=assembleCustom(architecture.isa,controlSource??
  'LD '+architecture.isa.registers[0].id+', [0]\n'+
  'OUT '+architecture.isa.registers[0].id+'\nHALT');
 const cpu=runCustomCPU(architecture.isa,cpuProgram,{initialMemory:[syndrome]});
 if(!cpu.halted||cpu.outputs.length!==1||!['0','1'].includes(cpu.outputs[0]))
  return {format:HYBRID_FORMAT,status:'CLASSICAL_CONTROLLER_REJECTED',
   cpu,syndrome,physicalValidation:'none'};
 const action=Number(cpu.outputs[0]);
 const totalCycles=initialSyndromeMeasurementCycles+
  architecture.readoutLatencyCycles+cpu.cycles+architecture.commandLatencyCycles;
 const missedDeadline=totalCycles>architecture.feedbackDeadlineCycles;
 // Simulation may demonstrate a late correction for root-cause testing,
 // but must report it as an architectural timing failure.
 if(action===1)q.apply1(1,X);
 const after=parityProbabilities(q);
 const timeline=[
  {cycle:initialSyndromeMeasurementCycles,event:'qpu-parity-sampled-model',syndrome},
  {cycle:initialSyndromeMeasurementCycles+architecture.readoutLatencyCycles,
   event:'readout-delivered',syndrome},
  {cycle:totalCycles-architecture.commandLatencyCycles,
   event:'classical-decoder-completed',action},
  {cycle:totalCycles,event:'conditional-gate-completed',action}
 ];
 return {format:HYBRID_FORMAT,
  status:missedDeadline?'FEEDBACK_DEADLINE_MISSED':'IDEAL_REFERENCE_FEEDBACK_COMPLETE',
  seed,syndrome,action,source:'modeled-parity-not-hardware-syndrome',
  before,after,corrected:after.even>1-1e-10,
  latencyCycles:{readout:architecture.readoutLatencyCycles,
   cpu:cpu.cycles,command:architecture.commandLatencyCycles,total:totalCycles},
  timeline,cpu,feedbackDeadlineCycles:architecture.feedbackDeadlineCycles,
  hardwareFidelityVerified:false,decoherenceModeled:false,
  physicalValidation:'none',simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
export function runVariationalHybridReference(architecture,{
 angles=[0,Math.PI/4,Math.PI/2,Math.PI],goal='min-energy'
}={}){
 if(architecture?.format!==HYBRID_FORMAT)throw Error('Hybrid architecture required');
 if(!Array.isArray(angles)||angles.length<2||angles.length>128||
    angles.some(x=>!valid(x)||Math.abs(x)>2*Math.PI)||
    !['min-energy','max-energy'].includes(goal))
  throw Error('Invalid bounded variational schedule');
 const trials=angles.map((theta,index)=>{
  const q=new QuditCircuit(1,2);q.apply1(0,RY(theta));
  const p=q.probs(),zExpectation=p[0]-p[1];
  return {index,theta,zExpectation,probabilities:[...p]};
 });
 const sorted=[...trials].sort((a,b)=>
  (goal==='min-energy'?a.zExpectation-b.zExpectation:
    b.zExpectation-a.zExpectation)||a.index-b.index);
 return {format:HYBRID_FORMAT,status:'IDEAL_VARIATIONAL_REFERENCE',
  objective:goal,best:sorted[0],trials,
  classicalOptimization:'bounded-grid-search',
  qpuExecution:'local-ideal-statevector-no-noise',
  physicalValidation:'none',realHardwareEnergy:null};
}
