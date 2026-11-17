// Build a release-decision evidence packet, not a statistical yield result.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {verifyPolicy,assessDecisions,verifyDecision}
 from '../js/measure/phase28-decisions.js';
import {RTL_PATH,RTL_GIT_BLOB} from '../js/measure/phase24-prototype.js';
const base='benchmarks/evidence/phase28/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const policyBytes=await readFile('benchmarks/phase28/acceptance.json');
verifyPolicy(JSON.parse(policyBytes));
const inputs={
 phase24Summary:await readFile('benchmarks/evidence/phase24/phase24-summary.json'),
 phase26Summary:await readFile('benchmarks/evidence/phase26/phase26-summary.json'),
 phase27Summary:await readFile('benchmarks/evidence/phase27/phase27-summary.json'),
 phase27Audit:await readFile('benchmarks/evidence/phase27/phase27-preflight.json'),
 phase27EmptyCapture:await readFile('benchmarks/evidence/phase27/blank-lab-packet.json'),
 phase27Model:await readFile('benchmarks/evidence/phase27/premeasurement-model.json')
};
const rtlBlob=git('hash-object',RTL_PATH);
if(rtlBlob!==RTL_GIT_BLOB)throw Error('Actual RTL changed since Phase28 frozen decision policy');
const p24=JSON.parse(inputs.phase24Summary),p26=JSON.parse(inputs.phase26Summary),
 p27=JSON.parse(inputs.phase27Summary);
const p27audit=JSON.parse(inputs.phase27Audit),empty=JSON.parse(inputs.phase27EmptyCapture);
if(p27audit.status!=='awaiting-real-hardware'||p27audit.observedVectors!==0||
 empty.origin!=='uncollected'||
 !Array.isArray(empty.sessions)||empty.sessions.length!==48||
 empty.sessions.some(s=>s.observations!==null))
 throw Error('Phase27 source data did not retain all zero observed ALU hardware sessions');
const decision=assessDecisions(p24,p26,p27);
if(decision.provenanceAndCrossPhaseIssues.length||
   decision.criteriaGates.some(g=>g.verified)||
   decision.realWorldBuildSuccessPercent!==null||
   decision.productionReleaseDecision!=='NO_GO_MISSING_INDEPENDENT_SILICON_EVIDENCE')
 throw Error('Original source was promoted without valid physical evidence');
await mkdir(base,{recursive:true});
const report={
 format:'invention-lab/phase28-source-linked-release-decision-record/1',
 sourceCommit:git('rev-parse','HEAD'),rtlBlob,
 policySha256:sha(policyBytes),
 inputSha256:Object.fromEntries(Object.entries(inputs).map(([k,b])=>[k,sha(b)])),
 decision,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
const replay=verifyDecision(decision,decision,{
 currentCommit:report.sourceCommit,recordCommit:report.sourceCommit,
 policySha256:sha(policyBytes),recordPolicySha256:report.policySha256
});
if(!replay.ok)throw Error('Phase28 manufacturing decision evidence refused: '+replay.errors.join('; '));
await writeFile(base+'phase28.json',JSON.stringify(report,null,2)+'\n');
console.log('PH28 Go/no-go decision BLOCKED: actual ALU DUTs=0, measured vectors=0, independent physical evidence unavailable');
console.log('PH28 Manufacturing success probability=UNKNOWN, numerical percent=NULL; research simulation remains computational only');
