// Phase28: honest prospective go/no-go gate for the ORIGINAL unmeasured ALU.
// Software CI and genuine *different* resistor readings can never imply a
// chip fabrication probability or replace independent physical testing.
import {isDeepStrictEqual} from 'node:util';
import {RTL_GIT_BLOB,SUITE_SHA256} from './phase24-prototype.js';
import {POLICY as PH27} from './phase27-blind.js';
export const FORMAT='invention-lab/phase28-engineering-evidence-decision-policy/1';
export const REPORT_FORMAT='invention-lab/phase28-source-bound-go-no-go/1';
export const REQUIREMENTS=Object.freeze([
 'authenticated-fab-die-mask-source-chain',
 'original-calibrated-instrument-traces',
 'externally-reviewed-uncertainty-budget',
 'prespecified-operating-envelope-and-acceptance',
 'independent-lot-die-pvt-holdout',
 'independent-foundry-signoff-or-qualified-coverage-review'
]);
export const POLICY=Object.freeze({
 format:FORMAT,target:'sky130-alu8',rtlGitBlob:RTL_GIT_BLOB,vectorSha256:SUITE_SHA256,
 previousPhase27Study:'planned-8-dies-2-lots-48-sessions-49152-vectors',
 physicalMeasurementsAvailable:0,independentlyVerifiedALUDies:0,
 qualifiedFoundrySignoffAvailable:false,thirdPartyInstrumentEvidenceVerified:false,
 instrumentCalibrationChainVerified:false,independentlyAuthenticatedWholeLotHoldout:false,
 preregisteredAccuracyThresholdApproved:false,
 timingPredictionAndMeasurementMethodMatched:false,
 sampleManufacturingWaferLotCoverageAvailable:false,
 allowableSelfAttestedLabPass:false,allowableNumericalSuccessFromComputerOnly:false,
 requiredArtifactClasses:REQUIREMENTS,
 nextAction:'BLOCKED_PENDING_PHYSICAL_EVIDENCE',
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
});
export function verifyPolicy(obj){
 if(!isDeepStrictEqual(obj,POLICY))
  throw Error('Frozen Phase28 physical evidence acceptance policy modified or weakened');
 return true;
}
const hex40=x=>typeof x==='string'&&/^[0-9a-f]{40}$/.test(x);
const hex64=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
/**
 * A candidate may carry self-declared success, large sample counts and
 * forged-looking hashes. A report does NOT become authenticated merely
 * because JSON or a checksum is well formed. The present integration has
 * no authorized third-party foundry/instrument attestation verifier.
 */
