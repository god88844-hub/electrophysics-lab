// Phase 11: bounded ONNX opset-13 per-axis Q/DQ and QLinearConv
// arithmetic. This is a JS educational mathematical model, NOT an ONNX
// protobuf reader, CUDA runtime, performance simulator or silicon evidence.
// All six fixtures are independently executed by real ONNX Runtime in CI.
//
// Canonical operators:
// https://onnx.ai/onnx/operators/onnx__QLinearConv.html
// https://onnx.ai/onnx/operators/onnx__QuantizeLinear.html
// https://onnx.ai/onnx/operators/onnx__DequantizeLinear.html
import {roundTiesToEven} from './onnx-quantized.js';
export const PHASE11_FORMAT='invention-lab/phase11-quantized-result/1';
const RANGE={int8:[-128,127],uint8:[0,255]};
const MAX_ELEMENTS=4096,MAX_MACS=1_000_000;
const f=Math.fround;
function fail(reason){throw Error('ONNX Phase 11 subset: '+reason);}
function obj(o,keys,label){
  if(!o||typeof o!=='object'||Array.isArray(o))fail(label+' missing object');
  for(const k of Object.keys(o))if(!keys.includes(k))fail(label+' unknown field '+k);
}
function scalar(v,label){
  if(typeof v!=='number'||!Number.isFinite(v)||!Number.isFinite(f(v))||f(v)<=0)
    fail(label+' must be positive, finite float32');
  return f(v);
}
function zp(v,type,label){
  const limits=RANGE[type];if(!limits)fail(label+' unsupported int8/uint8 dtype');
  if(!Number.isInteger(v)||v<limits[0]||v>limits[1])
    fail(label+' zero-point out of '+type+' range');
  return v;
}
function arr(v,n,label){
  if(!Array.isArray(v)||v.length!==n)fail(label+' wrong vector length');
  return v;
}
function tensor(raw,rank,allowed,label){
  obj(raw,['dtype','shape','values'],label);
  if(!allowed.includes(raw.dtype))fail(label+' unsupported dtype');
  if(!Array.isArray(raw.shape)||raw.shape.length!==rank||raw.shape.some(d=>!Number.isInteger(d)||d<=0))
    fail(label+' invalid tensor dimensions');
  const n=raw.shape.reduce((a,b)=>a*b,1);
  if(n>MAX_ELEMENTS||n<=0||!Array.isArray(raw.values)||raw.values.length!==n)
    fail(label+' invalid tensor count or resource budget');
  const values=raw.values.map(v=>{
    if(typeof v!=='number'||!Number.isFinite(v)||!Number.isFinite(f(v)))
      fail(label+' nonfinite tensor');
    if(raw.dtype==='float32')return f(v);
    const [min,max]=RANGE[raw.dtype];
    if(!Number.isInteger(v)||v<min||v>max)fail(label+' integer value outside type range');
    return v;
  });
  return {dtype:raw.dtype,shape:[...raw.shape],values};
}
function clamp(value,type){
  const [min,max]=RANGE[type];return Math.max(min,Math.min(max,value));
}
function result(caseId,op,output,additional={}){
  return {
    format:PHASE11_FORMAT,kind:'onnx-per-axis-conv',caseId,op,opset:13,
    output, ...additional,
    independentReference:'NOT RUN in browser; real ONNX Runtime CPU is executed in CI',
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
  };
}
export function runPhase11Case(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||!/^([a-z][a-z0-9-]{2,54})$/.test(raw.id))
    fail('invalid fixture identity');
  if(raw.op==='PerAxisQDQ'){
    obj(raw,['id','op','x','axis','scales','zeroPoints','qType'],'PerAxisQDQ');
    const x=tensor(raw.x,2,['float32'],'input X');
    if(!Number.isInteger(raw.axis)||raw.axis < -2||raw.axis>1)
      fail('per-axis quantization axis must be 0, 1, -1 or -2');
    const axis=(raw.axis+2)%2;
    const channels=x.shape[axis];
    const scales=arr(raw.scales,channels,'per-axis scales').map((v,i)=>scalar(v,'scale '+i));
    const zeros=arr(raw.zeroPoints,channels,'per-axis zero points')
      .map((v,i)=>zp(v,raw.qType,'channel '+i));
    const [rows,cols]=x.shape;
    const q=x.values.map((value,index)=>{
      const channel=axis===0?Math.floor(index/cols):index%cols;
      const rounded=roundTiesToEven(value/scales[channel]);
      return clamp(rounded+zeros[channel],raw.qType);
    });
    const y=q.map((value,index)=>{
      const channel=axis===0?Math.floor(index/cols):index%cols;
      return f((value-zeros[channel])*scales[channel]);
    });
    return result(raw.id,raw.op,
      {dtype:'float32',shape:[...x.shape],values:y},
      {quantized:{dtype:raw.qType,shape:[...x.shape],values:q},
       normalizedAxis:axis,operations:['QuantizeLinear','DequantizeLinear']});
  }
  if(raw.op==='QLinearConv'){
    obj(raw,['id','op','x','w','xScale','xZeroPoint','wScales','wZeroPoints',
      'yScale','yZeroPoint','yType','pads','strides','bias'],'QLinearConv');
    const x=tensor(raw.x,4,['int8','uint8'],'input X');
    const w=tensor(raw.w,4,['int8','uint8'],'kernel W');
    const [N,C,H,W]=x.shape;
    const [M,Cw,KH,KW]=w.shape;
    if(C!==Cw)fail('this slice permits only group=1, matching input/weight channels');
    if(M>64||KH*KW>256)fail('kernel/out-channel budget exceeded');
    const xs=scalar(raw.xScale,'input scale'),ys=scalar(raw.yScale,'output scale');
    const xz=zp(raw.xZeroPoint,x.dtype,'input');
    const yz=zp(raw.yZeroPoint,raw.yType,'output');
    const ws=arr(raw.wScales,M,'per-channel weight scales')
      .map((v,i)=>scalar(v,'weight scale '+i));
    const wz=arr(raw.wZeroPoints,M,'per-channel weight zero-points')
      .map((v,i)=>zp(v,w.dtype,'weight '+i));
    const pads=arr(raw.pads,4,'pads');
    const strides=arr(raw.strides,2,'strides');
    if(pads.some(v=>!Number.isInteger(v)||v<0||v>32)||
      strides.some(v=>!Number.isInteger(v)||v<1||v>16))
      fail('invalid pads or strides');
    const [top,left,bottom,right]=pads;
    const [sh,sw]=strides;
    const outH=Math.floor((H+top+bottom-KH)/sh)+1;
    const outW=Math.floor((W+left+right-KW)/sw)+1;
    if(outH<1||outW<1||N*M*outH*outW>MAX_ELEMENTS||
       N*M*outH*outW*C*KH*KW>MAX_MACS)
      fail('invalid output spatial shape or convolution workload too large');
    if(raw.bias!==undefined)arr(raw.bias,M,'per-channel int32 bias');
    const bias=raw.bias===undefined?Array(M).fill(0):raw.bias;
    if(bias.some(v=>!Number.isInteger(v)||v < -2147483648||v >2147483647))
      fail('bias must have finite signed int32 values');
    const values=[];
    for(let n=0;n<N;n++)for(let m=0;m<M;m++)
      for(let oy=0;oy<outH;oy++)for(let ox=0;ox<outW;ox++){
        let acc=bias[m];
        for(let ci=0;ci<C;ci++)for(let ky=0;ky<KH;ky++)for(let kx=0;kx<KW;kx++){
          const iy=oy*sh+ky-top,ix=ox*sw+kx-left;
          const input=iy<0||iy>=H||ix<0||ix>=W ?
            xz:x.values[((n*C+ci)*H+iy)*W+ix];
          const weight=w.values[((m*C+ci)*KH+ky)*KW+kx];
          acc+=(input-xz)*(weight-wz[m]);
        }
        // Exact integer arithmetic is maintained through the accumulated
        // dot product. Floats enter only for output quantization.
        const scaled=acc*(xs*ws[m])/ys;
        if(!Number.isFinite(scaled)||Math.abs(scaled)>Number.MAX_SAFE_INTEGER)
          fail('unsafe convolution accumulation/rescale');
        values.push(clamp(roundTiesToEven(scaled)+yz,raw.yType));
      }
    return result(raw.id,raw.op,
      {dtype:raw.yType,shape:[N,M,outH,outW],values},
      {operations:['QLinearConv'],weightQuantization:'per-output-channel'});
  }
  fail('unsupported operation '+String(raw.op));
}
export function validatePhase11Case(caseValue){
  try{return {ok:true,errors:[],result:runPhase11Case(caseValue)};}
  catch(error){return {ok:false,errors:[String(error.message)],result:null};}
}
