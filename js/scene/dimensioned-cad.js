// Explicit millimetre assembly envelopes. This is NOT an imported manufacturing CAD file.
// Schematic pixels never become physical dimensions, routing, or component geometry.
export const CAD_FORMAT='invention-lab/dimensioned-cad-envelope/1';
export const CAD_MM_PER_WORLD=20;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function num(n,lo,hi,label){
 if(!finite(n)||n<lo||n>hi)throw Error(label+' must be finite, '+lo+' to '+hi+' mm');
 return n;
}
function validated(spec){
 if(!spec||typeof spec!=='object'||Array.isArray(spec))throw Error('CAD envelope requires explicit dimensions');
 const out={};
 for(const k of ['xMm','yMm','zMm'])out[k]=num(spec[k],k==='yMm'?0:-1000,1000,k);
 for(const k of ['widthMm','heightMm','depthMm'])out[k]=num(spec[k],1,300,k);
 if(out.yMm+out.heightMm>1100)throw Error('CAD envelope exceeds vertical design limit');
 return out;
}
export function setCADEnvelope(diagram,blockId,spec){
 if(!diagram?.blocks?.some(b=>b.id===blockId))throw Error('CAD envelope must reference a canonical block');
 if(!diagram.meta||typeof diagram.meta!=='object'||Array.isArray(diagram.meta))
  throw Error('Invalid design metadata');
 const old=diagram.meta.dimensionedCAD;
 if(old!==undefined&&(old?.format!==CAD_FORMAT||!old.parts||
   typeof old.parts!=='object'||Array.isArray(old.parts)))
  throw Error('Invalid stored CAD envelope format');
 const clean=validated(spec);
 if(Object.keys(old?.parts||{}).length>500)throw Error('CAD assembly size limit exceeded');
 diagram.meta.dimensionedCAD={format:CAD_FORMAT,parts:{...(old?.parts||{}),[blockId]:clean}};
 return clean;
}
const bounds=p=>({x0:p.xMm-p.widthMm/2,x1:p.xMm+p.widthMm/2,
 y0:p.yMm,y1:p.yMm+p.heightMm,z0:p.zMm-p.depthMm/2,z1:p.zMm+p.depthMm/2});
export function dimensionedAssembly(diagram){
 if(!diagram||!Array.isArray(diagram.blocks))throw Error('CAD requires a canonical design');
 const raw=diagram.meta?.dimensionedCAD;
 if(raw===undefined)return {format:CAD_FORMAT,status:'no-input',parts:[],missing:diagram.blocks.map(b=>b.id),
  overlaps:[],scaleMmPerWorld:CAD_MM_PER_WORLD,physicalValidation:'none',qualification:'unverified'};
 if(!raw||raw.format!==CAD_FORMAT||!raw.parts||typeof raw.parts!=='object'||
   Array.isArray(raw.parts))throw Error('Invalid CAD envelope metadata');
 if(diagram.blocks.length>500||Object.keys(raw.parts).length>500)
  throw Error('CAD assembly size limit exceeded');
 const ids=new Set(diagram.blocks.map(b=>b.id)),parts=[];
 for(const [id,v] of Object.entries(raw.parts)){
  if(!ids.has(id))throw Error('Stale CAD block ID: '+id);
  const spec=validated(v),block=diagram.blocks.find(b=>b.id===id);
  parts.push({id,type:block.type,...spec,bounds:bounds(spec)});
 }
 const overlaps=[];
 for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
  const a=parts[i].bounds,b=parts[j].bounds;
  if(a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0&&
     a.z0<b.z1&&a.z1>b.z0)overlaps.push([parts[i].id,parts[j].id]);
 }
 return {format:CAD_FORMAT,status:'model-only',parts,
  missing:diagram.blocks.map(b=>b.id).filter(id=>!raw.parts[id]),
  overlaps,scaleMmPerWorld:CAD_MM_PER_WORLD,
  geometrySource:'user-entered-millimetre-envelope',nonManufacturingGeometry:true,
  wiresRouted:false,physicalValidation:'none',qualification:'unverified'};
}
const addLine=(out,a,b,col)=>out.push(...a,...col,...b,...col);
function addBox(out,p,col){
 const s=CAD_MM_PER_WORLD,b=p.bounds;
 const x0=b.x0/s,x1=b.x1/s,y0=b.y0/s,y1=b.y1/s,z0=b.z0/s,z1=b.z1/s;
 const v=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],
  [x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];
 for(const [a,b,c,d,shade] of [[4,5,6,7,1.1],[0,3,2,1,.4],
  [0,1,5,4,.7],[1,2,6,5,.8],[2,3,7,6,.6],[3,0,4,7,.85]]){
  const color=col.map(k=>Math.min(1,k*shade));
  for(const i of [a,b,c,a,c,d])out.push(...v[i],...color);
 }
}
export function dimensionedCADMesh(report,{selectedId=null}={}){
 if(!report||!Array.isArray(report.parts))throw Error('Invalid dimensional assembly');
 const triangles=[],lines=[],s=CAD_MM_PER_WORLD;
 for(const part of report.parts)addBox(triangles,part,
  part.id===selectedId?[1,.73,.25]:[.20,.61,.81]);
 const b=report.parts.map(p=>p.bounds);
 const xmin=b.length?Math.min(...b.map(x=>x.x0/s)):-2;
 const xmax=b.length?Math.max(...b.map(x=>x.x1/s)):2;
 const zmin=b.length?Math.min(...b.map(x=>x.z0/s)):-2;
 const zmax=b.length?Math.max(...b.map(x=>x.z1/s)):2;
 const min=Math.min(xmin,zmin,-1),max=Math.max(xmax,zmax,1);
 const axis=Math.max(2,max-min+2),col=[.4,.52,.56];
 addLine(lines,[-axis/2,0,0],[axis/2,0,0],[.88,.35,.31]);
 addLine(lines,[0,0,-axis/2],[0,0,axis/2],[.25,.83,.44]);
 // 20-mm world tick marks; dimensional geometry uses a fixed, uniform scale.
 const low=Math.ceil(-axis/2),hi=Math.floor(axis/2);
 for(let i=low;i<=hi;i++){
  addLine(lines,[i,0,-.07],[i,0,.07],col);
  addLine(lines,[-.07,0,i],[.07,0,i],col);
 }
 return {triangles,lines,center:{x:(xmin+xmax)/2,z:(zmin+zmax)/2},
  span:Math.max(4,xmax-xmin,zmax-zmin),
  geometrySource:report.geometrySource||'unconfigured',
  scaleMmPerWorld:s,physicalDimensionsEstablished:report.parts.length>0,
  physicalValidation:'none',cadEnvelopeOnly:true};
}
