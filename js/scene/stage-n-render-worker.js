// Dedicated module worker: pure visibility computation, not a physical solver.
// Never transfers canonical Diagram objects or changes electrical topology.
import {groupVisibleInstances} from './stage-n-render-budget.js';
self.onmessage=(event)=>{
 const {sequence,kind,version,instances,policy}=event.data||{};
 if(kind!=='stage-n-lod'||version!==1){self.postMessage({sequence,status:'error',error:'Unsupported bounded worker message'});return;}
 try{
  const result=groupVisibleInstances(instances,policy);
  self.postMessage({sequence,status:'ok',result});
 }catch(error){self.postMessage({sequence,status:'error',error:String(error.message).slice(0,300)});}
};
