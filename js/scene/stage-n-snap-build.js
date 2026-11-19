// Stage N, Phase 78: canonical-safe mm placement and terminal-based routing.
// All geometry remains a *user-entered model*, not a measured part or qualified cable.
import {dimensionedAssembly,setCADEnvelope} from './dimensioned-cad.js';
import {inspectPhysicalHarnesses,setPhysicalHarness} from './physical-routing.js';
export const SNAP_FORMAT='invention-lab/phase78-snap-build/1';
const finite=(x,label)=>{if(typeof x!=='number'||!Number.isFinite(x))throw Error('Invalid '+label);return x;};
export function snapMillimetres(value,spacingMm=2){
 finite(value,'coordinate');finite(spacingMm,'snap spacing');
 if(spacingMm<=0||spacingMm>100)throw Error('Snap spacing must be 0–100 mm');
 return Math.round(value/spacingMm)*spacingMm;
}
export function planSnapPart(diagram,id,{xMm,zMm,yMm,rotationQuarterTurns=0,spacingMm=2}={}){
 const part=dimensionedAssembly(diagram).parts.find(x=>x.id===id);
 if(!part)throw Error('Save an explicit component mm envelope before snap building');
 if(!Number.isInteger(rotationQuarterTurns)||Math.abs(rotationQuarterTurns)>4)
  throw Error('Rotation must be integer quarter-turns');
 const turn=((rotationQuarterTurns%4)+4)%4,swapped=turn%2===1;
 const proposal={xMm:snapMillimetres(xMm??part.xMm,spacingMm),
  yMm:snapMillimetres(yMm??part.yMm,spacingMm),
  zMm:snapMillimetres(zMm??part.zMm,spacingMm),
  widthMm:swapped?part.depthMm:part.widthMm,
  heightMm:part.heightMm,depthMm:swapped?part.widthMm:part.depthMm};
 if(Math.abs(proposal.xMm)>1000||Math.abs(proposal.zMm)>1000||
    proposal.yMm<0||proposal.yMm>1000)throw Error('Snapped position outside mm CAD workspace');
 return {format:SNAP_FORMAT,blockId:id,rotationQuarterTurns:turn,
  proposal,physicalValidation:'none'};
}
export function commitSnapPart(diagram,id,options={}){
 const proposal=planSnapPart(diagram,id,options);
 const routing=inspectPhysicalHarnesses(diagram);
 if(routing.terminals.some(x=>x.blockId===id) &&
   options.rotationQuarterTurns%2)
  throw Error('Rotating a block with physical terminals requires explicit re-pinning');
 if(routing.routes.some(x=>x.from.block===id||x.to.block===id))
  throw Error('Moving a routed physical terminal requires explicit harness revalidation');
 const prev=diagram.meta.dimensionedCAD;
 try{
  setCADEnvelope(diagram,id,proposal.proposal);
  const check=dimensionedAssembly(diagram);
  if(check.overlaps.some(pair=>Array.isArray(pair)&&pair.includes(id)))
   throw Error('Collision with an existing mm component body');
  // Inspect again: even non-connected foreign routes might intersect this block.
  const harness=inspectPhysicalHarnesses(diagram);
  if(harness.invalidIds.length)throw Error('Movement intersects existing 3D harness');
  return {...proposal,status:'COMMITTED_MODEL_ONLY'};
 }catch(error){
  if(prev===undefined)delete diagram.meta.dimensionedCAD;
  else diagram.meta.dimensionedCAD=prev;
  throw error;
 }
}
const same=(a,b)=>a.xMm===b.xMm&&a.yMm===b.yMm&&a.zMm===b.zMm;
const uniqueConsecutive=arr=>arr.filter((x,i)=>!i||!same(x,arr[i-1]));
export function manhattanCandidates(from,to,{liftMm=2,obstacleTopMm=0}={}){
 for(const [n,k] of Object.entries({liftMm,obstacleTopMm}))finite(k,n);
 if(liftMm<=0||obstacleTopMm<0)throw Error('Positive route lift required');
 for(const p of [from,to])if(!p||!['xMm','yMm','zMm'].every(k=>Number.isFinite(p[k])))
  throw Error('Both terminal endpoints need explicit global mm coordinates');
 const x={xMm:to.xMm,yMm:from.yMm,zMm:from.zMm};
 const z={xMm:from.xMm,yMm:from.yMm,zMm:to.zMm};
 const y=Math.max(from.yMm,to.yMm,obstacleTopMm)+liftMm;
 if(y>1100)throw Error('Elevated Manhattan route outside CAD workspace');
 const upA={...from,yMm:y},upB={...to,yMm:y};
 const paths=[
  [x,{xMm:to.xMm,yMm:from.yMm,zMm:to.zMm}],
  [z,{xMm:to.xMm,yMm:from.yMm,zMm:to.zMm}],
  [upA,{xMm:to.xMm,yMm:y,zMm:from.zMm},upB],
  [upA,{xMm:from.xMm,yMm:y,zMm:to.zMm},upB]
 ];
 return paths.map(path=>uniqueConsecutive([from,...path,to]).slice(1,-1))
   .filter(path=>path.length<=12);
}
export function commitAutoManhattanHarness(diagram,wireId,{liftMm=2}={}){
 const wire=diagram?.wires?.find(x=>x.id===wireId);
 if(!wire)throw Error('Select an existing canonical wire for auto-routing');
 const before=inspectPhysicalHarnesses(diagram),assembly=dimensionedAssembly(diagram);
 const terminal=(endpoint)=>before.terminals.find(t=>t.blockId===endpoint.block&&t.portId===endpoint.port);
 const from=terminal(wire.from),to=terminal(wire.to);
 if(!from||!to)throw Error('Save both explicit physical pin coordinates first');
 const obstacleTopMm=Math.max(0,...assembly.parts
  .filter(x=>x.id!==wire.from.block&&x.id!==wire.to.block).map(p=>p.bounds.y1));
 const paths=manhattanCandidates(from.globalMm,to.globalMm,{liftMm,obstacleTopMm});
 const errors=[];
 for(const waypoints of paths){
  try{
   const route=setPhysicalHarness(diagram,wireId,waypoints);
   return {format:SNAP_FORMAT,status:'GEOMETRIC_ROUTE_MODEL_ONLY',
    wireId,waypointsMm:waypoints,route,
    physicalValidation:'none'};
  }catch(e){errors.push(e.message);}
 }
 throw Error('No valid orthogonal route with saved conductor length and obstacles: '+[...new Set(errors)].join('; '));
}
