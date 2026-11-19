// Stage P / Phase 90: modular systolic accelerator and ONNX-subset replay.
// The existing Phase 9 ONNX numerical engine is the independent functional
// reference. No GPU device, silicon power meter or hardware heatmap is claimed.
import {runOnnxSubset,ONNX_SUBSET_FORMAT} from '../labs/ai/onnx-subset.js';
export const ACCELERATOR_FORMAT='invention-lab/phase90-custom-accelerator/1';
const valid=n=>typeof n==='number'&&Number.isFinite(n);
const integer=(x,min,max,label)=>{if(!Number.isInteger(x)||x<min||x>max)throw Error('Invalid '+label);return x;};
export function createCustomAccelerator({
 name='Invented-Systolic-TPU',rows=4,cols=4,clockMHz=100,
 scratchpadBytes=65536,dramBandwidthGBs=1,
 bytesPerElement=4,macEnergyPJ=null,staticPowerW=null,
 thermalResistanceKW=null,ambientC=25
}={}){
 if(typeof name!=='string'||name.length<2||name.length>100)
  throw Error('Invalid accelerator name');
 integer(rows,1,32,'PE rows');integer(cols,1,32,'PE columns');
 integer(scratchpadBytes,256,16*1024*1024,'scratchpad bytes');
 integer(bytesPerElement,1,8,'element width');
 if(![1,2,4,8].includes(bytesPerElement)||!valid(clockMHz)||clockMHz<=0||clockMHz>5000||
    !valid(dramBandwidthGBs)||dramBandwidthGBs<=0||dramBandwidthGBs>2000||
    !valid(ambientC)||ambientC< -40||ambientC>125)
  throw Error('Invalid accelerator operating inputs');
 for(const [k,v] of Object.entries({macEnergyPJ,staticPowerW,thermalResistanceKW}))
  if(v!==null&&(!valid(v)||v<0||v>1e8))throw Error('Invalid '+k);
 const blocks=[];
 const add=(kind,x,y,z,width,height,depth)=>blocks.push({
  id:kind+'-'+blocks.filter(b=>b.kind===kind).length,kind,
  poseMm:{x,y,z},sizeMm:{width,height,depth},
  geometry:'abstract-3d-proxy'});
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)
  add('mac-pe',c*1.6,r*1.6,0,1.3,1.3,.5);
 add('scratchpad-sram',cols*1.6+2,0,0,5,Math.max(2,rows),.5);
 add('dram-hbm-interface',0,rows*1.6+2,0,5,1.5,.7);
 add('vector-tensor-controller',cols*1.6+2,rows*1.6+2,0,5,2,.5);
 return {format:ACCELERATOR_FORMAT,name,rows,cols,clockMHz,
  scratchpadBytes,dramBandwidthGBs,bytesPerElement,macEnergyPJ,
  staticPowerW,thermalResistanceKW,ambientC,blocks,
  memoryHierarchy:['systolic-pe','scratchpad-sram','dram-hbm-interface'],
  transistorTimingQualified:false,
  physicalValidation:'none',simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
function matrix(a,label){
 if(!Array.isArray(a)||a.length<1||a.length>128||
    !Array.isArray(a[0])||a[0].length<1||a[0].length>128)
  throw Error(label+' must be bounded matrix');
 const cols=a[0].length;
 if(a.some(r=>!Array.isArray(r)||r.length!==cols||
     r.some(x=>!valid(x)||!Number.isFinite(Math.fround(x)))))
  throw Error('Invalid '+label+' elements');
 return [a.length,cols];
}
export function executeSystolicMatMul(config,A,B){
 if(config?.format!==ACCELERATOR_FORMAT)throw Error('Accelerator configuration required');
 const [M,K]=matrix(A,'A'),[BK,N]=matrix(B,'B');
 if(K!==BK)throw Error('Systolic dimension mismatch');
 if(M*N>4096||M*K+K*N>32768)throw Error('Systolic compute budget exceeded');
 const f=Math.fround;
 // Simulate output-stationary PE accumulation in wavefront order, not
 // simply delegate matrix multiplication to the reference library.
 const result=Array.from({length:M},()=>Array(N).fill(0));
 const tilesRow=Math.ceil(M/config.rows),tilesCol=Math.ceil(N/config.cols);
 const timeline=[];
 for(let tr=0;tr<tilesRow;tr++)for(let tc=0;tc<tilesCol;tc++){
  const tileStart=timeline.length?timeline.at(-1).endCycle:0;
  for(let r=0;r<config.rows;r++)for(let c=0;c<config.cols;c++){
   const i=tr*config.rows+r,j=tc*config.cols+c;
   if(i>=M||j>=N)continue;
   let accum=0;
   for(let k=0;k<K;k++)accum=f(accum+f(f(A[i][k])*f(B[k][j])));
   result[i][j]=accum;
  }
  timeline.push({tileRow:tr,tileCol:tc,startCycle:tileStart,
   endCycle:tileStart+K+config.rows+config.cols-2});
 }
 const cycles=timeline.at(-1)?.endCycle??0;
 const macs=M*N*K,opCount=macs*2;
 const workTimeS=cycles/(config.clockMHz*1e6);
 const transferBytes=(M*K+K*N+M*N)*config.bytesPerElement;
 // A simple three-transfer roofline over ideal DRAM bandwidth. This is
 // expressly not a DMA cycle-accurate memory-controller simulation.
 const bandwidthSeconds=transferBytes/(config.dramBandwidthGBs*1e9);
 const seconds=Math.max(workTimeS,bandwidthSeconds);
 const energyJ=config.macEnergyPJ===null||config.staticPowerW===null?null:
  macs*config.macEnergyPJ*1e-12+config.staticPowerW*seconds;
 const powerW=energyJ===null||seconds===0?null:energyJ/seconds;
 const temperatureC=powerW===null||config.thermalResistanceKW===null?null:
  config.ambientC+powerW*config.thermalResistanceKW;
 const outputBytes=M*N*config.bytesPerElement;
 const scratchpadFits=(M*K+K*N+M*N)*config.bytesPerElement<=config.scratchpadBytes;
 const memoryBottleneck=bandwidthSeconds>workTimeS;
 return {format:'invention-lab/phase90-matmul-result/1',output:result,
  dimensions:{M,K,N},timeline,clockCycles:cycles,macs,opCount,
  simulatedSeconds:seconds,computeOnlySeconds:workTimeS,
  memoryTransferSeconds:bandwidthSeconds,transferBytes,outputBytes,
  scratchpadFits,memoryBottleneck,
  modeledTOPS:seconds>0?opCount/seconds/1e12:null,
  assumedEnergyJ:energyJ,assumedPowerW:powerW,
  assumedTOPSPerW:energyJ!==null&&powerW>0?
   (opCount/seconds/1e12)/powerW:null,
  assumedTemperatureC:temperatureC,
  measuredPowerW:null,measuredTemperatureC:null,
  thermalMap:config.blocks.map(b=>({blockId:b.id,temperatureC,
   source:temperatureC===null?'UNKNOWN':'uniform-assumed-thermal-resistance'})),
  calibratedDevicePhysics:false,physicalValidation:'none',
  simulatedPhysicalBuildSuccessPercent:'UNKNOWN'};
}
export function executeOnnxAccelerator(config,graph,{feeds=null}={}){
 if(config?.format!==ACCELERATOR_FORMAT)throw Error('Custom accelerator required');
 // Phase 9's real bounded ONNX opset13 JSON intermediate representation:
 // not a general ONNX protobuf file or actual silicon accelerator.
 const reference=runOnnxSubset(graph,{feeds});
 if(!reference.ok)throw Error('Existing ONNX subset rejected model');
 const tensors=new Map([...graph.inputs,...graph.initializers].map(t=>[t.name,{
  shape:[...t.shape],values:(feeds&&Object.hasOwn(feeds,t.name)?
   feeds[t.name]:t.values).map(Math.fround)
 }]));
 const toMatrix=t=>Array.from({length:t.shape[0]},(_,i)=>
  t.values.slice(i*t.shape[1],(i+1)*t.shape[1]));
 const transpose=a=>a[0].map((_,j)=>a.map(row=>row[j]));
 const results=[];
 for(const node of graph.nodes){
  if(!['MatMul','Gemm'].includes(node.op))continue;
  const A=tensors.get(node.inputs[0]),B=tensors.get(node.inputs[1]);
  const out=reference.trace.find(x=>x.node===node.id);
  if(!out)throw Error('Missing traced ONNX matrix node');
  if(A&&B){
   let left=toMatrix(A),right=toMatrix(B);
   const transA=node.op==='Gemm'&&(node.attrs?.transA===1);
   const transB=node.op==='Gemm'&&(node.attrs?.transB===1);
   if(transA)left=transpose(left);
   if(transB)right=transpose(right);
   const profile=executeSystolicMatMul(config,left,right);
   results.push({nodeId:node.id,op:node.op,profile,
    numericalExecution:'actual-tiled-f32-systolic-mac-kernel',
    acceleratorKernelExecution:'executed',
    onnxBiasAndActivations:'Phase9-reference-CPU',
    kernelOutput:profile.output});
  }else{
   // If a matrix input is produced by an upstream ONNX node, full tensor
   // scheduling is not implemented: explicitly flag the incomplete kernel
   // rather than executing a fake zero-input multiply.
   results.push({nodeId:node.id,op:node.op,profile:null,
    numericalExecution:'Phase9-ONNX-CPU-reference-only',
    acceleratorKernelExecution:'UNSUPPORTED_DEPENDENT_TENSOR',
    kernelOutput:null});
  }
 }
 const totalCycles=results.reduce((s,x)=>s+(x.profile?.clockCycles??0),0);
 const totalOperations=results.reduce((s,x)=>s+(x.profile?.opCount??0),0);
 const totalEnergy=results.length&&results.every(x=>x.profile?.assumedEnergyJ!==null&&x.profile?.assumedEnergyJ!==undefined)?
  results.reduce((s,x)=>s+x.profile.assumedEnergyJ,0):null;
 return {format:'invention-lab/phase90-onnx-accelerator-report/1',
  onnxSubsetFormat:ONNX_SUBSET_FORMAT,reference,
  acceleratorNodeProfiles:results,totalCycles,totalOperations,
  assumedEnergyJ:totalEnergy,
  numericalOutputsProvenance:'Phase9 ONNX subset JS CPU; no hardware accelerator backend',
  acceleratorKernelExecutionVerified:results.length>0&&results.every(x=>x.acceleratorKernelExecution==='executed'),
  acceleratorExecutionVerified:false,
  independentOnnxRuntimeVerificationPerformedHere:false,
  physicalValidation:'none',realWorldTOPS:null,realWorldTOPSPerW:null};
}
