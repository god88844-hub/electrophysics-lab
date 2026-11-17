// Phase63 engineering hierarchy over canonical 2D schematic. Scene units are
// presentation coordinates, never inferred physical lengths or manufactured geometry.
import {createHash} from 'node:crypto';
import {Diagram} from '../core/diagram.js';
import {portsOf} from '../core/block.js';
import {sceneFromDiagram,SCENE_SCALE} from '../scene/layout.js';
import {listAssemblies,assemblyIssues} from '../assembly/modules.js';
export const FORMAT='invention-lab/phase63-multiscale-3d-hierarchy/1';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const requireOk=(v,m)=>{if(!v)throw Error(m)};
const allowed=new Set(['assembly','component','port']);
function sourceCheck(diagram){
 requireOk(diagram instanceof Diagram,'Requires canonical Diagram, not external rendered snapshot');
 requireOk(diagram.blocks.length<=10000&&diagram.wires.length<=20000,'Scene complexity limit');
 const defects=diagram.issues().concat(assemblyIssues(diagram));
 requireOk(defects.length===0,'Cannot render malformed connectivity: '+defects.join('; '));
 const unique=keys=>new Set(keys).size===keys.length;
 requireOk(unique(diagram.blocks.map(b=>b.id))&&unique(diagram.wires.map(w=>w.id)),
  'Duplicate canonical ids');
 requireOk(diagram.blocks.every(b=>Number.isFinite(b.x)&&Number.isFinite(b.y)&&
  Math.abs(b.x)<=1e6&&Math.abs(b.y)<=1e6),'Invalid component placement');
 return true;
}
export function connectivityDigest(diagram){
 sourceCheck(diagram);
 const nodes=diagram.blocks.map(b=>({id:b.id,type:b.type,ports:portsOf(b).map(p=>({id:p.id,dir:p.dir,type:p.type}))}));
 return sha({lab:diagram.lab,nodes,connections:diagram.wires.map(w=>({from:w.from,to:w.to}))});
}
export function makeHierarchy(diagram,{detail='component',focusAssemblyId=null}={}){
 sourceCheck(diagram);requireOk(allowed.has(detail),'Unsupported hierarchy detail level');
 const groups=listAssemblies(diagram);
 if(focusAssemblyId!==null)requireOk(groups.some(g=>g.id===focusAssemblyId),'Unknown assembly');
 const byBlock=new Map();
 for(const g of groups)for(const bid of g.blockIds){
  requireOk(!byBlock.has(bid),'Duplicate group member');
  byBlock.set(bid,g.id);
 }
 const visible=focusAssemblyId===null?null:new Set(groups.find(x=>x.id===focusAssemblyId).blockIds);
 const scene=sceneFromDiagram(diagram,{visibleBlockIds:visible===null?null:[...visible]});
 const nodes=[{id:'design:'+diagram.id,kind:'design',parentId:null,lab:diagram.lab}];
 const renderedAssemblyIds=new Set();
 for(const g of groups){
  if(visible!==null&&g.id!==focusAssemblyId)continue;
  nodes.push({id:'assembly:'+g.id,kind:'assembly',parentId:'design:'+diagram.id,
   assemblyId:g.id,name:g.name,members:[...g.blockIds]});
  renderedAssemblyIds.add(g.id);
 }
 if(detail!=='assembly'){
  for(const b of diagram.blocks){
   if(visible!==null&&!visible.has(b.id))continue;
   nodes.push({id:'block:'+b.id,kind:'component',
    parentId:byBlock.has(b.id)?'assembly:'+byBlock.get(b.id):'design:'+diagram.id,
    blockId:b.id,type:b.type,x:b.x,y:b.y});
   if(detail==='port')for(const p of portsOf(b)){
    nodes.push({id:'port:'+b.id+':'+p.id,kind:'port',
     parentId:'block:'+b.id,blockId:b.id,portId:p.id,direction:p.dir,signalType:p.type});
   }
  }
 }else{
  for(const b of diagram.blocks){
   if(visible!==null&&!visible.has(b.id))continue;
   if(!byBlock.has(b.id))nodes.push({id:'block:'+b.id,kind:'component',
    parentId:'design:'+diagram.id,blockId:b.id,type:b.type,x:b.x,y:b.y});
  }
 }
 const edges=diagram.wires.map(w=>{
  const fromBlock=w.from.block,toBlock=w.to.block;
  const endpoint=b=>detail==='port'?'port:'+b:(detail==='component'?'block:'+b:
    (byBlock.has(b)?'assembly:'+byBlock.get(b):'block:'+b));
  const from=endpoint(detail==='port'?fromBlock+':'+w.from.port:fromBlock);
  const to=endpoint(detail==='port'?toBlock+':'+w.to.port:toBlock);
  const isVisible=visible===null||(visible.has(fromBlock)&&visible.has(toBlock));
  return {wireId:w.id,from,to,fromBlock,toBlock,
   fromPort:w.from.port,toPort:w.to.port,visible:isVisible,
   crossAssembly:(byBlock.get(fromBlock)||null)!==(byBlock.get(toBlock)||null)};
 });
 return {format:FORMAT,detail,focusAssemblyId,
  canonicalDiagramId:diagram.id,canonicalLab:diagram.lab,
  connectivitySHA256:connectivityDigest(diagram),
  canonicalComponentCount:diagram.blocks.length,canonicalWireCount:diagram.wires.length,
  visibleComponentCount:scene.blocks.length,visibleWireCount:scene.wires.length,
  nodes,edges,scene,
  presentation3DCoordinatesOnly:true,physicalDimensionsEstablished:false,
  physicalGeometryQualification:'UNKNOWN',physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export function proposeMove(diagram,{assemblyId=null,blockIds=null,deltaWorldX=0,deltaWorldZ=0}={}){
 sourceCheck(diagram);
 const byAssembly=assemblyId===null?null:listAssemblies(diagram).find(g=>g.id===assemblyId);
 requireOk((assemblyId!==null)!==(blockIds!==null),'Specify exactly one of assemblyId or blockIds');
 if(assemblyId!==null)requireOk(!!byAssembly,'Unknown assembly to move');
 const ids=byAssembly?[...byAssembly.blockIds]:blockIds;
 requireOk(Array.isArray(ids)&&ids.length>0&&ids.length<=250&&
  new Set(ids).size===ids.length&&ids.every(x=>typeof x==='string'&&diagram.block(x)),
  'Invalid component move selection');
 requireOk(Number.isFinite(deltaWorldX)&&Number.isFinite(deltaWorldZ)&&
  Math.abs(deltaWorldX)<=100&&Math.abs(deltaWorldZ)<=100,'Invalid finite 3D translation');
 const before=connectivityDigest(diagram);
 const step=20,dx=Math.round(deltaWorldX/SCENE_SCALE/step)*step,
  dy=Math.round(deltaWorldZ/SCENE_SCALE/step)*step;
 const proposal=diagram.clone();
 for(const id of ids){
  const b=proposal.block(id);b.x+=dx;b.y+=dy;
  requireOk(Number.isFinite(b.x)&&Number.isFinite(b.y)&&
   Math.abs(b.x)<=1e6&&Math.abs(b.y)<=1e6,'Moved position exceeds limit');
 }
 requireOk(connectivityDigest(proposal)===before,'Unexpected topology mutation');
 return {format:'invention-lab/phase63-transactional-scene-edit/1',
  movedBlockIds:ids,snappedDesignDelta:{x:dx,y:dy},
  beforeConnectivitySHA256:before,afterConnectivitySHA256:connectivityDigest(proposal),
  proposedDiagram:proposal.toJSON(),sourceMutated:false,
  physicalDimensionsEstablished:false,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
