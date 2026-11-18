// Physical-scale parametric visualization — NON-MANUFACTURING component proxies.
// Every vertex derives from an explicit user-entered millimetre envelope or
// user-authored terminal/route. Body styling is NOT a manufacturer CAD part.
import {CAD_MM_PER_WORLD,dimensionedCADMesh} from './dimensioned-cad.js';
const S=CAD_MM_PER_WORLD;
const clamp=v=>Math.max(0,Math.min(1,v));
const shade=(c,k)=>c.map(v=>clamp(v*k));
const steel=[.61,.68,.75],dark=[.12,.17,.22],black=[.07,.085,.11];
const copper=[.86,.49,.24],pcb=[.09,.38,.33],gold=[.95,.7,.25],accent=[.21,.7,.9];
function tri(out,a,b,c,color){
 for(const v of [a,b,c])out.push(v[0]/S,v[1]/S,v[2]/S,...color);
}
function box(out,x,y,z,w,h,d,color){
 if(![x,y,z,w,h,d].every(Number.isFinite)||w<=0||h<=0||d<=0)
  throw Error('Invalid dimensioned component proxy');
 const A=x-w/2,B=x+w/2,C=z-d/2,D=z+d/2,E=y,F=y+h;
 const q=[[A,E,C],[B,E,C],[B,E,D],[A,E,D],
  [A,F,C],[B,F,C],[B,F,D],[A,F,D]];
 for(const [a,b,c,d,k] of [[4,5,6,7,1.2],[0,3,2,1,.42],
  [0,1,5,4,.72],[1,2,6,5,.82],[2,3,7,6,.60],[3,0,4,7,.92]]){
  const col=shade(color,k);
  tri(out,q[a],q[b],q[c],col);tri(out,q[a],q[c],q[d],col);
 }
}
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.hypot(...a);
function cylinder(out,a,b,r,color,n=12){
 if(!Number.isFinite(r)||r<=0)return;
 const axis=sub(b,a),length=norm(axis);
 if(length<1e-8)return;
 const u=axis.map(x=>x/length);
 const ref=Math.abs(u[1])>.9?[1,0,0]:[0,1,0];
 let v=cross(u,ref);const l=norm(v);v=v.map(x=>x/l);
 const w=cross(u,v);
 const rim=(p,angle)=>p.map((x,i)=>x+r*(Math.cos(angle)*v[i]+Math.sin(angle)*w[i]));
 for(let i=0;i<n;i++){
  const q=i*2*Math.PI/n,t=(i+1)*2*Math.PI/n,side=shade(color,.7+.3*Math.cos(q));
  const A=rim(a,q),B=rim(a,t),C=rim(b,t),D=rim(b,q);
  tri(out,A,B,C,side);tri(out,A,C,D,side);
  tri(out,b,C,D,shade(color,1.12));
 }
}
export function physicalComponentStyle(type){
 const t=String(type||'').toUpperCase();
 if(/FAN|MOTOR|BLOWER/.test(t))return 'fan';
 if(/(?:\.VSOURCE|BATTERY|CELL|\.ISOURCE)/.test(t))return 'power-supply';
 if(/(?:\.RES|RESISTOR)/.test(t))return 'axial-resistor';
 if(/(?:\.CAP|CAPACITOR)/.test(t))return 'electrolytic-capacitor';
 if(/(?:\.DIODE|LED)/.test(t))return 'axial-diode';
 if(/(?:\.NMOS|\.PMOS|TRANSISTOR)/.test(t))return 'transistor-package';
 if(/(?:\.AMMETER|\.VOLTMETER|PROBE|SCOPE)/.test(t))return 'instrument';
 if(/(?:\.GND|GROUND)/.test(t))return 'terminal-lug';
 return 'circuit-board';
}
function resistor(out,p,diode=false){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 const rad=Math.min(h*.23,d*.22,w*.13),cy=y+h*.52;
 cylinder(out,[x-w*.45,cy,z],[x+w*.45,cy,z],rad*.16,steel);
 cylinder(out,[x-w*.29,cy,z],[x+w*.29,cy,z],rad,diode?black:[.74,.65,.50]);
 if(diode){
  cylinder(out,[x-w*.17,cy,z],[x-w*.11,cy,z],rad*1.015,steel);
 }else{
  for(const [u,c] of [[-.17,[.4,.22,.10]],[-.08,[.1,.13,.16]],[.04,[.61,.18,.12]],[.19,gold]]){
   cylinder(out,[x+w*u,cy,z],[x+w*(u+.025),cy,z],rad*1.01,c);
  }
 }
}
function capacitor(out,p){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 const r=Math.min(w,d)*.31;
 cylinder(out,[x,y+h*.11,z],[x,y+h*.89,z],r,[.22,.37,.52],16);
 cylinder(out,[x,y+h*.87,z],[x,y+h*.91,z],r*.94,steel,16);
 cylinder(out,[x,y+h*.905,z],[x,y+h*.94,z],r*.43,black,16);
 for(const sx of [-1,1])cylinder(out,[x+sx*r*.48,y,z],
  [x+sx*r*.48,y+h*.12,z],r*.12,copper,8);
}
function supply(out,p){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 box(out,x,y+h*.1,z,w*.88,h*.62,d*.84,[.20,.28,.36]);
 box(out,x,y+h*.39,z-d*.425,w*.69,h*.35,d*.02,black);
 for(const [i,col] of [copper,steel].entries()){
  const px=x+w*(i===0?-.25:.25);
  cylinder(out,[px,y+h*.22,z-d*.47],[px,y+h*.22,z-d*.38],Math.min(w,d,h)*.065,col,10);
  box(out,x+w*(i===0?-.09:.07),y+h*.54,z-d*.44,w*.075,h*.052,d*.03,[.17,.91,.73]);
 }
 box(out,x,y+h*.77,z,w*.72,h*.03,d*.66,steel);
}
function transistor(out,p){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 box(out,x,y+h*.21,z+d*.08,w*.63,h*.54,d*.57,black);
 box(out,x,y+h*.73,z+d*.08,w*.51,h*.13,d*.50,steel);
 cylinder(out,[x,y+h*.73,z+d*.08],[x,y+h*.88,z+d*.08],
  Math.min(w,d)*.075,black,12);
 for(let i=-1;i<=1;i++){
  const px=x+i*w*.19;
  box(out,px,y+h*.05,z-d*.2,Math.min(w*.07,d*.13),h*.28,d*.07,steel);
 }
}
function instrument(out,p){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 box(out,x,y+h*.08,z,w*.93,h*.68,d*.88,[.18,.23,.30]);
 box(out,x,y+h*.34,z-d*.452,w*.69,h*.40,d*.025,[.045,.14,.17]);
 for(let i=-2;i<=2;i++)box(out,x+i*w*.115,y+h*.63,z-d*.472,
  w*.055,h*.05,d*.018,[.19,.86,.65]);
 for(let i=-1;i<=1;i++)cylinder(out,[x+i*w*.24,y+h*.15,z-d*.51],
  [x+i*w*.24,y+h*.15,z-d*.42],Math.min(w,d)*.06,i===0?copper:steel,8);
}
function fan(out,p){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 const r=Math.min(w,d)*.43;
 box(out,x,y+h*.02,z,w*.94,h*.20,d*.94,[.12,.21,.26]);
 // circular metal ring and central hub: fan blades stay within the declared envelope
 for(let i=0;i<20;i++){
  const a=i*2*Math.PI/20,b=(i+1)*2*Math.PI/20;
  cylinder(out,[x+r*Math.cos(a),y+h*.57,z+r*Math.sin(a)],
   [x+r*Math.cos(b),y+h*.57,z+r*Math.sin(b)],
   Math.min(w,d,h)*.027,steel,6);
 }
 cylinder(out,[x,y+h*.27,z],[x,y+h*.73,z],r*.22,dark,16);
 for(let i=0;i<7;i++){
  const ang=i*2*Math.PI/7;
  const bx=x+r*.48*Math.cos(ang),bz=z+r*.48*Math.sin(ang);
  box(out,bx,y+h*.62,bz,r*.82,h*.045,r*.21,[.32,.69,.75]);
 }
 cylinder(out,[x,y+h*.71,z],[x,y+h*.77,z],r*.13,gold,12);
}
function board(out,p){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 box(out,x,y+h*.08,z,w*.92,h*.15,d*.90,pcb);
 box(out,x,y+h*.24,z,w*.53,h*.32,d*.51,dark);
 box(out,x,y+h*.56,z,w*.38,h*.045,d*.35,[.25,.38,.52]);
 for(let i=-3;i<=3;i++){
  for(const j of [-1,1]){
   box(out,x+i*w*.10,y+h*.25,z+j*d*.33,w*.05,h*.06,d*.17,steel);
   box(out,x+i*w*.10,y+h*.17,z+j*d*.38,w*.033,h*.025,d*.13,gold);
  }
 }
 for(let i=-2;i<=2;i++)box(out,x+i*w*.14,y+h*.17,z+d*.15,
  w*.025,h*.012,d*.27,copper);
}
function lug(out,p){
 const {xMm:x,yMm:y,zMm:z,widthMm:w,heightMm:h,depthMm:d}=p;
 box(out,x,y+h*.1,z,w*.78,h*.13,d*.68,steel);
 cylinder(out,[x,y+h*.22,z],[x,y+h*.65,z],Math.min(w,d)*.14,gold,14);
 cylinder(out,[x,y+h*.65,z],[x,y+h*.71,z],Math.min(w,d)*.22,steel,14);
}
function physicalPart(out,p){
 switch(physicalComponentStyle(p.type)){
  case 'axial-resistor':resistor(out,p);break;
  case 'axial-diode':resistor(out,p,true);break;
  case 'electrolytic-capacitor':capacitor(out,p);break;
  case 'power-supply':supply(out,p);break;
  case 'transistor-package':transistor(out,p);break;
  case 'instrument':instrument(out,p);break;
  case 'fan':fan(out,p);break;
  case 'terminal-lug':lug(out,p);break;
  default:board(out,p);
 }
}
export function detailedCADMesh(report,{selectedId=null,routing=null}={}){
 if(!report||!Array.isArray(report.parts))throw Error('A dimensioned assembly is required');
 if(report.parts.length>500)throw Error('Too many dimensioned components to render');
 const base=dimensionedCADMesh(report,{selectedId});
 const mesh=[],kinds={},lines=[...base.lines];
 for(const p of report.parts){
  physicalPart(mesh,p);
  const kind=physicalComponentStyle(p.type);
  kinds[kind]=(kinds[kind]||0)+1;
  if(selectedId===p.id){
   const b=p.bounds,outline=[b.x0,b.x1,b.y0,b.y1,b.z0,b.z1];
   if(!outline.every(Number.isFinite))throw Error('Nonfinite selection outline');
   // Selected body is outlined by a thin highlight line above its footprint.
   const Y=(b.y1+.05)/S,col=gold,points=[
    [b.x0/S,Y,b.z0/S],[b.x1/S,Y,b.z0/S],[b.x1/S,Y,b.z1/S],[b.x0/S,Y,b.z1/S]];
   for(let i=0;i<4;i++){const a=points[i],b=points[(i+1)%4];
    lines.push(...a,...col,...b,...col);}
  }
 }
 let harnessCount=0,terminalCount=0;
 if(routing){
  if(!Array.isArray(routing.routes)||!Array.isArray(routing.terminals)||
     routing.invalidIds?.length)throw Error('Physical routed scene requires internally consistent anchors');
  for(const terminal of routing.terminals){
   const [x,y,z]=[terminal.globalMm.xMm,terminal.globalMm.yMm,terminal.globalMm.zMm];
   const markerR=.2; // generic 0.2 mm visual point marker, NOT a connector footprint
   cylinder(mesh,[x,y,z],[x,y+.45,z],markerR,gold,10);
   terminalCount++;
  }
  for(const route of routing.routes){
   const points=route.pointsMm,rad=route.diameterMm/2;
   const metal=route.material==='copper'?copper:steel;
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];
    cylinder(mesh,[a.xMm,a.yMm,a.zMm],[b.xMm,b.yMm,b.zMm],rad,metal,10);
   }
   harnessCount++;
  }
 }
 if(mesh.length>1_800_000||!mesh.every(Number.isFinite)||!lines.every(Number.isFinite))
  throw Error('Oversized or nonfinite dimensional mesh');
 return {...base,triangles:mesh,lines,
  kinds,terminalCount,harnessCount,componentRepresentation:'procedural proxy fitted inside entered bounding boxes',
  physicalDimensionsEstablished:report.parts.length>0,
  actualTerminalsMapped:terminalCount>0,
  actualHarnessPathsEntered:harnessCount>0,
  displayGeometryOnly:true,manufacturerCAD:false,measuredHardware:false,
  physicalValidation:'none'};
}
