// Staged 3D UI integration; keeps canonical editing and physical gates intact.
import {planSnapPart,commitSnapPart,commitAutoManhattanHarness} from './stage-n-snap-build.js';
import {ZOOM_LEVELS,semanticDistance,semanticZoomState} from './stage-n-semantic-zoom.js';
import {overlayFromExperiment,inferSignalFromVoltageReadings} from './stage-n-live-overlay.js';
import {blochFromDensity,coherenceDecay,hardwareQuantumLayout} from './stage-n-quantum-view.js';
import {ACADEMY_MISSIONS,academyProgress} from './stage-n-academy.js';
import {instancingCapability,probeWebGPUAvailability,createWorkerLODController} from './stage-n-render-budget.js';
const element=(doc,tag,label)=>{const el=doc.createElement(tag);if(label)el.textContent=label;return el;};
const option=(doc,select,value,label)=>{const o=element(doc,'option',label);o.value=value;select.append(o);};
const field=(doc,label,value)=>{
 const input=element(doc,'input');input.type='number';input.step='any';input.value=String(value);input.setAttribute('aria-label',label);return input;
};
export function attachStageNWorkbench(viewer,onPhysicalLayoutChange){
 const d=viewer.root.ownerDocument,root=viewer.root;
 const toggle=element(d,'button','3D Sandbox (Stages 78–83)');toggle.type='button';
 toggle.dataset.action='stage-n-sandbox';toggle.setAttribute('aria-expanded','false');
 const panel=element(d,'section');panel.hidden=true;panel.className='scene3d-wire-editor';
 panel.setAttribute('aria-label','Stage N interactive 3D engineering sandbox');
 const title=element(d,'strong','Interactive 3D engineering sandbox');
 const note=element(d,'p','Models are visualization/solver previews, not measured hardware or calibrated transistor physics.');
 const zoom=element(d,'select');zoom.setAttribute('aria-label','Semantic physical zoom scale');
 for(const level of ZOOM_LEVELS)option(d,zoom,level.id,level.label);
 zoom.value='chip';
 const zoomStatus=element(d,'output');zoomStatus.setAttribute('aria-live','polite');
 const snapTitle=element(d,'strong','Snap placement in explicit mm');
 const px=field(d,'Snap X millimetres',0),pz=field(d,'Snap Z millimetres',0);
 const spacing=field(d,'Snap grid spacing millimetres',2);
 const quarter=element(d,'select');quarter.setAttribute('aria-label','Rotate part in quarter turns');
 for(const [value,label] of [['0','0°'],['1','90°'],['2','180°'],['3','270°']])option(d,quarter,value,label);
 const place=element(d,'button','Snap selected part');place.type='button';place.dataset.action='stage-n-snap-part';
 const route=element(d,'button','Auto-route selected canonical wire');route.type='button';
 route.dataset.action='stage-n-auto-route';
 const wire=element(d,'select');wire.setAttribute('aria-label','Stage N canonical wire route target');
 const snapResult=element(d,'output');snapResult.setAttribute('aria-live','polite');
 const vizTitle=element(d,'strong','Signal and simulated thermal visualization');
 const radix=element(d,'select');radix.setAttribute('aria-label','Stage N signal radix');
 for(const [v,label] of [['2','Binary'],['3','Balanced ternary'],['4','Q4']])option(d,radix,v,label);
 const minRail=field(d,'Signal minimum rail V',0);
 const maxRail=field(d,'Signal maximum rail V',3.3);
 const visualStatus=element(d,'output');visualStatus.setAttribute('aria-live','polite');
 const quantumTitle=element(d,'strong','Quantum state / hardware (reference models)');
 const technology=element(d,'select');technology.setAttribute('aria-label','Quantum hardware proxy technology');
 option(d,technology,'transmon','Superconducting transmon');option(d,technology,'trapped-ion','Trapped ion');
 const quantumButton=element(d,'button','Show reference Bloch state');quantumButton.type='button';
 const quantumResult=element(d,'output');quantumResult.setAttribute('aria-live','polite');
 const academyTitle=element(d,'strong','Build From Scratch academy');
 const mission=element(d,'select');mission.setAttribute('aria-label','Stage N academy mission');
 for(const m of ACADEMY_MISSIONS)option(d,mission,m.id,m.title);
 const academyButton=element(d,'button','Validate mission build');academyButton.type='button';
 const academyResult=element(d,'output');academyResult.setAttribute('aria-live','polite');
 const performance=element(d,'output');performance.setAttribute('aria-live','polite');
 const instancing=instancingCapability(viewer.gl);
 performance.textContent='WebGL instancing '+instancing.backend+'; WebGPU checking; 100K/60 FPS not benchmark-verified.';
 probeWebGPUAvailability(globalThis.navigator).then(r=>{
  if(!performance.isConnected)return;
  performance.textContent='WebGL '+instancing.backend+' · WebGPU '+r.status+
    ' · 100K/60 FPS NOT VERIFIED';
 });
 panel.append(title,note,zoom,zoomStatus,snapTitle,px,pz,spacing,quarter,
  place,wire,route,snapResult,vizTitle,radix,minRail,maxRail,visualStatus,quantumTitle,
  technology,quantumButton,quantumResult,academyTitle,mission,academyButton,
  academyResult,performance);
 root.append(panel);viewer.controls.append(toggle);
 let worker=null;
 if(typeof Worker==='function'){
  worker=createWorkerLODController(()=>new Worker(new URL('./stage-n-render-worker.js',import.meta.url),{type:'module'}),
   {onResult:r=>{performance.textContent='LOD indexed '+r.visible+'/'+r.total+
     ' visible; GPU '+instancing.backend+'; 60 FPS NOT VERIFIED';},
    onError:e=>{performance.textContent='LOD worker unavailable: '+e;}});
 }
 function update(){
  if(!viewer.diagram)return;
  const state=semanticZoomState(viewer.distance,{lab:viewer.diagram.lab,
   hasSimulation:viewer.experiment?.status==='ready'});
  zoom.value=state.level;zoomStatus.textContent=state.label+' · '+state.desiredSolver+
   ' · '+state.reason;
  const keep=wire.value;
  wire.replaceChildren();
  for(const w of viewer.diagram.wires)option(d,wire,w.id,w.id);
  if([...wire.options].some(o=>o.value===keep))wire.value=keep;
  const selected=viewer.diagram.meta?.dimensionedCAD?.parts?.[viewer.selectedId];
  if(selected){px.value=String(selected.xMm);pz.value=String(selected.zMm);}
  visualStatus.textContent=viewer.experiment?.status==='ready'?
    'Live from captured existing-solver trace (model-only)':'No current solver trace; visual signals are illustrative';
 }
 toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;
  toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)update();});
 zoom.addEventListener('change',()=>{viewer.distance=semanticDistance(zoom.value);
  viewer.requestRender();update();});
 place.addEventListener('click',()=>{
  try{
   if(!viewer.selectedId)throw Error('Select a canonical part before placement');
   const id=viewer.selectedId;
   const opts={xMm:Number(px.value),zMm:Number(pz.value),spacingMm:Number(spacing.value),
    rotationQuarterTurns:Number(quarter.value)};
   planSnapPart(viewer.diagram,id,opts);
   const saved=commitSnapPart(viewer.diagram,id,opts);
   onPhysicalLayoutChange();viewer.requestRender();
   snapResult.textContent='Snapped '+id+' in model-only mm coordinates; hardware NOT verified';
  }catch(e){snapResult.textContent='Placement refused: '+e.message;viewer.onError(e.message);}
 });
 route.addEventListener('click',()=>{
  try{
   const result=commitAutoManhattanHarness(viewer.diagram,wire.value);
   onPhysicalLayoutChange();viewer.requestRender();
   snapResult.textContent='Manhattan route '+result.wireId+' saved with '+result.waypointsMm.length+
     ' waypoints; geometrical model only';
  }catch(e){snapResult.textContent='Auto-route refused: '+e.message;viewer.onError(e.message);}
 });
 radix.addEventListener('change',()=>{
  if(radix.value==='3'){minRail.value='-1.1';maxRail.value='1.1';}
  else{minRail.value='0';maxRail.value='3.3';}
  viewer.requestRender();
 });
 minRail.addEventListener('change',()=>viewer.requestRender());
 maxRail.addEventListener('change',()=>viewer.requestRender());
 quantumButton.addEventListener('click',()=>{
  try{
   if(viewer.diagram?.lab!=='quantum')throw Error('Switch to canonical quantum lab');
   const ref=blochFromDensity([[{re:1,im:0},{re:0,im:0}],
    [{re:0,im:0},{re:0,im:0}]]);
   const hardware=hardwareQuantumLayout({technology:technology.value,qubits:2});
   const coherence=coherenceDecay({});
   quantumResult.textContent='Illustrative |0> Bloch r='+ref.radius+
    '; '+hardware.technology+' '+hardware.nodes.length+' site proxies. T1/T2 '+coherence.status+
    '. NOT a live Qiskit or device measurement.';
  }catch(e){quantumResult.textContent=e.message;}
 });
 academyButton.addEventListener('click',()=>{
  const selected=ACADEMY_MISSIONS.find(x=>x.id===mission.value);
  const result=academyProgress(mission.value,{diagram:viewer.diagram,solverResult:viewer.experiment});
  academyResult.textContent=selected.title+': '+result.status+
   ' · next mission '+(result.nextUnlocked?'unlocked':'LOCKED');
 });
 function drawOverlay(ctx,scene){
  if(panel.hidden||!viewer.diagram)return;
  const level=semanticZoomState(viewer.distance,{lab:viewer.diagram.lab,
   hasSimulation:viewer.experiment?.status==='ready'});
  zoomStatus.textContent=level.label+' · '+level.reason;
  const base=Number(radix.value);
  const data=overlayFromExperiment(viewer.diagram,viewer.experiment,viewer.experimentIndex,
   {base,selectedBlockId:viewer.selectedId});
  if(data.status!=='SIMULATED_SNAPSHOT'||!scene.wires.length)return;
  // Signal pulse is explicitly a visualization of available model frames;
  // no invented voltage value is associated with the line color.
  const signal=inferSignalFromVoltageReadings(data.markers,{
   base,minRailV:Number(minRail.value),maxRailV:Number(maxRail.value)});
  if(signal.status!=='RESOLVED_MODEL_ONLY'){
   visualStatus.textContent='Cannot color wires: '+signal.reason+'; no fabricated logic state';
   return;
  }
  visualStatus.textContent='Solver snapshot '+signal.sourceLabel+' = '+
   signal.sourceVoltageV+' V · ideal level '+signal.level+' (NOT hardware-qualified)';
  const rgba=signal.visual.rgb.map(x=>Math.round(x*255)).join(',');
  const wireModel=scene.wires.slice(0,500);
  ctx.save();ctx.strokeStyle='rgba('+rgba+',0.7)';ctx.lineWidth=2;
  for(const w of wireModel){
   const a=viewer.project(w.from),b=viewer.project(w.to);
   if(!a||!b)continue;
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  ctx.restore();
 }
 function dispose(){worker?.dispose();panel.remove();toggle.remove();}
 return {toggle,panel,zoom,zoomStatus,place,route,radix,quantumButton,
  academyButton,academyResult,performance,worker,update,drawOverlay,dispose};
}
