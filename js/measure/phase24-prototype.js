// Phase 24 -- reproducible prospective physical ALU measurement protocol.
// No self-reported CSV/JSON or perfect model output constitutes measured silicon.
import {createHash} from 'node:crypto';
export const FORMAT='invention-lab/phase24-physical-alu-capture/1';
export const EVALUATION_FORMAT='invention-lab/phase24-physical-capture-preflight/1';
export const PROTOCOL_ID='sky130-alu8-physical-experiment-v1';
export const RTL_GIT_BLOB='3a41d0163a473a00b17a7c4b1893169961519f54';
export const RTL_PATH='benchmarks/phase13/rtl/alu8.v';
export const SUITE_SHA256='c41a51ffcb1ffbbdc92e5668c98de176746b21ece709f9a235aee4484b23ab26';
export const SHA256=x=>createHash('sha256').update(x).digest('hex');
const hex=(s,n)=>typeof s==='string'&&new RegExp('^[0-9a-f]{'+n+'}$').test(s);
const uint=(x,n)=>Number.isInteger(x)&&x>=0&&x<=n;
const edges=Object.freeze([0,1,2,7,15,16,31,63,64,127,128,129,254,255]);
export function predictedAlu(a,b,op){
 if(!uint(a,255)||!uint(b,255)||!uint(op,3))
  throw Error('ALU input must be an unsigned bounded digital value');
 let y=0,carry=0;
 if(op===0){const sum=a+b;y=sum&255;carry=(sum>>>8)&1;}
 else if(op===1)y=a^b;
 else if(op===2)y=a&b;
 else if(op===3){y=((a<<1)&254)|(b&1);carry=(a>>>7)&1;}
 return {y,carry,zero:y===0?1:0};
}
export function stimulus(){
 const vectors=[],seen=new Set();
 function push(a,b,op){
  const key=(op<<16)|(b<<8)|a;
  if(seen.has(key))return;
  seen.add(key);vectors.push({index:vectors.length,a,b,op});
 }
 for(const a of edges)for(const b of edges)for(let op=0;op<4;op++)push(a,b,op);
 let seed=0x24ab2026;
 while(vectors.length<1024){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;
  const bits=seed&0x3ffff;
  push(bits&255,(bits>>>8)&255,(bits>>>16)&3);
 }
 const digest=SHA256(JSON.stringify(vectors));
 if(digest!==SUITE_SHA256)throw Error('Phase24 frozen stimulus changed unexpectedly');
 return vectors;
}
const emptySpecimen=()=>({
 specimenId:null,lotId:null,waferId:null,dieId:null,packageId:null,
 maskDesignRecordSha256:null,independentFoundryReference:null
});
const emptyInstrument=()=>({
 manufacturer:null,model:null,serialNumber:null,logicThresholdV:null,
 timebaseResolutionS:null,expandedTimingUncertaintyS:null,
 calibrationCertificateSha256:null,calibrationValidUntil:null
});
export function template(){
 return {
  format:FORMAT,protocolId:PROTOCOL_ID,rtlGitBlob:RTL_GIT_BLOB,
  vectorSuiteSha256:SUITE_SHA256,origin:'uncollected',
  device:emptySpecimen(),
  acquisition:{
   sourceInstrumentFileSha256:null,originalFilePath:null,
   measurementDateUtc:null,operator:null,laboratory:null,
   instrument:emptyInstrument(),independentReviewer:null,
   independentReviewRecordSha256:null
  },
  conditions:{supplyV:null,temperatureC:null,loadCapacitanceF:null,
   inputSlewS:null,ambientHumidityPct:null,settlingTimeS:null},
  observations:stimulus().map(v=>({...v,measuredY:null,measuredCarry:null,
   measuredZero:null,measuredDelayS:null})),
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 };
}
function validIso(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s)&&Number.isFinite(Date.parse(s));}
/** Report computational comparison only; never authenticate hardware. */
export function preflight(candidate,{expectedSourceBlob=RTL_GIT_BLOB}={}){
 const blockers=[],warnings=[];
 if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))
  return {format:EVALUATION_FORMAT,readyForIndependentReview:false,
   status:'invalid-capture',errors:['No capture object'],physicalValidation:'none',
   physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 if(candidate.format!==FORMAT||candidate.protocolId!==PROTOCOL_ID||
    candidate.rtlGitBlob!==RTL_GIT_BLOB||expectedSourceBlob!==RTL_GIT_BLOB||
    candidate.vectorSuiteSha256!==SUITE_SHA256)
  blockers.push('Design/protocol/stimulus not exact source-locked planned ALU');
 if(candidate.physicalValidation!=='none'||candidate.physicalVerdict!=='unknown'||
    candidate.realWorldBuildSuccessPercent!==null)
  blockers.push('Self-reported physical validation or chip yield is prohibited');
 const all=stimulus(),rows=candidate.observations;
 let count=0,matches=0,failures=0;
 if(!Array.isArray(rows)||rows.length!==all.length){
  blockers.push('All 1024 planned stimulus identities are required in the original capture');
 }else{
  for(let i=0;i<all.length;i++){
   const s=rows[i],ref=all[i];
   if(!s||s.index!==ref.index||s.a!==ref.a||s.b!==ref.b||s.op!==ref.op){
    blockers.push('Out-of-order, repeated or substituted stimulus at index '+i);continue;
   }
   const fields=['measuredY','measuredCarry','measuredZero'];
   const values=fields.map(k=>s[k]);
   const n=values.filter(x=>x!==null&&x!==undefined).length;
   if(n===0){
    if(s.measuredDelayS!==null&&s.measuredDelayS!==undefined)
     blockers.push('Delay supplied without complete digital output at vector '+i);
    continue;
   }
   if(n!==3||!uint(s.measuredY,255)||!uint(s.measuredCarry,1)||
      !uint(s.measuredZero,1)){
    blockers.push('Malformed or incomplete output triplet at vector '+i);continue;
   }
   if(typeof s.measuredDelayS!=='number'||!Number.isFinite(s.measuredDelayS)||
     s.measuredDelayS<0||s.measuredDelayS>1)
     blockers.push('Missing or nonphysical measured propagation delay at vector '+i);
   count++;
   const predicted=predictedAlu(s.a,s.b,s.op);
   if(predicted.y===s.measuredY&&predicted.carry===s.measuredCarry&&
     predicted.zero===s.measuredZero)matches++;else failures++;
  }
 }
 if(count!==all.length)blockers.push('Only '+count+'/'+all.length+' complete observed vectors');
 // Acquisition data are reviewed as RECORDS, not automatically authenticated.
 const d=candidate.device??{},a=candidate.acquisition??{},ins=a.instrument??{},
   e=candidate.conditions??{};
 for(const field of ['specimenId','lotId','waferId','dieId','packageId',
    'independentFoundryReference'])
  if(typeof d[field]!=='string'||!d[field].trim())
   blockers.push('Device manufacture provenance missing '+field);
 if(!hex(d.maskDesignRecordSha256,64))
  blockers.push('Physical mask/design chain fingerprint missing');
 if(!hex(a.sourceInstrumentFileSha256,64)||!a.originalFilePath||
    typeof a.originalFilePath!=='string')
  blockers.push('Unchanged original external instrument file and independently checked digest missing');
 if(!validIso(a.measurementDateUtc)||!a.operator||!a.laboratory)
  blockers.push('Acquisition timestamp/operator/laboratory incomplete');
 for(const f of ['manufacturer','model','serialNumber'])
  if(typeof ins[f]!=='string'||!ins[f].trim())blockers.push('Instrument identity missing '+f);
 for(const f of ['logicThresholdV','timebaseResolutionS','expandedTimingUncertaintyS']){
  if(typeof ins[f]!=='number'||!Number.isFinite(ins[f])||ins[f]<0||
     (f!=='logicThresholdV'&&ins[f]===0))
   blockers.push('Instrument quantitative specification invalid '+f);
 }
 if(!hex(ins.calibrationCertificateSha256,64)||!validIso(ins.calibrationValidUntil))
  blockers.push('Traceable calibrated instrument certificate and validity missing');
 else if(validIso(a.measurementDateUtc)&&
  Date.parse(ins.calibrationValidUntil)<Date.parse(a.measurementDateUtc))
  blockers.push('Instrument calibration expired before measurement');
 for(const f of ['supplyV','temperatureC','loadCapacitanceF','inputSlewS','settlingTimeS']){
  if(typeof e[f]!=='number'||!Number.isFinite(e[f]))
   blockers.push('Electrical operating condition not documented '+f);
 }
 if(!Number.isFinite(e.supplyV)||e.supplyV<=0||e.supplyV>5)
  blockers.push('Supply voltage out of bounded test protocol');
 if(!Number.isFinite(e.settlingTimeS)||e.settlingTimeS<=0)
  blockers.push('Stimulus settling time must be positive');
 if(!a.independentReviewer||!hex(a.independentReviewRecordSha256,64))
  blockers.push('Independent acquisition reviewer and source-matched attestation not provided');
 if(candidate.origin==='synthetic-test-fixture'||candidate.origin==='numerical-reference')
  blockers.push('Computational fixture cannot establish physical acquisition');
 if(candidate.origin!=='uncollected'&&candidate.origin!=='claimed-real-measurement'&&
    candidate.origin!=='synthetic-test-fixture'&&candidate.origin!=='numerical-reference')
  blockers.push('Unknown origin claim');
 // An internal review-record hash is not a digital signature, calibration
 // certificate, or an independently verified lab. Never self-authorize here.
 warnings.push('Even complete self-reported instrument data require independent source authentication, chip identity review, multiple dies/lots and uncertainty validation.');
 warnings.push('One capture is not a production yield estimate, PVT qualification, full silicon/physical validation or proof that simulation replaces testing.');
 let status=count===0?'awaiting-real-hardware':blockers.length?'incomplete-or-inconsistent-capture':'candidate-awaiting-external-review';
 if(count&&failures>0){
  blockers.push(failures+' recorded functional mismatch(es) against frozen ALU RTL');
  status='observed-functional-mismatch-unverified';
 }
 return {format:EVALUATION_FORMAT,status,
  protocolId:PROTOCOL_ID,vectorSuiteSha256:SUITE_SHA256,observationsRequired:all.length,
  observationsComplete:count,modelsAgreed:matches,modelsDisagreed:failures,
  candidateAgreementFraction:count?matches/count:null,
  requiresIndependentOriginAudit:true,needsSeparateLotWaferHoldouts:true,
  readyForIndependentReview:count===all.length&&blockers.length===0,
  blockers,warnings,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export function replayTemplate(record,expected){
 const blockers=[];
 if(JSON.stringify(record)!==JSON.stringify(expected))
  blockers.push('Actual generated template or its null measurements were altered');
 const result=preflight(record);
 if(result.status!=='awaiting-real-hardware'||result.observationsComplete!==0||
    result.candidateAgreementFraction!==null)
  blockers.push('Generated template fabricated measurements or a success claim');
 return {ok:blockers.length===0,blockers,templateStatus:result.status,
  plannedStimuli:stimulus().length,reportedActualPhysicalReadings:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
