// Phase 10 evidence gate. A PASS record is not accepted unless the exact
// committed fixture, frozen reference vectors, real output hashes, model
// protobuf digests, tool versions and complete case IDs all agree.
// This gate cannot establish whether measurements were made on real silicon.
import {createHash} from 'node:crypto';
import {runOnnxQuantizedCase} from '../labs/ai/onnx-quantized.js';
export const PHASE10_ACCEPTANCE_FORMAT='invention-lab/phase10-acceptance/1';
export const PHASE10_EVIDENCE_FORMAT='invention-lab/phase10-quantized-evidence/1';
export const PHASE10_REQUIRED=Object.freeze([
  ['qlinear-int8-symmetric','int8',[-6,4,10,-17]],
  ['qlinear-uint8-offset','uint8',[121,98,181,23]],
  ['qlinear-int8-saturation','int8',[127,-128,-128,127]],
  ['qlinear-uint8-saturation','uint8',[255,3,3,3]],
  ['qdq-int8-ties-even','float32',[-1,-1,0,0,1,1,63.5,-64]],
  ['qdq-uint8-offset-saturation','float32',[-32,0,0.25,0.75,1.25,31.75,31.75,-32]],
]);
const EXPECTED_INTERMEDIATES=new Map([
  ['qdq-int8-ties-even',[-2,-2,0,0,2,2,127,-128]],
  ['qdq-uint8-offset-saturation',[0,128,129,131,133,255,255,0]]
]);
const shaok=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const valueok=x=>typeof x==='number'&&Number.isFinite(x);
function bytesOf(type,values){
  if(!Array.isArray(values)||values.length<1||values.length>4096||
    !values.every(valueok))throw Error('invalid output data');
  const bytes=Buffer.alloc(values.length*(type==='float32'?4:1));
  values.forEach((v,i)=>{
    if(type==='int8'){
      if(!Number.isInteger(v)||v < -128||v>127)throw Error('invalid int8 output');
      bytes.writeInt8(v,i);
    } else if(type==='uint8'){
      if(!Number.isInteger(v)||v<0||v>255)throw Error('invalid uint8 output');
      bytes.writeUInt8(v,i);
    } else if(type==='float32'){
      if(!Number.isFinite(Math.fround(v)))throw Error('invalid float32 output');
      bytes.writeFloatLE(v,i*4);
    } else throw Error('unsupported output datatype');
  });
  return createHash('sha256').update(bytes).digest('hex');
}
export function evaluatePhase10Evidence(manifest,report,fixture,{
  commitSha=null,fixtureSha256=null,oracleSourceSha256=null,
}={}){
 const errors=[];
 if(manifest?.format!==PHASE10_ACCEPTANCE_FORMAT||
    manifest?.fixtures!=='benchmarks/phase10/quantized-cases.json'||
    manifest?.oracle!=='scripts/phase10-onnx-oracle.py'||
    manifest?.opset!==13||
    manifest?.physicalValidation!=='none'||
    manifest?.realWorldBuildSuccessPercent!==null||
    manifest?.frozenNumericalPolicy?.quantizedInteger!=='exact'||
    manifest?.frozenNumericalPolicy?.dequantizedAbsolute!==1e-6||
    manifest?.frozenNumericalPolicy?.dequantizedRelative!==1e-6||
    !Array.isArray(manifest?.required)||manifest.required.length!==PHASE10_REQUIRED.length)
      errors.push('Missing or altered frozen Phase10 acceptance manifest');
 if(fixture?.format!=='invention-lab/phase10-quantized-fixtures/1'||
    fixture?.opset!==13||fixture?.perTensorScalesOnly!==true||
    !Array.isArray(fixture?.cases)||fixture.cases.length!==PHASE10_REQUIRED.length)
      errors.push('Missing, unsupported or truncated quantized fixture');
 if(!report||report.format!==PHASE10_EVIDENCE_FORMAT||
    report.verdict!=='pass'||report.referenceEngine!=='ONNX Runtime CPUExecutionProvider'||
    report.opset!==13||!Array.isArray(report.cases)||report.cases.length!==PHASE10_REQUIRED.length)
      errors.push('Missing or incomplete independently executed ONNX Runtime reference');
 if(report?.physicalValidation!=='none'||report?.realWorldBuildSuccessPercent!==null)
      errors.push('Forbidden unmeasured silicon or manufacturing-success claim');
 if(commitSha&&report?.commitSha!==commitSha)errors.push('Commit identity mismatch');
 if(!shaok(report?.fixtureSha256)||(fixtureSha256&&report.fixtureSha256!==fixtureSha256))
      errors.push('Fixture digest mismatch');
 if(!shaok(report?.oracleSourceSha256)||(oracleSourceSha256&&report.oracleSourceSha256!==oracleSourceSha256))
      errors.push('Independent oracle source digest mismatch');
 for(const [key,version] of Object.entries({onnx:'1.23.2',onnxruntime:'1.32.0',numpy:'2.4.6'})){
    if(report?.versions?.[key]!==version)errors.push('Missing, unpinned or wrong '+key+' reference version');
 }
 const seen=new Set();
 let passed=0;
 for(let i=0;i<PHASE10_REQUIRED.length;i++){
   const [id,type,expected]=PHASE10_REQUIRED[i];
   const declared=manifest?.required?.[i],input=fixture?.cases?.[i],row=report?.cases?.[i];
   const baseline=errors.length;
   if(!declared||declared.id!==id||declared.dtype!==type||!equal(declared.values,expected))
     errors.push('Frozen reference vector modified '+id);
   if(!input||input.id!==id)errors.push('Missing/reordered input fixture '+id);
   if(!row||row.id!==id||row.verdict!=='pass'||!shaok(row.modelSha256))
     errors.push('Missing/reordered/skipped ONNX execution '+id);
   if(row?.id){
     if(seen.has(row.id))errors.push('Duplicate case ID '+row.id);
     seen.add(row.id);
   }
   if(!input||!row)continue;
   try{
     const actual=runOnnxQuantizedCase(input);
     const output=row.output;
     if(!output||output.name!=='Y'||output.dtype!==type||
       !equal(output.shape,actual.output.shape)||
       !equal(output.jsValues,actual.output.values)||
       !Array.isArray(output.onnxValues)||output.onnxValues.length!==expected.length||
       !shaok(output.onnxOutputSha256)||
       bytesOf(type,output.onnxValues)!==output.onnxOutputSha256){
       errors.push('Malformed, stale or unhashed ONNX output '+id);
       continue;
     }
     const differences=output.jsValues.map((v,j)=>Math.abs(v-output.onnxValues[j]));
     const absolute=Math.max(...differences);
     const relative=Math.max(...differences.map((v,j)=>v/Math.max(1,Math.abs(output.onnxValues[j]))));
     const tol=type==='float32'?1e-6:0;
     if(!differences.every(Number.isFinite)||absolute>tol||relative>tol||
       !valueok(row.maxAbsoluteError)||!valueok(row.maxRelativeError)||
       Math.abs(row.maxAbsoluteError-absolute)>1e-12||
       Math.abs(row.maxRelativeError-relative)>1e-12||
       output.onnxValues.some((v,j)=>Math.abs(v-expected[j])>tol))
       errors.push('ONNX output mismatches frozen vector or numerical budget '+id);
     const expectedQ=EXPECTED_INTERMEDIATES.get(id);
     if(expectedQ){
       const q=row.intermediates;
       const qout=q?.[0];
       if(!Array.isArray(q)||q.length!==1||qout?.name!=='Q'||
         qout.dtype!==actual.quantized.dtype||
         !equal(qout.shape,actual.quantized.shape)||
         !equal(qout.jsValues,expectedQ)||
         !equal(qout.onnxValues,expectedQ)||
         !shaok(qout.onnxOutputSha256)||
         bytesOf(qout.dtype,qout.onnxValues)!==qout.onnxOutputSha256)
         errors.push('Missing or incorrect signed/unsigned Q intermediate '+id);
     }else if(!Array.isArray(row.intermediates)||row.intermediates.length!==0)
       errors.push('Unexpected quantized intermediate '+id);
   }catch(error){errors.push('Invalid or nonfinite reference '+id+': '+error.message);}
   if(errors.length===baseline)passed++;
 }
 return {ok:errors.length===0,errors,passed,required:PHASE10_REQUIRED.length,
  physicalValidation:'none',realWorldBuildSuccessPercent:null};
}
