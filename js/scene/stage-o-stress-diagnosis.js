// Stage O / Phase 86: adversarial scenarios and diagnosable modeled faults.
// Fail-closed when neither measured solver traces nor coordinates are supplied.
export const STRESS_FORMAT='invention-lab/phase86-stress-diagnosis/1';
export const STRESS_KINDS=Object.freeze([
 'supply-droop','thermal-hotspot','clock-skew','crosstalk-burst','quantum-gate-noise'
]);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function stressScenario({
 kind,sourceId='manual',amplitude,corner='tt',temperatureC=25,
 targetNode=null
}={}){
 if(!STRESS_KINDS.includes(kind)||typeof sourceId!=='string'||sourceId.length>100||
    !finite(amplitude)||amplitude<0||amplitude>1e6||
    !['tt','ss','ff','sf','fs'].includes(corner)||!finite(temperatureC)||
    temperatureC< -273.15||temperatureC>250||
    targetNode!==null&&(typeof targetNode!=='string'||targetNode.length>120))
  throw Error('Invalid adversarial stress scenario');
 const unit={ 'supply-droop':'V','thermal-hotspot':'°C','clock-skew':'s',
  'crosstalk-burst':'V','quantum-gate-noise':'probability'}[kind];
 if(kind==='quantum-gate-noise'&&amplitude>1)throw Error('Quantum error probability > 1');
 return {format:STRESS_FORMAT,kind,sourceId,amplitude,unit,corner,temperatureC,
  targetNode,status:'PLANNED_NOT_APPLIED',physicalValidation:'none'};
}
export function makeStressSuite({seed=84,includeQuantum=true}={}){
 if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid stress seed');
 const scenarios=[
  ['supply-droop',.33],['thermal-hotspot',70],
  ['clock-skew',2e-9],['crosstalk-burst',.22],
  ...(includeQuantum?[['quantum-gate-noise',.05]]:[])
 ];
 return {format:STRESS_FORMAT,seed,
  scenarios:scenarios.map(([kind,amplitude],i)=>stressScenario({
   kind,amplitude,sourceId:'scenario-'+i,
   corner:i%2?'ss':'tt',temperatureC:i%2?95:25
  })),physicalValidation:'none'};
}
export function diagnoseStressSample({
 scenario,sample,nodeLimits={},sceneLocations={}
}={}){
 if(scenario?.format!==STRESS_FORMAT||!STRESS_KINDS.includes(scenario.kind))
  throw Error('Validated stress scenario required');
 const node=sample?.node;
 if(typeof node!=='string'||node.length>120||!finite(sample.expected)||
    !finite(sample.observed)||typeof sample.unit!=='string'||
    sample.unit.length>20||typeof sample.status!=='string')
  return {format:STRESS_FORMAT,status:'INSUFFICIENT_SOLVER_DATA',
   reason:'missing-replayable-solver-observations',rootCause:'UNKNOWN',
   physicalValidation:'none'};
 const limit=nodeLimits[node];
 if(!limit||!finite(limit.minimum)||!finite(limit.maximum)||
    limit.maximum<=limit.minimum||limit.unit!==sample.unit)
  return {format:STRESS_FORMAT,status:'INSUFFICIENT_SOLVER_DATA',
   reason:'missing-calibrated-acceptance-window',rootCause:'UNKNOWN',
   physicalValidation:'none'};
 const breach=sample.observed<limit.minimum?
  limit.minimum-sample.observed:sample.observed>limit.maximum?
  sample.observed-limit.maximum:0;
 const location=sceneLocations[node];
 const coordinates=location&&[location.xMm,location.yMm,location.zMm].every(finite)?
  {xMm:location.xMm,yMm:location.yMm,zMm:location.zMm}:null;
 const severity=breach>0?'MODELED_LIMIT_VIOLATION':'MODEL_WINDOW_PASS';
 const msg=breach?
  'Node '+node+' predicted '+sample.observed.toFixed(4)+' '+sample.unit+
  ' versus '+sample.expected.toFixed(4)+' '+sample.unit+' at '+scenario.temperatureC+
  ' °C / '+scenario.corner+' corner; model limit violated by '+breach.toFixed(4)+
  ' '+sample.unit+'.':
  'Node '+node+' remains within declared model limits under '+scenario.kind+'.';
 return {format:STRESS_FORMAT,status:severity,scenario:scenario.kind,
  node,expected:sample.expected,observed:sample.observed,
  magnitude:breach,unit:sample.unit,coordinates,
  diagnostic:msg,rootCause:'HYPOTHESIS_'+scenario.kind.toUpperCase().replace(/-/g,'_'),
  observedPhysicalFailure:false,physicalValidation:'none'};
}
export async function runAdversarialStressSuite({
 scenarios,runCanonicalSolver,limits={},locations={}
}={}){
 if(!Array.isArray(scenarios)||scenarios.length<1||scenarios.length>100)
  throw Error('Bounded adversarial scenario list required');
 if(typeof runCanonicalSolver!=='function')
  return {format:STRESS_FORMAT,status:'INSUFFICIENT_SOLVER_DATA',
   findings:[],physicalValidation:'none'};
 const findings=[];
 for(const scenario of scenarios){
  if(scenario?.format!==STRESS_FORMAT)throw Error('Malformed stress scenario');
  let sample;
  try{sample=await runCanonicalSolver(structuredClone(scenario));}
  catch(e){findings.push({status:'INSUFFICIENT_SOLVER_DATA',
   reason:String(e.message),scenario:scenario.kind});continue;}
  findings.push(diagnoseStressSample({scenario,sample,
   nodeLimits:limits,sceneLocations:locations}));
 }
 return {format:STRESS_FORMAT,status:findings.some(x=>x.status==='INSUFFICIENT_SOLVER_DATA')?
  'INSUFFICIENT_SOLVER_DATA':findings.some(x=>x.status==='MODELED_LIMIT_VIOLATION')?
  'MODEL_STRESS_FAIL':'MODEL_STRESS_REPLAY_COMPLETE',
  findings,physicallyQualified:false,physicalValidation:'none'};
}
