// feasibility.js — engineering probability estimates under EXPLICIT assumptions.
// Monte Carlo pass rate is NOT a physical build success probability. There is no
// implicit conversion from passing simulation checks to real-world confidence.
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
function rng(seed){
  let state=seed>>>0;
  return ()=>{
    state=(state+0x6D2B79F5)|0;
    let t=Math.imul(state^(state>>>15),1|state);
    t^=t+Math.imul(t^(t>>>7),61|t);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function normals(random,n){
  const values=[];
  while(values.length<n){
    const u=Math.max(Number.MIN_VALUE,random()),v=random();
    const mag=Math.sqrt(-2*Math.log(u));
    values.push(mag*Math.cos(2*Math.PI*v));
    if(values.length<n)values.push(mag*Math.sin(2*Math.PI*v));
  }
  return values;
}
function covarianceFactor(covariance,n){
  if(!Array.isArray(covariance)||covariance.length!==n)throw Error('covariance must be an n×n matrix');
  const L=Array.from({length:n},()=>Array(n).fill(0));
  for(let i=0;i<n;i++){
    if(!Array.isArray(covariance[i])||covariance[i].length!==n)throw Error('covariance must be square');
    for(let j=0;j<n;j++){
      if(!Number.isFinite(covariance[i][j]))throw Error('covariance values must be finite');
      if(Math.abs(covariance[i][j]-covariance[j]?.[i])>1e-10*Math.max(1,Math.abs(covariance[i][j])))
        throw Error('covariance must be symmetric');
      let v=covariance[i][j];
      for(let k=0;k<j;k++)v-=L[i][k]*L[j][k];
      if(i===j){
        if(v<=0)throw Error('covariance must be positive-definite');
        L[i][j]=Math.sqrt(v);
      }else L[i][j]=v/L[j][j];
    }
  }
  return L;
}
function wilson(successes,n,z=1.95996398454005){
  const phat=successes/n,denom=1+z*z/n;
  const center=(phat+z*z/(2*n))/denom;
  const radius=z*Math.sqrt(phat*(1-phat)/n+z*z/(4*n*n))/denom;
  return {lower:Math.max(0,center-radius),upper:Math.min(1,center+radius)};
}
export function estimateScenarioPassRate({
  designId,intendedUse,parameters,covariance=null,independenceAsserted=false,
  model,constraints,assumptions,seed=7,samples=5000,
}){
  if(!designId||!intendedUse)throw Error('scenario requires a design ID and intended use');
  if(!Array.isArray(assumptions)||!assumptions.length||assumptions.some(a=>typeof a!=='string'||!a.trim()))
    throw Error('assumptions must explicitly document the model and input distributions');
  if(typeof model!=='function')throw Error('model must be a prediction function');
  if(!Array.isArray(parameters)||!parameters.length||parameters.some(p=>
    !p||!p.name||typeof p.mean!=='number'||!Number.isFinite(p.mean)||
    typeof p.sd!=='number'||!Number.isFinite(p.sd)||p.sd<0))
    throw Error('parameters require finite mean and nonnegative standard deviation');
  if(new Set(parameters.map(p=>p.name)).size!==parameters.length)throw Error('duplicate parameter names');
  if(!Array.isArray(constraints)||!constraints.length||constraints.some(c=>
    !c||!c.metric||((c.min===undefined&&c.max===undefined))||
    (c.min!==undefined&&!Number.isFinite(c.min))||(c.max!==undefined&&!Number.isFinite(c.max))||
    (c.min!==undefined&&c.max!==undefined&&c.min>c.max)))
    throw Error('constraints need valid min/max limits for each metric');
  if(!integer(samples,100,200000))throw Error('samples must be an integer from 100 to 200000');
  if(!Number.isSafeInteger(seed))throw Error('seed must be a safe integer');
  if(covariance===null && parameters.length>1 && independenceAsserted!==true)
    throw Error('uncorrelated inputs require an explicit independence assertion; otherwise supply covariance');
  const n=parameters.length;
  const matrix=covariance===null?parameters.map((p,i)=>parameters.map((q,j)=>i===j?p.sd*p.sd:0)):covariance;
  for(let i=0;i<n;i++){
    if(Math.abs(matrix[i][i]-parameters[i].sd**2)>1e-9*Math.max(1,parameters[i].sd**2))
      throw Error('covariance diagonal must equal the declared parameter variances');
  }
  // Zero-variance dimensions are deterministic. Cholesky only for random dims.
  const variable=parameters.map((p,i)=>p.sd>0?i:-1).filter(i=>i>=0);
  const factor=variable.length?covarianceFactor(variable.map(i=>variable.map(j=>matrix[i][j])),variable.length):[];
  const random=rng(seed);
  let passes=0,errors=0;
  for(let trial=0;trial<samples;trial++){
    const z=normals(random,variable.length);
    const point=Object.fromEntries(parameters.map(p=>[p.name,p.mean]));
    for(let k=0;k<variable.length;k++){
      const i=variable[k];
      let delta=0;
      for(let j=0;j<=k;j++)delta+=factor[k][j]*z[j];
      point[parameters[i].name]+=delta;
    }
    // The model may fail for some sampled conditions; do not drop trials.
    try {
      const values=model(Object.freeze(point));
      const ok=constraints.every(c=>{
        const v=values?.[c.metric];
        return typeof v==='number'&&Number.isFinite(v)&&
          (c.min===undefined||v>=c.min)&&(c.max===undefined||v<=c.max);
      });
      if(ok)passes++;
      if(!values||constraints.some(c=>!Number.isFinite(values[c.metric])))errors++;
    }catch{errors++;}
  }
  const rate=passes/samples,interval=wilson(passes,samples);
  // A failed model invocation is not a physically failed build and must not
  // be silently counted as a failure to manufacture.
  const complete=errors===0;
  return Object.freeze({
    status:complete?'model-only':'inconclusive',designId,intendedUse,seed,samples,passes,modelErrors:errors,
    modeledPassRatePercent:complete?100*rate:null,
    samplingInterval95Percent:complete?[100*interval.lower,100*interval.upper]:null,
    realWorldBuildSuccessPercent:null,
    physicalValidation:'none',
    assumptions:[...assumptions],
    note:'Scenario pass percentage is conditional on declared models, input distributions, and criteria. The interval reflects Monte Carlo sampling only, not model-form error or physical uncertainty. NOT equivalent to physical validation.',
  });
}
export function summarizeDesignEvidence({diagram,report=null}={}){
  if(!diagram)throw Error('design required');
  const checks=Array.isArray(report?.checks)?report.checks:[];
  const counts=Object.fromEntries(['pass','warn','fail','unknown','inconclusive'].map(k=>[k,checks.filter(c=>c.verdict===k).length]));
  return {
    designId:diagram.id,lab:diagram.lab,
    components:diagram.blocks?.length??0,wires:diagram.wires?.length??0,
    checks:counts,reportedVerdict:report?.verdict??'not-tested',
    simulationChecksPassed:counts.pass,
    realWorldBuildSuccessPercent:null,
    physicalValidation:'none',
    modelCalibration:'none',
    rationale:'Current design checks and external benchmark cases do not establish an evidence-based real-world build probability for this specific design.',
  };
}
