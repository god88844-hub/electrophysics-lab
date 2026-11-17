// Phase 10: bounded ONNX opset-13 per-tensor quantization SUBSET.
// Implements QLinearMatMul and QuantizeLinear -> DequantizeLinear for 2D
// int8/uint8 tensors and float32 inputs. This JSON test IR is NOT an
// arbitrary ONNX protobuf parser. Real ONNX Runtime is exercised in CI.
// No silicon timing, inference-accuracy or physical validation claims.
//
// ONNX normative semantics: round-to-nearest ties-to-even, then add integer
// zero point, then saturate to the destination integer range.
// https://onnx.ai/onnx/operators/onnx__QLinearMatMul.html
// https://onnx.ai/onnx/operators/onnx__QuantizeLinear.html
// https://onnx.ai/onnx/operators/onnx__DequantizeLinear.html
export const PHASE10_FORMAT='invention-lab/phase10-quantized-result/1';
const f32=Math.fround;
const MAX_CELLS=4096;
const RANGE={int8:[-128,127],uint8:[0,255]};
function fail(message){throw Error('ONNX quantized subset: '+message);}
function checkName(name){if(typeof name!=='string'||!/^[a-z][a-z0-9-]{1,39}$/.test(name))fail('invalid case ID');}
function checkScalar(scale,name){
  if(typeof scale!=='number'||!Number.isFinite(scale)||scale<=0||
    !Number.isFinite(f32(scale))||f32(scale)<=0)
    fail(name+' scale must be finite positive float32');
  return f32(scale);
}
function checkZeroPoint(zeroPoint,dtype,name){
  const range=RANGE[dtype];
  if(!range)fail(name+' unsupported 8-bit type');
  if(!Number.isInteger(zeroPoint)||zeroPoint<range[0]||zeroPoint>range[1])
    fail(name+' zero point outside '+dtype+' limits');
  return zeroPoint;
}
function checkTensor(raw,allowed,name){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))fail(name+' must be a tensor');
  if(!allowed.includes(raw.dtype))fail(name+' has unsupported dtype');
  const shape=raw.shape;
  if(!Array.isArray(shape)||shape.length!==2||shape.some(x=>!Number.isInteger(x)||x<=0))
    fail(name+' must be a positive 2D matrix');
  if(shape[0]*shape[1]>MAX_CELLS||!Array.isArray(raw.values)||
    raw.values.length!==shape[0]*shape[1])fail(name+' tensor size mismatches shape or exceeds limit');
  const values=raw.values.map(v=>{
    if(typeof v!=='number'||!Number.isFinite(v)||!Number.isFinite(f32(v)))
      fail(name+' has non-finite or nonnumeric element');
    if(raw.dtype==='float32')return f32(v);
    const [low,high]=RANGE[raw.dtype];
    if(!Number.isInteger(v)||v<low||v>high)fail(name+' element outside '+raw.dtype+' range');
    return v;
  });
  return {shape:[...shape],dtype:raw.dtype,values};
}
function enforceKeys(record,allowed,name){
  if(!record||typeof record!=='object'||Array.isArray(record))fail(name+' must be object');
  for(const key of Object.keys(record))if(!allowed.includes(key))fail(name+' unsupported field '+key);
}
export function roundTiesToEven(x){
  if(!Number.isFinite(x)||Math.abs(x)>Number.MAX_SAFE_INTEGER)
    fail('rounding requires finite safe value');
  const lower=Math.floor(x);
  const frac=x-lower;
  if(frac<0.5)return lower;
  if(frac>0.5)return lower+1;
  return lower%2===0?lower:lower+1;
}
function quantize(value,scale,zeroPoint,dtype){
  const [lo,hi]=RANGE[dtype];
  // Normative ONNX: round x/scale first, add zero point second.
  const rounded=roundTiesToEven(f32(value)/scale)+zeroPoint;
  return Math.min(hi,Math.max(lo,rounded));
}
export function runOnnxQuantizedCase(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('case must be an object');
  checkName(raw.id);
  if(raw.op==='QLinearMatMul'){
    enforceKeys(raw,['id','op','a','b','aScale','bScale','yScale','aZeroPoint','bZeroPoint','yZeroPoint','yType'],'QLinearMatMul');
    const a=checkTensor(raw.a,['int8','uint8'],'A'),b=checkTensor(raw.b,['int8','uint8'],'B');
    if(a.dtype!==b.dtype)fail('this bounded QLinearMatMul slice requires same signedness for A and B');
    if(raw.yType!==a.dtype)fail('this bounded slice requires identical signedness for output');
    const as=checkScalar(raw.aScale,'A'),bs=checkScalar(raw.bScale,'B'),ys=checkScalar(raw.yScale,'Y');
    const az=checkZeroPoint(raw.aZeroPoint,a.dtype,'A');
    const bz=checkZeroPoint(raw.bZeroPoint,b.dtype,'B');
    const yz=checkZeroPoint(raw.yZeroPoint,raw.yType,'Y');
    const [m,k]=a.shape;
    if(k!==b.shape[0])fail('QLinearMatMul incompatible matrix dimensions');
    const n=b.shape[1];
    if(m*n>MAX_CELLS)fail('QLinearMatMul output exceeds cap');
    const values=[];
    for(let row=0;row<m;row++)for(let col=0;col<n;col++){
      let acc=0;
      for(let j=0;j<k;j++){
        acc+=(a.values[row*k+j]-az)*(b.values[j*n+col]-bz);
      }
      // The bounded MAX_CELLS budget keeps this exact int accumulator in
      // JS's integer-safe domain: |acc| <= 4096 * 65025 < 2^53.
      const product=acc*(as*bs)/ys;
      values.push(quantize(product,1,yz,raw.yType));
    }
    return {
      format:PHASE10_FORMAT,kind:'onnx-quantized',caseId:raw.id,
      op:raw.op,opset:13,
      output:{dtype:raw.yType,shape:[m,n],values},
      operations:['QLinearMatMul'],independentReference:'NOT RUN locally; external ONNX Runtime CI',
      physicalValidation:'none',realWorldBuildSuccessPercent:null,
    };
  }
  if(raw.op==='QuantizeDequantize'){
    enforceKeys(raw,['id','op','x','scale','zeroPoint','qType'],'QuantizeDequantize');
    const x=checkTensor(raw.x,['float32'],'X');
    const scale=checkScalar(raw.scale,'X');
    const zp=checkZeroPoint(raw.zeroPoint,raw.qType,'X');
    const quantized=x.values.map(v=>quantize(v,scale,zp,raw.qType));
    const values=quantized.map(q=>f32((q-zp)*scale));
    return {
      format:PHASE10_FORMAT,kind:'onnx-quantized',caseId:raw.id,
      op:raw.op,opset:13,
      quantized:{dtype:raw.qType,shape:[...x.shape],values:quantized},
      output:{dtype:'float32',shape:[...x.shape],values},
      operations:['QuantizeLinear','DequantizeLinear'],
      independentReference:'NOT RUN locally; external ONNX Runtime CI',
      physicalValidation:'none',realWorldBuildSuccessPercent:null,
    };
  }
  fail('unsupported ONNX quantized operation '+String(raw.op));
}
export function validateOnnxQuantizedCase(raw){
  try{return {ok:true,result:runOnnxQuantizedCase(raw),errors:[]};}
  catch(error){return {ok:false,result:null,errors:[String(error.message)]};}
}
