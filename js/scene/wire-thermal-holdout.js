// Fit one explicit convection parameter to unverified measurements; holdouts stay excluded.
// This does NOT establish that any input is an authentic independent physical measurement.
import {simulateSegmentedWireThermal} from './wire-electrothermal.js';
export const WIRE_THERMAL_HOLDOUT_FORMAT='invention-lab/wire-thermal-holdout/1';
const bounded=(n,min,max,name)=>{
 if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)
  throw Error(name+' must be finite from '+min+' to '+max);
 return n;
};
const identifier=(x,name)=>{
 if(typeof x!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(x))
  throw Error('Invalid '+name);
 return x;
};
const metadata=(x,name)=>{
 if(typeof x!=='string'||x.trim().length<8||x.length>500||/[\x00-\x08\x0B-\x1F]/.test(x))
  throw Error('Specify '+name+' with preserved independent source records');
 return x;
};
const mse=(rows,coefficient)=>{
 let sum=0;
 for(const row of rows){
  const trial=simulateSegmentedWireThermal(row.wireSpec,
   {...row.environment,heatTransferWm2K:coefficient});
  sum+=((trial.meanTemperatureC-row.observedMeanTemperatureC)/row.uncertaintyC)**2;
 }
 return sum/rows.length;
};
export function fitWireThermalConvectionHoldout(observations,options){
 if(!Array.isArray(observations)||observations.length<4||observations.length>32)
  throw Error('Require 4–32 bounded observations');
 if(!options||typeof options!=='object'||Array.isArray(options))
  throw Error('Explicit calibration provenance required');
 const source=metadata(options.source,'physical observation provenance');
 const instrument=metadata(options.instrument,'measurement instrument');
 const operator=metadata(options.operator,'measurement operator');
 if(!Array.isArray(options.holdoutIds)||options.holdoutIds.length<2||
    options.holdoutIds.length>observations.length-2)
  throw Error('At least two development and two withheld observations required');
 const holdoutIds=options.holdoutIds.map(x=>identifier(x,'holdout ID'));
 if(new Set(holdoutIds).size!==holdoutIds.length)throw Error('Duplicate holdout ID');
 const holdoutSet=new Set(holdoutIds),seen=new Set();
 const rows=observations.map(row=>{
  if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Malformed observation');
  const id=identifier(row.id,'observation ID');
  if(seen.has(id))throw Error('Duplicate observation ID');seen.add(id);
  const observedMeanTemperatureC=bounded(row.observedMeanTemperatureC,-40,150,'Measured temperature');
  const uncertaintyC=bounded(row.uncertaintyC,.001,30,'Thermometer uncertainty');
  if(!row.wireSpec||!row.environment||typeof row.environment!=='object'||
     Array.isArray(row.environment))throw Error('Wire and experiment conditions required');
  if(Object.hasOwn(row.environment,'heatTransferWm2K'))
   throw Error('Fitted convection coefficient cannot be pre-filled by observations');
  simulateSegmentedWireThermal(row.wireSpec,{...row.environment,heatTransferWm2K:10});
  return {id,observedMeanTemperatureC,uncertaintyC,
   wireSpec:row.wireSpec,environment:row.environment,
   role:holdoutSet.has(id)?'holdout':'development'};
 });
 if(holdoutIds.some(id=>!seen.has(id)))throw Error('Holdout ID absent from observations');
 const dev=rows.filter(r=>r.role==='development'),hold=rows.filter(r=>r.role==='holdout');
 const lower=bounded(options.minimumHeatTransferWm2K??.5,.01,999,'Convection lower bound');
 const upper=bounded(options.maximumHeatTransferWm2K??250,lower+.01,1000,'Convection upper bound');
 let observable=false;
 for(const row of dev){
  const a=simulateSegmentedWireThermal(row.wireSpec,
   {...row.environment,heatTransferWm2K:lower});
  const b=simulateSegmentedWireThermal(row.wireSpec,
   {...row.environment,heatTransferWm2K:upper});
  if(Math.abs(a.meanTemperatureC-b.meanTemperatureC)>=Math.max(.01,row.uncertaintyC*2))
   observable=true;
 }
 if(!observable)throw Error('Convection coefficient unidentifiable at stated uncertainty');
 // Log grid and bounded golden-section refinement. The holdout is not read by mse().
 const samples=29,ratio=upper/lower;
 const trials=Array.from({length:samples},(_,i)=>{
  const h=lower*ratio**(i/(samples-1));return {h,cost:mse(dev,h)};
 });
 let best=0;for(let i=1;i<trials.length;i++)
  if(trials[i].cost<trials[best].cost)best=i;
 let lo=trials[Math.max(0,best-1)].h,hi=trials[Math.min(samples-1,best+1)].h;
 const phi=(Math.sqrt(5)-1)/2;
 let c=hi-phi*(hi-lo),d=lo+phi*(hi-lo),fc=mse(dev,c),fd=mse(dev,d);
 for(let k=0;k<35;k++){
  if(fc<fd){hi=d;d=c;fd=fc;c=hi-phi*(hi-lo);fc=mse(dev,c);}
  else{lo=c;c=d;fc=fd;d=lo+phi*(hi-lo);fd=mse(dev,d);}
 }
 const coefficient=(lo+hi)/2;
 const validate=group=>{
  const details=group.map(row=>{
   const prediction=simulateSegmentedWireThermal(row.wireSpec,
    {...row.environment,heatTransferWm2K:coefficient}).meanTemperatureC;
   const residual=prediction-row.observedMeanTemperatureC;
   return {id:row.id,observedMeanTemperatureC:row.observedMeanTemperatureC,
    predictedMeanTemperatureC:prediction,residualC:residual,
    withinDeclaredUncertainty:Math.abs(residual)<=row.uncertaintyC};
  });
  return {count:details.length,
   rmseC:Math.sqrt(details.reduce((s,r)=>s+r.residualC**2,0)/details.length),
   meanAbsoluteErrorC:details.reduce((s,r)=>s+Math.abs(r.residualC),0)/details.length,
   withinDeclaredUncertainty:details.filter(r=>r.withinDeclaredUncertainty).length,
   details};
 };
 return {format:WIRE_THERMAL_HOLDOUT_FORMAT,
  candidateParameters:{heatTransferWm2K:coefficient},
  model:'segmented-1d-constant-convection-candidate',source,instrument,operator,
  development:validate(dev),holdout:validate(hold),
  optimizationUsedHoldout:false,
  calibratedFrom:'unverified-user-supplied development observations',
  fittedParameterCount:1,manufacturerQualified:false,
  independentInstrumentProvenanceAuthenticated:false,
  holdoutIndependenceAuthenticated:false,
  physicalValidation:'unverified-user-supplied-data',realWorldAccuracyClaim:'none',
  realWorldBuildSuccessPercent:null};
}
