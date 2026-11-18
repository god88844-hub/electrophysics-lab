// viewer.js — dependency-free WebGL 3D view of the SAME Diagram used by the labs.
// This renderer is visualization/editing only. It never claims physical fidelity.
import { sceneFromDiagram, worldToDesign, portPoint3D } from './layout.js';
import { experimentBenchMesh } from './experiment-bench.js';
import { attachPhysicalWireEditor } from './wire-setup-ui.js';
import { attachEngineeringWorkbench } from './engineering-ui.js';
import { dimensionedAssembly,dimensionedCADMesh } from './dimensioned-cad.js';
import { captureExperimentTrace,isExperimentCurrent,experimentReadingsAt,exportExperimentRecord } from './experiment-trace.js';

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
  constructor(container,{onSelect=()=>{},onMove=()=>{},onConnect=()=>{},onError=()=>{},onPhysicalLayoutChange=()=>{}}={}){
    this.container=container;this.onSelect=onSelect;this.onMove=onMove;this.onConnect=onConnect;this.onError=onError;
    this.diagram=null;this.selectedId=null;this.wireSource=null;
    this.experiment=null;this.experimentIndex=0;this.experimentPlaying=false;this.experimentRAF=0;this.experimentTickAt=0;
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

    this.experimentPanel=document.createElement('section');
    this.experimentPanel.className='scene3d-experiment-panel';
    this.experimentPanel.setAttribute('aria-label','Simulation-linked 3D experiment instruments');
    const heading=document.createElement('div');
    heading.className='scene3d-experiment-title';
    heading.textContent='SIMULATION INSTRUMENTS';
    this.experimentStatus=document.createElement('div');
    this.experimentStatus.className='scene3d-experiment-status';
    this.experimentStatus.setAttribute('role','status');
    const timeline=document.createElement('div');timeline.className='scene3d-experiment-timeline';
    this.experimentPlay=document.createElement('button');
    this.experimentPlay.type='button';this.experimentPlay.textContent='▶';
    this.experimentPlay.setAttribute('aria-label','Play simulated trace');
    this.experimentPlay.addEventListener('click',()=>this.toggleExperimentPlayback());
    this.experimentSlider=document.createElement('input');
    this.experimentSlider.type='range';this.experimentSlider.min='0';
    this.experimentSlider.max='0';this.experimentSlider.step='1';this.experimentSlider.value='0';
    this.experimentSlider.setAttribute('aria-label','Experiment timeline sample');
    this.experimentSlider.addEventListener('input',()=>{
      this.stopExperimentPlayback();this.experimentIndex=Number(this.experimentSlider.value);
      this.updateExperimentPanel();this.requestRender();
    });
    this.experimentTime=document.createElement('span');this.experimentTime.className='scene3d-experiment-time';
    timeline.append(this.experimentPlay,this.experimentSlider,this.experimentTime);
    this.experimentReadouts=document.createElement('div');
    this.experimentReadouts.className='scene3d-experiment-readings';
    this.experimentExport=document.createElement('button');this.experimentExport.type='button';
    this.experimentExport.textContent='Save experiment JSON';
    this.experimentExport.addEventListener('click',()=>this.downloadExperiment());
    const qualifier=document.createElement('div');qualifier.className='scene3d-experiment-qualifier';
    qualifier.textContent='SIMULATOR OUTPUT ONLY · NOT PHYSICAL MEASUREMENT';
    this.experimentPanel.append(heading,this.experimentStatus,timeline,
      this.experimentReadouts,this.experimentExport,qualifier);
    this.root.append(this.canvas,this.overlay,this.controls,this.qualification,this.selectionCard,this.experimentPanel,this.notice);
    this.updateExperimentPanel();
    container.appendChild(this.root);
    this.wireSetup=attachPhysicalWireEditor(this.root,this.controls,()=>this.diagram,
      ()=>onPhysicalLayoutChange(),message=>this.onError(message));
    this.engineering=attachEngineeringWorkbench(this.root,this.controls,()=>this.diagram,
      ()=>onPhysicalLayoutChange(),message=>this.onError(message),()=>this.fit());
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

  stopExperimentPlayback(){
    this.experimentPlaying=false;this.experimentTickAt=0;
    if(this.experimentRAF){cancelAnimationFrame(this.experimentRAF);this.experimentRAF=0;}
    if(this.experimentPlay)this.experimentPlay.textContent='▶';
  }
  toggleExperimentPlayback(){
    if(!this.experiment||!isExperimentCurrent(this.experiment,this.diagram)||
       this.experiment.axis.length<2)return;
    if(this.experimentPlaying){this.stopExperimentPlayback();return;}
    this.experimentPlaying=true;this.experimentPlay.textContent='❚❚';
    const tick=(now)=>{
      this.experimentRAF=0;
      if(!this.experimentPlaying)return;
      if(!this.experimentTickAt)this.experimentTickAt=now;
      // Explicitly illustrative time-lapse playback, not physical wall-clock timing.
      if(now-this.experimentTickAt>=180){
        const n=this.experiment.axis.length;
        this.experimentIndex=(this.experimentIndex+1)%n;
        this.experimentTickAt=now;
        this.updateExperimentPanel();this.requestRender();
      }
      this.experimentRAF=requestAnimationFrame(tick);
    };
    this.experimentRAF=requestAnimationFrame(tick);
  }
  setExperiment(diagram,result){
    if(!diagram||diagram!==this.diagram)return;
    this.stopExperimentPlayback();
    try {this.experiment=captureExperimentTrace(diagram,result);}
    catch(e){
      this.experiment={status:'unavailable',reason:'Trace unavailable: '+String(e.message)};
    }
    this.experimentIndex=0;this.updateExperimentPanel();this.requestRender();
  }
  updateExperimentPanel(){
    if(!this.experimentPanel)return;
    const current=this.experiment&&isExperimentCurrent(this.experiment,this.diagram);
    const e=current?this.experiment:null;
    if(this.experiment&&!current&&this.experiment.status==='ready'){
      this.stopExperimentPlayback();this.experiment=null;
    }
    this.experimentStatus.textContent=e
      ? 'Model: '+e.analysis+' · '+e.sourceSamples+' solver samples · physical validity UNKNOWN'
      : this.experiment?.reason||'Press ▶ Run to connect solver readings';
    const size=e?.axis.length||0;
    this.experimentSlider.disabled=size<2;
    this.experimentSlider.max=String(Math.max(0,size-1));
    this.experimentIndex=Math.max(0,Math.min(this.experimentIndex,Math.max(0,size-1)));
    this.experimentSlider.value=String(this.experimentIndex);
    this.experimentPlay.disabled=size<2;
    this.experimentExport.disabled=!e;
    const step=e?.axis[this.experimentIndex];
    this.experimentTime.textContent=e
      ? (Number.isFinite(step)?Number(step).toPrecision(5):'—')+' '+e.axisUnit+
        ' · '+(this.experimentIndex+1)+'/'+size
      : 'No trace';
    this.experimentReadouts.replaceChildren();
    const readings=e?experimentReadingsAt(e,this.experimentIndex,{
      selectedBlockId:this.selectedId,limit:5
    }):[];
    for(const item of readings){
      const line=document.createElement('div');line.className='scene3d-experiment-reading';
      const label=document.createElement('span');label.textContent=item.label;
      const value=document.createElement('strong');
      value.textContent=(typeof item.value==='number'
        ? Number(item.value).toPrecision(5):String(item.value))+' '+item.unit;
      line.append(label,value);this.experimentReadouts.append(line);
    }
    if(!readings.length){
      const p=document.createElement('div');p.className='scene3d-experiment-empty';
      p.textContent=e?.reason||'Add a connected probe or voltmeter to collect readings.';
      this.experimentReadouts.appendChild(p);
    }
  }
  downloadExperiment(){
    if(!this.experiment||!isExperimentCurrent(this.experiment,this.diagram)){
      this.onError('No current trace. Run the simulator after modifying the design.');return;
    }
    try{
      const record=exportExperimentRecord(this.experiment,this.diagram);
      const bytes=JSON.stringify(record,null,2);
      const uri=URL.createObjectURL(new Blob([bytes],{type:'application/json'}));
      const a=document.createElement('a');a.href=uri;
      a.download='invention-lab-'+this.diagram.lab+'-simulated-experiment.json';
      a.click();
      setTimeout(()=>URL.revokeObjectURL(uri),1000);
    }catch(e){this.onError('Experiment export failed: '+e.message);}
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
    if(!value)this.stopExperimentPlayback();
    this.root.style.display=value?'block':'none';
    if(value)this.resize();
  }
  mount(diagram){
    this.stopExperimentPlayback();this.experiment=null;this.experimentIndex=0;
    this.diagram=diagram;this.selectedId=null;this.wireSource=null;
    this.focusIds=null;this.focusLabel=null;this.fit();this.updateExperimentPanel();
    this.wireSetup.sync({keepSelection:false});this.engineering.sync();
  }
  sync(){
    if(this.diagram && this.selectedId && !this.diagram.block(this.selectedId))this.selectedId=null;
    if(this.focusIds && ![...this.focusIds].some(id=>this.diagram?.block(id))){
      this.focusIds=null;this.focusLabel=null;
    }
    if(this.experiment&&!isExperimentCurrent(this.experiment,this.diagram)){
      this.stopExperimentPlayback();this.experiment=null;
    }
    this.wireSetup.sync();this.engineering.sync();
    this.updateExperimentPanel();this.requestRender();
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
    if(this.engineering?.mode){
      try{
        const cad=dimensionedCADMesh(dimensionedAssembly(this.diagram));
        this.center=[cad.center.x,0,cad.center.z];
        this.distance=clip(cad.span*1.9+3,7,150);
        this.requestRender();
        return;
      }catch(e){this.onError('CAD camera fit failed: '+e.message);}
    }
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
    const cadParts=this.engineering.mode?dimensionedAssembly(this.diagram).parts:null;
    const candidates=cadParts||this.scene().blocks;
    for(const block of candidates){
      const pt=this.project(cadParts?{x:block.xMm/20,y:(block.yMm+block.heightMm/2)/20,z:block.zMm/20}
        :{x:block.x,y:block.height/2,z:block.z},cam.matrix);
      if(!pt)continue;
      const d=(x-pt.x)**2+(y-pt.y)**2;
      if(d<best){hit=block.id;best=d;}
    }
    return hit;
  }
  pickPort(clientX,clientY){
    // CAD envelopes have no validated pad footprints or physical port coordinates.
    if(!this.diagram||this.engineering.mode)return null;
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
    if(d.mode==='move'&&d.moved&&d.selected&&this.engineering.mode){
      this.onError('Shift-drag schematic movement disabled in mm CAD mode; edit explicit mm fields.');
    } else if(d.mode==='move'&&d.moved&&d.selected){
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
    let geometry=experimentBenchMesh(scene,{selectedId:this.selectedId});
    if(this.engineering.mode){
      try{geometry=dimensionedCADMesh(dimensionedAssembly(this.diagram),{selectedId:this.selectedId});}
      catch(error){this.onError('Invalid dimensional CAD: '+error.message);return;}
    }
    const tri=geometry.triangles,lines=geometry.lines;
    for(const group of (this.engineering.mode?[]:scene.assemblies)){
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
    for(const group of (this.engineering.mode?[]:scene.assemblies)){
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
    const currentTrace=isExperimentCurrent(this.experiment,this.diagram)?this.experiment:null;
    const measuredByBlock=new Map();
    for(const track of currentTrace?.tracks||[]){
      if(track.blockId&&!measuredByBlock.has(track.blockId)){
        const value=track.values[this.experimentIndex];
        if(value!==undefined)
          measuredByBlock.set(track.blockId,
            (typeof value==='number'?value.toPrecision(4):String(value))+' '+track.unit);
      }
    }
    ctx.font='12px system-ui,sans-serif';
    for(const b of scene.blocks){
      const cadPart=this.engineering.mode?dimensionedAssembly(this.diagram).parts.find(x=>x.id===b.id):null;
      if(this.engineering.mode&&!cadPart)continue;
      const pos=this.project(cadPart?{x:cadPart.xMm/20,
        y:(cadPart.yMm+cadPart.heightMm)/20+.28,z:cadPart.zMm/20}
        :{x:b.x,y:b.height+0.28,z:b.z},cam.matrix);
      if(!pos)continue;
      const label=(b.label||b.type).slice(0,25);
      const width=Math.max(52,ctx.measureText(label).width+14);
      ctx.fillStyle=b.id===this.selectedId?'rgba(100,75,29,.95)':'rgba(12,20,31,.85)';
      ctx.fillRect(pos.x-width/2,pos.y-15,width,19);
      ctx.fillStyle=b.id===this.selectedId?'#ffdc85':'#dceaf7';
      ctx.fillText(label,pos.x,pos.y-1);
      if(measuredByBlock.has(b.id)){
        const value=measuredByBlock.get(b.id);
        ctx.font='bold 11px system-ui,sans-serif';
        const w=ctx.measureText(value).width+12;
        ctx.fillStyle='rgba(9,43,42,.95)';
        ctx.fillRect(pos.x-w/2,pos.y+3,w,19);
        ctx.fillStyle='#8cfbd4';
        ctx.fillText(value,pos.x,pos.y+17);
        ctx.font='12px system-ui,sans-serif';
      }
    }
    this.updateExperimentPanel();
    const selected=this.diagram.block(this.selectedId);
    this.selectionCard.hidden=!selected;
    if(selected){
      const appearance=scene.blocks.find(b=>b.id===selected.id);
      this.selectionCard.textContent=(appearance?.label||selected.type)+
        '  ·  '+selected.type+(this.engineering.mode?'  ·  entered mm CAD envelope (not manufacturing geometry)'
          :'  ·  illustrative model (not dimensional CAD)');
    }
    this.notice.textContent=this.wireSource
      ? `CONNECTING ${this.wireSource.blockId}.${this.wireSource.portId} → select an input socket`
      : `${this.focusLabel ? this.focusLabel+' · ' : ''}${this.engineering.mode?'DIMENSIONED CAD ENVELOPES (20 mm/unit) · MODEL ONLY':'3D EXPERIMENT WORKBENCH'} · ${scene.blocks.length} modules · ${scene.wires.length} connected harnesses · drag orbit · Shift+drag move · click terminals to wire · wheel zoom`;
  }
}
