// Bind the final research software candidate to LIVE GitHub PR state,
// all tracked source bytes, actual previous phase reports and git ancestry.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fetchLivePulls,verifyPolicy,normalizePull,makeDecision,BASELINE_HEAD}
 from '../js/release/phase30-audit.js';
const out='benchmarks/evidence/phase30/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const policyRaw=await readFile('benchmarks/phase30/acceptance.json');
const policy=JSON.parse(policyRaw);verifyPolicy(policy);
const sourceCommit=git('rev-parse','HEAD');
const missingHistoricalCommits=[];
for(const p of policy.stack){
 try{execFileSync('git',['merge-base','--is-ancestor',p.headSha,'HEAD'],{stdio:'ignore'});}
 catch{missingHistoricalCommits.push('PR #'+p.number+' '+p.headSha);}
}
const changes=git('diff','--name-only',BASELINE_HEAD+'..HEAD')
 .split('\n').filter(Boolean).sort();
const approvedChangedPath=(p)=>(
 p.startsWith('js/release/phase30-')||
 p.startsWith('scripts/phase30-')||
 p.startsWith('benchmarks/phase30/')||
 p.startsWith('tests/phase30-')||
 p.startsWith('docs/PHASE30-')||
 p.startsWith('.github/workflows/phase30-')||
 p.startsWith('js/evidence/phase31-')||
 p.startsWith('scripts/phase31-')||p.startsWith('benchmarks/phase31/')||
 p.startsWith('tests/phase31-')||p.startsWith('docs/PHASE31-')||
 p.startsWith('.github/workflows/phase31-')||
 p.startsWith('js/evidence/phase32-')||p.startsWith('scripts/phase32-')||
 p.startsWith('benchmarks/phase32/')||p.startsWith('tests/phase32-')||
 p.startsWith('docs/PHASE32-')||p.startsWith('.github/workflows/phase32-')||
 p==='js/ui/app.js'||p==='tests/browser-3d.html'||
 p==='README.md'||p==='package.json');
const unexpectedChanges=changes.filter(p=>!approvedChangedPath(p));
const paths=execFileSync('git',['ls-files','-z']).toString('utf8').split('\0').filter(Boolean).sort();
const fileHashes=[];
for(const path of paths){
 const bytes=await readFile(path);
 fileHashes.push({path,bytes:bytes.length,sha256:sha(bytes)});
}
const integrity={
 accepted:missingHistoricalCommits.length===0&&unexpectedChanges.length===0&&
   paths.length>100&&git('merge-base',BASELINE_HEAD,'HEAD')===BASELINE_HEAD,
 sourceCommit,baselineHead:BASELINE_HEAD,
 noPreviousPhaseSourceModified:unexpectedChanges.length===0,
 allTrackedSourcesHashed:paths.length===fileHashes.length&&paths.length>100,
 missingHistoricalCommits,unexpectedChanges,
 auditedNewReleaseFiles:changes,sourceCount:paths.length
};
const originalInputs={
 phase24:await readFile('benchmarks/evidence/phase24/phase24-summary.json'),
 phase26:await readFile('benchmarks/evidence/phase26/phase26-summary.json'),
 phase27:await readFile('benchmarks/evidence/phase27/phase27-summary.json'),
 phase28:await readFile('benchmarks/evidence/phase28/phase28-summary.json'),
 phase29:await readFile('benchmarks/evidence/phase29/phase29-summary.json')
};
const sources=Object.fromEntries(Object.entries(originalInputs).map(([k,v])=>[k,JSON.parse(v)]));
const actualPulls=await fetchLivePulls({});
const relevant=actualPulls.filter(p=>p.number>=3&&p.number<=29)
 .map(normalizePull).sort((a,b)=>a.number-b.number);
const decision=makeDecision({policy,pulls:relevant,inputs:sources,integrity});
if(!decision.softwareReleaseCandidate||decision.warnings.length||
   !decision.prAudit.accepted||!decision.hardware.crossPhaseEvidenceConsistent||
   decision.realWorldBuildSuccessPercent!==null)
 throw Error('Phase30 software packaging blocked; live PRs, source or physical evidence inconsistent: '+decision.warnings.join('; '));
await mkdir(out,{recursive:true});
const manifest={
 format:'invention-lab/phase30-tracked-source-distribution/1',
 sourceCommit,basePhase29Head:BASELINE_HEAD,
 shaAlgorithm:'SHA-256',files:fileHashes,
 softwareOnly:true,authenticatedHardwareMeasurements:0,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
};
const model={
 format:'invention-lab/phase30-independent-release-prerequisites/1',
 sourceCommit,policySha256:sha(policyRaw),
 originalPhaseSha256:Object.fromEntries(Object.entries(originalInputs).map(([k,b])=>[k,sha(b)])),
 trackedSourceManifestSha256:sha(JSON.stringify(manifest,null,2)+'\n'),
 livePRScopeHash:sha(JSON.stringify(relevant)),
 livePullRequestSnapshot:relevant,decision
};
await writeFile(out+'phase30-source-manifest.json',JSON.stringify(manifest,null,2)+'\n');
await writeFile(out+'phase30.json',JSON.stringify(model,null,2)+'\n');
console.log('PH30 integration source provenance PASS: '+fileHashes.length+' original tracked files SHA256, '+decision.prAudit.checkedPRs+' open unmerged PRs verified LIVE');
console.log('PH30 release status RESEARCH ONLY: 0 verified ALU dies, no physical GO, manufacturing success UNKNOWN');
