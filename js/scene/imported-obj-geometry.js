// Bounded offline OBJ triangle-mesh display path, NEVER certified manufacturer CAD.
// Input units must be millimetres, +Y up. No conversion or automatic rescaling.
export const IMPORTED_OBJ_FORMAT='invention-lab/imported-mm-obj-mesh/1';
const DECIMAL=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const FACE=/^([1-9]\d*)(?:\/(?:\d+)?(?:\/(?:\d+)?)?)?$/;
const LIMITS=Object.freeze({bytes:4_000_000,vertices:20_000,triangles:40_000});
function number(v){if(!DECIMAL.test(v))throw Error('OBJ requires decimal coordinates');const n=Number(v);if(!Number.isFinite(n)||Math.abs(n)>1000)throw Error('OBJ coordinate outside ±1000 mm');return n;}
function bad(message,line){throw Error('Invalid OBJ line '+line+': '+message);}
export function parseMillimetreOBJ(input){
 if(typeof input!=='string'||input.length>LIMITS.bytes||/[^\x09\x0A\x0D\x20-\x7E]/.test(input))
  throw Error('OBJ requires bounded ASCII text (4 MB maximum)');
 const verticesMm=[],faces=[];
 const lines=input.split(/\r?\n/);
 for(let i=0;i<lines.length;i++){
  const row=lines[i].trim();if(!row||row.startsWith('#'))continue;
  const tokens=row.split(/\s+/),[keyword,...args]=tokens;
  if(keyword==='v'){
   if(args.length!==3)bad('only XYZ position vertices are supported',i+1);
   if(verticesMm.length===LIMITS.vertices)bad('vertex budget exceeded',i+1);
   verticesMm.push(args.map(number));
  }else if(keyword==='f'){
   if(args.length<3||args.length>4)bad('only triangle or quad faces are supported',i+1);
   const ids=args.map(s=>{
    const match=FACE.exec(s);if(!match)bad('unsupported OBJ index syntax',i+1);
    const id=Number(match[1])-1;
    if(!Number.isSafeInteger(id)||id>=verticesMm.length)bad('forward or missing OBJ vertex index',i+1);
    return id;
   });
   if(new Set(ids).size!==ids.length)bad('repeated face vertex',i+1);
   for(let j=1;j<ids.length-1;j++){
    const a=verticesMm[ids[0]],b=verticesMm[ids[j]],c=verticesMm[ids[j+1]];
    const u=b.map((v,k)=>v-a[k]),v=c.map((w,k)=>w-a[k]);
    const area=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]);
    if(area<=1e-10)bad('zero-area face',i+1);
    if(faces.length===LIMITS.triangles)bad('triangle budget exceeded',i+1);
    faces.push([ids[0],ids[j],ids[j+1]]);
   }
  }else if(['vn','vt','o','g','s','usemtl','mtllib'].includes(keyword)){
   // Metadata and material-library declarations are ignored; no file or URL is loaded.
   if(row.length>1024)bad('oversized metadata',i+1);
  }else bad('unsupported OBJ record '+keyword,i+1);
 }
 if(verticesMm.length<4||!faces.length)throw Error('OBJ requires a closed-volume candidate mesh');
 const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity];
 for(const v of verticesMm)for(let j=0;j<3;j++){low[j]=Math.min(low[j],v[j]);high[j]=Math.max(high[j],v[j]);}
 const size=high.map((v,j)=>v-low[j]);
 if(size.some(v=>v<=0.001))throw Error('OBJ requires nonzero 3D bounding dimensions');
 return {format:IMPORTED_OBJ_FORMAT,verticesMm,faces,boundsMm:{
  minX:low[0],maxX:high[0],minY:low[1],maxY:high[1],minZ:low[2],maxZ:high[2],
  widthMm:size[0],heightMm:size[1],depthMm:size[2]},
  coordinateSystem:'Y-up',units:'mm',manufacturerCAD:false,sourceAuthenticity:'unverified',
  geometryType:'user-imported-triangulated-OBJ',physicalValidation:'none'};
}
export function objTrianglesForPart(obj,part,scaleMmPerWorld=20){
 if(obj?.format!==IMPORTED_OBJ_FORMAT||!Array.isArray(obj.verticesMm)||!Array.isArray(obj.faces)||
    !part||![part.xMm,part.yMm,part.zMm,part.widthMm,part.heightMm,part.depthMm].every(Number.isFinite))
  throw Error('Invalid OBJ mesh or dimensioned canonical part');
 if(scaleMmPerWorld!==20)throw Error('Physical-scale CAD view must use 20 mm per world unit');
 for(const key of ['widthMm','heightMm','depthMm']){
  const expected=part[key],actual=obj.boundsMm?.[key];
  if(!Number.isFinite(actual)||Math.abs(expected-actual)>Math.max(.05,expected*.005))
   throw Error('Imported OBJ '+key+' disagrees with saved component envelope');
 }
 if(obj.faces.length>LIMITS.triangles||obj.verticesMm.length>LIMITS.vertices)
  throw Error('Imported OBJ mesh exceeds rendering budget');
 const b=obj.boundsMm,cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;
 const out=[];
 for(const face of obj.faces){
  if(!Array.isArray(face)||face.length!==3)throw Error('Invalid triangulated OBJ face');
  const points=face.map(i=>{
   const v=obj.verticesMm[i];if(!Number.isInteger(i)||!v||v.length!==3||!v.every(Number.isFinite))
    throw Error('Invalid imported OBJ vertex');
   const x=part.xMm+(v[0]-cx),y=part.yMm+v[1]-b.minY,z=part.zMm+v[2]-cz;
   if(![x,y,z].every(Number.isFinite))throw Error('Invalid OBJ positioning');
   return [x/scaleMmPerWorld,y/scaleMmPerWorld,z/scaleMmPerWorld];
  });
  const u=points[1].map((x,j)=>x-points[0][j]),v=points[2].map((x,j)=>x-points[0][j]);
  const ny=u[2]*v[0]-u[0]*v[2];
  const lum=Math.max(.35,Math.min(1,.73+.27*Math.sign(ny)));
  const color=[.47*lum,.69*lum,.86*lum];
  for(const point of points)out.push(...point,...color);
 }
 if(!out.every(Number.isFinite))throw Error('Nonfinite imported mesh');
 return out;
}
