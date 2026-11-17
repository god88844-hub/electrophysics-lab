// Phase60 accelerator calibration on untrusted datasets, with explicit
// device-disjoint training/holdout. No independent physical evidence is bundled.
import {createHash} from 'node:crypto';
import {SAMPLE,scheduleMatrix} from './phase59-scheduler.js';
export const FORMAT='invention-lab/phase60-accelerator-calibration-gate/1';
const hash=s=>createHash('sha256').update(s).digest('hex');
const modelDigest=()=>hash(JSON.stringify({format:FORMAT,model:SAMPLE,reference:scheduleMatrix(SAMPLE).modelScope}));
const finitePositive=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
const hashOk=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const id=x=>typeof x==='string'&&x.length>0&&x.length<=128&&/^[A-Za-z0-9._-]+$/.test(x);
function requireOk(v,msg){if(!v)throw new Error(msg)}
function freeze(x){if(x&&typeof x==='object'){for(const y of Object.values(x))freeze(y);Object.freeze(x)}return x}
export function verifyPolicy(p){
 const expected={format:FORMAT,target:'phase59-systolic-int8-analytical-scheduler',
   frozenModelDigestSHA256:null,frozenBenchmarkCase:'phase59-SAMPLE',
   permittedCandidateOrigins:['synthetic-test-only','external-unverified'],
   originalExternallyAuthenticatedHardwareRows:0,sourceMatchedPhysicalDevices:0,
   preregisteredTrainMinimumDevices:2,preregisteredHoldoutMinimumDevices:2,
   holdoutCannotBeUsedForFit:true,independentReviewerConnectorAvailable:false,
   physicalPowerPredictionModelQualified:false,unmeasuredPhysicalEnergyPrediction:null,
   physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 requireOk(JSON.stringify(p)===JSON.stringify(expected),'Phase60 prospective calibration rules modified');
 return scheduleMatrix(SAMPLE);
}
export function blankCampaign(p){
 const model=verifyPolicy(p);
 return freeze({format:'invention-lab/phase60-unmeasured-accelerator-campaign/1',
  modelDigestSHA256:modelDigest(),
  predictedAnalyticalLatencyUs:model.modeledLatencyMicroseconds,
  powerMeasurementRequired:true,originalPhysicalRows:[],
  independentlyAuthenticatedHardwareDevices:0,
  qualifiedPhysicalMeasurementErrors:null,qualifiedPhysicalPredictionIntervals:null,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
export function fitUntrustedCampaign(p,candidate=null){
 verifyPolicy(p);
 const missing=()=>freeze({format:'invention-lab/phase60-untrusted-conditional-calibration/1',
  status:'AWAITING_EXTERNAL_HARDWARE',conditionalModelFit:null,conditionalHoldoutMetrics:null,
  candidateRows:0,independentlyAuthenticatedRows:0,independentlyAuthenticatedDevices:0,
  verifiedEnergyPredictionError:null,verifiedPhysicalPredictionInterval:null,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
 if(candidate===null)return missing();
 requireOk(candidate&&typeof candidate==='object'&&!Array.isArray(candidate)&&
  Object.keys(candidate).sort().join(',')==='format,modelDigestSHA256,origin,rows',
  'Malformed external campaign');
 requireOk(candidate.format==='invention-lab/phase60-untrusted-candidate/1'&&
  candidate.modelDigestSHA256===modelDigest(),'Frozen model source mismatch');
 requireOk(p.permittedCandidateOrigins.includes(candidate.origin),
  'Candidate cannot self-report independently authenticated physical origin');
 requireOk(Array.isArray(candidate.rows)&&candidate.rows.length>=4&&candidate.rows.length<=10000,
  'Insufficient or excessive candidate rows');
 const train=[],holdout=[],trainDevices=new Set(),holdoutDevices=new Set();
 const allowedKeys='deviceId,instrumentCertSHA256,observedLatencyUs,observedPowerW,predictedLatencyUs,split';
 for(const row of candidate.rows){
  requireOk(row&&typeof row==='object'&&!Array.isArray(row)&&
    Object.keys(row).sort().join(',')===allowedKeys,'Malformed observation fields');
  requireOk(id(row.deviceId)&&hashOk(row.instrumentCertSHA256)&&
    finitePositive(row.predictedLatencyUs)&&finitePositive(row.observedLatencyUs)&&
    finitePositive(row.observedPowerW)&&['train','holdout'].includes(row.split),
    'Missing device/measurement data or untrusted units');
  if(row.split==='train'){train.push(row);trainDevices.add(row.deviceId)}
  else{holdout.push(row);holdoutDevices.add(row.deviceId)}
 }
 requireOk(trainDevices.size>=p.preregisteredTrainMinimumDevices&&
   holdoutDevices.size>=p.preregisteredHoldoutMinimumDevices,'Independent devices required');
 requireOk([...trainDevices].every(d=>!holdoutDevices.has(d)),'Device leakage across calibration and holdout');
 // Zero-intercept least-squares scale fit is computed exclusively on train.
 const factor=train.reduce((a,r)=>a+r.predictedLatencyUs*r.observedLatencyUs,0)/
   train.reduce((a,r)=>a+r.predictedLatencyUs**2,0);
 requireOk(finitePositive(factor),'Invalid train-only fit');
 const metrics=(rows,coef)=>({
  maeUs:rows.reduce((a,r)=>a+Math.abs(r.observedLatencyUs-coef*r.predictedLatencyUs),0)/rows.length,
  meanAbsolutePercentageError:rows.reduce((a,r)=>a+
    Math.abs(r.observedLatencyUs-coef*r.predictedLatencyUs)/r.observedLatencyUs,0)/rows.length*100});
 const fitted=metrics(holdout,factor),baseline=metrics(holdout,1);
 return freeze({format:'invention-lab/phase60-untrusted-conditional-calibration/1',
  status:'UNTRUSTED_CANDIDATE_METRICS_NOT_HARDWARE_QUALIFICATION',
  candidateOrigin: candidate.origin,modelDigestSHA256:modelDigest(),
  conditionalModelFit:{latencyMultiplier:factor,trainDeviceCount:trainDevices.size,trainRows:train.length},
  conditionalHoldoutMetrics:{...fitted,baselineMAEUs:baseline.maeUs,
   baselineMeanAbsolutePercentageError:baseline.meanAbsolutePercentageError,
   holdoutDeviceCount:holdoutDevices.size,holdoutRows:holdout.length},
  candidateRows:candidate.rows.length,
  independentlyAuthenticatedRows:0,independentlyAuthenticatedDevices:0,
  candidateObservedPowerMeanW:candidate.rows.reduce((s,r)=>s+r.observedPowerW,0)/candidate.rows.length,
  verifiedEnergyPredictionError:null,verifiedPhysicalPredictionInterval:null,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
export const syntheticFixture=()=>({
 format:'invention-lab/phase60-untrusted-candidate/1',
 modelDigestSHA256:modelDigest(),origin:'synthetic-test-only',
 rows:[...Array.from({length:2},(_,i)=>({deviceId:'train'+i,instrumentCertSHA256:'a'.repeat(64),
  observedLatencyUs:1.5+i,predictedLatencyUs:1+i,observedPowerW:10+i,split:'train'})),
  ...Array.from({length:2},(_,i)=>({deviceId:'hold'+i,instrumentCertSHA256:'b'.repeat(64),
  observedLatencyUs:2.5+i,predictedLatencyUs:2+i,observedPowerW:12+i,split:'holdout'}))]});
