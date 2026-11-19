// Phase 79: semantic zoom is a VIEW on canonical data, not another solver.
export const SEMANTIC_ZOOM_FORMAT='invention-lab/phase79-semantic-zoom/1';
export const ZOOM_LEVELS=Object.freeze([
 Object.freeze({id:'system',label:'System / rack',minDistance:72,maxDistance:Infinity,solver:'architecture-rtl'}),
 Object.freeze({id:'board',label:'PCB / board',minDistance:28,maxDistance:72,solver:'board-electrothermal'}),
 Object.freeze({id:'chip',label:'Chip / floorplan',minDistance:11,maxDistance:28,solver:'rtl-netlist'}),
 Object.freeze({id:'cell',label:'Cell / gate',minDistance:4,maxDistance:11,solver:'parasitic-logic'}),
 Object.freeze({id:'device',label:'Device / semiconductor',minDistance:0,maxDistance:4,solver:'spice-or-quantum-reference'})
]);
const finite=(v)=>typeof v==='number'&&Number.isFinite(v);
export function semanticLevel(distance){
 if(!finite(distance)||distance<=0)throw Error('Camera distance must be positive finite');
 return ZOOM_LEVELS.find(x=>distance>=x.minDistance&&distance<x.maxDistance).id;
}
export function semanticDistance(level){
 const all={system:100,board:42,chip:18,cell:7,device:2.4};
 if(!(level in all))throw Error('Unknown five-scale zoom level');
 return all[level];
}
export function semanticZoomState(distance,{lab,hasSimulation=false,hasCalibratedSpice=false,
 hasPhysicalGeometry=false}={}){
 const level=semanticLevel(distance),info=ZOOM_LEVELS.find(x=>x.id===level);
 const solverAvailable=hasSimulation&&(
  level==='system'||level==='board'||level==='chip'||
  level==='cell'&&lab!=='quantum'||
  level==='device'&&lab==='quantum');
 // Do not pretend to have a calibrated transistor SPICE or complete PCB solver.
 const qualified=level==='device'&&lab==='chip'&&hasCalibratedSpice&&hasPhysicalGeometry;
 return {format:SEMANTIC_ZOOM_FORMAT,level,label:info.label,
  desiredSolver:info.solver,
  appliedSolver:solverAvailable?'existing-canonical-lab-solver':null,
  reason:solverAvailable?'solver-snapshot-not-continuous-co-simulation':
   'NO_VERIFIED_LIVE_SOLVER_FOR_THIS_LEVEL',
  realTransistorPhysicsQualified:qualified,physicalValidation:'none'};
}
export function smoothZoom(current,target,alpha=.15){
 if(!finite(current)||current<=0||!finite(target)||target<=0||
    !finite(alpha)||alpha<=0||alpha>1)throw Error('Invalid semantic camera interpolation');
 const next=current+(target-current)*alpha;
 return Math.abs(next-target)<=1e-5?target:next;
}
export function zoomRoundTrip(distance,level){
 const previous=semanticLevel(distance),target=semanticLevel(semanticDistance(level));
 return {previous,target,restored:semanticLevel(distance),stable:previous===semanticLevel(distance)};
}
