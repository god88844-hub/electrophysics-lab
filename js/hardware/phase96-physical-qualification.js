// Phase 96 — physical evidence review and calibration.
// CI mocks, public instrument captures, user-supplied serial labels and
// self-signed keys can never upgrade a design to PHYSICALLY_QUALIFIED.
// Trusted reviewer keys are deliberately EMPTY until a separately reviewed
// release explicitly anchors them and independently verifies chain of custody.
import {INSTRUMENT_FORMAT,compareCapturedWaveform} from './phase94-instrument-ingest.js';
import {PHASE76_FORMAT} from '../evidence/phase76-virtual-passport.js';
export const PHYSICAL_PASSPORT_FORMAT='invention-lab/phase96-physical-passport/1';
export const APPROVED_PHYSICAL_REVIEWERS=Object.freeze([]);
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_.:-]{3,140}$/.test(x);
export function buildMeasurementEvidence({designId,sourceCommitSha256,
 instrumentSession,originalCaptureSHA256,simulationSHA256,
 physicalSpecimenId,lotId,reviewerId=null,signature=null,
 measurements,simulation,absoluteTolerance,relativeTolerance=0
}={}){
 if(!id(designId)||!sha(sourceCommitSha256)||!sha(originalCaptureSHA256)||
    !sha(simulationSHA256)||!id(physicalSpecimenId)||!id(lotId)||
    instrumentSession?.format!==INSTRUMENT_FORMAT||
    instrumentSession.designId!==designId||
    !id(instrumentSession.instrumentSerial)||!id(instrumentSession.operatorId)||
    !measurements||measurements.format!==INSTRUMENT_FORMAT||
    !Number.isInteger(measurements.values?.length)||
    (reviewerId!==null&&!id(reviewerId))||
    (signature!==null&&typeof signature!=='string'))
  throw Error('Missing source-bound physical acquisition metadata');
 const errors=compareCapturedWaveform({trace:measurements,simulation,
  absoluteTolerance,relativeTolerance});
 return {format:PHYSICAL_PASSPORT_FORMAT,designId,sourceCommitSha256,
  originalCaptureSHA256,simulationSHA256,physicalSpecimenId,lotId,
  instrumentSession:structuredClone(instrumentSession),traceProtocol:measurements.sourceProtocol,
  traceSamples:measurements.values.length,
  metrics:{rmse:errors.rmse,maxAbsResidual:errors.maxAbsoluteResidual,
   outsideDeclaredTolerance:errors.outsideDeclaredTolerance,
   absoluteTolerance,relativeTolerance,unit:errors.unit},
  reviewerId,signature,
  provenanceStatus:'CLAIMED_NOT_INDEPENDENTLY_AUTHENTICATED',
  originalCaptureInTrustedArchive:false,
  independentSiliconLotReviewAuthenticated:false,
  physicalValidation:'unverified-source-claim'};
}
export function calculateProvisionalUncertainty({
 residuals,modelUncertainty=null,measurementUncertainty
}={}){
 if(!Array.isArray(residuals)||residuals.length<2||residuals.length>100000||
    residuals.some(x=>!finite(x))||
    !finite(measurementUncertainty)||measurementUncertainty<0||
    modelUncertainty!==null&&(!finite(modelUncertainty)||modelUncertainty<0))
  throw Error('Finite residuals and declared instrument uncertainty required');
 const n=residuals.length;
 const bias=residuals.reduce((a,b)=>a+b,0)/n;
 const variance=residuals.reduce((s,x)=>s+(x-bias)**2,0)/(n-1);
 const rmse=Math.sqrt(residuals.reduce((s,x)=>s+x*x,0)/n);
 const combined=Math.hypot(Math.sqrt(variance),
  measurementUncertainty,modelUncertainty??0);
 return {format:PHYSICAL_PASSPORT_FORMAT,n,bias,rmse,
  sampleStandardDeviation:Math.sqrt(variance),
  estimatedCombinedStandardUncertainty:combined,
  statisticalInterpretation:'PROVISIONAL_UNVERIFIED_TRACE_COMPARISON',
  effectiveDegreesOfFreedom:'UNKNOWN',
  originalFoundryModelUpdated:false,physicalQualification:'NO_GO'};
}
export function evaluatePhysicalQualification({
 level1Passport,measurementEvidence,postSiliconReview=null
}={}){
 if(level1Passport?.format!==PHASE76_FORMAT||
    typeof level1Passport.designId!=='string')
  throw Error('Original Level-1 passport required');
 const reasons=[];
 if(level1Passport.status!=='VIRTUALLY_QUALIFIED'||
    level1Passport.physicallyQualified!==false||
    level1Passport.productionReleaseAuthorized!==false)
  reasons.push('level1-original-not-authenticated-virtually-qualified');
 if(measurementEvidence?.format!==PHYSICAL_PASSPORT_FORMAT||
    measurementEvidence.designId!==level1Passport.designId)
  reasons.push('no-design-matched-hardware-measurements');
 if(measurementEvidence?.provenanceStatus!=='INDEPENDENTLY_AUTHENTICATED'||
    measurementEvidence.originalCaptureInTrustedArchive!==true||
    measurementEvidence.independentSiliconLotReviewAuthenticated!==true)
  reasons.push('measurement-provenance-not-independently-verified');
 if(!postSiliconReview||postSiliconReview.independentReviewerApproved!==true||
    postSiliconReview.blindHoldoutPassed!==true||
    postSiliconReview.drcLvsPhysicalCorrelationPassed!==true)
  reasons.push('independent-silicon-qualification-signoff-missing');
 // All trust roots are empty by deliberate policy, including after a caller
 // claims reviewerId or signature. Only an audited code/organizational
 // release may expand this immutable reviewed trust registry.
 if(!APPROVED_PHYSICAL_REVIEWERS.includes(postSiliconReview?.reviewerId))
  reasons.push('no-pinned-authenticated-physical-reviewer-trust-root');
 if(measurementEvidence?.metrics?.outsideDeclaredTolerance>0)
  reasons.push('physical-trace-departs-from-predeclared-acceptance-window');
 // Return the source virtual state as-is, or NO-GO for missing evidence;
 // never mutate a Stage M Level-1 passport or existing release gates.
 const sourceStatus=level1Passport.status;
 return {format:PHYSICAL_PASSPORT_FORMAT,level:2,
  designId:level1Passport.designId,
  status:'UNQUALIFIED_NO_GO',retainedLevel1Status:sourceStatus,
  reasons:[...new Set(reasons)].sort(),
  physicallyQualified:false,productionReleaseAuthorized:false,
  physicalSiliconTestedInThisWorkflow:false,
  measuredPhysicalBuildSuccessPercent:null,
  calibratedModelApproved:false,
  originalLevel1PassThrough:true,
  modelCalibration:{status:'PROVISIONAL_ONLY_NEVER_APPLIED',
   source:'untrusted-instrument-capture'},
  physicalValidation:'NO_GO'};
}
// Canonical detached review claim. A detached signature is only meaningful if
// it chains to a pinned *independent* verifier, not to a key supplied by the
// hardware owner or experiment file itself.
export function canonicalPhysicalReviewClaim(evidence){
 if(evidence?.format!==PHYSICAL_PASSPORT_FORMAT||
    ![evidence.sourceCommitSha256,evidence.originalCaptureSHA256,
      evidence.simulationSHA256].every(sha)||
    !id(evidence.designId)||!id(evidence.physicalSpecimenId)||!id(evidence.lotId))
  throw Error('Source-bound evidence necessary before reviewer signing');
 return JSON.stringify({
  domain:'invention-lab/phase96-independent-physical-review/1',
  designId:evidence.designId,sourceCommitSha256:evidence.sourceCommitSha256,
  originalCaptureSHA256:evidence.originalCaptureSHA256,
  simulationSHA256:evidence.simulationSHA256,
  physicalSpecimenId:evidence.physicalSpecimenId,lotId:evidence.lotId,
  traceSamples:evidence.traceSamples,
  metrics:evidence.metrics
 });
}
export async function verifyDetachedReviewerSignature({
 claim,signatureBase64,publicKeyBase64
}={}){
 if(typeof claim!=='string'||claim.length<1||claim.length>20000||
    typeof signatureBase64!=='string'||signatureBase64.length>500||
    typeof publicKeyBase64!=='string'||publicKeyBase64.length>500||
    !globalThis.crypto?.subtle)
  return {cryptographicSignatureValid:false,productionTrustRootPinned:false};
 try{
  const binary=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey('raw',binary(publicKeyBase64),
   {name:'Ed25519'},false,['verify']);
  const yes=await crypto.subtle.verify({name:'Ed25519'},key,
   binary(signatureBase64),new TextEncoder().encode(claim));
  return {cryptographicSignatureValid:yes,productionTrustRootPinned:false,
   physicallyQualified:false,
   note:'Cryptographic signature alone does not authenticate wafer lot or hardware'};
 }catch{return {cryptographicSignatureValid:false,productionTrustRootPinned:false,
  physicallyQualified:false};}
}
export async function verifyPinnedPhysicalReview({
 evidence,approval,signatureBase64
}={}){
 const root=APPROVED_PHYSICAL_REVIEWERS.find(x=>x.id===approval?.reviewerId);
 if(!root)return {reviewAuthenticated:false,
  reason:'no-registered-independent-physical-reviewer-root',
  physicalQualification:'NO_GO'};
 const result=await verifyDetachedReviewerSignature({
  claim:canonicalPhysicalReviewClaim(evidence),signatureBase64,
  publicKeyBase64:root.publicKeyBase64});
 return {reviewAuthenticated:result.cryptographicSignatureValid,
  trustRoot:root.id,
  physicalQualification:'NO_GO_PENDING_INDEPENDENT_SILICON_HOLDOUT'};
}

export function requirePhysicalReleasePassport(passport){
 if(passport?.format!==PHYSICAL_PASSPORT_FORMAT||
    passport.status!=='PHYSICALLY_QUALIFIED'||
    passport.physicallyQualified!==true||
    passport.productionReleaseAuthorized!==true)
  throw Error('Physical release strictly blocked without authentic independent Level-2 qualification');
 // There is no independently approved Level2 verifier/trust anchor in this
 // research branch. Do not permit crafted objects to bypass the gate.
 throw Error('No reviewed Stage Q physical release trust authority installed');
}
