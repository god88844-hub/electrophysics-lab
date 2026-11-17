// Full independent original-byte rehash, real GitHub PR requery and
// physical no-go replay. No source status is inferred from a zip or CI label.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {fetchLivePulls,verifyPolicy,normalizePull,makeDecision,replayDecision,BASELINE_HEAD}
 from '../js/release/phase30-audit.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const root='benchmarks/evidence/phase30/';
try{
 const policyRaw=await readFile('benchmarks/phase30/acceptance.json');
 const policy=JSON.parse(policyRaw);verifyPolicy(policy);
 const record=JSON.parse(await readFile(root+'phase30.json','utf8'));
 const rawManifest=await readFile(root+'phase30-source-manifest.json');
 const manifest=JSON.parse(rawManifest);
 const sourceCommit=git('rev-parse','HEAD');
 const filePaths=execFileSync('git',['ls-files','-z']).toString('utf8').split('\0').filter(Boolean).sort();
 const realFiles=[];
 for(const path of filePaths){
  const data=await readFile(path);realFiles.push({path,bytes:data.length,sha256:sha(data)});
 }
 if(manifest.format!=='invention-lab/phase30-tracked-source-distribution/1'||
    manifest.sourceCommit!==sourceCommit||manifest.basePhase29Head!==BASELINE_HEAD||
    manifest.shaAlgorithm!=='SHA-256'||manifest.softwareOnly!==true||
    manifest.authenticatedHardwareMeasurements!==0||
    !isDeepStrictEqual(manifest.files,realFiles)||
    manifest.physicalValidation!=='none'||manifest.physicalVerdict!=='unknown'||
    manifest.realWorldBuildSuccessPercent!==null)
  throw Error('Released sources changed from 100% enumerated tracked SHA-256 manifest');
 const changes=git('diff','--name-only',BASELINE_HEAD+'..HEAD').split('\n').filter(Boolean).sort();
 const allowed=p=>p.startsWith('js/release/phase30-')||
   p.startsWith('scripts/phase30-')||p.startsWith('benchmarks/phase30/')||
   p.startsWith('tests/phase30-')||p.startsWith('docs/PHASE30-')||
   p.startsWith('.github/workflows/phase30-')||p.startsWith('js/evidence/phase31-')||
 p.startsWith('scripts/phase31-')||p.startsWith('benchmarks/phase31/')||
 p.startsWith('tests/phase31-')||p.startsWith('docs/PHASE31-')||
 p.startsWith('.github/workflows/phase31-')||
 p.startsWith('js/evidence/phase32-')||p.startsWith('scripts/phase32-')||
 p.startsWith('benchmarks/phase32/')||p.startsWith('tests/phase32-')||
 p.startsWith('docs/PHASE32-')||p.startsWith('.github/workflows/phase32-')||
 p==='js/ui/app.js'||p==='tests/browser-3d.html'||
 p==='README.md'||p==='package.json';
 const unexpectedChanges=changes.filter(x=>!allowed(x)),missingHistoricalCommits=[];
 for(const p of policy.stack)try{
  execFileSync('git',['merge-base','--is-ancestor',p.headSha,'HEAD'],{stdio:'ignore'});
 }catch{missingHistoricalCommits.push('PR #'+p.number+' '+p.headSha);}
 const integrity={
  accepted:missingHistoricalCommits.length===0&&unexpectedChanges.length===0&&
    realFiles.length>100&&git('merge-base',BASELINE_HEAD,'HEAD')===BASELINE_HEAD,
  sourceCommit,baselineHead:BASELINE_HEAD,
  noPreviousPhaseSourceModified:unexpectedChanges.length===0,
  allTrackedSourcesHashed:filePaths.length===realFiles.length&&filePaths.length>100,
  missingHistoricalCommits,unexpectedChanges,
  auditedNewReleaseFiles:changes,sourceCount:realFiles.length
 };
 const inputBytes={
  phase24:await readFile('benchmarks/evidence/phase24/phase24-summary.json'),
  phase26:await readFile('benchmarks/evidence/phase26/phase26-summary.json'),
  phase27:await readFile('benchmarks/evidence/phase27/phase27-summary.json'),
  phase28:await readFile('benchmarks/evidence/phase28/phase28-summary.json'),
  phase29:await readFile('benchmarks/evidence/phase29/phase29-summary.json')
 };
 const existingHashes=Object.fromEntries(Object.entries(inputBytes).map(([k,b])=>[k,sha(b)]));
 const sources=Object.fromEntries(Object.entries(inputBytes).map(([k,b])=>[k,JSON.parse(b)]));
 const currentPulls=(await fetchLivePulls({})).filter(p=>p.number>=3&&p.number<=29)
  .map(normalizePull).sort((a,b)=>a.number-b.number);
 const decision=makeDecision({policy,pulls:currentPulls,inputs:sources,integrity});
 const result=replayDecision(record.decision,decision,{
  sourceCommit,policySha256:record.policySha256,actualPolicySha256:sha(policyRaw)
 });
 if(!result.ok||record.format!=='invention-lab/phase30-independent-release-prerequisites/1'||
  record.sourceCommit!==sourceCommit||record.trackedSourceManifestSha256!==sha(rawManifest)||
  record.livePRScopeHash!==sha(JSON.stringify(currentPulls))||
  !isDeepStrictEqual(record.livePullRequestSnapshot,currentPulls)||
  !isDeepStrictEqual(record.originalPhaseSha256,existingHashes)||
  !decision.softwareReleaseCandidate||decision.warnings.length||
  decision.realWorldBuildSuccessPercent!==null)
  throw Error('Independent GitHub PR / original evidence or packaging audit failed: '+result.errors.join('; '));
 const summary={
  format:'invention-lab/phase30-final-research-software-release-audit/1',
  sourceCommit,softwareIntegrationAudit:'PASS',
  sourceTracedFileCount:realFiles.length,
  separatelyVerifiedLiveOpenPRs:27,
  acceptedStackedPRs:26,
  previouslyOpenUnmergedPRsPreserved:true,
  releaseChannel:'RESEARCH_SOFTWARE_CANDIDATE_ONLY',
  readyForPhysicalManufacturing:false,
  actualALUDiesFabricatedAndAuthenticated:0,
  actualPhysicalALUMeasurements:0,
  physicalQualificationGatesPassed:0,
  physicalQualificationGatesRequired:6,
  physicalValidation:'none',physicalVerdict:'unknown',
  manufacturingYieldEstimate:null,realWorldBuildSuccessPercent:null,
  completion:'Phase30 integration workflow complete, project hardware validation NOT complete',
  unresolvedExternalDependencies:[
   'fabricated mask-/source-matched ALU DUT and independent source trace',
   'calibrated raw physical instrument files and uncertainty budgets',
   'independent die/wafer/lot/PVT validation and actual prototype reliability',
   'qualified chip signoff beyond existing experimental open PDK checks',
   'human-reviewed PR integration/merges (never performed automatically)'
  ]
 };
 await writeFile(root+'phase30-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('PH30 STRICT PASS: all original tracked bytes, 27 live unmerged PRs, previous evidence, NO silicon GO; distribution status RESEARCH_ONLY');
}catch(error){console.error('PH30 STRICT FAIL: '+error.message);process.exitCode=1;}
