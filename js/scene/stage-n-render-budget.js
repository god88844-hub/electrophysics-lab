// Phase 83: bounded off-thread scene LOD preprocessing. Renderer keeps the
// original WebGL fallback; 60 FPS is an empirical performance target, not a fact.
export const STAGE_N_RENDER_FORMAT='invention-lab/phase83-lod-instancing/1';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function groupVisibleInstances(instances,{centerX=0,centerZ=0,radius=250,
 maxVisible=50000,lodNear=80,lodFar=220}={}){
 for(const x of [centerX,centerZ,radius,lodNear,lodFar])if(!finite(x))throw Error('Invalid LOD bounds');
 if(radius<=0||lodNear<=0||lodFar<=lodNear||!Number.isInteger(maxVisible)||
    maxVisible<1||maxVisible>100000)throw Error('Invalid LOD policy');
 if(!Array.isArray(instances)||instances.length>200000)throw Error('Scene instance limit exceeded');
 const visible=[];
 for(let i=0;i<instances.length;i++){
  const p=instances[i];if(!p||!finite(p.x)||!finite(p.z)||typeof p.id!=='string')throw Error('Invalid instance');
  const distance=Math.hypot(p.x-centerX,p.z-centerZ);
  if(distance>radius)continue;
  visible.push({id:p.id,x:p.x,z:p.z,lod:distance<lodNear?'high':distance<lodFar?'medium':'proxy',distance});
  if(visible.length===maxVisible)break;
 }
 return {format:STAGE_N_RENDER_FORMAT,total:instances.length,visible:visible.length,
  culled:instances.length-visible.length,instances:visible,instancingRequested:true,
  physicallyVerified:false};
}
export function instancingCapability(gl){
 if(!gl)return {supported:false,backend:'unavailable',reason:'missing-context'};
 const native=typeof gl.drawArraysInstanced==='function';
 const extension=!native&&typeof gl.getExtension==='function'?
  gl.getExtension('ANGLE_instanced_arrays'):null;
 return {supported:!!(native||extension),backend:native?'webgl2':
  extension?'webgl1-angle':'fallback-cpu-batches',reason:native||extension?null:'no-instancing-api'};
}
export async function probeWebGPUAvailability(nav){
 if(!nav?.gpu||typeof nav.gpu.requestAdapter!=='function')
  return {status:'UNAVAILABLE',backend:null,hardwareFpsVerified:false};
 try{
  const adapter=await nav.gpu.requestAdapter({powerPreference:'high-performance'});
  return adapter?{status:'ADAPTER_AVAILABLE',backend:'webgpu',hardwareFpsVerified:false}:
   {status:'UNAVAILABLE',backend:null,hardwareFpsVerified:false};
 }catch(e){return {status:'UNAVAILABLE',backend:null,hardwareFpsVerified:false};}
}

export function boundedFrameReport(frameMs=[],memoryBytes=null){
 if(!Array.isArray(frameMs)||frameMs.length<2||frameMs.length>10000||
    frameMs.some(x=>!finite(x)||x<0))
  throw Error('Frame benchmark requires measured bounded samples');
 const sorted=[...frameMs].sort((a,b)=>a-b);
 const p95=sorted[Math.ceil(sorted.length*.95)-1];
 if(memoryBytes!==null&&(!finite(memoryBytes)||memoryBytes<0))throw Error('Invalid memory measurement');
 return {format:STAGE_N_RENDER_FORMAT,frames:frameMs.length,
  meanFrameMs:frameMs.reduce((x,y)=>x+y,0)/frameMs.length,p95FrameMs:p95,
  meets60FpsAtP95:p95<=1000/60,memoryBytes,
  deviceSpecific:true,benchmarkEvidence:'recorded-timing-only-not-a-guarantee',
  production60FpsGuaranteed:false};
}
export function makeWorkerLODRequest(instances,policy){
 if(!Array.isArray(instances)||instances.length>200000)throw Error('Scene request too large');
 return {kind:'stage-n-lod',version:1,instances,policy};
}
export function createWorkerLODController(createWorker,{onResult=()=>{},onError=()=>{}}={}){
 if(typeof createWorker!=='function')throw Error('Worker constructor callback required');
 let worker=null,sequence=0;
 try{
  worker=createWorker();
  worker.onmessage=e=>{
   if(e.data?.sequence===sequence&&e.data?.status==='ok')onResult(e.data.result);
   else if(e.data?.sequence===sequence)onError(e.data?.error||'Worker LOD failed');
  };
  worker.onerror=e=>onError(e.message||'Worker failure');
 }catch(e){onError(String(e.message));}
 return {
  get available(){return !!worker;},
  update(instances,policy){
   if(!worker)return false;
   sequence++;worker.postMessage({...makeWorkerLODRequest(instances,policy),sequence});
   return true;
  },
  dispose(){worker?.terminate();worker=null;}
 };
}
