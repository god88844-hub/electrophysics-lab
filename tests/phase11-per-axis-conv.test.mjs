import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runPhase11Case,validatePhase11Case,PHASE11_FORMAT} from '../js/labs/ai/onnx-per-axis-conv.js';

const fx=JSON.parse(readFileSync(new URL('../benchmarks/phase11/cases.json',import.meta.url),'utf8'));
const expected=JSON.parse(readFileSync(new URL('../benchmarks/phase11/acceptance.json',import.meta.url),'utf8'));
const get=id=>structuredClone(fx.cases.find(c=>c.id===id));
test('Phase11: all six separate frozen fixtures are exact and bounded',()=>{
  assert.equal(fx.format,'invention-lab/phase11-fixtures/1');
  assert.equal(fx.opset,13);
  assert.equal(fx.cases.length,6);
  assert.deepEqual(fx.cases.map(x=>x.id),expected.required.map(x=>x.id));
});
test('Phase11: 4D quantized convolution matches independently frozen full tensors',()=>{
  for(const ref of expected.required.filter(x=>x.op==='QLinearConv')){
    const actual=runPhase11Case(get(ref.id));
    assert.equal(actual.format,PHASE11_FORMAT);
    assert.deepEqual(actual.output.shape,ref.shape,ref.id);
    assert.equal(actual.output.dtype,ref.dtype);
    assert.deepEqual(actual.output.values,ref.values,ref.id);
    assert.equal(actual.physicalValidation,'none');
    assert.equal(actual.realWorldBuildSuccessPercent,null);
  }
});
test('Phase11: convolution uses per-output-channel quantization, int32 bias and mixed signedness',()=>{
  const result=runPhase11Case(get('qconv-mixed-per-channel'));
  assert.equal(result.weightQuantization,'per-output-channel');
  assert.deepEqual(result.output.shape,[1,2,2,2]);
  assert.deepEqual(result.output.values,[192,129,178,152,255,204,34,144]);
});
test('Phase11: padded regions represent input zero-point, not implicit integer zero',()=>{
  const c=get('qconv-int8-pad-stride'),first=runPhase11Case(c);
  assert.deepEqual(first.output.shape,[1,1,2,2]);
  assert.deepEqual(first.output.values,[-3,25,-1,-16]);
  c.pads=[0,0,0,0];
  assert.notDeepEqual(runPhase11Case(c).output.values,first.output.values);
});
test('Phase11: positive/negative quantized convolution clips rather than wraps',()=>{
  const out=runPhase11Case(get('qconv-int8-saturation')).output;
  assert.deepEqual(out.values,[127,127,127,127,-128,-128,-128,-128]);
  assert.equal(out.values.length,8);
});
test('Phase11: per-axis signed Q/DQ rounds to nearest ties-even',()=>{
  const ref=expected.required.find(x=>x.id==='per-axis-int8-axis1');
  const out=runPhase11Case(get(ref.id));
  assert.equal(out.normalizedAxis,1);
  assert.deepEqual(out.quantized.values,ref.quantized);
  assert.deepEqual(out.output.values,ref.values);
});
test('Phase11: per-axis negative axis and uint8 saturation/dequantization',()=>{
  const ref=expected.required.find(x=>x.id==='per-axis-uint8-negative-axis');
  const out=runPhase11Case(get(ref.id));
  assert.equal(out.normalizedAxis,0);
  assert.deepEqual(out.quantized.values,ref.quantized);
  assert.deepEqual(out.output.values,ref.values);
});
test('Phase11: reject invalid per-axis axis, vector length, nonpositive scale, unsigned zero-point',()=>{
  for(const mutate of [
    x=>x.axis=2,x=>x.axis=-3,x=>x.scales.pop(),x=>x.zeroPoints.pop(),
    x=>x.scales[0]=0,x=>x.scales[1]=Infinity,
    x=>x.zeroPoints[0]=-1,x=>x.zeroPoints[0]=300,
    x=>x.qType='int4',x=>x.x.dtype='uint8',x=>x.x.values[0]=NaN,
  ]){
    const caseValue=get('per-axis-uint8-negative-axis');mutate(caseValue);
    assert.equal(validatePhase11Case(caseValue).ok,false);
  }
});
test('Phase11: reject invalid convolution pads, strides, bias, channel scales and dimensions',()=>{
  for(const mutate of [
    x=>x.pads=[0,0,0],x=>x.pads[0]=-1,
    x=>x.strides=[0,1],x=>x.strides=[1,0],
    x=>x.wScales.pop(),x=>x.wZeroPoints.pop(),
    x=>x.wScales[0]=0,x=>x.wZeroPoints[1]=-129,
    x=>x.xZeroPoint=-1,x=>x.yZeroPoint=300,
    x=>x.yType='int16',x=>x.bias=[1],x=>x.bias=[1,2.5],
    x=>x.x.shape=[1,2,3,3],x=>x.w.shape=[2,2,2,2],
    x=>x.w.values[0]=999,x=>x.x.values[0]=Infinity,
  ]){
    const c=get('qconv-mixed-per-channel');mutate(c);
    assert.equal(validatePhase11Case(c).ok,false,JSON.stringify(c));
  }
});
test('Phase11: reject over-budget convolution without allocating huge arrays',()=>{
  const c=get('qconv-uint8-valid');
  c.pads=[32,32,32,32];
  assert.throws(()=>runPhase11Case(c),/budget|large|resource/);
});
test('Phase11: unsupported ops or extra attributes never get silent defaults',()=>{
  const bad=get('qconv-uint8-valid');
  bad.op='Conv';assert.throws(()=>runPhase11Case(bad),/unsupported/);
  const c=get('qconv-uint8-valid');
  c.group=2;assert.throws(()=>runPhase11Case(c),/unknown/);
});
test('Phase11: output changes cannot mutate source inputs',()=>{
  const c=get('per-axis-int8-axis1'),before=JSON.stringify(c);
  const out=runPhase11Case(c);out.output.values[0]=9999;
  assert.equal(JSON.stringify(c),before);
  assert.equal(runPhase11Case(c).output.values[0],-1);
});
