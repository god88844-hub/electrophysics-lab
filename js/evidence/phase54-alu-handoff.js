// Phase54 lab-facing source-locked ALU acquisition packet. No predictions are
// included in the lab packet: holdouts cannot be fitted against an answer key.
import {isDeepStrictEqual} from 'node:util';
import {stimulus,RTL_GIT_BLOB,SUITE_SHA256} from '../measure/phase24-prototype.js';
import {POLICY as BLIND,verifyPlan,slots,sessions,blankCapture,
 predictionBundle,auditCandidate} from '../measure/phase27-blind.js';
export const FORMAT='invention-lab/phase54-alu-laboratory-acquisition-handoff/1';
const requireOk=(a,s)=>{if(!a)throw Error(s)};
const deepFreeze=o=>{if(o&&typeof o==='object'){for(const v of Object.values(o))deepFreeze(v);Object.freeze(o)}return o};
export function verifyAcquisitionPolicy(p,signoff){
 verifyPlan(BLIND);
 const wanted={
 format:FORMAT,target:'sky130-alu8',originalRtlGitBlobSHA1:RTL_GIT_BLOB,
 originalVectorSuiteSHA256:SUITE_SHA256,
 studyDesign:'phase27-frozen-eight-die-two-lot-blind-prospective-plan',
 plannedPhysicalDies:8,plannedManufacturingLots:2,plannedWafersPerLot:2,
 plannedStudySessions:48,inputVectorsPerSession:1024,
 plannedTotalInstrumentVectorReads:49152,
 sourceMeasurementState:'UNFABRICATED_UNMEASURED_NO_INSTRUMENT_EXPORTS',
 labHandoffMustExcludeExpectedDigitalOutputs:true,
 modelFreezeCommitBeforeAcquisition:null,foundryMaskRevisionVerification:null,
 independentFabricationRecord:null,originalRawInstrumentExports:0,
 originalInstrumentSHA256:[],authenticatedDieSpecimens:0,
 acceptedPhysicalTimingReadings:0,independentExternalMetrologyReviewer:null,
 independentlyApprovedTimingUncertaintyBudget:null,
 physicalAccreditedLabMeasurementReview:false,productionTapeoutAuthorized:false,
 hardwareStatisticalYieldEstimate:null,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 requireOk(isDeepStrictEqual(p,wanted),'ALU source and uncollected physical acquisition policy changed');
 requireOk(signoff?.designId==='sky130-alu8'&&
  signoff.originalRtlBlobSHA1===RTL_GIT_BLOB&&
  signoff.originalSignedGDSArtifact===null&&
  signoff.actualManufacturedALUMeasurements===0&&
  signoff.signedReleaseCandidate===false&&
  signoff.physicalValidation==='none',
  'Phase53 signoff availability falsely upgraded or source mismatch');
 return true;
}
export function makeLabHandoff(p,signoff){
 verifyAcquisitionPolicy(p,signoff);
 const vectors=stimulus();
 const sessionPlan=sessions().map(({sessionId,slotId,role,cornerId,tempC,voltageV,repeat,group})=>
  ({sessionId,slotId,role,group,cornerId,requestedEnvironmentC:tempC,
   requestedSupplyV:voltageV,repeat,rawInstrumentExportSHA256:null,
   completedAcquisitionUTC:null,measuredVectorReadings:0,independentCalibrationAttested:false}));
 const diePlan=slots().map(({slotId,role,group,waferGroup})=>({
  slotId,role,group,waferGroup,purchasedDieIdentity:null,
  verifiedFabLot:null,verifiedWaferIdentity:null,verifiedMaskRecord:null}));
 const blank=blankCapture();
 requireOk(vectors.length===1024&&sessionPlan.length===48&&diePlan.length===8&&
  blank.sessions.length===48&&blank.devices.length===8&&
  sessionPlan.every(s=>s.measuredVectorReadings===0)&&
  vectors.every(x=>Object.keys(x).sort().join(',')==='a,b,index,op'),
  'Source or blind measurement plan contaminated');
 return deepFreeze({
  format:'invention-lab/phase54-lab-facing-unmeasured-input-bundle/1',
  target:p.target,sourceRtlGitBlobSHA1:RTL_GIT_BLOB,
  vectorSuiteSHA256:SUITE_SHA256,
  predictionReferenceDigestOnly:blank.predictionDigest,
  predictedDigitalOutputsIncluded:false,
  vectorInputs:vectors,plannedDies:diePlan,plannedSessions:sessionPlan,
  actualManufacturedDieCount:0,actualOriginalInstrumentReadings:0,
  independentOriginVerified:false,independentlyAuthorizedPhysicalTesting:false,
  disposition:'PLANNED_EXPERIMENT_NOT_PHYSICAL_SILICON_EVIDENCE',
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
export function inspectUntrustedLabReturn(p,signoff,candidate=null,rawFiles={}){
 verifyAcquisitionPolicy(p,signoff);
 const report=auditCandidate(candidate===null?blankCapture():candidate,{rawFiles});
 const packet=makeLabHandoff(p,signoff);
 return deepFreeze({
  format:'invention-lab/phase54-quarantined-physical-return-review/1',
  originalLabPacketInputs:packet.vectorInputs.length,
  proposedSessions:packet.plannedSessions.length,
  untrustedCandidateStatus:report.status,
  selfReportedVectorRows:report.observedVectors,
  candidateErrors:report.errors,
  originalDieAndMaskSourceIndependentlyAuthenticated:false,
  independentInstrumentCalibrationVerified:false,
  independentLotHoldoutReviewVerified:false,
  authenticatedHardwareSamplesAdmitted:0,physicalMeasurementValuesAdmitted:0,
  physicalProofReady:false,
  disposition:'QUARANTINED_NO_INDEPENDENT_EXTERNAL_FOUNDRY_OR_LAB_ATTESTATION',
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
