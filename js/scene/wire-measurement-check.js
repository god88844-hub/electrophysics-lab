// Explicit measured-observation comparison, NOT an automatically qualified calibration.
// The caller must provide genuine provenance and independent raw measurements.
import {evaluatePhysicalWire} from './physical-wire.js';
export const MEASUREMENT_FORMAT='invention-lab/wire-physical-measurement-check/1';
const bounded=(n,lo,hi,name)=>{
 if(typeof n!=='number'||!Number.isFinite(n)||n<lo||n>hi)
  throw Error(name+' must be finite and within ['+lo+', '+hi+']');
 return n;
};
export function compareWireMeasurements(rows,{source, instrument, uncertaintyOhm,holdoutIds=[]}={}){
 if(!Array.isArray(rows)||rows.length<2||rows.length>1000)
  throw Error('At least two and at most 1000 measurement records required');
 if(typeof source!=='string'||source.trim().length<12||source.length>1000)
  throw Error('Identify physical measurement source and collection provenance');
 if(typeof instrument!=='string'||instrument.trim().length<3||instrument.length>500)
  throw Error('Identify the measurement instrument');
 bounded(uncertaintyOhm,0,100,'Absolute measurement uncertainty');
 if(!Array.isArray(holdoutIds)||!holdoutIds.length||
    holdoutIds.length>=rows.length||new Set(holdoutIds).size!==holdoutIds.length)
  throw Error('Explicit non-empty independent holdout split required');
 const ids=new Set(),hold=new Set(holdoutIds);
 const results=rows.map(row=>{
  if(!row||typeof row!=='object'||typeof row.id!=='string'||!row.id.trim()||
    row.id.length>100||ids.has(row.id))throw Error('Unique row IDs required');
  ids.add(row.id);
  const observedOhm=bounded(row.observedOhm,0,1e5,'Observed resistance');
  const predictedOhm=evaluatePhysicalWire(row.spec).resistanceOhm;
  const residualOhm=observedOhm-predictedOhm;
  return {id:row.id,role:hold.has(row.id)?'holdout':'development',
   observedOhm,predictedOhm,residualOhm,absoluteErrorOhm:Math.abs(residualOhm)};
 });
 if([...hold].some(id=>!ids.has(id)))throw Error('Holdout includes nonexistent observation');
 const summarize=list=>({
  count:list.length,meanAbsoluteErrorOhm:list.reduce((a,r)=>a+r.absoluteErrorOhm,0)/list.length,
  rootMeanSquareErrorOhm:Math.sqrt(list.reduce((a,r)=>a+r.residualOhm**2,0)/list.length),
  withinDeclaredInstrumentUncertainty:list.filter(r=>r.absoluteErrorOhm<=uncertaintyOhm).length
 });
 const dev=results.filter(r=>r.role==='development'),test=results.filter(r=>r.role==='holdout');
 return {format:MEASUREMENT_FORMAT,source,instrument,declaredUncertaintyOhm:uncertaintyOhm,
  development:summarize(dev),holdout:summarize(test),rows:results,
  calibrationPerformed:false,modelParametersFitted:false,
  independentProvenanceAuthenticated:false,measurementRecordsVerified:false,
  physicalValidation:'unverified-user-supplied-data',
  accuracyClaim:'none: source and instrument records not independently authenticated',
  realWorldBuildSuccessPercent:null};
}
