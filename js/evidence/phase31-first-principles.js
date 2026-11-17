// Phase31: first principles -> decomposed model -> conditional decisions.
// Do NOT reclassify numerical probabilities as measured manufacturing yield.
import {estimateScenarioPassRate} from './feasibility.js';

export const MOTOR_MODEL='invention-lab/phase31-dc-battery-wires-motor-fan/1';
export const DECISION_FORMAT='invention-lab/phase31-conditional-decision-evidence/1';
export const SUBSYSTEMS=Object.freeze([
 {id:'battery',law:'terminal voltage = open-circuit voltage - I * source resistance',
  missing:'capacity, temperature, transient sag, protection, aging and chemistry'},
 {id:'wires',law:'Vdrop = I * wire resistance; copper loss = I^2 R',
  missing:'contact defects, connector heating and tolerance correlations'},
 {id:'motor',law:'ideal energy-conserving SI constant Kt=Ke: back EMF=K*omega; torque=K*current',
  missing:'brush commutation or BLDC controller, saturation, torque ripple and efficiency map'},
 {id:'fan',law:'load torque = running friction + k * angular speed^2',
  missing:'aerodynamic blade map, speed-dependent flow, stall, obstructions and bearing wear'},
 {id:'integration',law:'motor torque equals load torque at steady state',
  missing:'startup transients, inertia, vibrations, harmonics, thermal equilibrium and packaging'},
 {id:'qualification',law:'acceptance thresholds + model discrepancy + externally verified physical measurements',
  missing:'measurements of this exact fan/driver assembly and independent population failure evidence'}
]);
const required=[
 'voltageV','sourceResistanceOhm','wireResistanceOhm','motorResistanceOhm',
 'motorConstantSI',
 'staticFrictionTorqueNm','runningFrictionTorqueNm','dragCoefficientNmPerRad2'
];
const positive=['voltageV','motorResistanceOhm','motorConstantSI'];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function valid(p){
 if(!p||typeof p!=='object')throw Error('A complete physical parameter vector is required');
 for(const key of required){
  if(!finite(p[key])||(positive.includes(key)?p[key]<=0:p[key]<0))
   throw Error('Nonphysical '+key+' (missing, negative, or out of domain)');
 }
}
function freezeCopy(x){return Object.freeze(JSON.parse(JSON.stringify(x)))}

/** Quasi-static, lumped brushed-DC motor + quadratic fan load.
 * No inertia/thermal dynamics: this is a steady-state and startup-torque screen.
 */
export function predictFan(p){
 valid(p);
 const R=p.sourceResistanceOhm+p.wireResistanceOhm+p.motorResistanceOhm;
 if(!(R>0))throw Error('Nonphysical series electrical resistance');
 const stallCurrentA=p.voltageV/R;
 const startingTorqueMarginNm=p.motorConstantSI*stallCurrentA-p.staticFrictionTorqueNm;
 const f=w=>p.motorConstantSI*(p.voltageV-p.motorConstantSI*w)/R-
   p.runningFrictionTorqueNm-p.dragCoefficientNmPerRad2*w*w;
 const started=startingTorqueMarginNm>0&&f(0)>0;
 let speedRadPerS=0;
 if(started){
  let lo=0,hi=p.voltageV/p.motorConstantSI;
  // Torque balance strictly decreasing in angular velocity for valid inputs.
  for(let k=0;k<68;k++){
   const mid=(lo+hi)/2;
   if(f(mid)>0)lo=mid;else hi=mid;
  }
  speedRadPerS=(lo+hi)/2;
 }
 const motorCurrentA=started?
   Math.max(0,(p.voltageV-p.motorConstantSI*speedRadPerS)/R):stallCurrentA;
 const motorVoltageV=p.voltageV-motorCurrentA*(p.sourceResistanceOhm+p.wireResistanceOhm);
 const motorCopperLossW=motorCurrentA*motorCurrentA*p.motorResistanceOhm;
 const wireCopperLossW=motorCurrentA*motorCurrentA*p.wireResistanceOhm;
 const sourceCopperLossW=motorCurrentA*motorCurrentA*p.sourceResistanceOhm;
 return freezeCopy({
  motorModel:MOTOR_MODEL,started:started?1:0,stallCurrentA,
  startingTorqueMarginNm,speedRadPerS,
  speedRpm:speedRadPerS*60/(2*Math.PI),
  motorCurrentA,motorVoltageV,motorCopperLossW,wireCopperLossW,
  sourceCopperLossW,
  totalCopperLossW:motorCopperLossW+wireCopperLossW+sourceCopperLossW,
  electricalSourcePowerW:p.voltageV*motorCurrentA,
  electromechanicalOutputW:started?p.motorConstantSI*motorCurrentA*speedRadPerS:0,
  steadyStateModelOnly:true,
  designValidatedByPhysicalTest:false
 });
}
function transformConstraints(constraints,discrepancyBounds,mode){
 const out=[];
 for(let i=0;i<constraints.length;i++){
  const c=constraints[i],d=discrepancyBounds[c.metric];
  if(!finite(d)||d<0)throw Error('Every decision metric needs a finite nonnegative discrepancy allowance: '+c.metric);
  if(c.min!==undefined)out.push({metric:'m'+i+'min',min:c.min});
  if(c.max!==undefined)out.push({metric:'m'+i+'max',max:c.max});
 }
 const wrapper=base=>{
  const result={};
  for(let i=0;i<constraints.length;i++){
   const c=constraints[i],y=base?.[c.metric],d=discrepancyBounds[c.metric];
   // min must survive adverse negative discrepancy, max adverse positive.
   if(c.min!==undefined)result['m'+i+'min']=y+(mode==='worst'?-d:d);
   if(c.max!==undefined)result['m'+i+'max']=y+(mode==='worst'?d:-d);
  }
  return result;
 };
 return {out,wrapper};
}
/** Enumerate model-only likelihood under explicit parametric distributions.
 *
 * Bounds on discrepancy, when supplied, are assumptions. The lower and upper
 * percentages hold ONLY if that claimed bound is valid for all runs; neither
 * constitutes a certified physical success percentage.
 */
