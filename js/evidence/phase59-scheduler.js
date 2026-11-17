// Phase59 bounded GPU-style SIMT vs TPU-style systolic INT8 matrix model.
// Models schedule and memory traffic but never infer hardware performance.
import {matmulF64} from '../labs/ai/tensor.js';
export const FORMAT='invention-lab/phase59-accelerator-analytical-model/1';
const positive=(x,max)=>Number.isInteger(x)&&x>0&&x<=max;
function fail(msg){throw Error(msg)}
function matrix(a,label){
 if(!Array.isArray(a)||a.length<1||a.length>64||!Array.isArray(a[0])||
    a[0].length<1||a[0].length>64)fail(label+' needs <=64 rectangular rows/cols');
 const n=a[0].length;
 if(!a.every(row=>Array.isArray(row)&&row.length===n&&row.every(
   x=>Number.isInteger(x)&&x>=-128&&x<=127)))fail(label+' must be signed INT8 rectangular');
 return {rows:a.length,cols:n};
}
export function validateJob(job){
 if(!job||typeof job!=='object'||Array.isArray(job)||
  Object.keys(job).sort().join(',')!=='A,B,architecture,bytesPerCycle,clockMHz,lanes,scratchpadBytes,tile')
  fail('Explicit model inputs required');
 const a=matrix(job.A,'A'),b=matrix(job.B,'B');
 if(a.cols!==b.rows)fail('Inner tensor dimensions differ');
 if(!['systolic','simt'].includes(job.architecture))fail('Unsupported accelerator architecture');
 if(!positive(job.tile,16)||!positive(job.lanes,1024)||!positive(job.bytesPerCycle,1024)||
   !positive(job.scratchpadBytes,1_000_000)||
   typeof job.clockMHz!=='number'||!Number.isFinite(job.clockMHz)||
   job.clockMHz<=0||job.clockMHz>10000)fail('Invalid resource constraints');
 if(job.architecture==='systolic'&&job.lanes!==job.tile*job.tile)
  fail('Systolic active lanes must equal square PE grid');
 return {M:a.rows,K:a.cols,N:b.cols};
}
function exactInt8(A,B,M,K,N){
 const C=Array.from({length:M},()=>Array(N).fill(0));
 for(let i=0;i<M;i++)for(let j=0;j<N;j++){
  let acc=0;for(let k=0;k<K;k++)acc+=A[i][k]*B[k][j];C[i][j]=acc;
 }
 return C;
}
export function scheduleMatrix(job){
 const {M,K,N}=validateJob(job);
 const result=exactInt8(job.A,job.B,M,K,N);
 // Separate reference implementation in existing tensor lab.
 const reference=matmulF64(job.A,job.B);
 const functionalMatchesReference=JSON.stringify(result)===JSON.stringify(reference);
 const P=job.tile,tiles=[],total={inputBytes:0,outputBytes:0,loadCycles:0,
  computeCycles:0,storeCycles:0,scheduledMacLanes:0,validMacs:0};
 for(let y=0;y<M;y+=P)for(let x=0;x<N;x+=P){
  const rows=Math.min(P,M-y),cols=Math.min(P,N-x);
  const aBytes=rows*K,bBytes=K*cols,cBytes=rows*cols*4;
  const workingSet=aBytes+bBytes+cBytes;
  if(workingSet>job.scratchpadBytes)fail('Tile exceeds declared scratchpad capacity');
  // No DMA/compute overlap: a deliberately conservative deterministic schedule.
  const loadCycles=Math.ceil((aBytes+bBytes)/job.bytesPerCycle);
  const storeCycles=Math.ceil(cBytes/job.bytesPerCycle);
  const computeCycles=job.architecture==='systolic'?
    K+rows+cols-2:Math.ceil(rows*cols*K/job.lanes)+1;
  const validMacs=rows*K*cols;
  const scheduledMacLanes=computeCycles*job.lanes;
  const entry={row:y,column:x,rows,cols,aBytes,bBytes,cBytes,workingSet,
   loadCycles,computeCycles,storeCycles,validMacs,scheduledMacLanes};
  tiles.push(entry);
  total.inputBytes+=aBytes+bBytes;total.outputBytes+=cBytes;
  total.loadCycles+=loadCycles;total.storeCycles+=storeCycles;
  total.computeCycles+=computeCycles;total.validMacs+=validMacs;
  total.scheduledMacLanes+=scheduledMacLanes;
 }
 const totalCycles=total.loadCycles+total.computeCycles+total.storeCycles;
 const macUtilization=total.validMacs/total.scheduledMacLanes;
 return {format:FORMAT,architecture:job.architecture,dimensions:{M,K,N},
  computedInt8Matrix:result,functionalMatchesReference,
  tileCount:tiles.length,tiles,total,
  totalCycles,modeledLatencyMicroseconds:totalCycles/job.clockMHz,
  macUtilization,mathematicalOperations:2*M*K*N,
  modelScope:'ANALYTICAL_NONOVERLAPPED_MEMORY_COMPUTE_SCHEDULE',
  siliconAreaEstimate:null,physicalPowerW:null,measuredLatencyUs:null,
  sourceMatchedHardwareBenchmarks:0,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export const SAMPLE=Object.freeze({
 A:[[1,-2,3],[4,5,-6],[7,8,9]],B:[[2,4],[-3,1],[1,-2]],
 architecture:'systolic',bytesPerCycle:4,clockMHz:250,lanes:4,
 scratchpadBytes:1024,tile:2});
