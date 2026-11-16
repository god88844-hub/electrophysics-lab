// Fail-closed Phase 9 evidence gate — an executable model must have been
// evaluated by a real external reference in CI. This verifier checks completeness,
// numerical consistency, frozen scope and provenance, NOT real silicon authenticity.
import {createHash} from 'node:crypto';
export const PHASE9_ACCEPTANCE_FORMAT='invention-lab/phase9-onnx-acceptance/1';
export const PHASE9_REPORT_FORMAT='invention-lab/phase9-onnx-independent/1';
export const REQUIRED_ONNX_CASES=Object.freeze([
  ['matmul-relu',['MatMul','Relu']],
  ['gemm-sigmoid',['Gemm','Sigmoid']],
  ['add-softmax',['Add','Softmax']],
  ['gemm-transpose',['Gemm']],
  ['two-layer-mlp',['Gemm','Relu','Gemm','Softmax']],
]);
const hash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const isArrayOfNumbers=xs=>Array.isArray(xs)&&xs.length>0&&xs.length<=4096&&
  xs.every(x=>typeof x==='number'&&Number.isFinite(x));
const fail=(errors,what)=>{errors.push(what);};
export function evaluatePhase9Evidence(manifest,report,fixtures,{commitSha=null,fixtureSha256=null,oracleSourceSha256=null}={}){
  const errors=[];
  const requirements=manifest?.requiredCases;
  if(manifest?.format!==PHASE9_ACCEPTANCE_FORMAT||
    manifest?.operatorSet!==13||manifest?.dtype!=='float32'||
    manifest?.fixturePath!=='benchmarks/phase9/graphs.json'||
    manifest?.referencePath!=='scripts/phase9-onnxruntime-oracle.py'||
    manifest?.tolerance?.maxAbsoluteError!==1e-5||
    manifest?.tolerance?.maxRelativeError!==1e-5||
    !Array.isArray(requirements)||requirements.length!==REQUIRED_ONNX_CASES.length)
    fail(errors,'Frozen ONNX acceptance policy modified or missing');
  if(fixtures?.format!=='invention-lab/onnx-subset-fixtures/1'||
    fixtures?.operatorSet!==13||fixtures?.dtype!=='float32'||
    !Array.isArray(fixtures.cases)||fixtures.cases.length!==REQUIRED_ONNX_CASES.length)
    fail(errors,'Frozen graph fixture count, format, dtype or opset changed');
  for(let i=0;i<REQUIRED_ONNX_CASES.length;i++){
    const [id,ops]=REQUIRED_ONNX_CASES[i];
    const requirement=requirements?.[i],graph=fixtures?.cases?.[i];
    if(!requirement||requirement.id!==id||JSON.stringify(requirement.ops)!==JSON.stringify(ops)||
      JSON.stringify(requirement.outputs)!==JSON.stringify(['Y']))
      fail(errors,'Frozen acceptance case changed at '+id);
    if(!graph||graph.id!==id||JSON.stringify(graph.nodes?.map(n=>n.op))!==JSON.stringify(ops)||
      JSON.stringify(graph.outputs)!==JSON.stringify(['Y']))
      fail(errors,'Frozen graph operator sequence or graph output changed at '+id);
  }
  if(!report||report.format!==PHASE9_REPORT_FORMAT||report.verdict!=='pass'||
    report.referenceEngine!=='ONNX Runtime CPUExecutionProvider'||
    report.operatorSet!==13||report.dtype!=='float32')
    fail(errors,'Missing, failed or unsupported ONNX Runtime evidence');
  if(commitSha&&report?.commitSha!==commitSha)fail(errors,'Commit SHA mismatch');
  if(!hash(report?.fixtureSha256)||fixtureSha256&&report.fixtureSha256!==fixtureSha256)
    fail(errors,'Missing or altered fixture source SHA-256');
  if(!hash(report?.oracleSourceSha256)||oracleSourceSha256&&report.oracleSourceSha256!==oracleSourceSha256)
    fail(errors,'Missing or altered independent oracle source SHA-256');
  if(!report?.versions?.onnx||!report?.versions?.onnxruntime||!report?.versions?.numpy)
    fail(errors,'Missing actual reference dependency versions');
  if(report?.physicalValidation!=='none'||report?.realWorldBuildSuccessPercent!==null)
    fail(errors,'False physical validation or yield probability claim');
  if(!Array.isArray(report?.cases)||report.cases.length!==REQUIRED_ONNX_CASES.length)
    fail(errors,'Missing/extra ONNX reference cases');
  const seen=new Set();
  let passed=0;
  if(Array.isArray(report?.cases))for(let i=0;i<report.cases.length;i++){
    const row=report.cases[i],frozen=REQUIRED_ONNX_CASES[i];
    if(!row||typeof row.id!=='string'){fail(errors,'Malformed ONNX reference case');continue;}
    if(seen.has(row.id))fail(errors,'Duplicate ONNX reference case '+row.id);
    seen.add(row.id);
    const errorsBefore=errors.length;
    if(!frozen||row.id!==frozen[0]||
      JSON.stringify(row.operatorSequence)!==JSON.stringify(frozen[1])||
      !hash(row.modelSha256)||row.verdict!=='pass')
      fail(errors,'Invalid, skipped or reordered ONNX case '+row.id);
    if(!Array.isArray(row.outputs)||row.outputs.length!==1)
      fail(errors,'Missing/extra ONNX outputs '+row.id);
    else for(const output of row.outputs){
      if(!output||output.name!=='Y'||!Array.isArray(output.shape)||output.shape.length!==2||
        output.shape.some(d=>!Number.isInteger(d)||d<=0)||
        !isArrayOfNumbers(output.jsValues)||!isArrayOfNumbers(output.onnxValues)||
        output.jsValues?.length!==output.onnxValues?.length||
        output.shape?.[0]*output.shape?.[1]!==output.jsValues?.length||
        !hash(output.onnxOutputSha256)){
        fail(errors,'Malformed ONNX output numerical evidence '+row.id);
        continue;
      }
      const buf=Buffer.alloc(output.onnxValues.length*4);
      output.onnxValues.forEach((value,k)=>buf.writeFloatLE(value,k*4));
      if(createHash('sha256').update(buf).digest('hex')!==output.onnxOutputSha256)
        fail(errors,'Independent ONNX output bytes SHA mismatch '+row.id);
      const diffs=output.jsValues.map((v,k)=>Math.abs(v-output.onnxValues[k]));
      const absolute=Math.max(...diffs);
      const relative=Math.max(...diffs.map((d,k)=>d/Math.max(1,Math.abs(output.onnxValues[k]))));
      if(!Number.isFinite(absolute)||!Number.isFinite(relative)||
        absolute>1e-5||relative>1e-5||
        Math.abs(absolute-output.maxAbsoluteError)>1e-12||
        Math.abs(relative-output.maxRelativeError)>1e-12)
        fail(errors,'ONNX error exceeds fixed tolerance or reported errors are inconsistent '+row.id);
    }
    if(errors.length===errorsBefore)passed++;
  }
  for(const [id] of REQUIRED_ONNX_CASES)if(!seen.has(id))
    fail(errors,'Missing mandatory ONNX operator graph '+id);
  return {
    ok:errors.length===0,errors,passed,required:REQUIRED_ONNX_CASES.length,
    physicalValidation:'none',realWorldBuildSuccessPercent:null
  };
}
