// Phase27: prospective lot-blinded ALU experiment; no fabricated hardware data.
// A source digest of self-declared instrument bytes is not independent lab proof.
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {predictedAlu,stimulus,RTL_GIT_BLOB,SUITE_SHA256} from './phase24-prototype.js';
export const FORMAT='invention-lab/phase27-blind-study-plan/1';
export const CAPTURE='invention-lab/phase27-capture/1';
export const SHA=b=>createHash('sha256').update(b).digest('hex');
const isHash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const str=x=>typeof x==='string'&&x.trim().length>0&&x.length<=512;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const iso=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(x)&&Number.isFinite(Date.parse(x));
export const CORNERS=[{id:'tt',tempC:25,voltageV:1.8},{id:'ss',tempC:100,voltageV:1.6},{id:'ff',tempC:-40,voltageV:1.95}];
export const POLICY={format:FORMAT,target:'sky130-alu8',rtlBlob:RTL_GIT_BLOB,vectorsSha256:SUITE_SHA256,
 dieCount:8,lots:2,wafersPerLot:2,diesPerWafer:2,plannedCorners:CORNERS,
 repeatsPerCorner:2,vectorsPerSession:1024,sessions:48,plannedMeasurements:49152,
 wholeLotHoldout:true,maxDigitalErrors:0,exploratoryMaxPropagationDelayS:2e-8,
 perVectorTimingPredictionsAvailable:false,independentInstrumentAuthenticationAvailable:false,
 realALUMeasurements:0,qualifiedFoundrySignoff:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
export function verifyPlan(x){if(!isDeepStrictEqual(x,POLICY))throw Error('Frozen Phase27 physical study acceptance changed');return true}
export function slots(){
 return ['C','H'].flatMap(group=>[1,2].flatMap(w=>[1,2].map(d=>({
  slotId:group+'-W'+w+'-D'+d,
  role:group==='C'?'calibration':'holdout',group,waferGroup:group+'-W'+w
 }))));
}
export function sessions(){
 return slots().flatMap(s=>CORNERS.flatMap(c=>[1,2].map(repeat=>({
  sessionId:s.slotId+'-'+c.id+'-R'+repeat,slotId:s.slotId,group:s.group,role:s.role,
  cornerId:c.id,tempC:c.tempC,voltageV:c.voltageV,repeat
 }))));
}
export function predictionBundle(){
 const outputs=stimulus().map(x=>({...x,...predictedAlu(x.a,x.b,x.op)}));
 return {format:'invention-lab/phase27-premeasurement-reference/1',
  rtlBlob:RTL_GIT_BLOB,vectorsSha256:SUITE_SHA256,
  predictionsAreLogicOnly:true,perVectorTimingPredictionsAvailable:false,outputs};
}
export function blankCapture(){
 const predictionDigest=SHA(JSON.stringify(predictionBundle()));
 return {format:CAPTURE,rtlBlob:RTL_GIT_BLOB,vectorsSha256:SUITE_SHA256,
  predictionDigest,origin:'uncollected',modelFreezeCommit:null,modelSelectedUsingHoldout:false,
  calibrationUsedSlotIds:[],
  devices:slots().map(s=>({...s,lotId:null,waferId:null,dieId:null,
   packageId:null,maskSha256:null,foundryRecordSha256:null})),
  sessions:sessions().map(s=>({...s,observations:null,measuredAtUtc:null,
   laboratory:null,instrumentSerial:null,originalRawSha256:null,
   calibrationCertificateSha256:null,calibrationValidUntilUtc:null,
   expandedTimingUncertaintyS:null,inputSlewS:null,loadCapacitanceF:null,
   independentReviewer:null,reviewRecordSha256:null})),
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export function auditCandidate(c,{rawFiles={}}={}){
 const errors=[];
 const fail=(condition,reason)=>{if(!condition&&errors.length<100)errors.push(reason)};
 const wanted=blankCapture(),predictions=predictionBundle().outputs;
 if(!c||typeof c!=='object'||Array.isArray(c))
  return {status:'invalid-capture',errors:['No capture'],observedVectors:0,
    physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 fail(c.format===CAPTURE&&c.rtlBlob===RTL_GIT_BLOB&&c.vectorsSha256===SUITE_SHA256&&
  c.predictionDigest===wanted.predictionDigest,'Frozen prediction and source digest mismatch');
 fail(c.physicalValidation==='none'&&c.physicalVerdict==='unknown'&&
  c.realWorldBuildSuccessPercent===null,'Cannot self-authorize silicon status');
 fail(['uncollected','claimed-real-measurement'].includes(c.origin),'Synthetic or invented origin disallowed');
 fail(c.modelSelectedUsingHoldout===false,'Holdout used for model selection');
 if(c.origin==='claimed-real-measurement')
  fail(typeof c.modelFreezeCommit==='string'&&/^[0-9a-f]{40}$/.test(c.modelFreezeCommit),'Model not frozen before alleged acquisition');
 const expectedSlots=slots(),dev=c.devices;
 if(!Array.isArray(dev)||dev.length!==8)errors.push('All eight die slots required');
 else{
  const lotIds=new Map(),waferIds=new Map();
  for(let i=0;i<8;i++){
   const s=expectedSlots[i],d=dev[i];
   fail(d&&[s.slotId,s.role,s.group,s.waferGroup].every((v,k)=>v===[d?.slotId,d?.role,d?.group,d?.waferGroup][k]),'Changed or reordered whole-die slot '+i);
   if(!d||c.origin==='uncollected')continue;
   for(const key of ['lotId','waferId','dieId','packageId'])fail(str(d[key]),'Unproven physical '+key);
   for(const key of ['maskSha256','foundryRecordSha256'])fail(isHash(d[key]),'Missing fab fingerprint '+key);
   if(lotIds.has(s.group))fail(lotIds.get(s.group)===d.lotId,'Assigned lot inconsistent');
   lotIds.set(s.group,d.lotId);
   if(waferIds.has(s.waferGroup))fail(waferIds.get(s.waferGroup)===d.waferId,'Assigned wafer inconsistent');
   waferIds.set(s.waferGroup,d.waferId);
  }
  if(c.origin==='claimed-real-measurement'){
   fail(lotIds.size===2&&lotIds.get('C')!==lotIds.get('H'),'Whole-lot blind holdout leakage');
   fail(new Set(waferIds.values()).size===4,'Repeated physical wafer IDs across groups');
   fail(new Set(dev.map(d=>[d?.lotId,d?.waferId,d?.dieId].join('/'))).size===8,'Repeated physical die identities');
   const used=c.calibrationUsedSlotIds;
   fail(Array.isArray(used)&&new Set(used).size===used.length&&
      used.every(id=>expectedSlots.some(s=>s.slotId===id&&s.role==='calibration')),
      'Validation lot was used to calibrate or select model');
  }
 }
 const expected=sessions(),actual=c.sessions;
 let observed=0,mismatches=0,invalidDelays=0,slow=0,goodSessions=0,sourceFilesMatched=0;
 if(!Array.isArray(actual)||actual.length!==48)errors.push('All 48 sessions required');
 else for(let i=0;i<48;i++){
  const s=expected[i],d=actual[i];
  fail(d&&[s.sessionId,s.slotId,s.group,s.role,s.cornerId,s.tempC,s.voltageV,s.repeat]
   .every((v,k)=>v===[d?.sessionId,d?.slotId,d?.group,d?.role,d?.cornerId,d?.tempC,d?.voltageV,d?.repeat][k]),
    'Session schedule/identity modified '+i);
  if(!d)continue;
  if(d.observations===null)continue;
  if(!Array.isArray(d.observations)||d.observations.length!==1024){
   fail(false,'Incomplete session measurements '+s.sessionId);continue;
  }
  fail(iso(d.measuredAtUtc)&&str(d.laboratory)&&str(d.instrumentSerial)&&
   isHash(d.originalRawSha256)&&isHash(d.calibrationCertificateSha256)&&
   iso(d.calibrationValidUntilUtc)&&iso(d.measuredAtUtc)&&
   Date.parse(d.calibrationValidUntilUtc)>=Date.parse(d.measuredAtUtc)&&
   finite(d.expandedTimingUncertaintyS)&&d.expandedTimingUncertaintyS>0&&
   finite(d.inputSlewS)&&d.inputSlewS>0&&finite(d.loadCapacitanceF)&&
   d.loadCapacitanceF>0&&str(d.independentReviewer)&&isHash(d.reviewRecordSha256),
   'Instrument/certificate/condition/independent reviewer not provided '+s.sessionId);
  const raw=rawFiles[s.sessionId];
  if(raw&&SHA(raw)===d.originalRawSha256)sourceFilesMatched++;
  else fail(false,'Original instrument export source hash mismatch '+s.sessionId);
  let good=true;
  for(let k=0;k<1024;k++){
   const v=d.observations[k],p=predictions[k];
   if(!v||[p.index,p.a,p.b,p.op].some((x,j)=>x!==[v?.index,v?.a,v?.b,v?.op][j])||
      !Number.isInteger(v.measuredY)||v.measuredY<0||v.measuredY>255||
      !Number.isInteger(v.measuredCarry)||v.measuredCarry<0||v.measuredCarry>1||
      !Number.isInteger(v.measuredZero)||v.measuredZero<0||v.measuredZero>1){
    fail(false,'Invalid, replaced or missing vector '+s.sessionId+'/'+k);
    good=false;break;
   }
   observed++;
   if(p.y!==v.measuredY||p.carry!==v.measuredCarry||p.zero!==v.measuredZero)mismatches++;
   if(!finite(v.measuredDelayS)||v.measuredDelayS<=0||v.measuredDelayS>1)invalidDelays++;
   else if(v.measuredDelayS>POLICY.exploratoryMaxPropagationDelayS)slow++;
  }
  if(good)goodSessions++;
 }
 if(c.origin==='claimed-real-measurement'){
  fail(observed===49152&&goodSessions===48,'Missing real observed vector coverage');
  fail(sourceFilesMatched===48,'Not all 48 original raw instrument files matched');
  fail(invalidDelays===0,'Missing or impossible timing readings');
 }
 const status=c.origin==='uncollected'?'awaiting-real-hardware':
  errors.length?'incomplete-or-inconsistent-candidate':
  mismatches||slow?'claimed-hardware-disagreement-needs-audit':
  'claimed-complete-needs-independent-origin-audit';
 return {status,errors,plannedPhysicalDies:8,plannedSessions:48,
  plannedMeasurements:49152,sourceFilesMatched,completeSessions:goodSessions,
  observedVectors:observed,claimedDigitalDisagreements:c.origin==='uncollected'?null:mismatches,
  exploratoryDelayOverLimit:c.origin==='uncollected'?null:slow,
  invalidDelays:c.origin==='uncollected'?null:invalidDelays,
  modeledPerVectorDelayErrorS:null,verifiedUncertaintyCoverage:null,
  independentFabAndInstrumentAttestationEstablished:false,
  perfectSelfReportedCaptureIsNotPhysicalProof:true,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
export function strictReplay(policy,capture,predictions,audit){
 verifyPlan(policy);
 const blockers=[],model=predictionBundle(),blank=blankCapture();
 if(!isDeepStrictEqual(predictions,model))blockers.push('Frozen premeasurement predictions altered');
 if(!isDeepStrictEqual(capture,blank))blockers.push('Blank template changed or fake silicon readings inserted');
 const recomputed=auditCandidate(capture);
 if(!isDeepStrictEqual(audit,recomputed)||recomputed.status!=='awaiting-real-hardware'||
   recomputed.observedVectors!==0)blockers.push('Independent no-real-hardware replay disagrees');
 return {ok:blockers.length===0,blockers,actualALUHardwareMeasurements:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