export function assessDecisions(phase24,phase26,phase27,candidate=null,policy=POLICY){
 verifyPolicy(policy);
 const blockers=[];
 const require=(yes,why)=>{if(!yes)blockers.push(why);};
 require(phase24?.actualPhysicalObservations===0&&
   phase24?.reportedStatus==='awaiting-real-hardware'&&
   phase24?.physicalVerdict==='unknown'&&
   phase24?.realWorldBuildSuccessPercent===null,
   'PH24 original physical ALU acquisition remains unmeasured or prerequisites altered');
 require(phase26?.accepted===true&&phase26?.originalResistorDevices===2&&
   phase26?.observedTotalResistorSweepReadings===102&&
   phase26?.actualALUHardwareSpecimens===0&&
   phase26?.actualALUHardwareMeasurements===0&&
   phase26?.targetFailureModesUnverified===12&&
   phase26?.physicalVerdict==='unknown'&&
   phase26?.realWorldBuildSuccessPercent===null,
   'PH26 measured-resistor origin or failure mode count cannot justify ALU hardware');
 require(phase27?.originalHardwareReadings===0&&
   phase27?.actualFabricatedALUCount===0&&
   phase27?.futureDeviceSlots===8&&phase27?.futureSessions===48&&
   phase27?.futureMeasurements===49152&&
   phase27?.studyGroupHoldout==='whole-physical-lot'&&
   phase27?.independentPreregistrationAttested===false&&
   phase27?.measurementOriginAudit==='not-performed'&&
   phase27?.physicalVerdict==='unknown'&&
   phase27?.realWorldBuildSuccessPercent===null,
   'PH27 blind experiment is only a prospective, uncollected protocol');
 require(policy.rtlGitBlob===PH27.rtlBlob&&
   policy.vectorSha256===PH27.vectorsSha256&&
   PH27.realALUMeasurements===0,
   'Design source mismatch / fabricated sample count');
 // Evaluate possible future candidate claims as unverified submissions,
 // not as authorization for a manufacturing success estimate.
 const warnings=[];
 if(candidate!==null){
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))
   blockers.push('Malformed externally claimed physical evidence packet');
  else {
   if(candidate.claimedPhysicalValidation!==undefined ||
      candidate.realWorldBuildSuccessPercent!==undefined)
    warnings.push('Self-declared silicon validation or yield ignored');
   if(candidate.reportedPassRate!==undefined||candidate.reportedConfidenceInterval!==undefined)
    warnings.push('Self-reported probabilities and confidence intervals ignored');
   if(candidate.modelTunedOnBlindHoldout===true)
    blockers.push('Blind holdout data leak: model selection on validation lot');
   if(candidate.claimedSourceRtlBlob!==undefined&&
      candidate.claimedSourceRtlBlob!==RTL_GIT_BLOB)
    blockers.push('Candidate fabricated design not matched to frozen ALU RTL');
   if(candidate.instrumentFilesSha256!==undefined&&
      (!Array.isArray(candidate.instrumentFilesSha256)||
        candidate.instrumentFilesSha256.some(x=>!hex64(x))))
    blockers.push('Candidate original instrument file fingerprints malformed');
   if(candidate.externalFoundryRecordSha!==undefined&&!hex64(candidate.externalFoundryRecordSha))
    blockers.push('Candidate source-to-mask record hash malformed');
   // Even the best syntactic packet has no trusted external source resolver.
   warnings.push('No connected trusted foundry or independent metrology attestation verifier; candidate remains unqualified');
  }
 }
 const gates=REQUIREMENTS.map(id=>({id,verified:false,
  reason:'Original independently authenticated matching-ALU hardware evidence unavailable'}));
 return {
  format:REPORT_FORMAT,target:'sky130-alu8',sourceRtlBlob:RTL_GIT_BLOB,
  sourceVectorSha256:SUITE_SHA256,
  previousComputationalEvidence:'modeled-and-regressed-not-silicon-qualified',
  realPublicPhysicalEvidence:'two-other-resistor-specimens-only',
  plannedBlindStudy:{dieSlots:8,physicalSessions:48,plannedStimulusReadings:49152,
   actualSiliconReadings:0,actualSiliconDieCount:0,manufacturingLotsMeasured:0},
  criteriaGates:gates,provenanceAndCrossPhaseIssues:blockers,
  additionalCandidateWarnings:warnings,
  simulationModelGoNoGo:'MODEL_EVIDENCE_ONLY',
  realPrototypeQualificationDecision:'BLOCKED_NEEDS_REAL_HARDWARE',
  productionReleaseDecision:'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE',
  fabricationSuccessProbability:null,manufacturingYieldEstimate:null,
  manufacturingSuccessConfidenceInterval:null,
  independentPhysicalHoldoutAccuracy:null,
  realSiliconUncertaintyInterval:null,
  reliabilityFIT:null,
  cannotDetermineManufacturingSuccess:true,
  externalReviewRequired:true,
  // The platform does not authenticate self-asserted signatures or reports.
  externalOriginVerified:false,
  readiness:'blocked',
  decision:'BLOCKED_PENDING_PHYSICAL_EVIDENCE',
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 };
}
export function verifyDecision(record,recomputed,metadata){
 const errors=[];
 if(!isDeepStrictEqual(record,recomputed))
  errors.push('Source-bound engineering release/go-no-go result was modified');
 if(!hex40(metadata?.currentCommit)||metadata.currentCommit!==metadata.recordCommit)
  errors.push('Original evidence HEAD does not match current Git commit');
 if(!hex64(metadata?.policySha256)||metadata.policySha256!==metadata.recordPolicySha256)
  errors.push('Frozen prospective manufacturing success policy altered');
 const fields=['fabricationSuccessProbability','manufacturingYieldEstimate',
  'manufacturingSuccessConfidenceInterval','independentPhysicalHoldoutAccuracy',
  'realSiliconUncertaintyInterval','reliabilityFIT','realWorldBuildSuccessPercent'];
 if(fields.some(k=>record?.[k]!==null)||record?.productionReleaseDecision!=='NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE'||
    record?.realPrototypeQualificationDecision!=='BLOCKED_NEEDS_REAL_HARDWARE'||
    record?.externalOriginVerified!==false||
    record?.readiness!=='blocked'||record?.physicalValidation!=='none'||
    record?.physicalVerdict!=='unknown'||record?.cannotDetermineManufacturingSuccess!==true||
    !Array.isArray(record?.criteriaGates)||record.criteriaGates.length!==REQUIREMENTS.length||
    record.criteriaGates.some(g=>g.verified!==false))
  errors.push('Unsupported claim that silicon yield, reliability or physical equivalence is proven');
 return {ok:errors.length===0,errors,realWorldBuildSuccessPercent:null,
  physicalVerdict:'unknown',decision:'BLOCKED_PENDING_PHYSICAL_EVIDENCE'};
}
