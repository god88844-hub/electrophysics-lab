// Stage O / Phase 87: constrained evolutionary search. Selection is based
// only on explicitly labeled objective metrics; uncalibrated yield stays UNKNOWN.
import {generateTopologyCandidates,candidateSignature} from './stage-o-topology-search.js';
export const OPTIMIZER_FORMAT='invention-lab/phase87-evolutionary-search/1';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const allowedMetric=x=>x===null||(finite(x)&&x>=0);
export function evaluateOptimizerConstraints(candidate,metrics,{
 minFrequencyHz=0,maxPowerW=Infinity,maxTemperatureC=Infinity,
 maxAreaUm2=Infinity,minNoiseMarginV=0,requireDrc=true
}={}){
 candidateSignature(candidate);
 if(!metrics||typeof metrics!=='object'||Array.isArray(metrics))
  return {status:'INSUFFICIENT_MODEL_DATA',reasons:['missing-metrics'],score:null};
 const required=['frequencyHz','powerW','temperatureC','areaUm2','noiseMarginV'];
 const missing=required.filter(k=>!finite(metrics[k]));
 if(missing.length)return {status:'INSUFFICIENT_MODEL_DATA',reasons:missing.map(k=>'missing-'+k),score:null};
 if(![minFrequencyHz,maxPowerW,maxTemperatureC,maxAreaUm2,minNoiseMarginV]
   .every(x=>typeof x==='number'&&!Number.isNaN(x)&&x>=0))
  throw Error('Invalid optimization constraints');
 const reasons=[];
 if(metrics.frequencyHz<minFrequencyHz)reasons.push('frequency-below-limit');
 if(metrics.powerW>maxPowerW)reasons.push('power-exceeds-limit');
 if(metrics.temperatureC>maxTemperatureC)reasons.push('thermal-exceeds-limit');
 if(metrics.areaUm2>maxAreaUm2)reasons.push('area-exceeds-limit');
 if(metrics.noiseMarginV<minNoiseMarginV)reasons.push('noise-margin-below-limit');
 if(requireDrc&&metrics.drcPassed!==true)reasons.push('drc-not-confirmed');
 // A missing calibrated yield must remain UNKNOWN even for otherwise feasible
 // candidates. Never optimize a fabricated percentage.
 const calibratedYield=metrics.calibratedFoundryYieldVerified===true&&
   finite(metrics.simulatedBuildSuccessPercent)&&
   metrics.simulatedBuildSuccessPercent>=0&&metrics.simulatedBuildSuccessPercent<=100;
 const score=reasons.length?null:
  -metrics.powerW-1e-6*metrics.areaUm2+1e-10*metrics.frequencyHz+
  100*metrics.noiseMarginV;
 return {status:reasons.length?'MODEL_CONSTRAINT_FAIL':
  calibratedYield?'MODEL_FEASIBLE_CALIBRATION_REVIEW_REQUIRED':'MODEL_FEASIBLE_UNCALIBRATED',
  reasons,score,calibratedYieldAuthenticated:false,
  simulatedPhysicalBuildSuccessPercent:'UNKNOWN',
  diagnosticYieldPercent:calibratedYield?metrics.simulatedBuildSuccessPercent:null};
}
export async function optimizeCandidatePopulation({
 seed=87,generations=4,populationSize=12,radix=4,width=4,
 evaluateCandidate=null,constraints={},onGeneration=null
}={}){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||
    !Number.isInteger(generations)||generations<1||generations>50||
    !Number.isInteger(populationSize)||populationSize<2||populationSize>256)
  throw Error('Invalid deterministic evolutionary search request');
 if(generations*populationSize>10000)
  throw Error('Evolutionary compute budget exceeded');
 const events=[],evaluated=[];
 let elite=null;
 for(let gen=0;gen<generations;gen++){
  // Feedback-driven evolution: improve around the previous feasible elite,
  // with a reproducible generation-specific seed and finite population.
  const generation=generateTopologyCandidates({seed:(seed+gen*9973)>>>0,
   count:populationSize,radix,width,
   baseline:elite??{gateBudget:30,pipelineDepth:1,driveScale:1,
    wireSpacingMm:.2,threshold:'standard'}});
  const batch=generation.candidates.map(c=>({...c,id:'g'+gen+'-'+c.id}));
  for(const candidate of batch){
   let metrics=null;
   if(typeof evaluateCandidate==='function'){
    try{metrics=await evaluateCandidate(structuredClone(candidate));}catch(e){
     events.push({generation:gen,candidateId:candidate.id,event:'EVALUATOR_FAILED_CLOSED',
      reason:String(e.message)});continue;
    }
   }
   const judgement=evaluateOptimizerConstraints(candidate,metrics,constraints);
   evaluated.push({candidate,metrics,judgement});
   events.push({generation:gen,candidateId:candidate.id,
    event:judgement.status,reasons:judgement.reasons});
  }
  const viable=evaluated.filter(x=>x.judgement.score!==null)
   .sort((a,b)=>b.judgement.score-a.judgement.score||
    a.candidate.id.localeCompare(b.candidate.id));
  if(viable.length)elite=viable[0].candidate;
  if(onGeneration)await onGeneration({generation:gen,
   evaluated:evaluated.length,physicalQualification:'UNKNOWN / NO-GO'});
 }
 const feasible=evaluated.filter(x=>x.judgement.score!==null)
  .sort((a,b)=>b.judgement.score-a.judgement.score||
    a.candidate.id.localeCompare(b.candidate.id));
 return {format:OPTIMIZER_FORMAT,seed,generations,populationSize,
  evaluated:evaluated.length,events,
  best:feasible[0]?{candidate:feasible[0].candidate,
   metrics:feasible[0].metrics,judgement:feasible[0].judgement}:null,
  qualifiedYieldTargetReached:false,
  simulatedPhysicalBuildSuccessPercent:'UNKNOWN',
  physicalValidation:'none',productionReleaseAuthorized:false};
}
export function syntheticOptimizationFixture(candidate,{stress=1}={}){
 // Purely synthetic regression fixture (deliberately not a foundry distribution).
 candidateSignature(candidate);
 if(!finite(stress)||stress<0)throw Error('Invalid synthetic stress');
 const n=candidate.driveScale;
 const gap=candidate.wireSpacingMm;
 return {frequencyHz:1e8*(.5+.15*n),
  powerW:.02+.008*n*n,temperatureC:27+6*n*n*stress,
  areaUm2:candidate.gateBudget*(8+3*n),
  noiseMarginV:.05+.15*Math.min(1,n/2)+.08*Math.min(1,gap),
  drcPassed:gap>=.1,
  simulatedBuildSuccessPercent:null,
  calibratedFoundryYieldVerified:false,fixture:'SYNTHETIC_ONLY'};
}
