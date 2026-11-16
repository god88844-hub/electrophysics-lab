import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runOnnxSubset,validateOnnxSubset,ONNX_SUBSET_FORMAT} from '../js/labs/ai/onnx-subset.js';

const fixture=JSON.parse(readFileSync(new URL('../benchmarks/phase9/graphs.json',import.meta.url),'utf8'));
const get=id=>structuredClone(fixture.cases.find(c=>c.id===id));
const calc=id=>runOnnxSubset(get(id));
test('Phase 9: the frozen five fixture IDs are distinct and all use 2D float32 opset 13',()=>{
  assert.equal(fixture.format,'invention-lab/onnx-subset-fixtures/1');
  assert.equal(fixture.operatorSet,13);
  assert.equal(fixture.dtype,'float32');
  assert.deepEqual(fixture.cases.map(c=>c.id),[
    'matmul-relu','gemm-sigmoid','add-softmax','gemm-transpose','two-layer-mlp'
  ]);
});
test('Phase 9: MatMul+Relu executes signed kernel using the real accelerator matrix engine',()=>{
  const out=calc('matmul-relu');
  assert.equal(out.format,ONNX_SUBSET_FORMAT);
  assert.deepEqual(out.outputs.Y.shape,[2,2]);
  assert.deepEqual(out.outputs.Y.values,[13,0,0,18]);
  assert.equal(out.executedNodes,2);
  assert.equal(out.physicalValidation,'none');
  assert.equal(out.realWorldBuildSuccessPercent,null);
});
test('Phase 9: Gemm alpha/beta and broadcast bias produces correct sigmoid outputs',()=>{
  const out=calc('gemm-sigmoid');
  const values=out.outputs.Y.values;
  assert.equal(values.length,4);
  const reference=[6,-1.5,6,0].map(x=>Math.fround(1/(1+Math.exp(-x))));
  for(let k=0;k<4;k++)assert.ok(Math.abs(values[k]-reference[k])<1e-6,k+' sigmoid mismatch');
});
test('Phase 9: ONNX Add broadcasts [1,N] and stable Softmax rows sum to 1',()=>{
  const out=calc('add-softmax');
  assert.deepEqual(out.outputs.Y.shape,[2,3]);
  const rows=[out.outputs.Y.values.slice(0,3),out.outputs.Y.values.slice(3,6)];
  for(const row of rows)assert.ok(Math.abs(row.reduce((a,b)=>a+b,0)-1)<1e-6);
  assert.ok(rows[0][0]>rows[0][1]);
  assert.ok(rows[1][2]>rows[1][1]);
});
test('Phase 9: Gemm transpose inputs plus scalar alpha/beta are applied correctly',()=>{
  const out=calc('gemm-transpose');
  assert.deepEqual(out.outputs.Y.shape,[2,2]);
  assert.deepEqual(out.outputs.Y.values,[2.75,6.5,3.5,7.5]);
});
test('Phase 9: two-layer graph preserves output shape and strict topological dependence',()=>{
  const out=calc('two-layer-mlp');
  assert.equal(out.executedNodes,4);
  assert.deepEqual(out.outputs.Y.shape,[2,2]);
  const y=out.outputs.Y.values;
  assert.equal(y.length,4);
  for(let i=0;i<2;i++)assert.ok(Math.abs(y[2*i]+y[2*i+1]-1)<1e-6);
});
test('Phase 9: model mutations must not alter fixtures nor input tensors',()=>{
  const graph=get('matmul-relu'),raw=JSON.stringify(graph);
  const out=runOnnxSubset(graph);
  out.outputs.Y.values[0]=999;
  assert.equal(JSON.stringify(graph),raw);
  assert.equal(calc('matmul-relu').outputs.Y.values[0],13);
});
test('Phase 9: unknown operator, malformed attributes, duplicate outputs and wrong opset fail',()=>{
  const original=get('matmul-relu');
  for(const [kind,edit] of [
    ['unknown',g=>g.nodes[0].op='Conv'],
    ['unknown-attribute',g=>g.nodes[0].attrs={bogus:2}],
    ['duplicate-node-output',g=>g.nodes[1].output=g.nodes[0].output],
    ['opset-version',g=>g.operatorSet=21],
    ['invalid-type',g=>g.dtype='float16'],
    ['external-input',g=>g.nodes[0].inputs[1]='missing'],
    ['future-node-dependency',g=>g.nodes.reverse()],
  ]){
    const g=structuredClone(original);
    g.format=ONNX_SUBSET_FORMAT;
    g.operatorSet=13;g.dtype='float32';
    edit(g);
    assert.throws(()=>runOnnxSubset(g),undefined,kind);
  }
});
test('Phase 9: unsupported ranks, matmul shape mismatch, non-finite tensor and oversized data fail closed',()=>{
  for(const kind of ['rank3','mismatch','nan','oversized','ragged','empty']){
    const g=get('matmul-relu');
    if(kind==='rank3')g.inputs[0].shape=[1,2,3];
    if(kind==='mismatch')g.initializers[0].shape=[2,3];
    if(kind==='nan')g.inputs[0].values[0]=Infinity;
    if(kind==='oversized')g.inputs[0].shape=[4096,4096];
    if(kind==='ragged')g.inputs[0].values.pop();
    if(kind==='empty')g.nodes=[];
    assert.throws(()=>runOnnxSubset(g),undefined,kind);
  }
});
test('Phase 9: validation returns fail, not a success, on malformed graphs',()=>{
  const result=validateOnnxSubset(get('matmul-relu'));
  assert.equal(result.ok,true,result.errors.join('; '));
  const corrupt=get('gemm-sigmoid');
  corrupt.nodes[0].attrs.transA=6;
  const reject=validateOnnxSubset(corrupt);
  assert.equal(reject.ok,false);
  assert.ok(reject.errors.length>=1);
});
test('Phase 9: missing Gemm inputs, invalid Softmax axis and broadcasts must never silently pass',()=>{
  const g=get('gemm-sigmoid');
  g.nodes[0].inputs.pop();
  assert.throws(()=>runOnnxSubset(g));
  const softmax=get('add-softmax');
  softmax.nodes[1].attrs.axis=0;
  assert.throws(()=>runOnnxSubset(softmax),/axis|Softmax/);
  const add=get('add-softmax');
  add.initializers[0].shape=[3,1];
  add.initializers[0].values=[1,2,3];
  assert.throws(()=>runOnnxSubset(add),/broadcast|shape|dimension/);
});
