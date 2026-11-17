// Phase 11 evidence policy: preserve the exact six fixed input/output cases.
// Reject altered acceptance, incomplete actual CPU output, changed source
// hashes, output byte digests, stale commits and fabricated physical claims.
import {createHash} from 'node:crypto';
import {runPhase11Case} from '../labs/ai/onnx-per-axis-conv.js';
export const PHASE11_REQUIRED=Object.freeze([
 ['qconv-uint8-valid','QLinearConv','uint8',[1,1,2,2],[121,110,126,135]],
 ['qconv-int8-pad-stride','QLinearConv','int8',[1,1,2,2],[-3,25,-1,-16]],
 ['qconv-mixed-per-channel','QLinearConv','uint8',[1,2,2,2],[192,129,178,152,255,204,34,144]],
 ['qconv-int8-saturation','QLinearConv','int8',[1,2,2,2],[127,127,127,127,-128,-128,-128,-128]],
 ['per-axis-int8-axis1','PerAxisQDQ','float32',[2,3],[-1,-0.75,0,0.5,1.5,8]],
 ['per-axis-uint8-negative-axis','PerAxisQDQ','float32',[2,3],[-32,0.25,31.75,0,8,-1.5]],
]);
const Q_EXPECTED={
 'per-axis-int8-axis1':[-2,-2,-1,1,7,7],
 'per-axis-uint8-negative-axis':[0,129,255,3,19,0],
};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export function outputDigest(dtype,values){
 if(!Array.isArray(values)||values.length<1||values.length>4096)throw Error('bad tensor result size');
 const buf=Buffer.alloc(values.length*(dtype==='float32'?4:1));
 values.forEach((value,i)=>{
   if(typeof value!=='number'||!Number.isFinite(value))throw Error('non-finite output');
   if(dtype==='float32'){
     if(!Number.isFinite(Math.fround(value)))throw Error('float32 overflow');
     buf.writeFloatLE(value,i*4);
   }else if(dtype==='int8')buf.writeInt8(value,i);
   else if(dtype==='uint8')buf.writeUInt8(value,i);
   else throw Error('unsupported ONNX output type');
 });
 return createHash('sha256').update(buf).digest('hex');
}
export function evaluatePhase11(manifest,fixture,evidence,{
 commitSha=null,fixtureSha256=null,oracleSha256=null,
}={}){
 const errors=[];
 if(manifest?.format!=='invention-lab/phase11-acceptance/1'||
   manifest?.opset!==13||manifest?.fixture!=='benchmarks/phase11/cases.json'||
   manifest?.oracle!=='scripts/phase11-onnx-oracle.py'||
   manifest?.tolerance?.integer!=='exact'||
   manifest?.tolerance?.floatAbsolute!==1e-6||
   manifest?.tolerance?.floatScaledRelative!==1e-6||
   manifest?.physicalValidation!=='none'||
   manifest?.realWorldBuildSuccessPercent!==null||
   !Array.isArray(manifest?.required)||manifest.required.length!==PHASE11_REQUIRED.length)
   errors.push('Missing or weakened acceptance manifest');
 if(fixture?.format!=='invention-lab/phase11-fixtures/1'||fixture?.opset!==13||
   !Array.isArray(fixture?.cases)||fixture.cases.length!==PHASE11_REQUIRED.length)
   errors.push('Missing, malformed or truncated input fixture');
 if(evidence?.format!=='invention-lab/phase11-evidence/1'||evidence?.verdict!=='pass'||
   evidence?.opset!==13||evidence?.referenceEngine!=='ONNX Runtime CPUExecutionProvider'||
   !Array.isArray(evidence?.cases)||evidence.cases.length!==PHASE11_REQUIRED.length)
   errors.push('Missing, failed or incomplete real reference report');
 if(commitSha&&evidence?.commitSha!==commitSha)errors.push('Stale source commit');
 if(!hash(evidence?.fixtureSha256)||fixtureSha256&&evidence.fixtureSha256!==fixtureSha256)
   errors.push('Fixture SHA mismatch');
 if(!hash(evidence?.oracleSha256)||oracleSha256&&evidence.oracleSha256!==oracleSha256)
   errors.push('Reference oracle SHA mismatch');
 if(evidence?.physicalValidation!=='none'||evidence?.realWorldBuildSuccessPercent!==null)
   errors.push('Fabricated physical validation / build-success claim');
 for(const [name,v] of Object.entries({onnx:'1.23.2',onnxruntime:'1.32.0',numpy:'2.4.6'}))
   if(evidence?.versions?.[name]!==v)errors.push('Unpinned actual external tool '+name);
 const seen=new Set();
 let passed=0;
 for(let i=0;i<PHASE11_REQUIRED.length;i++){
   const [id,op,dtype,shape,expected]=PHASE11_REQUIRED[i];
   const frozen=manifest?.required?.[i],input=fixture?.cases?.[i],report=evidence?.cases?.[i];
   const start=errors.length;
   if(!frozen||frozen.id!==id||frozen.op!==op||frozen.dtype!==dtype||
     !equal(frozen.shape,shape)||!equal(frozen.values,expected)||
     !equal(frozen.quantized,Q_EXPECTED[id]))
     errors.push('Acceptance policy changed expected case '+id);
   if(!input||input.id!==id||input.op!==op)
     errors.push('Fixture missing or reordered '+id);
   if(!report||report.id!==id||report.op!==op||report.verdict!=='pass'||!hash(report.modelSha256))
     errors.push('Missing, skipped or relabeled actual ONNX result '+id);
   if(report?.id){
     if(seen.has(report.id))errors.push('Duplicate case '+report.id);
     seen.add(report.id);
   }
   if(!input||!report)continue;
   try {
     const model=runPhase11Case(input);
     const out=report.output;
     if(!out||out.name!=='Y'||out.dtype!==dtype||
       !equal(out.shape,shape)||!equal(out.shape,model.output.shape)||
       !equal(out.jsValues,model.output.values)||!hash(out.sha256)||
       outputDigest(dtype,out.values)!==out.sha256||
       !Array.isArray(out.values)||out.values.length!==expected.length)
       throw Error('Malformed ONNX Y payload or binary hash');
     const tol=dtype==='float32'?1e-6:0;
     const errorsArr=out.values.map((v,j)=>Math.abs(v-model.output.values[j]));
     const maxAbs=Math.max(...errorsArr);
     const maxRel=Math.max(...errorsArr.map((v,j)=>v/Math.max(1,Math.abs(out.values[j]))));
     if(!Number.isFinite(maxAbs)||!Number.isFinite(maxRel)||
       maxAbs>tol||maxRel>tol||
       Math.abs(maxAbs-report.maxAbsoluteError)>1e-12||
       Math.abs(maxRel-report.maxRelativeError)>1e-12||
       out.values.some((v,j)=>Math.abs(v-expected[j])>tol))
       throw Error('External arithmetic differs or error budget altered');
     if(op==='PerAxisQDQ'){
       const q=report.quantized,expectQ=Q_EXPECTED[id];
       if(!q||q.name!=='Q'||q.dtype!==model.quantized.dtype||
         !equal(q.shape,model.quantized.shape)||
         !equal(q.values,expectQ)||!equal(q.jsValues,expectQ)||
         !hash(q.sha256)||outputDigest(q.dtype,q.values)!==q.sha256)
         throw Error('Missing per-axis quantized intermediate');
     } else if(report.quantized!==null)throw Error('Unexpected Q output for convolution');
   } catch(error){errors.push('Reference integrity failure '+id+': '+error.message);}
   if(errors.length===start)passed++;
 }
 return {ok:errors.length===0,errors,passed,required:PHASE11_REQUIRED.length,
   physicalValidation:'none',realWorldBuildSuccessPercent:null};
}
