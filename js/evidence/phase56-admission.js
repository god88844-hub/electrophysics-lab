// Phase56: physical data admission gate. Untrusted reports cannot award themselves
// physical authenticity; external review must happen independently.
import {isDeepStrictEqual} from 'node:util';
import {blankIntake,screenProvenance} from './phase55-provenance.js';
import {blankCapture,auditCandidate} from '../measure/phase27-blind.js';
export const FORMAT='invention-lab/phase56-physical-data-admission/1';
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x)}return x};
export function verifyPolicy(p,source,phase54,signoff){
 const blank=blankIntake(source,phase54,signoff);
 const expected={format:FORMAT,target:'sky130-alu8',
  sourceRtlGitBlobSHA1:blank.rtlGitBlobSHA1,
  originalVectorSuiteSHA256:blank.vectorSuiteSHA256,
  requiredIndependentReviewGates:[
   'out-of-band-fab-authority-and-actual-mask-identity',
   'out-of-band-instrument-metrology-and-calibration',
   'byte-exact-original-raw-exports-per-session',
   'per-die-lot-wafer-independent-identity',
   'preacquisition-model-freeze-and-blind-holdout',
   'complete-source-matched-observations',
   'traceable-timing-uncertainty-and-PVT-conditions',
   'independent-human-origin-and-results-review'],
  expectedDieCount:8,expectedSessionCount:48,expectedVectorReads:49152,
  originalPhysicalMeasurementsReceived:0,originalRawFilesReviewed:0,
  independentlyVerifiedHardwareRecords:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 if(!isDeepStrictEqual(p,expected))throw Error('Phase56 physical admission policy modified');
 return blank;
}
export function blankAdmission(p,source,phase54,signoff){
 verifyPolicy(p,source,phase54,signoff);
 return freeze({format:'invention-lab/phase56-prospective-admission-packet/1',
  target:p.target,origin:{fabrication:null,metrology:null},
  rawFiles:[],reviewerDecision:null,
  phase27Capture:null,plannedDieCount:8,plannedSessions:48,plannedVectorReads:49152,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
export function assessAdmission(p,source,phase54,signoff,{provenance=null,capture=null,rawFiles={},trustedAuthorities=null,review=null}={}){
 const blank=verifyPolicy(p,source,phase54,signoff);
 const provenanceReport=screenProvenance(source,phase54,signoff,provenance,rawFiles,trustedAuthorities);
 const physicalCapture=capture===null?blankCapture():capture;
 const captureReport=auditCandidate(physicalCapture,{rawFiles});
 const reviewKeys=review&&typeof review==='object'&&!Array.isArray(review)?Object.keys(review).sort():[];
 const blockers=[...p.requiredIndependentReviewGates];
 const mismatch=[];
 if(provenanceReport.errors.length)mismatch.push(...provenanceReport.errors.map(x=>'provenance: '+x));
 if(captureReport.errors.length)mismatch.push(...captureReport.errors.map(x=>'capture: '+x));
 if(provenance&&capture){
  const pd=provenance.dies,cd=capture.devices;
  if(!Array.isArray(pd)||!Array.isArray(cd)||pd.length!==cd.length||
    !pd.every((d,i)=>d.slotId===cd[i]?.slotId&&d.lotId===cd[i]?.lotId&&
     d.waferId===cd[i]?.waferId&&d.dieId===cd[i]?.dieId&&
     d.maskSha256===cd[i]?.maskSha256&&d.foundryRecordSha256===cd[i]?.foundryRecordSha256))
   mismatch.push('Cross-package die/lot/wafer/mask identity mismatch');
  const ps=provenance.sessions,cs=capture.sessions;
  if(!Array.isArray(ps)||!Array.isArray(cs)||ps.length!==cs.length||
    !ps.every((s,i)=>s.sessionId===cs[i]?.sessionId&&
      s.rawInstrumentSHA256===cs[i]?.originalRawSha256&&
      s.instrumentSerial===cs[i]?.instrumentSerial&&
      s.calibrationCertificateSHA256===cs[i]?.calibrationCertificateSha256))
   mismatch.push('Cross-package instrument/session digest mismatch');
 }
 // Review self-claims, even signed ones, are untrusted until a separate
 // out-of-band authority and actual device origin verification is performed.
 return freeze({format:'invention-lab/phase56-admission-decision/1',
  target:p.target,plannedDies:8,plannedSessions:48,plannedVectorReads:49152,
  observedCandidateVectorRows:captureReport.observedVectors,
  candidateOriginalFilesMatched:provenanceReport.originalRawFilesMatched??0,
  candidatePhase27Status:captureReport.status,
  candidateProvenanceStatus:provenanceReport.status,
  untrustedReviewerFields:reviewKeys,
  crossArtifactInconsistencies:mismatch,
  missingIndependentReviewGates:blockers,
  verifiedPhysicalMeasurementsAdmitted:0,qualifiedDieCount:0,
  evidenceStatus:'QUARANTINED_NOT_ADMITTED',
  physicalQualification:'UNKNOWN',
  empiricalYield:null,validatedTimingError:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null});
}