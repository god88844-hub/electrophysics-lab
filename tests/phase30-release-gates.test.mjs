import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POLICY_FORMAT,BASELINE_HEAD,RELEASE_LIMITS,REPO,verifyPolicy,
 normalizePull,auditPullStack,auditPhysicalEvidence,makeDecision,replayDecision}
 from '../js/release/phase30-audit.js';

const policy=JSON.parse(readFileSync(new URL('../benchmarks/phase30/acceptance.json',import.meta.url),'utf8'));
const live=()=>[policy.standaloneOpenPr,...policy.stack].map(x=>({
 number:x.number,head:{ref:x.headBranch,sha:x.headSha},base:{ref:x.baseBranch},
 state:'open',draft:x.requireDraft,merged_at:null
}));
const sources=()=>({
 phase24:{actualPhysicalObservations:0,reportedStatus:'awaiting-real-hardware',
  physicalValidation:'none',realWorldBuildSuccessPercent:null},
 phase26:{accepted:true,originalResistorDevices:2,observedTotalResistorSweepReadings:102,
  actualALUHardwareSpecimens:0,actualALUHardwareMeasurements:0,
  targetFailureModesUnverified:12,realWorldBuildSuccessPercent:null},
 phase27:{futureMeasurements:49152,originalHardwareReadings:0,
  actualFabricatedALUCount:0,independentPreregistrationAttested:false,
  realWorldBuildSuccessPercent:null},
 phase28:{acceptedComputationalEvidenceReplay:true,physicalCriteriaGatesRequired:6,
  physicalCriteriaGatesSatisfied:0,realFabAndDUTsObserved:0,actualPhysicalALUTestVectors:0,
  manufacturingReleaseDecision:'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE',
  realWorldBuildSuccessPercent:null},
 phase29:{accepted:true,registeredLabContexts:8,
  originalSourceVerifiedHistoricalReferences:12,
  activePhysicalMeasurementCount:0,referenceCasesLinkedToCurrentDesign:0,
  physicalVerdict:'unknown',realWorldBuildSuccessPercent:null}
});
const integrity=()=>({accepted:true,sourceCommit:'a'.repeat(40),
 baselineHead:BASELINE_HEAD,noPreviousPhaseSourceModified:true,
 allTrackedSourcesHashed:true,missingHistoricalCommits:[],
 auditedNewReleaseFiles:['scripts/phase30-capture.mjs'],sourceCount:320});
const metadata={sourceCommit:'a'.repeat(40),
 policySha256:'b'.repeat(64),actualPolicySha256:'b'.repeat(64)};
