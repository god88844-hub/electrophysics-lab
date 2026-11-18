// Conservative dimensional plausibility check between explicitly entered
// component body envelopes; not a routed wire length or pin-to-pin distance.
import {dimensionedAssembly} from './dimensioned-cad.js';
import {physicalWireAssumptions} from './physical-wire.js';
export const ROUTING_CHECK_FORMAT='invention-lab/cad-wire-clearance/1';
const gap=(a0,a1,b0,b1)=>Math.max(0,a0-b1,b0-a1);
export function inspectConductorClearances(diagram){
 if(!diagram||!Array.isArray(diagram.wires))
  throw Error('Physical clearance requires a canonical diagram');
 const cad=dimensionedAssembly(diagram),physical=physicalWireAssumptions(diagram);
 if(physical.status==='no-input'||cad.status==='no-input')
  return {format:ROUTING_CHECK_FORMAT,status:'insufficient-input',
   checks:[],wiresNotChecked:diagram.wires.map(w=>w.id),impossible:[],
   physicallyRouted:false,physicalValidation:'none'};
 const parts=new Map(cad.parts.map(p=>[p.id,p]));
 const wires=new Map(physical.wires.map(p=>[p.id,p]));
 const checks=[],wiresNotChecked=[];
 for(const w of diagram.wires){
  const a=parts.get(w.from.block),b=parts.get(w.to.block),spec=wires.get(w.id);
  if(!a||!b||!spec){wiresNotChecked.push(w.id);continue;}
  const x=gap(a.bounds.x0,a.bounds.x1,b.bounds.x0,b.bounds.x1);
  const y=gap(a.bounds.y0,a.bounds.y1,b.bounds.y0,b.bounds.y1);
  const z=gap(a.bounds.z0,a.bounds.z1,b.bounds.z0,b.bounds.z1);
  const minimumBodyGapMm=Math.hypot(x,y,z);
  const enteredConductorLengthMm=spec.lengthM*1000;
  const impossible=enteredConductorLengthMm+1e-9<minimumBodyGapMm;
  checks.push({wireId:w.id,fromBlockId:a.id,toBlockId:b.id,
   minimumBodyGapMm,enteredConductorLengthMm,impossible,
   isPinToPinLength:false,physicalPinsMapped:false,
   routingValidated:false,physicalValidation:'none'});
 }
 return {format:ROUTING_CHECK_FORMAT,status:'lower-bound-only',
  checks,wiresNotChecked,impossible:checks.filter(x=>x.impossible).map(x=>x.wireId),
  physicalPinCoordinatesKnown:false,physicallyRouted:false,physicalValidation:'none'};
}
