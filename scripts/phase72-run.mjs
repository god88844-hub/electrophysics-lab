import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {reviewResearchCandidate,verifyFinalPolicy} from '../js/evidence/phase72-final-audit.js';
const raw=await readFile('benchmarks/phase72/final-policy.json'),policy=JSON.parse(raw);
verifyFinalPolicy(policy);
const review=await reviewResearchCandidate(policy);
if(review.decision!=='DRAFT_RESEARCH_SOURCE_CANDIDATE_ONLY'||
   review.manufacturingReleaseAuthorized||review.physicalQualification.productionBuildSuccessProbability!==null)
 throw Error('Unsupported physical production release claim');
const artifact={format:'invention-lab/phase72-candidate-source-evidence/1',
 sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 policySHA256:createHash('sha256').update(raw).digest('hex'),
 review,softwareReleaseStatus:'UNMERGED_DRAFT_REVIEW_REQUIRED',
 hardwareReleaseStatus:'UNQUALIFIED_NO_GO'};
await mkdir('benchmarks/evidence/phase72',{recursive:true});
await writeFile('benchmarks/evidence/phase72/phase72.json',JSON.stringify(artifact,null,2)+'\n');
console.log('PH72 SOURCE CANDIDATE PASS: 6 application cases, archive digests; real production NO-GO');