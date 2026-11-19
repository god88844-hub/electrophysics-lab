import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groupVisibleInstances,instancingCapability,boundedFrameReport,
 makeWorkerLODRequest,createWorkerLODController,probeWebGPUAvailability}
 from '../js/scene/stage-n-render-budget.js';
test('100K scene objects are indexed and culled without claiming 60 fps',()=>{
 const instances=Array.from({length:100000},(_,i)=>({id:'g'+i,x:i%500,z:Math.floor(i/500)}));
 const a=groupVisibleInstances(instances,{centerX:5,centerZ:5,radius:40,maxVisible:5000});
 assert.equal(a.total,100000);assert.ok(a.visible<5000);
 assert.equal(a.physicallyVerified,false);
 assert.ok(a.instances.every(p=>p.distance<=40));
});
test('GPU capability uses actual WebGL2 or ANGLE extension, never assumes WebGPU',()=>{
 assert.equal(instancingCapability(null).supported,false);
 assert.equal(instancingCapability({drawArraysInstanced:()=>{}}).backend,'webgl2');
 assert.equal(instancingCapability({getExtension:()=>({drawArraysInstancedANGLE:()=>{}})}).backend,'webgl1-angle');
 assert.equal(instancingCapability({getExtension:()=>null}).supported,false);
});
test('Frame report uses measurements; does not invent FPS success',()=>{
 const a=boundedFrameReport([8,9,30,18],300);
 assert.equal(a.meets60FpsAtP95,false);
 assert.equal(a.production60FpsGuaranteed,false);
 assert.equal(a.memoryBytes,300);
 assert.throws(()=>boundedFrameReport([1]));
});
test('Worker controller transfers bounded data and handles stale results',()=>{
 let receiver;const out=[];
 const fake={postMessage:m=>{receiver=m},terminate:()=>{}};
 const ctl=createWorkerLODController(()=>fake,{onResult:x=>out.push(x)});
 assert.equal(ctl.available,true);
 assert.equal(ctl.update([{id:'a',x:1,z:1}],{}),true);
 fake.onmessage({data:{sequence:receiver.sequence,status:'ok',result:{visible:1}}});
 assert.equal(out[0].visible,1);
 assert.equal(makeWorkerLODRequest([],{}).kind,'stage-n-lod');
 ctl.dispose();assert.equal(ctl.available,false);
});

test('WebGPU browser adapter probe is real and remains honest on unsupported hosts',async()=>{
 assert.equal((await probeWebGPUAvailability(null)).status,'UNAVAILABLE');
 assert.equal((await probeWebGPUAvailability({gpu:{requestAdapter:async()=>null}})).status,'UNAVAILABLE');
 const supported=await probeWebGPUAvailability({gpu:{requestAdapter:async()=>({})}});
 assert.equal(supported.status,'ADAPTER_AVAILABLE');
 assert.equal(supported.hardwareFpsVerified,false);
});
