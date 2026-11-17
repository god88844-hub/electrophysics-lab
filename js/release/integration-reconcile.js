// Source integration audit: verify the previously split Phase 3 and Phase 4–72
// histories are BOTH ancestors without claiming independent physical validation.
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const MAIN='1a0171801684868a16a2f88a817c4c1e2a014697';
export const PHASE3='fee4cad85bdea46189c7008cb0dda30efd56bf01';
export const PHASE72='a2b9b30d1aaa3f619b6983999482a1bb1497193b';
export const RESTORED=Object.freeze({
 'docs/PHASE3-ACCEPTANCE.json':'c70290fdf51e3b994d3d7cd591f45ab9005911fc',
 'docs/PHASE3-INTEGRITY-BOUNDARIES.md':'63d49c089b3339bf02da0c04d3ebbdac43c87b59',
 'docs/PHASE3-PLAN.md':'dde6312cbc3aa696b6c2af396eb175887825cd7f',
 'tests/phase3-integrity.test.mjs':'681c93d415785bd6a5466b1b902e2266fd311630'
});
const MODEL=[
 'js/measure/calibration.js','js/measure/dataset.js','js/measure/envelope.js',
 'js/measure/experiments.js','js/measure/index.js','js/measure/quality.js',
 'js/measure/split.js','js/measure/uq.js','js/measure/validation.js',
 'tests/measure.test.mjs'
];
const EVIDENCE=[
 'benchmarks/evidence/REPORT.md',
 'benchmarks/evidence/evidence-summary.json',
 'benchmarks/evidence/latest-ngspice.json',
 'benchmarks/evidence/latest-ngspice.md',
 'benchmarks/evidence/latest-quantum.json',
 'benchmarks/evidence/latest-quantum.md'
];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const blob=(ref,path)=>git('rev-parse',ref+':'+path);
const ancestor=sha=>{try{execFileSync('git',['merge-base','--is-ancestor',sha,'HEAD'],{stdio:'ignore'});return true}catch{return false}};
const sha=s=>createHash('sha256').update(s).digest('hex');
export async function integrationAudit(){
 const ancestry=Object.fromEntries([MAIN,PHASE3,PHASE72].map(x=>[x,ancestor(x)]));
 if(Object.values(ancestry).some(x=>!x))throw Error('Integration head is missing original commit history');
 const original=Object.fromEntries(Object.entries(RESTORED).map(([p,expected])=>[p,{
  expected,actual:blob('HEAD',p),exact:blob('HEAD',p)===expected
 }]));
 if(Object.values(original).some(o=>!o.exact))throw Error('Restored Phase 3 provenance fails exact Git blob check');
 const measurement=Object.fromEntries(MODEL.map(p=>[p,{
  p3:blob(PHASE3,p),head:blob('HEAD',p),unchanged:blob(PHASE3,p)===blob('HEAD',p)
 }]));
 if(Object.values(measurement).some(o=>!o.unchanged))throw Error('Original Phase 3 measurement engine changed during integration');
 const references=Object.fromEntries(EVIDENCE.map(p=>[p,{
  main:blob(MAIN,p),head:blob('HEAD',p),preserved:blob(MAIN,p)===blob('HEAD',p)
 }]));
 if(Object.values(references).some(o=>!o.preserved))throw Error('Original baseline research benchmark evidence was overwritten');
 const mainPaths=git('ls-tree','-r','--name-only',MAIN).split('\n').filter(Boolean);
 const headPaths=new Set(git('ls-tree','-r','--name-only','HEAD').split('\n').filter(Boolean));
 const missingMainPaths=mainPaths.filter(p=>!headPaths.has(p));
 if(missingMainPaths.length)throw Error('Tracked main paths removed: '+missingMainPaths.join(','));
 const phase72Paths=git('ls-tree','-r','--name-only',PHASE72).split('\n').filter(Boolean);
 const missing72=phase72Paths.filter(p=>!headPaths.has(p));
 if(missing72.length)throw Error('Phase 72 source paths lost: '+missing72.join(','));
 const policyBytes=await readFile('docs/PHASE3-ACCEPTANCE.json');
 return {
  format:'invention-lab/read-only-reconciled-integration-audit/1',
  head:git('rev-parse','HEAD'),mainBaseline:MAIN,
  separatePhase3Parent:PHASE3,phase72SourceParent:PHASE72,
  bothDivergentHistoriesPreserved:true,
  ancestorChecks:ancestry,
  exactRestoredPhase3Files:original,
  unmodifiedPhase3ScientificModules:measurement,
  baselineReferenceBenchmarks:references,
  missingMainPaths,missingPhase72Paths:missing72,
  originalAcceptanceSHA256:sha(policyBytes),
  totalTrackedFiles:headPaths.size,
  mainBranchChangedByAudit:false,
  completeMergingAllOldPRs:false,
  independentScientificReview:'NOT_PERFORMED',
  physicalValidation:'none',realWorldBuildSuccessPercent:null
 };
}
