// Re-read every source file, verify source-locked original physical-gap
// reports and reproduce the exact manufacturing RELEASE BLOCKED decision.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {verifyPolicy,assessDecisions,verifyDecision,REQUIREMENTS}
 from '../js/measure/phase28-decisions.js';
import {RTL_PATH,RTL_GIT_BLOB} from '../js/measure/phase24-prototype.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const base='benchmarks/evidence/phase28/';
try{
 const policyBytes=await readFile('benchmarks/phase28/acceptance.json');
 verifyPolicy(JSON.parse(policyBytes));
 const sources={
  phase24Summary:await readFile('benchmarks/evidence/phase24/phase24-summary.json'),
  phase26Summary:await readFile('benchmarks/evidence/phase26/phase26-summary.json'),
  phase27Summary:await readFile('benchmarks/evidence/phase27/phase27-summary.json'),
  phase27Audit:await readFile('benchmarks/evidence/phase27/phase27-preflight.json'),
  phase27EmptyCapture:await readFile('benchmarks/evidence/phase27/blank-lab-packet.json'),
  phase27Model:await readFile('benchmarks/evidence/phase27/premeasurement-model.json')
 };
 const report=JSON.parse(await readFile(base+'phase28.json','utf8'));
 const phase24=JSON.parse(sources.phase24Summary),phase26=JSON.parse(sources.phase26Summary),
   phase27=JSON.parse(sources.phase27Summary),audit=JSON.parse(sources.phase27Audit),
   blank=JSON.parse(sources.phase27EmptyCapture);
 if(audit.status!=='awaiting-real-hardware'||audit.observedVectors!==0||
    blank.origin!=='uncollected'||blank.sessions?.length!==48||
    blank.sessions.some(s=>s.observations!==null))
  throw Error('A future physical acquisition was fabricated inside the original blank template');
 const actual={
  sourceCommit:git('rev-parse','HEAD'),rtlBlob:git('hash-object',RTL_PATH),
  policySha256:sha(policyBytes),
  inputSha256:Object.fromEntries(Object.entries(sources).map(([k,b])=>[k,sha(b)]))
 };
 const decision=assessDecisions(phase24,phase26,phase27);
 const verdict=verifyDecision(report.decision,decision,{
  currentCommit:actual.sourceCommit,recordCommit:report.sourceCommit,
  policySha256:actual.policySha256,recordPolicySha256:report.policySha256
 });
 if(!verdict.ok||report.format!=='invention-lab/phase28-source-linked-release-decision-record/1'||
   report.sourceCommit!==actual.sourceCommit||report.rtlBlob!==RTL_GIT_BLOB||
   actual.rtlBlob!==RTL_GIT_BLOB||report.policySha256!==actual.policySha256||
   !isDeepStrictEqual(report.inputSha256,actual.inputSha256)||
   report.physicalValidation!=='none'||report.physicalVerdict!=='unknown'||
   report.realWorldBuildSuccessPercent!==null||
   report.decision.provenanceAndCrossPhaseIssues.length!==0)
  throw Error('Strict release decision/provenance replay failed: '+verdict.errors.join('; '));
 const summary={
  format:'invention-lab/phase28-replayed-safe-no-go-decision/1',
  sourceCommit:actual.sourceCommit,
  sourceRTLBlob:RTL_GIT_BLOB,
  acceptedComputationalEvidenceReplay:true,
  physicalCriteriaGatesRequired:REQUIREMENTS.length,
  physicalCriteriaGatesSatisfied:0,
  realFabAndDUTsObserved:0,
  actualPhysicalALUTestVectors:0,
  publicUnrelatedDeviceMeasurements:102,
  futureALUTestVectorsPlanned:49152,
  physicalGoNoGoDecision:decision.realPrototypeQualificationDecision,
  manufacturingReleaseDecision:decision.productionReleaseDecision,
  physicalValidation:'none',physicalVerdict:'unknown',
  evidenceBasedBuildSuccessProbability:null,
  confidenceInterval:null,
  realWorldBuildSuccessPercent:null,
  conclusion:'HOLD: no independent actual ALU silicon. Design-rule checks, synthetic perfect packets and measured OTHER resistor devices cannot establish physical equivalence.'
 };
 await writeFile(base+'phase28-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH28 STRICT PASS: 6/6 physical evidence gates BLOCKED, ALU DUTs 0; manufacturing probability and yield UNKNOWN');
}catch(e){console.error('PH28 STRICT FAIL: '+e.message);process.exitCode=1;}
