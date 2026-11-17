// Phase 9 — a bounded ONNX operator SUBSET, not a general ONNX protobuf runtime.
// Supported: opset 13 float32, fixed 2-D tensors, MatMul/Gemm/Add/Relu/
// Sigmoid/Softmax(axis=1). Inputs/initializers and topologically ordered nodes
// are accepted as a JSON interchange IR, not arbitrary executable code.
// Independent reference: real Python onnx + onnxruntime CPU provider in CI.
// No claimed GPU/TPU architectural performance, accuracy on real datasets,
// semiconductor PDK qualification, silicon measurements or build probability.
import {matmul} from './tensor.js';

export const ONNX_SUBSET_FORMAT='invention-lab/onnx-subset-graph/1';
export const ONNX_SUBSET_OPSET=13;
const MAX_NODES=32,MAX_TENSORS=48,MAX_CELLS=4096,MAX_TOTAL_CELLS=65536;
const f=Math.fround;
const safeName=x=>typeof x==='string'&&x.length>0&&x.length<=100&&
  /^[A-Za-z][A-Za-z0-9_-]*$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
function fail(message){throw Error('ONNX subset: '+message);}
function requireName(name,where){
  if(!safeName(name))fail(where+' needs a valid unique nonempty symbolic name');
}
function onlyKeys(obj,allowed,where){
  if(obj===null||typeof obj!=='object'||Array.isArray(obj))fail(where+' must be an object');
  for(const k of Object.keys(obj))if(!allowed.includes(k))fail('unsupported '+where+' attribute '+k);
}
function tensor(raw,where){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))fail(where+' tensor record missing');
  requireName(raw.name,where+' tensor');
  if(!Array.isArray(raw.shape)||raw.shape.length!==2||
     raw.shape.some(d=>!Number.isInteger(d)||d<=0||d>MAX_CELLS))
    fail(where+' tensor must have supported 2D positive integer shape');
  const [rows,cols]=raw.shape;
  if(rows*cols>MAX_CELLS||!Array.isArray(raw.values)||raw.values.length!==rows*cols)
    fail(where+' tensor shape/data length exceeds bounded memory or disagrees');
  if(raw.values.some(v=>typeof v!=='number'||!Number.isFinite(v)||!Number.isFinite(f(v))))
    fail(where+' tensor includes nonfinite or nonnumeric values');
  return {shape:[rows,cols],values:raw.values.map(f)};
}
function fromMatrix(matrix){
  const rows=matrix.length,cols=matrix[0].length;
  return {shape:[rows,cols],values:matrix.flat().map(f)};
}
function toMatrix(t){
  const [rows,cols]=t.shape;
  return Array.from({length:rows},(_,i)=>t.values.slice(i*cols,(i+1)*cols));
}
function transpose(t){
  const [m,n]=t.shape,values=new Array(m*n);
  for(let i=0;i<m;i++)for(let j=0;j<n;j++)values[j*m+i]=t.values[i*n+j];
  return {shape:[n,m],values};
}
function size(t){return t.shape[0]*t.shape[1];}
function broadcast(t,rows,cols,where){
  if((t.shape[0]!==1&&t.shape[0]!==rows)||(t.shape[1]!==1&&t.shape[1]!==cols))
    fail(where+' input cannot broadcast to '+rows+'x'+cols);
  const result=new Array(rows*cols);
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
    const y=t.shape[0]===1?0:i,x=t.shape[1]===1?0:j;
    result[i*cols+j]=t.values[y*t.shape[1]+x];
  }
  return {shape:[rows,cols],values:result};
}
function multiply(a,b){
  if(a.shape[1]!==b.shape[0])fail('MatMul/Gemm incompatible matrix dimensions');
  const [m,k]=a.shape,n=b.shape[1];
  if(m*n>MAX_CELLS||m*k>MAX_CELLS||k*n>MAX_CELLS)
    fail('MatMul/Gemm output too large for bounded inference');
  // Reuse the actual existing accelerator f32 kernel; ONNX Runtime remains
  // independently implemented and its output is verified in external CI.
  return fromMatrix(matmul(toMatrix(a),toMatrix(b),{precision:'f32'}));
}
function validateAttrs(op,attrs){
  const map={
    MatMul:[],Gemm:['alpha','beta','transA','transB'],
    Add:[],Relu:[],Sigmoid:[],Softmax:['axis'],
  };
  if(!Object.hasOwn(map,op))fail('unsupported ONNX operator '+op);
  onlyKeys(attrs||{},map[op],op);
  if(op==='Gemm'){
    for(const k of ['alpha','beta']){
      if(attrs?.[k]!==undefined&&(typeof attrs[k]!=='number'||!Number.isFinite(attrs[k])))
        fail('Gemm '+k+' must be finite');
    }
    for(const k of ['transA','transB'])if(attrs?.[k]!==undefined&&attrs[k]!==0&&attrs[k]!==1)
      fail('Gemm '+k+' must be 0 or 1');
  }
  if(op==='Softmax'&&attrs?.axis!==undefined&&attrs.axis!==1)
    fail('Softmax only supports row axis=1');
}
function nodeOp(node,inputs){
  switch(node.op){
    case 'MatMul':
      if(inputs.length!==2)fail('MatMul expects exactly two tensors');
      return multiply(inputs[0],inputs[1]);
    case 'Gemm':{
      if(inputs.length<2||inputs.length>3)fail('Gemm requires two or three tensors');
      const a=node.attrs?.transA?transpose(inputs[0]):inputs[0];
      const b=node.attrs?.transB?transpose(inputs[1]):inputs[1];
      const product=multiply(a,b),[rows,cols]=product.shape;
      const alpha=node.attrs?.alpha??1,beta=node.attrs?.beta??1;
      const bias=inputs.length===3?broadcast(inputs[2],rows,cols,'Gemm bias'):null;
      return {shape:[rows,cols],values:product.values.map((v,i)=>{
        const x=f(f(alpha)*v),y=bias?f(f(beta)*bias.values[i]):0;
        return f(x+y);
      })};
    }
    case 'Add':{
      if(inputs.length!==2)fail('Add expects exactly two tensors');
      const rows=Math.max(inputs[0].shape[0],inputs[1].shape[0]);
      const cols=Math.max(inputs[0].shape[1],inputs[1].shape[1]);
      if(rows*cols>MAX_CELLS)fail('Add exceeds tensor cell budget');
      const a=broadcast(inputs[0],rows,cols,'Add');
      const b=broadcast(inputs[1],rows,cols,'Add');
      return {shape:[rows,cols],values:a.values.map((v,i)=>f(v+b.values[i]))};
    }
    case 'Relu':case 'Sigmoid':{
      if(inputs.length!==1)fail(node.op+' expects exactly one tensor');
      const t=inputs[0];
      return {shape:[...t.shape],values:t.values.map(v=>f(
        node.op==='Relu'?Math.max(0,v):1/(1+Math.exp(-v))
      ))};
    }
    case 'Softmax':{
      if(inputs.length!==1)fail('Softmax expects exactly one tensor');
      const t=inputs[0],[rows,cols]=t.shape,values=new Array(size(t));
      for(let i=0;i<rows;i++){
        const row=t.values.slice(i*cols,(i+1)*cols);
        const max=Math.max(...row),numerators=row.map(x=>Math.exp(x-max));
        const denom=numerators.reduce((s,x)=>s+x,0);
        if(!Number.isFinite(denom)||denom<=0)fail('Softmax numeric overflow or invalid normalization');
        for(let j=0;j<cols;j++)values[i*cols+j]=f(numerators[j]/denom);
      }
      return {shape:[rows,cols],values};
    }
    default: fail('unsupported ONNX operator '+node.op);
  }
}
function normalizeGraph(graph){
  if(!graph||typeof graph!=='object'||Array.isArray(graph))fail('graph missing');
  if(graph.format!==undefined&&graph.format!==ONNX_SUBSET_FORMAT)fail('unsupported ONNX subset graph version');
  if(graph.operatorSet!==undefined&&graph.operatorSet!==ONNX_SUBSET_OPSET)
    fail('unsupported ONNX operator set version');
  if(graph.dtype!==undefined&&graph.dtype!=='float32')
    fail('unsupported ONNX data type (only float32)');
  if(!Array.isArray(graph.inputs)||graph.inputs.length<1||graph.inputs.length>8||
    !Array.isArray(graph.initializers)||graph.initializers.length>32||
    !Array.isArray(graph.nodes)||graph.nodes.length<1||graph.nodes.length>MAX_NODES||
    !Array.isArray(graph.outputs)||graph.outputs.length<1||graph.outputs.length>8)
    fail('graph tensor/node/output count outside supported limits');
}
export function runOnnxSubset(graph,{feeds=null}={}){
  normalizeGraph(graph);
  if(feeds!==null&&(typeof feeds!=='object'||Array.isArray(feeds)))
    fail('input overrides must be a tensor map');
  const memory=new Map(),outputNames=new Set(),nodeIds=new Set();
  let accumulatedCells=0;
  function put(name,t,where){
    requireName(name,where);
    if(memory.has(name))fail('duplicate tensor name or overwritten output '+name);
    accumulatedCells+=size(t);
    if(accumulatedCells>MAX_TOTAL_CELLS||memory.size>=MAX_TENSORS)
      fail('total graph tensor budget exceeded');
    memory.set(name,t);
  }
  const feedNames=new Set(graph.inputs.map(t=>t.name));
  if(feeds)for(const key of Object.keys(feeds))if(!feedNames.has(key))fail('unknown feed name '+key);
  for(const input of graph.inputs){
    const raw=feeds&&Object.hasOwn(feeds,input.name)?
      {name:input.name,shape:input.shape,values:feeds[input.name]}:input;
    put(input.name,tensor(raw,'input'), 'input');
  }
  for(const initializer of graph.initializers)
    put(initializer.name,tensor(initializer,'initializer'),'initializer');
  const trace=[];
  for(const node of graph.nodes){
    if(!node||typeof node!=='object'||Array.isArray(node))fail('invalid ONNX graph node');
    requireName(node.id,'node');
    if(nodeIds.has(node.id))fail('duplicate node id '+node.id);
    nodeIds.add(node.id);
    requireName(node.output,'node output');
    if(!Array.isArray(node.inputs)||node.inputs.some(x=>!safeName(x)))
      fail('node input names must be explicit and valid');
    validateAttrs(node.op,node.attrs);
    const expected={MatMul:2,Gemm:[2,3],Add:2,Relu:1,Sigmoid:1,Softmax:1};
    if(!((Array.isArray(expected[node.op])&&expected[node.op].includes(node.inputs.length))||
       node.inputs.length===expected[node.op]))fail('invalid ONNX operator input arity');
    const data=node.inputs.map(k=>{
      const t=memory.get(k);
      if(!t)fail('unknown, cyclic or future tensor reference '+k);
      return t;
    });
    const out=nodeOp(node,data);
    if(out.values.some(x=>!Number.isFinite(x)))fail('nonfinite output from '+node.id);
    put(node.output,out,'output');
    trace.push({node:node.id,op:node.op,output:node.output,shape:[...out.shape]});
  }
  const outputs={};
  for(const name of graph.outputs){
    requireName(name,'requested output');
    if(outputNames.has(name))fail('duplicate graph output '+name);
    outputNames.add(name);
    const item=memory.get(name);
    if(!item)fail('unresolved graph output '+name);
    outputs[name]={shape:[...item.shape],values:[...item.values]};
  }
  return {
    format:ONNX_SUBSET_FORMAT,operatorSet:ONNX_SUBSET_OPSET,dtype:'float32',
    ok:true,executedNodes:trace.length,trace,outputs,
    engine:'invention-lab-js-tensor-f32',
    independentReference:'NOT RUN by this method; see real ONNX Runtime CI evidence',
    physicalValidation:'none',realWorldBuildSuccessPercent:null,
    limits:'2D fixed-shape float32 subset only; no general ONNX parsing, tensors N-D, GPU/TPU timing, or silicon validation',
  };
}
export function validateOnnxSubset(graph){
  try{
    const result=runOnnxSubset(graph);
    return {ok:true,errors:[],outputs:result.outputs,executedNodes:result.executedNodes};
  }catch(error){return {ok:false,errors:[String(error.message)]};}
}
