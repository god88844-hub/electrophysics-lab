// Phase 80: draw/read ONLY captured outputs; visual colors are not physical evidence.
import {isExperimentCurrent,experimentReadingsAt} from './experiment-trace.js';
export const LIVE_OVERLAY_FORMAT='invention-lab/phase80-live-overlay/1';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const PALETTES={
 binary:[[.20,.47,.74],[.30,.94,.43]],
 ternary:[[.81,.28,.26],[.40,.43,.51],[.24,.87,.56]],
 quaternary:[[.20,.37,.80],[.22,.80,.94],[.95,.68,.21],[.97,.28,.24]]
};
export function signalVisual({base,level,uncertain=false}={}){
 if(uncertain)return {rgb:[.42,.45,.49],intensity:0,label:'UNKNOWN',physicalValidation:'none'};
 if(!Number.isInteger(base)||base<2||base>16||!Number.isInteger(level)||level<0||level>=base)
  throw Error('Invalid multi-radix signal level');
 const rgb=base===2?PALETTES.binary[level]:
  base===3?PALETTES.ternary[level]:
  base===4?PALETTES.quaternary[level]:[.2+.65*level/(base-1),.78-.44*level/(base-1),.62];
 return {rgb,intensity:.25+.75*level/Math.max(1,base-1),
  label:base===3?['−','0','+'][level]:String(level),
  physicalValidation:'none'};
}
export function thermalVisual({temperatureC,limitC,ambientC=25}={}){
 if(![temperatureC,limitC,ambientC].every(finite)||limitC<=ambientC)
  return {status:'UNKNOWN',rgb:[.4,.4,.4],fault:false};
 const fraction=Math.max(0,Math.min(1,(temperatureC-ambientC)/(limitC-ambientC)));
 return {status:temperatureC>limitC?'SIMULATED_LIMIT_EXCEEDED':'MODELED_ONLY',
  rgb:[fraction,.12+.52*(1-fraction),1-fraction],fraction,
  fault:temperatureC>limitC,physicalValidation:'none'};
}
export function currentDensityVisual({currentA,areaMm2,maxExpectedAmm2}={}){
 if(![currentA,areaMm2,maxExpectedAmm2].every(finite)||areaMm2<=0||maxExpectedAmm2<=0)
  return {status:'UNKNOWN',glow:0};
 const density=Math.abs(currentA)/areaMm2;
 return {status:density>maxExpectedAmm2?'MODEL_LIMIT_EXCEEDED':'MODELED_ONLY',
  densityAmm2:density,glow:Math.min(1,density/maxExpectedAmm2),
  physicalValidation:'none'};
}
export function overlayFromExperiment(diagram,trace,index,{base=2,selectedBlockId=null}={}){
 if(!trace||!isExperimentCurrent(trace,diagram)||trace.status!=='ready')
  return {format:LIVE_OVERLAY_FORMAT,status:'NO_CURRENT_SOLVER_SAMPLES',
   markers:[],physicalValidation:'none'};
 if(!Number.isInteger(index)||index<0||index>=trace.axis.length)throw Error('Invalid experiment frame');
 const samples=experimentReadingsAt(trace,index,{selectedBlockId,limit:6});
 const markers=samples.map(x=>{
  const value=typeof x.value==='number'?x.value:null;
  // Numerical values from instruments have arbitrary units; never quantize
  // temperature or amperes into logic voltage without declared rails.
  return {label:x.label,unit:x.unit,value,
   rgb:[.25,.85,.65],fault:false,signalLevel:null};
 });
 return {format:LIVE_OVERLAY_FORMAT,status:'SIMULATED_SNAPSHOT',
  time:trace.axis[index],unit:trace.axisUnit,base,markers,
  solverSource:'existing-canonical-experiment-trace',physicalValidation:'none'};
}

// Map only actual voltage-unit solver readings to user-declared ideal rails.
// Unknown/missing readings must never cycle through fabricated logic states.
export function inferSignalFromVoltageReadings(markers,{base,minRailV,maxRailV,guardBandV=.03}={}){
 if(!Number.isInteger(base)||base<2||base>16||
   ![minRailV,maxRailV,guardBandV].every(finite)||maxRailV<=minRailV||guardBandV<0)
  throw Error('Explicit signal voltage rails required');
 if(!Array.isArray(markers))return {status:'UNKNOWN',reason:'solver-markers-missing'};
 const reading=markers.find(x=>x&&x.unit==='V'&&finite(x.value));
 if(!reading)return {status:'UNKNOWN',reason:'no-voltage-unit-solver-reading'};
 const step=(maxRailV-minRailV)/(base-1);
 const boundaries=Array.from({length:base-1},(_,i)=>minRailV+(i+.5)*step);
 if(reading.value<minRailV||reading.value>maxRailV||
    boundaries.some(b=>Math.abs(b-reading.value)<=guardBandV))
  return {status:'UNKNOWN',reason:'out-of-range-or-noise-boundary'};
 const level=boundaries.filter(b=>reading.value>b).length;
 return {status:'RESOLVED_MODEL_ONLY',base,level,
  sourceLabel:reading.label,sourceVoltageV:reading.value,
  visual:signalVisual({base,level}),physicalValidation:'none'};
}

export function propagationPhase(timeSeconds,frequencyHz,wireLengthMm,positionMm){
 for(const x of [timeSeconds,frequencyHz,wireLengthMm,positionMm])
  if(!finite(x))throw Error('Invalid animation parameter');
 if(frequencyHz<0||frequencyHz>1e9||wireLengthMm<=0||positionMm<0||positionMm>wireLengthMm)
  throw Error('Animation out of bounds');
 return ((timeSeconds*frequencyHz-positionMm/wireLengthMm)%1+1)%1;
}
