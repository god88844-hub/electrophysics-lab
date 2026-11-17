import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {roundTiesToEven,runOnnxQuantizedCase,validateOnnxQuantizedCase,PHASE10_FORMAT} from '../js/labs/ai/onnx-quantized.js';
const fixture=JSON.parse(readFileSync(new URL('../benchmarks/phase10/quantized-cases.json',import.meta.url),'utf8'));
const manifest=JSON.parse(readFileSync(new URL('../benchmarks/phase10/acceptance.json',import.meta.url),'utf8'));
const get=id=>structuredClone(fixture.cases.find(c=>c.id===id));
test('Phase10: frozen six-case source and expected arrays cover signed, unsigned, zero point, clipping and round-even',()=>{
 assert.equal(fixture.format,'invention-lab/phase10-quantized-fixtures/1');
 assert.equal(fixture.opset,13);
 assert.equal(fixture.cases.length,6);
 assert.deepEqual(fixture.cases.map(x=>x.id),manifest.required.map(x=>x.id));
});
test('Phase10: round-nearest ties-to-even handles positive/negative halves',()=>{
 for(const [x,expected] of [[1.5,2],[2.5,2],[-1.5,-2],[-2.5,-2],[-0.5,0],[0.5,0],[0.49,0],[0.51,1],[-0.51,-1]]){
   assert.equal(roundTiesToEven(x),expected,'rounding '+x);
 }
 assert.throws(()=>roundTiesToEven(Infinity),/finite/);
});
test('Phase10: exact frozen outputs (separate hand-reviewed reference values)',()=>{
 for(const entry of manifest.required){
   const result=runOnnxQuantizedCase(get(entry.id));
   assert.equal(result.format,PHASE10_FORMAT);
   assert.equal(result.output.dtype,entry.dtype);
   assert.deepEqual(result.output.values,entry.values,entry.id);
   assert.equal(result.physicalValidation,'none');
   assert.equal(result.realWorldBuildSuccessPercent,null);
 }
});
test('Phase10: signed/unsigned QLinearMatMul int32 accumulators and zero-points differ correctly',()=>{
 const a=runOnnxQuantizedCase(get('qlinear-int8-symmetric'));
 assert.deepEqual(a.output.shape,[2,2]);
 assert.deepEqual(a.output.values,[-6,4,10,-17]);
 const b=runOnnxQuantizedCase(get('qlinear-uint8-offset'));
 assert.deepEqual(b.output.values,[121,98,181,23]);
});
test('Phase10: output saturation obeys each 8-bit type instead of wrapping',()=>{
 assert.deepEqual(runOnnxQuantizedCase(get('qlinear-int8-saturation')).output.values,[127,-128,-128,127]);
 assert.deepEqual(runOnnxQuantizedCase(get('qlinear-uint8-saturation')).output.values,[255,3,3,3]);
});
test('Phase10: quantization then dequantization preserves explicit rounding and exposes low-precision intermediate',()=>{
 const signed=runOnnxQuantizedCase(get('qdq-int8-ties-even'));
 assert.deepEqual(signed.quantized.values,[-2,-2,0,0,2,2,127,-128]);
 assert.deepEqual(signed.output.values,[-1,-1,0,0,1,1,63.5,-64]);
 const unsigned=runOnnxQuantizedCase(get('qdq-uint8-offset-saturation'));
 assert.deepEqual(unsigned.quantized.values,[0,128,129,131,133,255,255,0]);
 assert.deepEqual(unsigned.output.values,[-32,0,0.25,0.75,1.25,31.75,31.75,-32]);
});
test('Phase10: rejecting missing fields, invalid scales and invalid zero-point type',()=>{
 for(const mutate of [
  x=>x.aScale=0,x=>x.yScale=-1,x=>x.bScale=NaN,
  x=>x.aZeroPoint=512,x=>x.bZeroPoint=-1.5,x=>delete x.yZeroPoint,
  x=>x.yType='float32',x=>x.b.dtype='float32',x=>x.a.dtype='int8',
  x=>x.nonstandard='surprise'
 ]){
  const c=get('qlinear-uint8-offset');mutate(c);
  assert.equal(validateOnnxQuantizedCase(c).ok,false);
 }
});
test('Phase10: rejecting shape mismatch, nonfinite data, oversized tensors, wrong dtype',()=>{
 for(const mutate of [
  x=>x.a.shape=[1,6],x=>x.a.values.pop(),x=>x.b.shape=[4096,2],
  x=>x.a.values[0]=Infinity,x=>x.a.values[0]=1.5,
  x=>x.a.values[0]=-999,x=>x.b.values[0]=1e100,
  x=>x.b.shape=[4,2],
 ]){
  const c=get('qlinear-int8-symmetric');mutate(c);
  assert.throws(()=>runOnnxQuantizedCase(c));
 }
});
test('Phase10: Q/DQ rejects zero-scale, unsupported dtype and malformed scalar zero-point',()=>{
 for(const mutate of [
  x=>x.scale=0,x=>x.scale=Infinity,x=>x.qType='int4',
  x=>x.x.dtype='int8',x=>x.zeroPoint=0.1,x=>x.zeroPoint=256,
  x=>x.x.values[0]=NaN,x=>x.x.shape=[1,1,8],
 ]){
  const c=get('qdq-uint8-offset-saturation');mutate(c);
  assert.throws(()=>runOnnxQuantizedCase(c));
 }
});
test('Phase10: repeated runs do not mutate user fixture arrays or leak evidence to original design',()=>{
 const caseValue=get('qlinear-int8-symmetric');const snap=JSON.stringify(caseValue);
 const first=runOnnxQuantizedCase(caseValue);
 first.output.values[0]=9999;
 assert.equal(JSON.stringify(caseValue),snap);
 assert.deepEqual(runOnnxQuantizedCase(caseValue).output.values,[-6,4,10,-17]);
});
