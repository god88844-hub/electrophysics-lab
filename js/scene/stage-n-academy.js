// Phase 82: controlled learning progression. Simulation is not hardware signoff.
export const ACADEMY_FORMAT='invention-lab/phase82-guided-academy/1';
export const ACADEMY_MISSIONS=Object.freeze([
 Object.freeze({id:'cmos-inverter',title:'N-Type & P-Type Silicon to CMOS Inverter',lab:'chip',solver:'transistor-level-SPICE',
  requiredChecks:['device-mosfet-model','verified-inverter-transfer','temperature-corner-sweep']}),
 Object.freeze({id:'multi-radix-adder',title:'Binary vs. Ternary vs. Q4 Gates & Full Adder',lab:'chip',solver:'multi-radix-SPICE',
  requiredChecks:['all-radix-functional-checks','device-validity','noise-margin']}),
 Object.freeze({id:'riscv-alu',title:'8-Bit ALU to Working RISC-V CPU',lab:'cpu',solver:'architectural-RTL',
  requiredChecks:['alu-truth-table','riscv-instruction-trace','canonical-netlist']}),
 Object.freeze({id:'systolic-tpu',title:'Systolic Array AI Accelerator (TPU)',lab:'ai',solver:'systolic-rtl-onnx',
  requiredChecks:['systolic-array-reference','onnx-output-tolerance','deterministic-trace']}),
 Object.freeze({id:'quantum-bell',title:'Quantum Bell State & Error-Mitigated Circuit',lab:'quantum',
  solver:'qiskit-density-matrix',requiredChecks:['bell-density-reference','channel-noise-model','independent-quantum-reference']})
]);
export function missionStatus(missionId,{diagram,solverResult=null,hardwareEvidence=null}={}){
 const i=ACADEMY_MISSIONS.findIndex(x=>x.id===missionId);
 if(i<0)throw Error('Unknown guided lab mission');
 const mission=ACADEMY_MISSIONS[i];
 if(!diagram||!Array.isArray(diagram.blocks)||!Array.isArray(diagram.wires)||
   diagram.blocks.length===0||diagram.lab!==mission.lab)
  return {format:ACADEMY_FORMAT,missionId,status:'BUILD_INCOMPLETE',
   nextUnlocked:false,reason:'canonical-mission-design-missing'};
 const issues=typeof diagram.issues==='function'?diagram.issues():['unvalidated-diagram'];
 if(issues.length)return {format:ACADEMY_FORMAT,missionId,status:'INVALID_CANONICAL_DESIGN',
  nextUnlocked:false,reason:'canonical-topology-failed'};
 // A good simulator result is not a verifier unless the relevant physical or
 // architectural golden checks are sourced and replayable.
 const hasActualChecks=solverResult?.ok===true&&
   solverResult?.solverId===mission.solver&&
   mission.requiredChecks.every(k=>solverResult?.checks?.[k]?.verdict==='PASS'&&
     solverResult?.checks?.[k]?.replayVerified===true);
 const authenticated=hardwareEvidence?.independentlyAuthenticated===true;
 if(!hasActualChecks)
  return {format:ACADEMY_FORMAT,missionId,status:'AWAITING_REPLAYABLE_SOLVER_CHECKS',
   requiredChecks:mission.requiredChecks,nextUnlocked:false,
   physicalValidation:'none',reason:'reference-only-mission-not-proven'};
 // A caller-supplied flag cannot establish hardware authenticity. A replay
 // must be verified by a trusted source outside this client before progression.
 return {format:ACADEMY_FORMAT,missionId,status:'AWAITING_INDEPENDENT_EVIDENCE_REVIEW',
  requiredChecks:mission.requiredChecks,nextUnlocked:false,
  physicalValidation:'none',
  reason:authenticated?'browser-cannot-authenticate-third-party-attestation':
   'independent-source-validation-not-estabished'};
}
export function academyProgress(missionId,context){
 const result=missionStatus(missionId,context),index=ACADEMY_MISSIONS.findIndex(x=>x.id===missionId);
 return {...result,missionIndex:index,availableNextMission:result.nextUnlocked?
  ACADEMY_MISSIONS[index+1]?.id??null:null};
}
