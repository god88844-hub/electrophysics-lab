// Versioned, explicit physical terminal and polyline harness geometry.
// Coordinates come ONLY from user-entered millimetres, never schematic pixels.
// A routed curve is geometrical evidence, not a measured/manufacturing-approved cable.
import {portsOf} from '../core/block.js';
import {dimensionedAssembly} from './dimensioned-cad.js';
import {evaluatePhysicalWire} from './physical-wire.js';
export const PHYSICAL_ROUTING_FORMAT='invention-lab/physical-terminal-harness/1';
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const bound=(n,lo,hi,label)=>{
 if(!finite(n)||n<lo||n>hi)throw Error(label+' must be finite between '+lo+' and '+hi+' mm');
 return n;
};
function validStored(diagram){
 const meta=diagram?.meta;
 if(!meta||typeof meta!=='object'||Array.isArray(meta))throw Error('Missing design metadata');
 const cfg=meta.physicalRouting;
 if(cfg!==undefined&&(cfg?.format!==PHYSICAL_ROUTING_FORMAT||
   !cfg.terminals||typeof cfg.terminals!=='object'||Array.isArray(cfg.terminals)||
   !cfg.routes||typeof cfg.routes!=='object'||Array.isArray(cfg.routes)))
  throw Error('Invalid versioned physical routing metadata');
 if(Object.keys(cfg?.terminals||{}).length>500||Object.keys(cfg?.routes||{}).length>500)
  throw Error('Physical routing object limit exceeded');
 return cfg;
}
const xyz=(v,local=false)=>{
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('3D millimetre coordinate required');
 return {
  xMm:bound(v.xMm,-1000,1000,'X'),
  yMm:bound(v.yMm,local?-300:0,1100,'Y'),
  zMm:bound(v.zMm,-1000,1000,'Z')
 };
};
function currentPart(diagram,blockId){
 const report=dimensionedAssembly(diagram);
 const part=report.parts.find(p=>p.id===blockId);
 if(!part)throw Error('Save explicit mm component envelope before assigning physical terminals: '+blockId);
 return part;
}
function localTerminal(diagram,blockId,portId,input){
 const block=diagram?.blocks?.find(b=>b.id===blockId);
 if(!block||!portsOf(block).some(p=>p.id===portId))
  throw Error('Physical terminal must match a canonical component port');
 const part=currentPart(diagram,blockId),p=xyz(input,true);
 const hw=part.widthMm/2,hd=part.depthMm/2,eps=1e-6;
 if(p.xMm< -hw-eps||p.xMm>hw+eps||
    p.zMm< -hd-eps||p.zMm>hd+eps||
    p.yMm< -eps||p.yMm>part.heightMm+eps)
  throw Error('Physical terminal is outside the component envelope');
 if(![Math.abs(Math.abs(p.xMm)-hw),Math.abs(Math.abs(p.zMm)-hd),
       Math.abs(p.yMm),Math.abs(p.yMm-part.heightMm)].some(n=>n<=eps))
  throw Error('Physical terminal must lie on an outer envelope face');
 return p;
}
function globalTerminal(part,p){
 return {xMm:part.xMm+p.xMm,yMm:part.yMm+p.yMm,zMm:part.zMm+p.zMm};
}
const terminalKey=(blockId,portId)=>JSON.stringify([blockId,portId]);
export function setPhysicalTerminal(diagram,blockId,portId,coordinatesMm){
 const old=validStored(diagram);
 const p=localTerminal(diagram,blockId,portId,coordinatesMm);
 const entries={...(old?.terminals||{})};
 entries[terminalKey(blockId,portId)]=p;
 diagram.meta.physicalRouting={format:PHYSICAL_ROUTING_FORMAT,
  terminals:entries,routes:{...(old?.routes||{})}};
 return p;
}
function routeWaypoints(waypoints){
 if(!Array.isArray(waypoints)||waypoints.length>12)
  throw Error('Harness supports an explicit list of at most 12 waypoints');
 return waypoints.map(x=>xyz(x));
}
function dist(a,b){return Math.hypot(a.xMm-b.xMm,a.yMm-b.yMm,a.zMm-b.zMm);}
function polylineLength(points){
 return points.slice(1).reduce((v,p,i)=>v+dist(points[i],p),0);
}
function interiorSegment(a,b,bounds){
 // Parametric slab intersection against the STRICT interior of a foreign box.
 // Touching the surface alone is allowed; crossing through it is not.
 let lo=0,hi=1;
 for(const [name,min,max] of [['xMm','x0','x1'],['yMm','y0','y1'],['zMm','z0','z1']]){
  const eps=1e-5,L=bounds[min]+eps,U=bounds[max]-eps;
  if(L>=U)return false;
  const d=b[name]-a[name];
  if(Math.abs(d)<1e-12){if(a[name]<=L||a[name]>=U)return false;continue;}
  const aa=(L-a[name])/d,bb=(U-a[name])/d;
  lo=Math.max(lo,Math.min(aa,bb));hi=Math.min(hi,Math.max(aa,bb));
  if(hi<=lo)return false;
 }
 return lo<hi&&hi>0&&lo<1;
}
function inspectAll(diagram,config){
 const assembly=dimensionedAssembly(diagram);
 const partById=new Map(assembly.parts.map(p=>[p.id,p]));
 const canon=new Map();
 for(const block of diagram.blocks){
  for(const port of portsOf(block))canon.set(terminalKey(block.id,port.id),{blockId:block.id,portId:port.id});
 }
 const terminals=[],byKey=new Map();
 for(const [key,value] of Object.entries(config.terminals)){
  let pair;
  try{pair=JSON.parse(key);}catch{throw Error('Malformed physical terminal key');}
  if(!Array.isArray(pair)||pair.length!==2||!pair.every(x=>typeof x==='string')||
    terminalKey(...pair)!==key||!canon.has(key))
   throw Error('Stale or forged physical terminal: '+key);
  const part=partById.get(pair[0]);
  if(!part)throw Error('Missing dimensional envelope for terminal: '+key);
  const local=localTerminal(diagram,pair[0],pair[1],value);
  const global=globalTerminal(part,local);
  const row={blockId:pair[0],portId:pair[1],localMm:local,globalMm:global};
  byKey.set(key,row);terminals.push(row);
 }
 const actualWires=new Map(diagram.wires.map(w=>[w.id,w]));
 if(actualWires.size!==diagram.wires.length)throw Error('Duplicate canonical wire ID');
 const routes=[];
 for(const [wireId,saved] of Object.entries(config.routes)){
  const wire=actualWires.get(wireId);
  if(!wire)throw Error('Stale physical route wire ID: '+wireId);
  if(!saved||typeof saved!=='object'||Array.isArray(saved))
   throw Error('Malformed physical route');
  const from=byKey.get(terminalKey(wire.from.block,wire.from.port));
  const to=byKey.get(terminalKey(wire.to.block,wire.to.port));
  if(!from||!to)throw Error('Physical route requires both canonical terminal coordinates: '+wireId);
  const conductor=diagram.meta?.physicalLayout?.wires?.[wireId];
  if(!conductor)throw Error('Physical route requires explicit material and length: '+wireId);
  evaluatePhysicalWire(conductor);
  const waypoints=routeWaypoints(saved.waypointsMm);
  const pointsMm=[from.globalMm,...waypoints,to.globalMm];
  const routedLengthMm=polylineLength(pointsMm);
  if(!finite(routedLengthMm)||routedLengthMm<1e-6)throw Error('Zero-length physical route');
  const enteredConductorLengthMm=conductor.lengthMm;
  const excessLengthMm=enteredConductorLengthMm-routedLengthMm;
  const violations=[];
  if(excessLengthMm< -1e-6)violations.push('conductor-shorter-than-routed-path');
  const obstacleIds=[];
  for(const part of assembly.parts){
   if(part.id===from.blockId||part.id===to.blockId)continue;
   if(pointsMm.slice(1).some((p,i)=>interiorSegment(pointsMm[i],p,part.bounds)))
    obstacleIds.push(part.id);
  }
  if(obstacleIds.length)violations.push('route-intersects-foreign-component-body');
  routes.push({wireId,from:wire.from,to:wire.to,
   fromTerminal:from,toTerminal:to,waypointsMm:waypoints,pointsMm,
   routedLengthMm,enteredConductorLengthMm,
   excessLengthMm,obstacleIds,violations,material:conductor.material,
   diameterMm:conductor.diameterMm,
   physicalValidation:'none',routingSource:'user-authored-mm-polyline'});
 }
 const routedIds=new Set(routes.map(x=>x.wireId));
 const missingRoutes=diagram.wires.map(w=>w.id).filter(id=>!routedIds.has(id));
 const invalidIds=routes.filter(r=>r.violations.length).map(r=>r.wireId);
 return {format:PHYSICAL_ROUTING_FORMAT,status:invalidIds.length?'violations':
   missingRoutes.length?'partial':'geometrically-consistent-model-only',
  terminals,routes,missingRoutes,invalidIds,
  physicallyManufactured:false,independentPhysicalEvidence:'none',
  calibrated:false,physicalValidation:'none',
  measuredDimensionsEstablished:false, // user-entered lengths are not verified measurements
  physicalPinCoordinatesExplicit:true,
  routeLengthFromPolyline:true,fullHarnessValidation:false,
  realWorldBuildSuccessPercent:null};
}
export function inspectPhysicalHarnesses(diagram){
 if(!diagram||!Array.isArray(diagram.wires)||!Array.isArray(diagram.blocks))
  throw Error('Physical routing requires a canonical diagram');
 const config=validStored(diagram);
 if(!config)return {format:PHYSICAL_ROUTING_FORMAT,status:'no-input',
  terminals:[],routes:[],missingRoutes:diagram.wires.map(w=>w.id),invalidIds:[],
  physicalValidation:'none',realWorldBuildSuccessPercent:null};
 return inspectAll(diagram,config);
}
export function setPhysicalHarness(diagram,wireId,waypointsMm){
 const old=validStored(diagram);
 if(!diagram.wires.some(w=>w.id===wireId))throw Error('Unknown canonical wire for physical route');
 const waypoints=routeWaypoints(waypointsMm);
 const next={format:PHYSICAL_ROUTING_FORMAT,
  terminals:{...(old?.terminals||{})},
  routes:{...(old?.routes||{}),[wireId]:{waypointsMm:waypoints}}};
 // Test the candidate configuration fully before mutating the saved design.
 const report=inspectAll(diagram,next);
 if(report.invalidIds.includes(wireId))
  throw Error('Invalid route: '+report.routes.find(r=>r.wireId===wireId).violations.join(', '));
 diagram.meta.physicalRouting=next;
 return report.routes.find(r=>r.wireId===wireId);
}
