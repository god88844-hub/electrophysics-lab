// Release decisions are not physics decisions.
// PR state must be checked live; code/ZIP hashes cannot authenticate silicon.
import {isDeepStrictEqual} from 'node:util';
export const POLICY_FORMAT='invention-lab/phase30-release-stack-policy/1';
export const REPORT_FORMAT='invention-lab/phase30-release-source-qualification/1';
export const REPO='god88844-hub/invention-lab';
export const BASELINE_HEAD='525cf34874fe2672c593bc32db1d81142df80d85';
const sha40=x=>typeof x==='string'&&/^[0-9a-f]{40}$/.test(x);
const sha64=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const releaseLimit={
 phase27PlannedALUPhysicalReadings:49152,
 actualAuthenticatedALUPhysicalReadings:0,
 physicallyQualifiedALUPrototypeCount:0,
 foundrySignoffQualified:false,
 referenceDatasetsAreDesignSpecific:false,
 prototypeApproval:'BLOCKED_NEEDS_REAL_HARDWARE',
 productionRelease:'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE',
 simulationPhysicalEquivalenceDemonstrated:false,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
export const RELEASE_LIMITS=Object.freeze(releaseLimit);
export function verifyPolicy(policy){
 if(!policy||typeof policy!=='object'||policy.format!==POLICY_FORMAT||
    policy.repository!==REPO||
    policy.productionReleaseAuthorized!==false||policy.automaticMergeAuthorized!==false||
    policy.projectScope!=='computing-invention-lab-only-AeroForge-out-of-scope'||
    policy.baselineDevelopmentHead!==BASELINE_HEAD||
    policy.stackStartPr!==4||policy.stackEndPr!==29||policy.stackLength!==26||
    policy.releaseDisposition!=='RESEARCH_SOFTWARE_CANDIDATE_NOT_PHYSICALLY_QUALIFIED'||
    !isDeepStrictEqual(policy.immutableEvidenceLimits,RELEASE_LIMITS))
  throw Error('Frozen release permissions / physical qualification boundary changed');
 const entries=policy.stack;
 if(!Array.isArray(entries)||entries.length!==26)
  throw Error('The exact 26-PR research stack is required');
 if(!entries.every((e,i)=>e.number===i+4&&sha40(e.headSha)&&
   typeof e.headBranch==='string'&&e.headBranch.startsWith('feature/')&&
   e.expectedOpen===true&&e.expectedMerged===false&&e.requireDraft===(e.number>=7)))
  throw Error('Unexpected PR number, SHA, branch or review policy');
 if(entries[0].baseBranch!=='main'||entries.at(-1).headSha!==BASELINE_HEAD||
    entries.slice(1).some((e,i)=>e.baseBranch!==entries[i].headBranch)||
    new Set(entries.map(e=>e.headBranch)).size!==26||
    new Set(entries.map(e=>e.headSha)).size!==26)
  throw Error('Historical development branch stack is not an exact linear dependency chain');
 const s=policy.standaloneOpenPr;
 if(s?.number!==3||s?.baseBranch!=='main'||!sha40(s.headSha)||
    s.headBranch!=='feature/physical-validation-foundation'||
    s.expectedOpen!==true||s.expectedMerged!==false||s.requireDraft!==false)
  throw Error('Separate open PR3 was hidden or merged into the stacked release');
 return true;
}
export function normalizePull(p){
 return {
  number:p?.number,
  headBranch:p?.head?.ref??p?.headBranch,
  headSha:p?.head?.sha??p?.headSha,
  baseBranch:p?.base?.ref??p?.baseBranch,
  state:p?.state??(p?.expectedOpen?'open':'closed'),
  draft:p?.draft??(p?.requireDraft===true),
  merged: p?.merged===true||p?.merged_at!=null
 };
}
export function auditPullStack(policy,rawPulls){
 verifyPolicy(policy);
 if(!Array.isArray(rawPulls))throw Error('Live GitHub PR list missing; do not assume open or unmerged');
 const byNumber=new Map();
 for(const raw of rawPulls){
  const p=normalizePull(raw);
  if(!Number.isInteger(p.number))continue;
  if(byNumber.has(p.number))throw Error('Conflicting duplicate live PR records');
  byNumber.set(p.number,p);
 }
 const expected=[policy.standaloneOpenPr,...policy.stack];
 const mismatches=[];
 for(const item of expected){
  const live=byNumber.get(item.number);
  if(!live){mismatches.push('PR #'+item.number+' missing from GitHub state');continue;}
  if(live.headBranch!==item.headBranch||live.headSha!==item.headSha||
     live.baseBranch!==item.baseBranch)
   mismatches.push('PR #'+item.number+' source head or base changed');
  if(live.state!=='open'||live.merged)
   mismatches.push('PR #'+item.number+' closed/merged without release authorization');
  if(item.requireDraft===true&&live.draft!==true)
   mismatches.push('PR #'+item.number+' was promoted out of DRAFT without review');
 }
 return {
  checkedPRs:expected.length,
  stackedOpenPRs:policy.stack.length,standaloneOpenPRs:1,
  draftRequiredPRs:policy.stack.filter(x=>x.requireDraft).length,
  drift:mismatches,
  accepted:mismatches.length===0,
  noPRWasMerged:mismatches.length===0,
  stackHasNotBeenApprovedForRelease:true
 };
}
export async function fetchLivePulls({token=process.env.GITHUB_TOKEN,repo=REPO}={}){
 if(repo!==REPO)throw Error('Release verifier restricted to the original computing repository');
 const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 if(token)headers.Authorization='Bearer '+token;
 const url='https://api.github.com/repos/'+REPO+'/pulls?state=all&per_page=100';
 let last=null;
 for(let n=0;n<3;n++){
  try{
   const response=await fetch(url,{headers,signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw Error('GitHub API returned HTTP '+response.status);
   const objects=await response.json();
   if(!Array.isArray(objects)||objects.length<29||objects.length>=100)
    throw Error('GitHub PR API listing incomplete/paginated; refuse to claim full audit');
   return objects;
  }catch(e){last=e;}
 }
 throw Error('Cannot confirm live GitHub PR status: '+last.message);
}
/** The existing ALU is UNMEASURED; a software-only source build is not a product. */
export function auditPhysicalEvidence(inputs){
 const gaps=[];
 const require=(condition,message)=>{if(!condition)gaps.push(message)};
 const a=inputs?.phase24,b=inputs?.phase26,c=inputs?.phase27,d=inputs?.phase28,e=inputs?.phase29;
 require(a?.actualPhysicalObservations===0&&a?.reportedStatus==='awaiting-real-hardware'&&
    a?.physicalValidation==='none'&&a?.realWorldBuildSuccessPercent===null,
    'Phase24 original ALU capture must have zero genuine silicon readings');
 require(b?.accepted===true&&b?.originalResistorDevices===2&&
    b?.observedTotalResistorSweepReadings===102&&
    b?.actualALUHardwareSpecimens===0&&b?.actualALUHardwareMeasurements===0&&
    b?.targetFailureModesUnverified===12&&b?.realWorldBuildSuccessPercent===null,
    'Phase26 public measured resistors cannot be swapped for fabricated ALU silicon');
 require(c?.futureMeasurements===49152&&c?.originalHardwareReadings===0&&
    c?.actualFabricatedALUCount===0&&c?.independentPreregistrationAttested===false&&
    c?.realWorldBuildSuccessPercent===null,
    'Phase27 planned 49152 original readings remain uncollected');
 require(d?.acceptedComputationalEvidenceReplay===true&&
    d?.physicalCriteriaGatesRequired===6&&d?.physicalCriteriaGatesSatisfied===0&&
    d?.realFabAndDUTsObserved===0&&d?.actualPhysicalALUTestVectors===0&&
    d?.manufacturingReleaseDecision==='NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE'&&
    d?.realWorldBuildSuccessPercent===null,
    'Phase28 production release cannot be promoted to silicon-qualified GO');
 require(e?.accepted===true&&e?.registeredLabContexts===8&&
    e?.originalSourceVerifiedHistoricalReferences===12&&
    e?.activePhysicalMeasurementCount===0&&e?.referenceCasesLinkedToCurrentDesign===0&&
    e?.physicalVerdict==='unknown'&&e?.realWorldBuildSuccessPercent===null,
    'Phase29 historical reference links are not real tests of active 3D diagrams');
 return {checkedInputs:5,crossPhaseEvidenceConsistent:gaps.length===0,issues:gaps,
  physicalGate:'BLOCKED_NEEDS_REAL_HARDWARE',
  productionGate:'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE',
  softwareScope:'INTEGRATION_TESTED_RESEARCH_CANDIDATE',
  actualAuthenticatedALUPrototypes:0,
  originalALUPhysicalReadings:0,
  realWorldBuildSuccessPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  manufacturingYieldConfidenceInterval:null,
  fullSimulationPhysicalEquivalenceProven:false
 };
}
export function makeDecision({policy,pulls,inputs,integrity}){
 verifyPolicy(policy);
 const pr=auditPullStack(policy,pulls),hardware=auditPhysicalEvidence(inputs);
 const validIntegrity=integrity&&integrity.accepted===true&&
   sha40(integrity.sourceCommit)&&
   integrity.baselineHead===BASELINE_HEAD&&
   integrity.noPreviousPhaseSourceModified===true&&
   integrity.allTrackedSourcesHashed===true&&
   integrity.missingHistoricalCommits.length===0&&
   integrity.sourceCount>100;
 const issues=[...pr.drift,...hardware.issues];
 if(!validIntegrity)issues.push('Tracked source bytes/ancestry not independently verified');
 return {format:REPORT_FORMAT,sourceCommit:integrity?.sourceCommit??null,
  baselineHead:BASELINE_HEAD,repository:REPO,prAudit:pr,
  hardware,
  sourceAudit:{...integrity},
  softwareReleaseCandidate:issues.length===0,
  readiness:issues.length===0?'RESEARCH_CANDIDATE_VERIFIED':'BLOCKED_SOURCE_OR_PR_DRIFT',
  independentManufacturingApproval:false,
  productionDecision:'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE',
  actualALUPrototypesVerified:0,actualALUSiliconMeasurements:0,
  realWorldBuildSuccessPercent:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  warnings:issues,
  nextRequiredForPhysicalValidation:[
   'manufacture and independently authenticate the source-/mask-matched target ALU',
   'collect original calibrated instrument traces and reviewed uncertainty',
   'measure unseen physical dies from independent wafers and lots at specified PVT',
   'independently review DRC/LVS signoff coverage and prespecified failure metrics'
  ]};
}
export function replayDecision(given,computed,metadata){
 const errors=[];
 if(!isDeepStrictEqual(given,computed))errors.push('Release gate report differs from independently recomputed original sources');
 if(!sha40(metadata?.sourceCommit)||metadata.sourceCommit!==given.sourceCommit)
  errors.push('Stored source HEAD differs from Git');
 if(!sha64(metadata?.policySha256)||metadata.policySha256!==metadata.actualPolicySha256)
  errors.push('Original PR topology policy SHA256 changed');
 if(given.productionDecision!=='NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE'||
    given.independentManufacturingApproval!==false||
    given.realWorldBuildSuccessPercent!==null||
    given.physicalValidation!=='none'||given.physicalVerdict!=='unknown'||
    given.actualALUPrototypesVerified!==0||
    given.actualALUSiliconMeasurements!==0||
    given.hardware?.manufacturingYieldConfidenceInterval!==null||
    given.hardware?.fullSimulationPhysicalEquivalenceProven!==false)
  errors.push('Unmeasured 8-bit silicon was falsely promoted to release GO');
 return {ok:errors.length===0,errors,physicalVerdict:'unknown',manufacturingSuccessPercent:null};
}
