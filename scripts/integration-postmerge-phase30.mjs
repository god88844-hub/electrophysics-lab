// Phase 30 post-integration research-software provenance audit.
// Phase 30's historical open-PR stack gate remains immutable in the original
// capture/strict scripts, but cannot apply after PR #73 has merged to main.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {verifyPolicy,BASELINE_HEAD} from '../js/release/phase30-audit.js';
import {integrationAudit} from '../js/release/integration-reconcile.js';
const INTEGRATION_MERGE='e1c14e52b02c336bb05ac756de9091e069f30fc1';
const FORMAT='invention-lab/phase30-postmerge-research-source-audit/1';
const dir='benchmarks/evidence/phase30/';
const hash=x=>createHash('sha256').update(x).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const requireOk=(yes,message)=>{if(!yes)throw Error(message)};
const isAncestor=sha=>{
 const proc=execFileSync('git',['merge-base',sha,'HEAD'],{encoding:'utf8'}).trim();
 return proc===sha;
};
const paths=()=>execFileSync('git',['ls-files','-z']).toString('utf8')
 .split('\0').filter(Boolean).sort();
const evidencePaths=Object.freeze({
 phase24:'benchmarks/evidence/phase24/phase24-summary.json',
 phase26:'benchmarks/evidence/phase26/phase26-summary.json',
 phase27:'benchmarks/evidence/phase27/phase27-summary.json',
 phase28:'benchmarks/evidence/phase28/phase28-summary.json',
 phase29:'benchmarks/evidence/phase29/phase29-summary.json'
});
async function sourceRecord(){
 requireOk(isAncestor(INTEGRATION_MERGE),'Final Phase 73 source integration is not in current HEAD');
 requireOk(isAncestor(BASELINE_HEAD),'Phase 29 source baseline is not preserved');
 const evidence=await integrationAudit();
 const files=paths(),check=git('status','--porcelain');
 // Evidence workflows generate untracked outputs; only tracked modifications
 // affect source truth. Validate every tracked file against HEAD's Git object.
 requireOk(!git('diff','--name-only','HEAD').trim(),'Tracked working tree differs from HEAD');
 requireOk(!git('diff','--cached','--name-only').trim(),'Staged tracked source differs from HEAD');
 requireOk(files.length>500,'Incomplete integrated source tree');
 const fileHashes=[];
 for(const p of files){
  if(!p||p.startsWith('/')||p.split('/').includes('..'))throw Error('Invalid source path '+p);
  const bytes=await readFile(p);
  fileHashes.push({path:p,bytes:bytes.length,sha256:hash(bytes)});
 }
 const originalHashes={};
 for(const [key,p] of Object.entries(evidencePaths))originalHashes[key]=hash(await readFile(p));
 const policyRaw=await readFile('benchmarks/phase30/acceptance.json');
 verifyPolicy(JSON.parse(policyRaw)); // Original release acceptance policy remains frozen.
 const commit=git('rev-parse','HEAD');
 const manifest={
  format:'invention-lab/phase30-tracked-source-distribution/1',
  sourceCommit:commit,basePhase29Head:BASELINE_HEAD,
  shaAlgorithm:'SHA-256',files:fileHashes,
  softwareOnly:true,authenticatedHardwareMeasurements:0,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 };
 const decision={
  format:FORMAT,sourceCommit:commit,
  integrationMergeCommit:INTEGRATION_MERGE,
  immutableOriginalPhase30PolicySHA256:hash(policyRaw),
  originalMeasuredResearchInputs:originalHashes,
  reconciliationSourceCommit:evidence.head,
  phase3AndPhase72AncestorsVerified:evidence.bothDivergentHistoriesPreserved,
  restoredPhase3ExactOriginalBytes:Object.values(evidence.exactRestoredPhase3Files).every(x=>x.exact),
  originalBenchmarksPreserved:Object.values(evidence.baselineReferenceBenchmarks).every(x=>x.preserved),
  sourceFilesVerified:fileHashes.length,
  integrationStatus:'MERGED_DEVELOPMENT_SOURCE_ONLY',
  originalLiveOpenPRPreflightApplicable:false,
  humanUAT:'NOT_VERIFIED',
  independentSecurityReview:'NOT_VERIFIED',
  manufacturingReleaseAuthorized:false,
  productReleaseAuthorized:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null
 };
 const summary={
  format:'invention-lab/phase30-integrated-research-source-summary/1',
  sourceCommit:commit,
  researchSourceIntegrationVerified:true,
  integratedPR73MergeCommit:INTEGRATION_MERGE,
  trackedSourceCount:fileHashes.length,
  humanUAT:'NOT_VERIFIED',
  independentSecurityReview:'NOT_VERIFIED',
  realMatchedFanMeasurements:0,
  fabricatedALUDiesQualified:0,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null,
  productReleaseAuthorized:false,
  note:'PR73 is merged, but external review and matching hardware evidence are not verified here'
 };
 return {manifest,decision,summary};
}
export async function capture(){
 const r=await sourceRecord();
 await mkdir(dir,{recursive:true});
 for(const [key,name] of [['manifest','phase30-source-manifest.json'],['decision','phase30.json'],['summary','phase30-summary.json']])
  await writeFile(dir+name,JSON.stringify(r[key],null,2)+'\n');
 console.log('PH30 MAIN INTEGRATION CAPTURE PASS: source bytes and both histories preserved; production/physical NO-GO');
}
export async function strict(){
 const r=await sourceRecord();
 for(const [key,name] of [['manifest','phase30-source-manifest.json'],['decision','phase30.json'],['summary','phase30-summary.json']]){
  const stored=JSON.parse(await readFile(dir+name,'utf8'));
  requireOk(isDeepStrictEqual(stored,r[key]),'Postmerge Phase30 source evidence mismatch: '+name);
 }
 requireOk(r.decision.productReleaseAuthorized===false&&r.decision.realWorldBuildSuccessPercent===null,
  'False product/physical qualification detected');
 console.log('PH30 MAIN INTEGRATION STRICT PASS: independent original source/evidence rehash; no hardware GO');
}
const arg=process.argv[2];
if(arg==='--capture')await capture();
else if(arg==='--strict')await strict();
else throw Error('Usage: integration-postmerge-phase30.mjs --capture|--strict');
