// Procedural experiment workbench — rendering only.
// All geometry is illustrative, not measured CAD or physical simulation.
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
const scale=(rgb,k)=>rgb.map(v=>clamp(v*k));
const dark=[0.10,0.16,0.22],metal=[0.49,0.63,0.73],gold=[0.96,0.68,0.24],
blue=[0.11,0.51,0.80],green=[0.14,0.78,0.58],glow=[0.25,0.92,0.98];
const black=[0.08,0.11,0.17],shell=[0.17,0.24,0.33];
function triangle(out,a,b,c,color){
 for(const p of [a,b,c])out.push(...p,...color);
}
function cuboid(out,{x,y,z,w,h,d,color}){
 if(![x,y,z,w,h,d].every(Number.isFinite)||w<=0||h<=0||d<=0)
  throw Error('Invalid illustrative 3D geometry');
 const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,y0=y,y1=y+h;
 const v=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],
  [x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];
 for(const [a,b,c,d,shade] of [[4,5,6,7,1.18],[3,2,1,0,.35],
  [0,1,5,4,.74],[1,2,6,5,.85],[2,3,7,6,.59],[3,0,4,7,.92]])
  for(const ids of [[a,b,c],[a,c,d]])triangle(out,...ids.map(i=>v[i]),scale(color,shade));
}
function cylinder(out,{x,y,z,r,h,color,sides=12}){
 if(r<=0||h<=0||!Number.isFinite(r+h+x+y+z))throw Error('Invalid cylinder');
 const n=Math.max(6,Math.min(20,Math.floor(sides)));
 for(let i=0;i<n;i++){
  const a=2*Math.PI*i/n,b=2*Math.PI*(i+1)/n;
  const u=[x+r*Math.cos(a),y,z+r*Math.sin(a)],v=[x+r*Math.cos(b),y,z+r*Math.sin(b)];
  const U=[u[0],y+h,u[2]],V=[v[0],y+h,v[2]];
  const shade=.70+.20*Math.cos((a+b)/2-0.7);
  triangle(out,u,v,V,scale(color,shade));triangle(out,u,V,U,scale(color,shade));
  triangle(out,[x,y+h,z],U,V,scale(color,1.15));
 }
}
function tube(out,a,b,r,color){
 const A=[a.x,a.y,a.z],B=[b.x,b.y,b.z],d=B.map((v,i)=>v-A[i]);
 const length=Math.hypot(...d);if(length<1e-6)return;
 const unit=d.map(x=>x/length);
 const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
 let u=cross(unit,Math.abs(unit[1])>.9?[1,0,0]:[0,1,0]);let l=Math.hypot(...u);u=u.map(x=>x/l);
 const v=cross(unit,u);const n=7;
 const ring=(p,theta)=>p.map((x,i)=>x+r*(Math.cos(theta)*u[i]+Math.sin(theta)*v[i]));
 for(let i=0;i<n;i++){const theta=2*Math.PI*i/n,next=2*Math.PI*(i+1)/n;
  const p0=ring(A,theta),p1=ring(A,next),p2=ring(B,next),p3=ring(B,theta);
  const shade=.68+.31*Math.cos(theta);
  triangle(out,p0,p1,p2,scale(color,shade));triangle(out,p0,p2,p3,scale(color,shade));
 }
}
const box=(out,b,ox,oy,oz,w,h,d,color)=>cuboid(out,{x:b.x+ox,y:oy,z:b.z+oz,w,h,d,color});
const column=(out,b,ox,oy,oz,r,h,color,n)=>cylinder(out,{x:b.x+ox,y:oy,z:b.z+oz,r,h,color,sides:n});
export function componentAppearance(type,lab){
 const name=String(type||'').toUpperCase();
 if(lab==='quantum')return 'quantum';
 if(/(?:FAN|MOTOR|BLOWER)/.test(name))return 'fan';
 if(/(?:BATTERY|CELL|VOLT|VSOURCE|SOURCE)/.test(name))return 'battery';
 if(/(?:RES\b|RESISTOR)/.test(name))return 'resistor';
 if(/(?:CAP\b|CAPACITOR)/.test(name))return 'capacitor';
 if(/(?:DIODE|LED)/.test(name))return 'diode';
 if(/(?:PROBE|MEASURE|SCOPE)/.test(name))return 'instrument';
 if(/(?:CLOCK|INPUT|SWITCH|CONST)/.test(name))return 'switch';
 if(lab==='cpu'||/(?:CPU|REGISTER|ALU|MEMORY|CACHE)/.test(name))return 'processor';
 if(lab==='chip'||/(?:NMOS|PMOS|TRANSISTOR|OPAMP)/.test(name))return 'chip';
 return 'logic';
}
function model(out,b,selected,detail){
 const y=b.height,kind=componentAppearance(b.type,b.type.startsWith('chip.')?'chip':b.type.startsWith('quantum.')?'quantum':b.type.startsWith('cpu.')?'cpu':'logic');
 const primary=selected?gold:(b.color||blue);
 // Every part has its own removable module on the shared bench.
 box(out,b,0,-.012,0,b.width+.12,.09,b.depth+.12,[0.12,0.22,0.29]);
 box(out,b,0,.07,0,b.width,.085,b.depth,kind==='quantum'?[.10,.18,.31]:[.06,.30,.29]);
 for(const dx of [-b.width*.41,b.width*.41])for(const dz of [-b.depth*.35,b.depth*.35])
  column(out,b,dx,.161,dz,.032,.045,metal,8);
 if(!detail){
  box(out,b,0,.16,0,b.width*.70,Math.max(.08,y*.42),b.depth*.64,primary);
  return kind;
 }
 if(kind==='fan'){
  column(out,b,0,.16,0,.40,.12,metal,16);
  column(out,b,0,.28,0,.30,.04,black,16);
  for(let j=0;j<6;j++){
   const a=Math.PI*2*j/6,dx=Math.cos(a)*.21,dz=Math.sin(a)*.21;
   box(out,b,dx,.325,dz,.36,.018,.12,[.37,.69,.82]);
  }
  column(out,b,0,.33,0,.085,.06,gold,12);
 }else if(kind==='battery'){
  for(const shift of [-.24,.24]){
   column(out,b,shift,.16,0,.19,.42,[.65,.72,.76],16);
   column(out,b,shift,.58,0,.10,.05,gold,12);
   box(out,b,shift,.36,-.198,.19,.12,.018,[.13,.24,.31]);
  }
 }else if(kind==='resistor'){
  box(out,b,0,.20,0,.89,.23,.28,[.84,.73,.51]);
  for(const [i,color] of [gold,[.61,.36,.15],[.14,.18,.20],[.75,.23,.16]].entries())
   box(out,b,-.33+i*.22,.431,0,.066,.014,.29,color);
  for(const shift of [-.68,.68])box(out,b,shift,.27,0,.48,.048,.045,metal);
 }else if(kind==='capacitor'){
  column(out,b,0,.18,0,.23,.46,[.29,.43,.61],16);
  column(out,b,0,.64,0,.21,.025,metal,16);
  box(out,b,0,.27,-.234,.26,.09,.012,[.15,.84,.83]);
 }else if(kind==='diode'){
  for(const x of [-.45,.45])box(out,b,x,.21,0,.36,.045,.05,metal);
  column(out,b,0,.17,0,.23,.29,[.77,.22,.22],16);
  column(out,b,0,.46,0,.18,.02,[1,.64,.25],16);
 }else if(kind==='instrument'){
  box(out,b,0,.16,0,1.3,.40,.67,dark);
  box(out,b,0,.57,-.337,1.05,.012,.08,blue);
  for(const shift of [-.38,-.10,.20,.45])box(out,b,shift,.59,-.337,.065,.012,.084,glow);
  for(const shift of [-.45,.45])column(out,b,shift,.61,.23,.06,.07,metal,10);
 }else if(kind==='switch'){
  box(out,b,0,.17,0,.9,.19,.61,shell);
  box(out,b,-.24,.36,0,.09,.21,.13,gold);
  column(out,b,.22,.36,0,.06,.07,green,10);
 }else if(kind==='quantum'){
  box(out,b,0,.16,0,1.22,.12,.76,[.43,.37,.55]);
  box(out,b,0,.28,0,.87,.07,.51,black);
  for(let i=-2;i<=2;i++){
   box(out,b,i*.13,.36,0,.025,.02,.39,i===0?glow:gold);
  }
  for(let i=-1;i<=1;i++)box(out,b,0,.38,i*.14,.56,.018,.021,glow);
  column(out,b,.54,.17,.30,.035,.08,green,8);
 }else{
  box(out,b,0,.17,0,1.1,.15,.67,kind==='processor'?[.24,.31,.40]:black);
  box(out,b,0,.32,0,.75,.09,.47,primary);
  for(let i=0;i<5;i++)for(const edge of [-1,1]){
   box(out,b,-.38+i*.19,.22,edge*.43,.068,.05,.21,metal);
  }
  if(kind==='processor'){
   for(let j=-2;j<=2;j++)box(out,b,j*.13,.42,0,.064,.18,.45,metal);
  }else{
   box(out,b,0,.415,0,.38,.013,.06,glow);
  }
 }
 return kind;
}
export function experimentBenchMesh(scene,{selectedId=null,detailed=true}={}){
 if(!scene||!Array.isArray(scene.blocks)||!Array.isArray(scene.wires))throw Error('Invalid 3D laboratory scene');
 const mesh=[],lines=[],detail=detailed&&scene.blocks.length<=180;
 const center=scene.center||{x:0,z:0},span=Math.min(Math.max(scene.span+3,9),250);
 // Raised anti-static work surface, edge trim and dark workshop ground.
 cuboid(mesh,{x:center.x,y:-.31,z:center.z,w:span,h:.25,d:span,color:[.13,.19,.25]});
 cuboid(mesh,{x:center.x,y:-.07,z:center.z,w:span-.16,h:.07,d:span-.16,color:[.14,.25,.30]});
 cuboid(mesh,{x:center.x,y:-.35,z:center.z,w:span+.06,h:.035,d:span+.06,color:[.36,.47,.54]});
 // Horizontal embedded guides appear as thin etched metallic traces.
 const n=Math.min(30,Math.floor(span/1.4));
 for(let i=-n;i<=n;i++){
  const v=i*span/(2*n+2);
  const line=(a,b)=>lines.push(...a,...[.15,.33,.37],...b,...[.15,.33,.37]);
  line([center.x-span/2+.3,.012,center.z+v],[center.x+span/2-.3,.012,center.z+v]);
  line([center.x+v,.012,center.z-span/2+.3],[center.x+v,.012,center.z+span/2-.3]);
 }
 const kinds={};
 for(const b of scene.blocks){
  const kind=model(mesh,b,b.id===selectedId,detail);kinds[kind]=(kinds[kind]||0)+1;
  for(const [direction,ports] of [['in',b.ports.incoming],['out',b.ports.outgoing]]){
   for(const port of ports){
    // Endpoint positions match the current scene's canonical interactive ports.
    const list=direction==='out'?b.ports.outgoing:b.ports.incoming;
    const i=list.findIndex(p=>p.id===port.id),z=b.z+((i+1)/(list.length+1)-.5)*b.depth;
    cylinder(mesh,{x:b.x+(direction==='out'?b.width/2:-b.width/2),y:b.height*.7-.03,z,
     r:.065,h:.10,color:direction==='out'?green:blue,sides:10});
   }
  }
 }
 for(const w of scene.wires){
  if(!Array.isArray(w.points)||w.points.length<2)continue;
  const col=w.id===selectedId?gold:[.29,.78,.95];
  for(let i=1;i<w.points.length;i++)tube(mesh,w.points[i-1],w.points[i],.033,col);
 }
 return {triangles:mesh,lines,detail,kinds,
  displayGeometryOnly:true,physicalDimensionsEstablished:false,physicalValidation:'none'};
}
