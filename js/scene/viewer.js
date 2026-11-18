// viewer.js — dependency-free WebGL 3D view of the SAME Diagram used by the labs.
// This renderer is visualization/editing only. It never claims physical fidelity.
import { sceneFromDiagram, worldToDesign, portPoint3D } from './layout.js';
import { experimentBenchMesh } from './experiment-bench.js';

const VERT = `attribute vec3 aPosition;
attribute vec3 aColor;
uniform mat4 uMatrix;
varying vec3 vColor;
void main() { vColor = aColor; gl_Position = uMatrix * vec4(aPosition, 1.0); }`;
const FRAG = `precision mediump float;
varying vec3 vColor;
void main() { gl_FragColor = vec4(vColor, 1.0); }`;
const add = (a,b) => a.map((v,i)=>v+b[i]);
const sub = (a,b) => a.map((v,i)=>v-b[i]);
const mul = (a,s) => a.map(v=>v*s);
const dot = (a,b) => a.reduce((n,v,i)=>n+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>mul(a,1/(Math.hypot(...a)||1));
const clip=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function multiply(a,b) {
  const o=new Float32Array(16);
  for(let c=0;c<4;c++) for(let r=0;r<4;r++)
    for(let k=0;k<4;k++) o[c*4+r]+=a[k*4+r]*b[c*4+k];
  return o;
}
function perspective(fov,aspect,near,far){
  const f=1/Math.tan(fov/2),nf=1/(near-far);
  return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);
}
function viewMatrix(eye,target){
  const forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
  return { forward,right,up,matrix:new Float32Array([
    right[0],up[0],-forward[0],0,
    right[1],up[1],-forward[1],0,
    right[2],up[2],-forward[2],0,
    -dot(right,eye),-dot(up,eye),dot(forward,eye),1,
  ])};
}
function transform(m,p){
  const a=[p[0],p[1],p[2],1];
  const out=[0,0,0,0];
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)out[r]+=m[c*4+r]*a[c];
  return out;
}
function programFor(gl) {
  const shader=(type,src)=>{
    const v=gl.createShader(type);
    gl.shaderSource(v,src);gl.compileShader(v);
    if(!gl.getShaderParameter(v,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(v));
    return v;
  };
  const p=gl.createProgram();
  gl.attachShader(p,shader(gl.VERTEX_SHADER,VERT));
  gl.attachShader(p,shader(gl.FRAGMENT_SHADER,FRAG));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  return p;
}
function cube(mesh,b,selected){
  const x=b.x,z=b.z,w=b.width/2,d=b.depth/2,h=b.height,base=b.baseY||0;
  const p=[[x-w,base,z-d],[x+w,base,z-d],[x+w,base,z+d],[x-w,base,z+d],
    [x-w,base+h,z-d],[x+w,base+h,z-d],[x+w,base+h,z+d],[x-w,base+h,z+d]];
  const faces=[
    [4,5,6,7,1.12],[0,3,2,1,0.36],[0,1,5,4,0.74],
    [1,2,6,5,0.64],[2,3,7,6,0.51],[3,0,4,7,0.88],
  ];
  const col=selected?[1,0.77,0.32]:b.color;
  for(const [a,c,e,f,shade] of faces){
    for(const i of [a,c,e,a,e,f])mesh.push(...p[i],...col.map(v=>clip(v*shade,0,1)));
  }
}
function line(arr,a,b,color){
  arr.push(a[0],a[1],a[2],...color,b[0],b[1],b[2],...color);
}
export class Scene3DView {
  constructor(container,{onSelect=()=>{},onMove=()=>{},onConnect=()=>{},onError=()=>{}}={}){
    this.container=container;this.onSelect=onSelect;this.onMove=onMove;this.onConnect=onConnect;this.onError=onError;
    this.diagram=null;this.selectedId=null;this.wireSource=null;
    this.focusIds=null;this.focusLabel=null;
    this.yaw=0.65;this.pitch=0.78;this.distance=12;this.center=[0,0,0];
    this.root=document.createElement('div');this.root.className='scene3d-root';
    this.root.style.display='none';this.root.setAttribute('aria-label','Interactive three-dimensional electronics workspace');
    this.canvas=document.createElement('canvas');this.canvas.className='scene3d-surface';this.canvas.tabIndex=0;
    this.canvas.setAttribute('aria-label','3D component playground: drag to orbit, wheel to zoom, click a component to select');
    this.overlay=document.createElement('canvas');this.overlay.className='scene3d-overlay';
    this.overlay.setAttribute('aria-hidden','true');
    this.notice=document.createElement('div');this.notice.className='scene3d-help';
    this.notice.textContent='3D MODEL VIEW · drag orbit · click sockets to wire · Shift+drag move · wheel zoom · palette to add';
    this.controls=document.createElement('div');this.controls.className='scene3d-controls';
    const presets=[['isometric','Isometric'],['top','Overhead'],['front','Front'],['fit','Fit scene']];
    for(const [mode,label] of presets){
      const control=document.createElement('button');
      control.type='button';control.textContent=label;control.dataset.preset=mode;
      control.setAttribute('aria-label','3D camera: '+label);
      control.addEventListener('click',()=>this.setCameraPreset(mode));
      this.controls.appendChild(control);
    }
    this.qualification=document.createElement('div');this.qualification.className='scene3d-qualification';
    this.qualification.textContent='ILLUSTRATIVE 3D WORKBENCH  ·  REAL HARDWARE NOT VERIFIED';
    this.selectionCard=document.createElement('div');this.selectionCard.className='scene3d-selection-card';
    this.selectionCard.hidden=true;
    this.root.append(this.canvas,this.overlay,this.controls,this.qualification,this.selectionCard,this.notice);
    container.appendChild(this.root);
    this.available=false;this._raf=0;
    try {
      this.gl=this.canvas.getContext('webgl',{antialias:true,alpha:false});
      if(!this.gl)throw Error('WebGL is unavailable');
      this.program=programFor(this.gl);
      this.buffer=this.gl.createBuffer();
      this.locations={
        position:this.gl.getAttribLocation(this.program,'aPosition'),
        color:this.gl.getAttribLocation(this.program,'aColor'),
        matrix:this.gl.getUniformLocation(this.program,'uMatrix'),
      };
      this.gl.enable(this.gl.DEPTH_TEST);
      this.available=true;
    }catch(e){this.notice.textContent='3D requires WebGL. The 2D editor remains available.';this.onError(String(e.message));}
    this.canvas.addEventListener('pointerdown',e=>this._down(e));
    this.canvas.addEventListener('pointermove',e=>this._move(e));
    this.canvas.addEventListener('pointerup',e=>this._up(e));
    this.canvas.addEventListener('pointercancel',()=>{this.drag=null;});
    this.canvas.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Escape'].includes(e.key))return;
      e.preventDefault();
      if(e.key==='Escape')this.wireSource=null;
      else if(e.key==='ArrowLeft')this.yaw-=.11;
      else if(e.key==='ArrowRight')this.yaw+=.11;
      else if(e.key==='ArrowUp')this.pitch=clip(this.pitch-.09,.18,Math.PI/2-.03);
      else if(e.key==='ArrowDown')this.pitch=clip(this.pitch+.09,.18,Math.PI/2-.03);
      else this.distance=clip(this.distance*(e.key==='+'?.86:1.16),2,180);
      this.requestRender();
    });
    this.canvas.addEventListener('wheel',e=>{
      e.preventDefault();this.distance=clip(this.distance*Math.exp(e.deltaY*0.001),2,180);
      this.requestRender();
    },{passive:false});
    this.resizeObserver=new ResizeObserver(()=>this.resize());
    this.resizeObserver.observe(this.root);
  }
  setCameraPreset(mode){
    switch(mode){
      case 'isometric':this.yaw=.65;this.pitch=.78;break;
      case 'top':this.yaw=0;this.pitch=Math.PI/2-.04;break;
      case 'front':this.yaw=0;this.pitch=.22;break;
      case 'fit':this.fit();break;
      default:throw Error('Unknown 3D camera preset');
    }
    this.controls.querySelectorAll('button').forEach(b=>b.setAttribute(
      'aria-pressed',String(b.dataset.preset===mode)));
    this.requestRender();
  }
  activate(value){
    this.root.style.display=value?'block':'none';
    if(value)this.resize();
  }
  mount(diagram){
    this.diagram=diagram;this.selectedId=null;this.wireSource=null;
    this.focusIds=null;this.focusLabel=null;this.fit();
  }
  sync(){
    if(this.diagram && this.selectedId && !this.diagram.block(this.selectedId))this.selectedId=null;
    if(this.focusIds && ![...this.focusIds].some(id=>this.diagram?.block(id))){
      this.focusIds=null;this.focusLabel=null;
    }
    this.requestRender();
  }
  scene(){
    return sceneFromDiagram(this.diagram,{visibleBlockIds:this.focusIds});
  }
  setFocus(blockIds=null,label=null){
    if(blockIds!==null && (!Array.isArray(blockIds)||!blockIds.length ||
        !blockIds.some(id=>this.diagram?.block(id)))) throw Error('Assembly focus requires existing component IDs');
    this.focusIds=blockIds===null?null:new Set(blockIds);
    this.focusLabel=blockIds===null?null:String(label||'Assembly');
    this.wireSource=null;
    this.selectedId=null;
    this.fit();
  }
  fit(){
    if(!this.diagram)return;
    const scene=this.scene();
    this.center=[scene.center.x,0,scene.center.z];
    this.distance=clip(scene.span*1.9+3,7,150);
    this.requestRender();
  }
  centerDesign(){
    return worldToDesign(this.center[0],this.center[2]);
  }
  camera(){
    const cp=Math.cos(this.pitch);
    const eye=add(this.center,[
      this.distance*cp*Math.sin(this.yaw),
      this.distance*Math.sin(this.pitch),
      this.distance*cp*Math.cos(this.yaw),
    ]);
    const v=viewMatrix(eye,this.center),w=Math.max(1,this.canvas.clientWidth),h=Math.max(1,this.canvas.clientHeight);
    return {...v,eye,matrix:multiply(perspective(Math.PI/4,w/h,0.08,750),v.matrix)};
  }
  project(p,matrix=this.camera().matrix){
    const t=transform(matrix,[p.x,p.y,p.z]);
    if(t[3]<=0)return null;
    return {x:(t[0]/t[3]+1)*this.canvas.clientWidth/2,
      y:(1-t[1]/t[3])*this.canvas.clientHeight/2};
  }
  screenWorld(clientX,clientY){
    const rect=this.canvas.getBoundingClientRect(),cam=this.camera();
    const nx=2*(clientX-rect.left)/Math.max(rect.width,1)-1;
    const ny=1-2*(clientY-rect.top)/Math.max(rect.height,1);
    const fov=Math.PI/4,aspect=Math.max(rect.width,1)/Math.max(rect.height,1);
    const dir=norm(add(add(cam.forward,mul(cam.right,nx*Math.tan(fov/2)*aspect)),
      mul(cam.up,ny*Math.tan(fov/2))));
    if(dir[1]>=-1e-5)return null;
    const t=-cam.eye[1]/dir[1];
    if(t<=0)return null;
    const p=add(cam.eye,mul(dir,t));
    return {x:p[0],z:p[2]};
  }
  designAt(clientX,clientY){
    const p=this.screenWorld(clientX,clientY);
    return p?worldToDesign(p.x,p.z):this.centerDesign();
  }
  pick(clientX,clientY){
    if(!this.diagram)return null;
    const bounds=this.canvas.getBoundingClientRect();
    const x=clientX-bounds.left,y=clientY-bounds.top;
    const cam=this.camera();
    let hit=null,best=44*44;
    for(const block of this.scene().blocks){
      const pt=this.project({x:block.x,y:block.height/2,z:block.z},cam.matrix);
      if(!pt)continue;
      const d=(x-pt.x)**2+(y-pt.y)**2;
      if(d<best){hit=block.id;best=d;}
    }
    return hit;
  }
  pickPort(clientX,clientY){
    if(!this.diagram)return null;
    const rect=this.canvas.getBoundingClientRect();
    const x=clientX-rect.left,y=clientY-rect.top,cam=this.camera();
    let nearest=null,best=17*17;
    for(const block of this.scene().blocks){
      for(const [direction,arr] of [['in',block.ports.incoming],['out',block.ports.outgoing]]){
        for(const port of arr){
          const pos=portPoint3D(block,port.id,direction);
          if(!pos)continue;
          const pt=this.project(pos,cam.matrix);
          if(!pt)continue;
          const distance=(pt.x-x)**2+(pt.y-y)**2;
          if(distance<best){best=distance;nearest={blockId:block.id,portId:port.id,direction};}
        }
      }
    }
    return nearest;
  }
  _down(e){
    if(!this.available)return;
    this.canvas.focus();
    const port=this.pickPort(e.clientX,e.clientY);
    if(port){
      e.preventDefault();
      if(this.wireSource && port.direction==='in'){
        const source=this.wireSource;this.wireSource=null;
        this.onConnect(source.blockId,source.portId,port.blockId,port.portId);
      } else if(port.direction==='out'){
        this.wireSource=port;
        this.selectedId=port.blockId;this.onSelect(port.blockId);
      } else {
        this.wireSource=null;
        this.onError('Select an output socket first, then an input socket.');
      }
      this.requestRender();
      return;
    }
    this.canvas.setPointerCapture(e.pointerId);
    const hit=this.pick(e.clientX,e.clientY);
    this.drag={x:e.clientX,y:e.clientY,prevX:e.clientX,prevY:e.clientY,
      mode:e.shiftKey&&hit?'move':'orbit',selected:hit,moved:false,
      original:hit?this.diagram.block(hit)&&{x:this.diagram.block(hit).x,y:this.diagram.block(hit).y}:null};
    if(hit){this.selectedId=hit;this.onSelect(hit);}
    this.requestRender();
  }
  _move(e){
    const d=this.drag;if(!d)return;
    const dx=e.clientX-d.prevX,dy=e.clientY-d.prevY;
    d.prevX=e.clientX;d.prevY=e.clientY;
    if(Math.abs(e.clientX-d.x)+Math.abs(e.clientY-d.y)>3)d.moved=true;
    if(d.mode==='orbit'){
      this.yaw-=dx*0.008;
      this.pitch=clip(this.pitch+dy*0.007,0.18,Math.PI/2-0.03);
    }
    this.requestRender();
  }
  _up(e){
    const d=this.drag;this.drag=null;
    if(!d)return;
    if(d.mode==='move'&&d.moved&&d.selected){
      const point=this.designAt(e.clientX,e.clientY);
      this.onMove(d.selected,point.x,point.y);
    }
    if(!d.selected&&!d.moved){this.selectedId=null;this.onSelect(null);}
    this.requestRender();
  }
  resize(){
    if(!this.available||this.root.style.display==='none')return;
    const w=Math.max(2,this.root.clientWidth),h=Math.max(2,this.root.clientHeight),dpr=Math.min(devicePixelRatio||1,2);
    this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);
    this.overlay.width=Math.round(w*dpr);this.overlay.height=Math.round(h*dpr);
    this.requestRender();
  }
  requestRender(){
    if(!this.available||this.root.style.display==='none'||this._raf)return;
    this._raf=requestAnimationFrame(()=>{this._raf=0;this.render();});
  }
  render(){
    if(!this.available||!this.diagram||this.root.style.display==='none')return;
    const gl=this.gl,scene=this.scene();
    // Detailed procedural laboratory geometry is derived from the SAME scene.
    // It is a visualization layer, never a second netlist or physical solver.
    const geometry=experimentBenchMesh(scene,{selectedId:this.selectedId});
    const tri=geometry.triangles,lines=geometry.lines;
    for(const group of scene.assemblies){
      cube(tri,{
        x:group.x,z:group.z,baseY:0.002,width:group.width,depth:group.depth,
        height:0.035,color:group.incomplete?[0.48,0.20,0.18]:[0.12,0.32,0.40],
      },false);
    }
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
    gl.clearColor(0.035,0.060,0.093,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.locations.matrix,false,this.camera().matrix);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    gl.enableVertexAttribArray(this.locations.position);
    gl.enableVertexAttribArray(this.locations.color);
    gl.vertexAttribPointer(this.locations.position,3,gl.FLOAT,false,24,0);
    gl.vertexAttribPointer(this.locations.color,3,gl.FLOAT,false,24,12);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tri),gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES,0,tri.length/6);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lines),gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.LINES,0,lines.length/6);
    const ctx=this.overlay.getContext('2d');
    const dpr=this.overlay.width/Math.max(this.canvas.clientWidth,1);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,this.canvas.clientWidth,this.canvas.clientHeight);
    ctx.font='12px system-ui,sans-serif';ctx.textAlign='center';
    const cam=this.camera();
    for(const group of scene.assemblies){
      const pos=this.project({x:group.x,y:0.57,z:group.z},cam.matrix);
      if(!pos)continue;
      ctx.textAlign='center';ctx.font='bold 13px system-ui,sans-serif';
      const label='◈ '+String(group.name||'Assembly').slice(0,40);
      const width=ctx.measureText(label).width+18;
      ctx.fillStyle='rgba(9,36,46,.86)';
      ctx.fillRect(pos.x-width/2,pos.y-15,width,21);
      ctx.fillStyle='#80dfea';
      ctx.fillText(label,pos.x,pos.y);
    }
    ctx.font='12px system-ui,sans-serif';
    for(const b of scene.blocks){
      const pos=this.project({x:b.x,y:b.height+0.28,z:b.z},cam.matrix);
      if(!pos)continue;
      const label=(b.label||b.type).slice(0,25);
      const width=Math.max(52,ctx.measureText(label).width+14);
      ctx.fillStyle=b.id===this.selectedId?'rgba(100,75,29,.95)':'rgba(12,20,31,.85)';
      ctx.fillRect(pos.x-width/2,pos.y-15,width,19);
      ctx.fillStyle=b.id===this.selectedId?'#ffdc85':'#dceaf7';
      ctx.fillText(label,pos.x,pos.y-1);
    }
    const selected=this.diagram.block(this.selectedId);
    this.selectionCard.hidden=!selected;
    if(selected){
      const appearance=scene.blocks.find(b=>b.id===selected.id);
      this.selectionCard.textContent=(appearance?.label||selected.type)+
        '  ·  '+selected.type+'  ·  illustrative model (not dimensional CAD)';
    }
    this.notice.textContent=this.wireSource
      ? `CONNECTING ${this.wireSource.blockId}.${this.wireSource.portId} → select an input socket`
      : `${this.focusLabel ? this.focusLabel+' · ' : ''}3D EXPERIMENT WORKBENCH · ${scene.blocks.length} modules · ${scene.wires.length} connected harnesses · drag orbit · Shift+drag move · click terminals to wire · wheel zoom`;
  }
}