export function evaluateFirstPrinciples({
 designId,intendedUse,parameters,covariance=null,independenceAsserted=false,
 model,constraints,assumptions,seed=31,samples=5000,
 discrepancyBounds=null,discrepancyBasis=null
}){
 if(!Array.isArray(constraints)||!constraints.length)
  throw Error('Predeclared acceptance criteria required');
 if(discrepancyBounds!==null&&(!discrepancyBasis||
   !['explicit-hypothesis','source-referenced-but-not-independently-audited'].includes(discrepancyBasis)))
  throw Error('Declare the basis for model-discrepancy allowances');
 if(discrepancyBounds===null&&discrepancyBasis!==null)
  throw Error('A declared discrepancy basis requires explicit numerical allowances');
 const common={designId,intendedUse,parameters,covariance,independenceAsserted,
  model,constraints,assumptions,seed,samples};
 const nominal=estimateScenarioPassRate(common);
 let worst=null,best=null;
 if(discrepancyBounds!==null){
  const a=transformConstraints(constraints,discrepancyBounds,'worst');
  const b=transformConstraints(constraints,discrepancyBounds,'best');
  const baseModel=model;
  worst=estimateScenarioPassRate({...common,model:p=>a.wrapper(baseModel(p)),constraints:a.out});
  best=estimateScenarioPassRate({...common,model:p=>b.wrapper(baseModel(p)),constraints:b.out});
  if(nominal.status==='model-only'&&worst.status==='model-only'&&best.status==='model-only'&&
     (worst.passes>nominal.passes||best.passes<nominal.passes))
   throw Error('Sample-aligned monotonic discrepancy bounds violated');
 }
 const reliable=nominal.status==='model-only'&&
   (worst===null||(worst.status==='model-only'&&best.status==='model-only'));
 const result={
  format:DECISION_FORMAT,status:reliable?'model-only':'inconclusive',
  designId,intendedUse,
  evaluatedScenarios:samples,seed,
  modelEvaluationErrors:nominal.modelErrors,
  parameterDistributions:structuredClone(parameters),
  independenceAsserted:covariance===null?Boolean(independenceAsserted):null,
  covariance:structuredClone(nominal.covariance),
  frozenConstraints:structuredClone(constraints),
  assumptions:[...assumptions],
  conditionalModeledSuccessPercent:reliable?nominal.modeledPassRatePercent:null,
  conditionalMonteCarloInterval95Percent:reliable?nominal.samplingInterval95Percent:null,
  discrepancyBoundBasis:discrepancyBasis,
  discrepancyAllowance:discrepancyBounds?structuredClone(discrepancyBounds):null,
  conditionalWorstCaseModeledSuccessPercent:reliable&&worst?worst.modeledPassRatePercent:null,
  conditionalBestCaseModeledSuccessPercent:reliable&&best?best.modeledPassRatePercent:null,
  disagreementFractionFromUncertainModelPercent:reliable&&worst&&best?
    best.modeledPassRatePercent-worst.modeledPassRatePercent:null,
  theseArePhysicalSuccessProbabilities:false,
  empiricalManufacturingYieldEstimate:null,
  externalValidationEnvelope:null,
  measuredDeviceSpecificErrorBound:null,
  unexplainedDefectAndModelFormProbability:null,
  realWorldBuildSuccessPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  note:'Modeled success is conditional on the explicitly assumed parameter distributions, physical equations and acceptance criteria. Monte Carlo confidence reflects finite numerical sampling only. Hypothesized model discrepancy bounds yield sensitivity percentages, not a measured real-world reliability or manufactured yield.'
 };
 return freezeCopy(result);
}
export function fanIllustrativeScenario({
 voltageV=3,voltageStdPercent=4,minRpm=1150,maxMotorCurrentA=0.8,
 rpmDiscrepancyAllowance=null,samples=5000,seed=31
}={}){
 if(!finite(voltageV)||voltageV<=0||!finite(voltageStdPercent)||
   voltageStdPercent<0||voltageStdPercent>50||
   !finite(minRpm)||minRpm<0||
   !finite(maxMotorCurrentA)||maxMotorCurrentA<=0)
  throw Error('Invalid fan scenario voltage, variation or startup acceptance constraints');
 if(rpmDiscrepancyAllowance!==null&&(!finite(rpmDiscrepancyAllowance)||
   rpmDiscrepancyAllowance<0))throw Error('Invalid assumed RPM error allowance');
 const parameters=[
  {name:'voltageV',mean:voltageV,sd:voltageV*voltageStdPercent/100},
  {name:'sourceResistanceOhm',mean:0.25,sd:0.025},
  {name:'wireResistanceOhm',mean:0.15,sd:0.015},
  {name:'motorResistanceOhm',mean:5,sd:0.25},
  {name:'motorConstantSI',mean:0.012,sd:0.0006},
  {name:'staticFrictionTorqueNm',mean:0.0006,sd:0.00005},
  {name:'runningFrictionTorqueNm',mean:0.0004,sd:0.00004},
  {name:'dragCoefficientNmPerRad2',mean:2e-7,sd:2e-8}
 ];
 const constraints=[
  {metric:'started',min:1},
  {metric:'speedRpm',min:minRpm},
  {metric:'motorCurrentA',max:maxMotorCurrentA}
 ];
 const result=evaluateFirstPrinciples({
  designId:'illustrative-dc-battery-fan-not-current-circuit',
  intendedUse:'Under the assumed DC motor and quadratic fan model, predict fan startup, speed and current tolerance',
  parameters,independenceAsserted:true,seed,samples,model:predictFan,
  constraints,
  assumptions:[
   'ILLUSTRATIVE numbers, NOT a particular real battery, wire, fan or motor datasheet.',
   'Independent Gaussian distributions assumed for every declared parameter; no factory statistical records were provided.',
   'Brushed ideal DC motor model; a real BLDC fan with commutation/control electronics requires a different driver model.',
   'Steady-state torque balance plus static-torque startup screen; no inertia or dynamic spin-up, thermal lifetime, PWM, battery depletion, aging, electrical connector failures or manufacturing defects.',
   'All models restricted to physically positive input samples; invalid draws cause an inconclusive result, never a fabricated 100% pass.'
  ],
  discrepancyBounds:rpmDiscrepancyAllowance===null?null:
   {started:0,speedRpm:rpmDiscrepancyAllowance,motorCurrentA:0},
  discrepancyBasis:rpmDiscrepancyAllowance===null?null:'explicit-hypothesis'
 });
 return freezeCopy({...result,
  exemplar:'user-requested-battery-two-wires-fan',
  fanSubtype:'ideal brushed-DC analog only, not BLDC',
  modelDecomposition:SUBSYSTEMS,
  illustrativeNominal:predictFan(Object.fromEntries(parameters.map(p=>[p.name,p.mean]))),
  hypotheticalRPMDiscrepancyNotMeasured:rpmDiscrepancyAllowance!==null
 });
}
