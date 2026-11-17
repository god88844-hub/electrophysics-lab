import {isDeepStrictEqual} from 'node:util';
import {RTL_GIT_BLOB,SUITE_SHA256} from '../measure/phase24-prototype.js';
export const FORMAT='invention-lab/phase53-sky130-openflow-signoff-boundary/1';
const names=["foundry-qualified-complete-DRC-rule-coverage","independently-accepted-LVS-device-and-net-coverage","post-extraction-SI-and-multicorner-timing-coverage","onchip-power-grid-IRdrop-and-EM-signoff","antenna-ESD-latchup-and-PDN-reliability-review","padframe-IO-package-and-die-assembly-contract","source-to-mask-revision-and-fabrication-identity","qualified-foundry-process-and-licensed-PDK-release","manufacturing-test-DFT-and-silicon-testability-plan","independent-foundry-approval-record"];
const scripts=['scripts/phase21-run.sh','scripts/phase22-run.sh','scripts/phase22-enable-feol.mjs','scripts/phase22-proof.ys','benchmarks/phase13/rtl/alu8.v'];
const must=(a,m)=>{if(!a)throw Error(m)};
const freeze=x=>{if(x&&typeof x==='object'){for(const y of Object.values(x))freeze(y);Object.freeze(x)}return x};
export function verifySignoffPolicy(p,sourceText){
 const expected={
 format:FORMAT,designId:'sky130-alu8',originalRtlBlobSHA1:RTL_GIT_BLOB,
 originalVectorSuiteSHA256:SUITE_SHA256,
 sourcePDKNoticeURL:'https://skywater-pdk.readthedocs.io/en/main/status.html',
 sourcePDKNotice:'experimental-preview-not-intended-for-production',
 sourceOpenFlowScripts:scripts,
 expectedDockerImageTag:'openroad/orfs:26Q4-430-g2272e787c',
 expectedDockerDigest:'openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71',
 originalRuleDeckDRCGitBlobSHA1:'e1a1bbb4721bd02bac42c2cb92ec2d24b25db8b6',
 originalRuleDeckLVSGitBlobSHA1:'12eb8bf51a404b7a7cc149b00e93c302d39f7108',
 demonstratedOpenFlowScope:['source-pinned-model-routing-gds','open-klayout-drc-and-lvs','feol-reenabled-experimental-drc','source-to-final-gate-boolean-sat'],
 requiredIndependentFoundrySignoff:names.map(id=>({id,foundryQualified:false,independentApprovalRecord:null})),
 signedReleaseCandidate:false,originalSignedGDSArtifact:null,fabMaskAuthorized:false,
 dieIdentitiesMeasured:0,actualManufacturedALUMeasurements:0,fullPhysicalYield:null,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 must(isDeepStrictEqual(p,expected),'Foundry physical evidence policy was weakened or hardware results fabricated');
 must(sourceText&&scripts.every(f=>typeof sourceText[f]==='string'&&sourceText[f].length>60),
 'Original open-flow scripts missing');
 must(sourceText[scripts[0]].includes(p.expectedDockerImageTag)&&
  sourceText[scripts[0]].includes(p.expectedDockerDigest)&&
  sourceText[scripts[0]].includes(p.originalRuleDeckDRCGitBlobSHA1)&&
  sourceText[scripts[0]].includes(p.originalRuleDeckLVSGitBlobSHA1)&&
  sourceText[scripts[0]].includes('drc lvs'),'Actual pinned Phase21 layout/equivalence flow missing');
 must(sourceText[scripts[1]].includes(p.expectedDockerImageTag)&&
  sourceText[scripts[1]].includes(p.originalRuleDeckDRCGitBlobSHA1)&&
  sourceText[scripts[1]].includes('yosys')&&
  sourceText[scripts[1]].includes('phase21-run.sh'),
  'Actual original Phase22 proof chain missing');
 must(sourceText[scripts[2]].includes('FEOL')&&sourceText[scripts[3]].includes('alu8'),
  'Source-pinned FEOL proof or ALU design missing');
 must(sourceText[scripts[4]].includes('module alu8'),
  'Not the source-locked ALU RTL');
 return true;
}
export function assessSiliconSignoff(p,sourceText,candidate={}){
 verifySignoffPolicy(p,sourceText);
 const fields=candidate&&typeof candidate==='object'&&!Array.isArray(candidate)?
  Object.keys(candidate).sort():[];
 return freeze({
 format:'invention-lab/phase53-signoff-readiness-decision/1',
 target:p.designId,originalRtlBlobSHA1:p.originalRtlBlobSHA1,
 originalSourceLockedOpenFlowCheckClasses:p.demonstratedOpenFlowScope,
 missingFoundryAcceptanceClasses:p.requiredIndependentFoundrySignoff.map(x=>x.id),
 checkedSourceFlowDefinitions:scripts.length,
 candidateSelfAttestedFields:fields,
 candidateFoundryCertificateAuthenticated:false,
 originalSignedGDSExternallyAuthenticated:false,
 signoffDisposition:'NO_GO_FOUNDRY_SIGNOFF_AND_SILICON_MISSING',
 foundryCertified:false,maskTapeoutAuthorized:false,
 actualALUDiesQualified:0,manufacturingYieldEstimate:null,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 });
}
