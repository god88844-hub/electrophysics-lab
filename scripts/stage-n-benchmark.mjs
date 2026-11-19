// Recorded CPU-only scene LOD benchmark. NOT a GPU 60-FPS certification.
import {performance} from 'node:perf_hooks';
import {groupVisibleInstances,boundedFrameReport}
 from '../js/scene/stage-n-render-budget.js';
const count=100000,samples=30;
const data=Array.from({length:count},(_,i)=>({
 id:'gate-'+i,x:i%500,z:Math.floor(i/500)
}));
const frames=[];
let visible=0;
for(let i=0;i<samples;i++){
 const t0=performance.now();
 const output=groupVisibleInstances(data,{centerX:250+i/4,centerZ:100,radius:85,maxVisible:50000});
 visible=output.visible;
 frames.push(performance.now()-t0);
}
const report=boundedFrameReport(frames,process.memoryUsage().heapUsed);
process.stdout.write(JSON.stringify({designSize:count,visibleLastFrame:visible,
 benchmarkScope:'node-cpu-lod-only-no-browser-render-no-webgpu-validation',
 ...report},null,2)+'\n');
if(report.frames!==30||report.memoryBytes<=0)process.exitCode=1;
