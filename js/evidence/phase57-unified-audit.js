// Phase57 unified release evidence: software checks, physical proof and
// production signoff are independent decisions. Fail closed on unknown records.
import {isDeepStrictEqual} from 'node:util';
import {assessAdmission} from './phase56-admission.js';
import {assessReferenceSystem} from './phase52-reference-qualification.js';
import {assessSiliconSignoff} from './phase53-signoff.js';
const deepFreeze=x=>{if(x&&typeof x==='object'){for(const y of Object.values(x))deepFreeze(y);Object.freeze(x)}return x};
export const FORMAT='invention-lab/phase57-unified-release-readiness/1';
export function verifyPolicy(policy){
 const expected={format:FORMAT,release:'invention-lab-research-software',targetDomains:['reference-3v-fan','sky130-alu8'],
  distinctDecisions:['scientific-software-integrity','fan-physical-qualification',
   'alu-physical-qualification','semiconductor-foundry-signoff','production-authorization'],
  scientificSourceChecksDoNotProvePhysicalQualification:true,
  onlySourcePinnedPreviouslyVerifiedEvidenceCounts:true,
  noPhysicalGoWhenOriginalHardwareMissing:true,
  noProductionAuthorizationWithoutFoundrySignoff:true,
  requireDistinctSoftwareAndPhysicalVerdicts:true,
  mainBranchIntegrationRequiredForProductRelease:true,
  allDraftPRsMerged:false,actualFanMeasurementCount:0,actualALUMeasurementCount:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 if(!isDeepStrictEqual(policy,expected))throw Error('Phase57 release gate policy weakened');
 return true;
}
export function releaseAudit(policy,{phase56,phase55,phase54,phase53,phase52,fanSources,flowScripts,
 phase27=null,phase55Candidate=null,rawFiles={},trustedAuthorities=null,review=null,
 sourceIntegratedIntoMain=false}){
 verifyPolicy(policy);
 const fan=assessReferenceSystem(phase52,fanSources);
 const aluSignoff=assessSiliconSignoff(phase53,flowScripts);
 const alu=assessAdmission(phase56,phase55,phase54,phase53,{
  provenance:phase55Candidate,capture:phase27,rawFiles,trustedAuthorities,review});
 const preSiliconCheck=aluSignoff.originalSourceLockedOpenFlowCheckClasses.length===4;
 const staticSourceChecks=fan.softwareSourceComparisonComplete&&preSiliconCheck&&
  alu.plannedSessions===48&&alu.plannedVectorReads===49152;
 // "PASS" means the checked software model sources and policy are internally
 // consistent; it does not mean all repository CI was run in this function.
 const physicalReady=fan.qualifiedActualSpecimens>0&&alu.qualifiedDieCount>0&&
  alu.verifiedPhysicalMeasurementsAdmitted>0;
 const foundryReady=aluSignoff.foundryCertified===true&&aluSignoff.maskTapeoutAuthorized===true;
 const integrated=sourceIntegratedIntoMain===true&&policy.allDraftPRsMerged===true;
 const domainStatus=[
  {domain:'scientific-software-integrity',status:staticSourceChecks?'SOURCE_CHECKS_ONLY':'BLOCKED',scope:'policy and model-source consistency, not CI or physical test'},
  {domain:'fan-physical-qualification',status:'NO_GO',scope:fan.releaseDecision,
   blockers:fan.missingPhysicalGates},
  {domain:'alu-physical-qualification',status:'UNKNOWN',scope:alu.evidenceStatus,
   blockers:alu.missingIndependentReviewGates},
  {domain:'semiconductor-foundry-signoff',status:'NO_GO',scope:aluSignoff.signoffDisposition,
   blockers:aluSignoff.missingFoundryAcceptanceClasses},
  {domain:'production-authorization',status:'NO_GO',scope:'No physical specimen qualification and no foundry signoff'}
 ];
 return deepFreeze({format:'invention-lab/phase57-research-release-screen/1',
  researchSoftwareSourceGate:staticSourceChecks?'CONSISTENT_SOURCES':'BLOCKED',
  fullRepositoryCIStatus:'NOT_MEASURED_BY_THIS_AUDIT',
  mergedMainIntegration:integrated,
  softwareProductReleaseEligible:false,
  physicalProofSufficient:physicalReady,
  foundryAuthorized:foundryReady,
  productionReleaseAuthorized:false,
  domainStatus,
  fanVerifiedPhysicalSamples:fan.qualifiedActualSpecimens,
  aluVerifiedPhysicalSamples:alu.qualifiedDieCount,
  authenticatedALUVectorReadings:alu.verifiedPhysicalMeasurementsAdmitted,
  independentExternalReviewerApproved:false,
  decision:'RESEARCH_SOFTWARE_ONLY_WITH_PHYSICAL_NO_GO',
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null});
}