test('Actual frozen stack policy includes 26 predecessor PRs and separate open PR3',()=>{
 assert.equal(verifyPolicy(policy),true);
 assert.equal(policy.format,POLICY_FORMAT);
 assert.equal(policy.repository,REPO);
 assert.equal(policy.stack.length,26);
 assert.deepEqual(policy.stack.map(x=>x.number),Array.from({length:26},(_,i)=>i+4));
 assert.equal(policy.standaloneOpenPr.number,3);
 assert.equal(policy.baselineDevelopmentHead,BASELINE_HEAD);
 assert.equal(policy.stack.at(-1).headSha,BASELINE_HEAD);
 assert.equal(policy.productionReleaseAuthorized,false);
 assert.equal(policy.automaticMergeAuthorized,false);
});
test('Live GitHub-compatible PR state stays open and predecessor-ordered, 23 draft requirements',()=>{
 const p=auditPullStack(policy,live());
 assert.equal(p.accepted,true);assert.equal(p.checkedPRs,27);
 assert.equal(p.stackedOpenPRs,26);
 assert.equal(p.draftRequiredPRs,23);
 assert.equal(p.noPRWasMerged,true);
 assert.equal(p.drift.length,0);
});
test('Closed, merged or mutated predecessor branch yields fail-closed audit',()=>{
 for(const mutation of [
  x=>x[0].merged_at='2026-11-17T00:00:00Z',
  x=>x[2].state='closed',
  x=>x[2].head.sha='0'.repeat(40),
  x=>x[2].base.ref='main',
  x=>x.at(-1).head.sha='f'.repeat(40),
  x=>x.at(-1).base.ref='main',
  x=>x.splice(10,1)
 ]){
  const pulls=live();mutation(pulls);
  assert.equal(auditPullStack(policy,pulls).accepted,false);
 }
});
test('Mandatory draft review cannot be skipped while earlier non-draft PR4–6 remain faithfully recorded',()=>{
 const bad=live();bad.find(x=>x.number===7).draft=false;
 assert.ok(auditPullStack(policy,bad).drift.some(x=>x.includes('DRAFT')));
 assert.equal(auditPullStack(policy,live()).accepted,true);
});
test('Duplicate GitHub PR entries cannot silently override valid head or merged status',()=>{
 assert.throws(()=>auditPullStack(policy,[...live(),live()[7]]),/duplicate/);
 assert.throws(()=>auditPullStack(policy,null),/missing/);
});
test('Altered repo, permitted merge, fab pass or design-success percentage fails frozen policy',()=>{
 const changes=[
  p=>p.repository='other/repo',
  p=>p.productionReleaseAuthorized=true,
  p=>p.automaticMergeAuthorized=true,
  p=>p.projectScope='AeroForge',
  p=>p.baselineDevelopmentHead='0'.repeat(40),
  p=>p.immutableEvidenceLimits.realWorldBuildSuccessPercent=100,
  p=>p.immutableEvidenceLimits.actualAuthenticatedALUPhysicalReadings=1,
  p=>p.immutableEvidenceLimits.foundrySignoffQualified=true,
  p=>p.releaseDisposition='PRODUCTION_READY',
  p=>p.stack.pop(),
  p=>p.stack[0].baseBranch='not-main',
  p=>p.stack[1].baseBranch='main',
  p=>p.stack[20].requireDraft=false,
  p=>p.standaloneOpenPr.number=4
 ];
 for(const mutate of changes){
  const p=structuredClone(policy);mutate(p);
  assert.throws(()=>verifyPolicy(p));
 }
 assert.equal(RELEASE_LIMITS.realWorldBuildSuccessPercent,null);
});
test('Source-bound Phase24/26/27/28/29 reports explicitly acknowledge zero original ALU silicon',()=>{
 const audit=auditPhysicalEvidence(sources());
 assert.equal(audit.checkedInputs,5);
 assert.equal(audit.crossPhaseEvidenceConsistent,true);
 assert.equal(audit.originalALUPhysicalReadings,0);
 assert.equal(audit.actualAuthenticatedALUPrototypes,0);
 assert.equal(audit.fullSimulationPhysicalEquivalenceProven,false);
 assert.equal(audit.manufacturingYieldConfidenceInterval,null);
 assert.equal(audit.productionGate,'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE');
 assert.equal(audit.realWorldBuildSuccessPercent,null);
});
test('An unrelated real resistor reading cannot become a fabricated ALU measurement',()=>{
 const s=sources();s.phase26.actualALUHardwareSpecimens=2;
 assert.equal(auditPhysicalEvidence(s).crossPhaseEvidenceConsistent,false);
 assert.ok(auditPhysicalEvidence(s).issues[0].includes('resistors'));
});
test('Forged upstream physical successes, reference-catalog proof and predicted yield are rejected',()=>{
 const changes=[
  s=>s.phase24.actualPhysicalObservations=1024,
  s=>s.phase26.targetFailureModesUnverified=0,
  s=>s.phase27.actualFabricatedALUCount=8,
  s=>s.phase27.realWorldBuildSuccessPercent=100,
  s=>s.phase28.manufacturingReleaseDecision='GO',
  s=>s.phase28.realWorldBuildSuccessPercent=100,
  s=>s.phase29.referenceCasesLinkedToCurrentDesign=12,
  s=>s.phase29.physicalVerdict='pass',
  s=>s.phase29.originalSourceVerifiedHistoricalReferences=0,
  s=>s.phase24=undefined
 ];
 for(const change of changes){
  const s=sources();change(s);
  assert.equal(auditPhysicalEvidence(s).crossPhaseEvidenceConsistent,false);
 }
});
test('Research candidate decision never turns green software tests into foundry GO',()=>{
 const decision=makeDecision({policy,pulls:live(),inputs:sources(),integrity:integrity()});
 assert.equal(decision.softwareReleaseCandidate,true);
 assert.equal(decision.readiness,'RESEARCH_CANDIDATE_VERIFIED');
 assert.equal(decision.productionDecision,'NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE');
 assert.equal(decision.independentManufacturingApproval,false);
 assert.equal(decision.realWorldBuildSuccessPercent,null);
 assert.equal(decision.physicalVerdict,'unknown');
 assert.equal(decision.actualALUPrototypesVerified,0);
 assert.ok(decision.nextRequiredForPhysicalValidation.length>=4);
});
test('Source fingerprint changes, missing original ancestor or forged old source modifications block research packaging',()=>{
 const mutations=[
  x=>x.accepted=false,
  x=>x.noPreviousPhaseSourceModified=false,
  x=>x.allTrackedSourcesHashed=false,
  x=>x.missingHistoricalCommits.push('old phase'),
  x=>x.baselineHead='0'.repeat(40),
  x=>x.sourceCount=0
 ];
 for(const m of mutations){
  const i=integrity();m(i);
  const d=makeDecision({policy,pulls:live(),inputs:sources(),integrity:i});
  assert.equal(d.softwareReleaseCandidate,false);
  assert.ok(d.warnings.length>0);
 }
});
test('An actual upstream PR merge or stale head blocks the software candidate too',()=>{
 const p=live();p[12].merged_at='2026-11-17T00:00:00Z';
 const a=makeDecision({policy,pulls:p,inputs:sources(),integrity:integrity()});
 assert.equal(a.softwareReleaseCandidate,false);
 assert.ok(a.warnings.some(x=>x.includes('closed/merged')));
});
test('Strict replay rejects tampered numerical manufacturing probabilities or hardware verdict',()=>{
 const original=makeDecision({policy,pulls:live(),inputs:sources(),integrity:integrity()});
 assert.equal(replayDecision(original,structuredClone(original),metadata).ok,true);
 const edits=[
  x=>x.productionDecision='GO',
  x=>x.independentManufacturingApproval=true,
  x=>x.realWorldBuildSuccessPercent=100,
  x=>x.physicalValidation='full',
  x=>x.physicalVerdict='pass',
  x=>x.actualALUPrototypesVerified=8,
  x=>x.actualALUSiliconMeasurements=49152,
  x=>x.hardware.manufacturingYieldConfidenceInterval=[.9,1],
  x=>x.hardware.fullSimulationPhysicalEquivalenceProven=true,
  x=>x.prAudit.accepted=false,
  x=>x.softwareReleaseCandidate=false
 ];
 for(const change of edits){
  const candidate=structuredClone(original);change(candidate);
  assert.equal(replayDecision(candidate,original,metadata).ok,false);
 }
});
test('Strict replay requires original evidence commit and unchanged acceptance SHA',()=>{
 const d=makeDecision({policy,pulls:live(),inputs:sources(),integrity:integrity()});
 for(const change of [
  x=>x.sourceCommit='old',x=>x.policySha256='f'.repeat(64),
  x=>x.actualPolicySha256='a'.repeat(64)]){
  const m={...metadata};change(m);
  assert.equal(replayDecision(d,d,m).ok,false);
 }
});
test('A separate open PR3 remains distinct from the actual integrated 26-PR dependency stack',()=>{
 assert.equal(policy.standaloneOpenPr.baseBranch,'main');
 assert.equal(policy.stack[0].baseBranch,'main');
 assert.equal(policy.standaloneOpenPr.headBranch,'feature/physical-validation-foundation');
 assert.equal(policy.stack.some(x=>x.number===3),false);
 assert.equal(policy.standaloneOpenPr.requireDraft,false);
});
