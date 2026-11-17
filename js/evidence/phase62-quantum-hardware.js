// Phase62 prospective quantum device measurements: physical origin unverified.
// Counts can be checked mathematically but not admitted as physical evidence.
import {createHash} from 'node:crypto';
import {H,X} from '../labs/quantum/gates.js';
import {basis,bell,applyGate,applyChannel,channel,probabilities,auditNoise} from './phase61-density-noise.js';
export const FORMAT='invention-lab/phase62-quantum-device-study/1';
const sha=b=>createHash('sha256').update(b).digest('hex');
const must=(ok,msg)=>{if(!ok)throw Error(msg)};
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x)}return x};
const vectorVersion=sha(JSON.stringify(auditNoise()));
const circuits=['zero','one','plus','bell'];
const ids=['C-01','C-02','H-01','H-02'];
const planSessions=()=>ids.flatMap(deviceId=>circuits.map(circuitId=>({
 sessionId:deviceId+'-'+circuitId,deviceId,circuitId,
 role:deviceId.startsWith('C')?'train':'holdout',shots:1024,
 rawMeasurementSha256:null,calibrationCertificateSha256:null,
 instrumentSerial:null,acquiredAtUtc:null,counts:null
})));
export function verifyPolicy(p){
 const expected={format:FORMAT,referenceModelSha256:null,
  deviceSlots:ids,calibrationCircuits:['zero','one'],
  independentEvaluationCircuits:['plus','bell'],
  plannedDeviceCount:4,plannedSessions:16,plannedShotsPerSession:1024,
  trainAndHoldoutDeviceDisjoint:true,
  originalSourceMatchedQuantumHardwareDevices:0,
  actualOriginalReadoutSessions:0,independentReviewComplete:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 must(JSON.stringify(p)===JSON.stringify(expected),'Prospective quantum test policy altered');
 return true;
}
export function policyTemplate(){return {
 format:FORMAT,referenceModelSha256:null,
 deviceSlots:ids,calibrationCircuits:['zero','one'],
 independentEvaluationCircuits:['plus','bell'],
 plannedDeviceCount:4,plannedSessions:16,plannedShotsPerSession:1024,
 trainAndHoldoutDeviceDisjoint:true,
 originalSourceMatchedQuantumHardwareDevices:0,
 actualOriginalReadoutSessions:0,independentReviewComplete:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};}
export function blankCampaign(p){
 verifyPolicy(p);
 return freeze({format:'invention-lab/phase62-blank-capture/1',referenceModelSha256:vectorVersion,
  devices:ids.map(id=>({deviceId:id,serial:null,fabricationLot:null,independentOriginAudit:null})),
  sessions:planSessions(),authenticatedPhysicalReadouts:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
function targetState(id){
 if(id==='zero')return basis(1);
 if(id==='one')return basis(1,1);
 if(id==='plus')return applyGate(basis(1),H,[0]);
 if(id==='bell')return bell();
 throw Error('Unknown circuit');
}
function modeled(id,gamma){
 const base=targetState(id);
 return probabilities(applyChannel(base,channel('amplitude-damping',gamma),[0]));
}
function validCounts(counts,dim,shots){
 return Array.isArray(counts)&&counts.length===dim&&counts.every(x=>Number.isInteger(x)&&x>=0)&&counts.reduce((a,b)=>a+b,0)===shots;
}
const isHash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const validText=x=>typeof x==='string'&&x.length>0&&x.length<=200;
export function screenCandidate(p,candidate=null,rawFiles={}){
 verifyPolicy(p);
 if(candidate===null)return freeze({format:'invention-lab/phase62-quarantined-study-screen/1',
  status:'AWAITING_ORIGINAL_DEVICE_READOUTS',candidateRows:0,
  originalRawBytesMatched:0,conditionalTrainGamma:null,
  holdoutTotalVariationDistance:null,hardwareOriginIndependentlyAuthenticated:false,
  originalHardwareReadoutsAdmitted:0,physicalValidation:'none',
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
 const c=candidate;
 must(c&&typeof c==='object'&&!Array.isArray(c)&&
  Object.keys(c).sort().join(',')==='format,origin,referenceModelSha256,sessions',
  'Invalid candidate format');
 must(c.format==='invention-lab/phase62-untrusted-device-candidate/1'&&
   c.referenceModelSha256===vectorVersion&&
   ['synthetic-test-only','external-unverified'].includes(c.origin),
   'Cannot self-attest a physical quantum origin');
 const baseline=planSessions();
 must(Array.isArray(c.sessions)&&c.sessions.length===16,'All 16 planned readout sessions required');
 let matched=0,numerator=0,denominator=0;
 const byId=new Map(),trainDevices=new Set(),holdoutDevices=new Set();
 for(let i=0;i<16;i++){
  const s=c.sessions[i],b=baseline[i];
  must(s&&Object.keys(s).sort().join(',')===
   'acquiredAtUtc,calibrationCertificateSha256,circuitId,counts,deviceId,instrumentSerial,rawMeasurementSha256,role,sessionId,shots',
   'Malformed session keys');
  must(['sessionId','deviceId','circuitId','role','shots'].every(k=>s[k]===b[k]),
   'Study design or cross-device split changed');
  must(validCounts(s.counts,s.circuitId==='bell'?4:2,s.shots)&&
   validText(s.instrumentSerial)&&isHash(s.calibrationCertificateSha256)&&
   isHash(s.rawMeasurementSha256)&&typeof s.acquiredAtUtc==='string'&&
   Number.isFinite(Date.parse(s.acquiredAtUtc)),
   'Incomplete counts or instrument metadata');
  const raw=Object.hasOwn(rawFiles,s.sessionId)?rawFiles[s.sessionId]:null;
  must((typeof raw==='string'||raw instanceof Uint8Array)&&sha(raw)===s.rawMeasurementSha256,
   'Original instrument export bytes absent/mismatched');
  let parsed;try{parsed=JSON.parse(Buffer.from(raw).toString('utf8'));}catch{throw Error('Raw readout must be parsable JSON');}
  must(parsed&&Object.keys(parsed).sort().join(',')==='counts,sessionId'&&
    parsed.sessionId===s.sessionId&&JSON.stringify(parsed.counts)===JSON.stringify(s.counts),
    'Reported counts differ from raw hashed readout');
  matched++;
  if(s.role==='train')trainDevices.add(s.deviceId);
  else holdoutDevices.add(s.deviceId);
  byId.set(s.sessionId,s);
  if(s.role==='train'&&s.circuitId==='one'){
   numerator+=s.counts[0];denominator+=s.shots;
  }
 }
 must(trainDevices.size===2&&holdoutDevices.size===2&&
  [...trainDevices].every(x=>!holdoutDevices.has(x)),
  'Quantum device train/holdout leakage');
 must(denominator===2048,'Training measurements incomplete');
 const gamma=numerator/denominator;
 let tvSum=0,tvN=0;
 for(const b of baseline.filter(x=>x.role==='holdout'&&p.independentEvaluationCircuits.includes(x.circuitId))){
  const row=byId.get(b.sessionId),pred=modeled(b.circuitId,gamma);
  tvSum+=pred.reduce((a,v,i)=>a+Math.abs(v-row.counts[i]/row.shots),0)/2;tvN++;
 }
 return freeze({format:'invention-lab/phase62-quarantined-study-screen/1',
  status:'UNTRUSTED_CANDIDATE_NOT_A_PHYSICAL_VALIDATION',
  candidateOrigin:c.origin,candidateRows:c.sessions.length,
  originalRawBytesMatched:matched,conditionalTrainGamma:gamma,
  holdoutTotalVariationDistance:tvSum/tvN,
  evaluatedHoldoutSessions:tvN,
  hardwareOriginIndependentlyAuthenticated:false,originalHardwareReadoutsAdmitted:0,
  calibratedPhysicalErrorBudget:null,hardwareReliabilityPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
export function syntheticTestFixture(){
 const p=policyTemplate(),campaign=blankCampaign(p),rawFiles={};
 const sessions=campaign.sessions.map(s=>{
  const gamma=.2,prob=modeled(s.circuitId,gamma),counts=prob.map(x=>Math.round(x*s.shots));
  counts[counts.length-1]+=s.shots-counts.reduce((a,b)=>a+b,0);
  const raw=JSON.stringify({sessionId:s.sessionId,counts});
  rawFiles[s.sessionId]=raw;
  return {...s,counts,rawMeasurementSha256:sha(raw),
   calibrationCertificateSha256:sha('fake-calibration'),instrumentSerial:'SIMULATED',
   acquiredAtUtc:'2026-11-17T00:00:00Z'};
 });
 return {candidate:{format:'invention-lab/phase62-untrusted-device-candidate/1',
  referenceModelSha256:vectorVersion,origin:'synthetic-test-only',sessions},rawFiles};
}