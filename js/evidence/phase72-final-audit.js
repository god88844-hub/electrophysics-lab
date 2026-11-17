// Phase 72: reviewable SOURCE CANDIDATE, never a substitute for real hardware
// measurements, integrated main release, independent review, or signed binaries.
import {readFile} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyPolicy as verifyPhase57} from './phase57-unified-audit.js';
import {runAcceptance} from './phase71-acceptance.js';
import {sourceSecurityScreen} from '../release/phase70-security.js';
import {makePackage,verifyPackage} from '../release/phase69-package.js';
export const FORMAT='invention-lab/phase72-research-candidate-final-audit/1';
const EXPECTED={
 format:FORMAT,target:'research-source-release-candidate',plannedDevelopmentPhases:72,
 sourcePackageReproducibleInCI:true,allDevelopmentPRsMergedIntoMain:false,
 realRepresentativeUserUATComplete:false,independentSecurityPenTestComplete:false,
 independentScientificReviewComplete:false,independentSupplierLicenseAuditComplete:false,
 independentlyVerifiedCleanHostInstallerTests:0,signedReleaseTagCreated:false,
 qualifiedFanSpecimens:0,authenticatedALUDies:0,
 physicallyQualifiedQuantumProcessors:0,physicallyCalibratedAccelerators:0,
 foundryTapeoutApproved:false,realHardwareBuildSuccessProbability:null,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
export function verifyFinalPolicy(policy){
 if(!isDeepStrictEqual(policy,EXPECTED))throw Error('Final research-release policy changed without independent evidence or review');
 return true;
}
const sha=buf=>createHash('sha256').update(buf).digest('hex');
// A source merge is not independent release approval.
export const RESEARCH_SOURCE_MERGE='e1c14e52b02c336bb05ac756de9091e069f30fc1';
export function researchSourceIntegrationStatus(){
 const shallow=execFileSync('git',['rev-parse','--is-shallow-repository'],{encoding:'utf8'}).trim();
 if(shallow==='true')return 'UNVERIFIED_SHALLOW_CHECKOUT';
 try{execFileSync('git',['merge-base','--is-ancestor',RESEARCH_SOURCE_MERGE,'HEAD'],{stdio:'ignore'});return 'VERIFIED_IN_GIT_ANCESTRY'}
 catch{return 'NOT_IN_CHECKOUT_ANCESTRY'}
}
export function softwareDisposition(status){
 return status==='VERIFIED_IN_GIT_ANCESTRY'?'INTEGRATED_RESEARCH_SOURCE_NOT_PRODUCT_RELEASE':
 status==='UNVERIFIED_SHALLOW_CHECKOUT'?'SOURCE_INTEGRATION_UNVERIFIED_SHALLOW_CHECKOUT':
 'SOURCE_INTEGRATION_NOT_PROVEN';
}
export async function reviewResearchCandidate(policy,{makeFreshPackage=true}={}){
 verifyFinalPolicy(policy);
 const phase57=JSON.parse(await readFile('benchmarks/phase57/release-policy.json','utf8'));
 verifyPhase57(phase57);
 const apiPolicy=JSON.parse(await readFile('benchmarks/phase71/acceptance-policy.json','utf8'));
 const acceptance=runAcceptance(apiPolicy);
 if(acceptance.examplesPassing!==6||acceptance.cases.some(x=>x.failedChecks!==0))
  throw Error('One or more full application workflows failed');
 const source=await readFile('serve.mjs','utf8'),security=sourceSecurityScreen(source);
 if(!security.sourceOnlyPolicyComplete)throw Error('Local server source policy missing');
 const target='benchmarks/evidence/phase72/package';
 if(makeFreshPackage)await makePackage(target);
 const archive=await verifyPackage(target);
 if(!archive.appEntrypointsPresent||archive.verifiedFiles<=20)
  throw Error('Research archive verification incomplete');
 const sourceIntegrationStatus=researchSourceIntegrationStatus();
 const blockers=[
  'NO_INDEPENDENT_REVIEW_OF_MERGED_SOURCE_AND_PROVENANCE',
  'NO_INDEPENDENT_PENETRATION_OR_SCIENTIFIC_REVIEW',
  'NO_REPRESENTATIVE_HUMAN_ACCEPTANCE_OR_INDEPENDENT_ACCESSIBILITY_AUDIT',
  'NO_SIGNED_RELEASE_TAG_OR_NATIVE_INSTALLER_ACCEPTANCE',
  'NO_ORIGINAL_SOURCE_MATCHED_3V_FAN_PHYSICAL_QUALIFICATION',
  'NO_AUTHENTICATED_FABRICATED_SKY130_ALU_DIES_OR_FOUNDRY_APPROVAL',
  'NO_AUTHENTICATED_QUANTUM_OR_ACCELERATOR_PHYSICAL_CALIBRATION'
 ];
 return {
  format:'invention-lab/phase72-source-candidate-decision/1',
  researchSourceCandidate:{status:'SOURCE_CHECKS_PASS',
   sourceIntegrationStatus,
   historicalStackedPRsIndividuallyMerged:false,
   developmentSourceIntegratedIntoMain:sourceIntegrationStatus==='VERIFIED_IN_GIT_ANCESTRY',
   archiveSHA256:archive.archiveSHA256,archiveFileCount:archive.verifiedFiles,
   acceptanceCaseCount:acceptance.examplesPassing,
   localServerSourceSHA256:sha(source),
   legacyPhysicalReleasePolicyVerified:true,
   fullRepositoryCIStatus:'CHECK_GITHUB_ACTIONS_NOT_INFERRED_FROM_SOURCE',
   actualHumanAcceptance:false,independentExternalAudit:false},
  physicalQualification:{referenceFanQualifiedSpecimens:0,
   fabricatedALUQualifiedDies:0,quantumQualifiedDevices:0,acceleratorQualifiedDevices:0,
   foundryTapeoutAuthorized:false,productionBuildSuccessProbability:null},
  integratedMainSoftwareRelease:false,
  publicSignedProductReleaseAuthorized:false,manufacturingReleaseAuthorized:false,
  decision:'DRAFT_RESEARCH_SOURCE_CANDIDATE_ONLY',
  blockers,
  nextActions:['Independently review merged source and provenance','Independently audit code, dependencies and security',
   'Conduct representative UAT and clean-host packaging tests',
   'Obtain source-matched physical data and independent qualification'],
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 };
}
